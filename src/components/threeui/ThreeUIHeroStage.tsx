"use client";

import React, { useEffect, useRef, useState } from "react";
import { LatexMath } from "@/components/learning/LatexMath";

type StageMode = "structure" | "fission" | "radiation" | "reactor";

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface Nucleon3D {
  baseX: number;
  baseY: number;
  baseZ: number;
  type: "proton" | "neutron";
  phase: number;
}

interface Electron3D {
  radius: number;
  tiltX: number;
  tiltZ: number;
  speed: number;
  angle: number;
}

const MODE_META: Record<
  StageMode,
  {
    label: string;
    title: string;
    latex: string;
    desc: string;
  }
> = {
  structure: {
    label: "Bài 21 · Hạt nhân",
    title: "Cấu trúc hạt nhân và quỹ đạo nguyên tử",
    latex: "A = Z + N, \\quad R \\approx 1{,}2 \\times 10^{-15} \\cdot A^{1/3}\\text{ (m)}",
    desc: "Kéo chuột xoay 360° để quan sát các nucleon (proton và neutron) liên kết chặt trong hạt nhân.",
  },
  fission: {
    label: "Bài 22 · Phân hạch",
    title: "Phản ứng phân hạch dây chuyền Uranium-235",
    latex:
      "{}_{0}^{1}\\text{n} + {}_{92}^{235}\\text{U} \\rightarrow {}_{56}^{141}\\text{Ba} + {}_{36}^{92}\\text{Kr} + 3\\,{}_{0}^{1}\\text{n} + 200\\text{ MeV}",
    desc: "Neutron nhiệt kích hoạt sự phân tách hạt nhân nặng thành hai hạt nhân trung bình và giải phóng năng lượng.",
  },
  radiation: {
    label: "Bài 23 · Phóng xạ",
    title: "Sự lệch của tia phóng xạ trong từ trường",
    latex:
      "N(t) = N_0 \\cdot 2^{-\\frac{t}{T}} = N_0 \\cdot e^{-\\lambda t}, \\quad \\vec{F}_{\\text{L}} = q(\\vec{v} \\times \\vec{B})",
    desc: "Quan sát quỹ đạo của chùm hạt alpha (+2e), beta âm (-e) và tia gamma (q = 0) khi đi qua từ trường đều.",
  },
  reactor: {
    label: "Bài 24 · Lò phản ứng",
    title: "Điều khiển hệ số nhân neutron trong lò PWR",
    latex:
      "k = 1 \\text{ (trạng thái tới hạn)}, \\quad \\Delta E = (m_{\\text{trước}} - m_{\\text{sau}})c^2",
    desc: "Điều chỉnh độ ngập của thanh hấp thụ Boron/Cadmium để kiểm soát mật độ neutron nhiệt trong vùng tâm lò.",
  },
};

