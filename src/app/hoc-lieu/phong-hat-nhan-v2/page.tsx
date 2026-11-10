import Link from "next/link";
import { PublicShell } from "@/app/PublicShell";
import { B21Lesson } from "@/components/physics/B21Lesson";
import { B22Lesson } from "@/components/physics/B22Lesson";
import { B23Lesson } from "@/components/physics/B23Lesson";
import { B24Lesson } from "@/components/physics/B24Lesson";
import { B25Lesson } from "@/components/physics/B25Lesson";

const LESSONS: Record<string, { Component: () => React.JSX.Element; title: string; shortTitle: string }> = {
  B21: { Component: B21Lesson, title: "Bài 21 – Cấu trúc hạt nhân", shortTitle: "Cấu trúc hạt nhân" },
  B22: { Component: B22Lesson, title: "Bài 22 – Phản ứng hạt nhân và năng lượng liên kết", shortTitle: "Phản ứng & Năng lượng liên kết" },
  B23: { Component: B23Lesson, title: "Bài 23 – Hiện tượng phóng xạ", shortTitle: "Hiện tượng phóng xạ" },
  B24: { Component: B24Lesson, title: "Bài 24 – Công nghiệp hạt nhân", shortTitle: "Công nghiệp hạt nhân" },
  B25: { Component: B25Lesson, title: "Bài 25 – Bài tập về vật lí hạt nhân", shortTitle: "Bài tập tổng hợp" },
};

export default async function NuclearLabV2Page({ searchParams }: { searchParams: Promise<{ bai?: string }> }) {
  const { bai } = await searchParams;
  const code = bai ?? "B21";
  const lesson = LESSONS[code];

  if (!lesson) {
    const available = Object.values(LESSONS).map((l) => l.title).join(" · ");
    return (
      <PublicShell>
        <div style={{ maxWidth: "var(--content-width)", margin: "0 auto", padding: "64px 32px", textAlign: "center" }}>
          <h1>Bài {bai ?? ""} chưa sẵn sàng trong phiên bản v2</h1>
          <p>Hiện có: {available}.</p>
        </div>
      </PublicShell>
    );
  }

  const Lesson = lesson.Component;
  return (
    <PublicShell floatingTutor={false} aiLessonCode={code}>
      <nav
        aria-label="Chuyển nhanh bài giảng tương tác v2"
        style={{
          borderBottom: "1px solid var(--border-light)",
          background: "var(--bg-surface)",
          padding: "10px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "12.5px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            Phòng học hạt nhân 3D (v2) · Chương IV
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {Object.entries(LESSONS).map(([key, item]) => {
              const active = key === code;
              return (
                <Link
                  key={key}
                  href={`/hoc-lieu/phong-hat-nhan-v2?bai=${key}`}
                  aria-current={active ? "page" : undefined}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: active ? 700 : 500,
                    textDecoration: "none",
                    background: active ? "var(--color-primary)" : "var(--bg-page)",
                    color: active ? "#ffffff" : "var(--text-primary)",
                    border: active ? "1px solid var(--color-primary)" : "1px solid var(--border-light)",
                  }}
                >
                  <strong>{key}</strong>
                  <span>{item.shortTitle}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      <Lesson />
    </PublicShell>
  );
}
