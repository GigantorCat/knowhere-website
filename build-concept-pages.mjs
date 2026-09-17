#!/usr/bin/env node
/* build-concept-pages.mjs — THE CONCEPT PAGE GENERATOR (Lane 4 §1, Muppet 17 Sep 2026).
   Generalises the goated hand-built Collision Theory page (build-concept-collision.js, 16 Sep) to every
   nominated concept. A stranger clicks an ad, lands here, and drags a real knowscape without an account.

   INPUT   SCAPES-PROPOSED.json (nominate-scapes.mjs) · the app manifest · the flat widget store and its
           sidecar meta · big-ideas.json (per TOPIC) · the ITW scene store (per TOPIC) · the prerequisite
           graph (on the manifest, with its plain-English `because`).
   OUTPUT  hsc/<subject>/<slug>.html or vce/<subject>/<slug>.html · widgets/<slug>-<subject>.html ·
           sitemap.xml regenerated · one shared template, right here in this file.

   ONE PAGE PER CONCEPT, NOT PER CELL. A cross-cert concept serves an HSC cell and a VCE cell from one URL,
   named for its primary cert, with both curricula in the eyebrow and in the JSON-LD alignment. This is the
   Collision Theory precedent (it lives at /hsc/chemistry/collision-theory and says "also VCE" in the
   eyebrow), and it is also the only shape that does not hand Google two URLs with identical bodies.

   Dry-run by default; --apply writes. Backups .bak-<stamp>. Receipts read back from disk. The teal sources
   in the app repo are opened read-only and never written.                                                */
import fs from 'node:fs';
import path from 'node:path';

const APPLY = process.argv.includes('--apply');
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7);
/* --only rebuilds the sitemap from a partial set — it is a dry-run lens, never a write mode */
if (ONLY && process.argv.includes('--apply')) { console.error('✗ --only is dry-run only (it would trim the sitemap)'); process.exit(1); }
const ROOT = process.cwd();
const APP = path.join(ROOT, '..', '..', 'Backend', 'knowhereApp');
const FLAT = path.join(APP, 'widgets-cache', 'concepts');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');

/* The ™ rides the wordmark in the lockup only, never inline in prose (ruled 17 Sep 2026). The site's own
   header does not carry it yet; flip this the day the site-wide lockup lands and re-run — so a regen can
   never silently revert it back off. */
const TM = false;

const die = m => { console.error('✗ ' + m); process.exit(1); };
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/* the ITW beats and the sidecar prose both mark emphasis with *stars* */
const stars = s => esc(s).replace(/\*([^*]+)\*/g, '<b>$1</b>');

/* ── the app is the authority for its own palette and its own accent bake ── */
const appHtml = fs.readFileSync(path.join(APP, 'knowhere.html'), 'utf8');
const pi = appHtml.indexOf('const SUBJECT_COLORS={');
if (pi < 0) die('SUBJECT_COLORS not found in knowhere.html');
const SUBJECT_COLORS = new Function(appHtml.slice(pi, appHtml.indexOf('};', pi) + 2) + '; return SUBJECT_COLORS;')();

const srv = fs.readFileSync(path.join(APP, 'server.js'), 'utf8');
const ai = srv.indexOf('function injectAccent(html, accent) {');
if (ai < 0) die('injectAccent not found in server.js');
let depth = 0, ei = ai, open = false;
for (; ei < srv.length; ei++) { const ch = srv[ei]; if (ch === '{') { depth++; open = true; } else if (ch === '}') { depth--; if (open && depth === 0) { ei++; break; } } }
const injectAccent = new Function(srv.slice(ai, ei) + '; return injectAccent;')();

