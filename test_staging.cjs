const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const origin='https://nexus2-staging.hm2krebsmatthewl.workers.dev';
 const browser=await chromium.launch({headless:true,...(process.env.NEXUS_BROWSER_CHANNEL?{channel:process.env.NEXUS_BROWSER_CHANNEL}:{})});
 const candidate=process.env.NEXUS_CANDIDATE_LOGO_FIX==='1';
 const evidence={origin,mode:candidate?'candidate_html_overlay':'deployed_staging',viewports:[],journeys:[],limitations:['AI inference and external handoffs not submitted','Manual screen-reader review remains separate']};
 fs.mkdirSync('evidence',{recursive:true});
 try {
  for(const width of [320,768,1024,1440]){
   const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
   if(candidate) await context.route(origin+'/',async route=>{
    const response=await route.fetch();let html=await response.text();
    html=html.replace('aria-label="Nexus home"', 'aria-label="N Nexus home"').replace('<span class="brandMark">N</span><span>Nexus</span>', '<span class="brandMark">N</span> <span>Nexus</span>');
    await route.fulfill({response,body:html});
   });
   const page=await context.newPage();const errors=[];const failedRequests=[];
   page.on('requestfailed',request=>failedRequests.push({path:new URL(request.url()).pathname,error:request.failure()?.errorText}));
   page.on('response',response=>{if(response.status()>=400&&response.url().startsWith(origin)) failedRequests.push({path:new URL(response.url()).pathname,status:response.status()});});
   page.on('pageerror',e=>errors.push(e.name));
   const response=await page.goto(origin,{waitUntil:'networkidle',timeout:30000});
   assert.equal(response.status(),200);
   await page.getByRole('heading',{name:'The useful side of local.'}).waitFor();
   const layout=await page.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,class:String(e.className),right:e.getBoundingClientRect().right,width:e.getBoundingClientRect().width})).filter(e=>e.right>innerWidth+1)}));
   if(layout.scrollWidth>layout.viewport+1){
    evidence.layoutFailure={width,...layout};
    await page.screenshot({path:`evidence/staging-${width}-overflow.png`,fullPage:true});
   }
   assert.ok(layout.scrollWidth<=layout.viewport+1,'horizontal overflow at '+width+': '+JSON.stringify(layout));
   await page.keyboard.press('Tab');
   assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),'Skip to content');
   const focus=await page.evaluate(()=>{const e=document.activeElement,s=getComputedStyle(e),r=e.getBoundingClientRect();return {outline:s.outlineStyle,outlineWidth:s.outlineWidth,visible:r.bottom>0&&r.right>0};});
   assert.ok(focus.visible);assert.notEqual(focus.outline,'none');assert.notEqual(focus.outlineWidth,'0px');
   await page.screenshot({path:`evidence/staging-${width}-focus.png`});
   await page.keyboard.press('Enter');
   const audit=await new AxeBuilder({page}).analyze();
   evidence.viewports.push({width,violations:audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),incomplete:audit.incomplete.map(v=>({id:v.id,help:v.help,nodes:v.nodes.map(n=>({target:n.target,html:n.html,summary:n.failureSummary,checks:[...n.any,...n.all,...n.none].map(c=>({id:c.id,message:c.message,data:c.data}))}))})),consoleErrors:errors,failedRequests,focus});
   await page.screenshot({path:`evidence/staging-${width}.png`,fullPage:true});

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
   await page.locator('#toolCards').getByRole('heading',{name:'LibreChat',exact:true}).waitFor({state:'visible'});
   assert.equal(await page.locator('#toolCards').getByRole('heading',{name:'ChatGPT',exact:true}).isVisible(),false);
   evidence.journeys.push({width,marketplaceSearch:'pass',privateDraftRefresh:'pass',directorySearch:'pass',skipLinkKeyboard:'pass'});
   assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);
   await context.close();
  }
  assert.equal(evidence.viewports.reduce((n,v)=>n+v.violations.length,0),0,'axe violations across viewport matrix');
  console.log('PASS: NEXUS journeys, keyboard skip-link/focus and responsive axe; mode='+evidence.mode);
 } finally {fs.writeFileSync('evidence/staging-results.json',JSON.stringify(evidence,null,2));await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
