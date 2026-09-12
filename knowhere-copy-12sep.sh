#!/usr/bin/env bash
# knowhere-copy-12sep.sh — for-parents heading highlights + line breaks; pricing compare button + fine-print pills.
#   bash knowhere-copy-12sep.sh --dry-run    # shows what would change, writes nothing
#   bash knowhere-copy-12sep.sh              # applies. Backups -> _seo-backup-<ts>/ (gitignored, not served)
# Run from the knowhere-website repo root. Idempotent. Rollback: cp _seo-backup-<ts>/* .
set -euo pipefail
[ -f index.html ] && [ -f for-parents.html ] && [ -f pricing.html ] || { echo "run this from the knowhere-website repo root"; exit 1; }
command -v python3 >/dev/null || { echo "python3 required"; exit 1; }
DRY=0; [ "${1:-}" = "--dry-run" ] && DRY=1
TMP="$(mktemp -t kwcopy.XXXXXX)"; trap 'rm -f "$TMP"' EXIT
cat > "$TMP" <<'PYEOF'
# knowhere.me — 12 Sep copy/design pass: for-parents highlights + line breaks, pricing compare button + pills.
# Run from the knowhere-website repo root. Idempotent. Backups -> _seo-backup-<ts>/ (gitignored, not served).
import os, sys, shutil, datetime

ROOT = os.getcwd()
DRY = os.environ.get("KW_DRY") == "1"
TS = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
BACKUP = os.path.join(ROOT, f"_seo-backup-{TS}")
G = '<span style="color:var(--brat)">%s</span>'

# Each file: list of edit groups. Each group: alternatives (old, new); the first alternative whose NEW is already
# present marks the group done; otherwise the first whose OLD is present (exactly once) is applied.
EDITS = {
 "for-parents.html": [
  [('<h1 data-reveal>Year 12 is hard enough. Watching it from the sidelines is harder.</h1>',
    '<h1 data-reveal>Year 12 is hard enough. ' + G % 'Watching it from the sidelines' + ' is harder.</h1>')],
  [('<h2 data-reveal>Personalisation with actual integrity</h2>',
    '<h2 data-reveal>Personalisation with actual ' + G % 'integrity' + '</h2>')],
  [('<h2 data-reveal>Designed by a neurodivergent founder</h2>',
    '<h2 data-reveal>Designed by a ' + G % 'neurodivergent' + ' founder</h2>')],
  [('<h2>Stay in the loop. Skip the interrogation.</h2>',
    '<h2>Stay ' + G % 'in the know' + '.<br>Skip the interrogation.</h2>')],
  [("<h2 data-reveal>What you'd want to know before paying for anything</h2>",
    "<h2 data-reveal>What you'd want to know<br>before paying for anything</h2>")],
  [('<h3>The best time to fix how they study was Year 7. The second-best time is tonight.</h3>',
    '<h3 style="max-width:none">The ' + G % 'best time' + ' to fix how they study was Year 7.<br>The second-best time is ' + G % 'tonight' + '.</h3>')],
 ],
 "pricing.html": [
  # the compare CTA becomes a button under the fine print (fine print text unchanged)
  [('<p class="vnote">Competitor pricing checked at time of writing; plans and prices change — always confirm on their sites. <a href="/compare" style="color:var(--brat)">Full comparison, cons included &rarr;</a></p>',
    '<p class="vnote">Competitor pricing checked at time of writing; plans and prices change — always confirm on their sites.</p>\n      <a class="cmp-btn" href="/compare">Full comparison, cons included &rarr;</a>'),
   ('<p class="vnote">Competitor pricing checked at time of writing; plans and prices change &mdash; always confirm on their sites. <a href="/compare" style="color:var(--brat)">Full comparison, cons included &rarr;</a></p>',
    '<p class="vnote">Competitor pricing checked at time of writing; plans and prices change &mdash; always confirm on their sites.</p>\n      <a class="cmp-btn" href="/compare">Full comparison, cons included &rarr;</a>')],
  [('  .kw-price .compare .vnote{font-size:11px;color:var(--dimmer);margin-top:14px}\n',
    '  .kw-price .compare .vnote{font-size:11px;color:var(--dimmer);margin-top:14px}\n'
    '  .kw-price .compare .cmp-btn{display:inline-block;margin-top:16px;font-family:inherit;font-size:14px;font-weight:600;color:var(--ink);background:rgba(255,255,255,0.05);border:1px solid rgba(123,234,90,0.5);border-radius:12px;padding:12px 20px;text-decoration:none;letter-spacing:-0.01em;transition:border-color .2s,transform .18s}\n'
    '  .kw-price .compare .cmp-btn:hover{border-color:rgba(123,234,90,0.9);color:var(--ink);transform:translateY(-1px)}\n')],
  # fine print -> pills
  [('  .kw-price .fineprint{display:flex;gap:20px;justify-content:center;flex-wrap:wrap;padding:30px 0 90px}\n'
    '  .kw-price .fineprint span{font-size:13px;color:var(--dim);display:flex;align-items:center;gap:8px}\n'
    '  .kw-price .fineprint i{width:5px;height:5px;border-radius:50%;background:var(--brat);font-style:normal}\n',
    '  .kw-price .fineprint{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;padding:34px 0 90px;max-width:880px;margin:0 auto}\n'
    '  .kw-price .fineprint span{font-size:12.5px;line-height:1.3;color:var(--ink);display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:999px;padding:9px 15px 9px 12px;background:rgba(255,255,255,0.03);white-space:nowrap}\n'
    '  .kw-price .fineprint i{width:6px;height:6px;border-radius:50%;background:var(--brat);box-shadow:0 0 8px rgba(123,234,90,.45);font-style:normal;flex-shrink:0}\n'
    '  @media (max-width:560px){.kw-price .fineprint span{white-space:normal}}\n')],
 ],
}

