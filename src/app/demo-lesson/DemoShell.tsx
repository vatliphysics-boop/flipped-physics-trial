"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { NuclearScienceIllustration } from "@/components/learning/NuclearScienceIllustration";

export function DemoShell({ children }: { children: ReactNode }) {
  return (
    <div className="demo-shell" style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="public-topbar" style={{ position: "sticky", top: 0, zIndex: 100 }}>
        <div className="public-nav">
          <div className="public-brand">
            <div className="public-brand-mark">
              <NuclearScienceIllustration style={{ width: "24px", height: "24px", color: "var(--color-primary)" }} />
            </div>
            <span className="public-brand-text">Bài học minh họa</span>
          </div>
          <nav className="public-links">
            <Link href="/" className="public-link">Về trang chủ</Link>
          </nav>
        </div>
      </header>
      <main className="demo-main" style={{ flex: 1, width: "100%", maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
        {children}
      </main>
      <footer className="public-footer">
        <div className="public-footer-inner">
          <p>Học liệu số Vật lí hạt nhân 12 · Phiên bản MVP phục vụ nghiên cứu khoa học giáo dục.</p>
        </div>
      </footer>
    </div>
  );
}
