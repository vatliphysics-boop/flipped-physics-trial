import { TeacherShell } from "../../../TeacherShell";
import { LessonNavigation } from "@/components/learning/LessonNavigation";
import { getTeacherLesson } from "@/lib/teacher-lesson";
import { PhysicsActivityList } from "@/components/physics/FixedPhysicsActivityRenderer";
import { ColabMaterialManager } from "@/components/learning/ColabMaterialManager";
import { PhaseFinalQuestionsManager } from "@/components/learning/PhaseFinalQuestionsManager";
import { VideoMaterialManager, type VideoMaterial } from "../VideoMaterialManager";
import { PhaseActionHeader } from "@/components/learning/PhaseActionHeader";

export default async function TeacherSimulationPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { supabase, lesson, classItem, curriculum } = await getTeacherLesson(lessonId);
  const { data: colabs } = await supabase.from("lesson_materials").select("*").eq("lesson_id", lessonId).eq("phase", "in_class").eq("material_type", "worksheet").order("created_at");
  const { data: finalQs } = await supabase.from("phase_final_questions").select("*").eq("lesson_id", lessonId).eq("phase", "in_class").order("sort_order");
  
  // Video for Phase 2
  const { data: videos } = await supabase.from("lesson_materials").select("*").eq("lesson_id", lessonId).eq("phase", "in_class").eq("material_type", "video").order("created_at");
  const videoMaterials: VideoMaterial[] = (videos ?? []).map((video) => ({
    id: video.id, title: video.title, description: video.description, content_url: video.content_url, duration_minutes: video.duration_minutes, instructions: video.instructions, is_published: video.is_published, checkpoint_questions: []
  }));

  return <TeacherShell active="curriculum" title={`${lesson.title} — Pha 2: Mô phỏng và khám phá`} description="Tổ chức hoạt động quan sát, thảo luận và khám phá trong giờ học.">
    <LessonNavigation role="teacher" lessonId={lessonId} className={classItem.name} lessonTitle={lesson.title} active="in_class" classId={classItem.id} chapterCode={curriculum.chapterCode} />
    <section className="phase-panel" style={{ marginBottom: "24px" }}><header className="section-header"><div><h2>Hoạt động mô phỏng (Hệ thống)</h2><p>Thực hiện từng hoạt động theo đúng bài học để tổ chức thảo luận trên lớp.</p></div></header><PhysicsActivityList lessonCode={curriculum.code as "B21"|"B22"|"B23"|"B24"|"B25"} /></section>
    
    <section className="card" style={{ padding: "24px", marginBottom: "24px" }}>
      <PhaseActionHeader 
        title="HỌC LIỆU BỔ SUNG" 
        actions={[
          { label: "+ Upload video", eventName: "open-video-form", primary: true },
          { label: "+ Thêm Google Colab", eventName: "open-colab-form" }
        ]} 
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <VideoMaterialManager lessonId={lessonId} materials={videoMaterials} hideHeader={true} />
        <ColabMaterialManager lessonId={lessonId} phase="in_class" materials={colabs ?? []} hideHeader={true} />
      </div>
    </section>

    <PhaseFinalQuestionsManager lessonId={lessonId} phase="in_class" questions={finalQs ?? []} />
  </TeacherShell>;
}

