#!/usr/bin/env python3
"""KW:UTIL-V1 (18 Oct 2026) — /press and /talk-to-us lose the giant glass title too. Cat, Sun 18 Oct 19:17.
Both are content-first (the facts; the form), so no text-only screen: an eyebrow names the page above the heading, the content
stays in the first screen, and each page's own particle wave moves under the content as a divider (press) or to the hero's
foot (talk to us) instead of sitting behind a title. Idempotent per page on KW:UTIL-V1. Backs up to _patches/landing-v2/bak-util1-<stamp>/.
Run from the website repo root:  python3 _patches/landing-v2/apply-utility-v1.py [--dry]
"""
import os, sys, shutil, time
DRY = '--dry' in sys.argv
ROOT = os.getcwd()
def swap(s, old, new, n=1, label=''):
    c = s.count(old); assert c == n, f'{label}: expected {n} match(es), found {c}'; return s.replace(old, new)
out = {}

p = 'press.html'; s = open(os.path.join(ROOT, p), encoding='utf-8').read()
if 'KW:UTIL-V1' not in s:
    s = swap(s, '    .kw-tk .hero{padding-top:clamp(140px,20vh,200px)}\n  }\n</style>\n', '''    .kw-tk .hero{padding-top:clamp(140px,20vh,200px)}
  }
  /* KW:UTIL-V1 (18 Oct 2026): no glass title; the wave runs under the intro as a divider */
  .kw-tk #tkHero .page-banner{position:relative;top:auto;left:auto;right:auto;height:110px;margin:18px 0 0}
  @media (max-width:700px){.kw-tk #tkHero .page-banner{height:80px;margin-top:12px}}
</style>
''', 1, p + ' css')
    s = swap(s, '''    <section id="tkHero" style="position:relative;padding:6vh 0 10px">
      <div class="page-banner" aria-hidden="true"><div class="pb-host" id="pbHost"></div></div>
      <div class="prose" data-reveal>
        <div class="eyebrow-sm" style="text-align:center">for journalists &amp; podcasters</div>''', '''    <!-- KW:UTIL-V1 (18 Oct 2026): eyebrow names the page; the wave sits under the intro. Paints from this markup alone. -->
    <section id="tkHero" style="position:relative;padding:6vh 0 10px">
      <div class="prose">
        <div class="eyebrow-sm" style="text-align:center">Press &middot; for journalists &amp; podcasters</div>''', 1, p + ' hero')
    i = s.index('<section id="tkHero"'); j = s.index('    </section>', i)
    s = s[:j] + '      <div class="page-banner" aria-hidden="true"><div class="pb-host" id="pbHost"></div></div>\n' + s[j:]
    s = swap(s, "  glassTitle(host,'Press');", "  /* KW:UTIL-V1: no glass title */", 1, p + ' glass')
    out[p] = s

p = 'talk-to-us.html'; s = open(os.path.join(ROOT, p), encoding='utf-8').read()
if 'KW:UTIL-V1' not in s:
    s = swap(s, '    .kw-tk .hero{padding-top:clamp(140px,20vh,200px)}\n  }\n</style>\n', '''    .kw-tk .hero{padding-top:clamp(140px,20vh,200px)}
  }
  /* KW:UTIL-V1 (18 Oct 2026): no glass title; eyebrow above the heading; the waves at the hero's foot */
  .kw-tk #tkHero .page-banner{position:relative;top:auto;left:auto;right:auto;width:100%}
  .kw-tk #tkHero{padding-top:44px}
  @media (max-width:700px){.kw-tk #tkHero{padding-top:28px}}
</style>
''', 1, p + ' css')
    s = swap(s, '''      <div class="page-banner" aria-hidden="true" style="height:clamp(150px,22vh,240px);flex-shrink:0"><div class="pb-host" id="pbHost"></div></div>
      <div class="fs-inner" data-reveal style="margin:0 auto;max-width:820px;width:100%">
        <h2''', '''      <!-- KW:UTIL-V1 (18 Oct 2026): eyebrow names the page; the form stays in the first screen; the waves move to the foot -->
      <div class="fs-inner" style="margin:0 auto;max-width:820px;width:100%">
        <div class="eyebrow-sm" style="text-align:center">Talk to us</div>
        <h2''', 1, p + ' hero')
    s = swap(s, '''      </div>
    </section>
  </main>''', '''      </div>
      <div class="page-banner" aria-hidden="true" style="height:clamp(110px,16vh,170px);flex-shrink:0"><div class="pb-host" id="pbHost"></div></div>
    </section>
  </main>''', 1, p + ' foot')
    s = swap(s, "  glassTitle(host,'Talk to us');", "  /* KW:UTIL-V1: no glass title */", 1, p + ' glass')
    out[p] = s

if DRY:
    print('dry run OK — all anchors matched on', len(out), 'page(s); nothing written'); sys.exit(0)
bak = os.path.join(ROOT, '_patches', 'landing-v2', 'bak-util1-' + time.strftime('%Y%m%d-%H%M%S'))
os.makedirs(bak, exist_ok=True)
for f, s in out.items():
    shutil.copy2(os.path.join(ROOT, f), os.path.join(bak, f))
    open(os.path.join(ROOT, f), 'w', encoding='utf-8').write(s)
    back = open(os.path.join(ROOT, f), encoding='utf-8').read()
    assert 'KW:UTIL-V1' in back and back.count('id="pbHost"') == 1 and "glassTitle(host,'" not in back, 'receipt: ' + f
print('applied ✓ to', ', '.join(out) or 'nothing', ' backup:', os.path.relpath(bak, ROOT))
