#!/usr/bin/env python3
"""teach-it copy (12 Oct 2026) — website + Goat email lines Cat goated on Teacher Copy Taps + Teacher Calls Round 2.
Name "knowhere · teach it." · 50 founding seats · free until the end of Term 1, 2027 (Fri 9 April).
Dry run by default; --apply backs up to _patches/teach-it/.bak-<stamp>/ (outside scanned dirs), writes, reads back.
Every anchor must match exactly once or nothing is written."""
import sys, os, shutil, time, subprocess
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
N = 'knowhere · teach it.'
T = 'free until the end of Term 1, 2027'
EDITS = {
 'for-teachers.html': [
  ('The teacher experience lands right after the student launch. The first 50 teachers on the waitlist get three months free when it does — long enough to teach a whole unit with it — and first say in how the classroom tools work.',
   f'The first 50 teachers get {N} {T} — long enough to teach a whole unit with it — and first say in how the classroom tools work.', 1),
  ('50 founding seats, first term free.', '50 founding seats, free to the end of Term 1 2027.', 4),
 ],
 'knowhere-seo-v2.sh': [
  ('50 founding seats, first term free.', '50 founding seats, free to the end of Term 1 2027.', 1),
 ],
 'knowhere-waitlist.js': [
  ('p: "The teacher experience lands right after the student launch. The first 50 on this list get three months free and first say in how the classroom tools work. Yes, that\'s a bribe. A good one."',
   f'p: "The first 50 on this list get {N} {T}, and first say in how the classroom tools work. Yes, that\'s a bribe. A good one."', 1),
  ('teacherSeat: "Seat confirmed. Three months free, first say on the classroom tools, and the Goat\'s personal respect."',
   f'teacherSeat: "Welcome to the founding fifty. You\'re one of the first teachers in {N} Free until the end of Term 1, 2027, a real say in how the classroom tools work, and the Goat\'s eternal respect."', 1),
  ("encodeURIComponent('First 50 teachers get three months free. ' + url)",
   f"encodeURIComponent('First 50 teachers get {N} {T}.' + (typeof r.teacherSeatsLeft === 'number' ? ' ' + r.teacherSeatsLeft + (r.teacherSeatsLeft === 1 ? ' seat' : ' seats') + ' left.' : '') + ' ' + url)", 1),
 ],
 'emails.js': [
  ("? `You've got founding-teacher seat <strong style=\"color:#F2F0EB\">#${teacherSeat} of ${TEACHER_SEATS}</strong>. That's three months free once the teacher experience lands, and first say in how the classroom tools work.`",
   f"? `Congrats, you've secured your seat at the {N} table. Free rein right up to the end of Term 1, 2027, and first say in how the classroom tools work.`", 1),
  (": `You're on the list for the teacher experience. The ${TEACHER_SEATS} founding seats are gone, but you're first in line when it lands — and we'll find you something for the wait.`",
   f": `You're on the list for {N} The ${{TEACHER_SEATS}} founding seats are gone, but you're first in line when it opens — and we'll find you something for the wait.`", 1),
  ("(seat ? B.num(`seat #${teacherSeat} <span style=\"font-size:22px;color:#8C9389;letter-spacing:0\">of ${TEACHER_SEATS}</span>`) : '')", "''", 1),
  ("subject: seat ? `You're in — founding teacher seat #${teacherSeat} 🐐` : `You're in 🐐`", "subject: seat ? `You're in — a founding seat at " + N + " 🐐` : `You're in 🐐`", 1),
 ],
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
bak = os.path.join(ROOT, '_patches', 'teach-it', '.bak-' + time.strftime('%Y%m%d-%H%M%S'))
os.makedirs(bak, exist_ok=True)
for f, (o, s) in plan.items():
  shutil.copy2(os.path.join(ROOT, f), os.path.join(bak, f))
  open(os.path.join(ROOT, f), 'w', encoding='utf8').write(s)
for f, (o, s) in plan.items():
  assert open(os.path.join(ROOT, f), encoding='utf8').read() == s, 'read-back failed: ' + f
for f in ('knowhere-waitlist.js', 'emails.js'):
  r = subprocess.run(['node', '--check', os.path.join(ROOT, f)], capture_output=True, text=True)
  if r.returncode:
    for g in plan: shutil.copy2(os.path.join(bak, g), os.path.join(ROOT, g))
    print('node --check failed on', f, '- restored all files.\n', r.stderr); sys.exit(1)
left = [f for f in plan if any(x in open(os.path.join(ROOT, f), encoding='utf8').read() for x in ('three months free', 'first term free', 'three months once'))]
print('applied. backups:', bak); print('receipt: old copy left in', left or 'none')
