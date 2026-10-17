#!/usr/bin/env python3
"""KW:OPENERS-V4 (18 Oct 2026) — the banner background becomes rising embers (Cat, Sun 18 Oct 10:22).

Replaces the V3 dot-wave field with sparse embers drifting up from the bottom of the screen: hot yellow at birth,
cooling through orange to deep red as they rise and fade, swaying, flickering, a few soft out-of-focus ones for depth,
and a faint warm glow along the bottom edge. Same canvas (#kwWaves), now taller with a softer upward fade. ~60 fps,
paused off screen, one still frame under reduced motion.

Runs on top of KW:OPENERS-V3. Idempotent on the KW:OPENERS-V4 marker. Backs up to _patches/landing-v2/bak-v4-<stamp>/.
Run from the website repo root:  python3 _patches/landing-v2/apply-home-v4.py [--dry]
"""
import os, sys, shutil, time

DRY = '--dry' in sys.argv
ROOT = os.getcwd()
IDX = os.path.join(ROOT, 'index.html')
src = open(IDX, encoding='utf-8').read()
if 'KW:OPENERS-V4' in src:
    print('already applied (KW:OPENERS-V4 marker present) — nothing to do'); sys.exit(0)
assert 'KW:OPENERS-V3' in src, 'V3 is not applied — run apply-home-v3.py first'

def swap(s, old, new, n=1, label=''):
    c = s.count(old)
    assert c == n, f'{label}: expected {n} match(es), found {c}'
    return s.replace(old, new)

def cut(s, start, end, new, label=''):
    assert s.count(start) == 1, f'{label}: start anchor count {s.count(start)}'
    i = s.index(start); j = s.index(end, i)
    return s[:i] + new + s[j:]

# ── CSS: taller canvas, softer fade, a warm glow along the bottom edge ────────────────────
src = swap(src, '''  .kp-open .kp-waves{position:absolute;left:0;right:0;bottom:0;width:100%;height:40%;pointer-events:none;z-index:0;
    -webkit-mask-image:linear-gradient(to top,#000 35%,transparent 100%);mask-image:linear-gradient(to top,#000 35%,transparent 100%)}''',
'''  /* KW:OPENERS-V4 (18 Oct 2026): rising embers. Taller canvas, softer fade, a faint warm glow along the bottom edge. */
  .kp-open .kp-waves{position:absolute;left:0;right:0;bottom:0;width:100%;height:78%;pointer-events:none;z-index:0;
    -webkit-mask-image:linear-gradient(to top,#000 30%,transparent 100%);mask-image:linear-gradient(to top,#000 30%,transparent 100%)}
  .kp-open::before{content:"";position:absolute;left:0;right:0;bottom:0;height:34%;pointer-events:none;z-index:0;
    background:radial-gradient(70% 100% at 50% 100%,rgba(255,90,20,.10),rgba(255,90,20,.03) 45%,transparent 75%)}''', 1, 'css canvas')
src = swap(src, '    .kp-open .kp-waves{height:34%}\n', '    .kp-open .kp-waves{height:72%}\n', 1, 'css mobile')

