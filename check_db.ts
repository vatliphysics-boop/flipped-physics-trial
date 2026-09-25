import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envStr = fs.readFileSync(".env.local", "utf-8");
let SUPABASE_URL = "";
let SUPABASE_ANON_KEY = "";
for (const line of envStr.split("\n")) {
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) SUPABASE_URL = line.split("=")[1].trim();
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=")) SUPABASE_ANON_KEY = line.split("=")[1].trim();
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
  console.log("=== PROJECT URL ===");
  console.log(SUPABASE_URL);
  
  console.log("\n=== TABLES CHECK ===");
  const tables = [
    "lesson_materials",
    "phase_final_questions",
    "phase_assessment_questions",
    "student_phase_progress",
    "student_lesson_progress"
  ];
  for (const table of tables) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
      headers: { apikey: SUPABASE_ANON_KEY }
    });
    console.log(`- ${table}: ${res.status === 200 ? "EXISTS (200)" : "NOT FOUND / ERROR (" + res.status + ")"}`);
  }

  console.log("\n=== STORAGE BUCKETS ===");
  const bucketsRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  });
  if (bucketsRes.ok) {
    const buckets = await bucketsRes.json();
    for (const b of buckets) {
      console.log(`- Bucket: ${b.name} (allowed_mime_types: ${b.allowed_mime_types ? b.allowed_mime_types.join(", ") : "ALL"})`);
    }
  } else {
    console.log("Cannot list buckets: " + bucketsRes.status);
  }
}

check().catch(console.error);
