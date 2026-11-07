"use client";
/* eslint-disable @next/next/no-img-element -- Scientific question images are also exported unchanged to Word. */
import { useEffect, useRef, useState } from "react";
import papers from "@/data/nuclear-exams.json";
import illustrated from "@/data/illustrated-questions.json";
import pictures from "@/data/question-images.json";
import { EXAM_TYPES, examMatrix, makeExamVersions, selectExamQuestions, validateBankQuestion, parseImportedQuestions, type BankQuestion, type ExamRecipe, type ExamVersion } from "@/lib/teacher-assessment";
import { PREPARATION_ISSUES, ISSUE_IMAGE, preparationActivity } from "@/lib/teacher-preparation";
import { CANONICAL_SYSTEM_MATERIALS } from "@/lib/material-bank";
import { materialToPlanResource } from "@/lib/teaching-plan-templates";
import { checkBrowserDocx } from "@/lib/teacher-docx-import";
import type { ExportImage } from "@/lib/teacher-docx-export";
type LocalImage = ExportImage & { preview: string };
const BANK: BankQuestion[] = [...illustrated, ...papers.flatMap(p => p.questions)].map(q => validateBankQuestion(q));
const INITIAL: ExamRecipe = { title: "Kiểm tra 15 phút Vật lí hạt nhân", type: "short", topics: ["B23"], count: 4, versions: 2, seed: "B23-01", withImages: true };
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 5000);
}
export function TeacherAssessmentStudio({ mode = "exam" }: { mode?: "exam" | "worksheet" | "import" }) {
  const [output, setOutput] = useState<{ url: string; name: string } | null>(null);
  const outputURL = useRef<string | null>(null);
  useEffect(() => () => { if (outputURL.current) URL.revokeObjectURL(outputURL.current); }, []);
  function keepDownload(blob: Blob, name: string) { if (outputURL.current) URL.revokeObjectURL(outputURL.current); outputURL.current = URL.createObjectURL(blob); setOutput({ url: outputURL.current, name }); download(blob, name); }
  const [recipe, setRecipe] = useState(INITIAL), [draft, setDraft] = useState<BankQuestion[]>(() => selectExamQuestions(BANK, INITIAL));
  const [versions, setVersions] = useState<ExamVersion[] | null>(null), [selectedCode, setSelectedCode] = useState("101"), [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState(""), [busy, setBusy] = useState(false), [raw, setRaw] = useState(""), [answerKey, setAnswerKey] = useState("");
  const [confirmed, setConfirmed] = useState(false), [importedImages, setImportedImages] = useState<Map<string, LocalImage>>(new Map());
  const [sheetLesson, setSheetLesson] = useState("B23"), [sheetIssue, setSheetIssue] = useState("B23-half-life"), [sheetSelected, setSheetSelected] = useState(BANK.filter(q => q.imageId === "decay-curve").slice(0, 3).map(q => q.id));
  const [galleryLesson, setGalleryLesson] = useState("B23");
  const questions = mode === "worksheet" ? sheetSelected.flatMap(id => BANK.filter(q => q.id === id)) : draft;
  function patchRecipe(p: Partial<ExamRecipe>) { setRecipe(r => ({ ...r, ...p })); setVersions(null); setDirty(true); }
  function patchQuestion(id: string, changes: Partial<BankQuestion>) { setDraft(d => d.map(q => q.id === id ? { ...q, ...changes } : q)); setVersions(null); setConfirmed(false); }
  function assemble() { try { setDraft(selectExamQuestions(BANK, recipe)); setVersions(null); setDirty(false); setNotice("Đã chọn câu theo phạm vi. Kiểm tra câu, hình và bảng phân bố trước khi xuất."); } catch (e) { setNotice((e as Error).message); } }
  function shuffle() { try { const all = makeExamVersions(draft, recipe.versions, recipe.seed); setVersions(all); setSelectedCode(all[0].code); setNotice(`Đã tạo ${all.length} mã đề dùng cùng tập câu hỏi và tổng điểm. Đáp án đi theo lựa chọn mới.`); } catch (e) { setNotice((e as Error).message); } }
  async function imagesFor(items: BankQuestion[]) {
    const images = new Map<string, ExportImage>(importedImages);
    for (const id of new Set(items.flatMap(q => q.imageId ? [q.imageId] : []))) {
      if (images.has(id)) continue;
      const image = pictures.find(i => i.id === id);
      if (!image) throw new Error(`Không tìm thấy hình ${id}; chưa xuất được.`);
      const response = await fetch(image.url); if (!response.ok) throw new Error(`Chưa tải được ${image.title}.`);
      images.set(id, { data: new Uint8Array(await response.arrayBuffer()), type: "png", width: 1000, height: 540, description: image.description });
    }
    return images;
  }
  async function exportWord(teacher = false) {
    if (busy) return; setBusy(true); setNotice("");
    try {
      const exporter = await import("@/lib/teacher-docx-export");
      if (mode === "worksheet") {
        if (sheetSelected.length < 3 || sheetSelected.length > 9) throw new Error("Chọn 3–9 câu cho phiếu ba pha.");
        const activity = preparationActivity({ lesson: sheetLesson, issueId: sheetIssue, device: "groups", minutes: 15 }, CANONICAL_SYSTEM_MATERIALS.map(materialToPlanResource));
        keepDownload(await exporter.worksheetDocx(sheetLesson, activity, questions, await imagesFor(questions), teacher), `${sheetLesson}-${teacher ? "huong-dan-giao-vien" : "phieu-ba-pha"}.docx`);
      } else {
        if (!recipe.title.trim() || recipe.title.length > 180) throw new Error("Nhập tên đề trước khi xuất.");
        if (dirty || !versions || (mode === "import" && !confirmed)) throw new Error("Kiểm tra đề và tạo các mã đề trước khi xuất.");
        keepDownload(await exporter.assessmentDocx(recipe.title, EXAM_TYPES[recipe.type].minutes, versions, await imagesFor(draft), teacher), `${mode === "import" ? "de-rieng" : recipe.type}-${teacher ? "dap-an" : "cac-ma-de"}.docx`);
      }
      setNotice(teacher ? "Đã tạo Word dành cho giáo viên, có đáp án và hướng dẫn. Nếu trình duyệt hỏi, chọn lưu tệp." : "Đã tạo Word dành cho học sinh, có hình và không kèm đáp án. Nếu trình duyệt hỏi, chọn lưu tệp.");
    } catch (e) { setNotice((e as Error).message); } finally { setBusy(false); }
  }
  async function readFile(file?: File) {
    if (!file) return; setBusy(true); setConfirmed(false); setVersions(null); setNotice("");
    try {
      if (file.size > 5000000) throw new Error("Tệp tối đa 5 MB.");
      if (/\.txt$/i.test(file.name)) { setRaw(await file.text()); setImportedImages(new Map()); }
      else if (/\.docx$/i.test(file.name)) {
        const buffer = await file.arrayBuffer(); checkBrowserDocx(new Uint8Array(buffer));
        const JSZip = (await import("jszip")).default, zip = await JSZip.loadAsync(buffer);
        const xml = await zip.file("word/document.xml")?.async("string");
        if (!xml || new DOMParser().parseFromString(xml, "application/xml").getElementsByTagNameNS("http://schemas.openxmlformats.org/officeDocument/2006/math", "oMath").length) throw new Error("Đề có công thức Word dạng đối tượng toán. Chuyển công thức sang văn bản trước; web chưa đọc đầy đủ dạng này nên chưa tự đảo.");
        const mammoth = await import("mammoth"); const images = new Map<string, LocalImage>(); let count = 0, imageBytes = 0;
        const html = await mammoth.convertToHtml({ arrayBuffer: buffer }, { convertImage: mammoth.images.imgElement(async image => {
          if (!["image/png", "image/jpeg"].includes(image.contentType)) throw new Error("Hình trong DOCX phải là PNG/JPEG; đổi hình vector trước khi nhập.");
          const data = await image.read("base64"); imageBytes += data.length;
          if (imageBytes > 7000000 || ++count > 40) throw new Error("Hình quá nhiều hoặc quá lớn.");
          const id = `import-image-${count}`, uri = `data:${image.contentType};base64,${data}`;
          const img = new Image(); img.src = uri; await img.decode();
          if (img.width * img.height > 20000000) throw new Error("Hình vượt giới hạn kích thước.");
          images.set(id, { data: Uint8Array.from(atob(data), c => c.charCodeAt(0)), type: image.contentType === "image/png" ? "png" : "jpg", width: img.width, height: img.height, preview: uri, description: "Hình từ đề do giáo viên nhập" });
          return { src: id };
        }) });
        const dom = new DOMParser().parseFromString(html.value, "text/html");
        dom.querySelectorAll("sup,sub").forEach(tag => tag.replaceWith(dom.createTextNode(`${tag.tagName === "SUP" ? "^" : "_"}(${tag.textContent})`)));
        dom.querySelectorAll("img").forEach(img => img.replaceWith(dom.createTextNode(` [[HINH:${img.getAttribute("src")}]] `)));
        const text = Array.from(dom.querySelectorAll("p")).map(p => p.textContent).join("\n");
        if (text.length > 60000 || dom.querySelector("table")) throw new Error("Đề có bảng hoặc quá dài; chuẩn hóa câu theo từng đoạn và phương án A–D trước khi nhập.");
        setRaw(text); setImportedImages(images);
        setNotice(`Đã đọc văn bản và ${count} hình. ${html.messages.length ? "Có cấu trúc Word chưa được chuyển đầy đủ; kiểm tra đặc biệt công thức, kí hiệu và hình." : "Kiểm tra lại nội dung và hình trước khi đảo."}`);
      } else throw new Error("Chỉ nhập TXT hoặc DOCX. PDF/quét ảnh cần chuẩn hóa trước để tránh mất cấu trúc.");
    } catch (e) { setNotice((e as Error).message); setRaw(""); setImportedImages(new Map()); } finally { setBusy(false); }
  }
  function parse() {
    try {
      const blocks = raw.split(/(?=^\s*Câu\s+\d+\s*[.:])/m), keys = new Map(answerKey.split(/\n|;/).filter(s => s.trim()).map(line => {
        const m = line.trim().match(/^(\d+)\s*[:.\-]\s*([A-D])$/i); if (!m) throw new Error("Khóa đáp án mỗi dòng dạng 1:A, 2:C."); return [Number(m[1]), m[2].toUpperCase()] as const;
      }));
      const merged = blocks.map(block => { const m = block.match(/^\s*Câu\s+(\d+)\s*[.:]/); return m && !/(?:Đáp án|ĐA)\s*:/i.test(block) && keys.has(Number(m[1])) ? `${block}\nĐáp án: ${keys.get(Number(m[1]))}\n` : block; }).join("");
      const result = parseImportedQuestions(merged, recipe.topics[0]);
      result.questions.forEach(q => {
        const tokens = q.prompt.match(/\[\[HINH:([^\]]+)\]\]/g) ?? [];
        if (tokens.length > 1 || q.options!.some(o => o.includes("[[HINH:"))) throw new Error("Mỗi câu chỉ hỗ trợ một hình ở phần dẫn, chưa đảo hình trong các phương án. Chuẩn hóa trước khi nhập.");
        if (tokens[0]) { const id = tokens[0].slice(7, -2); if (!importedImages.has(id)) throw new Error("Chưa đọc được hình của câu."); q.imageId = id; q.prompt = q.prompt.replace(tokens[0], "").trim(); }
      });
      setDraft(result.questions); setDirty(false); setVersions(null); setConfirmed(false);
      setNotice(`Đọc được ${result.questions.length} câu. ${result.warnings.join(" ")} Giữ điểm ghi ở đầu câu; câu chưa ghi điểm tạm có 1 điểm. Kiểm tra từng câu, hình và đáp án bên dưới.`);
    } catch (e) { setNotice((e as Error).message); setVersions(null); setConfirmed(false); }
  }
  const shown = versions?.find(v => v.code === selectedCode)?.questions ?? questions;
  return <section className="teacher-assessment-studio">
    <section className="ai-card"><h2>{mode === "worksheet" ? "Phiếu học tập có hình trong ba pha" : mode === "import" ? "Đọc và đảo đề của giáo viên" : "Tạo đề từ ngân hàng câu hỏi có hình"}</h2><p>{mode === "worksheet" ? "Chọn bài, vấn đề cần hỗ trợ và câu hỏi. Phiếu học sinh và hướng dẫn giáo viên được xuất riêng." : "Chọn câu theo phạm vi B21–B25, kiểm tra hình và ma trận rồi xuất Word. Các mã đề giữ cùng câu hỏi, chỉ đổi thứ tự câu và lựa chọn phù hợp."}</p>
    {mode === "exam" && <div className="planning-actions">{([["short", "Đề 15 phút B23", ["B23"], 4, true], ["midterm", "Đề giữa kỳ B21–B23", ["B21", "B22", "B23"], 18, false], ["final", "Đề cuối kỳ B21–B25", ["B21", "B22", "B23", "B24", "B25"], 20, false]] as const).map(([type, label, topics, count, withImages]) => <button className="btn" key={type} onClick={() => { const r: ExamRecipe = { ...recipe, type, title: label, topics: [...topics], count, withImages }; setRecipe(r); setDraft(selectExamQuestions(BANK, r)); setVersions(null); setDirty(false); setNotice("Đã mở đề mẫu theo phạm vi; kiểm tra câu và hình rồi tạo mã đề."); }}>{label}</button>)}</div>}
    {mode !== "worksheet" ? <><div className="teacher-ai-context"><label>Tên đề<input maxLength={180} value={recipe.title} onChange={e => patchRecipe({ title: e.target.value })}/></label><label>Loại bài kiểm tra<select value={recipe.type} onChange={e => { const type = e.target.value as ExamRecipe["type"]; patchRecipe({ type, count: EXAM_TYPES[type].defaultCount, title: EXAM_TYPES[type].label }); }}>{Object.entries(EXAM_TYPES).map(([key, value]) => <option key={key} value={key}>{value.label} · {value.minutes} phút</option>)}</select></label></div>
      <fieldset><legend>Phạm vi bài học</legend><div className="planning-actions">{["B21", "B22", "B23", "B24", "B25"].map(topic => <label key={topic}><input type={mode === "import" ? "radio" : "checkbox"} name="import-topic" checked={recipe.topics.includes(topic)} onChange={() => patchRecipe({ topics: mode === "import" ? [topic] : recipe.topics.includes(topic) ? recipe.topics.filter(t => t !== topic) : [...recipe.topics, topic].sort() })}/>{topic}</label>)}</div></fieldset>
      <div className="teacher-ai-context">{mode === "exam" && <label>Số câu<input type="number" min={1} max={40} value={recipe.count} onChange={e => patchRecipe({ count: Number(e.target.value) })}/></label>}<label>Số mã đề (1–8)<input type="number" min={1} max={8} value={recipe.versions} onChange={e => { setRecipe(r => ({ ...r, versions: Number(e.target.value) })); setVersions(null); }}/></label><label>Mã lưu lượt chọn và đảo<input maxLength={100} value={recipe.seed} onChange={e => { setRecipe(r => ({ ...r, seed: e.target.value })); setVersions(null); if (mode === "exam") setDirty(true); }}/></label></div>
      {mode === "exam" && <><label><input type="checkbox" checked={recipe.withImages} onChange={e => patchRecipe({ withImages: e.target.checked })}/>Chỉ chọn câu có hình gắn sẵn</label><p>{BANK.length} câu trong ngân hàng, {illustrated.length} câu có hình. Web phân bố số câu gần đều giữa các bài được chọn; giáo viên kiểm tra mức độ và điểm trong ma trận.</p><button className="btn primary" onClick={assemble}>Chọn câu cho đề</button></>}
      {mode === "import" && <><label>Nhập đề TXT/DOCX trên thiết bị<input type="file" accept=".txt,.docx" disabled={busy} onChange={e => { void readFile(e.target.files?.[0]); e.target.value = ""; }}/></label><p>Tệp được đọc trong trình duyệt, không tự gửi lên AI. Hỗ trợ trắc nghiệm bốn phương án, mỗi phương án một dòng; một hình PNG/JPEG ở phần dẫn. Công thức Word dạng đối tượng toán, bảng và hình trong phương án cần chuẩn hóa trước.</p><details><summary>Xem mẫu cấu trúc để nhập</summary><pre>{"Câu 1. Một hạt nhân có A = 14, Z = 6. Số neutron là bao nhiêu?\nA. 6\nB. 8\nC. 14\nD. 20\nĐáp án: B"}</pre></details><label>Văn bản đề để kiểm tra<textarea rows={10} maxLength={60000} value={raw} onChange={e => { setRaw(e.target.value); setVersions(null); setConfirmed(false); }}/></label><label>Khóa đáp án nếu đề chưa ghi đáp án (mỗi dòng 1:A)<textarea rows={3} value={answerKey} maxLength={5000} onChange={e => { setAnswerKey(e.target.value); setVersions(null); setConfirmed(false); }}/></label><button className="btn primary" disabled={busy} onClick={parse}>Đọc cấu trúc câu và đáp án</button><label><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}/>Tôi đã kiểm tra câu hỏi, hình, công thức và khóa đáp án được đọc</label></>}
    </> : <><div className="teacher-ai-context"><label>Bài học của phiếu<select value={sheetLesson} onChange={e => { const code = e.target.value; setSheetLesson(code); setSheetIssue(PREPARATION_ISSUES.find(i => i.lesson === code)!.id); setSheetSelected(BANK.filter(q => q.imageId === ISSUE_IMAGE[PREPARATION_ISSUES.find(i => i.lesson === code)!.id]).slice(0, 3).map(q => q.id)); }}>{["B21", "B22", "B23", "B24", "B25"].map(t => <option key={t}>{t}</option>)}</select></label><label>Vấn đề cần hỗ trợ<select value={sheetIssue} onChange={e => { setSheetIssue(e.target.value); setSheetSelected(BANK.filter(q => q.imageId === ISSUE_IMAGE[e.target.value]).slice(0, 3).map(q => q.id)); }}>{PREPARATION_ISSUES.filter(i => i.lesson === sheetLesson).map(i => <option key={i.id} value={i.id}>{i.title}</option>)}</select></label></div><fieldset><legend>Chọn 3–9 câu cho phiếu (câu 1,4,7 trước giờ; 2,5,8 trong giờ; 3,6,9 sau giờ)</legend>{BANK.filter(q => q.topic === sheetLesson && q.imageId === ISSUE_IMAGE[sheetIssue]).map(q => <label className="exam-option" key={q.id}><input type="checkbox" checked={sheetSelected.includes(q.id)} onChange={() => setSheetSelected(s => s.includes(q.id) ? s.filter(id => id !== q.id) : [...s, q.id])}/>{q.prompt}</label>)}</fieldset><p>Thứ tự hiện tại bên dưới là thứ tự chọn câu; hình được lọc theo vấn đề của phiếu. Giáo viên điều chỉnh các nhiệm vụ và hình trong Word sau khi xuất.</p></>}
    </section>
    <section className="ai-card"><h2>Ngân hàng hình cho câu hỏi</h2><label>Lọc hình theo bài<select value={galleryLesson} onChange={e => setGalleryLesson(e.target.value)}>{["B21", "B22", "B23", "B24", "B25"].map(t => <option key={t}>{t}</option>)}</select></label><div className="question-image-gallery">{pictures.filter(i => i.lesson === galleryLesson).map(i => <figure key={i.id}><img src={i.url} alt={i.description}/><figcaption><strong>{i.title}</strong><p>{i.description}</p><a className="btn small" href={i.url} download>Tải hình PNG để chèn vào đề</a><a className="btn small" href={i.svgUrl} download>Tải sơ đồ SVG để chỉnh kích thước</a></figcaption></figure>)}</div></section>
    {notice && <p className="ai-notice" role="status">{notice}</p>}
    {mode !== "worksheet" && <section className="ai-card"><h2>Bảng phân bố câu và điểm của đề</h2><div className="assessment-matrix"><table><thead><tr><th>Bài</th><th>Mức độ</th><th>Số câu</th><th>Điểm</th><th>Có hình</th></tr></thead><tbody>{examMatrix(draft).map(r => <tr key={`${r.topic}-${r.level}`}><td>{r.topic}</td><td>{r.level}</td><td>{r.count}</td><td>{Number(r.points.toFixed(3))}</td><td>{r.images}</td></tr>)}</tbody></table></div><p>Tổng {draft.length} câu · {Number(draft.reduce((n, q) => n + q.points, 0).toFixed(3))} điểm. Đây là phân bố của tập câu, chưa phải đề được thẩm định.</p><button className="btn primary" disabled={busy || dirty || (mode === "import" && !confirmed)} onClick={shuffle}>Tạo các mã đề và cập nhật đáp án</button>{dirty && <p>Yêu cầu chọn đề đã thay đổi; nhấn “Chọn câu cho đề” để tạo lại. Với đề nhập, đọc lại cấu trúc sau khi đổi phạm vi.</p>}{versions && <label>Xem mã đề<select value={selectedCode} onChange={e => setSelectedCode(e.target.value)}>{versions.map(v => <option value={v.code} key={v.code}>{v.code}</option>)}</select></label>}</section>}
    <section className="ai-card"><h2>{mode === "worksheet" ? "Câu hỏi trong phiếu" : "Kiểm tra từng câu và hình"}</h2><p>Đáp án chỉ hiển thị cho giáo viên tại đây; bản Word học sinh xuất riêng.</p>{shown.map((q, i) => <article className="teacher-bank-question" key={q.id}><h3>Câu {i + 1} · {q.topic} · {q.level} · {q.points} điểm</h3><p>{q.prompt}</p>{q.imageId && (pictures.find(p => p.id === q.imageId) ? <img src={pictures.find(p => p.id === q.imageId)!.url} alt={pictures.find(p => p.id === q.imageId)!.description}/> : importedImages.has(q.imageId) ? <img src={importedImages.get(q.imageId)!.preview} alt="Hình từ đề nhập"/> : <p>Chưa đọc được hình.</p>)}{q.options?.map((o, j) => <p key={j}>{"ABCD"[j]}. {o}</p>)}<details><summary>Đáp án và căn cứ để giáo viên kiểm tra</summary><p>{q.kind === "choice" ? `Đáp án ${"ABCD"[q.answer!]}. ` : ""}{q.explanation}</p>{q.statements?.map((s, j) => <p key={j}>{s.text}: {s.answer ? "Đúng" : "Sai"}; {s.explanation}</p>)}<p>{q.source ?? "Ngân hàng đề mẫu B21–B25 đã có trong kho."}</p></details>{!versions && mode !== "worksheet" && <details><summary>Chỉnh câu này trước khi đảo</summary><div className="teacher-ai-context"><label>Bài của câu<select value={q.topic} onChange={e => patchQuestion(q.id, { topic: e.target.value })}>{["B21", "B22", "B23", "B24", "B25"].map(t => <option key={t}>{t}</option>)}</select></label><label>Mức độ câu<select value={q.level} onChange={e => patchQuestion(q.id, { level: e.target.value })}>{["Nhận biết", "Thông hiểu", "Vận dụng", "Giáo viên phân loại"].map(l => <option key={l}>{l}</option>)}</select></label></div><label>Nội dung câu hỏi<textarea rows={3} value={q.prompt} maxLength={4000} onChange={e => patchQuestion(q.id, { prompt: e.target.value })}/></label>{q.options?.map((o, j) => <label key={j}>Phương án {"ABCD"[j]}<input value={o} maxLength={2000} onChange={e => patchQuestion(q.id, { options: q.options!.map((old, k) => k === j ? e.target.value : old) })}/></label>)}{q.kind === "choice" && <label>Đáp án đúng<select value={q.answer} onChange={e => patchQuestion(q.id, { answer: Number(e.target.value) })}>{[0, 1, 2, 3].map(n => <option value={n} key={n}>{"ABCD"[n]}</option>)}</select></label>}{q.kind === "numeric" && <div className="teacher-ai-context"><label>Đáp án số<input type="number" value={q.answer ?? ""} onChange={e => patchQuestion(q.id, { answer: Number(e.target.value) })}/></label><label>Đơn vị<input value={q.unit ?? ""} maxLength={100} onChange={e => patchQuestion(q.id, { unit: e.target.value })}/></label></div>}{q.statements?.map((st, si) => <div key={si}><label>Ý đúng sai {si + 1}<textarea rows={2} value={st.text} maxLength={2000} onChange={e => patchQuestion(q.id, { statements: q.statements!.map((old, k) => k === si ? { ...old, text: e.target.value } : old) })}/></label><label>Đáp án ý {si + 1}<select value={String(st.answer)} onChange={e => patchQuestion(q.id, { statements: q.statements!.map((old, k) => k === si ? { ...old, answer: e.target.value === "true" } : old) })}><option value="true">Đúng</option><option value="false">Sai</option></select></label><label>Giải thích ý {si + 1}<textarea rows={2} value={st.explanation} maxLength={2000} onChange={e => patchQuestion(q.id, { statements: q.statements!.map((old, k) => k === si ? { ...old, explanation: e.target.value } : old) })}/></label></div>)}<label>Điểm câu<input type="number" min={0.25} max={10} step={0.25} value={q.points} onChange={e => patchQuestion(q.id, { points: Number(e.target.value) })}/></label>{q.rubric?.map((r, ri) => <div className="teacher-ai-context" key={ri}><label>Tiêu chí tự luận {ri + 1}<input value={r.text} maxLength={2000} onChange={e => patchQuestion(q.id, { rubric: q.rubric!.map((old, k) => k === ri ? { ...old, text: e.target.value } : old) })}/></label><label>Điểm tiêu chí {ri + 1}<input type="number" min={0.01} max={10} step={0.01} value={r.points} onChange={e => patchQuestion(q.id, { rubric: q.rubric!.map((old, k) => k === ri ? { ...old, points: Number(e.target.value) } : old) })}/></label></div>)}<label>Lời giải<textarea rows={2} value={q.explanation ?? ""} maxLength={2000} onChange={e => patchQuestion(q.id, { explanation: e.target.value })}/></label></details>}</article>)}</section>
    <section className="ai-card"><h2>Xuất Word có hình</h2><div className="planning-actions"><button className="btn primary" disabled={busy || (mode !== "worksheet" && (!versions || dirty || (mode === "import" && !confirmed)))} onClick={() => void exportWord(false)}>{busy ? "Đang tạo Word…" : mode === "worksheet" ? "Tải phiếu học sinh Word" : "Tải các mã đề Word"}</button><button className="btn" disabled={busy || (mode !== "worksheet" && (!versions || dirty || (mode === "import" && !confirmed)))} onClick={() => void exportWord(true)}>{mode === "worksheet" ? "Tải hướng dẫn giáo viên Word" : "Tải đáp án và ma trận Word"}</button></div>{output && <p><a className="btn" href={output.url} download={output.name}>Tải lại tệp vừa tạo: {output.name}</a></p>}<p>Đề và phiếu dùng hình khoa học của kho, không để mô hình ngôn ngữ tự vẽ dữ kiện. File Word vẫn chỉnh sửa được. Công cụ chưa chứng minh các mã đề tương đương về độ khó; giáo viên rà soát trước khi dùng.</p></section>
  </section>;
}
