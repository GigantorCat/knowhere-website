
/* ── 3. t4 — "send this to your parent" (Fri 25 Sep, students only) ──
   Two emails in one: the top half talks to the student, the half under the
   dashed line is written for whoever holds the card, so the whole thing can
   be forwarded as-is. The green button opens a pre-filled mailto so the
   student doesn't have to write anything. Parents/teachers get nothing at
   this stage — handoff() returns null for them and every sender skips it. */
const FACT = (k, v) => `<tr><td style="padding:10px 0;border-top:1px solid #262B26;font-family:'JetBrains Mono','Courier New',monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#8C9389;width:34%;vertical-align:top">${k}</td><td style="padding:10px 0 10px 12px;border-top:1px solid #262B26;font-family:'Geist',system-ui,Arial,sans-serif;font-size:14.5px;line-height:1.55;color:#EDECE8">${v}</td></tr>`;
const H2 = t => `<h2 style="margin:0 0 12px;font-family:'Geist',system-ui,Arial,sans-serif;font-size:22px;font-weight:700;letter-spacing:-0.03em;color:#F2F0EB">${t}</h2>`;
const SMALL = t => `<p style="margin:8px 0 0;font-family:'Geist',system-ui,Arial,sans-serif;font-size:14.5px;line-height:1.6;color:#B4B9B0">${t}</p>`;
const LINE = t => `</td></tr><tr><td style="padding:0 32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px dashed #3A4038;font-size:0;line-height:0">&nbsp;</td></tr></table><p style="margin:-9px 0 0;text-align:center;font-size:0;line-height:0"><span style="display:inline-block;background:#191B18;padding:0 10px;font-family:'JetBrains Mono','Courier New',monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#8C9389;line-height:1.4">${t}</span></p></td></tr><tr><td style="padding:30px 32px 0">`;
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
    + B.p(`You've had knowhere for a few days now. If it's working &mdash; if a concept finally clicked, if Unstuck rescued a Tuesday &mdash; here's the honest part: after the free week it's $23 a month, and that's probably not your card.`)
    + B.p(`So I've written the bit below for your parent. Forward this whole email, or hit the button and I'll draft the message for you. You add the please.`)
    + B.btn('write the email for me &rarr;', handoffMailto())
    + SMALL(`Or just forward this. Everything they need is under the line.`) + B.sig()
    + LINE('&darr; for the person with the card &darr;')
    + B.eyebrow('for parents') + H2(`Your kid's been using knowhere this week. Here's what it is.`)
    + B.p(`knowhere is a Year 12 study app for the HSC and VCE. Every concept in every subject is rebuilt as an interactive model, then reshaped to how your kid actually learns &mdash; what motivates them, how their brain processes things (ADHD, autism and dyslexia treated as operating systems, not deficits), and whether they think in pictures, sound or by doing. The curriculum never changes. Only the way in does.`)
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;border-bottom:1px solid #262B26">`
    + FACT('cost', '$23&ndash;39 a month. Less than half an hour of tutoring. No lock-in, cancel any time.')
    + FACT('the trial', 'Their free week ends soon. Nothing keeps running unless you decide it should.')
    + FACT('for you', 'On the Max plan you get a parent dashboard: a weekly digest and a Gap Map of what&rsquo;s ready and what isn&rsquo;t &mdash; without interrogating anyone at dinner.')
    + FACT('the exams', 'HSC written exams start 13 Oct. VCE 26 Oct. That&rsquo;s the window this is built for.')
    + `</table>`
    + B.p(`I built it because I was the kid pulled out of class in Year 12 for taking notes in pictures &mdash; and still finished in the top 10% of the state. The gap was never ability. It was format.`)
    + B.btn('see their week &rarr;', `${SITE}/for-parents.html`)
    + SMALL(`<a href="${SITE}/pricing.html" style="${LNK}">Plans and pricing</a> &nbsp;&middot;&nbsp; <a href="${app}" style="${LNK}">Log in and add a card</a> &nbsp;&middot;&nbsp; Questions? Reply to this &mdash; it comes to me.`)
    + B.sig();
  const html = shell({ goat: 'one brow', pill: 'The handoff', bodyHtml, footHtml: `Sent to ${email} because you joined the waitlist at knowhere.me.`, unsub: unsubUrl(email) });
  return { from: FROM_GOAT, reply_to: REPLY_TO, to: email, subject: 'Send this to your parent', html, text: strip(html), headers: { 'List-Unsubscribe': `<${unsubUrl(email)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } };
}

/* ── one door for every stage. Returns null when a cohort gets nothing at that stage. ── */
const STAGES = ['t7', 't3', 't0', 't4'];
function build(stage, args) { return stage === 't4' ? handoff(args) : countdown(stage, args); }

