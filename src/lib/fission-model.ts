import { ATOMIC_MASS_ENERGY_MEV } from "./physics";

/** One illustrative channel in SGK Vật lí 12 KNTT, pp. 100–101 (Fig. 22.6).
 * Timeline seconds are teaching-model seconds, not nuclear reaction times. */
export const FISSION_CHANNEL = {
  target: { symbol: "U", a: 235, z: 92 },
  compound: { symbol: "U*", a: 236, z: 92 },
  fragments: [{ symbol: "Y", a: 95, z: 39 }, { symbol: "I", a: 138, z: 53 }],
  neutrons: 3,
} as const;

export const FISSION_MASS_SOURCE = "https://www-nds.iaea.org/amdc/ame2020/mass_1.mas20.txt";
/** AME2020 ground-state neutral-atom masses, plus the free neutron mass, in u. */
export const FISSION_MASSES_U = { U235: 235.043928117, Y95: 94.912819697, I138: 137.922726392, neutron: 1.00866491590 } as const;
const beforeMassU = FISSION_MASSES_U.U235 + FISSION_MASSES_U.neutron;
const afterMassU = FISSION_MASSES_U.Y95 + FISSION_MASSES_U.I138 + FISSION_CHANNEL.neutrons * FISSION_MASSES_U.neutron;
const massDifferenceU = beforeMassU - afterMassU;
export const FISSION_ENERGY = { beforeMassU, afterMassU, massDifferenceU, qMeV: massDifferenceU * ATOMIC_MASS_ENERGY_MEV } as const;

export const FISSION_DURATION = 8;
export const FISSION_STAGES = [
  { time: 0, title: "Neutron tới", text: "Một neutron tới gần U-235. Trước phản ứng: 235 + 1 nucleon, 92 proton." },
  { time: 2.3, title: "Hấp thụ neutron", text: "U-235 hấp thụ neutron, tạo U-236 ở trạng thái kích thích. Số proton vẫn là 92." },
  { time: 3.7, title: "Hạt nhân biến dạng", text: "Hạt nhân kích thích biến dạng rồi tách. Chuyển động được làm chậm để nhìn rõ quá trình." },
  { time: 7, title: "Mảnh phân hạch tách ra", text: "Kênh minh họa tạo Y-95, I-138 và 3 neutron. Các sản phẩm mang năng lượng; neutron có thể gây phân hạch tiếp theo nếu gặp hạt nhân thích hợp." },
] as const;
export function fissionState(seconds: number, incidentNeutron = true) {
  const time = Math.max(0, Math.min(FISSION_DURATION, incidentNeutron && Number.isFinite(seconds) ? seconds : 0));
  const stage = time < 2 ? 0 : time < 3 ? 1 : time < 4.5 ? 2 : 3;
  return { time, stage, incidentNeutron, approach: Math.min(time / 2, 1), deformation: Math.max(0, Math.min((time - 3) / 1.5, 1)), separation: Math.max(0, Math.min((time - 4.5) / 3.5, 1)), finished: time === FISSION_DURATION };
}

const neutronDirections = [[-0.8, 0.6, 0.5], [0.4, 0.7, -0.7], [0.6, -0.1, 0.8]] as const;

/** Schematic coordinates for web and film. They are not physical trajectories. */
export function fissionMotion(seconds: number, incidentNeutron = true) {
  const state = fissionState(seconds, incidentNeutron);
  const distance = 1.1 + state.separation * 2.2;
  const neutronDistance = 0.5 + 4.3 * state.separation;
  return {
    ...state,
    incomingX: -4.6 * (1 - state.approach),
    fragmentOffsets: [-distance, distance] as const,
    neutronPositions: neutronDirections.map(([x, y, z]) => {
      const scale = neutronDistance / Math.hypot(x, y, z);
      return [x * scale, y * scale, z * scale] as const;
    }),
    stretchX: 1 + state.deformation * 0.65,
    stretchY: 1 - state.deformation * 0.2,
    separationBlend: Math.min(state.separation * 6, 1),
  };
}
export function fissionConservation() {
  return {
    inputA: FISSION_CHANNEL.target.a + 1,
    outputA: FISSION_CHANNEL.fragments.reduce((n, f) => n + f.a, 0) + FISSION_CHANNEL.neutrons,
    inputZ: FISSION_CHANNEL.target.z,
    outputZ: FISSION_CHANNEL.fragments.reduce((n, f) => n + f.z, 0),
  };
}
export function fissionNucleons() {
  const c = FISSION_CHANNEL;
  const protons = c.fragments.flatMap((f, fragment) => Array.from({ length: f.z }, (_, local) => ({ proton: true, fragment, local })));
  const neutrons = c.fragments.flatMap((f, fragment) => Array.from({ length: f.a - f.z }, (_, i) => ({ proton: false, fragment, local: f.z + i })));
  const free = Array.from({ length: c.neutrons }, (_, i) => ({ proton: false, fragment: 2 + i, local: 0 }));
  return [...protons, ...neutrons, ...free];
}
/** Expected generation size in a qualitative, constant-k model (no reactor prediction). */
export function neutronGenerations(k: number, generations = 5) {
  if (!Number.isFinite(k) || k < 0 || k > 3 || !Number.isInteger(generations) || generations < 0 || generations > 10) throw new RangeError("Invalid qualitative chain parameters");
  return Array.from({ length: generations + 1 }, (_, generation) => ({ generation, expected: Math.pow(k, generation) }));
}
