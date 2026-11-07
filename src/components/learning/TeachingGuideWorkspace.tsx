"use client";
import { useState } from "react";
import Link from "next/link";
import data from "@/data/teaching-guides.json";
export function TeachingGuideWorkspace({
  code,
  remediation = false,
}: {
  code: string;
  remediation?: boolean;
}) {
  const guide = data.guides.find((g) => g.code === code);
  const [notes, setNotes] = useState<Record<number, string>>({});
  if (!guide) return <p>Không tìm thấy hướng dẫn.</p>;
  return (
    <section className="teaching-guide">
      {!remediation && (
        <>
          <h3>Mục tiêu và tổ chức hoạt động</h3>
          <ul>
            {guide.goals.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
          <p>{guide.approach}</p>
          <h4>Phân hóa</h4>
          <p>{guide.support}</p>
          <h4>Sản phẩm cần quan sát</h4>
          <p>{guide.product}</p>
          <Link
            className="btn primary"
            href={`/hoc-lieu/soan-ke-hoach?template=${code}`}
          >
            Dùng mẫu này để soạn kế hoạch
          </Link>
        </>
      )}
      <h3>Sửa lỗi thường gặp</h3>
      <p>
        Viết cách hiểu của em trước khi mở phần đối chiếu. Bản ghi chỉ giữ trong
        phiên này.
      </p>
      {guide.misconceptions.map(([wrong, explanation], i) => (
        <article className="exam-question" key={wrong}>
          <h4>Nhận định cần sửa: {wrong}</h4>
          <label>
            Cách hiểu và hành động sửa của em
            <textarea
              rows={3}
              maxLength={3000}
              value={notes[i] ?? ""}
              onChange={(e) =>
                setNotes((previous) => ({ ...previous, [i]: e.target.value }))
              }
            />
          </label>
          <details>
            <summary>Mở hướng dẫn đối chiếu</summary>
            <p>{explanation}</p>
          </details>
        </article>
      ))}
      <a
        className="btn"
        href={`/learning/guides/${code}.html`}
        target="_blank"
        rel="noreferrer"
      >
        Mở hướng dẫn và phiếu để in
      </a>
    </section>
  );
}
export function SelfLearningRubric() {
  const [levels, setLevels] = useState<Record<string, string>>({});
  const [evidence, setEvidence] = useState<Record<string, string>>({});
  function download() {
    const text = [
      "Phiếu phản tư năng lực tự học",
      "Khung đề xuất, chưa là thang đo đã kiểm định.",
      ...data.rubric.map(
        (r) =>
          `${r.title}\nMức: ${levels[r.id] || "Chưa chọn"}\nBằng chứng: ${evidence[r.id] || "Chưa ghi"}`,
      ),
    ].join("\n\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "phan-tu-tu-hoc.txt";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section>
      <p>
        Ghi mức biểu hiện kèm bằng chứng để trao đổi với giáo viên. Phiếu này
        chưa được kiểm định để đo tác động nghiên cứu. Bản ghi giữ trong phiên;
        tải xuống để lưu.
      </p>
      {data.rubric.map((r) => (
        <article className="exam-question" key={r.id}>
          <h3>{r.title}</h3>
          <p>{r.evidence}</p>
          <label>
            Mức biểu hiện
            <select
              value={levels[r.id] ?? ""}
              onChange={(e) =>
                setLevels((previous) => ({
                  ...previous,
                  [r.id]: e.target.value,
                }))
              }
            >
              <option value="">Chưa chọn</option>
              {r.levels.map((l, i) => (
                <option value={String(i + 1)} key={l}>
                  {i + 1}. {l}
                </option>
              ))}
            </select>
          </label>
          <label>
            Bằng chứng và điều sẽ điều chỉnh
            <textarea
              rows={3}
              maxLength={3000}
              value={evidence[r.id] ?? ""}
              onChange={(e) =>
                setEvidence((previous) => ({
                  ...previous,
                  [r.id]: e.target.value,
                }))
              }
            />
          </label>
        </article>
      ))}
      <div className="planning-actions">
        <button className="btn primary" onClick={download}>
          Tải phiếu đã ghi
        </button>
        <a
          className="btn"
          href="/learning/guides/self-learning-rubric.html"
          target="_blank"
          rel="noreferrer"
        >
          Mở phiếu để in
        </a>
      </div>
    </section>
  );
}
