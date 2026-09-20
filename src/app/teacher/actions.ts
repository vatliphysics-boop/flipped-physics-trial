"use server";

import { revalidatePath } from "next/cache";
import { randomInt } from "node:crypto";
import { createClient } from "@/lib/supabase/server";

export type CreateClassState = {
  error?: string;
  message?: string;
};

export type ManageClassState = {
  error?: string;
  message?: string;
};

export type CreateLessonState = {
  error?: string;
  message?: string;
};

export type LessonMaterialState = {
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

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
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
  const contentUrl = readText(formData, "content_url");
  const instructions = readText(formData, "instructions");
  const durationText = readText(formData, "duration_minutes");
  const isPublished = formData.get("is_published") === "true";
  if (!lessonId || !title || !contentUrl) return { error: "Vui lòng nhập tiêu đề và link video." };
  if (!isHttpUrl(contentUrl)) return { error: "Link video phải là URL http hoặc https hợp lệ." };
  const duration = durationText ? Number(durationText) : null;
  if (durationText && (duration === null || !Number.isInteger(duration) || duration <= 0)) return { error: "Thời lượng phải là số nguyên dương." };
  const { supabase, user, error } = await getOwnedLesson(lessonId);
  if (error || !user) return { error: error ?? "Không thể xác thực giáo viên." };
  const { error: insertError } = await supabase.from("lesson_materials").insert({ lesson_id: lessonId, teacher_id: user.id, phase: "before_class", material_type: "video", title, description: description || null, content_url: contentUrl, duration_minutes: duration, instructions: instructions || null, is_published: isPublished });
  if (insertError) return { error: "Không thể tạo video. Vui lòng thử lại." };
  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath(`/student/lessons/${lessonId}`);
  return { message: isPublished ? "Đã thêm và xuất bản video." : "Đã lưu video bản nháp." };
}

export async function updateVideoMaterialAction(_previousState: LessonMaterialState, formData: FormData): Promise<LessonMaterialState> {
  const id = readText(formData, "id");
  const lessonId = readText(formData, "lesson_id");
  const title = readText(formData, "title");
  const description = readText(formData, "description");
  const contentUrl = readText(formData, "content_url");
  const instructions = readText(formData, "instructions");
  const durationText = readText(formData, "duration_minutes");
  const isPublished = formData.get("is_published") === "true";
  if (!id || !lessonId || !title || !contentUrl) return { error: "Vui lòng nhập đầy đủ tiêu đề và link video." };
  if (!isHttpUrl(contentUrl)) return { error: "Link video phải là URL http hoặc https hợp lệ." };
  const duration = durationText ? Number(durationText) : null;
  if (durationText && (duration === null || !Number.isInteger(duration) || duration <= 0)) return { error: "Thời lượng phải là số nguyên dương." };
  const { supabase, error } = await getOwnedLesson(lessonId);
  if (error) return { error };
  const { error: updateError } = await supabase.from("lesson_materials").update({ title, description: description || null, content_url: contentUrl, duration_minutes: duration, instructions: instructions || null, is_published: isPublished }).eq("id", id).eq("lesson_id", lessonId).eq("material_type", "video");
  if (updateError) return { error: "Không thể cập nhật video. Vui lòng thử lại." };
  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath(`/student/lessons/${lessonId}`);
  return { message: "Đã cập nhật video." };
}

export async function deleteVideoMaterialAction(_previousState: LessonMaterialState, formData: FormData): Promise<LessonMaterialState> {
  const id = readText(formData, "id");
  const lessonId = readText(formData, "lesson_id");
  const { supabase, error } = await getOwnedLesson(lessonId);
  if (error) return { error };
  const { error: deleteError } = await supabase.from("lesson_materials").delete().eq("id", id).eq("lesson_id", lessonId).eq("material_type", "video");
  if (deleteError) return { error: "Không thể xóa video. Vui lòng thử lại." };
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

export async function createClassAction(
  _previousState: CreateClassState,
  formData: FormData
): Promise<CreateClassState> {
  const name = readText(formData, "name");
  const description = readText(formData, "description");

  if (!name) {
    return { error: "Vui lòng nhập tên lớp học." };
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
    const { error } = await supabase.from("classes").insert({
      teacher_id: user.id,
      name,
      description,
      join_code: generateJoinCode(),
    });

    if (!error) {
      revalidatePath("/teacher");
      return { message: "Tạo lớp học thành công." };
    }

    if (error.code !== "23505") {
      return { error: "Không thể tạo lớp học. Vui lòng thử lại." };
    }
  }

  return { error: "Không thể tạo mã tham gia duy nhất. Vui lòng thử lại." };
}

export async function createLessonAction(
  _previousState: CreateLessonState,
  formData: FormData
): Promise<CreateLessonState> {
  const classId = readText(formData, "class_id");
  const title = readText(formData, "title");
  const description = readText(formData, "description");
  const learningObjectives = readText(formData, "learning_objectives");
  const status = readText(formData, "status");

  if (!classId) return { error: "Vui lòng chọn lớp học." };
  if (!title) return { error: "Vui lòng nhập tên bài học." };
  if (!learningObjectives) return { error: "Vui lòng nhập mục tiêu học tập." };
  if (status !== "draft" && status !== "published") {
    return { error: "Trạng thái bài học không hợp lệ." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Bạn cần đăng nhập để tạo bài học." };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "teacher") {
    return { error: "Bạn không có quyền tạo bài học." };
  }

  const { data: classItem, error: classError } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .maybeSingle();

  if (classError || !classItem) {
    return { error: "Bạn không có quyền tạo bài học cho lớp này." };
  }

  const { data: existingTopic, error: topicLookupError } = await supabase
    .from("topics")
    .select("id")
    .eq("teacher_id", user.id)
    .eq("title", "Vật lí hạt nhân")
    .maybeSingle();

  if (topicLookupError) {
    console.error("create lesson error:", topicLookupError);
    return { error: topicLookupError.message };
  }

  let topicId = existingTopic?.id;
  if (!topicId) {
    const { data: createdTopic, error: topicCreateError } = await supabase
      .from("topics")
      .insert({
        teacher_id: user.id,
        title: "Vật lí hạt nhân",
        description: "Chủ đề Vật lí hạt nhân cho các bài học của giáo viên.",
      })
      .select("id")
      .single();

    if (topicCreateError || !createdTopic) {
      const error = topicCreateError ?? new Error("Không thể tạo chủ đề bài học.");
      console.error("create lesson error:", error);
      return { error: error.message };
    }

    topicId = createdTopic.id;
  }

  const { error: insertError } = await supabase.from("lessons").insert({
    topic_id: topicId,
    class_id: classId,
    teacher_id: user.id,
    title,
    description,
    learning_objectives: learningObjectives,
    status,
  });

  if (insertError) {
    console.error("create lesson error:", insertError);
    return { error: insertError.message };
  }

  revalidatePath("/teacher");
  return { message: status === "published" ? "Đã xuất bản bài học." : "Đã tạo bài học bản nháp." };
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
    .select("id")
    .eq("id", lessonId)
    .eq("teacher_id", user.id)
    .maybeSingle();

  if (lessonLookupError || !lesson) {
    return { error: "Không tìm thấy bài học hoặc bạn không có quyền xóa bài học này." };
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
    let newCode = generateJoinCode();
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