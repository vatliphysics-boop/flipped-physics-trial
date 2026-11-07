import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
// @ts-expect-error Native Node test runner needs the source extension.
import { makeExamVersions, selectExamQuestions, validateBankQuestion, parseImportedQuestions, examMatrix, type BankQuestion, type ExamRecipe } from "../src/lib/teacher-assessment.ts";
// @ts-expect-error Native Node test runner needs the source extension.
import { preparationActivity, validatePreparationInput, checkPreparationPlan, PREPARATION_ISSUES, resolvePreparationChoice } from "../src/lib/teacher-preparation.ts";
// @ts-expect-error Native Node test runner needs the source extension.
import { checkBrowserDocx } from "../src/lib/teacher-docx-import.ts";
import type { TeachingPlan } from "../src/lib/teaching-plan";
const illustrated = JSON.parse(readFileSync(new URL("../src/data/illustrated-questions.json", import.meta.url), "utf8")) as BankQuestion[];
const recipe: ExamRecipe = { title: "Đề thử", type: "final", topics: ["B21", "B22", "B23", "B24", "B25"], count: 20, versions: 8, seed: "verification-05", withImages: true };
test("bank pictures are available and all question keys and total scores are valid", () => {
  const assets = JSON.parse(readFileSync(new URL("../src/data/question-images.json", import.meta.url), "utf8"));
  assert.equal(assets.length, 11); assert.equal(illustrated.length, 33);
  for (const q of illustrated) { validateBankQuestion(q); assert.ok(assets.some((i: { id: string; lesson: string }) => i.id === q.imageId && i.lesson === q.topic)); }
  for (const a of assets) { const png = readFileSync(new URL(`../public${a.url}`, import.meta.url)); assert.equal(png.subarray(1, 4).toString(), "PNG"); }
  const selected = selectExamQuestions(illustrated, recipe);
  assert.equal(selected.reduce((n, q) => n + q.points, 0), 10);
  for (const t of recipe.topics) assert.equal(selected.filter(q => q.topic === t).length, 4);
  assert.equal(examMatrix(selected).reduce((n, r) => n + r.images, 0), 20);
});
test("eight shuffled versions preserve stems, pictures and correct answer text", () => {
  const selected = selectExamQuestions(illustrated, recipe), original = JSON.stringify(selected), versions = makeExamVersions(selected, 8, recipe.seed);
  assert.deepEqual(versions, makeExamVersions(selected, 8, recipe.seed));
  assert.equal(new Set(versions.map(v => JSON.stringify(v.questions.map(q => [q.id, q.options])))).size, 8);
  for (const v of versions) for (const q of v.questions) { const base = selected.find(s => s.id === q.id)!; assert.equal(q.options![q.answer!], base.options![base.answer!]); assert.equal(q.imageId, base.imageId); assert.equal(q.points, base.points); assert.equal(q.prompt, base.prompt); }
  assert.equal(JSON.stringify(selected), original);
});
test("options referring to labels are left intact and insufficient variations fail explicitly", () => {
  const q = { ...illustrated[0], options: ["A và B", "Đáp án C", "Khác", "Tất cả các đáp án"], answer: 2 };
  assert.deepEqual(makeExamVersions([q], 1, "a")[0].questions[0].options, q.options);
  assert.throws(() => makeExamVersions([q], 2, "a"), /Không đủ cách đảo/);
  assert.throws(() => makeExamVersions([illustrated[0]], 9, "a"));
});
test("selection never silently substitutes a question when a scope/image pool is insufficient", () => {
  assert.throws(() => selectExamQuestions(illustrated, { ...recipe, count: 40 }), /chưa đủ câu/);
  assert.throws(() => selectExamQuestions(illustrated, { ...recipe, topics: [] }));
  assert.throws(() => validateBankQuestion({ ...illustrated[0], answer: 9 }));
});
test("import requires all options and answer keys and retains picture markers for reviewed pairing", () => {
  const source = "Câu 1. Xác định N. [[HINH:import-image-1]]\nA. 6\nB. 8\nC. 12\nD. 14\nĐáp án: B";
  const parsed = parseImportedQuestions(source, "B21"); assert.equal(parsed.questions[0].answer, 1); assert.match(parsed.questions[0].prompt, /import-image-1/);
  assert.throws(() => parseImportedQuestions(source.replace("Đáp án: B", ""), "B21"), /thiếu đáp án/);
  assert.throws(() => parseImportedQuestions(source.replace("D. 14", ""), "B21"), /thiếu.*lựa chọn D/);
  assert.throws(() => checkBrowserDocx(new Uint8Array(30)), /không hợp lệ/);
});
test("teacher observations cannot exceed the checked class and public AI context accepts no private text", () => {
  const input = { lesson: "B23", issueId: "B23-half-life", minutes: 10, device: "groups", total: 40, affected: 12 };
  assert.equal(validatePreparationInput(input).affected, 12);
  for (const extra of [{ affected: 41 }, { affected: -1 }, { issueId: "B22-binding" }, { text: "private" }]) assert.throws(() => validatePreparationInput({ ...input, ...extra }));
});
test("targeted activity attaches only existing matching resources and plan audit separates class time", () => {
  const resources = [{ id: "system-sim-half-life", title: "Bán rã", url: "activity:half_life", type: "simulation" as const }, { id: "unrelated", title: "Khác", url: "/x", type: "image" as const }];
  const a = preparationActivity({ lesson: "B23", issueId: "B23-half-life", device: "projector", minutes: 10 }, resources);
  assert.deepEqual(a.resources.map(r => r.id), ["system-sim-half-life"]); assert.match(a.instructions, /máy chiếu/); assert.match(a.teacherActions!, /75%/); assert.ok(!a.studentActions!.includes("75%"));
  const plan: TeachingPlan = { version: 1, id: "test", title: "Test", lessonCode: "B23", goals: "Kiểm tra", classContext: "", preparation: "", reflection: "", updatedAt: "", activities: [a, { ...a, id: "b", phase: "before_class", minutes: 20 }] };
  const audit = checkPreparationPlan(plan, 45); assert.ok(audit.some(c => c.id === "after_class")); assert.ok(audit.some(c => c.message.includes("10/45")));
  assert.equal(PREPARATION_ISSUES.length, 10);
});

test("AI selection cannot introduce numerical facts or choices outside the authored scenarios", () => {
  const input = { lesson: "B23", issueId: "B23-half-life", device: "groups" as const, minutes: 10 };
  const reply = resolvePreparationChoice(input, { questionIds: ["Q1", "Q2"], supportId: "S1", inventedData: 80000 });
  assert.match(reply, /N₀ = 800,/); assert.ok(!reply.includes("80000"));
  assert.throws(() => resolvePreparationChoice(input, { questionIds: ["Q1", "Q9"], supportId: "S1" }));
  assert.throws(() => resolvePreparationChoice(input, { questionIds: ["Q1", "Q1"], supportId: "S1" }));
  const pointImport = parseImportedQuestions("Câu 1. (0,5 điểm) Tính N.\nA. 1\nB. 2\nC. 3\nD. 4\nĐáp án: B", "B21").questions[0];
  assert.equal(pointImport.points, .5); assert.equal(pointImport.prompt, "Tính N.");
});
