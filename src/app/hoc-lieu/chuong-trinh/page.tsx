import Link from "next/link";
import { PortalShell } from "@/components/PortalShell";
import { GRADE_12_CURRICULUM, getCurriculumChapter } from "@/lib/curriculum";

export default async function PublicCurriculumPage({searchParams}:{searchParams:Promise<{chuong?:string}>}) {
  const {chuong} = await searchParams;
  const selected = getCurriculumChapter(chuong?.toUpperCase() || "IV");
  return <PortalShell role="student" active="curriculum" publicLibrary account={<Link className="btn small" href="/login">Đăng nhập lớp học</Link>}>
    <header className="page-header"><div><p className="page-kicker">Chương trình Vật lí 12</p><h1>{selected ? `Chương ${selected.number}: ${selected.shortTitle}` : "Chương trình Vật lí 12"}</h1><p className="page-description">Học liệu của đề tài tập trung Chương 4: Vật lí hạt nhân, B21–B25.</p></div></header>
    <nav className="selector-links" aria-label="Chọn chương">{GRADE_12_CURRICULUM.map(chapter => <Link key={chapter.code} aria-current={selected?.code === chapter.code ? "page" : undefined} href={`/hoc-lieu/chuong-trinh?chuong=${chapter.code}`}>Chương {chapter.number}: {chapter.shortTitle}</Link>)}</nav>
    {selected && <section className="chapter-section-list" aria-label="Bài học trong chương">{selected.lessons.map(lesson => <article key={lesson.code} className="card"><h2>{lesson.code} · {lesson.title}</h2>{selected.code === "IV" ? <Link className="btn" href={`/hoc-lieu/truc-quan?bai=${lesson.code}`}>Mở học liệu bài học</Link> : <p>Danh mục bài học. Học liệu của chương này chưa được xây dựng trong phạm vi đề tài.</p>}</article>)}</section>}
  </PortalShell>;
}
