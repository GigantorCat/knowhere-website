#!/usr/bin/env node
/* send-launch.js — the three countdown emails, per cohort, straight from the Waitlist contacts.
   Reads the same env as server.js (RESEND_API_KEY, RESEND_SEGMENT_ID, ADMIN_KEY, SITE_URL, APP_URL).

   Dry run (prints who'd get what, sends nothing):
     node send-launch.js t7 --date "Monday 21 September"
   Send one test to yourself first:
     node send-launch.js t7 --date "Monday 21 September" --test you@x.com --as parent
   Real send (asks for a YES):
     node send-launch.js t7 --date "Monday 21 September" --send
   Stages: t7 (one week out) · t3 (three days) · t0 (launch day, needs --app https://app.knowhere.me)
   Skips unsubscribed contacts; batches of 100 via Resend's batch endpoint. */
'use strict';
const { resend, seedStats, contacts } = require('./server');
const emails = require('./emails');
const readline = require('readline');

const args = process.argv.slice(2);
const stage = args[0];
const opt = k => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : null; };
if (!['t7', 't3', 't0'].includes(stage)) { console.error('usage: node send-launch.js t7|t3|t0 --date "Monday 21 September" [--app URL] [--test you@x.com --as student|parent|teacher] [--send] [--only student|parent|teacher]'); process.exit(1); }
const launchDateStr = opt('--date') || process.env.LAUNCH_DATE_STR || 'launch day';
const appUrl = opt('--app') || process.env.APP_URL || 'https://app.knowhere.me';
const only = opt('--only');

(async () => {
  if (opt('--test')) {
    const type = opt('--as') || 'student';
    const m = emails.countdown(stage, { email: opt('--test'), firstName: 'Cat', type, teacherSeat: type === 'teacher' ? 7 : 0, launchDateStr, appUrl });
    const r = await resend('POST', '/emails', m);
    console.log(r.ok ? `test sent → ${opt('--test')} (${type})` : `FAILED ${r.status} ${JSON.stringify(r.json)}`); return;
  }
  await seedStats();
  const list = contacts.filter(c => !c.unsubscribed && (!only || (c.properties || {}).user_type === only));
  const by = {}; list.forEach(c => { const t = (c.properties || {}).user_type || 'student'; by[t] = (by[t] || 0) + 1; });
  console.log(`${stage} · "${launchDateStr}" · ${list.length} recipients`, by);
  if (!args.includes('--send')) { list.slice(0, 10).forEach(c => console.log('  ', c.email, (c.properties || {}).user_type, (c.properties || {}).state)); console.log('dry run — add --send to send.'); return; }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const yes = await new Promise(r => rl.question(`Send ${stage} to ${list.length} people? type YES: `, a => { rl.close(); r(a.trim() === 'YES'); }));
  if (!yes) { console.log('aborted'); return; }
  let sent = 0, failed = 0;
  for (let i = 0; i < list.length; i += 100) {
    const batch = list.slice(i, i + 100).map(c => {
      const p = c.properties || {};
      const m = emails.countdown(stage, { email: c.email, firstName: c.first_name, type: TYPE(p.user_type), teacherSeat: Number(p.founding_teacher_seat) || 0, launchDateStr, appUrl });
      return { from: m.from, to: [m.to], subject: m.subject, html: m.html, text: m.text, headers: m.headers, tags: [{ name: 'stage', value: stage }, { name: 'cohort', value: TYPE(p.user_type) }] };
    });
    const r = await resend('POST', '/emails/batch', batch);
    if (r.ok) sent += batch.length; else { failed += batch.length; console.error('batch failed', r.status, JSON.stringify(r.json).slice(0, 300)); }
    await new Promise(r => setTimeout(r, 600));
  }
  console.log(`done: ${sent} sent, ${failed} failed`);
})();
function TYPE(t) { return ['student', 'parent', 'teacher'].includes(t) ? t : 'student'; }
