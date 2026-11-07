import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node test runner loads TypeScript.
import { createDecaySample, decayState, decaySeries, DECAY_COMPARISON } from "../src/lib/radioactive-decay-model.ts";
// @ts-expect-error Node test runner loads TypeScript.
import { activityAt, halfActivityBracket, SGK_TABLE_25_1 } from "../src/lib/sgk-b25-decay.ts";

test("seeded lifetimes reproduce and half-life scales the same realization", () => {
  const a = createDecaySample(DECAY_COMPARISON.a);
  const b = createDecaySample(DECAY_COMPARISON.b);
  assert.deepEqual(a, createDecaySample(DECAY_COMPARISON.a));
  assert.notDeepEqual(a.lifetimes, createDecaySample({ ...DECAY_COMPARISON.a, seed: 24 }).lifetimes);
  a.lifetimes.forEach((t: number, index: number) => assert.equal(2 * t, b.lifetimes[index]));
  assert.equal(decayState(a, 40).expected, 16);
  assert.equal(decayState(b, 40).expected, 32);
  assert.equal(decayState(a, 20).remaining, decayState(b, 40).remaining);
});

test("each event is counted once, counts conserve initial sample and do not force half at T", () => {
  const sample = createDecaySample({ initialCount: 128, halfLifeSeconds: 10, seed: 2026 });
  const series = decaySeries(sample, 40, 1);
  let detections = 0;
  series.forEach((s: { timeSeconds: number; remaining: number; decayed: number; detections: number }, i: number) => {
    assert.equal(s.remaining + s.decayed, 128);
    if (i > 0) {
      assert(s.remaining <= series[i - 1].remaining);
      detections += s.detections;
      assert.equal(detections, s.decayed);
    }
  });
  const runs = Array.from({ length: 500 }, (_, seed) => decayState(createDecaySample({ initialCount: 64, halfLifeSeconds: 10, seed }), 10).remaining);
  assert(new Set(runs).size > 15, "Runs must fluctuate rather than always equal 32");
  assert(Math.abs(runs.reduce((sum, n) => sum + n, 0) / runs.length - 32) < .6, "Ensemble must agree with exponential survival");
  assert.equal(decayState(sample, 0).detections, 0);
  assert.equal(decayState(sample, sample.lifetimes[0], .001).detections >= 1, true);
});

test("invalid decay and observation conditions are rejected", () => {
  for (const initialCount of [0, 1.5, Infinity, 100001]) assert.throws(() => createDecaySample({ initialCount, halfLifeSeconds: 10, seed: 1 }), RangeError);
  const sample = createDecaySample(DECAY_COMPARISON.a);
  assert.throws(() => decayState(sample, -1), RangeError);
  assert.throws(() => decayState(sample, 1, 0), RangeError);
  assert.throws(() => decaySeries(sample, 5, 0), RangeError);
});

test("B25 keeps all source points independent of theory and brackets half activity", () => {
  const before = JSON.stringify(SGK_TABLE_25_1);
  assert.deepEqual(SGK_TABLE_25_1.map((r: { h: number }) => r.h), [151, 85, 55, 31, 22, 15, 11, 9]);
  assert.deepEqual(halfActivityBracket(), { fromSeconds: 30, toSeconds: 60, halfActivityBq: 75.5, linearEstimateSeconds: 39.5 });
  assert(Math.abs(activityAt(30, 40) - 89.78513719270543) < 1e-8);
  assert(activityAt(30, 60) > activityAt(30, 40));
  assert.equal(activityAt(40, 40), 75.5);
  assert.equal(activityAt(0, 40), 151);
  assert.throws(() => activityAt(30, 0), RangeError);
  assert.equal(JSON.stringify(SGK_TABLE_25_1), before);
});
