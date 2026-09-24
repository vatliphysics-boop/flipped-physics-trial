"use client";

import { useActionState } from "react";
import { leaveClassAction, type JoinClassState } from "./actions";

export type StudentClass = {
  id: string;
  name: string;
  description: string;
  join_code: string;
  joined_at: string;
};

type Props = {
  classes: StudentClass[];
};

function StudentClassRow({ classItem }: { classItem: StudentClass }) {
  const [state, formAction, pending] = useActionState<JoinClassState, FormData>(leaveClassAction, {});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm("Bạn có chắc muốn rời lớp này? Bạn sẽ mất quyền truy cập vào học liệu và hoạt động của lớp.")) {
      event.preventDefault();
    }
  }

  return (
    <article className="list-row" style={{ padding: "24px 0", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div className="list-row-content">
        <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: "var(--text-primary)", fontWeight: 600 }}>{classItem.name}</h3>
        <p style={{ margin: "0 0 12px", color: "var(--text-secondary)", fontSize: "15px" }}>
          {classItem.description || "Chương trình Vật lí 12"}
        </p>
        <div style={{ display: "flex", gap: "24px", fontSize: "13px", color: "var(--text-muted)", alignItems: "center" }}>
          <span>Giáo viên: <strong>—</strong></span>
          <span>Mã lớp: <strong>{classItem.join_code}</strong></span>
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            Tiến độ: <strong>0%</strong>
            <div style={{ width: "60px", height: "4px", backgroundColor: "var(--border-light)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ width: "0%", height: "100%", backgroundColor: "var(--color-accent)" }} />
            </div>
          </span>
        </div>
        {state.error && <p className="form-alert form-alert-error" style={{ marginTop: "12px", fontSize: "13px" }}>{state.error}</p>}
      </div>
      
      <form action={formAction} onSubmit={handleSubmit} style={{ marginLeft: "24px", flexShrink: 0 }}>
        <input type="hidden" name="class_id" value={classItem.id} />
        <button className="btn" type="submit" disabled={pending} style={{ fontSize: "13px", padding: "6px 12px", color: "var(--text-muted)", backgroundColor: "transparent", border: "1px solid var(--border-dark)" }}>
          {pending ? "Đang rời..." : "Rời lớp"}
        </button>
      </form>
    </article>
  );
}

export function StudentClassList({ classes }: Props) {
  if (!classes.length) {
    return (
      <div className="student-empty" style={{ borderTop: "1px dashed var(--border-dark)", marginTop: "16px" }}>
        <h2>Chưa tham gia lớp học</h2>
        <p>Em chưa tham gia lớp học nào. Hãy dùng form bên trên để tham gia.</p>
      </div>
    );
  }

  return (
    <div className="academic-list" style={{ borderTop: "1px solid var(--border-light)" }}>
      {classes.map((classItem) => <StudentClassRow key={classItem.id} classItem={classItem} />)}
    </div>
  );
}