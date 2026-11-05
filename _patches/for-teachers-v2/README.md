# for-teachers v2 (KW:TEACH-V2, 5 Nov 2026)

Cat goated the mockup ("sweet, love it", "let's publish this live"). This folder rebuilds `for-teachers.html` from it.

| file | what |
|---|---|
| `mockup-5nov.html` | the goated mockup, verbatim (artifact SGNgoUKpo4LALit94DGHXh) |
| `callit-keys-5nov.json` | the five goated call it. keys, snapshotted from the app's `teach-notes.json` (run:true, keyCheck ok, 0 stale) |
| `for-teachers-v1-before.html` | the v1 page; `build.py` lifts the site nav from it |
| `build.py` | builds `for-teachers.html` (named, asserted swaps only; idempotent) |
| `shoot-posters.js` | captures `for-teachers-ks-<subject>-{d,m}.jpg` from the cropped live widget |
| `receipts-rig.js` | the phone / ad / events / classroom / links checks; screens in `receipts/` |

Rebuild: `python3 _patches/for-teachers-v2/build.py && bash knowhere-seo-v2.sh` (the SEO head lives in the stamper).
If a key is re-goated in the app, re-snapshot `callit-keys-5nov.json`, rebuild, re-run the rig.
