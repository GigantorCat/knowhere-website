#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
knowhere.me — for-teachers rework, round two (KW:TEACH-SITE-V2, 14 Oct 2026) — Cat's tweaks on the 13 Oct page.

Run AFTER apply-teach-site.py, from the website folder:

    cd ~/Code/knowhere/website/knowhere-website && python3 _patches/teach-site/apply-teach-site-v2.py

What changes (all-or-nothing, idempotent, backups in _patches/teach-site/bak-v2-<stamp>/):
  · the live call it. block is now the first block after the hero, with its own headline + the Socratic callout under it
  · the round is Volumetric analysis (Chemistry) — fission already lives on for-parents / experience-it
  · one purple signup block (the founding offer + what lands when) replaces founding + waitlist cards; "claim your founding seat"
  · a sticky purple bar (the signup block, collapsed) rides along once the hero scrolls out and hides at the signup block
  · "eight slides" lede says add your own; a ninth "your slide." card; headline breaks after "Eight slides,"
  · what's in the box = three features that scroll (sharing · your own knowscapes · homeplay); day one / Term 1 moved to signup
  · callout left-aligned, "One of them was built this decade." on its own line
  · IT note opens in a new tab; lockup "knowhere · teachit" (teach in purple); IT page brand fixed (knowhere is one word)
