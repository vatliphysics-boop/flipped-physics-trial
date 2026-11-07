"use client";

import type { ReactNode } from "react";
import { Suspense, useEffect, useId, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PublicShell } from "@/app/PublicShell";
import { PublicWorkspaceContext } from "@/components/ui/SiteHeader";
import { SiteBrand } from "@/components/ui/SiteBrand";
import { SiteFooter } from "@/components/ui/SiteFooter";
import Link from "next/link";
import { AIStudyHelp } from "@/components/learning/AIStudyHelp";
import { GRADE_12_CURRICULUM } from "@/lib/curriculum";

export type PortalRole = "teacher" | "student";
export type PortalSection = "overview" | "classes" | "curriculum" | "lessons" | "materials" | "students" | "assignments" | "journal" | "plans" | "tutor";
export type NavigationItem = { label: string; href: string; section: PortalSection };

const navigation: Record<PortalRole, NavigationItem[]> = {
  teacher: [
    { section: "overview", label: "Tổng quan", href: "/teacher" },
    { section: "classes", label: "Lớp học", href: "/teacher/classes" },
    { section: "lessons", label: "Bài học", href: "/teacher/lessons" },
    { section: "curriculum", label: "Chương trình Vật lí 12", href: "/teacher/curriculum" },
    { section: "materials", label: "Học liệu", href: "/teacher/materials" },
    { section: "plans", label: "Kế hoạch dạy học của tôi", href: "/teacher/plans" },
    { section: "tutor", label: "Không gian giáo viên", href: "/teacher/ai" },
    { section: "students", label: "Học sinh và kết quả", href: "/teacher/students" },
  ],
  student: [
    { section: "materials", label: "Học liệu", href: "/student/materials" },
    { section: "tutor", label: "Học với AI", href: "/student/ai" },
    { section: "overview", label: "Tổng quan", href: "/student" },
    { section: "classes", label: "Lớp học của em", href: "/student/classes" },
    { section: "curriculum", label: "Chương trình Vật lí 12", href: "/student/curriculum" },
    { section: "assignments", label: "Bài tập và kiểm tra", href: "/student/assignments" },
    { section: "journal", label: "Nhật kí học tập", href: "/student/journal" },
  ],
};

const teacherMaterialSubItems = [
  { label: "Học theo hình · 3D · Video", href: "/hoc-lieu/truc-quan" },
  { label: "Hình thức lớp học đảo ngược", href: "/hoc-lieu/lop-hoc-dao-nguoc" },
  { label: "Tất cả học liệu", href: "/teacher/materials" },
  { label: "Ảnh tĩnh & Sơ đồ", href: "/teacher/materials?type=image" },
  { label: "Ảnh động & Minh họa", href: "/teacher/materials?type=animation" },
  { label: "Video thực tế / Thí nghiệm", href: "/teacher/materials?type=real_video" },
  { label: "Video bài giảng", href: "/teacher/materials?type=lecture_video" },
  { label: "Thí nghiệm 3D tương tác", href: "/teacher/materials?type=simulation" },
  { label: "PDF / Phiếu học tập", href: "/teacher/materials?type=document" },
  { label: "Câu hỏi & Nhiệm vụ", href: "/teacher/curriculum" },
  { label: "Đề giữa kỳ & Cuối kỳ", href: "/teacher/materials?type=assessment" },
];

function Navigation({ role, active, onNavigate }: { role: PortalRole; active: PortalSection; onNavigate?: () => void }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const submenuId = useId(), curriculumId = useId();
  const selectedSection = role === "student" && active === "lessons" ? "classes" : active;
  const [materialsExpanded, setMaterialsExpanded] = useState(active === "materials");
  const [curriculumExpanded, setCurriculumExpanded] = useState(active === "curriculum");
  function current(href: string) {
    const [urlPath, query] = href.split("?");
    if (pathname !== urlPath) return false;
    const expected = new URLSearchParams(query);
    return ["type", "chuong"].every(key => search.get(key) === expected.get(key));
  }
  return <nav className="portal-nav" aria-label="Điều hướng chính">
    {navigation[role].map(item => {
      if (item.section === "curriculum") return <div key={item.href} className="portal-nav-group">
        <button type="button" className={"portal-material-toggle " + (selectedSection === "curriculum" ? "is-active" : "")} aria-expanded={curriculumExpanded} aria-controls={curriculumId} onClick={() => setCurriculumExpanded(value => !value)}>{item.label}<span aria-hidden="true">{curriculumExpanded ? "−" : "+"}</span></button>
        {curriculumExpanded && <div id={curriculumId} className="portal-subnav" aria-label="Bốn chương Vật lí 12">
          <Link className="portal-subnav-link" href={item.href} aria-current={current(item.href) ? "page" : undefined} onClick={onNavigate}>Tất cả chương</Link>
          {GRADE_12_CURRICULUM.map(chapter => {
            const href = role === "teacher" ? "/teacher/curriculum?chuong=" + chapter.code : "/student/curriculum/" + chapter.code;
            return <Link key={chapter.code} className="portal-subnav-link" href={href} aria-current={current(href) || pathname === "/teacher/curriculum/" + chapter.code ? "page" : undefined} onClick={onNavigate}>Chương {chapter.number}: {chapter.shortTitle}</Link>;
          })}
        </div>}
      </div>;
      if (item.section === "materials") return <div key={item.href} className="portal-nav-group">
        <button type="button" className={"portal-material-toggle " + (selectedSection === "materials" ? "is-active" : "")} aria-expanded={materialsExpanded} aria-controls={submenuId} onClick={() => setMaterialsExpanded(value => !value)}>{item.label}<span aria-hidden="true">{materialsExpanded ? "−" : "+"}</span></button>
        {materialsExpanded && <div id={submenuId} className="portal-subnav" aria-label="Danh mục học liệu">{teacherMaterialSubItems.map(sub => {
          const href = role === "student" ? sub.href.replace("/teacher/", "/student/").replace("/student/curriculum", "/student/materials?type=colab") : sub.href;
          return <Link key={sub.href} href={href} className="portal-subnav-link" aria-current={current(href) ? "page" : undefined} onClick={onNavigate}>{sub.label}</Link>;
        })}</div>}
      </div>;
      return <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={item.section === selectedSection ? "page" : undefined} className={item.section === selectedSection ? "is-active" : ""}>{item.label}</Link>;
    })}
    <div className="portal-nav-footer"><Link href="/hoc-lieu" onClick={onNavigate}>Kho học liệu công khai ↗</Link></div>
  </nav>;
}

