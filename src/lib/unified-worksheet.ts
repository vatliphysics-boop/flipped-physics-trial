import { validateUnifiedQuestion, type UnifiedQuestion } from "./unified-question-bank";

export const WORKSHEET_PHASES = ["before_class", "in_class", "after_class"] as const;
export type WorksheetPhase = typeof WORKSHEET_PHASES[number];
export const WORKSHEET_PHASE_LABELS: Record<WorksheetPhase, string> = { before_class: "Trước giờ học", in_class: "Trong giờ học", after_class: "Sau giờ học" };
export type WorksheetSelection = { id: string; phase: WorksheetPhase };

export function resolveWorksheetQuestions(bank: UnifiedQuestion[], selections: WorksheetSelection[], lesson: string) {
  if (selections.length < 3 || selections.length > 9 || new Set(selections.map(s => s.id)).size !== selections.length) throw new Error("Chọn 3–9 câu khác nhau cho phiếu ba pha.");
  if (!WORKSHEET_PHASES.every(phase => selections.some(s => s.phase === phase))) throw new Error("Mỗi pha trước, trong và sau giờ học cần ít nhất một câu.");
  return selections.map(s => {
    const question = bank.find(q => q.id === s.id);
    if (!question || question.topic !== lesson || !WORKSHEET_PHASES.includes(s.phase)) throw new Error("Câu đã chọn không còn phù hợp bài hoặc pha học tập.");
    validateUnifiedQuestion(question);
    return { question, phase: s.phase };
  });
}
