import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const verifiedUrl = request.nextUrl.clone();
  verifiedUrl.pathname = "/auth/verified";
  verifiedUrl.search = "";

  // 1. If Supabase redirected here with an explicit error (e.g. otp_expired)
  if (errorParam || errorDescription) {
    verifiedUrl.searchParams.set("status", "error");
    verifiedUrl.searchParams.set(
      "message",
      errorDescription?.toLowerCase().includes("expired")
        ? "Liên kết xác thực đã hết hạn hoặc đã được sử dụng trước đó."
        : "Không thể xác thực liên kết email này. Vui lòng thử đăng nhập hoặc yêu cầu gửi lại email."
    );
    return NextResponse.redirect(verifiedUrl);
  }

  const supabase = await createClient();

  // Helper to finalize user metadata (e.g., student pending join code) and build redirect
  async function buildSuccessRedirect(autoLoggedIn: boolean) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .maybeSingle();

      const resolvedRole: "teacher" | "student" =
        profile?.role === "teacher" || profile?.role === "student"
          ? profile.role
          : user.user_metadata?.role === "teacher"
            ? "teacher"
            : "student";

      const resolvedName =
        profile?.full_name ||
        (typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : "");

      const pendingJoinCode =
        typeof user.user_metadata?.pending_join_code === "string"
          ? user.user_metadata.pending_join_code.trim().toUpperCase()
          : "";

      if (resolvedRole === "student" && pendingJoinCode) {
        try {
          await supabase.rpc("join_class_by_code", {
            p_join_code: pendingJoinCode,
          });
          await supabase.auth.updateUser({
            data: { pending_join_code: null },
          });
        } catch {
          // Ignore non-fatal class join errors during confirmation
        }
      }

      verifiedUrl.searchParams.set("status", "success");
      verifiedUrl.searchParams.set("autologin", autoLoggedIn ? "1" : "0");
      verifiedUrl.searchParams.set("role", resolvedRole);
      if (resolvedName) {
        verifiedUrl.searchParams.set("name", resolvedName);
      }
      if (user.email) {
        verifiedUrl.searchParams.set("email", user.email);
      }
      return NextResponse.redirect(verifiedUrl);
    }

    // Even if session cookie isn't on this device (e.g. user clicked link on phone while registering on laptop),
    // Supabase's /auth/v1/verify endpoint ALREADY confirmed the email before redirecting here!
    verifiedUrl.searchParams.set("status", "success");
    verifiedUrl.searchParams.set("autologin", "0");
    return NextResponse.redirect(verifiedUrl);
  }

  // 2. PKCE Code Flow (Default when clicking {{ .ConfirmationURL }} with @supabase/ssr)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return buildSuccessRedirect(true);
    }
    // If exchangeCodeForSession failed because the link was opened in another browser/phone
    // (missing code_verifier cookie), the email was STILL verified by Supabase's /auth/v1/verify server!
    return buildSuccessRedirect(false);
  }

  // 3. Token Hash Flow (?token_hash=...&type=email|signup|recovery)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      return buildSuccessRedirect(true);
    }

    verifiedUrl.searchParams.set("status", "error");
    verifiedUrl.searchParams.set(
      "message",
      "Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập hoặc yêu cầu gửi lại email xác thực."
    );
    return NextResponse.redirect(verifiedUrl);
  }

  // 4. Implicit flow or direct redirect after Supabase /auth/v1/verify
  return buildSuccessRedirect(false);
}
