const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const origin='https://nexus2-staging.hm2krebsmatthewl.workers.dev';
function luminance(rgb){return rgb.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)}
function ratio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
function rgb(s){return s.match(/[\d.]+/g).map(Number)}
(async()=>{
 const browser=await chromium.launch({...(process.env.NEXUS_BROWSER_CHANNEL?{channel:process.env.NEXUS_BROWSER_CHANNEL}:{})});
 fs.mkdirSync('evidence',{recursive:true});
 const evidence={origin,mode:process.env.NEXUS_CANDIDATE_CSS?'candidate_css_overlay':'deployed_staging',widths:[],limitations:['Scoped platform text and field focus regression; full contrast and assistive-technology review remains separate.']};
 try{
 for(const width of [320,768,1024,1440]){
  const page=await browser.newPage({viewport:{width,height:900}});
  if(process.env.NEXUS_CANDIDATE_CSS) await page.route(origin+'/styles.css',r=>r.fulfill({contentType:'text/css',body:fs.readFileSync(process.env.NEXUS_CANDIDATE_CSS,'utf8')}));
  await page.goto(origin,{waitUntil:'networkidle'});
  const backgrounds=await page.locator('#platform').evaluate(e=>({main:getComputedStyle(e).backgroundImage,grid:getComputedStyle(e,'::before').backgroundImage}));
  assert.deepEqual(backgrounds.main.match(/rgba?\([^)]+\)/g),['rgb(234, 248, 255)','rgb(248, 251, 255)','rgb(239, 255, 220)'],'background envelope must be reviewed after palette changes');
  assert.deepEqual(backgrounds.grid.match(/rgba?\([^)]+\)/g),['rgba(0, 0, 0, 0)','rgba(57, 255, 20, 0.08)','rgba(0, 0, 0, 0)','rgba(0, 0, 0, 0)','rgba(105, 207, 255, 0.09)','rgba(0, 0, 0, 0)'],'grid opacity must remain within reviewed envelope');
  const text=await page.locator('.platformSection > .sectionTop').evaluate(root=>[...root.querySelectorAll('h2,h2 em,.eyebrow,p')].map(e=>({text:e.textContent.trim(),color:getComputedStyle(e).color})));
  // Conservative RGB envelope below all platform gradient stops, including the
  // decorative green/blue grid at its maximum composited opacity.
  const darkestBackground=[190,200,180],lightestBackground=[255,255,255];
  for(const item of text){item.minimumRatio=Math.min(ratio(rgb(item.color),darkestBackground),ratio(rgb(item.color),lightestBackground));assert.ok(item.minimumRatio>=4.5,JSON.stringify(item));}
  const link=page.locator('#platform .sectionTop > a');
  const linkStates=[];
  for(const state of ['default','hover','keyboard-focus']){
   if(state==='hover') await link.hover();
   if(state==='keyboard-focus'){await link.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');}
   await link.evaluate(e=>Promise.all(e.getAnimations().map(a=>a.finished.catch(()=>{}))));
   const color=await link.evaluate(e=>getComputedStyle(e).color);
   const minimumRatio=Math.min(ratio(rgb(color),darkestBackground),ratio(rgb(color),lightestBackground));
   assert.ok(minimumRatio>=4.5,'platform integration link contrast: '+JSON.stringify({state,color,minimumRatio}));
   if(state==='keyboard-focus') assert.equal(await link.evaluate(e=>document.activeElement===e),true);
   linkStates.push({state,color,minimumRatio});
  }
  const placeholder=await page.locator('#handoffGoal').evaluate(e=>getComputedStyle(e,'::placeholder').color);
  assert.ok(ratio(rgb(placeholder),[255,255,255])>=4.5,'handoff placeholder contrast');
  const focused=[];
  for(const selector of ['#heroQuery','#handoffGoal','#handoffTarget']){
   await page.locator(selector).focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
   const result=await page.locator(selector).evaluate(e=>{const s=getComputedStyle(e);return {focused:document.activeElement===e,outline:s.outlineStyle,width:s.outlineWidth,shadow:s.boxShadow};});
   assert.ok(result.focused);assert.notEqual(result.outline,'none');assert.ok(parseFloat(result.width)>=3);
   focused.push({selector,...result});
  }
  await page.locator('#platform').screenshot({path:'evidence/platform-'+width+'.png'});
  evidence.widths.push({width,text,linkStates,placeholder,focused});await page.close();
 }
 console.log('PASS: platform contrast bounds, placeholder contrast, keyboard field focus at four widths');
 }finally{fs.mkdirSync('evidence',{recursive:true});fs.writeFileSync('evidence/platform-regression.json',JSON.stringify(evidence,null,2));await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
