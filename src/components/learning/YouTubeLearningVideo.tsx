"use client";
import { useState } from "react";
import { youtubeId } from "@/lib/visual-learning";
import { RichPhysicsText } from "./RichPhysicsText";
export function YouTubeLearningVideo({ url, title, task, channel }: { url: string; title: string; task?: string; channel?: string }) {
  const [loaded, setLoaded] = useState(false);
  const id = youtubeId(url);
  if (!id) return <a className="btn" href={url} target="_blank" rel="noreferrer">Mở video nguồn ↗</a>;
  return <section className="youtube-learning" aria-label={title}>
    <div className="youtube-frame">{loaded ? <iframe src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`} title={title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <div className="youtube-ready"><span className="youtube-play" aria-hidden="true">▶</span><h3>{title}</h3><p>{channel ?? "Video nguồn YouTube"}</p><button className="btn primary" onClick={() => setLoaded(true)}>Mở video tại đây</button><p className="video-small">Chỉ kết nối YouTube khi em mở video.</p></div>}</div>
    {task && <div className="video-mission"><strong>Xem có nhiệm vụ</strong><div style={{ marginTop: "6px" }}><RichPhysicsText content={task} compact /></div></div>}
    <p className="physics-note">Video tiếng Anh; câu hỏi và hướng dẫn bằng tiếng Việt. Chọn phụ đề trong trình phát nếu tác giả cung cấp. Nếu video không phát tại đây, dùng liên kết nguồn.</p>
    <a className="btn small" href={url} target="_blank" rel="noreferrer">Xem trên YouTube ↗</a>{loaded && <button className="btn small" onClick={() => setLoaded(false)}>Đóng video</button>}
  </section>;
}
