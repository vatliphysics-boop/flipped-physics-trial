import { StudentShell } from "../StudentShell";
import { JoinClassForm } from "../JoinClassForm";
import { StudentClassList } from "../StudentClassList";
import styles from "../student-ui.module.css";
import { getStudentContext } from "@/lib/student-learning";

export default async function StudentClassesPage() {
  const state = await getStudentContext();
  return (
    <StudentShell active="classes" title="Lớp học của em" description="Tham gia và quản lý các lớp học của em.">
      <div className={`student-classes-page ${styles.classes}`}>
        
        <section className={`student-card ${styles.joinCard}`}>
          <div>
            <h2 style={{ fontSize: "18px", margin: "0 0 8px", color: "var(--text-primary)", fontWeight: 600 }}>Tham gia lớp mới</h2>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)" }}>Nhập mã do giáo viên cung cấp</p>
          </div>
          <div>
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
