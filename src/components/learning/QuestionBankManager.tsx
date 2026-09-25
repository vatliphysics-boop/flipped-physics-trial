"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type AssessmentQuestion = {
  id: string;
  question_type: string;
  difficulty: string;
  content: { prompt: string; options?: string[]; correctAnswer: string };
  is_published: boolean;
};

export function QuestionBankManager({ lessonId, questions }: { lessonId: string; questions: AssessmentQuestion[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [type, setType] = useState("single_choice");
  const [difficulty, setDifficulty] = useState("nhan_biet");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt || !answer) return;
    setSaving(true);
    const content = { prompt, correctAnswer: answer, options: type === "single_choice" ? options : [] };
    const { error } = await supabase.from("phase_assessment_questions").insert({
      lesson_id: lessonId,
      question_type: type,
      difficulty,
      content,
      is_published: false
    });
    setSaving(false);
    if (!error) {
      setIsAdding(false);
      window.location.reload();
    }
  }

  return (
    <section className="card" style={{ marginTop: "24px", padding: "24px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2>Ngân hàng câu hỏi</h2>
        <button className="btn" onClick={() => setIsAdding(!isAdding)}>+ Thêm câu hỏi</button>
      </header>

      {isAdding && (
        <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px", padding: "16px", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label>Loại câu hỏi</label>
              <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="single_choice">Một đáp án đúng</option>
                <option value="true_false">Đúng / Sai</option>
                <option value="short_answer">Trả lời ngắn</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Mức độ</label>
              <select className="form-input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="nhan_biet">Nhận biết</option>
                <option value="thong_hieu">Thông hiểu</option>
                <option value="van_dung">Vận dụng</option>
                <option value="van_dung_cao">Vận dụng cao</option>
              </select>
            </div>
          </div>
          <div>
            <label>Nội dung câu hỏi</label>
            <textarea className="form-input" required value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          </div>
          {type === "single_choice" && (
            <div>
              <label>Các lựa chọn</label>
              {options.map((opt, i) => (
                <input key={i} className="form-input" style={{ marginBottom: "8px" }} placeholder={`Lựa chọn ${i + 1}`} value={opt} onChange={(e) => {
                  const newOpts = [...options];
                  newOpts[i] = e.target.value;
                  setOptions(newOpts);
                }} />
              ))}
            </div>
          )}
          <div>
            <label>Đáp án đúng</label>
            <input className="form-input" required value={answer} onChange={(e) => setAnswer(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "12px" }}>
            <button type="button" className="btn" onClick={() => setIsAdding(false)}>Hủy</button>
            <button type="submit" className="btn primary" disabled={saving}>Lưu câu hỏi</button>
          </div>
        </form>
      )}

      {questions.length === 0 && !isAdding ? (
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>Chưa có câu hỏi trong ngân hàng.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {questions.map((q, i) => (
            <div key={q.id} style={{ padding: "16px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-page)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
                <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>Câu {i + 1}</strong>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "100px", backgroundColor: "var(--bg-surface-elevated)", color: "var(--text-secondary)" }}>{q.difficulty}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "100px", backgroundColor: "var(--bg-surface-elevated)", color: "var(--text-secondary)" }}>{q.question_type}</span>
                </div>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: "14px", color: "var(--text-primary)" }}>{q.content.prompt}</p>
              <div style={{ backgroundColor: "var(--bg-surface)", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
                <strong style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>ĐÁP ÁN ĐÚNG</strong>
                <p style={{ margin: 0, color: "var(--semantic-success)", fontSize: "14px", fontWeight: 500 }}>{q.content.correctAnswer}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
