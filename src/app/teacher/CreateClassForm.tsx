"use client";

import { useActionState } from "react";
import { createClassAction, type CreateClassState } from "./actions";

export function CreateClassForm() {
  const [state, formAction, isPending] = useActionState<CreateClassState, FormData>(
    createClassAction,
    {}
  );

  return (
    <form action={formAction} className="card">
      <label htmlFor="name">Tên lớp</label>
      <input id="name" name="name" type="text" required />

      <label htmlFor="description">Mô tả</label>
      <textarea id="description" name="description" rows={3} />

      {state.error && <p>{state.error}</p>}
      {state.message && <p>{state.message}</p>}

      <button className="btn primary" type="submit" disabled={isPending}>
        {isPending ? "Đang tạo..." : "Tạo lớp"}
      </button>
    </form>
  );
}