#!/usr/bin/env python3
"""gamsat-nav-seo (KW:GAMSAT-SEO, 18 Nov 2026) -- GAMSAT joins the site: nav, mobile menu, footer, sitemap, schema.
Plus the for-teachers title tag, the neuro terms in the schema, and the know.here -> knowhere.me 301.

  python3 _patches/gamsat-nav-seo-18nov/apply.py            # dry run: says what would change, writes nothing
  python3 _patches/gamsat-nav-seo-18nov/apply.py --apply    # writes. Backups -> _seo-backup-<ts>-gamsat-nav/ (gitignored, not served)
  node build-gamsat-page.mjs --apply                        # then: stamps the JSON-LD into gamsat.html
  bash knowhere-seo-v2.sh                                   # then: re-stamps every head, server.js SEO_PAGES, sitemap.xml

Run from the knowhere-website repo root. Idempotent. All-or-nothing: every edit is computed and asserted in memory
before the first write. Every swap is a named, counted string swap (never a regex over prose).

What it changes, at the SOURCE (so no regen can revert it):
  knowhere-seo-v2.sh        gamsat.html listed as kind="ext" (sitemap row + clean URL survive a regen; head untouched),
                            Organization description + knowsAbout (GAMSAT, teachers, dyslexia, autism), the app's audience
                            (students AND teachers), the for-teachers title tag, the know.here 301 in the server snippet
  build-gamsat-page.mjs     the GAMSAT page's own JSON-LD (it owns that head; its gate bans the school words)
  build-concept-pages.mjs   the nav template + script versions (225 concept pages; the hubs lift their nav from one)
  _patches/for-teachers-v2  build.py's script versions + the nav it lifts from for-teachers-v1-before.html
  knowhere-mobile-menu.js   v9: GAMSAT in the panel; the bar's GAMSAT link hides at 821-1040px so six links never crowd
  knowhere-footer.js        v27: GAMSAT joins the hubs ("play first"); the phone row may wrap
  server.js                 know.here / www.know.here -> 301 to the same path on knowhere.me
  sitemap.xml               the /gamsat row's lastmod
  every page with the nav   the GAMSAT link after "For teachers", menu ?v=9, footer ?v=27
The GAMSAT page keeps its own stripped nav (the school nav says "start your free week"; GAMSAT has no free week).
"""
import os, re, sys, glob, shutil, datetime

ROOT = os.getcwd()
APPLY = '--apply' in sys.argv
TS = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
BACKUP = os.path.join(ROOT, '_seo-backup-%s-gamsat-nav' % TS)
TODAY = datetime.date.today().isoformat()
for need in ('knowhere-seo-v2.sh', 'server.js', 'sitemap.xml', 'build-gamsat-page.mjs', 'build-concept-pages.mjs'):
    if not os.path.exists(os.path.join(ROOT, need)):
        sys.exit('run this from the knowhere-website repo root (missing %s)' % need)

plan = {}      # relpath -> new content
notes = []     # human lines

def read(rel):
    if rel in plan: return plan[rel]
    return open(os.path.join(ROOT, rel), encoding='utf-8').read()

def swap(rel, old, new, label, count=1):
    """Swap old -> new exactly `count` times. Already applied (new present, old absent) is a no-op."""
    src = read(rel)
    if new in src and (old not in src or old in new):
        if src.count(new) >= count and (old not in src.replace(new, '')):
            return False
    n = src.count(old)
    assert n == count, '%s: %s -- anchor found %d times, wanted %d: %r' % (rel, label, n, count, old[:70])
    plan[rel] = src.replace(old, new)
    notes.append('  %-44s %s' % (rel if len(rel) < 44 else '...' + rel[-41:], label))
    return True

