"use client";

import { useState, useTransition } from "react";
import { PhysicsActivityList } from "@/components/physics/FixedPhysicsActivityRenderer";
import { getNuclearSequence } from "@/lib/nuclear-learning-sequence";
import type { NuclearPhysicsLessonCode } from "@/lib/curriculum";
import { StudentColabViewer, type StudentColabMaterial } from "./StudentColabViewer";
import { StudentPhaseFinalQuestions, type FinalQuestion } from "./StudentPhaseFinalQuestions";
import { declareSimulationCompletedAction } from "@/app/student/actions";

export function StudentInClassProgression({
  lessonCode,
  lessonId,
  videosNode,
  colabs,
  finalQs,
  allVideosCompleted,
  phaseCompleted,
  simulationCompleted,
  assignedMainActivity,
}: {
  lessonCode: NuclearPhysicsLessonCode;
  lessonId: string;
  videosNode: React.ReactNode;
  colabs: StudentColabMaterial[];
  finalQs: FinalQuestion[];
  allVideosCompleted: boolean;
  phaseCompleted: boolean;
  simulationCompleted: boolean;
  assignedMainActivity: boolean;
}) {
  const [localSimCompleted, setLocalSimCompleted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState("");

  const mainActivity = getNuclearSequence(lessonCode)?.activity;
  const simCompleted = simulationCompleted || localSimCompleted;

  const allRequiredCompleted = allVideosCompleted && simCompleted;

  function handleCompleteAll() {
    if (simCompleted || isPending) return;
    setSaveError("");
    startTransition(async () => {
      try {
        const result = await declareSimulationCompletedAction({ lessonId });
        if (result.success) setLocalSimCompleted(true);
        else setSaveError(result.error ?? "Chưa lưu được tiến độ. Em hãy thử lại.");
      } catch { setSaveError("Chưa lưu được tiến độ. Em hãy thử lại."); }
    });
  }

  return (
    <>
      <section className="physics-lab-container" style={{ padding: "0 0 48px" }}>
        {assignedMainActivity && mainActivity ? <>
          {!simCompleted && <div className="student-paper">
            <p>Hoàn thành hoạt động chính và nộp bằng chứng ở bước giáo viên giao, sau đó xác nhận để mở câu hỏi chốt.</p>
            <button type="button" className="btn primary" onClick={handleCompleteAll} disabled={!allVideosCompleted || isPending}>
              {isPending ? "Đang lưu…" : "Xác nhận hoàn thành hoạt động chính"}
            </button>
          </div>}
          {lessonCode !== "B25" && <details>
            <summary>Hoạt động khám phá thêm (tự chọn)</summary>
            <PhysicsActivityList lessonCode={lessonCode} omitActivity={mainActivity} />
          </details>}
        </> : <PhysicsActivityList lessonCode={lessonCode} requiredActivity={mainActivity} onCompleteAll={simCompleted ? undefined : handleCompleteAll} />}
        {saveError && <p role="alert">{saveError}</p>}
        {simCompleted && !phaseCompleted && (
          <div style={{ textAlign: "center", marginTop: "16px", color: "var(--semantic-success)" }}>
            ✓ Đã hoàn thành mô phỏng {isPending ? "(đang lưu...)" : ""}
          </div>
        )}
      </section>
      
      <section className="content-list" style={{ marginTop: "48px" }}>
        {videosNode}

        {colabs.map(colab => (
          <StudentColabViewer key={colab.id} material={colab} />
        ))}
      </section>

      {allRequiredCompleted && finalQs.length === 2 && (
        <StudentPhaseFinalQuestions
          lessonId={lessonId}
          phase="in_class"
          questions={finalQs}
          isCompleted={phaseCompleted}
        />
      )}

      {allRequiredCompleted && finalQs.length !== 2 && !phaseCompleted && <p role="status">Chưa có đủ câu hỏi chốt. Nếu vừa lưu hoạt động, hãy tải lại trang hoặc báo giáo viên.</p>}
      {(!allRequiredCompleted) && (
        <div style={{ textAlign: "center", marginTop: "48px", padding: "24px", color: "var(--text-muted)", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "var(--radius-md)" }}>
          <p>Em cần xác nhận hoạt động chính và hoàn thành các nhiệm vụ bắt buộc để mở câu hỏi chốt.</p>
        </div>
      )}
    </>
  );
}
