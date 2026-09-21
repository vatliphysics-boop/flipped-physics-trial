import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/server";
import { NUCLEAR_PHYSICS_CURRICULUM } from "@/lib/curriculum";

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
        <div><Link href="/teacher" className="back-link">← Lớp học</Link><span className="eyebrow">Chương trình cố định</span><h1>CHƯƠNG IV — VẬT LÍ HẠT NHÂN</h1><p>{classItem.name} · {classItem.description || "Cấu hình học liệu theo lớp học và năm học."}</p></div>
        <LogoutButton />
      </div>
      <section className="curriculum-intro card"><strong>Năm bài học chuẩn Grade 12</strong><p>Danh tính, thứ tự và hoạt động cố định. Thầy cô chỉ thay đổi học liệu, video, checkpoint và bài tập của lớp này.</p></section>
      <section className="curriculum-list" aria-label="Năm bài học Vật lí hạt nhân">
        {NUCLEAR_PHYSICS_CURRICULUM.map((fixedLesson) => {
          const lesson = lessonsByCode.get(fixedLesson.code);
          return <article className="card curriculum-row" key={fixedLesson.code}>
            <div className="curriculum-number">{String(fixedLesson.order).padStart(2, "0")}</div>
            <div className="curriculum-main"><span className="curriculum-code">{fixedLesson.code}</span><h2>{fixedLesson.title}</h2><p>{fixedLesson.activityTitle}</p></div>
            <div className="curriculum-meta"><span className={`lesson-status lesson-status-${lesson?.status ?? "draft"}`}>{lesson?.status === "published" ? "Đã xuất bản" : "Bản nháp"}</span><span>{lesson?.homework_title ? "Có bài tập" : "Chưa có bài tập"}</span><Link className="btn primary" href={lesson ? `/teacher/lessons/${lesson.id}` : `/teacher`}>Quản lý học liệu</Link></div>
          </article>;
        })}
      </section>
    </main>
  </div>;
}