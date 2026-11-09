"use client";

import { useState } from "react";
import Image from "next/image";
import { B22_HERO, B22_SCENES } from "@/lib/b22-content";
import styles from "./B22Hero.module.css";

type SceneId = (typeof B22_SCENES)[number]["id"];

const CHOICES = [
  {
    label: "Vì cả hai đều làm tăng tổng số nucleon.",
    correct: false,
    why: "Số nucleon được bảo toàn trong mọi phản ứng hạt nhân. Năng lượng không đến từ việc sinh thêm nucleon.",
  },
  {
    label: "Vì cả hai đều đưa hệ về trạng thái có năng lượng liên kết riêng cao hơn.",
    correct: true,
    why: "Đúng. Hạt nhân nặng (U-235, ~7,6 MeV/nucleon) tách thành mảnh cỡ A≈100–140 (~8,5 MeV/nucleon) nên bền hơn. Hạt nhân rất nhẹ (²H, ³H) ghép thành ⁴He (~7,1 MeV/nucleon) cũng bền hơn hẳn hai hạt riêng lẻ. Cả hai chiều đều tiến về phía đỉnh đường cong Elkr(A), và phần chênh lệch thoát ra thành động năng.",
  },
  {
    label: "Vì phản ứng hạt nhân luôn giải phóng neutron.",
    correct: false,
    why: "Phân hạch có sinh neutron, nhưng nhiệt hạch D + T chỉ sinh một neutron và nhiều phản ứng nhiệt hạch khác không sinh neutron nào. Neutron không phải nguồn năng lượng.",
  },
];

