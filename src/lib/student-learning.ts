import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChapterByTopicTitle, getCurriculumLessonByTitle, type FixedCurriculumLesson, type CurriculumChapterCode } from "@/lib/curriculum";

export type LearningPhase = "before_class" | "in_class" | "after_class";
export const LEARNING_PHASE_LABELS: Record<LearningPhase, string> = {
  before_class: "Trước giờ học",
  in_class: "Trong giờ học",
  after_class: "Sau giờ học",
};

export function getStudentNav(active: "overview" | "curriculum" | "classes" | "journal") {
  return [
    { label: "Tổng quan", href: "/student", active: active === "overview" },
    { label: "Chương trình học", href: "/student/curriculum", active: active === "curriculum" },
    { label: "Lớp học của em", href: "/student/classes", active: active === "classes" },
    { label: "Nhật kí học tập", href: "/student/journal", active: active === "journal" },
  ];
}

export type StudentClassRecord = {
  id: string;
  name: string;
  description: string;
  join_code: string;
  joined_at: string;
};

export type StudentMaterial = {
  id: string;
  lesson_id: string;
  title: string;
  phase: LearningPhase;
  material_type: string;
  content_url: string | null;
  sort_order: number;
  created_at: string;
};

type MaterialProgress = {
  material_id: string;
  watched_seconds: number;
  completion_percent: number;
  is_complete: boolean;
  updated_at: string;
};

export type StudentReflection = {
  lesson_id: string;
  learned: string;
  difficult: string;
  next_step: string;
  confidence: number;
  homework_response: string;
  updated_at: string;
};

type PublishedLesson = {
  id: string;
  class_id: string;
  topic_id: string | null;
  title: string;
  homework_status?: string;
  homework_title?: string;
};

export type StudentLearningLesson = PublishedLesson & {
  curriculum: FixedCurriculumLesson;
  className: string;
  materials: StudentMaterial[];
  completedMaterials: number;
  started: boolean;
  complete: boolean;
  nextPhase: LearningPhase;
  nextActivity: string;
  lastUpdated: string | null;
  reflection: StudentReflection | undefined;
};

export const getStudentContext = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "student") redirect(profile?.role === "teacher" ? "/teacher" : "/login");

  const membershipResult = await supabase.from("class_members")
    .select("class_id, joined_at").eq("student_id", user.id).order("joined_at", { ascending: false });
  const classIds = (membershipResult.data ?? []).map((membership) => membership.class_id as string);
  const classesResult = classIds.length
    ? await supabase.from("classes").select("id, name, description, join_code").in("id", classIds)
    : { data: [], error: null };
  const classesById = new Map((classesResult.data ?? []).map((item) => [item.id, item]));
  const classes: StudentClassRecord[] = [];
  for (const membership of membershipResult.data ?? []) {
    const classItem = classesById.get(membership.class_id);
    if (classItem) classes.push({ ...classItem, joined_at: membership.joined_at } as StudentClassRecord);
  }
  return { supabase, user, classes, error: Boolean(membershipResult.error || classesResult.error) };
});

const phaseOrder: Record<LearningPhase, number> = { before_class: 0, in_class: 1, after_class: 2 };

