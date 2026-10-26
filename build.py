import json,os,sys
keys={'apiKey':'FIREBASE_API_KEY','authDomain':'FIREBASE_AUTH_DOMAIN','projectId':'FIREBASE_PROJECT_ID','storageBucket':'FIREBASE_STORAGE_BUCKET','messagingSenderId':'FIREBASE_MESSAGING_SENDER_ID','appId':'FIREBASE_APP_ID'}
cfg={k:os.environ.get(v,'') for k,v in keys.items()}
missing=[v for k,v in keys.items() if not cfg[k]]
if missing:sys.exit('Variables manquantes dans Netlify : '+', '.join(missing))
src=open('index.template.html',encoding='utf-8').read()
i=src.index('<script>')
out=src[:i]+'<script>window.F7_FIREBASE='+json.dumps(cfg)+';</script>\n'+src[i:]
os.makedirs('dist',exist_ok=True)
open('dist/index.html','w',encoding='utf-8').write(out)
print('ok',len(out))
