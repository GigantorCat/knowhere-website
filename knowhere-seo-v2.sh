#!/usr/bin/env bash
# knowhere-seo-v2.sh — SEO-HEAD v2 (titles, metas, JSON-LD, lang) + clean URLs (301s) for knowhere.me
#
#   bash knowhere-seo-v2.sh --dry-run    # shows what would change, writes nothing
#   bash knowhere-seo-v2.sh              # applies. Backups -> _seo-backup-<ts>/ (gitignored, not served)
#
# Run from the knowhere-website repo root. Idempotent: running twice changes nothing the second time.
# Rollback: cp _seo-backup-<ts>/* .
set -euo pipefail
[ -f index.html ] && [ -f server.js ] && [ -f sitemap.xml ] || { echo "run this from the knowhere-website repo root"; exit 1; }
command -v python3 >/dev/null || { echo "python3 required"; exit 1; }
command -v node    >/dev/null || { echo "node required"; exit 1; }
DRY=0; [ "${1:-}" = "--dry-run" ] && DRY=1
TMP="$(mktemp -t kwseo.XXXXXX)"; trap 'rm -f "$TMP"' EXIT
cat > "$TMP" <<'PYEOF'
# knowhere.me — SEO-HEAD v2 + clean URLs patch
# Run from the knowhere-website repo root. Idempotent. Backs up to _seo-backup-<ts>/ (underscore paths are
# already blocked from static serving in server.js).
import os, re, sys, json, glob, shutil, datetime

ROOT = os.getcwd()
DRY = os.environ.get("KW_DRY") == "1"
TS = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
BACKUP = os.path.join(ROOT, f"_seo-backup-{TS}")
SITE = "https://knowhere.me"
TODAY = datetime.date.today().isoformat()

# ---- fill these in when you have them (Organization.sameAs — LinkedIn, Instagram, TikTok, YouTube, Product Hunt, Crunchbase) ----
SAME_AS = []

