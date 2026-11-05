/* for-teachers v2 receipts (KW:TEACH-V2, 5 Nov 2026). Serve the site (PORT=8787 node server.js), then from the repo root:
     node _patches/for-teachers-v2/receipts-rig.js [http://localhost:8787]
   Screens land in _patches/for-teachers-v2/receipts/, the verdicts print as ✓ / ✗ lines. Chromium with the Facebook iOS
   in-app user agent stands in for the FB/IG browser (no WebKit in this container). Analytics hosts are blocked;
   window.umami is a recorder, so every event the page would send is checked by name and payload. */
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.argv[2] || 'http://localhost:8787';
const OUT = '_patches/for-teachers-v2/receipts';
fs.mkdirSync(OUT, { recursive: true });
const FB_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/470.0.0.40.97;FBBV/646463018;FBDV/iPhone15,2;FBMD/iPhone;FBSN/iOS;FBSV/17.5;FBSS/3;FBID/phone;FBLC/en_US;FBOP/5]';
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: FB_UA };
let bad = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) bad++; };
async function ctxOf(b, opts) {
  const ctx = await b.newContext(opts);
  await ctx.route(/cloud\.umami\.is|connect\.facebook\.net|analytics\.tiktok|app\.knowhere\.me/, r => r.abort());
  await ctx.addInitScript(() => { window.__ev = []; window.umami = { track: (n, d) => window.__ev.push([n, d || {}]) }; });
  return ctx;
}
const evs = p => p.evaluate(() => window.__ev);

