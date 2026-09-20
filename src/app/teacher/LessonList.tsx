import Link from "next/link";
import { DeleteLessonButton } from "./DeleteLessonButton";
import { LessonClassAssignment } from "./LessonClassAssignment";

type Lesson = {
  id: string;
  title: string;
  description: string;
  learning_objectives: string;
  status: "draft" | "published";
  created_at: string;
  className: string;
  class_id: string | null;
};

type TeacherClass = { id: string; name: string };

export function LessonList({ lessons, classes }: { lessons: Lesson[]; classes: TeacherClass[] }) {
  if (!lessons.length) return <p>Bạn chưa tạo bài học nào.</p>;

  return (
    <div className="grid-3 lesson-list">
      {lessons.map((lesson) => (
        <article className="card lesson-card" key={lesson.id}>
          <div className="lesson-card-heading">
            <span className={`lesson-status lesson-status-${lesson.status}`}>
              {lesson.status === "published" ? "Đã xuất bản" : "Bản nháp"}
            </span>
            <span className="lesson-date">{new Date(lesson.created_at).toLocaleDateString("vi-VN")}</span>
          </div>
          <h3>{lesson.title}</h3>
          <LessonClassAssignment lessonId={lesson.id} classId={lesson.class_id} className={lesson.className} classes={classes} />
          <p className="lesson-description">{lesson.description || "Chưa có mô tả."}</p>
          <div className="lesson-objectives-summary">
            <strong>Mục tiêu học tập</strong>
            <p>{lesson.learning_objectives}</p>
          </div>
          <Link className="btn lesson-manage-button" href={`/teacher/lessons/${lesson.id}`}>
            Quản lý học liệu
          </Link>
          <div className="lesson-destructive-action">
            <DeleteLessonButton lessonId={lesson.id} />
          </div>
        </article>
      ))}
    </div>
  );
}