"use client";

import React, { useState } from "react";
import { getScientistsByLesson } from "./ScientistPortraits";
import { CosmicScientistCard } from "./InfographicReels";
import { LatexMath } from "./LatexMath";

const LESSON_SCIENTIST_HEADERS: Record<
  string,
  { badge: string; title: string; subtitle: string; latex: string }
> = {
  B21: {
    badge: "BÀI 21 · CẤU TRÚC HẠT NHÂN (SGK TR. 91–95)",
    title: "Các nhà khoa học trong Bài 21: Từ Electron đến Hạt nhân và Neutron",
    subtitle:
      "Ảnh chân dung lưu trữ chính thức và mô hình 3D tương tác của các nhà khoa học xuất hiện trong Bài 21 (Democritus, John Dalton, J.J. Thomson, Ernest Rutherford, Niels Bohr, Erwin Schrödinger, James Chadwick).",
    latex: "{}_{2}^{4}\\mathrm{He} + {}_{4}^{9}\\mathrm{Be} \\rightarrow {}_{6}^{12}\\mathrm{C} + {}_{0}^{1}\\mathrm{n}",
  },
  B22: {
    badge: "BÀI 22 · PHẢN ỨNG HẠT NHÂN & NĂNG LƯỢNG LIÊN KẾT (SGK TR. 96–103)",
    title: "Các nhà khoa học trong Bài 22: Rutherford, Blackett, Einstein, Hahn & Meitner",
    subtitle:
      "Ảnh chân dung chính thức và mô phỏng 3D của các nhà khoa học gắn liền với Bài 22: Phản ứng hạt nhân đầu tiên (Rutherford 1919), ảnh chụp buồng sương (Blackett 1925), hệ thức khối lượng - năng lượng nghỉ (Einstein 1905) và phát hiện phân hạch U-235 (Hahn & Meitner 1938).",
    latex: "{}_{2}^{4}\\mathrm{He} + {}_{7}^{14}\\mathrm{N} \\rightarrow {}_{8}^{17}\\mathrm{O} + {}_{1}^{1}\\mathrm{p}, \\qquad E_{\\text{lk}} = \\Delta m \\cdot c^2",
  },
  B23: {
    badge: "BÀI 23 · HIỆN TƯỢNG PHÓNG XẠ (SGK TR. 104–112)",
    title: "Các nhà khoa học trong Bài 23: Henri Becquerel (Bq) và Marie – Pierre Curie (Ci)",
    subtitle:
      "Ảnh chân dung lưu trữ chính thức và mô phỏng 3D của Henri Becquerel và ông bà Marie & Pierre Curie — những người đặt nền móng cho hiện tượng phóng xạ và hai đơn vị độ phóng xạ Becquerel (Bq), Curie (Ci) trong Bài 23.",
    latex: "1\\text{ Bq} = 1\\text{ phân rã/s}, \\qquad 1\\text{ Ci} = 3{,}7 \\times 10^{10}\\text{ Bq}",
  },
  B24: {
    badge: "BÀI 24 · CÔNG NGHỆ HẠT NHÂN VÀ NGUYÊN TẮC AN TOÀN (SGK TR. 113–119)",
    title: "Các nhà khoa học trong Bài 24: Enrico Fermi, Otto Hahn & Willard Libby",
    subtitle:
      "Ảnh chân dung lưu trữ chính thức và mô phỏng 3D của các nhà khoa học gắn với Bài 24: Lò phản ứng hạt nhân đầu tiên Chicago Pile-1 (Enrico Fermi 1942), hiện tượng phân hạch Uranium (Otto Hahn & Lise Meitner 1938) và phương pháp định tuổi bằng đồng vị Carbon-14 (Willard Libby 1946).",
    latex: "{}_{0}^{1}\\mathrm{n} + {}_{92}^{235}\\mathrm{U} \\rightarrow {}_{56}^{141}\\mathrm{Ba} + {}_{36}^{92}\\mathrm{Kr} + 3\\,{}_{0}^{1}\\mathrm{n}, \\qquad {}_{6}^{14}\\mathrm{C} \\rightarrow {}_{7}^{14}\\mathrm{N} + {}_{-1}^{0}\\mathrm{e}",
  },
  B25: {
    badge: "BÀI 25 · THỰC HÀNH VẬT LÍ HẠT NHÂN (SGK TR. 120–122)",
    title: "Các nhà khoa học gắn với đơn vị độ phóng xạ thực hành (Bq và Ci)",
    subtitle:
      "Hai nhà khoa học được đặt tên cho đơn vị đo độ phóng xạ hệ SI (Becquerel - Bq) và đơn vị thực tế (Curie - Ci) sử dụng xuyên suốt bài thực hành Bảng 25.1 và an toàn bức xạ ALARA.",
    latex: "H(t) = \\lambda N(t) = H_0 \\cdot 2^{-\\frac{t}{T}}",
  },
  ALL: {
    badge: "CHƯƠNG IV · VẬT LÍ HẠT NHÂN (SGK TR. 91–122)",
    title: "Hồ sơ chính thức các nhà khoa học Nguyên tử và Hạt nhân theo từng bài SGK",
    subtitle:
      "Tổng hợp ảnh chân dung lịch sử chính thức (Nobel Foundation / Lưu trữ quốc tế) và mô hình 3D tương tác của các nhà khoa học xuất hiện trong Chương IV SGK Vật lí 12.",
    latex: "E = mc^2, \\qquad N(t) = N_0 \\cdot e^{-\\lambda t}",
  },
};

