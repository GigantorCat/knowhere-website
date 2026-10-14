#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
knowhere.me — link the Teacher Terms where teachers meet them (KW:TEACH-TERMS-LINKS, 14 Oct 2026).
Run AFTER apply-teacher-terms.py:  cd ~/Code/knowhere/website/knowhere-website && python3 _patches/teach-site/apply-teacher-terms-links.py
  · for-teachers.html: the signup sheet's trust line (inline + sticky) now ends with a Teacher terms link
  · terms.html: a one-line pointer at the top of the general terms, above the short version
  · for-your-it-team.html: the foot links carry Teacher terms
(The app's teacher-signup "by creating an account you agree to…" line is Bronco's: KICKOFF-BRONCO-TEACH-ORDER-PRESENT-14OCT item 5.)
"""
import os, sys, time, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.getcwd(); MARK = 'KW:TEACH-TERMS-LINKS'
def die(m): print('✗ ' + m); sys.exit(1)
def rd(p):
    with open(p, encoding='utf-8') as f: return f.read()
def rep(src, old, new, n=1, label=''):
    c = src.count(old)
    if c != n: die('anchor count %d (wanted %d) for %s: %r' % (c, n, label, old[:70]))
    return src.replace(old, new)
FT, TERMS, IT = (os.path.join(ROOT, f) for f in ('for-teachers.html', 'terms.html', 'for-your-it-team.html'))
for p in (FT, TERMS, IT):
    if not os.path.exists(p): die('missing ' + os.path.basename(p) + ' — run the earlier teach-site patches first')
ft, terms, it = rd(FT), rd(TERMS), rd(IT)
if MARK in ft: print('• already carries %s — nothing to do' % MARK); sys.exit(0)
if 'KW:TEACH-TERMS' not in terms: die('run apply-teacher-terms.py first')

ft2 = rep(ft, '<p class="js-trust">Nothing is charged without your yes.</p>',
          '<p class="js-trust">Nothing is charged without your yes. <a href="/teacher-terms" target="_blank" rel="noopener">Teacher terms</a></p>', 2, 'trust line ×2')
ft2 = rep(ft2, '  .kw-tch .js-trust{font-size:12.5px;line-height:1.5;color:#a79fb3;margin:10px 0 0;text-align:center}',
          '  .kw-tch .js-trust{font-size:12.5px;line-height:1.5;color:#a79fb3;margin:10px 0 0;text-align:center}\n  .kw-tch .js-trust a{color:#cdb6f5;text-decoration:underline;text-underline-offset:3px}   /* ' + MARK + ' */', 1, 'trust css')

terms2 = rep(terms, '    <div class="tldr" data-reveal>\n      <span class="chip">The short version</span>',
             '    <p data-reveal style="margin:0 0 14px;font-size:14px;color:var(--dim)"><!-- ' + MARK + ' -->Teaching with knowhere &#183; teach it.? Your terms are the <a href="/teacher-terms">Teacher Terms of Use</a>. These are the terms for students and parents.</p>\n\n    <div class="tldr" data-reveal>\n      <span class="chip">The short version</span>', 1, 'terms pointer')

it2 = rep(it, '<a href="/privacy">Privacy</a> &#183; <a href="/terms">Terms</a> &#183;',
          '<a href="/privacy">Privacy</a> &#183; <a href="/teacher-terms">Teacher terms</a> &#183;', 1, 'IT foot')

BAK = os.path.join(HERE, 'bak-termslinks-' + time.strftime('%Y%m%d-%H%M%S')); os.makedirs(BAK, exist_ok=True)
for p in (FT, TERMS, IT): shutil.copy2(p, os.path.join(BAK, os.path.basename(p)))
for p, s in ((FT, ft2), (TERMS, terms2), (IT, it2)):
    with open(p, 'w', encoding='utf-8') as f: f.write(s)
ok = rd(FT).count('href="/teacher-terms"') == 2 and rd(TERMS).count('href="/teacher-terms"') == 2 and 'href="/teacher-terms"' in rd(IT)
print(('✓' if ok else '✗') + ' teacher terms linked: signup sheet ×2 · general terms top + §02 · IT page foot')
if not ok:
    for p in (FT, TERMS, IT): shutil.copy2(os.path.join(BAK, os.path.basename(p)), p)
    die('receipt failed — restored')
print('backups in ' + os.path.relpath(BAK, ROOT) + '\ndone. Commit + push.')
