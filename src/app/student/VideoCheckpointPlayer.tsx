"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { refreshSignedVideoUrlAction, saveVideoProgressAction, submitVideoCheckpointAction } from "./actions";

type Checkpoint = { id: string; prompt: string; options: string[]; atPercent: number };

export function VideoCheckpointPlayer({ materialId, url, isMov = false, checkpoints, initialAnswered, initialSeconds }: { materialId: string; title: string; url: string; isMov?: boolean; checkpoints: Checkpoint[]; initialAnswered: string[]; initialSeconds: number }) {
  const videoRef = useRef<HTMLVideoElement>(null); const lastSaved = useRef(0);
  const [videoUrl, setVideoUrl] = useState(url); const [answered, setAnswered] = useState(initialAnswered);
  const [active, setActive] = useState<Checkpoint | null>(null); const [choice, setChoice] = useState("");
  const [status, setStatus] = useState("");
  const save = useCallback(async (seconds: number) => { const result = await saveVideoProgressAction({ materialId, watchedSeconds: Math.max(0, seconds) }); if (!result.error) lastSaved.current = Date.now(); }, [materialId]);
  useEffect(() => { const video = videoRef.current; if (!video) return; const restore = () => { if (initialSeconds > 0 && initialSeconds < video.duration - 1) video.currentTime = initialSeconds; }; video.addEventListener("loadedmetadata", restore); return () => video.removeEventListener("loadedmetadata", restore); }, [initialSeconds, videoUrl]);
  useEffect(() => { const video = videoRef.current; if (!video) return; const onTime = () => { const point = checkpoints.find((item) => !answered.includes(item.id) && video.duration && video.currentTime / video.duration * 100 >= item.atPercent); if (point) { video.pause(); setActive(point); setChoice(""); } if (Date.now() - lastSaved.current > 15000) void save(video.currentTime); }; const onPause = () => void save(video.currentTime); const onEnd = () => void save(video.duration || video.currentTime); video.addEventListener("timeupdate", onTime); video.addEventListener("pause", onPause); video.addEventListener("ended", onEnd); return () => { video.removeEventListener("timeupdate", onTime); video.removeEventListener("pause", onPause); video.removeEventListener("ended", onEnd); }; }, [answered, checkpoints, save]);
  
  async function answer() { 
    if (!active || !choice) return; 
    setStatus("Đang kiểm tra...");
    const result = await submitVideoCheckpointAction({ materialId, checkpointId: active.id, selectedOption: choice }); 
    setStatus(result.error || result.message || ""); 
    if (result.isCorrect) { 
      setAnswered((items) => [...new Set([...items, active.id])]); 
      setActive(null);
      if (videoRef.current) videoRef.current.play(); 
    } 
  }
  
  async function refresh() { const result = await refreshSignedVideoUrlAction(materialId); if (result.url) setVideoUrl(result.url); else setStatus(result.error || "Không thể tải lại link video."); }

  return (
    <section className="immersive-video-player" style={{ position: "relative", width: "100%", backgroundColor: "#000", display: "flex", flexDirection: "column" }}>
      {isMov && <div style={{ backgroundColor: "var(--semantic-warning)", color: "black", padding: "8px 16px", fontSize: "13px", textAlign: "center" }}>Video định dạng MOV có thể không phát được trên tất cả trình duyệt. Khuyên dùng H.264 MP4.</div>}
      
      <video 
        ref={videoRef} 
        src={videoUrl} 
        controls={!active} 
        preload="metadata" 
        onError={() => void refresh()}
        style={{ width: "100%", maxHeight: "600px", objectFit: "contain", outline: "none" }}
      >
        Video is not supported.
      </video>

      {/* Checkpoint Overlay */}
      {active && (
        <div className="checkpoint-overlay" role="dialog" aria-modal="true" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
          <div style={{ backgroundColor: "var(--bg-surface)", padding: "40px", borderRadius: "var(--radius-lg)", maxWidth: "500px", width: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-primary)", fontWeight: 600, marginBottom: "16px" }}>
              Câu hỏi tương tác
            </div>
            <p style={{ fontSize: "18px", color: "var(--text-primary)", fontWeight: 500, marginBottom: "32px", lineHeight: 1.5 }}>
              {active.prompt}
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              {active.options.map((option, index) => { 
                const value = String.fromCharCode(65 + index); 
                const isSelected = choice === value;
                return (
                  <label key={`${active.id}-${value}`} style={{ display: "flex", alignItems: "flex-start", padding: "16px", borderRadius: "var(--radius-md)", border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--border-dark)", backgroundColor: isSelected ? "var(--bg-surface-elevated)" : "var(--bg-surface)", cursor: "pointer", transition: "all 0.1s" }}>
                    <input type="radio" name={`checkpoint-${active.id}`} value={value} checked={isSelected} onChange={(event) => setChoice(event.target.value)} style={{ marginTop: "4px", marginRight: "12px" }} />
                    <span style={{ fontSize: "15px", color: "var(--text-primary)", lineHeight: 1.5 }}>
                      <strong>{value}.</strong> {option}
                    </span>
                  </label>
                ); 
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: status.includes("sai") ? "var(--semantic-error)" : "var(--text-secondary)" }}>
                {status || "Hãy chọn đáp án đúng để tiếp tục."}
              </span>
              <button className="btn primary" type="button" disabled={!choice} onClick={() => void answer()} style={{ padding: "10px 24px" }}>
                Gửi đáp án
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
