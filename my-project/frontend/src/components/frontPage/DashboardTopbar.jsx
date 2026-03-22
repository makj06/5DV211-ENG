import React from "react";

export default function DashboardTopbar({ username, onLogout }) {
    return (
        <div className="topbar">
            <div className="title">🏆 Math Mastery</div>

            <div className="topbar-right">
                <div className="accountChip" aria-label="Account">
                    <div className="accountChipName" title={username}>
                        {username}
                    </div>

                    <div className="accountChipDivider" aria-hidden="true" />

                    <button
                        type="button"
                        className="accountChipLogout"
                        onClick={onLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}