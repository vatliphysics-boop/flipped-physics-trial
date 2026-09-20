"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  message?: string;
};

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAction(
  _previousState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = readText(formData, "email");
  const password = readText(formData, "password");

  if (!email || !password) {
    return { error: "Vui lòng nhập email và mật khẩu." };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !user) {
    return { error: "Email hoặc mật khẩu không đúng." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return { error: "Không tìm thấy hồ sơ người dùng." };
  }

  revalidatePath("/", "layout");

  if (profile.role === "teacher") {
    redirect("/teacher");
  }

  redirect("/student");
}

export async function registerAction(
  _previousState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const fullName = readText(formData, "full_name");
  const email = readText(formData, "email");
  const password = readText(formData, "password");
  const confirmPassword = readText(formData, "confirm_password");
  const role = readText(formData, "role");

  if (!fullName || !email || !password || !confirmPassword) {
    return { error: "Vui lòng điền đầy đủ thông tin." };
  }

  if (password.length < 6) {
    return { error: "Mật khẩu cần có ít nhất 6 ký tự." };
  }

  if (password !== confirmPassword) {
    return { error: "Mật khẩu xác nhận không khớp." };
  }

  if (role !== "teacher" && role !== "student") {
    return { error: "Vai trò không hợp lệ." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect(role === "teacher" ? "/teacher" : "/student");
  }

  return {
    message:
      "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản trước khi đăng nhập.",
  };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
