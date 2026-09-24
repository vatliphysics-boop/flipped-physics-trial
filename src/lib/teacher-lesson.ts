import "server-only";
import { notFound } from "next/navigation";
import { getCurriculumLesson } from "@/lib/curriculum";
import { getTeacherContext } from "@/app/teacher/data";

export async function getTeacherLesson(lessonId: string) {
  const { supabase, user } = await getTeacherContext();
  const { data: lesson } = await supabase.from("lessons").select("id, title, description, learning_objectives, status, class_id, curriculum_code, activity_key, homework_title, homework_description, homework_instructions, homework_due_date, homework_status").eq("id", lessonId).eq("teacher_id", user.id).maybeSingle();
  if (!lesson?.class_id || !lesson.curriculum_code) notFound();
  const curriculum = getCurriculumLesson(lesson.curriculum_code);
  if (!curriculum) notFound();
  const { data: classItem } = await supabase.from("classes").select("id, name, join_code").eq("id", lesson.class_id).eq("teacher_id", user.id).maybeSingle();
  if (!classItem) notFound();
  return { supabase, user, lesson, classItem, curriculum };
}
