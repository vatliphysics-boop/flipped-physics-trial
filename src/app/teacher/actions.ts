"use server";

import { revalidatePath } from "next/cache";
import { randomInt } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { classifyVideoSource, YOUTUBE_VIDEO_ERROR } from "@/lib/video-source";

export type CreateClassState = {
  error?: string;
  classId?: string;
};

export type ManageClassState = {
  error?: string;
  message?: string;
};

export type CreateLessonState = {
  error?: string;
  message?: string;
};

export type SetupLessonState = {
  error?: string;
  lessonId?: string;
};

export type LessonMaterialState = {
  error?: string;
  message?: string;
};

export type LessonClassAssignmentState = {
  error?: string;
  message?: string;
};

export type ClassMember = {
  student_id: string;
  full_name: string;
  joined_at: string;
};

const JOIN_CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function generateJoinCode() {
  return Array.from({ length: 6 }, () =>
    JOIN_CODE_CHARACTERS[randomInt(JOIN_CODE_CHARACTERS.length)]
  ).join("");
}

function videoUrlError(value: string) {
  const source = classifyVideoSource(value);
  return source.kind === "invalid" ? (source.reason === "youtube" ? YOUTUBE_VIDEO_ERROR : "Link video phải trỏ trực tiếp tới tệp MP4, WebM hoặc MOV có thể phát.") : null;
}

function storagePathForOwnedLesson(value: string, userId: string, lessonId: string) {
  const source = classifyVideoSource(value);
  return source.kind === "storage" && (source.bucket === "lesson-videos" || source.bucket === "lesson-materials") && (source.path.startsWith(`videos/${userId}/${lessonId}/`) || source.path.startsWith(`${userId}/${lessonId}/`)) ? source : null;
}

async function removeUploadedVideo(supabase: Awaited<ReturnType<typeof createClient>>, value: string, userId: string, lessonId: string) {
  const info = storagePathForOwnedLesson(value, userId, lessonId);
  if (info) await supabase.storage.from(info.bucket).remove([info.path]);
}

function readVideoContentUrl(formData: FormData, userId: string, lessonId: string) {
  const value = readText(formData, "content_url");
  const storageInfo = storagePathForOwnedLesson(value, userId, lessonId);
  if (value.startsWith("storage:")) return storageInfo ? { value } : { error: "Đường dẫn video Storage không hợp lệ." };
  const urlError = videoUrlError(value);
  return urlError ? { error: urlError } : { value };
}

type VideoCheckpointInput = {
  prompt: string;
  options: string[];
  correctIndex: number;
  atPercent: number;
};

function parseVideoCheckpoints(raw: string): VideoCheckpointInput[] | null {
  let value: unknown;
  try {
    value = raw ? JSON.parse(raw) : [];
  } catch {
    return null;
  }

  if (!Array.isArray(value) || value.length !== 2) return null;
  const checkpoints = value as Partial<VideoCheckpointInput>[];
  if (checkpoints.some((checkpoint) =>
    typeof checkpoint.prompt !== "string" ||
    !checkpoint.prompt.trim() ||
    !Array.isArray(checkpoint.options) ||
    checkpoint.options.length !== 4 ||
    checkpoint.options.some((option) => typeof option !== "string" || !option.trim()) ||
    typeof checkpoint.correctIndex !== "number" ||
    !Number.isInteger(checkpoint.correctIndex) ||
    checkpoint.correctIndex < 0 || checkpoint.correctIndex > 3 ||
    typeof checkpoint.atPercent !== "number" ||
    !Number.isInteger(checkpoint.atPercent) ||
    checkpoint.atPercent <= 0 || checkpoint.atPercent >= 100
  )) return null;

  return checkpoints as VideoCheckpointInput[];
}

