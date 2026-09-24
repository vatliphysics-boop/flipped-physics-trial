"use client";

import { useActionState } from "react";
import { joinClassAction, type JoinClassState } from "./actions";

export function JoinClassForm() {
  const [state, formAction, isPending] = useActionState<JoinClassState, FormData>(
    joinClassAction,
    {}
  );

  return (
    <form action={formAction} className="join-class-form" style={{ display: "flex", gap: "12px", alignItems: "flex-start", width: "100%" }}>
      <div className="join-class-field" style={{ flex: 1, marginBottom: 0 }}>
        <input
          id="join_code"
          name="join_code"
          placeholder="Nhập mã 6 ký tự..."
          type="text"
          autoCapitalize="characters"
          required
          style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-dark)", fontSize: "14px" }}
        />
        {state.error && <p className="form-alert form-alert-error" style={{ marginTop: "8px", fontSize: "13px", padding: "8px" }}>{state.error}</p>}
        {state.message && <p className="form-alert form-alert-success" style={{ marginTop: "8px", fontSize: "13px", padding: "8px", color: "var(--semantic-success)" }}>{state.message}</p>}
      </div>

      <button className="btn primary join-class-submit" type="submit" disabled={isPending} style={{ whiteSpace: "nowrap", height: "40px", padding: "0 16px" }}>
        {isPending ? "Đang tham gia..." : "Tham gia"}
      </button>
    </form>
  );
}