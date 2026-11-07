import Link from "next/link";
import { PortalShell } from "@/components/PortalShell";
import { FlippedClassroomGuide } from "@/components/learning/FlippedClassroomGuide";
export default function FlippedClassroomPage() {
  return <PortalShell role="teacher" active="materials" publicLibrary account={<Link className="btn small" href="/teacher/plans">Đăng nhập giáo viên</Link>}><header className="page-header"><div><p className="page-kicker">B21–B25 · Tổ chức dạy học</p><h1>Hình thức lớp học đảo ngược</h1><p className="page-description">Cách tổ chức, nhiệm vụ của giáo viên và học sinh, học liệu và sản phẩm cần có.</p></div></header><FlippedClassroomGuide /></PortalShell>;
}
