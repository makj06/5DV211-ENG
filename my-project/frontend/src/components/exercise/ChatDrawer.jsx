import React, { useEffect, useRef } from "react";
import ChatBubble from "../ui/ChatBubble";

export default function ChatDrawer({
                                       chatOpen,
                                       onClose,
                                       chatMessages,
                                       chatLoading,
                                       chatError,
                                       message,
                                       onChangeMessage,
                                       onSend,
                                   }) {
    const chatBodyRef = useRef(null);
    const chatEndRef = useRef(null);

    function scrollChatToBottom(behavior = "auto") {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior, block: "end" });
        } else if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }

    useEffect(() => {
        if (!chatOpen) return;
        const t = setTimeout(() => scrollChatToBottom("smooth"), 0);
        return () => clearTimeout(t);
    }, [chatOpen, chatMessages.length, chatLoading]);

    return (
        <div
            className={["rightCol--drawer", chatOpen ? "isOpen" : "isClosed", "chatArea"].join(" ")}
            aria-hidden={!chatOpen}
        >
            <div className="chatShell glass">
                <div className="chatHeader">
                    <div className="aiHeader">
                        <div className="aiBadge" aria-hidden="true">
                            🤖
                        </div>
                        <div className="aiHeaderText">
                            <div className="aiTitle">AI Teacher</div>
                        </div>
                    </div>

                    <div className="chatHeaderRight">
                        <button
                            type="button"
                            className="chatCloseSmall"
                            aria-label="Close chat"
                            onClick={onClose}
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="chatBody" ref={chatBodyRef}>
                    {chatMessages.map((m, i) => (
                        <ChatBubble key={i} from={m.from}>
                            {m.text}
                        </ChatBubble>
                    ))}

                    {chatLoading && <ChatBubble from="ai">…</ChatBubble>}

                    {chatError && (
                        <div className="chatMeta">
                            <div className="chatMetaName">{chatError}</div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                <form className="chatComposer" onSubmit={onSend}>
                    <input
                        className="chatInput"
                        value={message}
                        onChange={(e) => onChangeMessage(e.target.value)}
                        placeholder="Type a message..."
                    />
                    <button className="sendBtn" type="submit" aria-label="Send" disabled={chatLoading}>
                        ➤
                    </button>
                </form>
            </div>
        </div>
    );
}