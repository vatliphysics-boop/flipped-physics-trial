import { StudentShell } from "../../../StudentShell";
import { LessonNavigation } from "@/components/learning/LessonNavigation";
import { getStudentLesson } from "@/lib/student-lesson";
import { PhysicsActivityList } from "@/components/physics/FixedPhysicsActivityRenderer";

export default async function StudentSimulationPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { lesson, classItem, curriculum } = await getStudentLesson(lessonId);
  return <StudentShell active="lessons" title={`${lesson.title} — Pha 2: Mô phỏng và khám phá`} description="Quan sát mô phỏng, thực hiện thao tác theo hướng dẫn và thảo luận kết quả.">
    <LessonNavigation role="student" lessonId={lessonId} className={classItem.name} lessonTitle={lesson.title} active="in_class" />
    <section className="phase-panel"><header className="section-header"><div><h2>Hoạt động khám phá</h2><p>Thử thay đổi thông số, quan sát kết quả và ghi nhận bằng chứng học tập.</p></div></header><PhysicsActivityList lessonCode={curriculum.code as "B21"|"B22"|"B23"|"B24"|"B25"} /></section>
  </StudentShell>;
}

