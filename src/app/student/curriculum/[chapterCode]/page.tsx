import Link from "next/link";
import { redirect } from "next/navigation";
import { StudentShell } from "../../StudentShell";
import { createClient } from "@/lib/supabase/server";
import { getCurriculumChapter } from "@/lib/curriculum";

export default async function StudentChapterPage({ params }: { params: Promise<{ chapterCode: string }> }) {
  const { chapterCode } = await params;
  const chapter = getCurriculumChapter(chapterCode.toUpperCase());
  if (!chapter) redirect("/student/curriculum");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: memberships } = user ? await supabase.from("class_members").select("class_id").eq("student_id", user.id) : { data: [] };
  const classIds = memberships?.map((item) => item.class_id) ?? [];
  const { data: publishedLessons } = classIds.length ? await supabase.from("lessons").select("id, curriculum_code, status").in("class_id", classIds).eq("status", "published").not("curriculum_code", "is", null) : { data: [] };
  const lessonByCode = new Map((publishedLessons ?? []).map((lesson) => [lesson.curriculum_code, lesson]));
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
    <StudentShell active="curriculum" eyebrow="Vật lí 12" title={chapter.title} description="">
      <div className="chapter-detail" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 0" }}>
        
        {/* Breadcrumb & Header */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", gap: "8px", fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px" }}>
            <Link href="/student" style={{ textDecoration: "none", color: "inherit" }}>Vật lí 12</Link>
            <span>/</span>
            <Link href="/student/curriculum" style={{ textDecoration: "none", color: "inherit" }}>Chương {chapter.code}</Link>
          </div>
          <h1 style={{ fontSize: "36px", margin: "0 0 16px", color: "var(--text-primary)", fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase" }}>
            {chapter.shortTitle}
          </h1>
          <div style={{ fontSize: "16px", color: "var(--text-secondary)" }}>
            {chapter.lessons.length} bài học
          </div>
        </div>

        {/* Lesson List */}
        <div className="lesson-list" style={{ display: "flex", flexDirection: "column" }}>
          {chapter.lessons.map((fixedLesson) => {
            const lesson = lessonByCode.get(fixedLesson.code);
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