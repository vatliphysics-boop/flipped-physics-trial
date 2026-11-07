"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { FISSION_DURATION, FISSION_ENERGY, FISSION_MASS_SOURCE, FISSION_STAGES, fissionConservation, fissionMotion, fissionState, neutronGenerations } from "@/lib/fission-model";
import { LatexMath } from "@/components/learning/LatexMath";
import { ChoiceCheck, NuclearSymbol } from "./shared";
const FissionScene = dynamic(() => import("./FissionScene"), { ssr: false, loading: () => <p role="status">Đang mở mô hình 3D…</p> });

const formatMass = (value: number, digits: number) => value.toFixed(digits).replace(".", "{,}");
const totals = fissionConservation();

function FissionSchematic({ time, incidentNeutron }: { time: number; incidentNeutron: boolean }) {
  const state = fissionMotion(time, incidentNeutron);
  const center = 320;
  return <svg viewBox="0 0 640 230" width="100%" role="img" aria-label={incidentNeutron ? FISSION_STAGES[state.stage].title : "Hạt nhân U-235, không có neutron tới"}>
    <path d="M64 100H576" stroke="#426984" strokeDasharray="6 9" />
    {state.stage < 3 ? <>
      <ellipse cx={center} cy="100" rx={42 * state.stretchX} ry={42 * state.stretchY} fill="#d46562" />
      <text x={center} y="106" textAnchor="middle" fill="#101f32" fontSize="21" fontWeight="700">{state.stage === 0 ? "U-235" : "U-236*"}</text>
      {state.incidentNeutron && state.stage === 0 && <circle cx={center + 51 * state.incomingX} cy="100" r="9" fill="#72c8f4" />}
    </> : <>
      {state.fragmentOffsets.map((offset, index) => <g key={index}>
        <circle cx={center + offset * 48} cy="100" r={index === 0 ? 29 : 37} fill="#d46562" />
        <text x={center + offset * 48} y="106" textAnchor="middle" fill="#101f32" fontSize="19" fontWeight="700">{index === 0 ? "Y-95" : "I-138"}</text>
      </g>)}
      {state.neutronPositions.map(([x, y], index) => <circle key={index} cx={center + 52 * x} cy={100 - 25 * y} r="7" fill="#72c8f4" />)}
    </>}
    <text x={center} y="206" textAnchor="middle" fill="#d3e7f7" fontSize="17">Sơ đồ 2D · Mỗi đĩa đỏ là một hạt nhân</text>
  </svg>;
}