def backup(path):
    if DRY: return
    os.makedirs(BACKUP, exist_ok=True)
    shutil.copy2(path, os.path.join(BACKUP, os.path.basename(path)))

def main():
    for f in ("index.html", "server.js", "for-parents.html", "pricing.html"):
        assert os.path.exists(os.path.join(ROOT, f)), f"run this from the knowhere-website repo root (missing {f})"
    changed, applied, already = [], 0, 0
    for fname, groups in EDITS.items():
        path = os.path.join(ROOT, fname)
        src = open(path, encoding="utf-8").read(); out = src
        for gi, alts in enumerate(groups, 1):
            done = False
            for old, new in alts:
                if new in out: done = True; already += 1; break
            if done: continue
            for old, new in alts:
                if old in out:
                    assert out.count(old) == 1, f"{fname} edit {gi}: anchor not unique"
                    out = out.replace(old, new, 1); done = True; applied += 1; break
            assert done, f"{fname} edit {gi}: no anchor matched — file has changed, patch needs re-anchoring"
        if out != src:
            backup(path)
            if not DRY: open(path, "w", encoding="utf-8").write(out)
            changed.append(fname)
    if DRY:
        print(f"DRY RUN — would apply {applied} edit(s) ({already} already in place); files: {', '.join(changed) or 'none'}"); return
    print(f"applied {applied} edit(s), {already} already in place")
    print("changed:", ", ".join(changed) if changed else "nothing (already applied)")
    print("backup :", BACKUP if os.path.isdir(BACKUP) else "(none needed)")
    # receipts — read back from disk
    fp = open(os.path.join(ROOT, "for-parents.html"), encoding="utf-8").read()
    pr = open(os.path.join(ROOT, "pricing.html"), encoding="utf-8").read()
    checks = [
        ("parents: 5 brat highlights in headings", fp.count(G % 'Watching it from the sidelines') + fp.count(G % 'integrity') + fp.count(G % 'neurodivergent') + fp.count(G % 'in the know') + fp.count(G % 'tonight') == 5),
        ("parents: 3 line breaks (know / before paying / tonight)", fp.count('.<br>Skip the interrogation') == 1 and fp.count('know<br>before paying') == 1 and fp.count('Year 7.<br>The second-best') == 1),
        ("parents: both parent CTAs intact", fp.count('signup?as=parent') == 2),
        ("pricing: compare button present, inline link gone", 'class="cmp-btn" href="/compare"' in pr and 'style="color:var(--brat)">Full comparison' not in pr),
        ("pricing: pill styles present", '.kw-price .fineprint span{font-size:12.5px' in pr),
        ("pricing: 3 signup CTAs intact", pr.count('app.knowhere.me/signup"') == 3),
    ]
    bad = 0
    print("\nreceipts:")
    for label, ok in checks:
        print(f"  {'OK ' if ok else 'BAD'} {label}"); bad += (not ok)
    if bad:
        print(f"\n{bad} receipt(s) failed — backups in {BACKUP}"); sys.exit(2)

if __name__ == "__main__":
    main()
PYEOF
KW_DRY=$DRY python3 "$TMP"
