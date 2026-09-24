"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClassAction, type CreateClassState } from "./actions";

export function CreateClassForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<CreateClassState, FormData>(createClassAction, {});
  useEffect(() => { if (state.classId) router.replace(`/teacher/classes/${state.classId}?created=1`); }, [router, state.classId]);
  return <form action={formAction} className="card teacher-create-class-form">
    <div className="form-field"><label htmlFor="name">Tên lớp <span aria-hidden="true">*</span></label><input id="name" name="name" type="text" required maxLength={120} placeholder="12A12" aria-describedby={state.error ? "create-class-error" : undefined} /></div>
    <div className="form-field"><label htmlFor="description">Mô tả <span className="form-optional">(tùy chọn)</span></label><textarea id="description" name="description" rows={4} maxLength={1000} placeholder="Ví dụ: Lớp Vật lí 12" /></div>
    <p className="teacher-create-class-note">Mã tham gia sẽ được tạo tự động sau khi tạo lớp.</p>
    {state.error && <p id="create-class-error" className="form-alert form-alert-error" role="alert">{state.error}</p>}
    <div className="teacher-create-class-actions"><button className="btn primary" type="submit" disabled={isPending}>{isPending ? "Đang tạo…" : "Tạo lớp học"}</button><Link className="btn" href="/teacher/classes">Hủy</Link></div>
  </form>;
}
