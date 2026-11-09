"use client";

import { useState } from "react";
import { B21_HERO, B21_SCENES } from "@/lib/b21-content";
import styles from "./B21Hero.module.css";

type SceneId = (typeof B21_SCENES)[number]["id"];

const CHOICES = [
  {
    label: "Vì lá vàng chỉ chắn một phần nhỏ chùm hạt.",
    correct: false,
    why: "Lá vàng dày hàng nghìn lớp nguyên tử, hạt alpha phải xuyên qua toàn bộ. Không phải hình học của lá tạo ra tỉ lệ đó.",
  },
  {
    label: "Vì điện tích dương tập trung trong một vùng cực nhỏ, nên phần lớn hạt đi qua vùng trống.",
    correct: true,
    why: "Đúng. Nguyên tử gần như trống rỗng: hạt nhân chiếm tỉ lệ diện tích cực nhỏ so với toàn nguyên tử. Hạt nào đi đủ gần hạt nhân mới chịu lực đẩy Coulomb đủ lớn để bật ngược — khoảng một phần tám nghìn lượt.",
  },
  {
    label: "Vì hạt alpha mất dần năng lượng khi bay qua lá.",
    correct: false,
    why: "Mất năng lượng có xảy ra, nhưng nó làm hạt chậm lại chứ không tạo ra nhóm hạt bật ngược góc lớn. Bật ngược đòi một lực đẩy mạnh ở khoảng cách rất ngắn.",
  },
];

