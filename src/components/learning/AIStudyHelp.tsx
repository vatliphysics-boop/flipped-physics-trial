"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { AI_LESSONS, AI_SERVICES, getAIStarters } from "@/lib/ai-learning";
import type { ChatMessage } from "@/lib/local-ai";
import { AIResponseText } from "./AIResponseText";

export function AIServiceButtons() {
  return (
    <div className="ai-service-buttons" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      {AI_SERVICES.map((service) => (
        <a
          key={service.id}
          className="btn small"
          href={service.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-dark)",
            color: "var(--text-primary)",
            fontSize: "12px",
          }}
        >
          Mở {service.label} ↗
        </a>
      ))}
    </div>
  );
}

type AnswerSource = { id: string; text: string };

/**
 * Inline or Docked Student Physics Chatbox with KaTeX formula rendering,
 * Socratic Hint Mode & Full Explanation Mode, and instant response.
 */
export function StudentPhysicsChatboxPanel({
  defaultLessonCode = "B21",
  publicLibrary = true,
  onClose,
  embedded = false,
}: {
  defaultLessonCode?: string;
  publicLibrary?: boolean;
  onClose?: () => void;
  embedded?: boolean;
}) {
  const id = useId();
  const [lesson, setLesson] = useState(
    AI_LESSONS.some((item) => item.code === defaultLessonCode)
      ? defaultLessonCode
      : "B21"
  );
  const [mode, setMode] = useState<"hint" | "explain">("explain");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sources, setSources] = useState<AnswerSource[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => { if (!embedded) panelRef.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus(); }, [embedded]);
  const pendingRef = useRef<AbortController | null>(null);

  useEffect(() => () => pendingRef.current?.abort(), []);

  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  function reset(code = lesson) {
    pendingRef.current?.abort();
    pendingRef.current = null;
    setBusy(false);
    setLesson(code);
    setMessages([]);
    setSources([]);
    setError("");
    setQuestion("");
  }

  async function sendQuestion(customText?: string) {
    const textToSend = (customText ?? question).trim();
    if (busy || !textToSend) return;

    // Keep last 6 messages to stay within API validation bounds while allowing continuous conversation
    const trimmedPrev = messages.slice(-6);
    const history: ChatMessage[] = [
      ...trimmedPrev,
      { role: "user", content: textToSend },
    ];
    const controller = new AbortController();
    pendingRef.current = controller;
    setBusy(true);
    setError("");
    setMessages(history);
    if (!customText) setQuestion("");

    try {
      const response = await fetch("/api/ai/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ lesson, mode, messages: history }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Chưa nhận được câu trả lời.");
      }
      if (controller.signal.aborted) return;
      setMessages([...history, { role: "assistant", content: data.reply }]);
      setSources(data.sources ?? []);
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(
          err instanceof Error ? err.message : "Chưa nhận được câu trả lời."
        );
      }
    } finally {
      if (pendingRef.current === controller) {
        setBusy(false);
        pendingRef.current = null;
      }
    }
  }

  return (
    <section
      ref={panelRef}
      id={id}
      className="ai-chat-panel"
      role={embedded ? undefined : "dialog"}
      aria-labelledby={`${id}-title`}
      style={{
        background: "#ffffff",
        border: "1px solid var(--border-dark)",
        borderRadius: "var(--radius-lg)",
        boxShadow: embedded
          ? "0 4px 16px rgba(15, 23, 42, 0.05)"
          : "0 20px 48px rgba(15, 23, 42, 0.18)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        width: embedded ? "100%" : "min(430px, calc(100vw - 28px))",
        maxHeight: embedded ? "580px" : "min(640px, calc(100dvh - 96px))",
        color: "var(--text-primary)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          background: "var(--text-primary)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div>
          <h2
            id={`${id}-title`}
            style={{
              margin: 0,
              fontSize: "15.5px",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            Trợ lí AI Vật lí Hạt nhân 12
          </h2>
          <small style={{ fontSize: "12.5px", color: "var(--bg-surface-elevated)" }}>
            Trao đổi theo bài học · Kiểm tra lại lời giải
          </small>
        </div>
        {onClose && (
          <button
            type="button"
            aria-label="Đóng trợ lí học tập"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.14)",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              width: "40px",
              height: "40px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Lesson & Mode Selector Bar */}
      <div
        style={{
          padding: "10px 14px",
          background: "var(--bg-surface-elevated)",
          borderBottom: "1px solid var(--border-light)",
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: "8px",
        }}
      >
        <label style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text-secondary)" }}>
          Bài đang học
          <select
            value={lesson}
            disabled={busy}
            onChange={(e) => reset(e.target.value)}
            style={{
              width: "100%",
              marginTop: "3px",
              padding: "5px 8px",
              borderRadius: "6px",
              border: "1px solid var(--border-dark)",
              background: "#ffffff",
              color: "var(--text-primary)",
              fontSize: "12.5px",
              fontWeight: 600,
            }}
          >
            {AI_LESSONS.map((item) => (
              <option key={item.code} value={item.code}>
                {item.code} · {item.title}
              </option>
            ))}
          </select>
        </label>

        <label style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text-secondary)" }}>
          Chế độ hỗ trợ
          <select
            value={mode}
            disabled={busy}
            onChange={(e) => setMode(e.target.value as "hint" | "explain")}
            style={{
              width: "100%",
              marginTop: "3px",
              padding: "5px 8px",
              borderRadius: "6px",
              border: "1px solid var(--border-dark)",
              background: "#ffffff",
              color: "var(--text-primary)",
              fontSize: "12.5px",
              fontWeight: 600,
            }}
          >
            <option value="explain">Giải thích &amp; Công thức</option>
            <option value="hint">Gợi mở từng bước (Socratic)</option>
          </select>
        </label>
      </div>

      {/* Chat Log */}
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label="Cuộc trao đổi với AI"
        aria-busy={busy}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          minHeight: "220px",
          background: "#ffffff",
        }}
      >
        {messages.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                background: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-light)",
                fontSize: "13px",
                color: "var(--text-secondary)",
                lineHeight: 1.55,
              }}
            >
              Chào em! Hãy chọn câu hỏi gợi ý bên dưới hoặc nhập bất kỳ câu hỏi/bài toán nào về <strong>{lesson}</strong>. Trợ lí AI sẽ giải thích kèm công thức chuẩn LaTeX.
            </div>
            <div style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text-muted)" }}>
              Câu hỏi gợi ý nhanh ({lesson}):
            </div>
            {getAIStarters(lesson).map((starter) => (
              <button
                type="button"
                key={starter}
                onClick={() => void sendQuestion(starter)}
                style={{
                  textAlign: "left",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#ffffff",
                  border: "1px solid var(--border-dark)",
                  color: "var(--text-primary)",
                  fontSize: "12.5px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {starter}
              </button>
            ))}
          </div>
        )}

        {messages.map((message, index) => {
          const isUser = message.role === "user";
          return (
            <div
              key={index}
              style={{
                alignSelf: isUser ? "flex-end" : "flex-start",
                maxWidth: "92%",
                padding: "10px 14px",
                borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                background: isUser ? "var(--text-primary)" : "var(--bg-surface-elevated)",
                color: isUser ? "#ffffff" : "var(--text-primary)",
                border: isUser ? "none" : "1px solid var(--border-light)",
                fontSize: "13.5px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  marginBottom: "4px",
                  color: isUser ? "var(--border-dark)" : "var(--text-muted)",
                }}
              >
                {isUser ? "Học sinh" : `Trợ lí Vật lí (${lesson})`}
              </div>
              <div>
                <AIResponseText text={message.content} />
              </div>
            </div>
          );
        })}

        {busy && (
          <p role="status" style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0 }}>
            Đang phân tích công thức và trả lời…
          </p>
        )}

        {error && (
          <p
            role="alert"
            style={{
              fontSize: "12.5px",
              color: "var(--semantic-danger)",
              background: "var(--semantic-danger-soft)",
              padding: "8px 10px",
              borderRadius: "8px",
              margin: 0,
            }}
          >
            {error}
          </p>
        )}

        {sources.length > 0 && (
          <details
            style={{
              fontSize: "12px",
              background: "var(--bg-surface-elevated)",
              padding: "8px 10px",
              borderRadius: "8px",
              border: "1px solid var(--border-light)",
            }}
          >
            <summary style={{ fontWeight: 600, cursor: "pointer" }}>
              Căn cứ kiến thức SGK ({lesson})
            </summary>
            {sources.map((source) => (
              <p key={source.id} style={{ margin: "6px 0", fontSize: "12px", color: "var(--text-secondary)" }}>
                <strong>[{source.id}]</strong> {source.text}
              </p>
            ))}
            <Link
              href={`/hoc-lieu/truc-quan?bai=${lesson}`}
              style={{ fontWeight: 600, color: "var(--text-primary)", textDecoration: "underline" }}
            >
              Mở mô phỏng 3D bài {lesson} →
            </Link>
          </details>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void sendQuestion();
        }}
        style={{
          padding: "10px 14px",
          background: "var(--bg-surface-elevated)",
          borderTop: "1px solid var(--border-light)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <textarea
          id={`${id}-question`}
          rows={2}
          maxLength={1500}
          value={question}
          disabled={busy}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void sendQuestion();
            }
          }}
          placeholder="Nhập câu hỏi về công thức, hiện tượng 3D hoặc bài tập (Nhấn Enter để gửi)…"
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: "8px",
            border: "1px solid var(--border-dark)",
            background: "#ffffff",
            fontSize: "13px",
            color: "var(--text-primary)",
            resize: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              className="btn small"
              type="button"
              onClick={() => reset()}
              style={{
                background: "#ffffff",
                border: "1px solid var(--border-dark)",
                color: "var(--text-secondary)",
                fontSize: "12px",
              }}
            >
              Làm mới
            </button>
            <Link
              href={`${publicLibrary ? "/hoc-lieu/ai" : "/student/ai"}?bai=${lesson}`}
              style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}
            >
              Nhật kí hỏi AI →
            </Link>
          </div>
          <button
            className="btn primary small"
            disabled={busy || !question.trim()}
            type="submit"
            style={{
              background: "var(--color-primary)",
              color: "#ffffff",
              border: "none",
              padding: "6px 16px",
              fontWeight: 600,
              fontSize: "12.5px",
            }}
          >
            {busy ? "Đang gửi…" : "Gửi câu hỏi"}
          </button>
        </div>
      </form>
    </section>
  );
}

export function AIStudyHelp({
  publicLibrary = false,
  defaultLessonCode = "B21",
  code,
  embedded = false,
}: {
  publicLibrary?: boolean;
  defaultLessonCode?: string;
  code?: string;
  embedded?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const resolvedCode = code || defaultLessonCode;
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);

  if (embedded) {
    return (
      <StudentPhysicsChatboxPanel
        defaultLessonCode={resolvedCode}
        publicLibrary={publicLibrary}
        embedded
      />
    );
  }

  return (
    <aside
      className="ai-help-dock"
      aria-label="Trợ lí học tập"

    >
      {open && (
        <StudentPhysicsChatboxPanel
          defaultLessonCode={resolvedCode}
          publicLibrary={publicLibrary}
          onClose={() => {
            setOpen(false);
            triggerRef.current?.focus();
          }}
        />
      )}
      <button
        ref={triggerRef}
        type="button"
        className="ai-help-trigger"
        aria-label={open ? "Thu gọn trợ lí học tập" : "Mở trợ lí học tập"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}

      >
        <span>{open ? "Đóng trợ lí" : "Hỏi AI Vật lí 12"}</span>
      </button>
    </aside>
  );
}
