const { chromium } = require('playwright');
const OUT='_patches/for-teachers-v2/receipts';  /* run from the repo root with the site on :8787 */
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});
await ctx.route(/cloud\.umami\.is|connect\.facebook\.net/,r=>r.abort());
const p=await ctx.newPage();await p.goto('http://localhost:8787/for-teachers',{waitUntil:'load'});await p.waitForTimeout(1200); await p.addStyleTag({content:'html.kw-float [data-float]{opacity:1!important;transform:none!important;transition:none!important}'});
const L=h=>{const c=h.match(/\d+/g).slice(0,3).map(x=>x/255).map(x=>x<=0.03928?x/12.92:((x+0.055)/1.055)**2.4);return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]};
const cr=(a,b)=>{const x=L(a),y=L(b);return ((Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)).toFixed(2)};
for (const sel of ['.hero .offer .btn-primary','.final .offer .btn-primary','.inbox .btn-primary']) {
  const el=p.locator(sel); await el.scrollIntoViewIfNeeded(); await p.mouse.move(0,0); await p.waitForTimeout(400);
  const rest=await el.evaluate(e=>{const s=getComputedStyle(e);return [s.color,s.backgroundColor]});
  await el.hover(); await p.waitForTimeout(500);
  const hov=await el.evaluate(e=>{const s=getComputedStyle(e);return [s.color,s.backgroundColor]});
  console.log(sel.padEnd(28),'rest',rest.join(' on '),cr(rest[0],rest[1])+':1','| hover',hov.join(' on '),cr(hov[0],hov[1])+':1');
  if (sel.startsWith('.hero')) { await p.locator('.hero .offer').screenshot({path:OUT+'/7-desk-offer-hover.png'}); await p.mouse.move(0,0); await p.waitForTimeout(400); await p.locator('.hero .offer').screenshot({path:OUT+'/7-desk-offer-rest.png'}); }
}
await b.close();})();