export function B21Hero() {
  const [scene, setScene] = useState<SceneId>("context");
  const [choice, setChoice] = useState<number | null>(null);

  const index = B21_SCENES.findIndex((s) => s.id === scene);
  const current = B21_SCENES[index];
  const canGoBack = index > 0;
  const canGoNext = index < B21_SCENES.length - 1;
  const isQuestion = scene === "observation";
  const chosen = choice === null ? null : CHOICES[choice];

  const texts: Record<SceneId, string> = {
    context: B21_HERO.story.context,
    setup: B21_HERO.story.setup,
    observation: B21_HERO.story.observation,
    reveal: B21_HERO.story.reveal,
    structure: B21_HERO.story.structure,
  };

  return (
    <section className={styles.hero} aria-labelledby="b21-title">
      <div className={styles.container}>
        <div className={styles.eyebrow}>{B21_HERO.eyebrow}</div>
        <h1 id="b21-title" className={styles.title}>{B21_HERO.title}</h1>
        <p className={styles.pages}>{B21_HERO.pages}</p>
        <p className={styles.lead}>{B21_HERO.lead}</p>

        <div className={styles.facts}>
          {B21_HERO.facts.map((f) => (
            <div key={f.label} className={styles.fact}>
              <span className={styles.factLabel}>{f.label}</span>
              <span className={styles.factValue}>{f.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.storyCard}>
          <div className={styles.sceneHeader}>
            <span className={styles.sceneNumber}>Cảnh {index + 1} / {B21_SCENES.length}</span>
            <h2 className={styles.sceneTitle}>{current.title}</h2>
          </div>

          <div className={styles.sceneContent}>
            <div className={styles.sceneVisual} data-scene={scene}>
              {scene === "context" && (
                <svg viewBox="0 0 400 280" role="img" aria-label="Mô hình Thomson: quả cầu tích điện dương đều với electron bên trong, và câu hỏi thay thế.">
                  <title>Hai mô hình nguyên tử</title>
                  <circle cx="130" cy="120" r="74" fill="#dbeafe" stroke="#60a5fa" strokeWidth="2" />
                  <text x="130" y="60" textAnchor="middle" fontSize="12" fill="#1e40af">Mô hình Thomson</text>
                  {[
                    [104, 96], [150, 88], [118, 132], [156, 138], [128, 164], [96, 150],
                  ].map(([cx, cy]) => (
                    <g key={`${cx}-${cy}`}>
                      <circle cx={cx} cy={cy} r="7" fill="#1d4ed8" />
                      <text x={cx} y={cy + 3} textAnchor="middle" fontSize="9" fill="#fff">−</text>
                    </g>
                  ))}
                  <text x="130" y="215" textAnchor="middle" fontSize="11" fill="#475569">điện tích dương trải đều</text>
                  <path d="M218 120 H258" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 4" />
                  <polygon points="258,120 248,114 248,126" fill="#94a3b8" />
                  <circle cx="308" cy="120" r="34" fill="#fee2e2" stroke="#f87171" strokeWidth="2" />
                  <text x="308" y="124" textAnchor="middle" fontSize="13" fontWeight="700" fill="#991b1b">+Ze</text>
                  <text x="308" y="175" textAnchor="middle" fontSize="12" fill="#991b1b">hạt nhân?</text>
                  <text x="200" y="248" textAnchor="middle" fontSize="12" fill="#475569">Rutherford kiểm tra bằng chùm hạt alpha</text>
                </svg>
              )}

              {scene === "setup" && (
                <svg viewBox="0 0 400 280" role="img" aria-label="Bố trí thí nghiệm: nguồn alpha, khe hẹp, lá vàng, màn huỳnh quang.">
                  <title>Bố trí thí nghiệm tán xạ alpha</title>
                  <rect x="24" y="118" width="40" height="34" rx="4" fill="#a16207" />
                  <text x="44" y="170" textAnchor="middle" fontSize="11" fill="#78350f">nguồn α</text>
                  <rect x="88" y="108" width="10" height="54" fill="#64748b" />
                  <rect x="98" y="108" width="10" height="54" fill="#64748b" />
                  <text x="98" y="182" textAnchor="middle" fontSize="11" fill="#475569">khe hẹp</text>
                  <line x1="64" y1="135" x2="200" y2="135" stroke="#dc2626" strokeWidth="1.6" strokeDasharray="4 3" />
                  <rect x="196" y="60" width="6" height="150" fill="#fbbf24" stroke="#d97706" />
                  <text x="199" y="234" textAnchor="middle" fontSize="11" fill="#92400e">lá vàng</text>
                  <line x1="202" y1="135" x2="360" y2="135" stroke="#dc2626" strokeWidth="1.6" strokeDasharray="4 3" />
                  <line x1="202" y1="135" x2="340" y2="86" stroke="#dc2626" strokeWidth="1.4" strokeDasharray="4 3" />
                  <line x1="202" y1="135" x2="330" y2="196" stroke="#dc2626" strokeWidth="1.4" strokeDasharray="4 3" />
                  <path d="M312 40 A190 190 0 0 1 312 230" fill="none" stroke="#22c55e" strokeWidth="3" />
                  <text x="330" y="52" fontSize="11" fill="#15803d">màn huỳnh quang</text>
                  <text x="200" y="264" textAnchor="middle" fontSize="11" fill="#475569">toàn bộ đặt trong chân không</text>
                </svg>
              )}

              {scene === "observation" && (
                <div style={{ width: "100%", display: "grid", gap: 10 }}>
                  <svg viewBox="0 0 400 150" role="img" aria-label="Ba nhóm kết quả: phần lớn đi thẳng, một số lệch nhỏ, rất ít bật ngược.">
                    <title>Phân bố góc tán xạ</title>
                    {[
                      { x: 90, angle: 0, label: "phần lớn", count: "≈ 8000 / 8000" },
                      { x: 210, angle: -28, label: "một số", count: "lệch nhỏ" },
                      { x: 320, angle: -160, label: "1 / 8000", count: "bật ngược" },
                    ].map((g) => (
                      <g key={g.label}>
                        <line
                          x1={g.x}
                          y1="108"
                          x2={g.x + Math.sin((g.angle * Math.PI) / 180) * 62}
                          y2={108 - Math.cos((g.angle * Math.PI) / 180) * 62}
                          stroke="#dc2626"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                        />
                        <circle cx={g.x} cy="110" r="6" fill="#fbbf24" stroke="#d97706" />
                        <text x={g.x} y="140" textAnchor="middle" fontSize="11" fill="#334155">{g.label}</text>
                        <text x={g.x} y="26" textAnchor="middle" fontSize="10" fill="#64748b">{g.count}</text>
                      </g>
                    ))}
                  </svg>
                  <div className={styles.question}>
                    <p><strong>{B21_HERO.story.challenge}</strong></p>
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

              {scene === "reveal" && (
                <svg viewBox="0 0 400 280" role="img" aria-label="So sánh kích thước nguyên tử và hạt nhân.">
                  <title>Nguyên tử gần như trống rỗng</title>
                  <circle cx="200" cy="120" r="96" fill="none" stroke="#93c5fd" strokeWidth="2" strokeDasharray="6 5" />
                  <text x="200" y="18" textAnchor="middle" fontSize="12" fill="#1e40af">nguyên tử · cỡ 10⁻¹⁰ m</text>
                  <circle cx="200" cy="120" r="4" fill="#dc2626" />
                  <circle cx="200" cy="120" r="260" fill="none" stroke="#fecaca" strokeWidth="1" opacity="0.5" />
                  <line x1="188" y1="120" x2="64" y2="120" stroke="#94a3b8" strokeDasharray="3 3" />
                  <text x="126" y="112" textAnchor="middle" fontSize="10" fill="#64748b">bé hơn 10⁴–10⁵ lần</text>
                  <text x="200" y="238" textAnchor="middle" fontSize="12" fill="#991b1b">hạt nhân · cỡ 10⁻¹⁴–10⁻¹⁵ m</text>
                  <text x="200" y="262" textAnchor="middle" fontSize="11" fill="#475569">không theo tỉ lệ thật</text>
                </svg>
              )}

              {scene === "structure" && (
                <svg viewBox="0 0 400 280" role="img" aria-label="Kí hiệu hạt nhân với số khối A, số proton Z, và quy luật bán kính.">
                  <title>Kí hiệu hạt nhân</title>
                  <text x="130" y="96" textAnchor="middle" fontSize="46" fill="#0f172a">
                    <tspan fontSize="22" dy="-22" dx="-16">28</tspan>
                    <tspan fontSize="22" dy="22">14</tspan>
                  </text>
                  <text x="176" y="96" textAnchor="middle" fontSize="46" fill="#0f172a">Si</text>
                  <text x="130" y="140" textAnchor="middle" fontSize="11" fill="#64748b">A = 28</text>
                  <text x="180" y="140" textAnchor="middle" fontSize="11" fill="#64748b">Z = 14</text>
                  <rect x="248" y="60" width="126" height="80" rx="8" fill="#f0fdf4" stroke="#86efac" />
                  <text x="311" y="86" textAnchor="middle" fontSize="11" fill="#166534">Z = 14 proton</text>
                  <text x="311" y="106" textAnchor="middle" fontSize="11" fill="#166534">N = A − Z = 14</text>
                  <text x="311" y="126" textAnchor="middle" fontSize="11" fill="#166534">+14e điện tích</text>
                  <rect x="60" y="170" width="280" height="76" rx="8" fill="#fffbeb" stroke="#fcd34d" />
                  <text x="200" y="196" textAnchor="middle" fontSize="12" fill="#92400e">R ≈ 1,2 · A^(1/3) fm</text>
                  <text x="200" y="218" textAnchor="middle" fontSize="11" fill="#a16207">A tăng 8 lần → R tăng 2 lần</text>
                  <text x="200" y="238" textAnchor="middle" fontSize="11" fill="#a16207">thể tích mới tỉ lệ với A</text>
                </svg>
              )}
            </div>

            <div className={styles.sceneText}>
              <p>{texts[scene]}</p>
            </div>
          </div>

          <div className={styles.sceneNav}>
            <button type="button" onClick={() => canGoBack && setScene(B21_SCENES[index - 1].id)} disabled={!canGoBack} className={styles.navButton} aria-label="Cảnh trước">
              ← Trước
            </button>
            <div className={styles.sceneIndicators}>
              {B21_SCENES.map((s, i) => (
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
              onClick={() => canGoNext && setScene(B21_SCENES[index + 1].id)}
              disabled={!canGoNext || (isQuestion && choice === null)}
              className={styles.navButton}
              aria-label="Cảnh tiếp theo"
            >
              Tiếp →
            </button>
          </div>
        </div>

        <details className={styles.credit}>
          <summary>Nguồn và ghi chú</summary>
          <p><strong>Thí nghiệm:</strong> Ernest Rutherford, {'”'}The Scattering of α and β Particles by Matter and the Structure of the Atom{'”'}, Philosophical Magazine, 1911. Tỉ lệ 1/8000 là con số Rutherford công bố cho góc tán xạ lớn hơn 90°.</p>
          <p><strong>Hình vẽ:</strong> Minh họa tái dựng theo nội dung SGK Vật lí 12 KNTT trang 91–92. Không theo tỉ lệ kích thước thật.</p>
        </details>
      </div>
    </section>
  );
}
