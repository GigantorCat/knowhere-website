// _dev/f26-social.js — social links on the website (Cat, 4 Sep 2026, release day).
// The five handles live ONCE, in knowhere-marks.js (the brand file, a plain <script> at the
// top of all 14 pages). The footer nav (knowhere-footer.js, loaded lazily by the dc-runtime)
// and the mobile menu (knowhere-mobile-menu.js, deferred) both read them from there —
// whichever builds first, the list is already on window. Icons are Font Awesome Free brand
// glyphs (CC BY 4.0), vendored in vendor/social/, recoloured via CSS mask so they take the
// link colour (grey → brat green on hover). No list = no row; nothing else changes.
// Exact-string patcher: every anchor must match exactly once; baks in _dev/f26-social-baks/.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const BAK = path.join(__dirname, 'f26-social-baks');
fs.mkdirSync(BAK, { recursive: true });
function rd(f) { return fs.readFileSync(path.join(ROOT, f), 'utf8'); }
const pending = {};
function wr(f, s) { pending[f] = s; } // nothing touches disk until every anchor has matched
function bak(f) { fs.copyFileSync(path.join(ROOT, f), path.join(BAK, path.basename(f))); }
function rep(s, from, to, label) {
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(label + ': anchor matched ' + n + 'x — ' + from.slice(0, 70));
  return s.replace(from, () => to);
}

// ── 1. knowhere-marks.js → the handles + the one HTML builder ─────────────────
{
  const f = 'knowhere-marks.js'; bak(f); let s = rd(f);
  s = rep(s,
    "  window.KnowhereMarks = { logoSvg: logoSvg, mount: mount, colors: SUBCOLORS };",
    "  // the five handles (Cat, 4 Sep 2026) — read by the footer nav and the mobile menu.\n" +
    "  // Glyphs: vendor/social/*.svg (Font Awesome Free brands, CC BY 4.0), coloured by CSS mask.\n" +
    "  var SOCIAL = [\n" +
    "    ['Instagram', 'https://www.instagram.com/knowheregoat/', 'instagram'],\n" +
    "    ['TikTok', 'https://www.tiktok.com/@knowhere.me', 'tiktok'],\n" +
    "    ['YouTube', 'https://www.youtube.com/@knowhere-me', 'youtube'],\n" +
    "    ['Facebook', 'https://www.facebook.com/profile.php?id=61594042136502', 'facebook-f'],\n" +
    "    ['LinkedIn', 'https://www.linkedin.com/company/knowhere-me/', 'linkedin-in']\n" +
    "  ];\n" +
    "  function socialHtml(cls){\n" +
    "    return SOCIAL.map(function(h){\n" +
    "      return '<a class=\"'+cls+'\" href=\"'+h[1]+'\" target=\"_blank\" rel=\"noopener\" aria-label=\"knowhere on '+h[0]+'\" title=\"'+h[0]+'\">'+\n" +
    "        '<i style=\"--ico:url(vendor/social/'+h[2]+'.svg)\" aria-hidden=\"true\"></i></a>';\n" +
    "    }).join('');\n" +
    "  }\n" +
    "  window.KnowhereMarks = { logoSvg: logoSvg, mount: mount, colors: SUBCOLORS, social: SOCIAL, socialHtml: socialHtml };", 'marks export');
  wr(f, s);
}

