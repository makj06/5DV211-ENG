import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUserModel } from "./useUserModel";
import { DASHBOARD_SECTIONS } from "../config/dashboardSections";

function getTopicStatus(value, topicKey, startedTopics) {
    const level = Number(value ?? 0);

    if (level >= 5) return "mastered";
    if (level >= 1) return "progress";
    if (startedTopics.has(topicKey)) return "progress";
    return "not_started";
}

function computePercentage(knowledge, topicKeys) {
    if (!topicKeys.length) return 0;

    const mastered = topicKeys.filter((key) => (knowledge[key] ?? 0) >= 5).length;
    return Math.round((mastered / topicKeys.length) * 100);
}

function computeCompleted(knowledge, topicKeys) {
    if (!topicKeys.length) return "0 / 0 Topics Completed";

    const mastered = topicKeys.filter((key) => (knowledge[key] ?? 0) >= 5).length;
    return `${mastered} / ${topicKeys.length} Topics Completed`;
}

export function useFrontPageDashboard() {
    const navigate = useNavigate();

    const {
        userModel,
        userModelLoading,
        userModelError,
        resetUserModel,
    } = useUserModel({ enabled: true });

    useEffect(() => {
        if (!userModelLoading && !userModel && !userModelError) {
            navigate("/");
        }
    }, [userModelLoading, userModel, userModelError, navigate]);

    const handleLogout = useCallback(() => {
        resetUserModel();

        try {
            localStorage.removeItem("user");
        } catch {
            // ignore localStorage failures
        }

        navigate("/");
    }, [navigate, resetUserModel]);

    const goToExercise = useCallback(
        (sectionKey, topicKey) => {
            navigate(`/exercise/${sectionKey}/${topicKey}`);
        },
        [navigate]
    );

    const dashboardSections = useMemo(() => {
        const knowledge = userModel?.knowledge ?? {};
        const startedTopics = new Set(userModel?.topics_started ?? []);

        return DASHBOARD_SECTIONS.map((section) => {
            const topicKeys = section.topics.map((topic) => topic.key);

            return {
                key: section.key,
                title: section.title,
                gradient: section.gradient,
                completed: computeCompleted(knowledge, topicKeys),
                percent: computePercentage(knowledge, topicKeys),
                topics: section.topics.map((topic) => ({
                    key: topic.key,
                    label: topic.label,
                    status: getTopicStatus(knowledge[topic.key], topic.key, startedTopics),
                })),
            };
        });
    }, [userModel]);

    const mastery = useMemo(() => {
        const progress = Number(userModel?.mastery_progress ?? 0);

        return {
            progress,
            xpPercent: Math.min(100, Math.max(0, Math.round(progress * 100))),
            level: userModel?.mastery_lvl ?? 0,
        };
    }, [userModel]);

    return {
        userModel,
        userModelLoading,
        userModelError,
        dashboardSections,
        mastery,
        handleLogout,
        goToExercise,
    };
}