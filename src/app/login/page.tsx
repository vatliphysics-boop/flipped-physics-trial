"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <div className="brand" style={{ marginBottom: 18 }}>
          <div className="brand-mark">VL</div>
          <div>Học liệu số Vật lí hạt nhân 12</div>
        </div>

        <span className="eyebrow">Đăng nhập hệ thống</span>
        <h1>Chào mừng quay lại</h1>
        <p className="muted">
          Đăng nhập để tiếp tục không gian học tập của bạn.
        </p>

        <div className="role-grid" style={{ marginTop: 18 }}>
          <div className="role-card">
            <b>Giáo viên</b>
            <br />
            <small className="muted">Quản lý lớp và học liệu</small>
          </div>
          <div className="role-card">
            <b>Học sinh</b>
            <br />
            <small className="muted">Học tập và theo dõi tiến độ</small>
          </div>
        </div>

        <form action={formAction} className="form">
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
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </div>

          {state.error ? (
            <p role="alert" style={{ color: "#b42318", margin: 0 }}>
              {state.error}
            </p>
          ) : null}

          <button className="btn primary" type="submit" disabled={pending}>
            {pending ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 16 }}>
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            style={{ color: "#2357d9", fontWeight: 700 }}
          >
            Đăng ký
          </Link>
        </p>
      </section>
    </main>
  );
}
