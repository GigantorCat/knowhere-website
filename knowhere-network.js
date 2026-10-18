/* knowhere-network.js v1 — the banner network (KW:OPENERS, 18 Oct 2026). The same animation as the Home banner, as one
   file for the landing pages that carry a banner (/for-parents now, /for-teachers next). Home keeps its own copy inside its
   page component; change both together.

   <canvas data-kw-network aria-hidden="true"></canvas>   — sized by CSS (the bottom third of the banner); the canvas's
   parent is what is watched for visibility.

   Faint nodes drift; a link fades in as two come within reach and out as they part, so the web keeps re-wiring. Every so
   often a brat-green pulse runs along a link and lights the node it reaches. ~60 fps, paused while off screen, one still
   frame under prefers-reduced-motion. */
(function () {
  if (window.__kwNetwork) return; window.__kwNetwork = true;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function run(cv) {
    if (!cv || !cv.getContext || cv.__kwNet) return; cv.__kwNet = true;
    var sec = cv.parentElement;
    var ctx = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2), W = 0, H = 0, vis = true, raf = 0, last = 0;
    var nodes = [], pulses = [], REACH = 120;
    var mk = function () {
      var a = Math.random() * 6.283, sp = 0.06 + Math.random() * 0.16;
      return { x: Math.random() * Math.max(W, 1), y: Math.random() * Math.max(H, 1), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        r: 0.55 + Math.random() * 0.75, green: Math.random() < 0.16, lit: 0 };
    };
    var size = function () {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = Math.max(1, Math.round(W * dpr)); cv.height = Math.max(1, Math.round(H * dpr)); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      REACH = W < 700 ? 112 : 135;
      var want = Math.round(Math.max(30, Math.min(90, W * H / (W < 700 ? 5200 : 9000))));
      while (nodes.length < want) nodes.push(mk());
      if (nodes.length > want) nodes.length = want;
      nodes.forEach(function (n) { if (n.x > W) n.x = Math.random() * W; if (n.y > H) n.y = Math.random() * H; });
    };
    var fire = function () {
      var a = nodes[Math.floor(Math.random() * nodes.length)]; if (!a) return;
      var best = null, bd = 1e9;
      nodes.forEach(function (b) { if (b === a) return; var d = Math.hypot(b.x - a.x, b.y - a.y); if (d < REACH && d < bd && Math.random() < 0.7) { bd = d; best = b; } });
      if (best) pulses.push({ a: a, b: best, t: 0, sp: 0.012 + Math.random() * 0.01 });
    };
    var draw = function (dt) {
      ctx.clearRect(0, 0, W, H);
      var i, j, n, m;
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i]; n.x += n.vx * dt; n.y += n.vy * dt;
        if (n.x < -20) n.x = W + 20; else if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20; else if (n.y > H + 20) n.y = -20;
        if (n.lit > 0) n.lit = Math.max(0, n.lit - 0.012 * dt);
      }
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          m = nodes[j]; var dx = m.x - n.x, dy = m.y - n.y; if (Math.abs(dx) > REACH || Math.abs(dy) > REACH) continue;
          var d = Math.sqrt(dx * dx + dy * dy); if (d >= REACH) continue;
          var k = 1 - d / REACH, depth = 0.45 + 0.55 * ((n.y + m.y) / (2 * H));
          var a = k * k * 0.22 * depth, glow = Math.max(n.lit, m.lit);
          ctx.strokeStyle = glow > 0.05 ? 'rgba(123,234,90,' + (a + glow * 0.25 * k).toFixed(3) + ')' : 'rgba(237,236,232,' + a.toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
        }
      }
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i]; var dep = 0.45 + 0.55 * (n.y / H), al = (n.green ? 0.55 : 0.38) * dep;
        if (n.lit > 0) { ctx.fillStyle = 'rgba(123,234,90,' + (n.lit * 0.25).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4.5, 0, 6.283); ctx.fill(); }
        ctx.fillStyle = (n.green || n.lit > 0.05) ? 'rgba(123,234,90,' + Math.min(1, al + n.lit * 0.6).toFixed(3) + ')' : 'rgba(237,236,232,' + al.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + n.lit * 0.8, 0, 6.283); ctx.fill();
      }
      for (i = pulses.length - 1; i >= 0; i--) {
        var p = pulses[i]; p.t += p.sp * dt;
        if (p.t >= 1 || Math.hypot(p.b.x - p.a.x, p.b.y - p.a.y) > REACH * 1.1) { if (p.t >= 1) p.b.lit = 1; pulses.splice(i, 1); continue; }
        var px = p.a.x + (p.b.x - p.a.x) * p.t, py = p.a.y + (p.b.y - p.a.y) * p.t;
        ctx.fillStyle = 'rgba(123,234,90,0.22)'; ctx.beginPath(); ctx.arc(px, py, 3, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(190,250,170,0.95)'; ctx.beginPath(); ctx.arc(px, py, 1.1, 0, 6.283); ctx.fill();
      }
    };
    var loop = function (now) {
      raf = requestAnimationFrame(loop);
      if (!vis) { last = now; return; }
      var dt = last ? Math.min(3, (now - last) / 16.7) : 1; last = now;
      if (pulses.length < 3 && Math.random() < 0.012 * dt) fire();
      draw(dt);
    };
    size();
    if (reduce) { draw(0); window.addEventListener('resize', function () { size(); draw(0); }); return; }
    if ('IntersectionObserver' in window && sec) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { vis = e.isIntersecting; }); }, { threshold: 0 }).observe(sec);
    }
    window.addEventListener('resize', size);
    setTimeout(fire, 900);
    raf = requestAnimationFrame(loop);
  }

  function boot() { Array.prototype.forEach.call(document.querySelectorAll('canvas[data-kw-network]'), run); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.KnowhereNetwork = { run: run, boot: boot };   /* for pages that render their markup late (DC components) */
})();
