import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {writeFile} from "node:fs/promises";
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_CORE_PATH);
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
const report=[];
try{
 const page=await browser.newPage({viewport:{width:1366,height:900},reducedMotion:"reduce"});
 const errors=[];
 page.on("pageerror",error=>errors.push(error.message));
 for(const width of [1366,390]){
   await page.setViewportSize({width,height:900});
   await page.goto("http://127.0.0.1:3476/hoc-lieu/truc-quan?bai=B22",{waitUntil:"domcontentloaded",timeout:90000});
   const lab=page.getByRole("region",{name:"Mô phỏng phân hạch",exact:true});
   await lab.waitFor();
   const start=lab.getByRole("button",{name:"Bắt đầu thí nghiệm 3D",exact:true});
   await start.click();
   const pause=lab.getByRole("button",{name:"Tạm dừng",exact:true});
   await pause.waitFor();
   const canvas=lab.locator(".fission-canvas canvas");
   await canvas.waitFor();
   await pause.click();
   const slider=lab.getByRole("slider",{name:"Thời điểm phân hạch",exact:true});
   const pausedTime=await slider.inputValue();
   await page.waitForTimeout(400);
   assert.equal(await slider.inputValue(),pausedTime);
   await lab.getByRole("button",{name:"Tiếp tục",exact:true}).click();
   await page.waitForTimeout(450);
   await lab.getByRole("button",{name:"Tạm dừng",exact:true}).click();
   assert(+await slider.inputValue()>+pausedTime,"Time did not advance on resume");
   await lab.getByRole("button",{name:/Mảnh phân hạch tách ra/}).click();
   await lab.getByRole("button",{name:"Phía trước",exact:true}).click();
   assert.match(await lab.locator(".fission-live-counts").textContent(),/Y-95.*I-138.*3 neutron/);
   assert.equal(await page.locator(".katex-error").count(),0);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),"Document overflow");
   await lab.locator(".fission-stage").scrollIntoViewIfNeeded();
   await page.waitForTimeout(700);
   await page.screenshot({path:`docs/previews/physics-process/studio-b22-${width}.png`});
   report.push({width,guidedFission:true,webgl:true,pause:true,resume:true,conservedProducts:true,noOverflow:true});
   console.log("PASS B22 studio",width);
 }
 assert.deepEqual(errors,[]);
 await writeFile("tmp/nuclear-process/studio-b22-results.json",JSON.stringify({base:"http://127.0.0.1:3476",report,errors},null,2)+"\n");
}finally{await browser.close();}
