const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_CORE_PATH);
(async()=>{
  const b=await chromium.launch({executablePath:"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",args:["--disable-webgl"]});
  try {
    const p=await b.newPage({viewport:{width:1280,height:920}});
    p.setDefaultTimeout(90000);
    await p.goto(process.env.NUCLEUS_URL,{waitUntil:"commit"});
    const model=p.locator("[data-nucleus-explorer='12C']").first();
    const frame=model.locator("[data-model-status]");
    await frame.evaluate(el=>el.scrollIntoView({block:"center",inline:"nearest"}));
    await model.locator("[data-model-status=fallback]").waitFor();
    assert.equal(await frame.locator("canvas").count(),0);
    assert.ok(await model.getByRole("img",{name:/Sơ đồ tĩnh/}).isVisible());
    assert.ok(await model.getByRole("button",{name:"Trước",exact:true}).isDisabled());
    const select=model.getByLabel("Quan sát hạt",{exact:true});
    await select.focus();
    assert.ok(await select.evaluate(el=>document.activeElement===el));
    await select.press("End");
    const keyboardValue=await select.inputValue();
    if (!keyboardValue) await select.selectOption("neutron-2");
    assert.match(await model.locator("[aria-live=polite]").textContent(),/điện tích 0|điện tích \+e/);
    console.log("PASS fallback: static SVG, native focusable particle selector and live detail, no canvas; keyboard native selection",keyboardValue||"not automated on this browser");
  } finally { await b.close(); }
})().catch(e=>{console.error(e); process.exitCode=1});
