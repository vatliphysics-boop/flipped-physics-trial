"use client";

import Link from "next/link";
import { NuclearScienceIllustration } from "@/components/learning/NuclearScienceIllustration";

export function PublicShell({ children, hideFooter = false }: { children: React.ReactNode; hideFooter?: boolean }) {
  return (
    <div className="public-shell">
      <header className="public-topbar">
        <div className="public-nav">
          <Link href="/" className="public-brand">
            <div className="public-brand-mark">
              <NuclearScienceIllustration style={{ width: "24px", height: "24px", color: "var(--color-primary)" }} />
            </div>
            <span className="public-brand-text">Học liệu số Vật lí hạt nhân 12</span>
          </Link>
          <nav className="public-links">
            <Link href="/demo-lesson" className="public-link">Bài học minh họa</Link>
            <Link href="/login" className="public-link">Đăng nhập</Link>
            <Link href="/register" className="public-link-btn">Đăng ký</Link>
          </nav>
        </div>
      </header>
      <main className="public-main">
        {children}
      </main>
      {!hideFooter && (
        <footer className="public-footer">
          <div className="public-footer-inner">
            <p>Học liệu số Vật lí hạt nhân 12 · Phiên bản MVP phục vụ nghiên cứu khoa học giáo dục.</p>
          </div>
        </footer>
      )}
    </div>
  );
}
