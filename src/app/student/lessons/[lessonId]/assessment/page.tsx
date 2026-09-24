import Link from "next/link";
import { StudentShell } from "../../../StudentShell";
import { LessonNavigation } from "@/components/learning/LessonNavigation";
import { getStudentLesson } from "@/lib/student-lesson";

export default async function StudentAssessmentPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { lesson, classItem } = await getStudentLesson(lessonId);
  const published = lesson.homework_status === "published" && (lesson.homework_title || lesson.homework_description || lesson.homework_instructions);
  return <StudentShell active="assignments" title={`${lesson.title} — Pha 3: Bài tập cuối bài`} description="Đọc yêu cầu bài tập cuối bài và thực hiện theo hướng dẫn của giáo viên.">
    <LessonNavigation role="student" lessonId={lessonId} className={classItem.name} lessonTitle={lesson.title} active="after_class" />
    {published ? <section className="card assignment-detail"><header className="section-header"><div><p className="page-kicker">Bài tập đã xuất bản</p><h2>{lesson.homework_title || "Bài tập cuối bài"}</h2>{lesson.homework_due_date ? <p className="muted">Hạn nộp: {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(lesson.homework_due_date))}</p> : null}</div></header>{lesson.homework_description ? <p>{lesson.homework_description}</p> : null}{lesson.homework_instructions ? <div className="assignment-instructions"><h3>Yêu cầu thực hiện</h3><p>{lesson.homework_instructions}</p></div> : null}<p className="muted">Chức năng nộp bài riêng chưa được xác minh đầy đủ trong dữ liệu hiện có, vì vậy trang không hiển thị nút nộp khi chưa có luồng lưu bài nộp đáng tin cậy.</p></section> : <section className="empty-state"><h2>Chưa có bài tập được xuất bản</h2><p>Giáo viên chưa mở bài tập cuối bài này.</p><Link className="btn" href={`/student/lessons/${lessonId}`}>Về tổng quan bài</Link></section>}
  </StudentShell>;
}
