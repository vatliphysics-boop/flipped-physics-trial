import Link from "next/link";
import { PortalShell } from "@/components/PortalShell";
import { TeachingPlanStudio } from "@/components/learning/TeachingPlanStudio";
export default async function OpenPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; material?: string; form?: string }>;
}) {
  const params = await searchParams;
  return (
    <PortalShell
      role="teacher"
      active="materials"
      publicLibrary
      account={
        <Link className="btn small" href="/teacher/plans">
          Đăng nhập giáo viên
        </Link>
      }
    >
      <header className="page-header">
        <div>
          <p className="page-kicker">Kho học liệu · Bàn soạn mở</p>
          <h1>Soạn kế hoạch dạy học</h1>
          <p className="page-description">
            Mục tiêu – học liệu – hoạt động – sản phẩm – đánh giá trong ba pha
            trước, trong và sau giờ học.
          </p>
        </div>
      </header>
      <TeachingPlanStudio
        template={params.template}
        materialId={params.material}
        form={params.form}
      />
    </PortalShell>
  );
}
