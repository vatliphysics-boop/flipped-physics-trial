import Link from "next/link";
import { StudentShell } from "../StudentShell";
import { getStudentLearning } from "@/lib/student-learning";

export default async function StudentJournalPage() {
  const state = await getStudentLearning();
  const rows = state.lessons
    .filter((lesson) => lesson.reflection)
    .sort((a, b) => new Date(b.reflection!.updated_at).getTime() - new Date(a.reflection!.updated_at).getTime());

  return (
    <StudentShell active="journal" title="Nhật kí học tập" description="Ghi nhận điều em đã học, điều còn khó và mục tiêu tiếp theo.">
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 0" }}>
        <section className="journal-section">
          {rows.length === 0 ? (
            <div className="empty-state" style={{ padding: "64px 0", textAlign: "center", color: "var(--text-muted)", backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border-light)" }}>
              <h2 style={{ fontSize: "20px", color: "var(--text-primary)", marginBottom: "8px" }}>Em chưa có nhật kí học tập</h2>
              <p style={{ marginBottom: "24px" }}>Hoàn thành phần phản hồi sau giờ học để lưu lại quá trình học của mình.</p>
              <Link className="btn primary" href="/student/curriculum">Xem chương trình học →</Link>
            </div>
          ) : (
            <div className="journal-list" style={{ borderTop: "1px solid var(--border-light)" }}>
              {rows.map((lesson) => {
                const reflection = lesson.reflection!;
                return (
                  <article key={lesson.id} style={{ padding: "32px 0", borderBottom: "1px solid var(--border-light)" }}>
                    <div className="journal-entry-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                      <div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-primary)", fontWeight: 600 }}>{lesson.curriculum.code}</span>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)", backgroundColor: "var(--bg-surface-elevated)", padding: "2px 8px", borderRadius: "12px" }}>Lớp {lesson.className}</span>
                        </div>
                        <h2 style={{ fontSize: "20px", color: "var(--text-primary)", margin: 0, fontWeight: 600 }}>{lesson.curriculum.title}</h2>
                      </div>
                      <time dateTime={reflection.updated_at} style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>
                        {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(reflection.updated_at))}
                      </time>
                    </div>

                    <div style={{ backgroundColor: "var(--bg-page)", padding: "24px", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--border-dark)", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div>
                        <div style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "4px" }}>Em đã học được gì?</div>
                        <div style={{ color: "var(--text-primary)", fontSize: "16px", lineHeight: 1.6 }}>{reflection.learned}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "4px" }}>Điều gì còn khó?</div>
                        <div style={{ color: "var(--text-primary)", fontSize: "16px", lineHeight: 1.6 }}>{reflection.difficult || "Không ghi nhận."}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "4px" }}>Bước tiếp theo</div>
                        <div style={{ color: "var(--text-primary)", fontSize: "16px", lineHeight: 1.6 }}>{reflection.next_step || "Không ghi nhận."}</div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Mức độ tự tin: <strong style={{ color: "var(--text-primary)" }}>{reflection.confidence}/5</strong></div>
                      <Link className="btn" href={`/student/lessons/${lesson.id}`} style={{ color: "var(--color-primary)", fontSize: "14px", fontWeight: 500, backgroundColor: "transparent", border: "none" }}>Mở lại bài học →</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </StudentShell>
  );
}
