// knowhere.me — static site + waitlist API
// Serves every file in this folder and exposes:
//   POST /api/waitlist        → creates/updates a contact in Resend (segment: Waitlist)
//   GET  /api/waitlist/stats  → { total, teacherSeatsLeft }
// Env (Railway → Variables):
//   RESEND_API_KEY      full-access key (contacts + sending)
//   RESEND_SEGMENT_ID   the "Waitlist" segment id
//   FROM_EMAIL          e.g. "knowhere <hello@knowhere.me>"
//   TEACHER_SEATS       founding-teacher seats (default 50)
//   PORT                set by Railway

const express = require('express');
const path = require('path');
const emails = require('./emails');

const app = express();
const PORT = process.env.PORT || 3000;
const RESEND_KEY = process.env.RESEND_API_KEY || '';
const SEGMENT_ID = process.env.RESEND_SEGMENT_ID || '';
const FROM = process.env.FROM_EMAIL || 'knowhere <hello@knowhere.me>';
const TEACHER_SEATS = Number(process.env.TEACHER_SEATS || 50);
const SITE = process.env.SITE_URL || 'https://knowhere.me';
const ADMIN_KEY = process.env.ADMIN_KEY || '';

const TYPES = new Set(['student', 'parent', 'teacher']);
const STATES = new Set(['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT', 'Outside AU']);
const YEARS = new Set(['Year 12', 'Year 11', 'Year 10 or below', 'Both Year 11 & 12', 'Other']);
const PLANS = new Set(['core', 'pro', 'max', '']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '8kb' }));

// ---------- in-memory counters (re-seeded from Resend at boot) ----------
const stats = { total: 0, teachers: 0, seeded: false, byType: {}, byState: {}, byYear: {}, byPlan: {} };
const contacts = []; // {email, first_name, properties, created_at} — admin view + launch sends
function bump(o, k) { k = k || 'unknown'; o[k] = (o[k] || 0) + 1; }
function tally(c) { const p = c.properties || {}; bump(stats.byType, p.user_type); bump(stats.byState, p.state); bump(stats.byYear, p.year_level); bump(stats.byPlan, p.plan_interest); }

async function resend(method, url, body) {
  const res = await fetch('https://api.resend.com' + url, {
    method,
    headers: { Authorization: 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (_) { json = { raw: text }; }
  return { ok: res.ok, status: res.status, json };
}

async function seedStats() {
  if (!RESEND_KEY || !SEGMENT_ID) return;
  try {
    let after = null, total = 0, teachers = 0, guard = 0;
    do {
      const q = new URLSearchParams({ limit: '100' });
      if (after) q.set('after', after);
      const r = await resend('GET', `/segments/${SEGMENT_ID}/contacts?` + q.toString());
      if (!r.ok) { console.warn('[waitlist] seed failed', r.status, r.json); return; }
      const rows = (r.json && r.json.data) || [];
      for (const c of rows) {
        total++;
        const p = c.properties || {};
        if (p.user_type === 'teacher') teachers++;
        contacts.push({ email: c.email, first_name: c.first_name || '', properties: p, created_at: c.created_at, unsubscribed: !!c.unsubscribed });
        tally(c);
      }
      after = r.json && r.json.has_more && rows.length ? rows[rows.length - 1].id : null;
    } while (after && ++guard < 100);
    stats.total = total; stats.teachers = teachers; stats.seeded = true;
    console.log(`[waitlist] seeded: ${total} contacts, ${teachers} teachers`);
  } catch (e) { console.warn('[waitlist] seed error', e.message); }
}

// ---------- tiny per-IP rate limit ----------
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
  arr.push(now); hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 8;
}

function clean(v, max = 120) {
  return String(v == null ? '' : v).replace(/[\x00-\x1f<>]/g, '').trim().slice(0, max);
}

// ---------- routes ----------
app.get('/api/waitlist/stats', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ total: stats.total, teacherSeatsLeft: Math.max(0, TEACHER_SEATS - stats.teachers), teacherSeatsTotal: TEACHER_SEATS });
});

