"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CANONICAL_SYSTEM_MATERIALS } from "@/lib/material-bank";
import { isLearningPhase } from "@/lib/learning-phases";
import { safeLearningUrl } from "@/lib/pathway-progress";
import { normalizeActivityKey, type NuclearPhysicsLessonCode } from "@/lib/curriculum";
import { getTeacherLesson } from "@/lib/teacher-lesson";
import { getNuclearSequence } from "@/lib/nuclear-learning-sequence";
import { prepareNuclearLesson } from "@/lib/nuclear-lesson-seed";
import { access } from "node:fs/promises";
import { resolve, sep } from "node:path";

export type PathwayActionState = {
  error?: string;
  message?: string;
  stepId?: string;
};

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// Resolve the selected resource on the server instead of trusting client URLs/types.
export async function addPathwayStepAction(_prev: PathwayActionState, formData: FormData): Promise<PathwayActionState> {
  const lessonId = readText(formData, "lesson_id");
  const phase = readText(formData, "phase");
  const materialId = readText(formData, "material_id");
  const title = readText(formData, "title");
  const instructions = readText(formData, "instructions");
  const published = formData.get("is_published") !== "false";
  if (!lessonId || !title || title.length > 300 || instructions.length > 8000 || !isLearningPhase(phase)) {
    return { error: "Thông tin bài học, pha hoặc nội dung bước không hợp lệ." };
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "teacher") return { error: "Chỉ giáo viên mới có quyền biên soạn." };
  const { data: lesson } = await supabase.from("lessons").select("id").eq("id", lessonId).eq("teacher_id", user.id).maybeSingle();
  if (!lesson) return { error: "Bạn không có quyền biên soạn bài học này." };

  const canonical = CANONICAL_SYSTEM_MATERIALS.find(item => item.id === materialId);
  let material: { content_url: string; material_type: string } | undefined = canonical;
  let bankId: string | null = null;
  if (!canonical) {
    if (materialId.startsWith("legacy-")) {
      return { error: "Học liệu cũ đang được quản lí ở mục Học liệu bổ sung. Hãy dùng mục đó hoặc tạo học liệu mới trong kho." };
    }
    const { data } = await supabase.from("material_bank").select("id, content_url, material_type, is_published, teacher_id, is_system")
      .eq("id", materialId).maybeSingle();
    if (!data || (!data.is_system && data.teacher_id !== user.id) || !data.is_published) {
      return { error: "Hãy chọn học liệu đã xuất bản trong kho của bạn." };
    }
    material = data;
    bankId = data.id;
  }
  if (!material) return { error: "Không tìm thấy học liệu." };
  const source = material.content_url;
  const activity = source.startsWith("activity:") && normalizeActivityKey(source.slice(9));
  if (!activity && !safeLearningUrl(source)) return { error: "Học liệu chưa có đường dẫn hoặc mô phỏng có thể mở. Hãy hoàn thiện học liệu trước khi giao." };
  if (published && canonical && canonical.metadata?.workspace !== "nucleus" && source.startsWith("/")) {
    const publicRoot = resolve(process.cwd(), "public");
    const file = resolve(publicRoot, decodeURIComponent(source.slice(1)));
    if (!file.startsWith(publicRoot + sep)) return { error: "Đường dẫn học liệu không hợp lệ." };
    try { await access(file); } catch { return { error: "Tệp học liệu chưa có trong website. Hãy tải lên kho trước khi giao cho học sinh." }; }
  }
  const { data: maxStep, error: readError } = await supabase.from("lesson_pathway_steps").select("step_order")
    .eq("lesson_id", lessonId).eq("phase", phase).order("step_order", { ascending: false }).limit(1).maybeSingle();
  if (readError) return { error: "Không tải được tiến trình. Kiểm tra migration 018 trước khi giao bước học." };
  const { data: step, error } = await supabase.from("lesson_pathway_steps").insert({
    lesson_id: lessonId, phase, material_id: bankId, title, instructions,
    step_order: (maxStep?.step_order ?? 0) + 1, is_required: formData.get("is_required") !== "false",
    is_published: published, step_type: material.material_type,
    config: canonical ? { canonical_material_id: canonical.id, content_url: source } : {},
  }).select("id").single();
  if (error || !step) return { error: "Chưa lưu được bước học. Kiểm tra học liệu và cơ sở dữ liệu rồi thử lại." };
  if (published) {
    await supabase.from("lessons").update({ status: "published" }).eq("id", lessonId).eq("teacher_id", user.id);
  }
  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath(`/teacher/lessons/${lessonId}/${phase.replaceAll("_", "-")}`);
  revalidatePath(`/student/lessons/${lessonId}`);
  revalidatePath(`/student/lessons/${lessonId}/${phase.replaceAll("_", "-")}`);
  return { message: published ? "Đã giao bước học cho học sinh." : "Đã lưu bước học ở bản nháp.", stepId: step.id };
}

