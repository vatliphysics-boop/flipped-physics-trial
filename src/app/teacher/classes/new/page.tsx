import Link from "next/link";
import { CreateClassForm } from "../../CreateClassForm";
import { TeacherShell } from "../../TeacherShell";

export default function NewTeacherClassPage() {
  return <TeacherShell active="classes" title="Tạo lớp học" description="Nhập thông tin cơ bản để tạo không gian học tập mới." breadcrumb={<nav className="breadcrumbs" aria-label="Đường dẫn"><Link href="/teacher/classes">Lớp học</Link><span>›</span><span>Tạo lớp</span></nav>}>
    <section className="teacher-create-class-page"><CreateClassForm /></section>
  </TeacherShell>;
}
