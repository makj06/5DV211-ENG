import React from "react";

export default function ChatFab({ chatOpen, onToggle }) {
    return (
        <button
            type="button"
            className={`chatFab ${chatOpen ? "isOpen" : ""}`}
            onClick={onToggle}
            aria-label={chatOpen ? "Close AI Chat" : "Open AI Chat"}
        >
      <span className="chatFabIcon" aria-hidden="true">
        💬
      </span>
            <span className="chatFabText">{chatOpen ? "Close chat" : "AI Chat"}</span>
        </button>
    );
}