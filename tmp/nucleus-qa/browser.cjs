const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const path = require("node:path");
const sharp = require("sharp");
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH);
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const origin = process.env.NUCLEUS_QA_BASE || "http://localhost:3000";
const route = origin + (process.env.NUCLEUS_QA_PATH || "/hoc-lieu/phong-hat-nhan?bai=B21");
const dir = path.resolve("docs/previews/nuclear-lab");
const args = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"];
const hash = b => createHash("sha256").update(b).digest("hex");
const capture = async (model, name) => model.screenshot({path: path.join(dir, name + ".png"), animations: "disabled"});
const canvasShot = async viewport => viewport.screenshot({ animations: "disabled" });
async function visualDelta(a, b) {
  const raw = png => sharp(png).resize(240, 240, {fit:"fill"}).removeAlpha().raw().toBuffer();
  const [aa, bb] = await Promise.all([raw(a),raw(b)]);
  let total = 0;
  for (let i = 0; i < aa.length; i++) total += Math.abs(aa[i]-bb[i]);
  return total / aa.length;
}
const modelOn = page => page.locator("[data-nucleus-explorer='12C']").first();
async function open(page) {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(route, { waitUntil: "domcontentloaded" });
  const model = modelOn(page);
  await model.evaluate(el => el.scrollIntoView({block:"start", inline:"nearest"}));
  await model.locator("[data-model-status=ready]").waitFor();
  assert.equal(await model.locator("option").count(), 13);
  assert.deepEqual(await model.locator("dd").allTextContents(), ["6","6","12"]);
  return { model, errors, viewport: model.locator("[data-model-status]") };
}
(async () => {
  const browser = await chromium.launch({executablePath: chrome, args});
  try {
    if (!process.env.SKIP_DESKTOP) {
    const desktop = await browser.newPage({viewport: { width: 1360, height: 1120 }});
    const {model, viewport, errors} = await open(desktop);
    const choices = [["Trước","carbon-12-truoc"],["Sau","carbon-12-sau"],["Bên","carbon-12-ben"],["Trên","carbon-12-tren"]];
    const views = new Set();
    for (const [label, filename] of choices) {
      await model.getByRole("button", { name: label, exact: true }).click();
      assert.equal(await model.getByRole("button", { name: label, exact: true }).getAttribute("aria-pressed"), "true");
      views.add(hash(await canvasShot(viewport)));
      await capture(model, filename);
    }
    assert.equal(views.size, choices.length, "camera presets must show four distinct renders");
    const beforeZoom = await canvasShot(viewport);
    await model.getByRole("button", {name:"Phóng to"}).click();
    assert.ok(await visualDelta(await canvasShot(viewport), beforeZoom) > 3);
    await model.getByRole("button", {name:"Thu nhỏ"}).click();
    assert.ok(await visualDelta(await canvasShot(viewport), beforeZoom) < 2);
    const box = await viewport.boundingBox();
    await desktop.mouse.move(box.x + box.width/2, box.y + box.height/2);
    await desktop.mouse.down();
    await desktop.mouse.move(box.x + box.width/2 + 88, box.y + box.height/2 + 30, {steps: 10});
    await desktop.mouse.up();
    assert.ok(await visualDelta(await canvasShot(viewport), beforeZoom) > 3);
    await viewport.focus();
    const beforeKey = await canvasShot(viewport);
    await viewport.press("ArrowLeft");
    assert.ok(await visualDelta(await canvasShot(viewport), beforeKey) > 3);
    await viewport.press("Home");
    const restored = await canvasShot(viewport);
    const box2 = await viewport.boundingBox();
    await desktop.mouse.click(box2.x + box2.width/2, box2.y + box2.height/2);
    assert.match(await model.locator("select").inputValue(), /^(proton|neutron)-/);
    assert.match(await model.locator("[aria-live=polite]").textContent(), /điện tích/);
    await model.locator("select").selectOption("neutron-2");
    assert.match(await model.locator("[aria-live=polite]").textContent(), /Neutron 2 · điện tích 0/);
    const fullParticles = await canvasShot(viewport);
    await model.getByRole("button", {name:"Cắt lớp"}).click();
    assert.ok(await visualDelta(await canvasShot(viewport), fullParticles) > 3);
    assert.deepEqual(await model.locator("dd").allTextContents(), ["6","6","12"]);
    await capture(model, "carbon-12-cat-lop");
    await model.getByRole("button", {name:"Cắt lớp"}).click();
    await model.locator("select").selectOption("");
    assert.ok(await visualDelta(await canvasShot(viewport), restored) < 2);
    await model.getByRole("button", {name:"Tự xoay"}).click();
    await desktop.waitForTimeout(1500);
    assert.ok(await visualDelta(await canvasShot(viewport), restored) > 2);
    await viewport.focus();
    await viewport.press("ArrowRight");
    assert.equal(await model.getByRole("button", {name:"Tự xoay"}).getAttribute("aria-pressed"), "false");
    await model.getByRole("button", {name:"Toàn màn hình", exact:true}).click();
    await model.getByRole("button", {name:"Thoát toàn màn hình"}).waitFor();
    await model.getByRole("button", {name:"Thoát toàn màn hình"}).click();
    assert.deepEqual(errors, []);
    console.log("desktop: 4 camera views, zoom, drag, keys, pick, cutaway, auto-orbit pause and fullscreen all passed");
    await desktop.close();
    }

    const phone = await browser.newPage({ viewport: { width:390, height:844 }, isMobile:true, hasTouch:true, deviceScaleFactor:2, reducedMotion:"reduce" });
    phone.setDefaultTimeout(45000);
    const mobile = await open(phone);
    assert.equal(await mobile.model.getByRole("button", { name:"Tự xoay" }).isDisabled(), true);
    await mobile.viewport.evaluate(el => el.scrollIntoView({block: "center", inline: "nearest"}));
    await phone.waitForTimeout(750);
    await mobile.viewport.evaluate(el => {
      window.touchLog = [];
      for (const name of ["pointerdown","pointermove","pointerup","pointercancel","gotpointercapture","lostpointercapture"]) el.addEventListener(name,e => touchLog.push([e.type,e.clientX,e.clientY,e.button,e.isPrimary,e.pointerType]));
    });
    const session = await phone.context().newCDPSession(phone);
    async function swipe(dx, dy) {
      const bounds = await mobile.viewport.boundingBox();
      const x = Math.round(bounds.x + bounds.width/2);
      const y = Math.round(bounds.y + bounds.height/2);
      console.log("touch start", await phone.evaluate(({x,y}) => ({hit: document.elementFromPoint(x,y)?.outerHTML.slice(0,220), y, height:innerHeight, scrollY}),{x,y}));
      await session.send("Input.dispatchTouchEvent", {type:"touchStart", touchPoints:[{x,y}]});
      for (let i=1; i<=8; i++) {
        await session.send("Input.dispatchTouchEvent", {type:"touchMove", touchPoints:[{x:x+dx*i/8,y:y+dy*i/8}]});
      }
      await session.send("Input.dispatchTouchEvent", {type:"touchEnd", touchPoints:[]});
      await phone.waitForTimeout(400);
    }
    const viewBeforeTouch = mobile.model.getByRole("button", {name:"Trước", exact:true});
    await viewBeforeTouch.click();
    await phone.waitForTimeout(500);
    const original = await canvasShot(mobile.viewport);
    await phone.screenshot({path: path.join(dir, "carbon-12-dien-thoai.png")});
    await mobile.viewport.evaluate(el => el.scrollIntoView({block:"center", inline:"nearest"}));
    await phone.waitForTimeout(700);
    await swipe(100, 1);
    const changed = await visualDelta(await canvasShot(mobile.viewport), original);
    console.log("horizontal touch", changed, "preset active", await viewBeforeTouch.getAttribute("aria-pressed"), await phone.evaluate(() => touchLog));
    assert.equal(await viewBeforeTouch.getAttribute("aria-pressed"), "false");
    assert.ok(changed > 2);
    const scrollBefore = await phone.evaluate(() => window.scrollY);
    await swipe(1, -96);
    assert.ok(await phone.evaluate(() => window.scrollY) > scrollBefore + 25, "vertical swipe on canvas must scroll the page");
    assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "page must not overflow the phone viewport");
    await phone.screenshot({path: path.join(dir, "carbon-12-dien-thoai.png")});
    assert.deepEqual(mobile.errors, []);
    console.log("mobile: horizontal touch orbit, vertical scrolling, 6+6 counts, reduced-motion and no horizontal overflow passed");
    await phone.close();
  } finally {
    await browser.close();
  }

  const fallbackBrowser = await chromium.launch({executablePath: chrome,args:["--disable-webgl"]});
  try {
    const page = await fallbackBrowser.newPage();
    await page.goto(route);
    const model = modelOn(page);
    await model.evaluate(el => el.scrollIntoView({block:"start", inline:"nearest"}));
    await model.locator("[data-model-status=fallback]").waitFor();
    await model.getByRole("img", {name:/Sơ đồ tĩnh/}).waitFor();
    assert.equal(await model.locator("canvas").count(), 0);
    await model.locator("select").focus();
    await model.locator("select").press("ArrowDown");
    await model.locator("select").press("Enter");
    assert.match(await model.locator("[aria-live=polite]").textContent(), /điện tích/);
    console.log("fallback: static diagram and keyboard nucleon selection work with WebGL disabled");
  } finally {
    await fallbackBrowser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
