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
        <section className="student-paper" style={{ marginBottom: "40px" }}>
          <div className="student-kicker">
            Tiêu điểm học tập
          </div>
          <h2 className="student-heading">
            {nextLesson ? `Bài ${nextLesson.curriculum_code?.replace('B', '')} — ${nextCurriculumLesson}` : "Bắt đầu hành trình học tập"}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: 1.7, maxWidth: "600px", marginBottom: "24px" }}>
            {nextLesson 
              ? "Tiếp tục tìm hiểu nội dung bài học hiện tại của em." 
              : "Mở chương trình học để chọn bài học phù hợp với lớp của em."}
          </p>
          <div>
            {nextLesson ? (
              <Link href={`/student/lessons/${nextLesson.id}`} className="btn primary" style={{ padding: "12px 24px" }}>
                Tiếp tục học
              </Link>
            ) : (
              <Link href="/student/curriculum" className="btn primary" style={{ padding: "12px 24px" }}>
                Xem chương trình
              </Link>
            )}
          </div>
        </section>

        {/* Upcoming Tasks Summary */}
        <section className="dashboard-tasks">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid var(--border-light)" }}>
            <div>
              <div className="student-kicker">Việc cần làm</div>
              <h2 className="student-heading" style={{ margin: 0, fontSize: "24px" }}>Nhiệm vụ sắp tới</h2>
            </div>
            <Link href="/student/assignments" className="btn" style={{ fontSize: "13px" }}>Xem tất cả</Link>
          </div>
          
          <div className="student-empty" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-lg)", padding: "48px 0" }}>
            <h2>Chưa có nhiệm vụ</h2>
            <p>Hiện không có bài tập nào cần hoàn thành.</p>
          </div>
        </section>

      </div>
    </StudentShell>
  );
}
