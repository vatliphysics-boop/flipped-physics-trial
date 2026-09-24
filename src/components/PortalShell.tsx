"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export type PortalRole = "teacher" | "student";
export type PortalSection = "overview" | "classes" | "curriculum" | "lessons" | "materials" | "students" | "assignments" | "journal";
export type NavigationItem = { label: string; href: string; section: PortalSection };

const navigation: Record<PortalRole, NavigationItem[]> = {
  teacher: [
    { section: "overview", label: "Tổng quan", href: "/teacher" },
    { section: "classes", label: "Lớp học", href: "/teacher/classes" },
    { section: "curriculum", label: "Chương trình Vật lí 12", href: "/teacher/curriculum" },
    { section: "materials", label: "Học liệu", href: "/teacher/materials" },
    { section: "students", label: "Học sinh và kết quả", href: "/teacher/students" },
  ],
  student: [
    { section: "overview", label: "Tổng quan", href: "/student" },
    { section: "classes", label: "Lớp học của em", href: "/student/classes" },
    { section: "curriculum", label: "Chương trình Vật lí 12", href: "/student/curriculum" },
    { section: "assignments", label: "Bài tập và kiểm tra", href: "/student/assignments" },
    { section: "journal", label: "Nhật kí học tập", href: "/student/journal" },
  ],
};

function Navigation({ role, active, onNavigate }: { role: PortalRole; active: PortalSection; onNavigate?: () => void }) {
  return <nav className="portal-nav" aria-label="Điều hướng chính">
    {navigation[role].map((item) => <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={item.section === active ? "page" : undefined} className={item.section === active ? "is-active" : ""}>{item.label}</Link>)}
  </nav>;
}

export function PortalShell({ role, active, children, account }: { role: PortalRole; active: PortalSection; children: ReactNode; account: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const desktopTrigger = useRef<HTMLButtonElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawer.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [mobileOpen]);
  useEffect(() => { if (!mobileOpen) mobileTrigger.current?.focus(); }, [mobileOpen]);

  const label = sidebarOpen ? "Ẩn menu" : "Hiện menu";
  return <div className={`portal-shell ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`} data-role={role}>
    <a className="skip-link" href="#main-content">Đi đến nội dung chính</a>
    <header className="portal-topbar">
      <button ref={desktopTrigger} type="button" className="menu-toggle desktop-toggle" aria-label={label} aria-expanded={sidebarOpen} aria-controls="portal-sidebar" onClick={() => setSidebarOpen((open) => !open)}><span aria-hidden="true">☰</span><span>{label}</span></button>
      <button ref={mobileTrigger} type="button" className="menu-toggle mobile-toggle" aria-label="Mở menu" aria-expanded={mobileOpen} aria-controls="portal-mobile-menu" onClick={() => setMobileOpen(true)}><span aria-hidden="true">☰</span><span>Menu</span></button>
      <Link className="portal-name" href={role === "teacher" ? "/teacher" : "/student"}>Học liệu Vật lí 12</Link>
      <div className="portal-account">{account}</div>
    </header>
    <aside id="portal-sidebar" className="portal-sidebar" aria-label="Thanh điều hướng"><div className="portal-sidebar-title"><strong>Học liệu Vật lí 12</strong><span>{role === "teacher" ? "Không gian giáo viên" : "Không gian học sinh"}</span></div><Navigation role={role} active={active} /></aside>
    {mobileOpen ? <div className="drawer-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileOpen(false); }}><aside ref={drawer} id="portal-mobile-menu" className="portal-drawer" aria-label="Menu di động" role="dialog" aria-modal="true"><div className="drawer-heading"><strong>Học liệu Vật lí 12</strong><button type="button" className="icon-button" aria-label="Đóng menu" onClick={() => setMobileOpen(false)}>×</button></div><Navigation role={role} active={active} onNavigate={() => setMobileOpen(false)} /></aside></div> : null}
    <main id="main-content" className="portal-main">{children}</main>
  </div>;
}
