#!/usr/bin/env python3
"""W track piece 9 - public Year 11 pages (website repo). Muppet, Mon 5 Oct 2026.

Run from the knowhere-website repo root:
    python3 _patches/w-track/apply-w9-site-year-11-pages.py            (dry run)
    python3 _patches/w-track/apply-w9-site-year-11-pages.py --apply

What it does
  nominate-scapes.mjs   --level=11 writes the Year 11 picks to SCAPES-Y11.json/.md (never SCAPES-PROPOSED.json).
                        The Year 12 run ignores the Year 11 cohorts' mappings.
  build-concept-pages   learns a level: Year 11 pages at /<cert>/year-11/<subject>/<slug> (D42), built only while the
                        cohort has a live release; a live URL never moves (pins the 8 pages the manifest has drifted
                        away from); KW_REGISTRY points it at a planted registry for proofs.
  knowhere-seo-v2.sh    its sitemap walks /<cert>/year-11/ too, so an SEO regen never drops the Year 11 pages.
  knowhere-passbar.js   data-pass="off" = the plain free-week bar, never the exam pass (Year 11 has neither).

Idempotent (marker W9-YEAR-11), all-or-nothing preflight, node --check / bash -n on every candidate,
backups in _patches/w-track/.bak-w9-<stamp>/ (gitignored, not served), receipts read back from disk.
"""
import os, sys, shutil, subprocess, datetime, tempfile

APPLY = '--apply' in sys.argv
MARK = 'W9-YEAR-11'
ROOT = os.getcwd()
if not (os.path.exists('build-concept-pages.mjs') and os.path.exists('knowhere-seo-v2.sh')):
    sys.exit('run this from the knowhere-website repo root')

def die(m):
    print('✗ ' + m); sys.exit(1)

PASS_OLD_START = '      <div class="passbox kw-pass">\n'
PASS_OLD_END = '      <p class="pass-line" data-pass-fallback="block">Free for a week, then a plan you can stop any time.</p>\n'

E = {}

