export const PLAN_PHASES = ["before_class", "in_class", "after_class"] as const;
export type PlanPhase = (typeof PLAN_PHASES)[number];
export const PHASE_NAMES: Record<PlanPhase, string> = {
  before_class: "Trước giờ học",
  in_class: "Trong giờ học",
  after_class: "Sau giờ học",
};
export const PLAN_MATERIAL_TYPES = [
  "image",
  "animation",
  "real_video",
  "lecture_video",
  "simulation",
  "document",
  "colab",
  "assessment",
] as const;
export type PlanResource = {
  id: string;
  title: string;
  url: string;
  type: (typeof PLAN_MATERIAL_TYPES)[number];
};
export const LESSON_ACTIVITY_TYPES = {opening:"Mở đầu",knowledge:"Hình thành kiến thức",practice:"Luyện tập",application:"Vận dụng"} as const;
export type PlanActivity = {
  id: string;
  phase: PlanPhase;
  title: string;
  minutes: number;
  objective: string;
  instructions: string;
  teacherActions?: string;
  studentActions?: string;
  product: string;
  evaluation: string;
  support: string;
  resources: PlanResource[];
  activityType?: keyof typeof LESSON_ACTIVITY_TYPES;
  assignment?: string;
  implementation?: string;
  discussion?: string;
  conclusion?: string;
};
export type TeachingPlan = {
  version: 1;
  id: string;
  title: string;
  lessonCode: string;
  classContext: string;
  goals: string;
  preparation: string;
  reflection: string;
  activities: PlanActivity[];
  updatedAt: string;
  flippedForm?: "standard" | "demonstration" | "discussion" | "group";
  knowledgeGoals?: string;
  competenceGoals?: string;
  qualityGoals?: string;
  curriculumTargets?: string[];
};
export const PLAN_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function studentPlanInstruction(activity: PlanActivity) {
  return [
    `Mục tiêu: ${activity.objective}`,
    `Nhiệm vụ (${activity.minutes} phút): ${activity.studentActions?.trim() || activity.instructions}`,
    `Sản phẩm: ${activity.product}`,
    `Tiêu chí: ${activity.evaluation}`,
    `Hỗ trợ: ${activity.support}`,
  ].join("\n").slice(0, 8000);
}
function planUrl(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    value.length > 2000 ||
    /[\s\u0000-\u001f<>"\\]/.test(value)
  )
    return false;
  if (value.startsWith("activity:")) return /^[a-z_]+$/.test(value.slice(9));
  if (value.startsWith("/"))
    return (
      !value.startsWith("//") &&
      !value.includes("..") &&
      !/%(?:2e|2f|5c)/i.test(value)
    );
  try {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
export function validateTeachingPlan(value: unknown): {
  plan?: TeachingPlan;
  error?: string;
} {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { error: "Tệp kế hoạch không đúng cấu trúc." };
  const p = value as Record<string, unknown>;
  const text = (v: unknown, max: number) =>
    typeof v === "string" && v.length <= max;
  if (
    p.version !== 1 ||
    !text(p.id, 100) ||
    !text(p.title, 200) ||
    !(p.title as string).trim() ||
    !["B21", "B22", "B23", "B24", "B25", "general"].includes(
      String(p.lessonCode),
    ) ||
    !text(p.classContext, 1000) ||
    !text(p.goals, 6000) ||
    !text(p.preparation, 6000) ||
    !text(p.reflection, 6000) ||
    !text(p.updatedAt, 50) ||
    [p.knowledgeGoals,p.competenceGoals,p.qualityGoals].some(v=>v!==undefined&&!text(v,6000)) ||
    (p.curriculumTargets!==undefined&&(!Array.isArray(p.curriculumTargets)||p.curriculumTargets.length>30||!p.curriculumTargets.every(v=>text(v,100)))) ||
    (p.flippedForm !== undefined && !["standard", "demonstration", "discussion", "group"].includes(String(p.flippedForm))) ||
    !Array.isArray(p.activities) ||
    p.activities.length > 60 ||
    JSON.stringify(value).length > 200000
  )
    return {
      error: "Kế hoạch thiếu tiêu đề, sai phạm vi hoặc vượt giới hạn nội dung.",
    };
  const ids = new Set<string>();
  const activities: PlanActivity[] = [];
  for (const raw of p.activities) {
    if (!raw || typeof raw !== "object")
      return { error: "Hoạt động không hợp lệ." };
    const a = raw as Record<string, unknown>;
    if (
      !text(a.id, 100) ||
      ids.has(String(a.id)) ||
      !PLAN_PHASES.includes(a.phase as PlanPhase) ||
      !text(a.title, 200) ||
      !(a.title as string).trim() ||
      !Number.isInteger(a.minutes) ||
      Number(a.minutes) < 0 ||
      Number(a.minutes) > 240 ||
      ![a.objective, a.instructions, a.product, a.evaluation, a.support].every(
        (v) => text(v, 4000),
      ) ||
      !Array.isArray(a.resources) ||
      (a.teacherActions !== undefined && !text(a.teacherActions, 4000)) ||
      (a.studentActions !== undefined && !text(a.studentActions, 4000)) ||
      (a.activityType !== undefined && !Object.hasOwn(LESSON_ACTIVITY_TYPES,String(a.activityType))) ||
      [a.assignment,a.implementation,a.discussion,a.conclusion].some(v=>v!==undefined&&!text(v,4000)) ||
      a.resources.length > 12
    )
      return {
        error:
          "Hoạt động thiếu tên, sai thời lượng hoặc vượt giới hạn; mỗi hoạt động tối đa 12 học liệu.",
      };
    ids.add(String(a.id));
    const resources: PlanResource[] = [];
    for (const rawResource of a.resources) {
      if (!rawResource || typeof rawResource !== "object")
        return { error: "Học liệu không hợp lệ." };
      const r = rawResource as Record<string, unknown>;
      if (
        !text(r.id, 120) ||
        !text(r.title, 300) ||
        !(r.title as string).trim() ||
        !planUrl(r.url) ||
        !PLAN_MATERIAL_TYPES.includes(r.type as PlanResource["type"])
      )
        return {
          error:
            "Học liệu có tên, loại hoặc liên kết không hợp lệ. Chỉ dùng liên kết http/https, tệp nội bộ hoặc mô phỏng chuẩn.",
        };
      resources.push({
        id: String(r.id),
        title: String(r.title),
        url: r.url,
        type: r.type as PlanResource["type"],
      });
    }
    activities.push({
      id: String(a.id),
      phase: a.phase as PlanPhase,
      title: String(a.title),
      minutes: Number(a.minutes),
      objective: String(a.objective),
      instructions: String(a.instructions),
      ...(a.teacherActions !== undefined ? { teacherActions: String(a.teacherActions) } : {}),
      ...(a.studentActions !== undefined ? { studentActions: String(a.studentActions) } : {}),
      product: String(a.product),
      evaluation: String(a.evaluation),
      support: String(a.support),
      resources,
      ...(a.activityType!==undefined?{activityType:a.activityType as PlanActivity["activityType"]}:{}),
      ...Object.fromEntries(["assignment","implementation","discussion","conclusion"].filter(k=>a[k]!==undefined).map(k=>[k,String(a[k])])),
    });
  }
  return {
    plan: {
      version: 1,
      id: String(p.id),
      title: String(p.title),
      lessonCode: String(p.lessonCode),
      classContext: String(p.classContext),
      goals: String(p.goals),
      preparation: String(p.preparation),
      reflection: String(p.reflection),
      activities,
      updatedAt: String(p.updatedAt),
      ...(p.flippedForm !== undefined ? { flippedForm: p.flippedForm as TeachingPlan["flippedForm"] } : {}),
      ...Object.fromEntries(["knowledgeGoals","competenceGoals","qualityGoals"].filter(k=>p[k]!==undefined).map(k=>[k,String(p[k])])),
      ...(p.curriculumTargets!==undefined?{curriculumTargets:p.curriculumTargets as string[]}:{}),
    },
  };
}
export function lessonPlanReview(plan:TeachingPlan) {
 const missing:string[]=[];
 for(const [key,label] of [["knowledgeGoals","Mục tiêu kiến thức"],["competenceGoals","Mục tiêu năng lực"],["qualityGoals","Mục tiêu phẩm chất"]] as const)if(!plan[key]?.trim())missing.push(label);
 for(const [key,label] of Object.entries(LESSON_ACTIVITY_TYPES))if(!plan.activities.some(a=>a.activityType===key))missing.push(`Hoạt động ${label.toLowerCase()}`);
 plan.activities.forEach((a,i)=>{for(const [key,label] of [["objective","mục tiêu"],["instructions","nội dung nhiệm vụ"],["product","sản phẩm"],["assignment","giao nhiệm vụ"],["implementation","thực hiện nhiệm vụ"],["discussion","báo cáo và thảo luận"],["conclusion","kết luận và nhận định"]] as const)if(!a[key]?.trim())missing.push(`Hoạt động ${i+1}: ${label}`);});
 return missing;
}
export function movePlanActivity(
  activities: PlanActivity[],
  id: string,
  direction: -1 | 1,
) {
  const index = activities.findIndex((a) => a.id === id);
  if (index < 0) return activities;
  const siblings = activities
    .map((a, i) => (a.phase === activities[index].phase ? i : -1))
    .filter((i) => i >= 0);
  const destination = siblings[siblings.indexOf(index) + direction];
  if (destination === undefined) return activities;
  const result = [...activities];
  [result[index], result[destination]] = [result[destination], result[index]];
  return result;
}
export function planToHtml(
  plan: TeachingPlan,
  origin = "http://localhost:3001",
) {
  const esc = (v: string) =>
    v.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c]!,
    );
  const paragraph = (value: string) => esc(value).replace(/\n/g, "<br>");
  return `<!doctype html><html lang="vi"><meta charset="utf-8"><title>${esc(plan.title)}</title><style>body{font:16px Arial,sans-serif;line-height:1.6;max-width:900px;margin:36px auto;padding:0 24px;color:#19324f}h1{font-size:28px}article{break-inside:avoid;border:1px solid #bdc9d4;padding:18px;margin:18px 0}h2{margin-top:32px}a{overflow-wrap:anywhere}@media print{body{margin:0;max-width:none}article{border-color:#888}}</style><body><h1>${esc(plan.title)}</h1><p>${esc(plan.lessonCode)} · ${paragraph(plan.classContext)}</p>${plan.flippedForm ? `<p><b>Hình thức lớp học đảo ngược:</b> ${({standard: "Học trước – luyện tập trên lớp", demonstration: "Minh họa – thực hành", discussion: "Thảo luận", group: "Làm việc nhóm"})[plan.flippedForm]}</p>` : ""}<h2>I Mục tiêu</h2><h3>Kiến thức</h3><p>${paragraph(plan.knowledgeGoals||plan.goals)}</p><h3>Năng lực</h3><p>${paragraph(plan.competenceGoals||"Chưa bổ sung")}</p><h3>Phẩm chất</h3><p>${paragraph(plan.qualityGoals||"Chưa bổ sung")}</p><h2>II Thiết bị dạy học và học liệu</h2><p>${paragraph(plan.preparation)}</p><h2>III Tiến trình dạy học</h2>${PLAN_PHASES.map(
    (phase) =>
      `<h2>${PHASE_NAMES[phase]} · ${plan.activities.filter((a) => a.phase === phase).reduce((n, a) => n + a.minutes, 0)} phút</h2>${plan.activities
        .filter((a) => a.phase === phase)
        .map(
          (a, i) =>
            `<article><h3>${i + 1}. ${esc(a.title)} · ${a.minutes} phút</h3>${a.activityType ? `<p><b>Loại hoạt động:</b> ${LESSON_ACTIVITY_TYPES[a.activityType]}</p>` : ""}<p><b>a Mục tiêu:</b> ${paragraph(a.objective)}</p><p><b>b Nội dung:</b> ${paragraph(a.instructions)}</p>${a.teacherActions !== undefined ? `<p><b>Giáo viên:</b> ${paragraph(a.teacherActions)}</p>` : ""}${a.studentActions !== undefined ? `<p><b>Học sinh:</b> ${paragraph(a.studentActions)}</p>` : ""}<p><b>c Sản phẩm:</b> ${paragraph(a.product)}</p><p><b>d Tổ chức thực hiện:</b></p>${([["assignment","Giao nhiệm vụ"],["implementation","Thực hiện nhiệm vụ"],["discussion","Báo cáo và thảo luận"],["conclusion","Kết luận và nhận định"]] as const).map(([k,label])=>`<p><b>${label}:</b> ${paragraph(a[k]||"Chưa bổ sung")}</p>`).join("")}<p><b>Đánh giá:</b> ${paragraph(a.evaluation)}</p><p><b>Phân hóa:</b> ${paragraph(a.support)}</p><ul>${a.resources.map((r) => `<li>${esc(r.title)} — ${r.url.startsWith("activity:") ? `Mô phỏng ${esc(r.url.slice(9))} trong kho web` : `<a href="${esc(r.url.startsWith("/") ? new URL(r.url, origin).href : r.url)}">${esc(r.url)}</a>`}</li>`).join("")}</ul></article>`,
        )
        .join("")}`,
  ).join(
    "",
  )}<h2>Điều chỉnh sau dạy học</h2><p>${paragraph(plan.reflection)}</p><p>Bản kế hoạch cá nhân do giáo viên lựa chọn và chỉnh sửa. Các mức quan sát tự học là gợi ý thiết kế, cần thẩm định trước dùng làm thang đo nghiên cứu.</p></body></html>`;
}
