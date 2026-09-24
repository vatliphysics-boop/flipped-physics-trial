import { StudentShell } from "../StudentShell";
import { JoinClassForm } from "../JoinClassForm";
import { StudentClassList } from "../StudentClassList";
import { getStudentContext } from "@/lib/student-learning";

export default async function StudentClassesPage() {
  const state = await getStudentContext();
  return (
    <StudentShell active="classes" title="Lớp học của em" description="Tham gia lớp và theo dõi tiến độ học tập.">
      <div className="student-classes-page" style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 0" }}>
        
        <section className="student-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", marginBottom: "40px" }}>
          <div style={{ flexShrink: 0 }}>
            <h2 style={{ fontSize: "18px", margin: "0 0 8px", color: "var(--text-primary)", fontWeight: 600 }}>Tham gia lớp mới</h2>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)" }}>Nhập mã do giáo viên cung cấp</p>
          </div>
          <div style={{ flex: 1, maxWidth: "400px" }}>
            <JoinClassForm />
          </div>
        </section>

        <section className="class-list-section">
          <StudentClassList classes={state.classes} />
        </section>

      </div>
    </StudentShell>
  );
}
