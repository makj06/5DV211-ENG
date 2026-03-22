import { useEffect } from "react";

export function useDialogEscapeBlock(enabled) {
    useEffect(() => {
        if (!enabled) return;

        const blockEscape = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        window.addEventListener("keydown", blockEscape, true);
        return () => window.removeEventListener("keydown", blockEscape, true);
    }, [enabled]);
}