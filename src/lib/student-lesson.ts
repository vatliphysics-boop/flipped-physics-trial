import "server-only";
import { notFound } from "next/navigation";
import { getCurriculumLesson } from "@/lib/curriculum";
import { createClient } from "@/lib/supabase/server";

export async function getStudentLesson(lessonId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "student") notFound();
  const { data: lesson } = await supabase.from("lessons").select("id, title, description, learning_objectives, status, class_id, curriculum_code, activity_key, homework_title, homework_description, homework_instructions, homework_due_date, homework_status").eq("id", lessonId).eq("status", "published").maybeSingle();
  if (!lesson?.class_id || !lesson.curriculum_code) notFound();
  const { data: membership } = await supabase.from("class_members").select("class_id").eq("class_id", lesson.class_id).eq("student_id", user.id).maybeSingle();
  const { data: classItem } = membership ? await supabase.from("classes").select("id, name").eq("id", lesson.class_id).maybeSingle() : { data: null };
  const curriculum = getCurriculumLesson(lesson.curriculum_code);
  if (!membership || !classItem || !curriculum) notFound();
  return { supabase, user, lesson, classItem, curriculum };
}
