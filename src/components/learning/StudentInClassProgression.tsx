"use client";

import { useState, useTransition } from "react";
import { PhysicsActivityList } from "@/components/physics/FixedPhysicsActivityRenderer";
import type { NuclearPhysicsLessonCode } from "@/lib/curriculum";
import { StudentColabViewer, type StudentColabMaterial } from "./StudentColabViewer";
import { StudentPhaseFinalQuestions, type FinalQuestion } from "./StudentPhaseFinalQuestions";
import { declareSimulationCompletedAction } from "@/app/student/actions";

function renderGroupActivities(lessonCode: string) {
  switch (lessonCode) {
    case "B23":
      return (
        <article className="student-paper" style={{ marginBottom: "48px", borderLeft: "4px solid var(--color-primary)" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>Xử lý dữ liệu bán rã theo nhóm</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>Nhóm em hãy dùng dữ liệu từ thí nghiệm mô phỏng để lập bảng tính, vẽ đồ thị và xác định chu kì bán rã T. Nếu giáo viên có cung cấp link Google Sheets, em có thể truy cập ở mục Phiếu học tập bên dưới.</p>
        </article>
      );
    case "B24":
      return (
        <article className="student-paper" style={{ marginBottom: "48px", borderLeft: "4px solid var(--color-primary)" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>Đóng vai nhà máy điện & Thảo luận ứng dụng</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>Thực hành phân vai (Nhà khoa học, Người dân, Chuyên gia kinh tế, Nhà môi trường) để bảo vệ quan điểm về nhà máy điện hạt nhân. Sử dụng bản đồ tư duy để tổng hợp ý kiến nếu giáo viên có cung cấp liên kết.</p>
        </article>
      );
    case "B25":
      return (
        <article className="student-paper" style={{ marginBottom: "48px", borderLeft: "4px solid var(--color-primary)" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>Ôn tập công thức theo đội</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>Chuẩn bị tham gia trò chơi kịch tính (Kahoot!, Blooket,...) để củng cố công thức độ hụt khối và năng lượng phản ứng. Link tham gia sẽ được giáo viên chiếu trên lớp hoặc đính kèm dưới đây.</p>
        </article>
      );
    default:
      return null;
  }
}

export function StudentInClassProgression({
  lessonCode,
  lessonId,
  videosNode,
  colabs,
  finalQs,
  allVideosCompleted,
  phaseCompleted,
  simulationCompleted,
}: {
  lessonCode: NuclearPhysicsLessonCode;
  lessonId: string;
  videosNode: React.ReactNode;
  colabs: StudentColabMaterial[];
  finalQs: FinalQuestion[];
  allVideosCompleted: boolean;
  phaseCompleted: boolean;
  simulationCompleted: boolean;
}) {
  const [localSimCompleted, setLocalSimCompleted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const simCompleted = simulationCompleted || localSimCompleted;

  const allColabsCompleted = colabs.every(c => c.is_complete);
  const allRequiredCompleted = allVideosCompleted && allColabsCompleted && simCompleted;

  function handleCompleteAll() {
    if (simCompleted || isPending) return;
    setLocalSimCompleted(true);
    startTransition(async () => {
      await declareSimulationCompletedAction({ lessonId });
    });
  }

  return (
    <>
      <section className="physics-lab-container" style={{ padding: "0 0 48px" }}>
        <PhysicsActivityList 
          lessonCode={lessonCode} 
          onCompleteAll={handleCompleteAll} 
        />
        {simCompleted && !phaseCompleted && (
          <div style={{ textAlign: "center", marginTop: "16px", color: "var(--semantic-success)" }}>
            ✓ Đã hoàn thành mô phỏng {isPending ? "(đang lưu...)" : ""}
          </div>
        )}
      </section>
      
      <section className="content-list" style={{ marginTop: "48px" }}>
        {renderGroupActivities(lessonCode)}
        
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
