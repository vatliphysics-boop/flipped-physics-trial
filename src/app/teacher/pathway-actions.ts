"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MaterialType } from "@/lib/material-bank";

export type PathwayActionState = {
  error?: string;
  message?: string;
  stepId?: string;
};

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// Add a step from material bank to a lesson pathway
export async function addPathwayStepAction(
  _prev: PathwayActionState,
  formData: FormData
): Promise<PathwayActionState> {
  const lessonId = readText(formData, "lesson_id");
  const phase = readText(formData, "phase") as "before_class" | "in_class" | "after_class";
  const materialId = readText(formData, "material_id");
  const title = readText(formData, "title");
  const instructions = readText(formData, "instructions");
  const stepType = readText(formData, "step_type") as MaterialType;
  const isRequired = formData.get("is_required") !== "false";
  const contentUrl = readText(formData, "content_url");

  if (!lessonId || !title || !phase) {
    return { error: "Thiếu thông tin bước: lesson_id, phase và title là bắt buộc." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  // Verify teacher owns this lesson
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, class_id")
    .eq("id", lessonId)
    .eq("teacher_id", user.id)
    .maybeSingle();

  if (!lesson) {
    return { error: "Bài học không tồn tại hoặc bạn không có quyền biên soạn." };
  }

  // 1. Try to insert into lesson_pathway_steps (migration 018)
  try {
    const { data: maxStep } = await supabase
      .from("lesson_pathway_steps")
      .select("step_order")
      .eq("lesson_id", lessonId)
      .eq("phase", phase)
      .order("step_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = (maxStep?.step_order ?? 0) + 1;

    const { data: step, error: stepError } = await supabase
      .from("lesson_pathway_steps")
      .insert({
        lesson_id: lessonId,
        phase,
        material_id: materialId || null,
        title,
        instructions: instructions || "",
        step_order: nextOrder,
        is_required: isRequired,
        step_type: stepType || "document",
        config: { content_url: contentUrl },
      })
      .select("id")
      .single();

    if (!stepError && step) {
      revalidatePath(`/teacher/lessons/${lessonId}/${phase.replace("_", "-")}`);
      revalidatePath(`/student/lessons/${lessonId}/${phase.replace("_", "-")}`);
      return { message: "Đã thêm bước vào tiến trình bài học.", stepId: step.id };
    }
  } catch {
    // If lesson_pathway_steps table is not yet present on remote DB, fallback to lesson_materials
  }

  // Fallback: save into lesson_materials (schema 006/015 compatibility)
  try {
    let mappedType = "worksheet";
    if (stepType === "lecture_video" || stepType === "real_video") mappedType = "video";
    else if (stepType === "simulation") mappedType = "worksheet";
    else if (stepType === "colab") mappedType = "worksheet";

    const { data: fallbackMaterial, error: insertError } = await supabase
      .from("lesson_materials")
      .insert({
        lesson_id: lessonId,
        teacher_id: user.id,
        phase,
        material_type: mappedType,
        title,
        description: instructions,
        content_url: contentUrl || "activity:custom",
        is_published: true,
      })
      .select("id")
      .single();

    if (insertError) {
      return { error: `Không thể lưu bước: ${insertError.message}` };
    }

    revalidatePath(`/teacher/lessons/${lessonId}/${phase.replace("_", "-")}`);
    revalidatePath(`/student/lessons/${lessonId}/${phase.replace("_", "-")}`);
    return { message: "Đã thêm học liệu vào tiến trình bài học.", stepId: fallbackMaterial?.id };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Lỗi khi lưu học liệu." };
  }
}

// Delete a step from a lesson pathway
export async function deletePathwayStepAction(
  _prev: PathwayActionState,
  formData: FormData
): Promise<PathwayActionState> {
  const stepId = readText(formData, "step_id");
  const lessonId = readText(formData, "lesson_id");
  const phase = readText(formData, "phase");

  if (!stepId || !lessonId) return { error: "Thiếu thông tin bước cần xóa." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  // Check if step is in lesson_pathway_steps
  try {
    await supabase.from("lesson_pathway_steps").delete().eq("id", stepId).eq("lesson_id", lessonId);
  } catch {
    // ignore
  }

  // Also try deleting from lesson_materials if it was created there
  try {
    await supabase.from("lesson_materials").delete().eq("id", stepId).eq("lesson_id", lessonId);
  } catch {
    // ignore
  }

  if (phase) {
    revalidatePath(`/teacher/lessons/${lessonId}/${phase.replace("_", "-")}`);
    revalidatePath(`/student/lessons/${lessonId}/${phase.replace("_", "-")}`);
  }
  return { message: "Đã xóa bước khỏi tiến trình." };
}

// Reorder steps
export async function reorderPathwayStepsAction(
  _prev: PathwayActionState,
  formData: FormData
): Promise<PathwayActionState> {
  const lessonId = readText(formData, "lesson_id");
  const stepId = readText(formData, "step_id");
  const direction = readText(formData, "direction"); // 'up' or 'down'
  const phase = readText(formData, "phase");

  if (!stepId || !lessonId || !direction) return { error: "Thiếu tham số." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  try {
    const { data: steps } = await supabase
      .from("lesson_pathway_steps")
      .select("id, step_order")
      .eq("lesson_id", lessonId)
      .eq("phase", phase)
      .order("step_order", { ascending: true });

    if (steps && steps.length > 1) {
      const idx = steps.findIndex((s) => s.id === stepId);
      if (idx !== -1) {
        const targetIdx = direction === "up" ? idx - 1 : idx + 1;
        if (targetIdx >= 0 && targetIdx < steps.length) {
          const currentStep = steps[idx];
          const targetStep = steps[targetIdx];
          await supabase.from("lesson_pathway_steps").update({ step_order: targetStep.step_order }).eq("id", currentStep.id);
          await supabase.from("lesson_pathway_steps").update({ step_order: currentStep.step_order }).eq("id", targetStep.id);
        }
      }
    }
  } catch {
    // ignore
  }

  if (phase) {
    revalidatePath(`/teacher/lessons/${lessonId}/${phase.replace("_", "-")}`);
  }
  return { message: "Đã cập nhật thứ tự bước." };
}
