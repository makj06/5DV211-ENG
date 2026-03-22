import React from "react";
import { Link } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import { useLoginForm } from "../hooks/useLoginForm";
import "../styles/pages/AuthPages.css";

export default function LoginPage() {
    const {
        name,
        setName,
        password,
        setPassword,
        error,
        loading,
        handleSubmit,
    } = useLoginForm();

    return (
        <AuthShell
            title="Math Mastery"
            subtitle="Welcome back — log in to continue"
            cardTitle="Login"
        >
            <form onSubmit={handleSubmit} className="auth-form">
                {error && <div className="auth-error">{error}</div>}

                <label className="auth-label">
                    Name
                    <input
                        className="auth-input"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Honza"
                        autoComplete="username"
                        required
                        disabled={loading}
                    />
                </label>

                <label className="auth-label">
                    Password
                    <input
                        className="auth-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                        disabled={loading}
                    />
                </label>

                <button
                    className="auth-btn primary"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <div className="auth-footer">
                    <span>Don’t have an account?</span>{" "}
                    <Link className="auth-link" to="/register">
                        Register
                    </Link>
                </div>
            </form>
        </AuthShell>
    );
}