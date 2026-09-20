"use client";

import { useActionState } from "react";
import { createClassAction, type CreateClassState } from "./actions";

export function CreateClassForm() {
  const [state, formAction, isPending] = useActionState<CreateClassState, FormData>(
    createClassAction,
    {}
  );

  return (
    <form action={formAction} className="card create-class-form">
      <div className="form-field">
        <label htmlFor="name">Tên lớp</label>
        <input id="name" name="name" type="text" required />
      </div>

      <div className="form-field">
        <label htmlFor="description">Mô tả</label>
        <textarea id="description" name="description" rows={3} />
      </div>

      {state.error && <p className="form-alert form-alert-error">{state.error}</p>}
      {state.message && <p className="form-alert form-alert-success">{state.message}</p>}

      <button className="btn primary" type="submit" disabled={isPending}>
        {isPending ? "Đang tạo..." : "Tạo lớp"}
      </button>
    </form>
  );
}