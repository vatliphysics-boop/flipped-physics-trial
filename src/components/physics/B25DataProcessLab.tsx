"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { activityAt, B25_COMPARISON, halfActivityBracket, SGK_TABLE_25_1 } from "@/lib/sgk-b25-decay";
import { LatexMath } from "@/components/learning/LatexMath";
import { ChoiceCheck } from "./shared";
import { useProcessClock } from "./useProcessClock";
import styles from "./ProcessLab.module.css";

const layouts = [
  { name: "compact", width: 280, left: 50, right: 254, top: 20, bottom: 215, height: 260, fontSize: 22, ticks: [0, 120, 240, 360] },
  { name: "wide", width: 720, left: 65, right: 675, top: 35, bottom: 285, height: 330, fontSize: 20, ticks: [0, 60, 120, 180, 240, 300, 360] },
] as const;
const curve = (period: number) => Array.from({ length: 121 }, (_, i) => ({ time: i * 3, activity: activityAt(i * 3, period) }));
const equation = <LatexMath block math={String.raw`H_{\text{lí thuyết}}(t)=151\,2^{-\frac{t}{T}}\;\mathrm{Bq}`} />;

export function B25DataProcessLab({ onSubDone }: { onSubDone?: (done: boolean) => void }) {
  const [halfLife, setHalfLife] = useState<number>(B25_COMPARISON.halfLifeA);
  const [compare, setCompare] = useState(false);
  const [showFit, setShowFit] = useState(false);
  const [answered, setAnswered] = useState(false);
  const lastProgress = useRef(false);
  const container = useRef<HTMLDivElement>(null);
  const clipId = useId();
  const clock = useProcessClock(360, 30, container);
  const bracket = halfActivityBracket();
  const t = clock.time;
  const selected = SGK_TABLE_25_1.find(row => Math.abs(row.t - t) < .05);
  const comparisonHalfLife = halfLife === B25_COMPARISON.halfLifeB ? B25_COMPARISON.halfLifeA : B25_COMPARISON.halfLifeB;
  const fitPoints = useMemo(() => curve(halfLife), [halfLife]);
  const comparisonPoints = useMemo(() => curve(comparisonHalfLife), [comparisonHalfLife]);
  const complete = showFit && answered;
  useEffect(() => {
    if (lastProgress.current === complete) return;
    lastProgress.current = complete;
    onSubDone?.(complete);
  }, [complete, onSubDone]);

  function changeHalfLife(next: number) {
    setHalfLife(next);
    setAnswered(false);
    lastProgress.current = false;
    onSubDone?.(false);
  }

  return <div ref={container} className={styles.lab} data-process="B25" data-process-ready={clock.ready}>
    <h3>Đối chiếu dự đoán với Bảng 25.1</h3>
    <p className={styles.prompt}><strong>Dự đoán:</strong> chu kì 40 hay 60 giây gần số liệu hơn tại 30 giây? Chọn chu kì, hiện đường lí thuyết, chạy con trỏ rồi bấm một mốc trong bảng để đọc sai khác.</p>
    <div className={styles.controls}>
      <label>T giả thuyết: {halfLife} s<input aria-label="T ước lượng của em" type="range" disabled={!clock.ready} min="10" max="120" step="2" value={halfLife} onChange={e => changeHalfLife(+e.target.value)} /></label>
      <label>Thời điểm đối chiếu: {t.toFixed(1)} s<input aria-label="Thời điểm đối chiếu" type="range" disabled={!clock.ready} min="0" max="360" value={t} onChange={e => clock.seek(+e.target.value)} /></label>
    </div>
    <div className={styles.controls}>
      <button type="button" className={styles.primary} disabled={!clock.ready} onClick={clock.toggle}>{clock.running ? "Tạm dừng" : t > 0 && t < 360 ? "Tiếp tục" : "Bắt đầu"}</button>
      <button type="button" disabled={!clock.ready} onClick={clock.reset}>Đặt lại</button>
      <button type="button" disabled={!clock.ready} onClick={() => clock.step(30)}>Từng bước 30 s</button>
      <button type="button" disabled={!clock.ready} aria-pressed={showFit} onClick={() => setShowFit(v => !v)}>{showFit ? "Ẩn đường lí thuyết" : "Hiện đường lí thuyết"}</button>
      <button type="button" disabled={!clock.ready} aria-pressed={showFit && compare} onClick={() => { setCompare(v => !showFit || !v); setShowFit(true); }}>So sánh thêm T = {comparisonHalfLife} s</button>
      <label>Tốc độ đọc đồ thị<select aria-label="Tốc độ đọc đồ thị" value={clock.speed} disabled={!clock.ready} onChange={e => clock.setSpeed(+e.target.value)}><option value="0.5">15 giây dữ liệu / giây xem</option><option value="1">30 giây dữ liệu / giây xem</option><option value="2">60 giây dữ liệu / giây xem</option></select></label>
    </div>
    <figure className={`${styles.figure} ${styles.responsiveVisual} ${styles.visualPanel}`}>
      <p className={styles.chartTitle}>Độ phóng xạ H (Bq)</p>
      {layouts.map(layout => {
        const x = (seconds: number) => layout.left + seconds / 360 * (layout.right - layout.left);
        const y = (activity: number) => layout.bottom - activity / 160 * (layout.bottom - layout.top);
        const id = `${clipId}-${layout.name}`;
        return <svg key={layout.name} className={layout.name === "compact" ? styles.compactSvg : styles.wideSvg}
          viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-label={`Bảng 25.1 giữ nguyên tám điểm. Con trỏ tại ${t.toFixed(1)} giây.${showFit ? ` Đường lí thuyết T bằng ${halfLife} giây.` : ""}${showFit && compare ? ` Đường đối chiếu T bằng ${comparisonHalfLife} giây.` : ""}`}>
          <title>Số liệu SGK và đường hàm mũ độc lập</title>
          <defs><clipPath id={id}><rect x={x(0)} y={layout.top - 5} width={x(t) - x(0)} height={layout.bottom - layout.top + 7} /></clipPath></defs>
          {[0, 40, 80, 120, 160].map(v => <g key={v}>
            <path d={`M${layout.left} ${y(v)}H${layout.right}`} stroke="#294555" />
            <text x={layout.left - 10} y={y(v) + 6} textAnchor="end" fill="#d3e4ed" fontSize={layout.fontSize}>{v}</text>
          </g>)}
          {layout.ticks.map(v => <text key={v} x={x(v)} y={layout.bottom + 28} textAnchor="middle" fill="#d3e4ed" fontSize={layout.fontSize}>{v}</text>)}
          <rect x={x(bracket.fromSeconds)} y={layout.top} width={x(bracket.toSeconds) - x(bracket.fromSeconds)} height={layout.bottom - layout.top} fill="#ffcb71" opacity=".09" />
          <path d={`M${layout.left} ${y(bracket.halfActivityBq)}H${layout.right}`} stroke="#ffcb71" strokeDasharray="5 5" />
          {showFit && <g clipPath={`url(#${id})`}>
            <polyline points={fitPoints.map(p => `${x(p.time)},${y(p.activity)}`).join(" ")} fill="none" stroke="#5ae5c1" strokeWidth="3" />
            {compare && <polyline points={comparisonPoints.map(p => `${x(p.time)},${y(p.activity)}`).join(" ")} fill="none" stroke="#ceacff" strokeWidth="3" strokeDasharray="6 4" />}
          </g>}
          {SGK_TABLE_25_1.map(row => <circle key={row.t} cx={x(row.t)} cy={y(row.h)} r={layout.name === "compact" ? 4 : 6} fill={row.t <= t ? "#ffcb71" : "#506a7a"} stroke="#e6f1f7" strokeWidth="1" />)}
          <path d={`M${x(t)} ${layout.top - 5}V${layout.bottom}`} stroke="#f1f9ff" opacity=".8" />
        </svg>;
      })}
      <p className={styles.axisCaption}>Thời gian t (s)</p>
      <div className={styles.visualLegend}>
        <span><i style={{ background: "transparent", borderTop: "2px dashed #ffcb71", height: 0 }} aria-hidden="true" />Mức nửa ban đầu · 75,5 Bq</span>
        <span><i style={{ background: "#ffcb71" }} aria-hidden="true" />Chấm · tám giá trị Bảng 25.1</span>
        {showFit && <span><i style={{ background: "#5ae5c1" }} aria-hidden="true" />Nét liền · T = {halfLife} s</span>}
        {showFit && compare && <span><i style={{ background: "transparent", borderTop: "3px dashed #ceacff", height: 0 }} aria-hidden="true" />Nét đứt · T = {comparisonHalfLife} s</span>}
      </div>
      <figcaption className={styles.chartCaption}>Chạy con trỏ giúp đọc đồ thị; số liệu đo giữ nguyên.</figcaption>
    </figure>
    <dl className={styles.metrics}>
      <div><dt>Thời điểm</dt><dd data-time>{t.toFixed(1)} s</dd></div>
      <div><dt>Giá trị lí thuyết</dt><dd data-theory>{activityAt(t, halfLife).toFixed(2)} Bq</dd></div>
      <div><dt>Giá trị từ bảng tại mốc chọn</dt><dd>{selected ? `${selected.h} Bq` : "Không có phép đo ở mốc này"}</dd></div>
      <div><dt>Lí thuyết trừ giá trị trong bảng</dt><dd>{selected ? `${(activityAt(t, halfLife) - selected.h).toFixed(2)} Bq` : "Chọn mốc có trong bảng"}</dd></div>
    </dl>
    {equation}
    <div className={styles.table}><table><caption>Bảng 25.1 · SGK mẫu KNTT 01/2024, trang in 121</caption><thead><tr><th>t (s), bấm để đối chiếu</th><th>H trong bảng (Bq)</th><th>H lí thuyết (Bq)</th></tr></thead><tbody>{SGK_TABLE_25_1.map(row => <tr key={row.t}><td><button type="button" disabled={!clock.ready} onClick={() => clock.seek(row.t)} aria-label={`Đối chiếu tại ${row.t} giây`}>{row.t}</button></td><td>{row.h}</td><td>{showFit ? activityAt(row.t, halfLife).toFixed(2) : "—"}</td></tr>)}</tbody></table></div>
    <p className={styles.note}>Mức 75,5 Bq nằm giữa 85 và 55 Bq tại 30 và 60 giây. Nội suy thẳng hai mốc cho khoảng 39,5 giây, là ước lượng thô; không chứng minh cả tám điểm nằm trên một hàm mũ chính xác. Đường lí thuyết giả định một loại hạt nhân, chu kì không đổi và không có nền đo. Dữ liệu SGK được giữ riêng, không thay bằng số sinh ngẫu nhiên.</p>
    <ChoiceCheck key={halfLife} question="Với T = 40 s, đường lí thuyết cho gần 90 Bq tại 30 s, còn bảng ghi 85 Bq. Nên giải thích thế nào?" options={["Sửa bảng thành 90 Bq để khớp đường cong.", "Cần xem xét tính ngẫu nhiên, sai số đo và giới hạn của mô hình; một điểm chưa đủ kết luận nguyên nhân.", "Chu kì bán rã chắc chắn tăng theo thời gian."]} correctIndex={1} explanation="Giữ nguyên số liệu nguồn, so sánh nhiều mốc và nêu giả thiết. Đây là đối chiếu dữ liệu và mô hình, không phải một phép đo mới." onResult={setAnswered} />
  </div>;
}
