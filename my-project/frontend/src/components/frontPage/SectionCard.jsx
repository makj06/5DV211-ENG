import React from "react";

function statusMeta(status) {
    switch (status) {
        case "mastered":
            return {
                label: "Mastered",
                pill: "pill--mastered",
                dot: "dot--green",
                locked: false,
            };
        case "progress":
            return {
                label: "In Progress",
                pill: "pill--progress",
                dot: "dot--amber",
                locked: false,
            };
        case "locked":
            return {
                label: "Locked",
                pill: "pill--locked",
                dot: "dot--gray",
                locked: true,
            };
        case "not_started":
        default:
            return {
                label: "Not Started",
                pill: "pill--notstarted",
                dot: "dot--gray",
                locked: false,
            };
    }
}

export default function SectionCard({
                                        title,
                                        gradient,
                                        completed,
                                        percent,
                                        topics = [],
                                        onTopicClick,
                                    }) {
    const rows = topics.map((topic) => {
        const meta = statusMeta(topic.status);

        return {
            key: topic.key,
            value: topic.key,
            label: topic.label,
            statusText: meta.label,
            pillClass: meta.pill,
            dotClass: meta.dot,
            disabled: meta.locked,
        };
    });

    return (
        <div className="mmCard">
            <div className="mmHeader" style={{ background: gradient }}>
                <div className="mmHeaderTop">
                    <div>
                        <div className="mmTitle">{title}</div>
                        <div className="mmSub">{completed}</div>
                    </div>

                    <div className="mmPercent" style={{ "--p": percent }}>
                        {percent}%
                    </div>
                </div>
            </div>

            <div className="mmPanel">
                {rows.map((row) => (
                    <div
                        className={`mmRow ${row.disabled ? "mmRow--disabled" : ""}`}
                        key={row.key}
                    >
                        <div className="mmRowLeft">
                            <span className={`mmDot ${row.dotClass}`} aria-hidden="true" />
                            <span className="mmRowLabel" title={row.label}>
                {row.label}
              </span>
                        </div>

                        <div className="mmRowRight">
              <span className={`mmPill ${row.pillClass}`}>
                {row.statusText}
              </span>

                            <button
                                type="button"
                                className={`mmArrow ${row.disabled ? "mmArrow--disabled" : ""}`}
                                onClick={() => {
                                    if (!row.disabled) onTopicClick?.(row.value);
                                }}
                                disabled={row.disabled}
                                aria-label={
                                    row.disabled ? `${row.label} is locked` : `Open ${row.label}`
                                }
                            >
                                ›
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}