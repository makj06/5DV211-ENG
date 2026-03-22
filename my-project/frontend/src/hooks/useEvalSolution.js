import { useCallback, useEffect, useRef, useState } from "react";
import { fetchJsonOrText, toErrorMessage } from "../utils/http";

const EVAL_URL = "/api/eval/";

function normalizeTopic(t) {
    return String(t ?? "").trim().toLowerCase();
}

function coerceString(x) {
    return typeof x === "string" ? x : x == null ? "" : String(x);
}

export function useEvalSolution({
                                    solution,
                                    task,
                                    topic,
                                    hasFailed,
                                    hasChatted,
                                    language,
                                    onLoaded,
                                    onEvaluated,
                                    auto = false,
                                } = {}) {
    const [evalResult, setEvalResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const reqIdRef = useRef(0);

    const onLoadedRef = useRef(onLoaded);
    useEffect(() => {
        onLoadedRef.current = onLoaded;
    }, [onLoaded]);

    const onEvaluatedRef = useRef(onEvaluated);
    useEffect(() => {
        onEvaluatedRef.current = onEvaluated;
    }, [onEvaluated]);

    const evaluate = useCallback(async () => {
        const tpc = normalizeTopic(topic);
        const sol = coerceString(solution).trim();
        const tsk = coerceString(task).trim();

        if (!tpc || !sol || !tsk) return null;
        if (typeof hasFailed !== "boolean" || typeof hasChatted !== "boolean") return null;

        const myReqId = ++reqIdRef.current;

        setLoading(true);
        setError("");
        setEvalResult(null);

        try {
            const { res, data } = await fetchJsonOrText(EVAL_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    solution: sol,
                    task: tsk,
                    topic: tpc,
                    has_failed: hasFailed,
                    has_chatted: hasChatted,
                    language: "english",
                }),
            });

            if (myReqId !== reqIdRef.current) return null;

            if (!res.ok) {
                setError(toErrorMessage({ res, data, fallback: "Evaluation failed" }));
                return null;
            }

            const obj = data && typeof data === "object" ? data : null;
            const correct = obj ? Boolean(obj.correct) : false;
            const responseText = obj
                ? coerceString(obj.response ?? obj.explanation ?? obj.feedback ?? "")
                : "";

            const result = { correct, response: responseText };

            setEvalResult(result);
            onLoadedRef.current?.({ ...result, raw: data });
            await onEvaluatedRef.current?.({ ...result, raw: data });

            return result;
        } catch {
            if (myReqId !== reqIdRef.current) return null;
            setError("Network error: could not reach server");
            return null;
        } finally {
            if (myReqId === reqIdRef.current) setLoading(false);
        }
    }, [solution, task, topic, hasFailed, hasChatted, language]);

    useEffect(() => {
        if (!auto) return;
        evaluate();
    }, [auto, evaluate]);

    return { evalResult, loading, error, evaluate };
}