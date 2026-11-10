import React from "react";
import {
  createRutherfordRun, RUTHERFORD_COMPARISON, RUTHERFORD_DETECTOR_RADIUS_FM, rutherfordTrail, sampleRutherford,
} from "../../src/lib/rutherford-model.ts";
import { FISSION_CHANNEL, FISSION_DURATION, FISSION_ENERGY, fissionConservation, fissionMotion } from "../../src/lib/fission-model.ts";
import { createDecaySample, DECAY_COMPARISON, decayState } from "../../src/lib/radioactive-decay-model.ts";
import {
  REACTOR_FLOW_LAST_STEP, REACTOR_FLOW_STAGES, REACTOR_LAST_GENERATION, reactorFlowState, reactorState,
} from "../../src/lib/reactor-model.ts";
import { activityAt, B25_COMPARISON, halfActivityBracket, SGK_TABLE_25_1 } from "../../src/lib/sgk-b25-decay.ts";
import { buildNucleusLayout, NUCLEON_COLORS } from "../../src/lib/nucleus-layout.ts";
import { NUCLIDES } from "../../src/lib/nuclear-science.ts";
import { MathLine } from "./math-line.jsx";
import { FPS } from "./storyboards.mjs";

const colors = ["#43c4ec", "#ffb454", "#a8baff"];
const format = (value, decimals = 1) => value.toFixed(decimals).replace(".", ",");
const position = (scene, frame, maximum) => maximum * Math.min(1, frame / Math.max(1, scene.processEndFrame ?? scene.duration - 1 - FPS));
const line = (points, x, y) => points.map(point => `${x(point[0]).toFixed(1)},${y(point[1]).toFixed(1)}`).join(" ");

export function project3D({ x, y, z }, azimuth, elevation, fovDist = 18) {
  const cosA = Math.cos(azimuth), sinA = Math.sin(azimuth);
  const cosE = Math.cos(elevation), sinE = Math.sin(elevation);
  const x1 = x * cosA - z * sinA;
  const z1 = x * sinA + z * cosA;
  const y1 = y * cosE - z1 * sinE;
  const depth = y * sinE + z1 * cosE;
  const perspective = fovDist / Math.max(2, fovDist - depth);
  return { x: x1 * perspective, y: y1 * perspective, depth, perspective };
}

