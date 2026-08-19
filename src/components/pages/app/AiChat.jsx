import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, X, Send, Bot, Square, AlertCircle } from "lucide-react";
import { httpPostStream } from "../../../utils/httpMethods";
import { SERVER_PATH } from "../../../api/restEndpoint";

const CHATBOT_URL = `${SERVER_PATH}/api/chatbot/chat`;

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: "assistant",
    text: "Hi! I'm Contia Copilot. I have live access to your invoices, vouchers, and VAT data. Ask me anything about your finances.",
  },
];

// Converts the messages array into the format the API expects:
// [{ role: "user" | "assistant", content: "..." }, ...]
const toApiHistory = (messages) =>
  messages
    .filter((m) => m.id !== 1) // skip the static greeting
    .map((m) => ({ role: m.role, content: m.text }));

const AiChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const abortRef = useRef(null); // AbortController for the current stream

  // Auto-scroll to bottom whenever messages update or panel opens
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Clean up any in-flight stream when component unmounts
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    setError(null);
    setInput("");

    // Add user message immediately
    const userMsg = { id: Date.now(), role: "user", text };
    // Placeholder for the streaming assistant reply
    const assistantId = Date.now() + 1;
    const assistantPlaceholder = { id: assistantId, role: "assistant", text: "" };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setStreaming(true);

    // Build conversation history including the new user message
    const history = [
      ...toApiHistory(messages),
      { role: "user", content: text },
    ];

    abortRef.current = new AbortController();

    try {
      await httpPostStream({
        url: CHATBOT_URL,
        payload: { messages: history },
        abortController: abortRef.current,
        onMessage: (chunk, done) => {
          if (done === true) {
            // Normal stream end
            setStreaming(false);
            return;
          }
          if (done && typeof done === "object" && done.truncated) {
            // Backend signalled truncation — append a note
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, text: m.text + "\n\n_(Response truncated)_" }
                  : m
              )
            );
            setStreaming(false);
            return;
          }
          if (chunk !== null) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, text: m.text + chunk } : m
              )
            );
          }
        },
      });
    } catch (err) {
      if (err?.name === "AbortError") {
        // User stopped the stream — leave whatever text arrived
        setStreaming(false);
        return;
      }
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        "Something went wrong. Please try again.";
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
      // Remove the empty assistant placeholder on hard error
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      setStreaming(false);
    }
  }, [input, streaming, messages]);

  const handleStop = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Typing indicator dots shown while the assistant reply is empty but streaming
  const showTypingDots =
    streaming &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === "assistant" &&
    messages[messages.length - 1]?.text === "";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div
          className="bg-bg-50 border border-bd-50 rounded-2xl shadow-xl flex flex-col overflow-hidden"
          style={{ width: 340, height: 460 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-bd-50 bg-bg-60">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-ac-02" />
              <span className="text-sm font-semibold text-fg-50">Contia Copilot</span>
              {streaming && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-ac-02/10 text-ac-02 text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-ac-02 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-fg-60 hover:text-fg-50 transition-colors rounded-md p-0.5 hover:bg-bg-40"
            >
              <X size={15} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-ac-02 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={12} className="text-white dark:text-black" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-ac-02 text-white dark:text-black rounded-br-sm"
                      : "bg-bg-40 text-fg-50 rounded-bl-sm border border-bd-50"
                  }`}
                >
                  {/* Typing dots when assistant reply hasn't started yet */}
                  {msg.role === "assistant" && msg.text === "" && showTypingDots ? (
                    <span className="flex items-center gap-1 h-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-fg-60 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-fg-60 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-fg-60 animate-bounce [animation-delay:300ms]" />
                    </span>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-bd-50 bg-bg-60">
            <div className="flex items-center gap-2 bg-bg-40 border border-bd-50 rounded-xl px-3 py-1.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your invoices, VAT, vouchers…"
                disabled={streaming}
                className="flex-1 bg-transparent text-xs text-fg-50 placeholder:text-fg-60 outline-none disabled:opacity-50"
              />
              {streaming ? (
                // Stop button while streaming
                <button
                  onClick={handleStop}
                  title="Stop generating"
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Square size={13} fill="currentColor" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="text-ac-02 hover:text-ac-01 disabled:opacity-30 transition-colors"
                >
                  <Send size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Contia Copilot"
        className="w-12 h-12 rounded-full bg-ac-02 hover:bg-ac-01 text-white dark:text-black shadow-lg flex items-center justify-center transition-colors"
      >
        {open ? <X size={20} /> : <Sparkles size={20} />}
      </button>
    </div>
  );
};

export default AiChat;
