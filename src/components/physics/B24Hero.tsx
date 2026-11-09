"use client";

import { useState } from "react";
import { B24_HERO, B24_SCENES } from "@/lib/b24-content";
import styles from "./B24Hero.module.css";

type SceneId = (typeof B24_SCENES)[number]["id"];

const CHOICES = [
  {
    label: "k giảm, số phân hạch giảm dần qua các thế hệ.",
    correct: true,
    why: "Đúng. Thanh điều khiển hấp thụ neutron, nên mỗi thế hệ có ít neutron hơn thế hệ trước. k < 1 khiến phản ứng tắt dần — đây là cách dập lò.",
  },
  {
    label: "k tăng, số phân hạch tăng qua các thế hệ.",
    correct: false,
    why: "Ngược lại. Rút thanh điều khiển ra khỏi lõi làm giảm hấp thụ neutron, khi đó k tăng.",
  },
  {
    label: "k không đổi, vì thanh điều khiển chỉ hấp thụ nhiệt.",
    correct: false,
    why: "Thanh điều khiển hấp thụ neutron, không phải nhiệt. Chất tải nhiệt mới là bộ phận mang nhiệt ra khỏi lõi.",
  },
];

export function B24Hero() {
  const [scene, setScene] = useState<SceneId>("context");
  const [choice, setChoice] = useState<number | null>(null);

  const index = B24_SCENES.findIndex((s) => s.id === scene);
  const current = B24_SCENES[index];
  const canGoBack = index > 0;
  const canGoNext = index < B24_SCENES.length - 1;
  const isQuestion = scene === "reactor";
  const chosen = choice === null ? null : CHOICES[choice];

  const texts: Record<SceneId, string> = {
    context: B24_HERO.story.context,
    reactor: B24_HERO.story.reactor,
    flow: B24_HERO.story.flow,
    medicine: B24_HERO.story.medicine,
    food: B24_HERO.story.food,
  };

  return (
    <section className={styles.hero} aria-labelledby="b24-title">
      <div className={styles.container}>
        <div className={styles.eyebrow}>{B24_HERO.eyebrow}</div>
        <h1 id="b24-title" className={styles.title}>{B24_HERO.title}</h1>
        <p className={styles.pages}>{B24_HERO.pages}</p>
        <p className={styles.lead}>{B24_HERO.lead}</p>

        <div className={styles.facts}>
          {B24_HERO.facts.map((f) => (
            <div key={f.label} className={styles.fact}>
              <span className={styles.factLabel}>{f.label}</span>
              <span className={styles.factValue}>{f.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.storyCard}>
          <div className={styles.sceneHeader}>
            <span className={styles.sceneNumber}>Cảnh {index + 1} / {B24_SCENES.length}</span>
            <h2 className={styles.sceneTitle}>{current.title}</h2>
          </div>

          <div className={styles.sceneContent}>
            <div className={styles.sceneVisual} data-scene={scene}>
              {scene === "context" && (
                <svg viewBox="0 0 400 280" role="img" aria-label="Ba lĩnh vực ứng dụng: nhà máy điện, bệnh viện, trung tâm chiếu xạ.">
                  <title>Ba lĩnh vực ứng dụng</title>
                  {[
                    { x: 74, label: "Nhà máy điện", sub: "phân hạch → điện", fill: "#dbeafe", stroke: "#2563eb" },
                    { x: 200, label: "Bệnh viện", sub: "PET · SPECT · xạ trị", fill: "#dcfce7", stroke: "#16a34a" },
                    { x: 326, label: "Chiếu xạ", sub: "nông sản · thiết bị", fill: "#fef3c7", stroke: "#d97706" },
                  ].map((b) => (
                    <g key={b.label}>
                      <rect x={b.x - 60} y="72" width="120" height="96" rx="12" fill={b.fill} stroke={b.stroke} strokeWidth="2" />
                      <text x={b.x} y="112" textAnchor="middle" fontSize="13" fontWeight="700" fill={b.stroke}>{b.label}</text>
                      <text x={b.x} y="134" textAnchor="middle" fontSize="10" fill="#475569">{b.sub.split(" · ")[0]}</text>
                      <text x={b.x} y="150" textAnchor="middle" fontSize="10" fill="#475569">{b.sub.split(" · ").slice(1).join(" · ")}</text>
                    </g>
                  ))}
                  <text x="200" y="206" textAnchor="middle" fontSize="12" fill="#475569">cùng một nguyên lí: phản ứng hạt nhân có kiểm soát</text>
                  <rect x="70" y="222" width="260" height="30" rx="8" fill="#f1f5f9" stroke="#cbd5e1" />
                  <text x="200" y="242" textAnchor="middle" fontSize="11" fill="#334155">Fermi, Chicago, 2/12/1942 — lò phản ứng đầu tiên</text>
                </svg>
              )}

              {scene === "reactor" && (
                <div style={{ width: "100%", display: "grid", gap: 10 }}>
                  <svg viewBox="0 0 400 150" role="img" aria-label="Sáu thanh điều khiển cắm vào lõi lò phản ứng, hấp thụ neutron.">
                    <title>Điều khiển bằng thanh hấp thụ</title>
                    <rect x="60" y="42" width="280" height="96" rx="10" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
                    {[90, 130, 170, 210, 250, 290].map((x, i) => (
                      <g key={x}>
                        <rect x={x - 7} y="18" width="14" height={i % 2 ? 74 : 52} rx="3" fill="#475569" />
                        <text x={x} y="112" textAnchor="middle" fontSize="9" fill="#0c4a6e">B₄C</text>
                      </g>
                    ))}
                    {[110, 190, 270].map((x) => (
                      <circle key={x} cx={x} cy="126" r="3.5" fill="#f59e0b" />
                    ))}
                    <text x="200" y="14" textAnchor="middle" fontSize="10" fill="#334155">thanh điều khiển</text>
                    <text x="200" y="150" textAnchor="middle" fontSize="10" fill="#64748b">cắm sâu → hấp thụ nhiều neutron → k giảm</text>
                  </svg>
                  <div className={styles.question}>
                    <p><strong>{B24_HERO.story.challenge}</strong></p>
                    <div className={styles.choices}>
                      {CHOICES.map((c, i) => (
                        <button key={c.label} type="button" className={i === choice ? styles.choicePrimary : styles.choice} aria-pressed={i === choice} onClick={() => setChoice(i)}>
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

              {scene === "flow" && (
                <svg viewBox="0 0 400 280" role="img" aria-label="Sơ đồ hai vòng nước của lò PWR: lõi, bộ trao đổi nhiệt, tuabin, máy phát.">
                  <title>Hai vòng nước của lò PWR</title>
                  <rect x="24" y="76" width="88" height="106" rx="10" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
                  <text x="68" y="118" textAnchor="middle" fontSize="11" fontWeight="700" fill="#991b1b">Lõi lò</text>
                  <text x="68" y="136" textAnchor="middle" fontSize="9" fill="#b91c1c">phân hạch</text>
                  <text x="68" y="152" textAnchor="middle" fontSize="9" fill="#b91c1c">→ nhiệt</text>
                  <text x="68" y="204" textAnchor="middle" fontSize="9" fill="#64748b">vòng sơ cấp</text>
                  <path d="M116 104 H178" stroke="#dc2626" strokeWidth="3" strokeDasharray="6 4" />
                  <polygon points="178,104 168,98 168,110" fill="#dc2626" />
                  <rect x="178" y="70" width="76" height="118" rx="8" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
                  <text x="216" y="112" textAnchor="middle" fontSize="10" fill="#0c4a6e">trao đổi</text>
                  <text x="216" y="126" textAnchor="middle" fontSize="10" fill="#0c4a6e">nhiệt</text>
                  <text x="216" y="146" textAnchor="middle" fontSize="9" fill="#0369a1">nước sôi</text>
                  <path d="M254 104 H302" stroke="#0284c7" strokeWidth="3" />
                  <polygon points="302,104 292,98 292,110" fill="#0284c7" />
                  <circle cx="322" cy="104" r="22" fill="#f1f5f9" stroke="#475569" strokeWidth="2" />
                  <text x="322" y="108" textAnchor="middle" fontSize="10" fill="#334155">tuabin</text>
                  <text x="322" y="146" textAnchor="middle" fontSize="9" fill="#475569">máy phát</text>
                  <text x="322" y="204" textAnchor="middle" fontSize="9" fill="#64748b">vòng thứ cấp</text>
                  <text x="200" y="246" textAnchor="middle" fontSize="11" fill="#475569">hai vòng tách biệt — vòng thứ cấp không nhiễm phóng xạ</text>
                </svg>
              )}

              {scene === "medicine" && (
                <svg viewBox="0 0 400 280" role="img" aria-label="Ba hướng ứng dụng y học hạt nhân: PET, SPECT, xạ trị.">
                  <title>Y học hạt nhân</title>
                  {[
                    { y: 44, label: "PET", iso: "¹⁸F · T = 110 phút", desc: "chẩn đoán chức năng" },
                    { y: 118, label: "SPECT", iso: "⁹⁹ᵐTc · T = 6 giờ", desc: "chẩn đoán hình ảnh" },
                    { y: 192, label: "Xạ trị", iso: "⁶⁰Co · T = 5,3 năm", desc: "điều trị ung thư" },
                  ].map((r) => (
                    <g key={r.label}>
                      <rect x="40" y={r.y} width="320" height="62" rx="9" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.6" />
                      <text x="60" y={r.y + 26} fontSize="13" fontWeight="700" fill="#166534">{r.label}</text>
                      <text x="130" y={r.y + 26} fontSize="11" fill="#15803d">{r.iso}</text>
                      <text x="60" y={r.y + 46} fontSize="10" fill="#4b5563">{r.desc}</text>
                    </g>
                  ))}
                </svg>
              )}

              {scene === "food" && (
                <svg viewBox="0 0 400 280" role="img" aria-label="Chiếu xạ nông sản: nguồn Co-60, băng tải nông sản, khu vực che chắn.">
                  <title>Dây chuyền chiếu xạ</title>
                  <rect x="24" y="60" width="352" height="170" rx="12" fill="#0f172a" />
                  <rect x="44" y="92" width="54" height="106" rx="6" fill="#fbbf24" />
                  <text x="71" y="140" textAnchor="middle" fontSize="10" fill="#78350f">⁶⁰Co</text>
                  <text x="71" y="156" textAnchor="middle" fontSize="9" fill="#78350f">nguồn γ</text>
                  {[150, 200, 250, 300].map((x) => (
                    <circle key={x} cx={x} cy="144" r="14" fill="#f97316" opacity="0.85" />
                  ))}
                  <line x1="118" y1="144" x2="332" y2="144" stroke="#38bdf8" strokeDasharray="5 6" strokeWidth="2" />
                  <rect x="120" y="182" width="230" height="10" rx="3" fill="#475569" />
                  <text x="200" y="216" textAnchor="middle" fontSize="10" fill="#94a3b8">băng tải qua vùng chiếu xạ</text>
                  <text x="200" y="256" textAnchor="middle" fontSize="11" fill="#475569">diệt khuẩn · kìm hãm nảy mầm · không làm nhiễm phóng xạ</text>
                </svg>
              )}
            </div>

            <div className={styles.sceneText}>
              <p>{texts[scene]}</p>
            </div>
          </div>

          <div className={styles.sceneNav}>
            <button type="button" onClick={() => canGoBack && setScene(B24_SCENES[index - 1].id)} disabled={!canGoBack} className={styles.navButton} aria-label="Cảnh trước">
              ← Trước
            </button>
            <div className={styles.sceneIndicators}>
              {B24_SCENES.map((s, i) => (
                <button key={s.id} type="button" onClick={() => setScene(s.id)} className={styles.indicator} data-active={s.id === scene} aria-label={`Cảnh ${i + 1}: ${s.title}`} aria-current={s.id === scene ? "step" : undefined} />
              ))}
            </div>
            <button
              type="button"
              onClick={() => canGoNext && setScene(B24_SCENES[index + 1].id)}
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
          <p><strong>Lịch sử:</strong> Chicago Pile-1, 2/12/1942 — lần đầu đạt tới hạn phản ứng dây chuyền có kiểm soát.</p>
          <p><strong>Hình vẽ:</strong> Minh họa tái dựng theo SGK Vật lí 12 KNTT trang 114–118. Không phải sơ đồ kỹ thuật của một nhà máy cụ thể.</p>
        </details>
      </div>
    </section>
  );
}
