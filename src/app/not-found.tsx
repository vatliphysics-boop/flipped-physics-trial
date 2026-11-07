import Link from "next/link";
import { PublicShell } from "./PublicShell";

export default function NotFound() {
  return (
    <PublicShell>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "clamp(32px, 10vh, 96px) 24px" }}>
        <p className="page-kicker">Học liệu Vật lí 12 · 404</p>
        <h1>Chưa thể mở nội dung này</h1>
        <p className="page-description">
          Liên kết có thể không còn phù hợp, hoặc nội dung chỉ dành cho thành viên lớp học.
          Nếu đây là bài giáo viên giao, hãy đăng nhập đúng tài khoản và mở lại từ lớp học của bạn.
        </p>
        <nav aria-label="Tiếp tục sử dụng học liệu" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
          <Link className="btn primary" href="/login">Đăng nhập lớp học</Link>
          <Link className="btn" href="/hoc-lieu">Mở kho học liệu</Link>
          <Link className="btn" href="/">Về trang chủ</Link>
        </nav>
      </div>
    </PublicShell>
  );
}
