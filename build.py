import json,os,sys
keys={'apiKey':'FIREBASE_API_KEY','authDomain':'FIREBASE_AUTH_DOMAIN','projectId':'FIREBASE_PROJECT_ID','storageBucket':'FIREBASE_STORAGE_BUCKET','messagingSenderId':'FIREBASE_MESSAGING_SENDER_ID','appId':'FIREBASE_APP_ID'}
cfg={k:os.environ.get(v,'') for k,v in keys.items()}
missing=[v for k,v in keys.items() if not cfg[k]]
if missing:sys.exit('Variables manquantes dans Netlify : '+', '.join(missing))
os.makedirs('dist',exist_ok=True)
for src,dst in (('index.template.html','index.html'),('ronda.template.html','ronda.html'),('rami.template.html','rami.html'),('mytho.template.html','mytho.html'),('quiz.template.html','quiz.html')):
    s=open(src,encoding='utf-8').read()
    i=s.index('<script>')
    out=s[:i]+'<script>window.F7_FIREBASE='+json.dumps(cfg)+';</script>\n'+s[i:]
    open('dist/'+dst,'w',encoding='utf-8').write(out);print('ok',dst,len(out))
