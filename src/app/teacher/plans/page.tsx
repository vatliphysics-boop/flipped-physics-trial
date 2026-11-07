import { TeacherShell } from "../TeacherShell";
import { getTeacherContext } from "../data";
import { getCombinedMaterialBank } from "@/lib/material-bank";
import { validateTeachingPlan } from "@/lib/teaching-plan";
import { TeachingPlanStudio } from "@/components/learning/TeachingPlanStudio";
export default async function TeacherPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; material?: string; form?: string }>;
}) {
  const { supabase, user } = await getTeacherContext();
  const params = await searchParams;
  const [materials, plans, lessons] = await Promise.all([
    getCombinedMaterialBank(supabase, user.id),
    supabase
      .from("teacher_teaching_plans")
      .select("plan")
      .eq("teacher_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(30),
    supabase
      .from("lessons")
      .select("id,title")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false }),
  ]);
  const initialPlans = (plans.data ?? []).flatMap((row) => {
    const checked = validateTeachingPlan(row.plan);
    return checked.plan ? [checked.plan] : [];
  });
  return (
    <TeacherShell
      active="plans"
      title="Kế hoạch dạy học của tôi"
      description="Sáng tạo, phối hợp học liệu và tổ chức tiến trình đảo ngược B21–B25 theo điều kiện lớp của bạn."
    >
      <TeachingPlanStudio
        teacherId={user.id}
        materials={materials}
        initialPlans={initialPlans}
        lessons={lessons.data ?? []}
        template={params.template}
        materialId={params.material}
        form={params.form}
        cloudError={
          plans.error
            ? "Chưa tải được kế hoạch tài khoản; cần kiểm tra cơ sở dữ liệu và migration 019."
            : lessons.error
              ? "Chưa tải được danh sách bài học để nhận kế hoạch."
              : undefined
        }
      />
    </TeacherShell>
  );
}
