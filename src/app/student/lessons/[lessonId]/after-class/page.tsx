import { PortalShell } from "@/components/PortalShell";
import { LogoutButton } from "@/components/LogoutButton";
import { StudentLessonHeader } from "../../StudentLessonHeader";
import { getStudentLesson } from "@/lib/student-lesson";

export default async function StudentAssessmentPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { lesson, curriculum } = await getStudentLesson(lessonId);
  
  const cleanTitle = lesson.title.replace(/^Bài\s+\d+[.:]?\s*/i, "");

  return (
    <PortalShell role="student" active="lessons" account={<LogoutButton />}>
      <StudentLessonHeader 
        lessonId={lessonId}
        lessonTitle={cleanTitle}
        chapterCode={curriculum.chapterCode}
        description="Đọc yêu cầu bài tập cuối bài và thực hiện theo hướng dẫn của giáo viên."
        activePhase="after_class"
      />
      
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px 64px" }}>
        {/* homework_* fields absent from actual DB schema. The after-class phase shows
            a static empty state until homework support is added to the schema. */}
        <section className="student-empty" style={{ backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)" }}>
          <h2>Chưa có bài tập</h2>
          <p style={{ marginBottom: "24px" }}>Giáo viên chưa mở bài tập cuối bài này.</p>
        </section>
      </div>
    </PortalShell>
  );
}
