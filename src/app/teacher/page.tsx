import { AppSidebar } from "@/components/AppSidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { ProgressBar } from "@/components/ProgressBar";
import { StatCard } from "@/components/StatCard";

const items = [
  { label: "Tổng quan", href: "/teacher", active: true },
  { label: "Lớp học", href: "#" },
  { label: "Chủ đề", href: "#" },
  { label: "Bài học", href: "#" },
  { label: "Học liệu số", href: "#" },
  { label: "Theo dõi học sinh", href: "#" },
];

const lessons = [
  "Cấu trúc hạt nhân",
  "Độ hụt khối và năng lượng liên kết",
  "Hiện tượng phóng xạ",
  "Phản ứng hạt nhân",
  "Ứng dụng và an toàn bức xạ",
];

export default function TeacherPage() {
  return (
    <div className="shell">
      <AppSidebar items={items} />
      <main className="main">
        <div className="page-title">
          <div>
            <span className="eyebrow">Không gian giáo viên</span>
            <h1>Tổng quan</h1>
            <p>Theo dõi học liệu và mức độ chuẩn bị của học sinh.</p>
          </div>
          <div className="actions" style={{ marginTop: 0 }}>
            <button className="btn primary">+ Tạo bài học</button>
            <LogoutButton />
          </div>
        </div>

        <div className="grid-4">
          <StatCard label="Lớp học" value="03" note="Đang hoạt động" />
          <StatCard label="Học sinh" value="96" note="Trong các lớp phụ trách" />
          <StatCard label="Bài học" value="08" note="Thuộc chủ đề Vật lí hạt nhân" />
          <StatCard label="Đã xuất bản" value="05" note="Sẵn sàng cho học sinh" />
        </div>

        <section className="section">
          <h2>Tiến độ chuẩn bị trước giờ học</h2>
          <p className="section-sub">
            Dữ liệu minh họa để thể hiện cách giáo viên theo dõi tiến độ.
          </p>
          <div className="list">
            {[
              ["Nguyễn Minh Anh", 90],
              ["Trần Gia Huy", 72],
              ["Lê Khánh Linh", 55],
              ["Phạm Nhật Nam", 35],
            ].map(([name, progress]) => (
              <div className="row" key={String(name)}>
                <div style={{ flex: 1 }}>
                  <b>{name}</b>
                  <ProgressBar value={Number(progress)} />
                </div>
                <b>{progress}%</b>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Chủ đề Vật lí hạt nhân</h2>
          <div className="grid-3">
            {lessons.map((lesson, index) => (
              <div className="card" key={lesson}>
                <span className="badge">Bài {index + 1}</span>
                <h3>{lesson}</h3>
                <p>
                  Khung bài học có thể biên tập theo ba giai đoạn của lớp học đảo
                  ngược.
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
