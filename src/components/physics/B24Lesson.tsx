"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { B24Hero } from "./B24Hero";
import { NuclearMedicine, RadiationApplications } from "./B24Activities";
import styles from "./B24Lesson.module.css";

const ReactorControlConcept = dynamic(
  () => import("./B24Activities").then((m) => m.ReactorControlConcept),
  { ssr: false, loading: () => <p role="status">Đang tải mô hình lò phản ứng…</p> },
);

const TOC = [
  ["khoi-dong", "Khởi động"],
  ["muc-1", "I. Lò phản ứng hạt nhân"],
  ["muc-2", "II. Y học hạt nhân"],
  ["muc-3", "III. Chiếu xạ trong công nghiệp và nông nghiệp"],
  ["video", "Video học liệu"],
] as const;

export function B24Lesson() {
  const [done, setDone] = useState({ reactor: false, medicine: false, radiation: false });
  const set = useCallback((key: keyof typeof done, value: boolean) => {
    setDone((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  const steps = [
    { key: "reactor" as const, label: "Điều chỉnh thanh điều khiển và quan sát hệ số k" },
    { key: "medicine" as const, label: "Xem ít nhất hai kỹ thuật y học hạt nhân và trả lời câu hỏi" },
    { key: "radiation" as const, label: "Xem ít nhất hai ứng dụng chiếu xạ và trả lời câu hỏi" },
  ];

  return (
    <div className={styles.lesson}>
      <section id="khoi-dong"><B24Hero /></section>

      <nav className={styles.toc} aria-label="Mục lục Bài 24">
        {TOC.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>

      <article className={styles.body}>
        <section id="muc-1" className={styles.section}>
          <h2>I. Lò phản ứng hạt nhân</h2>
          <p className={styles.lead}>
            Bộ phận cốt lõi của mọi lò phản ứng là hệ điều khiển k: rút thanh điều khiển ra thì k tăng,
            công suất tăng; cắm vào thì k giảm, công suất giảm. k = 1 duy trì phản ứng ổn định. Vòng
            nước thứ cấp nhận nhiệt qua bộ trao đổi và không tiếp xúc với vùng có thể nhiễm phóng xạ.
          </p>
          <ReactorControlConcept onProgress={(v) => set("reactor", v)} />
          <div className="physics-checklist" style={{ marginTop: 12 }}>
            <ul>
              {steps.map((s) => (
                <li key={s.key} className={done[s.key] ? "is-done" : ""}>
                  {s.label} {done[s.key] ? "✓" : ""}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="muc-2" className={styles.section}>
          <h2>II. Y học hạt nhân</h2>
          <p className={styles.lead}>
            Đồng vị phóng xạ ngắn — ¹⁸F (110 phút) và ⁹⁹ᵐTc (6 giờ) — được đưa vào cơ thể để ghi lại
            quá trình chuyển hóa bằng PET và SPECT. ⁶⁰Co và các nguồn năng lượng cao hơn được dùng để
            xạ trị ung thư.
          </p>
          <NuclearMedicine onProgress={(v) => set("medicine", v)} />
        </section>

        <section id="muc-3" className={styles.section}>
          <h2>III. Chiếu xạ trong công nghiệp và nông nghiệp</h2>
          <p className={styles.lead}>
            Tia gamma từ ⁶⁰Co hoặc chùm electron từ máy gia tốc được dùng để diệt khuẩn thực phẩm, kìm
            hãm nảy mầm và thanh trùng thiết bị y tế. Thực phẩm chiếu xạ không chứa chất phóng xạ.
          </p>
          <RadiationApplications onProgress={(v) => set("radiation", v)} />
        </section>

        <section id="video" className={styles.section}>
          <h2>Video học liệu</h2>
          <p className={styles.lead}>
            Minh họa nguyên lí lò phản ứng, hai vòng nước và các ứng dụng thực tế.
          </p>
          <div className={styles.videoCard}>
            <h3 className={styles.videoTitle}>Bài 24 – Công nghiệp hạt nhân</h3>
            <p className={styles.videoMeta}>Thời lượng 1:12 · Phụ đề tiếng Việt · Nguồn: giáo viên bộ môn</p>
            <video className={styles.video} controls preload="metadata" poster="/videos/nuclear-lessons-v2/b24.jpg">
              <source src="/videos/nuclear-lessons-v2/b24.mp4" type="video/mp4" />
              <track kind="subtitles" srcLang="vi" src="/videos/nuclear-lessons-v2/b24.vi.vtt" label="Tiếng Việt" default />
              Trình duyệt của bạn không hỗ trợ video HTML5.
            </video>
          </div>
        </section>
      </article>
    </div>
  );
}
