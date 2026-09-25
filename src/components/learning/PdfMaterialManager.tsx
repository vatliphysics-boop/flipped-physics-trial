"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type PdfMaterial = {
  id: string;
  title: string;
  description: string | null;
  content_url: string;
  is_published: boolean;
};

export function PdfMaterialManager({ lessonId, materials }: { lessonId: string; materials: PdfMaterial[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !file) return;
    setSaving(true);
    setError("");

    try {
      // Ensure user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Vui lòng đăng nhập lại.");

      // Upload file
      const path = `pdfs/${user.id}/${lessonId}/pdf-${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
      const { error: uploadError } = await supabase.storage.from("lesson-materials").upload(path, file, { contentType: file.type });
      
      if (uploadError) throw uploadError;

      // Create record
      const { error: insertError } = await supabase.from("lesson_materials").insert({
        lesson_id: lessonId,
        teacher_id: user.id,
        phase: "after_class",
        material_type: "worksheet", // use worksheet since pdf might not be in constraint yet, though we added it in migration, worksheet is safer
        title,
        content_url: `storage:lesson-materials/${path}`,
        description,
        is_published: false
      });

      if (insertError) throw insertError;
      
      setIsAdding(false);
      window.location.reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải PDF lên.");
      setSaving(false);
    }
  }

  return (
    <section className="card" style={{ marginTop: "24px", padding: "24px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <span className="teacher-panel-kicker">TÀI LIỆU BÀI TẬP</span>
          <h2>Bài tập / Nhiệm vụ</h2>
        </div>
        <button className="btn primary" onClick={() => setIsAdding(!isAdding)}>+ Upload PDF</button>
      </header>

      {isAdding && (
        <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px", padding: "16px", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "var(--radius-md)" }}>
          <div><label>Tiêu đề</label><input className="form-input" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Phiếu bài tập B21" /></div>
          <div><label>Mô tả / Hướng dẫn</label><textarea className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div>
            <label>File PDF</label>
            <input type="file" accept="application/pdf" className="form-input" required onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          {error && <p className="form-alert form-alert-error">{error}</p>}
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button type="button" className="btn" onClick={() => setIsAdding(false)}>Hủy</button>
            <button type="submit" className="btn primary" disabled={saving}>{saving ? "Đang tải lên..." : "Lưu nháp"}</button>
          </div>
        </form>
      )}

      {materials.length === 0 && !isAdding ? (
        <p style={{ color: "var(--text-muted)" }}>Chưa có tài liệu bài tập.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {materials.map((m) => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 600 }}>{m.title}</h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{m.description}</p>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span className={`badge ${m.is_published ? "badge-success" : ""}`}>{m.is_published ? "Đã xuất bản" : "Nháp"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
