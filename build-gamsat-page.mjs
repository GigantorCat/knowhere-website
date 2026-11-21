#!/usr/bin/env node
/* build-gamsat-page.mjs — /gamsat v2 (13 Nov 2026, Bronco · Cat's goated mock v2, the teach it. patterns).
   v1 (12 Nov) was ten physics pictures in a list; v2 is: hero banner (two-tier h1 + the purple founding card + "get
   stimulated ↓") → the knowscape (Physics / Chemistry / Biology pills, the tip card, one full-width stage) → This week's
   Stemlord → the claim section (the founding list form) → footer, with the sticky founding bar (knowhere-passbar.js,
   data-audience="gamsat"). Cat ruled the GAMSAT cohort on 10 Nov: adults, Section 3 only, no state, no year, no school,
   so this page never says Year 12, ATAR, VCE, HSC, a score promise, "guaranteed" or "every subject" (the gate below).

   Cat's call (13 Nov): the page is the founding list first and switches to the real signup at OPENS_AT (one constant):
   before it every "claim a founding seat" goes to #claim; from it they go to signup?as=gamsat and the claim card's form
   becomes that button. Never promise a held seat. GO-LIVE (Cat, 16 Nov): OPENS_AT moved from Fri 11 Dec to Mon 16 Nov 2026;
   a build after the moment writes the page open (OPEN_NOW), and the client switch stays for a build made early.

   INPUT   the app (KW_APP, default ../../Backend/knowhereApp): the flat widget store + sidecars, server.js (injectAccent),
           knowhere.html (the subject colours), pipeline/gamsat/map.json (the shelf count, a picture's science),
           pipeline/gamsat/knowhow.json (GOATED lines, for a Stemlord picture off the pills).
   OUTPUT  gamsat.html · widgets/gamsat-<slug>.html (the three pills + the Stemlord picture). A gamsat-*.html widget no
           longer referenced is listed as stale (delete it with git rm). sitemap.xml: knowhere-seo-v2.sh keeps the /gamsat row (PAGES, kind="ext").
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
const OPENS_AT = '2026-11-16T00:00:00+11:00';                 /* GO-LIVE (Cat, 16 Nov 2026): the door opened Mon 16 Nov 2026, not Fri 11 Dec. Before it the founding list; from it signup */
const OPEN_NOW = Date.now() >= Date.parse(OPENS_AT);          /* built after the moment: the page is written open (no flash of the list before the script runs) */
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
  episode: 1, title: 'the squid', length: '20 seconds', video: '/uploads/stemlord-ep1-9x16.mp4', poster: '/uploads/stemlord-ep1-poster.jpg',
  eyebrow: 'Episode 1: The deep-sea squid',   /* 18 Nov: the episode's own eyebrow, under the rule */
  /* desktop (>900 px), 18 Nov: a 16:9 row above the card. videoLandscape (1920×1080) plays like the phone one; until it exists
     the row shows `still` (a lair crop, never the 9:16 stretched) with `hook` beside it. posterLandscape = its poster frame. */
  videoLandscape: '/uploads/stemlord-ep1-16x9.mp4', posterLandscape: '/uploads/stemlord-ep1-16x9-poster.jpg',
  still: null,
  hook: 'Section 3 will describe the heart as a mystery organ in a <span class="brat">deep-sea squid.</span>',
  typed: 'A deep-sea squid pumps blood through vessels of varying width… <i>at 3,000 metres.</i> Diabolical!',   /* phones (≤900 px) */
  /* desktop (>900 px): the Stemlord's full screen, as a terminal. The grey "// stemlord.exe · episode N · title" line is made
     from episode + title; the LAST line is his sign-off, in brat with a blinking cursor. <i>…</i> = brat. */
  screen: [
    'A deep-sea squid pumps blood through vessels of varying width… <i>at 3,000 metres.</i>',
    'One vessel narrows. Resistance doubles.',
    'What happens to flow?',
    'MWAHAHAHAHA',
  ],
  question: 'Blood flow through a vessel = pressure difference ÷ resistance. One vessel narrows and its resistance doubles, at the same pressure difference. What happens to the flow?',
  options: ['It doubles', 'It halves', 'It stays the same'], answer: 1,
  reveal: '<b>It’s 2.</b> Flow = pressure ÷ resistance, so double the resistance and the flow halves. It’s Ohm’s law, with blood instead of current.',
  turn: 'The squid is new.<br><span class="brat">The physics isn’t.</span>',
  picture: 'cpt_72b311a0',
};
/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════ */

/* words an adult GAMSAT page never says (Cat, 10 Nov) — checked on every file this writes */
const BANNED = [/\byear\s*1[12]\b/i, /\bATAR\b/, /\bVCE\b/, /\bHSC\b/, /guarantee/i, /every subject/i, /\bVCAA\b/, /\bNESA\b/];
const BANNED_TEXT = [/held seat|seat is held|seat held|reserve[sd]? (a|your) seat/i, /free week|free trial|days free|week free/i];   /* never promise a held seat · D87 (15 Nov): GAMSAT has no free week */

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
if (!Array.isArray(STEMLORD.screen) || STEMLORD.screen.length < 2) die('Stemlord needs a screen: at least one line plus the sign-off');
if (STEMLORD.options.length !== 3 || !(STEMLORD.answer >= 0 && STEMLORD.answer < 3)) die('Stemlord needs three options and an answer 0-2');
const more = shelf - PILLS.length;

