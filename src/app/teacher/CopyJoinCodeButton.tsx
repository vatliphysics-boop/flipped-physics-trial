"use client";

import { useEffect, useState } from "react";

export function CopyJoinCodeButton({ code }: { code: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (status === "idle") return;
    const timer = window.setTimeout(() => setStatus("idle"), 2200);
    return () => window.clearTimeout(timer);
  }, [status]);

  async function copyCode() {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(code);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return (
    <span className="teacher-class-code-actions">
      <button
        type="button"
        className={`btn small teacher-class-copy ${status === "copied" ? "is-copied" : ""}`}
        onClick={copyCode}
        aria-label={`Sao chép mã tham gia ${code}`}
      >
        {status === "copied" ? "✓ Đã sao chép" : "📋 Sao chép mã"}
      </button>
      {status === "error" && (
        <span className="teacher-class-copy-error" role="status">
          Không thể sao chép. Hãy chọn mã để sao chép thủ công.
        </span>
      )}
    </span>
  );
}
