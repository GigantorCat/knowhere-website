#!/usr/bin/env python3
"""for-teachers v2 (KW:TEACH-V2, 5 Nov 2026) -- builds for-teachers.html from Cat's goated mockup.

  python3 _patches/for-teachers-v2/build.py            # from the website repo root; writes for-teachers.html
  bash knowhere-seo-v2.sh                              # then re-stamp the SEO head (title/desc/og/FAQ live there)

Sources (all in this folder):
  mockup-5nov.html        the goated mockup, verbatim from https://claude.ai/artifact/SGNgoUKpo4LALit94DGHXh
  callit-keys-5nov.json   the five goated call it. keys (teach-notes.json callItKey, run:true, keyCheck ok)

The mockup's markup, CSS and page script are LIFTED, not retyped: every change below is a named, asserted
string swap, so a reworded line cannot sneak in. What changes, and why:
  * chrome: the mockup's own nav/footer/fonts/notes panel out; the site's head, nav, mobile menu, footer in.
  * CSS: scoped under .kt2 so it cannot leak into the shared footer; the mockup's kwBreathe renamed
    kt2RunBreathe (the site's nav glow already owns kwBreathe).
  * the call it. rounds: the drafts are swapped for the app's goated keys (Cat, ruled B, 5 Nov 19:18).
  * the knowscape: a poster JPG per subject paints first (ruled 16 Sep), the live widget replaces it.
  * subject from the ad (acq_ad / utm_content / subject; the #hash fallback was for the artifact viewer only).
  * Umami: subject_pill, hero_interact, callit_demo; cta_click comes from knowhere-pixel.js (data-kw-from).
"""
import json, os, re, sys, html as H

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.getcwd()
if not os.path.exists(os.path.join(ROOT, 'knowhere-seo-v2.sh')):
    sys.exit('run from the knowhere-website repo root')
MOCK = open(os.path.join(HERE, 'mockup-5nov.html'), encoding='utf8').read()
KEYS = json.load(open(os.path.join(HERE, 'callit-keys-5nov.json'), encoding='utf8'))
CUR = open(os.path.join(ROOT, 'for-teachers.html'), encoding='utf8').read()   # its stamped SEO head is kept
OLD = open(os.path.join(HERE, 'for-teachers-v1-before.html'), encoding='utf8').read()   # the v1 page: the site nav is lifted from it


def swap(s, a, b, n=1):
    c = s.count(a)
    if c != n:
        sys.exit(f'swap expected {n}x, found {c}x: {a[:90]!r}')
    return s.replace(a, b)


def between(s, a, b):
    i = s.index(a)
    j = s.index(b, i + len(a))
    return s[i + len(a):j]


# ── 1. the mockup's parts ───────────────────────────────────────────────────────────────────────────
css = between(MOCK, '<style>\n/* Layout: knowhere site system', '</style>')
css = '/* Layout: knowhere site system' + css
body = MOCK[MOCK.index('<section class="hero">'):MOCK.index('<footer><div class="wrap">')]
script = between(MOCK, '<script>\n(function(){', '})();\n</script>')

# ── 2. CSS: scope under .kt2 ───────────────────────────────────────────────────────────────────────
DROP_SEL = re.compile(r'^(\.nav\b|body::before|\.brand\b|\.links\b|footer\b|\.notes\b|\.notes-btn\b)')


def scope_sel(sel):
    sel = sel.strip()
    if sel == ':root' or sel == 'body':
        return '.kt2'
    if sel == 'html' or sel.startswith('html.kw-snap'):
        return sel
    if sel.startswith('html.kw-float'):
        return sel.replace('html.kw-float ', 'html.kw-float .kt2 ', 1)
    if sel.startswith('html '):
        return sel
    return '.kt2 ' + sel


def blocks(s):
    """split CSS into (prelude, body) top-level blocks by brace matching (comments dropped)."""
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    out, i, n = [], 0, len(s)
    while i < n:
        j = s.find('{', i)
        if j < 0:
            break
        pre = s[i:j].strip()
        d, k = 1, j + 1
        while d:
            if s[k] == '{': d += 1
            elif s[k] == '}': d -= 1
            k += 1
        out.append((pre, s[j + 1:k - 1]))
        i = k
    return out


