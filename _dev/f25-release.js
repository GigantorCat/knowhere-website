/* f25-release.js — THE FLIP (Cat's ruling, 4 Sep 2026: "get the site fully released today"). Waitlist was empty.
   Exact-string patches, one match each. Teachers stay a waitlist by ruling (R2) — their forms keep working. */
const fs = require('fs');
function patch(file, edits) {
  let s = fs.readFileSync(file, 'utf8');
  for (const [label, from, to, all] of edits) {
    const n = s.split(from).length - 1;
    if (all ? n < 1 : n !== 1) throw new Error(file + ' · ' + label + ': anchor matched ' + n);
    s = all ? s.split(from).join(to) : s.replace(from, () => to);
    console.log('✓ ' + file + ' · ' + label + (all ? ' ×' + n : ''));
  }
  fs.writeFileSync(file, s);
}
const SIGNUP = 'https://app.knowhere.me/signup';

/* 1. the script: LIVE now means "stop hijacking CTAs" — the inline forms (waitlist.html, teacher seats) keep working */
patch('knowhere-waitlist.js', [
  ['LIVE skips interception only',
   "  if (window.KNOWHERE_LIVE) return;\n  if (window.KnowhereWaitlist) return;",
   "  /* 4 Sep 2026 — LIVE. The CTA interception below is skipped; open/mount stay available so the teacher\n     waitlist (R2 by ruling) and /waitlist.html keep working. */\n  var LIVE = !!window.KNOWHERE_LIVE;\n  if (window.KnowhereWaitlist) return;"],
  ['click interception gated',
   "  document.addEventListener('click', function (e) {\n    var a = e.target.closest && e.target.closest('a'); if (!a || !a.matches(CTA_SEL)) return;",
   "  if (!LIVE) document.addEventListener('click', function (e) {\n    var a = e.target.closest && e.target.closest('a'); if (!a || !a.matches(CTA_SEL)) return;"],
  ['auto-open gated',
   "    if (/[?#]waitlist/.test(location.href)) openModal(",
   "    if (!LIVE && /[?#]waitlist/.test(location.href)) openModal("],
]);

/* 2. every page: the switch + cache-bust */
for (const f of fs.readdirSync('.').filter(f => f.endsWith('.html'))) {
  const s = fs.readFileSync(f, 'utf8');
  if (!s.includes('knowhere-waitlist.js?v=6')) continue;
  patch(f, [['LIVE switch', '<script src="./knowhere-waitlist.js?v=6" defer></script>', '<script>window.KNOWHERE_LIVE=true</script>\n<script src="./knowhere-waitlist.js?v=7" defer></script>']]);
}

/* 3. pricing: the three plan CTAs + the meta copy */
patch('pricing.html', [
  ['plan CTAs', '<a class="soft" href="experience-it.html">join the waitlist — 7 days free at launch</a>', '<a class="soft" href="' + SIGNUP + '">start knowing — free for 7 days</a>', true],
  ['featured CTA', '<a class="cta" href="experience-it.html">join the waitlist — 7 days free at launch</a>', '<a class="cta" href="' + SIGNUP + '">start knowing — free for 7 days</a>'],
  ['meta copy', 'Seven days free at launch.', 'Seven days free.', true],
]);

/* 4. index: three pre-launch lines */
patch('index.html', [
  ['hero eyebrow', 'Opening before the HSC &amp; VCE exams · <span style="color:#7BEA5A">join the waitlist</span>', 'Live now for the HSC &amp; VCE · <span style="color:#7BEA5A">seven days free</span>'],
  ['cert chips', '<span class="kc-chip kc-live"><i></i>VCE — at launch</span>\n          <span class="kc-chip kc-live"><i></i>HSC — at launch</span>', '<span class="kc-chip kc-live"><i></i>VCE — live</span>\n          <span class="kc-chip kc-live"><i></i>HSC — live</span>'],
  ['closing copy', "You're one letter away. Opening before the HSC and VCE exams — join the waitlist, tell us how you learn, and watch your first concept come alive the day the doors open.", "You're one letter away. Tell us how you learn — it takes a minute — and watch your first concept come alive tonight."],
  ['closing kicker', 'seven days free at launch', 'seven days free'],
]);

/* 5. parents: the waitlist CTAs become the real thing */
patch('for-parents.html', [
  ['parent CTAs', '<a class="cta" href="waitlist.html" data-waitlist data-waitlist-type="parent">Join the waitlist</a>', '<a class="cta" href="' + SIGNUP + '">Start their free week</a>', true],
  ['parent closing copy', 'Join the waitlist now. When the doors open, they tell knowhere how they learn — it takes a minute — and you watch a concept land properly, maybe for the first time.', 'Start tonight. They tell knowhere how they learn — it takes a minute — and you watch a concept land properly, maybe for the first time.'],
]);

/* 6. 404: the quiet link */
patch('404.html', [['quiet link', '<a class="quiet" href="waitlist.html" data-waitlist>or join the waitlist</a>', '<a class="quiet" href="https://app.knowhere.me/login">or log in</a>']]);
