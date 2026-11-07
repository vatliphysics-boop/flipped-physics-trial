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
import { MathLine } from "./math-line.jsx";
import { FPS } from "./storyboards.mjs";

const colors = ["#76efda", "#ffb47b", "#a8baff"];
const format = (value, decimals = 1) => value.toFixed(decimals).replace(".", ",");
const position = (scene, frame, maximum) => maximum * Math.min(1, frame / Math.max(1, scene.processEndFrame ?? scene.duration - 1 - FPS));
const line = (points, x, y) => points.map(point => `${x(point[0])},${y(point[1])}`).join(" ");

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
const ringScale = 0.94;
const ringX = value => 405 + value * ringScale;
const ringY = value => 207 - value * ringScale;

export function RutherfordProcess({ scene, frame }) {
  const { mode } = scene;
  const runs = mode === "run" ? rutherfordRuns.slice(0, 1) : rutherfordRuns;
  const limit = mode === "run" ? runs[0].durationZs : rutherfordLimit;
  const time = mode === "setup" ? 0 : position(scene, frame, limit);
  return <Process label="TÁN XẠ RUTHERFORD" title="Hạt alpha và hạt nhân vàng" note="Mô hình một hạt alpha, một hạt nhân vàng cố định. Thời gian kéo dài; kích thước hạt được phóng đại.">
    <div className="process-conditions">
      <span>Động năng xa tâm <MathLine tex={`E=${runs[0].energyMeV}\\,\\mathrm{MeV}`} /></span>
      <span>Thời gian mô hình <b>{format(time, 2)} zs</b></span>
    </div>
    <svg className="graphic process-graphic" viewBox="0 0 820 406" aria-label="Quỹ đạo alpha trên mặt phẳng của đầu dò vòng">
      <circle cx={ringX(0)} cy={ringY(0)} r={RUTHERFORD_DETECTOR_RADIUS_FM * ringScale} className="detector-ring" />
      <path d={`M${ringX(-205)} ${ringY(0)}H${ringX(205)}`} className="process-reference"/>
      <circle cx={ringX(0)} cy={ringY(0)} r="11" fill="#ffce90"/>
      <text x={ringX(0)+20} y={ringY(0)+26} className="plot-label">Au</text>
      <text x="39" y="56" className="plot-label">Hạt alpha đi vào</text>
      <text x="619" y="56" className="plot-label">Vòng đầu dò</text>
      {runs.map((run, index) => {
        const p = sampleRutherford(run, time);
        const trail = rutherfordTrail(run, time, 50);
        const color = colors[index];
        return <g key={run.impactFm}>
          <path d={`M${ringX(-205)} ${ringY(run.impactFm)}H${ringX(-70)}`} stroke={color} className="process-reference"/>
          <polyline points={line(trail.map(sample => [sample.xFm, sample.yFm]), ringX, ringY)} stroke={color} className="process-line"/>
          <circle cx={ringX(p.xFm)} cy={ringY(p.yFm)} r={time >= run.durationZs ? 12 : 8} fill={color} />
          <text x="50" y={ringY(run.impactFm)+6} fill={color} fontSize="24">{index ? "B" : "A"}</text>
        </g>;
      })}
    </svg>
    <Metrics items={runs.map((run, index) => ({
      label: `${index ? "B" : "A"} · tham số va chạm ${run.impactFm} fm`,
      value: time >= run.durationZs ? `Góc lệch ${format(run.scatteringAngleDeg)}°` : "Hạt alpha",
      color: colors[index],
    }))}/>
  </Process>;
}

const fissionStages = ["Neutron tiến lại gần", "Hấp thụ neutron", "Hạt nhân biến dạng", "Sản phẩm tách ra"];

