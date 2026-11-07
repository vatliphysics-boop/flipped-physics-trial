import assert from "node:assert/strict";
import test from "node:test";
import {
  createRutherfordRun,
  RUTHERFORD_COMPARISON,
  RUTHERFORD_COULOMB_MEV_FM,
  RUTHERFORD_DETECTOR_RADIUS_FM,
  rutherfordTrail,
  sampleRutherford,
} from "../../src/lib/rutherford-model.ts";

function close(actual, expected, tolerance = 1e-10) {
  assert(Math.abs(actual - expected) < tolerance, `Expected ${actual} ≈ ${expected}`);
}

test("compares controlled impacts and exposes finite detector bearing separately", () => {
  const [a, b] = RUTHERFORD_COMPARISON.map(createRutherfordRun);
  close(RUTHERFORD_COULOMB_MEV_FM, 2 * 79 * 7.2973525643e-3 * 197.3269804, 1e-6);
  close(a.scatteringAngleDeg, 17.956587036);
  close(b.scatteringAngleDeg, 109.766224862, 3e-10);
  assert(b.scatteringAngleDeg > a.scatteringAngleDeg);
  assert(createRutherfordRun({ impactFm: b.impactFm, energyMeV: 10 }).scatteringAngleDeg < b.scatteringAngleDeg);
  for (const run of [a, b]) {
    for (const point of [run.start, run.hit]) {
      close(Math.hypot(point.xFm, point.yFm), RUTHERFORD_DETECTOR_RADIUS_FM);
    }
    close(run.detectorAngleDeg, Math.atan2(run.hit.yFm, run.hit.xFm) * 180 / Math.PI);
    assert.notEqual(run.detectorAngleDeg, run.scatteringAngleDeg);
    const dot = point => point.xFm * point.vxFmPerZs + point.yFm * point.vyFmPerZs;
    assert(dot(run.start) < 0 && dot(run.hit) > 0);
  }
});

test("the trajectory conserves energy and angular momentum across the allowed model domain", () => {
  for (const energyMeV of [3, 6.5, 10]) {
    for (const impactFm of [0, 10, 50, 100]) {
      const run = createRutherfordRun({ energyMeV, impactFm });
      const infinitySpeed = run.geometry.speedAtInfinityFmPerZs;
      const points = rutherfordTrail(run, run.durationZs, 81);
      assert.deepEqual(points, rutherfordTrail(run, run.durationZs, 81));
      for (const point of points) {
        const velocity = Math.hypot(point.vxFmPerZs, point.vyFmPerZs);
        close(energyMeV * (velocity / infinitySpeed) ** 2 + RUTHERFORD_COULOMB_MEV_FM / point.radiusFm, energyMeV);
        close(point.xFm * point.vyFmPerZs - point.yFm * point.vxFmPerZs, -impactFm * infinitySpeed);
      }
      const nearest = points[40];
      close(nearest.radiusFm, run.closestApproachFm);
      close(nearest.xFm * nearest.vxFmPerZs + nearest.yFm * nearest.vyFmPerZs, 0);
    }
  }
});

test("the time derivative matches Coulomb acceleration and a head-on hit turns back", () => {
  const run = createRutherfordRun(RUTHERFORD_COMPARISON[1]);
  const elapsed = run.durationZs * 0.42;
  const dt = 0.0001;
  const [before, current, after] = [elapsed - dt, elapsed, elapsed + dt].map(time => sampleRutherford(run, time));
  const accelerationScale = RUTHERFORD_COULOMB_MEV_FM * run.geometry.speedAtInfinityFmPerZs ** 2
    / (2 * run.energyMeV * current.radiusFm ** 3);
  close((after.xFm - before.xFm) / (2 * dt), current.vxFmPerZs, 1e-6);
  close((after.yFm - before.yFm) / (2 * dt), current.vyFmPerZs, 1e-6);
  close((after.vxFmPerZs - before.vxFmPerZs) / (2 * dt), accelerationScale * current.xFm, 1e-6);
  close((after.vyFmPerZs - before.vyFmPerZs) / (2 * dt), accelerationScale * current.yFm, 1e-6);
  const headOn = createRutherfordRun({ impactFm: 0, energyMeV: 8 });
  const turningPoint = sampleRutherford(headOn, headOn.durationZs / 2);
  close(headOn.scatteringAngleDeg, 180);
  close(turningPoint.radiusFm, RUTHERFORD_COULOMB_MEV_FM / 8);
  close(turningPoint.yFm, 0);
  close(Math.hypot(turningPoint.vxFmPerZs, turningPoint.vyFmPerZs), 0);
  assert(headOn.start.vxFmPerZs > 0 && headOn.hit.vxFmPerZs < 0);
});

test("rejects unsupported settings and clamps valid playback time at both boundaries", () => {
  assert.throws(() => createRutherfordRun({ impactFm: 100.1, energyMeV: 8 }), RangeError);
  assert.throws(() => createRutherfordRun({ impactFm: 20, energyMeV: 0 }), RangeError);
  const run = createRutherfordRun(RUTHERFORD_COMPARISON[0]);
  assert.throws(() => sampleRutherford(run, Number.NaN), RangeError);
  assert.throws(() => rutherfordTrail(run, 1, 1), RangeError);
  assert.equal(sampleRutherford(run, -1), run.start);
  assert.equal(sampleRutherford(run, run.durationZs + 1), run.hit);
});
