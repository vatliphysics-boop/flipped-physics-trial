import Link from "next/link";
import styles from "./SiteChrome.module.css";

export function SiteBrand({ href = "/" }: { href?: string }) {
  return <Link href={href} className={styles.brand} aria-label="Vật lí Hạt nhân 12 · Trang chủ">
    <span className={styles.mark} aria-hidden="true">α</span>
    <span>Vật lí Hạt nhân 12</span>
  </Link>;
}
