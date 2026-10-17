#!/usr/bin/env python3
"""KW:OPENERS-V3 (18 Oct 2026) — Cat's notes on the V2 banner, Sun 18 Oct 10:16.

  1. "Cooked." starts cooking almost at once (no long white pause) and STAYS cooking: embers + flicker + smoke wisps +
     the odd spark, forever. No ash, no crumble.
  2. An attribution under the quote.
  3. The sub reworked: one line, then a KNOWHERE eyebrow, then "Year 11 and 12 as living concepts you play with until
     it lands."
  4. The top eyebrow (HSC & VCE · Year 11 and 12) goes.
  5. Subtle background action: a dot-wave field across the bottom of the banner (brat green, perspective rows, fades
     out upward). Pauses when the banner is off screen; one still frame under reduced motion.

Runs on top of KW:OPENERS-V2. Idempotent on the KW:OPENERS-V3 marker. Backs up to _patches/landing-v2/bak-v3-<stamp>/.
Run from the website repo root:  python3 _patches/landing-v2/apply-home-v3.py [--dry]
"""
import os, sys, shutil, time

DRY = '--dry' in sys.argv
ROOT = os.getcwd()
IDX = os.path.join(ROOT, 'index.html')
src = open(IDX, encoding='utf-8').read()
if 'KW:OPENERS-V3' in src:
    print('already applied (KW:OPENERS-V3 marker present) — nothing to do'); sys.exit(0)
assert 'KW:OPENERS-V2' in src, 'V2 is not applied — run apply-home-v2.py first'

def swap(s, old, new, n=1, label=''):
    c = s.count(old)
    assert c == n, f'{label}: expected {n} match(es), found {c}'
    return s.replace(old, new)

def cut(s, start, end, new, label=''):
    assert s.count(start) == 1, f'{label}: start anchor count {s.count(start)}'
    i = s.index(start); j = s.index(end, i)
    return s[:i] + new + s[j:]

# ── CSS ────────────────────────────────────────────────────────────────────────────────
src = swap(src, 'animation:kpEmber 2.6s cubic-bezier(.45,0,.3,1) forwards}',
           'animation:kpEmber 1.7s cubic-bezier(.45,0,.3,1) forwards}', 1, 'ember speed')
CSS = '''  @media (prefers-reduced-motion:reduce){.kp-open .kp-cue{animation:none}}
  /* KW:OPENERS-V3 (18 Oct 2026): the quote gets its attribution; the sub becomes line · KNOWHERE eyebrow · line; the top
     eyebrow is gone; "Cooked." stays cooking (no ash), and a dot-wave field moves along the bottom of the banner. */
  .kp-cooked::after{content:none}
  .kp-open .kp-cue{color:#B5B4AF;text-shadow:0 0 12px #070708,0 0 4px #070708,0 0 2px #070708}
  .kp-open .kp-q{margin:0;display:flex;flex-direction:column;align-items:center}
  .kp-open .kp-q h1{margin-top:0}
  .kp-open .kp-cite{margin:18px 0 0;font-size:14px;font-weight:500;letter-spacing:.01em;color:#8C8B87}
  .kp-open .kp-open-sub{max-width:none;margin-top:30px}
  .kp-open .kp-brandeye{margin:34px 0 0;font-size:10.5px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:#7BEA5A}
  .kp-open .kp-open-line{margin:10px 0 0;font-size:20px;line-height:1.45;font-weight:500;letter-spacing:-0.01em;color:#EDECE8;max-width:40ch;text-wrap:balance}
  .kp-open .kp-waves{position:absolute;left:0;right:0;bottom:0;width:100%;height:40%;pointer-events:none;z-index:0;
    -webkit-mask-image:linear-gradient(to top,#000 35%,transparent 100%);mask-image:linear-gradient(to top,#000 35%,transparent 100%)}
  @media (min-width:760px){.kp-open .kp-open-sub{white-space:nowrap}}
  @media (max-width:740px){
    .kp-open .kp-cite{font-size:13px;margin-top:14px}
    .kp-open .kp-open-sub{margin-top:22px}
    .kp-open .kp-brandeye{margin-top:26px;font-size:10px}
    .kp-open .kp-open-line{font-size:17px}
    .kp-open .kp-waves{height:34%}
  }
'''
src = swap(src, '  @media (prefers-reduced-motion:reduce){.kp-open .kp-cue{animation:none}}\n', CSS, 1, 'css')

# ── markup ─────────────────────────────────────────────────────────────────────────────
src = swap(src, '    <canvas class="kp-fx" id="kwCookFx" aria-hidden="true"></canvas>',
           '    <canvas class="kp-waves" id="kwWaves" aria-hidden="true"></canvas><!-- KW:OPENERS-V3 -->\n'
           '    <canvas class="kp-fx" id="kwCookFx" aria-hidden="true"></canvas>', 1, 'waves canvas')