# ------------------------------------------------------------------ page copy
# path = clean URL. title <= 60 chars, desc <= 160 chars (warned, not fatal).
PAGES = {
 "index.html": dict(path="/", kind="home",
   title="knowhere — Year 12 study built for your brain (HSC & VCE)",
   desc="Year 12 study, rebuilt around you. Every HSC and VCE subject as living, interactive concepts, shaped to what motivates you and how you're wired. 7 days free.",
   og_title="You can't fake a kickflip. Same goes for Year 12.",
   og_desc="Every HSC and VCE concept, rebuilt for the way your brain fires. Live now — seven days free.",
   name="Home"),
 "how-it-works.html": dict(path="/how-it-works", kind="page",
   title="How knowhere works — personalised HSC & VCE study",
   desc="Nine motivational types, a neurology layer, four modes. How knowhere rebuilds every HSC and VCE concept for one brain: yours. See the three models.",
   name="How it works"),
 "experience-it.html": dict(path="/experience-it", kind="page",
   title="Try knowhere — real HSC & VCE concepts, reframed for you",
   desc="No trailer. Real HSC and VCE concepts from the app, a lens switcher that reframes them for different brains, and a quiz that rebuilds itself to fit yours.",
   name="Experience it"),
 "pricing.html": dict(path="/pricing", kind="pricing",
   title="knowhere pricing — HSC & VCE study plans from A$23/month",
   desc="Core, Pro and Max. Every HSC and VCE subject on every plan, no per-topic fees. Seven days free, AUD, cancel anytime. Less than one hour of tutoring a month.",
   name="Pricing"),
 "for-parents.html": dict(path="/for-parents", kind="faq",
   title="knowhere for parents — Year 12 study help that fits your kid",
   desc="Year 12 study built around how your kid actually learns, mapped to the HSC and VCE curriculum, with a parent dashboard so you can stop asking how study's going.",
   name="For parents",
   faq=[
    ("Does knowhere follow the actual HSC and VCE curriculum?",
     "Yes — every concept maps to the official study design your child is examined on. No busywork, no filler content padding out a subscription."),
    ("What happens to my child's data?",
     "It is handled under the Australian Privacy Act 1988. Your child's learning data is used to personalise their learning — not sold, not shared for advertising. The full policy is available before you sign anything."),
    ("Does knowhere replace school or a tutor?",
     "It works alongside school — the explain-it-again, explain-it-differently layer school can't provide for thirty students at once. A month of knowhere costs less than one hour with a tutor, and the two don't fight: plenty of families will want both."),
    ("What does it cost to try?",
     "Nothing today. You pick a plan and start the free week — A$0 is taken now, and the first payment is 7 days later. Cancel any time before then and you are not charged, with no lock-in on monthly plans."),
   ]),
 "for-teachers.html": dict(path="/for-teachers", kind="faq",
   title="knowhere for teachers — HSC & VCE concepts for the projector",
   desc="Every HSC and VCE concept as a live explanation for the projector, mapped to the NESA syllabus and VCAA study design. 50 founding seats, first term free.",
   name="For teachers",
   faq=[
    ("Does knowhere follow the actual study design?",
     "Yes. Every concept maps to VCAA and NESA study designs — unit by unit, area of study by area of study. Where something is examinable in one state and not another, it says so on the page."),
    ("Do my students need accounts?",
     "Not yet — the teacher experience (share links, class groups, present mode) is Release 2, and founding teachers get first say in it. A personalised student plan for home study is separate and entirely the student's call."),
    ("Can I use knowhere for lesson planning?",
     "Right now it is the best explain-it-again layer you'll find. Lesson building, class groups and progress views are next — and teachers on the platform get first say in how they work."),
   ]),
 "compare.html": dict(path="/compare", kind="faq",
   title="knowhere vs Atomi vs Edrolo vs a tutor — honest comparison",
   desc="Year 12 study options compared for HSC and VCE parents: knowhere, Atomi, Edrolo and private tutoring. What each is, what it costs in 2026, and who it suits.",
   name="Compare",
   faq=[
    ("Is knowhere a replacement for Atomi or Edrolo?",
     "For some families, yes: every HSC and VCE subject is included on every knowhere plan, and it is cheaper. For others it is the layer underneath: Atomi or Edrolo for the lesson, knowhere for the moment the lesson didn't land."),
    ("Can I use knowhere alongside a tutor?",
     "Yes. A tutor for the one brutal subject, knowhere for all of them. The tutor gets a kid who arrives already knowing which bit didn't land."),
    ("Which is cheapest for a full Year 12 load?",
     "knowhere: A$276–468 a year covers every subject. Atomi is A$470–720 a year, Edrolo roughly A$720–750 for five subjects, and one private tutor for one subject is around A$3,000 a year. Prices as at 11 September 2026; confirm on each provider's site before paying."),
    ("Does knowhere have video lessons?",
     "No. Every concept is an interactive model available in four modes: see it, hear it, try it, or talk it through. If a video lecture is what your kid needs, Atomi or Edrolo do that well."),
    ("Is knowhere aligned to the actual HSC and VCE curriculum?",
     "Yes. Every concept maps to the NESA syllabus or VCAA study design your kid is examined on. Content that is examinable in one state and not the other is badged, not hidden."),
    ("What happens after the free week?",
     "Nothing is charged today. The first payment is 7 days later; cancel any time before then and you pay nothing. Monthly plans have no lock-in."),
   ]),
 "mission.html": dict(path="/mission", kind="about",
   title="Our mission — learn how you learn | knowhere",
   desc="Nobody's scared of the subject — they've never been shown how they learn. knowhere is Year 12 study that teaches you your own method, so you can learn anything.",
   name="Mission"),
 "know-us.html": dict(path="/know-us", kind="about",
   title="Know us — the humans behind knowhere, the Year 12 study app",
   desc="We're not an edtech company — we're a human intelligence company. Meet the small, opinionated crew behind knowhere, built in Australia for HSC and VCE students.",
   name="Know us"),
 "press.html": dict(path="/press", kind="press",
   title="Press kit — knowhere, Year 12 study built for your brain",
   desc="Press kit for knowhere — the Australian Year 12 (HSC and VCE) study app built for your brain. Fast facts, founder bio, boilerplate, images and contact.",
   og_desc="Fast facts, founder bio, images and contact for journalists and podcasters.",
   name="Press"),
 "talk-to-us.html": dict(path="/talk-to-us", kind="contact",
   title="Talk to us — contact knowhere (we actually read these)",
   desc="Say hi to knowhere. Questions about Year 12 study, HSC and VCE subjects, pricing, press or partnerships — send a message and a human replies.",
   name="Talk to us"),
 "privacy.html": dict(path="/privacy", kind="legal",
   title="Privacy policy — knowhere",
   desc="How knowhere collects, uses and protects student and parent data under the Australian Privacy Act 1988. What we collect, what we don't, and your rights.",
   name="Privacy"),
 "terms.html": dict(path="/terms", kind="legal",
   title="Terms of use — knowhere",
   desc="The terms for using knowhere: accounts, parent and student access, free trial, subscriptions, billing, refunds, AI-generated content and acceptable use.",
   name="Terms"),
 "waitlist.html": dict(path="/waitlist", kind="noindex",
   title="Hold a seat — knowhere",
   desc="Founding teacher seats and early access for knowhere, the Year 12 study app for HSC and VCE.",
   name="Waitlist"),
 "404.html": dict(path=None, kind="404",
   title="404 — knowhere",
   desc="That page is nowhere. knowhere is here.",
   name="404"),
}

