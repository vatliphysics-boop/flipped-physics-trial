import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CANONICAL_SYSTEM_MATERIALS } from "./material-bank";
import { normalizeActivityKey } from "./curriculum";
import type { LearningPhase } from "./learning-phases";
import { safeLearningUrl, validatePathwayEvidence, type StudentPathwayStep } from "./pathway-progress";

// Called only after getStudentLesson and the phase access guard.
// Do not serialize raw config/metadata: they can contain teacher answer keys.
export async function getStudentPathway(supabase: SupabaseClient, lessonId: string, studentId: string, phase: LearningPhase) {
  const { data, error } = await supabase.from("lesson_pathway_steps")
    .select("id, title, instructions, step_order, is_required, step_type, config, material_id, material_bank(content_url, storage_path, material_type, is_published)")
    .eq("lesson_id", lessonId).eq("phase", phase).eq("is_published", true).order("step_order").order("id");
  if (error) return { steps: [], error: "Không tải được tiến trình học. Em hãy thử lại hoặc báo giáo viên." };
  const ids = (data ?? []).map(step => step.id);
  if (!ids.length) return { steps: [], error: null };
  const progress = await supabase.from("student_step_progress").select("step_id, is_completed, evidence")
    .eq("lesson_id", lessonId).eq("student_id", studentId).in("step_id", ids);
  if (progress.error) return { steps: [], error: "Không tải được kết quả đã lưu. Em hãy thử lại trước khi nộp." };
  const byId = new Map((progress.data ?? []).map(item => [item.step_id, item]));
  const steps: StudentPathwayStep[] = await Promise.all((data ?? []).map(async step => {
    const config = step.config as Record<string, unknown> | null;
    const canonical = CANONICAL_SYSTEM_MATERIALS.find(item => item.id === config?.canonical_material_id);
    const relation = Array.isArray(step.material_bank) ? step.material_bank[0] : step.material_bank;
    const material = step.material_id ? relation : canonical;
    const available = !step.material_id || material?.is_published === true;
    const source = available ? (material?.content_url ?? config?.content_url) : null;
    const activityKey = typeof source === "string" && source.startsWith("activity:") ? normalizeActivityKey(source.slice(9)) : null;
    let url = safeLearningUrl(source);
    if (available && relation?.storage_path) {
      const signed = await supabase.storage.from("lesson-materials").createSignedUrl(relation.storage_path, 60 * 60);
      url = signed.error ? null : signed.data?.signedUrl ?? null;
    }
    const saved = byId.get(step.id);
    return {
      id: step.id, title: step.title, instructions: step.instructions ?? "", order: step.step_order,
      required: step.is_required, template: typeof config?.template_key === "string", type: material?.material_type ?? step.step_type, url, activityKey, resourceId: canonical?.id,
      completed: saved?.is_completed === true, evidence: validatePathwayEvidence(saved?.evidence),
    };
  }));
  return { steps, error: null };
}
