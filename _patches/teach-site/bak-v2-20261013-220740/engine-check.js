/* ══ knowhere · for-teachers page engine ══════════════════════════════════
   Exposes window.KWTeachers(root). Idempotent per root. Returns a stop fn. */
(function(){
  var TAU = Math.PI * 2;
  var WARM = [237,236,230], BRAT = [123,234,90], PURP = [155,90,234], BLUE = [35,164,221];

  function hash(x){ var v = Math.sin(x * 78.233) * 43758.5453; v = v % 1; return v < 0 ? v + 1 : v; }

  /* ── formations ───────────────────────────────────────────────────────
     Each returns [x, y, colour, alpha, glow, ease]. i = particle index,
     t = seconds, R = the scene element's viewport rect, s1/s2 = stable seeds. */

  /* a settled lattice — "every concept, mapped" */
  function fLattice(i,t,R,s1,s2){
    var cols=18, rows=13, cells=cols*rows, k=i%cells;
    var w=R.width*0.66, h=R.height*0.44;
    var cx=R.left+R.width*0.5, cy=R.top+R.height*0.5;
    var col=k%cols, row=(k/cols)|0;
    var breathe=1+Math.sin(t*0.5+row*0.28)*0.018;
    var x=cx+((col/(cols-1))-0.5)*w*breathe;
    var y=cy+((row/(rows-1))-0.5)*h*breathe;
    var lit=hash(k*3.7)>0.86;
    var pulse=lit?(0.5+0.5*Math.sin(t*1.5+k)):0;
    return [x+(s1-0.5)*3, y+(s2-0.5)*3, lit?BRAT:WARM, lit?0.30+pulse*0.45:0.16, lit?pulse*0.5:0, 0.055];
  }

  /* sixteen clumps — "16 subjects" */
  function fClusters(i,t,R,s1,s2){
    var G=16, g=i%G;
    var cols=4, col=g%cols, row=(g/cols)|0;
    var w=R.width*0.60, h=R.height*0.40;
    var cx=R.left+R.width*0.5+((col/(cols-1))-0.5)*w;
    var cy=R.top+R.height*0.5+((row/3)-0.5)*h;
    var drift=Math.sin(t*0.6+g*1.7)*4;
    var a=s1*TAU+t*(0.14+hash(g)*0.1)*(g%2?1:-1);
    var rad=(6+s2*17)*(1+Math.sin(t*0.9+g)*0.08);
    var accent=g%5===0;
    return [cx+Math.cos(a)*rad*1.25+drift, cy+Math.sin(a)*rad+drift*0.4,
            accent?BRAT:WARM, accent?0.34:0.20, accent?0.22:0, 0.06];
  }

  /* one source, many rays — "share link" */
  function fBroadcast(i,t,R,s1,s2){
    var rays=11, ray=i%rays;
    var ox=R.left+R.width*0.24, oy=R.top+R.height*0.5;
    var spread=(ray/(rays-1)-0.5)*1.15;
    var p=(s1+t*0.20+ray*0.03)%1;
    var reach=R.width*0.60;
    var x=ox+Math.cos(spread)*p*reach;
    var y=oy+Math.sin(spread)*p*reach*0.95;
    var fade=Math.sin(p*Math.PI);
    var head=p<0.06;
    return [x, y, head?BRAT:WARM, (head?0.85:0.30)*fade+0.03, head?0.7:0.10, head?0.4:0.10];
  }

  /* converge into a plus — "add a concept" */
  function fPlus(i,t,R,s1,s2){
    var cx=R.left+R.width*0.5, cy=R.top+R.height*0.5;
    var arm=Math.min(R.width*0.20, R.height*0.20), th=arm*0.24;
    var pulse=1+Math.sin(t*0.9)*0.045;
    var u=(s1-0.5)*2*arm*pulse, v=(s2-0.5)*2*th;
    var horiz=i%2===0;
    var x=cx+(horiz?u:v), y=cy+(horiz?v:u);
    var edge=Math.abs(horiz?u:v)/(arm*pulse);
    return [x, y, edge>0.72?BRAT:WARM, 0.16+(1-edge)*0.34, (1-edge)*0.35, 0.05];
  }

  var BOX = [fBroadcast, fPlus, fLattice];   /* KW:TEACH-SITE-V2: sharing · your own knowscapes · homeplay */

  /* ── the shared flow field ─────────────────────────────────────────── */
  /* how present a section is: 0 well before it arrives and well after it goes,
     1 while its sticky viewport is pinned. drives both fade and disintegration. */
  function presence(r, vh){
    var lead = vh * 0.55;
    var enter = (vh - r.top) / lead;
    var exit  = r.bottom / lead;
    var p = Math.min(enter, exit);
    if(p < 0) p = 0; if(p > 1) p = 1;
    return p * p * (3 - 2 * p);
  }

  function FlowField(root, scenes, N, reduce){
    var cv=document.createElement('canvas');
    cv.className='flow'; cv.setAttribute('aria-hidden','true');
    root.insertBefore(cv, root.firstChild);
    var ctx=cv.getContext('2d'), dpr=Math.min(window.devicePixelRatio||1, 1.5);
    var W=0,H=0, px=new Float32Array(N), py=new Float32Array(N),
        s1=new Float32Array(N), s2=new Float32Array(N);
    for(var i=0;i<N;i++){ s1[i]=Math.random(); s2[i]=hash(i+11); }
    function size(){
      W=window.innerWidth; H=window.innerHeight;
      cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr);
      for(var i=0;i<N;i++){ px[i]=W*0.5+(Math.random()-0.5)*W*1.2; py[i]=H*0.5+(Math.random()-0.5)*H*1.6; }
    }
    size(); window.addEventListener('resize', size);
    var t0=performance.now(), last=0, raf=0, dead=false;
    function frame(now){
      if(dead) return;
      raf=requestAnimationFrame(frame);
      if(now-last<33) return; last=now;
      var t=(now-t0)/1000;
      var best=-1, bp=0, rects=[];
      for(var s=0;s<scenes.length;s++){
        var sc0=scenes[s];
        var r=sc0.el.getBoundingClientRect(); rects.push(r);
        var pr=presence((sc0.host||sc0.el).getBoundingClientRect(), H);
        if(pr>bp){ bp=pr; best=s; }
      }
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
      if(best<0) return;
      var sc=scenes[best], R=rects[best], pres=bp;
      if(pres<=0.002) return;
      var f=sc.pick();
      ctx.globalCompositeOperation='lighter';
      for(var j=0;j<N;j++){
        var o=f(j,t,R,s1[j],s2[j]);
        var gx=o[0], gy=o[1];
        if(pres<0.998){
          /* off to a loose scatter — so the next section assembles from nothing */
          var d0=1-pres;
          gx += ((W*0.5+(s1[j]-0.5)*W*2.2) - gx) * d0;
          gy += ((H*0.5+(s2[j]-0.5)*H*2.6) - gy) * d0;
        }
        /* ease is doubled from the know-us feel: Cat wanted the shape to land sooner */
        var ez=Math.min(0.34, (o[5]||0.07)*2.2);
        if(!reduce){ px[j]+=(gx-px[j])*ez; py[j]+=(gy-py[j])*ez; }
        else { px[j]=gx; py[j]=gy; }
        var al=o[3]*pres; if(al<=0.004) continue;
        var c=o[2], g=o[4]||0, cr=c[0], cg=c[1], cb=c[2];
        if(g>0.03){ cr+=(255-cr)*g*0.5|0; cg+=(255-cg)*g*0.5|0; cb+=(255-cb)*g*0.5|0; }
        var tw=0.55+0.45*Math.sin(t*1.4+s1[j]*TAU);
        al=al*(0.6+0.4*tw)*(1+0.9*g); if(al>0.95) al=0.95;
        ctx.fillStyle='rgba('+(cr|0)+','+(cg|0)+','+(cb|0)+','+al.toFixed(3)+')';
        var sz=(o[3]>0.5?2.3:1.7)*(1+0.8*g);
        ctx.fillRect(px[j]-sz/2, py[j]-sz/2, sz, sz);
      }
      ctx.globalCompositeOperation='source-over';
    }
    raf=requestAnimationFrame(frame);
    return function(){ dead=true; cancelAnimationFrame(raf); window.removeEventListener('resize', size); if(cv.parentNode) cv.parentNode.removeChild(cv); };
  }

  /* ── card-stack scroll driver ──────────────────────────────────────── */
  function Stack(root, stackId, reduce){
    var stack=root.querySelector('#'+stackId);
    if(!stack) return null;
    var cards=[].slice.call(stack.querySelectorAll('.scard'));
    var dots=[].slice.call(stack.querySelectorAll('.stack-dots span'));
    var k=0;
    function seg(){
      if(reduce) return cards.length-1;
      var r=stack.getBoundingClientRect(), vh=window.innerHeight;
      var p=Math.max(0, Math.min(1, (-r.top)/(r.height-vh)));
      return Math.min(cards.length-0.001, p*cards.length);
    }
    var curK=-1;
    function set(){
      var n=Math.floor(seg());
      if(n===curK) return; curK=n; k=n;
      cards.forEach(function(c,i){
        c.classList.remove('on','under','under2','under3');
        if(i===n) c.classList.add('on');
        else if(i===n-1) c.classList.add('under');
        else if(i===n-2) c.classList.add('under2');
        else if(i===n-3) c.classList.add('under3');
      });
      dots.forEach(function(d,i){ d.classList.toggle('on', i===n); });
    }
    window.addEventListener('scroll', set, {passive:true});
    set();
    return { index:function(){ return k; }, stop:function(){ window.removeEventListener('scroll', set); } };
  }

  /* ── canvas helper: sizes to element box, pauses when off-screen ───── */
  function Loop(canvas, draw){
    if(!canvas) return function(){};
    var ctx=canvas.getContext('2d'), dpr=Math.min(window.devicePixelRatio||1, 2);
    var W=0, H=0, raf=0, dead=false, visible=true, t0=performance.now();
    function size(){
      var r=canvas.getBoundingClientRect();
      W=r.width; H=r.height;
      if(!W||!H) return;
      canvas.width=Math.round(W*dpr); canvas.height=Math.round(H*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    size();
    window.addEventListener('resize', size);
    var io=null;
    if(window.IntersectionObserver){
      io=new IntersectionObserver(function(es){ es.forEach(function(e){ visible=e.isIntersecting; }); }, {threshold:0.01});
      io.observe(canvas);
    }
    function frame(now){
      if(dead) return;
      raf=requestAnimationFrame(frame);
      if(!visible) return;
      if(!W||!H){ size(); return; }
      ctx.setTransform(dpr,0,0,dpr,0,0);
      draw(ctx, W, H, (now-t0)/1000);
    }
    raf=requestAnimationFrame(frame);
    return function(){ dead=true; cancelAnimationFrame(raf); window.removeEventListener('resize', size); if(io) io.disconnect(); };
  }

  /* ── demo 1: photons, one at a time, building the fringes ──────────── */
  function PhotonDemo(root, reduce){
    var cv=root.querySelector('#tchPhoton');
    var out=root.querySelector('#tchPhotonCount');
    if(!cv) return function(){};
    var BINS=140, hits=new Float32Array(BINS), total=0, peak=1;
    var live=[], lastEmit=0;

    /* P(y) for a two-slit far-field pattern, normalised to 1 */
    function prob(u){
      var x=(u-0.5)*13.2;
      var env=Math.abs(x)<1e-6 ? 1 : Math.sin(x*0.34)/(x*0.34);
      var fringe=Math.cos(x*1.55);
      return env*env*fringe*fringe;
    }
    /* rejection-sample a landing spot from that distribution */
    function sample(){
      for(var n=0;n<40;n++){
        var u=Math.random(), p=prob(u);
        if(Math.random()<p) return u;
      }
      return Math.random();
    }

    return Loop(cv, function(ctx,W,H,t){
      ctx.clearRect(0,0,W,H);
      var srcX=W*0.07, barX=W*0.34, scrX=W*0.90, midY=H*0.5;
      var slitGap=H*0.17, slitH=H*0.055;

      /* barrier */
      ctx.fillStyle='rgba(237,236,232,0.14)';
      ctx.fillRect(barX-1.5, 0, 3, midY-slitGap/2-slitH/2);
      ctx.fillRect(barX-1.5, midY-slitGap/2+slitH/2, 3, slitGap-slitH);
      ctx.fillRect(barX-1.5, midY+slitGap/2+slitH/2, 3, H-(midY+slitGap/2+slitH/2));

      /* source */
      var sp=0.5+0.5*Math.sin(t*3);
      ctx.fillStyle='rgba(123,234,90,'+(0.35+sp*0.4).toFixed(3)+')';
      ctx.beginPath(); ctx.arc(srcX, midY, 3.4, 0, TAU); ctx.fill();

      /* emit */
      if(!reduce && t-lastEmit > 0.055 && live.length < 26){
        lastEmit=t;
        live.push({ p:0, slit:Math.random()<0.5?-1:1, land:sample(), born:t });
      }

      /* photons in flight */
      for(var i=live.length-1;i>=0;i--){
        var ph=live[i];
        ph.p += 0.020;
        if(ph.p>=1){
          var bin=Math.max(0, Math.min(BINS-1, Math.floor(ph.land*BINS)));
          hits[bin]+=1; total++; if(hits[bin]>peak) peak=hits[bin];
          live.splice(i,1); continue;
        }
        var x, y;
        var slitY=midY+ph.slit*slitGap/2;
        var landY=H*0.10+ph.land*H*0.80;
        if(ph.p<0.5){ var a=ph.p/0.5; x=srcX+(barX-srcX)*a; y=midY+(slitY-midY)*a; }
        else { var b=(ph.p-0.5)/0.5; x=barX+(scrX-barX)*b; y=slitY+(landY-slitY)*b; }
        ctx.fillStyle='rgba(123,234,90,'+(0.9-ph.p*0.25).toFixed(3)+')';
        ctx.beginPath(); ctx.arc(x, y, 2.1, 0, TAU); ctx.fill();
        ctx.fillStyle='rgba(123,234,90,0.14)';
        ctx.beginPath(); ctx.arc(x, y, 5.2, 0, TAU); ctx.fill();
      }

      /* the accumulating pattern */
      var top=H*0.10, band=H*0.80, bh=band/BINS;
      for(var k=0;k<BINS;k++){
        if(hits[k]<=0) continue;
        var a2=Math.min(0.92, hits[k]/peak*0.9+0.08);
        ctx.fillStyle='rgba(123,234,90,'+a2.toFixed(3)+')';
        ctx.fillRect(scrX, top+k*bh, Math.max(4, W*0.055*Math.min(1, hits[k]/peak)), Math.max(1, bh));
      }
      ctx.fillStyle='rgba(237,236,232,0.10)';
      ctx.fillRect(scrX-1, top, 1, band);

      if(out && total%3===0) out.textContent = total.toLocaleString() + ' photon' + (total===1?'':'s');
    });
  }

  /* ── demo 2: enzymes vs temperature ────────────────────────────────
     Chosen because it is the misconception, not just the fact: students read
     "hotter = faster" off a static curve and never see that denaturation is
     permanent. Here they can run it hot, come back down, and watch the rate
     fail to recover — which no diagram or applet on the study-design list does. */
  function EnzymeDemo(root){
    var cv=root.querySelector('#tchField');
    if(!cv) return function(){};
    var OPT=40, TMIN=0, TMAX=80, temp=22, drag=false;
    var enzymes=[], subs=[], flashes=[], buckets=new Float32Array(TMAX+1);
    var events=[], rate=0, peak=0.001;

    var HIT=280, CW=430, CH=390;
    /* fresh substrate diffuses in from clear space — if it can spawn already
       touching an enzyme, the conversion rate stops depending on temperature */
    function clearSpot(){
      for(var a=0;a<30;a++){
        var rx=Math.random(), ry=Math.random(), ok=true;
        for(var b=0;b<enzymes.length;b++){
          var dx=(rx-enzymes[b].rx)*CW, dy=(ry-enzymes[b].ry)*CH;
          if(dx*dx+dy*dy < HIT*4){ ok=false; break; }
        }
        if(ok) return { rx:rx, ry:ry };
      }
      return { rx:Math.random(), ry:Math.random() };
    }
    function reset(){
      enzymes=[]; subs=[]; flashes=[]; events=[];
      buckets=new Float32Array(TMAX+1); rate=0; peak=0.001; temp=22;
      for(var i=0;i<7;i++) enzymes.push({ rx:0.12+Math.random()*0.74, ry:0.14+Math.random()*0.68,
        vx:(Math.random()-0.5), vy:(Math.random()-0.5), ang:Math.random()*TAU, spin:(Math.random()-0.5)*0.5, dead:0 });
      for(var j=0;j<30;j++){
        var c=clearSpot();
        subs.push({ rx:c.rx, ry:c.ry, vx:(Math.random()-0.5), vy:(Math.random()-0.5), ang:Math.random()*TAU });
      }
    }
    reset();
    var rbtn=root.querySelector('#tchReset');
    if(rbtn) rbtn.addEventListener('click', reset);

    function pos(ev){
      var r=cv.getBoundingClientRect(), pt=(ev.touches&&ev.touches[0])||ev;
      return { x:(pt.clientX-r.left)/r.width, y:(pt.clientY-r.top)/r.height };
    }
    function setT(p){ temp=Math.max(TMIN, Math.min(TMAX, TMIN+(p.x-0.04)/0.92*(TMAX-TMIN))); }
    function down(ev){ var p=pos(ev); if(p.y>0.78){ drag=true; setT(p); ev.preventDefault(); } }
    function move(ev){ if(drag){ setT(pos(ev)); ev.preventDefault(); } }
    function up(){ drag=false; }
    cv.addEventListener('mousedown', down);
    cv.addEventListener('touchstart', down, {passive:false});
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, {passive:false});
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);

    var prev=0;
    var stop=Loop(cv, function(ctx,W,H,t){
      var dt=Math.min(0.05, t-prev||0.016); prev=t;
      ctx.clearRect(0,0,W,H);
      var CX0=W*0.045, CX1=W*0.485, CY0=H*0.10, CY1=H*0.72;
      var PX0=W*0.555, PX1=W*0.955, PY0=H*0.10, PY1=H*0.72;
      var SX0=W*0.045, SX1=W*0.955, SY=H*0.855;
      var speed=(0.10+temp/22);

      /* enzymes denature above the optimum, and never come back */
      for(var e=0;e<enzymes.length;e++){
        var E=enzymes[e];
        if(!E.dead && temp>OPT+4){
          var risk=Math.pow((temp-(OPT+4))/(TMAX-(OPT+4)), 2)*dt*1.7;
          if(Math.random()<risk) E.dead=1;
        }
        var sp=E.dead?0.25:speed;
        E.rx+=E.vx*dt*0.10*sp; E.ry+=E.vy*dt*0.10*sp; E.ang+=E.spin*dt*sp;
        if(E.rx<0.08||E.rx>0.92) E.vx*=-1; if(E.ry<0.10||E.ry>0.90) E.vy*=-1;
        E.rx=Math.max(0.08,Math.min(0.92,E.rx)); E.ry=Math.max(0.10,Math.min(0.90,E.ry));
      }

      var cw=CX1-CX0, ch=CY1-CY0;
      /* substrates bounce around; a hit on a live active site makes product */
      for(var i2=0;i2<subs.length;i2++){
        var S=subs[i2];
        S.rx+=S.vx*dt*0.30*speed; S.ry+=S.vy*dt*0.30*speed; S.ang+=dt*speed;
        if(S.rx<0.02||S.rx>0.98) S.vx*=-1; if(S.ry<0.02||S.ry>0.98) S.vy*=-1;
        S.rx=Math.max(0.02,Math.min(0.98,S.rx)); S.ry=Math.max(0.02,Math.min(0.98,S.ry));
        for(var k2=0;k2<enzymes.length;k2++){
          var Z=enzymes[k2]; if(Z.dead) continue;
          var ddx=(S.rx-Z.rx)*cw, ddy=(S.ry-Z.ry)*ch;
          if(ddx*ddx+ddy*ddy < HIT){
            flashes.push({ rx:S.rx, ry:S.ry, born:t });
            events.push(t);
            var sp2=clearSpot(); S.rx=sp2.rx; S.ry=sp2.ry;
            S.vx=(Math.random()-0.5); S.vy=(Math.random()-0.5);
            break;
          }
        }
      }
      while(events.length && t-events[0]>2.5) events.shift();
      rate += (events.length/2.5 - rate)*0.05;
      var bi=Math.round(temp);
      if(rate>buckets[bi]) buckets[bi]=rate;
      if(rate>peak) peak=rate;

      /* ── chamber ── */
      ctx.strokeStyle='rgba(255,255,255,0.07)'; ctx.lineWidth=1;
      ctx.strokeRect(CX0, CY0, cw, ch);
      ctx.fillStyle='rgba(237,236,232,0.30)';
      ctx.font='600 10px Geist, system-ui, sans-serif';
      ctx.textAlign='left'; ctx.textBaseline='top';
      ctx.fillText('THE CELL', CX0+10, CY0+9);

      for(var f=flashes.length-1;f>=0;f--){
        var age=(t-flashes[f].born)/0.5;
        if(age>=1){ flashes.splice(f,1); continue; }
        ctx.fillStyle='rgba(123,234,90,'+((1-age)*0.5).toFixed(3)+')';
        ctx.beginPath(); ctx.arc(CX0+flashes[f].rx*cw, CY0+flashes[f].ry*ch, 4+age*13, 0, TAU); ctx.fill();
      }

      for(var s2=0;s2<subs.length;s2++){
        var Q=subs[s2], qx=CX0+Q.rx*cw, qy=CY0+Q.ry*ch;
        ctx.save(); ctx.translate(qx,qy); ctx.rotate(Q.ang);
        ctx.fillStyle='rgba(237,236,232,0.52)';
        ctx.fillRect(-3,-3,6,6);
        ctx.restore();
      }

      for(var n=0;n<enzymes.length;n++){
        var N2=enzymes[n], ex=CX0+N2.rx*cw, ey=CY0+N2.ry*ch;
        ctx.save(); ctx.translate(ex,ey); ctx.rotate(N2.ang);
        if(N2.dead){
          /* the shape is wrecked — the active site no longer exists */
          ctx.strokeStyle='rgba(252,184,21,0.45)'; ctx.lineWidth=1.6;
          ctx.beginPath();
          for(var v=0;v<=11;v++){
            var va=v/11*TAU, vr=13+Math.sin(v*2.7)*7;
            var vx2=Math.cos(va)*vr, vy2=Math.sin(va)*vr*0.8;
            v?ctx.lineTo(vx2,vy2):ctx.moveTo(vx2,vy2);
          }
          ctx.closePath(); ctx.stroke();
        } else {
          var gl=ctx.createRadialGradient(0,0,2,0,0,26);
          gl.addColorStop(0,'rgba(123,234,90,0.30)'); gl.addColorStop(1,'rgba(0,0,0,0)');
          ctx.fillStyle=gl; ctx.beginPath(); ctx.arc(0,0,26,0,TAU); ctx.fill();
          ctx.fillStyle='rgba(123,234,90,0.85)';
          ctx.beginPath(); ctx.arc(0,0,15,0.55,TAU-0.55); ctx.closePath(); ctx.fill();
          ctx.fillStyle='#030304';                       /* the active site notch */
          ctx.beginPath(); ctx.arc(13.5,0,5.6,0,TAU); ctx.fill();
        }
        ctx.restore();
      }

      /* ── rate curve ── */
      var pw=PX1-PX0, phh=PY1-PY0;
      ctx.strokeStyle='rgba(255,255,255,0.10)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(PX0,PY0); ctx.lineTo(PX0,PY1); ctx.lineTo(PX1,PY1); ctx.stroke();
      ctx.fillStyle='rgba(237,236,232,0.30)';
      ctx.fillText('RATE OF REACTION', PX0+8, PY0-1);
      ctx.textAlign='center'; ctx.textBaseline='top';
      for(var g2=0;g2<=TMAX;g2+=20){
        var gx=PX0+g2/TMAX*pw;
        ctx.strokeStyle='rgba(255,255,255,0.06)';
        ctx.beginPath(); ctx.moveTo(gx,PY0); ctx.lineTo(gx,PY1); ctx.stroke();
        ctx.fillStyle='rgba(237,236,232,0.28)';
        ctx.fillText(g2+'\u00B0', gx, PY1+7);
      }
      var ox=PX0+OPT/TMAX*pw;
      ctx.strokeStyle='rgba(123,234,90,0.22)'; ctx.setLineDash([3,4]);
      ctx.beginPath(); ctx.moveTo(ox,PY0); ctx.lineTo(ox,PY1); ctx.stroke(); ctx.setLineDash([]);

      ctx.strokeStyle='rgba(123,234,90,0.8)'; ctx.lineWidth=2; ctx.beginPath();
      var started=false;
      for(var b=0;b<=TMAX;b++){
        if(buckets[b]<=0) continue;
        var bx=PX0+b/TMAX*pw, by=PY1-buckets[b]/peak*phh*0.92;
        started?ctx.lineTo(bx,by):ctx.moveTo(bx,by); started=true;
      }
      ctx.stroke();
      var cxp=PX0+temp/TMAX*pw, cyp=PY1-rate/peak*phh*0.92;
      ctx.fillStyle='#7BEA5A'; ctx.beginPath(); ctx.arc(cxp,cyp,4.5,0,TAU); ctx.fill();

      var alive=0; for(var a2=0;a2<enzymes.length;a2++) if(!enzymes[a2].dead) alive++;
      ctx.textAlign='right'; ctx.textBaseline='top';
      ctx.fillStyle= alive<enzymes.length ? 'rgba(252,184,21,0.85)' : 'rgba(237,236,232,0.42)';
      ctx.font='600 11px Geist, system-ui, sans-serif';
      ctx.fillText(alive+' of '+enzymes.length+' enzymes still working', PX1, PY1+22);

      /* ── temperature slider ── */
      ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=3; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(SX0,SY); ctx.lineTo(SX1,SY); ctx.stroke();
      var hx=SX0+(temp-TMIN)/(TMAX-TMIN)*(SX1-SX0);
      var hot=temp>OPT+4;
      ctx.strokeStyle= hot?'rgba(252,184,21,0.85)':'rgba(123,234,90,0.85)';
      ctx.beginPath(); ctx.moveTo(SX0,SY); ctx.lineTo(hx,SY); ctx.stroke();
      ctx.fillStyle= hot?'#FCB815':'#7BEA5A';
      ctx.beginPath(); ctx.arc(hx,SY,9,0,TAU); ctx.fill();
      ctx.fillStyle='#030304'; ctx.font='700 10px Geist, system-ui, sans-serif';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(Math.round(temp), hx, SY+0.5);
      ctx.fillStyle='rgba(237,236,232,0.45)'; ctx.font='600 11px Geist, system-ui, sans-serif';
      ctx.textAlign='left'; ctx.textBaseline='top';
      ctx.fillText('TEMPERATURE \u00B0C', SX0, SY+16);
    });

    return function(){
      stop();
      if(rbtn) rbtn.removeEventListener('click', reset);
      cv.removeEventListener('mousedown', down);
      cv.removeEventListener('touchstart', down);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
    };
  }

  /* ── present / fullscreen ──────────────────────────────────────────── */
  function Fullscreen(root){
    var btn=root.querySelector('#tchFs'), box=root.querySelector('#tchPresent');
    if(!btn||!box) return function(){};
    function label(){
      var on=document.fullscreenElement===box || document.webkitFullscreenElement===box;
      btn.textContent = on ? 'Exit' : 'Present';
    }
    function toggle(){
      var on=document.fullscreenElement===box || document.webkitFullscreenElement===box;
      if(on){ (document.exitFullscreen||document.webkitExitFullscreen||function(){}).call(document); }
      else { (box.requestFullscreen||box.webkitRequestFullscreen||function(){}).call(box); }
    }
    btn.addEventListener('click', toggle);
    document.addEventListener('fullscreenchange', label);
    document.addEventListener('webkitfullscreenchange', label);
    return function(){
      btn.removeEventListener('click', toggle);
      document.removeEventListener('fullscreenchange', label);
      document.removeEventListener('webkitfullscreenchange', label);
    };
  }


  /* ── KW:TEACH-SITE: the live knowscape (crop + fit, lifted from for-parents HERO-V4b) ──
     Same-origin iframe, so the page can reach in: hide everything in the widget except the card that holds its slider
     (plus a mode toggle, if the widget has real controls there), zero the widget's own page padding, drop the card's own
     border. The height is measured off what is left visible — never from the widget's kwH message, which inside a
     fixed-height iframe just echoes the frame back. If any of it fails the poster simply stays. */
  function Proof(root){
    var box=root.querySelector('#tchProofFrame'), pf=root.querySelector('#tchProofWidget');
    var api={ doc:function(){ return null; }, win:function(){ return null; }, kick:function(){}, fit:function(){}, stop:function(){} };
    if(!box||!pf) return api;
    var cropped=false, cropEl=null, dead=false;
    function kick(){ /* KW:TEACH-SITE-V2: the burette starts empty on purpose — the mission is to drag it */ }
    function crop(){
      if(cropped) return true;
      try{
        var d=pf.contentDocument; if(!d||!d.body) return false;
        var r=d.querySelector('input[type=range]'); if(!r) return false;
        var el=r; while(el.parentElement&&el.parentElement!==d.body&&el.parentElement.parentElement!==d.body) el=el.parentElement;
        var cont=el.parentElement;
        /* keep a mode toggle only when its buttons are controls ([data-mode]); text tabs (knowdrop) are hidden */
        var tog=cont.querySelector('.toggle-card'), keep=[el]; if(tog&&tog.querySelector('[data-mode]')) keep.push(tog); else tog=null;
        Array.prototype.forEach.call(cont.children,function(c){ if(keep.indexOf(c)<0&&c.tagName!=='STYLE'&&c.tagName!=='SCRIPT') c.style.setProperty('display','none','important'); });
        try{ var kd=cont.querySelector('#knowdrop'); if(kd) kd.style.setProperty('display','none','important'); if(tog){ tog.style.setProperty('margin','10px 0 0','important'); tog.style.setProperty('padding','0','important'); tog.style.setProperty('background','none','important'); tog.style.setProperty('border','0','important'); } }catch(e){}
        ['padding','margin'].forEach(function(k){ d.body.style.setProperty(k,'0','important'); cont.style.setProperty(k,'0','important'); });
        d.body.style.setProperty('min-height','0','important'); d.body.style.setProperty('overflow','hidden','important');
        cont.style.setProperty('max-width','none','important');
        ['margin','border'].forEach(function(k){ el.style.setProperty(k,'0','important'); });
        el.style.setProperty('border-radius','0','important'); el.style.setProperty('box-shadow','none','important');
        cropped=true; cropEl=el;
        try{
          var ov=d.getElementById('overlayTag'), cw=ov&&ov.parentElement;
          if(ov&&cw&&cw.parentElement){ cw.parentElement.insertBefore(ov,cw.nextSibling); }
          var st=d.createElement('style');
          st.textContent='.canvas-wrapper{aspect-ratio:4/3!important;margin-bottom:8px!important}.canvas-wrapper canvas{width:100%!important;height:100%!important;max-width:none!important}@media (min-width:560px){.canvas-wrapper{aspect-ratio:16/10!important}}#overlayTag{position:static!important;background:none!important;backdrop-filter:none!important;padding:6px 0 0!important;margin:0!important;text-align:left!important}';
          d.head.appendChild(st);
          try{ pf.contentWindow.dispatchEvent(new pf.contentWindow.Event('resize')); }catch(e){}
        }catch(e){}
        try{
          var hiSent=false;
          var hiFire=function(kind){ if(hiSent) return; hiSent=true; try{ if(window.umami) window.umami.track('hero_interact',{page:location.pathname,widget:'volumetric-analysis',via:kind,after_s:Math.round((window.performance&&performance.now?performance.now():0)/1000)}); }catch(e){} };
          d.addEventListener('pointerdown',function(){ hiFire('pointer'); },{passive:true,capture:true});
          d.addEventListener('touchstart',function(){ hiFire('touch'); },{passive:true,capture:true});
          d.addEventListener('keydown',function(){ hiFire('key'); },true);
        }catch(e){}
        kick();
        return true;
      }catch(e){ return false; }
    }
    function fit(){
      if(dead||!crop()||!cropEl) return;
      var h=0;
      try{
        var w=pf.contentWindow, cont=cropEl.parentElement;
        Array.prototype.forEach.call(cont.children,function(c){
          if(c.tagName==='STYLE'||c.tagName==='SCRIPT') return;
          var cs=w.getComputedStyle(c); if(cs.display==='none') return;
          h+=c.getBoundingClientRect().height+(parseFloat(cs.marginTop)||0)+(parseFloat(cs.marginBottom)||0);
        });
      }catch(e){ h=0; }
      if(!(h>120)) h=cropEl.getBoundingClientRect().height;
      h=Math.round(h); if(!(h>120)) return;
      h=Math.max(240,Math.min(1600,h));
      if(Math.abs(parseInt(box.style.height||0,10)-h)>4) box.style.height=h+'px';
      box.classList.add('on');
    }
    function onH(e){ var m=e&&e.data; if(!m||!m.kwH||e.source!==pf.contentWindow) return; fit(); }
    window.addEventListener('message',onH);
    window.addEventListener('resize',fit);
    document.addEventListener('fullscreenchange',fit); document.addEventListener('webkitfullscreenchange',fit);
    pf.addEventListener('load',function(){ fit(); setTimeout(fit,300); setTimeout(fit,1200); setTimeout(fit,3000); });
    fit();
    api.doc=function(){ try{ return pf.contentDocument; }catch(e){ return null; } };
    api.win=function(){ try{ return pf.contentWindow; }catch(e){ return null; } };
    api.kick=kick; api.fit=fit;
    api.stop=function(){ dead=true; window.removeEventListener('message',onH); window.removeEventListener('resize',fit); document.removeEventListener('fullscreenchange',fit); document.removeEventListener('webkitfullscreenchange',fit); };
    return api;
  }

  /* ── KW:TEACH-SITE-V2: the call it. round on the live model ──
     The real round for Volumetric analysis (teach-notes.json): options 1·2·3, impostor 2, right 3. Tap = your call;
     "Reveal on the model" runs the round's own reveal step inside the widget (burette to 25.00 mL = equivalence), then the
     unmask reads out "Who's sus? Number 2." Reset puts the room back to lids down and the burette back to empty. */
  function CallIt(root, proof){
    var panel=root.querySelector('#tchCallit'); if(!panel) return function(){};
    var opts=[].slice.call(panel.querySelectorAll('.ci-opt'));
    var foot=panel.querySelector('#tchCiFoot'), btn=panel.querySelector('#tchCiReveal'), out=panel.querySelector('#tchCiReveal2');
    var you=panel.querySelector('#tchCiYou'), state=panel.querySelector('#tchCiState');
    var rbtn=root.querySelector('#tchReset');
    var RIGHT='3', SUS='2', mine='', timers=[], done=false;
    function track(step){ try{ if(window.umami) window.umami.track('callit_demo',{page:location.pathname,step:step,call:mine}); }catch(e){} }
    function later(fn,ms){ timers.push(setTimeout(fn,ms)); }
    function clear(){ timers.forEach(clearTimeout); timers=[]; }
    function setVol(v){ try{ var d=proof.doc(), w=proof.win(); var r=d&&d.querySelector('#volSlider'); if(r&&w){ r.value=v; r.dispatchEvent(new w.Event('input',{bubbles:true})); } }catch(e){} }
    function pick(ev){
      if(done) return;
      mine=ev.currentTarget.getAttribute('data-opt');
      opts.forEach(function(o){ o.classList.toggle('mine', o.getAttribute('data-opt')===mine); });
      foot.textContent='Called: number '+mine+'. Now reveal it on the model.';
      btn.hidden=false; state.textContent='called';
      track('call');
    }
    function reveal(){
      if(done) return; done=true; clear();
      btn.disabled=true; btn.textContent='Revealing…'; state.textContent='reveal';
      foot.textContent='Burette to 25.00 mL… watch the flask.';
      setVol(500);
      later(function(){
        opts.forEach(function(o){ var v=o.getAttribute('data-opt'); o.disabled=true; o.classList.toggle('sus',v===SUS); o.classList.toggle('legit',v===RIGHT); });
        you.textContent = mine===RIGHT ? 'You called 3. Legit.' : mine===SUS ? 'You called 2 — the impostor. Most rooms do.' : 'You called 1. Not the impostor, not the answer: at equivalence the indicator hasn’t moved yet.';
        out.classList.add('on'); btn.hidden=true; btn.disabled=false; btn.textContent='Reveal on the model';
        foot.textContent='Who’s sus? Number 2. Reset to run it again.'; state.textContent='unmasked';
        track('reveal');
      },1600);
    }
    function reset(){
      clear(); done=false; mine='';
      opts.forEach(function(o){ o.disabled=false; o.classList.remove('mine','sus','legit'); });
      out.classList.remove('on'); you.textContent=''; btn.hidden=true; btn.disabled=false; btn.textContent='Reveal on the model';
      foot.textContent='Pairs hold up fingers. Tap yours.'; state.textContent='lids down';
      setVol(0); proof.kick();
    }
    btn.hidden=true;   /* the dc runtime drops the bare hidden attribute from the markup, so it is set here */
    opts.forEach(function(o){ o.addEventListener('click', pick); });
    btn.addEventListener('click', reveal);
    if(rbtn) rbtn.addEventListener('click', reset);
    return function(){ clear(); opts.forEach(function(o){ o.removeEventListener('click', pick); }); btn.removeEventListener('click', reveal); if(rbtn) rbtn.removeEventListener('click', reset); };
  }

  /* ── KW:TEACH-SITE-V2: the sticky bar — on once the hero has scrolled out, off at the signup block (and in fullscreen) ── */
  function Joinbar(root){
    var bar=root.querySelector('#tchJoinbar'), hero=root.querySelector('.hero'), join=root.querySelector('#tch-join');
    if(!bar||!hero||!join) return function(){};
    var dead=false, raf=0;
    function set(){
      raf=0; if(dead) return;
      var fs=!!(document.fullscreenElement||document.webkitFullscreenElement);
      var h=hero.getBoundingClientRect(), j=join.getBoundingClientRect();
      var on=!fs && h.bottom < 80 && j.top > window.innerHeight - 40;
      bar.classList.toggle('on', on); bar.setAttribute('aria-hidden', on?'false':'true');
    }
    function tick(){ if(!raf) raf=requestAnimationFrame(set); }
    window.addEventListener('scroll', tick, {passive:true}); window.addEventListener('resize', tick);
    document.addEventListener('fullscreenchange', tick); document.addEventListener('webkitfullscreenchange', tick);
    set();
    return function(){ dead=true; window.removeEventListener('scroll', tick); window.removeEventListener('resize', tick); document.removeEventListener('fullscreenchange', tick); document.removeEventListener('webkitfullscreenchange', tick); };
  }

  /* founding-teacher seats. reads /api/staffroom-seats if it exists; falls back
     to the data-seats-left attribute so the card never renders a lie or a blank. */
  function Seats(root){
    var card=root.querySelector('.join');   /* KW:TEACH-SITE-V2 */
    if(!card) return function(){};
    /* KW:TEACH-SITE (ruled 13 Oct 2026): the live count is anti-social-proof while it reads 48 of 50. Until
       data-seats-show-after seats are gone the line reads the offer; from then on it counts down; at 0 it flips. */
    var line=root.querySelector('#tchSeatLine'), text=root.querySelector('#tchSeatText');
    var showAfter=parseInt(card.getAttribute('data-seats-show-after'),10)||10;
    var dead=false;
    function paint(n, tot){
      if(dead||!text) return;
      n=Math.max(0, n|0); tot=(tot|0)||50;
      if(n<=0){
        card.classList.add('f-gone'); line.classList.add('still');
        text.textContent='All '+tot+' founding seats taken — join anyway, you’re next in line';
      } else if(tot-n < showAfter){
        line.classList.add('still');
        text.textContent=tot+' founding seats · free until Fri 9 April 2027';
      } else {
        line.classList.remove('still');
        text.innerHTML='<b>'+n+'</b> of '+tot+' seats left';
      }
    }
    paint(parseInt(card.getAttribute('data-seats-left'),10)||0,
          parseInt(card.getAttribute('data-seats-total'),10)||0);
    if(window.fetch){
      fetch('/api/staffroom-seats', { headers:{ 'Accept':'application/json' } })
        .then(function(r){ return r.ok ? r.json() : null; })
        .then(function(j){ if(j && typeof j.remaining==='number') paint(j.remaining, j.total); })
        .catch(function(){ /* keep the fallback figure */ });
    }
    return function(){ dead=true; };
  }

  window.KWTeachers = function(root){
    if(!root || root.__kwTeachersOn) return function(){};
    root.__kwTeachersOn = true;
    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    var box = Stack(root, 'stackBox', reduce);

    var scenes=[];
    var cvBox=root.querySelector('#cvBox'), hostBox=root.querySelector('#stackBox');
    if(cvBox) scenes.push({ el:cvBox, host:hostBox, pick:function(){ return BOX[box?Math.min(2,box.index()):0]; } });

    var stops=[];
    if(scenes.length) stops.push(FlowField(root, scenes, reduce?520:900, reduce));
    stops.push(PhotonDemo(root, reduce));
    stops.push(EnzymeDemo(root));   /* the Biology enzyme canvas is gone (made way for the live call it.) — returns a no-op */
    stops.push(Fullscreen(root));
    var proof=Proof(root); stops.push(proof.stop);   /* KW:TEACH-SITE */
    stops.push(CallIt(root, proof));
    stops.push(Joinbar(root));   /* KW:TEACH-SITE-V2 */
    stops.push(Seats(root));
    if(box) stops.push(box.stop);

    return function(){
      root.__kwTeachersOn = false;
      stops.forEach(function(f){ try{ f(); }catch(e){} });
    };
  };
})();
