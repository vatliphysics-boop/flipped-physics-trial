import type { ReactNode } from "react";
import { PortalShell, type PortalSection } from "@/components/PortalShell";
import { LogoutButton } from "@/components/LogoutButton";
import styles from "./student-ui.module.css";
import { getStudentContext } from "@/lib/student-learning";

export { type PortalSection } from "@/components/PortalShell";

export async function StudentShell({
  active,
  title,
  description,
  eyebrow,
  children,
  aiLessonCode,
}: {
  active: PortalSection;
  title: string;
  description?: string;
  eyebrow?: string;
  children: ReactNode;
  aiLessonCode?: string;
}) {
  await getStudentContext();
  const kicker = eyebrow ?? "Không gian học sinh";
  return (
    <PortalShell aiLessonCode={aiLessonCode} role="student" active={active} account={<LogoutButton />}>
      <header className="page-header">
        <div>
          <p className="page-kicker">{kicker}</p>
          <h1>{title}</h1>
          {description ? <p className="page-description">{description}</p> : null}
        </div>
      </header>
      <div className={styles.workspace}>{children}</div>
    </PortalShell>
  );
}
