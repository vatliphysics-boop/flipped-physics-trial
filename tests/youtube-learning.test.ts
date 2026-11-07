import test from "node:test";
import assert from "node:assert/strict";
// prettier-ignore
// @ts-expect-error Native Node TypeScript stripping requires the source extension.
import { youtubeId, VISUAL_LESSONS } from "../src/lib/visual-learning.ts";
test("Video embedding accepts YouTube IDs but rejects unrelated or credential-bearing URLs", () => {
  assert.equal(youtubeId("https://www.youtube.com/watch?v=D91T-B-PVE0&t=20"), "D91T-B-PVE0");
  assert.equal(youtubeId("https://youtu.be/D91T-B-PVE0"), "D91T-B-PVE0");
  for (const value of ["javascript:alert(1)", "https://youtube.com.evil.test/watch?v=D91T-B-PVE0", "https://user:pass@youtube.com/watch?v=D91T-B-PVE0", "https://www.youtube.com/watch?v=short", "https://youtu.be/D91T-B-PVE0/extra", "http://youtu.be/D91T-B-PVE0", "https://youtube.com:8000/watch?v=D91T-B-PVE0"]) assert.equal(youtubeId(value), null, value);
});
test("Each B21–B25 learning path has a video, observable hotspots and a usable concept question", () => {
  assert.deepEqual(VISUAL_LESSONS.map(l => l.code), ["B21", "B22", "B23", "B24", "B25"]);
  assert.equal(new Set(VISUAL_LESSONS.map(l => l.videoId)).size, 5);
  for (const lesson of VISUAL_LESSONS) {
    assert.equal(youtubeId(`https://www.youtube.com/watch?v=${lesson.videoId}`), lesson.videoId);
    assert.equal(lesson.spots.length, 3);
    assert.ok(lesson.spots.every(s => s.x > 0 && s.x < 100 && s.y > 0 && s.y < 100 && s.observe && s.explain));
    assert.ok(lesson.question.options[lesson.question.answer]);
    assert.ok(lesson.before && lesson.during && lesson.product && lesson.videoTask);
  }
});