# ── script: startWaves draws embers now ──────────────────────────────────────────────────
JS = r'''  /* KW:OPENERS-V4 (18 Oct 2026): the banner's background action, rising embers (replaces the V3 dot waves). Sparse
     sparks drift up from below the screen, swaying; each is born hot (pale yellow), cools through orange to deep red as it
     rises, flickers and fades. A few big soft ones sit out of focus for depth. Additive blend, ~60 fps, paused off screen,
     one still frame under reduced motion. */
  startWaves(){
    var cv=document.getElementById('kwWaves'), sec=document.getElementById('kwOpen');
    if(!cv||!sec||!cv.getContext) return;
    var ctx=cv.getContext('2d'), dpr=Math.min(window.devicePixelRatio||1,2), W=0, H=0, vis=true, raf=0, last=0, reduce=this.reduce;
    var em=[];
    var size=function(){ var r=cv.getBoundingClientRect(); W=r.width; H=r.height; cv.width=Math.max(1,Math.round(W*dpr)); cv.height=Math.max(1,Math.round(H*dpr)); ctx.setTransform(dpr,0,0,dpr,0,0); };
    var cap=function(){ return Math.round(Math.max(18,Math.min(70,W/22))); };
    var spawn=function(anywhere){
      var soft=Math.random()<0.12;
      em.push({x:Math.random()*W, y:anywhere?Math.random()*H:H+6+Math.random()*20,
        vx:(Math.random()-0.5)*0.18, vy:-(soft?0.18+Math.random()*0.25:0.35+Math.random()*0.75),
        r:soft?4+Math.random()*5:0.7+Math.random()*1.5, soft:soft,
        life:anywhere?Math.random()*0.6:0, rate:0.0011+Math.random()*0.0016,
        sw:0.4+Math.random()*1.1, ph:Math.random()*6.28, fl:Math.random()*6.28});
    };
    var colour=function(k){   /* k: 0 = just born, 1 = burnt out */
      if(k<0.25){ var u=k/0.25; return [255,Math.round(226-70*u),Math.round(150-90*u)]; }
      if(k<0.6){ var v=(k-0.25)/0.35; return [255,Math.round(156-66*v),Math.round(60-40*v)]; }
      var q=(k-0.6)/0.4; return [Math.round(255-60*q),Math.round(90-55*q),20];
    };
    var draw=function(dt){
      ctx.clearRect(0,0,W,H);
      ctx.globalCompositeOperation='lighter';
      while(em.length<cap()) spawn(false);
      for(var i=em.length-1;i>=0;i--){
        var e=em[i];
        e.life+=e.rate*dt; e.ph+=0.02*dt; e.fl+=0.25*dt;
        e.x+=(e.vx+Math.sin(e.ph)*0.12*e.sw)*dt; e.y+=e.vy*dt;
        if(e.life>=1||e.y<-20){ em.splice(i,1); continue; }
        var c=colour(e.life), fade=e.life<0.08?e.life/0.08:1-Math.pow((e.life-0.08)/0.92,1.6);
        var a=Math.max(0,fade)*(0.75+0.25*Math.sin(e.fl));
        if(e.soft){
          var g=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,e.r);
          g.addColorStop(0,'rgba('+c[0]+','+c[1]+','+c[2]+','+(a*0.16).toFixed(3)+')'); g.addColorStop(1,'rgba('+c[0]+','+c[1]+','+c[2]+',0)');
          ctx.fillStyle=g; ctx.beginPath(); ctx.arc(e.x,e.y,e.r,0,6.283); ctx.fill();
        } else {
          ctx.fillStyle='rgba('+c[0]+','+c[1]+','+c[2]+','+(a*0.22).toFixed(3)+')';
          ctx.beginPath(); ctx.arc(e.x,e.y,e.r*3.2,0,6.283); ctx.fill();
          ctx.fillStyle='rgba('+c[0]+','+c[1]+','+c[2]+','+(a*0.95).toFixed(3)+')';
          ctx.beginPath(); ctx.arc(e.x,e.y,e.r,0,6.283); ctx.fill();
        }
      }
      ctx.globalCompositeOperation='source-over';
    };
    var loop=function(now){
      raf=requestAnimationFrame(loop);
      if(!vis){ last=now; return; }
      var dt=last?Math.min(3,(now-last)/16.7):1; last=now;
      draw(dt);
    };
    size();
    for(var s0=0;s0<cap();s0++) spawn(true);   /* the first frame already has embers in the air */
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
src = cut(src, "  /* KW:OPENERS-V3 (18 Oct 2026): the banner's background action.", '  /* ─── IYKYK video text mask', JS, 'startWaves')

if DRY:
    print('dry run OK — all anchors matched; nothing written'); sys.exit(0)
stamp = time.strftime('%Y%m%d-%H%M%S')
bak = os.path.join(ROOT, '_patches', 'landing-v2', 'bak-v4-' + stamp)
os.makedirs(bak, exist_ok=True)
shutil.copy2(IDX, os.path.join(bak, 'index.html'))
open(IDX, 'w', encoding='utf-8').write(src)
back = open(IDX, encoding='utf-8').read()
for needle in ['KW:OPENERS-V4', 'rising embers', "globalCompositeOperation='lighter'", '.kp-open::before']:
    assert needle in back, 'receipt missing: ' + needle
assert 'rgba(123,234,90,' + "'+a.toFixed(3)" not in back, 'dot waves still drawn'
print('applied ✓  backup:', os.path.relpath(bak, ROOT))
