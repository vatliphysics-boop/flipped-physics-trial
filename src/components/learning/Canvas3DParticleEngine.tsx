"use client";

import React, { useEffect, useRef } from "react";
import { SGK_25_1_HALF_ACTIVITY, SGK_TABLE_25_1 } from "@/lib/sgk-b25-decay";
import type { ScientistId } from "./ScientistPortraits";

export type SphereColorTheme =
  | "red"
  | "blue"
  | "cyan"
  | "gold"
  | "green"
  | "purple"
  | "orange"
  | "slate"
  | "pink"
  | "teal";

const COLOR_MAP: Record<
  SphereColorTheme,
  { hi: string; mid: string; lo: string; rim: string; glow: string }
> = {
  teal: {
    hi: "#ccfbf1",
    mid: "#14b8a6",
    lo: "#0f766e",
    rim: "#042f2e",
    glow: "rgba(20,184,166,0.48)",
  },
  red: {
    hi: "#ffd5d5",
    mid: "#ef4444",
    lo: "#991b1b",
    rim: "#450a0a",
    glow: "rgba(239,68,68,0.45)",
  },
  blue: {
    hi: "#dbeafe",
    mid: "#3b82f6",
    lo: "#1d4ed8",
    rim: "#172554",
    glow: "rgba(59,130,246,0.45)",
  },
  cyan: {
    hi: "#ecfeff",
    mid: "#06b6d4",
    lo: "#0e7490",
    rim: "#083344",
    glow: "rgba(34,211,238,0.55)",
  },
  gold: {
    hi: "#fef9c3",
    mid: "#eab308",
    lo: "#a16207",
    rim: "#422006",
    glow: "rgba(250,204,21,0.5)",
  },
  green: {
    hi: "#dcfce7",
    mid: "#22c55e",
    lo: "#15803d",
    rim: "#052e16",
    glow: "rgba(34,197,94,0.48)",
  },
  purple: {
    hi: "#f3e8ff",
    mid: "#a855f7",
    lo: "#6b21a8",
    rim: "#2e1065",
    glow: "rgba(168,85,247,0.48)",
  },
  orange: {
    hi: "#ffedd5",
    mid: "#f97316",
    lo: "#c2410c",
    rim: "#431407",
    glow: "rgba(249,115,22,0.48)",
  },
  slate: {
    hi: "#f1f5f9",
    mid: "#64748b",
    lo: "#334155",
    rim: "#0f172a",
    glow: "rgba(148,163,184,0.35)",
  },
  pink: {
    hi: "#fce7f3",
    mid: "#ec4899",
    lo: "#9d174d",
    rim: "#500724",
    glow: "rgba(236,72,153,0.48)",
  },
};

