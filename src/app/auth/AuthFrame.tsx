import type { ReactNode } from "react";
import Link from "next/link";
import { SiteBrand } from "@/components/ui/SiteBrand";
import { NuclearScienceIllustration } from "@/components/learning/NuclearScienceIllustration";
import styles from "./auth-frame.module.css";

export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <div className={styles.frame}>
        <aside className={styles.introduction} aria-label="Học liệu Vật lí 12">
          <SiteBrand />
          <div className={styles.overview}>
            <NuclearScienceIllustration className={styles.illustration} />
            <p className={styles.eyebrow}>Không gian học tập</p>
            <h2>Khám phá vật lí hạt nhân</h2>
            <p>Học qua mô hình, video và nhiệm vụ theo từng bài B21–B25.</p>
            <ol className={styles.phases}>
              <li><span>01</span> Chuẩn bị trước giờ học</li>
              <li><span>02</span> Khám phá trong giờ học</li>
              <li><span>03</span> Vận dụng sau giờ học</li>
            </ol>
          </div>
          <Link href="/hoc-lieu" className={styles.explore}>Khám phá học liệu công khai →</Link>
        </aside>
        <div className={styles.content}>{children}</div>
      </div>
    </main>
  );
}
