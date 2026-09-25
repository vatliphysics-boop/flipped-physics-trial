import { StudentShell } from "./StudentShell";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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
      <StudentShell active="overview" title="Chào em" description="Vui lòng đăng nhập bằng tài khoản học sinh để xem bài học.">
        <div />
      </StudentShell>
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
  // ACTUAL DB SCHEMA: lessons { id, topic_id, class_id, teacher_id, title, description,
  //                             learning_objectives, status, created_at }
  // No curriculum_code or curriculum_order columns.
  const { data: lessons } = classIds.length
    ? await supabase
        .from("lessons")
        .select("id, title, description, learning_objectives, created_at, class_id, topic_id")
        .in("class_id", classIds)
        .eq("status", "published")
        .not("topic_id", "is", null)
        .order("created_at", { ascending: true, nullsFirst: false })
    : { data: [] };
    
  const nextLesson = lessons?.[0] ?? null;

  return (
    <StudentShell active="overview" title="Tổng quan học tập" description="Tiếp tục quá trình học và theo dõi các nhiệm vụ sắp tới.">
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Learning Focus */}
        <section className="student-paper" style={{ marginBottom: "32px" }}>
          <div className="student-kicker">Tiêu điểm học tập</div>
          <h2 className="student-heading">
            {nextLesson ? nextLesson.title : "Bắt đầu hành trình học tập"}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.7, maxWidth: "560px", marginBottom: "24px" }}>
            {nextLesson 
              ? "Tiếp tục tìm hiểu nội dung bài học hiện tại của em." 
              : "Mở chương trình học để chọn bài học phù hợp với lớp của em."}
          </p>
          {nextLesson ? (
            <Link href={`/student/lessons/${nextLesson.id}`} className="btn primary" style={{ padding: "10px 24px" }}>
              Tiếp tục học →
            </Link>
          ) : (
            <Link href="/student/curriculum" className="btn primary" style={{ padding: "10px 24px" }}>
              Xem chương trình →
            </Link>
          )}
        </section>

        {/* Upcoming Tasks */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", margin: 0 }}>Nhiệm vụ sắp tới</h2>
            <Link href="/student/assignments" style={{ fontSize: "13px", color: "var(--color-primary)", fontWeight: 500 }}>Xem tất cả →</Link>
          </div>
          <div className="student-empty" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-lg)", padding: "40px 0" }}>
            <h2>Chưa có nhiệm vụ</h2>
            <p>Hiện không có bài tập nào cần hoàn thành.</p>
          </div>
        </section>

      </div>
    </StudentShell>
  );
}
