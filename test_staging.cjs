const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const origin='https://nexus2-staging.hm2krebsmatthewl.workers.dev';
 const browser=await chromium.launch({headless:true});
 const evidence={origin,viewports:[],journeys:[],limitations:['AI inference and external handoffs not submitted','Manual screen-reader review remains separate']};
 fs.mkdirSync('evidence',{recursive:true});
 try {
  for(const width of [320,768,1024,1440]){
   const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
   const page=await context.newPage();const errors=[];
   page.on('pageerror',e=>errors.push(e.name));
   const response=await page.goto(origin,{waitUntil:'networkidle',timeout:30000});
   assert.equal(response.status(),200);
   await page.getByRole('heading',{name:'The useful side of local.'}).waitFor();
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow at '+width);
   await page.keyboard.press('Tab');
   assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),'Skip to content');
   const focus=await page.evaluate(()=>{const e=document.activeElement,s=getComputedStyle(e),r=e.getBoundingClientRect();return {outline:s.outlineStyle,outlineWidth:s.outlineWidth,visible:r.bottom>0&&r.right>0};});
   assert.ok(focus.visible);assert.notEqual(focus.outline,'none');assert.notEqual(focus.outlineWidth,'0px');
   await page.screenshot({path:`evidence/staging-${width}-focus.png`});
   await page.keyboard.press('Enter');
   const audit=await new AxeBuilder({page}).analyze();
   evidence.viewports.push({width,violations:audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),incomplete:audit.incomplete.map(v=>v.id),consoleErrors:errors,focus});
   await page.screenshot({path:`evidence/staging-${width}.png`,fullPage:true});
   assert.equal(audit.violations.length,0,'axe violations at '+width);
   const filter=page.getByRole('searchbox',{name:'Filter listings',exact:true});
   await filter.fill('bicycle');
   await page.getByRole('heading',{name:'Commuter bicycle',exact:true}).waitFor({state:'visible'});
   assert.equal(await page.getByRole('heading',{name:'Local moving help',exact:true}).isVisible(),false);
   await filter.fill('');
   await page.getByRole('heading',{name:'Local moving help',exact:true}).waitFor({state:'visible'});
   const field=page.getByRole('textbox',{name:'Save a private preview update',exact:true});
   await field.fill('NEXUS isolated accessibility acceptance fixture');
   await page.getByRole('button',{name:'Save preview',exact:true}).click();
   await page.reload({waitUntil:'networkidle'});
   await page.getByText('NEXUS isolated accessibility acceptance fixture',{exact:true}).waitFor({state:'visible'});
   const directory=page.getByRole('searchbox',{name:'Search the directory',exact:true});
   await directory.fill('LibreChat');
   await directory.press('Enter');
   await page.getByRole('heading',{name:'LibreChat',exact:true}).waitFor({state:'visible'});
   assert.equal(await page.getByRole('heading',{name:'ChatGPT',exact:true}).isVisible(),false);
   evidence.journeys.push({width,marketplaceSearch:'pass',privateDraftRefresh:'pass',directorySearch:'pass',skipLinkKeyboard:'pass'});
   assert.deepEqual(errors,[]);
   await context.close();
  }
  console.log('PASS: real NEXUS staging journeys, keyboard skip-link/focus and responsive axe acceptance');
 } finally {fs.writeFileSync('evidence/staging-results.json',JSON.stringify(evidence,null,2));await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
