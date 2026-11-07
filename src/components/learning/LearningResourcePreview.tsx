"use client";
/* eslint-disable @next/next/no-img-element -- Resource images include teacher URLs and animated SVGs. */
import { FixedPhysicsActivityRenderer } from "@/components/physics/FixedPhysicsActivityRenderer";
import { normalizeActivityKey } from "@/lib/curriculum";
import { safeLearningUrl } from "@/lib/pathway-progress";
import type { MaterialItem } from "@/lib/material-bank";
import { NuclearExamWorkspace } from "./NuclearExamWorkspace";
import { TeachingGuideWorkspace, SelfLearningRubric } from "./TeachingGuideWorkspace";
import { InteractiveInfographic } from "./InteractiveInfographic";
import { YouTubeLearningVideo } from "./YouTubeLearningVideo";
import { NucleusExplorer } from "./NucleusExplorer";
import { NuclearLessonVideo } from "./NuclearLessonVideo";
import { NUCLEAR_LAB_LESSONS, nuclearLabUrl, nuclearVideoUrl } from "@/lib/nuclear-lab-lessons";
import { youtubeId } from "@/lib/visual-learning";
import {
  NuclearGroupWorkspace,
  NuclearLearningNotebook,
  NuclearReviewGame,
} from "./NuclearLearningNotebook";

type Resource = Pick<MaterialItem, "title" | "content_url" | "material_type"> &
  Partial<Pick<MaterialItem, "metadata" | "lesson_tag" | "description">>;
