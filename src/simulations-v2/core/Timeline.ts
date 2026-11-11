/**
 * Simulation v2 timeline engine.
 *
 * Manages:
 * – Presentation time (user-visible clock, with speed control)
 * – Scene sequencing (which scene is active, when to auto-advance)
 * – Pause/resume for learner input or teacher control
 *
 * Two distinct motions are modelled:
 *   step(dt)     — forward playback; stops dead at a pause boundary
 *   goToScene(n) — deliberate jump (teacher/manual); never clamps
 *
 * Mixing the two was the original bug: a pause clamp applied to a jump made
 * it impossible to leave a question scene. Keep them separate.
 *
 * All times are seconds at 1× speed; the caller multiplies by playback speed.
 */

import type { SceneSpec } from "./types";

export interface TimelineState {
  /** Seconds elapsed in the presentation, at 1× speed. */
  presentationTime: number;
  /** Active scene index, or -1 if not started. */
  sceneIndex: number;
  /** True if stopped at a scene that demands learner input. */
  waitingForResponse: boolean;
  /** True if playback is paused by a play/pause toggle. */
  paused: boolean;
}

export interface TimelineOptions {
  /** Called after every state change (render loop hook). */
  onFrame?: (state: TimelineState) => void;
  /** Called when a scene becomes active. */
  onSceneStart?: (sceneIndex: number, spec: SceneSpec) => void;
  /** Called when playback stops at a question scene. */
  onSceneWaiting?: (sceneIndex: number) => void;
  /** Called once when presentation time reaches the total duration. */
  onComplete?: () => void;
}

const TIME_EPSILON = 1e-9;

export class Timeline {
  readonly scenes: readonly SceneSpec[];

  private state: TimelineState = {
    presentationTime: 0,
    sceneIndex: -1,
    waitingForResponse: false,
    paused: false,
  };

  private sceneStartTimes: number[] = [];

  private opts: TimelineOptions | undefined;

  constructor(scenes: readonly SceneSpec[], opts?: TimelineOptions) {
    this.scenes = scenes;
    this.opts = opts;
    this.rebuildSceneMap();
  }

  private rebuildSceneMap(): void {
    this.sceneStartTimes = [];
    let t = 0;
    for (const scene of this.scenes) {
      this.sceneStartTimes.push(t);
      t += scene.durationSeconds;
    }
  }

  getState(): Readonly<TimelineState> {
    return Object.freeze({ ...this.state });
  }

  // -------------------------------------------------------------------------
  // Playback
  // -------------------------------------------------------------------------

  /**
   * Advance by dt seconds at 1×. Caller passes real elapsed time × speed.
   * Stops exactly at the end of the first pause scene encountered.
   */
  step(dt: number): void {
    if (this.state.paused || this.state.waitingForResponse) return;
    if (!Number.isFinite(dt) || dt <= 0) return;

    const from = this.state.presentationTime;
    const target = from + dt;

    // First pause boundary strictly ahead of the current position.
    for (let i = 0; i < this.scenes.length; i++) {
      const scene = this.scenes[i]!;
      if (!scene.pauseForResponse) continue;
      const end = this.sceneStartTimes[i]! + scene.durationSeconds;
      if (end > from + TIME_EPSILON && target >= end - TIME_EPSILON) {
        this.enterScene(i);
        this.state.presentationTime = end;
        if (!this.state.waitingForResponse) {
          this.state.waitingForResponse = true;
          this.opts?.onSceneWaiting?.(i);
        }
        this.fireFrame();
        this.fireCompleteIfAtEnd();
        return;
      }
    }

    this.positionAt(target);
  }

  play(): void {
    this.state.paused = false;
    this.fireFrame();
  }

  pause(): void {
    this.state.paused = true;
    this.fireFrame();
  }

  resume(): void {
    this.state.paused = false;
    this.fireFrame();
  }

  togglePlay(): void {
    this.state.paused = !this.state.paused;
    this.fireFrame();
  }