def scope(s):
    res = []
    for pre, bod in blocks(s):
        if pre.startswith('@keyframes'):
            res.append(f'{pre}{{{bod}}}')
        elif pre.startswith('@media'):
            inner = scope(bod)
            if inner.strip():
                res.append(f'{pre}{{\n{inner}\n}}')
        else:
            sels = [x for x in pre.split(',') if not DROP_SEL.match(x.strip())]
            if not sels:
                continue
            res.append(','.join(scope_sel(x) for x in sels) + '{' + bod.strip() + '}')
    return '\n'.join(res)


css = swap(css, 'animation:kwBreathe 3.2s', 'animation:kt2RunBreathe 3.2s')
css = swap(css, '@keyframes kwBreathe{', '@keyframes kt2RunBreathe{')
CSS = scope(css)
assert 'kwBreathe' not in CSS and '.kt2 .notes' not in CSS and '.kt2 footer' not in CSS
# headings follow the site: the head lower-cases every h1-h3 (Cat, 5 Nov: consistency over the mockup's sentence case)
CSS += '\n.kt2 .offer h2.offer-t{font-size:22px;font-weight:800;line-height:1.15}'
# the purple seat button (Cat, 5 Nov: B): one step deeper than #9B5AEA so white text passes 4.5:1 (4.9:1). On hover the
# site's KW_LOGIN_HOVER turns every app link white, so the text goes the same purple there (4.9:1 on white), not white on white
CSS += ('\n.kt2 .offer .btn-primary{background:#9048E8}'
        '\n.kt2 .offer .btn-primary:hover,.kt2 .offer .btn-primary:focus-visible{color:#9048E8!important}')
# the poster: in flow (it sets the stage height) until the cropped widget is ready, then the iframe takes over
CSS += ('\n.kt2 .ks-stage .poster{position:relative;inset:auto;display:block;min-height:0}'
        '\n.kt2 .ks-stage .poster img{display:block;width:100%;height:auto}'
        '\n.kt2 .ks-stage:not(.ready) iframe{position:absolute;inset:0;height:100%!important}'
        '\n.kt2 .ks-stage{min-height:0}'
        '\n.kt2 .ci .set b{color:var(--ink);font-weight:700}')

# ── 3. the site nav (lifted from the live page), scoped to .kt2 ─────────────────────────────────────
nav_html = OLD[OLD.index('  <nav>\n    <a class="brand"'):OLD.index('  </nav>') + len('  </nav>')]
nav_html = swap(nav_html, '<a class="cta small" data-kw-cta data-kw-from="nav" href="https://app.knowhere.me/signup?as=teacher">',
                '<a class="cta small cta-seat" data-kw-cta data-kw-from="nav" href="https://app.knowhere.me/signup?as=teacher">')
nav_css_lines = [l.strip() for l in OLD.split('\n') if re.match(
    r'\s*(\.kw-tch (nav|\.mark-|\.navmark|\.brand|\.wordmark|\.cta)|@keyframes (kwBreathe|kwMarkPulse)|@media \(max-width:820px\)\{\.kw-tch nav)', l)]
NAV_CSS = '\n'.join(l.replace('.kw-tch', '.kt2') for l in nav_css_lines)
assert '.kt2 nav{' in NAV_CSS and 'kwMarkPulse' in NAV_CSS and '.kt2 .cta.small' in NAV_CSS, NAV_CSS[:400]
NAV_CSS += '\n.kt2 nav a,.kt2 nav .brand{text-decoration:none}.kt2 nav .links a{text-decoration:none}.kt2 a.cta{text-decoration:none}.kt2 nav .cta.small{white-space:nowrap}'

