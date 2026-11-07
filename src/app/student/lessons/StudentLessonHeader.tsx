import Link from "next/link";
import { LEARNING_PHASES, PHASE_META, type LearningPhase } from "@/lib/learning-phases";
import styles from "../student-ui.module.css";

export function StudentLessonHeader({
  lessonId,
  lessonTitle,
  chapterCode,
  lessonCode,
  description,
  activePhase,
  phaseProgress,
}: {
  lessonId: string;
  lessonTitle: string;
  chapterCode?: string | null;
  lessonCode?: string;
  description?: string | null;
  activePhase?: LearningPhase;
  phaseProgress: Record<LearningPhase, boolean>;
}) {
  return (
    <header className={`student-lesson-header ${styles.lessonHeader}`}>
      <nav className={styles.breadcrumb} aria-label="Đường dẫn bài học">
        <Link href="/student">Vật lí 12</Link>
        {chapterCode && <><span aria-hidden="true">/</span><Link href={`/student/curriculum/${chapterCode}`}>Chương {chapterCode}</Link></>}
        <span aria-hidden="true">/</span><span aria-current="page">{lessonTitle}</span>
      </nav>
      <h1>{lessonTitle}</h1>
      {description && <p className={styles.description}>{description}</p>}
      {lessonCode && /^B2[1-5]$/.test(lessonCode) && <p className={styles.aiEntry}>
        <Link className="btn" href={`/student/ai?bai=${lessonCode}`}>Học với AI · {lessonCode}</Link>
        <span>Giải thích, gợi ý và ghi lại điều cần kiểm tra.</span>
      </p>}
      <nav className={styles.phaseNav} aria-label="Ba pha bài học">
        {LEARNING_PHASES.map((phase, index) => {
          const isActive = activePhase === phase;
          const isCompleted = phaseProgress[phase];
          const isLocked = (phase === "in_class" && !phaseProgress.before_class) || (phase === "after_class" && !phaseProgress.in_class);
          const className = `${styles.phase} ${isActive ? styles.phaseActive : ""} ${isLocked ? styles.phaseLocked : ""}`;
          const content = <>
            <span className={styles.phaseNumber} aria-hidden="true">0{index + 1}</span>
            <span className={styles.phaseText}>
              <strong>{PHASE_META[phase].title}</strong>
              <small>{isLocked ? "Chưa mở" : isActive ? "Đang xem" : isCompleted ? "Đã hoàn thành" : "Mở nhiệm vụ"}</small>
            </span>
          </>;
          return isLocked
            ? <div key={phase} className={className} aria-disabled="true" title="Hoàn thành pha trước để mở nhiệm vụ này">{content}</div>
            : <Link key={phase} className={className} href={`/student/lessons/${lessonId}/${phase.replace("_", "-")}`} aria-current={isActive ? "step" : undefined}>{content}</Link>;
        })}
      </nav>
    </header>
  );
}
