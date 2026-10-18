/* knowhere-passbar.js v4 — the sticky offer bar (KW:FOUNDBAR, 18 Oct 2026; v4 same day: reads the app's live founding switch;
   was the 2026 exam pass bar, KW:PASSBAR 28 Sep).
   One file for every page that carries it: Home, /for-parents, /experience-it, /pricing, /how-it-works, /compare,
   /mission, /know-us and every public concept page. Never /for-teachers (the teacher bar is its own). Change it here, it
   changes everywhere ("consistency is my friend and master").

   <script src="/knowhere-passbar.js?v=3" defer data-audience="student" data-where="concept:<slug>" data-away=".cta-box"></script>

   data-audience  "student" (default): signup, "claim your seat" / "start your free week", plus "send this to a parent"
                  (knowhere-handoff.js picks the button up by delegation — students don't have the card, ruled 16 Sep).
                  "parent": signup?as=parent, "claim their seat" / "start their free week", no handoff (the parent IS the card).
   data-where     handoff "where" + nothing else. data-away: hide the bar while this element is on screen (the page's own
                  closing CTA), so two CTAs never stack.

   While the founding offer is open (the first 50 student plans, or until Fri 9 April 2027 23:59 AEST, whichever comes
   first — the app applies the founding price at checkout by itself): a purple bar (purple = the offer, ruled 15 Oct) →
   tap → the founding sheet slides up (Umami found_sheet_open, once per pageview), its CTA claims the seat (cta_click
   from:"foundbar" through knowhere-pixel.js). Once the offer closes: the plain green free-week bar, as before.
   The same switch drives any in-page founding card: every .kw-found hides itself and every [data-found-fallback] (the
   plain free-week CTA it stands in for) comes back, with the display value the attribute names.

   ▸ The 50th founding plan: once the app's GET /public/founding is live (Bronco, KICKOFF-BRONCO-FOUNDING-SWITCH-18OCT),
     the bar closes itself. Before that, or if the app is unreachable: set FOUNDING_FULL = true below and push.
   The free week is card-up-front (doctrine): the trust line says the card out loud; never write "no card" here. */
