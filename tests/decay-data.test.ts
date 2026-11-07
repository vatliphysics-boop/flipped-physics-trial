import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Native Node test runner imports TypeScript directly.
import { decayData, decayCSV } from "../src/lib/decay-data.ts";

test("decay data preserves the fixed time axis and half-life populations", () => {
  const rows = decayData(1000, 30);
  assert.equal(rows.length, 61);
  assert.equal(rows[0].timeSeconds, 0);
  assert.equal(rows.at(-1)!.timeSeconds, 360);
  assert.equal(rows[5].expectedCount, 500);
  assert.equal(rows[10].expectedCount, 250);
  const longer = decayData(1000, 60);
  assert.ok(Math.abs(longer[5].expectedCount - 707.1067811865476) < 1e-9);
  assert.equal(decayData(2000, 60)[5].expectedCount, 2 * longer[5].expectedCount);
  const recoveredT = (longer[10].timeSeconds - longer[0].timeSeconds) * Math.LN2 / Math.log(longer[0].expectedCount / longer[10].expectedCount);
  assert.equal(recoveredT, 60);
});

test("CSV records current parameters and explicitly identifies model data", () => {
  const lines = decayCSV(2000, 60).trim().split("\r\n");
  assert.equal(lines.length, 62);
  assert.equal(lines[6], "30,1414.213562,0.707106781,60,2000,mo_hinh_ham_mu_khong_phai_so_do");
  for (const row of lines.slice(1)) assert.equal(row.split(",").length, 6);
  for (const [n, t] of [[0, 30], [1000, 0], [NaN, 30], [1000, Infinity]]) assert.throws(() => decayCSV(n, t), RangeError);
});
