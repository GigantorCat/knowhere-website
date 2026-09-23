/* knowhere — Meta pixel + the CTA event. One door, one file, both repos.
   ---------------------------------------------------------------------
   PASTE THE PIXEL ID BETWEEN THE QUOTES BELOW.
   While it is empty this file makes no network call, sets no cookie and
   loads nothing from Meta — it is safe to ship un-filled, and the CTA
   analytics event still works. The app carries the same block inline;
   if you change one, change both. */
var KW_PIXEL_ID = '1829181431399314';
/* KW:TT — TikTok pixel id (Events Manager → Web → knowhere). Empty = inert. Never Advanced Matching. */
var KW_TT_PIXEL_ID = 'DAQ4L7JC77UFPT802VM0';

(function () {
  'use strict';
  var ID = (typeof KW_PIXEL_ID === 'string' ? KW_PIXEL_ID : '').trim();

  /* ---- first-touch acquisition ----------------------------------------
     The ad that INTRODUCED someone gets the credit, not whatever they happened
     to click last, so this is written once per browser and never overwritten.
     window.kwAcq() is the read; the waitlist and the app-link decorator use it. */
  var ACQ = 'kw_acq';
  function readAcq() { try { return JSON.parse(localStorage.getItem(ACQ) || 'null'); } catch (e) { return null; } }
  window.kwAcq = readAcq;
  (function () {
    try {
      var q = new URLSearchParams(location.search);
      var got = {
        source: (q.get('utm_source') || '').slice(0, 40),
        campaign: (q.get('utm_campaign') || '').slice(0, 60),
        ad: (q.get('utm_content') || '').slice(0, 60),
        term: (q.get('utm_term') || '').slice(0, 40)
      };
      if (!got.source && !got.campaign && !got.ad) return;
      if (readAcq()) return;
      got.at = new Date().toISOString();
      localStorage.setItem(ACQ, JSON.stringify(got));
    } catch (e) {}
  })();

  /* ---- KW:VISGATE — nothing counts until the page has been seen -------
     Meta prefetches ad landing pages in a hidden webview while the ad is on
     screen. The page runs, so the tracker would log a pageview and a 0-second
     scroll_exit for someone who never tapped. The Umami tag carries
     data-auto-track="false"; this is the ONLY place the pageview is sent, and
     it waits for the document to actually be visible. A prefetched webview
     never is. Found 22 Sep 2026: facebook.com referrer, 79 visits, 26 s total. */
  var kwSeen = document.visibilityState === 'visible';
  function kwOnSeen(fn) {
    if (kwSeen) { fn(); return; }
    document.addEventListener('visibilitychange', function h() {
      if (document.visibilityState !== 'visible') return;
      document.removeEventListener('visibilitychange', h);
      kwSeen = true;
      fn();
    });
  }
  function kwUmamiPageview() {
    /* the tracker is deferred like this file; it may land a tick later */
    var tries = 0;
    (function send() {
      if (window.umami && window.umami.track) { try { window.umami.track(); } catch (e) {} return; }
      if (++tries < 60) setTimeout(send, 100);
    })();
  }
  kwOnSeen(kwUmamiPageview);

  /* The ONLY way anything fires. Defined whether or not the pixel is on, so
     no call site anywhere needs to guard. */
  /* KW:TT — TikTok rides the same door. Only the funnel events cross over; ViewContent is TikTok's
     "engaged" signal (below), never a page load. */
  var TT = (typeof KW_TT_PIXEL_ID === 'string' ? KW_TT_PIXEL_ID : '').trim();
  var TT_FUNNEL = { CompleteRegistration: 1, InitiateCheckout: 1, StartTrial: 1 };
  function ttTrack(ev, params) { try { if (TT && window.ttq) window.ttq.track(ev, params || {}); } catch (e) {} }
  window.kwTT = ttTrack;
  window.kwPixel = function (ev, params) {
    try { if (ID && window.fbq) window.fbq('track', ev, params || {}); } catch (e) {}
    if (TT_FUNNEL[ev]) ttTrack(ev, params);
  };

  /* Umami CTA event — independent of Meta, fires either way. One delegated
     listener instead of a handler per button across fourteen pages. */
  document.addEventListener('click', function (e) {
    var t = e && e.target;
    var a = (t && t.closest) ? t.closest('a[href*="app.knowhere.me"]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';

    /* app.knowhere.me is a different hostname, so localStorage does not follow a
       person across. The acquisition rides the link instead — which also puts the
       ad code into Umami's campaign report on the app side. */
    try {
      var acq = readAcq();
      if (acq && (acq.ad || acq.campaign) && a.href.indexOf('utm_') === -1) {
        var u = new URL(a.href, location.href);
        if (acq.source) u.searchParams.set('utm_source', acq.source);
        if (acq.campaign) u.searchParams.set('utm_campaign', acq.campaign);
        if (acq.ad) u.searchParams.set('utm_content', acq.ad);
        if (acq.term) u.searchParams.set('utm_term', acq.term);
        a.href = u.toString();
      }
    } catch (err) {}

    try {
      if (window.umami) window.umami.track('cta_click', {
        page: location.pathname,
        to: href.indexOf('/login') > -1 ? 'login' : 'signup',
        from: a.getAttribute('data-kw-from') || ''   /* KW:HERO-INTERACT (24 Sep 2026): which CTA on the page */
      });
    } catch (err) {}
    ttTrack('ClickButton', { content_name: location.pathname });   /* KW:TT */
  }, true);

  /* ---- scroll depth ---------------------------------------------------
     A bounce tells you someone left; it does not tell you whether they read
     anything first. These two events separate "the first screen lost them"
     from "the first screen worked and something below it did not".
     Paid landing pages only, the same two ViewContent covers, so a free
     Umami tier is not spent on fourteen pages nobody advertises.
     Milestones fire once each. The exit beacon is the important one: at a
     97% bounce most people never reach 25%, and without it they leave no
     trace at all, which reads identically to the script never running. */
  (function () {
    var path = location.pathname;
    /* KW:CONCEPT — the concept pages (/hsc/…, /vce/…) are paid destinations too (P3 -LP-concept, G-SUBJ) */
    if (path.indexOf('for-parents') === -1 && path.indexOf('experience-it') === -1 && path.indexOf('/hsc/') !== 0 && path.indexOf('/vce/') !== 0) return;

    var MARKS = [25, 50, 75, 90];
    /* KW:TT — engaged = 50% scroll OR 20 s with the page visible. Once. TikTok's ViewContent. */
    var engagedSent = false;
    function engaged() { if (engagedSent) return; engagedSent = true; ttTrack('ViewContent', { content_name: path.replace(/^\//, '').replace(/\/$/, '') || 'home' }); }
    var hit = {}, maxPct = 0, started = Date.now(), ticking = false, sent = false, measured = false;

    function track(name, data) {
      try { if (window.umami) window.umami.track(name, data); } catch (e) {}
    }

    function depth() {
      var doc = document.documentElement;
      var h = Math.max(doc.scrollHeight, document.body ? document.body.scrollHeight : 0);
      /* KW:SCROLLFIX — page is not taller than the viewport: either there is
         genuinely nothing to scroll, or layout has not settled yet. Either way
         the depth is UNMEASURABLE. Returning 100 here stamped a complete read
         on every visitor at load and fired all four scroll_depth marks, which
         is what faked the bounce rate down. +1 absorbs sub-pixel rounding on
         fractional device pixel ratios. */
      if (h <= window.innerHeight + 1) return null;
      return Math.round(((window.scrollY + window.innerHeight) / h) * 100);
    }

    function measure() {
      ticking = false;
      var d = depth();
      if (d === null) return;          /* unmeasurable — never latch it into maxPct */
      measured = true;
      if (d > maxPct) maxPct = d;
      for (var i = 0; i < MARKS.length; i++) {
        if (d >= MARKS[i] && !hit[MARKS[i]]) {
          hit[MARKS[i]] = 1;
          track('scroll_depth', { page: path, depth: MARKS[i] });
          if (MARKS[i] === 50) engaged();   /* KW:TT */
        }
      }
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(measure);
    }, { passive: true });

    /* Fires once, on the way out. visibilitychange is the only handler a
       phone reliably still runs on a back-tap. */
    function bail() {
      if (sent || !kwSeen) return;   /* KW:VISGATE — never report a page nobody saw */
      sent = true;
      measure();
      var payload = {
        page: path,
        seconds: Math.round((Date.now() - started) / 1000)
      };
      /* Omit max entirely rather than send a fake 0 when we never got a valid
         reading (very short page, or the visitor left before layout settled). */
      if (measured) payload.max = Math.min(100, Math.floor(maxPct / 10) * 10);
      track('scroll_exit', payload);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') bail();
    });
    window.addEventListener('pagehide', bail);

    /* Do not take a baseline reading until layout has actually settled. A
       deferred script runs while the document can still measure exactly one
       viewport tall — the state that used to report 100%. Two rAFs after
       load puts us past first paint and past the banner/goo mounting. */
    function startMeasuring() {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(measure);
      });
    }
    kwOnSeen(function () {           /* KW:VISGATE */
      setTimeout(function () { if (document.visibilityState === 'visible') engaged(); }, 20000);   /* KW:TT */
      if (document.readyState === 'complete') startMeasuring();
      else window.addEventListener('load', startMeasuring, { once: true });
    });
  })();

  /* KW:TT — TikTok base code, the standard snippet, loaded only once the page is seen. No identify(). */
  if (TT) kwOnSeen(function () {
    !function (w, d, t) {
      w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
      ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'];
      ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e; };
      ttq.load = function (e, n) {
        var r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = r; ttq._t = ttq._t || {}; ttq._t[e] = +new Date; ttq._o = ttq._o || {}; ttq._o[e] = n || {};
        n = d.createElement('script'); n.type = 'text/javascript'; n.async = !0; n.src = r + '?sdkid=' + e + '&lib=' + t;
        e = d.getElementsByTagName('script')[0]; e.parentNode.insertBefore(n, e);
      };
      ttq.load(TT);
      ttq.page();
    }(window, document, 'ttq');
  });

  if (!ID) return;

  /* Meta base code — the standard snippet, unmodified. */
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', ID);
  window.fbq('track', 'PageView');

  /* ViewContent on the two pages paid traffic is allowed to land on.
     Every ad in the plan points at one of these; nothing else counts. */
  var p = location.pathname;
  if (p.indexOf('for-parents') > -1) window.kwPixel('ViewContent', { content_name: 'for-parents' });
  else if (p.indexOf('experience-it') > -1) window.kwPixel('ViewContent', { content_name: 'experience-it' });
  else if (p.indexOf('/hsc/') === 0 || p.indexOf('/vce/') === 0) window.kwPixel('ViewContent', { content_name: p.replace(/^\//, '').replace(/\/$/, '') }); /* KW:CONCEPT */
})();