CLEAN = {f: v["path"] for f, v in PAGES.items() if v["path"]}   # 'pricing.html' -> '/pricing'

# ------------------------------------------------------------------ schema builders
def org():
    o = {"@type":"Organization","@id":SITE+"/#org","name":"knowhere",
         "alternateName":["knowhere.me","knowhere study app"],
         "legalName":"Gigantor Studios Pty Ltd","url":SITE+"/",
         "logo":{"@type":"ImageObject","url":SITE+"/og-image.png","width":1200,"height":630},
         "description":"knowhere is an Australian personalised study app for Year 12 students sitting the HSC (NSW) and VCE (Victoria). Every concept in every subject is rebuilt for the way each learner thinks — motivation, neurology and mode — instead of teaching everyone the same way.",
         "disambiguatingDescription":"Australian education technology product for HSC and VCE students, made by Gigantor Studios Pty Ltd. Not affiliated with NESA or VCAA.",
         "foundingDate":"2026","founder":{"@id":SITE+"/#founder"},
         "email":"hello@knowhere.me",
         "address":{"@type":"PostalAddress","addressRegion":"NSW","addressCountry":"AU"},
         "areaServed":{"@type":"Country","name":"Australia"},
         "knowsAbout":["HSC","VCE","Year 12 study","personalised learning","neurodivergent learners","ADHD study strategies"]}
    if SAME_AS: o["sameAs"] = SAME_AS
    return o

def founder():
    return {"@type":"Person","@id":SITE+"/#founder","name":"Cat Ryan","jobTitle":"Founder",
            "worksFor":{"@id":SITE+"/#org"},"url":SITE+"/know-us","image":SITE+"/Press/cat-ryan.jpg",
            "description":"Founder of knowhere. Senior service designer and AI experience architect with 22+ years in experience design across financial services, higher education and government.",
            "nationality":{"@type":"Country","name":"Australia"}}

def website():
    return {"@type":"WebSite","@id":SITE+"/#site","url":SITE+"/","name":"knowhere",
            "alternateName":"knowhere.me","inLanguage":"en-AU","publisher":{"@id":SITE+"/#org"}}

def app(full=False):
    a = {"@type":"SoftwareApplication","@id":SITE+"/#app","name":"knowhere",
         "applicationCategory":"EducationalApplication","applicationSubCategory":"Study app",
         "operatingSystem":"Web","url":SITE+"/","inLanguage":"en-AU","isAccessibleForFree":False,
         "description":"Personalised Year 12 study for HSC and VCE. Every subject as living, interactive concepts, reframed for each learner's motivation, neurology and mode. Seven-day free trial.",
         "audience":{"@type":"EducationalAudience","educationalRole":"student","audienceType":"Year 12 students (HSC and VCE), their parents and teachers"},
         "educationalLevel":"Year 12","countriesSupported":"AU","publisher":{"@id":SITE+"/#org"},
         "offers":{"@type":"AggregateOffer","priceCurrency":"AUD","lowPrice":"23","highPrice":"39","offerCount":3,
                   "url":SITE+"/pricing","eligibleRegion":{"@type":"Country","name":"Australia"}}}
    if full:
        plans = [("Core","23","276","The full curriculum. Every HSC and VCE subject, Knowscapes, flashcards, exam-style questions, progress tracking."),
                 ("Pro","31","372","Everything in Core plus Unstuck (a different explanation on demand), 10 custom concepts a month and Gap Map."),
                 ("Max","39","468","Everything in Pro plus the parent dashboard and 30 custom concepts a month.")]
        a["offers"]["offers"] = [{"@type":"Offer","name":p,"description":d,"price":m,"priceCurrency":"AUD","url":SITE+"/pricing",
                                   "availability":"https://schema.org/InStock",
                                   "priceSpecification":[{"@type":"UnitPriceSpecification","price":m,"priceCurrency":"AUD","billingDuration":"P1M","name":"Monthly"},
                                                         {"@type":"UnitPriceSpecification","price":y,"priceCurrency":"AUD","billingDuration":"P1Y","name":"Yearly"}]}
                                  for p,m,y,d in plans]
        a["featureList"] = ["Every HSC and VCE subject on every plan","Knowscapes — interactive visual concept experiences",
                            "Nine motivational types, a neurology layer and four modes","Flashcards that build themselves",
                            "Exam-style questions generated fresh every time","Concept and topic progress tracking",
                            "Unstuck — a different explanation on demand (Pro, Max)","Gap Map (Pro, Max)","Parent dashboard (Max)"]
    return a

