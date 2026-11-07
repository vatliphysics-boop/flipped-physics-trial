import Link from "next/link";
import { redirect } from "next/navigation";
import { TeacherShell } from "../TeacherShell";
import { getTeacherClasses } from "../data";
import { GRADE_12_CURRICULUM, getCurriculumChapter } from "@/lib/curriculum";
import { ChapterIllustration, chapterDescriptions, chapterTones } from "@/components/learning/LessonLearningCard";

export default async function TeacherCurriculumPage({ searchParams }: { searchParams: Promise<{ classId?: string; chuong?: string }> }) {
  const { classId, chuong } = await searchParams;
  const { classes, error } = await getTeacherClasses();
  const selectedClass = classes.find((item) => item.id === classId);
  const requestedChapter = getCurriculumChapter(chuong?.toUpperCase() || "");
  if (selectedClass && requestedChapter) redirect(`/teacher/curriculum/${requestedChapter.code}?classId=${encodeURIComponent(selectedClass.id)}`);
  if (!classId || !selectedClass) return <TeacherShell active="curriculum" title="Chương trình Vật lí 12" description="Chọn lớp để xem chương trình và học liệu theo đúng lộ trình."><section className="section curriculum-class-picker"><h2>Chọn lớp học</h2>{error ? <p className="form-alert form-alert-error" role="alert">Không thể tải danh sách lớp học. Vui lòng thử lại sau.</p> : classes.length === 0 ? <div className="empty-state"><p>Chưa có lớp học nào để thiết lập chương trình.</p><Link className="btn primary" href="/teacher/classes/new">Tạo lớp học</Link></div> : <div className="selector-links" aria-label="Danh sách lớp học">{classes.map((item) => <Link key={item.id} href={`/teacher/curriculum?classId=${encodeURIComponent(item.id)}${requestedChapter ? `&chuong=${requestedChapter.code}` : ""}`}>{item.name}</Link>)}</div>}</section></TeacherShell>;
  return <TeacherShell active="curriculum" title="Chương trình Vật lí 12" description={`Lớp ${selectedClass.name} · Danh mục bốn chương. Học liệu của đề tài tập trung Chương 4: Vật lí hạt nhân, B21–B25.`} breadcrumb={<nav className="breadcrumbs" aria-label="Đường dẫn"><Link href={`/teacher/classes/${selectedClass.id}`}>Về lớp {selectedClass.name}</Link><span>›</span><strong>Chương trình Vật lí 12</strong></nav>}>
    <section className="section curriculum-class-picker"><h2>Đang thiết lập cho lớp {selectedClass.name}</h2><div className="selector-links" aria-label="Đổi lớp học">{classes.map((item) => <Link key={item.id} className={item.id === selectedClass.id ? "active" : ""} href={`/teacher/curriculum?classId=${encodeURIComponent(item.id)}${requestedChapter ? `&chuong=${requestedChapter.code}` : ""}`}>{item.name}</Link>)}</div></section>
    <section className="chapter-section-list" aria-label="Bốn chương Vật lí 12">{GRADE_12_CURRICULUM.map((chapter) => <Link key={chapter.code} className={`card chapter-overview-row curriculum-tone-${chapterTones[chapter.code]}`} href={`/teacher/curriculum/${chapter.code}?classId=${encodeURIComponent(selectedClass.id)}`}><span className="chapter-number">{String(chapter.number).padStart(2, "0")}</span><div><span className="chapter-kicker">CHƯƠNG {chapter.code}</span><h2>{chapter.shortTitle}</h2><p>{chapterDescriptions[chapter.code]}</p><p>{chapter.lessons[0].code}–{chapter.lessons.at(-1)?.code} · {chapter.lessons.length} bài học</p></div><ChapterIllustration code={chapter.code}/><span className="arrow-link">Mở chương →</span></Link>)}</section>
  </TeacherShell>;
}
