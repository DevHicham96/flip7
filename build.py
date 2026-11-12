import json,os,sys,subprocess,datetime
keys={'apiKey':'FIREBASE_API_KEY','authDomain':'FIREBASE_AUTH_DOMAIN','projectId':'FIREBASE_PROJECT_ID','storageBucket':'FIREBASE_STORAGE_BUCKET','messagingSenderId':'FIREBASE_MESSAGING_SENDER_ID','appId':'FIREBASE_APP_ID'}
cfg={k:os.environ.get(v,'') for k,v in keys.items()}
missing=[v for k,v in keys.items() if not cfg[k]]
if missing:sys.exit('Variables manquantes dans Netlify : '+', '.join(missing))
def _ver():
    sha=(os.environ.get('WORKERS_CI_COMMIT_SHA') or os.environ.get('CF_PAGES_COMMIT_SHA') or os.environ.get('COMMIT_REF') or '').strip()
    if not sha:
        try:sha=subprocess.check_output(['git','rev-parse','HEAD'],stderr=subprocess.DEVNULL).decode().strip()
        except Exception:sha=''
    try:
        from zoneinfo import ZoneInfo
        now=datetime.datetime.now(ZoneInfo('Europe/Paris'))
    except Exception:now=datetime.datetime.utcnow()
    n=''
    try:n=subprocess.check_output(['git','rev-list','--count','HEAD'],stderr=subprocess.DEVNULL).decode().strip()
    except Exception:pass
    v='v'+now.strftime('%Y.%m.%d-%H:%M')
    if n.isdigit() and int(n)>50:v+=' · build '+n
    if sha:v+=' · '+sha[:7]
    return v
VER=_ver();print('version',VER)
os.makedirs('dist',exist_ok=True)
import shutil
if os.path.isdir('sounds'):shutil.copytree('sounds','dist/sounds',dirs_exist_ok=True)
if os.path.isdir('avatars'):shutil.copytree('avatars','dist/avatars',dirs_exist_ok=True)
for src,dst in (('index.template.html','index.html'),('ronda.template.html','ronda.html'),('rami.template.html','rami.html'),('mytho.template.html','mytho.html'),('quiz.template.html','quiz.html'),('loupgarou.template.html','loupgarou.html'),('skyjo.template.html','skyjo.html')):
    s=open(src,encoding='utf-8').read()
    i=s.index('<script>')
    out=s[:i]+'<script>window.F7_FIREBASE='+json.dumps(cfg)+';</script>\n'+s[i:]
    mu='<script>window.AT_VER='+json.dumps(VER)+';window.AT_GIPHY='+json.dumps((os.environ.get('GIPHY_API_KEY','').strip() or 'wWmvPT7HddP7DYscLIpxQGsaaYHxsqic'))+';</script>'+open('loader.js',encoding='utf-8').read()+open('music.js',encoding='utf-8').read()+open('gif.js',encoding='utf-8').read()
    out=out.replace('</body>',mu+'</body>',1) if '</body>' in out else out+mu
    open('dist/'+dst,'w',encoding='utf-8').write(out);print('ok',dst,len(out))