# ───────────────────────────── nominate-scapes.mjs ─────────────────────────────
E['nominate-scapes.mjs'] = [
(r"""const SUBJECTS = process.argv.slice(2).length ? process.argv.slice(2) : ['Chemistry', 'Physics'];""",
r"""/* W9-YEAR-11 (5 Oct 2026): --level=11 nominates the public Year 11 pages into their own file (SCAPES-Y11.json/.md) and
   never touches SCAPES-PROPOSED.json, which holds the Year 12 picks Cat has already vetoed. The Year 12 run ignores the
   Year 11 cohorts' mappings (hsc-y11, vce-y11), so a Year 11 absorb can never slip into a Year 12 cell. */
const ARGS = process.argv.slice(2).filter(a => !a.startsWith('--'));
const Y11 = process.argv.some(a => a === '--level=11' || a === '--level=Year 11');
const SUBJECTS = ARGS.length ? ARGS : ['Chemistry', 'Physics'];
const OUT = Y11 ? 'SCAPES-Y11' : 'SCAPES-PROPOSED';
const Y11_COHORT = /^(hsc|vce)-y11$/;
const cohortOf = m => String(m.origin || '').split('/')[0];
/* A Year 11 page is only for a concept that is Year 11 alone and has no public page yet. A concept with a Year 12
   mapping, or one already nominated for a Year 12 page, keeps the one URL it has: never two pages with one body. */
const HAS_PAGE = new Set(Y11 && fs.existsSync('SCAPES-PROPOSED.json') ? (JSON.parse(fs.readFileSync('SCAPES-PROPOSED.json', 'utf8')).pages || []).map(p => p.slug) : []);""", 1),
(r"""for (const c of manifest.concepts) {
  for (const cm of c.curriculumMappings || []) {
    if (!SUBJECTS.some(s => s.toLowerCase() === String(cm.subject || '').toLowerCase())) continue;
    const key = `${cm.curriculum}|${cm.subject}|${cm.topic}`;
    if (!cells.has(key)) cells.set(key, { curriculum: cm.curriculum, subject: cm.subject, topic: cm.topic, members: [] });""",
r"""for (const c of manifest.concepts) {
  if (Y11 && ((c.curriculumMappings || []).some(m => (m.level || 'Year 12') === 'Year 12') || HAS_PAGE.has(c.slug))) continue;
  for (const cm of c.curriculumMappings || []) {
    if (!SUBJECTS.some(s => s.toLowerCase() === String(cm.subject || '').toLowerCase())) continue;
    if (Y11 !== Y11_COHORT.test(cohortOf(cm))) continue;   /* W9-YEAR-11: each run sees only its own year */
    if (Y11 && cm.level !== 'Year 11') continue;
    const key = `${cm.curriculum}|${cm.subject}|${cm.topic}`;
    if (!cells.has(key)) cells.set(key, { curriculum: cm.curriculum, subject: cm.subject, topic: cm.topic, ...(Y11 ? { level: 'Year 11' } : {}), members: [] });""", 1),
(r"""fs.writeFileSync('SCAPES-PROPOSED.json', JSON.stringify({ builtAt: new Date().toISOString(), subjects: SUBJECTS, cells: out }, null, 1));""",
r"""fs.writeFileSync(OUT + '.json', JSON.stringify({ builtAt: new Date().toISOString(), subjects: SUBJECTS, ...(Y11 ? { level: 'Year 11' } : {}), cells: out }, null, 1));""", 1),
(r"""md.push('# SCAPES-PROPOSED — one live knowscape per cell');""",
r"""md.push(`# ${OUT} — one live knowscape per cell${Y11 ? ' · Year 11' : ''}`);""", 1),
(r"""fs.writeFileSync('SCAPES-PROPOSED.md', md.join('\n') + '\n');""",
r"""fs.writeFileSync(OUT + '.md', md.join('\n') + '\n');""", 1),
(r"""  if (!pages.has(p.id)) pages.set(p.id, { id: p.id, slug: p.slug, title: p.title, subject: c.subject, cells: [] });""",
r"""  if (!pages.has(p.id)) pages.set(p.id, { id: p.id, slug: p.slug, title: p.title, subject: c.subject, ...(Y11 ? { level: 'Year 11' } : {}), cells: [] });""", 1),
(r"""fs.writeFileSync('SCAPES-PROPOSED.json', JSON.stringify({ builtAt: new Date().toISOString(), subjects: SUBJECTS, cells: out, pages: [...pages.values()] }, null, 1));""",
r"""fs.writeFileSync(OUT + '.json', JSON.stringify({ builtAt: new Date().toISOString(), subjects: SUBJECTS, ...(Y11 ? { level: 'Year 11' } : {}), cells: out, pages: [...pages.values()] }, null, 1));""", 1),
]