# ───────────────────────────────────────────────────────────── 1. knowhere-seo-v2.sh
SEO = 'knowhere-seo-v2.sh'
swap(SEO, ' "404.html": dict(path=None, kind="404",',
     ' "gamsat.html": dict(path="/gamsat", kind="ext",   # KW:GAMSAT-SEO 18 Nov 2026 — this page\'s head and JSON-LD are OWNED by build-gamsat-page.mjs\n'
     '   # (its own og image, and a gate that bans the school words). It is listed here ONLY so its sitemap row, its clean-URL 301\n'
     '   # and link rewriting survive every regen — before this, a regen silently dropped /gamsat from the sitemap. Never head-patched.\n'
     '   title="GAMSAT Section 3, as things you can move — knowhere",\n'
     '   desc="(owned by build-gamsat-page.mjs)",\n'
     '   name="GAMSAT"),\n'
     ' "404.html": dict(path=None, kind="404",',
     'gamsat.html listed (kind=ext)')
swap(SEO, '            print(f"  skip {fname} (not in repo)"); continue\n        tl, dl = len(p["title"]), len(p["desc"])',
     '            print(f"  skip {fname} (not in repo)"); continue\n'
     '        if p["kind"] == "ext":   # KW:GAMSAT-SEO — its own generator owns the head\n'
     '            print(f"  {fname:22s} (ext: sitemap + clean URL only)"); continue\n'
     '        tl, dl = len(p["title"]), len(p["desc"])',
     'head loop skips ext pages')
swap(SEO, '        if not os.path.exists(path): continue\n        s = open(path, encoding="utf-8").read()\n        ok = ("KNOWHERE:SEO-HEAD v2" in s',
     '        if not os.path.exists(path): continue\n        if p["kind"] == "ext": continue   # KW:GAMSAT-SEO\n        s = open(path, encoding="utf-8").read()\n        ok = ("KNOWHERE:SEO-HEAD v2" in s',
     'receipts skip ext pages')
swap(SEO, '"/compare":"0.8","/mission":"0.6"', '"/compare":"0.8","/gamsat":"0.8","/mission":"0.6"', 'sitemap priority for /gamsat')
swap(SEO, '        u = SITE + p["path"]\n        lm = PAGE_DATES.get(f, TODAY)',
     '        u = SITE + p["path"]\n'
     '        if p["kind"] == "ext":   # KW:GAMSAT-SEO — generated elsewhere: its existing row is kept verbatim (no lastmod churn); no row yet -> one is made\n'
     '            _k = re.search(r"^.*<loc>" + re.escape(u) + r"</loc>.*$", open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8").read(), re.M)\n'
     '            rows.append(_k.group(0) if _k else f"  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod><priority>{prio.get(p[\'path\'],\'0.5\')}</priority></url>"); continue\n'
     '        lm = PAGE_DATES.get(f, TODAY)',
     'sitemap keeps the ext row')
swap(SEO, 'instead of teaching everyone the same way.",',
     'instead of teaching everyone the same way. Teachers get the same concepts as ready-built lessons to run with a class (knowhere · teach it.), and adults sitting the GAMSAT get the Section 3 science the same way.",',
     'Organization description: teachers + GAMSAT')
swap(SEO, '"knowsAbout":["HSC","VCE","Year 11 and 12 study","personalised learning","neurodivergent learners","ADHD study strategies"]}',
     '"knowsAbout":["HSC","VCE","GAMSAT Section 3","Year 11 and 12 study","personalised learning","interactive lessons for teachers","neurodivergent learners","ADHD study strategies","dyslexia","autism"]}',
     'knowsAbout: GAMSAT, teachers, dyslexia, autism')
swap(SEO, '"audience":{"@type":"EducationalAudience","educationalRole":"student","audienceType":"Year 11 and 12 students (HSC and VCE), their parents and teachers"},',
     '"audience":[{"@type":"EducationalAudience","educationalRole":"student","audienceType":"Year 11 and 12 students (HSC and VCE) and their parents"},\n'
     '                     {"@type":"EducationalAudience","educationalRole":"teacher","audienceType":"Year 11 and 12 teachers (HSC and VCE)"}],   # KW:GAMSAT-SEO 18 Nov: teachers are an audience, not a footnote',
     'app audience: students and teachers')
