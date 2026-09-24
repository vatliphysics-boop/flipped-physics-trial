import Link from "next/link";
import { TeacherShell } from "./TeacherShell";
import { getTeacherClasses, getTeacherContext } from "./data";

export default async function TeacherPage() {
  const [{ classes, error }, { supabase, user }] = await Promise.all([getTeacherClasses(), getTeacherContext()]);
  const [{ count: publishedLessons, error: lessonError }, { data: members, error: memberError }] = await Promise.all([
    supabase.from("lessons").select("id", { count: "exact", head: true }).eq("teacher_id", user.id).eq("status", "published"),
    classes.length ? supabase.from("class_members").select("class_id").in("class_id", classes.map((item) => item.id)) : Promise.resolve({ data: [], error: null }),
  ]);
  const counts = new Map<string, number>();
  for (const member of members ?? []) counts.set(member.class_id, (counts.get(member.class_id) ?? 0) + 1);
  
  return (
    <TeacherShell active="overview" title="Tổng quan giảng dạy" description="Quản lý lớp học, chuẩn bị học liệu và theo dõi việc học.">
      <div className="overview-page">
        <section className="panel overview-continue">
          <div className="overview-continue-content">
            <p className="overview-kicker">CÔNG VIỆC HÔM NAY</p>
            <h2>{classes.length ? "Tiếp tục công việc giảng dạy" : "Tạo lớp học đầu tiên"}</h2>
            <p>{classes.length ? "Chọn một lớp để chuẩn bị bài, quản lý học liệu hoặc theo dõi học sinh." : "Tạo lớp để bắt đầu tổ chức bài học và mời học sinh tham gia."}</p>
            <div className="overview-actions">
              <Link className="btn primary" href="/teacher/classes">{classes.length ? "Chọn lớp học" : "Tạo lớp học"}</Link>
              <Link className="btn" href="/teacher/curriculum">Xem chương trình</Link>
            </div>
          </div>
        </section>

        {error && <p role="alert" className="form-alert form-alert-error">Không thể tải lớp học. Vui lòng tải lại trang.</p>}
        
        <section className="overview-stats">
          <article className="overview-stat">
            <span className="overview-stat-icon">L</span>
            <div>
              <p>Lớp đang phụ trách</p>
              <strong>{error ? "—" : classes.length}</strong>
            </div>
          </article>
          <article className="overview-stat">
            <span className="overview-stat-icon">B</span>
            <div>
              <p>Bài học đã xuất bản</p>
              <strong>{lessonError ? "—" : publishedLessons ?? 0}</strong>
            </div>
          </article>
          {!memberError && classes.length > 0 && (
            <article className="overview-stat">
              <span className="overview-stat-icon">HS</span>
              <div>
                <p>Lượt tham gia lớp</p>
                <strong>{members?.length ?? 0}</strong>
              </div>
            </article>
          )}
        </section>

        <div className="overview-main-grid">
          <section className="panel" style={{ padding: "24px" }}>
            <div className="overview-section-heading">
              <h2>Lớp học của tôi</h2>
              <Link className="text-link" href="/teacher/classes">Xem tất cả</Link>
            </div>
            {error ? null : classes.length ? (
              <div className="overview-list">
                {classes.slice(0, 5).map((item) => (
                  <article className="list-row" key={item.id}>
                    <div className="list-row-content">
                      <h3>{item.name}</h3>
                      <p>{item.description || "Chương trình Vật lí 12"} · {memberError ? "Chưa tải được sĩ số" : `${counts.get(item.id) ?? 0} học sinh`}</p>
                    </div>
                    <Link className="btn" href={`/teacher/classes/${item.id}`}>Mở lớp</Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="overview-empty">
                <p>Chưa có lớp học nào.</p>
                <Link className="btn primary" href="/teacher/classes#create-class">Tạo lớp học</Link>
              </div>
            )}
          </section>

          <aside className="overview-quick-actions">
            <div className="overview-section-heading">
              <h2>Thao tác nhanh</h2>
            </div>
            <Link href="/teacher/classes">
              <strong>Quản lý lớp học</strong>
              <span>Tạo lớp, chia sẻ mã và mở lớp.</span>
            </Link>
            <Link href="/teacher/materials">
              <strong>Chuẩn bị học liệu</strong>
              <span>Chọn lớp và bài trước khi thêm nội dung.</span>
            </Link>
            <Link href="/teacher/curriculum">
              <strong>Mở chương trình</strong>
              <span>Chọn bài học trong chương trình Vật lí 12.</span>
            </Link>
            <Link href="/teacher/students">
              <strong>Theo dõi học sinh</strong>
              <span>Xem danh sách và kết quả.</span>
            </Link>
          </aside>
        </div>
      </div>
    </TeacherShell>
  );
}
