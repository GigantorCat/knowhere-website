/* ─────────────────────────────────────────────────────────────
   knowhere-goat-spot.js v2 — Goat Guide mark cards for content pages.
   Renders Animal's head-only goatmark (64x64) INLINE from GOAT_POSES
   so the custom properties inherit (see goatmark contact-sheet README).
   Pose data sourced from the canonical GOAT_PATHS (app / 404.html) -
   keep in sync, never redraw by hand.

   Mount: <div data-goat-spot data-goat="one-brow|both-brows-anim"
              data-kick=".." data-line=".." data-sub=".."></div>
   both-brows-anim = two-frame snap cut off neutral (Animal's animated
   spec), honours prefers-reduced-motion (static pose frame instead).
   Site tokens: dark + brat. References to The Goat are proper case -
   he is special like that - so no lowercase transform on the line.
   ───────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  if (window.__kgsLoaded) return; window.__kgsLoaded = true;

  var GOAT_POSES = {"neutral":[{"d":"M29.4,24.4 C25,21.4 18,21.6 15.2,24.8 C18.6,28.8 24.4,30.2 29.4,29.2 Z","f":"c"},{"d":"M19.4,24.6 C21.8,25.1 24,25.9 25.6,26.7","f":"n","s":"b","w":0.75},{"d":"M23.30,31.30 A2.1,2.1 0 0 1 19.10,31.30 A2.1,2.1 0 0 1 23.30,31.30 Z","f":"n","s":"a","w":1.4},{"d":"M40.6,25.4 C42.8,20.4 46.6,18 50.6,19 C49,22.8 45.2,25.8 41.4,27 Z","f":"c"},{"d":"M43.4,24 C45.6,21.9 47.8,20.6 49.7,20.2","f":"n","s":"b","w":0.95},{"d":"M30.8,24.4 C29.6,17 26,10.2 18.6,6 C22.2,11.2 24.8,17.8 26.6,25 Z","f":"c"},{"d":"M40.6,24.2 C39.4,15.4 36,7.4 29.8,2.4 C32.8,8.4 34.9,15.6 35.5,24.4 Z","f":"c"},{"d":"M28.8,21.6 C27.6,23.8 27.2,25.4 27.2,27.2 C27.2,29.6 27.3,31.2 27.5,32.7 C27.9,35 28.3,36.6 29,37.7 C29.8,39.4 30.6,40.8 31.7,41.8 C32.8,43.4 34,44.8 35.2,45.7 C36.4,47.2 37.4,48.2 38.4,48.7 C39.2,49.2 40,49.2 40.7,49 C42.6,48.6 45,48 46.7,47.2 C47.6,46.8 48.2,46.5 48.2,45.9 C48.4,44.6 47.9,43.8 47.3,42.9 C46.6,41.2 45.9,39.4 45.3,37.7 C44.7,35.6 44,33.6 43.3,31.6 C42.6,29.4 41.8,27.4 40.9,25.5 C40.4,23.6 39.8,22.2 39,21 C35.6,21.4 32,21.6 28.8,21.6 Z","f":"c"},{"d":"M39.4,49.2 L46.8,48.4 L46.6,56.6 L45.4,49.6 L44.6,59.2 L43.4,49.8 L42.6,62.6 L41.6,49.8 L40.8,58.2 L39.9,49.6 Z","f":"g"},{"d":"M30.2,22.2 L31,15.8 L31.9,21.6 L32.7,14.4 L33.5,21.4 L34.3,16 L35.1,22.2 Z","f":"g"},{"d":"M44.64,45.37 A1,0.38 42 0 1 43.16,44.03 A1,0.38 42 0 1 44.64,45.37 Z","f":"b"},{"d":"M46.89,45.04 A0.8,0.33 42 0 1 45.71,43.96 A0.8,0.33 42 0 1 46.89,45.04 Z","f":"b"},{"d":"M34.49,31.18 A1.3,2 8 0 1 31.91,30.82 A1.3,2 8 0 1 34.49,31.18 Z","f":"b"},{"d":"M40.19,30.78 A1.3,2 8 0 1 37.61,30.42 A1.3,2 8 0 1 40.19,30.78 Z","f":"b"},{"d":"M40.9,48.3 C42.8,49.2 45.4,48.4 47,47.2","f":"n","s":"b","w":1.1}],"both brows":[{"d":"M29.4,24.4 C25,21.4 18,21.6 15.2,24.8 C18.6,28.8 24.4,30.2 29.4,29.2 Z","f":"c"},{"d":"M19.4,24.6 C21.8,25.1 24,25.9 25.6,26.7","f":"n","s":"b","w":0.75},{"d":"M23.30,31.30 A2.1,2.1 0 0 1 19.10,31.30 A2.1,2.1 0 0 1 23.30,31.30 Z","f":"n","s":"a","w":1.4},{"d":"M40.6,25.4 C42.8,20.4 46.6,18 50.6,19 C49,22.8 45.2,25.8 41.4,27 Z","f":"c"},{"d":"M43.4,24 C45.6,21.9 47.8,20.6 49.7,20.2","f":"n","s":"b","w":0.95},{"d":"M30.8,24.4 C29.6,17 26,10.2 18.6,6 C22.2,11.2 24.8,17.8 26.6,25 Z","f":"c"},{"d":"M40.6,24.2 C39.4,15.4 36,7.4 29.8,2.4 C32.8,8.4 34.9,15.6 35.5,24.4 Z","f":"c"},{"d":"M28.8,21.6 C27.6,23.8 27.2,25.4 27.2,27.2 C27.2,29.6 27.3,31.2 27.5,32.7 C27.9,35 28.3,36.6 29,37.7 C29.8,39.4 30.6,40.8 31.7,41.8 C32.8,43.4 34,44.8 35.2,45.7 C36.4,47.2 37.4,48.2 38.4,48.7 C39.2,49.2 40,49.2 40.7,49 C42.6,48.6 45,48 46.7,47.2 C47.6,46.8 48.2,46.5 48.2,45.9 C48.4,44.6 47.9,43.8 47.3,42.9 C46.6,41.2 45.9,39.4 45.3,37.7 C44.7,35.6 44,33.6 43.3,31.6 C42.6,29.4 41.8,27.4 40.9,25.5 C40.4,23.6 39.8,22.2 39,21 C35.6,21.4 32,21.6 28.8,21.6 Z","f":"c"},{"d":"M39.4,49.2 L46.8,48.4 L46.6,56.6 L45.4,49.6 L44.6,59.2 L43.4,49.8 L42.6,62.6 L41.6,49.8 L40.8,58.2 L39.9,49.6 Z","f":"g"},{"d":"M30.2,22.2 L31,15.8 L31.9,21.6 L32.7,14.4 L33.5,21.4 L34.3,16 L35.1,22.2 Z","f":"g"},{"d":"M44.64,45.37 A1,0.38 42 0 1 43.16,44.03 A1,0.38 42 0 1 44.64,45.37 Z","f":"b"},{"d":"M46.89,45.04 A0.8,0.33 42 0 1 45.71,43.96 A0.8,0.33 42 0 1 46.89,45.04 Z","f":"b"},{"d":"M34.73,31.22 A1.55,2.4 8 0 1 31.67,30.78 A1.55,2.4 8 0 1 34.73,31.22 Z","f":"b"},{"d":"M40.43,30.82 A1.55,2.4 8 0 1 37.37,30.38 A1.55,2.4 8 0 1 40.43,30.82 Z","f":"b"},{"d":"M31.01,27.00 L35.12,26.13 L35.39,27.40 L31.28,28.27 Z","f":"b"},{"d":"M36.70,26.35 L40.74,25.20 L41.10,26.45 L37.06,27.60 Z","f":"b"},{"d":"M40.9,48.3 C42.8,49.2 45.4,48.4 47,47.2","f":"n","s":"b","w":1.1}],"one brow":[{"d":"M29.4,24.4 C25,21.4 18,21.6 15.2,24.8 C18.6,28.8 24.4,30.2 29.4,29.2 Z","f":"c"},{"d":"M19.4,24.6 C21.8,25.1 24,25.9 25.6,26.7","f":"n","s":"b","w":0.75},{"d":"M23.30,31.30 A2.1,2.1 0 0 1 19.10,31.30 A2.1,2.1 0 0 1 23.30,31.30 Z","f":"n","s":"a","w":1.4},{"d":"M40.6,25.4 C42.8,20.4 46.6,18 50.6,19 C49,22.8 45.2,25.8 41.4,27 Z","f":"c"},{"d":"M43.4,24 C45.6,21.9 47.8,20.6 49.7,20.2","f":"n","s":"b","w":0.95},{"d":"M30.8,24.4 C29.6,17 26,10.2 18.6,6 C22.2,11.2 24.8,17.8 26.6,25 Z","f":"c"},{"d":"M40.6,24.2 C39.4,15.4 36,7.4 29.8,2.4 C32.8,8.4 34.9,15.6 35.5,24.4 Z","f":"c"},{"d":"M28.8,21.6 C27.6,23.8 27.2,25.4 27.2,27.2 C27.2,29.6 27.3,31.2 27.5,32.7 C27.9,35 28.3,36.6 29,37.7 C29.8,39.4 30.6,40.8 31.7,41.8 C32.8,43.4 34,44.8 35.2,45.7 C36.4,47.2 37.4,48.2 38.4,48.7 C39.2,49.2 40,49.2 40.7,49 C42.6,48.6 45,48 46.7,47.2 C47.6,46.8 48.2,46.5 48.2,45.9 C48.4,44.6 47.9,43.8 47.3,42.9 C46.6,41.2 45.9,39.4 45.3,37.7 C44.7,35.6 44,33.6 43.3,31.6 C42.6,29.4 41.8,27.4 40.9,25.5 C40.4,23.6 39.8,22.2 39,21 C35.6,21.4 32,21.6 28.8,21.6 Z","f":"c"},{"d":"M39.4,49.2 L46.8,48.4 L46.6,56.6 L45.4,49.6 L44.6,59.2 L43.4,49.8 L42.6,62.6 L41.6,49.8 L40.8,58.2 L39.9,49.6 Z","f":"g"},{"d":"M30.2,22.2 L31,15.8 L31.9,21.6 L32.7,14.4 L33.5,21.4 L34.3,16 L35.1,22.2 Z","f":"g"},{"d":"M44.64,45.37 A1,0.38 42 0 1 43.16,44.03 A1,0.38 42 0 1 44.64,45.37 Z","f":"b"},{"d":"M46.89,45.04 A0.8,0.33 42 0 1 45.71,43.96 A0.8,0.33 42 0 1 46.89,45.04 Z","f":"b"},{"d":"M34.49,31.18 A1.3,2 8 0 1 31.91,30.82 A1.3,2 8 0 1 34.49,31.18 Z","f":"b"},{"d":"M40.19,30.78 A1.3,2 8 0 1 37.61,30.42 A1.3,2 8 0 1 40.19,30.78 Z","f":"b"},{"d":"M31.25,26.81 L35.24,27.09 L35.15,28.39 L31.16,28.11 Z","f":"b"},{"d":"M36.61,25.34 L40.75,23.84 L41.19,25.06 L37.05,26.56 Z","f":"b"},{"d":"M40.9,48.3 C42.8,49.2 45.4,48.4 47,47.2","f":"n","s":"b","w":1.1}]};

  /* token mapping per the canonical renderer (404 / app):
     fill c=currentColor g=goatee b=surface n=none; stroke b=surface a=accent */
  function col(f) { return f === "c" ? "currentColor" : f === "g" ? "var(--gm-goatee,currentColor)" : f === "b" ? "var(--gm-bg,#070708)" : f === "n" ? "none" : f; }
  function scol(s) { return s === "b" ? "var(--gm-bg,#070708)" : s === "a" ? "var(--gm-accent,#9EA0A6)" : s; }
  function poseGroup(name, cls) {
    var ps = GOAT_POSES[name]; if (!ps) return "";
    var out = '<g' + (cls ? ' class="' + cls + '"' : '') + '>';
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      out += '<path d="' + p.d + '" fill="' + col(p.f) + '"';
      if (p.s) out += ' stroke="' + scol(p.s) + '" stroke-width="' + (p.w || 1) + '" stroke-linecap="round" stroke-linejoin="round"';
      out += '/>';
    }
    return out + "</g>";
  }

  var CSS =
    ".kgs{background:#0B0D0B;border:1px solid #242A24;border-radius:18px;overflow:hidden;font-family:'Geist',system-ui,sans-serif;text-align:left}" +
    ".kgs-in{display:flex;align-items:center;gap:20px;padding:18px 24px}" +
    ".kgs-stage{width:88px;min-width:88px;height:88px;display:block;color:#EDECE8;--gm-bg:#0B0D0B;--gm-accent:#9EA0A6;--gm-goatee:#7BEA5A}" +
    "@media(max-width:640px){.kgs-in{flex-wrap:wrap}.kgs-stage{width:72px;min-width:72px;height:72px}}" +
    ".kgs-txt{flex:1;min-width:0}" +
    ".kgs-kick{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:#7BEA5A}" +
    ".kgs-line{font-size:clamp(16px,2.2vw,20px);font-weight:800;letter-spacing:-.03em;color:#EDEDE8;margin-top:3px}" +
    ".kgs-sub{font-size:12.5px;color:#8C9389;font-weight:300;margin-top:2px}" +
    /* two-frame snap cut: neutral holds, pose snaps in, snaps back */
    ".kgs-f-base{animation:kgsA 3.8s steps(1,end) infinite}" +
    ".kgs-f-pose{animation:kgsB 3.8s steps(1,end) infinite}" +
    "@keyframes kgsA{0%,62%{opacity:1}63%,86%{opacity:0}87%,100%{opacity:1}}" +
    "@keyframes kgsB{0%,62%{opacity:0}63%,86%{opacity:1}87%,100%{opacity:0}}" +
    "@media(prefers-reduced-motion:reduce){.kgs-f-base{animation:none;opacity:0}.kgs-f-pose{animation:none;opacity:1}}";

  function boot() {
    var mounts = document.querySelectorAll("[data-goat-spot]:not([data-kgs])");
    if (!mounts.length) return;
    if (!document.getElementById("kgs-style")) {
      var st = document.createElement("style");
      st.id = "kgs-style"; st.textContent = CSS;
      document.head.appendChild(st);
    }
    mounts.forEach(function (m) {
      m.setAttribute("data-kgs", "1");
      var mode = m.getAttribute("data-goat") || "one-brow";
      var goat;
      if (mode === "both-brows-anim") {
        goat = poseGroup("neutral", "kgs-f-base") + poseGroup("both brows", "kgs-f-pose");
      } else if (mode === "one-brow") {
        goat = poseGroup("one brow", "");
      } else {
        goat = poseGroup(GOAT_POSES[mode] ? mode : "neutral", "");
      }
      var el = document.createElement("div");
      el.className = "kgs";
      var line = m.getAttribute("data-line") || "";
      var sub = m.getAttribute("data-sub") || "";
      el.setAttribute("role", "img");
      el.setAttribute("aria-label", (line + " " + sub).trim());
      el.innerHTML =
        '<div class="kgs-in"><svg class="kgs-stage" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + goat + "</svg>" +
        '<div class="kgs-txt"><div class="kgs-kick"></div><div class="kgs-line"></div><div class="kgs-sub"></div></div></div>';
      el.querySelector(".kgs-kick").textContent = m.getAttribute("data-kick") || "the goat";
      el.querySelector(".kgs-line").textContent = line;
      el.querySelector(".kgs-sub").textContent = sub;
      m.appendChild(el);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
