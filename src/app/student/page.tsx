import { AppSidebar } from "@/components/AppSidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/server";
import { JoinClassForm } from "./JoinClassForm";
import { StudentClasses } from "./StudentClasses";
import Link from "next/link";
import { GRADE_12_CURRICULUM, getLessonLabel } from "@/lib/curriculum";

const items = [
  { label: "Tổng quan", href: "/student", active: true },
  { label: "Chương trình học", href: "/student/curriculum" },
  { label: "Lớp học của em", href: "#student-classes" },
  { label: "Nhật kí học tập", href: "#learning-log" },
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
        .select("id, title, description, learning_objectives, created_at, class_id, curriculum_code, curriculum_order")
        .in("class_id", classIds)
        .eq("status", "published")
        .not("curriculum_code", "is", null)
        .order("curriculum_order", { ascending: true, nullsFirst: false })
    : { data: [] };
  const nextLesson = lessons?.[0] ?? null;
  const nextCurriculumLesson = nextLesson ? getLessonLabel({ number: Number(nextLesson.curriculum_code?.slice(1) ?? 0), title: nextLesson.title.replace(/^Bài\s+\d+[.:]?\s*/i, "") }) : null;

  return (
    <div className="shell">
      <AppSidebar items={items} />
      <main className="main student-main">
        <div className="page-title student-header">
          <div><span className="eyebrow">Không gian học sinh</span><h1>Tổng quan học tập</h1><p>Chọn bài để bắt đầu, theo dõi lớp học và hoàn thành hoạt động được giao.</p></div>
          <div className="actions dashboard-actions"><LogoutButton /></div>
        </div>

        <div className="overview-page student-overview">
        <section className="overview-continue">
          <div><p className="overview-kicker">HỌC TẬP HÔM NAY</p><h2>{nextLesson ? "Bắt đầu bài học tiếp theo" : "Chọn bài để bắt đầu"}</h2><p>{nextLesson ? <><strong>{nextLesson.curriculum_code}</strong> · {nextCurriculumLesson}</> : "Mở chương trình để chọn bài học phù hợp với lớp của em."}</p><div className="overview-actions">{nextLesson ? <Link className="btn primary" href={`/student/lessons/${nextLesson.id}`}>Mở bài học</Link> : <Link className="btn primary" href="/student/curriculum">Xem chương trình</Link>}<Link className="btn" href="/student/assignments">Xem bài tập</Link></div></div>
          <div className="overview-illustration-wrap" aria-hidden="true"><svg className="overview-illustration" viewBox="0 0 220 150"><rect x="56" y="42" width="88" height="58" rx="8" fill="none" stroke="currentColor" strokeWidth="4"/><path d="M72 118h56M96 100v18M78 75c12-23 39-25 52-8 9 12-2 27-18 25-20-2-28-27-12-39" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><circle cx="110" cy="66" r="5" fill="currentColor"/></svg></div>
        </section>
        <div className="overview-main-grid"><section className="overview-panel"><div className="overview-section-heading"><div><p className="overview-kicker">LỚP HỌC</p><h2>Lớp học của em</h2></div><Link className="text-link" href="/student/classes">Xem tất cả</Link></div><p className="section-sub">Tham gia lớp bằng mã lớp để xem học liệu và hoạt động được mở.</p><JoinClassForm /></section><aside className="overview-panel overview-quick-actions"><div className="overview-section-heading"><div><p className="overview-kicker">LỐI TẮT</p><h2>Việc cần làm</h2></div></div><Link href="/student/assignments"><strong>Bài tập và kiểm tra</strong><span>Xem các hoạt động em được phép truy cập.</span></Link><Link href="/student/classes"><strong>Lớp học của em</strong><span>Mở lớp và học liệu đang có.</span></Link><Link href="/student/curriculum"><strong>Chương trình học</strong><span>Chọn bài học trong Vật lí 12.</span></Link></aside></div>
        <section className="section student-section course-overview">
          <div className="section-heading"><div><span className="eyebrow">CHƯƠNG TRÌNH HỌC</span><h2>Bốn chương của Vật lí 12</h2></div><Link className="text-link" href="/student/curriculum">Xem toàn bộ →</Link></div>
          <div className="grid-4 chapter-card-grid">{GRADE_12_CURRICULUM.map((chapter) => <Link className="card chapter-card" href={`/student/curriculum/${chapter.code}`} key={chapter.code}><span className="chapter-number">0{chapter.number}</span><span className="chapter-kicker">CHƯƠNG {chapter.code}</span><h3>{chapter.title}</h3><p>Bài {String(chapter.lessons[0].number).padStart(2, "0")}–{String(chapter.lessons.at(-1)!.number).padStart(2, "0")} · {chapter.lessons.length} bài học</p><span className="text-link">Xem chương →</span></Link>)}</div>
        </section>

        <section className="overview-phases"><div className="overview-section-heading"><div><p className="overview-kicker">CÁCH HỌC MỖI BÀI</p><h2>Ba pha học tập</h2></div></div><div className="overview-phase-list"><article><span>01</span><h3>Chuẩn bị trước giờ học</h3><p>Xem video và làm theo hướng dẫn của giáo viên.</p></article><article><span>02</span><h3>Mô phỏng và khám phá</h3><p>Khám phá mô phỏng, trao đổi khi học trên lớp.</p></article><article><span>03</span><h3>Bài tập cuối bài</h3><p>Hoàn thành bài tập và nộp theo yêu cầu.</p></article></div></section>

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
      </main>
    </div>

  );
}
