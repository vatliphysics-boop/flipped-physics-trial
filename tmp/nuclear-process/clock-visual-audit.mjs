import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_CORE_PATH);
const b=await chromium.launch({executablePath:process.env.CHROME_PATH});
try{
 const p=await b.newPage({viewport:{width:1366,height:900},reducedMotion:"reduce"});
 await p.addInitScript(()=>{
   const NativeObserver=window.IntersectionObserver;
   window.observedProcess=[];
   window.IntersectionObserver=class extends NativeObserver{
     constructor(callback, options){
       super((entries,observer)=>{
         for(const entry of entries)if(entry.target.matches("[data-process]"))window.observedProcess.push([performance.now(),entry.isIntersecting,entry.target.dataset.process]);
         callback(entries,observer);
       },options);
     }
   };
 });
 const base=process.env.BASE_URL || "http://localhost:3000";
 await p.goto(base+"/hoc-lieu/phong-hat-nhan?bai=B23#qua-trinh",{waitUntil:"domcontentloaded",timeout:90000});
 const lab=p.locator('[data-process="B23"]');
 const button=lab.getByRole("button",{name:"Bắt đầu",exact:true});
 await button.waitFor();
 const hydrated = selector => p.waitForFunction(selector=>{
   const el=document.querySelector(selector);
   return el&&Object.keys(el).some(k=>k.startsWith("__reactProps$")&&typeof el[k].onClick==="function");
 },selector,{timeout:90000});
 await hydrated('[data-process="B23"] button');
 await button.click();
 for(let i=0;i<3;i++){
   await p.waitForTimeout(400);
   console.log(JSON.stringify(await p.evaluate(()=>({hidden:document.hidden,t:document.querySelector('[data-process="B23"] [data-time]')?.textContent,btn:document.querySelector('[data-process="B23"] button')?.textContent,entries:window.observedProcess,scrollY}))));
 }
 await lab.getByRole("button",{name:"Tạm dừng",exact:true}).click();
 const paused=await lab.locator("[data-time]").textContent();
 await p.waitForTimeout(300);
 if(paused!==await lab.locator("[data-time]").textContent())throw new Error("Clock changed after pause");
 console.log("PASS B23 hydration-aware start and pause");
} finally {await b.close();}
