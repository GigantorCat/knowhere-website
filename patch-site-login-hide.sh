#!/bin/bash
# KNOWHERE — patch-site-login-hide.sh
# Hides the Log in button on mobile (≤820px) on ALL pages — it lives in the
# ☰ drawer. One-selector fix. Run from the site pages folder.
cd "$(dirname "$0")"
for f in index.html pricing.html experience-it.html how-it-works.html for-parents.html; do
  if [ ! -f "$f" ]; then echo "✗ $f not found here."; exit 1; fi
done
TS=$(date +%Y%m%d-%H%M%S)
for f in index.html pricing.html experience-it.html how-it-works.html for-parents.html; do cp "$f" "$f.bak-$TS"; done
echo "Backups: *.bak-$TS"
if ! python3 << 'PYEOF'
import io, sys
OLD = '@media (max-width:820px){.kwm-btn{display:flex}nav>a[href*="app.knowhere.me"]{display:none !important}}'
NEW = '@media (max-width:820px){.kwm-btn{display:flex}nav a[href*="app.knowhere.me"]{display:none !important}}'
for f in ['index.html','pricing.html','experience-it.html','how-it-works.html','for-parents.html']:
    c = io.open(f, encoding='utf-8').read()
    if NEW in c:
        print(f'\u2713 {f}: already fixed'); continue
    n = c.count(OLD)
    if n != 1:
        print(f'\u2717 ABORT \u2014 {f}: v4 rule found {n}x (need 1) \u2014 run patch-site-menu-repair.sh first'); sys.exit(1)
    io.open(f, 'w', encoding='utf-8').write(c.replace(OLD, NEW, 1))
    print(f'\u2713 {f}: Log in now drawer-only on mobile')
PYEOF
then
  echo "✗ Patch aborted — restoring backups."
  for f in index.html pricing.html experience-it.html how-it-works.html for-parents.html; do cp "$f.bak-$TS" "$f"; done
  exit 1
fi
echo "✓ DONE — hard-refresh each page (⌘⇧R)"
