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

  return <TeacherShell active="classes" title={classItem.name} description={classItem.description || "Không gian học tập Vật lí 12 của lớp."} breadcrumb={<nav className="breadcrumbs" aria-label="Đường dẫn"><Link href="/teacher/classes">Lớp học</Link><span>›</span><span>{classItem.name}</span></nav>}>
    <section className="class-detail-page">
      {created === "1" && <p className="form-alert form-alert-success" role="status">Đã tạo lớp học. Chia sẻ mã tham gia với học sinh của bạn.</p>}
      <div className="class-detail-back"><Link href="/teacher/classes">← Quay lại danh sách lớp</Link></div>
      <div className="class-detail-summary">
        <div><span>Học sinh</span><strong>{error ? "Chưa tải được" : members.length}</strong></div>
        <div className="class-detail-code"><span>Mã tham gia</span><strong>{classItem.join_code}</strong><CopyJoinCodeButton code={classItem.join_code} /></div>
      </div>
      <div className="class-detail-navigation">
        <article><div><h2>Chương trình và bài học</h2><p>Tổ chức bài học, các pha học tập và nội dung theo chương trình cho lớp này.</p></div><Link className="btn primary" href={`/teacher/curriculum?classId=${classId}`}>Mở chương trình</Link></article>
        <article><div><h2>Học liệu của lớp</h2><p>Xem video và học liệu đã tạo cho các bài học thuộc lớp này.</p></div><Link className="btn" href={`/teacher/materials?classId=${classId}`}>Mở học liệu</Link></article>
        <article><div><h2>Học sinh và kết quả</h2><p>Quản lý thành viên và theo dõi việc học của học sinh trong lớp.</p></div><Link className="btn" href={`/teacher/students?classId=${classId}`}>Mở danh sách học sinh</Link></article>
      </div>
      <section className="class-detail-admin"><h2>Quản trị lớp</h2><ClassManagement classId={classId} name={classItem.name} description={classItem.description || ""} initialMembers={members} /></section>
    </section>
  </TeacherShell>;
}
