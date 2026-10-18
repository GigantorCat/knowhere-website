#!/usr/bin/env python3
"""KW:PRICE-V1 (18 Oct 2026) — /pricing, Cat, Sun 18 Oct 18:55. Like /experience-it, not the full text banner: a pricing page's
job is the prices, so the plans stay in the first screen. The giant "Pricing" glass title goes, a PRICING eyebrow sits above
the h1 (the same eyebrow as the other pages), and the plans move up. The founding line stops promising "forever": it matches
the sticky bar and the app — the rate stays while the plan stays active.
Idempotent on KW:PRICE-V1. Backs up to _patches/landing-v2/bak-price1-<stamp>/.
Run from the website repo root:  python3 _patches/landing-v2/apply-pricing-v1.py [--dry]
"""
import os, sys, shutil, time
DRY = '--dry' in sys.argv
ROOT = os.getcwd(); P = os.path.join(ROOT, 'pricing.html')
src = open(P, encoding='utf-8').read()
if 'KW:PRICE-V1' in src:
    print('already applied (KW:PRICE-V1 marker present) — nothing to do'); sys.exit(0)
def swap(s, old, new, n=1, label=''):
    c = s.count(old); assert c == n, f'{label}: expected {n} match(es), found {c}'; return s.replace(old, new)

src = swap(src, '</style>\n</helmet>', '''  /* KW:PRICE-V1 (18 Oct 2026): no glass title; eyebrow + h1, the plans up in the first screen */
  .kw-price .hero{padding-top:52px}
  .kw-price .hero .kp-ban-eye{margin:0 auto 16px;max-width:none;font-size:11.5px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:var(--brat)}
  @media (max-width:700px){
    .kw-price .hero{padding-top:30px}
    .kw-price .hero .kp-ban-eye{font-size:10.5px;margin-bottom:12px}
  }
</style>
</helmet>''', 1, 'css')
src = swap(src, '''  <header class="hero">
    <div class="hero-bg"></div>
    <div class="page-banner" aria-hidden="true">
      <div class="pb-host" id="pbHost"><canvas id="pbCv"></canvas></div>
    </div>
    <div class="wrap">
      <h1''', '''  <!-- KW:PRICE-V1 (18 Oct 2026): the glass title is gone; the eyebrow names the page; the plans move up -->
  <header class="hero">
    <div class="hero-bg"></div>
    <div class="wrap">
      <p class="kp-ban-eye">Pricing</p>
      <h1''', 1, 'banner')
src = swap(src, 'Founding rate for the first 50. Yours forever.</p>',
           'Founding rate for the first 50. Yours for as long as you stay.<!-- KW:PRICE-V1: no "forever" (the rate stays while the plan stays active) --></p>', 1, 'forever')
src = swap(src, "this._stopBanner=window.KnowhereParticleBanner(root,'Pricing','chart');",
           "/* KW:PRICE-V1: no particle title on this page any more (the plans are the first screen) */", 1, 'boot')
if DRY:
    print('dry run OK — all anchors matched; nothing written'); sys.exit(0)
bak = os.path.join(ROOT, '_patches', 'landing-v2', 'bak-price1-' + time.strftime('%Y%m%d-%H%M%S'))
os.makedirs(bak, exist_ok=True); shutil.copy2(P, os.path.join(bak, 'pricing.html'))
open(P, 'w', encoding='utf-8').write(src)
back = open(P, encoding='utf-8').read()
for n in ['KW:PRICE-V1', '<p class="kp-ban-eye">Pricing</p>', 'Yours for as long as you stay.']:
    assert n in back, 'receipt missing: ' + n
assert 'Yours forever' not in back and 'id="pbHost"' not in back
print('applied ✓  backup:', os.path.relpath(bak, ROOT))
