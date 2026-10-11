#!/usr/bin/env node
/* vcaa-ack-patch.mjs — puts the VCAA acknowledgement (vcaa-ack.mjs, word for word) under the footer of every VCE concept
   page already on disk (vce/**, vce/year-11/** included). Cat, 11 Oct 2026. build-concept-pages.mjs carries the same line
   in its template, so a regen keeps it; this script exists because the full regen waits on Cat's word (p11-02).
   Idempotent: a page that already has the line is left alone. Dry run by default; --apply writes, with backups in
   _concept-backups/<stamp>-vcaa/ (gitignored, outside the scanned folders), then reads every page back from disk:
   exactly one copy on each VCE page, 0 HSC pages mention the VCAA, sitemap.xml unchanged.
   Usage: node vcaa-ack-patch.mjs [--apply] */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { VCAA_LINE, VCAA_TEXT, VCAA_MARK } from './vcaa-ack.mjs';

const APPLY = process.argv.includes('--apply');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const BAK = path.join('_concept-backups', stamp + '-vcaa');
const FOOT = '<knowhere-footer-nav></knowhere-footer-nav>';
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex').slice(0, 16);
const walk = d => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(path.join(d, e.name)) : (e.name.endsWith('.html') ? [path.join(d, e.name)] : [])) : [];
const count = (s, x) => s.split(x).length - 1;
const plain = s => s.replace(/<[^>]+>/g, '');

const vce = walk('vce').sort(), hsc = walk('hsc').sort();
const sitemapBefore = fs.existsSync('sitemap.xml') ? sha('sitemap.xml') : null;
const todo = [], has = [], bad = [];
for (const f of vce) {
  const s = fs.readFileSync(f, 'utf8');
  const marks = count(s, VCAA_MARK);
  if (marks === 1) { has.push(f); continue; }
  if (marks > 1) { bad.push(f + ': ' + marks + ' copies already'); continue; }
  if (count(s, FOOT) !== 1) { bad.push(f + ': ' + count(s, FOOT) + ' footers, expected 1'); continue; }
  /* the template's own shape: the footer line, then the acknowledgement on its own line */
  const i = s.indexOf(FOOT) + FOOT.length;
  todo.push({ f, out: s.slice(0, i) + '\n  ' + VCAA_LINE + s.slice(i) });
}
console.log(`${APPLY ? 'APPLY' : 'DRY RUN'} — ${vce.length} VCE pages: ${todo.length} to patch, ${has.length} already carry the line, ${bad.length} refused`);
bad.forEach(b => console.log('  ✗ ' + b));
todo.slice(0, 5).forEach(t => console.log('  + ' + t.f));
if (todo.length > 5) console.log(`  … and ${todo.length - 5} more`);
if (bad.length) { console.log('\nrefused pages need a look — nothing written'); process.exit(1); }
if (!APPLY) { console.log('\nnothing written — re-run with --apply'); process.exit(0); }

for (const t of todo) {
  const b = path.join(BAK, t.f);
  fs.mkdirSync(path.dirname(b), { recursive: true });
  fs.copyFileSync(t.f, b);
  fs.writeFileSync(t.f, t.out);
}

/* receipts, from disk */
let fail = 0;
const check = (ok, name) => { console.log((ok ? '  ✓ ' : '  ✗ ') + name); if (!ok) fail++; };
console.log('\nreceipts (from disk):');
const one = vce.filter(f => { const s = fs.readFileSync(f, 'utf8'); return count(s, VCAA_MARK) === 1 && count(plain(s), VCAA_TEXT) === 1; });
check(one.length === vce.length, `${one.length}/${vce.length} VCE pages carry the acknowledgement exactly once, word for word`);
const hscHit = hsc.filter(f => /VCAA/.test(fs.readFileSync(f, 'utf8')));
check(hscHit.length === 0, `${hscHit.length} of ${hsc.length} HSC pages mention the VCAA`);
check(!sitemapBefore || sha('sitemap.xml') === sitemapBefore, 'sitemap.xml unchanged');
console.log(`\nWRITTEN · ${todo.length} pages${todo.length ? ` · backups in ${BAK}/` : ''}`);
process.exit(fail ? 1 : 0);
