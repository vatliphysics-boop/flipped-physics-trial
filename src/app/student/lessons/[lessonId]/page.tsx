import { redirect } from "next/navigation";

export default async function StudentLessonOverview({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  redirect(`/student/lessons/${lessonId}/before-class`);
}
