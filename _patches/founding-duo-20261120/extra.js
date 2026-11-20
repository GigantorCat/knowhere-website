const { chromium } = require('playwright');
const U = 'http://localhost:8765/vce/biology/aerobic-vs-anaerobic-respiration.html';
(async () => {
  const b = await chromium.launch();
  // 1. no JS: first screen + doors still there
  let c = await b.newContext({ viewport: { width: 390, height: 664 }, javaScriptEnabled: false }); let p = await c.newPage();
  await p.goto(U, { waitUntil: 'domcontentloaded' });
  console.log('noJS', await p.evaluate(() => ({ h1: !!document.querySelector('h1') && document.querySelector('h1').getBoundingClientRect().top < innerHeight, iframe: !!document.querySelector('#kwFrame'), teacherDoor: document.querySelector('a[data-kw-from=door-teacher]').href })));
  await p.screenshot({ path: process.argv[2] + '/shots/390-0-no-js.png' }); await c.close();
  // 2. bare arrival: utm_content = slug only
  c = await b.newContext({ viewport: { width: 390, height: 664 } }); p = await c.newPage();
  await p.goto(U, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1800);
  console.log('bare', await p.$eval('.pb-tea .pb-cta', a => a.href));
  // 3. paid ad carries its own utm_content: it wins
  await p.goto(U + '?utm_source=meta&utm_medium=paid&utm_campaign=c1&utm_content=P3', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1800);
  console.log('paid', await p.$eval('.pb-tea .pb-cta', a => a.href));
  // 4. a remembered parent still gets the parent sheet
  await p.evaluate(() => sessionStorage.setItem('kw_aud', 'parent')); await p.reload(); await p.waitForTimeout(1800);
  console.log('parent', await p.$eval('.pb-bar', e => e.innerText.replace(/\s+/g, ' ')), await p.$eval('.pb-cta', a => a.href));
  await c.close();
  // 5. a non-concept page (pricing) is unchanged
  c = await b.newContext({ viewport: { width: 390, height: 664 } }); p = await c.newPage();
  await p.goto('http://localhost:8765/pricing.html', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1800);
  console.log('pricing', await p.$eval('.pb-bar', e => e.innerText.replace(/\s+/g, ' ')).catch(() => 'no bar'), await p.$$eval('.pb-half', x => x.length));
  await b.close();
})();
