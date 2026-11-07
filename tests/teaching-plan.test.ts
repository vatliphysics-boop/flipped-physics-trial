import test from "node:test";
import assert from "node:assert/strict";
// prettier-ignore
// @ts-expect-error Native Node TypeScript stripping requires the source extension.
import { validateTeachingPlan, movePlanActivity, planToHtml, lessonPlanReview, type TeachingPlan, type PlanActivity } from "../src/lib/teaching-plan.ts";
const activity = (id: string, phase: PlanActivity["phase"]): PlanActivity => ({
  id,
  phase,
  title: "Khám phá",
  minutes: 15,
  objective: "Nêu mục tiêu",
  instructions: "Quan sát rồi giải thích",
  product: "Bảng ghi",
  evaluation: "Đối chiếu",
  support: "Theo nhóm",
  resources: [
    {
      id: "system-notes-B23",
      title: "Phiếu",
      url: "/learning/B23-worksheet.pdf",
      type: "document",
    },
  ],
});
const plan = (): TeachingPlan => ({
  version: 1,
  id: "unsaved",
  title: "Kế hoạch",
  lessonCode: "B23",
  classContext: "Nhóm dùng chung thiết bị",
  goals: "Đọc đồ thị",
  preparation: "Phiếu",
  reflection: "",
  updatedAt: "",
  activities: [
    activity("a", "before_class"),
    activity("b", "in_class"),
    activity("c", "before_class"),
  ],
});
test("plan import keeps educational fields and drops undeclared injected properties", () => {
  const value = {
    ...plan(),
    teacher_id: "another-teacher",
    is_published: true,
  };
  const checked = validateTeachingPlan(value);
  assert.deepEqual(checked.plan, plan());
  assert.ok(!("teacher_id" in checked.plan!));
});
test("plan import rejects unsafe URLs, duplicate activity IDs and unbounded time", () => {
  for (const url of [
    "javascript:alert(1)",
    "//evil.test",
    "/../secret",
    "https://user:pass@example.org",
    "/%2e%2e/secret",
  ]) {
    const value = plan();
    value.activities[0].resources[0].url = url;
    assert.ok(validateTeachingPlan(value).error);
  }
  const duplicate = plan();
  duplicate.activities[1].id = "a";
  assert.ok(validateTeachingPlan(duplicate).error);
  const duration = plan();
  duration.activities[0].minutes = -1;
  assert.ok(validateTeachingPlan(duration).error);
});
test("moving an activity preserves phase boundaries and complete resources", () => {
  const activities = plan().activities;
  const result = movePlanActivity(activities, "c", -1);
  assert.deepEqual(
    result.map((a) => a.id),
    ["c", "b", "a"],
  );
  assert.deepEqual(
    activities.map((a) => a.id),
    ["a", "b", "c"],
  );
  assert.deepEqual(result[0].resources, activities[2].resources);
});
test("HTML export preserves goals, products and rubric text while escaping markup", () => {
  const value = plan();
  value.title = '<script>alert("x")</script>';
  const html = planToHtml(value, "https://learning.example");
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  for (const text of [
    "Đọc đồ thị",
    "Bảng ghi",
    "Đối chiếu",
    "Nhóm dùng chung thiết bị",
    "https://learning.example/learning/B23-worksheet.pdf",
  ])
    assert.ok(html.includes(text));
});
test("lesson plan reference fields survive saving and HTML export without confusing phases with activity types",()=>{
 const original=plan();original.knowledgeGoals="Giải thích bán rã";original.competenceGoals="Đọc và xử lí dữ liệu";original.qualityGoals="Ghi dữ liệu trung thực";
 original.activities[0]={...original.activities[0],activityType:"application",assignment:"Giao bảng số liệu",implementation:"Học sinh tính toán",discussion:"So sánh kết quả",conclusion:"Ghi kết luận"};
 const saved=validateTeachingPlan(original).plan!;assert.equal(saved.activities[0].phase,"before_class");assert.equal(saved.activities[0].activityType,"application");assert.equal(saved.qualityGoals,"Ghi dữ liệu trung thực");
 const html=planToHtml(saved);assert.ok(html.includes("III Tiến trình dạy học"));assert.ok(html.includes("Giao bảng số liệu"));assert.ok(html.includes("Báo cáo và thảo luận"));assert.ok(lessonPlanReview(saved).some(s=>s.includes("Hoạt động mở đầu")));
 assert.ok(validateTeachingPlan({...original,activities:[{...original.activities[0],activityType:"unknown"}]}).error);
});
