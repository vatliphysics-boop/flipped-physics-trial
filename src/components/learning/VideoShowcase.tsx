"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/* ── Video data ────────────────────────────────────────────── */
export interface ShowcaseVideo {
  id: string;
  src: string;
  title: string;
  description: string;
  tags: string[];
  /** Facebook source URL – for attribution */
  sourceUrl?: string;
}

export const SHOWCASE_VIDEOS: ShowcaseVideo[] = [
  {
    id: "chemical-bonds",
    src: "/videos/5-types-chemical-bonds.mp4",
    title: "5 loại liên kết hóa học",
    description:
      "Mô phỏng 3D trực quan 5 loại liên kết hóa học: Ionic, Covalent, Metallic, Hydrogen và Van der Waals. Xem cách các nguyên tử tương tác và hình thành liên kết.",
    tags: ["Liên kết hóa học", "Mô phỏng 3D", "Nguyên tử"],
    sourceUrl:
      "https://www.facebook.com/share/r/19vq4BxL3U/?mibextid=WC7FNe",
  },
  {
    id: "atomic-model",
    src: "/videos/evolution-atomic-model.mp4",
    title: "Lịch sử mô hình nguyên tử",
    description:
      "Hành trình phát triển mô hình nguyên tử từ 400 TCN đến 1932: Democritus → Dalton → Thomson → Rutherford → Bohr → Schrödinger → Chadwick.",
    tags: ["Mô hình nguyên tử", "Lịch sử Vật lí", "Infographic"],
    sourceUrl:
      "https://www.facebook.com/share/r/1HrzDMjD6n/?mibextid=KsPBc6",
  },
];

/* ── Reels-style fullscreen viewer ────────────────────────── */
function ReelsViewer({
  videos,
  startIndex,
  onClose,
}: {
  videos: ShowcaseVideo[];
  startIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const video = videos[currentIndex];

  /* Play/pause on tap */
  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }, []);

  /* Navigate between videos */
  const goTo = useCallback(
    (dir: 1 | -1) => {
      const next = currentIndex + dir;
      if (next < 0 || next >= videos.length) return;
      setCurrentIndex(next);
      setPlaying(true);
      setProgress(0);
    },
    [currentIndex, videos.length],
  );

  /* Swipe up/down on mobile */
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    },
    [],
  );
  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 60) goTo(dy > 0 ? 1 : -1);
    },
    [goTo],
  );

  /* Keyboard nav */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goTo(1);
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") goTo(-1);
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "m") setMuted((v) => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, goTo, togglePlay]);

  /* Autoplay on change */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.play().catch(() => setPlaying(false));
  }, [currentIndex]);

  /* Progress */
  const onTimeUpdate = useCallback(() => {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    setProgress(el.currentTime / el.duration);
  }, []);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="reels-overlay" ref={containerRef}>
      {/* Video area */}
      <div
        className="reels-video-area"
        onClick={togglePlay}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <video
          ref={videoRef}
          key={video.id}
          src={video.src}
          className="reels-video"
          loop
          playsInline
          muted={muted}
          autoPlay
          onTimeUpdate={onTimeUpdate}
        />

        {/* Play/pause indicator */}
        {!playing && (
          <div className="reels-play-indicator">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="rgba(0,0,0,0.45)" />
              <polygon points="26,20 26,44 46,32" fill="white" />
            </svg>
          </div>
        )}

        {/* Progress bar */}
        <div className="reels-progress-bar">
          <div
            className="reels-progress-fill"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Right action bar */}
      <div className="reels-actions">
        <button
          className="reels-action-btn"
          onClick={(e) => {
            e.stopPropagation();
            setMuted((v) => !v);
          }}
          title={muted ? "Bật âm thanh" : "Tắt âm thanh"}
        >
          {muted ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>

        {video.sourceUrl && (
          <a
            className="reels-action-btn"
            href={video.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Xem nguồn gốc"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
      </div>

      {/* Bottom info */}
      <div className="reels-info" onClick={(e) => e.stopPropagation()}>
        <h3 className="reels-title">{video.title}</h3>
        <p className="reels-desc">{video.description}</p>
        <div className="reels-tags">
          {video.tags.map((t) => (
            <span key={t} className="reels-tag">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Close button */}
      <button
        className="reels-close-btn"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        title="Đóng (Esc)"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Navigation arrows */}
      {currentIndex > 0 && (
        <button
          className="reels-nav-btn reels-nav-up"
          onClick={(e) => {
            e.stopPropagation();
            goTo(-1);
          }}
          title="Video trước"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}
      {currentIndex < videos.length - 1 && (
        <button
          className="reels-nav-btn reels-nav-down"
          onClick={(e) => {
            e.stopPropagation();
            goTo(1);
          }}
          title="Video tiếp"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}

      {/* Video counter */}
      <div className="reels-counter">
        {currentIndex + 1} / {videos.length}
      </div>
    </div>
  );
}

/* ── Grid gallery (landing view) ──────────────────────────── */
export function VideoShowcase({ videos = SHOWCASE_VIDEOS }: { videos?: ShowcaseVideo[] }) {
  const [reelsIndex, setReelsIndex] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const previewRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  /* Hover preview */
  const onEnter = useCallback((id: string) => {
    setHoveredId(id);
    const el = previewRefs.current[id];
    if (el) el.play().catch(() => {});
  }, []);
  const onLeave = useCallback((id: string) => {
    setHoveredId(null);
    const el = previewRefs.current[id];
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  }, []);

  return (
    <>
      <div className="showcase-grid">
        {videos.map((v, i) => (
          <button
            key={v.id}
            className={`showcase-card ${hoveredId === v.id ? "hovered" : ""}`}
            onClick={() => setReelsIndex(i)}
            onMouseEnter={() => onEnter(v.id)}
            onMouseLeave={() => onLeave(v.id)}
          >
            <div className="showcase-card-video-wrap">
              <video
                ref={(el) => {
                  previewRefs.current[v.id] = el;
                }}
                src={v.src}
                className="showcase-card-video"
                muted
                loop
                playsInline
                preload="metadata"
              />
              {/* Play overlay */}
              <div className="showcase-card-play">
                <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="30" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
                  <polygon points="26,20 26,44 46,32" fill="white" />
                </svg>
              </div>
              {/* Reels badge */}
              <div className="showcase-card-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="4" />
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <line x1="2" y1="8" x2="22" y2="8" />
                </svg>
                <span>Reels</span>
              </div>
            </div>
            <div className="showcase-card-info">
              <h3>{v.title}</h3>
              <p>{v.description}</p>
              <div className="showcase-card-tags">
                {v.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {reelsIndex !== null && (
        <ReelsViewer
          videos={videos}
          startIndex={reelsIndex}
          onClose={() => setReelsIndex(null)}
        />
      )}
    </>
  );
}
