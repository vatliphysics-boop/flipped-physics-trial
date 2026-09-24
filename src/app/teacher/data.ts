import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const getTeacherContext = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "teacher") redirect(profile?.role === "student" ? "/student" : "/login");
  return { supabase, user };
});

export const getTeacherClasses = cache(async () => {
  const { supabase, user } = await getTeacherContext();
  const { data, error } = await supabase.from("classes").select("id, name, description, join_code, created_at")
    .eq("teacher_id", user.id).order("created_at", { ascending: false });
  return { classes: data ?? [], error };
});
