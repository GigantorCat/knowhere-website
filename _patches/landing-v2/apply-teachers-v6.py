#!/usr/bin/env python3
"""KW:TEACH-V6 (18 Oct 2026) — /for-teachers gets the Home / for-parents layout. Cat, Sun 18 Oct 15:41.

  Banner   one screen: eyebrow "knowhere · teach it." · the h1 as is · "You've seen this email." + the Jayden email (the ad's
           own subject and lines, appearing one by one) · a purple founding-seat card (claim your founding seat) · the apples
           at the foot (no "For teachers" glass title) · scroll cue "run a round". The old subline moves into call it.
  call it  eyebrow "Interactive collaborative learning" · h2 "Poke it, present it, play it out. / Run the room." · copy
           about the whole experience (present + the room interacts, reframed concepts, then call it.) · the 01–05 room
           steps beside the copy · a Goat card (how to run this one + what happens in a classroom) · the live widget
           near full screen (canvas fills the frame, call it. panel beside it) · a purple founding-seat card in place of
           the plain CTA row.
  Quote    the Socrates line on its own, centred, assembling out of particles as you scroll down.
  Seat cards (.kw-seat) carry [data-seat-text], so the seat counter paints them; the sticky teacher bar hides while one
  is on screen. No founding (student) bar on this page.

Idempotent on the KW:TEACH-V6 marker. Backs up to _patches/landing-v2/bak-tch6-<stamp>/.
Run from the website repo root:  python3 _patches/landing-v2/apply-teachers-v6.py [--dry]
"""
import os, sys, shutil, time

DRY = '--dry' in sys.argv
ROOT = os.getcwd()
P = os.path.join(ROOT, 'for-teachers.html')
src = open(P, encoding='utf-8').read()
if 'KW:TEACH-V6' in src:
    print('already applied (KW:TEACH-V6 marker present) — nothing to do'); sys.exit(0)
assert 'KW:OPENERS' in src, 'expected the KW:OPENERS for-teachers page'

def swap(s, old, new, n=1, label=''):
    c = s.count(old)
    assert c == n, f'{label}: expected {n} match(es), found {c}'
    return s.replace(old, new)

def cut(s, start, end, new, label=''):
    assert s.count(start) == 1, f'{label}: start anchor count {s.count(start)}'
    i = s.index(start); j = s.index(end, i)
    return s[:i] + new + s[j:]

GOAT = ('<svg viewBox="14 1 38 63" aria-hidden="true"><g><g transform="translate(29.4,26.8) rotate(-18)"><path d="M0,-2.4 C-4.4,-5.4 -11.4,-5.2 -14.2,-2 C-10.8,2 -5,3.4 0,2.4 Z" fill="#F5F5EF"/></g><g transform="translate(41,26.2) rotate(20)"><path d="M-0.4,-0.8 C1.8,-5.8 5.6,-8.2 9.6,-7.2 C8,-3.4 4.2,-0.4 0.4,0.8 Z" fill="#F5F5EF"/></g><path d="M28.8,21.6 C27.6,23.8 27.2,25.4 27.2,27.2 C27.2,29.6 27.3,31.2 27.5,32.7 C27.9,35 28.3,36.6 29,37.7 C29.8,39.4 30.6,40.8 31.7,41.8 C32.8,43.4 34,44.8 35.2,45.7 C36.4,47.2 37.4,48.2 38.4,48.7 C39.2,49.2 40,49.2 40.7,49 C42.6,48.6 45,48 46.7,47.2 C47.6,46.8 48.2,46.5 48.2,45.9 C48.4,44.6 47.9,43.8 47.3,42.9 C46.6,41.2 45.9,39.4 45.3,37.7 C44.7,35.6 44,33.6 43.3,31.6 C42.6,29.4 41.8,27.4 40.9,25.5 C40.4,23.6 39.8,22.2 39,21 C35.6,21.4 32,21.6 28.8,21.6 Z" fill="#F5F5EF"/><path d="M39.4,49.2 L46.8,48.4 L46.6,56.6 L45.4,49.6 L44.6,59.2 L43.4,49.8 L42.6,62.6 L41.6,49.8 L40.8,58.2 L39.9,49.6 Z" fill="#7BEA5A"/><path d="M30.2,22.2 L31,15.8 L31.9,21.6 L32.7,14.4 L33.5,21.4 L34.3,16 L35.1,22.2 Z" fill="#7BEA5A"/><g transform="translate(33,24)"><path d="M-2.2,0.4 C-3.4,-7 -7,-13.8 -14.4,-18 C-10.8,-12.8 -8.2,-6.2 -6.4,1 Z" fill="#E4E4DA"/><path d="M7.6,0.2 C6.4,-8.6 3,-16.6 -3.2,-21.6 C-0.2,-15.6 1.9,-8.4 2.5,0.4 Z" fill="#E4E4DA"/></g><path d="M34.49,31.18 A1.3,2 8 0 1 31.91,30.82 A1.3,2 8 0 1 34.49,31.18 Z" fill="#0A0C0A"/><path d="M40.19,30.78 A1.3,2 8 0 1 37.61,30.42 A1.3,2 8 0 1 40.19,30.78 Z" fill="#0A0C0A"/><path d="M40.9,48.3 C42.8,49.2 45.4,48.4 47,47.2" fill="none" stroke="#0A0C0A" stroke-width="1.1" stroke-linecap="round"/></g></svg>')

