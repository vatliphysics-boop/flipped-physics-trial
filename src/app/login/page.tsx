"use client";

import Link from "next/link";
import { Suspense, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, type AuthState } from "@/app/auth/actions";
import { AuthFrame } from "@/app/auth/AuthFrame";

const initialState: AuthState = {};

function LoginFormContent() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();

  const urlMessage = searchParams.get("message");
  const isVerified = searchParams.get("verified") === "1";
  const urlError = searchParams.get("error");
  const nextPath = searchParams.get("next") ?? "";

  const displayError = state.error || urlError;
  const displayMessage =
    state.message ||
    urlMessage ||
    (isVerified
      ? "Tài khoản email của bạn đã được kích hoạt thành công! Hãy đăng nhập bên dưới."
      : null);

  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <h1>Đăng nhập hệ thống</h1>
        <p>
          Truy cập không gian lớp học đảo ngược Vật lí 12 — Hệ thống tự động nhận diện vai trò{" "}
          <strong>Giáo viên</strong> hoặc <strong>Học sinh</strong> theo tài khoản của bạn.
        </p>
      </div>

      {nextPath && !displayError && !displayMessage && (
        <div
          role="status"
          style={{
            padding: "12px 14px",
            borderRadius: "8px",
            background: "var(--color-accent-soft)",
            border: "1px solid rgba(30, 64, 175, 0.25)",
            color: "var(--color-accent)",
            fontSize: "13.5px",
            fontWeight: 600,
            marginBottom: "18px",
          }}
        >
          Vui lòng đăng nhập để tiếp tục truy cập vào không gian lớp học.
        </div>
      )}

      {displayMessage && (
        <div
          role="status"
          style={{
            padding: "12px 14px",
            borderRadius: "8px",
            background: "rgba(13, 148, 136, 0.09)",
            border: "1px solid rgba(13, 148, 136, 0.35)",
            color: "#0F766E",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "18px",
          }}
        >
          {displayMessage}
        </div>
      )}

      {displayError && (
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
          {displayError}
        </div>
      )}

      <form className="auth-form" action={formAction}>
        <input type="hidden" name="next" value={nextPath} />

        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              marginBottom: "8px",
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

        <div className="form-group" style={{ marginBottom: "28px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <label
              htmlFor="password"
              style={{
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              Mật khẩu
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
            autoComplete="current-password"
            placeholder="Nhập mật khẩu của bạn"
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
          {pending ? "Đang xác thực tài khoản..." : "Đăng nhập vào lớp học →"}
        </button>
      </form>

      <p
        style={{
          marginTop: "24px",
          textAlign: "center",
          color: "var(--text-secondary)",
          fontSize: "14px",
        }}
      >
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          style={{
            color: "var(--color-primary)",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Đăng ký tài khoản mới
        </Link>
      </p>

      <div
        style={{
          marginTop: "24px",
          paddingTop: "20px",
          borderTop: "1px solid var(--border-light)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          fontSize: "13.5px",
        }}
      >
        <Link
          href="/"
          style={{ color: "var(--text-secondary)", textDecoration: "none", fontWeight: 500 }}
        >
          ← Quay lại trang chủ
        </Link>
        <Link
          href="/gioi-thieu"
          style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}
        >
          Xem tư liệu Infographic &amp; Lịch sử công khai →
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthFrame>
      <Suspense
        fallback={
          <div className="auth-form-container">
            <p>Đang tải biểu mẫu đăng nhập...</p>
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </AuthFrame>
  );
}
