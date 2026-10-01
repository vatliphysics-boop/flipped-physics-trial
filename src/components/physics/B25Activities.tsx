"use client";

import { useState, useCallback } from 'react';
import { ChoiceCheck, Lab, LineGraph, Metrics, NuclearSymbol } from './shared';

export type ActivityProps = {
  onProgress?: (done: boolean) => void;
};

// ─── Dữ liệu từ Bảng 25.1 SGK trang 121 ────────────────────────────────────
const SGK_TABLE_25_1 = [
  { t: 0, h: 151 }, { t: 30, h: 85 }, { t: 60, h: 55 },
  { t: 120, h: 31 }, { t: 180, h: 22 }, { t: 240, h: 15 },
  { t: 300, h: 11 }, { t: 360, h: 9 },
];

// ─── Sub-lab 1: Đồ thị H(t) – Bảng 25.1 SGK ────────────────────────────────
function DecayGraphLab({ onSubDone }: { onSubDone: (done: boolean) => void }) {
  const [showFit, setShowFit] = useState(false);
  const [userT, setUserT] = useState(60);
  const [hasAnswered, setHasAnswered] = useState(false);

  const checkSubDone = useCallback((fit: boolean, ans: boolean) => {
    onSubDone(fit && ans);
  }, [onSubDone]);

  const sgkPoints = SGK_TABLE_25_1.map(d => ({ x: d.t, y: d.h }));
  const fitPoints = SGK_TABLE_25_1.map(d => ({ x: d.t, y: 151 * Math.pow(2, -d.t / userT) }));

  function handleShowFit() {
    setShowFit(f => {
      const next = !f;
      if (next) checkSubDone(true, hasAnswered);
      return next;
    });
  }

  function handleAnswered() {
    setHasAnswered(true);
    checkSubDone(showFit, true);
  }

  return (
    <Lab
      intro="Phân tích đồ thị H(t) từ Bảng 25.1 SGK (trang 121). Vẽ đường cong lí thuyết H = H₀ × 2^(−t/T) và điều chỉnh T để khớp với dữ liệu."
      note="H₀ = 151 Bq → H₀/2 ≈ 75,5 Bq. Nhìn bảng: H(30s) = 85 > 75,5 và H(60s) = 55 < 75,5, nên T nằm trong khoảng 30–60 giây."
    >
      <div className="physics-controls">
        <label className="physics-field">
          <span>T ước lượng của em <strong>{userT} s</strong></span>
          <input type="range" min={10} max={120} step={2} value={userT} onChange={e => setUserT(Number(e.target.value))} />
        </label>
        <button type="button" className="physics-button primary" onClick={handleShowFit}>
          {showFit ? 'Ẩn đường lí thuyết' : 'Hiện đường lí thuyết H = 151 × 2^(−t/T)'}
        </button>
      </div>

      <LineGraph
        series={[
          { label: 'Dữ liệu Bảng 25.1 SGK (điểm thực nghiệm)', color: '#2357a5', points: sgkPoints, dots: true },
          ...(showFit ? [{ label: `Đường lí thuyết T = ${userT}s`, color: '#ef4444', points: fitPoints, dots: false }] : []),
        ]}
        maxX={360}
        maxY={160}
        xLabel="Thời gian t (giây)"
        yLabel="Độ phóng xạ H (Bq)"
      />

      <div style={{ overflowX: 'auto', marginTop: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
              <th style={{ padding: '8px', border: '1px solid var(--border-light)' }}>t (s)</th>
              {SGK_TABLE_25_1.map(d => <th key={d.t} style={{ padding: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }}>{d.t}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px', border: '1px solid var(--border-light)', fontWeight: 600 }}>H (Bq) – SGK</td>
              {SGK_TABLE_25_1.map(d => <td key={d.t} style={{ padding: '8px', border: '1px solid var(--border-light)', textAlign: 'center', fontWeight: 600 }}>{d.h}</td>)}
            </tr>
            {showFit && <tr>
              <td style={{ padding: '8px', border: '1px solid var(--border-light)', fontWeight: 600, color: '#ef4444' }}>H lí thuyết (T={userT}s)</td>
              {SGK_TABLE_25_1.map(d => {
                const theoretical = Math.round(151 * Math.pow(2, -d.t / userT));
                const error = Math.abs(d.h - theoretical);
                return <td key={d.t} style={{ padding: '8px', border: '1px solid var(--border-light)', textAlign: 'center', color: '#ef4444', backgroundColor: error > 20 ? '#fee2e2' : 'inherit' }}>{theoretical}</td>;
              })}
            </tr>}
          </tbody>
        </table>
      </div>

      <Metrics items={[
        { label: 'T em chọn', value: `${userT} s` },
        { label: 'λ = ln2/T', value: `${(0.693 / userT).toFixed(4)} s⁻¹` },
        { label: 'H₀/2 = 75,5 Bq → T nằm trong khoảng', value: '30–60 giây (từ bảng SGK)' },
      ]} />

      <div onClickCapture={handleAnswered}>
        <ChoiceCheck
          question="Khi T = 52s, H(30s) lí thuyết ≈ 88 Bq. Giá trị thực tế trong Bảng 25.1 SGK là 85 Bq. Sai số này nói lên điều gì?"
          options={[
            'Bảng 25.1 SGK có số liệu sai.',
            'Số liệu thực nghiệm có sai số ngẫu nhiên do tính chất xác suất của phân rã – điều này hoàn toàn bình thường.',
            'Chu kì bán rã thay đổi theo thời gian.',
          ]}
          correctIndex={1}
          explanation="Phân rã phóng xạ là quá trình ngẫu nhiên. Định luật phóng xạ mô tả GIÁ TRỊ TRUNG BÌNH, không phải mỗi kết quả đơn lẻ."
        />
      </div>
    </Lab>
  );
}

// ─── Sub-lab 2: Cân bằng phương trình phân rã ────────────────────────────────
function NuclearEquationBalancer({ onSubDone }: { onSubDone: (done: boolean) => void }) {
  type Mode = 'alpha' | 'beta_neg' | 'beta_pos';
  const [mode, setMode] = useState<Mode>('alpha');
  const [parentA, setParentA] = useState(238);
  const [parentZ, setParentZ] = useState(92);
  const [userDaughterA, setUserDaughterA] = useState(234);
  const [userDaughterZ, setUserDaughterZ] = useState(90);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const MODES: { key: Mode; label: string; particleA: number; particleZ: number; particleName: string }[] = [
    { key: 'alpha', label: 'Phân rã α', particleA: 4, particleZ: 2, particleName: '⁴₂He' },
    { key: 'beta_neg', label: 'Phân rã β⁻', particleA: 0, particleZ: -1, particleName: '⁰₋₁e' },
    { key: 'beta_pos', label: 'Phân rã β⁺', particleA: 0, particleZ: 1, particleName: '⁰₊₁e' },
  ];

  const currentMode = MODES.find(m => m.key === mode) ?? MODES[0];
  const expectedA = parentA - currentMode.particleA;
  const expectedZ = parentZ - currentMode.particleZ;
  const isCorrectA = userDaughterA === expectedA;
  const isCorrectZ = userDaughterZ === expectedZ;
  const isCorrect = isCorrectA && isCorrectZ;

  const elements = ['—', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu'];
  const parentSymbol = parentZ >= 1 && parentZ < elements.length ? elements[parentZ] : '?';
  const daughterSymbol = userDaughterZ >= 1 && userDaughterZ < elements.length ? elements[userDaughterZ] : '?';
  const expectedSymbol = expectedZ >= 1 && expectedZ < elements.length ? elements[expectedZ] : '?';

  function handleCheck() {
    setChecked(true);
    if (isCorrect) {
      const newCount = correctCount + 1;
      setCorrectCount(newCount);
      onSubDone(newCount >= 2);
    }
  }

  return (
    <Lab
      intro="Luyện tập viết và cân bằng phương trình phân rã phóng xạ theo định luật bảo toàn A và Z. Điền A và Z của hạt nhân con."
      note="Bảo toàn: Tổng A trước = Tổng A sau. Tổng Z trước = Tổng Z sau. Giải đúng ít nhất 2 bài để hoàn thành."
    >
      <div className="physics-controls">
        {MODES.map(m => (
          <button key={m.key} type="button" className={`physics-button ${mode === m.key ? 'primary' : ''}`} onClick={() => { setMode(m.key); setChecked(false); }}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="physics-controls" style={{ marginTop: '8px' }}>
        <label className="physics-field">
          <span>Hạt nhân mẹ A</span>
          <input type="number" value={parentA} min={1} max={240} onChange={e => { setParentA(Number(e.target.value)); setChecked(false); }} style={{ width: '80px', padding: '4px', textAlign: 'center' }} />
        </label>
        <label className="physics-field">
          <span>Hạt nhân mẹ Z</span>
          <input type="number" value={parentZ} min={1} max={94} onChange={e => { setParentZ(Number(e.target.value)); setChecked(false); }} style={{ width: '80px', padding: '4px', textAlign: 'center' }} />
        </label>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', padding: '20px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '8px', marginTop: '16px', justifyContent: 'center', fontSize: '1.2rem' }}>
        <NuclearSymbol a={parentA} z={parentZ} symbol={parentSymbol} />
        <span>→</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
          <NuclearSymbol a={userDaughterA} z={userDaughterZ} symbol={daughterSymbol} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="number" value={userDaughterA} onChange={e => { setUserDaughterA(Number(e.target.value)); setChecked(false); }} style={{ width: '60px', padding: '4px', textAlign: 'center', border: checked && isCorrectA ? '2px solid #16a34a' : '2px solid #e5e7eb', borderRadius: '4px' }} placeholder="A" />
            <input type="number" value={userDaughterZ} onChange={e => { setUserDaughterZ(Number(e.target.value)); setChecked(false); }} style={{ width: '60px', padding: '4px', textAlign: 'center', border: checked && isCorrectZ ? '2px solid #16a34a' : '2px solid #e5e7eb', borderRadius: '4px' }} placeholder="Z" />
          </div>
        </div>
        <span>+</span>
        <span style={{ fontWeight: 600 }}>{currentMode.particleName}</span>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
        <button type="button" className="physics-button primary" onClick={handleCheck}>Kiểm tra</button>
        <button type="button" className="physics-button" onClick={() => { setUserDaughterA(expectedA); setUserDaughterZ(expectedZ); setChecked(true); }}>Xem đáp án</button>
      </div>

      {checked && (
        <div style={{ padding: '12px', backgroundColor: isCorrect ? '#dcfce7' : '#fee2e2', borderRadius: '8px', marginTop: '12px' }}>
          {isCorrect
            ? `✓ Chính xác! Hạt nhân con: A=${expectedA}, Z=${expectedZ} (${expectedSymbol}). Đã đúng ${correctCount} bài.`
            : `❌ Chưa đúng. Bảo toàn A: ${parentA} = ${userDaughterA} + ${currentMode.particleA} → con cần A = ${expectedA}. Bảo toàn Z: ${parentZ} = ${userDaughterZ} + (${currentMode.particleZ}) → con cần Z = ${expectedZ} (${expectedSymbol}).`
          }
        </div>
      )}
    </Lab>
  );
}

// ─── Sub-lab 3: Tính năng lượng liên kết ─────────────────────────────────────
function BindingEnergyCalculator({ onSubDone }: { onSubDone: (done: boolean) => void }) {
  const nuclides = [
    { name: '⁴He', a: 4, z: 2, mx: 4.00150, label: 'Helium-4' },
    { name: '¹²C', a: 12, z: 6, mx: 11.99671, label: 'Carbon-12' },
    { name: '¹⁶O', a: 16, z: 8, mx: 15.99491, label: 'Oxygen-16' },
    { name: '⁵⁶Fe', a: 56, z: 26, mx: 55.92066, label: 'Iron-56 (bền nhất)' },
    { name: '²³⁵U', a: 235, z: 92, mx: 235.04392, label: 'Uranium-235' },
  ];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [viewedNuclides, setViewedNuclides] = useState<Set<number>>(new Set([0]));
  const [hasAnswered, setHasAnswered] = useState(false);

  const checkSubDone = useCallback((viewed: Set<number>, ans: boolean) => {
    onSubDone(viewed.size >= 3 && ans);
  }, [onSubDone]);

  function handleSelect(i: number) {
    setSelectedIdx(i);
    setViewedNuclides(prev => {
      const next = new Set(prev);
      next.add(i);
      checkSubDone(next, hasAnswered);
      return next;
    });
  }

  function handleAnswered() {
    setHasAnswered(true);
    checkSubDone(viewedNuclides, true);
  }

  const nuc = nuclides[selectedIdx];
  const mp = 1.00728;
  const mn = 1.00866;
  const amu = 931.5;
  const sumFree = nuc.z * mp + (nuc.a - nuc.z) * mn;
  const deltaM = sumFree - nuc.mx;
  const elk = deltaM * amu;
  const elkr = elk / nuc.a;

  return (
    <Lab
      intro="Tính độ hụt khối Δm và năng lượng liên kết Elk từng bước theo công thức SGK. Xem ít nhất 3 hạt nhân."
      note="mp = 1,00728 u; mn = 1,00866 u; 1u = 931,5 MeV/c²."
    >
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {nuclides.map((n, i) => (
          <button key={n.name} type="button" className={`physics-button ${i === selectedIdx ? 'primary' : ''}`} onClick={() => handleSelect(i)}>
            {n.name} {viewedNuclides.has(i) ? '✓' : ''}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px', lineHeight: 2 }}>
        <p style={{ fontWeight: 600, marginBottom: '8px' }}>Tính từng bước – {nuc.label} ({nuc.name}):</p>
        <p>Z = {nuc.z}; N = A − Z = {nuc.a - nuc.z}; A = {nuc.a}</p>
        <p>Tổng khối lượng tự do: Z·mp + N·mn = {nuc.z}×{mp} + {nuc.a - nuc.z}×{mn}</p>
        <p style={{ color: '#2357a5' }}>= {sumFree.toFixed(5)} u</p>
        <p>Khối lượng hạt nhân mx = {nuc.mx} u</p>
        <p>Độ hụt khối: Δm = {sumFree.toFixed(5)} − {nuc.mx} <span style={{ color: '#ef4444' }}>= {deltaM.toFixed(5)} u</span></p>
        <p>Năng lượng liên kết: Elk = {deltaM.toFixed(5)} × 931,5 <span style={{ color: '#16a34a', fontWeight: 700 }}>≈ {elk.toFixed(1)} MeV</span></p>
        <p>Năng lượng liên kết riêng: Elkr = {elk.toFixed(1)} / {nuc.a} <span style={{ color: '#d97706', fontWeight: 700 }}>≈ {elkr.toFixed(2)} MeV/nucleon</span></p>
      </div>

      <Metrics items={[
        { label: 'Δm (độ hụt khối)', value: `${deltaM.toFixed(5)} u` },
        { label: 'Elk (năng lượng liên kết)', value: `${elk.toFixed(1)} MeV` },
        { label: 'Elkr (liên kết riêng)', value: `${elkr.toFixed(2)} MeV/nucleon` },
      ]} />

      <div onClickCapture={handleAnswered}>
        <ChoiceCheck
          question="Hạt nhân ⁵⁶Fe có Elkr ≈ 8,79 MeV/nu và ²³⁵U có Elkr ≈ 7,59 MeV/nu. Khi U phân hạch tạo mảnh A ~100–140, năng lượng được tỏa ra hay hấp thụ?"
          options={[
            'Hấp thụ, vì U-235 nặng hơn các mảnh.',
            'Tỏa ra, vì các mảnh có Elkr cao hơn U-235 – hệ chuyển đến trạng thái bền hơn.',
            'Không thay đổi vì bảo toàn năng lượng.',
          ]}
          correctIndex={1}
          explanation="Elkr mảnh phân hạch (~8,5 MeV/nu) > Elkr U-235 (~7,6 MeV/nu). Hệ chuyển từ kém bền sang bền hơn → năng lượng tỏa ra ~200 MeV (Bài 4, SGK trang 121)."
        />
      </div>
    </Lab>
  );
}

// ─── Main export: Phòng thí nghiệm tổng hợp B25 ────────────────────────────
export function NuclearPhysicsPracticeLab({ onProgress }: ActivityProps) {
  const [activeSection, setActiveSection] = useState<'graph' | 'balance' | 'energy'>('graph');
  const [subDone, setSubDone] = useState<Record<string, boolean>>({});

  const handleSubDone = useCallback((key: string, done: boolean) => {
    setSubDone(prev => {
      if (prev[key] === done) return prev;
      const next = { ...prev, [key]: done };
      const allDone = next['graph'] && next['balance'] && next['energy'];
      onProgress?.(!!allDone);
      return next;
    });
  }, [onProgress]);

  const sections = [
    { key: 'graph' as const, label: '📊 Đồ thị H(t) – Bảng 25.1', isDone: !!subDone['graph'] },
    { key: 'balance' as const, label: '⚗️ Cân bằng phương trình', isDone: !!subDone['balance'] },
    { key: 'energy' as const, label: '⚡ Tính Δm và Elk', isDone: !!subDone['energy'] },
  ];

  return (
    <Lab
      intro="Phòng thí nghiệm luyện tập vật lí hạt nhân – Bài 25 (SGK trang 119–122). Ba hoạt động: phân tích đồ thị Bảng 25.1, cân bằng phương trình, tính năng lượng liên kết."
      note="Tất cả dữ liệu từ SGK hoặc công thức chính thống. Ưu tiên tập làm tay rồi kiểm tra bằng mô phỏng."
    >
      <div className="physics-guide">
        <p><strong>📝 Chu trình thực hành:</strong></p>
        <ol>
          <li><strong>Đồ thị:</strong> Khớp đường lí thuyết với Bảng 25.1 để ước lượng T.</li>
          <li><strong>Phương trình:</strong> Giải đúng ít nhất 2 bài cân bằng phản ứng.</li>
          <li><strong>Năng lượng:</strong> Tính Elk cho ít nhất 3 hạt nhân và trả lời câu hỏi.</li>
        </ol>
      </div>

      <div className="physics-controls">
        {sections.map(s => (
          <button key={s.key} type="button" className={`physics-button ${activeSection === s.key ? 'primary' : ''}`} onClick={() => setActiveSection(s.key)}>
            {s.label} {s.isDone ? '✓' : ''}
          </button>
        ))}
      </div>

      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành tổng:</strong></p>
        <ul>
          {sections.map(s => (
            <li key={s.key} className={s.isDone ? 'is-done' : ''}>{s.label} {s.isDone ? '✓' : ''}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '16px' }}>
        {activeSection === 'graph' && <DecayGraphLab onSubDone={(done) => handleSubDone('graph', done)} />}
        {activeSection === 'balance' && <NuclearEquationBalancer onSubDone={(done) => handleSubDone('balance', done)} />}
        {activeSection === 'energy' && <BindingEnergyCalculator onSubDone={(done) => handleSubDone('energy', done)} />}
      </div>
    </Lab>
  );
}