function checkpointRows(materialId: string, checkpoints: VideoCheckpointInput[]) {
  return checkpoints.map((checkpoint, index) => ({
    material_id: materialId,
    checkpoint_percent: checkpoint.atPercent,
    question: checkpoint.prompt.trim(),
    option_a: checkpoint.options[0].trim(),
    option_b: checkpoint.options[1].trim(),
    option_c: checkpoint.options[2].trim(),
    option_d: checkpoint.options[3].trim(),
    correct_option: ["A", "B", "C", "D"][checkpoint.correctIndex],
    sort_order: index,
  }));
}

async function getTeacherForLessonAssignment(lessonId: string, classId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, error: "Bạn cần đăng nhập để gắn lớp cho bài học." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "teacher") return { supabase, user, error: "Bạn không có quyền gắn lớp cho bài học." };
  const { data: lesson } = await supabase.from("lessons").select("id, topic_id").eq("id", lessonId).eq("teacher_id", user.id).maybeSingle();
  if (!lesson) return { supabase, user, error: "Không tìm thấy bài học hoặc bạn không có quyền quản lý bài học này." };
  // Lessons attached to a topic (curriculum-linked) cannot be moved between classes.
  if (lesson.topic_id) return { supabase, user, error: "Bài học cố định luôn thuộc lớp đã được tạo và không thể chuyển lớp." };
  if (classId) {
    const { data: classItem } = await supabase.from("classes").select("id").eq("id", classId).eq("teacher_id", user.id).maybeSingle();
    if (!classItem) return { supabase, user, error: "Lớp học không tồn tại hoặc không thuộc quyền quản lý của bạn." };
  }
  return { supabase, user, error: undefined };
}

export async function assignLessonToClassAction(
  _previousState: LessonClassAssignmentState,
  formData: FormData
): Promise<LessonClassAssignmentState> {
  const lessonId = readText(formData, "lesson_id");
  const classId = readText(formData, "class_id");
  if (!lessonId || !classId) return { error: "Vui lòng chọn lớp học để gắn bài học." };
  const { supabase, error } = await getTeacherForLessonAssignment(lessonId, classId);
  if (error) return { error };
  const { error: updateError } = await supabase.from("lessons").update({ class_id: classId }).eq("id", lessonId);
  if (updateError) return { error: "Không thể gắn bài học vào lớp. Vui lòng thử lại." };
  revalidatePath("/teacher");
  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath(`/student/lessons/${lessonId}`);
  return { message: "Đã gắn bài học vào lớp thành công." };
}

export async function removeLessonFromClassAction(
  _previousState: LessonClassAssignmentState,
  formData: FormData
): Promise<LessonClassAssignmentState> {
  const lessonId = readText(formData, "lesson_id");
  if (!lessonId) return { error: "Không xác định được bài học cần bỏ gắn lớp." };
  const { supabase, error } = await getTeacherForLessonAssignment(lessonId);
  if (error) return { error };
  const { error: updateError } = await supabase.from("lessons").update({ class_id: null }).eq("id", lessonId);
  if (updateError) return { error: "Không thể bỏ gắn lớp cho bài học. Vui lòng thử lại." };
  revalidatePath("/teacher");
  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath(`/student/lessons/${lessonId}`);
  return { message: "Đã bỏ gắn lớp cho bài học." };
}

async function getOwnedLesson(lessonId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, lesson: null, error: "Bạn cần đăng nhập để quản lý video." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "teacher") return { supabase, user, lesson: null, error: "Bạn không có quyền quản lý video." };
  const { data: lesson } = await supabase.from("lessons").select("id").eq("id", lessonId).eq("teacher_id", user.id).maybeSingle();
  if (!lesson) return { supabase, user, lesson: null, error: "Không tìm thấy bài học hoặc bạn không có quyền quản lý bài học này." };
  return { supabase, user, lesson, error: undefined };
}

