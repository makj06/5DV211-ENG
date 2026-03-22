import React from "react";
import Pill from "../ui/Pill";

export default function Topbar({ onDashboard, pillTone, topicLabel }) {
    return (
        <div className="solverTopbar">
            <div className="topLeft">
                <button
                    type="button"
                    className="backBtn"
                    onClick={onDashboard}
                    aria-label="Back to dashboard"
                >
          <span className="backIcon" aria-hidden="true">
            ←
          </span>
                    <span className="backText">Dashboard</span>
                </button>

                <div className="brand">
          <span className="brandIcon" aria-hidden="true">
            🏆
          </span>
                    <span className="brandTitle">Math Mastery</span>
                </div>
            </div>

            <div className="topActions">
                <Pill tone={pillTone}>{topicLabel}</Pill>
            </div>
        </div>
    );
}