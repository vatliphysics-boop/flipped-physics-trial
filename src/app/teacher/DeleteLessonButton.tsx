"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteLessonAction, type ManageClassState } from "./actions";

const DELETE_WARNING = "Bạn có chắc muốn xóa bài học này? Toàn bộ học liệu thuộc bài học này cũng sẽ bị xóa và không thể khôi phục.";

export function DeleteLessonButton({ lessonId, redirectOnSuccess = false }: { lessonId: string; redirectOnSuccess?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ManageClassState, FormData>(deleteLessonAction, {});

  useEffect(() => {
    if (!state.message) return;
    if (redirectOnSuccess) router.push("/teacher");
    else router.refresh();
  }, [redirectOnSuccess, router, state.message]);

  return (
    <>
      <button className="btn danger" type="button" onClick={() => setOpen(true)}>
        Xóa bài học
      </button>
      {open && (
        <div className="lesson-delete-backdrop" role="presentation" onClick={() => !pending && setOpen(false)}>
          <section className="lesson-delete-dialog" role="dialog" aria-modal="true" aria-labelledby={`delete-lesson-title-${lessonId}`} onClick={(event) => event.stopPropagation()}>
            <h2 id={`delete-lesson-title-${lessonId}`}>Xóa bài học?</h2>
            <p>{DELETE_WARNING}</p>
            {state.error && <p className="form-alert form-alert-error">{state.error}</p>}
            <form action={formAction}>
              <input type="hidden" name="lesson_id" value={lessonId} />
              <div className="lesson-delete-actions">
                <button className="btn" type="button" onClick={() => setOpen(false)} disabled={pending}>Hủy</button>
                <button className="btn danger" type="submit" disabled={pending}>{pending ? "Đang xóa..." : "Xóa bài học"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}