swap(SEO, '   title="knowhere · teach it. — Stop reading the room. Run it.",',
     '   title="HSC & VCE lessons for teachers — knowhere · teach it.",   # KW:GAMSAT-SEO 18 Nov: a title people search for; the hero line stays on the page and in og_title',
     'for-teachers title tag')
KNOW_HERE = ("  // know.here (Cat's short domain, 18 Nov 2026): every path 301s to the same path on knowhere.me\n"
             "  if (host === 'know.here' || host === 'www.know.here') return res.redirect(301, 'https://knowhere.me' + req.originalUrl);\n")
HOST_OLD = ("  const host = String(req.headers.host || '').toLowerCase();\n"
            "  if (host !== 'knowhere.me' && host !== 'www.knowhere.me') {")
HOST_NEW = ("  const host = String(req.headers.host || '').toLowerCase();\n" + KNOW_HERE +
            "  if (host !== 'knowhere.me' && host !== 'www.knowhere.me') {")
swap(SEO, HOST_OLD, HOST_NEW, 'server snippet: know.here 301')
assert '%' not in KNOW_HERE   # the snippet is a %-formatted Python string

# ───────────────────────────────────────────────────────────── 2. server.js
swap('server.js', HOST_OLD, HOST_NEW, 'know.here -> knowhere.me 301')

# ───────────────────────────────────────────────────────────── 3. build-gamsat-page.mjs
GB = 'build-gamsat-page.mjs'
DESC_LINE = "const DESC = 'Section 3 is half your GAMSAT score, and it is written in physics, chemistry and biology. Move the science underneath. Founding seats for the 2027 sittings.';\n"
LD_BLOCK = DESC_LINE + r"""/* KW:GAMSAT-SEO (18 Nov 2026): the page's structured data. It lives here, not in knowhere-seo-v2.sh, because this file owns
   the head. The organisation is named by @id only: the site-wide description names the school certificates, which the gate
   below bans on this page. No dates in it, so a rebuild with nothing changed stays byte-identical. */
const GURL = 'https://knowhere.me/gamsat', GORG = { '@id': 'https://knowhere.me/#org' };
const LD = JSON.stringify({ '@context': 'https://schema.org', '@graph': [
  { '@type': 'Organization', '@id': GORG['@id'], name: 'knowhere', url: 'https://knowhere.me/' },
  { '@type': 'WebPage', '@id': GURL + '#webpage', url: GURL, name: TITLE, description: DESC, inLanguage: 'en-AU', publisher: GORG,
    breadcrumb: { '@id': GURL + '#breadcrumb' }, mainEntity: { '@id': GURL + '#course' } },
  { '@type': 'BreadcrumbList', '@id': GURL + '#breadcrumb', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'knowhere', item: 'https://knowhere.me/' },
    { '@type': 'ListItem', position: 2, name: 'GAMSAT', item: GURL } ] },
  { '@type': 'Course', '@id': GURL + '#course', name: 'GAMSAT Section 3 science, as things you can move',
    description: 'The physics, chemistry and biology under GAMSAT Section 3 as interactive models, for candidates from non-science backgrounds.',
    provider: GORG, inLanguage: 'en-AU',
    about: ['GAMSAT Section 3', 'Reasoning in Biological and Physical Sciences', 'physics', 'chemistry', 'biology'],
    audience: { '@type': 'Audience', audienceType: 'GAMSAT candidates, including those from non-science backgrounds' },
    offers: { '@type': 'Offer', price: '99', priceCurrency: 'AUD', category: 'Paid', url: GURL, availability: 'https://schema.org/InStock' } },
] });
"""
swap(GB, DESC_LINE, LD_BLOCK, 'JSON-LD for the GAMSAT page')
swap(GB, '<meta name="twitter:image" content="https://knowhere.me/og-gamsat.png">\n<script defer src="https://cloud.umami.is/script.js"',
     '<meta name="twitter:image" content="https://knowhere.me/og-gamsat.png">\n<script type="application/ld+json">${LD}</script>\n<script defer src="https://cloud.umami.is/script.js"',
     'JSON-LD written into the head')
