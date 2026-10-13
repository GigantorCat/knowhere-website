#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
knowhere.me — for-teachers round three (KW:TEACH-SITE-V3, 14 Oct 2026): the signup block in the exam-pass pattern.

Run AFTER apply-teach-site-v2.py, from the website folder:

    cd ~/Code/knowhere/website/knowhere-website && python3 _patches/teach-site/apply-teach-site-v3.py

Cat (14 Oct): make the CTA block like the exam pass — not full width, same colourways (no brat button on purple).
  · collapsed bar: purple, 560px centred, "FOUNDING TEACHERS · First term free" + the chevron, like the pass bar
  · tap → a dark sheet slides up (pass-sheet colours): FOUNDING TEACHERS · "First term free — be one of the first 50"
    · copy · brat CTA on the dark sheet · "50 founding seats · free until Fri 9 April 2027" (seat rule) · DAY 1 / TERM 1
  · the same sheet + bar sits inline at the bottom of the page as THE signup block (open); the sticky one hides there
Backups in _patches/teach-site/bak-v3-<stamp>/. Idempotent on the marker.
"""
import os, re, sys, time, subprocess, shutil

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.getcwd(); STAMP = time.strftime('%Y%m%d-%H%M%S')
MARK = 'KW:TEACH-SITE-V3'
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
if 'KW:TEACH-SITE-V2' not in ft: die('for-teachers.html has no KW:TEACH-SITE-V2 — run apply-teach-site-v2.py first')

SIGNUP = 'https://app.knowhere.me/signup?as=teacher'

def sheet(idsuffix, cta_from):
    return r'''<div class="js-sheet">
        <div class="js-eyebrow">Founding teachers</div>
        <h3 class="js-h">First term free &#8212; be one of the first 50</h3>
        <p class="js-l">Free access until the end of Term 1. That&#8217;s long enough to teach a whole unit with it &#8212; and first say in how the classroom tools work.</p>
        <a class="js-cta" data-kw-from="''' + cta_from + r'''" href="''' + SIGNUP + r'''">claim your founding seat</a>
        <p class="js-sub"><span class="f-seats still" data-seat-line><span data-seat-text>50 founding seats &#183; free until Fri 9 April 2027</span></span></p>
        <p class="js-when"><b>Day 1:</b> Every Physics and Chemistry concept, Year 11 and 12. <b>Term 1:</b> Biology, Psychology, then Maths. Each wave lands in your account.</p>
        <p class="js-trust">Nothing is charged without your yes.</p>
      </div>'''

BAR_INLINE = r'''<div class="js-bar js-static" aria-hidden="true"><span class="js-t">First term free<small>Founding teachers &#183; 50 seats</small></span><span class="js-p">until 9 Apr 2027</span></div>'''
BAR_STICKY = r'''<button class="js-bar" type="button" id="tchJoinToggle" aria-expanded="false" aria-controls="tchJoinSheet"><span class="js-t">First term free<small>Founding teachers &#183; 50 seats</small></span><span class="js-p">until 9 Apr 2027</span><span class="js-chev" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg></span></button>'''

JOIN_NEW = r'''  <section class="cta-band" id="tch-join">
    <div class="wrap">
      <!-- ''' + MARK + r''' (14 Oct 2026): the signup block in the exam-pass pattern (knowhere-passbar.js colours, 560px): the dark
           sheet + the purple bar, inline and open. The sticky copy below is the same thing, collapsed. Seat rule (13 Oct): the
           seat line reads the offer until 10 seats are gone; Seats() paints every [data-seat-text]. -->
      <div class="joinstack" id="tchJoinInline" data-seats-total="50" data-seats-left="50" data-seats-show-after="10">
      ''' + sheet('inline', 'join') + r'''
      ''' + BAR_INLINE + r'''
      </div>
    </div>
  </section>

  <!-- ''' + MARK + r''': the sticky bar — collapsed; tap for the sheet. Shows once the hero scrolls out, hides at the inline block. -->
  <div class="joinbar" id="tchJoinbar" aria-hidden="true">
    <div class="joinstack">
      <div id="tchJoinSheet" hidden>''' + sheet('sticky', 'bar') + r'''</div>
      ''' + BAR_STICKY + r'''
    </div>
  </div>
'''

CSS_NEW = r'''  /* ── ''' + MARK + r''': the signup block, exam-pass pattern (colours and sizes from knowhere-passbar.js) ── */
  .kw-tch .cta-band{padding:70px 0 100px}
  .kw-tch .joinstack{max-width:560px;margin:0 auto;font-family:'Geist',system-ui,sans-serif}
  .kw-tch .js-bar{display:flex;align-items:center;gap:12px;width:100%;border:0;cursor:pointer;text-align:left;font:inherit;color:#fff;background:#6f3fc0;background:linear-gradient(100deg,#7c47d6,#5b2fa6);padding:12px 18px;border-radius:16px;box-shadow:0 -10px 40px rgba(0,0,0,.45)}
  .kw-tch .js-bar.js-static{cursor:default;border-radius:0 0 18px 18px;box-shadow:none}
  .kw-tch .js-t{flex:1;font-weight:700;font-size:16px;letter-spacing:-0.01em;line-height:1.2}
  .kw-tch .js-t small{display:block;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.78);margin-top:3px}
  .kw-tch .js-p{font-weight:700;font-size:14px;white-space:nowrap;color:rgba(255,255,255,.92)}
  .kw-tch .js-chev{width:32px;height:32px;border-radius:10px;background:rgba(0,0,0,.28);display:grid;place-items:center;transition:transform .25s;flex-shrink:0}
  .kw-tch .joinbar.open .js-chev{transform:rotate(180deg)}
  .kw-tch .js-sheet{background:#1a1025;border:1px solid rgba(155,90,234,.5);border-bottom:0;border-radius:18px 18px 0 0;padding:22px 20px 18px;color:#EDECE8;text-align:left}
  .kw-tch .js-eyebrow{font-size:11px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:#cdb6f5}
  .kw-tch .js-h{font-size:clamp(22px,2.8vw,28px);font-weight:800;letter-spacing:-0.035em;line-height:1.08;color:#fff;margin:8px 0 0;text-wrap:balance;text-transform:none}
  .kw-tch .js-l{font-size:15px;line-height:1.5;color:#bdb4c9;margin:10px 0 16px}
  .kw-tch .js-cta{display:block;text-align:center;background:#7BEA5A;color:#070708;font-weight:700;font-size:16px;padding:16px 20px;border-radius:14px;text-decoration:none;text-transform:lowercase}
  .kw-tch .js-cta:hover{filter:brightness(1.07)}
  .kw-tch .js-sub{margin:12px 0 0;text-align:center}
  .kw-tch .js-sub .f-seats{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:#EDECE8}
  .kw-tch .js-sub .f-seats::before{content:'';width:7px;height:7px;border-radius:50%;background:#7BEA5A;animation:tchPulse 2.4s ease-in-out infinite}
  .kw-tch .js-sub .f-seats.still::before{animation:none;opacity:.8}
  .kw-tch .js-sub .f-seats b{font-weight:800;color:#fff;font-variant-numeric:tabular-nums}
  .kw-tch .js-when{font-size:13px;line-height:1.55;color:#bdb4c9;margin:14px 0 0;padding-top:12px;border-top:1px solid rgba(155,90,234,.3)}
  .kw-tch .js-when b{color:#fff;font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:11px}
  .kw-tch .js-trust{font-size:12.5px;line-height:1.5;color:#a79fb3;margin:10px 0 0;text-align:center}
  .kw-tch .joinstack.f-gone .js-bar{background:#2a2033}
  /* the sticky copy */
  .kw-tch .joinbar{position:fixed;left:0;right:0;bottom:0;z-index:150;padding:0 12px;transform:translateY(130%);opacity:0;transition:transform .35s cubic-bezier(.2,.7,.2,1),opacity .35s;pointer-events:none}
  .kw-tch .joinbar.on{transform:none;opacity:1;pointer-events:auto}
  .kw-tch .joinbar .js-bar{border-radius:16px 16px 0 0;padding-bottom:calc(12px + env(safe-area-inset-bottom))}
  .kw-tch .joinbar.open .js-bar{border-radius:0}
  .kw-tch .joinbar [hidden]{display:none}
  .kw-tch .joinbar .js-sheet{max-height:min(72vh,640px);overflow:auto}
  @media (max-width:600px){.kw-tch .js-t{font-size:15px}.kw-tch .js-p{display:none}}
  @media (prefers-reduced-motion:reduce){.kw-tch .joinbar{transition:none}.kw-tch .js-chev{transition:none}}
'''

JS_JOINBAR_NEW = r'''  /* ── ''' + MARK + r''': the sticky bar — collapsed, tap for the sheet; on once the hero has scrolled out, off from the inline block down ── */
  function Joinbar(root){
    var bar=root.querySelector('#tchJoinbar'), hero=root.querySelector('.hero'), join=root.querySelector('#tch-join');
    var tog=root.querySelector('#tchJoinToggle'), sheet=root.querySelector('#tchJoinSheet');
    if(!bar||!hero||!join) return function(){};
    var dead=false, raf=0, open=false, opened=false;
    function setOpen(v){
      open=!!v; bar.classList.toggle('open', open);
      if(sheet) sheet.hidden=!open;
      if(tog) tog.setAttribute('aria-expanded', open?'true':'false');
      if(open&&!opened){ opened=true; try{ if(window.umami) window.umami.track('join_sheet_open',{page:location.pathname}); }catch(e){} }
    }
    function set(){
      raf=0; if(dead) return;
      var fs=!!(document.fullscreenElement||document.webkitFullscreenElement);
      var h=hero.getBoundingClientRect(), j=join.getBoundingClientRect();
      var on=!fs && h.bottom < 80 && j.top > window.innerHeight - 40;
      bar.classList.toggle('on', on); bar.setAttribute('aria-hidden', on?'false':'true');
      if(!on&&open) setOpen(false);
    }
    function tick(){ if(!raf) raf=requestAnimationFrame(set); }
    function toggle(){ setOpen(!open); }
    if(sheet) sheet.hidden=true;   /* the dc runtime drops the bare hidden attribute */
    if(tog) tog.addEventListener('click', toggle);
    window.addEventListener('scroll', tick, {passive:true}); window.addEventListener('resize', tick);
    document.addEventListener('fullscreenchange', tick); document.addEventListener('webkitfullscreenchange', tick);
    set();
    return function(){ dead=true; if(tog) tog.removeEventListener('click', toggle); window.removeEventListener('scroll', tick); window.removeEventListener('resize', tick); document.removeEventListener('fullscreenchange', tick); document.removeEventListener('webkitfullscreenchange', tick); };
  }
'''

new = ft
# markup: the join section + the sticky bar
j0 = new.index('  <section class="cta-band" id="tch-join">'); j1 = new.index('  <div class="foot-snap">')
new = new[:j0] + JOIN_NEW + '\n' + new[j1:]
# css: replace from the signup-block comment through the .page padding line
c0 = new.index('  /* ── the signup block: purple is the offer colour'); c1 = new.index('  .kw-tch .page{padding-bottom:0}\n') + len('  .kw-tch .page{padding-bottom:0}\n')
new = new[:c0] + CSS_NEW + new[c1:]
# js: Joinbar
f0 = new.index('  /* ── KW:TEACH-SITE-V2: the sticky bar'); f1 = new.index('  /* founding-teacher seats. reads /api/staffroom-seats')
new = new[:f0] + JS_JOINBAR_NEW + '\n' + new[f1:]
# Seats(): paint every [data-seat-text], the card is #tchJoinInline
seats_old = new[new.index('  function Seats(root){'):new.index('    paint(parseInt(card.getAttribute(\'data-seats-left\'),10)||0,')]
seats_new = r'''  function Seats(root){
    var card=root.querySelector('#tchJoinInline');   /* ''' + MARK + r''' */
    if(!card) return function(){};
    /* KW:TEACH-SITE (ruled 13 Oct 2026): the live count is anti-social-proof while it reads 48 of 50. Until
       data-seats-show-after seats are gone the line reads the offer; from then on it counts down; at 0 it flips. */
    var lines=[].slice.call(root.querySelectorAll('[data-seat-line]')), texts=[].slice.call(root.querySelectorAll('[data-seat-text]'));
    var showAfter=parseInt(card.getAttribute('data-seats-show-after'),10)||10;
    var dead=false;
    function paint(n, tot){
      if(dead||!texts.length) return;
      n=Math.max(0, n|0); tot=(tot|0)||50;
      var still=true, html;
      if(n<=0){ card.classList.add('f-gone'); html='All '+tot+' founding seats taken — join anyway, you’re next in line'; }
      else if(tot-n < showAfter){ html=tot+' founding seats · free until Fri 9 April 2027'; }
      else { still=false; html='<b>'+n+'</b> of '+tot+' seats left · free until Fri 9 April 2027'; }
      lines.forEach(function(l){ l.classList.toggle('still', still); });
      texts.forEach(function(t){ t.innerHTML=html; });
    }
'''
new = new.replace(seats_old, seats_new)
for bad in ('class="join"', 'id="tchSeatText"', 'class="j-eyebrow"', 'jb-t'):
    if bad in new: die('stale fragment still present: %r' % bad)
if new.count(SIGNUP) != 5: die('expected 5 seat CTAs (nav, hero, callit row, sheet inline, sheet sticky), found %d' % new.count(SIGNUP))

BAK = os.path.join(HERE, 'bak-v3-' + STAMP); os.makedirs(BAK, exist_ok=True); shutil.copy2(FT, os.path.join(BAK, 'for-teachers.html'))
with open(FT, 'w', encoding='utf-8') as f: f.write(new)

ok = True; chk = rd(FT)
for want, n in ((MARK, None), (SIGNUP, 5), ('id="tchJoinInline"', 1), ('id="tchJoinToggle"', 1), ('id="tchJoinSheet"', 1), ('<span data-seat-text>', 2), ('First term free &#8212; be one of the first 50', 2), ('KW:FOOT-V25', None)):
    c = chk.count(want); good = (c > 0) if n is None else (c == n); ok &= good
    print(('✓' if good else '✗') + ' for-teachers.html  %-40s ×%d' % (want[:40], c))
try:
    m = re.search(r'<script>\n(/\* ══ knowhere · for-teachers page engine.*?)</script>', chk, re.S)
    tmp = os.path.join(HERE, '.engine-check.js')
    with open(tmp, 'w', encoding='utf-8') as f: f.write(m.group(1))
    r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
    try: os.remove(tmp)
    except OSError: pass
    good = r.returncode == 0; ok &= good; print(('✓' if good else '✗') + ' node --check page engine' + ('' if good else '\n' + r.stderr))
except FileNotFoundError: print('• node not found — skipped the parse check')
if not ok:
    shutil.copy2(os.path.join(BAK, 'for-teachers.html'), FT); die('a receipt failed — original restored from ' + os.path.relpath(BAK, ROOT))
print('\nbackups in ' + os.path.relpath(BAK, ROOT))
print('done. /for-teachers: scroll past the hero → purple bar (560px, centred) → tap → the sheet; the bar parks at the bottom block.')
