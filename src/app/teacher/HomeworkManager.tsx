"use client";

import { useActionState } from "react";
import { updateHomeworkAction, type LessonMaterialState } from "./actions";

export function HomeworkManager({ lessonId, initial }: { lessonId: string; initial: { title: string; description: string; instructions: string; dueDate: string | null; status: "draft" | "published" } }) {
  const [state, formAction, pending] = useActionState<LessonMaterialState, FormData>(updateHomeworkAction, {});
  return <form action={formAction} className="card homework-manager">
    <input type="hidden" name="lesson_id" value={lessonId} />
    <div><span className="teacher-panel-kicker">SAU GIỜ HỌC</span><h2>Bài tập / nhiệm vụ</h2><p className="section-sub">Cấu hình riêng cho {"lớp học này"}; không thay đổi chương trình cố định.</p></div>
    <div className="lesson-form-grid"><div className="form-field"><label htmlFor={`homework-title-${lessonId}`}>Tiêu đề</label><input id={`homework-title-${lessonId}`} name="homework_title" defaultValue={initial.title} placeholder="Ví dụ: Phiếu bài tập B21" /></div><div className="form-field"><label htmlFor={`homework-due-${lessonId}`}>Hạn nộp (tùy chọn)</label><input id={`homework-due-${lessonId}`} name="homework_due_date" type="date" defaultValue={initial.dueDate ?? ""} /></div><div className="form-field lesson-form-full"><label htmlFor={`homework-description-${lessonId}`}>Nội dung nhiệm vụ</label><textarea id={`homework-description-${lessonId}`} name="homework_description" rows={3} defaultValue={initial.description} /></div><div className="form-field lesson-form-full"><label htmlFor={`homework-instructions-${lessonId}`}>Hướng dẫn</label><textarea id={`homework-instructions-${lessonId}`} name="homework_instructions" rows={3} defaultValue={initial.instructions} /></div></div>
    <fieldset className="form-field lesson-status-field"><legend>Trạng thái</legend><div className="lesson-status-options"><label><input type="radio" name="homework_status" value="draft" defaultChecked={initial.status === "draft"} /> Bản nháp</label><label><input type="radio" name="homework_status" value="published" defaultChecked={initial.status === "published"} /> Xuất bản</label></div></fieldset>
    {state.error && <p className="form-alert form-alert-error">{state.error}</p>}{state.message && <p className="form-alert form-alert-success">{state.message}</p>}<button className="btn primary" type="submit" disabled={pending}>{pending ? "Đang lưu..." : "Lưu bài tập"}</button>
  </form>;
}