const BASE_URL = import.meta.env.VITE_API_URL || "";

function getAccessToken() {
    return localStorage.getItem("access") || "";
}

function getRefreshToken() {
    return localStorage.getItem("refresh") || "";
}

function setTokens({ access, refresh }) {
    if (access) {
        localStorage.setItem("access", access);
    }
    if (refresh) {
        localStorage.setItem("refresh", refresh);
    }
}

export function clearTokens() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
}

async function refreshAccessToken() {
    const refresh = getRefreshToken();

    if (!refresh) {
        clearTokens();
        throw new Error("Missing refresh token");
    }

    const res = await fetch(`${BASE_URL}/token/refresh/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh }),
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await res.json()
        : await res.text();

    if (!res.ok) {
        clearTokens();
        throw new Error(
            typeof data === "string"
                ? `Refresh failed (${res.status})`
                : data?.detail || data?.error || `Refresh failed (${res.status})`
        );
    }

    setTokens({
        access: data.access,
        refresh: data.refresh || refresh,
    });

    return data.access;
}

export async function fetchJsonOrText(url, options = {}, retry = true) {
    const finalUrl = url.startsWith("/") ? `${BASE_URL}${url}` : url;
    const method = (options.method || "GET").toUpperCase();

    const headers = {
        ...(options.headers || {}),
    };

    const access = getAccessToken();
    if (access) {
        headers["Authorization"] = `Bearer ${access}`;
    }

    const res = await fetch(finalUrl, {
        method,
        headers,
        body: options.body,
        signal: options.signal,
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await res.json()
        : await res.text();

    if (res.status === 401 && retry) {
        try {
            const newAccess = await refreshAccessToken();

            const retryHeaders = {
                ...(options.headers || {}),
                "Authorization": `Bearer ${newAccess}`,
            };

            const retryRes = await fetch(finalUrl, {
                method,
                headers: retryHeaders,
                body: options.body,
                signal: options.signal,
            });

            const retryContentType = retryRes.headers.get("content-type") || "";
            const retryData = retryContentType.includes("application/json")
                ? await retryRes.json()
                : await retryRes.text();

            return { res: retryRes, data: retryData };
        } catch (err) {
            clearTokens();
            return {
                res,
                data: {
                    error: "Session expired. Please log in again.",
                },
            };
        }
    }

    return { res, data };
}

export function toErrorMessage({ res, data, fallback }) {
    if (typeof data === "string") {
        return `Server error (${res.status})`;
    }
    return data?.error || data?.detail || `${fallback} (${res.status})`;
}