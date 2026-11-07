import Link from "next/link";
import { PortalShell } from "@/components/PortalShell";
import { TeacherWorkroom } from "@/components/learning/TeacherWorkroom";
export default function TeacherAIDemoPage() {
  return <PortalShell role="teacher" active="tutor" publicLibrary account={<Link className="btn small" href="/teacher/ai">Đăng nhập giáo viên</Link>}><header className="page-header"><div><p className="page-kicker">Chương 4: Vật lí hạt nhân · B21–B25</p><h1>Không gian hỗ trợ giáo viên</h1><p className="page-description">Biên soạn câu hỏi, tạo đề theo ma trận, chuẩn bị phiếu học tập và kế hoạch dạy học.</p></div></header><TeacherWorkroom demo/></PortalShell>;
}
