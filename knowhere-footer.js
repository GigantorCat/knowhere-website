// <knowhere-footer> — global scroll-driven outro. Particles assemble the word
// "nowhere"; brat-green particles then sweep in to build the leading "k"
// (nowhere → knowhere); finally every particle turns brat green. Lockup +
// single CTA fade in beneath the word. Self-contained web component.
(function () {
  if (customElements.get('knowhere-footer')) return;
  var BRAT = [123, 234, 90], WARM = [237, 236, 230];

  class KnowhereFooter extends HTMLElement {
    connectedCallback() {
      if (this._built) return; this._built = true;
      this.style.cssText = 'display:block;position:relative;';
      this.innerHTML =
        '<div data-kf-outro style="position:relative;height:175vh">' +
        '<div data-kf-stick style="position:relative;height:100vh;will-change:transform;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;text-align:center;padding:80px 24px 9vh;overflow:hidden">' +
          '<canvas data-kf-cv style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none"></canvas>' +
          '<div data-kf-lockup style="position:relative;opacity:0;transform:translateY(22px);font-family:\'Geist\',system-ui,sans-serif">' +
            '<div style="font-size:12px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:#6B6A66;margin-bottom:16px">From nowhere to knowing.</div>' +
            '<p style="font-size:16px;line-height:1.55;color:#9b9a96;margin:0 auto;max-width:42ch">You\u2019re one letter away. Take the two-minute learning-style quiz and watch your first concept come alive. Free to start \u2014 no card, no catch.</p>' +
            '<div style="margin-top:28px"><a href="pricing.html" style="display:inline-flex;align-items:center;font-size:15px;font-weight:700;color:#070708;background:#7BEA5A;border:none;border-radius:12px;padding:15px 28px;text-decoration:none;letter-spacing:-0.01em;box-shadow:0 10px 40px rgba(123,234,90,.32)">Start your free trial</a></div>' +
          '</div>' +
        '</div>' +
        '</div>' +
        '<knowhere-footer-nav></knowhere-footer-nav>';
      this._outro = this.querySelector('[data-kf-outro]');
      this._cv = this.querySelector('[data-kf-cv]');
      this._lockup = this.querySelector('[data-kf-lockup]');
      this._reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this._dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      this.N = 1500;
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
      var W = 520, H = 110, mc = document.createElement('canvas'); mc.width = W; mc.height = H;
      var m = mc.getContext('2d');
      m.font = '900 92px Geist, system-ui, sans-serif'; m.textAlign = 'left'; m.textBaseline = 'middle';
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
        this._word[i * 2] = cx + (p[0] - W / 2) * scale + (Math.random() - 0.5) * 3;
        this._word[i * 2 + 1] = cy + (p[1] - H / 2) * scale + (Math.random() - 0.5) * 3;
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
      var form = sm(p / 0.22);                 // whites → "nowhere"
      var kIn = sm((p - 0.30) / 0.26);         // greens sweep in → "k"
      var greenAll = sm((p - 0.60) / 0.24);    // everything turns brat
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
        if (g) { cr = BRAT[0]; cg = BRAT[1]; cb = BRAT[2]; al = 0.5 + 0.4 * e; }
        else {
          cr = (WARM[0] + (BRAT[0] - WARM[0]) * greenAll) | 0;
          cg = (WARM[1] + (BRAT[1] - WARM[1]) * greenAll) | 0;
          cb = (WARM[2] + (BRAT[2] - WARM[2]) * greenAll) | 0;
          al = 0.34 + 0.34 * e + 0.18 * greenAll;
        }
        ctx.fillStyle = 'rgba(' + cr + ',' + cg + ',' + cb + ',' + al.toFixed(3) + ')';
        var sz = (g ? 1.7 : 1.25) + greenAll * 0.4;
        ctx.fillRect(x - sz / 2, yv - sz / 2, sz, sz);
      }
      ctx.globalCompositeOperation = 'source-over';
      // lockup fades in once the word has formed
      var lo = sm((p - 0.22) / 0.16);
      this._lockup.style.opacity = lo.toFixed(3);
      this._lockup.style.transform = 'translateY(' + ((1 - lo) * 22).toFixed(1) + 'px)';
    }
  }
  customElements.define('knowhere-footer', KnowhereFooter);

  // <knowhere-footer-nav> — the global footer bookend: logo, gen-z tagline,
  // page links, legal row. Self-contained; usable on its own (landing page).
  if (!customElements.get('knowhere-footer-nav')) {
    class KnowhereFooterNav extends HTMLElement {
      connectedCallback() {
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
          '<div style="position:relative;border-top:1px solid rgba(123,234,90,0.14);background:radial-gradient(90% 130% at 50% 118%,rgba(123,234,90,0.10),rgba(7,7,8,0) 60%),#070708;overflow:hidden;font-family:\'Geist\',system-ui,sans-serif">' +
            '<div style="max-width:1180px;margin:0 auto;padding:84px 34px 36px">' +
              '<div style="display:flex;gap:48px;align-items:flex-end;justify-content:space-between;flex-wrap:wrap">' +
                '<div style="max-width:640px">' +
                  '<div style="font-size:11px;font-weight:700;letter-spacing:0.26em;text-transform:uppercase;color:#6B6A66;margin-bottom:18px">no gatekeeping. iykyk.</div>' +
                  '<div style="font-size:clamp(32px,4.4vw,58px);font-weight:800;letter-spacing:-0.045em;line-height:1.04;color:#EDECE8;text-wrap:balance">ready to claim your <span style="background-image:linear-gradient(90deg,#7BEA5A,#23A4DD,#9B5AEA,#E8C63F,#7BEA5A);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:kfnSpectrum 7s linear infinite">unfair advantage</span>, or are we still pretending all-nighters work?</div>' +
                '</div>' +
                '<div style="display:flex;flex-direction:column;gap:14px;align-items:flex-start;padding-bottom:6px">' +
                  '<canvas data-kfn-mark width="1" height="1" style="display:block;width:96px;height:96px;margin:0 0 14px -8px"></canvas>' +
                  '<a class="kfn-link" href="know-us.html">know us</a>' +
                  '<a class="kfn-link" href="mission.html">mission</a>' +
                  '<a class="kfn-link" href="talk-to-us.html">talk to us</a>' +
                '</div>' +
              '</div>' +
              '<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:70px;padding-top:26px;border-top:1px solid rgba(255,255,255,0.06)">' +
                '<span data-kfn-logo style="display:flex;align-items:center;color:#8C8B87"></span>' +
                '<span style="font-size:14px;font-weight:700;letter-spacing:-0.04em;color:#9b9a96">know<b>here</b></span>' +
                '<span style="flex:1"></span>' +
                '<a class="kfn-legal" href="privacy.html">privacy</a>' +
                '<a class="kfn-legal" href="terms.html">terms of use</a>' +
                '<span class="kfn-legal" style="cursor:default">\u00A9 2026 knowhere</span>' +
              '</div>' +
            '</div>' +
          '</div>';
        var slot = this.querySelector('[data-kfn-logo]');
        var put = function () {
          if (window.KnowhereMarks && window.KnowhereMarks.logoSvg) { slot.innerHTML = window.KnowhereMarks.logoSvg(22, '#8C8B87'); }
          else setTimeout(put, 120);
        };
        put();
        this._startMark();
      }
      disconnectedCallback() { cancelAnimationFrame(this._raf); }
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
