"use client";
import { useState } from "react";
import { PHASE_NAMES, PLAN_PHASES, type TeachingPlan } from "@/lib/teaching-plan";
import { LearningResourcePreview } from "./LearningResourcePreview";
import { CANONICAL_SYSTEM_MATERIALS } from "@/lib/material-bank";
export function PlanRoleComparison({ plan }: { plan: TeachingPlan }) {
  const [resource, setResource] = useState<string | null>(null);
  return <details className="plan-role-comparison"><summary>Kiểm tra việc của giáo viên và học sinh</summary>
    <p>Hai bên dùng cùng mục tiêu, nhiệm vụ, sản phẩm và tiêu chí của kế hoạch đang soạn. Đây là bản xem trước; giao và nộp bài thực hiện trong lớp học sau khi đăng nhập.</p>
    {PLAN_PHASES.map(phase => <section key={phase}><h3>{PHASE_NAMES[phase]}</h3>{plan.activities.filter(a => a.phase === phase).map(a => <article key={a.id}>
      <h4>{a.title} · {a.minutes} phút</h4><p><strong>Mục tiêu:</strong> {a.objective || "Chưa ghi mục tiêu."}</p>
      <div className="role-pair"><div><h4>Giáo viên</h4><p>{a.teacherActions || "Chưa ghi việc của giáo viên. Bổ sung trong hoạt động bên dưới."}</p></div><div><h4>Học sinh</h4><p>{a.studentActions || a.instructions || "Chưa ghi nhiệm vụ học sinh."}</p></div></div>
      <p><strong>Sản phẩm học sinh cần có:</strong> {a.product || "Chưa ghi sản phẩm."}</p><p><strong>Tiêu chí giáo viên dùng để nhận xét:</strong> {a.evaluation || "Chưa ghi tiêu chí."}</p><p><strong>Hỗ trợ:</strong> {a.support || "Chưa ghi."}</p>
      {a.resources.map(r => { const key = `${a.id}:${r.id}`; return <div key={r.id}><button className="btn small" aria-expanded={resource === key} onClick={() => setResource(v => v === key ? null : key)}>{resource === key ? "Đóng học liệu" : `Xem học liệu học sinh dùng: ${r.title}`}</button>{resource === key && <LearningResourcePreview material={CANONICAL_SYSTEM_MATERIALS.find(m => m.id === r.id) ?? { title: r.title, content_url: r.url, material_type: r.type }} />}</div>; })}
    </article>)}</section>)}
  </details>;
}
