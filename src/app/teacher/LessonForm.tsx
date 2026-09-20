"use client";

import { useActionState } from "react";
import { createLessonAction, type CreateLessonState } from "./actions";

type TeacherClass = { id: string; name: string };

export function LessonForm({ classes }: { classes: TeacherClass[] }) {
  const [state, formAction, pending] = useActionState<CreateLessonState, FormData>(
    createLessonAction,
    {}
  );

  return (
    <form action={formAction} className="card lesson-create-form">
      <div className="lesson-form-grid">
        <div className="form-field">
          <label htmlFor="lesson-class">Lớp học</label>
          <select id="lesson-class" name="class_id" required defaultValue="">
            <option value="" disabled>Chọn lớp học</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>{classItem.name}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="lesson-title">Tên bài học</label>
          <input id="lesson-title" name="title" placeholder="Ví dụ: Phóng xạ và định luật phân rã" required />
        </div>
        <div className="form-field lesson-form-full">
          <label htmlFor="lesson-description">Mô tả ngắn</label>
          <textarea id="lesson-description" name="description" placeholder="Tóm tắt nội dung bài học" rows={3} />
        </div>
        <div className="form-field lesson-form-full">
          <label htmlFor="lesson-objectives">Mục tiêu học tập</label>
          <textarea id="lesson-objectives" name="learning_objectives" placeholder="Học sinh sẽ hiểu, giải thích hoặc vận dụng được gì sau bài học?" rows={5} required />
        </div>
        <fieldset className="form-field lesson-form-full lesson-status-field">
          <legend>Trạng thái</legend>
          <div className="lesson-status-options">
            <label><input type="radio" name="status" value="draft" defaultChecked /> Bản nháp</label>
            <label><input type="radio" name="status" value="published" /> Xuất bản</label>
          </div>
        </fieldset>
      </div>
      {state.error && <p className="form-alert form-alert-error">{state.error}</p>}
      {state.message && <p className="form-alert form-alert-success">{state.message}</p>}
      <button className="btn primary" type="submit" disabled={pending || !classes.length}>
        {pending ? "Đang tạo..." : "Tạo bài học"}
      </button>
    </form>
  );
}