# ───────────────────────────── build-concept-pages.mjs ─────────────────────────────
E['build-concept-pages.mjs'] = [
(r"""/* s7-y11-fence: cohorts with no live release (pipeline/cohorts.json) — their mappings do not exist to the public site yet */""",
r"""/* W9-YEAR-11: KW_REGISTRY points the generator at a planted registry copy (the same switch the server's gates use), so a
   proof run can build the Year 11 pages before 4 Jan without touching pipeline/cohorts.json */
const REGISTRY = process.env.KW_REGISTRY ? path.resolve(process.env.KW_REGISTRY) : path.join(APP, 'pipeline', 'cohorts.json');
/* s7-y11-fence: cohorts with no live release (pipeline/cohorts.json) — their mappings do not exist to the public site yet */""", 1),
(r"""JSON.parse(fs.readFileSync(path.join(APP, 'pipeline', 'cohorts.json'), 'utf8'))""",
r"""JSON.parse(fs.readFileSync(REGISTRY, 'utf8'))""", 1),
(r"""const scapes = JSON.parse(fs.readFileSync('SCAPES-PROPOSED.json', 'utf8'));""",
r"""const scapes = JSON.parse(fs.readFileSync('SCAPES-PROPOSED.json', 'utf8'));
/* W9-YEAR-11 (5 Oct 2026): the public Year 11 pages have their own picks (nominate-scapes.mjs --level=11 → SCAPES-Y11.json)
   and their own addresses, /<cert>/year-11/<subject>/<slug> (D42). A page is built only while its cohort has a live
   release; until then it does not exist anywhere — not on disk, not in the sitemap, not as a link from another page. */
const Y11_DIR = 'year-11';
const scapesY11 = fs.existsSync('SCAPES-Y11.json') ? JSON.parse(fs.readFileSync('SCAPES-Y11.json', 'utf8')) : { cells: [], pages: [] };
const targetsY11 = [];""", 1),
(r"""const skipped = [];
for (const p of targets) {
  const concept = byId.get(p.id);
  const home = concept && homeOf(concept);
  if (!home) { skipped.push([p.slug, 'no curriculum mapping']); continue; }
  const cert = home.curriculum === 'HSC' ? 'hsc' : 'vce';
  p.cert = cert;
  p.dir = subjSlug(home.subject);
  p.homeSubject = home.subject;""",
r"""/* W9-YEAR-11 · A LIVE URL NEVER MOVES. A page already on disk keeps its address, whatever its concept's mappings say
   today. Found 5 Oct: since 17 Sep the manifest re-filed 5 live pages wholly into the Year 11 cohorts (empirical formulae,
   polymerisation, market equilibrium, scheduling, index laws) and HSC Year 12 absorbed 3 VCE Economics pages, so a plain
   re-run would have dropped 5 from the sitemap and moved 3 from /vce/ to /hsc/. Pinned, they rebuild where they are,
   from the cell they were nominated for. */
const certOf = h => (h.curriculum === 'HSC' ? 'hsc' : 'vce');
const onDiskHome = new Map();
for (const cert of ['hsc', 'vce']) {
  if (!fs.existsSync(cert)) continue;
  for (const d of fs.readdirSync(cert)) {
    if (d === Y11_DIR || !fs.statSync(path.join(cert, d)).isDirectory()) continue;
    for (const f of fs.readdirSync(path.join(cert, d))) if (f.endsWith('.html')) onDiskHome.set(f.slice(0, -5), { cert, dir: d });
  }
}
const pinned = [];
const skipped = [];
for (const p of targets) {
  const concept = byId.get(p.id);
  let home = concept && homeOf(concept);
  const was = onDiskHome.get(p.slug);
  /* also pinned: a live page whose home would become a Year 11 cohort mapping once that cohort goes live — it stays the
     page it went live as, and the Year 11 framing lives on the /year-11/ pages */
  if (concept && was && (!home || certOf(home) !== was.cert || subjSlug(home.subject) !== was.dir || /^(hsc|vce)-y11\//.test(String(home.origin || '')))) {
    home = p.home = p.cells.find(c => certOf(c) === was.cert && subjSlug(c.subject) === was.dir) || p.cells[0];
    pinned.push(`${was.cert}/${was.dir}/${p.slug}`);
  }
  if (!home) { skipped.push([p.slug, 'no curriculum mapping']); continue; }
  /* a concept that is Year 11 alone never gets a NEW address outside /year-11/ — its page, if any, comes from SCAPES-Y11 */
  if (!was && (home.level || 'Year 12') !== 'Year 12') { skipped.push([p.slug, 'Year 11 only — no new page at a Year 12 address']); continue; }
  const cert = p.home ? was.cert : certOf(home);
  p.cert = cert;
  p.dir = p.home ? was.dir : subjSlug(home.subject);
  p.homeSubject = home.subject;""", 1),
(r"""  pageFor.set(p.slug, p);
}
const live = targets.filter(p => pageFor.has(p.slug));""",
r"""  pageFor.set(p.slug, p);
}
/* W9-YEAR-11: the Year 11 pages — one per Year 11 cell, only while that cohort is live */
for (const p of (scapesY11.pages || []).filter(q => !ONLY || q.slug === ONLY)) {
  const cell = p.cells[0];
  const cert = certOf(cell);
  if (darkCohorts.has(`${cert}-y11`)) { skipped.push([p.slug, `Year 11 ${cell.curriculum} is not live yet`]); continue; }
  if (!byId.get(p.id)) { skipped.push([p.slug, 'not in the manifest']); continue; }
  if (pageFor.has(p.slug) || onDiskHome.has(p.slug)) { skipped.push([p.slug, 'already has a page (its URL never moves)']); continue; }
  p.level = 'Year 11';
  p.home = { ...cell, level: 'Year 11' };
  p.cert = cert;
  p.dir = subjSlug(cell.subject);
  p.homeSubject = cell.subject;
  if (!isShipped(cert, p.dir)) { skipped.push([p.slug, `${cell.curriculum} ${cell.subject} is not in release 1`]); continue; }
  p.url = `https://knowhere.me/${cert}/${Y11_DIR}/${p.dir}/${p.slug}`;
  p.file = path.join(cert, Y11_DIR, p.dir, p.slug + '.html');
  pageFor.set(p.slug, p);
  targetsY11.push(p);
}
const live = [...targets, ...targetsY11].filter(p => pageFor.get(p.slug) === p);""", 1),
(r"""  console.log('\nnot built — not in release 1:');""",
r"""  console.log('\nnot built:');""", 1),
(r"""console.log(`${targets.length} nominated · ${scapes.cells.length} cells`);""",
r"""console.log(`${targets.length} nominated · ${scapes.cells.length} cells`);
console.log(`Year 11: ${(scapesY11.pages || []).length} nominated · ${(scapesY11.cells || []).length} cells · ${targetsY11.length} live`);
if (pinned.length) { console.log('\npinned — live address kept, the manifest has moved on:'); for (const f of pinned) console.log('  · ' + f); }""", 1),
(r"""const linkTo = slug => { const p = pageFor.get(slug); return p ? `/${p.cert}/${p.dir}/${p.slug}` : null; };""",
r"""const linkTo = slug => { const p = pageFor.get(slug); return p ? `/${p.cert}/${p.level === 'Year 11' ? Y11_DIR + '/' : ''}${p.dir}/${p.slug}` : null; };""", 1),
(r"""  const home = homeOf(concept);""",
r"""  const home = p.home || homeOf(concept);""", 1),
(r"""  const cellRec = scapes.cells.find(""",
r"""  const cellRec = (p.level === 'Year 11' ? scapesY11 : scapes).cells.find(""", 1),
(r"""  const level = levels.has('Year 12') ? 'Year 12' : (levels.has('Year 11') ? 'Year 11' : 'Year 12');""",
r"""  const level = p.level || (levels.has('Year 12') ? 'Year 12' : (levels.has('Year 11') ? 'Year 11' : 'Year 12'));
  /* W9-YEAR-11: a Year 11 page talks like the app's Year 11 view — the marker, not the examiner. S9's Year 11 assessment
     line when the picture has one; no box at all when it does not (the Year 12 exam line is never shown to Year 11). */
  const Y11P = p.level === 'Year 11';
  const y11Copy = Y11P ? (((meta.levelCopy || {})['Year 11']) || {}) : null;
  const catchBox = Y11P
    ? (y11Copy.assessment ? `<div class="catch"><b>what markers look for</b> — ${stars(y11Copy.assessment)}</div>` : '')
    : (meta.exam ? `<div class="catch"><b>what examiners catch</b> — ${stars(meta.exam)}</div>` : '');""", 1),
(r"""    ${meta.exam ? `<div class="catch"><b>what examiners catch</b> — ${stars(meta.exam)}</div>` : ''}""",
r"""    ${catchBox}""", 2),
(r"""  } else if (idea || meta.exam) {""",
r"""  } else if (idea || catchBox) {""", 1),
(r"""  const eyebrowMain = `${home.curriculum} · ${home.subject} · ${esc(home.topic)}`;""",
r"""  const eyebrowMain = `${home.curriculum} · ${Y11P ? 'Year 11 · ' : ''}${home.subject} · ${esc(home.topic)}`;""", 1),
(r"""  const TITLE = `${title.toLowerCase()} — ${home.curriculum} ${home.subject.toLowerCase()}, live — knowhere`;""",
r"""  const TITLE = `${title.toLowerCase()} — ${home.curriculum} ${home.subject.toLowerCase()}${Y11P ? ' year 11' : ''}, live — knowhere`;""", 1),
(r"""    educationalFramework: c.curriculum === 'HSC' ? `NSW HSC ${c.subject}` : `VCE ${c.subject} Units 3&4`,""",
r"""    educationalFramework: Y11P ? (c.curriculum === 'HSC' ? `NSW Stage 6 ${c.subject} Year 11` : `VCE ${c.subject} Units 1&2`) : (c.curriculum === 'HSC' ? `NSW HSC ${c.subject}` : `VCE ${c.subject} Units 3&4`),""", 1),
(r"""          { '@type': 'ListItem', position: 2, name: `${home.curriculum} ${home.subject}`, item: p.url },""",
r"""          { '@type': 'ListItem', position: 2, name: `${home.curriculum} ${home.subject}${Y11P ? ' Year 11' : ''}`, item: p.url },""", 1),
(r"""<meta property="og:image:alt" content="knowhere — Year 12 study built for your brain">""",
r"""<meta property="og:image:alt" content="knowhere — ${Y11P ? 'Year 11' : 'Year 12'} study built for your brain">""", 1),
(r"""<script src="/knowhere-passbar.js?v=2" defer data-where="concept:${p.slug}" data-away=".cta-box"></script><!-- KW:PASSBAR -->""",
r"""<script src="/knowhere-passbar.js?v=${Y11P ? 3 : 2}" defer data-where="concept:${p.slug}"${Y11P ? ' data-pass="off"' : ''} data-away=".cta-box"></script><!-- KW:PASSBAR -->""", 1),
('__PASSBOX__', None, 1),
(r"""<span>${esc(home.curriculum.toLowerCase())} ${esc(home.subject.toLowerCase())}</span><span>›</span>""",
r"""<span>${esc(home.curriculum.toLowerCase())} ${esc(home.subject.toLowerCase())}${Y11P ? ' year 11' : ''}</span><span>›</span>""", 1),
(r"""', as a thing you can drag — one Year 12 '""",
r"""', as a thing you can drag — one ' + (Y11P ? 'Year 11' : 'Year 12') + ' '""", 1),
(r"""  if (/\b(grade|ATAR|marks? improve|band 6)\b/i.test(b.html.replace(/what examiners catch[\s\S]*?<\/div>/g, ''))) warn.push(`${b.p.slug}: check for an outcome claim`);""",
r"""  if (/\b(grade|ATAR|marks? improve|band 6)\b/i.test(b.html.replace(/what examiners catch[\s\S]*?<\/div>/g, ''))) warn.push(`${b.p.slug}: check for an outcome claim`);
  /* W9-YEAR-11: Year 11 has no external exam — a Year 11 page whose words still say exam, ATAR or Year 12 is wrong */
  if (b.p.level === 'Year 11') {
    const words = b.html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ');
    const hit = words.match(/\b(exams?|examiners?|ATAR|Year 12)\b/i);
    if (hit) warn.push(`${b.p.slug}: Year 11 page says "${hit[0]}"`);
  }""", 1),
(r"""    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.html')) onDisk.add(path.join(cert, d, f));""",
r"""    if (!fs.statSync(dir).isDirectory()) continue;
    /* W9-YEAR-11: /<cert>/year-11/<subject>/<slug> sits one folder deeper */
    if (d === Y11_DIR) { for (const s of fs.readdirSync(dir)) { const sd = path.join(dir, s); if (fs.statSync(sd).isDirectory()) for (const f of fs.readdirSync(sd)) if (f.endsWith('.html')) onDisk.add(path.join(sd, f)); } continue; }
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.html')) onDisk.add(path.join(cert, d, f));""", 1),
(r"""    && pg.includes('for-parents?as=parent') && pg.includes('data-pass-days') && pg.includes('data-kw-handoff') && pg.includes('knowhere-passbar.js')""",
r"""    && pg.includes('for-parents?as=parent') && (b.p.level === 'Year 11' ? (!pg.includes('data-pass-days') && pg.includes('data-pass="off"')) : pg.includes('data-pass-days')) && pg.includes('data-kw-handoff') && pg.includes('knowhere-passbar.js')""", 1),
]

