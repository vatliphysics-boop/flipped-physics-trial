"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CANONICAL_SYSTEM_MATERIALS } from "@/lib/material-bank";
import { normalizeActivityKey } from "@/lib/curriculum";
import { safeLearningUrl } from "@/lib/pathway-progress";
import {
  PLAN_UUID,
  validateTeachingPlan,
  studentPlanInstruction,
  type TeachingPlan,
} from "@/lib/teaching-plan";
async function context() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { supabase, user: null, error: "Bạn cần đăng nhập giáo viên." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return {
    supabase,
    user,
    error:
      profile?.role !== "teacher"
        ? "Chỉ giáo viên được lưu và sử dụng kế hoạch dạy học."
        : null,
  };
}
export async function saveTeachingPlanAction(
  value: unknown,
): Promise<{ error?: string; message?: string }> {
  const checked = validateTeachingPlan(value);
  if (!checked.plan || !PLAN_UUID.test(checked.plan.id))
    return { error: checked.error ?? "Mã kế hoạch không hợp lệ." };
  const { supabase, user, error } = await context();
  if (error || !user) return { error: error ?? "Cần đăng nhập." };
  const plan = { ...checked.plan, updatedAt: new Date().toISOString() };
  const { data, error: writeError } = await supabase
    .from("teacher_teaching_plans")
    .upsert(
      {
        id: plan.id,
        teacher_id: user.id,
        title: plan.title,
        lesson_code: plan.lessonCode,
        plan,
        updated_at: plan.updatedAt,
      },
      { onConflict: "id" },
    )
    .select("id")
    .single();
  if (writeError || !data) {
    console.error("save teacher plan", writeError?.code);
    return {
      error:
        "Chưa lưu được vào tài khoản. Kiểm tra migration 019 và quyền giáo viên; bản trên thiết bị hoặc JSON vẫn sử dụng được.",
    };
  }
  revalidatePath("/teacher/plans");
  return { message: "Đã lưu kế hoạch riêng vào tài khoản giáo viên." };
}
export async function applyTeachingPlanAction(
  planId: string,
  lessonId: string,
): Promise<{ error?: string; message?: string }> {
  if (!PLAN_UUID.test(planId) || !PLAN_UUID.test(lessonId))
    return { error: "Mã kế hoạch hoặc bài học không hợp lệ." };
  const { supabase, user, error } = await context();
  if (error || !user) return { error: error ?? "Cần đăng nhập." };
  const [{ data: row }, { data: lesson }] = await Promise.all([
    supabase
      .from("teacher_teaching_plans")
      .select("plan")
      .eq("id", planId)
      .eq("teacher_id", user.id)
      .maybeSingle(),
    supabase
      .from("lessons")
      .select("id")
      .eq("id", lessonId)
      .eq("teacher_id", user.id)
      .maybeSingle(),
  ]);
  if (!row || !lesson)
    return {
      error:
        "Hãy lưu kế hoạch vào tài khoản và chọn bài học thuộc quyền quản lí của bạn.",
    };
  const checked = validateTeachingPlan(row.plan);
  if (!checked.plan) return { error: "Kế hoạch đã lưu chưa đúng cấu trúc." };
  const plan: TeachingPlan = checked.plan;
  const references = plan.activities.flatMap((a) => a.resources);
  const bankIds = [
    ...new Set(references.filter((r) => PLAN_UUID.test(r.id)).map((r) => r.id)),
  ];
  const bank = bankIds.length
    ? await supabase
        .from("material_bank")
        .select(
          "id,title,content_url,material_type,teacher_id,is_system,is_published",
        )
        .in("id", bankIds)
    : { data: [], error: null };
  if (bank.error)
    return {
      error: "Chưa đọc được học liệu riêng; kiểm tra kho và migration 018.",
    };
  const steps = [];
  for (const activity of plan.activities) {
    for (const reference of activity.resources) {
      const canonical = CANONICAL_SYSTEM_MATERIALS.find(
        (m) => m.id === reference.id,
      );
      const owned = bank.data?.find(
        (m) =>
          m.id === reference.id && (m.teacher_id === user.id || m.is_system),
      );
      if (PLAN_UUID.test(reference.id) && !owned)
        return {
          error:
            "Kế hoạch có học liệu không thuộc kho của bạn hoặc không còn tồn tại.",
        };
      if (reference.id.startsWith("system-") && !canonical)
        return {
          error:
            "Một học liệu hệ thống không còn tồn tại. Hãy chọn lại trong kho.",
        };
      const source =
        canonical?.content_url ?? owned?.content_url ?? reference.url;
      const activityKey = source.startsWith("activity:")
        ? normalizeActivityKey(source.slice(9))
        : null;
      if (
        (!activityKey && !safeLearningUrl(source)) ||
        (source.startsWith("activity:") && !activityKey)
      )
        return {
          error:
            "Kế hoạch có nguồn học liệu không mở được hoặc mô phỏng không hợp lệ.",
        };
      steps.push({
        phase: activity.phase,
        title:
          `${activity.title} · ${canonical?.title ?? owned?.title ?? reference.title}`.slice(
            0,
            300,
          ),
        instructions: studentPlanInstruction(activity),
        step_type: activityKey
          ? "simulation"
          : (canonical?.material_type ??
            owned?.material_type ??
            reference.type),
        canonical_material_id: canonical?.id ?? null,
        material_id: owned?.id ?? null,
        content_url: source,
      });
    }
  }
  if (!steps.length)
    return {
      error:
        "Hãy gắn ít nhất một học liệu vào hoạt động trước khi đưa kế hoạch vào bài học.",
    };
  const { data, error: applyError } = await supabase.rpc(
    "apply_teacher_plan_draft",
    { p_plan_id: planId, p_lesson_id: lessonId, p_steps: steps },
  );
  if (applyError) {
    console.error("apply teacher plan", applyError.code);
    return {
      error: applyError.message.includes("already_applied")
        ? "Kế hoạch này đã được nhập vào bài học. Sửa bước trong bài học hoặc tạo bản sao kế hoạch cho lượt mới."
        : "Chưa tạo được các bước nháp. Kiểm tra migration 018–019 và quyền bài học; chưa có xác nhận áp dụng kế hoạch.",
    };
  }
  if (!data?.success)
    return { error: "Máy chủ chưa xác nhận áp dụng kế hoạch." };
  for (const phase of ["before-class", "in-class", "after-class"])
    revalidatePath(`/teacher/lessons/${lessonId}/${phase}`);
  return {
    message: `Đã tạo ${data.count} bước học bản nháp. Mở ba pha của bài học, rà soát rồi giao cho học sinh.`,
  };
}
