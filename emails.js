// knowhere.me — waitlist emails. Same shell as the app's emails (server.js emailShell), adapted.
// Assets: https://knowhere.me/email-assets/goat-<expr>.png, kw-mark.png (rendered from the app's GOAT_PATHS).
'use strict';
const crypto = require('crypto');

const SITE = process.env.SITE_URL || 'https://knowhere.me';
const ASSETS = (process.env.EMAIL_ASSET_BASE || SITE) + '/email-assets';
const FROM_MAIN = process.env.FROM_EMAIL || 'knowhere <hello@knowhere.me>';
const FROM_GOAT = process.env.FROM_EMAIL_GOAT || 'The Goat at knowhere <hello@knowhere.me>';
// Replies always land on the root domain's real mailbox, never on the sending
// subdomain (send.knowhere.me has no inbox). Set REPLY_TO to override.
const REPLY_TO = process.env.REPLY_TO || 'hello@knowhere.me';
const SECRET = process.env.ADMIN_KEY || 'dev';
const TEACHER_SEATS = Number(process.env.TEACHER_SEATS || 50);

/* ── unsubscribe (stateless HMAC, same idea as the app) ── */
function unsubToken(email) { return crypto.createHmac('sha256', SECRET).update('waitlist-unsub:' + String(email).toLowerCase()).digest('hex').slice(0, 32); }
function unsubUrl(email) { return `${SITE}/api/waitlist/unsubscribe?e=${Buffer.from(String(email)).toString('base64url')}&t=${unsubToken(email)}`; }

/* ── shell ── */
function goatHead(expr, size = 56) {
  const slug = String(expr).trim().replace(/\s+/g, '-');
  return `<img src="${ASSETS}/goat-${slug}.png" width="${size}" height="${size}" alt="The Goat" style="display:inline-block;vertical-align:middle;width:${size}px;height:${size}px;margin-right:10px;border:0">`;
}
function kwMark(h = 23) {
  const w = Math.round(h * 74.42 / 65.92);
  return `<img src="${ASSETS}/kw-mark.png" width="${w}" height="${h}" alt="knowhere" style="display:inline-block;vertical-align:middle;width:${w}px;height:${h}px;margin-right:9px;border:0">`;
}
function shell({ pill, accent = '#7BEA5A', bodyHtml, footHtml, goat, unsub }) {
  const logo = goat ? goatHead(goat) : kwMark();
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"></head>
<body style="margin:0;padding:0;background:#0C0E0B">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0C0E0B" style="background:#0C0E0B"><tr><td align="center" style="padding:36px 14px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#191B18;border:1px solid #262B26;border-radius:16px;overflow:hidden">
  <tr><td bgcolor="#0E100D" style="background:#0E100D;padding:19px 30px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-family:'Geist',system-ui,Arial,sans-serif;font-size:15px;font-weight:700;letter-spacing:-0.04em;color:#F2F0EB">${logo}knowhere</td>
      <td align="right"><span style="font-family:'JetBrains Mono','Courier New',monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#8C9389;border:1px solid rgba(255,255,255,0.16);border-radius:100px;padding:4px 10px">${pill}</span></td>
    </tr></table>
  </td></tr>
  <tr><td height="3" bgcolor="#7BEA5A" style="background:${accent};background:linear-gradient(90deg,${accent} 0%,rgba(123,234,90,0.06) 100%);font-size:0;line-height:0">&nbsp;</td></tr>
  <tr><td style="padding:34px 32px 30px">${bodyHtml}</td></tr>
  <tr><td bgcolor="#E9E7E1" style="background:#E9E7E1;padding:16px 32px;font-family:'Geist',system-ui,Arial,sans-serif;font-size:11.5px;line-height:1.6;color:#6E6A60">${footHtml}<br>knowhere · Year 12, rebuilt around you<br><a href="${SITE}/privacy.html" style="color:#6E6A60;text-decoration:underline">Privacy</a>${unsub ? ` · <a href="${unsub}" style="color:#6E6A60;text-decoration:underline">Unsubscribe</a>` : ''}</td></tr>
</table>
</td></tr></table>
</body></html>`;
}
const B = {
  eyebrow: (t, c = '#7BEA5A') => `<p style="margin:0 0 8px;font-family:'JetBrains Mono','Courier New',monospace;font-size:10.5px;letter-spacing:0.14em;text-transform:uppercase;color:${c};font-weight:600">${t}</p>`,
  h1: t => `<h1 style="margin:0 0 12px;font-family:'Geist',system-ui,Arial,sans-serif;font-size:26px;font-weight:700;letter-spacing:-0.03em;color:#F2F0EB">${t}</h1>`,
  p: t => `<p style="margin:0 0 20px;font-family:'Geist',system-ui,Arial,sans-serif;font-size:15px;line-height:1.62;color:#B4B9B0">${t}</p>`,
  btn: (label, href) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px"><tr><td bgcolor="#7BEA5A" style="border-radius:11px;background:#7BEA5A"><a href="${href}" style="display:inline-block;padding:14px 24px;font-family:'Geist',system-ui,Arial,sans-serif;font-size:15px;font-weight:700;color:#0B0D0A;text-decoration:none;letter-spacing:-0.01em">${label}</a></td></tr></table>`,
  callout: t => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px"><tr><td bgcolor="#14231A" style="background:#14231A;border:1px solid #2F5A3A;border-radius:11px;padding:12px 14px;font-family:'Geist',system-ui,Arial,sans-serif;font-size:13px;line-height:1.55;color:#B7F04A">${t}</td></tr></table>`,
  num: t => `<p style="margin:0 0 6px;font-family:'Geist',system-ui,Arial,sans-serif;font-size:56px;font-weight:800;letter-spacing:-0.05em;line-height:1;color:#7BEA5A">${t}</p>`,
  sig: () => `<p style="margin:8px 0 0;font-family:'Geist',system-ui,Arial,sans-serif;font-size:14.5px;line-height:1.6;color:#B4B9B0">— Cat<br><span style="color:#8C9389">founder, knowhere</span></p>`,
};
const first = n => (n || '').trim().split(' ')[0];
const hey = n => first(n) ? `Hey ${first(n)}` : 'Hey';
const strip = h => h.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+\n/g, '\n').replace(/[ \t]+/g, ' ').trim();

