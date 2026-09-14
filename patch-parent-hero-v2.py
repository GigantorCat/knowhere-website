#!/usr/bin/env python3
# KW:PARENT-HERO-V2 — for-parents.html first-screen rebuild (14 Sep 2026)
# Run from the knowhere-website repo root:  python3 patch-parent-hero-v2.py
# Idempotent. Backs up to for-parents.html.bak-<ts> (gitignored). Every anchor asserted before any write.
import sys, os, time, hashlib

F = 'for-parents.html'
MARK = 'KW:PARENT-HERO-V2'

def md5(p):
    return hashlib.md5(open(p, 'rb').read()).hexdigest()

if not os.path.exists(F):
    sys.exit('not in the repo root — %s missing' % F)
src = open(F, encoding='utf-8').read()
if MARK in src:
    print('already applied (%s present) — nothing to do' % MARK); sys.exit(0)

edits = []  # (anchor, replacement, expected_count)

# 1. CSS — appended after the hero .row rule
css_anchor = "  .kw-par .hero .row{display:flex;gap:13px;margin-top:32px;flex-wrap:wrap;position:relative;justify-content:center}\n"
css_new = css_anchor + """  /* KW:PARENT-HERO-V2 — one CTA above the fold on a phone; banner off on phone, shrunk on desktop */
  .kw-par .cta.small{white-space:nowrap}
  .kw-par .hero .eyebrow{position:relative;font-size:11.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--brat);margin:0 auto}
  .kw-par .hero .eyebrow span{color:var(--dim);font-weight:500;letter-spacing:.08em;text-transform:none}
  .kw-par .hero .eyebrow .sep{font-style:normal;color:var(--dim)}
  .kw-par .hero .row{margin-top:26px}
  .kw-par .hero .cta{font-size:16px;padding:16px 34px}
  .kw-par .hero .assure{position:relative;font-size:13px;line-height:1.5;color:var(--dim);margin:14px auto 0;max-width:40ch}
  .kw-par .hero .assure b{color:var(--ink);font-weight:600}
  .kw-par .hero .alt{position:relative;display:flex;gap:22px;justify-content:center;margin-top:22px}
  .kw-par .hero .alt a{font-size:13.5px;font-weight:500;color:var(--dim);border-bottom:1px solid rgba(255,255,255,.18);padding-bottom:2px;transition:color .16s,border-color .16s}
  .kw-par .hero .alt a:hover{color:var(--ink);border-color:var(--brat)}
  .kw-par .page-banner{height:clamp(110px,15vh,170px);margin-bottom:0}
  @media (max-width:700px){
    .kw-par .page-banner{display:none}
    .kw-par .hero{min-height:0;justify-content:flex-start;padding:30px 0 56px}
    .kw-par .hero h1{font-size:31px;margin-top:14px}
    .kw-par .hero p{font-size:15.5px;margin-top:16px}
    .kw-par .hero .row{margin-top:22px}
    .kw-par .hero .cta{width:100%;max-width:340px;text-align:center}
    .kw-par .scroll-cue{display:none}
    .kw-par .hero .eyebrow .sep{display:none}
    .kw-par .hero .eyebrow span{display:block;margin-top:5px}
  }
"""
edits.append((css_anchor, css_new, 1))

# 2. Nav CTA — one destination on this page
nav_old = '      <a class="cta small" href="/pricing">start knowing</a>\n'
nav_new = '      <a class="cta small" href="https://app.knowhere.me/signup?as=parent">start their free week</a>\n'
edits.append((nav_old, nav_new, 1))

# 3. The first screen
hero_old = '''      <h1 data-reveal>Year 12 is hard enough. <span style="color:var(--brat)">Watching it from the sidelines</span> is harder.</h1>
      <p data-reveal>knowhere gives your child a study system built around how <em>their</em> brain actually learns — and gives you a clear, honest view of how they're really going. No nagging required.</p>
      <div class="row" data-reveal>
        <a class="cta" href="https://app.knowhere.me/signup?as=parent">Start their free week</a>
        <a class="ghost" href="/how-it-works">See how it works</a>
        <a class="ghost" href="/compare">How it compares</a>
      </div>
'''
hero_new = '''      <div class="eyebrow" data-reveal>HSC &amp; VCE &middot; Year 12 <i class="sep">&middot;</i> <span>a study app from A$39/month</span></div>
      <h1 data-reveal>It was never a <span style="color:var(--brat)">motivation</span> problem.</h1>
      <p data-reveal>Nobody gets interested first &#8212; you understand something, <em>then</em> you care. knowhere is a Year 12 study app that rebuilds every concept in the shape your kid&#8217;s head actually reads, and shows you each week what landed.</p>
      <div class="row" data-reveal>
        <a class="cta" href="https://app.knowhere.me/signup?as=parent">Start their free week</a>
      </div>
      <p class="assure" data-reveal><b>7 days free, A$0 today.</b> Cancel before the week ends and you pay nothing. A month costs less than one hour with a tutor.</p>
      <div class="alt" data-reveal>
        <a href="/how-it-works">See how it works</a>
        <a href="/compare">How it compares</a>
      </div>
'''
edits.append((hero_old, hero_new, 1))

# preflight: every anchor must match exactly N times BEFORE anything is written
for a, b, n in edits:
    c = src.count(a)
    if c != n:
        sys.exit('PREFLIGHT FAIL: anchor found %d times (expected %d): %r' % (c, n, a[:70]))

out = src
for a, b, n in edits:
    out = out.replace(a, b)

ts = time.strftime('%Y%m%d-%H%M%S')
bak = '%s.bak-%s' % (F, ts)
open(bak, 'w', encoding='utf-8').write(src)
open(F, 'w', encoding='utf-8').write(out)

# receipts, read back from disk
disk = open(F, encoding='utf-8').read()
checks = {
    'marker present':            MARK in disk,
    'old headline gone':         'Watching it from the sidelines' not in disk,
    'new headline in':           'It was never a <span style="color:var(--brat)">motivation</span> problem.' in disk,
    'one hero CTA':              disk.count('<a class="cta" href="https://app.knowhere.me/signup?as=parent">Start their free week</a>') == 2,  # hero + bottom band
    'ghost buttons out of hero': disk.count('class="ghost"') == 1,   # only the bottom band keeps one
    'nav points at parent':      'class="cta small" href="https://app.knowhere.me/signup?as=parent"' in disk,
    'eyebrow in':                'a study app from A$39/month' in disk,
    'assure line in':            '7 days free, A$0 today.' in disk,
    'backup exists':             os.path.exists(bak) and md5(bak) == hashlib.md5(src.encode('utf-8')).hexdigest(),
}
bad = [k for k, v in checks.items() if not v]
for k, v in checks.items():
    print(('  ok  ' if v else '  FAIL') + ' ' + k)
if bad:
    open(F, 'w', encoding='utf-8').write(src)
    sys.exit('receipt failure — restored original from memory; backup at ' + bak)
print('applied. backup: %s  md5(before)=%s  md5(after)=%s' % (bak, hashlib.md5(src.encode()).hexdigest(), md5(F)))
