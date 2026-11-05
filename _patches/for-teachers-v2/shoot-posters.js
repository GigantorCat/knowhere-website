/* for-teachers v2 posters (KW:TEACH-V2, 5 Nov 2026). The pre-JS picture behind each knowscape (ruled 16 Sep: the first
   screen paints before any JS): the CROPPED widget, captured from the live page, same as home-proof-lechatelier-*.jpg.
   Run with the site served locally (PORT=8787 node server.js), from the repo root:
     node _patches/for-teachers-v2/shoot-posters.js [http://localhost:8787]
   Writes for-teachers-ks-<subject>-d.jpg (1280 viewport, 1x) and -m.jpg (390 viewport, 2x). */
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8787';
const SUBJECTS = ['physics', 'chemistry', 'biology', 'psychology', 'maths'];
const SIZES = [{ sz: 'd', viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 },
               { sz: 'm', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }];
(async () => {
  const b = await chromium.launch();
  for (const S of SIZES) {
    const ctx = await b.newContext({ viewport: S.viewport, deviceScaleFactor: S.deviceScaleFactor });
    await ctx.route(/cloud\.umami\.is|connect\.facebook\.net|analytics\.tiktok/, r => r.abort());
    for (const k of SUBJECTS) {
      const p = await ctx.newPage();
      await p.goto(`${BASE}/for-teachers?subject=${k}`, { waitUntil: 'load' });
      await p.addStyleTag({ content: 'html.kw-float [data-float]{opacity:1!important;transform:none!important;transition:none!important}' });
      await p.waitForSelector('#ks-stage.ready', { timeout: 20000 });
      await p.waitForTimeout(3000);
      const el = await p.$('#ks-stage');
      const file = `for-teachers-ks-${k}-${S.sz}.jpg`;
      await el.screenshot({ path: file, type: 'jpeg', quality: 78 });
      const box = await el.boundingBox();
      console.log(`${file}  ${Math.round(box.width * S.deviceScaleFactor)}x${Math.round(box.height * S.deviceScaleFactor)}`);
      await p.close();
    }
    await ctx.close();
  }
  await b.close();
})();
