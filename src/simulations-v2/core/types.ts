/**
 * Simulation v2 — shared contracts.
 *
 * Layering (see docs/simulation-v2/SIMULATION_SYSTEM_AUDIT.md §10):
 *   physics/  → pure math, no Three.js, no React
 *   core/     → simulation state + timeline, no Three.js
 *   renderer/ → Three.js scene construction
 *   scenes/   → per-activity scene definitions (physics + visuals + narration)
 *   overlays/ → React UI (ScientificUI, timeline, teacher panel)
 *   learning/ → onProgress / activity-completion wiring
 *
 * Nothing in this file may import from "three" or "react".
 */

/** One parameter the learner (or teacher) can adjust. */
export interface SimulationParameterSpec {
  key: string;
  label: string;
  /** SI or physics-native unit shown next to the value; "" for dimensionless. */
  unit: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  /** Short physics note explaining what the parameter means in the model. */
  note?: string;
}

/** Current numeric value of a parameter set, keyed by SimulationParameterSpec.key. */
export type ParameterValues = Readonly<Record<string, number>>;

/** A quantity computed by the physics model for display (formula panel, metrics row). */
export interface DerivedQuantity {
  key: string;
  label: string;
  /** LaTeX body (no surrounding $…$); rendered with KaTeX by the overlay. */
  latex: string;
  /** Plain-text value with unit, e.g. "2.31 × 10⁻⁴ s⁻¹". */
  value: string;
}

/**
 * A named beat of the auto-presentation. Scenes are declarative: the timeline
 * walks them in order; each scene states how long it lasts in *presentation*
 * seconds and whether it should pause for learner input.
 */
export interface SceneSpec {
  key: string;
  /** Short label shown on the timeline chips. */
  title: string;
  /** Narration / caption shown while the scene plays. */
  narration: string;
  /** Duration in presentation seconds at 1× speed. */
  durationSeconds: number;
  /** Pause at scene start until the learner continues (prediction questions). */
  pauseForResponse?: boolean;
  /** Optional question shown while paused. */
  question?: {
    prompt: string;
    /** Learner picks one; free text is allowed via "other". */
    choices?: readonly string[];
  };
}

/** Camera instruction evaluated by the renderer each frame. */
export interface CameraKeyframe {
  /** Presentation time (s) at which the camera reaches this pose. */
  t: number;
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  /** Optional easing; default smoothstep between keyframes. */
  easing?: "linear" | "smooth";
}

/** What a scene tells the renderer to draw. Renderer interprets per activity. */
export interface SceneVisualState {
  /** Scene index; renderer may crossfade between scenes. */
  sceneIndex: number;
  /** Presentation time within the scene, seconds. */
  sceneTime: number;
  /** Physics time exposed by the model (may be scaled, e.g. years vs seconds). */
  physicsTime: number;
  /** Camera pose interpolated from the scene's keyframes. */
  camera: CameraKeyframe | null;
  /** Free-form per-scene payload (decay counts, beam progress, …). */
  data: Readonly<Record<string, unknown>>;
}

/** Contract every v2 physics model satisfies. Pure, testable, no Three.js. */
export interface PhysicsModel<P, S> {
  /** Human-readable model statement incl. assumptions and limits. */
  readonly modelNote: string;
  /** Build the initial state from parameter values. */
  create(params: ParameterValues, seed: number): S;
  /** Advance state by dt physics-seconds (or physics-units of the model). */
  step(state: S, dt: number, params: ParameterValues): S;
  /** Derived quantities for the UI at the current state. */
  derive(state: S, params: ParameterValues): readonly DerivedQuantity[];
}

/** A full v2 simulation: parameters, scenes, physics and renderer hints. */
export interface SimulationDefinition {
  /** Canonical activity key from src/lib/curriculum.ts. */
  activityKey: string;
  lessonCode: "B21" | "B22" | "B23" | "B24" | "B25";
  title: string;
  /** One-line learning objective (yêu cầu cần đạt phrasing). */
  objective: string;
  parameters: readonly SimulationParameterSpec[];
  scenes: readonly SceneSpec[];
  /** Camera keyframes per scene index, in scene-local seconds. */
  cameraTracks: Readonly<Record<number, readonly CameraKeyframe[]>>;
  /** Explicit statement of simplifications/limits shown in the UI. */
  limitsNote: string;
  /** Verified source(s), e.g. "OpenStax University Physics 3 §10.3". */
  sources: readonly string[];
}

/** Presentation speed multipliers offered by the timeline control. */
export const SPEED_STEPS = [0.25, 0.5, 1, 1.5, 2] as const;
export type SpeedStep = (typeof SPEED_STEPS)[number];

/** Clamp helper used by parameter validation everywhere in v2. */
export function clampParameter(spec: SimulationParameterSpec, raw: number): number {
  if (!Number.isFinite(raw)) return spec.initial;
  return Math.min(spec.max, Math.max(spec.min, raw));
}

/** Round a raw slider value to the spec's step, avoiding float drift. */
export function snapParameter(spec: SimulationParameterSpec, raw: number): number {
  const clamped = clampParameter(spec, raw);
  const steps = Math.round((clamped - spec.min) / spec.step);
  const snapped = spec.min + steps * spec.step;
  // Guard float artifacts like 0.30000000000000004.
  return Number(snapped.toPrecision(12));
}
