"use client";

import styles from "./student-ui.module.css";
import { useActionState } from "react";
import { joinClassAction, type JoinClassState } from "./actions";

export function JoinClassForm() {
  const [state, formAction, isPending] = useActionState<JoinClassState, FormData>(
    joinClassAction,
    {}
  );

  return (
    <form action={formAction} className={`join-class-form ${styles.joinForm}`}>
      <div className={styles.joinField}>
        <label htmlFor="join_code">Mã tham gia lớp</label>
        <input
          id="join_code"
          name="join_code"
          placeholder="Nhập mã 6 ký tự..."
          type="text"
          autoCapitalize="characters"
          autoComplete="off"
          minLength={6}
          maxLength={6}
          required
        />
        {state.error && <p role="alert" className="form-alert form-alert-error" style={{ marginTop: "8px", fontSize: "13px", padding: "8px" }}>{state.error}</p>}
        {state.message && <p role="status" className="form-alert form-alert-success" style={{ marginTop: "8px", fontSize: "13px", padding: "8px", color: "var(--semantic-success)" }}>{state.message}</p>}
      </div>

      <button className="btn primary join-class-submit" type="submit" disabled={isPending}>
        {isPending ? "Đang tham gia..." : "Tham gia"}
      </button>
    </form>
  );
}