# ───────────────────────────── knowhere-seo-v2.sh ─────────────────────────────
E['knowhere-seo-v2.sh'] = [
(r"""            d = os.path.join(base, subj)
            if not os.path.isdir(d): continue
""",
r"""            d = os.path.join(base, subj)
            if not os.path.isdir(d): continue
            if subj == "year-11":   # W9-YEAR-11: /<cert>/year-11/<subject>/<slug> sits one folder deeper
                for s2 in sorted(os.listdir(d)):
                    d2 = os.path.join(d, s2)
                    if not os.path.isdir(d2): continue
                    for f in sorted(os.listdir(d2)):
                        if not f.endswith(".html") or ".bak" in f: continue
                        rows.append(f"  <url><loc>{SITE}/{cert}/year-11/{s2}/{f[:-5]}</loc><lastmod>{TODAY}</lastmod><priority>0.7</priority></url>")
                continue
""", 1),
]

# ───────────────────────────── knowhere-passbar.js ─────────────────────────────
E['knowhere-passbar.js'] = [
(r"""  var CLOSE = Date.UTC(2026, 9, 26, 12, 59), now = Date.now(), closed = now > CLOSE;""",
r"""  /* W9-YEAR-11: data-pass="off" = always the plain free-week bar, never the exam pass (Year 11 pages: no exam, no pass) */
  var CLOSE = Date.UTC(2026, 9, 26, 12, 59), now = Date.now(), closed = now > CLOSE || ds.pass === "off";""", 1),
]

