import { TeacherShell } from "../TeacherShell";
import { getTeacherContext } from "../data";
import { getCombinedMaterialBank } from "@/lib/material-bank";
import { TeacherWorkroom } from "@/components/learning/TeacherWorkroom";
export default async function TeacherAIPage() {
  const { supabase, user } = await getTeacherContext();
  const materials = await getCombinedMaterialBank(supabase, user.id);
  return <TeacherShell active="tutor" title="Không gian hỗ trợ giáo viên" description="Tạo đề và phiếu có hình, đảo mã đề, phối hợp học liệu và chuẩn bị giờ học."><TeacherWorkroom teacherId={user.id} materials={materials}/></TeacherShell>;
}