export function B22Hero() {
  const [scene, setScene] = useState<SceneId>("context");
  const [choice, setChoice] = useState<number | null>(null);

  const index = B22_SCENES.findIndex((s) => s.id === scene);
  const current = B22_SCENES[index];
  const canGoBack = index > 0;
  const canGoNext = index < B22_SCENES.length - 1;
  const isQuestion = scene === "fission";
  const chosen = choice === null ? null : CHOICES[choice];

  const texts: Record<SceneId, string> = {
    context: B22_HERO.story.context,
    blackett: B22_HERO.story.blackett,
    equation: B22_HERO.story.equation,
    binding: B22_HERO.story.binding,
    fission: B22_HERO.story.fission,
  };

  return (
    <section className={styles.hero} aria-labelledby="b22-title">
      <div className={styles.container}>
        <div className={styles.eyebrow}>{B22_HERO.eyebrow}</div>
        <h1 id="b22-title" className={styles.title}>{B22_HERO.title}</h1>
        <p className={styles.pages}>{B22_HERO.pages}</p>
        <p className={styles.lead}>{B22_HERO.lead}</p>

        <div className={styles.facts}>
          {B22_HERO.facts.map((f) => (
            <div key={f.label} className={styles.fact}>
              <span className={styles.factLabel}>{f.label}</span>
              <span className={styles.factValue}>{f.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.storyCard}>
          <div className={styles.sceneHeader}>
            <span className={styles.sceneNumber}>Cảnh {index + 1} / {B22_SCENES.length}</span>
            <h2 className={styles.sceneTitle}>{current.title}</h2>
          </div>

          <div className={styles.sceneContent}>
            <div className={styles.sceneVisual} data-scene={scene}>
              {scene === "context" && (
                <div className={styles.portrait}>
                  <Image
                    src={B22_HERO.scientist.photoUrl}
                    alt={`Chân dung ${B22_HERO.scientist.name}`}
                    width={220}
                    height={280}
                    className={styles.portraitImg}
                    priority
                  />
                  <div className={styles.portraitCaption}>
                    <strong>{B22_HERO.scientist.name}</strong>
                    <span>{B22_HERO.scientist.years}</span>
                    <span className={styles.nobel}>{B22_HERO.scientist.nobel}</span>
                    <span>Người hoàn thiện buồng sương ghi vết hạt nhân</span>
                  </div>
                </div>
              )}

              {scene === "blackett" && (
                <svg viewBox="0 0 400 280" role="img" aria-label="Vết hình chữ Y trong buồng sương: hạt alpha đi vào, rồi tách thành proton và hạt nhân oxygen-17.">
                  <title>Vết phản ứng trong buồng sương</title>
                  <rect x="0" y="0" width="400" height="280" fill="#0b1220" />
                  <path d="M36 150 H196" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" opacity="0.92" />
                  <text x="110" y="138" fontSize="12" fill="#94a3b8">hạt α</text>
                  <path d="M196 150 L336 74" stroke="#7dd3fc" strokeWidth="1.8" strokeLinecap="round" />
                  <text x="300" y="60" fontSize="12" fill="#7dd3fc">proton · mảnh, dài</text>
                  <path d="M196 150 L262 224" stroke="#fca5a5" strokeWidth="3.6" strokeLinecap="round" />
                  <text x="250" y="248" fontSize="12" fill="#fca5a5">¹⁷O · ngắn, đậm</text>
                  <circle cx="196" cy="150" r="5" fill="#fbbf24" />
                  <text x="196" y="132" textAnchor="middle" fontSize="11" fill="#fbbf24">điểm phản ứng</text>
                  <text x="200" y="270" textAnchor="middle" fontSize="11" fill="#64748b">ảnh minh họa · không theo tỉ lệ</text>
                </svg>
              )}

              {scene === "equation" && (
                <svg viewBox="0 0 400 280" role="img" aria-label="Phương trình phản ứng alpha cộng nitrogen-14 tạo oxygen-17 và proton, kèm kiểm tra bảo toàn A và Z.">
                  <title>Bảo toàn số khối và điện tích</title>
                  <text x="200" y="60" textAnchor="middle" fontSize="17" fill="#0f172a">⁴₂He + ¹⁴₇N → ¹⁷₈O + ¹₁p</text>
                  <rect x="44" y="92" width="312" height="72" rx="8" fill="#eff6ff" stroke="#93c5fd" />
                  <text x="62" y="116" fontSize="12" fill="#1e40af">A: 4 + 14 = 18 · 17 + 1 = 18 ✓</text>
                  <text x="62" y="138" fontSize="12" fill="#1e40af">Z: 2 + 7 = 9 · 8 + 1 = 9 ✓</text>
                  <text x="62" y="158" fontSize="11" fill="#64748b">không nucleon nào sinh ra hay mất đi</text>
                  <rect x="44" y="184" width="312" height="62" rx="8" fill="#f0fdf4" stroke="#86efac" />
                  <text x="62" y="208" fontSize="12" fill="#166534">Trước: N-14 · Sau: O-17</text>
                  <text x="62" y="230" fontSize="11" fill="#15803d">lần đầu con người biến đổi hạt nhân này thành hạt nhân khác</text>
                </svg>
              )}

              {scene === "binding" && (
                <svg viewBox="0 0 400 280" role="img" aria-label="Đường cong năng lượng liên kết riêng theo số khối, có đỉnh quanh A bằng 56.">
                  <title>Đường cong Elkr theo A</title>
                  <path d="M46 40V232H376" fill="none" stroke="#526680" strokeWidth="2" />
                  <path d="M52 208 C110 120, 150 74, 200 62 C250 56, 300 92, 368 158" fill="none" stroke="#2563eb" strokeWidth="3" />
                  <circle cx="200" cy="62" r="5" fill="#dc2626" />
                  <text x="200" y="44" textAnchor="middle" fontSize="11" fill="#991b1b">Fe-56 · ≈8,8</text>
                  <circle cx="368" cy="158" r="5" fill="#dc2626" />
                  <text x="348" y="180" textAnchor="end" fontSize="11" fill="#991b1b">U-235 · ≈7,6</text>
                  <circle cx="58" cy="206" r="5" fill="#dc2626" />
                  <text x="62" y="222" fontSize="11" fill="#991b1b">He-4 · ≈7,1</text>
                  <text x="46" y="28" fontSize="11" fill="#334155">Elkr (MeV/nucleon)</text>
                  <text x="200" y="256" textAnchor="middle" fontSize="11" fill="#334155">số khối A</text>
                  <text x="212" y="240" fontSize="11" fill="#64748b">phân hạch: đi xuống từ phải</text>
                  <text x="70" y="240" fontSize="11" fill="#64748b">nhiệt hạch: đi lên từ trái</text>
                </svg>
              )}

              {scene === "fission" && (
                <div style={{ width: "100%", display: "grid", gap: 10 }}>
                  <div className={styles.question}>
                    <p><strong>{B22_HERO.story.challenge}</strong></p>
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
              <p>{texts[scene]}</p>
            </div>
          </div>

          <div className={styles.sceneNav}>
            <button type="button" onClick={() => canGoBack && setScene(B22_SCENES[index - 1].id)} disabled={!canGoBack} className={styles.navButton} aria-label="Cảnh trước">
              ← Trước
            </button>
            <div className={styles.sceneIndicators}>
              {B22_SCENES.map((s, i) => (
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
              onClick={() => canGoNext && setScene(B22_SCENES[index + 1].id)}
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
          <p><strong>Thí nghiệm:</strong> Ernest Rutherford, 1919 — phản ứng hạt nhân nhân tạo đầu tiên, α + ¹⁴N → ¹⁷O + p. Patrick Blackett dùng buồng sương ghi lại vết của phản ứng, Nobel Vật lí 1948.</p>
          <p><strong>Hình vẽ:</strong> Minh họa tái dựng theo SGK Vật lí 12 KNTT trang 96–103. Đường cong Elkr được vẽ theo xu hướng hình 22.3, không phải dữ liệu đo từng điểm.</p>
        </details>
      </div>
    </section>
  );
}
