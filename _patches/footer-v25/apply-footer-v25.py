#!/usr/bin/env python3
"""Footer v25 + for-teachers fixes (Cat, 13 Oct 2026, from her phone screenshots).

knowhere-footer.js (footer nav, every page):
  - tagline "from nowhere to knowing." lighter (#9b9a96, 13px) and out of the legal row:
    under the logo on desktop, beside it on phones
  - links on ONE row with | separators (13px on phones, 12px under 360px)
  - socials in brat green
  - bottom row = privacy / terms of use / (c) year, with the VCAA acknowledgement
    underneath, word for word, on every page. A page that already carries its own
    [data-kw-vcaa] block (the VCE concept pages) gets that block hidden once the
    footer's copy has rendered, so it never shows twice (no JS = the page's own copy stays)
  - link colours can't be overridden by page CSS any more (home's `.kp a` made them green)
  - legal greys lifted from #56554f to #8C8B87 (contrast)
for-teachers.html:
  - the footer was unreachable: html{scroll-snap-type:y mandatory} snapped back before it.
    Now proximity (doctrine) and the footer is a snap target (.foot-snap, already defined)
  - "what's in the box" cards were 688px wide on phones: grid track now minmax(0,1fr)
Bumps knowhere-footer.js?v=24 -> ?v=25 in every page + generators.

Dry run by default; --apply backs up every touched file to ../_backups/footer-v25-<ts>/,
writes, runs node --check, reads receipts back from disk, restores on any failure.
Idempotent on KW:FOOT-V25.
"""
import os, sys, shutil, subprocess, time

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
APPLY = '--apply' in sys.argv
MARK = 'KW:FOOT-V25'
FOOT = os.path.join(ROOT, 'knowhere-footer.js')
TCH = os.path.join(ROOT, 'for-teachers.html')

def between(src, a, b):
    assert src.count(a) == 1, 'anchor A count %d: %s' % (src.count(a), a[:60])
    i = src.index(a) + len(a)
    assert src.count(b) == 1, 'anchor B count %d: %s' % (src.count(b), b[:60])
    j = src.index(b)
    assert j > i
    return i, j

