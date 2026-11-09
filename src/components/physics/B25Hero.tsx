"use client";

import { useState } from "react";
import { B25_HERO, B25_SCENES } from "@/lib/b25-content";
import styles from "./B25Hero.module.css";

type SceneId = (typeof B25_SCENES)[number]["id"];

const CHOICES = [
  { label: "Khoảng 40 giây", correct: false, why: "40 s cho H(30 s) ≈ 90 Bq, nhưng bảng ghi 85 Bq — lệch khoảng 5 Bq. Chưa phải khớp tốt nhất." },
  { label: "Khoảng 60 giây", correct: false, why: "60 s cho H(30 s) ≈ 107 Bq, lệch tới 22 Bq so với 85 Bq. Đường giảm quá chậm." },
  { label: "Khoảng 50 giây", correct: false, why: "50 s cho H(30 s) ≈ 99 Bq, vẫn lệch 14 Bq. Đây không phải đáp án tốt nhất trong ba lựa chọn." },
  { label: "Không chọn được chỉ từ một mốc", correct: true, why: "Đúng. Một điểm chưa đủ. Mức nửa 75,5 Bq nằm giữa 85 Bq (30 s) và 55 Bq (60 s); nội suy thẳng cho ≈ 39,5 s, còn khớp cả tám điểm thì cho T ≈ 40–45 s. Phải đọc nhiều mốc rồi mới kết luận." },
];