export async function createVideoMaterialAction(_previousState: LessonMaterialState, formData: FormData): Promise<LessonMaterialState> {
  const lessonId = readText(formData, "lesson_id");
  const title = readText(formData, "title");
  const description = readText(formData, "description");
  const instructions = readText(formData, "instructions");
  const checkpointQuestions = readText(formData, "checkpoint_questions");
  const durationText = readText(formData, "duration_minutes");
  const isPublished = formData.get("is_published") === "true";
  if (!lessonId || !title) return { error: "Vui lòng nhập tiêu đề video." };
  const duration = durationText ? Number(durationText) : null;
  if (durationText && (duration === null || !Number.isInteger(duration) || duration <= 0)) return { error: "Thời lượng phải là số nguyên dương." };
  const checkpoints = parseVideoCheckpoints(checkpointQuestions);
  if (!checkpoints) return { error: "Dữ liệu câu hỏi kiểm tra không hợp lệ: cần đúng 2 câu hỏi và 4 đáp án cho mỗi câu." };
  const { supabase, user, error } = await getOwnedLesson(lessonId);
  if (error || !user) return { error: error ?? "Không thể xác thực giáo viên." };
  const source = readVideoContentUrl(formData, user.id, lessonId);
  if (source.error || !source.value) return { error: source.error ?? "Không xác định được nguồn video." };
  const contentUrl = source.value;
  const { data: material, error: insertError } = await supabase.from("lesson_materials").insert({ lesson_id: lessonId, teacher_id: user.id, phase: "before_class", material_type: "video", title, description: description || null, content_url: contentUrl, duration_minutes: duration, instructions: instructions || null, is_published: isPublished }).select("id").single();
  if (insertError || !material) {
    const error = insertError ?? new Error("Không thể tạo bản ghi video.");
    console.error("create video error:", error);
    await removeUploadedVideo(supabase, contentUrl, user.id, lessonId);
    return { error: error.message };
  }
  const { error: checkpointError } = await supabase.from("video_checkpoints").insert(checkpointRows(material.id, checkpoints));
  if (checkpointError) {
    console.error("create video error:", checkpointError);
    await supabase.from("lesson_materials").delete().eq("id", material.id).eq("lesson_id", lessonId);
    await removeUploadedVideo(supabase, contentUrl, user.id, lessonId);
    return { error: checkpointError.message };
  }
  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath(`/student/lessons/${lessonId}`);
  return { message: isPublished ? "Đã thêm và xuất bản video." : "Đã lưu video bản nháp." };
}

