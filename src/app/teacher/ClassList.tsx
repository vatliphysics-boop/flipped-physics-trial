"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CopyJoinCodeButton } from "./CopyJoinCodeButton";

type ClassItem = { id: string; name: string; description: string | null; join_code: string };

export function ClassList({ classes, counts, memberError }: { classes: ClassItem[]; counts: Record<string, number>; memberError: boolean }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("vi");
    return normalized ? classes.filter((item) => item.name.toLocaleLowerCase("vi").includes(normalized)) : classes;
  }, [classes, query]);

  if (!classes.length) return <div className="teacher-classes-state"><span className="teacher-classes-state-icon" aria-hidden="true">▦</span><strong>Bạn chưa có lớp học</strong><span>Tạo lớp học đầu tiên để bắt đầu tổ chức bài học.</span><Link className="btn primary" href="/teacher/classes/new">Tạo lớp học đầu tiên</Link></div>;

  return <div className="teacher-class-list-wrap">
    <div className="teacher-class-search"><label htmlFor="class-search">Tìm theo tên lớp</label><div><input id="class-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm lớp học" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Xóa tìm kiếm">×</button>}</div></div>
    {filtered.length ? <div className="teacher-class-list">{filtered.map((item) => <article className="teacher-class-row" key={item.id} style={{ display: "flex", alignItems: "center", padding: "16px 24px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", marginBottom: "12px", gap: "24px" }}><div style={{ flex: 1 }}><h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-primary)", marginBottom: "4px" }}>{item.name}</h3><p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{item.description || "Vật lí 12"} · {memberError ? "—" : counts[item.id] ?? 0} học sinh</p></div><div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "var(--radius-sm)" }}><span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Mã tham gia:</span><strong style={{ fontSize: "14px", letterSpacing: "0.05em", fontFamily: "monospace" }}>{item.join_code}</strong><CopyJoinCodeButton code={item.join_code} /></div><Link className="btn primary" href={`/teacher/classes/${item.id}`}>Mở lớp →</Link></article>)}</div> : <div className="teacher-classes-state"><strong>Không tìm thấy lớp phù hợp</strong><span>Thử tìm bằng tên lớp khác.</span><button className="btn" type="button" onClick={() => setQuery("")}>Xóa tìm kiếm</button></div>}
  </div>;
}
