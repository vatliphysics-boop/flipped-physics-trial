import test from "node:test";
import assert from "node:assert/strict";

import { Timeline, createTestTimeline } from "@/simulations-v2/core/Timeline";
import {
  B23_DECAY_DEFINITION,
  createDecayState,
  deriveDecay,
  stepDecayState,
  theoreticalRemaining,
  theoreticalSeries,
} from "@/simulations-v2/physics/decay";
import { snapParameter, clampParameter } from "@/simulations-v2/core/types";
import type { SceneSpec } from "@/simulations-v2/core/types";

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

const SCENES: SceneSpec[] = [
  { key: "a", title: "A", narration: "…", durationSeconds: 2 },
  { key: "b", title: "B", narration: "…", durationSeconds: 3 },
  { key: "c", title: "C", narration: "…", durationSeconds: 1, pauseForResponse: true,
    question: { prompt: "?", choices: ["x", "y"] } },
];

test("timeline: starts at scene 0 after reset", () => {
  const tl = new Timeline(SCENES);
  tl.reset();
  assert.equal(tl.getState().sceneIndex, 0);
  assert.equal(tl.getState().presentationTime, 0);
  assert.equal(tl.getState().paused, false);
});

test("timeline: advances through scenes by duration", () => {
  const tl = new Timeline(SCENES);
  tl.reset();
  tl.step(1.5);
  assert.equal(tl.getState().sceneIndex, 0);
  tl.step(0.6); // 2.1s → scene 1
  assert.equal(tl.getState().sceneIndex, 1);
  tl.step(3); // 5.1s → scene 2
  assert.equal(tl.getState().sceneIndex, 2);
});

test("timeline: pause stops time, resume continues", () => {
  const tl = new Timeline(SCENES);
  tl.reset();
  tl.step(1);
  tl.pause();
  tl.step(100);
  assert.equal(tl.getState().presentationTime, 1);
  tl.resume();
  tl.step(1);
  assert.equal(tl.getState().presentationTime, 2);
});

test("timeline: pauseForResponse stops at scene end", () => {
  const tl = new Timeline(SCENES);
  tl.reset();
  tl.step(6.5); // past scene 2's end (total 6s)
  assert.equal(tl.getState().waitingForResponse, true);
});

test("timeline: respondAndContinue stops at end on terminal pause scene", () => {
  const tl = new Timeline(SCENES);
  tl.reset();
  tl.step(6.5);
  assert.equal(tl.getState().waitingForResponse, true);
  tl.respondAndContinue();
  assert.equal(tl.getState().waitingForResponse, false);
  assert.equal(tl.getState().paused, true);
  assert.equal(tl.getState().presentationTime, tl.getTotalDuration());
});

test("timeline: respondAndContinue advances past a non-terminal pause scene", () => {
  const NON_TERMINAL: SceneSpec[] = [
    { key: "a", title: "A", narration: "…", durationSeconds: 2, pauseForResponse: true },
    { key: "b", title: "B", narration: "…", durationSeconds: 3 },
  ];
  const tl = new Timeline(NON_TERMINAL);
  tl.reset();
  tl.step(3);
  assert.equal(tl.getState().waitingForResponse, true);
  assert.equal(tl.getState().sceneIndex, 0);
  tl.respondAndContinue();
  assert.equal(tl.getState().waitingForResponse, false);
  assert.equal(tl.getState().sceneIndex, 1);
  assert.equal(tl.getState().paused, false);
});

test("timeline: goToScene jumps exactly", () => {
  const tl = new Timeline(SCENES);
  tl.reset();
  tl.goToScene(2);
  assert.equal(tl.getState().sceneIndex, 2);
  assert.equal(tl.getSceneTime(), 0);
});

test("timeline: onSceneStart fires on transitions", () => {
  const seen: number[] = [];
  const tl = new Timeline(SCENES, { onSceneStart: (i) => seen.push(i) });
  tl.reset();
  tl.step(2.1);
  tl.step(3);
  assert.deepEqual(seen, [0, 1, 2]);
});

test("timeline: total duration is sum of scenes", () => {
  const tl = new Timeline(SCENES);
  assert.equal(tl.getTotalDuration(), 6);
});

test("timeline: test helper builds N scenes", () => {
  const tl = createTestTimeline(1, 4);
  assert.equal(tl.getTotalDuration(), 4);
});

// ---------------------------------------------------------------------------
// Decay physics
// ---------------------------------------------------------------------------

const BASE = { initialCount: 400, halfLifeSeconds: 10, seed: 23 };

test("decay: initial state has all nuclei remaining", () => {
  const s = createDecayState(BASE, 1);
  assert.equal(s.remaining, 400);
  assert.equal(s.timeSeconds, 0);
});

test("decay: N(t) decreases monotonically", () => {
  let s = createDecayState(BASE, 1);
  let prev = s.remaining;
  for (let i = 0; i < 40; i++) {
    s = stepDecayState(s, 0.5, BASE);
    assert.ok(s.remaining <= prev, "remaining must never increase");
    prev = s.remaining;
  }
});

test("decay: same seed gives identical sample (reproducible)", () => {
  const a = createDecayState(BASE, 1);
  const b = createDecayState(BASE, 1);
  assert.deepEqual(a.sample.lifetimes.slice(0, 20), b.sample.lifetimes.slice(0, 20));
});