export async function updateVideoMaterialAction(_previousState: LessonMaterialState, formData: FormData): Promise<LessonMaterialState> {
  const id = readText(formData, "id");
  const lessonId = readText(formData, "lesson_id");
  const title = readText(formData, "title");
  const description = readText(formData, "description");
  const instructions = readText(formData, "instructions");
  const checkpointQuestions = readText(formData, "checkpoint_questions");
  const durationText = readText(formData, "duration_minutes");
  const isPublished = formData.get("is_published") === "true";
  if (!id || !lessonId || !title) return { error: "Vui lòng nhập đầy đủ tiêu đề video." };
  const duration = durationText ? Number(durationText) : null;
  if (durationText && (duration === null || !Number.isInteger(duration) || duration <= 0)) return { error: "Thời lượng phải là số nguyên dương." };
  const checkpoints = parseVideoCheckpoints(checkpointQuestions);
  if (!checkpoints) return { error: "Dữ liệu câu hỏi kiểm tra không hợp lệ: cần đúng 2 câu hỏi và 4 đáp án cho mỗi câu." };
  const { supabase, error } = await getOwnedLesson(lessonId);
  if (error) return { error };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập để cập nhật video." };
  const existingMaterial = await supabase.from("lesson_materials").select("content_url").eq("id", id).eq("lesson_id", lessonId).eq("teacher_id", user.id).maybeSingle();
  if (!existingMaterial.data) return { error: "Không tìm thấy video cần cập nhật." };
  const source = readVideoContentUrl(formData, user.id, lessonId);
  if (source.error || !source.value) return { error: source.error ?? "Không xác định được nguồn video." };
  const contentUrl = source.value;
  const { error: updateError } = await supabase.from("lesson_materials").update({ title, description: description || null, content_url: contentUrl, duration_minutes: duration, instructions: instructions || null, is_published: isPublished }).eq("id", id).eq("lesson_id", lessonId).eq("material_type", "video");
  if (updateError) {
    console.error("create video error:", updateError);
    if (contentUrl !== existingMaterial.data.content_url) await removeUploadedVideo(supabase, contentUrl, user.id, lessonId);
    return { error: updateError.message };
  }
  // Safe checkpoint update strategy: upsert existing checkpoints, insert new ones.
  // Do NOT delete and re-insert all checkpoints as that would cascade-delete
  // video_checkpoint_attempts (student answer history).
  //
  // Fetch existing checkpoints ordered by sort_order so we can match by position.
  const { data: existingCheckpoints } = await supabase
    .from("video_checkpoints")
    .select("id, sort_order")
    .eq("material_id", id)
    .order("sort_order");

  const rows = checkpointRows(id, checkpoints);
  const existingIds = (existingCheckpoints ?? []).map((c) => c.id);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (i < existingIds.length) {
      // Update existing checkpoint in-place — preserves FK references in video_checkpoint_attempts
      const { error: updateCpError } = await supabase
        .from("video_checkpoints")
        .update({
          checkpoint_percent: row.checkpoint_percent,
          question: row.question,
          option_a: row.option_a,
          option_b: row.option_b,
          option_c: row.option_c,
          option_d: row.option_d,
          correct_option: row.correct_option,
          sort_order: row.sort_order,
        })
        .eq("id", existingIds[i]);
      if (updateCpError) {
        console.error("update checkpoint error:", updateCpError);
        if (contentUrl !== existingMaterial.data.content_url) await removeUploadedVideo(supabase, contentUrl, user.id, lessonId);
        return { error: updateCpError.message };
      }
    } else {
      // Insert brand-new checkpoint (more checkpoints than before)
      const { error: insertCpError } = await supabase.from("video_checkpoints").insert(row);
      if (insertCpError) {
        console.error("insert checkpoint error:", insertCpError);
        if (contentUrl !== existingMaterial.data.content_url) await removeUploadedVideo(supabase, contentUrl, user.id, lessonId);
        return { error: insertCpError.message };
      }
    }
  }

  // If the new list is shorter, remove surplus checkpoints (intentional deletion).
  // This deliberately removes student attempts for those specific checkpoints only.
  if (existingIds.length > rows.length) {
    const surplusIds = existingIds.slice(rows.length);
    const { error: deleteSurplusError } = await supabase
      .from("video_checkpoints")
      .delete()
      .in("id", surplusIds);
    if (deleteSurplusError) {
      console.error("delete surplus checkpoints error:", deleteSurplusError);
      return { error: deleteSurplusError.message };
    }
  }

  if (contentUrl !== existingMaterial.data.content_url) await removeUploadedVideo(supabase, existingMaterial.data.content_url ?? "", user.id, lessonId);
  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath(`/student/lessons/${lessonId}`);
  return { message: "Đã cập nhật video." };
}

export async function deleteVideoMaterialAction(_previousState: LessonMaterialState, formData: FormData): Promise<LessonMaterialState> {
  const id = readText(formData, "id");
  const lessonId = readText(formData, "lesson_id");
  const { supabase, error } = await getOwnedLesson(lessonId);
  if (error) return { error };
  const existingMaterial = await supabase.from("lesson_materials").select("content_url").eq("id", id).eq("lesson_id", lessonId).eq("teacher_id", (await supabase.auth.getUser()).data.user?.id ?? "").maybeSingle();
  const { error: deleteError } = await supabase.from("lesson_materials").delete().eq("id", id).eq("lesson_id", lessonId).eq("material_type", "video");
  if (deleteError) return { error: "Không thể xóa video. Vui lòng thử lại." };
  if (existingMaterial.data?.content_url) await removeUploadedVideo(supabase, existingMaterial.data.content_url, (await supabase.auth.getUser()).data.user?.id ?? "", lessonId);
  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath(`/student/lessons/${lessonId}`);
  return { message: "Đã xóa video." };
}

