import assert from "node:assert/strict";
import { test } from "node:test";
import { buildNucleusLayout } from "../src/lib/nucleus-layout";
import { NUCLIDES } from "../src/lib/nuclear-science";

test("web and video can reuse a fixed, count-correct nucleus layout for every supported nuclide", () => {
  for (const nuclide of Object.values(NUCLIDES)) {
    const layout = buildNucleusLayout(nuclide);
    assert.deepEqual(buildNucleusLayout(nuclide), layout, nuclide.name);
    assert.equal(layout.particles.length, nuclide.A, nuclide.name);
    assert.equal(layout.particles.filter(particle => particle.kind === "proton").length, nuclide.Z, nuclide.name);
    assert.equal(layout.particles.filter(particle => particle.kind === "neutron").length, nuclide.N, nuclide.name);
    assert.equal(new Set(layout.particles.map(particle => particle.id)).size, nuclide.A, nuclide.name);
    assert.equal(new Set(layout.particles.map(({ x, y, z }) => `${x},${y},${z}`)).size, nuclide.A, nuclide.name);
    for (const { x, y, z } of layout.particles) {
      assert(Math.hypot(x, y, z) + layout.particleRadius <= layout.radius, nuclide.name);
    }
  }
});

test("inconsistent counts cannot produce an illustrative layout", () => {
  assert.throws(() => buildNucleusLayout({ A: 12, Z: 6, N: 7 }), /không hợp lệ/);
});
