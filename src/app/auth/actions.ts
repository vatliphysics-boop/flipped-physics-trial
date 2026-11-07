"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  message?: string;
  awaitingVerification?: boolean;
  fields?: {
    full_name?: string;
    email?: string;
    role?: "teacher" | "student";
    join_code?: string;
  };
};

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.";
  }
  if (lower.includes("email not confirmed")) {
    return "Tài khoản chưa được xác nhận email. Vui lòng mở hộp thư (hoặc mục Thư rác) để nhấn liên kết kích hoạt.";
  }
  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return "Email này đã được đăng ký. Vui lòng chuyển sang trang Đăng nhập.";
  }
  if (lower.includes("password should be at least")) {
    return "Mật khẩu phải có tối thiểu 6 ký tự.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Bạn đã gửi yêu cầu quá nhiều lần trong thời gian ngắn. Vui lòng đợi ít phút rồi thử lại.";
  }
  return message || "Đã xảy ra lỗi xác thực. Vui lòng thử lại.";
}

export async function loginAction(
  _previousState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = readText(formData, "email");
  const password = readText(formData, "password");
  const nextPath = readText(formData, "next");

  if (!email || !password) {
    return {
      error: "Vui lòng nhập đầy đủ email và mật khẩu.",
      fields: { email },
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !user) {
    return {
      error: translateAuthError(error?.message ?? ""),
      fields: { email },
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const metaRole =
    user.user_metadata?.role === "teacher" ? "teacher" : "student";
  const resolvedRole: "teacher" | "student" =
    profile?.role === "teacher" || profile?.role === "student"
      ? profile.role
      : metaRole;

  // Pending class join code from registration metadata if student
  const pendingJoinCode =
    typeof user.user_metadata?.pending_join_code === "string"
      ? user.user_metadata.pending_join_code.trim().toUpperCase()
      : "";
  if (resolvedRole === "student" && pendingJoinCode) {
    try {
      await supabase.rpc("join_class_by_code", { p_join_code: pendingJoinCode });
      await supabase.auth.updateUser({
        data: { pending_join_code: null },
      });
    } catch {
      // Ignore join error on login so user still reaches dashboard
    }
  }

  revalidatePath("/", "layout");

  if (resolvedRole === "teacher") {
    if (nextPath && nextPath.startsWith("/teacher")) {
      redirect(nextPath);
    }
    redirect("/teacher");
  }

  if (nextPath && nextPath.startsWith("/student")) {
    redirect(nextPath);
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
  const rawRole = readText(formData, "role");
  const joinCode = readText(formData, "join_code").toUpperCase();
  const role: "teacher" | "student" = rawRole === "teacher" ? "teacher" : "student";

  const fields = { full_name: fullName, email, role, join_code: joinCode };

  if (!fullName || !email || !password || !confirmPassword) {
    return { error: "Vui lòng điền đầy đủ các trường bắt buộc.", fields };
  }

  if (fullName.length < 2) {
    return { error: "Vui lòng nhập họ và tên hợp lệ.", fields };
  }

  if (password.length < 6) {
    return { error: "Mật khẩu cần có ít nhất 6 ký tự.", fields };
  }

  if (password !== confirmPassword) {
    return { error: "Mật khẩu xác nhận không khớp.", fields };
  }

  if (rawRole !== "teacher" && rawRole !== "student") {
    return { error: "Vui lòng chọn vai trò Giáo viên hoặc Học sinh.", fields };
  }

  const supabase = await createClient();
  const headerList = await headers();
  const origin =
    headerList.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
      data: {
        full_name: fullName,
        role,
        ...(role === "student" && joinCode ? { pending_join_code: joinCode } : {}),
      },
    },
  });

  if (error) {
    return { error: translateAuthError(error.message), fields };
  }

  // Supabase returns an obfuscated user with empty identities if email already exists
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return {
      error: "Email này đã được đăng ký tài khoản. Vui lòng chuyển sang trang Đăng nhập.",
      fields,
    };
  }

  if (data.session) {
    if (role === "student" && joinCode) {
      try {
        await supabase.rpc("join_class_by_code", { p_join_code: joinCode });
      } catch {
        // Ignore non-fatal join error during signup redirect
      }
    }
    revalidatePath("/", "layout");
    redirect(role === "teacher" ? "/teacher" : "/student");
  }

  return {
    awaitingVerification: true,
    message:
      "Hệ thống đã gửi liên kết kích hoạt đến hộp thư của bạn. Hãy mở email và nhấn xác nhận!",
    fields,
  };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
