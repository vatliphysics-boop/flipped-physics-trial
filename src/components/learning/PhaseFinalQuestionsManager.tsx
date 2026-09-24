"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type FinalQuestion = {
  id: string;
  question_text: string;
  correct_answer: string;
};

export function PhaseFinalQuestionsManager({ lessonId, phase, questions }: { lessonId: string; phase: "before_class" | "in_class"; questions: FinalQuestion[] }) {
  const [q1, setQ1] = useState(questions[0]?.question_text || "");
  const [a1, setA1] = useState(questions[0]?.correct_answer || "");
  const [q2, setQ2] = useState(questions[1]?.question_text || "");
  const [a2, setA2] = useState(questions[1]?.correct_answer || "");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function handleSave() {
    if (!q1 || !a1 || !q2 || !a2) return alert("Phải nhập đầy đủ 2 câu hỏi và đáp án.");
    setSaving(true);
    // Delete existing
    await supabase.from("phase_final_questions").delete().eq("lesson_id", lessonId).eq("phase", phase);
    // Insert new
    await supabase.from("phase_final_questions").insert([
      { lesson_id: lessonId, phase, question_text: q1, correct_answer: a1, sort_order: 1 },
      { lesson_id: lessonId, phase, question_text: q2, correct_answer: a2, sort_order: 2 }
    ]);
    setSaving(false);
    alert("Đã lưu 2 câu hỏi cuối giai đoạn.");
    window.location.reload();
  }

  return (
    <section className="card" style={{ marginTop: "24px", padding: "24px", border: "1px solid var(--border-light)" }}>
      <header style={{ marginBottom: "16px" }}>
        <h2>Câu hỏi cuối giai đoạn</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Cấu hình chính xác 2 câu hỏi để học sinh làm sau khi hoàn thành học liệu.</p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontWeight: 600 }}>Câu 1</label>
          <input className="form-input" placeholder="Nội dung câu hỏi" value={q1} onChange={(e) => setQ1(e.target.value)} />
          <input className="form-input" placeholder="Đáp án đúng" value={a1} onChange={(e) => setA1(e.target.value)} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontWeight: 600 }}>Câu 2</label>
          <input className="form-input" placeholder="Nội dung câu hỏi" value={q2} onChange={(e) => setQ2(e.target.value)} />
          <input className="form-input" placeholder="Đáp án đúng" value={a2} onChange={(e) => setA2(e.target.value)} />
        </div>
      </div>

      <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
        <button className="btn primary" onClick={handleSave} disabled={saving}>{saving ? "Đang lưu..." : "Lưu cấu hình 2 câu"}</button>
      </div>
    </section>
  );
}
