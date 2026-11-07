"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { TEACHER_TASKS, TEACHER_LESSONS, TEACHER_AI_SERVICES, teacherExternalPrompt, teacherLessonText, teacherReviewNotes, type TeacherTask } from "@/lib/local-ai";
import { AIResponseText } from "./AIResponseText";
type Result = { reply: string; sources: { id: string; text: string }[]; partial: boolean; truncated: boolean; sourceWarning: boolean };
export function TeacherAIWorkspace({ demo = false }: { demo?: boolean }) {
  const id = useId(), [lesson, setLesson] = useState("B23"), [minutes, setMinutes] = useState(45), [classContext, setClassContext] = useState("");
  const [text, setText] = useState(demo ? teacherLessonText("B23") : ""), [focus, setFocus] = useState("");
  const [task, setTask] = useState<TeacherTask>("summary"), [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null), [draft, setDraft] = useState(""), [notice, setNotice] = useState("");
  const [ready, setReady] = useState<boolean | null>(null), [externalPrompt, setExternalPrompt] = useState("");
  const controller = useRef<AbortController | null>(null);
  const reviewNotes = teacherReviewNotes(draft, task === "plan" ? minutes : undefined);
  useEffect(() => {
    const status = new AbortController();
    fetch("/api/ai/status", { signal: status.signal }).then(response => response.json()).then(data => setReady(data.ready === true)).catch(() => { if (!status.signal.aborted) setReady(false); });
    return () => { status.abort(); controller.current?.abort(); };
  }, []);
  function clearResult() { setResult(null); setDraft(""); setExternalPrompt(""); }
  async function upload(file: File | undefined) {
    if (!file || busy || demo) return;
    if (file.size > 5000000) { setNotice("Tệp tối đa 5 MB."); return; }
    const pending = new AbortController(); controller.current = pending; setBusy(true); setNotice(""); clearResult();
    try {
      const form = new FormData(); form.set("file", file);
      const response = await fetch("/api/ai/document", { method: "POST", body: form, signal: pending.signal });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setText(data.text); setNotice("Đã đọc văn bản. Kiểm tra phần trích xuất trước khi xử lí; hình và công thức trong ảnh chưa được nhận dạng.");
    } catch (error) { if (!pending.signal.aborted) setNotice(error instanceof Error ? error.message : "Chưa đọc được tài liệu."); }
    finally { if (controller.current === pending) { controller.current = null; setBusy(false); } }
  }
  async function process() {
    if (busy) return;
    const pending = new AbortController(); controller.current = pending; setBusy(true); setNotice(""); clearResult();
    try {
      const response = await fetch(demo ? "/api/ai/teacher-demo" : "/api/ai/teacher", { method: "POST", headers: { "Content-Type": "application/json" }, signal: pending.signal, body: JSON.stringify(demo ? { lesson, task, minutes } : { text, task, focus, context: { lesson, minutes, classContext } }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setResult(data); setDraft(data.reply); setReady(true);
    } catch (error) { if (!pending.signal.aborted) setNotice(error instanceof Error ? error.message : "Chưa xử lí được học liệu."); }
    finally { if (controller.current === pending) { controller.current = null; setBusy(false); } }
  }
  function record() { return `${TEACHER_TASKS.find(item => item.id === task)?.label} · ${lesson}\nBản nháp có hỗ trợ AI, cần giáo viên kiểm tra.\n\n${draft}\n\nĐOẠN TRÍCH ĐƯỢC CUNG CẤP\n${result?.sources.map(item => `[${item.id}] ${item.text}`).join("\n\n")}`; }
  async function copy(value: string) { try { await navigator.clipboard.writeText(value); setNotice("Đã sao chép. Có thể dán vào Word hoặc công cụ đã chọn."); } catch { setNotice("Chưa sao chép được; hãy chọn nội dung để sao chép thủ công."); } }
  return <div className="teacher-ai-workspace">
    <p className="ai-notice" role="status">AI cục bộ · {ready === null ? "Đang kiểm tra kết nối" : ready ? "Sẵn sàng" : "Chưa kết nối; cần khởi động dịch vụ AI trên máy chủ"}</p>
    {demo && <p className="ai-notice">Bản thử dùng kiến thức công khai B21–B25. <Link href="/teacher/ai">Đăng nhập giáo viên</Link> để xử lí tài liệu riêng và bổ sung điều kiện của lớp.</p>}
    <section className="ai-card"><h2>1. Chọn học liệu và bài học</h2>
      <div className="teacher-ai-context"><div><label htmlFor={`${id}-lesson`}>Bài học</label><select id={`${id}-lesson`} value={lesson} disabled={busy} onChange={event => { setLesson(event.target.value); if (demo) setText(teacherLessonText(event.target.value)); clearResult(); }}>{TEACHER_LESSONS.map(item => <option key={item.code} value={item.code}>{item.code} · {item.title}</option>)}</select></div><div><label htmlFor={`${id}-minutes`}>Thời lượng trong giờ (phút)</label><input id={`${id}-minutes`} type="number" min={10} max={120} value={minutes} disabled={busy} onChange={event => { setMinutes(Number(event.target.value)); clearResult(); }}/></div></div>
      {!demo && <><label htmlFor={`${id}-class`}>Điều kiện của lớp (nếu có)</label><input id={`${id}-class`} value={classContext} maxLength={400} disabled={busy} onChange={event => { setClassContext(event.target.value); clearResult(); }} placeholder="Ví dụ: học theo nhóm, dùng một máy chiếu"/><label htmlFor={`${id}-file`}>Đọc tệp TXT, DOCX hoặc PDF có văn bản (tối đa 5 MB; PDF tối đa 30 trang)</label><input id={`${id}-file`} type="file" accept=".txt,.docx,.pdf" disabled={busy} onChange={event => { void upload(event.target.files?.[0]); event.target.value = ""; }}/><button className="btn" type="button" disabled={busy} onClick={() => { setText(teacherLessonText(lesson)); clearResult(); }}>Dùng kiến thức mẫu {lesson}</button></>}
      <label htmlFor={`${id}-text`}>{demo ? "Học liệu mẫu để AI đọc" : `Nội dung để AI đọc · ${text.length.toLocaleString("vi")} / 60.000 kí tự`}</label><textarea id={`${id}-text`} rows={7} maxLength={60000} value={text} readOnly={demo} disabled={busy} onChange={event => { setText(event.target.value); clearResult(); }} placeholder="Dán học liệu hoặc kiểm tra văn bản đọc từ tệp."/>
      <p className="physics-note">Tài liệu riêng được xử lí trên máy chủ AI của hệ thống, không tự gửi sang dịch vụ ngoài hoặc lưu vào kho.</p>
    </section>
    <section className="ai-card"><h2>2. Chọn công việc</h2><div className="teacher-ai-tools" role="group" aria-label="Công cụ AI dành cho giáo viên">{TEACHER_TASKS.map(item => <button className={`btn ${task === item.id ? "primary" : ""}`} type="button" key={item.id} aria-pressed={task === item.id} disabled={busy} onClick={() => { setTask(item.id); clearResult(); }}>{item.label}</button>)}</div>
      {!demo && <><label htmlFor={`${id}-focus`}>Nội dung cần tập trung hoặc yêu cầu thêm</label><textarea id={`${id}-focus`} rows={2} value={focus} maxLength={500} disabled={busy} onChange={event => { setFocus(event.target.value); clearResult(); }} placeholder="Ví dụ: yêu cầu học sinh dự đoán, kiểm tra và tự sửa cách giải thích"/></>}
      <div className="ai-actions"><button className="btn primary" type="button" disabled={busy || ready!==true || text.trim().length < 80 || !Number.isInteger(minutes) || minutes < 10 || minutes > 120} onClick={() => void process()}>{busy ? "Đang xử lí…" : "Tạo bản nháp"}</button>{busy && <button className="btn" type="button" onClick={() => { controller.current?.abort(); controller.current = null; setBusy(false); setNotice("Đã dừng yêu cầu."); }}>Dừng</button>}</div><p className="physics-note">Kiểm tra kiến thức, công thức, thời lượng và nhiệm vụ trước khi dùng. Nhận xét của AI chưa phải thẩm định chuyên môn.</p>
    </section>
    {notice && <p className="ai-notice" role="status">{notice}</p>}
    {result && <section className="ai-card" aria-live="polite"><h2>3. Kiểm tra và chỉnh bản nháp</h2>{result.partial && <p>Học liệu dài: mô hình chỉ đọc các đoạn bên dưới. Bản nháp chưa đại diện toàn bộ tài liệu.</p>}{result.truncated && <p>Phản hồi đã đạt giới hạn độ dài. Thu hẹp yêu cầu và xử lí lại nếu cần.</p>}{result.sourceWarning && <p className="ai-notice">AI chưa dẫn mã đoạn đầy đủ hoặc có mã ngoài học liệu. Đối chiếu từng nhận xét với các đoạn trích bên dưới.</p>}{reviewNotes.map(note => <p className="ai-notice" key={note}>{note}</p>)}{reviewNotes.length > 0 && <p>Sửa các chỗ được nhắc trong mục chỉnh sửa trước khi sao chép hoặc tải bản nháp.</p>}<div className="teacher-ai-output"><AIResponseText text={draft}/></div>
      <details><summary>Chỉnh sửa nội dung trước khi dùng</summary><label htmlFor={`${id}-draft`}>Bản nháp có thể chỉnh sửa</label><textarea id={`${id}-draft`} rows={12} value={draft} maxLength={15000} onChange={event => setDraft(event.target.value)}/></details>
      <details><summary>Các đoạn trích làm căn cứ</summary>{result.sources.map(item => <p key={item.id}><strong>[{item.id}]</strong> {item.text}</p>)}</details>
      <div className="ai-actions"><button className="btn" type="button" disabled={reviewNotes.length > 0} onClick={() => void copy(record())}>Sao chép vào Word</button><button className="btn" type="button" disabled={reviewNotes.length > 0} onClick={() => { const url = URL.createObjectURL(new Blob([record()], { type: "text/plain;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = `${lesson}-${task}-ban-nhap-ai.txt`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 2000); }}>Tải bản nháp TXT</button><Link className="btn" href={demo ? `/hoc-lieu/soan-ke-hoach?template=${lesson}` : `/teacher/plans?template=${lesson}`}>Mở bàn soạn kế hoạch</Link></div>
    </section>}
    <section className="ai-card"><h2>Dùng thêm công cụ AI</h2><p>Chọn công cụ để mở bằng tài khoản của giáo viên. Có thể tạo yêu cầu từ học liệu, kiểm tra nội dung rồi tự sao chép sang công cụ đã chọn.</p><div className="teacher-ai-services">{TEACHER_AI_SERVICES.map(service => <div key={service.name}><h3>{service.name}</h3><p>{service.description}</p><a className="btn" href={service.href} target="_blank" rel="noopener noreferrer">Mở {service.name} ↗</a></div>)}</div>
      <button className="btn" type="button" disabled={busy || text.trim().length < 80} onClick={() => { try { setExternalPrompt(teacherExternalPrompt(text, task, focus, { lesson, minutes, classContext })); } catch (error) { setNotice(error instanceof Error ? error.message : "Chưa tạo được yêu cầu."); } }}>Chuẩn bị yêu cầu để sao chép</button>
      {externalPrompt && <><label htmlFor={`${id}-external`}>Yêu cầu kèm các đoạn học liệu đã chọn</label><textarea id={`${id}-external`} rows={8} readOnly value={externalPrompt}/><button className="btn" type="button" onClick={() => void copy(externalPrompt)}>Sao chép yêu cầu</button></>}
      <p className="physics-note">Web không tự tải tài liệu lên các dịch vụ này. Kiểm tra và bỏ thông tin cá nhân trước khi chia sẻ.</p>
    </section>
  </div>;
}
