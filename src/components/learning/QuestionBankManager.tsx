"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { extractQuestionsFromPdf, saveExtractedQuestions } from "@/app/teacher/pdf-action";
import type { ParsedQuestion } from "@/app/teacher/pdf-action";
import { legacyNuclearMath } from "@/lib/legacy-nuclear-math";
import { RichPhysicsText } from "./RichPhysicsText";

export type AssessmentQuestion = {
  id: string;
  question_type: string;
  difficulty: string;
  content: {
    prompt: string;
    options?: string[];
    correctAnswer: string;
    sampleAnswer?: string;
    explanation?: string;
    statements?: { text: string; isCorrect: boolean }[];
  };
  is_published: boolean;
};

export function QuestionBankManager({ lessonId, questions, availablePdfs = [] }: { lessonId: string; questions: AssessmentQuestion[]; availablePdfs?: {id: string, title: string, content_url: string}[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [type, setType] = useState("single_choice");
  const [difficulty, setDifficulty] = useState("nhan_biet");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [tfStatements, setTfStatements] = useState([{text: "", isCorrect: true}, {text: "", isCorrect: false}]);
  const [saving, setSaving] = useState(false);
  
  // PDF Extraction states
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState("");
  const [draftQuestions, setDraftQuestions] = useState<ParsedQuestion[] | null>(null);
  const [selectedDraftIds, setSelectedDraftIds] = useState<Set<string>>(new Set());

  const supabase = createClient();

  function resetForm() {
    setType("single_choice");
    setDifficulty("nhan_biet");
    setPrompt("");
    setAnswer("");
    setOptions(["", "", "", ""]);
    setTfStatements([{text: "", isCorrect: true}, {text: "", isCorrect: false}]);
    setIsAdding(false);
    setEditingId(null);
  }

  function openEdit(q: AssessmentQuestion) {
    setType(q.question_type);
    setDifficulty(q.difficulty);
    setPrompt(q.content.prompt);
    setAnswer(q.content.sampleAnswer ?? q.content.correctAnswer ?? "");
    setOptions(q.content.options || ["", "", "", ""]);
    setTfStatements(q.content.statements || [{text: "", isCorrect: true}, {text: "", isCorrect: false}]);
    setEditingId(q.id);
    setIsAdding(false);
    setIsExtracting(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (type !== "true_false" && (!prompt || !answer)) return;
    if (type === "true_false" && (!prompt || tfStatements.length === 0)) return;
    setSaving(true);
    const priorContent = questions.find(question => question.id === editingId)?.content;
    const content = {
      ...priorContent,
      prompt, 
      correctAnswer: type === "true_false" ? "Xem statements" : answer, 
      sampleAnswer: type === "short_answer" ? answer : undefined,
      options: type === "single_choice" ? options : [],
      statements: type === "true_false" ? tfStatements : []
    };
    
    if (editingId) {
      const { error } = await supabase.from("phase_assessment_questions").update({
        question_type: type,
        difficulty,
        content
      }).eq("id", editingId).eq("lesson_id", lessonId);
      if (error) alert("Không thể cập nhật: " + error.message);
      else window.location.reload();
    } else {
      const { error } = await supabase.from("phase_assessment_questions").insert({
        lesson_id: lessonId,
        question_type: type,
        difficulty,
        content,
        is_published: false
      });
      if (error) alert("Không thể thêm: " + error.message);
      else window.location.reload();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này không?")) return;
    setDeletingId(id);
    const { error } = await supabase.from("phase_assessment_questions").delete().eq("id", id).eq("lesson_id", lessonId);
    if (error) {
      alert("Lỗi khi xóa: " + error.message);
      setDeletingId(null);
    } else {
      window.location.reload();
    }
  }

  async function handleExtractStart() {
    setSaving(true);
    const { questions: extracted, error } = await extractQuestionsFromPdf(lessonId, selectedPdfUrl);
    setSaving(false);
    
    if (error) {
      alert(error);
    } else if (extracted && extracted.length > 0) {
      setDraftQuestions(extracted);
      setSelectedDraftIds(new Set(extracted.map(q => q.id)));
      setIsExtracting(false);
    } else {
      alert("Không tìm thấy câu hỏi nào trong PDF này.");
    }
  }

  function updateDraft(id: string, updates: Partial<ParsedQuestion>) {
    setDraftQuestions(prev => prev!.map(q => q.id === id ? { ...q, ...updates } : q));
  }

  function toggleDraftSelection(id: string) {
    const next = new Set(selectedDraftIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedDraftIds(next);
  }

  async function handleSaveDrafts() {
    if (!draftQuestions) return;
    const selected = draftQuestions.filter(q => selectedDraftIds.has(q.id));
    if (selected.length === 0) return alert("Vui lòng chọn ít nhất 1 câu hỏi.");
    
    for (const q of selected) {
      if (!q.correctAnswer) return alert(`Câu "${q.prompt.substring(0, 30)}..." chưa có đáp án đúng.`);
      if (q.question_type === "single_choice") {
         if (q.options.length < 2) return alert(`Câu trắc nghiệm "${q.prompt.substring(0, 30)}..." phải có ít nhất 2 phương án.`);
         if (!q.options.includes(q.correctAnswer)) return alert(`Đáp án đúng phải khớp với một trong các phương án (câu: "${q.prompt.substring(0, 30)}...").`);
      }
    }
    
    setSaving(true);
    
    const result = await saveExtractedQuestions(lessonId, selected);
    
    setSaving(false);
    if (!result.success) {
      alert("Lỗi khi lưu bản nháp: " + result.error);
    } else if (result.count === 0) {
      alert(result.message || "Không có câu nào mới được lưu.");
      setDraftQuestions(null);
    } else {
      alert(`Đã lưu thành công ${result.count} câu hỏi vào ngân hàng!`);
      window.location.reload();
    }
  }

  if (draftQuestions) {
    return (
      <section className="card" style={{ marginTop: "24px", padding: "24px", border: "2px solid var(--color-primary)" }}>
        <header style={{ marginBottom: "16px" }}>
          <h2 style={{ color: "var(--color-primary)" }}>Duyệt bản nháp trích xuất ({draftQuestions.length} câu)</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "8px" }}>
            Đánh dấu chọn các câu muốn lưu. Sửa trực tiếp nội dung, loại câu và đáp án (nếu thiếu). Không đoán đáp án bừa.
          </p>
        </header>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
          {draftQuestions.map((q) => {
            const isSelected = selectedDraftIds.has(q.id);
            return (
              <div key={q.id} style={{ padding: "16px", border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", opacity: isSelected ? 1 : 0.6, backgroundColor: "var(--bg-surface-elevated)", transition: "all 0.2s" }}>
                 <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
                   <input type="checkbox" checked={isSelected} onChange={() => toggleDraftSelection(q.id)} style={{ marginTop: "4px", width: "18px", height: "18px", cursor: "pointer" }} />
                   <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                     <div style={{ display: "flex", gap: "16px" }}>
                        <div style={{ flex: 1 }}>
                          <label>Loại câu hỏi</label>
                          <select className="form-input" value={q.question_type} onChange={e => updateDraft(q.id, { question_type: e.target.value })}>
                            <option value="single_choice">Một đáp án đúng</option>
                            <option value="true_false">Đúng / Sai</option>
                            <option value="short_answer">Trả lời ngắn</option>
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label>Mức độ</label>
                          <select className="form-input" value={q.difficulty} onChange={e => updateDraft(q.id, { difficulty: e.target.value })}>
                            <option value="nhan_biet">Nhận biết</option>
                            <option value="thong_hieu">Thông hiểu</option>
                            <option value="van_dung">Vận dụng</option>
                            <option value="van_dung_cao">Vận dụng cao</option>
                          </select>
                        </div>
                     </div>
                     <div>
                       <label>Nội dung câu hỏi</label>
                       <textarea className="form-input" value={q.prompt} onChange={e => updateDraft(q.id, { prompt: e.target.value })} rows={3} />
                     </div>
                     {q.question_type === "single_choice" && (
                        <div>
                          <label>Các lựa chọn (mỗi dòng 1 phương án)</label>
                          <textarea className="form-input" value={q.options.join("\n")} onChange={e => updateDraft(q.id, { options: e.target.value.split("\n").filter(Boolean) })} rows={4} />
                        </div>
                     )}
                     <div>
                       <label>Đáp án đúng (chính xác từng chữ)</label>
                       <input className="form-input" value={q.correctAnswer} onChange={e => updateDraft(q.id, { correctAnswer: e.target.value })} placeholder="VD: Đáp án A, hoặc điền số nếu trả lời ngắn" />
                     </div>
                   </div>
                 </div>
              </div>
            );
          })}
        </div>
        
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button className="btn" onClick={() => setDraftQuestions(null)}>Hủy trích xuất</button>
          <button className="btn primary" onClick={handleSaveDrafts} disabled={saving || selectedDraftIds.size === 0}>
            {saving ? "Đang lưu..." : `Lưu ${selectedDraftIds.size} câu đã chọn`}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="card" style={{ marginTop: "24px", padding: "24px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <h2>Ngân hàng câu hỏi</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn secondary" onClick={() => { setIsExtracting(!isExtracting); setIsAdding(false); }}>Trích xuất từ PDF</button>
          <button className="btn" onClick={() => { resetForm(); setIsAdding(!isAdding); setIsExtracting(false); }}>+ Thêm câu hỏi</button>
        </div>
      </header>

      {isExtracting && (
        <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
          <h3 style={{ fontSize: "15px", marginBottom: "12px", color: "var(--text-primary)" }}>Trích xuất câu hỏi từ PDF</h3>
          {availablePdfs && availablePdfs.length > 0 ? (
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "250px" }}>
                <label>Chọn file PDF nguồn</label>
                <select className="form-input" value={selectedPdfUrl} onChange={e => setSelectedPdfUrl(e.target.value)}>
                   <option value="">-- Chọn file PDF --</option>
                   {availablePdfs.map(pdf => (
                     <option key={pdf.id} value={pdf.content_url}>{pdf.title}</option>
                   ))}
                </select>
              </div>
              <button className="btn primary" onClick={handleExtractStart} disabled={!selectedPdfUrl || saving}>
                {saving ? "Đang đọc & xử lý..." : "Bắt đầu trích xuất"}
              </button>
            </div>
          ) : (
          <p style={{ color: "var(--semantic-danger)", margin: 0 }}>Bạn chưa tải lên file PDF nào cho bài học này. Vui lòng tải lên ở mục &quot;Bài tập / Nhiệm vụ&quot; phía trên.</p>
          )}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px", padding: "16px", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label>Loại câu hỏi</label>
              <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="single_choice">Một đáp án đúng</option>
                <option value="true_false">Đúng / Sai</option>
                <option value="short_answer">Trả lời ngắn</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Mức độ</label>
              <select className="form-input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="nhan_biet">Nhận biết</option>
                <option value="thong_hieu">Thông hiểu</option>
                <option value="van_dung">Vận dụng</option>
                <option value="van_dung_cao">Vận dụng cao</option>
              </select>
            </div>
          </div>
          <div>
            <label>Nội dung câu hỏi</label>
            <textarea className="form-input" required value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          </div>
          {type === "single_choice" && (
            <div>
              <label>Các lựa chọn</label>
              {options.map((opt, i) => (
                <input key={i} className="form-input" style={{ marginBottom: "8px" }} placeholder={`Lựa chọn ${i + 1}`} value={opt} onChange={(e) => {
                  const newOpts = [...options];
                  newOpts[i] = e.target.value;
                  setOptions(newOpts);
                }} />
              ))}
            </div>
          )}
          {type === "true_false" && (
            <div>
              <label>Các ý (Phát biểu)</label>
              {tfStatements.map((stmt, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input className="form-input" style={{ flex: 1 }} placeholder={`Ý ${i + 1}`} value={stmt.text} onChange={(e) => {
                    const newStmts = [...tfStatements];
                    newStmts[i].text = e.target.value;
                    setTfStatements(newStmts);
                  }} />
                  <select className="form-input" style={{ width: "100px" }} value={stmt.isCorrect ? "true" : "false"} onChange={(e) => {
                    const newStmts = [...tfStatements];
                    newStmts[i].isCorrect = e.target.value === "true";
                    setTfStatements(newStmts);
                  }}>
                    <option value="true">Đúng</option>
                    <option value="false">Sai</option>
                  </select>
                  <button type="button" className="btn danger" onClick={() => {
                    const newStmts = tfStatements.filter((_, idx) => idx !== i);
                    setTfStatements(newStmts);
                  }}>Xóa</button>
                </div>
              ))}
              <button type="button" className="btn" onClick={() => setTfStatements([...tfStatements, {text: "", isCorrect: true}])}>+ Thêm ý</button>
            </div>
          )}
          {type !== "true_false" && (
            <div>
              <label>Đáp án đúng</label>
              <input className="form-input" required value={answer} onChange={(e) => setAnswer(e.target.value)} />
            </div>
          )}
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "12px" }}>
            <button type="button" className="btn" onClick={resetForm}>Hủy</button>
            <button type="submit" className="btn primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu câu hỏi"}</button>
          </div>
        </form>
      )}

      {questions.length === 0 && !isAdding ? (
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>Chưa có câu hỏi trong ngân hàng.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {questions.map((q, i) => (
            editingId === q.id ? (
              <form key={q.id} onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", backgroundColor: "var(--bg-surface-elevated)", borderRadius: "var(--radius-md)" }}>
                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <label>Loại câu hỏi</label>
                    <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="single_choice">Một đáp án đúng</option>
                      <option value="true_false">Đúng / Sai</option>
                      <option value="short_answer">Trả lời ngắn</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Mức độ</label>
                    <select className="form-input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                      <option value="nhan_biet">Nhận biết</option>
                      <option value="thong_hieu">Thông hiểu</option>
                      <option value="van_dung">Vận dụng</option>
                      <option value="van_dung_cao">Vận dụng cao</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label>Nội dung câu hỏi</label>
                  <textarea className="form-input" required value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                </div>
                {type === "single_choice" && (
                  <div>
                    <label>Các lựa chọn</label>
                    {options.map((opt, i) => (
                      <input key={i} className="form-input" style={{ marginBottom: "8px" }} placeholder={`Lựa chọn ${i + 1}`} value={opt} onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[i] = e.target.value;
                        setOptions(newOpts);
                      }} />
                    ))}
                  </div>
                )}
                {type === "true_false" && (
                  <div>
                    <label>Các ý (Phát biểu)</label>
                    {tfStatements.map((stmt, i) => (
                      <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                        <input className="form-input" style={{ flex: 1 }} placeholder={`Ý ${i + 1}`} value={stmt.text} onChange={(e) => {
                          const newStmts = [...tfStatements];
                          newStmts[i].text = e.target.value;
                          setTfStatements(newStmts);
                        }} />
                        <select className="form-input" style={{ width: "100px" }} value={stmt.isCorrect ? "true" : "false"} onChange={(e) => {
                          const newStmts = [...tfStatements];
                          newStmts[i].isCorrect = e.target.value === "true";
                          setTfStatements(newStmts);
                        }}>
                          <option value="true">Đúng</option>
                          <option value="false">Sai</option>
                        </select>
                        <button type="button" className="btn danger" onClick={() => {
                          const newStmts = tfStatements.filter((_, idx) => idx !== i);
                          setTfStatements(newStmts);
                        }}>Xóa</button>
                      </div>
                    ))}
                    <button type="button" className="btn" onClick={() => setTfStatements([...tfStatements, {text: "", isCorrect: true}])}>+ Thêm ý</button>
                  </div>
                )}
                {type !== "true_false" && (
                  <div>
                    <label>Đáp án đúng</label>
                    <input className="form-input" required value={answer} onChange={(e) => setAnswer(e.target.value)} />
                  </div>
                )}
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "12px" }}>
                  <button type="button" className="btn" onClick={resetForm}>Hủy</button>
                  <button type="submit" className="btn primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
                </div>
              </form>
            ) : (
              <div key={q.id} style={{ padding: "16px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-page)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
                  <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>Câu {i + 1}</strong>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "100px", backgroundColor: "var(--bg-surface-elevated)", color: "var(--text-secondary)" }}>{q.difficulty}</span>
                    <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "100px", backgroundColor: "var(--bg-surface-elevated)", color: "var(--text-secondary)" }}>{q.question_type}</span>
                  </div>
                </div>
                <div style={{ margin: "0 0 12px", fontSize: "14px", color: "var(--text-primary)" }}><RichPhysicsText compact content={legacyNuclearMath(q.content.prompt)} /></div>
                
                {q.question_type === "single_choice" && q.content.options && q.content.options.length > 0 && (
                  <ol style={{ paddingLeft: "20px", marginBottom: "12px", fontSize: "14px" }}>
                    {q.content.options.map((opt, idx) => (
                      <li key={idx} style={{ marginBottom: "4px" }}><RichPhysicsText compact content={legacyNuclearMath(opt)} /></li>
                    ))}
                  </ol>
                )}

                {q.question_type === "true_false" && q.content.statements && q.content.statements.length > 0 && (
                  <ol style={{ paddingLeft: "20px", marginBottom: "12px", fontSize: "14px" }}>
                    {q.content.statements.map((stmt, idx) => (
                      <li key={idx} style={{ marginBottom: "4px" }}>
                        <RichPhysicsText compact content={legacyNuclearMath(stmt.text)} /> <strong style={{ color: stmt.isCorrect ? "var(--semantic-success)" : "var(--semantic-error)" }}>({stmt.isCorrect ? "Đúng" : "Sai"})</strong>
                      </li>
                    ))}
                  </ol>
                )}

                <div style={{ backgroundColor: "var(--bg-surface)", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
                  <strong style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>ĐÁP ÁN ĐÚNG</strong>
                  {q.question_type === "true_false" ? (
                    <p style={{ margin: 0, color: "var(--semantic-success)", fontSize: "14px", fontWeight: 500 }}>Xem phần phát biểu ở trên</p>
                  ) : (
                    <div style={{ margin: 0, color: "var(--semantic-success)", fontSize: "14px", fontWeight: 500 }}><RichPhysicsText compact content={legacyNuclearMath(q.content.sampleAnswer ?? q.content.correctAnswer ?? "")} /></div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button type="button" className="btn" onClick={() => openEdit(q)}>Sửa</button>
                  <button type="button" className="btn danger" disabled={deletingId === q.id} onClick={() => void handleDelete(q.id)}>{deletingId === q.id ? "Đang xóa..." : "Xóa"}</button>
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </section>
  );
}

