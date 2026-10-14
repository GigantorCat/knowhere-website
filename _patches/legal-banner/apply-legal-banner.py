#!/usr/bin/env python3
"""legal-banner (14 Oct 2026, Cat: "the heading is blocking out the content - it should sit above the content and below
the nav bar - like the other pages"). The site-wide banner pass made every .page-banner position:absolute at top:0 and
gave each page's .hero the top padding to clear it. terms, teacher-terms and privacy have no .hero, so their banner sat
behind the nav and over the subtitle and the content. Here their banner goes back into the flow: under the nav, full
width, the same heights as the other pages, a small gap before the subtitle.
Dry run by default; --apply writes. Idempotent on KW:LEGAL-BANNER."""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PAGES = [('terms.html', 'kw-terms'), ('teacher-terms.html', 'kw-terms'), ('privacy.html', 'kw-priv')]
apply = '--apply' in sys.argv
for name, cls in PAGES:
    p = os.path.join(ROOT, name); s = open(p, encoding='utf-8').read()
    if 'KW:LEGAL-BANNER' in s: print(name, 'already applied'); continue
    old = '.%s .page-banner{position:absolute;top:0;left:0;right:0;width:100%%;max-width:none;margin:0;padding:0;height:clamp(150px,22vh,260px)}' % cls
    new = ('.%s .page-banner{position:relative;top:auto;left:auto;right:auto;width:100%%;max-width:none;margin:0 0 clamp(8px,2vh,30px);padding:0;'
           'height:clamp(150px,22vh,260px)} /* KW:LEGAL-BANNER: in the flow under the nav (no .hero here to clear it) */') % cls
    assert s.count(old) == 1, '%s: anchor count %d' % (name, s.count(old))
    s = s.replace(old, new)
    print(name, 'anchor ok')
    if apply:
        open(p, 'w', encoding='utf-8').write(s)
        assert 'KW:LEGAL-BANNER' in open(p, encoding='utf-8').read(); print(name, 'APPLIED')
if not apply: print('DRY RUN - re-run with --apply')
