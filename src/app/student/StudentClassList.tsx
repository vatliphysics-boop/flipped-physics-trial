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

function StudentClassCard({ classItem }: { classItem: StudentClass }) {
  const [state, formAction, pending] = useActionState<JoinClassState, FormData>(leaveClassAction, {});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm("Bạn có chắc muốn rời lớp này? Bạn sẽ mất quyền truy cập vào học liệu và hoạt động của lớp.")) {
      event.preventDefault();
    }
  }

  return (
    <div className="card student-class-card">
      <h3>{classItem.name}</h3>
      <p className="student-class-description">
        {classItem.description || "Chưa có mô tả."}
      </p>
      <div className="student-class-meta">
        <span className="class-code">
          <span>Mã lớp</span>
          <strong>{classItem.join_code}</strong>
        </span>
        <span className="class-date">
          <span>Ngày tham gia</span>
          <strong>{new Date(classItem.joined_at).toLocaleDateString("vi-VN")}</strong>
        </span>
      </div>
      <div className="student-class-actions">
        {state.error && <p className="form-alert form-alert-error">{state.error}</p>}
        <form
          action={formAction}
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="class_id" value={classItem.id} />
          <button className="btn danger" type="submit" disabled={pending}>
            {pending ? "Đang rời lớp..." : "Rời lớp"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function StudentClassList({ classes }: Props) {
  if (!classes.length) {
    return <p className="empty-state">Bạn chưa tham gia lớp học nào.</p>;
  }

  return (
    <div className="grid-3 student-class-grid">
      {classes.map((classItem) => <StudentClassCard key={classItem.id} classItem={classItem} />)}
    </div>
  );
}