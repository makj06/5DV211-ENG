import React from "react";
import { Link } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import { useRegisterForm } from "../hooks/useRegisterForm";
import "../styles/pages/AuthPages.css";

export default function RegisterPage() {
    const {
        name,
        setName,
        password,
        setPassword,
        password2,
        setPassword2,
        error,
        loading,
        handleSubmit,
    } = useRegisterForm();

    return (
        <AuthShell
            title="Math Mastery"
            subtitle="Create your account to get started"
            cardTitle="Register"
        >
            <form onSubmit={handleSubmit} className="auth-form">
                {error && <div className="auth-error">{error}</div>}

                <label className="auth-label">
                    Username
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
                        autoComplete="new-password"
                        required
                        disabled={loading}
                    />
                </label>

                <label className="auth-label">
                    Confirm password
                    <input
                        className="auth-input"
                        type="password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        disabled={loading}
                    />
                </label>

                <button
                    className="auth-btn primary"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Creating account..." : "Create account"}
                </button>

                <div className="auth-footer">
                    <span>Already have an account?</span>{" "}
                    <Link className="auth-link" to="/">
                        Login
                    </Link>
                </div>
            </form>
        </AuthShell>
    );
}