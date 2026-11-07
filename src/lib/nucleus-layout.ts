/** Display conventions only. No position or radius represents a measured nucleon. */
export const NUCLEON_COLORS = { proton: "#f6a05c", neutron: "#54e0d0" } as const;

export type Nucleon = {
  readonly id: string;
  readonly kind: keyof typeof NUCLEON_COLORS;
  readonly x: number;
  readonly y: number;
  readonly z: number;
};

export type NucleusLayout = {
  readonly particles: readonly Nucleon[];
  readonly particleRadius: number;
  readonly radius: number;
};

function seededRandom(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function buildNucleusLayout({ A, Z, N }: { A: number; Z: number; N: number }): NucleusLayout {
  if (![A, Z, N].every(Number.isSafeInteger) || Z < 1 || N < 0 || A !== Z + N) {
    throw new Error("Số nucleon của đồng vị không hợp lệ.");
  }

  const random = seededRandom(A * 65537 + Z);
  const extent = Math.ceil(Math.cbrt(A)) + 1;
  const sites = [];
  for (let x = -extent; x <= extent; x += 1) {
    for (let y = -extent; y <= extent; y += 1) {
      for (let z = -extent; z <= extent; z += 1) {
        // Even parity gives a compact face-centered cubic display lattice.
        if ((x + y + z) % 2 === 0) sites.push({ x, y, z, r2: x*x + y*y + z*z, order: random() });
      }
    }
  }

  const packed = sites.sort((a, b) => a.r2 - b.r2 || a.order - b.order).slice(0, A);
  const center = packed.reduce((c, p) => ({ x: c.x + p.x/A, y: c.y + p.y/A, z: c.z + p.z/A }), { x: 0, y: 0, z: 0 });
  const kinds: Nucleon["kind"][] = Array.from({ length: A }, (_, i) => i < Z ? "proton" : "neutron");
  for (let i = kinds.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
  }
  const counts = { proton: 0, neutron: 0 };
  const particles = packed.map((p, i) => {
    const kind = kinds[i];
    return { id: `${kind}-${++counts[kind]}`, kind, x: p.x - center.x, y: p.y - center.y, z: p.z - center.z };
  });
  const particleRadius = 0.68;
  const radius = particles.reduce((max, p) => Math.max(max, Math.hypot(p.x, p.y, p.z)), 0) + particleRadius;
  return { particles, particleRadius, radius };
}
