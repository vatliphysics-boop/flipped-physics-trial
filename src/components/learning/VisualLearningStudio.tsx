"use client";

import { useState } from "react";
import Link from "next/link";
import { CURRICULUM_SOURCE, getVisualLesson, VISUAL_LESSONS } from "@/lib/visual-learning";
import { CANONICAL_SYSTEM_MATERIALS } from "@/lib/material-bank";
import { nuclearLabUrl } from "@/lib/nuclear-lab-lessons";
import { LatexMath } from "./LatexMath";
import { Tilt3DCard } from "@/components/threeui/Tilt3DCard";
import { ModularLessonBuilder } from "./ModularLessonBuilder";
import { NUCLEAR_REACTIONS } from "@/lib/nuclear-science";
import styles from "./VisualLearningStudio.module.css";

const LESSON_FORMULAS = {
  B21: [String.raw`A=Z+N`, String.raw`R\approx R_0 A^{1/3}`, String.raw`R_0\approx1{,}2\times10^{-15}\,\mathrm{m}`],
  B22: [String.raw`\Delta m=Zm_p+Nm_n-m_{\mathrm{hn}}`, String.raw`E_{\mathrm{lk}}=\Delta m\,c^2`, String.raw`\frac{E_{\mathrm{lk}}}{A}`],
  B23: [String.raw`N(t)=N_0\,2^{-\frac{t}{T}}`, String.raw`\lambda=\frac{\ln 2}{T}`, String.raw`H(t)=\lambda N(t)`],
  B25: [String.raw`H(t)=H_0\,2^{-\frac{t}{T}}`, String.raw`t=\frac{T}{\ln2}\ln\!\left(\frac{H_0}{H(t)}\right)`],
  B24: [NUCLEAR_REACTIONS.fission.latex],
} as const;

export function VisualLearningStudio({ code }: { code?: string }) {
  const lesson = getVisualLesson(code);
  const [projection, setProjection] = useState(false);

  const resourceId =
    CANONICAL_SYSTEM_MATERIALS.find((m) => m.metadata?.activityKey === lesson.activity)?.id ??
    `system-diagram-${lesson.code}`;


  return (
    <div className={`visual-studio ${styles.studio} ${projection ? "projection-mode" : ""}`}>
      <header className={`visual-header ${styles.header}`}>
        <div>
          <p className="visual-eyebrow mono-tag">
            CHƯƠNG IV: VẬT LÍ HẠT NHÂN · BÀI 21 – BÀI 25 · PHÒNG THÍ NGHIỆM TRỰC QUAN
          </p>
          <h1>Phòng thí nghiệm Mô phỏng 3D &amp; Thiết kế Bài dạy</h1>
          <p>
            Kết hợp mô phỏng hạt nhân 3D, công thức chuẩn LaTeX, tư liệu lịch sử vật lí và câu hỏi đánh giá theo lộ trình Lớp học đảo ngược ba giai đoạn. Giáo viên có thể tùy chỉnh cấu trúc bài dạy theo kịch bản sư phạm trên lớp.
          </p>
        </div>
        <div className={`visual-header-actions ${styles.actions}`}>
          <Link className="btn" href={nuclearLabUrl(lesson.code)}>Quan sát hạt nhân và xem video</Link>
          <button
            className="btn"
            aria-pressed={projection}
            onClick={() => setProjection((v) => !v)}
          >
            {projection ? "Thoát trình chiếu" : "Chế độ trình chiếu"}
          </button>
          <Link className="btn" href="/hoc-lieu">
            Toàn bộ kho học liệu
          </Link>
        </div>
      </header>

      <nav className={`visual-lessons ${styles.lessons}`} aria-label="Chọn bài học">
        {VISUAL_LESSONS.map((l) => (
          <Link
            key={l.code}
            className={`${styles.lessonCard} ${l.code === lesson.code ? "is-active" : ""}`}
            aria-current={l.code === lesson.code ? "page" : undefined}
            href={`/hoc-lieu/truc-quan?bai=${l.code}`}
          >
            <span>{l.code}</span>
            <strong>{l.shortTitle}</strong>
          </Link>
        ))}
      </nav>

      <Tilt3DCard
        intensity={4}
        pressDepth={10}
        className={styles.introCard}
      >
        <div className={styles.intro}>
          <span className="badge">{lesson.code}</span>
          <div>
            <h2 className={styles.introHeading}>{lesson.title}</h2>
            <p className={styles.introGoal}>{lesson.goal}</p>
          </div>
        </div>
        <div className={styles.formulas} aria-label="Công thức và kí hiệu trọng tâm">
          {LESSON_FORMULAS[lesson.code].map(math => <LatexMath key={math} math={math} block />)}
        </div>
      </Tilt3DCard>

      {/* Modular Creative Lesson Builder & 3D Lab */}
      <ModularLessonBuilder key={lesson.code} code={lesson.code} />

      <details className="teacher-visual-guide" style={{ marginTop: "24px" }}>
        <summary>
          Gợi ý kết nối với Kế hoạch bài dạy (Công văn 5512) <span>Xuất giáo án &amp; Phiếu học tập PDF</span>
        </summary>
        <div className="teacher-visual-columns">
          <div>
            <span className="visual-eyebrow">Trước giờ học</span>
            <p>{lesson.before}</p>
          </div>
          <div>
            <span className="visual-eyebrow">Trong giờ học</span>
            <p>{lesson.during}</p>
          </div>
          <div>
            <span className="visual-eyebrow">Sản phẩm để đánh giá</span>
            <p>{lesson.product}</p>
          </div>
        </div>
        <div className="experiment-controls">
          <Link
            className="btn primary"
            href={`/hoc-lieu/soan-ke-hoach?template=${lesson.code}&material=${encodeURIComponent(
              resourceId
            )}`}
          >
            Đưa vào Kế hoạch bài dạy (5512)
          </Link>
          <a
            className="btn"
            href={`/learning/${lesson.code}-worksheet.pdf`}
            target="_blank"
            rel="noreferrer"
          >
            Mở / in phiếu học tập ↗
          </a>
          <Link className="btn" href="/hoc-lieu?type=assessment">
            Đề giữa kỳ &amp; cuối kỳ
          </Link>
        </div>
        <p className="physics-note">
          Giáo viên có thể tự do thêm/bớt/sắp xếp lại các khối nội dung ở trên, lưu vào Kho tái sử dụng hoặc xuất file JSON chia sẻ cho tổ chuyên môn.
        </p>
      </details>

      <details className="visual-sources">
        <summary>Nguồn học liệu &amp; Đối chiếu chương trình</summary>
        <p>Hình minh họa và mô phỏng sử dụng màu sắc, kích thước và thời gian quy ước.</p>
        <p>
          <a
            href={`/learning/SGK-chuong-IV.pdf#page=${lesson.pdfPage}`}
            target="_blank"
            rel="noreferrer"
          >
            SGK · trang {lesson.bookPage} ↗
          </a>{" "}
          ·{" "}
          <a href={CURRICULUM_SOURCE} target="_blank" rel="noreferrer">
            Chương trình Vật lí 2018 · PDF đã đối chiếu trang 27–28 ↗
          </a>{" "}
          ·{" "}
          <a
            href={`https://www.youtube.com/watch?v=${lesson.videoId}`}
            target="_blank"
            rel="noreferrer"
          >
            Video của {lesson.channel} ↗
          </a>
        </p>
      </details>
    </div>
  );
}
