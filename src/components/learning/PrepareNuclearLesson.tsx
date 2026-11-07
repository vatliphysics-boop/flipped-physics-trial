"use client";

import { useActionState } from "react";
import { prepareNuclearLessonAction } from "@/app/teacher/pathway-actions";

export function PrepareNuclearLesson({ lessonId }: { lessonId: string }) {
  const [state, action, pending] = useActionState(prepareNuclearLessonAction, {});
  return <section className="card" style={{ marginTop: 16 }}>
    <h2>Mẫu nhiệm vụ ba pha</h2>
    <p>Mỗi pha có mục tiêu, nhiệm vụ, sản phẩm và tiêu chí riêng. Mẫu thêm các bước ở trạng thái bản nháp và bổ sung câu hỏi cho phần còn trống.</p>
    <form action={action}>
      <input type="hidden" name="lesson_id" value={lessonId} />
      <button type="submit" className="btn" disabled={pending}>{pending ? "Đang chuẩn bị…" : "Bổ sung mẫu còn thiếu"}</button>
    </form>
    {state.error && <p role="alert">{state.error}</p>}
    {state.message && <p role="status">{state.message}</p>}
  </section>;
}