const claimHref = OPEN_NOW ? SIGNUP : '#claim';   /* the date switch also rewrites every [data-claim] on the client (a page built early still opens on time) */
const TITLE = 'GAMSAT Section 3, as things you can move — knowhere';
const DESC = 'Section 3 is half your GAMSAT score, and it is written in physics, chemistry and biology. Move the science underneath. Founding seats for the 2027 sittings.';
/* KW:GAMSAT-SEO (18 Nov 2026): the page's structured data. It lives here, not in knowhere-seo-v2.sh, because this file owns
   the head. The organisation is named by @id only: the site-wide description names the school certificates, which the gate
   below bans on this page. No dates in it, so a rebuild with nothing changed stays byte-identical. */
const GURL = 'https://knowhere.me/gamsat', GORG = { '@id': 'https://knowhere.me/#org' };
const LD = JSON.stringify({ '@context': 'https://schema.org', '@graph': [
  { '@type': 'Organization', '@id': GORG['@id'], name: 'knowhere', url: 'https://knowhere.me/' },
  { '@type': 'WebPage', '@id': GURL + '#webpage', url: GURL, name: TITLE, description: DESC, inLanguage: 'en-AU', publisher: GORG,
    breadcrumb: { '@id': GURL + '#breadcrumb' }, mainEntity: { '@id': GURL + '#course' } },
  { '@type': 'BreadcrumbList', '@id': GURL + '#breadcrumb', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'knowhere', item: 'https://knowhere.me/' },
    { '@type': 'ListItem', position: 2, name: 'GAMSAT', item: GURL } ] },
  { '@type': 'Course', '@id': GURL + '#course', name: 'GAMSAT Section 3 science, as things you can move',
    description: 'The physics, chemistry and biology under GAMSAT Section 3 as interactive models, for candidates from non-science backgrounds.',
    provider: GORG, inLanguage: 'en-AU',
    about: ['GAMSAT Section 3', 'Reasoning in Biological and Physical Sciences', 'physics', 'chemistry', 'biology'],
    audience: { '@type': 'Audience', audienceType: 'GAMSAT candidates, including those from non-science backgrounds' },
    offers: { '@type': 'Offer', price: '99', priceCurrency: 'AUD', category: 'Paid', url: GURL, availability: 'https://schema.org/InStock' } },
] });
const opts = STEMLORD.options.map((o, i) => `          <button type="button" class="opt" data-a="${i === STEMLORD.answer ? 1 : 0}"><b>${i + 1}</b>${esc(o)}</button>`).join('\n');
const scr = STEMLORD.screen.slice(0, -1).join('<br>');
const term = `<div class="term" aria-label="The Stemlord’s screen"><span class="c">// stemlord.exe · episode ${STEMLORD.episode} · ${esc(STEMLORD.title)}</span>${scr}<span class="mw">${STEMLORD.screen[STEMLORD.screen.length - 1]}<span class="cur" aria-hidden="true"></span></span></div>`;
if (!STEMLORD.eyebrow) die('Stemlord needs an eyebrow (e.g. "Episode 1: The deep-sea squid")');
if (STEMLORD.video && !STEMLORD.videoLandscape && !STEMLORD.still) die('Stemlord needs videoLandscape or a still for the desktop row');
const alt = `The Stemlord in his lair, episode ${STEMLORD.episode}`;
const land = !STEMLORD.video ? '' : STEMLORD.videoLandscape
  ? `      <div class="vid land has"><video src="${esc(STEMLORD.videoLandscape)}"${STEMLORD.posterLandscape ? ` poster="${esc(STEMLORD.posterLandscape)}"` : ''} muted playsinline webkit-playsinline loop controls preload="metadata" data-autoview title="${esc(alt)}, ${esc(STEMLORD.length)}"></video></div>\n`
  : `      <div class="vid land still"><img src="${esc(STEMLORD.still)}" alt="${esc(alt)}" loading="lazy" decoding="async"><p class="cap">${STEMLORD.hook}</p></div>\n`;
const vid = STEMLORD.video
  /* 17 Nov: muted + playsinline (+ the old WebKit spelling) so phones and in-app browsers (Instagram) play it inline and
     never with sound; it is silent anyway. loop + controls stay; the page script plays it when half of it is on screen. */
  ? land + `      <div class="vid por has"><video src="${esc(STEMLORD.video)}"${STEMLORD.poster ? ` poster="${esc(STEMLORD.poster)}"` : ''} muted playsinline webkit-playsinline loop controls preload="metadata" data-autoview title="${esc(alt)}, ${esc(STEMLORD.length)}"></video></div>\n`
  : '';