# ── 4. the body: named swaps only ──────────────────────────────────────────────────────────────────
b = body
# seat CTAs: tracked by knowhere-pixel.js (cta_click, from = data-kw-from)
b = swap(b, '<a class="btn btn-primary cta-seat" href="https://app.knowhere.me/signup?as=teacher">claim your founding seat</a>\n        <span class="fine">50 founding seats · free until Fri 9 April 2027</span>',
         '<a class="btn btn-primary cta-seat" data-kw-cta data-kw-from="hero" href="https://app.knowhere.me/signup?as=teacher">claim your founding seat</a>\n        <span class="fine">50 founding seats · free until Fri 9 April 2027</span>')
b = swap(b, '<div><a class="btn btn-primary cta-seat" href="https://app.knowhere.me/signup?as=teacher">claim your founding seat</a></div>',
         '<div><a class="btn btn-primary cta-seat" data-kw-cta data-kw-from="inbox" href="https://app.knowhere.me/signup?as=teacher">claim your founding seat</a></div>')
b = swap(b, '<a class="btn btn-primary cta-seat" href="https://app.knowhere.me/signup?as=teacher">claim your founding seat</a>\n        <span class="fine">50 founding seats · free until Fri 9 April 2027 · <a',
         '<a class="btn btn-primary cta-seat" data-kw-cta data-kw-from="final" href="https://app.knowhere.me/signup?as=teacher">claim your founding seat</a>\n        <span class="fine">50 founding seats · free until Fri 9 April 2027 · <a')
assert b.count('data-kw-from=') == 3 and b.count('cta-seat') == 3
# the pre-JS default is Physics (no ad tag), so the first paint names the photon model, not the mockup's placeholder
b = swap(b, '<span class="sub"><b id="ks-subject">Physics</b> · <span id="ks-concept">Projectile motion</span></span>',
         '<span class="sub"><b id="ks-subject">Physics</b> · <span id="ks-concept">Photon model of light</span></span>')
b = swap(b, '<a id="ks-link" href="https://knowhere.me/hsc/physics/projectile-motion" target="_blank" rel="noopener">',
         '<a id="ks-link" href="/hsc/physics/photon-model-of-light" target="_blank" rel="noopener">')
b = swap(b, '<span id="ci-concept">Projectile motion · Physics</span>', '<span id="ci-concept">Photon model of light · Physics</span>')
# the poster (ruled 16 Sep: the first screen paints before any JS) -- swapped per subject by the page script
POSTER_ALT = 'Photon model of light, a live knowhere concept: change the frequency and the brightness of the light and watch what each photon carries.'
b = swap(b, '<div class="poster">loading the model</div>',
         '<div class="poster" id="ks-poster"><picture><source id="ks-poster-m" media="(max-width:751px)" srcset="/for-teachers-ks-physics-m.jpg?v=1">'
         f'<img id="ks-poster-d" src="/for-teachers-ks-physics-d.jpg?v=1" alt="{H.escape(POSTER_ALT)}" loading="eager"></picture></div>')
# heading order (Lighthouse a11y): the hero offer title follows the h1, so it is an h2, styled exactly as the mockup's h3
b = swap(b, '<h3>Free until 9 April. No card.</h3>', '<h2 class="offer-t">Free until 9 April. No card.</h2>')
# site-relative links (same pages, so they also work on a local server)
b = b.replace('href="https://knowhere.me/', 'href="/')
assert 'https://knowhere.me/' not in b, 'absolute site link left'

# ── 5. the call it. rounds: the app's goated keys, shown in the page's own display ─────────────────
def what_if(k):  # the app's tWhatIfClause: "What if " + clause + "?"
    s = re.sub(r'^what if\s+', '', k['whatIf'].strip(), flags=re.I)
    s = re.sub(r'[.?!]+$', '', s).strip()
    if re.match(r'^[A-Z][a-z]', s):
        s = s[0].lower() + s[1:]
    return 'What if ' + s + '?'


def opt_num(k, oid):  # the app's tOptNum: the room sees 1 2 3, never A B C
    return [o['id'] for o in k['options']].index(oid) + 1


