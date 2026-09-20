"use client";

import { useEffect, useRef, useState } from "react";
import { saveVideoProgressAction } from "./actions";

type Checkpoint = { id: string; prompt: string; options: string[]; correctIndex: number; atPercent: number };

export function VideoCheckpointPlayer({ materialId, title, url, isMov = false, checkpoints, initialAnswered, initialSeconds, initialComplete }: {
  materialId: string; title: string; url: string; isMov?: boolean; checkpoints: Checkpoint[]; initialAnswered: string[]; initialSeconds: number; initialComplete: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [answered, setAnswered] = useState(initialAnswered);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [complete, setComplete] = useState(initialComplete);
  const [active, setActive] = useState<Checkpoint | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const save = async (nextSeconds: number, nextAnswered: string[], nextComplete = complete) => {
    await saveVideoProgressAction({ materialId, watchedSeconds: nextSeconds, answeredCheckpoints: nextAnswered, completionPercent: videoRef.current?.duration ? Math.min(100, nextSeconds / videoRef.current.duration * 100) : 0, isComplete: nextComplete });
  };
  useEffect(() => { const video = videoRef.current; if (!video) return; const onTime = () => { const current = video.currentTime; setSeconds(current); const point = checkpoints.find((item) => !answered.includes(item.id) && current / (video.duration || 1) * 100 >= item.atPercent); if (point) { video.pause(); setActive(point); setSelected(null); } }; const onEnd = () => { if (answered.length === checkpoints.length) { setComplete(true); void save(video.duration, answered, true); } }; video.addEventListener("timeupdate", onTime); video.addEventListener("ended", onEnd); return () => { video.removeEventListener("timeupdate", onTime); video.removeEventListener("ended", onEnd); }; }, [answered, checkpoints]);
  const submit = async () => { if (!active || selected === null) return; if (selected !== active.correctIndex) { setError("Câu trả lời chưa chính xác. Em hãy thử lại."); return; } const next = [...answered, active.id]; setAnswered(next); setActive(null); setError(""); await save(seconds, next, next.length === checkpoints.length && videoRef.current?.ended === true); };
  return <div className="student-video-player">
    <div className="student-video-frame">{loading && <p className="form-help">Đang tải video...</p>}<video ref={videoRef} controls controlsList="nodownload" preload="metadata" src={url} aria-label={title} onLoadedMetadata={() => setLoading(false)} onError={() => { console.error("Video media error:", videoRef.current?.error); setLoading(false); setComplete(false); setError(isMov ? "Video định dạng MOV này không được trình duyệt hỗ trợ. Giáo viên nên chuyển video sang MP4 để đảm bảo khả năng phát trên mọi thiết bị." : "Không thể tải video. Vui lòng báo cho giáo viên."); void save(seconds, answered, false); }} /></div>
    {error && <p className="form-alert form-alert-error">{error}</p>}
    <div className="student-video-progress"><span style={{ width: `${complete ? 100 : Math.min(100, seconds / ((videoRef.current?.duration || 1)) * 100)}%` }} /></div>
    <div className="student-video-status"><span>{complete ? "Đã hoàn thành" : `${answered.length}/${checkpoints.length} câu hỏi đã trả lời`}</span><span>{complete ? "Mở giai đoạn tiếp theo" : "Cần xem hết video và trả lời đầy đủ"}</span></div>
    {active && <div className="checkpoint-backdrop"><section className="checkpoint-card" role="dialog" aria-modal="true"><span className="eyebrow">DỪNG KIỂM TRA KIẾN THỨC</span><h3>{active.prompt}</h3><div className="checkpoint-options">{active.options.map((option, index) => <label key={option}><input type="radio" name={`checkpoint-${active.id}`} checked={selected === index} onChange={() => setSelected(index)} />{option}</label>)}</div>{error && <p className="form-alert form-alert-error">{error}</p>}<button className="btn primary" type="button" disabled={selected === null} onClick={() => void submit()}>Xác nhận câu trả lời</button></section></div>}
  </div>;
}