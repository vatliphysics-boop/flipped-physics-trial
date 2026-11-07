import test from "node:test";
import assert from "node:assert/strict";
// prettier-ignore
// @ts-expect-error Native Node TypeScript stripping requires the source extension.
import { FISSION_CHANNEL, FISSION_DURATION, FISSION_ENERGY, fissionConservation, fissionMotion, fissionNucleons, fissionState, neutronGenerations } from "../src/lib/fission-model.ts";
test("The actual particles used by the 3D scene conserve A and Z in the SGK Y/I channel", () => {
  const nucleons = fissionNucleons();
  assert.deepEqual(fissionConservation(), { inputA: 236, outputA: 236, inputZ: 92, outputZ: 92 });
  assert.equal(nucleons.length, 236);
  assert.equal(nucleons.filter(n => n.proton).length, 92);
  FISSION_CHANNEL.fragments.forEach((fragment, i) => {
    const members = nucleons.filter(n => n.fragment === i);
    assert.equal(members.length, fragment.a);
    assert.equal(members.filter(n => n.proton).length, fragment.z);
    assert.equal(new Set(members.map(n => n.local)).size, fragment.a);
  });
  const free = nucleons.filter(n => n.fragment >= 2);
  assert.equal(free.length, 3);
  assert.ok(free.every(n => !n.proton));
  assert.equal(nucleons.at(-1)?.proton, false); // Incoming neutron before absorption.
});
test("Timeline shows absorption before deformation, then products, and stops at its end", () => {
  assert.equal(fissionState(1.99).stage, 0);
  assert.equal(fissionState(2).stage, 1);
  assert.equal(fissionState(3).stage, 2);
  assert.equal(fissionState(4.5).stage, 3);
  assert.equal(fissionState(100).time, FISSION_DURATION);
  assert.equal(fissionState(100).finished, true);
  assert.equal(fissionState(16).stage, 3); // Must not silently start another reaction.
  assert.equal(fissionState(-3).time, 0);
  assert.equal(fissionState(NaN).time, 0);
});
test("Qualitative generations compare decreasing, steady and growing chains", () => {
  const decreasing = neutronGenerations(0.6), steady = neutronGenerations(1), growing = neutronGenerations(1.4);
  assert.ok(decreasing.at(-1)!.expected < decreasing[0].expected);
  assert.ok(steady.every(g => g.expected === 1));
  assert.ok(growing.at(-1)!.expected > growing[0].expected);
  assert.throws(() => neutronGenerations(Infinity), RangeError);
  assert.throws(() => neutronGenerations(-1), RangeError);
});

test("Incident-neutron control and shared coordinates give a stationary comparison and moving products", () => {
  const comparison = fissionMotion(8, false);
  assert.equal(comparison.incidentNeutron, false);
  assert.equal(comparison.stage, 0);
  assert.equal(comparison.approach, 0);
  assert.equal(comparison.finished, false);
  assert.ok(fissionMotion(0).incomingX < fissionMotion(1).incomingX);
  assert.ok(fissionMotion(4.4).stretchX > 1);
  assert.ok(fissionMotion(7).fragmentOffsets[1] > fissionMotion(5).fragmentOffsets[1]);
  assert.equal(fissionMotion(8).neutronPositions.length, 3);
});

test("AME2020 channel release is computed from rest masses, not the nominal fission average", () => {
  assert.ok(Math.abs(FISSION_ENERGY.beforeMassU - 236.0525930329) < 1e-9);
  assert.ok(Math.abs(FISSION_ENERGY.afterMassU - 235.8615408367) < 1e-9);
  assert.ok(Math.abs(FISSION_ENERGY.qMeV - 177.9651) < 0.0001);
});
