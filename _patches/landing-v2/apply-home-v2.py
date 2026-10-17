#!/usr/bin/env python3
"""KW:OPENERS-V2 (18 Oct 2026) — Home banner + hero widget, Cat's notes of Sun 18 Oct.

  1. The opener becomes a banner: just the quote + sub in the first screen, a scroll cue to the widget.
     “I memorised it. / Then the exam reworded the question. / Cooked.”
  2. "Cooked." cooks: white → embers rise bottom-up → smoke → ash grey → crumbles to falling dust,
     leaving a faint outline. CSS + one canvas; skipped under prefers-reduced-motion; the word is plain
     white text until the script runs (first screen paints with no JS).
  3. The live widget gets its own full-screen section that floats in on scroll, and becomes
     Le Chatelier's principle (Chemistry), laid out canvas-left / controls-right (stacked on a phone).
     Fission stays on for-parents and in the ad creative.

Idempotent on the KW:OPENERS-V2 marker. Backs up index.html to _patches/landing-v2/bak-<stamp>/ first.
Run from the website repo root:  python3 _patches/landing-v2/apply-home-v2.py [--dry]
"""
import os, sys, shutil, time

DRY = '--dry' in sys.argv
ROOT = os.getcwd()
IDX = os.path.join(ROOT, 'index.html')
WIDGET_DST = os.path.join(ROOT, 'widgets', 'le-chatelier-s-principle-chemistry.html')
WIDGET_SRC = os.path.normpath(os.path.join(ROOT, '..', '..', 'Backend', 'knowhereApp', 'widgets-cache', 'concepts',
                                           'cpt_8019b879--le-chatelier-s-principle.html'))
for a in sys.argv[1:]:
    if a.startswith('--widget-src='): WIDGET_SRC = a.split('=', 1)[1]

src = open(IDX, encoding='utf-8').read()
if 'KW:OPENERS-V2' in src:
    print('already applied (KW:OPENERS-V2 marker present) — nothing to do'); sys.exit(0)

def swap(s, old, new, n=1, label=''):
    c = s.count(old)
    assert c == n, f'{label}: expected {n} match(es), found {c}'
    return s.replace(old, new)

def cut(s, start, end, new, label=''):
    """replace from the start anchor up to (not including) the end anchor"""
    assert s.count(start) == 1, f'{label}: start anchor count {s.count(start)}'
    i = s.index(start); j = s.index(end, i)
    assert s.count(end) >= 1
    return s[:i] + new + s[j:]

