const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH || "playwright-core");

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--disable-webgl"],
  });
  try {
    const page = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    for (const id of process.argv.length > 2 ? process.argv.slice(2) : ["B21","B22","B23","B24","B25"]) {
      await page.goto(`${process.env.BASE_URL || "http://localhost:3000"}/hoc-lieu/phong-hat-nhan?bai=${id}#video`, {waitUntil:"domcontentloaded",timeout:45000});
      await page.getByRole("button",{name:new RegExp(`Mở video ${id}`)}).click({timeout:15000});
      const media = page.locator("video").first();
      const report = await media.evaluate(async video => {
        if (video.readyState < 1) await new Promise((resolve,reject) => {
          video.addEventListener("loadedmetadata",resolve,{once:true});
          video.addEventListener("error",reject,{once:true});
        });
        video.muted = true;
        await video.play();
        await new Promise(resolve => video.requestVideoFrameCallback(resolve));
        video.pause();
        const capture = async seconds => {
          const seeked = new Promise(resolve => video.addEventListener("seeked",resolve,{once:true}));
          video.currentTime = seconds;
          await seeked;
          return video.currentTime;
        };
        const current = [await capture(video.duration / 2), await capture(video.duration - 0.10)];
        const track = video.textTracks[0];
        const trackElement = video.querySelector("track");
        if (!track || !trackElement) throw Error("Vietnamese caption track is absent");
        const loaded = new Promise((resolve, reject) => {
          if (trackElement.readyState === 2) return resolve();
          trackElement.addEventListener("load", resolve, {once:true});
          trackElement.addEventListener("error", reject, {once:true});
        });
        track.mode = "hidden";
        await loaded;
        return {duration:video.duration,width:video.videoWidth,height:video.videoHeight,current,track:track.language,cues:track.cues.length};
      });
      assert.deepEqual([report.width,report.height,report.duration,report.track,report.cues], [1920,1080,id==="B21"?72:60,"vi",id==="B21"?6:5]);
      assert(Math.abs(report.current[0]-report.duration/2)<0.1 && report.current[1] > report.duration-0.2);
      console.log(`PASS ${id} opens on demand, plays and seeks middle/end in 390px browser`, report);
    }
  } finally { await browser.close(); }
})().catch(err=>{console.error(err);process.exitCode=1;});
