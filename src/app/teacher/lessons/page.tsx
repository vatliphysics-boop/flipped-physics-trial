import Link from "next/link";
import { TeacherShell } from "../TeacherShell";
import { getTeacherClasses, getTeacherContext } from "../data";
import { NUCLEAR_PHYSICS_CURRICULUM, CHAPTER_TOPIC_TITLES } from "@/lib/curriculum";

export default async function TeacherLessonsPage({ searchParams }: { searchParams: Promise<{ classId?: string }> }) {
  const { classId } = await searchParams;
  const [{ classes }, { supabase, user }] = await Promise.all([getTeacherClasses(), getTeacherContext()]);
  const selected = classes.find((item) => item.id === classId);

  // ACTUAL DB SCHEMA: lessons { id, topic_id, class_id, teacher_id, title, status, ... }
  // The Nuclear Physics chapter (IV) maps to topic title "Vật lí hạt nhân".
  // Resolve topic for chapter IV, then query lessons by topic_id + class_id.
  let byTitle = new Map<string, { id: string; status: string; title: string }>();
  if (selected) {
    const { data: topic } = await supabase
      .from("topics")
      .select("id")
      .eq("teacher_id", user.id)
      .eq("title", CHAPTER_TOPIC_TITLES["IV"])
      .maybeSingle();

    if (topic) {
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, title, status")
        .eq("topic_id", topic.id)
        .eq("class_id", selected.id)
        .eq("teacher_id", user.id);
      byTitle = new Map((lessons ?? []).map((lesson) => [lesson.title.trim().toLowerCase(), lesson]));
    }
  }

  return <TeacherShell active="lessons" title="Bài học hạt nhân" description="Chọn một lớp, sau đó mở một trong năm bài B21–B25 để quản lý từng giai đoạn.">
    <section className="class-selector card"><h2>Chọn lớp</h2><div className="selector-links">{classes.map((item) => <Link key={item.id} className={selected?.id === item.id ? "active" : ""} href={`/teacher/lessons?classId=${item.id}`}>{item.name}</Link>)}</div>{!classes.length ? <p>Chưa có lớp học. <Link href="/teacher/classes/new">Tạo lớp học</Link> trước để hệ thống khởi tạo năm bài hạt nhân.</p> : !selected ? <p>Hãy chọn một lớp để xem đúng năm bài của lớp đó.</p> : null}</section>
    {selected ? <section className="lesson-card-grid" aria-label={`Năm bài học của ${selected.name}`}>{NUCLEAR_PHYSICS_CURRICULUM.map((fixed) => { const lesson = byTitle.get(fixed.title.trim().toLowerCase()); return <article className="card lesson-card" key={fixed.code}><span className="badge">{fixed.code}</span><h2>Bài {fixed.number} — {fixed.title}</h2><p>{lesson?.status === "published" ? "Đã xuất bản cho học sinh." : "Bản nháp — học sinh chưa xem được."}</p><div className="phase-summary"><span>Trước giờ học</span><span>Trong giờ học</span><span>Sau giờ học</span></div>{lesson ? <Link className="btn primary" href={`/teacher/lessons/${lesson.id}`}>Mở bài học →</Link> : <p role="alert">Bài học chưa được tạo cho lớp này.</p>}</article>; })}</section> : null}
  </TeacherShell>;
}