// ── 2. knowhere-footer.js → v20 ────────────────────────────────────────────────
{
  const f = 'knowhere-footer.js'; bak(f); let s = rd(f);
  s = rep(s,
    '// v19: PRESS added to footer nav (Cat, 1 Sep).',
    '// v20: SOCIAL row in the footer nav (Cat, 4 Sep, release day) — Instagram · TikTok ·\n' +
    '//      YouTube · Facebook · LinkedIn, from KnowhereMarks.social (knowhere-marks.js).\n' +
    '// v19: PRESS added to footer nav (Cat, 1 Sep).', 'footer header');
  s = rep(s,
    "            '.kfn-legal:hover{color:#8C8B87}';",
    "            '.kfn-legal:hover{color:#8C8B87}' +\n" +
    "            '.kfn-socs{display:flex;align-items:center;gap:2px;margin-left:auto}' +\n" +
    "            '.kfn-soc{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:10px;color:#9b9a96;text-decoration:none;transition:color .16s,background .16s}' +\n" +
    "            '.kfn-soc:hover,.kfn-soc:focus-visible{color:#7BEA5A;background:rgba(123,234,90,.08)}' +\n" +
    "            '.kfn-soc:focus-visible{outline:2px solid #7BEA5A;outline-offset:2px}' +\n" +
    "            '.kfn-soc i{display:block;width:17px;height:17px;background:currentColor;-webkit-mask:var(--ico) center/contain no-repeat;mask:var(--ico) center/contain no-repeat}';", 'footer css');
  s = rep(s,
    "                '<a class=\"kfn-link\" href=\"talk-to-us.html\">talk to us</a>' +\n" +
    "              '</div>' +",
    "                '<a class=\"kfn-link\" href=\"talk-to-us.html\">talk to us</a>' +\n" +
    "                (window.KnowhereMarks && window.KnowhereMarks.socialHtml ? '<span class=\"kfn-socs\">' + window.KnowhereMarks.socialHtml('kfn-soc') + '</span>' : '') +\n" +
    "              '</div>' +", 'footer links row');
  wr(f, s);
}

// ── 3. knowhere-mobile-menu.js → v7 ────────────────────────────────────────
{
  const f = 'knowhere-mobile-menu.js'; bak(f); let s = rd(f);
  s = rep(s,
    '   knowhere-mobile-menu.js v5 — shared mobile menu (≤820px).',
    '   knowhere-mobile-menu.js v7 — shared mobile menu (≤820px).\n' +
    '   v7: social icon row under "Log in" (Cat, 4 Sep) — from KnowhereMarks.socialHtml\n' +
    '   (knowhere-marks.js, the one list). No list = no row.', 'menu header');
  s = rep(s,
    '    "@media (max-width:820px){.kwm-btn{display:flex}nav a[href*=\\"app.knowhere.me\\"]{display:none !important}}";',
    '    ".kwm-panel .kwm-soc{display:flex;align-items:center;gap:2px;padding:6px 8px 2px;margin-top:4px;border-top:1px solid rgba(255,255,255,.08)}" +\n' +
    '    ".kwm-panel .kwm-soc a{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border-radius:11px;color:#8C8B87}" +\n' +
    '    ".kwm-panel .kwm-soc a i{display:block;width:17px;height:17px;background:currentColor;-webkit-mask:var(--ico) center/contain no-repeat;mask:var(--ico) center/contain no-repeat}" +\n' +
    '    "@media (max-width:820px){.kwm-btn{display:flex}nav a[href*=\\"app.knowhere.me\\"]{display:none !important}}";', 'menu css');
  s = rep(s,
    '      panel.innerHTML = LINKS;',
    '      panel.innerHTML = LINKS + (window.KnowhereMarks && window.KnowhereMarks.socialHtml ? \'<div class="kwm-soc">\' + window.KnowhereMarks.socialHtml(\'\') + \'</div>\' : \'\');', 'menu links');
  wr(f, s);
}

// ── 4. the 14 pages: cache-bust all three scripts ─────────────────────────────
const pages = fs.readdirSync(ROOT).filter(f => /\.html$/.test(f));
if (pages.length !== 14) throw new Error('expected 14 pages, found ' + pages.length + ': ' + pages.join(' '));
for (const f of pages) {
  bak(f); let s = rd(f);
  s = rep(s, '"./knowhere-marks.js"', '"./knowhere-marks.js?v=2"', f + ' marks v');
  s = rep(s, 'knowhere-footer.js?v=19"', 'knowhere-footer.js?v=20"', f + ' footer v');
  s = rep(s, 'knowhere-mobile-menu.js?v=6"', 'knowhere-mobile-menu.js?v=7"', f + ' menu v');
  wr(f, s);
}
for (const f of Object.keys(pending)) fs.writeFileSync(path.join(ROOT, f), pending[f]);
console.log('f26-social: marks + footer v20 + mobile menu v7 · ' + pages.length + ' pages bumped · baks in ' + path.relative(ROOT, BAK));
