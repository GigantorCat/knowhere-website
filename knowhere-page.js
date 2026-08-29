// Shared behaviour for Knowhere subpages: logo injection, scroll reveal, and the
// page-title text-mask aurora banner. Loaded in each DC's <helmet>; called from the
// DC logic class componentDidMount. Pure behaviour — no styling.
(function () {
  function injectLogo(root) {
    if (!window.KnowhereMarks) { return setTimeout(function () { injectLogo(root); }, 60); }
    root.querySelectorAll('[data-kw-logo]').forEach(function (el) {
      var s = parseInt(el.getAttribute('data-kw-logo') || '24', 10);
      var col = el.getAttribute('data-kw-logo-color');
      el.innerHTML = col ? window.KnowhereMarks.logoSvg(s, col) : window.KnowhereMarks.logoSvg(s);
    });
  }

  function reveal(root) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    root.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
    return io;
  }

  function banner(root, title, hues) {
    var host = root.querySelector('#pbHost'), cv = root.querySelector('#pbCv');
    if (!host || !cv) return function () {};
    var ctx = cv.getContext('2d');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function size() {
      var r = host.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = r.width * dpr; cv.height = r.height * dpr;
    }
    function mask() {
      var r = host.getBoundingClientRect(); if (!r.width) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var mc = document.createElement('canvas');
      mc.width = Math.round(r.width * dpr); mc.height = Math.round(r.height * dpr);
      var m = mc.getContext('2d'); m.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Fixed letter size (independent of title length) so every page matches;
      // only scale DOWN if a long title would overflow the width.
      var f = Math.min(r.width * 0.14, r.height * 0.92);
      m.font = '900 ' + f + 'px Geist, system-ui, sans-serif';
      var tw = m.measureText(title).width, max = r.width * 0.92;
      if (tw > max) f *= max / tw;
      m.font = '900 ' + f + 'px Geist, system-ui, sans-serif';
      m.textAlign = 'center'; m.textBaseline = 'middle'; m.fillStyle = '#fff';
      m.fillText(title, r.width / 2, r.height / 2 + f * 0.04);
      var u = mc.toDataURL('image/png');
      host.style.webkitMaskImage = 'url(' + u + ')';
      host.style.maskImage = 'url(' + u + ')';
      host.style.webkitMaskSize = '100% 100%';
      host.style.maskSize = '100% 100%';
    }
    var raf;
    function draw(now) {
      var w = cv.width, h = cv.height, t = now * 0.00035, n = hues.length;
      // Bias every hue toward brat green (#7BEA5A) for a green-flavoured aurora.
      var BRAT = [123, 234, 90], MIX = 0.45;
      function hx(i) {
        var c = hues[i];
        return [Math.round(c[0] + (BRAT[0] - c[0]) * MIX),
                Math.round(c[1] + (BRAT[1] - c[1]) * MIX),
                Math.round(c[2] + (BRAT[2] - c[2]) * MIX)];
      }
      // Rich horizontal base through the hues so every masked pixel is colour, not black.
      var base = ctx.createLinearGradient(0, 0, w, 0);
      for (var s = 0; s < n; s++) {
        var cc = hx(s);
        base.addColorStop(n < 2 ? 0 : s / (n - 1), 'rgb(' + cc[0] + ',' + cc[1] + ',' + cc[2] + ')');
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
      // Flowing aurora ribbons, additively blended, sweeping through the letters.
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < n; i++) {
        var c = hx(i);
        ctx.beginPath();
        for (var x = 0; x <= w; x += 10) {
          var y = h * 0.5 + Math.sin(x * 0.0045 + t * (1 + i * 0.5) + i * 2.1) * h * 0.5
                          + Math.sin(x * 0.012 - t * 1.4 + i * 1.7) * h * 0.22;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h * 2); ctx.lineTo(0, h * 2); ctx.closePath();
        var g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
        g.addColorStop(0.5, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.55)');
        g.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.16)');
        ctx.fillStyle = g; ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    function loop(n) { draw(n); raf = requestAnimationFrame(loop); }
    function boot() { size(); mask(); if (reduce) { draw(0); } else if (!raf) { raf = requestAnimationFrame(loop); } }
    var onResize = function () { size(); mask(); };
    window.addEventListener('resize', onResize);
    if (document.fonts && document.fonts.load) {
      document.fonts.load('900 100px Geist').then(function () { return document.fonts.ready; }).then(boot).catch(boot);
    } else { boot(); }
    return function () { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }

  window.KnowherePage = { injectLogo: injectLogo, reveal: reveal, banner: banner };
})();
