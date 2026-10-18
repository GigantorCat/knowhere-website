#!/usr/bin/env python3
"""KW:SWEEP-V1 (18 Oct 2026) — the last glass-title pages get the new banner: /compare, /mission, /know-us. Cat, Sun 18 Oct 19:08.
Each: one screen of text, the page's own particle formation along the foot (no glass title), an eyebrow above the h1, a brat
scroll cue. The first screen no longer waits on JS (data-reveal off the banner). Idempotent per page on KW:SWEEP-V1.
Backs up to _patches/landing-v2/bak-sweep1-<stamp>/.  Run from the website repo root:  python3 _patches/landing-v2/apply-sweep-v1.py [--dry]
"""
import os, sys, shutil, time
DRY = '--dry' in sys.argv
ROOT = os.getcwd()
def swap(s, old, new, n=1, label=''):
    c = s.count(old); assert c == n, f'{label}: expected {n} match(es), found {c}'; return s.replace(old, new)
CHEV = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
def cue_css(p, z=3):
    return (f'  .{p} .kp-cue{{position:absolute;left:50%;transform:translateX(-50%);z-index:{z};display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--brat);text-decoration:none;font-size:13px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;text-shadow:0 0 12px #070708,0 0 4px #070708,0 0 2px #070708;animation:kpCue 2.4s ease-in-out infinite}}\n'
            f'  .{p} .kp-cue svg{{width:20px;height:20px}}\n'
            f'  .{p} .kp-cue:hover,.{p} .kp-cue:focus-visible{{color:var(--ink)}}\n'
            '  @keyframes kpCue{0%,100%{opacity:.85;transform:translateX(-50%) translateY(0)}50%{opacity:1;transform:translateX(-50%) translateY(6px)}}\n'
            f'  @media (prefers-reduced-motion:reduce){{.{p} .kp-cue{{animation:none}}}}\n')
out = {}

# ── /compare ─────────────────────────────────────────────────────────────────────────────
p = 'compare.html'; s = open(os.path.join(ROOT, p), encoding='utf-8').read()
if 'KW:SWEEP-V1' not in s:
    s = swap(s, '</style>\n</helmet>', '''  /* KW:SWEEP-V1 (18 Oct 2026): the banner — one screen, the four columns along the foot (no glass title), eyebrow + cue */
  .kw-cmp .hero.kp-ban{min-height:calc(100vh - 61px);min-height:calc(100svh - 61px);padding:40px 0 clamp(230px,28vh,270px);justify-content:center;overflow:hidden}
  .kw-cmp .hero.kp-ban .page-banner{display:block;top:auto;bottom:70px;height:clamp(140px,19vh,180px)}
  .kw-cmp .hero.kp-ban [data-pb-glass]{display:none !important}
  .kw-cmp .hero.kp-ban .kicker{color:var(--brat);font-size:11.5px;letter-spacing:.26em}
''' + cue_css('kw-cmp') + '''  .kw-cmp .hero.kp-ban .kp-cue{bottom:calc(100px + env(safe-area-inset-bottom))}
  @media (max-width:700px){
    .kw-cmp .hero.kp-ban{padding:30px 0 230px}
    .kw-cmp .hero.kp-ban .page-banner{display:block;left:-20%;right:-20%;width:auto;bottom:74px;height:120px}
    .kw-cmp .hero.kp-ban .kp-cue{bottom:calc(204px + env(safe-area-inset-bottom))}
  }
</style>
</helmet>''', 1, p + ' css')
    old_hero = s[s.index('  <header class="hero">\n'):s.index('  </header>', s.index('  <header class="hero">\n')) + len('  </header>')]
    new_hero = old_hero.replace('  <header class="hero">\n', '  <!-- KW:SWEEP-V1 (18 Oct 2026): the banner, the Home / for-parents way. Paints from this markup alone. -->\n  <header class="hero kp-ban">\n', 1)
    new_hero = new_hero.replace(' data-reveal>', '>').replace(' data-reveal="">', '>')
    new_hero = swap(new_hero, '    <a class="scroll-cue" href="#cmp-content" aria-label="Scroll to content"><span class="chev"></span></a>',
                    '    <a class="kp-cue" href="#cmp-content"><span>see the numbers</span>' + CHEV + '</a>', 1, p + ' cue')
    assert 'data-reveal' not in new_hero
    s = s.replace(old_hero, new_hero)
    s = swap(s, "this._stopBanner=window.KnowhereParticleBanner(root,'Compare','compare');",
             "this._stopBanner=window.KnowhereParticleBanner(root,'','compare');   /* KW:SWEEP-V1: the columns at the banner's foot, no title */", 1, p + ' boot')
    out[p] = s

