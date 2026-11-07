"use client";
import { useState, useTransition } from "react";
import { saveActivityProgressAction } from "@/app/student/actions";
import { normalizeActivityKey } from "@/lib/curriculum";
import { safeLearningUrl } from "@/lib/pathway-progress";
import { LearningResourcePreview } from "./LearningResourcePreview";
import { NuclearLearningNotebook } from "./NuclearLearningNotebook";
import { legacyNuclearMath } from "@/lib/legacy-nuclear-math";
import { RichPhysicsText } from "./RichPhysicsText";
export type StudentColabMaterial = {
  id: string;
  title: string;
  content_url: string;
  description: string | null;
  instructions?: string | null;
  is_complete: boolean;
};
export function StudentColabViewer({
  material,
}: {
  material: StudentColabMaterial;
}) {
  const [isComplete, setIsComplete] = useState(material.is_complete),
    [pending, startTransition] = useTransition(),
    [response, setResponse] = useState(""),
    [done, setDone] = useState(false),
    [error, setError] = useState("");
  const activity = normalizeActivityKey(material.content_url),
    url = safeLearningUrl(material.content_url);
  const worksheet = material.content_url.match(/^worksheet:b(2[1-5])/i);
  const available = Boolean(
    activity || url || worksheet || material.instructions,
  );
  return (
    <article className="student-paper">
      <h2>{material.title}</h2>
      {material.description && <p>{material.description}</p>}
      {material.instructions && (
        <details open>
          <summary>Hướng dẫn và nội dung nhiệm vụ</summary>
          <div style={{ marginTop: "8px" }}>
            <RichPhysicsText content={legacyNuclearMath(material.instructions)} />
          </div>
        </details>
      )}
      {(activity || url) && (
        <LearningResourcePreview
          material={{
            title: material.title,
            content_url: activity ? `activity:${activity}` : url!,
            material_type: activity ? "simulation" : "colab",
          }}
          onProgress={setDone}
        />
      )}
      {worksheet && <NuclearLearningNotebook code={`B${worksheet[1]}`} />}{" "}
      {!available && (
        <p role="alert">
          Học liệu chưa có nội dung hoặc đường dẫn. Hãy báo giáo viên để bổ
          sung.
        </p>
      )}
      {!isComplete ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            startTransition(async () => {
              try {
                const result = await saveActivityProgressAction({
                  materialId: material.id,
                  response: { observation: response.trim() },
                  isComplete: true,
                });
                if (result.error) setError(result.error);
                else if (result.message) setIsComplete(true);
              } catch {
                setError(
                  "Chưa lưu được. Nội dung của em vẫn ở đây để thử lại.",
                );
              }
            });
          }}
        >
          <label className="notebook-task">
            Kết quả thực hành và điều em hiểu
            <textarea
              required
              rows={4}
              maxLength={2000}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
            />
          </label>
          <button
            className="btn primary"
            disabled={
              pending ||
              !available ||
              !response.trim() ||
              Boolean(activity && !done)
            }
          >
            {pending ? "Đang lưu…" : "Lưu kết quả thực hành"}
          </button>
          {activity && !done && (
            <p>
              Hoàn thành thao tác và kiểm tra nhận định trong thí nghiệm trước
              khi lưu.
            </p>
          )}
          {error && <p role="alert">{error}</p>}
        </form>
      ) : (
        <p role="status">✓ Đã lưu kết quả thực hành.</p>
      )}
    </article>
  );
}
