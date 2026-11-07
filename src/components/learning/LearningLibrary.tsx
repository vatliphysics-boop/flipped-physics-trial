"use client";
/* eslint-disable @next/next/no-img-element -- Vector lesson previews. */
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CANONICAL_SYSTEM_MATERIALS } from "@/lib/material-bank";
import { LearningResourcePreview } from "./LearningResourcePreview";
import { VISUAL_LESSONS } from "@/lib/visual-learning";
import type { MaterialItem } from "@/lib/material-bank";
const EMPTY_SNAPSHOT = () => "";
function fitsPurpose(m: MaterialItem, purpose: string) {
  if (purpose === "before") return ["image", "animation", "lecture_video", "real_video"].includes(m.material_type) || m.metadata?.workspace === "quiz" || m.id.startsWith("system-notes-");
  if (purpose === "during") return m.material_type === "simulation" || ["mindmap", "roleplay", "game"].includes(m.metadata?.workspace ?? "") || m.content_url.endsWith(".ipynb");
  if (purpose === "review") return m.material_type === "assessment" || ["quiz", "remediation", "rubric"].includes(m.metadata?.workspace ?? "");
  return true;
}
export const LEARNING_CATEGORIES = [
  ["all", "Tất cả học liệu"],
  ["simulation", "Thí nghiệm 3D"],
  ["image", "Ảnh & Sơ đồ"],
  ["animation", "Minh họa động"],
  ["real_video", "Video thực tế"],
  ["lecture_video", "Video bài giảng"],
  ["document", "PDF & Phiếu học tập"],
  ["colab", "Câu hỏi & Hoạt động nhóm"],
  ["assessment", "Đề giữa kỳ & Cuối kỳ"],
] as const;
export function LearningLibrary({
  initialType = "all",
  initialLesson = "all",
  initialResource,
}: {
  initialType?: string;
  initialLesson?: string;
  initialResource?: string;
}) {
  const [type, setType] = useState(LEARNING_CATEGORIES.some(([v]) => v === initialType) ? initialType : "all"),
    [lesson, setLesson] = useState(VISUAL_LESSONS.some(l => l.code === initialLesson) ? initialLesson : "all"),
    [search, setSearch] = useState(""),
    [open, setOpen] = useState<string | null>(initialResource ?? null),
    [purpose, setPurpose] = useState("all"), [onlySaved, setOnlySaved] = useState(false), [notice, setNotice] = useState("");
  const subscribe = useCallback((notify: () => void) => { window.addEventListener("storage", notify); window.addEventListener("materials-saved", notify); return () => { window.removeEventListener("storage", notify); window.removeEventListener("materials-saved", notify); }; }, []);
  const snapshot = useSyncExternalStore(subscribe, () => { try { return localStorage.getItem("physics-saved-materials-v1") ?? ""; } catch { return ""; } }, EMPTY_SNAPSHOT);
  const saved = useMemo<string[]>(() => { try { const value: unknown = JSON.parse(snapshot || "[]"); return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string").slice(0, 200) : []; } catch { return []; } }, [snapshot]);
  function toggleSaved(id: string) {
    try { localStorage.setItem("physics-saved-materials-v1", JSON.stringify(saved.includes(id) ? saved.filter(v => v !== id) : [...saved, id])); window.dispatchEvent(new Event("materials-saved")); setNotice(saved.includes(id) ? "Đã bỏ khỏi học liệu đã lưu." : "Đã lưu học liệu trên thiết bị này."); }
    catch { setNotice("Trình duyệt chưa lưu được. Em có thể dùng liên kết chia sẻ của học liệu."); }
  }
  const catalog = CANONICAL_SYSTEM_MATERIALS.filter((m) => m.is_published);
  const visible = catalog.filter(
    (m) =>
      (type === "all" || m.material_type === type) &&
      fitsPurpose(m, purpose) && (!onlySaved || saved.includes(m.id)) &&
      (lesson === "all" ||
        m.lesson_tag === lesson ||
        m.lesson_tag === "general") &&
      `${m.title} ${m.description}`
        .toLocaleLowerCase("vi")
        .includes(search.toLocaleLowerCase("vi")),
  );
  function changeType(value: string) {
    setType(value);
    setOpen(null);
  }
  return (
    <section className="learning-library">
      <div className="library-start"><div><span className="visual-eyebrow">Chương 4: Vật lí hạt nhân · B21–B25</span><h2>Học liệu theo bài</h2><p>Chọn bài để mở hình minh họa, mô phỏng, video và bản ghi học tập.</p></div><Link className="btn primary" href="/hoc-lieu/truc-quan?bai=B22">Mở học liệu B22</Link></div>
      <nav className="library-lesson-cards" aria-label="Mở học liệu theo bài">{VISUAL_LESSONS.map(l => <Link href={`/hoc-lieu/truc-quan?bai=${l.code}`} key={l.code}><span>{l.code}</span><img src={`/illustrations/${l.code}-diagram.svg`} alt=""/><strong>{l.shortTitle}</strong><small>Hình · 3D · Video · Bản ghi ↗</small></Link>)}</nav>
      <div className="planning-callout"><div><strong>Kế hoạch dạy học của giáo viên</strong><p>Chọn học liệu từ kho, chỉnh mục tiêu và nhiệm vụ, thiết kế sản phẩm/đánh giá cho ba pha. Có 5 mẫu B21–B25 để sửa và lưu riêng.</p></div><Link className="btn primary" href="/hoc-lieu/soan-ke-hoach">Soạn kế hoạch dạy học</Link></div>
      <div className="library-filters">
        <label>
          Tìm học liệu
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(null);
            }}
            placeholder="Tên thí nghiệm, công thức, ứng dụng…"
          />
        </label>
        <label>
          Bài học
          <select
            value={lesson}
            onChange={(e) => {
              setLesson(e.target.value);
              setOpen(null);
            }}
          >
            <option value="all">B21–B25 · Vật lí hạt nhân</option>
            {["B21", "B22", "B23", "B24", "B25"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="library-purpose" aria-label="Lọc theo nhu cầu">{[["all", "Mọi mục đích"], ["before", "Tự học trước giờ"], ["during", "Khám phá trên lớp"], ["review", "Ôn tập & kiểm tra"]].map(([value, title]) => <button key={value} className={`btn small ${purpose === value ? "primary" : ""}`} aria-pressed={purpose === value} onClick={() => { setPurpose(value); setOpen(null); }}>{title}</button>)}<label><input type="checkbox" checked={onlySaved} onChange={e => { setOnlySaved(e.target.checked); setOpen(null); }}/> Học liệu đã lưu ({saved.length})</label></div>
      <div className="library-categories" aria-label="Lọc loại học liệu">
        {LEARNING_CATEGORIES.map(([value, label]) => (
          <button
            type="button"
            className={`btn small ${type === value ? "primary" : ""}`}
            aria-pressed={type === value}
            onClick={() => changeType(value)}
            key={value}
          >
            {label}{" "}
            <span>
              (
              {
                catalog.filter(
                  (m) => value === "all" || m.material_type === value,
                ).length
              }
              )
            </span>
          </button>
        ))}
      </div>
      <p role="status">
        {visible.length} học liệu phù hợp. Nhấn tên học liệu để mở nội dung và
        thao tác.
      </p>
      {notice && <p role="status" className="physics-note">{notice}</p>}
      <div className="library-items">
        {visible.map((m) => (
          <article className="library-item" key={m.id}>
            <div className="library-item-heading">
            <button
              type="button"
              className="library-item-toggle"
              aria-expanded={open === m.id}
              aria-controls={`resource-${m.id}`}
              onClick={() => setOpen(open === m.id ? null : m.id)}
            >
              <span>
                <small>
                  {m.lesson_tag === "general" ? "Chủ đề hạt nhân" : m.lesson_tag} ·{" "}
                  {
                    LEARNING_CATEGORIES.find(
                      ([v]) => v === m.material_type,
                    )?.[1]
                  }
                </small>
                <strong>{m.title}</strong>
                <span>{m.description}</span>
              </span>
              <b aria-hidden="true">{open === m.id ? "−" : "+"}</b>
            </button>
            <button className="material-save" aria-label={`${saved.includes(m.id) ? "Bỏ lưu" : "Lưu"} ${m.title}`} aria-pressed={saved.includes(m.id)} onClick={() => toggleSaved(m.id)}>{saved.includes(m.id) ? "★" : "☆"}</button>
            </div>
            {open === m.id && (
              <div id={`resource-${m.id}`} className="library-content">
                <LearningResourcePreview material={m} />
                {m.lesson_tag && /^B2[1-5]$/.test(m.lesson_tag) && m.material_type !== "assessment" && <p className="ai-entry"><Link className="btn" href={`/hoc-lieu/ai?bai=${m.lesson_tag}`}>Hỏi AI về bài {m.lesson_tag} ↗</Link><span>Ghi câu hỏi và cách làm trước khi trao đổi.</span></p>}
                {m.metadata?.author && <p className="physics-note">Nguồn/tác giả: {m.metadata.author}{m.metadata.language === "en" ? " · Tài liệu tiếng Anh, hướng dẫn học bằng tiếng Việt trong mô tả." : ""}{m.metadata.verifiedAt ? ` · Kiểm tra liên kết ngày ${m.metadata.verifiedAt.split("-").reverse().join("/")}.` : ""}</p>}
                <Link className="btn" href={`/hoc-lieu/soan-ke-hoach?material=${encodeURIComponent(m.id)}`}>Đưa học liệu này vào kế hoạch riêng</Link>
                <Link className="btn small" href={`/hoc-lieu?bai=${m.lesson_tag === "general" ? "all" : m.lesson_tag}&resource=${encodeURIComponent(m.id)}#resource-${encodeURIComponent(m.id)}`}>Liên kết mở học liệu này</Link>
              </div>
            )}
          </article>
        ))}
      </div>
      {!visible.length && (
        <p>
          Chưa tìm thấy học liệu phù hợp. <button className="btn small" onClick={() => { setType("all"); setLesson("all"); setPurpose("all"); setSearch(""); setOnlySaved(false); }}>Xóa bộ lọc</button>
        </p>
      )}
    </section>
  );
}