/* ══ /gamsat-free (Cat, 22 Nov 2026): eleven Section 3 models, free, no login ══════════════════════════════════
   Why: the GAMSAT pass has no free week, so this is the try-before-you-pay. Cat's split: three each for biology,
   chemistry and physics, two for the maths. They are the eleven she filmed for the Facebook groups (17 Nov), so a
   person who saw a clip can be sent the same model: /gamsat-free?k=<key>. hook = the clip's caption hook; tip = the
   GOATED knowhow line, rewritten without the leading "Stimuli" the way the /gamsat pills are (13 Nov).
   A flat file, not gamsat/free: a gamsat/ folder would make the static server redirect /gamsat to /gamsat/. */
const FREE = [
  { s: 'Biology', items: [
    { k: 'cardiac',  id: 'cpt_ec3e3df3', hook: 'Valves don’t decide anything. Pressure does.',
      tip: 'Pressure traces with a stiff aorta or a narrow valve, and a question about what the cuff reads. The trap: taking the ventricle’s peak as the systolic reading.' },
    { k: 'oxygen',   id: 'cpt_aff549d0', hook: 'Your blood hands over about a quarter of its oxygen. On purpose.',
      tip: 'A new pigment or a shifted curve. The trap: reading higher affinity as better delivery, when it means less oxygen unloaded.' },
    { k: 'membrane', id: 'cpt_dab40bb8', hook: 'Every neuron sits at about −70 mV. Mostly it’s potassium’s doing.',
      tip: 'Changed K⁺ or Na⁺ data, and a question about which way the voltage moves. The trap: crediting the pump, not the K⁺ leak, with the −70 mV.' },
  ] },
  { s: 'Chemistry', items: [
    { k: 'gases',       id: 'cpt_5661c185', hook: 'In a gas mixture, every gas acts like it’s alone in the room.',
      tip: 'Altitude or dive gas given as percentages. The trap: treating 21% oxygen as the same dose when its partial pressure has moved.' },
    { k: 'amino-acids', id: 'cpt_ea910aec', hook: 'The same amino acid changes its charge depending on where you put it.',
      tip: 'A pKa table or a titration curve, and a question about charge at some pH. The trap: averaging the wrong two pKas for the isoelectric point.' },
    { k: 'sn1-sn2',     id: 'cpt_8fdbc412', hook: 'One attacks from behind. The other waits.',
      tip: 'Rate data or a product’s R/S label. The trap: assuming inversion must flip R to S, when the priority order can keep the letter.' },
  ] },
  { s: 'Physics', items: [
    { k: 'ohm',      id: 'cpt_72b311a0', hook: 'Ohm’s law is a straight line only while the temperature holds steady.',
      tip: PILLS.find(p => p.id === 'cpt_72b311a0').tip },
    { k: 'pressure', id: 'cpt_b108f2f2', hook: 'Pressure only cares how deep you are, not the shape of the container.',
      tip: 'A diver, a dam or an odd-shaped tank. The trap: reading gauge pressure as absolute, or letting the shape, not the depth, set the pressure.' },
    { k: 'flow',     id: 'cpt_94bb0237', hook: 'Halve the radius and the flow drops to a sixteenth.',
      tip: 'A narrowed artery or a stenosis table. The trap: scaling flow with r or r², not r⁴, so a 10% narrowing looks trivial.' },
  ] },
  { s: 'Maths', items: [
    { k: 'estimating', id: 'cpt_6e2c57ea', hook: 'Round to the leading digit and you’re close enough to pick the answer.',
      tip: 'Options a power of ten apart, so a leading-digit estimate decides it. The trap: rounding every value down and landing a step under.' },
    { k: 'log-scales', id: 'cpt_071e8b8b', hook: 'On a normal ruler, a millimetre and a kilometre are both stuck at zero.',
      tip: 'pH, decibels or populations on a log axis. The trap: reading equal steps as equal amounts, when each step multiplies by ten.' },
  ] },
];
const F = {}, FORDER = [];
for (const g of FREE) for (const it of g.items) {
  if (F[it.k]) die('two free models share the key ' + it.k);
  if (!goatedLine(it.id)) die(it.id + ' has no goated knowhow line, so it is not ready to be a free model');
  const x = picture(it.id);
  if (x.science !== g.s) die(`${it.id} is ${x.science} on the map, not ${g.s}`);
  F[it.k] = { s: x.science, n: x.title, src: x.src, id: x.kwId, h: it.hook, t: it.tip };
  FORDER.push(it.k);
}
const NFREE = FORDER.length, FMORE = shelf - NFREE;
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const NW = WORDS[NFREE] || String(NFREE), NWC = NW[0].toUpperCase() + NW.slice(1);
/* shared by gamsat.html and gamsat-free.html (22 Nov 2026): the styles, the nav and the footer */
const CSS = `html,body{margin:0;padding:0;background:#070708}
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
.kt2 [hidden]{display:none!important}   /* hidden beats .btn and form display rules: the signup button hid behind the list until this (QA, 16 Nov) */
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
.kt2 .epgrid.hasvid{grid-template-columns:minmax(0,340px) minmax(0,1fr)}
@media (max-width:900px){.kt2 .epgrid,.kt2 .epgrid.hasvid{grid-template-columns:1fr}.kt2 .vid{max-width:340px;width:100%;margin:0 auto}}
.kt2 .vid{border-radius:18px;border:1px solid var(--line);background:#0B0D11;overflow:hidden;align-self:start}
.kt2 .vid video{width:100%;height:auto;aspect-ratio:9/16;display:block;object-fit:cover;background:#0B0D11}
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
/* 17–18 Nov (Cat, the mock): above 900 px the video is a 16:9 row (the landscape cut, or the lair still + hook until it
   lands) and the card is two columns: The Stemlord's terminal | the question, options and reveal. Phones: unchanged. */
.kt2 .stem .sec-h{margin-bottom:0}
.kt2 .stem .sec-h .lede{max-width:none}
.kt2 hr.rule{border:0;border-top:1px solid var(--line);margin:34px 0 26px}
.kt2 .kicker.ep{display:block;margin-bottom:14px}
.kt2 .term{display:none}
.kt2 .vid.land{display:none}
@media (min-width:901px){
.kt2 .epgrid.hasvid{grid-template-columns:1fr;gap:20px;max-width:1000px}
.kt2 .vid.por{display:none}
.kt2 .vid.land{display:block;width:100%;aspect-ratio:16/9;position:relative;background:#070708;overflow:hidden}
.kt2 .vid.land video{aspect-ratio:16/9;height:100%}
.kt2 .vid.still img{position:absolute;left:2%;top:50%;transform:translateY(-50%);width:60%;height:auto;display:block;-webkit-mask-image:linear-gradient(90deg,#000 80%,transparent);mask-image:linear-gradient(90deg,#000 80%,transparent)}
.kt2 .vid.still .cap{position:absolute;right:5%;top:50%;transform:translateY(-50%);width:32%;font-size:28px;font-weight:800;line-height:1.15;letter-spacing:-.02em;text-wrap:balance}
.kt2 .qcard{padding:30px 32px;display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:8px 30px;align-items:start}
.kt2 .qcard .term{grid-column:1;grid-row:1 / span 3}
.kt2 .qcard .q,.kt2 .qcard .opts,.kt2 .qcard .reveal{grid-column:2}
.kt2 .typed{display:none}
.kt2 .term{display:block;font-family:var(--mono);font-size:17px;line-height:1.65;background:#0B0D11;border:1px solid var(--line);border-radius:12px;padding:18px 20px}
.kt2 .term .c{color:var(--dimmer);font-size:13px;display:block;margin-bottom:6px}
.kt2 .term i{font-style:normal;color:var(--brat)}
.kt2 .term .mw{display:block;margin-top:8px;color:var(--brat);font-weight:700;letter-spacing:.04em}
.kt2 .term .cur{display:inline-block;width:.6em;height:1.05em;background:var(--brat);vertical-align:-2px;margin-left:4px;animation:kwBlink 1s steps(2) infinite}
.kt2 .qcard .q{font-size:23px;line-height:1.35;margin:0 0 18px;letter-spacing:-.01em}
.kt2 .opts{gap:10px}
.kt2 .opt{font-size:18px;padding:17px 18px;border-radius:14px}
.kt2 .opt b{font-size:14px}
.kt2 .reveal{font-size:17px}
.kt2 .reveal .turn{font-size:26px}
}
@keyframes kwBlink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.kt2 .term .cur{animation:none}}

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
`;
const NAV = `<nav>
  <a class="brand" href="/" aria-label="knowhere home"><span class="mark-wrap"><span class="mark-glow"></span><span class="navmark" data-kw-logo="24"></span></span><span class="wm">know<b>here</b></span></a>
  <span class="sp"></span>
  <a class="navcta" href="${claimHref}" data-claim data-g="nav">claim a founding seat</a>
</nav>
`;
const FOOT = `<footer><div class="in">
  <span class="navmark" data-kw-logo="18" style="color:#56554f"></span><span>know<b style="color:#7BEA5A">here</b></span>
  <span class="sp"></span>
  <a href="/talk-to-us">talk to us</a><a href="/privacy">privacy</a><a href="/terms">terms of use</a><span>© 2026 knowhere</span>
</div></footer>
`;

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
<script type="application/ld+json">${LD}</script>
<script defer src="https://cloud.umami.is/script.js" data-website-id="ee8e1d64-1100-4281-8ca5-179736bcc3e0" data-auto-track="false" data-domains="knowhere.me,app.knowhere.me"></script>
<script defer src="/knowhere-pixel.js?v=4"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="/knowhere-marks.js?v=2"></script>
<script src="/knowhere-passbar.js?v=6" defer data-audience="gamsat" data-where="gamsat" data-open-at="${OPENS_AT}" data-claim="#claim" data-away="#heroOffer,#claimCard"></script>
<style>
${CSS}</style>
</head>
<body>
<div class="kt2">

