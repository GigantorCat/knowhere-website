#!/usr/bin/env python3
"""W9b - Cat's goated Year 11 page picks survive a re-run (website repo). Muppet, Mon 5 Oct 2026.
Run from the knowhere-website repo root:  python3 _patches/w-track/apply-w9b-goated-y11-picks.py [--apply]

nominate-scapes.mjs --level=11 rewrites SCAPES-Y11.json from scratch, so a re-run would silently throw away the picks
Cat goated on the "Year 11 Page Picks" tap page. Now a cell's `goated` slug (written into SCAPES-Y11.json) is read
back first and wins over the score rig, the same way the Year 12 LOCKED picks do. Marker W9B-GOATED.
Idempotent, dry run by default, node --check on the candidate, backup in _patches/w-track/.bak-w9b-<stamp>/.
"""
import os, sys, shutil, subprocess, datetime, tempfile
APPLY = '--apply' in sys.argv; MARK = 'W9B-GOATED'; F = 'nominate-scapes.mjs'
if not os.path.exists(F): sys.exit('run this from the knowhere-website repo root')
src = open(F, encoding='utf-8').read()
if MARK in src: print('already applied - nothing to do'); sys.exit(0)
if 'W9-YEAR-11' not in src: sys.exit('apply-w9-site-year-11-pages.py first')
E = [
(r"""/* runners-up are computed AFTER the lock swap, or a locked pick shows up as its own runner-up */""",
r"""/* W9B-GOATED (5 Oct 2026): Cat's goated Year 11 picks (the tap page, saved as `goated` on each cell of SCAPES-Y11.json)
   win over the score rig on every re-run. A goated slug that is no longer in its cell is reported, never guessed. */
if (Y11 && fs.existsSync(OUT + '.json')) {
  const prior = new Map((JSON.parse(fs.readFileSync(OUT + '.json', 'utf8')).cells || []).filter(c => c.goated).map(c => [`${c.curriculum}|${c.subject}|${c.topic}`, c.goated]));
  for (const cell of cells.values()) {
    const g = prior.get(`${cell.curriculum}|${cell.subject}|${cell.topic}`);
    if (!g) continue;
    const m = cell.members.find(x => x.slug === g);
    if (!m) { console.log(`  ⚠ goated ${g} is no longer in ${cell.curriculum} ${cell.subject} · ${cell.topic} — score pick used, re-tap it`); continue; }
    if (cell.pick.slug !== g) { cell.altPick = cell.pick; cell.pick = m; }
    cell.goated = g;
  }
}
/* runners-up are computed AFTER the lock swap, or a locked pick shows up as its own runner-up */""", 1),
(r"""**${p.slug}**${c.locked ? ' 🔒' : ''}""",
r"""**${p.slug}**${c.locked ? ' 🔒' : ''}${c.goated ? ' 🐐' : ''}""", 1),
]
new = src
for old, rep, n in E:
    c = new.count(old)
    if c != n: sys.exit(f'anchor found {c}x, expected {n}x: {old[:90]}')
    new = new.replace(old, rep)
t = tempfile.mkdtemp(); p = os.path.join(t, F); open(p, 'w').write(new)
r = subprocess.run(['node', '--check', p], capture_output=True, text=True)
if r.returncode: sys.exit('node --check failed\n' + r.stderr)
print(f'  {F}: {len(E)} edits, parses')
if not APPLY: print('DRY RUN - re-run with --apply'); sys.exit(0)
bak = os.path.join('_patches', 'w-track', '.bak-w9b-' + datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))
os.makedirs(bak, exist_ok=True); shutil.copy2(F, os.path.join(bak, F)); open(F, 'w', encoding='utf-8').write(new)
ok = open(F, encoding='utf-8').read() == new
print(('  ✓ ' if ok else '  ✗ ') + F + ' on disk = tested candidate'); print('APPLIED · backup in ' + bak)
if not ok: sys.exit(1)
