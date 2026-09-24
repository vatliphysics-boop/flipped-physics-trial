import Link from "next/link";
import { LEARNING_PHASES, type LearningPhase } from "@/lib/learning-phases";

type Lesson = { id: string; status: string; homework_status?: string | null };
type Props = { fixedLesson: { code: string; number: number; title: string }; lesson?: Lesson; materialCounts?: Partial<Record<LearningPhase, number>>; className?: string };

const phaseCopy: Record<LearningPhase, { label: string; title: string; description: string; icon: string; action: string }> = {
  before_class: { label: "PHA 1", title: "Chuẩn bị trước giờ học", description: "Xem bài giảng và chuẩn bị trước khi đến lớp.", icon: "▶", action: "Quản lý bài giảng" },
  in_class: { label: "PHA 2", title: "Mô phỏng và khám phá", description: "Khám phá mô phỏng, phục vụ tự học và hoạt động trên lớp.", icon: "✦", action: "Mở mô phỏng" },
  after_class: { label: "PHA 3", title: "Bài tập cuối bài", description: "Giao bài tập, kiểm tra và theo dõi sau giờ học.", icon: "✓", action: "Quản lý bài tập" },
};
const phasePath: Record<LearningPhase, string> = { before_class: "before-class", in_class: "in-class", after_class: "after-class" };

export function LessonLearningCard({ fixedLesson, lesson, materialCounts, className }: Props) {
  return <article className="curriculum-learning-card">
    <div className="curriculum-lesson-main"><span className="curriculum-lesson-code">{fixedLesson.code}</span><div><p className="curriculum-eyebrow">BÀI {fixedLesson.number}</p><h3>{fixedLesson.title}</h3><p>{lesson ? `Bài học của lớp ${className ?? "đã chọn"} đã sẵn sàng để quản lý.` : "Bài chưa được thiết lập cho lớp này."}</p></div>{lesson ? <Link className="curriculum-lesson-overview-link" href={`/teacher/lessons/${lesson.id}`}>Tổng quan bài</Link> : <span className="curriculum-lesson-overview-link is-disabled">Chưa có trang bài</span>}</div>
    <div className="curriculum-phase-grid" aria-label={`Ba pha của ${fixedLesson.title}`}>{LEARNING_PHASES.map((phase) => { const copy = phaseCopy[phase]; const count = materialCounts?.[phase] ?? 0; return <div className="curriculum-phase-card" key={phase}><span className="curriculum-phase-icon" aria-hidden="true">{copy.icon}</span><div><span>{copy.label}</span><h4>{copy.title}</h4><p>{copy.description}</p>{lesson ? <Link href={`/teacher/lessons/${lesson.id}/${phasePath[phase]}`}>{copy.action}{count > 0 ? ` (${count})` : ""} →</Link> : <span className="is-disabled">Cần thiết lập bài</span>}</div></div>; })}</div>
  </article>;
}

export function ChapterIllustration({ code }: { code: string }) { return <svg viewBox="0 0 220 150" aria-hidden="true"><circle cx="110" cy="75" r={code === "IV" ? 38 : 30} fill="none" stroke="currentColor" strokeWidth="8"/><circle cx="110" cy="75" r="12" fill="currentColor"/><path d="M48 75h35M137 75h35M110 20v30M110 100v30" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/><circle cx="76" cy="48" r="7" fill="currentColor"/><circle cx="148" cy="55" r="7" fill="currentColor"/></svg>; }
export const chapterDescriptions: Record<string, string> = { I: "Khảo sát nhiệt độ, nội năng và các quá trình nhiệt trong đời sống.", II: "Mô hình động học phân tử và các định luật của khí lí tưởng.", III: "Từ trường, cảm ứng điện từ và những ứng dụng của điện từ học.", IV: "Cấu trúc hạt nhân, phản ứng hạt nhân và các ứng dụng năng lượng." };
export const chapterTones: Record<string, string> = { I: "thermal", II: "gas", III: "magnetic", IV: "nuclear" };
