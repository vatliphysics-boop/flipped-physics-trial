"use client";

import { useState, useTransition } from "react";
import { RichPhysicsText } from "./RichPhysicsText";
import { legacyNuclearMath } from "@/lib/legacy-nuclear-math";
import { submitPhaseAssessmentAction } from "@/app/student/actions";

export type AssessmentQuestion = {
  id: string;
  question_type: "single_choice" | "true_false" | "short_answer";
  difficulty: "nhan_biet" | "thong_hieu" | "van_dung" | "van_dung_cao";
  content: Record<string, unknown>; // jsonb
};

export function StudentPhase3Assessment({
  lessonId,
  questions,
  isCompleted,
}: {
  lessonId: string;
  questions: AssessmentQuestion[];
  isCompleted: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);
  const [localCompleted, setLocalCompleted] = useState(false);
  const [isPending, startTransition] = useTransition();
  if (isCompleted || localCompleted) {
    return (
      <section style={{ marginTop: "48px", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--semantic-success)", backgroundColor: "rgba(16, 185, 129, 0.1)" }}>
        <h3 style={{ color: "var(--semantic-success)", fontSize: "18px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
          ✓ Em đã hoàn thành bài tập cuối bài. Bài học đã hoàn tất.
        </h3>
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
      const res = await submitPhaseAssessmentAction({
        lessonId,
        answers,
      }).catch(() => ({ error: "Chưa nộp được. Câu trả lời vẫn còn trên trang; em hãy thử lại.", success: false }));
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        setLocalCompleted(true);
      }
    });
  }

  function renderQuestionContent(q: AssessmentQuestion, index: number) {
    const title = `Câu ${index + 1} (${q.difficulty === "nhan_biet" ? "Nhận biết" : q.difficulty === "thong_hieu" ? "Thông hiểu" : q.difficulty === "van_dung" ? "Vận dụng" : "Vận dụng cao"})`;
    const prompt = <RichPhysicsText content={legacyNuclearMath(String(q.content.prompt || "Câu hỏi"))} />;

    if (q.question_type === "single_choice") {
      const options = (q.content.options as string[]) || [];
      return (
        <div key={q.id} style={{ marginBottom: "24px" }}>
          <p style={{ fontWeight: 500, marginBottom: "12px" }}>{title}</p>{prompt}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {options.map((opt: string, i: number) => (
              <label key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  value={opt}
                  checked={answers[q.id] === opt}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  required
                />
                <RichPhysicsText compact content={legacyNuclearMath(opt)} />
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (q.question_type === "true_false") {
      // RPC returns content.statements as [{text: "..."}, ...] (whitelist-only, no correctValue/explanation)
      const statements = (q.content.statements as { text?: string }[]) || [];
      return (
        <div key={q.id} style={{ marginBottom: "24px" }}>
          <p style={{ fontWeight: 500, marginBottom: "12px" }}>{title}</p>{prompt}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {statements.map((stmt, i: number) => {
              const qAnswers = (answers[q.id] as Record<string, string>) || {};
              return (
                <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "space-between", alignItems: "center", padding: "8px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}>
                  <RichPhysicsText content={legacyNuclearMath(stmt.text || `Phát biểu ${i + 1}`)} />
                  <div style={{ display: "flex", gap: "12px" }}>
                    <label><input type="radio" name={`q-${q.id}-part-${i}`} value="true" checked={qAnswers[i] === "true"} onChange={(e) => setAnswers({ ...answers, [q.id]: { ...qAnswers, [i]: e.target.value } })} required /> Đúng</label>
                    <label><input type="radio" name={`q-${q.id}-part-${i}`} value="false" checked={qAnswers[i] === "false"} onChange={(e) => setAnswers({ ...answers, [q.id]: { ...qAnswers, [i]: e.target.value } })} required /> Sai</label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (q.question_type === "short_answer") {
      return (
        <div key={q.id} style={{ marginBottom: "24px" }}>
          <p style={{ fontWeight: 500, marginBottom: "12px" }}>{title}</p>{prompt}
          <input
            aria-label={title}
            type="text"
            className="form-input"
            value={(answers[q.id] as string) || ""}
            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
            placeholder="Nhập câu trả lời..."
            required
          />
        </div>
      );
    }

    return null;
  }

  return (
    <section style={{ marginTop: "48px", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", backgroundColor: "var(--bg-surface-elevated)" }}>
      <h3 style={{ fontSize: "20px", marginBottom: "16px", color: "var(--text-primary)" }}>Bài tập & Đánh giá</h3>
      <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
        Hoàn thành các bài tập dưới đây để kết thúc bài học.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
        {questions.map((q, i) => renderQuestionContent(q, i))}

        {error && <p role="alert" style={{ color: "var(--semantic-danger)", marginBottom: "16px" }}>{error}</p>}

        <div>
          <button type="submit" className="btn primary" disabled={isPending}>
            {isPending ? "Đang nộp bài..." : "Nộp bài tập"}
          </button>
        </div>
      </form>
    </section>
  );
}
