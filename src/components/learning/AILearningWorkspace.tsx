"use client";

import { useCallback, useId, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  buildAIPrompt, EMPTY_AI_DRAFT, exportAIRecord,
  AI_LESSONS, AI_MODES, aiPromptError, getAILesson,
  getAIStarters, readAIDraft, type AIDraft, type AIMode,
} from "@/lib/ai-learning";
import { AIServiceButtons } from "./AIStudyHelp";

const EMPTY_SNAPSHOT = () => "";
export function AILearningWorkspace({ initialCode = "B21", headingLevel = 2 }: { initialCode?: string; headingLevel?: 1 | 2 }) {
  const code = getAILesson(initialCode) ? initialCode : "B21";
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return <section className="ai-workspace">
    <div className="ai-intro">
      <Heading>AI hỗ trợ học tập</Heading>
      <p>Nhấn nút AI tròn ở góc phải để hỏi ngay trong trang. Ghi lại điều em hiểu và điều cần kiểm tra ở đây.</p>
      <p className="physics-note">AI cục bộ hỗ trợ B21–B25. Nếu muốn dùng Gemini hoặc ChatGPT, em có thể mở liên kết bên dưới bằng tài khoản thông thường.</p>
    </div>
    <nav className="ai-lessons" aria-label="Chọn bài để hỏi AI">
      {AI_LESSONS.map(lesson => <Link className="btn small" key={lesson.code} aria-current={code === lesson.code ? "page" : undefined} href={`?bai=${lesson.code}`}>{lesson.code} · {lesson.title}</Link>)}
    </nav>
    <AILessonWorkspace key={code} code={code}/>
  </section>;
}