def js(s):  # a JS string literal in double quotes (apostrophes never break the script)
    return json.dumps(s, ensure_ascii=False)


ROUND = {}
for subj, rec in KEYS.items():
    k = rec['key']
    lead = 'The real trick '
    if not k['trick'].startswith(lead):
        sys.exit(f'{subj}: trick does not open with "The real trick" -- the page label would double it')
    ROUND[subj] = dict(
        setHtml=H.escape(k['situation'], quote=False) + ' <b>Your mission:</b> ' + H.escape(k['mission'], quote=False),
        q=H.escape(what_if(k), quote=False),
        opts=[H.escape(o['text'], quote=False) for o in k['options']],
        right=opt_num(k, k['right']), sus=opt_num(k, k['impostor']),
        con='“' + k['impostorLine'] + '”',
        trick=k['trick'][len(lead):],   # the page prints "The real trick" in bold, then this: the key's sentence, whole
        watch=k['reveal']['say'])

s = script
# replace each subject's draft fields (set .. watch) with the key; label/concept/url/widget stay
for subj in ['physics', 'chemistry', 'biology', 'psychology', 'maths']:
    m = re.search(r"(\n    " + subj + r":\{label:'[^']*',concept:'[^']*',url:'[^']*',widget:'[^']*',)\n      set:.*?watch:'.*?'\}", s, re.S)
    if not m:
        sys.exit('no SUBJECTS entry for ' + subj)
    R = ROUND[subj]
    rep = (m.group(1) + '\n      set:' + js(R['setHtml']) + ',\n      q:' + js(R['q']) + ',\n      opts:[' + ','.join(js(o) for o in R['opts'])
           + '],right:' + str(R['right']) + ',sus:' + str(R['sus']) + ',\n      con:' + js(R['con']) + ',\n      trick:' + js(R['trick'])
           + ',\n      watch:' + js(R['watch']) + ',\n      key:' + js(KEYS[subj]['id']) + '}')
    s = s[:m.start()] + rep + s[m.end():]
# the photon page exists now (built through build-concept-pages.mjs); the other four were already public
s = swap(s, "url:'https://knowhere.me/vce/physics/'", "url:'/hsc/physics/photon-model-of-light'")
s = s.replace("url:'https://knowhere.me/", "url:'/")
s = re.sub(r"widget:'widgets/", "widget:'/widgets/", s)
# the posters, one pair per subject (captured from the cropped state by shoot-posters.js)
s = swap(s, "  var ORDER = ['physics','chemistry','biology','psychology','maths'];",
         "  var ORDER = ['physics','chemistry','biology','psychology','maths'];\n"
         "  var POSTER = function(k, sz){ return '/for-teachers-ks-' + k + '-' + sz + '.jpg?v=1'; };")
# subject from the ad: no #hash fallback on the real page (that was only for the artifact viewer)
s = swap(s, "p.get('acq_ad')||p.get('utm_content')||p.get('subject')||location.hash.slice(1)||''", "p.get('acq_ad')||p.get('utm_content')||p.get('subject')||''")
# Umami: subject_pill on a tap (never on the boot pre-select)
s = swap(s, "b.addEventListener('click', function(){ setSubject(k); });",
         "b.addEventListener('click', function(){ if (k === current) return; kwTrack('subject_pill', {subject:k}); setSubject(k); });")
s = swap(s, "  function fromAd(){",
         "  function kwTrack(name, data){ try{ if (window.umami){ data = data || {}; data.page = location.pathname; window.umami.track(name, data); } }catch(e){} }\n  function fromAd(){")
# hero_interact: the first touch inside the cropped widget, once per page view, tagged with the subject
s = swap(s, "      cropDone = true; kick();",
         "      cropDone = true; kick();\n"
         "      try{ var hi = function(via){ if (heroSent) return; heroSent = true; kwTrack('hero_interact', {widget:current, via:via, after_s:Math.round((window.performance&&performance.now?performance.now():0)/1000)}); };\n"
         "        d.addEventListener('pointerdown', function(){ hi('pointer'); }, {passive:true, capture:true});\n"
         "        d.addEventListener('touchstart', function(){ hi('touch'); }, {passive:true, capture:true});\n"
         "        d.addEventListener('keydown', function(){ hi('key'); }, true); }catch(e){}")
