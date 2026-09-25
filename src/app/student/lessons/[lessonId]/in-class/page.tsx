import { PortalShell } from "@/components/PortalShell";
import { LogoutButton } from "@/components/LogoutButton";
import { StudentLessonHeader } from "../../StudentLessonHeader";
import { getStudentLesson } from "@/lib/student-lesson";
import { StudentInClassProgression } from "@/components/learning/StudentInClassProgression";
import { createSignedVideoUrl, classifyVideoSource, isMovVideoSource } from "@/lib/video-source";
import { VideoCheckpointPlayer } from "../../../VideoCheckpointPlayer";
import type { NuclearPhysicsLessonCode } from "@/lib/curriculum";
import { checkPhaseAccess } from "@/lib/phase-guard";

export default async function StudentInClassPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { supabase, user, lesson, curriculum } = await getStudentLesson(lessonId);
  
  const { data: videos } = await supabase.from("lesson_materials").select("id, title, description, content_url, duration_minutes, instructions").eq("lesson_id", lessonId).eq("phase", "in_class").eq("material_type", "video").eq("is_published", true).order("sort_order").order("created_at");
  const { data: colabs } = await supabase.from("lesson_materials").select("id, title, description, content_url").eq("lesson_id", lessonId).eq("phase", "in_class").eq("material_type", "worksheet").eq("is_published", true).order("created_at");
  
  const phaseProgressObj = await checkPhaseAccess(lessonId, "in_class");

  const ids = [...(videos ?? []).map(v => v.id), ...(colabs ?? []).map(c => c.id)];
  
  const [{ data: progress }, { data: checkpoints }, { data: attempts }, { data: phaseProgress }] = await Promise.all([
    ids.length ? supabase.from("lesson_material_progress").select("material_id, watched_seconds, is_complete").eq("student_id", user.id).in("material_id", ids) : Promise.resolve({ data: [] }),
    ids.length ? supabase.from("student_video_checkpoints").select("id, material_id, checkpoint_percent, question, option_a, option_b, option_c, option_d").in("material_id", ids).order("checkpoint_percent") : Promise.resolve({ data: [] }),
    ids.length ? supabase.from("video_checkpoint_attempts").select("checkpoint_id").eq("student_id", user.id).eq("is_correct", true) : Promise.resolve({ data: [] }),
    supabase.from("student_phase_progress").select("is_completed").eq("lesson_id", lessonId).eq("student_id", user.id).eq("phase", "in_class").maybeSingle(),
  ]);
  
  const progressByMaterial = new Map((progress ?? []).map((item) => [item.material_id, { seconds: Number(item.watched_seconds) || 0, isComplete: item.is_complete }]));
  const correctIds = new Set((attempts ?? []).map((item) => item.checkpoint_id));

  const allVideosCompleted = videos?.every(v => progressByMaterial.get(v.id)?.isComplete) ?? true;

  const { data: finalQs } = await supabase.from("phase_final_questions").select("id, question_text").eq("lesson_id", lessonId).eq("phase", "in_class").order("sort_order");

  const cleanTitle = lesson.title.replace(/^Bài\s+\d+[.:]?\s*/i, "");

  const videosNode = (videos ?? []).map(async (video) => {
    const source = classifyVideoSource(video.content_url ?? "");
    const url = source.kind === "storage" ? await createSignedVideoUrl(video.content_url ?? "", supabase) : source.kind === "direct" ? source.url : null;
    const materialCheckpoints = (checkpoints ?? []).filter((item) => item.material_id === video.id).map((item) => ({
      id: item.id, prompt: item.question, options: [item.option_a, item.option_b, item.option_c, item.option_d].filter(Boolean) as string[], atPercent: Number(item.checkpoint_percent),
    }));
    return (
      <article key={video.id} style={{ marginBottom: "48px" }}>
        <header style={{ marginBottom: "24px" }}><h2 style={{ fontSize: "24px" }}>{video.title}</h2><p style={{ color: "var(--text-secondary)" }}>{video.description}</p></header>
        <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border-light)", backgroundColor: "black" }}>
          {url ? <VideoCheckpointPlayer materialId={video.id} title={video.title} url={url} isMov={isMovVideoSource(video.content_url ?? "")} checkpoints={materialCheckpoints} initialAnswered={materialCheckpoints.filter((item) => correctIds.has(item.id)).map((item) => item.id)} initialSeconds={progressByMaterial.get(video.id)?.seconds ?? 0} /> : <div style={{ padding: "48px", textAlign: "center", color: "white" }}><p>Video không thể phát.</p></div>}
        </div>
      </article>
    );
  });

  const resolvedVideos = await Promise.all(videosNode);

  return (
    <PortalShell role="student" active="lessons" account={<LogoutButton />}>
      <StudentLessonHeader 
        lessonId={lessonId}
        lessonTitle={cleanTitle}
        chapterCode={curriculum.chapterCode}
        description="Thực hiện thí nghiệm ảo, xử lí dữ liệu và thảo luận kết quả."
        activePhase="in_class"
        phaseProgress={phaseProgressObj}
      />
      
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        <StudentInClassProgression 
          lessonCode={curriculum.code as NuclearPhysicsLessonCode}
          lessonId={lessonId}
          videosNode={resolvedVideos}
          colabs={(colabs ?? []).map(c => ({ id: c.id, title: c.title, content_url: c.content_url ?? "", description: c.description, is_complete: progressByMaterial.get(c.id)?.isComplete ?? false }))}
          finalQs={finalQs ?? []}
          allVideosCompleted={allVideosCompleted}
          phaseCompleted={phaseProgress?.is_completed ?? false}
        />
      </div>
    </PortalShell>
  );
}

