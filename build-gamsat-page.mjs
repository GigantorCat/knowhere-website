#!/usr/bin/env node
/* build-gamsat-page.mjs — the GAMSAT free hook (Job 0, Bronco, 12 Nov 2026).
   /gamsat: "Section 3 physics in ten things you can move" + the early-access sign-up (POST /api/gamsat).
   Cat ruled the GAMSAT cohort on 10 Nov: adults, Section 3 only, no state, no year, no school. So this page
   never says Year 12, ATAR, VCE, HSC, a score promise, "guaranteed" or "every subject", and it has its own
   footer (the shared one links the school shelves and carries the VCAA line).

   INPUT   the app (KW_APP, default ../../Backend/knowhereApp): the flat widget store + sidecars,
           server.js (injectAccent, the app's own accent bake), knowhere.html (the physics colour),
           pipeline/gamsat/knowhow.json (the Section 3 line, GOATED ONLY).
   OUTPUT  gamsat.html · widgets/gamsat-<slug>.html (one per knowscape). Not touched: sitemap.xml (its /gamsat row is
           hand-authored, which build-concept-pages.mjs keeps), every other page.
   Dry run by default; --apply writes, then reads every file back.                                             */
import fs from 'node:fs';
import path from 'node:path';

const APPLY = process.argv.includes('--apply');
const ROOT = process.cwd();
const APP = process.env.KW_APP ? path.resolve(process.env.KW_APP) : path.join(ROOT, '..', '..', 'Backend', 'knowhereApp');
const FLAT = path.join(APP, 'widgets-cache', 'concepts');
const die = m => { console.error('✗ ' + m); process.exit(1); };
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Cat's ten (10 Nov), in her order. The bench (cpt_17694ff8 cpt_f45d48b4 cpt_73cb6da1 cpt_0cd8f56a) swaps in here. */
const TEN = ['cpt_b77d2f69', 'cpt_e26c1747', 'cpt_9d978d68', 'cpt_3e70e77e', 'cpt_c0c1ce20',
             'cpt_749e7aeb', 'cpt_72b311a0', 'cpt_0f988cdf', 'cpt_d50a3754', 'cpt_81be0d30'];

/* words an adult GAMSAT page never says (Cat, 10 Nov) — checked on every file this writes */
const BANNED = [/\byear\s*1[12]\b/i, /\bATAR\b/, /\bVCE\b/, /\bHSC\b/, /guarantee/i, /every subject/i, /\bVCAA\b/, /\bNESA\b/];

