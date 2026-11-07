import Link from "next/link";
import { redirect } from "next/navigation";
import { StudentShell } from "../../StudentShell";
import { createClient } from "@/lib/supabase/server";
import { getCurriculumChapter, CHAPTER_TOPIC_TITLES, getCurriculumLessonByTitle, type CurriculumChapterCode } from "@/lib/curriculum";

export default async function StudentChapterPage({ params }: { params: Promise<{ chapterCode: string }> }) {
  const { chapterCode } = await params;
  const chapter = getCurriculumChapter(chapterCode.toUpperCase());
  if (!chapter) redirect("/student/curriculum");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: memberships } = user ? await supabase.from("class_members").select("class_id").eq("student_id", user.id) : { data: [] };
  const classIds = memberships?.map((item) => item.class_id) ?? [];

  // SCHEMA: topics { id, teacher_id, title, ... }
  //         lessons { id, topic_id, class_id, teacher_id, title, status, ... }
  //
  // Resolve published lessons for this chapter via topic title → topic.id → lessons.topic_id.
  // We look for topics whose title matches the canonical topic title for this chapter.
  const topicTitle = CHAPTER_TOPIC_TITLES[chapter.code as CurriculumChapterCode];
  const { data: matchingTopics } = await supabase
    .from("topics")
    .select("id")
    .eq("title", topicTitle);

  const topicIds = (matchingTopics ?? []).map((t) => t.id);

  const { data: publishedLessons } = classIds.length && topicIds.length
    ? await supabase
        .from("lessons")
        .select("id, title, status")
        .in("class_id", classIds)
        .in("topic_id", topicIds)
        .eq("status", "published")
    : { data: [] };

  // Map published DB lessons by normalized title so fixed-catalog rows can match them.
  const lessonByTitle = new Map(
    (publishedLessons ?? []).map((lesson) => [getCurriculumLessonByTitle(lesson.title, chapter.code)?.code ?? "", lesson]),
  );

  const lessonIds = (publishedLessons ?? []).map((lesson) => lesson.id);
  const { data: materials } = lessonIds.length ? await supabase.from("lesson_materials").select("id, lesson_id").in("lesson_id", lessonIds) : { data: [] };
  const materialIds = (materials ?? []).map((material) => material.id);
  const { data: progress } = user && materialIds.length ? await supabase.from("lesson_material_progress").select("material_id, is_complete, watched_seconds").eq("student_id", user.id).in("material_id", materialIds) : { data: [] };
  const progressByLesson = new Map<string, { started: boolean; complete: boolean }>();
  for (const material of materials ?? []) {
    const item = progress?.find((row) => row.material_id === material.id);
    const current = progressByLesson.get(material.lesson_id) ?? { started: false, complete: true };
    current.started ||= Boolean(item && (item.is_complete || Number(item.watched_seconds) > 0));
    current.complete &&= Boolean(item?.is_complete);
    progressByLesson.set(material.lesson_id, current);
  }

  return (
    <StudentShell active="curriculum" eyebrow={`Vật lí 12 · Chương ${chapter.code}`} title={chapter.shortTitle} description={`${chapter.lessons.length} bài học. Mở bài do giáo viên giao để bắt đầu học.`}>
      <div className="chapter-detail" style={{ maxWidth: "800px", margin: "0 auto", padding: "0 0 24px" }}>
        
        {/* Lesson List */}
        <div className="lesson-list" style={{ display: "flex", flexDirection: "column" }}>
          {chapter.lessons.map((fixedLesson) => {
            const lesson = lessonByTitle.get(fixedLesson.code);
            const state = lesson ? progressByLesson.get(lesson.id) : undefined;
            const status = !lesson ? "Chưa mở" : state?.complete ? "Đã hoàn thành" : state?.started ? "Đang học" : "Chưa bắt đầu";
            
            // Clean title: remove "Bài XX - " or "Bài XX: " from the start
            const cleanTitle = fixedLesson.title.replace(/^Bài\s+\d+[.:]?\s*/i, "");

            const rowContent = (
              <div style={{ display: "flex", alignItems: "flex-start", padding: "24px 0", borderBottom: "1px solid var(--border-light)" }}>
                <div style={{ width: "64px", flexShrink: 0, fontSize: "20px", color: "var(--text-muted)", fontWeight: 400 }}>
                  {fixedLesson.number}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: lesson ? "var(--text-primary)" : "var(--text-muted)", fontWeight: 500 }}>
                    {cleanTitle}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>
                    {status === "Đang học" && <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--color-primary)" }} />}
                    {status === "Đã hoàn thành" && <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--semantic-success)" }} />}
                    <span style={{ color: status === "Đang học" ? "var(--color-primary)" : status === "Đã hoàn thành" ? "var(--semantic-success)" : "inherit" }}>
                      {status}
                    </span>
                  </div>
                </div>
                <div style={{ paddingLeft: "16px", color: "var(--text-muted)", fontSize: "18px", opacity: lesson ? 1 : 0.3 }}>
                  →
                </div>
              </div>
            );

            if (lesson) {
              return (
                <Link 
                  href={`/student/lessons/${lesson.id}`} 
                  key={fixedLesson.code}
                  className="chapter-list-row"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {rowContent}
                </Link>
              );
            }

            return <div key={fixedLesson.code} style={{ opacity: 0.7 }}>{rowContent}</div>;
          })}
        </div>
      </div>
    </StudentShell>
  );
}