export function Shared3DDefs() {
  return (
    <defs>
      <radialGradient id="proton3d" cx="32%" cy="26%" r="72%">
        <stop offset="0%" stopColor="#fff3dc" />
        <stop offset="38%" stopColor={NUCLEON_COLORS.proton} />
        <stop offset="82%" stopColor="#b84a14" />
        <stop offset="100%" stopColor="#4c1904" />
      </radialGradient>
      <radialGradient id="neutron3d" cx="32%" cy="26%" r="72%">
        <stop offset="0%" stopColor="#e4ffff" />
        <stop offset="38%" stopColor={NUCLEON_COLORS.neutron} />
        <stop offset="82%" stopColor="#0f7c82" />
        <stop offset="100%" stopColor="#052f36" />
      </radialGradient>
      <radialGradient id="gold3d" cx="32%" cy="26%" r="72%">
        <stop offset="0%" stopColor="#fffbeb" />
        <stop offset="35%" stopColor="#fbbf24" />
        <stop offset="78%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#451a03" />
      </radialGradient>
      <radialGradient id="alpha3d" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="45%" stopColor="#7ef9ff" />
        <stop offset="100%" stopColor="#0284c7" />
      </radialGradient>
      <radialGradient id="alphaB3d" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fff7ed" />
        <stop offset="45%" stopColor="#ffb454" />
        <stop offset="100%" stopColor="#c2410c" />
      </radialGradient>
      <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#43c4ec" stopOpacity="0.34" />
        <stop offset="55%" stopColor="#2563eb" stopOpacity="0.12" />
        <stop offset="100%" stopColor="#0a1230" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.48" />
        <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.14" />
        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

const goldCoreLayout = buildNucleusLayout({ A: 28, Z: 14, N: 14 });
const u235ClusterLayout = buildNucleusLayout({ A: 48, Z: 20, N: 28 });
const y95ClusterLayout = buildNucleusLayout({ A: 20, Z: 9, N: 11 });
const i138ClusterLayout = buildNucleusLayout({ A: 28, Z: 11, N: 17 });
const he4Layout = buildNucleusLayout(NUCLIDES.He4);

function Process({ label, title, note, children }) {
  return <div className="visual-inner process">
    <div className="visual-label"><span>{label}</span><strong>{title}</strong></div>
    {children}
    <div className="visual-note">{note}</div>
  </div>;
}

function Metrics({ items }) {
  return <div className="process-metrics">{items.map(({ label, value, color }) =>
    <div key={label}><span>{label}</span><b style={{ color }}>{value}</b></div>
  )}</div>;
}

const rutherfordRuns = RUTHERFORD_COMPARISON.map(createRutherfordRun);
const rutherfordLimit = Math.max(...rutherfordRuns.map(run => run.durationZs));

export function RutherfordProcess({ scene, frame }) {
  const { mode } = scene;
  const runs = mode === "run" ? rutherfordRuns.slice(0, 1) : rutherfordRuns;
  const limit = mode === "run" ? runs[0].durationZs : rutherfordLimit;
  const time = mode === "setup" ? 0 : position(scene, frame, limit);

  // 3D perspective camera parameters (slow orbital tilt for 3D depth)
  const az = -0.18 + Math.sin(frame * 0.022) * 0.14;
  const el = 0.56 + Math.cos(frame * 0.018) * 0.05;
  const cx = 425, cy = 208, scale = 0.96;

  const mapPlane3D = (xFm, yFm, zFm = 0) => {
    const p = project3D({ x: xFm * 0.04, y: zFm * 0.04, z: -yFm * 0.04 }, az, el, 22);
    return {
      sx: cx + p.x * 25 * scale,
      sy: cy - p.y * 25 * scale,
      perspective: p.perspective,
      depth: p.depth,
    };
  };

  // 3D detector ring points
  const ringPts = Array.from({ length: 73 }, (_, i) => {
    const ang = (i / 72) * Math.PI * 2;
    const pt = mapPlane3D(
      RUTHERFORD_DETECTOR_RADIUS_FM * Math.cos(ang),
      RUTHERFORD_DETECTOR_RADIUS_FM * Math.sin(ang),
      0
    );
    return `${pt.sx.toFixed(1)},${pt.sy.toFixed(1)}`;
  }).join(" ");

  const ringTopPts = Array.from({ length: 73 }, (_, i) => {
    const ang = (i / 72) * Math.PI * 2;
    const pt = mapPlane3D(
      RUTHERFORD_DETECTOR_RADIUS_FM * Math.cos(ang),
      RUTHERFORD_DETECTOR_RADIUS_FM * Math.sin(ang),
      18
    );
    return `${pt.sx.toFixed(1)},${pt.sy.toFixed(1)}`;
  }).join(" ");

  // 3D Gold-197 nucleus spheres at center
  const goldSpheres = goldCoreLayout.particles
    .map(p => ({ ...p, ...project3D(p, frame * 0.035, 0.42, 14) }))
    .sort((a, b) => a.depth - b.depth);

  return <Process label="MÔ PHỎNG 3D · TÁN XẠ RUTHERFORD" title="Chùm hạt α và trường điện Coulomb 3D" note="Không gian 3D mô tả mặt phẳng tán xạ, màn huỳnh quang ZnS vòng và hạt nhân vàng Au-197 tại tâm.">
    <div className="process-conditions">
      <span>Động năng xa tâm <MathLine tex={`E=${runs[0].energyMeV}\\,\\mathrm{MeV}`} /></span>
      <span>Đồng hồ mô hình <b>{format(time, 2)} zs</b></span>
    </div>
    <svg className="graphic process-graphic" viewBox="0 0 820 406" aria-label="Quỹ đạo alpha 3D trên mặt phẳng của đầu dò vòng">
      <Shared3DDefs />
      <circle cx={cx} cy={cy} r="175" fill="url(#goldGlow)" />

      {/* 3D Coulomb equipotential rings */}
      {[45, 90, 135].map((rad, idx) => {
        const pts = Array.from({ length: 49 }, (_, i) => {
          const ang = (i / 48) * Math.PI * 2;
          const pt = mapPlane3D(rad * Math.cos(ang), rad * Math.sin(ang), -4);
          return `${pt.sx.toFixed(1)},${pt.sy.toFixed(1)}`;
        }).join(" ");
        return <polyline key={rad} points={pts} fill="none" stroke="#fbbf24" strokeOpacity={0.22 - idx * 0.05} strokeDasharray="4 6" strokeWidth="1.4" />;
      })}

      {/* 3D ZnS Detector Cylinder Wall */}
      <polyline points={ringPts} className="detector-ring" />
      <polyline points={ringTopPts} fill="none" stroke="#43c4ec" strokeOpacity="0.45" strokeWidth="2" />

      {/* Principal 3D Axis */}
      {(() => {
        const left = mapPlane3D(-215, 0, 0);
        const right = mapPlane3D(215, 0, 0);
        return <line x1={left.sx} y1={left.sy} x2={right.sx} y2={right.sy} className="process-reference" />;
      })()}

      {/* 3D Multi-nucleon Gold Nucleus at (0,0,0) */}
      <g>
        {goldSpheres.map(p => (
          <circle
            key={p.id}
            cx={cx + p.x * 5.2}
            cy={cy - p.y * 5.2}
            r={3.8 * p.perspective}
            fill={p.kind === "proton" ? "url(#gold3d)" : "url(#neutron3d)"}
            stroke="#1e1b4b"
            strokeWidth="0.6"
          />
        ))}
        <text x={cx + 22} y={cy + 28} className="plot-label" fill="#fde68a" fontWeight="700">¹⁹⁷Au (+79e)</text>
      </g>

      <text x="34" y="48" className="plot-label">Chùm hạt α (⁴He²⁺)</text>
      <text x="786" y="48" textAnchor="end" className="plot-label">Màn huỳnh quang 3D (ZnS)</text>

      {/* Trajectories and 3D Alpha Tetrahedral Clusters */}
      {runs.map((run, index) => {
        const sampleTime = mode === "setup" ? run.durationZs * (0.18 + 0.12 * Math.sin(frame * 0.06 + index)) : time;
        const p = sampleRutherford(run, mode === "setup" ? 0 : time);
        const trail = rutherfordTrail(run, mode === "setup" ? sampleTime : time, 54);
        const color = colors[index];
        const startPt = mapPlane3D(-205, run.impactFm, 0);
        const guideEnd = mapPlane3D(-45, run.impactFm, 0);
        const curPt = mapPlane3D(p.xFm, p.yFm, 4);
        const trailPts = trail.map(s => {
          const tp = mapPlane3D(s.xFm, s.yFm, 4);
          return `${tp.sx.toFixed(1)},${tp.sy.toFixed(1)}`;
        }).join(" ");

        // 4-nucleon 3D cluster for alpha particle
        const alphaCluster = he4Layout.particles
          .map(np => ({ ...np, ...project3D(np, frame * 0.08 + index, 0.5, 12) }))
          .sort((a, b) => a.depth - b.depth);

        return <g key={run.impactFm}>
          <line x1={startPt.sx} y1={startPt.sy} x2={guideEnd.sx} y2={guideEnd.sy} stroke={color} className="process-reference" />
          <polyline points={trailPts} stroke={color} className="process-line" strokeOpacity={mode === "setup" ? 0.5 : 0.95} />
          {/* Glowing 3D Alpha Cluster */}
          <circle cx={curPt.sx} cy={curPt.sy} r={time >= run.durationZs ? 17 : 13} fill={color} fillOpacity="0.24" />
          {alphaCluster.map(ap => (
            <circle
              key={ap.id}
              cx={curPt.sx + ap.x * 3.8}
              cy={curPt.sy - ap.y * 3.8}
              r={3.6 * ap.perspective}
              fill={ap.kind === "proton" ? (index ? "url(#alphaB3d)" : "url(#alpha3d)") : "url(#neutron3d)"}
            />
          ))}
          <text x={startPt.sx - 24} y={startPt.sy + 6} fill={color} fontSize="22" fontWeight="700">{index ? "B" : "A"}</text>
        </g>;
      })}
    </svg>
    <Metrics items={runs.map((run, index) => ({
      label: `${index ? "B" : "A"} · tham số va chạm b = ${run.impactFm} fm`,
      value: time >= run.durationZs ? `Góc tán xạ θ ≈ ${format(run.scatteringAngleDeg)}°` : `Đang bay trong trường Coulomb 3D`,
      color: colors[index],
    }))}/>
  </Process>;
}

const fissionStages = ["Neutron tiến lại gần U-235", "Hấp thụ tạo nhân kích thích U-236*", "Biến dạng giọt chất lỏng 3D", "Tách thành hai mảnh + 3 neutron"];

export function FissionProcess({ scene, frame }) {
  const hasNeutron = scene.mode !== "no-neutron";
  const motion = fissionMotion(position(scene, frame, FISSION_DURATION), hasNeutron);
  const { target, compound, fragments } = FISSION_CHANNEL;
  const az = frame * 0.032;
  const el = 0.36 + Math.sin(frame * 0.02) * 0.08;

  // Render 3D multi-nucleon spheres for U-235 / U-236*
  const deformedSpheres = u235ClusterLayout.particles
    .map(p => {
      const dx = p.x * motion.stretchX;
      const dy = p.y * motion.stretchY;
      const dz = p.z * motion.stretchY;
      return { ...p, ...project3D({ x: dx, y: dy, z: dz }, az, el, 16) };
    })
    .sort((a, b) => a.depth - b.depth);

  const ySpheres = y95ClusterLayout.particles
    .map(p => ({ ...p, ...project3D(p, az * 1.2, el, 15) }))
    .sort((a, b) => a.depth - b.depth);

  const iSpheres = i138ClusterLayout.particles
    .map(p => ({ ...p, ...project3D(p, -az * 1.1, el, 15) }))
    .sort((a, b) => a.depth - b.depth);

  return <Process label="MÔ HÌNH GIỌT CHẤT LỎNG 3D · PHÂN HẠCH U-235" title={hasNeutron ? fissionStages[motion.stage] : "Trạng thái cơ bản U-235 khi không bắn neutron"}
    note="Mô hình hạt nhân 3D gồm các proton (cam) và neutron (xanh). Thời gian và kích thước được phóng đại để quan sát.">
    <div className="process-conditions"><span>Điều kiện <b>{hasNeutron ? "Có 1 neutron chậm tới" : "Không có neutron tới"}</b></span>
      <span>Thời gian mô hình <b>{format(motion.time)} s</b></span></div>
    <svg className="graphic process-graphic" viewBox="0 0 820 400" aria-label="Tiến trình 3D phân hạch uranium-235">
      <Shared3DDefs />
      <circle cx="410" cy="197" r="185" fill="url(#coreGlow)" />
      {/* 3D Perspective Equatorial Orbit Ring */}
      <ellipse cx="410" cy="197" rx="285" ry="72" fill="none" stroke="#43c4ec" strokeOpacity="0.22" strokeDasharray="6 8" />
      <path d="M50 197H770" className="process-reference"/>

      {motion.stage < 3 ? <>
        {/* 3D Energy Halo during excitation */}
        {hasNeutron && motion.stage >= 1 && (
          <ellipse
            cx="410"
            cy="197"
            rx={92 * motion.stretchX + Math.sin(frame * 0.25) * 6}
            ry={92 * motion.stretchY + Math.cos(frame * 0.25) * 6}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2.5"
            strokeOpacity="0.55"
            strokeDasharray="8 6"
          />
        )}
        {/* 3D Deforming Nucleon Cluster */}
        {deformedSpheres.map(p => (
          <circle
            key={p.id}
            cx={410 + p.x * 23}
            cy={197 - p.y * 23}
            r={12.5 * p.perspective}
            fill={p.kind === "proton" ? "url(#proton3d)" : "url(#neutron3d)"}
            stroke="#08142c"
            strokeWidth="1"
          />
        ))}
        <foreignObject x="355" y="286" width="110" height="65">
          <MathLine tex={motion.stage === 0 ? `{}^{${target.a}}_{${target.z}}\\mathrm{U}` : `{}^{${compound.a}}_{${compound.z}}\\mathrm{U}^{*}`} className="process-nuclide"/>
        </foreignObject>
        {hasNeutron && motion.stage === 0 && (
          <g>
            <line x1={410 + motion.incomingX * 64 - 55} y1="197" x2={410 + motion.incomingX * 64} y2="197" stroke="#43c4ec" strokeWidth="4" strokeOpacity="0.65" />
            <circle cx={410 + motion.incomingX * 64} cy="197" r="14" fill="url(#neutron3d)" stroke="#fff" strokeWidth="1.5" />
            <text x={410 + motion.incomingX * 64} y="172" textAnchor="middle" fill="#7ef9ff" fontSize="18" fontWeight="700">¹₀n</text>
          </g>
        )}
      </> : <>
        {/* Expanding 3D Fission Shockwave Ring */}
        <ellipse cx="410" cy="197" rx={Math.min(340, Math.abs(motion.fragmentOffsets[1]) * 95)} ry={Math.min(130, Math.abs(motion.fragmentOffsets[1]) * 38)} fill="none" stroke="#fbbf24" strokeOpacity="0.45" strokeWidth="2.5" />
        {[fragments[0], fragments[1]].map((fragment, index) => {
          const center = 410 + motion.fragmentOffsets[index] * 69;
          const cluster = index === 0 ? ySpheres : iSpheres;
          return <g key={fragment.symbol}>
            <circle cx={center} cy="197" r={index ? 72 : 60} fill="url(#coreGlow)" />
            {cluster.map(p => (
              <circle
                key={p.id}
                cx={center + p.x * 19}
                cy={197 - p.y * 19}
                r={10.5 * p.perspective}
                fill={p.kind === "proton" ? "url(#proton3d)" : "url(#neutron3d)"}
                stroke="#08142c"
                strokeWidth="0.9"
              />
            ))}
            <foreignObject x={center - 55} y="275" width="110" height="68">
              <MathLine tex={`{}^{${fragment.a}}_{${fragment.z}}\\mathrm{${fragment.symbol}}`} className="process-nuclide"/>
            </foreignObject>
          </g>;
        })}
        {motion.neutronPositions.map(([x, y, z], index) => {
          const nx = 410 + x * 59;
          const ny = 197 - (0.65 * y + 0.75 * z) * 42;
          return <g key={index}>
            <line x1="410" y1="197" x2={nx} y2={ny} stroke="#43c4ec" strokeOpacity="0.35" strokeDasharray="4 5" strokeWidth="2" />
            <circle cx={nx} cy={ny} r="12" fill="url(#neutron3d)" stroke="#e0f2fe" strokeWidth="1.2" />
          </g>;
        })}
      </>}
    </svg>
    <Metrics items={hasNeutron && motion.stage === 3
      ? [{ label: "Mảnh phân hạch 3D", value: "Y-95 và I-138" }, { label: "Neutron thứ cấp", value: "3 hạt ¹₀n + ~200 MeV", color: colors[0] }]
      : [{ label: "Trạng thái hạt nhân 3D", value: hasNeutron ? "Phân hạch cảm ứng đang diễn ra" : "Chưa vượt hàng rào phân hạch" }]}/>
  </Process>;
}

export function FissionResults({ frame = 0 }) {
  const { inputA, outputA, inputZ, outputZ } = fissionConservation();
  const { beforeMassU, afterMassU, qMeV } = FISSION_ENERGY;
  const az = frame * 0.03;
  const leftCluster = u235ClusterLayout.particles.slice(0, 26).map(p => ({ ...p, ...project3D(p, az, 0.35, 14) })).sort((a, b) => a.depth - b.depth);
  const rightY = y95ClusterLayout.particles.slice(0, 14).map(p => ({ ...p, ...project3D(p, -az, 0.35, 14) })).sort((a, b) => a.depth - b.depth);
  const rightI = i138ClusterLayout.particles.slice(0, 18).map(p => ({ ...p, ...project3D(p, az * 1.2, 0.35, 14) })).sort((a, b) => a.depth - b.depth);

  return <Process label="ĐỐI CHIẾU 3D · BẢO TOÀN VÀ NĂNG LƯỢNG" title="Bảo toàn số nucleon A, điện tích Z và tỏa năng lượng Q"
    note="Khối lượng nguyên tử từ AME2020. Tổng A = 236 và Z = 92 bảo toàn tuyệt đối; độ hụt khối chuyển thành Q ≈ 197,6 MeV.">
    <svg className="graphic process-graphic" viewBox="0 0 820 220" aria-label="Mô hình 3D đối chiếu trước và sau phân hạch">
      <Shared3DDefs />
      <rect x="28" y="14" width="310" height="192" rx="18" fill="#131f4c" stroke="#43c4ec44" />
      <rect x="482" y="14" width="310" height="192" rx="18" fill="#131f4c" stroke="#ffb45455" />
      <text x="183" y="42" textAnchor="middle" fill="#9cc2f5" fontSize="17" fontWeight="700">TRƯỚC PHẢN ỨNG (A=236, Z=92)</text>
      <text x="637" y="42" textAnchor="middle" fill="#fcd34d" fontSize="17" fontWeight="700">SAU PHẢN ỨNG (A=236, Z=92)</text>

      {/* Left 3D U-235 + n */}
      {leftCluster.map(p => (
        <circle key={p.id} cx={165 + p.x * 14} cy={122 - p.y * 14} r={7.8 * p.perspective} fill={p.kind === "proton" ? "url(#proton3d)" : "url(#neutron3d)"} />
      ))}
      <circle cx="268" cy="122" r="10" fill="url(#neutron3d)" stroke="#fff" strokeWidth="1.2" />
      <text x="268" y="152" textAnchor="middle" fill="#7ef9ff" fontSize="16">+ ¹₀n</text>

      {/* Center 3D Energy Arrow */}
      <path d="M352 112H466" stroke="#fbbf24" strokeWidth="4" />
      <polygon points="466,104 480,112 466,120" fill="#fbbf24" />
      <text x="410" y="94" textAnchor="middle" fill="#fde68a" fontSize="18" fontWeight="700">Δm &gt; 0</text>
      <text x="410" y="142" textAnchor="middle" fill="#43c4ec" fontSize="17" fontWeight="700">+ 197,6 MeV</text>

      {/* Right 3D Y-95 + I-138 + 3n */}
      {rightY.map(p => (
        <circle key={p.id} cx={555 + p.x * 11} cy={122 - p.y * 11} r={6.8 * p.perspective} fill={p.kind === "proton" ? "url(#proton3d)" : "url(#neutron3d)"} />
      ))}
      {rightI.map(p => (
        <circle key={p.id} cx={665 + p.x * 12} cy={122 - p.y * 12} r={7.2 * p.perspective} fill={p.kind === "proton" ? "url(#proton3d)" : "url(#neutron3d)"} />
      ))}
      {[-34, 0, 34].map((dy, idx) => (
        <circle key={idx} cx="752" cy={122 + dy} r="7.5" fill="url(#neutron3d)" stroke="#fff" strokeWidth="1" />
      ))}
    </svg>
    <div className="process-results" style={{ gap: "12px", margin: "4px 0 10px" }}>
      <MathLine tex={`\\sum A_1=\\sum A_2=${inputA},\\qquad \\sum Z_1=\\sum Z_2=${inputZ},\\qquad Q\\approx ${qMeV.toFixed(1).replace(".","{,}")}\\,\\mathrm{MeV}`} />
    </div>
    <Metrics items={[
      { label: `Tổng khối lượng trước · A = ${inputA}, Z = ${inputZ}`, value: `${format(beforeMassU, 6)} u`, color: colors[0] },
      { label: `Tổng khối lượng sau · A = ${outputA}, Z = ${outputZ}`, value: `${format(afterMassU, 6)} u`, color: colors[1] },
    ]}/>
  </Process>;
}

const decayRuns = [DECAY_COMPARISON.a, DECAY_COMPARISON.b].map(createDecaySample);
const decayEnd = DECAY_COMPARISON.timeSeconds;

export function DecayProcess({ scene, frame }) {
  const { mode } = scene;
  const runs = mode === "run" ? decayRuns.slice(0, 1) : decayRuns;
  const time = mode === "setup" ? 0 : mode === "results" ? decayEnd : position(scene, frame, decayEnd);
  const states = runs.map(run => decayState(run, time));
  const x = t => 83 + 675 * t / decayEnd;
  const y = n => 327 - 272 * n / runs[0].initialCount;
  const az = 0.48 + frame * 0.018;
  const el = 0.42 + Math.sin(frame * 0.02) * 0.06;

  return <Process label="MÔ PHỎNG LẬP PHƯƠNG 3D · PHÂN RÃ PHÓNG XẠ" title="Khối 64 hạt nhân 3D ngẫu nhiên và đường kì vọng"
    note={mode === "results" ? "Đường liền là kì vọng lý thuyết N(t). Điểm tròn là số hạt còn lại của mẫu 3D tại 40 giây."
      : "Mỗi khối 3D gồm 4×4×4 = 64 hạt nhân mẹ. Khi phân rã, hạt nhân phát tia phóng xạ 3D và chuyển sang nhân con."}>
    <div className="process-conditions"><span>Số hạt nhân ban đầu <b>N₀ = {runs[0].initialCount}</b></span><span>Đồng hồ mô hình <b>t = {format(time)} s</b></span></div>
    {mode === "results" ? <svg className="graphic process-graphic" viewBox="0 0 820 395" aria-label="Đối chiếu số hạt kì vọng và số hạt từ hai lần mô phỏng">
      <Shared3DDefs />
      <path d="M83 40V327H759" className="process-axis"/>
      {[0, 10, 20, 30, 40].map(t => <text key={t} x={x(t)} y="358" textAnchor="middle" className="plot-label">{t}</text>)}
      {[0, 16, 32, 48, 64].map(n => <g key={n}><path d={`M83 ${y(n)}H759`} className="process-reference"/><text x="70" y={y(n)+6} textAnchor="end" className="plot-label">{n}</text></g>)}
      <text x="732" y="390" className="plot-label">t (s)</text><text x="60" y="32" className="plot-label">N(t)</text>
      {runs.map((run, index) => <g key={run.halfLifeSeconds}>
        <polyline points={line(Array.from({ length: 41 }, (_, t) => [t, decayState(run, t).expected]), x, y)} stroke={colors[index]} className="process-line"/>
        <circle cx={x(time)} cy={y(states[index].remaining)} r="11" stroke={colors[index]} strokeWidth="3.5" fill="#122534"/>
      </g>)}
    </svg> : <div className="process-decay-panes">{runs.map((run, index) => {
      // Build 4x4x4 3D lattice for the 64 nuclei
      const cubeNodes = run.lifetimes.map((lifetime, particle) => {
        const ix = (particle % 4) - 1.5;
        const iy = (Math.floor(particle / 4) % 4) - 1.5;
        const iz = Math.floor(particle / 16) - 1.5;
        const proj = project3D({ x: ix * 1.45, y: iy * 1.45, z: iz * 1.45 }, az + index * 0.35, el, 16);
        const alive = lifetime > time;
        const justDecayed = !alive && (time - lifetime) >= 0 && (time - lifetime) < 3.6;
        const burstProgress = justDecayed ? (time - lifetime) / 3.6 : 0;
        return { particle, alive, justDecayed, burstProgress, ...proj };
      }).sort((a, b) => a.depth - b.depth);

      return <div key={run.halfLifeSeconds} style={{ width: runs.length === 1 ? "64%" : "46%" }}>
        <MathLine tex={`T_{\\mathrm{${index ? "B" : "A"}}}=${run.halfLifeSeconds}\\,\\mathrm{s}`} />
        <svg viewBox="0 0 340 245" aria-label={`Khối 3D 64 hạt mẫu ${run.halfLifeSeconds} giây`}>
          <Shared3DDefs />
          <circle cx="170" cy="124" r="108" fill="url(#coreGlow)" />
          {cubeNodes.map(node => {
            const sx = 170 + node.x * 26;
            const sy = 124 - node.y * 26;
            const r = (node.alive ? 8.2 : 5.4) * node.perspective;
            return <g key={node.particle}>
              {node.justDecayed && (
                <>
                  <circle cx={sx} cy={sy} r={r + node.burstProgress * 18} fill="none" stroke="#fde68a" strokeOpacity={1 - node.burstProgress} strokeWidth="2" />
                  <line
                    x1={sx}
                    y1={sy}
                    x2={sx + Math.cos(node.particle * 1.7) * node.burstProgress * 34}
                    y2={sy + Math.sin(node.particle * 1.7) * node.burstProgress * 34}
                    stroke="#fde68a"
                    strokeWidth="2.2"
                    strokeOpacity={1 - node.burstProgress}
                  />
                </>
              )}
              <circle
                cx={sx}
                cy={sy}
                r={r}
                fill={node.alive ? (index ? "url(#alphaB3d)" : "url(#alpha3d)") : "#1e293b"}
                stroke={node.alive ? "#ffffff" : "#475569"}
                strokeWidth={node.alive ? "0.9" : "0.5"}
                opacity={node.alive ? 0.96 : 0.36}
              />
            </g>;
          })}
        </svg>
      </div>;
    })}</div>}
    <Metrics items={runs.map((run, index) => ({ label: `Mẫu 3D ${index ? "B" : "A"} · T = ${run.halfLifeSeconds} s`,
      value: `Còn ${states[index].remaining}/64 hạt · kì vọng ${format(states[index].expected)}`, color: colors[index] }))}/>
  </Process>;
}

const rodConditions = [0, 50, 100];

export function ReactorProcess({ scene, frame }) {
  const { mode } = scene;
  const rods = mode === "run" ? rodConditions.slice(0, 1) : rodConditions;
  const time = mode === "setup" ? 0 : position(scene, frame, REACTOR_LAST_GENERATION);
  const states = rods.map(rod => reactorState(time, rod));
  const x = generation => 368 + 402 * generation / REACTOR_LAST_GENERATION;
  const y = count => 323 - 252 * count / 4;

  // Active rod percent shown in the 3D core cutaway on the left
  const activeRod = mode === "compare" ? rodConditions[Math.floor(frame / 45) % 3] : rods[0];
  const insertDepth = activeRod / 100; // 0 to 1

  return <Process label="MÔ HÌNH LÕI LÒ 3D · ĐIỀU KHIỂN DÂY CHUYỀN" title="Thanh hấp thụ Boron/Cadmium 3D và hệ số nhân k"
    note="Bên trái là lõi lò 3D với thanh điều khiển rút/cắm; bên phải là chỉ số neutron kì vọng qua các thế hệ.">
    <div className="process-conditions"><span>Chuẩn hóa <MathLine tex="I_0=1" /></span><span>Thế hệ thứ <b>{states[0].generation}</b></span></div>
    <svg className="graphic process-graphic" viewBox="0 0 820 398" aria-label="Lõi lò phản ứng 3D và đồ thị thế hệ neutron">
      <Shared3DDefs />
      {/* LEFT PANE: 3D Cylindrical Reactor Core Cutaway */}
      <g>
        <rect x="18" y="28" width="286" height="338" rx="20" fill="#101b42" stroke="#43c4ec40" />
        <text x="161" y="56" textAnchor="middle" fill="#9cc2f5" fontSize="16" fontWeight="700">LÕI LÒ 3D · CẮM {activeRod}%</text>
        {/* Cherenkov 3D Core Glow */}
        <ellipse cx="161" cy="225" rx="108" ry="88" fill="url(#coreGlow)" />
        {/* 3D Vessel Top & Bottom Ellipses */}
        <ellipse cx="161" cy="145" rx="96" ry="24" fill="#172554" stroke="#43c4ec88" strokeWidth="2" />
        <path d="M65 145V295 A96 24 0 0 0 257 295 V145" fill="#0f172a99" stroke="#43c4ec88" strokeWidth="2" />
        <ellipse cx="161" cy="295" rx="96" ry="24" fill="#1e293b" stroke="#43c4ec66" strokeWidth="1.5" />

        {/* 3D Fuel Rod Assemblies (UO2) */}
        {[98, 130, 161, 192, 224].map((rx, idx) => (
          <g key={rx}>
            <rect x={rx - 6} y="156" width="12" height="132" rx="5" fill="#7c2d12" stroke="#f97316" strokeWidth="1.2" />
            <ellipse cx={rx} cy="156" rx="6" ry="2.5" fill="#fdba74" />
          </g>
        ))}

        {/* 3D Sliding Control Rods (Boron/Cadmium) */}
        {[114, 146, 176, 208].map((cxRod) => {
          const rodTop = 76 + insertDepth * 72;
          const rodHeight = 112;
          return <g key={cxRod}>
            <line x1={cxRod} y1="68" x2={cxRod} y2={rodTop} stroke="#94a3b8" strokeWidth="3" />
            <rect x={cxRod - 5} y={rodTop} width="10" height={rodHeight} rx="4" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="1.2" />
          </g>;
        })}

        {/* Animated 3D Neutrons inside Core */}
        {Array.from({ length: activeRod === 0 ? 14 : activeRod === 50 ? 8 : 4 }, (_, nIdx) => {
          const ang = frame * 0.09 + nIdx * 1.3;
          const nx = 161 + Math.cos(ang + nIdx) * (35 + (nIdx % 3) * 22);
          const ny = 225 + Math.sin(ang * 1.3 + nIdx) * 48;
          return <circle key={nIdx} cx={nx} cy={ny} r="5.5" fill="url(#alpha3d)" />;
        })}
        <text x="161" y="346" textAnchor="middle" fill="#cbd5e1" fontSize="15">
          {activeRod === 0 ? "k = 1,4 (Vượt tới hạn)" : activeRod === 50 ? "k = 1,0 (Tới hạn ổn định)" : "k = 0,6 (Dưới tới hạn)"}
        </text>
      </g>

      {/* RIGHT PANE: Generation Plot */}
      <path d="M368 40V323H785" className="process-axis"/>
      {[0, 1, 2, 3, 4].map(i => <g key={i}>
        <path d={`M368 ${y(i)}H785`} className="process-reference"/>
        <text x="354" y={y(i)+6} textAnchor="end" className="plot-label">{i}</text>
        <text x={x(i)} y="355" textAnchor="middle" className="plot-label">{i}</text>
      </g>)}
      <text x="705" y="387" className="plot-label">Thế hệ</text>
      <text x="336" y="32" className="plot-label">I_g</text>
      <path d={`M${x(time)} 44V323`} stroke="#97b6c8" strokeDasharray="5 8"/>
      {rods.map((rod, index) => {
        const state = states[index];
        const points = Array.from({ length: state.generation + 1 }, (_, g) => [g, reactorState(g, rod).expected]);
        return <g key={rod}>
          <polyline points={line(points, x, y)} stroke={colors[index]} className="process-line"/>
          {points.map(([g, count]) => <circle key={g} cx={x(g)} cy={y(count)} r="7.5" fill={colors[index]} stroke="#0a1230" strokeWidth="1.5"/>)}
        </g>;
      })}
    </svg>
    <Metrics items={states.map((state, index) => ({ label: `Cắm ${state.rodPercent}% · hệ số nhân k = ${format(state.k)}`,
      value: `I = ${format(state.expected, 2)}`, color: colors[index] }))}/>
  </Process>;
}

export function ReactorFlow({ scene, frame }) {
  const flow = reactorFlowState(position(scene, frame, REACTOR_FLOW_LAST_STEP + 1));
  const spin = frame * 8;
  const nodes = [
    [48, 102, 128, 132], [282, 102, 148, 132], [516, 98, 118, 82], [676, 98, 122, 82], [516, 258, 138, 76],
  ];
  const segments = [
    { d: "M176 134H282 M282 203H176", color: colors[1], steps: [0, 1] },
    { d: "M430 138H516 M585 180V258", color: colors[0], steps: [1, 2] },
    { d: "M634 138H676", color: colors[2], steps: [2, 3] },
    { d: "M516 296H356V234", color: colors[0], steps: [4] },
  ];
  return <Process label="MÔ HÌNH NHÀ MÁY ĐIỆN HẠT NHÂN 3D · PWR" title="Hai vòng tuần hoàn nhiệt, tua-bin 3D và máy phát"
    note="Vòng sơ cấp (cam) giữ nước áp suất cao trong vùng kín; vòng thứ cấp (xanh) nhận nhiệt sinh hơi quay tua-bin 3D.">
    <svg className="graphic process-graphic" viewBox="0 0 820 392" aria-label="Sơ đồ 3D hai vòng nước tách biệt của lò nước áp lực">
      <Shared3DDefs />
      {segments.map(({ d, color, steps }, index) => <g key={d}>
        <defs><marker id={`pwr-flow-${index}`} viewBox="0 0 12 12" refX="9" refY="6" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L12 6L0 12Z" fill={color}/></marker></defs>
        <path d={d} fill="none" stroke={color} strokeWidth="6" opacity=".42" markerEnd={`url(#pwr-flow-${index})`}/>
        {steps.includes(flow.step) && <path d={d} fill="none" stroke={color} strokeWidth="9" strokeDasharray="14 16" strokeDashoffset={-frame * 3.2}/>}
      </g>)}

      {REACTOR_FLOW_STAGES.map((stage, index) => {
        const [x, y, w, h] = nodes[index];
        const active = flow.step === index;
        return <g key={stage.id}>
          {/* 3D Isometric Extrusion Shadow */}
          <rect x={x + 6} y={y + 7} width={w} height={h} rx="16" fill="#070d24" opacity="0.75" />
          <rect x={x} y={y} width={w} height={h} rx="16" fill={active ? "#1e3a8a" : "#152252"} stroke={active ? colors[0] : "#43c4ec66"} strokeWidth={active ? "3" : "1.8"}/>
          {/* 3D Internal Visuals per component */}
          {index === 0 && (
            <g>
              <rect x={x + 36} y={y + 24} width="12" height="52" rx="4" fill="#f97316" />
              <rect x={x + 58} y={y + 24} width="12" height="52" rx="4" fill="#fbbf24" />
              <rect x={x + 80} y={y + 24} width="12" height="52" rx="4" fill="#f97316" />
            </g>
          )}
          {index === 1 && (
            <path d={`M${x + 35} ${y + 88} V${y + 42} A38 22 0 0 1 ${x + 112} ${y + 42} V${y + 88}`} fill="none" stroke="#ffb454" strokeWidth="4" />
          )}
          {index === 2 && (
            <g transform={`translate(${x + w / 2}, ${y + 32}) rotate(${spin})`}>
              {[0, 60, 120, 180, 240, 300].map(deg => (
                <rect key={deg} x="-3" y="-18" width="6" height="36" rx="3" fill="#43c4ec" transform={`rotate(${deg})`} />
              ))}
              <circle cx="0" cy="0" r="7" fill="#e0f2fe" />
            </g>
          )}
          {index === 3 && (
            <g transform={`translate(${x + w / 2}, ${y + 30})`}>
              <circle cx="0" cy="0" r="16" fill="none" stroke="#a8baff" strokeWidth="3" strokeDasharray="8 5" transform={`rotate(${-spin})`} />
              <circle cx="0" cy="0" r="6" fill="#fde68a" />
            </g>
          )}
          <text x={x + w / 2} y={y + h - 16} textAnchor="middle" fill="#eff6ff" fontSize={index === 3 ? 16 : 18} fontWeight="700">{stage.label}</text>
        </g>;
      })}
      <text x="176" y="84" textAnchor="middle" fill={colors[1]} fontSize="18" fontWeight="700">Vòng sơ cấp 3D (Nước áp suất)</text>
      <text x="486" y="84" textAnchor="middle" fill={colors[0]} fontSize="18" fontWeight="700">Vòng thứ cấp 3D (Hơi nước)</text>
      <text x="642" y="214" textAnchor="middle" fill={colors[2]} fontSize="17">Trục quay 3D</text>
      <text x="380" y="366" fill={colors[0]} fontSize="18">Nước ngưng tụ bơm lại bộ sinh hơi</text>
    </svg>
    <div className="process-flow-note"><b>{flow.stage.label}</b><p>{flow.stage.detail}</p></div>
  </Process>;
}

const activityInitial = B25_COMPARISON.initialActivityBq;
const activityEnd = SGK_TABLE_25_1.at(-1).t;
const bracket = halfActivityBracket();
const fitHalfLives = [B25_COMPARISON.halfLifeA, B25_COMPARISON.halfLifeB];

export function ActivityProcess({ scene, frame }) {
  const { mode } = scene;
  const time = mode === "setup" || mode === "results" ? activityEnd : position(scene, frame, activityEnd);
  const readTime = mode === "results" ? B25_COMPARISON.compareAtSeconds : time;
  const x = t => 275 + 485 * t / activityEnd;
  const y = h => 339 - 275 * h / activityInitial;
  const fits = mode === "run" ? fitHalfLives.slice(0, 1) : ["compare", "results"].includes(mode) ? fitHalfLives : [];
  const currentH = activityAt(mode === "setup" ? 0 : readTime, 40, activityInitial);
  const activePulses = Math.max(2, Math.round((currentH / activityInitial) * 12));

  return <Process label="PHÒNG THÍ NGHIỆM 3D · ĐỘ PHÓNG XẠ H(t)" title="Ống đếm Geiger–Müller 3D và đồ thị Bảng 25.1 SGK"
    note="Bên trái là mẫu phóng xạ 3D và đầu dò Geiger-Müller; bên phải là 8 điểm đo Bảng 25.1 SGK tr. 121.">
    <div className="process-conditions"><span>Mức nửa ban đầu <b>H₀/2 = {format(bracket.halfActivityBq)} Bq</b></span>
      {mode === "setup" ? <span>Độ phóng xạ ban đầu <b>H₀ = {activityInitial} Bq</b></span> : <span>Mốc đọc <b>t = {format(readTime, 0)} s</b></span>}
    </div>
    <svg className="graphic process-graphic" viewBox="0 0 820 405" aria-label="Ống đếm Geiger 3D và đồ thị độ phóng xạ SGK">
      <Shared3DDefs />
      {/* LEFT PANE: 3D Geiger-Müller Tube & Radioactive Source */}
      <g>
        <rect x="16" y="34" width="206" height="335" rx="18" fill="#101b42" stroke="#43c4ec40" />
        <text x="119" y="62" textAnchor="middle" fill="#9cc2f5" fontSize="15" fontWeight="700">ĐẦU DÒ GEIGER 3D</text>
        {/* 3D Cylindrical GM Tube */}
        <ellipse cx="119" cy="112" rx="44" ry="14" fill="#1e293b" stroke="#43c4ec" strokeWidth="2" />
        <path d="M75 112V208 A44 14 0 0 0 163 208 V112" fill="#0f172acc" stroke="#43c4ec88" strokeWidth="2" />
        <ellipse cx="119" cy="208" rx="44" ry="14" fill="#334155" stroke="#43c4ec" strokeWidth="2" />
        {/* Central Anode Wire */}
        <line x1="119" y1="98" x2="119" y2="208" stroke="#fbbf24" strokeWidth="2.5" />
        {/* 3D Radioactive Sample Disc at Bottom */}
        <ellipse cx="119" cy="298" rx="38" ry="13" fill="url(#gold3d)" stroke="#fde68a" strokeWidth="1.5" />
        <text x="119" y="330" textAnchor="middle" fill="#fde68a" fontSize="14" fontWeight="700">Mẫu phóng xạ 3D</text>

        {/* Animated 3D Ionizing Rays from Sample to GM Tube */}
        {Array.from({ length: activePulses }, (_, idx) => {
          const prog = ((frame * 0.045 + idx * 0.21) % 1);
          const rx = 119 + Math.sin(idx * 2.1) * 26 * (1 - prog * 0.3);
          const ry = 292 - prog * 115;
          return <g key={idx}>
            <circle cx={rx} cy={ry} r="4.2" fill="url(#alpha3d)" />
            <line x1={rx} y1={ry} x2={rx} y2={ry + 12} stroke="#43c4ec" strokeWidth="1.8" strokeOpacity="0.6" />
          </g>;
        })}
        <text x="119" y="354" textAnchor="middle" fill="#7ef9ff" fontSize="16" fontWeight="700">H ≈ {format(currentH, 1)} Bq</text>
      </g>

      {/* RIGHT PANE: SGK Table 25.1 Plot */}
      <path d="M275 41V339H778" className="process-axis"/>
      {mode !== "setup" && <rect x={x(bracket.fromSeconds)} y="54" width={x(bracket.toSeconds)-x(bracket.fromSeconds)} height="285" fill="#f3ac74" opacity=".16" />}
      <path d={`M275 ${y(bracket.halfActivityBq)}H773`} stroke="#ffbb85" strokeDasharray="7 8"/>
      <text x="535" y={y(bracket.halfActivityBq)-9} className="plot-label">Mức nửa ban đầu (75,5 Bq)</text>
      {mode !== "setup" && <path d={`M${x(readTime)} 41V339`} stroke="#c9dae2" strokeDasharray="4 7"/>}
      {fits.map((halfLife, index) => {
        const points = Array.from({ length: 45 }, (_, step) => {
          const t = time * step / 44;
          return [t, activityAt(t, halfLife, activityInitial)];
        });
        return <polyline key={halfLife} points={line(points, x, y)} stroke={colors[index]} className="process-line"/>;
      })}
      {SGK_TABLE_25_1.map(point => <text key={point.t} x={x(point.t)} y="370" textAnchor="middle" className="plot-label">{point.t}</text>)}
      {SGK_TABLE_25_1.map(point => <g key={point.t}>
        <circle cx={x(point.t)} cy={y(point.h)} r="7.5" fill="#e4edf4" stroke="#0a1230" strokeWidth="1.5"/>
        {point.t === 0 && <text x={x(point.t)+10} y={y(point.h)-10} className="plot-label">{point.h}</text>}
        {(point.t === bracket.fromSeconds || point.t === bracket.toSeconds) &&
          <text x={x(point.t)-10} y={y(point.h)+(point.t === bracket.toSeconds ? 22 : -12)} textAnchor="end" className="plot-label">{point.h}</text>}
      </g>)}
      <text x="273" y="33" className="plot-label">H (Bq)</text><text x="762" y="399" className="plot-label">t (s)</text>
    </svg>
    <Metrics items={fits.length ? [
      ...fits.map((halfLife, index) => ({ label: `Đường lý thuyết T = ${halfLife} s`,
        value: `${format(activityAt(readTime, halfLife, activityInitial))} Bq`, color: colors[index] })),
      ...(mode === "results" ? [{ label: "Số đo Bảng 25.1 tại 30 s", value: `${SGK_TABLE_25_1.find(point => point.t === readTime).h} Bq` }] : []),
    ]
      : [{ label: "Dữ liệu thực nghiệm SGK", value: `${SGK_TABLE_25_1.length} mốc đo từ Bảng 25.1` }]}/>
  </Process>;
}
