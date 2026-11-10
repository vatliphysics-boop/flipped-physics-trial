import React from "react";
import { AbsoluteFill, Composition, Easing, interpolate, registerRoot, Sequence, useCurrentFrame } from "remotion";
import { buildNucleusLayout, NUCLEON_COLORS } from "../../src/lib/nucleus-layout.ts";
import { NUCLEUS_MODEL_NOTE, NUCLIDES } from "../../src/lib/nuclear-science.ts";
import { captionAt, durationInFrames, FPS, HEIGHT, LESSONS, timeline, WIDTH } from "./storyboards.mjs";
import { MathLine } from "./math-line.jsx";
import { ActivityProcess, DecayProcess, FissionProcess, FissionResults, ReactorFlow, ReactorProcess, RutherfordProcess } from "./process-visuals.jsx";
import "./film.css";

const prebuiltIsotopes = ["H2", "H3", "He4", "C12", "C13", "C14", "Fe56", ...Object.values(LESSONS).flatMap(lesson => lesson.shots.filter(scene => scene.kind === "nucleus").map(scene => scene.isotope))];
const layout = Object.fromEntries([...new Set(prebuiltIsotopes)].map(id => [id, buildNucleusLayout(NUCLIDES[id])]));

const ease = (frame, end) => interpolate(frame, [0, end], [0, 1], {
  extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic),
});

function project({ x, y, z }, azimuth, elevation, radius) {
  const x1 = x * Math.cos(azimuth) - z * Math.sin(azimuth);
  const z1 = x * Math.sin(azimuth) + z * Math.cos(azimuth);
  const y1 = y * Math.cos(elevation) - z1 * Math.sin(elevation);
  const depth = y * Math.sin(elevation) + z1 * Math.cos(elevation);
  const perspective = 1 / (1 - depth / (Math.max(radius, 1.8) * 4.8));
  return { x: x1 * perspective, y: y1 * perspective, depth, perspective };
}

function renderMiniCluster(isotopeId, cx, cy, targetRadius, azimuth, elevation, keyPrefix = isotopeId) {
  const { particles, particleRadius, radius } = layout[isotopeId];
  const scale = targetRadius / Math.max(radius, 1.2);
  const spheres = particles
    .map(particle => ({ ...particle, ...project(particle, azimuth, elevation, radius) }))
    .sort((a, b) => a.depth - b.depth);
  return <g key={keyPrefix}>
    {spheres.map(p => {
      const sx = cx + p.x * scale;
      const sy = cy - p.y * scale;
      const sr = Math.max(4, particleRadius * p.perspective * scale);
      return <g key={`${keyPrefix}-${p.id}`}>
        <circle cx={sx} cy={sy} r={sr} fill={`url(#${p.kind})`} stroke="#06131e" strokeWidth={1.1} opacity={0.88 + 0.12 * (p.depth / Math.max(radius, 1) + 1) / 2} />
        <circle cx={sx - sr * 0.28} cy={sy - sr * 0.28} r={sr * 0.22} fill="#ffffff" opacity="0.45" />
      </g>;
    })}
  </g>;
}

function SharedNucleonDefs() {
  return <defs>
    <radialGradient id="proton" cx="32%" cy="24%" r="74%">
      <stop offset="0%" stopColor="#fff3dc" />
      <stop offset="38%" stopColor={NUCLEON_COLORS.proton} />
      <stop offset="82%" stopColor="#b84312" />
      <stop offset="100%" stopColor="#5c1d06" />
    </radialGradient>
    <radialGradient id="neutron" cx="32%" cy="24%" r="74%">
      <stop offset="0%" stopColor="#dcfffb" />
      <stop offset="38%" stopColor={NUCLEON_COLORS.neutron} />
      <stop offset="82%" stopColor="#0f7c82" />
      <stop offset="100%" stopColor="#073b3e" />
    </radialGradient>
    <radialGradient id="electron-3d" cx="32%" cy="28%" r="70%">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="40%" stopColor="#7ce8ff" />
      <stop offset="100%" stopColor="#0284c7" />
    </radialGradient>
    <radialGradient id="model-aura">
      <stop offset="0%" stopColor="#38bdf8" stopOpacity=".28" />
      <stop offset="55%" stopColor="#1d4ed8" stopOpacity=".10" />
      <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="gold-aura">
      <stop offset="0%" stopColor="#fde047" stopOpacity=".34" />
      <stop offset="60%" stopColor="#f59e0b" stopOpacity=".12" />
      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
    </radialGradient>
  </defs>;
}

