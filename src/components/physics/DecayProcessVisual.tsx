import { useMemo } from "react";
import { decaySeries, decayState, type DecaySample } from "@/lib/radioactive-decay-model";
import styles from "./ProcessLab.module.css";

const layouts = [
  { name: "compact", width: 280, left: 50, right: 254, top: 20, bottom: 210, height: 250, fontSize: 22 },
  { name: "wide", width: 720, left: 62, right: 668, top: 30, bottom: 290, height: 335, fontSize: 20 },
] as const;

/** Pure view: the website and a frame renderer may pass the same sample/time. */
export function DecayProcessVisual({ sample, time, duration = 60 }: { sample: DecaySample; time: number; duration?: number }) {
  const state = decayState(sample, time);
  const expected = useMemo(() => decaySeries(sample, duration, duration / 120), [sample, duration]);
  const orderedLifetimes = useMemo(() => [...sample.lifetimes].sort((a, b) => a - b), [sample.lifetimes]);
  const countedBins = useMemo(() => Array.from({ length: Math.ceil(time) }, (_, i) => {
    const end = Math.min(i + 1, time);
    return decayState(sample, end, end - i).detections;
  }), [sample, time]);
  const countMaximum = Math.max(Math.ceil(sample.initialCount / 3), ...countedBins);
  const columns = Math.ceil(Math.sqrt(sample.initialCount * 1.5));
  const rows = Math.ceil(sample.initialCount / columns);
  return <div className={styles.responsiveVisual}>
    <figure className={styles.visualPanel}>
      <p className={styles.chartTitle}>Mỗi chấm là một hạt nhân ban đầu</p>
      {layouts.map(layout => {
        const spacing = Math.min(29, (layout.width - 44) / columns, 230 / rows);
        const height = Math.max(65, 35 + rows * spacing);
        return <svg key={layout.name} className={layout.name === "compact" ? styles.compactSvg : styles.wideSvg}
          viewBox={`0 0 ${layout.width} ${height}`} role="img" aria-label={`Lượt seed ${sample.seed}: ${state.remaining} hạt chưa phân rã và ${state.decayed} hạt đã phân rã tại ${time.toFixed(1)} giây.`}>
          <title>Các hạt nhân trong mẫu giả định</title>
          {sample.lifetimes.map((lifetime, i) => {
            const decayed = lifetime <= time, recent = decayed && lifetime > time - 1;
            return <circle key={i} cx={22 + i % columns * spacing} cy={18 + Math.floor(i / columns) * spacing}
              r={Math.max(3, spacing * 0.3)} fill={decayed ? "#5c7181" : "#5ae5c1"} stroke={recent ? "#ffcb71" : "none"} strokeWidth="2" />;
          })}
        </svg>;
      })}
      <figcaption className={styles.visualLegend}>
        <span><i style={{ background: "#5ae5c1" }} aria-hidden="true" />Chưa phân rã</span>
        <span><i style={{ background: "#5c7181" }} aria-hidden="true" />Đã phân rã</span>
        <span><i style={{ background: "transparent", border: "2px solid #ffcb71" }} aria-hidden="true" />Viền vàng · ghi nhận trong 1 giây vừa qua</span>
      </figcaption>
    </figure>
    <figure className={styles.visualPanel}>
      <p className={styles.chartTitle}>Số hạt nhân chưa phân rã</p>
      {layouts.map(layout => {
        const x = (t: number) => layout.left + (layout.right - layout.left) * t / duration;
        const y = (n: number) => layout.bottom - (layout.bottom - layout.top) * n / sample.initialCount;
        let population = sample.initialCount;
        let path = `M${x(0)},${y(population)}`;
        for (const lifetime of orderedLifetimes) {
          if (lifetime > time) break;
          path += `H${x(lifetime)}V${y(--population)}`;
        }
        path += `H${x(time)}`;
        const xTicks = layout.name === "compact" ? [0, duration / 2, duration] : [0, duration / 4, duration / 2, 3 * duration / 4, duration];
        return <svg key={layout.name} className={layout.name === "compact" ? styles.compactSvg : styles.wideSvg}
          viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-label={`Đồ thị số hạt theo thời gian. Lượt ngẫu nhiên ${state.remaining}; giá trị kì vọng ${state.expected.toFixed(1)}.`}>
          <title>Lượt ngẫu nhiên và quy luật kì vọng</title>
          {[0, .25, .5, .75, 1].map(f => <g key={f} fill="#c6d9e3" fontSize={layout.fontSize}>
            <path d={`M${layout.left} ${y(f * sample.initialCount)}H${layout.right}`} stroke="#274455" />
            <text x={layout.left - 10} y={y(f * sample.initialCount) + 6} textAnchor="end">{Math.round(f * sample.initialCount)}</text>
          </g>)}
          {xTicks.map(t => <text key={t} x={x(t)} y={layout.bottom + 28} textAnchor="middle" fill="#c6d9e3" fontSize={layout.fontSize}>{t}</text>)}
          <polyline points={expected.map(p => `${x(p.timeSeconds)},${y(p.expected)}`).join(" ")} fill="none" stroke="#7eb9ff" strokeWidth="3" strokeDasharray="7 5" />
          <path d={path} fill="none" stroke="#5ae5c1" strokeWidth="3" />
          <path d={`M${x(time)} ${layout.top}V${layout.bottom}`} stroke="#ffcb71" strokeWidth="2" />
          <circle cx={x(time)} cy={y(state.remaining)} r="4" fill="#5ae5c1" />
        </svg>;
      })}
      <p className={styles.axisCaption}>Thời gian t (s)</p>
      <figcaption className={styles.visualLegend}>
        <span><i style={{ background: "#5ae5c1" }} aria-hidden="true" />Nét bậc · lượt chạy</span>
        <span><i style={{ background: "transparent", borderTop: "3px dashed #7eb9ff", height: 0 }} aria-hidden="true" />Nét đứt · kì vọng</span>
      </figcaption>
    </figure>
    <figure className={styles.visualPanel}>
      <p className={styles.chartTitle}>Số đếm trong từng khoảng 1 s</p>
      {layouts.map(layout => {
        const x = (t: number) => layout.left + (layout.right - layout.left) * t / duration;
        const top = 20, bottom = layout.name === "compact" ? 140 : 175;
        const maximum = countMaximum;
        return <svg key={layout.name} className={layout.name === "compact" ? styles.compactSvg : styles.wideSvg}
          viewBox={`0 0 ${layout.width} ${bottom + 42}`} role="img" aria-label="Số phân rã máy ghi nhận lí tưởng trong từng khoảng một giây">
          <title>Đếm theo từng khoảng đo một giây</title>
          <path d={`M${layout.left} ${top}V${bottom}H${layout.right}`} fill="none" stroke="#b5cbd7" />
          {countedBins.map((count, i) => {
            const height = (bottom - top) * count / maximum;
            return <rect key={i} x={x(i) + 1} y={bottom - height} width={Math.max(1, (layout.right - layout.left) / duration - 2)} height={height} fill="#ffcb71" />;
          })}
          <text x={layout.left - 10} y={bottom + 6} textAnchor="end" fill="#d3e4ed" fontSize={layout.fontSize}>0</text>
          <text x={layout.left - 10} y={top + 6} textAnchor="end" fill="#d3e4ed" fontSize={layout.fontSize}>{maximum}</text>
          {[0, duration / 2, duration].map(t => <text key={t} x={x(t)} y={bottom + 28} textAnchor="middle" fill="#d3e4ed" fontSize={layout.fontSize}>{t}</text>)}
        </svg>;
      })}
      <p className={styles.axisCaption}>Thời gian t (s)</p>
      <figcaption className={styles.chartCaption}>Cột cuối có thể chưa đủ 1 s.</figcaption>
    </figure>
  </div>;
}
