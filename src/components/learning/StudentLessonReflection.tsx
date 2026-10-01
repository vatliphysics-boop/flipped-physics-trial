"use client";

import { useState, useTransition } from "react";
import { saveLessonReflectionAction } from "@/app/student/actions";

export function StudentLessonReflection({
  lessonId,
  existingReflection,
}: {
  lessonId: string;
  existingReflection?: {
    learned: string;
    difficult: string;
    next_step: string;
    confidence: number;
  };
}) {
  const [learned, setLearned] = useState(existingReflection?.learned || "");
  const [difficult, setDifficult] = useState(existingReflection?.difficult || "");
  const [nextStep, setNextStep] = useState(existingReflection?.next_step || "");
  const [confidence, setConfidence] = useState(existingReflection?.confidence || 3);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await saveLessonReflectionAction({
        lessonId,
        learned,
        difficult,
        nextStep,
        confidence,
      });
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(res.message || "Đã lưu nhật kí học tập thành công!");
      }
    });
  }

  return (
    <section style={{ marginTop: "48px", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", backgroundColor: "var(--bg-surface-elevated)" }}>
      <h3 style={{ fontSize: "20px", marginBottom: "16px", color: "var(--text-primary)" }}>Nhật kí tự học & Tự điều chỉnh</h3>
      <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
        Để phát triển năng lực tự học, em hãy suy ngẫm về những gì đã học, tự đánh giá mức độ hiểu bài và đặt mục tiêu (tự điều chỉnh) cho các bài học tiếp theo.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div>
          <label style={{ display: "block", fontWeight: 500, marginBottom: "8px" }}>Em đã học được những kiến thức cốt lõi nào?</label>
          <textarea className="form-input" rows={3} value={learned} onChange={(e) => setLearned(e.target.value)} required placeholder="Ví dụ: Cấu tạo hạt nhân gồm proton và neutron..." />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 500, marginBottom: "8px" }}>Phần nào em thấy khó hiểu nhất hoặc còn mắc lỗi?</label>
          <textarea className="form-input" rows={3} value={difficult} onChange={(e) => setDifficult(e.target.value)} required placeholder="Ví dụ: Em hay nhầm lẫn giữa số khối và số nơtron..." />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 500, marginBottom: "8px" }}>Mức độ tự tin của em về bài học này (1-5)</label>
          <select className="form-input" value={confidence} onChange={(e) => setConfidence(Number(e.target.value))}>
            <option value={1}>1 - Rất chưa hiểu</option>
            <option value={2}>2 - Còn nhiều thắc mắc</option>
            <option value={3}>3 - Hiểu cơ bản</option>
            <option value={4}>4 - Hiểu khá rõ</option>
            <option value={5}>5 - Hoàn toàn tự tin</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 500, marginBottom: "8px" }}>Mục tiêu/Hành động tự điều chỉnh tiếp theo của em là gì?</label>
          <textarea className="form-input" rows={2} value={nextStep} onChange={(e) => setNextStep(e.target.value)} required placeholder="Ví dụ: Xem lại video phần phân rã alpha, đọc thêm SGK..." />
        </div>

        {error && <p style={{ color: "var(--semantic-error)" }}>{error}</p>}
        {success && <p style={{ color: "var(--semantic-success)" }}>{success}</p>}

        <div>
          <button type="submit" className="btn primary" disabled={isPending}>
            {isPending ? "Đang lưu..." : "Lưu nhật kí học tập"}
          </button>
        </div>
      </form>
    </section>
  );
}
