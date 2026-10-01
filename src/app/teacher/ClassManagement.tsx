"use client";

import { useState, useActionState } from "react";
import {
  listClassMembersAction,
  removeStudentFromClassAction,
  deleteClassAction,
  regenerateJoinCodeAction,
  updateClassAction,
  type ClassMember,
  type ManageClassState,
} from "./actions";

type Props = {
  classId: string;
  name: string;
  description: string;
  initialMembers: ClassMember[];
  showMembersInitially?: boolean;
};

export function ClassManagement({
  classId,
  name,
  description,
  initialMembers,
  showMembersInitially = false,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [membersOpen, setMembersOpen] = useState(showMembersInitially);
  const [members, setMembers] = useState(initialMembers);
  const [membersError, setMembersError] = useState("");
  const [updateState, updateFormAction, updatePending] = useActionState<ManageClassState, FormData>(updateClassAction, {});
  const [codeState, codeFormAction, codePending] = useActionState<ManageClassState, FormData>(regenerateJoinCodeAction, {});
  const [deleteState, deleteFormAction, deletePending] = useActionState<ManageClassState, FormData>(deleteClassAction, {});
  const [removeState, removeFormAction, removePending] = useActionState<ManageClassState, FormData>(removeStudentFromClassAction, {});

  async function loadMembers() {
    const result = await listClassMembersAction(classId);
    if (result.error) setMembersError(result.error);
    else {
      setMembers(result.members ?? []);
      setMembersError("");
    }
  }

  return (
    <div className="class-management">
      {editing ? (
        <form action={updateFormAction} className="class-edit-form">
          <input type="hidden" name="class_id" value={classId} />
          <div className="form-field">
            <label htmlFor={`class-name-${classId}`}>Tên lớp</label>
            <input id={`class-name-${classId}`} name="name" defaultValue={name} required />
          </div>
          <div className="form-field">
            <label htmlFor={`class-description-${classId}`}>Mô tả</label>
            <textarea id={`class-description-${classId}`} name="description" defaultValue={description} rows={3} />
          </div>
          {updateState.error && <p className="form-alert form-alert-error">{updateState.error}</p>}
          {updateState.message && <p className="form-alert form-alert-success">{updateState.message}</p>}
          <div className="class-management-actions">
            <button className="btn primary" type="submit" disabled={updatePending}>{updatePending ? "Đang lưu..." : "Lưu thay đổi"}</button>
            <button className="btn" type="button" onClick={() => setEditing(false)}>Hủy</button>
          </div>
        </form>
      ) : (
        <>
          <div className="class-management-actions">
            <button className="btn" type="button" onClick={() => setEditing(true)}>Chỉnh sửa</button>
            <button className="btn member-management-toggle" type="button" onClick={() => {
              setMembersOpen((open) => !open);
              if (!membersOpen) void loadMembers();
            }}>
              {membersOpen ? "Ẩn học sinh" : "Quản lý học sinh"} <span className="member-count">{members.length}</span>
            </button>
            <form action={codeFormAction} onSubmit={(event) => {
              if (!window.confirm("Mã lớp cũ sẽ ngừng hoạt động. Bạn có chắc muốn tạo mã mới không?")) event.preventDefault();
            }}>
              <input type="hidden" name="class_id" value={classId} />
              <button className="btn" type="submit" disabled={codePending}>{codePending ? "Đang tạo..." : "Tạo mã mới"}</button>
            </form>
          </div>
          <div style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px dashed var(--border-light)" }}>
            <form action={deleteFormAction} onSubmit={(event) => {
              if (!window.confirm("⚠️ Bạn có chắc muốn XÓA LỚP này?\n\nHành động này không thể hoàn tác. Tất cả học sinh sẽ mất quyền truy cập lớp.")) event.preventDefault();
            }}>
              <input type="hidden" name="class_id" value={classId} />
              <button className="btn danger" type="submit" disabled={deletePending}>
                {deletePending ? "Đang xóa..." : "🗑️ Xóa lớp"}
              </button>
            </form>
          </div>
        </>
      )}
      {membersOpen && (
        <section className="member-management-panel" aria-label="Quản lý học sinh">
          <div className="member-management-heading">
            <div>
              <h4>Học sinh trong lớp</h4>
              <p>{members.length} học sinh</p>
            </div>
            <button className="member-refresh" type="button" onClick={() => void loadMembers()}>Làm mới</button>
          </div>
          {membersError && <p className="form-alert form-alert-error">{membersError}</p>}
          {removeState.error && <p className="form-alert form-alert-error">{removeState.error}</p>}
          {removeState.message && <p className="form-alert form-alert-success">{removeState.message}</p>}
          {members.length ? (
            <div className="member-list">
              {members.map((member) => (
                <div className="member-row" key={member.student_id}>
                  <div>
                    <strong>{member.full_name || "Học sinh chưa cập nhật tên"}</strong>
                    <span>Tham gia ngày {new Date(member.joined_at).toLocaleDateString("vi-VN")}</span>
                  </div>
                  <form action={removeFormAction} onSubmit={(event) => {
                    if (!window.confirm("Bạn có chắc muốn mời học sinh này khỏi lớp?")) event.preventDefault();
                  }}>
                    <input type="hidden" name="class_id" value={classId} />
                    <input type="hidden" name="student_id" value={member.student_id} />
                    <button className="btn danger" type="submit" disabled={removePending}>Mời khỏi lớp</button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="member-empty">Chưa có học sinh tham gia lớp này.</p>
          )}
        </section>
      )}
      {codeState.error && <p className="form-alert form-alert-error">{codeState.error}</p>}
      {codeState.message && <p className="form-alert form-alert-success">{codeState.message}</p>}
      {deleteState.error && <p className="form-alert form-alert-error">{deleteState.error}</p>}
      {deleteState.message && <p className="form-alert form-alert-success">{deleteState.message}</p>}
    </div>
  );
}