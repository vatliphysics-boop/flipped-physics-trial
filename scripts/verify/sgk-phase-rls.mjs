/** Check permissions with the disposable class created by sgk-phase-browser.mjs. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const artifact = process.env.ARTIFACT_DIR || "tmp/sgk-phase-qa";
const fixture = JSON.parse(await readFile(path.join(artifact, "fixture.json"), "utf8"));
const lessonId = fixture.lessons.B21;
assert(lessonId, "Run the browser QA for B21 first.");
const password = process.env.B23_TEST_PASSWORD || ["TestB23", "Pass!"].join("");

async function login(email) {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  assert(data.user, error?.message);
  return { client, id: data.user.id };
}

const [teacher, student, other] = await Promise.all([
  login("b23-gv@example.com"), login("b23-hs1@example.com"), login("b23-hs2@example.com"),
]);
const owned = await teacher.client.from("classes").select("id,name").eq("id", fixture.classId).eq("teacher_id", teacher.id).single();
assert(owned.data?.name.startsWith("[QA] SGK B21–B25"), "The class must be the dedicated SGK QA class.");
const steps = await teacher.client.from("lesson_pathway_steps").select("id,step_order,lessons!inner(class_id)")
  .eq("lesson_id", lessonId).eq("lessons.class_id", owned.data.id).eq("phase", "before_class").eq("is_published", true).order("step_order");
assert(!steps.error && steps.data.length);
const step = steps.data[0];
const original = await student.client.from("student_step_progress").select("evidence").eq("step_id", step.id).eq("student_id", student.id).single();
assert.match(original.data?.evidence?.response, /^QA-HS1-B21/);
const outside = await teacher.client.from("class_members").select("id").eq("class_id", owned.data.id).eq("student_id", other.id);
assert.deepEqual(outside.data, [], "The second test account must start outside the QA class.");
const attempt = await other.client.rpc("complete_pathway_step", { p_step_id: step.id, p_evidence: { response: "QA outsider" } });
assert.equal(attempt.data?.success, false);

const draftId = randomUUID();
const draft = await teacher.client.from("lesson_pathway_steps").insert({
  id: draftId, lesson_id: lessonId, phase: "before_class", step_order: Math.max(...steps.data.map(row => row.step_order)) + 10,
  step_type: "exercise", title: "Bản nháp kỹ thuật QA", instructions: "Kiểm thử quyền đọc bản nháp.", is_published: false, is_required: false,
});
assert(!draft.error, draft.error?.message);
let joined = false;
try {
  const draftRead = await student.client.from("lesson_pathway_steps").select("id").eq("id", draftId);
  assert.deepEqual(draftRead.data, []);
  const join = await other.client.rpc("join_class_by_code", { p_join_code: fixture.joinCode });
  const result = Array.isArray(join.data) ? join.data[0] : join.data;
  assert(!join.error && result?.success === true, join.error?.message ?? result?.message);
  joined = true;
  const read = await other.client.from("student_step_progress").select("step_id").eq("step_id", step.id).eq("student_id", student.id);
  assert.deepEqual(read.data, []);
  const edit = await other.client.from("student_step_progress").update({ evidence: original.data.evidence })
    .eq("step_id", step.id).eq("student_id", student.id).select("step_id");
  assert(edit.error || edit.data?.length === 0);
  const confirmed = await teacher.client.from("student_step_progress").select("evidence").eq("step_id", step.id).eq("student_id", student.id).single();
  assert.deepEqual(confirmed.data.evidence, original.data.evidence);
  console.log("PASS: học sinh ngoài lớp không nộp được; bản nháp chỉ giáo viên đọc; bạn cùng lớp không đọc/sửa được bài nộp.");
} finally {
  const [removedDraft, removedMembership] = await Promise.all([
    teacher.client.from("lesson_pathway_steps").delete().eq("id", draftId).eq("lesson_id", lessonId).select("id"),
    joined && teacher.client.from("class_members").delete().eq("class_id", owned.data.id).eq("student_id", other.id).select("id"),
  ]);
  assert(removedDraft.data?.length === 1 && (!joined || removedMembership.data?.length === 1), "Cleanup failed in the dedicated QA class.");
}
