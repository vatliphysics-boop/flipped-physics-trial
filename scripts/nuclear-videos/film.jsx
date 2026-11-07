import React from "react";
import { AbsoluteFill, Composition, Easing, interpolate, registerRoot, Sequence, useCurrentFrame } from "remotion";
import { buildNucleusLayout, NUCLEON_COLORS } from "../../src/lib/nucleus-layout.ts";
import { NUCLEUS_MODEL_NOTE, NUCLIDES } from "../../src/lib/nuclear-science.ts";
import { captionAt, durationInFrames, FPS, HEIGHT, LESSONS, timeline, WIDTH } from "./storyboards.mjs";
import { MathLine } from "./math-line.jsx";
import { ActivityProcess, DecayProcess, FissionProcess, FissionResults, ReactorFlow, ReactorProcess, RutherfordProcess } from "./process-visuals.jsx";
import "./film.css";

const isotopeIds = new Set(Object.values(LESSONS).flatMap(lesson => lesson.shots.filter(scene => scene.kind === "nucleus").map(scene => scene.isotope)));
const layout = Object.fromEntries([...isotopeIds].map(id => [id, buildNucleusLayout(NUCLIDES[id])]));
const ease = (frame, end) => interpolate(frame, [0, end], [0, 1], {
  extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic),
});
function project({ x, y, z }, azimuth, elevation, radius) {
  const x1 = x * Math.cos(azimuth) - z * Math.sin(azimuth);
  const z1 = x * Math.sin(azimuth) + z * Math.cos(azimuth);
  const y1 = y * Math.cos(elevation) - z1 * Math.sin(elevation);
  const depth = y * Math.sin(elevation) + z1 * Math.cos(elevation);
  const perspective = 1 / (1 - depth / (radius * 4.8));
  return { x: x1 * perspective, y: y1 * perspective, depth, perspective };
}

function NucleusVisual({ scene, frame }) {
  const isotope = NUCLIDES[scene.isotope];
  const { particles, particleRadius, radius } = layout[scene.isotope];
  const motion = ease(frame, 62);
  const azimuth = scene.view + motion * 0.96;
  const elevation = 0.18 + motion * 0.48;
  const scale = (190 + motion * 19) / radius;
  const spheres = particles
    .map(particle => ({ ...particle, ...project(particle, azimuth, elevation, radius) }))
    .sort((a, b) => a.depth - b.depth);
  return <div className="visual-inner">
    <div className="visual-label"><span>GÓC QUAN SÁT</span><strong>{isotope.name}</strong></div>
    <svg className="graphic nucleus-graphic" viewBox="0 0 820 470" aria-label={`${isotope.name}, ${isotope.Z} proton và ${isotope.N} neutron`}>
      <defs>
        <radialGradient id="proton" cx="35%" cy="25%" r="74%"><stop stopColor="#fff0d5"/><stop offset=".38" stopColor={NUCLEON_COLORS.proton}/><stop offset="1" stopColor="#71380e"/></radialGradient>
        <radialGradient id="neutron" cx="35%" cy="25%" r="74%"><stop stopColor="#d1fff9"/><stop offset=".38" stopColor={NUCLEON_COLORS.neutron}/><stop offset="1" stopColor="#105855"/></radialGradient>
        <radialGradient id="model-aura"><stop stopColor="#2a8e8e" stopOpacity=".22"/><stop offset="1" stopColor="#2a8e8e" stopOpacity="0"/></radialGradient>
      </defs>
      <circle cx="410" cy="226" r="235" fill="url(#model-aura)"/>
      <path d="M410 17v421 M182 226h456" stroke="#72b2bc" strokeOpacity=".19" strokeDasharray="5 8"/>
      <path d="M72 28h70 M72 28v39 M748 28h-70 M748 28v39 M72 427h70 M72 427v-39 M748 427h-70 M748 427v-39" stroke="#8fb9c0" fill="none" opacity=".53"/>
      {spheres.map(p => <circle key={p.id} cx={410 + p.x * scale} cy={225 - p.y * scale} r={particleRadius * p.perspective * scale} fill={`url(#${p.kind})`} stroke="#06131e" strokeWidth={1.5} opacity={0.86 + 0.14 * (p.depth / radius + 1) / 2}/>)}
    </svg>
    <div className="nucleus-stats">
      <span><i style={{ background: NUCLEON_COLORS.proton }} /> <b>{isotope.Z}</b> proton</span>
      <span><i style={{ background: NUCLEON_COLORS.neutron }} /> <b>{isotope.N}</b> neutron</span>
      <span><b>{isotope.A}</b> nucleon</span>
    </div>
    <div className="visual-note">{NUCLEUS_MODEL_NOTE}</div>
  </div>;
}

