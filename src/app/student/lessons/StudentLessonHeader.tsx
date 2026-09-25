import Link from "next/link";
import { LEARNING_PHASES, PHASE_META, type LearningPhase } from "@/lib/learning-phases";

export function StudentLessonHeader({
  lessonId,
  lessonTitle,
  chapterCode,
  description,
  activePhase,
  phaseProgress,
}: {
  lessonId: string;
  lessonTitle: string;
  chapterCode?: string | null;
  description?: string | null;
  activePhase?: LearningPhase;
  phaseProgress: Record<LearningPhase, boolean>;
}) {
  return (
    <div className="student-lesson-header" style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", gap: "8px", fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px", marginTop: "16px" }}>
        <Link href="/student" style={{ textDecoration: "none", color: "inherit" }}>Vật lí 12</Link>
        {chapterCode && (
          <>
            <span>/</span>
            <Link href={`/student/curriculum/${chapterCode}`} style={{ textDecoration: "none", color: "inherit" }}>Chương {chapterCode}</Link>
          </>
        )}
        <span>/</span>
        <span style={{ color: "var(--text-primary)" }}>{lessonTitle}</span>
      </div>

      {/* Header */}
      <h1 style={{ fontSize: "32px", margin: "0 0 16px", color: "var(--text-primary)", fontWeight: 600, letterSpacing: "-0.02em" }}>
        {lessonTitle}
      </h1>
      {description && (
        <p style={{ fontSize: "16px", color: "var(--text-secondary)", maxWidth: "800px", margin: "0 0 32px", lineHeight: 1.6 }}>
          {description}
        </p>
      )}

      {/* Stepper / Tabs */}
      <nav style={{ display: "flex", borderBottom: "1px solid var(--border-light)", gap: "32px", marginBottom: "40px" }}>
        {LEARNING_PHASES.map((phase, index) => {
          const isActive = activePhase === phase;
          const isCompleted = phaseProgress[phase];
          
          let isLocked = false;
          if (phase === "in_class" && !phaseProgress.before_class) isLocked = true;
          if (phase === "after_class" && !phaseProgress.in_class) isLocked = true;

          const content = (
            <>
              <span style={{ fontSize: "12px", letterSpacing: "0.05em", opacity: 0.8 }}>0{index + 1}</span>
              <span style={{ textTransform: "uppercase", fontSize: "14px", letterSpacing: "0.05em", flex: 1 }}>{PHASE_META[phase].title}</span>
              {isCompleted && !isActive && <span style={{ color: "var(--semantic-success)" }}>✓</span>}
              {isLocked && <span style={{ opacity: 0.5 }}>🔒</span>}
            </>
          );

          const style = {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            paddingBottom: "16px",
            borderBottom: isActive ? "2px solid var(--color-primary)" : "2px solid transparent",
            color: isActive ? "var(--color-primary)" : isLocked ? "var(--text-muted)" : "var(--text-primary)",
            fontWeight: isActive ? 600 : 500,
            textDecoration: "none",
            marginBottom: "-1px",
            transition: "all 0.15s",
            opacity: isLocked ? 0.6 : 1,
            cursor: isLocked ? "not-allowed" : "pointer"
          };

          if (isLocked) {
            return <div key={phase} style={style}>{content}</div>;
          }

          return (
            <Link 
              key={phase} 
              href={`/student/lessons/${lessonId}/${phase.replace("_", "-")}`}
              style={style}
            >
              {content}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
