#!/usr/bin/env python3
"""KW:HUBS-LINK (Muppet 19 Oct 2026) — link every concept page UP to its subject hub.

Three changes per concept page, all idempotent:
  1. eyebrow   "HSC · Biology · Topic"  ->  "<a /hsc/>HSC</a> · <a /hsc/biology/>Biology</a> · Topic"
               (Year 11 pages also link "Year 11" to /<cert>/year-11/)
  2. crumbs    the plain "hsc biology" span becomes a link to the subject hub
  3. JSON-LD   BreadcrumbList position 2 pointed at the page itself (there was no hub) -> the hub URL
plus one CSS rule so the eyebrow links read as links.

The SAME change is made to the two builders (build-concept-pages.mjs template, build-concept-collision.js),
so a regen reproduces it instead of reverting it.

Run from the knowhere-website repo root:
  python3 _patches/hubs/link-concepts.py            # dry run
  python3 _patches/hubs/link-concepts.py --apply    # writes; backups -> _patches/hubs/bak-link-<ts>/
"""
import os, re, sys, glob, json, shutil, datetime

APPLY = "--apply" in sys.argv
ROOT = os.getcwd()
assert os.path.exists("build-concept-pages.mjs") and os.path.isdir("hsc"), "run from the knowhere-website repo root"
TS = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
BAK = os.path.join("_patches", "hubs", f"bak-link-{TS}")
SITE = "https://knowhere.me"

CSS_ANCHOR = ".kw-c .eyebrow .lhs b{color:var(--ink-dim);font-weight:400}\n"
CSS_RULE = ".kw-c .eyebrow .lhs a{color:inherit;border-bottom:1px solid color-mix(in srgb,currentColor 40%,transparent)}.kw-c .eyebrow .lhs a:hover{border-bottom-color:currentColor}\n"

def hub_of(f):
    parts = f.split(os.sep)            # hsc/biology/x.html  or  hsc/year-11/chemistry/x.html
    return "/" + "/".join(parts[:-1]) + "/", "/" + parts[0] + "/", parts[1] == "year-11"

def patch_page(f, s):
    hub, certp, y11 = hub_of(f)
    n = s
    # 1. eyebrow
    if f'<span class="lhs"><a href="{certp}">' not in n:
        pat = re.compile(r'<span class="lhs">(HSC|VCE) · (Year 11 · )?([^·<]+?) · ')
        m = pat.findall(n)
        assert len(m) == 1, (f, "eyebrow", len(m))
        assert bool(m[0][1]) == y11, (f, "year-11 mismatch")
        def rp(mo):
            cert, yr, subj = mo.group(1), mo.group(2), mo.group(3)
            return (f'<span class="lhs"><a href="{certp}">{cert}</a> · '
                    + (f'<a href="{certp}year-11/">Year 11</a> · ' if yr else '')
                    + f'<a href="{hub}">{subj}</a> · ')
        n = pat.sub(rp, n, count=1)
    # 2. crumbs
    old_c = '<div class="crumbs"><a href="/">knowhere</a><span>›</span><span>'
    if old_c in n:
        assert n.count(old_c) == 1, (f, "crumbs")
        i = n.index(old_c) + len(old_c) - len("<span>")
        j = n.index("</span>", i)
        label = n[i + len("<span>"):j]
        n = n[:i] + f'<a href="{hub}">{label}</a>' + n[j + len("</span>"):]
    # 3. JSON-LD breadcrumb position 2
    bc = re.compile(r'("position":2,"name":"[^"]*","item":")([^"]*)(")')
    mm = bc.findall(n)
    assert len(mm) == 1, (f, "breadcrumb pos 2", len(mm))
    n = bc.sub(lambda mo: mo.group(1) + SITE + hub + mo.group(3), n, count=1)
    # css
    if CSS_RULE not in n:
        assert n.count(CSS_ANCHOR) == 1, (f, "css anchor")
        n = n.replace(CSS_ANCHOR, CSS_ANCHOR + CSS_RULE, 1)
    # receipts in memory: the LD still parses, the hub is linked 3 times
    ld = re.search(r'<script type="application/ld\+json">(.*?)</script>', n, re.S).group(1); json.loads(ld)
    assert n.count(f'href="{hub}"') == 2 and (SITE + hub) in n, (f, "hub links")
    return n

# ---- concept pages
pages = sorted(p for p in glob.glob("hsc/**/*.html", recursive=True) + glob.glob("vce/**/*.html", recursive=True)
               if not p.endswith("index.html") and ".bak" not in p)
