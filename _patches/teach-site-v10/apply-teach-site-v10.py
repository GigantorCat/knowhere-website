#!/usr/bin/env python3
# KW:TEACH-SITE-V10 (26 Oct 2026): Physical Education (VCE) joins the live teacher subjects.
# Replaces V8 (Economics only, never applied). Five files: for-teachers (meta, JSON-LD x2, body x6),
# teacher-terms line + dateModified, emails.js teacherWelcome, knowhere-seo-v2.sh x2 (+ checks the SEO desc
# still equals the page meta, so the next SEO run can't put the old list back).
# Usage (repo root): python3 _patches/teach-site-v10/apply-teach-site-v10.py            dry run
#                    python3 _patches/teach-site-v10/apply-teach-site-v10.py --apply    writes, backs up, reads back
# --apply refuses unless the LIVE app fence has 'physical-education'
# (or you pass --fence-confirmed after checking it yourself).
import sys, os, re, shutil, datetime, urllib.request
APPLY = '--apply' in sys.argv
ROOT = os.getcwd()
HERE = os.path.join(ROOT, '_patches', 'teach-site-v10')
TODAY = '2026-10-26'
OLD = 'Physics, Chemistry, Biology, Psychology, Maths, Economics, Accounting and Business'
NEW = 'Physics, Chemistry, Biology, Psychology, Maths, Economics, Accounting, Business and Physical Education'
EDITS = {
  'for-teachers.html': [
    (OLD, NEW, 9),
    ('"dateModified":"2026-10-25"', '"dateModified":"%s"' % TODAY, 1),
  ],
  'teacher-terms.html': [
    ('Biology, Psychology, Maths, Economics, Accounting and Business are live now.', 'Biology, Psychology, Maths, Economics, Accounting, Business and Physical Education are live now.', 1),
    ('"dateModified":"2026-10-25"', '"dateModified":"%s"' % TODAY, 1),
  ],
  'emails.js': [(OLD, NEW, 1)],
  'knowhere-seo-v2.sh': [(OLD, NEW, 2)],
}
MARK_HTML = '<!-- KW:TEACH-SITE-V10 (26 Oct 2026): Physical Education live -->\n'
TAG = 'KW:TEACH-SITE-V10'

def fence():
    try:
        js = urllib.request.urlopen('https://app.knowhere.me/kwbuild/app.js', timeout=20).read().decode('utf-8', 'ignore')
    except Exception as e:
        return None, 'could not fetch the live app (%s)' % e
    m = re.search(r"T_TEACH_LIVE=\[([^\]]*)\]", js)
    if not m: return None, 'T_TEACH_LIVE not found in the live app'
    s = m.group(1)
    have = {k: (("'%s'" % k) in s) for k in ('physical-education',)}
    return all(have.values()), 'live fence: ' + ', '.join('%s %s' % (k, 'yes' if v else 'NO') for k, v in have.items())

plan, ok = {}, True
for f, edits in EDITS.items():
    src = open(os.path.join(ROOT, f), encoding='utf-8').read()
    if TAG in src: print('ALREADY APPLIED:', f); ok = False; continue
    out = src
    for old, new, n in edits:
        c = out.count(old)
        print(('OK  ' if c == n else 'FAIL'), f, '| want', n, 'got', c, '|', old[:64])
        if c != n: ok = False; continue
        out = out.replace(old, new)
    if OLD in out: print('FAIL', f, '| old list still present after edits'); ok = False
    if f.endswith('.html'):
        out = out.replace('</body>', MARK_HTML + '</body>', 1) if '</body>' in out else out + MARK_HTML
    elif f.endswith('.js'):
        out = out.rstrip('\n') + '\n// ' + TAG + ' (26 Oct 2026)\n'
    elif f.endswith('.sh'):
        out = out.rstrip('\n') + '\n# ' + TAG + ' (26 Oct 2026)\n'
    plan[f] = out

# the SEO script's desc must equal the page's meta description, or the next SEO run reverts it
if 'for-teachers.html' in plan and 'knowhere-seo-v2.sh' in plan:
    meta = re.search(r'<meta name="description" content="([^"]*)"', plan['for-teachers.html'])
    blk = plan['knowhere-seo-v2.sh'].split('"for-teachers.html": dict(', 1)
    desc = re.search(r'desc="([^"]*)"', blk[1]) if len(blk) > 1 else None
    same = bool(meta and desc and meta.group(1) == desc.group(1))
    print(('OK  ' if same else 'FAIL'), 'SEO desc == for-teachers meta description')
    if not same: ok = False

if not ok: print('PREFLIGHT FAILED - nothing written'); sys.exit(1)
live, why = fence(); print('INFO', why)
if not APPLY: print('DRY RUN OK - rerun with --apply once the fence is live'); sys.exit(0)
if not live and '--fence-confirmed' not in sys.argv:
    print('STOP: the live fence does not show physical-education yet (%s). Nothing written.' % why); sys.exit(2)
stamp = datetime.datetime.now().strftime('%Y-%m-%dT%H%M%S')
for f, out in plan.items():
    shutil.copy2(os.path.join(ROOT, f), os.path.join(HERE, 'bak-%s-%s' % (f, stamp)))
    open(os.path.join(ROOT, f), 'w', encoding='utf-8').write(out)
    back = open(os.path.join(ROOT, f), encoding='utf-8').read()
    assert back == out, 'disk mismatch ' + f
    print('WROTE', f, '| backup', 'bak-%s-%s' % (f, stamp))
print('APPLIED. Read back from disk.')
