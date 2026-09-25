import { redirect } from "next/navigation";
import { getStudentLesson } from "./student-lesson";

export async function checkPhaseAccess(lessonId: string, phase: "before_class" | "in_class" | "after_class") {
  const { supabase, user } = await getStudentLesson(lessonId);

  // Fetch all progress for this lesson
  const { data: progress } = await supabase
    .from("student_phase_progress")
    .select("phase, is_completed")
    .eq("lesson_id", lessonId)
    .eq("student_id", user.id);

  const phaseProgress = {
    before_class: progress?.find((p) => p.phase === "before_class")?.is_completed ?? false,
    in_class: progress?.find((p) => p.phase === "in_class")?.is_completed ?? false,
    after_class: progress?.find((p) => p.phase === "after_class")?.is_completed ?? false,
  };

  if (phase === "in_class" && !phaseProgress.before_class) {
    redirect(`/student/lessons/${lessonId}/before-class`);
  }

  if (phase === "after_class" && !phaseProgress.in_class) {
    // If before_class is also not completed, before-class should be the target.
    if (!phaseProgress.before_class) {
      redirect(`/student/lessons/${lessonId}/before-class`);
    }
    redirect(`/student/lessons/${lessonId}/in-class`);
  }

  return phaseProgress;
}
