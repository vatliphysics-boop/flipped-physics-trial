"use client";

import { useState, useTransition } from "react";
import type { MaterialItem, MaterialType } from "@/lib/material-bank";
import { FixedPhysicsActivityRenderer } from "@/components/physics/FixedPhysicsActivityRenderer";
import type { CanonicalActivityKey } from "@/lib/curriculum";
import {
  createMaterialItemAction,
  updateMaterialItemAction,
  deleteMaterialItemAction,
} from "@/app/teacher/material-actions";

const TYPE_LABELS: Record<MaterialType, { label: string; badgeClass: string; icon: string }> = {
  image: { label: "Ảnh tĩnh", badgeClass: "badge-blue", icon: "🖼️" },
  animation: { label: "Ảnh động", badgeClass: "badge-purple", icon: "🎞️" },
  real_video: { label: "Video thực tế", badgeClass: "badge-green", icon: "📹" },
  lecture_video: { label: "Video bài giảng", badgeClass: "badge-teal", icon: "🎬" },
  simulation: { label: "Mô phỏng", badgeClass: "badge-orange", icon: "⚛️" },
  document: { label: "PDF / Phiếu", badgeClass: "badge-amber", icon: "📄" },
  colab: { label: "Google Colab", badgeClass: "badge-indigo", icon: "💻" },
};

