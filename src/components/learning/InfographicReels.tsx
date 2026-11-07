"use client";

import React, { useState, useEffect } from "react";
import type { B21SectionInfographic, AnimatedCardSpec } from "@/data/infographic-reels-b21";
import { Card3DSimulationCanvas, Scientist3DModelCanvas } from "./Canvas3DParticleEngine";
import {
  getScientistsByLesson,
  ScientistPortraitBust,
  type ScientistProfile,
} from "./ScientistPortraits";
import { LatexMath } from "./LatexMath";
import { Tilt3DCard } from "@/components/threeui/Tilt3DCard";

function StackedCardItem({
  card,
  progress,
}: {
  card: AnimatedCardSpec;
  progress: number;
}) {
  const phaseIndex: 0 | 1 | 2 = progress < 0.34 ? 0 : progress < 0.68 ? 1 : 2;
  const phaseText = card.phaseLabels[phaseIndex];
  const isDone = phaseIndex === 2;

  return (
    <Tilt3DCard
      intensity={2.5}
      pressDepth={6}
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        padding: "16px 18px 14px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Top Row: Step Badge + Title/Subtitle + Live Phase Status Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
            <span
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: card.badgeColor || "#0f172a",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "14px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 2px 8px ${card.badgeColor ? card.badgeColor + "55" : "rgba(15,23,42,0.3)"}`,
              }}
            >
              {card.stepNumber}
            </span>
            <div style={{ minWidth: 0 }}>
              <h4
                style={{
                  margin: 0,
                  fontSize: "15.5px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {card.title}
              </h4>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "13px",
                  color: "#64748b",
                  fontWeight: 500,
                }}
              >
                {card.subtitle}
              </p>
            </div>
          </div>

          {/* Minimalist Status Pill */}
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              background: isDone ? "#f0fdf4" : "#f8fafc",
              color: isDone ? "#166534" : "#475569",
              border: isDone ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
              minWidth: 0,
              maxWidth: "100%",
              overflowWrap: "anywhere",
            }}
          >
            {phaseText}
          </span>
        </div>

        {/* Middle Row: 60-FPS Interactive 3D Canvas Simulation Stage */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            padding: "6px 10px",
          }}
        >
          <Card3DSimulationCanvas sceneKey={card.sceneKey} progress={progress} />
        </div>

        {card.formula && <div style={{ minWidth: 0, paddingInline: 4 }}>
          {card.formula.split(/\\qquad\s*/).map((math, i) => <LatexMath key={i} math={math} block />)}
        </div>}

        {/* Bottom Row: Clean Academic Takeaway Bar */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "8px",
            padding: "8px 12px",
            borderLeft: "3px solid #0f172a",
            fontSize: "13.5px",
            fontWeight: 600,
            color: "#0f172a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <span>{card.takeaway}</span>
          <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 500 }}>
            Nhấn 3D để tương tác
          </span>
        </div>
      </div>
    </Tilt3DCard>
  );
}

/**
 * Clean Minimalist Scientist Card with 3D Tilt/Press + Archival Portrait + 60-FPS 3D Model
 */
