"use client";

import { useState } from "react";
import { StatCard } from "@/components/StatCard";
import { StudentClassList, type StudentClass } from "./StudentClassList";

export function StudentClasses({ classes }: { classes: StudentClass[] }) {
  const [count, setCount] = useState(classes.length);

  return (
    <>
      <div className="grid-4 student-stats">
        <StatCard label="Lớp học của tôi" value={String(count)} note="Đã tham gia" />
      </div>

      <section className="section student-section">
        <h2>Lớp học của tôi</h2>
        <StudentClassList classes={classes} onCountChange={setCount} />
      </section>
    </>
  );
}