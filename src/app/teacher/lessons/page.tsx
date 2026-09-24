import Link from "next/link";
import { TeacherShell } from "../TeacherShell";
import { getTeacherClasses, getTeacherContext } from "../data";
import { NUCLEAR_PHYSICS_CURRICULUM } from "@/lib/curriculum";

export default async function TeacherLessonsPage({ searchParams }: { searchParams: Promise<{ classId?: string }> }) {
  const { classId } = await searchParams;
  const [{ classes }, { supabase, user }] = await Promise.all([getTeacherClasses(), getTeacherContext()]);
  const selected = classes.find((item) => item.id === classId);
  const { data: lessons } = selected ? await supabase.from("lessons").select("id, curriculum_code, status, title").eq("class_id", selected.id).eq("teacher_id", user.id).not("curriculum_code", "is", null).order("curriculum_order") : { data: [] };
  const byCode = new Map((lessons ?? []).map((lesson) => [lesson.curriculum_code, lesson]));
  return <TeacherShell active="lessons" title="Bài học hạt nhân" description="Chọn một lớp, sau đó mở một trong năm bài B21–B25 để quản lý từng giai đoạn.">
    <section className="class-selector card"><h2>Chọn lớp</h2><div className="selector-links">{classes.map((item) => <Link key={item.id} className={selected?.id === item.id ? "active" : ""} href={`/teacher/lessons?classId=${item.id}`}>{item.name}</Link>)}</div>{!classes.length ? <p>Chưa có lớp học. <Link href="/teacher/classes/new">Tạo lớp học</Link> trước để hệ thống khởi tạo năm bài hạt nhân.</p> : !selected ? <p>Hãy chọn một lớp để xem đúng năm bài của lớp đó.</p> : null}</section>
    {selected ? <section className="lesson-card-grid" aria-label={`Năm bài học của ${selected.name}`}>{NUCLEAR_PHYSICS_CURRICULUM.map((fixed) => { const lesson = byCode.get(fixed.code); return <article className="card lesson-card" key={fixed.code}><span className="badge">{fixed.code}</span><h2>Bài {fixed.number} — {fixed.title}</h2><p>{lesson?.status === "published" ? "Đã xuất bản cho học sinh." : "Bản nháp — học sinh chưa xem được."}</p><div className="phase-summary"><span>Trước giờ học</span><span>Trong giờ học</span><span>Sau giờ học</span></div>{lesson ? <Link className="btn primary" href={`/teacher/lessons/${lesson.id}`}>Mở bài học →</Link> : <p role="alert">Thiếu bản ghi bài học. Hãy kiểm tra migration backfill.</p>}</article>; })}</section> : null}
  </TeacherShell>;
}
