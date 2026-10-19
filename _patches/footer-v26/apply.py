#!/usr/bin/env python3
"""KW:FOOT-V26 (Cat, 19 Oct 2026) — footer rows redesign + student hub links.

Desktop: three columns — 1) bigger logo + "from nowhere to knowing." (socials under it)
                         2) compare / know us / mission / press / talk to us, stacked
                         3) the student hubs: heading + HSC + VCE
Mobile:  row 1 logo + the two hub links (tagline dropped) · row 2 the links as today · row 3 socials.
Also bumps knowhere-footer.js?v=25 -> v=26 on every served page and in both builders.

  python3 _patches/footer-v26/apply.py           # dry run
  python3 _patches/footer-v26/apply.py --apply   # backups -> _patches/footer-v26/bak-<ts>/
"""
import os, sys, glob, shutil, datetime
APPLY = "--apply" in sys.argv
assert os.path.exists("knowhere-footer.js") and os.path.isdir("hsc"), "run from the knowhere-website repo root"
TS = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
BAK = os.path.join("_patches", "footer-v26", f"bak-{TS}")
STU_HEAD = "play first"   # Cat: placeholder heading — swap here (one place) when the right words land

F = "knowhere-footer.js"
EDITS = [
  # ---- desktop CSS
  ("'knowhere-footer-nav .kfn-top{display:flex;align-items:center;gap:24px 44px;flex-wrap:wrap}' +",
   "/* KW:FOOT-V26 (Cat, 19 Oct 2026): three columns — brand | links stacked | student hubs; mobile: brand + hubs, links, socials */\n"
   "            'knowhere-footer-nav .kfn-top{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr) minmax(0,1fr);grid-template-areas:\"brand links stu\" \"socs links stu\";gap:18px 44px;align-items:start}' +"),
  ("'knowhere-footer-nav .kfn-brand{display:flex;flex-direction:column;align-items:flex-start;gap:8px}' +",
   "'knowhere-footer-nav .kfn-brand{grid-area:brand;display:flex;flex-direction:column;align-items:flex-start;gap:12px}' +\n"
   "            'knowhere-footer-nav .kfn-word{font-size:30px}' +"),
  ("'knowhere-footer-nav .kfn-tag{font-size:13px;line-height:1.3;color:#9b9a96;letter-spacing:-0.005em}' +",
   "'knowhere-footer-nav .kfn-tag{font-size:18px;line-height:1.3;color:#9b9a96;letter-spacing:-0.01em}' +"),
  ("'knowhere-footer-nav .kfn-links{display:flex;align-items:center;flex-wrap:nowrap}' +",
   "'knowhere-footer-nav .kfn-links{grid-area:links;display:flex;flex-direction:column;align-items:flex-start;gap:12px;padding-top:6px}' +"),
  ("'knowhere-footer-nav .kfn-sep{color:rgba(237,236,232,0.22);font-size:14px;padding:0 14px;user-select:none}' +",
   "'knowhere-footer-nav .kfn-sep{display:none;color:rgba(237,236,232,0.22);font-size:14px;padding:0 14px;user-select:none}' +\n"
   "            'knowhere-footer-nav .kfn-stu{grid-area:stu;display:flex;flex-direction:column;align-items:flex-start;gap:14px;padding-top:6px}' +\n"
   "            'knowhere-footer-nav .kfn-stu-h{font-family:\\'JetBrains Mono\\',monospace;font-size:10.5px;letter-spacing:0.22em;text-transform:uppercase;color:#8C8B87}' +\n"
   "            'knowhere-footer-nav .kfn-stu-row{display:flex;flex-direction:column;gap:10px}' +\n"
   "            'knowhere-footer-nav a.kfn-stu-link{font-size:20px;font-weight:700;letter-spacing:-0.025em;color:#EDECE8;text-decoration:none;white-space:nowrap;transition:color .16s}' +\n"
   "            'knowhere-footer-nav a.kfn-stu-link .kfn-arr{color:#7BEA5A;margin-left:6px;transition:margin .16s}' +\n"
   "            'knowhere-footer-nav a.kfn-stu-link:hover,knowhere-footer-nav a.kfn-stu-link:focus-visible{color:#7BEA5A}' +\n"
   "            'knowhere-footer-nav a.kfn-stu-link:hover .kfn-arr{margin-left:10px}' +"),
  ("'knowhere-footer-nav .kfn-socs{display:flex;align-items:center;gap:2px;margin-left:auto}' +",
   "'knowhere-footer-nav .kfn-socs{grid-area:socs;display:flex;align-items:center;gap:2px;margin-left:-11px}' +"),
  # ---- mobile CSS
  ("'knowhere-footer-nav .kfn-top{flex-direction:column;align-items:flex-start;gap:22px}' +",
   "'knowhere-footer-nav .kfn-top{grid-template-columns:auto minmax(0,1fr);grid-template-areas:\"brand stu\" \"links links\" \"socs socs\";gap:22px 16px;align-items:center}' +\n"
   "              'knowhere-footer-nav .kfn-word{font-size:18px}' +\n"
   "              'knowhere-footer-nav .kfn-mark svg{height:30px;width:auto}' +\n"
   "              'knowhere-footer-nav .kfn-links{flex-direction:row;align-items:center;gap:0;flex-wrap:nowrap;padding-top:0}' +\n"
   "              'knowhere-footer-nav .kfn-sep{display:inline}' +\n"
   "              'knowhere-footer-nav .kfn-stu{justify-self:end;align-items:flex-end;gap:6px;padding-top:0}' +\n"
   "              'knowhere-footer-nav .kfn-stu-h{font-size:9px;letter-spacing:0.18em}' +\n"
   "              'knowhere-footer-nav .kfn-stu-row{flex-direction:row;gap:16px}' +\n"
   "              'knowhere-footer-nav a.kfn-stu-link{font-size:15px}' +\n"
   "              'knowhere-footer-nav a.kfn-stu-link .kfn-x{display:none}' +\n"
   "              'knowhere-footer-nav a.kfn-stu-link .kfn-arr{margin-left:4px}' +"),
  ("'knowhere-footer-nav .kfn-tag{font-size:12.5px}' +",
   "'knowhere-footer-nav .kfn-tag{display:none}' +"),
  # ---- markup
  ('<span style="font-size:18px;font-weight:700;letter-spacing:-0.04em;color:#EDECE8">know<b style="color:#7BEA5A">here</b>',
   '<span class="kfn-word" style="font-weight:700;letter-spacing:-0.04em;color:#EDECE8">know<b style="color:#7BEA5A">here</b>'),
  ("                  '<span class=\"kfn-tag\">from nowhere to knowing.</span>' +\n                '</div>' +\n",
   "                  '<span class=\"kfn-tag\">from nowhere to knowing.</span>' +\n                '</div>' +\n"
   "                /* KW:FOOT-V26 — the student hubs (build-hub-pages.mjs): the only links from the main site into the concept pages */\n"
   "                '<div class=\"kfn-stu\">' +\n"
   f"                  '<span class=\"kfn-stu-h\">{STU_HEAD}</span>' +\n"
   "                  '<div class=\"kfn-stu-row\">' +\n"
   "                    '<a class=\"kfn-stu-link\" href=\"/hsc/\">hsc<span class=\"kfn-x\"> concepts</span><span class=\"kfn-arr\" aria-hidden=\"true\">→</span></a>' +\n"
   "                    '<a class=\"kfn-stu-link\" href=\"/vce/\">vce<span class=\"kfn-x\"> concepts</span><span class=\"kfn-arr\" aria-hidden=\"true\">→</span></a>' +\n"
   "                  '</div>' +\n"
   "                '</div>' +\n"),
  ("slot.innerHTML = window.KnowhereMarks.logoSvg(30, '#EDECE8');",
   "slot.innerHTML = window.KnowhereMarks.logoSvg(44, '#EDECE8');"),
]
src = open(F, encoding="utf-8").read(); out = src
for old, new in EDITS:
    if new in out: continue
    assert out.count(old) == 1, (old[:80], out.count(old))
    out = out.replace(old, new, 1)