function NucleusVisual({ scene, frame }) {
  const isotope = NUCLIDES[scene.isotope];
  const { particles, particleRadius, radius } = layout[scene.isotope];
  const intro = ease(frame, 48);
  const azimuth = scene.view + frame * 0.032;
  const elevation = 0.24 + Math.sin(frame * 0.024) * 0.22;
  const scale = (182 + intro * 22) / radius;
  const spheres = particles
    .map(particle => ({ ...particle, ...project(particle, azimuth, elevation, radius) }))
    .sort((a, b) => a.depth - b.depth);
  const ringTilt = 68 + Math.sin(frame * 0.02) * 14;
  return <div className="visual-inner">
    <div className="visual-label"><span>MÔ HÌNH HẠT NHÂN 3D</span><strong>{isotope.name} ({isotope.Z}p, {isotope.N}n)</strong></div>
    <svg className="graphic nucleus-graphic" viewBox="0 0 820 470" aria-label={`${isotope.name}, ${isotope.Z} proton và ${isotope.N} neutron`}>
      <SharedNucleonDefs />
      <circle cx="410" cy="226" r="238" fill="url(#model-aura)" />
      {/* 3D Gyroscopic Coordinate Rings */}
      <ellipse cx="410" cy="226" rx="220" ry={ringTilt} fill="none" stroke="#38bdf8" strokeOpacity=".26" strokeWidth="1.8" strokeDasharray="7 8" transform={`rotate(${(frame * 0.35) % 360} 410 226)`} />
      <ellipse cx="410" cy="226" rx="195" ry="52" fill="none" stroke="#f59e0b" strokeOpacity=".22" strokeWidth="1.5" strokeDasharray="4 7" transform={`rotate(${-35 + (frame * 0.25) % 360} 410 226)`} />
      <path d="M410 17v421 M182 226h456" stroke="#72b2bc" strokeOpacity=".16" strokeDasharray="5 8" />
      <path d="M72 28h70 M72 28v39 M748 28h-70 M748 28v39 M72 427h70 M72 427v-39 M748 427h-70 M748 427v-39" stroke="#8fb9c0" fill="none" opacity=".53" />
      {spheres.map(p => {
        const cx = 410 + p.x * scale;
        const cy = 225 - p.y * scale;
        const r = particleRadius * p.perspective * scale;
        return <g key={p.id}>
          <circle cx={cx} cy={cy} r={r} fill={`url(#${p.kind})`} stroke="#06131e" strokeWidth={1.5} opacity={0.88 + 0.12 * (p.depth / radius + 1) / 2} />
          <circle cx={cx - r * 0.28} cy={cy - r * 0.28} r={r * 0.23} fill="#ffffff" opacity={0.48} />
        </g>;
      })}
      {/* 3D Axis labels */}
      <text x="645" y="218" fill="#7dd3fc" fontSize="16" fontWeight="700" opacity="0.75">Lực hạt nhân mạnh</text>
      <text x="92" y="68" fill="#cbd5e1" fontSize="16" opacity="0.8">Góc quay 3D: {Math.round((azimuth * 180 / Math.PI) % 360)}°</text>
    </svg>
    <div className="nucleus-stats">
      <span><i style={{ background: NUCLEON_COLORS.proton }} /> <b>{isotope.Z}</b> proton (+Ze)</span>
      <span><i style={{ background: NUCLEON_COLORS.neutron }} /> <b>{isotope.N}</b> neutron (0)</span>
      <span><b>{isotope.A}</b> nucleon (A = Z + N)</span>
    </div>
    <div className="visual-note">{NUCLEUS_MODEL_NOTE}</div>
  </div>;
}