STYLE = r"""'@keyframes kfnSpectrum{0%{background-position:0% 50%}100%{background-position:200% 50%}}' +
            /* KW:FOOT-V25 (Cat, 13 Oct 2026): every rule is scoped to knowhere-footer-nav so page CSS (home's .kp a, .kw-tch *) can't recolour or re-pad it */
            'knowhere-footer-nav .kfn-in{padding:64px 34px 36px}' +
            'knowhere-footer-nav .kfn-rows{position:relative;isolation:isolate;margin-top:auto;padding-top:12px}' +
            /* home only: its page-wide brain runs behind the footer, so fade it out above the rows (full bleed, clipped by the footer) */
            'knowhere-footer-nav[data-kfn-index] .kfn-rows::before{content:"";position:absolute;z-index:-1;left:-100vmax;right:-100vmax;top:-140px;bottom:-240px;background:linear-gradient(to bottom,rgba(7,7,8,0),#070708 140px);pointer-events:none}' +
            'knowhere-footer-nav .kfn-top{display:flex;align-items:center;gap:24px 44px;flex-wrap:wrap}' +
            'knowhere-footer-nav .kfn-brand{display:flex;flex-direction:column;align-items:flex-start;gap:8px}' +
            'knowhere-footer-nav .kfn-mark{display:flex;align-items:center;gap:10px}' +
            'knowhere-footer-nav .kfn-tag{font-size:13px;line-height:1.3;color:#9b9a96;letter-spacing:-0.005em}' +
            'knowhere-footer-nav .kfn-links{display:flex;align-items:center;flex-wrap:nowrap}' +
            'knowhere-footer-nav a.kfn-link{font-size:15px;font-weight:600;letter-spacing:-0.01em;color:#9b9a96;text-decoration:none;white-space:nowrap;transition:color .16s}' +
            'knowhere-footer-nav a.kfn-link:hover,knowhere-footer-nav a.kfn-link:focus-visible{color:#7BEA5A}' +
            'knowhere-footer-nav .kfn-sep{color:rgba(237,236,232,0.22);font-size:14px;padding:0 14px;user-select:none}' +
            'knowhere-footer-nav .kfn-socs{display:flex;align-items:center;gap:2px;margin-left:auto}' +
            'knowhere-footer-nav a.kfn-soc{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:10px;color:#7BEA5A;text-decoration:none;transition:color .16s,background .16s}' +
            'knowhere-footer-nav a.kfn-soc:hover,knowhere-footer-nav a.kfn-soc:focus-visible{color:#A9F293;background:rgba(123,234,90,.10)}' +
            'knowhere-footer-nav a.kfn-soc:focus-visible{outline:2px solid #7BEA5A;outline-offset:2px}' +
            'knowhere-footer-nav .kfn-soc i{display:block;width:17px;height:17px;background:currentColor;-webkit-mask:var(--ico) center/contain no-repeat;mask:var(--ico) center/contain no-repeat}' +
            'knowhere-footer-nav .kfn-bottom{display:flex;flex-direction:column;gap:12px;margin-top:22px;padding-top:22px;border-top:1px solid rgba(255,255,255,0.06)}' +
            'knowhere-footer-nav .kfn-legalrow{display:flex;align-items:center;gap:8px 20px;flex-wrap:wrap}' +
            'knowhere-footer-nav .kfn-legal{font-size:12px;color:#8C8B87;text-decoration:none;transition:color .16s}' +
            'knowhere-footer-nav a.kfn-legal:hover{color:#EDECE8}' +
            'knowhere-footer-nav .kfn-ack{font-size:12px;line-height:1.6;color:#8C8B87;max-width:120ch}' +
            'knowhere-footer-nav .kfn-ack a{color:inherit;text-decoration:underline;text-underline-offset:2px}' +
            'knowhere-footer-nav .kfn-ack a:hover{color:#EDECE8}' +
            '@media (max-width:640px){' +
              'knowhere-footer-nav .kfn-in{padding:56px 24px 28px}' +
              'knowhere-footer-nav .kfn-top{flex-direction:column;align-items:flex-start;gap:22px}' +
              'knowhere-footer-nav .kfn-brand{flex-direction:row;align-items:center;flex-wrap:wrap;gap:6px 14px}' +
              'knowhere-footer-nav .kfn-tag{font-size:12.5px}' +
              'knowhere-footer-nav a.kfn-link{font-size:13px}' +
              'knowhere-footer-nav .kfn-sep{font-size:12px;padding:0 8px}' +
              'knowhere-footer-nav .kfn-socs{margin-left:-11px}' +
              'knowhere-footer-nav[data-kfn-index] .kfn-rows::before{top:-90px;background:linear-gradient(to bottom,rgba(7,7,8,0),#070708 90px)}' +
            '}' +
            '@media (max-width:360px){' +
              'knowhere-footer-nav a.kfn-link{font-size:12px}' +
              'knowhere-footer-nav .kfn-sep{padding:0 6px}' +
            '}';
"""

LINKS = [('/compare', 'compare'), ('/know-us', 'know us'), ('/mission', 'mission'), ('/press', 'press'), ('/talk-to-us', 'talk to us')]
SEP = "'<span class=\"kfn-sep\" aria-hidden=\"true\">|</span>' +\n                  "
LINK_JS = SEP.join("'<a class=\"kfn-link\" href=\"%s\">%s</a>' +\n                  " % l for l in LINKS)

