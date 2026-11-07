import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudentShell } from "../StudentShell";
import { AILearningWorkspace } from "@/components/learning/AILearningWorkspace";

export default async function StudentAIPage({ searchParams }: { searchParams: Promise<{ bai?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "student") redirect("/login");
  const { bai } = await searchParams;
  return <StudentShell aiLessonCode={bai ?? "B21"} active="tutor" title="Giải thích và gợi ý học tập" description="Dùng AI theo bài B21–B25 và ghi lại kết quả tự học.">
    <AILearningWorkspace key={bai ?? "B21"} initialCode={bai}/>
  </StudentShell>;
}
