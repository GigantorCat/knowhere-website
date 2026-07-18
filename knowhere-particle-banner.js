// Knowhere particle page-banner: a full-bleed particle formation that communicates
// the page's content, with the page title rendered as a frosted-glass overlay
// (backdrop-blur masked to the title glyphs) floating over the particles.
// Usage from a DC logic class:  this._stopBanner = window.KnowhereParticleBanner(root, 'Pricing', 'chart');
// kinds: 'layers' | 'modes' | 'chart' | 'heart'
// After the particles assemble, each formation "comes alive":
//   layers — rings counter-rotate with a bright arc sweeping around each
//   modes  — orbs swirl and a pulse of energy travels orb-to-orb along the wave
//   chart  — bars breathe like an equalizer; a pulse races up the trend line
//   heart  — a pulse travels along the ECG trace and the heart beats as it passes
(function () {
  var BRAT = { r: 123, g: 234, b: 90 };
  var WARM = { r: 237, g: 236, b: 230 };
  var PURP = { r: 155, g: 90, b: 234 };
  var BLUE = { r: 35, g: 164, b: 221 };

  function shapePoints(kind, w, h) {
    var pts = [];
    var cy = h * 0.5;
    if (kind === 'layers') {
      // three overlapping rings spanning the width — style × neurology × mode
      var accs = [BRAT, PURP, BLUE];
      var rx = w * 0.235, ry = h * 0.47;
      for (var k = 0; k < 3; k++) {
        var cx = w * (0.26 + k * 0.24);
        for (var i = 0; i < 240; i++) {
          var th = (i / 240) * 6.283;
          pts.push({ sk: 'ring', cx: cx, rx: rx, ry: ry, th: th, dir: (k % 2 ? -1 : 1), acc: (i % 7 === 0) ? accs[k] : null, band: k });
        }
      }
    } else if (kind === 'modes') {
      // four orbs (see / hear / touch / talk) strung on a line across the banner
      for (var q = 0; q < 4; q++) {
        var ox = w * (0.14 + q * 0.24);
        for (var j = 0; j < 150; j++) {
          var a = Math.random() * 6.283, rr = Math.pow(Math.random(), 0.55) * h * 0.42;
          pts.push({ sk: 'orb', ox: ox, a: a, rr: rr, acc: (j % 6 === 0) ? BRAT : null, band: q });
        }
      }
      for (var l = 0; l < 160; l++) {
        pts.push({ sk: 'wave', u: l / 160, acc: (l % 5 === 0) ? BLUE : null, band: 4 });
      }
    } else if (kind === 'chart') {
      // ascending bars + rising trend arrow — value for money
      var bars = 7;
      for (var b = 0; b < bars; b++) {
        var bx = w * (0.09 + b * 0.125), bh = h * (0.28 + 0.64 * (b / (bars - 1)));
        for (var p = 0; p < 84; p++) {
          pts.push({ sk: 'bar', bx: bx + (Math.random() - 0.5) * w * 0.058, yf: Math.random(), bh: bh, acc: null, band: b });
        }
      }
      for (var t2 = 0; t2 < 170; t2++) {
        var v = t2 / 170;
        if (v < 0.9) {
          pts.push({ sk: 'trend', u: v, x: w * 0.07 + v / 0.9 * w * 0.82, y: h * 0.82 - v / 0.9 * h * 0.70, acc: BRAT, band: 3 });
        } else {
          var e = (v - 0.9) / 0.1, s = (t2 % 2) ? 1 : -1;
          pts.push({ sk: 'trend', u: v, x: w * 0.89 - e * w * 0.038, y: h * 0.12 + (s > 0 ? e * h * 0.11 : e * h * 0.004), acc: BRAT, band: 3 });
        }
      }
    } else { // heart
      // ECG trace across the banner with a parametric heart at centre — care & wellbeing
      for (var m2 = 0; m2 < 360; m2++) {
        var uu = m2 / 360, x = w * 0.04 + uu * w * 0.92, y = cy;
        var lo = Math.abs(uu - 0.5);
        if (lo > 0.105) {
          if (uu > 0.15 && uu < 0.20) y = cy - Math.sin((uu - 0.15) / 0.05 * 3.14) * h * 0.24;
          if (uu > 0.72 && uu < 0.79) y = cy - Math.sin((uu - 0.72) / 0.07 * 3.14) * h * 0.40;
          pts.push({ sk: 'ecg', u: uu, x: x, y: y, acc: (m2 % 5 === 0) ? BRAT : null, band: 0 });
        }
      }
      var S = h * 0.026;
      for (var hh = 0; hh < 340; hh++) {
        var th2 = (hh / 340) * 6.283, sc2 = 0.6 + 0.4 * Math.sqrt(Math.random());
        var hx = 16 * Math.pow(Math.sin(th2), 3);
        var hy = -(13 * Math.cos(th2) - 5 * Math.cos(2 * th2) - 2 * Math.cos(3 * th2) - Math.cos(4 * th2));
        pts.push({ sk: 'heart', hx: hx * S * sc2, hy: hy * S * sc2, acc: (hh % 6 === 0) ? BRAT : null, band: 1 });
      }
    }
    return pts;
  }

  function glassMask(el, title, wpx, hpx) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var mc = document.createElement('canvas');
    mc.width = Math.round(wpx * dpr); mc.height = Math.round(hpx * dpr);
    var m = mc.getContext('2d'); m.setTransform(dpr, 0, 0, dpr, 0, 0);
    var f = Math.min(wpx * 0.14, hpx * 0.92);
    m.font = '900 ' + f + 'px Geist, system-ui, sans-serif';
    var tw = m.measureText(title).width, max = wpx * 0.92;
    if (tw > max) f *= max / tw;
    m.font = '900 ' + f + 'px Geist, system-ui, sans-serif';
    m.textAlign = 'center'; m.textBaseline = 'middle'; m.fillStyle = '#fff';
    m.fillText(title, wpx / 2, hpx / 2 + f * 0.04);
    var u = mc.toDataURL('image/png');
    el.style.webkitMaskImage = 'url(' + u + ')'; el.style.maskImage = 'url(' + u + ')';
    el.style.webkitMaskRepeat = 'no-repeat'; el.style.maskRepeat = 'no-repeat';
    el.style.webkitMaskPosition = 'center'; el.style.maskPosition = 'center';
    el.style.webkitMaskSize = '100% 100%'; el.style.maskSize = '100% 100%';
  }

  window.KnowhereParticleBanner = function (root, title, kind) {
    var host = root.querySelector('#pbHost'), cv = root.querySelector('#pbCv');
    if (!host || !cv) return function () {};
    // the particles are full-bleed now — the mask moves to the glass overlay
    host.style.webkitMaskImage = 'none'; host.style.maskImage = 'none';
    var glass = host.parentElement.querySelector('[data-pb-glass]');
    if (!glass) {
      glass = document.createElement('div');
      glass.setAttribute('data-pb-glass', '');
      glass.setAttribute('aria-hidden', 'true');
      host.parentElement.appendChild(glass);
    }
    // sheerer glass: lighter frost + fainter tint so the formation reads through the glyphs
    glass.style.cssText = 'position:absolute;inset:0 34px;pointer-events:none;' +
      'backdrop-filter:blur(7px) saturate(160%) brightness(1.28);-webkit-backdrop-filter:blur(7px) saturate(160%) brightness(1.28);' +
      'background:linear-gradient(175deg,rgba(237,236,232,0.12),rgba(237,236,232,0.04) 55%,rgba(123,234,90,0.05));';
    var ctx = cv.getContext('2d');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var pts = [], px = [], py = [], seed = [], W = 0, H = 0;

    function build() {
      var r = host.getBoundingClientRect(); if (!r.width) return;
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      var gr = host.parentElement.querySelector('[data-pb-glass]').getBoundingClientRect();
      glassMask(glass, title, gr.width || W, gr.height || H);
      pts = shapePoints(kind, W, H);
      px = new Float32Array(pts.length); py = new Float32Array(pts.length); seed = new Float32Array(pts.length);
      for (var i = 0; i < pts.length; i++) {
        // assemble from a loose scatter around the banner
        px[i] = W * 0.5 + (Math.random() - 0.5) * W * 1.3;
        py[i] = H * 0.5 + (Math.random() - 0.5) * H * 2.4;
        seed[i] = Math.random();
      }
    }

    var raf, t0 = performance.now(), last = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (now - last < 33) return; last = now;
      var r = cv.getBoundingClientRect();
      if (r.bottom < -40 || r.top > window.innerHeight + 40) return;
      if (!pts.length) { build(); if (!pts.length) return; }
      var t = (now - t0) / 1000;
      // "come alive" ramp: 0 until the formation has assembled, then eases to 1
      var act = reduce ? 0 : Math.max(0, Math.min(1, (t - 2.8) / 1.6));
      act = act * act * (3 - 2 * act);
      // kind-level drivers
      var ph = 0, beat = 0;
      if (kind === 'heart') {
        ph = (t * 0.30) % 1.3;                       // pulse travelling along the ECG (with a rest)
        beat = Math.exp(-Math.pow((ph - 0.50) / 0.05, 2)) +
               0.55 * Math.exp(-Math.pow((ph - 0.62) / 0.055, 2)); // heart beats as the pulse passes through it
      } else if (kind === 'chart') {
        ph = (t * 0.26) % 1.35;
      } else if (kind === 'modes') {
        ph = (t * 0.22) % 1.3;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < pts.length; i++) {
        var P = pts[i], bx, by, g = 0, d;
        switch (P.sk) {
          case 'ring': {
            var th = P.th + act * t * 0.2 * P.dir;
            bx = P.cx + Math.cos(th) * P.rx; by = H * 0.5 + Math.sin(th) * P.ry;
            g = act * Math.pow(0.5 + 0.5 * Math.sin(th - t * 1.3 + P.band * 2.1), 10);
            break;
          }
          case 'orb': {
            var a2 = P.a + act * t * (0.35 + P.band * 0.06) * (P.band % 2 ? -1 : 1);
            var rr2 = P.rr * (1 + act * 0.13 * Math.sin(t * 1.5 + P.band * 1.7 + P.a * 3));
            bx = P.ox + Math.cos(a2) * rr2; by = H * 0.5 + Math.sin(a2) * rr2 * 0.9;
            d = P.ox / W - ph; g = act * Math.exp(-d * d / 0.006);
            break;
          }
          case 'wave': {
            bx = W * 0.10 + P.u * W * 0.80;
            by = H * 0.5 + Math.sin(P.u * 9.4 - act * t * 2.2) * H * (0.05 + act * 0.03);
            d = P.u - ph; g = act * Math.exp(-d * d / 0.004);
            break;
          }
          case 'bar': {
            var bh2 = P.bh * (1 + act * 0.09 * Math.sin(t * 1.6 + P.band * 1.15));
            bx = P.bx; by = H * 0.92 - P.yf * bh2;
            if (P.yf > 0.85) g = act * 0.55 * Math.max(0, Math.sin(t * 1.6 + P.band * 1.15));
            break;
          }
          case 'trend': {
            d = P.u - ph; g = act * Math.exp(-d * d / 0.0025);
            bx = P.x; by = P.y - g * H * 0.05;
            break;
          }
          case 'ecg': {
            d = P.u - ph; g = act * Math.exp(-d * d / 0.0022);
            bx = P.x; by = P.y - g * H * 0.06;
            break;
          }
          default: { // heart
            var s2 = 1 + act * 0.16 * beat;
            bx = W * 0.5 + P.hx * s2; by = H * 0.48 + P.hy * s2;
            g = act * beat * 0.8;
          }
        }
        var tx = bx + Math.sin(t * 0.6 + i * 1.7) * 2.4 + Math.sin(t * 0.23 + P.band * 2.1) * W * 0.005;
        var ty = by + Math.cos(t * 0.5 + i * 0.9) * 2.2;
        if (!reduce) { px[i] += (tx - px[i]) * 0.06; py[i] += (ty - py[i]) * 0.06; }
        else { px[i] = tx; py[i] = ty; }
        var c = P.acc || WARM;
        var tw2 = 0.55 + 0.45 * Math.sin(t * 1.4 + seed[i] * 6.283);
        var al = (P.acc ? 0.62 : 0.38) * (0.6 + 0.4 * tw2) * (1 + 0.9 * g);
        if (al > 0.95) al = 0.95;
        var cr = c.r, cg = c.g, cb = c.b;
        if (g > 0.03) { cr += (255 - cr) * g * 0.5 | 0; cg += (255 - cg) * g * 0.5 | 0; cb += (255 - cb) * g * 0.5 | 0; }
        ctx.fillStyle = 'rgba(' + (cr | 0) + ',' + (cg | 0) + ',' + (cb | 0) + ',' + al.toFixed(3) + ')';
        var sz = (P.acc ? 2.3 : 1.7) * (1 + 0.8 * g);
        ctx.fillRect(px[i] - sz / 2, py[i] - sz / 2, sz, sz);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    function boot() { build(); raf = requestAnimationFrame(frame); }
    var onResize = function () { build(); };
    window.addEventListener('resize', onResize);
    if (document.fonts && document.fonts.load) {
      document.fonts.load('900 100px Geist').then(function () { return document.fonts.ready; }).then(boot).catch(boot);
    } else { boot(); }
    return function () { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  };
})();
