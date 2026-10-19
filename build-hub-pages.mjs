#!/usr/bin/env node
/* build-hub-pages.mjs — THE SUBJECT HUB GENERATOR (KW:HUBS, Muppet 19 Oct 2026).
   Why: Search Console 19 Oct — 179 indexed, ranking dead. The ~185 concept pages were near-orphans: each
   linked only to the nav pages and one sibling, and /hsc, /vce, /hsc/<subject> 301'd to a trailing-slash URL
   that 404'd. These hubs give every concept page a parent, and every parent a link from every child.

   INPUT   the concept pages already on disk (hsc/**, vce/**) — their JSON-LD alignment is the authority for
           subject, topic and cross-cert cells. Nothing from the app repo, so this can never drift from the pages.
   OUTPUT  hsc/index.html · hsc/<subject>/index.html · hsc/year-11/index.html · hsc/year-11/<subject>/index.html
           (same for vce/) · the hub rows in sitemap.xml (concept rows untouched).
   A cross-cert concept (one URL, e.g. /hsc/biology/meiosis… also aligned to VCE Biology) is listed on BOTH
   subject hubs, linking to its one canonical URL.

   Dry-run by default; --apply writes. Backups of any hub it overwrites go to _patches/hubs/bak-<stamp>/.
   Receipts read back from disk. Idempotent: a second --apply changes nothing.
   Re-run after build-concept-pages.mjs --apply (new concepts → new hub rows).                                 */
import fs from 'node:fs';
import path from 'node:path';
import { VCAA_LINE, VCAA_MARK } from './vcaa-ack.mjs';

const APPLY = process.argv.includes('--apply');
const SITE = 'https://knowhere.me';
const MARK = 'KNOWHERE:HUB-PAGE v1';
const Y11 = 'year-11';
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const today = new Date().toISOString().slice(0, 10);
const die = m => { console.error('✗ ' + m); process.exit(1); };
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unesc = s => String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const CERT = {
  hsc: { name: 'HSC', state: 'NSW', body: 'the NESA syllabus', other: 'vce' },
  vce: { name: 'VCE', state: 'Victoria', body: 'the VCAA study design', other: 'hsc' },
};

/* ── 1. read every concept page on disk ── */
const pages = [];
for (const cert of Object.keys(CERT)) {
  if (!fs.existsSync(cert)) continue;
  for (const d of fs.readdirSync(cert).sort()) {
    const dir = path.join(cert, d);
    if (!fs.statSync(dir).isDirectory()) continue;
    const subs = d === Y11 ? fs.readdirSync(dir).filter(s => fs.statSync(path.join(dir, s)).isDirectory()).map(s => [path.join(dir, s), s, true]) : [[dir, d, false]];
    for (const [sd, subj, y11] of subs)
      for (const f of fs.readdirSync(sd).sort()) {
        if (!f.endsWith('.html') || f === 'index.html' || f.includes('.bak')) continue;
        pages.push({ file: path.join(sd, f), cert, subj, y11, slug: f.slice(0, -5) });
      }
  }
}
if (pages.length < 100) die(`only ${pages.length} concept pages found — run from the knowhere-website repo root`);

const hubPath = (cert, y11, subj) => `/${cert}/${y11 ? Y11 + '/' : ''}${subj ? subj + '/' : ''}`;
const fwSubject = fw => fw.replace(/^(NSW\s+)?(Stage 6\s+)?((HSC|VCE)\s+)?/, '').replace(/\s+Units?\s.*$/, '').replace(/\s+Year 1[12]$/, '').trim();
const fwY11 = fw => /Units? 1\s*(&|and)\s*2|Year 11/i.test(fw);
const fwCert = fw => (/\bHSC\b/.test(fw) ? 'hsc' : /\bVCE\b/.test(fw) ? 'vce' : null);

