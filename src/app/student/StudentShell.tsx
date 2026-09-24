import type { ReactNode } from "react";
import { PortalShell, type PortalSection } from "@/components/PortalShell";
import { LogoutButton } from "@/components/LogoutButton";

export { type PortalSection } from "@/components/PortalShell";

export function StudentShell({ active, title, description, children }: { active: PortalSection; title: string; description?: string; children: ReactNode }) {
  return <PortalShell role="student" active={active} account={<LogoutButton />}><header className="page-header"><div><p className="page-kicker">Không gian học sinh</p><h1>{title}</h1>{description ? <p className="page-description">{description}</p> : null}</div></header>{children}</PortalShell>;
}

