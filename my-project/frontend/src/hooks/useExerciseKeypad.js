import { useCallback, useMemo } from "react";

const KEY_VALUE = {
    "+": "+",
    "−": "-",
    "×": "*",
    "÷": "/",
    "/": "/",
    "=": "=",
    "≠": "!=",
    "<": "<",
    ">": ">",
    "≤": "<=",
    "≥": ">=",
    "(": "(",
    ")": ")",
    ".": ".",
    ",": ",",
    "^": "^",
    "°": "°",
    "²": "²",
    "³": "³",
    "π": "π",
};

const BASE = ["+", "−", "×", "÷", "=", "(", ")", "/", ".", ",", "<", ">"];

const TOPIC_LABELS = {
    numbers: BASE,

    addition: BASE,
    subtraction: BASE,
    multiplication: BASE,
    division: BASE,
    fractions: BASE,

    equality: ["=", "≠", "<", ">", "≤", "≥", "+", "−", "×", "÷", "(", ")"],

    variables: ["=", "+", "−", "×", "÷", "(", ")", "^", "<", ">", "≤", "≥"],

    equations: ["=", "≠", "+", "−", "×", "÷", "(", ")", "^", "<", ">", "/"],

    units: ["°", "²", "³", "×", "÷", "+", "−", "=", "(", ")", ".", ","],

    "2d-shapes": ["°", "π", "²", "=", "+", "−", "×", "÷", "(", ")", "<", ">"],
    "3d-shapes": ["³", "²", "π", "=", "+", "−", "×", "÷", "(", ")", "<", ">"],

    perimeter: ["+", "−", "=", "(", ")", "×", "÷", "/", ".", ",", "<", ">"],
    area: ["²", "π", "×", "÷", "+", "−", "=", "(", ")", "/", ".", ","],
};

function toKeys(labels) {
    return labels.map((label) => ({
        label,
        value: KEY_VALUE[label] ?? label,
    }));
}

export function useExerciseKeypad({
                                      normalizedTopic,
                                      answerInputRef,
                                      setAnswer,
                                  }) {
    const focusAnswerInput = useCallback(() => {
        const el = answerInputRef.current;
        if (!el) return;

        el.focus();

        const len = el.value.length;
        try {
            el.setSelectionRange(len, len);
        } catch {
            // ignore unsupported input types
        }
    }, [answerInputRef]);

    const keypad = useMemo(() => {
        const labels = TOPIC_LABELS[normalizedTopic] ?? BASE;
        return toKeys(labels);
    }, [normalizedTopic]);

    const appendToAnswer = useCallback(
        (value) => {
            focusAnswerInput();

            if (value === ".") {
                setAnswer((prev) => {
                    const lastSeg = prev.split(/[^0-9.]/).pop() ?? "";
                    if (lastSeg.includes(".")) return prev;
                    if (prev.length === 0) return "0.";
                    if (/[^0-9)]$/.test(prev)) return `${prev}0.`;
                    return `${prev}.`;
                });
                return;
            }

            if (value === "-") {
                setAnswer((prev) => {
                    if (prev.length === 0) return "-";
                    if (/[+\-*/(]$/.test(prev)) return `${prev}-`;
                    return prev;
                });
                return;
            }

            setAnswer((prev) => prev + value);
        },
        [focusAnswerInput, setAnswer]
    );

    const backspace = useCallback(() => {
        focusAnswerInput();
        setAnswer((prev) => prev.slice(0, -1));
    }, [focusAnswerInput, setAnswer]);

    const clearAnswer = useCallback(() => {
        focusAnswerInput();
        setAnswer("");
    }, [focusAnswerInput, setAnswer]);

    return {
        keypad,
        focusAnswerInput,
        appendToAnswer,
        backspace,
        clearAnswer,
    };
}