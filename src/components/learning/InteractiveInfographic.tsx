"use client";
/* eslint-disable @next/next/no-img-element -- Scientific SVGs are native vector learning materials. */
import { useId, useState } from "react";
import { getVisualLesson } from "@/lib/visual-learning";
import { ChoiceCheck } from "@/components/physics/shared";
import { NuclearHistory } from "./NuclearHistory";
import { B25ModelData } from "./B25ModelData";
import { getSectionInfographicsByLesson } from "@/data/infographic-reels-all";
import { InfographicGallery } from "./InfographicReels";

export function InteractiveInfographic({ code }: { code: string }) {
  const lesson = getVisualLesson(code);
  const [active, setActive] = useState(0);
  const imageId = useId();
  const spot = lesson.spots[active];
  const sectionReels = getSectionInfographicsByLesson(lesson.code);

  return (
    <section className="interactive-infographic" aria-label={`Infographic ${lesson.title}`}>
      {/* Primary Hero: 60-FPS 3D Animated Infographic Posters for the Lesson */}
      <div style={{ marginBottom: "24px" }}>
        <InfographicGallery reels={sectionReels} />
      </div>

      {/* Interactive Spot-by-Spot Observation & Explanation */}
      <div
        style={{
          background: "var(--bg-surface-elevated, #f8fafc)",
          borderRadius: "16px",
          padding: "18px",
          border: "1px solid var(--border-light, #e2e8f0)",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "8px" }}>
          Điểm quan sát trọng tâm & Giải thích bản chất ({lesson.code})
        </h3>
        <div className="infographic-tabs" aria-label="Đọc từng điểm trên hình">
          {lesson.spots.map((s, i) => (
            <button
              key={s.title}
              className={active === i ? "is-active" : ""}
              aria-pressed={active === i}
              aria-controls={`${imageId}-explanation`}
              onClick={() => setActive(i)}
            >
              {i + 1}. {s.title}
            </button>
          ))}
        </div>
        <div id={`${imageId}-explanation`} className="infographic-explanation" aria-live="polite">
          <div>
            <small>Quan sát</small>
            <p>{spot.observe}</p>
          </div>
          <div>
            <small>Giải thích</small>
            <p>{spot.explain}</p>
          </div>
        </div>
      </div>

      {/* Scientists mentioned specifically in this lesson (with Official Archival Photos & 60-FPS 3D Models) */}
      <NuclearHistory lessonCode={lesson.code} />

      {lesson.code === "B25" && (
        <details className="visual-detail" style={{ marginTop: "18px" }}>
          <summary>Đọc bảng dữ liệu và công thức bằng chữ</summary>
          <B25ModelData />
        </details>
      )}

      <details className="visual-detail" style={{ marginTop: "18px" }}>
        <summary>Điểm dễ nhầm và giới hạn của mô hình</summary>
        <p>{lesson.misconception}</p>
      </details>

      <VisualVectorReference code={lesson.code} />

      <div style={{ marginTop: "20px" }}>
        <ChoiceCheck
          question={lesson.question.prompt}
          options={lesson.question.options}
          correctIndex={lesson.question.answer}
          explanation={lesson.question.explanation}
        />
      </div>
    </section>
  );
}

export function VisualVectorReference({ code }: { code: string }) {
  const lesson = getVisualLesson(code);
  const [zoom, setZoom] = useState(false);
  const imageId = useId();
  return (
    <details className="visual-detail" style={{ marginTop: "18px" }}>
        <summary>Sơ đồ vector tĩnh để in phiếu học tập / chèn PowerPoint ({lesson.code})</summary>
        <div className="infographic-toolbar" style={{ marginTop: "12px" }}>
          <span>Sơ đồ tổng quan phục vụ in ấn và trình chiếu tĩnh.</span>
          <button
            className="btn small"
            aria-pressed={zoom}
            aria-controls={imageId}
            onClick={() => setZoom((v) => !v)}
          >
            {zoom ? "Thu gọn hình" : "Phóng to hình"}
          </button>
        </div>
        <div
          id={imageId}
          className={`infographic-viewport ${zoom ? "is-zoomed" : ""}`}
          tabIndex={zoom ? 0 : undefined}
          role="region"
          aria-label={zoom ? "Hình phóng to, cuộn để xem các phần" : "Hình tổng quan"}
        >
          <div className="infographic-image">
            <img
              src={`/illustrations/${lesson.code}-diagram.svg`}
              alt={`${lesson.title}. ${lesson.spots.map((s) => `${s.title}: ${s.observe}`).join(" ")}`}
            />
          </div>
        </div>
        <div className="infographic-file-actions" role="group" aria-label="Tải và xem hình minh họa">
          <div>
            <a
              href={`/illustrations/${lesson.code}-diagram.png`}
              download={`${lesson.code}-infographic.png`}
              className="btn small"
            >
              Tải ảnh PNG bài giảng
            </a>
          </div>
          <div>
            <a
              href={`/illustrations/${lesson.code}-diagram.svg`}
              download={`${lesson.code}-infographic.svg`}
              className="btn small"
            >
              Tải file vector SVG
            </a>
          </div>
          <div>
            <a
              href={`/illustrations/${lesson.code}-diagram.svg`}
              target="_blank"
              rel="noreferrer"
              className="btn small"
            >
              Mở toàn màn hình ↗
            </a>
          </div>
        </div>
      </details>
  );
}
