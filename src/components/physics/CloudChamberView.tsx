"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CloudChamberView.module.css";

/**
 * Cloud chamber — qualitative reconstruction.
 *
 * Model level: illustrative. Each "track" is a short, slightly curved stroke
 * whose thickness and length stand in for the density of ionisation along the
 * path. We do NOT simulate ion–electron pairs, diffusion, or drop growth, and
 * we do NOT reproduce real event rates. Alpha tracks are short and thick;
 * beta tracks thin and wandering; gamma is shown only as an electron track it
 * knocked loose — a photon itself leaves no visible track.
 */

type TrackKind = "alpha" | "beta" | "gamma-electron";

interface Track {
  id: number;
  kind: TrackKind;
  x: number;
  y: number;
  angle: number;
  length: number;
  seedPhase: number;
}

const KIND_META: Record<TrackKind, { label: string; color: string; width: number }> = {
  alpha: { label: "Vệt alpha — ngắn, dày", color: "#d97706", width: 3.2 },
  beta: { label: "Vệt beta — mảnh, ngoằn ngoèo", color: "#2563eb", width: 1.4 },
  "gamma-electron": { label: "Electron do gamma bật ra — không phải vệt của photon", color: "#15803d", width: 1.8 },
};

function nextRandom(seed: number): number {
  // Deterministic LCG so the sequence is reproducible per session seed.
  return (seed * 1664525 + 1013904223) % 4294967296;
}

export function CloudChamberView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [count, setCount] = useState(0);
  const tracksRef = useRef<Track[]>([]);
  const seedRef = useRef(12345);
  const idRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let lastSpawn = 0;

    const draw = (now: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      // Fade old tracks very slowly so the chamber "breathes".
      ctx.fillStyle = "rgba(11, 18, 32, 0.035)";
      ctx.fillRect(0, 0, w, h);

      if (running && now - lastSpawn > 420) {
        lastSpawn = now;
        seedRef.current = nextRandom(seedRef.current);
        const r = seedRef.current / 4294967296;
        const kind: TrackKind = r < 0.42 ? "alpha" : r < 0.85 ? "beta" : "gamma-electron";

        seedRef.current = nextRandom(seedRef.current);
        const angle = (seedRef.current / 4294967296) * Math.PI * 2;

        tracksRef.current.push({
          id: idRef.current++,
          kind,
          x: w * (0.32 + Math.random() * 0.36),
          y: h * (0.28 + Math.random() * 0.44),
          angle,
          length: kind === "alpha" ? 34 + Math.random() * 22 : kind === "beta" ? 58 + Math.random() * 46 : 40 + Math.random() * 30,
          seedPhase: Math.random() * 100,
        });
        setCount(tracksRef.current.length);
        if (tracksRef.current.length > 90) tracksRef.current.shift();
      }

      for (const track of tracksRef.current) {
        const meta = KIND_META[track.kind];
        ctx.beginPath();
        ctx.strokeStyle = meta.color;
        ctx.lineWidth = meta.width;
        ctx.lineCap = "round";
        ctx.globalAlpha = 0.55;

        let px = track.x;
        let py = track.y;
        ctx.moveTo(px, py);
        const steps = Math.max(6, Math.round(track.length / 4));
        let a = track.angle;
        for (let i = 1; i <= steps; i++) {
          // Alpha is nearly straight; beta scatters gently along its path.
          const wander = track.kind === "alpha" ? 0.035 : track.kind === "beta" ? 0.34 : 0.2;
          a += Math.sin((i + track.seedPhase) * 0.7) * wander;
          px += Math.cos(a) * 4;
          py += Math.sin(a) * 4;
          ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [running]);

  const reset = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    tracksRef.current = [];
    setCount(0);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.stage}>
        <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label="Hoạt cảnh buồng sương định tính: các vệt ion hóa xuất hiện dọc đường đi hạt mang điện" />
        <div className={styles.badge}>Tái dựng định tính</div>
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.button} onClick={() => setRunning((v) => !v)}>
          {running ? "Tạm dừng" : "Tiếp tục"}
        </button>
        <button type="button" className={styles.button} onClick={reset}>Xóa vệt</button>
        <button type="button" className={styles.button} onClick={() => setShowLegend((v) => !v)} aria-expanded={showLegend}>
          {showLegend ? "Ẩn chú thích" : "Hiện chú thích"}
        </button>
        <span className={styles.counter}>{count} vệt</span>
      </div>

      {showLegend && (
        <ul className={styles.legend}>
          {Object.entries(KIND_META).map(([key, meta]) => (
            <li key={key}>
              <span className={styles.swatch} style={{ background: meta.color, height: Math.max(2, meta.width) }} />
              {meta.label}
            </li>
          ))}
        </ul>
      )}

      <p className={styles.note}>
        <strong>Mức độ mô hình hóa:</strong> Các vệt minh họa nguyên lí ion hóa — hơi nước ngưng tụ dọc đường đi hạt mang điện.
        Độ dày gợi ý mật độ ion hóa, không phải thang đo định lượng. Photon gamma không để lại vệt trực tiếp; vệt xanh là electron
        do photon bật ra khỏi nguyên tử. Không mô phỏng tốc độ sự kiện thực tế.
      </p>
    </div>
  );
}
