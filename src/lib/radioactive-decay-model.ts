/** Independent exponential lifetimes; an illustrative single-nuclide sample.
 * No detector losses, background, daughter decay or spatial dynamics.
 * Source: OpenStax University Physics 3 §10.3 Radioactive Decay.
 */
export type DecayParameters = { initialCount: number; halfLifeSeconds: number; seed: number };
export type DecaySample = DecayParameters & { lifetimes: readonly number[] };
export const DECAY_COMPARISON = {
  a: { initialCount: 64, halfLifeSeconds: 20, seed: 23 },
  b: { initialCount: 64, halfLifeSeconds: 40, seed: 23 },
  timeSeconds: 40,
} as const;

export function createDecaySample(parameters: DecayParameters): DecaySample {
  const { initialCount, halfLifeSeconds, seed } = parameters;
  if (!Number.isInteger(initialCount) || initialCount < 1 || initialCount > 100000 ||
      !Number.isFinite(halfLifeSeconds) || halfLifeSeconds <= 0 || !Number.isInteger(seed)) {
    throw new RangeError("N₀ phải là số nguyên 1–100000, T dương, seed nguyên.");
  }
  let state = seed >>> 0;
  const lambda = Math.LN2 / halfLifeSeconds;
  const lifetimes = Array.from({ length: initialCount }, () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let word = Math.imul(state ^ state >>> 15, state | 1);
    word ^= word + Math.imul(word ^ word >>> 7, word | 61);
    const uniform = (((word ^ word >>> 14) >>> 0) + 0.5) / 4294967296;
    return -Math.log1p(-uniform) / lambda;
  });
  return { ...parameters, lifetimes };
}

export function decayState(sample: DecaySample, timeSeconds: number, windowSeconds = 1) {
  if (!Number.isFinite(timeSeconds) || timeSeconds < 0 || !Number.isFinite(windowSeconds) || windowSeconds <= 0) {
    throw new RangeError("Thời gian không âm, khoảng đếm dương và hữu hạn.");
  }
  const start = Math.max(0, timeSeconds - windowSeconds);
  let remaining = 0, detections = 0;
  for (const lifetime of sample.lifetimes) {
    if (lifetime > timeSeconds) remaining++;
    else if (lifetime > start) detections++;
  }
  const expected = sample.initialCount * 2 ** (-timeSeconds / sample.halfLifeSeconds);
  const lambda = Math.LN2 / sample.halfLifeSeconds;
  return { timeSeconds, remaining, decayed: sample.initialCount - remaining, detections,
    windowStartSeconds: start, windowDurationSeconds: timeSeconds - start, expected,
    expectedActivityBq: lambda * expected, lambdaPerSecond: lambda };
}

export function decaySeries(sample: DecaySample, untilSeconds: number, stepSeconds = 1) {
  if (!Number.isFinite(untilSeconds) || untilSeconds < 0 || !Number.isFinite(stepSeconds) || stepSeconds <= 0 || untilSeconds / stepSeconds > 10000) {
    throw new RangeError("Khoảng dựng đồ thị không hợp lệ.");
  }
  const points = Array.from({ length: Math.floor(untilSeconds / stepSeconds) + 1 }, (_, i) => decayState(sample, i * stepSeconds, stepSeconds));
  if (points.at(-1)!.timeSeconds < untilSeconds) points.push(decayState(sample, untilSeconds, stepSeconds));
  return points;
}

export function decayProcessCSV(sample: DecaySample, untilSeconds = 60) {
  const rows = decaySeries(sample, untilSeconds, 1).map(row => [row.timeSeconds, row.remaining,
    row.expected.toFixed(6), row.detections, row.expectedActivityBq.toFixed(6), sample.initialCount,
    sample.halfLifeSeconds, sample.seed, "du_lieu_mo_phong_khong_phai_so_do"].join(","));
  return "\uFEFFt_s,N_luot_chay,N_ky_vong,dem_trong_1_s,H_ky_vong_Bq,N0,T_s,seed,nguon\r\n" + rows.join("\r\n") + "\r\n";
}
