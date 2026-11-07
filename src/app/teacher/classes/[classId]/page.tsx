import Link from "next/link";
import { notFound } from "next/navigation";
import { ClassManagement } from "../../ClassManagement";
import { CopyJoinCodeButton } from "../../CopyJoinCodeButton";
import type { ClassMember } from "../../actions";
import { getTeacherContext } from "../../data";
import { TeacherShell } from "../../TeacherShell";

export default async function TeacherClassPage({ params, searchParams }: { params: Promise<{ classId: string }>; searchParams: Promise<{ created?: string }> }) {
  const { classId } = await params;
  const { created } = await searchParams;
  const { supabase, user } = await getTeacherContext();
  const { data: classItem } = await supabase.from("classes").select("id, name, description, join_code").eq("id", classId).eq("teacher_id", user.id).maybeSingle();
  if (!classItem) notFound();
  const { data, error } = await supabase.rpc("list_class_members_for_teacher", { p_class_id: classId });
  const members = Array.isArray(data) ? data as ClassMember[] : [];

  return (
    <TeacherShell
      active="classes"
      title={classItem.name}
      description={classItem.description || "Không gian học tập Vật lí 12 của lớp."}
      breadcrumb={
        <nav className="breadcrumbs" aria-label="Đường dẫn">
          <Link href="/teacher/classes">Lớp học</Link>
          <span>›</span>
          <span>{classItem.name}</span>
        </nav>
      }
    >
      <section className="class-detail-page">
        {created === "1" && (
          <p className="form-alert form-alert-success" role="status">
            Đã tạo lớp học. Chia sẻ mã tham gia với học sinh của bạn.
          </p>
        )}

        <div className="class-detail-back">
          <Link href="/teacher/classes">← Quay lại danh sách lớp</Link>
        </div>

        {/* Nhóm 1: Thông tin lớp học */}
        <section className="class-info-card" aria-label="Thông tin lớp học">
          <div className="class-info-header">
            <div>
              <div className="class-info-kicker">
                <span className="badge small badge-blue">Lớp học đang hoạt động</span>
                <span>Chương trình Vật lí 12</span>
              </div>
              <h2 className="class-info-title">{classItem.name}</h2>
              <p className="class-info-desc">
                {classItem.description || "Không gian học tập và theo dõi tiến trình bài học Vật lí 12 của lớp."}
              </p>
            </div>
          </div>

          <div className="class-detail-summary">
            <div className="class-summary-item">
              <span>Sĩ số hiện tại</span>
              <strong>{error ? "Chưa tải được" : `${members.length} học sinh`}</strong>
            </div>
            <div className="class-summary-item class-detail-code">
              <span>Mã tham gia lớp</span>
              <div className="class-code-row">
                <strong className="class-code-value">{classItem.join_code}</strong>
                <CopyJoinCodeButton code={classItem.join_code} />
              </div>
            </div>
          </div>
        </section>

        {/* Nhóm 2: Không gian tổ chức dạy học */}
        <section className="class-nav-group" aria-label="Tổ chức dạy học">
          <h2 className="class-section-title">Không gian dạy học của lớp</h2>
          <div className="class-detail-navigation">
            <article className="class-nav-card">
              <div>
                <h3>Chương trình và bài học</h3>
                <p>Tổ chức bài học, các pha học tập và nội dung theo chương trình cho lớp này.</p>
              </div>
              <Link className="btn primary" href={`/teacher/curriculum?classId=${classId}`}>
                Mở chương trình →
              </Link>
            </article>
            <article className="class-nav-card">
              <div>
                <h3>Học liệu của lớp</h3>
                <p>Xem video, mô phỏng và học liệu đã tạo cho các bài học thuộc lớp này.</p>
              </div>
              <Link className="btn" href={`/teacher/materials?classId=${classId}`}>
                Mở học liệu
              </Link>
            </article>
            <article className="class-nav-card">
              <div>
                <h3>Học sinh và kết quả</h3>
                <p>Theo dõi tiến độ hoàn thành các pha và kết quả đánh giá của học sinh trong lớp.</p>
              </div>
              <Link className="btn" href={`/teacher/students?classId=${classId}`}>
                Mở danh sách học sinh
              </Link>
            </article>
          </div>
        </section>

        {/* Nhóm 3 & 4: Thao tác quản lý lớp, Danh sách học sinh & Khu vực nguy hiểm */}
        <section className="class-detail-admin" aria-label="Quản trị lớp">
          <h2 className="class-section-title">Quản trị lớp &amp; Danh sách học sinh</h2>
          <ClassManagement
            classId={classId}
            name={classItem.name}
            description={classItem.description || ""}
            initialMembers={members}
            showMembersInitially={true}
          />
        </section>
      </section>
    </TeacherShell>
  );
}
