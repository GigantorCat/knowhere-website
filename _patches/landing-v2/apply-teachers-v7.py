#!/usr/bin/env python3
"""KW:TEACH-V7 (18 Oct 2026) — Cat, Sun 18 Oct 18:28: the call it. copy's closing line, her idea, tightened by a word or two:
"Most teaching tech is a screen you present and the room watches. In knowhere, everyone plays."
Runs on top of KW:TEACH-V6. Idempotent on KW:TEACH-V7. Backs up to _patches/landing-v2/bak-tch7-<stamp>/.
Run from the website repo root:  python3 _patches/landing-v2/apply-teachers-v7.py [--dry]
"""
import os, sys, shutil, time
DRY = '--dry' in sys.argv
ROOT = os.getcwd(); P = os.path.join(ROOT, 'for-teachers.html')
src = open(P, encoding='utf-8').read()
if 'KW:TEACH-V7' in src:
    print('already applied (KW:TEACH-V7 marker present) — nothing to do'); sys.exit(0)
assert 'KW:TEACH-V6' in src, 'V6 is not applied — run apply-teachers-v6.py first'
old = 'Most classroom tech is a screen the room watches. This one the room plays. <em>They own it by the bell.</em>'
assert src.count(old) == 1, 'line anchor: found %d' % src.count(old)
src = src.replace(old, 'Most teaching tech is a screen you present and the room watches. In knowhere, everyone plays.<!-- KW:TEACH-V7 --> <em>They own it by the bell.</em>')
if DRY:
    print('dry run OK — all anchors matched; nothing written'); sys.exit(0)
bak = os.path.join(ROOT, '_patches', 'landing-v2', 'bak-tch7-' + time.strftime('%Y%m%d-%H%M%S'))
os.makedirs(bak, exist_ok=True); shutil.copy2(P, os.path.join(bak, 'for-teachers.html'))
open(P, 'w', encoding='utf-8').write(src)
back = open(P, encoding='utf-8').read()
assert 'In knowhere, everyone plays.<!-- KW:TEACH-V7 -->' in back and 'This one the room plays.' not in back
print('applied ✓  backup:', os.path.relpath(bak, ROOT))