(function () {
  if (window.__kwPassbar) return; window.__kwPassbar = true;
  var FOUNDING_UNTIL = Date.UTC(2027, 3, 9, 13, 59);   /* Fri 9 Apr 2027 23:59 AEST — the app's own FOUNDING_UNTIL */
  var FOUNDING_FULL = false;                           /* ▸ flip to true when the first 50 student plans are taken */
  var me = document.currentScript || document.querySelector('script[src*="knowhere-passbar.js"]');
  var ds = (me && me.dataset) || {};
  /* the signup tab is always explicit. The app keeps the last ?as= in sessionStorage, so a bare /signup after a
     /for-parents visit opened on the PARENT tab. A page that says audience=parent is parent, and leaves a note (site
     sessionStorage) so a parent who clicks through to a concept page stays a parent; everyone else -> student. */
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  if (ds.audience === "parent") ss("kw_aud", "parent");
  var PARENT = ds.audience === "parent" || (!ds.audience && ss("kw_aud") === "parent");
  var SIGNUP = "https://app.knowhere.me/signup?as=" + (PARENT ? "parent" : "student");
  var CTA = PARENT ? "start their free week" : "start your free week";
  var CLAIM = PARENT ? "claim their seat" : "claim your seat";
  var WHERE = ds.where || location.pathname;
  var open = !FOUNDING_FULL && Date.now() <= FOUNDING_UNTIL;
  function track(n, d) { try { if (window.umami) window.umami.track(n, d || {}); } catch (e) {} }

  /* in-page founding cards: hide when the offer is closed, bring their fallbacks back */
  function cards() {
    if (open) return;
    var c = document.querySelectorAll('.kw-found'), f = document.querySelectorAll('[data-found-fallback]'), i;
    for (i = 0; i < c.length; i++) c[i].setAttribute('data-closed', '1');
    for (i = 0; i < f.length; i++) f[i].style.display = f[i].getAttribute('data-found-fallback') || 'flex';
  }

  var CSS =
    "html body{padding-bottom:calc(76px + env(safe-area-inset-bottom))}" +
    ".kw-passbar{position:fixed;left:0;right:0;bottom:0;z-index:150;pointer-events:none;font-family:'Geist',system-ui,-apple-system,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased}" +
    ".kw-passbar>*{pointer-events:auto}" +
    ".kw-passbar .pb-bar,.kw-passbar .pb-plain,.kw-passbar .pb-sheet{max-width:560px;margin:0 auto;box-sizing:border-box}" +
    ".kw-passbar .pb-bar{display:flex;align-items:center;gap:12px;width:100%;border:0;cursor:pointer;text-align:left;font:inherit;color:#fff;background:#6f3fc0;background:linear-gradient(100deg,#7c47d6,#5b2fa6);padding:12px 18px calc(12px + env(safe-area-inset-bottom));border-radius:16px 16px 0 0;box-shadow:0 -10px 40px rgba(0,0,0,.45);transition:transform .32s cubic-bezier(.2,.7,.2,1)}" +
    ".kw-passbar .pb-t{flex:1;font-weight:700;font-size:16px;letter-spacing:-0.01em;line-height:1.2}" +
    ".kw-passbar .pb-t small{display:block;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.78);margin-top:3px}" +
    ".kw-passbar .pb-p{font-weight:700;font-size:15px;white-space:nowrap}" +
    ".kw-passbar .pb-chev{width:32px;height:32px;border-radius:10px;background:rgba(0,0,0,.28);display:grid;place-items:center;transition:transform .25s;flex-shrink:0}" +
    ".kw-passbar.open .pb-chev{transform:rotate(180deg)}" +
    ".kw-passbar .pb-sheet{display:none;background:#1a1025;border:1px solid rgba(155,90,234,.5);border-bottom:0;border-radius:18px 18px 0 0;padding:22px 20px 18px;color:#EDECE8;text-align:left}" +
    ".kw-passbar.open .pb-sheet{display:block}" +
    ".kw-passbar.open .pb-bar{border-radius:0}" +
    ".kw-passbar .pb-eye{font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#B98CF0;margin:0 0 8px}" +
    ".kw-passbar .pb-h{font-size:22px;font-weight:800;letter-spacing:-0.025em;line-height:1.15;color:#fff;margin:0 0 14px}" +
    ".kw-passbar .pb-price{font-size:15px;font-weight:600;color:#cdb6f5;margin:0}" +
    ".kw-passbar .pb-price .n{font-size:40px;font-weight:800;letter-spacing:-0.03em;color:#fff;margin-right:4px}" +
    ".kw-passbar .pb-price s{color:#8f86a0;font-weight:500;margin-left:6px}" +
    ".kw-passbar .pb-l{font-size:14.5px;line-height:1.5;color:#bdb4c9;margin:8px 0 16px}" +
    ".kw-passbar .pb-l b{color:#fff;font-weight:600}" +
    ".kw-passbar .pb-cta{display:block;text-align:center;background:#7BEA5A;color:#070708;font-weight:700;font-size:16px;padding:16px 20px;border-radius:14px;text-decoration:none;text-transform:lowercase}" +
    ".kw-passbar .pb-trust{font-size:12.5px;line-height:1.5;color:#a79fb3;margin:12px 0 0;text-align:center}" +
    ".kw-passbar .pb-fine{font-size:11.5px;line-height:1.5;color:#8f86a0;margin:6px 0 0;text-align:center}" +
    ".kw-passbar .pb-hand{margin:16px 0 0;padding-top:14px;border-top:1px solid rgba(155,90,234,.3);text-align:center}" +
    ".kw-passbar .pb-hand p{font-size:13px;color:#bdb4c9;margin:0 0 10px}" +
    ".kw-passbar .pb-hand button{font:inherit;font-size:14px;font-weight:600;color:#EDECE8;background:transparent;border:1px solid rgba(123,234,90,.7);border-radius:12px;padding:11px 18px;cursor:pointer;transition:background .16s,color .16s;text-transform:lowercase}" +
    ".kw-passbar .pb-hand button:hover{background:#7BEA5A;color:#070708}" +
    ".kw-passbar .pb-scrim{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:-1}" +
    ".kw-passbar.open .pb-scrim{display:block}" +
    ".kw-passbar .pb-plain{display:none;align-items:center;justify-content:center;gap:10px;background:#7BEA5A;color:#070708;font-weight:700;font-size:16px;padding:16px 18px calc(16px + env(safe-area-inset-bottom));border-radius:16px 16px 0 0;text-decoration:none}" +
    ".kw-passbar .pb-plain span{font-weight:500;font-size:13px}" +
    ".kw-passbar.closed .pb-bar,.kw-passbar.closed .pb-sheet,.kw-passbar.closed .pb-scrim{display:none}" +
    ".kw-passbar.closed .pb-plain{display:flex}" +
    ".kw-passbar.away .pb-bar,.kw-passbar.away .pb-plain{transform:translateY(130%)}" +
    ".kw-passbar.away .pb-plain{display:none}" +
    "@media (prefers-reduced-motion:reduce){.kw-passbar *{transition:none!important}}";

  var who = PARENT ? 'theirs' : 'yours', they = PARENT ? 'they stay' : 'you stay', plan = PARENT ? 'their plan' : 'your plan';
  var hand = PARENT ? '' :
    '<div class="pb-hand"><p>not your card? send it to whoever&#8217;s is.</p>' +
    '<button type="button" data-kw-handoff="' + String(WHERE).replace(/"/g, "") + '">send this to a parent</button></div>';
  var chev = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10l4-4 4 4"></path></svg>';
  var PLAIN = '<a class="pb-plain" data-kw-from="passbar" href="' + SIGNUP + '"><span>7 days free</span>' + CTA + '</a>';
  var HTML = !open ? PLAIN :
    '<div class="pb-scrim" data-pb-close></div>' +
    '<div class="pb-sheet" id="kwFoundSheet" role="dialog" aria-label="the founding rate" aria-hidden="true">' +
      '<p class="pb-eye">First 50 student plans</p>' +
      '<p class="pb-h">The founding rate. ' + (PARENT ? 'Theirs' : 'Yours') + ' for as long as ' + they + '.</p>' +
      '<p class="pb-price"><span class="n">$79</span>a term<s>$99</s></p>' +
      '<p class="pb-l">Or <b>$29 a month</b> or <b>$249 a year</b>. Everything in it, and the rate stays ' + who + ' while ' + plan + ' stays active.</p>' +
      '<a class="pb-cta" data-kw-from="foundbar" href="' + SIGNUP + '">' + CLAIM + '</a>' +
      '<p class="pb-trust">Free for a week first. We take a card to start &#8212; cancel inside the week and you pay nothing.</p>' +
      '<p class="pb-fine">The first 50 student plans, or until Fri 9 April 2027, whichever comes first.</p>' +
      hand +
    '</div>' +
    '<button class="pb-bar" type="button" aria-expanded="false" aria-controls="kwFoundSheet">' +
      '<span class="pb-t">The founding rate<small>First 50 students only</small></span>' +
      '<span class="pb-p">until 9 Apr</span><span class="pb-chev" aria-hidden="true">' + chev + '</span>' +
    '</button>' +
    PLAIN;

  function mount() {
    cards();
    if (document.getElementById("kwPassbar")) return;
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    var pb = document.createElement("div"); pb.className = "kw-passbar" + (open ? "" : " closed"); pb.id = "kwPassbar";
    pb.innerHTML = HTML; document.body.appendChild(pb);
    var btn = pb.querySelector(".pb-bar"), sh = pb.querySelector(".pb-sheet"), opened = false;
    function setOpen(on) {
      if (!btn || !sh) return;
      pb.classList.toggle("open", on); btn.setAttribute("aria-expanded", on ? "true" : "false"); sh.setAttribute("aria-hidden", on ? "false" : "true");
      if (on && !opened) { opened = true; track("found_sheet_open", { page: location.pathname }); }
    }
    if (btn) btn.addEventListener("click", function () { setOpen(!pb.classList.contains("open")); });
    var pbc = pb.querySelector("[data-pb-close]"); if (pbc) pbc.addEventListener("click", function () { setOpen(false); });
    var hb = pb.querySelector("[data-kw-handoff]");   /* the handoff opens its own sheet (z 1200); put ours away first */
    if (hb) hb.addEventListener("click", function () { setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    watch = function () {   /* (re)attach the "away" watch; pages that re-render their markup call this once they have */
      if (!ds.away || !("IntersectionObserver" in window)) return;
      if (io) io.disconnect();
      var seen = new Set();
      io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) seen.add(en.target); else seen.delete(en.target); });
        pb.classList.toggle("away", seen.size > 0); if (seen.size) setOpen(false);
      }, { threshold: 0 });
      Array.prototype.forEach.call(document.querySelectorAll(ds.away), function (a) { io.observe(a); });
    };
    watch();
    setTimeout(watch, 1500);   /* and once more after a component page has rendered */
  }
  var io = null, watch = function () {};
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
  window.KnowhereFounding = { open: open, cards: cards, watch: function () { watch(); } };

  /* v4 (18 Oct 2026): the live switch. The app answers GET https://app.knowhere.me/public/founding → { open, until } (no
     login; the app already sends CORS *). Closed there = closed here: the bar turns plain green, every .kw-founding card
     hides and its fallback returns, and <html> gets .kw-founding-closed so a page can switch anything else in CSS.
     No answer (offline, slow, or the endpoint not deployed yet) = the date rule above stands. FOUNDING_FULL still forces closed. */
  var API = "https://app.knowhere.me/public/founding";
  function shut() {
    if (!open) return; open = false;
    window.KnowhereFounding.open = false;
    document.documentElement.classList.add("kw-founding-closed");
    var pb = document.getElementById("kwPassbar"); if (pb) { pb.classList.remove("open"); pb.classList.add("closed"); }
    cards();
  }
  if (!open) document.documentElement.classList.add("kw-founding-closed");
  else if (window.fetch) {
    try {
      var ctl = window.AbortController ? new AbortController() : null;
      if (ctl) setTimeout(function () { try { ctl.abort(); } catch (e) {} }, 4000);
      fetch(API, { mode: "cors", credentials: "omit", signal: ctl ? ctl.signal : undefined })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { if (j && j.open === false) shut(); })
        .catch(function () {});
    } catch (e) {}
  }
})();
