// <knowhere-footer> — global scroll-driven outro. Particles assemble the word
// "nowhere"; brat-green particles then sweep in to build the leading "k"
// (nowhere → knowhere); finally every particle turns brat green. Lockup +
// single CTA fade in beneath the word. Self-contained web component.
// v18: small-text greys lifted to #8C8B87 (contrast ruling, Cat 15 Aug).
// v17: hidden outro CTA is visibility-gated (keyboard a11y).
// v16: nav CTA answers the headline (let&#39;s go, a Cat-ruled exception to
// the universal CTA); microcopy in eyebrow mono. v15: goo CTA fully self-contained (inline styles + own filter def + own
// driver) — dc-runtime import scope breaks external class CSS. v14: outro CTA cascade — "you're one letter away." + goo CTA + fineprint fade
// in beneath the lockup once it lands (time-driven, no extra scroll). Requires
// knowhere-goo.js on the page; degrades to unstyled link without it.
(function () {
  if (customElements.get('knowhere-footer')) return;
  var BRAT = [123, 234, 90], WARM = [237, 236, 230];

  class KnowhereFooter extends HTMLElement {
    connectedCallback() {
      if (this._built) return; this._built = true;
      this.style.cssText = 'display:block;position:relative;background:#070708;';
      this.innerHTML =
        '<div data-kf-outro style="position:relative;height:140vh">' +
        '<div data-kf-stick style="position:relative;height:100vh;will-change:transform;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;text-align:center;padding:80px 24px 9vh;overflow:hidden">' +
          '<canvas data-kf-cv style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none"></canvas>' +
          '<div data-kf-lockup style="position:absolute;left:0;right:0;top:calc(40vh + 132px);display:flex;justify-content:center;opacity:0;transform:translateY(22px);font-family:\'Geist\',system-ui,sans-serif">' +
            '<div style="font-size:clamp(18px,2.6vw,34px);font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:#6B6A66;white-space:nowrap">From nowhere <span style="color:#7BEA5A">to knowing.</span></div>' +
          '</div>' +
          '<div data-kf-cta style="position:absolute;left:0;right:0;top:calc(40vh + 132px + clamp(44px,7vh,76px));display:flex;flex-direction:column;align-items:center;gap:16px;opacity:0;transform:translateY(24px);pointer-events:none;font-family:\'Geist\',system-ui,sans-serif">' +
            '<div style="font-size:15px;font-weight:600;letter-spacing:-0.01em;color:#9b9a96">you&#39;re one letter away.</div>' +
            '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="kf-goo-filter" x="-50%" y="-50%" width="200%" height="200%"><feComponentTransfer><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer><feGaussianBlur stdDeviation="5"/><feComponentTransfer><feFuncA type="table" tableValues="-5 11"/></feComponentTransfer></filter></svg>' +
            '<a data-kf-goo href="pricing.html" style="--gx:50;--gy:32;position:relative;isolation:isolate;display:inline-flex;align-items:center;justify-content:center;font-family:inherit;font-size:clamp(19px,2.2vw,24px);font-weight:650;letter-spacing:-0.01em;line-height:1;color:#0a1f06;text-decoration:none;text-transform:lowercase;padding:1.5em 2.4em;transform:scale(.94);transition:transform .9s cubic-bezier(.3,1.4,.5,1)">' +
              '<span data-kf-goo-fx style="position:absolute;inset:0;z-index:-1;padding:20px;pointer-events:none;filter:blur(10px) url(#kf-goo-filter) drop-shadow(0 .25em .5em rgba(0,0,0,.5));background-image:linear-gradient(0deg,#7BEA5A,#7BEA5A),radial-gradient(40% 70% at calc(var(--gx)*1%) calc(var(--gy)*1%),hsl(106 90% 82%) 0%,transparent 90%);background-clip:content-box,border-box"></span>' +
              '<span style="position:relative">start knowing</span>' +
            '</a>' +
            '<div style="font-family:ui-monospace,monospace;font-size:11.5px;font-weight:600;letter-spacing:.26em;text-transform:uppercase;color:#8C8B87">free for 7 days</div>' +
          '</div>' +
        '</div>' +
        '</div>' +
        '<knowhere-footer-nav></knowhere-footer-nav>';
      this._outro = this.querySelector('[data-kf-outro]');
      this._cv = this.querySelector('[data-kf-cv]');
      this._lockup = this.querySelector('[data-kf-lockup]');
      this._cta = this.querySelector('[data-kf-cta]');
      // self-contained goo driver (dc-runtime import scope half-applies external
      // class CSS — inline styles + own filter def render reliably; see v14/v15 saga)
      this._goo = this.querySelector('[data-kf-goo]');
      this._gooFx = this.querySelector('[data-kf-goo-fx]');
      this._gooPh = Math.random() * 10;
      this._gooHover = false;
      var gooReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (this._goo && !gooReduce) {
        var self = this;
        var setXY = function (x, y) {
          self._gooFx.style.setProperty('--gx', x);
          self._gooFx.style.setProperty('--gy', y);
        };
        var followPtr = function (e) {
          var r = self._goo.getBoundingClientRect();
          setXY(((e.clientX - r.x) / r.width) * 100, ((e.clientY - r.y) / r.height) * 100);
        };
        this._goo.addEventListener('pointerenter', function (e) {
          self._gooHover = true;
          self._goo.style.transform = 'scale(1)';
          if (e.pointerType === 'mouse') followPtr(e);
        });
        this._goo.addEventListener('pointermove', function (e) {
          if (e.pointerType === 'mouse') followPtr(e);
        });
        this._goo.addEventListener('pointerleave', function () {
          self._gooHover = false;
          self._goo.style.transform = 'scale(.94)';
        });
        this._goo.addEventListener('pointerdown', function (e) {
          self._gooHover = true; followPtr(e);
          self._goo.style.transform = 'scale(.97)';
        });
        ['pointerup', 'pointercancel'].forEach(function (ev) {
          self._goo.addEventListener(ev, function (e) {
            self._goo.style.transform = 'scale(1)';
            if (e.pointerType !== 'mouse') self._gooHover = false;
          });
        });
      }
      this._reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this._dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      this.N = 2200;
      this._resize = () => { this._targets = null; };
      window.addEventListener('resize', this._resize);
      var boot = () => this._start();
      if (document.fonts && document.fonts.load) {
        document.fonts.load('900 100px Geist').then(() => document.fonts.ready).then(boot).catch(boot);
      } else boot();
    }
    disconnectedCallback() {
      cancelAnimationFrame(this._raf);
      window.removeEventListener('resize', this._resize);
    }

    _build() {
      var vw = window.innerWidth, vh = window.innerHeight;
      var cv = this._cv;
      cv.width = Math.round(vw * this._dpr); cv.height = Math.round(vh * this._dpr);
      this._W = vw; this._H = vh;
      // sample "knowhere", split the k from the rest
      var W = 780, H = 150, mc = document.createElement('canvas'); mc.width = W; mc.height = H;
      var m = mc.getContext('2d');
      m.font = '900 132px Geist, system-ui, sans-serif'; m.textAlign = 'left'; m.textBaseline = 'middle';
      var full = m.measureText('knowhere').width, kw = m.measureText('k').width;
      var x0 = (W - full) / 2;
      m.fillStyle = '#fff'; m.fillText('knowhere', x0, H / 2 + 4);
      var data = m.getImageData(0, 0, W, H).data, kPts = [], nPts = [];
      var kEdge = x0 + kw * 0.96;
      for (var y = 0; y < H; y += 2) for (var x = 0; x < W; x += 2) {
        if (data[(y * W + x) * 4 + 3] > 128) (x < kEdge ? kPts : nPts).push([x, y]);
      }
      var scale = Math.min(vw * 0.82, 1050) / W;
      var cx = vw / 2, cy = vh * 0.40;
      var N = this.N;
      this._word = new Float32Array(N * 2);   // final position (k for greens, nowhere for whites)
      this._loose = new Float32Array(N * 2);  // start position (scatter / off-left for greens)
      this._green = new Uint8Array(N);
      this._seed = new Float32Array(N);
      for (var i = 0; i < N; i++) {
        var g = Math.random() < 0.16 ? 1 : 0;
        this._green[i] = g; this._seed[i] = Math.random();
        var p = g ? kPts[(i * 7) % kPts.length] : nPts[(i * 13) % nPts.length];
        this._word[i * 2] = cx + (p[0] - W / 2) * scale + (Math.random() - 0.5) * 1.6;
        this._word[i * 2 + 1] = cy + (p[1] - H / 2) * scale + (Math.random() - 0.5) * 1.6;
        if (g) { // brat particles wait off-screen left, then sweep in
          this._loose[i * 2] = -vw * (0.08 + Math.random() * 0.22);
          this._loose[i * 2 + 1] = vh * (0.05 + Math.random() * 0.75);
        } else { // whites assemble from a broad scatter
          this._loose[i * 2] = cx + (Math.random() - 0.5) * vw * 1.25;
          this._loose[i * 2 + 1] = cy + (Math.random() - 0.5) * vh * 1.1;
        }
      }
      if (!this._px || this._px.length !== N * 2) {
        this._px = new Float32Array(this._loose);
      }
      this._targets = true;
    }

    _start() {
      this._t0 = performance.now(); this._last = 0;
      var loop = (now) => {
        this._raf = requestAnimationFrame(loop);
        if (now - this._last < 28) return; this._last = now;
        this._frame(now);
      };
      this._raf = requestAnimationFrame(loop);
    }

    _frame(now) {
      var vh = window.innerHeight;
      var r = this._outro.getBoundingClientRect();
      // JS sticky: ancestor overflow-x:hidden breaks CSS position:sticky, so pin manually
      var stick = this._stick || (this._stick = this.querySelector('[data-kf-stick]'));
      if (stick) {
        var yOff = Math.max(0, Math.min(-r.top, r.height - vh));
        stick.style.transform = 'translateY(' + yOff.toFixed(1) + 'px)';
      }
      if (r.bottom < -60 || r.top > vh + 60) return;
      if (!this._targets) this._build();
      var cv = this._cv, ctx = cv.getContext('2d');
      var t = (now - this._t0) / 1000;
      // progress through the tall section
      var p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - vh)));
      var sm = (v) => { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); };
      var form = sm(p / 0.12);                 // whites → "nowhere"
      var kIn = sm((p - 0.16) / 0.22);         // greens sweep in → "k"
      var greenAll = sm((p - 0.42) / 0.22);    // everything turns brat
      if (this._reduce) { form = 1; kIn = 1; greenAll = p > 0.4 ? 1 : 0; }
      ctx.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
      ctx.clearRect(0, 0, this._W, this._H);
      ctx.globalCompositeOperation = 'lighter';
      var N = this.N;
      for (var i = 0; i < N; i++) {
        var g = this._green[i], s = this._seed[i];
        var d = s * 0.4;
        var w = g ? Math.max(0, Math.min(1, (kIn - d) / 0.6)) : Math.max(0, Math.min(1, (form - d) / 0.6));
        var e = w * w * (3 - 2 * w);
        var i2 = i * 2;
        var tx = this._loose[i2] + (this._word[i2] - this._loose[i2]) * e + Math.sin(t * 0.7 + i * 1.3) * 2.2;
        var ty = this._loose[i2 + 1] + (this._word[i2 + 1] - this._loose[i2 + 1]) * e + Math.cos(t * 0.6 + i * 0.7) * 2.2;
        if (this._reduce) { this._px[i2] = tx; this._px[i2 + 1] = ty; }
        else { this._px[i2] += (tx - this._px[i2]) * 0.075; this._px[i2 + 1] += (ty - this._px[i2 + 1]) * 0.075; }
        var x = this._px[i2], yv = this._px[i2 + 1];
        if (x < -8 || x > this._W + 8 || yv < -8 || yv > this._H + 8) continue;
        var cr, cg, cb, al;
        if (g) { cr = BRAT[0]; cg = BRAT[1]; cb = BRAT[2]; al = 0.55 + 0.42 * e; }
        else {
          cr = (WARM[0] + (BRAT[0] - WARM[0]) * greenAll) | 0;
          cg = (WARM[1] + (BRAT[1] - WARM[1]) * greenAll) | 0;
          cb = (WARM[2] + (BRAT[2] - WARM[2]) * greenAll) | 0;
          al = 0.38 + 0.38 * e + 0.24 * greenAll;
        }
        ctx.fillStyle = 'rgba(' + cr + ',' + cg + ',' + cb + ',' + al.toFixed(3) + ')';
        var sz = (g ? 1.8 : 1.4) + greenAll * 0.4;
        ctx.fillRect(x - sz / 2, yv - sz / 2, sz, sz);
      }
      ctx.globalCompositeOperation = 'source-over';
      // lockup fades in once the word has formed
      var lo = sm((p - 0.14) / 0.14);
      this._lockup.style.opacity = lo.toFixed(3);
      this._lockup.style.transform = 'translateY(' + ((1 - lo) * 22).toFixed(1) + 'px)';
      // CTA cascade — time-driven once the lockup lands, so no extra scroll is
      // needed. Resets if the user scrolls back above the lockup.
      if (this._cta) {
        if (lo >= 0.98) { if (!this._ctaT0) this._ctaT0 = now; }
        else if (lo < 0.5) { this._ctaT0 = 0; }
        var cp = 0;
        if (this._ctaT0) cp = this._reduce ? 1 : sm((now - this._ctaT0 - 240) / 720);
        this._cta.style.opacity = cp.toFixed(3);
        this._cta.style.transform = 'translateY(' + ((1 - cp) * 24).toFixed(1) + 'px)';
        this._cta.style.pointerEvents = cp > 0.6 ? 'auto' : 'none';
        this._cta.style.visibility = cp > 0.05 ? 'visible' : 'hidden'; // a11y: invisible CTA must not take keyboard focus
        // idle breathing — bulge drifts on its own so touch gets life too
        if (this._gooFx && !this._reduce && cp > 0.05 && !this._gooHover) {
          this._gooPh += 0.012;
          this._gooFx.style.setProperty('--gx', ((Math.cos(this._gooPh) + 1) / 2) * 64 + 18);
          this._gooFx.style.setProperty('--gy', ((Math.sin(this._gooPh * 1.7) + 1) / 2) * 64 + 18);
        }
      }
    }
  }
  customElements.define('knowhere-footer', KnowhereFooter);

  // <knowhere-footer-nav> — the global footer bookend: logo, gen-z tagline,
  // page links, legal row. Self-contained; usable on its own (landing page).
  if (!customElements.get('knowhere-footer-nav')) {
    class KnowhereFooterNav extends HTMLElement {
      connectedCallback() {
        this._onIndex = !!document.querySelector('[data-screen-label="IYKYK banner"]');
        this.style.cssText = this._onIndex ? 'display:block;' : 'display:block;background:#070708;';
        if (this._built) return; this._built = true;
        if (!document.getElementById('kfn-style')) {
          var st = document.createElement('style'); st.id = 'kfn-style';
          st.textContent =
            '@keyframes kfnSpectrum{0%{background-position:0% 50%}100%{background-position:200% 50%}}' +
            '.kfn-link{font-size:15px;font-weight:600;letter-spacing:-0.01em;color:#9b9a96;text-decoration:none;transition:color .16s}' +
            '.kfn-link:hover{color:#7BEA5A}' +
            '.kfn-legal{font-size:12px;color:#56554f;text-decoration:none;transition:color .16s}' +
            '.kfn-legal:hover{color:#8C8B87}';
          document.head.appendChild(st);
        }
        this.innerHTML =
          '<div style="position:relative;border-top:1px solid rgba(123,234,90,0.14);background:#070708;overflow:hidden;min-height:100vh;display:flex;flex-direction:column;font-family:\'Geist\',system-ui,sans-serif">' +
            '<canvas data-kfn-brain style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none"></canvas>' +
              '<div style="position:relative;z-index:1;max-width:1180px;margin:0 auto;padding:64px 34px 36px;width:100%;box-sizing:border-box;flex:1;display:flex;flex-direction:column">' +
              '<div style="display:flex;align-items:center;flex:1">' +
                '<div style="max-width:820px">' +
                  '<div style="font-size:11px;font-weight:700;letter-spacing:0.26em;text-transform:uppercase;color:#8C8B87;margin-bottom:18px">no gatekeeping. iykyk.</div>' +
                  '<div style="font-size:clamp(32px,4.4vw,58px);font-weight:800;letter-spacing:-0.045em;line-height:1.04;color:rgba(237,236,232,0.84);text-wrap:balance">ready to claim your <span style="background-image:linear-gradient(90deg,#7BEA5A,#23A4DD,#9B5AEA,#E8C63F,#7BEA5A);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:kfnSpectrum 7s linear infinite">unfair advantage</span>, or are we still pretending all-nighters work?</div>' +
                  '<div style="margin-top:30px"><a href="pricing.html" style="display:inline-flex;align-items:center;font-size:15px;font-weight:700;color:#070708;background:#7BEA5A;border-radius:12px;padding:15px 28px;text-decoration:none;letter-spacing:-0.01em;box-shadow:0 10px 40px rgba(123,234,90,.32)">let&#39;s go</a></div>' +
                '</div>' +
              '</div>' +
              '<div style="display:flex;align-items:center;gap:30px;flex-wrap:wrap;margin-top:auto;padding-top:12px">' +
                '<span style="display:flex;align-items:center;gap:10px;margin-right:14px"><span data-kfn-logo style="display:flex;align-items:center;color:#EDECE8"></span><span style="font-size:18px;font-weight:700;letter-spacing:-0.04em;color:#EDECE8">know<b style="color:#7BEA5A">here</b></span></span>' +
                '<a class="kfn-link" href="know-us.html">know us</a>' +
                '<a class="kfn-link" href="mission.html">mission</a>' +
                '<a class="kfn-link" href="talk-to-us.html">talk to us</a>' +
              '</div>' +
              '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:22px;padding-top:26px;border-top:1px solid rgba(255,255,255,0.06)">' +
                '<span class="kfn-legal" style="cursor:default">from nowhere to knowing.</span>' +
                '<span style="flex:1"></span>' +
                '<a class="kfn-legal" href="privacy.html">privacy</a>' +
                '<a class="kfn-legal" href="terms.html">terms of use</a>' +
                '<span class="kfn-legal" style="cursor:default">\u00A9 2026 knowhere</span>' +
              '</div>' +
            '</div>' +
          '</div>';
        var slot = this.querySelector('[data-kfn-logo]');
        var put = function () {
          if (window.KnowhereMarks && window.KnowhereMarks.logoSvg) { slot.innerHTML = window.KnowhereMarks.logoSvg(30, '#EDECE8'); }
          else setTimeout(put, 120);
        };
        if (this._onIndex) this.firstElementChild.style.background = 'transparent';
        put();
        this._startBrain();
      }
      disconnectedCallback() { cancelAnimationFrame(this._raf); cancelAnimationFrame(this._brainRaf); }

      _startBrain() {
        if (this._onIndex) return; // the index engine's own brain flows through
        const cv = this.querySelector('[data-kfn-brain]'); if (!cv) return;
        const ctx = cv.getContext('2d');
        const RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const N = 1300, P = new Float32Array(N * 3), C = [];
        let sd = 777; const rnd = () => { sd = (sd * 1103515245 + 12345) & 0x7fffffff; return sd / 0x7fffffff; };
        const SPEC = ['rgba(241,85,36,', 'rgba(252,184,21,', 'rgba(123,234,90,', 'rgba(35,164,221,', 'rgba(155,90,234,', 'rgba(236,21,89,'];
        const AT = []; // clump attractors give the blob its organic lumps
        for (let k = 0; k < 9; k++) {
          const th = rnd() * 6.283, ph = Math.acos(2 * rnd() - 1), r = 0.35 + rnd() * 0.55;
          AT.push([Math.sin(ph) * Math.cos(th) * r, Math.cos(ph) * r * 0.82, Math.sin(ph) * Math.sin(th) * r * 0.9]);
        }
        for (let i = 0; i < N; i++) {
          const th = rnd() * 6.283, ph = Math.acos(2 * rnd() - 1), r = Math.pow(rnd(), 0.42);
          let x = Math.sin(ph) * Math.cos(th) * r * 1.18;
          let y = Math.cos(ph) * r * 0.80;
          let z = Math.sin(ph) * Math.sin(th) * r * 0.95;
          if (y > 0.42) y = 0.42 + (y - 0.42) * 0.45;
          if (y < -0.1 && Math.abs(x) < 0.14) x += (x >= 0 ? 1 : -1) * 0.10;
          const a2 = AT[(rnd() * 9) | 0], pull = rnd() * 0.42;
          x += (a2[0] - x) * pull; y += (a2[1] - y) * pull; z += (a2[2] - z) * pull;
          P[i*3] = x; P[i*3+1] = y; P[i*3+2] = z;
          C.push(rnd() < 0.12 ? SPEC[(rnd() * 6) | 0] : 'rgba(214,216,212,');
        }
        const PATHS = [];
        for (let pk = 0; pk < 7; pk++) {
          let cur = (rnd() * N) | 0; const chain = [cur];
          for (let hop = 0; hop < 12; hop++) {
            let best = -1, bd = 1e9;
            for (let c2 = 0; c2 < 26; c2++) {
              const cand = (rnd() * N) | 0;
              const dx = P[cand*3] - P[cur*3], dy = P[cand*3+1] - P[cur*3+1], dz = P[cand*3+2] - P[cur*3+2];
              const dd = dx*dx + dy*dy + dz*dz;
              if (dd > 0.004 && dd < bd) { bd = dd; best = cand; }
            }
            if (best < 0) break;
            chain.push(best); cur = best;
          }
          PATHS.push({ idx: chain, sp: 3.2 + rnd() * 2.6, ph: rnd() * 20 });
        }
        const SX = new Float32Array(N), SY = new Float32Array(N), SV = new Uint8Array(N);
        let run = false, t0 = performance.now();
        const draw = (now) => {
          const w = this.clientWidth || 1, h = this.clientHeight || 1;
          const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
          if (cv.width !== ((w * dpr) | 0)) { cv.width = (w * dpr) | 0; cv.height = (h * dpr) | 0; }
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
          const t = (now - t0) / 1000, rot = Math.sin(t * 0.32) * 0.5;
          const cosR = Math.cos(rot), sinR = Math.sin(rot);
          const cx = w * 0.70, cy = h * 0.44, S = Math.min(w * 0.19, h * 0.32);
          for (let i = 0; i < N; i++) {
            const x = P[i*3] * S, y = P[i*3+1] * S, z = P[i*3+2] * S;
            const rx = x * cosR + z * sinR, rz = -x * sinR + z * cosR;
            const sc = 900 / (900 + rz);
            const sx = cx + rx * sc, sy = cy + y * sc + Math.sin(t * 0.7 + i) * 1.6;
            SX[i] = sx; SY[i] = sy; SV[i] = 1;
            const depth = Math.max(0, Math.min(1, (sc - 0.85) * 3));
            ctx.fillStyle = C[i] + (0.20 + depth * 0.58).toFixed(3) + ')';
            const r2 = 1.0 + depth * 1.7;
            ctx.fillRect(sx, sy, r2, r2);
          }
          ctx.globalCompositeOperation = 'lighter';
          for (const pth of PATHS) {
            const L = pth.idx.length;
            const sp = ((t * pth.sp + pth.ph) % (L + 5));
            for (let q = 0; q < L; q++) {
              const gl = Math.max(0, 1 - Math.abs(q - sp) / 2.4);
              const a3 = pth.idx[q];
              if (!SV[a3]) continue;
              if (q > 0 && SV[pth.idx[q-1]]) {
                const b3 = pth.idx[q-1];
                ctx.strokeStyle = 'rgba(123,234,90,' + (0.05 + gl * 0.30).toFixed(3) + ')';
                ctx.lineWidth = 0.7 + gl;
                ctx.beginPath(); ctx.moveTo(SX[b3], SY[b3]); ctx.lineTo(SX[a3], SY[a3]); ctx.stroke();
              }
              if (gl > 0.03) {
                ctx.fillStyle = 'rgba(160,244,120,' + (0.25 + gl * 0.6).toFixed(3) + ')';
                const gs = 1.6 + gl * 2.6;
                ctx.fillRect(SX[a3] - gs / 2, SY[a3] - gs / 2, gs, gs);
              }
            }
          }
          ctx.globalCompositeOperation = 'source-over';
          if (run) this._brainRaf = requestAnimationFrame(draw);
        };
        const io = new IntersectionObserver((es) => {
          if (RM) { draw(performance.now()); return; }
          if (es[0].isIntersecting && !run) { run = true; this._brainRaf = requestAnimationFrame(draw); }
          else if (!es[0].isIntersecting && run) { run = false; cancelAnimationFrame(this._brainRaf); }
        });
        io.observe(this);
      }
      _startMark() {
        var cv = this.querySelector('[data-kfn-mark]'); if (!cv) return;
        var self = this;
        var boot = function () {
          if (!window.KnowhereMarks || !window.KnowhereMarks.logoSvg) return setTimeout(boot, 120);
          var svg = window.KnowhereMarks.logoSvg(120, '#EDECE8');
          if (svg.indexOf('xmlns=') < 0) svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
          var img = new Image();
          img.onload = function () {
            var S = 120, mc = document.createElement('canvas'); mc.width = S; mc.height = S;
            var m = mc.getContext('2d');
            var ar = (img.naturalWidth && img.naturalHeight) ? img.naturalWidth / img.naturalHeight : 1;
            var dw = ar >= 1 ? S : S * ar, dh = ar >= 1 ? S / ar : S;
            m.drawImage(img, (S - dw) / 2, (S - dh) / 2, dw, dh);
            var data = m.getImageData(0, 0, S, S).data, pts = [];
            for (var y = 0; y < S; y += 3) for (var x = 0; x < S; x += 3) {
              if (data[(y * S + x) * 4 + 3] > 100) pts.push([x, y]);
            }
            self._runMark(cv, pts, S);
          };
          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
        };
        boot();
      }
      _runMark(cv, pts, S) {
        var dpr = Math.min(window.devicePixelRatio || 1, 2), D = 96;
        cv.width = D * dpr; cv.height = D * dpr;
        var ctx = cv.getContext('2d');
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var seed = pts.map(function () { return Math.random() * 6.283; });
        var last = 0, self = this;
        var loop = function (now) {
          self._raf = requestAnimationFrame(loop);
          if (now - last < 50) return; last = now;
          var r = cv.getBoundingClientRect();
          if (r.bottom < -40 || r.top > window.innerHeight + 40) return;
          var t = now / 1000;
          var breath = reduce ? 0 : Math.sin(t * 0.85);            // slow inhale/exhale
          var sc = (D / S) * (1 + 0.035 * breath);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, D, D);
          for (var i = 0; i < pts.length; i++) {
            var jx = reduce ? 0 : Math.sin(t * 0.7 + seed[i]) * 0.9;
            var jy = reduce ? 0 : Math.cos(t * 0.6 + seed[i] * 1.7) * 0.9;
            var x = D / 2 + (pts[i][0] - S / 2) * sc + jx;
            var y = D / 2 + (pts[i][1] - S / 2) * sc + jy;
            var tw = 0.55 + 0.45 * Math.sin(t * 1.1 + seed[i]);
            var al = 0.32 + 0.38 * tw + 0.12 * breath;
            var hue = ((t * 24 + seed[i] * 57.3) % 360 + 360) % 360;
            ctx.fillStyle = 'hsla(' + hue.toFixed(0) + ',85%,64%,' + al.toFixed(3) + ')';
            ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
          }
        };
        this._raf = requestAnimationFrame(loop);
      }
    }
    customElements.define('knowhere-footer-nav', KnowhereFooterNav);
  }
})();
