"use client";

import { useCallback, useState, useTransition } from "react";
import { LearningResourcePreview } from "./LearningResourcePreview";
import { EVIDENCE_PROMPTS } from "@/lib/nuclear-learning-sequence";
import type { LearningPhase } from "@/lib/learning-phases";
import { RichPhysicsText } from "./RichPhysicsText";
import { CANONICAL_SYSTEM_MATERIALS } from "@/lib/material-bank";
import type { MaterialType } from "@/lib/material-bank";
import { completePathwayStepAction } from "@/app/student/actions";
import { isPathwayStepUnlocked, type StudentPathwayStep } from "@/lib/pathway-progress";

export function StudentPathwayStepViewer({ steps, error, phase }: { steps: StudentPathwayStep[]; error: string | null; phase: LearningPhase }) {
  if (error) return <p role="alert" className="form-alert form-alert-error">{error}</p>;
  if (!steps.length) return null;
  return <section aria-label="Tiến trình giáo viên giao" style={{ marginBottom: 48 }}>
    <h2>Tiến trình giáo viên giao</h2>
    <p>Thực hiện các bước theo thứ tự, ghi kết quả và việc em cần tìm hiểu thêm. Bài nộp được lưu để giáo viên xem xét.</p>
    {steps.map((step, index) => <PathwayStepCard key={`${step.id}-${step.completed}`} step={step} index={index} phase={phase} unlocked={isPathwayStepUnlocked(steps, step)} />)}
  </section>;
}

function PathwayStepCard({ step, index, unlocked, phase }: { step: StudentPathwayStep; index: number; unlocked: boolean; phase: LearningPhase }) {
  const [prediction, setPrediction] = useState(step.evidence?.prediction ?? "");
  const [response, setResponse] = useState(step.evidence?.response ?? "");
  const [nextStep, setNextStep] = useState(step.evidence?.nextStep ?? "");
  const [activityDone, setActivityDone] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const onActivityProgress = useCallback((done: boolean) => setActivityDone(done), []);
  const [predictionLabel, responseLabel, nextLabel] = EVIDENCE_PROMPTS[phase];
  const templateFieldsRequired = step.required && step.template === true;
  const isWrittenTask = ["exercise", "checkpoint", "reflection"].includes(step.type);
  const available = Boolean(step.url || step.activityKey || isWrittenTask);

  return <article className="student-paper" style={{ marginTop: 24 }}>
    <p className="student-kicker">Bước {index + 1} · {step.required ? "Bắt buộc" : "Tự chọn"}</p>
    <h3>{step.title}</h3>
    {step.instructions ? (
      <div className="student-step-instructions">
        <RichPhysicsText content={step.instructions} />
      </div>
    ) : null}
    {step.completed ? <p role="status">✓ Đã lưu bài nộp. Giáo viên sẽ xem xét nội dung.</p> : null}
    {!unlocked ? <p>Em cần hoàn thành các bước bắt buộc trước đó để mở bước này.</p> : <>
      {(step.activityKey || step.url) && <LearningResourcePreview material={CANONICAL_SYSTEM_MATERIALS.find(m => m.id === step.resourceId) ?? { title: step.title, content_url: step.activityKey ? `activity:${step.activityKey}` : step.url!, material_type: step.type as MaterialType }} onProgress={onActivityProgress} />}
      {!available ? <p role="alert">Học liệu hiện chưa mở được. Em hãy báo giáo viên để kiểm tra đường dẫn.</p> : null}
      <form onSubmit={event => {
        event.preventDefault();
        setError(""); setMessage("");
        startTransition(async () => {
          try {
            const result = await completePathwayStepAction({ stepId: step.id, evidence: { prediction, response, nextStep } });
            if (result.error) setError(result.error);
            else setMessage(result.message ?? "Đã lưu bài nộp.");
          } catch { setError("Chưa lưu được bài nộp. Em hãy thử lại; nội dung vẫn được giữ trên trang."); }
        });
      }}>
        <fieldset disabled={pending || step.completed || !available} style={{ border: 0, padding: 0, marginTop: 24 }}>
          <label htmlFor={`${step.id}-prediction`}>{predictionLabel}{templateFieldsRequired && " *"}</label>
          <textarea id={`${step.id}-prediction`} value={prediction} required={templateFieldsRequired} onChange={event => setPrediction(event.target.value)} maxLength={2000} rows={2} style={{ width: "100%", margin: "8px 0 16px" }} />
          <label htmlFor={`${step.id}-response`}>{responseLabel} *</label>
          <textarea id={`${step.id}-response`} required value={response} onChange={event => setResponse(event.target.value)} maxLength={2000} rows={4} style={{ width: "100%", margin: "8px 0 16px" }} />
          <label htmlFor={`${step.id}-next`}>{nextLabel}{templateFieldsRequired && " *"}</label>
          <textarea id={`${step.id}-next`} value={nextStep} required={templateFieldsRequired} onChange={event => setNextStep(event.target.value)} maxLength={2000} rows={2} style={{ width: "100%", margin: "8px 0 16px" }} />
          {step.activityKey && !activityDone && !step.completed ? <p>Hoàn thành yêu cầu trong mô phỏng trước khi nộp kết quả.</p> : null}
          <button className="btn primary" disabled={pending || step.completed || !response.trim() || Boolean(step.activityKey && !activityDone) || (templateFieldsRequired && (!prediction.trim() || !nextStep.trim()))}>{pending ? "Đang lưu…" : step.completed ? "Đã nộp" : "Nộp kết quả bước học"}</button>
        </fieldset>
        {error ? <p role="alert">{error}</p> : null}
        {message ? <p role="status">{message}</p> : null}
      </form>
    </>}
  </article>;
}
