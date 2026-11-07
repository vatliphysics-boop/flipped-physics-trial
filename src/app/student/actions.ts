"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateCheckpointAnswer, validateVideoProgressInput } from "@/lib/video-validation";
import { validatePathwayEvidence } from "@/lib/pathway-progress";

export type JoinClassState = {
  error?: string;
  message?: string;
};

export type VideoCheckpointResult = { error?: string; message?: string; isCorrect?: boolean; attemptCount?: number };

export async function saveVideoProgressAction(input: { materialId: string; watchedSeconds: number }) {
  const valid = validateVideoProgressInput(input);
  if (!valid) return { error: "Dữ liệu vị trí xem không hợp lệ." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập để lưu tiến độ học tập." };
  const { error } = await supabase.rpc("record_video_progress", {
    p_material_id: valid.materialId,
    p_watched_seconds: valid.watchedSeconds,
  });
  return error ? { error: "Không thể lưu tiến độ học tập. Vui lòng thử lại." } : { message: "Đã lưu tiến độ." };
}

export async function submitVideoCheckpointAction(input: { materialId: string; checkpointId: string; selectedOption: string }): Promise<VideoCheckpointResult> {
  const valid = validateCheckpointAnswer(input);
  if (!valid) return { error: "Câu trả lời không hợp lệ." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập để trả lời checkpoint." };
  const { data, error } = await supabase.rpc("submit_video_checkpoint", {
    p_material_id: valid.materialId,
    p_checkpoint_id: valid.checkpointId,
    p_selected_option: valid.selectedOption,
  });
  const result = Array.isArray(data) ? data[0] : data;
  if (error || !result || typeof result.is_correct !== "boolean") return { error: "Không thể chấm checkpoint. Vui lòng thử lại." };
  return { isCorrect: result.is_correct, attemptCount: Number(result.attempt_count) || 1, message: result.is_correct ? "Câu trả lời đúng." : "Chưa đúng, em có thể xem lại và thử tiếp." };
}



export type EvidenceState = { error?: string; message?: string };

export async function completePathwayStepAction(input: { stepId: string; evidence: unknown }): Promise<EvidenceState> {
  if (!input?.stepId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.stepId)) {
    return { error: "Mã bước học không hợp lệ." };
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Em cần đăng nhập để nộp kết quả." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "student") return { error: "Chỉ học sinh mới có thể nộp kết quả." };
  const { data: step } = await supabase.from("lesson_pathway_steps").select("lesson_id, phase, is_required, config")
    .eq("id", input.stepId).eq("is_published", true).maybeSingle();
  if (!step) return { error: "Bước học không còn khả dụng trong lớp của em." };
  // For required steps: validate that evidence has a non-empty response.
  // For optional steps: allow empty evidence (the DB RPC also allows {} for non-required steps).
  const evidence = validatePathwayEvidence(input.evidence);
  if (step.is_required && !evidence) {
    return { error: "Em cần ghi kết quả hợp lệ, tối đa 2.000 ký tự mỗi mục." };
  }
  if (step.is_required && step.config?.template_key && (!evidence?.prediction || !evidence.nextStep)) {
    return { error: "Em cần điền cả mục đầu tiên và việc tự học tiếp theo của bước này." };
  }
  // Pass validated evidence for required steps, or {} for optional steps without a response.
  const rpcEvidence = evidence ?? {};
  // RPC checks membership, publication and the order of phases/required steps.
  const { data, error } = await supabase.rpc("complete_pathway_step", { p_step_id: input.stepId, p_evidence: rpcEvidence });
  if (error || data?.success !== true) return { error: data?.error ?? "Chưa lưu được kết quả. Em hãy thử lại hoặc báo giáo viên." };
  revalidatePath(`/student/lessons/${step.lesson_id}/${step.phase.replaceAll("_", "-")}`);
  revalidatePath(`/student/lessons/${step.lesson_id}`, "layout");
  return { message: "Đã lưu kết quả bước học." };
}

export async function refreshSignedVideoUrlAction(materialId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập để xem video." };
  const { data: material } = await supabase
    .from("lesson_materials")
    .select("content_url, lessons!inner(class_id, status)")
    .eq("id", materialId)
    .eq("material_type", "video")
    .eq("is_published", true)
    .maybeSingle();
  const lesson = material?.lessons as unknown as { class_id: string; status: string } | null;
  const { getLessonVideoStoragePath } = await import("@/lib/video-source");
  const info = getLessonVideoStoragePath(material?.content_url ?? "");
  if (!lesson || lesson.status !== "published" || !info) return { error: "Video không còn khả dụng." };
  const { data: membership } = await supabase.from("class_members").select("student_id").eq("class_id", lesson.class_id).eq("student_id", user.id).maybeSingle();
  if (!membership) return { error: "Bạn không có quyền xem video này." };
  const { data, error } = await supabase.storage.from(info.bucket).createSignedUrl(info.path, 60 * 60 * 4);
  return error || !data?.signedUrl ? { error: "Không thể cấp lại đường dẫn video. Vui lòng thử lại." } : { url: data.signedUrl };
}

async function getPublishedStudentMaterial(materialId: string, userId: string) {
  const supabase = await createClient();
  const { data: material } = await supabase
    .from("lesson_materials")
    .select("id, lesson_id, lessons!inner(class_id, status)")
    .eq("id", materialId)
    .eq("is_published", true)
    .maybeSingle();
  const lesson = material?.lessons as unknown as { class_id: string; status: string } | null;
  if (!material || !lesson || lesson.status !== "published") return null;
  const { data: membership } = await supabase.from("class_members").select("student_id").eq("class_id", lesson.class_id).eq("student_id", userId).maybeSingle();
  return membership ? { supabase, lessonId: material.lesson_id } : null;
}

export async function saveActivityProgressAction(input: { materialId: string; response: Record<string, unknown>; isComplete: boolean }): Promise<EvidenceState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập để lưu hoạt động." };
  if (!input.materialId || typeof input.response !== "object" || Array.isArray(input.response)) return { error: "Dữ liệu hoạt động không hợp lệ." };
  const access = await getPublishedStudentMaterial(input.materialId, user.id);
  if (!access) return { error: "Hoạt động này không còn khả dụng trong lớp học của em." };
  const { error } = await supabase.from("lesson_material_progress").upsert({
    material_id: input.materialId,
    student_id: user.id,
    response: input.response,
    completion_percent: input.isComplete ? 100 : 0,
    is_complete: input.isComplete,
    updated_at: new Date().toISOString(),
  }, { onConflict: "material_id,student_id" });
  if (error) return { error: "Không thể lưu kết quả hoạt động. Vui lòng thử lại." };
  revalidatePath("/student"); revalidatePath("/student/journal");
  return { message: "Đã lưu kết quả hoạt động." };
}

export async function saveLessonReflectionAction(input: { lessonId: string; learned: string; difficult: string; nextStep: string; confidence: number; homeworkResponse?: string }): Promise<EvidenceState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập để lưu nhật kí." };
  const learned = input.learned.trim(); const difficult = input.difficult.trim(); const nextStep = input.nextStep.trim();
  if (!input.lessonId || !learned || learned.length > 2000 || difficult.length > 2000 || nextStep.length > 2000 || !Number.isInteger(input.confidence) || input.confidence < 1 || input.confidence > 5) return { error: "Vui lòng điền đầy đủ phản hồi hợp lệ (tối đa 2.000 ký tự mỗi mục)." };
  const { data: lesson } = await supabase.from("lessons").select("id, class_id, status").eq("id", input.lessonId).eq("status", "published").maybeSingle();
  if (!lesson) return { error: "Bài học chưa được xuất bản hoặc không tồn tại." };
  const { data: membership } = await supabase.from("class_members").select("student_id").eq("class_id", lesson.class_id).eq("student_id", user.id).maybeSingle();
  if (!membership) return { error: "Em không thuộc lớp học của bài học này." };
  const { error } = await supabase.from("lesson_reflections").upsert({ lesson_id: lesson.id, student_id: user.id, learned, difficult, next_step: nextStep, confidence: input.confidence, homework_response: input.homeworkResponse?.trim().slice(0, 4000) || "", updated_at: new Date().toISOString() });
  if (error) return { error: "Không thể lưu nhật kí học tập. Vui lòng thử lại." };
  revalidatePath("/student"); revalidatePath("/student/journal"); revalidatePath(`/student/lessons/${input.lessonId}`, "layout");
  return { message: "Đã lưu nhật kí học tập." };
}

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function joinClassAction(
  _previousState: JoinClassState,
  formData: FormData
): Promise<JoinClassState> {
  const joinCode = readText(formData, "join_code");

  if (!joinCode) {
    return { error: "Vui lòng nhập mã lớp." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn cần đăng nhập để tham gia lớp học." };
  }

  const { data, error } = await supabase.rpc("join_class_by_code", {
    p_join_code: joinCode,
  });

  if (error) {
    if (error.code === "PGRST202") {
      return { error: "Chưa tìm thấy chức năng tham gia lớp học trên Supabase. Vui lòng chạy migration tương ứng." };
    }

    if (error.code === "42501") {
      return { error: "Bạn không có quyền thực hiện thao tác tham gia lớp học." };
    }

    return { error: `Không thể tham gia lớp học: ${error.message}` };
  }

  const result = Array.isArray(data) ? data[0] : data;

  if (!result || typeof result.success !== "boolean") {
    return { error: "Phản hồi từ chức năng tham gia lớp học không hợp lệ." };
  }

  if (!result.success) {
    return { error: result.message || "Không thể tham gia lớp học. Vui lòng thử lại." };
  }

  revalidatePath("/student");
  return { message: result.message || "Tham gia lớp học thành công." };
}

export async function leaveClassAction(
  _previousState: JoinClassState,
  formData: FormData
): Promise<JoinClassState> {
  const classId = readText(formData, "class_id");

  if (!classId) {
    return { error: "Không xác định được lớp học cần rời." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn cần đăng nhập để rời lớp học." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "student") {
    return { error: "Bạn không có quyền rời lớp học." };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("class_members")
    .select("id")
    .eq("class_id", classId)
    .eq("student_id", user.id)
    .maybeSingle();

  if (membershipError) {
    return { error: "Không thể kiểm tra trạng thái tham gia lớp. Vui lòng thử lại." };
  }

  if (!membership) {
    return { error: "Bạn chưa tham gia lớp học này hoặc đã rời lớp trước đó." };
  }

  const { error: deleteError } = await supabase
    .from("class_members")
    .delete()
    .eq("class_id", classId)
    .eq("student_id", user.id);

  if (deleteError) {
    return { error: "Không thể rời lớp học. Vui lòng thử lại." };
  }

  revalidatePath("/student");
  return { message: "Đã rời lớp học thành công." };
}

export type PhaseSubmissionState = {
  error?: string;
  message?: string;
  success?: boolean;
};

export async function declareSimulationCompletedAction(input: { lessonId: string }): Promise<PhaseSubmissionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  const { data, error } = await supabase.rpc("declare_simulation_completed", {
    p_lesson_id: input.lessonId
  });

  if (error || !data) {
    console.error("[declareSimulationCompleted] RPC declare_simulation_completed failed — migration 017 may not be applied.", error?.message);
    return {
      success: false,
      error: "Bài học chưa sẵn sàng, em hãy báo giáo viên.",
    };
  }

  revalidatePath(`/student/lessons/${input.lessonId}`, "layout");
  return { success: true, message: "Đã lưu tiến độ mô phỏng." };
}

export async function submitPhaseFinalQuestionsAction(input: {
  lessonId: string;
  phase: "before_class" | "in_class";
  answers: Record<string, string>; // questionId -> answer
}): Promise<PhaseSubmissionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  const { data, error } = await supabase.rpc("submit_phase_final_questions", {
    p_lesson_id: input.lessonId,
    p_phase: input.phase,
    p_answers: input.answers
  });

  if (error) {
    console.error("[submitPhaseFinalQuestions] RPC submit_phase_final_questions failed — migration 017 may not be applied.", error?.message);
    return {
      success: false,
      error: "Bài học chưa sẵn sàng, em hãy báo giáo viên.",
    };
  }

  const result = data as { success?: boolean; error?: string; message?: string };
  if (!result || !result.success) {
    return { success: false, error: result?.error || "Không thành công." };
  }

  revalidatePath(`/student/lessons/${input.lessonId}`, "layout");
  return { success: true, message: result.message || "Hoàn thành pha học tập!" };
}

export async function submitPhaseAssessmentAction(input: {
  lessonId: string;
  answers: Record<string, unknown>;
}): Promise<PhaseSubmissionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  const { data, error } = await supabase.rpc("submit_phase_assessment", {
    p_lesson_id: input.lessonId,
    p_answers: input.answers
  });

  if (error) {
    console.error("[submitPhaseAssessment] RPC submit_phase_assessment failed — migration 017 may not be applied.", error?.message);
    return {
      success: false,
      error: "Bài học chưa sẵn sàng, em hãy báo giáo viên.",
    };
  }

  const result = data as { success?: boolean; error?: string; message?: string };
  if (!result || !result.success) {
    return { success: false, error: result?.error || "Không thành công." };
  }

  revalidatePath(`/student/lessons/${input.lessonId}`, "layout");
  revalidatePath(`/student`);
  return { success: true, message: result.message || "Chúc mừng em đã hoàn thành bài học!" };
}
