"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type FinalQuestion = {
  id: string;
  question_text: string;
  correct_answer: string;
};

export function PhaseFinalQuestionsManager({ lessonId, phase, questions }: { lessonId: string; phase: "before_class" | "in_class"; questions: FinalQuestion[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [qText, setQText] = useState("");
  const [qAns, setQAns] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  function openEdit(q: FinalQuestion) {
    setQText(q.question_text);
    setQAns(q.correct_answer);
    setEditingId(q.id);
    setIsAdding(false);
  }

  function resetForm() {
    setQText("");
    setQAns("");
    setEditingId(null);
    setIsAdding(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!qText || !qAns) return alert("Phải nhập đầy đủ câu hỏi và đáp án.");
    setSaving(true);
    
    if (editingId) {
      const { error } = await supabase.from("phase_final_questions").update({
        question_text: qText,
        correct_answer: qAns
      }).eq("id", editingId).eq("lesson_id", lessonId);
      if (error) alert("Lỗi khi sửa: " + error.message);
      else window.location.reload();
    } else {
      const { error } = await supabase.from("phase_final_questions").insert({
        lesson_id: lessonId,
        phase,
        question_text: qText,
        correct_answer: qAns,
        sort_order: questions.length + 1
      });
      if (error) alert("Lỗi khi thêm: " + error.message);
      else window.location.reload();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này không?")) return;
    setDeletingId(id);
    const { error } = await supabase.from("phase_final_questions").delete().eq("id", id).eq("lesson_id", lessonId);
    if (error) {
      alert("Lỗi khi xóa: " + error.message);
      setDeletingId(null);
    } else {
      window.location.reload();
    }
  }

  return (
    <section className="card" style={{ marginTop: "24px", padding: "24px", border: "1px solid var(--border-light)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h2>Câu hỏi cuối giai đoạn</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>Cấu hình chính xác 2 câu hỏi để học sinh làm sau khi hoàn thành học liệu.</p>
        </div>
        {questions.length < 2 && !isAdding && (
          <button className="btn primary" onClick={() => setIsAdding(true)}>+ Thêm câu hỏi</button>
        )}
      </header>

      {questions.length < 2 && (
        <div style={{ backgroundColor: "#FEF2F2", color: "var(--semantic-danger)", padding: "12px", borderRadius: "var(--radius-sm)", marginBottom: "16px", fontSize: "14px", fontWeight: 500 }}>
          ⚠️ Còn {questions.length}/2 câu – cần bổ sung trước khi học sinh làm.
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px", padding: "16px", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "var(--radius-md)" }}>
          <div><label>Nội dung câu hỏi</label><input className="form-input" required value={qText} onChange={(e) => setQText(e.target.value)} /></div>
          <div><label>Đáp án đúng</label><input className="form-input" required value={qAns} onChange={(e) => setQAns(e.target.value)} /></div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button type="button" className="btn" onClick={resetForm}>Hủy</button>
            <button type="submit" className="btn primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</button>
          </div>
        </form>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {questions.map((q, i) => (
          editingId === q.id ? (
            <form key={q.id} onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "var(--radius-md)" }}>
              <div><label>Nội dung câu hỏi</label><input className="form-input" required value={qText} onChange={(e) => setQText(e.target.value)} /></div>
              <div><label>Đáp án đúng</label><input className="form-input" required value={qAns} onChange={(e) => setQAns(e.target.value)} /></div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button type="button" className="btn" onClick={resetForm}>Hủy</button>
                <button type="submit" className="btn primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
              </div>
            </form>
          ) : (
            <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-surface)" }}>
              <div style={{ flex: 1, paddingRight: "16px" }}>
                <strong style={{ display: "block", marginBottom: "8px", color: "var(--text-primary)" }}>Câu {i + 1}</strong>
                <p style={{ margin: "0 0 8px", fontSize: "14px" }}>{q.question_text}</p>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  <span style={{ color: "var(--semantic-success)", fontWeight: 500 }}>ĐÁP ÁN:</span> {q.correct_answer}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" className="btn" onClick={() => openEdit(q)}>Sửa</button>
                <button type="button" className="btn danger" disabled={deletingId === q.id} onClick={() => void handleDelete(q.id)}>{deletingId === q.id ? "Đang xóa..." : "Xóa"}</button>
              </div>
            </div>
          )
        ))}
      </div>
    </section>
  );
}
