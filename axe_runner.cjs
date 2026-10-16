// Network destinations are fixed by the operator; every browser request is checked.
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
(async () => {
  let browser;
  try {
    const target = new URL(process.argv[2]);
    const allowed = (process.env.NEXUS_AUDIT_ORIGINS || '').split(',').filter(Boolean);
    if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password || !allowed.includes(target.origin)) throw new Error('target_not_allowed');
    browser = await chromium.launch({headless: true});
    const context = await browser.newContext({serviceWorkers: 'block'});
    await context.route('**/*', route => {
      try { return new URL(route.request().url()).origin === target.origin ? route.continue() : route.abort(); }
      catch { return route.abort(); }
    });
    const page = await context.newPage();
    const response = await page.goto(target.href, {waitUntil: 'networkidle', timeout: 15000});
    if (!response || !response.ok()) throw new Error('navigation_failed');
    const result = await new AxeBuilder({page}).analyze();
    console.log(JSON.stringify({success:true, engine:'axe-core', engine_version:result.testEngine.version,
      issues:result.violations, incomplete:result.incomplete, passes:result.passes.length,
      accessibility_pass:result.violations.length === 0 && result.incomplete.length === 0,
      scope:'same-origin resources; automated checks only'}));
  } catch { console.log(JSON.stringify({success:false,error:'browser_audit_failed'})); process.exitCode=1; }
  finally { if (browser) await browser.close(); }
})();
