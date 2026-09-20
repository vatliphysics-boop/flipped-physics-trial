"use server";

import { revalidatePath } from "next/cache";
import { randomInt } from "node:crypto";
import { createClient } from "@/lib/supabase/server";

export type CreateClassState = {
  error?: string;
  message?: string;
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