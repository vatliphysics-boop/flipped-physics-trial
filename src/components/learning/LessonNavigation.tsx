import Link from "next/link";
import { LEARNING_PHASES, PHASE_META, type LearningPhase } from "@/lib/learning-phases";

type Role = "teacher" | "student";
const phaseSegment: Record<LearningPhase, string> = { before_class: "before-class", in_class: "in-class", after_class: "after-class" };
export function lessonPath(role: Role, lessonId: string, phase?: LearningPhase) {
  const base = `/${role}/lessons/${lessonId}`;
  return phase ? `${base}/${phaseSegment[phase]}` : base;
}
export function LessonNavigation({ role, lessonId, className, lessonTitle, active, classId, chapterCode }: { role: Role; lessonId: string; className: string; lessonTitle: string; active?: LearningPhase; classId?: string; chapterCode?: string }) {
  const curriculumHref = role === "teacher" && classId ? `/teacher/curriculum?classId=${classId}` : `/${role}/curriculum`;
  const classHref = role === "teacher" && classId ? `/teacher/classes/${classId}` : `/${role}/classes`;
  const chapterHref = role === "teacher" && classId && chapterCode ? `/teacher/curriculum/${chapterCode}?classId=${classId}` : curriculumHref;
  return <><nav className="breadcrumbs" aria-label="Đường dẫn"><Link href={classHref}>Về lớp {className}</Link><span>›</span><Link href={curriculumHref}>Chương trình Vật lí 12</Link>{chapterCode ? <><span>›</span><Link href={chapterHref}>Chương {chapterCode}</Link></> : null}<span>›</span><Link href={lessonPath(role, lessonId)}>Tổng quan bài</Link>{active ? <><span>›</span><strong>{PHASE_META[active].title}</strong></> : <><span>›</span><strong>{lessonTitle}</strong></>}</nav><nav className="phase-navigation" aria-label="Các pha bài học">{LEARNING_PHASES.map((phase, index) => <Link key={phase} className={active === phase ? "is-active" : ""} aria-current={active === phase ? "page" : undefined} href={lessonPath(role, lessonId, phase)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{PHASE_META[phase].title}</strong></Link>)}</nav>{role === "teacher" && <p><Link className="btn" href={`/teacher/lessons/${lessonId}/ket-qua`}>Xem nhiệm vụ và bài nộp của học sinh</Link></p>}</>;
}
