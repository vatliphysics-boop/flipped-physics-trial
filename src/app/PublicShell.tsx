"use client";

import type { ReactNode } from "react";
import { AIStudyHelp } from "@/components/learning/AIStudyHelp";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";

export function PublicShell({ children, hideFooter = false, floatingTutor = true, aiLessonCode }: {
  children: ReactNode;
  hideFooter?: boolean;
  floatingTutor?: boolean;
  aiLessonCode?: string;
}) {
  return <div className="public-shell">
    <a className="skip-link" href="#main-content">Đi đến nội dung chính</a>
    <SiteHeader />
    <main id="main-content" className="public-main">{children}</main>
    {!hideFooter && <SiteFooter />}
    {floatingTutor && <AIStudyHelp publicLibrary defaultLessonCode={aiLessonCode} />}
  </div>;
}
