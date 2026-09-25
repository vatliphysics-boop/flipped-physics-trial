"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateCheckpointAnswer, validateVideoProgressInput } from "@/lib/video-validation";

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
  revalidatePath("/student"); revalidatePath("/student/journal"); revalidatePath(`/student/lessons/${input.lessonId}`);
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

export async function submitPhaseFinalQuestionsAction(input: {
  lessonId: string;
  phase: "before_class" | "in_class";
  answers: Record<string, string>; // questionId -> answer
}): Promise<PhaseSubmissionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  // Fetch the actual questions to validate
  const { data: questions } = await supabase
    .from("phase_final_questions")
    .select("id, correct_answer")
    .eq("lesson_id", input.lessonId)
    .eq("phase", input.phase);

  if (!questions || questions.length !== 2) {
    return { error: "Không tìm thấy đủ câu hỏi cho pha này." };
  }

  // Validate answers
  let allCorrect = true;
  for (const q of questions) {
    if (input.answers[q.id]?.trim().toLowerCase() !== q.correct_answer.trim().toLowerCase()) {
      allCorrect = false;
      break;
    }
  }

  if (!allCorrect) {
    return { success: false, error: "Có câu trả lời chưa đúng. Em hãy xem lại bài nhé." };
  }

  // Mark phase complete
  const { error } = await supabase.from("student_phase_progress").upsert({
    lesson_id: input.lessonId,
    student_id: user.id,
    phase: input.phase,
    is_completed: true,
    completed_at: new Date().toISOString(),
  }, { onConflict: "lesson_id,student_id,phase" });

  if (error) return { error: "Không thể lưu tiến độ. Vui lòng thử lại." };

  revalidatePath(`/student/lessons/${input.lessonId}`);
  return { success: true, message: "Hoàn thành pha học tập!" };
}

export async function submitPhaseAssessmentAction(input: {
  lessonId: string;
  answers: Record<string, unknown>;
}): Promise<PhaseSubmissionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  // For Phase 3, we don't automatically grade all of them (some might be short answer)
  // For now, we just mark the phase and lesson as complete upon submission.
  
  // 1. Mark phase complete
  await supabase.from("student_phase_progress").upsert({
    lesson_id: input.lessonId,
    student_id: user.id,
    phase: "after_class",
    is_completed: true,
    completed_at: new Date().toISOString(),
  }, { onConflict: "lesson_id,student_id,phase" });

  // 2. Mark lesson complete
  await supabase.from("student_lesson_progress").upsert({
    lesson_id: input.lessonId,
    student_id: user.id,
    is_completed: true,
    completed_at: new Date().toISOString(),
  }, { onConflict: "lesson_id,student_id" });

  revalidatePath(`/student/lessons/${input.lessonId}`);
  revalidatePath(`/student`);
  return { success: true, message: "Chúc mừng em đã hoàn thành bài học!" };
}