"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { registerAction, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = {};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState
  );
  const [role, setRole] = useState<"teacher" | "student">("student");

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <span className="eyebrow">Tạo tài khoản</span>
        <h1>Tham gia không gian học tập</h1>
        <p className="muted">
          Chọn vai trò và điền thông tin cơ bản để bắt đầu.
        </p>

        <form action={formAction} className="form">
          <div className="field">
            <label htmlFor="full_name">Họ và tên</label>
            <input
              className="input"
              id="full_name"
              name="full_name"
              required
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              className="input"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="email@example.com"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Mật khẩu</label>
            <input
              className="input"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="field">
            <label htmlFor="confirm_password">Xác nhận mật khẩu</label>
            <input
              className="input"
              id="confirm_password"
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="field">
            <label>Vai trò</label>
            <input type="hidden" name="role" value={role} />
            <div className="role-grid">
              <button
                type="button"
                className="role-card"
                onClick={() => setRole("teacher")}
                style={{
                  textAlign: "left",
                  background: role === "teacher" ? "#eef4ff" : "#fff",
                  borderColor: role === "teacher" ? "#2357d9" : undefined,
                }}
              >
                <b>Giáo viên</b>
                <br />
                <small className="muted">
                  Thiết kế học liệu và quản lý lớp
                </small>
              </button>

              <button
                type="button"
                className="role-card"
                onClick={() => setRole("student")}
                style={{
                  textAlign: "left",
                  background: role === "student" ? "#eef4ff" : "#fff",
                  borderColor: role === "student" ? "#2357d9" : undefined,
                }}
              >
                <b>Học sinh</b>
                <br />
                <small className="muted">
                  Tham gia lớp và hoàn thành nhiệm vụ
                </small>
              </button>
            </div>
          </div>

          {state.error ? (
            <p role="alert" style={{ color: "#b42318", margin: 0 }}>
              {state.error}
            </p>
          ) : null}

          {state.message ? (
            <p role="status" style={{ color: "#1d7a56", margin: 0 }}>
              {state.message}
            </p>
          ) : null}

          <button className="btn primary" type="submit" disabled={pending}>
            {pending ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 16 }}>
          Đã có tài khoản?{" "}
          <Link href="/login" style={{ color: "#2357d9", fontWeight: 700 }}>
            Đăng nhập
          </Link>
        </p>
      </section>
    </main>
  );
}
