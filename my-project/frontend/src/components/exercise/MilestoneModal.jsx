import React from "react";

export default function MilestoneModal({
                                           open,
                                           topicLabel,
                                           onContinue,
                                           onDashboard,
                                       }) {
    if (!open) return null;

    return (
        <div
            className="resultOverlay"
            role="dialog"
            aria-modal="true"
            aria-label="Topic mastery reached"
        >
            <div
                className="resultModal resultModal--good"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="resultTop">
                    <div className="resultIcon" aria-hidden="true">
                        🏆
                    </div>

                    <div className="resultTopText">
                        <div className="resultTitle">Highest knowledge level reached!</div>
                        <div className="resultSub">
                            You reached highest knowledge level in {topicLabel}.
                        </div>
                    </div>
                </div>

                <div className="resultBody">
                    <p className="resultMessage">
                        Great work. You have just completed this topic at the highest
                        knowledge level.
                    </p>
                </div>

                <div className="resultActions">
                    <button className="btnPrimary" onClick={onContinue} type="button">
                        Continue
                    </button>

                    <button className="btnGhost" onClick={onDashboard} type="button">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}