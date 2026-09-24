import Link from "next/link";
import { TeacherShell } from "../TeacherShell";
import { getTeacherClasses, getTeacherContext } from "../data";

export default async function TeacherStudentsPage() {
  const [{ classes, error: classError }, { supabase }] = await Promise.all([getTeacherClasses(), getTeacherContext()]);
  const { data: members, error: memberError } = classes.length ? await supabase.from("class_members").select("class_id, student_id").in("class_id", classes.map((item) => item.id)) : { data: [], error: null };
  const count = new Map<string, number>();
  for (const member of members ?? []) count.set(member.class_id, (count.get(member.class_id) ?? 0) + 1);
  return <TeacherShell active="students" title="Học sinh và kết quả" description="Mở từng lớp để theo dõi danh sách thành viên và tiến độ học tập.">
    <section className="section"><h2>Lớp học cần theo dõi</h2>{classError || memberError ? <p role="alert" className="form-alert form-alert-error">Không thể tải đầy đủ danh sách học sinh. Vui lòng thử lại.</p> : classes.length ? <div className="content-list">{classes.map((item) => <article className="card lesson-row" key={item.id}><div className="outline-copy"><h3>{item.name}</h3><p>{count.get(item.id) ?? 0} học sinh đã tham gia</p></div><Link className="btn primary" href={`/teacher/classes/${item.id}`}>Mở lớp học</Link></article>)}</div> : <div className="empty-state"><h2>Chưa có lớp để theo dõi</h2><p>Tạo lớp và mời học sinh tham gia trước.</p><Link className="btn primary" href="/teacher/classes">Mở trang lớp học</Link></div>}</section>
  </TeacherShell>;
}
