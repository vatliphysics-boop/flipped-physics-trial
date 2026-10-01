"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChoiceCheck, Lab, Metrics, Sources } from './shared';

export type ActivityProps = {
  onProgress?: (done: boolean) => void;
};

// ─── 1. Nuclear Power Energy Flow – Nhà máy điện hạt nhân ───────────────────
export function NuclearPowerEnergyFlow({ onProgress }: ActivityProps) {
  const [controlRodPercent, setControlRodPercent] = useState(50);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const [hasTriedDanger, setHasTriedDanger] = useState(false);
  const [hasTriedSafe, setHasTriedSafe] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const k = controlRodPercent < 10 ? 1.3 : controlRodPercent > 90 ? 0.5 : 1.0 + (50 - controlRodPercent) * 0.005;
  const coreTemp = Math.round(300 + (1 - controlRodPercent / 100) * 900);
  const electricPower = Math.round(Math.max(0, (1 - controlRodPercent / 100) * 1500 * 0.36));
  const status = k > 1.01 ? '⚠️ Phản ứng ĐANG TĂNG (k > 1)' : k < 0.99 ? '✓ Phản ứng ĐANG GIẢM (k < 1)' : '● Ổn định (k = 1)';
  const statusColor = k > 1.01 ? '#ef4444' : k < 0.99 ? '#10b981' : '#f59e0b';

  const checkDone = useCallback((danger: boolean, safe: boolean, ans: boolean) => {
    onProgress?.(danger && safe && ans);
  }, [onProgress]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setTick(t => t + 1), 800);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const neutronCount = Math.min(100, Math.max(1, Math.round(10 * Math.pow(k, tick % 15))));

  function handleSlider(val: number) {
    setControlRodPercent(val);
    setTick(0);
    if (val < 20 && !hasTriedDanger) {
      setHasTriedDanger(true);
      checkDone(true, hasTriedSafe, hasAnswered);
    }
    if (val > 80 && !hasTriedSafe) {
      setHasTriedSafe(true);
      checkDone(hasTriedDanger, true, hasAnswered);
    }
  }

  function handleAnswered() {
    setHasAnswered(true);
    checkDone(hasTriedDanger, hasTriedSafe, true);
  }

  const components = [
    { num: '1', name: 'Thanh nhiên liệu ²³⁵U', role: 'Nhiên liệu phân hạch', color: '#f59e0b' },
    { num: '2', name: 'Chất làm chậm neutron', role: 'Giảm vận tốc neutron nhanh → neutron nhiệt', color: '#93c5fd' },
    { num: '4', name: 'Lớp tán xạ neutron (than chì)', role: 'Phản xạ neutron trở lại lõi lò', color: '#6b7280' },
    { num: '6', name: 'Thanh điều khiển (Bo/Cd)', role: 'Hấp thụ neutron → kiểm soát k = 1', color: '#ef4444' },
    { num: '5', name: 'Ống làm lạnh và chất tải nhiệt', role: 'Dẫn nhiệt ra bộ sinh hơi', color: '#60a5fa' },
    { num: '7', name: 'Thành bảo vệ phóng xạ', role: 'Chặn bức xạ rò ra môi trường', color: '#374151' },
  ];

  return (
    <Lab
      intro="Mô phỏng dòng năng lượng trong nhà máy điện hạt nhân (Hình 24.1 và 24.3 SGK, trang 114–115). Điều chỉnh mức thanh điều khiển và quan sát."
      note="Giá trị trong mô phỏng là định tính, không phải số liệu thực của một lò cụ thể."
    >
      <div className="physics-guide">
        <p><strong>⚡ Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Rút thanh điều khiển:</strong> Kéo thanh trượt về 0% – quan sát k tăng.</li>
          <li><strong>Cắm thanh điều khiển:</strong> Kéo về &gt;80% – quan sát phản ứng tắt dần.</li>
          <li><strong>Giải thích:</strong> Tại sao SCRAM (cắm hết thanh) lại là biện pháp an toàn?</li>
        </ol>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
          Sơ đồ mặt cắt lò phản ứng – Hình 24.3 SGK (8 bộ phận):
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginBottom: '16px' }}>
          {components.map((c) => (
            <div key={c.num} style={{ padding: '10px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '6px', borderLeft: `4px solid ${c.color}` }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: c.color }}>[{c.num}] {c.name}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{c.role}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="physics-controls">
        <label className="physics-field">
          <span>Thanh điều khiển cắm sâu <strong>{controlRodPercent}%</strong></span>
          <input type="range" min={0} max={100} step={5} value={controlRodPercent} onChange={e => handleSlider(Number(e.target.value))} />
        </label>
        <button type="button" className={`physics-button ${running ? '' : 'primary'}`} onClick={() => setRunning(r => !r)}>
          {running ? '⏸ Tạm dừng' : '▶ Mô phỏng phân hạch'}
        </button>
      </div>

      <div style={{ padding: '16px', backgroundColor: statusColor + '22', border: `2px solid ${statusColor}`, borderRadius: '8px', marginTop: '12px' }}>
        <strong style={{ color: statusColor }}>{status}</strong>
        <p style={{ fontSize: '13px', marginTop: '4px', color: 'var(--text-secondary)' }}>
          k = {k.toFixed(2)} | Neutron tự do (ước tính): {neutronCount}
        </p>
      </div>

      <Metrics items={[
        { label: 'Nhiệt độ lõi lò (tương đối)', value: `~${coreTemp} °C` },
        { label: 'Hệ số nhân neutron k', value: k.toFixed(2) },
        { label: 'Công suất điện ước tính', value: `~${electricPower} MW (hiệu suất 36%)` },
      ]} />

      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '8px' }}>
        <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Chuỗi chuyển hóa năng lượng (Hình 24.1 SGK):</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '14px' }}>
          {['⚛ Phân hạch U-235', '→', '🔥 Nhiệt năng (~300°C)', '→', '💨 Hơi nước HP', '→', '⚙ Tuabin', '→', '🔌 Điện năng'].map((step, i) => (
            <span key={i} style={{ fontWeight: step === '→' ? 400 : 600, color: step === '→' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{step}</span>
          ))}
        </div>
      </div>

      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={hasTriedDanger ? 'is-done' : ''}>Thử rút thanh điều khiển (k &gt; 1) {hasTriedDanger ? '✓' : ''}</li>
          <li className={hasTriedSafe ? 'is-done' : ''}>Thử cắm sâu thanh điều khiển (k &lt; 1) {hasTriedSafe ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi kiểm tra {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div onClickCapture={handleAnswered}>
        <ChoiceCheck
          question="Khi mất điện khẩn cấp tại nhà máy điện hạt nhân, lò phản ứng tự động cắm thanh điều khiển vào hoàn toàn. Điều này có ý nghĩa an toàn gì?"
          options={[
            'Tăng k lên để duy trì điện cho hệ thống cứu hộ.',
            'Hấp thụ hầu hết neutron, k giảm xuống dưới 1, phản ứng tắt dần – ngăn lò quá tải.',
            'Làm mát lõi lò bằng cách dẫn nhiệt ra ngoài.',
          ]}
          correctIndex={1}
          explanation="Thanh điều khiển chứa Bo/Cd hấp thụ neutron rất hiệu quả. Khi cắm hoàn toàn, neutron bị hấp thụ, k < 1, phản ứng tắt dần (SCRAM)."
        />
      </div>
      <Sources links={[{ label: 'Lò phản ứng hạt nhân – IAEA', url: 'https://www.iaea.org/topics/nuclear-power' }]} />
    </Lab>
  );
}

// ─── 2. Reactor Control Concept – Thanh điều khiển ───────────────────────────
export function ReactorControlConcept({ onProgress }: ActivityProps) {
  const [absorberPercent, setAbsorberPercent] = useState(50);
  const [hasFoundStable, setHasFoundStable] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const generatedPerFission = 2.5;
  const k = generatedPerFission * (1 - absorberPercent / 100);

  const checkDone = useCallback((stable: boolean, ans: boolean) => {
    onProgress?.(stable && ans);
  }, [onProgress]);

  const chainGeneration = Array.from({ length: 5 }, (_, gen) => ({
    gen,
    count: Math.round(10 * Math.pow(k, gen)),
  }));

  function handleSlider(val: number) {
    setAbsorberPercent(val);
    const newK = generatedPerFission * (1 - val / 100);
    if (Math.abs(newK - 1) < 0.05 && !hasFoundStable) {
      setHasFoundStable(true);
      checkDone(true, hasAnswered);
    }
  }

  function handleAnswered() {
    setHasAnswered(true);
    checkDone(hasFoundStable, true);
  }

  return (
    <Lab
      intro="Khảo sát hệ số nhân neutron k và cơ chế thanh điều khiển (SGK trang 115). Mỗi phân hạch U-235 sinh ra trung bình 2,5 neutron."
      note="k = (số neutron mỗi phân hạch) × (1 − tỉ lệ bị hấp thụ). k = 1: cân bằng; k > 1: bùng nổ; k < 1: tắt dần."
    >
      <div className="physics-guide">
        <p><strong>🎛️ Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Thử:</strong> Kéo thanh trượt để tìm vùng k ≈ 1 (ổn định).</li>
          <li><strong>Quan sát:</strong> Biểu đồ cột cho thấy số neutron thay đổi qua 5 thế hệ.</li>
          <li><strong>Giải thích:</strong> k = 1 nghĩa là gì trong thực tiễn?</li>
        </ol>
      </div>

      <div className="physics-controls">
        <label className="physics-field">
          <span>Tỉ lệ neutron bị thanh điều khiển hấp thụ <strong>{absorberPercent}%</strong></span>
          <input type="range" min={0} max={100} step={5} value={absorberPercent} onChange={e => handleSlider(Number(e.target.value))} />
        </label>
      </div>

      <div style={{ padding: '16px', backgroundColor: k > 1.01 ? '#fee2e2' : k < 0.99 ? '#dcfce7' : '#fef9c3', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' }}>
        <p style={{ fontSize: '2rem', fontWeight: 700, color: k > 1.01 ? '#dc2626' : k < 0.99 ? '#16a34a' : '#d97706' }}>
          k = {k.toFixed(2)}
        </p>
        <p style={{ fontSize: '14px', marginTop: '4px' }}>
          {k > 1.01 ? '⚠️ PHẢN ỨNG TĂNG – Nguy hiểm! Cần cắm sâu thêm thanh điều khiển.'
            : k < 0.99 ? '✓ Phản ứng đang tắt dần – Lò an toàn, đang giảm công suất.'
              : '● VẬN HÀNH ỔN ĐỊNH – Đây là điều kiện mục tiêu.'}
        </p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Phản ứng dây chuyền – sau 5 thế hệ (10 neutron ban đầu):</p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '120px' }}>
          {chainGeneration.map(({ gen, count }) => (
            <div key={gen} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '100%', backgroundColor: k > 1.01 ? '#ef4444' : k < 0.99 ? '#10b981' : '#f59e0b', borderRadius: '4px', height: `${Math.min(100, count * 5)}px`, transition: 'height 0.3s' }} />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{Math.min(count, 9999)}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gen {gen}</span>
            </div>
          ))}
        </div>
      </div>

      <Metrics items={[
        { label: 'Neutron sinh ra/phân hạch', value: '2,5 (trung bình)' },
        { label: 'Bị hấp thụ bởi thanh ĐK', value: `${absorberPercent}%` },
        { label: 'Hệ số nhân k', value: k.toFixed(2) },
      ]} />

      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={hasFoundStable ? 'is-done' : ''}>Tìm được vùng k ≈ 1 (vận hành ổn định) {hasFoundStable ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi kiểm tra {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div onClickCapture={handleAnswered}>
        <ChoiceCheck
          question="Để lò phản ứng hạt nhân vận hành ổn định, cần duy trì k bằng bao nhiêu?"
          options={['k = 0 (dừng hoàn toàn)', 'k = 1 (phản ứng dây chuyền ổn định)', 'k = 2 (tăng nhanh)']}
          correctIndex={1}
          explanation="k = 1 nghĩa là mỗi phân hạch tạo ra đúng 1 neutron tiếp tục phản ứng. Thanh điều khiển liên tục điều chỉnh để k ≈ 1 (SGK trang 115)."
        />
      </div>
    </Lab>
  );
}

// ─── 3. Nuclear Medicine – Y học hạt nhân ────────────────────────────────────
export function NuclearMedicine({ onProgress }: ActivityProps) {
  const [tab, setTab] = useState<'pet' | 'spect' | 'therapy'>('pet');
  const [viewedTabs, setViewedTabs] = useState<Set<string>>(new Set(['pet']));
  const [hasAnswered, setHasAnswered] = useState(false);

  const checkDone = useCallback((viewed: Set<string>, ans: boolean) => {
    onProgress?.(viewed.size >= 2 && ans);
  }, [onProgress]);

  function handleTab(t: 'pet' | 'spect' | 'therapy') {
    setTab(t);
    setViewedTabs(prev => {
      const next = new Set(prev);
      next.add(t);
      checkDone(next, hasAnswered);
      return next;
    });
  }

  function handleAnswered() {
    setHasAnswered(true);
    checkDone(viewedTabs, true);
  }

  const petIsotopes = [
    { name: '¹⁸F (Fluorine-18)', T: 110, unit: 'phút', use: 'PET/CT ung thư (FDG)', benefit: 'Thời gian chờ ngắn, phổ biến nhất' },
    { name: '¹¹C (Carbon-11)', T: 20, unit: 'phút', use: 'Nghiên cứu thần kinh', benefit: 'Giống sinh học, nhưng T quá ngắn' },
    { name: '⁶⁸Ga (Gallium-68)', T: 68, unit: 'phút', use: 'PET chẩn đoán khối u nội tiết', benefit: 'Không cần cyclotron tại chỗ' },
  ];

  const spectIsotopes = [
    { name: '⁹⁹ᵐTc (Technetium-99m)', T: 6, unit: 'giờ', use: 'Chụp xương, tim, thận', benefit: 'Phổ biến nhất thế giới (>80% SPECT)' },
    { name: '¹³¹I (Iodine-131)', T: 8, unit: 'ngày', use: 'Chẩn đoán và điều trị tuyến giáp', benefit: 'Vừa chẩn đoán vừa điều trị' },
  ];

  const therapyDrugs = [
    { name: 'Xofigo (²²³Ra)', isotope: '²²³Ra', T: '11,4 ngày', mechanism: 'Hấp thụ vào xương → phát tia α tiêu diệt ung thư xương di căn', indication: 'Ung thư tuyến tiền liệt di căn xương' },
    { name: 'Lutathera (¹⁷⁷Lu)', isotope: '¹⁷⁷Lu', T: '6,7 ngày', mechanism: 'Gắn vào thụ thể somatostatin → phát β⁻ tiêu diệt tế bào', indication: 'Khối u thần kinh nội tiết' },
  ];

  return (
    <Lab
      intro="Y học hạt nhân (SGK trang 116–117, Hình 24.4): Ứng dụng đồng vị phóng xạ trong chẩn đoán (PET, SPECT) và điều trị."
      note="Tất cả đồng vị dùng trong y tế phải có chu kì bán rã đủ ngắn để giảm phơi nhiễm, nhưng đủ dài để thực hiện thủ thuật."
    >
      <div className="physics-guide">
        <p><strong>🏥 Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Xem:</strong> Chuyển qua ít nhất 2 tab (PET, SPECT, Điều trị).</li>
          <li><strong>So sánh:</strong> Đồng vị nào phổ biến nhất? Vì sao?</li>
          <li><strong>Giải thích:</strong> Trả lời câu hỏi về ¹³¹I.</li>
        </ol>
      </div>

      <div className="physics-controls">
        <button type="button" className={`physics-button ${tab === 'pet' ? 'primary' : ''}`} onClick={() => handleTab('pet')}>PET {viewedTabs.has('pet') ? '✓' : ''}</button>
        <button type="button" className={`physics-button ${tab === 'spect' ? 'primary' : ''}`} onClick={() => handleTab('spect')}>SPECT {viewedTabs.has('spect') ? '✓' : ''}</button>
        <button type="button" className={`physics-button ${tab === 'therapy' ? 'primary' : ''}`} onClick={() => handleTab('therapy')}>Điều trị {viewedTabs.has('therapy') ? '✓' : ''}</button>
      </div>

      {tab === 'pet' && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', marginBottom: '16px' }}>
            <strong>Nguyên tắc PET:</strong> Đồng vị phát β⁺ → positron gặp electron → phản hủy → 2 tia γ ngược chiều (511 keV) → PET dựng hình 3D.
          </div>
          {petIsotopes.map(iso => (
            <div key={iso.name} style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', marginBottom: '8px' }}>
              <p style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{iso.name} – T₁/₂ = {iso.T} {iso.unit}</p>
              <p style={{ fontSize: '14px', marginTop: '4px' }}>Ứng dụng: {iso.use}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>Đặc điểm: {iso.benefit}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'spect' && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', marginBottom: '16px' }}>
            <strong>Nguyên tắc SPECT:</strong> Đồng vị phát tia γ trực tiếp → camera gamma quay quanh bệnh nhân → dựng hình 3D.
          </div>
          {spectIsotopes.map(iso => (
            <div key={iso.name} style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', marginBottom: '8px' }}>
              <p style={{ fontWeight: 600, color: '#16a34a' }}>{iso.name} – T₁/₂ = {iso.T} {iso.unit}</p>
              <p style={{ fontSize: '14px', marginTop: '4px' }}>Ứng dụng: {iso.use}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>Ưu điểm: {iso.benefit}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'therapy' && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#fdf4ff', borderRadius: '8px', marginBottom: '16px' }}>
            <strong>Nguyên tắc:</strong> Dược chất phóng xạ hướng đến mô ung thư cụ thể → phát tia α hoặc β⁻ tại chỗ → tiêu diệt tế bào ung thư.
          </div>
          {therapyDrugs.map(drug => (
            <div key={drug.name} style={{ padding: '12px', border: '1px solid #e9d5ff', borderRadius: '8px', marginBottom: '8px', backgroundColor: '#fdf4ff' }}>
              <p style={{ fontWeight: 600, color: '#7c3aed' }}>{drug.name} ({drug.isotope}, T₁/₂ = {drug.T})</p>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>Cơ chế: {drug.mechanism}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', fontStyle: 'italic' }}>Chỉ định: {drug.indication}</p>
            </div>
          ))}
        </div>
      )}

      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={viewedTabs.size >= 2 ? 'is-done' : ''}>Xem ít nhất 2 phương pháp ({viewedTabs.size}/2) {viewedTabs.size >= 2 ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi kiểm tra {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div onClickCapture={handleAnswered}>
        <ChoiceCheck
          question="Tại sao ¹³¹I được dùng cả để chẩn đoán lẫn điều trị bệnh tuyến giáp?"
          options={[
            'Vì tuyến giáp là bộ phận duy nhất hấp thụ được chất phóng xạ.',
            'Vì tuyến giáp chủ động hấp thụ iốt (để tổng hợp hormone), nên ¹³¹I tụ về đó – liều thấp để chụp ảnh, liều cao để phá hủy mô tuyến giáp bệnh.',
            'Vì iodine-131 phát tia alpha nên tập trung vào tuyến giáp.',
          ]}
          correctIndex={1}
          explanation="Tuyến giáp là cơ quan duy nhất hấp thụ iốt để tổng hợp thyroxine. ¹³¹I phát tia γ (ghi hình) và β⁻ (điều trị). Đây là ứng dụng y học hạt nhân phổ biến nhất tại Việt Nam."
        />
      </div>
      <Sources links={[{ label: 'Nuclear medicine – WHO', url: 'https://www.who.int/news-room/fact-sheets/detail/nuclear-medicine' }]} />
    </Lab>
  );
}

// ─── 4. Radiation Applications – Ứng dụng bức xạ trong đời sống ─────────────
type AppCategory = 'agriculture' | 'industry' | 'research';

const APPLICATIONS: Record<AppCategory, { title: string; icon: string; apps: { name: string; isotope: string; description: string; benefit: string; limitation: string }[] }> = {
  agriculture: {
    title: 'Nông nghiệp và bảo quản thực phẩm',
    icon: '🌾',
    apps: [
      { name: 'Chiếu xạ thực phẩm (Hình 24.5 SGK)', isotope: '⁶⁰Co (γ)', description: 'Vải thiều được chiếu xạ bằng tia γ → vi khuẩn bị tiêu diệt → bảo quản tươi lâu hơn.', benefit: 'Không cần hóa chất bảo quản, thực phẩm không nhiễm xạ', limitation: 'Chi phí thiết bị cao, người tiêu dùng còn ngần ngại' },
      { name: 'Nghiên cứu phân bón bằng ³²P', isotope: '³²P (β⁻)', description: 'Bón phân chứa ³²P vào cây → chụp ảnh phóng xạ → theo dõi đường đi phân bón → tối ưu hóa.', benefit: 'Hiểu chính xác cây hấp thụ dinh dưỡng', limitation: 'Phải thực hiện trong kiểm soát phóng xạ' },
      { name: 'Tạo giống đột biến', isotope: 'Chiếu xạ (γ, X)', description: 'Chiếu xạ hạt giống → tăng tần suất đột biến gene → chọn lọc biến thể tốt.', benefit: 'Nhanh hơn lai tạo truyền thống', limitation: 'Hầu hết đột biến có hại; cần sàng lọc lớn' },
    ],
  },
  industry: {
    title: 'Công nghiệp và kỹ thuật',
    icon: '🏭',
    apps: [
      { name: 'Chụp ảnh phóng xạ công nghiệp (RT)', isotope: '¹⁹²Ir, ⁶⁰Co (γ)', description: 'Chiếu tia γ qua mối hàn → phim cảm quang → phát hiện khuyết tật ẩn.', benefit: 'Phát hiện lỗi ẩn, không phá hủy vật kiểm tra', limitation: 'Nguồn phóng xạ cần quản lí nghiêm ngặt' },
      { name: 'Đo mức và lưu lượng', isotope: '¹³⁷Cs, ⁶⁰Co (γ)', description: 'Đặt nguồn γ và đầu thu hai bên bình chứa → đo cường độ → tính mức chất lỏng.', benefit: 'Không cần tiếp xúc vật lý', limitation: 'Cần cấp phép và quản lí nguồn' },
    ],
  },
  research: {
    title: 'Nghiên cứu khoa học',
    icon: '🔬',
    apps: [
      { name: 'Định tuổi bằng ¹⁴C', isotope: '¹⁴C (β⁻)', description: 'Đo tỉ lệ ¹⁴C/¹²C → tính tuổi theo định luật phóng xạ. Giới hạn: mẫu < 50.000 năm.', benefit: 'Xác định tuổi cổ vật và di tích', limitation: 'Chỉ cho vật liệu hữu cơ; sai số tăng với mẫu rất cổ' },
      { name: 'Theo dõi vết phóng xạ sinh học', isotope: '³H, ¹⁴C, ³²P', description: 'Gắn đồng vị phóng xạ vào phân tử sinh học → theo dõi đường đi, tốc độ chuyển hóa.', benefit: 'Hiểu cơ chế trao đổi chất ở mức phân tử', limitation: 'Cần thiết bị đặc biệt và kiểm soát an toàn' },
    ],
  },
};

export function RadiationApplications({ onProgress }: ActivityProps) {
  const [category, setCategory] = useState<AppCategory>('agriculture');
  const [viewedCategories, setViewedCategories] = useState<Set<AppCategory>>(new Set(['agriculture']));
  const [hasAnswered, setHasAnswered] = useState(false);
  const info = APPLICATIONS[category];

  const checkDone = useCallback((viewed: Set<AppCategory>, ans: boolean) => {
    onProgress?.(viewed.size >= 2 && ans);
  }, [onProgress]);

  function handleCategory(cat: AppCategory) {
    setCategory(cat);
    setViewedCategories(prev => {
      const next = new Set(prev);
      next.add(cat);
      checkDone(next, hasAnswered);
      return next;
    });
  }

  function handleAnswered() {
    setHasAnswered(true);
    checkDone(viewedCategories, true);
  }

  return (
    <Lab
      intro="Ứng dụng đồng vị phóng xạ và bức xạ trong đời sống (SGK trang 117). Khám phá nông nghiệp, công nghiệp và nghiên cứu."
      note="Tất cả ứng dụng đều cần kiểm soát nghiêm ngặt. Tại Việt Nam, VARANS quản lí tất cả hoạt động liên quan đến phóng xạ."
    >
      <div className="physics-guide">
        <p><strong>🌍 Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Khám phá:</strong> Chuyển qua ít nhất 2 lĩnh vực ứng dụng.</li>
          <li><strong>Đánh giá:</strong> So sánh lợi ích và hạn chế của từng ứng dụng.</li>
          <li><strong>Giải thích:</strong> Vì sao chiếu xạ thực phẩm là an toàn?</li>
        </ol>
      </div>

      <div className="physics-controls">
        {(Object.keys(APPLICATIONS) as AppCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            className={`physics-button ${category === cat ? 'primary' : ''}`}
            onClick={() => handleCategory(cat)}
          >
            {APPLICATIONS[cat].icon} {APPLICATIONS[cat].title.split(' ')[0]} {viewedCategories.has(cat) ? '✓' : ''}
          </button>
        ))}
      </div>

      <h4 style={{ fontSize: '15px', fontWeight: 600, marginTop: '16px', marginBottom: '12px' }}>
        {info.icon} {info.title}
      </h4>

      {info.apps.map((app) => (
        <div key={app.name} style={{ padding: '14px', border: '1px solid var(--border-light)', borderRadius: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px', flexWrap: 'wrap' }}>
            <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{app.name}</p>
            <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '4px', whiteSpace: 'nowrap' }}>{app.isotope}</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.6 }}>{app.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ padding: '8px', backgroundColor: '#dcfce7', borderRadius: '4px', fontSize: '12px' }}>
              <strong>✓ Lợi ích:</strong> {app.benefit}
            </div>
            <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '4px', fontSize: '12px' }}>
              <strong>⚠ Hạn chế:</strong> {app.limitation}
            </div>
          </div>
        </div>
      ))}

      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={viewedCategories.size >= 2 ? 'is-done' : ''}>Xem ít nhất 2 lĩnh vực ({viewedCategories.size}/2) {viewedCategories.size >= 2 ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi kiểm tra {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div onClickCapture={handleAnswered}>
        <ChoiceCheck
          question="Tại sao chiếu xạ thực phẩm bằng tia γ (Hình 24.5 SGK) KHÔNG làm thực phẩm trở nên phóng xạ?"
          options={[
            'Vì tia γ không thể xuyên vào bên trong thực phẩm.',
            'Vì tia γ là sóng điện từ – nó truyền năng lượng để phá DNA vi khuẩn, nhưng không để lại chất phóng xạ trong thực phẩm.',
            'Vì vi khuẩn trong thực phẩm hấp thụ hết phóng xạ.',
          ]}
          correctIndex={1}
          explanation="Chiếu xạ bằng tia γ không gây phóng xạ cảm ứng ở năng lượng cho phép (< 10 MeV). Tia γ chỉ ion hóa để phá hủy DNA vi khuẩn. Thực phẩm sau chiếu xạ an toàn, được WHO/FDA chấp thuận."
        />
      </div>
    </Lab>
  );
}
