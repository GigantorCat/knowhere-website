#!/bin/bash
# KNOWHERE — patch-site-mobile-menu.sh
# Adds a hamburger menu (≤820px) to ALL five site pages — the nav links were
# hidden on mobile with nothing in their place, site-wide. Desktop untouched.
# Run AFTER patch-site-mobile.sh, from the site pages folder.
cd "$(dirname "$0")"
for f in index.html pricing.html experience-it.html how-it-works.html for-parents.html; do
  if [ ! -f "$f" ]; then echo "✗ $f not found here — run next to the site pages."; exit 1; fi
done
TS=$(date +%Y%m%d-%H%M%S)
for f in index.html pricing.html experience-it.html how-it-works.html for-parents.html; do cp "$f" "$f.bak-$TS"; done
echo "Backups: *.bak-$TS"
if ! python3 << 'PYEOF'
import io, sys

BLOCK = """
<!-- kw-mobile-menu (added; shows \u2264820px only) -->
<style>
  .kwm-btn{display:none;margin-left:6px;width:40px;height:40px;border-radius:11px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#EDECE8;font-size:17px;line-height:1;cursor:pointer;align-items:center;justify-content:center;flex-shrink:0}
  .kwm-panel{display:none;position:fixed;top:64px;left:12px;right:12px;z-index:999;background:rgba(12,13,12,.97);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:8px;box-shadow:0 24px 60px rgba(0,0,0,.6);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
  .kwm-panel.open{display:block}
  .kwm-panel a{display:block;padding:13px 16px;border-radius:11px;font-size:15px;font-weight:600;letter-spacing:-.01em;color:#EDECE8;text-decoration:none}
  .kwm-panel a:active,.kwm-panel a:hover{background:rgba(123,234,90,.1);color:#7BEA5A}
  .kwm-panel a.kwm-login{border-top:1px solid rgba(255,255,255,.08);border-radius:0 0 11px 11px;margin-top:4px;color:#8C8B87}
  @media (max-width:820px){.kwm-btn{display:flex}}
</style>
<script>
(function(){
  var nav=document.querySelector('nav');if(!nav)return;
  var btn=document.createElement('button');btn.className='kwm-btn';btn.setAttribute('aria-label','Menu');btn.innerHTML='\u2630';
  var panel=document.createElement('div');panel.className='kwm-panel';
  panel.innerHTML='<a href="index.html">Home</a><a href="how-it-works.html">How it works</a><a href="experience-it.html">Experience it</a><a href="pricing.html">Pricing</a><a href="for-parents.html">For parents</a><a class="kwm-login" href="https://app.knowhere.me/login">Log in</a>';
  btn.onclick=function(e){e.stopPropagation();panel.classList.toggle('open');};
  document.addEventListener('click',function(){panel.classList.remove('open');});
  nav.appendChild(btn);document.body.appendChild(panel);
})();
</script>
"""

pages = ['index.html','pricing.html','experience-it.html','how-it-works.html','for-parents.html']
for f in pages:
    c = io.open(f, encoding='utf-8').read()
    if 'kw-mobile-menu' in c:
        print(f'\u2713 {f}: menu already present'); continue
    if '</body>' not in c:
        print(f'\u2717 ABORT \u2014 {f}: no </body>'); sys.exit(1)
    c = c.replace('</body>', BLOCK + '</body>', 1)
    io.open(f, 'w', encoding='utf-8').write(c)
    print(f'\u2713 {f}: hamburger menu added')
PYEOF
then
  echo "✗ Patch aborted — restoring backups."
  for f in index.html pricing.html experience-it.html how-it-works.html for-parents.html; do cp "$f.bak-$TS" "$f"; done
  exit 1
fi
echo "✓ DONE — narrow below 820px: ☰ appears, taps open the menu"