export function NuclearHistory({
  lessonCode = "B21",
  onSelectLesson,
}: {
  lessonCode?: string;
  onSelectLesson?: (code: string) => void;
}) {
  const normalizedLessonCode = lessonCode.toUpperCase();
  const [prevPropCode, setPrevPropCode] = useState(normalizedLessonCode);
  const [activeCode, setActiveCode] = useState(normalizedLessonCode);
  const [selectedSection, setSelectedSection] = useState<string>("ALL");

  if (normalizedLessonCode !== prevPropCode) {
    setPrevPropCode(normalizedLessonCode);
    setActiveCode(normalizedLessonCode);
    setSelectedSection("ALL");
  }

  function handleSwitchLesson(code: string) {
    setActiveCode(code);
    setSelectedSection("ALL");
    onSelectLesson?.(code);
  }

  const allScientists = getScientistsByLesson(activeCode);
  const meta = LESSON_SCIENTIST_HEADERS[activeCode] ?? LESSON_SCIENTIST_HEADERS.ALL;

  // Extract unique sections available in this lesson
  const sectionsInLesson = Array.from(
    new Set(allScientists.map((s) => s.sectionCode).filter(Boolean))
  );

  const displayedScientists =
    selectedSection === "ALL"
      ? allScientists
      : allScientists.filter((s) => s.sectionCode === selectedSection);

  return (
    <section
      aria-label={`Các nhà khoa học trong ${activeCode}`}
      style={{
        background: "#ffffff",
        color: "#0f172a",
        borderRadius: "16px",
        padding: "26px 22px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
        marginTop: "24px",
      }}
    >
      {/* Header with Lesson Switcher Buttons & Meta Info */}
      <div
        style={{
          marginBottom: "20px",
          borderBottom: "1px solid var(--border-light)",
          paddingBottom: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <span
            className="mono-tag"
            style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: "4px",
              background: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
              fontSize: "11.5px",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            {meta.badge}
          </span>

          {/* Quick Lesson Switcher: B21, B22, B23, B24, B25 */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-muted)" }}>
              Chọn bài SGK:
            </span>
            {["B21", "B22", "B23", "B24", "B25"].map((code) => {
              const active = activeCode === code;
              return (
                <button
                  key={code}
                  type="button"
                  className="mono-tag"
                  onClick={() => handleSwitchLesson(code)}
                  style={{
                    padding: "5px 11px",
                    borderRadius: "5px",
                    border: active
                      ? "1px solid var(--color-primary)"
                      : "1px solid var(--border-dark)",
                    background: active ? "var(--color-primary)" : "var(--bg-surface)",
                    color: active ? "#ffffff" : "var(--text-secondary)",
                    fontWeight: active ? 600 : 500,
                    fontSize: "12.5px",
                    cursor: "pointer",
                  }}
                >
                  {code}
                </button>
              );
            })}
          </div>
        </div>

        <h3
          style={{
            margin: "0 0 8px",
            color: "var(--text-primary)",
            fontSize: "21px",
            fontWeight: 700,
          }}
        >
          {meta.title}
        </h3>
        <p
          style={{
            margin: "0 0 14px",
            color: "var(--text-secondary)",
            fontSize: "14.5px",
            lineHeight: 1.6,
          }}
        >
          {meta.subtitle}
        </p>

        <div
          style={{
            display: "inline-block",
            padding: "8px 16px",
            background: "var(--bg-page)",
            border: "1px solid var(--border-light)",
            borderRadius: "6px",
          }}
        >
          <LatexMath math={meta.latex} />
        </div>
      </div>

      {/* Section Filter Tabs: Tất cả, Mục I, Mục II, Mục III... */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
          background: "var(--bg-page)",
          border: "1px solid var(--border-light)",
          borderRadius: "8px",
          padding: "10px 14px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
            Lọc theo mục SGK:
          </span>
          <button
            type="button"
            onClick={() => setSelectedSection("ALL")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "5px",
              fontSize: "12.5px",
              fontWeight: selectedSection === "ALL" ? 600 : 500,
              border:
                selectedSection === "ALL"
                  ? "1px solid var(--color-primary)"
                  : "1px solid var(--border-dark)",
              background:
                selectedSection === "ALL" ? "var(--color-primary)" : "var(--bg-surface)",
              color: selectedSection === "ALL" ? "#ffffff" : "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            <span>Tất cả</span>
            <span className="mono-tag" style={{ fontSize: "11px", opacity: 0.8 }}>
              ({allScientists.length})
            </span>
          </button>

          {sectionsInLesson.map((sec) => {
            const count = allScientists.filter((s) => s.sectionCode === sec).length;
            const isSelected = selectedSection === sec;
            return (
              <button
                key={sec}
                type="button"
                onClick={() => setSelectedSection(sec)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "5px",
                  fontSize: "12.5px",
                  fontWeight: isSelected ? 600 : 500,
                  border: isSelected
                    ? "1px solid var(--color-primary)"
                    : "1px solid var(--border-dark)",
                  background: isSelected ? "var(--color-primary)" : "var(--bg-surface)",
                  color: isSelected ? "#ffffff" : "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                <span>{sec}</span>
                <span className="mono-tag" style={{ fontSize: "11px", opacity: 0.8 }}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        <span className="mono-tag" style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          Hiển thị <strong>{displayedScientists.length}</strong> nhà khoa học
        </span>
      </div>

      {/* Scientist Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
          gap: "18px",
        }}
      >
        {displayedScientists.map((profile) => (
          <CosmicScientistCard key={profile.id} profile={profile} />
        ))}
      </div>
    </section>
  );
}
