/* knowhere-pass.js — the 2026 exam pass card (KW:PASS3, 15 Sep 2026): the live decay counter, the close date, and the
   switch-back. The pass ends for everyone Fri 20 Nov 2026 23:59 AEDT; it is on sale until Mon 26 Oct 2026 23:59 AEDT.
   Every day a parent waits is a day of the pass paid for and not used — the number on the card is that, and it only goes
   down. After the close: every .kw-pass card hides itself and every [data-pass-fallback] (the standard free-week CTA it
   replaced) comes back, with the display value the attribute names. No hand edit on 27 Oct. */
(function(){
  var END = Date.UTC(2026,10,20,12,59), CLOSE = Date.UTC(2026,9,26,12,59), now = Date.now();
  var days = Math.max(0, Math.ceil((END - now) / 864e5)), closed = now > CLOSE;
  var cards = document.querySelectorAll('.kw-pass'), fb = document.querySelectorAll('[data-pass-fallback]'), i;
  if (closed) {
    for (i = 0; i < cards.length; i++) cards[i].setAttribute('data-closed', '1');
    for (i = 0; i < fb.length; i++) fb[i].style.display = fb[i].getAttribute('data-pass-fallback') || 'flex';
    return;
  }
  var els = document.querySelectorAll('[data-pass-days]');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (i = 0; i < els.length; i++) (function(el){
    if (reduce || !window.requestAnimationFrame) { el.textContent = days; return; }
    var t0 = null;                                  /* a short ticker up to today's number, then it sits */
    function step(t){ if (t0 === null) t0 = t; var p = Math.min(1, (t - t0) / 700); var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(days * e); if (p < 1) requestAnimationFrame(step); else el.textContent = days; }
    requestAnimationFrame(step);
  })(els[i]);
})();
