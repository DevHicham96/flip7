/* ---------- boutique / progression ---------- */
let coins=+ld('prcoins','0')||0,own=new Set((()=>{try{return JSON.parse(ld('prown','[]'));}catch(e){return[];}})()),ST=(()=>{try{return Object.assign({g:0,w:0,l:0,rw:0,best:0},JSON.parse(ld('prst','{}')));}catch(e){return{g:0,w:0,l:0,rw:0,best:0};}})();
const saveAll=()=>{sv('prcoins',coins);sv('prown',JSON.stringify([...own]));sv('prst',JSON.stringify(ST));};
const owns=(id,pr)=>pr===0||ADMIN()||own.has(id);
const COLORS=[[0xd63a2f,0,'Rouge',0],[0x2f6fd6,0,'Bleu',0],[0xf2f2f2,0,'Blanc',0],[0x1c1c1f,0,'Noir',0],[0xe8b923,0,'Jaune',0],[0x3aa35b,0,'Vert',0],[0xe86a1f,0,'Orange',100],[0x7a3fd0,0,'Violet',100],[0x1fb8c9,0,'Turquoise',100],[0xff4fa0,0,'Rose',150],[0x8a8f98,2,'Gris métal',200],[0x111114,1,'Noir mat',300],[0x1b3f8a,2,'Bleu nuit',400],[0xe0e2e8,3,'Chrome',800],[0xd4a017,3,'Or',1200],[0xf0e6ff,4,'Nacré',1500]];
const RIMC=[[0xc9ccd4,'Argent',0],[0x1b1d22,'Noir',0],[0xd4a017,'Or',200],[0x2b9dff,'Bleu',150],[0xff3a2a,'Rouge',150]];
const RIMN=['Classique','Sport','Dish','Maillé','Triple'],RIMP=[0,300,500,700,1000];
const STK=[['Aucun',0],['Bandes blanches',200],['Bande orange',150],['Flammes',400],['Damier',300],['Numéro 7',250],['Étoiles',350]];
const FXN=[['Aucun',0],['Néon bleu',600],['Néon rose',600],['Néon vert',600],['Étincelles',800],['Flammes',1000]];
const TINTN=[['Clair',0],['Léger',0],['Foncé',150],['Noir',300]];
const css=c=>'#'+c.toString(16).padStart(6,'0');
const TABS=[
 ['Modèle',()=>MODELS.map((M,i)=>({id:'m'+i,n:M.n,pr:M.pr,sw:'🚗',on:spec.m===i,set:s=>{s.m=i;}}))],
 ['Couleur',()=>COLORS.map(([c,f,n,pr])=>({id:'c'+c+'_'+f,n:n+(f?' · '+FINISH[f].n:''),pr,bg:css(c),on:spec.c===c&&spec.f===f,set:s=>{s.c=c;s.f=f;}}))],
 ['Jantes',()=>RIMN.map((n,i)=>({id:'r'+i,n,pr:RIMP[i],sw:'⚙️',on:spec.r===i,set:s=>{s.r=i;}}))],
 ['Teinte jantes',()=>RIMC.map(([c,n,pr])=>({id:'rc'+c,n,pr,bg:css(c),on:spec.rc===c,set:s=>{s.rc=c;}}))],
 ['Vitres',()=>TINTN.map(([n,pr],i)=>({id:'t'+i,n,pr,sw:['🪟','🪟','🕶️','⬛'][i],on:spec.t===i,set:s=>{s.t=i;}}))],
 ['Stickers',()=>STK.map(([n,pr],i)=>({id:'s'+i,n,pr,sw:['✖️','🏁','🟧','🔥','🏁','7️⃣','⭐'][i],on:spec.s===i,set:s=>{s.s=i;}}))],
 ['Effets',()=>FXN.map(([n,pr],i)=>({id:'f'+i,n,pr,sw:['✖️','💙','💗','💚','✨','🔥'][i],on:spec.fx===i,set:s=>{s.fx=i;}}))]];
