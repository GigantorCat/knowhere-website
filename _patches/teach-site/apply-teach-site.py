#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
knowhere.me — for-teachers acquisition rework (KW:TEACH-SITE, 13 Oct 2026)

Run from the website folder, AFTER `git pull` (it needs the KW:FOOT-V25 footer commit under it):

    cd ~/Code/knowhere/website/knowhere-website && git pull && python3 _patches/teach-site/apply-teach-site.py

What it does (all-or-nothing, idempotent, backups in _patches/teach-site/bak-<stamp>/):
  for-teachers.html   hero "Year 12, in their language. Taught in yours." · one door: every seat CTA →
                      app.knowhere.me/signup?as=teacher (the stepped teacher signup; the email modal is retired here)
                      · a LIVE call it. block: the real nuclear-fission knowscape + its real call it. round, reveal runs
                      on the model · the eight-verb deck · "what's in the box" told as it ships (Physics + Chemistry
                      first, waves after) · four straight answers (+ school network) · founding band with the seat
                      rule (count hidden until 10 are gone) · head description + FAQ JSON-LD
  knowhere-seo-v2.sh  the for-teachers desc + FAQ source, so a regen cannot put the old copy back
  server.js           /waitlist → 301 /for-teachers (the pre-launch waitlist page is stale; the API stays)
  for-your-it-team.html  NEW — the one-page allowlist note the FAQ links to
