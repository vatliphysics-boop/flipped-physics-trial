export type VideoProgressInput = {
  materialId: string;
  watchedSeconds: number;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function normalizeWatchedSeconds(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 86_400) return null;
  return Math.round(value * 10) / 10;
}

export function validateVideoProgressInput(input: VideoProgressInput): VideoProgressInput | null {
  const watchedSeconds = normalizeWatchedSeconds(input.watchedSeconds);
  return isUuid(input.materialId) && watchedSeconds !== null ? { materialId: input.materialId, watchedSeconds } : null;
}

export function validateCheckpointAnswer(input: { materialId: string; checkpointId: string; selectedOption: string }) {
  const selectedOption = typeof input.selectedOption === "string" ? input.selectedOption.trim().toUpperCase() : "";
  if (!isUuid(input.materialId) || !isUuid(input.checkpointId) || !["A", "B", "C", "D"].includes(selectedOption)) return null;
  return { materialId: input.materialId, checkpointId: input.checkpointId, selectedOption };
}