${NAV}
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
        <p class="sub">The whole Section 3 shelf, as things you can move. One payment, nothing renews.</p>
      </div>
      <div class="r">
        <a class="btn btn-purple" href="${claimHref}" data-claim data-g="hero">claim a founding seat</a>
        <span class="fine" data-after="30 founding seats">${OPEN_NOW ? "30 founding seats" : "30 founding seats · opens soon"}</span>
      </div>
    </div>
    <a class="btn btn-run" href="#knowscape" data-g="stimulated">get stimulated ↓</a>
  </div>
</section>

<section id="knowscape">
  <div class="wrap">
    <div class="ks-head" data-float>
      <span class="kicker">A real concept, live from the app</span>
      <h2>Stop reading about it.<br><span class="brat">See how it works.</span></h2>
      <p class="lede">Pick a subject. Change something and watch what happens.<br><b>This is the exact model you get.</b></p>
      <div class="pills" role="group" aria-label="Pick a subject">
${PILLS.map((p, i) => `        <button type="button" class="pill" data-k="${p.k}" aria-pressed="${i === 0}">${esc(K[p.k].s)}</button>`).join('\n')}
        <span class="pill more">+ ${more} more on the shelf</span>
        <a class="pill free" href="/gamsat-free" data-g="free">${NFREE} free to try →</a>
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
      <span class="kicker">Introducing The Stemlord</span>
      <h2>Welcome to GAMSAT Section 3.<br><span class="brat">Brace yourself for the bizarre.</span></h2>
      <p class="lede">Alien chemistry, weird contraptions and five-legged goats.<br><b>Meet The Stemlord, master of turning ordinary science into something diabolical.</b></p>
    </div>
    <hr class="rule"><span class="kicker ep">${esc(STEMLORD.eyebrow)}</span>
    <div class="epgrid${STEMLORD.video ? ' hasvid' : ' solo'}" data-float>
