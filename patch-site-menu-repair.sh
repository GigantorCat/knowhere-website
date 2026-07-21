#!/bin/bash
# KNOWHERE — patch-site-menu-repair.sh
# Repairs the mangled mobile menu (v3 splice bug) by removing the whole
# injected region and reinserting a clean v4 block. Safe from any state.
# Run from the site pages folder.
cd "$(dirname "$0")"
for f in index.html pricing.html experience-it.html how-it-works.html for-parents.html; do
  if [ ! -f "$f" ]; then echo "✗ $f not found here."; exit 1; fi
done
TS=$(date +%Y%m%d-%H%M%S)
for f in index.html pricing.html experience-it.html how-it-works.html for-parents.html; do cp "$f" "$f.bak-$TS"; done
echo "Backups: *.bak-$TS"
if ! python3 << 'PYEOF'
import io, sys

BLOCK = """<!-- kw-mobile-menu v4 (shows \u2264820px only) -->
<style>
  .kwm-btn{display:none;margin-left:6px;width:40px;height:40px;border-radius:11px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#EDECE8;font-size:17px;line-height:1;cursor:pointer;align-items:center;justify-content:center;flex-shrink:0}
  .kwm-panel{display:none;position:fixed;top:64px;left:12px;right:12px;z-index:999;background:rgba(12,13,12,.97);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:8px;box-shadow:0 24px 60px rgba(0,0,0,.6);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
  .kwm-panel a{display:block;padding:13px 16px;border-radius:11px;font-size:15px;font-weight:600;letter-spacing:-.01em;color:#EDECE8;text-decoration:none;font-family:'Geist',system-ui,-apple-system,Arial,sans-serif;text-align:right}
  .kwm-panel a:active,.kwm-panel a:hover{background:rgba(123,234,90,.1);color:#7BEA5A}
  .kwm-panel a.here{background:rgba(123,234,90,.12);color:#7BEA5A}
  .kwm-panel a.kwm-login{border-top:1px solid rgba(255,255,255,.08);border-radius:0 0 11px 11px;margin-top:4px;color:#8C8B87}
  @media (max-width:820px){.kwm-btn{display:flex}nav>a[href*="app.knowhere.me"]{display:none !important}}
</style>
<script>
/* kwm v4 */
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
</script>
"""

pages = ['index.html','pricing.html','experience-it.html','how-it-works.html','for-parents.html']
for f in pages:
    c = io.open(f, encoding='utf-8').read()
    start = c.find('<!-- kw-mobile-menu')
    endbody = c.rfind('</body>')
    if endbody < 0:
        print(f'\u2717 ABORT \u2014 {f}: no </body>'); sys.exit(1)
    if start >= 0:
        c = c[:start] + BLOCK + c[endbody:] if start < endbody else c
        # (everything between our marker comment and </body> is ours \u2014 replace wholesale)
    else:
        c = c[:endbody] + BLOCK + c[endbody:]
    io.open(f, 'w', encoding='utf-8').write(c)
    print(f'\u2713 {f}: menu region rebuilt clean (v4)')
PYEOF
then
  echo "✗ Patch aborted — restoring backups."
  for f in index.html pricing.html experience-it.html how-it-works.html for-parents.html; do cp "$f.bak-$TS" "$f"; done
  exit 1
fi
echo "✓ DONE — hard-refresh (⌘⇧R). ☰ builds, opens, highlights."
