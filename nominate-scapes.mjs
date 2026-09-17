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
const SUBJECTS = process.argv.slice(2).length ? process.argv.slice(2) : ['Chemistry', 'Physics'];

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
  for (const cm of c.curriculumMappings || []) {
    if (!SUBJECTS.some(s => s.toLowerCase() === String(cm.subject || '').toLowerCase())) continue;
    const key = `${cm.curriculum}|${cm.subject}|${cm.topic}`;
    if (!cells.has(key)) cells.set(key, { curriculum: cm.curriculum, subject: cm.subject, topic: cm.topic, members: [] });
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

fs.writeFileSync('SCAPES-PROPOSED.json', JSON.stringify({ builtAt: new Date().toISOString(), subjects: SUBJECTS, cells: out }, null, 1));

const md = [];
md.push('# SCAPES-PROPOSED — one live knowscape per cell');
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
    md.push(`| ${c.subject} · ${c.topic} | **${p.slug}**${c.locked ? ' 🔒' : ''} | ${p.why.join(' · ')} (${p.score}) | ${c.runnersUp.map(r => `${r.slug} (${r.score})`).join(' · ') || '—'} |`);
  }
  md.push('');
}
md.push('🔒 = already ruled, not proposed (HANDOVER-LANE4 §2).');
fs.writeFileSync('SCAPES-PROPOSED.md', md.join('\n') + '\n');

/* the page is the CONCEPT, not the cell — a cross-cert concept serves two cells from one URL */
const pages = new Map();
for (const c of out) {
  const p = c.pick;
  if (!pages.has(p.id)) pages.set(p.id, { id: p.id, slug: p.slug, title: p.title, subject: c.subject, cells: [] });
  pages.get(p.id).cells.push({ curriculum: c.curriculum, subject: c.subject, topic: c.topic });
}
fs.writeFileSync('SCAPES-PROPOSED.json', JSON.stringify({ builtAt: new Date().toISOString(), subjects: SUBJECTS, cells: out, pages: [...pages.values()] }, null, 1));

console.log(`cells ${out.length} · pages ${pages.size} · widgets scanned ${scanned} · missing ${missing.length} · dead ties ${out.filter(c => c.tie > 1).length} · no big idea ${out.filter(c => !c.bigIdea).length}`);
for (const c of out) console.log(`  ${c.curriculum} ${c.subject} · ${c.topic}  →  ${c.pick.slug}  [${c.pick.score}] ${c.pick.why.join(',')}${c.locked ? ' LOCKED' : ''}`);