export async function toggleVideoMaterialAction(formData: FormData): Promise<LessonMaterialState> {
  const id = readText(formData, "id");
  const lessonId = readText(formData, "lesson_id");
  const nextPublished = readText(formData, "is_published") === "true";
  const { supabase, error } = await getOwnedLesson(lessonId);
  if (error) return { error };
  const { error: updateError } = await supabase.from("lesson_materials").update({ is_published: nextPublished }).eq("id", id).eq("lesson_id", lessonId).eq("material_type", "video");
  if (updateError) return { error: "Không thể thay đổi trạng thái video." };
  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath(`/student/lessons/${lessonId}`);
  return { message: nextPublished ? "Đã xuất bản video." : "Đã chuyển video về bản nháp." };
}

export async function updateHomeworkAction(_previousState: LessonMaterialState, formData: FormData): Promise<LessonMaterialState> {
  const lessonId = readText(formData, "lesson_id");
  const title = readText(formData, "homework_title");
  const description = readText(formData, "homework_description");
  const instructions = readText(formData, "homework_instructions");
  const dueDate = readText(formData, "homework_due_date") || null;
  const status = readText(formData, "homework_status");
  if (!lessonId) return { error: "Không xác định được bài học." };
  if (status !== "draft" && status !== "published") return { error: "Trạng thái bài tập không hợp lệ." };
  if (status === "published" && !title) return { error: "Vui lòng nhập tiêu đề trước khi xuất bản bài tập." };
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return { error: "Hạn nộp không hợp lệ." };
  if (dueDate) {
    const parsedDueDate = new Date(`${dueDate}T00:00:00Z`);
    if (Number.isNaN(parsedDueDate.getTime()) || parsedDueDate.toISOString().slice(0, 10) !== dueDate) {
      return { error: "Hạn nộp không hợp lệ." };
    }
  }
  const { supabase, error } = await getOwnedLesson(lessonId);
  if (error) return { error };
  // homework_* fields are absent from the actual DB schema.
  // Return an error to prevent the action from firing.
  if (true) return { error: "Quản lý bài tập chưa được hỗ trợ trong phiên bản hiện tại." };
  const { error: updateError } = await supabase.from("lessons").update({ homework_title: title, homework_description: description, homework_instructions: instructions, homework_due_date: dueDate, homework_status: status }).eq("id", lessonId);
  if (updateError) return { error: "Không thể lưu bài tập. Vui lòng thử lại." };
  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath(`/student/lessons/${lessonId}`);
  return { message: status === "published" ? "Đã xuất bản bài tập." : "Đã lưu bài tập bản nháp." };
}

export async function createClassAction(
  _previousState: CreateClassState,
  formData: FormData
): Promise<CreateClassState> {
  const name = readText(formData, "name");
  const description = readText(formData, "description");

  if (!name) {
    return { error: "Vui lòng nhập tên lớp học." };
  }
  if (name.length > 120 || description.length > 1000) {
    return { error: "Thông tin lớp học vượt quá độ dài cho phép." };
  }


  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn cần đăng nhập để tạo lớp học." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "teacher") {
    return { error: "Bạn không có quyền tạo lớp học." };
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data: createdClass, error } = await supabase.from("classes").insert({
      teacher_id: user.id,
      name,
      description,
      join_code: generateJoinCode(),
    }).select("id").single();

    if (!error && createdClass) {
      revalidatePath("/teacher");
      revalidatePath("/teacher/classes");
      return { classId: createdClass.id };
    }

    if (error?.code !== "23505") {
      return { error: "Không thể tạo lớp học. Vui lòng thử lại." };
    }
  }

  return { error: "Không thể tạo mã tham gia duy nhất. Vui lòng thử lại." };
}

