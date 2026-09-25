"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthState } from "@/app/auth/actions";
import { NuclearScienceIllustration } from "@/components/learning/NuclearScienceIllustration";

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <NuclearScienceIllustration className="auth-hero-svg" style={{ width: "220px", color: "var(--color-primary)" }} />
          </div>
          <h2>Học liệu số Vật lí 12</h2>
          <p>Nền tảng hỗ trợ giáo viên tổ chức lớp học đảo ngược khoa học, hiệu quả và chủ động.</p>
        </div>
      </div>
      
      <div className="auth-form-container">
        <div className="auth-form-header">
          <h1>Đăng nhập</h1>
          <p>Truy cập không gian làm việc của bạn</p>
        </div>

        <form className="auth-form" action={formAction}>
          <div className="role-selector">
            <label>
              <input type="radio" name="role" value="teacher" defaultChecked />
              <span>Giáo viên</span>
            </label>
            <label>
              <input type="radio" name="role" value="student" />
              <span>Học sinh</span>
            </label>
          </div>

          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label htmlFor="email" style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#172033" }}>Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", fontSize: "15px" }} 
            />
          </div>

          <div className="form-group" style={{ marginBottom: "32px" }}>
            <label htmlFor="password" style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#172033" }}>Mật khẩu</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", fontSize: "15px" }} 
            />
          </div>

          {state.error && (
            <p role="alert" style={{ color: "#b42318", marginBottom: "16px", fontSize: "14px", fontWeight: 500 }}>
              {state.error}
            </p>
          )}

          <button className="btn primary" type="submit" disabled={pending} style={{ width: "100%", padding: "14px", fontSize: "16px", fontWeight: 600, borderRadius: "var(--radius-md)" }}>
            {pending ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p style={{ marginTop: "32px", textAlign: "center", color: "#667085", fontSize: "14px" }}>
          Chưa có tài khoản? <Link href="/register" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>Đăng ký ngay</Link>
        </p>
        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <Link href="/" style={{ color: "#667085", fontSize: "14px", textDecoration: "none" }}>← Quay lại trang chủ</Link>
        </div>
      </div>
    </div>
  );
}
