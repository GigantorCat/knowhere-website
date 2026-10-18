#!/usr/bin/env python3
"""KW:PAR-V2 (18 Oct 2026) — /for-parents gets the Home treatment, Cat's notes of Sun 18 Oct 11:03.

  1. Banner (one screen, text only): the big "For parents" particle header goes; the network runs along the bottom third.
     Headline as is · "And nobody signed up to be the study police." · KNOWHERE heading · "Year 11 and 12 as living
     concepts they play with until it lands." · "PLAY WITH IT" scroll cue in brat. The top eyebrow moves down (3).
  2. The fission widget gets its own screen, floats in, canvas left / controls right (stacked on a phone). Under it, a
     purple founding-rate card ("claim their seat"), in the exam-pass card pattern; when the offer closes it hides and the
     plain "start their free week" row comes back. The trust line stays under it.
  3. "This is knowing" + "What they actually get" become one block: the eyebrow, "The care factor comes first.", the
     paragraph (no heading), then "Live concepts across 15 HSC and 16 VCE subjects, ready to push, pull and play with."
     above the two links.
  4. The compare section loses the "Founding rate for the first 50. Yours forever." callout (that row is list price).
  5. The sticky bar is the v3 founding bar (knowhere-passbar.js?v=3), hiding while the founding card or the closing CTA
     band is on screen.

Idempotent on the KW:PAR-V2 marker. Backs up to _patches/landing-v2/bak-par-<stamp>/.
Run from the website repo root:  python3 _patches/landing-v2/apply-parents-v2.py [--dry]
"""
import os, sys, shutil, time

DRY = '--dry' in sys.argv
ROOT = os.getcwd()
F = os.path.join(ROOT, 'for-parents.html')
src = open(F, encoding='utf-8').read()
if 'KW:PAR-V2' in src:
    print('already applied (KW:PAR-V2 marker present) — nothing to do'); sys.exit(0)

def swap(s, old, new, n=1, label=''):
    c = s.count(old)
    assert c == n, f'{label}: expected {n} match(es), found {c}'
    return s.replace(old, new)

def cut(s, start, end, new, label=''):
    assert s.count(start) == 1, f'{label}: start anchor count {s.count(start)}'
    i = s.index(start); j = s.index(end, i)
    return s[:i] + new + s[j:]

