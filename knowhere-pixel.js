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