# ── 1 · CSS ────────────────────────────────────────────────────────────────────────────
CSS = r'''  /* KW:OPENERS-V2 (18 Oct 2026) — Cat's notes: the opener is a banner (text only, one screen), "Cooked." cooks, and the
     live widget gets its own full-screen section that floats in. Plain sections, solid ground over the particle stage. */
  .kp-open,.kp-proof,.kp-corners{position:relative;z-index:3;background:#070708;scroll-snap-align:start}
  .kp-open{min-height:100vh;min-height:100svh;display:flex;align-items:center;justify-content:center;padding:96px 34px 96px;text-align:center;overflow:hidden}
  .kp-open-in{position:relative;z-index:1;width:100%;max-width:1120px;margin:0 auto;display:flex;flex-direction:column;align-items:center}
  .kp-open .kp-eye{font-size:10.5px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#8C8B87;margin:0}
  .kp-open h1{font-size:clamp(34px,4.9vw,66px);line-height:1.03;font-weight:700;letter-spacing:-0.045em;margin:22px 0 0;color:#EDECE8;text-wrap:balance}
  .kp-open h1 .ln{display:block;text-wrap:balance}
  .kp-open .kp-open-sub{font-size:18px;line-height:1.55;color:#9b9a96;margin:28px 0 0;max-width:46ch;text-wrap:pretty}
  .kp-open .kp-fx{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2}
  .kp-open .kp-cue{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);z-index:3;display:flex;flex-direction:column;align-items:center;gap:6px;color:#8C8B87;text-decoration:none;font-size:10.5px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;animation:kpHint 2.4s ease-in-out infinite}
  .kp-open .kp-cue:hover,.kp-open .kp-cue:focus-visible{color:#7BEA5A}
  /* "Cooked." — plain white until the script adds .burn; every stage is a class, so no JS means no animation */
  .kp-cooked{position:relative;display:inline-block;color:#EDECE8;-webkit-text-stroke:1px transparent;transition:-webkit-text-stroke-color 1.6s ease}
  .kp-cooked::after{content:attr(data-word);position:absolute;left:0;top:0;color:#7a766f;-webkit-text-fill-color:#7a766f;opacity:0;transition:opacity 1s ease;pointer-events:none}
  .kp-cooked.burn{color:transparent;-webkit-text-fill-color:transparent;background-image:linear-gradient(to top,#ff3606 0%,#ff6512 16%,#ffa53a 30%,#ffd27a 40%,#EDECE8 52%,#EDECE8 100%);background-size:100% 260%;background-position:0 0;-webkit-background-clip:text;background-clip:text;animation:kpEmber 2.6s cubic-bezier(.45,0,.3,1) forwards}
  .kp-cooked.lit{background-position:0 100%;animation:kpFlick 1.25s ease-in-out infinite alternate}
  .kp-cooked.ash{background-position:0 100%;animation:none;filter:none}
  .kp-cooked.ash::after{opacity:1}
  .kp-cooked.gone{background-image:none;-webkit-text-stroke-color:rgba(237,236,232,.2)}
  .kp-cooked.gone::after{opacity:0;transition:none}
  @keyframes kpEmber{0%{background-position:0 0;filter:drop-shadow(0 0 0 rgba(255,90,20,0))}100%{background-position:0 100%;filter:drop-shadow(0 0 12px rgba(255,80,20,.5)) drop-shadow(0 0 3px rgba(255,140,40,.55))}}
  @keyframes kpFlick{0%{filter:drop-shadow(0 0 12px rgba(255,80,20,.5)) drop-shadow(0 0 3px rgba(255,140,40,.55)) brightness(1)}100%{filter:drop-shadow(0 0 22px rgba(255,105,30,.72)) drop-shadow(0 0 4px rgba(255,170,60,.7)) brightness(1.16)}}
  /* the hero widget: its own screen, canvas-left / controls-right inside the frame (the page script lays out the widget) */
  .kp-proof{min-height:100vh;min-height:100svh;display:flex;flex-direction:column;justify-content:center;padding:84px 28px 36px}
  .kp-proof-in{width:100%;max-width:1240px;margin:0 auto}
  .kp-proof-top{display:flex;justify-content:space-between;align-items:baseline;gap:8px 16px;flex-wrap:wrap;margin:0 0 12px;font-size:10.5px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#8C8B87}
  .kp-proof-top b{color:#3AADA0;font-weight:700}
  .kp-proof .proof-card{display:block;width:100%;border-radius:18px;border:1px solid rgba(255,255,255,.1);background:#0B0D0C;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,.55)}
  .kp-proof .proof-frame{position:relative;height:550px;height:clamp(440px,calc(100vh - 250px),760px);height:clamp(440px,calc(100svh - 250px),760px);background:#0B0D0C;overflow:hidden}
  .kp-proof .proof-frame picture,.kp-proof .proof-frame img.poster{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;object-position:top center}
  .kp-proof .proof-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;background:transparent;opacity:0;pointer-events:none;transition:opacity .35s}
  .kp-proof .proof-frame.on iframe{opacity:1;pointer-events:auto}
  .kp-proof .proof-frame.on picture{visibility:hidden}
  .kp-proof-cta{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:12px 18px;margin-top:22px}
  .kp-proof-cta .fr{margin:0;font-size:14.5px;color:#9b9a96}
  .kp-proof .kp-live{margin:16px 0 0;text-align:center;font-size:11px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:#8C8B87}
  /* floats in on scroll: the class only exists when the script ran and the section started below the fold */
  html.kw-float .kp-proof .proof-card{opacity:0;transform:translateY(80px) scale(.96);transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform 1.15s cubic-bezier(.2,.7,.2,1)}
  html.kw-float .kp-proof .kp-proof-top{opacity:0;transition:opacity .8s ease .15s}
  html.kw-float .kp-proof.in .proof-card{opacity:1;transform:none}
  html.kw-float .kp-proof.in .kp-proof-top{opacity:1}
  @media (prefers-reduced-motion:reduce){.kp-open .kp-cue{animation:none}}
'''
src = cut(src, '  /* KW:OPENERS (17 Oct 2026) — the opener hero + the corner strip, before the IYKYK mask.',
          '  /* the corner strip: two doors', CSS, 'css block')

