"use client";

import { useState, useTransition } from "react";
import { saveActivityProgressAction } from "@/app/student/actions";

export type StudentColabMaterial = {
  id: string;
  title: string;
  content_url: string;
  description: string | null;
  is_complete: boolean;
};

export function StudentColabViewer({
  material,
}: {
  material: StudentColabMaterial;
}) {
  const [isComplete, setIsComplete] = useState(material.is_complete);
  const [isPending, startTransition] = useTransition();

  function markComplete() {
    startTransition(async () => {
      const res = await saveActivityProgressAction({
        materialId: material.id,
        response: { completed_manually: true },
        isComplete: true,
      });
      if (res.message) {
        setIsComplete(true);
      }
    });
  }

  return (
    <article style={{ marginBottom: "48px" }}>
      <header style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "24px", color: "var(--text-primary)", marginBottom: "8px" }}>{material.title}</h2>
        {material.description && (
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", margin: "0 0 8px", maxWidth: "800px" }}>
            {material.description}
          </p>
        )}
      </header>

      <div style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", backgroundColor: "var(--bg-surface-elevated)", padding: "24px" }}>
        <p style={{ marginBottom: "16px" }}>Em hãy mở liên kết Colab dưới đây để thực hành. Khi hoàn thành, hãy quay lại đây để xác nhận.</p>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <a
            href={material.content_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn primary"
          >
            Mở Google Colab ↗
          </a>

          {!isComplete ? (
            <button
              className="btn"
              disabled={isPending}
              onClick={markComplete}
            >
              {isPending ? "Đang lưu..." : "Đánh dấu đã hoàn thành"}
            </button>
          ) : (
            <span style={{ color: "var(--semantic-success)", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
              ✓ Đã hoàn thành
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