function SymbolVisual({ scene, frame }) {
  const nuclide = NUCLIDES[scene.isotope];
  const azimuth = 0.6 + frame * 0.034;
  const elevation = 0.28 + Math.sin(frame * 0.025) * 0.18;
  const orbits = [0, 60, 120];
  return <div className="visual-inner">
    <div className="visual-label"><span>KÍ HIỆU &amp; MÔ HÌNH NGUYÊN TỬ 3D</span><strong>{nuclide.name} ({nuclide.Z}p, {nuclide.N}n, {nuclide.Z}e⁻)</strong></div>
    <div className="symbol-stage symbol-stage-3d">
      <div className="symbol-left-pane">
        <div className="symbol-orbit" />
        <MathLine tex={nuclide.latex} className="big-symbol" />
        <div className="symbol-callout a" style={{ opacity: ease(frame - 6, 28) }}><b>A = {nuclide.A}</b><span>Số khối (tổng nucleon)</span></div>
        <div className="symbol-callout z" style={{ opacity: ease(frame - 16, 28) }}><b>Z = {nuclide.Z}</b><span>Số hiệu nguyên tử (proton)</span></div>
        <div className="symbol-callout x" style={{ opacity: ease(frame - 26, 28) }}><b>N = {nuclide.N}</b><span>Số neutron (A − Z)</span></div>
      </div>
      <div className="symbol-right-pane">
        <svg viewBox="0 0 400 390" className="symbol-atom-svg" aria-label={`Mô hình 3D nguyên tử ${nuclide.name}`}>
          <SharedNucleonDefs />
          <circle cx="200" cy="192" r="175" fill="url(#model-aura)" />
          {/* 3 tilted 3D electron orbital rings */}
          {orbits.map((tilt, idx) => (
            <ellipse key={`orb-${idx}`} cx="200" cy="192" rx="162" ry="58" fill="none" stroke="#38bdf8" strokeOpacity="0.38" strokeWidth="1.8" strokeDasharray="6 5" transform={`rotate(${tilt} 200 192)`} />
          ))}
          {/* Central 3D Carbon-12 Nucleus */}
          {renderMiniCluster(scene.isotope, 200, 192, 58, azimuth, elevation, "sym-nuc")}
          {/* 6 Orbiting 3D Electrons */}
          {Array.from({ length: nuclide.Z }, (_, idx) => {
            const orbitIndex = idx % 3;
            const tiltRad = (orbits[orbitIndex] * Math.PI) / 180;
            const phase = frame * 0.055 + idx * (Math.PI / 3);
            const lx = 162 * Math.cos(phase);
            const ly = 58 * Math.sin(phase);
            const ex = 200 + lx * Math.cos(tiltRad) - ly * Math.sin(tiltRad);
            const ey = 192 + lx * Math.sin(tiltRad) + ly * Math.cos(tiltRad);
            return <g key={`elec-${idx}`}>
              <circle cx={ex} cy={ey} r="11" fill="#38bdf8" opacity="0.25" />
              <circle cx={ex} cy={ey} r="6.5" fill="url(#electron-3d)" stroke="#e0f2fe" strokeWidth="1" />
            </g>;
          })}
          <text x="200" y="374" textAnchor="middle" fill="#bae6fd" fontSize="18" fontWeight="700">
            Hạt nhân 3D ({nuclide.Z}p + {nuclide.N}n) &amp; {nuclide.Z} electron vỏ
          </text>
        </svg>
      </div>
    </div>
    <div className="visual-note">A, Z và N là số đếm hạt nhân (không có đơn vị). Hạt nhân mang điện tích +{nuclide.Z}e.</div>
  </div>;
}