(async () => {
  const b = await chromium.launch();

  console.log('\n1 · phone, Facebook in-app UA, 390px');
  { // before any JS: the raw markup paints the first screen and the poster
    const ctx = await b.newContext({ ...PHONE, javaScriptEnabled: false });
    const p = await ctx.newPage();
    await p.goto(BASE + '/for-teachers', { waitUntil: 'load' });
    await p.screenshot({ path: `${OUT}/1a-phone-no-js-first-screen.jpg` });
    const h1 = await p.evaluate(() => { const h = document.querySelector('h1'); const r = h && h.getBoundingClientRect(); return h ? { t: h.textContent.replace(/\s+/g, ' ').trim(), y: r.top, vis: r.height > 0 } : null; });
    ok(h1 && h1.vis && h1.y < 844, `no JS: the hero paints in the first screen ("${h1 && h1.t.slice(0, 48)}…")`);
    await p.evaluate(() => document.getElementById('knowscape').scrollIntoView());
    const pv = await p.evaluate(() => { const i = document.getElementById('ks-poster-d'); return i && i.complete && i.naturalWidth > 0 && i.getBoundingClientRect().height > 100 ? i.currentSrc : null; });
    ok(!!pv, 'no JS: the knowscape poster is painted (' + (pv || 'missing').replace(BASE, '') + ')');
    await p.screenshot({ path: `${OUT}/1b-phone-no-js-poster.jpg` });
    await ctx.close();
  }
  { // JS on, widget held back: the poster is what shows
    const ctx = await ctxOf(b, PHONE);
    await ctx.route(/\/widgets\//, r => r.abort());
    const p = await ctx.newPage();
    await p.goto(BASE + '/for-teachers', { waitUntil: 'load' });
    await p.waitForTimeout(1200);
    await p.evaluate(() => document.getElementById('knowscape').scrollIntoView());
    await p.waitForTimeout(1500);
    const st = await p.evaluate(() => ({ ready: document.getElementById('ks-stage').classList.contains('ready'), poster: getComputedStyle(document.getElementById('ks-poster')).display }));
    await p.screenshot({ path: `${OUT}/1c-phone-js-widget-loading-poster.jpg` });
    ok(st.poster !== 'none', 'JS on, widget not loaded yet: the poster holds the frame');
    await ctx.close();
  }
  { // the live widget replaces the poster
    const ctx = await ctxOf(b, PHONE);
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(BASE + '/for-teachers', { waitUntil: 'load' });
    await p.screenshot({ path: `${OUT}/1d-phone-first-screen.jpg` });
    await p.evaluate(() => document.getElementById('knowscape').scrollIntoView());
    await p.waitForSelector('#ks-stage.ready', { timeout: 20000 });
    await p.waitForTimeout(2200);
    const st = await p.evaluate(() => ({ poster: getComputedStyle(document.getElementById('ks-poster')).display, card: !!document.getElementById('ks-frame').contentDocument.querySelector('[data-kw=card]') }));
    ok(st.poster === 'none' && st.card, 'the cropped live widget replaces the poster');
    await p.screenshot({ path: `${OUT}/1e-phone-live-widget.jpg` });
    // no sideways scroll anywhere down the page
    let worst = 0;
    const H = await p.evaluate(() => document.scrollingElement.scrollHeight);
    for (let y = 0; y < H; y += 700) { await p.evaluate(yy => window.scrollTo(0, yy), y); await p.waitForTimeout(60); worst = Math.max(worst, await p.evaluate(() => document.scrollingElement.scrollWidth)); }
    ok(worst <= 390, `no horizontal scroll at 390px (widest ${worst}px)`);
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.screenshot({ path: `${OUT}/1f-phone-full.jpg`, fullPage: true });
    ok(errs.length === 0, 'no page errors on the phone' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await ctx.close();
  }

  console.log('\n2 · subject from the ad');
  for (const [q, want, slug] of [['acq_ad=e01-psych', 'psychology', 'circadian-rhythm-sleep-disorders'], ['utm_content=e01-chem', 'chemistry', 'collision-theory'], ['acq_ad=e01-bio', 'biology', 'autoimmune-disease'], ['acq_ad=e01-maths', 'maths', 'limiting-sum'], ['acq_ad=e01-phys', 'physics', 'photon-model'], ['', 'physics', 'photon-model']]) {
    const ctx = await ctxOf(b, PHONE);
    const p = await ctx.newPage();
    await p.goto(BASE + '/for-teachers' + (q ? '?' + q : ''), { waitUntil: 'load' });
    await p.waitForSelector('#ks-stage.ready', { timeout: 20000 });
    const r = await p.evaluate(() => ({ pill: (document.querySelector('.pill[aria-pressed="true"]') || {}).textContent, src: document.getElementById('ks-frame').getAttribute('src'), poster: document.getElementById('ks-poster-d').getAttribute('src'),
      ctas: [...document.querySelectorAll('.cta-seat')].map(a => a.href), ci: document.getElementById('ci-concept').textContent }));
    const good = r.src.includes(slug) && r.poster.includes('-' + want + '-') && r.ctas.length === 4 && r.ctas.every(h => h.includes('subject=' + want) && h.includes('as=teacher'));
    ok(good, `${q || '(no tag)'} → ${r.pill} · ${r.src.replace('/widgets/', '')} · ${r.ci} · CTA …${r.ctas[1].split('?')[1]}`);
    if (want === 'psychology') await p.screenshot({ path: `${OUT}/2-phone-acq-psych.jpg` });
    await ctx.close();
  }

  console.log('\n3 · Umami events from /for-teachers');
  {
    const ctx = await ctxOf(b, { viewport: { width: 1280, height: 860 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/for-teachers?acq_ad=e01-phys', { waitUntil: 'load' });
    await p.waitForSelector('#ks-stage.ready', { timeout: 20000 });
    await p.click('.pill:has-text("Psychology")');
    await p.waitForSelector('#ks-stage.ready', { timeout: 20000 });
    await p.waitForTimeout(500);
    const fr = p.frameLocator('#ks-frame');
    await fr.locator('canvas').first().click({ force: true });
    await p.click('#ci-opts .ci-opt >> nth=0');
    await p.click('#ci-reveal-btn');
    await p.evaluate(() => document.addEventListener('click', e => { if (e.target.closest('a.cta-seat')) e.preventDefault(); }));   /* bubbling: runs after the pixel's capture listener */
    await p.click('.final .cta-seat').catch(() => {});
    for (let i = 1; i <= 12; i++) { await p.mouse.wheel(0, 1600); await p.waitForTimeout(120); }
    await p.waitForTimeout(600);
    const E = await evs(p);
    const has = (n, f) => E.some(([m, d]) => m === n && (!f || f(d)));
    ok(has('subject_pill', d => d.subject === 'psychology'), 'subject_pill {subject:"psychology"}');
    ok(has('hero_interact', d => d.widget === 'psychology'), 'hero_interact {widget:"psychology"} from inside the cropped iframe');
    ok(has('callit_demo', d => d.step === 'call' && d.call === '1') && has('callit_demo', d => d.step === 'reveal'), 'callit_demo {step:"call", call} then {step:"reveal"}');
    ok(has('cta_click', d => d.from === 'final' && d.page === '/for-teachers'), 'cta_click {from:"final"} (knowhere-pixel.js)');
    ok(has('scroll_depth', d => d.page === '/for-teachers' && d.depth === 50), 'scroll_depth fires on /for-teachers (pixel gate)');
    console.log('    events: ' + E.map(([n, d]) => n + (d.subject || d.widget || d.step || d.from || d.depth ? '(' + (d.subject || d.widget || d.step || d.from || d.depth) + ')' : '')).join(' · '));
    await ctx.close();
  }

  console.log('\n4 · desktop: the five pills, cropped');
  {
    const ctx = await ctxOf(b, { viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/for-teachers', { waitUntil: 'load' });
    for (const k of ['Physics', 'Chemistry', 'Biology', 'Psychology', 'Maths']) {
      await p.click(`.pill:has-text("${k}")`);
      await p.waitForSelector('#ks-stage.ready', { timeout: 20000 });
      await p.waitForTimeout(1800);
      const r = await p.evaluate(() => { const d = document.getElementById('ks-frame').contentDocument; const c = d.querySelector('[data-kw=card]');
        const cv = d.querySelector('[data-kw=cw]'), cr = cv && cv.getBoundingClientRect(), side = c && cr && [...c.querySelectorAll('input,button,select')].filter(x => !cv.contains(x) && x.getBoundingClientRect().width > 0 && x.getBoundingClientRect().left >= cr.right - 4).length;
        return { card: !!c, sideBySide: side > 0, h: document.getElementById('ks-frame').style.height, h1: !!d.querySelector('h1') && getComputedStyle(d.querySelector('h1')).display === 'none' }; });
      ok(r.card && r.sideBySide, `${k}: model left, controls right · frame ${r.h}`);
      await p.locator('#knowscape .frame').screenshot({ path: `${OUT}/4-desk-pill-${k.toLowerCase()}.jpg` });
      await p.locator('#ci').screenshot({ path: `${OUT}/4-desk-callit-${k.toLowerCase()}.jpg` });
    }
    await ctx.close();
  }

  console.log('\n4b · a pill tapped while the first widget is still settling never shows it uncropped');
  { let flashes = 0, runs = 0, worst = 0;
    for (const first of ['Physics', 'Chemistry']) for (const delay of [0, 100, 250, 500, 900, 1300]) {
      const ctx = await ctxOf(b, { viewport: { width: 1440, height: 900 } });
      const p = await ctx.newPage();
      await p.goto(BASE + '/for-teachers', { waitUntil: 'load' });
      await p.waitForTimeout(delay);
      await p.evaluate(() => { window.__bad = 0; const t0 = performance.now(); const iv = setInterval(() => { const st = document.getElementById('ks-stage'); let card = false;
        try { const d = document.getElementById('ks-frame').contentDocument; card = !!(d && d.querySelector('[data-kw=card]')); } catch (e) {}
        if (st.classList.contains('ready') && !card) window.__bad += 20; if (performance.now() - t0 > 4000) clearInterval(iv); }, 20); });
      await p.click(`.pill:has-text("${first}")`);
      await p.waitForTimeout(4200);
      const bad = await p.evaluate(() => window.__bad); runs++; if (bad > 0) { flashes++; worst = Math.max(worst, bad); }
      await ctx.close();
    }
    ok(flashes === 0, `${runs} taps at 0–1300 ms after load: ${flashes} showed the uncropped widget` + (flashes ? ` (worst ~${worst} ms)` : ''));
  }

  console.log('\n5 · desktop: THE CLASSROOM steps four beats');
  {
    const ctx = await ctxOf(b, { viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/for-teachers', { waitUntil: 'load' });
    await p.waitForTimeout(800);
    const tr = await p.evaluate(() => { const t = document.getElementById('room-track'); return { top: t.getBoundingClientRect().top + scrollY, h: t.offsetHeight, snap: getComputedStyle(document.documentElement).scrollSnapType }; });
    ok(/y/.test(tr.snap), 'scroll-snap armed on desktop (' + tr.snap + ')');
    const seen = [];
    for (let i = 0; i < 4; i++) {
      await p.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(tr.top + i * tr.h / 4) + 2);
      await p.waitForTimeout(1500);
      const on = await p.evaluate(() => [...document.querySelectorAll('.beat')].findIndex(x => x.classList.contains('on')));
      const at = await p.evaluate(() => scrollY);
      seen.push(on);
      await p.screenshot({ path: `${OUT}/5-desk-beat-${i + 1}.jpg` });
      ok(on === i, `beat ${i + 1} of 4 on screen (snapped at y=${at})`);
    }
    await ctx.close();
  }

  console.log('\n6 · links');
  {
    const ctx = await ctxOf(b, { viewport: { width: 1280, height: 860 } });
    const p = await ctx.newPage();
    await p.goto(BASE + '/for-teachers', { waitUntil: 'load' });
    const hrefs = await p.evaluate(() => [...new Set([...document.querySelectorAll('.kt2 a[href^="/"]')].map(a => a.getAttribute('href').split('#')[0]))]);
    const bads = [];
    for (const h of hrefs) { const r = await p.request.get(BASE + h); if (r.status() !== 200) bads.push(h + ' ' + r.status()); }
    ok(!bads.length, `${hrefs.length} site links on the page all 200` + (bads.length ? ': ' + bads.join(', ') : ''));
    const txt = await p.evaluate(() => document.querySelector('.kt2').innerText);
    ok(!/no prep|prep time|every subject/i.test(txt), 'no "no prep" / "prep time" / "every subject" on the page');
    await ctx.close();
  }
  await b.close();
  console.log(bad ? `\n${bad} FAILED` : '\nALL PASS');
  process.exitCode = bad ? 1 : 0;
})();