assert len(pages) >= 150, len(pages)
plan = []
for f in pages:
    s = open(f, encoding="utf-8").read()
    n = patch_page(f, s)
    if n != s: plan.append((f, s, n))

# ---- the two builders
G = "build-concept-pages.mjs"
g = open(G, encoding="utf-8").read(); gn = g
GEN_EDITS = [
  ("  const eyebrowMain = `${home.curriculum} · ${Y11P ? 'Year 11 · ' : ''}${home.subject} · ${esc(home.topic)}`;\n",
   "  /* KW:HUBS-LINK 19 Oct 2026 — the eyebrow and crumbs link up to the subject hub (build-hub-pages.mjs) */\n"
   "  const hubP = p.url.replace(/^https:\\/\\/knowhere\\.me/, '').replace(/[^/]+$/, '');\n"
   "  const certP = '/' + hubP.split('/')[1] + '/';\n"
   "  const eyebrowMain = `<a href=\"${certP}\">${home.curriculum}</a> · ${Y11P ? `<a href=\"${certP}year-11/\">Year 11</a> · ` : ''}<a href=\"${hubP}\">${home.subject}</a> · ${esc(home.topic)}`;\n"),
  ("          { '@type': 'ListItem', position: 2, name: `${home.curriculum} ${home.subject}${Y11P ? ' Year 11' : ''}`, item: p.url },\n",
   "          { '@type': 'ListItem', position: 2, name: `${home.curriculum} ${home.subject}${Y11P ? ' Year 11' : ''}`, item: 'https://knowhere.me' + hubP },\n"),
  ("<div class=\"crumbs\"><a href=\"/\">knowhere</a><span>›</span><span>${esc(home.curriculum.toLowerCase())} ${esc(home.subject.toLowerCase())}${Y11P ? ' year 11' : ''}</span>",
   "<div class=\"crumbs\"><a href=\"/\">knowhere</a><span>›</span><a href=\"${hubP}\">${esc(home.curriculum.toLowerCase())} ${esc(home.subject.toLowerCase())}${Y11P ? ' year 11' : ''}</a>"),
  (CSS_ANCHOR, CSS_ANCHOR + CSS_RULE),
]
for old, new in GEN_EDITS:
    if new in gn: continue
    assert gn.count(old) == 1, (G, old[:70], gn.count(old))
    gn = gn.replace(old, new, 1)
C = "build-concept-collision.js"
c = open(C, encoding="utf-8").read(); cn = c
COL_EDITS = [
  ('<span class="lhs">HSC · Chemistry · ', '<span class="lhs"><a href="/hsc/">HSC</a> · <a href="/hsc/chemistry/">Chemistry</a> · '),
  ('<span>›</span><span>hsc chemistry</span>', '<span>›</span><a href="/hsc/chemistry/">hsc chemistry</a>'),
  (CSS_ANCHOR, CSS_ANCHOR + CSS_RULE),
  ('"position":2,"name":"HSC chemistry","item":"https://knowhere.me/hsc/chemistry/collision-theory"',
   '"position":2,"name":"HSC chemistry","item":"https://knowhere.me/hsc/chemistry/"'),
]
for old, new in COL_EDITS:
    if new in cn: continue
    assert cn.count(old) == 1, (C, old[:60], cn.count(old))
    cn = cn.replace(old, new, 1)
print(f"concept pages: {len(pages)} read · {len(plan)} to change")
print(f"{G}: {'change' if gn != g else 'already linked'} · {C}: {'change' if cn != c else 'already linked'}")
if not APPLY:
    print("\nDRY RUN — nothing written. Re-run with --apply."); sys.exit(0)

for f, s, n in plan:
    b = os.path.join(BAK, f); os.makedirs(os.path.dirname(b), exist_ok=True); shutil.copy2(f, b)
    open(f, "w", encoding="utf-8").write(n)
for path, old, new in ((G, g, gn), (C, c, cn)):
    if new != old:
        os.makedirs(BAK, exist_ok=True); shutil.copy2(path, os.path.join(BAK, path))
        open(path, "w", encoding="utf-8").write(new)
# receipts from disk
bad = 0
for f, s, n in plan:
    d = open(f, encoding="utf-8").read()
    if d != n or patch_page(f, d) != d: bad += 1; print("  ✗", f)
if open(G, encoding="utf-8").read() != gn or open(C, encoding="utf-8").read() != cn: bad += 1; print("  ✗ builders")
if bad: print(f"{bad} receipt(s) failed — backups in {BAK}"); sys.exit(2)
print(f"\nWRITTEN · {len(plan)} concept pages · builders {'updated' if (gn != g or cn != c) else 'unchanged'} · backups in {BAK} · receipts OK (re-patching is a no-op)")