/* ── 1. welcome (sent by the server on signup) ── */
function welcome({ email, firstName, type, position, teacherSeat }) {
  const seat = type === 'teacher' && teacherSeat;
  const body = {
    student: `You're on the list. When the doors open you'll be first through them — every subject, every concept, rebuilt for the way your brain actually fires.`,
    parent: `You're on the list. When the doors open you'll be first to know — and first to see how your kid is really going, without the dinner-table interrogation.`,
    teacher: seat
      ? `You've got founding-teacher seat <strong style="color:#F2F0EB">#${teacherSeat} of ${TEACHER_SEATS}</strong>. That's three months free once the teacher experience lands, and first say in how the classroom tools work.`
      : `You're on the list for the teacher experience. The ${TEACHER_SEATS} founding seats are gone, but you're first in line when it lands — and we'll find you something for the wait.`,
  }[type] || `You're on the list.`;
  const html = shell({
    goat: 'delighted', pill: seat ? 'Founding teacher' : 'Waitlist',
    bodyHtml: B.eyebrow("you're in") + (seat ? B.num(`seat #${teacherSeat} <span style="font-size:22px;color:#8C9389;letter-spacing:0">of ${TEACHER_SEATS}</span>`) : '') + B.h1(`${hey(firstName)}, you're good to goat.`) + B.p(body)
      + B.p(`Three emails from here: a week out, three days out, launch day. No drip, no "just checking in".`)
      + B.btn('Poke the real thing meanwhile →', `${SITE}/experience-it.html`) + B.sig(),
    footHtml: `Sent to ${email} because you joined the waitlist at knowhere.me. Not you? Ignore this and nothing else will arrive.`, unsub: unsubUrl(email),
  });
  return { from: FROM_GOAT, reply_to: REPLY_TO, to: email, subject: seat ? `You're in — founding teacher seat #${teacherSeat} 🐐` : `You're in 🐐`, html, text: strip(html) };
}

