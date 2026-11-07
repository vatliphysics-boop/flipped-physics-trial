import Link from "next/link";
import { NUCLEAR_LAB_LESSONS, nuclearLabUrl } from "@/lib/nuclear-lab-lessons";
import styles from "./SiteChrome.module.css";

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  if (compact) return <footer className={styles.workspaceFooter}><span>Vật lí Hạt nhân 12</span><nav aria-label="Liên kết cuối trang"><Link href="/hoc-lieu">Kho học liệu công khai</Link><Link href="/gioi-thieu">Thông tin học liệu</Link></nav></footer>;
  return <footer className={styles.footer}>
    <div className={styles.footerGrid}>
      <div><h2>Vật lí Hạt nhân 12</h2><p>Học liệu Vật lí 12 để tự học trước giờ, khám phá và thảo luận tại lớp, rồi vận dụng và tự đánh giá.</p>
        <details className={styles.project}><summary>Thông tin công trình</summary><p>Xây dựng và sử dụng học liệu số có hỗ trợ trí tuệ nhân tạo trong tổ chức dạy học theo mô hình lớp học đảo ngược nhằm phát triển năng lực tự học của học sinh qua chủ đề “Vật lí hạt nhân” môn Vật lí lớp 12 ở trường THPT.</p></details>
      </div>
      <div><h2>Khám phá</h2><ul><li><Link href="/hoc-lieu/phong-hat-nhan">Mô hình và video</Link></li><li><Link href="/hoc-lieu/truc-quan">Phòng trực quan</Link></li><li><Link href="/hoc-lieu">Kho học liệu</Link></li><li><Link href="/hoc-lieu/lop-hoc-dao-nguoc">Hướng dẫn ba pha</Link></li></ul></div>
      <div><h2>Bài 21–25</h2><ul>{NUCLEAR_LAB_LESSONS.map(lesson => <li key={lesson.code}><Link href={nuclearLabUrl(lesson.code)}><strong>{lesson.code}</strong> · {lesson.title}</Link></li>)}</ul></div>
    </div>
    <div className={styles.credits}><p><strong>Nhóm thực hiện</strong> Võ Đoàn Đăng Khôi, Nguyễn Bảo Thy, Bùi Ngọc Xuân Phương</p><p><strong>Giảng viên hướng dẫn</strong> PGS.TS. Nguyễn Thị Nhị</p><p>Khoa Sư phạm Khoa học Tự nhiên, Trường Đại học Sài Gòn</p></div>
  </footer>;
}