MOB_OLD = '''    .kp-open{padding:84px 20px 40px}
    .kp-open h1{font-size:29px}
    .kp-open .kp-open-sub{font-size:15.5px}
    .kp-open .proof-frame{aspect-ratio:366/492}
    .kp-open .kp-open-cta{width:100%}
    .kp-open .kp-open-cta .kp-cta{width:100%;justify-content:center}
    .kp-open .kp-open-cta .kw-hand{width:100%;text-align:center}
'''
MOB_NEW = '''    .kp-open{padding:84px 22px 92px}
    .kp-open h1{font-size:clamp(28px,7.9vw,38px);line-height:1.07}
    .kp-open .kp-open-sub{font-size:16px;margin-top:22px}
    .kp-proof{padding:74px 12px 28px}
    .kp-proof-top{font-size:9.5px;letter-spacing:.16em;margin-bottom:10px;padding:0 4px}
    .kp-proof .proof-card{border-radius:16px}
    .kp-proof .proof-frame{height:560px;height:clamp(500px,calc(100vh - 290px),700px);height:clamp(500px,calc(100svh - 290px),700px)}
    .kp-proof-cta{flex-direction:column;gap:10px;margin-top:18px}
    .kp-proof-cta .kp-cta{width:100%;justify-content:center}
    .kp-proof-cta .kw-hand{width:100%;text-align:center}
'''
src = swap(src, MOB_OLD, MOB_NEW, 1, 'mobile block')

# ── 2 · markup ─────────────────────────────────────────────────────────────────────────
HTML = '''<!-- KW:OPENERS-V2 (18 Oct 2026) -->
  <!-- A · the banner. Text only, one screen. "Cooked." is plain white text until the page script cooks it (and never
       under reduced motion), so the first screen paints from this markup alone. -->
  <section data-screen-label="Opener" class="kp-open" id="kwOpen">
    <canvas class="kp-fx" id="kwCookFx" aria-hidden="true"></canvas>
    <div class="kp-open-in">
      <p class="kp-eye">HSC &amp; VCE · Year 11 and 12</p>
      <h1><span class="ln">&#8220;I memorised it.</span><span class="ln">Then the exam reworded the question.</span><span class="ln"><span class="kp-cooked" id="kwCooked" data-word="Cooked.">Cooked.</span>&#8221;</span></h1>
      <p class="kp-open-sub">Not if you know how it works. Then the exam can reword it all it likes. knowhere turns Year 11 and 12 into living concepts you poke until it lands.</p>
    </div>
    <a class="kp-cue" href="#kwProof"><span>poke it</span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg></a>
  </section>

  <!-- KW:OPENERS-V2 (18 Oct 2026) -->
  <!-- A2 · the hero widget, its own screen: Le Chatelier's principle (Chemistry). The JPG paints first; the page script
       lays the live widget out canvas-left / controls-right (stacked on a phone) and swaps it in. If any of it fails the
       poster stays. Fission stays on for-parents and in the ad creative. -->
  <section data-screen-label="Proof" class="kp-proof" id="kwProof">
    <div class="snapmark" style="bottom:0;scroll-snap-align:end" aria-hidden="true"></div>
    <div class="kp-proof-in">
      <div class="kp-proof-top"><span>A real concept, live from the app</span><span><b>Chemistry</b> · Le Chatelier&#8217;s principle</span></div>
      <div class="proof-card live-proof" id="homeProofCard">
        <div class="proof-frame" id="homeProofFrame">
          <picture><source media="(max-width:740px)" srcset="/home-proof-lechatelier-m.jpg?v=1"><img class="poster" src="/home-proof-lechatelier-d.jpg?v=1" width="1240" height="560" alt="One real knowhere concept, live: Le Chatelier's principle. Particles of A pair up into P and split apart again; change the amount of A, squeeze the box or heat it, and watch the mix shift." loading="eager"></picture>
          <iframe id="homeProofWidget" src="/widgets/le-chatelier-s-principle-chemistry.html" title="Le Chatelier's principle — a live knowhere concept. Change the amount of A, squeeze the box or heat it, and watch the equilibrium shift." loading="eager" scrolling="no"></iframe>
        </div>
      </div>
      <div class="kp-proof-cta">
        <a href="https://app.knowhere.me/signup" class="kp-cta" data-kw-cta data-kw-from="hero">start your free week</a>
        <p class="fr">not your card? send it to whoever&#8217;s is.</p>
        <button type="button" class="kw-hand" data-kw-handoff="site-home">send this to a parent</button>
      </div>
      <p class="kp-live">Live now for the HSC &amp; VCE · <span style="color:#7BEA5A">seven days free</span></p>
    </div>
  </section>

  '''