SEAT = 'https://app.knowhere.me/signup?as=teacher'
SEATLINE = '<p class="kw-seat-fine" data-seat-line><span data-seat-text>50 founding seats &#183; free until Fri 9 April 2027</span></p>'

# ── CSS ───────────────────────────────────────────────────────────────────────────────────
CSS = r'''<style id="KW_TEACH_V6">
  /* KW:TEACH-V6 (18 Oct 2026): the Home / for-parents layout on /for-teachers. */
  /* A · the banner: one screen of text, the apples along the foot (no glass title), the email, the seat card */
  .kw-tch .hero.kp-ban{min-height:calc(100vh - 61px);min-height:calc(100svh - 61px);padding:40px 0 clamp(210px,27vh,260px);justify-content:center;overflow:hidden}
  .kw-tch .kp-ban .kp-pb{position:absolute;left:0;right:0;bottom:26px;height:clamp(170px,24vh,230px);pointer-events:none;z-index:0}
  .kw-tch .kp-ban .kp-pb .pb-host{position:absolute;inset:0;-webkit-mask-image:none;mask-image:none}
  .kw-tch .kp-ban .kp-pb .pb-host canvas{position:absolute;inset:0;width:100%;height:100%}
  .kw-tch .kp-ban .kp-pb [data-pb-glass]{display:none !important}
  .kw-tch .kp-ban-in{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;width:100%}
  .kw-tch .hero .kp-ban-eye{margin:0 0 18px;max-width:none;font-size:13px;font-weight:700;letter-spacing:.2em;color:var(--brat)}   /* lowercase: knowhere and teach it. always are */
  .kw-tch .hero.kp-ban h1{margin:0 auto;font-size:clamp(32px,4.4vw,54px);line-height:1.04}
  .kw-tch .hero .kp-ban-sub{margin:30px 0 0;max-width:none;font-size:19px;line-height:1.4;color:#9b9a96}
  .kw-tch .hero .kp-ban-pair{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(0,1fr);gap:16px;width:100%;max-width:900px;margin:14px auto 0;text-align:left;align-items:stretch}
  .kw-tch .kp-mail{position:relative;background:#0e0f12;border:1px solid rgba(255,255,255,.11);border-radius:16px;padding:14px 20px 18px;box-shadow:0 22px 60px rgba(0,0,0,.5)}
  .kw-tch .kp-mail-bar{display:flex;align-items:center;gap:8px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);padding-bottom:11px;border-bottom:1px solid var(--line)}
  .kw-tch .kp-mail-dot{width:7px;height:7px;border-radius:50%;background:#23A4DD;box-shadow:0 0 10px rgba(35,164,221,.7)}
  .kw-tch .kp-mail-t{margin-left:auto;letter-spacing:.06em}
  .kw-tch .hero .kp-mail-subj{margin:12px 0 0;max-width:none;font-size:17px;line-height:1.3;font-weight:700;letter-spacing:-0.01em;color:var(--ink)}
  .kw-tch .hero .kp-mail-meta{margin:3px 0 0;max-width:none;font-size:12px;line-height:1.3;color:var(--dim)}
  .kw-tch .kp-mail-body{margin-top:12px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:13px;line-height:1.7;color:#d6d5d0}
  .kw-tch .kp-mail-body span{display:block;animation:kpMailIn .55s ease both}
  .kw-tch .kp-mail-body span:nth-child(1){animation-delay:.5s}
  .kw-tch .kp-mail-body span:nth-child(2){animation-delay:1.25s}
  .kw-tch .kp-mail-body span:nth-child(3){animation-delay:2s}
  @keyframes kpMailIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
  .kw-tch .kp-ban .kp-cue{position:absolute;bottom:calc(64px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);z-index:3;display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--brat);text-decoration:none;font-size:13px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;text-shadow:0 0 12px #070708,0 0 4px #070708,0 0 2px #070708;animation:kpCue 2.4s ease-in-out infinite}
  .kw-tch .kp-ban .kp-cue svg{width:20px;height:20px}
  .kw-tch .kp-ban .kp-cue:hover,.kw-tch .kp-ban .kp-cue:focus-visible{color:var(--ink)}
  @keyframes kpCue{0%,100%{opacity:.85;transform:translateX(-50%) translateY(0)}50%{opacity:1;transform:translateX(-50%) translateY(6px)}}
  @media (max-width:760px){
    .kw-tch .hero.kp-ban{padding:34px 0 200px}
    .kw-tch .hero.kp-ban h1{font-size:clamp(28px,7.9vw,36px);line-height:1.07}
    .kw-tch .hero .kp-ban-eye{font-size:12px;margin-bottom:14px}
    .kw-tch .hero .kp-ban-sub{font-size:16.5px;margin-top:24px}
    .kw-tch .hero .kp-ban-pair{grid-template-columns:1fr;gap:12px}
    .kw-tch .kp-mail{padding:12px 16px 16px}
    .kw-tch .kp-mail-body{font-size:12.5px}
    .kw-tch .kp-ban .kp-pb{left:-30%;right:-30%;bottom:40px;height:150px}
    .kw-tch .kp-ban .kp-cue{bottom:calc(70px + env(safe-area-inset-bottom))}
  }

  /* the founding-seat card: the exam-pass card, re-used (purple = the offer). Full in the page; compact in the banner. */
  .kw-tch .kw-seat{--kwp:#9B5AEA;display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);border:1px solid rgba(155,90,234,.6);border-radius:22px;overflow:hidden;background:linear-gradient(168deg,rgba(155,90,234,.13),rgba(10,10,13,.7));text-align:left}
  .kw-tch .kw-seat p{margin:0;max-width:none}
  .kw-tch .kw-seat .kw-seat-l{padding:26px 30px;display:flex;flex-direction:column;justify-content:center}
  .kw-tch .kw-seat .kw-seat-eye{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#B98CF0;margin:0 0 10px}
  .kw-tch .kw-seat .kw-seat-title{font-size:clamp(28px,3.6vw,42px);font-weight:800;letter-spacing:-0.04em;line-height:1.02;color:var(--kwp);text-transform:lowercase}
  .kw-tch .kw-seat .kw-seat-sub{font-size:17px;font-weight:600;letter-spacing:-0.01em;line-height:1.35;color:var(--ink);margin-top:10px}
  .kw-tch .kw-seat .kw-seat-p{font-size:14px;line-height:1.6;color:var(--dim);margin-top:8px;max-width:60ch}
  .kw-tch .kw-seat .kw-seat-r{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:12px;padding:26px 24px;background:rgba(155,90,234,.09);border-left:1px solid rgba(155,90,234,.42)}
  .kw-tch .kw-seat .kw-seat-price{font-size:clamp(34px,3.8vw,44px);font-weight:800;letter-spacing:-0.04em;line-height:1;color:#fff;text-transform:lowercase}
  .kw-tch .kw-seat .kw-seat-price span{font-size:15px;font-weight:600;letter-spacing:0;color:#cdb6f5;margin-left:6px}
  .kw-tch .kw-seat .kw-seat-pill{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#B98CF0;background:#070708;border:1px solid rgba(155,90,234,.5);border-radius:999px;padding:5px 12px}
  .kw-tch .kw-seat .kw-seat-cta{font-size:16px;font-weight:700;color:#070708!important;background:var(--brat);border-radius:12px;padding:15px 26px;text-decoration:none;text-transform:lowercase;white-space:nowrap;transition:transform .18s;box-shadow:0 8px 30px rgba(123,234,90,.25)}
  .kw-tch .kw-seat .kw-seat-cta:hover{transform:translateY(-1px)}
  .kw-tch .kw-seat .kw-seat-fine{font-size:12px;line-height:1.45;color:#b9a7d8}
  .kw-tch .kw-seat .kw-seat-fine b{color:#fff}
  .kw-tch .kw-seat--compact{grid-template-columns:1fr;box-shadow:0 22px 60px rgba(0,0,0,.45)}
  .kw-tch .kw-seat--compact .kw-seat-l{padding:18px 22px 4px;justify-content:flex-start}
  .kw-tch .kw-seat--compact .kw-seat-title{font-size:clamp(26px,2.7vw,32px)}
  .kw-tch .kw-seat--compact .kw-seat-sub{font-size:15px;margin-top:8px}
  .kw-tch .kw-seat--compact .kw-seat-r{border-left:0;background:none;padding:14px 22px 18px;align-items:stretch;text-align:left;gap:9px;justify-content:flex-end}
  .kw-tch .kw-seat--compact .kw-seat-cta{text-align:center;padding:14px 20px}
  .kw-tch .kw-seat-wrap{margin-top:30px}
  @media (max-width:760px){
    .kw-tch .kw-seat{grid-template-columns:1fr}
    .kw-tch .kw-seat .kw-seat-l{padding:22px 20px}
    .kw-tch .kw-seat .kw-seat-r{border-left:0;border-top:1px solid rgba(155,90,234,.42);padding:20px}
    .kw-tch .kw-seat .kw-seat-cta{width:100%;text-align:center;white-space:normal}
    .kw-tch .kw-seat--compact .kw-seat-l{padding:16px 18px 2px}
    .kw-tch .kw-seat--compact .kw-seat-r{border-top:0;padding:12px 18px 16px}
  }

  /* B · call it.: copy + the room's steps side by side, the Goat's run sheet, then the widget near full screen */
  .kw-tch .ci-h{text-wrap:balance;font-size:clamp(28px,4vw,48px) !important;letter-spacing:-0.045em !important;line-height:1.04 !important}
  .kw-tch .ci-top{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,1fr);gap:48px;align-items:start;margin-top:26px}
  .kw-tch .ci-top .lede{max-width:none;margin-top:0}
  .kw-tch .ci-top .lede + .lede{margin-top:14px}
  .kw-tch .ci-top h2.wide{max-width:none}
  .kw-tch .ci-steps{padding-top:4px}
  .kw-tch .ci-steps .ci-steps-h{font-size:10.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--dimmer);margin:0 0 14px}
  @media (max-width:860px){.kw-tch .ci-top{grid-template-columns:1fr;gap:28px}.kw-tch .ci-steps{padding-top:0}}
  .kw-tch .goat-how{margin-top:44px;display:grid;grid-template-columns:auto minmax(0,1fr);gap:22px;align-items:start;background:#0B0D0B;border:1px solid #242A24;border-radius:18px;padding:22px 26px}
  .kw-tch .goat-how .gh-goat svg{display:block;width:44px;height:73px}
  .kw-tch .goat-how .gh-kick{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--brat)}
  .kw-tch .goat-how .gh-line{font-size:clamp(18px,2.2vw,22px);font-weight:800;letter-spacing:-.03em;line-height:1.2;color:var(--ink);margin-top:4px}
  .kw-tch .goat-how .gh-steps{list-style:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:14px}
  .kw-tch .goat-how .gh-steps li{font-size:13.5px;line-height:1.5;color:var(--dim);border-top:1px solid #242A24;padding-top:10px}
  .kw-tch .goat-how .gh-steps b{display:block;color:var(--brat);font-weight:800;letter-spacing:-.02em;font-size:15px;margin-bottom:3px}
  .kw-tch .goat-how .gh-room{margin-top:16px;font-size:14px;line-height:1.55;color:var(--dim);border-left:2px solid rgba(155,90,234,.6);padding-left:12px}
  .kw-tch .goat-how .gh-room b{color:var(--ink);font-weight:600}
  @media (max-width:760px){.kw-tch .goat-how{grid-template-columns:1fr;gap:10px;padding:18px}.kw-tch .goat-how .gh-goat svg{width:30px;height:50px}.kw-tch .goat-how .gh-steps{grid-template-columns:1fr;gap:10px}}
  .kw-tch .ci-stage{max-width:1400px;margin:30px auto 0;padding:0 24px}
  .kw-tch .ci-stage .present.callit{margin-top:0}
  @media (min-width:861px){
    .kw-tch .ci-stage .ci-grid{grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);align-items:stretch;height:clamp(560px,calc(100vh - 150px),860px);height:clamp(560px,calc(100svh - 150px),860px)}
    .kw-tch .ci-stage .proof-frame{aspect-ratio:auto;height:100% !important}
    .kw-tch .ci-stage .ci-panel{overflow:auto}
  }
  @media (max-width:860px){
    .kw-tch .ci-stage{padding:0 12px}
    .kw-tch .ci-stage .proof-frame{aspect-ratio:auto;height:clamp(440px,64vh,600px) !important;height:clamp(440px,64svh,600px) !important}
  }
  .kw-tch .present.callit:fullscreen .ci-grid{height:calc(100vh - 90px)}
  .kw-tch .present.callit:fullscreen .proof-frame{aspect-ratio:auto;height:100% !important}

  /* C · the quote, on its own, assembling out of particles as you scroll (JS adds .q-live; without it the text just shows) */
  .kw-tch .tch-quote{position:relative;min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:100px 0;overflow:hidden}
  .kw-tch .tch-quote .q-fx{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
  .kw-tch .tch-quote .wrap{position:relative;z-index:1}
  .kw-tch .tch-quote blockquote{font-size:clamp(30px,4.8vw,62px);font-weight:700;letter-spacing:-0.04em;line-height:1.08;max-width:17ch;margin:0 auto;text-wrap:balance;color:var(--ink)}
  .kw-tch .tch-quote blockquote .g{color:var(--brat)}
  .kw-tch .tch-quote cite{display:block;margin-top:26px;font-style:normal;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--dimmer);font-weight:700}
  .kw-tch .tch-quote.q-live blockquote,.kw-tch .tch-quote.q-live cite{opacity:0}
  @media (max-width:760px){.kw-tch .tch-quote{min-height:70vh;padding:70px 0}}
</style>
'''
src = swap(src, '<div class="kw-tch">\n<div class="page">', CSS + '<div class="kw-tch">\n<div class="page">', 1, 'css')

