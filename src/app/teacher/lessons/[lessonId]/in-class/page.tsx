import { TeacherShell } from "../../../TeacherShell";
import { LessonNavigation } from "@/components/learning/LessonNavigation";
import { getTeacherLesson } from "@/lib/teacher-lesson";
import { PhysicsActivityList } from "@/components/physics/FixedPhysicsActivityRenderer";

export default async function TeacherSimulationPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { lesson, classItem, curriculum } = await getTeacherLesson(lessonId);
  return <TeacherShell active="curriculum" title={`${lesson.title} — Pha 2: Mô phỏng và khám phá`} description="Tổ chức hoạt động quan sát, thảo luận và khám phá trong giờ học.">
    <LessonNavigation role="teacher" lessonId={lessonId} className={classItem.name} lessonTitle={lesson.title} active="in_class" classId={classItem.id} chapterCode={curriculum.chapterCode} />
    <section className="phase-panel"><header className="section-header"><div><h2>Hoạt động mô phỏng</h2><p>Thực hiện từng hoạt động theo đúng bài học để tổ chức thảo luận trên lớp.</p></div></header><PhysicsActivityList lessonCode={curriculum.code as "B21"|"B22"|"B23"|"B24"|"B25"} /></section>
  </TeacherShell>;
}

