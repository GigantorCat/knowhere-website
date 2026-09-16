/* knowhere-handoff.js — "send this to a parent" on the site (KW:HANDOFF, 16 Sep 2026). The student→parent handoff, v1:
   no server route. Any [data-kw-handoff="<where>"] element opens the Web Share sheet (iMessage/WhatsApp in a thumb) with
   the parent-facing line, or a pre-filled mailto where share does not exist. Umami handoff_sent {where, via} on tap.
   Mirrors f47 in the app word for word; the link lands on for-parents as the parent, tagged utm_source=handoff.
   Copy follows the pass while it is on sale (same close as knowhere-pass.js: Mon 26 Oct 2026 23:59 AEDT). */
(function () {
  var CLOSE = Date.UTC(2026, 9, 26, 12, 59);
  var BASE = "https://knowhere.me/for-parents?as=parent&utm_source=handoff&utm_medium=share&utm_campaign=kw-launch-2026&utm_content=";
  function text() {
    return Date.now() < CLOSE
      ? "I've been using a study app called knowhere and it's actually helping. It's free for a week, then $49 once till the last exam — no subscription. Can you look?"
      : "I've been using a study app called knowhere and it's actually helping. It's free for a week first. Can you look?";
  }
  function track(where, via) { try { if (window.umami) window.umami.track("handoff_sent", { where: where, via: via }); } catch (e) {} }
  function go(where) {
    var url = BASE + encodeURIComponent(where), t = text();
    var via = (typeof navigator !== "undefined" && navigator.share) ? "share" : "mailto";
    track(where, via);
    if (via === "share") { navigator.share({ title: "knowhere", text: t, url: url }).catch(function () {}); return; }
    window.location.href = "mailto:?subject=" + encodeURIComponent("Can you look at this? (knowhere)") + "&body=" + encodeURIComponent(t + "\n\n" + url);
  }
  window.kwHandoff = go;
  document.addEventListener("click", function (e) {
    var el = e.target && e.target.closest ? e.target.closest("[data-kw-handoff]") : null;
    if (!el) return;
    e.preventDefault();
    go(el.getAttribute("data-kw-handoff") || "site");
  });
})();
