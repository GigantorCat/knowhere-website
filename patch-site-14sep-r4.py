#!/usr/bin/env python3
# patch-site-14sep-r4.py — knowhere.me website patch, round 4 (run AFTER r3), Mon 14 Sep 2026 (Muppet).
#   home: the two library beats become one (equaliser retired), copy = the syllabus is the frame, not the ceiling; 'every subject' out of the home + pricing heads
# Run from the knowhere-website repo root:   python3 patch-site-14sep-r4.py        (add --dry to preflight only)
# Idempotent per file (markers). Every anchor asserted before any write. Backups <file>.bak-<ts> (gitignored).
# Any failed receipt restores every file it wrote. Then: git add -A && git commit && git push — commits are yours.
import sys, os, time, hashlib, types
_SRC = {}
_SRC['p_home_lib'] = '# Home page: the two "library" beats become one; "every subject" leaves the home + pricing heads (14 Sep 2026)\nMARK = \'KW:HOME-LIB\'\nPER_FILE = True\nFILES = [\'index.html\', \'pricing.html\']\n\ndef edits(src, F):\n    E = []\n    if F == \'index.html\':\n        # 1. constellation copy carries the whole idea: the syllabus is the frame, not the ceiling\n        E.append((\'<h2 style="font-size:clamp(28px,3.8vw,46px);line-height:1.05;font-weight:800;letter-spacing:-0.045em;margin:0;text-wrap:balance">Every subject. Every dot point.<br><span class="kp-irid">Then some.</span></h2>\',\n                  \'<h2 style="font-size:clamp(28px,3.8vw,46px);line-height:1.05;font-weight:800;letter-spacing:-0.045em;margin:0;text-wrap:balance">Your syllabus is the frame.<br><span class="kp-irid">Not the ceiling.</span></h2>\', 1))\n        E.append((\'Mapped to your curriculum, <em style="font-style:normal;color:#EDECE8;font-weight:600">never capped by it</em> — everything examinable covered, and the extras clearly labelled. The curriculum is the frame, not the ceiling.</p>\',\n                  \'Every dot point of your study design, across 15 HSC and 16 VCE subjects. The library holds both states, so around 300 concepts carry content <em style="font-style:normal;color:#EDECE8;font-weight:600">only the other state examines</em> — you get those too, badged &#8220;not examinable in your state&#8221;. More subjects through 2027, included in every plan. <!-- KW:HOME-LIB --></p>\', 1))\n        # 2. the equaliser beat retires: collapsed to zero height so scrollState() never lands on it (display:none would\n        #    zero its offsetTop and swallow the constellation\'s scroll range — see scrollState\'s next-section maths)\n        E.append((\'  <section data-screen-label="Equaliser" data-shape="" style="position:relative;z-index:2;min-height:100vh;scroll-snap-align:start">\',\n                  \'  <section data-screen-label="Equaliser" data-shape="" data-kw-retired="merged into The library, 14 Sep 2026" style="position:relative;z-index:2;min-height:0;height:0;padding:0;overflow:hidden" aria-hidden="true">\', 1))\n        # 2b. phone: the library formation sits a little lower and smaller under the longer copy\n        E.append((\'def.oy=ring?0:(({1:0.22,2:0.25,3:0.27,4:0.28,5:0.22,6:0.18,7:-0.10})[want]||0)*vh;\', \'def.oy=ring?0:(({1:0.22,2:0.30,3:0.27,4:0.28,5:0.22,6:0.18,7:-0.10})[want]||0)*vh;\', 1))\n        E.append((\'def.ms=ring?0.82:(({2:0.62,3:0.72,4:0.75})[want]||0.82);\', \'def.ms=ring?0.82:(({2:0.56,3:0.72,4:0.75})[want]||0.82);\', 1))\n        # 3. the "Not everyone" tail line\n        E.append((\'Every subject, both states: <span style="color:#7BEA5A">coming to life for your brain.</span>\',\n                  \'Both states, one library: <span style="color:#7BEA5A">coming to life for your brain.</span>\', 1))\n        # 4. head: meta + og + twitter + JSON-LD\n        a = \'Every HSC and VCE subject as living, interactive concepts\'\n        E.append((a, \'15 HSC and 16 VCE subjects as living, interactive concepts\', src.count(a)))\n        a = \'Every subject as living, interactive concept\'\n        E.append((a, \'15 HSC and 16 VCE subjects as living, interactive concept\', src.count(a)))\n    else:  # pricing.html\n        a = \'Every HSC and VCE subject on every plan\'\n        E.append((a, \'15 HSC and 16 VCE subjects on every plan\', src.count(a)))\n        a = \'Every HSC and VCE subject, Knowscapes\'\n        E.append((a, \'15 HSC and 16 VCE subjects, Knowscapes\', src.count(a)))\n        a = \'Every subject as living, interactive concept\'\n        E.append((a, \'15 HSC and 16 VCE subjects as living, interactive concept\', src.count(a)))\n        E.append((\'All subjects included. No per-topic fees.\', \'15 HSC and 16 VCE subjects, more through 2027. No per-topic fees. <!-- KW:HOME-LIB -->\', 1))\n    return E\n\ndef receipts(disk, F):\n    low = disk.lower()\n    R = {\'no every-subject anywhere\': \'every subject\' not in low.replace(\'every concept in every subject\', \'\') and \'every hsc and vce subject\' not in low}\n    if F == \'index.html\':\n        R[\'frame not ceiling\'] = \'Your syllabus is the frame.<br><span class="kp-irid">Not the ceiling.</span>\' in disk\n        R[\'equaliser retired\'] = \'data-kw-retired\' in disk and disk.count(\'<section data-screen-label=\') == 8   # still 8 sections in the DOM\n        R[\'both states line\'] = \'Both states, one library:\' in disk\n    return R\n'