# ── A · the banner ────────────────────────────────────────────────────────────────────────
HERO = '''  <!-- KW:TEACH-V6 (18 Oct 2026) · A · the banner: one screen, the Home / for-parents layout. The h1 is the 17 Oct opener;
       the email is the Jayden ad's own (subject + lines, one by one) — the ad's message match; the seat card is purple
       because it is the offer. Paints from this markup alone; nothing here carries data-reveal. -->
  <header class="hero kp-ban" id="tchBan">
    <div class="hero-bg"></div>
    <div class="kp-pb" aria-hidden="true"><div class="pb-host" id="pbHost"><canvas id="pbCv"></canvas></div></div>
    <div class="wrap kp-ban-in">
      <p class="kp-ban-eye">knowhere &middot; teach it.</p>
      <h1>You can&#8217;t learn it for them.<br><span style="color:var(--brat)">You&#8217;re still the one who answers for it.</span></h1>
      <p class="kp-ban-sub">You&#8217;ve seen this email.</p>
      <div class="kp-ban-pair">
        <div class="kp-mail" role="group" aria-label="An email in your inbox: Concerned about Jayden&#8217;s mark">
          <div class="kp-mail-bar"><span class="kp-mail-dot" aria-hidden="true"></span><span>Inbox &middot; 1 unread</span><span class="kp-mail-t">9:47 pm</span></div>
          <p class="kp-mail-subj">Concerned about Jayden&#8217;s mark</p>
          <p class="kp-mail-meta">to me</p>
          <div class="kp-mail-body"><span>Jayden has attended 4 of 11 lessons.</span><span>Jayden&#8217;s phone has attended all 11.</span><span>Jayden&#8217;s mark has arrived in your inbox as your problem.</span></div>
        </div>
        <div class="kw-seat kw-seat--compact">
          <div class="kw-seat-l">
            <p class="kw-seat-eye">Founding teachers</p>
            <p class="kw-seat-title">Free until 9 April.</p>
            <p class="kw-seat-sub">The first 50 keep a founding rate. No card.</p>
          </div>
          <div class="kw-seat-r">
            <a class="kw-seat-cta" data-kw-from="hero" href="''' + SEAT + '''">claim your founding seat</a>
            ''' + SEATLINE + '''
          </div>
        </div>
      </div>
      <!-- capture job 4: the "I ran it" quote slot. Empty and hidden until a founding teacher's real words go in. -->
      <figure class="ranit" id="tchRanIt" hidden><blockquote></blockquote><figcaption></figcaption></figure>
    </div>
    <a class="kp-cue" href="#tch-callit"><span>run a round</span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg></a>
  </header>

'''
src = cut(src, '  <header class="hero">\n', '  <!-- KW:TEACH-SITE-V2 (14 Oct 2026): the live call it. block is the first thing after the hero', HERO, 'hero')