src = cut(src, '<!-- KW:OPENERS (17 Oct 2026) -->\n  <!-- A · the opener.',
          '<!-- KW:OPENERS (17 Oct 2026) -->\n  <!-- B · the corner strip', HTML, 'section A')

# ── 3 · script ─────────────────────────────────────────────────────────────────────────
src = swap(src, '    this.startProof();   /* KW:OPENERS */',
           '    this.startProof();   /* KW:OPENERS */\n    this.startCook();    /* KW:OPENERS-V2 */', 1, 'mount hook')

JS = r'''  /* KW:OPENERS-V2 (18 Oct 2026): the hero widget, Le Chatelier's principle. Same-origin iframe: keep the card that holds
     the slider, pull the two stress buttons (Pressure ×2 / Heat it) into it, hide the rest, and lay it out to fill the
     frame: canvas left, controls right (stacked on a phone). The frame's height comes from the page CSS, not the widget.
     The section floats in on scroll (html.kw-float, only when it starts below the fold). If any of it fails, the poster stays. */
  startProof(){
    var pfBox=document.getElementById('homeProofFrame'), pf=document.getElementById('homeProofWidget'), sec=document.getElementById('kwProof');
    try{
      if(sec&&!this.reduce&&('IntersectionObserver' in window)&&sec.getBoundingClientRect().top>window.innerHeight*0.6){
        document.documentElement.classList.add('kw-float');
        var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ sec.classList.add('in'); io.disconnect(); } }); },{threshold:0.12});
        io.observe(sec); this._floatIO=io;
      }
    }catch(e){ if(sec) sec.classList.add('in'); }
    if(!pfBox||!pf) return;
    var CSS='html,body{height:100%!important;background:#0B0D0C!important}'+
      'body{padding:0!important;margin:0!important;min-height:0!important;overflow:hidden!important}'+
      '.container{max-width:none!important;height:100%!important;margin:0!important}'+
      '.card{height:100%;margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;padding:14px!important;display:flex;flex-direction:column}'+
      '.canvas-wrapper{aspect-ratio:auto!important;flex:1 1 auto;min-height:200px;margin:0 0 14px!important}'+
      '.card-header{margin-bottom:10px!important}.card-hint{display:none}'+
      '.toggle-section{margin:12px 0 0!important}.toggle-btn{padding:11px 8px!important;font-size:13.5px!important}'+
      '.stat-row{margin-top:12px!important;padding-top:12px!important}.know-this{display:none}'+
      '@media (min-width:720px){'+
        '.card{display:grid!important;grid-template-columns:minmax(0,1fr) 310px;grid-template-rows:auto auto auto auto auto 1fr;'+
          'grid-template-areas:"cv hd" "cv ht" "cv sl" "cv tg" "cv st" "cv kt";column-gap:26px;padding:22px!important}'+
        '.canvas-wrapper{grid-area:cv;height:100%;min-height:0;margin:0!important}'+
        '.card-header{grid-area:hd;flex-wrap:wrap;gap:6px;margin:2px 0 10px!important}'+
        '.card-hint{grid-area:ht;display:block;line-height:1.55;margin-bottom:26px!important}'+
        '.slider-wrapper{grid-area:sl;margin:0!important}'+
        '.toggle-section{grid-area:tg;margin:22px 0 0!important}.toggle-btn{padding:12px 8px!important}'+
        '.stat-row{grid-area:st;margin:22px 0 0!important}'+
        '.know-this{grid-area:kt;display:block;align-self:end;margin:18px 0 0!important;padding:14px 16px!important;font-size:14px!important;line-height:1.5!important}'+
        '.know-this .know-this-body{font-size:14.5px!important;line-height:1.5!important}'+
      '}';
    var done=false, kick=function(){ try{ pf.contentWindow.dispatchEvent(new pf.contentWindow.Event('resize')); }catch(e){} };
    var crop=function(){
      if(done) return true;
      try{
        var d=pf.contentDocument; if(!d||!d.body) return false;
        var r=d.getElementById('stressSlider'), card=r&&r.closest('.card'), cont=card&&card.parentElement;
        if(!r||!card||!cont||!d.getElementById('canvas')) return false;
        var tg=d.querySelector('.toggle-section'); if(tg) card.insertBefore(tg,card.querySelector('.stat-row'));
        var kt=d.querySelector('.know-this'); if(kt) card.appendChild(kt);
        Array.prototype.forEach.call(cont.children,function(c){ if(c!==card&&c.tagName!=='STYLE'&&c.tagName!=='SCRIPT') c.style.setProperty('display','none','important'); });
        var st=d.createElement('style'); st.textContent=CSS; d.head.appendChild(st);
        try{
          var hiSent=false, hiFire=function(kind){
            if(hiSent) return; hiSent=true;
            try{ if(window.umami) window.umami.track('hero_interact',{page:location.pathname,widget:'le-chatelier',via:kind,after_s:Math.round((window.performance&&performance.now?performance.now():0)/1000)}); }catch(e){}
          };
          d.addEventListener('pointerdown',function(){ hiFire('pointer'); },{passive:true,capture:true});
          d.addEventListener('touchstart',function(){ hiFire('touch'); },{passive:true,capture:true});
          d.addEventListener('keydown',function(){ hiFire('key'); },true);
        }catch(e){}
        done=true; kick();
        requestAnimationFrame(function(){ requestAnimationFrame(function(){ kick(); pfBox.classList.add('on'); }); });
        return true;
      }catch(e){ return false; }
    };
    pf.addEventListener('load',function(){ crop(); setTimeout(crop,300); setTimeout(crop,1200); setTimeout(kick,1500); });
    crop();
    window.addEventListener('resize',kick); this._onProofFit=kick;
  }

  /* KW:OPENERS-V2 (18 Oct 2026): "Cooked." cooks, once, after the reader has had a beat with the line.
     Embers rise bottom-up (CSS, .burn → .lit), smoke lifts off the word (canvas), it goes ash grey (.ash), then the word is
     sampled into dust that crumbles and falls, leaving a faint outline (.gone). The text stays in the DOM for screen readers;
     under reduced motion none of this runs and the word stays white. */
  startCook(){
    var w=document.getElementById('kwCooked'), cv=document.getElementById('kwCookFx'), sec=document.getElementById('kwOpen');
    if(!w||!cv||!sec||this.reduce||!cv.getContext) return;
    var ctx=cv.getContext('2d'), dpr=Math.min(window.devicePixelRatio||1,2), W=0, H=0;
    var size=function(){ var r=sec.getBoundingClientRect(); W=r.width; H=r.height; cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); ctx.setTransform(dpr,0,0,dpr,0,0); };
    var box=function(){ var a=w.getBoundingClientRect(), s=sec.getBoundingClientRect(); return {x:a.left-s.left,y:a.top-s.top,w:a.width,h:a.height}; };
    var smoke=[], dust=[], smokeOn=false, running=false, ending=false, raf=0, timers=[];
    var later=function(fn,ms){ timers.push(setTimeout(fn,ms)); };
    var sample=function(){
      var b=box(), cs=getComputedStyle(w), pad=12, oc=document.createElement('canvas');
      oc.width=Math.ceil(b.w+pad*2); oc.height=Math.ceil(b.h+pad*2);
      var o=oc.getContext('2d');
      o.font=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
      try{ o.letterSpacing=cs.letterSpacing; }catch(e){}
      o.textBaseline='alphabetic'; o.fillStyle='#fff';
      var t=w.textContent; if(cs.textTransform==='lowercase') t=t.toLowerCase(); else if(cs.textTransform==='uppercase') t=t.toUpperCase();
      var m=o.measureText(t), asc=m.fontBoundingBoxAscent||m.actualBoundingBoxAscent, des=m.fontBoundingBoxDescent||m.actualBoundingBoxDescent;
      o.fillText(t,pad,pad+(b.h-(asc+des))/2+asc);
      var px=o.getImageData(0,0,oc.width,oc.height).data, step=W<700?2:3, out=[];
      for(var y=0;y<oc.height;y+=step) for(var x=0;x<oc.width;x+=step){
        if(px[(y*oc.width+x)*4+3]>120){
          var k=(y-pad)/Math.max(1,b.h), ember=Math.random()<0.05;
          out.push({x:b.x-pad+x+(Math.random()-0.5)*step*0.8,y:b.y-pad+y+(Math.random()-0.5)*step*0.8,s:step*(0.7+Math.random()*0.5),vx:(Math.random()-0.5)*0.7,vy:Math.random()*0.5,a:0.95,
            t:performance.now()+k*650+Math.random()*1100,ember:ember,g:118+Math.floor(Math.random()*30)});
        }
      }
      return out;
    };
    var frame=function(now){
      raf=requestAnimationFrame(frame);
      ctx.clearRect(0,0,W,H);
      var b=box();
      if(smokeOn&&Math.random()<0.5){
        smoke.push({x:b.x+b.w*(0.06+Math.random()*0.88),y:b.y+b.h*(0.2+Math.random()*0.2),vx:(Math.random()-0.5)*0.25,
          vy:-(0.35+Math.random()*0.5),r:0.6+Math.random()*1.1,life:0,max:110+Math.random()*90,ph:Math.random()*6.28});
      }
      for(var j=smoke.length-1;j>=0;j--){
        var s=smoke[j]; s.life++; s.x+=s.vx+Math.sin(s.ph+s.life/24)*0.22; s.y+=s.vy; s.r+=0.018;
        var k=s.life/s.max, a=k<0.15?(k/0.15)*0.42:0.42*(1-(k-0.15)/0.85);
        if(k>=1){ smoke.splice(j,1); continue; }
        var g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*1.7);
        g.addColorStop(0,'rgba(205,200,192,'+a.toFixed(3)+')'); g.addColorStop(1,'rgba(205,200,192,0)');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(s.x,s.y,s.r*1.7,0,6.283); ctx.fill();
      }
      for(var q=dust.length-1;q>=0;q--){
        var d=dust[q];
        if(now>=d.t){ d.vy+=0.085; d.vx*=0.992; d.x+=d.vx+Math.sin((now+d.t)/300)*0.15; d.y+=d.vy; d.a-=0.0075; }
        if(d.a<=0||d.y>H+10){ dust.splice(q,1); continue; }
        ctx.fillStyle=d.ember?'rgba(255,'+(110+Math.floor(Math.random()*60))+',40,'+d.a.toFixed(3)+')':'rgba('+d.g+','+(d.g-4)+','+(d.g-10)+','+d.a.toFixed(3)+')';
        ctx.fillRect(d.x,d.y,d.s,d.s);
      }
      if(ending&&!smokeOn&&!smoke.length&&!dust.length&&running){ cancelAnimationFrame(raf); running=false; ctx.clearRect(0,0,W,H); }
    };
    var go=function(){
      size(); running=true; raf=requestAnimationFrame(frame);
      w.classList.add('burn');
      later(function(){ smokeOn=true; },600);
      later(function(){ w.classList.add('lit'); },2650);
      later(function(){ w.classList.add('ash'); },4200);
      later(function(){
        try{ dust=sample(); }catch(e){ dust=[]; }
        w.classList.add('gone');
      },5300);
      later(function(){ smokeOn=false; ending=true; },5800);
    };
    var started=false, start=function(){ if(started) return; started=true; later(go,1300); };
    var arm=function(){
      if('IntersectionObserver' in window){
        var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ start(); io.disconnect(); } }); },{threshold:0.5});
        io.observe(sec);
      } else start();
    };
    if(document.fonts&&document.fonts.ready) document.fonts.ready.then(arm); else arm();
    window.addEventListener('resize',size); this._cookResize=size;
    this._cookStop=function(){ timers.forEach(clearTimeout); cancelAnimationFrame(raf); };
  }

'''
src = cut(src, "  /* KW:OPENERS (17 Oct 2026): the opener's live proof, the for-parents KW:HERO-V4b crop as is.",
          '  /* ─── IYKYK video text mask', JS, 'startProof')

