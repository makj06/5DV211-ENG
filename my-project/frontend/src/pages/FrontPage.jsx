import React from "react";
import SectionCard from "../components/frontPage/SectionCard.jsx";
import DashboardTopbar from "../components/frontPage/DashboardTopbar.jsx";
import { useFrontPageDashboard } from "../hooks/useFrontPageDashboard";
import "../styles/pages/FrontPage.css";

export default function FrontPage() {
    const {
        userModel,
        userModelLoading,
        userModelError,
        dashboardSections,
        mastery,
        handleLogout,
        goToExercise,
    } = useFrontPageDashboard();

    if (userModelLoading && !userModel) {
        return <div className="container">Loading...</div>;
    }

    if (userModelError && !userModel) {
        return <div className="container">Error: {userModelError}</div>;
    }

    if (!userModel) {
        return null;
    }

    return (
        <div className="container">
            <div className="dashboardScale">
                <DashboardTopbar
                    username={userModel.username}
                    onLogout={handleLogout}
                />

                <div className="section-stack">
                    <div className="cards">
                        {dashboardSections.map((section) => (
                            <SectionCard
                                key={section.key}
                                title={section.title}
                                gradient={section.gradient}
                                completed={section.completed}
                                percent={section.percent}
                                topics={section.topics}
                                onTopicClick={(topicKey) => goToExercise(section.key, topicKey)}
                            />
                        ))}
                    </div>

                    <div className="masteryCard">
                        <div className="masteryLeft">
                            <div className="masteryTitleRow">
                                <div
                                    className="masteryIcon masteryIcon--tooltip"
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`XP: ${mastery.progress}`}
                                >
                                    <span aria-hidden="true">⭐</span>

                                    <div className="xpTooltip" role="tooltip">
                                        <div className="xpTooltipTitle">XP</div>
                                        <div className="xpTooltipValue">{mastery.progress}</div>
                                    </div>
                                </div>

                                <h2 className="masteryTitle">Mastery Challenge</h2>
                            </div>

                            <p className="masteryDesc">
                                Solve harder mixed questions from already mastered topics. Earn XP
                                and level up!
                            </p>

                            <button
                                type="button"
                                className="masteryBtn"
                                onClick={() => goToExercise("mastery", "mastery")}
                            >
                                🚀 Start Challenge
                            </button>
                        </div>

                        <div className="masteryRight" aria-label="Level">
                            <div className="levelRing" style={{ "--p": mastery.xpPercent }}>
                                <div className="levelCircle">
                                    <div className="levelTop">LEVEL</div>
                                    <div className="levelNum">{mastery.level}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}