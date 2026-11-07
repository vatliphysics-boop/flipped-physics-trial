const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_CORE_PATH);
(async()=>{
  const b=await chromium.launch({executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",args:["--enable-unsafe-swiftshader"]});
  try{
    const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,reducedMotion:"reduce"});
    p.setDefaultTimeout(90000);
    p.on("pageerror",e=>console.error("page:",e.message));
    await p.goto(process.env.NUCLEUS_URL,{waitUntil:"commit"});
    const model=p.locator("[data-nucleus-explorer='12C']").first();
    const frame=model.locator("[data-model-status]");
    await frame.evaluate(el=>el.scrollIntoView({block:"center",inline:"nearest"}));
    await model.locator("[data-model-status=ready]").waitFor();
    assert.deepEqual(await model.locator("dd").allTextContents(),["6","6","12"]);
    const front=model.getByRole("button",{name:"Trước",exact:true});
    await front.evaluate(el=>el.click());
    assert.equal(await front.getAttribute("aria-pressed"),"true");
    assert.equal(await model.getByRole("button",{name:"Tự xoay"}).isDisabled(),true);
    const cdp=await p.context().newCDPSession(p);
    const getTouchCenter=()=>frame.evaluate(el=>{
      const r=el.getBoundingClientRect();
      return {x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2)};
    });
    async function swipe(dx,dy){
      const {x,y}=await getTouchCenter();
      console.log("hit",await p.evaluate(({x,y})=>document.elementFromPoint(x,y)?.tagName,{x,y}));
      await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y}]});
      for (let i=1;i<=8;i++) await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:x+dx*i/8,y:y+dy*i/8}]});
      await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
    }
    await swipe(100,1);
    assert.equal(await front.getAttribute("aria-pressed"),"false");
    const before=await p.evaluate(()=>window.scrollY);
    await swipe(1,-96);
    await p.waitForTimeout(400);
    const after=await p.evaluate(()=>window.scrollY);
    assert.ok(after>before+25, `scroll before=${before}, after=${after}`);
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    if(process.env.NUCLEUS_CAPTURE) {
      await frame.evaluate(el=>el.scrollIntoView({block:"center",inline:"nearest"}));
      await p.screenshot({path:process.env.NUCLEUS_CAPTURE, timeout:45000});
    }
    console.log("PASS mobile WebGL horizontal orbit, vertical swipe scroll, reduced motion, 6+6=12, no overflow");
  } finally { await b.close(); }
})().catch(e=>{console.error(e); process.exitCode=1});
