"use client";

import { useState, useTransition } from "react";
import type { MaterialItem, PathwayStep } from "@/lib/material-bank";
import { CANONICAL_SYSTEM_MATERIALS } from "@/lib/material-bank";
import { FixedPhysicsActivityRenderer } from "@/components/physics/FixedPhysicsActivityRenderer";
import type { CanonicalActivityKey } from "@/lib/curriculum";
import {
  addPathwayStepAction,
  deletePathwayStepAction,
  reorderPathwayStepsAction,
} from "@/app/teacher/pathway-actions";

export function PathwayStepManager({
  lessonId,
  phase,
  steps,
  availableMaterials = [],
  lessonCode,
}: {
  lessonId: string;
  phase: "before_class" | "in_class" | "after_class";
  steps: PathwayStep[];
  availableMaterials?: MaterialItem[];
  lessonCode?: string;
}) {
  const [currentSteps, setCurrentSteps] = useState<PathwayStep[]>(steps);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);
  const [stepTitle, setStepTitle] = useState("");
  const [stepInstructions, setStepInstructions] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [pickerFilterType, setPickerFilterType] = useState<string>("all");
  const [pickerSearch, setPickerSearch] = useState("");
  const [previewItem, setPreviewItem] = useState<MaterialItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState("");

  // All materials available to choose from: combine passed ones with canonical system materials
  const allChoicesMap = new Map<string, MaterialItem>();
  for (const m of CANONICAL_SYSTEM_MATERIALS) allChoicesMap.set(m.id, m);
  for (const m of availableMaterials) allChoicesMap.set(m.id, m);
  const allChoices = Array.from(allChoicesMap.values());

  const filteredChoices = allChoices.filter((m) => {
    const matchesType = pickerFilterType === "all" || m.material_type === pickerFilterType;
    const matchesSearch =
      !pickerSearch.trim() ||
      m.title.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      m.description?.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      m.lesson_tag?.toLowerCase().includes(pickerSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  const phaseTitle =
    phase === "before_class"
      ? "Pha 1 · Trước giờ học (Chuẩn bị kiến thức)"
      : phase === "in_class"
      ? "Pha 2 · Trong giờ học (Khám phá & Thảo luận)"
      : "Pha 3 · Sau giờ học (Củng cố & Đánh giá)";

  function handleOpenPicker() {
    setIsPickerOpen(true);
    setSelectedMaterial(null);
    setActionError("");
    // Default filter to lesson tag if provided
    if (lessonCode) {
      setPickerSearch(lessonCode);
    }
  }

  function handleSelectMaterial(m: MaterialItem) {
    setSelectedMaterial(m);
    setStepTitle(m.title);
    setStepInstructions(m.description || "");
    setIsRequired(true);
  }

  function handleAddStep(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMaterial || !stepTitle.trim()) return;

    startTransition(async () => {
      const fd = new FormData();
      fd.append("lesson_id", lessonId);
      fd.append("phase", phase);
      fd.append("material_id", selectedMaterial.id);
      fd.append("title", stepTitle.trim());
      fd.append("instructions", stepInstructions.trim());
      fd.append("step_type", selectedMaterial.material_type);
      fd.append("is_required", isRequired ? "true" : "false");
      fd.append("content_url", selectedMaterial.content_url);

      const res = await addPathwayStepAction({}, fd);
      if (res.error) {
        setActionError(res.error);
      } else {
        const newStep: PathwayStep = {
          id: res.stepId || `step-${Date.now()}`,
          lesson_id: lessonId,
          phase,
          material_id: selectedMaterial.id,
          title: stepTitle.trim(),
          instructions: stepInstructions.trim(),
          step_order: currentSteps.length + 1,
          is_required: isRequired,
          step_type: selectedMaterial.material_type,
          material: selectedMaterial,
        };
        setCurrentSteps((prev) => [...prev, newStep]);
        setIsPickerOpen(false);
        setSelectedMaterial(null);
        setActionError("");
      }
    });
  }

  function handleDeleteStep(stepId: string) {
    if (!confirm("Xóa bước này khỏi tiến trình bài học?")) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("step_id", stepId);
      fd.append("lesson_id", lessonId);
      fd.append("phase", phase);
      const res = await deletePathwayStepAction({}, fd);
      if (res.error) {
        setActionError(res.error);
      } else {
        setCurrentSteps((prev) => prev.filter((s) => s.id !== stepId));
      }
    });
  }

  function handleReorder(stepId: string, direction: "up" | "down") {
    const idx = currentSteps.findIndex((s) => s.id === stepId);
    if (idx === -1) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentSteps.length) return;

    const copy = [...currentSteps];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setCurrentSteps(copy);

    startTransition(async () => {
      const fd = new FormData();
      fd.append("lesson_id", lessonId);
      fd.append("step_id", stepId);
      fd.append("direction", direction);
      fd.append("phase", phase);
      await reorderPathwayStepsAction({}, fd);
    });
  }

  return (
    <div className="pathway-step-manager" style={{ marginTop: "24px", marginBottom: "32px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h3 style={{ fontSize: "18px", margin: "0 0 4px" }}>Tiến trình học tập: {phaseTitle}</h3>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "14px" }}>
            Các bước nhiệm vụ học sinh sẽ thực hiện tuần tự trong pha này.
          </p>
        </div>
        <button type="button" className="btn primary small" onClick={handleOpenPicker}>
          + Chọn từ kho học liệu
        </button>
      </div>

      {actionError && (
        <div role="alert" className="form-alert form-alert-error" style={{ marginBottom: "16px" }}>
          {actionError}
        </div>
      )}

      {/* Steps List */}
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        {currentSteps.length === 0 ? (
          <div style={{ padding: "36px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <p style={{ margin: "0 0 12px" }}>Chưa có bước nào trong tiến trình {phaseTitle}.</p>
            <button type="button" className="btn small primary" onClick={handleOpenPicker}>
              + Thêm bước đầu tiên từ kho học liệu
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {currentSteps.map((step, idx) => (
              <div
                key={step.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  borderBottom: idx < currentSteps.length - 1 ? "1px solid var(--border-light)" : "none",
                  backgroundColor: idx % 2 === 0 ? "transparent" : "var(--bg-surface-elevated)",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", flex: 1 }}>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-primary-soft)",
                      color: "var(--color-primary)",
                      fontWeight: 600,
                      fontSize: "13px",
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <strong style={{ fontSize: "15px" }}>{step.title}</strong>
                      <span className="badge small">{step.step_type}</span>
                      {step.is_required ? (
                        <span className="badge small badge-blue">Bắt buộc</span>
                      ) : (
                        <span className="badge small" style={{ color: "var(--text-muted)" }}>Tự chọn</span>
                      )}
                    </div>
                    {step.instructions && (
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                        {step.instructions}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn small"
                    disabled={idx === 0 || isPending}
                    onClick={() => handleReorder(step.id, "up")}
                    title="Di chuyển lên"
                    style={{ padding: "4px 8px" }}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="btn small"
                    disabled={idx === currentSteps.length - 1 || isPending}
                    onClick={() => handleReorder(step.id, "down")}
                    title="Di chuyển xuống"
                    style={{ padding: "4px 8px" }}
                  >
                    ▼
                  </button>
                  {step.material && (
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => setPreviewItem(step.material!)}
                      style={{ padding: "4px 10px", fontSize: "13px" }}
                    >
                      Xem
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn small danger"
                    disabled={isPending}
                    onClick={() => handleDeleteStep(step.id)}
                    style={{ padding: "4px 10px", fontSize: "13px" }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Pick Material From Bank */}
      {isPickerOpen && (
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
          onClick={() => setIsPickerOpen(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              backgroundColor: "var(--bg-surface)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "18px" }}>Chọn học liệu cho {phaseTitle}</h3>
                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "13px" }}>
                  Chọn một học liệu từ kho để thêm thành bước học tập cho học sinh.
                </p>
              </div>
              <button type="button" className="icon-button" onClick={() => setIsPickerOpen(false)}>✕</button>
            </div>

            {!selectedMaterial ? (
              <>
                {/* Search & Filter */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
                  <input
                    type="search"
                    placeholder="Tìm theo tên học liệu, bài B21–B25..."
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: "220px",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-light)",
                    }}
                  />
                  <select
                    value={pickerFilterType}
                    onChange={(e) => setPickerFilterType(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}
                  >
                    <option value="all">Tất cả loại học liệu</option>
                    <option value="simulation">Mô phỏng tương tác</option>
                    <option value="lecture_video">Video bài giảng</option>
                    <option value="real_video">Video thực tế</option>
                    <option value="image">Ảnh tĩnh & Sơ đồ</option>
                    <option value="animation">Ảnh động (GIF)</option>
                    <option value="document">PDF / Phiếu học tập</option>
                    <option value="colab">Google Colab</option>
                  </select>
                </div>

                {/* List of choices */}
                <div style={{ maxHeight: "420px", overflowY: "auto", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}>
                  {filteredChoices.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid var(--border-light)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                          <strong>{item.title}</strong>
                          <span className="badge small">{item.material_type}</span>
                          {item.lesson_tag && <span className="badge small">{item.lesson_tag}</span>}
                        </div>
                        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
                          {item.description}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className="btn small"
                          onClick={() => setPreviewItem(item)}
                        >
                          Xem
                        </button>
                        <button
                          type="button"
                          className="btn small primary"
                          onClick={() => handleSelectMaterial(item)}
                        >
                          Chọn học liệu này →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Step Configuration Form */
              <form onSubmit={handleAddStep}>
                <div style={{ padding: "12px", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "var(--radius-sm)", marginBottom: "16px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Học liệu đã chọn:</span>
                  <p style={{ margin: "4px 0 0", fontWeight: 600 }}>{selectedMaterial.title}</p>
                  <button
                    type="button"
                    className="btn small"
                    style={{ marginTop: "8px", fontSize: "12px" }}
                    onClick={() => setSelectedMaterial(null)}
                  >
                    ← Chọn học liệu khác
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label htmlFor="step-title" style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>
                      Tên bước nhiệm vụ hiển thị cho học sinh *
                    </label>
                    <input
                      id="step-title"
                      value={stepTitle}
                      onChange={(e) => setStepTitle(e.target.value)}
                      required
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}
                    />
                  </div>

                  <div>
                    <label htmlFor="step-instructions" style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>
                      Mục tiêu & Hướng dẫn học sinh thực hiện
                    </label>
                    <textarea
                      id="step-instructions"
                      value={stepInstructions}
                      onChange={(e) => setStepInstructions(e.target.value)}
                      rows={3}
                      placeholder="VD: Em hãy quan sát hạt alpha bị lệch hướng khi đi qua gần hạt nhân, ghi lại nhận xét..."
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      id="step-required"
                      checked={isRequired}
                      onChange={(e) => setIsRequired(e.target.checked)}
                    />
                    <label htmlFor="step-required" style={{ fontSize: "13px" }}>
                      Bắt buộc hoàn thành (học sinh phải hoàn thành bước này mới mở khóa câu hỏi chốt pha)
                    </label>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                    <button type="button" className="btn" onClick={() => setSelectedMaterial(null)}>
                      Quay lại
                    </button>
                    <button type="submit" className="btn primary" disabled={isPending}>
                      {isPending ? "Đang lưu..." : "Xác nhận thêm vào tiến trình"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Preview */}
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
            zIndex: 110,
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
              maxWidth: "850px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              backgroundColor: "var(--bg-surface)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px" }}>Xem trước: {previewItem.title}</h3>
              <button type="button" className="icon-button" onClick={() => setPreviewItem(null)}>✕</button>
            </div>
            <div style={{ minHeight: "220px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", padding: "16px" }}>
              {previewItem.material_type === "simulation" && previewItem.metadata?.activityKey ? (
                <FixedPhysicsActivityRenderer activityKey={previewItem.metadata.activityKey as CanonicalActivityKey} />
              ) : (
                <p style={{ textAlign: "center", color: "var(--text-muted)" }}>Học liệu: {previewItem.content_url}</p>
              )}
            </div>
            <div style={{ marginTop: "16px", textAlign: "right" }}>
              <button type="button" className="btn" onClick={() => setPreviewItem(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
