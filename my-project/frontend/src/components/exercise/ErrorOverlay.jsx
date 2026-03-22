import React from "react";

export default function ErrorOverlay({ error, onRetry, onDashboard }) {
    return (
        <div className="loadingOverlay" role="alert">
            <div className="loadingCard glass">
                <div className="loadingTitle">Could not load exercise</div>
                <div className="loadingSub">{error}</div>
                <div className="loadingActions">
                    <button type="button" className="submitBtn" onClick={onRetry}>
                        Retry
                    </button>
                    <button type="button" className="backBtn" onClick={onDashboard}>
                        ← Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}