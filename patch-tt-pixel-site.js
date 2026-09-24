/* patch-tt-pixel-site.js — 24 Sep 2026 · the TikTok pixel on knowhere.me (website repo)
 *
 * knowhere-pixel.js (the one door every page loads):
 *   · KW_TT_PIXEL_ID beside the Meta id. Empty = inert: no network call, no cookie, nothing from TikTok.
 *   · TikTok base code loads only once the page is SEEN (KW:VISGATE) — a prefetched webview never fires it.
 *   · NO Advanced Matching, ever: no ttq.identify(), no email, no phone. The audience is mostly 16–17.
 *   · Events: page (on seen) · ClickButton (every app CTA, same listener as cta_click) ·
 *     ViewContent = ENGAGED (50% scroll or 20 s visible on a paid landing page — not on load, so TikTok
 *     optimises on people who looked, not taps) · CompleteRegistration / InitiateCheckout / StartTrial ride kwPixel.
 * privacy.html: TikTok named beside Meta in the advertising paragraph, the processors table and the cookies line.
 *
 * usage: node patch-tt-pixel-site.js [PIXEL_ID]            dry run
 *        node patch-tt-pixel-site.js PIXEL_ID --apply      backups to _dev/tt-baks/, write, node --check, receipts
 * Idempotent (marker KW:TT). With the marker present and a PIXEL_ID given, it only (re)sets the id.
 */
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const APPLY = process.argv.includes('--apply');
const PID = (process.argv.slice(2).find(a => !a.startsWith('--')) || '').trim();
if (PID && !/^[A-Z0-9]{10,30}$/.test(PID)) { console.error('pixel id looks wrong: ' + PID); process.exit(1); }
const DIR = __dirname, PX = path.join(DIR, 'knowhere-pixel.js'), PR = path.join(DIR, 'privacy.html');
const STAMP = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');

const E = { px: [], pr: [] };
E.px.push({ id: 'id', count: 1,
  find: "var KW_PIXEL_ID = '1829181431399314';\n",
  repl: "var KW_PIXEL_ID = '1829181431399314';\n/* KW:TT — TikTok pixel id (Events Manager → Web → knowhere). Empty = inert. Never Advanced Matching. */\nvar KW_TT_PIXEL_ID = '" + PID + "';\n" });
E.px.push({ id: 'kwPixel fan-out + ttTrack', count: 1,
  find: "  window.kwPixel = function (ev, params) {\n    try { if (ID && window.fbq) window.fbq('track', ev, params || {}); } catch (e) {}\n  };\n",
  repl: `  /* KW:TT — TikTok rides the same door. Only the funnel events cross over; ViewContent is TikTok's
     "engaged" signal (below), never a page load. */
  var TT = (typeof KW_TT_PIXEL_ID === 'string' ? KW_TT_PIXEL_ID : '').trim();
  var TT_FUNNEL = { CompleteRegistration: 1, InitiateCheckout: 1, StartTrial: 1 };
  function ttTrack(ev, params) { try { if (TT && window.ttq) window.ttq.track(ev, params || {}); } catch (e) {} }
  window.kwTT = ttTrack;
  window.kwPixel = function (ev, params) {
    try { if (ID && window.fbq) window.fbq('track', ev, params || {}); } catch (e) {}
    if (TT_FUNNEL[ev]) ttTrack(ev, params);
  };
` });
E.px.push({ id: 'ClickButton on every app CTA', count: 1,
  find: "        from: a.getAttribute('data-kw-from') || ''   /* KW:HERO-INTERACT (24 Sep 2026): which CTA on the page */\n      });\n    } catch (err) {}\n",
  repl: "        from: a.getAttribute('data-kw-from') || ''   /* KW:HERO-INTERACT (24 Sep 2026): which CTA on the page */\n      });\n    } catch (err) {}\n    ttTrack('ClickButton', { content_name: location.pathname });   /* KW:TT */\n" });
E.px.push({ id: 'engaged → ViewContent (50% scroll)', count: 1,
  find: "        if (d >= MARKS[i] && !hit[MARKS[i]]) {\n          hit[MARKS[i]] = 1;\n          track('scroll_depth', { page: path, depth: MARKS[i] });\n",
  repl: "        if (d >= MARKS[i] && !hit[MARKS[i]]) {\n          hit[MARKS[i]] = 1;\n          track('scroll_depth', { page: path, depth: MARKS[i] });\n          if (MARKS[i] === 50) engaged();   /* KW:TT */\n" });
E.px.push({ id: 'engaged helper', count: 1,
  find: "    var MARKS = [25, 50, 75, 90];\n",
  repl: "    var MARKS = [25, 50, 75, 90];\n    /* KW:TT — engaged = 50% scroll OR 20 s with the page visible. Once. TikTok's ViewContent. */\n    var engagedSent = false;\n    function engaged() { if (engagedSent) return; engagedSent = true; ttTrack('ViewContent', { content_name: path.replace(/^\\//, '').replace(/\\/$/, '') || 'home' }); }\n" });
E.px.push({ id: 'engaged (20 s seen)', count: 1,
  find: "    kwOnSeen(function () {           /* KW:VISGATE */\n      if (document.readyState === 'complete') startMeasuring();\n",
  repl: "    kwOnSeen(function () {           /* KW:VISGATE */\n      setTimeout(function () { if (document.visibilityState === 'visible') engaged(); }, 20000);   /* KW:TT */\n      if (document.readyState === 'complete') startMeasuring();\n" });
