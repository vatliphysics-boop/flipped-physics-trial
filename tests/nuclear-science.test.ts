import assert from "node:assert/strict";
import { test } from "node:test";
// @ts-expect-error Native Node TypeScript stripping requires the source extension.
import { HALF_LIFE_EXAMPLE, NUCLEAR_REACTIONS, NUCLIDES } from "../src/lib/nuclear-science.ts";

test("carbon isotopes keep the same Z but have distinct neutron counts", () => {
  const carbon = [NUCLIDES.C12, NUCLIDES.C13, NUCLIDES.C14];
  assert.deepEqual(carbon.map(({ A, Z, N }) => [A, Z, N]), [[12, 6, 6], [13, 6, 7], [14, 6, 8]]);
  assert.deepEqual(carbon.map(({ stability }) => stability), ["stable", "stable", "radioactive"]);
  assert.equal(NUCLIDES.C12.latex, "{}^{12}_{6}\\mathrm{C}");
});

test("illustrated fission, fusion and alpha channels conserve total A and charge", () => {
  const expected = { fission: [236, 92], fusion: [5, 2], alpha: [238, 92] } as const;
  for (const key of ["fission", "fusion", "alpha"] as const) {
    const { reactants, products } = NUCLEAR_REACTIONS[key];
    for (const side of [reactants, products]) {
      const A = side.reduce((total, term) => total + term.A * term.count, 0);
      const Z = side.reduce((total, term) => total + term.Z * term.count, 0);
      assert.deepEqual([A, Z], expected[key], key);
    }
  }
});

test("the normalized half-life illustration halves the expected parent population", () => {
  assert.deepEqual(HALF_LIFE_EXAMPLE.points.map(point => point.expectedCount), [64, 32, 16, 8, 4]);
});
