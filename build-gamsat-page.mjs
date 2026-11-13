#!/usr/bin/env node
/* build-gamsat-page.mjs — /gamsat v2 (13 Nov 2026, Bronco · Cat's goated mock v2, the teach it. patterns).
   v1 (12 Nov) was ten physics pictures in a list; v2 is: hero banner (two-tier h1 + the purple founding card + "get
   stimulated ↓") → the knowscape (Physics / Chemistry / Biology pills, the tip card, one full-width stage) → This week's
   Stemlord → the claim section (the founding list form) → footer, with the sticky founding bar (knowhere-passbar.js,
   data-audience="gamsat"). Cat ruled the GAMSAT cohort on 10 Nov: adults, Section 3 only, no state, no year, no school,
   so this page never says Year 12, ATAR, VCE, HSC, a score promise, "guaranteed" or "every subject" (the gate below).

   Cat's call (13 Nov): the page is the founding list now and switches to the real signup on Fri 11 Dec 2026 00:00 AEDT
   (OPENS_AT, one constant): before it every "claim a founding seat" goes to #claim; from it they go to signup?as=gamsat
   and the claim card's form becomes that button. Never promise a held seat.

   INPUT   the app (KW_APP, default ../../Backend/knowhereApp): the flat widget store + sidecars, server.js (injectAccent),
           knowhere.html (the subject colours), pipeline/gamsat/map.json (the shelf count, a picture's science),
           pipeline/gamsat/knowhow.json (GOATED lines, for a Stemlord picture off the pills).
   OUTPUT  gamsat.html · widgets/gamsat-<slug>.html (the three pills + the Stemlord picture). A gamsat-*.html widget no
           longer referenced is listed as stale (delete it with git rm). sitemap.xml keeps its hand row.
   Dry run by default; --apply writes, then reads every file back.                                              */
import fs from 'node:fs';
import path from 'node:path';

const APPLY = process.argv.includes('--apply');
const ROOT = process.cwd();
const APP = process.env.KW_APP ? path.resolve(process.env.KW_APP) : path.join(ROOT, '..', '..', 'Backend', 'knowhereApp');
const FLAT = path.join(APP, 'widgets-cache', 'concepts');
const die = m => { console.error('✗ ' + m); process.exit(1); };
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ══ the config ══════════════════════════════════════════════════════════════════════════════════════════════ */
const OPENS_AT = '2026-12-11T00:00:00+11:00';                 /* Fri 11 Dec 2026 00:00 AEDT: the founding list becomes signup */
const SIGNUP = 'https://app.knowhere.me/signup?as=gamsat';
/* the three pills (13 Nov): the tip lines are the mock's rewrites of the goated GAMSAT knowhow lines */
const PILLS = [
  { k: 'physics',   id: 'cpt_72b311a0', tip: 'A wire with its diameter halved, and a question about the new current. The trap: scaling by 2, not the 4 that area (diameter squared) gives.' },
  { k: 'chemistry', id: 'cpt_6916c4b6', tip: 'A titration or a blood-gas table, and a question about what pH does next. The trap: reading the flat region as permanent, not finite.' },
  { k: 'biology',   id: 'cpt_2b808224', tip: 'A change in glomerular pressure, or a table of filtrate against urine. The trap: casting the glomerulus as a waste-picking sieve.' },
];
/* This week's Stemlord: one block per episode. picture = any GAMSAT concept id ("move it yourself" loads it into the stage).
   video: the ad's URL once Animal's cut exists; null hides the video tile and the question card takes the full width. */
const STEMLORD = {
  episode: 1, title: 'the squid', length: '15 seconds', video: null, poster: null,
  typed: 'A deep-sea squid pumps blood through vessels of varying width… <i>at 3,000 metres.</i> Diabolical!',
  question: 'Blood flow through a vessel = pressure difference ÷ resistance. One vessel narrows and its resistance doubles, at the same pressure difference. What happens to the flow?',
  options: ['It doubles', 'It halves', 'It stays the same'], answer: 1,
  reveal: '<b>It’s 2.</b> Flow = pressure ÷ resistance, so double the resistance and the flow halves. It’s Ohm’s law, with blood instead of current.',
  turn: 'The squid is new.<br><span class="brat">The physics isn’t.</span>',
  picture: 'cpt_72b311a0',
};
/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════ */

/* words an adult GAMSAT page never says (Cat, 10 Nov) — checked on every file this writes */
const BANNED = [/\byear\s*1[12]\b/i, /\bATAR\b/, /\bVCE\b/, /\bHSC\b/, /guarantee/i, /every subject/i, /\bVCAA\b/, /\bNESA\b/];
const BANNED_TEXT = [/held seat|seat is held|seat held|reserve[sd]? (a|your) seat/i];   /* never promise a held seat */

