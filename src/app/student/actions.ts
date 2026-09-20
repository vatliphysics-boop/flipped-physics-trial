"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type JoinClassState = {
  error?: string;
  message?: string;
};

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