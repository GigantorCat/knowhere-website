#!/usr/bin/env python3
# KW:TEACH-SITE-V5 (17 Oct 2026): Biology + Psychology live in teach it. (app PR #173, T_TEACH_LIVE).
# for-teachers.html: every "Physics and Chemistry" live claim -> four subjects; js-when x2 -> Live now / Term 1: Maths; FAQ "More subjects" -> Maths.
# emails.js: teacherWelcome "Live now" line.
# Usage: python3 _patches/teach-site-v5/apply-teach-site-v5.py [--apply]   (dry run by default). Run from the repo root.
import sys, os, shutil, datetime, json
APPLY = '--apply' in sys.argv
ROOT = os.getcwd()
HERE = os.path.join(ROOT, '_patches', 'teach-site-v5')
FOUR = 'Physics, Chemistry, Biology and Psychology'
EDITS = {
  'for-teachers.html': [
    ('Every Physics and Chemistry concept as a live deck', 'Every %s concept as a live deck' % FOUR, 2),
    ('Year 11 and 12 Physics and Chemistry</div>', 'Year 11 and 12 %s</div>' % FOUR, 1),
    ('Physics and Chemistry now. Your subject next.', '%s now. Your subject next.' % FOUR, 1),
    ('Every Physics and Chemistry concept has a round like this.', 'Every %s concept has a round like this.' % FOUR, 1),
    ('rebuilt every Physics and Chemistry concept', 'rebuilt every %s concept' % FOUR, 1),
    ('Every Physics and Chemistry concept comes as a deck', 'Every %s concept comes as a deck' % FOUR, 1),
    ('Every Physics and Chemistry concept is a ready-made deck', 'Every %s concept is a ready-made deck' % FOUR, 2),
    ('More subjects from Term 1.', 'Maths from Term 1.', 2),
    ('<b>Day 1:</b> Every Physics and Chemistry concept, Year 11 and 12. <b>Term 1:</b> Biology, Psychology, then Maths. Each wave lands in your account.',
     '<b>Live now:</b> Every %s concept, Year 11 and 12. <b>Term 1:</b> Maths. Each wave lands in your account.' % FOUR, 2),
  ],
  'emails.js': [
    ("Live now: Year 11 and 12 ${w('Physics and Chemistry')}. Biology and Psychology are next. Teach those? We'll email you the day they land.",
     "Live now: Year 11 and 12 ${w('%s')}. Maths is next. Teach it? We'll email you the day it lands." % FOUR, 1),
  ],
}
MARK = {'for-teachers.html': '<!-- KW:TEACH-SITE-V5 (17 Oct 2026): Biology + Psychology live -->\n', 'emails.js': None}
plan, ok = {}, True
for f, edits in EDITS.items():
    src = open(os.path.join(ROOT, f), encoding='utf-8').read()
    if 'KW:TEACH-SITE-V5' in src: print('ALREADY APPLIED:', f); ok = False; continue
    out = src
    for old, new, n in edits:
        c = out.count(old)
        print(('OK  ' if c == n else 'FAIL'), f, '| want', n, 'got', c, '|', old[:70])
        if c != n: ok = False; continue
        out = out.replace(old, lambda_new := new) if False else out.replace(old, new)
    if f == 'emails.js':
        a = "function teacherWelcome({ email, firstName, teacherSeat }) {"
        if out.count(a) != 1: print('FAIL anchor', f); ok = False
        out = out.replace(a, "/* KW:TEACH-SITE-V5 (17 Oct 2026): Biology + Psychology live in teach it. */\n" + a, 1)
    else:
        a = '<!-- KW:OPENERS (17 Oct 2026) -->'
        if out.count(a) != 1: print('FAIL anchor', f); ok = False
        out = out.replace(a, MARK[f] + '      ' + a, 1)
    plan[f] = out
if not ok: print('\nPREFLIGHT FAILED: nothing written.'); sys.exit(1)
if not APPLY: print('\nDRY RUN clean. Re-run with --apply.'); sys.exit(0)
ts = datetime.datetime.now().strftime('%Y-%m-%dT%H%M%S')
for f in plan: shutil.copy2(os.path.join(ROOT, f), os.path.join(HERE, 'bak-%s-%s' % (f, ts)))
for f, out in plan.items(): open(os.path.join(ROOT, f), 'w', encoding='utf-8').write(out)
rc = {}
for f, edits in EDITS.items():
    back = open(os.path.join(ROOT, f), encoding='utf-8').read()
    rc[f] = {'marker': back.count('KW:TEACH-SITE-V5'), 'old_left': sum(back.count(o) for o, _, _ in edits), 'physics_and_chemistry_left': back.count('Physics and Chemistry')}
json.dump(rc, open(os.path.join(HERE, 'receipt-%s.json' % ts), 'w'), indent=1)
print('\nAPPLIED. Receipt (read back from disk):', json.dumps(rc))
