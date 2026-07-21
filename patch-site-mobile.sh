#!/bin/bash
# KNOWHERE — patch-site-mobile.sh
# Mobile pass for the public site. Only index.html needs it (the other four
# pages already have responsive rules). Additive @media only — desktop untouched.
# Run from the site pages folder.
cd "$(dirname "$0")"
if [ ! -f index.html ]; then echo "✗ index.html not found here — run next to the site pages."; exit 1; fi
TS=$(date +%Y%m%d-%H%M%S)
cp index.html "index.html.bak-$TS"
echo "Backup: index.html.bak-$TS"
if ! python3 << 'PYEOF'
import io, sys
c = io.open('index.html', encoding='utf-8').read()
if '/* \u2500\u2500 Mobile pass' in c:
    print('\u2713 Mobile block already present \u2014 nothing to do'); sys.exit(0)
anchor = '</style>'
if c.count(anchor) < 1:
    print('\u2717 ABORT \u2014 no </style> found'); sys.exit(1)
block = """
  /* \u2500\u2500 Mobile pass (additive \u2014 desktop untouched) \u2500\u2500 */
  @media (max-width:820px){
    nav .kp-navlink{display:none}
  }
  @media (max-width:740px){
    html,body{overflow-x:clip}
    nav{padding:12px 16px !important;gap:10px !important}
    nav a[href*="app.knowhere.me"]{padding:9px 13px !important;font-size:12px !important}
    nav .kp-cta{padding:9px 13px !important;font-size:12px !important}
    section[data-screen-label]{padding-left:20px !important;padding-right:20px !important}
    div[style*="padding:38px 44px"]{padding:26px 20px !important}
    div[style*="padding: 48px 56px"],div[style*="padding:48px 56px"]{padding:30px 22px !important}
    input,select,textarea{font-size:16px}
  }
"""
c = c.replace(anchor, block + anchor, 1)
io.open('index.html','w',encoding='utf-8').write(c)
print('\u2713 index.html: mobile block added')
PYEOF
then
  echo "✗ Patch aborted — restoring backup."
  cp "index.html.bak-$TS" index.html
  exit 1
fi
echo "✓ DONE — test at 380px width (Safari: Develop → Enter Responsive Design Mode)"