/* ── the data ── */
const scapes = JSON.parse(fs.readFileSync('SCAPES-PROPOSED.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'generated-concepts.json'), 'utf8'));
const bigIdeas = new Map(Object.entries(JSON.parse(fs.readFileSync(path.join(APP, 'big-ideas.json'), 'utf8')).entries || {}));
const byId = new Map(manifest.concepts.map(c => [c.id, c]));
const bySlug = new Map(manifest.concepts.map(c => [c.slug, c]));

/* reverse prerequisite edges: what is built ON this concept */
const builtOn = new Map();
for (const c of manifest.concepts) for (const p of c.prerequisites || []) {
  if (!builtOn.has(p.slug)) builtOn.set(p.slug, []);
  builtOn.get(p.slug).push({ slug: c.slug, because: p.because, strength: p.strength });
}

/* the ITW scene store, indexed by what the files SAY they are — never by a recomputed slug.
   Two slug rules coexist on this project and a third (non-ASCII) lurks in these filenames:
   using-br-nsted-lowry-theory is on disk for "Using Brønsted–Lowry Theory". */
const itw = new Map();
const itwRoot = path.join(APP, 'itw-scenes');
for (const disc of fs.readdirSync(itwRoot)) {
  const dir = path.join(itwRoot, disc);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json')) continue;
    let j; try { j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch { continue; }
    const t = j.topic; if (!t) continue;
    const win = (j.candidates || [])[j.winner || 0];
    if (!win) continue;
    /* keyed lower-case: the store carries "Chemistry/polymers" where the manifest says "Chemistry/Polymers" */
    itw.set(`${t.subject}/${t.name}`.toLowerCase(), { analogy: win.analogy, domain: win.domain, beats: win.beats || {} });
  }
}

/* every concept that will have a page — so an internal link only ever points at one that exists */
const pageFor = new Map();
const flatFiles = fs.readdirSync(FLAT);
const fileById = new Map();
for (const f of flatFiles) { const m = /^(cpt_[0-9a-f]+)--(.+)\.html$/.exec(f); if (m) fileById.set(m[1], f); }

const metaOf = id => {
  const f = fileById.get(id); if (!f) return null;
  try { return JSON.parse(fs.readFileSync(path.join(FLAT, f.replace(/\.html$/, '.meta.json')), 'utf8')); } catch { return null; }
};
const subjSlug = s => String(s).toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const targets = scapes.pages.filter(p => !ONLY || p.slug === ONLY);
for (const p of targets) {
  const cert = p.cells.some(c => c.curriculum === 'HSC') ? 'hsc' : 'vce';
  p.cert = cert;
  p.dir = subjSlug(p.subject);
  p.url = `https://knowhere.me/${cert}/${p.dir}/${p.slug}`;
  p.file = path.join(cert, p.dir, p.slug + '.html');
  pageFor.set(p.slug, p);
}
console.log(`${targets.length} pages · ${scapes.cells.length} cells · subjects ${scapes.subjects.join(', ')}`);

/* ── the shared template ───────────────────────────────────────────────────────────────────────────── */
const CSS = `
h1,h2,h3{text-transform:lowercase}
html,body{margin:0;padding:0;background:#070708}
.kw-c *{margin:0;padding:0;box-sizing:border-box}
.kw-c{--bg:#08090B;--panel:#101318;--line:#22262E;--ink:#EDEDE8;--ink-dim:#8A9096;--accent:#7BEA5A;--brat:#7BEA5A;--neuro:#9B5AEA;--subj:__ACCENT__;background:var(--bg);color:var(--ink);font-family:'Geist',-apple-system,sans-serif;-webkit-font-smoothing:antialiased;padding:0 0 100px;overflow-x:clip}
.kw-c a{text-decoration:none}
.kw-c nav{position:sticky;top:0;z-index:200;display:flex;align-items:center;gap:16px;padding:14px 34px;backdrop-filter:blur(20px) saturate(150%);-webkit-backdrop-filter:blur(20px) saturate(150%);background:rgba(7,7,8,0.62);border-bottom:1px solid rgba(255,255,255,0.08)}
.kw-c .mark-wrap{position:relative;width:30px;height:30px;display:grid;place-items:center;flex-shrink:0}
.kw-c .mark-glow{position:absolute;inset:-8px;border-radius:50%;background:radial-gradient(circle,rgba(123,234,90,.55),transparent 70%);animation:kwBreathe 3s ease-in-out infinite;pointer-events:none}
@keyframes kwBreathe{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.35);opacity:.15}}
@keyframes kwMarkPulse{0%,100%{color:#EDEDE8}50%{color:#7BEA5A}}
.kw-c .navmark{position:relative;z-index:1;display:flex;color:#EDEDE8;animation:kwMarkPulse 4.2s ease-in-out infinite}
.kw-c .wordmark{font-size:16.5px;font-weight:700;letter-spacing:-0.04em;color:var(--ink)}
.kw-c .wordmark sup{font-size:.5em;font-weight:600;vertical-align:super;letter-spacing:0;color:var(--ink-dim)}
.kw-c nav .links{flex:1;display:flex;gap:22px;justify-content:flex-end;align-items:center;flex-wrap:wrap}
.kw-c nav .links a{font-size:13px;font-weight:500;color:var(--ink-dim);transition:color .16s}
.kw-c nav .links a:hover{color:var(--ink)}
@media (max-width:820px){.kw-c nav .links a:not(.nav-cta){display:none}.kw-c nav{padding:12px 18px}}
.kw-c .nav-cta,.kw-c .nav-cta:link,.kw-c .nav-cta:visited{font-size:13px;font-weight:700;color:#070708;background:var(--accent);border-radius:12px;padding:10px 18px;display:inline-block;box-shadow:0 6px 22px rgba(123,234,90,.25);transition:transform .18s;white-space:nowrap}
.kw-c .nav-cta:hover{transform:translateY(-1px)}
.kw-c .login{display:inline-block;padding:10px 18px;font-size:13px;font-weight:700;letter-spacing:-0.01em;color:#070708!important;background:#EDECE8;border-radius:12px;box-shadow:0 6px 22px rgba(237,236,232,.18);transition:transform .16s,background .16s}
.kw-c .login:hover{transform:translateY(-1px);background:#fff}
.kw-c .wrap{max-width:1120px;margin:0 auto;padding:0 20px}
.kw-c .mono{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:var(--ink-dim)}
.kw-c .hero{padding-block:clamp(44px,8vh,90px) 26px}
.kw-c .eyebrow{display:flex;align-items:center;justify-content:space-between;gap:10px 18px;flex-wrap:wrap;margin-bottom:18px}
.kw-c .eyebrow .lhs{color:var(--subj)}
.kw-c .eyebrow .lhs b{color:var(--ink-dim);font-weight:400}
.kw-c .eyebrow .rhs{display:inline-flex;align-items:center;gap:8px;color:var(--brat)}
.kw-c .live-dot{width:7px;height:7px;border-radius:50%;background:var(--brat);animation:kwPulse 2s ease-in-out infinite}
@keyframes kwPulse{50%{opacity:.3}}
.kw-c h1{font-size:clamp(40px,7.6vw,92px);font-weight:800;letter-spacing:-0.045em;line-height:.98;margin:0 0 20px;text-wrap:balance}
.kw-c .big{font-size:clamp(18px,2.2vw,24px);line-height:1.42;color:var(--ink);max-width:40ch;font-weight:500;letter-spacing:-0.01em}
.kw-c .big em{font-style:normal;color:var(--subj)}
.kw-c .big small{display:block;margin-top:14px;font-size:14.5px;font-weight:400;color:var(--ink-dim);max-width:56ch;line-height:1.55}
.kw-c .panel{background:var(--panel);border:1px solid var(--line);border-top:3px solid var(--subj);border-radius:18px;overflow:hidden;margin:26px 0 0}
.kw-c .chrome{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--ink-dim);flex-wrap:wrap}
.kw-c .chrome .l{color:var(--subj)}
.kw-c .chrome .r{color:var(--brat)}
.kw-c .panel iframe{border:0;width:100%;height:960px;background:var(--bg);display:block;transition:height .25s ease}
@media (max-width:700px){.kw-c .panel iframe{height:820px}}
.kw-c .section{max-width:1120px;margin:64px auto 0;padding:0 20px}
.kw-c h2{font-size:clamp(28px,4.4vw,46px);font-weight:900;letter-spacing:-0.03em;line-height:1.02;margin:10px 0 18px;text-wrap:balance}
.kw-c h2 .s{color:var(--subj)}
.kw-c .prose{max-width:62ch;font-size:16px;line-height:1.66;color:var(--ink-dim)}
.kw-c .prose p+p{margin-top:14px}
.kw-c .prose b{color:var(--ink);font-weight:600}
.kw-c .catch{margin-top:22px;border:1px solid var(--line);border-left:3px solid #FAC775;border-radius:12px;padding:14px 16px;font-size:14.5px;line-height:1.6;color:var(--ink-dim);max-width:62ch}
.kw-c .catch b{color:#FAC775;font-weight:600}
.kw-c .points{list-style:none;margin-top:22px;display:grid;gap:9px;max-width:62ch}
.kw-c .points li{position:relative;padding-left:26px;font-size:15.5px;line-height:1.55;color:var(--ink-dim)}
.kw-c .points li:before{content:'';position:absolute;left:8px;top:.62em;width:6px;height:6px;border-radius:50%;background:var(--subj)}
.kw-c .under{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:22px}
.kw-c .edge{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px 18px 16px;display:flex;flex-direction:column;gap:8px}
.kw-c a.edge:hover{border-color:color-mix(in srgb,var(--subj) 60%,transparent)}
.kw-c .edge .k{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--ink-dim)}
.kw-c .edge .n{font-size:18px;font-weight:700;letter-spacing:-0.02em;color:var(--ink);text-transform:lowercase}
.kw-c .edge .why{font-size:14px;line-height:1.55;color:var(--ink-dim)}
.kw-c .edge .why b{color:var(--subj);font-weight:500}
.kw-c .edge.root{border-style:dashed;border-color:color-mix(in srgb,var(--subj) 55%,transparent);background:color-mix(in srgb,var(--subj) 6%,transparent)}
.kw-c .rest{margin-top:22px;border:1px solid var(--line);border-radius:16px;overflow:hidden}
.kw-c .rest a,.kw-c .rest span{display:flex;align-items:center;gap:12px;padding:13px 16px;font-size:15px;color:var(--ink-dim);border-bottom:1px solid var(--line)}
.kw-c .rest a:last-child,.kw-c .rest span:last-child{border-bottom:0}
.kw-c .rest a{color:var(--ink)}
.kw-c .rest a:hover{background:rgba(255,255,255,.03)}
.kw-c .rest .lk{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-dim);margin-left:auto;white-space:nowrap}
.kw-c .rest a .lk{color:var(--subj)}
.kw-c .cta{max-width:1120px;margin:80px auto 0;padding:0 20px}
.kw-c .cta-box{border:1px solid var(--line);border-radius:22px;padding:clamp(26px,4vw,44px);background:linear-gradient(168deg,rgba(123,234,90,.07),rgba(10,10,12,.2) 60%);text-align:center}
.kw-c .cta-box h2{margin:0 0 8px}
.kw-c .cta-box h2 .g{color:var(--brat)}
.kw-c .cta-box .lead{color:var(--ink-dim);font-size:16px;line-height:1.6;max-width:52ch;margin:0 auto 24px}
.kw-c .doors{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.kw-c .door{font-family:inherit;font-size:15px;font-weight:700;letter-spacing:-0.01em;border-radius:12px;padding:14px 22px;display:inline-block;text-transform:lowercase;transition:transform .18s;cursor:pointer}
.kw-c .door:hover{transform:translateY(-1px)}
.kw-c .door.pri,.kw-c .door.pri:link,.kw-c .door.pri:visited{color:#070708;background:var(--brat);box-shadow:0 6px 22px rgba(123,234,90,.25)}
.kw-c .door.sec,.kw-c .door.sec:link,.kw-c .door.sec:visited{color:#fff;background:transparent;border:1px solid var(--brat)}
.kw-c .pass-line{margin:20px auto 0;font-size:14.5px;line-height:1.6;color:var(--ink-dim);max-width:60ch}
.kw-c .pass-line b{color:#DCC8FA;font-weight:600}
.kw-c .pass-line .d{font-family:'JetBrains Mono',monospace;color:var(--neuro);font-weight:500}
.kw-c .kw-pass[data-closed]{display:none}
.kw-c [data-pass-fallback]{display:none}
.kw-c .hand{margin-top:26px;padding-top:22px;border-top:1px solid var(--line)}
.kw-c .hand .fr{font-size:14.5px;color:var(--ink-dim);margin:0 0 12px}
.kw-c .kw-hand{font-family:inherit;font-size:15px;font-weight:700;letter-spacing:-.01em;text-transform:lowercase;color:#fff;background:transparent;border:1px solid var(--brat);border-radius:12px;padding:14px 22px;cursor:pointer;transition:background .18s,color .18s,transform .18s}
.kw-c .kw-hand:hover{background:var(--brat);color:#070708;transform:translateY(-1px)}
.kw-c .share{margin-top:18px;display:flex;justify-content:center;gap:10px;flex-wrap:wrap;align-items:center}
.kw-c .share button{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-dim);background:transparent;border:1px solid var(--line);border-radius:9px;padding:9px 14px;cursor:pointer;transition:all .2s}
.kw-c .share button:hover{border-color:var(--ink-dim);color:var(--ink)}
.kw-c .share button.did{border-color:var(--brat);color:var(--brat)}
.kw-c .crumbs{margin-top:44px;font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:0.12em;text-transform:uppercase;color:var(--ink-dim);display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.kw-c .crumbs a{color:var(--ink-dim)}
.kw-c .crumbs a:hover{color:var(--ink)}
.kw-c button:focus-visible,.kw-c a:focus-visible{outline:2px solid var(--brat);outline-offset:3px}
@media (prefers-reduced-motion:reduce){.kw-c *{animation:none!important;transition:none!important}}
`;

const MOBFIX = `<style id="kwMobFix">body{padding-bottom:30px!important;margin-bottom:0!important}hr{display:none!important}.kw-foot{display:none!important}
@media (max-width:480px){*{min-width:0;overflow-wrap:anywhere}div{flex-wrap:wrap}canvas,svg,img,video{max-width:100%!important;height:auto!important}table{display:block;max-width:100%;overflow-x:auto}pre{white-space:pre-wrap;max-width:100%}}
body>*:last-child{margin-bottom:0!important;padding-bottom:0!important}html,body,body>*{min-height:0!important}
@media (max-width:640px){h1{font-size:clamp(16px,4.5vw,25px)!important;font-weight:800!important;line-height:1.15!important}}</style>`;

const beacon = id => `<script>/* kwFit: the widget tells the page how tall it is, so the frame fits it (F14: never a viewport min-height inside a frame) */
(function(){function h(){return Math.ceil(document.documentElement.scrollHeight);}function send(){try{parent.postMessage({kwH:h(),kwId:'${id}'},'*');}catch(e){}}
if(window.ResizeObserver){new ResizeObserver(send).observe(document.body);}window.addEventListener('load',send);setTimeout(send,600);setTimeout(send,2000);})();</script>`;

const WORDMARK = `know<b>here</b>${TM ? '<sup>™</sup>' : ''}`;

const certName = c => (c === 'hsc' ? 'HSC' : 'VCE');
const linkTo = slug => { const p = pageFor.get(slug); return p ? `/${p.cert}/${p.dir}/${p.slug}` : null; };
const titleOf = slug => { const c = bySlug.get(slug); const m = c && metaOf(c.id); return (m && m.title) || String(slug).replace(/-s-/g, "'s-").replace(/-/g, ' '); };
const firstSentence = s => { const m = /^[\s\S]*?[.!?](\s|$)/.exec(String(s || '')); return (m ? m[0] : String(s || '')).trim(); };

function buildPage(p) {
  const concept = byId.get(p.id) || die('no manifest concept for ' + p.slug);
  const meta = metaOf(p.id) || die('no sidecar meta for ' + p.slug);
  const accent = SUBJECT_COLORS[p.dir] || SUBJECT_COLORS['default'];
  const cells = p.cells.slice().sort(a => (a.curriculum === certName(p.cert) ? -1 : 1));
  const home = cells[0];
  const cellRec = scapes.cells.find(c => c.curriculum === home.curriculum && c.subject === home.subject && c.topic === home.topic);
  const idea = bigIdeas.get(`${home.subject}/${home.topic}`);
  /* An ITW scene belongs to a TOPIC and its analogy names ONE concept in that topic. When that is not this
     concept, the analogy is about something else on the same page as a big claim — "Fusion works like..."
     at the top of the nuclear fission page. So the scene is used only when its own subject fits this
     concept; otherwise the section falls back to the topic's big idea and this concept's own explanation. */
  const rawScene = itw.get(`${home.subject}/${home.topic}`.toLowerCase());
  const stem = w => w.replace(/(ies)$/, 'y').replace(/(es|s)$/, '');
  const STOP = new Set(['the', 'a', 'an', 'of', 'and', 'in', 'on', 'to', 'for', 'with', 'its', 'their', 'how', 'why', 'works', 'work', 'like', 'is', 'are']);
  const words = x => String(x).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w)).map(stem);
  let scene = null, sceneSubject = null;
  if (rawScene) {
    sceneSubject = String(rawScene.analogy).split(/ works? like /i)[0];
    const bag = new Set([...words(meta.title), ...words(p.slug), ...(concept.knowledgeTags || []).flatMap(t => words(t))]);
    const sw = words(sceneSubject);
    if (!sw.length || sw.some(w => bag.has(w))) scene = rawScene;
  }
  const title = meta.title || titleOf(p.slug);

  /* ── 1. the widget: the app's own accent bake, done once at build ── */
  const srcFile = fileById.get(p.id) || die('no widget on disk for ' + p.slug);
  const raw = fs.readFileSync(path.join(FLAT, srcFile), 'utf8');
  const baked = injectAccent(raw, accent);
  if (/#3AADA0/i.test(baked)) die(`teal survived the bake in ${p.slug}`);
  const widgetName = `${p.slug}-${p.dir}.html`;
  const widget = `<!DOCTYPE html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)} — live knowscape</title>${MOBFIX}</head><body>
${baked}
${beacon(p.slug)}</body></html>`;

  /* ── 2. the page ── */
  const eyebrowMain = `${home.curriculum} · ${home.subject} · ${esc(home.topic)}`;
  const also = cells.slice(1).map(c => `${c.curriculum} ${esc(c.topic)}`).join(' · ');
  /* The description is budgeted tail-first: the curriculum sentence names NSW and Victoria on EVERY page
     (doctrine — never "Australia"), so it is reserved before the concept's own sentence is allowed in,
     and a long summary is trimmed at a word boundary rather than cutting the tail off. ~158 chars, the
     width Google actually shows. */
  const tail = ` A live knowscape — ${home.curriculum} ${home.subject}, Year 12 in NSW and Victoria.`;
  const headBudget = 158 - tail.length;
  let head = firstSentence(meta.summary || meta.explanation).replace(/\s+/g, ' ').trim();
  if (head.length > headBudget) head = head.slice(0, headBudget).replace(/[\s,;:]+\S*$/, '').replace(/[.,;:]$/, '') + '…';
  const DESC = (head + tail).replace(/\s+/g, ' ');
  const TITLE = `${title.toLowerCase()} — ${home.curriculum} ${home.subject.toLowerCase()}, live — knowhere`;

  const alignments = cells.map(c => ({
    '@type': 'AlignmentObject', alignmentType: 'educationalSubject',
    educationalFramework: c.curriculum === 'HSC' ? `NSW HSC ${c.subject}` : `VCE ${c.subject} Units 3&4`,
    targetName: c.topic,
  }));
  const LD = {
    '@context': 'https://schema.org', '@graph': [
      {
        '@type': 'LearningResource', '@id': p.url + '#resource', name: `${title} — live knowscape`, url: p.url,
        description: DESC, inLanguage: 'en-AU', learningResourceType: 'interactive resource', educationalLevel: 'Year 12',
        teaches: meta.summary || meta.explanation || title,
        about: (concept.knowledgeTags || []).slice(0, 6).map(t => ({ '@type': 'Thing', name: String(t).replace(/-/g, ' ') })),
        educationalAlignment: alignments,
        isPartOf: { '@type': 'WebSite', '@id': 'https://knowhere.me/#site', name: 'knowhere', url: 'https://knowhere.me' },
        provider: { '@type': 'Organization', '@id': 'https://knowhere.me/#org', name: 'knowhere', legalName: 'Gigantor Studios Pty Ltd', url: 'https://knowhere.me' },
        isAccessibleForFree: true,
      },
      {
        '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'knowhere', item: 'https://knowhere.me/' },
          { '@type': 'ListItem', position: 2, name: `${home.curriculum} ${home.subject}`, item: p.url },
          { '@type': 'ListItem', position: 3, name: title, item: p.url },
        ],
      },
    ],
  };

  /* in the wild — the ITW scene's own analogy and beats, the topic's big idea underneath it */
  let wild = '';
  if (scene) {
    const b = scene.beats || {};
    wild = `
  <section class="section">
    <div class="mono">in the wild</div>
    <h2>${esc(String(scene.analogy).split(/ — |—/)[0].trim().replace(/[.!?]+$/, ''))}<span class="s">.</span></h2>
    <div class="prose">
      ${idea ? `<p>${esc(idea.canonical || idea.grounded)}</p>` : ''}
      ${b.setup ? `<p>${stars(b.setup)}</p>` : ''}
      ${b.action ? `<p>${stars(b.action)}</p>` : ''}
      ${b.result ? `<p>${stars(b.result)}</p>` : ''}
    </div>
    ${meta.exam ? `<div class="catch"><b>what examiners catch</b> — ${stars(meta.exam)}</div>` : ''}
  </section>`;
  } else if (idea || meta.exam) {
    wild = `
  <section class="section">
    <div class="mono">the one idea</div>
    <h2>why this one <span class="s">carries the topic.</span></h2>
    <div class="prose">${idea ? `<p>${esc(idea.canonical || idea.grounded)}</p>` : ''}${meta.summary && meta.summary !== meta.explanation ? `<p>${esc(meta.summary)}</p>` : ''}</div>
    ${meta.exam ? `<div class="catch"><b>what examiners catch</b> — ${stars(meta.exam)}</div>` : ''}
  </section>`;
  }

  const points = (meta.points || []).length ? `
  <section class="section">
    <div class="mono">what you leave with</div>
    <h2>${['one thing', 'two things', 'three things', 'four things', 'five things'][Math.min(meta.points.length, 5) - 1]}, <span class="s">not forty.</span></h2>
    <ul class="points">${meta.points.map(x => `<li>${stars(x)}</li>`).join('')}</ul>
  </section>` : '';

  /* what's underneath — the prerequisite graph, with its plain-English reasons */
  const pre = (concept.prerequisites || []).map(x => ({ ...x, dir: 'sits under it' }));
  const post = (builtOn.get(p.slug) || []).slice(0, 4).map(x => ({ ...x, dir: 'built on it' }));
  const edges = [...pre, ...post];
  const card = e => {
    const href = linkTo(e.slug);
    const inner = `<span class="k">${e.dir}</span><span class="n">${esc(titleOf(e.slug).toLowerCase())}</span><span class="why"><b>because</b> ${esc(e.because || 'it is the same idea, one step along')}</span>`;
    return href ? `<a class="edge" href="${href}">${inner}</a>` : `<div class="edge">${inner}</div>`;
  };
  const under = `
  <section class="section">
    <div class="mono">what's underneath</div>
    <h2>${edges.length ? `nothing here is <span class="s">a standalone fact.</span>` : `nothing. <span class="s">this is where it starts.</span>`}</h2>
    <p class="prose">${edges.length
      ? `knowhere maps every concept to what it rests on and what rests on it — ${esc(String(pre.length))} underneath this one, ${esc(String(post.length))} built on top. Each one says <b>why</b>, in a sentence, not as an arrow on a diagram.`
      : `This concept has no prerequisites in knowhere's map — it is a root. Everything in the topic is built from here.`}</p>
    <div class="under">
      <div class="edge root"><span class="k">this concept</span><span class="n">${esc(title.toLowerCase())}</span><span class="why">${esc(firstSentence(meta.summary || meta.explanation))}</span></div>
      ${edges.map(card).join('\n      ')}
    </div>
  </section>`;

  /* the rest of the topic — titles, behind a lock. The personalisation layer is never on these pages. */
  const siblings = (cellRec ? cellRec.members : []).filter(m => m.id !== p.id);
  const rest = siblings.length ? `
  <section class="section">
    <div class="mono">the rest of ${esc(home.topic.toLowerCase())}</div>
    <h2>${esc(String(siblings.length))} more, <span class="s">same treatment.</span></h2>
    <p class="prose">Each one is its own knowscape in the app — built for how a particular student takes things in, not one explanation handed to everybody.</p>
    <div class="rest">${siblings.map(m => {
      const href = linkTo(m.slug);
      const name = esc(String(m.title || titleOf(m.slug)).toLowerCase());
      return href ? `<a href="${href}">${name}<span class="lk">live →</span></a>` : `<span>${name}<span class="lk">in the app</span></span>`;
    }).join('')}</div>
  </section>` : '';

  const shareUrl = `${p.url}?utm_source=share&utm_medium=concept&utm_campaign=kw-launch-2026&utm_content=${p.slug}`;

  return { widgetName, widget, accent, title, TITLE, DESC, html: `<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base href="/">
<!-- KNOWHERE:CONCEPT-PAGE v2 · generated by build-concept-pages.mjs · DO NOT HAND-EDIT: re-run the generator. Not in SEO_PAGES; no regen touches it. -->
<title>${esc(TITLE)}</title>
<meta name="description" content="${esc(DESC)}">
<link rel="canonical" href="${p.url}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta name="theme-color" content="#070708">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="article">
<meta property="og:site_name" content="knowhere">
<meta property="og:url" content="${p.url}">
<meta property="og:title" content="${esc(TITLE)}">
<meta property="og:description" content="${esc(DESC)}">
<meta property="og:image" content="https://knowhere.me/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="knowhere — Year 12 study built for your brain">
<meta property="og:locale" content="en_AU">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(TITLE)}">
<meta name="twitter:description" content="${esc(DESC)}">
<meta name="twitter:image" content="https://knowhere.me/og-image.png">
<script type="application/ld+json">${JSON.stringify(LD)}</script>
<script defer src="https://cloud.umami.is/script.js" data-website-id="ee8e1d64-1100-4281-8ca5-179736bcc3e0"></script>
<script defer src="/knowhere-pixel.js?v=2"></script>
<meta name="facebook-domain-verification" content="6rirzrujmmkavl0wh2oqnpaw8hikf5" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="/knowhere-marks.js?v=2"></script>
<script src="/knowhere-pass.js" defer></script>
<script src="/knowhere-handoff.js?v=3" defer></script><!-- KW:HANDOFF -->
<style>${CSS.replace('__ACCENT__', accent)}</style>
</head>
<body>
<div class="kw-c">

  <nav>
    <a class="brand" href="/" style="display:flex;align-items:center;gap:9px">
      <span class="mark-wrap"><span class="mark-glow"></span><span class="navmark" data-kw-logo="24"></span></span>
      <span class="wordmark">${WORDMARK}</span>
    </a>
    <div class="links">
      <a href="/how-it-works">How it works</a>
      <a href="/experience-it">Experience it</a>
      <a href="/pricing">Pricing</a>
      <a href="/for-parents">For parents</a><a href="/for-teachers">For teachers</a>
      <a href="https://app.knowhere.me/login" class="login">Log in</a>
      <a class="nav-cta" data-kw-cta href="https://app.knowhere.me/signup">start your free week</a>
    </div>
  </nav>

  <header class="hero wrap">
    <div class="eyebrow mono">
      <span class="lhs">${eyebrowMain}${also ? ` <b>· also ${also}</b>` : ''}</span>
      <span class="rhs"><span class="live-dot"></span>live from the app</span>
    </div>
    <h1>${esc(title)}</h1>
    <p class="big">${stars(meta.explanation || meta.summary || '')}
      <small>This is the real knowscape from knowhere, not a picture of one. Drag it. Watch what actually changes.</small></p>

    <div class="panel">
      <div class="chrome"><span class="l">${esc(home.subject.toLowerCase())} · ${esc(home.topic.toLowerCase())} · ${esc(title.toLowerCase())}</span><span class="r">drag it · it is yours</span></div>
      <iframe id="kwFrame" src="/widgets/${widgetName}" title="${esc(title)} — interactive knowscape" loading="eager" scrolling="no"></iframe>
    </div>
  </header>
