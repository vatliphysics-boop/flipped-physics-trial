import "server-only";
import { notFound } from "next/navigation";
import { getChapterByTopicTitle, getCurriculumLessonByTitle, type CurriculumChapterCode } from "@/lib/curriculum";
import { createClient } from "@/lib/supabase/server";

export async function getStudentLesson(lessonId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "student") notFound();

  // ACTUAL DB SCHEMA: lessons { id, topic_id, class_id, teacher_id, title, description,
  //                             learning_objectives, status, created_at }
  // No curriculum_code, activity_key, homework_* columns.
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, description, learning_objectives, status, class_id, topic_id")
    .eq("id", lessonId)
    .eq("status", "published")
    .maybeSingle();

  if (!lesson?.class_id) notFound();

  // Resolve topic to find chapter and curriculum entry.
  const { data: topic } = lesson.topic_id
    ? await supabase.from("topics").select("id, title").eq("id", lesson.topic_id).maybeSingle()
    : { data: null };

  const chapter = getChapterByTopicTitle(topic?.title);
  const curriculum = chapter
    ? getCurriculumLessonByTitle(lesson.title, chapter.code as CurriculumChapterCode)
    : undefined;

  if (!curriculum) notFound();

  const { data: membership } = await supabase
    .from("class_members")
    .select("class_id")
    .eq("class_id", lesson.class_id)
    .eq("student_id", user.id)
    .maybeSingle();

  const { data: classItem } = membership
    ? await supabase.from("classes").select("id, name").eq("id", lesson.class_id).maybeSingle()
    : { data: null };

  if (!membership || !classItem) notFound();

  return { supabase, user, lesson, classItem, curriculum };
}
