"use client";

import { useState, useEffect, useActionState } from "react";
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
  const [members, setMembers] = useState<ClassMember[]>(initialMembers);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");
  const [refreshMessage, setRefreshMessage] = useState("");
  const [confirmCodeOpen, setConfirmCodeOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const [updateState, updateFormAction, updatePending] = useActionState<ManageClassState, FormData>(
    updateClassAction,
    {}
  );
  const [codeState, codeFormAction, codePending] = useActionState<ManageClassState, FormData>(
    regenerateJoinCodeAction,
    {}
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState<ManageClassState, FormData>(
    deleteClassAction,
    {}
  );
  const [removeState, removeFormAction, removePending] = useActionState<ManageClassState, FormData>(
    removeStudentFromClassAction,
    {}
  );

  useEffect(() => {
    if (removeState.removedStudentId) {
      setMembers((prev) => prev.filter((m) => m.student_id !== removeState.removedStudentId));
      setConfirmRemoveId(null);
    }
  }, [removeState.removedStudentId]);

  useEffect(() => {
    if (codeState.message || codeState.error) {
      setConfirmCodeOpen(false);
    }
  }, [codeState.message, codeState.error]);

  async function loadMembers(showFeedback = false) {
    setMembersLoading(true);
    setMembersError("");
    if (showFeedback) setRefreshMessage("");
    try {
      const result = await listClassMembersAction(classId);
      if (result.error) {
        setMembersError(result.error);
      } else {
        setMembers(result.members ?? []);
        if (showFeedback) {
          setRefreshMessage("Đã cập nhật danh sách học sinh mới nhất.");
        }
      }
    } catch {
      setMembersError("Không thể tải danh sách học sinh. Vui lòng thử lại.");
    } finally {
      setMembersLoading(false);
    }
  }

  const isAnyActionPending = updatePending || codePending || deletePending || removePending || membersLoading;

  return (
    <div className="class-management">
      {/* Khu vực 1: Thao tác quản lý lớp */}
      <div className="class-admin-panel">
        <div className="class-admin-panel-header">
          <div>
            <h3>Thao tác quản lý lớp</h3>
            <p>Cập nhật thông tin lớp, đóng/mở danh sách thành viên hoặc cấp lại mã tham gia mới.</p>
          </div>
        </div>

        {editing ? (
          <form action={updateFormAction} className="class-edit-form">
            <input type="hidden" name="class_id" value={classId} />
            <div className="form-field">
              <label htmlFor={`class-name-${classId}`}>Tên lớp học *</label>
              <input id={`class-name-${classId}`} name="name" defaultValue={name} required />
            </div>
            <div className="form-field">
              <label htmlFor={`class-description-${classId}`}>Mô tả lớp học</label>
              <textarea id={`class-description-${classId}`} name="description" defaultValue={description} rows={3} />
            </div>
            {updatePending && (
              <p className="form-alert form-alert-info" role="status">
                ⏳ Đang lưu thay đổi thông tin lớp học...
              </p>
            )}
            {updateState.error && (
              <p className="form-alert form-alert-error" role="alert">
                {updateState.error}
              </p>
            )}
            {updateState.message && (
              <p className="form-alert form-alert-success" role="status">
                ✓ {updateState.message}
              </p>
            )}
            <div className="class-management-actions">
              <button className="btn primary" type="submit" disabled={updatePending}>
                {updatePending ? "⏳ Đang lưu..." : "✓ Lưu thay đổi"}
              </button>
              <button className="btn" type="button" disabled={updatePending} onClick={() => setEditing(false)}>
                Hủy
              </button>
            </div>
          </form>
        ) : (
          <div className="class-management-actions">
            <button
              className="btn"
              type="button"
              onClick={() => setEditing(true)}
            >
              ✎ Chỉnh sửa
            </button>

            <button
              className={`btn member-management-toggle ${membersOpen ? "is-open" : ""}`}
              type="button"
              aria-expanded={membersOpen}
              onClick={() => {
                const nextOpen = !membersOpen;
                setMembersOpen(nextOpen);
                if (nextOpen) void loadMembers(false);
              }}
            >
              <span>{membersOpen ? "▲ Ẩn học sinh" : "👥 Quản lý học sinh"}</span>
              <span className="member-count">{members.length}</span>
            </button>

            {!confirmCodeOpen ? (
              <button
                className="btn"
                type="button"
                disabled={codePending}
                onClick={() => setConfirmCodeOpen(true)}
              >
                {codePending ? "⏳ Đang tạo mã..." : "↻ Tạo mã mới"}
              </button>
            ) : (
              <form action={codeFormAction} className="inline-confirm-bar" aria-label="Xác nhận tạo mã tham gia mới">
                <input type="hidden" name="class_id" value={classId} />
                <span className="inline-confirm-text">
                  Mã tham gia cũ sẽ ngừng hiệu lực. Tạo mã mới?
                </span>
                <div className="inline-confirm-actions">
                  <button className="btn primary small" type="submit" disabled={codePending}>
                    {codePending ? "Đang tạo..." : "Xác nhận tạo mã"}
                  </button>
                  <button
                    className="btn small"
                    type="button"
                    disabled={codePending}
                    onClick={() => setConfirmCodeOpen(false)}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Thông báo trạng thái thao tác quản lý */}
        {codePending && (
          <p className="form-alert form-alert-info" role="status" style={{ marginTop: "12px" }}>
            ⏳ Đang khởi tạo mã tham gia lớp mới...
          </p>
        )}
        {codeState.error && (
          <p className="form-alert form-alert-error" role="alert" style={{ marginTop: "12px" }}>
            {codeState.error}
          </p>
        )}
        {codeState.message && (
          <p className="form-alert form-alert-success" role="status" style={{ marginTop: "12px" }}>
            ✓ {codeState.message} {codeState.joinCode ? `(Mã mới: ${codeState.joinCode})` : ""}
          </p>
        )}
        {!editing && updateState.message && (
          <p className="form-alert form-alert-success" role="status" style={{ marginTop: "12px" }}>
            ✓ {updateState.message}
          </p>
        )}
      </div>

      {/* Khu vực 2: Danh sách học sinh trong lớp */}
      {membersOpen && (
        <section className="member-management-panel" aria-label="Quản lý học sinh">
          <div className="member-management-heading">
            <div className="member-heading-info">
              <div className="member-heading-title-row">
                <h4>Danh sách học sinh trong lớp</h4>
                <span className="badge small badge-blue">{members.length} học sinh</span>
              </div>
              <p>Theo dõi ngày tham gia và quản lý quyền truy cập của từng học sinh.</p>
            </div>
            <button
              className="btn small member-refresh"
              type="button"
              disabled={membersLoading}
              onClick={() => void loadMembers(true)}
            >
              {membersLoading ? "↻ Đang làm mới..." : "↻ Làm mới"}
            </button>
          </div>

          {membersLoading && (
            <p className="form-alert form-alert-info" role="status">
              ⏳ Đang tải danh sách học sinh mới nhất...
            </p>
          )}
          {refreshMessage && !membersLoading && !membersError && (
            <p className="form-alert form-alert-success" role="status">
              ✓ {refreshMessage}
            </p>
          )}
          {membersError && (
            <p className="form-alert form-alert-error" role="alert">
              {membersError}
            </p>
          )}
          {removePending && (
            <p className="form-alert form-alert-info" role="status">
              ⏳ Đang xử lý mời học sinh khỏi lớp...
            </p>
          )}
          {removeState.error && (
            <p className="form-alert form-alert-error" role="alert">
              {removeState.error}
            </p>
          )}
          {removeState.message && (
            <p className="form-alert form-alert-success" role="status">
              ✓ {removeState.message}
            </p>
          )}

          {members.length ? (
            <div className="member-list">
              {members.map((member, index) => {
                const displayName = member.full_name || "Học sinh chưa cập nhật tên";
                const joinedDateText = `Tham gia ngày ${new Date(member.joined_at).toLocaleDateString("vi-VN")}`;
                const isConfirmingRemove = confirmRemoveId === member.student_id;

                return (
                  <div className="member-row" key={member.student_id}>
                    <div className="member-info">
                      <span className="member-avatar" aria-hidden="true">
                        {index + 1}
                      </span>
                      <div className="member-meta">
                        <strong className="member-name">{displayName}</strong>
                        <span className="member-joined-date">{joinedDateText}</span>
                      </div>
                    </div>

                    <div className="member-actions">
                      {!isConfirmingRemove ? (
                        <button
                          className="btn small danger member-remove-btn"
                          type="button"
                          disabled={removePending}
                          onClick={() => setConfirmRemoveId(member.student_id)}
                        >
                          Mời khỏi lớp
                        </button>
                      ) : (
                        <form action={removeFormAction} className="member-remove-confirm">
                          <input type="hidden" name="class_id" value={classId} />
                          <input type="hidden" name="student_id" value={member.student_id} />
                          <span className="member-confirm-label">Xác nhận mời khỏi lớp?</span>
                          <button className="btn small danger" type="submit" disabled={removePending}>
                            {removePending ? "Đang xử lý..." : "Xác nhận"}
                          </button>
                          <button
                            className="btn small"
                            type="button"
                            disabled={removePending}
                            onClick={() => setConfirmRemoveId(null)}
                          >
                            Hủy
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="member-empty">Chưa có học sinh tham gia lớp này. Chia sẻ mã tham gia để học sinh vào lớp.</p>
          )}
        </section>
      )}

      {/* Khu vực 3 (Cuối cùng): Khu vực nguy hiểm — Xóa lớp */}
      <section className="class-danger-zone" aria-label="Xóa lớp học">
        <div className="class-danger-header">
          <div className="class-danger-copy">
            <h4>Xóa lớp học</h4>
            <p>
              Xóa vĩnh viễn lớp học này cùng mã tham gia và danh sách thành viên. Hành động này không thể hoàn tác.
            </p>
          </div>
          {!confirmDeleteOpen && (
            <button
              className="btn danger class-delete-trigger"
              type="button"
              disabled={deletePending || isAnyActionPending}
              onClick={() => setConfirmDeleteOpen(true)}
            >
              {deletePending ? "⏳ Đang xóa..." : "🗑️ Xóa lớp"}
            </button>
          )}
        </div>

        {confirmDeleteOpen && (
          <div
            className="danger-confirm-box"
            role="alertdialog"
            aria-modal="false"
            aria-label="Xác nhận xóa lớp học"
          >
            <p className="danger-confirm-warning">
              <strong>⚠️ Xác nhận xóa lớp &ldquo;{name}&rdquo;?</strong>
              <span>
                Hành động này không thể hoàn tác. Tất cả học sinh ({members.length} học sinh) sẽ mất quyền truy cập vào lớp học này.
              </span>
            </p>
            <form action={deleteFormAction} className="danger-confirm-actions">
              <input type="hidden" name="class_id" value={classId} />
              <button className="btn danger" type="submit" disabled={deletePending}>
                {deletePending ? "⏳ Đang xóa lớp..." : "🗑️ Xác nhận xóa vĩnh viễn"}
              </button>
              <button
                className="btn"
                type="button"
                disabled={deletePending}
                onClick={() => setConfirmDeleteOpen(false)}
              >
                Hủy
              </button>
            </form>
          </div>
        )}

        {deletePending && (
          <p className="form-alert form-alert-info" role="status" style={{ marginTop: "12px" }}>
            ⏳ Đang xóa lớp học và thu hồi quyền truy cập...
          </p>
        )}
        {deleteState.error && (
          <p className="form-alert form-alert-error" role="alert" style={{ marginTop: "12px" }}>
            {deleteState.error}
          </p>
        )}
        {deleteState.message && (
          <p className="form-alert form-alert-success" role="status" style={{ marginTop: "12px" }}>
            ✓ {deleteState.message}
          </p>
        )}
      </section>
    </div>
  );
}