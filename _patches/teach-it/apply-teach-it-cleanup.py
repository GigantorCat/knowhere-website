#!/usr/bin/env python3
"""teach-it copy cleanup (12 Oct 2026) — the leftovers Cat tapped on "Teacher Copy Cleanup".
c1 accounts answer · c2 lesson-planning answer · c3 bottom CTA · c4 page name (Cat's fix: "... concepts live") · c5 Goat welcome, teachers only.
c6 (terms) = a board card, no edit here. Page + Google FAQ (JSON-LD) + the SEO script source all move together.
Dry run by default; --apply backs up to _patches/teach-it/.bak-cleanup-<stamp>/, writes, reads back, node --check.
Every anchor must match the expected count or nothing is written."""
import sys, os, shutil, time, subprocess
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
N = 'knowhere · teach it.'
C1_OLD_PAGE = "Not yet — the teacher experience (share links, class groups, present mode) is Release 2, and founding teachers get first say in it. If students want their own personalised study system at home, that's a separate student plan"
C1_NEW_PAGE = "No. Put a concept on the projector, or send the class a share link: it opens in any browser, no login. If students want their own personalised study system at home, that's a separate student plan"
C1_OLD_FAQ = "Not yet — the teacher experience (share links, class groups, present mode) is Release 2, and founding teachers get first say in it. A personalised student plan"
C1_NEW_FAQ = "No. Put a concept on the projector, or send the class a share link: it opens in any browser, no login. A personalised student plan"
C2_BODY = "Every Physics and Chemistry concept is a ready-made deck: the picture, a call it. round for the room, the takeaway and a homeplay task. Change the words, add your own slides, then present it or share it. More subjects from Term 1. Class groups and progress views are on the list — "
C2_OLD_PAGE = "Right now it's the best explain-it-again layer you'll find. Lesson building, class groups and progress views are next — and <strong>teachers on the platform get first say in how they work.</strong>"
C2_NEW_PAGE = "Yes. " + C2_BODY + "<strong>founding teachers get first say in how they work.</strong>"
C2_OLD_FAQ = "Right now it is the best explain-it-again layer you'll find. Lesson building, class groups and progress views are next — and teachers on the platform get first say in how they work."
C2_NEW_FAQ = "Yes. " + C2_BODY + "founding teachers get first say in how they work."
C3_OLD = "Twenty seconds to join the teacher waitlist. One email when the teacher experience is live — and until then"
C3_NEW = f"Twenty seconds to claim a seat. One email the day {N} opens — and until then"
C4_OLD_A, C4_NEW_A = "knowhere for teachers — HSC &amp; VCE concepts for the projector", f"{N} — HSC &amp; VCE concepts live"
C4_OLD, C4_NEW = "knowhere for teachers — HSC & VCE concepts for the projector", f"{N} — HSC & VCE concepts live"
C5_OLD = '+ B.p(`Three emails from here: a week out, three days out, launch day. No drip, no "just checking in".`)'
C5_NEW = '+ B.p(type === \'teacher\' ? `One email from here: the day ' + N + ' opens. No drip, no "just checking in".` : `Three emails from here: a week out, three days out, launch day. No drip, no "just checking in".`)'
EDITS = {
 'for-teachers.html': [(C1_OLD_PAGE, C1_NEW_PAGE, 1), (C1_OLD_FAQ, C1_NEW_FAQ, 1), (C2_OLD_PAGE, C2_NEW_PAGE, 1), (C2_OLD_FAQ, C2_NEW_FAQ, 1),
                       (C3_OLD, C3_NEW, 1), (C4_OLD_A, C4_NEW_A, 3), (C4_OLD, C4_NEW, int(os.environ.get('C4N', '1')))],
 'knowhere-seo-v2.sh': [(C1_OLD_FAQ, C1_NEW_FAQ, 1), (C2_OLD_FAQ, C2_NEW_FAQ, 1), (C4_OLD, C4_NEW, 1)],
 'emails.js': [(C5_OLD, C5_NEW, 1)],
}
apply = '--apply' in sys.argv
plan, bad = {}, []
for f, eds in EDITS.items():
  p = os.path.join(ROOT, f); s = open(p, encoding='utf8').read(); o = s
  for a, b, n in eds:
    c = s.count(a)
    if c != n: bad.append(f'{f}: expected {n}, found {c}: {a[:70]}')
    else: s = s.replace(a, b)
  plan[f] = (o, s)
if bad:
  print('PREFLIGHT FAILED, nothing written:'); [print('  ' + x) for x in bad]; sys.exit(1)
for f, (o, s) in plan.items(): print(('would write ' if not apply else 'write ') + f + f'  ({len(o)} -> {len(s)} bytes)')
if not apply: print('dry run OK. Re-run with --apply.'); sys.exit(0)
bak = os.path.join(ROOT, '_patches', 'teach-it', '.bak-cleanup-' + time.strftime('%Y%m%d-%H%M%S'))
os.makedirs(bak, exist_ok=True)
for f, (o, s) in plan.items():
  shutil.copy2(os.path.join(ROOT, f), os.path.join(bak, f))
  open(os.path.join(ROOT, f), 'w', encoding='utf8').write(s)
for f, (o, s) in plan.items():
  assert open(os.path.join(ROOT, f), encoding='utf8').read() == s, 'read-back failed: ' + f
r = subprocess.run(['node', '--check', os.path.join(ROOT, 'emails.js')], capture_output=True, text=True)
if r.returncode:
  for g in plan: shutil.copy2(os.path.join(bak, g), os.path.join(ROOT, g))
  print('node --check failed on emails.js - restored all files.\n', r.stderr); sys.exit(1)
left = [f for f in plan if any(x in open(os.path.join(ROOT, f), encoding='utf8').read() for x in ('Release 2', 'class groups and progress views are next', 'knowhere for teachers', 'teacher experience is live'))]
print('applied. backups:', bak); print('receipt: old copy left in', left or 'none')