swap(GB, 'sitemap.xml keeps its hand row.', 'sitemap.xml: knowhere-seo-v2.sh keeps the /gamsat row (PAGES, kind="ext").', 'comment: who keeps the sitemap row')

# ───────────────────────────────────────────────────────────── 4. mobile menu v9
MM = 'knowhere-mobile-menu.js'
swap(MM, '   knowhere-mobile-menu.js v8 — shared mobile menu (≤820px).',
     '   knowhere-mobile-menu.js v9 — shared mobile menu (≤820px).\n'
     '   v9 (18 Nov 2026): GAMSAT joins the links. On a narrow desktop bar (821–1040px) the bar\'s\n'
     '   GAMSAT link hides, so six links never crowd the CTA; it is still in the footer.',
     'v9 header')
swap(MM, '[data-kw-cta]{display:none !important}}";',
     '[data-kw-cta]{display:none !important}}" +\n'
     '    "@media (min-width:821px) and (max-width:1040px){nav:not(.kwm-panel) a[href=\\"/gamsat\\"]{display:none !important}}";',
     'narrow-desktop guard for the bar link')
swap(MM, "    '<a href=\"/for-teachers\">For teachers</a>' +\n",
     "    '<a href=\"/for-teachers\">For teachers</a>' +\n    '<a href=\"/gamsat\">GAMSAT</a>' +\n",
     'GAMSAT in the panel')

# ───────────────────────────────────────────────────────────── 5. footer v27
FT = 'knowhere-footer.js'
VCE_LINK = "                    '<a class=\"kfn-stu-link\" href=\"/vce/\">vce<span class=\"kfn-x\"> concepts</span><span class=\"kfn-arr\" aria-hidden=\"true\">→</span></a>' +\n"
swap(FT, VCE_LINK, VCE_LINK +
     "                    /* KW:FOOT-V27 (18 Nov 2026): GAMSAT joins the hubs — until now nothing on the site linked to /gamsat */\n"
     "                    '<a class=\"kfn-stu-link\" href=\"/gamsat\">gamsat<span class=\"kfn-x\"> section 3</span><span class=\"kfn-arr\" aria-hidden=\"true\">→</span></a>' +\n",
     'GAMSAT in the hubs column')
swap(FT, "'knowhere-footer-nav .kfn-stu-row{flex-direction:row;gap:16px}' +",
     "'knowhere-footer-nav .kfn-stu-row{flex-direction:row;flex-wrap:wrap;justify-content:flex-end;gap:6px 16px}' +   /* V27: three hubs may wrap on a small phone */",
     'phone row may wrap')

# ───────────────────────────────────────────────────────────── 6. the nav, everywhere
LINK = '<a href="/gamsat">GAMSAT</a>'
PLAIN = '<a href="/for-teachers">For teachers</a>'
HERE = '<a href="/for-teachers" class="here">For teachers</a>'
HOME = '<a href="/for-teachers" class="kp-navlink" style="font-size:13px;font-weight:500;color:#8C8B87;letter-spacing:-0.01em;text-decoration:none">For teachers</a>'
HOME_LINK = '<a href="/gamsat" class="kp-navlink" style="font-size:13px;font-weight:500;color:#8C8B87;letter-spacing:-0.01em;text-decoration:none">GAMSAT</a>'

