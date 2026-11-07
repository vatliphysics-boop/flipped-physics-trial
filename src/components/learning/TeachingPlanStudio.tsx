"use client";
import {
  useCallback,
  useMemo,
  useState,
  useRef,
  useSyncExternalStore,
  useTransition,
} from "react";
import Link from "next/link";
import {
  CANONICAL_SYSTEM_MATERIALS,
  type MaterialItem,
} from "@/lib/material-bank";
import {
  createPlanTemplate,
  materialToPlanResource,
} from "@/lib/teaching-plan-templates";
import {
  PHASE_NAMES,
  LESSON_ACTIVITY_TYPES,
  lessonPlanReview,
  PLAN_PHASES,
  PLAN_UUID,
  movePlanActivity,
  planToHtml,
  validateTeachingPlan,
  type TeachingPlan,
  type PlanActivity,
  type PlanPhase,
} from "@/lib/teaching-plan";
import {
  saveTeachingPlanAction,
  applyTeachingPlanAction,
} from "@/app/teacher/plan-actions";
import { LearningResourcePreview } from "./LearningResourcePreview";
import { FLIPPED_FORMS, getFlippedForm } from "@/lib/flipped-classroom";
import { TeacherPreparationPanel } from "./TeacherPreparationPanel";
import { PlanRoleComparison } from "./PlanRoleComparison";

