import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_CORE_PATH);
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
  const page=await browser.newPage({viewport:{width:800,height:1000}});
  for(const width of [236,300,360,560,650]){
    await page.setContent(await fs.readFile(new URL(`./width-${width}.html`,import.meta.url),'utf8'));
    const metrics=await page.evaluate(()=>{
      const charts=[...document.querySelectorAll('svg')].filter(s=>s.getBoundingClientRect().width>0);
      return charts.map(svg=>{
        const rect=svg.getBoundingClientRect();
        const texts=[...svg.querySelectorAll('text')];
        const scale=rect.width/svg.viewBox.baseVal.width;
        const clipped=texts.filter(t=>{const r=t.getBoundingClientRect();return r.x<rect.x-1||r.right>rect.right+1||r.y<rect.y-1||r.bottom>rect.bottom+1}).map(t=>t.textContent);
        return {viewBox:svg.viewBox.baseVal.width,width:rect.width,minFont:texts.length?Math.min(...texts.map(t=>parseFloat(getComputedStyle(t).fontSize)*scale)):null,clipped,labels:texts.map(t=>t.textContent)};
      });
    });
    assert.equal(metrics.length,4);
    for(const chart of metrics){if(chart.minFont!==null)assert(chart.minFont>=13,JSON.stringify(chart));assert.deepEqual(chart.clipped,[]);}
    assert(metrics[2].labels.includes('12'),'axis must contain 12 observed counts');
    assert(metrics[3].labels.includes('160')&&metrics[3].labels.includes('360'));
    if(width===236||width===560)await page.locator('.harness').screenshot({path:`tmp/nuclear-process/compact-static/width-${width}.png`});
    console.log(JSON.stringify({width,metrics}));
  }
}finally{await browser.close()}
