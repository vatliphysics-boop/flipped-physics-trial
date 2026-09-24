import Link from "next/link";
import { StudentShell } from "../StudentShell";
import { GRADE_12_CURRICULUM } from "@/lib/curriculum";

export default function StudentCurriculumPage() {
  return (
    <StudentShell active="curriculum" eyebrow="Vật lí 12" title="Chương trình học" description="4 chương · 25 bài học theo cấu trúc chương trình giáo dục phổ thông.">
      <div className="curriculum-index" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 0" }}>
        

        <div className="chapter-list" style={{ display: "flex", flexDirection: "column" }}>
          {GRADE_12_CURRICULUM.map((chapter) => (
            <Link 
              href={`/student/curriculum/${chapter.code}`} 
              key={chapter.code}
              className="chapter-list-row"
              style={{
                display: "flex",
                alignItems: "flex-start",
                padding: "24px 0",
                borderBottom: "1px solid var(--border-light)",
                textDecoration: "none",
                color: "inherit"
              }}
            >
              <div style={{ width: "80px", flexShrink: 0, fontSize: "24px", color: "var(--text-muted)", fontWeight: 300, fontFamily: "serif" }}>
                0{chapter.number}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: "0 0 8px", fontSize: "20px", color: "var(--color-primary)", fontWeight: 600 }}>{chapter.title}</h2>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  {chapter.lessons.length} bài học
                </div>
              </div>
              <div style={{ paddingLeft: "16px", color: "var(--text-muted)", fontSize: "18px" }}>
                →
              </div>
            </Link>
          ))}
        </div>

      </div>
    </StudentShell>
  );
}