export function FissionProcess({ scene, frame }) {
  const hasNeutron = scene.mode !== "no-neutron";
  const motion = fissionMotion(position(scene, frame, FISSION_DURATION), hasNeutron);
  const { target, compound, fragments } = FISSION_CHANNEL;
  return <Process label="PHÂN HẠCH U-235" title={hasNeutron ? fissionStages[motion.stage] : "Không bắn neutron"}
    note="Một kênh minh họa. Chấm xanh là neutron. Hình và đường đi theo quy ước, thời gian được kéo dài.">
    <div className="process-conditions"><span>Điều kiện <b>{hasNeutron ? "Có 1 neutron tới" : "Không có neutron tới"}</b></span>
      <span>Thời gian minh họa <b>{format(motion.time)} s</b></span></div>
    <svg className="graphic process-graphic" viewBox="0 0 820 400" aria-label="Tiến trình sơ đồ phân hạch uranium-235">
      <defs>
        <radialGradient id="fission-core" cx="32%" cy="28%"><stop stopColor="#ffe7ca"/><stop offset=".42" stopColor="#d68a52"/><stop offset="1" stopColor="#692f1f"/></radialGradient>
        <radialGradient id="fission-product" cx="32%" cy="28%"><stop stopColor="#dffff7"/><stop offset=".42" stopColor="#6bceba"/><stop offset="1" stopColor="#22675f"/></radialGradient>
      </defs>
      <path d="M50 197H770" className="process-reference"/>
      {motion.stage < 3 ? <>
        <ellipse cx="410" cy="197" rx={78*motion.stretchX} ry={78*motion.stretchY} fill="url(#fission-core)" />
        <foreignObject x="365" y="163" width="90" height="75"><MathLine tex={motion.stage === 0 ? `{}^{${target.a}}_{${target.z}}\\mathrm{U}` : `{}^{${compound.a}}_{${compound.z}}\\mathrm{U}^{*}`} className="process-nuclide"/></foreignObject>
        {hasNeutron && motion.stage === 0 && <circle cx={410+motion.incomingX*64} cy="197" r="12" fill={colors[0]}/>}
      </> : <>
        {fragments.map((fragment, index) => {
          const center = 410 + motion.fragmentOffsets[index] * 69;
          return <g key={fragment.symbol}>
            <circle cx={center} cy="197" r={index ? 64 : 53} fill="url(#fission-product)" />
            <foreignObject x={center-51} y="162" width="102" height="76"><MathLine tex={`{}^{${fragment.a}}_{${fragment.z}}\\mathrm{${fragment.symbol}}`} className="process-nuclide"/></foreignObject>
          </g>;
        })}
        {motion.neutronPositions.map(([x,y,z], index) => <circle key={index} cx={410+x*59} cy={197-(0.65*y+0.75*z)*42} r="11" fill={colors[0]}/>)}
      </>}
    </svg>
    <Metrics items={hasNeutron && motion.stage === 3
      ? [{ label: "Mảnh phân hạch", value: "Y-95 và I-138" }, { label: "Hạt phát ra", value: "3 neutron", color: colors[0] }]
      : [{ label: "Kênh đang xét", value: hasNeutron ? "Phân hạch cảm ứng" : "Kênh chưa khởi phát" }]}/>
  </Process>;
}

