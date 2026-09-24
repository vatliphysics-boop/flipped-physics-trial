"use client";

import { startTransition, useState, useEffect } from "react";
import { useActionState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SUPPORTED_VIDEO_EXTENSIONS, SUPPORTED_VIDEO_MIME_TYPES } from "@/lib/video-source";
import {
  createVideoMaterialAction,
  deleteVideoMaterialAction,
  toggleVideoMaterialAction,
  updateVideoMaterialAction,
  type LessonMaterialState,
} from "../../actions";

export type VideoMaterial = {
  id: string;
  title: string;
  description: string | null;
  content_url: string | null;
  duration_minutes: number | null;
  instructions: string | null;
  is_published: boolean;
  checkpoint_questions: { id: string; prompt: string; options: string[]; correctIndex: number; atPercent: number }[];
};

function VideoForm({ lessonId, material, onCancel }: { lessonId: string; material?: VideoMaterial; onCancel?: () => void }) {
  const action = material ? updateVideoMaterialAction : createVideoMaterialAction;
  const [state, formAction, pending] = useActionState<LessonMaterialState, FormData>(action, {});
  const initial = material?.checkpoint_questions?.length === 2 ? material.checkpoint_questions : [
    { id: "checkpoint-30", prompt: "Em hãy nêu ý chính tại mốc này.", options: ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"], correctIndex: 0, atPercent: 30 },
    { id: "checkpoint-80", prompt: "Kiến thức nào vừa được củng cố?", options: ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"], correctIndex: 0, atPercent: 80 },
    { id: "checkpoint-35", prompt: "Em hãy nêu ý chính tại mốc này.", options: ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"], correctIndex: 0, atPercent: 35 },
    { id: "checkpoint-75", prompt: "Kiến thức nào vừa được củng cố?", options: ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"], correctIndex: 0, atPercent: 75 },
  ];
  const [checkpoints, setCheckpoints] = useState(initial);
  const [sourceType, setSourceType] = useState(material?.content_url?.startsWith("storage:lesson-videos/") ? "upload" : "direct");
  const [fileName, setFileName] = useState("");
  const [uploadedContentUrl] = useState(material?.content_url?.startsWith("storage:lesson-videos/") ? material.content_url : "");
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const updateCheckpoint = (index: number, field: string, value: string | number) => setCheckpoints((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  const sanitizeFilename = (name: string) => {
    const extension = name.toLowerCase().match(/\.(mp4|webm|mov)$/)?.[0] ?? "";
    const base = name.slice(0, name.length - extension.length).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "video";
    return `${base}${extension}`;
  };
  const uploadSelectedVideo = async (file: File) => {
    const extension = `.${file.name.toLowerCase().split(".").pop() ?? ""}`;
    if (!SUPPORTED_VIDEO_EXTENSIONS.includes(extension as typeof SUPPORTED_VIDEO_EXTENSIONS[number]) || !SUPPORTED_VIDEO_MIME_TYPES.includes(file.type as typeof SUPPORTED_VIDEO_MIME_TYPES[number])) {
      throw new Error("Vui lòng chọn video MP4, WebM hoặc MOV đúng định dạng.");
    }
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    const path = `${user.id}/${lessonId}/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;
    const { error } = await supabase.storage.from("lesson-videos").upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(`Không thể tải video lên: ${error.message}`);
    return `storage:lesson-videos/${path}`;
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = form.querySelector<HTMLInputElement>('input[type="file"]')?.files?.[0];
    if (sourceType === "upload" && file) {
      setUploading(true);
      try {
        formData.set("content_url", await uploadSelectedVideo(file));
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Không thể tải video lên.");
        setUploading(false);
        return;
      }
      setUploading(false);
    } else if (sourceType === "upload") {
      formData.set("content_url", uploadedContentUrl);
    }
    startTransition(() => {
      formAction(formData);
    });
  };
  return (
    <form className="video-material-form" onSubmit={(event) => void handleSubmit(event)}>
      <input type="hidden" name="lesson_id" value={lessonId} />
      {material && <input type="hidden" name="id" value={material.id} />}
      <div className="video-form-grid">
        <div className="form-field video-form-full"><label htmlFor={`${material?.id ?? "new"}-title`}>Tiêu đề video</label><input id={`${material?.id ?? "new"}-title`} name="title" defaultValue={material?.title ?? ""} required /></div>
        <div className="form-field video-form-full"><label htmlFor={`${material?.id ?? "new"}-description`}>Mô tả ngắn</label><textarea id={`${material?.id ?? "new"}-description`} name="description" defaultValue={material?.description ?? ""} rows={3} /></div>
        <fieldset className="form-field video-form-full"><legend>Nguồn video</legend><div className="lesson-status-options"><label><input type="radio" name="video_source" value="upload" checked={sourceType === "upload"} onChange={() => { setSourceType("upload"); setUploadError(""); }} /> Tải video lên</label><label><input type="radio" name="video_source" value="direct" checked={sourceType === "direct"} onChange={() => { setSourceType("direct"); setUploadError(""); }} /> Link video trực tiếp</label></div>{sourceType === "upload" ? <div><input id={`${material?.id ?? "new"}-file`} type="file" accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} required={!material && !uploadedContentUrl} /><input type="hidden" name="content_url" value={uploadedContentUrl} /><p className="form-help">{fileName || (uploadedContentUrl ? "Đang dùng video Storage hiện tại." : "Chọn tệp video.")}</p><p className="form-help">Hỗ trợ MP4, WebM và MOV. Khuyến nghị MP4 để tương thích tốt nhất.</p></div> : <><input id={`${material?.id ?? "new"}-url`} name="content_url" type="url" placeholder="https://.../video.mp4" defaultValue={material?.content_url?.startsWith("storage:") ? "" : material?.content_url ?? ""} required /><p className="form-help">Hỗ trợ MP4, WebM và MOV. Khuyến nghị MP4 để tương thích tốt nhất.</p></>}</fieldset>
        <div className="form-field"><label htmlFor={`${material?.id ?? "new"}-duration`}>Thời lượng (phút)</label><input id={`${material?.id ?? "new"}-duration`} name="duration_minutes" type="number" min="1" step="1" defaultValue={material?.duration_minutes ?? ""} /></div>
        <div className="form-field video-form-full"><label htmlFor={`${material?.id ?? "new"}-instructions`}>Hướng dẫn trước khi xem</label><textarea id={`${material?.id ?? "new"}-instructions`} name="instructions" defaultValue={material?.instructions ?? ""} rows={3} /></div>
        <fieldset className="video-checkpoint-editor video-form-full"><legend>Hai checkpoint bắt buộc</legend><p className="form-help">Video sẽ tự dừng tại khoảng 35% và 75%. Học sinh phải trả lời đúng trước khi xem tiếp.</p>{checkpoints.map((checkpoint, index) => <div className="video-checkpoint-fields" key={checkpoint.id}><strong>Checkpoint {index + 1} · {checkpoint.atPercent}%</strong><input aria-label={`Câu hỏi checkpoint ${index + 1}`} value={checkpoint.prompt} onChange={(event) => updateCheckpoint(index, "prompt", event.target.value)} /><div className="checkpoint-option-grid">{checkpoint.options.map((option, optionIndex) => <input key={`${checkpoint.id}-${optionIndex}`} aria-label={`Đáp án ${optionIndex + 1} checkpoint ${index + 1}`} value={option} onChange={(event) => setCheckpoints((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, options: item.options.map((entry, entryIndex) => entryIndex === optionIndex ? event.target.value : entry) } : item))} />)}</div><label>Đáp án đúng<select value={checkpoint.correctIndex} onChange={(event) => updateCheckpoint(index, "correctIndex", Number(event.target.value))}>{checkpoint.options.map((_, optionIndex) => <option value={optionIndex} key={optionIndex}>Đáp án {optionIndex + 1}</option>)}</select></label></div>)}<input type="hidden" name="checkpoint_questions" value={JSON.stringify(checkpoints)} /></fieldset>
        <fieldset className="form-field video-form-full lesson-status-field"><legend>Trạng thái</legend><div className="lesson-status-options"><label><input type="radio" name="is_published" value="false" defaultChecked={!material?.is_published} /> Bản nháp</label><label><input type="radio" name="is_published" value="true" defaultChecked={material?.is_published} /> Xuất bản</label></div></fieldset>
      </div>
      {(uploadError || state.error) && <p className="form-alert form-alert-error">{uploadError || state.error}</p>}
      {state.message && <p className="form-alert form-alert-success">{state.message}</p>}
      <div className="video-form-actions"><button className="btn primary" type="submit" disabled={pending || uploading}>{uploading ? "Đang tải video..." : pending ? "Đang lưu..." : material ? "Lưu thay đổi" : "Thêm video"}</button>{onCancel && <button className="btn" type="button" onClick={onCancel}>Hủy</button>}</div>
    </form>
  );
}

export function VideoMaterialManager({ lessonId, materials, hideHeader }: { lessonId: string; materials: VideoMaterial[]; hideHeader?: boolean }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const handleOpen = () => { setAdding(true); setEditingId(null); };
    window.addEventListener("open-video-form", handleOpen);
    return () => window.removeEventListener("open-video-form", handleOpen);
  }, []);

  return (
    <div className="video-material-manager">
      {!hideHeader && <div className="video-section-heading"><div><span className="teacher-panel-kicker">HỌC LIỆU THỰC TẾ</span><h3>Video bài học</h3></div><button className="btn primary" type="button" onClick={() => { setAdding((value) => !value); setEditingId(null); }}>{adding ? "Đóng biểu mẫu" : "+ Thêm video"}</button></div>}
      {adding && <VideoForm lessonId={lessonId} onCancel={() => setAdding(false)} />}
      {!materials.length && !adding && <p className="video-empty">Chưa có video bài học.</p>}
      <div className="video-material-list">
        {materials.map((material) => editingId === material.id ? <VideoForm key={material.id} lessonId={lessonId} material={material} onCancel={() => setEditingId(null)} /> : <article className="video-material-card" key={material.id}>
          <div className="video-card-top"><span className="video-card-icon">▶</span><span className={`video-status ${material.is_published ? "video-status-published" : "video-status-draft"}`}>{material.is_published ? "Đã xuất bản" : "Bản nháp"}</span></div>
          <h4>{material.title}</h4><p>{material.description || "Chưa có mô tả."}</p>
          {material.duration_minutes && <span className="video-meta">Thời lượng: {material.duration_minutes} phút</span>}
          {material.instructions && <div className="video-instructions"><strong>Hướng dẫn</strong><p>{material.instructions}</p></div>}
          <div className="video-card-actions"><button className="btn" type="button" onClick={() => { setEditingId(material.id); setAdding(false); }}>Chỉnh sửa</button><form action={async (formData) => { await toggleVideoMaterialAction(formData); }}><input type="hidden" name="id" value={material.id} /><input type="hidden" name="lesson_id" value={lessonId} /><input type="hidden" name="is_published" value={String(!material.is_published)} /><button className="btn" type="submit">{material.is_published ? "Chuyển về bản nháp" : "Xuất bản"}</button></form><form action={async (formData) => { await deleteVideoMaterialAction({}, formData); }} onSubmit={(event) => { if (!window.confirm("Bạn có chắc muốn xóa video này không?")) event.preventDefault(); }}><input type="hidden" name="id" value={material.id} /><input type="hidden" name="lesson_id" value={lessonId} /><button className="btn danger" type="submit">Xóa</button></form></div>
        </article>)}
      </div>
    </div>
  );
}