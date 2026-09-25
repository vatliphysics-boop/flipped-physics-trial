import "server-only";
import { notFound } from "next/navigation";
import { getChapterByTopicTitle, getCurriculumLessonByTitle, type CurriculumChapterCode } from "@/lib/curriculum";
import { getTeacherContext } from "@/app/teacher/data";

export async function getTeacherLesson(lessonId: string) {
  const { supabase, user } = await getTeacherContext();

  // ACTUAL DB SCHEMA: lessons { id, topic_id, class_id, teacher_id, title, description,
  //                             learning_objectives, status, created_at }
  // No curriculum_code, activity_key, homework_* columns.
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, description, learning_objectives, status, class_id, topic_id")
    .eq("id", lessonId)
    .eq("teacher_id", user.id)
    .maybeSingle();

  if (!lesson?.class_id) notFound();

  // Resolve topic to find chapter.
  const { data: topic } = lesson.topic_id
    ? await supabase.from("topics").select("id, title").eq("id", lesson.topic_id).maybeSingle()
    : { data: null };

  const chapter = getChapterByTopicTitle(topic?.title);
  // Try to match lesson to fixed curriculum entry by title within the chapter.
  const curriculum = chapter
    ? getCurriculumLessonByTitle(lesson.title, chapter.code as CurriculumChapterCode)
    : undefined;

  if (!curriculum) notFound();

  const { data: classItem } = await supabase
    .from("classes")
    .select("id, name, join_code")
    .eq("id", lesson.class_id)
    .eq("teacher_id", user.id)
    .maybeSingle();

  if (!classItem) notFound();

  return { supabase, user, lesson, classItem, curriculum };
}