/**
 * Create exactly one lessons row for a fixed curriculum lesson.
 * Idempotent: if a matching row already exists, returns its id.
 *
 * FormData fields:
 *   class_id     — UUID of the selected class
 *   topic_title  — canonical topic title (e.g. "Vật lí hạt nhân")
 *   lesson_title — fixed catalog lesson title  (e.g. "Cấu trúc hạt nhân")
 */
export async function setupLessonAction(
  _previousState: SetupLessonState,
  formData: FormData,
): Promise<SetupLessonState> {
  const classId     = readText(formData, "class_id");
  const topicTitle  = readText(formData, "topic_title");
  const lessonTitle = readText(formData, "lesson_title");

  if (!classId || !topicTitle || !lessonTitle) {
    return { error: "Thiếu thông tin: class_id, topic_title, lesson_title là bắt buộc." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập." };

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "teacher") return { error: "Bạn không có quyền thực hiện thao tác này." };

  // Verify the teacher owns this class.
  const { data: classItem } = await supabase
    .from("classes").select("id").eq("id", classId).eq("teacher_id", user.id).maybeSingle();
  if (!classItem) return { error: "Lớp học không tồn tại hoặc không thuộc quyền quản lý của bạn." };

  // Resolve the canonical topic by teacher_id + title.
  const { data: initialTopic, error: topicErr } = await supabase
    .from("topics")
    .select("id")
    .eq("teacher_id", user.id)
    .eq("title", topicTitle)
    .maybeSingle();

  if (topicErr) {
    console.error("setupLessonAction topic lookup error:", topicErr);
    return { error: `Lỗi tra cứu chủ đề: ${topicErr.message}` };
  }
  
  let topic = initialTopic;
  
  if (!topic) {
    const { data: newTopic, error: insertTopicErr } = await supabase
      .from("topics")
      .insert({
        teacher_id: user.id,
        title: topicTitle,
        description: `Chủ đề theo chương trình cố định: ${topicTitle}`
      })
      .select("id")
      .single();

    if (insertTopicErr) {
      if (insertTopicErr.code === "23505") {
        const { data: existingTopic } = await supabase
          .from("topics")
          .select("id")
          .eq("teacher_id", user.id)
          .eq("title", topicTitle)
          .single();
        if (existingTopic) {
          topic = existingTopic;
        } else {
          return { error: `Không thể tạo chủ đề: ${insertTopicErr.message}` };
        }
      } else {
        return { error: `Không thể tạo chủ đề tự động: ${insertTopicErr.message}` };
      }
    } else {
      topic = newTopic;
    }
  }

  if (!topic) {
    return { error: `Lỗi không xác định khi tải chủ đề.` };
  }

  // Idempotency check — return existing lesson if already created.
  const { data: existing } = await supabase
    .from("lessons")
    .select("id")
    .eq("teacher_id", user.id)
    .eq("class_id",   classId)
    .eq("topic_id",   topic.id)
    .eq("title",      lessonTitle)
    .maybeSingle();

  if (existing) {
    revalidatePath("/teacher/curriculum");
    return { lessonId: existing.id };
  }

  // Create the lesson row.
  const { data: created, error: insertErr } = await supabase
    .from("lessons")
    .insert({
      teacher_id: user.id,
      class_id:   classId,
      topic_id:   topic.id,
      title:      lessonTitle,
      status:     "draft",
    })
    .select("id")
    .single();

  if (insertErr || !created) {
    console.error("setupLessonAction insert error:", insertErr);
    return { error: `Không thể tạo bài học: ${insertErr?.message ?? "Lỗi không xác định."}` };
  }

  // Seed catalog content automatically on first creation.
  // lessonTitle here is the short title from curriculum.ts ("Cấu trúc hạt nhân"),
  // NOT the DB-stored title forced by migration 011's trigger ("Bài 21. Cấu trúc hạt nhân").
  // The seed functions have idempotency guards so double-calling is safe.
  if (lessonTitle === "Cấu trúc hạt nhân") {
    const { seedB21Catalog } = await import("@/lib/catalog-b21");
    await seedB21Catalog(supabase, created.id, user.id);
  } else if (lessonTitle === "Phản ứng hạt nhân và năng lượng liên kết") {
    const { seedB22Catalog } = await import("@/lib/catalog-b22");
    await seedB22Catalog(supabase, created.id, user.id);
  } else if (lessonTitle === "Hiện tượng phóng xạ") {
    const { seedB23Catalog } = await import("@/lib/catalog-b23");
    await seedB23Catalog(supabase, created.id, user.id);
  } else if (lessonTitle === "Công nghiệp hạt nhân") {
    const { seedB24Catalog } = await import("@/lib/catalog-b24");
    await seedB24Catalog(supabase, created.id, user.id);
  } else if (lessonTitle === "Bài tập về vật lí hạt nhân") {
    const { seedB25Catalog } = await import("@/lib/catalog-b25");
    await seedB25Catalog(supabase, created.id, user.id);
  }

  revalidatePath("/teacher/curriculum");
  return { lessonId: created.id };
}

export async function createLessonAction(
  _previousState: CreateLessonState,
  _formData: FormData
): Promise<CreateLessonState> {
  void _previousState;
  void _formData;
  return { error: "Bài học được tạo tự động theo chương trình Vật lí hạt nhân cố định." };
}

export async function deleteLessonAction(
  _previousState: ManageClassState,
  formData: FormData
): Promise<ManageClassState> {
  const lessonId = readText(formData, "lesson_id");
  if (!lessonId) return { error: "Không xác định được bài học cần xóa." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Bạn cần đăng nhập để xóa bài học." };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "teacher") {
    return { error: "Bạn không có quyền xóa bài học." };
  }

  const { data: lesson, error: lessonLookupError } = await supabase
    .from("lessons")
    .select("id, topic_id")
    .eq("id", lessonId)
    .eq("teacher_id", user.id)
    .maybeSingle();

  if (lessonLookupError || !lesson) {
    return { error: "Không tìm thấy bài học hoặc bạn không có quyền xóa bài học này." };
  }
  // Lessons attached to a topic (curriculum-linked) cannot be deleted.
  if (lesson.topic_id) {
    return { error: "Bài học cố định không thể bị xóa." };
  }

  // lesson_materials.lesson_id uses ON DELETE CASCADE, so deleting this owned
  // lesson also removes its materials without touching classes or memberships.
  const { error: deleteError } = await supabase
    .from("lessons")
    .delete()
    .eq("id", lesson.id)
    .eq("teacher_id", user.id);

  if (deleteError) return { error: "Không thể xóa bài học. Vui lòng thử lại." };

  revalidatePath("/teacher");
  return { message: "Đã xóa bài học thành công." };
}

async function getOwnedTeacherClass(classId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, classItem: null, error: "Bạn cần đăng nhập để quản lý lớp học." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "teacher") {
    return { supabase, user, classItem: null, error: "Bạn không có quyền quản lý lớp học." };
  }

  const { data: classItem, error: classError } = await supabase
    .from("classes")
    .select("id, join_code")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .maybeSingle();

  if (classError || !classItem) {
    return { supabase, user, classItem: null, error: "Không tìm thấy lớp học hoặc bạn không có quyền quản lý lớp này." };
  }

  return { supabase, user, classItem, error: undefined };
}

