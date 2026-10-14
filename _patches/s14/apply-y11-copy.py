#!/usr/bin/env python3
"""apply-y11-copy.py — the site-wide Year 12 → Year 11 and 12 copy swap for the Year 11 switch-on (S14).
Ruled by Cat 14 Oct 2026 (D55, tap page "Year 11 Copy Swap"): all A + the 17 plain swaps, style "Year 11 and 12".
Run from the knowhere-website root. Dry run by default; --apply writes (refuses before 2026-10-30 Sydney unless --force).
Every swap carries the count it had when it was ruled; if the site drifted, the run refuses and names the swap.
Also swaps knowhere-seo-v2.sh's own strings, so a later SEO run can never put "Year 12" back.
Backups: ../../Backend/knowhereApp/.kwtmp/baks/s14-copy-<ts>/ (outside the served site). Read back from disk."""
import os, sys, json, shutil, datetime
try:
    from zoneinfo import ZoneInfo
    TODAY = datetime.datetime.now(ZoneInfo("Australia/Sydney")).date().isoformat()
except Exception:
    TODAY = (datetime.datetime.utcnow() + datetime.timedelta(hours=11)).date().isoformat()
APPLY, FORCE = "--apply" in sys.argv, "--force" in sys.argv
LIVE_FROM = "2026-10-15"  # D56: moved from 30 Oct on 14 Oct
Y = "Year 11 and 12"
FILES = ["index.html", "compare.html", "experience-it.html", "for-parents.html", "for-teachers.html", "how-it-works.html",
         "know-us.html", "mission.html", "press.html", "pricing.html", "privacy.html", "talk-to-us.html", "terms.html",
         "waitlist.html", "emails.js", "knowhere-goat-card.js", "knowhere-seo-v2.sh"]
# (old, new, card on the tap page). Longest first where one old string contains another.
SWAPS = [
    ("Year 12 study built for your brain", f"{Y} study built for your brain", "tagline"),
    ("Year 12, rebuilt around you", f"{Y}, rebuilt around you", "eyebrow"),
    ("Same goes for Year 12.", f"Same goes for {Y}.", "kickflip"),
    ("the version of Year 12 that fits exactly one person", f"the version of {Y} that fits exactly one person", "oneperson"),
    ("A version of Year 12 that fits exactly one person", f"A version of {Y} that fits exactly one person", "oneperson"),
    ("Year 12 is where knowhere starts &mdash; not where it stops. High school next,", f"{Y} is where knowhere starts &mdash; not where it stops. The rest of high school next,", "mission"),
    ("which is why Year 12 is where knowhere starts", f"which is why {Y} is where knowhere starts", "mission"),
    ("HSC &amp; VCE &middot; Year 12", f"HSC &amp; VCE &middot; {Y}", "parents"),
    ("Finally, Year 12 in their language", f"Finally, {Y} in their language", "parents"),
    ("Year 12, in their language.", f"{Y}, in their language.", "teachers"),
    ("Year 12 study, rebuilt around you", f"{Y} study, rebuilt around you", "lines"),
    ("for Year 12 students sitting the HSC (NSW)", f"for {Y} students doing the HSC (NSW)", "lines"),
    ('"Year 12 study"', f'"{Y} study"', "lines"),
    ("Personalised Year 12 study", f"Personalised {Y} study", "lines"),
    ("Year 12 students (HSC and VCE), their parents and teachers", f"{Y} students (HSC and VCE), their parents and teachers", "lines"),
    ('"educationalLevel":"Year 12"', f'"educationalLevel":"{Y}"', "lines"),
    ("Year 12 study help that fits your kid", f"{Y} study help that fits your kid", "lines"),
    ("Year 12 study built around how your kid", f"{Y} study built around how your kid", "lines"),
    ("knowhere is a Year 12 study app", f"knowhere is a {Y} study app", "lines"),
    ("the Australian Year 12 (HSC and VCE) study app", f"the Australian {Y} (HSC and VCE) study app", "lines"),
    ("Year 12 study app &mdash; 15 HSC", f"{Y} study app &mdash; 15 HSC", "lines"),
    ("knowhere is Year 12 study that teaches", f"knowhere is {Y} study that teaches", "lines"),
    ("Questions about Year 12 study", f"Questions about {Y} study", "lines"),
    ("the Year 12 study app", f"the {Y} study app", "lines"),
    ("year 12 study that gets how you think.", "year 11 and 12 study that gets how you think.", "lines"),
]
EXPECT = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "expect.json"))) if os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)), "expect.json")) else None
if not os.path.exists("index.html") or not os.path.exists("knowhere-seo-v2.sh"):
    sys.exit("run from the knowhere-website root")
src = {f: open(f, encoding="utf8").read() for f in FILES}
counts, out = {}, dict(src)
for i, (old, new, card) in enumerate(SWAPS):
    per = {f: out[f].count(old) for f in FILES if out[f].count(old)}
    counts[str(i)] = per
    for f in per:
        out[f] = out[f].replace(old, new)
changed = [f for f in FILES if out[f] != src[f]]
print(("APPLY" if APPLY else "DRY") + f" apply-y11-copy · {len(SWAPS)} swaps · {sum(sum(p.values()) for p in counts.values())} replacements · {len(changed)} files")
for i, (old, new, card) in enumerate(SWAPS):
    print(f"  {i:>2} {card:<9} {sum(counts[str(i)].values()):>3}× {old[:60]}")
if "--pin" in sys.argv:
    json.dump(counts, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "expect.json"), "w"), indent=1)
    print("pinned expect.json"); sys.exit(0)
if EXPECT is None:
    sys.exit("no expect.json — run --pin once on the ruled tree")
drift = [i for i in counts if counts[i] != EXPECT.get(i)]
for i in drift:
    print(f"  DRIFT swap {i} ({SWAPS[int(i)][0][:50]}): ruled {EXPECT.get(i)} · now {counts[i]}")
if drift:
    sys.exit("refusing: the site changed since the copy was ruled (D55). Re-read the drift and re-pin with Cat's OK.")
left = {f: out[f].count("Year 12") + out[f].count("year 12") for f in changed}
print("  'Year 12' still on the changed pages (story, compare, form options):", sum(left.values()))
if not APPLY:
    print("nothing written — re-run with --apply on/after " + LIVE_FROM); sys.exit(0)
if TODAY < LIVE_FROM and not FORCE:
    sys.exit(f"refusing: Year 11 goes live {LIVE_FROM}; today (Sydney) is {TODAY}. --force only on Cat's word.")
ts = datetime.datetime.now().strftime("%Y%m%dT%H%M%S")
bak = os.path.join("..", "..", "Backend", "knowhereApp", ".kwtmp", "baks", "s14-copy-" + ts)
os.makedirs(bak, exist_ok=True)
for f in changed:
    shutil.copy2(f, os.path.join(bak, f))
    open(f, "w", encoding="utf8").write(out[f])
bad = [f for f in changed if open(f, encoding="utf8").read() != out[f]]
for old, new, card in SWAPS:
    for f in changed:
        if old != new and old in open(f, encoding="utf8").read() and new.find(old) < 0:
            bad.append(f + " still has: " + old[:40])
print(("read back ✓" if not bad else "read back MISMATCH: " + "; ".join(bad)) + f" · backups {bak}")
sys.exit(1 if bad else 0)
