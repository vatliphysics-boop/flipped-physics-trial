import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync } from "node:fs";
import sharp from "sharp";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { FPS, LESSONS, timeline } from "../../scripts/nuclear-videos/storyboards.mjs";

const here = import.meta.dirname;
const root = resolve(here, "../..");
const rendererRoot = join(root, "scripts/nuclear-videos");
const require = createRequire(join(rendererRoot, "package.json"));
const { bundle } = require("@remotion/bundler");
const { openBrowser, RenderInternals, renderFrames, selectComposition } = require("@remotion/renderer");
const bin = type => RenderInternals.getExecutablePath({ type, indent: false, logLevel: "error", binariesDirectory: null });
const cmd = (file, args, capture = false) => new Promise((resolve, reject) => {
  const child = spawn(file, args, {cwd:dirname(file),stdio:["ignore",capture?"pipe":"inherit","inherit"]});
  let output = "";
  child.stdout?.on("data", data => output += data);
  child.on("error", reject);
  child.on("close", code => code === 0 ? resolve(output) : reject(Error(`${file} exited ${code}`)));
});

const codes = process.argv.slice(2);
let bundlePath;
let browser;
async function startBrowser() {
  if (browser) return;
  bundlePath = await bundle({
    entryPoint: join(rendererRoot, "film.jsx"), publicDir: join(rendererRoot,"assets"), enableCaching:false,
    webpackOverride: config => ({...config,optimization:{...config.optimization,minimize:false}}),
    onProgress: p => console.log("Repair bundle", p),
  });
  browser = await openBrowser("chrome",{ logLevel:"warn" });
}
async function spliceFrames(source, target, replacements, duration) {
  const ffmpeg = bin("ffmpeg");
  const decode = spawn(ffmpeg,["-hide_banner","-v","error","-threads","4","-i",source,
    "-f","image2pipe","-vcodec","mjpeg","-q:v","1","pipe:1"],{cwd:dirname(ffmpeg),stdio:["ignore","pipe","inherit"]});
  const encode = spawn(ffmpeg,["-hide_banner","-v","error","-y","-f","image2pipe","-framerate",String(FPS),
    "-vcodec","mjpeg","-i","pipe:0","-an","-c:v","libx264","-preset","veryfast","-crf","16",
    "-threads","4","-pix_fmt","yuv420p","-movflags","+faststart",target],{cwd:dirname(ffmpeg),stdio:["pipe","ignore","inherit"]});
  const decodeExit = once(decode,"close");
  const encodeExit = once(encode,"close");
  encode.stdin.on("error", () => {});
  const endMarker = Buffer.from([0xff,0xd9]);
  let pending = Buffer.alloc(0);
  let n = 0;
  try {
    for await (const chunk of decode.stdout) {
      pending = Buffer.concat([pending,chunk]);
      let end;
      while ((end=pending.indexOf(endMarker)) >= 0) {
        const frame = replacements.get(n) ?? pending.subarray(0,end+2);
        if (!encode.stdin.write(frame)) await once(encode.stdin,"drain");
        pending = pending.subarray(end+2);
        n++;
      }
    }
    encode.stdin.end();
    const [[a],[b]] = await Promise.all([decodeExit,encodeExit]);
    assert.deepEqual([a,b,n,pending.length],[0,0,duration,0]);
  } catch (error) {
    decode.kill();
    encode.kill();
    throw error;
  }
}
try {
  for (const code of codes) {
    const key = code.toLowerCase();
    const scratch = join(here,key,"repair-parallel");
    await mkdir(scratch,{recursive:true});
    const found = JSON.parse(await readFile(join(here,key,"integrity.json"),"utf8"));
    const frames = found.flatMap(scene => scene.damaged.map(offset => scene.seconds * FPS + offset));
    if (!frames.length) continue;
    const imagePath = frame => join(scratch,`f${frame}.png`);
    const missing = frames.filter(frame => !existsSync(imagePath(frame)));
    if (missing.length) {
      await startBrowser();
      const common = {serveUrl:bundlePath,port:43127,puppeteerInstance:browser,inputProps:{},logLevel:"warn"};
      const composition = await selectComposition({...common,id:code});
      await renderFrames({ ...common, composition, outputDir: null, frames: missing,
        concurrency: 4, imageFormat: "png", muted: true,
        onFrameBuffer: async (buffer, frame) => {
          await writeFile(imagePath(frame), buffer);
          console.log(code, "captured frame", frame);
        },
      });
    }
    const repairs = new Map(await Promise.all(frames.map(async frame =>
      [frame,await sharp(imagePath(frame)).jpeg({quality:100,chromaSubsampling:"4:4:4"}).toBuffer()])));
    const duration = timeline(LESSONS[code]).reduce((sum,scene) => sum+scene.duration,0);
    const publicMp4 = join(root,"public/videos/nuclear-lessons",`${key}.mp4`);
    const repaired = join(scratch,`${key}.mp4`);
    await spliceFrames(publicMp4,repaired,repairs,duration);
    const probe = JSON.parse(await cmd(bin("ffprobe"),["-v","error","-show_streams","-show_format","-of","json",repaired],true));
    const actual = probe.streams[0];
    assert.equal(Number(actual.nb_frames),duration);
    assert.deepEqual([actual.width,actual.height,actual.avg_frame_rate],[1920,1080,"30/1"]);
    await rename(repaired,publicMp4);
    const metadataPath = join(here,key,"metadata.json");
    const metadata = JSON.parse(await readFile(metadataPath,"utf8"));
    await writeFile(metadataPath,JSON.stringify({...metadata,bytes:Number(probe.format.size),repairedMotionFrames:frames},null,2)+"\n");
    console.log("REPAIRED",code,frames);
  }
} finally {
  if (browser) await browser.close({silent:true});
  if (bundlePath) await rm(bundlePath,{recursive:true,force:true});
}
