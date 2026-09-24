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
    const { error } = await supabase.from("lesson_materials").insert({
      lesson_id: lessonId,
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
        <p style={{ color: "var(--text-muted)" }}>Chưa có hoạt động Colab nào.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {materials.map((m) => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 600 }}>{m.title}</h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{m.content_url}</p>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span className={`badge ${m.is_published ? "badge-success" : ""}`}>{m.is_published ? "Đã xuất bản" : "Nháp"}</span>
                <a href={m.content_url} target="_blank" rel="noopener noreferrer" className="btn">Mở Colab ↗</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
