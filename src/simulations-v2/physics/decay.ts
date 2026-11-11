/**
 * Simulation v2 — B23 decay physics.
 *
 * Wraps the verified kernel in src/lib/radioactive-decay-model.ts (OpenStax
 * University Physics 3 §10.3) behind the v2 PhysicsModel contract.
 *
 * Model: independent exponential lifetimes. Each nucleus draws a lifetime
 * τ = −ln(1−u)/λ with u uniform in (0,1); the sample is seeded so runs are
 * reproducible. This is a *statistical* model of N₀ independent nuclei, not a
 * deterministic curve — the theoretical expectation N₀·2^(−t/T) is shown
 * alongside so the learner sees the deterministic/statistical distinction.
 *
 * Limits: no detector dead time, no background, no daughter activity, no
 * spatial geometry. Educational simplification only.
 */

import {
  createDecaySample,
  decaySeries,
  type DecaySample,
} from "@/lib/radioactive-decay-model";
import type {
  DerivedQuantity,
  ParameterValues,
  PhysicsModel,
  SimulationDefinition,
} from "../core/types";

export interface DecayState {
  sample: DecaySample;
  timeSeconds: number;
  /** Number of nuclei remaining, maintained incrementally. */
  remaining: number;
}

const PARAM_KEYS = {
  initialCount: "initialCount",
  halfLife: "halfLifeSeconds",
  seed: "seed",
} as const;

export function createDecayState(params: ParameterValues, seed: number): DecayState {
  const initialCount = Math.round(params[PARAM_KEYS.initialCount] ?? 400);
  const halfLifeSeconds = params[PARAM_KEYS.halfLife] ?? 10;
  const effectiveSeed = Math.round(params[PARAM_KEYS.seed] ?? seed);

  const sample = createDecaySample({ initialCount, halfLifeSeconds, seed: effectiveSeed });

  return {
    sample,
    timeSeconds: 0,
    remaining: countRemaining(sample.lifetimes, 0),
  };
}

function countRemaining(lifetimes: readonly number[], timeSeconds: number): number {
  let n = 0;
  for (const lifetime of lifetimes) {
    if (lifetime > timeSeconds) n++;
  }
  return n;
}

/**
 * Advance physics time by dt. The remaining count is recomputed from the
 * (seeded, immutable) lifetimes — never re-sampled — so the run is fully
 * deterministic and matches the theoretical curve in expectation.
 */
export function stepDecayState(
  state: DecayState,
  dt: number,
  _params: ParameterValues
): DecayState {
  const timeSeconds = state.timeSeconds + Math.max(0, dt);
  return {
    sample: state.sample,
    timeSeconds,
    remaining: countRemaining(state.sample.lifetimes, timeSeconds),
  };
}

export function deriveDecay(state: DecayState, _params: ParameterValues): readonly DerivedQuantity[] {
  const { initialCount, halfLifeSeconds } = state.sample;
  const t = state.timeSeconds;
  const lambda = Math.LN2 / halfLifeSeconds;
  const expected = initialCount * 2 ** (-t / halfLifeSeconds);
  const activity = lambda * state.remaining;

  return [
    {
      key: "remaining",
      label: "Số hạt nhân còn lại",
      latex: "N(t) = N_0 \\cdot 2^{-t/T_{1/2}}",
      value: `${state.remaining} / ${initialCount}`,
    },
    {
      key: "expected",
      label: "Giá trị kì vọng",
      latex: "N_{\\text{kỳ vọng}} = N_0 \\cdot 2^{-t/T_{1/2}}",
      value: expected.toFixed(1),
    },
    {
      key: "lambda",
      label: "Hằng số phân rã",
      latex: "\\lambda = \\frac{\\ln 2}{T_{1/2}}",
      value: `${lambda.toFixed(4)} s⁻¹`,
    },
    {
      key: "activity",
      label: "Hoạt độ (ước tính)",
      latex: "H = \\lambda N",
      value: `${activity.toFixed(2)} Bq`,
    },
  ];
}

/**
 * Full B23 reference-simulation definition: parameter specs, presentation
 * scenes, and camera keyframes. Used by the v2 renderer and by tests.
 */