# ── B · call it. + C · the quote ──────────────────────────────────────────────────────────
OLD_CALLIT_START = '  <!-- KW:TEACH-SITE-V2 (14 Oct 2026): the live call it. block is the first thing after the hero'
i = src.index(OLD_CALLIT_START); j = src.index('  <section class="block" id="tch-content">', i)
old = src[i:j]
# keep the live widget + the call it. panel exactly as they are (ids the page engine drives), lifted out whole
a = old.index('      <div class="present callit" id="tchPresent" data-reveal>')
b = old.index('      <div class="joinrow" data-reveal>')
present = old[a:b].rstrip() + '\n'
assert present.count('id="tchProofFrame"') == 1 and present.count('id="tchCallit"') == 1, 'present block'
present = swap(present, '<div class="proof-frame" id="tchProofFrame">', '<div class="proof-frame" id="tchProofFrame" data-fill="1">', 1, 'fill flag')
STEPS = old[old.index('        <ol class="soc-steps"'):old.index('        </ol>') + len('        </ol>')]
STEPS = STEPS.replace('<ol class="soc-steps" data-reveal style="transition-delay:.08s">', '<ol class="soc-steps">')
assert STEPS.count('<li>') == 5, 'steps'

CALLIT = '''  <!-- KW:TEACH-V6 (18 Oct 2026) · B · call it., the whole experience: the copy (the hero's old subline lives here now) with
       the room's five steps beside it, the Goat's run sheet, then the live widget near full screen (the real
       volumetric-analysis knowscape, canvas filling the frame) beside its REAL call it. round, then the purple seat card. -->
  <section class="block" id="tch-callit">
    <div class="wrap">
      <span class="kicker" data-reveal>Interactive collaborative learning</span>
      <h2 class="wide ci-h" data-reveal>Poke it, present it, play it out.<br><span style="color:var(--brat)">Run the room.</span></h2>
      <div class="ci-top">
        <div class="ci-copy">
          <p class="lede" data-reveal>So knowhere &middot; teach it. hands the room the thinking. You put a live model on the projector and push it around &#8212; then the class does. Every concept arrives reframed the way they already talk: a picture from their world, where it turns up in the wild, and the exact point the picture breaks.</p>
          <p class="lede" data-reveal>Then they <strong>call it.</strong> A what-if, three answers, one impostor. Pairs commit out loud before the model settles it &#8212; no leaderboard, no speed points, just a room that has to think before it finds out. Most classroom tech is a screen the room watches. This one the room plays. <em>They own it by the bell.</em></p>
        </div>
        <div class="ci-steps" data-reveal style="transition-delay:.08s">
          <p class="ci-steps-h">What happens in the room</p>
''' + STEPS + '''
        </div>
      </div>
      <div class="goat-how" data-reveal>
        <div class="gh-goat" aria-hidden="true">''' + GOAT + '''</div>
        <div class="gh-body">
          <p class="gh-kick">The Goat&#8217;s run sheet</p>
          <p class="gh-line">Play this one like your class would.</p>
          <ol class="gh-steps">
            <li><b>1 &#183; poke it.</b>Drag the burette up to 20.00 mL. Watch the pH, the indicator and the flask.</li>
            <li><b>2 &#183; call it.</b>Read the what-if and pick 1, 2 or 3 &#8212; before you know.</li>
            <li><b>3 &#183; the reveal.</b>Hit Reveal on the model and let it settle the argument.</li>
          </ol>
          <p class="gh-room"><b>In a classroom:</b> it&#8217;s on the projector. You drag, they watch. Pairs hold up 1, 2 or 3, out loud, then the model settles it in front of everyone. Hit Present to see it the way the room would.</p>
        </div>
      </div>
    </div>
    <div class="ci-stage">
''' + present + '''    </div>
    <div class="wrap">
      <div class="kw-seat kw-seat-wrap" data-reveal>
        <div class="kw-seat-l">
          <p class="kw-seat-eye">Founding teachers</p>
          <p class="kw-seat-title">Free until 9 April.</p>
          <p class="kw-seat-sub">The first 50 keep a founding rate.</p>
          <p class="kw-seat-p">Every Physics, Chemistry, Biology and Psychology concept has a round like this, Year 11 and 12, ready for your projector. No card. Your subject next.</p>
        </div>
        <div class="kw-seat-r">
          <span class="kw-seat-pill">founding seat</span>
          <a class="kw-seat-cta" data-kw-from="callit" href="''' + SEAT + '''">claim your founding seat</a>
          ''' + SEATLINE + '''
        </div>
      </div>
    </div>
  </section>

  <!-- KW:TEACH-V6 · C · the quote on its own, centred. The words are real text (screen readers, no JS, reduced motion); the
       page engine (QuoteFx) draws them as particles that gather into the line as it scrolls into view, then hands over. -->
  <section class="tch-quote" id="tchQuote">
    <canvas class="q-fx" aria-hidden="true"></canvas>
    <div class="wrap">
      <blockquote>&#8220;I cannot teach anybody anything. <span class="g">I can only make them think.</span>&#8221;</blockquote>
      <cite>Attributed to Socrates &#183; still the whole job</cite>
    </div>
  </section>

'''
src = src[:i] + CALLIT + src[j:]

