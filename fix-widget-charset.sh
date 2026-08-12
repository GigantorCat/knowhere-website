#!/bin/bash
# KNOWHERE — fix-widget-charset.sh
# Fixes mojibake (em-dashes showing as garbage) in /widgets files:
#   1. missing <meta charset="UTF-8"> → inserted after <head>
#   2. double-encoded bytes (file literally contains mojibake) → repaired
# Backs up before every write. Idempotent. Run from the site root:
#   bash fix-widget-charset.sh
cd "$(dirname "$0")"
[ -d widgets ] || { echo "no widgets/ folder here"; exit 1; }
export TS=$(date +%Y%m%d-%H%M%S)
python3 << 'PYEOF'
import glob, io, os, re

# mojibake markers built with chr() so no escaping layer can mangle them:
# a-circumflex followed by C1 controls / euro / dashes / curly quotes, etc.
CLS = ''.join(chr(c) for c in range(0x80, 0xA0)) + chr(0x20AC) + chr(0x2013) + chr(0x2014) + chr(0x201C) + chr(0x201D) + chr(0x2122)
MOJI = re.compile(chr(0xE2) + '[' + re.escape(CLS) + ']|' + chr(0xC3) + '[' + chr(0xA9) + chr(0xA8) + chr(0xA4) + ']')

def repair(txt):
    for enc in ('cp1252', 'latin-1'):
        try:
            fixed = txt.encode(enc, errors='strict').decode('utf-8', errors='strict')
            if not MOJI.search(fixed):
                return fixed, enc
        except (UnicodeEncodeError, UnicodeDecodeError):
            continue
    return None, None

ts = os.environ['TS']
for path in sorted(glob.glob('widgets/*.html')):
    raw = open(path, 'rb').read()
    txt = raw.decode('utf-8', errors='replace')
    changed = []

    if MOJI.search(txt):
        fixed, enc = repair(txt)
        if fixed:
            txt = fixed; changed.append('bytes repaired (via ' + enc + ')')
        else:
            changed.append('MOJIBAKE PRESENT but auto-repair unsafe -- send me this file')

    if not re.search(r'<meta[^>]*charset', txt, re.I):
        if '<head>' in txt:
            txt = txt.replace('<head>', '<head>' + chr(10) + '<meta charset="UTF-8">', 1)
            changed.append('charset meta added')
        else:
            changed.append('NO <head> TAG -- add charset manually')

    if changed and not any('manually' in c or 'unsafe' in c for c in changed):
        open(path + '.bak-' + ts, 'wb').write(raw)
        io.open(path, 'w', encoding='utf-8').write(txt)
        print('FIXED ' + path + ': ' + ', '.join(changed))
    elif changed:
        print('WARN  ' + path + ': ' + ', '.join(changed))
    else:
        print('clean ' + path)
PYEOF
echo "Done. Hard-refresh the page (Cmd+Shift+R) and check the em-dashes."
