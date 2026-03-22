import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchJsonOrText, toErrorMessage } from "../utils/http";

const USER_MODEL_URL = "/api/user/";
const LS_KEY = "user";

function readUserFromLocalStorage() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function normalizeUserModel(data, fallbackUser = null) {
    if (!data || typeof data !== "object") return null;

    return {
        ...fallbackUser,
        ...data,
    };
}

export function useUserModel({ enabled = true } = {}) {
    const [userModel, setUserModel] = useState(() => readUserFromLocalStorage());
    const [userModelLoading, setUserModelLoading] = useState(false);
    const [userModelError, setUserModelError] = useState("");

    const abortRef = useRef(null);

    const hasAccessToken = !!localStorage.getItem("access");
    const canFetch = enabled && hasAccessToken;

    const resetUserModel = useCallback(() => {
        abortRef.current?.abort?.();
        abortRef.current = null;
        setUserModel(null);
        setUserModelError("");
        setUserModelLoading(false);
        localStorage.removeItem(LS_KEY);
    }, []);

    const fetchUserModel = useCallback(async () => {
        if (!canFetch) return null;

        abortRef.current?.abort?.();
        const ac = new AbortController();
        abortRef.current = ac;

        setUserModelLoading(true);
        setUserModelError("");

        try {
            const fallbackUser = readUserFromLocalStorage();

            const { res, data } = await fetchJsonOrText(USER_MODEL_URL, {
                method: "GET",
                headers: { Accept: "application/json" },
                signal: ac.signal,
            });

            if (!res.ok) {
                setUserModelError(
                    toErrorMessage({ res, data, fallback: "Failed to load user" })
                );

                if (res.status === 401) {
                    localStorage.removeItem("access");
                    localStorage.removeItem("refresh");
                    localStorage.removeItem(LS_KEY);
                    setUserModel(null);
                }

                return null;
            }

            const fresh =
                typeof data === "string" ? null : normalizeUserModel(data, fallbackUser);

            if (fresh) {
                setUserModel(fresh);
                localStorage.setItem(LS_KEY, JSON.stringify(fresh));
            }

            return fresh;
        } catch (e) {
            if (e?.name === "AbortError") return null;
            setUserModelError("Network error: could not reach server");
            return null;
        } finally {
            if (abortRef.current === ac) setUserModelLoading(false);
        }
    }, [canFetch]);

    useEffect(() => {
        if (!canFetch) return;
        fetchUserModel();
    }, [canFetch, fetchUserModel]);

    return useMemo(
        () => ({
            userModel,
            userModelLoading,
            userModelError,
            fetchUserModel,
            resetUserModel,
        }),
        [userModel, userModelLoading, userModelError, fetchUserModel, resetUserModel]
    );
}