export async function updatePathwayStepAction(
  _prev: PathwayActionState,
  formData: FormData
): Promise<PathwayActionState> {
  const lessonId = readText(formData, "lesson_id");
  const stepId = readText(formData, "step_id");
  const title = readText(formData, "title");
  const rawInstructions = formData.get("instructions");
  const instructions = typeof rawInstructions === "string" ? rawInstructions.replace(/\r\n/g, "\n").trim() : "";
  const isRequiredRaw = formData.get("is_required");

  if (!lessonId || !stepId) {
    return { error: "Thiếu thông tin bước học cần cập nhật." };
  }
  if (!title || title.length > 300) {
    return { error: "Tiêu đề bước học không được để trống và tối đa 300 kí tự." };
  }
  if (instructions.length > 8000) {
    return { error: "Nội dung nhiệm vụ vượt quá giới hạn 8000 kí tự." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "teacher") {
    return { error: "Chỉ giáo viên mới có quyền chỉnh sửa bước học." };
  }

  // Verify lesson ownership
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id")
    .eq("id", lessonId)
    .eq("teacher_id", user.id)
    .maybeSingle();
  if (!lesson) {
    return { error: "Bạn không có quyền chỉnh sửa bước học của bài này." };
  }

  // Verify target step belongs to this lesson
  const { data: existingStep } = await supabase
    .from("lesson_pathway_steps")
    .select("id, phase, is_required")
    .eq("id", stepId)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (!existingStep) {
    return { error: "Không tìm thấy bước học cần cập nhật." };
  }

  const nextRequired =
    isRequiredRaw === "true"
      ? true
      : isRequiredRaw === "false"
      ? false
      : existingStep.is_required;

  const { data: updated, error: updateErr } = await supabase
    .from("lesson_pathway_steps")
    .update({
      title,
      instructions,
      is_required: nextRequired,
    })
    .eq("id", stepId)
    .eq("lesson_id", lessonId)
    .select("id")
    .maybeSingle();

  if (updateErr || !updated) {
    return { error: "Chưa lưu được thay đổi bước học. Vui lòng thử lại." };
  }

  const phaseSlug = String(existingStep.phase).replaceAll("_", "-");
  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath(`/teacher/lessons/${lessonId}/${phaseSlug}`);
  revalidatePath(`/student/lessons/${lessonId}`);
  revalidatePath(`/student/lessons/${lessonId}/${phaseSlug}`);

  return {
    message: "Đã lưu nội dung bước học thành công.",
    stepId: updated.id,
  };
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

  const { data: lesson } = await supabase.from("lessons").select("id").eq("id", lessonId).eq("teacher_id", user.id).maybeSingle();
  if (!lesson || !isLearningPhase(phase)) return { error: "Bạn không có quyền sửa bước học này." };
  const { data: deleted, error } = await supabase.from("lesson_pathway_steps").delete().eq("id", stepId).eq("lesson_id", lessonId).eq("phase", phase).select("id");
  if (error || !deleted?.length) return { error: "Chưa xóa được bước học. Hãy tải lại trang và thử lại." };
  revalidatePath(`/teacher/lessons/${lessonId}/${phase.replaceAll("_", "-")}`);
  revalidatePath(`/student/lessons/${lessonId}/${phase.replaceAll("_", "-")}`);
  return { message: "Đã xóa bước khỏi tiến trình." };
}

export async function setPathwayStepPublishedAction(_prev: PathwayActionState, formData: FormData): Promise<PathwayActionState> {
  const lessonId = readText(formData, "lesson_id");
  const stepId = readText(formData, "step_id");
  const published = formData.get("is_published") === "true";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập." };
  const { data: lesson } = await supabase.from("lessons").select("id").eq("id", lessonId).eq("teacher_id", user.id).maybeSingle();
  if (!lesson) return { error: "Bạn không có quyền biên soạn bài học này." };
  const { data: step } = await supabase.from("lesson_pathway_steps").select("phase, material_id, step_type, instructions, config, material_bank(content_url, is_published)").eq("id", stepId).eq("lesson_id", lessonId).maybeSingle();
  if (!step) return { error: "Bước học không còn tồn tại." };
  if (published) {
    const material = Array.isArray(step.material_bank) ? step.material_bank[0] : step.material_bank;
    const config = step.config as Record<string, unknown> | null;
    const canonical = CANONICAL_SYSTEM_MATERIALS.find(item => item.id === config?.canonical_material_id);
    const source = step.material_id ? material?.content_url : canonical?.content_url ?? config?.content_url;
    const writtenOnly = !step.material_id && !source && ["exercise", "reflection", "checkpoint"].includes(step.step_type) && step.instructions?.trim();
    const usableSource = typeof source === "string" && (safeLearningUrl(source) || (source.startsWith("activity:") && normalizeActivityKey(source.slice(9))));
    if (!writtenOnly && ((step.material_id && !material?.is_published) || !usableSource)) {
      return { error: "Hãy hoàn thiện và xuất bản học liệu trước khi giao bước này." };
    }
    if (canonical && canonical.metadata?.workspace !== "nucleus" && typeof source === "string" && source.startsWith("/")) {
      const publicRoot = resolve(process.cwd(), "public");
      const file = resolve(publicRoot, decodeURIComponent(source.slice(1)));
      if (!file.startsWith(publicRoot + sep)) return { error: "Đường dẫn học liệu không hợp lệ." };
      try { await access(file); } catch { return { error: "Tệp học liệu chưa có trong website. Hãy tải lên kho trước khi giao." }; }
    }
  }
  const { error } = await supabase.from("lesson_pathway_steps").update({ is_published: published }).eq("id", stepId).eq("lesson_id", lessonId);
  if (error) return { error: "Chưa thay đổi được trạng thái bước học." };
  if (published) {
    await supabase.from("lessons").update({ status: "published" }).eq("id", lessonId).eq("teacher_id", user.id);
  }
  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath(`/teacher/lessons/${lessonId}/${step.phase.replaceAll("_", "-")}`);
  revalidatePath(`/student/lessons/${lessonId}`);
  revalidatePath(`/student/lessons/${lessonId}/${step.phase.replaceAll("_", "-")}`);
  return { message: published ? "Đã giao bước học." : "Đã chuyển bước về bản nháp." };
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
          // Atomic swap via temporary sentinel value to avoid unique-constraint races.
          // Step 1: move current to a safe temporary value (negated, guaranteed distinct).
          const tempOrder = -(currentStep.step_order + 1);
          const { error: e1 } = await supabase.from("lesson_pathway_steps").update({ step_order: tempOrder }).eq("id", currentStep.id);
          if (e1) throw new Error(e1.message);
          // Step 2: move target into current's old slot.
          const { error: e2 } = await supabase.from("lesson_pathway_steps").update({ step_order: currentStep.step_order }).eq("id", targetStep.id);
          if (e2) throw new Error(e2.message);
          // Step 3: move current from temp to target's old slot.
          const { error: e3 } = await supabase.from("lesson_pathway_steps").update({ step_order: targetStep.step_order }).eq("id", currentStep.id);
          if (e3) throw new Error(e3.message);
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


export async function prepareNuclearLessonAction(_previous: PathwayActionState, formData: FormData): Promise<PathwayActionState> {
  const lessonId = readText(formData, "lesson_id");
  const { supabase, curriculum } = await getTeacherLesson(lessonId);
  if (!getNuclearSequence(curriculum.code)) return { error: "Chưa có mẫu cho bài học này." };

  try {
    const added = await prepareNuclearLesson(supabase, lessonId, curriculum.code as NuclearPhysicsLessonCode);
    for (const phase of ["before-class", "in-class", "after-class"]) {
      revalidatePath(`/teacher/lessons/${lessonId}/${phase}`);
    }
    revalidatePath(`/teacher/lessons/${lessonId}`);
    return { message: added ? `Đã bổ sung ${added} bước nháp. Mở từng pha để xem, chỉnh sửa và giao.` : "Đã kiểm tra và bổ sung các phần câu hỏi còn thiếu. Các bước hiện có được giữ nguyên." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Chưa chuẩn bị được mẫu. Hãy thử lại." };
  }
}
