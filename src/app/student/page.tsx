import { AppSidebar } from "@/components/AppSidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/server";
import { JoinClassForm } from "./JoinClassForm";
import { StudentClasses } from "./StudentClasses";
import { StudentLessonList } from "./StudentLessonList";

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

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };

  if (!user || profile?.role !== "student") {
    return (
      <div className="shell">
        <AppSidebar items={items} />
        <main className="main student-main">
          <div className="page-title student-header">
            <div>
              <span className="eyebrow">Không gian học sinh</span>
              <h1>Chào em</h1>
              <p>Vui lòng đăng nhập bằng tài khoản học sinh để xem bài học.</p>
            </div>
            <div className="actions dashboard-actions"><LogoutButton /></div>
          </div>
        </main>
      </div>
    );
  }

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

  const { data: lessons } = classIds.length
    ? await supabase
        .from("lessons")
        .select("id, title, description, learning_objectives, created_at, class_id")
        .in("class_id", classIds)
        .eq("status", "published")
        .order("created_at", { ascending: false })
    : { data: [] };
  const lessonsWithClassNames = (lessons ?? []).map((lesson) => ({
    ...lesson,
    learning_objectives: lesson.learning_objectives ?? "",
    className: classesById.get(lesson.class_id)?.name ?? "Lớp học của em",
  }));

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

        <section className="section student-section student-join-section">
          <h2>Tham gia lớp học</h2>
          <p className="section-sub">Nhập mã lớp để truy cập học liệu và hoạt động học tập.</p>
          <JoinClassForm />
        </section>

        <StudentClasses
          classes={joinedClasses.map(({ classItem, joined_at }) => ({
            id: classItem!.id,
            name: classItem!.name,
            description: classItem!.description,
            join_code: classItem!.join_code,
            joined_at,
          }))}
        />

        <section className="section student-section">
          <h2>Bài học của tôi</h2>
          <p className="section-sub">
            Các bài học đã được giáo viên xuất bản trong lớp của em.
          </p>
          <StudentLessonList lessons={lessonsWithClassNames} />
        </section>

      </main>
    </div>
  );
}
