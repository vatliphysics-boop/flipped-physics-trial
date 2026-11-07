"use client";

import { useId, useState, useTransition } from "react";
import { RichPhysicsText } from "./RichPhysicsText";
import { legacyNuclearMath } from "@/lib/legacy-nuclear-math";
import { submitPhaseFinalQuestionsAction } from "@/app/student/actions";

export type FinalQuestion = {
  id: string;
  question_text: string;
};

export function StudentPhaseFinalQuestions({
  lessonId,
  phase,
  questions,
  isCompleted,
}: {
  lessonId: string;
  phase: "before_class" | "in_class";
  questions: FinalQuestion[];
  isCompleted: boolean;
}) {
  const formId = useId();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [localCompleted, setLocalCompleted] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (isCompleted || localCompleted) {
    return (
      <section style={{ marginTop: "48px", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--semantic-success)", backgroundColor: "rgba(16, 185, 129, 0.1)" }}>
        <h3 style={{ color: "var(--semantic-success)", fontSize: "18px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
          ✓ Em đã hoàn thành chốt kiến thức pha này.
        </h3>
        <p style={{ marginTop: "8px", color: "var(--text-secondary)" }}>Em có thể chuyển sang pha tiếp theo.</p>
      </section>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (Object.keys(answers).length !== questions.length) {
      setError("Vui lòng trả lời đầy đủ các câu hỏi.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await submitPhaseFinalQuestionsAction({
        lessonId,
        phase,
        answers,
      }).catch(() => ({ error: "Chưa nộp được. Câu trả lời vẫn còn trên trang; em hãy thử lại.", success: false }));
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        setLocalCompleted(true);
      }
    });
  }

  return (
    <section style={{ marginTop: "48px", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", backgroundColor: "var(--bg-surface-elevated)" }}>
      <h3 style={{ fontSize: "20px", marginBottom: "16px", color: "var(--text-primary)" }}>Chốt kiến thức</h3>
      <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
        Để chuyển sang giai đoạn tiếp theo, em hãy trả lời đúng các câu hỏi dưới đây.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {questions.map((q, i) => (
          <div key={q.id}>
            <div style={{ fontWeight: 500, marginBottom: "8px" }}>
              <label htmlFor={`${formId}-${q.id}`}>Câu {i + 1}</label>
              <RichPhysicsText content={legacyNuclearMath(q.question_text)} />
            </div>
            <input
              id={`${formId}-${q.id}`}
              type="text"
              className="form-input"
              value={answers[q.id] || ""}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              placeholder="Nhập câu trả lời..."
              required
            />
          </div>
        ))}

        {error && (
          <div role="alert" style={{ padding: "16px", backgroundColor: error.includes("chưa đúng") ? "#fffbeb" : "var(--bg-surface-elevated)", border: `1px solid ${error.includes("chưa đúng") ? "#f59e0b" : "var(--semantic-error)"}`, borderRadius: "var(--radius-md)", color: error.includes("chưa đúng") ? "#92400e" : "var(--semantic-error)" }}>
            {error.includes("chưa đúng") ? <strong>Phản hồi học tập: </strong> : null}
            {error}
          </div>
        )}

        <div>
          <button type="submit" className="btn primary" disabled={isPending}>
            {isPending ? "Đang nộp bài..." : "Nộp bài"}
          </button>
        </div>
      </form>
    </section>
  );
}