export function easeInOutCubic(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Draw a soft elliptical floor shadow beneath a 3D sphere (Video 1 & 2 style).
 */
export function drawFloorShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  floorY: number,
  radius: number,
  opacity = 0.24
) {
  ctx.save();
  const grad = ctx.createRadialGradient(x, floorY, radius * 0.1, x, floorY, radius * 1.15);
  grad.addColorStop(0, `rgba(15, 23, 42, ${opacity})`);
  grad.addColorStop(0.6, `rgba(15, 23, 42, ${opacity * 0.45})`);
  grad.addColorStop(1, "rgba(15, 23, 42, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, floorY, radius * 1.1, radius * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draw a glossy 3D-shaded sphere with top-left specular highlight, rim shading,
 * optional outer glow, and crisp centered label.
 */
export function drawSphere3D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  theme: SphereColorTheme,
  options?: {
    label?: string;
    subLabel?: string;
    glow?: boolean;
    alpha?: number;
    pulsate?: number;
  }
) {
  if (r <= 0.5) return;
  const c = COLOR_MAP[theme] || COLOR_MAP.blue;
  const alpha = options?.alpha ?? 1;
  ctx.save();
  ctx.globalAlpha = alpha;

  if (options?.glow) {
    const glowR = r * (1.65 + (options.pulsate ?? 0) * 0.2);
    const glowGrad = ctx.createRadialGradient(x, y, r * 0.4, x, y, glowR);
    glowGrad.addColorStop(0, c.glow);
    glowGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Main 3D sphere body
  const gx = x - r * 0.35;
  const gy = y - r * 0.35;
  const grad = ctx.createRadialGradient(gx, gy, r * 0.08, x, y, r);
  grad.addColorStop(0, c.hi);
  grad.addColorStop(0.32, c.mid);
  grad.addColorStop(0.78, c.lo);
  grad.addColorStop(1, c.rim);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Crisp specular highlight droplet on top-left
  ctx.fillStyle = "rgba(255, 255, 255, 0.58)";
  ctx.beginPath();
  ctx.ellipse(
    x - r * 0.32,
    y - r * 0.34,
    Math.max(1.2, r * 0.28),
    Math.max(0.8, r * 0.16),
    -Math.PI / 5,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Text label inside sphere
  if (options?.label) {
    const fontSize = Math.max(9, Math.min(18, r * (options.label.length > 3 ? 0.54 : 0.72)));
    ctx.font = `800 ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillText(options.label, x + 0.8, y + (options.subLabel ? -fontSize * 0.22 : 0.8));
    ctx.fillStyle = "#ffffff";
    ctx.fillText(options.label, x, y + (options.subLabel ? -fontSize * 0.25 : 0));

    if (options.subLabel) {
      const subSize = Math.max(7.5, fontSize * 0.62);
      ctx.font = `700 ${subSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillText(options.subLabel, x, y + fontSize * 0.55);
    }
  }

  ctx.restore();
}

/**
 * Draw a shaded, schematic cluster with the specified proton and neutron counts.
 */
export function drawNucleusCluster3D(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  nucleonCount: number,
  protonRatio: number,
  nucleonRadius: number,
  time: number,
  labelOverlay?: string
) {
  const count = Math.max(1, nucleonCount);
  const protons = Math.round(count * protonRatio);
  const items: { dx: number; dy: number; dz: number; isProton: boolean }[] = [];

  for (let i = 0; i < count; i++) {
    const goldenAngle = i * 2.3999632;
    const shellR = i === 0 ? 0 : Math.sqrt(i) * nucleonRadius * 0.76;
    const angle = goldenAngle + time * 0.9;
    const dx = Math.cos(angle) * shellR;
    const dy = Math.sin(angle) * shellR * 0.82;
    const dz = Math.sin(angle * 1.7 + i);
    const isProton = Math.floor((i + 1) * protons / count) > Math.floor(i * protons / count);
    items.push({ dx, dy, dz, isProton });
  }

  // Sort back-to-front by dz for true 3D occlusion
  items.sort((a, b) => a.dz - b.dz);

  // Shading distinguishes the schematic cluster from the background.
  const clusterR = Math.sqrt(count) * nucleonRadius * 0.95 + nucleonRadius;
  const aura = ctx.createRadialGradient(cx, cy, nucleonRadius * 0.4, cx, cy, clusterR * 1.45);
  aura.addColorStop(0, "rgba(251, 191, 36, 0.28)");
  aura.addColorStop(1, "rgba(251, 191, 36, 0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(cx, cy, clusterR * 1.45, 0, Math.PI * 2);
  ctx.fill();

  for (const item of items) {
    drawSphere3D(
      ctx,
      cx + item.dx,
      cy + item.dy,
      nucleonRadius,
      item.isProton ? "red" : "blue",
      {
        label: nucleonRadius >= 8 ? (item.isProton ? "+" : "0") : undefined,
      }
    );
  }

  if (labelOverlay) {
    drawBadgePill(ctx, cx, cy + clusterR + 14, labelOverlay, "rgba(15, 23, 42, 0.84)");
  }
}

/**
 * Draw a tilted 3D elliptical orbit with glowing orbiting electrons and comet trails.
 */
export function drawTiltedOrbitWithElectrons(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  tiltRad: number,
  electronCount: number,
  time: number,
  speed = 2.2,
  orbitColor = "rgba(56, 189, 248, 0.38)",
  electronTheme: SphereColorTheme = "cyan",
  electronR = 5.2
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tiltRad);

  // Orbit ring
  ctx.strokeStyle = orbitColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Orbiting electrons + glowing comet trail
  for (let i = 0; i < electronCount; i++) {
    const baseAngle = time * speed + (i * Math.PI * 2) / electronCount;
    // Draw comet tail
    for (let s = 1; s <= 6; s++) {
      const tailAngle = baseAngle - s * 0.09 * Math.sign(speed);
      const tx = Math.cos(tailAngle) * rx;
      const ty = Math.sin(tailAngle) * ry;
      ctx.fillStyle =
        electronTheme === "cyan"
          ? `rgba(34, 211, 238, ${0.38 * (1 - s / 7)})`
          : `rgba(250, 204, 21, ${0.38 * (1 - s / 7)})`;
      ctx.beginPath();
      ctx.arc(tx, ty, electronR * (1 - s * 0.11), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Draw the 3D electron spheres in world coordinates so labels stay upright
  for (let i = 0; i < electronCount; i++) {
    const angle = time * speed + (i * Math.PI * 2) / electronCount;
    const lx = Math.cos(angle) * rx;
    const ly = Math.sin(angle) * ry;
    const wx = cx + lx * Math.cos(tiltRad) - ly * Math.sin(tiltRad);
    const wy = cy + lx * Math.sin(tiltRad) + ly * Math.cos(tiltRad);
    drawSphere3D(ctx, wx, wy, electronR, electronTheme, {
      label: electronR >= 5 ? "-" : undefined,
      glow: true,
    });
  }
}

/**
 * Draw a crisp callout pointer line + pill label (like Video 2 Evolution of the Atomic Model).
 */
export function drawCalloutLabel(
  ctx: CanvasRenderingContext2D,
  targetX: number,
  targetY: number,
  labelX: number,
  labelY: number,
  text: string,
  accentColor = "#38bdf8",
  darkTheme = true
) {
  ctx.save();
  ctx.font = "700 10.5px system-ui, -apple-system, sans-serif";
  const { a: scaleX, d: scaleY } = ctx.getTransform();
  const width = ctx.canvas.width / scaleX;
  const height = ctx.canvas.height / scaleY;
  const padX = 7;
  const pillW = Math.min(ctx.measureText(text).width + padX * 2, width - 8);
  const pillH = 19;
  const onLeft = labelX < targetX;
  const boxX = Math.max(4, Math.min(onLeft ? labelX - pillW : labelX, width - pillW - 4));
  const edge = onLeft ? boxX + pillW : boxX;
  labelY = Math.max(pillH / 2 + 4, Math.min(labelY, height - pillH / 2 - 4));

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(targetX, targetY);
  ctx.lineTo((targetX + edge) * 0.5, labelY);
  ctx.lineTo(edge, labelY);
  ctx.stroke();

  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(targetX, targetY, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = darkTheme ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 252, 245, 0.94)";
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(boxX, labelY - pillH / 2, pillW, pillH, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = darkTheme ? "#f8fafc" : "#1e293b";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, boxX + pillW / 2, labelY, pillW - 2 * padX);
  ctx.restore();
}

/**
 * 60-FPS Interactive 3D Model Canvas for each of the 11 Scientists in Video 2 / SGK style.
 */
export function Scientist3DModelCanvas({
  scientistId,
  width = 270,
  height = 185,
}: {
  scientistId: ScientistId;
  width?: number;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const interactRef = useRef({
    px: 0,
    py: 0,
    targetPx: 0,
    targetPy: 0,
    boost: 0,
    waves: [] as { x: number; y: number; p: number }[],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    const start = performance.now();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let extraTime = 0;
    let lastNow = start;

    const render = (now: number) => {
      const dt = (now - lastNow) / 1000;
      lastNow = now;
      const inter = interactRef.current;
      if (inter.boost > 0) {
        extraTime += dt * inter.boost * 2.2;
        inter.boost = Math.max(0, inter.boost - dt * 1.8);
      }
      inter.px += (inter.targetPx - inter.px) * 0.14;
      inter.py += (inter.targetPy - inter.py) * 0.14;

      const t = reducedMotion.matches ? 0 : (now - start) / 1000 + extraTime;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5 + inter.px;
      const cy = height * 0.5 + inter.py;

      // Subtle starry cosmic backdrop glow
      const bgGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, width * 0.55);
      bgGlow.addColorStop(0, "rgba(56, 189, 248, 0.14)");
      bgGlow.addColorStop(1, "rgba(15, 23, 42, 0)");
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      if (scientistId === "democritus") {
        const floatY = cy - 6 + Math.sin(t * 2.4) * 6;
        drawFloorShadow(ctx, cx, height - 22, 34, 0.35);
        drawSphere3D(ctx, cx, floatY, 34, "gold", {
          label: "ATOMOS",
          glow: true,
          pulsate: Math.sin(t * 3),
        });
        drawCalloutLabel(ctx, cx + 24, floatY - 16, cx + 46, floatY - 36, "Hạt đặc bất khả phân", "#f59e0b");
        drawCalloutLabel(ctx, cx - 22, floatY + 18, cx - 42, floatY + 38, "Chuyển động vĩnh cửu", "#fbbf24");
      } else if (scientistId === "dalton") {
        const offset = Math.sin(t * 2.6) * 14;
        drawFloorShadow(ctx, cx - 34 + offset * 0.4, height - 20, 24, 0.3);
        drawFloorShadow(ctx, cx + 28 - offset * 0.4, height - 20, 28, 0.35);
        drawSphere3D(ctx, cx - 34 + offset * 0.4, cy - 6, 22, "orange", {
          label: "H",
          glow: true,
        });
        drawSphere3D(ctx, cx + 28 - offset * 0.4, cy, 28, "red", {
          label: "O",
          glow: true,
        });
        drawCalloutLabel(ctx, cx + 44, cy - 18, cx + 58, cy - 42, "Quả cầu đặc đồng nhất", "#ef4444");
      } else if (scientistId === "thomson") {
        // Plum pudding 3D translucent positive sphere + oscillating electrons
        drawFloorShadow(ctx, cx, height - 18, 44, 0.32);
        drawSphere3D(ctx, cx, cy - 4, 44, "orange", {
          glow: true,
          alpha: 0.78,
        });
        // Positive charge signs inside pudding
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.font = "800 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("+", cx - 18, cy - 22);
        ctx.fillText("+", cx + 20, cy - 18);
        ctx.fillText("+", cx, cy + 22);

        const eCoords = [
          [-18, -6],
          [18, -6],
          [0, -22],
          [-16, 14],
          [16, 14],
          [0, 2],
        ];
        eCoords.forEach(([ex, ey], idx) => {
          const ox = Math.sin(t * 3.5 + idx * 1.2) * 3.2;
          const oy = Math.cos(t * 3.1 + idx * 1.4) * 3.2;
          drawSphere3D(ctx, cx + ex + ox, cy - 4 + ey + oy, 7.5, "cyan", {
            label: "-",
            glow: true,
          });
        });
        drawCalloutLabel(ctx, cx + 32, cy - 28, cx + 46, cy - 46, "Khối cầu dương (+)", "#fb923c");
        drawCalloutLabel(ctx, cx + 18, cy + 10, cx + 44, cy + 36, "Electron (-) rải đều", "#38bdf8");
      } else if (scientistId === "rutherford") {
        drawFloorShadow(ctx, cx, height - 16, 48, 0.3);
        // 3 tilted 3D orbits
        drawTiltedOrbitWithElectrons(ctx, cx, cy - 4, 58, 20, Math.PI / 6, 2, t, 2.6);
        drawTiltedOrbitWithElectrons(ctx, cx, cy - 4, 58, 20, -Math.PI / 6, 2, t + 1.2, 2.4);
        drawTiltedOrbitWithElectrons(ctx, cx, cy - 4, 54, 18, Math.PI / 2.2, 1, t + 2.1, 2.8);
        // Tiny dense positive nucleus
        drawNucleusCluster3D(ctx, cx, cy - 4, 7, 0.6, 5.2, t);
        drawCalloutLabel(ctx, cx + 6, cy - 8, cx + 38, cy - 46, "Hạt nhân (+Ze) rất nhỏ", "#f87171");
        drawCalloutLabel(ctx, cx - 44, cy + 16, cx - 28, cy + 46, "Electron quay quanh", "#38bdf8");
      } else if (scientistId === "bohr") {
        // Concentric quantized shells n=1,2,3 + quantum jump photon
        const radii = [24, 42, 60];
        radii.forEach((r, idx) => {
          ctx.strokeStyle = idx === 1 ? "rgba(45, 212, 191, 0.7)" : "rgba(148, 163, 184, 0.35)";
          ctx.lineWidth = idx === 1 ? 1.8 : 1.2;
          ctx.setLineDash(idx === 2 ? [4, 3] : []);
          ctx.beginPath();
          ctx.arc(cx, cy - 2, r, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.setLineDash([]);

        drawNucleusCluster3D(ctx, cx, cy - 2, 5, 0.6, 5, t);
        // Electron on n=1
        const a1 = t * 3.2;
        drawSphere3D(ctx, cx + Math.cos(a1) * 24, cy - 2 + Math.sin(a1) * 24, 5.5, "cyan", {
          label: "-",
          glow: true,
        });
        // Jumping electron oscillating between n=3 and n=2
        const jump = 0.5 + 0.5 * Math.sin(t * 2.5);
        const rJump = lerp(42, 60, jump);
        const a2 = t * 2.1 + 1.5;
        const ex = cx + Math.cos(a2) * rJump;
        const ey = cy - 2 + Math.sin(a2) * rJump;
        drawSphere3D(ctx, ex, ey, 6, "gold", { label: "-", glow: true });

        // Wavy photon emitted
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let s = 0; s < 28; s++) {
          const px = ex + s * 1.6;
          const py = ey - s * 0.9 + Math.sin(s * 0.9 - t * 12) * 3.5;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        drawCalloutLabel(ctx, cx + 42, cy - 2, cx + 48, cy - 46, "Quỹ đạo dừng n=1,2,3", "#2dd4bf");
        drawCalloutLabel(ctx, cx, cy - 2, cx - 32, cy + 48, "Bức xạ photon hν", "#facc15");
      } else if (scientistId === "schrodinger") {
        // Quantum electron probability cloud (3D orbital density dots + wave ring)
        const cloudGrad = ctx.createRadialGradient(cx, cy - 2, 6, cx, cy - 2, 58);
        cloudGrad.addColorStop(0, "rgba(168, 85, 247, 0.65)");
        cloudGrad.addColorStop(0.45, "rgba(56, 189, 248, 0.35)");
        cloudGrad.addColorStop(1, "rgba(15, 23, 42, 0)");
        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 58, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 68; i++) {
          const seed = i * 137.5;
          const r = 14 + ((seed + t * 28) % 44);
          const theta = seed + t * (1.2 + (i % 5) * 0.3);
          const px = cx + Math.cos(theta) * r;
          const py = cy - 2 + Math.sin(theta * 1.3) * r * 0.78;
          const alpha = 0.25 + 0.65 * (1 - r / 60);
          ctx.fillStyle = i % 3 === 0 ? `rgba(56, 189, 248, ${alpha})` : `rgba(192, 132, 252, ${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, 2.3, 0, Math.PI * 2);
          ctx.fill();
        }
        drawNucleusCluster3D(ctx, cx, cy - 2, 6, 0.5, 5.2, t);
        drawCalloutLabel(ctx, cx + 32, cy - 22, cx + 42, cy - 46, "Đám mây electron (Orbital)", "#a855f7");
        drawCalloutLabel(ctx, cx, cy - 2, cx - 36, cy + 46, "Hạt nhân ở tâm", "#38bdf8");
      } else if (scientistId === "chadwick") {
        drawFloorShadow(ctx, cx, height - 16, 46, 0.35);
        drawTiltedOrbitWithElectrons(ctx, cx, cy - 2, 62, 24, Math.PI / 7, 2, t, 2.1);
        drawTiltedOrbitWithElectrons(ctx, cx, cy - 2, 62, 24, -Math.PI / 7, 2, t + 1.6, 2.1);
        drawNucleusCluster3D(ctx, cx, cy - 2, 12, 0.5, 8.2, t);
        drawCalloutLabel(ctx, cx - 8, cy - 10, cx - 22, cy - 46, "Proton (+e, đỏ)", "#ef4444");
        drawCalloutLabel(ctx, cx + 10, cy + 8, cx + 36, cy + 46, "Neutron (0, xanh)", "#3b82f6");
      } else if (scientistId === "becquerel") {
        // Uranium salt emitting natural radiation onto photographic plate
        drawSphere3D(ctx, cx - 54, cy + 4, 24, "gold", {
          label: "²³⁸U",
          subLabel: "Muối U",
          glow: true,
        });
        // Photographic plate on the right
        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cx + 36, cy - 38, 42, 76, 6);
        ctx.fill();
        ctx.stroke();

        // Glowing Maltese cross silhouette on the plate
        const pulse = 0.55 + 0.45 * Math.sin(t * 4);
        ctx.fillStyle = `rgba(250, 204, 21, ${pulse})`;
        ctx.font = "900 26px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("✠", cx + 57, cy);

        // Streaming radiation particles from Uranium to plate
        for (let i = 0; i < 6; i++) {
          const prog = ((t * 0.9 + i * 0.17) % 1);
          const px = lerp(cx - 28, cx + 34, prog);
          const py = cy + (i - 2.5) * 9 + Math.sin(prog * 10 + t * 6) * 2.5;
          drawSphere3D(ctx, px, py, 4.5, i % 2 === 0 ? "gold" : "cyan", { glow: true });
        }
        drawCalloutLabel(ctx, cx - 54, cy - 18, cx - 32, cy - 46, "Muối Uranium tự bức xạ", "#eab308");
        drawCalloutLabel(ctx, cx + 57, cy + 36, cx + 22, cy + 50, "Kính ảnh đen (1 Bq)", "#38bdf8");
      } else if (scientistId === "curie") {
        // Glowing Radium-226 decaying into Rn-222 + alpha + gamma
        drawFloorShadow(ctx, cx - 18, height - 18, 34, 0.35);
        drawNucleusCluster3D(ctx, cx - 22, cy, 16, 0.45, 6.8, t);
        const emitProg = (t * 0.75) % 1;
        const ax = lerp(cx - 10, cx + 68, emitProg);
        const ay = lerp(cy, cy - 26, emitProg);
        drawSphere3D(ctx, ax, ay, 11, "gold", { label: "α", glow: true });

        // Gamma wave
        ctx.strokeStyle = "#ec4899";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let s = 0; s < 36; s++) {
          const gx = cx - 4 + s * 2;
          const gy = cy + 10 + s * 0.6 + Math.sin(s * 0.8 - t * 14) * 4;
          if (s === 0) ctx.moveTo(gx, gy);
          else ctx.lineTo(gx, gy);
        }
        ctx.stroke();

        drawCalloutLabel(ctx, cx - 22, cy - 22, cx - 26, cy - 48, "Hạt nhân ²²⁶₈₈Ra", "#ec4899");
        drawCalloutLabel(ctx, ax, ay, cx + 38, cy - 46, "Phát tia α & γ (1 Ci)", "#facc15");
      } else if (scientistId === "einstein") {
        // Nucleons merging -> Delta m -> E = mc^2 radiant burst
        const merge = 0.5 + 0.5 * Math.sin(t * 2.2);
        const spread = lerp(38, 8, easeInOutCubic(merge));
        const offsets = [
          [-spread, -spread * 0.6, "red", "+"],
          [spread, -spread * 0.6, "red", "+"],
          [-spread, spread * 0.6, "blue", "0"],
          [spread, spread * 0.6, "blue", "0"],
        ] as const;

        if (merge > 0.55) {
          const waveR = (merge - 0.5) * 110;
          ctx.strokeStyle = `rgba(250, 204, 21, ${1 - (merge - 0.5) * 1.8})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, waveR, 0, Math.PI * 2);
          ctx.stroke();
        }

        offsets.forEach(([dx, dy, col, lbl]) => {
          drawSphere3D(ctx, cx + dx, cy + dy, 12, col, { label: lbl, glow: true });
        });

        drawCalloutLabel(ctx, cx, cy - 18, cx + 26, cy - 46, "Độ hụt khối Δm", "#60a5fa");
        drawCalloutLabel(ctx, cx, cy + 18, cx + 26, cy + 48, "E_lk = Δm·c² (MeV)", "#facc15");
      } else if (scientistId === "blackett") {
        // Cloud chamber forked tracks: alpha + N-14 -> O-17 + p
        // Parallel background alpha tracks
        ctx.strokeStyle = "rgba(226, 232, 240, 0.25)";
        ctx.lineWidth = 2;
        [cy - 36, cy + 36].forEach((yLine) => {
          ctx.beginPath();
          ctx.moveTo(18, yLine);
          ctx.lineTo(width - 18, yLine);
          ctx.stroke();
        });

        // Main colliding alpha track
        const prog = (t * 0.65) % 1;
        const hitX = cx - 8;
        ctx.strokeStyle = "rgba(250, 204, 21, 0.85)";
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(18, cy);
        ctx.lineTo(prog < 0.45 ? lerp(18, hitX, prog / 0.45) : hitX, cy);
        ctx.stroke();

        // Target N-14 nucleus
        drawSphere3D(ctx, hitX, cy, 11, "blue", { label: "¹⁴N", glow: true });

        if (prog >= 0.45) {
          const after = (prog - 0.45) / 0.55;
          // Long thin proton track upwards
          const px = lerp(hitX, width - 22, after);
          const py = lerp(cy, cy - 42, after);
          ctx.strokeStyle = "#f87171";
          ctx.lineWidth = 1.8;
          ctx.setLineDash([4, 2]);
          ctx.beginPath();
          ctx.moveTo(hitX, cy);
          ctx.lineTo(px, py);
          ctx.stroke();
          ctx.setLineDash([]);
          drawSphere3D(ctx, px, py, 7.5, "red", { label: "p", glow: true });

          // Short thick O-17 track downwards
          const ox = lerp(hitX, hitX + 58, after);
          const oy = lerp(cy, cy + 30, after);
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 4.8;
          ctx.beginPath();
          ctx.moveTo(hitX, cy);
          ctx.lineTo(ox, oy);
          ctx.stroke();
          drawSphere3D(ctx, ox, oy, 13, "cyan", { label: "¹⁷O", glow: true });
        } else {
          const ax = lerp(18, hitX, prog / 0.45);
          drawSphere3D(ctx, ax, cy, 9.5, "gold", { label: "α", glow: true });
        }

        drawCalloutLabel(ctx, hitX + 46, cy - 26, hitX + 46, cy - 48, "Vết mảnh Proton (¹₁H)", "#f87171");
        drawCalloutLabel(ctx, hitX + 42, cy + 22, hitX + 42, cy + 48, "Vết đậm Oxygen (¹⁷₈O)", "#38bdf8");
      } else if (scientistId === "fermi") {
        // Chicago Pile-1 Reactor Core with Fuel Rods & Cadmium Control Rod (k=1)
        drawFloorShadow(ctx, cx, height - 16, 52, 0.35);
        // Graphite blocks & uranium rods
        for (let r = -2; r <= 2; r++) {
          const rx = cx + r * 22;
          ctx.fillStyle = r % 2 === 0 ? "rgba(100, 116, 139, 0.45)" : "rgba(15, 118, 110, 0.65)";
          ctx.fillRect(rx - 7, cy - 35, 14, 70);
          ctx.strokeStyle = "#334155";
          ctx.lineWidth = 1;
          ctx.strokeRect(rx - 7, cy - 35, 14, 70);
        }
        // Cadmium control rod moving up and down
        const rodY = cy - 42 + Math.sin(t * 1.8) * 16;
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(cx - 5, rodY, 10, 50);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - 5, rodY, 10, 50);

        // Slow thermal neutrons cycling at k=1
        for (let i = 0; i < 4; i++) {
          const np = (t * 1.2 + i * 0.25) % 1;
          const nx = cx + Math.sin(np * Math.PI * 2) * 36;
          const ny = cy + Math.cos(np * Math.PI * 2) * 22;
          drawSphere3D(ctx, nx, ny, 4.5, "cyan", { glow: true });
        }
        drawCalloutLabel(ctx, cx, rodY - 6, cx + 42, cy - 48, "Thanh điều khiển Bo/Cd", "#ef4444");
        drawCalloutLabel(ctx, cx, cy + 38, cx - 26, cy + 50, "Lò phản ứng (k = 1)", "#0d9488");
      } else if (scientistId === "hahn") {
        // Fission of U-235: incoming neutron -> compound nucleus -> 2 fragments + 3 neutrons
        const fProg = (t * 0.6) % 1;
        if (fProg < 0.38) {
          const inX = lerp(cx - 70, cx - 4, fProg / 0.38);
          drawSphere3D(ctx, inX, cy, 6, "cyan", { label: "n", glow: true });
          drawSphere3D(ctx, cx, cy, 22, "gold", { label: "U-236*", glow: true });
        } else {
          const splitProg = (fProg - 0.38) / 0.62;
          // Fragment 1: I-138
          const bX = lerp(cx, cx + 54, splitProg);
          const bY = lerp(cy, cy - 30, splitProg);
          drawSphere3D(ctx, bX, bY, 14, "gold", { label: "I-138", glow: true });
          // Fragment 2: Y-95
          const kX = lerp(cx, cx + 54, splitProg);
          const kY = lerp(cy, cy + 30, splitProg);
          drawSphere3D(ctx, kX, kY, 11, "blue", { label: "Y-95", glow: true });
          // 3 Secondary Neutrons
          for (let ni = -1; ni <= 1; ni++) {
            const snX = lerp(cx, cx + 78, splitProg);
            const snY = lerp(cy, cy + ni * 24, splitProg);
            drawSphere3D(ctx, snX, snY, 5, "cyan", { label: "n", glow: true });
          }
          // Flash wave
          if (splitProg < 0.35) {
            ctx.strokeStyle = `rgba(239, 68, 68, ${1 - splitProg * 2.8})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, splitProg * 80, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        drawCalloutLabel(ctx, cx - 18, cy - 24, cx - 36, cy - 48, "²³⁵U hấp thụ neutron", "#38bdf8");
        drawCalloutLabel(ctx, cx + 38, cy, cx + 46, cy + 48, "Phân hạch tỏa ~200 MeV", "#f97316");
      } else if (scientistId === "libby") {
        // Carbon-14 beta decay & Archaeological Clock
        drawFloorShadow(ctx, cx - 26, height - 16, 36, 0.32);
        // Fossil / Wood artifact ring
        ctx.strokeStyle = "#a16207";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx - 30, cy, 26, 0, Math.PI * 2);
        ctx.stroke();
        drawSphere3D(ctx, cx - 30, cy, 14, "gold", { label: "¹⁴C", glow: true });

        // Emitted beta particle (electron)
        const bProg = (t * 0.9) % 1;
        const ex = lerp(cx - 18, cx + 64, bProg);
        const ey = lerp(cy, cy - 22, bProg);
        drawSphere3D(ctx, ex, ey, 6, "cyan", { label: "β⁻", glow: true });

        // Half-life clock icon on right
        ctx.strokeStyle = "#8b5cf6";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx + 42, cy + 6, 18, 0, Math.PI * 2);
        ctx.stroke();
        const handAngle = t * 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + 42, cy + 6);
        ctx.lineTo(cx + 42 + Math.cos(handAngle) * 12, cy + 6 + Math.sin(handAngle) * 12);
        ctx.stroke();

        drawCalloutLabel(ctx, cx - 30, cy - 24, cx - 34, cy - 48, "Đồng vị ¹⁴₆C (T = 5730 năm)", "#eab308");
        drawCalloutLabel(ctx, cx + 42, cy + 24, cx + 42, cy + 48, "Định tuổi cổ vật bằng β⁻", "#8b5cf6");
      }

      // Render 3D Click Shockwaves
      for (let i = inter.waves.length - 1; i >= 0; i--) {
        const wv = inter.waves[i];
        wv.p += 0.04;
        if (wv.p >= 1) {
          inter.waves.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - wv.p) * 0.65})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(wv.x, wv.y, 10 + wv.p * 85, (10 + wv.p * 85) * 0.68, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
      if (!reducedMotion.matches) rafId = requestAnimationFrame(render);
    };

    let visible = false;
    const sync = () => {
      cancelAnimationFrame(rafId);
      if (visible && !document.hidden) {
        lastNow = performance.now();
        rafId = requestAnimationFrame(render);
      }
    };
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    visibility.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    reducedMotion.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(rafId);
      visibility.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, [scientistId, width, height]);

  return (
    <canvas
      ref={canvasRef}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        interactRef.current.targetPx = ((e.clientX - r.left) / r.width - 0.5) * 14;
        interactRef.current.targetPy = ((e.clientY - r.top) / r.height - 0.5) * 10;
      }}
      onPointerLeave={() => {
        interactRef.current.targetPx = 0;
        interactRef.current.targetPy = 0;
      }}
      onPointerDown={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        interactRef.current.boost = 1.2;
        interactRef.current.waves.push({
          x: ((e.clientX - r.left) / r.width) * width,
          y: ((e.clientY - r.top) / r.height) * height,
          p: 0,
        });
      }}
      style={{
        width: `${width}px`,
        maxWidth: "100%",
        height: `${height}px`,
        display: "block",
        borderRadius: "10px",
        background: "#0f172a",
        border: "1px solid #1e293b",
        cursor: "pointer",
      }}
    />
  );
}

/**
 * Draw a floating pill badge on the canvas (for charges, formulas, status callouts).
 */
function drawBadgePill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  bgColor: string,
  textColor = "#ffffff",
  borderColor = "rgba(255,255,255,0.4)"
) {
  ctx.save();
  ctx.font = "800 11px system-ui, -apple-system, sans-serif";
  const { a: scaleX, d: scaleY } = ctx.getTransform();
  const canvasWidth = ctx.canvas.width / scaleX;
  const canvasHeight = ctx.canvas.height / scaleY;
  const w = Math.min(ctx.measureText(text).width + 16, canvasWidth - 8);
  const h = 21;
  x = Math.max(w / 2 + 4, Math.min(x, canvasWidth - w / 2 - 4));
  y = Math.max(h / 2 + 4, Math.min(y, canvasHeight - h / 2 - 4));
  ctx.fillStyle = bgColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y + 0.5, w - 16);
  ctx.restore();
}

/**
 * 60-FPS Continuous 3D-Shaded Canvas Renderer for Stacked Cards (Video 1 Style).
 * Smoothly interpolates particle positions, collisions, orbital electrons, and energy waves
 * across continuous `progress` (0.0 -> 1.0) and real-time `t` (seconds at 60 FPS).
 */
export function Card3DSimulationCanvas({
  sceneKey,
  progress,
  width = 520,
  height = 132,
}: {
  sceneKey: string;
  /** Continuous progress 0.0 -> 1.0 across the 3 phases */
  progress: number;
  width?: number;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressRef = useRef(progress);
  const redraw = useRef<(() => void) | null>(null);
  const interactRef = useRef({
    px: 0,
    py: 0,
    targetPx: 0,
    targetPy: 0,
  });

  useEffect(() => {
    progressRef.current = progress;
    redraw.current?.();
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    const start = performance.now();

    const render = (now: number) => {
      const inter = interactRef.current;
      inter.px += (inter.targetPx - inter.px) * 0.14;
      inter.py += (inter.targetPy - inter.py) * 0.14;

      const t = reducedMotion.matches ? 0 : (now - start) / 1000;
      const p = progressRef.current; // 0..1 continuous timeline
      const smoothP = easeInOutCubic(p);

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5 + inter.px;
      const cy = height * 0.48 + inter.py;
      const floorY = height - 14;

      switch (sceneKey) {
        /* ═══ B21 POSTER 1: THÍ NGHIỆM TÁN XẠ HẠT ALPHA ═══ */
        case "ruth_plum_pudding": {
          drawFloorShadow(ctx, cx, floorY, 48, 0.22);
          // Translucent positive pudding sphere
          drawSphere3D(ctx, cx, cy, 42, "pink", { glow: true, alpha: 0.78 });
          // Embedded oscillating electrons
          const eOffsets = [
            [-18, -14],
            [18, -14],
            [0, 0],
            [-18, 15],
            [18, 15],
          ];
          eOffsets.forEach(([ox, oy], i) => {
            const dx = Math.sin(t * 3.5 + i) * 2.5;
            const dy = Math.cos(t * 3.2 + i) * 2.5;
            drawSphere3D(ctx, cx + ox + dx, cy + oy + dy, 6.5, "cyan", {
              label: "-",
              glow: true,
            });
          });
          // Continuous stream of alpha particles flying straight through
          [-22, 0, 22].forEach((rowY, rIdx) => {
            ctx.strokeStyle = "rgba(239, 68, 68, 0.35)";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(45, cy + rowY);
            ctx.lineTo(width - 45, cy + rowY);
            ctx.stroke();
            ctx.setLineDash([]);

            const beamT = (t * 0.65 + rIdx * 0.28 + smoothP * 0.5) % 1;
            const ax = lerp(55, width - 55, beamT);
            drawSphere3D(ctx, ax, cy + rowY, 7.5, "gold", {
              label: "α",
              glow: true,
            });
          });
          drawBadgePill(ctx, 92, 20, "Chùm hạt α (+2e)", "#991b1b");
          drawBadgePill(ctx, width - 102, 20, "Đường đi gần thẳng", "#831843");
          break;
        }

        case "ruth_apparatus": {
          // Vacuum chamber ring G
          ctx.strokeStyle = "rgba(100, 116, 139, 0.45)";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.arc(cx + 15, cy, 48, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Fluorescent green screen S
          ctx.strokeStyle = "#16a34a";
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(cx + 15, cy, 48, -Math.PI * 0.78, Math.PI * 0.78);
          ctx.stroke();

          // Lead source box R
          drawFloorShadow(ctx, 105, floorY, 26, 0.25);
          ctx.fillStyle = "#334155";
          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(78, cy - 16, 52, 32, 6);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#f8fafc";
          ctx.font = "800 11px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("Nguồn R (α)", 104, cy + 4);

          // Gold foil D at center
          ctx.fillStyle = "#f59e0b";
          ctx.beginPath();
          ctx.roundRect(cx + 12, cy - 30, 6, 60, 3);
          ctx.fill();

          // Continuous animated alpha particles hitting (1) straight, oblique, and (2) backscatter
          for (let i = 0; i < 4; i++) {
            const cycle = (t * 0.85 + i * 0.25) % 1;
            const foilX = cx + 15;
            if (cycle < 0.45) {
              const x = lerp(130, foilX, cycle / 0.45);
              drawSphere3D(ctx, x, cy, 6, "gold", { label: "α", glow: true });
            } else {
              const after = (cycle - 0.45) / 0.55;
              const angle = i === 0 ? 0 : i === 1 ? -0.45 : i === 2 ? 0.35 : 2.55;
              const hitX = foilX + Math.cos(angle) * 48 * after;
              const hitY = cy + Math.sin(angle) * 48 * after;
              drawSphere3D(ctx, hitX, hitY, 5.5, i === 3 ? "red" : "gold", { glow: true });
              if (after > 0.82) {
                // Scintillation green flash on screen S
                drawSphere3D(
                  ctx,
                  foilX + Math.cos(angle) * 48,
                  cy + Math.sin(angle) * 48,
                  9,
                  "green",
                  { glow: true }
                );
              }
            }
          }
          drawBadgePill(ctx, cx + 132, cy - 16, "(1) Đốm sáng dày đặc", "#15803d");
          drawBadgePill(ctx, cx - 72, cy + 36, "(2) Bật ngược ~10⁻⁴", "#be123c");
          break;
        }

        case "ruth_straight_beam": {
          // 5 Gold atoms with large empty orbital rings and tiny nuclei
          const lattice = [
            [cx - 55, cy - 28],
            [cx + 55, cy - 28],
            [cx, cy],
            [cx - 55, cy + 28],
            [cx + 55, cy + 28],
          ];
          lattice.forEach(([gx, gy], idx) => {
            drawTiltedOrbitWithElectrons(
              ctx,
              gx,
              gy,
              24,
              11,
              (idx * Math.PI) / 5,
              1,
              t + idx,
              2.6,
              "rgba(217, 119, 6, 0.32)",
              "cyan",
              4
            );
            drawSphere3D(ctx, gx, gy, 5.5, "gold", { glow: true });
          });

          // Continuous alpha beams streaming through the empty space
          [-38, -14, 14, 38].forEach((offsetY, i) => {
            const y = cy + offsetY;
            ctx.strokeStyle = "rgba(22, 163, 74, 0.45)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(40, y);
            ctx.lineTo(width - 40, y);
            ctx.stroke();

            const prog = (t * 0.75 + i * 0.23 + smoothP * 0.4) % 1;
            const ax = lerp(48, width - 48, prog);
            drawSphere3D(ctx, ax, y, 6.5, "red", { label: "α", glow: true });
          });
          drawBadgePill(ctx, width - 92, 20, "Phần lớn đi gần thẳng", "#15803d");
          break;
        }

        case "ruth_coulomb_deflect": {
          const nucX = cx + 10;
          const nucY = cy + 12;
          drawFloorShadow(ctx, nucX, floorY, 34, 0.28);
          drawSphere3D(ctx, nucX, nucY, 21, "gold", {
            label: "+79e",
            subLabel: "Au",
            glow: true,
            pulsate: Math.sin(t * 4),
          });

          // Smooth hyperbolic trajectory curve
          ctx.strokeStyle = "rgba(2, 132, 199, 0.55)";
          ctx.lineWidth = 2.5;
          ctx.setLineDash([5, 3]);
          ctx.beginPath();
          ctx.moveTo(55, cy - 4);
          ctx.quadraticCurveTo(nucX - 18, cy - 4, nucX + 120, cy - 46);
          ctx.stroke();
          ctx.setLineDash([]);

          // Alpha particle gliding along quadratic Bezier curve continuously
          const u = (t * 0.55 + smoothP * 0.65) % 1;
          const p0x = 55,
            p0y = cy - 4;
          const p1x = nucX - 18,
            p1y = cy - 4;
          const p2x = nucX + 120,
            p2y = cy - 46;
          const ax = (1 - u) * (1 - u) * p0x + 2 * (1 - u) * u * p1x + u * u * p2x;
          const ay = (1 - u) * (1 - u) * p0y + 2 * (1 - u) * u * p1y + u * u * p2y;

          // Repulsive Coulomb force arrow when near nucleus
          const dist = Math.hypot(ax - nucX, ay - nucY);
          if (dist < 95) {
            const ux = (ax - nucX) / dist;
            const uy = (ay - nucY) / dist;
            const fLen = Math.min(38, (2200 / (dist * dist)) * 18);
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(ax + ux * fLen, ay + uy * fLen);
            ctx.stroke();
          }

          drawSphere3D(ctx, ax, ay, 10, "red", { label: "α", subLabel: "+2e", glow: true });
          drawBadgePill(ctx, nucX + 125, cy + 18, "Lực đẩy Coulomb", "#0369a1");
          break;
        }

        case "ruth_backscatter": {
          const nucX = cx + 55;
          drawFloorShadow(ctx, nucX, floorY, 36, 0.3);
          drawSphere3D(ctx, nucX, cy, 23, "gold", {
            label: "+79e",
            subLabel: "Au",
            glow: true,
          });

          const u = (t * 0.5 + smoothP * 0.6) % 1;
          const turnX = nucX - 34;
          let ax: number;
          let ay: number;
          if (u < 0.5) {
            const k = easeInOutCubic(u * 2);
            ax = lerp(65, turnX, k);
            ay = cy - 4;
          } else {
            const k = easeInOutCubic((u - 0.5) * 2);
            ax = lerp(turnX, 75, k);
            ay = lerp(cy - 4, cy + 32, k);
          }

          // Path trail
          ctx.strokeStyle = "#e11d48";
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.moveTo(65, cy - 4);
          ctx.lineTo(turnX, cy - 4);
          ctx.lineTo(75, cy + 32);
          ctx.stroke();

          // Shockwave ring at closest approach
          if (Math.abs(u - 0.5) < 0.14) {
            const ringR = (0.14 - Math.abs(u - 0.5)) * 180;
            ctx.strokeStyle = "rgba(244, 63, 94, 0.7)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(turnX, cy, ringR, 0, Math.PI * 2);
            ctx.stroke();
          }

          drawSphere3D(ctx, ax, ay, 10.5, "red", { label: "α", glow: true });
          drawBadgePill(ctx, 135, cy - 28, "Va chạm trực diện → Bật ngược > 90°", "#be123c");
          break;
        }

        /* ═══ B21 POSTER 3: CẤU TẠO HẠT NHÂN & NUCLEON ═══ */
        case "nuc_proton": {
          const px = cx - 55;
          const floatY = cy + Math.sin(t * 2.5) * 4;
          drawFloorShadow(ctx, px, floorY, 38, 0.3);
          drawSphere3D(ctx, px, floatY, 34, "red", {
            label: "p",
            subLabel: "+1e",
            glow: true,
            pulsate: Math.sin(t * 3),
          });
          // 3 orbiting quarks inside/around indicator
          for (let i = 0; i < 3; i++) {
            const a = t * 2.4 + (i * Math.PI * 2) / 3;
            drawSphere3D(
              ctx,
              px + Math.cos(a) * 46,
              floatY + Math.sin(a) * 18,
              7,
              i < 2 ? "gold" : "cyan",
              { label: i < 2 ? "u" : "d", glow: true }
            );
          }
          drawBadgePill(ctx, cx + 105, cy - 18, "Điện tích: q = +e ≈ +1,6·10⁻¹⁹ C", "#b91c1c");
          drawBadgePill(ctx, cx + 105, cy + 14, "Khối lượng: Proton ≈ 1,00728 u", "#1e293b");
          break;
        }

        case "nuc_neutron": {
          const nx = cx - 55;
          const floatY = cy + Math.sin(t * 2.5 + 1) * 4;
          drawFloorShadow(ctx, nx, floorY, 38, 0.3);
          drawSphere3D(ctx, nx, floatY, 34, "blue", {
            label: "n",
            subLabel: "q = 0",
            glow: true,
            pulsate: Math.cos(t * 3),
          });
          for (let i = 0; i < 3; i++) {
            const a = -t * 2.2 + (i * Math.PI * 2) / 3;
            drawSphere3D(
              ctx,
              nx + Math.cos(a) * 46,
              floatY + Math.sin(a) * 18,
              7,
              i === 0 ? "gold" : "cyan",
              { label: i === 0 ? "u" : "d", glow: true }
            );
          }
          drawBadgePill(ctx, cx + 105, cy - 18, "Trung hoà điện (q = 0) · Phát hiện 1932", "#1d4ed8");
          drawBadgePill(ctx, cx + 105, cy + 14, "Khối lượng: Neutron ≈ 1,00866 u", "#1e293b");
          break;
        }

        case "nuc_silicon28": {
          // 14 protons + 14 neutrons gliding together into Silicon-28
          const gather = easeInOutCubic(0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.4 + smoothP * Math.PI)));
          const leftX = lerp(cx - 115, cx, gather);
          const rightX = lerp(cx + 115, cx, gather);

          if (gather < 0.85) {
            drawNucleusCluster3D(ctx, leftX, cy, 14, 1.0, 6.8, t, "14 Proton (+)");
            drawNucleusCluster3D(ctx, rightX, cy, 14, 0.0, 6.8, -t, "14 Neutron (0)");
          } else {
            drawFloorShadow(ctx, cx, floorY, 44, 0.32);
            drawNucleusCluster3D(ctx, cx, cy - 4, 28, 0.5, 7.2, t, "Hạt nhân ²⁸₁₄Si (A = 28)");
          }
          drawBadgePill(ctx, 108, 22, "Z = 14 Proton", "#dc2626");
          drawBadgePill(ctx, width - 108, 22, "N = 14 Neutron", "#2563eb");
          break;
        }

        case "nuc_mass_concentration": {
          // 3D seesaw balance comparing Nucleus (99.97%) vs Electrons
          const tilt = 0.16 + 0.03 * Math.sin(t * 3);
          ctx.save();
          ctx.translate(cx, cy + 18);
          ctx.rotate(-tilt);
          ctx.fillStyle = "#475569";
          ctx.fillRect(-130, -3, 260, 6);
          // Heavy nucleus on left pan
          drawNucleusCluster3D(ctx, -95, -24, 12, 0.5, 6.5, t);
          // Feather-light electrons on right pan
          for (let i = 0; i < 6; i++) {
            const a = t * 4 + i;
            drawSphere3D(ctx, 95 + Math.cos(a) * 18, -18 + Math.sin(a) * 8, 4.5, "cyan", {
              label: "-",
              glow: true,
            });
          }
          ctx.restore();

          // Fulcrum triangle
          ctx.fillStyle = "#334155";
          ctx.beginPath();
          ctx.moveTo(cx, cy + 20);
          ctx.lineTo(cx - 16, floorY);
          ctx.lineTo(cx + 16, floorY);
          ctx.closePath();
          ctx.fill();

          drawBadgePill(ctx, 115, 22, "Hầu hết khối lượng ở hạt nhân", "#b45309");
          drawBadgePill(ctx, width - 115, 22, "Proton nặng hơn electron", "#0284c7");
          break;
        }

        case "nuc_amu_unit": {
          // One twelfth of the neutral carbon-12 atom mass defines 1 u.
          const leftX = cx - 95;
          drawFloorShadow(ctx, leftX, floorY, 36, 0.26);
          drawTiltedOrbitWithElectrons(ctx, leftX, cy, 42, 16, Math.PI / 6, 3, t, 2.4);
          drawTiltedOrbitWithElectrons(ctx, leftX, cy, 42, 16, -Math.PI / 6, 3, t + 1, 2.4);
          drawNucleusCluster3D(ctx, leftX, cy, 12, 0.5, 6, t);

          // Animated slice flying out to become 1 amu standard weight
          const sliceT = (t * 0.55 + smoothP * 0.5) % 1;
          const sx = lerp(leftX + 35, cx + 85, easeInOutCubic(sliceT));
          const sy = cy - Math.sin(sliceT * Math.PI) * 18;
          drawSphere3D(ctx, sx, sy, 18, "teal", {
            label: "1 u",
            glow: true,
          });
          drawBadgePill(ctx, cx + 95, floorY - 12, "1 amu ≈ 1,66054 · 10⁻²⁷ kg", "#0d9488");
          break;
        }

        /* ═══ B21 POSTER 4: BÁN KÍNH HẠT NHÂN & QUARK ═══ */
        case "size_formula_sphere": {
          const aValues = [1, 8, 27, 64];
          const idx = Math.floor(((t * 0.45 + smoothP) % 1) * aValues.length);
          const A = aValues[idx];
          const cbrtA = Math.round(Math.pow(A, 1 / 3));
          const radiusPx = 12 * cbrtA;

          drawFloorShadow(ctx, cx - 45, floorY, radiusPx * 1.1, 0.3);
          drawSphere3D(ctx, cx - 45, cy, radiusPx, "teal", { label: `A = ${A}` });

          // Glowing spherical boundary R
          ctx.strokeStyle = "#0284c7";
          ctx.lineWidth = 2.2;
          ctx.setLineDash([5, 3]);
          ctx.beginPath();
          ctx.arc(cx - 45, cy, radiusPx + 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          drawBadgePill(ctx, cx + 105, cy - 16, `Số khối A = ${A}`, "#0284c7");
          drawBadgePill(ctx, cx + 105, cy + 16, `Bán kính ước tính: ${(1.2 * cbrtA).toFixed(1).replace(".", ",")} fm`, "#0f172a");
          break;
        }

        case "size_table_light": {
          const items = [
            { sym: "¹H", A: 1, Z: 1, r: "0,9 fm", x: 85, size: 9 },
            { sym: "⁴He", A: 4, Z: 2, r: "1,7 fm", x: 195, size: 14 },
            { sym: "¹⁶O", A: 16, Z: 8, r: "2,7 fm", x: 315, size: 21 },
            { sym: "²⁸Si", A: 28, Z: 14, r: "3,1 fm", x: 435, size: 25 },
          ];
          items.forEach((it) => {
            drawFloorShadow(ctx, it.x, floorY, it.size * 1.1, 0.25);
            drawNucleusCluster3D(ctx, it.x, cy - 6, it.A, it.Z / it.A, Math.max(4, it.size * 0.22), t);
            drawBadgePill(ctx, it.x, floorY - 8, `${it.sym}: ${it.r}`, "#15803d");
          });
          break;
        }

        case "size_table_heavy": {
          const items = [
            { sym: "⁵⁶Fe", r: "3,7 fm", x: 85, size: 20, col: "blue" as const },
            { sym: "¹¹⁴Cd", r: "4,6 fm", x: 195, size: 24, col: "purple" as const },
            { sym: "¹⁹⁷Au", r: "5,4 fm", x: 315, size: 28, col: "gold" as const },
            { sym: "²³⁸U", r: "5,9 fm", x: 435, size: 32, col: "red" as const },
          ];
          items.forEach((it) => {
            drawFloorShadow(ctx, it.x, floorY, it.size * 1.1, 0.28);
            drawSphere3D(ctx, it.x, cy - 8, it.size, it.col, {
              label: it.sym,
              glow: true,
            });
            drawBadgePill(ctx, it.x, floorY - 8, `R = ${it.r}`, "#b45309");
          });
          break;
        }

        case "size_atom_vs_nucleus": {
          const atomX = 135;
          drawTiltedOrbitWithElectrons(ctx, atomX, cy, 52, 20, Math.PI / 6, 2, t, 2.5);
          drawTiltedOrbitWithElectrons(ctx, atomX, cy, 52, 20, -Math.PI / 6, 2, t + 1.4, 2.5);
          drawSphere3D(ctx, atomX, cy, 4, "red", { glow: true });

          // Magnifying zoom cone from tiny center to giant nucleus on right
          const zoomX = 365;
          ctx.fillStyle = "rgba(124, 58, 237, 0.12)";
          ctx.strokeStyle = "rgba(124, 58, 237, 0.55)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.moveTo(atomX, cy - 4);
          ctx.lineTo(zoomX, cy - 36);
          ctx.lineTo(zoomX, cy + 36);
          ctx.lineTo(atomX, cy + 4);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.setLineDash([]);

          drawNucleusCluster3D(ctx, zoomX, cy, 12, 0.5, 6.8, t);
          drawBadgePill(ctx, atomX, floorY - 8, "Nguyên tử ~ 10⁻¹⁰ m", "#6d28d9");
          drawBadgePill(ctx, zoomX, floorY - 8, "Hạt nhân nhỏ hơn nhiều", "#be123c");
          break;
        }

        case "size_quark_scale": {
          // 6 stages from Crystal -> Molecule -> Atom -> Nucleus -> Proton -> 3 Quarks (u,u,d)
          const stages = [
            { lbl: "Tinh thể", scale: "10⁻² m", col: "slate" as const, x: 52 },
            { lbl: "Phân tử", scale: "10⁻⁹ m", col: "teal" as const, x: 132 },
            { lbl: "Nguyên tử", scale: "10⁻¹⁰ m", col: "cyan" as const, x: 212 },
            { lbl: "Hạt nhân", scale: "10⁻¹⁴ m", col: "gold" as const, x: 292 },
            { lbl: "Proton", scale: "10⁻¹⁵ m", col: "red" as const, x: 372 },
            { lbl: "Quark", scale: "<10⁻¹⁸ m", col: "purple" as const, x: 458 },
          ];
          stages.forEach((st, i) => {
            if (i < stages.length - 1) {
              ctx.strokeStyle = "rgba(100,116,139,0.45)";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(st.x + 22, cy - 6);
              ctx.lineTo(stages[i + 1].x - 22, cy - 6);
              ctx.stroke();
            }
            if (i === 5) {
              // 3 Quarks (u, u, d) connected by gluon springs inside circle
              ctx.strokeStyle = "rgba(225, 29, 72, 0.5)";
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(st.x, cy - 6, 22, 0, Math.PI * 2);
              ctx.stroke();
              for (let q = 0; q < 3; q++) {
                const a = t * 3.2 + (q * Math.PI * 2) / 3;
                drawSphere3D(
                  ctx,
                  st.x + Math.cos(a) * 11,
                  cy - 6 + Math.sin(a) * 11,
                  6.5,
                  q < 2 ? "gold" : "cyan",
                  { label: q < 2 ? "u" : "d", glow: true }
                );
              }
            } else {
              drawSphere3D(ctx, st.x, cy - 6, 18, st.col, {
                label: st.lbl.slice(0, 2),
                glow: true,
              });
            }
            drawBadgePill(ctx, st.x, floorY - 8, st.scale, "#1e293b");
          });
          break;
        }

        /* ═══ B21 POSTER 5: KÍ HIỆU HẠT NHÂN ═══ */
        case "not_rule_azx":
        case "not_carbon12":
        case "not_helium4":
        case "not_nitrogen14":
        case "not_gold197": {
          const spec =
            sceneKey === "not_carbon12"
              ? { a: "12", z: "6", sym: "C", p: 6, n: 6, col: "green" as const }
              : sceneKey === "not_helium4"
              ? { a: "4", z: "2", sym: "He", p: 2, n: 2, col: "gold" as const }
              : sceneKey === "not_nitrogen14"
              ? { a: "14", z: "7", sym: "N", p: 7, n: 7, col: "blue" as const }
              : sceneKey === "not_gold197"
              ? { a: "197", z: "79", sym: "Au", p: 14, n: 18, col: "purple" as const }
              : { a: "A", z: "Z", sym: "X", p: 6, n: 6, col: "orange" as const };

          // Giant 3D Notation Card on Left
          ctx.fillStyle = "#1e293b";
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(62, cy - 38, 92, 76, 14);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#facc15";
          ctx.font = "800 17px sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(spec.a, 96, cy - 10);
          ctx.fillStyle = "#f87171";
          ctx.fillText(spec.z, 96, cy + 20);
          ctx.fillStyle = "#ffffff";
          ctx.font = "900 32px sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(spec.sym, 102, cy + 12);

          // 3D Rotating Nucleus Cluster in Center
          drawFloorShadow(ctx, cx + 10, floorY, 38, 0.28);
          drawTiltedOrbitWithElectrons(ctx, cx + 10, cy, 48, 18, Math.PI / 6, 2, t, 2.3);
          drawNucleusCluster3D(ctx, cx + 10, cy, spec.p + spec.n, spec.p / (spec.p + spec.n), 6.5, t);

          // Callouts on Right
          drawBadgePill(
            ctx,
            width - 108,
            cy - 22,
            `Số proton Z = ${spec.z}`,
            "#dc2626"
          );
          drawBadgePill(
            ctx,
            width - 108,
            cy + 4,
            `Số khối A = ${spec.a}`,
            "#d97706"
          );
          drawBadgePill(
            ctx,
            width - 108,
            cy + 30,
            spec.a === "A" ? "Số neutron N = A − Z" : `Số neutron N = ${Number(spec.a) - Number(spec.z)}`,
            "#2563eb"
          );
          break;
        }

        /* ═══ B21 POSTER 6: ĐỒNG VỊ (ISOTOPES) ═══ */
        case "iso_definition":
        case "iso_hydrogen": {
          const isotopes = [
            { name: "¹₁H (Protium)", p: 1, n: 0, x: 105 },
            { name: "²₁D (Deuterium)", p: 1, n: 1, x: 260 },
            { name: "³₁T (Tritium)", p: 1, n: 2, x: 415 },
          ];
          isotopes.forEach((iso, idx) => {
            drawFloorShadow(ctx, iso.x, floorY, 34, 0.24);
            drawTiltedOrbitWithElectrons(ctx, iso.x, cy - 4, 38, 15, Math.PI / 7, 1, t + idx, 2.8);
            // Draw exact protons (1 red) and neutrons (0, 1, or 2 blue)
            drawSphere3D(ctx, iso.x - (iso.n > 0 ? 5 : 0), cy - 4, 9, "red", {
              label: "+",
              glow: true,
            });
            if (iso.n >= 1) {
              drawSphere3D(ctx, iso.x + 7, cy - 6, 9, "blue", { label: "0", glow: true });
            }
            if (iso.n >= 2) {
              drawSphere3D(ctx, iso.x + 2, cy + 5, 9, "blue", { label: "0", glow: true });
            }
            drawBadgePill(ctx, iso.x, floorY - 8, `${iso.name}: 1p, ${iso.n}n`, idx === 2 ? "#be123c" : "#0284c7");
          });
          break;
        }

        case "iso_carbon": {
          const cIsotopes = [
            { name: "¹²₆C (6p, 6n)", total: 12, x: 105, col: "#15803d" },
            { name: "¹³₆C (6p, 7n)", total: 13, x: 260, col: "#0369a1" },
            { name: "¹⁴₆C (6p, 8n)", total: 14, x: 415, col: "#b91c1c" },
          ];
          cIsotopes.forEach((iso, idx) => {
            drawFloorShadow(ctx, iso.x, floorY, 36, 0.26);
            drawTiltedOrbitWithElectrons(ctx, iso.x, cy - 4, 42, 16, Math.PI / 6, 2, t + idx, 2.4);
            drawNucleusCluster3D(ctx, iso.x, cy - 4, iso.total, 6 / iso.total, 6.2, t + idx);
            drawBadgePill(ctx, iso.x, floorY - 8, iso.name, iso.col);
          });
          break;
        }

        case "iso_stable_vs_radioactive": {
          const leftX = 140;
          const rightX = 365;
          drawFloorShadow(ctx, leftX, floorY, 36, 0.25);
          drawNucleusCluster3D(ctx, leftX, cy - 4, 12, 0.5, 6.5, t);
          drawBadgePill(ctx, leftX, floorY - 8, "Carbon-12 bền", "#15803d");

          drawFloorShadow(ctx, rightX, floorY, 36, 0.25);
          drawNucleusCluster3D(ctx, rightX, cy - 4, 14, 6 / 14, 6.5, t);
          drawBadgePill(ctx, rightX, floorY - 8, "Carbon-14 phóng xạ", "#be123c");
          break;
        }

        case "iso_density_question": {
          // The boundary represents comparable atomic volume, not the nucleus.
          const x1 = 150;
          const x2 = 370;
          for (const [x, a] of [[x1, 12], [x2, 13]]) {
            ctx.strokeStyle = "rgba(100, 116, 139, 0.55)";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.arc(x, cy - 6, 38, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            drawNucleusCluster3D(ctx, x, cy - 6, a, 6 / a, 5, t);
          }
          drawBadgePill(ctx, x1, floorY - 8, "Carbon-12: 6 neutron", "#0284c7");
          drawBadgePill(ctx, x2, floorY - 8, "Carbon-13: 7 neutron", "#b45309");
          break;
        }

        /* ═══ B22–B25 SCENES (Phản ứng hạt nhân, Phóng xạ, Công nghệ hạt nhân) ═══ */
        case "b22_fission_fusion": {
          // Left: U-235 Fission; Right: D + T Fusion
          const uX = 140;
          const split = (t * 0.6 + smoothP * 0.5) % 1;
          if (split < 0.45) {
            const nx = lerp(55, uX - 18, split / 0.45);
            drawSphere3D(ctx, nx, cy, 6.5, "blue", { label: "n", glow: true });
            drawSphere3D(ctx, uX, cy, 24, "gold", { label: "²³⁵U", glow: true });
          } else {
            const k = (split - 0.45) / 0.55;
            drawSphere3D(ctx, uX - k * 34, cy - k * 20, 16, "green", { label: "Y-95", glow: true });
            drawSphere3D(ctx, uX + k * 34, cy + k * 20, 18, "purple", { label: "I-138", glow: true });
            [-1, 0, 1].forEach((d) => {
              drawSphere3D(ctx, uX + k * 58, cy + d * k * 28, 5.5, "blue", { label: "n", glow: true });
            });
          }
          drawBadgePill(ctx, uX, floorY - 8, "Phân hạch ²³⁵U (~200 MeV)", "#b45309");

          const fX = 375;
          const fuse = (t * 0.65 + smoothP * 0.5) % 1;
          if (fuse < 0.5) {
            const k = easeInOutCubic(fuse * 2);
            drawSphere3D(ctx, lerp(fX - 48, fX - 8, k), cy, 13, "red", { label: "D", glow: true });
            drawSphere3D(ctx, lerp(fX + 48, fX + 8, k), cy, 15, "orange", { label: "T", glow: true });
          } else {
            const k = (fuse - 0.5) * 2;
            drawSphere3D(ctx, fX - k * 18, cy, 18, "gold", { label: "⁴He", glow: true });
            drawSphere3D(ctx, fX + k * 52, cy - k * 18, 7, "blue", { label: "n", glow: true });
          }
          drawBadgePill(ctx, fX, floorY - 8, "Nhiệt hạch D + T (17,6 MeV)", "#dc2626");
          break;
        }

        case "b23_three_rays_penetration": {
          // Paper, Aluminum, Lead barriers + alpha, beta, gamma rays
          const barriers = [
            { x: 195, lbl: "Giấy", col: "#cbd5e1", w: 8 },
            { x: 305, lbl: "Nhôm (mm)", col: "#60a5fa", w: 12 },
            { x: 425, lbl: "Chì (cm)", col: "#334155", w: 20 },
          ];
          barriers.forEach((b) => {
            ctx.fillStyle = b.col;
            ctx.beginPath();
            ctx.roundRect(b.x, 16, b.w, height - 38, 4);
            ctx.fill();
            drawBadgePill(ctx, b.x + b.w / 2, floorY - 6, b.lbl, "#1e293b");
          });

          const rayProg = (t * 0.65 + smoothP * 0.4) % 1;
          // Alpha stops at paper
          drawSphere3D(ctx, lerp(55, 188, rayProg), cy - 26, 9, "gold", { label: "α", glow: true });
          // Beta stops at aluminum
          drawSphere3D(ctx, lerp(55, 298, rayProg), cy, 6.5, "cyan", { label: "β", glow: true });
          // Gamma penetrates through to lead
          const gx = lerp(55, 440, rayProg);
          ctx.strokeStyle = "#a855f7";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          for (let x = 55; x <= gx; x += 4) {
            const y = cy + 26 + Math.sin(x * 0.25 - t * 14) * 4;
            if (x === 55) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          drawSphere3D(ctx, gx, cy + 26, 6, "purple", { label: "γ", glow: true });
          break;
        }

        case "b22_blackett_reaction": {
          // Alpha + N-14 -> O-17 + p in Blackett's Cloud Chamber (SGK Hình 22.2)
          const cycle = (t * 0.55 + smoothP * 0.5) % 1;
          const hitX = cx - 15;
          // Cloud chamber background tracks
          ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
          ctx.lineWidth = 2;
          [cy - 34, cy + 34].forEach((yL) => {
            ctx.beginPath();
            ctx.moveTo(45, yL);
            ctx.lineTo(width - 45, yL);
            ctx.stroke();
          });

          if (cycle < 0.45) {
            const ax = lerp(55, hitX, cycle / 0.45);
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(55, cy);
            ctx.lineTo(ax, cy);
            ctx.stroke();
            drawSphere3D(ctx, ax, cy, 11, "gold", { label: "⁴₂He", glow: true });
            drawSphere3D(ctx, hitX, cy, 16, "blue", { label: "¹⁴₇N", glow: true });
          } else {
            const after = (cycle - 0.45) / 0.55;
            // Incoming track up to collision
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(55, cy);
            ctx.lineTo(hitX, cy);
            ctx.stroke();

            // Proton track (long, thin)
            const px = lerp(hitX, width - 55, after);
            const py = lerp(cy, cy - 38, after);
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.moveTo(hitX, cy);
            ctx.lineTo(px, py);
            ctx.stroke();
            ctx.setLineDash([]);
            drawSphere3D(ctx, px, py, 9, "red", { label: "¹₁H", glow: true });

            // Oxygen-17 track (short, thick)
            const ox = lerp(hitX, hitX + 95, after);
            const oy = lerp(cy, cy + 28, after);
            ctx.strokeStyle = "#0284c7";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(hitX, cy);
            ctx.lineTo(ox, oy);
            ctx.stroke();
            drawSphere3D(ctx, ox, oy, 17, "cyan", { label: "¹⁷₈O", glow: true });
          }
          drawBadgePill(ctx, cx, floorY - 8, "⁴₂He + ¹⁴₇N → ¹⁷₈O + ¹₁H (Blackett 1925)", "#0f172a");
          break;
        }

        case "b22_conservation_laws": {
          // Conservation of A (4 + 14 = 17 + 1 = 18) and Z (2 + 7 = 8 + 1 = 9)
          drawSphere3D(ctx, 88, cy - 8, 16, "gold", { label: "⁴₂He", glow: true });
          drawSphere3D(ctx, 168, cy - 8, 22, "blue", { label: "¹⁴₇N", glow: true });
          ctx.fillStyle = "#334155";
          ctx.font = "900 18px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("+", 126, cy - 4);
          ctx.fillText("→", cx, cy - 4);
          drawSphere3D(ctx, 342, cy - 8, 24, "cyan", { label: "¹⁷₈O", glow: true });
          ctx.fillText("+", 392, cy - 4);
          drawSphere3D(ctx, 432, cy - 8, 12, "red", { label: "¹₁p", glow: true });

          drawBadgePill(ctx, 135, floorY - 8, "Trước: ∑A = 18 · ∑Z = 9", "#1d4ed8");
          drawBadgePill(ctx, 385, floorY - 8, "Sau: ∑A = 18 · ∑Z = 9 ✓", "#15803d");
          break;
        }

        case "b22_mass_defect":
        case "b22_binding_energy": {
          // Relativistic mass defect Delta m & E_lk = Delta m * c^2
          const merge = 0.5 + 0.5 * Math.sin(t * 2.1 + smoothP * Math.PI);
          const sep = lerp(52, 9, easeInOutCubic(merge));
          const coords: [number, number, SphereColorTheme, string][] = [
            [-sep, -sep * 0.45, "red", "p"],
            [sep, -sep * 0.45, "red", "p"],
            [-sep, sep * 0.45, "blue", "n"],
            [sep, sep * 0.45, "blue", "n"],
          ];
          coords.forEach(([dx, dy, col, lbl]) => {
            drawSphere3D(ctx, cx - 55 + dx, cy - 6 + dy, 12, col, { label: lbl, glow: true });
          });

          if (merge > 0.55) {
            const rWave = (merge - 0.5) * 95;
            ctx.strokeStyle = `rgba(234, 179, 8, ${1 - (merge - 0.5) * 1.8})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx - 55, cy - 6, rWave, 0, Math.PI * 2);
            ctx.stroke();
          }

          drawBadgePill(
            ctx,
            cx + 112,
            cy - 18,
            sceneKey === "b22_mass_defect"
              ? "Độ hụt khối"
              : "Năng lượng liên kết",
            "#b45309"
          );
          drawBadgePill(
            ctx,
            cx + 112,
            cy + 14,
            sceneKey === "b22_mass_defect"
              ? "Khối lượng hạt nhân < Tổng nucleon rời"
              : "Giá trị tính trên mỗi nucleon",
            "#15803d"
          );
          break;
        }

        case "b23_becquerel_discovery":
        case "b23_deflection_field": {
          // Deflection of alpha (+), beta- (-), beta+ (+), gamma (0) in electric/magnetic field
          const srcX = 78;
          drawSphere3D(ctx, srcX, cy, 20, "slate", { label: "Nguồn", glow: true });

          // Top plate (-) and Bottom plate (+)
          ctx.fillStyle = "#1d4ed8";
          ctx.fillRect(150, 10, 220, 8);
          ctx.fillStyle = "#dc2626";
          ctx.fillRect(150, height - 22, 220, 8);

          const u = (t * 0.65 + smoothP * 0.4) % 1;
          // Gamma straight (0)
          const gx = lerp(srcX + 22, 435, u);
          drawSphere3D(ctx, gx, cy, 6.5, "purple", { label: "γ", glow: true });
          // Alpha bends slightly toward (-) plate
          const ax = lerp(srcX + 22, 415, u);
          const ay = cy - u * u * 26;
          drawSphere3D(ctx, ax, ay, 10, "gold", { label: "α", glow: true });
          // Beta- bends strongly toward (+) plate
          const bx = lerp(srcX + 22, 365, u);
          const by = cy + u * u * 42;
          drawSphere3D(ctx, bx, by, 6, "cyan", { label: "β⁻", glow: true });

          drawBadgePill(ctx, 445, cy - 28, "α (+2e)", "#b45309");
          drawBadgePill(ctx, 445, cy, "γ (0)", "#7e22ce");
          drawBadgePill(ctx, 445, cy + 28, "β⁻ (−e)", "#0284c7");
          break;
        }

        case "b23_half_life_curve":
        case "b23_activity_geiger": {
          // 16 3D nuclei decaying over half-lives T -> N = N0 * 2^(-t/T) + Geiger counter
          const stepT = Math.floor(((t * 0.35 + smoothP) % 1) * 4); // 0, 1T, 2T, 3T
          const remaining = Math.round(16 * Math.pow(0.5, stepT));
          for (let i = 0; i < 16; i++) {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const nx = 70 + col * 32;
            const ny = 24 + row * 24;
            const isAlive = i < remaining;
            drawSphere3D(ctx, nx, ny, 9.5, isAlive ? "green" : "slate", {
              label: isAlive ? "X" : "Y",
              glow: isAlive,
            });
          }
          drawBadgePill(ctx, cx + 88, cy - 18, `t = ${stepT}T → N còn ${remaining}/16 hạt`, "#15803d");
          drawBadgePill(ctx, cx + 88, cy + 16, "Số hạt chưa phân rã giảm dần", "#0f172a");
          break;
        }

        case "b24_reactor_core":
        case "b24_pwr_plant": {
          // Nuclear Reactor Core with Fuel Rods, Control Rods, and Turbine Energy Loop
          const rodDepth = 0.35 + 0.25 * Math.sin(t * 1.8);
          for (let i = 0; i < 3; i++) {
            const rx = 95 + i * 48;
            // Fuel rod (gold)
            ctx.fillStyle = "#f59e0b";
            ctx.beginPath();
            ctx.roundRect(rx - 7, 26, 14, 76, 4);
            ctx.fill();
            // Control rod (dark boron/cadmium moving up/down)
            ctx.fillStyle = "#334155";
            ctx.beginPath();
            ctx.roundRect(rx + 12, 12, 10, 70 * rodDepth, 3);
            ctx.fill();
          }
          // Neutrons bouncing between fuel rods
          for (let n = 0; n < 5; n++) {
            const nx = 85 + ((t * 95 + n * 37) % 120);
            const ny = 35 + Math.sin(t * 5 + n) * 25;
            drawSphere3D(ctx, nx, ny, 5.5, "cyan", { label: "n", glow: true });
          }
          drawBadgePill(ctx, cx + 105, cy - 16, "Thanh điều khiển hấp thụ neutron", "#b45309");
          drawBadgePill(ctx, cx + 105, cy + 16, "Phân hạch tạo nhiệt", "#0284c7");
          break;
        }

        case "b24_nuclear_medicine": {
          const distance = 128 * ((t * 0.9) % 1);
          ctx.fillStyle = "#334155";
          ctx.fillRect(cx - 153, cy - 29, 16, 58);
          ctx.fillRect(cx + 137, cy - 29, 16, 58);
          drawSphere3D(ctx, cx - distance, cy, 6, "purple", { label: "γ" });
          drawSphere3D(ctx, cx + distance, cy, 6, "purple", { label: "γ" });
          drawBadgePill(ctx, cx, 17, "Hủy cặp positron và electron", "#7e22ce");
          drawBadgePill(ctx, cx, height - 16, "Hai đầu dò ghi nhận hai photon gamma", "#334155");
          break;
        }

        case "b24_agri_industry": {
          drawSphere3D(ctx, 105, cy, 22, "gold", { label: "Nguồn" });
          const marker = 131 + 172 * ((t * 0.8) % 1);
          drawSphere3D(ctx, marker, cy, 6, "purple", { label: "γ" });
          ctx.fillStyle = "#047857";
          ctx.fillRect(321, cy - 28, 82, 56);
          drawBadgePill(ctx, 363, height - 18, "Sản phẩm được chiếu xạ", "#065f46");
          break;
        }

        case "b25_decay_data": {
          const left = 52, right = width - 35, top = 22, bottom = height - 27;
          const x = (seconds: number) => left + (right - left) * seconds / 360;
          const y = (activity: number) => bottom - (bottom - top) * activity / 160;
          ctx.strokeStyle = "#334155";
          ctx.beginPath();
          ctx.moveTo(left, top);
          ctx.lineTo(left, bottom);
          ctx.lineTo(right, bottom);
          ctx.stroke();
          ctx.font = "600 11px system-ui, sans-serif";
          ctx.fillStyle = "#334155";
          ctx.textAlign = "right";
          for (const h of [0, 50, 100, 150]) ctx.fillText(String(h), left - 5, y(h) + 4);
          ctx.textAlign = "center";
          for (const seconds of [0, 60, 120, 180, 240, 300, 360]) ctx.fillText(String(seconds), x(seconds), bottom + 12);
          ctx.fillText("Hoạt độ (Bq)", left + 26, 11);
          ctx.fillText("Thời gian (s)", right - 39, height - 3);
          const half = y(SGK_25_1_HALF_ACTIVITY);
          ctx.strokeStyle = "#a16207";
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(left, half);
          ctx.lineTo(right, half);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "#0f766e";
          for (const { t: seconds, h } of SGK_TABLE_25_1) {
            ctx.beginPath();
            ctx.arc(x(seconds), y(h), 4, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        default: {
          // Rich default 3D nuclear animation
          drawFloorShadow(ctx, cx, floorY, 44, 0.28);
          drawTiltedOrbitWithElectrons(ctx, cx, cy - 4, 65, 24, Math.PI / 6, 2, t, 2.4);
          drawTiltedOrbitWithElectrons(ctx, cx, cy - 4, 65, 24, -Math.PI / 6, 2, t + 1.5, 2.4);
          drawNucleusCluster3D(ctx, cx, cy - 4, 14, 0.5, 7, t);
          break;
        }
      }

      ctx.restore();
      if (!reducedMotion.matches) rafId = requestAnimationFrame(render);
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      cancelAnimationFrame(rafId);
      if (visible && !document.hidden) {
        rafId = requestAnimationFrame(render);
      }
    };
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    visibility.observe(canvas);
    redraw.current = sync;
    document.addEventListener("visibilitychange", sync);
    reducedMotion.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(rafId);
      visibility.disconnect();
      redraw.current = null;
      document.removeEventListener("visibilitychange", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, [sceneKey, width, height]);

  return (
    <canvas
      ref={canvasRef}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        interactRef.current.targetPx = ((e.clientX - r.left) / r.width - 0.5) * 16;
        interactRef.current.targetPy = ((e.clientY - r.top) / r.height - 0.5) * 10;
      }}
      onPointerLeave={() => {
        interactRef.current.targetPx = 0;
        interactRef.current.targetPy = 0;
      }}
      style={{
        width: "100%",
        maxWidth: `${width}px`,
        height: `${height}px`,
        display: "block",
        margin: "0 auto",

      }}
    />
  );
}
