import React from "react";

export default function KeyButton({ label, onClick, variant = "key", kind = "num" }) {
    return (
        <button
            type="button"
            className={[
                "key",
                `key--${kind}`,
                variant === "wide" ? "key--wide" : "",
                variant === "ghost" ? "key--ghost" : "",
            ].join(" ")}
            onClick={onClick}
        >
            {label}
        </button>
    );
}