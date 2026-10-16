#!/usr/bin/env python3
"""teacher-welcome (17 Oct 2026, Muppet) — the founding-drop email IS the signup welcome now the door is open.

What it does (website repo, ~/Code/knowhere/website/knowhere-website):
  1. emails.js — new teacherWelcome(): you're in · three things to try · the 30-second network check
     + a one-tap "Email the note to IT" (mailto, pre-written) + the IT page link. From Cat, replies to hello@.
     welcome() hands every teacher to it. The old "One email from here: the day teach it. opens" copy is gone.
  2. for-your-it-team.html — fixes "each vendor has a free form" (untrue for Zscaler / GoGuardian / Securly /
     Lightspeed), adds "Steps for your filter" (where to allow it in each console), fixes the test-box wording
     (the page says "You're through.", it has no moving goat).

Dry run by default. --apply backs up -> writes -> node --check -> renders previews -> receipts from disk.
Any failure restores the backups. Idempotent on KW:TEACHER-WELCOME / KW:IT-FILTER-STEPS.
"""
import os, sys, shutil, subprocess, time

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
EMAILS = os.path.join(ROOT, 'emails.js')
ITPAGE = os.path.join(ROOT, 'for-your-it-team.html')
APPLY = '--apply' in sys.argv

# ───────────────────────── emails.js ─────────────────────────
E_ANCHOR = "function welcome({ email, firstName, type, position, teacherSeat }) {\n  const seat = type === 'teacher' && teacherSeat;"
E_NEW = "function welcome({ email, firstName, type, position, teacherSeat }) {\n  if (type === 'teacher') return teacherWelcome({ email, firstName, teacherSeat });   /* KW:TEACHER-WELCOME */\n  const seat = type === 'teacher' && teacherSeat;"

