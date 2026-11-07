import Link from "next/link";
import { notFound } from "next/navigation";
import { TeacherShell } from "../../TeacherShell";
import { getTeacherClasses, getTeacherContext } from "../../data";
import { getCurriculumChapter, CHAPTER_TOPIC_TITLES, getCurriculumLessonByTitle, type CurriculumChapterCode } from "@/lib/curriculum";
import { ChapterIllustration, chapterDescriptions, chapterTones } from "@/components/learning/LessonLearningCard";
import { LEARNING_PHASES, type LearningPhase } from "@/lib/learning-phases";
import { SetupLessonButton } from "../../SetupLessonButton";

export default async function TeacherChapterPage({ params, searchParams }: { params: Promise<{ chapterCode: string }>; searchParams: Promise<{ classId?: string }> }) {
  const { chapterCode } = await params;
  const { classId } = await searchParams;
  const chapter = getCurriculumChapter(chapterCode.toUpperCase());
  const { classes } = await getTeacherClasses();
  const selectedClass = classes.find((item) => item.id === classId);
  if (!chapter || !classId || !selectedClass) notFound();
  const { supabase, user } = await getTeacherContext();

  // SCHEMA: topics { id, teacher_id, title, ... }
  //         lessons { id, topic_id, class_id, teacher_id, title, status, ... }
  //
  // Resolve the canonical topic for this chapter by teacher_id + title.
  const topicTitle = CHAPTER_TOPIC_TITLES[chapter.code as CurriculumChapterCode];
  const { data: topic, error: topicError } = await supabase
    .from("topics")
    .select("id, title")
    .eq("teacher_id", user.id)
    .eq("title", topicTitle)
    .maybeSingle();

  // Primary query: lessons linked to the resolved topic + selected class.
  // If there is no topic yet, lessons will simply be empty (no runtime error).
  const { data: lessons, error: lessonsError } = topic
    ? await supabase
        .from("lessons")
        .select("id, title, status")
        .eq("topic_id", topic.id)
        .eq("class_id", selectedClass.id)
        .eq("teacher_id", user.id)
    : { data: [], error: null };

  const lessonIds = (lessons ?? []).map((lesson) => lesson.id);

  // Secondary query: material counts badge. Failure here NEVER blocks lesson navigation.
  const { data: materials, error: materialsError } = lessonIds.length
    ? await supabase.from("lesson_materials").select("lesson_id, phase").in("lesson_id", lessonIds)
    : { data: [], error: null };

  // Map DB lessons by title (normalized) so we can match to fixed curriculum lessons.
  const lessonsByTitle = new Map(
    (lessons ?? []).map((lesson) => [getCurriculumLessonByTitle(lesson.title, chapter.code)?.code ?? "", lesson]),
  );

  const materialCounts = new Map<string, Partial<Record<LearningPhase, number>>>();
  for (const material of materials ?? []) {
    const phase = material.phase as LearningPhase;
    if (LEARNING_PHASES.includes(phase)) {
      const counts = materialCounts.get(material.lesson_id) ?? {};
      counts[phase] = (counts[phase] ?? 0) + 1;
      materialCounts.set(material.lesson_id, counts);
    }
  }

  // Distinguish between "topic not found in DB" vs "PostgREST query error"
  const topicMissing = !topicError && !topic;

  return <TeacherShell active="curriculum" title={chapter.title} description="Mở từng bài học để quản lý đầy đủ ba pha hoạt động." breadcrumb={<nav className="breadcrumbs" aria-label="Đường dẫn"><Link href={`/teacher/classes/${selectedClass.id}`}>Về lớp {selectedClass.name}</Link><span>›</span><Link href={`/teacher/curriculum?classId=${selectedClass.id}`}>Chương trình</Link><span>›</span><strong>Chương {chapter.code}</strong></nav>}>
    <section className={`curriculum-chapter-page curriculum-tone-${chapterTones[chapter.code]}`}><div className="curriculum-chapter-hero"><div><p className="curriculum-chapter-kicker">CHƯƠNG {chapter.code}</p><h2>{chapter.shortTitle}</h2><p>{chapterDescriptions[chapter.code]}</p><div className="curriculum-chapter-hero-meta" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}><span>{chapter.lessons.length} bài học</span><span>·</span><span>Lớp {selectedClass.name}</span><span>·</span><span>3 pha trong mỗi bài</span></div></div><div className="curriculum-chapter-hero-art"><ChapterIllustration code={chapter.code}/></div></div>

      {/* Topic not found in DB — informational, not a crash */}
      {topicMissing && <p className="form-alert" role="status" style={{ fontSize: "13px" }}>Chưa có chủ đề &ldquo;{topicTitle}&rdquo; trong dữ liệu của bạn. Các bài học sẽ hiển thị khi chủ đề được thiết lập.</p>}

      {/* Real errors only — never block UI for secondary query failures */}
      {topicError && <p className="form-alert form-alert-error" role="alert">Không thể tải chủ đề. Lỗi: {topicError.message}</p>}
      {lessonsError && <p className="form-alert form-alert-error" role="alert">Không thể tải danh sách bài học. Lỗi: {lessonsError.message}</p>}
      {!lessonsError && materialsError && <p className="form-alert form-alert-warning" role="status" style={{ fontSize: "13px" }}>Chưa xác định trạng thái học liệu (lỗi phụ: {materialsError.message})</p>}

      <div className="curriculum-lessons-heading"><div><p className="curriculum-eyebrow">LỘ TRÌNH CHƯƠNG {chapter.code}</p><h2>Bài học trong chương</h2></div><span>{chapter.lessons.length} bài</span></div>
      <div className="chapter-section-list">
        {chapter.lessons.map((fixedLesson) => {
          // Match DB lesson by title (normalized). The DB lesson for "phóng xạ" maps to
          // the fixed curriculum lesson "Hiện tượng phóng xạ" (B23).
          const lesson = lessonsByTitle.get(fixedLesson.code);
          const counts = lesson ? (materialCounts.get(lesson.id) ?? {}) : {};
          const totalMaterials = Object.values(counts).reduce((s, n) => s + (n ?? 0), 0);
          return (
            <div key={fixedLesson.code} className="card curriculum-tone-default" style={{ display: "flex", flexDirection: "column", padding: "24px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", opacity: lesson ? 1 : 0.6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "16px" }}>
                <span className="chapter-number" style={{ fontSize: "28px", color: "var(--text-muted)" }}>{String(fixedLesson.number).padStart(2, "0")}</span>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--color-primary)", marginBottom: "4px", marginTop: 0 }}>{fixedLesson.title}</h2>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                    Trạng thái:{" "}
                    {!lesson
                      ? "Chưa thiết lập"
                      : materialsError
                      ? <em style={{ color: "var(--text-muted)" }}>Chưa xác định trạng thái học liệu</em>
                      : lesson.status === "published"
                      ? `Đã xuất bản · ${totalMaterials} học liệu`
                      : `Đang thiết lập · ${totalMaterials} học liệu`}
                  </p>
                </div>
                {lesson && <Link href={`/teacher/lessons/${lesson.id}`} className="btn">Tổng quan bài →</Link>}
                {/* No DB record yet — offer one-click setup */}
                {!lesson && (
                  <SetupLessonButton
                    classId={selectedClass.id}
                    topicTitle={topicTitle}
                    lessonTitle={fixedLesson.title}
                  />
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid var(--border-light)" }}>
                {[
                  { phase: "before_class", title: "Bài giảng và chuẩn bị", name: "Trước giờ học", num: "01" },
                  { phase: "in_class", title: "Mô phỏng và khám phá", name: "Trong giờ học", num: "02" },
                  { phase: "after_class", title: "Bài tập và kiểm tra cuối bài", name: "Sau giờ học", num: "03" }
                ].map((p, idx) => {
                  const content = (
                    <div style={{ display: "flex", alignItems: "center", padding: "12px 8px", borderBottom: idx < 2 ? "1px solid var(--border-light)" : "none", gap: "16px", transition: "background-color 0.15s" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", width: "24px" }}>{p.num}</span>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", fontWeight: 600 }}>{p.name}</span>
                        <span style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500 }}>{p.title}</span>
                      </div>
                      <span style={{ fontSize: "14px", color: "var(--color-primary)" }}>→</span>
                    </div>
                  );

                  // Phase rows are clickable whenever lesson exists — secondary query failure is irrelevant
                  return lesson ? (
                    <Link key={p.phase} href={`/teacher/lessons/${lesson.id}/${p.phase.replace("_", "-")}`} style={{ textDecoration: "none" }}>
                      {content}
                    </Link>
                  ) : (
                    <div key={p.phase} style={{ opacity: 0.5, pointerEvents: "none" }}>
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  </TeacherShell>;
}
