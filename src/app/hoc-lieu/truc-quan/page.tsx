import Link from "next/link";
import { PortalShell } from "@/components/PortalShell";
import { VisualLearningStudio } from "@/components/learning/VisualLearningStudio";
export default async function VisualLearningPage({ searchParams }: { searchParams: Promise<{ bai?: string }> }) {
  const { bai } = await searchParams;
  return <PortalShell floatingTutor={false} aiLessonCode={bai ?? "B21"} role="student" active="materials" publicLibrary account={<Link className="btn small" href="/login">Đăng nhập lớp học</Link>}><VisualLearningStudio key={bai ?? "B21"} code={bai}/></PortalShell>;
}