def nav_file(rel, versions=True):
    src = read(rel); out = src
    if 'href="/gamsat"' not in src:
        hits = [(a, l) for a, l in ((PLAIN, LINK), (HERE, LINK), (HOME, HOME_LINK)) if src.count(a) == 1]
        assert len(hits) == 1, '%s: wanted exactly one nav anchor, found %d' % (rel, len(hits))
        a, l = hits[0]
        out = out.replace(a, a + l)
    if versions:
        for old, new in (('knowhere-mobile-menu.js?v=8', 'knowhere-mobile-menu.js?v=9'), ('knowhere-footer.js?v=26', 'knowhere-footer.js?v=27')):
            if new in out and old not in out: continue
            assert out.count(old) == 1, '%s: %s found %d times' % (rel, old, out.count(old))
            out = out.replace(old, new)
    if out != src:
        plan[rel] = out; return True
    return False

pages = sorted(f for f in glob.glob('*.html') if PLAIN in read(f) or HERE in read(f) or HOME in read(f) or ('href="/gamsat"' in read(f) and f != 'gamsat.html'))
concept = sorted(os.path.join(d, f) for cert in ('hsc', 'vce') for d, _, fs in os.walk(cert) for f in fs if f.endswith('.html') and '.bak' not in f)
n_root = sum(nav_file(f) for f in pages)
n_con = sum(nav_file(f) for f in concept)
notes.append('  %-44s GAMSAT nav link, menu ?v=9, footer ?v=27' % ('%d root pages + %d hsc/vce pages' % (n_root, n_con)))
if nav_file('build-concept-pages.mjs'): notes.append('  %-44s nav template + versions' % 'build-concept-pages.mjs')
# the for-teachers v2 builder lifts its nav from its own "before" page and hardcodes the script versions
B2 = os.path.join('_patches', 'for-teachers-v2')
if os.path.exists(os.path.join(B2, 'build.py')):
    if nav_file(os.path.join(B2, 'for-teachers-v1-before.html'), versions=False): notes.append('  %-44s the nav build.py lifts' % '_patches/for-teachers-v2/…-v1-before.html')
    swap(os.path.join(B2, 'build.py'), 'from="./knowhere-footer.js?v=26"', 'from="./knowhere-footer.js?v=27"', 'footer version')
    swap(os.path.join(B2, 'build.py'), 'src="./knowhere-mobile-menu.js?v=8"', 'src="./knowhere-mobile-menu.js?v=9"', 'menu version')

# ───────────────────────────────────────────────────────────── 7. sitemap row
sm = read('sitemap.xml')
m = re.search(r'^(  <url><loc>https://knowhere\.me/gamsat</loc><lastmod>)(\d{4}-\d{2}-\d{2})(</lastmod>.*)$', sm, re.M)
assert m, 'sitemap.xml: the /gamsat row is missing'
if m.group(2) != TODAY and (plan or True):
    if any(k in plan for k in (GB,)):   # only when the page itself is about to change
        plan['sitemap.xml'] = sm.replace(m.group(0), m.group(1) + TODAY + m.group(3))
        notes.append('  %-44s /gamsat lastmod -> %s' % ('sitemap.xml', TODAY))

# ───────────────────────────────────────────────────────────── write
print('gamsat-nav-seo · %s · %d file(s) to change' % ('APPLY' if APPLY else 'DRY RUN', len(plan)))
for l in notes: print(l)
if not plan: print('nothing to do (already applied)'); sys.exit(0)
if not APPLY: print('\nDRY RUN: nothing written. Add --apply.'); sys.exit(0)
for rel, content in plan.items():
    dst = os.path.join(BACKUP, rel); os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(os.path.join(ROOT, rel), dst)
for rel, content in plan.items():
    open(os.path.join(ROOT, rel), 'w', encoding='utf-8').write(content)
bad = [rel for rel, content in plan.items() if open(os.path.join(ROOT, rel), encoding='utf-8').read() != content]
print('\nwritten: %d file(s) · read back from disk: %s' % (len(plan), 'all match' if not bad else 'MISMATCH ' + ', '.join(bad)))
print('backup : ' + BACKUP)
print('next   : node --check the three scripts, node build-gamsat-page.mjs --apply, bash knowhere-seo-v2.sh')
sys.exit(1 if bad else 0)