E_BLOCK_ANCHOR = "/* ── 2. countdown: t7 / t3 / t0 — per cohort ── */"
E_BLOCK = r'''/* ── 1b. teacher welcome · KW:TEACHER-WELCOME (17 Oct 2026) ──
   The door is open (KW_TEACHER_OPEN=1): a teacher who signs up is IN on the spot, so this one email is the
   founding-drop email AND the welcome. You're in · three things to try · the 30-second network check with a
   pre-written note for IT. From Cat (teachers get Cat, ruled 12 Oct), replies land on hello@.
   Seat number shows only past 10, the same rule as the public counter (seat #2 is anti-social-proof). */
const APP_ORIGIN = (() => { try { return new URL(process.env.APP_URL || 'https://app.knowhere.me').origin; } catch (e) { return 'https://app.knowhere.me'; } })();
const FROM_CAT = process.env.FROM_EMAIL_CAT || ('Cat at knowhere <' + ((FROM_MAIN.match(/<([^>]+)>/) || [])[1] || 'hello@knowhere.me') + '>');
const IT_PAGE = `${SITE}/for-your-it-team`;
const NET_TEST = `${SITE}/join?test=1`;
const T_FONT = "'Geist',system-ui,Arial,sans-serif";
function itMailto() {
  const subject = 'Please allow knowhere.me on the school network (Education)';
  const body = [
    'Hi,',
    '',
    "I'm using knowhere · teach it. in class. It's an Australian HSC and VCE teaching tool that runs in the browser, with nothing to install.",
    '',
    'Could you check it gets through the school filter? Everything you need is on one page: the domains, the category (Education) and the steps for our filter.',
    IT_PAGE,
    '',
    "Quick test from a student laptop: " + NET_TEST + " (it reads “You're through.” when it works).",
    '',
    'Thanks!',
  ].join('\n');
  return 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}
function teacherWelcome({ email, firstName, teacherSeat }) {
  const seat = Number(teacherSeat) || 0;
  const showNo = seat > 10;
  const ghost = (label, href) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 14px"><tr><td style="border:1.5px solid #7BEA5A;border-radius:11px"><a href="${href}" style="display:inline-block;padding:12px 20px;font-family:${T_FONT};font-size:14.5px;font-weight:700;color:#F2F0EB;text-decoration:none">${label}</a></td></tr></table>`;
  const step = (n, t) => `<tr><td width="28" valign="top" style="padding:2px 0 12px;font-family:'JetBrains Mono','Courier New',monospace;font-size:12px;font-weight:700;color:#7BEA5A">${n}</td><td style="padding:0 0 12px;font-family:${T_FONT};font-size:15px;line-height:1.55;color:#B4B9B0">${t}</td></tr>`;
  const w = t => `<strong style="color:#F2F0EB;font-weight:600">${t}</strong>`;
  const lead = seat
    ? `Your founding seat is yours: knowhere · teach it., free until ${w('Friday 9 April 2027')}, and first say in what we build next.`
    : `The ${TEACHER_SEATS} founding seats have all gone, but the door's open and you're through it.`;
  const itBox = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 26px"><tr><td bgcolor="#11130F" style="background:#11130F;border:1px solid #3A3F37;border-radius:13px;padding:20px 20px 6px">`
    + B.eyebrow('before it goes on a student laptop', '#E8B44A')
    + `<p style="margin:0 0 10px;font-family:${T_FONT};font-size:18px;font-weight:700;letter-spacing:-0.02em;color:#F2F0EB">The 30-second network check</p>`
    + B.p(`School web filters are suspicious of anything new. Fair. On a student laptop at school, open <a href="${NET_TEST}" style="color:#7BEA5A;text-decoration:underline">knowhere.me/join?test=1</a>.`)
    + B.p(`${w('“You\'re through.”')} You're set.<br>${w('A block page?')} Send your IT team our one-page note. It has the domains and the steps for your school's filter, Linewize, Zscaler, GoGuardian, Securly and Lightspeed included. Most fix it in minutes.`)
    + ghost('Email the note to IT →', itMailto())
    + `<p style="margin:0 0 16px;font-family:${T_FONT};font-size:13px;line-height:1.5;color:#8C9389">or send them the link: <a href="${IT_PAGE}" style="color:#B4B9B0;text-decoration:underline">knowhere.me/for-your-it-team</a></p>`
    + `</td></tr></table>`;
  const html = shell({
    pill: seat ? 'Founding teacher' : 'Teacher',
    bodyHtml: B.eyebrow(seat ? (showNo ? `founding seat #${seat}` : 'founding seat') : "you're in", '#B795F0')
      + B.h1(`${hey(firstName)}, you're in.`)
      + B.p(lead)
      + B.p(`Live now: Year 11 and 12 ${w('Physics and Chemistry')}. Biology and Psychology are next. Teach those? We'll email you the day they land.`)
      + B.btn('Open knowhere · teach it. →', `${APP_ORIGIN}/login`)
      + `<p style="margin:6px 0 12px;font-family:${T_FONT};font-size:15px;font-weight:700;color:#F2F0EB">Three things to try this week</p>`
      + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 6px">`
      + step('01', `${w('Present.')} Pick next week's concept and put it on the projector. The model fills the screen.`)
      + step('02', `${w('Run call it.')} Lids down, fingers up. One answer is the impostor. Who's sus?`)
      + step('03', `${w('Share a slide.')} Students open it on any device. No login, no account.`)
      + `</table>`
      + itBox
      + B.p(`Anything breaks, confuses or delights you, hit reply. It comes straight to me.`)
      + B.sig(),
    footHtml: `Sent to ${email} because you made a knowhere · teach it. account. Not you? Reply and we'll close it.`, unsub: unsubUrl(email),
  });
  const subject = seat ? (showNo ? `You're in: founding seat #${seat} at knowhere · teach it.` : `You're in: a founding seat at knowhere · teach it.`) : `You're in: knowhere · teach it.`;
  const text = strip(html) + `\n\nThe note for IT: ${IT_PAGE}\nNetwork test: ${NET_TEST}\nOpen the app: ${APP_ORIGIN}/login`;
  return { from: FROM_CAT, reply_to: REPLY_TO, to: email, subject, html, text };
}

'''
E_EXPORT_OLD = "module.exports = { welcome, countdown,"
E_EXPORT_NEW = "module.exports = { welcome, teacherWelcome, countdown,"