_MODS = {}
def _load(name):
    if name in _MODS: return _MODS[name]
    mod = types.ModuleType(name)
    if name == 'p_compare3':
        base = _load('p_parents3'); mod.modal_html = base.modal_html; mod.MODAL_CSS = base.MODAL_CSS; mod.MODAL_JS = base.MODAL_JS
    exec(compile(_SRC[name], name + '.py', 'exec'), mod.__dict__); _MODS[name] = mod; return mod
class _IL:
    @staticmethod
    def import_module(name): return _load(name)
importlib = _IL()

DRY = '--dry' in sys.argv
MODS = [m for m in sys.argv[1:] if not m.startswith("--")] or ["p_home_lib"]

def md5s(s): return hashlib.md5(s.encode('utf-8')).hexdigest()

plan = []      # (mod, name, F, src_for_this_module, out)
orig = {}      # F -> content on disk before anything (backup source)
cur = {}       # F -> latest planned content (modules touching the same file chain)
for name in MODS:
    mod = importlib.import_module(name)
    files = mod.FILES if hasattr(mod, 'FILES') else [mod.FILE]
    for F in files:
        if not os.path.exists(F): sys.exit('missing %s — run from the knowhere-website repo root' % F)
        if F not in orig: orig[F] = open(F, encoding='utf-8').read(); cur[F] = orig[F]
        src = cur[F]
        if mod.MARK in src:
            print('%-22s %-24s already applied (%s)' % (name, F, mod.MARK)); continue
        E = mod.edits(src, F) if getattr(mod, 'PER_FILE', False) else mod.edits(src)
        out = src
        for k, (a, b, n) in enumerate(E):
            c = out.count(a)
            if c != n: sys.exit('PREFLIGHT FAIL %s %s edit #%d: anchor found %d× (expected %d): %r' % (name, F, k, c, n, a[:90]))
            out = out.replace(a, b)
        cur[F] = out
        plan.append((mod, name, F, src, out))
        print('%-22s %-24s %d edits ok  %s → %s' % (name, F, len(E), md5s(src)[:8], md5s(out)[:8]))

if DRY: print('dry run — nothing written'); sys.exit(0)
if not plan: print('nothing to do'); sys.exit(0)

ts = time.strftime('%Y%m%d-%H%M%S')
written = []
for F in [f for f in orig if cur[f] != orig[f]]:
    bak = '%s.bak-%s' % (F, ts)
    open(bak, 'w', encoding='utf-8').write(orig[F])
    open(F, 'w', encoding='utf-8').write(cur[F])
    written.append((F, orig[F], bak))

bad = []
for mod, name, F, src, out in plan:
    disk = open(F, encoding='utf-8').read()
    R = mod.receipts(disk, F) if getattr(mod, 'PER_FILE', False) else mod.receipts(disk)
    R['written = planned'] = (disk == cur[F])
    for k, v in R.items():
        print('  %s %-24s %s' % ('ok  ' if v else 'FAIL', F, k))
        if not v: bad.append((F, k))
if bad:
    for F, src, bak in written: open(F, 'w', encoding='utf-8').write(src)
    sys.exit('RECEIPT FAILURE %r — every file restored; backups kept with suffix .bak-%s' % (bad, ts))
print('applied %d file(s); backups .bak-%s (gitignored)' % (len(written), ts))
