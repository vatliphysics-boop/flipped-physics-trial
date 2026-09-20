"use client";

import { useState } from "react";
import { useActionState } from "react";
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
};

function VideoForm({ lessonId, material, onCancel }: { lessonId: string; material?: VideoMaterial; onCancel?: () => void }) {
  const action = material ? updateVideoMaterialAction : createVideoMaterialAction;
  const [state, formAction, pending] = useActionState<LessonMaterialState, FormData>(action, {});
  return (
    <form action={formAction} className="video-material-form">
      <input type="hidden" name="lesson_id" value={lessonId} />
      {material && <input type="hidden" name="id" value={material.id} />}
      <div className="video-form-grid">
        <div className="form-field video-form-full"><label htmlFor={`${material?.id ?? "new"}-title`}>Tiêu đề video</label><input id={`${material?.id ?? "new"}-title`} name="title" defaultValue={material?.title ?? ""} required /></div>
        <div className="form-field video-form-full"><label htmlFor={`${material?.id ?? "new"}-description`}>Mô tả ngắn</label><textarea id={`${material?.id ?? "new"}-description`} name="description" defaultValue={material?.description ?? ""} rows={3} /></div>
        <div className="form-field video-form-full"><label htmlFor={`${material?.id ?? "new"}-url`}>Link video</label><input id={`${material?.id ?? "new"}-url`} name="content_url" type="url" placeholder="https://..." defaultValue={material?.content_url ?? ""} required /></div>
        <div className="form-field"><label htmlFor={`${material?.id ?? "new"}-duration`}>Thời lượng (phút)</label><input id={`${material?.id ?? "new"}-duration`} name="duration_minutes" type="number" min="1" step="1" defaultValue={material?.duration_minutes ?? ""} /></div>
        <div className="form-field video-form-full"><label htmlFor={`${material?.id ?? "new"}-instructions`}>Hướng dẫn trước khi xem</label><textarea id={`${material?.id ?? "new"}-instructions`} name="instructions" defaultValue={material?.instructions ?? ""} rows={3} /></div>
        <fieldset className="form-field video-form-full lesson-status-field"><legend>Trạng thái</legend><div className="lesson-status-options"><label><input type="radio" name="is_published" value="false" defaultChecked={!material?.is_published} /> Bản nháp</label><label><input type="radio" name="is_published" value="true" defaultChecked={material?.is_published} /> Xuất bản</label></div></fieldset>
      </div>
      {state.error && <p className="form-alert form-alert-error">{state.error}</p>}
      {state.message && <p className="form-alert form-alert-success">{state.message}</p>}
      <div className="video-form-actions"><button className="btn primary" type="submit" disabled={pending}>{pending ? "Đang lưu..." : material ? "Lưu thay đổi" : "Thêm video"}</button>{onCancel && <button className="btn" type="button" onClick={onCancel}>Hủy</button>}</div>
    </form>
  );
}

export function VideoMaterialManager({ lessonId, materials }: { lessonId: string; materials: VideoMaterial[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  return (
    <div className="video-material-manager">
      <div className="video-section-heading"><div><span className="teacher-panel-kicker">HỌC LIỆU THỰC TẾ</span><h3>Video bài học</h3></div><button className="btn primary" type="button" onClick={() => { setAdding((value) => !value); setEditingId(null); }}>{adding ? "Đóng biểu mẫu" : "+ Thêm video"}</button></div>
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