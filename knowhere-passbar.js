/* knowhere-passbar.js v2 — the 2026 exam pass, pinned to the bottom of the screen (KW:PASSBAR, 28 Sep 2026).
   One file for every page that carries it: /for-parents and every public concept page. Change it here, it changes
   everywhere ("consistency is my friend and master").

   <script src="/knowhere-passbar.js?v=2" defer data-audience="student" data-where="concept:<slug>" data-away=".cta-box"></script>

   data-audience  "student" (default): signup, "start your free week", plus "send this to a parent" (knowhere-handoff.js
                  picks the button up by delegation — students don't have the card, ruled 16 Sep).
                  "parent": signup?as=parent, "start their free week", no handoff (never on for-parents — the parent IS the card).
   data-where     handoff "where" + nothing else. data-away: hide the bar while this element is on screen (the page's own
                  closing CTA), so two CTAs never stack.

   Purple bar from load → tap → the pass card slides up (Umami pass_sheet_open, once per pageview). Its CTA emits
   cta_click with from:"passbar" through knowhere-pixel.js (any app.knowhere.me link, data-kw-from). The trust line says
   the card out loud before the tap — the free week is card-up-front (doctrine; never write "no card").
   Sale closes Mon 26 Oct 2026 23:59 AEDT (same instant as knowhere-pass.js): after that the bar turns into the plain
   green free-week bar by itself — no hand edit on 27 Oct. The pass itself ends Fri 20 Nov. */
