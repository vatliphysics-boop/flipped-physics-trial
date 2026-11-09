"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { B25Hero } from "./B25Hero";
import { B25DataProcessLab } from "./B25DataProcessLab";
import { BindingEnergyCalculator, NuclearEquationBalancer } from "./B25Activities";
import { LatexMath } from "@/components/learning/LatexMath";
import styles from "./B25Lesson.module.css";

const TOC = [
  ["khoi-dong", "Khởi động"],
  ["muc-1", "I. Hệ thống hóa công thức"],
  ["muc-2", "II. Đọc đồ thị H(t) — Bảng 25.1"],
  ["muc-3", "III. Cân bằng phương trình hạt nhân"],
  ["muc-4", "IV. Năng lượng liên kết"],
  ["muc-5", "V. Sáu bài tập SGK"],
  ["video", "Video học liệu"],
] as const;

const FORMULAS = [
  {
    title: "Định luật phóng xạ",
    math: String.raw`N=N_0\,2^{-t/T}\qquad H=\lambda N`,
    note: "N là số hạt nhân còn lại, T là chu kì bán rã, H là độ phóng xạ (Bq = 1 phân rã/giây).",
  },
  {
    title: "Bảo toàn trong phương trình hạt nhân",
    math: String.raw`\textstyle\sum A_{\text{trước}}=\sum A_{\text{sau}}\quad \sum Z_{\text{trước}}=\sum Z_{\text{sau}}`,
    note: "Số khối A và điện tích Z bảo toàn. Với phân rã β phải kể thêm electron/positron và neutrino.",
  },
  {
    title: "Độ hụt khối và năng lượng liên kết",
    math: String.raw`\Delta m=Z m_{\mathrm{H}}+N m_n-m_{\text{nhân}}\qquad E_{lk}=\Delta m\,c^2`,
    note: "Dùng 1 u·c² ≈ 931,5 MeV. Năng lượng liên kết riêng Elk/A so sánh độ bền giữa các hạt nhân.",
  },
  {
    title: "Hệ số nhân neutron",
    math: String.raw`k=\frac{\text{số neutron thế hệ sau}}{\text{số neutron thế hệ trước}}`,
    note: "k = 1 duy trì phản ứng dây chuyền có kiểm soát; k < 1 tắt dần; k > 1 tăng theo cấp số nhân.",
  },
] as const;