let gTab=0,gPend='',showCar=null,showEnv=null,SR=null;
const coinTxt=()=>'🪙 '+(ADMIN()?'∞':coins);
function refreshShowCar(){if(showCar)showroom.remove(showCar);showCar=buildCar(spec,false);showCar.position.y=.25;showroom.add(showCar);}
function buildGarage(){
  $('gtabs').innerHTML=TABS.map((t,i)=>`<button class="tb ${i===gTab?'on':''}" data-t="${i}">${t[0]}</button>`).join('');
  const o=TABS[gTab][1]();
  $('gopts').innerHTML='<div class="opts">'+o.map((x,i)=>{const ow=owns(x.id,x.pr);return `<div class="op ${x.on?'on':''} ${ow?'':'lock'}" data-i="${i}"><div class="sw" style="${x.bg?'background:'+x.bg:''}">${x.sw||''}</div><div>${x.n}</div><div class="pr ${ow?'ok':''}">${x.on?'Équipé':ow?'Possédé':gPend===x.id?'Confirmer ?':'🪙 '+x.pr}</div></div>`;}).join('')+'</div>';
  $('gco').textContent=coinTxt();$('gname').innerHTML=`${MODELS[spec.m].n}<small>${FINISH[spec.f].n.toUpperCase()}</small>`;
  document.querySelectorAll('#gtabs .tb').forEach(b=>b.onclick=()=>{gTab=+b.dataset.t;gPend='';buildGarage();});
  document.querySelectorAll('#gopts .op').forEach(b=>b.onclick=()=>{const x=o[+b.dataset.i];$('gerr').textContent='';
    if(!owns(x.id,x.pr)){if(gPend!==x.id){gPend=x.id;buildGarage();return;}
      if(coins<x.pr){$('gerr').textContent='Pas assez de pièces ('+x.pr+' 🪙 nécessaires)';gPend='';buildGarage();return;}
      coins-=x.pr;own.add(x.id);saveAll();SND.coin();}
    gPend='';x.set(spec);saveSpec();refreshShowCar();buildGarage();});
}
/* ---------- écrans ---------- */
const SCR=['home','garage','lb','set','lobby','intro','res','end','pause'];
let mode='load',lobSt='menu',lobCode='',lobErr='';
function show(...ids){for(const s of SCR)$(s).hidden=!ids.includes(s);}
function setMode(m){mode=m;showroom.visible=(m==='menu'||m==='garage');world.visible=(m==='play');pts.visible=true;
  if(m!=='play'){scene.environment=showEnv;scene.fog=null;scene.background=new T3.Color(0x080b14);renderer.toneMappingExposure=1.05;$('hud').hidden=true;$('tc').classList.remove('on');}
  else $('hud').hidden=false;}
function toHome(){clearCars();setMode('menu');show('home');updChip();if(!showCar)refreshShowCar();}
function updChip(){setAv($('pav'),myAv(),'🙂');$('pnm').textContent=myName();$('pco').textContent=coinTxt();}
let toastT=0;function toast(t){const e=$('toast');e.textContent=t;e.classList.remove('on');void e.offsetWidth;e.classList.add('on');}
function confetti(){const cv=$('cf');cv.hidden=false;cv.width=innerWidth;cv.height=innerHeight;const c=cv.getContext('2d'),P=[];for(let i=0;i<150;i++)P.push({x:innerWidth/2+(Math.random()-.5)*200,y:innerHeight*.35,vx:(Math.random()-.5)*14,vy:-Math.random()*14-4,r:Math.random()*6+3,c:['#ff7a1a','#2b9dff','#fff','#ffd34a','#6cf09a'][i%5],a:Math.random()*6,va:Math.random()*.4});let t0=performance.now();
  (function f(){const t=performance.now()-t0;c.clearRect(0,0,cv.width,cv.height);for(const p of P){p.x+=p.vx;p.y+=p.vy;p.vy+=.35;p.vx*=.99;p.a+=p.va;c.save();c.translate(p.x,p.y);c.rotate(p.a);c.fillStyle=p.c;c.fillRect(-p.r,-p.r/2,p.r*2,p.r);c.restore();}if(t<3500)requestAnimationFrame(f);else{cv.hidden=true;}})();}
/* ---------- manches ---------- */
const fmt=s=>{s=Math.max(0,s);const m=Math.floor(s/60);return m+':'+(s%60).toFixed(1).padStart(4,'0');};
const diffN=i=>LV[Math.min(i,LV.length-1)].diff;
function pipsHtml(){let h='';for(let i=0;i<MAXR;i++){const r=R.res[i];h+=`<i class="${r==='w'?'w':r==='l'?'l':r==='d'?'d':i===R.r?'c':''}" ${i>=7&&!R.res[i]&&i!==R.r?'style="display:none"':''}></i>`;}return h;}
function scoreHtml(){const me=R.idx,op=1-me;return [me,op].map((i,k)=>`<div class="pl ${k?'op':'me'}"><div class="av" id="${k?'oav':'mav'}">${k?'🤖':'🙂'}</div><div class="n">${k&&R.mode==='online'?`<i id="oc" class="${R.oppOn===false?'off':''}"></i>`:''}${R.names[i]}</div><div class="s">${R.sc[i]}</div></div>`).join('');}
function updHudStatic(){const L=R.O.L;$('hr1').innerHTML=`MANCHE <b>${R.r+1}</b>`;$('hr2').textContent=`${L.diff} · ${ENVN[L.env]}`;$('pips').innerHTML=pipsHtml();$('hsc').innerHTML=scoreHtml();setAv($('mav'),myAv(),'🙂');if(R.mode==='online'&&R.oppAv)setAv($('oav'),R.oppAv,'🙂');}
function beginRound(r,lv,st){
  R.r=r;R.lv=lv;R.st=st;R.phase='cd';R.cdN=4;
  resetRound(lv,R.mode==='online'?R.oppSpec:null,R.names[1-R.idx]);
  setMode('play');show('intro');
  const L=R.O.L;$('iSub').textContent=`Manche ${r+1} sur ${WINR*2-1}+`;$('iTt').textContent=L.diff.toUpperCase();
  $('iVs').innerHTML=`<div><b>${R.names[R.idx]}</b></div><span>${R.sc[R.idx]}–${R.sc[1-R.idx]}</span><div><b>${R.names[1-R.idx]}</b></div>`;
  $('iEnv').textContent=`${ENVN[L.env]} · ${L.name}`;
  $('hud').hidden=true;$('tc').classList.toggle('on',touch);$('tc').style.display='none';updHudStatic();
  const eng=$('cdn');eng.textContent='';
}
function startSolo(){audio();R={mode:'solo',idx:0,sc:[0,0],res:[],names:[myName(),'Robot'],bot:true,r:0,my:{t:[],col:0,dist:0},op:{t:[],col:0,dist:0},rt:[],coinsR:0};
  R.oppAv='';soloRound();}
