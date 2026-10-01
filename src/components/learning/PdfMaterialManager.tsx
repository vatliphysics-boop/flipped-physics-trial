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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleDelete(id: string, url: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu PDF này không?")) return;
    setDeletingId(id);
    
    if (url.startsWith("storage:")) {
      const path = url.replace("storage:lesson-materials/", "");
      await supabase.storage.from("lesson-materials").remove([path]);
    }
    
    const { error: deleteError } = await supabase.from("lesson_materials").delete().eq("id", id).eq("lesson_id", lessonId);
    if (deleteError) {
      alert("Lỗi khi xóa: " + deleteError.message);
      setDeletingId(null);
    } else {
      window.location.reload();
    }
  }

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
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>Chưa có tài liệu bài tập.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {materials.map((m) => (
            <article className="material-item-row" key={m.id} style={{ display: "flex", alignItems: "flex-start", padding: "16px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-surface)", gap: "16px", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", backgroundColor: "var(--color-primary-soft)", color: "var(--color-primary)", borderRadius: "var(--radius-sm)", flexShrink: 0, fontSize: "18px" }}>📄</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <h4 style={{ margin: 0, fontSize: "15px", color: "var(--text-primary)" }}>{m.title}</h4>
                  <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "100px", backgroundColor: m.is_published ? "var(--bg-surface-elevated)" : "rgba(239, 68, 68, 0.1)", color: m.is_published ? "var(--text-secondary)" : "var(--semantic-danger)" }}>{m.is_published ? "Đã xuất bản" : "Bản nháp"}</span>
                </div>
                {m.description && <p style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--text-secondary)" }}>{m.description}</p>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <button type="button" className="btn danger" disabled={deletingId === m.id} onClick={() => void handleDelete(m.id, m.content_url)}>{deletingId === m.id ? "Đang xóa..." : "Xóa"}</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