# ── /mission + /know-us (their own flow-field engine: the formation follows #pbHost wherever it sits) ─────────────
def flowpage(p, pre, eyebrow, cue_text, cue_href, title):
    s = open(os.path.join(ROOT, p), encoding='utf-8').read()
    if 'KW:SWEEP-V1' in s: return None
    s = swap(s, '  }\n</style>\n<style>h1,h2,h3{text-transform:lowercase}', '''  }
  /* KW:SWEEP-V1 (18 Oct 2026): the banner — one screen, the page's formation along the foot (no glass title), eyebrow + cue */
  .''' + pre + ''' .hero.kp-ban{position:relative;min-height:calc(100vh - 61px);min-height:calc(100svh - 61px);padding:40px 0 clamp(230px,28vh,270px);justify-content:center}
  .''' + pre + ''' .hero.kp-ban .page-banner{top:auto;bottom:70px;height:clamp(140px,19vh,180px)}
  .''' + pre + ''' .hero.kp-ban .lede-block{padding-top:0;position:relative;z-index:2}
  .''' + pre + ''' .hero.kp-ban .kp-ban-eye{margin:0 auto 18px;font-size:11.5px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:var(--brat)}
''' + cue_css(pre, 4) + '''  .''' + pre + ''' .hero.kp-ban .kp-cue{bottom:calc(100px + env(safe-area-inset-bottom))}
  @media (max-width:700px){
    .''' + pre + ''' .hero.kp-ban{padding:30px 0 220px}
    .''' + pre + ''' .hero.kp-ban .page-banner{bottom:74px;height:120px}
    .''' + pre + ''' .hero.kp-ban .kp-cue{bottom:calc(112px + env(safe-area-inset-bottom))}
  }
</style>
<style>h1,h2,h3{text-transform:lowercase}''', 1, p + ' css')
    s = swap(s, "  glassTitle(root.querySelector('#pbHost'),'" + title + "');",
             "  /* KW:SWEEP-V1: no glass title — the eyebrow names the page; the formation runs along the banner's foot */", 1, p + ' glass')
    return s

s = flowpage('mission.html', 'kw-mis', 'Mission', 'read the mission', '#stack', 'Mission')
if s is not None:
    s = swap(s, '''    <section class="hero">
      <div class="page-banner" aria-hidden="true"><div class="pb-host" id="pbHost"></div></div>
      <div class="lede-block" data-reveal>
        <h1>''', '''    <!-- KW:SWEEP-V1 (18 Oct 2026): the banner, the Home / for-parents way. Paints from this markup alone. -->
    <section class="hero kp-ban">
      <div class="page-banner" aria-hidden="true"><div class="pb-host" id="pbHost"></div></div>
      <div class="lede-block">
        <p class="kp-ban-eye">Mission</p>
        <h1>''', 1, 'mission hero')
    s = swap(s, '  }\n</style>\n<style>h1,h2,h3{text-transform:lowercase}', '''  }
  .kw-mis .hero.kp-ban .kp-cue{bottom:calc(196px + env(safe-area-inset-bottom))}   /* above the curve, never across it */
  @media (max-width:700px){.kw-mis .hero.kp-ban .kp-cue{bottom:calc(172px + env(safe-area-inset-bottom))}}
</style>
<style>h1,h2,h3{text-transform:lowercase}''', 1, 'mission cue css')
    s = swap(s, '''<span class="irid">solve any what</span>.</h1>
      </div>
    </section>''', '''<span class="irid">solve any what</span>.</h1>
      </div>
      <a class="kp-cue" href="#stack"><span>why it matters</span>''' + CHEV + '''</a>
    </section>''', 1, 'mission cue')
    out['mission.html'] = s

s = flowpage('know-us.html', 'kw-us', 'Know us', 'meet the studio', '#kuStudio', 'Know us')
if s is not None:
    s = swap(s, '''  <div class="page-banner" aria-hidden="true"><div class="pb-host" id="pbHost"></div></div>
  <main>
    <div class="lede-block" data-reveal>
      <h1>we're not an edtech company.<br>we're a <span class="irid">human intelligence</span> company.</h1>
    </div>
''', '''  <main>
    <!-- KW:SWEEP-V1 (18 Oct 2026): the banner, the Home / for-parents way. Paints from this markup alone. -->
    <section class="hero kp-ban">
      <div class="page-banner" aria-hidden="true"><div class="pb-host" id="pbHost"></div></div>
      <div class="lede-block">
        <p class="kp-ban-eye">Know us</p>
        <h1>we're not an edtech company.<br>we're a <span class="irid">human intelligence</span> company.</h1>
      </div>
      <a class="kp-cue" href="#kuStudio"><span>meet the studio</span>''' + CHEV + '''</a>
    </section>
''', 1, 'know-us hero')
    s = swap(s, '''    <div class="prose">
      <section class="block" data-reveal style="text-align:center">''', '''    <div class="prose" id="kuStudio">
      <section class="block" data-reveal style="text-align:center">''', 1, 'know-us anchor')
    out['know-us.html'] = s

if DRY:
    print('dry run OK — all anchors matched on', len(out), 'page(s); nothing written'); sys.exit(0)
bak = os.path.join(ROOT, '_patches', 'landing-v2', 'bak-sweep1-' + time.strftime('%Y%m%d-%H%M%S'))
os.makedirs(bak, exist_ok=True)
for f, s in out.items():
    shutil.copy2(os.path.join(ROOT, f), os.path.join(bak, f))
    open(os.path.join(ROOT, f), 'w', encoding='utf-8').write(s)
    back = open(os.path.join(ROOT, f), encoding='utf-8').read()
    assert 'KW:SWEEP-V1' in back and 'class="hero kp-ban"' in back and 'class="kp-cue"' in back, 'receipt: ' + f
print('applied ✓ to', ', '.join(out) or 'nothing', ' backup:', os.path.relpath(bak, ROOT))
