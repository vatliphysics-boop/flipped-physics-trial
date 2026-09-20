import { AppSidebar } from "@/components/AppSidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { StatCard } from "@/components/StatCard";
import { createClient } from "@/lib/supabase/server";
import { JoinClassForm } from "./JoinClassForm";

const items = [
  { label: "Tổng quan", href: "/student", active: true },
  { label: "Lớp học của em", href: "#" },
  { label: "Bài cần chuẩn bị", href: "#" },
  { label: "Đang học", href: "#" },
  { label: "Đã hoàn thành", href: "#" },
  { label: "Nhật ký học tập", href: "#" },
];

export default async function StudentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberships } = user
    ? await supabase
        .from("class_members")
        .select("class_id, joined_at")
        .eq("student_id", user.id)
        .order("joined_at", { ascending: false })
    : { data: [] };

  const classIds = memberships?.map((membership) => membership.class_id) ?? [];
  const { data: classes } = classIds.length
    ? await supabase
        .from("classes")
        .select("id, name, description, join_code")
        .in("id", classIds)
    : { data: [] };
  const classesById = new Map(classes?.map((classItem) => [classItem.id, classItem]) ?? []);
  const joinedClasses =
    memberships
      ?.map((membership) => ({
        ...membership,
        classItem: classesById.get(membership.class_id),
      }))
      .filter((membership) => membership.classItem) ?? [];

  return (
    <div className="shell">
      <AppSidebar items={items} />
      <main className="main student-main">
        <div className="page-title student-header">
          <div>
            <span className="eyebrow">Không gian học sinh</span>
            <h1>Chào em</h1>
            <p>Tiếp tục những nhiệm vụ em cần hoàn thành trước giờ học.</p>
          </div>
          <div className="actions dashboard-actions">
            <LogoutButton />
          </div>
        </div>

        <div className="grid-4 student-stats">
          <StatCard label="Lớp học của tôi" value={String(joinedClasses.length)} note="Đã tham gia" />
        </div>

        <section className="section student-section student-join-section">
          <h2>Tham gia lớp học</h2>
          <p className="section-sub">Nhập mã lớp để truy cập học liệu và hoạt động học tập.</p>
          <JoinClassForm />
        </section>

        <section className="section student-section">
          <h2>Lớp học của tôi</h2>
          {joinedClasses.length ? (
            <div className="grid-3">
              {joinedClasses.map(({ classItem, joined_at }) => (
                <div className="card student-class-card" key={classItem!.id}>
                  <h3>{classItem!.name}</h3>
                  <p className="student-class-description">
                    {classItem!.description || "Chưa có mô tả."}
                  </p>
                  <div className="student-class-meta">
                    <span className="class-code">
                      <span>Mã lớp</span>
                      <strong>{classItem!.join_code}</strong>
                    </span>
                    <span className="class-date">
                      <span>Ngày tham gia</span>
                      <strong>{new Date(joined_at).toLocaleDateString("vi-VN")}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Bạn chưa tham gia lớp học nào.</p>
          )}
        </section>

      </main>
    </div>
  );
}
