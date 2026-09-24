import Link from "next/link";
import { ClassList } from "../ClassList";
import { TeacherShell } from "../TeacherShell";
import { getTeacherClasses, getTeacherContext } from "../data";

export default async function TeacherClassesPage() {
  const [{ classes, error }, { supabase }] = await Promise.all([getTeacherClasses(), getTeacherContext()]);
  const { data: members, error: memberError } = classes.length ? await supabase.from("class_members").select("class_id").in("class_id", classes.map((item) => item.id)) : { data: [], error: null };
  const counts: Record<string, number> = {};
  for (const member of members ?? []) counts[member.class_id] = (counts[member.class_id] ?? 0) + 1;
  return <TeacherShell active="classes" title="Lớp học của tôi" description="Quản lý lớp, chia sẻ mã tham gia và tổ chức bài học.">
    <section className="teacher-classes-page">
      <div className="teacher-classes-heading"><div><p className="teacher-classes-eyebrow">QUẢN LÝ LỚP HỌC</p><h2>Danh sách lớp <span className="teacher-classes-count">{classes.length}</span></h2></div><Link className="btn primary" href="/teacher/classes/new">+ Tạo lớp học</Link></div>
      {error ? <div className="teacher-classes-state teacher-classes-error" role="alert"><strong>Không thể tải danh sách lớp học.</strong><span>Vui lòng thử lại sau.</span></div> : <ClassList classes={classes} counts={counts} memberError={Boolean(memberError)} />}
      <p className="teacher-classes-hint">Gửi mã tham gia cho học sinh để các em vào đúng lớp.</p>
    </section>
  </TeacherShell>;
}
