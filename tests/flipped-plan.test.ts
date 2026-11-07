import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Native Node uses the TypeScript extension.
import { validateTeachingPlan, studentPlanInstruction, planToHtml, type TeachingPlan } from "../src/lib/teaching-plan.ts";
// @ts-expect-error Native Node uses the TypeScript extension.
import { FLIPPED_FORMS, FLIPPED_ROLE_GUIDES, HD_LEARNING_TYPES } from "../src/lib/flipped-classroom.ts";
function sample(): TeachingPlan {
  return { version: 1, id: "draft", title: "Mẫu", lessonCode: "B24", classContext: "", goals: "Lập luận", preparation: "Nguồn", reflection: "", updatedAt: "", flippedForm: "discussion", activities: [{ id: "a", phase: "in_class", title: "Thảo luận", minutes: 30, objective: "Dùng bằng chứng", instructions: "Tổ chức nhóm", teacherActions: "Ghi chú riêng cho giáo viên <script>", studentActions: "Nêu lập luận và phản biện", product: "Bảng lập luận", evaluation: "Có nguồn", support: "Dùng phiếu", resources: [] }] };
}
test("plan round-trip keeps form and both roles while rejecting malformed optional fields", () => {
  const plan = sample();
  assert.deepEqual(validateTeachingPlan(JSON.parse(JSON.stringify(plan))).plan, plan);
  for (const change of [{ flippedForm: "virtual" }, { flippedForm: { id: "discussion" } }]) assert.ok(validateTeachingPlan({ ...plan, ...change }).error);
  for (const value of [42, "x".repeat(4001)]) assert.ok(validateTeachingPlan({ ...plan, activities: [{ ...plan.activities[0], teacherActions: value }] }).error);
});
test("student task includes requirements but excludes private teacher directions", () => {
  const plan = sample(), task = studentPlanInstruction(plan.activities[0]);
  for (const value of ["Nêu lập luận và phản biện", "Bảng lập luận", "Có nguồn"]) assert.ok(task.includes(value));
  assert.ok(!task.includes("Ghi chú riêng"));
  delete plan.activities[0].studentActions;
  assert.ok(studentPlanInstruction(plan.activities[0]).includes("Tổ chức nhóm"));
  const html = planToHtml(plan);
  assert.ok(html.includes("Giáo viên:")); assert.ok(html.includes("Thảo luận")); assert.ok(!html.includes("<script>"));
});
test("chosen forms have paired roles and products in all three phases; hd inventory has nine distinct items", () => {
  assert.equal(FLIPPED_FORMS.length, 4);
  for (const form of FLIPPED_FORMS) for (const phase of ["before_class", "in_class", "after_class"] as const) {
    const row = FLIPPED_ROLE_GUIDES[form.id][phase];
    assert.ok(row.teacher.trim() && row.student.trim() && row.evidence.trim());
  }
  assert.equal(HD_LEARNING_TYPES.length, 9);
  assert.equal(new Set(HD_LEARNING_TYPES.map(i => i.resource)).size, 9);
});