export function GuidedFissionLab({ onProgress }: { onProgress?: (done: boolean) => void }) {
  const [started, setStarted] = useState(false), [running, setRunning] = useState(false), [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1), [view, setView] = useState("perspective"), [error, setError] = useState("");
  const [observed, setObserved] = useState(false), [answered, setAnswered] = useState(false), [count, setCount] = useState("");
  const [k, setK] = useState(1), [trials, setTrials] = useState<number[]>([]);
  const [revision, setRevision] = useState(0);
  const [ready, setReady] = useState(false);
  const [incidentNeutron, setIncidentNeutron] = useState(true);
  const container = useRef<HTMLElement>(null);
  const clock = useRef(0), state = fissionState(time, incidentNeutron);
  const errorCallback = useCallback((message: string) => { setError(message); setReady(true); }, []);
  const readyCallback = useCallback(() => setReady(true), []);
  useEffect(() => { onProgress?.(observed && answered && count === "3" && trials.includes(0.6) && trials.includes(1) && trials.includes(1.4)); }, [observed, answered, count, trials, onProgress]);
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
    if (!running || !ready || !incidentNeutron) return;
    let previous = performance.now(), frame = 0, lastPaint = 0;
    function advance(now: number) {
      clock.current = Math.min(FISSION_DURATION, clock.current + Math.min((now - previous) / 1000, 0.1) * speed); previous = now;
      if (now - lastPaint > 40 || clock.current >= FISSION_DURATION) { setTime(clock.current); lastPaint = now; }
      if (clock.current >= 5) setObserved(true);
      if (clock.current >= FISSION_DURATION) { setRunning(false); return; }
      frame = requestAnimationFrame(advance);
    }
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [running, speed, ready, incidentNeutron]);
  function seek(value: number) { const next = fissionState(value, incidentNeutron).time; clock.current = next; setTime(next); setRunning(false); if (next >= 5 && ready) setObserved(true); }
  function reset() { clock.current = 0; setTime(0); setRunning(false); setObserved(false); setAnswered(false); setCount(""); setTrials([]); setRevision(v => v + 1); onProgress?.(false); }
  return <section ref={container} className="guided-fission" aria-label="Mô phỏng phân hạch">
    <div className="visual-caption"><div><span className="visual-eyebrow">B22 · Phản ứng hạt nhân</span><h3>Mô phỏng phân hạch U-235</h3><p>Dự đoán số neutron sinh ra, nhấn bắt đầu rồi xoay mô hình để kiểm tra.</p></div></div>
    <label className="physics-field">Điều kiện ban đầu
      <select value={incidentNeutron ? "neutron" : "none"} onChange={event => { seek(0); setIncidentNeutron(event.target.value === "neutron"); }}>
        <option value="neutron">Có neutron tới</option><option value="none">Không có neutron tới</option>
      </select>
    </label>
    <div className="fission-stage">
      {!started ? <div className="fission-ready"><span className="fission-ready-symbol">{incidentNeutron && <><NuclearSymbol a={1} z={0} symbol="n" /> + </>}<NuclearSymbol a={235} z={92} symbol="U" /></span><p>Quan sát điều kiện ban đầu rồi theo dõi diễn biến.<br/>Mỗi quả cầu trong hình 3D biểu diễn một nucleon.</p><button className="btn primary" onClick={() => { setStarted(true); setRunning(incidentNeutron); }}>Bắt đầu thí nghiệm 3D</button></div> : error ? <FissionSchematic time={time} incidentNeutron={incidentNeutron} /> : <FissionScene time={time} incidentNeutron={incidentNeutron} view={view} onError={errorCallback} onReady={readyCallback} />}
      <div className="fission-legend"><span><i className="proton-dot" /> Proton</span><span><i className="neutron-dot" /> Neutron</span><span>Màu, kích thước và thời gian quy ước</span></div>
    </div>
    <p className="physics-note fission-live-counts" role="status">{!incidentNeutron ? "U-235 (92p, 143n) đứng riêng trong trường hợp đối chiếu. Không có phân hạch do neutron tới trong lượt này." : state.stage === 0 ? "Trước phản ứng: U-235 (92p, 143n) + 1 neutron tới." : state.stage < 3 ? "Hạt nhân kích thích: U-236* (92p, 144n)." : "Sau phản ứng: Y-95 (39p, 56n) + I-138 (53p, 85n) + 3 neutron tự do."}</p>
    {error && <p role="alert">{error} Sơ đồ 2D phía trên dùng cùng diễn tiến. <a href="/illustrations/B22-diagram.svg" target="_blank" rel="noreferrer">Mở hình phân hạch ↗</a></p>}
    <div className="experiment-controls">
      <button className="btn primary" disabled={!ready || !incidentNeutron || state.finished} onClick={() => setRunning(v => !v)}>{state.finished ? "Đã kết thúc lượt" : running ? "Tạm dừng" : "Tiếp tục"}</button>
      <button className="btn" onClick={reset}>Đặt lại thí nghiệm</button>
      <label>Tốc độ <select value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value={0.5}>Chậm · 0,5×</option><option value={1}>1×</option><option value={2}>2×</option></select></label>
    </div>
    <div className="fission-steps" aria-label="Các bước phân hạch">{FISSION_STAGES.map((step, i) => <button key={step.title} disabled={!started || !incidentNeutron} className={incidentNeutron && state.stage === i ? "is-active" : ""} aria-pressed={incidentNeutron && state.stage === i} onClick={() => seek(step.time)}><span>0{i + 1}</span>{step.title}</button>)}</div>
    <label className="physics-field">Xem lại thời điểm · {time.toLocaleString("vi", { maximumFractionDigits: 1 })} trên {FISSION_DURATION} giây mô hình<input type="range" aria-label="Thời điểm phân hạch" min={0} max={FISSION_DURATION} step={0.05} value={time} disabled={!started || !incidentNeutron} onChange={e => seek(Number(e.target.value))}/></label>
    {incidentNeutron && <p className="fission-observation" role="status"><strong>{FISSION_STAGES[state.stage].title}. </strong>{FISSION_STAGES[state.stage].text}</p>}
    {!error && <div className="experiment-views" aria-label="Góc nhìn phân hạch">{[["perspective", "Phối cảnh"], ["front", "Phía trước"], ["top", "Từ trên"], ["side", "Bên cạnh"]].map(([value, title]) => <button key={value} disabled={!started} className={`btn small ${view === value ? "primary" : ""}`} aria-pressed={view === value} onClick={() => setView(value)}>{title}</button>)}</div>}
    <p className="physics-note">{!error && "Kéo ngang hoặc dùng các nút góc nhìn để xoay. Cuộn trên mô hình bằng chuột để thu phóng. "}Mô hình dừng sau một lượt.</p>
    {incidentNeutron && <>
    <div className="fission-equation" aria-label="Phương trình phân hạch"><span className={state.stage === 0 ? "is-current" : ""}><NuclearSymbol a={1} z={0} symbol="n"/> + <NuclearSymbol a={235} z={92} symbol="U"/></span><span>→</span><span className={state.stage === 1 || state.stage === 2 ? "is-current" : ""}><NuclearSymbol a={236} z={92} symbol="U*"/></span><span>→</span><span className={state.stage === 3 ? "is-current" : ""}><NuclearSymbol a={95} z={39} symbol="Y"/> + <NuclearSymbol a={138} z={53} symbol="I"/> + 3<NuclearSymbol a={1} z={0} symbol="n"/></span></div>
    <div className="fission-conservation"><div><small>Bảo toàn số khối</small><strong>235 + 1 = 95 + 138 + 3 = 236</strong></div><div><small>Bảo toàn điện tích</small><strong>92 + 0 = 39 + 53 + 0 = 92</strong></div></div>
    <p className="physics-note">Đây là một kênh minh họa trong SGK. Các kênh khác có thể tạo sản phẩm khác. Vị trí các quả cầu và quỹ đạo chỉ là quy ước để theo dõi diễn biến.</p>
    <details className="fission-chain">
      <summary>Tính năng lượng tỏa ra của kênh Y-95 và I-138</summary>
      <p>So sánh tổng khối lượng nghỉ của hệ trước phản ứng và các sản phẩm ở trạng thái cơ bản. Tổng điện tích hai vế đều bằng {totals.inputZ} điện tích nguyên tố nên có thể dùng bảng khối lượng nguyên tử trung hòa cho phép tính gần đúng.</p>
      <LatexMath block math={String.raw`m_{\text{trước}}\approx ${formatMass(FISSION_ENERGY.beforeMassU, 6)}\,\mathrm{u}`} />
      <LatexMath block math={String.raw`m_{\text{sau}}\approx ${formatMass(FISSION_ENERGY.afterMassU, 6)}\,\mathrm{u}`} />
      <LatexMath block math={String.raw`Q=(m_{\text{trước}}-m_{\text{sau}})c^2\approx ${formatMass(FISSION_ENERGY.qMeV, 1)}\,\mathrm{MeV}`} />
      <p>Đây là năng lượng ứng với chênh lệch khối lượng của kênh đã chọn. Mô hình không chia giá trị này cho từng mảnh, neutron và photon. <a href={FISSION_MASS_SOURCE} target="_blank" rel="noreferrer">Bảng khối lượng AME2020 ↗</a></p>
    </details>
    </>}
    <label className="physics-field">Em quan sát thấy bao nhiêu neutron tự do sau phản ứng?<input type="number" min={0} max={10} value={count} onChange={e => setCount(e.target.value)} placeholder="Nhập số neutron"/></label>
    {count !== "" && <p role="status" className="physics-feedback">{count === "3" ? "Đúng: 3 neutron. Tổng số neutron ở sản phẩm là 56 + 85 + 3 = 144." : "Hãy dừng ở bước 4, phân biệt neutron tự do với neutron bên trong hai mảnh."}</p>}
    <details className="fission-chain"><summary>Neutron sinh ra có thể tạo phản ứng dây chuyền như thế nào?</summary><p>Chọn cả ba điều kiện và đối chiếu số phản ứng kì vọng theo thế hệ. k ở đây là hệ số nhân hiệu dụng; khác số neutron sinh ra trong một phân hạch.</p><div className="experiment-controls">{[0.6, 1, 1.4].map(value => <button key={value} className={`btn ${k === value ? "primary" : ""}`} aria-pressed={k === value} onClick={() => { setK(value); setTrials(v => v.includes(value) ? v : [...v, value]); }}>k = {value.toLocaleString("vi")}{trials.includes(value) ? " ✓" : ""}</button>)}</div><div className="chain-bars">{neutronGenerations(k).map(({ generation, expected }) => <div key={generation}><span>Thế hệ {generation}</span><div><i style={{ width: `${Math.max(2, expected / Math.pow(1.4, 5) * 100)}%` }}/></div><b>{expected.toFixed(2)}</b></div>)}</div><p role="status">{k < 1 ? "k < 1: phản ứng giảm theo thế hệ." : k === 1 ? "k = 1: phản ứng duy trì trong mô hình." : "k > 1: phản ứng tăng theo thế hệ."} Đây là mô hình k không đổi; riêng k &gt; 1 không đủ để kết luận có vụ nổ.</p></details>
    <ChoiceCheck key={revision} question="Vì sao một số neutron sinh ra không gây phân hạch tiếp theo?" options={["Mọi neutron đều bắt buộc gây phân hạch ngay.", "Neutron có thể thoát ra hoặc bị hấp thụ mà không gây phân hạch.", "Neutron biến thành electron ngay sau phản ứng."]} correctIndex={1} explanation="Phản ứng tiếp theo phụ thuộc neutron gặp hạt nhân phù hợp và không bị mất do thoát ra/hấp thụ. Số neutron sinh ra khác số neutron thực sự duy trì dây chuyền." onResult={setAnswered}/>
    <p className="physics-note" role="status">Hoàn thành khi đã quan sát bước 4, đếm đúng neutron, thử cả ba giá trị k và trả lời đúng câu giải thích.{observed && answered && count === "3" && trials.length === 3 ? " ✓ Đã đạt các tiêu chí." : ""}</p>
  </section>;
}
