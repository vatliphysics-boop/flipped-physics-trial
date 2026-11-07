"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChoiceCheck, Lab, Sources } from './shared';
import { LatexMath } from "@/components/learning/LatexMath";
import { REACTOR_FLOW_LAST_STEP, REACTOR_FLOW_STAGES, REACTOR_LAST_GENERATION, REACTOR_SOURCE, reactorFlowState, reactorState } from "@/lib/reactor-model";
import reactorStyles from "./ReactorActivity.module.css";

export type ActivityProps = {
  onProgress?: (done: boolean) => void;
};

const trendText = {
  rising: { label: "Số phân hạch kì vọng tăng qua các thế hệ", comparison: ">", color: "#b45309" },
  steady: { label: "Số phân hạch kì vọng giữ nguyên qua các thế hệ", comparison: "=", color: "#086b66" },
  falling: { label: "Số phân hạch kì vọng giảm qua các thế hệ", comparison: "<", color: "#1d4e9a" },
};

const chainMax = reactorState(REACTOR_LAST_GENERATION, 0).expected;
const reactorFormat = (value: number) => value.toLocaleString("vi", { maximumFractionDigits: 2 });

function NeutronPaths({ state }: { state: ReturnType<typeof reactorState> }) {
  const progress = state.finished ? 1 : state.progress;
  const insertion = state.rodPercent / 100;
  return <figure className={reactorStyles.diagram}>
    <svg className={reactorStyles.landscape} viewBox="0 0 680 228" role="img" aria-label="Các đường đi quy ước của neutron tới thanh điều khiển hoặc nhiên liệu">
      <rect x="18" y="12" width="644" height="204" rx="14" fill="#10263b" />
      <rect x="280" y="31" width="36" height={48 + 89 * insertion} rx="5" fill="#7190a9" />
      <rect x="509" y="71" width="105" height="120" rx="12" fill="#744627" stroke="#f9ba82" strokeWidth="2" />
      <path d="M79 103H281 M79 155H509" fill="none" stroke="#9bcad8" strokeWidth="3" strokeDasharray="6 8" />
      <text x="71" y="56" fill="#e5f6fd" fontSize="21" fontWeight="650">Neutron tới</text>
      <text x="297" y="54" fill="#f0f7fa" fontSize="18" textAnchor="middle">↓</text>
      <text x="330" y="91" fill="#cbdce5" fontSize="19">Thanh điều khiển</text>
      <text x="562" y="143" fill="#fff1df" fontSize="19" textAnchor="middle">Nhiên liệu</text>
      <circle cx={79 + 202 * progress} cy="103" r="10" fill="#65d5f0" opacity={insertion} />
      <circle cx={79 + 430 * Math.min(1, progress / 0.78)} cy="155" r="10" fill="#ffc27d" opacity={1 - 0.65 * insertion} />
      {progress > 0.78 && <g fill="#ffc27d" opacity={1 - 0.65 * insertion}>
        <circle cx={615 + 92 * (progress - 0.78)} cy={128 - 55 * (progress - 0.78)} r="6" />
        <circle cx={615 + 92 * (progress - 0.78)} cy={154 + 55 * (progress - 0.78)} r="6" />
      </g>}
    </svg>
    <svg className={reactorStyles.portrait} viewBox="0 0 280 368" role="img" aria-label="Các đường đi quy ước của neutron tới thanh điều khiển hoặc nhiên liệu">
      <rect width="280" height="368" rx="14" fill="#10263b" />
      <rect x="12" y="12" width="256" height="164" rx="10" fill="#19384c" />
      <text x="140" y="43" textAnchor="middle" fill="#d6f4fb" fontSize="18" fontWeight="650">Thanh điều khiển</text>
      <text x="140" y="67" textAnchor="middle" fill="#bed6e3" fontSize="17">có thể hấp thụ neutron</text>
      <path d="M36 126H220" stroke="#99c2d3" strokeWidth="3" strokeDasharray="6 8" />
      <path d="M118 119L130 126L118 133Z" fill="#99c2d3" />
      <rect x="205" y="94" width="30" height={28 + 38 * insertion} rx="5" fill="#8aa9bd" />
      <circle cx={36 + 169 * progress} cy="126" r="9" fill="#65d5f0" opacity={insertion} />
      <text x="36" y="157" textAnchor="middle" fill="#cbdce5" fontSize="17">n tới</text>
      <rect x="12" y="188" width="256" height="168" rx="10" fill="#19384c" />
      <text x="140" y="219" textAnchor="middle" fill="#ffe0bf" fontSize="18" fontWeight="650">Tới hạt nhân nhiên liệu</text>
      <text x="140" y="243" textAnchor="middle" fill="#bed6e3" fontSize="17">có thể gây phân hạch tiếp</text>
      <path d="M36 300H205" stroke="#d6b18c" strokeWidth="3" strokeDasharray="6 8" />
      <path d="M118 293L130 300L118 307Z" fill="#d6b18c" />
      <circle cx="214" cy="300" r="23" fill="#744627" stroke="#f9ba82" strokeWidth="2" />
      <circle cx={36 + 155 * Math.min(1, progress / 0.78)} cy="300" r="9" fill="#ffc27d" opacity={1 - 0.65 * insertion} />
      {progress > 0.78 && <g fill="#ffc27d" opacity={1 - 0.65 * insertion}>
        <circle cx={241 + 68 * (progress - 0.78)} cy={287 - 55 * (progress - 0.78)} r="5" />
        <circle cx={241 + 68 * (progress - 0.78)} cy={313 + 55 * (progress - 0.78)} r="5" />
      </g>}
      <text x="36" y="337" textAnchor="middle" fill="#cbdce5" fontSize="17">n tới</text>
    </svg>
    <figcaption>Xanh là đường tới thanh điều khiển. Cam là đường tới nhiên liệu và có thể gây phân hạch tiếp. Độ sáng gợi xu hướng khi đổi vị trí thanh. Số chấm và độ sáng là quy ước minh họa.</figcaption>
  </figure>;
}