function AILessonWorkspace({ code }: { code: string }) {
  const id = useId(), lesson = getAILesson(code)!;
  const storageKey = `physics-ai-draft-v1:${code}`;
  const [notice, setNotice] = useState(""), [storageError, setStorageError] = useState("");
  const [fallback, setFallback] = useState<AIDraft>({ ...EMPTY_AI_DRAFT });
  const [showRecord, setShowRecord] = useState(false);
  const subscribe = useCallback((notify: () => void) => {
    window.addEventListener("storage", notify); window.addEventListener("ai-draft-changed", notify);
    return () => { window.removeEventListener("storage", notify); window.removeEventListener("ai-draft-changed", notify); };
  }, []);
  const readStorage = useCallback(() => { try { return localStorage.getItem(storageKey) ?? ""; } catch { return ""; } }, [storageKey]);
  const snapshot = useSyncExternalStore(subscribe, readStorage, EMPTY_SNAPSHOT);
  const draft = useMemo(() => storageError ? fallback : readAIDraft(snapshot), [snapshot, fallback, storageError]);
  const promptError = aiPromptError(draft);
  const prompt = promptError ? "" : buildAIPrompt(code, draft);
  const record = exportAIRecord(code, draft);
  function save(next: AIDraft) {
    setFallback(next); setNotice("");
    try { localStorage.setItem(storageKey, JSON.stringify(next)); window.dispatchEvent(new Event("ai-draft-changed")); setStorageError(""); }
    catch { setStorageError("Thiết bị chưa lưu được. Sao chép bản ghi trước khi đổi bài hoặc rời trang."); }
  }
  async function copy(text: string, label: string) {
    try { await navigator.clipboard.writeText(text); setNotice(`Đã sao chép ${label}.`); }
    catch { setNotice(`Chưa sao chép tự động được. Chọn nội dung trong ô ${label} rồi sao chép thủ công.`); }
  }
  function download() {
    setShowRecord(true);
    const url = URL.createObjectURL(new Blob([record], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = `${code}-hoc-voi-ai.txt`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setNotice("Nếu trình duyệt chưa tải được tệp, sao chép nội dung trong ô Bản ghi để lưu.");
  }
  function clear() {
    if (!window.confirm(`Xóa bản ghi học với AI của ${code} trên thiết bị này?`)) return;
    try { localStorage.removeItem(storageKey); window.dispatchEvent(new Event("ai-draft-changed")); }
    catch { /* The in-memory draft can still be cleared. */ }
    setFallback({ ...EMPTY_AI_DRAFT }); setShowRecord(false); setNotice("Đã xóa bản ghi trên trang này.");
  }
  return <div className="ai-lesson-workspace">
    <section className="ai-card" aria-labelledby={`${id}-prepare`}>
      <h3 id={`${id}-prepare`}>1. Chuẩn bị câu hỏi · {code}</h3>
      <p>{lesson.goals[0]}</p>
      <label htmlFor={`${id}-mode`}>Em cần hỗ trợ gì?</label>
      <select id={`${id}-mode`} value={draft.mode} onChange={e => save({ ...draft, mode: e.target.value as AIMode })}>
        {AI_MODES.map(mode => <option key={mode.id} value={mode.id}>{mode.label}</option>)}
      </select>
      <div className="ai-starters">{getAIStarters(code).map(question => <button type="button" className="btn small" key={question} onClick={() => save({ ...draft, question })}>{question}</button>)}</div>
      <label htmlFor={`${id}-question`}>Câu hỏi của em</label>
      <textarea id={`${id}-question`} rows={3} maxLength={1500} value={draft.question} onChange={e => save({ ...draft, question: e.target.value })} placeholder="Em chưa hiểu điều gì trong bài hoặc mô phỏng?"/>
      <label htmlFor={`${id}-attempt`}>Cách làm hoặc dự đoán của em {draft.mode === "review" ? "(cần ghi)" : "(nếu có)"}</label>
      <textarea id={`${id}-attempt`} rows={3} maxLength={1500} value={draft.attempt} onChange={e => save({ ...draft, attempt: e.target.value })} placeholder="Ghi công thức, bước đã làm hoặc điều em quan sát thấy."/>
      <p className="physics-note">Chỉ ghi nội dung học tập. Không ghi họ tên, email, số điện thoại, mật khẩu hoặc thông tin riêng của em và người khác.</p>
    </section>
    <section className="ai-card" aria-labelledby={`${id}-ask`}>
      <h3 id={`${id}-ask`}>2. Nội dung câu hỏi và liên kết thêm</h3>
      <p>Dùng khung AI ở góc phải để trao đổi ngay trong trang. Nếu dùng dịch vụ bên ngoài, sao chép nội dung dưới đây rồi dán vào cuộc trò chuyện mới.</p>
      <label htmlFor={`${id}-prompt`}>Câu hỏi kèm kiến thức nền (dùng cho dịch vụ bên ngoài)</label>
      <textarea id={`${id}-prompt`} readOnly rows={7} value={prompt} placeholder={promptError ?? ""}/>
      {promptError && <p className="physics-note">{promptError}</p>}
      <div className="ai-actions">
        <button type="button" className="btn primary" disabled={Boolean(promptError)} onClick={() => copy(prompt, "nội dung câu hỏi")}>Sao chép câu hỏi kèm kiến thức bài</button>
        <Link className="btn" href={`/hoc-lieu/truc-quan?bai=${code}`}>Mở học liệu {code} để kiểm tra</Link>
      </div>
      <AIServiceButtons/>
    </section>
    <section className="ai-card" aria-labelledby={`${id}-reflect`}>
      <h3 id={`${id}-reflect`}>3. Ghi lại và kiểm tra</h3>
      <label htmlFor={`${id}-reply`}>Phản hồi AI em muốn kiểm tra (dán thủ công)</label>
      <textarea id={`${id}-reply`} rows={4} maxLength={5000} value={draft.reply} onChange={e => save({ ...draft, reply: e.target.value })} placeholder="Chỉ dán phần liên quan đến bài học; bỏ thông tin cá nhân."/>
      <p className="physics-note">Đây là phản hồi do em dán vào, chưa được web hoặc giáo viên xác minh. Kiểm tra bằng học liệu, phép tính hoặc hỏi giáo viên.</p>
      <label htmlFor={`${id}-reflection`}>Sau khi kiểm tra, em hiểu gì hoặc cần sửa bước nào?</label>
      <textarea id={`${id}-reflection`} rows={3} maxLength={2000} value={draft.reflection} onChange={e => save({ ...draft, reflection: e.target.value })} placeholder="Nêu điều hiểu thêm, căn cứ kiểm tra và một câu hỏi còn lại."/>
      <label className="ai-check"><input type="checkbox" checked={draft.needsTeacher} onChange={e => save({ ...draft, needsTeacher: e.target.checked })}/><span>Có điểm cần hỏi lại giáo viên</span></label>
      <div className="ai-actions">
        <button type="button" className="btn" onClick={() => { setShowRecord(true); void copy(record, "bản ghi học tập"); }}>Sao chép bản ghi học tập</button>
        <button type="button" className="btn" onClick={download}>Tải bản ghi TXT</button>
        <button type="button" className="btn small" onClick={clear}>Xóa bản ghi {code}</button>
      </div>
      <p className="physics-note">Tự lưu trên trình duyệt này, chưa gửi cho giáo viên. Muốn báo nội dung sai hoặc chưa rõ, sao chép bản ghi và gửi qua kênh lớp học giáo viên đã quy định.</p>
      {showRecord && <label htmlFor={`${id}-export`}>Bản ghi để sao chép hoặc lưu<textarea id={`${id}-export`} readOnly rows={9} value={record}/></label>}
    </section>
    {storageError && <p role="alert">{storageError}</p>}
    {notice && <p className="ai-notice" role="status">{notice}</p>}
  </div>;
}
