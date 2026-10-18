#!/usr/bin/env python3
"""KW:EXP-V1 (18 Oct 2026) — /experience-it, Cat, Sun 18 Oct 18:46. Not the full text banner: this page's ruled job is "the
concept IS the first screen" (17 Oct), so a text screen would push the thing you play with below the fold. Instead the giant
"Experience it" glass title (a third of the first screen) goes, an EXPERIENCE IT eyebrow sits above the h1 (the same eyebrow
as the other pages), and the subject pills + live widget move up into the first screen. No foot animation: the widget is the
animation. Idempotent on KW:EXP-V1. Backs up to _patches/landing-v2/bak-exp1-<stamp>/.
Run from the website repo root:  python3 _patches/landing-v2/apply-exp-v1.py [--dry]
"""
import os, sys, shutil, time
DRY = '--dry' in sys.argv
ROOT = os.getcwd(); P = os.path.join(ROOT, 'experience-it.html')
src = open(P, encoding='utf-8').read()
if 'KW:EXP-V1' in src:
    print('already applied (KW:EXP-V1 marker present) — nothing to do'); sys.exit(0)
def swap(s, old, new, n=1, label=''):
    c = s.count(old); assert c == n, f'{label}: expected {n} match(es), found {c}'; return s.replace(old, new)

src = swap(src, '''    .kw-exp .page-hero.kw-open .pill-row .row-label,.kw-exp .page-hero.kw-open .pill-row .more{display:none}
  }
</style>
</helmet>''', '''    .kw-exp .page-hero.kw-open .pill-row .row-label,.kw-exp .page-hero.kw-open .pill-row .more{display:none}
  }
  /* KW:EXP-V1 (18 Oct 2026): no glass title; eyebrow + h1, then the live concept, all in the first screen */
  .kw-exp .page-hero.kw-open{padding-top:44px}
  .kw-exp .page-hero.kw-open .kp-ban-eye{margin:0 auto 14px;font-size:11.5px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:var(--brat);text-align:center}
  @media (max-width:700px){
    .kw-exp .page-hero.kw-open{padding-top:26px}
    .kw-exp .page-hero.kw-open .kp-ban-eye{font-size:10.5px;margin-bottom:10px}
  }
</style>
</helmet>''', 1, 'css')
src = swap(src, '''  <div class="page-hero kw-open">
    <div class="page-banner" aria-hidden="true">
      <div class="pb-host" id="pbHost"><canvas id="pbCv"></canvas></div>
    </div>
    <h1>''', '''  <!-- KW:EXP-V1 (18 Oct 2026): the glass title is gone; the eyebrow names the page; the concept moves up into the first screen -->
  <div class="page-hero kw-open">
    <p class="kp-ban-eye">Experience it</p>
    <h1>''', 1, 'banner')
src = swap(src, "this._stopBanner=window.KnowhereParticleBanner(root,'Experience it','modes');",
           "/* KW:EXP-V1: no particle title on this page any more (the widget is the first screen) */", 1, 'boot')
if DRY:
    print('dry run OK — all anchors matched; nothing written'); sys.exit(0)
bak = os.path.join(ROOT, '_patches', 'landing-v2', 'bak-exp1-' + time.strftime('%Y%m%d-%H%M%S'))
os.makedirs(bak, exist_ok=True); shutil.copy2(P, os.path.join(bak, 'experience-it.html'))
open(P, 'w', encoding='utf-8').write(src)
back = open(P, encoding='utf-8').read()
for n in ['KW:EXP-V1', '<p class="kp-ban-eye">Experience it</p>']:
    assert n in back, 'receipt missing: ' + n
assert 'id="pbHost"' not in back and "KnowhereParticleBanner(root,'Experience it'" not in back
print('applied ✓  backup:', os.path.relpath(bak, ROOT))
