#!/usr/bin/env python3
"""KW:PAR-V4 (18 Oct 2026) — Cat, Sun 18 Oct 15:22: the care block's paragraph starts at "knowhere is a Year 11 and 12
study app…" (its old first sentence repeated the headline "Understanding comes first. The care follows.").
Runs on top of KW:PAR-V3. Idempotent on KW:PAR-V4. Backs up to _patches/landing-v2/bak-par4-<stamp>/.
Run from the website repo root:  python3 _patches/landing-v2/apply-parents-v4.py [--dry]
"""
import os, sys, shutil, time
DRY = '--dry' in sys.argv
ROOT = os.getcwd(); P = os.path.join(ROOT, 'for-parents.html')
src = open(P, encoding='utf-8').read()
if 'KW:PAR-V4' in src:
    print('already applied (KW:PAR-V4 marker present) — nothing to do'); sys.exit(0)
assert 'KW:PAR-V3' in src, 'V3 is not applied — run apply-parents-v3.py first'
old = '<p class="sub">Nobody gets interested first &#8212; you understand something, <em>then</em> you care. knowhere is a Year 11 and 12 study app'
assert src.count(old) == 1, 'paragraph anchor: found %d' % src.count(old)
src = src.replace(old, '<p class="sub"><!-- KW:PAR-V4 -->knowhere is a Year 11 and 12 study app')
if DRY:
    print('dry run OK — all anchors matched; nothing written'); sys.exit(0)
bak = os.path.join(ROOT, '_patches', 'landing-v2', 'bak-par4-' + time.strftime('%Y%m%d-%H%M%S'))
os.makedirs(bak, exist_ok=True); shutil.copy2(P, os.path.join(bak, 'for-parents.html'))
open(P, 'w', encoding='utf-8').write(src)
back = open(P, encoding='utf-8').read()
assert 'KW:PAR-V4 -->knowhere is a Year 11' in back and 'Nobody gets interested first &#8212; you understand' not in back
print('applied ✓  backup:', os.path.relpath(bak, ROOT))
