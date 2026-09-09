/* knowhere — Meta pixel + the CTA event. One door, one file, both repos.
   ---------------------------------------------------------------------
   PASTE THE PIXEL ID BETWEEN THE QUOTES BELOW.
   While it is empty this file makes no network call, sets no cookie and
   loads nothing from Meta — it is safe to ship un-filled, and the CTA
   analytics event still works. The app carries the same block inline;
   if you change one, change both. */
var KW_PIXEL_ID = '';

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

  /* The ONLY way anything fires. Defined whether or not the pixel is on, so
     no call site anywhere needs to guard. */
  window.kwPixel = function (ev, params) {
    try { if (ID && window.fbq) window.fbq('track', ev, params || {}); } catch (e) {}
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
        to: href.indexOf('/login') > -1 ? 'login' : 'signup'
      });
    } catch (err) {}
  }, true);

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
})();
