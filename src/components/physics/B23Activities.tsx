"use client";

import { LatexMath } from "@/components/learning/LatexMath";

import { useCallback, useEffect, useRef, useState } from 'react';
import { poissonCount } from "@/lib/physics";
import { ChoiceCheck, Lab, Sources } from './shared';

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
      const newDecays = poissonCount(0.4);
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

  function handleAnswered(correct: boolean) {
    setHasAnswered(correct);
    checkDone(counts.length, correct);
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

      <div>
        <ChoiceCheck onResult={handleAnswered}
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

  function handleAnswered(correct: boolean) {
    setHasAnswered(correct);
    checkDone(viewedRays, correct);
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

      <div>
        <ChoiceCheck onResult={handleAnswered}
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
export { DecayProcessLab as RadioactiveDecayHalfLife } from "./DecayProcessLab";

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

  function handleAnswered(correct: boolean) {
    setHasAnswered(correct);
    checkDone(hasUsedExample, correct);
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
        <LatexMath block math={String.raw`t=T\log_2\!\left(\frac{100}{${ratio}}\right)`} />
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

      <div>
        <ChoiceCheck onResult={handleAnswered}
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

  function handleAnswered(correct: boolean) {
    setHasAnswered(correct);
    checkDone(triedScenarios, correct);
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

      <div>
        <ChoiceCheck onResult={handleAnswered}
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

// ─── 5. Safety Principles – Ba nguyên tắc: thời gian – khoảng cách – che chắn ─
type ShieldType = 'none' | 'wood' | 'aluminum' | 'lead';

const SHIELD_OPT: Record<ShieldType, { label: string; factor: number; desc: string }> = {
  none: { label: 'Không che chắn', factor: 1.0, desc: 'Không suy giảm' },
  wood: { label: 'Gỗ 5 cm', factor: 0.6, desc: 'Giảm khoảng 40%' },
  aluminum: { label: 'Nhôm 3 mm', factor: 0.25, desc: 'Giảm khoảng 75%' },
  lead: { label: 'Chì 5 mm', factor: 0.05, desc: 'Giảm khoảng 95%' },
};

// Mô hình định lượng minh họa: liều tại 1 m, không che chắn, phơi 1 giờ = 100 đơn vị tương đối.
const SAFETY_BASE_RATE = 100;

export function SafetyPrinciples({ onProgress }: ActivityProps) {
  const [distance, setDistance] = useState(1.0);
  const [timeMin, setTimeMin] = useState(60);
  const [shield, setShield] = useState<ShieldType>('none');
  const [hasAnswered, setHasAnswered] = useState(false);

  const rate = SAFETY_BASE_RATE / (distance * distance);
  const shieldedRate = rate * SHIELD_OPT[shield].factor;
  const totalDose = shieldedRate * (timeMin / 60);
  const doseColor = (v: number) => (v <= 5 ? '#16a34a' : v <= 25 ? '#d97706' : '#dc2626');
  const barWidth = (v: number, max: number) => `${Math.min(v / max, 1) * 100}%`;

  function handleAnswered(correct: boolean) {
    setHasAnswered(correct);
    onProgress?.(correct);
  }

  return (
    <Lab
      intro="Ba nguyên tắc an toàn phóng xạ (SGK trang 110–111): KHOẢNG CÁCH — THỜI GIAN — CHE CHẮN. Điều chỉnh cả ba yếu tố và quan sát liều hấp thụ tổng cộng thay đổi thế nào."
      note="Liều ở đây là đơn vị tương đối để minh họa nguyên lí, không phải giá trị liều thực tế theo Sv. Ba nguyên tắc này cấu thành nguyên tắc ALARA (As Low As Reasonably Achievable)."
    >
      <div style={{ display: 'grid', gap: '14px', marginBottom: '16px' }}>
        <label className="physics-field">
          <span><strong>1. Khoảng cách</strong> — r = <strong>{distance.toFixed(1)} m</strong> (cường độ giảm theo 1/r²)</span>
          <input type="range" min={0.5} max={10} step={0.5} value={distance} onChange={(e) => setDistance(Number(e.target.value))} />
        </label>
        <label className="physics-field">
          <span><strong>2. Thời gian</strong> — t = <strong>{timeMin} phút</strong> (liều tổng tỉ lệ thuận với thời gian phơi nhiễm)</span>
          <input type="range" min={5} max={480} step={5} value={timeMin} onChange={(e) => setTimeMin(Number(e.target.value))} />
        </label>
        <div>
          <p style={{ fontSize: '14px', marginBottom: '8px' }}><strong>3. Che chắn</strong> — chọn vật liệu:</p>
          <div className="physics-controls" style={{ flexWrap: 'wrap' }}>
            {(Object.keys(SHIELD_OPT) as ShieldType[]).map((s) => (
              <button key={s} type="button" className={`physics-button ${shield === s ? 'primary' : ''}`} onClick={() => setShield(s)} style={{ fontSize: '13px' }}>
                {SHIELD_OPT[s].label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Sơ đồ minh họa: nguồn – vật chắn – người, khoảng cách biến thiên */}
      <svg viewBox="0 0 420 130" role="img" aria-label="Sơ đồ minh họa khoảng cách và che chắn" style={{ width: '100%', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: '#f8fafc', marginBottom: '16px' }}>
        <title>Nguồn phóng xạ, vật che chắn và người ở khoảng cách r</title>
        <circle cx="40" cy="60" r="18" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
        <text x="40" y="56" textAnchor="middle" fontSize="14" fill="#78350f">☢</text>
        <text x="40" y="96" textAnchor="middle" fontSize="10" fill="#78350f">Nguồn</text>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i - 2) * 0.22;
          // Làm tròn để SSR và client sinh cùng chuỗi số (tránh lệch hydration)
          const x2 = Number((58 + Math.cos(a) * 46).toFixed(2));
          const y2 = Number((60 + Math.sin(a) * 46).toFixed(2));
          return (
            <line key={i} x1={58} y1={60} x2={x2} y2={y2}
              stroke="#f59e0b" strokeWidth={Number(Math.max(0.5, 2.4 - distance * 0.18).toFixed(2))} opacity={Number(Math.max(0.15, 0.75 - distance * 0.055).toFixed(2))} />
          );
        })}
        {shield !== 'none' && (
          <>
            <rect x="104" y="14" width={shield === 'lead' ? 20 : 14} height="92" rx="2"
              fill={shield === 'lead' ? '#374151' : shield === 'aluminum' ? '#9ca3af' : '#b45309'} opacity={0.9} />
            <text x={shield === 'lead' ? 114 : 111} y="120" textAnchor="middle" fontSize="9" fill="#374151">{SHIELD_OPT[shield].label}</text>
          </>
        )}
        {(() => {
          const px = 130 + Math.min((distance - 0.5) * 26, 250);
          const beamStart = shield === 'none' ? 58 : shield === 'lead' ? 124 : 118;
          return (
            <>
              <line x1={beamStart} y1={60} x2={px - 14} y2={60} stroke="#ef4444" strokeWidth={Math.max(0.6, 3 * SHIELD_OPT[shield].factor * (1 / distance))} opacity={Math.max(0.15, SHIELD_OPT[shield].factor / distance)} />
              <rect x={px - 7} y={44} width="14" height="24" rx="3" fill="#2563eb" />
              <circle cx={px} cy={38} r="8" fill="#fde68a" stroke="#b45309" strokeWidth="1.5" />
              <line x1={px - 10} y1={70} x2={px - 10} y2="84" stroke="#2563eb" strokeWidth="2.5" />
              <line x1={px + 10} y1={70} x2={px + 10} y2="84" stroke="#2563eb" strokeWidth="2.5" />
              <line x1="40" y1="106" x2={px} y2="106" stroke="#6b7280" strokeWidth="1" />
              <line x1="40" y1="102" x2="40" y2="110" stroke="#6b7280" strokeWidth="1" />
              <line x1={px} y1="102" x2={px} y2="110" stroke="#6b7280" strokeWidth="1" />
              <text x={(40 + px) / 2} y="117" textAnchor="middle" fontSize="10" fill="#374151">r = {distance.toFixed(1)} m</text>
            </>
          );
        })()}
      </svg>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Cường độ tại vị trí', value: rate.toFixed(1), unit: 'đv/giờ', max: 100 },
          { label: `Sau che chắn (${SHIELD_OPT[shield].label})`, value: shieldedRate.toFixed(1), unit: 'đv/giờ', max: 100 },
          { label: `Liều tổng trong ${timeMin} phút`, value: totalDose.toFixed(1), unit: 'đv', max: 400 },
        ].map((m) => (
          <div key={m.label} style={{ padding: '12px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{m.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: doseColor(m.max === 400 ? totalDose : Number(m.value)) }}>
              {m.value} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>{m.unit}</span>
            </p>
            <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: barWidth(Number(m.value), m.max), backgroundColor: doseColor(m.max === 400 ? totalDose : Number(m.value)), transition: 'width .3s' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px', marginTop: '12px', fontSize: '13px', color: '#334155', lineHeight: 1.8 }}>
        <div>Cường độ: 100 ÷ {distance.toFixed(1)}² = <strong>{rate.toFixed(1)}</strong> đv/giờ</div>
        <div>Che chắn: {rate.toFixed(1)} × {SHIELD_OPT[shield].factor} = <strong>{shieldedRate.toFixed(1)}</strong> đv/giờ</div>
        <div>Liều tổng: {shieldedRate.toFixed(1)} × {(timeMin / 60).toFixed(2)} giờ = <strong style={{ color: doseColor(totalDose) }}>{totalDose.toFixed(1)}</strong> đv</div>
      </div>
      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={totalDose <= 5 ? 'is-done' : ''}>Điều chỉnh ba yếu tố để liều tổng ≤ 5 đv {totalDose <= 5 ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi kiểm tra {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div>
        <ChoiceCheck onResult={handleAnswered}
          question="Một kĩ thuật viên đứng cách nguồn 2 m trong 4 giờ. Cách nào giảm liều hấp thụ NHIỀU NHẤT nếu chỉ được chọn một biện pháp?"
          options={[
            'Tăng thời gian nghỉ giải lao nhưng vẫn ở đủ 4 giờ trong phòng.',
            'Lùi ra xa để khoảng cách tới nguồn tăng từ 2 m lên 4 m.',
            'Mặc thêm một lớp áo dài tay bên ngoài.',
          ]}
          correctIndex={1}
          explanation="Khoảng cách từ nguồn điểm cho cường độ I ∝ 1/r². Tăng r từ 2 m lên 4 m làm cường độ giảm 4 lần — hiệu quả hơn hẳn việc mặc thêm áo (không chặn được tia phóng xạ). Giảm thời gian phơi nhiễm cũng hiệu quả, nhưng ở đây người đó vẫn ở đủ 4 giờ. Vì vậy tăng khoảng cách là biện pháp mạnh nhất trong ba lựa chọn này."
        />
      </div>
    </Lab>
  );
}
