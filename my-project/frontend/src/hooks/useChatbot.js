import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchJsonOrText, toErrorMessage } from "../utils/http";

const CHAT_URL = "/api/chat/";

const INIT_MESSAGE =  "Say hello and tell me you can help with the current math task if I get stuck.";

function normalizeReplyData(data) {
    if (!data || typeof data !== "object") return { reply: "", response_id: "" };
    return {
        reply: typeof data.reply === "string" ? data.reply : "",
        response_id: typeof data.response_id === "string" ? data.response_id : "",
    };
}

export function useChatbot({ topic, chatOpen, current_task } = {}) {
    const [chatMessages, setChatMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatError, setChatError] = useState("");

    const didInitRef = useRef(false);
    const responseIdRef = useRef("");
    const abortRef = useRef(null);

    const hasAccessToken = !!localStorage.getItem("access");
    const canChat = hasAccessToken;

    const resetChat = useCallback(() => {
        didInitRef.current = false;
        responseIdRef.current = "";
        setChatMessages([]);
        setChatError("");
        setChatLoading(false);
        abortRef.current?.abort?.();
        abortRef.current = null;
    }, []);

    useEffect(() => {
        resetChat();
    }, [resetChat, topic]);

    const request = useCallback(
        async (nextMessage, { silentUserMessage = false } = {}) => {
            if (!canChat) return;

            const msg = typeof nextMessage === "string" ? nextMessage : "";
            const trimmed = msg.trim();

            if (!trimmed) return;

            abortRef.current?.abort?.();
            const ac = new AbortController();
            abortRef.current = ac;

            setChatLoading(true);
            setChatError("");

            try {
                const { res, data } = await fetchJsonOrText(CHAT_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        message: msg,
                        response_id: responseIdRef.current || "",
                        current_task: current_task || "",
                        language: "english",
                    }),
                    signal: ac.signal,
                });

                if (!res.ok) {
                    setChatError(toErrorMessage({ res, data, fallback: "Chat failed" }));
                    return;
                }

                const replyData = normalizeReplyData(data);

                if (replyData.response_id) {
                    responseIdRef.current = replyData.response_id;
                }

                if (replyData.reply && replyData.reply.trim()) {
                    setChatMessages((prev) => [
                        ...prev,
                        { from: "ai", text: replyData.reply },
                    ]);
                }
            } catch (e) {
                if (e?.name === "AbortError") return;
                setChatError("Network error: could not reach server");
            } finally {
                if (abortRef.current === ac) setChatLoading(false);
            }
        },
        [canChat, current_task]
    );

    useEffect(() => {
        if (!chatOpen || !canChat) return;
        if (didInitRef.current) return;

        didInitRef.current = true;

        request(INIT_MESSAGE, { silentUserMessage: true });
    }, [chatOpen, canChat, request]);

    const sendMessage = useCallback(
        (text) => {
            const trimmed = (text ?? "").trim();
            if (!trimmed) return;

            setChatMessages((prev) => [...prev, { from: "me", text: trimmed }]);
            request(trimmed);
        },
        [request]
    );

    return useMemo(
        () => ({ chatMessages, chatLoading, chatError, sendMessage, resetChat }),
        [chatMessages, chatLoading, chatError, sendMessage, resetChat]
    );
}