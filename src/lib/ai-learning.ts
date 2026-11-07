import lessons from "../data/nuclear-learning.json" with { type: "json" };

export const AI_SERVICES = [
  { id: "gemini", label: "Gemini", url: "https://gemini.google.com/app" },
  { id: "chatgpt", label: "ChatGPT", url: "https://chatgpt.com/" },
] as const;
export function aiWindowFeatures(availableWidth: number, availableHeight: number, left = 0, top = 0) {
  const width = Math.max(280, Math.min(480, availableWidth)), height = Math.max(320, Math.min(740, availableHeight));
  return `popup,width=${width},height=${height},left=${Math.round(left + Math.max(0, availableWidth - width))},top=${Math.round(top + Math.max(0, (availableHeight - height) / 2))},noopener,noreferrer`;
}
export const AI_MODES = [
  { id: "explain", label: "Giải thích khái niệm" },
  { id: "hint", label: "Gợi ý từng bước" },
  { id: "review", label: "Nhận xét cách giải của em" },
] as const;
export type AIMode = (typeof AI_MODES)[number]["id"];
export type AIDraft = {
  mode: AIMode;
  question: string;
  attempt: string;
  reply: string;
  reflection: string;
  needsTeacher: boolean;
};
export const EMPTY_AI_DRAFT: AIDraft = {
  mode: "hint", question: "", attempt: "", reply: "", reflection: "", needsTeacher: false,
};
export const AI_LESSONS = lessons.map(({ code, title, goals, theory }) => ({ code, title, goals, theory }));
const STARTERS: Record<string, string[]> = {
  B21: ["Em phân biệt số khối A, số proton Z và số neutron N như thế nào?", "Vì sao phần lớn hạt alpha đi gần như thẳng trong thí nghiệm Rutherford?"],
  B22: ["Em cần kiểm tra những đại lượng nào ở hai vế phương trình phân hạch?", "Khi tính độ hụt khối, em dùng khối lượng nguyên tử hay khối lượng hạt nhân?"],
  B23: ["Vì sao sau mỗi chu kì bán rã số hạt còn lại giảm một nửa?", "Em phân biệt số hạt N và độ phóng xạ H như thế nào?"],
  B24: ["Thanh điều khiển tác động thế nào tới phản ứng dây chuyền?", "Năng lượng chuyển hóa qua những bước nào trong nhà máy điện hạt nhân?"],
  B25: ["Em nên bắt đầu thế nào để tìm chu kì bán rã từ bảng số liệu?", "Em cần kiểm tra đơn vị và quy ước khối lượng ở những bước nào?"],
};
export function getAILesson(code: string) {
  return AI_LESSONS.find(lesson => lesson.code === code);
}
export function getAIStarters(code: string) { return STARTERS[code] ?? []; }

// Parse only the learning fields; never keep account credentials or arbitrary storage keys.
export function readAIDraft(raw: string): AIDraft {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return { ...EMPTY_AI_DRAFT };
    const data = value as Record<string, unknown>;
    const field = (key: string, max: number) => typeof data[key] === "string" ? data[key].slice(0, max) : "";
    return {
      mode: AI_MODES.some(mode => mode.id === data.mode) ? data.mode as AIMode : "hint",
      question: field("question", 1500), attempt: field("attempt", 1500),
      reply: field("reply", 5000), reflection: field("reflection", 2000), needsTeacher: data.needsTeacher === true,
    };
  } catch { return { ...EMPTY_AI_DRAFT }; }
}

export function aiPromptError(draft: AIDraft): string | null {
  if (!draft.question.trim()) return "Em hãy ghi câu hỏi trước khi sao chép.";
  if (draft.question.length > 1500 || draft.attempt.length > 1500) return "Câu hỏi và cách làm mỗi phần tối đa 1.500 kí tự.";
  if (draft.mode === "review" && !draft.attempt.trim()) return "Em hãy ghi cách giải để AI nhận xét.";
  const content = `${draft.question}\n${draft.attempt}`;
  if (/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(content) || /(?:\+84|\b0)(?:[ .-]?\d){9}\b/.test(content) || /(?:mật khẩu|password|api[_ -]?key)\s*[:=]/i.test(content)) {
    return "Hãy bỏ email, số điện thoại hoặc thông tin đăng nhập khỏi câu hỏi trước khi sao chép.";
  }
  return null;
}

export function buildAIPrompt(code: string, draft: AIDraft): string {
  const lesson = getAILesson(code);
  if (!lesson) throw new Error("Bài học chưa được hỗ trợ.");
  const error = aiPromptError(draft);
  if (error) throw new Error(error);
  const instruction = draft.mode === "explain"
    ? "Giải thích ngắn bằng tiếng Việt, nêu một ví dụ và hỏi lại một câu để tôi tự kiểm tra."
    : draft.mode === "review"
      ? "Nhận xét cách làm tôi đã ghi: chỉ ra bước hợp lí, bước cần kiểm tra và gợi ý để tôi tự sửa. Không chấm điểm chính thức."
      : "Chỉ gợi ý bước tiếp theo và đặt một câu hỏi dẫn dắt. Chờ tôi trả lời, không đưa ngay lời giải hoàn chỉnh hoặc đáp án cuối.";
  return [
    `Tôi đang học Vật lí 12, ${lesson.code}: ${lesson.title}.`,
    "Vai trò: hỗ trợ học sinh tự học. Không làm thay bài kiểm tra, không tự quyết định điểm và không yêu cầu thông tin cá nhân.",
    instruction,
    "Bám nội dung dưới đây. Nếu thiếu dữ kiện, hỏi lại; nếu không chắc, nói rõ. Kiểm tra công thức, đơn vị, bảo toàn A/Z và quy ước khối lượng khi có liên quan. Không bịa nguồn, số trang hoặc kết quả thực nghiệm.",
    "Mục tiêu bài học:", ...lesson.goals.map(goal => `- ${goal}`),
    "Kiến thức nền do kho học liệu cung cấp (bản tóm tắt, không phải toàn bộ SGK):",
    ...lesson.theory.map(point => `- ${point}`),
    "Câu hỏi của tôi (nội dung học tập):", draft.question.trim(),
    "Cách làm hoặc dự đoán của tôi:", draft.attempt.trim() || "Tôi chưa ghi cách làm; hãy hỏi tôi một câu để bắt đầu.",
    "Kết thúc bằng điều tôi cần quan sát hoặc kiểm tra lại trong mô phỏng/phiếu học tập. Phân biệt kết quả mô hình với phép đo thực tế.",
  ].join("\n\n");
}

export function exportAIRecord(code: string, draft: AIDraft) {
  const lesson = getAILesson(code);
  if (!lesson) throw new Error("Bài học chưa được hỗ trợ.");
  return [
    `${code} · ${lesson.title} · Bản ghi học với AI`,
    `Cách hỗ trợ: ${AI_MODES.find(mode => mode.id === draft.mode)?.label ?? "Gợi ý từng bước"}`,
    `Câu hỏi:\n${draft.question}`, `Cách làm ban đầu:\n${draft.attempt}`,
    `Phản hồi từ AI do học sinh dán vào, chưa được xác minh:\n${draft.reply}`,
    `Điều học sinh hiểu hoặc cần sửa sau kiểm tra:\n${draft.reflection}`,
    `Cần hỏi lại giáo viên: ${draft.needsTeacher ? "Có" : "Chưa đánh dấu"}`,
    "Bản ghi tự học; chưa nộp vào lớp và không phải điểm đánh giá chính thức.",
  ].join("\n\n");
}