${vid}      <div class="qcard">
        <div class="typed">${STEMLORD.typed}</div>
        ${term}
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
    <span class="kicker" data-float data-after="Early access · open now">${OPEN_NOW ? "Early access · open now" : "Early access · opens soon"}</span>
    <h2 data-float>Walk in knowing you know.<br><span class="brat">Walk out insufferable.</span></h2>
    <div class="offer" id="claimCard" data-float>
      <span class="chip">Founding 30</span>
      <h3>Claim a founding seat.</h3>
      <p class="sub">A$99 once, and it covers both 2027 sittings.<br>Physics, chemistry, biology and the maths, written for an adult who hasn't touched science since school.<br><span data-after="One payment, nothing renews, and the first 30 in keep the rate.">${OPEN_NOW ? "One payment, nothing renews, and the first 30 in keep the rate." : "One payment, nothing renews. The founding list hears first the moment it opens, and the first 30 in keep the rate."}</span></p>
      <form id="kgForm" novalidate${OPEN_NOW ? " hidden" : ""}>
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
      <a class="btn btn-purple" id="kgSignup" href="${SIGNUP}" data-g="claim"${OPEN_NOW ? "" : " hidden"}>claim a founding seat</a>
    </div>
  </div>
</section>

${FOOT}</div>

<script>
(function(){
  /* ── config, from build-gamsat-page.mjs ── */
  var OPENS_AT = ${JSON.stringify(OPENS_AT)}, SIGNUP = ${JSON.stringify(SIGNUP)};
  var K = ${JSON.stringify(K)};
  var EP = ${JSON.stringify(EP_PIC)};
  (function inj(){ if(!window.KnowhereMarks){ return setTimeout(inj,60); } document.querySelectorAll('[data-kw-logo]').forEach(function(el){ el.innerHTML=window.KnowhereMarks.logoSvg(parseInt(el.getAttribute('data-kw-logo')||'24',10)); }); })();
  function track(n,d){ try{ if(window.umami){ d=d||{}; d.cohort='gamsat'; window.umami.track(n,d); } }catch(e){} }

  /* ── the open switch (OPENS_AT): before it, every claim CTA goes to #claim (the founding list); from it, to signup ── */
  var OPEN = Date.now() >= Date.parse(OPENS_AT);
  if (OPEN) {
    document.querySelectorAll('a[data-claim]').forEach(function(a){ a.href = SIGNUP; });
    document.querySelectorAll('[data-after]').forEach(function(el){ el.textContent = el.getAttribute('data-after'); });
    var fm = document.getElementById('kgForm'); if (fm) fm.hidden = true;
    var sb = document.getElementById('kgSignup'); if (sb) sb.hidden = false;
  }
  document.querySelectorAll('[data-g]').forEach(function(a){ a.addEventListener('click', function(){ if (a.type !== 'submit') track('gamsat_cta', {where: a.getAttribute('data-g'), open: OPEN}); }); });
  document.addEventListener('click', function(e){ var t = e.target && e.target.closest && e.target.closest('.kw-passbar .pb-cta'); if (t) track('gamsat_cta', {where: 'bar', open: OPEN}); });

  /* ── the knowscape: three pills, and any GAMSAT picture The Stemlord loads ── */
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

  /* ── The Stemlord, this week's episode ── */
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
        msg.className = 'msg ok'; msg.textContent = 'You\\u2019re on the founding list. You hear first the moment it opens, and the first 30 in keep the founding rate.';
        form.email.value = ''; track('gamsat_signup', {sitting: s ? s.value : 'none'});
      })
      .catch(function(){ btn.disabled = false; msg.className = 'msg bad'; msg.textContent = 'Couldn\\u2019t save that just now. Try again.'; });
  });

  /* ── scroll float ── */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* The Stemlord (17 Nov): the episode plays, muted, when half of it is on screen and pauses when it leaves. Reduced motion:
     it waits for a tap. One gamsat_ep_play per visit. */
  (function(){
    /* 18 Nov: two cuts can be on the page (9:16 for phones, 16:9 for desktop); only the one on screen ever intersects */
    var vs = document.querySelectorAll('.kt2 video[data-autoview]'); if (!vs.length) return;
    var told = false;
    var io = (reduce || !window.IntersectionObserver) ? null : new IntersectionObserver(function(es){ es.forEach(function(e){
      var v = e.target;
      if (e.isIntersecting && e.intersectionRatio >= 0.5){ var p = v.play(); if (p && p.catch) p.catch(function(){}); } else if (!v.paused) v.pause();
    }); }, {threshold: [0, 0.5]});
    Array.prototype.forEach.call(vs, function(v){
      v.muted = true; v.defaultMuted = true;
      v.addEventListener('play', function(){ if (!told){ told = true; track('gamsat_ep_play', {episode: ${STEMLORD.episode}}); } });
      if (io) io.observe(v);
    });
  })();
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

