import Link from "next/link";
import { StudentShell } from "../StudentShell";
import { createClient } from "@/lib/supabase/server";

export default async function StudentAssignmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: assignments, error } = user ? await supabase.from("lessons").select("id, title, homework_title, homework_due_date, classes!inner(name, class_members!inner(student_id))").eq("status", "published").eq("homework_status", "published").eq("classes.class_members.student_id", user.id).order("homework_due_date", { ascending: true }) : { data: [], error: null };
  return <StudentShell active="assignments" title="Bài tập và kiểm tra" description="Các bài tập cuối bài giáo viên đã xuất bản cho lớp của em.">
    <section className="section"><h2>Bài tập đang mở</h2>{error ? <p role="alert" className="form-alert form-alert-error">Không thể tải bài tập. Vui lòng thử lại.</p> : assignments?.length ? <div className="content-list">{assignments.map((item) => { const classItem = item.classes as unknown as { name: string }; return <article className="card lesson-row" key={item.id}><div className="outline-copy"><p className="page-kicker">{classItem.name}</p><h3>{item.homework_title || item.title}</h3>{item.homework_due_date ? <p>Hạn nộp: {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.homework_due_date))}</p> : <p>Giáo viên chưa đặt hạn nộp.</p>}</div><Link className="btn primary" href={`/student/lessons/${item.id}/assessment`}>Mở bài tập</Link></article>; })}</div> : <div className="empty-state"><h2>Chưa có bài tập được xuất bản</h2><p>Khi giáo viên mở Pha 3, bài tập sẽ xuất hiện tại đây.</p><Link className="btn" href="/student/curriculum">Mở chương trình</Link></div>}</section>
  </StudentShell>;
}