// ---------- admin (ADMIN_KEY) ----------
function admin(req, res) { if (!ADMIN_KEY || req.query.key !== ADMIN_KEY) { res.status(401).json({ ok: false, error: 'nope' }); return false; } res.set('Cache-Control', 'no-store'); return true; }
app.get('/api/waitlist/admin', (req, res) => {
  if (!admin(req, res)) return;
  res.json({ total: stats.total, seeded: stats.seeded, teacherSeatsLeft: Math.max(0, TEACHER_SEATS - stats.teachers), byType: stats.byType, byState: stats.byState, byYear: stats.byYear, byPlan: stats.byPlan });
});
app.get('/api/waitlist/export.csv', (req, res) => {
  if (!admin(req, res)) return;
  const cols = ['email', 'first_name', 'user_type', 'state', 'year_level', 'plan_interest', 'school', 'source_page', 'waitlist_position', 'founding_teacher_seat', 'joined_at'];
  const esc = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const lines = [cols.join(',')].concat(contacts.map(c => cols.map(k => esc(k === 'email' ? c.email : k === 'first_name' ? c.first_name : c.properties[k])).join(',')));
  res.set('Content-Type', 'text/csv; charset=utf-8'); res.set('Content-Disposition', 'attachment; filename="knowhere-waitlist.csv"');
  res.send(lines.join('\n'));
});

// one-click unsubscribe (HMAC link in every waitlist email) — the app's goat page, ported: tears out, hearts back
const { unsubPage } = require('./unsub-page');
app.all('/api/waitlist/unsubscribe', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  let email = ''; try { email = Buffer.from(String(req.query.e || ''), 'base64url').toString('utf8'); } catch (_) {}
  const ok = email && req.query.t === emails.unsubToken(email);
  if (!ok) return res.status(400).send(unsubPage({ state: 'bad' }));
  const back = String(req.query.resub || '') === '1';
  if (RESEND_KEY) { const r = await resend('PATCH', '/contacts/' + encodeURIComponent(email), { unsubscribed: !back }); if (!r.ok) console.warn('[waitlist] unsub failed', r.status, r.json); }
  const c = contacts.find(x => x.email === email); if (c) c.unsubscribed = !back;
  res.send(unsubPage({ state: back ? 'back' : 'out', resubUrl: back ? '' : emails.unsubUrl(email) + '&resub=1' }));
});
// admin preview of any email:  /api/waitlist/preview?key=…&which=welcome|t7|t3|t0&type=student|parent|teacher
app.get('/api/waitlist/preview', (req, res) => {
  if (!admin(req, res)) return;
  const type = String(req.query.type || 'student'), which = String(req.query.which || 'welcome');
  const args = { email: 'preview@knowhere.me', firstName: 'Cat', type, position: 42, teacherSeat: type === 'teacher' ? 7 : 0, launchDateStr: process.env.LAUNCH_DATE_STR || 'Monday 21 September', appUrl: process.env.APP_URL || 'https://app.knowhere.me' };
  const m = which === 'welcome' ? emails.welcome(args) : emails.countdown(which, args);
  res.set('Content-Type', 'text/html; charset=utf-8').send(m.html);
});

// for-teachers.html already polls this shape: { remaining, total }
app.get('/api/staffroom-seats', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ remaining: Math.max(0, TEACHER_SEATS - stats.teachers), total: TEACHER_SEATS });
});