function Energy3DStage({ frame }) {
  const azimuth = frame * 0.032;
  const elevation = 0.25 + Math.sin(frame * 0.02) * 0.16;
  const c12Particles = layout.C12.particles;
  const pulse = (frame % 90) / 90;
  return <svg viewBox="0 0 780 235" className="equation-3d-svg" aria-label="Mô hình 3D độ hụt khối và năng lượng liên kết">
    <SharedNucleonDefs />
    <rect x="14" y="10" width="275" height="212" rx="18" fill="#0f172a" fillOpacity="0.6" stroke="#38bdf8" strokeOpacity="0.32" />
    <text x="151" y="36" textAnchor="middle" fill="#93c5fd" fontSize="17" fontWeight="700">1. CÁC NUCLEON RỜI RẠC (Zmₚ + Nmₙ)</text>
    {c12Particles.map((p, idx) => {
      const angle = (idx / c12Particles.length) * Math.PI * 2 + frame * 0.015;
      const ringR = idx % 2 === 0 ? 64 : 34;
      const bob = Math.sin(frame * 0.05 + idx) * 5;
      const cx = 151 + Math.cos(angle) * ringR * 1.25;
      const cy = 122 + Math.sin(angle) * ringR * 0.72 + bob;
      return <g key={`free-${p.id}`}>
        <circle cx={cx} cy={cy} r="13.5" fill={`url(#${p.kind})`} stroke="#06131e" strokeWidth="1.2" />
        <circle cx={cx - 3.5} cy={cy - 3.5} r="3" fill="#ffffff" opacity="0.45" />
      </g>;
    })}
    <text x="151" y="206" textAnchor="middle" fill="#cbd5e1" fontSize="16">Tổng khối lượng lớn hơn: m₀ &gt; mₓ</text>

    {/* Center 3D Energy Transformation Bridge */}
    <g>
      <circle cx="388" cy="118" r={28 + pulse * 38} fill="none" stroke="#fde047" strokeWidth={2.5 * (1 - pulse)} opacity={1 - pulse} />
      <circle cx="388" cy="118" r="46" fill="url(#gold-aura)" />
      <path d="M306 118 H466" stroke="#fbbf24" strokeWidth="4" strokeDasharray="8 6" />
      <polygon points="472,118 456,109 456,127" fill="#fbbf24" />
      <rect x="318" y="64" width="140" height="34" rx="10" fill="#422006" stroke="#f59e0b" />
      <text x="388" y="86" textAnchor="middle" fill="#fde047" fontSize="16" fontWeight="700">Δm = m₀ − mₓ</text>
      <text x="388" y="156" textAnchor="middle" fill="#fef08a" fontSize="17" fontWeight="700">Tỏa Eₗₖ = Δm·c²</text>
    </g>

    {/* Right 3D Bound Nucleus */}
    <rect x="490" y="10" width="275" height="212" rx="18" fill="#0f172a" fillOpacity="0.6" stroke="#38bdf8" strokeOpacity="0.32" />
    <text x="627" y="36" textAnchor="middle" fill="#6ee7b7" fontSize="17" fontWeight="700">2. HẠT NHÂN LIÊN KẾT (mₓ)</text>
    <circle cx="627" cy="122" r="72" fill="url(#model-aura)" />
    <circle cx="627" cy="122" r={48 + Math.sin(frame * 0.06) * 4} fill="none" stroke="#38bdf8" strokeOpacity="0.45" strokeDasharray="5 5" />
    {renderMiniCluster("C12", 627, 122, 48, azimuth, elevation, "bound-c12")}
    <text x="627" y="206" textAnchor="middle" fill="#cbd5e1" fontSize="16">Hụt khối Δm chuyển thành Eₗₖ</text>
  </svg>;
}

