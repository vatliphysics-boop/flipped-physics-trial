import Link from "next/link";
import { StudentShell } from "../../../StudentShell";
import { LessonNavigation } from "@/components/learning/LessonNavigation";
import { VideoCheckpointPlayer } from "../../../VideoCheckpointPlayer";
import { getStudentLesson } from "@/lib/student-lesson";
import { createSignedVideoUrl, classifyVideoSource, isMovVideoSource } from "@/lib/video-source";

export default async function StudentBeforeClassPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { supabase, user, lesson, classItem } = await getStudentLesson(lessonId);
  const { data: videos } = await supabase.from("lesson_materials").select("id, title, description, content_url, duration_minutes, instructions").eq("lesson_id", lessonId).eq("phase", "before_class").eq("material_type", "video").eq("is_published", true).order("sort_order").order("created_at");
  const ids = (videos ?? []).map((video) => video.id);
  const [{ data: progress }, { data: checkpoints }, { data: attempts }] = await Promise.all([
    ids.length ? supabase.from("lesson_material_progress").select("material_id, watched_seconds").eq("student_id", user.id).in("material_id", ids) : Promise.resolve({ data: [] }),
    // Use student_video_checkpoints view: does not expose correct_option (RLS-safe)
    // Schema: id, material_id, checkpoint_percent, question, option_a, option_b, option_c, option_d
    ids.length ? supabase.from("student_video_checkpoints").select("id, material_id, checkpoint_percent, question, option_a, option_b, option_c, option_d").in("material_id", ids).order("checkpoint_percent") : Promise.resolve({ data: [] }),
    ids.length ? supabase.from("video_checkpoint_attempts").select("checkpoint_id").eq("student_id", user.id).eq("is_correct", true) : Promise.resolve({ data: [] }),
  ]);
  const progressByMaterial = new Map((progress ?? []).map((item) => [item.material_id, Number(item.watched_seconds) || 0]));
  const correctIds = new Set((attempts ?? []).map((item) => item.checkpoint_id));
  return <StudentShell active="lessons" title={`${lesson.title} — Pha 1: Chuẩn bị trước giờ học`} description="Xem video đã được giáo viên xuất bản và hoàn thành câu hỏi kiểm tra trong video.">
    <LessonNavigation role="student" lessonId={lessonId} className={classItem.name} lessonTitle={lesson.title} active="before_class" />
    {!videos?.length ? <section className="empty-state"><h2>Chưa có video được xuất bản</h2><p>Giáo viên chưa mở học liệu cho pha này. Em có thể quay lại tổng quan bài để kiểm tra các pha khác.</p><Link className="btn" href={`/student/lessons/${lessonId}`}>Về tổng quan bài</Link></section> : <section className="content-list" aria-label="Video chuẩn bị">{await Promise.all(videos.map(async (video) => {
      const source = classifyVideoSource(video.content_url ?? "");
      const url = source.kind === "storage" ? await createSignedVideoUrl(video.content_url ?? "", supabase) : source.kind === "direct" ? source.url : null;
      const materialCheckpoints = (checkpoints ?? []).filter((item) => item.material_id === video.id).map((item) => ({
        id: item.id,
        // Map student_video_checkpoints columns to VideoCheckpointPlayer Checkpoint type
        prompt: item.question,
        options: [item.option_a, item.option_b, item.option_c, item.option_d].filter(Boolean) as string[],
        atPercent: Number(item.checkpoint_percent),
      }));
      return <article className="card lesson-material" key={video.id}><header><h2>{video.title}</h2><p>{video.description || video.instructions || "Xem video và ghi lại các ý chính."}</p>{video.duration_minutes ? <p className="muted">Thời lượng: {video.duration_minutes} phút</p> : null}</header>{url ? <VideoCheckpointPlayer materialId={video.id} title={video.title} url={url} isMov={isMovVideoSource(video.content_url ?? "")} checkpoints={materialCheckpoints} initialAnswered={materialCheckpoints.filter((item) => correctIds.has(item.id)).map((item) => item.id)} initialSeconds={progressByMaterial.get(video.id) ?? 0} /> : <p className="error-message">Video này hiện không thể phát. Vui lòng báo giáo viên để kiểm tra học liệu.</p>}</article>;
    }))}</section>}
  </StudentShell>;
}
