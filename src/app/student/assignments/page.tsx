import Link from "next/link";
import { StudentShell } from "../StudentShell";
import { createClient } from "@/lib/supabase/server";

export default async function StudentAssignmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // ACTUAL DB SCHEMA: lessons { id, topic_id, class_id, teacher_id, title, description, status, created_at, learning_objectives }
  // homework_title, homework_due_date, homework_status do not exist.
  // Show an empty assignments page \u2014 no runtime DB error.
  const { data: assignments, error } = user ? await supabase.from("lessons").select("id, title, classes!inner(name, class_members!inner(student_id))").eq("status", "published").eq("classes.class_members.student_id", user.id).order("created_at", { ascending: true }) : { data: [], error: null };
  
  return (
    <StudentShell active="assignments" title="Bài tập và kiểm tra" description="Các bài tập và yêu cầu thực hành giáo viên giao cho lớp.">
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
                      <div className="student-kicker">
                        LỚP {classItem.name}
                      </div>
                      <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: "var(--text-primary)", fontWeight: 600 }}>
                        {item.title}
                      </h3>
                    </div>
                    <Link className="btn" href={`/student/lessons/${item.id}/after-class`} style={{ backgroundColor: "transparent", color: "var(--color-primary)", border: "1px solid var(--border-dark)" }}>
                      Mở nhiệm vụ
                    </Link>
                  </article>
                ); 
              })}
            </div>
          ) : (
            <div className="student-empty" style={{ backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)" }}>
              <h2>Chưa có bài tập</h2>
              <p style={{ marginBottom: "24px" }}>Khi giáo viên giao bài, nhiệm vụ sẽ hiển thị tại đây.</p>
              <Link className="btn primary" href="/student/curriculum">Mở chương trình học</Link>
            </div>
          )}
        </section>
      </div>
    </StudentShell>
  );
}
