import { useCallback, useEffect, useRef, useState } from "react";
import { fetchJsonOrText, toErrorMessage } from "../utils/http";

const TASK_URL = "/api/task/";
const LS_PREFIX = "exercise_cache";

function cacheKey(username, topic) {
    return `${LS_PREFIX}:${username}:${String(topic).toLowerCase()}`;
}

function safeJsonParse(str) {
    try {
        return JSON.parse(str);
    } catch {
        return null;
    }
}

function normalizeTopic(t) {
    return String(t ?? "").trim().toLowerCase();
}

function extractTaskText(data) {
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
        if (typeof data.question === "string") return data.question;
        if (typeof data.task === "string") return data.task;
        if (typeof data.text === "string") return data.text;
    }
    return "";
}

export function useExercise({ name, topic, language, onLoaded } = {}) {
    const [taskText, setTaskText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const reqIdRef = useRef(0);

    const onLoadedRef = useRef(onLoaded);
    useEffect(() => {
        onLoadedRef.current = onLoaded;
    }, [onLoaded]);

    const normalizedTopic = normalizeTopic(topic);

    const readCached = useCallback(() => {
        if (!name || !normalizedTopic) return "";
        const raw = localStorage.getItem(cacheKey(name, normalizedTopic));
        if (!raw) return "";
        const cached = safeJsonParse(raw);
        if (!cached || typeof cached.taskText !== "string") return "";
        return cached.taskText;
    }, [name, normalizedTopic]);

    const writeCached = useCallback(
        (text) => {
            if (!name || !normalizedTopic) return;
            const payload = { taskText: text, savedAt: Date.now() };
            localStorage.setItem(cacheKey(name, normalizedTopic), JSON.stringify(payload));
        },
        [name, normalizedTopic]
    );

    const clearCachedExercise = useCallback(() => {
        if (!name || !normalizedTopic) return;
        localStorage.removeItem(cacheKey(name, normalizedTopic));
    }, [name, normalizedTopic]);

    const loadExercise = useCallback(
        async ({ force = false } = {}) => {
            if (!normalizedTopic) {
                setTaskText("");
                setLoading(false);
                setError("Missing topic");
                return;
            }

            if (!force) {
                const cachedText = readCached();
                if (cachedText) {
                    setError("");
                    setLoading(false);
                    setTaskText(cachedText);
                    onLoadedRef.current?.();
                    return;
                }
            }

            const myReqId = ++reqIdRef.current;

            setLoading(true);
            setError("");
            setTaskText("");

            try {
                const { res, data } = await fetchJsonOrText(TASK_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    body: JSON.stringify({
                        topic: normalizedTopic,
                        language: "english",
                    }),
                });

                if (myReqId !== reqIdRef.current) return;

                if (!res.ok) {
                    setError(toErrorMessage({ res, data, fallback: "Task load failed" }));
                    return;
                }

                const text = extractTaskText(data);
                const finalText = text?.trim() ? text : "No task returned.";

                setTaskText(finalText);
                writeCached(finalText);
                onLoadedRef.current?.();
            } catch {
                if (myReqId !== reqIdRef.current) return;
                setError("Network error: could not reach server");
            } finally {
                if (myReqId === reqIdRef.current) setLoading(false);
            }
        },
        [normalizedTopic, language, readCached, writeCached]
    );

    useEffect(() => {
        loadExercise();
    }, [loadExercise]);

    return { taskText, loading, error, loadExercise, clearCachedExercise };
}