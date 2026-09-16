/* knowhere-handoff.js v3 (Goaty in the sent state) — v2: "send this to a parent" on the site (KW:HANDOFF, 16 Sep 2026; KW:HANDOFF-GOAT same day).
   Any [data-kw-handoff="<where>"] opens a small sheet: the parent's email + the kid's first name → POST /api/handoff
   and the Goat emails the parent (the kid's one-liner on top, what-it-is + a real "start their free week" button
   below the line — emails.js handoffParent). The sheet also keeps the plain one-liner for text/WhatsApp:
   navigator.share where it exists, mailto elsewhere. Umami handoff_sent {where, via: email|share|mailto}.
   Site only — the app's plan picker keeps its own share link (f47); a kid there already has an account.
   Copy follows the pass while it is on sale (same close as knowhere-pass.js: Mon 26 Oct 2026 23:59 AEDT). */
(function () {
  if (window.__kwHandoffV2) return; window.__kwHandoffV2 = true;
  var CLOSE = Date.UTC(2026, 9, 26, 12, 59);
  var BASE = "https://knowhere.me/for-parents?as=parent&utm_source=handoff&utm_medium=share&utm_campaign=kw-launch-2026&utm_content=";
  function text() {
    return Date.now() < CLOSE
      ? "I've been using a study app called knowhere and it's actually helping. It's free for a week, then $49 once till the last exam — no subscription. Can you look?"
      : "I've been using a study app called knowhere and it's actually helping. It's free for a week first. Can you look?";
  }
  function track(where, via) { try { if (window.umami) window.umami.track("handoff_sent", { where: where, via: via }); } catch (e) {} }

  /* the plain version — text / WhatsApp / email client */
  function share(where) {
    var url = BASE + encodeURIComponent(where), t = text();
    var via = (typeof navigator !== "undefined" && navigator.share) ? "share" : "mailto";
    track(where, via);
    if (via === "share") { navigator.share({ title: "knowhere", text: t, url: url }).catch(function () {}); return; }
    window.location.href = "mailto:?subject=" + encodeURIComponent("Can you look at this? (knowhere)") + "&body=" + encodeURIComponent(t + "\n\n" + url);
  }
  window.kwHandoff = share;

  /* the sheet */
  var CSS =
    ".kwh-bg{position:fixed;inset:0;z-index:1200;background:rgba(7,7,8,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:flex-end;justify-content:center;padding:0;opacity:0;transition:opacity .18s}" +
    ".kwh-bg.in{opacity:1}" +
    "@media (min-width:640px){.kwh-bg{align-items:center;padding:20px}}" +
    ".kwh{width:100%;max-width:440px;background:#101318;border:1px solid rgba(255,255,255,.1);border-top:3px solid #7BEA5A;border-radius:20px 20px 0 0;padding:22px 20px 24px;color:#EDECE8;font-family:'Geist',system-ui,-apple-system,sans-serif;box-shadow:0 30px 80px rgba(0,0,0,.6);transform:translateY(12px);transition:transform .22s cubic-bezier(.16,1,.3,1)}" +
    ".kwh-bg.in .kwh{transform:none}" +
    "@media (min-width:640px){.kwh{border-radius:20px;padding:26px 26px 26px}}" +
    ".kwh *{box-sizing:border-box}" +
    ".kwh .k{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:#7BEA5A;margin:0 0 8px}" +
    ".kwh h3{font-size:22px;font-weight:800;letter-spacing:-.03em;line-height:1.12;margin:0 0 8px;text-transform:lowercase}" +
    ".kwh p{font-size:14px;line-height:1.55;color:#9B9A96;margin:0 0 16px}" +
    ".kwh label{display:block;font-size:12px;font-weight:600;color:#9B9A96;margin:0 0 6px}" +
    ".kwh input{width:100%;font-family:inherit;font-size:16px;color:#EDECE8;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);border-radius:11px;padding:12px 13px;margin:0 0 12px;outline:none}" +
    ".kwh input:focus{border-color:#7BEA5A}" +
    ".kwh .hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}" +
    ".kwh .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:4px}" +
    ".kwh .go{flex:1 1 auto;font-family:inherit;font-size:15px;font-weight:700;color:#070708;background:#7BEA5A;border:none;border-radius:12px;padding:13px 20px;cursor:pointer;text-transform:lowercase;transition:transform .16s,opacity .16s}" +
    ".kwh .go:hover{transform:translateY(-1px)}.kwh .go[disabled]{opacity:.55;cursor:default;transform:none}" +
    ".kwh .x{font-family:inherit;font-size:13px;color:#9B9A96;background:transparent;border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:12px 16px;cursor:pointer}" +
    ".kwh .x:hover{color:#EDECE8;border-color:rgba(255,255,255,.3)}" +
    ".kwh .alt{margin:16px 0 0;font-size:13px;color:#9B9A96;line-height:1.5}" +
    ".kwh .alt button{font-family:inherit;font-size:13px;color:#7BEA5A;background:none;border:none;padding:0;cursor:pointer;text-decoration:underline;text-underline-offset:3px}" +
    ".kwh .err{font-size:13px;color:#FAC775;margin:-6px 0 12px;min-height:0}" +
    ".kwh .done{text-align:center;padding:10px 0 4px}" +
    ".kwh .done .goat{width:112px;height:112px;display:block;margin:0 auto 12px;border-radius:50%;border:1px solid rgba(123,234,90,.35);box-shadow:0 0 0 6px rgba(123,234,90,.06);animation:kwhPop .5s cubic-bezier(.16,1,.3,1)}" +  /* the PNG carries its own #0E100D square; clipped to a disc it reads as a badge */
    "@keyframes kwhPop{0%{transform:scale(.6) rotate(-8deg);opacity:0}100%{transform:none;opacity:1}}" +
    "@media (prefers-reduced-motion:reduce){.kwh .done .goat{animation:none}}" +
    ".kwh .done h3{font-size:24px}" +
    ".kwh button:focus-visible,.kwh input:focus-visible{outline:2px solid #7BEA5A;outline-offset:2px}";
  var styled = false;
  function ensureCss() { if (styled) return; styled = true; var s = document.createElement("style"); s.id = "kwh-css"; s.textContent = CSS; document.head.appendChild(s); }

  var open = null;
  function close() { if (!open) return; var bg = open, last = bg.__last; open = null; bg.classList.remove("in"); setTimeout(function () { bg.remove(); }, 200); document.removeEventListener("keydown", onKey); if (last && last.focus) last.focus(); }
  function onKey(e) { if (e.key === "Escape") close(); }

  function sheet(where) {
    ensureCss(); if (open) close();
    var bg = document.createElement("div"); bg.className = "kwh-bg"; bg.__last = document.activeElement;
    bg.innerHTML =
      '<form class="kwh" role="dialog" aria-modal="true" aria-labelledby="kwh-h" novalidate>' +
        '<p class="k">the handoff</p>' +
        '<h3 id="kwh-h">send this to a parent</h3>' +
        '<p>The Goat emails them what knowhere is and why you want it — your name on top, a button to start your free week underneath. You add the please in person.</p>' +
        '<label for="kwh-email">their email</label><input id="kwh-email" name="parentEmail" type="email" inputmode="email" autocomplete="off" placeholder="mum@… dad@… whoever’s card it is" required>' +
        '<label for="kwh-name">your first name</label><input id="kwh-name" name="firstName" type="text" autocomplete="given-name" maxlength="24" placeholder="so they know it’s you">' +
        '<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<div class="err" aria-live="polite"></div>' +
        '<div class="row"><button type="submit" class="go">send it</button><button type="button" class="x">not now</button></div>' +
        '<p class="alt">Rather text it? <button type="button" class="plain">send the plain version instead →</button></p>' +
      '</form>';
    document.body.appendChild(bg);
    requestAnimationFrame(function () { bg.classList.add("in"); });
    var form = bg.querySelector("form"), err = bg.querySelector(".err"), go = bg.querySelector(".go");
    bg.addEventListener("click", function (e) { if (e.target === bg) close(); });
    bg.querySelector(".x").addEventListener("click", close);
    bg.querySelector(".plain").addEventListener("click", function () { close(); share(where); });
    document.addEventListener("keydown", onKey);
    setTimeout(function () { bg.querySelector("#kwh-email").focus(); }, 60);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (form.parentEmail.value || "").trim(), name = (form.firstName.value || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.textContent = "That email doesn’t look right."; form.parentEmail.focus(); return; }
      err.textContent = ""; go.disabled = true; go.textContent = "sending…";
      fetch("/api/handoff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ parentEmail: email, firstName: name, where: where, website: form.website.value }) })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (j) {
          if (!j || !j.ok) { err.textContent = (j && j.error) || "Couldn’t send that just now. Try the plain version."; go.disabled = false; go.textContent = "send it"; return; }
          track(where, "email");
          /* the real Goaty, winking — the co-conspirator. /email-assets/goat-wink.png is the same head the parent's email wears. */
          form.innerHTML = '<div class="done"><img class="goat" src="/email-assets/goat-wink.png" width="112" height="112" alt="The Goat, winking"><h3>your parent has been summoned.</h3><p>The Goat’s in their inbox with the whole story. Your job now: be charming at dinner.</p><div class="row" style="justify-content:center"><button type="button" class="x">done</button></div></div>';
          form.querySelector(".x").addEventListener("click", close);
        })
        .catch(function () { err.textContent = "Couldn’t send that just now. Try the plain version."; go.disabled = false; go.textContent = "send it"; });
    });
    open = bg;
  }

  document.addEventListener("click", function (e) {
    var el = e.target && e.target.closest ? e.target.closest("[data-kw-handoff]") : null;
    if (!el) return;
    e.preventDefault();
    sheet(el.getAttribute("data-kw-handoff") || "site");
  });
})();
