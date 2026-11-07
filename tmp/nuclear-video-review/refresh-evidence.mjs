import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { FPS, LESSONS, timeline } from "../../scripts/nuclear-videos/storyboards.mjs";
const workspace = resolve(import.meta.dirname, "../..");
const fromRenderer = createRequire(join(workspace, "scripts/nuclear-videos/package.json"));
const { RenderInternals } = fromRenderer("@remotion/renderer");
const ffmpeg = RenderInternals.getExecutablePath({ type: "ffmpeg", indent: false, logLevel: "error", binariesDirectory: null });
const repaired = {B21:779,B23:722,B24:404};
for (const code of process.argv.slice(2)) {
  const key = code.toLowerCase();
  const mp4 = join(workspace, "public/videos/nuclear-lessons", `${key}.mp4`);
  const folder = join(import.meta.dirname, key, "decoded");
  const scenes = timeline(LESSONS[code]);
  const last = scenes.at(-1);
  const duration = last.from + last.duration;
  const moments = {start:0,middle:Math.floor(duration/2),end:duration-1};
  for (const scene of scenes) {
    const name = `${String(scene.from / FPS).padStart(2,"0")}s`;
    moments[`shot-${name}`] = scene.from + scene.motionFrames - 1;
    moments[`transition-${name}`] = scene.from + Math.floor(scene.motionFrames/2);
  }
  if (repaired[code]) moments[`repaired-${repaired[code]}`] = repaired[code];
  for (const [name,frame] of Object.entries(moments)) {
    const args = ["-hide_banner","-loglevel","error","-y","-ss",String(frame/FPS),"-i",mp4,
      "-frames:v","1","-vf","scale=960:540",join(folder,`${name}.jpg`)];
    const result = spawnSync(ffmpeg,args,{cwd:dirname(ffmpeg)});
    assert.equal(result.status,0,result.stderr.toString());
  }
  console.log(`${code}: ${Object.keys(moments).length} extracts from final MP4`);
}
