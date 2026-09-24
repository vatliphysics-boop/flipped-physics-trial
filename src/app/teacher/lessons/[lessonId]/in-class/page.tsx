import { redirect } from "next/navigation";

export default async function TeacherLegacyInClassPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  redirect(`/teacher/lessons/${lessonId}/simulation`);
}

