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

const teacherMaterialSubItems = [
  { label: "Tất cả học liệu", href: "/teacher/materials" },
  { label: "Ảnh tĩnh & Sơ đồ", href: "/teacher/materials?type=image" },
  { label: "Ảnh động (GIF)", href: "/teacher/materials?type=animation" },
  { label: "Video thực tế / Thí nghiệm", href: "/teacher/materials?type=real_video" },
  { label: "Video bài giảng", href: "/teacher/materials?type=lecture_video" },
  { label: "Mô phỏng tương tác", href: "/teacher/materials?type=simulation" },
  { label: "PDF / Phiếu học tập", href: "/teacher/materials?type=document" },
  { label: "Câu hỏi & Nhiệm vụ", href: "/teacher/curriculum" },
];

function Navigation({ role, active, onNavigate }: { role: PortalRole; active: PortalSection; onNavigate?: () => void }) {
  const [materialsExpanded, setMaterialsExpanded] = useState(active === "materials");

  return <nav className="portal-nav" aria-label="Điều hướng chính">
    {navigation[role].map((item) => {
      const isMaterials = role === "teacher" && item.section === "materials";
      if (isMaterials) {
        return (
          <div key={item.href} className="portal-nav-group">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={item.section === active ? "page" : undefined}
                className={item.section === active ? "is-active" : ""}
                style={{ flex: 1 }}
              >
                {item.label}
              </Link>
              <button
                type="button"
                className="icon-button"
                style={{ padding: "4px 8px", fontSize: "11px", color: "var(--text-muted)" }}
                aria-label={materialsExpanded ? "Thu gọn menu học liệu" : "Mở rộng menu học liệu"}
                onClick={() => setMaterialsExpanded(!materialsExpanded)}
              >
                {materialsExpanded ? "▲" : "▼"}
              </button>
            </div>
            {materialsExpanded && (
              <div className="portal-subnav" aria-label="Danh mục học liệu">
                {teacherMaterialSubItems.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={onNavigate}
                    className="portal-subnav-link"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      }

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          aria-current={item.section === active ? "page" : undefined}
          className={item.section === active ? "is-active" : ""}
        >
          {item.label}
        </Link>
      );
    })}
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
      <div className="topbar-left">
        <button ref={desktopTrigger} type="button" className="menu-toggle desktop-toggle" aria-label={label} aria-expanded={sidebarOpen} aria-controls="portal-sidebar" onClick={() => setSidebarOpen((open) => !open)}>
          <span aria-hidden="true">☰</span>
          {/* Only show label if visual is better, but user said "hoặc chỉ ☰ nếu visual tốt hơn", let's keep label for now as it was or just ☰ */}
          {/* Wait, user said "Nhưng phải nằm trong Topbar, sát title Học liệu Vật lí 12." */}
        </button>
        <button ref={mobileTrigger} type="button" className="menu-toggle mobile-toggle" aria-label="Mở menu" aria-expanded={mobileOpen} aria-controls="portal-mobile-menu" onClick={() => setMobileOpen(true)}>
          <span aria-hidden="true">☰</span>
        </button>
        <Link className="portal-name" href={role === "teacher" ? "/teacher" : "/student"}>Học liệu Vật lí 12</Link>
      </div>
      <div className="portal-account">{account}</div>
    </header>

    <div className="portal-body">
      <aside id="portal-sidebar" className="portal-sidebar" aria-label="Thanh điều hướng">
        <Navigation role={role} active={active} />
      </aside>
      
      {mobileOpen ? <div className="drawer-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileOpen(false); }}><aside ref={drawer} id="portal-mobile-menu" className="portal-drawer" aria-label="Menu di động" role="dialog" aria-modal="true"><div className="drawer-heading"><strong>Học liệu Vật lí 12</strong><button type="button" className="icon-button" aria-label="Đóng menu" onClick={() => setMobileOpen(false)}>×</button></div><Navigation role={role} active={active} onNavigate={() => setMobileOpen(false)} /></aside></div> : null}
      
      <main id="main-content" className="portal-main">{children}</main>
    </div>
  </div>;
}
