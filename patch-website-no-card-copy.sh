#!/bin/bash
# KNOWHERE — patch-website-no-card-copy.sh
# Updates trial copy on the public site: card at signup, $0 today.
# Run from the folder containing index.html / pricing.html / for-parents.html
cd "$(dirname "$0")"
for f in index.html pricing.html for-parents.html; do
  if [ ! -f "$f" ]; then echo "✗ $f not found here — run this next to the site pages."; exit 1; fi
done
TS=$(date +%Y%m%d-%H%M%S)
for f in index.html pricing.html for-parents.html; do cp "$f" "$f.bak-$TS"; done
echo "Backups: *.bak-$TS"
if ! python3 << 'PYEOF'
import sys, io
edits = {
 'for-parents.html': [(
  "Nothing — 7 days of full access, no credit card required to start, cancel anytime with no lock-in on monthly plans. If it doesn't click, it costs you a week.",
  "Nothing today — 7 days of full access, $0 up front. Cancel before the trial ends and you won't pay a cent, with no lock-in on monthly plans. If it doesn't click, it costs you a week."
 )],
 'index.html': [(
  "Free to start — no card, no catch.",
  "Free to start — $0 today, no catch."
 )],
 'pricing.html': [(
  "<span><i></i>No credit card to start</span>",
  "<span><i></i>$0 today — 7 days free</span>"
 )],
}
ok=True
contents={}
for fname, elist in edits.items():
    with io.open(fname,'r',encoding='utf-8') as f: contents[fname]=f.read()
    for i,(old,new) in enumerate(elist):
        n=contents[fname].count(old)
        if n!=1:
            print(f"✗ ABORT — {fname}: anchor found {n} times (need exactly 1)")
            ok=False
if not ok: sys.exit(1)
for fname, elist in edits.items():
    for old,new in elist: contents[fname]=contents[fname].replace(old,new,1)
    with io.open(fname,'w',encoding='utf-8') as f: f.write(contents[fname])
    print(f"✓ {fname} updated")
PYEOF
then
  echo "✗ Patch aborted — restoring backups."
  for f in index.html pricing.html for-parents.html; do cp "$f.bak-$TS" "$f"; done
  exit 1
fi
echo "✓ DONE — website now tells the card-at-signup truth"