Verify after: open /for-teachers, tap 1·2·3, Reveal on the model; /waitlist should land on /for-teachers.
"""
import os, re, sys, time, json, subprocess, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.getcwd()
STAMP = time.strftime('%Y%m%d-%H%M%S')
MARK = 'KW:TEACH-SITE'

def die(msg):
    print('✗ ' + msg); sys.exit(1)

def rd(p):
    with open(p, encoding='utf-8') as f: return f.read()

def rep(src, old, new, n=1, label=''):
    c = src.count(old)
    if c != n: die('anchor count %d (wanted %d) for %s: %r' % (c, n, label, old[:70]))
    return src.replace(old, new)

for f in ('for-teachers.html', 'knowhere-seo-v2.sh', 'server.js', 'knowhere-waitlist.js'):
    if not os.path.exists(os.path.join(ROOT, f)): die('run me from the website folder (missing %s)' % f)

FT = os.path.join(ROOT, 'for-teachers.html')
ft = rd(FT)
if MARK in ft:
    print('• for-teachers.html already carries %s — nothing to do' % MARK); sys.exit(0)
if 'KW:FOOT-V25' not in ft:
    die('for-teachers.html has no KW:FOOT-V25 footer — this Mac has not pulled the 13 Oct footer commits. Run: git pull')

# ───────────────────────────────── fragments ─────────────────────────────────
SIGNUP = 'https://app.knowhere.me/signup?as=teacher'

HEAD_DESC_OLD = 'Every HSC and VCE concept as a live explanation for the projector, mapped to the NESA syllabus and VCAA study design. 50 founding seats, free to the end of Term 1 2027.'
HEAD_DESC_NEW = 'Every Physics and Chemistry concept as a live deck for the projector: a call it. round for the room, slides you can edit, share links with no student login, tonight’s homeplay. Mapped to the HSC syllabus and VCE study design. 50 founding seats, free until 9 April 2027.'

FAQ_OLD_JSON = '{"@type":"Question","name":"Can I use knowhere for lesson planning?","acceptedAnswer":{"@type":"Answer","text":"Yes. Every Physics and Chemistry concept is a ready-made deck: the picture, a call it. round for the room, the takeaway and a homeplay task. Change the words, add your own slides, then present it or share it. More subjects from Term 1. Class groups and progress views are on the list — founding teachers get first say in how they work."}}'
FAQ_NET_JSON = ',{"@type":"Question","name":"Will knowhere work on the school network?","acceptedAnswer":{"@type":"Answer","text":"It is a normal website, nothing to install, on the projector laptop or the students’ own. Some school filters have not categorised knowhere.me yet; a one-page note for the IT team lists the handful of domains to allow."}}'

CSS = r'''
<style id="KW_TEACH_SITE">
  /* ''' + MARK + r''' (13 Oct 2026) — acquisition rework: live call it. block, the eight-verb deck, 2×2 answers, seat rule */
  .kw-tch .hero p em{display:block;margin-top:10px}
  .kw-tch .block .lede strong{color:var(--ink);font-weight:600}
  /* ── the live call it. block ── */
  .kw-tch .present.callit{padding:16px}
  .kw-tch .ci-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:14px;align-items:start}
  @media (max-width:860px){.kw-tch .ci-grid{grid-template-columns:1fr}}
  .kw-tch .proof-frame{position:relative;background:#0c0d0f;aspect-ratio:560/588;overflow:hidden;border-radius:12px;border:1px solid rgba(255,255,255,.08)}
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
  /* ── the eight-verb deck ── */
  .kw-tch .verbs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:30px;counter-reset:verb}
  @media (max-width:900px){.kw-tch .verbs{grid-template-columns:repeat(2,minmax(0,1fr))}}
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
  /* ── answers: four cards, 2×2 ── */
  .kw-tch .modecards.four{grid-template-columns:repeat(2,minmax(0,1fr))}
  @media (max-width:760px){.kw-tch .modecards.four{grid-template-columns:1fr}}
  .kw-tch .mcard p a{color:var(--brat);text-decoration:underline;text-underline-offset:3px}
  /* ── founding: the seat line reads the rule, not a thin number ── */
  .kw-tch .founding .f-seats.still::before{animation:none;opacity:.7}
  @media (prefers-reduced-motion:reduce){.kw-tch .verb:hover,.kw-tch .ci-opt:hover{transform:none}}
</style>
'''

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
      <!-- ''' + MARK + r''' (13 Oct 2026): one door. Every seat CTA goes to the app's stepped teacher signup — the account IS the
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
      <!-- ''' + MARK + r''': hero ruled 13 Oct 2026 ("Taught in yours", round two) -->
      <h1 data-reveal>Year 12, in their language.<br>Taught in <span style="color:var(--brat)">yours</span>.</h1>
      <p data-reveal>Living models of every Physics and Chemistry concept, built the way Gen Z actually looks at things &#8212; inside a deck you can edit, present from anywhere, and send home as tonight&#8217;s homeplay. <em>Not a PDF of a PDF. A room that has to think.</em></p>
      <div class="row" data-reveal>
        <a class="cta" data-kw-from="hero" href="''' + SIGNUP + r'''">Claim a founding seat</a>
        <a class="ghost" href="#tch-callit">Run a call it. round</a>
      </div>
    </div>
    <a class="scroll-cue" href="#tch-content" aria-label="Scroll to content"><span class="chev"></span></a>
  </header>

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

  <!-- ''' + MARK + r''': the live call it. block. The real nuclear-fission knowscape (/widgets/nuclear-fission-physics.html,
       the file the public concept page and the for-parents hero embed) in a same-origin iframe, cropped by the page script to
       its interactive card; beside it, the concept's REAL call it. round from the teacher layer (teach-notes.json,
       cpt_b6fa4e5c: situation, mission, what-if, 1·2·3, impostor, trick). "Reveal on the model" runs the round's own reveal
       steps on the live widget (Controlled → rods fully in → subcritical). The JPG underneath is the pre-JS still. -->
  <section class="block" id="tch-callit">
    <div class="wrap">
      <span class="kicker" data-reveal>A real round, live</span>
      <h2 data-reveal>Lids down. Pairs call it.<br>Then the model settles it.</h2>
      <p class="lede" data-reveal>This is <strong>call it.</strong> &#8212; the slide that turns a concept into a room. One real knowscape, one what-if, three answers, and one of them is an impostor. No leaderboard, no speed points: pairs hold up fingers, you reveal, the model tells the truth. <em>Poke the reactor first. Then make your call.</em></p>
      <div class="present callit" id="tchPresent" data-reveal>
        <div class="hud">
          <span>call it. | Nuclear fission<span class="hud-sub"> &#183; HSC Physics</span></span>
          <div class="btns"><button class="fsbtn ghost" id="tchReset" type="button">Reset</button><button class="fsbtn" id="tchFs" type="button">Present</button></div>
        </div>
        <div class="ci-grid">
          <div class="proof-frame" id="tchProofFrame">
            <a class="poster-link" href="/hsc/physics/nuclear-fission" aria-label="Open nuclear fission, a live knowhere concept"><img class="poster" src="/for-parents-proof-fission.jpg?v=1" width="1120" height="1174" alt="One real knowhere concept, live: a nuclear fission chain reaction for HSC physics. Put the control rods in and watch it settle; pull them out and watch it run away." loading="eager" decoding="async"></a>
            <iframe id="tchProofWidget" src="/widgets/nuclear-fission-physics.html" title="Nuclear fission &#8212; a live knowhere concept. Move the control rods and watch the chain reaction respond." loading="eager" scrolling="no" tabindex="-1"></iframe>
          </div>
          <div class="ci-panel" id="tchCallit">
            <div class="ci-head"><span>call it.</span><span class="st" id="tchCiState">lids down</span></div>
            <p class="ci-sit">OPAL at Lucas Heights makes the isotopes for most of Australia's medical scans. You're on shift. <b>Hit Uncontrolled and watch the count. Then find where the rods hold the chain steady.</b></p>
            <div class="ci-q"><span class="k">What if</span>the control rods jam all the way in?</div>
            <div class="ci-opts" role="group" aria-label="Call it: pick 1, 2 or 3">
              <button class="ci-opt" type="button" data-opt="1"><b>1</b><span>It holds steady</span></button>
              <button class="ci-opt" type="button" data-opt="2"><b>2</b><span>It grows slowly</span></button>
              <button class="ci-opt" type="button" data-opt="3"><b>3</b><span>It dies out</span></button>
            </div>
            <div class="ci-foot"><span id="tchCiFoot">Pairs hold up fingers. Tap yours.</span><button class="fsbtn" id="tchCiReveal" type="button" hidden>Reveal on the model</button></div>
            <div class="ci-reveal" id="tchCiReveal2">
              <div class="ci-sus">Who's sus? <b>Number 1.</b></div>
              <div class="ci-line">&#8220;More rods, more control.&#8221;</div>
              <p class="ci-trick"><b>The real trick</b> is knowing the rods don't steady the chain by being there. They eat neutrons &#8212; and all the way in, they eat too many.</p>
              <div class="ci-you" id="tchCiYou"></div>
              <div class="ci-model" id="tchCiModel">Watch the reactor: Controlled, rods fully in, the count dwindles to a handful.</div>
            </div>
          </div>
        </div>
      </div>
      <div class="three" style="margin-top:30px">
        <div class="card style" data-reveal>
          <div class="t">Yours to edit</div>
          <p>Click the words on any slide and change them. Add a slide of your own &#8212; your words, your picture. A shared link always shows your latest version.</p>
        </div>
        <div class="card neuro" data-reveal style="transition-delay:.08s">
          <div class="t">Show it your way</div>
          <p>Need this concept shown differently for your room? Ask for a new knowscape inside the deck &#8212; the concept's own poke it. stays. Free rein for the founding term.</p>
        </div>
        <div class="card mode" data-reveal style="transition-delay:.16s">
          <div class="t">Share one slide</div>
          <p>Send any slide as a link. It opens in any browser, no student login. Tonight's homeplay goes home as a QR on the last slide.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ''' + MARK + r''': the eight-verb deck (RULED 29 Sep: seven, + take it. 10 Oct), this order, lowercase with a full stop -->
  <section class="block" id="tch-deck">
    <div class="wrap">
      <span class="kicker" data-reveal>Every concept is a deck</span>
      <h2 data-reveal>Eight slides, built to make them think.</h2>
      <p class="lede" data-reveal>Every Physics and Chemistry concept comes as a deck in this order. Present it as it is, or change any word by clicking it. <em>The thinking stays with the students. You run the room.</em></p>
      <div class="verbs">
        <div class="verb" data-reveal><div class="v">meet it.</div><div class="s">the hook</div><p>Why this concept exists, in one line the room didn't expect.</p></div>
        <div class="verb call" data-reveal style="transition-delay:.05s"><div class="v">call it.</div><div class="s">lids down</div><p>A what-if on the model. Pairs call 1, 2 or 3 &#8212; and one answer's an impostor.</p></div>
        <div class="verb" data-reveal style="transition-delay:.1s"><div class="v">poke it.</div><div class="s">the live knowscape</div><p>Full screen on the projector. Change one thing, watch what breaks.</p></div>
        <div class="verb" data-reveal style="transition-delay:.15s"><div class="v">picture it.</div><div class="s">the topic's analogy</div><p>The everyday picture for the whole topic &#8212; and exactly where it breaks.</p></div>
        <div class="verb" data-reveal style="transition-delay:.2s"><div class="v">spot it.</div><div class="s">in the wild</div><p>This concept, somewhere they've already seen it. <em>Teachers only &#8212; the student app doesn't show it.</em></p></div>
        <div class="verb" data-reveal style="transition-delay:.25s"><div class="v">know it.</div><div class="s">the three to keep</div><p>What the marker wants, in three lines. The exam angle, said out loud.</p></div>
        <div class="verb" data-reveal style="transition-delay:.3s"><div class="v">own it.</div><div class="s">in their own words</div><p>A trick question with a sus answer in it. Do they really get it? IYKYK.</p></div>
        <div class="verb take" data-reveal style="transition-delay:.35s"><div class="v">take it.</div><div class="s">tonight's homeplay</div><p>One QR, one thing to try on their phone. Not a worksheet.</p></div>
      </div>
    </div>
  </section>

  <!-- WHAT'S IN THE BOX — the deck -->
  <div class="stack" id="stackBox" style="height:640vh">
      <div class="snapmark" style="top:67.5vh"></div>
      <div class="snapmark" style="top:202.5vh"></div>
      <div class="snapmark" style="top:337.5vh"></div>
      <div class="snapmark" style="top:472.5vh"></div>
    <div class="stack-viewport">
      <div class="stack-cv" id="cvBox"></div>
      <div class="stack-inner">
        <div class="stack-head">
          <span class="kicker">What's in the box</span>
          <h2>Physics and Chemistry, ready to teach</h2>
        </div>
        <div class="stack-cards">
          <div class="scard">
          <div class="n">Day one</div>
          <h3>Every Physics and Chemistry concept, Year 11 and 12, as a deck.</h3>
          <p>Mapped to the HSC syllabus and VCE study design, unit by unit. Where something is examinable in one state and not the other, <strong>the page says so.</strong> Nothing examinable is diluted.</p>
          </div>
          <div class="scard">
          <div class="n">Term 1</div>
          <h3>Biology and Psychology next. Then Maths.</h3>
          <p>Each wave lands with its own "your subject is live" email. Claim a seat for any subject now &#8212; <strong>it holds through the waves</strong> &#8212; with more subjects through 2027.</p>
          </div>
          <div class="scard">
          <div class="n">&#8599;</div>
          <h3>Share links. No student accounts.</h3>
          <p>Send any slide to the class and students open it in any browser &#8212; <em>no logins, no "did everyone get the email", no printing.</em></p>
          </div>
          <div class="scard">
          <div class="n">QR</div>
          <h3>Homeplay, not homework.</h3>
          <p>The last slide of every deck is tonight's take it.: one QR, one thing to try on their phone. <strong>Built for the bus home, not the printer.</strong></p>
          </div>
        </div>
        <div class="stack-dots" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
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
          <p>It's a normal website &#8212; nothing to install, on the projector laptop or theirs. Some school filters haven't categorised knowhere yet, so here's <a href="/for-your-it-team">the one-page note for your IT team</a>: the handful of domains to allow, and why.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-band">
    <div class="wrap">
      <!-- ''' + MARK + r''': seat rule (ruled 13 Oct 2026) — the live count shows only once 10 seats are gone; until then the
           line reads the offer. The engine's Seats() paints it from /api/staffroom-seats. -->
      <div class="founding" data-reveal data-seats-total="50" data-seats-left="50" data-seats-show-after="10">
        <div class="f-main">
          <div class="f-eyebrow">Founding teachers</div>
          <h3>Your first term is on us.</h3>
          <p>The first 50 teachers get knowhere &#183; teach it. free until Fri 9 April 2027 &#8212; the end of Term 1, long enough to teach a whole unit with it &#8212; and first say in how the classroom tools work. Pricing after that gets set with you, and <strong>nothing is charged without your yes.</strong></p>
        </div>
        <div class="f-side">
          <div class="f-code"><span>How it works</span><code>join &rarr; seat held</code></div>
          <div class="f-seats still" id="tchSeatLine"><span id="tchSeatText">50 founding seats &#183; free until Fri 9 April 2027</span></div>
        </div>
      </div>
      <div class="cta-card" data-reveal>
        <h3>Claim a seat. Teach with it the day it opens.</h3>
        <p>A minute to set up your login, and the seat is held the moment you do. One email the day knowhere &#183; teach it. opens &#8212; this term, with Physics and Chemistry. Until then, every public concept on this site is yours to put on the projector.</p>
        <div class="row">
          <a class="cta" data-kw-from="band" href="''' + SIGNUP + r'''">Claim a founding seat</a>
          <a class="ghost" href="#tch-callit">Run the call it. round first</a>
        </div>
      </div>
    </div>
  </section>
'''

# engine: the live block (crop + call it.) and the seat rule
JS_PROOF = r'''
  /* ── ''' + MARK + r''': the live knowscape (crop + fit, lifted from for-parents HERO-V4b) ──
     Same-origin iframe, so the page can reach in: hide everything in the widget except the card that holds its slider,
     zero the widget's own page padding, drop the card's own border, and give the reactor its first neutrons (rods 40% in).
     The height is measured off the cropped card — never from the widget's kwH message, which inside a fixed-height
     iframe just echoes the frame back. If any of it fails the poster simply stays. */
  function Proof(root){
    var box=root.querySelector('#tchProofFrame'), pf=root.querySelector('#tchProofWidget');
    var api={ doc:function(){ return null; }, win:function(){ return null; }, kick:function(){}, stop:function(){} };
    if(!box||!pf) return api;
    var cropped=false, cropEl=null, dead=false;
    function kick(){ try{ var d=pf.contentDocument, r=d&&d.querySelector('#neutronSlider'); if(r){ r.value=40; r.dispatchEvent(new pf.contentWindow.Event('input',{bubbles:true})); } }catch(e){} }
    function crop(){
      if(cropped) return true;
      try{
        var d=pf.contentDocument; if(!d||!d.body) return false;
        var r=d.querySelector('input[type=range]'); if(!r) return false;
        var el=r; while(el.parentElement&&el.parentElement!==d.body&&el.parentElement.parentElement!==d.body) el=el.parentElement;
        var cont=el.parentElement;
        /* keep the Uncontrolled / Controlled toggle: the round's mission says "Hit Uncontrolled", and the reveal presses Controlled */
        var tog=cont.querySelector('.toggle-card'), keep=[el]; if(tog) keep.push(tog);
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
          var hiFire=function(kind){ if(hiSent) return; hiSent=true; try{ if(window.umami) window.umami.track('hero_interact',{page:location.pathname,widget:'nuclear-fission',via:kind,after_s:Math.round((window.performance&&performance.now?performance.now():0)/1000)}); }catch(e){} };
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
      /* the frame is as tall as what is left visible in the widget: the card plus the mode toggle under it */
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
    api.kick=kick;
    api.fit=fit;
    api.stop=function(){ dead=true; window.removeEventListener('message',onH); window.removeEventListener('resize',fit); document.removeEventListener('fullscreenchange',fit); document.removeEventListener('webkitfullscreenchange',fit); };
    return api;
  }

  /* ── ''' + MARK + r''': the call it. round on the live model ──
     The real round for Nuclear fission (teach-notes.json cpt_b6fa4e5c): options 1·2·3, impostor 1, right 3. Tap = your
     call; "Reveal on the model" runs the round's own reveal steps inside the widget (Controlled → rods fully in), then the
     unmask reads out: "Who's sus? Number 1." Reset puts the room back to lids down and the reactor back to its first state. */
  function CallIt(root, proof){
    var panel=root.querySelector('#tchCallit'); if(!panel) return function(){};
    var opts=[].slice.call(panel.querySelectorAll('.ci-opt'));
    var foot=panel.querySelector('#tchCiFoot'), btn=panel.querySelector('#tchCiReveal'), out=panel.querySelector('#tchCiReveal2');
    var you=panel.querySelector('#tchCiYou'), state=panel.querySelector('#tchCiState'), model=panel.querySelector('#tchCiModel');
    var rbtn=root.querySelector('#tchReset');
    var RIGHT='3', SUS='1', mine='', timers=[], done=false;
    function track(step){ try{ if(window.umami) window.umami.track('callit_demo',{page:location.pathname,step:step,call:mine}); }catch(e){} }
    function later(fn,ms){ timers.push(setTimeout(fn,ms)); }
    function clear(){ timers.forEach(clearTimeout); timers=[]; }
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
      foot.textContent='Controlled. Rods going all the way in…';
      var d=proof.doc(), w=proof.win();
      try{ var c=d&&d.querySelector('[data-mode="controlled"]'); if(c) c.click(); }catch(e){}
      later(function(){
        try{ var r=d&&d.querySelector('#neutronSlider'); if(r&&w){ r.value=100; r.dispatchEvent(new w.Event('input',{bubbles:true})); } }catch(e){}
      },2500);
      later(function(){
        opts.forEach(function(o){ var v=o.getAttribute('data-opt'); o.disabled=true; o.classList.toggle('sus',v===SUS); o.classList.toggle('legit',v===RIGHT); });
        you.textContent = mine===RIGHT ? 'You called 3. Legit.' : mine===SUS ? 'You called 1 — the impostor. Most rooms do.' : 'You called 2. Not the impostor, not the answer: the chain can’t grow with the rods all the way in.';
        out.classList.add('on'); btn.hidden=true; btn.disabled=false; btn.textContent='Reveal on the model';
        foot.textContent='Who’s sus? Number 1. Reset to run it again.'; state.textContent='unmasked';
        track('reveal');
      },3200);
    }
    function reset(){
      clear(); done=false; mine='';
      opts.forEach(function(o){ o.disabled=false; o.classList.remove('mine','sus','legit'); });
      out.classList.remove('on'); you.textContent=''; btn.hidden=true; btn.disabled=false; btn.textContent='Reveal on the model';
      foot.textContent='Pairs hold up fingers. Tap yours.'; state.textContent='lids down';
      try{ var d=proof.doc(); var u=d&&d.querySelector('[data-mode="uncontrolled"]'), c=d&&d.querySelector('[data-mode="controlled"]'); if(c) c.click(); }catch(e){}
      proof.kick();
    }
    btn.hidden=true;   /* the dc runtime drops the bare hidden attribute from the markup, so it is set here */
    opts.forEach(function(o){ o.addEventListener('click', pick); });
    btn.addEventListener('click', reveal);
    if(rbtn) rbtn.addEventListener('click', reset);
    return function(){ clear(); opts.forEach(function(o){ o.removeEventListener('click', pick); }); btn.removeEventListener('click', reveal); if(rbtn) rbtn.removeEventListener('click', reset); };
  }
'''

JS_SEATS_OLD = r'''  function Seats(root){
    var card=root.querySelector('.founding');
    if(!card) return function(){};
    var left=root.querySelector('#tchSeats'), total=root.querySelector('#tchSeatsTotal');
    var dead=false;
    function paint(n, tot){
      if(dead||!left) return;
      n=Math.max(0, n|0);
      left.textContent=n;
      if(total && tot) total.textContent=tot|0;
      if(n<=0){
        card.classList.add('f-gone');
        var seats=card.querySelector('.f-seats');
        if(seats) seats.textContent='All 50 founding seats taken — join anyway, you\'re next in line';
      }
    }'''
JS_SEATS_NEW = r'''  function Seats(root){
    var card=root.querySelector('.founding');
    if(!card) return function(){};
    /* ''' + MARK + r''' (ruled 13 Oct 2026): the live count is anti-social-proof while it reads 48 of 50. Until
       data-seats-show-after seats are gone the line reads the offer; from then on it counts down; at 0 it flips. */
    var line=root.querySelector('#tchSeatLine'), text=root.querySelector('#tchSeatText');
    var showAfter=parseInt(card.getAttribute('data-seats-show-after'),10)||10;
    var dead=false;
    function paint(n, tot){
      if(dead||!text) return;
      n=Math.max(0, n|0); tot=(tot|0)||50;
      if(n<=0){
        card.classList.add('f-gone'); line.classList.add('still');
        text.textContent='All '+tot+' founding seats taken — join anyway, you’re next in line';
      } else if(tot-n < showAfter){
        line.classList.add('still');
        text.textContent=tot+' founding seats · free until Fri 9 April 2027';
      } else {
        line.classList.remove('still');
        text.innerHTML='<b>'+n+'</b> of '+tot+' seats left';
      }
    }'''

JS_WIRE_OLD = r'''    stops.push(PhotonDemo(root, reduce));
    stops.push(EnzymeDemo(root));
    stops.push(Fullscreen(root));
    stops.push(Seats(root));'''
JS_WIRE_NEW = r'''    stops.push(PhotonDemo(root, reduce));
    stops.push(EnzymeDemo(root));   /* the Biology enzyme canvas is gone (made way for the live call it.) — returns a no-op */
    stops.push(Fullscreen(root));
    var proof=Proof(root); stops.push(proof.stop);   /* ''' + MARK + r''' */
    stops.push(CallIt(root, proof));
    stops.push(Seats(root));'''

IT_PAGE = r'''<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>knowhere &#183; teach it. &#8212; a note for your IT team</title>
<meta name="description" content="What knowhere needs from a school network: nothing installed, a handful of domains allowed, filed under Education.">
<link rel="canonical" href="https://knowhere.me/for-your-it-team">
<meta name="robots" content="noindex,follow">
<meta name="theme-color" content="#070708">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{background:#070708;color:#EDECE8;font-family:'Geist',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  a{color:#7BEA5A}
  .wrap{max-width:720px;margin:0 auto;padding:40px 24px 80px}
  .brand{display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:#EDECE8;font-weight:700;letter-spacing:-0.04em;font-size:16.5px}
  .kicker{display:block;margin-top:34px;font-size:10.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#8C8B87}
  h1{font-size:clamp(28px,5vw,40px);font-weight:700;letter-spacing:-0.04em;line-height:1.05;margin-top:10px;text-wrap:balance}
  p{font-size:15.5px;line-height:1.65;color:#b9b8b4;margin-top:14px}
  p b{color:#EDECE8;font-weight:600}
  h2{font-size:18px;font-weight:700;letter-spacing:-0.02em;margin-top:34px}
  table{width:100%;border-collapse:collapse;margin-top:14px;font-size:14px}
  th,td{text-align:left;padding:10px 10px;border-top:1px solid rgba(255,255,255,.09);vertical-align:top;line-height:1.5}
  th{font-size:10.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#8C8B87;border-top:0}
  td code{font-family:ui-monospace,Menlo,monospace;font-size:13px;color:#EDECE8;background:rgba(255,255,255,.05);padding:2px 6px;border-radius:6px;white-space:nowrap}
  td.o{color:#8C8B87}
  .box{margin-top:26px;border:1px solid rgba(123,234,90,.3);border-radius:14px;padding:18px 20px;background:rgba(123,234,90,.05)}
  .box p{margin-top:6px}
  .box p:first-child{margin-top:0}
  .copy{font-family:ui-monospace,Menlo,monospace;font-size:13px;line-height:1.6;color:#EDECE8;background:#0c0d0f;border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:14px 16px;margin-top:12px;white-space:pre-wrap;word-break:break-word}
  .foot{margin-top:40px;font-size:12.5px;color:#56554f;line-height:1.6}
  .foot a{color:#8C8B87}
  @media print{html,body{background:#fff;color:#111}p,td,.foot{color:#333}a,td code{color:#111}.box{border-color:#999;background:none}.copy{background:none;border-color:#999;color:#111}}
</style>
</head>
<body>
<div class="wrap">
  <a class="brand" href="/for-teachers">know<b style="color:#7BEA5A">here</b> &#183; teach it.</a>
  <span class="kicker">For your IT team</span>
  <h1>knowhere on the school network: nothing to install, five domains to allow.</h1>
  <p>A teacher at your school is using <b>knowhere &#183; teach it.</b>, an Australian Year 11 and 12 teaching tool (HSC and VCE). It runs entirely in the browser &#8212; on the teacher's laptop on the projector, and on students' laptops when a teacher shares a slide or a homeplay task. There is no app, no plug-in, no extension and no student account for shared links.</p>

  <h2>Please allow</h2>
  <table>
    <tr><th>Domain</th><th>What it is</th><th>Needed?</th></tr>
    <tr><td><code>knowhere.me</code><br><code>*.knowhere.me</code></td><td>The website, and the app at <code>app.knowhere.me</code>: decks, shared slides and homeplay pages. Australian company; data handled under the Privacy Act 1988.</td><td>Yes</td></tr>
    <tr><td><code>cdn.jsdelivr.net</code></td><td>Open-source libraries the app loads (React).</td><td>Yes</td></tr>
    <tr><td><code>cdnjs.cloudflare.com</code></td><td>The QR code library for homeplay.</td><td>Yes</td></tr>
    <tr><td><code>fonts.googleapis.com</code><br><code>fonts.gstatic.com</code></td><td>Web fonts.</td><td class="o">Nice to have &#8212; falls back to system fonts</td></tr>
    <tr><td><code>static.klipy.com</code></td><td>The animated goat (the app's mascot). Cosmetic.</td><td class="o">Optional</td></tr>
    <tr><td><code>cloud.umami.is</code></td><td>Privacy-first page analytics (no cookies, no personal data).</td><td class="o">Optional</td></tr>
  </table>
  <p>Standard HTTPS on port 443 only. No WebRTC, no peer-to-peer, no downloads. Nothing is required from <code>stripe.com</code> on a school network: teachers are not charged in the founding term and students never pay to open a shared slide.</p>

  <h2>Category</h2>
  <p>If your filter (Linewize / Smoothwall, Netsweeper, FortiGuard, Cisco Umbrella, Zscaler, GoGuardian, Securly, Lightspeed) has <code>knowhere.me</code> uncategorised or filed as "new site", please file it under <b>Education</b>. Each vendor has a free re-categorisation form; the one-liner below is what to paste.</p>
  <div class="copy">knowhere.me and app.knowhere.me &#8212; Australian education site for HSC and VCE (Years 11&#8211;12): interactive study and classroom teaching tool used by teachers and students. Please categorise as Education. Contact: hello@knowhere.me</div>

  <div class="box">
    <p><b>The quick test.</b> From a student laptop on the school network, open <a href="https://knowhere.me/join?test=1">knowhere.me/join?test=1</a>. If the page loads and the goat moves, you're done.</p>
    <p>Questions: <a href="mailto:hello@knowhere.me">hello@knowhere.me</a>. We answer the same day.</p>
  </div>

  <p class="foot">knowhere is made by Gigantor Studios Pty Ltd (trading as knowhere labs), NSW, Australia. <a href="/privacy">Privacy</a> &#183; <a href="/terms">Terms</a> &#183; <a href="/for-teachers">knowhere &#183; teach it.</a></p>
</div>
</body>
</html>
'''

# ───────────────────────────────── apply: for-teachers.html ─────────────────────────────────
new = ft
# head: description ×3 + JSON-LD WebPage description
new = rep(new, HEAD_DESC_OLD, HEAD_DESC_NEW, 4, 'head description')
new = rep(new, '"dateModified":"2026-09-11"', '"dateModified":"2026-10-13"', 1, 'dateModified')
new = rep(new, FAQ_OLD_JSON, FAQ_OLD_JSON + FAQ_NET_JSON, 1, 'FAQ JSON-LD')
# body region: from <nav> to the end of the cta-band section (the footer line that follows is FOOT-V25's, untouched)
start = new.index('  <nav>\n')
end_anchor = '  </section>\n\n  <div class="foot-snap">'
end = new.index(end_anchor) + len('  </section>\n')
assert new.count('  <nav>\n') == 1 and new.count(end_anchor) == 1
new = new[:start] + BODY + new[end:]
# styles: append our block before </helmet>
new = rep(new, '</style>\n</helmet>', '</style>\n' + CSS + '</helmet>', 1, 'style block')
# engine
new = rep(new, JS_SEATS_OLD, JS_SEATS_NEW, 1, 'Seats()')
new = rep(new, JS_WIRE_OLD, JS_WIRE_NEW, 1, 'wiring')
new = rep(new, '  /* founding-teacher seats. reads /api/staffroom-seats if it exists; falls back', JS_PROOF + '\n  /* founding-teacher seats. reads /api/staffroom-seats if it exists; falls back', 1, 'engine insert')
# hygiene: no stale claims survive
for bad in ('data-waitlist', 'coming with the teacher release', 'Every examinable concept', 'Your weird elective', 'href="/waitlist"', 'id="tchField"', 'id="tchSeats"'):
    if bad in new: die('stale fragment still present: %r' % bad)
if new.count(SIGNUP) != 3: die('expected 3 seat CTAs to the app signup, found %d' % new.count(SIGNUP))

# ───────────────────────────────── apply: knowhere-seo-v2.sh ─────────────────────────────────
SEO = os.path.join(ROOT, 'knowhere-seo-v2.sh')
seo = rd(SEO)
seo_new = rep(seo, 'desc="' + HEAD_DESC_OLD + '",', 'desc="' + HEAD_DESC_NEW.replace('"', '\\"') + '",', 1, 'seo desc')
seo_faq_old = '''    ("Can I use knowhere for lesson planning?",
     "Yes. Every Physics and Chemistry concept is a ready-made deck: the picture, a call it. round for the room, the takeaway and a homeplay task. Change the words, add your own slides, then present it or share it. More subjects from Term 1. Class groups and progress views are on the list — founding teachers get first say in how they work."),
   ]),'''
seo_faq_new = '''    ("Can I use knowhere for lesson planning?",
     "Yes. Every Physics and Chemistry concept is a ready-made deck: the picture, a call it. round for the room, the takeaway and a homeplay task. Change the words, add your own slides, then present it or share it. More subjects from Term 1. Class groups and progress views are on the list — founding teachers get first say in how they work."),
    ("Will knowhere work on the school network?",   # ''' + MARK + '''
     "It is a normal website, nothing to install, on the projector laptop or the students’ own. Some school filters have not categorised knowhere.me yet; a one-page note for the IT team lists the handful of domains to allow."),
   ]),'''
seo_new = rep(seo_new, seo_faq_old, seo_faq_new, 1, 'seo faq')
# the new page must be in the SEO script's page table (noindex) so a regen stamps it rather than skipping it
seo_pages_anchor = ' "waitlist.html": dict(path="/waitlist", kind="noindex",'
seo_new = rep(seo_new, seo_pages_anchor, ' "for-your-it-team.html": dict(path="/for-your-it-team", kind="noindex", title="knowhere · teach it. — a note for your IT team", desc="What knowhere needs from a school network: nothing installed, a handful of domains allowed, filed under Education.", name="For your IT team"),   # ' + MARK + '\n' + seo_pages_anchor, 1, 'seo page table')

# ───────────────────────────────── apply: server.js ─────────────────────────────────
SRV = os.path.join(ROOT, 'server.js')
srv = rd(SRV)
srv_anchor = "app.get(['/join', '/join.html'], (req, res) => {"
srv_new = rep(srv, srv_anchor, "/* " + MARK + " (13 Oct 2026): the pre-launch waitlist page is retired — teachers claim a seat in the app now, and the page's\n   copy still says the app \"goes live before the exams\". The API under /api/waitlist stays (the app forwards teacher seats to it). */\napp.get(['/waitlist', '/waitlist.html'], (req, res) => res.redirect(301, '/for-teachers'));\n" + srv_anchor, 1, 'server redirect')

# ───────────────────────────────── write, all-or-nothing ─────────────────────────────────
BAKDIR = os.path.join(HERE, 'bak-' + STAMP)
def backup(p):
    os.makedirs(BAKDIR, exist_ok=True)
    b = os.path.join(BAKDIR, os.path.basename(p)); shutil.copy2(p, b); return b
IT = os.path.join(ROOT, 'for-your-it-team.html')
writes = [(FT, new), (SEO, seo_new), (SRV, srv_new), (IT, IT_PAGE)]
backs = []
for p, _ in writes:
    if os.path.exists(p): backs.append(backup(p))
for p, content in writes:
    with open(p, 'w', encoding='utf-8') as f: f.write(content)

# ───────────────────────────────── receipts, read back from disk ─────────────────────────────────
ok = True
chk = rd(FT)
for want, n in ((MARK, None), (SIGNUP, 3), ('id="tchCallit"', 1), ('id="tchProofWidget"', 1), ('class="verbs"', 1), ('modecards four', 1), ('data-seats-show-after="10"', 1), ('KW:FOOT-V25', None)):
    c = chk.count(want)
    good = (c > 0) if n is None else (c == n)
    ok &= good; print(('✓' if good else '✗') + ' for-teachers.html  %-32s ×%d' % (want[:32], c))
try:
    srvchk = subprocess.run(['node', '--check', SRV], capture_output=True, text=True)
    good = srvchk.returncode == 0; ok &= good; print(('✓' if good else '✗') + ' node --check server.js' + ('' if good else '\n' + srvchk.stderr))
    # the page engine is plain <script>; extract and parse it
    m = re.search(r'<script>\n(/\* ══ knowhere · for-teachers page engine.*?)</script>', chk, re.S)
    if m:
        tmp = os.path.join(HERE, '.engine-check.js')
        with open(tmp, 'w', encoding='utf-8') as f: f.write(m.group(1))
        r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
        good = r.returncode == 0; ok &= good; print(('✓' if good else '✗') + ' node --check page engine' + ('' if good else '\n' + r.stderr))
        os.remove(tmp)
except FileNotFoundError:
    print('• node not found — skipped the parse checks')
for want in ('Will knowhere work on the school network?', 'for-your-it-team.html'):
    good = want in rd(SEO); ok &= good; print(('✓' if good else '✗') + ' knowhere-seo-v2.sh %s' % want)
good = "app.get(['/waitlist', '/waitlist.html']" in rd(SRV); ok &= good; print(('✓' if good else '✗') + ' server.js /waitlist → /for-teachers')
good = os.path.getsize(IT) > 3000; ok &= good; print(('✓' if good else '✗') + ' for-your-it-team.html written')
if not ok:
    for b in backs:
        shutil.copy2(b, os.path.join(ROOT, os.path.basename(b)))
    die('a receipt failed — originals restored from the backups')
print('\nbackups in ' + os.path.relpath(BAKDIR, ROOT))
print('done. Now: open http://localhost:3000/for-teachers (node server.js), tap 1·2·3 → Reveal on the model; then commit + push.')
