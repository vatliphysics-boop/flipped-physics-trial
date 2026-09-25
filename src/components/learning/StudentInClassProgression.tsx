"use client";

import { useState } from "react";
import { PhysicsActivityList } from "@/components/physics/FixedPhysicsActivityRenderer";
import type { NuclearPhysicsLessonCode } from "@/lib/curriculum";
import { StudentColabViewer, type StudentColabMaterial } from "./StudentColabViewer";
import { StudentPhaseFinalQuestions, type FinalQuestion } from "./StudentPhaseFinalQuestions";

export function StudentInClassProgression({
  lessonCode,
  lessonId,
  videosNode,
  colabs,
  finalQs,
  allVideosCompleted,
  phaseCompleted,
}: {
  lessonCode: NuclearPhysicsLessonCode;
  lessonId: string;
  videosNode: React.ReactNode;
  colabs: StudentColabMaterial[];
  finalQs: FinalQuestion[];
  allVideosCompleted: boolean;
  phaseCompleted: boolean;
}) {
  const [simCompleted, setSimCompleted] = useState(false);

  const allColabsCompleted = colabs.every(c => c.is_complete);
  const allRequiredCompleted = allVideosCompleted && allColabsCompleted && simCompleted;

  return (
    <>
      <section className="physics-lab-container" style={{ padding: "0 0 48px" }}>
        <PhysicsActivityList 
          lessonCode={lessonCode} 
          onCompleteAll={() => setSimCompleted(true)} 
        />
        {simCompleted && !phaseCompleted && (
          <div style={{ textAlign: "center", marginTop: "16px", color: "var(--semantic-success)" }}>
            ✓ Đã hoàn thành mô phỏng
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

      {(!allRequiredCompleted) && (
        <div style={{ textAlign: "center", marginTop: "48px", padding: "24px", color: "var(--text-muted)", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "var(--radius-md)" }}>
          <p>Em cần hoàn thành mô phỏng và tất cả học liệu để mở khóa câu hỏi chốt kiến thức.</p>
        </div>
      )}
    </>
  );
}