const flowPaths = [
  "M110 146H267",
  "M275 147C307 147 305 78 337 78H444",
  "M432 79H523",
  "M523 79H641",
  "M440 107V184H324V145",
];
const flowDevices = [
  { x: 39, y: 120, width: 106, title: "Lõi lò" },
  { x: 240, y: 116, width: 114, title: "Bộ sinh hơi" },
  { x: 395, y: 51, width: 97, title: "Tua-bin" },
  { x: 522, y: 51, width: 105, title: "Máy phát" },
  { x: 361, y: 160, width: 111, title: "Bình ngưng" },
];

const portraitFlowPaths = [
  "M116 108H162",
  "M210 150V226H68V250",
  "M118 280H160",
  "M260 280H272",
  "M68 310V365 M68 425V470H267V122H260",
];
const portraitFlowDevices = [
  { x: 18, y: 90, title: ["Lõi lò"] },
  { x: 160, y: 90, title: ["Bộ sinh", "hơi"] },
  { x: 18, y: 250, title: ["Tua-bin"] },
  { x: 160, y: 250, title: ["Máy phát"] },
  { x: 18, y: 365, title: ["Bình", "ngưng"] },
];

function ReactorFlow({ state }: { state: ReturnType<typeof reactorFlowState> }) {
  return <figure className={reactorStyles.diagram}>
    <svg className={reactorStyles.landscape} viewBox="0 0 680 228" role="img" aria-label="Hai vòng nước cách li trong nhà máy điện hạt nhân kiểu lò nước áp lực">
      <rect x="18" y="12" width="644" height="204" rx="14" fill="#10263b" />
      <path d="M138 141H254V175H98V153" fill="none" stroke="#f2ae76" strokeWidth="5" />
      <path d="M332 131V79H439V184H324V149" fill="none" stroke="#78dce5" strokeWidth="5" />
      <path d="M433 79H644" fill="none" stroke="#a1d69a" strokeWidth="4" strokeDasharray="9 7" />
      <path d="M180 134L192 141L180 148ZM177 168L165 175L177 182Z" fill="#f2ae76" />
      <path d="M363 72L375 79L363 86ZM432 134L439 146L446 134ZM355 177L343 184L355 191Z" fill="#78dce5" />
      <path d="M503 72L515 79L503 86Z" fill="#a1d69a" />
      <path d={flowPaths[state.step]} pathLength="1" fill="none" stroke="#ffcf99" strokeWidth="3" strokeLinecap="round" opacity=".55" strokeDasharray={state.finished ? "1 1" : `${Math.max(0.02, state.progress)} 1`} />
      {flowDevices.map(({ x, y, width, title }, index) => <g key={title}>
        <rect x={x} y={y} width={width} height="48" rx="8" fill="#213f57" stroke={index === state.step ? "#ffce99" : "#6b8ca2"} strokeWidth={index === state.step ? 3 : 1.5} />
        <text x={x + width / 2} y={y + 30} fill="#f0f7fa" textAnchor="middle" fontSize="18" fontWeight="650">{title}</text>
      </g>)}
      <text x="45" y="50" fill="#ffca9a" fontSize="17">Sơ cấp</text>
      <text x="45" y="77" fill="#98e9ee" fontSize="17">Thứ cấp</text>
    </svg>
    <svg className={reactorStyles.portrait} viewBox="0 0 280 510" role="img" aria-label="Hai vòng nước cách li trong nhà máy điện hạt nhân kiểu lò nước áp lực">
      <rect width="280" height="510" rx="14" fill="#10263b" />
      <text x="18" y="31" fill="#ffca9a" fontSize="18" fontWeight="650">Vòng sơ cấp</text>
      <text x="18" y="58" fill="#cbdce5" fontSize="17">Truyền nhiệt qua thành ống</text>
      <path d="M110 108H176V170H68V145" fill="none" stroke="#f2ae76" strokeWidth="4" />
      <path d="M132 101L144 108L132 115ZM130 163L118 170L130 177Z" fill="#f2ae76" />
      <text x="18" y="205" fill="#98e9ee" fontSize="18" fontWeight="650">Vòng thứ cấp</text>
      <path d="M210 145V226H68V470H267V122H253" fill="none" stroke="#78dce5" strokeWidth="4" />
      <path d="M203 185L210 197L217 185ZM154 219L142 226L154 233ZM61 332L68 344L75 332ZM166 463L178 470L166 477ZM260 337L267 325L274 337Z" fill="#78dce5" />
      <path d="M112 280H272" fill="none" stroke="#a1d69a" strokeWidth="4" strokeDasharray="8 6" />
      <path d="M134 273L146 280L134 287Z" fill="#a1d69a" />
      <path d={portraitFlowPaths[state.step]} pathLength="1" fill="none" stroke="#ffcf99" strokeWidth="3" strokeLinecap="round" opacity=".7" strokeDasharray={state.finished ? "1 1" : `${Math.max(0.02, state.progress)} 1`} />
      {portraitFlowDevices.map(({ x, y, title }, index) => <g key={index}>
        <rect x={x} y={y} width="100" height="60" rx="8" fill="#213f57" stroke={index === state.step ? "#ffce99" : "#6b8ca2"} strokeWidth={index === state.step ? 3 : 1.5} />
        <text x={x + 50} y={y + (title.length > 1 ? 25 : 36)} fill="#f0f7fa" textAnchor="middle" fontSize="18" fontWeight="650">
          {title.map((line, lineIndex) => <tspan key={line} x={x + 50} dy={lineIndex === 0 ? 0 : 22}>{line}</tspan>)}
        </text>
      </g>)}
      <text x="160" y="337" fill="#a1d69a" fontSize="17">Trục quay</text>
      <text x="18" y="498" fill="#98e9ee" fontSize="17">Nước về bộ sinh hơi</text>
    </svg>
    <figcaption><strong>{state.stage.label}.</strong> {state.stage.detail}</figcaption>
  </figure>;
}

