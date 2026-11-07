"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LatexMath } from "@/components/learning/LatexMath";
import {
  createRutherfordRun,
  RUTHERFORD_COMPARISON,
  RUTHERFORD_DETECTOR_RADIUS_FM,
  RUTHERFORD_GOLD_Z,
  RUTHERFORD_LIMITS,
  rutherfordTrail,
  sampleRutherford,
  type RutherfordSample,
  type RutherfordSettings,
} from "@/lib/rutherford-model";
import { ChoiceCheck, Lab, Metrics, Range, Sources } from "./shared";

const MARKS = [
  { label: "A", color: "#16818e", dash: undefined },
  { label: "B", color: "#bb601f", dash: "5 3" },
] as const;
const SCALE = 0.94;
const CENTER_X = 263;
const CENTER_Y = 218;
const DETECTOR_R = RUTHERFORD_DETECTOR_RADIUS_FM * SCALE;
const MODEL_TIME_PER_SECOND_ZS = 5;
const STEP_ZS = 0.5;
const number = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 });
const x = (point: RutherfordSample) => CENTER_X + point.xFm * SCALE;
const y = (point: RutherfordSample) => CENTER_Y - point.yFm * SCALE;
const points = (samples: readonly RutherfordSample[]) => samples.map(sample => `${x(sample)},${y(sample)}`).join(" ");