export async function updateClassAction(
  _previousState: ManageClassState,
  formData: FormData
): Promise<ManageClassState> {
  const classId = readText(formData, "class_id");
  const name = readText(formData, "name");
  const description = readText(formData, "description");

  if (!classId) return { error: "Không xác định được lớp học cần cập nhật." };
  if (!name) return { error: "Vui lòng nhập tên lớp học." };

  const { supabase, error } = await getOwnedTeacherClass(classId);
  if (error) return { error };

  const { error: updateError } = await supabase
    .from("classes")
    .update({ name, description })
    .eq("id", classId);

  if (updateError) return { error: "Không thể cập nhật lớp học. Vui lòng thử lại." };

  revalidatePath("/teacher");
  return { message: "Cập nhật lớp học thành công." };
}

export async function regenerateJoinCodeAction(
  _previousState: ManageClassState,
  formData: FormData
): Promise<ManageClassState> {
  const classId = readText(formData, "class_id");
  if (!classId) return { error: "Không xác định được lớp học cần tạo mã mới." };

  const { supabase, classItem, error } = await getOwnedTeacherClass(classId);
  if (error || !classItem) return { error: error ?? "Không tìm thấy lớp học." };

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const newCode = generateJoinCode();
    if (newCode === classItem.join_code) continue;

    const { error: updateError } = await supabase
      .from("classes")
      .update({ join_code: newCode })
      .eq("id", classId)
      .eq("teacher_id", (await supabase.auth.getUser()).data.user?.id ?? "");

    if (!updateError) {
      revalidatePath("/teacher");
      return { message: "Đã tạo mã lớp mới. Mã cũ không còn hiệu lực." };
    }

    if (updateError.code !== "23505") {
      return { error: "Không thể tạo mã lớp mới. Vui lòng thử lại." };
    }
  }

  return { error: "Không thể tạo mã lớp mới duy nhất. Vui lòng thử lại." };
}

