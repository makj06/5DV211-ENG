import React from "react";

export default function ChatBubble({ from = "ai", children }) {
    return (
        <div className={`chatRow ${from === "me" ? "chatRow--me" : "chatRow--ai"}`}>
            {from === "ai" && (
                <div className="botAvatar" aria-hidden="true">
                    🤖
                </div>
            )}
            <div className={`bubble ${from === "me" ? "bubble--me" : "bubble--ai"}`}>
                {children}
            </div>
        </div>
    );
}