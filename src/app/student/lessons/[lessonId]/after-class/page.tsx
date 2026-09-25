import { PortalShell } from "@/components/PortalShell";
import { LogoutButton } from "@/components/LogoutButton";
import { StudentLessonHeader } from "../../StudentLessonHeader";
import { getStudentLesson } from "@/lib/student-lesson";
import { StudentPhase3Assessment, type AssessmentQuestion } from "@/components/learning/StudentPhase3Assessment";
import { checkPhaseAccess } from "@/lib/phase-guard";

export default async function StudentAssessmentPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { supabase, user, lesson, curriculum } = await getStudentLesson(lessonId);
  
  const phaseProgressObj = await checkPhaseAccess(lessonId, "after_class");

  const [{ data: pdfs }, { data: questions }, { data: phaseProgress }] = await Promise.all([
    supabase.from("lesson_materials").select("*").eq("lesson_id", lessonId).eq("phase", "after_class").in("material_type", ["worksheet", "pdf"]).order("created_at"),
    supabase.from("phase_assessment_questions").select("*").eq("lesson_id", lessonId).eq("is_published", true).order("sort_order"),
    supabase.from("student_phase_progress").select("is_completed").eq("lesson_id", lessonId).eq("student_id", user.id).eq("phase", "after_class").maybeSingle(),
  ]);

  const cleanTitle = lesson.title.replace(/^Bài\s+\d+[.:]?\s*/i, "");

  return (
    <PortalShell role="student" active="lessons" account={<LogoutButton />}>
      <StudentLessonHeader 
        lessonId={lessonId}
        lessonTitle={cleanTitle}
        chapterCode={curriculum.chapterCode}
        description="Đọc yêu cầu bài tập cuối bài và thực hiện theo hướng dẫn của giáo viên."
        activePhase="after_class"
        phaseProgress={phaseProgressObj}
      />
      
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px 64px" }}>
        
        {pdfs && pdfs.length > 0 && (
          <section style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "24px", marginBottom: "24px" }}>Tài liệu bài tập</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {pdfs.map(pdf => (
                <article key={pdf.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-surface-elevated)" }}>
                  <div>
                    <h3 style={{ fontSize: "18px", marginBottom: "4px" }}>{pdf.title}</h3>
                    {pdf.description && <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{pdf.description}</p>}
                  </div>
                  <a href={pdf.content_url} target="_blank" rel="noopener noreferrer" className="btn primary">
                    Mở tài liệu PDF ↗
                  </a>
                </article>
              ))}
            </div>
          </section>
        )}

        {questions && questions.length > 0 ? (
          <StudentPhase3Assessment
            lessonId={lessonId}
            questions={questions as AssessmentQuestion[]}
            isCompleted={phaseProgress?.is_completed ?? false}
          />
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
