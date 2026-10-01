import { TeacherShell } from "../../../TeacherShell";
import { LessonNavigation } from "@/components/learning/LessonNavigation";
import { getTeacherLesson } from "@/lib/teacher-lesson";
import { QuestionBankManager } from "@/components/learning/QuestionBankManager";
import { PdfMaterialManager } from "@/components/learning/PdfMaterialManager";
import { PathwayStepManager } from "@/components/learning/PathwayStepManager";
import { getLessonPathway, getCombinedMaterialBank } from "@/lib/material-bank";

export default async function TeacherAssessmentPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { supabase, user, lesson, classItem, curriculum } = await getTeacherLesson(lessonId);
  const { data: questions } = await supabase.from("phase_assessment_questions").select("*").eq("lesson_id", lessonId).order("sort_order");
  const { data: pdfs } = await supabase.from("lesson_materials").select("*").eq("lesson_id", lessonId).eq("phase", "after_class").in("material_type", ["worksheet", "pdf"]).order("created_at");

  const pathwaySteps = await getLessonPathway(supabase, lessonId, "after_class");
  const bankMaterials = await getCombinedMaterialBank(supabase, user.id, "all");

  return <TeacherShell
    active="curriculum"
    title={lesson.title}
    description="Soạn, lưu và xuất bản yêu cầu củng cố sau giờ học."
    lessonMeta={{
      chapterLabel: `Chương ${curriculum.chapterCode}`,
      lessonLabel: `Bài ${curriculum.number}`,
      className: classItem.name,
      lessonTitle: lesson.title,
      phaseLabel: "Pha 3 · Sau giờ học",
      phaseDescription: "Bài tập củng cố và đánh giá sau bài học",
    }}
  >
    <LessonNavigation role="teacher" lessonId={lessonId} className={classItem.name} lessonTitle={lesson.title} active="after_class" classId={classItem.id} chapterCode={curriculum.chapterCode} />
    
    <PathwayStepManager
      lessonId={lessonId}
      phase="after_class"
      steps={pathwaySteps}
      availableMaterials={bankMaterials}
      lessonCode={curriculum.code}
    />

    <PdfMaterialManager lessonId={lessonId} materials={pdfs ?? []} />
    <QuestionBankManager lessonId={lessonId} questions={questions ?? []} availablePdfs={pdfs ?? []} />
  </TeacherShell>;
}
