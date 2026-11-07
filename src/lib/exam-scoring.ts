export type ExamQuestion = {
  id: string;
  kind: "choice" | "true_false" | "numeric" | "written";
  topic: string;
  level: string;
  prompt: string;
  points: number;
  options?: string[];
  answer?: number;
  unit?: string;
  tolerance?: number;
  explanation?: string;
  statements?: { text: string; answer: boolean; explanation: string }[];
  rubric?: { text: string; points: number }[];
};
export type NuclearExam = {
  id: string;
  title: string;
  kind: string;
  durationMinutes: number;
  scope: string[];
  instructions: string;
  questions: ExamQuestion[];
};
export type ExamResponses = Record<string, string | string[]>;
export function numericResponse(value: string): number | null {
  const text = value.trim().replace(",", ".");
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}
export function gradeQuestion(
  q: ExamQuestion,
  response?: string | string[],
): number {
  if (q.kind === "written") return 0;
  if (q.kind === "choice")
    return typeof response === "string" &&
      response !== "" &&
      Number(response) === q.answer
      ? q.points
      : 0;
  if (q.kind === "numeric") {
    const value =
      typeof response === "string" ? numericResponse(response) : null;
    return value !== null &&
      typeof q.answer === "number" &&
      Math.abs(value - q.answer) <= (q.tolerance ?? 0.01) + 1e-9
      ? q.points
      : 0;
  }
  const answers = Array.isArray(response) ? response : [];
  return (q.statements ?? []).reduce(
    (score, s, i) =>
      score +
      (answers[i] === String(s.answer)
        ? q.points / (q.statements?.length ?? 1)
        : 0),
    0,
  );
}
export function gradeExam(exam: NuclearExam, responses: ExamResponses) {
  const automatic = exam.questions.filter((q) => q.kind !== "written");
  return {
    score:
      Math.round(
        automatic.reduce((n, q) => n + gradeQuestion(q, responses[q.id]), 0) *
          100,
      ) / 100,
    automaticMax: automatic.reduce((n, q) => n + q.points, 0),
    writtenMax: exam.questions
      .filter((q) => q.kind === "written")
      .reduce((n, q) => n + q.points, 0),
  };
}
