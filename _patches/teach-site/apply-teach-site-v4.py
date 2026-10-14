#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
knowhere.me — for-teachers round four (KW:TEACH-SITE-V4, 14 Oct 2026): poke it. before call it. — RULED by Cat 14 Oct 10:05.
Run AFTER apply-teach-site-v3.py:  cd ~/Code/knowhere/website/knowhere-website && python3 _patches/teach-site/apply-teach-site-v4.py
Swaps the two cards in the deck grid (02 poke it., 03 call it.) and reorders the Socratic steps (the model first, then the claim).
"""
import os, sys, time, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.getcwd(); MARK = 'KW:TEACH-SITE-V4'
def die(m): print('✗ ' + m); sys.exit(1)
def rd(p):
    with open(p, encoding='utf-8') as f: return f.read()
def rep(src, old, new, n=1, label=''):
    c = src.count(old)
    if c != n: die('anchor count %d (wanted %d) for %s: %r' % (c, n, label, old[:70]))
    return src.replace(old, new)
FT = os.path.join(ROOT, 'for-teachers.html')
if not os.path.exists(FT): die('run me from the website folder')
ft = rd(FT)
if MARK in ft: print('• already carries %s — nothing to do' % MARK); sys.exit(0)
if 'KW:TEACH-SITE-V3' not in ft: die('run apply-teach-site-v3.py first')

CALL = '''        <div class="verb call" data-reveal style="transition-delay:.05s"><div class="v">call it.</div><div class="s">lids down</div><p>A what-if on the model. Pairs call 1, 2 or 3 &#8212; and one answer's an impostor.</p></div>
'''
POKE = '''        <div class="verb" data-reveal style="transition-delay:.1s"><div class="v">poke it.</div><div class="s">the live knowscape</div><p>Full screen on the projector. Change one thing, watch what breaks.</p></div>
'''
POKE2 = '''        <div class="verb" data-reveal style="transition-delay:.05s"><div class="v">poke it.</div><div class="s">the live knowscape</div><p>Full screen on the projector first. Change one thing, watch what breaks.</p></div>
'''
CALL2 = '''        <div class="verb call" data-reveal style="transition-delay:.1s"><div class="v">call it.</div><div class="s">lids down</div><p>Now the what-if. Pairs call 1, 2 or 3 &#8212; and one answer's an impostor.</p></div>
'''
new = rep(ft, CALL + POKE, POKE2 + CALL2, 1, 'deck order')
new = rep(new, '<!-- KW:TEACH-SITE: the eight-verb deck (RULED 29 Sep: seven, + take it. 10 Oct), this order, lowercase with a full stop; + your slide (V2) -->',
          '<!-- KW:TEACH-SITE: the eight-verb deck (RULED 29 Sep: seven, + take it. 10 Oct; ' + MARK + ' RULED 14 Oct: poke it. before call it.), this order, lowercase with a full stop; + your slide (V2) -->', 1, 'deck comment')
STEPS_OLD = '''          <li><span class="n">01</span><span class="s"><b>The claim.</b> Pairs commit to 1, 2 or 3 &#8212; out loud, before anyone knows. <i>call it.</i></span></li>
          <li><span class="n">02</span><span class="s"><b>The probing question.</b> A what-if on a model they can see, not a definition they can recite.</span></li>
'''
STEPS_NEW = '''          <li><span class="n">01</span><span class="s"><b>The model.</b> They see it move before anyone explains it. <i>poke it.</i></span></li>
          <li><span class="n">02</span><span class="s"><b>The claim.</b> A what-if on what they just saw &#8212; pairs commit to 1, 2 or 3, out loud, before anyone knows. <i>call it.</i></span></li>
'''
new = rep(new, STEPS_OLD, STEPS_NEW, 1, 'socratic steps')
new = rep(new, '<em>Poke the burette first. Then make your call.</em>', '<em>Poke the burette first. Then make your call.</em><!-- ' + MARK + ' -->', 1, 'lede marker')
BAK = os.path.join(HERE, 'bak-v4-' + time.strftime('%Y%m%d-%H%M%S')); os.makedirs(BAK, exist_ok=True); shutil.copy2(FT, os.path.join(BAK, 'for-teachers.html'))
with open(FT, 'w', encoding='utf-8') as f: f.write(new)
chk = rd(FT); ok = chk.count(MARK) == 2 and chk.index('<div class="v">poke it.</div>') < chk.index('<div class="v">call it.</div>') and '<b>The model.</b>' in chk
print(('✓' if ok else '✗') + ' deck: poke it. before call it. · Socratic steps reordered')
if not ok: shutil.copy2(os.path.join(BAK, 'for-teachers.html'), FT); die('receipt failed — restored')
print('backups in ' + os.path.relpath(BAK, ROOT) + '\ndone. Commit + push.')
