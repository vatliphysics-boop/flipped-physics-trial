"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createDecaySample, decayState, decayProcessCSV, DECAY_COMPARISON, type DecayParameters } from "@/lib/radioactive-decay-model";
import { LatexMath } from "@/components/learning/LatexMath";
import { ChoiceCheck } from "./shared";
import { DecayProcessVisual } from "./DecayProcessVisual";
import { useProcessClock } from "./useProcessClock";
import styles from "./ProcessLab.module.css";

const decayEquations = <>
  <LatexMath block math={String.raw`\lambda=\frac{\ln 2}{T},\quad \mathbb{E}[N(t)]=N_0\,2^{-\frac{t}{T}}`} />
  <LatexMath block math={String.raw`\mathbb{E}[H(t)]=\lambda\,\mathbb{E}[N(t)]`} />
</>;

export function DecayProcessLab({ onProgress }: { onProgress?: (done: boolean) => void }) {
  const [parameters, setParameters] = useState<DecayParameters>({ ...DECAY_COMPARISON.a });
  const [comparison, setComparison] = useState<DecayParameters | null>(null);
  const [changedCondition, setChangedCondition] = useState(false);
  const [answered, setAnswered] = useState(false);
  const lastProgress = useRef(false);
  const sample = useMemo(() => createDecaySample(parameters), [parameters]);
  const other = useMemo(() => comparison ? createDecaySample(comparison) : null, [comparison]);
  const container = useRef<HTMLDivElement>(null);
  const clock = useProcessClock(60, 4, container);
  const state = decayState(sample, clock.time);
  const alternate = other ? decayState(other, clock.time) : null;
  const complete = changedCondition && clock.time >= 1 && answered;
  useEffect(() => {
    if (lastProgress.current === complete) return;
    lastProgress.current = complete;
    onProgress?.(complete);
  }, [complete, onProgress]);

  const change = (next: Partial<DecayParameters>) => {
    if ((next.initialCount !== undefined && next.initialCount !== parameters.initialCount) ||
        (next.halfLifeSeconds !== undefined && next.halfLifeSeconds !== parameters.halfLifeSeconds)) setChangedCondition(true);
    setParameters(value => ({ ...value, ...next }));
    setAnswered(false);
    clock.reset();
  };
  return <div ref={container} className={styles.lab} data-process="B23" data-process-ready={clock.ready}>
    <h3>Phân rã: từng hạt ngẫu nhiên, cả mẫu có quy luật</h3>
    <p className={styles.prompt}><strong>Dự đoán:</strong> sau một chu kì, liệu mọi lượt đều còn đúng một nửa số hạt? Chọn điều kiện, chạy và lưu một cấu hình để so sánh ở cùng thời điểm.</p>
    <div className={styles.controls}>
      <label>Số hạt ban đầu N₀: {parameters.initialCount} hạt<input aria-label="Số hạt ban đầu N₀" type="range" disabled={!clock.ready} min="32" max="256" step="32" value={parameters.initialCount} onChange={e => change({ initialCount: +e.target.value })} /></label>
      <label>Chu kì bán rã T: {parameters.halfLifeSeconds} s<input aria-label="Chu kì bán rã T" type="range" disabled={!clock.ready} min="5" max="60" value={parameters.halfLifeSeconds} onChange={e => change({ halfLifeSeconds: +e.target.value })} /></label>
      <label>Seed để lặp lại cùng lượt<input aria-label="Seed phân rã" type="number" disabled={!clock.ready} min="0" max="999999" value={parameters.seed} onChange={e => { const seed = e.target.valueAsNumber; if (Number.isInteger(seed) && seed >= 0 && seed <= 999999) change({ seed }); }} /></label>
    </div>
    <div className={styles.controls}>
      <button type="button" className={styles.primary} disabled={!clock.ready} onClick={clock.toggle}>{clock.running ? "Tạm dừng" : clock.time > 0 && clock.time < 60 ? "Tiếp tục" : "Bắt đầu"}</button>
      <button type="button" disabled={!clock.ready} onClick={clock.reset}>Đặt lại</button>
      <button type="button" disabled={!clock.ready} onClick={() => clock.step(1)}>Từng bước 1 s</button>
      <button type="button" disabled={!clock.ready} onClick={() => change({ seed: (parameters.seed + 1) % 1000000 })}>Lượt ngẫu nhiên mới</button>
      <button type="button" disabled={!clock.ready} onClick={() => setComparison({ ...parameters })}>Lưu điều kiện để so sánh</button>
      <button type="button" disabled={!clock.ready} onClick={() => {
        const url = URL.createObjectURL(new Blob([decayProcessCSV(sample)], { type: "text/csv;charset=utf-8" }));
        const link = document.createElement("a"); link.href = url; link.download = `phan-ra-seed-${sample.seed}.csv`; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }}>Tải dữ liệu CSV</button>
      <label>Tốc độ trình chiếu<select aria-label="Tốc độ phân rã" value={clock.speed} disabled={!clock.ready} onChange={e => clock.setSpeed(+e.target.value)}><option value="0.25">1 giây mô hình / giây xem</option><option value="1">4 giây mô hình / giây xem</option><option value="2">8 giây mô hình / giây xem</option></select></label>
    </div>
    <dl className={styles.metrics}>
      <div><dt>Thời gian mô hình</dt><dd data-time>{clock.time.toFixed(1)} s</dd></div>
      <div><dt>Hạt còn lại trong lượt</dt><dd data-remaining>{state.remaining}</dd></div>
      <div><dt>Số hạt kì vọng</dt><dd>{state.expected.toFixed(1)}</dd></div>
      <div><dt>Ghi nhận trong khoảng vừa qua</dt><dd>{state.detections} / {state.windowDurationSeconds.toFixed(1)} s</dd></div>
      <div><dt>Độ phóng xạ kì vọng</dt><dd>{state.expectedActivityBq.toFixed(2)} Bq</dd></div>
    </dl>
    <div className={styles.grid}><div className={styles.figure}><DecayProcessVisual sample={sample} time={clock.time} /></div>
      <div>
        {decayEquations}
        <p>Mỗi hạt có một thời điểm phân rã độc lập. Khi chạm thời điểm đó, hạt đổi sang trạng thái đã phân rã và máy ghi nhận lí tưởng tăng một đếm. Không bắt buộc số hạt còn lại bằng số kì vọng.</p>
        <p className={styles.note}>Giả định mẫu một loại hạt nhân không bền, chu kì không đổi; không tính nền, mất đếm hoặc phân rã tiếp của hạt nhân con. Một chấm là một hạt nhân, lưới vị trí chỉ để đếm. Không mô tả quỹ đạo nucleon. Seed tái hiện lượt sinh dữ liệu; đây không phải số đo của thí nghiệm thật.</p>
        {alternate && other && <div className={styles.table}><table><caption>So sánh tại cùng t = {clock.time.toFixed(1)} s</caption><thead><tr><th>Điều kiện</th><th>N còn lại</th><th>Kì vọng</th></tr></thead><tbody>
          <tr><td>Đã lưu: N₀={other.initialCount}, T={other.halfLifeSeconds} s, seed {other.seed}</td><td>{alternate.remaining}</td><td>{alternate.expected.toFixed(1)}</td></tr>
          <tr><td>Hiện tại: N₀={sample.initialCount}, T={sample.halfLifeSeconds} s, seed {sample.seed}</td><td>{state.remaining}</td><td>{state.expected.toFixed(1)}</td></tr>
        </tbody></table></div>}
        <details><summary>Quy luật, nguồn và cách tạo lượt</summary><p>Thời điểm phân rã được lấy từ phân bố mũ bằng biến đổi nghịch đảo; đổi tốc độ xem hoặc camera không thay đổi các thời điểm đã sinh.</p><LatexMath block math={String.raw`t_i=-\frac{\ln(1-u_i)}{\lambda},\quad 0<u_i<1`} /><p><a href="https://openstax.org/books/university-physics-volume-3/pages/10-3-radioactive-decay">OpenStax · Radioactive Decay</a>. Phạm vi học tập: SGK mẫu KNTT 01/2024, B23 trang in 104–113; thuật toán lấy mẫu là phần triển khai của mô hình.</p></details>
      </div>
    </div>
    <p>Đã ghi nhận {state.decayed} phân rã từ đầu; {state.remaining} hạt còn lại. Tổng luôn bằng {parameters.initialCount} hạt ban đầu. Hãy ghi hai kết quả ở cùng thời điểm, giải thích sai khác và chạy lại để kiểm tra.</p>
    <p className={styles.note} role="status">Hoàn thành khi đã đổi số hạt ban đầu hoặc chu kì bán rã, quan sát ít nhất 1 giây mô hình và trả lời đúng câu kiểm tra.{complete && " ✓ Đã đạt các tiêu chí."}</p>
    <ChoiceCheck key={`${parameters.initialCount}:${parameters.halfLifeSeconds}:${parameters.seed}`} question="Nếu chu kì T tăng gấp đôi, với cùng N₀, đường kì vọng thay đổi thế nào?" options={["Dốc hơn, phân rã nhanh hơn.", "Thoải hơn, số hạt kì vọng giảm chậm hơn.", "Mọi lượt ngẫu nhiên đều còn chính xác một nửa tại T."]} correctIndex={1} explanation="T tăng làm λ giảm. Đây là quy luật kì vọng; số hạt đếm trong một lượt vẫn dao động ngẫu nhiên." onResult={setAnswered} />
  </div>;
}