E.px.push({ id: 'TikTok base code (on seen)', count: 1,
  find: "  if (!ID) return;\n\n  /* Meta base code",
  repl: `  /* KW:TT — TikTok base code, the standard snippet, loaded only once the page is seen. No identify(). */
  if (TT) kwOnSeen(function () {
    !function (w, d, t) {
      w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
      ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'];
      ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e; };
      ttq.load = function (e, n) {
        var r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = r; ttq._t = ttq._t || {}; ttq._t[e] = +new Date; ttq._o = ttq._o || {}; ttq._o[e] = n || {};
        n = d.createElement('script'); n.type = 'text/javascript'; n.async = !0; n.src = r + '?sdkid=' + e + '&lib=' + t;
        e = d.getElementsByTagName('script')[0]; e.parentNode.insertBefore(n, e);
      };
      ttq.load(TT);
      ttq.page();
    }(window, document, 'ttq');
  });

  if (!ID) return;

  /* Meta base code` });

E.pr.push({ id: 'privacy: advertising paragraph', count: 1,
  find: "while we're running ads we use the Meta pixel on this site and in the app, so we can tell which ads brought people here and stop paying for the ones that don't. It sets cookies and it does report back to Meta. You can turn it off with any tracker blocker, or in your Meta ad settings, and nothing on the site stops working. We don't upload your email address to Meta.",
  repl: "while we're running ads we use the Meta pixel and the TikTok pixel on this site and in the app, so we can tell which ads brought people here and stop paying for the ones that don't. They set cookies and they do report back to Meta and TikTok. You can turn them off with any tracker blocker, or in your Meta or TikTok ad settings, and nothing on the site stops working. We don't upload your email address or phone number to Meta or TikTok. <!-- KW:TT -->" });
E.pr.push({ id: 'privacy: processors row', count: 1,
  find: "<tr><td>Meta (Facebook)</td><td>Measuring our ads while a campaign is running</td><td>pages visited and actions taken on our site, via cookies</td></tr>",
  repl: "<tr><td>Meta (Facebook)</td><td>Measuring our ads while a campaign is running</td><td>pages visited and actions taken on our site, via cookies</td></tr>\n            <tr><td>TikTok</td><td>Measuring our ads while a campaign is running</td><td>pages visited and actions taken on our site, via cookies</td></tr>" });
E.pr.push({ id: 'privacy: cookies line', count: 1,
  find: "While we're advertising, the Meta pixel described above also sets cookies that Meta can read across sites — that's the one exception, and a tracker blocker removes it without breaking anything.",
  repl: "While we're advertising, the Meta and TikTok pixels described above also set cookies those companies can read across sites — that's the one exception, and a tracker blocker removes them without breaking anything." });

function plan(file, edits) {
  const src = fs.readFileSync(file, 'utf8');
  if (src.includes('KW:TT')) return { file, src, already: true };
  let out = src, ok = true;
  for (const e of edits) {
    const n = out.split(e.find).length - 1;
    console.log(`${n === e.count ? '✓' : '✗'} ${path.basename(file)} · ${e.id} — ${n}× (want ${e.count})`);
    if (n !== e.count) { ok = false; continue; }
    out = out.replace(e.find, () => e.repl);
  }
  return { file, src, out, ok };
}
const P = [plan(PX, E.px), plan(PR, E.pr)];
/* already patched + an id given → just (re)set the id */
if (P[0].already) {
  const cur = (P[0].src.match(/var KW_TT_PIXEL_ID = '([^']*)';/) || [])[1];
  console.log(`• knowhere-pixel.js already carries KW:TT (id: "${cur}")`);
  if (PID && cur !== PID) { P[0].out = P[0].src.replace(/var KW_TT_PIXEL_ID = '[^']*';/, () => `var KW_TT_PIXEL_ID = '${PID}';`); P[0].ok = true; P[0].already = false; console.log(`  → will set id to ${PID}`); }
}
if (P[1].already) console.log('• privacy.html already carries KW:TT');
const todo = P.filter(p => !p.already);
if (todo.some(p => !p.ok)) { console.error('\nPREFLIGHT FAILED — nothing written.'); process.exit(1); }
if (!APPLY) { console.log('\nDRY RUN OK' + (PID ? '' : ' (no pixel id given — would ship inert)') + '. Add --apply to write.'); process.exit(0); }
if (!todo.length) { console.log('Nothing to do.'); process.exit(0); }
const BAK = path.join(DIR, '_dev', 'tt-baks'); fs.mkdirSync(BAK, { recursive: true });
const baks = todo.map(p => { const b = path.join(BAK, path.basename(p.file) + '.bak-' + STAMP); fs.copyFileSync(p.file, b); return [p.file, b]; });
const restore = w => { for (const [f, b] of baks) fs.copyFileSync(b, f); console.error('RESTORED — ' + w); process.exit(1); };
for (const p of todo) fs.writeFileSync(p.file, p.out, 'utf8');
try { execFileSync(process.execPath, ['--check', PX], { stdio: 'pipe' }); console.log('✓ node --check knowhere-pixel.js'); } catch (e) { restore('node --check failed: ' + (e.stderr || e.message)); }
const px = fs.readFileSync(PX, 'utf8');
for (const m of ["ttq.load(TT)", "ttTrack('ClickButton'", "engaged();", "TT_FUNNEL[ev]"]) if (!px.includes(m)) restore('receipt missing: ' + m);
if (px.includes('ttq.identify(')) restore('identify() must never be called');
console.log('\nAPPLIED. id: "' + ((px.match(/var KW_TT_PIXEL_ID = '([^']*)';/) || [])[1]) + '" · backups ' + baks.map(b => path.relative(DIR, b[1])).join(' · '));