function Recap3DStage({ code, frame }) {
  const azimuth = frame * 0.032;
  const elevation = 0.25 + Math.sin(frame * 0.022) * 0.16;

  if (code === "B21") {
    const items = [
      { id: "C12", cx: 145, label: "Carbon-12 (6p, 6n)", sub: "Bền tự nhiên" },
      { id: "C13", cx: 390, label: "Carbon-13 (6p, 7n)", sub: "Đồng vị bền" },
      { id: "C14", cx: 635, label: "Carbon-14 (6p, 8n)", sub: "Đồng vị phóng xạ" },
    ];
    return <svg viewBox="0 0 780 205" className="equation-3d-svg" aria-label="Ba đồng vị Carbon trong không gian 3D">
      <SharedNucleonDefs />
      {items.map((item, idx) => (
        <g key={item.id}>
          <rect x={item.cx - 110} y="8" width="220" height="188" rx="16" fill="#0f172a" fillOpacity="0.58" stroke="#38bdf8" strokeOpacity="0.32" />
          <circle cx={item.cx} cy="96" r="64" fill="url(#model-aura)" />
          {renderMiniCluster(item.id, item.cx, 96, 44, azimuth + idx * 0.7, elevation, `recap-${item.id}`)}
          <text x={item.cx} y="164" textAnchor="middle" fill="#e2e8f0" fontSize="16" fontWeight="700">{item.label}</text>
          <text x={item.cx} y="185" textAnchor="middle" fill="#7dd3fc" fontSize="14">{item.sub}</text>
        </g>
      ))}
    </svg>;
  }

  if (code === "B22") {
    const cycle = (frame % 120) / 120;
    const collide = interpolate(cycle, [0, 0.45, 0.55, 1], [0, 1, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const separate = interpolate(cycle, [0, 0.48, 0.85, 1], [0, 0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const dX = 95 + collide * 145;
    const tX = 385 - collide * 145;
    const heX = 240 + separate * 265;
    const nX = 240 + separate * 395;
    const nY = 104 - separate * 36;
    return <svg viewBox="0 0 780 205" className="equation-3d-svg" aria-label="Mô phỏng 3D tổng hợp hạt nhân D + T">
      <SharedNucleonDefs />
      <rect x="14" y="8" width="752" height="188" rx="16" fill="#0f172a" fillOpacity="0.58" stroke="#38bdf8" strokeOpacity="0.32" />
      <text x="390" y="34" textAnchor="middle" fill="#fde047" fontSize="17" fontWeight="700">MÔ PHỎNG 3D PHẢN ỨNG NHIỆT HẠCH: ²₁H + ³₁H → ⁴₂He + ¹₀n + 17,6 MeV</text>
      {cycle < 0.5 ? <>
        {renderMiniCluster("H2", dX, 108, 26, azimuth, elevation, "fus-d")}
        <text x={dX} y="156" textAnchor="middle" fill="#bae6fd" fontSize="16" fontWeight="700">Đơteri (²₁H)</text>
        {renderMiniCluster("H3", tX, 108, 30, -azimuth, elevation, "fus-t")}
        <text x={tX} y="156" textAnchor="middle" fill="#bae6fd" fontSize="16" fontWeight="700">Triti (³₁H)</text>
      </> : <>
        <circle cx="240" cy="108" r={24 + separate * 65} fill="none" stroke="#fde047" strokeWidth={3 * (1 - separate)} opacity={1 - separate} />
        <circle cx={heX} cy="112" r="52" fill="url(#gold-aura)" />
        {renderMiniCluster("He4", heX, 112, 34, azimuth * 1.4, elevation, "fus-he")}
        <text x={heX} y="168" textAnchor="middle" fill="#fde047" fontSize="16" fontWeight="700">Heli-4 (⁴₂He)</text>
        <circle cx={nX} cy={nY} r="13" fill="url(#neutron)" stroke="#e2e8f0" strokeWidth="1.2" />
        <text x={nX} y={nY + 28} textAnchor="middle" fill="#5eead4" fontSize="15" fontWeight="700">Neutron (¹₀n)</text>
      </>}
      <text x="390" y="186" textAnchor="middle" fill="#cbd5e1" fontSize="15">Phản ứng tỏa năng lượng vì hạt nhân sản phẩm bền hơn (Eₗₖ/A lớn hơn)</text>
    </svg>;
  }

  if (code === "B23") {
    const beamProgress = (frame % 75) / 75;
    return <svg viewBox="0 0 780 205" className="equation-3d-svg" aria-label="Mô hình 3D khả năng đâm xuyên của tia alpha, beta, gamma">
      <SharedNucleonDefs />
      <rect x="14" y="8" width="752" height="188" rx="16" fill="#0f172a" fillOpacity="0.58" stroke="#38bdf8" strokeOpacity="0.32" />
      {/* 3D Lead Source Container */}
      <polygon points="36,52 118,52 132,38 50,38" fill="#64748b" />
      <rect x="36" y="52" width="82" height="114" rx="6" fill="#334155" stroke="#94a3b8" />
      <text x="77" y="114" textAnchor="middle" fill="#f8fafc" fontSize="15" fontWeight="700">Nguồn 3D</text>

      {/* 3D Paper Sheet */}
      <polygon points="270,36 286,24 286,162 270,174" fill="#e2e8f0" opacity="0.88" stroke="#94a3b8" />
      <text x="278" y="190" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="700">Giấy</text>

      {/* 3D Aluminum Plate */}
      <polygon points="465,36 492,22 492,162 465,174" fill="#38bdf8" fillOpacity="0.45" stroke="#7dd3fc" />
      <text x="478" y="190" textAnchor="middle" fill="#7dd3fc" fontSize="14" fontWeight="700">Nhôm (mm)</text>

      {/* 3D Thick Lead Block */}
      <polygon points="655,34 715,18 715,162 655,176" fill="#475569" opacity="0.9" stroke="#cbd5e1" />
      <text x="685" y="190" textAnchor="middle" fill="#cbd5e1" fontSize="14" fontWeight="700">Chì dày (cm)</text>

      {/* Alpha Ray (stops at Paper) */}
      <line x1="118" y1="72" x2="268" y2="72" stroke="#f97316" strokeWidth="4" strokeDasharray="8 5" />
      {renderMiniCluster("He4", 125 + beamProgress * 135, 72, 14, azimuth, elevation, "alpha-ray")}
      <text x="192" y="60" textAnchor="middle" fill="#fdba74" fontSize="15" fontWeight="700">Tia α (⁴₂He²⁺)</text>

      {/* Beta Ray (stops at Aluminum) */}
      <line x1="118" y1="110" x2="465" y2="110" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 4" />
      <circle cx={125 + beamProgress * 332} cy="110" r="7" fill="url(#electron-3d)" />
      <text x="368" y="98" textAnchor="middle" fill="#7dd3fc" fontSize="15" fontWeight="700">Tia β (e⁻ / e⁺)</text>

      {/* Gamma Ray (reaches Lead) */}
      <path d={`M118 148 Q 200 ${136 + Math.sin(frame * 0.25) * 12}, 285 148 T 455 148 T 655 148`} fill="none" stroke="#fde047" strokeWidth="3.2" />
      <text x="572" y="136" textAnchor="middle" fill="#fde047" fontSize="15" fontWeight="700">Tia γ (photon)</text>
    </svg>;
  }

  // B24 and B25 Recap 3D Stage
  return <svg viewBox="0 0 780 205" className="equation-3d-svg" aria-label="Tổng hợp mô hình 3D hạt nhân và ứng dụng">
    <SharedNucleonDefs />
    <rect x="14" y="8" width="236" height="188" rx="16" fill="#0f172a" fillOpacity="0.58" stroke="#38bdf8" strokeOpacity="0.32" />
    <circle cx="132" cy="96" r="56" fill="url(#model-aura)" />
    {renderMiniCluster("Fe56", 132, 96, 44, azimuth, elevation, "recap-fe56")}
    <text x="132" y="172" textAnchor="middle" fill="#e2e8f0" fontSize="15" fontWeight="700">Cấu trúc &amp; Độ bền (Eₗₖ/A)</text>

    <rect x="272" y="8" width="236" height="188" rx="16" fill="#0f172a" fillOpacity="0.58" stroke="#38bdf8" strokeOpacity="0.32" />
    <circle cx="390" cy="96" r="56" fill="url(#gold-aura)" />
    {renderMiniCluster("C14", 390, 96, 42, -azimuth, elevation, "recap-c14")}
    <circle cx="390" cy="96" r={28 + ((frame % 60) / 60) * 32} fill="none" stroke="#fde047" strokeWidth="2" opacity={1 - (frame % 60) / 60} />
    <text x="390" y="172" textAnchor="middle" fill="#fde047" fontSize="15" fontWeight="700">Định luật phân rã N(t), H(t)</text>

    <rect x="530" y="8" width="236" height="188" rx="16" fill="#0f172a" fillOpacity="0.58" stroke="#38bdf8" strokeOpacity="0.32" />
    <ellipse cx="648" cy="128" rx="58" ry="18" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
    <rect x="590" y="58" width="116" height="70" rx="8" fill="#0ea5e9" fillOpacity="0.22" stroke="#38bdf8" strokeWidth="2" />
    { [-32, -10, 12, 34].map((dx, i) => (
      <rect key={i} x={644 + dx} y={42 + Math.sin(frame * 0.04 + i) * 8} width="8" height="76" rx="3" fill="#f59e0b" />
    )) }
    <text x="648" y="172" textAnchor="middle" fill="#7dd3fc" fontSize="15" fontWeight="700">Điều khiển lò phản ứng (k = 1)</text>
  </svg>;
}

function EquationVisual({ scene, frame, lesson, code }) {
  const recap = scene.kind === "recap";
  const showResult = scene.resultFrame === null || frame >= scene.resultFrame;
  return <div className="visual-inner">
    <div className="visual-label"><span>{recap ? "TÓM TẮT TRỰC QUAN 3D" : "MÔ HÌNH 3D & CÔNG THỨC"}</span><strong>{recap ? "Ghi vào sổ tay" : "Công thức trọng tâm"}</strong></div>
    <div className={`equation-stage ${recap ? "recap-stage" : ""}`} style={{ opacity: 0.45 + 0.55 * ease(frame - 6, 36) }}>
      {recap ? <Recap3DStage code={code} frame={frame} /> : <Energy3DStage frame={frame} />}
      {showResult && scene.formula && <MathLine tex={scene.formula} className={recap ? "hero-equation recap-equation" : "hero-equation"} />}
      {recap && (showResult ? <div className="takeaways">{scene.takeaways.map(item => <span key={item}>{item}</span>)}</div>
        : <div className="equation-note">Dừng lại và thử giải.</div>)}
      {scene.note && <div className="equation-note">{scene.note}</div>}
    </div>
    {recap && <div className="credit"><b>Nguồn đối chiếu</b>{lesson.sources.map(source => <span key={source}>{source}</span>)}</div>}
  </div>;
}

const visuals = {
  nucleus: NucleusVisual,
  rutherford: RutherfordProcess,
  symbol: SymbolVisual,
  decayProcess: DecayProcess,
  activityProcess: ActivityProcess,
  fissionProcess: FissionProcess,
  fissionResults: FissionResults,
  reactorProcess: ReactorProcess,
  reactorFlow: ReactorFlow,
  energy: EquationVisual,
  recap: EquationVisual,
};

function Scene({ scene, lesson, code, number, count }) {
  const frame = useCurrentFrame();
  const p = ease(frame, 42);
  const Visual = visuals[scene.kind];
  const formula = scene.formula;
  const showFormulaLeft = !["energy", "recap"].includes(scene.kind);
  return <AbsoluteFill className="film">
    <div className="film-grid" />
    <header className="masthead">
      <span className="brand"><i /> VẬT LÍ HẠT NHÂN <em>/</em> 12</span>
      <span className="episode"><b>{code}</b>{lesson.name}</span>
    </header>
    <main className="lesson-frame">
      <section className="lecture" style={{ transform: `translateY(${(1 - p) * 23}px)`, opacity: 0.76 + p * 0.24 }}>
        <div className="kicker"><span>{String(number).padStart(2, "0")}</span>{lesson.theme}</div>
        <h1>{scene.title}</h1>
        <div className="accent-rule" style={{ transform: `scaleX(${0.23 + p * 0.77})` }} />
        <p>{scene.body}</p>
        {showFormulaLeft && <MathLine tex={formula} className={scene.kind === "fissionResults" ? "reaction-formula" : ""} />}
      </section>
      <section className="visual" style={{ transform: `translateX(${(1 - p) * 18}px)` }}>
        <Visual scene={scene} frame={frame} lesson={lesson} code={code} />
      </section>
    </main>
    <footer className="video-footer">
      <div className="caption"><span>PHỤ ĐỀ</span><p>{captionAt(scene, frame)}</p></div>
      <div className="progress">{Array.from({ length: count }, (_, index) => <i key={index} className={index < number ? "on" : ""} />)}<span>{number}/{count}</span></div>
    </footer>
  </AbsoluteFill>;
}

function Film({ code, narrationScenes }) {
  const lesson = LESSONS[code];
  const scenes = timeline(lesson, narrationScenes);
  return <AbsoluteFill>{scenes.map((scene, index) => <Sequence key={scene.from} from={scene.from} durationInFrames={scene.duration}>
    <Scene scene={scene} lesson={lesson} code={code} number={index + 1} count={scenes.length} />
  </Sequence>)}</AbsoluteFill>;
}

function Root() {
  return <>{Object.entries(LESSONS).map(([code, lesson]) => <Composition key={code} id={code} component={Film}
    defaultProps={{ code, narrationScenes: null }} durationInFrames={durationInFrames(lesson)} fps={FPS} width={WIDTH} height={HEIGHT}
    calculateMetadata={({ props }) => ({ durationInFrames: durationInFrames(lesson, props.narrationScenes) })} />)}</>;
}

registerRoot(Root);
