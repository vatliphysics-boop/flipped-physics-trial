import type { ReactNode } from "react";
import { PortalShell, type PortalSection } from "@/components/PortalShell";
import { LogoutButton } from "@/components/LogoutButton";

type LessonMeta = {
  chapterLabel: string;   // e.g. "CHƯƠNG IV"
  lessonLabel: string;    // e.g. "BÀI 21"
  className: string;      // e.g. "LỚP 12A2"
  lessonTitle: string;    // e.g. "Cấu trúc hạt nhân"
  phaseLabel: string;     // e.g. "Pha 2 · Trong giờ học"
  phaseDescription: string;
};

export function TeacherShell({ active, title, description, eyebrow = "Không gian giáo viên", breadcrumb, lessonMeta, children }: { active: PortalSection; title: string; description: string; eyebrow?: string; breadcrumb?: ReactNode; lessonMeta?: LessonMeta; children: ReactNode }) {
  if (lessonMeta) {
    return <PortalShell role="teacher" active={active} account={<LogoutButton />}>
      <header className="lesson-header">
        {breadcrumb}
        <p className="lesson-kicker">{lessonMeta.chapterLabel} · {lessonMeta.lessonLabel} · {lessonMeta.className}</p>
        <h1>{lessonMeta.lessonTitle}</h1>
        <p className="lesson-phase-label">{lessonMeta.phaseLabel} — {lessonMeta.phaseDescription}</p>
      </header>
      {children}
    </PortalShell>;
  }
  return <PortalShell role="teacher" active={active} account={<LogoutButton />}><header className="page-header"><div>{breadcrumb}<p className="page-kicker">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div></header>{children}</PortalShell>;
}
