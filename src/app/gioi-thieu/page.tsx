"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicShell } from "../PublicShell";
import { getSectionInfographicsByLesson } from "@/data/infographic-reels-all";
import { InfographicGallery } from "@/components/learning/InfographicReels";
import { NuclearHistory } from "@/components/learning/NuclearHistory";
import { VideoShowcase } from "@/components/learning/VideoShowcase";
import { LatexMath } from "@/components/learning/LatexMath";

const LESSON_TABS = [
  {
    code: "B21",
    label: "Bài 21 · Cấu trúc hạt nhân",
    latex: "A = Z + N, \\quad R \\approx 1{,}2 \\times 10^{-15} \\cdot A^{1/3}\\text{ m}",
  },
  {
    code: "B22",
    label: "Bài 22 · Năng lượng liên kết & Phản ứng hạt nhân",
    latex: "\\Delta m = Z m_p + (A - Z) m_n - m_X, \\quad E_{\\text{lk}} = \\Delta m \\cdot c^2",
  },
  {
    code: "B23",
    label: "Bài 23 · Hiện tượng phóng xạ",
    latex: "N(t) = N_0 \\cdot 2^{-\\frac{t}{T}} = N_0 \\cdot e^{-\\lambda t}, \\quad H(t) = \\lambda N(t)",
  },
  {
    code: "B24",
    label: "Bài 24 · Công nghiệp hạt nhân",
    latex: "{}_{0}^{1}\\mathrm{n} + {}_{92}^{235}\\mathrm{U} \\rightarrow {}_{56}^{141}\\mathrm{Ba} + {}_{36}^{92}\\mathrm{Kr} + 3\\,{}_{0}^{1}\\mathrm{n} + 200\\text{ MeV}",
  },
  {
    code: "B25",
    label: "Bài 25 · Bài tập & Thực hành hạt nhân",
    latex: "t = \\frac{T}{\\ln 2}\\ln\\!\\left(\\frac{H_0}{H(t)}\\right), \\quad I \\propto \\frac{1}{r^2}",
  },
] as const;

export default function GioiThieuPage() {
  const [activeTab, setActiveTab] = useState<string>("B21");
  const currentMeta =
    LESSON_TABS.find((t) => t.code === activeTab) ?? LESSON_TABS[0];

  return (
    <PublicShell>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 24px 64px",
        }}
      >
        {/* Editorial Header */}
        <header
          style={{
            borderBottom: "1px solid var(--border-light)",
            paddingBottom: "28px",
            marginBottom: "32px",
          }}
        >
          <p
            className="mono-tag"
            style={{
              margin: "0 0 8px",
              fontSize: "11.5px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--text-muted)",
            }}
          >
            SGK VẬT LÍ 12 KẾT NỐI TRI THỨC · TƯ LIỆU TRỰC QUAN &amp; LỊCH SỬ KHOA HỌC
          </p>
          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "clamp(26px, 3.2vw, 36px)",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Infographic Sơ đồ hóa và Hồ sơ Nhà khoa học theo Bài học
          </h1>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: "15.5px",
              lineHeight: 1.65,
              color: "var(--text-secondary)",
              maxWidth: "860px",
            }}
          >
            Tổng hợp hệ thống sơ đồ kiến thức theo từng mục sách giáo khoa và tư liệu lưu trữ về các nhà vật lí gắn liền với lịch sử phát triển Vật lí Hạt nhân từ Bài 21 đến Bài 25.
          </p>

          {/* Lesson Tabs */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            {LESSON_TABS.map((tab) => {
              const isActive = activeTab === tab.code;
              return (
                <button
                  key={tab.code}
                  type="button"
                  className="btn"
                  aria-pressed={isActive}
                  onClick={() => setActiveTab(tab.code)}
                  style={{
                    maxWidth: "100%",
                    whiteSpace: "normal",
                    textAlign: "left",
                    background: isActive ? "var(--color-primary)" : "var(--bg-surface)",
                    color: isActive ? "#ffffff" : "var(--text-primary)",
                    border: isActive
                      ? "1px solid var(--color-primary)"
                      : "1px solid var(--border-dark)",
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Crisp LaTeX Formula Bar for the Selected Lesson */}
          <div
            className="editorial-surface"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              padding: "14px 18px",
              background: "var(--bg-surface)",
            }}
          >
            <div>
              <span
                className="mono-tag"
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  marginRight: "12px",
                }}
              >
                HỆ THỨC TRỌNG TÂM ({currentMeta.code}):
              </span>
              <LatexMath math={currentMeta.latex} />
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Link
                href={`/hoc-lieu/truc-quan?bai=${activeTab}`}
                className="btn primary"
                style={{
                  padding: "8px 14px",
                  fontSize: "13px",
                }}
              >
                Mở Phòng thí nghiệm 3D ({activeTab}) →
              </Link>
              <Link
                href="/demo-lesson"
                className="btn"
                style={{
                  padding: "8px 14px",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                }}
              >
                Tiến trình 3 giai đoạn
              </Link>
            </div>
          </div>
        </header>

        <InfographicGallery reels={getSectionInfographicsByLesson(activeTab)} />

        <NuclearHistory lessonCode={activeTab} />

        <section style={{ marginTop: "36px" }}>
          <details className="visual-detail">
            <summary>
              Tư liệu Video minh họa: Sự tiến hóa của Mô hình Nguyên tử &amp; Liên kết Hóa học
            </summary>
            <p style={{ margin: "8px 0 16px", color: "var(--text-secondary)" }}>
              Tư liệu trực quan tóm tắt quá trình phát triển nhận thức về cấu tạo nguyên tử (Dalton, Thomson, Rutherford, Bohr, Schrödinger) và các dạng tương tác vi mô.
            </p>
            <VideoShowcase />
          </details>
        </section>
      </div>
    </PublicShell>
  );
}
