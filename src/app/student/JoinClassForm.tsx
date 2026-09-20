"use client";

import { useActionState } from "react";
import { joinClassAction, type JoinClassState } from "./actions";

export function JoinClassForm() {
  const [state, formAction, isPending] = useActionState<JoinClassState, FormData>(
    joinClassAction,
    {}
  );

  return (
    <form action={formAction} className="card join-class-form">
      <div className="join-class-field">
        <label htmlFor="join_code">Mã lớp</label>
        <input
          id="join_code"
          name="join_code"
          placeholder="Nhập mã lớp"
          type="text"
          autoCapitalize="characters"
          required
        />
      </div>

      <button className="btn primary join-class-submit" type="submit" disabled={isPending}>
        {isPending ? "Đang tham gia..." : "Tham gia lớp"}
      </button>

      {state.error && <p className="form-alert form-alert-error">{state.error}</p>}
      {state.message && <p className="form-alert form-alert-success">{state.message}</p>}
    </form>
  );
}