export function LearningResourcePreview({
  material,
  customPrompt,
  onProgress,
}: {
  material: Resource;
  customPrompt?: string;
  onProgress?: (done: boolean) => void;
}) {
  const key = normalizeActivityKey(
      material.metadata?.activityKey ?? material.content_url,
    ),
    url = safeLearningUrl(material.content_url);
  const tagMatch = `${material.lesson_tag ?? ""} ${url ?? ""} ${material.title ?? ""}`.match(/\b(B2[1-5])\b/i);
  const inferredLessonTag = material.lesson_tag || (tagMatch ? tagMatch[1].toUpperCase() : undefined);
  const guideUrlMatch = url?.match(/^\/learning\/(guides|remediation)\/(B2[1-5])\.html$/i);
  const infographicUrlMatch = url?.match(/^\/learning\/infographics\/(B2[1-5])\.(svg|html)$/i);
  const workspace =
    material.metadata?.workspace ??
    (guideUrlMatch ? (guideUrlMatch[1].toLowerCase() === "remediation" ? "remediation" : "teaching-guide") : undefined) ??
    (infographicUrlMatch ? "infographic" : undefined);
  const guideCode = material.metadata?.guideId ?? (guideUrlMatch ? guideUrlMatch[2].toUpperCase() : inferredLessonTag);

  const modelLesson = material.material_type === "simulation"
    ? NUCLEAR_LAB_LESSONS.find((lesson) => nuclearLabUrl(lesson.code, "mo-hinh") === url)
    : undefined;
  if (modelLesson) return <NucleusExplorer key={modelLesson.isotopeId} isotopeId={modelLesson.isotopeId} compact />;
  const videoLesson = material.material_type === "lecture_video"
    ? NUCLEAR_LAB_LESSONS.find((lesson) => nuclearVideoUrl(lesson.code) === url)
    : undefined;
  if (videoLesson) return <NuclearLessonVideo key={videoLesson.code} lesson={videoLesson} />;

  if (workspace === "infographic" && inferredLessonTag) return <InteractiveInfographic key={inferredLessonTag} code={inferredLessonTag} />;
  if (workspace === "assessment" && material.metadata?.examId) return <NuclearExamWorkspace key={material.metadata.examId} examId={material.metadata.examId} />;
  if ((workspace === "teaching-guide" || workspace === "remediation") && guideCode) return <TeachingGuideWorkspace key={guideCode} code={guideCode} remediation={workspace === "remediation"} />;
  if (workspace === "rubric") return <SelfLearningRubric />;
  if (key)
    return (
      <FixedPhysicsActivityRenderer
        key={key}
        activityKey={key}
        customPrompt={customPrompt}
        onProgress={onProgress}
      />
    );
  if (workspace === "mindmap" || workspace === "roleplay")
    return <NuclearGroupWorkspace kind={workspace} />;
  if (workspace === "game") return <NuclearReviewGame />;
  if ((workspace === "quiz" || (material.material_type === "colab" && url?.endsWith(".ipynb"))) && inferredLessonTag)
    return (
      <div>
        <NuclearLearningNotebook
          key={inferredLessonTag}
          code={inferredLessonTag}
          quizOnly
        />
        {url && (
          <p style={{ marginTop: "12px" }}>
            <a
              href={url}
              className="btn small"
              target="_blank"
              rel="noreferrer"
              download={url.endsWith(".ipynb") ? true : undefined}
            >
              {url.endsWith(".ipynb") ? "Tải notebook Python (.ipynb)" : "Mở tài liệu nguồn"} ↗
            </a>
          </p>
        )}
      </div>
    );
  if (!url)
    return (
      <p role="alert">
        Đường dẫn học liệu chưa hợp lệ. Hãy báo giáo viên để bổ sung nguồn.
      </p>
    );
  if (
    material.material_type === "image" ||
    material.material_type === "animation"
  )
    return (
      <figure className="learning-image">
        <img src={url} alt={material.title} />
        <figcaption>
          {material.material_type === "animation"
            ? "Sơ đồ động định tính; có thể mở tệp để xem rộng hơn."
            : material.title}
        </figcaption>
        <a href={url} target="_blank" rel="noreferrer">
          Mở hình ở kích thước đầy đủ ↗
        </a>
      </figure>
    );
  if (["lecture_video", "real_video"].includes(material.material_type))
    if (youtubeId(url)) return <YouTubeLearningVideo url={url} title={material.title} channel={material.metadata?.author} task={customPrompt || material.description} />;
  if (["lecture_video", "real_video"].includes(material.material_type))
    return (
      <div>
        {/\.(mp4|webm|mov)(?:\?|$)/i.test(url) ? (
          <video
            controls
            preload="metadata"
            src={url}
            aria-label={material.title}
            style={{ width: "100%" }}
          />
        ) : (
          <>
            <p>
              Video từ nguồn bên ngoài. Nhấn để xem trên trang của tác giả, sau
              đó quay lại ghi kết quả theo hướng dẫn.
            </p>
            <a
              href={url}
              className="btn primary"
              target="_blank"
              rel="noreferrer"
            >
              Xem video nguồn ↗
            </a>
          </>
        )}
      </div>
    );
  return (
    <div>
      {inferredLessonTag &&
        /^\/learning\/B2[1-5]-worksheet\.pdf$/i.test(url) && (
          <NuclearLearningNotebook
            key={inferredLessonTag}
            code={inferredLessonTag}
          />
        )}
      {url.endsWith(".pdf") && (
        <div style={{ marginTop: "12px", marginBottom: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
          <iframe
            src={url}
            title={material.title}
            style={{ width: "100%", height: "380px", border: "none", display: "block" }}
          />
        </div>
      )}
      <p style={{ marginTop: "12px" }}>
        <a
          href={url}
          className="btn"
          target="_blank"
          rel="noreferrer"
          download={url.endsWith(".ipynb") ? true : undefined}
        >
          {url.endsWith(".ipynb") ? "Tải notebook Python" : "Mở tài liệu nguồn"}{" "}
          ↗
        </a>
      </p>
      {url.endsWith(".ipynb") && (
        <p>
          Mở tệp bằng Jupyter hoặc chọn Tải lên notebook trong Google Colab.
          Notebook có dữ liệu mẫu, công thức và hướng dẫn đọc kết quả.
        </p>
      )}
    </div>
  );
}