  /**
   * Learner answered the question. Moves on to the next scene, or — if the
   * question was the final scene — stops at the end, paused.
   */
  respondAndContinue(): void {
    if (!this.state.waitingForResponse) return;

    this.state.waitingForResponse = false;
    const next = this.state.sceneIndex + 1;

    if (next < this.scenes.length) {
      this.goToScene(next);
      this.play();
    } else {
      this.state.presentationTime = this.getTotalDuration();
      this.state.paused = true;
      this.fireFrame();
      this.fireCompleteIfAtEnd();
    }
  }

  // -------------------------------------------------------------------------
  // Deliberate positioning (never clamped by pause points)
  // -------------------------------------------------------------------------

  /** Jump to the start of a scene. Clears any waiting state. */
  goToScene(index: number): void {
    if (index < 0 || index >= this.scenes.length) return;
    this.state.waitingForResponse = false;
    const start = this.sceneStartTimes[index]!;
    this.enterScene(index);
    this.state.presentationTime = start;
    this.fireFrame();
  }

  /** Jump to an absolute presentation time (scrubber). */
  seekTo(time: number): void {
    this.state.waitingForResponse = false;
    this.positionAt(time);
  }

  /** Back to the start of the current scene. */
  rewind(): void {
    const index = Math.max(0, this.state.sceneIndex);
    this.goToScene(index);
  }

  /** Back to the very beginning, paused at t=0. */
  reset(): void {
    this.state = {
      presentationTime: 0,
      sceneIndex: -1,
      waitingForResponse: false,
      paused: false,
    };
    if (this.scenes.length > 0) {
      this.enterScene(0);
      this.state.presentationTime = 0;
    }
    this.fireFrame();
  }

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  getTotalDuration(): number {
    return this.scenes.reduce((sum, s) => sum + s.durationSeconds, 0);
  }

  /** Physics time in seconds; currently 1:1 with presentation time. */
  getPhysicsTime(): number {
    return this.state.presentationTime;
  }

  /** Time within the active scene, from 0 to that scene's duration. */
  getSceneTime(): number {
    if (this.state.sceneIndex < 0) return 0;
    return this.state.presentationTime - this.sceneStartTimes[this.state.sceneIndex]!;
  }

  getSceneStart(index: number): number {
    return this.sceneStartTimes[index] ?? 0;
  }

  /** 0..1 progress through the whole presentation. */
  getProgress(): number {
    const total = this.getTotalDuration();
    return total > 0 ? Math.min(1, Math.max(0, this.state.presentationTime / total)) : 0;
  }

  // -------------------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------------------

  private enterScene(index: number): void {
    if (index < 0 || index >= this.scenes.length) return;
    if (index === this.state.sceneIndex) return;
    this.state.sceneIndex = index;
    this.opts?.onSceneStart?.(index, this.scenes[index]!);
  }

  /** Position at an absolute time, resolving the scene. No pause clamping. */
  private positionAt(time: number): void {
    const total = this.getTotalDuration();
    const clamped = Math.min(Math.max(0, time), total);

    let index = -1;
    for (let i = this.scenes.length - 1; i >= 0; i--) {
      if (clamped >= this.sceneStartTimes[i]! - TIME_EPSILON) {
        index = i;
        break;
      }
    }

    if (index >= 0) this.enterScene(index);
    this.state.presentationTime = clamped;
    this.fireFrame();
    this.fireCompleteIfAtEnd();
  }

  private fireFrame(): void {
    this.opts?.onFrame?.(this.state);
  }

  private fireCompleteIfAtEnd(): void {
    if (Math.abs(this.state.presentationTime - this.getTotalDuration()) <= TIME_EPSILON) {
      this.opts?.onComplete?.();
    }
  }
}

/** Test helper: N equal scenes; the last one pauses for response. */
export function createTestTimeline(durationPerScene: number, count: number): Timeline {
  const scenes: SceneSpec[] = Array.from({ length: count }, (_, i) => ({
    key: `scene_${i}`,
    title: `Scene ${i + 1}`,
    narration: `Scene ${i + 1}`,
    durationSeconds: durationPerScene,
    pauseForResponse: i === count - 1,
  }));
  return new Timeline(scenes);
}
