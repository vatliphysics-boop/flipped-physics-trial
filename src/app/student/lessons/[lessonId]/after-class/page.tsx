import { PortalShell } from "@/components/PortalShell";
import { LogoutButton } from "@/components/LogoutButton";
import { StudentLessonHeader } from "../../StudentLessonHeader";
import { getStudentLesson } from "@/lib/student-lesson";

export default async function StudentAssessmentPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { lesson } = await getStudentLesson(lessonId);
  const published = lesson.homework_status === "published" && (lesson.homework_title || lesson.homework_description || lesson.homework_instructions);
  
  const cleanTitle = lesson.title.replace(/^Bài\s+\d+[.:]?\s*/i, "");

  return (
    <PortalShell role="student" active="lessons" account={<LogoutButton />}>
      <StudentLessonHeader 
        lessonId={lessonId}
        lessonTitle={cleanTitle}
        chapterCode={lesson.curriculum_code?.match(/B\d+/) ? null : lesson.curriculum_code?.split('.')[0]}
        description="Đọc yêu cầu bài tập cuối bài và thực hiện theo hướng dẫn của giáo viên."
        activePhase="after_class"
      />
      
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px 64px" }}>
        {published ? (
          <section className="student-paper">
            <header style={{ marginBottom: "32px", borderBottom: "1px solid var(--border-light)", paddingBottom: "24px" }}>
              <div className="student-kicker">
                Bài tập & Vận dụng
              </div>
              <h2 className="student-heading">
                {lesson.homework_title || "Nhiệm vụ cuối bài"}
              </h2>
              {lesson.homework_due_date ? (
                <div className="student-meta-pill">
                  <span style={{ color: "var(--semantic-warning)" }}>Hạn nộp:</span>
                  {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(lesson.homework_due_date))}
                </div>
              ) : null}
            </header>
            
            <div className="assignment-body" style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: 1.7 }}>
              {lesson.homework_description && (
                <div style={{ marginBottom: "32px" }}>
                  <p>{lesson.homework_description}</p>
                </div>
              )}
              
              {lesson.homework_instructions && (
                <div className="student-callout">
                  <h3 className="student-callout-title">Yêu cầu thực hiện</h3>
                  <p style={{ margin: 0 }}>{lesson.homework_instructions}</p>
                </div>
              )}
            </div>

            <div style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px dashed var(--border-dark)", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", fontStyle: "italic" }}>
                Vui lòng nộp bài theo hướng dẫn của giáo viên (ví dụ: Google Classroom, MS Teams, hoặc nộp trực tiếp trên lớp).
              </p>
            </div>
          </section>
        ) : (
          <section className="student-empty" style={{ backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)" }}>
            <h2>Chưa có bài tập</h2>
            <p style={{ marginBottom: "24px" }}>Giáo viên chưa mở bài tập cuối bài này.</p>
          </section>
        )}
      </div>
    </PortalShell>
  );
}
