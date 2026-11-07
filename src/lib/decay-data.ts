import { remainingFraction } from "./physics";

/** Expected population in a single-nuclide exponential model, not measured counts. */
export function decayData(initialCount: number, halfLifeSeconds: number) {
  if (!Number.isFinite(initialCount) || initialCount <= 0 || !Number.isFinite(halfLifeSeconds) || halfLifeSeconds <= 0) {
    throw new RangeError("N₀ và T phải là số dương hữu hạn.");
  }
  return Array.from({ length: 61 }, (_, index) => {
    const timeSeconds = index * 6;
    const fraction = remainingFraction(timeSeconds, halfLifeSeconds);
    return { timeSeconds, expectedCount: initialCount * fraction, fraction };
  });
}

export function decayCSV(initialCount: number, halfLifeSeconds: number) {
  const rows = decayData(initialCount, halfLifeSeconds).map(row => [
    row.timeSeconds, row.expectedCount.toFixed(6), row.fraction.toFixed(9),
    halfLifeSeconds, initialCount, "mo_hinh_ham_mu_khong_phai_so_do",
  ].join(","));
  return "\uFEFFt_s,N_ky_vong,N_tren_N0,T_s,N0,nguon_du_lieu\r\n" + rows.join("\r\n") + "\r\n";
}