# ───────────────────────── for-your-it-team.html ─────────────────────────
I_A1 = "Each vendor has a free re-categorisation form; the one-liner below is what to paste."
I_N1 = "Some vendors take a re-categorisation request from anyone; Zscaler, GoGuardian, Securly and Lightspeed only take one from your own admin console. Either way, the one-liner below is what to paste."
I_A2 = "If the page loads and the goat moves, you're done."
I_N2 = "If it says &#8220;You're through.&#8221;, you're done. If a block page shows instead, the filter is catching one of the domains above."
I_A3 = '  <div class="box">'
I_N3 = r'''  <h2>Steps for your filter</h2>   <!-- KW:IT-FILTER-STEPS (17 Oct 2026): where to allow it, per console -->
  <p>The fastest fix is an allow rule. Some filters treat <code>knowhere.me</code> and <code>app.knowhere.me</code> as separate sites, so add both (or <code>*.knowhere.me</code> where wildcards work).</p>
  <table>
    <tr><th>Filter</th><th>Where to allow it</th></tr>
    <tr><td>Linewize (Qoria)</td><td>Allow both in the students' filtering policy. To fix the category for every school: Filtering &#8594; Content Filtering &#8594; Category Search &#8594; Suggest a category &#8594; Education.</td></tr>
    <tr><td>Smoothwall (Qoria)</td><td>Add both to an allow list in your web filter policy.</td></tr>
    <tr><td>Zscaler</td><td>Administration &#8594; URL Categories: add both to a custom category, then allow it in Policy &#8594; URL &amp; Cloud App Control. Zscaler only re-categorises for customers, so if you can, request Education from your admin portal too.</td></tr>
    <tr><td>GoGuardian Admin</td><td>Quick Editor &#8594; + Enter a URL &#8594; Allow &#8594; pick the policy your students are on. Add each domain on its own: a domain rule doesn't cover its subdomains. Allow up to 15 minutes.</td></tr>
    <tr><td>Securly</td><td>Policy Editor &#8594; Global Settings &#8594; Allow/Block &#8594; URL: add <code>knowhere.me</code> and <code>*.knowhere.me</code>. Or use the allow list on one policy.</td></tr>
    <tr><td>Lightspeed Filter</td><td>Add both as Allow in a web rule and apply it to the rule set your students use.</td></tr>
    <tr><td>Netsweeper</td><td>Allow both in your policy, or raise a category review with Netsweeper support from your account.</td></tr>
    <tr><td>FortiGate (FortiGuard)</td><td>Web filter profile &#8594; URL filter: add both as Allow. Category review: <a href="https://www.fortiguard.com/webfilter">fortiguard.com/webfilter</a>.</td></tr>
    <tr><td>Cisco Umbrella</td><td>Policy Components &#8594; Destination Lists: add both to an allow list on the students' policy.</td></tr>
  </table>
  <p>Not listed? Look for &#8220;allow list&#8221;, &#8220;whitelist&#8221; or &#8220;URL override&#8221; in your filter's policy settings. The domains above are all it needs.</p>

  <div class="box">'''