// A single activity with independent didactic clocks for neutron generations and water/energy flow.
export function ReactorControlConcept({ onProgress }: ActivityProps) {
  const [mode, setMode] = useState<"chain" | "flow">("chain");
  const [rod, setRod] = useState(50);
  const [position, setPosition] = useState(0);
  const [running, setRunning] = useState(false);
  const [hasWithdrawn, setHasWithdrawn] = useState(false);
  const [hasInserted, setHasInserted] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const chain = reactorState(position, rod);
  const flow = reactorFlowState(position);
  const trend = trendText[chain.trend];
  const multiplier = reactorFormat(chain.k).replace(",", "{,}");
  const last = mode === "chain" ? REACTOR_LAST_GENERATION : REACTOR_FLOW_LAST_STEP;

  function seek(next: number) {
    positionRef.current = next;
    setPosition(next);
    setRunning(false);
  }

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const pause = () => setRunning(false);
    const visibility = () => { if (document.hidden) pause(); };
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) pause(); });
    observer.observe(element);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    let frame = 0, previous = performance.now();
    function animate(now: number) {
      const next = Math.min(last, positionRef.current + Math.min(now - previous, 80) / 1250);
      previous = now;
      positionRef.current = next;
      setPosition(next);
      if (next >= last) setRunning(false);
      else frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [last, running]);

  function changeRod(next: number) {
    setRod(next);
    seek(0);
    const withdrawn = hasWithdrawn || next < 20;
    const inserted = hasInserted || next > 80;
    setHasWithdrawn(withdrawn);
    setHasInserted(inserted);
    onProgress?.(withdrawn && inserted && hasAnswered);
  }

  return <div ref={container}><Lab
    intro="Khám phá phản ứng dây chuyền và dòng năng lượng trong nhà máy điện hạt nhân kiểu lò nước áp lực, theo Hình 24.1 và 24.3 SGK."
    note="Đây là mô hình định tính. Vị trí thanh điều khiển và thời gian đã quy ước. Giá trị giữa là mốc so sánh trong mô hình, không phải vị trí tới hạn của lò thật. Hai diễn tiến dùng các bước riêng, không suy ra độ trễ, nhiệt độ hay công suất nhà máy."
  >
    <div className="physics-guide">
      <p><strong>So sánh hai lần thử</strong></p>
      <ol>
        <li>Rút thanh tới 0%, chạy qua các thế hệ và ghi xu hướng của phản ứng dây chuyền.</li>
        <li>Cắm thanh sâu hơn 80%, chạy lại từ thế hệ 0. Giải thích khác biệt dựa vào sự hấp thụ neutron.</li>
        <li>Chọn dòng năng lượng. Theo dõi từ lõi lò đến máy phát, rồi tìm đường nước trở về ở vòng thứ cấp.</li>
      </ol>
    </div>
    <div className="physics-controls" aria-label="Chọn quá trình khảo sát">
      <button type="button" className={`physics-button ${mode === "chain" ? "primary" : ""}`} aria-pressed={mode === "chain"} onClick={() => { setMode("chain"); seek(0); }}>Phản ứng dây chuyền</button>
      <button type="button" className={`physics-button ${mode === "flow" ? "primary" : ""}`} aria-pressed={mode === "flow"} onClick={() => { setMode("flow"); seek(0); }}>Dòng năng lượng</button>
    </div>
    {mode === "chain" && <label className="physics-field">
      <span>Thanh điều khiển cắm sâu <strong>{rod}%</strong></span>
      <input type="range" min={0} max={100} step={5} value={rod} onChange={event => changeRod(Number(event.target.value))} />
    </label>}
    <div className="physics-controls">
      <button type="button" className="physics-button primary" onClick={() => {
        if (positionRef.current >= last) seek(0);
        setRunning(!running);
      }}>{running ? "Tạm dừng" : position >= last ? "Chạy lại" : position > 0 ? "Tiếp tục" : mode === "chain" ? "Mô phỏng phân hạch" : "Chạy dòng năng lượng"}</button>
      <button type="button" className="physics-button" disabled={position >= last} onClick={() => seek(Math.min(last, Math.floor(position) + 1))}>Tiến một bước</button>
      <button type="button" className="physics-button" onClick={() => seek(0)}>Đặt lại mô phỏng</button>
    </div>
    {mode === "chain" ? <>
      <NeutronPaths state={chain} />
      <p role="status" className={reactorStyles.current}><strong>Thế hệ {chain.generation}.</strong> {trend.label}.</p>
      <LatexMath block math={String.raw`k${trend.comparison}1\qquad k=${multiplier}`} />
      <div className={reactorStyles.generations} aria-label="Chỉ số tương đối theo thế hệ">
        {Array.from({ length: REACTOR_LAST_GENERATION + 1 }, (_, generation) => {
          const expected = reactorState(generation, rod).expected;
          return <div key={generation} className={reactorStyles.generation} aria-current={generation === chain.generation ? "step" : undefined}>
            <span>{generation}</span>
            <div aria-hidden="true"><i style={{ width: generation > chain.generation ? 0 : `${100 * expected / chainMax}%`, backgroundColor: trend.color }} /></div>
            <span>{generation > chain.generation ? "…" : reactorFormat(expected)}</span>
          </div>;
        })}
      </div>
      <p className="physics-note">Chỉ số ở thế hệ 0 được đặt bằng 1. Giá trị ở thế hệ sau là kì vọng tương đối, không phải số neutron đếm trực tiếp. Thanh điều khiển hấp thụ neutron; riêng việc thay đổi hệ số nhân chưa đủ để kết luận về an toàn của nhà máy.</p>
    </> : <>
      <ReactorFlow state={flow} />
      <div className="physics-controls" aria-label="Các khâu chuyển hóa và tuần hoàn">
        {REACTOR_FLOW_STAGES.map((stage, index) => <button key={stage.id} type="button" className={`physics-button ${index === flow.step ? "primary" : ""}`} aria-pressed={index === flow.step} onClick={() => seek(index)}>{stage.label}</button>)}
      </div>
      <p role="status" className={reactorStyles.current}>{flow.stage.detail}</p>
    </>}
    <div className="physics-checklist">
      <p><strong>Tiêu chí hoàn thành</strong></p>
      <ul>
        <li className={hasWithdrawn ? "is-done" : ""}>Đã thử rút thanh điều khiển {hasWithdrawn ? "✓" : ""}</li>
        <li className={hasInserted ? "is-done" : ""}>Đã thử cắm sâu thanh điều khiển {hasInserted ? "✓" : ""}</li>
        <li className={hasAnswered ? "is-done" : ""}>Đã giải thích tác dụng của thanh điều khiển {hasAnswered ? "✓" : ""}</li>
      </ul>
    </div>
    <ChoiceCheck
      question="Khi cần dừng phản ứng dây chuyền khẩn cấp, đưa thanh điều khiển vào lõi lò có tác dụng gì?"
      options={[
        "Tăng số neutron để duy trì phát điện.",
        "Hấp thụ thêm neutron, khiến ít neutron còn có thể gây phân hạch tiếp theo.",
        "Thay cho việc dẫn nhiệt ra ngoài bằng chất tải nhiệt.",
      ]}
      correctIndex={1}
      explanation="Vật liệu như boron hoặc cadmium hấp thụ neutron để giảm nhanh phản ứng dây chuyền. Lò vẫn cần làm mát do nhiệt dư."
      onResult={correct => { setHasAnswered(correct); onProgress?.(hasWithdrawn && hasInserted && correct); }}
    />
    <Sources links={[{ label: "U.S. NRC · Pressurized Water Reactors", url: REACTOR_SOURCE }]} />
  </Lab></div>;
}