/* ── the app's own accent bake and physics colour ── */
const srv = fs.readFileSync(path.join(APP, 'server.js'), 'utf8');
const ai = srv.indexOf('function injectAccent(html, accent) {');
if (ai < 0) die('injectAccent not found in the app server.js');
let depth = 0, ei = ai, open = false;
for (; ei < srv.length; ei++) { const ch = srv[ei]; if (ch === '{') { depth++; open = true; } else if (ch === '}') { depth--; if (open && depth === 0) { ei++; break; } } }
const injectAccent = new Function(srv.slice(ai, ei) + '; return injectAccent;')();
const appHtml = fs.readFileSync(path.join(APP, 'knowhere.html'), 'utf8');
const pm = /\{id:'physics',name:'Physics',icon:'[^']*',color:'(#[0-9A-Fa-f]{6})'/.exec(appHtml) || die('physics colour not found in knowhere.html');
const ACCENT = pm[1];

const files = fs.readdirSync(FLAT);
const knowhow = JSON.parse(fs.readFileSync(path.join(APP, 'pipeline', 'gamsat', 'knowhow.json'), 'utf8')).entries;

/* the widget wrapper is the concept pages' own (build-concept-pages.mjs): MOBFIX + the kwFit height beacon */
const MOBFIX = `<style id="kwMobFix">body{padding-bottom:30px!important;margin-bottom:0!important}hr{display:none!important}.kw-foot{display:none!important}
@media (max-width:480px){*{min-width:0;overflow-wrap:anywhere}div{flex-wrap:wrap}canvas,svg,img,video{max-width:100%!important;height:auto!important}table{display:block;max-width:100%;overflow-x:auto}pre{white-space:pre-wrap;max-width:100%}}
body>*:last-child{margin-bottom:0!important;padding-bottom:0!important}html,body,body>*{min-height:0!important}
@media (max-width:640px){h1{font-size:clamp(16px,4.5vw,25px)!important;font-weight:800!important;line-height:1.15!important}}</style>`;
const beacon = id => `<script>/* kwFit: the widget tells the page how tall it is, so the frame fits it (F14: never a viewport min-height inside a frame) */
(function(){function h(){return Math.ceil(document.documentElement.scrollHeight);}function send(){try{parent.postMessage({kwH:h(),kwId:'${id}'},'*');}catch(e){}}
if(window.ResizeObserver){new ResizeObserver(send).observe(document.body);}window.addEventListener('load',send);setTimeout(send,600);setTimeout(send,2000);})();</script>`;

const out = [];   /* [file, content] */
const items = TEN.map((id, i) => {
  const hf = files.find(f => f.startsWith(id + '--') && f.endsWith('.html')) || die('no widget for ' + id);
  const mf = files.find(f => f.startsWith(id + '--') && f.endsWith('.meta.json')) || die('no sidecar for ' + id);
  const meta = JSON.parse(fs.readFileSync(path.join(FLAT, mf), 'utf8'));
  const slug = hf.slice(id.length + 2, -5);
  const k = knowhow[id];
  const line = k && k.meta && k.meta.review && k.meta.review.v === 'goat' ? k.knowhow : null;   /* goated only */
  const raw = fs.readFileSync(path.join(FLAT, hf), 'utf8');
  const baked = injectAccent(raw, ACCENT);
  if (/#3AADA0/i.test(baked)) die(`teal survived the bake in ${slug}`);
  const wname = `gamsat-${slug}.html`;
  out.push(['widgets/' + wname, `<!DOCTYPE html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(meta.title)} — live knowscape</title>${MOBFIX}</head><body>
${baked}
${beacon('g' + (i + 1))}</body></html>`]);
  return { n: i + 1, id, slug, title: meta.title, summary: meta.summary || '', line, widget: '/widgets/' + wname };
});

const cards = items.map(x => `      <button type="button" class="card" data-n="${x.n}" data-src="${x.widget}" data-title="${esc(x.title)}" aria-pressed="${x.n === 1}">
        <span class="no">${String(x.n).padStart(2, '0')}</span>
        <span class="t">${esc(x.title)}</span>
        ${x.line ? `<span class="s3"><b>what Section 3 does with it</b> ${esc(x.line)}</span>` : `<span class="s3">${esc(x.summary)}</span>`}
      </button>`).join('\n');

const TITLE = 'GAMSAT Section 3 physics, as ten things you can move — knowhere';
const DESC = 'Section 3 is written in physics, chemistry and biology. Ten free physics knowscapes you can move, from knowhere, for adults who never studied science.';
const page = `<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- KNOWHERE:GAMSAT v1 · generated by build-gamsat-page.mjs · DO NOT HAND-EDIT: re-run the generator. -->
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
<meta property="og:image" content="https://knowhere.me/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="knowhere — science you can move">
<meta property="og:locale" content="en_AU">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="You can read the question. You just don't speak science. Yet.">
<meta name="twitter:description" content="${esc(DESC)}">
<meta name="twitter:image" content="https://knowhere.me/og-image.png">
<script defer src="https://cloud.umami.is/script.js" data-website-id="ee8e1d64-1100-4281-8ca5-179736bcc3e0" data-auto-track="false" data-domains="knowhere.me,app.knowhere.me"></script>
<script defer src="/knowhere-pixel.js?v=4"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="/knowhere-marks.js?v=2"></script>
<style>
html,body{margin:0;padding:0;background:#070708}
.kg *{margin:0;padding:0;box-sizing:border-box}
.kg{--bg:#08090B;--panel:#101318;--line:#22262E;--ink:#EDEDE8;--dim:#8A9096;--brat:#7BEA5A;--subj:${ACCENT};background:var(--bg);color:var(--ink);font-family:'Geist',-apple-system,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:clip}
.kg a{text-decoration:none;color:inherit}
.kg h1,.kg h2{text-transform:lowercase}
.kg nav{position:sticky;top:0;z-index:200;display:flex;align-items:center;gap:16px;padding:14px 34px;backdrop-filter:blur(20px) saturate(150%);-webkit-backdrop-filter:blur(20px) saturate(150%);background:rgba(7,7,8,.62);border-bottom:1px solid rgba(255,255,255,.08)}
@media (max-width:820px){.kg nav{padding:12px 18px}}
.kg .mark-wrap{position:relative;width:30px;height:30px;display:grid;place-items:center;flex-shrink:0}
.kg .mark-glow{position:absolute;inset:-8px;border-radius:50%;background:radial-gradient(circle,rgba(123,234,90,.55),transparent 70%);animation:kgBreathe 3s ease-in-out infinite;pointer-events:none}
@keyframes kgBreathe{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.35);opacity:.15}}
@keyframes kgPulse{0%,100%{color:#EDEDE8}50%{color:#7BEA5A}}
.kg .navmark{position:relative;z-index:1;display:flex;color:#EDEDE8;animation:kgPulse 4.2s ease-in-out infinite}
.kg .wordmark{font-size:16.5px;font-weight:700;letter-spacing:-.04em}
.kg nav .sp{flex:1}
.kg .nav-cta{font-size:13px;font-weight:700;color:#070708;background:var(--brat);border-radius:12px;padding:10px 18px;box-shadow:0 6px 22px rgba(123,234,90,.25);white-space:nowrap;text-transform:lowercase}
.kg .wrap{max-width:1120px;margin:0 auto;padding:0 20px}
.kg .mono{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--dim)}
.kg .hero{padding:clamp(44px,8vh,90px) 0 10px}
.kg .eyebrow{color:var(--brat);margin-bottom:18px}
.kg h1{font-size:clamp(40px,7.2vw,88px);font-weight:800;letter-spacing:-.045em;line-height:.98;margin:0 0 22px;text-wrap:balance}
.kg h1 .y{color:var(--brat)}
.kg .big{font-size:clamp(18px,2.2vw,24px);line-height:1.42;max-width:44ch;font-weight:500;letter-spacing:-.01em}
.kg .hero .doors{margin-top:26px}
.kg h2{font-size:clamp(28px,4.4vw,46px);font-weight:900;letter-spacing:-.03em;line-height:1.02;margin:10px 0 14px;text-wrap:balance}
.kg h2 .s{color:var(--subj)}
.kg .section{margin-top:64px}
.kg .lead{max-width:62ch;font-size:16px;line-height:1.62;color:var(--dim)}
.kg .lead b{color:var(--ink);font-weight:600}
.kg .play{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:16px;margin-top:24px;align-items:start}
@media (max-width:900px){.kg .play{grid-template-columns:1fr}}
.kg .panel{background:var(--panel);border:1px solid var(--line);border-top:3px solid var(--subj);border-radius:18px;overflow:hidden;position:sticky;top:76px}
@media (max-width:900px){.kg .panel{position:static}}
.kg .chrome{display:flex;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);flex-wrap:wrap}
.kg .chrome .l{color:var(--subj)}
.kg .chrome .r{color:var(--brat)}
.kg .panel iframe{border:0;width:100%;height:900px;background:var(--bg);display:block;transition:height .25s ease}
.kg .list{display:grid;gap:8px}
.kg .card{font-family:inherit;text-align:left;cursor:pointer;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:13px 15px;display:grid;grid-template-columns:auto 1fr;gap:4px 12px;color:var(--ink);transition:border-color .16s,background .16s}
.kg .card:hover{border-color:color-mix(in srgb,var(--subj) 60%,transparent)}
.kg .card[aria-pressed="true"]{border-color:var(--subj);background:color-mix(in srgb,var(--subj) 10%,var(--panel))}
.kg .card .no{grid-row:span 2;font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--subj);padding-top:3px}
.kg .card .t{font-size:16px;font-weight:700;letter-spacing:-.02em;text-transform:lowercase}
.kg .card .s3{font-size:13.5px;line-height:1.5;color:var(--dim)}
.kg .card .s3 b{display:block;font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:#FAC775;font-weight:500;margin-bottom:2px}
.kg .early{margin:80px auto 0;max-width:1120px;padding:0 20px}
.kg .box{border:1px solid var(--line);border-radius:22px;padding:clamp(26px,4vw,44px);background:linear-gradient(168deg,rgba(123,234,90,.07),rgba(10,10,12,.2) 60%);text-align:center}
.kg .box .lead{margin:0 auto 22px}
.kg form{display:grid;gap:14px;max-width:460px;margin:0 auto}
.kg .sit{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;border:0}
.kg .sit legend{width:100%;font-size:14px;color:var(--dim);margin-bottom:8px}
.kg .sit label{cursor:pointer}
.kg .sit input{position:absolute;opacity:0;pointer-events:none}
.kg .sit span{display:inline-block;border:1px solid var(--line);border-radius:99px;padding:9px 15px;font-size:14px;color:var(--dim);transition:all .16s}
.kg .sit input:checked+span{border-color:var(--brat);color:var(--ink);background:rgba(123,234,90,.1)}
.kg .sit input:focus-visible+span{outline:2px solid var(--brat);outline-offset:3px}
.kg .em{font-family:inherit;font-size:16px;padding:14px 16px;border-radius:12px;border:1px solid var(--line);background:#0C0E12;color:var(--ink);width:100%}
.kg .em:focus{outline:2px solid var(--brat);outline-offset:1px}
.kg .door{font-family:inherit;font-size:15px;font-weight:700;letter-spacing:-.01em;border-radius:12px;padding:14px 22px;display:inline-block;text-transform:lowercase;cursor:pointer;border:0;color:#070708;background:var(--brat);box-shadow:0 6px 22px rgba(123,234,90,.25);transition:transform .18s}
.kg .door:hover{transform:translateY(-1px)}
.kg .door[disabled]{opacity:.6;cursor:wait}
.kg .hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.kg .msg{font-size:14.5px;line-height:1.55;color:var(--dim);min-height:1.5em}
.kg .msg.ok{color:var(--brat)}
.kg .msg.bad{color:#F09A8A}
.kg .fine{margin-top:14px;font-size:12.5px;color:#6B6A66}
.kg .fine a{border-bottom:1px solid #3a3a38}
.kg footer{margin-top:90px;border-top:1px solid rgba(123,234,90,.14);padding:28px 20px 40px}
.kg footer .in{max-width:1120px;margin:0 auto;display:flex;gap:18px;align-items:center;flex-wrap:wrap;font-size:12px;color:#56554f}
.kg footer .in .sp{flex:1}
.kg footer a{color:#8C8B87}
.kg footer a:hover{color:var(--brat)}
.kg button:focus-visible,.kg a:focus-visible{outline:2px solid var(--brat);outline-offset:3px}
@media (prefers-reduced-motion:reduce){.kg *{animation:none!important;transition:none!important}}
</style>
</head>
<body>
<div class="kg">

  <nav>
    <a class="brand" href="/" style="display:flex;align-items:center;gap:9px">
      <span class="mark-wrap"><span class="mark-glow"></span><span class="navmark" data-kw-logo="24"></span></span>
      <span class="wordmark">know<b>here</b></span>
    </a>
    <span class="sp"></span>
    <a class="nav-cta" href="#early" data-g="nav">get early access</a>
  </nav>

  <header class="hero wrap">
    <div class="eyebrow mono">GAMSAT · Section 3</div>
    <h1>You can read the question. You just don't speak science. <span class="y">Yet.</span></h1>
    <p class="big">Section 3 is half your GAMSAT score, and it's written in physics, chemistry and biology. knowhere gives you the science underneath as things you can move, so a stimulus you've never seen still makes sense.</p>
    <div class="doors"><a class="door" href="#early" data-g="hero">tell me when the full shelf opens</a></div>
  </header>

  <section class="section wrap" id="ten">
    <div class="mono">free · no sign-up</div>
    <h2>Section 3 physics in <span class="s">ten things you can move</span></h2>
    <p class="lead">These are real knowscapes from knowhere, not pictures of them. <b>Move something and watch what changes.</b> Each one comes with the move Section 3 stimuli make with it, and the trap.</p>
    <div class="play">
      <div class="panel">
        <div class="chrome"><span class="l" id="kgName">01 · ${esc(items[0].title.toLowerCase())}</span><span class="r">move it · it is yours</span></div>
        <iframe id="kgFrame" src="${items[0].widget}" title="${esc(items[0].title)} — interactive knowscape" loading="eager" scrolling="no"></iframe>
      </div>
      <div class="list" role="group" aria-label="Ten physics knowscapes">
${cards}
      </div>
    </div>
  </section>

  <section class="early" id="early">
    <div class="box">
      <div class="mono" style="margin-bottom:12px">early access · opens Friday 11 December</div>
      <h2>the full shelf: physics, chemistry, biology and the maths.</h2>
      <p class="lead">For the March 2027 sitting, written for an adult who never did science at school. Leave your email and we'll tell you the day it opens.</p>
      <form id="kgForm" novalidate>
        <fieldset class="sit">
          <legend>Which sitting are you aiming for?</legend>
          <label><input type="radio" name="sitting" value="march-2027"><span>March 2027</span></label>
          <label><input type="radio" name="sitting" value="september-2027"><span>September 2027</span></label>
          <label><input type="radio" name="sitting" value="unsure"><span>not sure yet</span></label>
        </fieldset>
        <input class="em" type="email" name="email" autocomplete="email" placeholder="your email" aria-label="Your email" required>
        <div class="hp" aria-hidden="true"><label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
        <div><button class="door" type="submit">tell me when the full shelf opens</button></div>
        <p class="msg" id="kgMsg" role="status" aria-live="polite"></p>
      </form>
      <p class="fine">One email when it opens. Unsubscribe any time. <a href="/privacy">Privacy</a>.</p>
    </div>
  </section>

  <footer><div class="in">
    <span class="navmark" data-kw-logo="18" style="animation:none;color:#56554f"></span><span>know<b>here</b></span>
    <span class="sp"></span>
    <a href="/talk-to-us">talk to us</a><a href="/privacy">privacy</a><a href="/terms">terms of use</a><span>© 2026 knowhere</span>
  </div></footer>

</div>
<script>
(function(){
  (function inj(){ if(!window.KnowhereMarks){ return setTimeout(inj,60); } document.querySelectorAll('[data-kw-logo]').forEach(function(el){ el.innerHTML=window.KnowhereMarks.logoSvg(parseInt(el.getAttribute('data-kw-logo')||'24',10)); }); })();
  function track(n,d){ try{ if(window.umami){ d=d||{}; d.cohort='gamsat'; window.umami.track(n,d); } }catch(e){} }
  var f=document.getElementById('kgFrame'), name=document.getElementById('kgName'), cur=1;
  window.addEventListener('message',function(e){ var d=e&&e.data; if(!d||d.kwId!=='g'+cur||!d.kwH) return; var h=Math.max(420,Math.min(2600,d.kwH)); if(Math.abs(parseInt(f.style.height||0,10)-h)>8) f.style.height=h+'px'; });
  var cards=document.querySelectorAll('.kg .card');
  Array.prototype.forEach.call(cards,function(c){ c.addEventListener('click',function(){
    var n=parseInt(c.getAttribute('data-n'),10); if(n===cur) return; cur=n;
    Array.prototype.forEach.call(cards,function(o){ o.setAttribute('aria-pressed', o===c ? 'true' : 'false'); });
    f.src=c.getAttribute('data-src'); f.title=c.getAttribute('data-title')+' — interactive knowscape';
    name.textContent=(n<10?'0':'')+n+' · '+c.getAttribute('data-title').toLowerCase();
    track('gamsat_scape',{n:n,slug:c.getAttribute('data-src').replace(/^\\/widgets\\/gamsat-|\\.html$/g,'')});
    if(window.innerWidth<=900) f.parentNode.scrollIntoView({behavior:'smooth',block:'start'});
  }); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-g]'),function(a){ a.addEventListener('click',function(){ track('gamsat_cta',{where:a.getAttribute('data-g')}); }); });
  track('gamsat_view',{});
  var form=document.getElementById('kgForm'), msg=document.getElementById('kgMsg'), btn=form.querySelector('button');
  var q=new URLSearchParams(location.search);
  form.addEventListener('submit',function(ev){
    ev.preventDefault();
    var email=form.email.value.trim(), s=form.querySelector('input[name=sitting]:checked');
    msg.className='msg';
    if(!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email)){ msg.className='msg bad'; msg.textContent="That email doesn't look right."; return; }
    btn.disabled=true; msg.textContent='Saving…';
    fetch('/api/gamsat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,sitting:s?s.value:'',website:form.website.value,source:location.pathname,acqAd:q.get('utm_content')||'',acqCampaign:q.get('utm_campaign')||''})})
      .then(function(r){ return r.json().then(function(j){ return {ok:r.ok&&j.ok,j:j}; }); })
      .then(function(r){
        btn.disabled=false;
        if(!r.ok){ msg.className='msg bad'; msg.textContent=(r.j&&r.j.error)||"Couldn't save that just now. Try again."; return; }
        msg.className='msg ok'; msg.textContent="You're on the list. We'll email you when early access opens on Friday 11 December.";
        form.email.value=''; track('gamsat_signup',{sitting:s?s.value:'none'});
      })
      .catch(function(){ btn.disabled=false; msg.className='msg bad'; msg.textContent="Couldn't save that just now. Try again."; });
  });
})();
</script>
</body>
</html>
`;
out.push(['gamsat.html', page]);

/* checks before anything is written */
for (const [f, c] of out) for (const re of BANNED) if (re.test(c)) die(`${f} says ${re} — not on an adult GAMSAT page`);
for (const x of items) if (!page.includes(x.widget)) die('page does not reference ' + x.widget);   /* keeps the concept builder's stale-widget sweep off them */

console.log(`build-gamsat-page · app ${path.relative(ROOT, APP) || APP} · physics ${ACCENT} · ${APPLY ? 'APPLY' : 'DRY'}`);
for (const x of items) console.log(`  ${String(x.n).padStart(2)} ${x.id} ${x.slug}${x.line ? '' : '  ⚠ no goated Section 3 line, shows the summary'}`);
for (const [f, c] of out) {
  const same = fs.existsSync(f) && fs.readFileSync(f, 'utf8') === c;
  console.log(`  ${same ? '=' : fs.existsSync(f) ? '~' : '+'} ${f} (${(c.length / 1024).toFixed(1)} KB)`);
}
if (!APPLY) { console.log('DRY: nothing written. Add --apply.'); process.exit(0); }
for (const [f, c] of out) { if (fs.existsSync(f)) fs.copyFileSync(f, f + '.bak-' + new Date().toISOString().replace(/[:.]/g, '-')); fs.writeFileSync(f, c); }
for (const [f, c] of out) if (fs.readFileSync(f, 'utf8') !== c) die(f + ' NOT ON DISK as built');
console.log(`✓ wrote ${out.length} files, read back ✓`);
