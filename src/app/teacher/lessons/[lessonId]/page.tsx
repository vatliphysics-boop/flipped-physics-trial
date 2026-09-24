import Link from "next/link";
import { TeacherShell } from "../../TeacherShell";
import { LessonNavigation, lessonPath } from "@/components/learning/LessonNavigation";
import { getTeacherLesson } from "@/lib/teacher-lesson";
import { LEARNING_PHASES, PHASE_META } from "@/lib/learning-phases";

export default async function TeacherLessonOverview({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { supabase, lesson, classItem, curriculum } = await getTeacherLesson(lessonId);
  const { data: materials } = await supabase.from("lesson_materials").select("phase").eq("lesson_id", lessonId);
  const count = new Map<string, number>();
  for (const item of materials ?? []) count.set(item.phase, (count.get(item.phase) ?? 0) + 1);
  return <TeacherShell active="curriculum" title={lesson.title} description="Tổng quan bài học. Chọn một giai đoạn để quản lý đúng loại học liệu.">
    <LessonNavigation role="teacher" lessonId={lessonId} className={classItem.name} lessonTitle={lesson.title} classId={classItem.id} chapterCode={curriculum.chapterCode} />
    <section className="lesson-overview-card card"><span className={`lesson-status lesson-status-${lesson.status}`}>{lesson.status === "published" ? "Đã xuất bản" : "Bản nháp"}</span><h2>{lesson.title}</h2><p>{lesson.learning_objectives || lesson.description || "Chưa có mục tiêu học tập."}</p></section>
    <section className="chapter-section-list" style={{ marginTop: "32px" }}>
      {LEARNING_PHASES.map((phase, index) => {
        const title = phase === "before_class" ? "Bài giảng và chuẩn bị" : phase === "in_class" ? "Mô phỏng và khám phá" : "Bài tập và kiểm tra cuối bài";
        const meta = PHASE_META[phase];
        const phaseCount = count.get(phase) ?? 0;
        
        return (
          <Link key={phase} href={lessonPath("teacher", lessonId, phase)} className={`card chapter-overview-row phase-${meta.tone}`}>
            <span className="chapter-number">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <span className="chapter-kicker">{meta.title}</span>
              <h2>{title}</h2>
              <p>{meta.description}</p>
              <p style={{ marginTop: "4px", fontWeight: 500, fontSize: "13px", color: phase === "in_class" || phaseCount > 0 ? "var(--color-primary)" : "var(--text-muted)" }}>
                {phase === "in_class" ? "Mô phỏng tích hợp" : phaseCount > 0 ? `${phaseCount} học liệu · Cập nhật gần nhất` : "Chưa thiết lập"}
              </p>
            </div>
            <span className="arrow-link">Mở Pha {index + 1} →</span>
          </Link>
        );
      })}
    </section>
  </TeacherShell>;
}