s = swap(s, "  var cropDone = false;", "  var cropDone = false, heroSent = false;")
# setSubject: posters swap with the subject; seat CTAs keep any utm the page added and carry subject=<key>
s = swap(s, "    stage.classList.remove('ready'); cropDone = false; frame.src = S.widget;",
         "    stage.classList.remove('ready'); cropDone = false;\n"
         "    try{ document.getElementById('ks-poster-m').srcset = POSTER(k,'m'); var pd = document.getElementById('ks-poster-d'); pd.src = POSTER(k,'d'); pd.alt = S.concept + ', a live knowhere concept.'; }catch(e){}\n"
         "    frame.src = S.widget; frame.title = S.concept + ' — a live knowhere concept';")
s = swap(s, "    Array.prototype.forEach.call(document.querySelectorAll('.cta-seat'), function(a){ a.href = 'https://app.knowhere.me/signup?as=teacher&subject=' + k; });",
         "    Array.prototype.forEach.call(document.querySelectorAll('.cta-seat'), function(a){ try{ var u = new URL(a.href, location.href); u.searchParams.set('as','teacher'); u.searchParams.set('subject', k); a.href = u.toString(); }catch(e){ a.href = 'https://app.knowhere.me/signup?as=teacher&subject=' + k; } });")
# the set line carries the key's mission with its label, as the app shows it
s = swap(s, "document.getElementById('ci-set').textContent = S.set;", "document.getElementById('ci-set').innerHTML = S.set;")
# callit_demo: the call, then the reveal
s = swap(s, "      b.addEventListener('click', function(){ Array.prototype.forEach.call(wrap.children,function(c){c.setAttribute('aria-pressed','false');}); b.setAttribute('aria-pressed','true'); });",
         "      b.addEventListener('click', function(){ Array.prototype.forEach.call(wrap.children,function(c){c.setAttribute('aria-pressed','false');}); b.setAttribute('aria-pressed','true'); myCall = String(i+1); kwTrack('callit_demo', {step:'call', call:myCall, subject:k}); });")
s = swap(s, "    ci.classList.remove('revealed');", "    ci.classList.remove('revealed'); myCall = '';")
s = swap(s, "  var ci = document.getElementById('ci');", "  var ci = document.getElementById('ci'), myCall = '';")
s = swap(s, "document.getElementById('ci-reveal-btn').addEventListener('click', function(){ ci.classList.add('revealed'); });",
         "document.getElementById('ci-reveal-btn').addEventListener('click', function(){ ci.classList.add('revealed'); kwTrack('callit_demo', {step:'reveal', call:myCall, subject:current}); });")
# the 1.8 s fallback shows an uncroppable widget whole, but never swaps the poster for a frame that did not load a widget
s = swap(s, "setTimeout(function(){ stage.classList.add('ready'); },1800); });",
         "setTimeout(function(){ try{ var fd = frame.contentDocument; if (fd && fd.querySelector('canvas,svg,input,button')) stage.classList.add('ready'); }catch(e){} },1800); });")
# a load's retry timers belong to that load: a pill tapped mid-load must not let the old page's timers mark the crop done
s = swap(s, "  frame.addEventListener('load', function(){ crop(); setTimeout(crop,300); setTimeout(crop,1200); setTimeout(function(){ try{",
         "  var loadGen = 0;\n  frame.addEventListener('load', function(){ var g = loadGen; var mine = function(fn){ return function(){ if (g === loadGen) fn(); }; }; crop(); setTimeout(mine(crop),300); setTimeout(mine(crop),1200); setTimeout(mine(function(){ try{")
s = swap(s, "if (fd && fd.querySelector('canvas,svg,input,button')) stage.classList.add('ready'); }catch(e){} },1800); });",
         "if (fd && fd.querySelector('canvas,svg,input,button')) stage.classList.add('ready'); }catch(e){} }),1800); });")
