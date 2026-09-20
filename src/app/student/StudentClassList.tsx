"use client";

import { useEffect, useState } from "react";
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
  onCountChange?: (count: number) => void;
};

function StudentClassCard({ classItem, onLeft }: { classItem: StudentClass; onLeft: () => void }) {
  const [left, setLeft] = useState(false);
  const [state, formAction, pending] = useActionState<JoinClassState, FormData>(leaveClassAction, {});

  useEffect(() => {
    if (state.message && !left) {
      setLeft(true);
      onLeft();
    }
  }, [left, onLeft, state.message]);

  if (left) return null;

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
          onSubmit={(event) => {
            if (!window.confirm("Bạn có chắc muốn rời lớp này? Bạn sẽ mất quyền truy cập vào học liệu và hoạt động của lớp.")) {
              event.preventDefault();
            }
          }}
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

export function StudentClassList({ classes, onCountChange }: Props) {
  const [visibleClasses, setVisibleClasses] = useState(classes);
  const [successMessage, setSuccessMessage] = useState("");

  if (!visibleClasses.length) {
    return (
      <>
        {successMessage && <p className="form-alert form-alert-success">{successMessage}</p>}
        <p>Bạn chưa tham gia lớp học nào.</p>
      </>
    );
  }

  return (
    <>
      {successMessage && <p className="form-alert form-alert-success student-leave-success">{successMessage}</p>}
      <div className="grid-3">
        {visibleClasses.map((classItem) => (
          <StudentClassCard
            key={classItem.id}
            classItem={classItem}
            onLeft={() => {
              setVisibleClasses((current) => current.filter((item) => item.id !== classItem.id));
              onCountChange?.(visibleClasses.length - 1);
              setSuccessMessage("Đã rời lớp học thành công.");
            }}
          />
        ))}
      </div>
    </>
  );
}