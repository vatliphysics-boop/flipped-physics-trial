import type { LearningPhase } from "./learning-phases";

export type ProgressMaterial = {
  id: string;
  phase: LearningPhase;
  required: boolean;
  isPublished: boolean;
  isComplete: boolean;
};

export type LessonProgress = {
  completedRequired: number;
  totalRequired: number;
  percent: number;
  byPhase: Record<LearningPhase, { completed: number; total: number }>;
};

export function calculateLessonProgress(materials: ProgressMaterial[]): LessonProgress {
  const byPhase: LessonProgress["byPhase"] = {
    before_class: { completed: 0, total: 0 },
    in_class: { completed: 0, total: 0 },
    after_class: { completed: 0, total: 0 },
  };
  let completedRequired = 0;
  let totalRequired = 0;

  for (const material of materials) {
    if (!material.isPublished || !material.required) continue;
    byPhase[material.phase].total += 1;
    totalRequired += 1;
    if (material.isComplete) {
      byPhase[material.phase].completed += 1;
      completedRequired += 1;
    }
  }

  return {
    completedRequired,
    totalRequired,
    percent: totalRequired === 0 ? 0 : Math.round((completedRequired / totalRequired) * 100),
    byPhase,
  };
}

export function isVideoComplete(answeredCheckpointCount: number, totalCheckpoints: number, completionPercent: number): boolean {
  return Number.isFinite(completionPercent)
    && completionPercent >= 90
    && (totalCheckpoints === 0 || answeredCheckpointCount >= totalCheckpoints);
}
