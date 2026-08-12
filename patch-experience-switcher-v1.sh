#!/bin/bash
# KNOWHERE — patch-experience-switcher-v1.sh
# experience-it.html: GPE becomes the hero widget, and a subject pill row
# lets visitors swap the live widget between Physics / English / Maths /
# Chemistry / Biology. Listen descriptions + chrome labels swap with it.
#
# PREREQ: the five widget files must exist at widgets/<slug>.html —
#   widgets/gpe-physics-blue.html                                (the BLUE one)
#   widgets/appeals-and-their-effect.html
#   widgets/differentiation-rules-and-techniques.html
#   widgets/chemical-equilibrium-disasters-explained.html
#   widgets/thermoregulation-in-endotherms.html
# If your /widgets folder is nested (subject/topic/), edit the src: lines
# in the KW_WIDGETS block below before running.
#
# Run from the folder containing experience-it.html:  bash patch-experience-switcher-v1.sh
cd "$(dirname "$0")"
F="experience-it.html"
[ -f "$F" ] || { echo "✗ $F not found here — run this next to the site pages."; exit 1; }

# ── idempotency guard ────────────────────────────────────────────────
if grep -q 'KW_WIDGETS' "$F"; then echo "✓ already patched — nothing to do."; exit 0; fi

TS=$(date +%Y%m%d-%H%M%S)
cp "$F" "$F.bak-$TS"
echo "Backup: $F.bak-$TS"

if ! python3 << 'PYEOF'
import io, sys

F = 'experience-it.html'
src = io.open(F, encoding='utf-8').read()

# ── anchors (each must appear EXACTLY once) ──────────────────────────
A_SUB = '<p class="sub">This is a real widget from the app — not a mockup, not a render. Drag it, watch it, or hit listen. Interactive, visual and audio in one artefact.</p>'

A_CHROME = '<span>physics · unit 3 · gravity &amp; fields</span>'

A_IFRAME = '<iframe src="demo-widget-gravity.html" title="Interactive spacetime curvature widget" loading="lazy" scrolling="no"></iframe>'

A_DESC = 'const DESC="This widget shows a two dimensional grid representing spacetime. A large mass sits in the centre, warping the grid downward like a weight on a stretched sheet. A smaller object moves in a straight line — but because the grid itself is curved, its path bends into an orbit. Drag the mass to change its size, and watch how the curvature, and the orbit, respond. The takeaway: gravity is not a pulling force. It is the shape of space itself.";'

ok = True
for name, a in [('sub copy', A_SUB), ('chrome label', A_CHROME), ('iframe', A_IFRAME), ('DESC const', A_DESC)]:
    n = src.count(a)
    if n != 1:
        print(f'✗ ABORT — anchor "{name}" found {n} times (need exactly 1). File may have drifted; upload the live file.')
        ok = False
if not ok: sys.exit(1)

# ── replacements ─────────────────────────────────────────────────────
N_SUB = '''<p class="sub">These are real widgets from the app — not mockups, not renders. Pick your subject, then drag it, watch it, or hit listen. Interactive, visual and audio in one artefact.</p>

    <div class="pill-row" role="tablist" aria-label="Subject">
      <span class="row-label">your subject</span>
      <button class="pill subj-pill active" data-widget="physics">Physics</button>
      <button class="pill subj-pill" data-widget="english">English</button>
      <button class="pill subj-pill" data-widget="maths">Maths</button>
      <button class="pill subj-pill" data-widget="chemistry">Chemistry</button>
      <button class="pill subj-pill" data-widget="biology">Biology</button>
      <span class="more">13 subjects in the app</span>
    </div>'''

N_CHROME = '<span id="widgetChromeLabel">physics · unit 3 · gravity &amp; fields</span>'

N_IFRAME = '<iframe id="widgetFrame" src="widgets/gpe-physics-blue.html" title="Interactive gravitational potential energy widget" loading="lazy" scrolling="no"></iframe>'