export function MaterialBankViewer({
  initialMaterials,
  initialType = "all",
  teacherId,
}: {
  initialMaterials: MaterialItem[];
  initialType?: string;
  teacherId: string;
}) {
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [searchQuery, setSearchQuery] = useState("");
  const [materials, setMaterials] = useState<MaterialItem[]>(initialMaterials);
  const [previewItem, setPreviewItem] = useState<MaterialItem | null>(null);
  const [editingItem, setEditingItem] = useState<MaterialItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState("");

  // Filtering
  const filtered = materials.filter((item) => {
    const matchesType = selectedType === "all" || item.material_type === selectedType;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lesson_tag?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="material-bank-container">
      {/* Action Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", margin: "0 0 4px" }}>Kho học liệu số dùng chung</h2>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "14px" }}>
            Học liệu chuẩn hóa SGK và học liệu do giáo viên tạo để sắp xếp vào các bài học B21–B25.
          </p>
        </div>
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            setIsAdding(true);
            setActionError("");
          }}
        >
          + Thêm học liệu vào kho
        </button>
      </div>

      {actionError && (
        <div role="alert" className="form-alert form-alert-error" style={{ marginBottom: "16px" }}>
          {actionError}
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }} role="tablist">
          <button
            type="button"
            className={`btn small ${selectedType === "all" ? "primary" : ""}`}
            onClick={() => setSelectedType("all")}
          >
            Tất cả ({materials.length})
          </button>
          {(Object.keys(TYPE_LABELS) as MaterialType[]).map((type) => {
            const count = materials.filter((m) => m.material_type === type).length;
            return (
              <button
                key={type}
                type="button"
                className={`btn small ${selectedType === type ? "primary" : ""}`}
                onClick={() => setSelectedType(type)}
              >
                {TYPE_LABELS[type].icon} {TYPE_LABELS[type].label} ({count})
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input
            type="search"
            placeholder="Tìm theo tên học liệu, mô tả hoặc bài (B21, B22...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-light)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-primary)",
              fontSize: "14px",
            }}
          />
          <span style={{ fontSize: "13px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
            Hiển thị: <strong>{filtered.length}</strong> học liệu
          </span>
        </div>
      </div>

      {/* Materials List View (Compact, thin borders, generous whitespace) */}
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)" }}>
            <p style={{ margin: "0 0 12px", fontSize: "16px" }}>Không tìm thấy học liệu nào phù hợp.</p>
            <button type="button" className="btn small" onClick={() => { setSelectedType("all"); setSearchQuery(""); }}>
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filtered.map((item, idx) => {
              const typeInfo = TYPE_LABELS[item.material_type] || { label: item.material_type, badgeClass: "badge-gray", icon: "📁" };
              const isOwner = item.teacher_id === teacherId;

              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                    borderBottom: idx < filtered.length - 1 ? "1px solid var(--border-light)" : "none",
                    gap: "16px",
                    backgroundColor: idx % 2 === 0 ? "transparent" : "var(--bg-surface-elevated)",
                  }}
                >
                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", flex: 1 }}>
                    <span style={{ fontSize: "20px", lineHeight: "1.2" }} title={typeInfo.label}>
                      {typeInfo.icon}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                        <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>{item.title}</strong>
                        <span className="badge small" style={{ fontSize: "11px" }}>{typeInfo.label}</span>
                        {item.lesson_tag && (
                          <span className="badge small" style={{ fontSize: "11px", backgroundColor: "var(--color-primary-soft)", color: "var(--color-primary)" }}>
                            {item.lesson_tag}
                          </span>
                        )}
                        {item.is_system ? (
                          <span className="badge small" style={{ fontSize: "11px", backgroundColor: "var(--border-light)", color: "var(--text-muted)" }}>
                            Chuẩn hóa SGK
                          </span>
                        ) : item.is_published ? (
                          <span className="badge small badge-green" style={{ fontSize: "11px" }}>Đã xuất bản</span>
                        ) : (
                          <span className="badge small" style={{ fontSize: "11px", color: "var(--text-muted)" }}>Bản nháp</span>
                        )}
                      </div>
                      <p style={{ margin: "0 0 4px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                        {item.description}
                      </p>
                      {item.metadata?.sourceBook && (
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          Nguồn: {item.metadata.sourceBook}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexShrink: 0, alignItems: "center" }}>
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => setPreviewItem(item)}
                      style={{ padding: "6px 12px", fontSize: "13px" }}
                    >
                      Xem trước
                    </button>

                    {isOwner && !item.is_system && (
                      <>
                        <button
                          type="button"
                          className="btn small"
                          onClick={() => setEditingItem(item)}
                          style={{ padding: "6px 12px", fontSize: "13px" }}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="btn small danger"
                          disabled={isPending}
                          onClick={() => {
                            if (!confirm(`Xóa học liệu "${item.title}" khỏi kho?`)) return;
                            startTransition(async () => {
                              const fd = new FormData();
                              fd.append("id", item.id);
                              const res = await deleteMaterialItemAction({}, fd);
                              if (res.error) setActionError(res.error);
                              else {
                                setMaterials((prev) => prev.filter((m) => m.id !== item.id));
                              }
                            });
                          }}
                          style={{ padding: "6px 10px", fontSize: "13px" }}
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Preview Material */}
      {previewItem && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: "900px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              backgroundColor: "var(--bg-surface)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <span className="badge small" style={{ marginBottom: "6px" }}>
                  {TYPE_LABELS[previewItem.material_type]?.label || previewItem.material_type}
                </span>
                <h3 style={{ margin: "4px 0", fontSize: "20px" }}>{previewItem.title}</h3>
                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "14px" }}>{previewItem.description}</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setPreviewItem(null)}
                style={{ fontSize: "18px", padding: "4px 8px" }}
              >
                ✕
              </button>
            </div>

            {/* Dynamic Preview Content */}
            <div style={{ minHeight: "240px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "16px", backgroundColor: "var(--bg-canvas)" }}>
              {previewItem.material_type === "simulation" ? (
                previewItem.metadata?.activityKey ? (
                  <FixedPhysicsActivityRenderer activityKey={previewItem.metadata.activityKey as CanonicalActivityKey} />
                ) : (
                  <p style={{ textAlign: "center", color: "var(--text-muted)" }}>Mô phỏng: {previewItem.content_url}</p>
                )
              ) : previewItem.material_type === "image" || previewItem.material_type === "animation" ? (
                <div style={{ textAlign: "center" }}>
                  {previewItem.content_url.startsWith("http") || previewItem.content_url.startsWith("/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewItem.content_url}
                      alt={previewItem.title}
                      style={{ maxWidth: "100%", maxHeight: "500px", objectFit: "contain", borderRadius: "var(--radius-sm)" }}
                    />
                  ) : (
                    <p style={{ color: "var(--text-muted)" }}>Đường dẫn ảnh: {previewItem.content_url}</p>
                  )}
                </div>
              ) : previewItem.material_type === "lecture_video" || previewItem.material_type === "real_video" ? (
                <div style={{ textAlign: "center" }}>
                  {previewItem.content_url.endsWith(".mp4") || previewItem.content_url.endsWith(".webm") ? (
                    <video controls style={{ width: "100%", maxHeight: "450px" }} src={previewItem.content_url}>
                      Trình duyệt không hỗ trợ phát video.
                    </video>
                  ) : (
                    <div>
                      <p style={{ color: "var(--text-secondary)", marginBottom: "12px" }}>Video URL: {previewItem.content_url}</p>
                      <a href={previewItem.content_url} target="_blank" rel="noopener noreferrer" className="btn primary">
                        Mở video trên tab mới ↗
                      </a>
                    </div>
                  )}
                </div>
              ) : previewItem.material_type === "document" ? (
                <div style={{ textAlign: "center", padding: "32px 16px" }}>
                  <p style={{ fontSize: "16px", marginBottom: "16px" }}>Tài liệu / Phiếu học tập chuẩn</p>
                  <a href={previewItem.content_url} target="_blank" rel="noopener noreferrer" className="btn primary">
                    Mở tệp PDF / Tài liệu ({previewItem.content_url}) ↗
                  </a>
                </div>
              ) : previewItem.material_type === "colab" ? (
                <div style={{ textAlign: "center", padding: "32px 16px" }}>
                  <p style={{ fontSize: "16px", marginBottom: "16px" }}>Google Colab Notebook tương tác</p>
                  <a href={previewItem.content_url} target="_blank" rel="noopener noreferrer" className="btn primary">
                    Mở Google Colab ↗
                  </a>
                </div>
              ) : null}
            </div>

            <div style={{ marginTop: "16px", textAlign: "right" }}>
              <button type="button" className="btn" onClick={() => setPreviewItem(null)}>
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Material */}
      {isAdding && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setIsAdding(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: "600px",
              width: "100%",
              padding: "24px",
              backgroundColor: "var(--bg-surface)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px" }}>Thêm học liệu mới vào kho</h3>
              <button type="button" className="icon-button" onClick={() => setIsAdding(false)}>✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const fd = new FormData(form);
                startTransition(async () => {
                  const res = await createMaterialItemAction({}, fd);
                  if (res.error) {
                    setActionError(res.error);
                  } else {
                    const newItem: MaterialItem = {
                      id: res.materialId || `user-${Date.now()}`,
                      teacher_id: teacherId,
                      title: fd.get("title") as string,
                      description: (fd.get("description") as string) || "",
                      material_type: fd.get("material_type") as MaterialType,
                      category: (fd.get("category") as MaterialItem["category"]) || "nuclear_physics",
                      lesson_tag: (fd.get("lesson_tag") as string) || null,
                      content_url: fd.get("content_url") as string,
                      is_published: fd.get("is_published") === "true",
                      is_system: false,
                      created_at: new Date().toISOString(),
                    };
                    setMaterials((prev) => [newItem, ...prev]);
                    setIsAdding(false);
                    setActionError("");
                  }
                });
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label htmlFor="title" style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>
                    Tiêu đề học liệu *
                  </label>
                  <input
                    id="title"
                    name="title"
                    required
                    placeholder="VD: Video thí nghiệm buồng sương Wilson"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label htmlFor="material_type" style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>
                      Loại học liệu *
                    </label>
                    <select
                      id="material_type"
                      name="material_type"
                      required
                      defaultValue="image"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}
                    >
                      <option value="image">Ảnh tĩnh / Sơ đồ / Infographic</option>
                      <option value="animation">Ảnh động (GIF / Loop)</option>
                      <option value="real_video">Video thực tế / Hiện tượng</option>
                      <option value="lecture_video">Video bài giảng lý thuyết</option>
                      <option value="simulation">Mô phỏng tương tác</option>
                      <option value="document">PDF / Phiếu học tập</option>
                      <option value="colab">Google Colab Notebook</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="lesson_tag" style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>
                      Gắn bài (tùy chọn)
                    </label>
                    <select
                      id="lesson_tag"
                      name="lesson_tag"
                      defaultValue=""
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}
                    >
                      <option value="">-- Dùng chung --</option>
                      <option value="B21">Bài 21: Cấu trúc hạt nhân</option>
                      <option value="B22">Bài 22: Phản ứng hạt nhân</option>
                      <option value="B23">Bài 23: Hiện tượng phóng xạ</option>
                      <option value="B24">Bài 24: Công nghiệp hạt nhân</option>
                      <option value="B25">Bài 25: Bài tập vật lí hạt nhân</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="content_url" style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>
                    Đường dẫn tệp / Liên kết / Tên thành phần *
                  </label>
                  <input
                    id="content_url"
                    name="content_url"
                    required
                    placeholder="https://... hoặc /illustrations/... hoặc storage path"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}
                  />
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                    Hỗ trợ liên kết URL web trực tiếp, file PDF, ảnh, video, hoặc notebook Colab.
                  </p>
                </div>

                <div>
                  <label htmlFor="description" style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>
                    Mô tả & Hướng dẫn học tập
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="Mô tả nội dung khoa học, yêu cầu học sinh quan sát điểm gì..."
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input type="checkbox" id="is_published" name="is_published" value="true" defaultChecked />
                  <label htmlFor="is_published" style={{ fontSize: "13px" }}>
                    Duyệt và xuất bản ngay để giáo viên có thể xếp vào bài học
                  </label>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                  <button type="button" className="btn" onClick={() => setIsAdding(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn primary" disabled={isPending}>
                    {isPending ? "Đang lưu..." : "Lưu vào kho"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Material */}
      {editingItem && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setEditingItem(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: "550px",
              width: "100%",
              padding: "24px",
              backgroundColor: "var(--bg-surface)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px" }}>Chỉnh sửa thông tin học liệu</h3>
              <button type="button" className="icon-button" onClick={() => setEditingItem(null)}>✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const fd = new FormData(form);
                startTransition(async () => {
                  const res = await updateMaterialItemAction({}, fd);
                  if (res.error) {
                    setActionError(res.error);
                  } else {
                    setMaterials((prev) =>
                      prev.map((m) =>
                        m.id === editingItem.id
                          ? {
                              ...m,
                              title: fd.get("title") as string,
                              description: (fd.get("description") as string) || "",
                              is_published: fd.get("is_published") === "true",
                            }
                          : m
                      )
                    );
                    setEditingItem(null);
                    setActionError("");
                  }
                });
              }}
            >
              <input type="hidden" name="id" value={editingItem.id} />
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label htmlFor="edit-title" style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>
                    Tiêu đề *
                  </label>
                  <input
                    id="edit-title"
                    name="title"
                    defaultValue={editingItem.title}
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}
                  />
                </div>

                <div>
                  <label htmlFor="edit-description" style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>
                    Mô tả
                  </label>
                  <textarea
                    id="edit-description"
                    name="description"
                    defaultValue={editingItem.description}
                    rows={3}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    id="edit-is_published"
                    name="is_published"
                    value="true"
                    defaultChecked={editingItem.is_published}
                  />
                  <label htmlFor="edit-is_published" style={{ fontSize: "13px" }}>
                    Xuất bản (học sinh có thể thấy khi được gán vào bài học)
                  </label>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                  <button type="button" className="btn" onClick={() => setEditingItem(null)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn primary" disabled={isPending}>
                    {isPending ? "Đang lưu..." : "Cập nhật"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
