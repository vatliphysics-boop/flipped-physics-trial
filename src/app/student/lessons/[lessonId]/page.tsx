import Link from "next/link";
import { StudentShell } from "../../StudentShell";
import { LessonNavigation, lessonPath } from "@/components/learning/LessonNavigation";
import { getStudentLesson } from "@/lib/student-lesson";
import { LEARNING_PHASES, PHASE_META } from "@/lib/learning-phases";

export default async function StudentLessonOverview({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { supabase, lesson, classItem } = await getStudentLesson(lessonId);
  const { data: materials } = await supabase.from("lesson_materials").select("phase").eq("lesson_id", lessonId).eq("is_published", true);
  const count = new Map<string, number>();
  for (const item of materials ?? []) count.set(item.phase, (count.get(item.phase) ?? 0) + 1);
  return <StudentShell active="lessons" title={lesson.title} description="Chọn một giai đoạn để tiếp tục học.">
    <LessonNavigation role="student" lessonId={lessonId} className={classItem.name} lessonTitle={lesson.title} />
    <section className="lesson-overview-card card"><h2>{lesson.title}</h2><p>{lesson.learning_objectives || lesson.description || "Giáo viên chưa thêm mục tiêu học tập."}</p></section>
    <section className="lesson-stage-grid">{LEARNING_PHASES.map((phase) => { const isInClass = phase === "in_class"; return <article className={`card phase-card phase-${PHASE_META[phase].tone}`} key={phase}><span className="badge">{PHASE_META[phase].title}</span><h2>{PHASE_META[phase].title}</h2><p>{PHASE_META[phase].description}</p><strong>{count.get(phase) ?? 0} học liệu đã mở</strong><Link className="btn primary" href={lessonPath("student", lessonId, phase)}>{isInClass ? "Mở hoạt động trong giờ học" : "Mở giai đoạn →"}</Link></article>; })}</section>
  </StudentShell>;
}
