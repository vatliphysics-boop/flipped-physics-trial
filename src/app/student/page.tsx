import { StudentShell } from "./StudentShell";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getLessonLabel } from "@/lib/curriculum";

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
  const { data: lessons } = classIds.length
    ? await supabase
        .from("lessons")
        .select("id, title, description, learning_objectives, created_at, class_id, curriculum_code, curriculum_order")
        .in("class_id", classIds)
        .eq("status", "published")
        .not("curriculum_code", "is", null)
        .order("curriculum_order", { ascending: true, nullsFirst: false })
    : { data: [] };
    
  const nextLesson = lessons?.[0] ?? null;
  const nextCurriculumLesson = nextLesson ? getLessonLabel({ number: Number(nextLesson.curriculum_code?.slice(1) ?? 0), title: nextLesson.title.replace(/^Bài\s+\d+[.:]?\s*/i, "") }) : null;

  return (
    <StudentShell active="overview" title="Tổng quan học tập" description="Tiếp tục quá trình học và theo dõi các nhiệm vụ sắp tới.">
      <div className="student-dashboard" style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 0" }}>
        
        {/* Current Learning Focus */}
        <section className="learning-focus-panel" style={{ backgroundColor: "var(--color-primary)", color: "white", borderRadius: "var(--radius-lg)", padding: "48px 40px", marginBottom: "40px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 4px 20px rgba(51, 92, 255, 0.15)" }}>
          <div style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.85, fontWeight: 600 }}>
            Tiêu điểm học tập
          </div>
          <h2 style={{ color: "white", fontSize: "32px", margin: 0, fontWeight: 600, letterSpacing: "-0.02em" }}>
            {nextLesson ? `Bài ${nextLesson.curriculum_code?.replace('B', '')} — ${nextCurriculumLesson}` : "Bắt đầu hành trình học tập"}
          </h2>
          <p style={{ opacity: 0.9, fontSize: "16px", margin: 0, maxWidth: "600px", lineHeight: 1.6 }}>
            {nextLesson 
              ? "Tiếp tục tìm hiểu nội dung bài học hiện tại của em." 
              : "Mở chương trình học để chọn bài học phù hợp với lớp của em."}
          </p>
          <div style={{ marginTop: "24px" }}>
            {nextLesson ? (
              <Link href={`/student/lessons/${nextLesson.id}`} className="btn" style={{ backgroundColor: "white", color: "var(--color-primary)", fontWeight: 600, border: "none", padding: "12px 24px", borderRadius: "var(--radius-sm)" }}>
                Tiếp tục học
              </Link>
            ) : (
              <Link href="/student/curriculum" className="btn" style={{ backgroundColor: "white", color: "var(--color-primary)", fontWeight: 600, border: "none", padding: "12px 24px", borderRadius: "var(--radius-sm)" }}>
                Xem chương trình
              </Link>
            )}
          </div>
        </section>

        {/* Upcoming Tasks Summary */}
        <section className="dashboard-tasks" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "18px", color: "var(--text-primary)" }}>Nhiệm vụ sắp tới</h3>
            <Link href="/student/assignments" style={{ color: "var(--color-primary)", fontSize: "14px", fontWeight: 500 }}>Xem tất cả</Link>
          </div>
          
          <div className="task-list" style={{ backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
            <div style={{ padding: "32px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
              Hiện chưa có nhiệm vụ nào cần hoàn thành.
            </div>
          </div>
        </section>

      </div>
    </StudentShell>
  );
}
