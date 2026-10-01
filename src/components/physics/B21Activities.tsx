"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChoiceCheck, Lab, Metrics, NuclearSymbol, Nucleus, Range, Sources } from './shared';

/* ──────────────────────────────────────────────────────────────────────────────
   A. THÍ NGHIỆM TÁN XẠ ALPHA CỦA RUTHERFORD
   SGK tr. 91–92  |  Hình 21.3
   ────────────────────────────────────────────────────────────────────────────── */

// Layout constants for the SVG (viewBox 0 0 700 360)
const SRC_X = 30;      // source box left edge
const SRC_W = 40;      // source box width
const FOIL_X = 350;    // gold foil x center
const NUC_X = 350;     // nucleus x center
const NUC_Y = 180;     // nucleus y center
const SCREEN_R = 155;  // screen (detection ring) radius
const EMIT_X = SRC_X + SRC_W + 4; // particle emission x

/** Compute scattering angle from impact parameter b (-100..100). Qualitative Coulomb model. */
function scatterAngle(b: number): number {
  // For |b| close to 0 → large deflection; for large |b| → nearly straight
  return 2 * Math.atan2(1, Math.max(Math.abs(b) * 0.05, 0.01)) * (b < 0 ? -1 : 1);
}

/** Generate waypoints for a particle path: emit → approach foil → scatter → hit screen */
function buildWaypoints(b: number): { x: number; y: number }[] {
  const angle = scatterAngle(b);
  const startY = NUC_Y + b * 0.7; // offset from nucleus center
  const pts: { x: number; y: number }[] = [];
  // Phase 1: travel from source to foil (straight line)
  const nApproach = 20;
  for (let i = 0; i <= nApproach; i++) {
    const t = i / nApproach;
    pts.push({ x: EMIT_X + (FOIL_X - 20 - EMIT_X) * t, y: startY });
  }
  // Phase 2: scatter near nucleus (curved)
  const nScatter = 25;
  for (let i = 1; i <= nScatter; i++) {
    const t = i / nScatter;
    const dist = t * SCREEN_R * 0.9;
    pts.push({
      x: FOIL_X + dist * Math.cos(angle),
      y: startY + dist * Math.sin(angle),
    });
  }
  return pts;
}

type FlyingParticle = {
  id: number;
  b: number;
  waypoints: { x: number; y: number }[];
  frame: number;       // current waypoint index
  done: boolean;
  angle: number;
};

type FinishedTrail = {
  id: number;
  points: string;      // SVG polyline points
  isBack: boolean;     // backscatter?
  hitX: number;
  hitY: number;
};

export type ActivityCompletion = {
  hasFiredSingle: boolean;
  hasFiredBeam: boolean;
  hasAnswered: boolean;
  distinctPositions: number;
};

