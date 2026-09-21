import Link from "next/link";

export type StudentLesson = {
  id: string;
  title: string;
  description: string;
  learning_objectives: string;
  created_at: string;
  className: string;
  curriculum_code?: string | null;
  curriculum_order?: number | null;
};

export function StudentLessonList({ lessons }: { lessons: StudentLesson[] }) {
  if (!lessons.length) {
    return <p>Chưa có bài học nào được giáo viên xuất bản.</p>;
  }

  return (
    <div className="grid-3 lesson-list">
      {lessons.map((lesson) => (
        <article className="card lesson-card" key={lesson.id}>
          <div className="lesson-card-heading">
            <span className="lesson-status lesson-status-published">Đã xuất bản</span><span className="curriculum-code">{lesson.curriculum_code ?? "HỌC LIỆU"}</span>
            <span className="lesson-date">
              {new Date(lesson.created_at).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <h3>{lesson.title}</h3>
          <p className="lesson-class-name">Lớp: {lesson.className}</p>
          <p className="lesson-description">
            {lesson.description || "Chưa có mô tả."}
          </p>
          <div className="lesson-objectives-summary">
            <strong>Mục tiêu học tập</strong>
            <p>{lesson.learning_objectives || "Chưa có mục tiêu học tập."}</p>
          </div>
          <Link className="btn lesson-manage-button" href={`/student/lessons/${lesson.id}`}>
            Vào bài học
          </Link>
        </article>
      ))}
    </div>
  );
}