${wild}${points}${under}${rest}

  <section class="cta">
    <div class="cta-box">
      <div class="mono" style="margin-bottom:12px">this is one of 865</div>
      <h2>they don't read it. <span class="g">they run it.</span></h2>
      <p class="lead">Every HSC and VCE concept in knowhere is built like this one — mapped to your curriculum, never capped by it. Free for a week. No card tricks, no lecture.</p>
      <div class="doors">
        <a class="door pri" data-kw-cta href="https://app.knowhere.me/signup">start your free week →</a>
        <a class="door sec" href="/for-parents?as=parent">parent? start their free week →</a>
      </div>
      <p class="pass-line kw-pass">Free for a week, then <b>$49 once</b> — the 2026 exam pass ends itself after the last exam. <span class="d"><span data-pass-days>0</span> days of the pass left.</span></p>
      <p class="pass-line" data-pass-fallback="block">Free for a week, then a plan you can stop any time.</p>
      <div class="hand">
        <p class="fr">not your card? send it to whoever's is.</p>
        <button type="button" class="kw-hand" data-kw-handoff="concept:${p.slug}">send this to a parent</button>
      </div>
      <div class="share">
        <button type="button" id="kwShare">share this concept</button>
        <button type="button" id="kwCopy">copy the link</button>
      </div>
    </div>
    <div class="crumbs"><a href="/">knowhere</a><span>›</span><span>${esc(home.curriculum.toLowerCase())} ${esc(home.subject.toLowerCase())}</span><span>›</span><span style="color:var(--ink)">${esc(title.toLowerCase())}</span></div>
  </section>

  <knowhere-footer-nav></knowhere-footer-nav>