/* ── 2. countdown: t7 / t3 / t0 — per cohort ── */
const DATES = { t7: 'one week', t3: 'three days', t0: 'today' };
function countdown(stage, { email, firstName, type, teacherSeat, launchDateStr, appUrl }) {
  const T = stage; const seat = type === 'teacher' && teacherSeat;
  const app = appUrl || 'https://app.knowhere.me';
  let eyebrow, h1, paras = [], btn, goat = 'shades', pill = 'Countdown';
  if (T === 't7') {
    eyebrow = 'one week to knowing';
    h1 = { student: `${hey(firstName)}. Seven days.`, parent: `${hey(firstName)}. One week out.`, teacher: `${hey(firstName)}. One week out.` }[type];
    paras = {
      student: [`The doors open on <strong style="color:#F2F0EB">${launchDateStr}</strong>. You're on the list, so you're in first — and the seven-day free trial starts the moment you walk through.`, `Between now and then: the real thing is already on the site. Pick your worst topic and poke it. It's the fastest way to know whether this is your kind of learning.`],
      parent: [`knowhere opens on <strong style="color:#F2F0EB">${launchDateStr}</strong>. You'll get one email on the day with the link — forward it to your kid, or set them up yourself. Seven days free on every plan; the parent dashboard is on Max.`, `If you want a preview of what they'll see, the concepts are live on the site now.`],
      teacher: [`The student app opens on <strong style="color:#F2F0EB">${launchDateStr}</strong>. The teacher experience follows right behind it${seat ? ` — and your founding seat #${teacherSeat} is held` : ''}.`, `Until then every concept on the site works on a projector. Try one in class this week and tell us what broke. That's the job of a founding teacher.`],
    }[type];
    btn = ['Poke a concept →', `${SITE}/experience-it.html`];
  } else if (T === 't3') {
    eyebrow = 'three days to go'; goat = 'one brow';
    h1 = { student: `Three days, ${first(firstName) || 'legend'}.`, parent: `Three days out.`, teacher: `Three days out.` }[type];
    paras = {
      student: [`${launchDateStr}. That's the day. Your login link lands in this inbox that morning.`, `One thing to do now: think about which subject you'd fix first if you could. That's where you'll start.`],
      parent: [`${launchDateStr} is the day. The link arrives here that morning. Setup takes about four minutes: they tell knowhere how they learn, and the first concept builds itself around them.`, `If they're the kind of kid who ignores emails from you (so, a kid), the link works from their own inbox too — just get them on the list.`],
      teacher: [`${launchDateStr}. Students go first; your founding access follows. We'll write the moment it's ready.`, `In the meantime, if there's a topic your class is stuck on, reply and tell us. Founding teachers get to pick what we build first.`],
    }[type];
    btn = ['See it work →', `${SITE}/experience-it.html`];
  } else {
    eyebrow = "the door's open"; goat = 'delighted'; pill = 'Launch day';
    h1 = { student: `${hey(firstName)}. Go.`, parent: `${hey(firstName)}. It's live.`, teacher: `${hey(firstName)}. Students are in.` }[type];
    paras = {
      student: [`knowhere is live. Seven days free, every subject, every concept, built for your brain. Tap the button, tell it how you learn, and watch your first concept come alive.`, `You're one letter away.`],
      parent: [`knowhere is live. Seven days free on every plan. Send this to your kid or set them up yourself — it takes four minutes, and the parent dashboard (Max) shows you how it's really going from week one.`],
      teacher: [`The student app is live today. The teacher experience is next${seat ? `, and seat #${teacherSeat} is yours` : ''} — we'll write the day it lands.`, `Want to see what your students are seeing? The full app is open on a free trial; the projector-ready concepts are on the site.`],
    }[type];
    btn = type === 'teacher' ? ['See the concepts →', `${SITE}/experience-it.html`] : ['start knowing →', app];
  }
  const html = shell({ goat, pill, bodyHtml: B.eyebrow(eyebrow) + B.h1(h1) + paras.map(B.p).join('') + B.btn(btn[0], btn[1]) + B.sig(), footHtml: `Sent to ${email} because you joined the waitlist at knowhere.me.`, unsub: unsubUrl(email) });
  const subject = { t7: { student: 'Seven days to knowing', parent: 'One week until knowhere opens', teacher: 'One week out — founding teachers' }, t3: { student: 'Three days.', parent: 'Three days to go', teacher: 'Three days out' }, t0: { student: "The door's open. Go.", parent: "knowhere is live — your kid's first concept is waiting", teacher: 'Students are in. Teachers are next.' } }[T][type];
  return { from: T === 't0' ? FROM_GOAT : FROM_MAIN, reply_to: REPLY_TO, to: email, subject, html, text: strip(html), headers: { 'List-Unsubscribe': `<${unsubUrl(email)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } };
}


/* ── 3. t4 — "send this to your parent" (Fri 25 Sep, students only) ──
   Two emails in one: the top half talks to the student, the half under the
   dashed line is written for whoever holds the card, so the whole thing can
   be forwarded as-is. The green button opens a pre-filled mailto so the
   student doesn't have to write anything. Parents/teachers get nothing at
   this stage — handoff() returns null for them and every sender skips it. */
const FACT = (k, v) => `<tr><td style="padding:10px 0;border-top:1px solid #262B26;font-family:'JetBrains Mono','Courier New',monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#8C9389;width:34%;vertical-align:top">${k}</td><td style="padding:10px 0 10px 12px;border-top:1px solid #262B26;font-family:'Geist',system-ui,Arial,sans-serif;font-size:14.5px;line-height:1.55;color:#EDECE8">${v}</td></tr>`;
const H2 = t => `<h2 style="margin:0 0 12px;font-family:'Geist',system-ui,Arial,sans-serif;font-size:22px;font-weight:700;letter-spacing:-0.03em;color:#F2F0EB">${t}</h2>`;
const SMALL = t => `<p style="margin:8px 0 0;font-family:'Geist',system-ui,Arial,sans-serif;font-size:14.5px;line-height:1.6;color:#B4B9B0">${t}</p>`;
const LINE = t => `</td></tr><tr><td style="padding:0 32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px dashed #3A4038;font-size:0;line-height:0">&nbsp;</td></tr></table><p style="margin:-9px 0 0;text-align:center;font-size:0;line-height:0"><span style="display:inline-block;background:#191B18;padding:0 10px;font-family:'JetBrains Mono','Courier New',monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#8C9389;line-height:1.4">${t}</span></p></td></tr><tr><td style="padding:30px 32px 30px">`;
const LNK = 'color:#7BEA5A;text-decoration:underline';
function handoffMailto() {
  const subject = 'Can you look at this? (knowhere)';
  const body = `Hey,\n\nI've been using a study app called knowhere this week and it's actually helping. It's $23–39 a month after the free week, which ends soon.\n\nThe page for parents: ${SITE}/for-parents.html\nPricing: ${SITE}/pricing.html\n\nCan you have a look?`;
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
function handoff({ email, firstName, type, appUrl }) {
  if (type && type !== 'student') return null;
  const app = appUrl || 'https://app.knowhere.me';
  const bodyHtml =
    B.eyebrow("this bit's for you") + B.h1(`${hey(firstName)}. Time to hand this up the chain.`)
    + B.p(`You've had knowhere for a few days now. If it's working — if a concept finally clicked, if Unstuck rescued a Tuesday — here's the honest part: after the free week it's $23 a month, and that's probably not your card.`)
    + B.p(`So I've written the bit below for your parent. Forward this whole email, or hit the button and I'll draft the message for you. You add the please.`)
    + B.btn('write the email for me →', handoffMailto())
    + SMALL(`Or just forward this. Everything they need is under the line.`) + B.sig()
    + LINE('↓ for the person with the card ↓')
    + B.eyebrow('for parents') + H2(`Your kid's been using knowhere this week. Here's what it is.`)
    + B.p(`knowhere is a Year 12 study app for the HSC and VCE. Every concept in every subject is rebuilt as an interactive model, then reshaped to how your kid actually learns — what motivates them, how their brain processes things (ADHD, autism and dyslexia treated as operating systems, not deficits), and whether they think in pictures, sound or by doing. The curriculum never changes. Only the way in does.`)
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;border-bottom:1px solid #262B26">`
    + FACT('cost', '$23–39 a month. Less than half an hour of tutoring. No lock-in, cancel any time.')
    + FACT('the trial', 'Their free week ends soon. Nothing keeps running unless you decide it should.')
    + FACT('for you', 'On the Max plan you get a parent dashboard: a weekly digest and a Gap Map of what’s ready and what isn’t — without interrogating anyone at dinner.')
    + FACT('the exams', 'HSC written exams start 13 Oct. VCE 26 Oct. That’s the window this is built for.')
    + `</table>`
    + B.p(`I built it because I was the kid pulled out of class in Year 12 for taking notes in pictures — and still finished in the top 10% of the state. The gap was never ability. It was format.`)
    + B.btn('see their week →', `${SITE}/for-parents.html`)
    + SMALL(`<a href="${SITE}/pricing.html" style="${LNK}">Plans and pricing</a>  ·  <a href="${app}" style="${LNK}">Log in and add a card</a>  ·  Questions? Reply to this — it comes to me.`)
    + B.sig();
  const html = shell({ goat: 'one brow', pill: 'The handoff', bodyHtml, footHtml: `Sent to ${email} because you joined the waitlist at knowhere.me.`, unsub: unsubUrl(email) });
  return { from: FROM_GOAT, reply_to: REPLY_TO, to: email, subject: 'Send this to your parent', html, text: strip(html), headers: { 'List-Unsubscribe': `<${unsubUrl(email)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } };
}

/* ── one door for every stage. Returns null when a cohort gets nothing at that stage. ── */
const STAGES = ['t7', 't3', 't0', 't4'];
function build(stage, args) { return stage === 't4' ? handoff(args) : countdown(stage, args); }

module.exports = { welcome, countdown, handoff, build, STAGES, unsubToken, unsubUrl, DATES };
