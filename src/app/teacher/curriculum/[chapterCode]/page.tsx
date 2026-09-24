import Link from "next/link";
import { notFound } from "next/navigation";
import { TeacherShell } from "../../TeacherShell";
import { getTeacherClasses, getTeacherContext } from "../../data";
import { getCurriculumChapter } from "@/lib/curriculum";
import { ChapterIllustration, chapterDescriptions, chapterTones } from "@/components/learning/LessonLearningCard";
import { LEARNING_PHASES, type LearningPhase } from "@/lib/learning-phases";

export default async function TeacherChapterPage({ params, searchParams }: { params: Promise<{ chapterCode: string }>; searchParams: Promise<{ classId?: string }> }) {
  const { chapterCode } = await params;
  const { classId } = await searchParams;
  const chapter = getCurriculumChapter(chapterCode.toUpperCase());
  const { classes } = await getTeacherClasses();
  const selectedClass = classes.find((item) => item.id === classId);
  if (!chapter || !classId || !selectedClass) notFound();
  const { supabase, user } = await getTeacherContext();
  const { data: lessons, error: lessonsError } = await supabase.from("lessons").select("id, curriculum_code, status, homework_status").eq("class_id", selectedClass.id).eq("teacher_id", user.id).not("curriculum_code", "is", null);
  const lessonIds = (lessons ?? []).map((lesson) => lesson.id);
  const { data: materials, error: materialsError } = lessonIds.length ? await supabase.from("lesson_materials").select("lesson_id, phase").in("lesson_id", lessonIds) : { data: [], error: null };
  const lessonsByCode = new Map((lessons ?? []).map((lesson) => [lesson.curriculum_code, lesson]));
  const materialCounts = new Map<string, Partial<Record<LearningPhase, number>>>();
  for (const material of materials ?? []) { const phase = material.phase as LearningPhase; if (LEARNING_PHASES.includes(phase)) { const counts = materialCounts.get(material.lesson_id) ?? {}; counts[phase] = (counts[phase] ?? 0) + 1; materialCounts.set(material.lesson_id, counts); } }
  return <TeacherShell active="curriculum" title={chapter.title} description="Mở từng bài học để quản lý đầy đủ ba pha hoạt động." breadcrumb={<nav className="breadcrumbs" aria-label="Đường dẫn"><Link href={`/teacher/classes/${selectedClass.id}`}>Về lớp {selectedClass.name}</Link><span>›</span><Link href={`/teacher/curriculum?classId=${selectedClass.id}`}>Chương trình</Link><span>›</span><strong>Chương {chapter.code}</strong></nav>}>
    <section className={`curriculum-chapter-page curriculum-tone-${chapterTones[chapter.code]}`}><div className="curriculum-chapter-hero"><div><p className="curriculum-chapter-kicker">CHƯƠNG {chapter.code}</p><h2>{chapter.shortTitle}</h2><p>{chapterDescriptions[chapter.code]}</p><div className="curriculum-chapter-hero-meta"><span>{chapter.lessons.length} bài học</span><span>Lớp {selectedClass.name}</span><span>3 pha trong mỗi bài</span></div></div><div className="curriculum-chapter-hero-art"><ChapterIllustration code={chapter.code}/></div></div>
      {(lessonsError || materialsError) && <p className="form-alert form-alert-error" role="alert">Không thể tải đầy đủ trạng thái học liệu. Các bài vẫn hiển thị theo danh mục, nhưng số học liệu có thể chưa xác định.</p>}
      <div className="curriculum-lessons-heading"><div><p className="curriculum-eyebrow">LỘ TRÌNH CHƯƠNG {chapter.code}</p><h2>Bài học trong chương</h2></div><span>{chapter.lessons.length} bài</span></div>
      <div className="chapter-section-list">
        {chapter.lessons.map((fixedLesson) => {
          const lesson = lessonsByCode.get(fixedLesson.code);
          return lesson ? (
            <Link key={fixedLesson.code} href={`/teacher/lessons/${lesson.id}`} className="card chapter-overview-row curriculum-tone-default">
              <span className="chapter-number">{String(fixedLesson.number).padStart(2, "0")}</span>
              <div>
                <h2>{fixedLesson.title}</h2>
                <p>Trạng thái: {lesson.status === "published" ? "Đã xuất bản" : "Bản nháp"}</p>
              </div>
              <span className="arrow-link">Mở bài học →</span>
            </Link>
          ) : (
            <div key={fixedLesson.code} className="card chapter-overview-row is-disabled" style={{ opacity: 0.6 }}>
              <span className="chapter-number">{String(fixedLesson.number).padStart(2, "0")}</span>
              <div>
                <h2>{fixedLesson.title}</h2>
                <p>Trạng thái: Đang thiết lập</p>
              </div>
              <span className="arrow-link" style={{ visibility: "hidden" }}>Mở bài học →</span>
            </div>
          );
        })}
      </div>
    </section>
  </TeacherShell>;
}
