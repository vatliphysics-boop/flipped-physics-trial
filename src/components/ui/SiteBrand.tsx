import Link from "next/link";
import Image from "next/image";
import styles from "./SiteChrome.module.css";

export function SiteBrand({ href = "/" }: { href?: string }) {
  return <Link href={href} className={styles.brand} aria-label="Vật lí Hạt nhân 12 · Trang chủ">
    <Image src="/branding/sgu-logo.png" alt="Logo Trường Đại học Sài Gòn" width={271} height={58} priority className={styles.logo} />
    <span className={styles.brandText}>
      <span className={styles.brandTitle}>Vật lí Hạt nhân 12</span>
      <span className={styles.brandSub}>Sản phẩm nghiên cứu khoa học · Trường Đại học Sài Gòn</span>
    </span>
  </Link>;
}
