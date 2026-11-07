import Link from "next/link";
import { PortalShell } from "@/components/PortalShell";
import { AILearningWorkspace } from "@/components/learning/AILearningWorkspace";

export default async function AILearningPage({ searchParams }: { searchParams: Promise<{ bai?: string }> }) {
  const { bai } = await searchParams;
  return <PortalShell aiLessonCode={bai} role="student" active="tutor" publicLibrary account={<Link className="btn small" href="/login">Đăng nhập lớp học</Link>}>
    <AILearningWorkspace key={bai ?? "B21"} initialCode={bai} headingLevel={1}/>
  </PortalShell>;
}
