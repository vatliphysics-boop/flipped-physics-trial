"use client";

import Link from "next/link";

export { type PortalRole, type PortalSection } from "./PortalShell";

type LegacyItem = { label: string; href: string; active?: boolean };

/** @deprecated Existing pages use this minimal legacy navigation until moved to PortalShell. */
export function AppSidebar({ items }: { items: LegacyItem[] }) {
  return <aside className="sidebar"><nav className="side-links" aria-label="Điều hướng chính">{items.map((item) => <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined} className={item.active ? "active" : ""}>{item.label}</Link>)}</nav></aside>;
}
