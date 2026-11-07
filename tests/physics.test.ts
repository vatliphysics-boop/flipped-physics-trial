import { test } from 'node:test';
import assert from 'node:assert/strict';
// @ts-expect-error Native Node TypeScript stripping requires the source extension.
import { remainingFraction, carbon14Age, bindingEnergy, poissonCount, BINDING_NUCLIDES } from '../src/lib/physics.ts';

test('decay halves at each T and dating inverts the same physical law', () => {
  for (const T of [4, 30, 60, 5730]) {
    assert.equal(remainingFraction(0, T), 1);
    assert.equal(remainingFraction(T, T), .5);
    assert.equal(remainingFraction(3 * T, T), .125);
  }
  assert.equal(carbon14Age(.25), 11460);
  assert.ok(Math.abs(remainingFraction(carbon14Age(.1), 5730) - .1) < 1e-12);
});

test('atomic mass convention gives a plausible helium-4 binding energy', () => {
  const helium = bindingEnergy(2, 4, 4.002603);
  assert.ok(Math.abs(helium.energy - 28.296) < .02);
  assert.ok(Math.abs(helium.perNucleon - 7.074) < .005);
});

test('B25 uses one mass convention for all five nuclides, including oxygen and uranium', () => {
  const expected = [7.074, 7.680, 7.976, 8.790, 7.591];
  BINDING_NUCLIDES.forEach((nuclide, i) => {
    const result = bindingEnergy(nuclide.z, nuclide.a, nuclide.mx);
    assert.ok(Math.abs(result.perNucleon - expected[i]) < .005, `${nuclide.name}: ${result.perNucleon}`);
  });
});

test('simulated detector can produce zero events and reproducible nonnegative counts', () => {
  assert.equal(poissonCount(.4, () => .1), 0);
  assert.equal(poissonCount(.4, () => .9), 3);
  assert.equal(poissonCount(0), 0);
});