export function ThreeUIHeroStage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<StageMode>("structure");
  const [controlRodDepth, setControlRodDepth] = useState<number>(45);
  const [fissionPulse, setFissionPulse] = useState<number>(0);

  const camRef = useRef({
    rotX: 0.32,
    rotY: -0.45,
    targetRotX: 0.32,
    targetRotY: -0.45,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    autoRotate: true,
    clickImpulse: 0,
    clickWaves: [] as { x: number; y: number; progress: number }[],
  });

  const modeRef = useRef<StageMode>(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const rodRef = useRef<number>(controlRodDepth);
  useEffect(() => {
    rodRef.current = controlRodDepth;
  }, [controlRodDepth]);

  const fissionTriggerRef = useRef<number>(0);
  useEffect(() => {
    fissionTriggerRef.current = fissionPulse;
  }, [fissionPulse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let time = 0;

    const nucleons: Nucleon3D[] = [];
    const totalNucleons = 28;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < totalNucleons; i++) {
      const y = 1 - (i / (totalNucleons - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      const shell = i < 6 ? 18 : 38;
      nucleons.push({
        baseX: Math.cos(theta) * r * shell,
        baseY: y * shell,
        baseZ: Math.sin(theta) * r * shell,
        type: i % 2 === 0 ? "proton" : "neutron",
        phase: i * 0.7,
      });
    }

    const electrons: Electron3D[] = [
      { radius: 135, tiltX: 0.55, tiltZ: 0.25, speed: 1.8, angle: 0 },
      { radius: 135, tiltX: 0.55, tiltZ: 0.25, speed: 1.8, angle: Math.PI },
      { radius: 150, tiltX: -0.65, tiltZ: 0.85, speed: 1.45, angle: 1.1 },
      { radius: 150, tiltX: -0.65, tiltZ: 0.85, speed: 1.45, angle: 1.1 + Math.PI },
      { radius: 162, tiltX: 0.15, tiltZ: -0.95, speed: 1.2, angle: 2.3 },
      { radius: 162, tiltX: 0.15, tiltZ: -0.95, speed: 1.2, angle: 2.3 + Math.PI },
    ];

    const stars: Vec3[] = Array.from({ length: 55 }, (_, i) => ({
      x: ((i * 73) % 400) - 200,
      y: ((i * 131) % 300) - 150,
      z: ((i * 197) % 360) - 180,
    }));

    function rotate3D(p: Vec3, rx: number, ry: number): Vec3 {
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const x1 = p.x * cosY - p.z * sinY;
      const z1 = p.x * sinY + p.z * cosY;

      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const y2 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;

      return { x: x1, y: y2, z: z2 };
    }

    function project3D(
      p: Vec3,
      cx: number,
      cy: number,
      fov = 520
    ): { sx: number; sy: number; scale: number; z: number } {
      const dist = fov + p.z;
      const scale = fov / Math.max(80, dist);
      return {
        sx: cx + p.x * scale,
        sy: cy + p.y * scale,
        scale,
        z: p.z,
      };
    }

    function drawShadedSphere(
      x: number,
      y: number,
      r: number,
      theme: "proton" | "neutron" | "electron" | "gold" | "emerald",
      alpha = 1
    ) {
      if (!ctx || r <= 0.5) return;
      ctx.save();
      ctx.globalAlpha = alpha;

      const palette = {
        proton: { hi: "#fecdd3", mid: "#e11d48", lo: "#881337", glow: "rgba(225,29,72,0.35)" },
        neutron: { hi: "#e0f2fe", mid: "#0284c7", lo: "#0c4a6e", glow: "rgba(2,132,199,0.35)" },
        electron: { hi: "#f8fafc", mid: "#38bdf8", lo: "#0369a1", glow: "rgba(56,189,248,0.55)" },
        gold: { hi: "#fef9c3", mid: "#d97706", lo: "#78350f", glow: "rgba(217,119,6,0.45)" },
        emerald: { hi: "#d1fae5", mid: "#059669", lo: "#064e3b", glow: "rgba(5,150,105,0.45)" },
      }[theme];

      const glowGrad = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.9);
      glowGrad.addColorStop(0, palette.glow);
      glowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.9, 0, Math.PI * 2);
      ctx.fill();

      const grad = ctx.createRadialGradient(
        x - r * 0.35,
        y - r * 0.35,
        r * 0.08,
        x,
        y,
        r
      );
      grad.addColorStop(0, palette.hi);
      grad.addColorStop(0.45, palette.mid);
      grad.addColorStop(1, palette.lo);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.arc(x - r * 0.32, y - r * 0.32, Math.max(1, r * 0.2), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function render() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      if (
        canvas.width !== Math.floor(rect.width * dpr) ||
        canvas.height !== Math.floor(rect.height * dpr)
      ) {
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const W = rect.width;
      const H = rect.height;
      const cx = W * 0.5;
      const cy = H * 0.5;

      time += 0.016;

      const cam = camRef.current;
      if (cam.autoRotate && !cam.isDragging) {
        cam.targetRotY += 0.0045;
      }
      cam.rotX += (cam.targetRotX - cam.rotX) * 0.1;
      cam.rotY += (cam.targetRotY - cam.rotY) * 0.1;
      if (cam.clickImpulse > 0) {
        cam.clickImpulse = Math.max(0, cam.clickImpulse - 0.032);
      }
      const impulseScale =
        1 + Math.sin(cam.clickImpulse * Math.PI) * 0.46 * cam.clickImpulse;

      const bgGrad = ctx.createRadialGradient(
        cx,
        cy * 0.85,
        10,
        cx,
        cy,
        Math.max(W, H) * 0.75
      );
      bgGrad.addColorStop(0, "#111827");
      bgGrad.addColorStop(0.6, "#090d16");
      bgGrad.addColorStop(1, "#030712");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // 3D Potential Well Space Grid
      ctx.save();
      ctx.strokeStyle = "rgba(148, 163, 184, 0.14)";
      ctx.lineWidth = 1;
      const gridSize = 210;
      const step = 30;
      for (let gx = -gridSize; gx <= gridSize; gx += step) {
        ctx.beginPath();
        let started = false;
        for (let gz = -gridSize; gz <= gridSize; gz += 18) {
          const distSq = gx * gx + gz * gz;
          const dip = 38 * Math.exp(-distSq / 6500);
          const pt = rotate3D({ x: gx, y: 118 + dip, z: gz }, cam.rotX, cam.rotY);
          const pr = project3D(pt, cx, cy);
          if (!started) {
            ctx.moveTo(pr.sx, pr.sy);
            started = true;
          } else {
            ctx.lineTo(pr.sx, pr.sy);
          }
        }
        ctx.stroke();
      }
      for (let gz = -gridSize; gz <= gridSize; gz += step) {
        ctx.beginPath();
        let started = false;
        for (let gx = -gridSize; gx <= gridSize; gx += 18) {
          const distSq = gx * gx + gz * gz;
          const dip = 38 * Math.exp(-distSq / 6500);
          const pt = rotate3D({ x: gx, y: 118 + dip, z: gz }, cam.rotX, cam.rotY);
          const pr = project3D(pt, cx, cy);
          if (!started) {
            ctx.moveTo(pr.sx, pr.sy);
            started = true;
          } else {
            ctx.lineTo(pr.sx, pr.sy);
          }
        }
        ctx.stroke();
      }
      ctx.restore();

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const p = rotate3D(
          {
            x: s.x,
            y: s.y + Math.sin(time * 0.8 + i) * 5,
            z: s.z,
          },
          cam.rotX * 0.6,
          cam.rotY * 0.6
        );
        const pr = project3D(p, cx, cy);
        const alpha = Math.max(0.08, Math.min(0.45, (p.z + 200) / 380));
        ctx.fillStyle = `rgba(203, 213, 225, ${alpha})`;
        ctx.beginPath();
        ctx.arc(pr.sx, pr.sy, Math.max(0.8, 1.5 * pr.scale), 0, Math.PI * 2);
        ctx.fill();
      }

      const activeMode = modeRef.current;

      if (activeMode === "structure") {
        const ringConfigs = [
          { radius: 135, tiltX: 0.55, tiltZ: 0.25 },
          { radius: 150, tiltX: -0.65, tiltZ: 0.85 },
          { radius: 162, tiltX: 0.15, tiltZ: -0.95 },
        ];

        for (const ring of ringConfigs) {
          ctx.beginPath();
          for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.12) {
            const rx0 = Math.cos(a) * ring.radius;
            const rz0 = Math.sin(a) * ring.radius;
            const ry1 = -rz0 * Math.sin(ring.tiltX);
            const rz1 = rz0 * Math.cos(ring.tiltX);
            const rx2 = rx0 * Math.cos(ring.tiltZ) - ry1 * Math.sin(ring.tiltZ);
            const ry2 = rx0 * Math.sin(ring.tiltZ) + ry1 * Math.cos(ring.tiltZ);

            const rot = rotate3D({ x: rx2, y: ry2, z: rz1 }, cam.rotX, cam.rotY);
            const pr = project3D(rot, cx, cy);
            if (a === 0) ctx.moveTo(pr.sx, pr.sy);
            else ctx.lineTo(pr.sx, pr.sy);
          }
          ctx.strokeStyle = "rgba(148, 163, 184, 0.26)";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        const renderList: {
          sx: number;
          sy: number;
          z: number;
          r: number;
          theme: "proton" | "neutron" | "electron";
        }[] = [];

        for (const n of nucleons) {
          const vibrate = Math.sin(time * 4.2 + n.phase) * 2.0;
          const pos = rotate3D(
            {
              x: (n.baseX + vibrate) * impulseScale,
              y: (n.baseY - vibrate * 0.7) * impulseScale,
              z: (n.baseZ + vibrate * 0.5) * impulseScale,
            },
            cam.rotX,
            cam.rotY
          );
          const pr = project3D(pos, cx, cy);
          renderList.push({
            sx: pr.sx,
            sy: pr.sy,
            z: pr.z,
            r: 13.5 * pr.scale,
            theme: n.type,
          });
        }

        for (const el of electrons) {
          const ang = el.angle + time * el.speed;
          const rx0 = Math.cos(ang) * el.radius;
          const rz0 = Math.sin(ang) * el.radius;
          const ry1 = -rz0 * Math.sin(el.tiltX);
          const rz1 = rz0 * Math.cos(el.tiltX);
          const rx2 = rx0 * Math.cos(el.tiltZ) - ry1 * Math.sin(el.tiltZ);
          const ry2 = rx0 * Math.sin(el.tiltZ) + ry1 * Math.cos(el.tiltZ);

          const pos = rotate3D({ x: rx2, y: ry2, z: rz1 }, cam.rotX, cam.rotY);
          const pr = project3D(pos, cx, cy);
          renderList.push({
            sx: pr.sx,
            sy: pr.sy,
            z: pr.z,
            r: 5.5 * pr.scale,
            theme: "electron",
          });
        }

        renderList.sort((a, b) => b.z - a.z);
        for (const item of renderList) {
          drawShadedSphere(item.sx, item.sy, item.r, item.theme);
        }
      } else if (activeMode === "fission") {
        const cycle = (time * 0.65 + fissionTriggerRef.current * 0.9) % 4.2;

        if (cycle < 1.2) {
          const progress = cycle / 1.2;
          const nx = -180 + progress * 155;
          const nPos = rotate3D({ x: nx, y: 0, z: 0 }, cam.rotX, cam.rotY);
          const nPr = project3D(nPos, cx, cy);
          drawShadedSphere(nPr.sx, nPr.sy, 9 * nPr.scale, "neutron");

          for (const n of nucleons) {
            const pos = rotate3D(
              { x: n.baseX * 0.95, y: n.baseY * 0.95, z: n.baseZ * 0.95 },
              cam.rotX,
              cam.rotY
            );
            const pr = project3D(pos, cx, cy);
            drawShadedSphere(pr.sx, pr.sy, 12.5 * pr.scale, n.type);
          }
        } else {
          const splitT = cycle - 1.2;
          const sep = Math.min(135, splitT * 68);

          const shockR = splitT * 85;
          const shockAlpha = Math.max(0, 1 - splitT / 2.6);
          if (shockAlpha > 0.02) {
            ctx.save();
            ctx.strokeStyle = `rgba(226, 232, 240, ${shockAlpha * 0.55})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, shockR, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          const items: {
            sx: number;
            sy: number;
            z: number;
            r: number;
            theme: "proton" | "neutron" | "gold";
          }[] = [];

          nucleons.forEach((n, idx) => {
            const dir = idx % 2 === 0 ? -1 : 1;
            const offsetX = dir * sep;
            const offsetY = dir * Math.sin(idx) * 18;
            const pos = rotate3D(
              {
                x: n.baseX * 0.65 + offsetX,
                y: n.baseY * 0.65 + offsetY,
                z: n.baseZ * 0.65,
              },
              cam.rotX,
              cam.rotY
            );
            const pr = project3D(pos, cx, cy);
            items.push({
              sx: pr.sx,
              sy: pr.sy,
              z: pr.z,
              r: 11 * pr.scale,
              theme: n.type,
            });
          });

          const neutronDirs = [
            { vx: 0.4, vy: -1, vz: 0.3 },
            { vx: 0.9, vy: 0.3, vz: -0.5 },
            { vx: -0.5, vy: 0.9, vz: 0.6 },
          ];
          for (const nd of neutronDirs) {
            const dist = splitT * 95;
            const pos = rotate3D(
              { x: nd.vx * dist, y: nd.vy * dist, z: nd.vz * dist },
              cam.rotX,
              cam.rotY
            );
            const pr = project3D(pos, cx, cy);
            items.push({
              sx: pr.sx,
              sy: pr.sy,
              z: pr.z,
              r: 8.5 * pr.scale,
              theme: "gold",
            });
          }

          items.sort((a, b) => b.z - a.z);
          for (const it of items) {
            drawShadedSphere(it.sx, it.sy, it.r, it.theme);
          }
        }
      } else if (activeMode === "radiation") {
        ctx.save();
        ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
        for (let bx = -90; bx <= 130; bx += 55) {
          for (let by = -70; by <= 70; by += 70) {
            const p1 = project3D(rotate3D({ x: bx, y: by, z: -70 }, cam.rotX, cam.rotY), cx, cy);
            const p2 = project3D(rotate3D({ x: bx, y: by, z: 70 }, cam.rotX, cam.rotY), cx, cy);
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            ctx.stroke();
          }
        }
        ctx.restore();

        const srcPos = project3D(rotate3D({ x: -150, y: 0, z: 0 }, cam.rotX, cam.rotY), cx, cy);
        drawShadedSphere(srcPos.sx, srcPos.sy, 22 * srcPos.scale, "emerald");

        for (let i = 0; i < 6; i++) {
          const prog = ((time * 0.55 + i / 6) % 1) * 280;
          const x = -140 + prog;
          const y = prog > 30 ? -Math.pow((prog - 30) / 19, 1.75) : 0;
          const p = project3D(rotate3D({ x, y, z: 0 }, cam.rotX, cam.rotY), cx, cy);
          drawShadedSphere(p.sx, p.sy, 10.5 * p.scale, "proton");
        }

        for (let i = 0; i < 8; i++) {
          const prog = ((time * 0.85 + i / 8) % 1) * 260;
          const x = -140 + prog;
          const y = prog > 25 ? Math.pow((prog - 25) / 13.5, 1.85) : 0;
          const p = project3D(rotate3D({ x, y, z: 12 }, cam.rotX, cam.rotY), cx, cy);
          drawShadedSphere(p.sx, p.sy, 6 * p.scale, "electron");
        }

        ctx.save();
        ctx.beginPath();
        for (let gx = -130; gx <= 155; gx += 5) {
          const gy = Math.sin(gx * 0.18 - time * 12) * 8;
          const p = project3D(rotate3D({ x: gx, y: gy, z: -10 }, cam.rotX, cam.rotY), cx, cy);
          if (gx === -130) ctx.moveTo(p.sx, p.sy);
          else ctx.lineTo(p.sx, p.sy);
        }
        ctx.strokeStyle = "#f8fafc";
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.restore();
      } else if (activeMode === "reactor") {
        const rodRatio = rodRef.current / 100;
        const activity = 1 - rodRatio * 0.78;

        const cherenkov = ctx.createRadialGradient(cx, cy, 12, cx, cy, 155);
        cherenkov.addColorStop(0, `rgba(14, 165, 233, ${0.42 * activity})`);
        cherenkov.addColorStop(0.55, `rgba(37, 99, 235, ${0.18 * activity})`);
        cherenkov.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = cherenkov;
        ctx.beginPath();
        ctx.arc(cx, cy, 155, 0, Math.PI * 2);
        ctx.fill();

        const rodXPositions = [-75, 0, 75];
        const rodZPositions = [-45, 45];

        for (const rx of rodXPositions) {
          for (const rz of rodZPositions) {
            for (let ry = -75; ry <= 75; ry += 30) {
              const p = project3D(rotate3D({ x: rx, y: ry, z: rz }, cam.rotX, cam.rotY), cx, cy);
              drawShadedSphere(p.sx, p.sy, 11 * p.scale, "proton", 0.85);
            }

            const controlBottomY = -110 + rodRatio * 175;
            for (let cyRod = -110; cyRod <= controlBottomY; cyRod += 22) {
              const p = project3D(
                rotate3D({ x: rx, y: cyRod, z: rz }, cam.rotX, cam.rotY),
                cx,
                cy
              );
              drawShadedSphere(p.sx, p.sy, 8.5 * p.scale, "emerald", 0.95);
            }
          }
        }

        const activeNeutrons = Math.max(3, Math.round(18 * activity));
        for (let i = 0; i < activeNeutrons; i++) {
          const nx = Math.sin(time * (2.2 + (i % 3) * 0.4) + i * 1.7) * 105 * impulseScale;
          const ny = Math.cos(time * 1.9 + i * 2.3) * 70 * impulseScale;
          const nz = Math.sin(time * 1.5 + i) * 55 * impulseScale;
          const p = project3D(rotate3D({ x: nx, y: ny, z: nz }, cam.rotX, cam.rotY), cx, cy);
          drawShadedSphere(p.sx, p.sy, 6.5 * p.scale, "gold");
        }
      }

      // Render 3D Click Shockwaves on the Viewport
      for (let w = cam.clickWaves.length - 1; w >= 0; w--) {
        const wave = cam.clickWaves[w];
        wave.progress += 0.032;
        if (wave.progress >= 1) {
          cam.clickWaves.splice(w, 1);
          continue;
        }
        const alpha = (1 - wave.progress) * 0.65;
        const r = 12 + wave.progress * 150;
        ctx.save();
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.lineWidth = 2.2 * (1 - wave.progress * 0.5);
        ctx.beginPath();
        ctx.ellipse(wave.x, wave.y, r, r * 0.68, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(248, 250, 252, ${alpha * 0.7})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, r * 0.55, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    camRef.current.isDragging = true;
    camRef.current.autoRotate = false;
    camRef.current.lastX = e.clientX;
    camRef.current.lastY = e.clientY;
    camRef.current.clickImpulse = 1;
    camRef.current.clickWaves.push({ x: clickX, y: clickY, progress: 0 });
    if (modeRef.current === "fission") {
      fissionTriggerRef.current += 1;
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    if (camRef.current.isDragging) {
      const dx = e.clientX - camRef.current.lastX;
      const dy = e.clientY - camRef.current.lastY;
      camRef.current.targetRotY += dx * 0.0085;
      camRef.current.targetRotX = Math.max(
        -1.1,
        Math.min(1.1, camRef.current.targetRotX + dy * 0.0085)
      );
      camRef.current.lastX = e.clientX;
      camRef.current.lastY = e.clientY;
    } else {
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      camRef.current.targetRotY += relX * 0.003;
      camRef.current.targetRotX = 0.28 + relY * 0.45;
    }
  }

  function handlePointerUp() {
    camRef.current.isDragging = false;
    camRef.current.autoRotate = true;
  }

  const meta = MODE_META[mode];

  return (
    <div
      style={{
        width: "100%",
        borderRadius: "10px",
        overflow: "hidden",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-dark)",
        boxShadow: "0 14px 34px -10px rgba(17, 19, 24, 0.08)",
      }}
    >
      {/* Scientific Instrument Header Strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "9px 14px",
          background: "#0B111E",
          borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
          color: "#CBD5E1",
          fontSize: "11px",
        }}
      >
        <span
          className="mono-tag"
          style={{
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#94A3B8",
          }}
        >
          FIG. 01 — BUỒNG MÔ PHỎNG HẠT NHÂN 3D
        </span>
        <span
          className="mono-tag"
          style={{
            color: "#94A3B8",
            fontSize: "11px",
          }}
        >
          Kéo chuột để xoay góc nhìn 360°
        </span>
      </div>

      {/* 3D Interactive Viewport */}
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{
            width: "100%",
            height: "390px",
            display: "block",
            cursor: "grab",
            touchAction: "none",
          }}
        />
      </div>

      {/* Editorial Caption & Equation Panel */}
      <div
        style={{
          padding: "18px 20px",
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border-light)",
        }}
      >
        {/* Segmented Mode Selector */}
        <div
          role="tablist"
          aria-label="Chế độ mô phỏng 3D"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "4px",
            marginBottom: "14px",
            background: "var(--bg-surface-elevated)",
            padding: "4px",
            borderRadius: "7px",
            border: "1px solid var(--border-light)",
          }}
        >
          {(["structure", "fission", "radiation", "reactor"] as const).map(
            (id) => {
              const active = mode === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setMode(id)}
                  style={{
                    padding: "7px 8px",
                    borderRadius: "5px",
                    border: active ? "1px solid var(--border-dark)" : "1px solid transparent",
                    background: active ? "var(--bg-surface)" : "transparent",
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    fontSize: "12px",
                    fontWeight: active ? 600 : 500,
                    cursor: "pointer",
                    boxShadow: active ? "0 1px 2px rgba(17, 19, 24, 0.06)" : "none",
                  }}
                >
                  {MODE_META[id].label}
                </button>
              );
            }
          )}
        </div>

        {/* Title & Description */}
        <div
          style={{
            fontSize: "15.5px",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: "4px",
            letterSpacing: "-0.01em",
          }}
        >
          {meta.title}
        </div>
        <p
          style={{
            margin: "0 0 12px",
            fontSize: "13.5px",
            color: "var(--text-secondary)",
            lineHeight: 1.55,
          }}
        >
          {meta.desc}
        </p>

        {/* Crisp LaTeX Formula */}
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "6px",
            background: "var(--bg-page)",
            border: "1px solid var(--border-light)",
            color: "var(--text-primary)",
            fontSize: "14.5px",
            overflowX: "auto",
          }}
        >
          <LatexMath math={meta.latex} />
        </div>

        {mode === "fission" && (
          <div style={{ marginTop: "12px" }}>
            <button
              type="button"
              onClick={() => setFissionPulse((p) => p + 1)}
              style={{
                padding: "7px 14px",
                borderRadius: "6px",
                border: "1px solid var(--border-dark)",
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Phóng neutron kích hoạt phân hạch
            </button>
          </div>
        )}

        {mode === "reactor" && (
          <div
            style={{
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "13px",
              color: "var(--text-primary)",
              fontWeight: 500,
            }}
          >
            <span className="mono-tag" style={{ fontSize: "12px" }}>
              Độ hạ thanh điều khiển: {controlRodDepth}%
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={controlRodDepth}
              onChange={(e) => setControlRodDepth(Number(e.target.value))}
              style={{ flex: 1, accentColor: "var(--color-primary)" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
