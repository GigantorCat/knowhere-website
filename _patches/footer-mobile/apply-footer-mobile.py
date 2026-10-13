#!/usr/bin/env python3
"""Footer nav: phone layout (Cat, 13 Oct 2026).
At <=640px the brand, links and socials stop sharing one wrapping row:
brand on its own line, links in two even columns, socials under them aligned
to the text edge, then the tagline, then privacy / terms / (c) on one line.
Desktop is untouched (the links wrapper is display:contents there).
Also bumps knowhere-footer.js?v=23 -> ?v=24 in every page + the generators so
phones fetch the new file.

Dry run by default. --apply writes, after backing up every touched file to
../_backups/footer-mobile-<ts>/ (outside the repo). Runs node --check on the
footer and restores everything if it fails. Idempotent on KW:FOOT-MOBILE.
"""
import os, sys, shutil, subprocess, time

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
APPLY = '--apply' in sys.argv
MARK = 'KW:FOOT-MOBILE'
FOOT = os.path.join(ROOT, 'knowhere-footer.js')

EDITS = [
    # 1. stylesheet: phone rules
    ("'.kfn-soc i{display:block;width:17px;height:17px;background:currentColor;-webkit-mask:var(--ico) center/contain no-repeat;mask:var(--ico) center/contain no-repeat}';",
     "'.kfn-soc i{display:block;width:17px;height:17px;background:currentColor;-webkit-mask:var(--ico) center/contain no-repeat;mask:var(--ico) center/contain no-repeat}' +\n"
     "            /* KW:FOOT-MOBILE (Cat, 13 Oct 2026): phone layout. Inline styles win over classes, hence !important. */\n"
     "            '.kfn-links{display:contents}' +\n"
     "            '@media (max-width:640px){' +\n"
     "              '.kfn-in{padding-top:56px!important;padding-bottom:28px!important}' +\n"
     "              '.kfn-row{flex-direction:column;align-items:flex-start!important;gap:0!important}' +\n"
     "              '.kfn-brand{margin:0 0 26px!important}' +\n"
     "              '.kfn-links{display:grid;grid-template-columns:1fr 1fr;gap:16px 24px;width:100%}' +\n"
     "              '.kfn-socs{margin:22px 0 0 -11px}' +\n"
     "              '.kfn-legalrow{gap:10px 20px!important;margin-top:26px!important;padding-top:22px!important}' +\n"
     "              '.kfn-tag{flex-basis:100%}' +\n"
     "              '.kfn-sp{display:none}' +\n"
     "            '}';"),
    # 2. hooks on the markup
    ("'<div style=\"position:relative;z-index:1;max-width:1180px;margin:0 auto;padding:64px 34px 36px;",
     "'<div class=\"kfn-in\" style=\"position:relative;z-index:1;max-width:1180px;margin:0 auto;padding:64px 34px 36px;"),
    ("'<div style=\"display:flex;align-items:center;gap:30px;flex-wrap:wrap;margin-top:auto;padding-top:12px\">' +",
     "'<div class=\"kfn-row\" style=\"display:flex;align-items:center;gap:30px;flex-wrap:wrap;margin-top:auto;padding-top:12px\">' +"),
    ("'<span style=\"display:flex;align-items:center;gap:10px;margin-right:14px\"><span data-kfn-logo",
     "'<span class=\"kfn-brand\" style=\"display:flex;align-items:center;gap:10px;margin-right:14px\"><span data-kfn-logo"),
    ("'<a class=\"kfn-link\" href=\"/compare\">compare</a>' +",
     "'<span class=\"kfn-links\"><a class=\"kfn-link\" href=\"/compare\">compare</a>' +"),
    ("'<a class=\"kfn-link\" href=\"/talk-to-us\">talk to us</a>' +",
     "'<a class=\"kfn-link\" href=\"/talk-to-us\">talk to us</a></span>' +"),
    ("'<div style=\"display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:22px;padding-top:26px;border-top:1px solid rgba(255,255,255,0.06)\">' +",
     "'<div class=\"kfn-legalrow\" style=\"display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:22px;padding-top:26px;border-top:1px solid rgba(255,255,255,0.06)\">' +"),
    ("'<span class=\"kfn-legal\" style=\"cursor:default\">from nowhere to knowing.</span>' +",
     "'<span class=\"kfn-legal kfn-tag\" style=\"cursor:default\">from nowhere to knowing.</span>' +"),
    ("'<span style=\"flex:1\"></span>' +\n                '<a class=\"kfn-legal\" href=\"/privacy\">privacy</a>' +",
     "'<span class=\"kfn-sp\" style=\"flex:1\"></span>' +\n                '<a class=\"kfn-legal\" href=\"/privacy\">privacy</a>' +"),
    ("// v24: the © year",
     "// v24: phone layout for the footer nav (KW:FOOT-MOBILE, Cat 13 Oct 2026); pages load knowhere-footer.js?v=24.\n// v24: the © year"),
]

def pages():
    out = []
    for d, dirs, files in os.walk(ROOT):
        dirs[:] = [x for x in dirs if x not in ('.git', 'node_modules', '_to_delete', '_patches', 'Claude outputs', 'Press')]
        for f in files:
            if f.endswith(('.html', '.mjs', '.sh')) and '.bak' not in f:
                p = os.path.join(d, f)
                if 'knowhere-footer.js?v=23' in open(p, encoding='utf-8', errors='ignore').read():
                    out.append(p)
    return out

src = open(FOOT, encoding='utf-8').read()
if MARK in src:
    print('already applied (KW:FOOT-MOBILE present) - nothing to do'); sys.exit(0)
new = src
for old, rep in EDITS:
    n = new.count(old)
    assert n == 1, 'anchor count %d for: %s' % (n, old[:70])
    new = new.replace(old, rep, 1)
targets = pages()
print('footer: %d edits ok' % len(EDITS))
print('pages/generators to bump ?v=23 -> ?v=24: %d' % len(targets))
if not APPLY:
    print('DRY RUN - re-run with --apply'); sys.exit(0)

ts = time.strftime('%Y%m%d-%H%M%S')
bk = os.path.join(os.path.dirname(ROOT), '_backups', 'footer-mobile-' + ts)
for p in [FOOT] + targets:
    dst = os.path.join(bk, os.path.relpath(p, ROOT)); os.makedirs(os.path.dirname(dst), exist_ok=True); shutil.copy2(p, dst)
def restore():
    for p in [FOOT] + targets:
        shutil.copy2(os.path.join(bk, os.path.relpath(p, ROOT)), p)
    print('RESTORED from', bk)
try:
    open(FOOT, 'w', encoding='utf-8').write(new)
    for p in targets:
        s = open(p, encoding='utf-8').read()
        open(p, 'w', encoding='utf-8').write(s.replace('knowhere-footer.js?v=23', 'knowhere-footer.js?v=24'))
    r = subprocess.run(['node', '--check', FOOT], capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr); restore(); sys.exit(1)
    # receipts from disk
    back = open(FOOT, encoding='utf-8').read()
    assert MARK in back and back.count('class="kfn-links"') == 1
    left = [p for p in targets if 'knowhere-footer.js?v=23' in open(p, encoding='utf-8').read()]
    assert not left, left
    print('APPLIED. node --check ok. %d files bumped to ?v=24. backup: %s' % (len(targets), bk))
except Exception as e:
    print('FAILED:', e); restore(); sys.exit(1)
