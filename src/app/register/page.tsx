"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { registerAction, type AuthState } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { AuthFrame } from "@/app/auth/AuthFrame";

const initialState: AuthState = {};

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  const [role, setRole] = useState<"teacher" | "student">(
    state.fields?.role ?? "student"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [savedPassword, setSavedPassword] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [manualCheckError, setManualCheckError] = useState<string | null>(null);

  const pendingEmail = state.fields?.email || "";
  const pendingRole = state.fields?.role || role;
  const pendingName = state.fields?.full_name || "";

  // Automatically poll every 3.5s while awaiting email confirmation
  useEffect(() => {
    if (!state.awaitingVerification || !pendingEmail || !savedPassword || verifiedSuccess) {
      return;
    }

    const supabase = createClient();
    const interval = setInterval(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: pendingEmail,
        password: savedPassword,
      });

      if (!error && data.session) {
        clearInterval(interval);
        setVerifiedSuccess(true);
        const targetUrl = `/auth/verified?status=success&autologin=1&role=${encodeURIComponent(
          pendingRole
        )}&name=${encodeURIComponent(pendingName)}&email=${encodeURIComponent(
          pendingEmail
        )}`;
        router.push(targetUrl);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [
    state.awaitingVerification,
    pendingEmail,
    savedPassword,
    verifiedSuccess,
    pendingRole,
    pendingName,
    router,
  ]);

  async function handleManualCheck() {
    if (!pendingEmail || !savedPassword) {
      router.push("/login");
      return;
    }
    setCheckingStatus(true);
    setManualCheckError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: pendingEmail,
      password: savedPassword,
    });
    setCheckingStatus(false);

    if (!error && data.session) {
      setVerifiedSuccess(true);
      const targetUrl = `/auth/verified?status=success&autologin=1&role=${encodeURIComponent(
        pendingRole
      )}&name=${encodeURIComponent(pendingName)}&email=${encodeURIComponent(
        pendingEmail
      )}`;
      router.push(targetUrl);
    } else {
      setManualCheckError(
        "Hệ thống chưa ghi nhận xác thực từ email. Vui lòng mở hộp thư (hoặc mục Thư rác / Spam) và nhấn vào liên kết xác nhận trước."
      );
    }
  }

  async function handleResendEmail() {
    if (!pendingEmail) return;
    setResendMessage("Đang gửi lại email xác thực...");
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: pendingEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    if (error) {
      setResendMessage(
        "Bạn vừa yêu cầu gửi email gần đây. Vui lòng kiểm tra hộp thư (kể cả mục Spam) hoặc đợi 60 giây trước khi gửi lại."
      );
    } else {
      setResendMessage("✓ Đã gửi lại email xác thực mới! Vui lòng kiểm tra hộp thư.");
    }
  }

  return (
    <AuthFrame>
      <div className="auth-form-container">
        {state.awaitingVerification ? (
          <div
            style={{
              background: "#ffffff",
              color: "#0f172a",
              borderRadius: "12px",
              padding: "28px 24px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "16px",
              }}
            >
              ✓
            </div>

            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "21px",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              {verifiedSuccess
                ? "Đã xác thực thành công"
                : "Kiểm tra hộp thư email của bạn"}
            </h2>

            <p
              style={{
                margin: "0 0 18px",
                fontSize: "14.5px",
                lineHeight: 1.6,
                color: "#475569",
              }}
            >
              Hệ thống đã gửi liên kết kích hoạt tài khoản tới địa chỉ{" "}
              <strong style={{ color: "#0f172a" }}>{pendingEmail}</strong>. Ngay khi bạn nhấn xác nhận trong email, màn hình này sẽ tự động chuyển vào lớp học.
            </p>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "14px 16px",
                marginBottom: "18px",
                fontSize: "14px",
                display: "grid",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Họ và tên:</span>
                <strong>{pendingName}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Vai trò:</span>
                <strong>{pendingRole === "teacher" ? "Giáo viên" : "Học sinh"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Trạng thái:</span>
                <span style={{ color: "#15803d", fontWeight: 600 }}>
                  Đang chờ xác nhận email...
                </span>
              </div>
            </div>

            {manualCheckError && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "13.5px",
                  color: "#991b1b",
                  marginBottom: "14px",
                }}
              >
                {manualCheckError}
              </div>
            )}

            {resendMessage && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "13.5px",
                  color: "#166534",
                  marginBottom: "14px",
                }}
              >
                {resendMessage}
              </div>
            )}

            <div style={{ display: "grid", gap: "10px" }}>
              <button
                type="button"
                onClick={handleManualCheck}
                disabled={checkingStatus}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#0f172a",
                  color: "#ffffff",
                  fontSize: "14.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {checkingStatus
                  ? "Đang kiểm tra trạng thái..."
                  : "Tôi đã nhấn xác nhận trong email → Vào hệ thống"}
              </button>

              <button
                type="button"
                onClick={handleResendEmail}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#0f172a",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Gửi lại email xác thực
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="auth-form-header">
              <h1>Đăng ký tài khoản</h1>
              <p>Chọn vai trò của bạn để khởi tạo không gian làm việc phù hợp</p>
            </div>

            {state.error && (
              <div
                role="alert"
                style={{
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "rgba(220, 38, 38, 0.08)",
                  border: "1px solid rgba(220, 38, 38, 0.32)",
                  color: "var(--semantic-danger, #dc2626)",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "18px",
                }}
              >
                {state.error}
              </div>
            )}

            <form className="auth-form" action={formAction}>
              {/* Role Selection */}
              <div style={{ marginBottom: "20px" }}>
                <span
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    fontSize: "14px",
                  }}
                >
                  Bạn đăng ký với vai trò:
                </span>
                <div className="role-selector" style={{ marginBottom: "6px" }}>
                  <label>
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={role === "student"}
                      onChange={() => setRole("student")}
                    />
                    <span>Học sinh</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="role"
                      value="teacher"
                      checked={role === "teacher"}
                      onChange={() => setRole("teacher")}
                    />
                    <span>Giáo viên</span>
                  </label>
                </div>
                <small style={{ color: "var(--text-secondary)", fontSize: "12.5px" }}>
                  {role === "student"
                    ? "Dành cho học sinh tham gia lớp học, xem mô phỏng 3D và hoàn thành phiếu học tập."
                    : "Dành cho giáo viên tạo lớp học, cấp mã lớp, giao bài và theo dõi kết quả học sinh."}
                </small>
              </div>

              <div className="form-group" style={{ marginBottom: "18px" }}>
                <label
                  htmlFor="full_name"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  Họ và tên
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder={
                    role === "teacher" ? "VD: Nguyễn Thị Minh Anh" : "VD: Trần Minh Khôi"
                  }
                  defaultValue={state.fields?.full_name ?? ""}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid var(--border-light)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "15px",
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "18px" }}>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  Địa chỉ Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tenban@truong.edu.vn"
                  defaultValue={state.fields?.email ?? ""}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid var(--border-light)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "15px",
                  }}
                />
              </div>

              {role === "student" && (
                <div className="form-group" style={{ marginBottom: "18px" }}>
                  <label
                    htmlFor="join_code"
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    Mã lớp học của giáo viên{" "}
                    <span
                      style={{
                        fontWeight: 400,
                        color: "var(--text-secondary)",
                        fontSize: "13px",
                      }}
                    >
                      (Tuỳ chọn — có thể nhập sau)
                    </span>
                  </label>
                  <input
                    id="join_code"
                    name="join_code"
                    type="text"
                    placeholder="VD: VL12A1"
                    defaultValue={state.fields?.join_code ?? ""}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1px solid var(--border-light)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "15px",
                      textTransform: "uppercase",
                    }}
                  />
                </div>
              )}

              <div className="form-group" style={{ marginBottom: "18px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <label
                    htmlFor="password"
                    style={{
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    Mật khẩu (tối thiểu 6 ký tự)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
              aria-pressed={showPassword}
              aria-controls="password"
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--color-primary)",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  </button>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={6}
                  placeholder="Nhập mật khẩu từ 6 ký tự trở lên"
                  onChange={(e) => setSavedPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid var(--border-light)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "15px",
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "26px" }}>
                <label
                  htmlFor="confirm_password"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  Xác nhận mật khẩu
                </label>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={6}
                  placeholder="Nhập lại mật khẩu"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid var(--border-light)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "15px",
                  }}
                />
              </div>

              <button
                className="btn primary"
                type="submit"
                disabled={pending}
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "16px",
                  fontWeight: 700,
                  borderRadius: "var(--radius-md)",
                }}
              >
                {pending
                  ? "Đang khởi tạo tài khoản..."
                  : role === "teacher"
                    ? "Tạo tài khoản Giáo viên →"
                    : "Tạo tài khoản Học sinh →"}
              </button>
            </form>
          </>
        )}

        <p
          style={{
            marginTop: "24px",
            textAlign: "center",
            color: "var(--text-secondary)",
            fontSize: "14px",
          }}
        >
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            style={{
              color: "var(--color-primary)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Đăng nhập ngay
          </Link>
        </p>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <Link
            href="/"
            style={{
              color: "var(--text-secondary)",
              fontSize: "13.5px",
              textDecoration: "none",
            }}
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </AuthFrame>
  );
}
