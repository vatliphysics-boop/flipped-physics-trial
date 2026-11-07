import {chromium} from '/Users/vodoandangkhoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
const root='/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09',dir='/private/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w3-5CukgI/evidence';
fs.mkdirSync(dir,{recursive:true});
const sims=JSON.parse(fs.readFileSync(root+'/docs/codex-team/ui-review/simulations.json'));
const hashes=()=>Object.fromEntries(['src/components/physics/Simulation3D.tsx','src/components/physics/B22Activities.tsx','src/app/globals.css'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(root+'/'+p)).digest('hex')]));
fs.writeFileSync(dir+'/after-hashes.json',JSON.stringify(hashes(),null,2));
const logs=[];
const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const save=()=>fs.writeFileSync(dir+'/actual-tests.json',JSON.stringify(logs,null,2));
for(const s of sims){
 const sizes=/radiation-properties|radiation-safety|binding-energy/.test(s.id)?[[1440,900],[1280,720],[768,1024],[390,844],[360,800]]:/builder|isotope|geiger|reactor-control/.test(s.id)?[[1440,900],[390,844]]:[[390,844]];
 for(const [w,h] of sizes){
  const p=await b.newPage({viewport:{width:w,height:h}});p.setDefaultTimeout(8000);const row={id:s.id,w,h,time:new Date().toISOString(),states:[],errors:[]};logs.push(row);
  p.on('pageerror',e=>row.errors.push(String(e)));
  try{
   await p.goto(s.url);const r=p.locator('#resource-'+s.id);await r.getByRole('button',{name:'Bắt đầu thí nghiệm 3D',exact:true}).click();await p.waitForTimeout(350);await r.getByRole('button',{name:'Tạm dừng',exact:true}).click();
   const c=r.locator('canvas').first();await c.scrollIntoViewIfNeeded();
   row.states.push({action:'start/pause',legend:await r.locator('.experiment-legend').allTextContents(),canvas:await c.boundingBox()});
   await p.screenshot({path:dir+'/'+s.id+'-'+w+'-initial.png'});
   if(/builder|isotope|geiger|reactor-control|radiation-properties|radiation-safety/.test(s.id)){
    const slider=r.locator('.experiment-parameters input[type=range]');
    const ranges=r.locator('.experiment-3d input[type=range]');
    const control=(await slider.count())?slider.first():ranges.first();
    for(const edge of ['Home','End']){
     await control.focus();await control.press(edge);await p.waitForTimeout(200);
     row.states.push({action:edge,legend:await r.locator('.experiment-legend').innerText(),value:await control.inputValue()});
     const presets=/radiation-properties|radiation-safety/.test(s.id)?['Phối cảnh','Phía trước','Từ trên','Bên cạnh']:['Phối cảnh'];
     for(const name of presets){await r.getByRole('button',{name,exact:true}).click();await p.waitForTimeout(100);await c.scrollIntoViewIfNeeded();await p.screenshot({path:dir+'/'+s.id+'-'+w+'-'+edge+'-'+presets.indexOf(name)+'.png'});}
    }
    const select=r.locator('.experiment-3d select').last();
    if(await select.count()>0){const opts=await select.locator('option').evaluateAll(es=>es.map(e=>e.value));for(const val of opts){await select.selectOption(val);await p.waitForTimeout(150);row.states.push({action:'select '+val,legend:await r.locator('.experiment-legend').innerText()});}}
    await r.getByRole('button',{name:'Về toàn cảnh',exact:true}).click();
   }
   if(s.id==='system-sim-binding-energy'){
    const buttons=r.locator('.binding-point-list button');await buttons.first().focus();
    for(let i=0;i<9;i++){
     if(i)await p.keyboard.press('Tab');
     row.states.push({action:'Tab '+i,focused:await p.evaluate(()=>document.activeElement.textContent),height:await buttons.nth(i).evaluate(e=>e.getBoundingClientRect().height)});
     await p.keyboard.press(i===8?'Space':'Enter');
     row.states.push({action:'activate '+i,pressed:await buttons.nth(i).getAttribute('aria-pressed'),status:await r.locator('.binding-point-list [role=status]').innerText(),criteria:await r.locator('.physics-checklist').innerText()});
    }
    await buttons.nth(4).scrollIntoViewIfNeeded();await p.screenshot({path:dir+'/chart-'+w+'-buttons.png'});
   }
   row.overflow=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
  }catch(e){row.errors.push(String(e));}
  await p.close();save();console.log(s.id,w,row.errors.length);
 }
}
await b.close();save();