export function FissionResults() {
  const { inputA, outputA, inputZ, outputZ } = fissionConservation();
  const { beforeMassU, afterMassU, qMeV } = FISSION_ENERGY;
  return <Process label="KẾT QUẢ KÊNH PHÂN HẠCH" title="Bảo toàn và tỏa năng lượng"
    note="Khối lượng nguyên tử từ AME2020. Hai vế cùng số electron; bỏ qua hiệu chỉnh liên kết electron ở mức làm tròn.">
    <div className="process-results">
      <MathLine tex={`\\sum A_1=\\sum A_2=${inputA}`} />
      <MathLine tex={`\\sum Z_1=\\sum Z_2=${inputZ}`} />
      <MathLine tex={`Q=(m_1-m_2)c^2\\approx ${qMeV.toFixed(1).replace(".","{,}")}\\,\\mathrm{MeV}`} />
    </div>
    <Metrics items={[
      { label: `Khối lượng trước · A = ${inputA}, Z = ${inputZ}`, value: `${format(beforeMassU, 6)} u` },
      { label: `Khối lượng sau · A = ${outputA}, Z = ${outputZ}`, value: `${format(afterMassU, 6)} u` },
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
  return <Process label="MẪU PHÂN RÃ MÔ PHỎNG" title="Một mẫu ngẫu nhiên · đường kì vọng"
    note={mode === "results" ? "Đường liền là kì vọng. Vòng tròn rỗng là số hạt còn lại của một mẫu mô phỏng tại 40 giây."
      : "Chấm còn sáng là hạt nhân mẹ chưa phân rã. Hai lượt dùng cùng seed. Dữ liệu mô hình, không phải số đo."}>
    <div className="process-conditions"><span>Số hạt ban đầu <b>{runs[0].initialCount}</b></span><span>Thời gian mô hình <b>{format(time)} s</b></span></div>
    {mode === "results" ? <svg className="graphic process-graphic" viewBox="0 0 820 395" aria-label="Đối chiếu số hạt kì vọng và số hạt từ hai lần mô phỏng">
      <path d="M83 40V327H759" className="process-axis"/>
      {[0, 10, 20, 30, 40].map(t => <text key={t} x={x(t)} y="358" textAnchor="middle" className="plot-label">{t}</text>)}
      {[0, 16, 32, 48, 64].map(n => <g key={n}><path d={`M83 ${y(n)}H759`} className="process-reference"/><text x="70" y={y(n)+6} textAnchor="end" className="plot-label">{n}</text></g>)}
      <text x="732" y="390" className="plot-label">t (s)</text><text x="60" y="32" className="plot-label">N</text>
      {runs.map((run, index) => <g key={run.halfLifeSeconds}>
        <polyline points={line(Array.from({ length: 41 }, (_, t) => [t, decayState(run, t).expected]), x, y)} stroke={colors[index]} className="process-line"/>
        <circle cx={x(time)} cy={y(states[index].remaining)} r="10" stroke={colors[index]} strokeWidth="3" fill="#122534"/>
      </g>)}
    </svg> : <div className="process-decay-panes">{runs.map((run, index) => <div key={run.halfLifeSeconds}>
      <MathLine tex={`T_{\\mathrm{${index ? "B" : "A"}}}=${run.halfLifeSeconds}\\,\\mathrm{s}`} />
      <svg viewBox="0 0 320 245" aria-label={`Mẫu ${run.halfLifeSeconds} giây`}>
        {run.lifetimes.map((lifetime, particle) => <circle key={particle} cx={38 + particle%8*35} cy={15+Math.floor(particle/8)*30} r="9" fill={colors[index]} opacity={lifetime > time ? 1 : 0.12}/>)}
      </svg>
    </div>)}</div>}
    <Metrics items={runs.map((run, index) => ({ label: `${index ? "B" : "A"} · T = ${run.halfLifeSeconds} s`,
      value: `${states[index].remaining} hạt · kì vọng ${format(states[index].expected)}`, color: colors[index] }))}/>
  </Process>;
}

const rodConditions = [0, 50, 100];

export function ReactorProcess({ scene, frame }) {
  const { mode } = scene;
  const rods = mode === "run" ? rodConditions.slice(0, 1) : rodConditions;
  const time = mode === "setup" ? 0 : position(scene, frame, REACTOR_LAST_GENERATION);
  const states = rods.map(rod => reactorState(time, rod));
  const x = generation => 98 + 626*generation/REACTOR_LAST_GENERATION;
  const y = count => 323 - 260*count/4;
  return <Process label="ĐIỀU KHIỂN PHẢN ỨNG DÂY CHUYỀN" title="Ba mức cắm thanh quy ước"
    note="Chỉ số kì vọng tương đối; mức 0–100% là quy ước của mô hình. Không suy công suất hoặc vị trí thanh của lò thật.">
    <div className="process-conditions"><span>Chuẩn hóa <MathLine tex="I_0=1" /></span><span>Thế hệ <b>{states[0].generation}</b></span></div>
    <svg className="graphic process-graphic" viewBox="0 0 820 398" aria-label="Chỉ số phản ứng dây chuyền kì vọng theo thế hệ">
      <path d="M98 40V323H741" className="process-axis"/>
      {[0,1,2,3,4].map(i => <g key={i}><path d={`M98 ${y(i)}H741`} className="process-reference"/>
        <text x="84" y={y(i)+6} textAnchor="end" className="plot-label">{i}</text><text x={x(i)} y="355" textAnchor="middle" className="plot-label">{i}</text>
      </g>)}
      <text x="635" y="387" className="plot-label">Thế hệ</text><text x="26" y="32" className="plot-label">Chỉ số</text>
      <path d={`M${x(time)} 44V323`} stroke="#97b6c8" strokeDasharray="5 8"/>
      {rods.map((rod, index) => {
        const state = states[index];
        const points = Array.from({ length: state.generation + 1 }, (_, g) => [g, reactorState(g, rod).expected]);
        return <g key={rod}>
          <polyline points={line(points, x, y)} stroke={colors[index]} className="process-line"/>
          {points.map(([g, count]) => <circle key={g} cx={x(g)} cy={y(count)} r="7" fill={colors[index]}/>)}
        </g>;
      })}
    </svg>
    <Metrics items={states.map((state, index) => ({ label: `Cắm ${state.rodPercent}% · k = ${format(state.k)}`,
      value: format(state.expected, 2), color: colors[index] }))}/>
  </Process>;
}

export function ReactorFlow({ scene, frame }) {
  const flow = reactorFlowState(position(scene, frame, REACTOR_FLOW_LAST_STEP + 1));
  const nodes = [
    [58, 110, 113, 115], [295, 110, 135, 115], [529, 110, 105, 66], [682, 110, 117, 66], [529, 270, 129, 66],
  ];
  const segments = [
    { d: "M171 134H294 M294 203H171", color: colors[1], steps: [0, 1] },
    { d: "M431 142H527 M590 176V268", color: colors[0], steps: [1, 2] },
    { d: "M635 142H681", color: colors[2], steps: [2, 3] },
    { d: "M528 302H383V227", color: colors[0], steps: [4] },
  ];
  return <Process label="ĐƯỜNG TRUYỀN NĂNG LƯỢNG" title="Lò nước áp lực · sơ đồ PWR"
    note="Hai vòng nước tách biệt. Thứ tự trình bày là quy ước; chu trình thực vận hành liên tục.">
    <svg className="graphic process-graphic" viewBox="0 0 820 392" aria-label="Sơ đồ hai vòng nước tách biệt của lò nước áp lực">
      {segments.map(({ d, color, steps }, index) => <g key={d}>
        <defs><marker id={`pwr-flow-${index}`} viewBox="0 0 12 12" refX="9" refY="6" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L12 6L0 12Z" fill={color}/></marker></defs>
        <path d={d} fill="none" stroke={color} strokeWidth="4" opacity=".42" markerEnd={`url(#pwr-flow-${index})`}/>
        {steps.includes(flow.step) && <path d={d} fill="none" stroke={color} strokeWidth="7" strokeDasharray="12 17" strokeDashoffset={-flow.time*68}/>}
      </g>)}
      {REACTOR_FLOW_STAGES.map((stage, index) => {
        const [x,y,w,h] = nodes[index];
        return <g key={stage.id}>
          <rect x={x} y={y} width={w} height={h} rx="15" fill={flow.step === index ? "#24535f" : "#1b3445"} stroke={flow.step === index ? colors[0] : "#628391"} strokeWidth="2"/>
          <text x={x+w/2} y={y+h/2+(index===1 ? -17 : 6)} textAnchor="middle" fill="#e4f0f4" fontSize={index===3 ? 17 : 20}>{stage.label}</text>
          {index===1 && <path d={`M${x+w/2} ${y+52}V${y+h-8}`} stroke="#9ab9c9" strokeDasharray="5 6"/>}
        </g>;
      })}
      <text x="180" y="93" fill={colors[1]} fontSize="19">Vòng sơ cấp</text>
      <text x="448" y="93" fill={colors[0]} fontSize="19">Vòng thứ cấp</text>
      <text x="617" y="224" fill={colors[2]} fontSize="18">Trục quay</text>
      <text x="392" y="365" fill={colors[0]} fontSize="19">Nước trở lại bộ sinh hơi</text>
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
  const x = t => 83 + 664*t/activityEnd;
  const y = h => 339 - 275*h/activityInitial;
  const fits = mode === "run" ? fitHalfLives.slice(0,1) : ["compare", "results"].includes(mode) ? fitHalfLives : [];
  return <Process label="ĐỘ PHÓNG XẠ THEO THỜI GIAN" title="SGK · Bảng 25.1"
    note="Chấm là số liệu SGK tr. 121. Đường là mô hình; hai giá trị T thử không phải kết quả đo.">
    <div className="process-conditions"><span>Mức nửa ban đầu <b>{format(bracket.halfActivityBq)} Bq</b></span>
      {mode === "setup" ? <span>Độ phóng xạ ban đầu <b>{activityInitial} Bq</b></span> : <span>Mốc đọc <b>{format(readTime,0)} s</b></span>}
    </div>
    <svg className="graphic process-graphic" viewBox="0 0 820 405" aria-label="Bảng độ phóng xạ SGK và các đường thử bán rã">
      <path d="M83 41V339H758" className="process-axis"/>
      {mode !== "setup" && <rect x={x(bracket.fromSeconds)} y="54" width={x(bracket.toSeconds)-x(bracket.fromSeconds)} height="285" fill="#f3ac74" opacity=".14" />}
      <path d={`M83 ${y(bracket.halfActivityBq)}H753`} stroke="#ffbb85" strokeDasharray="7 8"/>
      <text x="458" y={y(bracket.halfActivityBq)-9} className="plot-label">Mức nửa ban đầu</text>
      {mode !== "setup" && <path d={`M${x(readTime)} 41V339`} stroke="#c9dae2" strokeDasharray="4 7"/>}
      {fits.map((halfLife, index) => {
        const points = Array.from({ length: 45 }, (_, step) => {
          const t = time*step/44;
          return [t, activityAt(t, halfLife, activityInitial)];
        });
        return <polyline key={halfLife} points={line(points, x, y)} stroke={colors[index]} className="process-line"/>;
      })}
      {SGK_TABLE_25_1.map(point => <text key={point.t} x={x(point.t)} y="370" textAnchor="middle" className="plot-label">{point.t}</text>)}
      {SGK_TABLE_25_1.map(point => <g key={point.t}>
        <circle cx={x(point.t)} cy={y(point.h)} r="7" fill="#e4edf4"/>
        {point.t === 0 && <text x={x(point.t)+10} y={y(point.h)-10} className="plot-label">{point.h}</text>}
        {(point.t === bracket.fromSeconds || point.t === bracket.toSeconds) &&
          <text x={x(point.t)-12} y={y(point.h)+(point.t === bracket.toSeconds ? 22 : -12)} textAnchor="end" className="plot-label">{point.h}</text>}
      </g>)}
      <text x="81" y="33" className="plot-label">H (Bq)</text><text x="747" y="399" className="plot-label">t (s)</text>
    </svg>
    <Metrics items={fits.length ? [
      ...fits.map((halfLife, index) => ({ label: `Đường thử T = ${halfLife} s`,
        value: `${format(activityAt(readTime, halfLife, activityInitial))} Bq`, color: colors[index] })),
      ...(mode === "results" ? [{ label: "Bảng 25.1 tại cùng mốc", value: `${SGK_TABLE_25_1.find(point => point.t === readTime).h} Bq` }] : []),
    ]
      : [{ label: "Nguồn dữ liệu", value: `${SGK_TABLE_25_1.length} điểm từ Bảng 25.1` }]}/>
  </Process>;
}
