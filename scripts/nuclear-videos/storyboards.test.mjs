import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import katex from "katex";
import { captionAt, captionsVtt, durationInFrames, FPS, HEIGHT, LESSONS, sceneRenderFrames, timeline, WIDTH } from "./storyboards.mjs";

test("all five lessons use contiguous 1080p/30 fps timelines with room to read", () => {
  assert.deepEqual([WIDTH, HEIGHT, FPS], [1920, 1080, 30]);
  assert.deepEqual(Object.keys(LESSONS), ["B21", "B22", "B23", "B24", "B25"]);
  for (const [id, lesson] of Object.entries(LESSONS)) {
    let next = 0;
    for (const scene of timeline(lesson)) {
      assert.equal(scene.from, next);
      assert(scene.motionFrames > 62);
      if (scene.fullMotion) {
        assert(scene.motionFrames > 64);
        assert.deepEqual(sceneRenderFrames(scene), Array.from({ length: scene.motionFrames }, (_, frame) => scene.from + frame));
      } else {
        assert(scene.duration - scene.motionFrames >= FPS * 5);
      }
      assert(scene.caption.length <= 200);
      assert(scene.body.length > 0);
      next += scene.duration;
    }
    assert.equal(next, durationInFrames(lesson));
    assert.equal(next / FPS, id === "B21" ? 72 : 60);
    assert(lesson.sources.length > 1);
  }
});

test("authored equations compile without KaTeX fallback", () => {
  for (const lesson of Object.values(LESSONS)) {
    for (const { formula } of lesson.shots) {
      if (formula) assert.doesNotThrow(() => katex.renderToString(formula, { strict: "error", throwOnError: true }));
    }
  }
});

test("Vietnamese narration has pronounceable text for every visual scene", () => {
  const narration = JSON.parse(readFileSync(new URL("./narration.vi.json", import.meta.url), "utf8"));
  assert.equal(narration.language, "vi-VN");
  assert.deepEqual(Object.keys(narration.lessons), Object.keys(LESSONS));
  for (const [code, lesson] of Object.entries(LESSONS)) {
    const scenes = narration.lessons[code];
    assert.equal(scenes.length, lesson.shots.length);
    for (const [index, scene] of scenes.entries()) {
      assert.equal(scene.sceneIndex, index);
      assert(scene.utterances.length > (lesson.shots[index].resultCue ?? 0));
      for (const { display, spoken } of scene.utterances) {
        assert(display.trim() && display.length <= 140);
        assert(spoken.trim() && !/[\\^_]/.test(spoken));
      }
    }
  }
});

test("narration moves the whole scene, renders every motion frame and captures caption holds", () => {
  const lesson = LESSONS.B21;
  const narration = lesson.shots.map((_, sceneIndex) => ({
    sceneIndex, durationFrames: 151 + sceneIndex,
    cues: [{ from: 8, duration: 75, text: "Điện tích & số khối" }, { from: 101, duration: 33, text: "Tiếp theo" }],
  }));
  const scenes = timeline(lesson, narration);
  const first = scenes[0];
  assert.equal(scenes[1].from, 151);
  assert.equal(durationInFrames(lesson, narration), 921);
  assert.equal(captionAt(first, 7), "");
  assert.equal(captionAt(first, 8), "Điện tích & số khối");
  assert.equal(captionAt(first, 82), "Điện tích & số khối");
  assert.equal(captionAt(first, 83), "");
  assert.equal(captionAt(first, 101), "Tiếp theo");
  assert.equal(captionAt(first, 134), "");
  assert.deepEqual(sceneRenderFrames(first), [...Array.from({ length: 64 }, (_, index) => index), 83, 101, 134]);
  assert.deepEqual(sceneRenderFrames(scenes[1]), [...Array.from({ length: 122 }, (_, index) => 151 + index), 151 + 134]);
  assert.equal(scenes[2].processEndFrame, narration[2].cues[1].from);
  assert.match(captionsVtt(scenes), /00:00:00\.267 --> 00:00:02\.767\nĐiện tích &amp; số khối/);
  assert.match(captionsVtt(scenes), /00:00:05\.300 --> 00:00:07\.800\nĐiện tích &amp; số khối/);
});

test("invalid narration cannot drop or overlap visual scenes and cues", () => {
  const lesson = LESSONS.B22;
  const narration = lesson.shots.map((_, sceneIndex) => ({
    sceneIndex, durationFrames: 75,
    cues: [{ from: 3, duration: 30, text: "Lời đọc" }],
  }));
  assert.throws(() => timeline(lesson, narration.slice(1)), /Số cảnh/);
  assert.throws(() => timeline(lesson, [{ ...narration[0], durationFrames: 40 }, ...narration.slice(1)]), /phần chuyển động/);
  assert.throws(() => timeline(lesson, [{
    ...narration[0], cues: [...narration[0].cues, { from: 25, duration: 10, text: "Chồng thời gian" }],
  }, ...narration.slice(1)]), /chồng thời gian/);
});
