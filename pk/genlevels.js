// Génère ../parklevels.json : 7 niveaux de Parking Rush (obstacles, place cible, trajet du robot)
const fs=require('fs');
const WB=2.7,CL=4.4,CW=1.9,SL=5.2;
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const PAL=[0xd63a2f,0x2f6fd6,0xf2f2f2,0x1c1c1f,0xe8b923,0x3aa35b,0x8a8f98,0xe86a1f,0x7a3fd0,0x1fb8c9];
const r2=v=>Math.round(v*100)/100;
function build(cfg){
  const R=rng(cfg.seed),L={id:cfg.id,name:cfg.name,diff:cfg.diff,env:cfg.env,sw:cfg.sw,obs:[],slots:[],route:[]};
  const pc=()=>PAL[Math.floor(R()*PAL.length)],pm=()=>Math.floor(R()*5);
  const car=(x,z,a,t)=>L.obs.push({t:t||'car',x:r2(x),z:r2(z),a:r2(a),w:t==='van'?2.1:CW,l:t==='van'?5.3:CL,c:pc(),m:pm()});
  const T=cfg.T,sw=cfg.sw,zr=cfg.zr,xs=cfg.xs,n=cfg.n,x0=xs-T*sw;
  for(let k=0;k<n;k++){
    const x=x0+k*sw;L.slots.push({x:r2(x),z:zr,a:r2(Math.PI/2),w:sw,l:SL});
    if(k===T)continue;
    const f=cfg.fill?cfg.fill[k]:'c';
    if(f==='e')continue;
    let cx=x+(R()-.5)*.3;
    if(k===T-1)cx=xs-(sw/2+1.0);
    if(k===T+1)cx=xs+(sw/2+1.0);
    car(cx,zr+(R()-.5)*.3,R()<.5?Math.PI/2:-Math.PI/2,f==='v'?'van':'car');
  }
  L.slot={x:xs,z:zr,a:r2(Math.PI/2),w:sw,l:SL};
  let laneBot=cfg.b[3];
  if(cfg.bot){const b=cfg.bot;laneBot=b.z-SL/2;for(let k=0;k<b.n;k++){const x=b.x0+k*b.p;L.slots.push({x:r2(x),z:b.z,a:r2(Math.PI/2),w:b.p,l:SL});if(b.skip&&b.skip.includes(k))continue;car(x+(R()-.5)*.4,b.z,R()<.5?Math.PI/2:-Math.PI/2,b.van&&b.van.includes(k)?'van':'car');}}
  for(const o of cfg.obs||[])L.obs.push(Object.assign({a:0,w:1,l:1,c:0xcccccc,m:0},o));
  if(cfg.gate!==undefined){const top=zr+SL/2,len=laneBot-top-.1;L.obs.push({t:'gate',x:cfg.gate,z:r2(top+len/2+.05),a:r2(Math.PI/2),w:.3,l:r2(len),c:0,m:0});}
  L.b=cfg.b;L.start={x:cfg.start[0],z:cfg.start[1],a:cfg.start[2]};
  const dir=cfg.dir||1;
  let s={x:xs,z:zr,t:Math.PI/2};const pts=[];const d=-0.5*dir;
  const tgt=dir>0?0:Math.PI;let guard=0;
  while(guard++<400){const dt=.05,v=2;s.t+=v/WB*Math.tan(d)*dt;s.x+=v*Math.cos(s.t)*dt;s.z+=v*Math.sin(s.t)*dt;pts.push([s.x,s.z]);const e=Math.atan2(Math.sin(s.t-tgt),Math.cos(s.t-tgt));if(Math.abs(e)<.03)break;}
  for(let i=0;i<30;i++){s.x+=Math.cos(tgt)*.1;s.z+=Math.sin(tgt)*.1;pts.push([s.x,s.z]);}
  const rev=pts.filter((p,i)=>i%6===0||i===pts.length-1).reverse();
  const pend=rev[0];
  const rt=[[L.start.x,L.start.z,1]];
  for(const v of cfg.via||[])rt.push([v[0],v[1],1]);
  rt.push([pend[0],pend[1],1]);
  for(let i=1;i<rev.length;i++)rt.push([rev[i][0],rev[i][1],-1]);
  rt.push([xs,zr+.6,-1]);
  L.route=rt.map(p=>[r2(p[0]),r2(p[1]),p[2]]);
  L.pend=[r2(pend[0]),r2(pend[1])];
  let len=0;for(let i=1;i<L.route.length;i++)len+=Math.hypot(L.route[i][0]-L.route[i-1][0],L.route[i][1]-L.route[i-1][1]);
  L.len=r2(len);L.minT=Math.max(3,r2(len/12));L.maxT=cfg.maxT||150;
  return L;
}
const LV=[];
LV.push(build({id:0,seed:11,name:'Plein soleil',diff:'Très facile',env:0,sw:3.2,n:7,T:3,xs:0,zr:-7.4,fill:['c','e','c','x','c','e','c'],
 b:[-24,24,-10.2,9],start:[-17,2.4,0],via:[[-9,1.5]],obs:[{t:'cone',x:-6,z:5.5,w:.5,l:.5},{t:'cone',x:9,z:4.5,w:.5,l:.5},{t:'bin',x:19,z:-4,w:.9,l:.9},{t:'planter',x:-20,z:-6,w:2,l:2}]}));