function SymbolVisual({ scene, frame }) {
  const nuclide = NUCLIDES[scene.isotope];
  return <div className="visual-inner">
    <div className="visual-label"><span>KÍ HIỆU HẠT NHÂN</span><strong>{nuclide.name}</strong></div>
    <div className="symbol-stage">
      <div className="symbol-orbit"/>
      <MathLine tex={nuclide.latex} className="big-symbol"/>
      <div className="symbol-callout a" style={{ opacity: ease(frame - 6, 32) }}><b>A = {nuclide.A}</b><span>Tổng số nucleon</span></div>
      <div className="symbol-callout z" style={{ opacity: ease(frame - 19, 32) }}><b>Z = {nuclide.Z}</b><span>Số proton</span></div>
      <div className="symbol-callout x" style={{ opacity: ease(frame - 28, 32) }}><b>{nuclide.symbol}</b><span>Kí hiệu nguyên tố</span></div>
    </div>
    <div className="visual-note">A, Z và N là số hạt nên không có đơn vị.</div>
  </div>;
}

function EquationVisual({ scene, frame, lesson }) {
  const recap = scene.kind === "recap";
  const showResult = scene.resultFrame === null || frame >= scene.resultFrame;
  return <div className="visual-inner">
    <div className="visual-label"><span>{recap ? "TÓM TẮT BÀI HỌC" : "MỐI LIÊN HỆ"}</span><strong>{recap ? "Ghi vào sổ tay" : "Công thức trọng tâm"}</strong></div>
    <div className={`equation-stage ${recap ? "recap-stage" : ""}`} style={{ opacity: 0.33 + 0.67 * ease(frame - 10, 50) }}>
      {showResult && scene.formula && <MathLine tex={scene.formula} className="hero-equation"/>}
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
        {showFormulaLeft && <MathLine tex={formula} className={scene.kind === "fissionResults" ? "reaction-formula" : ""}/>}
      </section>
      <section className="visual" style={{ transform: `translateX(${(1 - p) * 18}px)` }}><Visual scene={scene} frame={frame} lesson={lesson}/></section>
    </main>
    <footer className="video-footer">
      <div className="caption"><span>PHỤ ĐỀ</span><p>{captionAt(scene, frame)}</p></div>
      <div className="progress">{Array.from({length: count}, (_, index) => <i key={index} className={index < number ? "on" : ""} />)}<span>{number}/{count}</span></div>
    </footer>
  </AbsoluteFill>;
}

function Film({ code, narrationScenes }) {
  const lesson = LESSONS[code];
  const scenes = timeline(lesson, narrationScenes);
  return <AbsoluteFill>{scenes.map((scene, index) => <Sequence key={scene.from} from={scene.from} durationInFrames={scene.duration}>
    <Scene scene={scene} lesson={lesson} code={code} number={index + 1} count={scenes.length}/>
  </Sequence>)}</AbsoluteFill>;
}

function Root() {
  return <>{Object.entries(LESSONS).map(([code, lesson]) => <Composition key={code} id={code} component={Film}
    defaultProps={{ code, narrationScenes: null }} durationInFrames={durationInFrames(lesson)} fps={FPS} width={WIDTH} height={HEIGHT}
    calculateMetadata={({ props }) => ({ durationInFrames: durationInFrames(lesson, props.narrationScenes) })} />)}</>;
}

registerRoot(Root);
