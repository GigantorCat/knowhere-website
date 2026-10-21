#!/usr/bin/env python3
# KW:TEACH-SITE-V6 (22 Oct 2026): Maths moves from "Term 1" to "this week" on for-teachers + the welcome email;
# teacher-terms "opens with Physics and Chemistry" -> the four live subjects. Press push day.
# Usage: python3 _patches/teach-site-v6/apply-teach-site-v6.py [--apply]   (dry run by default). Run from the repo root.
import sys, os, shutil, datetime
APPLY = '--apply' in sys.argv
ROOT = os.getcwd()
HERE = os.path.join(ROOT, '_patches', 'teach-site-v6')
EDITS = {
  'for-teachers.html': [
    ('Maths from Term 1.', 'Maths lands this week.', 2),
    ('<b>Term 1:</b> Maths. Each wave lands in your account.', '<b>This week:</b> Maths. Each wave lands in your account.', 2),
    ('"dateModified":"2026-10-13"', '"dateModified":"2026-10-22"', 1),
  ],
  'emails.js': [
    ("Maths is next. Teach it? We'll email you the day it lands.", "Maths lands this week. Teach it? We'll email you the day it does.", 1),
  ],
  'teacher-terms.html': [
    ('teach it. opens with Physics and Chemistry. Other subjects follow in waves through 2027',
     'teach it. opened with Physics and Chemistry; Biology and Psychology are live and Maths is next. Other subjects follow in waves through 2027', 1),
  ],
}
MARK = '<!-- KW:TEACH-SITE-V6 (22 Oct 2026): Maths this week -->\n'
plan, ok = {}, True
for f, edits in EDITS.items():
    src = open(os.path.join(ROOT, f), encoding='utf-8').read()
    if 'KW:TEACH-SITE-V6' in src: print('ALREADY APPLIED:', f); ok = False; continue
    out = src
    for old, new, n in edits:
        c = out.count(old)
        print(('OK  ' if c == n else 'FAIL'), f, '| want', n, 'got', c, '|', old[:60])
        if c != n: ok = False; continue
        out = out.replace(old, new)
    if f.endswith('.html'):
        out = out.replace('</body>', MARK + '</body>', 1) if '</body>' in out else out + MARK
    plan[f] = out
if not ok: print('PREFLIGHT FAILED - nothing written'); sys.exit(1)
if not APPLY: print('DRY RUN OK - rerun with --apply'); sys.exit(0)
stamp = datetime.datetime.now().strftime('%Y-%m-%dT%H%M%S')
for f, out in plan.items():
    shutil.copy2(os.path.join(ROOT, f), os.path.join(HERE, 'bak-%s-%s' % (f, stamp)))
    open(os.path.join(ROOT, f), 'w', encoding='utf-8').write(out)
    back = open(os.path.join(ROOT, f), encoding='utf-8').read()
    assert back == out, 'disk mismatch ' + f
    print('WROTE', f, '| backup', 'bak-%s-%s' % (f, stamp))
print('APPLIED. Receipts read back from disk.')
