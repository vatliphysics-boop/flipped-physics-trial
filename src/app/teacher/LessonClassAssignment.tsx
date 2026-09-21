"use client";

import { useActionState, useState } from "react";
import {
  assignLessonToClassAction,
  removeLessonFromClassAction,
  type LessonClassAssignmentState,
} from "./actions";

type TeacherClass = { id: string; name: string };

export function LessonClassAssignment({
  lessonId,
  classId,
  className,
  classes,
  fixed,
}: {
  lessonId: string;
  classId: string | null;
  className: string;
  classes: TeacherClass[];
  fixed?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [assignState, assignAction, assignPending] = useActionState<LessonClassAssignmentState, FormData>(assignLessonToClassAction, {});
  const [removeState, removeAction, removePending] = useActionState<LessonClassAssignmentState, FormData>(removeLessonFromClassAction, {});
  const state = assignState.error || assignState.message ? assignState : removeState;

  const openSelector = () => {
    if (!classes.length) return;
    setOpen(true);
  };

  return (
    <div className="lesson-class-assignment">
      <div className="lesson-class-assignment-row">
        <span className="lesson-class-name">Lớp: {className}</span>
        {!fixed && classes.length > 0 && (
          <button className="lesson-class-link" type="button" onClick={openSelector}>
            {classId ? "Đổi lớp" : "Gắn vào lớp"}
          </button>
        )}
      </div>
      {!fixed && open && (
        <form action={assignAction} className="lesson-class-assignment-form" onSubmit={(event) => {
          if (classId && !window.confirm("Bạn có chắc muốn chuyển bài học này sang lớp đã chọn?\nHọc sinh ở lớp cũ sẽ không còn truy cập bài học sau khi chuyển.")) {
            event.preventDefault();
          }
        }}>
          <input type="hidden" name="lesson_id" value={lessonId} />
          <label htmlFor={`class-assignment-${lessonId}`}>Chọn lớp học</label>
          <select id={`class-assignment-${lessonId}`} name="class_id" defaultValue={classId ?? ""} required>
            <option value="" disabled>Chọn lớp học</option>
            {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          {classId && <p className="lesson-class-confirm">Khi đổi lớp, học sinh ở lớp cũ sẽ không còn truy cập bài học.</p>}
          <div className="lesson-class-assignment-actions">
            <button className="btn primary" type="submit" disabled={assignPending}>{assignPending ? "Đang lưu..." : "Gắn lớp"}</button>
            <button className="btn" type="button" onClick={() => setOpen(false)}>Hủy</button>
          </div>
        </form>
      )}
      {!fixed && classId && !open && (
        <form action={removeAction} className="lesson-class-remove-form" onSubmit={(event) => { if (!window.confirm("Bạn có chắc muốn bỏ gắn lớp cho bài học này không?")) event.preventDefault(); }}>
          <input type="hidden" name="lesson_id" value={lessonId} />
          <button className="lesson-class-link lesson-class-remove" type="submit" disabled={removePending}>{removePending ? "Đang xử lý..." : "Bỏ gắn lớp"}</button>
        </form>
      )}
      {state?.error && <p className="form-alert form-alert-error">{state.error}</p>}
      {state?.message && <p className="form-alert form-alert-success">{state.message}</p>}
    </div>
  );
}