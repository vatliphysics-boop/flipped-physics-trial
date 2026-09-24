import { PortalShell } from "@/components/PortalShell";
import { LogoutButton } from "@/components/LogoutButton";
import { StudentLessonHeader } from "../../StudentLessonHeader";
import { VideoCheckpointPlayer } from "../../../VideoCheckpointPlayer";
import { getStudentLesson } from "@/lib/student-lesson";
import { createSignedVideoUrl, classifyVideoSource, isMovVideoSource } from "@/lib/video-source";

export default async function StudentBeforeClassPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { supabase, user, lesson } = await getStudentLesson(lessonId);
  const { data: videos } = await supabase.from("lesson_materials").select("id, title, description, content_url, duration_minutes, instructions").eq("lesson_id", lessonId).eq("phase", "before_class").eq("material_type", "video").eq("is_published", true).order("sort_order").order("created_at");
  const ids = (videos ?? []).map((video) => video.id);
  const [{ data: progress }, { data: checkpoints }, { data: attempts }] = await Promise.all([
    ids.length ? supabase.from("lesson_material_progress").select("material_id, watched_seconds").eq("student_id", user.id).in("material_id", ids) : Promise.resolve({ data: [] }),
    ids.length ? supabase.from("student_video_checkpoints").select("id, material_id, checkpoint_percent, question, option_a, option_b, option_c, option_d").in("material_id", ids).order("checkpoint_percent") : Promise.resolve({ data: [] }),
    ids.length ? supabase.from("video_checkpoint_attempts").select("checkpoint_id").eq("student_id", user.id).eq("is_correct", true) : Promise.resolve({ data: [] }),
  ]);
  const progressByMaterial = new Map((progress ?? []).map((item) => [item.material_id, Number(item.watched_seconds) || 0]));
  const correctIds = new Set((attempts ?? []).map((item) => item.checkpoint_id));

  // Clean title for header
  const cleanTitle = lesson.title.replace(/^Bài\s+\d+[.:]?\s*/i, "");

  return (
    <PortalShell role="student" active="lessons" account={<LogoutButton />}>
      <StudentLessonHeader 
        lessonId={lessonId}
        lessonTitle={cleanTitle}
        chapterCode={lesson.curriculum_code?.match(/B\d+/) ? null : lesson.curriculum_code?.split('.')[0]} // Rough fallback, assume chapter logic handled if needed
        description={lesson.learning_objectives || lesson.description}
        activePhase="before_class"
      />
      
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px" }}>
        {!videos?.length ? (
          <section className="empty-state" style={{ padding: "64px 0", textAlign: "center", color: "var(--text-muted)" }}>
            <h2 style={{ fontSize: "20px", color: "var(--text-primary)", marginBottom: "8px" }}>Chưa có video được xuất bản</h2>
            <p style={{ marginBottom: "24px" }}>Giáo viên chưa mở học liệu cho pha này.</p>
          </section>
        ) : (
          <section className="content-list" aria-label="Video chuẩn bị">
            {await Promise.all(videos.map(async (video) => {
              const source = classifyVideoSource(video.content_url ?? "");
              const url = source.kind === "storage" ? await createSignedVideoUrl(video.content_url ?? "", supabase) : source.kind === "direct" ? source.url : null;
              const materialCheckpoints = (checkpoints ?? []).filter((item) => item.material_id === video.id).map((item) => ({
                id: item.id,
                prompt: item.question,
                options: [item.option_a, item.option_b, item.option_c, item.option_d].filter(Boolean) as string[],
                atPercent: Number(item.checkpoint_percent),
              }));
              
              return (
                <article key={video.id} style={{ marginBottom: "48px" }}>
                  <header style={{ marginBottom: "24px" }}>
                    <h2 style={{ fontSize: "24px", color: "var(--text-primary)", marginBottom: "8px" }}>{video.title}</h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "15px", margin: "0 0 8px", maxWidth: "800px" }}>
                      {video.description || video.instructions || "Xem video và ghi lại các ý chính."}
                    </p>
                    {video.duration_minutes ? <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>Thời lượng: {video.duration_minutes} phút</p> : null}
                  </header>
                  
                  <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border-light)", backgroundColor: "black" }}>
                    {url ? (
                      <VideoCheckpointPlayer 
                        materialId={video.id} 
                        title={video.title} 
                        url={url} 
                        isMov={isMovVideoSource(video.content_url ?? "")} 
                        checkpoints={materialCheckpoints} 
                        initialAnswered={materialCheckpoints.filter((item) => correctIds.has(item.id)).map((item) => item.id)} 
                        initialSeconds={progressByMaterial.get(video.id) ?? 0} 
                      />
                    ) : (
                      <div style={{ padding: "48px", textAlign: "center", color: "white" }}>
                        <p>Video này hiện không thể phát. Vui lòng báo giáo viên để kiểm tra học liệu.</p>
                      </div>
                    )}
                  </div>
                </article>
              );
            }))}
          </section>
        )}
      </div>
    </PortalShell>
  );
}
