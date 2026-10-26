#!/usr/bin/env python3
# KW:TEACH-SITE-V7 (23 Oct 2026): Maths is live in teach it. (all 322 concepts, every course).
# for-teachers + the teacher welcome email + teacher-terms + the SEO source (so a regen keeps it).
# Ship ONLY after the app fence PR (all Maths slugs in T_TEACH_LIVE) is deployed.
# Usage: python3 _patches/teach-site-v7/apply-teach-site-v7.py [--apply]   (dry run by default). Run from the repo root.
import sys, os, shutil, datetime
APPLY = '--apply' in sys.argv
ROOT = os.getcwd()
HERE = os.path.join(ROOT, '_patches', 'teach-site-v7')
FOUR = 'Physics, Chemistry, Biology and Psychology'
FIVE = 'Physics, Chemistry, Biology, Psychology and Maths'
EDITS = {
  'for-teachers.html': [
    (FOUR, FIVE, 9),
    ('then present it or share it. Maths lands this week.', 'then present it or share it. More subjects land through 2027.', 2),
    ('<b>This week:</b> Maths. Each wave lands in your account.', '<b>Next:</b> more subjects through 2027. Each one lands in your account.', 2),
    ('"dateModified":"2026-10-22"', '"dateModified":"2026-10-23"', 1),
  ],
  'emails.js': [
    ("Live now: Year 11 and 12 ${w('Physics, Chemistry, Biology and Psychology')}. Maths lands this week. Teach it? We'll email you the day it does.",
     "Live now: Year 11 and 12 ${w('Physics, Chemistry, Biology, Psychology and Maths')}. Teach something else? We'll email you the day it lands.", 1),
  ],
  'teacher-terms.html': [
    ('teach it. opened with Physics and Chemistry; Biology and Psychology are live and Maths is next.',
     'teach it. opened with Physics and Chemistry; Biology, Psychology and Maths are now live too.', 1),
  ],
  'knowhere-seo-v2.sh': [
    (FOUR, FIVE, 2),
    ('then present it or share it. Maths from Term 1.', 'then present it or share it. More subjects land through 2027.', 1),
  ],
}
MARK_HTML = '<!-- KW:TEACH-SITE-V7 (23 Oct 2026): Maths live -->\n'
MARK_JS = '/* KW:TEACH-SITE-V7 (23 Oct 2026): Maths live */\n'
MARK_SH = '# KW:TEACH-SITE-V7 (23 Oct 2026): Maths live\n'
plan, ok = {}, True
for f, edits in EDITS.items():
    src = open(os.path.join(ROOT, f), encoding='utf-8').read()
    if 'KW:TEACH-SITE-V7' in src: print('ALREADY APPLIED:', f); ok = False; continue
    out = src
    for old, new, n in edits:
        c = out.count(old)
        print(('OK  ' if c == n else 'FAIL'), f, '| want', n, 'got', c, '|', old[:70])
        if c != n: ok = False; continue
        out = out.replace(old, new)
    if f.endswith('.html'):
        out = out.replace('</body>', MARK_HTML + '</body>', 1) if '</body>' in out else out + MARK_HTML
    elif f.endswith('.js'):
        out = out + ('' if out.endswith('\n') else '\n') + MARK_JS
    elif f.endswith('.sh'):
        out = out + ('' if out.endswith('\n') else '\n') + MARK_SH
    plan[f] = out
if not ok: print('PREFLIGHT FAILED - nothing written'); sys.exit(1)
for f, out in plan.items():
    left = out.count(FOUR) + out.count('Maths lands this week') + out.count('Maths from Term 1') + out.count('Maths is next') + out.count('<b>This week:</b> Maths')
    print('LEFT', f, left)
    if left: ok = False
if not ok: print('OLD STRINGS LEFT - nothing written'); sys.exit(1)
if not APPLY: print('DRY RUN OK - rerun with --apply'); sys.exit(0)
stamp = datetime.datetime.now().strftime('%Y-%m-%dT%H%M%S')
for f, out in plan.items():
    shutil.copy2(os.path.join(ROOT, f), os.path.join(HERE, 'bak-%s-%s' % (f, stamp)))
    open(os.path.join(ROOT, f), 'w', encoding='utf-8').write(out)
    back = open(os.path.join(ROOT, f), encoding='utf-8').read()
    assert back == out, 'disk mismatch ' + f
    print('WROTE', f, '| backup', 'bak-%s-%s' % (f, stamp))
print('APPLIED. Receipts read back from disk.')