def webpage(url, title, desc, typ="WebPage", crumb=None):
    w = {"@type":typ,"@id":url+"#webpage","url":url,"name":title,"description":desc,"inLanguage":"en-AU",
         "isPartOf":{"@id":SITE+"/#site"},"about":{"@id":SITE+"/#org"},"dateModified":TODAY}
    if crumb: w["breadcrumb"] = {"@id":url+"#breadcrumb"}
    return w

def breadcrumb(url, name):
    return {"@type":"BreadcrumbList","@id":url+"#breadcrumb","itemListElement":[
        {"@type":"ListItem","position":1,"name":"knowhere","item":SITE+"/"},
        {"@type":"ListItem","position":2,"name":name,"item":url}]}

def faqpage(url, qa):
    return {"@type":"FAQPage","@id":url+"#faq","mainEntity":[
        {"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in qa]}

def graph_for(fname, p):
    url = SITE + (p["path"] if p["path"] != "/" else "/")
    g = [org(), founder(), website()]
    k = p["kind"]
    if k == "home":
        g += [app(), webpage(url, p["title"], p["desc"])]
    elif k == "pricing":
        g += [app(full=True), webpage(url, p["title"], p["desc"], crumb=True), breadcrumb(url, p["name"])]
    elif k == "faq":
        g += [webpage(url, p["title"], p["desc"], crumb=True), breadcrumb(url, p["name"]), faqpage(url, p["faq"])]
    elif k == "about":
        g += [webpage(url, p["title"], p["desc"], "AboutPage", crumb=True), breadcrumb(url, p["name"])]
    elif k == "contact":
        g += [webpage(url, p["title"], p["desc"], "ContactPage", crumb=True), breadcrumb(url, p["name"])]
    elif k == "press":
        g += [webpage(url, p["title"], p["desc"], crumb=True), breadcrumb(url, p["name"])]
    elif k in ("page","legal"):
        g += [webpage(url, p["title"], p["desc"], crumb=True), breadcrumb(url, p["name"])]
    else:
        return None
    return {"@context":"https://schema.org","@graph":g}

# ------------------------------------------------------------------ head builder
def esc(s):
    return s.replace("&","&amp;").replace('"',"&quot;").replace("'","&#39;")

def head_block(fname, p):
    lines = ["<!-- KNOWHERE:SEO-HEAD v2 -->"]
    lines.append(f"<title>{esc(p['title'])}</title>")
    lines.append(f'<meta name="description" content="{esc(p["desc"])}">')
    if p["path"]:
        url = SITE + p["path"]
        lines.append(f'<link rel="canonical" href="{url}">')
    if p["kind"] in ("noindex","404"):
        lines.append('<meta name="robots" content="noindex,follow">')
    else:
        lines.append('<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">')
    lines.append('<meta name="theme-color" content="#070708">')
    lines.append('<link rel="icon" href="/favicon.svg" type="image/svg+xml">')
    if p["path"]:
        ogt = p.get("og_title", p["title"]); ogd = p.get("og_desc", p["desc"])
        lines += ['<meta property="og:type" content="website">',
                  '<meta property="og:site_name" content="knowhere">',
                  f'<meta property="og:url" content="{url}">',
                  f'<meta property="og:title" content="{esc(ogt)}">',
                  f'<meta property="og:description" content="{esc(ogd)}">',
                  f'<meta property="og:image" content="{SITE}/og-image.png">',
                  '<meta property="og:image:width" content="1200">',
                  '<meta property="og:image:height" content="630">',
                  '<meta property="og:image:alt" content="knowhere — Year 12 study built for your brain">',
                  '<meta property="og:locale" content="en_AU">',
                  '<meta name="twitter:card" content="summary_large_image">',
                  f'<meta name="twitter:title" content="{esc(ogt)}">',
                  f'<meta name="twitter:description" content="{esc(ogd)}">',
                  f'<meta name="twitter:image" content="{SITE}/og-image.png">']
        g = graph_for(fname, p)
        if g:
            lines.append('<script type="application/ld+json">')
            lines.append(json.dumps(g, ensure_ascii=False, separators=(",",":")))
            lines.append('</script>')
    lines.append("<!-- /KNOWHERE:SEO-HEAD -->")
    return "\n".join(lines)

# ------------------------------------------------------------------ patching
def backup(path):
    if DRY: return
    os.makedirs(BACKUP, exist_ok=True)
    shutil.copy2(path, os.path.join(BACKUP, os.path.basename(path)))

def save(path, content):
    backup(path)
    if not DRY:
        open(path, "w", encoding="utf-8").write(content)

HEAD_RE = re.compile(r"(<head>)(.*?)(</head>)", re.S | re.I)
STRIP_HEAD = [
    re.compile(r"<!-- KNOWHERE:SEO-HEAD v\d+ -->.*?<!-- /KNOWHERE:SEO-HEAD -->\n?", re.S),
    re.compile(r"[ \t]*<title>.*?</title>[ \t]*\n?", re.S | re.I),
    re.compile(r'[ \t]*<meta\s+name="description"[^>]*>[ \t]*\n?', re.I),
    re.compile(r'[ \t]*<meta\s+name="robots"[^>]*>[ \t]*\n?', re.I),
    re.compile(r'[ \t]*<meta\s+name="theme-color"[^>]*>[ \t]*\n?', re.I),
    re.compile(r'[ \t]*<link\s+rel="canonical"[^>]*>[ \t]*\n?', re.I),
    re.compile(r'[ \t]*<link\s+rel="icon"[^>]*>[ \t]*\n?', re.I),
    re.compile(r'[ \t]*<meta\s+property="og:[^"]*"[^>]*>[ \t]*\n?', re.I),
    re.compile(r'[ \t]*<meta\s+name="twitter:[^"]*"[^>]*>[ \t]*\n?', re.I),
]
VIEWPORT_RE = re.compile(r'(<meta\s+name="viewport"[^>]*>)', re.I)
HTML_TAG_RE = re.compile(r"<html(\s[^>]*)?>", re.I)

def rewrite_links(s):
    # href="pricing.html" | href="./pricing.html" | href="/pricing.html" (+ optional #anchor)  ->  href="/pricing"
    def sub(m):
        f = m.group(2) + ".html"
        if f not in CLEAN: return m.group(0)
        return f'href="{CLEAN[f]}{m.group(3) or ""}"'
    s = re.sub(r'href="(\./|/)?([a-z0-9-]+)\.html(#[A-Za-z0-9_-]+)?"', sub, s)
    # absolute https://knowhere.me/x.html -> https://knowhere.me/x
    def sub2(m):
        f = m.group(1) + ".html"
        return SITE + CLEAN[f] if f in CLEAN else m.group(0)
    s = re.sub(r'https://knowhere\.me/([a-z0-9-]+)\.html', sub2, s)
    return s

def patch_page(fname, p):
    path = os.path.join(ROOT, fname)
    src = open(path, encoding="utf-8").read()
    orig = src
    m = HEAD_RE.search(src)
    assert m, f"{fname}: no <head>"
    head = m.group(2)
    for rx in STRIP_HEAD:
        head = rx.sub("", head)
    block = head_block(fname, p)
    vm = VIEWPORT_RE.search(head)
    if vm:
        head = head[:vm.end()] + "\n" + block + head[vm.end():]
    else:
        head = "\n" + block + head
    src = src[:m.start(2)] + head + src[m.end(2):]
    # lang
    src, n = HTML_TAG_RE.subn('<html lang="en-AU">', src, count=1)
    assert n == 1, f"{fname}: <html> tag not found"
    src = rewrite_links(src)
    if src != orig:
        save(path, src)
    return src != orig

def patch_js(fname):
    path = os.path.join(ROOT, fname)
    if not os.path.exists(path): return False
    src = open(path, encoding="utf-8").read()
    out = rewrite_links(src)
    if out != src:
        save(path, out)
    return out != src

# JS logic that assumed .html paths — exact-anchor replacements, each asserted to occur once (or already applied)
JS_LOGIC = {
  "knowhere-mobile-menu.js": [
    ('var here = (location.pathname.split("/").pop() || "index.html");',
     'var here = "/" + location.pathname.replace(/^\\/+|\\/+$/g, "").replace(/\\.html$/, ""); if (here === "/index") here = "/";'),
    ('if (a.getAttribute("href") === here) {',
     'var h = (a.getAttribute("href") || "").replace(/^\\.\\//, "").replace(/\\.html$/, ""); if (h === "" || h === "index") h = "/"; else if (h.charAt(0) !== "/") h = "/" + h;\n        if (h === here) {'),
  ],
  "knowhere-waitlist.js": [
    ('a[href$="pricing.html"],', 'a[href$="pricing.html"],a[href$="/pricing"],'),
    ('<a href=\\"privacy.html\\">privacy</a>', '<a href=\\"/privacy\\">privacy</a>'),
    ("'https://knowhere.me/waitlist.html'", "'https://knowhere.me/waitlist'"),
    ("href: 'experience-it.html'", "href: '/experience-it'"),
  ],
  "knowhere-goat-card.js": [
    ('ctaHref:"pricing.html",', 'ctaHref:"/pricing",'),
  ],
}

# Wiring for /compare — exact anchors, each asserted once (or already applied)
WIRE_EDITS = {
  "for-parents.html": [
    # softened 11 Sep: no user-count claims until there are users (positioning brief §5)
    ('Many families use it instead of a $64/hr tutor; some use both. <a href="/compare" style="color:var(--brat)">See how it compares &rarr;</a></p>',
     'A month of knowhere costs less than one hour with a tutor, and the two don&#8217;t fight &#8212; plenty of families will want both. <a href="/compare" style="color:var(--brat)">See how it compares &rarr;</a></p>'),
    ('Many families use it instead of a $64/hr tutor; some use both.</p>',
     'A month of knowhere costs less than one hour with a tutor, and the two don&#8217;t fight &#8212; plenty of families will want both. <a href="/compare" style="color:var(--brat)">See how it compares &rarr;</a></p>'),
    # hero: a visible way to the comparison
    ('<a class="ghost" href="/how-it-works">See how it works</a>\n      </div>\n    </div>\n    <a class="scroll-cue" href="#par-content"',
     '<a class="ghost" href="/how-it-works">See how it works</a>\n        <a class="ghost" href="/compare">How it compares</a>\n      </div>\n    </div>\n    <a class="scroll-cue" href="#par-content"'),
  ],
  "pricing.html": [
    ('plans and prices change &mdash; always confirm on their sites.</p>',
     'plans and prices change &mdash; always confirm on their sites. <a href="/compare" style="color:var(--brat)">Full comparison, cons included &rarr;</a></p>'),
    ('plans and prices change — always confirm on their sites.</p>',
     'plans and prices change — always confirm on their sites. <a href="/compare" style="color:var(--brat)">Full comparison, cons included &rarr;</a></p>'),
  ],
  "knowhere-footer.js": [
    ("'<a class=\"kfn-link\" href=\"/know-us\">know us</a>' +",
     "'<a class=\"kfn-link\" href=\"/compare\">compare</a>' +\n                '<a class=\"kfn-link\" href=\"/know-us\">know us</a>' +"),
  ],
}

def patch_wiring():
    changed = []
    for fname, pairs in WIRE_EDITS.items():
        path = os.path.join(ROOT, fname)
        if not os.path.exists(path): print(f"  skip {fname} (not in repo)"); continue
        src = open(path, encoding="utf-8").read(); out = src
        hit = False
        for old, new in pairs:
            if new in out: hit = True; continue
            if old in out:
                assert out.count(old) == 1, f"{fname}: anchor not unique: {old[:50]!r}"
                out = out.replace(old, new, 1); hit = True
        assert hit, f"{fname}: no wiring anchor matched"
        if out != src:
            save(path, out); changed.append(fname)
    # footer cache-bust: v=20 -> v=21 on every root html
    for path in sorted(glob.glob(os.path.join(ROOT, "*.html"))):
        src = open(path, encoding="utf-8").read()
        out = src.replace("knowhere-footer.js?v=20", "knowhere-footer.js?v=21")
        if out != src:
            save(path, out); changed.append(os.path.basename(path) + " (footer v21)")
    return changed

def patch_js_logic():
    changed = []
    for fname, pairs in JS_LOGIC.items():
        path = os.path.join(ROOT, fname)
        if not os.path.exists(path): print(f"  skip {fname} (not in repo)"); continue
        src = open(path, encoding="utf-8").read(); out = src
        for old, new in pairs:
            if new in out: continue          # already applied
            assert out.count(old) == 1, f"{fname}: anchor not found exactly once: {old[:60]!r}"
            out = out.replace(old, new, 1)
        if out != src:
            save(path, out); changed.append(fname)
    return changed

SERVER_MARK = "// KNOWHERE:SEO-REDIRECTS v2"
SERVER_ANCHOR = "// ---------- static site ----------"
SERVER_SNIPPET = SERVER_MARK + r""" — canonical host + clean URLs (301). www -> apex, /x.html -> /x, /index.html -> / (http->https is Railway's job)
const SEO_PAGES = new Set(%s);
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const host = String(req.headers.host || '').toLowerCase();
  if (host !== 'knowhere.me' && host !== 'www.knowhere.me') {
    // localhost / Railway preview host: serve as-is, but keep it out of the index
    res.set('X-Robots-Tag', 'noindex');
    return next();
  }
  let p = req.path, changed = false;
  if (host === 'www.knowhere.me') changed = true;
  const m = p.match(/^\/([A-Za-z0-9-]+)(\.html)?\/?$/i);
  const slug = m ? m[1].toLowerCase() : null;
  if (p === '/index.html' || p === '/index' || p === '/index/') { p = '/'; changed = true; }
  else if (slug && SEO_PAGES.has(slug) && p !== '/' + slug) { p = '/' + slug; changed = true; }
  if (!changed) return next();
  const q = req.originalUrl.indexOf('?');
  return res.redirect(301, 'https://knowhere.me' + p + (q >= 0 ? req.originalUrl.slice(q) : ''));
});
// /KNOWHERE:SEO-REDIRECTS

""" % json.dumps(sorted(v.lstrip("/") for v in CLEAN.values() if v != "/"))

def patch_server():
    path = os.path.join(ROOT, "server.js")
    src = open(path, encoding="utf-8").read()
    if SERVER_MARK in src:
        # already patched: refresh the page set only (new pages such as /compare)
        want = "const SEO_PAGES = new Set(%s);" % json.dumps(sorted(v.lstrip("/") for v in CLEAN.values() if v != "/"))
        cur = re.findall(r"const SEO_PAGES = new Set\(.*?\);", src)
        assert len(cur) == 1, "server.js: SEO_PAGES not found exactly once"
        if cur[0] == want: return False
        save(path, src.replace(cur[0], want, 1)); return True
    assert src.count(SERVER_ANCHOR) == 1, "server.js: static-site anchor not found exactly once"
    out = src.replace(SERVER_ANCHOR, SERVER_SNIPPET + SERVER_ANCHOR, 1)
    save(path, out)
    return True

def write_sitemap():
    prio = {"/":"1.0","/how-it-works":"0.9","/experience-it":"0.9","/pricing":"0.9","/for-parents":"0.8","/for-teachers":"0.8",
            "/compare":"0.8","/mission":"0.6","/know-us":"0.6","/press":"0.6","/talk-to-us":"0.5","/privacy":"0.3","/terms":"0.3"}
    rows = []
    for f, p in PAGES.items():
        if not p["path"] or p["kind"] in ("noindex","404"): continue
        if not os.path.exists(os.path.join(ROOT, f)): continue
        u = SITE + p["path"]
        rows.append(f"  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod><priority>{prio.get(p['path'],'0.5')}</priority></url>")
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(rows) + "\n</urlset>\n"
    path = os.path.join(ROOT, "sitemap.xml")
    if open(path, encoding="utf-8").read() != xml:
        save(path, xml); return True
    return False

ROBOTS = """# knowhere.me
User-agent: *
Allow: /
Disallow: /api/

# AI assistants are welcome to read and cite the site.
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: https://knowhere.me/sitemap.xml
"""
def write_robots():
    path = os.path.join(ROOT, "robots.txt")
    if open(path, encoding="utf-8").read() != ROBOTS:
        save(path, ROBOTS); return True
    return False

# ------------------------------------------------------------------ run
def main():
    for f in ("index.html","server.js","sitemap.xml","robots.txt"):
        assert os.path.exists(os.path.join(ROOT, f)), f"run this from the knowhere-website repo root (missing {f})"
    changed = []
    for fname, p in PAGES.items():
        if not os.path.exists(os.path.join(ROOT, fname)):
            print(f"  skip {fname} (not in repo)"); continue
        tl, dl = len(p["title"]), len(p["desc"])
        flag = ("" if tl <= 60 else " TITLE>60") + ("" if dl <= 160 else " DESC>160")
        if patch_page(fname, p): changed.append(fname)
        print(f"  {fname:22s} title {tl:2d}  desc {dl:3d}{flag}")
    for js in ("knowhere-footer.js","knowhere-mobile-menu.js","knowhere-goat-card.js","knowhere-waitlist.js"):
        if patch_js(js): changed.append(js)
    changed += [f for f in patch_js_logic() if f not in changed]
    changed += [f for f in patch_wiring() if f not in changed]
    if patch_server(): changed.append("server.js")
    if write_sitemap(): changed.append("sitemap.xml")
    if write_robots(): changed.append("robots.txt")
    gi = os.path.join(ROOT, ".gitignore")
    gitxt = open(gi, encoding="utf-8").read() if os.path.exists(gi) else ""
    if "_seo-backup-*/" not in gitxt and not DRY:
        open(gi, "a", encoding="utf-8").write(("" if gitxt.endswith("\n") or not gitxt else "\n") + "_seo-backup-*/\n"); changed.append(".gitignore")
    if DRY:
        print("\nDRY RUN — would change:", ", ".join(changed) if changed else "nothing (already applied)")
        return
    print("\nchanged:", ", ".join(changed) if changed else "nothing (already applied)")
    print("backup :", BACKUP if os.path.isdir(BACKUP) else "(none needed)")
    # receipts — read back from disk
    print("\nreceipts:")
    bad = 0
    for fname, p in PAGES.items():
        path = os.path.join(ROOT, fname)
        if not os.path.exists(path): continue
        s = open(path, encoding="utf-8").read()
        ok = ("KNOWHERE:SEO-HEAD v2" in s and s.count("<title>") == 1 and s.count('name="description"') == 1
              and '<html lang="en-AU">' in s)
        if p["path"]: ok = ok and s.count('rel="canonical"') == 1
        lds = re.findall(r'<script type="application/ld\+json">\n(.*?)\n</script>', s, re.S)
        for ld in lds:
            try: json.loads(ld)
            except Exception as e: ok = False; print(f"    {fname}: JSON-LD invalid: {e}")
        leftovers = len(re.findall(r'href="(\./|/)?[a-z0-9-]+\.html', s))
        print(f"  {'OK ' if ok else 'BAD'} {fname:22s} ld+json:{len(lds)}  .html hrefs left:{leftovers}")
        bad += (not ok)
    if os.path.exists(os.path.join(ROOT, "compare.html")):
        fp = open(os.path.join(ROOT, "for-parents.html"), encoding="utf-8").read()
        ft = open(os.path.join(ROOT, "knowhere-footer.js"), encoding="utf-8").read()
        v21 = sum(1 for f in glob.glob(os.path.join(ROOT, "*.html")) if "knowhere-footer.js?v=21" in open(f, encoding="utf-8").read())
        wired = ('href="/compare"' in fp) and ('href="/compare"' in ft)
        print(f"  {'OK ' if wired else 'BAD'} /compare linked from for-parents + footer; footer v21 on {v21} pages")
    srv = open(os.path.join(ROOT, "server.js"), encoding="utf-8").read()
    print(f"  {'OK ' if SERVER_MARK in srv else 'BAD'} server.js redirects present")
    print(f"  sitemap urls: {open(os.path.join(ROOT,'sitemap.xml'),encoding='utf-8').read().count('<loc>')}")
    if bad:
        print(f"\n{bad} page(s) failed receipts — backups in {BACKUP}"); sys.exit(2)

if __name__ == "__main__":
    main()
PYEOF
KW_DRY=$DRY python3 "$TMP"
[ "$DRY" = "1" ] && exit 0
BK="$(ls -d _seo-backup-* 2>/dev/null | sort | tail -1 || true)"
for f in server.js knowhere-footer.js knowhere-mobile-menu.js knowhere-waitlist.js knowhere-goat-card.js; do
  [ -f "$f" ] || continue
  if ! node --check "$f" 2>&1; then
    echo "node --check FAILED on $f — restoring everything from $BK"
    [ -n "$BK" ] && cp "$BK"/* . && echo "restored."
    exit 1
  fi
done
echo "node --check OK: server.js + 4 nav/cta scripts"
echo
echo "next: git diff --stat   then   git add -A && git commit -m 'SEO v2: clean URLs, full heads, schema' && git push"
