import assert from "node:assert/strict";
import test from "node:test";
import { REACTOR_FLOW_STAGES, reactorFlowState, reactorState } from "../src/lib/reactor-model";

test("reactor comparison shares a starting index and changes trend with schematic rod insertion", () => {
  for (const depth of [0, 50, 100]) assert.equal(reactorState(0, depth).expected, 1);
  assert.ok(reactorState(4, 0).expected > 1);
  assert.equal(reactorState(4, 50).expected, 1);
  assert.ok(reactorState(4, 100).expected < 1);
  assert.equal(reactorState(2.5, 0).generation, 2);
  assert.equal(reactorState(2.5, 0).progress, 0.5);
  assert.equal(reactorState(10, 0).generation, 4);
  assert.equal(reactorState(-1, 0).generation, 0);
  assert.equal(reactorState(4, NaN).trend, "steady");
});

test("heat and water sequence has distinct stages and a bounded end", () => {
  assert.deepEqual(REACTOR_FLOW_STAGES.map(stage => stage.id), ["core", "steam-generator", "turbine", "generator", "condenser"]);
  assert.equal(reactorFlowState(1.5).stage.id, "steam-generator");
  assert.equal(reactorFlowState(1.5).progress, 0.5);
  assert.equal(reactorFlowState(99).stage.id, "condenser");
  assert.equal(reactorFlowState(99).finished, true);
});