const F0 = F[FORDER[0]];
const FTITLE = `${NWC} free GAMSAT Section 3 models — knowhere`;
const FDESC = `${NWC} GAMSAT Section 3 science models you can move, free with no login: biology, chemistry, physics and the maths, for candidates from non-science backgrounds.`;
const FURL = 'https://knowhere.me/gamsat-free';
const FLD = JSON.stringify({ '@context': 'https://schema.org', '@graph': [
  { '@type': 'Organization', '@id': GORG['@id'], name: 'knowhere', url: 'https://knowhere.me/' },
  { '@type': 'WebPage', '@id': FURL + '#webpage', url: FURL, name: FTITLE, description: FDESC, inLanguage: 'en-AU', publisher: GORG,
    isAccessibleForFree: true, breadcrumb: { '@id': FURL + '#breadcrumb' }, mainEntity: { '@id': FURL + '#models' } },
  { '@type': 'BreadcrumbList', '@id': FURL + '#breadcrumb', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'knowhere', item: 'https://knowhere.me/' },
    { '@type': 'ListItem', position: 2, name: 'GAMSAT', item: GURL },
    { '@type': 'ListItem', position: 3, name: 'Free models', item: FURL } ] },
  { '@type': 'ItemList', '@id': FURL + '#models', name: 'Free GAMSAT Section 3 models',
    itemListElement: FORDER.map((k, i) => ({ '@type': 'ListItem', position: i + 1, name: F[k].n, url: FURL + '?k=' + k })) },
] });
const picker = FREE.map(g => `      <div class="fcol">
        <span class="kicker dim">${esc(g.s)}</span>
${g.items.map(it => `        <button type="button" class="fbtn" data-k="${it.k}" aria-pressed="${it.k === FORDER[0]}">${esc(F[it.k].n)}</button>`).join('\n')}
      </div>`).join('\n');