export async function deleteClassAction(
  _previousState: ManageClassState,
  formData: FormData
): Promise<ManageClassState> {
  const classId = readText(formData, "class_id");
  if (!classId) return { error: "Không xác định được lớp học cần xóa." };

  const { supabase, error } = await getOwnedTeacherClass(classId);
  if (error) return { error };

  const { error: membersError } = await supabase
    .from("class_members")
    .delete()
    .eq("class_id", classId);

  if (membersError) return { error: "Không thể xóa thành viên của lớp. Vui lòng thử lại." };

  const { error: deleteError } = await supabase
    .from("classes")
    .delete()
    .eq("id", classId);

  if (deleteError) return { error: "Không thể xóa lớp học. Vui lòng thử lại." };

  revalidatePath("/teacher");
  return { message: "Đã xóa lớp học thành công." };
}

export async function listClassMembersAction(classId: string): Promise<{
  members?: ClassMember[];
  error?: string;
}> {
  if (!classId) return { error: "Không xác định được lớp học." };

  const { data, error } = await (await createClient()).rpc("list_class_members_for_teacher", {
    p_class_id: classId,
  });

  if (error) return { error: "Không thể tải danh sách học sinh. Vui lòng thử lại." };

  return { members: Array.isArray(data) ? (data as ClassMember[]) : [] };
}

export async function removeStudentFromClassAction(
  _previousState: ManageClassState,
  formData: FormData
): Promise<ManageClassState> {
  const classId = readText(formData, "class_id");
  const studentId = readText(formData, "student_id");

  if (!classId || !studentId) return { error: "Không xác định được học sinh cần mời khỏi lớp." };

  const { supabase, error } = await getOwnedTeacherClass(classId);
  if (error) return { error };

  const { error: deleteError } = await supabase
    .from("class_members")
    .delete()
    .eq("class_id", classId)
    .eq("student_id", studentId);

  if (deleteError) return { error: "Không thể mời học sinh khỏi lớp. Vui lòng thử lại." };

  revalidatePath("/teacher");
  return { message: "Đã mời học sinh khỏi lớp." };
}