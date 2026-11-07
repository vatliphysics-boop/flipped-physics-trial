"use client";

import { B25DataProcessLab as DecayGraphLab } from "./B25DataProcessLab";
import { LatexMath } from "@/components/learning/LatexMath";

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChoiceCheck, Lab, Metrics, NuclearSymbol } from './shared';
import { BINDING_NUCLIDES, bindingEnergy, HYDROGEN_ATOM_MASS_U, NEUTRON_MASS_U } from '@/lib/physics';

export type ActivityProps = {
  onProgress?: (done: boolean) => void;
};

// The source table, theoretical curve and timeline share one state.

// ─── Sub-lab 2: Cân bằng phương trình phân rã ────────────────────────────────
function NuclearEquationBalancer({ onSubDone }: { onSubDone: (done: boolean) => void }) {
  type Mode = 'alpha' | 'beta_neg' | 'beta_pos';
  const [mode, setMode] = useState<Mode>('alpha');
  const [userDaughterA, setUserDaughterA] = useState(234);
  const [userDaughterZ, setUserDaughterZ] = useState(90);
  const [checked, setChecked] = useState(false);
  const [solvedTasks, setSolvedTasks] = useState<Set<string>>(new Set());
  const correctCount = solvedTasks.size;

  const modes = [
    { key: 'alpha', label: 'Phân rã α', parentA: 238, parentZ: 92, parentSymbol: 'U', daughterSymbol: 'Th', particleA: 4, particleZ: 2, particle: 'He', neutral: null },
    { key: 'beta_neg', label: 'Phân rã β⁻', parentA: 14, parentZ: 6, parentSymbol: 'C', daughterSymbol: 'N', particleA: 0, particleZ: -1, particle: 'e', neutral: String.raw`\bar{\nu}_e` },
    { key: 'beta_pos', label: 'Phân rã β⁺', parentA: 18, parentZ: 9, parentSymbol: 'F', daughterSymbol: 'O', particleA: 0, particleZ: 1, particle: 'e', neutral: String.raw`\nu_e` },
  ] as const;

  const currentMode = modes.find(example => example.key === mode) ?? modes[0];
  const { parentA, parentZ, parentSymbol, daughterSymbol: expectedSymbol } = currentMode;
  const expectedA = parentA - currentMode.particleA;
  const expectedZ = parentZ - currentMode.particleZ;
  const isCorrectA = userDaughterA === expectedA;
  const isCorrectZ = userDaughterZ === expectedZ;
  const isCorrect = isCorrectA && isCorrectZ;

  function handleCheck() {
    setChecked(true);
    if (isCorrect) {
      const next = new Set(solvedTasks).add(mode);
      setSolvedTasks(next);
      onSubDone(next.size >= 2);
    }
  }

  return (
    <Lab
      intro="Luyện tập viết và cân bằng phương trình phân rã phóng xạ theo định luật bảo toàn A và Z. Điền A và Z của hạt nhân con."
      note="Tổng số khối và tổng điện tích bảo toàn. Kí hiệu neutrino hoặc phản neutrino được ghi để phương trình beta đầy đủ, cả hai có A và Z bằng 0. Giải đúng ít nhất hai ví dụ."
    >
      <div className="physics-controls">
        {modes.map(m => (
          <button key={m.key} type="button" className={`physics-button ${mode === m.key ? 'primary' : ''}`} onClick={() => { setMode(m.key); setChecked(false); }}>
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', padding: '20px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '8px', marginTop: '16px', justifyContent: 'center', fontSize: '1.2rem' }}>
        <NuclearSymbol a={parentA} z={parentZ} symbol={parentSymbol} />
        <span>→</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
          <NuclearSymbol a={userDaughterA} z={userDaughterZ} symbol={isCorrect ? expectedSymbol : "X"} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="number" value={userDaughterA} onChange={e => { setUserDaughterA(Number(e.target.value)); setChecked(false); }} style={{ width: '60px', padding: '4px', textAlign: 'center', border: checked && isCorrectA ? '2px solid #16a34a' : '2px solid #e5e7eb', borderRadius: '4px' }} aria-label="Số khối A của hạt nhân con" placeholder="A" />
            <input type="number" value={userDaughterZ} onChange={e => { setUserDaughterZ(Number(e.target.value)); setChecked(false); }} style={{ width: '60px', padding: '4px', textAlign: 'center', border: checked && isCorrectZ ? '2px solid #16a34a' : '2px solid #e5e7eb', borderRadius: '4px' }} aria-label="Số proton Z của hạt nhân con" placeholder="Z" />
          </div>
        </div>
        <span>+</span>
        <NuclearSymbol a={currentMode.particleA} z={currentMode.particleZ} symbol={currentMode.particle} />
        {currentMode.neutral && <LatexMath math={`+ ${currentMode.neutral}`} />}
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
  const nuclides = BINDING_NUCLIDES;

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [viewedNuclides, setViewedNuclides] = useState<Set<number>>(new Set([0]));
  const [hasAnswered, setHasAnswered] = useState(false);

  const checkSubDone = useCallback((viewed: Set<number>, ans: boolean) => {
    onSubDone(viewed.size >= 3 && ans);
  }, [onSubDone]);

  function handleSelect(i: number) {
    setSelectedIdx(i);
    const next = new Set(viewedNuclides);
    next.add(i);
    setViewedNuclides(next);
    checkSubDone(next, hasAnswered);
  }

  function handleAnswered(correct: boolean) {
    setHasAnswered(correct);
    checkSubDone(viewedNuclides, correct);
  }

  const nuc = nuclides[selectedIdx];
  const mH = HYDROGEN_ATOM_MASS_U;
  const mn = NEUTRON_MASS_U;
  const sumFree = nuc.z * mH + (nuc.a - nuc.z) * mn;
  const { massDefect: deltaM, energy: elk, perNucleon: elkr } = bindingEnergy(nuc.z, nuc.a, nuc.mx);

  return (
    <Lab
      intro="Tính độ hụt khối và năng lượng liên kết từng bước. So sánh ít nhất ba hạt nhân."
      note="Ở đây dùng khối lượng nguyên tử trung hòa của hiđrô và đồng vị, bỏ qua năng lượng liên kết electron. SGK trình bày công thức tương ứng khi dùng khối lượng hạt nhân và proton."
    >
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {nuclides.map((n, i) => (
          <button key={n.name} type="button" className={`physics-button ${i === selectedIdx ? 'primary' : ''}`} onClick={() => handleSelect(i)}>
            {n.name} {viewedNuclides.has(i) ? '✓' : ''}
          </button>
        ))}
      </div>

      <div className="physics-formula">
        <p><strong>Ví dụ {nuc.name}</strong></p>
        <LatexMath block math={String.raw`A=${nuc.a},\quad Z=${nuc.z},\quad N=${nuc.a - nuc.z}`} />
        <LatexMath block math={String.raw`\Delta m=Z m({}^{1}\mathrm{H})+N m_n-m_{\mathrm{nguyên\ tử}}`} />
        <LatexMath block math={String.raw`\Delta m=\left(${sumFree.toFixed(6)}-${nuc.mx}\right)\,\mathrm{u}`} />
        <LatexMath block math={String.raw`E_{\mathrm{lk}}=\Delta m\,c^2\approx${elk.toFixed(1)}\,\mathrm{MeV}`} />
        <LatexMath block math={String.raw`\frac{E_{\mathrm{lk}}}{A}\approx${elkr.toFixed(2)}\,\mathrm{MeV}\,\mathrm{nucleon}^{-1}`} />
      </div>

      <p className="physics-note">Các bước khối lượng hiển thị 6 chữ số thập phân. Phép tính giữ đủ độ chính xác trong bộ nhớ; chỉ làm tròn kết quả hiển thị.</p>
      <Metrics items={[
        { label: 'Δm (độ hụt khối)', value: `${deltaM.toFixed(6)} u` },
        { label: 'Elk (năng lượng liên kết)', value: `${elk.toFixed(1)} MeV` },
        { label: 'Elkr (liên kết riêng)', value: `${elkr.toFixed(2)} MeV/nucleon` },
      ]} />
      <p className="physics-note">Nguồn khối lượng và quy ước tính: <a href="https://openstax.org/books/college-physics-2e/pages/a-atomic-masses" target="_blank" rel="noreferrer">OpenStax, bảng khối lượng nguyên tử ↗</a> · <a href="https://openstax.org/books/college-physics-2e/pages/31-6-binding-energy" target="_blank" rel="noreferrer">Công thức năng lượng liên kết ↗</a>.</p>

      <div>
        <ChoiceCheck onResult={handleAnswered}
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
  const lastProgress = useRef(false);

  const handleSubDone = useCallback((key: string, done: boolean) => {
    setSubDone(prev => prev[key] === done ? prev : { ...prev, [key]: done });
  }, []);
  const complete = Boolean(subDone.graph && subDone.balance && subDone.energy);
  useEffect(() => {
    if (lastProgress.current === complete) return;
    lastProgress.current = complete;
    onProgress?.(complete);
  }, [complete, onProgress]);

  const sections = [
    { key: 'graph' as const, label: '📊 Đồ thị H(t) – Bảng 25.1', isDone: !!subDone['graph'] },
    { key: 'balance' as const, label: '⚗️ Cân bằng phương trình', isDone: !!subDone['balance'] },
    { key: 'energy' as const, label: '⚡ Tính Δm và Elk', isDone: !!subDone['energy'] },
  ];

  return (
    <Lab
      intro="Phòng thí nghiệm luyện tập vật lí hạt nhân – Bài 25 (SGK trang 119–122). Ba hoạt động: phân tích đồ thị Bảng 25.1, cân bằng phương trình, tính năng lượng liên kết."
      note="Bảng H(t) được trích từ Bảng 25.1 SGK. Khối lượng nguyên tử dùng bảng OpenStax; các giá trị tính và đường cong được tạo từ công thức ghi trong từng hoạt động. Em tính trước rồi kiểm tra kết quả."
    >
      <div className="physics-guide">
        <p><strong>📝 Chu trình thực hành:</strong></p>
        <ol>
          <li><strong>Đồ thị:</strong> Đọc mốc nửa ban đầu trong Bảng 25.1 để ước lượng T, rồi so sánh với đường lí thuyết.</li>
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
