"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export type ColabMaterial = {
  id: string;
  title: string;
  description: string | null;
  content_url: string;
  instructions: string | null;
  is_published: boolean;
};

export function ColabMaterialManager({ lessonId, phase, materials, hideHeader }: { lessonId: string; phase: "before_class" | "in_class"; materials: ColabMaterial[]; hideHeader?: boolean }) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const handleOpen = () => setIsAdding(true);
    window.addEventListener("open-colab-form", handleOpen);
    return () => window.removeEventListener("open-colab-form", handleOpen);
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !url) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Vui lòng đăng nhập lại.");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("lesson_materials").insert({
      lesson_id: lessonId,
      teacher_id: user.id,
      phase,
      material_type: "worksheet", // use worksheet for colab
      title,
      content_url: url,
      description,
      is_published: false
    });
    setSaving(false);
    if (!error) {
      setIsAdding(false);
      window.location.reload();
    } else {
      alert("Không thể thêm Colab: " + error.message);
    }
  }

  return (
    <section className="card" style={{ marginTop: hideHeader ? "0" : "24px", padding: hideHeader ? "0" : "24px", border: hideHeader ? "none" : undefined, boxShadow: hideHeader ? "none" : undefined }}>
      {!hideHeader && <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2>Google Colab & Hướng dẫn</h2>
        <button className="btn" onClick={() => setIsAdding(!isAdding)}>+ Thêm Colab</button>
      </header>}

      {isAdding && (
        <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px", padding: "16px", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "var(--radius-md)" }}>
          <div><label>Tiêu đề</label><input className="form-input" required value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><label>Link Colab</label><input className="form-input" required type="url" value={url} onChange={(e) => setUrl(e.target.value)} /></div>
          <div><label>Mô tả / Hướng dẫn</label><textarea className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button type="button" className="btn" onClick={() => setIsAdding(false)}>Hủy</button>
            <button type="submit" className="btn primary" disabled={saving}>Lưu nháp</button>
          </div>
        </form>
      )}

      {materials.length === 0 && !isAdding ? (
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>Chưa có hoạt động Colab nào.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {materials.map((m) => (
            <article className="material-item-row" key={m.id} style={{ display: "flex", alignItems: "flex-start", padding: "16px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-surface)", gap: "16px", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", backgroundColor: "var(--color-primary-soft)", color: "var(--color-primary)", borderRadius: "var(--radius-sm)", flexShrink: 0, fontSize: "18px", fontWeight: 700 }}>C</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <h4 style={{ margin: 0, fontSize: "15px", color: "var(--text-primary)" }}>{m.title}</h4>
                  <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "100px", backgroundColor: m.is_published ? "var(--bg-surface-elevated)" : "rgba(239, 68, 68, 0.1)", color: m.is_published ? "var(--text-secondary)" : "var(--semantic-danger)" }}>{m.is_published ? "Đã xuất bản" : "Bản nháp"}</span>
                </div>
                <p style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--text-secondary)" }}>{m.description || "Chưa có mô tả."}</p>
                <div style={{ fontSize: "13px", backgroundColor: "var(--bg-page)", padding: "8px 12px", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)" }}><strong>Link:</strong> <a href={m.content_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)" }}>{m.content_url}</a></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <a href={m.content_url} target="_blank" rel="noopener noreferrer" className="btn">Mở Colab ↗</a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
