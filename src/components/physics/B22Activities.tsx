"use client";

import { useState, useCallback, useEffect } from 'react';
import { ChoiceCheck, Lab, Metrics, NuclearSymbol } from './shared';

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
    if (isCorrectEq) {
      checkDone(true, hasAnswered);
    }
  }, [isCorrectEq, hasAnswered, checkDone]);

  function handleAnswered() {
    setHasAnswered(true);
    checkDone(isCorrectEq, true);
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
        <div style={{ flex: 1 }}>
          <svg viewBox="0 0 300 200" className="physics-svg" style={{ margin: 0, backgroundColor: "#0f172a" }}>
            <title>Vết buồng sương Blackett</title>
            {/* Vết các hạt alpha đi thẳng */}
            <path d="M 0 50 L 300 50" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
            <path d="M 0 150 L 300 150" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
            <path d="M 0 180 L 300 180" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
            
            {/* Vết va chạm */}
            <path d="M 0 100 L 150 100" stroke="rgba(255,255,255,0.8)" strokeWidth="3" fill="none" />
            
            <circle cx="150" cy="100" r="3" fill="#fff" />
            
            {/* Proton bay ra (dài, mảnh) */}
            <path d="M 150 100 L 280 40" stroke="rgba(255,200,200,0.9)" strokeWidth="1.5" strokeDasharray="4 2" fill="none" />
            <text x="285" y="35" fill="#ffc8c8" fontSize="12">p</text>
            
            {/* Hạt nhân mới (ngắn, đậm) */}
            <path d="M 150 100 L 200 130" stroke="rgba(200,200,255,0.9)" strokeWidth="4" fill="none" />
            <text x="205" y="145" fill="#c8c8ff" fontSize="12">O</text>
            
            <text x="10" y="90" fill="var(--text-muted)" fontSize="11">Hạt α</text>
          </svg>
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

      <div onClickCapture={handleAnswered}>
        <ChoiceCheck 
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
  const [hoveredA, setHoveredA] = useState<number | null>(null);
  const [clickedFe, setClickedFe] = useState(false);
  const [clickedU, setClickedU] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const getEnergy = (a: number) => {
    if (a < 4) return 1.1 + a * 1.5;
    if (a === 4) return 7.1; // He-4
    if (a < 50) return 7.5 + Math.log(a) * 0.2;
    if (a <= 90) return 8.8; // Peak around Fe/Ni
    return 8.8 - (a - 90) * 0.006;
  };

  const aValues = [2, 4, 12, 16, 56, 100, 150, 200, 235];
  
  const checkDone = useCallback((fe: boolean, u: boolean, ans: boolean) => {
    onProgress?.(fe && u && ans);
  }, [onProgress]);

  const handlePointClick = (a: number) => {
    if (a === 56) {
      setClickedFe(true);
      checkDone(true, clickedU, hasAnswered);
    } else if (a === 235) {
      setClickedU(true);
      checkDone(clickedFe, true, hasAnswered);
    }
  };

  function handleAnswered() {
    setHasAnswered(true);
    checkDone(clickedFe, clickedU, true);
  }

  return (
    <Lab 
      intro="Khảo sát đồ thị năng lượng liên kết riêng (NLLK riêng). Trục tung là NLLK riêng (MeV/nucleon), trục hoành là số khối A." 
      note="NLLK riêng càng lớn thì hạt nhân càng bền vững. Bằng cách quan sát đồ thị, ta có thể dự đoán xu hướng của phản ứng hạt nhân."
    >
      <div className="physics-guide">
        <p><strong>🔎 Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Dự đoán:</strong> Vùng nào trên đồ thị chứa hạt nhân bền nhất?</li>
          <li><strong>Thử:</strong> Di chuột (hoặc chạm) để xem giá trị. Bấm chọn điểm A=56 và A=235 để so sánh.</li>
          <li><strong>Giải thích:</strong> Vì sao phân hạch U-235 lại tỏa năng lượng?</li>
        </ol>
      </div>

      <div style={{ position: "relative", width: "100%", height: "320px", backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-light)", padding: "20px", borderRadius: "8px" }}>
        <svg viewBox="0 0 500 250" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          {/* Trục */}
          <line x1="40" y1="220" x2="480" y2="220" stroke="var(--text-primary)" strokeWidth="2" />
          <line x1="40" y1="20" x2="40" y2="220" stroke="var(--text-primary)" strokeWidth="2" />
          <text x="490" y="225" fontSize="12" fill="var(--text-primary)" textAnchor="start">A</text>
          <text x="30" y="10" fontSize="12" fill="var(--text-primary)" textAnchor="middle">W_lkr (MeV/nu)</text>
          
          {/* Lưới */}
          {[2, 4, 6, 8].map(y => (
            <g key={y}>
              <line x1="35" y1={220 - y * 22} x2="40" y2={220 - y * 22} stroke="var(--border-dark)" strokeWidth="1" />
              <text x="25" y={220 - y * 22 + 4} fontSize="10" fill="var(--text-secondary)" textAnchor="end">{y}</text>
              <line x1="40" y1={220 - y * 22} x2="480" y2={220 - y * 22} stroke="var(--border-light)" strokeWidth="1" strokeDasharray="2 4" />
            </g>
          ))}
          {[50, 100, 150, 200, 250].map(x => (
            <g key={x}>
              <line x1={40 + x * 1.6} y1="220" x2={40 + x * 1.6} y2="225" stroke="var(--border-dark)" strokeWidth="1" />
              <text x={40 + x * 1.6} y="240" fontSize="10" fill="var(--text-secondary)" textAnchor="middle">{x}</text>
            </g>
          ))}

          {/* Đường cong */}
          <path d="M 43 195 Q 46 64, 46 64 T 130 26 T 416 90" fill="none" stroke="#2357a5" strokeWidth="3" strokeLinejoin="round" />
          
          {/* Các điểm nổi bật */}
          {aValues.map(a => {
            const e = getEnergy(a);
            const cx = 40 + a * 1.6;
            const cy = 220 - e * 22;
            const isHovered = hoveredA === a;
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
                {(isHovered || isClicked) && (
                  <text 
                    x={cx} y={cy - 12} 
                    fontSize="12" 
                    fontWeight={isClicked ? "bold" : "normal"} 
                    textAnchor="middle" 
                    fill="var(--text-primary)"
                  >
                    A={a} ({e.toFixed(1)})
                  </text>
                )}
              </g>
            );
          })}

          {/* Mũi tên xu hướng */}
          <path d="M 400 70 L 300 50" fill="none" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-fission)" strokeDasharray="4 4" />
          <text x="350" y="45" fontSize="11" fill="#ef4444" textAnchor="middle">Phân hạch</text>
          
          <path d="M 50 160 Q 80 50 120 40" fill="none" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow-fusion)" strokeDasharray="4 4" />
          <text x="110" y="80" fontSize="11" fill="#d97706" textAnchor="middle">Nhiệt hạch</text>
          
          <defs>
            <marker id="arrow-fission" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
            </marker>
            <marker id="arrow-fusion" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
            </marker>
          </defs>
        </svg>
      </div>

      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={clickedFe ? 'is-done' : ''}>Kiểm tra năng lượng liên kết riêng vùng đỉnh (A=56) {clickedFe ? '✓' : ''}</li>
          <li className={clickedU ? 'is-done' : ''}>Kiểm tra năng lượng liên kết riêng của Uranium (A=235) {clickedU ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi giải thích {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div onClickCapture={handleAnswered}>
        <ChoiceCheck 
          question="Dựa vào đồ thị, tại sao phản ứng phân hạch U-235 lại tỏa năng lượng?" 
          options={[
            'Vì U-235 tự vỡ ra không cần ngoại lực tác động.', 
            'Vì các mảnh vỡ sinh ra nằm ở đỉnh đồ thị (A ≈ 50-90), có năng lượng liên kết riêng lớn hơn, bền vững hơn U-235.', 
            'Vì quá trình này tiêu thụ neutron.',
            'Vì số lượng nucleon tăng lên sau phản ứng.'
          ]} 
          correctIndex={1} 
          explanation="Năng lượng tỏa ra vì hệ chuyển từ trạng thái kém bền (U-235, W_lkr ~ 7.6 MeV/nu) sang trạng thái bền vững hơn (các mảnh vỡ, W_lkr ~ 8.5 MeV/nu). Năng lượng chênh lệch đó được giải phóng (SGK tr.98)." 
        />
      </div>
    </Lab>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   3. PHÂN HẠCH DÂY CHUYỀN
   SGK tr. 101-102
   ────────────────────────────────────────────────────────────────────────────── */

export function NuclearFission({ onProgress }: ActivityProps) {
  const [neutrons, setNeutrons] = useState(0);
  const [uranium, setUranium] = useState(50);
  const [fissioned, setFissioned] = useState(0);
  
  const [hasStarted, setHasStarted] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const checkDone = useCallback((started: boolean, ans: boolean) => {
    onProgress?.(started && ans);
  }, [onProgress]);

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  const startChain = () => {
    if (intervalId) clearInterval(intervalId);
    
    setNeutrons(1);
    setUranium(50);
    setFissioned(0);
    setHasStarted(true);
    checkDone(true, hasAnswered);
    
    let currentNeutrons = 1;
    let currentUranium = 50;
    let currentFissioned = 0;

    const id = setInterval(() => {
      if (currentNeutrons <= 0 || currentUranium <= 0) {
        clearInterval(id);
        return;
      }

      // Mỗi n đập vào 1 U -> sinh ra ~2 n mới. Hệ số nhân k ≈ 2.
      const reacted = Math.min(currentNeutrons, currentUranium);
      currentUranium -= reacted;
      currentFissioned += reacted;
      currentNeutrons = (reacted * 2);

      setUranium(currentUranium);
      setFissioned(currentFissioned);
      setNeutrons(currentNeutrons);

      if (currentUranium <= 0) clearInterval(id);
    }, 600);
    
    setIntervalId(id);
  };

  function handleAnswered() {
    setHasAnswered(true);
    checkDone(hasStarted, true);
  }

  return (
    <Lab 
      intro="Mô phỏng phản ứng phân hạch dây chuyền của U-235." 
      note="Một neutron chậm bắn vào hạt nhân U-235 làm nó vỡ ra, giải phóng năng lượng và sinh ra thêm 2-3 neutron mới. Số neutron sinh ra lại tiếp tục kích hoạt phân hạch khác."
    >
      <div className="physics-guide">
        <p><strong>⚛️ Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Kích hoạt:</strong> Bấm nút để bắn 1 neutron vào khối U-235.</li>
          <li><strong>Quan sát:</strong> Tốc độ lan truyền của phản ứng và số hạt n sinh ra.</li>
          <li><strong>Giải thích:</strong> Vai trò của hệ số nhân neutron k.</li>
        </ol>
      </div>

      <div className="physics-controls">
        <button type="button" className="physics-button primary" onClick={startChain}>
          Bắn 1 neutron kích hoạt
        </button>
      </div>

      <div className="physics-split">
        <div style={{ flex: 1, backgroundColor: "#0f172a", borderRadius: "8px", position: "relative", minHeight: "260px", overflow: "hidden", border: "1px solid var(--border-dark)" }}>
          {Array.from({ length: uranium }).map((_, i) => (
            <div 
              key={`u-${i}`} 
              style={{ position: "absolute", width: "16px", height: "16px", backgroundColor: "#3b82f6", borderRadius: "50%", top: `${15 + (i * 17) % 70}%`, left: `${15 + (i * 23) % 70}%`, transition: "all 0.3s" }} 
              title="U-235" 
            />
          ))}
          {Array.from({ length: fissioned }).map((_, i) => (
            <div 
              key={`f-${i}`} 
              style={{ position: "absolute", width: "12px", height: "12px", backgroundColor: "#ef4444", borderRadius: "50%", top: `${15 + (i * 17) % 70}%`, left: `${15 + (i * 23) % 70}%`, opacity: 0.8, boxShadow: "0 0 10px #ef4444", transition: "all 0.5s" }} 
            />
          ))}
          {neutrons > 0 && Array.from({ length: Math.min(neutrons, 40) }).map((_, i) => (
            <div 
              key={`n-${i}`} 
              style={{ position: "absolute", width: "6px", height: "6px", backgroundColor: "#fff", borderRadius: "50%", top: `${50 + (Math.sin(i) * 35)}%`, left: `${50 + (Math.cos(i * 1.5) * 35)}%`, opacity: 0.8 }} 
            />
          ))}
          
          {hasStarted && uranium === 0 && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", color: "#fff", fontWeight: "bold", fontSize: "20px" }}>
              Phản ứng bùng nổ!
            </div>
          )}
        </div>
        
        <div style={{ flex: 1 }}>
          <Metrics items={[
            { label: 'U-235 chưa phản ứng', value: uranium }, 
            { label: 'U-235 đã phân hạch', value: fissioned },
            { label: 'Neutron mới sinh ra (kích hoạt)', value: neutrons }
          ]} />
          
          <div className="physics-note" style={{ marginTop: "16px", backgroundColor: "var(--bg-surface)", padding: "12px", borderRadius: "6px", borderLeft: "3px solid var(--color-primary)" }}>
            <p><strong>Hệ số nhân k:</strong> là số neutron trung bình còn lại sau mỗi phân hạch gây ra phân hạch tiếp theo.</p>
            <ul style={{ margin: "8px 0 0", paddingLeft: "20px", fontSize: "13px" }}>
              <li><strong>k &lt; 1:</strong> Phản ứng tắt dần.</li>
              <li><strong>k = 1:</strong> Phản ứng duy trì (lò phản ứng).</li>
              <li><strong>k &gt; 1:</strong> Phản ứng bùng nổ (bom). Nhờ kích thước khối lượng đạt tới hạn, trong mô phỏng này k &gt; 1.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="physics-checklist">
        <p><strong>Tiêu chí hoàn thành:</strong></p>
        <ul>
          <li className={hasStarted ? 'is-done' : ''}>Khởi tạo phản ứng phân hạch dây chuyền {hasStarted ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi kiểm tra {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div onClickCapture={handleAnswered}>
        <ChoiceCheck 
          question="Để duy trì hoạt động của nhà máy điện hạt nhân ổn định, người ta cần điều chỉnh hệ số nhân neutron k bằng bao nhiêu?" 
          options={[
            'k > 1', 
            'k = 1', 
            'k < 1'
          ]} 
          correctIndex={1} 
          explanation="Để phản ứng duy trì tĩnh ở mức năng lượng không đổi, số neutron sinh ra thế hệ sau phải bằng đúng thế hệ trước (k = 1). Người ta dùng thanh điều khiển hấp thụ bớt n để giữ k=1 (SGK tr.101)." 
        />
      </div>
    </Lab>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   4. PHẢN ỨNG NHIỆT HẠCH
   SGK tr. 102
   ────────────────────────────────────────────────────────────────────────────── */

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
        setStatusText("Tốc độ chậm: Động năng nhỏ, bị lực đẩy tĩnh điện (Coulomb) đẩy ngược lại.");
        setHasTriedSlow(true);
        checkDone(true, hasTriedFast, hasAnswered);
      } else {
        setStatusText("Tốc độ cực lớn (nhiệt độ chục triệu độ): Vượt rào Coulomb, nhiệt hạch xảy ra!");
        setHasTriedFast(true);
        checkDone(hasTriedSlow, true, hasAnswered);
      }
    }, 50);
  };

  function handleAnswered() {
    setHasAnswered(true);
    checkDone(hasTriedSlow, hasTriedFast, true);
  }

  return (
    <Lab 
      intro="Mô phỏng phản ứng nhiệt hạch (tổng hợp hạt nhân nhẹ thành nặng). Phản ứng minh hoạ: ²H + ³H → ⁴He + ¹n." 
      note="Hai hạt nhân đều mang điện dương nên lực đẩy Coulomb giữa chúng rất mạnh. Chỉ khi có động năng cực lớn (nhiệt độ hàng chục triệu độ), chúng mới tiến đủ gần để lực hạt nhân phát huy tác dụng."
    >
      <div className="physics-guide">
        <p><strong>💥 Chu trình khám phá:</strong></p>
        <ol>
          <li><strong>Thử chậm:</strong> Bắn hai hạt với tốc độ bình thường (nhiệt độ phòng). Quan sát lực đẩy.</li>
          <li><strong>Thử nhanh:</strong> Bắn với tốc độ cực lớn (đốt nóng hàng chục triệu độ C). Quan sát phản ứng.</li>
          <li><strong>Giải thích:</strong> Trả lời câu hỏi về điều kiện xảy ra nhiệt hạch.</li>
        </ol>
      </div>

      <div className="physics-controls">
        <button type="button" className="physics-button" onClick={() => fire("slow")}>
          Bắn chậm (Động năng nhỏ)
        </button>
        <button type="button" className="physics-button primary" onClick={() => fire("fast")}>
          Bắn rất nhanh (Nhiệt độ siêu cao)
        </button>
      </div>
      
      <p style={{ marginTop: "12px", color: "var(--text-secondary)", fontSize: "14px" }}>
        Trạng thái: <strong>{statusText}</strong>
      </p>

      <div style={{ position: "relative", width: "100%", height: "200px", backgroundColor: "#0f172a", border: "1px solid var(--border-light)", borderRadius: "8px", overflow: "hidden", margin: "16px 0" }}>
        
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
            45% { transform: translateX(170px); opacity: 1; }
            50% { transform: translateX(180px); opacity: 0; }
            100% { transform: translateX(180px); opacity: 0; }
          }
          @keyframes moveLeftFast {
            0% { transform: translateX(0); }
            45% { transform: translateX(-170px); opacity: 1; }
            50% { transform: translateX(-180px); opacity: 0; }
            100% { transform: translateX(-180px); opacity: 0; }
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
          @keyframes energyWave {
            0% { opacity: 0; r: 0; }
            49% { opacity: 0; r: 0; }
            50% { opacity: 1; r: 20px; stroke-width: 10px; }
            100% { opacity: 0; r: 150px; stroke-width: 2px; }
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
          
          {/* Sóng năng lượng 17.6 MeV */}
          <circle cx="250" cy="100" r="0" fill="none" stroke="#f59e0b" style={{ animation: speed === "fast" ? "energyWave 1s ease-out forwards" : "none" }} />
          
          {speed === "fast" && (
            <text x="250" y="50" fill="#fcd34d" fontSize="16" fontWeight="bold" textAnchor="middle" style={{ animation: "popN 1s forwards" }}>
              + 17.6 MeV
            </text>
          )}

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
          <li className={hasTriedSlow ? 'is-done' : ''}>Thử bắn với tốc độ chậm (thấy lực đẩy) {hasTriedSlow ? '✓' : ''}</li>
          <li className={hasTriedFast ? 'is-done' : ''}>Thử bắn với tốc độ siêu nhanh (nhân tổng hợp) {hasTriedFast ? '✓' : ''}</li>
          <li className={hasAnswered ? 'is-done' : ''}>Trả lời câu hỏi giải thích {hasAnswered ? '✓' : ''}</li>
        </ul>
      </div>

      <div onClickCapture={handleAnswered}>
        <ChoiceCheck 
          question="Tại sao phản ứng nhiệt hạch lại cần nhiệt độ vô cùng cao (hàng chục triệu độ C)?" 
          options={[
            'Để các nguyên tử nóng chảy thành chất lỏng.', 
            'Để tạo ra các neutron kích hoạt phản ứng.', 
            'Để cung cấp cho hạt nhân động năng đủ lớn nhằm thắng được lực đẩy tĩnh điện (Coulomb).'
          ]} 
          correctIndex={2} 
          explanation="Các hạt nhân đều mang điện tích dương nên lực đẩy Coulomb rất mạnh. Nhiệt độ siêu cao làm các hạt chuyển động cực nhanh (động năng lớn) giúp chúng lại gần nhau tới khoảng cách mà lực hạt nhân (lực hút) bắt đầu phát huy tác dụng." 
        />
      </div>
    </Lab>
  );
}