export function B25Hero() {
  const [scene, setScene] = useState<SceneId>("context");
  const [choice, setChoice] = useState<number | null>(null);

  const index = B25_SCENES.findIndex((s) => s.id === scene);
  const current = B25_SCENES[index];
  const canGoBack = index > 0;
  const canGoNext = index < B25_SCENES.length - 1;
  const isQuestion = scene === "application";
  const answered = choice !== null;
  const chosen = choice === null ? null : CHOICES[choice];

  return (
    <section className={styles.hero} aria-labelledby="b25-title">
      <div className={styles.container}>
        <div className={styles.eyebrow}>{B25_HERO.eyebrow}</div>
        <h1 id="b25-title" className={styles.title}>{B25_HERO.title}</h1>
        <p className={styles.pages}>{B25_HERO.pages}</p>
        <p className={styles.lead}>{B25_HERO.lead}</p>

        <div className={styles.facts}>
          {B25_HERO.facts.map((f) => (
            <div key={f.label} className={styles.fact}>
              <span className={styles.factLabel}>{f.label}</span>
              <span className={styles.factValue}>{f.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.storyCard}>
          <div className={styles.sceneHeader}>
            <span className={styles.sceneNumber}>Cảnh {index + 1} / {B25_SCENES.length}</span>
            <h2 className={styles.sceneTitle}>{current.title}</h2>
          </div>

          <div className={styles.sceneContent}>
            <div className={styles.sceneVisual} data-scene={scene}>
              {scene === "context" && (
                <svg viewBox="0 0 400 280" role="img" aria-label="Ba nhóm kĩ năng của bài luyện tập: đồ thị, phương trình, năng lượng.">
                  <title>Ba nhóm kĩ năng</title>
                  {[
                    { x: 70, y: 90, fill: "#bfdbfe", stroke: "#2563eb", label: "Đồ thị", sub: "H(t) → T" },
                    { x: 200, y: 90, fill: "#ddd6fe", stroke: "#7c3aed", label: "Phương trình", sub: "A, Z" },
                    { x: 330, y: 90, fill: "#fde68a", stroke: "#d97706", label: "Năng lượng", sub: "Δm → Elk" },
                  ].map((b) => (
                    <g key={b.label}>
                      <rect x={b.x - 52} y={b.y - 32} width="104" height="64" rx="10" fill={b.fill} stroke={b.stroke} strokeWidth="2" />
                      <text x={b.x} y={b.y - 4} textAnchor="middle" fontSize="14" fontWeight="700" fill={b.stroke}>{b.label}</text>
                      <text x={b.x} y={b.y + 16} textAnchor="middle" fontSize="12" fill="#334155">{b.sub}</text>
                    </g>
                  ))}
                  <path d="M122 90 H148" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M252 90 H278" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
                  <text x="200" y="185" textAnchor="middle" fontSize="13" fill="#475569">ba kĩ năng · cùng định luật bảo toàn</text>
                  <rect x="60" y="205" width="280" height="34" rx="8" fill="#f1f5f9" stroke="#cbd5e1" />
                  <text x="200" y="227" textAnchor="middle" fontSize="12" fill="#334155">A, Z bảo toàn · N = N₀·2^(−t/T) · Elk = Δm·c²</text>
                </svg>
              )}

              {scene === "graph" && (
                <svg viewBox="0 0 400 280" role="img" aria-label="Đường cong độ phóng xạ giảm dần theo thời gian, minh họa Bảng 25.1.">
                  <title>Độ phóng xạ H(t)</title>
                  <path d="M52 24V232H372" fill="none" stroke="#526680" strokeWidth="2" />
                  {[151, 113, 75.5, 38].map((v, i) => (
                    <g key={v}>
                      <line x1="52" y1={232 - i * 52} x2="372" y2={232 - i * 52} stroke="#e2e8f0" />
                      <text x="46" y={236 - i * 52} textAnchor="end" fontSize="10" fill="#64748b">{v}</text>
                    </g>
                  ))}
                  <polyline points="52,30 100,96 148,130 220,168 268,186 316,200 340,207 364,212" fill="none" stroke="#2563eb" strokeWidth="3" />
                  {[[52, 30], [100, 96], [148, 130], [220, 168], [268, 186], [316, 200], [340, 207], [364, 212]].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="4.5" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
                  ))}
                  <line x1="52" y1={232 - 2 * 52} x2="372" y2={232 - 2 * 52} stroke="#d97706" strokeWidth="2" strokeDasharray="6 4" />
                  <text x="372" y={232 - 2 * 52 - 6} textAnchor="end" fontSize="10" fill="#b45309">75,5 Bq</text>
                  <text x="200" y="258" textAnchor="middle" fontSize="12" fill="#334155">t (s)</text>
                  <text x="52" y="18" fontSize="12" fill="#334155">H (Bq)</text>
                </svg>
              )}

              {scene === "equation" && (
                <svg viewBox="0 0 400 280" role="img" aria-label="Cân bằng phương trình hạt nhân theo số khối A và điện tích Z.">
                  <title>Bảo toàn A và Z</title>
                  <text x="200" y="48" textAnchor="middle" fontSize="18" fill="#0f172a">²³⁸₉₂U → ²³⁴₉₀Th + ⁴₂He</text>
                  <rect x="46" y="72" width="308" height="72" rx="8" fill="#eff6ff" stroke="#93c5fd" />
                  <text x="62" y="96" fontSize="12" fill="#1e40af">A: 238 = 234 + 4</text>
                  <text x="62" y="118" fontSize="12" fill="#1e40af">Z: 92 = 90 + 2</text>
                  <text x="62" y="138" fontSize="11" fill="#64748b">Cân bằng → hạt nhân con đúng là Th-234</text>
                  <text x="200" y="186" textAnchor="middle" fontSize="16" fill="#0f172a">¹⁴₆C → ¹⁴₇N + ⁰₋₁e + ν̄ₑ</text>
                  <rect x="46" y="204" width="308" height="56" rx="8" fill="#fdf4ff" stroke="#e9d5ff" />
                  <text x="62" y="226" fontSize="12" fill="#6b21a8">A: 14 = 14 + 0 + 0</text>
                  <text x="62" y="246" fontSize="12" fill="#6b21a8">Z: 6 = 7 + (−1) + 0 · cần phản neutrino</text>
                </svg>
              )}

              {scene === "energy" && (
                <svg viewBox="0 0 400 280" role="img" aria-label="Công thức độ hụt khối và năng lượng liên kết.">
                  <title>Độ hụt khối</title>
                  <text x="200" y="40" textAnchor="middle" fontSize="14" fill="#334155">Nucleon rời → hạt nhân liên kết</text>
                  {[70, 130, 190].map((x, i) => (
                    <circle key={i} cx={x} cy={88} r="14" fill={i % 2 ? "#2357a5" : "#b84040"} stroke="#fff" strokeWidth="2" />
                  ))}
                  <text x="240" y="94" fontSize="13" fill="#334155">tổng m &gt; m hạt nhân</text>
                  <polyline points="110,116 110,146 290,146" fill="none" stroke="#94a3b8" strokeWidth="2" />
                  <polygon points="290,146 280,140 280,152" fill="#94a3b8" />
                  <rect x="64" y="166" width="272" height="94" rx="8" fill="#fffbeb" stroke="#fcd34d" />
                  <text x="80" y="190" fontSize="12" fill="#92400e">Δm = Z·m(H) + N·m(n) − m(hạt nhân)</text>
                  <text x="80" y="212" fontSize="12" fill="#92400e">Elk = Δm · c² ≈ Δm · 931,5 MeV/u</text>
                  <text x="80" y="234" fontSize="12" fill="#92400e">Elk/A → so sánh độ bền hạt nhân</text>
                  <text x="80" y="252" fontSize="11" fill="#78350f">Fe-56: 8,79 · U-235: 7,59 MeV/nucleon</text>
                </svg>
              )}

              {scene === "application" && (
                <div style={{ width: "100%", display: "grid", gap: 10 }}>
                  <div className={styles.question}>
                    <p><strong>{B25_HERO.story.challenge}</strong></p>
                    <div className={styles.choices}>
                      {CHOICES.map((c, i) => (
                        <button
                          key={c.label}
                          type="button"
                          className={i === choice ? styles.choicePrimary : styles.choice}
                          aria-pressed={i === choice}
                          onClick={() => setChoice(i)}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                    {chosen && (
                      <div className={styles.verdict} data-correct={String(chosen.correct)} role="status">
                        <strong>{chosen.correct ? "✓ Chính xác. " : "✗ Chưa đúng. "}</strong>
                        {chosen.why}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.sceneText}>
              {scene === "context" && <p>{B25_HERO.story.context}</p>}
              {scene === "graph" && <p>{B25_HERO.story.graph}</p>}
              {scene === "equation" && <p>{B25_HERO.story.equation}</p>}
              {scene === "energy" && <p>{B25_HERO.story.energy}</p>}
              {scene === "application" && <p>{B25_HERO.story.application}</p>}
            </div>
          </div>

          <div className={styles.sceneNav}>
            <button type="button" onClick={() => canGoBack && setScene(B25_SCENES[index - 1].id)} disabled={!canGoBack} className={styles.navButton} aria-label="Cảnh trước">
              ← Trước
            </button>
            <div className={styles.sceneIndicators}>
              {B25_SCENES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScene(s.id)}
                  className={styles.indicator}
                  data-active={s.id === scene}
                  aria-label={`Cảnh ${i + 1}: ${s.title}`}
                  aria-current={s.id === scene ? "step" : undefined}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => canGoNext && setScene(B25_SCENES[index + 1].id)}
              disabled={!canGoNext || (isQuestion && !answered)}
              className={styles.navButton}
              aria-label="Cảnh tiếp theo"
            >
              Tiếp →
            </button>
          </div>
        </div>

        <details className={styles.credit}>
          <summary>Nguồn và ghi chú</summary>
          <p><strong>Số liệu:</strong> Bảng 25.1, SGK Vật lí 12 Kết nối tri thức, trang in 121. Tám mốc đo được giữ nguyên, không thay bằng số sinh ngẫu nhiên.</p>
          <p><strong>Hình vẽ:</strong> Minh họa tái dựng theo nội dung SGK. Không phải ảnh chụp hay đồ thị gốc.</p>
        </details>
      </div>
    </section>
  );
}