# ── preflight, all in memory ──
done = [f for f in E if MARK in open(f, encoding='utf-8').read()]
if len(done) == len(E):
    print('already applied (' + MARK + ' in all ' + str(len(E)) + ' files) — nothing to do'); sys.exit(0)
if done:
    die('half-applied: ' + ', '.join(done) + ' carry ' + MARK + ', the others do not. Restore from git and re-run.')

out = {}
for f, edits in E.items():
    src = open(f, encoding='utf-8').read()
    new = src
    for old, rep, n in edits:
        if old == '__PASSBOX__':
            a = new.find(PASS_OLD_START); b = new.find(PASS_OLD_END)
            if a < 0 or b < 0 or b < a or new.count(PASS_OLD_START) != 1 or new.count(PASS_OLD_END) != 1:
                die(f + ': pass box anchors not found exactly once')
            block = new[a:b + len(PASS_OLD_END)]
            inner = block[6:-1]   # strip the leading 6 spaces and the trailing newline
            repl = ('      ${Y11P ? `<p class="pass-line">Free for a week, then a plan you can stop any time.</p>` : `'
                    + inner + '`}\n')
            new = new[:a] + repl + new[b + len(PASS_OLD_END):]
            continue
        c = new.count(old)
        if c != n: die(f'{f}: anchor found {c}x, expected {n}x:\n    {old[:110]}')
        new = new.replace(old, rep)
    out[f] = new
    print(f'  {f:28} {len(edits):2} edits  {len(src):7}B → {len(new):7}B')