def plan():
    out = []
    e = open(EMAILS, encoding='utf8').read()
    if 'KW:TEACHER-WELCOME' in e:
        out.append(('emails.js', None, 'already applied (KW:TEACHER-WELCOME) — skipped'))
    else:
        assert e.count(E_ANCHOR) == 1, 'emails.js: welcome() anchor count %d' % e.count(E_ANCHOR)
        assert e.count(E_BLOCK_ANCHOR) == 1, 'emails.js: countdown anchor count %d' % e.count(E_BLOCK_ANCHOR)
        assert e.count(E_EXPORT_OLD) == 1, 'emails.js: exports anchor count %d' % e.count(E_EXPORT_OLD)
        n = e.replace(E_ANCHOR, E_NEW).replace(E_BLOCK_ANCHOR, E_BLOCK + E_BLOCK_ANCHOR).replace(E_EXPORT_OLD, E_EXPORT_NEW)
        out.append(('emails.js', n, '+%d bytes: teacherWelcome(), welcome() hands teachers to it, export' % (len(n) - len(e))))
    h = open(ITPAGE, encoding='utf8').read()
    if 'KW:TEACH-SITE-V2' not in h:
        raise SystemExit('for-your-it-team.html has no KW:TEACH-SITE-V2 — git pull first')
    if 'KW:IT-FILTER-STEPS' in h:
        out.append(('for-your-it-team.html', None, 'already applied (KW:IT-FILTER-STEPS) — skipped'))
    else:
        for a in (I_A1, I_A2, I_A3):
            assert h.count(a) == 1, 'it page: anchor count %d for %r' % (h.count(a), a[:50])
        n = h.replace(I_A1, I_N1).replace(I_A2, I_N2).replace(I_A3, I_N3)
        out.append(('for-your-it-team.html', n, '+%d bytes: vendor line fixed, Steps for your filter, test wording' % (len(n) - len(h))))
    return out

def main():
    changes = plan()
    for f, n, msg in changes:
        print(('WRITE ' if n else 'SKIP  ') + f + ' — ' + msg)
    if not APPLY:
        print('\nDry run. Nothing written. Re-run with --apply.')
        return
    stamp = time.strftime('%Y%m%d-%H%M%S')
    bak = os.path.join(HERE, 'bak-' + stamp)
    os.makedirs(bak, exist_ok=True)
    paths = {'emails.js': EMAILS, 'for-your-it-team.html': ITPAGE}
    for f, n, _ in changes:
        if n: shutil.copy2(paths[f], os.path.join(bak, f))
    def restore(why):
        for f, n, _ in changes:
            if n: shutil.copy2(os.path.join(bak, f), paths[f])
        raise SystemExit('RESTORED from ' + bak + ' — ' + why)
    try:
        for f, n, _ in changes:
            if n:
                with open(paths[f], 'w', encoding='utf8') as fh: fh.write(n)
        r = subprocess.run(['node', '--check', EMAILS], capture_output=True, text=True)
        if r.returncode: restore('node --check emails.js: ' + r.stderr)
        js = ("const e=require(%r);const fs=require('fs');"
              "for(const [k,s] of [['seat14',14],['seat3',3],['noseat',0]]){const m=e.welcome({email:'preview@knowhere.me',firstName:'Sam Lee',type:'teacher',teacherSeat:s});"
              "if(!m.html.includes('KW')&&!m.html.includes('network check'))throw new Error('no IT block');"
              "fs.writeFileSync(%r+'/preview-'+k+'.html',m.html);console.log(k,'|',m.from,'|',m.subject);}"
              "const st=e.welcome({email:'s@x.com',firstName:'Al',type:'student',position:3});console.log('student still:',st.subject);") % (EMAILS, HERE)
        r = subprocess.run(['node', '-e', js], capture_output=True, text=True)
        if r.returncode: restore('render: ' + r.stderr)
        print('\nRENDER (from disk):\n' + r.stdout)
    except SystemExit: raise
    except Exception as ex: restore(repr(ex))
    # receipts read back from disk
    e = open(EMAILS, encoding='utf8').read(); h = open(ITPAGE, encoding='utf8').read()
    print('RECEIPTS')
    print('  emails.js  KW:TEACHER-WELCOME x%d · teacherWelcome( x%d · node --check OK' % (e.count('KW:TEACHER-WELCOME'), e.count('function teacherWelcome(')))
    print('  it page    KW:IT-FILTER-STEPS x%d · "free re-categorisation form" x%d · "goat moves" x%d' % (h.count('KW:IT-FILTER-STEPS'), h.count('free re-categorisation form'), h.count('goat moves')))
    print('  backups    ' + bak)

if __name__ == '__main__':
    main()