function soloRound(){const r=R.r,lv=Math.min(r,LV.length-1);srvOff=0;R.skill=Math.min(.95,.66+lv*.035)*(.94+Math.random()*.1);beginRound(r,lv,Date.now()+5600);}
function myRoundEnd(winner,t,why){ // winner: 0 moi,1 adversaire,-1 nul
  R.fin=true;R.phase='between';R.sc=R.sc.slice();R.res[R.r]=winner===R.idx?'w':winner<0?'d':'l';
  R.my.col+=R.col;R.my.dist+=R.dist;if(winner===R.idx)R.my.t.push(t);else if(winner>=0&&t)R.op.t.push(t);
  showRes(winner,t,why);
}
function showRes(w,t,why){
  const me=R.idx,won=w===me,draw=w===-1,fin=R.finFlag;
  $('hud').hidden=false;if(won){SND.win();confetti();vib(200);}else if(!draw)SND.lose();
  setTimeout(()=>{if(R&&R.fin){show('res');$('tc').style.display='none';
    $('rSub').textContent=`Manche ${R.r+1} · ${R.O.L.diff}`;
    $('rTt').textContent=w===-2?'ABANDON':won?'MANCHE GAGNÉE !':draw?'TEMPS ÉCOULÉ':'MANCHE PERDUE';$('rTt').className='tt '+(won?'w':draw||w===-2?'d':'l');
    $('rVs').innerHTML=`<div><b>${R.names[me]}</b></div><span>${R.sc[me]} – ${R.sc[1-me]}</span><div><b>${R.names[1-me]}</b></div>`;
    $('rInf').textContent=why==='crash'?(won?'Ton adversaire a touché un obstacle':'Tu as touché un obstacle'):w>=0&&t?`${R.names[w]} s'est garé en ${fmt(t)}`:draw?'Personne ne s\'est garé à temps':'';
    $('rNx').disabled=false;$('rNx').firstChild.textContent=R.finFlag?'VOIR LE RÉSULTAT ▶':'CONTINUER ▶';}},won?1800:1100);
}
$('rNx').onclick=()=>{audio();
  if(R.finFlag){endMatch();return;}
  if(R.mode==='solo'){R.r++;show();soloRound();}
  else{send({k:'nx'});$('rNx').disabled=true;$('rNx').firstChild.textContent='EN ATTENTE DE L\'ADVERSAIRE…';}};
function soloResult(w,t,why){R.why=why; // w: 0 moi, 1 robot
  if(w===0)R.sc[0]++;else R.sc[1]++;
  R.finFlag=R.sc[0]>=WINR||R.sc[1]>=WINR||R.r+1>=MAXR;myRoundEnd(w,t,why);}
