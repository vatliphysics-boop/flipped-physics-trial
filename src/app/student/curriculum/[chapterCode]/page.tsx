import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/server";
import { getCurriculumChapter, getLessonLabel } from "@/lib/curriculum";

const items = [
  { label: "Tổng quan", href: "/student" },
  { label: "Chương trình học", href: "/student/curriculum", active: true },
  { label: "Lớp học của em", href: "/student#student-classes" },
  { label: "Nhật kí học tập", href: "/student#learning-log" },
];

export default async function StudentChapterPage({ params }: { params: Promise<{ chapterCode: string }> }) {
  const { chapterCode } = await params;
  const chapter = getCurriculumChapter(chapterCode.toUpperCase());
  if (!chapter) redirect("/student/curriculum");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: memberships } = user ? await supabase.from("class_members").select("class_id").eq("student_id", user.id) : { data: [] };
  const classIds = memberships?.map((item) => item.class_id) ?? [];
  const { data: publishedLessons } = classIds.length ? await supabase.from("lessons").select("id, curriculum_code, status").in("class_id", classIds).eq("status", "published").not("curriculum_code", "is", null) : { data: [] };
  const lessonByCode = new Map((publishedLessons ?? []).map((lesson) => [lesson.curriculum_code, lesson]));
  const lessonIds = (publishedLessons ?? []).map((lesson) => lesson.id);
  const { data: materials } = lessonIds.length ? await supabase.from("lesson_materials").select("id, lesson_id").in("lesson_id", lessonIds) : { data: [] };
  const materialIds = (materials ?? []).map((material) => material.id);
  const { data: progress } = user && materialIds.length ? await supabase.from("lesson_material_progress").select("material_id, is_complete, watched_seconds").eq("student_id", user.id).in("material_id", materialIds) : { data: [] };
  const progressByLesson = new Map<string, { started: boolean; complete: boolean }>();
  for (const material of materials ?? []) {
    const item = progress?.find((row) => row.material_id === material.id);
    const current = progressByLesson.get(material.lesson_id) ?? { started: false, complete: true };
    current.started ||= Boolean(item && (item.is_complete || Number(item.watched_seconds) > 0));
    current.complete &&= Boolean(item?.is_complete);
    progressByLesson.set(material.lesson_id, current);
  }
  return <div className="shell"><AppSidebar items={items} /><main className="main dashboard-main curriculum-page">
    <header className="page-title dashboard-header"><div><div className="breadcrumbs"><Link href="/student">Vật lí 12</Link><span>›</span><Link href="/student/curriculum">Chương trình học</Link><span>›</span><strong>Chương {chapter.code} — {chapter.shortTitle}</strong></div><span className="eyebrow">CHƯƠNG {chapter.code}</span><h1>{chapter.title}</h1><p>{chapter.lessons.length} bài học trong chương trình chính thức.</p></div><LogoutButton /></header>
    <section className="chapter-lesson-list">{chapter.lessons.map((fixedLesson) => { const lesson = lessonByCode.get(fixedLesson.code); const state = lesson ? progressByLesson.get(lesson.id) : undefined; const status = !lesson ? "Chưa mở" : state?.complete ? "Đã hoàn thành" : state?.started ? "Đang học" : "Chưa bắt đầu"; const action = status === "Đã hoàn thành" ? "Xem lại" : status === "Đang học" ? "Tiếp tục" : "Bắt đầu"; return <article className="card chapter-lesson-row" key={fixedLesson.code}><div className="lesson-row-number">{String(fixedLesson.number).padStart(2, "0")}</div><div className="chapter-lesson-copy"><span className="curriculum-code">{fixedLesson.code}</span><h2>{getLessonLabel(fixedLesson)}</h2><p>{lesson ? "Học liệu thuộc lớp của em." : "Học liệu đang được chuẩn bị."}</p></div><div className="chapter-lesson-action"><span className={`lesson-status lesson-status-${status === "Chưa mở" ? "draft" : status === "Đã hoàn thành" ? "published" : "active"}`}>{status}</span>{lesson ? <Link className="btn primary" href={`/student/lessons/${lesson.id}`}>{action} →</Link> : <span className="lesson-unavailable">Chưa mở</span>}</div></article>; })}</section>
  </main></div>;
}