const EMPTY_SNAPSHOT = () => "";
function download(content: string, name: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
export function TeachingPlanStudio({
  teacherId,
  materials = CANONICAL_SYSTEM_MATERIALS,
  initialPlans = [],
  lessons = [],
  cloudError,
  template,
  materialId,
  form,
  preparationMode = false,
  initialDraft,
}: {
  teacherId?: string;
  materials?: MaterialItem[];
  initialPlans?: TeachingPlan[];
  lessons?: { id: string; title: string }[];
  cloudError?: string;
  template?: string;
  materialId?: string;
  form?: string;
  preparationMode?: boolean;
  initialDraft?: TeachingPlan;
}) {
  const storageKey = `physics-teaching-plans-v1:${teacherId ?? "local"}`;
  const subscribe = useCallback((listener: () => void) => {
    window.addEventListener("storage", listener);
    window.addEventListener("physics-plans-changed", listener);
    return () => {
      window.removeEventListener("storage", listener);
      window.removeEventListener("physics-plans-changed", listener);
    };
  }, []);
  const snapshot = useSyncExternalStore(
    subscribe,
    useCallback(() => {
      try {
        return localStorage.getItem(storageKey) ?? "";
      } catch {
        return "";
      }
    }, [storageKey]),
    EMPTY_SNAPSHOT,
  );
  const saved = useMemo(() => {
    const map = new Map(initialPlans.map((p) => [p.id, p]));
    try {
      const values: unknown = JSON.parse(snapshot || "[]");
      if (Array.isArray(values))
        for (const value of values.slice(0, 30)) {
          const checked = validateTeachingPlan(value);
          if (checked.plan) {
            const old = map.get(checked.plan.id);
            if (!old || checked.plan.updatedAt >= old.updatedAt)
              map.set(checked.plan.id, checked.plan);
          }
        }
    } catch {
      /* Keep account plans if a local draft is corrupt. */
    }
    return Array.from(map.values()).sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  }, [snapshot, initialPlans]);
  const [selection, setSelection] = useState("draft");
  const [seed, setSeed] = useState(() =>
    initialDraft ?? createPlanTemplate(
      template ??
        materials.find((m) => m.id === materialId)?.lesson_tag ??
        "B23",
      materialId,
      materials,
      form,
    ),
  );
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState("");
  const [formChoice, setFormChoice] = useState(getFlippedForm(form)?.id ?? "standard");
  function saveLocal(plan: TeachingPlan): boolean {
    try {
      const items = [plan, ...saved.filter((p) => p.id !== plan.id)];
      if (items.length > 30) {
        setNotice(
          "Thiết bị đã có 30 kế hoạch. Tải bản JSON để lưu ngoài thiết bị trước khi tạo thêm.",
        );
        return false;
      }
      localStorage.setItem(storageKey, JSON.stringify(items));
      window.dispatchEvent(new Event("physics-plans-changed"));
      setNotice("Đã lưu kế hoạch trên thiết bị này.");
      return true;
    } catch {
      setNotice("Trình duyệt chưa lưu được. Hãy tải bản JSON để giữ kế hoạch.");
      return false;
    }
  }
  function newPlan(code: string) {
    setSeed(createPlanTemplate(code, undefined, materials, formChoice));
    setSelection("draft");
    setRevision((n) => n + 1);
    setNotice("Đã mở bản mới. Các bản đã lưu vẫn có trong danh sách.");
  }
  return (
    <section className="plan-studio">
      <div className="planning-callout"><div><label>Hình thức của mẫu kế hoạch mới<select value={formChoice} onChange={e => setFormChoice(e.target.value as typeof formChoice)}>{FLIPPED_FORMS.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}</select></label><p>Chọn hình thức rồi nhấn Mẫu B21–B25 bên dưới để mở bản mới. Kế hoạch đang soạn không đổi khi chọn ở đây.</p></div><Link className="btn" href="/hoc-lieu/lop-hoc-dao-nguoc">Xem các hình thức và việc của hai bên</Link></div>
      <div className="planning-callout">
        <p>
          Biên soạn kế hoạch cá nhân từ kho B21–B25. Kế hoạch trên thiết bị và
          kế hoạch trong tài khoản được ghi rõ khi lưu; thao tác đưa vào lớp tạo
          các bước <strong>bản nháp</strong> để giáo viên rà soát.
        </p>
        <Link
          href={teacherId ? "/teacher/materials" : "/hoc-lieu"}
          className="btn"
        >
          Quay lại kho học liệu
        </Link>
      </div>
      {cloudError && (
        <p className="form-alert" role="status">
          {cloudError} Bạn vẫn soạn, lưu thiết bị và xuất bản kế hoạch được.
        </p>
      )}
      {!teacherId && (
        <p className="physics-note">
          Bàn soạn mở lưu trên trình duyệt hiện tại.{" "}
          <Link href="/teacher/plans">Đăng nhập giáo viên</Link> để dùng kho
          riêng, lưu tài khoản và đưa kế hoạch vào bài học.
        </p>
      )}
      <div className="planning-actions">
        <label>
          Mở kế hoạch đã lưu
          <select
            value={selection}
            onChange={(e) => {
              setSelection(e.target.value);
              setRevision((n) => n + 1);
            }}
          >
            <option value="draft">Bản đang soạn mới</option>
            {saved.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <button className="btn" onClick={() => newPlan("blank")}>
          Tạo kế hoạch trống
        </button>
        {["B21", "B22", "B23", "B24", "B25"].map((code) => (
          <button
            className="btn small"
            key={code}
            onClick={() => newPlan(code)}
          >
            Mẫu {code}
          </button>
        ))}
      </div>
      <label className="plan-import">
        Nhập bản kế hoạch JSON
        <input
          type="file"
          accept=".json,application/json"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 500000) {
              setNotice("Tệp kế hoạch vượt 500 KB.");
              return;
            }
            try {
              const checked = validateTeachingPlan(
                JSON.parse(await file.text()),
              );
              if (!checked.plan) {
                setNotice(checked.error ?? "Tệp không hợp lệ.");
                return;
              }
              setSeed({
                ...checked.plan,
                id: "unsaved",
                title: `${checked.plan.title} (bản nhập)`,
              });
              setSelection("draft");
              setRevision((n) => n + 1);
              setNotice(
                "Đã mở bản nhập để chỉnh sửa. Nhấn lưu để giữ bản này.",
              );
            } catch {
              setNotice("Không đọc được tệp JSON kế hoạch.");
            }
            e.target.value = "";
          }}
        />
      </label>
      {notice && <p role="status">{notice}</p>}
      <PlanEditor
        key={`${selection}-${revision}`}
        preparationMode={preparationMode}
        initialPlan={saved.find((p) => p.id === selection) ?? seed}
        teacherId={teacherId}
        materials={materials}
        lessons={lessons}
        onSave={saveLocal}
        onNotice={setNotice}
      />
    </section>
  );
}
function PlanEditor({
  preparationMode,
  initialPlan,
  teacherId,
  materials,
  lessons,
  onSave,
  onNotice,
}: {
  preparationMode?: boolean;
  initialPlan: TeachingPlan;
  teacherId?: string;
  materials: MaterialItem[];
  lessons: { id: string; title: string }[];
  onSave: (plan: TeachingPlan) => boolean;
  onNotice: (text: string) => void;
}) {
  const [plan, setPlan] = useState(initialPlan);
  const [phase, setPhase] = useState<PlanPhase>("in_class");
  const [target, setTarget] = useState("");
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const [preview, setPreview] = useState<MaterialItem | null>(null);
  const [lessonId, setLessonId] = useState("");
  const [busy, startTransition] = useTransition();
  const [status, setStatus] = useState("");
  const [exportHtml, setExportHtml] = useState("");
  const [exportJson, setExportJson] = useState("");
  const printFrame = useRef<HTMLIFrameElement>(null);
  const [own, setOwn] = useState({
    title: "",
    url: "",
    type: "document" as MaterialItem["material_type"],
  });
  function patch(changes: Partial<TeachingPlan>) {
    setPlan((p) => ({ ...p, ...changes }));
    setExportHtml("");
    setExportJson("");
    setStatus("Có thay đổi chưa lưu.");
  }
  function changeActivity(id: string, changes: Partial<PlanActivity>) {
    patch({
      activities: plan.activities.map((a) =>
        a.id === id ? { ...a, ...changes } : a,
      ),
    });
  }
  function addResource(material: MaterialItem) {
    const resource = materialToPlanResource(material);
    const activity = plan.activities.find(
      (a) => a.id === target && a.phase === phase,
    );
    if (activity) {
      if (activity.resources.some((r) => r.id === resource.id)) {
        setStatus("Học liệu này đã có trong hoạt động.");
        return;
      }
      if (activity.resources.length >= 12) {
        setStatus("Mỗi hoạt động tối đa 12 học liệu.");
        return;
      }
      changeActivity(activity.id, {
        resources: [...activity.resources, resource],
      });
    } else {
      if (plan.activities.length >= 60) {
        setStatus("Mỗi kế hoạch tối đa 60 hoạt động.");
        return;
      }
      const id = crypto.randomUUID();
      patch({
        activities: [
          ...plan.activities,
          {
            id,
            phase,
            title: material.title,
            minutes: material.metadata?.durationMinutes ?? 15,
            objective: "",
            instructions: material.description,
            product: "",
            evaluation: "",
            support: "",
            resources: [resource],
          },
        ],
      });
      setTarget(id);
    }
  }
  function prepared(): TeachingPlan | null {
    const candidate = {
      ...plan,
      id: PLAN_UUID.test(plan.id) ? plan.id : crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    };
    const checked = validateTeachingPlan(candidate);
    if (!checked.plan) {
      setStatus(checked.error ?? "Kế hoạch chưa hợp lệ.");
      return null;
    }
    setPlan(checked.plan);
    return checked.plan;
  }
  function save(account = false) {
    const p = prepared();
    if (!p) return;
    const local = onSave(p);
    setStatus(
      local
        ? "Đã lưu bản trên thiết bị."
        : "Chưa lưu trên thiết bị; có thể tải JSON.",
    );
    if (account && teacherId)
      startTransition(async () => {
        const result = await saveTeachingPlanAction(p);
        setStatus(result.error ?? result.message ?? "Chưa có xác nhận lưu.");
      });
  }
  const choices = materials.filter(
    (m) =>
      (kind === "all" || m.material_type === kind) &&
      (plan.lessonCode === "general" ||
        m.lesson_tag === plan.lessonCode ||
        m.lesson_tag === "general") &&
      `${m.title} ${m.description}`
        .toLocaleLowerCase("vi")
        .includes(search.toLocaleLowerCase("vi")),
  );
  const kinds: [string, string][] = [
    ["all", "Tất cả"],
    ["simulation", "Thí nghiệm 3D"],
    ["document", "Tài liệu / Phiếu / Hướng dẫn"],
    ["assessment", "Đề giữa kỳ / Cuối kỳ"],
    ["colab", "Hoạt động tương tác"],
    ["lecture_video", "Video bài giảng"],
    ["real_video", "Video thực tế"],
    ["image", "Sơ đồ"],
    ["animation", "Minh họa động"],
  ];
  return (
    <>
      {preparationMode && <TeacherPreparationPanel key={plan.lessonCode} plan={plan} resources={materials.map(materialToPlanResource)} onAdd={activity => { if (plan.activities.some(a => a.id === activity.id)) { setStatus("Hoạt động này đã có trong kế hoạch. Chỉnh trực tiếp để giữ các thay đổi của bạn; bỏ hoạt động cũ nếu muốn thay bằng bản mới."); return; } if (plan.activities.length >= 60) { setStatus("Kế hoạch đã có 60 hoạt động."); return; } patch({ activities: [...plan.activities, activity] }); setStatus("Đã thêm hoạt động cùng học liệu, sản phẩm và tiêu chí; kiểm tra lại tổng thời lượng."); }} />}
      <label>Hình thức ghi trong kế hoạch<select value={plan.flippedForm ?? ""} onChange={e => patch({ flippedForm: e.target.value ? e.target.value as TeachingPlan["flippedForm"] : undefined })}><option value="">Chưa chọn</option>{FLIPPED_FORMS.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}</select></label><p className="physics-note">Khi đổi tên hình thức, cần chỉnh nhiệm vụ của giáo viên và học sinh bên dưới cho phù hợp.</p>
      <PlanRoleComparison plan={plan} /><details className="plan-review"><summary>Kiểm tra cấu trúc kế hoạch bài dạy</summary><p>Bốn loại hoạt động được bố trí trong ba pha học tập. Rà soát dựa trên Phụ lục IV khung kế hoạch bài dạy.</p>{lessonPlanReview(plan).length?<ul>{lessonPlanReview(plan).map((item,i)=><li key={i}>Cần bổ sung: {item}</li>)}</ul>:<p>Đủ các trường cấu trúc. Giáo viên cần kiểm tra chất lượng nội dung và mức độ phù hợp với lớp.</p>}</details>
      <div className="plan-header-fields">
        <label>
          Tên kế hoạch
          <input
            value={plan.title}
            maxLength={200}
            onChange={(e) => patch({ title: e.target.value })}
          />
        </label>
        <label>
          Phạm vi bài học
          <select
            value={plan.lessonCode}
            onChange={(e) => patch({ lessonCode: e.target.value })}
          >
            <option value="general">Toàn chủ đề B21–B25</option>
            {["B21", "B22", "B23", "B24", "B25"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Bối cảnh lớp và điều kiện
          <textarea
            value={plan.classContext}
            maxLength={1000}
            onChange={(e) => patch({ classContext: e.target.value })}
            rows={2}
            placeholder="Trình độ lớp, số nhóm, thiết bị và thời lượng"
          />
        </label>
        <label>
          Mục tiêu chung
          <textarea
            value={plan.goals}
            maxLength={6000}
            onChange={(e) => patch({ goals: e.target.value })}
            rows={4}
          />
        </label>
        {([["knowledgeGoals","Mục tiêu kiến thức"],["competenceGoals","Mục tiêu năng lực"],["qualityGoals","Mục tiêu phẩm chất"]] as const).map(([field,label])=><label key={field}>{label}<textarea rows={3} value={plan[field]||""} maxLength={6000} onChange={e=>patch({[field]:e.target.value})}/></label>)}
        <label>
          Thiết bị dạy học và học liệu
          <textarea
            value={plan.preparation}
            maxLength={6000}
            onChange={(e) => patch({ preparation: e.target.value })}
            rows={3}
          />
        </label>
      </div>
      <div className="planning-actions">
        <button className="btn primary" onClick={() => save()}>
          Lưu trên thiết bị
        </button>
        {teacherId && (
          <button className="btn" disabled={busy} onClick={() => save(true)}>
            Lưu vào tài khoản của tôi
          </button>
        )}
        <button
          className="btn"
          onClick={() => {
            const p = prepared();
            if (p) {
              setExportJson(JSON.stringify(p, null, 2));
              download(
                JSON.stringify(p, null, 2),
                `${p.lessonCode}-ke-hoach.json`,
                "application/json",
              );
            }
          }}
        >
          Tải JSON để chỉnh sửa tiếp
        </button>
        <button
          className="btn"
          onClick={() => {
            const p = prepared();
            if (p) {
              setExportHtml(planToHtml(p, window.location.origin));
              download(
                planToHtml(p, window.location.origin),
                `${p.lessonCode}-ke-hoach.html`,
                "text/html;charset=utf-8",
              );
            }
          }}
        >
          Xuất kế hoạch để in
        </button>
        <button
          className="btn"
          onClick={() => {
            patch({ id: "unsaved", title: `${plan.title} (bản sao)` });
            onNotice("Đang soạn bản sao độc lập. Nhấn lưu để giữ bản sao.");
          }}
        >
          Tạo bản sao để sáng tạo
        </button>
      </div>
      <p role="status">{status}</p>
      {exportJson && <details open className="plan-export"><summary>Bản JSON để lưu và nhập lại</summary><p>Nếu trình duyệt chưa tải tệp, sao chép nội dung này vào tệp .json.</p><textarea aria-label="JSON kế hoạch" readOnly value={exportJson} rows={8} /></details>}
      {exportHtml && <section className="plan-export"><div className="planning-actions"><h2>Bản kế hoạch để in</h2><button className="btn primary" onClick={() => printFrame.current?.contentWindow?.print()}>In kế hoạch</button><button className="btn" onClick={() => setExportHtml("")}>Đóng bản in</button></div><iframe ref={printFrame} title="Bản in kế hoạch dạy học" srcDoc={exportHtml} sandbox="allow-same-origin allow-modals" style={{width:"100%",height:600,border:"1px solid var(--border-light)",borderRadius:12}} /></section>}
      <div className="plan-columns">
        <aside className="plan-picker" aria-label="Chọn học liệu cho kế hoạch">
          <h2>Chọn và phối hợp học liệu</h2>
          <label>
            Đưa vào pha
            <select
              value={phase}
              onChange={(e) => {
                setPhase(e.target.value as PlanPhase);
                setTarget("");
              }}
            >
              {PLAN_PHASES.map((p) => (
                <option key={p} value={p}>
                  {PHASE_NAMES[p]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Hoạt động nhận học liệu
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="">Tạo hoạt động mới từ học liệu</option>
              {plan.activities
                .filter((a) => a.phase === phase)
                .map((a) => (
                  <option value={a.id} key={a.id}>
                    {a.title}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Tìm trong kho
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tên, nội dung học liệu…"
            />
          </label>
          <label>
            Loại học liệu
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              {kinds.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <p>
            {choices.length} học liệu phù hợp phạm vi {plan.lessonCode}.
          </p>
          <div className="plan-resource-list">
            {choices.map((m) => (
              <article key={m.id}>
                <strong>{m.title}</strong>
                <small>
                  {m.lesson_tag === "general" ? "Chủ đề hạt nhân" : m.lesson_tag} · {m.metadata?.author ?? "Kho học liệu"}
                </small>
                <p>{m.description}</p>
                <div className="planning-actions">
                  <button className="btn small" onClick={() => setPreview(m)}>
                    Xem học liệu
                  </button>
                  <button
                    className="btn primary small"
                    onClick={() => addResource(m)}
                  >
                    Thêm vào {PHASE_NAMES[phase].toLocaleLowerCase("vi")}
                  </button>
                </div>
              </article>
            ))}
          </div>
          <details>
            <summary>Thêm học liệu hoặc liên kết của riêng tôi</summary>
            <label>
              Tên học liệu riêng
              <input
                value={own.title}
                onChange={(e) =>
                  setOwn((p) => ({ ...p, title: e.target.value }))
                }
                maxLength={200}
              />
            </label>
            <label>
              Liên kết học liệu riêng
              <input
                type="url"
                value={own.url}
                onChange={(e) => setOwn((p) => ({ ...p, url: e.target.value }))}
                placeholder="https://…"
              />
            </label>
            <label>
              Loại học liệu riêng
              <select
                value={own.type}
                onChange={(e) =>
                  setOwn((p) => ({
                    ...p,
                    type: e.target.value as MaterialItem["material_type"],
                  }))
                }
              >
                {kinds
                  .filter(([v]) => v !== "all")
                  .map(([v, l]) => (
                    <option value={v} key={v}>
                      {l}
                    </option>
                  ))}
              </select>
            </label>
            <button
              className="btn"
              onClick={() => {
                const resource = {
                  id: `custom-${crypto.randomUUID()}`,
                  title: own.title.trim(),
                  url: own.url.trim(),
                  type: own.type,
                };
                const sample = {
                  ...plan,
                  activities: [
                    {
                      id: "check",
                      phase,
                      title: "Kiểm tra",
                      minutes: 15,
                      objective: "",
                      instructions: "",
                      product: "",
                      evaluation: "",
                      support: "",
                      resources: [resource],
                    },
                  ],
                };
                const checked = validateTeachingPlan(sample);
                if (!checked.plan) {
                  setStatus(checked.error ?? "Liên kết không hợp lệ.");
                  return;
                }
                addResource({
                  id: resource.id,
                  title: resource.title,
                  description: "Học liệu riêng do giáo viên chọn.",
                  material_type: resource.type,
                  category: "nuclear_physics",
                  lesson_tag: plan.lessonCode,
                  content_url: resource.url,
                  is_published: false,
                  is_system: false,
                  created_at: "",
                });
                setOwn({ title: "", url: "", type: "document" });
              }}
            >
              Đưa học liệu riêng vào kế hoạch
            </button>
            <p>
              Liên kết riêng nằm trong bản kế hoạch. Trong tài khoản, dùng kho
              Học liệu để quản lí học liệu dùng lại giữa nhiều kế hoạch.
            </p>
          </details>
        </aside>
        <div className="plan-activities">
          {PLAN_PHASES.map((p) => (
            <section className="plan-phase" key={p}>
              <h2>
                {PHASE_NAMES[p]}{" "}
                <small>
                  {plan.activities
                    .filter((a) => a.phase === p)
                    .reduce((n, a) => n + a.minutes, 0)}{" "}
                  phút
                </small>
              </h2>
              <p>
                {p === "before_class"
                  ? "Mục tiêu, dự đoán và chuẩn bị kiến thức."
                  : p === "in_class"
                    ? "Thao tác, thảo luận và giải thích bằng bằng chứng."
                    : "Tự kiểm tra, sửa lỗi và hành động học tiếp."}
              </p>
              {plan.activities
                .filter((a) => a.phase === p)
                .map((a, i, all) => (
                  <article className="plan-activity" id={`plan-activity-${a.id}`} key={a.id}>
                    <div className="planning-actions">
                      <strong>Hoạt động {i + 1}</strong>
                      <button
                        className="btn small"
                        disabled={i === 0}
                        aria-label={`Đưa hoạt động ${i + 1} lên trong ${PHASE_NAMES[p]}`}
                        onClick={() =>
                          patch({
                            activities: movePlanActivity(
                              plan.activities,
                              a.id,
                              -1,
                            ),
                          })
                        }
                      >
                        ↑ Lên
                      </button>
                      <button
                        className="btn small"
                        disabled={i === all.length - 1}
                        aria-label={`Đưa hoạt động ${i + 1} xuống trong ${PHASE_NAMES[p]}`}
                        onClick={() =>
                          patch({
                            activities: movePlanActivity(
                              plan.activities,
                              a.id,
                              1,
                            ),
                          })
                        }
                      >
                        ↓ Xuống
                      </button>
                      <button
                        className="btn small"
                        onClick={() =>
                          patch({
                            activities: plan.activities.filter(
                              (item) => item.id !== a.id,
                            ),
                          })
                        }
                      >
                        Bỏ hoạt động
                      </button>
                    </div>
                    <label>
                      Tên hoạt động
                      <input
                        value={a.title}
                        maxLength={200}
                        onChange={(e) =>
                          changeActivity(a.id, { title: e.target.value })
                        }
                      />
                    </label>
                    <div className="activity-row">
                      <label>
                        Thời lượng (phút)
                        <input
                          type="number"
                          min={0}
                          max={240}
                          value={a.minutes}
                          onChange={(e) =>
                            changeActivity(a.id, {
                              minutes: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                      <label>
                        Chuyển pha
                        <select
                          value={a.phase}
                          onChange={(e) =>
                            changeActivity(a.id, {
                              phase: e.target.value as PlanPhase,
                            })
                          }
                        >
                          {PLAN_PHASES.map((v) => (
                            <option key={v} value={v}>
                              {PHASE_NAMES[v]}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label>Loại hoạt động<select value={a.activityType||""} onChange={e=>changeActivity(a.id,{activityType:e.target.value?e.target.value as PlanActivity["activityType"]:undefined})}><option value="">Chưa chọn</option>{Object.entries(LESSON_ACTIVITY_TYPES).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
                    {(
                      [
                        ["objective", "Mục tiêu hoạt động"],
                        ["instructions", "Nội dung nhiệm vụ"],
                        ["assignment", "Tổ chức thực hiện — Giao nhiệm vụ"],
                        ["implementation", "Tổ chức thực hiện — Thực hiện nhiệm vụ"],
                        ["discussion", "Tổ chức thực hiện — Báo cáo và thảo luận"],
                        ["conclusion", "Tổ chức thực hiện — Kết luận và nhận định"],
                        ["teacherActions", "Việc của giáo viên"],
                        ["studentActions", "Nhiệm vụ học sinh được giao"],
                        ["product", "Sản phẩm / Bằng chứng học tập"],
                        ["evaluation", "Tiêu chí và cách đánh giá"],
                        ["support", "Phân hóa / Hỗ trợ"],
                      ] as const
                    ).map(([field, label]) => (
                      <label key={field}>
                        {label}
                        <textarea
                          rows={field === "instructions" ? 4 : 2}
                          value={a[field] ?? ""}
                          maxLength={4000}
                          onChange={(e) =>
                            changeActivity(a.id, { [field]: e.target.value })
                          }
                        />
                      </label>
                    ))}
                    <ul className="plan-attached">
                      {a.resources.map((r) => (
                        <li key={r.id}>
                          <span>{r.title}</span>
                          <button
                            className="btn small"
                            aria-label={`Bỏ học liệu ${r.title}`}
                            onClick={() =>
                              changeActivity(a.id, {
                                resources: a.resources.filter(
                                  (item) => item.id !== r.id,
                                ),
                              })
                            }
                          >
                            Bỏ
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      className="btn small"
                      onClick={() => {
                        setPhase(p);
                        setTarget(a.id);
                        setStatus(
                          `Đang chọn học liệu cho: ${a.title}. Dùng bộ chọn học liệu bên cạnh.`,
                        );
                      }}
                    >
                      Chọn thêm học liệu cho hoạt động
                    </button>
                  </article>
                ))}
              <button
                className="btn"
                onClick={() => {
                  if (plan.activities.length >= 60) {
                    setStatus("Kế hoạch tối đa 60 hoạt động.");
                    return;
                  }
                  patch({
                    activities: [
                      ...plan.activities,
                      {
                        id: crypto.randomUUID(),
                        phase: p,
                        title: "Hoạt động mới",
                        minutes: 10,
                        objective: "",
                        instructions: "",
                        product: "",
                        evaluation: "",
                        support: "",
                        resources: [],
                      },
                    ],
                  });
                }}
              >
                + Thêm hoạt động · {PHASE_NAMES[p]}
              </button>
            </section>
          ))}
        </div>
      </div>
      <label>
        Điều chỉnh sau dạy học
        <textarea
          rows={4}
          maxLength={6000}
          value={plan.reflection}
          onChange={(e) => patch({ reflection: e.target.value })}
          placeholder="Điều đạt được, khó khăn, bằng chứng và điều chỉnh lần dạy tiếp theo…"
        />
      </label>
      {teacherId && (
        <section className="planning-callout">
          <div>
            <h3>Đưa kế hoạch vào bài học của tôi</h3>
            <p>
              Lưu tài khoản trước, sau đó sao chép các học liệu thành bước nháp
              ở ba pha. Hoạt động không gắn học liệu được giữ trong kế hoạch,
              cần bổ sung học liệu trước khi giao. Mỗi bản kế hoạch nhập một lần
              cho cùng bài học; tạo bản sao nếu cần một lượt khác.
            </p>
            <label>
              Bài học nhận kế hoạch
              <select
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
              >
                <option value="">Chọn bài học của tôi</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            className="btn primary"
            disabled={busy || !lessonId || !PLAN_UUID.test(plan.id)}
            onClick={() => {
              const p = prepared();
              if (!p) return;
              startTransition(async () => {
                const saved = await saveTeachingPlanAction(p);
                if (saved.error) {
                  setStatus(saved.error);
                  return;
                }
                const result = await applyTeachingPlanAction(p.id, lessonId);
                setStatus(
                  result.error ??
                    result.message ??
                    "Chưa có xác nhận đưa vào bài học.",
                );
              });
            }}
          >
            Tạo các bước học bản nháp
          </button>
        </section>
      )}
      {preview && (
        <div className="plan-preview">
          <div className="planning-actions">
            <h3>{preview.title}</h3>
            <button className="btn" onClick={() => setPreview(null)}>
              Đóng xem trước
            </button>
          </div>
          <LearningResourcePreview key={preview.id} material={preview} />
        </div>
      )}
    </>
  );
}
