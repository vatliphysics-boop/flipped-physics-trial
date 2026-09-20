"use client";

import { useState } from "react";
import { LessonForm } from "./LessonForm";

type TeacherClass = { id: string; name: string };

export function LessonCreationPanel({ classes }: { classes: TeacherClass[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn primary" type="button" onClick={() => setOpen((value) => !value)}>
        {open ? "Đóng tạo bài học" : "+ Tạo bài học"}
      </button>
      {open && (
        <section className="section dashboard-section lesson-creation-panel">
          <h2>Tạo bài học mới</h2>
          <p className="section-sub">Thiết kế bài học theo tiến trình học tập ba giai đoạn.</p>
          <LessonForm classes={classes} />
        </section>
      )}
    </>
  );
}