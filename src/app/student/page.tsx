import { AppSidebar } from "@/components/AppSidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { ProgressBar } from "@/components/ProgressBar";
import { StatCard } from "@/components/StatCard";

const items = [
  { label: "Tổng quan", href: "/student", active: true },
  { label: "Lớp học của em", href: "#" },
  { label: "Bài cần chuẩn bị", href: "#" },
  { label: "Đang học", href: "#" },
  { label: "Đã hoàn thành", href: "#" },
  { label: "Nhật ký học tập", href: "#" },
];

export default function StudentPage() {
  return (
    <div className="shell">
      <AppSidebar items={items} />
      <main className="main">
        <div className="page-title">
          <div>
            <span className="eyebrow">Không gian học sinh</span>
            <h1>Chào em</h1>
            <p>Tiếp tục những nhiệm vụ em cần hoàn thành trước giờ học.</p>
          </div>
          <div className="actions" style={{ marginTop: 0 }}>
            <button className="btn">Nhập mã lớp</button>
            <LogoutButton />
          </div>
        </div>

        <div className="grid-4">
          <StatCard label="Cần chuẩn bị" value="03" />
          <StatCard label="Đang học" value="02" />
          <StatCard label="Hoàn thành" value="05" />
          <StatCard label="Tiến độ tuần" value="78%" />
        </div>

        <section className="section">
          <h2>Việc cần làm trước giờ học</h2>
          <p className="section-sub">
            Danh sách minh họa các nhiệm vụ chuẩn bị sắp tới.
          </p>
          <div className="list">
            {[
              ["Hiện tượng phóng xạ", "20 phút", 70],
              ["Phản ứng hạt nhân", "25 phút", 35],
              ["Ứng dụng và an toàn bức xạ", "15 phút", 0],
            ].map(([title, time, progress]) => (
              <div className="row" key={String(title)}>
                <div style={{ flex: 1 }}>
                  <span className="badge">Trước giờ học</span>
                  <h3 style={{ margin: "8px 0 2px" }}>{title}</h3>
                  <small className="muted">
                    Thời lượng dự kiến: {time}
                  </small>
                  <ProgressBar value={Number(progress)} />
                </div>
                <b>{progress}%</b>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
