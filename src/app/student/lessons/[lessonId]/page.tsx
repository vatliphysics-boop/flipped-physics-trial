import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { createClient } from "@/lib/supabase/server";

const items = [
  { label: "Tổng quan", href: "/student", active: false },
  { label: "Lớp học của em", href: "/student" },
  { label: "Bài học của em", href: "/student", active: true },
  { label: "Nhật ký học tập", href: "#" },
];

const stages = [
  {
    title: "TRƯỚC GIỜ HỌC",
    description: "Không gian chuẩn bị trước khi đến lớp.",
    tone: "blue",
    materials: [
      "Video bài học",
      "Mô phỏng tương tác",
      "Infographic",
      "Phiếu học tập số",
      "Trắc nghiệm chẩn đoán",
    ],
  },
  {
    title: "TRONG GIỜ HỌC",
    description: "Không gian hoạt động và khám phá trên lớp.",
    tone: "green",
    materials: ["Xử lí dữ liệu", "Thảo luận", "Tình huống vận dụng", "Hoạt động củng cố"],
  },
  {
    title: "SAU GIỜ HỌC",
    description: "Không gian củng cố và mở rộng sau giờ học.",
    tone: "orange",
    materials: [
      "Bài kiểm tra củng cố",
      "Tự đánh giá",
      "Nhật kí học tập",
      "Phản hồi và điều chỉnh",
      "Nhiệm vụ vận dụng",
    ],
  },
] as const;

function youtubeEmbedUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    let id = url.hostname === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v");
    if (!id && url.hostname.endsWith("youtube.com") && url.pathname.startsWith("/embed/")) id = url.pathname.split("/")[2];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch { return null; }
}

export default async function StudentLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/student");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "student") redirect("/student");

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, description, learning_objectives, status, class_id")
    .eq("id", lessonId)
    .eq("status", "published")
    .maybeSingle();

  if (!lesson?.class_id) redirect("/student");

  const { data: membership } = await supabase
    .from("class_members")
    .select("class_id")
    .eq("class_id", lesson.class_id)
    .eq("student_id", user.id)
    .maybeSingle();

  if (!membership) redirect("/student");

  const { data: classItem } = await supabase
    .from("classes")
    .select("name")
    .eq("id", lesson.class_id)
    .maybeSingle();

  if (!classItem) redirect("/student");

  const { data: videos } = await supabase
    .from("lesson_materials")
    .select("id, title, description, content_url, duration_minutes, instructions")
    .eq("lesson_id", lessonId)
    .eq("phase", "before_class")
    .eq("material_type", "video")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <div className="shell">
      <AppSidebar items={items} />
      <main className="main dashboard-main learning-page">
        <div className="lesson-hero">
          <div>
            <span className="eyebrow">Bài học của em</span>
            <h1>{lesson.title}</h1>
            <p className="lesson-description">
              {lesson.description || "Chưa có mô tả."}
            </p>
          </div>
          <div className="lesson-status-card">
            <span className="lesson-status-label">Lớp học</span>
            <strong>{classItem.name}</strong>
            <span className="lesson-status lesson-status-published">Đã xuất bản</span>
          </div>
        </div>

        <section className="grid-2 lesson-overview">
          <div className="card lesson-objective">
            <span className="eyebrow">Mục tiêu học tập</span>
            <p>{lesson.learning_objectives || "Chưa có mục tiêu học tập."}</p>
          </div>
        </section>

        <div className="learning-phases">
          {stages.map((stage) => (
            <section className={`card stage ${stage.tone === "green" ? "green" : stage.tone === "orange" ? "orange" : ""}`} key={stage.title}>
              <div className="stage-heading">
                <span className="badge">GIAI ĐOẠN</span>
                <span className="stage-marker">{stage.title}</span>
              </div>
              <h2>{stage.title}</h2>
              <p className="stage-description">{stage.description}</p>
              {stage.title === "TRƯỚC GIỜ HỌC" && <div className="grid-3 stage-items">
                {videos?.length ? videos.map((video) => { const embedUrl = youtubeEmbedUrl(video.content_url); return <article className="learning-item video-learning-item" key={video.id}>
                  {embedUrl ? <div className="video-embed"><iframe src={embedUrl} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div> : <a className="btn primary video-watch-button" href={video.content_url ?? "#"} target="_blank" rel="noreferrer">Xem video</a>}
                  <div className="learning-item-heading"><span className="learning-item-icon" aria-hidden="true">▶</span><h3>{video.title}</h3></div>
                  <p>{video.description || "Chưa có mô tả."}</p>
                  {video.duration_minutes && <span className="video-meta">Thời lượng: {video.duration_minutes} phút</span>}
                  {video.instructions && <div className="video-instructions"><strong>Hướng dẫn trước khi xem</strong><p>{video.instructions}</p></div>}
                </article>; }) : <p className="video-empty">Giáo viên chưa thêm video bài học.</p>}
              </div>}
              {stage.title !== "TRƯỚC GIỜ HỌC" && <div className="grid-3 stage-items">
                {stage.materials.map((material) => (
                  <div className="learning-item" key={material}>
                    <div className="learning-item-heading">
                      <span className="learning-item-icon" aria-hidden="true">•</span>
                      <h3>{material}</h3>
                    </div>
                    <p>Giáo viên chưa thêm học liệu.</p>
                    <span className="learning-status">Chưa có học liệu</span>
                  </div>
                ))}
              </div>}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}