ROWS = r"""'<div class="kfn-rows">' +
              '<div class="kfn-top">' +
                '<div class="kfn-brand">' +
                  '<span class="kfn-mark"><span data-kfn-logo style="display:flex;align-items:center;color:#EDECE8"></span><span style="font-size:18px;font-weight:700;letter-spacing:-0.04em;color:#EDECE8">know<b style="color:#7BEA5A">here</b><sup style="font-size:0.48em;font-weight:600;letter-spacing:0;vertical-align:super;opacity:0.55;margin-left:1px">™</sup></span></span>' +
                  '<span class="kfn-tag">from nowhere to knowing.</span>' +
                '</div>' +
                '<div class="kfn-links">' +
                  """ + LINK_JS + r"""'</div>' +
                (window.KnowhereMarks && window.KnowhereMarks.socialHtml ? '<span class="kfn-socs">' + window.KnowhereMarks.socialHtml('kfn-soc') + '</span>' : '') +
              '</div>' +
              '<div class="kfn-bottom">' +
                '<div class="kfn-legalrow">' +
                  '<a class="kfn-legal" href="/privacy">privacy</a>' +
                  '<a class="kfn-legal" href="/terms">terms of use</a>' +
                  '<span class="kfn-legal" style="cursor:default">© ' + new Date().getFullYear() + ' knowhere™</span>' +
                '</div>' +
                /* the VCAA licence condition (Julie, 3 Oct 2026): visible where students see it, word for word, as text */
                '<div class="kfn-ack" data-kfn-vcaa>VCE Study Design extracts used by permission, © VCAA. VCE® is a registered trademark of the VCAA. The VCAA does not endorse or make any warranties regarding this study resource. Current VCE Study Designs, past VCE exams and related content can be accessed directly at <a href="https://www.vcaa.vic.edu.au" target="_blank" rel="noopener">www.vcaa.vic.edu.au</a>.</div>' +
              '</div>' +
              '</div>' +
            '</div>' +
          '</div>';
"""

FOOT_EDITS = [
    ("        this._onIndex = !!document.querySelector('[data-screen-label=\"IYKYK banner\"]');\n",
     "        this._onIndex = !!document.querySelector('[data-screen-label=\"IYKYK banner\"]');\n"
     "        if (this._onIndex) this.setAttribute('data-kfn-index', '');\n"),
    # the inner wrapper: padding moves to the class so phones can change it without !important
    ("'<div class=\"kfn-in\" style=\"position:relative;z-index:1;max-width:1180px;margin:0 auto;padding:64px 34px 36px;width:100%;",
     "'<div class=\"kfn-in\" style=\"position:relative;z-index:1;max-width:1180px;margin:0 auto;width:100%;"),
    # hide the page's own VCAA block once ours is on screen
    ("        window.kwMirrorCta && window.kwMirrorCta(this.querySelector('[data-kf-nav-cta]'), null);\n",
     "        window.kwMirrorCta && window.kwMirrorCta(this.querySelector('[data-kf-nav-cta]'), null);\n"
     "        /* KW:FOOT-V25: the footer carries the VCAA line now; a page's own copy (VCE concept pages) steps aside so it shows once */\n"
     "        try { if (this.querySelector('[data-kfn-vcaa]')) document.querySelectorAll('[data-kw-vcaa]').forEach(function (el) { el.hidden = true; }); } catch (e) {}\n"),
    ("// v24: phone layout for the footer nav",
     "// v25: footer nav redesign (KW:FOOT-V25, Cat 13 Oct 2026): tagline by the logo, links on one row with | separators, green socials,\n"
     "//      legal row + the VCAA acknowledgement on every page; styles scoped to knowhere-footer-nav. Pages load knowhere-footer.js?v=25.\n"
     "// v24: phone layout for the footer nav"),
]

TCH_EDITS = [
    ("html{scroll-snap-type:y mandatory} html{scroll-padding-top:61px}",
     "html{scroll-snap-type:y proximity} html{scroll-padding-top:61px}"),
    ("  <x-import component-from-global-scope=\"knowhere-footer-nav\" from=\"./knowhere-footer.js?v=24\"></x-import>",
     "  <div class=\"foot-snap\"><x-import component-from-global-scope=\"knowhere-footer-nav\" from=\"./knowhere-footer.js?v=24\"></x-import></div><!-- KW:FOOT-V25 footer is a snap target -->"),
    (".kw-tch .stack-cards{display:grid;width:100%;justify-items:start}",
     ".kw-tch .stack-cards{display:grid;grid-template-columns:minmax(0,1fr);width:100%;justify-items:start} /* KW:FOOT-V25 cards fit the phone */"),
]

