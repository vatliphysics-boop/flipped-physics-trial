import Link from "next/link";
import { PortalShell } from "@/components/PortalShell";
import { LogoutButton } from "@/components/LogoutButton";
import { StudentLessonHeader } from "../../StudentLessonHeader";
import { getStudentLesson } from "@/lib/student-lesson";

export default async function StudentAssessmentPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { lesson, classItem } = await getStudentLesson(lessonId);
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
          <section className="assignment-content" style={{ backgroundColor: "var(--bg-surface)", padding: "48px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <header style={{ marginBottom: "32px", borderBottom: "1px solid var(--border-light)", paddingBottom: "24px" }}>
              <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-primary)", fontWeight: 600, marginBottom: "12px" }}>
                Bài tập & Vận dụng
              </div>
              <h2 style={{ fontSize: "28px", color: "var(--text-primary)", margin: "0 0 16px", fontWeight: 600 }}>
                {lesson.homework_title || "Nhiệm vụ cuối bài"}
              </h2>
              {lesson.homework_due_date ? (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "var(--bg-page)", padding: "8px 16px", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>
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
                <div style={{ backgroundColor: "var(--bg-page)", padding: "24px", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--color-primary)" }}>
                  <h3 style={{ fontSize: "16px", color: "var(--text-primary)", margin: "0 0 12px", fontWeight: 600 }}>Yêu cầu thực hiện</h3>
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
          <section className="empty-state" style={{ padding: "64px 0", textAlign: "center", color: "var(--text-muted)" }}>
            <h2 style={{ fontSize: "20px", color: "var(--text-primary)", marginBottom: "8px" }}>Chưa có bài tập</h2>
            <p style={{ marginBottom: "24px" }}>Giáo viên chưa mở bài tập cuối bài này.</p>
          </section>
        )}
      </div>
    </PortalShell>
  );
}