export function RutherfordActivity({ onProgress }: { onProgress?: (done: boolean) => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const lastProgress = useRef(false);
  const [settings, setSettings] = useState<readonly RutherfordSettings[]>(RUTHERFORD_COMPARISON);
  const [clock, setClock] = useState({ elapsed: 0, running: false });
  const [rate, setRate] = useState(1);
  const [answers, setAnswers] = useState([false, false]);
  const [resetVersion, setResetVersion] = useState(0);
  const comparisons = useMemo(() => settings.map(value => {
    const run = createRutherfordRun(value);
    return { run, trail: rutherfordTrail(run) };
  }), [settings]);
  const totalDuration = Math.max(...comparisons.map(({ run }) => run.durationZs));
  const snapshots = comparisons.map(item => ({
    ...item,
    current: sampleRutherford(item.run, clock.elapsed),
    hit: clock.elapsed >= item.run.durationZs,
  }));
  const reachedScreen = clock.elapsed >= totalDuration;
  const different = settings[0].impactFm !== settings[1].impactFm || settings[0].energyMeV !== settings[1].energyMeV;
  const answered = answers.every(Boolean);
  const done = reachedScreen && different && answered;

  useEffect(() => {
    if (lastProgress.current === done) return;
    lastProgress.current = done;
    onProgress?.(done);
  }, [done, onProgress]);

  useEffect(() => {
    if (!clock.running) return;
    let previous = performance.now();
    let frame: number;
    function tick(now: number) {
      const delta = now - previous;
      if (delta >= 1000 / 35) {
        previous = now;
        setClock(current => {
          if (!current.running) return current;
          const elapsed = Math.min(totalDuration, current.elapsed + Math.min(delta / 1000, 0.12) * MODEL_TIME_PER_SECOND_ZS * rate);
          return { elapsed, running: elapsed < totalDuration };
        });
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [clock.running, rate, totalDuration]);

  useEffect(() => {
    const element = panel.current;
    if (!element) return;
    function pause() {
      setClock(current => current.running ? { ...current, running: false } : current);
    }
    function onVisibility() {
      if (document.hidden) pause();
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) pause();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  function updateSetting(index: number, key: keyof RutherfordSettings, value: number) {
    setSettings(current => current.map((entry, i) => i === index ? { ...entry, [key]: value } : entry));
    setClock({ elapsed: 0, running: false });
  }

  function setAnswer(index: number, correct: boolean) {
    setAnswers(current => current.map((value, i) => i === index ? correct : value));
  }

  function reset() {
    setSettings(RUTHERFORD_COMPARISON);
    setRate(1);
    setClock({ elapsed: 0, running: false });
    setAnswers([false, false]);
    setResetVersion(value => value + 1);
  }

  return <Lab
    intro="Thí nghiệm Rutherford (SGK tr. 91–92). Dự đoán hạt nào lệch nhiều hơn, rồi so sánh hai lượt tán xạ của hạt alpha quanh hạt nhân vàng trên cùng một đồng hồ mô hình."
    note="Đây là mô hình Coulomb cổ điển của một lần tương tác. Hạt nhân vàng được giữ cố định, bỏ qua electron, độ giật lùi và tương tác hạt nhân. Bán kính màn 180 fm là quy ước tính toán, các biểu tượng được phóng đại và thời gian phát được kéo dài. Mô hình khảo sát góc lệch, còn tần suất trong cả lá vàng thuộc thí nghiệm SGK."
  >
    <div ref={panel} data-rutherford-lab>
      <div className="physics-guide">
        <p>Giữ cùng động năng rồi thay tham số va chạm để so sánh. Sau đó thử giữ cùng tham số va chạm và đổi động năng.</p>
        <p><strong>Tham số va chạm b</strong> là khoảng cách từ tâm bia tới đường thẳng mà hạt sẽ đi nếu không bị lệch. <strong>Động năng E</strong> lấy khi hạt còn ở xa bia.</p>
      </div>
      <div className="physics-controls">
        {settings.map((value, index) => <fieldset key={MARKS[index].label} style={{ flex: "1 1 250px", minWidth: 0, border: "1px solid var(--border-light)", borderRadius: 10, padding: 12 }}>
          <legend>Điều kiện {MARKS[index].label}</legend>
          <Range label={`Tham số va chạm b · ${MARKS[index].label}`} value={value.impactFm} {...RUTHERFORD_LIMITS.impactFm} unit="fm" onChange={next => updateSetting(index, "impactFm", next)} />
          <Range label={`Động năng E · ${MARKS[index].label}`} value={value.energyMeV} {...RUTHERFORD_LIMITS.energyMeV} step={0.5} unit="MeV" onChange={next => updateSetting(index, "energyMeV", next)} />
        </fieldset>)}
      </div>
      <div className="physics-actions">
        <button type="button" className="physics-button primary" onClick={() => setClock(current => ({ elapsed: reachedScreen ? 0 : current.elapsed, running: !current.running }))}>
          {clock.running ? "Tạm dừng" : reachedScreen ? "Chạy lại hai điều kiện" : clock.elapsed > 0 ? "Tiếp tục" : "Chạy hai điều kiện"}
        </button>
        <button type="button" className="physics-button" disabled={clock.running || reachedScreen} onClick={() => setClock(current => ({ elapsed: Math.min(totalDuration, current.elapsed + STEP_ZS), running: false }))}>Tiến 1 bước</button>
        <button type="button" className="physics-button" onClick={reset}>Đặt lại</button>
        <label className="physics-field">
          <span>Tốc độ phát</span>
          <select value={rate} onChange={event => setRate(Number(event.target.value))}>
            <option value={0.5}>0,5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
          </select>
        </label>
      </div>
      <figure className="physics-chart" style={{ maxWidth: 560, marginInline: "auto", scrollMarginTop: 120 }}>
        <svg viewBox="0 0 500 438" className="physics-svg" style={{ display: "block", width: "100%", maxHeight: 460 }} role="img" aria-label="Nguồn alpha, bia vàng và hai quỹ đạo tán xạ tới màn ghi nhận">
          <title>Tán xạ Coulomb quanh một hạt nhân vàng</title>
          <desc>Nguồn ở bên trái. Vòng tròn nét đứt là màn ghi nhận; bia vàng nằm tại tâm. A có đường liền và B có đường đứt.</desc>
          <circle cx={CENTER_X} cy={CENTER_Y} r={DETECTOR_R} fill="none" stroke="#7a94aa" strokeWidth="1.5" strokeDasharray="5 5" />
          <text x={CENTER_X} y="27" textAnchor="middle" style={{ fontSize: 20 }}>Màn ghi nhận</text>
          <rect x={CENTER_X - 4} y="52" width="8" height="333" rx="4" fill="#d49b24" opacity="0.24" />
          <path d={`M78 ${CENTER_Y} H467`} stroke="#7890a4" strokeWidth="1" strokeDasharray="4 5" />
          <text x="476" y={CENTER_Y + 6} textAnchor="end" style={{ fontSize: 17 }}>0°</text>
          <rect x="27" y="96" width="39" height="132" rx="8" fill="#23416d" />
          <text x="46" y="84" textAnchor="middle" style={{ fontSize: 18 }}>Nguồn α</text>
          <circle cx={CENTER_X} cy={CENTER_Y} r="8" fill="#b64042" />
          <text x={CENTER_X + 13} y={CENTER_Y + 21} style={{ fontSize: 18 }}>Au</text>
          {snapshots.map(({ run, trail, current, hit }, index) => {
            const mark = MARKS[index];
            const visible = trail.slice(0, Math.floor(current.elapsedZs / run.durationZs * (trail.length - 1)) + 1);
            return <g key={mark.label}>
              <path d={`M66 ${y(run.start)} H${x(run.start)}`} stroke={mark.color} strokeOpacity="0.55" strokeDasharray="3 3" />
              {clock.elapsed > 0 && <polyline points={points([...visible, current])} fill="none" stroke={mark.color} strokeWidth="3" strokeDasharray={mark.dash} strokeLinecap="round" />}
              {hit && <path d={`M${CENTER_X} ${CENTER_Y} L${x(run.hit)} ${y(run.hit)}`} stroke={mark.color} strokeOpacity="0.38" strokeDasharray="4 5" />}
              <circle cx={x(current)} cy={y(current)} r={hit ? 8 : 5.5} fill={hit ? "none" : mark.color} stroke={mark.color} strokeWidth={hit ? 3 : 1}>
                <title>{`Hạt ${mark.label}${hit ? " đã chạm màn" : ""}`}</title>
              </circle>
            </g>;
          })}
          <text x={CENTER_X} y="420" textAnchor="middle" style={{ fontSize: 18 }}>Tâm bia vàng trong lá mỏng</text>
        </svg>
        <figcaption>
          <span><i style={{ background: MARKS[0].color }} aria-hidden="true" />A · nét liền</span>
          <span><i style={{ background: MARKS[1].color }} aria-hidden="true" />B · nét đứt</span>
        </figcaption>
      </figure>
      <p className="physics-note">Thời gian mô hình <strong data-rutherford-time>{number.format(clock.elapsed)} zs</strong> · mỗi bước 0,5 zs · <LatexMath math={String.raw`1\,\mathrm{zs}=10^{-21}\,\mathrm{s}`} />.</p>
      <Metrics items={snapshots.flatMap(({ run, current, hit }, index) => {
        const label = MARKS[index].label;
        return [
          { label: `${label} · Khoảng cách hiện tại tới tâm bia (r)`, value: `${number.format(current.radiusFm)} fm` },
          { label: `${label} · Góc tán xạ ở xa bia`, value: hit ? `${number.format(run.scatteringAngleDeg)}°` : "Chờ hạt tới màn" },
          { label: `${label} · Góc vị trí trên màn`, value: hit ? `${number.format(run.detectorAngleDeg)}°` : "Chờ hạt tới màn" },
          { label: `${label} · Gần bia nhất`, value: hit ? `${number.format(run.closestApproachFm)} fm` : "Đang khảo sát" },
        ];
      })} />
      <p className="physics-note">Góc tán xạ so hướng vận tốc tới và đi khi ở xa bia. Góc vị trí trên màn so hướng ban đầu với đường nối tâm bia đến điểm ghi nhận trên màn hữu hạn.</p>
      <p role="status" data-rutherford-result>
        {reachedScreen ? different
          ? `Hai hạt đã tới màn. Góc tán xạ chênh ${number.format(Math.abs(comparisons[0].run.scatteringAngleDeg - comparisons[1].run.scatteringAngleDeg))}°.`
          : "Hai hạt đã tới màn. Hãy đổi ít nhất một tham số để tạo hai điều kiện khác nhau."
          : "Chọn chạy hoặc tiến từng bước để ghi nhận quỹ đạo."}
      </p>
    </div>
    <details className="physics-sources">
      <summary>Cách tính góc và giới hạn mô hình</summary>
      <LatexMath block math={String.raw`\tan\!\left(\frac{\theta}{2}\right)=\frac{k_e\,Z_\alpha Z_{\mathrm{Au}}e^2}{2Eb}\qquad (b>0)`} />
      <p>Hạt alpha có điện tích gấp hai lần điện tích nguyên tố. Vàng có {RUTHERFORD_GOLD_Z} proton. Trường hợp hướng tới tâm bia cho góc tán xạ 180 độ trong mô hình.</p>
      <p>Quỹ đạo được tính từ lực đẩy Coulomb và thời gian chuyển động. Phép tính dùng khoảng cách theo femtômét và động năng theo megaelectronvôn.</p>
    </details>
    <div className="physics-checklist">
      <p><strong>Tiêu chí hoàn thành</strong></p>
      <ul>
        <li className={reachedScreen && different ? "is-done" : ""}>Ghi nhận cả hai quỹ đạo với điều kiện khác nhau.</li>
        <li className={answered ? "is-done" : ""}>Trả lời đúng hai câu hỏi giải thích.</li>
      </ul>
    </div>
    <div key={resetVersion}>
      <ChoiceCheck
        question="Giữ nguyên động năng. Khi hạt tới gần tâm bia hơn, góc tán xạ thay đổi thế nào?"
        options={["Góc giảm.", "Góc tăng.", "Góc giữ nguyên."]}
        correctIndex={1}
        explanation="Ở gần tâm, lực đẩy Coulomb mạnh hơn. Với cùng động năng, giảm khoảng cách tới làm tăng góc tán xạ."
        onResult={correct => setAnswer(0, correct)}
      />
      <ChoiceCheck
        question="Trong thí nghiệm SGK, vì sao một số rất ít hạt lệch góc lớn là bằng chứng về cấu trúc nguyên tử?"
        options={[
          "Điện tích dương tập trung trong một hạt nhân rất nhỏ.",
          "Electron mang điện âm tập trung ở tâm nguyên tử.",
          "Độ cứng của lá vàng làm hạt bật ngược như va vào tấm chắn.",
        ]}
        correctIndex={0}
        explanation="Các hạt alpha cùng dấu điện tích với hạt nhân. Sự lệch góc lớn cho thấy có một vùng dương rất nhỏ tạo lực đẩy mạnh; đa số hạt đi gần thẳng qua phần còn lại của nguyên tử."
        onResult={correct => setAnswer(1, correct)}
      />
    </div>
    <Sources links={[
      { label: "MIT OpenCourseWare · Tán xạ Rutherford", url: "https://ocw.mit.edu/courses/22-02-introduction-to-applied-nuclear-physics-spring-2012/f06e26889dd2332f1664a2df42e00ed4_MIT22_02S12_lec_ch8.pdf" },
      { label: "NIST · Hằng số CODATA 2022", url: "https://physics.nist.gov/cuu/pdf/JPCRD2022CODATA.pdf" },
      { label: "IUPAC CIAAW · Thành phần đồng vị vàng", url: "https://ciaaw.org/gold.htm" },
    ]} />
  </Lab>;
}