LV.push(build({id:1,seed:22,name:'Centre commercial',diff:'Facile',env:3,sw:3.0,n:8,T:4,xs:-1,zr:-7.4,fill:['c','c','e','c','x','c','c','e'],
 bot:{n:9,x0:-12,p:3.6,z:5.8,skip:[2,7]},b:[-25,25,-10.2,8.9],start:[-19,0.4,0],via:[[-9,-0.4]],
 obs:[{t:'cart',x:-3,z:2.5,a:.6,w:.7,l:1.1},{t:'cone',x:7,z:1.2,w:.5,l:.5},{t:'cone',x:11,z:-.5,w:.5,l:.5},{t:'planter',x:-22,z:-5,w:1.8,l:1.8}]}));
LV.push(build({id:2,seed:33,name:'Quartier urbain',diff:'Moyen',env:5,sw:2.85,n:8,T:5,xs:3,zr:-7.4,fill:['c','c','c','e','c','x','c','v'],
 bot:{n:9,x0:-14,p:3.6,z:4.9,skip:[1,6]},b:[-24,24,-10.2,7.7],start:[-19,-.2,0],via:[[-12,-.6],[-7.5,1.9],[-1.8,-.4]],
 obs:[{t:'pillar',x:-9.5,z:-1.6,w:.9,l:.9},{t:'pillar',x:-4.5,z:2.6,w:.9,l:.9},{t:'bin',x:-20,z:-6,w:.9,l:.9},{t:'bin',x:-20,z:5,w:.9,l:.9}]}));
LV.push(build({id:3,seed:44,name:'Toit de la ville',diff:'Difficile',env:2,sw:2.7,n:8,T:2,xs:-6,zr:-7.2,fill:['c','c','x','c','e','c','c','c'],
 bot:{n:9,x0:-17,p:3.6,z:4.5,skip:[3,8]},b:[-24,24,-10,7.3],start:[19,1.4,Math.PI],dir:-1,via:[[11.5,1.2],[8.5,-1.4],[4.5,1.2],[0,-1.2],[-5,1.1]],
 obs:[{t:'barrier',x:9.5,z:2.5,a:Math.PI/2,w:.6,l:2.6},{t:'barrier',x:6,z:-2.3,a:Math.PI/2,w:.6,l:2.6},{t:'barrier',x:2.2,z:2.5,a:Math.PI/2,w:.6,l:2.6},{t:'barrier',x:-2.4,z:-2.4,a:Math.PI/2,w:.6,l:2.4}]}));
LV.push(build({id:4,seed:55,name:'Pluie de minuit',diff:'Très difficile',env:4,sw:2.6,n:9,T:3,xs:-6.5,zr:-7,fill:['c','c','c','x','c','v','c','c','c'],
 bot:{n:10,x0:-17,p:3.5,z:4.2,skip:[8]},b:[-24,24,-9.8,6.9],start:[-19,.4,0],via:[[-14,.2],[-9,2],[-3,-.2],[3,1.4],[5.5,.4]],dir:-1,gate:-16.5,
 obs:[{t:'pillar',x:-12.5,z:-2.4,w:1,l:1},{t:'barrier',x:-8,z:3.1,a:Math.PI/2,w:.6,l:2},{t:'pillar',x:-1.5,z:-2.5,w:1,l:1},{t:'barrier',x:2,z:2.9,a:Math.PI/2,w:.6,l:2},{t:'cone',x:10,z:0,w:.5,l:.5}]}));
LV.push(build({id:5,seed:66,name:'Sous-sol néon',diff:'Expert',env:1,sw:2.5,n:9,T:6,xs:7,zr:-6.8,fill:['c','c','c','v','c','c','x','c','c'],
 bot:{n:10,x0:-18,p:3.5,z:3.9,skip:[]},b:[-24,24,-9.6,6.5],start:[-20,.4,0],via:[[-14,.2],[-9.6,-1],[-4,.9],[1.5,-.9],[5,.4]],gate:-17.5,
 obs:[{t:'pillar',x:-14.5,z:-1.9,w:1.1,l:1.1},{t:'pillar',x:-7,z:-2,w:1.1,l:1.1},{t:'pillar',x:0,z:-2,w:1.1,l:1.1},{t:'pillar',x:-3.2,z:1.9,w:1.1,l:1.1},{t:'barrier',x:-10.5,z:2.1,a:0,w:.6,l:2.2},{t:'cone',x:4,z:-1.4,w:.5,l:.5}]}));
LV.push(build({id:6,seed:77,name:'Alerte rouge',diff:'Extrême',env:1,sw:2.4,n:9,T:2,xs:-7.5,zr:-6.6,fill:['c','v','x','c','c','c','c','v','c'],
 bot:{n:10,x0:-18,p:3.5,z:3.6,skip:[],van:[5]},b:[-24,24,-9.4,6.2],start:[19,.1,Math.PI],dir:-1,via:[[13,-.2],[9,1.1],[4.5,-1],[0,1],[-3.5,-.6],[-2.5,.8]],gate:16,
 obs:[{t:'pillar',x:11,z:-1.7,w:1.1,l:1.1},{t:'barrier',x:6.2,z:1.7,a:Math.PI/2,w:.6,l:2.2},{t:'cone',x:3,z:-1.5,w:.5,l:.5},{t:'barrier',x:1.8,z:1.9,a:Math.PI/2,w:.6,l:2},{t:'pillar',x:-5.5,z:-1.9,w:1.1,l:1.1},{t:'cone',x:-10,z:1.6,w:.5,l:.5}]}));
fs.writeFileSync(process.argv[2]||'../parklevels.json',JSON.stringify(LV));
console.log(LV.map(l=>l.name+' len '+l.len+' pend '+l.pend).join('\n'));
