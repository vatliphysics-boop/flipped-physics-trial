"use client";

import { useState, useTransition } from "react";
import type { MaterialItem, PathwayStep } from "@/lib/material-bank";
import { CANONICAL_SYSTEM_MATERIALS, resolvePathwayStepMaterial } from "@/lib/material-bank";
import { LearningResourcePreview } from "./LearningResourcePreview";
import { PathwayStepEditorModal } from "./PathwayStepEditorModal";
import { RichPhysicsText, getVietnameseStepTypeLabel } from "./RichPhysicsText";
import {
  addPathwayStepAction,
  deletePathwayStepAction,
  reorderPathwayStepsAction,
  setPathwayStepPublishedAction,
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
  const [previewTarget, setPreviewTarget] = useState<{ material: MaterialItem; step?: PathwayStep } | null>(null);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [editingStep, setEditingStep] = useState<PathwayStep | null>(null);
  const [previewInteracted, setPreviewInteracted] = useState(false);
  const [trialResponse, setTrialResponse] = useState("");
  const [trialChecked, setTrialChecked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState("");

  // All materials available to choose from: combine passed ones with canonical system materials
  const allChoicesMap = new Map<string, MaterialItem>();
  for (const m of CANONICAL_SYSTEM_MATERIALS) allChoicesMap.set(m.id, m);
  for (const m of availableMaterials) allChoicesMap.set(m.id, m);
  const allChoices = Array.from(allChoicesMap.values());

  function resolveStepMaterial(step: PathwayStep): MaterialItem {
    const cfg = (step.config && typeof step.config === "object" ? step.config : {}) as Record<string, unknown>;
    const canonicalId = typeof cfg.canonical_material_id === "string" ? cfg.canonical_material_id : null;
    const fromMap =
      (canonicalId ? allChoicesMap.get(canonicalId) : undefined) ??
      (step.material_id ? allChoicesMap.get(step.material_id) : undefined);
    const resolved = step.material ?? fromMap ?? resolvePathwayStepMaterial({
      id: step.id,
      material_id: step.material_id,
      title: step.title,
      instructions: step.instructions,
      step_type: step.step_type,
      is_published: step.is_published,
      config: step.config,
      material_bank: step.material,
    });
    return {
      ...resolved,
      lesson_tag: resolved.lesson_tag || fromMap?.lesson_tag || lessonCode,
      metadata: {
        ...(fromMap?.metadata ?? {}),
        ...(resolved.metadata ?? {}),
      },
    };
  }

  function openPreview(target: { material: MaterialItem; step?: PathwayStep }) {
    setPreviewInteracted(false);
    setTrialResponse("");
    setTrialChecked(false);
    setPreviewTarget(target);
  }

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
    if (isPending || !selectedMaterial || !stepTitle.trim()) return;
    const published = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "publish";

    startTransition(async () => {
      const fd = new FormData();
      fd.append("lesson_id", lessonId);
      fd.append("phase", phase);
      fd.append("material_id", selectedMaterial.id);
      fd.append("title", stepTitle.trim());
      fd.append("instructions", stepInstructions.trim());
      fd.append("step_type", selectedMaterial.material_type);
      fd.append("is_required", isRequired ? "true" : "false");
      fd.append("is_published", published ? "true" : "false");
      fd.append("content_url", selectedMaterial.content_url);

      const res = await addPathwayStepAction({}, fd).catch(() => ({
        error: "Chưa lưu được bước học. Hãy kiểm tra kết nối và thử lại.",
        stepId: undefined,
      }));
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
          is_published: published,
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
            Các bước được giao ngay cho học sinh khi bài học được xuất bản. Học sinh thực hiện theo thứ tự và nộp kết quả từng bước.
          </p>
        </div>
        <button type="button" className="btn primary small" onClick={handleOpenPicker}>
          + Chọn từ kho học liệu
        </button>
      </div>

      {actionError && !isPickerOpen && (
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
                className="pathway-step-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  borderBottom: idx < currentSteps.length - 1 ? "1px solid var(--border-light)" : "none",
                  backgroundColor: idx % 2 === 0 ? "transparent" : "var(--bg-surface-elevated)",
                  gap: "16px",
                  flexWrap: "wrap",
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
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                      <strong style={{ fontSize: "15px" }}>{step.title}</strong>
                      <span className="badge small badge-natural">{step.is_published ? "Đã giao" : "Bản nháp"}</span>
                      {step.is_published !== undefined && <button type="button" className="btn small" disabled={isPending} onClick={() => {
                        setActionError("");
                        startTransition(async () => {
                          const fd = new FormData();
                          fd.set("lesson_id", lessonId); fd.set("step_id", step.id); fd.set("is_published", String(!step.is_published));
                          const result = await setPathwayStepPublishedAction({}, fd);
                          if (result.error) setActionError(result.error);
                          else setCurrentSteps(previous => previous.map(item => item.id === step.id ? { ...item, is_published: !step.is_published } : item));
                        });
                      }}>{step.is_published ? "Chuyển về nháp" : "Giao cho học sinh"}</button>}
                      <span className="badge small badge-natural">{getVietnameseStepTypeLabel(step.step_type)}</span>
                      {step.is_required ? (
                        <span className="badge small badge-blue badge-natural">Bắt buộc</span>
                      ) : (
                        <span className="badge small badge-natural" style={{ color: "var(--text-muted)" }}>Tự chọn</span>
                      )}
                    </div>
                    {step.instructions && (
                      <div className="pathway-step-instructions-preview">
                        <RichPhysicsText content={step.instructions} compact />
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
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
                  <button
                    type="button"
                    className="btn small pathway-edit-btn"
                    onClick={() => setEditingStep(step)}
                    style={{ padding: "4px 10px", fontSize: "13px", fontWeight: 600 }}
                  >
                    ✎ Chỉnh sửa
                  </button>
                  <button
                    type="button"
                    className="btn small pathway-preview-btn"
                    onClick={() => openPreview({ material: resolveStepMaterial(step), step })}
                    style={{ padding: "4px 10px", fontSize: "13px", fontWeight: 600 }}
                  >
                    👁 Xem trước
                  </button>
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
      {isPickerOpen && !previewTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Chọn học liệu cho bước học"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 1000,
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

            {actionError && <p role="alert" className="form-alert form-alert-error">{actionError}</p>}
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
                    <option value="colab">Câu hỏi và hoạt động</option>
                    <option value="assessment">Đề giữa kỳ / Cuối kỳ</option>
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
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: "220px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px", flexWrap: "wrap" }}>
                          <strong>{item.title}</strong>
                          <span className="badge small badge-natural">{getVietnameseStepTypeLabel(item.material_type)}</span>
                          {item.lesson_tag && <span className="badge small badge-natural">{item.lesson_tag}</span>}
                        </div>
                        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
                          {item.description}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="btn small pathway-preview-btn"
                          onClick={() => openPreview({ material: item })}
                        >
                          👁 Xem trước
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
                <div style={{ padding: "12px", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "var(--radius-sm)", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Học liệu đã chọn:</span>
                    <p style={{ margin: "4px 0 0", fontWeight: 600 }}>{selectedMaterial.title}</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="btn small pathway-preview-btn"
                      onClick={() =>
                        openPreview({
                          material: selectedMaterial,
                          step: {
                            id: "draft-preview",
                            lesson_id: lessonId,
                            phase,
                            material_id: selectedMaterial.id,
                            title: stepTitle.trim() || selectedMaterial.title,
                            instructions: stepInstructions.trim() || selectedMaterial.description,
                            step_order: currentSteps.length + 1,
                            is_required: isRequired,
                            is_published: false,
                            step_type: selectedMaterial.material_type,
                            material: selectedMaterial,
                          },
                        })
                      }
                    >
                      👁 Xem trước bước học
                    </button>
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => setSelectedMaterial(null)}
                    >
                      ← Chọn học liệu khác
                    </button>
                  </div>
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

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
                    <button type="button" className="btn" onClick={() => setSelectedMaterial(null)}>
                      Quay lại
                    </button>
                    <button type="submit" className="btn" disabled={isPending}>
                      {isPending ? "Đang lưu…" : "Lưu bản nháp"}
                    </button>
                    <button type="submit" value="publish" className="btn primary" disabled={isPending}>
                      Giao bước học
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Redesigned Preview */}
      {previewTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Xem trước: ${previewTarget.step ? previewTarget.step.title : previewTarget.material.title}`}
          className="pathway-modal-backdrop"
          onClick={() => setPreviewTarget(null)}
        >
          <div
            className={`card pathway-preview-modal ${isPreviewExpanded ? "is-expanded" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="pathway-preview-header">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="pathway-preview-badges">
                  {previewTarget.step && (
                    <span className={`badge small badge-natural ${previewTarget.step.is_published ? "badge-blue" : ""}`}>
                      {previewTarget.step.is_published ? "Đã giao" : "Bản nháp"}
                    </span>
                  )}
                  {previewTarget.step && (
                    <span className="badge small badge-natural">
                      {previewTarget.step.is_required ? "Bắt buộc" : "Tự chọn"}
                    </span>
                  )}
                  <span className="badge small badge-natural">
                    {getVietnameseStepTypeLabel(previewTarget.step?.step_type ?? previewTarget.material.material_type)}
                  </span>
                  {previewTarget.material.lesson_tag && (
                    <span className="badge small badge-natural">Bài {previewTarget.material.lesson_tag}</span>
                  )}
                </div>
                <h3 className="pathway-preview-title">
                  {previewTarget.step ? previewTarget.step.title : previewTarget.material.title}
                </h3>
              </div>

              <div className="pathway-preview-header-actions">
                {previewTarget.step && previewTarget.step.id !== "draft-preview" && (
                  <button
                    type="button"
                    className="btn small pathway-edit-btn"
                    onClick={() => {
                      const targetStep = previewTarget.step!;
                      setPreviewTarget(null);
                      setEditingStep(targetStep);
                    }}
                  >
                    ✎ Chỉnh sửa
                  </button>
                )}
                <button
                  type="button"
                  className="btn small pathway-expand-btn"
                  onClick={() => setIsPreviewExpanded((prev) => !prev)}
                  title={isPreviewExpanded ? "Thu gọn khung xem trước" : "Mở rộng khung xem trước"}
                >
                  {isPreviewExpanded ? "🗗 Thu gọn" : "⛶ Mở rộng"}
                </button>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Đóng hộp xem trước"
                  onClick={() => setPreviewTarget(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Subtle single-line preview notice */}
            <div role="note" className="preview-subtle-notice">
              <span>ℹ️ <strong>Chế độ xem trước của giáo viên:</strong> Thao tác thử thoải mái trên nội dung thật — không ghi bài nộp, điểm số hay tiến độ và không tự động giao bài.</span>
            </div>

            <div className="pathway-preview-body">
              {/* Section 1: Nhiệm vụ của học sinh */}
              <section className="preview-section preview-section-task" aria-label="Nhiệm vụ của học sinh">
                <div className="preview-section-header">
                  <span className="preview-section-kicker">1. Nhiệm vụ của học sinh</span>
                  {previewTarget.step && previewTarget.step.id !== "draft-preview" && (
                    <button
                      type="button"
                      className="preview-inline-edit-link"
                      onClick={() => {
                        const targetStep = previewTarget.step!;
                        setPreviewTarget(null);
                        setEditingStep(targetStep);
                      }}
                    >
                      Chỉnh sửa nhiệm vụ & công thức →
                    </button>
                  )}
                </div>
                <div className="preview-task-content">
                  <RichPhysicsText
                    content={
                      previewTarget.step?.instructions
                        ? previewTarget.step.instructions
                        : previewTarget.material.description || "Chưa có hướng dẫn chi tiết cho bước này."
                    }
                  />
                </div>
              </section>

              {/* Section 2: Học liệu tương tác */}
              <section className="preview-section preview-section-resource" aria-label="Học liệu tương tác">
                <div className="preview-section-header">
                  <span className="preview-section-kicker">2. Học liệu tương tác</span>
                  {previewInteracted && (
                    <span className="badge small badge-blue badge-natural" role="status">
                      ✓ Đã tương tác thử (lưu tạm trên phiên xem trước)
                    </span>
                  )}
                </div>
                <div className="preview-resource-frame">
                  {previewTarget.step && ["exercise", "reflection", "checkpoint"].includes(previewTarget.step.step_type) && !previewTarget.material.content_url
                    ? <p>Học sinh đọc nhiệm vụ ở trên và viết lời giải vào ô bài nộp.</p>
                    : <LearningResourcePreview
                    material={previewTarget.material}
                    onProgress={(done) => {
                      if (done) setPreviewInteracted(true);
                    }}
                  />}
                </div>

                {/* Compact trial student response bar inside interactive section */}
                <div className="preview-trial-bar">
                  <div className="preview-trial-row">
                    <input
                      type="text"
                      value={trialResponse}
                      onChange={(e) => {
                        setTrialResponse(e.target.value);
                        setTrialChecked(false);
                      }}
                      placeholder="Nhập thử câu trả lời hoặc liên kết sản phẩm của học sinh để kiểm tra..."
                      aria-label="Nhập thử câu trả lời của học sinh"
                      className="preview-trial-input"
                    />
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => setTrialChecked(true)}
                    >
                      Thử kiểm tra phản hồi (Không lưu)
                    </button>
                  </div>
                  {trialChecked && (
                    <p role="status" className="preview-trial-feedback">
                      ✓ Đã thử nghiệm thao tác nộp phản hồi ({trialResponse.trim() ? `"${trialResponse.trim()}"` : "mẫu thử"}). Không có bài nộp, điểm hay tiến độ nào được ghi vào cơ sở dữ liệu.
                    </p>
                  )}
                </div>
              </section>

              {/* Section 3: Nguồn tham khảo */}
              <section className="preview-section preview-section-reference" aria-label="Nguồn tham khảo">
                <div className="preview-section-header">
                  <span className="preview-section-kicker">3. Nguồn tham khảo & Học liệu gốc</span>
                </div>
                <div className="preview-reference-meta">
                  <div>
                    <span className="preview-reference-label">Tên học liệu gốc:</span>{" "}
                    <strong>{previewTarget.material.title}</strong>
                  </div>
                  <div>
                    <span className="preview-reference-label">Phân loại:</span>{" "}
                    <span>{getVietnameseStepTypeLabel(previewTarget.material.material_type)}</span>
                  </div>
                  {previewTarget.material.content_url && (
                    <div>
                      <span className="preview-reference-label">Định danh / Đường dẫn:</span>{" "}
                      <code className="preview-reference-code">{previewTarget.material.content_url}</code>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="pathway-preview-footer">
              {previewTarget.step && previewTarget.step.id !== "draft-preview" && (
                <button
                  type="button"
                  className="btn pathway-edit-btn"
                  onClick={() => {
                    const targetStep = previewTarget.step!;
                    setPreviewTarget(null);
                    setEditingStep(targetStep);
                  }}
                >
                  ✎ Chỉnh sửa bước học này
                </button>
              )}
              <button type="button" className="btn" onClick={() => setPreviewTarget(null)}>
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Step Editor with Formula Inserter & Live Preview */}
      {editingStep && (
        <div hidden={Boolean(previewTarget)}>
          <PathwayStepEditorModal
            key={editingStep.id}
            lessonId={lessonId}
            step={editingStep}
            material={resolveStepMaterial(editingStep)}
            onClose={() => setEditingStep(null)}
            onSaved={(updated) => {
              setCurrentSteps((prev) =>
                prev.map((item) => (item.id === editingStep.id ? { ...item, ...updated } : item))
              );
              setEditingStep((prev) => (prev ? { ...prev, ...updated } : null));
            }}
            onOpenFullPreview={(draftStep) => {
              openPreview({
                material: resolveStepMaterial(draftStep),
                step: draftStep,
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
