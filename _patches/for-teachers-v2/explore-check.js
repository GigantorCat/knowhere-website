const { chromium } = require('playwright');
const OUT='_patches/for-teachers-v2/receipts';  /* run from the repo root with the site on :8787 */
(async()=>{const b=await chromium.launch();
for (const vp of [{w:390,h:844,dpr:2,m:true,n:'phone'},{w:1440,h:900,dpr:1,m:false,n:'desk'}]) {
 const ctx=await b.newContext({viewport:{width:vp.w,height:vp.h},deviceScaleFactor:vp.dpr,isMobile:vp.m,hasTouch:vp.m});
 await ctx.route(/cloud\.umami\.is|connect\.facebook\.net|analytics\.tiktok/,r=>r.abort());
 await ctx.addInitScript(()=>{window.__ev=[];window.umami={track:(n,d)=>window.__ev.push([n,d||{}])};});
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8787/for-teachers',{waitUntil:'load'}); await p.addStyleTag({content:'html.kw-float [data-float]{opacity:1!important;transform:none!important;transition:none!important}'});
 await p.waitForSelector('#ks-stage.ready',{timeout:20000}); await p.waitForTimeout(1200);
 await p.locator('[data-explore=widget]').screenshot({path:`${OUT}/8-${vp.n}-explore-widget-hsc.png`});
 await p.locator('[data-explore=widget] .ex-tog [data-cert=vce]').click(); await p.waitForTimeout(200);
 await p.locator('[data-explore=widget]').screenshot({path:`${OUT}/8-${vp.n}-explore-widget-vce.png`});
 const st=await p.evaluate(()=>[...document.querySelectorAll('[data-explore]')].map(c=>c.getAttribute('data-explore')+':'+[...c.querySelectorAll('.ex-list')].filter(l=>!l.hidden).map(l=>l.getAttribute('data-cert')+'('+l.querySelectorAll('a.ex-s').length+')').join()));
 await p.locator('section.final').screenshot({path:`${OUT}/8-${vp.n}-final-offer-and-explore.png`});
 await p.evaluate(()=>document.addEventListener('click',e=>{if(e.target.closest('.explore a'))e.preventDefault();}));
 await p.locator('[data-explore=final] .ex-list[data-cert=vce] a.ex-s >> nth=3').click();
 const ev=await p.evaluate(()=>window.__ev.filter(e=>/explore/.test(e[0])).map(e=>e[0]+JSON.stringify(e[1])));
 const sw=await p.evaluate(()=>document.scrollingElement.scrollWidth);
 console.log(vp.n,'| visible after VCE tap:',st.join(' '),'| events',ev.join(' '),'| scrollWidth',sw,'| errors',errs.length);
 await ctx.close(); }
const ctx=await b.newContext({viewport:{width:390,height:844}}); await ctx.route(/cloud\.umami\.is|connect\.facebook\.net/,r=>r.abort());
const p=await ctx.newPage(); await p.goto('http://localhost:8787/for-teachers?acq_ad=e01-psych',{waitUntil:'load'}); await p.waitForTimeout(1500);
console.log('psych arrival opens on:', await p.evaluate(()=>[...document.querySelectorAll('[data-explore] .ex-list')].filter(l=>!l.hidden).map(l=>l.getAttribute('data-cert')).join()));
const links=await p.evaluate(()=>[...new Set([...document.querySelectorAll('.explore a')].map(a=>a.getAttribute('href')))]);
let bad=[]; for (const h of links){const r=await p.request.get('http://localhost:8787'+h); if(r.status()!==200) bad.push(h+' '+r.status());}
console.log(links.length,'explore links,',bad.length,'not 200',bad.join(' '));
await b.close();})();
