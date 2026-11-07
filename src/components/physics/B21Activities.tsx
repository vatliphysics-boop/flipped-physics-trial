"use client";

import { useState, useCallback } from 'react';
import { ChoiceCheck, Lab, Metrics, NuclearSymbol, Nucleus, Range } from './shared';

export { RutherfordActivity } from "./RutherfordActivity";

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

  function handleAnswered(correct: boolean) {
      setHasAnswered(correct);
      checkDone(hasSelectedSi28, hasModified, correct);
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

      <div>
        <ChoiceCheck onResult={handleAnswered}
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

  function handleAnswered(correct: boolean) {
      setHasAnswered(correct);
      checkDone(hasExploredZ, hasExploredN, correct);
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

      <div>
        <ChoiceCheck onResult={handleAnswered}
          question="Khi số khối tăng 8 lần, bán kính gần đúng tăng mấy lần?"
          options={['8 lần', '4 lần', '2 lần']}
          correctIndex={2}
          explanation="R tỉ lệ với căn bậc ba của A, nên R mới / R cũ = ∛8 = 2. Thể tích gần tỉ lệ với A (vì V ~ R³ ~ A), còn bán kính không tăng tuyến tính."
        />
      </div>
    </Lab>
  );
}
