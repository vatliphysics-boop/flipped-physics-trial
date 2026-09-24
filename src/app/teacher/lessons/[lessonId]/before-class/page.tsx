import Link from "next/link";
import { TeacherShell } from "../../../TeacherShell";
import { LessonNavigation } from "@/components/learning/LessonNavigation";
import { getTeacherLesson } from "@/lib/teacher-lesson";

export default async function TeacherBeforeClassPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { supabase, lesson, classItem } = await getTeacherLesson(lessonId);
  const { data: videos } = await supabase.from("lesson_materials").select("id, title, description, is_published, duration_minutes").eq("lesson_id", lessonId).eq("phase", "before_class").eq("material_type", "video").order("sort_order").order("created_at");
  return <TeacherShell active="curriculum" title={`${lesson.title} — Bài giảng và chuẩn bị`} description="Tải, chỉnh sửa và xuất bản video cho học sinh trong lớp.">
    <LessonNavigation role="teacher" lessonId={lessonId} className={classItem.name} lessonTitle={lesson.title} active="before_class" />
    <section className="phase-toolbar"><div><h2>Video và tài liệu chuẩn bị</h2><p>Lớp: {classItem.name}</p></div><Link className="btn primary" href={`/teacher/lessons/${lessonId}/before-class/videos/new`}>Tải bài giảng lên</Link></section>
    {videos?.length ? <section className="content-list" aria-label="Video trước giờ học">{videos.map((video) => <article className="lesson-row" key={video.id}><div className="outline-copy"><small>{video.is_published ? "Đã xuất bản" : "Bản nháp"}</small><strong>{video.title}</strong><span>{video.description || "Chưa có hướng dẫn cho video này."}{video.duration_minutes ? ` · ${video.duration_minutes} phút` : ""}</span></div><Link className="btn" href={`/teacher/lessons/${lessonId}/before-class/videos/${video.id}/edit`}>Chỉnh sửa</Link></article>)}</section> : <section className="empty-state"><h2>Chưa có bài giảng</h2><p>Hãy tải video MP4, WebM hoặc MOV và lưu nháp trước khi xuất bản cho học sinh.</p><Link className="btn primary" href={`/teacher/lessons/${lessonId}/before-class/videos/new`}>Tải bài giảng lên</Link></section>}
  </TeacherShell>;
}
