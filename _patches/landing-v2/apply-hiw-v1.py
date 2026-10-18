#!/usr/bin/env python3
"""KW:HIW-V1 (18 Oct 2026) — /how-it-works gets the Home / for-parents / for-teachers banner. Cat, Sun 18 Oct 18:46.
The big "How it works" glass title goes; its rings (the page's own particle formation) move to the banner's foot, no title
on them; a HOW IT WORKS eyebrow sits above the h1; the scroll cue reads "meet the models". The first screen no longer
waits on JS (data-reveal off the h1 and its line). Idempotent on KW:HIW-V1. Backs up to _patches/landing-v2/bak-hiw1-<stamp>/.
Run from the website repo root:  python3 _patches/landing-v2/apply-hiw-v1.py [--dry]
"""
import os, sys, shutil, time
DRY = '--dry' in sys.argv
ROOT = os.getcwd(); P = os.path.join(ROOT, 'how-it-works.html')
src = open(P, encoding='utf-8').read()
if 'KW:HIW-V1' in src:
    print('already applied (KW:HIW-V1 marker present) — nothing to do'); sys.exit(0)
def swap(s, old, new, n=1, label=''):
    c = s.count(old); assert c == n, f'{label}: expected {n} match(es), found {c}'; return s.replace(old, new)

CSS = '''  /* KW:HIW-V1 (18 Oct 2026): the banner — one screen of text, the rings along the foot (no glass title), eyebrow + cue */
  .kw-hiw .hero.kp-ban{min-height:calc(100vh - 61px);min-height:calc(100svh - 61px);padding:40px 0 clamp(250px,30vh,290px);justify-content:center;overflow:hidden}
  .kw-hiw .kp-ban .kp-pb{position:absolute;left:0;right:0;bottom:80px;height:clamp(150px,20vh,190px);pointer-events:none;z-index:0}
  .kw-hiw .kp-ban .kp-pb .pb-host{position:absolute;inset:0;-webkit-mask-image:none;mask-image:none}
  .kw-hiw .kp-ban .kp-pb .pb-host canvas{position:absolute;inset:0;width:100%;height:100%}
  .kw-hiw .kp-ban .kp-pb [data-pb-glass]{display:none !important}
  .kw-hiw .kp-ban .wrap{position:relative;z-index:1}
  .kw-hiw .hero .kp-ban-eye{margin:0 auto 4px;max-width:none;font-size:11.5px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:var(--brat)}
  .kw-hiw .kp-ban .kp-cue{position:absolute;bottom:calc(138px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);z-index:3;display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--brat);text-decoration:none;font-size:13px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;text-shadow:0 0 12px #070708,0 0 4px #070708,0 0 2px #070708;animation:kpCue 2.4s ease-in-out infinite}
  .kw-hiw .kp-ban .kp-cue svg{width:20px;height:20px}
  .kw-hiw .kp-ban .kp-cue:hover,.kw-hiw .kp-ban .kp-cue:focus-visible{color:var(--ink)}
  @keyframes kpCue{0%,100%{opacity:.85;transform:translateX(-50%) translateY(0)}50%{opacity:1;transform:translateX(-50%) translateY(6px)}}
  @media (max-width:760px){
    .kw-hiw .hero.kp-ban{padding:34px 0 230px}
    .kw-hiw .hero .kp-ban-eye{font-size:10.5px}
    .kw-hiw .kp-ban .kp-pb{left:-25%;right:-25%;bottom:78px;height:130px}
    .kw-hiw .kp-ban .kp-cue{bottom:calc(126px + env(safe-area-inset-bottom))}
  }
</style>
</helmet>'''
src = swap(src, '</style>\n</helmet>', CSS, 1, 'css')
src = swap(src, '''  <header class="hero">
    <div class="hero-bg"></div>
    <div class="page-banner" aria-hidden="true">
      <div class="pb-host" id="pbHost"><canvas id="pbCv"></canvas></div>
    </div>
    <div class="wrap">
      <h1 data-reveal="">Three models.<br>One brain. <span class="irid">Yours.</span></h1>
      <p data-reveal="">''', '''  <!-- KW:HIW-V1 (18 Oct 2026): the banner, the Home / for-parents / for-teachers way. Paints from this markup alone. -->
  <header class="hero kp-ban">
    <div class="hero-bg"></div>
    <div class="kp-pb" aria-hidden="true"><div class="pb-host" id="pbHost"><canvas id="pbCv"></canvas></div></div>
    <div class="wrap">
      <p class="kp-ban-eye">How it works</p>
      <h1>Three models.<br>One brain. <span class="irid">Yours.</span></h1>
      <p>''', 1, 'banner')
src = swap(src, '    <a class="scroll-cue" href="#hiw-content" aria-label="Scroll to content"><span class="chev"></span></a>\n  </header>',
  '    <a class="kp-cue" href="#hiw-content"><span>meet the models</span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg></a>\n  </header>', 1, 'cue')
src = swap(src, "this._stopBanner=window.KnowhereParticleBanner(root,'How it works','layers');",
  "this._stopBanner=window.KnowhereParticleBanner(root,'','layers');   /* KW:HIW-V1: the rings at the banner's foot, no title */", 1, 'boot')
if DRY:
    print('dry run OK — all anchors matched; nothing written'); sys.exit(0)
bak = os.path.join(ROOT, '_patches', 'landing-v2', 'bak-hiw1-' + time.strftime('%Y%m%d-%H%M%S'))
os.makedirs(bak, exist_ok=True); shutil.copy2(P, os.path.join(bak, 'how-it-works.html'))
open(P, 'w', encoding='utf-8').write(src)
back = open(P, encoding='utf-8').read()
for n in ['KW:HIW-V1', '<p class="kp-ban-eye">How it works</p>', "KnowhereParticleBanner(root,'','layers')", '<span>meet the models</span>']:
    assert n in back, 'receipt missing: ' + n
assert 'class="page-banner"' not in back
print('applied ✓  backup:', os.path.relpath(bak, ROOT))