/* the hub names a subject the way a searcher types it; the concept pages keep their own short labels */
const NAME_OVERRIDE = { 'vce/health-hd': 'Health and Human Development' };
const cleanTopic = t => String(t || '').replace(/^(HSC|VCE) topic:\s*/i, '').trim() || 'more';
for (const p of pages) {
  const html = fs.readFileSync(p.file, 'utf8');
  p.url = SITE + hubPath(p.cert, p.y11, p.subj) + p.slug;
  const ldm = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  if (!ldm) die(`${p.file}: no JSON-LD`);
  const ld = JSON.parse(ldm[1]);
  const res = (ld['@graph'] || []).find(n => n['@type'] === 'LearningResource');
  if (!res) die(`${p.file}: no LearningResource in JSON-LD`);
  p.title = String(res.name || '').replace(/\s+—\s+live knowscape$/, '').trim();
  p.align = (res.educationalAlignment || []).map(a => ({ fw: String(a.educationalFramework || ''), topic: String(a.targetName || '').trim() }));
  if (!p.title || !p.align.length) die(`${p.file}: missing title or alignment`);
  p.subjectName = NAME_OVERRIDE[`${p.cert}/${p.subj}`] || fwSubject(p.align[0].fw);
  p.topic = cleanTopic(p.align[0].topic);
  const big = (html.match(/<p class="big">(.*?)<small>/s) || [])[1] || '';
  const txt = unesc(big.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
  const first = (txt.match(/^.*?[.!?](\s|$)/) || [txt])[0].trim();
  p.line = first.length > 150 ? first.slice(0, 147).replace(/\s+\S*$/, '') + '…' : first;
  p.accent = ((html.match(/--subj:(#[0-9A-Fa-f]{6})/g) || []).pop() || '--subj:#5AADD4').slice(7);
}

/* ── 2. hubs: one per (cert, year-11?, subject) that has a concept page living in it ── */
const hubs = new Map();
const hubFor = (cert, y11, subj) => {
  const k = hubPath(cert, y11, subj);
  if (!hubs.has(k)) hubs.set(k, { path: k, cert, y11, subj, name: null, accent: null, items: [] });
  return hubs.get(k);
};
for (const p of pages) {
  const h = hubFor(p.cert, p.y11, p.subj);
  h.name = h.name || p.subjectName; h.accent = h.accent || p.accent;
  h.items.push({ p, topic: p.topic, cross: false });
}
/* framework → hub, learned from each page's own home alignment */
const fwHub = new Map();
for (const p of pages) { const k = p.align[0].fw; if (!fwHub.has(k)) fwHub.set(k, hubPath(p.cert, p.y11, p.subj)); }
const byName = new Map(); /* fallback: "vce|biology name|y11" → hub, for a framework no home page uses */
for (const h of hubs.values()) byName.set(`${h.cert}|${h.name.toLowerCase()}|${h.y11}`, h.path);
let crossRows = 0;
for (const p of pages) {
  const home = hubPath(p.cert, p.y11, p.subj);
  const seen = new Set([home]);
  for (const a of p.align.slice(1)) {
    const c = fwCert(a.fw);
    const k = fwHub.get(a.fw) || (c && byName.get(`${c}|${fwSubject(a.fw).toLowerCase()}|${fwY11(a.fw)}`));
    if (!k || seen.has(k)) continue;
    seen.add(k);
    hubs.get(k).items.push({ p, topic: cleanTopic(a.topic), cross: true });
    crossRows++;
  }
}

/* ── 3. the shell: lifted from a live concept page so a hub is visually the same site ── */
const REF = pages.find(p => p.file.endsWith(path.join('biology', 'meiosis-and-genetic-variation.html'))) || pages[0];
const ref = fs.readFileSync(REF.file, 'utf8');
const grab = (re, what) => { const m = ref.match(re); if (!m) die(`shell: ${what} not found in ${REF.file}`); return m[0]; };
const STYLE = grab(/<style>.*?<\/style>/s, 'style');
const NAV = grab(/<nav>.*?<\/nav>/s, 'nav');
const UMAMI = grab(/<script defer src="https:\/\/cloud\.umami\.is\/script\.js"[^>]*><\/script>/, 'umami');
const PIXEL = grab(/<script defer src="\/knowhere-pixel\.js[^"]*"><\/script>/, 'pixel');
const FBV = grab(/<meta name="facebook-domain-verification"[^>]*>/, 'fb verification');
const FONTS = grab(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*<link href="https:\/\/fonts\.googleapis\.com[^>]*>/s, 'fonts');
const MARKS = grab(/<script src="\/knowhere-marks\.js[^"]*"><\/script>/, 'marks');
const FOOTJS = grab(/<script src="\/knowhere-footer\.js[^"]*"><\/script>/, 'footer js');
const MOBJS = grab(/<script src="\/knowhere-mobile-menu\.js[^"]*"( defer)?><\/script>/, 'mobile menu js');
const HUB_CSS = `<style>
/* KW:HUBS — the only CSS a hub adds to the concept-page sheet */
.kw-c .eyebrow .lhs a{color:inherit;border-bottom:1px solid color-mix(in srgb,currentColor 40%,transparent)}
.kw-c .eyebrow .lhs a:hover{border-bottom-color:currentColor}
.kw-c .rest a i{font-style:normal}
.kw-c .rest a .tx{display:block;flex:1;min-width:0}
.kw-c .rest a .tt{display:block;color:var(--ink)}
.kw-c .rest a .ln{display:block;font-size:13.5px;line-height:1.5;color:var(--ink-dim);margin-top:3px}
.kw-c .rest a .lk{padding:0;border:0;display:inline-block}
.kw-c .edge .n .c{color:var(--ink-dim);font-weight:500}
.kw-c .edge{border-top:3px solid var(--hub,var(--subj))}
.kw-c .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
.kw-c .chips a{font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-dim);border:1px solid var(--line);border-radius:99px;padding:8px 13px;transition:all .16s}
.kw-c .chips a:hover{color:var(--ink);border-color:var(--ink-dim)}
@media (max-width:560px){.kw-c .rest a{flex-wrap:wrap;gap:6px 12px}.kw-c .rest a .lk{margin-left:0}}
</style>`;

const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const lc = s => String(s).toLowerCase();
const certLabel = h => `${CERT[h.cert].name}${h.y11 ? ' Year 11' : ''}`;
function page({ h, title, desc, h1, lhs, rhsCount, big, small, body, crumbs, ld }) {
  const url = SITE + h.path;
  return `<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base href="/">
<!-- ${MARK} · generated by build-hub-pages.mjs from the concept pages on disk · DO NOT HAND-EDIT: re-run the generator. -->
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta name="theme-color" content="#070708">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="knowhere">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="knowhere — Year 11 and 12 study built for your brain">
<meta property="og:locale" content="en_AU">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}/og-image.png">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
${UMAMI}
${PIXEL}
${FBV}
${FONTS}
${MARKS}
${STYLE}
${HUB_CSS}
</head>
<body>
<div class="kw-c"${h.accent ? ` style="--subj:${h.accent}"` : ''}>

  ${NAV}

  <header class="hero wrap">
    <div class="eyebrow mono">
      <span class="lhs">${lhs}</span>
      <span class="rhs"><span class="live-dot"></span>${rhsCount} live</span>
    </div>
    <h1>${esc(h1)}</h1>
    <p class="big">${esc(big)}
      <small>${esc(small)}</small></p>
  </header>
${body}
  <section class="cta">
    <div class="cta-box">
      <div class="mono" style="margin-bottom:12px">inside the app</div>
      <h2>they don't read it. <span class="g">they run it.</span></h2>
      <p class="lead">Inside knowhere, concepts are built like these — mapped to your curriculum, never capped by it. Free for a week. No lock-in, cancel inside the week and pay nothing.</p>
      <div class="doors">
        <a class="door pri" data-kw-cta href="https://app.knowhere.me/signup?as=student">start your free week →</a>
        <a class="door sec" href="/for-parents?as=parent">parent? start their free week →</a>
      </div>
    </div>
    <div class="crumbs">${crumbs}</div>
  </section>

  <knowhere-footer-nav></knowhere-footer-nav>
${h.cert === 'vce' ? '  ' + VCAA_LINE + '\n' : ''}
</div>
${FOOTJS}
${MOBJS}
<script>
(function inj(){ if(!window.KnowhereMarks){ return setTimeout(inj,60); } document.querySelectorAll('[data-kw-logo]').forEach(function(el){ el.innerHTML=window.KnowhereMarks.logoSvg(parseInt(el.getAttribute('data-kw-logo')||'24',10)); }); })();
</script>
</body>
</html>
`;
}
const crumbLink = (href, t) => `<a href="${href}">${esc(lc(t))}</a><span>›</span>`;
const crumbHere = t => `<span style="color:var(--ink)">${esc(lc(t))}</span>`;
const breadcrumbLD = trail => ({ '@type': 'BreadcrumbList', itemListElement: trail.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + p })) });
const site = { '@type': 'WebSite', '@id': SITE + '/#site', name: 'knowhere', url: SITE };

/* ── 4a. subject hubs ── */
const out = new Map();
const subjectHubs = [...hubs.values()].sort((a, b) => a.path.localeCompare(b.path));
for (const h of subjectHubs) {
  const C = CERT[h.cert];
  const items = h.items.slice().sort((a, b) => lc(a.p.title).localeCompare(lc(b.p.title)));
  const topics = [...new Set(items.map(i => i.topic))].sort((a, b) => lc(a).localeCompare(lc(b)));
  const n = items.length;
  const label = `${certLabel(h)} ${h.name}`;
  const titles = items.filter(i => !i.cross).map(i => lc(i.p.title));
  let desc = '';
  for (let k = Math.min(3, titles.length); k >= 0; k--) {
    desc = `${plural(n, `${label} concept`)} as ${n === 1 ? 'a live knowscape' : 'live knowscapes'} you can drag${k ? ' — ' + titles.slice(0, k).join(', ') + (n > k ? ' and more' : '') : ''}. Free, no account. Mapped to ${C.body}.`;
    if (desc.length <= 160) break;
  }
  const rows = t => items.filter(i => i.topic === t).map(i => {
    const lk = i.cross ? `drag it · ${CERT[i.p.cert].name.toLowerCase()} page →` : 'drag it →';
    return `        <a href="${hubPath(i.p.cert, i.p.y11, i.p.subj)}${i.p.slug}"><i class="tx"><i class="tt">${esc(i.p.title)}</i>${i.p.line ? `<i class="ln">${esc(i.p.line)}</i>` : ''}</i><span class="lk">${lk}</span></a>`;
  }).join('\n');
  const sections = topics.map(t => `
  <section class="section">
    <div class="mono">${esc(t)}</div>
    <div class="rest">
${rows(t)}
    </div>
  </section>`).join('');
  const siblings = subjectHubs.filter(s => s.cert === h.cert && s.y11 === h.y11 && s !== h);
  const more = siblings.length ? `
  <section class="section">
    <div class="mono">more ${esc(certLabel(h))}</div>
    <div class="chips">${siblings.map(s => `<a href="${s.path}">${esc(lc(s.name))}</a>`).join('')}<a href="/${h.cert}/">all ${esc(C.name.toLowerCase())} →</a></div>
  </section>` : '';
  const trail = [['knowhere', '/'], [C.name, `/${h.cert}/`], ...(h.y11 ? [[`${C.name} Year 11`, hubPath(h.cert, true)]] : []), [label, h.path]];
  out.set(h.path, page({
    h,
    title: `${label} concepts, live — knowhere`,
    desc,
    h1: `${label}, live.`,
    lhs: `<a href="/${h.cert}/">${C.name}</a> · ${h.y11 ? `<a href="${hubPath(h.cert, true)}">Year 11</a> · ` : ''}${esc(h.name)} <b>· ${C.state}</b>`,
    rhsCount: n,
    big: `${plural(n, `${h.name} concept`)} you can drag right now, grouped by topic. No account, no login.`,
    small: `Each one is the real knowscape from knowhere, not a picture of one. Mapped to ${C.body}.`,
    body: sections + more,
    crumbs: crumbLink('/', 'knowhere') + crumbLink(`/${h.cert}/`, C.name) + (h.y11 ? crumbLink(hubPath(h.cert, true), 'Year 11') : '') + crumbHere(h.name),
    ld: { '@context': 'https://schema.org', '@graph': [
      { '@type': 'CollectionPage', '@id': SITE + h.path + '#page', name: `${label} concepts, live`, url: SITE + h.path, description: desc, inLanguage: 'en-AU', isPartOf: site,
        about: { '@type': 'Thing', name: `${label}` },
        mainEntity: { '@type': 'ItemList', numberOfItems: n, itemListElement: items.map((i, k) => ({ '@type': 'ListItem', position: k + 1, name: i.p.title, url: i.p.url })) } },
      breadcrumbLD(trail),
    ] },
  }));
}

/* ── 4b. cert hubs (/hsc/, /vce/) and their Year 11 hubs ── */
function levelHub(cert, y11) {
  const C = CERT[cert];
  const subs = subjectHubs.filter(s => s.cert === cert && s.y11 === y11).sort((a, b) => lc(a.name).localeCompare(lc(b.name)));
  if (!subs.length) return;
  const h = { path: hubPath(cert, y11), cert, y11, accent: null };
  const homeCount = subs.reduce((t, s) => t + s.items.filter(i => !i.cross).length, 0);
  const y11Subs = !y11 ? subjectHubs.filter(s => s.cert === cert && s.y11) : [];
  const card = s => {
    const ts = [...new Set(s.items.map(i => i.topic))];
    return `      <a class="edge" href="${s.path}" style="--hub:${s.accent || 'var(--subj)'}"><span class="k">${plural(s.items.length, 'concept')} live</span><span class="n">${esc(lc(s.name))}</span><span class="why">${esc(ts.slice(0, 3).join(' · '))}${ts.length > 3 ? ` <b>+${ts.length - 3} more</b>` : ''}</span></a>`;
  };
  const top4 = subs.slice().sort((a, b) => b.items.length - a.items.length).slice(0, 4).map(s => s.name);
  const label = `${C.name}${y11 ? ' Year 11' : ''}`;
  let body = `
  <section class="section">
    <div class="mono">by subject</div>
    <h2>pick one<span class="s">.</span></h2>
    <div class="under">
${subs.map(card).join('\n')}
    </div>
  </section>`;
  if (y11Subs.length) body += `
  <section class="section">
    <div class="mono">year 11</div>
    <h2>starting earlier<span class="s">.</span></h2>
    <div class="under">
${y11Subs.map(card).join('\n')}
    </div>
  </section>`;
  const other = CERT[C.other];
  body += `
  <section class="section">
    <div class="rest">
        ${y11 ? `<a href="/${cert}/"><i class="tx">${esc(C.name)} Year 12 concepts</i><span class="lk">${esc(C.name.toLowerCase())} →</span></a>` : ''}
        <a href="/${C.other}/"><i class="tx">Doing the ${esc(other.name)} instead?</i><span class="lk">${esc(other.name.toLowerCase())} →</span></a>
    </div>
  </section>`;
  const allY12 = subs.reduce((t, s) => t + s.items.length, 0);
  const desc = `${homeCount} ${label} concepts across ${plural(subs.length, 'subject')}, built as live knowscapes you can drag — free, no account. ${top4.slice(0, 3).join(', ')} and more, mapped to ${C.body}.`.slice(0, 200);
  const trail = [['knowhere', '/'], [C.name, `/${cert}/`], ...(y11 ? [[label, h.path]] : [])];
  out.set(h.path, page({
    h,
    title: `${label} concepts, live — by subject — knowhere`,
    desc: desc.length > 160 ? `${homeCount} ${label} concepts across ${plural(subs.length, 'subject')}, built as live knowscapes you can drag — free, no account. Mapped to ${C.body}.` : desc,
    h1: `${label}, live.`,
    lhs: `${y11 ? `<a href="/${cert}/">${C.name}</a> · Year 11` : C.name} <b>· ${C.state}</b>`,
    rhsCount: homeCount,
    big: `${plural(homeCount, 'concept')} you can drag right now, across ${plural(subs.length, 'subject')}. No account, no login — pick a subject.`,
    small: `Each one is the real knowscape from knowhere, not a picture of one.`,
    body,
    crumbs: crumbLink('/', 'knowhere') + (y11 ? crumbLink(`/${cert}/`, C.name) + crumbHere('Year 11') : crumbHere(C.name)),
    ld: { '@context': 'https://schema.org', '@graph': [
      { '@type': 'CollectionPage', '@id': SITE + h.path + '#page', name: `${label} concepts, live`, url: SITE + h.path, description: desc, inLanguage: 'en-AU', isPartOf: site,
        hasPart: subs.map(s => ({ '@type': 'CollectionPage', name: `${certLabel(s)} ${s.name}`, url: SITE + s.path })) },
      breadcrumbLD(trail),
    ] },
  }));
  void allY12;
}
for (const c of Object.keys(CERT)) { levelHub(c, false); levelHub(c, true); }

/* ── 5. report ── */
const fileOf = p => path.join(...p.split('/').filter(Boolean), 'index.html');
const plan = [...out.entries()].map(([p, html]) => {
  const f = fileOf(p);
  const old = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
  if (old != null && !old.includes(MARK)) die(`${f} exists and is not a generated hub — refusing to overwrite`);
  return { p, f, html, state: old == null ? 'new' : old === html ? 'same' : 'changed' };
});
console.log(`concept pages read: ${pages.length} · hubs: ${plan.length} · cross-cert rows: ${crossRows}`);
for (const x of plan) console.log(`  ${x.state.padEnd(7)} ${x.p.padEnd(44)} ${String(x.html.length).padStart(6)}B`);

/* sitemap: hub rows are rebuilt; every other row is kept exactly */
const smOld = fs.readFileSync('sitemap.xml', 'utf8');
const hubRow = p => `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod><priority>${p.split('/').length <= 3 ? '0.8' : '0.7'}</priority></url>`;
const isHubRow = l => /<loc>https:\/\/knowhere\.me\/(hsc|vce)\/([^<]*\/)?<\/loc>/.test(l);
const oldHubRows = new Map(smOld.split('\n').filter(isHubRow).map(l => [l.match(/<loc>([^<]*)<\/loc>/)[1], l]));
const keep = smOld.split('\n').filter(l => l.includes('<url>') && !isHubRow(l));
const hubRows = plan.map(x => x.p).sort().map(p => (x => (x.state === 'same' && oldHubRows.has(SITE + p)) ? oldHubRows.get(SITE + p) : hubRow(p))(plan.find(y => y.p === p)));
const firstConcept = keep.findIndex(l => /\/(hsc|vce)\//.test(l));
const rowsNew = firstConcept < 0 ? [...keep, ...hubRows] : [...keep.slice(0, firstConcept), ...hubRows, ...keep.slice(firstConcept)];
const smNew = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + rowsNew.join('\n') + '\n</urlset>\n';
console.log(`sitemap: ${keep.length} kept + ${hubRows.length} hub rows = ${rowsNew.length} urls${smNew === smOld ? ' (unchanged)' : ''}`);

if (!APPLY) { console.log('\nDRY RUN — nothing written. Re-run with --apply.'); process.exit(0); }

/* ── 6. write, with backups of anything overwritten, then receipts from disk ── */
const bak = path.join('_patches', 'hubs', `bak-${stamp}`);
let backed = 0;
for (const x of plan) {
  if (x.state === 'same') continue;
  if (x.state === 'changed') { const b = path.join(bak, x.f); fs.mkdirSync(path.dirname(b), { recursive: true }); fs.copyFileSync(x.f, b); backed++; }
  fs.mkdirSync(path.dirname(x.f), { recursive: true });
  fs.writeFileSync(x.f, x.html);
}
if (smNew !== smOld) { fs.mkdirSync(bak, { recursive: true }); fs.copyFileSync('sitemap.xml', path.join(bak, 'sitemap.xml')); backed++; fs.writeFileSync('sitemap.xml', smNew); }
let bad = 0;
const check = (ok, what) => { if (!ok) { bad++; console.log('  ✗ ' + what); } };
for (const x of plan) {
  const d = fs.readFileSync(x.f, 'utf8');
  check(d === x.html, `${x.f} reads back as written`);
  check(d.includes(`<link rel="canonical" href="${SITE}${x.p}">`), `${x.f} canonical`);
  try { JSON.parse(d.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]); } catch { check(false, `${x.f} JSON-LD parses`); }
  check((x.p.startsWith('/vce/')) === d.includes(VCAA_MARK), `${x.f} VCAA line on VCE hubs only`);
}
const sm = fs.readFileSync('sitemap.xml', 'utf8');
check(plan.every(x => sm.includes(`<loc>${SITE}${x.p}</loc>`)), 'every hub is in the sitemap');
check(pages.every(p => sm.includes(`<loc>${p.url}</loc>`)), 'every concept page is still in the sitemap');
if (bad) { console.log(`\n${bad} receipt(s) failed — backups in ${bak}`); process.exit(2); }
console.log(`\nWRITTEN · ${plan.filter(x => x.state !== 'same').length} hubs · sitemap${smNew !== smOld ? ' updated' : ' unchanged'}${backed ? ` · backups in ${bak}` : ''} · receipts OK`);