# ── 1 · head: v3 bar, the network, the new styles ──────────────────────────────────────────
CSS = r'''<script src="./knowhere-passbar.js?v=3" defer data-audience="parent" data-away=".cta-band,.kw-found"></script><!-- KW:PASSBAR → KW:FOUNDBAR (KW:PAR-V2) -->
<script src="./knowhere-network.js?v=1" defer></script><!-- KW:PAR-V2 -->
<style id="kw-par-v2">
  /* KW:PAR-V2 (18 Oct 2026) — the Home layout on /for-parents: a one-screen text banner with the network along the bottom,
     then the live widget on its own screen (floats in), then the founding card. Plain sections: nothing in the first screen
     waits on JS. */
  .kw-par .kp-ban{position:relative;min-height:calc(100vh - 61px);min-height:calc(100svh - 61px);display:flex;align-items:center;justify-content:center;padding:56px 0 170px;text-align:center;overflow:hidden}
  .kw-par .kp-ban-in{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center}
  .kw-par .kp-ban h1{font-size:clamp(32px,4.4vw,58px);line-height:1.04;letter-spacing:-0.045em;font-weight:700;margin:0;max-width:21ch;text-wrap:balance}
  .kw-par .kp-ban-sub{font-size:19px;line-height:1.5;color:#9b9a96;margin:28px 0 0;max-width:46ch}
  .kw-par .kp-brandeye{margin:36px 0 0;font-size:17px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:var(--ink)}
  .kw-par .kp-ban-line{margin:10px 0 0;font-size:20px;line-height:1.45;font-weight:500;letter-spacing:-0.01em;color:var(--ink);max-width:40ch;text-wrap:balance}
  .kw-par .kp-net{position:absolute;left:0;right:0;bottom:0;width:100%;height:34%;pointer-events:none;z-index:0;
    -webkit-mask-image:linear-gradient(to top,#000 55%,transparent 100%);mask-image:linear-gradient(to top,#000 55%,transparent 100%)}
  .kw-par .kp-cue{position:absolute;bottom:calc(96px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);z-index:3;display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--brat);text-decoration:none;font-size:13px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;text-shadow:0 0 12px #070708,0 0 4px #070708;animation:kpCue 2.4s ease-in-out infinite}
  .kw-par .kp-cue svg{width:20px;height:20px}
  .kw-par .kp-cue:hover,.kw-par .kp-cue:focus-visible{color:var(--ink)}
  @keyframes kpCue{0%,100%{opacity:.85;transform:translateX(-50%) translateY(0)}50%{opacity:1;transform:translateX(-50%) translateY(6px)}}
  /* the widget screen */
  .kw-par .kp-proof{position:relative;min-height:100vh;min-height:100svh;display:flex;flex-direction:column;justify-content:center;padding:84px 28px 40px;border-top:1px solid var(--line)}
  .kw-par .kp-proof-in{width:100%;max-width:1240px;margin:0 auto}
  .kw-par .kp-proof-top{display:flex;justify-content:space-between;align-items:baseline;gap:8px 16px;flex-wrap:wrap;margin:0 0 12px;font-size:10.5px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--dim)}
  .kw-par .kp-proof-top b{color:#5b8fe6;font-weight:700}
  .kw-par .kp-proof .proof-card.live-proof{display:block;width:100%;max-width:none;margin:0;border-radius:18px;border:1px solid rgba(255,255,255,.1);background:#0B0D0C;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,.55);transform:none}
  .kw-par .kp-proof .proof-frame{position:relative;aspect-ratio:auto;height:560px;height:clamp(440px,calc(100vh - 250px),760px);height:clamp(440px,calc(100svh - 250px),760px);background:#0B0D0C;overflow:hidden}
  .kw-par .kp-proof .proof-frame picture,.kw-par .kp-proof .proof-frame img.poster{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;object-position:top center}
  .kw-par .kp-proof .proof-frame.on picture{visibility:hidden}
  html.kw-float .kw-par .kp-proof .proof-card{opacity:0;transform:translateY(80px) scale(.96);transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform 1.15s cubic-bezier(.2,.7,.2,1)}
  html.kw-float .kw-par .kp-proof .kp-proof-top{opacity:0;transition:opacity .8s ease .15s}
  html.kw-float .kw-par .kp-proof.in .proof-card{opacity:1;transform:none}
  html.kw-float .kw-par .kp-proof.in .kp-proof-top{opacity:1}
  /* the founding card (purple = the offer): the exam-pass card pattern, one card split by one line, right third tinted */
  .kw-par .kw-found{--kwp:#9B5AEA;--kwp2:#DCC8FA;display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);margin:22px 0 0;border:1px solid rgba(155,90,234,.6);border-radius:22px;overflow:hidden;background:linear-gradient(168deg,rgba(155,90,234,.13),rgba(10,10,13,.7));text-align:left}
  .kw-par .kw-found[data-closed]{display:none}
  .kw-par .kw-found-l{padding:26px 30px;display:flex;flex-direction:column;justify-content:center}
  .kw-par .kw-found-eye{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#B98CF0;margin:0 0 10px}
  .kw-par .kw-found-title{font-size:clamp(28px,3.6vw,42px);font-weight:800;letter-spacing:-0.04em;line-height:1.02;color:var(--kwp);margin:0;text-transform:lowercase}
  .kw-par .kw-found-sub{font-size:17px;font-weight:600;letter-spacing:-0.01em;line-height:1.35;color:var(--ink);margin:10px 0 0}
  .kw-par .kw-found-p{font-size:14px;line-height:1.6;color:var(--dim);margin:8px 0 0;max-width:60ch}
  .kw-par .kw-found-r{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:12px;padding:26px 24px;background:rgba(155,90,234,.09);border-left:1px solid rgba(155,90,234,.42)}
  .kw-par .kw-found-price{font-size:clamp(34px,3.8vw,44px);font-weight:800;letter-spacing:-0.04em;line-height:1;color:#fff;margin:0}
  .kw-par .kw-found-price span{font-size:15px;font-weight:600;letter-spacing:0;color:#cdb6f5;margin-left:3px}
  .kw-par .kw-found-pill{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#B98CF0;background:#070708;border:1px solid rgba(155,90,234,.5);border-radius:999px;padding:5px 12px}
  .kw-par .kw-found-cta{font-size:16px;font-weight:700;color:#070708!important;background:var(--brat);border-radius:12px;padding:15px 28px;text-decoration:none;text-transform:lowercase;white-space:nowrap;transition:transform .18s}
  .kw-par .kw-found-cta:hover{transform:translateY(-1px)}
  .kw-par .kp-cap-go{display:none;align-items:center;justify-content:space-between;gap:12px;margin:22px 0 0;padding:16px 18px;border:1px solid rgba(255,255,255,.1);border-radius:16px;background:#0c0d0f;color:var(--brat);font-size:16px;font-weight:600;text-transform:lowercase}
  .kw-par .kp-cap-go i{width:36px;height:36px;border-radius:10px;background:var(--brat);color:#070708;display:grid;place-items:center;font-style:normal}
  .kw-par .kp-trust{font-size:13px;line-height:1.5;color:var(--dim);margin:14px auto 0;max-width:46ch;text-align:center}
  .kw-par .kp-trust b{color:var(--ink);font-weight:600}
  /* "the care factor" block: the old "This is knowing" + "What they actually get", one statement */
  .kw-par .kp-knowing .wrap{display:flex;flex-direction:column;align-items:center;text-align:center}
  .kw-par .kp-knowing .eyebrow{font-size:11.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--dim)}
  .kw-par .kp-knowing .eyebrow span{color:var(--brat);font-weight:700;font-size:14px;letter-spacing:.02em;text-transform:none}
  .kw-par .kp-knowing h2{margin-left:auto;margin-right:auto}
  .kw-par .kp-knowing .sub{font-size:17px;line-height:1.62;color:#9b9a96;margin:22px auto 0;max-width:54ch}
  .kw-par .kp-knowing .sub em{font-style:normal;color:var(--ink);font-weight:500}
  .kw-par .kp-knowing .k-a{font-size:17px;line-height:1.5;font-weight:500;color:var(--ink);margin:24px auto 0;max-width:40ch;text-wrap:balance}
  @media (max-width:760px){
    .kw-par .kp-ban{padding:40px 0 160px}
    .kw-par .kp-ban h1{font-size:clamp(28px,7.9vw,36px);line-height:1.07}
    .kw-par .kp-ban-sub{font-size:16.5px;margin-top:20px}
    .kw-par .kp-brandeye{margin-top:28px;font-size:14px;letter-spacing:.28em}
    .kw-par .kp-ban-line{font-size:17px}
    .kw-par .kp-proof{padding:28px 12px 32px}
    .kw-par .kp-proof-top{font-size:9.5px;letter-spacing:.16em;margin-bottom:10px;padding:0 4px}
    .kw-par .kp-proof .proof-card.live-proof{border-radius:16px}
    .kw-par .kp-proof .proof-frame{height:560px;height:clamp(500px,calc(100vh - 230px),700px);height:clamp(500px,calc(100svh - 230px),700px)}
    .kw-par .kw-found{grid-template-columns:1fr}
    .kw-par .kw-found-l{padding:22px 20px}
    .kw-par .kw-found-p{display:none}
    .kw-par .kw-found-r{border-left:0;border-top:1px solid rgba(155,90,234,.42);padding:20px}
    .kw-par .kw-found-cta{width:100%;text-align:center}
    .kw-par .kp-knowing .sub,.kw-par .kp-knowing .k-a{font-size:15.5px}
  }
  @media (prefers-reduced-motion:reduce){.kw-par .kp-cue{animation:none}}
</style>'''
src = swap(src, '<script src="./knowhere-passbar.js?v=2" defer data-audience="parent" data-away=".cta-band"></script><!-- KW:PASSBAR -->',
           CSS, 1, 'head')

