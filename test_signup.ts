import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envStr = fs.readFileSync(".env.local", "utf-8");
let SUPABASE_URL = "";
let SUPABASE_ANON_KEY = "";
for (const line of envStr.split("\n")) {
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) SUPABASE_URL = line.split("=")[1].trim();
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=")) SUPABASE_ANON_KEY = line.split("=")[1].trim();
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: `teacher_test_${Date.now()}@example.com`,
    password: "password123",
  });
  console.log("Signup:", data, error);
}

test().catch(console.error);
