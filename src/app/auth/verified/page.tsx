"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthFrame } from "../AuthFrame";
import styles from "../auth-frame.module.css";

function VerifiedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialStatus = searchParams.get("status") === "error" ? "error" : "success";
  const initialAutoLogin = searchParams.get("autologin") === "1";
  const initialRole =
    searchParams.get("role") === "teacher" ? "teacher" : "student";
  const initialName = searchParams.get("name") || "";
  const initialEmail = searchParams.get("email") || "";
  const initialMessage = searchParams.get("message") || "";

  const [status, setStatus] = useState<"success" | "error">(initialStatus);
  const [autoLogin, setAutoLogin] = useState<boolean>(initialAutoLogin);
  const [role, setRole] = useState<"teacher" | "student">(initialRole);
  const [userName, setUserName] = useState<string>(initialName);
  const [userEmail, setUserEmail] = useState<string>(initialEmail);
  const [errorMessage, setErrorMessage] = useState<string>(initialMessage);
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashError = hashParams.get("error_description") || hashParams.get("error");
        if (hashError) {
          setStatus("error");
          setErrorMessage(
            hashError.toLowerCase().includes("expired")
              ? "Liên kết xác thực trong email đã hết hạn. Vui lòng đăng nhập hoặc yêu cầu gửi lại email xác thực."
              : "Liên kết xác thực không hợp lệ hoặc đã được sử dụng."
          );
          return;
        }
      }

      if (user) {
        setStatus("success");
        setAutoLogin(true);
        if (user.email) setUserEmail(user.email);
        const metaName =
          typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : "";
        if (metaName) setUserName(metaName);
        const metaRole =
          user.user_metadata?.role === "teacher" ? "teacher" : "student";
        setRole(metaRole);
      }
    });
  }, []);

  useEffect(() => {
    if (status !== "success" || !autoLogin) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(role === "teacher" ? "/teacher" : "/student");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status, autoLogin, role, router]);

  const targetPath = autoLogin
    ? role === "teacher"
      ? "/teacher"
      : "/student"
    : "/login?verified=1";

  return (
    <AuthFrame>
      <section className={styles.verification} aria-labelledby="verification-title">
        <div className={`${styles.statusIcon} ${status === "error" ? styles.statusError : ""}`} aria-hidden="true">
          {status === "success" ? "✓" : "!"}
        </div>
        <h1 id="verification-title">
          {status === "success" ? "Xác thực tài khoản thành công" : "Liên kết xác thực đã hết hạn"}
        </h1>
        <p role={status === "error" ? "alert" : "status"}>
          {status === "success"
            ? "Địa chỉ email của bạn đã được xác nhận trên hệ thống Học liệu số Vật lí Hạt nhân 12."
            : errorMessage || "Liên kết xác thực không còn hiệu lực hoặc tài khoản đã được kích hoạt trước đó."}
        </p>
        {status === "success" ? (
          <>
            <dl className={styles.details}>
              <div><dt>Trạng thái</dt><dd>Đã kích hoạt</dd></div>
              <div><dt>Vai trò</dt><dd>{role === "teacher" ? "Giáo viên" : "Học sinh"}</dd></div>
              {userName && <div><dt>Họ và tên</dt><dd>{userName}</dd></div>}
              {userEmail && <div><dt>Email</dt><dd>{userEmail}</dd></div>}
            </dl>
            {autoLogin && <p className={styles.countdown} aria-live="polite">
              Tự động chuyển vào trang {role === "teacher" ? "giáo viên" : "học sinh"} sau <strong>{countdown} giây</strong>.
            </p>}
            <div className={styles.actions}>
              <Link className="btn primary" href={targetPath}>
                {autoLogin ? `Vào không gian ${role === "teacher" ? "giáo viên" : "học sinh"} →` : "Đăng nhập vào hệ thống →"}
              </Link>
            </div>
          </>
        ) : (
          <div className={styles.actions}>
            <Link className="btn primary" href="/login">Chuyển tới trang đăng nhập →</Link>
            <Link className="btn" href="/register">Đăng ký lại tài khoản</Link>
          </div>
        )}
      </section>
    </AuthFrame>
  );
}

export default function VerifiedPage() {
  return (
    <Suspense fallback={<AuthFrame><p role="status">Đang xác thực tài khoản...</p></AuthFrame>}>
      <VerifiedContent />
    </Suspense>
  );
}
