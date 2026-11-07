import type { CanonicalActivityKey } from "./curriculum";

export type StudentPathwayStep = {
  id: string;
  title: string;
  instructions: string;
  order: number;
  required: boolean;
  template?: boolean;
  type: string;
  url: string | null;
  activityKey: CanonicalActivityKey | null;
  resourceId?: string;
  completed: boolean;
  evidence: PathwayEvidence | null;
};

export type PathwayEvidence = { prediction: string; response: string; nextStep: string };

export function validatePathwayEvidence(value: unknown): PathwayEvidence | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const fields = ["prediction", "response", "nextStep"] as const;
  if (fields.some(key => typeof input[key] !== "string" || (input[key] as string).trim().length > 2000)) return null;
  const evidence = Object.fromEntries(fields.map(key => [key, (input[key] as string).trim()])) as PathwayEvidence;
  return evidence.response ? evidence : null;
}

export function isPathwayStepUnlocked(steps: StudentPathwayStep[], step: StudentPathwayStep): boolean {
  return steps.every(previous => previous.order >= step.order || !previous.required || previous.completed);
}

export function safeLearningUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim() || /[\u0000-\u001f\u007f\\]/.test(value)) return null;
  if (value !== value.trim()) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return new URL(value, "https://learning.invalid").pathname + new URL(value, "https://learning.invalid").search + new URL(value, "https://learning.invalid").hash;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}
