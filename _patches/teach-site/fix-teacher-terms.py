import sys
for p in sys.argv[1:]:
    s=open(p,encoding='utf-8').read()
    old1='<li>If you don\'t opt in, your account closes at the end of the founding term. Links you\'ve shared stop working at the same time. Nothing is charged, and nobody chases you. <em>[Cat to confirm: close, or keep read-only?]</em></li>'
    new1='<li>If you don\'t opt in, your account closes at the end of the founding term. Links you\'ve shared stop working at the same time. Nothing is charged, and nobody chases you.</li>'
    old2='<li><strong>Where it lives.</strong> Your content is stored on our servers alongside your account. <em>[Cat to confirm hosting region before this goes live.]</em></li>'
    new2='<li><strong>Where it lives.</strong> Your content is stored with your account on our servers; where those are, and who else handles data for us, is set out in the <a href="/privacy">Privacy Policy</a>.</li>'
    assert s.count(old1)==1 and s.count(old2)==1, p
    s=s.replace(old1,new1).replace(old2,new2)
    s=s.replace("print('\\nbackups in ' + os.path.relpath(BAK, ROOT) + '\\ndone. Open /teacher-terms. Two [Cat to confirm] notes are in §04 and §06 — resolve before it goes live.')","print('\\nbackups in ' + os.path.relpath(BAK, ROOT) + '\\ndone. Open /teacher-terms.')")
    open(p,'w',encoding='utf-8').write(s); print('fixed',p)
