<style>
.ldx-root{position:absolute;inset:0;z-index:5;display:grid;place-items:center;overflow:hidden;color:#fff;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;--a:#35DCF5;--a2:#2B86EE;--bg:linear-gradient(#04061a,#0a0e33 60%,#17104a)}
.ldx-bg{position:absolute;inset:0;background:var(--bg)}
.ldx-stars{position:absolute;inset:0;opacity:.9;background-image:radial-gradient(1.5px 1.5px at 12% 22%,#fff,transparent),radial-gradient(1px 1px at 30% 62%,#fff,transparent),radial-gradient(1.5px 1.5px at 47% 14%,#cfe0ff,transparent),radial-gradient(1px 1px at 66% 42%,#fff,transparent),radial-gradient(2px 2px at 83% 18%,#fff,transparent),radial-gradient(1px 1px at 91% 70%,#ffe9c8,transparent),radial-gradient(1.5px 1.5px at 22% 86%,#fff,transparent),radial-gradient(1px 1px at 74% 90%,#fff,transparent),radial-gradient(1px 1px at 55% 75%,#fff,transparent),radial-gradient(1.5px 1.5px at 5% 50%,#fff,transparent);animation:ldxtw 2.4s ease-in-out infinite alternate}
@keyframes ldxtw{from{opacity:.45}to{opacity:1}}
.ldx-glow{position:absolute;left:50%;top:46%;width:min(120vmin,900px);aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--a) 28%,transparent),transparent 62%);animation:ldxpulse 3s ease-in-out infinite alternate}
@keyframes ldxpulse{to{transform:translate(-50%,-50%) scale(1.12);opacity:.75}}
.ldx-planet{position:absolute;left:50%;bottom:-62vh;width:150vw;height:86vh;margin-left:-75vw;border-radius:50%;background:radial-gradient(circle at 50% 6%,var(--p1,#7c6cff) 0,var(--p2,#3a2a9a) 28%,var(--p3,#14104a) 60%,#070820 80%);box-shadow:0 -4px 40px color-mix(in srgb,var(--a) 55%,transparent),0 -30px 120px color-mix(in srgb,var(--a) 30%,transparent)}
.ldx-main{position:relative;z-index:2;display:grid;justify-items:center;gap:14px;width:min(440px,88vw);text-align:center}
.ldx-emb{position:relative;width:min(180px,40vw);aspect-ratio:1;display:grid;place-items:center;font-size:clamp(70px,18vw,104px);line-height:1;filter:drop-shadow(0 0 26px color-mix(in srgb,var(--a) 70%,transparent));animation:ldxfloat 3s ease-in-out infinite alternate}
.ldx-emb svg{width:100%;height:100%;display:block}
.ldx-emb .fl{transform-origin:100px 190px;animation:ldxfl .16s ease-in-out infinite alternate}
@keyframes ldxfl{to{transform:scaleY(1.4);opacity:.75}}
@keyframes ldxfloat{from{transform:translateY(6px) rotate(-2deg)}to{transform:translateY(-8px) rotate(2deg)}}
.ldx-ring{position:absolute;inset:-14%;border-radius:50%;border:2px dashed color-mix(in srgb,var(--a) 60%,transparent);animation:ldxspin 14s linear infinite}
.ldx-ring.r2{inset:-28%;border-style:dotted;animation-duration:22s;animation-direction:reverse;opacity:.6}
@keyframes ldxspin{to{transform:rotate(360deg)}}
.ldx-title{font:800 clamp(20px,5vw,28px) 'Unbounded',system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;text-shadow:0 0 18px color-mix(in srgb,var(--a) 70%,transparent),0 3px 0 rgba(0,0,0,.4)}
.ldx-sub{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:color-mix(in srgb,var(--a) 75%,#fff);margin-top:-8px}
.ldx-bar{position:relative;width:100%;height:16px;border-radius:99px;background:rgba(0,0,0,.45);border:1px solid color-mix(in srgb,var(--a) 70%,transparent);box-shadow:0 0 18px color-mix(in srgb,var(--a) 30%,transparent),inset 0 2px 5px rgba(0,0,0,.6);overflow:hidden}
.ldx-bar i{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:99px;background:linear-gradient(90deg,var(--a2),var(--a));box-shadow:0 0 14px var(--a);transition:width .18s linear}
.ldx-bar i::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(0,0,0,.22) 0 2px,transparent 2px 10px)}
.ldx-bar i::before{content:'';position:absolute;top:0;bottom:0;width:60px;right:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55));animation:ldxsh 1.1s linear infinite}
@keyframes ldxsh{from{transform:translateX(-40px);opacity:0}30%{opacity:1}to{transform:translateX(20px);opacity:0}}
.ldx-row{display:flex;justify-content:space-between;width:100%;font-size:12px;letter-spacing:.08em;color:color-mix(in srgb,var(--a) 55%,#fff)}
.ldx-pct{font-weight:800;color:#fff;font-size:14px;min-width:3.4em;text-align:right}
.ldx-log{width:100%;text-align:left;font-size:11.5px;line-height:1.55;color:rgba(255,255,255,.72);min-height:5.6em;display:grid;align-content:end;gap:1px;mask-image:linear-gradient(transparent,#000 40%);-webkit-mask-image:linear-gradient(transparent,#000 40%)}
.ldx-log div b{color:#4ADE80;font-weight:700;margin-right:8px}.ldx-log div.cur b{color:#FFC857}.ldx-log div.cur::after{content:'▍';margin-left:3px;animation:ldxbl .7s steps(1) infinite}
@keyframes ldxbl{50%{opacity:0}}
.ldx-foot{position:absolute;left:0;right:0;bottom:max(10px,env(safe-area-inset-bottom));text-align:center;z-index:3;font:600 10.5px ui-monospace,Menlo,Consolas,monospace;letter-spacing:.06em;color:rgba(255,255,255,.6)}
.ldx-root.done .ldx-pct{color:#4ADE80}
.ldx-emb:has(.ldx-cards){margin-bottom:16px}
/* thèmes par jeu */
.ldx-root.k-lg{--a:#ff9a3d;--a2:#e8590c;--bg:linear-gradient(170deg,#060a22,#1b1560 70%,#2a1466);--p1:#3b2f95;--p2:#1b1560;--p3:#0a0725}
.ldx-root.k-lg .ldx-planet{opacity:.5}
.ldx-moon{position:absolute;right:12%;top:10%;width:min(26vmin,190px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 35% 32%,#fffbe3,#f0dd8c 60%,#c9a93e);box-shadow:0 0 80px rgba(255,240,170,.45);animation:ldxfloat 5s ease-in-out infinite alternate}
.ldx-wolf{position:absolute;left:7%;bottom:6%;font-size:min(22vmin,160px);filter:brightness(0) drop-shadow(0 0 10px rgba(0,0,0,.5));opacity:.85}
.ldx-root.k-sk{--a:#4ee0c8;--a2:#1b9a8a;--bg:linear-gradient(160deg,#053a4e,#0c6a78 55%,#2aa69a);--p1:#38a3e8;--p2:#13396e;--p3:#082240}
.ldx-root.k-qz{--a:#ffd23f;--a2:#f5a800;--bg:radial-gradient(circle at 20% 15%,rgba(108,61,240,.8),transparent 45%),linear-gradient(160deg,#1a1464,#4a1fb8 70%,#6d2fd6);--p1:#6c3df0;--p2:#3a1d9c;--p3:#1a1464}
.ldx-root.k-my{--a:#c28bff;--a2:#7c3aed;--bg:linear-gradient(165deg,#1a0f3a,#3b1d78 70%,#5a2a9a);--p1:#7c3aed;--p2:#3b1d78;--p3:#150a30}
.ldx-root.k-rm{--a:#7CE7B0;--a2:#2f8240;--bg:radial-gradient(ellipse at 50% 40%,#2f8240,#103a1e 80%);--p1:#2f8240;--p2:#14532d;--p3:#06210f}
.ldx-root.k-rd{--a:#ffb347;--a2:#d4571a;--bg:linear-gradient(170deg,#3a1a0c,#7a3a14 60%,#c26a22);--p1:#d4571a;--p2:#7a3a14;--p3:#2a1206}
.ldx-root:not(.k-f7) .ldx-planet{opacity:.55}
.ldx-cards{display:flex;gap:0;justify-content:center;align-items:flex-end;height:100%;width:100%}
.ldx-cards i{width:34%;max-width:62px;aspect-ratio:3/4.3;margin:0 -7%;border-radius:9px;border:3px solid #fff;display:grid;place-items:center;font:800 26px 'Unbounded',system-ui,sans-serif;font-style:normal;color:#fff;box-shadow:0 8px 14px rgba(0,0,0,.4);transform:rotate(var(--r)) translateY(var(--y,0));animation:ldxdeal 1.6s ease-in-out infinite alternate;animation-delay:var(--dl,0s)}
@keyframes ldxdeal{to{transform:rotate(calc(var(--r)*.6)) translateY(calc(var(--y,0px) - 8px))}}
@media (prefers-reduced-motion:reduce){.ldx-stars,.ldx-glow,.ldx-emb,.ldx-emb .fl,.ldx-ring,.ldx-bar i::before,.ldx-cards i,.ldx-moon{animation:none}}
#atver{position:fixed;left:0;right:0;bottom:2px;text-align:center;z-index:200;pointer-events:none;font:600 10px ui-monospace,Menlo,Consolas,monospace;letter-spacing:.05em;color:rgba(255,255,255,.62);text-shadow:0 1px 3px rgba(0,0,0,.85)}
</style>
<div id="atver"></div>
<script>
(function(){
var VER=window.AT_VER||'dev';
var FOOT=VER+' · © Hicham Kassouani';
var av=document.getElementById('atver');if(av)av.textContent=FOOT;
var SHIP='<svg viewBox="0 0 200 260"><defs><linearGradient id="ldb" x1="0" x2="1"><stop offset="0" stop-color="#8fa4d8"/><stop offset=".5" stop-color="#f1f5ff"/><stop offset="1" stop-color="#8fa4d8"/></linearGradient><radialGradient id="ldw" cx=".4" cy=".35"><stop offset="0" stop-color="#bff4ff"/><stop offset="1" stop-color="#1a78c8"/></radialGradient></defs><g class="fl"><path d="M80 190 Q100 262 120 190Z" fill="#ff9d2e"/><path d="M88 190 Q100 238 112 190Z" fill="#fff3a0"/></g><path d="M62 150 L28 196 L28 214 L74 184Z" fill="#e8590c"/><path d="M138 150 L172 196 L172 214 L126 184Z" fill="#e8590c"/><path d="M100 14 C140 50 142 120 134 190 L66 190 C58 120 60 50 100 14Z" fill="url(#ldb)" stroke="#5a6aa8" stroke-width="3"/><circle cx="100" cy="92" r="21" fill="url(#ldw)" stroke="#5a6aa8" stroke-width="4"/><ellipse cx="93" cy="85" rx="6" ry="4" fill="#fff" opacity=".7"/><rect x="66" y="150" width="68" height="12" fill="#e8590c" opacity=".9"/><text x="100" y="182" text-anchor="middle" font-family="Unbounded,sans-serif" font-weight="800" font-size="18" fill="#1a2a6a">7</text></svg>';
function cards(list,cols){return '<div class="ldx-cards">'+list.map(function(t,i){var r=(i-(list.length-1)/2)*11;var y=Math.abs(i-(list.length-1)/2)*7;return '<i style="--r:'+r+'deg;--y:'+y+'px;--dl:'+(i*.12)+'s;background:'+cols[i%cols.length]+'">'+t+'</i>';}).join('')+'</div>';}
var K={
 f7:{n:'Flip 7 Atelier',s:'Mission · Station de jeux',emb:SHIP,ring:1,stars:1,steps:['Initialisation des systèmes','Calibrage des propulseurs','Liaison avec la station','Synchronisation des équipages','Chargement du manifeste','Prêt au décollage']},
 lg:{n:'Loup-Garou',s:'Le village s\'endort',emb:'🌙',moon:1,stars:1,steps:['Le soleil se couche','Les volets se ferment','Les loups rôdent dans la forêt','Distribution des rôles secrets','Le village retient son souffle']},
 sk:{n:'Skyjo',s:'Le moins de points gagne',emb:cards(['-2','0','5','8','12'],['#4b57d6','#38a3e8','#38c172','#f2b632','#e5484d']),steps:['Mélange du paquet de 150 cartes','Distribution des 12 cartes','Retournement des premières cartes','Prêt à jouer']},
 qz:{n:'Quiz',s:'Questions pour tous',emb:cards(['❓','💡','🏆','⚡','❓'],['#e5484d','#2c63d6','#f2b632','#7c3aed','#e5484d']),steps:['Chargement de la banque de questions','Mélange des catégories','Réglage du chronomètre','Branchement des buzzers','Prêt à buzzer']},
 my:{n:'Mytho',s:'Le jeu du bluff',emb:cards(['🤥','♠','🫵','♥','🤥'],['#7c3aed','#1b1b1b','#c0262d','#1b1b1b','#7c3aed']),steps:['Préparation du bluff','Mélange des cartes','Entraînement au poker face','Prêt à mentir']},
 rm:{n:'Rami',s:'Le rami traditionnel',emb:cards(['♠','♥','🃏','♦','♣'],['#1b1b1b','#c8232c','#6b3fb0','#c8232c','#1b1b1b']),steps:['Mélange des deux jeux','Distribution des 14 cartes','Préparation de la pioche','Prêt à poser']},
 rd:{n:'Ronda',s:'Jeu de cartes marocaines',emb:'🍵',steps:['Préparation du thé à la menthe','Mélange du jeu espagnol','Distribution des cartes','Prêt pour la ronda']}
};
var KINDS=['lg','sk','qz','f7','my','rm','rd'];
function kindOf(el){for(var i=0;i<KINDS.length;i++)if(el.classList.contains(KINDS[i]))return KINDS[i];return 'f7';}
function build(el){
  var k=kindOf(el),c=K[k];
  var root=document.createElement('div');root.className='ldx-root k-'+k;
  var emb=c.emb.indexOf('<')===0?c.emb:'<span>'+c.emb+'</span>';
  root.innerHTML='<div class="ldx-bg"></div>'+(c.stars!==undefined||k==='f7'?'<div class="ldx-stars"></div>':'<div class="ldx-stars" style="opacity:.35"></div>')+'<div class="ldx-glow"></div><div class="ldx-planet"></div>'
   +(c.moon?'<div class="ldx-moon"></div><div class="ldx-wolf">🐺</div>':'')
   +'<div class="ldx-main"><div class="ldx-emb">'+(c.ring?'<i class="ldx-ring"></i><i class="ldx-ring r2"></i>':'')+emb+'</div>'
   +'<div class="ldx-title">'+c.n+'</div><div class="ldx-sub">'+c.s+'</div>'
   +'<div class="ldx-bar"><i></i></div><div class="ldx-row"><span class="ldx-st">Démarrage…</span><span class="ldx-pct">0%</span></div>'
   +'<div class="ldx-log"></div></div><div class="ldx-foot">'+FOOT+'</div>';
  return root;
}
function start(root,k){
  var c=K[k],bar=root.querySelector('.ldx-bar i'),pct=root.querySelector('.ldx-pct'),st=root.querySelector('.ldx-st'),log=root.querySelector('.ldx-log');
  var t0=Date.now(),shown=-1,p=0;
  function step(){
    if(!root.isConnected){clearInterval(iv);return;}
    var t=Date.now()-t0;
    if(root.dataset.done){p=100;}else{p=Math.min(94,100*(1-Math.exp(-t/900))*0.97);}
    var n=c.steps.length,idx=Math.min(n-1,Math.floor(p/100*n));
    bar.style.width=p+'%';pct.textContent=Math.round(p)+'%';
    if(root.dataset.done){idx=n-1;}
    while(shown<idx){shown++;var d=document.createElement('div');var isCur=shown===idx&&!root.dataset.done;d.innerHTML='<b>'+(isCur?'[ .. ]':'[ OK ]')+'</b>'+c.steps[shown];if(isCur)d.className='cur';log.append(d);while(log.children.length>4)log.firstChild.remove();}
    log.querySelectorAll('.cur').forEach(function(e){if(e!==log.lastChild||root.dataset.done){e.classList.remove('cur');e.firstChild.textContent='[ OK ]';}});
    st.textContent=root.dataset.done?'Terminé':c.steps[Math.max(0,idx)].replace(/\.\.\.$/,'')+'…';
    if(root.dataset.done)root.classList.add('done');
  }
  var iv=setInterval(step,70);step();
}
function scan(){
  var els=document.querySelectorAll('.gload');
  for(var i=0;i<els.length;i++){
    var el=els[i],root=null;for(var j=0;j<el.children.length;j++)if(el.children[j].classList&&el.children[j].classList.contains('ldx-root'))root=el.children[j];
    if(!root){el.textContent='';root=build(el);el.appendChild(root);start(root,kindOf(el));}
    if(el.classList.contains('out')&&!root.dataset.done)root.dataset.done='1';
  }
}
scan();
new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
})();
</script>
