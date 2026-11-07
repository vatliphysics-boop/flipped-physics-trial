import { HalfLifeDiscovery } from "@/components/learning/HalfLifeDiscovery";
import { getStudentPathway } from "@/lib/student-pathway";
import { StudentPathwayStepViewer } from "@/components/learning/StudentPathwayStepViewer";
import { PortalShell } from "@/components/PortalShell";
import { LogoutButton } from "@/components/LogoutButton";
import { StudentLessonHeader } from "../../StudentLessonHeader";
import { VideoCheckpointPlayer } from "../../../VideoCheckpointPlayer";
import { getStudentLesson } from "@/lib/student-lesson";
import { createSignedVideoUrl, classifyVideoSource, isMovVideoSource } from "@/lib/video-source";
import { StudentColabViewer } from "@/components/learning/StudentColabViewer";
import { StudentPhaseFinalQuestions } from "@/components/learning/StudentPhaseFinalQuestions";
import { checkPhaseAccess } from "@/lib/phase-guard";
import { FixedPhysicsActivityRenderer } from "@/components/physics/FixedPhysicsActivityRenderer";

export default async function StudentBeforeClassPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { supabase, user, lesson, curriculum } = await getStudentLesson(lessonId);
  const { data: videos } = await supabase.from("lesson_materials").select("id, title, description, content_url, duration_minutes, instructions").eq("lesson_id", lessonId).eq("phase", "before_class").eq("material_type", "video").eq("is_published", true).order("sort_order").order("created_at");
  const { data: colabs } = await supabase.from("lesson_materials").select("id, title, description, content_url, material_type, instructions").eq("lesson_id", lessonId).eq("phase", "before_class").in("material_type", ["worksheet", "colab", "quiz"]).eq("is_published", true).order("created_at");
  
  const phaseProgressObj = await checkPhaseAccess(lessonId, "before_class");
  const pathway = await getStudentPathway(supabase, lessonId, user.id, "before_class");
  const pathwayCompleted = !pathway.error && pathway.steps.every(step => !step.required || step.completed);

  const ids = [...(videos ?? []).map(v => v.id), ...(colabs ?? []).map(c => c.id)];
  
  const [{ data: progress }, { data: checkpoints }, { data: attempts }, { data: phaseProgress }] = await Promise.all([
    ids.length ? supabase.from("lesson_material_progress").select("material_id, watched_seconds, is_complete").eq("student_id", user.id).in("material_id", ids) : Promise.resolve({ data: [] }),
    ids.length ? supabase.from("student_video_checkpoints").select("id, material_id, checkpoint_percent, question, option_a, option_b, option_c, option_d").in("material_id", ids).order("checkpoint_percent") : Promise.resolve({ data: [] }),
    ids.length ? supabase.from("video_checkpoint_attempts").select("checkpoint_id").eq("student_id", user.id).eq("is_correct", true) : Promise.resolve({ data: [] }),
    supabase.from("student_phase_progress").select("is_completed").eq("lesson_id", lessonId).eq("student_id", user.id).eq("phase", "before_class").maybeSingle(),
  ]);
  
  const progressByMaterial = new Map((progress ?? []).map((item) => [item.material_id, { seconds: Number(item.watched_seconds) || 0, isComplete: item.is_complete }]));
  const correctIds = new Set((attempts ?? []).map((item) => item.checkpoint_id));

  // Determine if all required materials are completed
  // For videos, checking if is_complete is true (set by db triggers when checkpoints are done and video ends).
  // Alternatively, just checking progressByMaterial.get(id)?.isComplete
  const allMaterialsCompleted = pathwayCompleted && ids.filter(id => (videos ?? []).some(video => video.id === id) || (colabs ?? []).some(item => item.id === id && ["colab", "quiz"].includes(item.material_type))).every(id => progressByMaterial.get(id)?.isComplete);

  let finalQs: { id: string; question_text: string }[] | null = null;
  if (allMaterialsCompleted) {
    const { data: rpcQs, error: rpcErr } = await supabase.rpc("get_student_final_questions", {
      p_lesson_id: lessonId,
      p_phase: "before_class",
    });
    if (!rpcErr && rpcQs) {
      finalQs = rpcQs;
    } else {
      // RPC unavailable (migration 017 not applied) — do NOT fall back to direct table read.
      // Direct reads could bypass phase/material gates once RPC is the authoritative source.
      console.error("[before-class] get_student_final_questions RPC failed, not falling back to direct read.", rpcErr?.message);
      finalQs = null;
    }
  }

  // Clean title for header
  const cleanTitle = lesson.title.replace(/^Bài\s+\d+[.:]?\s*/i, "");
  const hasMaterials = (videos?.length ?? 0) > 0 || (colabs?.length ?? 0) > 0 || pathway.steps.length > 0 || Boolean(finalQs?.length);

  return (
    <PortalShell role="student" aiLessonCode={curriculum.code} active="lessons" account={<LogoutButton />}>
      <StudentLessonHeader 
        lessonId={lessonId}
        lessonTitle={cleanTitle}
        chapterCode={curriculum.chapterCode}
        lessonCode={curriculum.code}
        description={lesson.learning_objectives || lesson.description}
        activePhase="before_class"
        phaseProgress={phaseProgressObj}
      />
      
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px" }}>
        <StudentPathwayStepViewer phase="before_class" {...pathway} />
        {curriculum.code === "B23" && !pathway.steps.some(step => step.activityKey === "radioactive_decay_half_life") && <HalfLifeDiscovery />}
        {curriculum.code === "B21" && (
          <section className="physics-lab-container" style={{ padding: "0 0 48px" }}>
            <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>Mô phỏng khám phá</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>Em hãy tương tác với mô phỏng dưới đây để hình dung sơ bộ về nội dung bài học.</p>
            <div style={{ pointerEvents: "auto" }}>
              <FixedPhysicsActivityRenderer activityKey="rutherford_alpha_scattering" />
            </div>
          </section>
        )}

        {!hasMaterials && pathway.steps.length === 0 ? (
          <section className="empty-state" style={{ padding: "64px 0", textAlign: "center", color: "var(--text-muted)" }}>
            <h2 style={{ fontSize: "20px", color: "var(--text-primary)", marginBottom: "8px" }}>Chưa có học liệu bổ sung được xuất bản</h2>
            <p style={{ marginBottom: "24px" }}>Giáo viên chưa mở học liệu cho pha này.</p>
          </section>
        ) : (
          <section className="content-list" aria-label="Học liệu chuẩn bị">
            {videos && videos.length > 0 && await Promise.all(videos.map(async (video) => {
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
                        initialSeconds={progressByMaterial.get(video.id)?.seconds ?? 0} 
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

            {colabs?.map(colab => (
              <StudentColabViewer 
                key={colab.id} 
                material={{
                  id: colab.id,
                  title: colab.title,
                  content_url: colab.content_url ?? "",
                  description: colab.description,
                  instructions: colab.instructions,
                  is_complete: progressByMaterial.get(colab.id)?.isComplete ?? false
                }}
              />
            ))}

            {allMaterialsCompleted && finalQs && finalQs.length === 2 && (
              <StudentPhaseFinalQuestions
                lessonId={lessonId}
                phase="before_class"
                questions={finalQs}
                isCompleted={phaseProgress?.is_completed ?? false}
              />
            )}
            
            {(!allMaterialsCompleted && (ids.length > 0 || pathway.steps.length > 0)) && (
              <div style={{ textAlign: "center", marginTop: "48px", padding: "24px", color: "var(--text-muted)", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "var(--radius-md)" }}>
                <p>Em cần hoàn thành các học liệu ở trên để mở khóa câu hỏi chốt kiến thức.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </PortalShell>
  );
}