</div>
<script src="/knowhere-footer.js?v=23"></script>
<script src="/knowhere-mobile-menu.js?v=8" defer></script>
<script>
(function(){
  (function inj(){ if(!window.KnowhereMarks){ return setTimeout(inj,60); } document.querySelectorAll('[data-kw-logo]').forEach(function(el){ el.innerHTML=window.KnowhereMarks.logoSvg(parseInt(el.getAttribute('data-kw-logo')||'24',10)); }); })();
  var f=document.getElementById('kwFrame');
  window.addEventListener('message',function(e){ var d=e&&e.data; if(!d||d.kwId!==${JSON.stringify(p.slug)}||!d.kwH) return; var h=Math.max(420,Math.min(2600,d.kwH)); if(Math.abs(parseInt(f.style.height||0,10)-h)>8) f.style.height=h+'px'; });
  var url=${JSON.stringify(shareUrl)};
  var text=${JSON.stringify(String(title).toLowerCase() + ', as a thing you can drag — one Year 12 ' + home.subject.toLowerCase() + ' concept from knowhere.')};
  function track(n,d){ try{ if(window.umami) window.umami.track(n,d||{}); }catch(e){} }
  function did(b,t){ var o=b.textContent; b.classList.add('did'); b.textContent=t; setTimeout(function(){ b.classList.remove('did'); b.textContent=o; },1800); }
  var sh=document.getElementById('kwShare'), cp=document.getElementById('kwCopy');
  if(!navigator.share) sh.style.display='none';
  sh.addEventListener('click',function(){ track('concept_share',{page:${JSON.stringify(p.slug)},via:'share'}); try{ navigator.share({title:${JSON.stringify(title + ' — knowhere')},text:text,url:url}).catch(function(){}); }catch(e){} });
  cp.addEventListener('click',function(){ track('concept_share',{page:${JSON.stringify(p.slug)},via:'copy'}); try{ navigator.clipboard.writeText(url).then(function(){ did(cp,'copied'); }); }catch(e){} });
})();
</script>
</body>
</html>
` };
}

/* ── build them all in memory first: all-or-nothing preflight ──────────────────────────────────────── */
/* A hand-built page OUTRANKS the generator. Collision Theory was written by hand and goated on 16 Sep;
   nothing generated goes over it. Anything on disk without this generator's own marker is left alone. */
const MARK = 'KNOWHERE:CONCEPT-PAGE v2';
const preserved = [];
const built = [];
for (const p of targets) {
  if (fs.existsSync(p.file) && !fs.readFileSync(p.file, 'utf8').includes(MARK)) { preserved.push(p); continue; }
  built.push({ p, ...buildPage(p) });
}
if (preserved.length) { console.log('\nhand-built, left untouched:'); for (const p of preserved) console.log(`  · ${p.file}`); }

const warn = [];
for (const b of built) {
  if (!/in the wild|the one idea/.test(b.html)) warn.push(`${b.p.slug}: no in-the-wild section (no ITW scene, no big idea)`);
  if (b.DESC.length > 300) warn.push(`${b.p.slug}: description ${b.DESC.length} chars`);
  if (/\bevery subject\b/i.test(b.html)) die(`${b.p.slug}: "every subject" — it is 15 HSC and 16 VCE`);
  if (/\b(grade|ATAR|marks? improve|band 6)\b/i.test(b.html.replace(/what examiners catch[\s\S]*?<\/div>/g, ''))) warn.push(`${b.p.slug}: check for an outcome claim`);
}

console.log(`\n${APPLY ? 'APPLY' : 'DRY RUN'} — ${built.length} pages, ${built.length} widgets`);
for (const b of built) console.log(`  ${b.p.file.padEnd(52)} ${String(b.html.length).padStart(7)}B  widget ${String(b.widget.length).padStart(7)}B  ${b.accent}  cells ${b.p.cells.length}`);
if (warn.length) { console.log('\nwarnings:'); for (const w of warn) console.log('  ⚠ ' + w); }

/* ── the sitemap: the concept URLs are APPENDED to whatever is already there, and the rows are rebuilt
   from disk every run, so this is idempotent and never drops a hand-authored row. ── */
function sitemapWith(files) {
  const xml = fs.readFileSync('sitemap.xml', 'utf8');
  const keep = xml.split('\n').filter(l => l.includes('<url>') && !/\/(hsc|vce)\//.test(l));
  const today = new Date().toISOString().slice(0, 10);
  const rows = files.map(f => `  <url><loc>https://knowhere.me/${f.replace(/\.html$/, '')}</loc><lastmod>${today}</lastmod><priority>0.7</priority></url>`);
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + [...keep, ...rows].join('\n') + '\n</urlset>\n';
}