export function CosmicScientistCard({ profile }: { profile: ScientistProfile }) {
  const accent = profile.accentColor || "#0284c7";

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
        padding: "20px",
        position: "relative",
        borderTop: `4px solid ${accent}`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", color: "#0f172a" }}>
        {/* Top Header: Section Tag + Discovery Year + Lesson Badge + SGK Citation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            flexWrap: "wrap",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span
              style={{
                background: accent,
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "12px",
                padding: "3px 10px",
                borderRadius: "6px",
                letterSpacing: "0.02em",
              }}
            >
              {profile.sectionCode}
            </span>
            <span
              style={{
                background: "#0f172a",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "12.5px",
                padding: "3px 10px",
                borderRadius: "6px",
              }}
            >
              {profile.discoveryYear}
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#334155",
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                padding: "3px 10px",
                borderRadius: "6px",
              }}
            >
              {profile.lessonBadge}
            </span>
          </div>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
            {profile.sgkRef}
          </span>
        </div>

        {/* Section Title Subheading */}
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: accent,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>❖</span>
          <span>{profile.sectionTitle}</span>
        </div>

        {/* Main Content Grid: Portrait Bust + Biography (Left) & 60-FPS 3D Model (Right) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            alignItems: "center",
          }}
        >
          {/* Left: Portrait + Scientist Info + Evidence/Conclusion */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <ScientistPortraitBust
                id={profile.id}
                size={88}
                accentColor={accent}
              />
              <div>
                <h4
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  {profile.name}
                </h4>
                <p
                  style={{
                    margin: "2px 0",
                    fontSize: "13px",
                    color: "#475569",
                    fontWeight: 500,
                  }}
                >
                  {profile.years} · {profile.nationality}
                </p>
                <p
                  style={{
                    margin: "4px 0 2px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  {profile.modelName}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "11.5px",
                    color: "#64748b",
                  }}
                >
                  Ảnh lưu trữ: {profile.photoCredit}
                </p>
              </div>
            </div>

            <div
              style={{
                fontSize: "13.5px",
                lineHeight: 1.55,
                color: "#1e293b",
                background: "#f8fafc",
                padding: "11px 14px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                borderLeft: `3px solid ${accent}`,
              }}
            >
              <div style={{ marginBottom: "6px" }}>
                <strong style={{ color: "#0f172a" }}>Bằng chứng thực nghiệm: </strong>
                {profile.evidence}
              </div>
              <div>
                <strong style={{ color: "#0f172a" }}>Kết luận / Định luật: </strong>
                {profile.conclusion}
              </div>
            </div>
          </div>

          {/* Right: Live 60-FPS 3D Model Canvas with Callouts */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <Scientist3DModelCanvas scientistId={profile.id} width={268} height={185} />
            <span style={{ fontSize: "11.5px", color: "#64748b" }}>
              Nhấn vào mô hình 3D để kích hoạt xung tương tác
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Single Section Infographic Poster — Synchronized to the Clean Minimalist Light Theme
 * with Interactive 3D Tilt & Tactile Press Cards
 */
export function InfographicReelPoster({ reel }: { reel: B21SectionInfographic }) {
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playing || reel.layoutType === "timeline-grid") return;
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setProgress((prev) => (prev + dt * 0.14 * speed) % 1);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, reel.layoutType]);

  const isTimeline = reel.layoutType === "timeline-grid";
  const lessonPrefix = reel.id.toUpperCase().startsWith("B22")
    ? "B22"
    : reel.id.toUpperCase().startsWith("B23")
    ? "B23"
    : reel.id.toUpperCase().startsWith("B24")
    ? "B24"
    : reel.id.toUpperCase().startsWith("B25")
    ? "B25"
    : "B21";
  const filteredScientists = getScientistsByLesson(lessonPrefix);

  return (
    <div
      style={{
        background: "#f8fafc",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        padding: "24px 20px",
        color: "#0f172a",
      }}
    >
      {/* Poster Header */}
      <header style={{ marginBottom: "20px", borderBottom: `3px solid ${reel.accentColor || "#0284c7"}`, paddingBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
          {/* Colored Section Code Badge */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12.5px",
              fontWeight: 700,
              background: reel.accentColor || "#0284c7",
              color: "#ffffff",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {reel.sectionCode}
          </span>
          <span
            className="mono-tag"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 10px",
              borderRadius: "4px",
              fontSize: "11.5px",
              fontWeight: 600,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-light)",
              color: "var(--text-secondary)",
            }}
          >
            SGK tr. {reel.sgkPages}
          </span>
        </div>

        <div style={{ borderLeft: `3px solid ${reel.accentColor || "var(--color-primary)"}`, paddingLeft: "14px" }}>
          <h3
            style={{
              margin: "0 0 6px",
              fontSize: "clamp(18px, 2.2vw, 22px)",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {reel.posterTitle}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "14.5px",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            {reel.posterSubtitle}
          </p>
        </div>
      </header>

      {/* Interactive Playback Controls for Stacked 3D Cards */}
      {!isTimeline && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "10px",
            padding: "10px 14px",
            marginBottom: "16px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn small"
              onClick={() => setPlaying((p) => !p)}
              style={{
                background: playing ? "#0f172a" : "#ffffff",
                color: playing ? "#ffffff" : "#0f172a",
                border: "1px solid #cbd5e1",
              }}
            >
              {playing ? "Tạm dừng pha" : "Chạy liên tục"}
            </button>
            {[
              { label: "Pha 1 · Tiếp cận", val: 0.15 },
              { label: "Pha 2 · Tương tác", val: 0.5 },
              { label: "Pha 3 · Kết luận", val: 0.85 },
            ].map((ph) => {
              const active =
                (ph.val < 0.34 && progress < 0.34) ||
                (ph.val >= 0.34 && ph.val < 0.68 && progress >= 0.34 && progress < 0.68) ||
                (ph.val >= 0.68 && progress >= 0.68);
              return (
                <button
                  key={ph.label}
                  type="button"
                  className="btn small"
                  onClick={() => {
                    setPlaying(false);
                    setProgress(ph.val);
                  }}
                  style={{
                    background: active ? "#f1f5f9" : "#ffffff",
                    color: "#0f172a",
                    border: active ? "1.5px solid #0f172a" : "1px solid #e2e8f0",
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {ph.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "200px" }}>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(progress * 100)}
              onChange={(e) => {
                setPlaying(false);
                setProgress(Number(e.target.value) / 100);
              }}
              aria-label="Thanh tiến trình mô phỏng 3D"
              style={{ flex: 1, accentColor: "#0f172a" }}
            />
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              aria-label="Tốc độ chuyển pha"
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#0f172a",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              <option value={0.5}>0,5×</option>
              <option value={1}>1×</option>
              <option value={1.8}>1,8×</option>
            </select>
          </div>
        </div>
      )}

      {/* Body: Stacked 3D Cards or Scientist Grid */}
      {!isTimeline && reel.cards && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {reel.cards.map((card) => (
            <StackedCardItem key={card.stepNumber} card={card} progress={progress} />
          ))}
        </div>
      )}

      {isTimeline && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
            gap: "16px",
          }}
        >
          {filteredScientists.map((profile) => (
            <CosmicScientistCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}

      {/* Poster Footer Tagline */}
      <footer
        style={{
          marginTop: "18px",
          paddingTop: "12px",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
          fontSize: "12.5px",
          fontWeight: 600,
          color: "#64748b",
        }}
      >
        <span>{reel.footerTagline}</span>
        <span>Tham chiếu: {reel.sgkReference}</span>
      </footer>
    </div>
  );
}

/**
 * Interactive Gallery of Section-by-Section 3D Animated Infographic Posters
 */
export function InfographicGallery({ reels }: { reels: B21SectionInfographic[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewAll, setViewAll] = useState(false);

  const safeIdx = selectedIndex < reels.length ? selectedIndex : 0;
  const currentReel = reels[safeIdx];

  if (!currentReel) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Section Selector Tabs */}
      {reels.length > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            flexWrap: "wrap",
            background: "var(--bg-surface)",
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid var(--border-light)",
          }}
        >
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {reels.map((r, idx) => {
              const isSelected = !viewAll && idx === safeIdx;
              const cardCount = r.cards ? r.cards.length : null;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setViewAll(false);
                    setSelectedIndex(idx);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: isSelected ? 600 : 500,
                    background: isSelected ? "var(--color-primary)" : "var(--bg-page)",
                    color: isSelected ? "#ffffff" : "var(--text-secondary)",
                    border: isSelected
                      ? "1px solid var(--color-primary)"
                      : "1px solid var(--border-light)",
                    cursor: "pointer",
                  }}
                >
                  <span
                    className="mono-tag"
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      opacity: isSelected ? 0.8 : 0.7,
                    }}
                  >
                    0{idx + 1}
                  </span>
                  <span>{r.sectionCode}</span>
                  {cardCount !== null && (
                    <span
                      className="mono-tag"
                      style={{
                        fontSize: "11px",
                        opacity: 0.75,
                      }}
                    >
                      ({cardCount})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="btn small"
            onClick={() => setViewAll((v) => !v)}
            style={{
              background: viewAll ? "var(--color-primary)" : "var(--bg-surface)",
              color: viewAll ? "#ffffff" : "var(--text-primary)",
              border: "1px solid var(--border-dark)",
              fontWeight: 600,
            }}
          >
            {viewAll ? "Xem từng mục" : `Xem toàn bộ ${reels.length} mục`}
          </button>
        </div>
      )}

      {viewAll ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {reels.map((r) => (
            <InfographicReelPoster key={r.id} reel={r} />
          ))}
        </div>
      ) : (
        <InfographicReelPoster reel={currentReel} />
      )}
    </div>
  );
}
