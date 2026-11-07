"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import type { MaterialItem, PathwayStep } from "@/lib/material-bank";
import { updatePathwayStepAction } from "@/app/teacher/pathway-actions";
import {
  RichPhysicsText,
  PHYSICS_FORMULA_PRESETS,
  getVietnameseStepTypeLabel,
  renderKatexSafe,
  validatePhysicsContentMath,
} from "./RichPhysicsText";

interface PathwayStepEditorModalProps {
  lessonId: string;
  step: PathwayStep;
  material: MaterialItem;
  onClose: () => void;
  onSaved: (updated: { title: string; instructions: string; is_required: boolean }) => void;
  onOpenFullPreview: (draftStep: PathwayStep) => void;
}

export function PathwayStepEditorModal({
  lessonId,
  step,
  material,
  onClose,
  onSaved,
  onOpenFullPreview,
}: PathwayStepEditorModalProps) {
  const [savedBaseline, setSavedBaseline] = useState({
    title: step.title,
    instructions: step.instructions || "",
    is_required: step.is_required,
  });

  const [title, setTitle] = useState(step.title);
  const [instructions, setInstructions] = useState(step.instructions || "");
  const [isRequired, setIsRequired] = useState(step.is_required);

  const [formulaOpen, setFormulaOpen] = useState(true);
  const [formulaLatex, setFormulaLatex] = useState(PHYSICS_FORMULA_PRESETS[0].latex);
  const [formulaMode, setFormulaMode] = useState<"inline" | "block">("inline");

  const [linkOpen, setLinkOpen] = useState(false);
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("https://");

  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isDirty =
    title.trim() !== savedBaseline.title.trim() ||
    instructions !== savedBaseline.instructions ||
    isRequired !== savedBaseline.is_required;

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const formulaPreview = renderKatexSafe(formulaLatex, formulaMode === "block");
  const contentValidation = validatePhysicsContentMath(instructions);

  function insertAtCursor(snippet: string, selectInnerOffset?: [number, number]) {
    const el = textareaRef.current;
    setSaveMessage("");
    setSaveError("");
    if (!el) {
      setInstructions((prev) => (prev ? `${prev}\n${snippet}` : snippet));
      return;
    }
    const start = el.selectionStart ?? instructions.length;
    const end = el.selectionEnd ?? instructions.length;
    const before = instructions.slice(0, start);
    const after = instructions.slice(end);
    const next = `${before}${snippet}${after}`;
    setInstructions(next);

    requestAnimationFrame(() => {
      el.focus();
      if (selectInnerOffset) {
        el.setSelectionRange(start + selectInnerOffset[0], start + selectInnerOffset[1]);
      } else {
        const pos = start + snippet.length;
        el.setSelectionRange(pos, pos);
      }
    });
  }

  function wrapSelection(prefix: string, suffix: string, placeholder: string) {
    const el = textareaRef.current;
    setSaveMessage("");
    setSaveError("");
    if (!el) {
      setInstructions((prev) => `${prev}${prefix}${placeholder}${suffix}`);
      return;
    }
    const start = el.selectionStart ?? instructions.length;
    const end = el.selectionEnd ?? instructions.length;
    const selected = instructions.slice(start, end) || placeholder;
    const snippet = `${prefix}${selected}${suffix}`;
    const next = `${instructions.slice(0, start)}${snippet}${instructions.slice(end)}`;
    setInstructions(next);

    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    });
  }

  function handleInsertHeading() {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? instructions.length;
    const needsNewline = start > 0 && instructions[start - 1] !== "\n";
    const prefix = `${needsNewline ? "\n" : ""}### `;
    insertAtCursor(`${prefix}Tiêu đề mục\n`, [prefix.length, prefix.length + "Tiêu đề mục".length]);
  }

  function handleInsertList() {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? instructions.length;
    const needsNewline = start > 0 && instructions[start - 1] !== "\n";
    const prefix = `${needsNewline ? "\n" : ""}- `;
    insertAtCursor(`${prefix}Nội dung ý cần thực hiện\n`, [
      prefix.length,
      prefix.length + "Nội dung ý cần thực hiện".length,
    ]);
  }

  function handleInsertLink() {
    const cleanLabel = linkLabel.trim() || "Tài liệu tham khảo";
    const cleanUrl = linkUrl.trim() || "https://";
    insertAtCursor(`[${cleanLabel}](${cleanUrl})`);
    setLinkOpen(false);
    setLinkLabel("");
    setLinkUrl("https://");
  }

  function handleInsertFormula() {
    const trimmed = formulaLatex.trim();
    if (!trimmed) return;
    if (formulaMode === "inline") {
      insertAtCursor(`\\(${trimmed}\\)`);
    } else {
      const el = textareaRef.current;
      const start = el?.selectionStart ?? instructions.length;
      const needsLeadingNewline = start > 0 && instructions[start - 1] !== "\n";
      const snippet = `${needsLeadingNewline ? "\n" : ""}\\[${trimmed}\\]\n`;
      insertAtCursor(snippet);
    }
  }

  function handleRequestClose() {
    if (isPending) return;
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;
    setSaveError("");
    setSaveMessage("");

    if (!title.trim()) {
      setSaveError("Vui lòng nhập tiêu đề bước học.");
      return;
    }
    if (instructions.length > 8000) {
      setSaveError("Nội dung nhiệm vụ vượt quá giới hạn 8000 kí tự.");
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.set("lesson_id", lessonId);
      fd.set("step_id", step.id);
      fd.set("title", title.trim());
      fd.set("instructions", instructions);
      fd.set("is_required", isRequired ? "true" : "false");

      try {
        const res = await updatePathwayStepAction({}, fd);
        if (res.error) {
          setSaveError(res.error);
          return;
        }
        const nextBaseline = {
          title: title.trim(),
          instructions: instructions.replace(/\r\n/g, "\n").trim(),
          is_required: isRequired,
        };
        setSavedBaseline(nextBaseline);
        setInstructions(nextBaseline.instructions);
        setSaveMessage(res.message || "Đã lưu nội dung bước học thành công.");
        onSaved(nextBaseline);
      } catch {
        setSaveError("Chưa lưu được thay đổi. Hãy kiểm tra kết nối và thử lại; nội dung đang soạn vẫn được giữ nguyên.");
      }
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Chỉnh sửa bước học: ${title}`}
      className="pathway-modal-backdrop"
      onClick={handleRequestClose}
    >
      <div
        className="card pathway-editor-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="pathway-editor-header">
          <div>
            <div className="pathway-editor-badges">
              <span className="badge small badge-blue badge-natural">Trình soạn bước học</span>
              <span className="badge small badge-natural">{step.is_published ? "Đã giao" : "Bản nháp"}</span>
              <span className="badge small badge-natural">{getVietnameseStepTypeLabel(step.step_type)}</span>
              {isPending ? (
                <span className="step-status-pill is-saving" role="status">
                  ⏳ Đang lưu thay đổi...
                </span>
              ) : isDirty ? (
                <span className="step-status-pill is-dirty" role="status">
                  ● Có thay đổi chưa lưu
                </span>
              ) : saveMessage ? (
                <span className="step-status-pill is-saved" role="status">
                  ✓ Đã lưu thành công
                </span>
              ) : (
                <span className="step-status-pill">Đã đồng bộ</span>
              )}
            </div>
            <h3 className="pathway-editor-title">Chỉnh sửa nội dung &amp; công thức bước học</h3>
          </div>

          <div className="pathway-editor-header-actions">
            <button
              type="button"
              className="btn small"
              disabled={isPending}
              onClick={() =>
                onOpenFullPreview({
                  ...step,
                  title: title.trim() || step.title,
                  instructions,
                  is_required: isRequired,
                  material,
                })
              }
            >
              👁 Xem trước đầy đủ
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label="Đóng trình soạn thảo"
              onClick={handleRequestClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Unsaved Changes Warning Dialog */}
        {showDiscardConfirm && (
          <div
            className="editor-discard-confirm"
            role="alertdialog"
            aria-label="Cảnh báo thay đổi chưa lưu"
          >
            <div>
              <strong>⚠️ Bạn có thay đổi chưa lưu!</strong>
              <p>Nếu đóng trình soạn thảo ngay bây giờ, các nội dung và công thức vừa chỉnh sửa sẽ bị hủy.</p>
            </div>
            <div className="editor-discard-actions">
              <button
                type="button"
                className="btn small"
                onClick={() => setShowDiscardConfirm(false)}
              >
                Tiếp tục chỉnh sửa
              </button>
              <button
                type="button"
                className="btn small danger"
                onClick={() => {
                  setShowDiscardConfirm(false);
                  onClose();
                }}
              >
                Bỏ thay đổi &amp; Đóng
              </button>
            </div>
          </div>
        )}

        {/* Status Alerts */}
        {saveError && (
          <div className="form-alert form-alert-error" role="alert">
            ⚠️ {saveError}
          </div>
        )}
        {saveMessage && !isDirty && (
          <div className="form-alert form-alert-success" role="status">
            ✓ {saveMessage}
          </div>
        )}

        <form onSubmit={handleSave}>
          <fieldset disabled={isPending} className="pathway-editor-form" style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
            {/* Title Field */}
            <div className="form-field">
              <label htmlFor="editor-step-title">Tiêu đề bước học hiển thị cho học sinh *</label>
              <input
                id="editor-step-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSaveMessage("");
                }}
                required
                maxLength={300}
              />
            </div>

            {/* Editor Split Workspace: Left = Toolbar + Textarea + Formula Inserter, Right = Live Preview */}
            <div className="pathway-editor-grid">
              {/* Left Column: Authoring */}
              <div className="pathway-editor-authoring">
                <div className="pathway-editor-label-row">
                  <label htmlFor="editor-step-instructions">
                    Nội dung nhiệm vụ, hướng dẫn &amp; công thức Vật lí
                  </label>
                  <span className="pathway-editor-char-count">{instructions.length}/8000 kí tự</span>
                </div>

                {/* Formatting Toolbar */}
                <div className="step-editor-toolbar" role="toolbar" aria-label="Thanh công cụ định dạng">
                  <button
                    type="button"
                    className="btn small toolbar-btn"
                    onClick={handleInsertHeading}
                    title="Chèn tiêu đề mục (###)"
                  >
                    <strong>H</strong> Tiêu đề
                  </button>
                  <button
                    type="button"
                    className="btn small toolbar-btn"
                    onClick={() => wrapSelection("**", "**", "nội dung in đậm")}
                    title="In đậm (**...**)"
                  >
                    <strong>B</strong> Đậm
                  </button>
                  <button
                    type="button"
                    className="btn small toolbar-btn"
                    onClick={() => wrapSelection("*", "*", "nội dung in nghiêng")}
                    title="In nghiêng (*...*)"
                  >
                    <em>I</em> Nghiêng
                  </button>
                  <button
                    type="button"
                    className="btn small toolbar-btn"
                    onClick={handleInsertList}
                    title="Chèn danh sách gạch đầu dòng (- )"
                  >
                    • Danh sách
                  </button>
                  <button
                    type="button"
                    className={`btn small toolbar-btn ${linkOpen ? "is-active" : ""}`}
                    onClick={() => setLinkOpen((v) => !v)}
                    title="Chèn liên kết tham khảo"
                  >
                    🔗 Liên kết
                  </button>
                  <button
                    type="button"
                    className={`btn small toolbar-btn formula-toggle-btn ${formulaOpen ? "is-active" : ""}`}
                    onClick={() => setFormulaOpen((v) => !v)}
                  >
                    ∑ Chèn công thức
                  </button>
                </div>

                {/* Optional Link Inserter Popover */}
                {linkOpen && (
                  <div className="editor-link-popover">
                    <input
                      type="text"
                      placeholder="Tên hiển thị (VD: Phiếu mô phỏng)"
                      value={linkLabel}
                      onChange={(e) => setLinkLabel(e.target.value)}
                      aria-label="Tên hiển thị liên kết"
                    />
                    <input
                      type="url"
                      placeholder="https://..."
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      aria-label="Địa chỉ liên kết URL"
                    />
                    <button type="button" className="btn small primary" onClick={handleInsertLink}>
                      Chèn liên kết
                    </button>
                    <button type="button" className="btn small" onClick={() => setLinkOpen(false)}>
                      Đóng
                    </button>
                  </div>
                )}

                {/* Formula Inserter Box */}
                {formulaOpen && (
                  <div className="formula-inserter-panel" aria-label="Hộp chèn công thức Vật lí">
                    <div className="formula-inserter-top">
                      <span className="formula-panel-title">∑ Công cụ chèn công thức LaTeX (KaTeX)</span>
                      <div className="formula-mode-switch" role="radiogroup" aria-label="Kiểu hiển thị công thức">
                        <label className={`formula-mode-option ${formulaMode === "inline" ? "is-selected" : ""}`}>
                          <input
                            type="radio"
                            name="formula-mode"
                            value="inline"
                            checked={formulaMode === "inline"}
                            onChange={() => setFormulaMode("inline")}
                          />
                          <span>Trong dòng <code>\(...\)</code></span>
                        </label>
                        <label className={`formula-mode-option ${formulaMode === "block" ? "is-selected" : ""}`}>
                          <input
                            type="radio"
                            name="formula-mode"
                            value="block"
                            checked={formulaMode === "block"}
                            onChange={() => setFormulaMode("block")}
                          />
                          <span>Riêng một dòng <code>\[...\]</code></span>
                        </label>
                      </div>
                    </div>

                    {/* Preset chips */}
                    <div className="formula-presets-bar">
                      <span className="formula-presets-label">Mẫu Vật lí chọn nhanh:</span>
                      <div className="formula-presets-list">
                        {PHYSICS_FORMULA_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            className="formula-preset-chip"
                            title={preset.description}
                            onClick={() => {
                              setFormulaLatex(preset.latex);
                              setFormulaMode(preset.defaultDisplay);
                            }}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* LaTeX Input + Insert Button */}
                    <div className="formula-input-row">
                      <input
                        type="text"
                        id="formula-latex-input"
                        aria-label="Nhập mã công thức LaTeX"
                        value={formulaLatex}
                        onChange={(e) => setFormulaLatex(e.target.value)}
                        placeholder="VD: N(t)=N_0\,2^{-\frac{t}{T}} hoặc {}^{238}_{92}\mathrm{U}"
                        className="formula-latex-input"
                      />
                      <button
                        type="button"
                        className="btn small primary"
                        disabled={Boolean(formulaPreview.error) || !formulaLatex.trim()}
                        onClick={handleInsertFormula}
                      >
                        + Chèn vào nhiệm vụ
                      </button>
                    </div>

                    {/* Live Formula Preview or Syntax Error */}
                    <div className="formula-live-preview-box">
                      <span className="formula-preview-caption">Xem trước công thức:</span>
                      {formulaPreview.error ? (
                        <div className="math-syntax-error" role="alert">
                          ⚠️ {formulaPreview.error}
                        </div>
                      ) : (
                        <div
                          className={formulaMode === "block" ? "physics-math-block" : "physics-math-inline"}
                          dangerouslySetInnerHTML={{ __html: formulaPreview.html || "" }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Main Instructions Textarea */}
                <textarea
                  id="editor-step-instructions"
                  ref={textareaRef}
                  value={instructions}
                  onChange={(e) => {
                    setInstructions(e.target.value);
                    setSaveMessage("");
                  }}
                  rows={9}
                  maxLength={8000}
                  placeholder="Nhập mục tiêu, các bước thực hiện, công thức và yêu cầu sản phẩm nộp..."
                  className="pathway-editor-textarea"
                />

                <div className="pathway-editor-checkbox-row">
                  <input
                    type="checkbox"
                    id="editor-step-required"
                    checked={isRequired}
                    onChange={(e) => {
                      setIsRequired(e.target.checked);
                      setSaveMessage("");
                    }}
                  />
                  <label htmlFor="editor-step-required">
                    Bắt buộc hoàn thành (học sinh phải nộp kết quả bước này để mở khóa câu hỏi chốt pha)
                  </label>
                </div>
              </div>

              {/* Right Column: Live Rendered Preview */}
              <div className="pathway-editor-preview-pane" aria-label="Bản xem trước trực tiếp">
                <div className="pathway-editor-preview-header">
                  <span>Bản xem trước trực tiếp (Hiển thị phía học sinh)</span>
                  {!contentValidation.valid ? (
                    <span className="badge small badge-danger badge-natural" role="status">
                      ⚠️ {contentValidation.errors.length} lỗi công thức
                    </span>
                  ) : (
                    <span className="badge small badge-blue badge-natural">✓ Công thức hợp lệ</span>
                  )}
                </div>

                {!contentValidation.valid && (
                  <div className="editor-math-error-summary" role="alert">
                    <strong>Cần sửa công thức trước khi giao cho học sinh:</strong>
                    <ul>
                      {contentValidation.errors.map((err, idx) => (
                        <li key={idx}>
                          {err.message} (<code>{err.raw}</code>)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pathway-editor-preview-card">
                  <div className="preview-step-kicker">
                    <span>{isRequired ? "Bước bắt buộc" : "Bước tự chọn"}</span>
                    <span>·</span>
                    <span>{getVietnameseStepTypeLabel(step.step_type)}</span>
                  </div>
                  <h4 className="preview-step-heading">{title.trim() || "Chưa nhập tiêu đề bước học"}</h4>
                  {instructions.trim() ? (
                    <RichPhysicsText content={instructions} />
                  ) : (
                    <p style={{ color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
                      Chưa có nội dung nhiệm vụ. Hãy nhập hướng dẫn hoặc chèn công thức ở khung bên trái.
                    </p>
                  )}
                </div>

                <div className="pathway-editor-resource-meta">
                  <span>
                    <strong>Học liệu gắn kèm:</strong> {material.title}
                  </span>
                  <span>
                    <strong>Loại:</strong> {getVietnameseStepTypeLabel(material.material_type)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pathway-editor-footer">
              <button type="button" className="btn" disabled={isPending} onClick={handleRequestClose}>
                Đóng
              </button>
              <div className="pathway-editor-footer-right">
                <button
                  type="submit"
                  className="btn primary"
                  disabled={isPending || !title.trim()}
                >
                  {isPending ? "⏳ Đang lưu..." : "💾 Lưu thay đổi bước học"}
                </button>
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
