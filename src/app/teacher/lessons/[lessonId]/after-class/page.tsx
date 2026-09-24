import { TeacherShell } from "../../../TeacherShell";
import { LessonNavigation } from "@/components/learning/LessonNavigation";
import { getTeacherLesson } from "@/lib/teacher-lesson";
import { QuestionBankManager } from "@/components/learning/QuestionBankManager";
import { PdfMaterialManager } from "@/components/learning/PdfMaterialManager";

export default async function TeacherAssessmentPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { supabase, lesson, classItem, curriculum } = await getTeacherLesson(lessonId);
  const { data: questions } = await supabase.from("phase_assessment_questions").select("*").eq("lesson_id", lessonId).order("sort_order");
  const { data: pdfs } = await supabase.from("lesson_materials").select("*").eq("lesson_id", lessonId).eq("phase", "after_class").in("material_type", ["worksheet", "pdf"]).order("created_at");

  return <TeacherShell active="curriculum" title={`${lesson.title} — Pha 3: Bài tập cuối bài`} description="Soạn, lưu và xuất bản yêu cầu củng cố sau giờ học.">
    <LessonNavigation role="teacher" lessonId={lessonId} className={classItem.name} lessonTitle={lesson.title} active="after_class" classId={classItem.id} chapterCode={curriculum.chapterCode} />
    <PdfMaterialManager lessonId={lessonId} materials={pdfs ?? []} />
    <QuestionBankManager lessonId={lessonId} questions={questions ?? []} />
  </TeacherShell>;
}
