"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChoiceCheck, Lab, LineGraph, Metrics, Sources } from './shared';

export type ActivityProps = {
  onProgress?: (done: boolean) => void;
};

// ─── 1. Geiger Random Decay – Phân rã ngẫu nhiên ────────────────────────────
export function GeigerRandomDecay({ onProgress }: ActivityProps) {
  const [counts, setCounts] = useState<number[]>([]);
  const [isCounting, setIsCounting] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [hasAnswered, setHasAnswered] = useState(false);
  const currentCountRef = useRef(0);

  const checkDone = useCallback((runs: number, ans: boolean) => {
    onProgress?.(runs >= 3 && ans);
  }, [onProgress]);

  useEffect(() => {
    if (!isCounting) return;
    if (timeLeft <= 0) {
      setCounts(prev => {
        const next = [...prev, currentCountRef.current];
        checkDone(next.length, hasAnswered);
        return next;
      });
      setIsCounting(false);
      return;
    }
    const id = setInterval(() => {
      const newDecays = Math.max(0, Math.round(2 + (Math.random() - 0.5) * 4));
      currentCountRef.current += newDecays;
      setCurrentCount(currentCountRef.current);
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isCounting, timeLeft, hasAnswered, checkDone]);

  const startCounting = () => {
    currentCountRef.current = 0;
    setTimeLeft(5);
    setCurrentCount(0);
    setIsCounting(true);
  };

  const sgkTable = [
    { interval: '0–5s', count: 1 }, { interval: '5–10s', count: 3 },
    { interval: '10–15s', count: 2 }, { interval: '15–20s', count: 0 },
    { interval: '20–25s', count: 3 }, { interval: '25–30s', count: 1 },
  ];
  const avg = counts.length > 0 ? (counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(1) : '—';

  function handleAnswered() {
    setHasAnswered(true);
    checkDone(counts.length, true);
  }

  return (
    <Lab
      intro="Mô phỏng máy đếm Geiger-Müller (Hình 23.2 SGK, trang 105). Đếm số tia phóng xạ trong các khoảng 5s và so sánh với Bảng 23.1 SGK."
      note="Số hạt phân rã trong mỗi khoảng 5s là ngẫu nhiên và có thể = 0. Bảng 23.1 SGK ghi nhận: 0–5s: 1 tia; 5–10s: 3 tia; 10–15s: 2 tia; 15–20s: 0 tia. Đây là bằng chứng thực nghiệm về tính ngẫu nhiên của phóng xạ."
    >
      <div className="physics-guide">
        <p><strong>🔬 Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Đếm:</strong> Bấm nút để bắt đầu đếm mô phỏng (5 giây). Lặp lại ít nhất 3 lần.</li>
          <li><strong>So sánh:</strong> So sánh kết quả của em với Bảng 23.1 SGK.</li>
          <li><strong>Giải thích:</strong> Vì sao mỗi lần kết quả khác nhau?</li>
        </ol>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div>
          <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
            Thí nghiệm của em (mô phỏng)
          </h4>
          <div className="physics-controls">
            <button type="button" className="physics-button primary" onClick={startCounting} disabled={isCounting}>
              {isCounting ? `Đang đếm... (${timeLeft}s còn lại)` : 'Bắt đầu đếm (5 giây)'}
            </button>
          </div>
          <div style={{ padding: '20px', backgroundColor: '#1e293b', color: '#4ade80', fontFamily: 'monospace', fontSize: '2.5rem', textAlign: 'center', borderRadius: '8px', border: '2px solid #334155', marginTop: '12px' }}>
            {currentCount} <span style={{ fontSize: '1rem' }}>đếm</span>
          </div>
          {counts.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600 }}>Bảng kết quả của em:</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {counts.map((c, i) => (
                  <span key={i} style={{ padding: '4px 12px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '4px', fontSize: '14px' }}>
                    Lần {i + 1}: <strong>{c}</strong>
                  </span>
                ))}
              </div>
              <p style={{ marginTop: '8px', fontSize: '14px' }}><strong>Trung bình:</strong> {avg} đếm/5s</p>
            </div>
          )}
        </div>
        <div>
          <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
            Bảng 23.1 – Dữ liệu thực từ SGK (trang 105)
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
                <th style={{ padding: '8px', border: '1px solid var(--border-light)', textAlign: 'left' }}>Khoảng t (s)</th>
                <th style={{ padding: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }}>Số tia</th>
              </tr>
            </thead>
            <tbody>
              {sgkTable.map((row) => (
                <tr key={row.interval} style={{ backgroundColor: row.count === 0 ? '#fef3c7' : 'inherit' }}>
                  <td style={{ padding: '8px', border: '1px solid var(--border-light)' }}>{row.interval}</td>
                  <td style={{ padding: '8px', border: '1px solid var(--border-light)', textAlign: 'center', fontWeight: row.count === 0 ? 700 : 400, color: row.count === 0 ? '#d97706' : 'inherit' }}>
                    {row.count} {row.count === 0 ? '← Không có tia nào!' : ''}
                  </td>
                </tr>
              ))}
              <tr style={{ backgroundColor: 'var(--bg-surface-elevated)', fontWeight: 600 }}>
                <td style={{ padding: '8px', border: '1px solid var(--border-light)' }}>Tổng 30s</td>
                <td style={{ padding: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }}>10 tia</td>
              </tr>
            </tbody>
          </table>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Trung bình: 10/6 ≈ 1,67 tia/5s. Lưu ý: khoảng 15–20s đếm được 0 tia!
          </p>
        </div>
      </div>

      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={counts.length >= 3 ? 'is-done' : ''}>Đếm ít nhất 3 lần ({counts.length}/3) {counts.length >= 3 ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi kiểm tra {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div onClickCapture={handleAnswered}>
        <ChoiceCheck
          question="Tại sao khoảng 15–20s trong Bảng 23.1 SGK đếm được 0 tia, mặc dù nguồn phóng xạ vẫn đang hoạt động?"
          options={[
            'Vì nguồn phóng xạ đã hết sau 15 giây.',
            'Vì phóng xạ là quá trình ngẫu nhiên – không có hạt nhân nào xảy ra phân rã trong đúng khoảng thời gian đó, dù trung bình vẫn có ~2 tia/5s.',
            'Vì máy đếm Geiger bị hỏng trong khoảng đó.',
          ]}
          correctIndex={1}
          explanation="Đây chính là bằng chứng thực nghiệm về tính ngẫu nhiên của phóng xạ. Không thể dự đoán CHÍNH XÁC số hạt nhân nào sẽ phân rã trong một khoảng thời gian ngắn – chỉ biết được giá trị TRUNG BÌNH của nhiều khoảng."
        />
      </div>
    </Lab>
  );
}

// ─── 2. Radiation Properties – So sánh α/β/γ ────────────────────────────────
type RayType = 'alpha' | 'beta_neg' | 'beta_pos' | 'gamma';

const RAY_INFO: Record<RayType, { label: string; color: string; charge: string; nature: string; field_deflection: string; penetration: string; stopped_by: string }> = {
  alpha: { label: 'Tia α', color: '#ef4444', charge: '+2e', nature: 'Hạt nhân ⁴He', field_deflection: 'Lệch về cực âm (bị hút bởi cực −)', penetration: 'Vài cm trong không khí', stopped_by: 'Tờ giấy hoặc da người' },
  beta_neg: { label: 'Tia β⁻', color: '#3b82f6', charge: '−e', nature: 'Electron (⁰₋₁e)', field_deflection: 'Lệch về cực dương (điện âm hút về +)', penetration: 'Vài mm nhôm', stopped_by: 'Tấm nhôm ~1mm' },
  beta_pos: { label: 'Tia β⁺', color: '#f59e0b', charge: '+e', nature: 'Positron (⁰₊₁e)', field_deflection: 'Lệch về cực âm (như α nhưng cong hơn)', penetration: 'Vài mm nhôm', stopped_by: 'Tấm nhôm ~1mm' },
  gamma: { label: 'Tia γ', color: '#10b981', charge: '0', nature: 'Bức xạ điện từ (sóng)', field_deflection: 'Không bị lệch (không mang điện)', penetration: 'Xuyên qua hầu hết vật liệu', stopped_by: 'Chì dày hoặc bê tông dày' },
};

export function RadiationProperties({ onProgress }: ActivityProps) {
  const [selected, setSelected] = useState<RayType>('alpha');
  const [viewedRays, setViewedRays] = useState<Set<RayType>>(new Set(['alpha']));
  const [hasAnswered, setHasAnswered] = useState(false);
  const info = RAY_INFO[selected];

  const checkDone = useCallback((viewed: Set<RayType>, ans: boolean) => {
    onProgress?.(viewed.size >= 3 && ans);
  }, [onProgress]);

  const handleSelectRay = (ray: RayType) => {
    setSelected(ray);
    setViewedRays(prev => {
      const next = new Set(prev);
      next.add(ray);
      checkDone(next, hasAnswered);
      return next;
    });
  };

  function handleAnswered() {
    setHasAnswered(true);
    checkDone(viewedRays, true);
  }

  const getDeflectionY = (ray: RayType) => {
    switch (ray) {
      case 'alpha': return 110;
      case 'beta_neg': return 55;
      case 'beta_pos': return 115;
      case 'gamma': return 80;
    }
  };
  const endY = getDeflectionY(selected);

  return (
    <Lab
      intro="Khảo sát tính chất đâm xuyên và lệch hướng của tia α, β, γ trong điện trường và qua vật cản. Chọn loại tia để xem Hình 23.3 và 23.4 (SGK trang 105–106) tương tác."
      note="Đây là mô hình giáo dục. Không thao tác với nguồn phóng xạ thật. Khả năng đâm xuyên và độ lệch chỉ mang tính định tính."
    >
      <div className="physics-guide">
        <p><strong>🔎 Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Chọn tia:</strong> Chuyển qua ít nhất 3 loại tia khác nhau.</li>
          <li><strong>So sánh:</strong> Quan sát hướng lệch trong điện trường và khả năng đâm xuyên.</li>
          <li><strong>Giải thích:</strong> Trả lời câu hỏi kiểm tra.</li>
        </ol>
      </div>

      <div className="physics-controls">
        {(Object.keys(RAY_INFO) as RayType[]).map((ray) => (
          <button
            key={ray}
            type="button"
            className={`physics-button ${selected === ray ? 'primary' : ''}`}
            onClick={() => handleSelectRay(ray)}
          >
            {RAY_INFO[ray].label} {viewedRays.has(ray) ? '✓' : ''}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '16px' }}>
        {/* Điện trường */}
        <div>
          <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Trong điện trường (Hình 23.3a SGK):</p>
          <svg viewBox="0 0 280 160" style={{ width: '100%', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            <title>Tia phóng xạ trong điện trường</title>
            <rect x="10" y="10" width="260" height="20" fill="#fca5a5" opacity={0.8} />
            <text x="140" y="24" textAnchor="middle" fontSize="11" fill="#7f1d1d">Cực + (dương)</text>
            <rect x="10" y="130" width="260" height="20" fill="#93c5fd" opacity={0.8} />
            <text x="140" y="145" textAnchor="middle" fontSize="11" fill="#1e3a8a">Cực − (âm)</text>
            <path
              d={`M 30 80 L 140 80 Q 200 80 240 ${endY}`}
              fill="none" stroke={info.color} strokeWidth={3}
              markerEnd="url(#arrow-rad-b23)"
            />
            <defs>
              <marker id="arrow-rad-b23" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={info.color} />
              </marker>
            </defs>
            <text x="35" y="74" fontSize="13" fontWeight="bold" fill={info.color}>{info.label}</text>
            <circle cx="28" cy="80" r="5" fill={info.color} />
          </svg>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Hướng lệch: <strong>{info.field_deflection}</strong>
          </p>
        </div>

        {/* Vật cản */}
        <div>
          <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Qua vật cản (Hình 23.4 SGK):</p>
          <svg viewBox="0 0 280 160" style={{ width: '100%', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            <title>Khả năng đâm xuyên</title>
            <rect x="80" y="20" width="8" height="120" fill="#d6b896" />
            <text x="84" y="155" textAnchor="middle" fontSize="10">Giấy</text>
            <rect x="130" y="20" width="16" height="120" fill="#9ca3af" />
            <text x="138" y="155" textAnchor="middle" fontSize="10">Nhôm</text>
            <rect x="190" y="20" width="24" height="120" fill="#4b5563" />
            <text x="202" y="155" textAnchor="middle" fontSize="10" fill="white">Chì</text>
            {selected === 'alpha' && <path d="M 10 80 L 78 80" fill="none" stroke={info.color} strokeWidth={3} />}
            {selected === 'alpha' && <text x="78" y="70" fontSize="12" fill={info.color}>✗</text>}
            {(selected === 'beta_neg' || selected === 'beta_pos') && <>
              <path d="M 10 80 L 128 80" fill="none" stroke={info.color} strokeWidth={3} />
              <text x="128" y="70" fontSize="12" fill={info.color}>✗</text>
            </>}
            {selected === 'gamma' && <>
              <path d="M 10 80 L 270 80" fill="none" stroke={info.color} strokeWidth={3} strokeDasharray="6 3" />
              <text x="250" y="70" fontSize="12" fill={info.color}>~</text>
            </>}
            <text x="30" y="74" fontSize="12" fontWeight="bold" fill={info.color}>{info.label}</text>
          </svg>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Bị chặn bởi: <strong>{info.stopped_by}</strong>
          </p>
        </div>
      </div>

      <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '8px', marginTop: '16px' }}>
        <p style={{ fontSize: '14px', fontWeight: 600, color: info.color }}>{info.label}</p>
        <p style={{ fontSize: '14px', marginTop: '4px' }}>Bản chất: <strong>{info.nature}</strong> | Điện tích: <strong>{info.charge}</strong></p>
        <p style={{ fontSize: '14px', marginTop: '4px' }}>Khả năng đâm xuyên: <strong>{info.penetration}</strong></p>
      </div>

      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={viewedRays.size >= 3 ? 'is-done' : ''}>Xem ít nhất 3 loại tia ({viewedRays.size}/3) {viewedRays.size >= 3 ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi kiểm tra {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div onClickCapture={handleAnswered}>
        <ChoiceCheck
          question="Trong điện trường (Hình 23.3a SGK), tia nào bị lệch về phía cực DƯƠNG?"
          options={['Tia alpha (α)', 'Tia beta trừ (β⁻)', 'Tia gamma (γ)']}
          correctIndex={1}
          explanation="Tia β⁻ mang điện tích âm (−e). Điện trường tác dụng lực hút về phía cực dương (+). Tia α và β⁺ mang điện dương nên bị đẩy về phía cực âm. Tia γ không mang điện nên đi thẳng."
        />
      </div>
    </Lab>
  );
}

// ─── 3. Radioactive Decay Half-Life – Đồ thị bán rã tương tác ───────────────
export function RadioactiveDecayHalfLife({ onProgress }: ActivityProps) {
  const [t12, setT12] = useState(30);
  const [n0, setN0] = useState(1000);
  const [hasChanged, setHasChanged] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const checkDone = useCallback((changed: boolean, ans: boolean) => {
    onProgress?.(changed && ans);
  }, [onProgress]);

  const maxT = t12 * 6;
  const points = Array.from({ length: 61 }, (_, i) => {
    const t = (maxT * i) / 60;
    return { x: t, y: n0 * Math.pow(2, -t / t12) };
  });

  const halfPoints = [0, 1, 2, 3, 4, 5].map(k => ({
    x: k * t12,
    y: n0 / Math.pow(2, k),
  }));

  function handleSliderChange(setter: (v: number) => void, val: number) {
    setter(val);
    if (!hasChanged) {
      setHasChanged(true);
      checkDone(true, hasAnswered);
    }
  }

  function handleAnswered() {
    setHasAnswered(true);
    checkDone(hasChanged, true);
  }

  return (
    <Lab
      intro="Khảo sát định luật phóng xạ: N_t = N₀ × 2^(−t/T). Thay đổi chu kì bán rã T và số hạt ban đầu N₀ để xem đường cong thay đổi."
      note="Mô phỏng tuân theo N_t = N₀ × 2^(−t/T) = N₀ × e^(−λt), với λ = ln2/T. Độ phóng xạ H = λ × N cũng giảm theo cùng quy luật hàm mũ (Hình 23.5, SGK trang 107)."
    >
      <div className="physics-guide">
        <p><strong>📈 Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Thay đổi T:</strong> Kéo thanh trượt để xem đường cong phân rã thay đổi.</li>
          <li><strong>Quan sát:</strong> Sau mỗi chu kì T, số hạt giảm bao nhiêu phần trăm?</li>
          <li><strong>Giải thích:</strong> Khi T tăng gấp đôi thì đường cong như thế nào?</li>
        </ol>
      </div>

      <div className="physics-controls">
        <label className="physics-field">
          <span>Chu kì bán rã T <strong>{t12} s</strong></span>
          <input type="range" min={5} max={120} step={5} value={t12} onChange={e => handleSliderChange(setT12, Number(e.target.value))} />
        </label>
        <label className="physics-field">
          <span>Số hạt ban đầu N₀ <strong>{n0}</strong></span>
          <input type="range" min={100} max={10000} step={100} value={n0} onChange={e => handleSliderChange(setN0, Number(e.target.value))} />
        </label>
      </div>

      <LineGraph
        series={[{ label: `N(t) = ${n0} × 2^(−t/${t12})`, color: '#2357a5', points, dots: false }]}
        maxX={maxT}
        maxY={n0}
        xLabel={`Thời gian t (s), T = ${t12}s`}
        yLabel="Số hạt nhân N"
      />

      <div style={{ marginTop: '16px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
              <th style={{ padding: '8px', border: '1px solid var(--border-light)', textAlign: 'left' }}>Sau k chu kì (t = kT)</th>
              <th style={{ padding: '8px', border: '1px solid var(--border-light)', textAlign: 'right' }}>t (s)</th>
              <th style={{ padding: '8px', border: '1px solid var(--border-light)', textAlign: 'right' }}>N còn lại</th>
              <th style={{ padding: '8px', border: '1px solid var(--border-light)', textAlign: 'right' }}>% N₀</th>
            </tr>
          </thead>
          <tbody>
            {halfPoints.map((pt, k) => (
              <tr key={k}>
                <td style={{ padding: '8px', border: '1px solid var(--border-light)' }}>k = {k}</td>
                <td style={{ padding: '8px', border: '1px solid var(--border-light)', textAlign: 'right' }}>{pt.x.toFixed(0)}</td>
                <td style={{ padding: '8px', border: '1px solid var(--border-light)', textAlign: 'right' }}>{pt.y.toFixed(1)}</td>
                <td style={{ padding: '8px', border: '1px solid var(--border-light)', textAlign: 'right' }}>{(100 / Math.pow(2, k)).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Metrics items={[
        { label: 'Chu kì bán rã T', value: `${t12} s` },
        { label: 'Hằng số phóng xạ λ = ln2/T', value: `${(0.693 / t12).toFixed(4)} s⁻¹` },
        { label: 'Sau 3T còn lại', value: `${(n0 / 8).toFixed(1)} hạt (12,5%)` },
      ]} />

      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={hasChanged ? 'is-done' : ''}>Thay đổi T hoặc N₀ để quan sát đường cong {hasChanged ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi kiểm tra {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div onClickCapture={handleAnswered}>
        <ChoiceCheck
          question="Nếu chu kì bán rã T tăng gấp đôi (với cùng N₀), đường cong phân rã thay đổi thế nào?"
          options={[
            'Dốc hơn – phân rã nhanh hơn.',
            'Thoải hơn – phân rã chậm hơn, hạt nhân bền vững hơn.',
            'Hình dạng không đổi, chỉ thay đổi màu.',
          ]}
          correctIndex={1}
          explanation="T lớn hơn → hằng số phóng xạ λ = ln2/T nhỏ hơn → tốc độ phân rã chậm hơn → đường cong thoải hơn. Ví dụ: ²³⁵U (T = 7×10⁸ năm) phân rã chậm hơn nhiều so với ²¹⁰Po (T = 140 ngày)."
        />
      </div>
    </Lab>
  );
}

// ─── 4. Carbon-14 Dating – Tính tuổi bằng C-14 ─────────────────────────────
const T14C = 5730; // năm

export function Carbon14Dating({ onProgress }: ActivityProps) {
  const [ratio, setRatio] = useState(50);
  const [hasUsedExample, setHasUsedExample] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const checkDone = useCallback((example: boolean, ans: boolean) => {
    onProgress?.(example && ans);
  }, [onProgress]);

  const age = ratio > 0 && ratio <= 100
    ? (T14C * Math.log2(100 / ratio)).toFixed(0)
    : '—';

  const examples = [
    { name: 'Xương người Thạch Lam', ratio: 25, context: 'Mẫu cổ học Việt Nam' },
    { name: 'Gỗ quan tài Ai Cập', ratio: 50, context: 'Thời kỳ Vương quốc Cũ' },
    { name: 'Than củi Hang động Lascaux', ratio: 12.5, context: 'Tranh vẽ hang động Pháp' },
    { name: 'Cuộn giấy Biển Chết', ratio: 75, context: 'Bản thảo cổ đại' },
  ];

  function handleExample(r: number) {
    setRatio(r);
    setHasUsedExample(true);
    checkDone(true, hasAnswered);
  }

  function handleAnswered() {
    setHasAnswered(true);
    checkDone(hasUsedExample, true);
  }

  return (
    <Lab
      intro="Ứng dụng định tuổi bằng đồng vị Carbon-14 (¹⁴C). Công thức: t = T × log₂(100/%) với T = 5730 năm."
      note="Sinh vật sống liên tục hấp thụ ¹⁴C từ CO₂ không khí, duy trì tỉ lệ ¹⁴C/¹²C ≈ 10⁻¹²:1. Sau khi chết, ¹⁴C phân rã β⁻ (T = 5730 năm). Phương pháp do Willard Libby phát triển, đoạt Nobel 1960."
    >
      <div className="physics-guide">
        <p><strong>📅 Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Thử:</strong> Kéo thanh trượt hoặc bấm ví dụ thực tế để xem tuổi mẫu.</li>
          <li><strong>Quan sát:</strong> Công thức tính tuổi hoạt động như thế nào.</li>
          <li><strong>Giải thích:</strong> 25% C-14 còn lại tương đương mấy chu kì?</li>
        </ol>
      </div>

      <div className="physics-controls">
        <label className="physics-field">
          <span>Tỉ lệ ¹⁴C còn lại so với mẫu sống <strong>{ratio}%</strong></span>
          <input type="range" min={1} max={100} step={1} value={ratio} onChange={e => setRatio(Number(e.target.value))} />
        </label>
      </div>

      <div style={{ padding: '20px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '8px', textAlign: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          t = T × log₂(100/{ratio}) = {T14C} × log₂({(100 / ratio).toFixed(2)}) ≈
        </p>
        <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          {Number(age).toLocaleString('vi-VN')} năm
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          ≈ {Math.round(Number(age) / T14C * 10) / 10} chu kì bán rã
        </p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Ví dụ thực tế (click để xem):</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {examples.map((ex) => (
            <button
              key={ex.name}
              type="button"
              className="physics-button"
              onClick={() => handleExample(ex.ratio)}
              style={{ fontSize: '13px' }}
            >
              {ex.name} ({ex.ratio}%)
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
              <th style={{ padding: '8px', border: '1px solid var(--border-light)', textAlign: 'left' }}>¹⁴C còn lại</th>
              <th style={{ padding: '8px', border: '1px solid var(--border-light)', textAlign: 'left' }}>Tuổi ước tính</th>
              <th style={{ padding: '8px', border: '1px solid var(--border-light)', textAlign: 'left' }}>Thời kỳ lịch sử</th>
            </tr>
          </thead>
          <tbody>
            {[{r: 100, label: 'Mẫu sống', era: '—'}, {r: 75, label: '2 378 năm', era: 'Thời Hy Lạp cổ đại'}, {r: 50, label: '5 730 năm', era: 'Kỳ đồ đá mới'}, {r: 25, label: '11 460 năm', era: 'Cuối kỷ băng hà'}, {r: 12.5, label: '17 190 năm', era: 'Kỷ băng hà đỉnh điểm'}, {r: 1, label: '≈ 37 900 năm', era: 'Homo sapiens sớm'}].map(row => (
              <tr key={row.r} style={{ backgroundColor: ratio === row.r ? '#dbeafe' : 'inherit' }}>
                <td style={{ padding: '8px', border: '1px solid var(--border-light)' }}>{row.r}%</td>
                <td style={{ padding: '8px', border: '1px solid var(--border-light)' }}>{row.label}</td>
                <td style={{ padding: '8px', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>{row.era}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={hasUsedExample ? 'is-done' : ''}>Thử ít nhất 1 ví dụ thực tế {hasUsedExample ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi kiểm tra {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div onClickCapture={handleAnswered}>
        <ChoiceCheck
          question="Mẫu gỗ cổ có tỉ lệ ¹⁴C còn lại bằng 25% (= 1/4) so với gỗ tươi. Tuổi của mẫu gỗ là?"
          options={['5730 năm (1 chu kì).', '11460 năm (2 chu kì).', '17190 năm (3 chu kì).']}
          correctIndex={1}
          explanation="25% = (1/2)² → giảm còn 1/4 tương đương 2 chu kì bán rã → t = 2 × 5730 = 11460 năm."
        />
      </div>
      <Sources links={[{ label: 'Radiocarbon dating – NOAA', url: 'https://www.ncei.noaa.gov/news/what-is-radiocarbon-dating' }]} />
    </Lab>
  );
}

// ─── 5. Radiation Safety – An toàn bức xạ ────────────────────────────────────
type Scenario = 'lab' | 'hospital' | 'transport';

const SCENARIOS: Record<Scenario, { title: string; description: string; dose: number; recommendations: string[] }> = {
  lab: {
    title: 'Phòng thí nghiệm phóng xạ',
    description: 'Bạn cần làm việc gần nguồn phóng xạ ¹³¹I (10 MBq). Nguồn đặt trên bàn ở khoảng cách 50 cm.',
    dose: 70,
    recommendations: ['Mặc áo chì bảo vệ thân', 'Đứng cách nguồn ít nhất 2m', 'Làm việc nhanh (< 30 phút/ngày)', 'Dùng kẹp dài để cầm nguồn', 'Không ăn uống trong phòng'],
  },
  hospital: {
    title: 'Phòng bệnh nhân xạ trị',
    description: 'Bệnh nhân vừa được uống ¹³¹I để điều trị tuyến giáp (150 MBq). Bạn là y tá.',
    dose: 85,
    recommendations: ['Vào phòng < 30 phút/lần', 'Đứng cách giường ít nhất 1m khi có thể', 'Rửa tay kỹ sau khi tiếp xúc', 'Không ôm ấp bệnh nhân trong 24h đầu', 'Ghi nhận thời gian tiếp xúc'],
  },
  transport: {
    title: 'Vận chuyển nguồn phóng xạ',
    description: 'Lái xe chở hộp chứa nguồn Cs-137 (hộp che chắn bằng chì).',
    dose: 20,
    recommendations: ['Không mở hộp chứa nguồn', 'Ngồi cách hộp xa nhất có thể', 'Vận chuyển thẳng, không dừng tùy tiện', 'Mang theo tài liệu vận chuyển và SĐT khẩn cấp', 'Gọi 19009011 (VARANS) nếu có sự cố'],
  },
};

export function RadiationSafety({ onProgress }: ActivityProps) {
  const [scenario, setScenario] = useState<Scenario>('lab');
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [triedScenarios, setTriedScenarios] = useState<Set<Scenario>>(new Set(['lab']));
  const [hasAnswered, setHasAnswered] = useState(false);
  const info = SCENARIOS[scenario];

  const checkDone = useCallback((tried: Set<Scenario>, ans: boolean) => {
    onProgress?.(tried.size >= 2 && ans);
  }, [onProgress]);

  const toggleCheck = (i: number) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const handleScenarioChange = (s: Scenario) => {
    setScenario(s);
    setCheckedItems(new Set());
    setTriedScenarios(prev => {
      const next = new Set(prev);
      next.add(s);
      checkDone(next, hasAnswered);
      return next;
    });
  };

  function handleAnswered() {
    setHasAnswered(true);
    checkDone(triedScenarios, true);
  }

  const safetyScore = Math.round((checkedItems.size / info.recommendations.length) * 100);

  return (
    <Lab
      intro="An toàn bức xạ (trang 110–111 SGK). Ba nguyên tắc cốt lõi: (1) Khoảng cách – (2) Che chắn – (3) Thời gian phơi nhiễm tối thiểu."
      note="Đây là mô hình giáo dục. Không thao tác với nguồn phóng xạ thật nếu chưa được đào tạo và cấp phép."
    >
      <div className="physics-guide">
        <p><strong>🛡️ Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Chọn tình huống:</strong> Thử ít nhất 2 trong 3 tình huống.</li>
          <li><strong>Đánh giá:</strong> Chọn các biện pháp bảo vệ phù hợp.</li>
          <li><strong>Kiến thức:</strong> Trả lời câu hỏi về nguyên tắc ALARA.</li>
        </ol>
      </div>

      <div className="physics-controls">
        {(Object.keys(SCENARIOS) as Scenario[]).map((s) => (
          <button
            key={s}
            type="button"
            className={`physics-button ${scenario === s ? 'primary' : ''}`}
            onClick={() => handleScenarioChange(s)}
          >
            {SCENARIOS[s].title} {triedScenarios.has(s) ? '✓' : ''}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px', backgroundColor: '#fef9c3', border: '2px solid #fbbf24', borderRadius: '8px', marginTop: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <svg viewBox="0 0 80 80" width="64" height="64" style={{ flexShrink: 0 }}>
          <title>Biển cảnh báo phóng xạ quốc tế</title>
          <circle cx="40" cy="40" r="38" fill="#f59e0b" />
          <circle cx="40" cy="40" r="10" fill="#000" />
          {[0, 120, 240].map((deg) => (
            <g key={deg} transform={`rotate(${deg}, 40, 40)`}>
              <path d={`M40 ${40 - 12} A12 12 0 0 1 ${40 + 10.4} ${40 + 6} L ${40 + 24} ${40 + 13.9} A28 28 0 0 0 40 ${40 - 28} Z`} fill="#000" />
            </g>
          ))}
          <text x="40" y="72" textAnchor="middle" fontSize="9" fill="#000" fontWeight="bold">☢ PHÓNG XẠ</text>
        </svg>
        <div>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>{info.title}</p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{info.description}</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>Chỉ số nguy cơ tương đối: <strong>{info.dose}/100</strong></p>
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Chọn các biện pháp bảo vệ phù hợp:</p>
        {info.recommendations.map((rec, i) => (
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', marginBottom: '6px', backgroundColor: checkedItems.has(i) ? 'var(--semantic-success-light, #dcfce7)' : 'var(--bg-surface-elevated)', borderRadius: '6px', cursor: 'pointer', border: `1px solid ${checkedItems.has(i) ? '#86efac' : 'var(--border-light)'}` }}>
            <input type="checkbox" checked={checkedItems.has(i)} onChange={() => toggleCheck(i)} />
            <span style={{ fontSize: '14px' }}>{rec}</span>
          </label>
        ))}
        {checkedItems.size > 0 && (
          <div style={{ padding: '12px', backgroundColor: safetyScore >= 80 ? '#dcfce7' : '#fef3c7', borderRadius: '6px', marginTop: '8px' }}>
            <strong>Điểm an toàn: {safetyScore}%</strong> – {safetyScore >= 80 ? '✓ Tốt! Em đã áp dụng hầu hết biện pháp cần thiết.' : '⚠️ Hãy chọn thêm các biện pháp bảo vệ.'}
          </div>
        )}
      </div>

      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={triedScenarios.size >= 2 ? 'is-done' : ''}>Thử ít nhất 2 tình huống ({triedScenarios.size}/2) {triedScenarios.size >= 2 ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi kiểm tra {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div onClickCapture={handleAnswered}>
        <ChoiceCheck
          question="Theo nguyên tắc ALARA, ba biện pháp giảm phơi nhiễm phóng xạ là gì?"
          options={[
            'Che chắn bằng chì, giữ nhiệt độ thấp, mặc quần áo dày.',
            'Tăng khoảng cách, giảm thời gian tiếp xúc, sử dụng vật che chắn.',
            'Rửa tay thường xuyên, uống nhiều nước, ngủ đủ giấc.',
          ]}
          correctIndex={1}
          explanation="Ba nguyên tắc ALARA: (1) Khoảng cách – cường độ tia giảm theo 1/r²; (2) Thời gian – giảm tổng liều = giảm thời gian tiếp xúc; (3) Che chắn – dùng vật liệu phù hợp (chì, bê tông). Đây là nguyên tắc được nêu trong SGK trang 110–111."
        />
      </div>
    </Lab>
  );
}
