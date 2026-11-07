import "server-only";
import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NuclearPhysicsLessonCode } from "./curriculum";
import { LEARNING_PHASES } from "./learning-phases";
import { CANONICAL_SYSTEM_MATERIALS } from "./material-bank";
import { formatLearningTask, NUCLEAR_SEQUENCES } from "./nuclear-learning-sequence";

type Closing = readonly [prompt: string, answer: string];
type Assessment = {
  prompt: string;
  options: readonly string[];
  correctAnswer: string;
  explanation: string;
  written: string;
  sampleAnswer: string;
};

const checks = {
  B21: {
    before: [["Carbon có bao nhiêu proton trong hạt nhân? Chỉ nhập số.", "6"], [String.raw`Trong \({}^{13}_{6}\mathrm{C}\), số khối là bao nhiêu? Chỉ nhập số.`, "13"]],
    during: [["Khi thêm một neutron vào carbon-12, số proton mới là bao nhiêu? Chỉ nhập số.", "6"], ["Hạt nhân carbon-13 có bao nhiêu neutron? Chỉ nhập số.", "7"]],
    final: { prompt: String.raw`Hạt nhân \({}^{18}_{8}\mathrm{O}\) có bao nhiêu neutron?`, options: ["8", "10", "18", "26"], correctAnswer: "10", explanation: String.raw`Số neutron là \(N=A-Z=18-8=10\).`, written: "Vì sao carbon-12 và carbon-13 là đồng vị của cùng nguyên tố?", sampleAnswer: "Cùng 6 proton nhưng có 6 và 7 neutron, nên số khối khác nhau." },
  },
  B22: {
    before: [["Ở mức hạt nhân, một neutron có số khối bao nhiêu? Chỉ nhập số.", "1"], ["Điện tích của neutron tính theo điện tích nguyên tố bằng bao nhiêu? Chỉ nhập số.", "0"]],
    during: [["Hạt alpha và nitơ-14 ở vế đầu có tổng số khối bao nhiêu? Chỉ nhập số.", "18"], ["Hạt alpha và nitơ-14 ở vế đầu có tổng số điện tích bao nhiêu? Chỉ nhập số.", "9"]],
    final: { prompt: "Trong phản ứng tổng hợp đơteri–triti tạo heli-4, hạt còn lại là gì?", options: ["Một proton", "Một neutron", "Một hạt alpha", "Một electron"], correctAnswer: "Một neutron", explanation: "Vế đầu có A bằng 5 và Z bằng 2. Heli-4 dùng 4 nucleon và mang 2 điện tích nguyên tố, nên hạt còn lại có A bằng 1, Z bằng 0.", written: "Vì sao khi so sánh năng lượng liên kết của các hạt nhân có A khác nhau, người ta xét năng lượng liên kết riêng?", sampleAnswer: "Chia năng lượng liên kết cho A để so sánh năng lượng liên kết trung bình trên một nucleon." },
  },
  B23: {
    before: [["Hạt alpha có bao nhiêu proton? Chỉ nhập số.", "2"], ["Số hạt theo kì vọng sau một chu kì bán rã của mẫu ban đầu 64 hạt là bao nhiêu? Chỉ nhập số.", "32"]],
    during: [["Sau hai chu kì, mẫu ban đầu 64 hạt còn kì vọng bao nhiêu hạt nhân mẹ? Chỉ nhập số.", "16"], ["Một becquerel tương ứng bao nhiêu phân rã mỗi giây? Chỉ nhập số.", "1"]],
    final: { prompt: "Độ phóng xạ của cùng một đồng vị còn một phần tư mức ban đầu. Đã qua bao nhiêu chu kì bán rã?", options: ["1", "2", "3", "4"], correctAnswer: "2", explanation: String.raw`Mỗi chu kì giảm một nửa nên \(\frac{H}{H_0}=\left(\frac12\right)^2\).`, written: "Giải thích vì sao hai mẫu có cùng số hạt ban đầu và cùng chu kì bán rã có thể cho số phân rã khác nhau trong cùng một khoảng đo.", sampleAnswer: "Mỗi phân rã là ngẫu nhiên. Định luật cho giá trị kì vọng của tập hợp, không đảm bảo từng mẫu có cùng số phân rã." },
  },
  B24: {
    before: [["Trong sơ đồ phát điện, hơi quay bộ phận nào? Nhập “tua-bin” hoặc “máy phát”.", "tua-bin"], ["Thanh điều khiển hấp thụ loại hạt nào? Nhập “proton” hoặc “neutron”.", "neutron"]],
    during: [["Trong sơ đồ, thiết bị nào chuyển cơ năng thành điện năng? Nhập “máy phát” hoặc “bộ sinh hơi”.", "máy phát"], ["Khâu đầu tiên giải phóng nhiệt trong lò là phân hạch hay ngưng tụ? Nhập “phân hạch” hoặc “ngưng tụ”.", "phân hạch"]],
    final: { prompt: "Vai trò trực tiếp của thanh điều khiển trong phản ứng dây chuyền là gì?", options: ["Làm quay tua-bin", "Hấp thụ neutron", "Ngưng tụ hơi", "Truyền điện ra lưới"], correctAnswer: "Hấp thụ neutron", explanation: "Hấp thụ neutron làm thay đổi số neutron còn có thể gây phân hạch tiếp.", written: "Chọn một ứng dụng của đồng vị phóng xạ và giải thích bức xạ được dùng vào việc gì.", sampleAnswer: "Ví dụ chẩn đoán hình ảnh dùng chất đánh dấu phát bức xạ; thiết bị ghi tín hiệu để tạo thông tin về chức năng hoặc phân bố trong cơ thể." },
  },
  B25: {
    before: [["Một ví dụ có độ phóng xạ ban đầu 80 Bq. Sau một chu kì, độ phóng xạ còn bao nhiêu Bq? Chỉ nhập số.", "40"], ["Becquerel là đơn vị của độ phóng xạ hay năng lượng? Nhập “độ phóng xạ” hoặc “năng lượng”.", "độ phóng xạ"]],
    during: [["Độ phóng xạ giảm từ 96 Bq xuống 48 Bq trong 20 giây. Chu kì bán rã là bao nhiêu giây? Chỉ nhập số.", "20"], ["Độ phóng xạ giảm từ 96 Bq xuống 12 Bq. Đã qua bao nhiêu chu kì? Chỉ nhập số.", "3"]],
    final: { prompt: "Độ phóng xạ giảm từ 80 Bq xuống 20 Bq trong 80 giây. Chu kì bán rã là bao nhiêu?", options: ["20 giây", "40 giây", "60 giây", "80 giây"], correctAnswer: "40 giây", explanation: "20 Bq là một phần tư của 80 Bq, tức hai chu kì trong 80 giây.", written: "Mô tả cách tự kiểm tra kết quả chu kì bán rã vừa tính bằng phép thế ngược.", sampleAnswer: "Hai chu kì 40 giây vừa đủ 80 giây; độ phóng xạ giảm từ 80 xuống 40 rồi xuống 20 Bq." },
  },
} satisfies Record<NuclearPhysicsLessonCode, { before: Closing[]; during: Closing[]; final: Assessment }>;

