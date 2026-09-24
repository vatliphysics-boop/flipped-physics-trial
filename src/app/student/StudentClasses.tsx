"use client";

import { StatCard } from "@/components/StatCard";
import { StudentClassList, type StudentClass } from "./StudentClassList";

export function StudentClasses({ classes }: { classes: StudentClass[] }) {
  return (
    <>
      <div className="grid-4 student-stats">
        <StatCard label="Lớp học của tôi" value={String(classes.length)} note="Đã tham gia" />
      </div>

      <section className="section student-section">
        <h2>Lớp học của tôi</h2>
        <StudentClassList classes={classes} />
      </section>
    </>
  );
}