# ── 2 + 3 · markup: banner, widget screen + founding card, the care-factor block ─────────────
SIGNUP = 'https://app.knowhere.me/signup?as=parent'
ARROW = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"></path></svg>'
HTML = '''  <!-- KW:PAR-V2 (18 Oct 2026) -->
  <!-- A · the banner: one screen of text, the network along the bottom. Paints from this markup alone. -->
  <header class="kp-ban" id="parBan">
    <canvas class="kp-net" data-kw-network aria-hidden="true"></canvas>
    <div class="wrap kp-ban-in">
      <h1>An hour of tutoring a week is plenty of money and <span style="color:var(--brat)">nowhere near enough help.</span></h1>
      <p class="kp-ban-sub">And nobody signed up to be the study police.</p>
      <p class="kp-brandeye">knowhere</p>
      <p class="kp-ban-line">Year 11 and 12 as living concepts they play with until it lands.</p>
    </div>
    <a class="kp-cue" href="#parWidget"><span>play with it</span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg></a>
  </header>

  <!-- KW:PAR-V2 · B · the live widget on its own screen (nuclear fission), canvas left / controls right, the poster painting
       first. Then the founding card (purple = the offer); when the offer closes it hides itself (knowhere-passbar.js) and
       the plain free-week row under it comes back. -->
  <section class="kp-proof" id="parWidget">
    <div class="kp-proof-in">
      <div class="kp-proof-top"><span>A real concept, live from the app</span><span><b>Physics</b> · Nuclear fission</span></div>
      <div class="proof-card live-proof" id="par-proof-card">
        <div class="proof-frame" id="parProofFrame">
          <picture><source media="(max-width:760px)" srcset="/for-parents-proof-fission-m.jpg?v=1"><img class="poster" src="/for-parents-proof-fission-d.jpg?v=1" width="1240" height="560" alt="One real knowhere concept, live: a nuclear fission chain reaction for HSC physics. Push the control rods in and watch it settle; pull them out and watch it run away." loading="eager"></picture>
          <iframe id="parProofWidget" src="/widgets/nuclear-fission-physics.html" title="Nuclear fission — a live knowhere concept. Drag the control rods and watch the chain reaction respond." loading="eager" scrolling="no"></iframe>
        </div>
      </div>
      <div class="kw-found" id="parFound">
        <div class="kw-found-l">
          <p class="kw-found-eye">First 50 student plans</p>
          <p class="kw-found-title">The founding rate.</p>
          <p class="kw-found-sub">Theirs for as long as they stay.</p>
          <p class="kw-found-p">$79 a term instead of $99, or $29 a month, $249 a year. For the first 50 student plans, or until Fri 9 April 2027, whichever comes first.</p>
        </div>
        <div class="kw-found-r">
          <p class="kw-found-price">$79<span>a term</span></p>
          <span class="kw-found-pill">founding rate</span>
          <a class="kw-found-cta" data-kw-from="found-card" href="''' + SIGNUP + '''">claim their seat</a>
        </div>
      </div>
      <a class="kp-cap-go" data-found-fallback="flex" data-kw-from="hero-cap" href="''' + SIGNUP + '''"><span>start their free week</span><i aria-hidden="true">''' + ARROW + '''</i></a>
      <p class="kp-trust"><b>Free for a week.</b> We take a card to start &#8212; cancel inside the week and you pay nothing.</p>
    </div>
  </section>

  <!-- KW:PAR-V2 · C · "This is knowing" + "What they actually get", one statement -->
  <section class="block proof kp-knowing" id="par-proof">
    <div class="wrap">
      <div class="eyebrow">HSC &amp; VCE &middot; Year 11 and 12 &middot; <span>NSW and Victoria</span></div>
      <h2>The care factor <span style="color:var(--brat)">comes first</span>.</h2>
      <p class="sub">Nobody gets interested first &#8212; you understand something, <em>then</em> you care. knowhere is a Year 11 and 12 study app that rebuilds every concept in the shape that lands for them, and shows you each week what landed.</p>
      <p class="k-a">Live concepts across 15 HSC and 16 VCE subjects, ready to push, pull and play with.</p>
      <div class="alt">
        <a href="/how-it-works">See how it works</a>
        <a href="/compare">How it compares</a>
      </div>
    </div>
  </section>

'''
src = cut(src, '  <header class="hero">', '  <section class="block" id="par-cost">', HTML, 'hero + proof')

