/* founding-duo-20261120 (KW:FOUNDDUO) — concept pages serve students AND teachers (Cat, 20 Nov 2026).
   Patches the LIVE concept pages in place (a full build-concept-pages.mjs --apply would rewrite 184/185 pages and drop
   later on-disk patches). Per page, two edits only:
     1. knowhere-passbar.js?v=2|3  ->  ?v=7   (cache-bust: the bar + sheet + utm tagging live in that one script)
     2. the door row gets a third door, after the parent one:
        teacher? claim your founding seat ->  signup?as=teacher
   The generators (build-concept-pages.mjs, build-concept-collision.js) write the same, so a regen can't undo it.
   node _patches/founding-duo-20261120/patch.mjs            dry run (default)
   node _patches/founding-duo-20261120/patch.mjs --apply    write, back up, read back */
import fs from 'fs';
import path from 'path';
const APPLY = process.argv.includes('--apply');
const HERE = path.dirname(new URL(import.meta.url).pathname);
const BAK = path.join(HERE, 'bak-pages');
const PARENT_DOOR = '        <a class="door sec" href="/for-parents?as=parent">parent? start their free week →</a>\n';
export const TEACH_DOOR = '        <a class="door sec" data-kw-from="door-teacher" href="https://app.knowhere.me/signup?as=teacher">teacher? claim your founding seat&nbsp;→</a>\n';
const pages = [];
const walk = d => { for (const f of fs.readdirSync(d)) { const q = path.join(d, f); if (fs.statSync(q).isDirectory()) walk(q); else if (f.endsWith('.html') && f !== 'index.html') pages.push(q); } };
walk('vce'); walk('hsc');
let todo = 0, done = 0, bad = [];
const out = [];
for (const f of pages.sort()) {
  const s = fs.readFileSync(f, 'utf8');
  if (!s.includes('KNOWHERE:CONCEPT-PAGE')) { bad.push(f + ' (not a concept page)'); continue; }
  let t = s;
  const tags = t.match(/knowhere-passbar\.js\?v=\d+"/g) || [];
  if (tags.length !== 1) { bad.push(f + ' (passbar tags: ' + tags.length + ')'); continue; }
  t = t.replace(/knowhere-passbar\.js\?v=\d+"/, 'knowhere-passbar.js?v=7"');
  if (!t.includes('signup?as=teacher')) {
    if (t.split(PARENT_DOOR).length !== 2) { bad.push(f + ' (parent door not found once)'); continue; }
    t = t.replace(PARENT_DOOR, PARENT_DOOR + TEACH_DOOR);
  }
  if (t === s) { done++; continue; }
  todo++; out.push(f);
  if (APPLY) {
    const b = path.join(BAK, f); fs.mkdirSync(path.dirname(b), { recursive: true });
    if (!fs.existsSync(b)) fs.writeFileSync(b, s);
    fs.writeFileSync(f, t);
  }
}
console.log(`${pages.length} concept pages · ${todo} to change · ${done} already done · ${bad.length} refused`);
for (const b of bad) console.log('  ✗ ' + b);
if (!APPLY) { console.log('dry run: nothing written. e.g. ' + out.slice(0, 3).join(', ')); process.exit(bad.length ? 1 : 0); }
/* receipts, read back from disk */
let fail = 0;
for (const f of pages) {
  const s = fs.readFileSync(f, 'utf8');
  const ok = s.includes('knowhere-passbar.js?v=7"') && (s.match(/signup\?as=teacher/g) || []).length === 1
    && s.indexOf(PARENT_DOOR + TEACH_DOOR) > 0 && s.includes('data-where="concept:') && s.includes('signup?as=student');
  if (!ok) { fail++; console.log('  ✗ receipt ' + f); }
}
console.log(fail ? `✗ ${fail} receipts failed` : `✓ ${pages.length}/${pages.length} receipts: v=7 passbar, one teacher door after the parent door · backups in ${path.relative('.', BAK)}/`);
process.exit(fail ? 1 : 0);
