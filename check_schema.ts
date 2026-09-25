import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
let url = "";
let key = "";
for (const line of env.split("\n")) {
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) url = line.split("=")[1].replace(/['"]/g, '');
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=")) key = line.split("=")[1].replace(/['"]/g, '');
}

const supabase = createClient(url, key);

async function main() {
  const { data: q1, error: e1 } = await supabase.from('phase_final_questions').select('*').limit(1);
  const { data: q2, error: e2 } = await supabase.from('student_lesson_progress').select('*').limit(1);
  const { data: q3, error: e3 } = await supabase.from('student_phase_progress').select('*').limit(1);
  const { data: q4, error: e4 } = await supabase.from('phase_assessment_questions').select('*').limit(1);
  
  console.log("phase_final_questions", q1, e1);
  console.log("student_lesson_progress", q2, e2);
  console.log("student_phase_progress", q3, e3);
  console.log("phase_assessment_questions", q4, e4);
}

main().catch(console.error);
