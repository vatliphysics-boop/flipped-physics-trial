import { TeacherShell } from "../../../TeacherShell";
import { LessonNavigation } from "@/components/learning/LessonNavigation";
import { getTeacherLesson } from "@/lib/teacher-lesson";
import { PhysicsActivityList } from "@/components/physics/FixedPhysicsActivityRenderer";
import { ColabMaterialManager } from "@/components/learning/ColabMaterialManager";
import { PhaseFinalQuestionsManager } from "@/components/learning/PhaseFinalQuestionsManager";
import { VideoMaterialManager, type VideoMaterial } from "../VideoMaterialManager";
import { PhaseActionHeader } from "@/components/learning/PhaseActionHeader";
import { PathwayStepManager } from "@/components/learning/PathwayStepManager";
import { getLessonPathway, getCombinedMaterialBank } from "@/lib/material-bank";

export default async function TeacherSimulationPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { supabase, user, lesson, classItem, curriculum } = await getTeacherLesson(lessonId);
  const { data: colabs } = await supabase.from("lesson_materials").select("*").eq("lesson_id", lessonId).eq("phase", "in_class").eq("material_type", "worksheet").order("created_at");
  const { data: finalQs } = await supabase.from("phase_final_questions").select("*").eq("lesson_id", lessonId).eq("phase", "in_class").order("sort_order");
  
  const pathwaySteps = await getLessonPathway(supabase, lessonId, "in_class");
  const bankMaterials = await getCombinedMaterialBank(supabase, user.id, "all");

  // Video for Phase 2
  const { data: videos } = await supabase.from("lesson_materials").select("*").eq("lesson_id", lessonId).eq("phase", "in_class").eq("material_type", "video").order("created_at");
  const videoMaterials: VideoMaterial[] = (videos ?? []).map((video) => ({
    id: video.id, title: video.title, description: video.description, content_url: video.content_url, duration_minutes: video.duration_minutes, instructions: video.instructions, is_published: video.is_published, checkpoint_questions: []
  }));

  return <TeacherShell
    active="curriculum"
    title={lesson.title}
    description="Tổ chức hoạt động quan sát, thảo luận và khám phá trong giờ học."
    lessonMeta={{
      chapterLabel: `Chương ${curriculum.chapterCode}`,
      lessonLabel: `Bài ${curriculum.number}`,
      className: classItem.name,
      lessonTitle: lesson.title,
      phaseLabel: "Pha 2 · Trong giờ học",
      phaseDescription: "Mô phỏng, quan sát và thảo luận trên lớp",
    }}
  >
    <LessonNavigation role="teacher" lessonId={lessonId} className={classItem.name} lessonTitle={lesson.title} active="in_class" classId={classItem.id} chapterCode={curriculum.chapterCode} />
    
    <PathwayStepManager
      lessonId={lessonId}
      phase="in_class"
      steps={pathwaySteps}
      availableMaterials={bankMaterials}
      lessonCode={curriculum.code}
    />

    <section className="phase-panel" style={{ marginBottom: "24px" }}><header className="section-header"><div><h2>Mô phỏng và khám phá</h2><p style={{ fontWeight: 400, color: "var(--text-secondary)", fontSize: "14px" }}>Thực hiện từng hoạt động theo đúng bài học để tổ chức thảo luận trên lớp.</p></div></header><PhysicsActivityList lessonCode={curriculum.code as "B21"|"B22"|"B23"|"B24"|"B25"} /></section>
    
    <section className="card" style={{ padding: "24px", marginBottom: "24px" }}>
      <PhaseActionHeader 
        title="HỌC LIỆU BỔ SUNG" 
        actions={[
          { label: "+ Upload video", eventName: "open-video-form", primary: true },
          { label: "+ Thêm Google Colab", eventName: "open-colab-form" }
        ]} 
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <VideoMaterialManager lessonId={lessonId} materials={videoMaterials} hideHeader={true} emptyState="Chưa có học liệu bổ sung cho giai đoạn trong giờ học" />
        <ColabMaterialManager lessonId={lessonId} phase="in_class" materials={colabs ?? []} hideHeader={true} />
      </div>
    </section>

    <PhaseFinalQuestionsManager lessonId={lessonId} phase="in_class" questions={finalQs ?? []} />
  </TeacherShell>;
}