function endMatch(){
  const me=R.idx,w=R.endW!==undefined?R.endW:(R.sc[me]>R.sc[1-me]?me:R.sc[1-me]>R.sc[me]?1-me:-1),won=w===me;
  const on=R.mode==='online',rw=R.my.t.length;
  let gain=(won?(on?120:60):(on?40:15))+rw*(on?10:5);if(R.endWhy==='dc'&&won)gain+=0;
  if(!ADMIN())coins+=gain;ST.g++;if(won)ST.w++;else if(w>=0)ST.l++;ST.rw+=rw;for(const t of R.my.t)if(!ST.best||t<ST.best)ST.best=t;saveAll();
  show('end');$('hud').hidden=true;$('tc').style.display='none';
  $('eSub').textContent=on?'Partie en ligne':'Entraînement contre le robot';$('eTt').textContent=w<0?'ÉGALITÉ':won?'VICTOIRE !':'DÉFAITE';$('eTt').className='tt '+(won?'w':w<0?'d':'l');
  $('eVs').innerHTML=`<div><b>${R.names[me]}</b></div><span>${R.sc[me]} – ${R.sc[1-me]}</span><div><b>${R.names[1-me]}</b></div>`;
  if(R.endWhy==='ab'&&!won)$('eSub').textContent='Tu as abandonné';if(R.endWhy==='ab'&&won)$('eSub').textContent='Ton adversaire a abandonné';if(R.endWhy==='dc'&&won)$('eSub').textContent='Adversaire déconnecté';
  const avg=a=>a.length?fmt(a.reduce((x,y)=>x+y,0)/a.length):'–',best=a=>a.length?fmt(Math.min(...a)):'–',op=R.opStats||{t:R.op.t,col:R.op.col,dist:R.op.dist};
  const rows=[['Manches gagnées',R.my.t.length,(op.t||[]).length],['Meilleur temps',best(R.my.t),best(op.t||[])],['Temps moyen',avg(R.my.t),avg(op.t||[])],['Collisions',R.my.col,op.col==null?'–':op.col],['Distance (m)',Math.round(R.my.dist),op.dist==null?'–':Math.round(op.dist)]];
  $('eSt').innerHTML=rows.map(r=>`<b>${r[1]}</b><span>${r[0]}</span><b>${r[2]}</b>`).join('');
  $('eCo').textContent=ADMIN()?'🪙 ∞':`+${gain} 🪙`;
  if(won){SND.win();confetti();}else SND.lose();updChip();
  if(on){send({k:'ms',d:{t:R.my.t,col:R.my.col,dist:R.my.dist}});}
  R.over=true;
}
$('eAg').onclick=()=>{audio();if(R.mode==='solo')startSolo();else{leaveNet();openLobby();}};
$('eMn').onclick=()=>{leaveNet();R=null;toHome();};
/* ---------- boucle ---------- */
let lastT=0,showA=0;
function frame(ts){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(ts-lastT)/1000||.016);lastT=ts;tNow+=dt;
  if(mode==='play'&&R&&R.O&&!paused)playFrame(dt);
  else if(mode==='menu'||mode==='garage')showFrame(dt);
  pupd(dt);
  for(const f of tickers)f(dt,tNow);
  if(sky&&mode==='play'){sky.position.copy(cam.position);}
  renderer.render(scene,cam);
}
function showFrame(dt){
  showA+=dt*(mode==='garage'?.35:.18);
  if(showCar){showCar.rotation.y=showA;for(const w of showCar.userData.wheels)w.rotation.z-=dt*2;}
  const asp=innerWidth/innerHeight,por=asp<.9,g=mode==='garage';
  const d=g?(por?9.5:8):(por?12:9.5),a=g?.9+Math.sin(tNow*.3)*.25:-.7+Math.sin(tNow*.2)*.3;
  cam.position.lerp(new T3.Vector3(Math.cos(a)*d,g?2.2:2.8,Math.sin(a)*d),.1);
  const dx=-Math.cos(a),dz=-Math.sin(a),rx=-dz,rz=dx,sh=por?0:(g?-2.4:2.6);
  cam.lookAt(-rx*sh,por?(g?-1.2:-2.8):.9,-rz*sh);
}
function playFrame(dt){
  const L=R.O.L;
  if(R.phase==='wait'){camIntro(.4+Math.sin(tNow*.5)*.3,L);setPoseNow(dt);return;}
  const t=(nowS()-R.st)/1000,inp=inputs();
  updGates(t);
  // phases
  if(t<-3){camIntro((t+5.6)/2.6,L);setPoseNow(dt);$('intro').hidden=false;return;}
  if($('intro').hidden===false){show();$('hud').hidden=false;$('tc').style.display='';$('tc').classList.toggle('on',touch);updHudStatic();}
  if(R.phase==='cd'&&t<0){const n=Math.ceil(-t);if(n!==R.cdN){R.cdN=n;const e=$('cdn');e.className='cdn pop';e.textContent=n;void e.offsetWidth;SND.cd();vib(30);}}
  if(R.phase==='cd'&&t>=0){R.phase='run';const e=$('cdn');e.className='cdn pop go';e.textContent='GO !';void e.offsetWidth;SND.go();vib(80);}
  const run=R.phase==='run'&&!R.fin;
  $('tm').textContent=R.phase==='cd'?'0:00.0':fmt(R.fin&&R.ft!=null?R.ft:t);
  // physique
  const step=1/120;let acc=dt,hit=0;myCar.touch=0;
  const ui=run?inp:{t:0,b:1,steer:0};
  let sp0=Math.abs(myCar.v);
  while(acc>0){const h=Math.min(step,acc);acc-=h;if(R.phase==='cd'){myCar.v=0;break;}const px=myCar.x,pz=myCar.z;stepCar(myCar,ui,h);hit=Math.max(hit,collide(myCar,R.O.cols));R.dist+=Math.hypot(myCar.x-px,myCar.z-pz);}
  if(myCar.touch&&run&&!R.fin&&!R.crashed){R.crashed=1;R.col++;thud(Math.max(hit,4));shake=.7;vib(200);R.ft=t;toast('💥 Contact ! Manche perdue');if(R.mode==='solo')soloResult(1,0,'crash');else send({k:'crash',r:R.r});}
  if(hit>1.2&&nowS()-(R.lastHit||0)>450){R.lastHit=nowS();R.col++;shake=Math.min(.7,hit*.09);thud(hit);vib(40+hit*8);if(hit>3)for(let i=0;i<8;i++)emit(myCar.x+Math.cos(myCar.a)*(Math.random()>.5?2:-2),.5,myCar.z+Math.sin(myCar.a)*2*(Math.random()-.5),(Math.random()-.5)*6,2+Math.random()*3,(Math.random()-.5)*6,.5,.25,0xffd34a,0,9,1);}
  R.topv=Math.max(R.topv,Math.abs(myCar.v));
  poseCar(myG,myCar,dt);fxCar(myCar,dt,ui,spec);
  engine(myCar.v,Math.max(0,ui.t),true,spec.m);
  // robot
  if(R.bot&&botCar&&!R.fin){
    if(R.phase==='run'){const bi=botInput(botCar,L,dt,R.skill);let ac=dt;while(ac>0){const h=Math.min(step,ac);ac-=h;stepCar(botCar,bi,h);}
      const pi=parkInfo(botCar,L.slot);if(pi.out<=.1&&pi.ang<=.2&&Math.abs(botCar.v)<.4)botCar.hold+=dt;else botCar.hold=Math.max(0,botCar.hold-dt);
      if(botCar.hold>=.7&&!R.fin){R.op.dist+=0;soloResult(1,t);}}
  }
  // parking
  const pi=parkInfo(myCar,L.slot);
  if(run&&pi.ok&&Math.abs(myCar.v)<.5)R.hold+=dt;else R.hold=Math.max(0,R.hold-dt*2);
  const ring=$('ring');ring.classList.toggle('on',pi.near&&run);$('rc').style.strokeDashoffset=264*(1-clamp(R.hold/.7,0,1));$('rt').textContent=pi.ok?'P':Math.abs(pi.ang*57.3)>11&&pi.out<.5?'↻':'P';$('rc').style.stroke=pi.ok?'#6cf09a':'#ffb347';
  if(run&&R.hold>=.7){
    if(R.mode==='solo'&&!R.fin){R.ft=t;SND.park();soloResult(0,t);}
    else if(R.mode==='online'){if(!R.claim||nowS()-R.claim>1200){R.claim=nowS();R.ft=t;send({k:'park',r:R.r,x:myCar.x,z:myCar.z,a:myCar.a,c:R.col});if(!R.said){R.said=1;toast('Validation par le serveur…');SND.park();}}}
  }
  // cibles / flèche
  const S=L.slot;const dS=Math.hypot(S.x-myCar.x,S.z-myCar.z);
  const O=R.O;O.tp.material.opacity=.8+Math.sin(tNow*5)*.2;O.bm.material.opacity=.14+Math.sin(tNow*3)*.05;
  O.ag.position.set(myCar.x,3.4+Math.sin(tNow*4)*.15,myCar.z);O.ag.rotation.y=-Math.atan2(S.z-myCar.z,S.x-myCar.x);O.ag.visible=dS>6&&!R.fin;
  // adversaire (fantôme)
  if(oppG){const k=Math.min(1,dt*9);const g=oppG.userData;oppG._x=(oppG._x==null?oppT.x:oppG._x)+(oppT.x-(oppG._x==null?oppT.x:oppG._x))*k;oppG._z=(oppG._z==null?oppT.z:oppG._z)+(oppT.z-(oppG._z==null?oppT.z:oppG._z))*k;oppG._a=(oppG._a==null?oppT.a:oppG._a)+wrap(oppT.a-(oppG._a==null?oppT.a:oppG._a))*k;
    setPose(oppG,oppG._x,oppG._z,oppG._a,oppT.s,0,dt);}
  // réseau : position
  if(R.mode==='online'&&nowS()-posT>80){posT=nowS();send({k:'pos',x:+myCar.x.toFixed(2),z:+myCar.z.toFixed(2),a:+myCar.a.toFixed(3),s:+myCar.v.toFixed(1)});}
  // HUD
  $('spd').firstChild.nodeValue=Math.round(Math.abs(myCar.v)*3.6);const gr=$('gr');gr.textContent=myCar.v<-.3?'R':Math.abs(myCar.v)<.3?'N':'D';gr.className='gr '+(myCar.v<-.3?'r':Math.abs(myCar.v)<.3?'n':'');
  const dm=Math.max(0,dS-2.5);$('hdm').textContent=`Toi · ${dm.toFixed(0)} m de la place`;$('bm').style.width=clamp(100-dm*2.2,4,100)+'%';
  let od=null;if(R.bot&&botCar)od=Math.hypot(S.x-botCar.x,S.z-botCar.z);else if(oppG)od=Math.hypot(S.x-oppT.x,S.z-oppT.z);
  if(od!=null){const o=Math.max(0,od-2.5);$('hdo').textContent=`${R.names[1-R.idx]} · ${o.toFixed(0)} m`;$('bo').style.width=clamp(100-o*2.2,4,100)+'%';}
  camUpdate(dt);
}
function setPoseNow(dt){poseCar(myG,myCar,0);if(oppG)setPose(oppG,oppT.x,oppT.z,oppT.a,0,0,0);}
/* ---------- réseau ---------- */
let ws=null,wsOk=false,wsTimer=0,wsWant=false,netN=0;
const send=o=>{if(ws&&ws.readyState===1)try{ws.send(JSON.stringify(o));}catch(e){}};
function connect(){
  if(ws&&ws.readyState<2)return;wsWant=true;
  try{ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/park-ws');}catch(e){lobErr='Connexion impossible.';lobbyRender();return;}
  const me=ws;
  me.onopen=()=>{wsOk=true;lobErr='';send({k:'hi',uid,name:myName(),car:spec});lobbyRender();};
  me.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch(_){return;}onNet(m);};
  me.onclose=()=>{if(ws===me){ws=null;wsOk=false;}if(R&&R.mode==='online'&&R.oppOn!==undefined)setOpp(R.oppOn);lobbyRender();clearTimeout(wsTimer);wsTimer=setTimeout(()=>{if(wsWant)connect();},1500);};
  me.onerror=()=>{if(!wsOk){lobErr='Serveur indisponible (le mode en ligne fonctionne uniquement sur le site déployé).';lobbyRender();}};
}
function leaveNet(){if(R&&R.mode==='online'&&!R.over)send({k:'quit'});wsWant=false;try{if(ws)ws.close();}catch(e){}ws=null;wsOk=false;}
function setOpp(on){if(!R)return;R.oppOn=on;const c=$('oc');if(c)c.className=on?'':'off';}
function onNet(m){
  if(m.T){const o=m.T-Date.now();srvOff=netN++?srvOff*.6+o*.4:o;}
  if(m.k==='queue'){lobSt='queue';lobN=m.n;lobbyRender();}
  else if(m.k==='code'){lobSt='code';lobCode=m.c;lobbyRender();}
  else if(m.k==='err'){lobErr=m.e;lobbyRender();}
  else if(m.k==='match'){startOnline(m);}
  else if(m.k==='resume'){resumeOnline(m);}
  else if(m.k==='rnd'&&R&&R.mode==='online'){R.sc=m.sc;R.finFlag=false;R.endW=undefined;$('res').hidden=true;R.said=0;beginRound(m.r,m.lv,m.st);}
  else if(m.k==='rw'&&R&&R.mode==='online'){R.sc=m.sc;R.finFlag=!!m.fin;if(R.phase==='between'&&R.fin&&m.w!==-2)return;
    if(m.w===-2){R.fin=true;R.phase='between';return;}
    const t=m.t;if(m.w===R.idx){R.ft=t;}R.res[R.r]=m.w===R.idx?'w':m.w<0?'d':'l';
    R.fin=true;R.phase='between';R.my.col+=R.col;R.my.dist+=R.dist;if(m.w===R.idx)R.my.t.push(t);else if(m.w>=0)R.op.t.push(t);
    showRes(m.w,t,m.x?'crash':'');}
  else if(m.k==='end'&&R&&R.mode==='online'){R.endW=m.w;R.endWhy=m.why;R.sc=m.sc;if(m.why==='ab'||m.why==='dc'){R.finFlag=true;R.fin=true;R.phase='between';setTimeout(()=>{if(R&&!R.over)endMatch();},600);}}
  else if(m.k==='opp'){setOpp(m.on);if(R&&R.mode==='online')toast(m.on?'Adversaire reconnecté':'Adversaire déconnecté…');}
  else if(m.k==='pos'){oppT.x=m.x;oppT.z=m.z;oppT.a=m.a;oppT.s=m.s;}
  else if(m.k==='ms'&&R){R.opStats=m.d;}
  else if(m.k==='nxo'&&R){$('rInf').textContent='L\'adversaire est prêt…';}
  else if(m.k==='lb')renderLb(m);
}
let lobN=0;
function startOnline(m){
  const i=m.i,o=m.m.ps[1-i];audio();
  R={mode:'online',idx:i,sc:[0,0],res:[],names:m.m.ps.map(p=>p.name),bot:false,r:0,my:{t:[],col:0,dist:0},op:{t:[],col:0,dist:0},oppSpec:Object.assign({},DEF,o.car||{}),oppOn:o.on,rt:[]};
  R.O=null;resetRound(0,R.oppSpec,o.name);R.phase='wait';setMode('play');show('intro');$('iSub').textContent='Adversaire trouvé';$('iTt').textContent='VS';$('iVs').innerHTML=`<div><b>${R.names[i]}</b></div><span>⚡</span><div><b>${R.names[1-i]}</b></div>`;$('iEnv').textContent='Premier à '+WINR+' victoires · départ synchronisé';$('hud').hidden=true;
  camIntro(0,R.O.L);
  send({k:'rdy'});
}
function resumeOnline(m){
  const i=m.i,M=m.m,o=M.ps[1-i];
  R={mode:'online',idx:i,sc:M.sc,res:[],names:M.ps.map(p=>p.name),bot:false,r:M.r,my:{t:[],col:0,dist:0},op:{t:[],col:0,dist:0},oppSpec:Object.assign({},DEF,o.car||{}),oppOn:o.on,rt:[]};
  audio();if(M.ph==='cd'||M.ph==='run'){beginRound(M.r,M.lv,M.st);toast('Reconnecté à la partie');}
  else{startOnline({i,m:m.m});}
}
/* ---------- salon en ligne ---------- */
function openLobby(){audio();lobSt='menu';lobErr='';setMode('menu');show('lobby');connect();lobbyRender();}
function lobbyRender(){
  if($('lobby').hidden)return;const c=$('lobc');let h='<div class="hz hzb"></div><h2>🌐 <em>Jouer</em> en ligne</h2>';
  const st=wsOk?'<span style="color:#6cf09a">● Connecté</span>':'<span style="color:#ffb347">● Connexion…</span>';
  if(lobSt==='menu')h+=`<div style="font-weight:800;margin-bottom:10px">${st}</div><div style="display:grid;gap:10px;min-width:min(340px,80vw)"><button class="btn" id="lQ" ${wsOk?'':'disabled'}><span>⚡ Partie rapide</span></button><button class="btn bl" id="lC" ${wsOk?'':'disabled'}><span>🔒 Créer un salon privé</span></button><div style="display:grid;grid-template-columns:1fr auto;gap:8px"><input type="text" id="lJ" maxlength="4" placeholder="CODE" style="text-transform:uppercase;text-align:center;letter-spacing:.3em"><button class="btn gh" id="lJb" ${wsOk?'':'disabled'}><span>Rejoindre</span></button></div><button class="btn gh" id="lB"><span>← Retour</span></button></div>`;
  else if(lobSt==='queue')h+=`<div class="spin"></div><div style="font:400 24px 'Lilita One'">Recherche d'un adversaire…</div><div style="font-weight:800;opacity:.8;margin:6px 0 14px">${lobN} joueur(s) en file d'attente</div><div style="display:grid;gap:10px"><button class="btn gh" id="lAi"><span>🤖 S'entraîner contre l'IA en attendant</span></button><button class="btn gh" id="lX"><span>Annuler</span></button></div><div style="font-size:12px;opacity:.7;margin-top:10px">Le mode IA est un entraînement, pas un vrai match.</div>`;
  else if(lobSt==='code')h+=`<div style="font-weight:800">Donne ce code à ton ami :</div><div class="code">${lobCode}</div><div class="spin"></div><div style="font-weight:800;opacity:.8;margin-bottom:12px">En attente de ton adversaire…</div><button class="btn gh" id="lX"><span>Annuler</span></button>`;
  h+=`<div class="err" style="margin-top:8px">${lobErr||''}</div>`;c.innerHTML=h;
  const b=(id,f)=>{const e=$(id);if(e)e.onclick=f;};
  b('lQ',()=>{lobSt='queue';lobErr='';send({k:'q'});lobbyRender();});b('lC',()=>{send({k:'pc'});});b('lJb',()=>{send({k:'pj',c:$('lJ').value});});
  b('lB',()=>{wsWant=false;try{ws&&ws.close();}catch(e){}toHome();});b('lX',()=>{send({k:'qx'});lobSt='menu';lobbyRender();});
  b('lAi',()=>{send({k:'qx'});wsWant=false;try{ws&&ws.close();}catch(e){}startSolo();});
}
/* ---------- classement ---------- */
function openLb(){show('lb');$('lbl').innerHTML='<div class="spin"></div>';$('lbme').textContent='';connect();let n=0;const iv=setInterval(()=>{if(wsOk){send({k:'lb'});clearInterval(iv);}else if(++n>40){clearInterval(iv);$('lbl').innerHTML='<div class="err">Classement indisponible hors du site.</div>';}},150);}
function renderLb(m){if($('lb').hidden)return;$('lbl').innerHTML=m.top.length?m.top.map(r=>`<div class="lbr ${r.me?'me':''}"><i>#${r.r}</i><div>${r.n.replace(/</g,'&lt;')}</div><s>${r.w}V · ${r.l}D</s><u>${r.pts}</u></div>`).join(''):'<div style="opacity:.8;font-weight:800;padding:12px">Aucune partie classée pour l\'instant. Sois le premier !</div>';
  $('lbme').textContent=m.me?`Toi : #${m.rank} · ${m.me.pts} pts`:'Joue un match en ligne pour entrer au classement';}
