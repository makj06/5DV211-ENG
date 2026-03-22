import React from "react";

export default function Pill({ children, tone = "purple" }) {
    return <span className={`pill pill--${tone}`}>{children}</span>;
}