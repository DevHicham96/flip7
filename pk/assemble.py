import json
P='/home/claude/flip7/'
pool=open(P+'pool.template.html',encoding='utf-8').read().split('\n')
av='\n'.join(pool[126:205])
lv=open(P+'parklevels.json',encoding='utf-8').read()
parts=[open(P+'pk/'+f,encoding='utf-8').read() for f in ('p1.html','p2.js','p3.js','p4.js','p5.js')]
s='\n'.join(parts).replace('/*LEVELS_JSON*/null',lv).replace('/*AVATAR_BLOCK*/',av)
open(P+'parking.template.html','w',encoding='utf-8').write(s)
print(len(s))
