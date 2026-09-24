import { TeacherShell } from "../../../TeacherShell";
import { LessonNavigation } from "@/components/learning/LessonNavigation";
import { HomeworkManager } from "../../../HomeworkManager";
import { getTeacherLesson } from "@/lib/teacher-lesson";

export default async function TeacherAssessmentPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { lesson, classItem, curriculum } = await getTeacherLesson(lessonId);
  return <TeacherShell active="curriculum" title={`${lesson.title} — Pha 3: Bài tập cuối bài`} description="Soạn, lưu và xuất bản yêu cầu củng cố sau giờ học.">
    <LessonNavigation role="teacher" lessonId={lessonId} className={classItem.name} lessonTitle={lesson.title} active="after_class" classId={classItem.id} chapterCode={curriculum.chapterCode} />
    <HomeworkManager lessonId={lessonId} initial={{ title: lesson.homework_title ?? "", description: lesson.homework_description ?? "", instructions: lesson.homework_instructions ?? "", dueDate: lesson.homework_due_date, status: lesson.homework_status === "published" ? "published" : "draft" }} />
  </TeacherShell>;
}