BANNER = '''      <figure class="kp-q">
        <h1><span class="ln">&#8220;I memorised it.</span><span class="ln">Then the exam reworded the question.</span><span class="ln"><span class="kp-cooked" id="kwCooked" data-word="Cooked.">Cooked.</span>&#8221;</span></h1>
        <figcaption class="kp-cite">&#8212; every Year 12 student, post exam</figcaption>
      </figure>
      <p class="kp-open-sub">Not if you know how it works. Then the exam can reword it all it likes.</p>
      <p class="kp-brandeye">knowhere</p>
      <p class="kp-open-line">Year 11 and 12 as living concepts you play with until it lands.</p>
'''
src = cut(src, '      <p class="kp-eye">HSC &amp; VCE · Year 11 and 12</p>', '    </div>\n    <a class="kp-cue"', BANNER, 'banner copy')

# ── script ─────────────────────────────────────────────────────────────────────────────
src = swap(src, '    this.startCook();    /* KW:OPENERS-V2 */',
           '    this.startCook();    /* KW:OPENERS-V2 */\n    this.startWaves();   /* KW:OPENERS-V3 */', 1, 'mount hook')

JS = r'''  /* KW:OPENERS-V3 (18 Oct 2026): "Cooked." cooks almost at once and stays cooking. Embers rise bottom-up (CSS .burn, 1.7 s),
     then it flickers hot for good (.lit) while smoke wisps and the odd spark lift off it (canvas). The loop pauses while the
     banner is off screen. The text stays in the DOM; under reduced motion none of this runs and the word stays white. */
  startCook(){
    var w=document.getElementById('kwCooked'), cv=document.getElementById('kwCookFx'), sec=document.getElementById('kwOpen');
    if(!w||!cv||!sec||this.reduce||!cv.getContext) return;
    var ctx=cv.getContext('2d'), dpr=Math.min(window.devicePixelRatio||1,2), W=0, H=0, vis=true, on=false, raf=0;
    var size=function(){ var r=sec.getBoundingClientRect(); W=r.width; H=r.height; cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); ctx.setTransform(dpr,0,0,dpr,0,0); };
    var box=function(){ var a=w.getBoundingClientRect(), s=sec.getBoundingClientRect(); return {x:a.left-s.left,y:a.top-s.top,w:a.width,h:a.height}; };
    var smoke=[], sparks=[];
    var frame=function(){
      raf=requestAnimationFrame(frame); if(!vis) return;
      ctx.clearRect(0,0,W,H);
      var b=box();
      if(on&&Math.random()<0.5){
        smoke.push({x:b.x+b.w*(0.06+Math.random()*0.88),y:b.y+b.h*(0.2+Math.random()*0.2),vx:(Math.random()-0.5)*0.25,
          vy:-(0.35+Math.random()*0.5),r:0.6+Math.random()*1.1,life:0,max:110+Math.random()*90,ph:Math.random()*6.28});
      }
      if(on&&Math.random()<0.07){
        sparks.push({x:b.x+b.w*(0.1+Math.random()*0.8),y:b.y+b.h*0.35,vx:(Math.random()-0.5)*0.7,vy:-(0.7+Math.random()*1.1),life:0,max:40+Math.random()*50});
      }
      for(var j=smoke.length-1;j>=0;j--){
        var s=smoke[j]; s.life++; s.x+=s.vx+Math.sin(s.ph+s.life/24)*0.22; s.y+=s.vy; s.r+=0.018;
        var k=s.life/s.max; if(k>=1){ smoke.splice(j,1); continue; }
        var a=k<0.15?(k/0.15)*0.42:0.42*(1-(k-0.15)/0.85);
        var g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*1.7);
        g.addColorStop(0,'rgba(205,200,192,'+a.toFixed(3)+')'); g.addColorStop(1,'rgba(205,200,192,0)');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(s.x,s.y,s.r*1.7,0,6.283); ctx.fill();
      }
      for(var q=sparks.length-1;q>=0;q--){
        var p=sparks[q]; p.life++; p.vy*=0.985; p.x+=p.vx+Math.sin(p.life/6)*0.3; p.y+=p.vy;
        var kk=p.life/p.max; if(kk>=1){ sparks.splice(q,1); continue; }
        var aa=(1-kk)*(0.6+Math.random()*0.4);
        ctx.fillStyle='rgba(255,'+(120+Math.floor(Math.random()*70))+',40,'+aa.toFixed(3)+')';
        ctx.fillRect(p.x,p.y,1.6,1.6);
      }
    };
    var go=function(){
      size(); raf=requestAnimationFrame(frame);
      w.classList.add('burn');
      setTimeout(function(){ on=true; },350);
      setTimeout(function(){ w.classList.add('lit'); },1750);
    };
    var started=false, start=function(){ if(started) return; started=true; setTimeout(go,200); };
    if(document.fonts&&document.fonts.ready) document.fonts.ready.then(start); else start();
    setTimeout(start,900);   /* never wait on slow fonts for long */
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){ es.forEach(function(e){ vis=e.isIntersecting; }); },{threshold:0});
      io.observe(sec); this._cookIO=io;
    }
    window.addEventListener('resize',size); this._cookResize=size;
    this._cookStop=function(){ cancelAnimationFrame(raf); };
  }

  /* KW:OPENERS-V3 (18 Oct 2026): the banner's background action. A field of dots in perspective rows along the bottom of the
     screen, lifted by two slow crossing waves; nearer rows are bigger, brighter and move more, crests glow a little. Brat
     green, faded out upward by a CSS mask. ~30 fps, paused off screen, one still frame under reduced motion. */
  startWaves(){
    var cv=document.getElementById('kwWaves'), sec=document.getElementById('kwOpen');
    if(!cv||!sec||!cv.getContext) return;
    var ctx=cv.getContext('2d'), dpr=Math.min(window.devicePixelRatio||1,2), W=0, H=0, vis=true, raf=0, last=0, t0=performance.now(), reduce=this.reduce;
    var size=function(){ var r=cv.getBoundingClientRect(); W=r.width; H=r.height; cv.width=Math.max(1,Math.round(W*dpr)); cv.height=Math.max(1,Math.round(H*dpr)); ctx.setTransform(dpr,0,0,dpr,0,0); };
    var draw=function(t){
      ctx.clearRect(0,0,W,H);
      var rows=W<700?13:16, gap=W<700?15:19;
      for(var r=0;r<rows;r++){
        var d=r/(rows-1), y0=H*(0.16+0.80*Math.pow(d,1.45)), sp=gap*(0.55+0.75*d), amp=3+15*d;
        var n=Math.ceil(W/sp)+3, off=((r%2)*0.5*sp)-sp;
        for(var c=0;c<n;c++){
          var x=off+c*sp;
          var w1=Math.sin(x*0.0105+t*0.62+r*0.42), w2=Math.sin(x*0.0235-t*0.41+r*1.1);
          var y=y0+w1*amp+w2*amp*0.45;
          var crest=(w1+1)/2;
          var a=(0.05+0.36*d)*(0.45+0.75*crest);
          var rad=0.45+1.25*d;
          ctx.fillStyle=crest>0.86&&d>0.4?'rgba(205,250,190,'+(a*1.1).toFixed(3)+')':'rgba(123,234,90,'+a.toFixed(3)+')';
          ctx.beginPath(); ctx.arc(x,y,rad,0,6.283); ctx.fill();
        }
      }
    };
    var loop=function(now){
      raf=requestAnimationFrame(loop);
      if(!vis||now-last<33) return; last=now;
      draw((now-t0)/1000);
    };
    size();
    if(reduce){ draw(0); window.addEventListener('resize',function(){ size(); draw(0); }); return; }
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){ es.forEach(function(e){ vis=e.isIntersecting; }); },{threshold:0});
      io.observe(sec); this._wavesIO=io;
    }
    window.addEventListener('resize',size); this._wavesResize=size;
    raf=requestAnimationFrame(loop);
    this._wavesStop=function(){ cancelAnimationFrame(raf); };
  }

'''
src = cut(src, '  /* KW:OPENERS-V2 (18 Oct 2026): "Cooked." cooks, once, after the reader has had a beat with the line.',
          '  /* ─── IYKYK video text mask', JS, 'startCook')

if DRY:
    print('dry run OK — all anchors matched; nothing written'); sys.exit(0)
stamp = time.strftime('%Y%m%d-%H%M%S')
bak = os.path.join(ROOT, '_patches', 'landing-v2', 'bak-v3-' + stamp)
os.makedirs(bak, exist_ok=True)
shutil.copy2(IDX, os.path.join(bak, 'index.html'))
open(IDX, 'w', encoding='utf-8').write(src)
back = open(IDX, encoding='utf-8').read()
for needle in ['KW:OPENERS-V3', 'id="kwWaves"', 'startWaves(){', 'class="kp-cite"', 'class="kp-brandeye"', 'kpEmber 1.7s']:
    assert needle in back, 'receipt missing: ' + needle
for gone in ['HSC &amp; VCE · Year 11 and 12</p>', "w.classList.add('ash')", 'dust=sample()']:
    assert gone not in back, 'still present: ' + gone
print('applied ✓  backup:', os.path.relpath(bak, ROOT))