# ── the page engine ───────────────────────────────────────────────────────────────────────
src = swap(src, "this._stopBanner=window.KnowhereParticleBanner(root,'For teachers','apples');",
           "this._stopBanner=window.KnowhereParticleBanner(root,'','apples');   /* KW:TEACH-V6: the apples at the banner's foot, no title */", 1, 'banner boot')

FILL = (".kw-fill-c{height:100%!important;display:flex!important;flex-direction:column!important}"
        "html,body{height:100%!important}"
        "[data-kwfill]{flex:1 1 auto!important;min-height:0!important;display:flex!important;flex-direction:column!important;padding:14px 16px 12px!important}"
        "[data-kwfill] .card-hint,[data-kwfill] .titres{display:none!important}"
        "[data-kwfill] .canvas-wrapper{flex:1 1 auto!important;aspect-ratio:auto!important;min-height:0!important;height:auto!important;margin-bottom:10px!important}"
        "@media (max-width:520px){[data-kwfill] .stat-value{font-size:20px!important}[data-kwfill]{padding:12px 12px 10px!important}}")
src = swap(src, "          d.head.appendChild(st);\n",
"""          d.head.appendChild(st);
          /* KW:TEACH-V6: data-fill — the frame's height comes from the page; the card fills it and its canvas takes the rest */
          if(box.getAttribute('data-fill')){ el.setAttribute('data-kwfill',''); cont.classList.add('kw-fill-c'); var st2=d.createElement('style'); st2.textContent='""" + FILL + """'; d.head.appendChild(st2); }
""", 1, 'fill css')
src = swap(src, "      if(dead||!crop()||!cropEl) return;\n",
           "      if(dead||!crop()||!cropEl) return;\n      if(box.getAttribute('data-fill')){ box.classList.add('on'); return; }   /* KW:TEACH-V6 */\n", 1, 'fit fill')
