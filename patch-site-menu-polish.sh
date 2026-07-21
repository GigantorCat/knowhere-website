#!/bin/bash
# KNOWHERE — patch-site-menu-polish.sh
# Menu v3: Geist font, right-aligned items, current page highlighted,
# Log in removed from the mobile top bar (lives in the drawer).
# Run AFTER patch-site-menu-fix.sh, from the site pages folder.
cd "$(dirname "$0")"
for f in index.html pricing.html experience-it.html how-it-works.html for-parents.html; do
  if [ ! -f "$f" ]; then echo "✗ $f not found here."; exit 1; fi
done
TS=$(date +%Y%m%d-%H%M%S)
for f in index.html pricing.html experience-it.html how-it-works.html for-parents.html; do cp "$f" "$f.bak-$TS"; done
echo "Backups: *.bak-$TS"
if ! python3 << 'PYEOF'
import io, sys, re

CSS_OLD = ".kwm-panel a{display:block;padding:13px 16px;border-radius:11px;font-size:15px;font-weight:600;letter-spacing:-.01em;color:#EDECE8;text-decoration:none}"
CSS_NEW = ".kwm-panel a{display:block;padding:13px 16px;border-radius:11px;font-size:15px;font-weight:600;letter-spacing:-.01em;color:#EDECE8;text-decoration:none;font-family:'Geist',system-ui,-apple-system,Arial,sans-serif;text-align:right}\n  .kwm-panel a.here{background:rgba(123,234,90,.12);color:#7BEA5A}\n  @media (max-width:820px){nav>a[href*=\"app.knowhere.me\"]{display:none !important}}"

V3_SCRIPT = """<script>
/* kwm v3 \u2014 capture delegation + current-page highlight */
(function(){
  function build(){
    if(document.querySelector('.kwm-btn'))return;
    var nav=document.querySelector('nav');if(!nav)return;
    var btn=document.createElement('button');btn.className='kwm-btn';btn.type='button';btn.setAttribute('aria-label','Menu');btn.innerHTML='\u2630';
    var panel=document.createElement('div');panel.className='kwm-panel';
    panel.innerHTML='<a href="index.html">Home</a><a href="how-it-works.html">How it works</a><a href="experience-it.html">Experience it</a><a href="pricing.html">Pricing</a><a href="for-parents.html">For parents</a><a class="kwm-login" href="https://app.knowhere.me/login">Log in</a>';
    var here=(location.pathname.split('/').pop()||'index.html');
    panel.querySelectorAll('a').forEach(function(a){if(a.getAttribute('href')===here)a.classList.add('here');});
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
    if 'kwm v3' in c:
        print(f'\u2713 {f}: v3 already in'); continue
    if CSS_OLD not in c:
        print(f'\u2717 ABORT \u2014 {f}: menu CSS not in expected form'); sys.exit(1)
    m = re.search(r"<script>\s*/\* kwm v2.*?</script>", c, re.S)
    if not m:
        print(f'\u2717 ABORT \u2014 {f}: v2 script not found (run patch-site-menu-fix.sh first)'); sys.exit(1)
    c = c.replace(CSS_OLD, CSS_NEW, 1)
    c = c[:m.start()] + V3_SCRIPT + c[m.end():]
    io.open(f, 'w', encoding='utf-8').write(c)
    print(f'\u2713 {f}: menu polished to v3')
PYEOF
then
  echo "✗ Patch aborted — restoring backups."
  for f in index.html pricing.html experience-it.html how-it-works.html for-parents.html; do cp "$f.bak-$TS" "$f"; done
  exit 1
fi
echo "✓ DONE — hard-refresh (⌘⇧R): Geist, right-aligned, current page lit, Log in bar-free"
