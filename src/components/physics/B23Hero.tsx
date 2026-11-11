"use client";

import { useState } from "react";
import Image from "next/image";
import { B23_HERO } from "@/lib/b23-content";
import styles from "./B23Hero.module.css";

type BecquerelScene = "context" | "setup" | "darkness" | "result" | "transition";

export function B23Hero() {
  const [scene, setScene] = useState<BecquerelScene>("context");
  const [hasAnswered, setHasAnswered] = useState(false);

  const scenes: Record<BecquerelScene, { title: string; text: string }> = {
    context: {
      title: "Paris, 1896",
      text: B23_HERO.story.context,
    },
    setup: {
      title: "Thiết bị thí nghiệm",
      text: "Tấm kính ảnh, vải đen che sáng, muối kali uranyl sulfat, miếng kim loại hình chữ thập.",
    },
    darkness: {
      title: "Trong bóng tối",
      text: "Đặt trong ngăn kéo tối nhiều ngày. Không có ánh sáng chiếu tới.",
    },
    result: {
      title: "Kết quả bất ngờ",
      text: B23_HERO.story.observation,
    },
    transition: {
      title: "Từ lịch sử đến khoa học",
      text: B23_HERO.story.conclusion,
    },
  };

  const currentScene = scenes[scene];
  const sceneOrder: BecquerelScene[] = ["context", "setup", "darkness", "result", "transition"];
  const currentIndex = sceneOrder.indexOf(scene);
  const canGoBack = currentIndex > 0;
  const canGoNext = currentIndex < sceneOrder.length - 1;
  const isQuestion = scene === "result" && !hasAnswered;

  const handleNext = () => {
    if (scene === "result" && !hasAnswered) return;
    if (canGoNext) setScene(sceneOrder[currentIndex + 1]);
  };

  const handleBack = () => {
    if (canGoBack) setScene(sceneOrder[currentIndex - 1]);
  };

  return (
    <section className={styles.hero} aria-labelledby="b23-title">
      <div className={styles.container}>
        <div className={styles.eyebrow}>{B23_HERO.eyebrow}</div>
        <h1 id="b23-title" className={styles.title}>{B23_HERO.title}</h1>
        <p className={styles.pages}>{B23_HERO.pages}</p>
        <p className={styles.lead}>{B23_HERO.lead}</p>

        <div className={styles.storyCard}>
          <div className={styles.sceneHeader}>
            <span className={styles.sceneNumber}>
              Cảnh {currentIndex + 1} / {sceneOrder.length}
            </span>
            <h2 className={styles.sceneTitle}>{currentScene.title}</h2>
          </div>

          <div className={styles.sceneContent}>
            <div className={styles.sceneVisual} data-scene={scene}>
              {scene === "context" && (
                <div className={styles.portrait}>
                  <Image
                    src={B23_HERO.scientist.photoUrl}
                    alt={`Chân dung ${B23_HERO.scientist.name}`}
                    width={240}
                    height={320}
                    className={styles.portraitImg}
                    priority
                  />
                  <div className={styles.portraitCaption}>
                    <strong>{B23_HERO.scientist.name}</strong>
                    <span>{B23_HERO.scientist.years}</span>
                    <span className={styles.nobel}>{B23_HERO.scientist.nobel}</span>
                  </div>
                </div>
              )}
              {scene === "setup" && (
                <svg viewBox="0 0 400 300" className={styles.diagram} aria-hidden="true">
                  <rect x="50" y="120" width="80" height="60" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                  <text x="90" y="155" fill="#cbd5e1" fontSize="12" textAnchor="middle">Tấm kính ảnh</text>
                  <rect x="120" y="100" width="100" height="100" fill="#0f172a" opacity="0.7" stroke="#334155" strokeWidth="2" strokeDasharray="4" />
                  <text x="170" y="155" fill="#94a3b8" fontSize="12" textAnchor="middle">Vải đen</text>
                  <circle cx="200" cy="80" r="20" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
                  <text x="200" y="85" fill="#78350f" fontSize="10" textAnchor="middle">Uranium</text>
                  <path d="M 150 150 L 180 130 L 180 170 Z" fill="#64748b" stroke="#475569" strokeWidth="2" />
                  <text x="200" y="250" fill="#cbd5e1" fontSize="11" textAnchor="middle">Chữ thập kim loại</text>
                </svg>
              )}
              {scene === "darkness" && (
                <div className={styles.darkness}>
                  <svg viewBox="0 0 400 300" aria-hidden="true">
                    <rect width="400" height="300" fill="#0a0a0a" />
                    <circle cx="200" cy="150" r="15" fill="#fbbf24" opacity="0.3">
                      <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <text x="200" y="280" fill="#475569" fontSize="14" textAnchor="middle">Trong tối, nhiều ngày…</text>
                  </svg>
                </div>
              )}
              {scene === "result" && (
                <div className={styles.result}>
                  <svg viewBox="0 0 400 300" aria-hidden="true">
                    <rect x="80" y="100" width="240" height="140" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
                    <path d="M 200 120 L 220 160 L 200 200 L 180 160 Z" fill="#1e293b" opacity="0.6" />
                    <text x="200" y="260" fill="#334155" fontSize="13" textAnchor="middle">Hình chữ thập xuất hiện trên phim</text>
                  </svg>
                  {!hasAnswered && (
                    <div className={styles.question}>
                      <p><strong>{B23_HERO.story.question}</strong></p>
                      <div className={styles.choices}>
                        <button type="button" onClick={() => setHasAnswered(true)} className={styles.choice}>
                          Ánh sáng bí ẩn
                        </button>
                        <button type="button" onClick={() => setHasAnswered(true)} className={styles.choice}>
                          Phản ứng hóa học
                        </button>
                        <button type="button" onClick={() => setHasAnswered(true)} className={styles.choicePrimary}>
                          Tia vô hình từ uranium
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {scene === "transition" && (
                <div className={styles.transition}>
                  <svg viewBox="0 0 400 200" aria-hidden="true">
                    <defs>
                      <linearGradient id="fadeOut" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: "#fbbf24", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#8b5cf6", stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <text x="200" y="100" fill="url(#fadeOut)" fontSize="48" fontWeight="700" textAnchor="middle">
                      Phóng xạ
                    </text>
                    <text x="200" y="150" fill="#64748b" fontSize="14" textAnchor="middle">
                      {B23_HERO.scientist.unit}
                    </text>
                  </svg>
                </div>
              )}
            </div>

            <div className={styles.sceneText}>
              <p>{currentScene.text}</p>
            </div>
          </div>

          <div className={styles.sceneNav}>
            <button
              type="button"
              onClick={handleBack}
              disabled={!canGoBack}
              className={styles.navButton}
              aria-label="Cảnh trước"
            >
              ← Trước
            </button>
            <div className={styles.sceneIndicators}>
              {sceneOrder.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScene(s)}
                  className={styles.indicator}
                  data-active={s === scene}
                  aria-label={`Cảnh ${i + 1}: ${scenes[s].title}`}
                  aria-current={s === scene ? "step" : undefined}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext || isQuestion}
              className={styles.navButton}
              aria-label="Cảnh tiếp theo"
            >
              Tiếp →
            </button>
          </div>
        </div>

        <details className={styles.credit}>
          <summary>Nguồn hình ảnh và ghi công</summary>
          <p><strong>Chân dung:</strong> {B23_HERO.scientist.photoCredit}</p>
          <p><strong>Hoạt cảnh thí nghiệm:</strong> Minh họa tái dựng dựa trên mô tả SGK Vật lí 12 KNTT và tư liệu lịch sử. Không phải ảnh chụp gốc.</p>
        </details>
      </div>
    </section>
  );
}