export { ReactorControlConcept as NuclearPowerEnergyFlow };

// ─── 3. Nuclear Medicine – Y học hạt nhân ────────────────────────────────────
export function NuclearMedicine({ onProgress }: ActivityProps) {
  const [tab, setTab] = useState<'pet' | 'spect' | 'therapy'>('pet');
  const [viewedTabs, setViewedTabs] = useState<Set<string>>(new Set(['pet']));
  const [hasAnswered, setHasAnswered] = useState(false);

  const checkDone = useCallback((viewed: Set<string>, ans: boolean) => {
    onProgress?.(viewed.size >= 2 && ans);
  }, [onProgress]);

  function handleTab(t: 'pet' | 'spect' | 'therapy') {
    setTab(t);
    setViewedTabs(prev => {
      const next = new Set(prev);
      next.add(t);
      checkDone(next, hasAnswered);
      return next;
    });
  }

  function handleAnswered(correct: boolean) {
    setHasAnswered(correct);
    checkDone(viewedTabs, correct);
  }

  const petIsotopes = [
    { name: '¹⁸F (Fluorine-18)', T: 110, unit: 'phút', use: 'PET/CT với chất đánh dấu FDG', benefit: 'Ví dụ chất đánh dấu phát positron trong ghi hình' },
    { name: '¹¹C (Carbon-11)', T: 20, unit: 'phút', use: 'Nghiên cứu thần kinh', benefit: 'Giống sinh học, nhưng T quá ngắn' },
    { name: '⁶⁸Ga (Gallium-68)', T: 68, unit: 'phút', use: 'PET chẩn đoán khối u nội tiết', benefit: 'Có thể cung cấp từ máy phát đồng vị' },
  ];

  const spectIsotopes = [
    { name: '⁹⁹ᵐTc (Technetium-99m)', T: 6, unit: 'giờ', use: 'Chụp xương, tim, thận', benefit: 'Ví dụ chất đánh dấu phát gamma trong SPECT' },
    { name: '¹³¹I (Iodine-131)', T: 8, unit: 'ngày', use: 'Chẩn đoán và điều trị tuyến giáp', benefit: 'Vừa chẩn đoán vừa điều trị' },
  ];

  const therapyDrugs = [
    { name: 'Xofigo (²²³Ra)', isotope: '²²³Ra', T: '11,4 ngày', mechanism: 'Hấp thụ vào xương → phát tia α tiêu diệt ung thư xương di căn', indication: 'Ung thư tuyến tiền liệt di căn xương' },
    { name: 'Lutathera (¹⁷⁷Lu)', isotope: '¹⁷⁷Lu', T: '6,7 ngày', mechanism: 'Gắn vào thụ thể somatostatin → phát β⁻ tiêu diệt tế bào', indication: 'Khối u thần kinh nội tiết' },
  ];

  return (
    <Lab
      intro="Y học hạt nhân (SGK trang 116–117, Hình 24.4): Ứng dụng đồng vị phóng xạ trong chẩn đoán (PET, SPECT) và điều trị."
      note="Đồng vị và dược chất được lựa chọn theo mục đích ghi hình hoặc điều trị, loại bức xạ và chu kì bán rã. Đây là minh họa kiến thức Vật lí, không dùng để lựa chọn điều trị."
    >
      <div className="physics-guide">
        <p><strong>🏥 Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Xem:</strong> Chuyển qua ít nhất 2 tab (PET, SPECT, Điều trị).</li>
          <li><strong>So sánh:</strong> PET và SPECT phát hiện bức xạ theo cơ chế nào?</li>
          <li><strong>Giải thích:</strong> Trả lời câu hỏi về ¹³¹I.</li>
        </ol>
      </div>

      <div className="physics-controls">
        <button type="button" className={`physics-button ${tab === 'pet' ? 'primary' : ''}`} onClick={() => handleTab('pet')}>PET {viewedTabs.has('pet') ? '✓' : ''}</button>
        <button type="button" className={`physics-button ${tab === 'spect' ? 'primary' : ''}`} onClick={() => handleTab('spect')}>SPECT {viewedTabs.has('spect') ? '✓' : ''}</button>
        <button type="button" className={`physics-button ${tab === 'therapy' ? 'primary' : ''}`} onClick={() => handleTab('therapy')}>Điều trị {viewedTabs.has('therapy') ? '✓' : ''}</button>
      </div>

      {tab === 'pet' && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', marginBottom: '16px' }}>
            <strong>Nguyên tắc PET:</strong> Đồng vị phát β⁺ → positron gặp electron → phản hủy → 2 tia γ ngược chiều (511 keV) → PET dựng hình 3D.
          </div>
          {petIsotopes.map(iso => (
            <div key={iso.name} style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', marginBottom: '8px' }}>
              <p style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{iso.name} – T₁/₂ = {iso.T} {iso.unit}</p>
              <p style={{ fontSize: '14px', marginTop: '4px' }}>Ứng dụng: {iso.use}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>Đặc điểm: {iso.benefit}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'spect' && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', marginBottom: '16px' }}>
            <strong>Nguyên tắc SPECT:</strong> Đồng vị phát tia γ trực tiếp → camera gamma quay quanh bệnh nhân → dựng hình 3D.
          </div>
          {spectIsotopes.map(iso => (
            <div key={iso.name} style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', marginBottom: '8px' }}>
              <p style={{ fontWeight: 600, color: '#16a34a' }}>{iso.name} – T₁/₂ = {iso.T} {iso.unit}</p>
              <p style={{ fontSize: '14px', marginTop: '4px' }}>Ứng dụng: {iso.use}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>Ưu điểm: {iso.benefit}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'therapy' && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#fdf4ff', borderRadius: '8px', marginBottom: '16px' }}>
            <strong>Nguyên tắc:</strong> Dược chất phóng xạ hướng đến mô ung thư cụ thể → phát tia α hoặc β⁻ tại chỗ → tiêu diệt tế bào ung thư.
          </div>
          {therapyDrugs.map(drug => (
            <div key={drug.name} style={{ padding: '12px', border: '1px solid #e9d5ff', borderRadius: '8px', marginBottom: '8px', backgroundColor: '#fdf4ff' }}>
              <p style={{ fontWeight: 600, color: '#7c3aed' }}>{drug.name} ({drug.isotope}, T₁/₂ = {drug.T})</p>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>Cơ chế: {drug.mechanism}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', fontStyle: 'italic' }}>Chỉ định: {drug.indication}</p>
            </div>
          ))}
        </div>
      )}

      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={viewedTabs.size >= 2 ? 'is-done' : ''}>Xem ít nhất 2 phương pháp ({viewedTabs.size}/2) {viewedTabs.size >= 2 ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi kiểm tra {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div>
        <ChoiceCheck onResult={handleAnswered}
          question="Tại sao ¹³¹I được dùng cả để chẩn đoán lẫn điều trị bệnh tuyến giáp?"
          options={[
            'Vì tuyến giáp là bộ phận duy nhất hấp thụ được chất phóng xạ.',
            'Vì tuyến giáp chủ động hấp thụ iốt (để tổng hợp hormone), nên ¹³¹I tụ về đó – liều thấp để chụp ảnh, liều cao để phá hủy mô tuyến giáp bệnh.',
            'Vì iodine-131 phát tia alpha nên tập trung vào tuyến giáp.',
          ]}
          correctIndex={1}
          explanation="Tuyến giáp là cơ quan duy nhất hấp thụ iốt để tổng hợp thyroxine. ¹³¹I phát tia γ (ghi hình) và β⁻ (điều trị). Đây là ứng dụng y học hạt nhân phổ biến nhất tại Việt Nam."
        />
      </div>
      <Sources links={[{ label: 'Nuclear medicine – WHO', url: 'https://www.who.int/news-room/fact-sheets/detail/nuclear-medicine' }]} />
    </Lab>
  );
}

// ─── 4. Radiation Applications – Ứng dụng bức xạ trong đời sống ─────────────
type AppCategory = 'agriculture' | 'industry' | 'research';

const APPLICATIONS: Record<AppCategory, { title: string; icon: string; apps: { name: string; isotope: string; description: string; benefit: string; limitation: string }[] }> = {
  agriculture: {
    title: 'Nông nghiệp và bảo quản thực phẩm',
    icon: '🌾',
    apps: [
      { name: 'Chiếu xạ thực phẩm (Hình 24.5 SGK)', isotope: '⁶⁰Co (γ)', description: 'Vải thiều được chiếu xạ bằng tia γ → vi khuẩn bị tiêu diệt → bảo quản tươi lâu hơn.', benefit: 'Không cần hóa chất bảo quản, thực phẩm không nhiễm xạ', limitation: 'Chi phí thiết bị cao, người tiêu dùng còn ngần ngại' },
      { name: 'Nghiên cứu phân bón bằng ³²P', isotope: '³²P (β⁻)', description: 'Bón phân chứa ³²P vào cây → chụp ảnh phóng xạ → theo dõi đường đi phân bón → tối ưu hóa.', benefit: 'Hiểu chính xác cây hấp thụ dinh dưỡng', limitation: 'Phải thực hiện trong kiểm soát phóng xạ' },
      { name: 'Tạo giống đột biến', isotope: 'Chiếu xạ (γ, X)', description: 'Chiếu xạ hạt giống → tăng tần suất đột biến gene → chọn lọc biến thể tốt.', benefit: 'Nhanh hơn lai tạo truyền thống', limitation: 'Hầu hết đột biến có hại; cần sàng lọc lớn' },
    ],
  },
  industry: {
    title: 'Công nghiệp và kỹ thuật',
    icon: '🏭',
    apps: [
      { name: 'Chụp ảnh phóng xạ công nghiệp (RT)', isotope: '¹⁹²Ir, ⁶⁰Co (γ)', description: 'Chiếu tia γ qua mối hàn → phim cảm quang → phát hiện khuyết tật ẩn.', benefit: 'Phát hiện lỗi ẩn, không phá hủy vật kiểm tra', limitation: 'Nguồn phóng xạ cần quản lí nghiêm ngặt' },
      { name: 'Đo mức và lưu lượng', isotope: '¹³⁷Cs, ⁶⁰Co (γ)', description: 'Đặt nguồn γ và đầu thu hai bên bình chứa → đo cường độ → tính mức chất lỏng.', benefit: 'Không cần tiếp xúc vật lý', limitation: 'Cần cấp phép và quản lí nguồn' },
    ],
  },
  research: {
    title: 'Nghiên cứu khoa học',
    icon: '🔬',
    apps: [
      { name: 'Định tuổi bằng ¹⁴C', isotope: '¹⁴C (β⁻)', description: 'Đo tỉ lệ ¹⁴C/¹²C → tính tuổi theo định luật phóng xạ. Giới hạn: mẫu < 50.000 năm.', benefit: 'Xác định tuổi cổ vật và di tích', limitation: 'Chỉ cho vật liệu hữu cơ; sai số tăng với mẫu rất cổ' },
      { name: 'Theo dõi vết phóng xạ sinh học', isotope: '³H, ¹⁴C, ³²P', description: 'Gắn đồng vị phóng xạ vào phân tử sinh học → theo dõi đường đi, tốc độ chuyển hóa.', benefit: 'Hiểu cơ chế trao đổi chất ở mức phân tử', limitation: 'Cần thiết bị đặc biệt và kiểm soát an toàn' },
    ],
  },
};

export function RadiationApplications({ onProgress }: ActivityProps) {
  const [category, setCategory] = useState<AppCategory>('agriculture');
  const [viewedCategories, setViewedCategories] = useState<Set<AppCategory>>(new Set(['agriculture']));
  const [hasAnswered, setHasAnswered] = useState(false);
  const info = APPLICATIONS[category];

  const checkDone = useCallback((viewed: Set<AppCategory>, ans: boolean) => {
    onProgress?.(viewed.size >= 2 && ans);
  }, [onProgress]);

  function handleCategory(cat: AppCategory) {
    setCategory(cat);
    setViewedCategories(prev => {
      const next = new Set(prev);
      next.add(cat);
      checkDone(next, hasAnswered);
      return next;
    });
  }

  function handleAnswered(correct: boolean) {
    setHasAnswered(correct);
    checkDone(viewedCategories, correct);
  }

  return (
    <Lab
      intro="Ứng dụng đồng vị phóng xạ và bức xạ trong đời sống (SGK trang 117). Khám phá nông nghiệp, công nghiệp và nghiên cứu."
      note="Tất cả ứng dụng đều cần kiểm soát nghiêm ngặt. Tại Việt Nam, VARANS quản lí tất cả hoạt động liên quan đến phóng xạ."
    >
      <div className="physics-guide">
        <p><strong>🌍 Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Khám phá:</strong> Chuyển qua ít nhất 2 lĩnh vực ứng dụng.</li>
          <li><strong>Đánh giá:</strong> So sánh lợi ích và hạn chế của từng ứng dụng.</li>
          <li><strong>Giải thích:</strong> Vì sao chiếu xạ thực phẩm là an toàn?</li>
        </ol>
      </div>

      <div className="physics-controls">
        {(Object.keys(APPLICATIONS) as AppCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            className={`physics-button ${category === cat ? 'primary' : ''}`}
            onClick={() => handleCategory(cat)}
          >
            {APPLICATIONS[cat].icon} {APPLICATIONS[cat].title.split(' ')[0]} {viewedCategories.has(cat) ? '✓' : ''}
          </button>
        ))}
      </div>

      <h4 style={{ fontSize: '15px', fontWeight: 600, marginTop: '16px', marginBottom: '12px' }}>
        {info.icon} {info.title}
      </h4>

      {info.apps.map((app) => (
        <div key={app.name} style={{ padding: '14px', border: '1px solid var(--border-light)', borderRadius: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px', flexWrap: 'wrap' }}>
            <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{app.name}</p>
            <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '4px', whiteSpace: 'nowrap' }}>{app.isotope}</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.6 }}>{app.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ padding: '8px', backgroundColor: '#dcfce7', borderRadius: '4px', fontSize: '12px' }}>
              <strong>✓ Lợi ích:</strong> {app.benefit}
            </div>
            <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '4px', fontSize: '12px' }}>
              <strong>⚠ Hạn chế:</strong> {app.limitation}
            </div>
          </div>
        </div>
      ))}

      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={viewedCategories.size >= 2 ? 'is-done' : ''}>Xem ít nhất 2 lĩnh vực ({viewedCategories.size}/2) {viewedCategories.size >= 2 ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi kiểm tra {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div>
        <ChoiceCheck onResult={handleAnswered}
          question="Tại sao chiếu xạ thực phẩm bằng tia γ (Hình 24.5 SGK) KHÔNG làm thực phẩm trở nên phóng xạ?"
          options={[
            'Vì tia γ không thể xuyên vào bên trong thực phẩm.',
            'Vì tia γ là sóng điện từ – nó truyền năng lượng để phá DNA vi khuẩn, nhưng không để lại chất phóng xạ trong thực phẩm.',
            'Vì vi khuẩn trong thực phẩm hấp thụ hết phóng xạ.',
          ]}
          correctIndex={1}
          explanation="Chiếu xạ bằng tia γ không gây phóng xạ cảm ứng ở năng lượng cho phép (< 10 MeV). Tia γ chỉ ion hóa để phá hủy DNA vi khuẩn. Thực phẩm sau chiếu xạ an toàn, được WHO/FDA chấp thuận."
        />
      </div>
    </Lab>
  );
}
