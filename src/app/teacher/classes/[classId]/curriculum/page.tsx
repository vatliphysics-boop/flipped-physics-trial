import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/server";
import { GRADE_12_CURRICULUM } from "@/lib/curriculum";

const items = [
  { label: "Tổng quan", href: "/teacher" },
  { label: "Lớp học", href: "/teacher" },
  { label: "Chương trình", href: "/teacher/classes", active: true },
  { label: "Học liệu", href: "/teacher" },
  { label: "Theo dõi học sinh", href: "#" },
];

export default async function TeacherCurriculumPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/teacher");

  const { data: classItem } = await supabase.from("classes").select("id, name, description").eq("id", classId).eq("teacher_id", user.id).maybeSingle();
  if (!classItem) redirect("/teacher");

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, curriculum_code, curriculum_order, title, status, homework_title, homework_status")
    .eq("class_id", classId)
    .eq("teacher_id", user.id)
    .not("curriculum_code", "is", null)
    .order("curriculum_order", { ascending: true });
  const lessonsByCode = new Map((lessons ?? []).map((lesson) => [lesson.curriculum_code, lesson]));

  return <div className="shell">
    <AppSidebar items={items} />
    <main className="main dashboard-main curriculum-page">
      <div className="page-title dashboard-header">
        <div><div className="breadcrumbs"><Link href="/teacher">Lớp học</Link><span>›</span><strong>{classItem.name}</strong><span>›</span><strong>Chương trình</strong></div><span className="eyebrow">Chương trình cố định</span><h1>Chương trình Vật lí 12</h1><p>{classItem.name} · {classItem.description || "Quản lý học liệu theo lớp học và năm học."}</p></div>
        <LogoutButton />
      </div>
      <section className="curriculum-intro card"><strong>Bốn chương, hai mươi lăm bài học chuẩn</strong><p>Danh tính và thứ tự bài học là cố định. Thầy cô chỉ thay đổi học liệu, video, checkpoint và bài tập của lớp này.</p></section>
      <section className="curriculum-chapters" aria-label="Chương trình Vật lí 12">
        {GRADE_12_CURRICULUM.map((chapter) => <section className="curriculum-chapter" key={chapter.code}>
          <div className="section-heading"><div><span className="chapter-kicker">CHƯƠNG {chapter.code}</span><h2>{chapter.title}</h2></div><span className="muted">{chapter.lessons.length} bài học</span></div>
          <div className="curriculum-list">
            {chapter.lessons.map((fixedLesson) => {
              const lesson = lessonsByCode.get(fixedLesson.code);
              return <article className="card curriculum-row" key={fixedLesson.code}>
                <div className="curriculum-number">{String(fixedLesson.order).padStart(2, "0")}</div>
                <div className="curriculum-main"><span className="curriculum-code">{fixedLesson.code}</span><h2>{fixedLesson.title}</h2><p>Trạng thái học liệu: {lesson?.status === "published" ? "Đã xuất bản" : lesson ? "Bản nháp" : "Chưa có học liệu"}</p></div>
                <div className="curriculum-meta"><span className={`lesson-status lesson-status-${lesson?.status ?? "draft"}`}>{lesson?.status === "published" ? "Đã xuất bản" : lesson ? "Bản nháp" : "Chưa có học liệu"}</span><Link className="btn primary" href={lesson ? `/teacher/lessons/${lesson.id}` : `/teacher`}>Quản lý học liệu →</Link></div>
              </article>;
            })}
          </div>
        </section>)}
      </section>
    </main>
  </div>;
}