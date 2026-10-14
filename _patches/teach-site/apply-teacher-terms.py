#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
knowhere.me — Teacher Terms of Use (KW:TEACH-TERMS, 14 Oct 2026). Board card `teachterms`: Muppet drafts, Cat gets them checked.

    cd ~/Code/knowhere/website/knowhere-website && python3 _patches/teach-site/apply-teacher-terms.py

  · NEW /teacher-terms — built from terms.html's shell (same nav, banner, prose styles, footer) so the two read as one set
  · terms.html §02: the "teachers can join our waitlist" line now points at the teacher terms
  · knowhere-seo-v2.sh: /teacher-terms in the page table (kind legal), so a regen stamps it rather than skipping it
Idempotent on the marker; backups in _patches/teach-site/bak-terms-<stamp>/. DRAFT — Cat gets it checked before it goes live.
"""
import os, re, sys, time, shutil

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.getcwd(); STAMP = time.strftime('%Y%m%d-%H%M%S'); MARK = 'KW:TEACH-TERMS'
def die(m): print('✗ ' + m); sys.exit(1)
def rd(p):
    with open(p, encoding='utf-8') as f: return f.read()
def rep(src, old, new, n=1, label=''):
    c = src.count(old)
    if c != n: die('anchor count %d (wanted %d) for %s: %r' % (c, n, label, old[:70]))
    return src.replace(old, new)

TERMS = os.path.join(ROOT, 'terms.html'); TT = os.path.join(ROOT, 'teacher-terms.html'); SEO = os.path.join(ROOT, 'knowhere-seo-v2.sh')
for p in (TERMS, SEO):
    if not os.path.exists(p): die('run me from the website folder (missing %s)' % os.path.basename(p))
terms = rd(TERMS)
if MARK in terms: print('• terms.html already carries %s — nothing to do' % MARK); sys.exit(0)

TITLE_OLD = 'Terms of use — knowhere'; TITLE_NEW = 'Teacher terms of use — knowhere · teach it.'
DESC_OLD = 'The terms for using knowhere: accounts, parent and student access, free trial, subscriptions, billing, refunds, AI-generated content and acceptable use.'
DESC_NEW = 'The terms for knowhere · teach it.: the founding term, what happens after it, share links and homeplay, your slides and knowscapes, and acceptable use in the classroom.'

MAIN = r'''  <h1 style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Teacher Terms of Use</h1>
  <p class="sub-title" data-reveal>You run the room. <b>Here's the fence.</b></p>

  <main class="prose">
    <div class="meta-row">
      <span class="kicker"><b>knowhere · teach it. — teacher terms of use</b></span>
      <span class="kicker">Last updated · October 2026</span>
    </div>

    <div class="tldr" data-reveal>
      <span class="chip">The short version</span>
      <p>knowhere · teach it. is free for founding teachers until <strong>Friday 9 April 2027</strong>. Nothing is charged in that time, and nothing is charged after it without you saying yes. Share slides and homeplay with your students freely &#8212; they never need an account. Your words and pictures stay yours; the knowscapes stay ours and you're licensed to teach with them. AI-generated content is a teaching aid, not gospel. We're not affiliated with any curriculum authority. Be decent, and don't put students' personal details into slides.</p>
    </div>

    <section id="agreement" data-reveal>
      <h2><span class="num">01</span>Agreement</h2>
      <p>These Terms are a contract between you, as an individual teacher, and Gigantor Studios Pty Ltd (ABN 86 161 340 790), trading as <strong>knowhere labs</strong> ("Knowhere", "we", "us"). By creating a teacher account or using knowhere · teach it. ("teach it."), you agree to them. They sit alongside our general <a href="/terms">Terms of Use</a> and <a href="/privacy">Privacy Policy</a>; where they differ for teachers, these Terms win.</p>
      <p>These Terms are with you, not your school. If your school needs its own agreement, data assessment or procurement paperwork, email <a href="mailto:hello@knowhere.me">hello@knowhere.me</a> and we'll sort it with them directly.</p>
    </section>

    <section id="eligibility" data-reveal>
      <h2><span class="num">02</span>Eligibility and accounts</h2>
      <ul>
        <li>teach it. is for teachers of senior secondary students (Years 11&#8211;12) in Australia. You need to be 18 or over and teaching, or preparing to teach, at a school or in an equivalent setting.</li>
        <li>Keep your password secret and your details accurate. You're responsible for what happens on your account.</li>
        <li>One human per account. No sharing logins &#8212; a colleague who wants in claims their own seat.</li>
        <li>Teacher accounts are separate from student and parent accounts and are never on the student free trial.</li>
      </ul>
    </section>

    <section id="founding" data-reveal>
      <h2><span class="num">03</span>The founding term</h2>
      <ul>
        <li><strong>Fifty founding seats.</strong> The first fifty teachers to claim a seat are founding teachers. A seat is held the moment your account is created.</li>
        <li><strong>Free until Friday 9 April 2027</strong> (the end of Term 1, 2027, one date for every state). Nothing is charged during the founding term, and we don't collect payment details for it.</li>
        <li><strong>First say.</strong> Founding teachers get a say in how the classroom tools work. We'll ask for your feedback; you're never obliged to give it, and giving it doesn't make you a contributor to, or an owner of, anything we build with it.</li>
        <li><strong>Subjects land in waves.</strong> teach it. opens with Physics and Chemistry. Other subjects follow in waves through 2027 and we'll email you when yours is live. We can't promise dates for a wave, and a seat held for a subject that isn't live yet is still a founding seat.</li>
        <li>We may describe you as a founding teacher inside the product. We won't name you, your school or quote you publicly without asking first.</li>
      </ul>
    </section>

    <section id="after" data-reveal>
      <h2><span class="num">04</span>What happens after the founding term</h2>
      <ul>
        <li>Pricing for teach it. after 9 April 2027 will be set with the founding teachers, and we'll tell you what it is at least two weeks before the founding term ends.</li>
        <li><strong>Nothing is charged without your yes.</strong> Continuing is opt-in: you choose a plan and give payment details then, or you don't. There is no automatic conversion from a founding seat to a paid one.</li>
        <li>If you don't opt in, your account closes at the end of the founding term. Links you've shared stop working at the same time. Nothing is charged, and nobody chases you.</li>
        <li>If you do opt in, the general <a href="/terms#billing">billing terms</a> apply (Australian dollars, billed via Stripe, cancel any time, Australian Consumer Law rights always apply).</li>
      </ul>
      <div class="callout">
        <span class="chip">Australian Consumer Law</span>
        <p>Nothing in these Terms excludes your rights under the ACL, including consumer guarantees. If the service has a major problem, you're entitled to remedies under the ACL regardless of anything written here.</p>
      </div>
    </section>

    <section id="sharing" data-reveal>
      <h2><span class="num">05</span>Share links and homeplay</h2>
      <ul>
        <li>You can share any slide as a link, and the last slide of every deck is a homeplay task your students open from a QR code. <strong>Students never need an account or a login</strong> to open either, and we don't ask them for their name or any personal details to do so.</li>
        <li>Shared links are for your own students and classes. Don't post them publicly, sell them, or use them to give the service to people who aren't your students.</li>
        <li>A shared link shows your latest version of that slide. If you change the words, the link changes with you.</li>
        <li>We may record that a link was opened (how many times, when) so you and we can see what's being used. We don't record who opened it.</li>
        <li>Using teach it. in your classroom is subject to your school's own policies on technology, online tools and student privacy. Checking those is on you; the <a href="/for-your-it-team" target="_blank" rel="noopener">note for your IT team</a> covers what we need from the network.</li>
      </ul>
    </section>

    <section id="your-content" data-reveal>
      <h2><span class="num">06</span>Your slides, your words, your pictures</h2>
      <ul>
        <li><strong>You own what you write and upload</strong> &#8212; the words you change on a slide, the slides you add, the pictures you upload. You grant us a licence to store, display and process them so the service works (including showing them to the students you share with).</li>
        <li>Only upload what you have the right to use. No student photos, names, marks or other personal information in slides or pictures &#8212; teach it. isn't a place for student records.</li>
        <li><strong>Knowscapes made for you.</strong> When you ask for a concept shown your way, we generate a new knowscape from your request. It belongs to Knowhere, like the rest of our content, and you're licensed to teach with it while you have an account. Fair-use limits apply to how many you can ask for; we'll tell you if you reach one.</li>
        <li><strong>Where it lives.</strong> Your content is stored with your account on our servers; where those are, and who else handles data for us, is set out in the <a href="/privacy">Privacy Policy</a>.</li>
        <li><strong>Deleting.</strong> You can delete a slide or a knowscape you added at any time from the deck, and "reset" brings a changed slide back to our words. Closing your account removes your content from the service and switches off your shared links. See the <a href="/privacy">Privacy Policy</a> for retention.</li>
        <li>We may use de-identified, aggregated usage data (which decks get presented, which slides get changed) to improve teach it. We don't use your slide words or pictures to train AI models.</li>
      </ul>
    </section>

    <section id="ai-content" data-reveal>
      <h2><span class="num">07</span>AI-generated content &#8212; important</h2>
      <p>Knowhere uses artificial intelligence to generate concepts, knowscapes, call it. rounds, teaching notes and homeplay tasks.</p>
      <ul>
        <li>AI content can be wrong. It may contain errors, omissions or outdated information. It's a teaching aid, not a source of truth &#8212; you're the teacher, and what goes in front of your class is your call.</li>
        <li>Knowhere content is not official curriculum material. Check anything that matters against your school's materials and your state authority's official study designs and past papers.</li>
        <li>We make no guarantee about student outcomes, grades or scores.</li>
      </ul>
    </section>

    <section id="not-affiliated" data-reveal>
      <h2><span class="num">08</span>Not affiliated with exam authorities</h2>
      <p>Knowhere is an independent product. We are not affiliated with, endorsed by, or connected to the VCAA, NESA, QCAA, SACE Board, SCSA, TASC, BSSS, or any other curriculum or assessment authority. "VCE", "HSC" and similar terms are trademarks of their respective owners and are used only to describe the curriculum a subject relates to.</p>
    </section>

    <section id="vce-content" data-reveal>
      <h2><span class="num">09</span>VCE content</h2>
      __VCE__
    </section>

    <section id="acceptable-use" data-reveal>
      <h2><span class="num">10</span>Acceptable use</h2>
      <p>Don't:</p>
      <ul>
        <li>use teach it. for anything other than teaching your own students &#8212; no reselling, no redistributing decks or knowscapes, no packaging our content into other products or resources;</li>
        <li>scrape, copy, download in bulk, or mirror our content or software;</li>
        <li>reverse engineer, probe, or disrupt the service;</li>
        <li>upload unlawful, harmful, infringing content, or students' personal information;</li>
        <li>share your login, or use the service if you've been banned.</li>
      </ul>
      <p>We may suspend or terminate accounts that break these rules.</p>
    </section>

    <section id="our-content" data-reveal>
      <h2><span class="num">11</span>Our content</h2>
      <p>The Knowhere software, design, branding, knowscapes, decks and teaching notes are ours (or our licensors'). We grant you a personal, non-transferable licence to use them to teach your own students, in your classroom and through share links, while you have an account. Presenting a deck on a projector, sharing a slide with your class and sending homeplay home are all inside that licence. GIFs are provided via Klipy and remain their respective owners' property.</p>
    </section>

    <section id="availability" data-reveal>
      <h2><span class="num">12</span>Availability</h2>
      <p>We aim for high availability but the service is provided "as is" and may be interrupted for maintenance, updates, or reasons outside our control. We're a small team building fast &#8212; things will occasionally wobble. If something wobbles mid-lesson, email us; we answer the same day.</p>
    </section>

    <section id="liability" data-reveal>
      <h2><span class="num">13</span>Liability</h2>
      <p>To the maximum extent permitted by law (and without limiting your ACL rights):</p>
      <ul>
        <li>we exclude liability for indirect or consequential loss (including student results, lost lesson time, or data loss beyond our reasonable control);</li>
        <li>our total liability for any claim is limited to the amount you paid us in the 12 months before the claim, or AUD $100 if you haven't made any payment to us (for example, during the founding term);</li>
        <li>where liability can't be excluded but can be limited, it's limited to re-supplying the service or refunding the affected fees.</li>
      </ul>
    </section>

    <section id="termination" data-reveal>
      <h2><span class="num">14</span>Termination</h2>
      <p>You can close your account any time (see the <a href="/privacy">Privacy Policy</a> for what happens to your data). We can suspend or terminate accounts for breach of these Terms, with notice where reasonable. Closing an account switches off its shared links.</p>
    </section>

    <section id="changes" data-reveal>
      <h2><span class="num">15</span>Changes to these Terms</h2>
      <p>We may update these Terms. For material changes we'll give notice by email or in-app at least 14 days before they take effect. Continued use after that means acceptance. Anything that would introduce a charge during the founding term isn't a change we can make &#8212; the founding term stays free.</p>
    </section>

    <section id="governing-law" data-reveal>
      <h2><span class="num">16</span>Governing law</h2>
      <p>These Terms are governed by the laws of New South Wales, Australia. Disputes go to the courts of New South Wales (after we've both had a genuine crack at sorting it out directly).</p>
    </section>

    <section id="contact" data-reveal>
      <h2><span class="num">17</span>Contact</h2>
      <p><a href="mailto:hello@knowhere.me">hello@knowhere.me</a></p>
      <p style="margin-top:26px">Also see our general <a href="/terms">Terms of Use</a> and <a href="/privacy">Privacy Policy</a>.</p>
    </section>
  </main>
'''

# build teacher-terms.html from terms.html's shell
m = re.search(r'  <h1 style="position:absolute.*?</main>\n', terms, re.S)
if not m: die('could not find terms.html main region')
vce = re.search(r'<section id="vce-content" data-reveal>\n\s*<h2><span class="num">07</span>VCE content</h2>\n(.*?)\n\s*</section>', terms, re.S)
if not vce: die('could not find the VCE acknowledgement in terms.html (it must be copied word for word)')
page = terms[:m.start()] + MAIN.replace('__VCE__', vce.group(1).strip()) + terms[m.end():]
page = rep(page, TITLE_OLD, TITLE_NEW, 4, 'title ×4')
page = rep(page, DESC_OLD, DESC_NEW, 4, 'description ×4')
page = page.replace('https://knowhere.me/terms"', 'https://knowhere.me/teacher-terms"').replace('https://knowhere.me/terms#', 'https://knowhere.me/teacher-terms#')
page = re.sub(r'"dateModified":"[0-9-]+"', '"dateModified":"2026-10-14"', page)
page = rep(page, "window.KnowherePage.banner(root,'Terms of use'", "window.KnowherePage.banner(root,'Teacher terms'", 1, 'banner word')
page = rep(page, '<!-- KNOWHERE:SEO-HEAD v2 -->', '<!-- KNOWHERE:SEO-HEAD v2 -->\n<!-- ' + MARK + ' (14 Oct 2026): teacher terms, built from terms.html by _patches/teach-site/apply-teacher-terms.py. DRAFT until Cat has had it checked. -->', 1, 'marker')
if page.count('name="Terms"') or '"name":"Terms"' in page:
    page = page.replace('"name":"Terms"', '"name":"Teacher terms"')

# terms.html §02 line → point at the teacher terms
terms_new = rep(terms, 'Teachers can join our waitlist and pilot; the teacher experience will have its own terms when it launches.',
                'Teachers use knowhere · teach it. under the <a href="/teacher-terms">Teacher Terms of Use</a>.<!-- ' + MARK + ' -->', 1, 'terms §02')

# SEO page table
seo = rd(SEO)
seo_anchor = ' "terms.html": dict(path="/terms", kind="legal",'
seo_new = rep(seo, seo_anchor, ' "teacher-terms.html": dict(path="/teacher-terms", kind="legal", title="' + TITLE_NEW + '", desc="' + DESC_NEW + '", name="Teacher terms"),   # ' + MARK + '\n' + seo_anchor, 1, 'seo page table')

BAK = os.path.join(HERE, 'bak-terms-' + STAMP); os.makedirs(BAK, exist_ok=True)
for p in (TERMS, SEO): shutil.copy2(p, os.path.join(BAK, os.path.basename(p)))
if os.path.exists(TT): shutil.copy2(TT, os.path.join(BAK, 'teacher-terms.html'))
with open(TT, 'w', encoding='utf-8') as f: f.write(page)
with open(TERMS, 'w', encoding='utf-8') as f: f.write(terms_new)
with open(SEO, 'w', encoding='utf-8') as f: f.write(seo_new)

ok = True; chk = rd(TT)
for want, n in ((MARK, 1), (TITLE_NEW, 4), ('id="founding"', 1), ('Friday 9 April 2027', 2), ('VCE Study Design extracts used by permission', 1), ('knowhere-footer.js', 1)):
    c = chk.count(want); good = c == n; ok &= good; print(('✓' if good else '✗') + ' teacher-terms.html %-44s ×%d' % (want[:44], c))
good = '/teacher-terms' in rd(TERMS); ok &= good; print(('✓' if good else '✗') + ' terms.html §02 points at /teacher-terms')
good = 'teacher-terms.html' in rd(SEO); ok &= good; print(('✓' if good else '✗') + ' knowhere-seo-v2.sh page table')
if not ok:
    for p in (TERMS, SEO): shutil.copy2(os.path.join(BAK, os.path.basename(p)), p)
    die('a receipt failed — originals restored from ' + os.path.relpath(BAK, ROOT))
print('\nbackups in ' + os.path.relpath(BAK, ROOT) + '\ndone. Open /teacher-terms.')
