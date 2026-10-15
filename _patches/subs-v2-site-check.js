#!/usr/bin/env node
/* subs-v2 / retirepass site check — boots server.js on a spare port and walks the pages in Chromium:
   pricing (three period cards, term hero, founding line, no tiers, no pass, the JSON-LD offers), for-parents and a concept
   page (no .kw-pass visible, the sticky bar is the plain free-week bar, [data-pass-fallback] CTAs back), the home page.
     node _patches/subs-v2-site-check.js */
'use strict';
const { spawn } = require('child_process'); const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..'); const PORT = 3900, BASE = 'http://localhost:' + PORT;
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
let pass = 0, fail = 0; const ok = (c, l, x) => { console.log((c ? 'PASS ' : 'FAIL ') + l + (!c && x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); c ? pass++ : fail++; };
(async () => {
  const srv = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), NODE_ENV: 'development' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = ''; srv.stdout.on('data', d => log += d); srv.stderr.on('data', d => log += d);
  const t0 = Date.now(); while (Date.now() - t0 < 15000) { try { const r = await fetch(BASE + '/pricing'); if (r.status) break; } catch (e) {} await new Promise(r => setTimeout(r, 200)); }
  const browser = await pw.chromium.launch(); const shots = path.join(ROOT, '_patches', 'subs-v2-shots'); fs.mkdirSync(shots, { recursive: true });
  const TIER = /\bCore\b|\bPro\b|\bMax\b|exam pass|\$49\b|A\$23|\$23\b|\$31\b/;
  async function visibleText(page) { return page.evaluate(() => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let t = ''; let n; while ((n = w.nextNode())) { const el = n.parentElement; if (!el) continue; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || (el.offsetParent === null && cs.position !== 'fixed')) continue; if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue; t += n.textContent + ' '; } return t; }); }
  async function passState(page) { return page.evaluate(() => ({ passVisible: [...document.querySelectorAll('.kw-pass')].filter(e => e.offsetParent !== null).length, passTotal: document.querySelectorAll('.kw-pass').length,
      fallbacks: [...document.querySelectorAll('[data-pass-fallback]')].map(e => getComputedStyle(e).display), bar: (() => { const b = document.getElementById('kwPassbar'); if (!b) return null; const plain = b.querySelector('.pb-plain'); return { closed: b.classList.contains('closed'), plainShown: plain ? getComputedStyle(plain).display : null, plainText: plain ? plain.textContent.trim() : null, purpleShown: b.querySelector('.pb-bar') ? getComputedStyle(b.querySelector('.pb-bar')).display : null }; })() })); }
  try {
    for (const [url, who, wantCta] of [['/pricing', 'pricing', 'start your free week'], ['/for-parents', 'for-parents', 'start their free week'], ['/hsc/physics/nuclear-fission', 'concept', 'start your free week'], ['/', 'home', null]]) {
      const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
      const errs = []; page.on('pageerror', e => errs.push(e.message));
      await page.goto(BASE + url, { waitUntil: 'load' }); await page.waitForTimeout(1200);
      const txt = await visibleText(page); const st = await passState(page);
      ok(st.passVisible === 0, `${who}: no visible .kw-pass (${st.passTotal} in the markup)`, st);
      if (who !== 'pricing' && who !== 'home') { ok(st.bar && st.bar.closed && st.bar.plainShown === 'flex' && (st.bar.purpleShown === 'none' || st.bar.purpleShown === null), `${who}: the sticky bar is the plain free-week bar`, st.bar); ok(st.bar && st.bar.plainText.includes(wantCta), `${who}: bar says "${wantCta}"`, st.bar && st.bar.plainText); }
      if (who === 'home') ok(/start your free week/.test(txt) && /seven days free/.test(txt), 'home: the free-week CTA is back in the markup');
      ok(!TIER.test(txt), `${who}: no tier names, no pass, no old prices in visible text`, txt.match(new RegExp(TIER.source, 'g')));
      ok(errs.length === 0, `${who}: no page errors`, errs);
      await page.screenshot({ path: path.join(shots, who + '.png'), fullPage: who === 'pricing' });
      if (who === 'pricing') {
        ok((await page.locator('.kw-price .plan').count()) === 3, 'pricing: three cards');
        ok(/Most pick this/.test(txt) && (await page.locator('.plan.featured .tier').textContent()).trim() === 'A term', 'pricing: term is the hero');
        ok(/\$79/.test(txt) && /\$99/.test(txt) && /\$29/.test(txt) && /\$249/.test(txt), 'pricing: founding prices with list struck');
        ok(/Founding rate for the first 50\. Yours for as long as you stay\./.test(txt), 'pricing: the founding line (B3: the seats are the headline)');
        ok((await page.locator('.kw-price .plan .price .chip').count()) === 3 && /first founders · 50 seats/.test(txt), 'pricing: the first-founders chip on every price');
        ok(/first 50 seats, or until Fri 9 April 2027/.test(txt), 'pricing: the date is the backstop in the fine print');
        ok(!/\d+ (of 50 )?(seats )?left\b/.test(txt), 'pricing: no live seat count on the site');
        { const was = await page.locator('.plan.featured .price .was'); const st = await was.evaluate(e => { const cs = getComputedStyle(e); return { size: cs.fontSize, thick: cs.textDecorationThickness, color: cs.color, deco: cs.textDecorationColor }; }); ok(st.size === '44px' && st.thick === '2px' && st.color !== st.deco, 'pricing: the struck list price is price-sized with a 2px strike in the text colour (B2)', st); }
        ok(/Sign up in Term 2 and you pay for the weeks that are left/.test(txt), 'pricing: the first-charge example');
        ok(/What’s included — all of it, on every period/.test(txt), 'pricing: one feature list');
        const ld = await page.evaluate(() => JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent));
        const app = ld['@graph'].find(x => x['@type'] === 'SoftwareApplication');
        ok(app && app.offers.offerCount === 3 && app.offers.offers.map(o => o.price).join(',') === '39,99,299' && !JSON.stringify(app).match(/Core|Pro|Max|pass/), 'pricing: JSON-LD offers 39 / 99 / 299, no tiers', app && app.offers);
      }
      if (who === 'for-parents') { ok(/A\$39 a month, A\$99 a term or A\$299 a year/.test(txt), 'for-parents: the three prices'); ok(/founding rate A\$29 \/ A\$79 \/ A\$249 for the first 50, or until Fri 9 April, whichever comes first/.test(txt), 'for-parents: the founding line in the FAQ, the date as the backstop'); ok((await page.locator('.kw-par .faq .chip, .kw-par .chip').count()) >= 1 && /first founders · 50 seats/.test(txt), 'for-parents: the first-founders chip on the FAQ price line'); ok(!/\d+ (of 50 )?(seats )?left\b/.test(txt), 'for-parents: no live seat count'); ok(/included, on every plan/.test(txt), 'for-parents: dashboard included, no Max'); }
      await page.close();
    }
    const em = require(path.join(ROOT, 'emails.js'));
    const mail = em.handoffParent({ parentEmail: 'p@x.test', kidName: 'Harper', where: 'site' });
    ok(/founding rate \$29 \/ \$79 \/ \$249 until 9 April/.test(mail.html) && !/exam pass|\$49/.test(mail.html), 'emails.js: parentContext carries the three prices + founding, no pass');
    const t4 = em.build('t4', { email: 'k@x.test', firstName: 'Kid', type: 'student' });
    ok(!/\$49|exam pass/.test(t4.html) && /free for a week first/i.test(t4.html), 'emails.js: t4 handoff copy, no pass');
  } catch (e) { ok(false, 'site check crashed: ' + (e && e.stack || e)); }
  finally { await browser.close(); srv.kill('SIGTERM'); console.log(`\n${pass} PASS · ${fail} FAIL · screenshots in _patches/subs-v2-shots/`); process.exit(fail ? 1 : 0); }
})();
