import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchJsonOrText } from "../utils/http";

function getLoginErrorMessage(data) {
    if (typeof data === "object" && data?.error) {
        return data.error;
    }

    if (typeof data === "string" && data.trim()) {
        return data;
    }

    return "Invalid username or password.";
}

export function useLoginForm() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();

            if (loading) return;

            setError(null);
            setLoading(true);

            const username = name.trim();

            try {
                const { res, data } = await fetchJsonOrText("/api/login/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username,
                        password,
                    }),
                });

                if (!res.ok) {
                    setError(getLoginErrorMessage(data));
                    return;
                }

                localStorage.setItem("access", data.access);
                localStorage.setItem("refresh", data.refresh);

                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        username: data.username,
                        userId: data.userId,
                    })
                );

                navigate("/frontPage");
            } catch (err) {
                console.error("Login request failed:", err);
                setError("Cannot connect to server.");
            } finally {
                setLoading(false);
            }
        },
        [loading, name, password, navigate]
    );

    return {
        name,
        setName,
        password,
        setPassword,
        error,
        loading,
        handleSubmit,
    };
}