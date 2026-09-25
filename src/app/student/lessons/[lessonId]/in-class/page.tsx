import { PortalShell } from "@/components/PortalShell";
import { LogoutButton } from "@/components/LogoutButton";
import { StudentLessonHeader } from "../../StudentLessonHeader";
import { getStudentLesson } from "@/lib/student-lesson";
import { PhysicsActivityList } from "@/components/physics/FixedPhysicsActivityRenderer";

export default async function StudentInClassPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { lesson, curriculum } = await getStudentLesson(lessonId);
  
  const cleanTitle = lesson.title.replace(/^Bài\s+\d+[.:]?\s*/i, "");

  return (
    <PortalShell role="student" active="lessons" account={<LogoutButton />}>
      <StudentLessonHeader 
        lessonId={lessonId}
        lessonTitle={cleanTitle}
        chapterCode={curriculum.chapterCode}
        description="Thực hiện thí nghiệm ảo, xử lí dữ liệu và thảo luận kết quả."
        activePhase="in_class"
      />
      
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        <section className="physics-lab-container" style={{ padding: "0 0 48px" }}>
          <PhysicsActivityList lessonCode={curriculum.code as "B21"|"B22"|"B23"|"B24"|"B25"} />
        </section>
      </div>
    </PortalShell>
  );
}

