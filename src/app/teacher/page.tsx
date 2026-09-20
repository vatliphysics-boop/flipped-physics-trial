import { AppSidebar } from "@/components/AppSidebar";
import { LogoutButton } from "@/components/LogoutButton";
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
      <main className="main dashboard-main">
        <div className="page-title dashboard-header">
          <div>
            <span className="eyebrow">Không gian giáo viên</span>
            <h1>Tổng quan</h1>
            <p>Theo dõi học liệu và mức độ chuẩn bị của học sinh.</p>
          </div>
          <div className="actions dashboard-actions">
            <button className="btn primary">+ Tạo bài học</button>
            <LogoutButton />
          </div>
        </div>

        <section className="section dashboard-section">
          <h2>Tạo lớp học</h2>
          <p className="section-sub">Tạo không gian học tập cho lớp Vật lí hạt nhân của em.</p>
          <CreateClassForm />
        </section>

        <div className="grid-4 dashboard-stats">
          <StatCard
            label="Lớp học"
            value={String(classes?.length ?? 0).padStart(2, "0")}
            note="Đang phụ trách"
          />
        </div>

        <section className="section dashboard-section">
          <h2>Lớp học của tôi</h2>
          {classes?.length ? (
            <div className="grid-3">
              {classes.map((classItem) => (
                <div className="card class-card" key={classItem.id}>
                  <h3>{classItem.name}</h3>
                  <p className="class-description">{classItem.description || "Chưa có mô tả."}</p>
                  <div className="class-meta">
                    <span className="class-code"><span>Mã lớp</span><strong>{classItem.join_code}</strong></span>
                    <span><span>Ngày tạo</span><strong>{new Date(classItem.created_at).toLocaleDateString("vi-VN")}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Bạn chưa tạo lớp học nào.</p>
          )}
        </section>

      </main>
    </div>
  );
}