export function RutherfordActivity({ onProgress }: { onProgress?: (done: boolean) => void }) {
  const [impact, setImpact] = useState(50);
  const [sampleSize, setSampleSize] = useState(100);
  const [totals, setTotals] = useState([0, 0, 0]);
  const [completion, setCompletion] = useState<ActivityCompletion>({
    hasFiredSingle: false,
    hasFiredBeam: false,
    hasAnswered: false,
    distinctPositions: 0,
  });
  const [usedPositions, setUsedPositions] = useState<Set<number>>(new Set());

  // Animation state kept in refs so RAF callback doesn't cause re-render storms
  const [particles, setParticles] = useState<FlyingParticle[]>([]);
  const [trails, setTrails] = useState<FinishedTrail[]>([]);
  const [screenHits, setScreenHits] = useState<{ x: number; y: number; age: number }[]>([]);
  const [lastDeflection, setLastDeflection] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<FlyingParticle[]>([]);
  const trailsRef = useRef<FinishedTrail[]>([]);
  const hitsRef = useRef<{ x: number; y: number; age: number }[]>([]);
  const totalsRef = useRef([0, 0, 0]);
  const nextIdRef = useRef(0);
  const beamQueueRef = useRef<number[]>([]);
  const beamTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useRef(false);
  const tickRef = useRef<() => void>(() => {});

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (beamTimerRef.current) clearTimeout(beamTimerRef.current);
    };
  }, []);

  const checkDone = useCallback((c: ActivityCompletion) => {
    const done = c.hasFiredSingle && c.hasFiredBeam && c.hasAnswered && c.distinctPositions >= 2;
    onProgress?.(done);
  }, [onProgress]);

  // Animation loop — stored in a ref to avoid self-reference lint issues
  useEffect(() => {
    tickRef.current = () => {
      const active = particlesRef.current;
      let anyAlive = false;
      const newTrails: FinishedTrail[] = [];
      const newHits: { x: number; y: number; age: number }[] = [];
      const countUpdates = [0, 0, 0];

      for (const p of active) {
        if (p.done) continue;
        p.frame += prefersReducedMotion.current ? 3 : 1;
        if (p.frame >= p.waypoints.length) {
          p.done = true;
          const last = p.waypoints[p.waypoints.length - 1];
          const isBack = Math.abs(p.angle) >= Math.PI / 2;
          newTrails.push({
            id: p.id,
            points: p.waypoints.map(w => `${w.x},${w.y}`).join(' '),
            isBack,
            hitX: last.x,
            hitY: last.y,
          });
          newHits.push({ x: last.x, y: last.y, age: 0 });
          const absAngle = Math.abs(p.angle);
          if (absAngle < Math.PI / 18) countUpdates[0]++;
          else if (absAngle < Math.PI / 2) countUpdates[1]++;
          else countUpdates[2]++;
        } else {
          anyAlive = true;
        }
      }

      if (newTrails.length > 0) {
        trailsRef.current = [...trailsRef.current, ...newTrails];
        hitsRef.current = [...hitsRef.current, ...newHits];
        totalsRef.current = [
          totalsRef.current[0] + countUpdates[0],
          totalsRef.current[1] + countUpdates[1],
          totalsRef.current[2] + countUpdates[2],
        ];
        setTrails([...trailsRef.current]);
        setScreenHits([...hitsRef.current]);
        setTotals([...totalsRef.current]);
      }

      particlesRef.current = active.filter(p => !p.done);
      setParticles([...particlesRef.current]);

      if (anyAlive || beamQueueRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(tickRef.current);
      } else {
        setAnimating(false);
      }
    };
  });

  function startAnimation() {
    if (!animating) {
      setAnimating(true);
      rafRef.current = requestAnimationFrame(tickRef.current);
    }
  }

  function addParticle(b: number) {
    const angle = scatterAngle(b);
    const wp = buildWaypoints(b);
    const p: FlyingParticle = {
      id: nextIdRef.current++,
      b,
      waypoints: wp,
      frame: 0,
      done: false,
      angle,
    };
    particlesRef.current = [...particlesRef.current, p];
    setParticles([...particlesRef.current]);

    // Set deflection description
    const absAngle = Math.abs(angle);
    if (absAngle < Math.PI / 18) {
      setLastDeflection('Hạt đi gần thẳng (lệch < 10°) — lực đẩy Coulomb yếu ở khoảng cách xa.');
    } else if (absAngle < Math.PI / 2) {
      setLastDeflection('Hạt lệch rõ (10°–90°) — đi gần hạt nhân, lực đẩy Coulomb mạnh hơn.');
    } else {
      setLastDeflection('Hạt bật ngược (≥ 90°) — đi rất sát hạt nhân, lực đẩy cực mạnh! Rất hiếm.');
    }
  }

  function fireSingle() {
    // Stop any ongoing beam
    if (beamTimerRef.current) { clearTimeout(beamTimerRef.current); beamTimerRef.current = null; }
    beamQueueRef.current = [];

    addParticle(impact);

    const newPositions = new Set(usedPositions);
    newPositions.add(Math.round(impact / 30));
    setUsedPositions(newPositions);

    const updated = {
      ...completion,
      hasFiredSingle: true,
      distinctPositions: newPositions.size,
    };
    setCompletion(updated);
    checkDone(updated);
    startAnimation();
  }

  function fireBeam() {
    // Stop any ongoing beam first
    if (beamTimerRef.current) { clearTimeout(beamTimerRef.current); beamTimerRef.current = null; }

    // Generate impact parameters with realistic distribution:
    // most particles far from center, very few near center
    const queue: number[] = [];
    for (let i = 0; i < sampleSize; i++) {
      // Uniform distribution in b gives correct 1/sin⁴(θ/2) angular distribution qualitatively
      const b = (Math.random() * 200 - 100);
      queue.push(b);
    }
    beamQueueRef.current = queue;

    const updated = {
      ...completion,
      hasFiredBeam: true,
    };
    setCompletion(updated);
    checkDone(updated);

    // Fire particles one by one with stagger
    const stagger = prefersReducedMotion.current ? 0 : 30; // ms between particles
    function fireNext() {
      if (beamQueueRef.current.length === 0) return;
      const b = beamQueueRef.current.shift()!;
      addParticle(b);
      startAnimation();
      if (beamQueueRef.current.length > 0) {
        beamTimerRef.current = setTimeout(fireNext, stagger);
      }
    }
    fireNext();
  }

  function reset() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (beamTimerRef.current) { clearTimeout(beamTimerRef.current); beamTimerRef.current = null; }
    beamQueueRef.current = [];
    particlesRef.current = [];
    trailsRef.current = [];
    hitsRef.current = [];
    totalsRef.current = [0, 0, 0];
    setParticles([]);
    setTrails([]);
    setScreenHits([]);
    setTotals([0, 0, 0]);
    setLastDeflection(null);
    setAnimating(false);
  }

  function handleAnswered() {
    const updated = { ...completion, hasAnswered: true };
    setCompletion(updated);
    checkDone(updated);
  }

  const total = totals[0] + totals[1] + totals[2];

  return (
    <Lab
      intro="Bắn hạt α qua lá kim loại mỏng (thí nghiệm Rutherford, SGK tr.91–92). Thay đổi vị trí hạt tới so với tâm hạt nhân, bắn từng hạt và bắn chùm để so sánh các góc lệch."
      note="Mô phỏng định tính: hạt nhân được phóng đại để quan sát (hình không theo tỉ lệ); góc, kích thước và tỉ lệ số hạt không phải số liệu thí nghiệm. SGK: hạt bật ngược (≥ 90°) rất hiếm, cỡ 1/10⁴."
    >
      <div className="physics-guide">
        <p><strong>🔬 Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Dự đoán:</strong> Nếu nguyên tử rỗng, phần lớn hạt α sẽ đi thế nào?</li>
          <li><strong>Thử:</strong> Kéo thanh trượt để bắn hạt xa tâm, rồi gần tâm.</li>
          <li><strong>Quan sát:</strong> Bắn chùm nhiều hạt, đếm số hạt mỗi góc.</li>
          <li><strong>Giải thích:</strong> Trả lời câu hỏi bên dưới về kết quả quan sát.</li>
        </ol>
      </div>

      <div className="physics-controls">
        <Range label="Khoảng cách quỹ đạo tới tâm hạt nhân" value={impact} min={-100} max={100} onChange={setImpact} unit="(tương đối)" />
        <Range label="Số hạt mỗi chùm" value={sampleSize} min={50} max={500} step={50} onChange={setSampleSize} />
      </div>

      <div className="physics-actions">
        <button type="button" className="physics-button primary" onClick={fireSingle}>Bắn một hạt α</button>
        <button type="button" className="physics-button" onClick={fireBeam}>Bắn chùm {sampleSize} hạt</button>
        <button type="button" className="physics-button" onClick={reset}>Đặt lại</button>
      </div>

      {/* Main simulation SVG — uses full width */}
      <svg viewBox="0 0 700 360" className="physics-svg" style={{ width: '100%', maxHeight: '420px' }} role="img" aria-label={`Thí nghiệm tán xạ alpha. Đã bắn ${total} hạt.`}>
        <title>Tán xạ alpha Rutherford – hạt nhân được phóng đại</title>

        {/* Detection screen (ring) */}
        <circle cx={NUC_X} cy={NUC_Y} r={SCREEN_R} fill="none" stroke="#adc0d8" strokeWidth="2" strokeDasharray="5 6" />
        <text x={NUC_X} y={18} textAnchor="middle" fontSize="12" fill="var(--text-secondary)">Màn ghi nhận</text>

        {/* Gold foil */}
        <rect x={FOIL_X - 4} y={40} width="8" height={280} fill="#edcc75" opacity={0.5} rx="2" />
        <text x={FOIL_X} y={335} textAnchor="middle" fontSize="11" fill="var(--text-secondary)">Lá vàng mỏng</text>

        {/* Alpha source */}
        <rect x={SRC_X} y={NUC_Y - 50} width={SRC_W} height={100} rx="6" fill="#23416d" />
        <text x={SRC_X + SRC_W / 2} y={NUC_Y - 58} textAnchor="middle" fontSize="12" fill="var(--text-secondary)">Nguồn α⁺</text>

        {/* Legend */}
        <g transform="translate(560, 30)" fontSize="10">
          <line x1="0" y1="0" x2="18" y2="0" stroke="#2357a5" strokeWidth="2" />
          <text x="22" y="4" fill="var(--text-secondary)">Thẳng / lệch nhẹ</text>
          <line x1="0" y1="16" x2="18" y2="16" stroke="#b84040" strokeWidth="2" />
          <text x="22" y="20" fill="var(--text-secondary)">Bật ngược ≥ 90°</text>
        </g>

        {/* Finished trails (faded) */}
        {trails.map((trail) => (
          <polyline
            key={trail.id}
            points={trail.points}
            fill="none"
            stroke={trail.isBack ? '#b84040' : '#2357a5'}
            strokeWidth="1.2"
            opacity={0.25}
          />
        ))}

        {/* Screen hit flashes */}
        {screenHits.map((hit, i) => (
          <circle
            key={i}
            cx={hit.x}
            cy={hit.y}
            r="4"
            fill="#fbbf24"
            opacity={0.6}
          />
        ))}

        {/* Flying particles (active) */}
        {particles.map((p) => {
          const f = Math.min(p.frame, p.waypoints.length - 1);
          const pos = p.waypoints[f];
          // Partial trail behind the particle
          const trailPts = p.waypoints.slice(0, f + 1).map(w => `${w.x},${w.y}`).join(' ');
          const isBack = Math.abs(p.angle) >= Math.PI / 2;
          return (
            <g key={p.id}>
              <polyline
                points={trailPts}
                fill="none"
                stroke={isBack ? '#b84040' : '#2357a5'}
                strokeWidth="2"
                opacity={0.6}
              />
              <circle cx={pos.x} cy={pos.y} r="5" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1">
                <title>Hạt α đang bay</title>
              </circle>
            </g>
          );
        })}

        {/* Nucleus (enlarged for visibility) */}
        <circle cx={NUC_X} cy={NUC_Y} r="10" fill="#b84040" />
        <text x={NUC_X + 14} y={NUC_Y - 4} fill="#9a3030" fontSize="14" fontWeight="bold">+</text>
        <text x={NUC_X} y={NUC_Y + 26} textAnchor="middle" fontSize="9" fill="var(--text-muted)">(hạt nhân phóng đại, hình không theo tỉ lệ)</text>
      </svg>

      {/* Deflection explanation */}
      {lastDeflection && (
        <div className="physics-feedback" style={{ marginTop: '8px' }}>
          <strong>💡 Giải thích:</strong> {lastDeflection} Hạt α (+2e) và hạt nhân (+Ze) cùng dương → <strong>đẩy nhau</strong> theo định luật Coulomb.
        </div>
      )}

      <Metrics items={[
        { label: 'Gần thẳng (góc < 10°)', value: `${totals[0]} hạt` },
        { label: 'Lệch 10° – dưới 90°', value: `${totals[1]} hạt` },
        { label: 'Lệch lớn / ngược ≥ 90° (rất hiếm)', value: `${totals[2]} hạt` },
      ]} />

      {/* Tiêu chí hoàn thành */}
      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={completion.distinctPositions >= 2 ? 'is-done' : ''}>Thử ít nhất 2 vị trí tới khác nhau {completion.distinctPositions >= 2 ? '✓' : ''}</li>
          <li className={completion.hasFiredBeam ? 'is-done' : ''}>Bắn chùm hạt {completion.hasFiredBeam ? '✓' : ''}</li>
          <li className={completion.hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi giải thích {completion.hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div onClickCapture={handleAnswered}>
        <ChoiceCheck
          question="Trước khi thí nghiệm, theo mô hình nguyên tử Thomson (điện dương phân bố đều), người ta dự đoán các hạt α sẽ thế nào?"
          options={[
            'Phần lớn bị bật ngược lại.',
            'Hầu hết đi thẳng hoặc chỉ lệch một góc rất nhỏ.',
            'Bị hạt nhân hút lại.',
          ]}
          correctIndex={1}
          explanation="Vì điện dương phân bố mỏng đều khắp nguyên tử, lực đẩy không đủ sức làm hạt α nặng và nhanh bị lệch xa."
        />
        <ChoiceCheck
          question="Từ bằng chứng quan sát (một tỉ lệ nhỏ bật ngược), suy luận nào là hợp lí nhất để thay thế mô hình Thomson?"
          options={[
            'Điện tích dương và phần lớn khối lượng tập trung ở hạt nhân rất nhỏ; phần lớn thể tích nguyên tử là khoảng trống.',
            'Các electron mang điện âm tập trung ở tâm nguyên tử.',
            'Lá vàng quá cứng nên hạt α va chạm đàn hồi bật lại.',
          ]}
          correctIndex={0}
          explanation="Hạt α (+2e) bị bật ngược chứng tỏ nó gặp lực đẩy tĩnh điện cực mạnh từ một lõi nhỏ xíu mang điện dương và rất nặng (hạt nhân). SGK tr. 92: đa số hạt đi thẳng ⟹ nguyên tử phần lớn là khoảng trống; hạt bị lệch ⟹ hạt alpha và hạt nhân cùng dương nên đẩy nhau; bật ngược rất hiếm ⟹ điện tích dương và phần lớn khối lượng tập trung trong hạt nhân rất nhỏ."
        />
      </div>

      <Sources links={[{ label: 'CERN — Di sản thí nghiệm Rutherford', url: 'https://repository.cern/records/s55ms-hwm20' }]} />
    </Lab>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   B. BỘ DỰNG HẠT NHÂN
   SGK tr. 93–94  |  Kí hiệu hạt nhân, proton/neutron
   ────────────────────────────────────────────────────────────────────────────── */

const elements = ['—', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca'];

type BuilderPreset = { label: string; z: number; n: number };
const PRESETS: BuilderPreset[] = [
  { label: 'Si-28 (SGK)', z: 14, n: 14 },
  { label: 'He-4', z: 2, n: 2 },
  { label: 'C-12', z: 6, n: 6 },
];

export function NuclearBuilderActivity({ onProgress }: { onProgress?: (done: boolean) => void }) {
  const [z, setZ] = useState(6);
  const [n, setN] = useState(6);
  const [hasSelectedSi28, setHasSelectedSi28] = useState(false);
  const [hasModified, setHasModified] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const checkDone = useCallback((si: boolean, mod: boolean, ans: boolean) => {
    onProgress?.(si && mod && ans);
  }, [onProgress]);

  function applyPreset(preset: BuilderPreset) {
    setZ(preset.z);
    setN(preset.n);
    if (preset.z === 14 && preset.n === 14) {
      setHasSelectedSi28(true);
      checkDone(true, hasModified, hasAnswered);
    }
  }

  function handleZChange(value: number) {
    setZ(value);
    if (hasSelectedSi28 && !hasModified) {
      setHasModified(true);
      checkDone(hasSelectedSi28, true, hasAnswered);
    }
  }

  function handleNChange(value: number) {
    setN(value);
    if (hasSelectedSi28 && !hasModified) {
      setHasModified(true);
      checkDone(hasSelectedSi28, true, hasAnswered);
    }
  }

  function handleAnswered() {
    if (!hasAnswered) {
      setHasAnswered(true);
      checkDone(hasSelectedSi28, hasModified, true);
    }
  }

  const a = z + n;

  return (
    <Lab
      intro="Thay đổi số proton (Z) và neutron (N) để tạo cấu hình hạt nhân, rồi đọc kí hiệu tương ứng."
      note="Đây là bộ dựng thành phần: cặp Z, N tuỳ chọn trong bộ dựng chưa chắc tồn tại hoặc bền trong tự nhiên. Hình biểu diễn các nucleon, không phải quỹ đạo thực."
    >
      <div className="physics-guide">
        <p><strong>🧱 Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Dự đoán:</strong> Silicon-28 có bao nhiêu proton và neutron?</li>
          <li><strong>Thử:</strong> Nhấn nút Si-28 rồi đọc Z, N, A.</li>
          <li><strong>Quan sát:</strong> Đổi Z hoặc N — nguyên tố và kí hiệu thay đổi ra sao?</li>
          <li><strong>Giải thích:</strong> Trả lời câu hỏi bên dưới.</li>
        </ol>
      </div>

      <div className="physics-controls">
        <Range label="Số proton Z" value={z} min={1} max={20} onChange={handleZChange} />
        <Range label="Số neutron N" value={n} min={0} max={30} onChange={handleNChange} />
      </div>

      <div className="physics-actions">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className={`physics-button${preset.z === 14 ? ' primary' : ''}`}
            onClick={() => applyPreset(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="physics-split">
        <Nucleus z={z} n={n} />
        <div className="physics-formula">
          <NuclearSymbol a={a} z={z} symbol={elements[z] ?? '?'} />
          <p>A = Z + N = {z} + {n} = {a}</p>
          <p>Điện tích hạt nhân: +{z}e</p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Proton mang điện +e · Neutron không mang điện
          </p>
          {z <= 20 && (
            <p style={{ fontSize: '13px', marginTop: '4px' }}>
              Nguyên tố: <strong>{elements[z]}</strong> (Z = {z})
            </p>
          )}
        </div>
      </div>

      <Metrics items={[
        { label: 'Proton Z', value: z },
        { label: 'Neutron N', value: n },
        { label: 'Nucleon A', value: a },
      ]} />

      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={hasSelectedSi28 ? 'is-done' : ''}>Chọn Si-28 (Z = 14, N = 14) {hasSelectedSi28 ? '✓' : ''}</li>
          <li className={hasModified ? 'is-done' : ''}>Thử đổi Z hoặc N để quan sát sự thay đổi {hasModified ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi giải thích {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div onClickCapture={handleAnswered}>
        <ChoiceCheck
          question="Nếu giữ Z và thêm một neutron, đại lượng nào thay đổi?"
          options={[
            'Số khối A tăng 1, nguyên tố giữ nguyên.',
            'Điện tích hạt nhân tăng thêm e.',
            'Nguyên tố đổi vì Z tăng.',
          ]}
          correctIndex={0}
          explanation="Nguyên tố được xác định bởi Z. Thêm neutron chỉ làm N và A tăng 1; điện tích hạt nhân vẫn là +Ze. Khi đổi Z, nguyên tố đổi; khi đổi N mà giữ Z, nguyên tố không đổi."
        />
      </div>
    </Lab>
  );
}

const ELEMENTS = [
  '?', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 
  'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr',
  'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd',
  'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg',
  'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm',
  'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og'
];

function NucleusCluster({ cx, cy, z, n, baseScale }: { cx: number; cy: number; z: number; n: number; baseScale: number }) {
  const a = z + n;
  const radius = baseScale * Math.cbrt(a);
  const dotR = Math.max(1, (radius / Math.sqrt(Math.max(1, a))) * 0.85);
  
  // Create deterministic interleaved array for protons and neutrons
  const isProton = Array.from({ length: a }, (_, i) => i < z);
  for (let i = 0; i < a; i++) {
    const j = (i * 7) % a;
    const temp = isProton[i];
    isProton[i] = isProton[j];
    isProton[j] = temp;
  }

  return (
    <g>
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--border-light)" strokeDasharray="4 4" />
      {Array.from({ length: a }, (_, i) => {
         const r = Math.sqrt((i + 0.5) / a) * Math.max(0, radius - dotR);
         // Fermat's spiral angle
         const angle = i * 2.39996322972865332;
         const proton = isProton[i];
         return (
           <circle 
             key={i} 
             cx={cx + r * Math.cos(angle)} 
             cy={cy + r * Math.sin(angle)} 
             r={dotR} 
             fill={proton ? '#b84040' : '#2357a5'} 
             stroke="white" 
             strokeWidth="0.5" 
           />
         );
      })}
    </g>
  );
}

export function IsotopeActivity({ onProgress }: { onProgress?: (done: boolean) => void }) {
  const [z1, setZ1] = useState(13);
  const [n1, setN1] = useState(14);
  const [z2, setZ2] = useState(26);
  const [n2, setN2] = useState(30);
  
  const [feedback, setFeedback] = useState<string>('');
  
  const [hasExploredZ, setHasExploredZ] = useState(false);
  const [hasExploredN, setHasExploredN] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const checkDone = useCallback((expZ: boolean, expN: boolean, ans: boolean) => {
    onProgress?.(expZ && expN && ans);
  }, [onProgress]);

  function updateNucleus(id: 1 | 2, dz: number, dn: number) {
    const oldZ = id === 1 ? z1 : z2;
    const oldN = id === 1 ? n1 : n2;
    
    const newZ = Math.max(1, Math.min(118, oldZ + dz));
    const newN = Math.max(0, oldN + dn);
    
    if (newZ === oldZ && newN === oldN) return;
    
    if (id === 1) { setZ1(newZ); setN1(newN); }
    else { setZ2(newZ); setN2(newN); }
    
    const oldA = oldZ + oldN;
    const newA = newZ + newN;
    const oldR = 1.2 * Math.cbrt(oldA);
    const newR = 1.2 * Math.cbrt(newA);
    
    const oldSym = ELEMENTS[oldZ] || '?';
    const newSym = ELEMENTS[newZ] || '?';
    
    let msg = `Hạt nhân ${id}: `;
    if (dz !== 0) {
      msg += `Z ${dz > 0 ? 'tăng' : 'giảm'} từ ${oldZ} thành ${newZ} (điện tích ${dz > 0 ? 'tăng' : 'giảm'} thành +${newZ}e), tên nguyên tố đổi từ ${oldSym} thành ${newSym}; `;
      msg += `N giữ ${oldN}; `;
    } else if (dn !== 0) {
      msg += `N ${dn > 0 ? 'tăng' : 'giảm'} từ ${oldN} lên ${newN}; Z giữ ${oldZ}; `;
    }
    
    msg += `A ${newA > oldA ? 'tăng' : 'giảm'} từ ${oldA} lên ${newA}; `;
    if (dz === 0) msg += `vẫn là nguyên tố ${newSym}; `;
    
    msg += `R ${newR > oldR ? 'tăng' : 'giảm'} từ khoảng ${oldR.toFixed(2)} lên ${newR.toFixed(2)} fm.`;
    
    setFeedback(msg);
    
    const expZ = hasExploredZ || dz !== 0;
    const expN = hasExploredN || dn !== 0;
    if (dz !== 0) setHasExploredZ(true);
    if (dn !== 0) setHasExploredN(true);
    
    checkDone(expZ, expN, hasAnswered);
  }

  function handleAnswered() {
    if (!hasAnswered) {
      setHasAnswered(true);
      checkDone(hasExploredZ, hasExploredN, true);
    }
  }
  
  const a1 = z1 + n1;
  const a2 = z2 + n2;
  const radius1 = 1.2 * Math.cbrt(a1);
  const radius2 = 1.2 * Math.cbrt(a2);

  return (
    <Lab intro="Đối chiếu các đồng vị: cùng Z, khác N. So sánh kích thước hạt nhân theo R ≈ 1,2A¹ᐟ³ fm.">
      <div className="physics-guide">
        <p><strong>🔎 Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Dự đoán:</strong> Bắn thêm neutron hoặc proton thì hạt nhân thay đổi ra sao?</li>
          <li><strong>Thử:</strong> Thay đổi số proton hoặc neutron bằng các nút bên dưới.</li>
          <li><strong>Quan sát:</strong> Đọc phản hồi cụ thể và xem sự so sánh bán kính.</li>
          <li><strong>Giải thích:</strong> Trả lời câu hỏi về quy luật bán kính bên dưới.</li>
        </ol>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {/* Panel 1 */}
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <div style={{ transform: 'scale(0.8)', transformOrigin: 'left center' }}>
              <NuclearSymbol a={a1} z={z1} symbol={ELEMENTS[z1] || '?'} />
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
              <strong>Hạt nhân 1</strong><br/>
              Z = {z1} (proton) · N = {n1} (neutron)<br/>
              A = {a1} · Điện tích: +{z1}e
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button className="physics-button" onClick={() => updateNucleus(1, 1, 0)}>+ proton</button>
            <button className="physics-button" onClick={() => updateNucleus(1, -1, 0)}>− proton</button>
            <button className="physics-button" onClick={() => updateNucleus(1, 0, 1)}>+ neutron</button>
            <button className="physics-button" onClick={() => updateNucleus(1, 0, -1)}>− neutron</button>
          </div>
        </div>
        
        {/* Panel 2 */}
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <div style={{ transform: 'scale(0.8)', transformOrigin: 'left center' }}>
              <NuclearSymbol a={a2} z={z2} symbol={ELEMENTS[z2] || '?'} />
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
              <strong>Hạt nhân 2</strong><br/>
              Z = {z2} (proton) · N = {n2} (neutron)<br/>
              A = {a2} · Điện tích: +{z2}e
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button className="physics-button" onClick={() => updateNucleus(2, 1, 0)}>+ proton</button>
            <button className="physics-button" onClick={() => updateNucleus(2, -1, 0)}>− proton</button>
            <button className="physics-button" onClick={() => updateNucleus(2, 0, 1)}>+ neutron</button>
            <button className="physics-button" onClick={() => updateNucleus(2, 0, -1)}>− neutron</button>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="physics-feedback" style={{ marginBottom: '16px' }}>
          <strong>Phản hồi:</strong> {feedback}
        </div>
      )}

      <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>
        So sánh Bán kính hạt nhân: R ≈ r₀ · A<sup>1/3</sup>
      </h4>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
        r₀ ≈ 1,2 fm; 1 fm = 10⁻¹⁵ m. Công thức phù hợp hơn khi A &gt; 12. Hình minh họa thành phần, được phóng đại và vẽ theo cùng tỉ lệ, không khẳng định cấu hình tạo ra là đồng vị bền.
      </p>

      <svg className="physics-svg" viewBox="0 0 530 250" role="img" aria-label={`So sánh bán kính: A₁=${a1} (R≈${radius1.toFixed(2)} fm) và A₂=${a2} (R≈${radius2.toFixed(2)} fm).`}>
        <title>So sánh bán kính và cấu tạo hạt nhân (cùng tỉ lệ phóng đại)</title>
        
        <NucleusCluster cx={140} cy={110} z={z1} n={n1} baseScale={16} />
        <NucleusCluster cx={390} cy={110} z={z2} n={n2} baseScale={16} />
        
        <text x="140" y="215" textAnchor="middle" fontSize="13">A₁ = {a1} → R ≈ {radius1.toFixed(2)} fm</text>
        <text x="390" y="215" textAnchor="middle" fontSize="13">A₂ = {a2} → R ≈ {radius2.toFixed(2)} fm</text>
        
        <g transform="translate(200, 235)">
          <circle cx="10" cy="-4" r="4" fill="#b84040" />
          <text x="20" y="0" fontSize="12" fill="var(--text-secondary)">Proton (+)</text>
          <circle cx="80" cy="-4" r="4" fill="#2357a5" />
          <text x="90" y="0" fontSize="12" fill="var(--text-secondary)">Neutron (n)</text>
        </g>
      </svg>

      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={hasExploredZ ? 'is-done' : ''}>Thử thay đổi proton (Z) để xem tên nguyên tố đổi {hasExploredZ ? '✓' : ''}</li>
          <li className={hasExploredN ? 'is-done' : ''}>Thử thay đổi neutron (N) để xem R tăng mà Z giữ nguyên {hasExploredN ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi về quy luật bán kính {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div onClickCapture={handleAnswered}>
        <ChoiceCheck
          question="Khi số khối tăng 8 lần, bán kính gần đúng tăng mấy lần?"
          options={['8 lần', '4 lần', '2 lần']}
          correctIndex={2}
          explanation="R tỉ lệ với căn bậc ba của A, nên R mới / R cũ = ∛8 = 2. Thể tích gần tỉ lệ với A (vì V ~ R³ ~ A), còn bán kính không tăng tuyến tính."
        />
      </div>
    </Lab>
  );
}