src = swap(src, "      var on=!fs && h.bottom < 80 && j.top > window.innerHeight - 40;\n",
"""      var on=!fs && h.bottom < 80 && j.top > window.innerHeight - 40;
      if(on){ var sc=root.querySelectorAll('.kw-seat'); for(var si=0;si<sc.length;si++){ var sr=sc[si].getBoundingClientRect(); if(sr.top<window.innerHeight&&sr.bottom>0){ on=false; break; } } }   /* KW:TEACH-V6: never two offers on screen */
      if(on){ var stg=root.querySelector('.ci-stage'); if(stg){ var gr=stg.getBoundingClientRect(), mid=window.innerHeight/2; if(gr.top<mid&&gr.bottom>mid) on=false; } }   /* …and never over the live widget's controls */
""", 1, 'joinbar')

QUOTE_JS = r'''  /* ── KW:TEACH-V6: the quote assembles out of particles as it scrolls in ──
     The real blockquote is laid out by the browser; each word is drawn into an offscreen canvas exactly where it sits
     (Range rects, the element's own font and colour) and sampled into points. Points rise from below and gather into
     the words as the section scrolls up the screen (scroll-linked, so scrolling back unpicks it); at the end the real
     text fades in over them and the points settle to a faint shimmer. Reduced motion / no canvas: the text just shows. */
  function QuoteFx(root, reduce){
    var sec=root.querySelector('#tchQuote'); if(!sec) return function(){};
    var bq=sec.querySelector('blockquote'), cite=sec.querySelector('cite'), cv=sec.querySelector('.q-fx');
    if(reduce||!bq||!cv||!cv.getContext||!document.createRange) return function(){};
    var ctx=cv.getContext('2d'); if(!ctx) return function(){};
    sec.classList.add('q-live');
    var dpr=Math.min(window.devicePixelRatio||1,2), W=0, H=0, pts=[], raf=0, vis=false, dead=false, t0=performance.now();
    function build(){
      var r=sec.getBoundingClientRect(); W=r.width; H=r.height; if(!W||!H) return;
      cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); ctx.setTransform(dpr,0,0,dpr,0,0);
      var off=document.createElement('canvas'); off.width=Math.ceil(W); off.height=Math.ceil(H);
      var o=off.getContext('2d'); if(!o) return;
      var walker=document.createTreeWalker(bq, NodeFilter.SHOW_TEXT, null), node, rg=document.createRange();
      while((node=walker.nextNode())){
        var pe=node.parentElement, cs=window.getComputedStyle(pe);
        o.font=cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
        try{ if('letterSpacing' in o) o.letterSpacing=cs.letterSpacing; }catch(e){}
        o.fillStyle=cs.color; o.textBaseline='alphabetic';
        var fs=parseFloat(cs.fontSize)||40, re=/\S+/g, m, txt=node.nodeValue;
        while((m=re.exec(txt))){
          rg.setStart(node,m.index); rg.setEnd(node,m.index+m[0].length);
          var q=rg.getClientRects()[0]; if(!q) continue;
          var mt=o.measureText(m[0]), asc=mt.fontBoundingBoxAscent||fs*0.92, des=mt.fontBoundingBoxDescent||fs*0.24;
          o.fillText(m[0], q.left-r.left, q.top-r.top+(q.height-(asc+des))/2+asc);
        }
      }
      var img=o.getImageData(0,0,off.width,off.height).data, step=W<700?3:4, out=[];
      for(var y=0;y<off.height;y+=step){ for(var x=0;x<off.width;x+=step){
        var k=(y*off.width+x)*4; if(img[k+3]<140) continue;
        out.push({tx:x, ty:y, c:'rgba('+img[k]+','+img[k+1]+','+img[k+2]+',', d:Math.random(),
          sx:x+(Math.random()-0.5)*W*0.7, sy:y+H*(0.35+Math.random()*0.75), w:Math.random()*6.283, s:1.3+Math.random()*1.1});
      } }
      var MAX=W<700?1700:3200; while(out.length>MAX) out.splice(Math.floor(Math.random()*out.length),1);
      pts=out;
    }
    function progress(){
      var r=sec.getBoundingClientRect(), vh=window.innerHeight||800;
      var p=(vh-r.top-vh*0.12)/(vh*0.62); return p<0?0:(p>1?1:p);
    }
    function draw(now){
      raf=0; if(dead) return;
      var p=progress(), t=(now-t0)/1000;
      var show=p<0.86?0:(p-0.86)/0.14; if(show>1) show=1;
      bq.style.opacity=show.toFixed(3); if(cite) cite.style.opacity=Math.max(0,show*1.4-0.4).toFixed(3);
      ctx.clearRect(0,0,W,H);
      var fade=1-show*0.82;
      for(var i=0;i<pts.length;i++){
        var q=pts[i], e=(p-q.d*0.32)/0.62; e=e<0?0:(e>1?1:e); e=1-Math.pow(1-e,3);
        var wob=(1-e)*14;
        var x=q.sx+(q.tx-q.sx)*e+Math.sin(t*1.3+q.w)*wob+Math.sin(t*0.9+q.w*2)*0.6*e;
        var y=q.sy+(q.ty-q.sy)*e+Math.cos(t*1.1+q.w)*wob;
        var a=(0.28+0.67*e)*fade*(0.8+0.2*Math.sin(t*2+q.w));
        if(a<0.01) continue;
        ctx.fillStyle=q.c+a.toFixed(3)+')';
        var s=q.s*(1.3-0.25*e); ctx.fillRect(x-s/2,y-s/2,s,s);
      }
      if(vis) raf=requestAnimationFrame(draw);
    }
    function kick(){ if(!raf&&vis&&!dead) raf=requestAnimationFrame(draw); }
    var io=null;
    if('IntersectionObserver' in window){
      io=new IntersectionObserver(function(es){ es.forEach(function(e){ vis=e.isIntersecting; }); kick(); },{threshold:0});
      io.observe(sec);
    } else { vis=true; }
    var onResize=function(){ build(); kick(); };
    window.addEventListener('resize', onResize);
    var go=function(){ if(dead) return; build(); kick(); };
    if(document.fonts&&document.fonts.ready){ document.fonts.ready.then(go).catch(go); } else { go(); }
    return function(){ dead=true; if(raf) cancelAnimationFrame(raf); if(io) io.disconnect(); window.removeEventListener('resize', onResize); sec.classList.remove('q-live'); bq.style.opacity=''; if(cite) cite.style.opacity=''; };
  }

  window.KWTeachers = function(root){
'''
src = swap(src, "  window.KWTeachers = function(root){\n", QUOTE_JS, 1, 'quote fx')
src = swap(src, "    stops.push(Seats(root));\n", "    stops.push(Seats(root));\n    stops.push(QuoteFx(root, reduce));   /* KW:TEACH-V6 */\n", 1, 'quote boot')

if DRY:
    print('dry run OK — all anchors matched; nothing written'); sys.exit(0)
stamp = time.strftime('%Y%m%d-%H%M%S')
bak = os.path.join(ROOT, '_patches', 'landing-v2', 'bak-tch6-' + stamp)
os.makedirs(bak, exist_ok=True)
shutil.copy2(P, os.path.join(bak, 'for-teachers.html'))
open(P, 'w', encoding='utf-8').write(src)
back = open(P, encoding='utf-8').read()
for needle in ['KW:TEACH-V6', 'id="tchBan"', 'You&#8217;ve seen this email.', 'Poke it, present it, play it out.', 'id="tchQuote"',
               "KnowhereParticleBanner(root,'','apples')", 'data-fill="1"', 'function QuoteFx(', 'Interactive collaborative learning']:
    assert needle in back, 'receipt missing: ' + needle
for gone in ['<div class="joinrow" data-reveal>', 'class="page-banner"', 'Ask the right question.<br>', '<div class="soc">']:
    assert gone not in back, 'still present: ' + gone
assert back.count('<span data-seat-text>') == 4, 'seat lines: %d' % back.count('<span data-seat-text>')
print('applied ✓  backup:', os.path.relpath(bak, ROOT))
