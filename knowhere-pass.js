/* knowhere-pass.js — the 2026 exam pass card: the live decay counter + the close date (KW:PASS2, 15 Sep 2026).
   The pass ends for everyone Fri 20 Nov 2026 23:59 AEDT; it is on sale until Mon 26 Oct 2026 23:59 AEDT. Every day
   a parent waits is a day of the pass paid for and not used — the number on the pill is that, and it only goes down.
   After the close the card hides itself (the hero copy is edited by hand then; ads are off by ~30 Oct). */
(function(){
  var END = Date.UTC(2026,10,20,12,59), CLOSE = Date.UTC(2026,9,26,12,59), now = Date.now();
  var days = Math.max(0, Math.ceil((END - now) / 864e5)), closed = now > CLOSE;
  var cards = document.querySelectorAll('.kw-pass');
  for (var i = 0; i < cards.length; i++) {
    if (closed) { cards[i].setAttribute('data-closed', '1'); continue; }
    var el = cards[i].querySelectorAll('[data-pass-days]');
    for (var j = 0; j < el.length; j++) el[j].textContent = days + ' day' + (days === 1 ? '' : 's') + ' of the pass left';
  }
})();
