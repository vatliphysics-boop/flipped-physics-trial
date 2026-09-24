import { TeacherShell } from "../../../TeacherShell";
import { LessonNavigation } from "@/components/learning/LessonNavigation";
import { getTeacherLesson } from "@/lib/teacher-lesson";
import { VideoMaterialManager, type VideoMaterial } from "../VideoMaterialManager";
import { ColabMaterialManager } from "@/components/learning/ColabMaterialManager";
import { PhaseFinalQuestionsManager } from "@/components/learning/PhaseFinalQuestionsManager";

export default async function TeacherBeforeClassPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { supabase, lesson, classItem } = await getTeacherLesson(lessonId);
  const { data: videos } = await supabase
    .from("lesson_materials")
    .select("id, title, description, content_url, duration_minutes, instructions, is_published")
    .eq("lesson_id", lessonId)
    .eq("phase", "before_class")
    .eq("material_type", "video")
    .order("sort_order")
    .order("created_at");

  const videoIds = (videos ?? []).map((v) => v.id);
  const { data: checkpoints } = await (videoIds.length
    ? supabase.from("video_checkpoints").select("id, material_id, checkpoint_percent, question, option_a, option_b, option_c, option_d, correct_option").in("material_id", videoIds).order("sort_order")
    : Promise.resolve({ data: [] }));

  const materials: VideoMaterial[] = (videos ?? []).map((video) => ({
    id: video.id,
    title: video.title,
    description: video.description,
    content_url: video.content_url,
    duration_minutes: video.duration_minutes,
    instructions: video.instructions,
    is_published: video.is_published,
    checkpoint_questions: (checkpoints ?? [])
      .filter((cp) => cp.material_id === video.id)
      .map((cp) => ({
        id: cp.id,
        prompt: cp.question,
        options: [cp.option_a, cp.option_b, cp.option_c, cp.option_d].filter(Boolean) as string[],
        correctIndex: ["A", "B", "C", "D"].indexOf(cp.correct_option),
        atPercent: Number(cp.checkpoint_percent),
      })),
  }));

  const { data: colabs } = await supabase.from("lesson_materials").select("*").eq("lesson_id", lessonId).eq("phase", "before_class").eq("material_type", "worksheet").order("created_at");
  const { data: finalQs } = await supabase.from("phase_final_questions").select("*").eq("lesson_id", lessonId).eq("phase", "before_class").order("sort_order");

  return <TeacherShell active="curriculum" title={`${lesson.title} — Bài giảng và chuẩn bị`} description="Tải, chỉnh sửa và xuất bản video cho học sinh trong lớp.">
    <LessonNavigation role="teacher" lessonId={lessonId} className={classItem.name} lessonTitle={lesson.title} active="before_class" />
    <VideoMaterialManager lessonId={lessonId} materials={materials} />
    <ColabMaterialManager lessonId={lessonId} phase="before_class" materials={colabs ?? []} />
    <PhaseFinalQuestionsManager lessonId={lessonId} phase="before_class" questions={finalQs ?? []} />
  </TeacherShell>;
}
