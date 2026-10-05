#!/usr/bin/env node
/* nominate-scapes.mjs — propose ONE knowscape per curriculum cell. Muppet proposes, Cat vetoes (Lane 4 §2).
   Reads the flat store only (widgets-cache/concepts) — never _custom/, never the teal sources are written.
   Scores a widget by how VISIBLY REACTIVE it is: a slider that changes a picture beats a quiz.
   Emits SCAPES-PROPOSED.json (the generator reads this) and SCAPES-PROPOSED.md (Cat strikes this).
   Read-only against the app repo. Usage: node nominate-scapes.mjs [Subject ...]            */
import fs from 'node:fs';
import path from 'node:path';

const APP = path.join(process.cwd(), '..', '..', 'Backend', 'knowhereApp');
const FLAT = path.join(APP, 'widgets-cache', 'concepts');
/* W9-YEAR-11 (5 Oct 2026): --level=11 nominates the public Year 11 pages into their own file (SCAPES-Y11.json/.md) and
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
const HAS_PAGE = new Set(Y11 && fs.existsSync('SCAPES-PROPOSED.json') ? (JSON.parse(fs.readFileSync('SCAPES-PROPOSED.json', 'utf8')).pages || []).map(p => p.slug) : []);

const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'generated-concepts.json'), 'utf8'));
const bigIdeas = JSON.parse(fs.readFileSync(path.join(APP, 'big-ideas.json'), 'utf8'));

/* ── the scoring rig ─────────────────────────────────────────────────────────
   Every signal is counted from the widget's own source. Nothing is asserted. */
