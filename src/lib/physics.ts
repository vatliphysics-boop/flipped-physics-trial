/** Rounded constants for Grade 12 calculations; masses are in atomic mass units. */
export const ATOMIC_MASS_ENERGY_MEV = 931.5;
export const HYDROGEN_ATOM_MASS_U = 1.007825;
export const NEUTRON_MASS_U = 1.008665;
export const CARBON14_HALF_LIFE_YEARS = 5730;

export function remainingFraction(time: number, halfLife: number) {
  return 2 ** (-time / halfLife);
}

export function carbon14Age(fraction: number) {
  return -CARBON14_HALF_LIFE_YEARS * Math.log2(fraction);
}

/** Atomic masses cancel electron rest masses on both sides (electron binding neglected). */
export function bindingEnergy(z: number, a: number, atomMass: number) {
  const massDefect = z * HYDROGEN_ATOM_MASS_U + (a - z) * NEUTRON_MASS_U - atomMass;
  const energy = massDefect * ATOMIC_MASS_ENERGY_MEV;
  return { massDefect, energy, perNucleon: energy / a };
}

/** Knuth sampler, used only with small expected counts in an explicit simulated measurement. */
export function poissonCount(mean: number, random = Math.random) {
  const threshold = Math.exp(-mean);
  let product = 1;
  let count = 0;
  do {
    count += 1;
    product *= random();
  } while (product > threshold);
  return count - 1;
}

export function sampleSurvivors(count: number, fraction: number, random = Math.random) {
  let remaining = 0;
  for (let i = 0; i < count; i += 1) if (random() < fraction) remaining += 1;
  return remaining;
}

export function parsePhysicsAnswer(value: string) {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function answerWithinTolerance(value: string, expected: number, absoluteTolerance = 0.01) {
  const parsed = parsePhysicsAnswer(value);
  return parsed !== null && Math.abs(parsed - expected) <= absoluteTolerance;
}