function WorkspaceNavigation(props: Parameters<typeof Navigation>[0]) {
  return <Suspense fallback={<p className="portal-nav-loading" role="status">Đang mở điều hướng…</p>}><Navigation {...props} /></Suspense>;
}

export function PortalShell({ role, active, children, account, publicLibrary = false, aiLessonCode, floatingTutor = true }: { role: PortalRole; active: PortalSection; children: ReactNode; account: ReactNode; publicLibrary?: boolean; aiLessonCode?: string; floatingTutor?: boolean }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const desktopTrigger = useRef<HTMLButtonElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const triggerEl = mobileTrigger.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawer.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const handleDrawerKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const controls = Array.from(drawer.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? []).filter(element => element.getClientRects().length > 0);
      const first = controls[0], last = controls.at(-1);
      if (!first || !last) return;
      const outside = !drawer.current?.contains(document.activeElement);
      if (outside || (event.shiftKey ? document.activeElement === first : document.activeElement === last)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    };
    window.addEventListener("keydown", handleDrawerKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleDrawerKey);
      triggerEl?.focus();
    };
  }, [mobileOpen]);

  if (publicLibrary) return <PublicShell floatingTutor={floatingTutor} aiLessonCode={aiLessonCode}>
    <div className="public-workspace"><PublicWorkspaceContext />{children}</div>
  </PublicShell>;

  const label = sidebarOpen ? "Ẩn menu" : "Hiện menu";
  return <div className={`portal-shell ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`} data-role={role}>
    <a className="skip-link" href="#main-content">Đi đến nội dung chính</a>
    
    <header className="portal-topbar" inert={mobileOpen}>
      <div className="topbar-left">
        <button ref={desktopTrigger} type="button" className="menu-toggle desktop-toggle" aria-label={label} aria-expanded={sidebarOpen} aria-controls="portal-sidebar" onClick={() => setSidebarOpen((open) => !open)}>
          <span aria-hidden="true">☰</span>
        </button>
        <button ref={mobileTrigger} type="button" className="menu-toggle mobile-toggle" aria-label="Mở menu" aria-expanded={mobileOpen} aria-controls="portal-mobile-menu" onClick={() => setMobileOpen(true)}>
          <span aria-hidden="true">☰</span>
        </button>
        <SiteBrand href={role === "teacher" ? "/teacher" : "/student"} />

      </div>
      <div className="portal-account">{account}</div>
    </header>

    <div className="portal-body">
      <aside id="portal-sidebar" className="portal-sidebar" aria-label="Thanh điều hướng" inert={mobileOpen}>
        <div className="portal-sidebar-context">{role === "teacher" ? "Không gian giáo viên" : "Không gian học sinh"}</div>
        <WorkspaceNavigation role={role} active={active} />
      </aside>
      
      {mobileOpen ? <div className="drawer-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileOpen(false); }}><aside ref={drawer} id="portal-mobile-menu" className="portal-drawer" aria-label="Menu di động" role="dialog" aria-modal="true"><div className="drawer-heading"><strong>{role === "teacher" ? "Không gian giáo viên" : "Không gian học sinh"}</strong><button type="button" className="icon-button" aria-label="Đóng menu" onClick={() => setMobileOpen(false)}>×</button></div><WorkspaceNavigation role={role} active={active} onNavigate={() => setMobileOpen(false)} /></aside></div> : null}
      
      <main id="main-content" className="portal-main" inert={mobileOpen}>{children}</main>
    </div>
    <SiteFooter compact />
    {floatingTutor && <div inert={mobileOpen}><AIStudyHelp key={aiLessonCode || "general"} publicLibrary={publicLibrary} defaultLessonCode={aiLessonCode}/></div>}
  </div>;
}
