import { useEffect, useMemo, useState, useCallback } from "react";

const CORRECT_MESSAGES = [
    "Ready for the next one?",
    "Nice work — keep it going!",
    "Great job! Let’s try another.",
    "Perfect! Want another challenge?",
    "You nailed it!",
    "Awesome — onto the next problem!",
    "Correct! Keep the momentum.",
    "Great thinking!",
    "Nice solve — next one?",
    "Well done! Let’s continue.",
];

const WRONG_MESSAGES = [
    "You’re close — try a different approach.",
    "Not quite — check your calculation.",
    "Almost there — try again.",
    "Give it another shot.",
    "Hmm, something’s off — recheck your steps.",
    "Take another look and try again.",
    "Not this time — keep going!",
    "Try breaking the problem into steps.",
    "You’re getting there — try once more.",
    "Close! Adjust your reasoning.",
];

function randomMessage(list) {
    return list[Math.floor(Math.random() * list.length)];
}

export function useResultModal(evalResult) {
    const [resultOpen, setResultOpen] = useState(false);
    const [wrongTries, setWrongTries] = useState(0);

    useEffect(() => {
        if (!evalResult) return;

        setResultOpen(true);

        if (!evalResult.correct) {
            setWrongTries((prev) => prev + 1);
        }
    }, [evalResult]);

    const resetWrongTries = useCallback(() => {
        setWrongTries(0);
    }, []);

    const modalView = useMemo(() => {
        if (!evalResult) return null;

        const correct = !!evalResult.correct;
        const raw = (evalResult.response ?? "").trim();

        return {
            correct,
            icon: correct ? "🎉" : "🧠",
            headline: correct ? "Correct!" : "Try again!",
            sub: correct
                ? randomMessage(CORRECT_MESSAGES)
                : randomMessage(WRONG_MESSAGES),
            body:
                raw.length > 0
                    ? raw
                    : correct
                        ? "You got it!"
                        : "Let’s give it another try.",
            toneClass: correct ? "resultModal--good" : "resultModal--bad",
        };
    }, [evalResult]);

    return {
        resultOpen,
        setResultOpen,
        wrongTries,
        resetWrongTries,
        modalView,
    };
}