// components/ollie/OllieChat.jsx
import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import OllieAvatar from "./OllieAvatar";
import { API_BASE_URL } from "../../config/api";

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
// Handles: **bold**, bullet lines (- or *), numbered lists, blank line paragraphs
// No external dependency needed
function FormattedMessage({ content }) {
  const lines = content.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines (paragraph break already handled by spacing)
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Bullet list item: starts with "- " or "* "
    if (/^[\-\*]\s/.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^[\-\*]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul key={i} className="my-2 space-y-1 pl-4">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list: starts with "1. " etc
    if (/^\d+\.\s/.test(line.trim())) {
      const items = [];
      let num = 1;
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ""));
        i++;
        num++;
      }
      elements.push(
        <ol key={i} className="my-2 space-y-1 pl-4 list-decimal list-inside">
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Heading-like line: starts with "### " or "## " or "# "
    if (/^#{1,3}\s/.test(line)) {
      const text = line.replace(/^#+\s/, "");
      elements.push(
        <p key={i} className="mt-3 mb-1 font-bold text-brand-deep">
          {renderInline(text)}
        </p>
      );
      i++;
      continue;
    }

    // Regular paragraph line
    elements.push(
      <p key={i} className="leading-relaxed">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1 text-sm">{elements}</div>;
}

// Render inline formatting: **bold**, `code`
function renderInline(text) {
  const parts = [];
  // Split on **bold** and `code`
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const raw = match[0];
    if (raw.startsWith("**")) {
      parts.push(<strong key={match.index} className="font-bold text-brand-deep">{raw.slice(2, -2)}</strong>);
    } else {
      parts.push(<code key={match.index} className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs text-brand-deep">{raw.slice(1, -1)}</code>);
    }
    last = match.index + raw.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : text;
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function Message({ msg }) {
  const isOllie = msg.role === "assistant";
  return (
    <div className={`flex gap-3 ${isOllie ? "" : "flex-row-reverse"}`}>
      {isOllie && <div className="shrink-0 mt-1"><OllieAvatar size={32} /></div>}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isOllie
            ? "rounded-tl-none bg-white border border-gray-100 shadow-sm text-gray-700"
            : "rounded-tr-none bg-brand-deep text-white text-sm leading-relaxed"
        }`}
      >
        {isOllie ? <FormattedMessage content={msg.content} /> : msg.content}
      </div>
    </div>
  );
}

// ─── Main chat component ──────────────────────────────────────────────────────
export default function OllieChat({ syllabusId, topic, mode = "explain", onQuizRequest }) {
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error,     setError]     = useState(null);

  // Ref for the scrollable messages container — NOT window scroll
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  // Greet on topic change
  useEffect(() => {
    if (topic) {
      setMessages([{
        role: "assistant",
        content: `Hey! 🦉 Let's study **${topic.name}**.\n\nAsk me anything about this topic, or I can give you a full explanation to start. What would you like?`,
      }]);
      setSessionId(null);
    }
  }, [topic?.name]);

  // Scroll only within the chat container — don't touch window scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    setError(null);
    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/ollie/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ syllabusId, mode, topic: topic?.name, message: text, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get response");
      setSessionId(data.sessionId);
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (err) {
      setError(err.message);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm having a little trouble right now 🦉 Try again in a moment!",
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable messages area — contained scroll, does NOT affect page */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto p-4"
        style={{ maxHeight: "360px" }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <OllieAvatar size={64} animated />
            <p className="mt-4 text-sm font-medium text-gray-500">
              Select a topic to start studying with Ollie 🦉
            </p>
          </div>
        )}
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && (
          <div className="flex gap-3">
            <OllieAvatar size={32} />
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-none bg-white border border-gray-100 px-4 py-3 shadow-sm">
              {[0, 150, 300].map(delay => (
                <span key={delay} className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: `${delay}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      {topic && messages.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-2">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => send(`Explain ${topic.name} in simple terms`)}
              className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:border-brand-accent hover:text-brand-accent transition-colors">
              Explain this topic
            </button>
            <button onClick={() => send(`Give me a real-world example of ${topic.name}`)}
              className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:border-brand-accent hover:text-brand-accent transition-colors">
              Give an example
            </button>
            {onQuizRequest && (
              <button onClick={() => onQuizRequest(topic)}
                className="shrink-0 rounded-full border border-brand-accent/30 bg-brand-accent/5 px-3 py-1 text-xs font-bold text-brand-accent hover:bg-brand-accent/10 transition-colors">
                🎯 Quiz me!
              </button>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); send(input); }}
        className="border-t border-gray-100 p-4">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder={topic ? `Ask about ${topic.name}...` : "Select a topic first..."}
            disabled={!topic || loading}
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-brand-deep placeholder:text-gray-400 focus:border-brand-accent focus:bg-white focus:ring-4 focus:ring-brand-accent/10 outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50" />
          <button type="submit" disabled={!input.trim() || !topic || loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}