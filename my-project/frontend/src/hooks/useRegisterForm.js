import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchJsonOrText } from "../utils/http";

function getSignupErrorMessage(data) {
    if (typeof data === "object" && data?.error) {
        return data.error;
    }

    if (typeof data === "string" && data.trim()) {
        return data;
    }

    return "Signup failed.";
}

export function useRegisterForm() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();

            if (loading) return;

            setError(null);
            setLoading(true);

            const username = name.trim();

            if (!username) {
                setError("Username is required.");
                setLoading(false);
                return;
            }

            if (password.length < 4) {
                setError("Password must be at least 4 characters.");
                setLoading(false);
                return;
            }

            if (password !== password2) {
                setError("Passwords do not match.");
                setLoading(false);
                return;
            }

            try {
                const { res, data } = await fetchJsonOrText("/api/signup/", {
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
                    setError(getSignupErrorMessage(data));
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
                console.error("Signup request failed:", err);
                setError("Could not reach server.");
            } finally {
                setLoading(false);
            }
        },
        [loading, name, password, password2, navigate]
    );

    return {
        name,
        setName,
        password,
        setPassword,
        password2,
        setPassword2,
        error,
        loading,
        handleSubmit,
    };
}