def transform_footer(src):
    a, b = between(src, "          st.textContent =\n", "          document.head.appendChild(st);")
    src = src[:a] + "            " + STYLE.lstrip() + src[b:]
    a2 = "        this.innerHTML =\n          '<div style=\"position:relative;border-top"
    assert src.count(a2) == 1
    start = src.index("'<div class=\"kfn-row\"", src.index(a2))
    end_anchor = "        window.kwMirrorCta && window.kwMirrorCta(this.querySelector('[data-kf-nav-cta]'), null);"
    end = src.index(end_anchor)
    src = src[:start] + ROWS.lstrip() + src[end:]
    for old, new in FOOT_EDITS:
        assert src.count(old) == 1, 'footer anchor %d: %s' % (src.count(old), old[:60])
        src = src.replace(old, new, 1)
    return src

def pages():
    out = []
    for d, dirs, files in os.walk(ROOT):
        dirs[:] = [x for x in dirs if x not in ('.git', 'node_modules', '_to_delete', '_patches', 'Claude outputs', 'Press')]
        for f in files:
            if f.endswith(('.html', '.mjs', '.sh')) and '.bak' not in f:
                p = os.path.join(d, f)
                if 'knowhere-footer.js?v=24' in open(p, encoding='utf-8', errors='ignore').read():
                    out.append(p)
    return out

fsrc = open(FOOT, encoding='utf-8').read()
if MARK in fsrc:
    print('already applied (KW:FOOT-V25 present) - nothing to do'); sys.exit(0)
assert 'KW:FOOT-MOBILE' in fsrc, 'v24 (KW:FOOT-MOBILE) must be applied first'
fnew = transform_footer(fsrc)
tsrc = open(TCH, encoding='utf-8').read()
tnew = tsrc
for old, new in TCH_EDITS:
    assert tnew.count(old) == 1, 'for-teachers anchor %d: %s' % (tnew.count(old), old[:60])
    tnew = tnew.replace(old, new, 1)
targets = pages()
assert TCH in targets
print('footer: rebuilt style + rows, %d edits ok' % len(FOOT_EDITS))
print('for-teachers: %d edits ok' % len(TCH_EDITS))
print('files to bump ?v=24 -> ?v=25: %d' % len(targets))
if not APPLY:
    print('DRY RUN - re-run with --apply'); sys.exit(0)

ts = time.strftime('%Y%m%d-%H%M%S')
bk = os.path.join(os.path.dirname(ROOT), '_backups', 'footer-v25-' + ts)
touched = [FOOT] + targets
for p in touched:
    dst = os.path.join(bk, os.path.relpath(p, ROOT)); os.makedirs(os.path.dirname(dst), exist_ok=True); shutil.copy2(p, dst)
def restore():
    for p in touched:
        shutil.copy2(os.path.join(bk, os.path.relpath(p, ROOT)), p)
    print('RESTORED from', bk)
try:
    open(FOOT, 'w', encoding='utf-8').write(fnew)
    open(TCH, 'w', encoding='utf-8').write(tnew)
    for p in targets:
        s = open(p, encoding='utf-8').read()
        open(p, 'w', encoding='utf-8').write(s.replace('knowhere-footer.js?v=24', 'knowhere-footer.js?v=25'))
    r = subprocess.run(['node', '--check', FOOT], capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr); restore(); sys.exit(1)
    back = open(FOOT, encoding='utf-8').read()
    assert MARK in back and back.count('data-kfn-vcaa') == 2 and back.count('class="kfn-sep"') == 4
    tb = open(TCH, encoding='utf-8').read()
    assert 'scroll-snap-type:y proximity' in tb and 'class="foot-snap"' in tb and 'minmax(0,1fr)' in tb
    left = [p for p in targets if 'knowhere-footer.js?v=24' in open(p, encoding='utf-8').read()]
    assert not left, left
    print('APPLIED. node --check ok. %d files on ?v=25. backup: %s' % (len(targets), bk))
except Exception as e:
    print('FAILED:', repr(e)); restore(); sys.exit(1)
