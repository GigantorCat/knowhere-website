/* f31 — put the pixel file on every page, fire Lead on the waitlist, and tell the truth in privacy.html.
   Exact-string patches, baks in _dev/f31-baks/, idempotent. Cat pushes. */
const fs = require('fs'), path = require('path');
const BAK = '_dev/f31-baks';
const UMAMI = '<script defer src="https://cloud.umami.is/script.js" data-website-id="ee8e1d64-1100-4281-8ca5-179736bcc3e0"></script>';
const PIXEL = '<script defer src="./knowhere-pixel.js"></script>';
const DRY = process.argv.indexOf('--apply') === -1;
let changed = 0, skipped = 0;

function read(f) { return fs.readFileSync(f, 'utf8'); }
function write(f, s) {
  if (DRY) return;
  const b = path.join(BAK, f.replace(/\//g, '__'));
  if (!fs.existsSync(b)) fs.copyFileSync(f, b);
  fs.writeFileSync(f, s);
}
function patch(f, from, to, label) {
  const s = read(f);
  if (s.indexOf(to) > -1) { skipped++; console.log('  skip  ' + f + ' :: ' + label + ' (already there)'); return; }
  if (s.indexOf(from) === -1) { console.log('  MISS  ' + f + ' :: ' + label + ' — anchor not found'); return; }
  if (s.split(from).length - 1 !== 1) { console.log('  MISS  ' + f + ' :: ' + label + ' — anchor is not unique'); return; }
  write(f, s.replace(from, () => to));
  changed++;
  console.log('  ok    ' + f + ' :: ' + label);
}

console.log(DRY ? '--- DRY RUN (pass --apply to write) ---' : '--- APPLYING ---');

console.log('1. pixel tag on every page');
fs.readdirSync('.').filter(f => f.endsWith('.html')).forEach(f => {
  patch(f, UMAMI, UMAMI + '\n' + PIXEL, 'pixel tag');
});

console.log('2. Lead on waitlist submit');
patch('knowhere-waitlist.js',
  "try { if (window.umami) window.umami.track('waitlist_join', { type: type, state: body.state, plan: body.plan || 'none' }); } catch (_) {}",
  "try { if (window.umami) window.umami.track('waitlist_join', { type: type, state: body.state, plan: body.plan || 'none' }); } catch (_) {}\n          try { if (window.kwPixel) window.kwPixel('Lead', { content_name: type }); } catch (_) {}",
  'Lead');

console.log('3. privacy.html tells the truth about the pixel');
patch('privacy.html',
  "<p><strong>Analytics</strong> — we use Umami (privacy-focused, cookie-free) to count page views and which features get used. It doesn't track you across other sites and we don't see who you are from it.</p>",
  "<p><strong>Analytics</strong> — we use Umami (privacy-focused, cookie-free) to count page views and which features get used. It doesn't track you across other sites and we don't see who you are from it.</p>\n      <p><strong>Advertising</strong> — while we're running ads we use the Meta pixel on this site and in the app, so we can tell which ads brought people here and stop paying for the ones that don't. It sets cookies and it does report back to Meta. You can turn it off with any tracker blocker, or in your Meta ad settings, and nothing on the site stops working. We don't upload your email address to Meta.</p>",
  'advertising paragraph');
patch('privacy.html',
  '<tr><td>Umami</td><td>Website analytics</td><td>anonymised page-view data, no cookies</td></tr>',
  '<tr><td>Umami</td><td>Website analytics</td><td>anonymised page-view data, no cookies</td></tr>\n            <tr><td>Meta (Facebook)</td><td>Measuring our ads while a campaign is running</td><td>pages visited and actions taken on our site, via cookies</td></tr>',
  'third-party row');
patch('privacy.html',
  "<p>We use essential browser storage (localStorage) to keep you logged in and to run app features. We don't use advertising or cross-site tracking cookies.</p>",
  "<p>We use essential browser storage (localStorage) to keep you logged in and to run app features. While we're advertising, the Meta pixel described above also sets cookies that Meta can read across sites — that's the one exception, and a tracker blocker removes it without breaking anything.</p>",
  'cookies paragraph');

console.log('\n' + (DRY ? 'would change ' : 'changed ') + changed + ' / skipped ' + skipped);
