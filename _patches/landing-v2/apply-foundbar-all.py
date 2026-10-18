#!/usr/bin/env python3
"""KW:FOUNDBAR-ALL (18 Oct 2026) — the founding-rate sticky bar (knowhere-passbar.js v3) on every page but /for-teachers.
Cat, Sat 18 Oct: "we should add that footer to all pages (except teacher) right? it's nowhere on the home page".

  Home, /experience-it, /pricing, /how-it-works, /mission, /know-us  → student voice ("claim your seat")
  /compare                                                            → parent voice ("claim their seat"; the page speaks to parents)
  /for-parents already carries it (KW:PAR-V2). Concept pages already load the same file (?v=2) and pick up v3 by themselves.

data-away = the page's own closing CTA, so two CTAs never stack. Student pages without knowhere-handoff.js get it (the
sheet's "send this to a parent" button needs it). Home: the START KNOWING cue lifts above the bar.

Idempotent per page on the KW:FOUNDBAR-ALL marker. Backs up to _patches/landing-v2/bak-foundbar-<stamp>/.
Run from the website repo root:  python3 _patches/landing-v2/apply-foundbar-all.py [--dry]
"""
import os, sys, shutil, time

DRY = '--dry' in sys.argv
ROOT = os.getcwd()
GOO = '<script src="./knowhere-goo.js?v=6"></script>\n'
HANDOFF = '<script src="./knowhere-handoff.js?v=3" defer></script><!-- KW:HANDOFF -->\n'

PAGES = [
    # file, audience, data-away, needs handoff tag
    ('index.html',        'student', '.kp-proof-cta,[data-kw-goo-off]', False),
    ('experience-it.html','student', '.kw-handcard-btns',               False),
    ('pricing.html',      'student', '.plans',                          False),
    ('how-it-works.html', 'student', '.cta-band',                       True),
    ('compare.html',      'parent',  '.cta-band',                       False),
    ('mission.html',      'student', '',                                True),
    ('know-us.html',      'student', '',                                True),
]

def swap(s, old, new, n=1, label=''):
    c = s.count(old)
    assert c == n, f'{label}: expected {n} match(es), found {c}'
    return s.replace(old, new)

out = {}
for f, aud, away, hand in PAGES:
    p = os.path.join(ROOT, f)
    s = open(p, encoding='utf-8').read()
    if 'KW:FOUNDBAR-ALL' in s:
        print(f'{f}: already applied — skipped'); continue
    assert 'knowhere-passbar.js' not in s, f'{f}: already loads a passbar'
    tag = ('<script src="./knowhere-passbar.js?v=3" defer data-audience="%s"%s></script><!-- KW:FOUNDBAR-ALL -->\n'
           % (aud, (' data-away="%s"' % away) if away else ''))
    add = tag
    if hand:
        assert 'knowhere-handoff.js' not in s, f'{f}: handoff already there'
        add = HANDOFF + tag
    s = swap(s, GOO, GOO + add, 1, f + ' goo anchor')
    if f == 'index.html':
        # the START KNOWING cue sits above the bar (the bar is ~64px + the safe area); the banner keeps room for both
        s = swap(s, '  .kp-open .kp-cue{position:absolute;bottom:24px;', '  .kp-open .kp-cue{position:absolute;bottom:calc(96px + env(safe-area-inset-bottom));', 1, 'home cue')
        s = swap(s, 'justify-content:center;padding:96px 34px 96px;text-align:center', 'justify-content:center;padding:96px 34px 170px;text-align:center', 1, 'home pad')
        s = swap(s, '    .kp-open{padding:84px 22px 92px}', '    .kp-open{padding:84px 22px 160px}', 1, 'home pad mobile')
    out[f] = s

if DRY:
    print('dry run OK — all anchors matched on', len(out), 'page(s); nothing written'); sys.exit(0)
stamp = time.strftime('%Y%m%d-%H%M%S')
bak = os.path.join(ROOT, '_patches', 'landing-v2', 'bak-foundbar-' + stamp)
os.makedirs(bak, exist_ok=True)
for f, s in out.items():
    shutil.copy2(os.path.join(ROOT, f), os.path.join(bak, f))
    open(os.path.join(ROOT, f), 'w', encoding='utf-8').write(s)
    back = open(os.path.join(ROOT, f), encoding='utf-8').read()
    assert back.count('knowhere-passbar.js?v=3') == 1 and 'KW:FOUNDBAR-ALL' in back, 'receipt: ' + f
    assert back.count('knowhere-handoff.js') >= 1 or f == 'compare.html', 'receipt handoff: ' + f
print('applied ✓ to', ', '.join(out) or 'nothing', ' backup:', os.path.relpath(bak, ROOT))