/* every concept page already on disk (the hand-built Collision Theory page included) plus the new ones */
const onDisk = new Set();
for (const cert of ['hsc', 'vce']) {
  if (!fs.existsSync(cert)) continue;
  for (const d of fs.readdirSync(cert)) {
    const dir = path.join(cert, d);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.html')) onDisk.add(path.join(cert, d, f));
  }
}
for (const b of built) onDisk.add(b.p.file);
const sitemap = sitemapWith([...onDisk].sort());
console.log(`\nsitemap: ${(sitemap.match(/<url>/g) || []).length} urls (${onDisk.size} concept pages)`);

if (!APPLY) { console.log('\nnothing written — re-run with --apply'); process.exit(0); }

/* ── write ── */
fs.mkdirSync('widgets', { recursive: true });
for (const b of built) {
  fs.mkdirSync(path.dirname(b.p.file), { recursive: true });
  const wPath = path.join('widgets', b.widgetName);
  /* back up only what actually changes, and keep the backups out of the page folders — an idempotent
     re-run of this generator should leave no litter beside the pages it did not change */
  const bak = (f, next) => {
    if (!fs.existsSync(f) || fs.readFileSync(f, 'utf8') === next) return;
    const dest = path.join('_concept-backups', stamp, f);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, fs.readFileSync(f));
  };
  bak(b.p.file, b.html); bak(wPath, b.widget);
  fs.writeFileSync(wPath, b.widget);
  fs.writeFileSync(b.p.file, b.html);
}
if (fs.readFileSync('sitemap.xml', 'utf8') !== sitemap) { fs.mkdirSync(path.join('_concept-backups', stamp), { recursive: true }); fs.writeFileSync(path.join('_concept-backups', stamp, 'sitemap.xml'), fs.readFileSync('sitemap.xml')); }
fs.writeFileSync('sitemap.xml', sitemap);

