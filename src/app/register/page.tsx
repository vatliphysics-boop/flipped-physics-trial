"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type AuthState } from "@/app/auth/actions";
import { NuclearScienceIllustration } from "@/components/learning/NuclearScienceIllustration";

const initialState: AuthState = {};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <NuclearScienceIllustration className="auth-hero-svg" style={{ width: "220px", color: "var(--color-primary)" }} />
          </div>
          <h2>Học liệu số Vật lí 12</h2>
          <p>Tham gia nền tảng hỗ trợ giáo viên tổ chức lớp học đảo ngược khoa học, hiệu quả và chủ động.</p>
        </div>
      </div>
      
      <div className="auth-form-container">
        <div className="auth-form-header">
          <h1>Đăng ký tài khoản</h1>
          <p>Tạo không gian làm việc mới</p>
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
            <label htmlFor="full_name" style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "var(--text-primary)" }}>Họ và tên</label>
            <input 
              id="full_name" 
              name="full_name" 
              type="text" 
              required 
              style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", fontSize: "15px" }} 
            />
          </div>

          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label htmlFor="email" style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "var(--text-primary)" }}>Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", fontSize: "15px" }} 
            />
          </div>

          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label htmlFor="password" style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "var(--text-primary)" }}>Mật khẩu</label>
            <input 
              id="password" 
              name="password" 
              type="password"
              minLength={6} 
              required 
              style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", fontSize: "15px" }} 
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: "32px" }}>
            <label htmlFor="confirm_password" style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "var(--text-primary)" }}>Xác nhận mật khẩu</label>
            <input 
              id="confirm_password" 
              name="confirm_password" 
              type="password"
              minLength={6} 
              required 
              style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", fontSize: "15px" }} 
            />
          </div>

          {state.error && (
            <p role="alert" style={{ color: "var(--semantic-danger)", marginBottom: "16px", fontSize: "14px", fontWeight: 500 }}>
              {state.error}
            </p>
          )}

          {state.message && (
            <p role="status" style={{ color: "var(--semantic-success)", marginBottom: "16px", fontSize: "14px", fontWeight: 500 }}>
              {state.message}
            </p>
          )}

          <button className="btn primary" type="submit" disabled={pending} style={{ width: "100%", padding: "14px", fontSize: "16px", fontWeight: 600, borderRadius: "var(--radius-md)" }}>
            {pending ? "Đang đăng ký..." : "Tạo tài khoản"}
          </button>
        </form>

        <p style={{ marginTop: "32px", textAlign: "center", color: "var(--text-secondary)", fontSize: "14px" }}>
          Đã có tài khoản? <Link href="/login" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>Đăng nhập</Link>
        </p>
        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <Link href="/" style={{ color: "var(--text-secondary)", fontSize: "14px", textDecoration: "none" }}>← Quay lại trang chủ</Link>
        </div>
      </div>
    </div>
  );
}