s = swap(s, "    stage.classList.remove('ready'); cropDone = false;\n", "    loadGen++; stage.classList.remove('ready'); cropDone = false;\n")
# the mockup's footer year + notes panel are gone
s = swap(s, "  document.getElementById('yr').textContent = new Date().getFullYear();\n", '')
s = re.sub(r"  var nb = document.getElementById\('notes-btn'\).*?\n.*?\n", '', s)
assert 'notes' not in s and "getElementById('yr')" not in s and 'location.hash' not in s
for k in ['physics', 'chemistry', 'biology', 'psychology', 'maths']:
    assert ('key:"' + KEYS[k]['id'] + '"') in s, k

ENGINE = ("window.KWTeachersV2 = function(root){\n  if (!root || root.__kt2) return function(){};\n  root.__kt2 = true;\n"
          "(function(){" + s + "})();\n  return function(){};\n};")

# ── 6. the page ────────────────────────────────────────────────────────────────────────────────────
head = CUR[:CUR.index('<script src="./vendor-resources.js"></script>')]
head = head.replace('<script defer src="./knowhere-pixel.js?v=3"></script>', '<script defer src="./knowhere-pixel.js?v=5"></script>')  # v5: the for-teachers gate
assert 'knowhere-pixel.js?v=5' in head
head += ('<script src="./vendor-resources.js"></script>\n<script src="./support.js"></script>\n'
         + OLD[OLD.index('<style>h1,h2,h3{text-transform:lowercase}'):OLD.index('</head>')] + '</head>\n')

PAGE = f'''{head}<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<script src="./knowhere-marks.js?v=2"></script>
<script src="./knowhere-goo.js?v=6"></script>
<script src="./knowhere-page.js?v=3"></script>
<script>window.KNOWHERE_LIVE=true</script>
</helmet>
<style id="KW_TEACH_V2">
/* KW:TEACH-V2 (5 Nov 2026) · for-teachers v2, Cat's goated mockup (_patches/for-teachers-v2/). Built by build.py, do not hand-edit. */
{NAV_CSS}
{CSS}
</style>

<div class="kt2">

{nav_html}

{b.rstrip()}

</div><!-- /.kt2 -->

<x-import component-from-global-scope="knowhere-footer-nav" from="./knowhere-footer.js?v=26"></x-import>

</x-dc>
<script type="text/x-dc" data-dc-script data-props="{{&quot;$preview&quot;:{{&quot;width&quot;:1040,&quot;height&quot;:820}}}}">
class Component extends DCLogic {{
  componentDidMount(){{
    const boot=()=>{{
      const root=document.querySelector('.kt2');
      if(!root||!window.KnowherePage){{ return setTimeout(boot,50); }}
      window.KnowherePage.injectLogo(root);
      if(window.KWTeachersV2) this._stop=window.KWTeachersV2(root);
    }};
    boot();
  }}
  componentWillUnmount(){{ if(this._stop) this._stop(); }}
}}
</script>

<script>
/* ══ knowhere · for-teachers v2 page engine (KW:TEACH-V2) ══ the mockup's page script, verbatim apart from the
   swaps named in _patches/for-teachers-v2/build.py. Call it. rounds: the app's goated keys (teach-notes.json). */
{ENGINE}
</script>
<script src="./knowhere-mobile-menu.js?v=8" defer></script>
</body>
</html>
'''
open(os.path.join(ROOT, 'for-teachers.html'), 'w', encoding='utf8').write(PAGE)
back = open(os.path.join(ROOT, 'for-teachers.html'), encoding='utf8').read()
assert back == PAGE
print(f'for-teachers.html written · {len(PAGE)} bytes · css {len(CSS)} · engine {len(ENGINE)}')
for subj, R in ROUND.items():
    print(f"  {subj:<10} key {KEYS[subj]['id']}  right {R['right']} sus {R['sus']}  q {len(R['q'])}c  set {len(R['setHtml'])}c  trick {len(R['trick'])}c")