/* ── the app: accent bake, subject colours, the map, goated knowhow ── */
const srv = fs.readFileSync(path.join(APP, 'server.js'), 'utf8');
const ai = srv.indexOf('function injectAccent(html, accent) {');
if (ai < 0) die('injectAccent not found in the app server.js');
let depth = 0, ei = ai, open = false;
for (; ei < srv.length; ei++) { const ch = srv[ei]; if (ch === '{') { depth++; open = true; } else if (ch === '}') { depth--; if (open && depth === 0) { ei++; break; } } }
const injectAccent = new Function(srv.slice(ai, ei) + '; return injectAccent;')();
const appHtml = fs.readFileSync(path.join(APP, 'knowhere.html'), 'utf8');
const colour = sub => { const m = new RegExp(`\\{id:'${sub}',name:'[^']+',icon:'[^']*',color:'(#[0-9A-Fa-f]{6})'`).exec(appHtml); return m ? m[1] : die(sub + ' colour not found in knowhere.html'); };
const map = JSON.parse(fs.readFileSync(path.join(APP, 'pipeline', 'gamsat', 'map.json'), 'utf8')).areas;
const SCI = { M: 'Maths', P: 'Physics', C: 'Chemistry', B: 'Biology' };
const scienceOf = id => { for (const [a, ids] of Object.entries(map)) if (ids.includes(id)) return SCI[a[0]]; return die(id + ' is not on the GAMSAT map'); };
const shelf = new Set(Object.values(map).flat()).size;
const knowhow = JSON.parse(fs.readFileSync(path.join(APP, 'pipeline', 'gamsat', 'knowhow.json'), 'utf8')).entries;
const goatedLine = id => { const e = knowhow[id]; return e && e.meta && e.meta.review && e.meta.review.v === 'goat' ? e.knowhow : ''; };
const files = fs.readdirSync(FLAT);

/* the widget wrapper is the concept pages' own (build-concept-pages.mjs): MOBFIX + the kwFit height beacon, one kwId each */
const MOBFIX = `<style id="kwMobFix">body{padding-bottom:30px!important;margin-bottom:0!important}hr{display:none!important}.kw-foot{display:none!important}
@media (max-width:480px){*{min-width:0;overflow-wrap:anywhere}div{flex-wrap:wrap}canvas,svg,img,video{max-width:100%!important;height:auto!important}table{display:block;max-width:100%;overflow-x:auto}pre{white-space:pre-wrap;max-width:100%}}
body>*:last-child{margin-bottom:0!important;padding-bottom:0!important}html,body,body>*{min-height:0!important}
@media (max-width:640px){h1{font-size:clamp(16px,4.5vw,25px)!important;font-weight:800!important;line-height:1.15!important}}</style>`;
const beacon = id => `<script>/* kwFit: the widget tells the page how tall it is, so the frame fits it (F14: never a viewport min-height inside a frame) */
(function(){function h(){return Math.ceil(document.documentElement.scrollHeight);}function send(){try{parent.postMessage({kwH:h(),kwId:'${id}'},'*');}catch(e){}}
if(window.ResizeObserver){new ResizeObserver(send).observe(document.body);}window.addEventListener('load',send);setTimeout(send,600);setTimeout(send,2000);})();</script>`;

