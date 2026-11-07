import Link from "next/link";
import { PortalShell } from "@/components/PortalShell";
import { LearningLibrary } from "@/components/learning/LearningLibrary";
export default async function OpenLearningPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; bai?: string; resource?: string }>;
}) {
  const { type, bai, resource } = await searchParams;
  return (
    <PortalShell
      role="student"
      active="materials"
      publicLibrary
      account={
        <Link href="/login" className="btn small">
          Đăng nhập lớp học
        </Link>
      }
    >
      <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <p className="page-kicker">Vật lí 12 · B21–B25</p>
          <h1>Chương 4: Vật lí hạt nhân</h1>
          <p className="page-description">
            B21–B25: thí nghiệm 3D nhiều góc nhìn, kiến thức, video, phiếu học
            tập và hoạt động nhóm. Kết quả ở đây dùng tự luyện; nộp bài qua lớp
            học sau khi đăng nhập.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link className="btn" href="/hoc-lieu/phong-hat-nhan">Mô hình và video B21–B25</Link>
          <Link className="btn" href="/hoc-lieu/lop-hoc-dao-nguoc">
            Cách tổ chức lớp học · Việc của GV &amp; HS
          </Link>
          <Link className="btn primary" href="/demo-lesson">
            Tiến trình 3 giai đoạn →
          </Link>
        </div>
      </header>
      <LearningLibrary key={`${type}-${bai}-${resource}`} initialType={type} initialLesson={bai} initialResource={resource} />
    </PortalShell>
  );
}
