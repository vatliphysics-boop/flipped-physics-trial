import Link from "next/link";
import { StudentShell } from "../StudentShell";
import { createClient } from "@/lib/supabase/server";

export default async function StudentAssignmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: assignments, error } = user ? await supabase.from("lessons").select("id, title, homework_title, homework_due_date, classes!inner(name, class_members!inner(student_id))").eq("status", "published").eq("homework_status", "published").eq("classes.class_members.student_id", user.id).order("homework_due_date", { ascending: true }) : { data: [], error: null };
  
  return (
    <StudentShell active="assignments" title="Nhiệm vụ học tập" description="Các bài tập và yêu cầu thực hành giáo viên giao cho lớp.">
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 0" }}>
        <section className="assignment-section">
          {error ? (
            <p role="alert" className="form-alert form-alert-error">Không thể tải bài tập. Vui lòng thử lại.</p>
          ) : assignments?.length ? (
            <div className="academic-list" style={{ borderTop: "1px solid var(--border-light)" }}>
              {assignments.map((item) => { 
                const classItem = item.classes as unknown as { name: string }; 
                return (
                  <article key={item.id} className="list-row chapter-list-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", borderBottom: "1px solid var(--border-light)", transition: "background-color 0.15s" }}>
                    <div style={{ flex: 1, paddingRight: "24px" }}>
                      <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-primary)", fontWeight: 600, marginBottom: "8px" }}>
                        LỚP {classItem.name}
                      </div>
                      <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: "var(--text-primary)", fontWeight: 600 }}>
                        {item.homework_title || item.title}
                      </h3>
                      {item.homework_due_date ? (
                        <p style={{ margin: 0, fontSize: "14px", color: "var(--semantic-warning)", fontWeight: 500 }}>
                          Hạn nộp: {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.homework_due_date))}
                        </p>
                      ) : (
                        <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>Không có hạn nộp</p>
                      )}
                    </div>
                    <Link className="btn" href={`/student/lessons/${item.id}/after-class`} style={{ backgroundColor: "transparent", color: "var(--color-primary)", border: "1px solid var(--border-dark)" }}>
                      Mở nhiệm vụ
                    </Link>
                  </article>
                ); 
              })}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "64px 0", textAlign: "center", color: "var(--text-muted)", backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border-light)" }}>
              <h2 style={{ fontSize: "20px", color: "var(--text-primary)", marginBottom: "8px" }}>Chưa có bài tập</h2>
              <p style={{ marginBottom: "24px" }}>Khi giáo viên giao bài, nhiệm vụ sẽ hiển thị tại đây.</p>
              <Link className="btn" href="/student/curriculum" style={{ backgroundColor: "var(--color-primary)", color: "white" }}>Mở chương trình học</Link>
            </div>
          )}
        </section>
      </div>
    </StudentShell>
  );
}
