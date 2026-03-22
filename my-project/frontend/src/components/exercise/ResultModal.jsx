import React from "react";

export default function ResultModal({
                                        open,
                                        evalResult,
                                        modalView,
                                        wrongTries,
                                        loading,
                                        evalLoading,
                                        onRetry,
                                        onNext,
                                        onDashboard,
                                        onRegenerate,
                                    }) {
    if (!open || !evalResult || !modalView) return null;

    return (
        <div
            className="resultOverlay"
            role="dialog"
            aria-modal="true"
            aria-label={modalView.headline}
        >
            <div
                className={`resultModal ${modalView.toneClass}`}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="resultTop">
                    <div className="resultIcon" aria-hidden="true">
                        {modalView.icon}
                    </div>

                    <div className="resultTopText">
                        <div className="resultTitle">{modalView.headline}</div>
                        <div className="resultSub">{modalView.sub}</div>
                    </div>
                </div>

                <div className="resultBody">
                    <p className="resultMessage">{modalView.body}</p>
                </div>

                <div className="resultActions">
                    {!modalView.correct ? (
                        <>
                            <div className="resultActionsRow">
                                <button className="btnPrimary" onClick={onRetry} type="button">
                                    Try again
                                </button>

                                <button className="btnGhost" onClick={onDashboard} type="button">
                                    Back to Dashboard
                                </button>
                            </div>

                            {wrongTries >= 3 && (
                                <button
                                    className="btnWarn"
                                    onClick={onRegenerate}
                                    type="button"
                                >
                                    Regenerate question
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <button
                                className="btnPrimary"
                                onClick={onNext}
                                disabled={loading || evalLoading}
                                type="button"
                            >
                                Next question
                            </button>

                            <button className="btnGhost" onClick={onDashboard} type="button">
                                Back to Dashboard
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}