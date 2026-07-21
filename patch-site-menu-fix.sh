#!/bin/bash
# KNOWHERE — patch-site-menu-fix.sh
# Hamburger v2: click handling moves to capture-phase delegation with direct
# style toggling — immune to the pages' own scripts swallowing events.
# Run AFTER patch-site-mobile-menu.sh, from the site pages folder.
cd "$(dirname "$0")"
for f in index.html pricing.html experience-it.html how-it-works.html for-parents.html; do
  if [ ! -f "$f" ]; then echo "✗ $f not found here."; exit 1; fi
done
TS=$(date +%Y%m%d-%H%M%S)
for f in index.html pricing.html experience-it.html how-it-works.html for-parents.html; do cp "$f" "$f.bak-$TS"; done
echo "Backups: *.bak-$TS"
if ! python3 << 'PYEOF'
import io, sys, re

NEW_SCRIPT = """<script>
/* kwm v2 \u2014 capture-phase delegation, style-based toggle */
(function(){
  function build(){
    if(document.querySelector('.kwm-btn'))return;
    var nav=document.querySelector('nav');if(!nav)return;
    var btn=document.createElement('button');btn.className='kwm-btn';btn.type='button';btn.setAttribute('aria-label','Menu');btn.innerHTML='\u2630';
    var panel=document.createElement('div');panel.className='kwm-panel';
    panel.innerHTML='<a href="index.html">Home</a><a href="how-it-works.html">How it works</a><a href="experience-it.html">Experience it</a><a href="pricing.html">Pricing</a><a href="for-parents.html">For parents</a><a class="kwm-login" href="https://app.knowhere.me/login">Log in</a>';
    nav.appendChild(btn);document.body.appendChild(panel);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
  document.addEventListener('click',function(ev){
    var panel=document.querySelector('.kwm-panel');if(!panel)return;
    var onBtn=ev.target.closest&&ev.target.closest('.kwm-btn');
    var inPanel=ev.target.closest&&ev.target.closest('.kwm-panel');
    if(onBtn){ev.preventDefault();ev.stopPropagation();panel.style.display=(panel.style.display==='block')?'none':'block';return;}
    if(!inPanel)panel.style.display='none';
  },true);
})();
</script>"""

pages = ['index.html','pricing.html','experience-it.html','how-it-works.html','for-parents.html']
for f in pages:
    c = io.open(f, encoding='utf-8').read()
    if 'kwm v2' in c:
        print(f'\u2713 {f}: v2 already in'); continue
    if 'kw-mobile-menu' not in c:
        print(f'\u2717 ABORT \u2014 {f}: run patch-site-mobile-menu.sh first'); sys.exit(1)
    # Replace the old injected <script>…</script> (the one containing kwm-btn creation)
    m = re.search(r"<script>\s*\(function\(\)\{\s*var nav=document\.querySelector\('nav'\).*?</script>", c, re.S)
    if not m:
        print(f'\u2717 ABORT \u2014 {f}: old menu script not found in expected form'); sys.exit(1)
    c = c[:m.start()] + NEW_SCRIPT + c[m.end():]
    io.open(f, 'w', encoding='utf-8').write(c)
    print(f'\u2713 {f}: menu script upgraded to v2')
PYEOF
then
  echo "✗ Patch aborted — restoring backups."
  for f in index.html pricing.html experience-it.html how-it-works.html for-parents.html; do cp "$f.bak-$TS" "$f"; done
  exit 1
fi
echo "✓ DONE — hard-refresh (⌘⇧R) and tap the ☰"
