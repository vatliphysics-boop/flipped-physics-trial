"use client";

import styles from "./student-ui.module.css";
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
    <article className={`list-row ${styles.classRow}`}>
      <div className={styles.classContent}>
        <h3>{classItem.name}</h3>
        <p>
          {classItem.description || "Chương trình Vật lí 12"}
        </p>
        <div className={styles.classMeta}>
          <span>Mã lớp: <strong>{classItem.join_code}</strong></span>
          <span>Đã tham gia: <time dateTime={classItem.joined_at}>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(classItem.joined_at))}</time></span>
        </div>
        {state.error && <p className="form-alert form-alert-error" style={{ marginTop: "12px", fontSize: "13px" }}>{state.error}</p>}
      </div>
      
      <form action={formAction} onSubmit={handleSubmit}>
        <input type="hidden" name="class_id" value={classItem.id} />
        <button className="btn" type="submit" disabled={pending}>
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