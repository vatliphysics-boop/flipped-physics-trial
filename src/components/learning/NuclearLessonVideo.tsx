"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { NUCLEAR_VIDEO_METADATA, nuclearVideoUrl, type NuclearLabLesson } from "@/lib/nuclear-lab-lessons";
import styles from "./NuclearLessonVideo.module.css";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function NuclearLessonVideo({ lesson }: { lesson: NuclearLabLesson }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const activate = useRef<HTMLButtonElement>(null);
  const src = nuclearVideoUrl(lesson.code);
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const seconds = Math.round(NUCLEAR_VIDEO_METADATA[lesson.code].durationSeconds);
  const duration = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  useEffect(() => {
    const player = video.current;
    if (!open || !player) return;
    player.focus({ preventScroll: true });
    const pauseWhenHidden = () => { if (document.hidden) player.pause(); };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) player.pause();
    });
    observer.observe(player);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", pauseWhenHidden);
      player.pause();
    };
  }, [open]);

  return (
    <div className={styles.frame} data-media-ready={ready}>
      {!open ? (
        <button ref={activate} className={styles.cover} disabled={!ready} type="button" onClick={() => { setFailed(false); setOpen(true); }}>
          <span className={styles.play} aria-hidden="true">▶</span>
          <span>Mở video {lesson.code}</span>
          <small>{lesson.title} · {duration} · Có thuyết minh và phụ đề tiếng Việt</small>
        </button>
      ) : (
        <>
          <video ref={video} controls playsInline preload="metadata" aria-label={`Video ${lesson.code} · ${lesson.title}`}
            poster={src.replace(/\.mp4$/, ".jpg")} src={src} onError={() => setFailed(true)}>
            <track kind="captions" srcLang="vi" label="Tiếng Việt" src={src.replace(/\.mp4$/, ".vi.vtt")} />
            Trình duyệt chưa hỗ trợ video. <a href={src}>Mở tệp MP4</a>.
          </video>
          <div className={styles.actions}>
            <small>Giọng đọc tổng hợp tiếng Việt · Phụ đề có sẵn trong hình</small>
            {failed && <p role="alert">Chưa phát được video. Hãy thử mở tệp MP4 trực tiếp.</p>}
            <a href={src}>Mở tệp MP4 ↗</a>
            <button type="button" onClick={() => {
              setOpen(false);
              requestAnimationFrame(() => activate.current?.focus());
            }}>Đóng video</button>
          </div>
        </>
      )}
    </div>
  );
}