/* ---------- paramètres ---------- */
function buildSet(){
  $('sNm').value=ld('f7name','')||'';
  $('sKv').innerHTML=[[ST.g,'Parties'],[ST.w,'Victoires'],[ST.rw,'Manches'],[ST.best?fmt(ST.best):'–','Meilleur temps'],[ADMIN()?'∞':coins,'Pièces'],[own.size,'Objets']].map(a=>`<div><b>${a[0]}</b><span>${a[1]}</span></div>`).join('');
  const seg=(id,opts,cur,cb)=>{$(id).innerHTML=opts.map(o=>`<button class="sg ${o[0]==cur?'on':''}" data-v="${o[0]}">${o[1]}</button>`).join('');$(id).querySelectorAll('.sg').forEach(b=>b.onclick=()=>{cb(b.dataset.v);buildSet();});};
  seg('sQ',[['low','Économique'],['mid','Équilibrée'],['high','Maximale']],qual,v=>{qual=v;sv('prq',v);resize();});
  seg('sCam',[['0','Suivi'],['1','Haute'],['2','Dessus']],String(camMode),v=>{camMode=+v;sv('prcam',v);});
  seg('sVib',[['1','Activées'],['0','Coupées']],ld('prvib','1'),v=>sv('prvib',v));
  $('sVol').value=Math.round(sfxVol*100);
}
$('sVol').oninput=e=>{sfxVol=e.target.value/100;sv('prvol',e.target.value);};
$('sx').onclick=()=>{const n=$('sNm').value.trim().slice(0,14);if(n)sv('f7name',n);toHome();};
$('sReset').onclick=()=>{if($('sReset').dataset.c!=='1'){$('sReset').dataset.c='1';$('sReset').firstChild.textContent='Confirmer l\'effacement ?';return;}coins=0;own=new Set();ST={g:0,w:0,l:0,rw:0,best:0};spec=Object.assign({},DEF);saveAll();saveSpec();$('sReset').dataset.c='';$('sReset').firstChild.textContent='Effacer ma progression';refreshShowCar();buildSet();};
/* ---------- pause ---------- */
let pauseAt=0;
function togglePause(){if(mode!=='play'||!R||R.over)return;if(!$('pause').hidden){resumeGame();return;}if(R.phase==='between')return;paused=R.mode==='solo';pauseAt=Date.now();$('pzQv').textContent={low:'Éco',mid:'Équilibrée',high:'Max'}[qual];$('pause').hidden=false;}
function resumeGame(){$('pause').hidden=true;if(paused){R.st+=Date.now()-pauseAt;}paused=false;}
$('bpz').onclick=togglePause;$('bcam').onclick=camCycle;$('pzR').onclick=resumeGame;
$('pzQ').onclick=()=>{qual=qual==='low'?'mid':qual==='mid'?'high':'low';sv('prq',qual);resize();$('pzQv').textContent={low:'Éco',mid:'Équilibrée',high:'Max'}[qual];};
$('pzA').onclick=()=>{$('pause').hidden=true;paused=false;if(R.mode==='online'){send({k:'quit'});R.endW=1-R.idx;R.endWhy='ab';R.finFlag=true;endMatch();}else{R.sc=[0,WINR];R.r=R.r;R.endW=1;R.endWhy='ab';endMatch();}};
/* ---------- boutons accueil ---------- */
$('bOnl').onclick=()=>openLobby();$('bAi').onclick=()=>startSolo();
$('bGar').onclick=()=>{audio();setMode('garage');show('garage');gTab=0;gPend='';buildGarage();};
$('gBack').onclick=()=>toHome();
$('bLb').onclick=()=>{audio();openLb();};$('lbx').onclick=()=>{wsWant=false;try{ws&&ws.close();}catch(e){}show('home');};
$('bSet').onclick=()=>{audio();show('set');buildSet();};$('pchip').onclick=()=>{show('set');buildSet();};
$('bBack').onclick=()=>{location.href='index.html#jeux';};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='play'&&R&&R.mode==='solo'&&$('pause').hidden&&R.phase==='run')togglePause();});
/* ---------- test hors-ligne du robot ---------- */
function colsOf(L){const c=L.obs.filter(o=>o.t!=='gate').map(o=>({x:o.x,z:o.z,a:o.a,hl:o.l/2,hw:o.w/2}));const[x0,x1,z0,z1]=L.b,tk=1;
  c.push({x:(x0+x1)/2,z:z0-tk/2,a:0,hl:(x1-x0)/2+tk,hw:tk/2},{x:(x0+x1)/2,z:z1+tk/2,a:0,hl:(x1-x0)/2+tk,hw:tk/2},{x:x0-tk/2,z:(z0+z1)/2,a:0,hl:tk/2,hw:(z1-z0)/2+tk},{x:x1+tk/2,z:(z0+z1)/2,a:0,hl:tk/2,hw:(z1-z0)/2+tk});return c;}