export const getStudentLearning = cache(async () => {
  const context = await getStudentContext();
  const { supabase, user, classes } = context;
  const classesById = new Map(classes.map((item) => [item.id, item]));
  const lessonResult = classes.length
    ? await supabase.from("lessons")
      .select("id, class_id, topic_id, title")
      .in("class_id", classes.map((item) => item.id)).eq("status", "published")
      .not("topic_id", "is", null).returns<PublishedLesson[]>()
    : { data: [], error: null };

  // Resolve topic titles so we can map topic_id → chapter → curriculum lesson.
  const topicIds = [...new Set((lessonResult.data ?? []).map((l) => l.topic_id).filter(Boolean) as string[])];
  const topicTitleMap = new Map<string, string>();
  if (topicIds.length) {
    const { data: topics } = await supabase.from("topics").select("id, title").in("id", topicIds);
    for (const t of topics ?? []) topicTitleMap.set(t.id, t.title);
  }

  const publishedLessons = (lessonResult.data ?? []).filter((lesson) => {
    const topicTitle = lesson.topic_id ? topicTitleMap.get(lesson.topic_id) : undefined;
    const chapter = getChapterByTopicTitle(topicTitle);
    return chapter && getCurriculumLessonByTitle(lesson.title, chapter.code as CurriculumChapterCode);
  });
  const lessonIds = publishedLessons.map((lesson) => lesson.id);
  const [materialResult, reflectionResult] = await Promise.all([
    lessonIds.length ? supabase.from("lesson_materials")
      .select("id, lesson_id, title, phase, material_type, content_url, sort_order, created_at")
      .in("lesson_id", lessonIds).eq("is_published", true).returns<StudentMaterial[]>() : Promise.resolve({ data: [], error: null }),
    lessonIds.length ? supabase.from("lesson_reflections")
      .select("lesson_id, learned, difficult, next_step, confidence, homework_response, updated_at")
      .eq("student_id", user.id).in("lesson_id", lessonIds).returns<StudentReflection[]>() : Promise.resolve({ data: [], error: null }),
  ]);
  const materials = materialResult.data ?? [];
  const progressResult = materials.length
    ? await supabase.from("lesson_material_progress")
      .select("material_id, watched_seconds, completion_percent, is_complete, updated_at")
      .eq("student_id", user.id).in("material_id", materials.map((material) => material.id)).returns<MaterialProgress[]>()
    : { data: [], error: null };
  const progressByMaterial = new Map((progressResult.data ?? []).map((row) => [row.material_id, row]));
  const reflectionsByLesson = new Map((reflectionResult.data ?? []).map((row) => [row.lesson_id, row]));
  const lessons: StudentLearningLesson[] = publishedLessons.map((lesson) => {
    const topicTitle = lesson.topic_id ? topicTitleMap.get(lesson.topic_id) : undefined;
    const chapter = getChapterByTopicTitle(topicTitle);
    const curriculum = chapter
      ? getCurriculumLessonByTitle(lesson.title, chapter.code as CurriculumChapterCode)!
      : undefined;
    if (!curriculum) throw new Error(`curriculum entry missing for lesson ${lesson.id}`);
    const lessonMaterials = materials.filter((material) => material.lesson_id === lesson.id)
      .sort((a, b) => phaseOrder[a.phase] - phaseOrder[b.phase] || a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at));
    const progress = lessonMaterials.flatMap((material) => {
      const row = progressByMaterial.get(material.id);
      return row ? [row] : [];
    });
    const reflection = reflectionsByLesson.get(lesson.id);
    const completedMaterials = progress.filter((row) => row.is_complete).length;
    const nextMaterial = lessonMaterials.find((material) => !progressByMaterial.get(material.id)?.is_complete);
    // homework_* fields absent from actual DB schema.
    const updatedDates = [...progress.map((row) => row.updated_at), ...(reflection ? [reflection.updated_at] : [])].sort();
    return {
      ...lesson,
      curriculum,
      className: classesById.get(lesson.class_id)?.name ?? "Lớp học của em",
      materials: lessonMaterials,
      completedMaterials,
      started: Boolean(reflection || progress.some((row) => row.is_complete || Number(row.watched_seconds) > 0 || Number(row.completion_percent) > 0)),
      complete: !materialResult.error && !progressResult.error && !reflectionResult.error && lessonMaterials.length > 0 && completedMaterials === lessonMaterials.length && Boolean(reflection),
      nextPhase: nextMaterial?.phase ?? "after_class",
      nextActivity: nextMaterial?.title ?? "Tự đánh giá và lưu nhật kí học tập",
      lastUpdated: updatedDates.at(-1) ?? null,
      reflection,
    };
  });
  lessons.sort((a, b) => a.curriculum.number - b.curriculum.number);
  return {
    ...context,
    lessons,
    progressByMaterial,
    error: Boolean(context.error || lessonResult.error || materialResult.error || progressResult.error),
    reflectionsUnavailable: Boolean(reflectionResult.error),
  };
});