const SIGNALS = [
  ['slider',      40, h => /<input[^>]+type\s*=\s*["']?range/i.test(h)],
  ['canvas+raf',  26, h => /<canvas/i.test(h) && /requestAnimationFrame/.test(h)],
  ['drag',        22, h => /(pointerdown|mousedown|touchstart)/i.test(h)],
  ['svg-live',    14, h => /<svg/i.test(h) && /(setAttribute\(\s*["'](cx|cy|x1|y1|d|transform|r|width|height)|style\.(transform|width|height|left|top))/.test(h)],
  ['toggle',      12, h => /<input[^>]+type\s*=\s*["']?(checkbox|radio)/i.test(h) || /<select/i.test(h)],
  ['button',       8, h => /<button/i.test(h)],
  ['transition',   6, h => /(transition\s*:|@keyframes)/i.test(h)],
];
/* a quiz is a legitimate widget and a terrible shop window — it asks before it shows */
const QUIZ = h => /(data-correct|isCorrect|correctAnswer|["']correct["']|checkAnswer|score\s*\+\+|\bquiz\b)/i.test(h);

const read = f => { try { return fs.readFileSync(f, 'utf8'); } catch { return null; } };
const deslug = s => s.replace(/-s-/g, "'s-").replace(/-/g, ' ');

/* ── build the cell table from the manifest ──────────────────────────────── */
const cells = new Map();
for (const c of manifest.concepts) {
  if (Y11 && ((c.curriculumMappings || []).some(m => (m.level || 'Year 12') === 'Year 12') || HAS_PAGE.has(c.slug))) continue;
  for (const cm of c.curriculumMappings || []) {
    if (!SUBJECTS.some(s => s.toLowerCase() === String(cm.subject || '').toLowerCase())) continue;
    if (Y11 !== Y11_COHORT.test(cohortOf(cm))) continue;   /* W9-YEAR-11: each run sees only its own year */
    if (Y11 && cm.level !== 'Year 11') continue;
    const key = `${cm.curriculum}|${cm.subject}|${cm.topic}`;
    if (!cells.has(key)) cells.set(key, { curriculum: cm.curriculum, subject: cm.subject, topic: cm.topic, ...(Y11 ? { level: 'Year 11' } : {}), members: [] });
    const cell = cells.get(key);
    if (!cell.members.some(m => m.id === c.id)) cell.members.push({ id: c.id, slug: c.slug, role: cm.role || '', level: cm.level || '', dotPoint: cm.dotPoint || '', prereqs: (c.prerequisites || []).length });
  }
}

/* ── score every member from its widget on disk ──────────────────────────── */
const files = fs.readdirSync(FLAT);
const byId = new Map();
for (const f of files) { const m = /^(cpt_[0-9a-f]+)--(.+)\.html$/.exec(f); if (m) byId.set(m[1], f); }

let scanned = 0, missing = [];
for (const cell of cells.values()) {
  for (const mem of cell.members) {
    const file = byId.get(mem.id);
    if (!file) { missing.push(mem.id); mem.score = -1; mem.why = ['no widget on disk']; continue; }
    const html = read(path.join(FLAT, file));
    const meta = JSON.parse(read(path.join(FLAT, file.replace(/\.html$/, '.meta.json'))) || '{}');
    scanned++;
    mem.file = file; mem.title = meta.title || deslug(mem.slug); mem.tc = meta.tc || null;
    mem.exam = meta.exam || ''; mem.summary = meta.summary || ''; mem.order = (meta.order ?? 99);
    let score = 0; const hits = [];
    for (const [name, pts, test] of SIGNALS) if (test(html)) { score += pts; hits.push(name); }
    if (QUIZ(html)) { score -= 18; hits.push('−quiz'); }
    if (mem.role === 'core') { score += 6; hits.push('core'); }
    if (mem.order <= 1) { score += 5; hits.push('opens the topic'); }
    if (mem.prereqs) { score += Math.min(6, mem.prereqs * 3); hits.push(`${mem.prereqs} prereq`); }
    mem.score = score; mem.why = hits; mem.bytes = html.length;
  }
  cell.members.sort((a, b) => b.score - a.score || a.order - b.order);
  cell.pick = cell.members[0];
  cell.tie = cell.members.filter(x => x.score === cell.pick.score).length;
}

/* ── the two already ruled (HANDOVER-LANE4 §2: Chemistry and Physics stay as picked) ── */
const LOCKED = { 'chemistry': 'collision-theory', 'physics': 'force-on-a-moving-charge' };
for (const cell of cells.values()) {
  const want = LOCKED[String(cell.subject).toLowerCase()];
  const m = want && cell.members.find(x => x.slug === want);
  if (m && cell.pick && cell.pick.slug !== want) { cell.altPick = cell.pick; cell.pick = m; cell.locked = true; }
  else if (m) cell.locked = true;
}
/* W9B-GOATED (5 Oct 2026): Cat's goated Year 11 picks (the tap page, saved as `goated` on each cell of SCAPES-Y11.json)
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
/* runners-up are computed AFTER the lock swap, or a locked pick shows up as its own runner-up */
for (const cell of cells.values()) cell.runnersUp = cell.members.filter(x => x.id !== cell.pick.id).slice(0, 3);

const out = [...cells.values()].sort((a, b) =>
  a.curriculum.localeCompare(b.curriculum) || a.subject.localeCompare(b.subject) || a.topic.localeCompare(b.topic));

/* big-ideas.entries is an OBJECT keyed "Subject/Topic", not an array — and it is per TOPIC, not per concept */
const bi = new Map(Object.entries(bigIdeas.entries || {}));
for (const cell of out) {
  const e = bi.get(`${cell.subject}/${cell.topic}`);
  cell.bigIdea = e ? (e.canonical || e.grounded || '') : '';
  cell.bigIdeaKey = e ? `${cell.subject}/${cell.topic}` : null;
}

fs.writeFileSync(OUT + '.json', JSON.stringify({ builtAt: new Date().toISOString(), subjects: SUBJECTS, ...(Y11 ? { level: 'Year 11' } : {}), cells: out }, null, 1));

const md = [];
md.push(`# ${OUT} — one live knowscape per cell${Y11 ? ' · Year 11' : ''}`);
md.push(`**Muppet proposes · Cat vetoes.** ${out.length} cells · ${SUBJECTS.join(' + ')} · built ${new Date().toISOString().slice(0, 10)}.`);
md.push('');
md.push('Strike a pick by replacing the slug in the **pick** column with one of the runners-up. The generator reads `SCAPES-PROPOSED.json`, so hand the strikes back rather than editing the JSON.');
md.push('');
for (const cert of ['HSC', 'VCE']) {
  const rows = out.filter(c => c.curriculum === cert);
  if (!rows.length) continue;
  md.push(`## ${cert} — ${rows.length} cells`); md.push('');
  md.push('| cell | pick | why | runners-up |');
  md.push('|---|---|---|---|');
  for (const c of rows) {
    const p = c.pick;
    md.push(`| ${c.subject} · ${c.topic} | **${p.slug}**${c.locked ? ' 🔒' : ''}${c.goated ? ' 🐐' : ''} | ${p.why.join(' · ')} (${p.score}) | ${c.runnersUp.map(r => `${r.slug} (${r.score})`).join(' · ') || '—'} |`);
  }
  md.push('');
}
md.push('🔒 = already ruled, not proposed (HANDOVER-LANE4 §2).');
fs.writeFileSync(OUT + '.md', md.join('\n') + '\n');

/* the page is the CONCEPT, not the cell — a cross-cert concept serves two cells from one URL */
const pages = new Map();
for (const c of out) {
  const p = c.pick;
  if (!pages.has(p.id)) pages.set(p.id, { id: p.id, slug: p.slug, title: p.title, subject: c.subject, ...(Y11 ? { level: 'Year 11' } : {}), cells: [] });
  pages.get(p.id).cells.push({ curriculum: c.curriculum, subject: c.subject, topic: c.topic });
}
fs.writeFileSync(OUT + '.json', JSON.stringify({ builtAt: new Date().toISOString(), subjects: SUBJECTS, ...(Y11 ? { level: 'Year 11' } : {}), cells: out, pages: [...pages.values()] }, null, 1));

console.log(`cells ${out.length} · pages ${pages.size} · widgets scanned ${scanned} · missing ${missing.length} · dead ties ${out.filter(c => c.tie > 1).length} · no big idea ${out.filter(c => !c.bigIdea).length}`);
for (const c of out) console.log(`  ${c.curriculum} ${c.subject} · ${c.topic}  →  ${c.pick.slug}  [${c.pick.score}] ${c.pick.why.join(',')}${c.locked ? ' LOCKED' : ''}`);
