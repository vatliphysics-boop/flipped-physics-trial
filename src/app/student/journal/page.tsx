import Link from "next/link";
import { StudentShell } from "../StudentShell";
import { getStudentLearning } from "@/lib/student-learning";

export default async function StudentJournalPage() {
  const state = await getStudentLearning();
  const rows = state.lessons
    .filter((lesson) => lesson.reflection)
    .sort((a, b) => new Date(b.reflection!.updated_at).getTime() - new Date(a.reflection!.updated_at).getTime());

  return (
    <StudentShell active="journal" title="Nhật kí học tập" description="Nhìn lại điều em đã học, điều còn khó và bước điều chỉnh tiếp theo.">
      <section className="section" aria-labelledby="journal-heading">
        <div className="section-heading"><div><p className="eyebrow">MINH CHỨNG TỰ HỌC</p><h2 id="journal-heading">Các phản hồi đã lưu</h2></div></div>
        {rows.length === 0 ? (
          <div className="empty-state"><h2>Em chưa có nhật kí học tập.</h2><p>Hoàn thành phần phản hồi sau giờ học để lưu lại quá trình học của mình.</p><Link className="btn primary" href="/student/curriculum">Xem chương trình học →</Link></div>
        ) : (
          <div className="journal-list">
            {rows.map((lesson) => {
              const reflection = lesson.reflection!;
              return <article className="card journal-entry" key={lesson.id}>
                <div className="journal-entry-header"><div><span className="badge">{lesson.curriculum.code}</span><h2>{lesson.curriculum.title}</h2><p>{lesson.className}</p></div><time dateTime={reflection.updated_at}>Cập nhật {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(reflection.updated_at))}</time></div>
                <dl className="reflection-summary"><div><dt>Em đã học được gì?</dt><dd>{reflection.learned}</dd></div><div><dt>Điều gì còn khó?</dt><dd>{reflection.difficult || "Chưa ghi nhận."}</dd></div><div><dt>Bước tiếp theo</dt><dd>{reflection.next_step || "Chưa ghi nhận."}</dd></div><div><dt>Mức độ tự tin</dt><dd>{reflection.confidence}/5</dd></div></dl>
                <Link className="btn secondary" href={`/student/lessons/${lesson.id}`}>Mở lại bài học →</Link>
              </article>;
            })}
          </div>
        )}
      </section>
    </StudentShell>
  );
}
