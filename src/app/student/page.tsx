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
          <div><span className="eyebrow">Không gian học sinh</span><h1>Vật lí 12</h1><p>Học theo tiến trình lớp học đảo ngược và chủ động theo dõi quá trình tự học.</p></div>
          <div className="actions dashboard-actions">
            <LogoutButton />
          </div>
        </div>

        <section className="continue-learning card">
          <div><span className="eyebrow">TIẾP TỤC HỌC</span><h2>{nextLesson ? "Tiếp tục học" : "Bắt đầu chương trình Vật lí 12"}</h2><p>{nextLesson ? <><strong>{nextLesson.curriculum_code}</strong> · {nextCurriculumLesson}</> : "Khám phá bốn chương của chương trình Vật lí 12."}</p><span className="continue-context">{nextLesson ? "Giai đoạn hiện tại: Trước giờ học" : "Chương trình học"}</span></div>
          {nextLesson ? <Link className="btn primary" href={`/student/lessons/${nextLesson.id}`}>Tiếp tục học →</Link> : <Link className="btn primary" href="/student/curriculum">Xem chương trình học →</Link>}
        </section>

        <section className="section student-section course-overview">
          <div className="section-heading"><div><span className="eyebrow">CHƯƠNG TRÌNH HỌC</span><h2>Bốn chương của Vật lí 12</h2></div><Link className="text-link" href="/student/curriculum">Xem toàn bộ →</Link></div>
          <div className="grid-4 chapter-card-grid">{GRADE_12_CURRICULUM.map((chapter) => <Link className="card chapter-card" href={`/student/curriculum/${chapter.code}`} key={chapter.code}><span className="chapter-number">0{chapter.number}</span><span className="chapter-kicker">CHƯƠNG {chapter.code}</span><h3>{chapter.title}</h3><p>Bài {String(chapter.lessons[0].number).padStart(2, "0")}–{String(chapter.lessons.at(-1)!.number).padStart(2, "0")} · {chapter.lessons.length} bài học</p><span className="text-link">Xem chương →</span></Link>)}</div>
        </section>

        <section id="student-classes" className="section student-section student-join-section"><h2>Lớp học của em</h2><p className="section-sub">Nhập mã lớp để truy cập học liệu và hoạt động học tập.</p><JoinClassForm /></section>

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

      </main>
    </div>
  );
}
