import Link from "next/link";
import { StudentShell } from "../StudentShell";
import { GRADE_12_CURRICULUM } from "@/lib/curriculum";

export default function StudentCurriculumPage() {
  return (
    <StudentShell active="curriculum" title="Chương trình Vật lí 12" description="Bốn chương, hai mươi lăm bài học theo cấu trúc chương trình giáo dục phổ thông.">
      <div className="curriculum-index" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 0" }}>
        
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "32px", borderBottom: "1px solid var(--border-dark)", paddingBottom: "16px" }}>
          CHƯƠNG TRÌNH VẬT LÍ 12
        </div>

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