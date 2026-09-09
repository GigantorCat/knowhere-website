/* ─────────────────────────────────────────────────────────────
   knowhere-mobile-menu.js v5 — shared mobile menu (≤820px).
   Replaces the per-page inline "kwm v4" blocks. Self-contained:
   injects its own CSS, builds the ☰ button into <nav> (or
   [data-kw-nav]) and the panel into <body>.

   v5 over v4:
   - RESILIENT: the dc-runtime re-renders page subtrees and wiped
     v4's button after it was built. v5 watches and re-appends.
   - A11y: 44px touch target (WCAG 2.5.5), aria-expanded/controls,
     Escape closes and returns focus (2.1.1), focus-visible rings
     (2.4.7), panel is a labelled nav landmark (1.3.1).
   ───────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  if (window.__kwmV5) return; window.__kwmV5 = true;

  var CSS =
    ".kwm-btn{display:none;margin-left:6px;width:44px;height:44px;border-radius:11px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#EDECE8;font-size:17px;line-height:1;cursor:pointer;align-items:center;justify-content:center;flex-shrink:0}" +
    ".kwm-btn:focus-visible{outline:2px solid #7BEA5A;outline-offset:3px}" +
    ".kwm-panel{display:none;position:fixed;top:64px;left:12px;right:12px;z-index:999;background:rgba(12,13,12,.97);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:8px;box-shadow:0 24px 60px rgba(0,0,0,.6);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}" +
    ".kwm-panel a{display:block;padding:13px 16px;border-radius:11px;font-size:15px;font-weight:600;letter-spacing:-.01em;color:#EDECE8;text-decoration:none;font-family:'Geist',system-ui,-apple-system,Arial,sans-serif;text-align:right}" +
    ".kwm-panel a:active,.kwm-panel a:hover{background:rgba(123,234,90,.1);color:#7BEA5A}" +
    ".kwm-panel a:focus-visible{outline:2px solid #7BEA5A;outline-offset:-2px}" +
    ".kwm-panel a.here{background:rgba(123,234,90,.12);color:#7BEA5A}" +
    ".kwm-panel a.kwm-login{border-top:1px solid rgba(255,255,255,.08);border-radius:0 0 11px 11px;margin-top:4px;color:#8C8B87}" +
    "@media (max-width:820px){.kwm-btn{display:flex}nav a[href*=\"app.knowhere.me\"]{display:none !important}}";

  var LINKS =
    '<a href="index.html">Home</a>' +
    '<a href="how-it-works.html">How it works</a>' +
    '<a href="experience-it.html">Experience it</a>' +
    '<a href="pricing.html">Pricing</a>' +
    '<a href="for-parents.html">For parents</a>' +
    '<a href="for-teachers.html">For teachers</a>' +
    '<a class="kwm-login" href="https://app.knowhere.me/login">Log in</a>';

  function panelEl() { return document.getElementById("kwm-panel"); }
  function btnEl() { return document.querySelector(".kwm-btn"); }

  function setOpen(open) {
    var p = panelEl(), b = btnEl();
    if (!p || !b) return;
    p.style.display = open ? "block" : "none";
    b.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      var first = p.querySelector("a");
      if (first) first.focus();
    }
  }
  function isOpen() { var p = panelEl(); return !!(p && p.style.display === "block"); }

  function build() {
    if (!document.getElementById("kwm-style")) {
      var st = document.createElement("style");
      st.id = "kwm-style"; st.textContent = CSS;
      document.head.appendChild(st);
    }
    if (!panelEl()) {
      var panel = document.createElement("nav");
      panel.className = "kwm-panel"; panel.id = "kwm-panel";
      panel.setAttribute("aria-label", "Mobile");
      panel.innerHTML = LINKS;
      var here = (location.pathname.split("/").pop() || "index.html");
      panel.querySelectorAll("a").forEach(function (a) {
        if (a.getAttribute("href") === here) { a.classList.add("here"); a.setAttribute("aria-current", "page"); }
      });
      document.body.appendChild(panel);
    }
    if (!btnEl()) {
      var nav = document.querySelector("nav:not(.kwm-panel)") || document.querySelector("[data-kw-nav]");
      if (!nav) return;
      var btn = document.createElement("button");
      btn.className = "kwm-btn"; btn.type = "button";
      btn.setAttribute("aria-label", "Menu");
      btn.setAttribute("aria-controls", "kwm-panel");
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = "\u2630";
      nav.appendChild(btn);
    }
  }

  function boot() {
    build();
    // dc-runtime re-renders subtrees and can wipe the button — re-append.
    new MutationObserver(function () { if (!btnEl() || !panelEl()) build(); })
      .observe(document.documentElement, { childList: true, subtree: true });

    document.addEventListener("click", function (ev) {
      var onBtn = ev.target.closest && ev.target.closest(".kwm-btn");
      var inPanel = ev.target.closest && ev.target.closest(".kwm-panel");
      if (onBtn) { ev.preventDefault(); ev.stopPropagation(); setOpen(!isOpen()); return; }
      if (!inPanel && isOpen()) setOpen(false);
    }, true);

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && isOpen()) {
        setOpen(false);
        var b = btnEl(); if (b) b.focus();
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
