import React from "react";

export default function LoadingOverlay({ title = "Loading exercise…" }) {
    return (
        <div className="loadingOverlay" role="status" aria-live="polite">
            <div className="loadingCard glass">
                <div className="loadingTitle">{title}</div>
                <div className="progressWrap" aria-hidden="true">
                    <div className="progressBar" />
                </div>
            </div>
        </div>
    );
}