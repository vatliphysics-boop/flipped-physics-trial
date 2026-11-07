import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudentShell } from "../StudentShell";
import { LearningLibrary } from "@/components/learning/LearningLibrary";
export default async function StudentMaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "student") redirect("/login");
  const { type } = await searchParams;
  return (
    <StudentShell
      active="materials"
      title="Kho học liệu của em"
      description="Nhấn tên để mở thí nghiệm, video, phiếu học tập hoặc nhiệm vụ. Kết quả tự luyện tại kho chưa được nộp cho giáo viên."
    >
      <LearningLibrary key={type ?? "all"} initialType={type} />
    </StudentShell>
  );
}
