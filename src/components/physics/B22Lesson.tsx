"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { B22Hero } from "./B22Hero";
import { BindingEnergyLab, NuclearFusion, NuclearReactionBalancer } from "./B22Activities";
import styles from "./B22Lesson.module.css";

const NuclearFission = dynamic(
  () => import("./B22Activities").then((m) => m.NuclearFission),
  { ssr: false, loading: () => <p role="status">Đang tải mô hình 3D phân hạch…</p> },
);

const TOC = [
  ["khoi-dong", "Khởi động"],
  ["muc-1", "I. Phản ứng hạt nhân — buồng sương"],
  ["muc-2", "II. Năng lượng liên kết riêng"],
  ["muc-3", "III. Phân hạch hạt nhân"],
  ["muc-4", "IV. Nhiệt hạch"],
  ["video", "Video học liệu"],
] as const;

export function B22Lesson() {
  const [done, setDone] = useState({
    balancer: false,
    binding: false,
    fission: false,
    fusion: false,
  });
  const set = useCallback((key: keyof typeof done, value: boolean) => {
    setDone((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  const steps = [
    { key: "balancer" as const, label: "Cân bằng phương trình phản ứng Rutherford 1919" },
    { key: "binding" as const, label: "Đọc đồ thị Elkr và giải thích phân hạch" },
    { key: "fission" as const, label: "Quan sát phân hạch U-235 và đếm neutron" },
    { key: "fusion" as const, label: "So sánh tán xạ và nhiệt hạch D+T" },
  ];

  return (
    <div className={styles.lesson}>
      <section id="khoi-dong"><B22Hero /></section>

      <nav className={styles.toc} aria-label="Mục lục Bài 22">
        {TOC.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>

      <article className={styles.body}>
        <section id="muc-1" className={styles.section}>
          <h2>I. Phản ứng hạt nhân — buồng sương Blackett</h2>
          <p className={styles.lead}>
            Năm 1919, Rutherford cho hạt alpha bắn qua khí nitrogen và quan sát thấy proton bật ra.
            Blackett dùng buồng sương chụp lại vết hình chữ Y: đây là bằng chứng trực tiếp của phản ứng
            hạt nhân nhân tạo đầu tiên. Điền A và Z của oxygen-17 và proton để cân bằng phương trình.
          </p>
          <NuclearReactionBalancer onProgress={(v) => set("balancer", v)} />
        </section>

        <section id="muc-2" className={styles.section}>
          <h2>II. Năng lượng liên kết riêng E<sub>lkr</sub></h2>
          <p className={styles.lead}>
            Hạt nhân bền hơn có năng lượng liên kết riêng lớn hơn. Đỉnh đường cong quanh A ≈ 56
            (sắt–nickel) giải thích vì sao cả phân hạch lẫn nhiệt hạch đều tỏa năng lượng — mỗi chiều
            đều đưa hệ về gần đỉnh hơn.
          </p>
          <BindingEnergyLab onProgress={(v) => set("binding", v)} />
        </section>

        <section id="muc-3" className={styles.section}>
          <h2>III. Phân hạch hạt nhân</h2>
          <p className={styles.lead}>
            Hạt nhân U-235 hấp thụ một neutron rồi vỡ thành hai mảnh và giải phóng 2–3 neutron.
            Mỗi neutron có thể kích hoạt phân hạch tiếp theo — đó là cơ chế phản ứng dây chuyền.
            Hệ số nhân k quyết định liệu dây chuyền tắt dần, duy trì, hay tăng theo cấp số nhân.
          </p>
          <NuclearFission onProgress={(v) => set("fission", v)} />
        </section>

        <section id="muc-4" className={styles.section}>
          <h2>IV. Nhiệt hạch</h2>
          <p className={styles.lead}>
            Ở nhiệt độ hàng triệu độ, deuteri (²H) và triti (³H) tới đủ gần nhau để xảy ra phản ứng
            tổng hợp thành heli-4 và một neutron. Lực đẩy Coulomb giữa hai hạt nhân dương chỉ bị thắng
            khi hạt có động năng đủ lớn.
          </p>
          <NuclearFusion onProgress={(v) => set("fusion", v)} />
        </section>

        <section className={styles.section}>
          <h2>Tiêu chí hoàn thành</h2>
          <div className="physics-checklist">
            <ul>
              {steps.map((s) => (
                <li key={s.key} className={done[s.key] ? "is-done" : ""}>
                  {s.label} {done[s.key] ? "✓" : ""}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="video" className={styles.section}>
          <h2>Video học liệu</h2>
          <p className={styles.lead}>
            Tổng hợp phản ứng Rutherford 1919, đồ thị năng lượng liên kết riêng, cơ chế phân hạch và
            nhiệt hạch.
          </p>
          <div className={styles.videoCard}>
            <h3 className={styles.videoTitle}>Bài 22 – Phản ứng hạt nhân và năng lượng liên kết</h3>
            <p className={styles.videoMeta}>Phụ đề tiếng Việt · Nguồn: giáo viên bộ môn</p>
            <video className={styles.video} controls preload="metadata" poster="/videos/nuclear-lessons/b22.jpg">
              <source src="/videos/nuclear-lessons/b22.mp4" type="video/mp4" />
              <track kind="subtitles" srcLang="vi" src="/videos/nuclear-lessons/b22.vi.vtt" label="Tiếng Việt" default />
              Trình duyệt của bạn không hỗ trợ video HTML5.
            </video>
          </div>
        </section>
      </article>
    </div>
  );
}