function simBot(i,withCol,skill){const L=LV[i],c=mkCar(L.start.x,L.start.z,L.start.a);c.k=1;c.wait=0;c.hold=0;const cols=colsOf(L);let t=0,hits=0,pk=false,minD=9e9;
  while(t<150){const bi=botInput(c,L,1/60,skill||.85);for(let k=0;k<2;k++){stepCar(c,bi,1/120);if(withCol&&collide(c,cols)>1)hits++;}t+=1/60;
    const p=parkInfo(c,L.slot);minD=Math.min(minD,p.out);if(p.out<=.1&&p.ang<=.2&&Math.abs(c.v)<.4)c.hold+=1/60;else c.hold=0;if(c.hold>=.7){pk=true;break;}}
  return{t:+t.toFixed(1),pk,hits,minD:+minD.toFixed(2),minT:L.minT};}
window.__pk={get myCar(){return myCar},soloRound,botInput,mkCar,colsOf,get R(){return R;},get car(){return myCar;},simBot,LV,startSolo,stepCar,collide,parkInfo,get mode(){return mode;},setMode,toHome,show,openLobby,onNet,get cam(){return cam;},scene,renderer};
/* ---------- démarrage ---------- */
function init(){
  resize();showEnv=envMap(['#0a0e1c','#1b2440','#0a0e1c'],[[0xff7a1a,-30,12,10,40,4,5],[0x2b9dff,30,14,-10,40,4,5],[0xffffff,0,22,25,50,6,3],[0xffffff,0,22,-25,50,6,3]]);
  scene.environment=showEnv;buildShow();refreshShowCar();setMode('menu');$('ver').textContent=window.AT_VER||'';
  let p=0;const iv=setInterval(()=>{p+=.2;$('ldb').style.width=Math.min(100,p*100)+'%';if(p>=1){clearInterval(iv);$('ld').hidden=true;toHome();}},120);
  requestAnimationFrame(frame);
}
try{init();}catch(e){console.error(e);$('ldm').textContent='Erreur : '+e.message;}
})();
</script>
</body></html>