# ── parse checks on the candidates ──
tmp = tempfile.mkdtemp(prefix='w9-')
for f, src in out.items():
    p = os.path.join(tmp, f); open(p, 'w', encoding='utf-8').write(src)
    if f.endswith(('.mjs', '.js')):
        r = subprocess.run(['node', '--check', p], capture_output=True, text=True)
    else:
        r = subprocess.run(['bash', '-n', p], capture_output=True, text=True)
    if r.returncode: die(f'{f}: parse check failed\n{r.stderr}')
    print(f'  ✓ parses  {f}')
# the SEO script's python heredoc must compile too
sh = out['knowhere-seo-v2.sh']
py = sh[sh.index("<<'PYEOF'\n") + 10: sh.index('\nPYEOF')]
try: compile(py, 'seo-heredoc', 'exec'); print('  ✓ parses  knowhere-seo-v2.sh (python heredoc)')
except SyntaxError as e: die('knowhere-seo-v2.sh heredoc: ' + str(e))
shutil.rmtree(tmp)

if not APPLY:
    print('\nDRY RUN — nothing written. Re-run with --apply.'); sys.exit(0)

stamp = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
bak = os.path.join('_patches', 'w-track', '.bak-w9-' + stamp)
os.makedirs(bak, exist_ok=True)
for f, src in out.items():
    shutil.copy2(f, os.path.join(bak, f))
    open(f, 'w', encoding='utf-8').write(src)

# ── receipts from disk ──
bad = 0
for f, src in out.items():
    disk = open(f, encoding='utf-8').read()
    ok = disk == src and MARK in disk
    print(('  ✓ ' if ok else '  ✗ ') + f + ' on disk = tested candidate')
    bad += not ok
if bad: die(f'{bad} receipt(s) failed — backups in {bak}')
print(f'\nAPPLIED · {len(out)} files · backups in {bak}/')