function stableRowId(lessonId: string, key: string) {
  const hash = createHash("sha256").update(`nuclear-sequence-v1:${lessonId}:${key}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

/** RLS and the caller's lesson ownership checks apply. Existing questions and edits are preserved. */
export async function prepareNuclearLesson(supabase: SupabaseClient, lessonId: string, code: NuclearPhysicsLessonCode) {
  const sequence = NUCLEAR_SEQUENCES[code];
  const lessonChecks = checks[code];
  const [steps, final, assessment] = await Promise.all([
    supabase.from("lesson_pathway_steps").select("phase,step_order,config").eq("lesson_id", lessonId),
    supabase.from("phase_final_questions").select("phase").eq("lesson_id", lessonId),
    supabase.from("phase_assessment_questions").select("id", { count: "exact", head: true }).eq("lesson_id", lessonId),
  ]);
  if (steps.error || final.error || assessment.error) throw new Error("Chưa đọc được tiến trình và câu hỏi hiện có.");

  const rows = LEARNING_PHASES.flatMap(phase => {
    const prior = (steps.data ?? []).filter(step => step.phase === phase);
    if (prior.some(step => step.config?.template_key === code)) return [];
    const materialId = phase === "before_class" ? `system-nuclear-video-${code.toLowerCase()}`
      : phase === "in_class" ? sequence.materialId : undefined;
    const material = materialId ? CANONICAL_SYSTEM_MATERIALS.find(item => item.id === materialId) : undefined;
    if (materialId && !material) throw new Error("Không tìm thấy học liệu chuẩn của bài.");
    const task = sequence.tasks[phase];
    return [{
      id: stableRowId(lessonId, phase),
      lesson_id: lessonId, phase, title: task.title, instructions: formatLearningTask(task),
      is_required: true, is_published: false, step_type: material?.material_type ?? "exercise",
      step_order: Math.max(0, ...prior.map(step => step.step_order)) + 1,
      config: { template_key: code, ...(material ? { canonical_material_id: material.id, content_url: material.content_url } : {}) },
    }];
  });
  const questionRows = (["before_class", "in_class"] as const).flatMap((phase) => {
    if (final.data?.some(row => row.phase === phase)) return [];
    return (phase === "before_class" ? lessonChecks.before : lessonChecks.during).map(([prompt, answer], index) => ({
      id: stableRowId(lessonId, `closing:${phase}:${index}`),
      lesson_id: lessonId, phase, question_text: prompt, correct_answer: answer, sort_order: index + 1,
    }));
  });
  const { final: quiz } = lessonChecks;
  const quizRows = assessment.count ? [] : [
    { id: stableRowId(lessonId, "quiz:1"), lesson_id: lessonId, question_type: "single_choice", difficulty: "thong_hieu",
      content: { prompt: quiz.prompt, options: quiz.options, correctAnswer: quiz.correctAnswer, explanation: quiz.explanation }, sort_order: 1, is_published: true },
    { id: stableRowId(lessonId, "quiz:2"), lesson_id: lessonId, question_type: "short_answer", difficulty: "van_dung",
      content: { prompt: quiz.written, sampleAnswer: quiz.sampleAnswer }, sort_order: 2, is_published: true },
  ];
  const results = await Promise.all([
    rows.length && supabase.from("lesson_pathway_steps").upsert(rows, { onConflict: "id", ignoreDuplicates: true }),
    questionRows.length && supabase.from("phase_final_questions").upsert(questionRows, { onConflict: "id", ignoreDuplicates: true }),
    quizRows.length && supabase.from("phase_assessment_questions").upsert(quizRows, { onConflict: "id", ignoreDuplicates: true }),
  ]);
  if (results.some(result => result && result.error)) throw new Error("Chưa lưu được đủ mẫu. Có thể thử lại; bản đã có được giữ nguyên.");
  return rows.length;
}
