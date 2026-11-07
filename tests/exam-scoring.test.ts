import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
// prettier-ignore
// @ts-expect-error Native Node TypeScript stripping requires the source extension.
import { gradeExam, gradeQuestion, numericResponse, type NuclearExam } from "../src/lib/exam-scoring.ts";
const exams = JSON.parse(
  readFileSync(
    new URL("../src/data/nuclear-exams.json", import.meta.url),
    "utf8",
  ),
) as NuclearExam[];
test("every topic paper totals 10, exposes 8 automatic and reserves 2 written points", () => {
  assert.equal(exams.length, 4);
  for (const exam of exams) {
    assert.equal(exam.questions.length, 18);
    assert.equal(new Set(exam.questions.map((q) => q.id)).size, 18);
    assert.ok(
      Math.abs(exam.questions.reduce((n, q) => n + q.points, 0) - 10) < 1e-8,
    );
    assert.equal(gradeExam(exam, {}).score, 0);
    const answers = Object.fromEntries(
      exam.questions.map((q) => [
        q.id,
        q.kind === "true_false"
          ? q.statements!.map((s) => String(s.answer))
          : String(q.answer ?? ""),
      ]),
    );
    const result = gradeExam(exam, answers);
    assert.equal(result.score, 8);
    assert.ok(Math.abs(result.automaticMax - 8) < 1e-8);
    assert.equal(result.writtenMax, 2);
    assert.ok(exam.questions.every((q) => exam.scope.includes(q.topic)));
    for (const q of exam.questions)
      if (q.rubric)
        assert.equal(
          q.rubric.reduce((n, r) => n + r.points, 0),
          q.points,
        );
  }
});
test("unanswered zero-index choice and blank numeric response cannot earn points", () => {
  assert.equal(
    gradeQuestion(
      {
        id: "x",
        kind: "choice",
        topic: "B21",
        level: "",
        prompt: "",
        points: 0.4,
        answer: 0,
      },
      "",
    ),
    0,
  );
  assert.equal(
    gradeQuestion(
      {
        id: "x",
        kind: "numeric",
        topic: "B21",
        level: "",
        prompt: "",
        points: 0.5,
        answer: 0,
      },
      " ",
    ),
    0,
  );
});
test("numeric answers accept decimal comma, reject units and infinity, and respect tolerance", () => {
  assert.equal(numericResponse("18,63"), 18.63);
  assert.equal(numericResponse("1e2"), 100);
  for (const value of ["", "Infinity", "NaN", "18 MeV", "0x10", "1,2,3"])
    assert.equal(numericResponse(value), null);
  const q = exams[0].questions.find((q) => q.kind === "numeric")!;
  assert.equal(
    gradeQuestion(q, String(q.answer! + (q.tolerance ?? 0.01))),
    0.5,
  );
  assert.equal(gradeQuestion(q, String(q.answer! + 1)), 0);
});
test("true-false awards per statement and does not turn unanswered into false", () => {
  const q = exams[0].questions.find((q) => q.kind === "true_false")!;
  assert.equal(gradeQuestion(q, [String(q.statements![0].answer)]), 0.25);
  assert.equal(gradeQuestion(q, []), 0);
  assert.equal(gradeQuestion(q, "false"), 0);
});
