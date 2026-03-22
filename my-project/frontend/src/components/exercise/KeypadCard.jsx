import React from "react";
import KeyButton from "../ui/KeyButton";

export default function KeypadCard({ keypad, onPressKey, onBackspace, onClear }) {
    return (
        <div className="keypadCard glass keypadArea">
            <div className="keypadGrid">
                {keypad.map((k) => (
                    <KeyButton
                        key={k.label}
                        label={k.label}
                        kind={k.kind}
                        onClick={() => onPressKey(k.value)}
                    />
                ))}

                <KeyButton label="Backspace" kind="action" variant="wide" onClick={onBackspace} />
                <KeyButton label="Clear" kind="danger" variant="ghost" onClick={onClear} />
            </div>
        </div>
    );
}