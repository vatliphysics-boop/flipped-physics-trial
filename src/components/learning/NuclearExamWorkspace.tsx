"use client";
import { useEffect, useState } from "react";
import papers from "@/data/nuclear-exams.json";
import {
  gradeExam,
  gradeQuestion,
  type ExamResponses,
  type NuclearExam,
} from "@/lib/exam-scoring";

export function NuclearExamWorkspace({ examId }: { examId: string }) {
  const exam = papers.find((p) => p.id === examId) as NuclearExam | undefined;
  const [responses, setResponses] = useState<ExamResponses>({});
  const [start, setStart] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (start === null || !exam || submitted) return;
    const timer = setInterval(() => {
      const seconds = Math.max(
        0,
        Math.ceil((start + exam.durationMinutes * 60000 - Date.now()) / 1000),
      );
      setRemaining(seconds);
      if (!seconds) setSubmitted(true);
    }, 1000);
    return () => clearInterval(timer);
  }, [start, exam, submitted]);
  if (!exam) return <p role="alert">Không tìm thấy đề kiểm tra.</p>;
  const result = gradeExam(exam, responses);
  function begin() {
    setResponses({});
    setSubmitted(false);
    setRemaining(exam!.durationMinutes * 60);
    setStart(Date.now());
  }
  function answer(id: string, value: string | string[]) {
    if (!submitted) setResponses((previous) => ({ ...previous, [id]: value }));
  }
  function downloadRecord() {
    const text = [
      exam!.title,
      `Tự luyện: ${result.score}/${result.automaticMax} điểm tự động. Tự luận ${result.writtenMax} điểm chưa chấm.`,
      ...exam!.questions.map(
        (q, i) =>
          `Câu ${i + 1}: ${q.prompt}\nTrả lời: ${Array.isArray(responses[q.id]) ? (responses[q.id] as string[]).join("; ") : (responses[q.id] ?? "Chưa trả lời")}\n${q.kind === "written" ? "Tự luận chưa chấm" : `${gradeQuestion(q, responses[q.id])}/${q.points} điểm`}`,
      ),
    ].join("\n\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exam!.id}-ban-lam.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section className="exam-workspace" aria-label={exam.title}>
      <p>{exam.instructions}</p>
      <p>
        <strong>{exam.durationMinutes} phút · 18 câu · 10 điểm</strong> ·{" "}
        {exam.scope.join(", ")}
      </p>
      <div className="planning-actions">
        <a
          className="btn"
          href={`/learning/exams/${exam.id}.html`}
          target="_blank"
          rel="noreferrer"
        >
          Mở bản đề để in
        </a>
        <a className="btn" href={`/learning/exams/${exam.id}.html`} download>
          Tải bản đề HTML
        </a>
        <button className="btn primary" onClick={begin}>
          {start === null ? "Bắt đầu làm bài" : "Làm lại đề"}
        </button>
      </div>
      <p className="physics-note">
        Bài làm giữ trong phiên hiện tại. Tải lại trang sẽ xóa lượt làm. Đây là
        tự luyện; giáo viên chọn và điều chỉnh đề trước khi dùng trong lớp.
      </p>
      {start !== null && (
        <>
          <div className="exam-clock" role="status">
            {submitted
              ? "Đã kết thúc lượt làm"
              : `Còn ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`}
          </div>
          {submitted && (
            <div className="assessment-result" role="status">
              <strong>
                Phần tự động: {result.score.toFixed(2)} /{" "}
                {result.automaticMax.toFixed(2)} điểm.
              </strong>
              <p>
                Phần tự luận {result.writtenMax} điểm chưa chấm. Điểm kiến thức
                và phản tư dưới đây là thông tin tự luyện, chưa phải kết quả
                đánh giá năng lực tự học.
              </p>
              <button className="btn" onClick={downloadRecord}>
                Tải bài làm và kết quả
              </button>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            {exam.questions.map((q, i) => (
              <article className="exam-question" key={q.id}>
                <fieldset disabled={submitted}>
                  <legend>
                    <strong>
                      Câu {i + 1} · {q.points} điểm · {q.topic}
                    </strong>
                  </legend>
                  <p>{q.prompt}</p>
                  {q.kind === "choice" &&
                    q.options?.map((o, j) => (
                      <label className="exam-option" key={j}>
                        <input
                          type="radio"
                          name={q.id}
                          value={j}
                          checked={responses[q.id] === String(j)}
                          onChange={(e) => answer(q.id, e.target.value)}
                        />
                        <span>{String.fromCharCode(65 + j)}. {o}</span>
                      </label>
                    ))}
                  {q.kind === "true_false" &&
                    q.statements?.map((s, j) => (
                      <div className="exam-statement" key={j}>
                        <p>
                          {String.fromCharCode(97 + j)}. {s.text}
                        </p>
                        <label>
                          Chọn đúng hoặc sai
                          <select
                            aria-label={`Câu ${i + 1}, ý ${String.fromCharCode(97 + j)}`}
                            value={
                              Array.isArray(responses[q.id])
                                ? (responses[q.id][j] ?? "")
                                : ""
                            }
                            onChange={(e) => {
                              const values = Array.isArray(responses[q.id])
                                ? [...responses[q.id]]
                                : [];
                              values[j] = e.target.value;
                              answer(q.id, values);
                            }}
                          >
                            <option value="">Chưa trả lời</option>
                            <option value="true">Đúng</option>
                            <option value="false">Sai</option>
                          </select>
                        </label>
                      </div>
                    ))}
                  {q.kind === "numeric" && (
                    <label>
                      Đáp số ({q.unit})
                      <input
                        inputMode="decimal"
                        aria-label={`Đáp số câu ${i + 1} (${q.unit})`}
                        value={
                          typeof responses[q.id] === "string"
                            ? responses[q.id]
                            : ""
                        }
                        onChange={(e) => answer(q.id, e.target.value)}
                        placeholder="Nhập số, dùng dấu phẩy hoặc dấu chấm"
                      />
                    </label>
                  )}
                  {q.kind === "written" && (
                    <label>
                      Bài tự luận
                      <textarea
                        aria-label={`Bài tự luận câu ${i + 1}`}
                        rows={5}
                        maxLength={6000}
                        value={
                          typeof responses[q.id] === "string"
                            ? responses[q.id]
                            : ""
                        }
                        onChange={(e) => answer(q.id, e.target.value)}
                      />
                    </label>
                  )}
                </fieldset>
                {submitted && (
                  <div className="exam-feedback">
                    <strong>
                      {q.kind === "written"
                        ? "Hướng dẫn chấm tự luận"
                        : `${gradeQuestion(q, responses[q.id]).toFixed(2)} / ${q.points} điểm`}
                    </strong>
                    {q.kind === "choice" && (
                      <p>
                        Đáp án {String.fromCharCode(65 + (q.answer ?? 0))}:{" "}
                        {q.options?.[q.answer ?? 0]}. {q.explanation}
                      </p>
                    )}
                    {q.kind === "numeric" && (
                      <p>
                        Đáp án: {q.answer} {q.unit}, sai số ±{q.tolerance}.{" "}
                        {q.explanation}
                      </p>
                    )}
                    {q.statements?.map((s, j) => (
                      <p key={j}>
                        {String.fromCharCode(97 + j)}.{" "}
                        {s.answer ? "Đúng" : "Sai"}. {s.explanation}
                      </p>
                    ))}
                    {q.rubric && (
                      <ul>
                        {q.rubric.map((r, j) => (
                          <li key={j}>
                            {r.points} điểm: {r.text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </article>
            ))}
            {!submitted && (
              <button className="btn primary" type="submit">
                Kết thúc và xem lời giải
              </button>
            )}
          </form>
        </>
      )}
      <details className="exam-matrix">
        <summary>Ma trận, đáp án và hướng dẫn dùng cho giáo viên</summary>
        <p>
          Đề mẫu và đáp án được công khai để tự luyện. Khi kiểm tra chính thức,
          giáo viên cần biên soạn phiên bản riêng và tổ chức phù hợp kế hoạch
          của lớp.
        </p>
        <a
          className="btn"
          href={`/learning/exams/${exam.id}-answers.html`}
          target="_blank"
          rel="noreferrer"
        >
          Mở đáp án, rubric và ma trận
        </a>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Bài</th>
                <th>Nhận biết</th>
                <th>Thông hiểu</th>
                <th>Vận dụng</th>
                <th>Tổng điểm</th>
              </tr>
            </thead>
            <tbody>
              {exam.scope.map((code) => (
                <tr key={code}>
                  <th>{code}</th>
                  {["Nhận biết", "Thông hiểu", "Vận dụng"].map((level) => (
                    <td key={level}>
                      {exam.questions
                        .filter((q) => q.topic === code && q.level === level)
                        .map((q) => exam.questions.indexOf(q) + 1)
                        .join(", ") || "—"}
                    </td>
                  ))}
                  <td>
                    {exam.questions
                      .filter((q) => q.topic === code)
                      .reduce((n, q) => n + q.points, 0)
                      .toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
