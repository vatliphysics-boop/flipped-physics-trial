import measurements from "@/data/sgk-b25-table-25-1.json";

/** SGK Vật lí 12 Kết nối tri thức, Bài 25, Bảng 25.1, trang in 121. */
export const SGK_TABLE_25_1: ReadonlyArray<{ t: number; h: number }> = measurements;

export const SGK_25_1_HALF_ACTIVITY = SGK_TABLE_25_1[0].h / 2;

export const B25_COMPARISON = { halfLifeA: 40, halfLifeB: 60, initialActivityBq: 151, compareAtSeconds: 30 } as const;

/** Theoretical expectation only. Never writes or replaces the SGK observations. */
export function activityAt(timeSeconds: number, halfLifeSeconds: number, initialActivityBq = 151) {
  if (![timeSeconds, halfLifeSeconds, initialActivityBq].every(Number.isFinite) || timeSeconds < 0 || halfLifeSeconds <= 0 || initialActivityBq < 0) {
    throw new RangeError("t không âm, T dương và H₀ không âm, hữu hạn.");
  }
  return initialActivityBq * 2 ** (-timeSeconds / halfLifeSeconds);
}

export function halfActivityBracket() {
  const upperIndex = SGK_TABLE_25_1.findIndex(row => row.h <= SGK_25_1_HALF_ACTIVITY);
  const left = SGK_TABLE_25_1[upperIndex - 1], right = SGK_TABLE_25_1[upperIndex];
  return { fromSeconds: left.t, toSeconds: right.t, halfActivityBq: SGK_25_1_HALF_ACTIVITY,
    linearEstimateSeconds: left.t + (left.h - SGK_25_1_HALF_ACTIVITY) / (left.h - right.h) * (right.t - left.t) };
}
