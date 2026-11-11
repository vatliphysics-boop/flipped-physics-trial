"use client";

import Link from "next/link";
import Image from "next/image";
import { NUCLEAR_LAB_LESSONS, nuclearLabUrl } from "@/lib/nuclear-lab-lessons";
import styles from "./SiteChrome.module.css";

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  if (compact) return <footer className={styles.workspaceFooter}>
    <span>© {new Date().getFullYear()} Dự án NCKH Vật lí 12 · Trường Đại học Sài Gòn</span>
    <nav aria-label="Liên kết cuối trang"><Link href="/hoc-lieu">Kho học liệu công khai</Link><Link href="/gioi-thieu">Thông tin học liệu</Link></nav>
  </footer>;

  return <footer className={styles.footer}>
    <div className={styles.footerGrid}>
      <div>
        <Image src="/branding/sgu-logo.png" alt="Logo SGU" width={271} height={58} className={styles.footerLogo} />
        <h2>Học liệu Vật lí Hạt nhân 12</h2>
        <p>Hệ thống học liệu số, mô phỏng tương tác và thiết kế bài dạy theo mô hình Lớp học đảo ngược cho chủ đề Vật lí hạt nhân lớp 12.</p>
        <div className={styles.footerNote}>
          <strong>Lưu ý:</strong> Đây là sản phẩm nghiên cứu khoa học, không phải website chính thức của Trường Đại học Sài Gòn.
        </div>
        <details className={styles.project}>
          <summary>Về dự án nghiên cứu này</summary>
          <p>Đề tài: Thiết kế và vận hành hệ thống học liệu số theo mô hình Flipped Classroom để phát triển năng lực tự học của học sinh qua chủ đề &ldquo;Vật lí hạt nhân&rdquo; môn Vật lí lớp 12 ở trường THPT.</p>
        </details>
      </div>

      <div>
        <h2>Khám phá</h2>
        <ul>
          <li><Link href="/hoc-lieu/phong-hat-nhan">Mô hình và video</Link></li>
          <li><Link href="/hoc-lieu/truc-quan">Phòng trực quan</Link></li>
          <li><Link href="/hoc-lieu">Kho học liệu</Link></li>
          <li><Link href="/hoc-lieu/lop-hoc-dao-nguoc">Hướng dẫn ba pha</Link></li>
        </ul>
      </div>

      <div>
        <h2>Bài 21–25</h2>
        <ul>
          {NUCLEAR_LAB_LESSONS.map(lesson => <li key={lesson.code}>
            <Link href={nuclearLabUrl(lesson.code)}>
              <strong>{lesson.code}</strong> · {lesson.title}
            </Link>
          </li>)}
        </ul>
      </div>
    </div>

    <div className={styles.credits}>
      <p><strong>Nhóm thực hiện</strong> Võ Đoàn Đăng Khôi, Nguyễn Bảo Thy, Bùi Ngọc Xuân Phương</p>
      <p><strong>Giảng viên hướng dẫn</strong> PGS.TS. Nguyễn Thị Nhị</p>
      <p>Khoa Sư phạm Khoa học Tự nhiên, Trường Đại học Sài Gòn</p>
    </div>
  </footer>;
}