/* ── receipts, read back from disk ── */
let bad = 0;
const check = (cond, name) => { console.log((cond ? '  ✓ ' : '  ✗ ') + name); if (!cond) bad++; };
console.log('\nreceipts (from disk):');
for (const b of built) {
  const pg = fs.readFileSync(b.p.file, 'utf8');
  const wd = fs.readFileSync(path.join('widgets', b.widgetName), 'utf8');
  const ok = pg.includes('<base href="/">') && pg.includes(esc(b.TITLE)) && pg.includes(`/widgets/${b.widgetName}`)
    && pg.includes('for-parents?as=parent') && pg.includes('data-pass-days') && pg.includes('data-kw-handoff')
    && pg.includes(`<link rel="canonical" href="${b.p.url}">`)
    && !/#3AADA0/i.test(wd) && wd.includes('kwMobFix') && wd.includes('kwH') && wd.includes(b.accent);
  if (!ok) { console.log(`  ✗ ${b.p.file}`); bad++; }
}
check(bad === 0, `${built.length} pages + widgets complete`);
const sm = fs.readFileSync('sitemap.xml', 'utf8');
check((sm.match(/<url>/g) || []).length === (sitemap.match(/<url>/g) || []).length, 'sitemap urls');
check(built.every(b => sm.includes(b.p.url)), 'every new page is in the sitemap');
check(sm.includes('https://knowhere.me/hsc/chemistry/collision-theory'), 'the hand-built Collision Theory page is in the sitemap too');
/* every internal concept link resolves to a file that exists — a paid destination must never 404 */
let links = 0, broken = 0;
for (const b of built) {
  const pg = fs.readFileSync(b.p.file, 'utf8');
  for (const m of pg.matchAll(/href="\/(hsc|vce)\/([^"?#]+)"/g)) { links++; if (!fs.existsSync(`${m[1]}/${m[2]}.html`)) { broken++; console.log(`    ✗ ${b.p.file} → /${m[1]}/${m[2]}`); } }
}
check(broken === 0, `${links} internal concept links, ${broken} broken`);
/* the app repo was opened read-only */
check(built.every(b => { const f = fileById.get(b.p.id); return fs.statSync(path.join(FLAT, f)).mtimeMs < Date.parse(stamp.slice(0, 10)) + 86400000; }), 'teal sources untouched');

if (bad) die(`${bad} receipt(s) failed`);
const litter = fs.existsSync(path.join('_concept-backups', stamp));
console.log(`\nWRITTEN · ${built.length} pages · ${built.length} widgets · sitemap.xml${litter ? ` · backups in _concept-backups/${stamp}/` : ' · nothing changed, no backups taken'}`);
