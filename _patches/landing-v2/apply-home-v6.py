#!/usr/bin/env python3
"""KW:OPENERS-V6 (18 Oct 2026) — Cat's notes on the network banner, Sun 18 Oct 10:33.

  1. Network: smaller particles, and only the bottom third of the screen.
  2. KNOWHERE eyebrow: bigger, white, so it reads as the heading of the line under it.
  3. Scroll cue: "poke it" → "START KNOWING", a bit larger, brat green.

Runs on top of KW:OPENERS-V5. Idempotent on the KW:OPENERS-V6 marker. Backs up to _patches/landing-v2/bak-v6-<stamp>/.
Run from the website repo root:  python3 _patches/landing-v2/apply-home-v6.py [--dry]
"""
import os, sys, shutil, time

DRY = '--dry' in sys.argv
ROOT = os.getcwd()
IDX = os.path.join(ROOT, 'index.html')
src = open(IDX, encoding='utf-8').read()
if 'KW:OPENERS-V6' in src:
    print('already applied (KW:OPENERS-V6 marker present) — nothing to do'); sys.exit(0)
assert 'KW:OPENERS-V5' in src, 'V5 is not applied — run apply-home-v5.py first'

def swap(s, old, new, n=1, label=''):
    c = s.count(old)
    assert c == n, f'{label}: expected {n} match(es), found {c}'
    return s.replace(old, new)

# ── 1 · the network: bottom third, smaller particles ──────────────────────────────────────
src = swap(src, '''  .kp-open .kp-waves{position:absolute;left:0;right:0;bottom:0;width:100%;height:78%;pointer-events:none;z-index:0;
    -webkit-mask-image:linear-gradient(to top,#000 30%,transparent 100%);mask-image:linear-gradient(to top,#000 30%,transparent 100%)}''',
'''  .kp-open .kp-waves{position:absolute;left:0;right:0;bottom:0;width:100%;height:34%;pointer-events:none;z-index:0;
    -webkit-mask-image:linear-gradient(to top,#000 55%,transparent 100%);mask-image:linear-gradient(to top,#000 55%,transparent 100%)}''',
           1, 'canvas height')
src = swap(src, '    .kp-open .kp-waves{height:72%}\n', '    .kp-open .kp-waves{height:34%}\n', 1, 'canvas height mobile')
src = swap(src, 'r:0.9+Math.random()*1.3, green:', 'r:0.55+Math.random()*0.75, green:', 1, 'node size')
src = swap(src, "ctx.beginPath(); ctx.arc(n.x,n.y,n.r*5,0,6.283); ctx.fill();", "ctx.beginPath(); ctx.arc(n.x,n.y,n.r*4.5,0,6.283); ctx.fill();", 1, 'lit halo')
src = swap(src, "ctx.beginPath(); ctx.arc(n.x,n.y,n.r+n.lit*1.2,0,6.283); ctx.fill();", "ctx.beginPath(); ctx.arc(n.x,n.y,n.r+n.lit*0.8,0,6.283); ctx.fill();", 1, 'lit size')
src = swap(src, "ctx.fillStyle='rgba(123,234,90,0.22)'; ctx.beginPath(); ctx.arc(px,py,4,0,6.283); ctx.fill();",
           "ctx.fillStyle='rgba(123,234,90,0.22)'; ctx.beginPath(); ctx.arc(px,py,3,0,6.283); ctx.fill();", 1, 'pulse halo')
src = swap(src, "ctx.fillStyle='rgba(190,250,170,0.95)'; ctx.beginPath(); ctx.arc(px,py,1.5,0,6.283); ctx.fill();",
           "ctx.fillStyle='rgba(190,250,170,0.95)'; ctx.beginPath(); ctx.arc(px,py,1.1,0,6.283); ctx.fill();", 1, 'pulse dot')

# ── 2 + 3 · KNOWHERE heading, START KNOWING cue ──────────────────────────────────────────
src = swap(src, '''  .kp-open .kp-brandeye{margin:34px 0 0;font-size:10.5px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:#7BEA5A}''',
'''  .kp-open .kp-brandeye{margin:36px 0 0;font-size:17px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:#EDECE8}''', 1, 'brandeye')
src = swap(src, '    .kp-open .kp-brandeye{margin-top:26px;font-size:10px}\n',
           '    .kp-open .kp-brandeye{margin-top:28px;font-size:14px;letter-spacing:.28em}\n', 1, 'brandeye mobile')
src = swap(src, '  .kp-open .kp-cue{color:#B5B4AF;text-shadow:0 0 12px #070708,0 0 4px #070708,0 0 2px #070708}\n',
'''  .kp-open .kp-cue{color:#7BEA5A;font-size:13px;font-weight:700;letter-spacing:.22em;gap:8px;text-shadow:0 0 12px #070708,0 0 4px #070708,0 0 2px #070708}
  .kp-open .kp-cue svg{width:20px;height:20px}
  .kp-open .kp-cue{animation:kpCue 2.4s ease-in-out infinite}
  @keyframes kpCue{0%,100%{opacity:.85;transform:translateX(-50%) translateY(0)}50%{opacity:1;transform:translateX(-50%) translateY(6px)}}
  @media (prefers-reduced-motion:reduce){.kp-open .kp-cue{animation:none}}
  .kp-open .kp-cue:hover,.kp-open .kp-cue:focus-visible{color:#EDECE8}
  /* KW:OPENERS-V6 (18 Oct 2026): network in the bottom third, smaller particles; KNOWHERE as a white heading; START KNOWING cue */
''', 1, 'cue css')
src = swap(src, '<a class="kp-cue" href="#kwProof"><span>poke it</span>', '<a class="kp-cue" href="#kwProof"><span>start knowing</span>', 1, 'cue text')

if DRY:
    print('dry run OK — all anchors matched; nothing written'); sys.exit(0)
stamp = time.strftime('%Y%m%d-%H%M%S')
bak = os.path.join(ROOT, '_patches', 'landing-v2', 'bak-v6-' + stamp)
os.makedirs(bak, exist_ok=True)
shutil.copy2(IDX, os.path.join(bak, 'index.html'))
open(IDX, 'w', encoding='utf-8').write(src)
back = open(IDX, encoding='utf-8').read()
for needle in ['KW:OPENERS-V6', '<span>start knowing</span>', 'font-size:17px;font-weight:700;letter-spacing:.3em']:
    assert needle in back, 'receipt missing: ' + needle
assert '<span>poke it</span>' not in back
print('applied ✓  backup:', os.path.relpath(bak, ROOT))