app.post('/api/waitlist', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const b = req.body || {};
  if (b.website) return res.json({ ok: true, position: stats.total + 1 }); // honeypot: pretend
  if (limited(req.ip)) return res.status(429).json({ ok: false, error: 'Slow down — try again in a few minutes.' });

  const email = clean(b.email, 160).toLowerCase();
  const type = clean(b.type, 20).toLowerCase();
  const state = clean(b.state, 20);
  const year = clean(b.year, 30);
  const plan = clean(b.plan, 10).toLowerCase();
  const firstName = clean(b.firstName, 60);
  const school = clean(b.school, 120);
  const source = clean(b.source, 120);

  if (!EMAIL_RE.test(email)) return res.status(400).json({ ok: false, error: 'That email doesn\'t look right.' });
  if (!TYPES.has(type)) return res.status(400).json({ ok: false, error: 'Tell us who you are — student, parent or teacher.' });
  if (!STATES.has(state)) return res.status(400).json({ ok: false, error: 'Pick your state.' });
  if (!YEARS.has(year)) return res.status(400).json({ ok: false, error: 'Pick a year level.' });
  if (!PLANS.has(plan)) return res.status(400).json({ ok: false, error: 'Unknown plan.' });
  if (!RESEND_KEY) return res.status(503).json({ ok: false, error: 'Waitlist isn\'t wired up yet. Email hello@knowhere.me and we\'ll add you by hand.' });

  const position = stats.total + 1;
  const teacherSeat = type === 'teacher' && stats.teachers < TEACHER_SEATS ? stats.teachers + 1 : 0;
  const properties = {
    user_type: type, state, year_level: year, plan_interest: plan || 'none', school: school || 'none',
    source_page: source || 'direct', waitlist_position: position, founding_teacher_seat: teacherSeat,
    joined_at: new Date().toISOString(),
  };
  const payload = { email, first_name: firstName || undefined, unsubscribed: false, properties, segments: SEGMENT_ID ? [{ id: SEGMENT_ID }] : undefined };

  try {
    let r = await resend('POST', '/contacts', payload);
    let existed = false;
    if (!r.ok && (r.status === 409 || /exist/i.test(JSON.stringify(r.json)))) {
      existed = true;
      // keep their original position; just refresh the details
      delete properties.waitlist_position; delete properties.founding_teacher_seat; delete properties.joined_at;
      r = await resend('PATCH', '/contacts/' + encodeURIComponent(email), { first_name: firstName || undefined, properties, segments: payload.segments });
    }
    if (!r.ok) {
      console.error('[waitlist] resend error', r.status, r.json);
      return res.status(502).json({ ok: false, error: 'Couldn\'t save that just now. Try again, or email hello@knowhere.me.' });
    }
    if (!existed) {
      stats.total = position;
      if (teacherSeat) stats.teachers = teacherSeat;
      contacts.push({ email, first_name: firstName, properties, created_at: properties.joined_at }); tally({ properties });
      const mail = emails.welcome({ email, firstName, type, position, teacherSeat });
      resend('POST', '/emails', { from: mail.from, to: [email], subject: mail.subject, html: mail.html, text: mail.text })
        .then(m => { if (!m.ok) console.warn('[waitlist] welcome email failed', m.status, m.json); }).catch(() => {});
    }
    return res.json({ ok: true, existed, position: existed ? null : position, teacherSeat: existed ? null : teacherSeat, teacherSeatsLeft: Math.max(0, TEACHER_SEATS - stats.teachers) });
  } catch (e) {
    console.error('[waitlist] error', e);
    return res.status(500).json({ ok: false, error: 'Something broke on our side. Email hello@knowhere.me and we\'ll add you.' });
  }
});

// ---------- static site ----------
app.use((req, res, next) => {
  // never serve backups, patch scripts, the app prototype or server files
  const p = req.path;
  const blocked = /\.bak/i.test(p) || /\.(sh|md|json)$/i.test(p) || /^\/(server\.js|knowhere\.html|\.git|_)/i.test(p);
  if (blocked) return res.status(404).end();
  next();
});
app.use(express.static(__dirname, { extensions: ['html'], maxAge: '1h', setHeaders(res, p) {
  if (p.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
}}));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, '404.html')));

if (require.main === module) app.listen(PORT, () => { console.log('knowhere.me listening on ' + PORT); seedStats(); });
module.exports = { resend, seedStats, contacts, stats };
