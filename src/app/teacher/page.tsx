import { AppSidebar } from "@/components/AppSidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { ProgressBar } from "@/components/ProgressBar";
import { StatCard } from "@/components/StatCard";
import { createClient } from "@/lib/supabase/server";
import { CreateClassForm } from "./CreateClassForm";

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

export default async function TeacherPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: classes } = user
    ? await supabase
        .from("classes")
        .select("id, name, description, join_code, created_at")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

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

        <section className="section">
          <h2>Tạo lớp học</h2>
          <CreateClassForm />
        </section>

        <div className="grid-4">
          <StatCard
            label="Lớp học"
            value={String(classes?.length ?? 0).padStart(2, "0")}
            note="Đang phụ trách"
          />
        </div>

        <section className="section">
          <h2>Lớp học của tôi</h2>
          {classes?.length ? (
            <div className="grid-3">
              {classes.map((classItem) => (
                <div className="card" key={classItem.id}>
                  <h3>{classItem.name}</h3>
                  <p>{classItem.description || "Chưa có mô tả."}</p>
                  <p>
                    <b>Mã lớp:</b> {classItem.join_code}
                  </p>
                  <p>
                    Ngày tạo: {new Date(classItem.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>Bạn chưa tạo lớp học nào.</p>
          )}
        </section>

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
