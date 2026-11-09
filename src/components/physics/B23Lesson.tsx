"use client";

import dynamic from "next/dynamic";
import { B23Hero } from "./B23Hero";
import { CloudChamberView } from "./CloudChamberView";
import { RadiationTypesExplorer } from "./RadiationTypesExplorer";
import { GeigerRandomDecay, RadiationSafety, SafetyPrinciples } from "./B23Activities";
import styles from "./B23Lesson.module.css";

const DecayLab = dynamic(() => import("./DecayProcessLab").then((m) => m.DecayProcessLab), {
  ssr: false,
  loading: () => <p role="status">Đang tải mô phỏng phân rã…</p>,
});

const TOC = [
  ["khoi-dong", "Khởi động"],
  ["muc-1", "I. Hiện tượng phóng xạ"],
  ["muc-2", "II. Định luật phóng xạ. Độ phóng xạ"],
  ["muc-3", "III. Ảnh hưởng của tia phóng xạ. Biển cảnh báo"],
  ["muc-4", "IV. Nguyên tắc an toàn phóng xạ"],
  ["video", "Video học liệu"],
] as const;

export function B23Lesson() {
  return (
    <div className={styles.lesson}>
      <section id="khoi-dong"><B23Hero /></section>
      <nav className={styles.toc} aria-label="Mục lục Bài 23">
        {TOC.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>
      <article className={styles.body}>
        <section id="muc-1" className={styles.section}>
          <h2>I. Hiện tượng phóng xạ</h2>
          <p className={styles.lead}>Phóng xạ không nhìn thấy bằng mắt thường, nhưng để lại dấu vết qua tác dụng ion hóa.</p>
          <CloudChamberView />
          <h3>Tính tự phát và ngẫu nhiên</h3>
          <GeigerRandomDecay />
          <h3>Các tia phóng xạ</h3>
          <RadiationTypesExplorer />
        </section>
        <section id="muc-2" className={styles.section}>
          <h2>II. Định luật phóng xạ. Độ phóng xạ</h2>
          <p className={styles.lead}>Mẫu phóng xạ giả định: thay đổi T để khảo sát quy luật. Không gán giá trị này cho đồng vị thật.</p>
          <DecayLab />
        </section>
        <section id="muc-3" className={styles.section}>
          <h2>III. Ảnh hưởng của tia phóng xạ. Biển cảnh báo</h2>
          <RadiationSafety />
        </section>
        <section id="muc-4" className={styles.section}>
          <h2>IV. Nguyên tắc an toàn phóng xạ</h2>
          <SafetyPrinciples />
        </section>
        <section id="video" className={styles.section}>
          <h2>Video học liệu</h2>
          <p className={styles.lead}>Tổng hợp hình ảnh và kiến thức Bài 23 qua video giảng dạy của giáo viên.</p>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: 'var(--color-sgu-navy)' }}>Bài 23 – Hiện tượng phóng xạ</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Video giảng: Thí nghiệm Becquerel, buồng sương, các tia phóng xạ, định luật phóng xạ, ứng dụng thực tế.
              </p>
              <video controls poster="/videos/nuclear-lessons-v2/b23.jpg" style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <source src="/videos/nuclear-lessons-v2/b23.mp4" type="video/mp4" />
                <track kind="subtitles" srcLang="vi" src="/videos/nuclear-lessons-v2/b23.vi.vtt" label="Tiếng Việt" default />
                Trình duyệt của bạn không hỗ trợ video HTML5.
              </video>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