"""
import os, re, sys, time, subprocess, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.getcwd()
STAMP = time.strftime('%Y%m%d-%H%M%S')
MARK = 'KW:TEACH-SITE-V2'

def die(m): print('✗ ' + m); sys.exit(1)
def rd(p):
    with open(p, encoding='utf-8') as f: return f.read()
def rep(src, old, new, n=1, label=''):
    c = src.count(old)
    if c != n: die('anchor count %d (wanted %d) for %s: %r' % (c, n, label, old[:70]))
    return src.replace(old, new)

FT = os.path.join(ROOT, 'for-teachers.html'); IT = os.path.join(ROOT, 'for-your-it-team.html')
for f in (FT, IT):
    if not os.path.exists(f): die('missing %s — run apply-teach-site.py first, from the website folder' % os.path.basename(f))
ft = rd(FT)
if MARK in ft: print('• already carries %s — nothing to do' % MARK); sys.exit(0)
if 'KW:TEACH-SITE' not in ft: die('for-teachers.html has no KW:TEACH-SITE — run apply-teach-site.py first')

SIGNUP = 'https://app.knowhere.me/signup?as=teacher'
POSTER = '/for-teachers-proof-titration.jpg'

CSS = r'''<style id="KW_TEACH_SITE">
  /* KW:TEACH-SITE (13 Oct 2026) + ''' + MARK + r''' (14 Oct): live call it. first, Socratic callout, purple signup + sticky bar */
  .kw-tch .hero p em{display:block;margin-top:10px}
  .kw-tch .block .lede strong{color:var(--ink);font-weight:600}
  .kw-tch .block h2.wide{max-width:30ch}
  .kw-tch .strap{margin-top:14px;font-size:clamp(15px,1.7vw,18px);font-weight:700;letter-spacing:-0.02em;color:var(--brat)}
  /* ── the live call it. block ── */
  .kw-tch .present.callit{padding:16px}
  .kw-tch .ci-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:14px;align-items:start}
  @media (max-width:860px){.kw-tch .ci-grid{grid-template-columns:1fr}}
  .kw-tch .proof-frame{position:relative;background:#0c0d0f;aspect-ratio:916/1450;overflow:hidden;border-radius:12px;border:1px solid rgba(255,255,255,.08)}
  .kw-tch .proof-frame .poster-link{display:block;position:absolute;inset:0}
  .kw-tch .proof-frame img.poster{display:block;width:100%;height:100%;object-fit:cover;object-position:top}
  .kw-tch .proof-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;background:transparent;opacity:0;pointer-events:none;transition:opacity .35s}
  .kw-tch .proof-frame.on{aspect-ratio:auto}
  .kw-tch .proof-frame.on iframe{opacity:1;pointer-events:auto}
  .kw-tch .proof-frame.on .poster-link{visibility:hidden}
  .kw-tch .ci-panel{border:1px solid rgba(123,234,90,.22);border-radius:14px;padding:18px 18px 16px;background:linear-gradient(170deg,rgba(123,234,90,.05),rgba(255,255,255,.015));display:flex;flex-direction:column;gap:12px;min-height:100%}
  .kw-tch .ci-head{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--brat);font-weight:700}
  .kw-tch .ci-head .st{color:var(--dimmer);font-weight:600;letter-spacing:.1em}
  .kw-tch .ci-sit{font-size:13.5px;line-height:1.55;color:#b9b8b4}
  .kw-tch .ci-sit b{color:var(--ink);font-weight:600}
  .kw-tch .ci-q{font-size:clamp(18px,2.2vw,22px);font-weight:700;letter-spacing:-0.03em;line-height:1.2;text-wrap:balance}
  .kw-tch .ci-q .k{display:block;font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--dimmer);font-weight:700;margin-bottom:6px}
  .kw-tch .ci-opts{display:grid;gap:8px}
  .kw-tch .ci-opt{display:flex;align-items:center;gap:12px;width:100%;text-align:left;font-family:inherit;font-size:14.5px;font-weight:500;color:var(--ink);background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:11px 14px;cursor:pointer;transition:border-color .18s,background .18s,transform .18s}
  .kw-tch .ci-opt b{flex-shrink:0;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:800;color:#070708;background:var(--ink)}
  .kw-tch .ci-opt:hover{border-color:rgba(123,234,90,.6);transform:translateY(-1px)}
  .kw-tch .ci-opt.mine{border-color:var(--brat);background:rgba(123,234,90,.08)}
  .kw-tch .ci-opt.mine b{background:var(--brat)}
  .kw-tch .ci-opt.sus{border-color:rgba(252,184,21,.7);background:rgba(252,184,21,.07)}
  .kw-tch .ci-opt.sus b{background:#FCB815}
  .kw-tch .ci-opt.legit{border-color:var(--brat)}
  .kw-tch .ci-opt.legit b{background:var(--brat)}
  .kw-tch .ci-opt:disabled{cursor:default;transform:none}
  .kw-tch .ci-foot{font-size:12.5px;color:var(--dim);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;min-height:34px}
  .kw-tch .ci-foot .fsbtn{margin-left:auto}
  .kw-tch .ci-foot .fsbtn[hidden]{display:none}
  @media (max-width:480px){.kw-tch .present.callit .hud .hud-sub{display:none}}
  .kw-tch .ci-reveal{display:none;flex-direction:column;gap:9px;border-top:1px dashed rgba(255,255,255,.14);padding-top:12px}
  .kw-tch .ci-reveal.on{display:flex}
  .kw-tch .ci-sus{font-size:clamp(20px,2.6vw,26px);font-weight:800;letter-spacing:-0.035em;line-height:1.1}
  .kw-tch .ci-sus b{color:#FCB815}
  .kw-tch .ci-line{font-size:14px;color:#FCB815;font-style:italic}
  .kw-tch .ci-trick{font-size:14px;line-height:1.55;color:#b9b8b4}
  .kw-tch .ci-trick b{color:var(--ink);font-weight:600}
  .kw-tch .ci-you{font-size:13px;color:var(--brat);font-weight:600}
  .kw-tch .ci-model{font-size:12px;color:var(--dimmer);letter-spacing:.02em}
  .kw-tch .present.callit:fullscreen{padding:24px;border-radius:0;display:flex;flex-direction:column;justify-content:center;background:#050506}
  .kw-tch .present.callit:fullscreen .ci-grid{max-width:1400px;width:100%;margin:0 auto}
  .kw-tch .present.callit:-webkit-full-screen{padding:24px;border-radius:0}
  /* the in-page join row under the round */
  .kw-tch .joinrow{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:26px}
  .kw-tch .joinrow .fine{font-size:13px;color:var(--dim)}
  .kw-tch .joinrow .fine b{color:var(--ink);font-weight:600}
  /* ── Socratic callout ── */
  .kw-tch .soc{margin-top:34px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:26px;align-items:start}
  @media (max-width:860px){.kw-tch .soc{grid-template-columns:1fr}}
  .kw-tch .soc-q{border-left:3px solid var(--neuro);padding:6px 0 6px 22px}
  .kw-tch .soc-q blockquote{font-size:clamp(22px,2.8vw,32px);font-weight:700;letter-spacing:-0.035em;line-height:1.14;text-wrap:balance;color:var(--ink)}
  .kw-tch .soc-q cite{display:block;margin-top:12px;font-style:normal;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--dimmer);font-weight:700}
  .kw-tch .soc-steps{list-style:none;display:flex;flex-direction:column;gap:0}
  .kw-tch .soc-steps li{display:grid;grid-template-columns:22px minmax(0,1fr);gap:14px;padding:12px 0;border-top:1px solid var(--line)}
  .kw-tch .soc-steps li:first-child{border-top:0;padding-top:0}
  .kw-tch .soc-steps .n{font-size:11px;font-weight:800;letter-spacing:.14em;color:var(--neuro);padding-top:3px}
  .kw-tch .soc-steps .s{font-size:14.5px;line-height:1.5;color:var(--dim)}
  .kw-tch .soc-steps .s b{color:var(--ink);font-weight:600}
  .kw-tch .soc-steps .s i{font-style:normal;color:var(--brat);font-weight:700}
  /* ── callout: left, one line each ── */
  .kw-tch .callout{margin:34px 0 0;max-width:none;text-align:left}
  .kw-tch .callout .g{display:block;white-space:nowrap}
  @media (max-width:520px){.kw-tch .callout .g{white-space:normal}}
  /* ── the deck: eight verbs + your slide ── */
  .kw-tch .verbs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:30px;counter-reset:verb}
  @media (max-width:760px){.kw-tch .verbs{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media (max-width:420px){.kw-tch .verbs{grid-template-columns:1fr}}
  .kw-tch .verb{position:relative;border:1px solid var(--line);border-radius:16px;padding:18px 16px 16px;background:rgba(255,255,255,0.018);min-height:150px;display:flex;flex-direction:column;gap:6px;transition:border-color .3s,transform .4s cubic-bezier(.2,.7,.2,1)}
  .kw-tch .verb:hover{border-color:rgba(123,234,90,.45);transform:translateY(-2px)}
  .kw-tch .verb::before{counter-increment:verb;content:counter(verb,decimal-leading-zero);position:absolute;top:14px;right:14px;font-size:10.5px;font-weight:700;letter-spacing:.16em;color:var(--dimmer)}
  .kw-tch .verb .v{font-size:19px;font-weight:800;letter-spacing:-0.035em;color:var(--brat);line-height:1}
  .kw-tch .verb .s{font-size:10.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--dimmer)}
  .kw-tch .verb p{font-size:13.5px;line-height:1.55;color:var(--dim);margin-top:4px;text-wrap:pretty}
  .kw-tch .verb p em{font-style:normal;color:var(--ink);font-weight:500}
  .kw-tch .verb.call{border-color:rgba(252,184,21,.35)} .kw-tch .verb.call .v{color:#FCB815}
  .kw-tch .verb.take{border-color:rgba(155,90,234,.35)} .kw-tch .verb.take .v{color:var(--neuro)}
  .kw-tch .verb.yours{border-style:dashed;border-color:rgba(237,236,232,.28);background:transparent} .kw-tch .verb.yours .v{color:var(--ink)} .kw-tch .verb.yours::before{content:'+';font-size:16px}
  /* ── answers: four cards, 2×2 ── */
  .kw-tch .modecards.four{grid-template-columns:repeat(2,minmax(0,1fr))}
  @media (max-width:760px){.kw-tch .modecards.four{grid-template-columns:1fr}}
  .kw-tch .mcard p a{color:var(--brat);text-decoration:underline;text-underline-offset:3px}
  /* ── the signup block: purple is the offer colour (ruled 14 Oct 2026, with the exam pass) ── */
  .kw-tch .cta-band{padding:70px 0 100px}
  .kw-tch .join{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:28px;align-items:center;background:linear-gradient(100deg,#7c47d6,#5b2fa6);color:#fff;border-radius:26px;padding:38px 40px;box-shadow:0 26px 70px rgba(124,71,214,.28)}
  @media (max-width:760px){.kw-tch .join{grid-template-columns:1fr;gap:22px;padding:28px 24px}}
  .kw-tch .join .j-eyebrow{display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:11px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.72);margin-bottom:14px}
  .kw-tch .lockup{font-size:15px;font-weight:700;letter-spacing:-0.04em;text-transform:none;color:#fff}
  .kw-tch .lockup b{font-weight:700;color:var(--brat)}
  .kw-tch .lockup .tv{color:#cdb6f5}
  .kw-tch .join .lockup{color:rgba(255,255,255,.72)} .kw-tch .join .lockup b{color:#fff} .kw-tch .join .lockup .tv{color:#fff}
  .kw-tch .join h3{font-size:clamp(26px,3.4vw,40px);font-weight:800;letter-spacing:-0.045em;line-height:1.04;color:#fff;margin-bottom:12px;text-wrap:balance}
  .kw-tch .join p{font-size:15.5px;line-height:1.62;color:rgba(255,255,255,.84);max-width:48ch}
  .kw-tch .join p b{color:#fff;font-weight:700}
  .kw-tch .join .when{list-style:none;margin-top:18px;display:flex;flex-direction:column;gap:8px}
  .kw-tch .join .when li{display:grid;grid-template-columns:84px minmax(0,1fr);gap:12px;font-size:13.5px;line-height:1.5;color:rgba(255,255,255,.84)}
  .kw-tch .join .when li b{font-size:10.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#fff;padding-top:3px}
  .kw-tch .join .j-side{display:flex;flex-direction:column;gap:14px;align-items:flex-start}
  @media (min-width:761px){.kw-tch .join .j-side{align-items:flex-end;text-align:right}}
  .kw-tch .join .cta{font-size:16px;padding:17px 30px;box-shadow:0 12px 36px rgba(0,0,0,.28)}
  .kw-tch .join .f-seats{font-size:13.5px;font-weight:600;color:rgba(255,255,255,.86);display:flex;align-items:center;gap:7px}
  .kw-tch .join .f-seats::before{content:'';width:7px;height:7px;border-radius:50%;background:var(--brat);animation:tchPulse 2.4s ease-in-out infinite}
  .kw-tch .join .f-seats.still::before{animation:none;opacity:.8}
  .kw-tch .join .f-seats b{font-weight:800;color:#fff;font-variant-numeric:tabular-nums}
  .kw-tch .join.f-gone{background:rgba(255,255,255,0.03);box-shadow:none;border:1px solid var(--line)}
  .kw-tch .join .j-fine{font-size:12px;color:rgba(255,255,255,.62);line-height:1.5;max-width:30ch}
  /* ── the sticky bar: the signup block, collapsed ── */
  .kw-tch .joinbar{position:fixed;left:12px;right:12px;bottom:12px;z-index:150;display:flex;align-items:center;gap:14px;padding:11px 12px 11px 18px;border-radius:16px;background:linear-gradient(100deg,#7c47d6,#5b2fa6);color:#fff;box-shadow:0 18px 50px rgba(0,0,0,.45);transform:translateY(130%);opacity:0;transition:transform .35s cubic-bezier(.2,.7,.2,1),opacity .35s;pointer-events:none}
  .kw-tch .joinbar.on{transform:none;opacity:1;pointer-events:auto}
  .kw-tch .joinbar .jb-t{flex:1;min-width:0;font-size:14px;font-weight:700;letter-spacing:-0.01em;line-height:1.25}
  .kw-tch .joinbar .jb-t small{display:block;font-size:12px;font-weight:500;color:rgba(255,255,255,.72);margin-top:2px}
  .kw-tch .joinbar .cta{padding:12px 18px;font-size:14px;white-space:nowrap;box-shadow:none}
  @media (max-width:600px){.kw-tch .joinbar{left:8px;right:8px;bottom:8px;padding:10px 10px 10px 14px}.kw-tch .joinbar .jb-t{font-size:13px}.kw-tch .joinbar .jb-t small{display:none}.kw-tch .joinbar .cta{padding:11px 14px;font-size:13px}}
  .kw-tch .page{padding-bottom:0}
  @media (prefers-reduced-motion:reduce){.kw-tch .verb:hover,.kw-tch .ci-opt:hover{transform:none}.kw-tch .joinbar{transition:none}}
</style>'''

BODY = r'''  <nav>
    <a class="brand" href="/" style="display:flex;align-items:center;gap:9px">
      <span class="mark-wrap"><span class="mark-glow"></span><span class="navmark" data-kw-logo="24"></span></span>
      <span class="wordmark">know<b>here</b></span>
    </a>
    <div class="links">
      <a href="/how-it-works">How it works</a>
      <a href="/experience-it">Experience it</a>
      <a href="/pricing">Pricing</a>
      <a href="/for-parents">For parents</a>
      <a href="/for-teachers" class="here">For teachers</a>
      <a href="https://app.knowhere.me/login" style="display:inline-block;padding:10px 18px;font-size:13px;font-weight:700;letter-spacing:-0.01em;color:#070708;background:#EDECE8;border-radius:12px;text-decoration:none;box-shadow:0 6px 22px rgba(237,236,232,.18);transition:transform .18s,background .18s,box-shadow .18s">Log in</a>
      <!-- KW:TEACH-SITE (13 Oct 2026): one door. Every seat CTA goes to the app's stepped teacher signup — the account IS the
           seat (the app forwards the seat to this site's ledger). The email-capture modal is retired on this
           page; knowhere-waitlist.js stays loaded only so /api/waitlist keeps serving the app's seat forwarder. -->
      <a class="cta small" data-kw-cta data-kw-from="nav" href="''' + SIGNUP + r'''">claim a founding seat</a>
    </div>
  </nav>

  <header class="hero">
    <div class="hero-bg"></div>
    <div class="page-banner" aria-hidden="true">
      <div class="pb-host" id="pbHost"><canvas id="pbCv"></canvas></div>
    </div>
    <div class="wrap">
      <!-- KW:TEACH-SITE: hero ruled 13 Oct 2026 ("Taught in yours", round two) -->
      <h1 data-reveal>Year 12, in their language.<br>Taught in <span style="color:var(--brat)">yours</span>.</h1>
      <p data-reveal>Living models of every Physics and Chemistry concept, built the way Gen Z actually looks at things &#8212; inside a deck you can edit, present from anywhere, and send home as tonight&#8217;s homeplay. <em>Not a PDF of a PDF. A room that has to think.</em></p>
      <div class="row" data-reveal>
        <a class="cta" data-kw-from="hero" href="''' + SIGNUP + r'''">Claim your founding seat</a>
        <a class="ghost" href="#tch-callit">Run a call it. round</a>
      </div>
    </div>
    <a class="scroll-cue" href="#tch-callit" aria-label="Scroll to content"><span class="chev"></span></a>
  </header>

  <!-- ''' + MARK + r''' (14 Oct 2026): the live call it. block is the first thing after the hero (Cat: "it's the hero"). The real
       volumetric-analysis knowscape (/widgets/volumetric-analysis-chemistry.html, the public concept page's file) in a
       same-origin iframe, cropped by the page script to its interactive card; beside it the concept's REAL call it. round
       from the teacher layer (teach-notes.json: situation, mission, what-if, 1·2·3, impostor 2, right 3). "Reveal on the
       model" runs the round's own reveal step on the live widget (burette to 25.00 mL: equivalence, still colourless).
       Fission moved out: it already carries for-parents and experience-it. The JPG underneath is the pre-JS still. -->
  <section class="block" id="tch-callit">
    <div class="wrap">
      <span class="kicker" data-reveal>A different way to run the room</span>
      <h2 class="wide" data-reveal>Ask the right question.<br>Then let them call it.</h2>
      <p class="strap" data-reveal>lids down. pairs call it. then the model settles it.</p>
      <p class="lede" data-reveal>This is <strong>call it.</strong> &#8212; a what-if on a live model, three answers, and one of them is an impostor. Nobody waits for the teacher&#8217;s answer: pairs commit, out loud, before the reveal. No leaderboard, no speed points &#8212; just a room that has to think before it finds out. <em>Poke the burette first. Then make your call.</em></p>
      <div class="present callit" id="tchPresent" data-reveal>
        <div class="hud">
          <span>call it. | Volumetric analysis<span class="hud-sub"> &#183; Chemistry</span></span>
          <div class="btns"><button class="fsbtn ghost" id="tchReset" type="button">Reset</button><button class="fsbtn" id="tchFs" type="button">Present</button></div>
        </div>
        <div class="ci-grid">
          <div class="proof-frame" id="tchProofFrame">
            <a class="poster-link" href="/hsc/chemistry/volumetric-analysis" aria-label="Open volumetric analysis, a live knowhere concept"><img class="poster" src="''' + POSTER + r'''?v=1" width="916" height="1450" alt="One real knowhere concept, live: a titration for Year 12 Chemistry. Drag the burette and watch the pH, the indicator and the colour in the flask." loading="eager" decoding="async"></a>
            <iframe id="tchProofWidget" src="/widgets/volumetric-analysis-chemistry.html" title="Volumetric analysis &#8212; a live knowhere concept. Drag the burette and watch the flask." loading="eager" scrolling="no" tabindex="-1"></iframe>
          </div>
          <div class="ci-panel" id="tchCallit">
            <div class="ci-head"><span>call it.</span><span class="st" id="tchCiState">lids down</span></div>
            <p class="ci-sit">A pool test kit has you count drops until the colour flips. That&#8217;s a titration: the same job this burette does on a flask of acid. <b>Drag Burette volume delivered up to 20.00 mL. Watch pH level, Indicator and the colour in the flask.</b></p>
            <div class="ci-q"><span class="k">What if</span>you add exactly 25.00 mL &#8212; just enough NaOH to match all the acid?</div>
            <div class="ci-opts" role="group" aria-label="Call it: pick 1, 2 or 3">
              <button class="ci-opt" type="button" data-opt="1"><b>1</b><span>Pale pink, just starting</span></button>
              <button class="ci-opt" type="button" data-opt="2"><b>2</b><span>Pink: all the acid&#8217;s used up</span></button>
              <button class="ci-opt" type="button" data-opt="3"><b>3</b><span>Still colourless</span></button>
            </div>
            <div class="ci-foot"><span id="tchCiFoot">Pairs hold up fingers. Tap yours.</span><button class="fsbtn" id="tchCiReveal" type="button">Reveal on the model</button></div>
            <div class="ci-reveal" id="tchCiReveal2">
              <div class="ci-sus">Who&#8217;s sus? <b>Number 2.</b></div>
              <div class="ci-line">&#8220;Acid&#8217;s gone, so it&#8217;s pink. Done.&#8221;</div>
              <p class="ci-trick"><b>The real trick</b> is knowing equivalence is where the moles match &#8212; and phenolphthalein waits for pH 8.2. Here that takes one more drop of NaOH.</p>
              <div class="ci-you" id="tchCiYou"></div>
              <div class="ci-model" id="tchCiModel">Watch the flask: 25.00 mL in, pH 7.0, Indicator colourless &#8212; equivalence, and not a hint of pink.</div>
            </div>
          </div>
        </div>
      </div>
      <div class="joinrow" data-reveal>
        <a class="cta" data-kw-from="callit" href="''' + SIGNUP + r'''">Claim your founding seat</a>
        <span class="fine"><b>Every Physics and Chemistry concept has a round like this.</b> 50 founding seats &#183; free until Fri 9 April 2027.</span>
      </div>

      <!-- ''' + MARK + r''': the Socratic callout (Cat, 14 Oct: "this literally is socratic learning reframed") -->
      <div class="soc">
        <div class="soc-q" data-reveal>
          <blockquote>&#8220;I cannot teach anybody anything. I can only make them think.&#8221;</blockquote>
          <cite>Attributed to Socrates &#183; still the whole job</cite>
        </div>
        <ol class="soc-steps" data-reveal style="transition-delay:.08s">
          <li><span class="n">01</span><span class="s"><b>The claim.</b> Pairs commit to 1, 2 or 3 &#8212; out loud, before anyone knows. <i>call it.</i></span></li>
          <li><span class="n">02</span><span class="s"><b>The probing question.</b> A what-if on a model they can see, not a definition they can recite.</span></li>
          <li><span class="n">03</span><span class="s"><b>The contradiction.</b> The model does what it does. Who&#8217;s sus? <i>the reveal.</i></span></li>
          <li><span class="n">04</span><span class="s"><b>The pause.</b> The room goes quiet for a second. That silence is the lesson landing.</span></li>
          <li><span class="n">05</span><span class="s"><b>The revision.</b> They say it back in their own words &#8212; with a sus answer in the mix. <i>own it.</i></span></li>
        </ol>
      </div>
    </div>
  </section>

  <section class="block" id="tch-content">
    <div class="wrap">
      <span class="kicker" data-reveal>Why they glaze over</span>
      <h2 data-reveal>You're not the problem.<br>The material is.</h2>
      <p class="lede" data-reveal>The "multimedia resources" the study design points you to were built when Flash was the future. They still explain double-slit interference perfectly well &#8212; to a browser that no longer exists. knowhere rebuilt every Physics and Chemistry concept from the study design up, as something a Year 12 student will actually look at.</p>
      <div class="then-now">
        <div class="tn then" data-reveal aria-label="Illustrative: a typical legacy physics applet">
          <div class="lab">What you've got</div>
          <div class="applet">
            <div class="bar">Double Slit Experiment &#8212; Applet v1.3 (1999)</div>
            <div class="plot"><i></i></div>
            <div class="ctl"><span>Slit width</span><span>Wavelength</span><span>Reset</span><span>?</span></div>
          </div>
        </div>
        <div class="tn now" data-reveal style="transition-delay:.08s" aria-label="A Knowhere interactive widget: photons building an interference pattern one at a time">
          <div class="lab">What you could have</div>
          <div class="widget">
            <div class="wt">Physics &#183; Light &amp; matter &#183; Double-slit interference</div>
            <div class="stage"><canvas id="tchPhoton"></canvas></div>
            <div class="ctl"><span class="on">one photon at a time</span><span>the pattern still builds</span><span class="cnt" id="tchPhotonCount">0 photons</span></div>
          </div>
        </div>
      </div>
      <p class="callout" data-reveal>Both explain the same thing.<span class="g">One of them was built this decade.</span></p>
    </div>
  </section>

  <!-- KW:TEACH-SITE: the eight-verb deck (RULED 29 Sep: seven, + take it. 10 Oct), this order, lowercase with a full stop; + your slide (V2) -->
  <section class="block" id="tch-deck">
    <div class="wrap">
      <span class="kicker" data-reveal>Every concept is a deck</span>
      <h2 data-reveal>Eight slides,<br>built to make them think.</h2>
      <p class="lede" data-reveal>Every Physics and Chemistry concept comes as a deck in this order. Present it as it is, change any word by clicking it, or add slides of your own &#8212; your words, your pictures. <em>The thinking stays with the students. You run the room.</em></p>
      <div class="verbs">
        <div class="verb" data-reveal><div class="v">meet it.</div><div class="s">the hook</div><p>Why this concept exists, in one line the room didn't expect.</p></div>
        <div class="verb call" data-reveal style="transition-delay:.05s"><div class="v">call it.</div><div class="s">lids down</div><p>A what-if on the model. Pairs call 1, 2 or 3 &#8212; and one answer's an impostor.</p></div>
        <div class="verb" data-reveal style="transition-delay:.1s"><div class="v">poke it.</div><div class="s">the live knowscape</div><p>Full screen on the projector. Change one thing, watch what breaks.</p></div>
        <div class="verb" data-reveal style="transition-delay:.15s"><div class="v">picture it.</div><div class="s">the topic's analogy</div><p>The everyday picture for the whole topic &#8212; and exactly where it breaks.</p></div>
        <div class="verb" data-reveal style="transition-delay:.2s"><div class="v">spot it.</div><div class="s">in the wild</div><p>This concept, somewhere they've already seen it. <em>Teachers only &#8212; the student app doesn't show it.</em></p></div>
        <div class="verb" data-reveal style="transition-delay:.25s"><div class="v">know it.</div><div class="s">the three to keep</div><p>What the marker wants, in three lines. The exam angle, said out loud.</p></div>
        <div class="verb" data-reveal style="transition-delay:.3s"><div class="v">own it.</div><div class="s">in their own words</div><p>A trick question with a sus answer in it. Do they really get it? IYKYK.</p></div>
        <div class="verb take" data-reveal style="transition-delay:.35s"><div class="v">take it.</div><div class="s">tonight's homeplay</div><p>One QR, one thing to try on their phone. Not a worksheet.</p></div>
        <div class="verb yours" data-reveal style="transition-delay:.4s"><div class="v">your slide.</div><div class="s">add your own</div><p>Your words, your picture &#8212; or this concept shown your way, as a new knowscape inside the deck.</p></div>
      </div>
    </div>
  </section>

  <!-- WHAT'S IN THE BOX — three features that scroll (V2: day one / Term 1 moved to the signup block) -->
  <div class="stack" id="stackBox" style="height:480vh">
      <div class="snapmark" style="top:67.5vh"></div>
      <div class="snapmark" style="top:202.5vh"></div>
      <div class="snapmark" style="top:337.5vh"></div>
    <div class="stack-viewport">
      <div class="stack-cv" id="cvBox"></div>
      <div class="stack-inner">
        <div class="stack-head">
          <span class="kicker">What's in the box</span>
          <h2>Built for the room, and the bus home</h2>
        </div>
        <div class="stack-cards">
          <div class="scard">
          <div class="n">&#8599;</div>
          <h3>Seamless sharing.</h3>
          <p>Send any slide to the class as a link. It opens in any browser &#8212; <em>no student login, no "did everyone get the email", no printing</em> &#8212; and it always shows your latest words.</p>
          </div>
          <div class="scard">
          <div class="n">+</div>
          <h3>Your own knowscapes.</h3>
          <p>Need a concept shown your way? Ask for a new knowscape inside the deck &#8212; the concept's own poke it. stays. <strong>Free rein for the founding term.</strong></p>
          </div>
          <div class="scard">
          <div class="n">QR</div>
          <h3>Homeplay they'll actually play with.</h3>
          <p>The last slide of every deck is tonight's take it.: one QR, one thing to try on their phone. <strong>Built for the bus home, not the printer.</strong></p>
          </div>
        </div>
        <div class="stack-dots" aria-hidden="true"><span></span><span></span><span></span></div>
      </div>
    </div>
  </div>

  <section class="block">
    <div class="wrap">
      <span class="kicker" data-reveal>The straight answers</span>
      <h2 data-reveal>What you'd want to know<br>before showing it to 25 teenagers</h2>
      <div class="modecards four">
        <div class="mcard" style="--acc:#23A4DD;transition-delay:0.00s" data-reveal>
          <div class="mc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12.5l2.2 2.2L15.6 10"/><path d="M12 3.2l2.1 1.6 2.6-.2 1 2.4 2.3 1.2-.5 2.6.9 2.5-2 1.7-.6 2.6-2.6.3L12 20.8l-2.2-1.9-2.6-.3-.6-2.6-2-1.7.9-2.5-.5-2.6 2.3-1.2 1-2.4 2.6.2z"/></svg></div>
          <div class="mc-n">01</div>
          <h3>Does it follow the actual study design?</h3>
          <p>Yes. Every concept maps to VCAA and NESA study designs &#8212; unit by unit, area of study by area of study. Where something is examinable in one state and not another, <strong>it says so on the page.</strong></p>
        </div>
        <div class="mcard" style="--acc:#7BEA5A;transition-delay:0.07s" data-reveal>
          <div class="mc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10.2 13.8a3.6 3.6 0 005.1 0l2.6-2.6a3.6 3.6 0 00-5.1-5.1l-1 1"/><path d="M13.8 10.2a3.6 3.6 0 00-5.1 0l-2.6 2.6a3.6 3.6 0 005.1 5.1l1-1"/></svg></div>
          <div class="mc-n">02</div>
          <h3>Do my students need accounts?</h3>
          <p>No. Put a concept on the projector, or send the class a share link: it opens in any browser, no login. If students want their own personalised study system at home, that's a separate student plan &#8212; <em>entirely their call, never bundled into yours.</em></p>
        </div>
        <div class="mcard" style="--acc:#FCB815;transition-delay:0.14s" data-reveal>
          <div class="mc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18.5c3-1.4 3.4-5.6 6.4-6.9 3-1.3 4-.2 5.4-1.6"/><circle cx="4.6" cy="18.9" r="1.6"/><path d="M18.4 4.6l2.6 2.9-2.6 2.9"/></svg></div>
          <div class="mc-n">03</div>
          <h3>Can I use it for lesson planning?</h3>
          <p>Yes. Every Physics and Chemistry concept is a ready-made deck: the picture, a call it. round for the room, the takeaway and a homeplay task. Change the words, add your own slides, then present it or share it. More subjects from Term 1. Class groups and progress views are on the list &#8212; <strong>founding teachers get first say in how they work.</strong></p>
        </div>
        <div class="mcard" style="--acc:#9B5AEA;transition-delay:0.21s" data-reveal>
          <div class="mc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 11h10M12 8.5v5"/></svg></div>
          <div class="mc-n">04</div>
          <h3>Will it work on the school network?</h3>
          <p>It's a normal website &#8212; nothing to install, on the projector laptop or theirs. Some school filters haven't categorised knowhere yet, so here's <a href="/for-your-it-team" target="_blank" rel="noopener">the one-page note for your IT team</a> (opens in a new tab): the handful of domains to allow, and why.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-band" id="tch-join">
    <div class="wrap">
      <!-- ''' + MARK + r''': ONE signup block, purple (the offer colour, with the exam pass). Seat rule (13 Oct): the live count
           shows only once 10 seats are gone; until then the line reads the offer. Seats() paints it from /api/staffroom-seats. -->
      <div class="join" data-reveal data-seats-total="50" data-seats-left="50" data-seats-show-after="10">
        <div class="j-main">
          <div class="j-eyebrow"><span class="lockup">know<b>here</b> &#183; <span class="tv">teach</span>it</span><span>Founding teachers</span></div>
          <h3>Your first term is on us.</h3>
          <p>The first 50 teachers get it free until <b>Fri 9 April 2027</b> &#8212; the end of Term 1, long enough to teach a whole unit with it &#8212; and first say in how the classroom tools work. Pricing after that gets set with you, and <b>nothing is charged without your yes.</b></p>
          <ul class="when">
            <li><b>Day one</b><span>Every Physics and Chemistry concept, Year 11 and 12, as a deck &#8212; mapped to the HSC syllabus and VCE study design.</span></li>
            <li><b>Term 1</b><span>Biology and Psychology, then Maths &#8212; each wave lands with its own "your subject is live" email. Your seat holds through the waves.</span></li>
          </ul>
        </div>
        <div class="j-side">
          <a class="cta" data-kw-from="join" href="''' + SIGNUP + r'''">Claim your founding seat</a>
          <div class="f-seats still" id="tchSeatLine"><span id="tchSeatText">50 founding seats &#183; free until Fri 9 April 2027</span></div>
          <div class="j-fine">A minute to set up your login. The seat is held the moment you do; one email the day it opens.</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ''' + MARK + r''': the sticky bar — the signup block, collapsed. Shows once the hero scrolls out, hides at the block. -->
  <div class="joinbar" id="tchJoinbar" aria-hidden="true">
    <div class="jb-t">Founding teachers: your first term is on us.<small>50 seats &#183; free until Fri 9 April 2027 &#183; nothing charged without your yes</small></div>
    <a class="cta" data-kw-from="bar" href="''' + SIGNUP + r'''">claim your founding seat</a>
  </div>
'''

JS_V2 = r'''
  /* ── KW:TEACH-SITE: the live knowscape (crop + fit, lifted from for-parents HERO-V4b) ──
     Same-origin iframe, so the page can reach in: hide everything in the widget except the card that holds its slider
     (plus a mode toggle, if the widget has real controls there), zero the widget's own page padding, drop the card's own
     border. The height is measured off what is left visible — never from the widget's kwH message, which inside a
     fixed-height iframe just echoes the frame back. If any of it fails the poster simply stays. */
  function Proof(root){
    var box=root.querySelector('#tchProofFrame'), pf=root.querySelector('#tchProofWidget');
    var api={ doc:function(){ return null; }, win:function(){ return null; }, kick:function(){}, fit:function(){}, stop:function(){} };
    if(!box||!pf) return api;
    var cropped=false, cropEl=null, dead=false;
    function kick(){ /* ''' + MARK + r''': the burette starts empty on purpose — the mission is to drag it */ }
    function crop(){
      if(cropped) return true;
      try{
        var d=pf.contentDocument; if(!d||!d.body) return false;
        var r=d.querySelector('input[type=range]'); if(!r) return false;
        var el=r; while(el.parentElement&&el.parentElement!==d.body&&el.parentElement.parentElement!==d.body) el=el.parentElement;
        var cont=el.parentElement;
        /* keep a mode toggle only when its buttons are controls ([data-mode]); text tabs (knowdrop) are hidden */
        var tog=cont.querySelector('.toggle-card'), keep=[el]; if(tog&&tog.querySelector('[data-mode]')) keep.push(tog); else tog=null;
        Array.prototype.forEach.call(cont.children,function(c){ if(keep.indexOf(c)<0&&c.tagName!=='STYLE'&&c.tagName!=='SCRIPT') c.style.setProperty('display','none','important'); });
        try{ var kd=cont.querySelector('#knowdrop'); if(kd) kd.style.setProperty('display','none','important'); if(tog){ tog.style.setProperty('margin','10px 0 0','important'); tog.style.setProperty('padding','0','important'); tog.style.setProperty('background','none','important'); tog.style.setProperty('border','0','important'); } }catch(e){}
        ['padding','margin'].forEach(function(k){ d.body.style.setProperty(k,'0','important'); cont.style.setProperty(k,'0','important'); });
        d.body.style.setProperty('min-height','0','important'); d.body.style.setProperty('overflow','hidden','important');
        cont.style.setProperty('max-width','none','important');
        ['margin','border'].forEach(function(k){ el.style.setProperty(k,'0','important'); });
        el.style.setProperty('border-radius','0','important'); el.style.setProperty('box-shadow','none','important');
        cropped=true; cropEl=el;
        try{
          var ov=d.getElementById('overlayTag'), cw=ov&&ov.parentElement;
          if(ov&&cw&&cw.parentElement){ cw.parentElement.insertBefore(ov,cw.nextSibling); }
          var st=d.createElement('style');
          st.textContent='.canvas-wrapper{aspect-ratio:4/3!important;margin-bottom:8px!important}.canvas-wrapper canvas{width:100%!important;height:100%!important;max-width:none!important}@media (min-width:560px){.canvas-wrapper{aspect-ratio:16/10!important}}#overlayTag{position:static!important;background:none!important;backdrop-filter:none!important;padding:6px 0 0!important;margin:0!important;text-align:left!important}';
          d.head.appendChild(st);
          try{ pf.contentWindow.dispatchEvent(new pf.contentWindow.Event('resize')); }catch(e){}
        }catch(e){}
        try{
          var hiSent=false;
          var hiFire=function(kind){ if(hiSent) return; hiSent=true; try{ if(window.umami) window.umami.track('hero_interact',{page:location.pathname,widget:'volumetric-analysis',via:kind,after_s:Math.round((window.performance&&performance.now?performance.now():0)/1000)}); }catch(e){} };
          d.addEventListener('pointerdown',function(){ hiFire('pointer'); },{passive:true,capture:true});
          d.addEventListener('touchstart',function(){ hiFire('touch'); },{passive:true,capture:true});
          d.addEventListener('keydown',function(){ hiFire('key'); },true);
        }catch(e){}
        kick();
        return true;
      }catch(e){ return false; }
    }
    function fit(){
      if(dead||!crop()||!cropEl) return;
      var h=0;
      try{
        var w=pf.contentWindow, cont=cropEl.parentElement;
        Array.prototype.forEach.call(cont.children,function(c){
          if(c.tagName==='STYLE'||c.tagName==='SCRIPT') return;
          var cs=w.getComputedStyle(c); if(cs.display==='none') return;
          h+=c.getBoundingClientRect().height+(parseFloat(cs.marginTop)||0)+(parseFloat(cs.marginBottom)||0);
        });
      }catch(e){ h=0; }
      if(!(h>120)) h=cropEl.getBoundingClientRect().height;
      h=Math.round(h); if(!(h>120)) return;
      h=Math.max(240,Math.min(1600,h));
      if(Math.abs(parseInt(box.style.height||0,10)-h)>4) box.style.height=h+'px';
      box.classList.add('on');
    }
    function onH(e){ var m=e&&e.data; if(!m||!m.kwH||e.source!==pf.contentWindow) return; fit(); }
    window.addEventListener('message',onH);
    window.addEventListener('resize',fit);
    document.addEventListener('fullscreenchange',fit); document.addEventListener('webkitfullscreenchange',fit);
    pf.addEventListener('load',function(){ fit(); setTimeout(fit,300); setTimeout(fit,1200); setTimeout(fit,3000); });
    fit();
    api.doc=function(){ try{ return pf.contentDocument; }catch(e){ return null; } };
    api.win=function(){ try{ return pf.contentWindow; }catch(e){ return null; } };
    api.kick=kick; api.fit=fit;
    api.stop=function(){ dead=true; window.removeEventListener('message',onH); window.removeEventListener('resize',fit); document.removeEventListener('fullscreenchange',fit); document.removeEventListener('webkitfullscreenchange',fit); };
    return api;
  }

  /* ── ''' + MARK + r''': the call it. round on the live model ──
     The real round for Volumetric analysis (teach-notes.json): options 1·2·3, impostor 2, right 3. Tap = your call;
     "Reveal on the model" runs the round's own reveal step inside the widget (burette to 25.00 mL = equivalence), then the
     unmask reads out "Who's sus? Number 2." Reset puts the room back to lids down and the burette back to empty. */
  function CallIt(root, proof){
    var panel=root.querySelector('#tchCallit'); if(!panel) return function(){};
    var opts=[].slice.call(panel.querySelectorAll('.ci-opt'));
    var foot=panel.querySelector('#tchCiFoot'), btn=panel.querySelector('#tchCiReveal'), out=panel.querySelector('#tchCiReveal2');
    var you=panel.querySelector('#tchCiYou'), state=panel.querySelector('#tchCiState');
    var rbtn=root.querySelector('#tchReset');
    var RIGHT='3', SUS='2', mine='', timers=[], done=false;
    function track(step){ try{ if(window.umami) window.umami.track('callit_demo',{page:location.pathname,step:step,call:mine}); }catch(e){} }
    function later(fn,ms){ timers.push(setTimeout(fn,ms)); }
    function clear(){ timers.forEach(clearTimeout); timers=[]; }
    function setVol(v){ try{ var d=proof.doc(), w=proof.win(); var r=d&&d.querySelector('#volSlider'); if(r&&w){ r.value=v; r.dispatchEvent(new w.Event('input',{bubbles:true})); } }catch(e){} }
    function pick(ev){
      if(done) return;
      mine=ev.currentTarget.getAttribute('data-opt');
      opts.forEach(function(o){ o.classList.toggle('mine', o.getAttribute('data-opt')===mine); });
      foot.textContent='Called: number '+mine+'. Now reveal it on the model.';
      btn.hidden=false; state.textContent='called';
      track('call');
    }
    function reveal(){
      if(done) return; done=true; clear();
      btn.disabled=true; btn.textContent='Revealing…'; state.textContent='reveal';
      foot.textContent='Burette to 25.00 mL… watch the flask.';
      setVol(500);
      later(function(){
        opts.forEach(function(o){ var v=o.getAttribute('data-opt'); o.disabled=true; o.classList.toggle('sus',v===SUS); o.classList.toggle('legit',v===RIGHT); });
        you.textContent = mine===RIGHT ? 'You called 3. Legit.' : mine===SUS ? 'You called 2 — the impostor. Most rooms do.' : 'You called 1. Not the impostor, not the answer: at equivalence the indicator hasn’t moved yet.';
        out.classList.add('on'); btn.hidden=true; btn.disabled=false; btn.textContent='Reveal on the model';
        foot.textContent='Who’s sus? Number 2. Reset to run it again.'; state.textContent='unmasked';
        track('reveal');
      },1600);
    }
    function reset(){
      clear(); done=false; mine='';
      opts.forEach(function(o){ o.disabled=false; o.classList.remove('mine','sus','legit'); });
      out.classList.remove('on'); you.textContent=''; btn.hidden=true; btn.disabled=false; btn.textContent='Reveal on the model';
      foot.textContent='Pairs hold up fingers. Tap yours.'; state.textContent='lids down';
      setVol(0); proof.kick();
    }
    btn.hidden=true;   /* the dc runtime drops the bare hidden attribute from the markup, so it is set here */
    opts.forEach(function(o){ o.addEventListener('click', pick); });
    btn.addEventListener('click', reveal);
    if(rbtn) rbtn.addEventListener('click', reset);
    return function(){ clear(); opts.forEach(function(o){ o.removeEventListener('click', pick); }); btn.removeEventListener('click', reveal); if(rbtn) rbtn.removeEventListener('click', reset); };
  }

  /* ── ''' + MARK + r''': the sticky bar — on once the hero has scrolled out, off at the signup block (and in fullscreen) ── */
  function Joinbar(root){
    var bar=root.querySelector('#tchJoinbar'), hero=root.querySelector('.hero'), join=root.querySelector('#tch-join');
    if(!bar||!hero||!join) return function(){};
    var dead=false, raf=0;
    function set(){
      raf=0; if(dead) return;
      var fs=!!(document.fullscreenElement||document.webkitFullscreenElement);
      var h=hero.getBoundingClientRect(), j=join.getBoundingClientRect();
      var on=!fs && h.bottom < 80 && j.top > window.innerHeight - 40;
      bar.classList.toggle('on', on); bar.setAttribute('aria-hidden', on?'false':'true');
    }
    function tick(){ if(!raf) raf=requestAnimationFrame(set); }
    window.addEventListener('scroll', tick, {passive:true}); window.addEventListener('resize', tick);
    document.addEventListener('fullscreenchange', tick); document.addEventListener('webkitfullscreenchange', tick);
    set();
    return function(){ dead=true; window.removeEventListener('scroll', tick); window.removeEventListener('resize', tick); document.removeEventListener('fullscreenchange', tick); document.removeEventListener('webkitfullscreenchange', tick); };
  }
'''

new = ft
# body region
start = new.index('  <nav>\n'); end_anchor = '  </section>\n\n  <div class="foot-snap">'
assert new.count('  <nav>\n') == 1 and new.count(end_anchor) == 1
end = new.index(end_anchor) + len('  </section>\n')
new = new[:start] + BODY + new[end:]
# css block
cs = new.index('<style id="KW_TEACH_SITE">'); ce = new.index('</style>', cs) + len('</style>')
new = new[:cs] + CSS + new[ce:]
# engine: Proof + CallIt (v1) → v2 Proof + CallIt + Joinbar
js0 = new.index('  /* ── KW:TEACH-SITE: the live knowscape'); js1 = new.index('  /* founding-teacher seats. reads /api/staffroom-seats')
new = new[:js0] + JS_V2.lstrip('\n') + '\n' + new[js1:]
# Seats(): the card is .join now
new = rep(new, "    var card=root.querySelector('.founding');\n    if(!card) return function(){};\n    /* KW:TEACH-SITE (ruled 13 Oct 2026)", "    var card=root.querySelector('.join');   /* " + MARK + " */\n    if(!card) return function(){};\n    /* KW:TEACH-SITE (ruled 13 Oct 2026)", 1, 'Seats card')
# the stack: three cards, three formations
new = rep(new, 'var BOX = [fLattice, fClusters, fBroadcast, fPlus];', 'var BOX = [fBroadcast, fPlus, fLattice];   /* ' + MARK + ': sharing · your own knowscapes · homeplay */', 1, 'BOX')
new = rep(new, 'return BOX[box?Math.min(3,box.index()):0];', 'return BOX[box?Math.min(2,box.index()):0];', 1, 'BOX pick')
new = rep(new, '    stops.push(CallIt(root, proof));\n', '    stops.push(CallIt(root, proof));\n    stops.push(Joinbar(root));   /* ' + MARK + ' */\n', 1, 'wiring')
# head: alt text + description mention stays true (round for the room). JSON-LD untouched.
for bad in ('nuclear-fission', 'id="tchSeats"', 'class="founding"', 'class="cta-card"'):
    if bad in new: die('stale fragment still present: %r' % bad)
if new.count(SIGNUP) != 5: die('expected 5 seat CTAs (nav, hero, callit row, join, bar), found %d' % new.count(SIGNUP))

# the IT page: knowhere is one word; the lockup is knowhere · teachit (teach in purple)
it = rd(IT)
it_new = rep(it, '<a class="brand" href="/for-teachers">know<b style="color:#7BEA5A">here</b> &#183; teach it.</a>',
             '<a class="brand" href="/for-teachers"><span>know<b style="color:#7BEA5A">here</b></span><span>&#183;</span><span><b style="color:#cdb6f5">teach</b>it</span></a>   <!-- ' + MARK + ': knowhere is ONE word (no gap inside it); lockup teachit, teach in purple -->', 1, 'IT brand')
it_new = rep(it_new, '.brand{display:inline-flex;align-items:center;gap:8px;', '.brand{display:inline-flex;align-items:center;gap:6px;', 1, 'IT brand css')
it_new = rep(it_new, '<a href="/for-teachers">knowhere &#183; teach it.</a></p>', '<a href="/for-teachers">&#8592; back to knowhere &#183; teachit</a></p>', 1, 'IT back link')

POSTER_SRC = os.path.join(HERE, 'for-teachers-proof-titration.jpg'); POSTER_DST = os.path.join(ROOT, POSTER.lstrip('/'))
if not os.path.exists(POSTER_DST):
    if not os.path.exists(POSTER_SRC): die('poster missing: ' + POSTER_SRC)
    shutil.copy2(POSTER_SRC, POSTER_DST)
BAK = os.path.join(HERE, 'bak-v2-' + STAMP); os.makedirs(BAK, exist_ok=True)
for p in (FT, IT): shutil.copy2(p, os.path.join(BAK, os.path.basename(p)))
with open(FT, 'w', encoding='utf-8') as f: f.write(new)
with open(IT, 'w', encoding='utf-8') as f: f.write(it_new)

ok = True; chk = rd(FT)
for want, n in ((MARK, None), (SIGNUP, 5), ('src="/widgets/volumetric-analysis-chemistry.html"', 1), ('id="tchJoinbar"', 1), ('class="join"', 1), ('verb yours', 1), ('class="soc-steps"', 1), ('KW:FOOT-V25', None)):
    c = chk.count(want); good = (c > 0) if n is None else (c == n); ok &= good
    print(('✓' if good else '✗') + ' for-teachers.html  %-36s ×%d' % (want[:36], c))
try:
    m = re.search(r'<script>\n(/\* ══ knowhere · for-teachers page engine.*?)</script>', chk, re.S)
    tmp = os.path.join(HERE, '.engine-check.js')
    with open(tmp, 'w', encoding='utf-8') as f: f.write(m.group(1))
    r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
    try: os.remove(tmp)
    except OSError: pass   # the Cowork VM cannot delete inside the mount
    good = r.returncode == 0; ok &= good; print(('✓' if good else '✗') + ' node --check page engine' + ('' if good else '\n' + r.stderr))
except FileNotFoundError: print('• node not found — skipped the parse check')
good = 'teach</b>it' in rd(IT); ok &= good; print(('✓' if good else '✗') + ' for-your-it-team.html lockup')
good = os.path.exists(os.path.join(ROOT, POSTER.lstrip('/'))); ok &= good; print(('✓' if good else '✗') + ' poster ' + POSTER + (' present' if good else ' MISSING — copy it from _patches/teach-site/'))
if not ok:
    for p in (FT, IT): shutil.copy2(os.path.join(BAK, os.path.basename(p)), p)
    die('a receipt failed — originals restored from ' + os.path.relpath(BAK, ROOT))
print('\nbackups in ' + os.path.relpath(BAK, ROOT))
print('done. node server.js → /for-teachers: tap 1·2·3 → Reveal on the model; scroll: the purple bar rides along and parks at the signup block.')
