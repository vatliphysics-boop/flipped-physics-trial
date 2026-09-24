import Link from "next/link";
import { StudentShell } from "../StudentShell";
import { JoinClassForm } from "../JoinClassForm";
import { StudentClassList } from "../StudentClassList";
import { getStudentContext } from "@/lib/student-learning";

export default async function StudentClassesPage() {
  const state = await getStudentContext();
  return (
    <StudentShell active="classes" title="Lớp học của em" description="Tham gia lớp bằng mã do giáo viên cung cấp và truy cập học liệu đã được xuất bản.">
      <section className="grid-2 section student-classes-layout">
        <div className="card">
          <p className="eyebrow">THAM GIA LỚP</p>
          <h2>Nhập mã lớp học</h2>
          <p>Giáo viên sẽ cung cấp mã gồm 6 ký tự để em tham gia đúng lớp.</p>
          <JoinClassForm />
        </div>
        <div className="card subtle-card">
          <p className="eyebrow">HƯỚNG DẪN</p>
          <h2>Học theo lộ trình</h2>
          <p>Sau khi vào lớp, em có thể mở các bài học giáo viên đã xuất bản và theo dõi quá trình của mình.</p>
          <Link className="btn secondary" href="/student/curriculum">Xem chương trình học →</Link>
        </div>
      </section>
      <section className="section" aria-labelledby="joined-classes-heading">
        <div className="section-heading"><div><p className="eyebrow">LỚP ĐÃ THAM GIA</p><h2 id="joined-classes-heading">Các lớp học của em</h2></div></div>
        <StudentClassList classes={state.classes} />
      </section>
    </StudentShell>
  );
}
