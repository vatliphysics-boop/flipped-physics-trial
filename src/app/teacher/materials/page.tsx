import Link from "next/link";
import { TeacherShell } from "../TeacherShell";
import { getTeacherContext } from "../data";

export default async function TeacherMaterialsPage() {
  const { supabase, user } = await getTeacherContext();
  const { data: materials, error } = await supabase.from("lesson_materials").select("id, title, material_type, is_published, lesson_id, lessons!inner(title, class_id, classes!inner(name))").eq("teacher_id", user.id).order("created_at", { ascending: false });
  return <TeacherShell active="materials" title="Học liệu" description="Theo dõi video và học liệu đã tạo cho các bài học của lớp.">
    <section className="section"><h2>Học liệu của tôi</h2>{error ? <p role="alert" className="form-alert form-alert-error">Không thể tải học liệu. Vui lòng thử lại.</p> : materials?.length ? <div className="content-list">{materials.map((item) => { const lesson = item.lessons as unknown as { title: string; class_id: string; classes: { name: string } | null }; return <article className="card lesson-row" key={item.id}><div className="outline-copy"><p className="page-kicker">{item.is_published ? "Đã xuất bản" : "Bản nháp"}</p><h3>{item.title}</h3><p>{lesson.classes?.name || "Lớp không xác định"} · {lesson.title} · {item.material_type}</p></div><Link className="btn" href={`/teacher/lessons/${item.lesson_id}/before-class`}>Mở bài học</Link></article>; })}</div> : <div className="empty-state"><h2>Chưa có học liệu</h2><p>Học liệu xuất hiện ở đây sau khi được tạo trong Pha 1 của một bài học.</p><Link className="btn primary" href="/teacher/curriculum">Mở chương trình</Link></div>}</section>
  </TeacherShell>;
}
