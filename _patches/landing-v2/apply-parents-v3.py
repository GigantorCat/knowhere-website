#!/usr/bin/env python3
"""KW:PAR-V3 (18 Oct 2026) — Cat's notes on /for-parents V2, Sun 18 Oct 15:15.

  1. Banner: the hearts come back (the page's own particle formation: ECG trace + beating heart), at the foot of the
     banner where the network was. No glass title on it any more. (Teachers will do the same with the apples.)
  2. An eyebrow back above the headline: FOR PARENTS.
  3. The block under the widget: "The care factor comes first." -> "Understanding comes first. The care follows."
  4. Its eyebrow loses "NSW and Victoria" (HSC & VCE already says it).

Runs on top of KW:PAR-V2. Idempotent on the KW:PAR-V3 marker. Backs up to _patches/landing-v2/bak-par3-<stamp>/.
Run from the website repo root:  python3 _patches/landing-v2/apply-parents-v3.py [--dry]
"""
import os, sys, shutil, time

DRY = '--dry' in sys.argv
ROOT = os.getcwd()
P = os.path.join(ROOT, 'for-parents.html')
src = open(P, encoding='utf-8').read()
if 'KW:PAR-V3' in src:
    print('already applied (KW:PAR-V3 marker present) — nothing to do'); sys.exit(0)
assert 'KW:PAR-V2' in src, 'V2 is not applied — run apply-parents-v2.py first'

def swap(s, old, new, n=1, label=''):
    c = s.count(old)
    assert c == n, f'{label}: expected {n} match(es), found {c}'
    return s.replace(old, new)

# ── CSS ───────────────────────────────────────────────────────────────────────────────────
src = swap(src, '  @media (prefers-reduced-motion:reduce){.kw-par .kp-cue{animation:none}}\n</style>',
'''  @media (prefers-reduced-motion:reduce){.kw-par .kp-cue{animation:none}}
  /* KW:PAR-V3 (18 Oct 2026): the hearts at the banner's foot (was the network); the FOR PARENTS eyebrow */
  /* the heart sits just above the sticky bar with PLAY WITH IT inside it; on a phone the strip runs wider than the
     screen so the gap the ECG leaves round the heart is wider than the cue (the line never crosses the words) */
  .kw-par .kp-ban .kp-pb{position:absolute;left:0;right:0;bottom:40px;height:34%;pointer-events:none;z-index:0}
  .kw-par .kp-ban .kp-pb .pb-host{position:absolute;inset:0;-webkit-mask-image:none;mask-image:none}
  .kw-par .kp-ban .kp-pb .pb-host canvas{position:absolute;inset:0;width:100%;height:100%}
  .kw-par .kp-ban .kp-pb [data-pb-glass]{display:none !important}
  .kw-par .kp-ban .kp-cue{bottom:calc(140px + env(safe-area-inset-bottom))}
  .kw-par .kp-ban-eye{margin:0 0 22px;font-size:11.5px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:var(--brat)}
  @media (max-width:760px){
    .kw-par .kp-ban .kp-pb{left:-35%;right:-35%;bottom:66px;height:29%}
    .kw-par .kp-ban .kp-cue{bottom:calc(142px + env(safe-area-inset-bottom))}
    .kw-par .kp-ban-eye{font-size:10.5px;margin-bottom:18px}
  }
</style>''', 1, 'css')

# ── banner markup ─────────────────────────────────────────────────────────────────────────
src = swap(src, '''  <!-- A · the banner: one screen of text, the network along the bottom. Paints from this markup alone. -->
  <header class="kp-ban" id="parBan">
    <canvas class="kp-net" data-kw-network aria-hidden="true"></canvas>
    <div class="wrap kp-ban-in">
      <h1>''',
'''  <!-- A · the banner: one screen of text, the hearts along the bottom (KW:PAR-V3; V2 had the network). Paints from this markup alone. -->
  <header class="kp-ban" id="parBan">
    <div class="kp-pb" aria-hidden="true"><div class="pb-host" id="pbHost"><canvas id="pbCv"></canvas></div></div>
    <div class="wrap kp-ban-in">
      <p class="kp-ban-eye">For parents</p>
      <h1>''', 1, 'banner')

# ── the care block ────────────────────────────────────────────────────────────────────────
src = swap(src, '      <div class="eyebrow">HSC &amp; VCE &middot; Year 11 and 12 &middot; <span>NSW and Victoria</span></div>\n      <h2>The care factor <span style="color:var(--brat)">comes first</span>.</h2>',
           '      <div class="eyebrow">HSC &amp; VCE &middot; Year 11 and 12</div>\n      <h2>Understanding comes first.<br><span style="color:var(--brat)">The care follows.</span></h2>', 1, 'care block')

# ── script: hearts instead of the network ─────────────────────────────────────────────────
src = swap(src, '''      /* KW:PAR-V2: the big particle header is gone; the network runs along the banner's foot instead */
      try{ if(window.KnowhereNetwork) window.KnowhereNetwork.boot(); }catch(e){}''',
'''      /* KW:PAR-V3: the page's hearts run along the banner's foot (no title on them; the eyebrow says "for parents") */
      try{ this._stopBanner=window.KnowhereParticleBanner(root,'','heart'); }catch(e){}''', 1, 'boot')
src = swap(src, '<script src="./knowhere-network.js?v=1" defer></script><!-- KW:PAR-V2 -->\n', '', 1, 'network tag')

if DRY:
    print('dry run OK — all anchors matched; nothing written'); sys.exit(0)
stamp = time.strftime('%Y%m%d-%H%M%S')
bak = os.path.join(ROOT, '_patches', 'landing-v2', 'bak-par3-' + stamp)
os.makedirs(bak, exist_ok=True)
shutil.copy2(P, os.path.join(bak, 'for-parents.html'))
open(P, 'w', encoding='utf-8').write(src)
back = open(P, encoding='utf-8').read()
for needle in ['KW:PAR-V3', '<p class="kp-ban-eye">For parents</p>', 'Understanding comes first.', "KnowhereParticleBanner(root,'','heart')", 'id="pbHost"']:
    assert needle in back, 'receipt missing: ' + needle
for gone in ['NSW and Victoria</span></div>\n      <h2>', 'data-kw-network', 'knowhere-network.js']:
    assert gone not in back, 'still present: ' + gone
print('applied ✓  backup:', os.path.relpath(bak, ROOT))
