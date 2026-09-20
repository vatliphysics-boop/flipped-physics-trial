import { notFound } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/AppSidebar";
import { createClient } from "@/lib/supabase/server";
import { VideoMaterialManager, type VideoMaterial } from "./VideoMaterialManager";
import { DeleteLessonButton } from "../../DeleteLessonButton";
import { LessonClassAssignment } from "../../LessonClassAssignment";

const items = [
  { label: "Tổng quan", href: "/teacher" },
  { label: "Lớp học", href: "/teacher" },
  { label: "Bài học", href: "/teacher", active: true },
];

const phases = [
  {
    key: "01",
    title: "TRƯỚC GIỜ HỌC",
    subtitle: "Chuẩn bị nền tảng",
    description: "Thêm video bài học để học sinh chuẩn bị kiến thức nền trước khi đến lớp.",
    tone: "blue",
  },
] as const;

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
  const { data: teacherClasses } = await supabase.from("classes").select("id, name").eq("teacher_id", user.id).order("name");

  const { data: videoMaterials } = await supabase
    .from("lesson_materials")
    .select("id, title, description, content_url, duration_minutes, instructions, is_published")
    .eq("lesson_id", lessonId)
    .eq("teacher_id", user.id)
    .eq("phase", "before_class")
    .eq("material_type", "video")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const materialIds = (videoMaterials ?? []).map((material) => material.id);
  const { data: checkpointRows } = materialIds.length
    ? await supabase.from("video_checkpoints").select("id, material_id, checkpoint_percent, question, option_a, option_b, option_c, option_d, correct_option, sort_order").in("material_id", materialIds).order("sort_order", { ascending: true })
    : { data: [] };
  const checkpointsByMaterial = new Map<string, VideoMaterial["checkpoint_questions"]>();
  for (const row of checkpointRows ?? []) {
    const current = checkpointsByMaterial.get(row.material_id) ?? [];
    current.push({ id: row.id, prompt: row.question, options: [row.option_a, row.option_b, row.option_c, row.option_d], correctIndex: ["A", "B", "C", "D"].indexOf(row.correct_option), atPercent: row.checkpoint_percent });
    checkpointsByMaterial.set(row.material_id, current);
  }

  return (
    <div className="shell">
      <AppSidebar items={items} />
      <main className="main dashboard-main teacher-materials-page">
        <header className="teacher-materials-header">
          <div className="teacher-materials-breadcrumb">
            <Link href="/teacher" className="back-link">← Quay lại</Link>
            <span>/</span>
            <span>Quản lý bài học</span>
          </div>
          <div className="teacher-materials-heading">
            <div className="teacher-materials-title-group">
              <span className="eyebrow">Không gian học liệu</span>
              <h1>{lesson.title}</h1>
              <div className="teacher-materials-context">
                <span><strong>Bài học:</strong> {lesson.title}</span>
                <LessonClassAssignment lessonId={lessonId} classId={lesson.class_id} className={classItem?.name || "Chưa gắn lớp"} classes={teacherClasses ?? []} />
              </div>
              <p className="teacher-materials-description">{lesson.description || "Chưa có mô tả bài học."}</p>
            </div>
            <span className={`teacher-lesson-status teacher-lesson-status-${lesson.status}`}>
              {lesson.status === "published" ? "Đã xuất bản" : "Bản nháp"}
            </span>
            <div className="teacher-lesson-delete">
              <DeleteLessonButton lessonId={lessonId} redirectOnSuccess />
            </div>
          </div>
        </header>

        <section className="teacher-materials-objective card">
          <div>
            <span className="teacher-panel-kicker">ĐỊNH HƯỚNG BÀI HỌC</span>
            <h2>Mục tiêu học tập</h2>
          </div>
          <p>{lesson.learning_objectives || "Chưa có mục tiêu học tập."}</p>
        </section>

        <nav className="learning-journey-nav" aria-label="Các giai đoạn học tập">
          {phases.map((phase, index) => (
            <div className="learning-journey-step" key={phase.key}>
              <span className={`learning-journey-number ${phase.tone}`}>{phase.key}</span>
              <span>
                <strong>{phase.title}</strong>
                <small>{phase.subtitle}</small>
              </span>
              {index < phases.length - 1 ? <i aria-hidden="true" /> : null}
            </div>
          ))}
        </nav>

        <div className="teacher-phase-list">
          {phases.map((phase) => (
            <section className={`teacher-phase teacher-phase-${phase.tone}`} key={phase.key}>
              <div className="teacher-phase-header">
                <div className="teacher-phase-index">GIAI ĐOẠN {phase.key}</div>
                <div>
                  <h2>{phase.title}</h2>
                  <p>{phase.description}</p>
                </div>
              </div>
              <VideoMaterialManager lessonId={lessonId} materials={(videoMaterials ?? []).map((material) => ({ ...material, checkpoint_questions: checkpointsByMaterial.get(material.id) ?? [] })) as VideoMaterial[]} />
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}