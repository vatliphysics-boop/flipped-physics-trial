import Link from "next/link";
import { AppSidebar } from "@/components/AppSidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { StatCard } from "@/components/StatCard";
import { createClient } from "@/lib/supabase/server";
import { CreateClassForm } from "./CreateClassForm";
import { ClassManagement } from "./ClassManagement";
import type { ClassMember } from "./actions";

const items = [
  { label: "Tổng quan", href: "/teacher", active: true },
  { label: "Lớp học", href: "#" },
  { label: "Chương trình", href: "#" },
  { label: "Học liệu", href: "#" },
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
            <LogoutButton />
          </div>
        </div>

        <section className="section dashboard-section">
          <h2>Tạo lớp học</h2>
          <p className="section-sub">Tạo không gian học tập cho lớp Vật lí hạt nhân của em.</p>
          <CreateClassForm />
        </section>

        <section className="section dashboard-section"><h2>Chương trình Vật lí hạt nhân</h2><p className="section-sub">Chọn một lớp để quản lý năm bài học cố định và học liệu riêng của lớp.</p></section>

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
              {classes.map(async (classItem) => {
                const { data: memberData } = await supabase.rpc("list_class_members_for_teacher", {
                  p_class_id: classItem.id,
                });
                const initialMembers = Array.isArray(memberData) ? (memberData as ClassMember[]) : [];

                return (
                <div className="card class-card" key={classItem.id}>
                  <h3>{classItem.name}</h3>
                  <p className="class-description">{classItem.description || "Chưa có mô tả."}</p>
                  <div className="class-meta">
                    <span className="class-code"><span>Mã lớp</span><strong>{classItem.join_code}</strong></span>
                    <span><span>Ngày tạo</span><strong>{new Date(classItem.created_at).toLocaleDateString("vi-VN")}</strong></span>
                  </div>
                  <ClassManagement
                    classId={classItem.id}
                    name={classItem.name}
                    description={classItem.description}
                    initialMembers={initialMembers}
                  />
                  <Link className="btn primary curriculum-class-link" href={`/teacher/classes/${classItem.id}/curriculum`}>Mở chương trình lớp học</Link>
                </div>
                );
              })}
            </div>
          ) : (
            <p>Bạn chưa tạo lớp học nào.</p>
          )}
        </section>

      </main>
    </div>
  );
}