N_DESC = '''const KW_WIDGETS={
      physics:{ label:"physics · unit 3 · gravity & fields",
        src:"widgets/gpe-physics-blue.html",
        title:"Interactive gravitational potential energy widget",
        desc:"This widget shows a one kilogram mass being lifted away from Earth. Drag the slider to change its distance and watch gravitational potential energy climb toward zero — because GPE is negative everywhere, and only reaches zero infinitely far away. The takeaway: the familiar m g h formula is just the surface approximation of a much deeper curve." },
      english:{ label:"english · analysing argument",
        src:"widgets/appeals-and-their-effect.html",
        title:"Interactive rhetorical appeals widget",
        desc:"This widget shows a real persuasive passage. Tap an appeal — fear, fairness, authority or self-interest — and every instance lights up while the rest fades back. Hit highlight all and you will see it is not one argument, but four running in parallel. The takeaway: the best arguments do not feel like arguments — until you can see them." },
      maths:{ label:"maths methods · differentiation & applications",
        src:"widgets/differentiation-rules-and-techniques.html",
        title:"Interactive differentiation rules widget",
        desc:"This widget builds derivatives step by step. Choose the chain, product or quotient rule, then drag the slider to watch each rule assemble the derivative one move at a time. The takeaway: every complex derivative is just multiplication — each rule tells you exactly what to multiply." },
      chemistry:{ label:"chemistry · rate & equilibrium",
        src:"widgets/chemical-equilibrium-disasters-explained.html",
        title:"Interactive chemical equilibrium widget",
        desc:"This widget shows an exothermic equilibrium under stress. Drag the slider to heat the system and watch Le Chatelier's principle fight back — and what happens industrially when the feedback loop wins. The takeaway: equilibrium is not static. Stress it carelessly and it spirals." },
      biology:{ label:"biology · homeostasis",
        src:"widgets/thermoregulation-in-endotherms.html",
        title:"Interactive thermoregulation widget",
        desc:"This widget simulates your body's thermostat. Drag the slider to change the environmental temperature and watch the hypothalamus coordinate vasodilation, sweating and shivering to defend a thirty-seven degree set point. The takeaway: your body fights harder to cool down than to warm up." }
    };
    let DESC=KW_WIDGETS.physics.desc;
    root.querySelectorAll('[data-widget]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const w=KW_WIDGETS[btn.dataset.widget]; if(!w) return;
        root.querySelectorAll('[data-widget]').forEach(b=>b.classList.toggle('active',b===btn));
        if('speechSynthesis' in window){ speechSynthesis.cancel(); const lb=root.querySelector('#listenBtn'); if(lb) lb.classList.remove('speaking'); }
        DESC=w.desc;
        const cl=root.querySelector('#widgetChromeLabel'); if(cl) cl.textContent=w.label;
        const f=root.querySelector('#widgetFrame');
        if(f){ f.title=w.title; f.style.minHeight=''; f.style.height=''; f.src=w.src; }
      });
    });'''

for old, new in [(A_SUB, N_SUB), (A_CHROME, N_CHROME), (A_IFRAME, N_IFRAME), (A_DESC, N_DESC)]:
    src = src.replace(old, new, 1)

# ── post-write verification on the candidate before it touches disk ──
for marker in ['KW_WIDGETS', 'id="widgetFrame"', 'id="widgetChromeLabel"', 'data-widget="biology"', 'let DESC=KW_WIDGETS.physics.desc;']:
    if src.count(marker) < 1:
        print(f'✗ ABORT — verification marker missing after edit: {marker}'); sys.exit(1)
if src.count('demo-widget-gravity.html') != 0:
    print('✗ ABORT — old hero iframe reference survived'); sys.exit(1)

io.open(F, 'w', encoding='utf-8').write(src)
print('✓ experience-it.html patched — GPE hero + 5-subject switcher')
PYEOF
then
  echo "✗ Patch aborted — restoring backup."
  cp "$F.bak-$TS" "$F"
  exit 1
fi

# ── sanity: the injected JS must parse in isolation ──────────────────
python3 - << 'PYEOF' > /tmp/kw-switcher-check.js
import io, re
src = io.open('experience-it.html', encoding='utf-8').read()
m = re.search(r'const KW_WIDGETS=\{.*?\n    \}\);', src, re.S)
print('function _t($,root,speechSynthesis){' + (m.group(0) if m else 'MISSING') + '}')
PYEOF
if node --check /tmp/kw-switcher-check.js 2>/dev/null; then
  echo "✓ injected JS parses clean"
else
  echo "✗ injected JS failed to parse — restoring backup."
  cp "$F.bak-$TS" "$F"
  exit 1
fi

echo "✓ DONE. Reminder: drop the five widget files into widgets/ (GPE = the green one)."
