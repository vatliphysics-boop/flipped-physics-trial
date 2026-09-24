import type { ReactNode } from "react";
import { PortalShell, type PortalSection } from "@/components/PortalShell";
import { LogoutButton } from "@/components/LogoutButton";

export function TeacherShell({ active, title, description, eyebrow = "Không gian giáo viên", breadcrumb, children }: { active: PortalSection; title: string; description: string; eyebrow?: string; breadcrumb?: ReactNode; children: ReactNode }) {
  return <PortalShell role="teacher" active={active} account={<LogoutButton />}><header className="page-header"><div>{breadcrumb}<p className="page-kicker">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div></header>{children}</PortalShell>;
}