export const B23_DECAY_DEFINITION: SimulationDefinition = {
  activityKey: "radioactive_decay_half_life",
  lessonCode: "B23",
  title: "Định luật phân rã phóng xạ và chu kì bán rã",
  objective:
    "Quan sát quá trình phân rã của một tập hợp hạt nhân, phân biệt kết quả thống kê với đường kì vọng lí thuyết N(t) = N₀·2^(−t/T).",
  parameters: [
    {
      key: PARAM_KEYS.initialCount,
      label: "Số hạt nhân ban đầu N₀",
      unit: "hạt",
      min: 40,
      max: 900,
      step: 20,
      initial: 400,
      note: "Mỗi hạt nhân phân rã độc lập; mẫu càng lớn, đường thực nghiệm càng sát kì vọng.",
    },
    {
      key: PARAM_KEYS.halfLife,
      label: "Chu kì bán rã T₁/₂",
      unit: "s",
      min: 2,
      max: 30,
      step: 1,
      initial: 10,
      note: "Thời gian để một nửa số hạt nhân còn lại phân rã.",
    },
    {
      key: PARAM_KEYS.seed,
      label: "Hạt giống ngẫu nhiên (seed)",
      unit: "",
      min: 1,
      max: 9999,
      step: 1,
      initial: 23,
      note: "Cùng seed ⇒ cùng kết quả; dùng để so sánh các lần “thực nghiệm” khác nhau.",
    },
  ],
  scenes: [
    {
      key: "intro",
      title: "Tập hợp hạt nhân",
      narration:
        "Đây là một tập hợp hạt nhân phóng xạ. Mỗi quả cầu là một hạt nhân chưa phân rã. Chưa biết hạt nào sẽ phân rã trước — đó là bản chất thống kê của phóng xạ.",
      durationSeconds: 5,
    },
    {
      key: "start",
      title: "Bắt đầu phân rã",
      narration:
        "Bấm bắt đầu quá trình. Theo dõi từng hạt nhân chuyển sang trạng thái đã phân rã.",
      durationSeconds: 4,
    },
    {
      key: "first-decays",
      title: "Những phân rã đầu tiên",
      narration:
        "Một số hạt nhân phân rã trước. Không hạt nào ‘già’ hơn hạt khác — thời điểm phân rã hoàn toàn ngẫu nhiên.",
      durationSeconds: 6,
    },
    {
      key: "half-life-mark",
      title: "Đánh dấu chu kì bán rã",
      narration:
        "Sau đúng một chu kì bán rã T₁/₂, số hạt nhân còn lại trung bình giảm còn một nửa. Đây là kì vọng, không phải con số chính xác tuyệt đối của từng lần đo.",
      durationSeconds: 6,
    },
    {
      key: "curve",
      title: "Đường cong phân rã",
      narration:
        "Đồ thị số hạt nhân còn lại theo thời gian là một hàm mũ giảm. Đường lí thuyết N(t) = N₀·2^(−t/T) và kết quả mô phỏng bám sát nhau.",
      durationSeconds: 7,
    },
    {
      key: "compare-runs",
      title: "So sánh các lần thực nghiệm",
      narration:
        "Với cùng chu kì bán rã nhưng seed khác, các đường thực nghiệm khác nhau do ngẫu nhiên. Càng nhiều hạt, sai khác thống kê càng nhỏ.",
      durationSeconds: 7,
    },
    {
      key: "predict",
      title: "Dự đoán",
      narration:
        "Trước khi xem tiếp: sau hai chu kì bán rã, khoảng bao nhiêu phần trăm hạt nhân còn lại?",
      durationSeconds: 1,
      pauseForResponse: true,
      question: {
        prompt: "Sau hai chu kì bán rã, tỉ lệ hạt nhân còn lại xấp xỉ bằng bao nhiêu?",
        choices: ["100%", "75%", "50%", "25%"],
      },
    },
    {
      key: "conclusion",
      title: "Kết luận",
      narration:
        "Sau mỗi chu kì bán rã, số hạt nhân còn lại giảm còn một nửa theo kì vọng. Mô hình thống kê tái tạo đúng đường lí thuyết — với sai khác do ngẫu nhiên và nhỏ dần khi N₀ lớn.",
      durationSeconds: 5,
    },
  ],
  cameraTracks: {
    0: [
      { t: 0, position: [0, 6, 14], target: [0, 0, 0], easing: "smooth" },
      { t: 5, position: [0, 5, 11], target: [0, 0, 0], easing: "smooth" },
    ],
    3: [
      { t: 0, position: [0, 4, 9], target: [0, 0, 0], easing: "smooth" },
      { t: 6, position: [3, 3, 7], target: [0, 0, 0], easing: "smooth" },
    ],
    4: [
      { t: 0, position: [4, 2, 6], target: [0, 0, 0], easing: "smooth" },
      { t: 7, position: [0, 6, 14], target: [0, 0, 0], easing: "smooth" },
    ],
  },
  limitsNote:
    "Mô hình hạt nhân độc lập, phân rã theo hàm mũ. Không mô phỏng hạt con, đầu dò, phông nền hay thời gian chết của bộ đếm. Vị trí các quả cầu chỉ mang tính sơ đồ.",
  sources: [
    "OpenStax University Physics 3, §10.3 Radioactive Decay",
    "SGK Vật lí 12 (Kết nối tri thức), Bài 23 — Hiện tượng phóng xạ",
  ],
};

/** Expose the model in PhysicsModel shape for the generic renderer. */
export const decayPhysicsModel: PhysicsModel<Readonly<Record<string, unknown>>, DecayState> = {
  modelNote: B23_DECAY_DEFINITION.limitsNote,
  create: createDecayState,
  step: stepDecayState,
  derive: deriveDecay,
};

/** Exported for tests: theoretical remaining after t, no seed involved. */
export function theoreticalRemaining(initialCount: number, halfLifeSeconds: number, t: number): number {
  return initialCount * 2 ** (-t / halfLifeSeconds);
}

/** Exported for tests: full deterministic series (expectation only). */
export function theoreticalSeries(
  initialCount: number,
  halfLifeSeconds: number,
  untilSeconds: number,
  stepSeconds = 1
) {
  const points: { timeSeconds: number; expected: number }[] = [];
  for (let t = 0; t <= untilSeconds + 1e-9; t += stepSeconds) {
    points.push({ timeSeconds: t, expected: theoreticalRemaining(initialCount, halfLifeSeconds, t) });
  }
  return points;
}

// re-export for scene/renderer use
export { decaySeries };
