import { redirect } from "next/navigation";

export default async function TeacherLegacyCurriculumPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  redirect(`/teacher/curriculum?classId=${encodeURIComponent(classId)}`);
}
