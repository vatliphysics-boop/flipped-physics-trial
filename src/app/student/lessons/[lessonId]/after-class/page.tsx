import { PortalShell } from "@/components/PortalShell";
import { LogoutButton } from "@/components/LogoutButton";
import { StudentLessonHeader } from "../../StudentLessonHeader";
import { getStudentLesson } from "@/lib/student-lesson";
import { StudentPhase3Assessment, type AssessmentQuestion } from "@/components/learning/StudentPhase3Assessment";
import { StudentLessonReflection } from "@/components/learning/StudentLessonReflection";
import { checkPhaseAccess } from "@/lib/phase-guard";

export default async function StudentAssessmentPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { supabase, user, lesson, curriculum } = await getStudentLesson(lessonId);
  
  const phaseProgressObj = await checkPhaseAccess(lessonId, "after_class");

  const [{ data: pdfs }, qResult, { data: phaseProgress }, { data: reflection }] = await Promise.all([
    supabase.from("lesson_materials").select("*").eq("lesson_id", lessonId).eq("phase", "after_class").in("material_type", ["worksheet", "pdf"]).order("created_at"),
    supabase.rpc("get_student_assessment_questions", { p_lesson_id: lessonId }),
    supabase.from("student_phase_progress").select("is_completed").eq("lesson_id", lessonId).eq("student_id", user.id).eq("phase", "after_class").maybeSingle(),
    supabase.from("lesson_reflections").select("*").eq("lesson_id", lessonId).eq("student_id", user.id).maybeSingle(),
  ]);

  // Deep-sanitize assessment question content to remove all answer-bearing keys.
  // This is defense-in-depth; the RPC in migration 018 already returns whitelist-only JSON.
  function sanitizeQuestionContent(raw: Record<string, unknown>): Record<string, unknown> {
    const c = { ...raw };
    // Top-level answer keys
    delete c.correctAnswer;
    delete c.correct_answer;
    delete c.correctAnswers;
    delete c.sampleAnswer;
    delete c.keywords;
    // Deep-sanitize statements array (true_false questions)
    if (Array.isArray(c.statements)) {
      c.statements = (c.statements as Record<string, unknown>[]).map((stmt) => {
        const s = { ...(stmt || {}) };
        delete s.correctValue;
        delete s.explanation;
        return s;
      });
    }
    return c;
  }

  let resolvedQuestions = qResult.data
    ? (qResult.data as { id: string; question_type: "single_choice" | "true_false" | "short_answer"; difficulty: "nhan_biet" | "thong_hieu" | "van_dung" | "van_dung_cao"; content: Record<string, unknown>; sort_order: number }[]).map((q) => ({
          id: q.id,
          question_type: q.question_type,
          difficulty: q.difficulty,
          content: sanitizeQuestionContent((q.content as Record<string, unknown>) || {}),
          sort_order: q.sort_order,
      }))
    : null;

  if (qResult.error || !resolvedQuestions || (Array.isArray(resolvedQuestions) && resolvedQuestions.length === 0)) {
    // RPC unavailable (migration 017 not applied) — do NOT fall back to direct table read.
    // Direct reads bypass phase gate and send raw JSONB (with answers) over the network.
    console.error("[after-class] get_student_assessment_questions RPC failed, not falling back to direct read.", qResult.error?.message);
    resolvedQuestions = null;
  }

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

        {resolvedQuestions && resolvedQuestions.length > 0 ? (
          <StudentPhase3Assessment
            lessonId={lessonId}
            questions={resolvedQuestions as AssessmentQuestion[]}
            isCompleted={phaseProgress?.is_completed ?? false}
          />
        ) : (
          <section className="student-empty" style={{ backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)" }}>
            <h2>Chưa có bài tập</h2>
            <p style={{ marginBottom: "24px" }}>Giáo viên chưa mở bài tập cuối bài này.</p>
          </section>
        )}

        <StudentLessonReflection 
          lessonId={lessonId} 
          existingReflection={reflection} 
        />
      </div>
    </PortalShell>
  );
}