const free = `<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<!-- KNOWHERE:GAMSAT-FREE v1 · generated by build-gamsat-page.mjs (Cat, 22 Nov 2026) · DO NOT HAND-EDIT: re-run the generator. -->
<title>${esc(FTITLE)}</title>
<meta name="description" content="${esc(FDESC)}">
<link rel="canonical" href="${FURL}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta name="theme-color" content="#070708">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="knowhere">
<meta property="og:url" content="${FURL}">
<meta property="og:title" content="${NWC} GAMSAT Section 3 models. Free. No login.">
<meta property="og:description" content="${esc(FDESC)}">
<meta property="og:image" content="https://knowhere.me/og-gamsat.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="knowhere · GAMSAT Section 3 · you can read the question. you just don't speak science. yet.">
<meta property="og:locale" content="en_AU">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${NWC} GAMSAT Section 3 models. Free. No login.">
<meta name="twitter:description" content="${esc(FDESC)}">
<meta name="twitter:image" content="https://knowhere.me/og-gamsat.png">
<script type="application/ld+json">${FLD}</script>
<script defer src="https://cloud.umami.is/script.js" data-website-id="ee8e1d64-1100-4281-8ca5-179736bcc3e0" data-auto-track="false" data-domains="knowhere.me,app.knowhere.me"></script>
<script defer src="/knowhere-pixel.js?v=4"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="/knowhere-marks.js?v=2"></script>
<style>
${CSS}
/* gamsat-free (22 Nov 2026) */
.kt2 .hero.free{padding-block:80px 40px}
.kt2 .hero.free h1{font-size:clamp(34px,5.6vw,60px)}
.kt2 .hero.free .lede{margin:0 auto;text-align:center}
.kt2 .fpick{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px 16px;margin-top:8px}
.kt2 .fcol{display:grid;gap:8px;align-content:start}
.kt2 .fcol .kicker{margin-bottom:2px}
.kt2 .fbtn{font-family:inherit;text-align:left;cursor:pointer;background:#0C0E12;border:1px solid var(--line);border-radius:12px;padding:12px 14px;color:var(--ink);font-size:14.5px;font-weight:600;line-height:1.3;transition:border-color .15s,background .15s}
.kt2 .fbtn:hover{border-color:#3a3f48}
.kt2 .fbtn[aria-pressed="true"]{border-color:var(--brat);background:rgba(123,234,90,.1)}
@media (max-width:900px){.kt2 .fpick{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:480px){.kt2 .fpick{gap:14px 10px}.kt2 .fbtn{font-size:13px;padding:10px 11px;border-radius:10px}}
.kt2 .fnow{display:grid;gap:12px;margin:34px 0 16px;scroll-margin-top:100px}
.kt2 .fnow h2{font-size:clamp(24px,3.4vw,36px);line-height:1.12;font-weight:800}
.kt2 .fnext{display:flex;justify-content:flex-end;margin-top:16px}
.kt2 .pill.free{display:inline-flex;align-items:center}
.kt2 .claim .alt{font-size:14px;color:var(--dim)}
.kt2 .claim .alt a{color:var(--ink);border-bottom:1px solid rgba(123,234,90,.5)}
</style>
</head>
<body>
<div class="kt2">

${NAV}
<section class="hero free" id="top">
  <div class="dust" aria-hidden="true"></div>
  <div class="wrap">
    <span class="kicker">knowhere · GAMSAT Section 3 · free to try</span>
    <h1>
      <span class="l1">No login, no email, nothing to sign up for.</span>
      <span class="l2">${NWC} Section 3 models.<br><span class="brat">Free.</span></span>
    </h1>
    <p class="lede">Three each for biology, chemistry and physics, and two for the maths. Pick one, change something and watch what happens.<br><b>These are the exact models you get in the app.</b></p>
  </div>
</section>

<section id="models" style="padding-top:0">
  <div class="wrap">
    <div class="fpick" role="group" aria-label="Pick a model">
${picker}
    </div>
    <div class="fnow" id="fnow">
      <span class="kicker" id="fEye">${esc(F0.s)} · ${esc(F0.n)}</span>
      <h2 id="fHook">${esc(F0.h)}</h2>
      <div class="knowhow">
        <span class="lab">What Section 3 stimuli hand you</span>
        <p id="fTip">${esc(F0.t)}</p>
      </div>
    </div>
    <div class="ks-stage" id="ksStage"><iframe id="ksFrame" src="${F0.src}" title="${esc(F0.n)}, a live knowscape" scrolling="no" loading="eager"></iframe></div>
    <div class="fnext"><button type="button" class="btn btn-run" id="fNext">next model →</button></div>
  </div>
</section>

<section class="claim" id="claim">
  <div class="wrap">
    <span class="kicker" data-float>That’s ${NW}. There are ${FMORE} more.</span>
    <h2 data-float>Liked moving it?<br><span class="brat">The whole shelf moves like that.</span></h2>
    <div class="offer" id="claimCard" data-float>
      <span class="chip">Founding 30</span>
      <h3>A$99 once.<br>Both 2027 sittings.</h3>
      <p class="sub">All ${shelf} Section 3 concepts: physics, chemistry, biology and the maths, written for an adult who hasn’t touched science since school.<br>One payment, nothing renews.</p>
      <a class="btn btn-purple" href="${SIGNUP}" data-g="free-claim">claim a founding seat</a>
    </div>
    <p class="alt" data-float>Not sure yet? <a href="/gamsat#stemlord" data-g="free-stemlord">Meet The Stemlord first →</a></p>
  </div>
</section>

${FOOT}</div>

<script>
(function(){
  /* ── config, from build-gamsat-page.mjs ── */
  var F = ${JSON.stringify(F)};
  var ORDER = ${JSON.stringify(FORDER)};
  (function inj(){ if(!window.KnowhereMarks){ return setTimeout(inj,60); } document.querySelectorAll('[data-kw-logo]').forEach(function(el){ el.innerHTML=window.KnowhereMarks.logoSvg(parseInt(el.getAttribute('data-kw-logo')||'24',10)); }); })();
  function track(n,d){ try{ if(window.umami){ d=d||{}; d.cohort='gamsat'; window.umami.track(n,d); } }catch(e){} }
  /* the door is open (16 Nov): every claim link goes to signup */
  document.querySelectorAll('a[data-claim]').forEach(function(a){ a.href = ${JSON.stringify(SIGNUP)}; });
  document.querySelectorAll('[data-g]').forEach(function(a){ a.addEventListener('click', function(){ track('gamsat_cta', {where: a.getAttribute('data-g'), page: 'free'}); }); });

  /* ── the eleven: pick one, it goes on the stage ── */
  var cur = ORDER[0], f = document.getElementById('ksFrame');
  function pick(k, scroll, via){
    if (!F[k]) return;
    document.querySelectorAll('.fbtn[data-k]').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-k') === k ? 'true' : 'false'); });
    if (k !== cur){ cur = k; f.style.height = ''; f.src = F[k].src; f.title = F[k].n + ', a live knowscape'; track('gamsat_scape', {k: k, via: via || 'pick', page: 'free'}); }
    document.getElementById('fEye').textContent = F[k].s + ' \\u00b7 ' + F[k].n;
    document.getElementById('fHook').textContent = F[k].h;
    document.getElementById('fTip').textContent = F[k].t;
    try { history.replaceState(null, '', location.pathname + '?k=' + k); } catch(e){}
    if (scroll) document.getElementById('fnow').scrollIntoView({behavior:'smooth', block:'start'});
  }
  document.querySelectorAll('.fbtn[data-k]').forEach(function(b){ b.addEventListener('click', function(){ pick(b.getAttribute('data-k'), true); }); });
  document.getElementById('fNext').addEventListener('click', function(){ pick(ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length], true, 'next'); });
  window.addEventListener('message', function(e){ var d = e && e.data; if (!d || !F[cur] || d.kwId !== F[cur].id || !d.kwH) return; var h = Math.max(480, Math.min(2600, d.kwH)); if (Math.abs(parseInt(f.style.height||0,10) - h) > 8) f.style.height = h + 'px'; });
  /* deep links: /gamsat-free?k=oxygen (or #oxygen) opens that model and scrolls to it */
  var qk = (new URLSearchParams(location.search).get('k') || (location.hash || '').replace('#','')).toLowerCase();
  if (F[qk]) setTimeout(function(){ pick(qk, true, 'link'); }, 60);

  /* ── scroll float ── */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && window.IntersectionObserver){
    document.documentElement.classList.add('kw-float');
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {threshold: 0.12});
    document.querySelectorAll('[data-float]').forEach(function(el){ if (el.getBoundingClientRect().top < window.innerHeight * 0.85) el.classList.add('in'); else io.observe(el); });
  }
  track('gamsat_free_view', {k: F[qk] ? qk : 'none'});
})();
</script>
</body>
</html>
`;
out.push(['gamsat-free.html', free]);

