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
    <section className="lesson-stage-grid">{LEARNING_PHASES.map((phase) => <article className={`card phase-card phase-${PHASE_META[phase].tone}`} key={phase}><span className="badge">{PHASE_META[phase].title}</span><h2>{phase === "before_class" ? "Video và nhiệm vụ chuẩn bị" : phase === "in_class" ? "Hoạt động và mô phỏng" : "Bài tập và củng cố"}</h2><p>{PHASE_META[phase].description}</p><strong>{count.get(phase) ?? 0} học liệu</strong><Link className="btn primary" href={lessonPath("teacher", lessonId, phase)}>Mở giai đoạn →</Link></article>)}</section>
  </TeacherShell>;
}
