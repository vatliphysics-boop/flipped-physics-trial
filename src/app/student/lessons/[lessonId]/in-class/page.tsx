import { StudentShell } from "../../../StudentShell";
import { LessonNavigation } from "@/components/learning/LessonNavigation";
import { getStudentLesson } from "@/lib/student-lesson";
import { PhysicsActivityList } from "@/components/physics/FixedPhysicsActivityRenderer";

export default async function StudentInClassPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { lesson, classItem, curriculum } = await getStudentLesson(lessonId);
  return <StudentShell active="lessons" title={`${lesson.title} — Pha 2: Trong giờ học`} description="Thí nghiệm ảo • Xử lí dữ liệu • Thảo luận • Vận dụng">
    <LessonNavigation role="student" lessonId={lessonId} className={classItem.name} lessonTitle={lesson.title} active="in_class" />
    <section className="phase-panel"><header className="section-header"><div><h2>Hoạt động trong giờ học</h2><p>Thực hiện thí nghiệm ảo, xử lí dữ liệu và thảo luận kết quả.</p></div></header><PhysicsActivityList lessonCode={curriculum.code as "B21"|"B22"|"B23"|"B24"|"B25"} /></section>
  </StudentShell>;
}

