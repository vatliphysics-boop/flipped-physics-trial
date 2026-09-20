import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { createClient } from "@/lib/supabase/server";

const items = [
  { label: "Tổng quan", href: "/teacher" },
  { label: "Lớp học", href: "/teacher" },
  { label: "Bài học", href: "/teacher", active: true },
];

export default async function LessonManagementPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, description, learning_objectives, status, class_id")
    .eq("id", lessonId)
    .eq("teacher_id", user.id)
    .maybeSingle();

  if (!lesson) notFound();

  const { data: classItem } = lesson.class_id
    ? await supabase.from("classes").select("name").eq("id", lesson.class_id).eq("teacher_id", user.id).maybeSingle()
    : { data: null };

  return (
    <div className="shell">
      <AppSidebar items={items} />
      <main className="main dashboard-main lesson-management-page">
        <span className="eyebrow">Quản lý bài học</span>
        <h1>{lesson.title}</h1>
        <p className="lesson-management-class">Lớp: {classItem?.name || "Chưa gắn lớp"}</p>
        <div className="card lesson-management-overview">
          <h2>Mục tiêu học tập</h2>
          <p>{lesson.learning_objectives || "Chưa có mục tiêu học tập."}</p>
        </div>
        <div className="lesson-stage-grid">
          {[
            ["TRƯỚC GIỜ HỌC", "Không gian chuẩn bị trước khi đến lớp."],
            ["TRONG GIỜ HỌC", "Không gian hoạt động và khám phá trên lớp."],
            ["SAU GIỜ HỌC", "Không gian củng cố và mở rộng sau giờ học."],
          ].map(([title, description]) => (
            <section className="card lesson-stage-placeholder" key={title}>
              <span className="stage-marker">GIAI ĐOẠN</span>
              <h2>{title}</h2>
              <p>{description}</p>
              <span className="lesson-empty-state">Chưa có học liệu. Tính năng sẽ được bổ sung ở phase tiếp theo.</span>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}