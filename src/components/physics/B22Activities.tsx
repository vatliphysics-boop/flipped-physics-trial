"use client";

import { useState, useCallback, useEffect } from 'react';
import { ChoiceCheck, Lab, NuclearSymbol } from './shared';
import { BINDING_NUCLIDES, bindingEnergy } from "@/lib/physics";
import { LatexMath } from "@/components/learning/LatexMath";
import { Scientist3DModelCanvas } from '@/components/learning/Canvas3DParticleEngine';

export type ActivityProps = {
  onProgress?: (done: boolean) => void;
};

/* ──────────────────────────────────────────────────────────────────────────────
   1. BUỒNG SƯƠNG BLACKETT
   SGK tr. 96-97  |  Phản ứng alpha + N-14 -> O-17 + proton
   ────────────────────────────────────────────────────────────────────────────── */

export function NuclearReactionBalancer({ onProgress }: ActivityProps) {
  const [oxygenA, setOxygenA] = useState<number | ''>('');
  const [oxygenZ, setOxygenZ] = useState<number | ''>('');
  const [protonA, setProtonA] = useState<number | ''>('');
  const [protonZ, setProtonZ] = useState<number | ''>('');

  const [hasAnswered, setHasAnswered] = useState(false);

  // α(4,2) + N(14,7) -> O(17,8) + p(1,1)
  const isCorrectEq = oxygenA === 17 && oxygenZ === 8 && protonA === 1 && protonZ === 1;
  const balancedA = (4 + 14) === ((Number(oxygenA) || 0) + (Number(protonA) || 0));
  const balancedZ = (2 + 7) === ((Number(oxygenZ) || 0) + (Number(protonZ) || 0));

  const checkDone = useCallback((eq: boolean, ans: boolean) => {
    onProgress?.(eq && ans);
  }, [onProgress]);

  useEffect(() => {
    checkDone(isCorrectEq, hasAnswered);
  }, [isCorrectEq, hasAnswered, checkDone]);

  function handleAnswered(correct: boolean) {
    setHasAnswered(correct);
    checkDone(isCorrectEq, correct);
  }

  return (
    <Lab
      intro="Khám phá thí nghiệm Rutherford 1919 (bắn phá Nitrogen bằng hạt α). Quan sát vết trên buồng sương và cân bằng phương trình phản ứng."
      note="Trong buồng sương Blackett, vết của hạt α bất ngờ rẽ nhánh thành hai vết: một vết dài, mảnh (proton) và một vết ngắn, đậm (hạt nhân mới)."
    >
      <div className="physics-guide">
        <p><strong>🔬 Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Quan sát:</strong> Xem hình ảnh mô phỏng buồng sương, xác định các hạt sinh ra.</li>
          <li><strong>Thử:</strong> Nhập số khối A và nguyên tử số Z cho các hạt nhân ở vế phải phương trình.</li>
          <li><strong>Giải thích:</strong> Trả lời câu hỏi để kiểm chứng hiểu biết.</li>
        </ol>
      </div>

      <div className="physics-split" style={{ gap: "24px", alignItems: "center" }}>
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <Scientist3DModelCanvas scientistId="blackett" width={320} height={200} />
        </div>

        <div style={{ flex: 1 }}>
          <h4 style={{ marginBottom: "16px", color: "var(--text-primary)" }}>Cân bằng phương trình</h4>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "1.2rem", flexWrap: "wrap", justifyContent: "center", backgroundColor: "var(--bg-surface-elevated)", padding: "20px", borderRadius: "8px", border: "1px solid var(--border-light)" }}>
            <NuclearSymbol a={4} z={2} symbol="He" />
            <span>+</span>
            <NuclearSymbol a={14} z={7} symbol="N" />
            <span>→</span>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <input type="number" value={oxygenA} onChange={(e) => setOxygenA(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: "45px", padding: "4px", textAlign: "center", fontSize: "14px", border: "1px solid var(--border-dark)", borderRadius: "4px" }} placeholder="A" />
              <input type="number" value={oxygenZ} onChange={(e) => setOxygenZ(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: "45px", padding: "4px", textAlign: "center", fontSize: "14px", border: "1px solid var(--border-dark)", borderRadius: "4px" }} placeholder="Z" />
            </div>
            <strong style={{ fontSize: "1.3rem" }}>O</strong>

            <span>+</span>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <input type="number" value={protonA} onChange={(e) => setProtonA(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: "45px", padding: "4px", textAlign: "center", fontSize: "14px", border: "1px solid var(--border-dark)", borderRadius: "4px" }} placeholder="A" />
              <input type="number" value={protonZ} onChange={(e) => setProtonZ(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: "45px", padding: "4px", textAlign: "center", fontSize: "14px", border: "1px solid var(--border-dark)", borderRadius: "4px" }} placeholder="Z" />
            </div>
            <strong style={{ fontSize: "1.3rem" }}>p</strong>
          </div>

          {oxygenA !== '' && protonA !== '' && (
            <div className={`physics-feedback ${isCorrectEq ? 'is-correct' : 'is-retry'}`}>
              {isCorrectEq ?
                "✓ Chính xác! Hạt nhân sinh ra là Oxy-17 và 1 hạt proton. Phản ứng đã tuân thủ định luật bảo toàn số khối (4+14=17+1) và điện tích (2+7=8+1)." :
                (balancedA && balancedZ ?
                  "⚠️ Tổng A và Z đã bằng nhau, nhưng sai số liệu các hạt. Hạt proton là hạt nhân nguyên tử Hydrogen (A=1, Z=1)." :
                  "❌ Phương trình chưa cân bằng định luật bảo toàn số khối A hoặc điện tích Z.")}
            </div>
          )}
        </div>
      </div>

      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={isCorrectEq ? 'is-done' : ''}>Cân bằng phương trình thành công {isCorrectEq ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi kiểm tra {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div>
        <ChoiceCheck onResult={handleAnswered}
          question="Thí nghiệm bắn hạt α vào Nitrogen của Rutherford chứng minh điều gì?"
          options={[
            'Hạt alpha có thể bị tán xạ bật ngược lại.',
            'Các nguyên tố có thể biến đổi thành nguyên tố khác thông qua phản ứng hạt nhân nhân tạo.',
            'Nitrogen có nhiều đồng vị trong tự nhiên.',
            'Nguyên tử chỉ có lõi mang điện dương.'
          ]}
          correctIndex={1}
          explanation="Thí nghiệm này là lần đầu tiên con người thực hiện biến đổi hạt nhân nhân tạo (từ Nitrogen thành Oxy), đánh dấu sự khởi đầu của vật lí hạt nhân thực nghiệm (SGK tr.96)."
        />
      </div>
    </Lab>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   2. ĐỒ THỊ NĂNG LƯỢNG LIÊN KẾT RIÊNG
   SGK tr. 98  |  Hình 22.3
   ────────────────────────────────────────────────────────────────────────────── */

export function BindingEnergyLab({ onProgress }: ActivityProps) {
  const [selectedA, setSelectedA] = useState<number | null>(null);
  const [hoveredA, setHoveredA] = useState<number | null>(null);
  const [clickedFe, setClickedFe] = useState(false);
  const [clickedU, setClickedU] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const energies = new Map<number, number>(
    BINDING_NUCLIDES.map(({ a, z, mx }) => [a, bindingEnergy(z, a, mx).perNucleon]),
  );
  const getEnergy = (a: number) => energies.get(a) ?? 0;
  const aValues = BINDING_NUCLIDES.map(({ a }) => a);

  const checkDone = useCallback((fe: boolean, u: boolean, ans: boolean) => {
    onProgress?.(fe && u && ans);
  }, [onProgress]);

  const handlePointClick = (a: number) => {
    setSelectedA(a);
    if (a === 56) {
      setClickedFe(true);
      checkDone(true, clickedU, hasAnswered);
    } else if (a === 235) {
      setClickedU(true);
      checkDone(clickedFe, true, hasAnswered);
    }
  };

  function handleAnswered(correct: boolean) {
    setHasAnswered(correct);
    checkDone(clickedFe, clickedU, correct);
  }

  return (
    <Lab
      intro="So sánh năng lượng liên kết riêng của năm đồng vị. Mỗi điểm tính từ khối lượng nguyên tử trung hòa tương ứng, bỏ qua hiệu chỉnh năng lượng liên kết electron."
      note="Tham khảo xu hướng trong Hình 22.3, SGK trang 98. Năng lượng liên kết riêng không đủ để kết luận một đồng vị bền hay phóng xạ."
    >
      <div className="physics-guide">
        <p><strong>🔎 Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Dự đoán:</strong> Đồng vị nào trong năm điểm có năng lượng liên kết riêng lớn nhất?</li>
          <li><strong>Thử:</strong> Di chuột (hoặc chạm) để xem giá trị. Bấm chọn điểm A=56 và A=235 để so sánh.</li>
          <li><strong>Giải thích:</strong> Vì sao phân hạch U-235 lại tỏa năng lượng?</li>
        </ol>
      </div>

      <LatexMath block math={String.raw`E_{\mathrm{lk,r}}=\frac{E_{\mathrm{lk}}}{A}`} />
      <div style={{ position: "relative", width: "100%", backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-light)", padding: "6px 10px", borderRadius: "8px" }}>
        <svg viewBox="0 0 500 250" role="img" aria-label="Đồ thị năng lượng liên kết riêng của năm đồng vị theo số khối" style={{ display: "block", width: "100%", maxHeight: "320px" }}>
          {/* Trục */}
          <line x1="40" y1="220" x2="480" y2="220" stroke="var(--text-primary)" strokeWidth="2" />
          <line x1="40" y1="20" x2="40" y2="220" stroke="var(--text-primary)" strokeWidth="2" />
          <text x="480" y="243" fontSize="13" fill="var(--text-primary)" textAnchor="end">Số khối A</text>
          <text x="46" y="17" fontSize="13" fill="var(--text-primary)">Năng lượng liên kết riêng</text>

          {/* Lưới */}
          {[2, 4, 6, 8].map(y => (
            <g key={y}>
              <line x1="35" y1={220 - y * 19} x2="40" y2={220 - y * 19} stroke="var(--border-dark)" strokeWidth="1" />
              <text x="25" y={220 - y * 19 + 4} fontSize="10" fill="var(--text-secondary)" textAnchor="end">{y}</text>
              <line x1="40" y1={220 - y * 19} x2="480" y2={220 - y * 19} stroke="var(--border-light)" strokeWidth="1" strokeDasharray="2 4" />
            </g>
          ))}
          {[50, 100, 150, 200, 250].map(x => (
            <g key={x}>
              <line x1={40 + x * 1.6} y1="220" x2={40 + x * 1.6} y2="225" stroke="var(--border-dark)" strokeWidth="1" />
              <text x={40 + x * 1.6} y="240" fontSize="10" fill="var(--text-secondary)" textAnchor="middle">{x}</text>
            </g>
          ))}

          {/* Các điểm nổi bật */}
          {aValues.map(a => {
            const e = getEnergy(a);
            const cx = 40 + a * 1.6;
            const cy = 220 - e * 19;
            const isHovered = hoveredA === a || selectedA === a;
            const isClicked = (a === 56 && clickedFe) || (a === 235 && clickedU);

            return (
              <g
                key={a}
                onMouseEnter={() => setHoveredA(a)}
                onMouseLeave={() => setHoveredA(null)}
                onClick={() => handlePointClick(a)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={cx} cy={cy}
                  r={isHovered ? 8 : (isClicked ? 6 : 4)}
                  fill={a > 50 && a < 90 ? "#10b981" : (a > 200 ? "#ef4444" : "#f59e0b")}
                  stroke={isClicked ? "#fff" : "none"}
                  strokeWidth={isClicked ? 2 : 0}
                />
              </g>
            );
          })}

        </svg>
      </div>

      <div className="binding-point-list" aria-label="Chọn điểm trên đồ thị năng lượng liên kết riêng">
        <p>Trục hoành: số khối A. Trục tung: năng lượng liên kết riêng (MeV/nucleon).</p>
        <div>{aValues.map(a => <button type="button" className="btn" key={a} aria-pressed={selectedA === a} onClick={() => handlePointClick(a)}>{a === 56 ? "Fe-56 · " : a === 235 ? "U-235 · " : a === 4 ? "He-4 · " : ""}A={a} · {getEnergy(a).toFixed(1)} MeV/nucleon</button>)}</div>
        <p role="status">{selectedA === null ? "Chọn một điểm để đọc giá trị và so sánh." : `Đã chọn A=${selectedA}: ${getEnergy(selectedA).toFixed(1)} MeV/nucleon.`}</p>
      </div>
      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={clickedFe ? 'is-done' : ''}>Kiểm tra năng lượng liên kết riêng vùng đỉnh (A=56) {clickedFe ? '✓' : ''}</li>
          <li className={clickedU ? 'is-done' : ''}>Kiểm tra năng lượng liên kết riêng của Uranium (A=235) {clickedU ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi giải thích {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div>
        <ChoiceCheck onResult={handleAnswered}
          question="Dựa vào đồ thị, tại sao phản ứng phân hạch U-235 lại tỏa năng lượng?"
          options={[
            'Vì U-235 tự vỡ ra không cần ngoại lực tác động.',
            'Vì các mảnh phân hạch có năng lượng liên kết riêng lớn hơn U-235; không nhất thiết nằm đúng đỉnh sắt/nickel.',
            'Vì quá trình này tiêu thụ neutron.',
            'Vì số lượng nucleon tăng lên sau phản ứng.'
          ]}
          correctIndex={1}
          explanation="Tổng khối lượng nghỉ của sản phẩm nhỏ hơn của hệ ban đầu. Chênh lệch xuất hiện dưới dạng năng lượng tỏa ra, chủ yếu là động năng của các sản phẩm."
        />
      </div>
    </Lab>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   3. PHÂN HẠCH DÂY CHUYỀN
   SGK tr. 101-102
   ────────────────────────────────────────────────────────────────────────────── */

export { GuidedFissionLab as NuclearFission } from "./GuidedFissionLab";

export function NuclearFusion({ onProgress }: ActivityProps) {
  const [speed, setSpeed] = useState<"slow" | "fast" | "idle">("idle");
  const [hasTriedSlow, setHasTriedSlow] = useState(false);
  const [hasTriedFast, setHasTriedFast] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const [statusText, setStatusText] = useState("Nhấn nút để bắn hai hạt nhân về phía nhau.");

  const checkDone = useCallback((slow: boolean, fast: boolean, ans: boolean) => {
    onProgress?.(slow && fast && ans);
  }, [onProgress]);

  const fire = (mode: "slow" | "fast") => {
    setSpeed("idle");

    // Cần timeout nhỏ để restart animation
    setTimeout(() => {
      setSpeed(mode);

      if (mode === "slow") {
        setStatusText("Kịch bản tán xạ: lực đẩy tĩnh điện làm hai hạt tách ra.");
        setHasTriedSlow(true);
        checkDone(true, hasTriedFast, hasAnswered);
      } else {
        setStatusText("Kịch bản nhiệt hạch: tạo hạt nhân heli-4 và một neutron.");
        setHasTriedFast(true);
        checkDone(hasTriedSlow, true, hasAnswered);
      }
    }, 50);
  };

  function handleAnswered(correct: boolean) {
    setHasAnswered(correct);
    checkDone(hasTriedSlow, hasTriedFast, correct);
  }

  return (
    <Lab
      intro="Quan sát hai kịch bản khi các hạt nhân deuterium và tritium tới gần nhau."
      note="Mỗi hình tròn biểu diễn một hạt nhân hoặc một neutron tự do. Quỹ đạo, kích thước và thời gian quy ước. Nhiệt độ cao làm tăng xác suất nhiệt hạch; hai kịch bản không biểu diễn một ngưỡng chắc chắn xảy ra phản ứng."
    >
      <LatexMath block math={String.raw`{}^{2}_{1}\mathrm{H}+{}^{3}_{1}\mathrm{H}\rightarrow{}^{4}_{2}\mathrm{He}+{}^{1}_{0}\mathrm{n}`} />
      <p>Số khối tổng bằng 5 và điện tích tổng bằng 2 điện tích nguyên tố ở mỗi vế.</p>
      <div className="physics-guide">
        <p><strong>💥 Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Thử chậm:</strong> Chọn kịch bản tán xạ. Quan sát hai hạt đổi chiều.</li>
          <li><strong>Thử nhanh:</strong> Chọn kịch bản nhiệt hạch. Đối chiếu sản phẩm với phương trình.</li>
          <li><strong>Giải thích:</strong> Trả lời câu hỏi về điều kiện xảy ra nhiệt hạch.</li>
        </ol>
      </div>

      <div className="physics-controls">
        <button type="button" className="physics-button" onClick={() => fire("slow")}>
          Xem kịch bản tán xạ
        </button>
        <button type="button" className="physics-button primary" onClick={() => fire("fast")}>
          Xem kịch bản nhiệt hạch
        </button>
      </div>

      <p style={{ marginTop: "12px", color: "var(--text-secondary)", fontSize: "14px" }}>
        Trạng thái: <strong>{statusText}</strong>
      </p>

      <div className="fusion-sketch" style={{ position: "relative", width: "100%", height: "200px", backgroundColor: "#0f172a", border: "1px solid var(--border-light)", borderRadius: "8px", overflow: "hidden", margin: "16px 0" }}>

        {/* CSS Animations inline for the simulation */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes moveRightSlow {
            0% { transform: translateX(0); }
            50% { transform: translateX(120px); }
            100% { transform: translateX(0); }
          }
          @keyframes moveLeftSlow {
            0% { transform: translateX(0); }
            50% { transform: translateX(-120px); }
            100% { transform: translateX(0); }
          }
          @keyframes moveRightFast {
            0% { transform: translateX(0); }
            45% { transform: translateX(180px); opacity: 1; }
            50% { transform: translateX(200px); opacity: 0; }
            100% { transform: translateX(200px); opacity: 0; }
          }
          @keyframes moveLeftFast {
            0% { transform: translateX(0); }
            45% { transform: translateX(-180px); opacity: 1; }
            50% { transform: translateX(-200px); opacity: 0; }
            100% { transform: translateX(-200px); opacity: 0; }
          }
          @keyframes flash {
            0% { opacity: 0; transform: scale(0.5); }
            49% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 1; transform: scale(1.5); }
            100% { opacity: 0; transform: scale(2.5); }
          }
          @keyframes popHe {
            0% { opacity: 0; transform: scale(0); }
            49% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
            100% { opacity: 1; transform: scale(1) translateX(30px) translateY(20px); }
          }
          @keyframes popN {
            0% { opacity: 0; transform: scale(0); }
            49% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
            100% { opacity: 1; transform: scale(1) translateX(-60px) translateY(-30px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .fusion-sketch svg * { animation-delay: -3s !important; }
          }
        `}} />

        <svg viewBox="0 0 500 200" style={{ width: "100%", height: "100%" }}>
          <title>Nhiệt hạch D + T</title>

          {/* Lực đẩy Coulomb (mô phỏng từ trường tĩnh điện) */}
          {speed === "slow" && (
            <g opacity="0.4">
              <path d="M 220 50 Q 250 100 220 150" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M 280 50 Q 250 100 280 150" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
            </g>
          )}

          {/* Hạt Deuterium 2H (trái) */}
          <g style={{ animation: speed === "slow" ? "moveRightSlow 2.5s ease-in-out" : (speed === "fast" ? "moveRightFast 1s ease-in forwards" : "none") }}>
            <circle cx="50" cy="100" r="14" fill="#3b82f6" />
            <text x="50" y="104" fill="#fff" fontSize="12" textAnchor="middle">²H</text>
            <text x="50" y="125" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Deuterium</text>
          </g>

          {/* Hạt Tritium 3H (phải) */}
          <g style={{ animation: speed === "slow" ? "moveLeftSlow 2.5s ease-in-out" : (speed === "fast" ? "moveLeftFast 1s ease-in forwards" : "none") }}>
            <circle cx="450" cy="100" r="16" fill="#10b981" />
            <text x="450" y="104" fill="#fff" fontSize="12" textAnchor="middle">³H</text>
            <text x="450" y="128" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Tritium</text>
          </g>

          {/* Hiệu ứng nổ và Sản phẩm (chỉ hiện khi fast) */}
          <g style={{ animation: speed === "fast" ? "flash 1s forwards" : "none", opacity: 0, transformOrigin: "250px 100px" }}>
            <circle cx="250" cy="100" r="30" fill="#fef08a" />
          </g>

          {/* Sản phẩm Helium 4He */}
          <g style={{ animation: speed === "fast" ? "popHe 1s forwards" : "none", opacity: 0 }}>
            <circle cx="250" cy="100" r="18" fill="#8b5cf6" />
            <text x="250" y="104" fill="#fff" fontSize="12" textAnchor="middle">⁴He</text>
          </g>

          {/* Sản phẩm Neutron 1n */}
          <g style={{ animation: speed === "fast" ? "popN 1s forwards" : "none", opacity: 0 }}>
            <circle cx="250" cy="100" r="8" fill="#fff" />
            <text x="250" y="103" fill="#000" fontSize="10" textAnchor="middle">n</text>
          </g>
        </svg>
      </div>

      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={hasTriedSlow ? 'is-done' : ''}>Đã xem kịch bản tán xạ {hasTriedSlow ? '✓' : ''}</li>
          <li className={hasTriedFast ? 'is-done' : ''}>Đã xem kịch bản nhiệt hạch {hasTriedFast ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi giải thích {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div>
        <ChoiceCheck onResult={handleAnswered}
          question="Vì sao nhiệt độ cao làm tăng xác suất xảy ra nhiệt hạch?"
          options={[
            'Để các nguyên tử nóng chảy thành chất lỏng.',
            'Để tạo ra các neutron kích hoạt phản ứng.',
            'Nhiều hạt nhân có động năng lớn hơn và có thể tiến gần nhau hơn dù có lực đẩy điện.'
          ]}
          correctIndex={2}
          explanation="Hai hạt nhân mang điện dương và đẩy nhau. Ở nhiệt độ cao, nhiều hạt nhân tới đủ gần để xác suất phản ứng tăng."
        />
      </div>
    </Lab>
  );
}
