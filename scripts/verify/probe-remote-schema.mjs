// Read-only schema probe through PostgREST using the PUBLIC (publishable) key, i.e. the `anon` role.
// - Never prints the URL or key.
// - Only issues GET with limit=0 and RPC calls that anon is NOT allowed to execute
//   (a permission error proves the function exists without running it).
// Usage: node scripts/verify/probe-remote-schema.mjs
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split(/\r?\n/).filter(l => /^[A-Z_]+=/.test(l)).map(l => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim().replace(/^"|"$/g, "")]),
);
const base = env.NEXT_PUBLIC_SUPABASE_URL, key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!base || !key) { console.error("Missing Supabase public env names in .env.local"); process.exit(2); }
const headers = { apikey: key, Authorization: `Bearer ${key}` };

const tables = {
  // migration -> table -> columns the app code selects
  "001-016": { lessons: "id,class_id,teacher_id,status,topic_id", class_members: "class_id,student_id", student_phase_progress: "lesson_id,student_id,phase,is_completed" },
  "017": { student_phase_progress: "simulation_completed,assessment_answers" },
  "018": { material_bank: "id,is_published,is_system,content_url", lesson_pathway_steps: "id,lesson_id,phase,is_published,step_order,config", student_step_progress: "id,step_id,lesson_id,student_id,evidence", lesson_pathway_versions: "id" },
  "019": { teacher_teaching_plans: "id,teacher_id,plan", teacher_plan_applications: "plan_id,lesson_id" },
};
const rpcs = {
  "017": ["declare_simulation_completed", "get_student_assessment_questions"],
  "018": ["complete_pathway_step"],
  "019": ["apply_teacher_plan_draft"],
};
const rpcArgs = {
  declare_simulation_completed: { p_lesson_id: "00000000-0000-0000-0000-000000000000" },
  get_student_assessment_questions: { p_lesson_id: "00000000-0000-0000-0000-000000000000" },
  complete_pathway_step: { p_step_id: "00000000-0000-0000-0000-000000000000", p_evidence: {} },
  apply_teacher_plan_draft: { p_plan_id: "00000000-0000-0000-0000-000000000000", p_lesson_id: "00000000-0000-0000-0000-000000000000", p_steps: [] },
};

function verdict(status, body) {
  const code = body?.code ?? "";
  if (status === 200 || status === 206) return "EXISTS (readable as anon, rows hidden by RLS or empty)";
  if (code === "PGRST205" || code === "42P01") return `MISSING TABLE (${code})`;
  if (code === "42703" || code === "PGRST204") return `MISSING COLUMN (${code}): ${body.message}`;
  if (code === "PGRST202") return "MISSING FUNCTION (PGRST202)";
  if (code === "42501") return "EXISTS (anon denied: 42501)";
  return `UNKNOWN status=${status} code=${code} ${body?.message ?? ""}`;
}

for (const [migration, group] of Object.entries(tables)) {
  for (const [table, cols] of Object.entries(group)) {
    const res = await fetch(`${base}/rest/v1/${table}?select=${cols}&limit=0`, { headers });
    let body = null; try { body = await res.json(); } catch {}
    console.log(`[${migration}] table ${table}(${cols}): ${verdict(res.status, Array.isArray(body) ? null : body)}`);
  }
}
for (const [migration, fns] of Object.entries(rpcs)) {
  for (const fn of fns) {
    const res = await fetch(`${base}/rest/v1/rpc/${fn}`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(rpcArgs[fn]) });
    let body = null; try { body = await res.json(); } catch {}
    console.log(`[${migration}] rpc ${fn}: ${verdict(res.status, Array.isArray(body) ? null : body)}${res.status === 200 ? " — NOTE: anon executed it; review grants" : ""}`);
  }
}