/* ── checks before anything is written ── */
for (const [f, c] of out) for (const re of BANNED) if (re.test(c)) die(`${f} says ${re} — not on an adult GAMSAT page`);
for (const [f, c] of [['gamsat.html', page], ['gamsat-free.html', free]]) for (const re of BANNED_TEXT) if (re.test(c)) die(`${f} says ${re} — never promise a held seat`);
for (const p of pics.values()) if (!page.includes(p.src) && !free.includes(p.src)) die('no page references ' + p.src);   /* keeps the concept builder's stale-widget sweep off them */
const mine = new Set(out.map(([f]) => f));
const stale = fs.readdirSync('widgets').filter(f => /^gamsat-.+\.html$/.test(f) && !mine.has('widgets/' + f));

console.log(`build-gamsat-page v2 · app ${path.relative(ROOT, APP) || APP} · opens ${OPENS_AT} (${OPEN_NOW ? 'OPEN: built as signup' : 'not yet: built as the list'}) · shelf ${shelf} (pill "+ ${more} more") · ${APPLY ? 'APPLY' : 'DRY'}`);
for (const p of pics.values()) console.log(`  ${p.science.padEnd(9)} ${p.id} ${p.slug}${p.id === STEMLORD.picture ? '  ← Stemlord ep ' + STEMLORD.episode : ''}`);
for (const [f, c] of out) { const same = fs.existsSync(f) && fs.readFileSync(f, 'utf8') === c; console.log(`  ${same ? '=' : fs.existsSync(f) ? '~' : '+'} ${f} (${(c.length / 1024).toFixed(1)} KB)`); }
if (stale.length) console.log('  stale (no longer referenced; git rm them):\n' + stale.map(f => '    widgets/' + f).join('\n'));
if (!APPLY) { console.log('DRY: nothing written. Add --apply.'); process.exit(0); }
for (const [f, c] of out) { if (fs.existsSync(f)) fs.copyFileSync(f, f + '.bak-' + new Date().toISOString().replace(/[:.]/g, '-')); fs.writeFileSync(f, c); }
for (const [f, c] of out) if (fs.readFileSync(f, 'utf8') !== c) die(f + ' NOT ON DISK as built');
console.log(`✓ wrote ${out.length} files, read back ✓`);
