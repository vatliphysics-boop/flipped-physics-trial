import { StudentShell } from "./StudentShell";
import { createClient } from "@/lib/supabase/server";
import { JoinClassForm } from "./JoinClassForm";
import { StudentClasses } from "./StudentClasses";
import Link from "next/link";
import { GRADE_12_CURRICULUM, getLessonLabel } from "@/lib/curriculum";

// Items removed as they are handled by StudentShell

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
        .select("id, title, description, learning_objectives, created_at, class_id, curriculum_code, curriculum_order")
        .in("class_id", classIds)
        .eq("status", "published")
        .not("curriculum_code", "is", null)
        .order("curriculum_order", { ascending: true, nullsFirst: false })
    : { data: [] };
  const nextLesson = lessons?.[0] ?? null;
  const nextCurriculumLesson = nextLesson ? getLessonLabel({ number: Number(nextLesson.curriculum_code?.slice(1) ?? 0), title: nextLesson.title.replace(/^Bài\s+\d+[.:]?\s*/i, "") }) : null;

  return (
    <StudentShell active="overview" title="Tổng quan học tập" description="Chọn bài để bắt đầu, theo dõi lớp học và hoàn thành hoạt động được giao.">
      <div className="overview-page student-overview">
        <section className="panel overview-continue">
          <div className="overview-continue-content">
            <p className="overview-kicker">HỌC TẬP HÔM NAY</p>
            <h2>{nextLesson ? "Bắt đầu bài học tiếp theo" : "Chọn bài để bắt đầu"}</h2>
            <p>{nextLesson ? <><strong>{nextLesson.curriculum_code}</strong> · {nextCurriculumLesson}</> : "Mở chương trình để chọn bài học phù hợp với lớp của em."}</p>
            <div className="overview-actions">
              {nextLesson ? <Link className="btn primary" href={`/student/lessons/${nextLesson.id}`}>Mở bài học</Link> : <Link className="btn primary" href="/student/curriculum">Xem chương trình</Link>}
              <Link className="btn" href="/student/assignments">Xem bài tập</Link>
            </div>
          </div>
        </section>
        <div className="overview-main-grid">
          <section className="panel" style={{ padding: "24px" }}>
            <div className="overview-section-heading">
              <h2>Lớp học của em</h2>
              <Link className="text-link" href="/student/classes">Xem tất cả</Link>
            </div>
            <p className="section-sub" style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px" }}>Tham gia lớp bằng mã lớp để xem học liệu và hoạt động được mở.</p>
            <JoinClassForm />
          </section>
          
          <aside className="overview-quick-actions">
            <div className="overview-section-heading">
              <h2>Việc cần làm</h2>
            </div>
            <Link href="/student/assignments">
              <strong>Bài tập và kiểm tra</strong>
              <span>Xem các hoạt động em được phép truy cập.</span>
            </Link>
            <Link href="/student/classes">
              <strong>Lớp học của em</strong>
              <span>Mở lớp và học liệu đang có.</span>
            </Link>
            <Link href="/student/curriculum">
              <strong>Chương trình học</strong>
              <span>Chọn bài học trong Vật lí 12.</span>
            </Link>
          </aside>
        </div>
        
        <section className="panel" style={{ padding: "24px" }}>
          <div className="overview-section-heading">
            <h2>Chương trình Vật lí 12</h2>
            <Link className="text-link" href="/student/curriculum">Xem toàn bộ</Link>
          </div>
          <div className="overview-list">
            {GRADE_12_CURRICULUM.map((chapter) => (
              <article className="list-row" key={chapter.code}>
                <div className="list-row-content">
                  <h3>{chapter.title}</h3>
                  <p>Chương {chapter.code} · {chapter.lessons.length} bài học</p>
                </div>
                <Link className="btn" href={`/student/curriculum/${chapter.code}`}>Mở chương</Link>
              </article>
            ))}
          </div>
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

        <section id="learning-log" className="section student-section learning-log-note"><h2>Nhật kí học tập</h2><p className="section-sub">Tiến độ được lưu trong từng hoạt động. Mở một bài học để tiếp tục đúng nơi em đã dừng lại.</p></section>

      </div>
    </StudentShell>
  );
}