const out = [];   /* [file, content] */
const pics = new Map();   /* id -> { id, slug, title, science, kwId, src } */
function picture(id) {
  if (pics.has(id)) return pics.get(id);
  const hf = files.find(f => f.startsWith(id + '--') && f.endsWith('.html')) || die('no widget for ' + id);
  const mf = files.find(f => f.startsWith(id + '--') && f.endsWith('.meta.json')) || die('no sidecar for ' + id);
  const meta = JSON.parse(fs.readFileSync(path.join(FLAT, mf), 'utf8'));
  const slug = hf.slice(id.length + 2, -5), science = scienceOf(id);
  const baked = injectAccent(fs.readFileSync(path.join(FLAT, hf), 'utf8'), colour(science.toLowerCase() === 'maths' ? 'maths-methods' : science.toLowerCase()));
  if (/#3AADA0/i.test(baked)) die(`teal survived the bake in ${slug}`);
  const kwId = 'g-' + slug, src = `/widgets/gamsat-${slug}.html`;
  out.push(['widgets/gamsat-' + slug + '.html', `<!DOCTYPE html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(meta.title)} — live knowscape</title>${MOBFIX}</head><body>
${baked}
${beacon(kwId)}</body></html>`]);
  const p = { id, slug, title: meta.title, science, kwId, src };
  pics.set(id, p); return p;
}
const K = {};
for (const p of PILLS) { const x = picture(p.id); K[p.k] = { s: x.science, n: x.title, src: x.src, id: x.kwId, k: p.tip }; }
const ep = picture(STEMLORD.picture);
const EP_PIC = Object.values(K).find(v => v.id === ep.kwId) ? Object.keys(K).find(k => K[k].id === ep.kwId)
  : (K._ep = { s: ep.science, n: ep.title, src: ep.src, id: ep.kwId, k: goatedLine(ep.id) }, '_ep');
if (STEMLORD.options.length !== 3 || !(STEMLORD.answer >= 0 && STEMLORD.answer < 3)) die('Stemlord needs three options and an answer 0-2');
const more = shelf - PILLS.length;

const claimHref = '#claim';   /* the date switch rewrites every [data-claim] on the client */
const TITLE = 'GAMSAT Section 3, as things you can move — knowhere';
const DESC = 'Section 3 is half your GAMSAT score, and it is written in physics, chemistry and biology. Move the science underneath. Founding seats for the 2027 sittings.';
const opts = STEMLORD.options.map((o, i) => `          <button type="button" class="opt" data-a="${i === STEMLORD.answer ? 1 : 0}"><b>${i + 1}</b>${esc(o)}</button>`).join('\n');
const vid = STEMLORD.video
  ? `      <div class="vid has"><video src="${esc(STEMLORD.video)}"${STEMLORD.poster ? ` poster="${esc(STEMLORD.poster)}"` : ''} controls playsinline preload="metadata" title="This week's Stemlord, episode ${STEMLORD.episode}"></video></div>\n`
  : '';

const page = `<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<!-- KNOWHERE:GAMSAT v2 · generated by build-gamsat-page.mjs (Cat's mock v2, 13 Nov 2026) · DO NOT HAND-EDIT: re-run the generator. -->
<title>${esc(TITLE)}</title>
<meta name="description" content="${esc(DESC)}">
<link rel="canonical" href="https://knowhere.me/gamsat">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta name="theme-color" content="#070708">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="knowhere">
<meta property="og:url" content="https://knowhere.me/gamsat">
<meta property="og:title" content="You can read the question. You just don't speak science. Yet.">
<meta property="og:description" content="${esc(DESC)}">
<meta property="og:image" content="https://knowhere.me/og-gamsat.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="knowhere · GAMSAT Section 3 · you can read the question. you just don't speak science. yet.">
<meta property="og:locale" content="en_AU">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="You can read the question. You just don't speak science. Yet.">
<meta name="twitter:description" content="${esc(DESC)}">
<meta name="twitter:image" content="https://knowhere.me/og-gamsat.png">
<script defer src="https://cloud.umami.is/script.js" data-website-id="ee8e1d64-1100-4281-8ca5-179736bcc3e0" data-auto-track="false" data-domains="knowhere.me,app.knowhere.me"></script>
<script defer src="/knowhere-pixel.js?v=4"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="/knowhere-marks.js?v=2"></script>
<script src="/knowhere-passbar.js?v=5" defer data-audience="gamsat" data-where="gamsat" data-open-at="${OPENS_AT}" data-claim="#claim" data-away="#heroOffer,#claimCard"></script>
<style>
html,body{margin:0;padding:0;background:#070708}
.kt2{--bg:#070708;--ink:#EDECE8;--dim:#9A9994;--dimmer:#6E6D69;--brat:#7BEA5A;--kwp:#9B5AEA;--line:rgba(255,255,255,.09);--panel:#0E0E10;--mono:'JetBrains Mono',monospace;
  margin:0;background:var(--bg);color:var(--ink);font-family:'Geist',-apple-system,sans-serif;font-size:16px;line-height:1.55;-webkit-font-smoothing:antialiased;overflow-x:clip;min-height:100vh}
.kt2 *{box-sizing:border-box}
.kt2 a{color:inherit;text-decoration:none}
.kt2 h1,.kt2 h2,.kt2 h3{text-wrap:balance;margin:0;letter-spacing:-.02em}
.kt2 p{margin:0}
.kt2 nav{position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:16px;padding:14px 34px;backdrop-filter:blur(20px) saturate(150%);-webkit-backdrop-filter:blur(20px) saturate(150%);background:rgba(7,7,8,.62);border-bottom:1px solid rgba(255,255,255,.08)}
.kt2 nav .brand{display:flex;align-items:center;gap:9px}
.kt2 nav .mark-wrap{position:relative;width:30px;height:30px;display:grid;place-items:center;flex-shrink:0}
.kt2 nav .mark-glow{position:absolute;inset:-8px;border-radius:50%;background:radial-gradient(circle,rgba(123,234,90,.55),transparent 70%);animation:kgBreathe 3s ease-in-out infinite;pointer-events:none}
@keyframes kgBreathe{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.35);opacity:.15}}
@keyframes kgPulse{0%,100%{color:#EDECE8}50%{color:#7BEA5A}}
.kt2 nav .navmark{position:relative;z-index:1;display:flex;color:#EDECE8;animation:kgPulse 4.2s ease-in-out infinite}
.kt2 nav .wm{font-size:17px;font-weight:800;letter-spacing:-.04em}
.kt2 nav .wm b{color:var(--brat);font-weight:800}
.kt2 nav .sp{flex:1}
.kt2 nav .navcta{font-size:13px;font-weight:700;color:#fff;background:var(--kwp);border-radius:12px;padding:10px 16px;white-space:nowrap;text-transform:lowercase}
@media (max-width:820px){.kt2 nav{padding:12px 18px}}
.kt2 .wrap{max-width:1120px;margin:0 auto;padding:0 20px}
.kt2 section{padding-block:88px}
@media (max-width:760px){.kt2 section{padding-block:56px}}
.kt2 .kicker{font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:var(--brat)}
.kt2 .kicker.dim{color:var(--dimmer)}
.kt2 .lede{color:var(--dim);font-size:17px;max-width:58ch;text-wrap:pretty}
.kt2 .lede b{color:var(--ink);font-weight:600}
.kt2 .brat{color:var(--brat)}
.kt2 .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:15px 24px;border-radius:999px;font-weight:700;font-size:15px;border:1.5px solid transparent;cursor:pointer;font-family:inherit;line-height:1;text-transform:lowercase}
.kt2 .btn-purple{background:var(--kwp);color:#fff;box-shadow:0 8px 30px rgba(155,90,234,.3)}
.kt2 .btn-purple:hover{filter:brightness(1.08)}
.kt2 .btn-purple[disabled]{opacity:.6;cursor:wait}
.kt2 .btn-run{border-color:var(--brat);color:var(--ink);background:transparent;animation:runBreathe 3.2s ease-in-out infinite}
.kt2 .btn-run:hover{background:rgba(123,234,90,.12)}
@keyframes runBreathe{0%,100%{box-shadow:0 0 0 0 rgba(123,234,90,0);transform:translateY(0)}50%{box-shadow:0 0 28px 2px rgba(123,234,90,.32);transform:translateY(-2px)}}
.kt2 :focus-visible{outline:2px solid var(--brat);outline-offset:3px;border-radius:6px}

/* hero banner */
.kt2 .hero{position:relative;overflow:hidden;padding-block:96px 64px}
.kt2 .hero .dust{position:absolute;left:50%;top:-10%;transform:translateX(-50%);width:min(90vw,900px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 50% 40%,rgba(123,234,90,.09),transparent 60%);pointer-events:none}
.kt2 .hero .wrap{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;gap:24px;max-width:960px}
.kt2 .hero h1{font-size:clamp(36px,6.4vw,68px);line-height:1.02;font-weight:900}
.kt2 .hero h1 .l1{display:block;color:var(--dim);font-weight:700;font-size:.5em;line-height:1.2;letter-spacing:-.015em;margin:0 auto .5em;max-width:36ch}
.kt2 .hero h1 .l2{display:block}
.kt2 .offer{width:100%;max-width:780px;text-align:left;border:1px solid rgba(155,90,234,.45);background:linear-gradient(180deg,rgba(155,90,234,.14),rgba(155,90,234,.05));border-radius:18px;padding:22px 26px;display:grid;grid-template-columns:1fr auto;gap:16px 24px;align-items:center}
.kt2 .offer .chip{display:inline-block;font-family:var(--mono);font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--kwp);margin-bottom:8px}
.kt2 .offer h3{font-size:23px;font-weight:800;line-height:1.15}
.kt2 .offer .sub{color:var(--dim);font-size:15px;margin-top:6px;text-wrap:pretty}
.kt2 .offer .r{display:grid;gap:8px;justify-items:end;text-align:right}
.kt2 .offer .fine{font-family:var(--mono);font-size:11px;color:var(--dimmer);letter-spacing:.04em}
@media (max-width:760px){.kt2 .offer{grid-template-columns:1fr;padding:20px}.kt2 .offer .r{justify-items:start;text-align:left}}

/* knowscape */
.kt2 .ks-head{display:grid;gap:14px;margin-bottom:24px}
.kt2 .ks-head h2,.kt2 .sec-h h2{font-size:clamp(30px,4.6vw,48px);line-height:1.06;font-weight:800}
.kt2 .pills{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.kt2 .pill{font-family:inherit;font-size:14px;font-weight:700;padding:10px 18px;border-radius:999px;border:1.5px solid var(--brat);background:transparent;color:var(--ink);cursor:pointer;transition:background .15s,color .15s}
.kt2 .pill:hover{background:rgba(123,234,90,.12)}
.kt2 .pill[aria-pressed="true"]{background:var(--brat);color:#070708}
.kt2 .pill.more{color:var(--dimmer);border-color:var(--line);cursor:default;font-weight:600}
.kt2 .pill.more:hover{background:transparent}
.kt2 .ks-stage{position:relative;border-radius:18px;border:1px solid rgba(255,255,255,.1);background:#0B0D0C;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,.55);scroll-margin-top:90px}
.kt2 .ks-stage iframe{display:block;width:100%;height:900px;border:0;background:transparent;transition:height .25s ease}
.kt2 .knowhow{margin-top:6px;display:grid;grid-template-columns:auto 1fr;gap:8px 18px;align-items:baseline;border:1px solid var(--line);border-left:3px solid #FAC775;border-radius:12px;padding:16px 20px;background:var(--panel)}
.kt2 .knowhow .eye{grid-column:1/-1;font-size:10.5px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--dim)}
.kt2 .knowhow .eye b{color:#3AADA0;font-weight:700}
.kt2 .knowhow .lab{font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#FAC775;white-space:nowrap}
.kt2 .knowhow p{font-size:16px;line-height:1.5}
@media (max-width:760px){.kt2 .knowhow{grid-template-columns:1fr}}

/* stemlord */
.kt2 .stem{border-top:1px solid var(--line);background:linear-gradient(180deg,rgba(255,255,255,.015),transparent)}
.kt2 .sec-h{display:grid;gap:14px;margin-bottom:26px}
.kt2 .epgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px;align-items:stretch}
.kt2 .epgrid.solo{grid-template-columns:1fr}
@media (max-width:900px){.kt2 .epgrid{grid-template-columns:1fr}}
.kt2 .vid{border-radius:18px;border:1px solid var(--line);background:#0B0D11;overflow:hidden;min-height:360px;display:grid;place-items:center}
.kt2 .vid video{width:100%;height:100%;display:block;object-fit:cover}
.kt2 .qcard{background:var(--panel);border:1px solid var(--line);border-top:3px solid var(--brat);border-radius:18px;padding:22px}
.kt2 .typed{font-family:var(--mono);font-size:13.5px;line-height:1.6;background:#0B0D11;border:1px solid var(--line);border-radius:10px;padding:12px 14px}
.kt2 .typed i{font-style:normal;color:var(--brat)}
.kt2 .qcard .q{margin:16px 0 12px;font-size:17px;font-weight:700;line-height:1.4;text-wrap:pretty}
.kt2 .opts{display:grid;gap:8px}
.kt2 .opt{font-family:inherit;text-align:left;cursor:pointer;background:#0C0E12;border:1px solid var(--line);border-radius:12px;padding:12px 14px;color:var(--ink);font-size:15px;display:flex;gap:12px;align-items:center}
.kt2 .opt b{font-family:var(--mono);color:var(--dim);font-weight:500}
.kt2 .opt:hover{border-color:#3a3f48}
.kt2 .opt.right{border-color:var(--brat);background:rgba(123,234,90,.1)}
.kt2 .opt.wrong{border-color:#F09A8A;opacity:.75}
.kt2 .reveal{margin-top:14px;font-size:15px;line-height:1.55;color:var(--dim)}
.kt2 .reveal b{color:var(--ink)}
.kt2 .reveal .turn{display:block;margin:10px 0 14px;font-size:20px;font-weight:800;letter-spacing:-.02em;color:var(--ink);line-height:1.2}

/* claim */
.kt2 .claim .wrap{max-width:820px;text-align:center;display:grid;gap:22px;justify-items:center}
.kt2 .claim h2{font-size:clamp(32px,5vw,54px);line-height:1.04;font-weight:900}
.kt2 .claim .offer{grid-template-columns:1fr;text-align:center;justify-items:center;padding:28px}
.kt2 form{display:grid;gap:14px;width:100%;max-width:440px;margin:6px auto 0}
.kt2 .sit{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;border:0;padding:0;margin:0}
.kt2 .sit legend{width:100%;font-size:14px;color:var(--dim);margin-bottom:8px}
.kt2 .sit label{cursor:pointer}
.kt2 .sit input{position:absolute;opacity:0;pointer-events:none}
.kt2 .sit span{display:inline-block;border:1px solid var(--line);border-radius:99px;padding:9px 15px;font-size:14px;color:var(--dim);transition:all .16s}
.kt2 .sit input:checked+span{border-color:var(--kwp);color:var(--ink);background:rgba(155,90,234,.16)}
.kt2 .sit input:focus-visible+span{outline:2px solid var(--brat);outline-offset:3px}
.kt2 .em{font-family:inherit;font-size:16px;padding:14px 16px;border-radius:12px;border:1px solid var(--line);background:#0C0E12;color:var(--ink);width:100%}
.kt2 .hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.kt2 .msg{font-size:14.5px;line-height:1.55;color:var(--dim);min-height:1.5em}
.kt2 .msg.ok{color:var(--brat)}
.kt2 .msg.bad{color:#F09A8A}
.kt2 .privacy{font-size:12.5px;color:var(--dimmer)}
.kt2 .privacy a{border-bottom:1px solid #3a3a38}
.kt2 footer{border-top:1px solid rgba(123,234,90,.14);padding:28px 20px 120px}
.kt2 footer .in{max-width:1120px;margin:0 auto;display:flex;gap:18px;align-items:center;flex-wrap:wrap;font-size:12px;color:#56554f}
.kt2 footer .sp{flex:1}
.kt2 footer a{color:#8C8B87}
.kt2 footer a:hover{color:var(--brat)}

/* scroll float, the teach it. pattern */
html.kw-float .kt2 [data-float]{opacity:0;transform:translateY(80px) scale(.96);transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform 1.15s cubic-bezier(.2,.7,.2,1)}
html.kw-float .kt2 [data-float].in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){html.kw-float .kt2 [data-float]{opacity:1;transform:none}.kt2 .btn-run,.kt2 nav .mark-glow,.kt2 nav .navmark{animation:none}}
</style>
</head>
<body>
<div class="kt2">

<nav>
  <a class="brand" href="/" aria-label="knowhere home"><span class="mark-wrap"><span class="mark-glow"></span><span class="navmark" data-kw-logo="24"></span></span><span class="wm">know<b>here</b></span></a>
  <span class="sp"></span>
  <a class="navcta" href="${claimHref}" data-claim data-g="nav">claim a founding seat</a>
</nav>

<section class="hero" id="top">
  <div class="dust" aria-hidden="true"></div>
  <div class="wrap">
    <span class="kicker">knowhere · GAMSAT Section 3</span>
    <h1>
      <span class="l1">Section 3 is half your GAMSAT score.<br>It's written in physics, chemistry and biology.</span>
      <span class="l2">You can read the question.<br>You just don't speak science. <span class="brat">Yet.</span></span>
    </h1>
    <div class="offer" id="heroOffer">
      <div>
        <span class="chip">Founding 30</span>
        <h3>A$99 once.<br>Both 2027 sittings.</h3>
        <p class="sub">The whole Section 3 shelf, as things you can move. Free week first.</p>
      </div>
      <div class="r">
        <a class="btn btn-purple" href="${claimHref}" data-claim data-g="hero">claim a founding seat</a>
        <span class="fine" data-after="30 founding seats">30 founding seats · opens Fri 11 December</span>
      </div>
    </div>
    <a class="btn btn-run" href="#knowscape" data-g="stimulated">get stimulated ↓</a>
  </div>
</section>

<section id="knowscape">
  <div class="wrap">
    <div class="ks-head" data-float>
      <span class="kicker">A real concept, live from the app</span>
      <h2>The squid is new.<br><span class="brat">The science isn't.</span></h2>
      <p class="lede">Pick a science. Change something and watch what happens.<br><b>This is the exact model you get.</b></p>
      <div class="pills" role="group" aria-label="Pick a science">
${PILLS.map((p, i) => `        <button type="button" class="pill" data-k="${p.k}" aria-pressed="${i === 0}">${esc(K[p.k].s)}</button>`).join('\n')}
        <span class="pill more">+ ${more} more on the shelf</span>
      </div>
      <div class="knowhow">
        <span class="eye"><b id="ksSubj">${esc(K[PILLS[0].k].s)}</b> · <span id="ksName">${esc(K[PILLS[0].k].n)}</span></span>
        <span class="lab">What Section 3 stimuli hand you</span>
        <p id="ksKnow">${esc(K[PILLS[0].k].k)}</p>
      </div>
    </div>
    <div data-float>
      <div class="ks-stage" id="ksStage"><iframe id="ksFrame" src="${K[PILLS[0].k].src}" title="${esc(K[PILLS[0].k].n)}, a live knowscape" scrolling="no" loading="eager"></iframe></div>
    </div>
  </div>
</section>

<section class="stem" id="stemlord">
  <div class="wrap">
    <div class="sec-h" data-float>
      <span class="kicker">This week's Stemlord · episode ${STEMLORD.episode}</span>
      <h2>The Stemlord writes the questions.<br><span class="brat">You see straight through them.</span></h2>
      <p class="lede">Every Wednesday he dresses ordinary science up as something terrifying.<br><b>Have a go, then move the science underneath.</b></p>
    </div>
    <div class="epgrid${STEMLORD.video ? '' : ' solo'}" data-float>
${vid}      <div class="qcard">
        <div class="typed">${STEMLORD.typed}</div>
        <p class="q">${esc(STEMLORD.question)}</p>
        <div class="opts" id="epOpts">
${opts}
        </div>
        <div class="reveal" id="epReveal" hidden>
          ${STEMLORD.reveal}
          <span class="turn">${STEMLORD.turn}</span>
          <a class="btn btn-run" href="#knowscape" id="epGo">move it yourself ↑</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="claim" id="claim">
  <div class="wrap">
    <span class="kicker" data-float data-after="Early access · open now">Early access · opens Friday 11 December</span>
    <h2 data-float>Walk in knowing you know.<br><span class="brat">Walk out insufferable.</span></h2>
    <div class="offer" id="claimCard" data-float>
      <span class="chip">Founding 30</span>
      <h3>Claim a founding seat.</h3>
      <p class="sub">A$99 once, and it covers both 2027 sittings.<br>Physics, chemistry, biology and the maths, written for an adult who hasn't touched science since school.<br><span data-after="Free week first, and the first 30 in keep the rate.">Free week first. The founding list hears first on Friday 11 December, and the first 30 in keep the rate.</span></p>
      <form id="kgForm" novalidate>
        <fieldset class="sit">
          <legend>Which sitting are you aiming for?</legend>
          <label><input type="radio" name="sitting" value="march-2027"><span>March 2027</span></label>
          <label><input type="radio" name="sitting" value="september-2027"><span>September 2027</span></label>
          <label><input type="radio" name="sitting" value="unsure"><span>not sure yet</span></label>
        </fieldset>
        <input class="em" type="email" name="email" placeholder="you@email.com" autocomplete="email" aria-label="Email" required>
        <div class="hp" aria-hidden="true"><label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
        <button class="btn btn-purple" type="submit" data-g="claim">claim a founding seat</button>
        <p class="msg" id="kgMsg" role="status" aria-live="polite"></p>
        <p class="privacy">One email when it opens. Unsubscribe any time. <a href="/privacy">Privacy</a>.</p>
      </form>
      <a class="btn btn-purple" id="kgSignup" href="${SIGNUP}" data-g="claim" hidden>claim a founding seat</a>
    </div>
  </div>
</section>

<footer><div class="in">
  <span class="navmark" data-kw-logo="18" style="color:#56554f"></span><span>know<b style="color:#7BEA5A">here</b></span>
  <span class="sp"></span>
  <a href="/talk-to-us">talk to us</a><a href="/privacy">privacy</a><a href="/terms">terms of use</a><span>© 2026 knowhere</span>
</div></footer>
</div>

<script>
(function(){
  /* ── config, from build-gamsat-page.mjs ── */
  var OPENS_AT = ${JSON.stringify(OPENS_AT)}, SIGNUP = ${JSON.stringify(SIGNUP)};
  var K = ${JSON.stringify(K)};
  var EP = ${JSON.stringify(EP_PIC)};
  (function inj(){ if(!window.KnowhereMarks){ return setTimeout(inj,60); } document.querySelectorAll('[data-kw-logo]').forEach(function(el){ el.innerHTML=window.KnowhereMarks.logoSvg(parseInt(el.getAttribute('data-kw-logo')||'24',10)); }); })();
  function track(n,d){ try{ if(window.umami){ d=d||{}; d.cohort='gamsat'; window.umami.track(n,d); } }catch(e){} }

  /* ── the 11 Dec switch: before it, every claim CTA goes to #claim (the founding list); from it, to signup ── */
  var OPEN = Date.now() >= Date.parse(OPENS_AT);
  if (OPEN) {
    document.querySelectorAll('a[data-claim]').forEach(function(a){ a.href = SIGNUP; });
    document.querySelectorAll('[data-after]').forEach(function(el){ el.textContent = el.getAttribute('data-after'); });
    var fm = document.getElementById('kgForm'); if (fm) fm.hidden = true;
    var sb = document.getElementById('kgSignup'); if (sb) sb.hidden = false;
  }
  document.querySelectorAll('[data-g]').forEach(function(a){ a.addEventListener('click', function(){ if (a.type !== 'submit') track('gamsat_cta', {where: a.getAttribute('data-g'), open: OPEN}); }); });
  document.addEventListener('click', function(e){ var t = e.target && e.target.closest && e.target.closest('.kw-passbar .pb-cta'); if (t) track('gamsat_cta', {where: 'bar', open: OPEN}); });

  /* ── the knowscape: three pills, and any GAMSAT picture the Stemlord loads ── */
  var cur = ${JSON.stringify(PILLS[0].k)}, f = document.getElementById('ksFrame'), stage = document.getElementById('ksStage');
  function pick(k, scroll, via){
    if (!K[k]) return;
    document.querySelectorAll('.pill[data-k]').forEach(function(p){ p.setAttribute('aria-pressed', p.getAttribute('data-k') === k ? 'true' : 'false'); });
    if (k !== cur){ cur = k; f.src = K[k].src; f.title = K[k].n + ', a live knowscape'; track('gamsat_scape', {k: k === '_ep' ? K[k].id : k, via: via || 'pill'}); }
    document.getElementById('ksSubj').textContent = K[k].s;
    document.getElementById('ksName').textContent = K[k].n;
    document.getElementById('ksKnow').textContent = K[k].k;
    if (scroll) document.getElementById('knowscape').scrollIntoView({behavior:'smooth', block:'start'});
  }
  document.querySelectorAll('.pill[data-k]').forEach(function(p){ p.addEventListener('click', function(){ pick(p.getAttribute('data-k')); }); });
  window.addEventListener('message', function(e){ var d = e && e.data; if (!d || !K[cur] || d.kwId !== K[cur].id || !d.kwH) return; var h = Math.max(480, Math.min(2600, d.kwH)); if (Math.abs(parseInt(f.style.height||0,10) - h) > 8) f.style.height = h + 'px'; });
  /* deep links: ?k=physics|chemistry|biology (and #physics …) pick the pill and scroll */
  var qk = (new URLSearchParams(location.search).get('k') || (location.hash || '').replace('#','')).toLowerCase();
  if (K[qk] && qk !== '_ep') setTimeout(function(){ pick(qk, true, 'link'); }, 60);
  window.addEventListener('hashchange', function(){ var h = (location.hash || '').replace('#',''); if (K[h] && h !== '_ep') pick(h, true, 'link'); });

  /* ── this week's Stemlord ── */
  var opts = document.querySelectorAll('#epOpts .opt'), done = false;
  opts.forEach(function(o){ o.addEventListener('click', function(){
    if (done) return; done = true;
    opts.forEach(function(x){ if (x.getAttribute('data-a') === '1') x.classList.add('right'); else if (x === o) x.classList.add('wrong'); });
    document.getElementById('epReveal').hidden = false;
    track('gamsat_ep_answer', {right: o.getAttribute('data-a') === '1', episode: ${STEMLORD.episode}});
  }); });
  document.getElementById('epGo').addEventListener('click', function(e){ e.preventDefault(); pick(EP, true, 'stemlord'); });

  /* ── the founding list: POST /api/gamsat (tag gamsat + sitting); the copy promises first word, never a place ── */
  var form = document.getElementById('kgForm'), msg = document.getElementById('kgMsg'), btn = form.querySelector('button[type=submit]');
  var q = new URLSearchParams(location.search);
  form.addEventListener('submit', function(ev){
    ev.preventDefault();
    var email = form.email.value.trim(), s = form.querySelector('input[name=sitting]:checked');
    msg.className = 'msg';
    if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email)){ msg.className = 'msg bad'; msg.textContent = 'That email doesn\\u2019t look right.'; return; }
    btn.disabled = true; msg.textContent = 'Saving\\u2026';
    fetch('/api/gamsat', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email: email, sitting: s ? s.value : '', website: form.website.value, source: location.pathname, acqAd: q.get('utm_content') || '', acqCampaign: q.get('utm_campaign') || ''})})
      .then(function(r){ return r.json().then(function(j){ return {ok: r.ok && j.ok, j: j}; }); })
      .then(function(r){
        btn.disabled = false;
        if (!r.ok){ msg.className = 'msg bad'; msg.textContent = (r.j && r.j.error) || 'Couldn\\u2019t save that just now. Try again.'; return; }
        msg.className = 'msg ok'; msg.textContent = 'You\\u2019re on the founding list. On Friday 11 December you hear first, and the first 30 in keep the founding rate.';
        form.email.value = ''; track('gamsat_signup', {sitting: s ? s.value : 'none'});
      })
      .catch(function(){ btn.disabled = false; msg.className = 'msg bad'; msg.textContent = 'Couldn\\u2019t save that just now. Try again.'; });
  });

  /* ── scroll float ── */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && window.IntersectionObserver){
    document.documentElement.classList.add('kw-float');
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {threshold: 0.12});
    document.querySelectorAll('[data-float]').forEach(function(el){ if (el.getBoundingClientRect().top < window.innerHeight * 0.85) el.classList.add('in'); else io.observe(el); });
  }
  track('gamsat_view', {open: OPEN, k: qk || 'none'});
})();
</script>
</body>
</html>
`;
out.push(['gamsat.html', page]);

/* ── checks before anything is written ── */
for (const [f, c] of out) for (const re of BANNED) if (re.test(c)) die(`${f} says ${re} — not on an adult GAMSAT page`);
for (const re of BANNED_TEXT) if (re.test(page)) die(`gamsat.html says ${re} — never promise a held seat`);
for (const p of pics.values()) if (!page.includes(p.src)) die('page does not reference ' + p.src);   /* keeps the concept builder's stale-widget sweep off them */
const mine = new Set(out.map(([f]) => f));
const stale = fs.readdirSync('widgets').filter(f => /^gamsat-.+\.html$/.test(f) && !mine.has('widgets/' + f));

console.log(`build-gamsat-page v2 · app ${path.relative(ROOT, APP) || APP} · opens ${OPENS_AT} · shelf ${shelf} (pill "+ ${more} more") · ${APPLY ? 'APPLY' : 'DRY'}`);
for (const p of pics.values()) console.log(`  ${p.science.padEnd(9)} ${p.id} ${p.slug}${p.id === STEMLORD.picture ? '  ← Stemlord ep ' + STEMLORD.episode : ''}`);
for (const [f, c] of out) { const same = fs.existsSync(f) && fs.readFileSync(f, 'utf8') === c; console.log(`  ${same ? '=' : fs.existsSync(f) ? '~' : '+'} ${f} (${(c.length / 1024).toFixed(1)} KB)`); }
if (stale.length) console.log('  stale (no longer referenced; git rm them):\n' + stale.map(f => '    widgets/' + f).join('\n'));
if (!APPLY) { console.log('DRY: nothing written. Add --apply.'); process.exit(0); }
for (const [f, c] of out) { if (fs.existsSync(f)) fs.copyFileSync(f, f + '.bak-' + new Date().toISOString().replace(/[:.]/g, '-')); fs.writeFileSync(f, c); }
for (const [f, c] of out) if (fs.readFileSync(f, 'utf8') !== c) die(f + ' NOT ON DISK as built');
console.log(`✓ wrote ${out.length} files, read back ✓`);
