import React from "react";

export default function AuthShell({ title, subtitle, cardTitle, children }) {
    return (
        <div className="auth-page">
            <div className="auth-shell">
                <div className="auth-brand">
                    <div className="auth-logo">🏆</div>
                    <div>
                        <div className="auth-title">{title}</div>
                        <div className="auth-subtitle">{subtitle}</div>
                    </div>
                </div>

                <div className="auth-card">
                    <div className="auth-card-header">
                        <div className="auth-card-title">{cardTitle}</div>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}