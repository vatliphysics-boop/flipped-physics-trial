import { notFound } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/AppSidebar";
import { createClient } from "@/lib/supabase/server";
import { VideoMaterialManager, type VideoMaterial } from "./VideoMaterialManager";
import { DeleteLessonButton } from "../../DeleteLessonButton";

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
    description: "Giúp học sinh hình thành kiến thức nền và câu hỏi định hướng trước khi đến lớp.",
    tone: "blue",
    materials: [
      ["▶", "Video bài học", "Tiếp cận kiến thức nền tảng trước giờ học."],
      ["◌", "Mô phỏng tương tác", "Khám phá hiện tượng vật lí thông qua tương tác."],
      ["▦", "Infographic", "Hệ thống hóa kiến thức bằng hình ảnh trực quan."],
      ["□", "Phiếu học tập số", "Thực hiện nhiệm vụ định hướng trước giờ học."],
      ["✓", "Trắc nghiệm chẩn đoán", "Tự kiểm tra mức độ hiểu bài và nhận phản hồi."],
    ],
  },
  {
    key: "02",
    title: "TRONG GIỜ HỌC",
    subtitle: "Khám phá và hợp tác",
    description: "Tổ chức hoạt động học tập hỗ trợ tư duy bậc cao, thảo luận và giải quyết vấn đề.",
    tone: "green",
    materials: [
      ["⌁", "Xử lí dữ liệu", "Phân tích dữ liệu và rút ra kết luận từ hiện tượng vật lí."],
      ["◎", "Thảo luận nhóm", "Chia sẻ lập luận, lắng nghe và xây dựng hiểu biết chung."],
      ["◇", "Tình huống vận dụng", "Vận dụng kiến thức để giải quyết vấn đề trong bối cảnh thực tiễn."],
      ["＋", "Hoạt động củng cố", "Kiểm tra và củng cố hiểu biết ngay trong giờ học."],
    ],
  },
  {
    key: "03",
    title: "SAU GIỜ HỌC",
    subtitle: "Củng cố và tự học",
    description: "Mở rộng cơ hội tự đánh giá, điều chỉnh cách học và vận dụng kiến thức sau giờ học.",
    tone: "orange",
    materials: [
      ["▤", "Bài kiểm tra củng cố", "Ôn tập và kiểm tra mức độ nắm vững kiến thức."],
      ["◉", "Tự đánh giá", "Nhìn lại tiến bộ và xác định nội dung cần tiếp tục rèn luyện."],
      ["✎", "Nhật kí học tập", "Ghi lại suy nghĩ, câu hỏi và kinh nghiệm học tập."],
      ["↔", "Phản hồi và điều chỉnh", "Sử dụng phản hồi để điều chỉnh chiến lược học tập."],
      ["↗", "Nhiệm vụ vận dụng", "Mở rộng kiến thức qua nhiệm vụ gắn với thực tiễn."],
    ],
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

  const { data: videoMaterials } = await supabase
    .from("lesson_materials")
    .select("id, title, description, content_url, duration_minutes, instructions, is_published")
    .eq("lesson_id", lessonId)
    .eq("teacher_id", user.id)
    .eq("phase", "before_class")
    .eq("material_type", "video")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

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
              <p className="teacher-materials-class">Lớp: {classItem?.name || "Chưa gắn lớp"}</p>
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
              {phase.key === "01" && <VideoMaterialManager lessonId={lessonId} materials={(videoMaterials ?? []) as VideoMaterial[]} />}
              {phase.key !== "01" && <div className="teacher-material-grid">
                {phase.materials.map(([icon, title, purpose]) => (
                  <article className="teacher-material-card" key={title}>
                    <div className="teacher-material-icon" aria-hidden="true">{icon}</div>
                    <div className="teacher-material-content">
                      <h3>{title}</h3>
                      <p>{purpose}</p>
                    </div>
                    <div className="teacher-material-footer">
                      <span>Chưa có học liệu</span>
                      <button className="teacher-add-material" type="button">+ Thêm học liệu</button>
                    </div>
                  </article>
                ))}
              </div>}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}