# ── 4 · compare: the founding callout goes ─────────────────────────────────────────────────
i = src.index('      <p class="founding" data-reveal data-founding-until="2027-04-09" data-founding-seats="50">')
j = src.index('</p>\n', i) + len('</p>\n')
assert 'Founding rate for the first 50. Yours forever.' in src[i:j]
src = src[:i] + src[j:]

# ── 5 · script: no particle header; the new crop; the network + founding cards once the DC markup is in ──
src = swap(src, "      this._stopBanner=window.KnowhereParticleBanner(root,'For parents','heart');",
           "      /* KW:PAR-V2: the big particle header is gone; the network runs along the banner's foot instead */\n"
           "      try{ if(window.KnowhereNetwork) window.KnowhereNetwork.boot(); }catch(e){}\n"
           "      try{ if(window.KnowhereFounding){ window.KnowhereFounding.cards(); window.KnowhereFounding.watch(); } }catch(e){}", 1, 'banner call')

JS = r'''      /* KW:PAR-V2 (18 Oct 2026): the live widget on its own screen. Same-origin iframe: keep the card that holds the rods
         slider, pull in the Uncontrolled / Controlled buttons (and "Know this" on desktop), hide the rest, lay it out to
         fill the frame: canvas left, controls right (stacked on a phone). The frame height comes from the page CSS. Rods
         start 40% in (gently supercritical: the grid is alive, "push the rods in" is the obvious move). The section floats
         in on scroll (html.kw-float, only when it starts below the fold). If any of it fails the poster stays. */
      var pfBox=root.querySelector('#parProofFrame'), pf=root.querySelector('#parProofWidget'), psec=root.querySelector('#parWidget');
      try{
        var rmo=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if(psec&&!rmo&&('IntersectionObserver' in window)&&psec.getBoundingClientRect().top>window.innerHeight*0.6){
          document.documentElement.classList.add('kw-float');
          var fio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ psec.classList.add('in'); fio.disconnect(); } }); },{threshold:0.12});
          fio.observe(psec); this._floatIO=fio;
        }
      }catch(e){ if(psec) psec.classList.add('in'); }
      if(pfBox&&pf){
        var CSS='html,body{height:100%!important;background:#0B0D0C!important}'+
          'body{padding:0!important;margin:0!important;min-height:0!important;overflow:hidden!important}'+
          '.container{max-width:none!important;height:100%!important;margin:0!important}'+
          '.card{height:100%;margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;padding:14px!important;display:flex;flex-direction:column}'+
          '.canvas-wrapper{aspect-ratio:auto!important;flex:1 1 auto;min-height:200px;margin:0 0 12px!important}'+
          '.card-header{margin-bottom:10px!important}.card-hint{display:none}'+
          '.slider-group{margin-top:0!important}'+
          '.toggle-buttons{display:flex;gap:10px;margin:12px 0 0!important}.toggle-btn{flex:1;padding:11px 8px!important;font-size:13.5px!important}'+
          '.stat-row{grid-template-columns:1fr 1fr 1fr!important;gap:8px!important;margin-top:12px!important;padding-top:12px!important}.stat-value{font-size:19px!important}.stat-label{font-size:9.5px!important}'+
          '.know-this{display:none}'+
          '@media (min-width:720px){'+
            '.card{display:grid!important;grid-template-columns:minmax(0,1fr) 310px;grid-template-rows:auto auto auto auto auto 1fr;'+
              'grid-template-areas:"cv hd" "cv ht" "cv sl" "cv tg" "cv st" "cv kt";column-gap:26px;padding:22px!important}'+
            '.canvas-wrapper{grid-area:cv;height:100%;min-height:0;margin:0!important}'+
            '.card-header{grid-area:hd;flex-wrap:wrap;gap:6px;margin:2px 0 10px!important}'+
            '.card-hint{grid-area:ht;display:block;line-height:1.55;margin-bottom:24px!important}'+
            '.slider-group{grid-area:sl}'+
            '.toggle-buttons{grid-area:tg;margin:20px 0 0!important}.toggle-btn{padding:12px 8px!important}'+
            '.stat-row{grid-area:st;grid-template-columns:1fr 1fr!important;row-gap:16px!important;margin:22px 0 0!important}.stat:nth-child(3){grid-column:1/-1}.stat-value{font-size:22px!important}'+
            '.know-this{grid-area:kt;display:block;align-self:end;margin:18px 0 0!important;padding:14px 16px!important}'+
            '.know-this .know-this-body{font-size:14px!important;line-height:1.5!important}'+
          '}'+
          '@media (min-width:720px) and (max-height:700px){.know-this{display:none!important}}';
        var done=false, kick=function(){ try{ pf.contentWindow.dispatchEvent(new pf.contentWindow.Event('resize')); }catch(e){} };
        var crop=function(){
          if(done) return true;
          try{
            var d=pf.contentDocument; if(!d||!d.body) return false;
            var r=d.getElementById('neutronSlider'), card=r&&r.closest('.card'), cont=card&&card.parentElement;
            if(!r||!card||!cont||!d.getElementById('canvas')) return false;
            var tb=d.querySelector('.toggle-buttons'); if(tb) card.insertBefore(tb,card.querySelector('.stat-row'));
            var kt=d.querySelector('.know-this'); if(kt) card.appendChild(kt);
            Array.prototype.forEach.call(cont.children,function(c){ if(c!==card&&c.tagName!=='STYLE'&&c.tagName!=='SCRIPT') c.style.setProperty('display','none','important'); });
            var st=d.createElement('style'); st.textContent=CSS; d.head.appendChild(st);
            try{
              var hiSent=false, hiFire=function(kind){
                if(hiSent) return; hiSent=true;
                try{ if(window.umami) window.umami.track('hero_interact',{page:location.pathname,widget:'nuclear-fission',via:kind,after_s:Math.round((window.performance&&performance.now?performance.now():0)/1000)}); }catch(e){}
              };
              d.addEventListener('pointerdown',function(){ hiFire('pointer'); },{passive:true,capture:true});
              d.addEventListener('touchstart',function(){ hiFire('touch'); },{passive:true,capture:true});
              d.addEventListener('keydown',function(){ hiFire('key'); },true);
            }catch(e){}
            try{ r.value=40; r.dispatchEvent(new pf.contentWindow.Event('input',{bubbles:true})); }catch(e){}
            done=true; kick();
            requestAnimationFrame(function(){ requestAnimationFrame(function(){ kick(); pfBox.classList.add('on'); }); });
            return true;
          }catch(e){ return false; }
        };
        pf.addEventListener('load',function(){ crop(); setTimeout(crop,300); setTimeout(crop,1200); setTimeout(kick,1500); });
        crop();
        window.addEventListener('resize',kick); this._onProofFit=kick;
      }
'''
src = cut(src, '      /* KW:HERO-V4b: the live proof. Same-origin iframe', '      /* KW:PARENT-R3 subjects modal */', JS, 'crop script')

if DRY:
    print('dry run OK — all anchors matched; nothing written'); sys.exit(0)
stamp = time.strftime('%Y%m%d-%H%M%S')
bak = os.path.join(ROOT, '_patches', 'landing-v2', 'bak-par-' + stamp)
os.makedirs(bak, exist_ok=True)
shutil.copy2(F, os.path.join(bak, 'for-parents.html'))
for extra in ['knowhere-passbar.js']:
    if os.path.exists(os.path.join(ROOT, extra)): shutil.copy2(os.path.join(ROOT, extra), os.path.join(bak, extra))
open(F, 'w', encoding='utf-8').write(src)
back = open(F, encoding='utf-8').read()
for needle in ['KW:PAR-V2', 'id="parBan"', 'data-kw-network', 'class="kw-found"', 'claim their seat', 'The care factor', 'knowhere-passbar.js?v=3', 'knowhere-network.js?v=1']:
    assert needle in back, 'receipt missing: ' + needle
for gone in ['Founding rate for the first 50. Yours forever.', "KnowhereParticleBanner(root,'For parents'", 'data-reveal>What they actually get</span>']:
    assert gone not in back, 'still present: ' + gone
print('applied ✓  backup:', os.path.relpath(bak, ROOT))
