// Local test of the founding duo bar on the respiration concept page (served from localhost).
const { chromium, webkit } = require('playwright');
const SP = process.argv[2];
const BASE = 'http://localhost:8765/vce/biology/aerobic-vs-anaerobic-respiration.html';
const Q = '?utm_source=facebook&utm_medium=groups';
(async () => {
  for (const [eng, E] of [['chromium', chromium], ['webkit', webkit]]) {
    let b; try { b = await E.launch(); } catch (e) { console.log(eng, 'launch failed', e.message.split('\n')[0]); continue; }
    for (const [name, vp, phone] of [['360', { width: 360, height: 640 }, 1], ['390', { width: 390, height: 664 }, 1], ['desktop', { width: 1280, height: 800 }, 0]]) {
      const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: eng === 'chromium' ? 2 : 1, hasTouch: !!phone });
      const p = await ctx.newPage(); const errs = [];
      p.on('pageerror', e => errs.push(e.message));
      let landed = null;
      // stop signup navigations at the door (record the URL, never hit the live app)
      await ctx.route('https://app.knowhere.me/signup**', r => { landed = r.request().url(); return r.fulfill({ body: 'stub' }); });
      await p.goto(BASE + Q, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(2200);
      const bar = await p.$eval('.pb-bar', el => { const r = el.getBoundingClientRect(); const t = el.querySelector('.pb-t'); const pp = el.querySelector('.pb-p');
        return { text: el.innerText.replace(/\s+/g, ' '), h: Math.round(r.height), w: Math.round(r.width), tH: Math.round(t.getBoundingClientRect().height), pVis: getComputedStyle(pp).display !== 'none', overflowX: document.documentElement.scrollWidth > innerWidth }; });
      if (eng === 'chromium') await p.screenshot({ path: `${SP}/shots/${name}-1-first-screen.png` });
      await p.click('.pb-bar'); await p.waitForTimeout(400);
      const sheet = await p.evaluate(() => { const s = document.querySelector('.pb-sheet');
        const hs = [...s.querySelectorAll('.pb-half')].map(h => { const r = h.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; });
        const cs = [...s.querySelectorAll('.pb-cta')].map(a => { const r = a.getBoundingClientRect(); return [a.textContent, Math.round(r.width), Math.round(r.height), getComputedStyle(a).backgroundColor, a.href]; });
        return { sheetH: Math.round(s.getBoundingClientRect().height), scrollH: s.scrollHeight, halves: hs, ctas: cs }; });
      if (eng === 'chromium') await p.screenshot({ path: `${SP}/shots/${name}-2-sheet.png` });
      if (eng === 'chromium' && phone) { await p.$eval('.pb-sheet', s => s.scrollTop = 9999); await p.waitForTimeout(150); await p.screenshot({ path: `${SP}/shots/${name}-3-sheet-scrolled.png` }); }
      await p.click('.pb-tea .pb-cta'); await p.waitForTimeout(700);
      const teachLanded = landed; landed = null;
      await p.goto(BASE + Q, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(2000);
      await p.$eval('.cta-box', el => el.scrollIntoView({ block: 'center' })); await p.waitForTimeout(500);
      if (eng === 'chromium') await p.screenshot({ path: `${SP}/shots/${name}-4-door-row.png` });
      const doors = await p.$$eval('.doors a', as => as.map(a => a.textContent + ' => ' + a.href));
      await p.click('a[data-kw-from="door-teacher"]'); await p.waitForTimeout(700);
      const doorLanded = landed;
      console.log(JSON.stringify({ eng, name, errs, bar, sheet, teachLanded, doorLanded, doors }));
      await ctx.close();
    }
    await b.close();
  }
})();
