"use client";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
const FIELDS = ["Dự đoán trước khi xem", "Điều em quan sát thấy", "Giải thích kết quả", "Câu hỏi em muốn mang đến lớp"] as const;
const EMPTY = () => "";
export function ObservationNotebook({ code }: { code: string }) {
  const key = `nuclear-observation-v1:${code}`;
  const [error, setError] = useState(""), [fallback, setFallback] = useState<string[]>(["", "", "", ""]);
  const [showExport, setShowExport] = useState(false), [copyStatus, setCopyStatus] = useState("");
  const subscribe = useCallback((notify: () => void) => { window.addEventListener("storage", notify); window.addEventListener("observation-changed", notify); return () => { window.removeEventListener("storage", notify); window.removeEventListener("observation-changed", notify); }; }, []);
  const stored = useSyncExternalStore(subscribe, useCallback(() => { try { return localStorage.getItem(key) ?? ""; } catch { return ""; } }, [key]), EMPTY);
  const notes = useMemo(() => {
    if (error) return fallback;
    try { const raw: unknown = JSON.parse(stored || "[]"); return Array.from({ length: 4 }, (_, i) => Array.isArray(raw) && typeof raw[i] === "string" ? raw[i].slice(0, 4000) : ""); }
    catch { return ["", "", "", ""]; }
  }, [stored, error, fallback]);
  function save(next: string[]) { setFallback(next); try { localStorage.setItem(key, JSON.stringify(next)); window.dispatchEvent(new Event("observation-changed")); setError(""); } catch { setError("Thiết bị không lưu được bản ghi. Hãy tải bản ghi trước khi rời trang."); } }
  const content = `${code} · BẢN GHI QUAN SÁT\n\n${FIELDS.map((label, i) => `${label}\n${notes[i] || "(Chưa ghi)"}`).join("\n\n")}\n\nBản ghi tự học, chưa nộp vào lớp học.\n`;
  function download() {
    setShowExport(true);
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = `${code}-ban-ghi-quan-sat.txt`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  async function copy() { setShowExport(true); try { await navigator.clipboard.writeText(content); setCopyStatus("Đã sao chép bản ghi."); } catch { setCopyStatus("Chọn nội dung trong ô bản xuất để sao chép."); } }
  return <section className="observation-notebook"><div className="visual-caption"><div><span className="visual-eyebrow">Ghi kết quả học tập</span><h3>Bản ghi quan sát của em</h3></div><div className="experiment-controls"><button className="btn small" onClick={download}>Tải bản ghi TXT</button><button className="btn small" onClick={copy}>Sao chép bản ghi</button></div></div><p className="physics-note">Tự lưu trên trình duyệt này. Dùng bản ghi khi thảo luận trên lớp; đăng nhập lớp học để thực hiện nhiệm vụ được giao.</p><div className="observation-fields">{FIELDS.map((label, i) => <label key={label}>{label}<textarea rows={3} maxLength={4000} value={notes[i]} onChange={e => save(notes.map((v, j) => j === i ? e.target.value : v))} placeholder={i === 0 ? "Em nghĩ điều gì sẽ xảy ra?" : i === 1 ? "Nêu một chi tiết hoặc số liệu nhìn thấy…" : i === 2 ? "Chi tiết đó liên hệ với công thức / khái niệm nào?" : "Em còn chưa rõ điều gì?"}/></label>)}</div>{error && <p role="alert">{error}</p>}{showExport && <div className="observation-export"><label>Bản xuất để lưu hoặc sao chép<textarea readOnly value={content} rows={9}/></label><p className="physics-note" role="status">{copyStatus || "Nếu trình duyệt chưa tải được tệp, dùng nút Sao chép bản ghi hoặc chọn nội dung trong ô này."}</p></div>}<button className="btn small" onClick={() => save(["", "", "", ""])}>Xóa bản ghi của bài này</button></section>;
}
