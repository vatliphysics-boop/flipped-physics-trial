import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(path.resolve("package.json"));
const { createClient } = require("@supabase/supabase-js");
process.loadEnvFile(".env.local");
const fixture = JSON.parse(await readFile("tmp/sgk-phase-qa/fixture.json", "utf8"));
const lesson = fixture.lessons.B21;
assert(lesson, "Requires the new QA fixture with B21.");
const password = process.env.B23_TEST_PASSWORD || ["TestB23", "Pass!"].join("");
async function login(email) {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
  const signed = await client.auth.signInWithPassword({ email, password });
  assert(!signed.error, signed.error?.message);
  return { client, id: signed.data.user.id };
}
const [owner, learner, other] = await Promise.all([
  login("b23-gv@example.com"), login("b23-hs1@example.com"), login("b23-hs2@example.com"),
]);
const steps = await owner.client.from("lesson_pathway_steps").select("id").eq("lesson_id", lesson).eq("phase", "before_class");
assert(!steps.error && steps.data.length);
const stepId = steps.data[0].id;
const original = await learner.client.from("student_step_progress").select("step_id, evidence").eq("step_id", stepId).eq("student_id", learner.id).single();
assert.match(original.data?.evidence?.response, /^QA-HS1/);
const rejected = await other.client.rpc("complete_pathway_step", { p_step_id: stepId, p_evidence: { response: "QA outsider" } });
assert.equal(rejected.data?.success, false);
const joined = await other.client.rpc("join_class_by_code", { p_join_code: fixture.joinCode });
assert(!joined.error && joined.data?.success !== false, joined.error?.message || JSON.stringify(joined.data));
const read = await other.client.from("student_step_progress").select("step_id").eq("step_id", stepId).eq("student_id", learner.id);
assert.deepEqual(read.data, []);
const edited = await other.client.from("student_step_progress").update({ evidence: { response: "QA overwrite attempt" } }).eq("step_id", stepId).eq("student_id", learner.id).select("step_id");
assert(edited.error || edited.data?.length === 0);
const confirmed = await owner.client.from("student_step_progress").select("evidence").eq("step_id", stepId).eq("student_id", learner.id).single();
assert.deepEqual(confirmed.data.evidence, original.data.evidence);
console.log("PASS: outside-class RPC rejected; a classmate cannot read or overwrite another learner's evidence; teacher sees original.");