# ---- cache bust v25 -> v26: served pages + builders (backups and _-folders are never touched)
pages = [p for p in glob.glob("**/*.html", recursive=True)
         if not p.startswith(("_", "node_modules")) and "/_" not in p and ".bak" not in p]
bust = []
for p in pages:
    s = open(p, encoding="utf-8").read()
    if "knowhere-footer.js?v=25" in s:
        assert s.count("knowhere-footer.js?v=") == 1, p
        bust.append((p, s, s.replace("knowhere-footer.js?v=25", "knowhere-footer.js?v=26")))
for b, old in (("build-concept-pages.mjs", "knowhere-footer.js?v=25"), ("build-concept-collision.js", "knowhere-footer.js?v=23")):
    s = open(b, encoding="utf-8").read()
    if old in s:
        assert s.count(old) == 1, b
        bust.append((b, s, s.replace(old, "knowhere-footer.js?v=26")))

print(f"{F}: {'change' if out != src else 'already v26'} · cache bust: {len(bust)} files (v25/v23 -> v26)")
if not APPLY: print("DRY RUN — nothing written."); sys.exit(0)
os.makedirs(BAK, exist_ok=True)
for path, old, new in ([(F, src, out)] if out != src else []) + bust:
    b = os.path.join(BAK, path); os.makedirs(os.path.dirname(b) or BAK, exist_ok=True); shutil.copy2(path, b)
    open(path, "w", encoding="utf-8").write(new)
    assert open(path, encoding="utf-8").read() == new, path
left = [p for p in pages if "knowhere-footer.js?v=25" in open(p, encoding="utf-8").read()]
assert not left, left[:5]
print(f"WRITTEN · footer v26 · {len(bust)} files bumped · backups in {BAK} · receipts OK")
