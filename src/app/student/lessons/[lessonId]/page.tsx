import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { createClient } from "@/lib/supabase/server";
import { VideoCheckpointPlayer } from "../../VideoCheckpointPlayer";
import { classifyVideoSource, isMovVideoSource, resolveVideoSource } from "@/lib/video-source";
import { getCurriculumLesson } from "@/lib/curriculum";

const items = [
  { label: "Tổng quan", href: "/student", active: false },
  { label: "Lớp học của em", href: "/student" },
  { label: "Bài học của em", href: "/student", active: true },
  { label: "Nhật ký học tập", href: "#" },
];

const stages = [
  { title: "TRƯỚC GIỜ HỌC", description: "Video bài học và câu hỏi kiểm tra giúp em chuẩn bị kiến thức nền.", tone: "blue" },
  { title: "TRONG GIỜ HỌC", description: "Hoạt động thảo luận, thí nghiệm và giải quyết vấn đề tại lớp.", tone: "green" },
  { title: "SAU GIỜ HỌC", description: "Củng cố kiến thức và vận dụng vào các bài tập mở rộng.", tone: "orange" },
] as const;

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
    .select("id, title, description, learning_objectives, status, class_id, curriculum_code, activity_key, homework_title, homework_description, homework_instructions, homework_due_date, homework_status")
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

  const curriculumLesson = getCurriculumLesson(lesson.curriculum_code);
  if (!curriculumLesson) redirect("/student");

  const { data: videos } = await supabase
    .from("lesson_materials")
    .select("id, title, description, content_url, duration_minutes, instructions")
    .eq("lesson_id", lessonId)
    .eq("phase", "before_class")
    .eq("material_type", "video")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const playableUrls = new Map<string, string>();
  for (const video of videos ?? []) {
    const contentUrl = video.content_url ?? "";
    const source = classifyVideoSource(contentUrl);
    if (source.kind !== "invalid" || source.reason !== "youtube") {
      const resolvedUrl = resolveVideoSource(contentUrl, supabase);
      if (resolvedUrl) {
        playableUrls.set(video.id, resolvedUrl);
      } else {
        console.error("storage URL failure: unable to resolve video source", contentUrl);
      }
    } else if (source.reason === "youtube") {
      console.error("storage URL failure: YouTube webpage URL cannot be used as HTML5 video source", video.content_url);
    }
  }

  const materialIds = (videos ?? []).map((video) => video.id);
  const { data: checkpointRows } = materialIds.length
    ? await supabase.from("video_checkpoints").select("id, material_id, checkpoint_percent, question, option_a, option_b, option_c, option_d, correct_option, sort_order").in("material_id", materialIds).order("sort_order", { ascending: true })
    : { data: [] };
  const checkpointsByMaterial = new Map<string, { id: string; prompt: string; options: string[]; correctIndex: number; atPercent: number }[]>();
  for (const row of checkpointRows ?? []) {
    const current = checkpointsByMaterial.get(row.material_id) ?? [];
    current.push({ id: row.id, prompt: row.question, options: [row.option_a, row.option_b, row.option_c, row.option_d], correctIndex: ["A", "B", "C", "D"].indexOf(row.correct_option), atPercent: row.checkpoint_percent });
    checkpointsByMaterial.set(row.material_id, current);
  }
  const { data: progressRows } = materialIds.length
    ? await supabase.from("lesson_material_progress").select("material_id, watched_seconds, answered_checkpoints, is_complete").eq("student_id", user.id).in("material_id", materialIds)
    : { data: [] };
  const progressByMaterial = new Map((progressRows ?? []).map((row) => [row.material_id, row]));
  const beforeComplete = Boolean(videos?.length) && (videos ?? []).every((video) => progressByMaterial.get(video.id)?.is_complete === true);

  return (
    <div className="shell">
      <AppSidebar items={items} />
      <main className="main dashboard-main learning-page">
        <div className="lesson-hero">
          <div>
            <span className="eyebrow">Chương IV — Vật lí hạt nhân · {lesson.curriculum_code ?? "Bài học của em"}</span>
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
          <div className="card lesson-objective"><span className="eyebrow">Hoạt động cố định</span><h2>{curriculumLesson.activityTitle}</h2><p>{curriculumLesson.concepts.join(" · ")}</p></div>
        </section>

        <div className="learning-phases">
          {stages.map((stage, index) => {
            const locked = index > 0 && !beforeComplete;
            return <section className={`card stage stage-${stage.tone} ${locked ? "learning-phase-locked" : ""}`} key={stage.title}>
              <div className="stage-heading">
                <span className="badge">GIAI ĐOẠN {String(index + 1).padStart(2, "0")}</span>
                <span className="stage-marker">{stage.title}</span>
              </div>
              <h2>{stage.title}</h2>
              <p className="stage-description">{stage.description}</p>
              {locked ? <div className="phase-lock-message"><span aria-hidden="true">🔒</span><strong>Hoàn thành giai đoạn trước để mở nội dung này.</strong></div> : stage.title === "TRƯỚC GIỜ HỌC" && <div className="video-learning-list">
                {videos?.length ? videos.map((video) => {
                  const progress = progressByMaterial.get(video.id);
                  const checkpoints = checkpointsByMaterial.get(video.id) ?? [];
                  return <article className="learning-item video-learning-item" key={video.id}>
                    <div className="learning-item-heading"><span className="learning-item-icon" aria-hidden="true">▶</span><h3>{video.title}</h3><span className={`video-completion ${progress?.is_complete ? "is-complete" : ""}`}>{progress?.is_complete ? "Đã hoàn thành" : "Chưa hoàn thành"}</span></div>
                    <p>{video.description || "Chưa có mô tả."}</p>
                    <div className="video-detail-row"><span>Thời lượng: {video.duration_minutes ? `${video.duration_minutes} phút` : "Theo tiến độ thực tế"}</span><span>Checkpoint: {checkpoints.length}/2</span></div>
                    {video.instructions && <div className="video-instructions"><strong>Hướng dẫn trước khi xem</strong><p>{video.instructions}</p></div>}
                    {video.content_url && (playableUrls.get(video.id) ? <VideoCheckpointPlayer materialId={video.id} title={video.title} url={playableUrls.get(video.id)!} isMov={isMovVideoSource(video.content_url)} checkpoints={checkpoints} initialAnswered={Array.isArray(progress?.answered_checkpoints) ? progress.answered_checkpoints as string[] : []} initialSeconds={Number(progress?.watched_seconds ?? 0)} initialComplete={progress?.is_complete === true} /> : <p className="form-alert form-alert-error">Không thể tải video. Vui lòng báo cho giáo viên.</p>)}
                  </article>;
                }) : <p className="video-empty">Giáo viên chưa thêm video bài học.</p>}
              </div>}
            </section>;
          })}
        </div>
        {lesson.homework_status === "published" && <section className="card homework-student-card"><span className="eyebrow">SAU GIỜ HỌC</span><h2>{lesson.homework_title || "Bài tập của em"}</h2><p>{lesson.homework_description || "Giáo viên chưa thêm nội dung chi tiết."}</p>{lesson.homework_instructions && <div className="video-instructions"><strong>Hướng dẫn</strong><p>{lesson.homework_instructions}</p></div>}{lesson.homework_due_date && <span className="video-meta">Hạn nộp: {new Date(`${lesson.homework_due_date}T00:00:00`).toLocaleDateString("vi-VN")}</span>}</section>}
      </main>
    </div>
  );
}