test("decay: different seed gives different sample", () => {
  const a = createDecayState({ ...BASE, seed: 1 }, 1);
  const b = createDecayState({ ...BASE, seed: 2 }, 1);
  assert.notDeepEqual(a.sample.lifetimes.slice(0, 10), b.sample.lifetimes.slice(0, 10));
});

test("decay: after one half-life, simulated count near N0/2 (within statistics)", () => {
  // 4000 nuclei → σ ≈ √(N0·0.25) ≈ 31.6; 3σ ≈ 95. Use a generous bound.
  const s0 = createDecayState({ initialCount: 4000, halfLifeSeconds: 10, seed: 7 }, 1);
  const s1 = stepDecayState(s0, 10, BASE);
  const expected = 2000;
  const error = Math.abs(s1.remaining - expected);
  assert.ok(error < 120, `got ${s1.remaining} expected ~${expected} (err ${error})`);
});

test("decay: simulated count stays near theory across the run", () => {
  const N0 = 4000, T = 10, seed = 11;
  let s = createDecayState({ initialCount: N0, halfLifeSeconds: T, seed }, 1);
  for (let step = 1; step <= 30; step++) {
    s = stepDecayState(s, 1, BASE);
    const theory = theoreticalRemaining(N0, T, s.timeSeconds);
    const tol = Math.max(60, 0.12 * theory); // generous: ~4-5σ at N=1000+
    assert.ok(
      Math.abs(s.remaining - theory) < tol,
      `t=${s.timeSeconds}s: sim ${s.remaining} vs theory ${theory.toFixed(1)}`
    );
  }
});

test("decay: derive returns required quantities and valid units", () => {
  const s = createDecayState(BASE, 1);
  const q = deriveDecay(s, BASE);
  const keys = q.map((x) => x.key);
  assert.deepEqual(keys, ["remaining", "expected", "lambda", "activity"]);
  for (const item of q) {
    assert.ok(item.label.length > 0);
    assert.ok(item.latex.includes("\\"), "derived latex should be valid KaTeX body");
    assert.ok(item.value.length > 0);
  }
});

test("decay: lambda = ln2/T", () => {
  const s = createDecayState({ initialCount: 100, halfLifeSeconds: 8, seed: 1 }, 1);
  const q = deriveDecay(s, BASE).find((x) => x.key === "lambda")!;
  const expected = (Math.LN2 / 8).toFixed(4);
  assert.ok(q.value.startsWith(expected), `lambda → ${q.value}`);
});

test("decay: theoretical series is monotonic and hits N0/2 at T", () => {
  const pts = theoreticalSeries(1000, 12, 48, 1);
  assert.equal(pts.length, 49);
  assert.equal(pts[0]!.expected, 1000);
  const atHalf = pts.find((p) => p.timeSeconds === 12)!;
  assert.ok(Math.abs(atHalf.expected - 500) < 1e-9);
  for (let i = 1; i < pts.length; i++) {
    assert.ok(pts[i]!.expected <= pts[i - 1]!.expected);
  }
});

test("decay: no NaN/negative for any valid parameter combination", () => {
  const combos = [
    { initialCount: 40, halfLifeSeconds: 2, seed: 1 },
    { initialCount: 900, halfLifeSeconds: 30, seed: 9999 },
    { initialCount: 200, halfLifeSeconds: 10, seed: 500 },
  ];
  for (const c of combos) {
    let s = createDecayState(c, 1);
    for (let i = 0; i < 20; i++) s = stepDecayState(s, 1, c);
    assert.ok(Number.isFinite(s.remaining));
    assert.ok(s.remaining >= 0 && s.remaining <= c.initialCount);
  }
});

test("decay: definition wires 8 scenes and ≥1 pause point", () => {
  assert.equal(B23_DECAY_DEFINITION.scenes.length, 8);
  const pauses = B23_DECAY_DEFINITION.scenes.filter((s) => s.pauseForResponse);
  assert.equal(pauses.length, 1);
  assert.ok(pauses[0]!.question?.prompt);
  assert.ok((pauses[0]!.question?.choices ?? []).length >= 3);
});

test("decay: every parameter spec is internally consistent", () => {
  for (const p of B23_DECAY_DEFINITION.parameters) {
    assert.ok(p.min < p.max);
    assert.ok(p.initial >= p.min && p.initial <= p.max);
    assert.ok(p.step > 0);
    assert.ok(p.unit !== undefined);
  }
});

// ---------------------------------------------------------------------------
// Parameter validation
// ---------------------------------------------------------------------------

test("params: clamp rejects out-of-range values", () => {
  const spec = B23_DECAY_DEFINITION.parameters.find((p) => p.key === "halfLifeSeconds")!;
  assert.equal(clampParameter(spec, -100), spec.min);
  assert.equal(clampParameter(spec, 9999), spec.max);
  assert.equal(clampParameter(spec, NaN), spec.initial);
});

test("params: snap aligns to step grid without float drift", () => {
  const spec = { key: "x", label: "x", unit: "", min: 0, max: 1, step: 0.1, initial: 0.3 };
  assert.equal(snapParameter(spec, 0.34), 0.3);
  assert.equal(snapParameter(spec, 0.36), 0.4);
  assert.equal(snapParameter(spec, 0.3), 0.3);
  // 0.1*3 in float is 0.30000000000000004 — snapping must clean this
  assert.equal(snapParameter(spec, 0.30000000000000004), 0.3);
});