(function () {
  if (window.__kwPassbar) return; window.__kwPassbar = true;
  var me = document.currentScript || document.querySelector('script[src*="knowhere-passbar.js"]');
  var ds = (me && me.dataset) || {};
  /* v2 (28 Sep): the signup tab is always explicit. The app keeps the last ?as= in sessionStorage, so a bare /signup
     after a /for-parents visit opened on the PARENT tab. Now: a page that says audience=parent is parent, and leaves a
     note (site sessionStorage) so a parent who clicks through to a concept page stays a parent; everyone else -> student. */
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  if (ds.audience === "parent") ss("kw_aud", "parent");
  var PARENT = ds.audience === "parent" || (!ds.audience && ss("kw_aud") === "parent");
  var SIGNUP = "https://app.knowhere.me/signup?as=" + (PARENT ? "parent" : "student");
  var CTA = PARENT ? "start their free week" : "start your free week";
  var WHERE = ds.where || location.pathname;
  /* W9-YEAR-11: data-pass="off" = always the plain free-week bar, never the exam pass (Year 11 pages: no exam, no pass) */
  var CLOSE = Date.UTC(2026, 9, 26, 12, 59), now = Date.now(), closed = now > CLOSE || ds.pass === "off";
  var claim = Math.max(0, Math.ceil((CLOSE - now) / 864e5));
  function track(n, d) { try { if (window.umami) window.umami.track(n, d || {}); } catch (e) {} }

  var CSS =
    "html body{padding-bottom:calc(76px + env(safe-area-inset-bottom))}" +
    ".kw-passbar{position:fixed;left:0;right:0;bottom:0;z-index:150;pointer-events:none;font-family:'Geist',system-ui,-apple-system,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased}" +
    ".kw-passbar>*{pointer-events:auto}" +
    ".kw-passbar .pb-bar,.kw-passbar .pb-plain,.kw-passbar .pb-sheet{max-width:560px;margin:0 auto;box-sizing:border-box}" +
    ".kw-passbar .pb-bar{display:flex;align-items:center;gap:12px;width:100%;border:0;cursor:pointer;text-align:left;font:inherit;color:#fff;background:#6f3fc0;background:linear-gradient(100deg,#7c47d6,#5b2fa6);padding:12px 18px calc(12px + env(safe-area-inset-bottom));border-radius:16px 16px 0 0;box-shadow:0 -10px 40px rgba(0,0,0,.45);transition:transform .32s cubic-bezier(.2,.7,.2,1)}" +
    ".kw-passbar .pb-t{flex:1;font-weight:700;font-size:16px;letter-spacing:-0.01em;line-height:1.2}" +
    ".kw-passbar .pb-t small{display:block;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.78);margin-top:3px}" +
    ".kw-passbar .pb-t small b{color:#fff;font-size:13px}" +
    ".kw-passbar .pb-p{font-weight:700;font-size:16px;white-space:nowrap}" +
    ".kw-passbar .pb-chev{width:32px;height:32px;border-radius:10px;background:rgba(0,0,0,.28);display:grid;place-items:center;transition:transform .25s;flex-shrink:0}" +
    ".kw-passbar.open .pb-chev{transform:rotate(180deg)}" +
    ".kw-passbar .pb-sheet{display:none;background:#1a1025;border:1px solid rgba(155,90,234,.5);border-bottom:0;border-radius:18px 18px 0 0;padding:22px 20px 18px;color:#EDECE8;text-align:left}" +
    ".kw-passbar.open .pb-sheet{display:block}" +
    ".kw-passbar.open .pb-bar{border-radius:0}" +
    ".kw-passbar .pb-price{font-size:15px;font-weight:600;color:#cdb6f5;margin:0}" +
    ".kw-passbar .pb-price .n{font-size:40px;font-weight:800;letter-spacing:-0.03em;color:#fff;margin-right:2px}" +
    ".kw-passbar .pb-l{font-size:15px;line-height:1.5;color:#bdb4c9;margin:8px 0 16px}" +
    ".kw-passbar .pb-l b{color:#fff;font-weight:600}" +
    ".kw-passbar .pb-cta{display:block;text-align:center;background:#7BEA5A;color:#070708;font-weight:700;font-size:16px;padding:16px 20px;border-radius:14px;text-decoration:none}" +
    ".kw-passbar .pb-trust{font-size:12.5px;line-height:1.5;color:#a79fb3;margin:12px 0 0;text-align:center}" +
    ".kw-passbar .pb-hand{margin:16px 0 0;padding-top:14px;border-top:1px solid rgba(155,90,234,.3);text-align:center}" +
    ".kw-passbar .pb-hand p{font-size:13px;color:#bdb4c9;margin:0 0 10px}" +
    ".kw-passbar .pb-hand button{font:inherit;font-size:14px;font-weight:600;color:#EDECE8;background:transparent;border:1px solid rgba(123,234,90,.7);border-radius:12px;padding:11px 18px;cursor:pointer;transition:background .16s,color .16s}" +
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

  var line = PARENT
    ? 'Everything until the last exam &#8212; it ends itself on Fri 20 Nov. <b>Less than one hour with a tutor.</b> Parent dashboard included.'
    : 'Everything until the last exam &#8212; it ends itself on Fri 20 Nov. <b>Less than one hour with a tutor.</b>';
  var hand = PARENT ? '' :
    '<div class="pb-hand"><p>not your card? send it to whoever&#8217;s is.</p>' +
    '<button type="button" data-kw-handoff="' + String(WHERE).replace(/"/g, "") + '">send this to a parent</button></div>';
  var chev = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10l4-4 4 4"></path></svg>';
  var HTML =
    '<div class="pb-scrim" data-pb-close></div>' +
    '<div class="pb-sheet" id="kwPassSheet" role="dialog" aria-label="the 2026 exam pass" aria-hidden="true">' +
      '<p class="pb-price"><span class="n">$49</span> once.</p>' +
      '<p class="pb-l">' + line + '</p>' +
      '<a class="pb-cta" data-kw-from="passbar" href="' + SIGNUP + '">' + CTA + '</a>' +
      '<p class="pb-trust">Free for a week. We take a card to start &#8212; cancel inside the week and you pay nothing.</p>' +
      hand +
    '</div>' +
    '<button class="pb-bar" type="button" aria-expanded="false" aria-controls="kwPassSheet">' +
      '<span class="pb-t">the 2026 exam pass<small><b>' + claim + '</b> ' + (claim === 1 ? 'day' : 'days') + ' left to claim</small></span>' +
      '<span class="pb-p">$49 once</span><span class="pb-chev" aria-hidden="true">' + chev + '</span>' +
    '</button>' +
    '<a class="pb-plain" data-kw-from="passbar" href="' + SIGNUP + '"><span>7 days free</span>' + CTA + '</a>';

  function mount() {
    if (document.getElementById("kwPassbar")) return;
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    var pb = document.createElement("div"); pb.className = "kw-passbar" + (closed ? " closed" : ""); pb.id = "kwPassbar";
    pb.innerHTML = HTML; document.body.appendChild(pb);
    var btn = pb.querySelector(".pb-bar"), sh = pb.querySelector(".pb-sheet"), opened = false;
    function setOpen(on) {
      pb.classList.toggle("open", on); btn.setAttribute("aria-expanded", on ? "true" : "false"); sh.setAttribute("aria-hidden", on ? "false" : "true");
      if (on && !opened) { opened = true; track("pass_sheet_open", { page: location.pathname }); }
    }
    btn.addEventListener("click", function () { setOpen(!pb.classList.contains("open")); });
    pb.querySelector("[data-pb-close]").addEventListener("click", function () { setOpen(false); });
    var hb = pb.querySelector("[data-kw-handoff]");   /* the handoff opens its own sheet (z 1200); put ours away first */
    if (hb) hb.addEventListener("click", function () { setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    var away = ds.away && document.querySelector(ds.away);
    if (away && "IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { es.forEach(function (en) { pb.classList.toggle("away", en.isIntersecting); if (en.isIntersecting) setOpen(false); }); }, { threshold: 0 }).observe(away);
    }
  }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
