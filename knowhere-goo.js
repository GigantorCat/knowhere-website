// knowhere-goo.js v6 — the goo CTA. Self-contained: injects styles + the SVG
// goo filter into EVERY reachable root (top document, open shadow roots,
// same-origin iframes — dc-runtime x-imports live in their own scope), and
// drives all .kw-goo elements from one global engine. Brat locked — no hue
// cycling; purple stays in the neuro layer. The goo lives on ::before; the
// label never wobbles. Idle: breathes. Mouse: chases pointer. Press: surges.
// Safari kill switch: class kw-goo--flat => solid brat pill, zero filters.
// Diagnostics: console banner on boot; window.KnowhereGoo.status() any time.
(function () {
  if (window.KnowhereGoo) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- styles ---------- */
  var CSS =
    '@property --kw-ga { syntax: "<percentage>"; initial-value: 0%; inherits: true; }' +
    ':root,:host{--kw-goo-spring:linear(0,0.002,0.01 0.9%,0.038 1.8%,0.156,0.312 5.8%,0.789 11.1%,1.015 14.2%,1.096,1.157,1.199,1.224 20.3%,1.231,1.231,1.226,1.214 24.6%,1.176 26.9%,1.057 32.6%,1.007 35.5%,0.984,0.968,0.956,0.949 42%,0.946 44.1%,0.95 46.5%,0.998 57.2%,1.007,1.011 63.3%,1.012 68.3%,0.998 84%,1);}' +
    '.kw-goo{--kw-ga:100%;--kw-gx:50;--kw-gy:32;' +
      'appearance:none;border:0;background:transparent;cursor:pointer;' +
      'position:relative;isolation:isolate;display:inline-flex;align-items:center;justify-content:center;' +
      'font-family:inherit;font-size:clamp(1.5rem,4vw,2rem);font-weight:650;letter-spacing:-0.01em;line-height:1;' +
      'color:#0a1f06 !important;text-decoration:none !important;text-transform:lowercase;padding:1.5em 2.4em;' +
      'scale:.94;transition:--kw-ga .5s ease-in-out,scale 1.66s var(--kw-goo-spring);}' +
    '.kw-goo::before{content:"";position:absolute;inset:0;z-index:-1;padding:24px;border-radius:20px;' +
      'filter:blur(12px) url(#kw-goo-filter) drop-shadow(0 .25em .6em rgba(0,0,0,.55));' +
      'background-image:linear-gradient(0deg,#7BEA5A,#7BEA5A),' +
      'radial-gradient(40% 70% at calc(var(--kw-gx)*1%) calc(var(--kw-gy)*1%),hsl(106 90% 82%/var(--kw-ga)) 0%,transparent 90%);' +
      'background-clip:content-box,border-box;}' +
    '.kw-goo:hover,.kw-goo.kw-goo-pressed{scale:1;transition-duration:.5s,1s;}' +
    '.kw-goo:active{scale:.97;transition:scale .15s ease-out;}' +
    '.kw-goo:focus-visible{outline:2px solid #7BEA5A;outline-offset:10px;border-radius:20px;}' +
    /* medium — outro / in-flow contexts. The approved demo at ~85% scale:
       same em ratios; overreach ring + blur scaled with the button. */
    '.kw-goo--m{font-size:clamp(19px,2.2vw,24px);padding:1.5em 2.4em;}' +
    '.kw-goo--m::before{padding:20px;filter:blur(10px) url(#kw-goo-filter) drop-shadow(0 .25em .5em rgba(0,0,0,.5));}' +
    /* flat fallback — solid brat pill, zero filters */
    '.kw-goo--flat::before{filter:none;padding:0;border-radius:999px;' +
      'background-image:linear-gradient(0deg,#7BEA5A,#7BEA5A);background-clip:border-box;}' +
    '@media (prefers-reduced-motion: reduce){.kw-goo{scale:1;transition:none;--kw-ga:0%;}}';

  var FILTER_SVG =
    '<svg width="0" height="0">' +
    '<filter id="kw-goo-filter" x="-50%" y="-50%" width="200%" height="200%">' +
    '<feComponentTransfer><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer>' +
    '<feGaussianBlur stdDeviation="5"/>' +
    '<feComponentTransfer><feFuncA type="table" tableValues="-5 11"/></feComponentTransfer>' +
    '</filter></svg>';

  /* ---------- root discovery: document + open shadow roots + same-origin iframes ---------- */
  function collectRoots() {
    var roots = [], docs = [document], seen = [];
    function addShadows(root) {
      var all;
      try { all = root.querySelectorAll('*'); } catch (err) { return; }
      for (var i = 0; i < all.length; i++) {
        if (all[i].shadowRoot && seen.indexOf(all[i].shadowRoot) < 0) {
          seen.push(all[i].shadowRoot);
          roots.push({ root: all[i].shadowRoot, doc: root.ownerDocument || root, shadow: true });
          addShadows(all[i].shadowRoot);
        }
      }
    }
    // same-origin iframes (dc-runtime x-imports may render in frames)
    var frames = document.querySelectorAll('iframe');
    for (var f = 0; f < frames.length; f++) {
      try {
        var d = frames[f].contentDocument;
        if (d && docs.indexOf(d) < 0) docs.push(d);
      } catch (err) { /* cross-origin — not ours */ }
    }
    for (var k = 0; k < docs.length; k++) {
      roots.push({ root: docs[k], doc: docs[k], shadow: false });
      addShadows(docs[k]);
    }
    return roots;
  }

  function equipRoot(entry) {
    var root = entry.root, doc = entry.doc;
    if (entry.shadow) {
      if (!root.querySelector('style[data-kw-goo]')) {
        var st = doc.createElement('style');
        st.setAttribute('data-kw-goo', '1');
        st.textContent = CSS;
        root.appendChild(st);
        var host = doc.createElement('div');
        host.setAttribute('aria-hidden', 'true');
        host.setAttribute('data-kw-goo-filter', '1');
        host.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
        host.innerHTML = FILTER_SVG;
        root.appendChild(host);
      }
    } else {
      if (doc.head && !doc.head.querySelector('style[data-kw-goo]')) {
        var st2 = doc.createElement('style');
        st2.setAttribute('data-kw-goo', '1');
        st2.textContent = CSS;
        doc.head.appendChild(st2);
      }
      if (doc.body && !doc.body.querySelector('[data-kw-goo-filter]')) {
        var host2 = doc.createElement('div');
        host2.setAttribute('aria-hidden', 'true');
        host2.setAttribute('data-kw-goo-filter', '1');
        host2.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
        host2.innerHTML = FILTER_SVG;
        doc.body.appendChild(host2);
      }
      if (!doc._kwGooWired) { doc._kwGooWired = true; wireEvents(doc); }
    }
  }

  /* ---------- behaviour: one engine, delegated events, composedPath-aware ---------- */
  var hoverEl = null;
  var phases = (typeof WeakMap !== 'undefined') ? new WeakMap() : null;
  var roots = [], lastScan = 0, buttonCount = 0;

  function setPos(el, x, y) {
    el.style.setProperty('--kw-gx', x);
    el.style.setProperty('--kw-gy', y);
  }
  function follow(el, e) {
    var r = el.getBoundingClientRect();
    setPos(el, ((e.clientX - r.x) / r.width) * 100, ((e.clientY - r.y) / r.height) * 100);
  }
  function targetOf(e) {
    var t = (e.composedPath ? e.composedPath()[0] : e.target);
    return (t && t.closest) ? t.closest('.kw-goo') : null;
  }

  function wireEvents(doc) {
    if (reduce) return;
    doc.addEventListener('pointermove', function (e) {
      var g = targetOf(e);
      if (g && e.pointerType === 'mouse') { hoverEl = g; follow(g, e); }
      else if (hoverEl && !g) { hoverEl = null; }
    }, { passive: true });
    doc.addEventListener('pointerdown', function (e) {
      var g = targetOf(e);
      if (g) { hoverEl = g; follow(g, e); g.classList.add('kw-goo-pressed'); }
    }, { passive: true });
    function release(e) {
      for (var i = 0; i < roots.length; i++) {
        var els = roots[i].root.querySelectorAll('.kw-goo.kw-goo-pressed');
        for (var j = 0; j < els.length; j++) els[j].classList.remove('kw-goo-pressed');
      }
      if (e.pointerType !== 'mouse') hoverEl = null;
    }
    doc.addEventListener('pointerup', release, { passive: true });
    doc.addEventListener('pointercancel', release, { passive: true });
  }

  function startEngine() {
    var last = 0;
    function tick(now) {
      requestAnimationFrame(tick);
      if (now - last < 33) return; // ~30fps is plenty for goo
      last = now;
      if (now - lastScan > 1500 || !roots.length) {
        lastScan = now;
        roots = collectRoots();
        for (var r = 0; r < roots.length; r++) equipRoot(roots[r]);
      }
      if (reduce) return;
      var vh = window.innerHeight, count = 0;
      for (var i = 0; i < roots.length; i++) {
        var els;
        try { els = roots[i].root.querySelectorAll('.kw-goo'); } catch (err) { continue; }
        count += els.length;
        for (var j = 0; j < els.length; j++) {
          var el = els[j];
          if (el === hoverEl) continue;
          var rect = el.getBoundingClientRect();
          if (rect.bottom < -40 || rect.top > vh + 40 || rect.width === 0) continue;
          var ph = phases && phases.get(el);
          if (ph == null) ph = Math.random() * 10;
          ph += 0.012; // ~30fps engine => same breathing rate as the demo
          if (phases) phases.set(el, ph);
          setPos(el, ((Math.cos(ph) + 1) / 2) * 64 + 18, ((Math.sin(ph * 1.7) + 1) / 2) * 64 + 18);
        }
      }
      buttonCount = count;
    }
    requestAnimationFrame(tick);
  }

  /* ---------- boot ---------- */
  function boot() {
    roots = collectRoots();
    for (var r = 0; r < roots.length; r++) equipRoot(roots[r]);
    startEngine();
    try {
      console.log('[knowhere-goo] v6 active — roots:', roots.length);
      setTimeout(function () {
        console.log('[knowhere-goo] buttons found:', buttonCount, '(across', roots.length, 'roots)');
      }, 1200);
    } catch (err) {}
  }
  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot);

  window.KnowhereGoo = {
    upgrade: function () {},
    status: function () { return { roots: roots.length, buttons: buttonCount }; }
  };
})();