# ── write ──────────────────────────────────────────────────────────────────────────────
if DRY:
    print('dry run OK — all anchors matched; nothing written'); sys.exit(0)
stamp = time.strftime('%Y%m%d-%H%M%S')
bak = os.path.join(ROOT, '_patches', 'landing-v2', 'bak-' + stamp)
os.makedirs(bak, exist_ok=True)
shutil.copy2(IDX, os.path.join(bak, 'index.html'))
if not os.path.exists(WIDGET_DST):
    assert os.path.exists(WIDGET_SRC), f'widget source missing: {WIDGET_SRC}'
    shutil.copy2(WIDGET_SRC, WIDGET_DST)
open(IDX, 'w', encoding='utf-8').write(src)
back = open(IDX, encoding='utf-8').read()
for needle in ['KW:OPENERS-V2', 'id="kwCooked"', 'id="kwProof"', 'startCook(){', 'le-chatelier-s-principle-chemistry.html']:
    assert needle in back, 'receipt missing: ' + needle
assert 'nuclear-fission-physics.html' not in back, 'fission still referenced on Home'
print('applied ✓  backup:', os.path.relpath(bak, ROOT))
print('receipts ✓  widget:', os.path.relpath(WIDGET_DST, ROOT), os.path.getsize(WIDGET_DST), 'bytes')
