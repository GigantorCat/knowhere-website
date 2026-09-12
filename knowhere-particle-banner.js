// Knowhere particle page-banner: a full-bleed particle formation that communicates
// the page's content, with the page title rendered as a frosted-glass overlay
// (backdrop-blur masked to the title glyphs) floating over the particles.
// Usage from a DC logic class:  this._stopBanner = window.KnowhereParticleBanner(root, 'Pricing', 'chart');
// kinds: 'layers' | 'modes' | 'chart' | 'heart' | 'teach' | 'mark' | 'apples' | 'compare'
// After the particles assemble, each formation "comes alive":
//   layers  — rings counter-rotate with a bright arc sweeping around each
//   modes   — orbs swirl and a pulse of energy travels orb-to-orb along the wave
//   chart   — bars breathe like an equalizer; a pulse races up the trend line
//   heart   — a pulse travels along the ECG trace and the heart beats as it passes
//   apples  — a row of apples, each lifting and brightening as the pulse reaches it
//   mark    — answers get ticked one by one and the score ring fills behind them
//   teach   — wavefronts leave the teacher node and each student flares as one lands
//   compare — four columns, four different internal rules, one of them coherent and lit
//
// v2 (12 Sep 2026) — the hero's particle grammar, brought across from index.html:
//   · every formation now carries a z and is drawn through a perspective divide,
//     so depth drives alpha and point size exactly as it does on the homepage.
//   · formations with a real SURFACE (rings, orbs, apples, the heart, the score
//     ring, the teach spheres) also carry a per-frame surface normal and take a
//     lambert term, which is what makes a curve read as a curve instead of a
//     speckled patch. Flat formations — bars, trend, ticks, ruled lines, the ECG
//     trace — emit no normal and take the old draw path untouched.
//   · every "come alive" behaviour above is unchanged, formula for formula.
(function () {
  var BRAT = { r: 123, g: 234, b: 90 };
  var WARM = { r: 237, g: 236, b: 230 };
  var PURP = { r: 155, g: 90, b: 234 };
  var BLUE = { r: 35, g: 164, b: 221 };

  /* Points are emitted with a base z (in px, the same units as x and y) and,
     where the formation has a genuine surface, enough parameterisation for the
     draw loop to derive a normal per frame — because these shapes move, so a
     normal baked at build time would light yesterday's geometry. */
  function shapePoints(kind, w, h) {
    var pts = [];
    var cy = h * 0.5;
    var DZ = h * 0.80;                       // nominal half-depth for the stage
    if (kind === 'layers') {
      // three overlapping rings spanning the width — style × neurology × mode
      // v2: each ring is tilted out of the screen plane, so the counter-rotation
      // that was a flat spin now genuinely carries points through depth.
      var accs = [BRAT, PURP, BLUE];
      var rx = w * 0.235, ry = h * 0.47;
      var TILT = [0.22, -0.17, 0.26];   // gentle — the lambert does the work, not the squash
      for (var k = 0; k < 3; k++) {
        var cx = w * (0.26 + k * 0.24);
        for (var i = 0; i < 240; i++) {
          var th = (i / 240) * 6.283;
          pts.push({ sk: 'ring', cx: cx, rx: rx, ry: ry, th: th, dir: (k % 2 ? -1 : 1), tilt: TILT[k],
                     acc: (i % 7 === 0) ? accs[k] : null, band: k });
        }
      }
    } else if (kind === 'modes') {
      // four orbs (see / hear / touch / talk) strung on a line across the banner
      // v2: solid spheres, not discs — a second angle is all it takes.
      for (var q = 0; q < 4; q++) {
        var ox = w * (0.14 + q * 0.24);
        for (var j = 0; j < 150; j++) {
          var a = Math.random() * 6.283, rr = Math.pow(Math.random(), 0.55) * h * 0.42;
          pts.push({ sk: 'orb', ox: ox, a: a, pa: Math.acos(2 * Math.random() - 1), rr: rr,
                     acc: (j % 6 === 0) ? BRAT : null, band: q });
        }
      }
      for (var l = 0; l < 160; l++) {
        pts.push({ sk: 'wave', u: l / 160, zf: Math.sin(l * 0.7) * DZ * 0.22,
                   acc: (l % 5 === 0) ? BLUE : null, band: 4 });
      }
    } else if (kind === 'chart') {
      // ascending bars + rising trend arrow — value for money
      // v2: the bars have thickness, so the row reads as a solid block of them.
      var bars = 7;
      for (var b = 0; b < bars; b++) {
        var bx = w * (0.09 + b * 0.125), bh = h * (0.28 + 0.64 * (b / (bars - 1)));
        for (var p = 0; p < 84; p++) {
          pts.push({ sk: 'bar', bx: bx + (Math.random() - 0.5) * w * 0.058, yf: Math.random(), bh: bh,
                     z0: (Math.random() - 0.5) * DZ * 0.55, acc: null, band: b });
        }
      }
      for (var t2 = 0; t2 < 170; t2++) {
        var v = t2 / 170;
        if (v < 0.9) {
          pts.push({ sk: 'trend', u: v, x: w * 0.07 + v / 0.9 * w * 0.82, y: h * 0.82 - v / 0.9 * h * 0.70,
                     z0: -DZ * 0.30 + v * DZ * 0.22, acc: BRAT, band: 3 });
        } else {
          var e = (v - 0.9) / 0.1, s = (t2 % 2) ? 1 : -1;
          pts.push({ sk: 'trend', u: v, x: w * 0.89 - e * w * 0.038, y: h * 0.12 + (s > 0 ? e * h * 0.11 : e * h * 0.004),
                     z0: -DZ * 0.08, acc: BRAT, band: 3 });
        }
      }
    } else if (kind === 'compare') {
      // FOUR COLUMNS, FOUR INTERNAL RULES — the Compare page's whole argument,
      // made with the material instead of about it: same footprint, same point
      // budget, four visibly different organising principles, and the coherent
      // one is lit. No labels on the particles; the page does the naming.
      //   col 0  graph   — nodes joined by a nearest-neighbour tree  (lit)
      //   col 1  lattice — a rigid grid, everything moving as one block
      //   col 2  orbital — eccentric rings on several planes
      //   col 3  strands — parallel bands, one in three out of step
      var CW = w * 0.082, CH = h * 0.40, CD = DZ * 0.60, PER = 470;
      for (var c = 0; c < 4; c++) {
        var ccx = w * (0.155 + c * 0.23);
        var nodes = [], eds = [], nI, eI, eJ, gp;
        if (c === 0) {
          // a nearest-neighbour tree — every node reachable, the whole thing one piece
          var NN = 13;
          for (nI = 0; nI < NN; nI++) {
            var ga = (nI / NN) * 6.283 * 2.4, gq = 0.34 + 0.66 * (nI % 5) / 4;
            nodes.push({ x: Math.cos(ga) * CW * gq, y: ((nI / (NN - 1)) - 0.5) * 2 * CH * 0.94,
                         z: Math.sin(ga) * CD * gq });
          }
          var linked = [0], freeN = [];
          for (nI = 1; nI < NN; nI++) freeN.push(nI);
          while (freeN.length) {
            var bestD = 1e9, bA = 0, bB = 0;
            for (eI = 0; eI < linked.length; eI++) for (eJ = 0; eJ < freeN.length; eJ++) {
              var A0 = nodes[linked[eI]], B0 = nodes[freeN[eJ]];
              var dd = (A0.x - B0.x) * (A0.x - B0.x) + (A0.y - B0.y) * (A0.y - B0.y) + (A0.z - B0.z) * (A0.z - B0.z);
              if (dd < bestD) { bestD = dd; bA = linked[eI]; bB = eJ; }
            }
            eds.push([bA, freeN[bB]]); linked.push(freeN[bB]); freeN.splice(bB, 1);
          }
          eds.push([0, NN - 1]); eds.push([2, NN - 5]); eds.push([4, NN - 2]);
        } else if (c === 1) {
          // a rigid grid — every cell identical, nothing emergent
          var GX = 3, GY = 6, GZ = 2, ix, iy, iz;
          for (iz = 0; iz < GZ; iz++) for (iy = 0; iy < GY; iy++) for (ix = 0; ix < GX; ix++) {
            nodes.push({ x: (ix / (GX - 1) - 0.5) * CW * 1.9,
                         y: (iy / (GY - 1) - 0.5) * CH * 1.9,
                         z: (iz / (GZ - 1) - 0.5) * CD * 1.2, ix: ix, iy: iy, iz: iz });
          }
          for (eI = 0; eI < nodes.length; eI++) for (eJ = eI + 1; eJ < nodes.length; eJ++) {
            var Na = nodes[eI], Nb = nodes[eJ];
            if (Math.abs(Na.ix - Nb.ix) + Math.abs(Na.iy - Nb.iy) + Math.abs(Na.iz - Nb.iz) === 1) eds.push([eI, eJ]);
          }
        }
        if (c === 0 || c === 1) {
          for (gp = 0; gp < PER; gp++) {
            var eg = eds[gp % eds.length];
            var ut = (Math.floor(gp / eds.length) + 1) / (Math.ceil(PER / eds.length) + 1);
            var NA = nodes[eg[0]], NB = nodes[eg[1]];
            pts.push({ sk: 'cmp', rule: c, col: c, ccx: ccx,
                       x0: NA.x + (NB.x - NA.x) * ut, y0: NA.y + (NB.y - NA.y) * ut, z0: NA.z + (NB.z - NA.z) * ut,
                       u: (gp % eds.length) / eds.length,
                       acc: (c === 0 && gp % 4 === 0) ? BRAT : null, band: c });
          }
        } else if (c === 2) {
          // eccentric orbits on three planes — busy, never settling
          var ORB = [[1.00, 0.44, -0.5], [0.66, 0.94, 0.9], [1.05, 0.32, 2.1]];
          for (gp = 0; gp < PER; gp++) {
            var ob = ORB[gp % ORB.length];
            pts.push({ sk: 'cmp', rule: 2, col: c, ccx: ccx,
                       orx: ob[0] * CW, ory: ob[1] * CH, orb: ob[2],
                       a: (gp / PER) * 6.283 * 9, u: gp / PER,
                       acc: (gp % 9 === 0) ? WARM : null, band: c });
          }
        } else {
          // parallel bands, one in three arriving out of step — linear, never joining
          var BANDS = 6, perB = Math.ceil(PER / BANDS);
          for (gp = 0; gp < PER; gp++) {
            var bj = Math.floor(gp / perB), bu = (gp % perB) / perB;
            pts.push({ sk: 'cmp', rule: 3, col: c, ccx: ccx,
                       x0: ((bj / (BANDS - 1)) - 0.5) * CW * 1.8,
                       z0: Math.sin(bu * 3.1 + bj) * CD * 0.55,
                       u: bu, skew: (bj % 3 === 1) ? 0.18 : 0,
                       acc: (gp % 11 === 0) ? WARM : null, band: c });
          }
        }
      }
    } else if (kind === 'teach') {
      // one teacher, expanding wavefronts, and the row of students each one lands on
      var srcX = w * 0.085, maxR = w * 0.90;
      for (var s0 = 0; s0 < 100; s0++) {
        var sa = Math.random() * 6.283, sr = Math.pow(Math.random(), 0.5) * h * 0.20;
        pts.push({ sk: 'tsrc', sx: srcX, a: sa, pa: Math.acos(2 * Math.random() - 1), rr: sr,
                   acc: (s0 % 3 === 0) ? BRAT : null, band: 0 });
      }
      for (var a0 = 0; a0 < 260; a0++) {
        pts.push({ sk: 'arc', sx: srcX, maxR: maxR, u: (a0 % 5) / 5,
                   th: ((a0 / 260) - 0.5) * 1.72, pz: ((a0 % 7) / 6 - 0.5) * 1.1,
                   acc: (a0 % 6 === 0) ? BLUE : null, band: 1 });
      }
      for (var q0 = 0; q0 < 5; q0++) {
        var stx = w * (0.30 + q0 * 0.145);
        for (var j0 = 0; j0 < 110; j0++) {
          var ja = Math.random() * 6.283, jr = Math.pow(Math.random(), 0.55) * h * 0.30;
          pts.push({ sk: 'tstud', ox: stx, ux: (stx - srcX) / maxR, a: ja,
                     pa: Math.acos(2 * Math.random() - 1), rr: jr,
                     acc: (j0 % 6 === 0) ? BRAT : null, band: 2 + q0 });
        }
      }
    } else if (kind === 'mark') {
      // a page of answers being marked, and the score filling as each one lands
      // v2: the sheet is tilted a little into depth; the score ring is a real ring.
      var ROWS = 5, S = h * 0.20;
      for (var r0 = 0; r0 < ROWS; r0++) {
        var ry0 = 0.18 + r0 * (0.64 / (ROWS - 1));
        var runs = 0.26 + 0.16 * ((r0 * 5) % 3) / 2;      // ragged right edge, like handwriting
        for (var n0 = 0; n0 < 84; n0++) {
          var lxr = w * (0.07 + Math.random() * runs);
          pts.push({ sk: 'line', lx: lxr, ly: ry0, z0: (lxr / w - 0.30) * DZ * 0.60,
                     u: r0 / ROWS, acc: null, band: r0 });
        }
        for (var k0 = 0; k0 < 64; k0++) {
          var kv = k0 / 64, dx0, dy0;
          if (kv < 0.36) { var pp = kv / 0.36; dx0 = -0.55 + pp * 0.37; dy0 = -0.02 + pp * 0.44; }
          else { var qq = (kv - 0.36) / 0.64; dx0 = -0.18 + qq * 0.73; dy0 = 0.42 - qq * 1.04; }
          pts.push({ sk: 'tick', tx: w * 0.50, ty: ry0, dx: dx0 * S, dy: dy0 * S, z0: DZ * 0.10,
                     u: r0 / ROWS, acc: BRAT, band: r0 });
        }
      }
      var ringR = Math.min(h * 0.34, w * 0.085), ringX = w * 0.86;
      for (var g0 = 0; g0 < 190; g0++) {
        pts.push({ sk: 'score', cx: ringX, rad: ringR, th: (g0 / 190) * 6.283,
                   uf: g0 / 190, fill: false, acc: null, band: 6 });
      }
      for (var f0 = 0; f0 < 190; f0++) {
        pts.push({ sk: 'score', cx: ringX, rad: ringR, th: (f0 / 190) * 6.283,
                   uf: f0 / 190, fill: true, acc: BRAT, band: 7 });
      }
    } else if (kind === 'apples') {
      // five apples strung across the banner — outline, stem, leaf
      // v2: the outline is revolved about the vertical, so each apple is a solid
      // of revolution with a real surface to light.
      var N = 5, AR = Math.min(h * 0.30, w * 0.055);
      for (var q1 = 0; q1 < N; q1++) {
        var ax1 = w * (0.14 + q1 * 0.18);
        for (var o1 = 0; o1 < 150; o1++) {
          // polar outline with a dimple at the top and shoulders at the sides
          var an = (o1 / 150) * 6.283;
          var sn = Math.sin(an), cs = Math.cos(an);
          var rr1 = 1;
          rr1 *= 1 - 0.30 * Math.pow(Math.max(0, sn), 6);      // the dip under the stem
          rr1 *= 1 - 0.08 * Math.pow(Math.max(0, -sn), 10);    // the slight flat underneath
          rr1 *= 1 + 0.11 * cs * cs;                           // wider than it is tall
          var jit = 0.965 + Math.random() * 0.07;
          pts.push({ sk: 'apple', ax: ax1, ar: AR, zt: (Math.random() - 0.5) * AR * 0.62,
                     dx: cs * rr1 * AR * 1.02 * jit, dy: -sn * rr1 * AR * jit,
                     ux: 0.14 + q1 * 0.18, acc: (o1 % 6 === 0) ? BRAT : null, band: q1 });
        }
        for (var st = 0; st < 16; st++) {                      // stem
          var sv = st / 16;
          pts.push({ sk: 'apple', ax: ax1, ar: AR, zt: (Math.random() - 0.5) * AR * 0.18,
                     dx: (0.03 + sv * 0.20) * AR, dy: -(1.00 + sv * 0.40) * AR,
                     ux: 0.14 + q1 * 0.18, acc: null, band: q1 });
        }
        for (var lf = 0; lf < 26; lf++) {                      // leaf
          var la = (lf / 26) * 6.283;
          pts.push({ sk: 'apple', ax: ax1, ar: AR, zt: Math.cos(la) * AR * 0.16,
                     dx: (0.40 + Math.cos(la) * 0.26) * AR,
                     dy: -(1.30 + Math.sin(la) * 0.13) * AR,
                     ux: 0.14 + q1 * 0.18, acc: BRAT, band: q1 });
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
          pts.push({ sk: 'ecg', u: uu, x: x, y: y, z0: -DZ * 0.18,
                     acc: (m2 % 5 === 0) ? BRAT : null, band: 0 });
        }
      }
      var S = h * 0.026;
      for (var hh = 0; hh < 340; hh++) {
        var th2 = (hh / 340) * 6.283, sc2 = 0.6 + 0.4 * Math.sqrt(Math.random());
        var hx = 16 * Math.pow(Math.sin(th2), 3);
        var hy = -(13 * Math.cos(th2) - 5 * Math.cos(2 * th2) - 2 * Math.cos(3 * th2) - Math.cos(4 * th2));
        // v2: swept into a lobed solid rather than a flat cut-out
        var thick = 7.5 * Math.sqrt(Math.max(0.04, 1 - Math.pow(Math.abs(hy) / 17, 2)));
        pts.push({ sk: 'heart', hx: hx * S * sc2,
                   hy: hy * S * sc2, hz: (Math.random() * 2 - 1) * S * sc2 * thick,
                   acc: (hh % 6 === 0) ? BRAT : null, band: 1 });
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
    var pts = [], px = [], py = [], pz = [], seed = [], W = 0, H = 0;

    function build() {
      var r = host.getBoundingClientRect(); if (!r.width) return;
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      var gr = host.parentElement.querySelector('[data-pb-glass]').getBoundingClientRect();
      glassMask(glass, title, gr.width || W, gr.height || H);
      pts = shapePoints(kind, W, H);
      px = new Float32Array(pts.length); py = new Float32Array(pts.length);
      pz = new Float32Array(pts.length); seed = new Float32Array(pts.length);
      for (var i = 0; i < pts.length; i++) {
        // assemble from a loose scatter around the banner
        px[i] = W * 0.5 + (Math.random() - 0.5) * W * 1.3;
        py[i] = H * 0.5 + (Math.random() - 0.5) * H * 2.4;
        pz[i] = (Math.random() - 0.5) * H * 2.2;
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
      } else if (kind === 'apples') {
        ph = (t * 0.20) % 1.45;   // the pulse walking the row, with a breath at the end
      } else if (kind === 'mark') {
        ph = (t * 0.15) % 1.65;   // marks land over 0..1, hold, then fade and reset
      } else if (kind === 'teach') {
        ph = (t * 0.30) % 1;                        // the wavefront sweeping left to right
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      /* v2 · the stage. One perspective divide for every formation; a lambert
         term only where the case below hands back a normal. */
      var FOV = W * 0.90, DZ = H * 0.80;
      var LIT = 0.70, LGX = -0.3195, LGY = -0.4593, LGZ = -0.8288;   /* front, upper-left */
      for (var i = 0; i < pts.length; i++) {
        var P = pts[i], bx, by, bz = 0, g = 0, d, am = 1;
        var nx = 0, ny = 0, nz = 0;          /* 0,0,0 = flat, no lighting */
        switch (P.sk) {
          case 'ring': {
            var th = P.th + act * t * 0.2 * P.dir;
            var ct = Math.cos(P.tilt), stl = Math.sin(P.tilt);
            var ryl = Math.sin(th) * P.ry;
            bx = P.cx + Math.cos(th) * P.rx; by = H * 0.5 + ryl * ct; bz = ryl * stl * 1.15;
            nx = Math.cos(th); ny = Math.sin(th) * ct; nz = Math.sin(th) * stl;
            g = act * Math.pow(0.5 + 0.5 * Math.sin(th - t * 1.3 + P.band * 2.1), 10);
            break;
          }
          case 'orb': {
            var a2 = P.a + act * t * (0.35 + P.band * 0.06) * (P.band % 2 ? -1 : 1);
            var rr2 = P.rr * (1 + act * 0.13 * Math.sin(t * 1.5 + P.band * 1.7 + P.a * 3));
            var sp1 = Math.sin(P.pa), cp1 = Math.cos(P.pa);
            bx = P.ox + sp1 * Math.cos(a2) * rr2; by = H * 0.5 + cp1 * rr2 * 0.9;
            bz = sp1 * Math.sin(a2) * rr2;
            nx = sp1 * Math.cos(a2); ny = cp1; nz = sp1 * Math.sin(a2);
            d = P.ox / W - ph; g = act * Math.exp(-d * d / 0.006);
            break;
          }
          case 'wave': {
            bx = W * 0.10 + P.u * W * 0.80;
            by = H * 0.5 + Math.sin(P.u * 9.4 - act * t * 2.2) * H * (0.05 + act * 0.03);
            bz = P.zf * (0.6 + 0.4 * Math.sin(act * t * 0.9 + P.u * 6.0));
            d = P.u - ph; g = act * Math.exp(-d * d / 0.004);
            break;
          }
          case 'bar': {
            var bh2 = P.bh * (1 + act * 0.09 * Math.sin(t * 1.6 + P.band * 1.15));
            bx = P.bx; by = H * 0.92 - P.yf * bh2; bz = P.z0;
            if (P.yf > 0.85) g = act * 0.55 * Math.max(0, Math.sin(t * 1.6 + P.band * 1.15));
            break;
          }
          case 'trend': {
            d = P.u - ph; g = act * Math.exp(-d * d / 0.0025);
            bx = P.x; by = P.y - g * H * 0.05; bz = P.z0;
            break;
          }
          case 'cmp': {
            /* four rules, four ways of being alive — that IS the argument */
            if (P.rule === 0) {                       // graph: a pulse runs the tree
              var gb = 1 + act * 0.035 * Math.sin(t * 0.9 + P.u * 6.283);
              bx = P.ccx + P.x0 * gb; by = H * 0.5 + P.y0 * gb; bz = P.z0 * gb;
              d = P.u - ((t * 0.34) % 1); g = act * Math.exp(-d * d / 0.004) * 0.95;
              am = 1.00;
            } else if (P.rule === 1) {                // lattice: the whole block steps as one
              var stp = Math.round(Math.sin(act * t * 0.55) * 3) / 3;
              bx = P.ccx + P.x0 + stp * W * 0.006; by = H * 0.5 + P.y0; bz = P.z0;
              am = 0.86; g = 0;
            } else if (P.rule === 2) {                // orbital: eccentric, never repeating
              var oa = P.a + act * t * 0.55;
              var oc = Math.cos(P.orb), os = Math.sin(P.orb);
              var oxx = Math.cos(oa) * P.orx, oyy = Math.sin(oa) * P.ory;
              bx = P.ccx + (oxx * oc - oyy * os);
              by = H * 0.5 + (oxx * os + oyy * oc) * 0.72;
              bz = Math.sin(oa * 0.5) * DZ * 0.45;
              am = 0.86;
            } else {                                  // strands: parallel, one band out of step
              var su = (P.u + act * t * 0.10 + P.skew) % 1;
              bx = P.ccx + P.x0 + Math.sin(su * 6.283) * W * 0.004;
              by = H * 0.5 + (su - 0.5) * H * 0.80;
              bz = P.z0;
              am = 0.86;
            }
            break;
          }
          case 'tsrc': {
            var sa2 = P.a + act * t * 0.5;
            var srr = P.rr * (1 + act * 0.18 * Math.sin(t * 2.2));
            var sps = Math.sin(P.pa), cps = Math.cos(P.pa);
            bx = P.sx + sps * Math.cos(sa2) * srr; by = H * 0.5 + cps * srr;
            bz = sps * Math.sin(sa2) * srr;
            nx = sps * Math.cos(sa2); ny = cps; nz = sps * Math.sin(sa2);
            g = act * Math.max(0, 1 - ph * 6) * 0.7;   // flares as it lets each wave go
            break;
          }
          case 'arc': {
            var rf = (P.u + act * t * 0.30) % 1;
            bx = P.sx + Math.cos(P.th) * rf * P.maxR;
            by = H * 0.5 + Math.sin(P.th) * rf * P.maxR * 0.42;
            bz = P.pz * rf * P.maxR * 0.30;
            g = act * Math.exp(-Math.pow(rf - ph, 2) / 0.004) * 0.8;
            break;
          }
          case 'tstud': {
            d = P.ux - ph;
            var lit = act * Math.exp(-d * d / 0.006);   // the moment it lands
            var ta = P.a + act * t * 0.28 * (P.band % 2 ? -1 : 1);
            var trr = P.rr * (1 + act * 0.10 * Math.sin(t * 1.4 + P.band) + lit * 0.22);
            var spt = Math.sin(P.pa), cpt = Math.cos(P.pa);
            bx = P.ox + spt * Math.cos(ta) * trr; by = H * 0.5 + cpt * trr * 0.92;
            bz = spt * Math.sin(ta) * trr;
            nx = spt * Math.cos(ta); ny = cpt; nz = spt * Math.sin(ta);
            g = lit;
            break;
          }
          case 'line': {
            var lm = act * Math.max(0, Math.min(1, (ph - P.u) * 6));
            bx = P.lx; by = H * P.ly; bz = P.z0;
            am = 0.55 + 0.45 * lm;
            g = lm * 0.08;
            break;
          }
          case 'tick': {
            var tm = act * Math.max(0, Math.min(1, (ph - P.u) * 4.5));
            tm = tm * tm * (3 - 2 * tm);                 // the tick draws itself on
            var tsc = 0.10 + 0.90 * tm;
            bx = P.tx + P.dx * tsc; by = H * P.ty + P.dy * tsc; bz = P.z0;
            am = tm * (ph > 1.35 ? Math.max(0, 1 - (ph - 1.35) / 0.22) : 1);
            g = tm * 0.42;
            break;
          }
          case 'score': {
            var fl = act * Math.max(0, Math.min(1, ph));
            var sth = P.th - 1.5708;
            bx = P.cx + Math.cos(sth) * P.rad;
            by = H * 0.5 + Math.sin(sth) * P.rad * 0.88;
            bz = Math.sin(sth) * P.rad * 0.48;
            nx = Math.cos(sth); ny = Math.sin(sth) * 0.88; nz = Math.sin(sth) * 0.48;
            if (P.fill) {
              var lit2 = P.uf < fl ? 1 : 0;
              am = lit2 * (ph > 1.35 ? Math.max(0, 1 - (ph - 1.35) / 0.22) : 1);
              g = lit2 * 0.22 * Math.exp(-Math.pow(P.uf - fl, 2) / 0.0008) + lit2 * 0.10;
            } else {
              am = 0.42;                                  // the empty track behind the score
            }
            break;
          }
          case 'apple': {
            d = P.ux - ph;
            var hit = act * Math.exp(-d * d / 0.0055);      // the moment the pulse arrives
            var lift = hit * P.ar * 0.16;
            var swell = 1 + act * 0.012 * Math.sin(t * 1.1 + P.band * 1.6) + hit * 0.07;
            /* the outline is what makes an apple an apple — it is kept exactly as
               it was and given thickness in z, never revolved away */
            bx = P.ax + P.dx * swell;
            by = H * 0.52 + P.dy * swell - lift;
            bz = P.zt * swell;
            nx = P.dx; ny = P.dy * 0.80; nz = P.zt * 2.2;
            g = hit * 0.85;
            am = 0.72 + hit * 0.28;
            break;
          }
          case 'ecg': {
            d = P.u - ph; g = act * Math.exp(-d * d / 0.0022);
            bx = P.x; by = P.y - g * H * 0.06; bz = P.z0;
            break;
          }
          default: { // heart
            var s2 = 1 + act * 0.16 * beat;
            bx = W * 0.5 + P.hx * s2; by = H * 0.48 + P.hy * s2; bz = P.hz * s2;
            nx = P.hx; ny = P.hy * 0.7; nz = P.hz * 1.8;
            g = act * beat * 0.8;
          }
        }
        var tx = bx + Math.sin(t * 0.6 + i * 1.7) * 2.4 + Math.sin(t * 0.23 + P.band * 2.1) * W * 0.005;
        var ty = by + Math.cos(t * 0.5 + i * 0.9) * 2.2;
        if (!reduce) {
          px[i] += (tx - px[i]) * 0.06; py[i] += (ty - py[i]) * 0.06; pz[i] += (bz - pz[i]) * 0.06;
        } else { px[i] = tx; py[i] = ty; pz[i] = bz; }
        /* perspective divide about the banner centre */
        var pc = FOV / (FOV + pz[i]);
        var sx = W * 0.5 + (px[i] - W * 0.5) * pc;
        var sy = H * 0.5 + (py[i] - H * 0.5) * pc;
        var dep = (pc - 0.84) / 0.40; dep = dep < 0 ? 0 : (dep > 1 ? 1 : dep);
        /* the one added term — only where the case handed back a normal */
        var shade = 1;
        if (nx !== 0 || ny !== 0 || nz !== 0) {
          var nl = Math.sqrt(nx * nx + ny * ny + nz * nz);
          if (nl > 1e-6) {
            var lam = (nx * LGX + ny * LGY + nz * LGZ) / nl; if (lam < 0) lam = 0;
            shade = 1 + LIT * (lam * 1.75 - 0.44);   /* mean lam on a sphere is 0.25 — this centres on 1 */
            shade = shade < 0.20 ? 0.20 : (shade > 1.70 ? 1.70 : shade);
          }
        }
        var c = P.acc || WARM;
        var tw2 = 0.55 + 0.45 * Math.sin(t * 1.4 + seed[i] * 6.283);
        var al = (P.acc ? 0.62 : 0.38) * am * (0.6 + 0.4 * tw2) * (1 + 0.9 * g);
        al *= (0.80 + 0.42 * dep) * shade;
        if (al > 0.95) al = 0.95;
        var cr = c.r, cg = c.g, cb = c.b;
        if (g > 0.03) { cr += (255 - cr) * g * 0.5 | 0; cg += (255 - cg) * g * 0.5 | 0; cb += (255 - cb) * g * 0.5 | 0; }
        ctx.fillStyle = 'rgba(' + (cr | 0) + ',' + (cg | 0) + ',' + (cb | 0) + ',' + al.toFixed(3) + ')';
        var sz = (P.acc ? 2.3 : 1.7) * (1 + 0.8 * g) * (0.82 + 0.38 * dep) * (shade !== 1 ? (0.86 + 0.16 * shade) : 1);
        ctx.fillRect(sx - sz / 2, sy - sz / 2, sz, sz);
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
