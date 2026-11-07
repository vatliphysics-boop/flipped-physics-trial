/** Classical repulsive Coulomb scattering of one alpha particle by a fixed gold nucleus. */
export const RUTHERFORD_LIMITS = {
  impactFm: { min: 0, max: 100 },
  energyMeV: { min: 3, max: 10 },
} as const;

export const RUTHERFORD_DETECTOR_RADIUS_FM = 180;
export const RUTHERFORD_GOLD_Z = 79;
export const RUTHERFORD_ALPHA_Z = 2;
export const RUTHERFORD_COULOMB_MEV_FM = 1.43996455 * RUTHERFORD_ALPHA_Z * RUTHERFORD_GOLD_Z;

// CODATA 2022. One zeptosecond (zs) is 10⁻²¹ s.
const ALPHA_REST_ENERGY_MEV = 3727.3794118;
const LIGHT_SPEED_FM_PER_ZS = 299.792458;
const RAD_TO_DEG = 180 / Math.PI;

export type RutherfordSettings = Readonly<{ impactFm: number; energyMeV: number }>;

export const RUTHERFORD_COMPARISON = [
  { impactFm: 90, energyMeV: 8 },
  { impactFm: 10, energyMeV: 8 },
] as const satisfies readonly RutherfordSettings[];

export type RutherfordSample = Readonly<{
  xFm: number;
  yFm: number;
  vxFmPerZs: number;
  vyFmPerZs: number;
  radiusFm: number;
  elapsedZs: number;
}>;

type CoulombGeometry = Readonly<{
  semiMajorFm: number;
  focalDistanceFm: number;
  parameterLimit: number;
  speedAtInfinityFmPerZs: number;
}>;

export type RutherfordRun = RutherfordSettings & Readonly<{
  durationZs: number;
  scatteringAngleDeg: number;
  detectorAngleDeg: number;
  closestApproachFm: number;
  start: RutherfordSample;
  hit: RutherfordSample;
  geometry: CoulombGeometry;
}>;

function pointAtParameter(
  impactFm: number, geometry: CoulombGeometry, u: number, elapsedZs: number,
): RutherfordSample {
  const { semiMajorFm: a, focalDistanceFm: c, speedAtInfinityFmPerZs: v } = geometry;
  const cosh = Math.cosh(u);
  const sinh = Math.sinh(u);
  const radiusFm = a + c * cosh;
  // In periapsis axes the repulsive branch is (a cosh(u) + c, b sinh(u)).
  // Rotation gives the incoming asymptote y = b, travelling towards positive x.
  const xFm = (-a * (a * cosh + c) + impactFm ** 2 * sinh) / c;
  const yFm = impactFm + a * impactFm * Math.exp(u) / c;
  // The Coulomb time law gives du/dt = v∞ / r, including the b = 0 limit.
  return {
    xFm,
    yFm,
    vxFmPerZs: (impactFm ** 2 * cosh - a ** 2 * sinh) / c * v / radiusFm,
    vyFmPerZs: a * impactFm * Math.exp(u) / c * v / radiusFm,
    radiusFm,
    elapsedZs,
  };
}

function timeFromPeriapsis(geometry: CoulombGeometry, u: number) {
  return (geometry.semiMajorFm * u + geometry.focalDistanceFm * Math.sinh(u))
    / geometry.speedAtInfinityFmPerZs;
}

export function createRutherfordRun({ impactFm, energyMeV }: RutherfordSettings): RutherfordRun {
  const impact = RUTHERFORD_LIMITS.impactFm;
  const energy = RUTHERFORD_LIMITS.energyMeV;
  if (!Number.isFinite(impactFm) || impactFm < impact.min || impactFm > impact.max
    || !Number.isFinite(energyMeV) || energyMeV < energy.min || energyMeV > energy.max) {
    throw new RangeError("Tham số tán xạ nằm ngoài miền khảo sát.");
  }
  const semiMajorFm = RUTHERFORD_COULOMB_MEV_FM / (2 * energyMeV);
  const focalDistanceFm = Math.hypot(semiMajorFm, impactFm);
  const geometry = {
    semiMajorFm,
    focalDistanceFm,
    parameterLimit: Math.acosh((RUTHERFORD_DETECTOR_RADIUS_FM - semiMajorFm) / focalDistanceFm),
    speedAtInfinityFmPerZs: LIGHT_SPEED_FM_PER_ZS * Math.sqrt(2 * energyMeV / ALPHA_REST_ENERGY_MEV),
  };
  const durationZs = 2 * timeFromPeriapsis(geometry, geometry.parameterLimit);
  const hit = pointAtParameter(impactFm, geometry, geometry.parameterLimit, durationZs);
  return {
    impactFm,
    energyMeV,
    geometry,
    durationZs,
    scatteringAngleDeg: 2 * Math.atan2(semiMajorFm, impactFm) * RAD_TO_DEG,
    detectorAngleDeg: Math.atan2(hit.yFm, hit.xFm) * RAD_TO_DEG,
    closestApproachFm: semiMajorFm + focalDistanceFm,
    start: pointAtParameter(impactFm, geometry, -geometry.parameterLimit, 0),
    hit,
  };
}

export function sampleRutherford(run: RutherfordRun, elapsedZs: number): RutherfordSample {
  if (!Number.isFinite(elapsedZs)) throw new RangeError("Thời gian mô hình phải hữu hạn.");
  if (elapsedZs <= 0) return run.start;
  if (elapsedZs >= run.durationZs) return run.hit;
  const centeredTime = elapsedZs - run.durationZs / 2;
  if (centeredTime === 0) return pointAtParameter(run.impactFm, run.geometry, 0, elapsedZs);
  // Invert the strictly increasing time law, without numerical time stepping.
  let low = -run.geometry.parameterLimit;
  let high = run.geometry.parameterLimit;
  for (let i = 0; i < 48; i += 1) {
    const mid = (low + high) / 2;
    if (timeFromPeriapsis(run.geometry, mid) < centeredTime) low = mid;
    else high = mid;
  }
  return pointAtParameter(run.impactFm, run.geometry, (low + high) / 2, elapsedZs);
}

export function rutherfordTrail(run: RutherfordRun, elapsedZs = run.durationZs, points = 120) {
  if (!Number.isSafeInteger(points) || points < 2) {
    throw new RangeError("Cần ít nhất hai điểm trên quỹ đạo.");
  }
  const span = sampleRutherford(run, elapsedZs).elapsedZs;
  return Array.from({ length: points }, (_, index) => sampleRutherford(run, span * (index / (points - 1))));
}
