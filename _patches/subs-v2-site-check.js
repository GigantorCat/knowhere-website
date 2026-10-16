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
        ok(/Founding rate for the first 50\. Yours forever\./.test(txt), 'pricing (D): the founding callout, "Yours forever." exact');
        { const st = await page.locator('.kw-price .founding').evaluate(e => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); const plans = document.querySelector('.kw-price .plans').getBoundingClientRect(); const h1 = document.querySelector('.kw-price h1').getBoundingClientRect(); return { border: cs.borderColor, bg: cs.backgroundImage, size: parseFloat(cs.fontSize), weight: cs.fontWeight, count: document.querySelectorAll('.kw-price .founding').length, afterH1: r.top > h1.bottom, beforeCards: r.bottom <= plans.top + 1, fullWidth: Math.abs(r.width - plans.width) < 2 }; });
          ok(/155, 90, 234/.test(st.border) && /155, 90, 234/.test(st.bg), 'pricing (D): the callout is the purple offer box', st);
          ok(st.count === 1 && st.afterH1 && st.beforeCards && st.fullWidth, 'pricing (F): one hero callout, between the headline and the first card, full width of the cards row', st);
          ok(st.size >= 26 && Number(st.weight) >= 800, 'pricing (F): hero size — display type, 800 weight', { size: st.size, weight: st.weight }); }
        { const c = await page.locator('.kw-price .plan .price .chip').first().evaluate(e => getComputedStyle(e).color); ok(c === 'rgb(220, 200, 250)', 'pricing (D): the chip is purple, not brat', c); }
        ok((await page.locator('.kw-price .plan .price .chip').count()) === 3 && /first founders · 50 seats/.test(txt), 'pricing: the first-founders chip on every price');
        ok(/Founding rate: the first 50 student plans, or until Fri 9 April 2027, whichever comes first\. It stays yours while your plan stays active\./.test(txt), 'pricing (D): the condition line in the fine print');
        ok(!/\d+ (of 50 )?(seats )?left\b/.test(txt), 'pricing: no live seat count on the site');
        { const was = await page.locator('.plan.featured .price .was'); const st = await was.evaluate(e => { const cs = getComputedStyle(e); return { size: cs.fontSize, thick: cs.textDecorationThickness, color: cs.color, deco: cs.textDecorationColor }; }); ok(st.size === '44px' && st.thick === '2px' && st.color !== st.deco, 'pricing: the struck list price is price-sized with a 2px strike in the text colour (B2)', st); }
        ok(/Sign up in Term 2 and you only ever pay for the weeks ahead of you/.test(txt), 'pricing (round 4): the first-charge example');
        ok((await page.locator('.kw-price .reassure').count()) === 1 && /Start now, not next term\. You only ever pay for the weeks ahead of you\./.test(txt), 'pricing (round 4, c2): the one line under the cards');
        { const r = await page.evaluate(() => { const p = document.querySelector('.kw-price .reassure').getBoundingClientRect(), g = document.querySelector('.kw-price .plans').getBoundingClientRect(), i = document.querySelector('.kw-price .included').getBoundingClientRect(); return { afterCards: p.top >= g.bottom - 1, beforeIncluded: p.bottom <= i.top + 1 }; }); ok(r.afterCards && r.beforeIncluded, 'pricing (round 4): the line sits under the cards, above the included box', r); }
        ok(/What’s included — all of it, on every period/.test(txt), 'pricing: one feature list');
        const ld = await page.evaluate(() => JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent));
        const app = ld['@graph'].find(x => x['@type'] === 'SoftwareApplication');
        ok(app && app.offers.offerCount === 3 && app.offers.offers.map(o => o.price).join(',') === '39,99,299' && !JSON.stringify(app).match(/Core|Pro|Max|pass/), 'pricing: JSON-LD offers 39 / 99 / 299, no tiers', app && app.offers);
      }
      if (who === 'for-parents') { ok(/A\$39 a month, A\$99 a term or A\$299 a year/.test(txt), 'for-parents: the three prices'); ok(/Founding rate for the first 50\. Yours forever\./.test(txt) && /Founding rate: the first 50 student plans, or until Fri 9 April 2027, whichever comes first\. It stays yours while your plan stays active\./.test(txt), 'for-parents (D): the callout says forever, the FAQ says what forever means'); { const st = await page.locator('.kw-par .founding').evaluate(e => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); const strip = document.querySelector('#par-cost .strip').getBoundingClientRect(); const h2 = document.querySelector('#par-cost h2').getBoundingClientRect(); return { border: cs.borderColor, size: parseFloat(cs.fontSize), weight: cs.fontWeight, count: document.querySelectorAll('.kw-par .founding').length, offers: document.querySelectorAll('.kw-par .offer').length, afterH2: r.top >= h2.bottom - 1, beforeStrip: r.bottom <= strip.top + 1, fullWidth: Math.abs(r.width - strip.width) < 2 }; }); ok(/155, 90, 234/.test(st.border) && st.count === 1 && st.offers === 0 && st.afterH2 && st.beforeStrip && st.fullWidth && st.size >= 26 && Number(st.weight) >= 800, 'for-parents (F): one purple hero callout where the plans are introduced, display type, nothing in the FAQ slot', st); } { const c = await page.locator('.kw-par .chip').first().evaluate(e => getComputedStyle(e).color); ok(c === 'rgb(220, 200, 250)', 'for-parents (D): the chip is purple', c); } ok((await page.locator('.kw-par .faq .chip, .kw-par .chip').count()) >= 1 && /first founders · 50 seats/.test(txt), 'for-parents: the first-founders chip on the FAQ price line'); ok(!/\d+ (of 50 )?(seats )?left\b/.test(txt), 'for-parents: no live seat count'); ok(/included, on every plan/.test(txt), 'for-parents: dashboard included, no Max'); }
      await page.close();
    }
    /* round 4 · E: the struck line never resurrects — not in the pages, not in the built heads, not in the generator */
    for (const f of ['pricing.html', 'for-parents.html', 'compare.html', 'emails.js', 'knowhere-seo-v2.sh']) ok(!/weeks that are left/.test(fs.readFileSync(path.join(ROOT, f), 'utf8')), 'no "weeks that are left" in ' + f);
    ok(/only ever pay for the weeks ahead of you/.test(fs.readFileSync(path.join(ROOT, 'for-parents.html'), 'utf8').split('</script>')[0]), 'for-parents: the JSON-LD head carries the new phrase');
    /* hover sweep (16 Oct): the brat-outline secondaries fill brat with black text on hover — the rule on disk, and the pixels */
    for (const [f, sel] of [['pricing.html', '.kw-price .soft'], ['pricing.html', '.kw-price .compare .cmp-btn'], ['compare.html', '.kw-cmp .ghost'], ['for-parents.html', '.kw-par .ghost'], ['for-teachers.html', '.kw-tch .ghost'], ['how-it-works.html', '.kw-hiw .ghost'], ['index.html', '.kp-ghost']]) {
      const src = fs.readFileSync(path.join(ROOT, f), 'utf8'); const m = src.match(new RegExp(sel.replace(/[.\s]/g, c => c === '.' ? '\\.' : '\\s') + ':hover[^{]*\\{([^}]*)\\}'));
      ok(m && /background:#7BEA5A/.test(m[1]) && /color:#070708/.test(m[1]), `hover sweep: ${f} ${sel}:hover fills brat, black text`, m && m[1]);
    }
    for (const [url, sel] of [['/pricing', '.kw-price .soft'], ['/how-it-works', '.kw-hiw .ghost'], ['/compare', '.kw-cmp .ghost']]) {
      const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
      await page.goto(BASE + url, { waitUntil: 'load' }); await page.waitForTimeout(800);
      const el = page.locator(sel).first(); await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
      const st = await el.evaluate(e => { const cs = getComputedStyle(e); return { bg: cs.backgroundColor, color: cs.color, border: cs.borderColor }; });
      ok(st.bg === 'rgb(123, 234, 90)' && st.color === 'rgb(7, 7, 8)' && st.border === 'rgb(123, 234, 90)', `hover sweep: ${url} ${sel} under the mouse — brat fill, black text`, st);
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