export function B25Lesson() {
  const [done, setDone] = useState({ graph: false, balance: false, energy: false });
  const set = useCallback((key: keyof typeof done, value: boolean) => {
    setDone((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);
  const allDone = done.graph && done.balance && done.energy;
  const reported = useRef(false);

  useEffect(() => {
    if (reported.current === allDone) return;
    reported.current = allDone;
  }, [allDone]);

  const steps = [
    { key: "graph" as const, label: "Đọc đồ thị H(t) và ước lượng chu kì bán rã" },
    { key: "balance" as const, label: "Cân bằng ít nhất hai phương trình hạt nhân" },
    { key: "energy" as const, label: "Tính Elk cho ít nhất ba hạt nhân và trả lời câu hỏi" },
  ];

  return (
    <div className={styles.lesson}>
      <section id="khoi-dong"><B25Hero /></section>

      <nav className={styles.toc} aria-label="Mục lục Bài 25">
        {TOC.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>

      <article className={styles.body}>
        <section id="muc-1" className={styles.section}>
          <h2>I. Hệ thống hóa công thức</h2>
          <p className={styles.lead}>
            Bốn hệ thức dưới đây là toàn bộ công cụ cần cho sáu bài tập SGK. Mỗi thẻ ghi công thức, kí hiệu và
            một lưu ý về đơn vị hoặc điều kiện áp dụng.
          </p>
          <div className={styles.formulaGrid}>
            {FORMULAS.map((f) => (
              <div key={f.title} className={styles.formulaCard}>
                <strong>{f.title}</strong>
                <LatexMath block math={f.math} />
                <span>{f.note}</span>
              </div>
            ))}
          </div>
          <div className="physics-checklist">
            <p><strong>Tiêu chí hoàn thành bài học:</strong></p>
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
          <h2>II. Đọc đồ thị H(t) — Bảng 25.1</h2>
          <p className={styles.lead}>
            Tám mốc đo của SGK giữ nguyên, không thay bằng số sinh ngẫu nhiên. Chọn một chu kì giả thuyết, hiện
            đường lí thuyết, rồi đối chiếu với từng điểm đo để thấy mô hình khớp tới đâu.
          </p>
          <B25DataProcessLab onSubDone={(v) => set("graph", v)} />
        </section>

        <section id="muc-3" className={styles.section}>
          <h2>III. Cân bằng phương trình hạt nhân</h2>
          <p className={styles.lead}>
            Mỗi ví dụ cho một hạt nhân mẹ và tia phát ra. Điền số khối A và số proton Z của hạt nhân con, rồi
            kiểm tra. Giải đúng ít nhất hai ví dụ để hoàn thành mục này.
          </p>
          <NuclearEquationBalancer onSubDone={(v) => set("balance", v)} />
        </section>

        <section id="muc-4" className={styles.section}>
          <h2>IV. Năng lượng liên kết</h2>
          <p className={styles.lead}>
            Chọn hạt nhân, xem từng bước tính độ hụt khối và năng lượng liên kết, so sánh năng lượng liên kết
            riêng. Xem ít nhất ba hạt nhân và trả lời câu hỏi kiểm tra.
          </p>
          <BindingEnergyCalculator onSubDone={(v) => set("energy", v)} />
        </section>

        <section id="muc-5" className={styles.section}>
          <h2>V. Sáu bài tập SGK</h2>
          <p className={styles.lead}>
            Sáu bài tập trang 121–122. Mỗi bài có gợi ý hướng giải trong phần mở rộng — chỉ mở sau khi em đã
            tự thử.
          </p>

          <div className={styles.exercise}>
            <div className={styles.exerciseHeader}>
              <span className={styles.exerciseBadge}>Bài 1</span>
              <strong>Lực nào làm lệch hạt α trong lá vàng?</strong>
            </div>
            <p>Trong thí nghiệm tán xạ alpha của Rutherford, hạt α bay gần hạt nhân vàng thì bị lệch.</p>
            <details className={styles.exerciseAnswer}>
              <summary>Gợi ý và đáp án</summary>
              <p>Hạt α mang điện tích +2e, hạt nhân vàng mang +79e. Lực đẩy tĩnh điện Coulomb giữa hai điện tích dương làm hạt α lệch khỏi phương ban đầu. Lực hấp dẫn nhỏ hơn nhiều bậc nên không phải nguyên nhân.</p>
            </details>
          </div>

          <div className={styles.exercise}>
            <div className={styles.exerciseHeader}>
              <span className={styles.exerciseBadge}>Bài 2</span>
              <strong>Vẽ đồ thị H(t) và ước lượng chu kì bán rã</strong>
            </div>
            <p>Dùng Bảng 25.1. Từ 151 Bq xuống 9 Bq trong 360 s, ước lượng chu kì bán rã của mẫu.</p>
            <details className={styles.exerciseAnswer}>
              <summary>Gợi ý và đáp án</summary>
              <p>Mức nửa ban đầu là 75,5 Bq, nằm giữa 85 Bq (t = 30 s) và 55 Bq (t = 60 s). Nội suy thẳng hai mốc cho ≈ 39,5 s. Khớp toàn bộ tám điểm bằng hàm mũ cho T ≈ 40–45 s. Hai cách cho kết quả cùng bậc, đều khoảng 40 s.</p>
            </details>
          </div>

          <div className={styles.exercise}>
            <div className={styles.exerciseHeader}>
              <span className={styles.exerciseBadge}>Bài 3</span>
              <strong>Định tuổi mẫu gỗ bằng carbon-14</strong>
            </div>
            <p>Mẫu gỗ cổ có 240 phân rã/phút, T(¹⁴C) = 5730 năm, 25 g carbon gồm ¹²C và ¹⁴C. Tỉ lệ số nguyên tử ¹²C : ¹⁴C khi sinh vật còn sống là 10¹² : 1.</p>
            <details className={styles.exerciseAnswer}>
              <summary>Gợi ý và đáp án</summary>
              <p>Tính độ phóng xạ riêng của mẫu sống từ tỉ lệ ¹²C : ¹⁴C và khối lượng carbon, rồi so sánh với 240 phân rã/phút để suy ra tỉ số H/H₀. Từ đó t = T·log₂(H₀/H). Cần giữ đơn vị phút và năm nhất quán. Đây là bài vận dụng toàn bộ định luật phóng xạ, không có một công thức riêng.</p>
            </details>
          </div>

          <div className={styles.exercise}>
            <div className={styles.exerciseHeader}>
              <span className={styles.exerciseBadge} data-level="vận dụng">Bài 4</span>
              <strong>Nhiên liệu cho nhà máy điện hạt nhân</strong>
            </div>
            <p>Nhà máy công suất 1400 MW, hiệu suất 36 %, mỗi phân hạch tỏa 200 MeV. Tính khối lượng U-235 cần mỗi ngày.</p>
            <details className={styles.exerciseAnswer}>
              <summary>Gợi ý và đáp án</summary>
              <p>Công suất nhiệt cần = 1400/0,36 ≈ 3889 MW. Năng lượng mỗi ngày = 3889·10⁶ · 86400 ≈ 3,36·10¹⁴ J. Số phân hạch = năng lượng / (200 MeV · 1,6·10⁻¹³ J/MeV). Mỗi phân hạch tiêu thụ một hạt U-235 khối lượng 235 u ≈ 3,9·10⁻²⁵ kg. Kết quả cỡ vài kg U-235 mỗi ngày — nhỏ hơn rất nhiều so với than đá cùng công suất.</p>
            </details>
          </div>

          <div className={styles.exercise}>
            <div className={styles.exerciseHeader}>
              <span className={styles.exerciseBadge} data-level="vận dụng">Bài 5</span>
              <strong>Thời gian chiếu xạ tăng dần theo tuổi nguồn Co-60</strong>
            </div>
            <p>Nguồn ⁶⁰Co có T = 5,3 năm. Tháng 1/2022 cần chiếu 150 phút để đạt cùng liều. Tính thời gian cần vào tháng 6/2024 (khoảng 29 tháng sau).</p>
            <details className={styles.exerciseAnswer}>
              <summary>Gợi ý và đáp án</summary>
              <p>Giả thiết tốc độ chiếu tỉ lệ với độ phóng xạ, nên thời gian tỉ lệ nghịch với H: t<sub>mới</sub> = t<sub>cũ</sub> · H₀/H<sub>mới</sub> = 150 · 2<sup>29/(12·5,3)</sup> ≈ 206 phút. Đây là lí do các trung tâm chiếu xạ phải định kì tính lại thời gian chiếu hoặc thay nguồn.</p>
            </details>
          </div>

          <div className={styles.exercise}>
            <div className={styles.exerciseHeader}>
              <span className={styles.exerciseBadge} data-level="vận dụng">Bài 6</span>
              <strong>Hai bệnh nhân PET — ai cần nhiều FDG hơn?</strong>
            </div>
            <p>¹⁸F có T = 110 phút. Hai bệnh nhân cùng cân nặng, cần liều 0,1 mCi/kg tại thời điểm tiêm. Người A tiêm trước, người B tiêm sau 60 phút. Ai cần chuẩn bị nhiều thuốc hơn?</p>
            <details className={styles.exerciseAnswer}>
              <summary>Gợi ý và đáp án</summary>
              <p>Liều tại thời điểm tiêm là như nhau với cả hai. Nhưng thuốc phải được chuẩn bị sớm hơn cho người A, nên tại lúc sản xuất lượng FDG cần nhiều hơn: H<sub>sản xuất</sub> = H<sub>tiêm</sub> · 2<sup>t/T</sup>. Với người B chỉ chờ thêm 60 phút kể từ A, lượng cần lúc sản xuất ít hơn khoảng 2<sup>60/110</sup> ≈ 1,46 lần. Vậy người A (hoặc lượt tiêm sớm hơn) cần chuẩn bị nhiều FDG hơn.</p>
            </details>
          </div>
        </section>

        <section id="video" className={styles.section}>
          <h2>Video học liệu</h2>
          <p className={styles.lead}>Hướng dẫn đọc Bảng 25.1 và đối chiếu đường lí thuyết với số liệu SGK.</p>
          <div className={styles.videoCard}>
            <h3 className={styles.videoTitle}>Bài 25 – Bài tập về vật lí hạt nhân</h3>
            <p className={styles.videoMeta}>Thời lượng 1:16 · Phụ đề tiếng Việt · Nguồn: giáo viên bộ môn</p>
            <video className={styles.video} controls preload="metadata" poster="/videos/nuclear-lessons/b25.jpg">
              <source src="/videos/nuclear-lessons/b25.mp4" type="video/mp4" />
              <track kind="subtitles" srcLang="vi" src="/videos/nuclear-lessons/b25.vi.vtt" label="Tiếng Việt" default />
              Trình duyệt của bạn không hỗ trợ video HTML5.
            </video>
          </div>
        </section>
      </article>
    </div>
  );
}
