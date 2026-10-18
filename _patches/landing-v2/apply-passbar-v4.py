#!/usr/bin/env python3
"""KW:FOUNDBAR-V4 (18 Oct 2026) — knowhere-passbar.js v4 reads the app's live founding switch (GET /public/founding). This
script backs up the old bar file and bumps ?v=3 → ?v=4 on the pages that load it so browsers fetch the new file. (Concept
pages load ?v=2 and pick it up when their cache turns over; the date rule covers them meanwhile.) Copy the new
knowhere-passbar.js into the repo root first. Run from the website repo root:  python3 _patches/landing-v2/apply-passbar-v4.py [--dry]
"""
import os, sys, shutil, time
DRY = '--dry' in sys.argv
ROOT = os.getcwd()
js = open(os.path.join(ROOT, 'knowhere-passbar.js'), encoding='utf-8').read()
assert 'knowhere-passbar.js v4' in js and '/public/founding' in js, 'copy the v4 knowhere-passbar.js into the repo root first'
PAGES = ['index.html', 'for-parents.html', 'experience-it.html', 'pricing.html', 'how-it-works.html', 'compare.html', 'mission.html', 'know-us.html']
out = {}
for f in PAGES:
    s = open(os.path.join(ROOT, f), encoding='utf-8').read()
    if 'knowhere-passbar.js?v=4' in s: continue
    assert s.count('knowhere-passbar.js?v=3') == 1, f + ': expected one ?v=3 tag'
    out[f] = s.replace('knowhere-passbar.js?v=3', 'knowhere-passbar.js?v=4')
if DRY:
    print('dry run OK —', len(out), 'page(s) to bump; nothing written'); sys.exit(0)
bak = os.path.join(ROOT, '_patches', 'landing-v2', 'bak-passbar4-' + time.strftime('%Y%m%d-%H%M%S'))
os.makedirs(bak, exist_ok=True)
for f, s in out.items():
    shutil.copy2(os.path.join(ROOT, f), os.path.join(bak, f))
    open(os.path.join(ROOT, f), 'w', encoding='utf-8').write(s)
    assert 'knowhere-passbar.js?v=4' in open(os.path.join(ROOT, f), encoding='utf-8').read()
print('bumped ✓', ', '.join(out) or 'nothing', ' backup:', os.path.relpath(bak, ROOT))
