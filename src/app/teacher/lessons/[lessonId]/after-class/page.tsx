import { redirect } from "next/navigation";

export default async function TeacherLegacyAfterClassPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  redirect(`/teacher/lessons/${lessonId}/assessment`);
}

