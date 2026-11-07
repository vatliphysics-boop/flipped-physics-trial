"use client";
import { useState, useSyncExternalStore } from "react";
import { NUCLEAR_LEARNING_CONTENT } from "@/lib/nuclear-learning-content";
import { ChoiceCheck } from "@/components/physics/shared";

const subscribeDraft = (notify: () => void) => {
  window.addEventListener("storage", notify);
  return () => window.removeEventListener("storage", notify);
};
function download(text: string, filename: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
export function NuclearLearningNotebook({
  code,
  quizOnly = false,
}: {
  code: string;
  quizOnly?: boolean;
}) {
  const lesson = NUCLEAR_LEARNING_CONTENT.find((l) => l.code === code);
  const [edits, setEdits] = useState<Record<string, string> | null>(null),
    [status, setStatus] = useState("");
  const draftKey = `nuclear-notes-v1-${code}`;
  const stored = useSyncExternalStore(
    subscribeDraft,
    () => {
      try {
        return localStorage.getItem(draftKey) ?? "";
      } catch {
        return "";
      }
    },
    () => "",
  );
  let saved: Record<string, string> = {};
  try {
    const parsed: unknown = JSON.parse(stored || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
      saved = Object.fromEntries(
        Object.entries(parsed).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      );
  } catch {
    /* Ignore damaged browser drafts; the current response remains editable. */
  }
  const notes = edits ?? saved;
  function editNote(key: string, value: string) {
    const next = { ...notes, [key]: value };
    setEdits(next);
    try {
      localStorage.setItem(draftKey, JSON.stringify(next));
    } catch {
      setStatus(
        "Thiết bị chưa lưu được bản nháp. Em có thể tải bản ghi xuống.",
      );
    }
  }
  if (!lesson) return <p>Chưa có phiếu cho bài này.</p>;
  return (
    <div className="learning-notebook">
      {!quizOnly && (
        <>
          <h3>
            {lesson.code} · {lesson.title}
          </h3>
          <h4>Mục tiêu</h4>
          <ul>
            {lesson.goals.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
          <details open>
            <summary>Kiến thức cần đọc</summary>
            <ol>
              {lesson.theory.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          </details>
          {[
            ["before", "Trước giờ học", lesson.before],
            ["during", "Trong giờ học", lesson.during],
            ["after", "Sau giờ học", lesson.after],
          ].map(([phase, title, tasks]) => (
            <details key={phase as string} open>
              <summary>{title as string}</summary>
              {(tasks as string[]).map((task, i) => (
                <label className="notebook-task" key={task}>
                  <span>
                    {i + 1}. {task}
                  </span>
                  <textarea
                    value={notes[`${phase}-${i}`] ?? ""}
                    maxLength={4000}
                    rows={3}
                    onChange={(e) => editNote(`${phase}-${i}`, e.target.value)}
                    placeholder="Ghi dự đoán, số liệu, lời giải và điều cần sửa…"
                  />
                </label>
              ))}
            </details>
          ))}
          <button
            type="button"
            className="btn"
            onClick={() =>
              download(
                `${lesson.code} · ${lesson.title}\n\n${Object.entries(notes)
                  .map(([k, v]) => `${k}\n${v}`)
                  .join("\n\n")}`,
                `${code}-ban-ghi.txt`,
              )
            }
          >
            Tải bản ghi của em
          </button>
          <p className="physics-note">
            Bản nháp lưu trên trình duyệt của thiết bị này, chưa gửi giáo viên.
            Dùng phần nộp bài trong lớp học để gửi kết quả.
          </p>
          {status && <p role="status">{status}</p>}
        </>
      )}
      <h4>Tự chẩn đoán kiến thức</h4>
      {lesson.quiz.map((q) => (
        <ChoiceCheck
          key={q.question}
          question={q.question}
          options={q.options}
          correctIndex={q.answer}
          explanation={q.explanation}
        />
      ))}
      <p>
        <a href={lesson.source} target="_blank" rel="noreferrer">
          Nguồn đối chiếu kiến thức ↗
        </a>
      </p>
    </div>
  );
}

const ROLEPLAY_CRITERIA = [
  "Lập luận đúng khoa học: giải thích cơ chế hoặc tác động liên quan đến vai, không khẳng định lợi ích/rủi ro tuyệt đối.",
  "Bằng chứng truy nguyên được: ghi tên nguồn, đường dẫn và dữ kiện hỗ trợ từng nhận định; phân biệt giả định với dữ liệu thực tế.",
  "Giới hạn rõ: nêu điều kiện để lợi ích đạt được, rủi ro cần kiểm soát và điều chưa có dữ liệu; không tự dựng số liệu cho dự án giả định.",
  "Phản biện và tự điều chỉnh: ghi câu hỏi của vai khác, trả lời bằng căn cứ và sửa kết luận hoặc nêu điều cần kiểm chứng tiếp.",
];

export function NuclearGroupWorkspace({ kind }: { kind: string }) {
  const [fields, setFields] = useState<Record<string, string>>({}),
    [role, setRole] = useState("Nhà khoa học");
  const topics =
    kind === "mindmap"
      ? ["Năng lượng", "Y học", "Nông nghiệp", "Công nghiệp"]
      : [
          "Lập luận và bằng chứng",
          "Lợi ích dự kiến",
          "Giới hạn và điều chưa có dữ liệu",
          "Phản biện của nhóm khác và câu trả lời",
        ];
  return (
    <section className="group-workspace">
      <h3>
        {kind === "mindmap"
          ? "Bản đồ tư duy ứng dụng hạt nhân"
          : "Hội đồng thảo luận dự án điện hạt nhân giả định"}
      </h3>
      <p>
        Cùng nhóm thao tác trên một thiết bị. Tải bản ghi để chia sẻ hoặc nộp
        trong lớp học.
      </p>
      {kind !== "mindmap" && <div className="physics-note">
        <h4>Tiêu chí nhận xét sản phẩm đóng vai</h4>
        <ul>{ROLEPLAY_CRITERIA.map(criterion => <li key={criterion}>{criterion}</li>)}</ul>
        <p>Nhóm tự đối chiếu từng tiêu chí trước khi tải. Giáo viên xem bằng chứng trong bốn phần bên dưới, ghi tiêu chí đã đạt, nội dung cần sửa và cách sửa; đây là nhận xét học tập, không tự chấm điểm chính thức.</p>
      </div>}
      {kind !== "mindmap" && (
        <label>
          Vai của nhóm{" "}
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {[
              "Nhà khoa học",
              "Người dân địa phương",
              "Chuyên gia kinh tế",
              "Nhà môi trường",
            ].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
      )}
      <div className="workspace-grid">
        {topics.map((topic) => (
          <label className="notebook-task" key={topic}>
            <strong>{topic}</strong>
            <textarea
              rows={5}
              maxLength={4000}
              value={fields[topic] ?? ""}
              onChange={(e) =>
                setFields((v) => ({ ...v, [topic]: e.target.value }))
              }
              placeholder={
                kind === "mindmap"
                  ? "Cơ chế → ứng dụng → lợi ích → giới hạn → nguồn"
                  : "Nêu nhận định, lí do, nguồn và điều cần kiểm chứng"
              }
            />
          </label>
        ))}
      </div>
      <button
        type="button"
        className="btn"
        onClick={() =>
          download(
            `B24 · ${kind === "mindmap" ? "Bản đồ tư duy" : role}\n\n${kind === "mindmap" ? "" : `Tiêu chí nhận xét\n${ROLEPLAY_CRITERIA.map((criterion, i) => `${i + 1}. ${criterion}`).join("\n")}\n\n`}${topics.map((t) => `${t}\n${fields[t] ?? ""}`).join("\n\n")}`,
            `B24-${kind}-nhom.txt`,
          )
        }
      >
        Tải sản phẩm nhóm
      </button>
      <p className="physics-note">
        Nội dung đang nhập chỉ giữ trong phiên mở này; hãy tải bản ghi trước khi
        đóng.
      </p>
    </section>
  );
}

export function NuclearReviewGame() {
  const questions = NUCLEAR_LEARNING_CONTENT.flatMap((l) => l.quiz),
    [index, setIndex] = useState(0),
    [selected, setSelected] = useState<number | null>(null),
    [checked, setChecked] = useState(false),
    [scores, setScores] = useState([0, 0]);
  const q = questions[index],
    team = index % 2;
  return (
    <section className="review-game">
      <h3>Ôn tập hai đội · Dùng chung một thiết bị</h3>
      <p role="status">
        Đội A: {scores[0]} · Đội B: {scores[1]} · Lượt đội{" "}
        {team === 0 ? "A" : "B"} · Câu {index + 1}/{questions.length}
      </p>
      <fieldset disabled={checked}>
        <legend>{q.question}</legend>
        {q.options.map((o, i) => (
          <label key={o} className="game-option">
            <input
              type="radio"
              name="review-game"
              checked={selected === i}
              onChange={() => setSelected(i)}
            />
            {o}
          </label>
        ))}
      </fieldset>
      <button
        type="button"
        className="btn primary"
        disabled={selected === null || checked}
        onClick={() => {
          setChecked(true);
          if (selected === q.answer)
            setScores((v) => v.map((n, i) => (i === team ? n + 1 : n)));
        }}
      >
        Chốt đáp án
      </button>
      {checked && (
        <p role="status">
          {selected === q.answer ? "Đúng · +1 điểm. " : "Chưa đúng. "}
          {q.explanation}
        </p>
      )}
      {checked && index < questions.length - 1 && (
        <button
          className="btn"
          type="button"
          onClick={() => {
            setIndex((i) => i + 1);
            setSelected(null);
            setChecked(false);
          }}
        >
          Lượt tiếp theo
        </button>
      )}
      {checked && index === questions.length - 1 && (
        <p>
          Đã hoàn thành 15 câu. Hai đội cùng ghi lại nội dung cần ôn; đây là
          điểm tự luyện trong phiên.
        </p>
      )}
      <button
        type="button"
        className="btn"
        onClick={() => {
          setIndex(0);
          setScores([0, 0]);
          setSelected(null);
          setChecked(false);
        }}
      >
        Chơi lại
      </button>
    </section>
  );
}
