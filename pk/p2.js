<script>
'use strict';
(()=>{
const $=id=>document.getElementById(id),T3=window.THREE;
const ld=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:v;}catch(e){return d;}};
const sv=(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}};
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const touch=matchMedia('(pointer:coarse)').matches||'ontouchstart' in window;
const LV=/*LEVELS_JSON*/null;
const ENVN=['Parking en plein soleil','Parking souterrain','Toit de la ville','Centre commercial','Nuit sous la pluie','Quartier urbain'];
const WB=2.7,CL=4.4,CW=1.9,MAXR=9,WINR=4;
/*AVATAR_BLOCK*/
const myAv=()=>{const a=ld('f7av','');return validAv(a)?a:'';};
function setAv(el,av,fb){el.replaceChildren();if(av&&validAv(av))el.innerHTML=avSVGa(av);else el.textContent=fb;}
let qual=ld('prq','')||(touch?'low':'high');
const QS={low:{dpr:1,shadow:0,deco:.5,rain:300},mid:{dpr:1.5,shadow:1024,deco:.8,rain:700},high:{dpr:2,shadow:2048,deco:1,rain:1400}};
const Q=()=>QS[qual]||QS.mid;
let renderer;
try{renderer=new T3.WebGLRenderer({canvas:$('c'),antialias:!touch,powerPreference:'high-performance'});}catch(e){$('ldm').textContent='WebGL indisponible sur cet appareil.';throw e;}
renderer.outputColorSpace=T3.SRGBColorSpace;renderer.toneMapping=T3.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T3.PCFSoftShadowMap;
const scene=new T3.Scene(),cam=new T3.PerspectiveCamera(55,1,.1,500);
const world=new T3.Group(),showroom=new T3.Group();scene.add(world,showroom);
function resize(){const w=innerWidth,h=innerHeight;renderer.setPixelRatio(Math.min(devicePixelRatio||1,Q().dpr));renderer.setSize(w,h,false);cam.aspect=w/h;cam.fov=w/h<.85?72:55;cam.updateProjectionMatrix();}
addEventListener('resize',resize);
const mkc=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;};
const ctex=(w,h,f,rep)=>{const t=new T3.CanvasTexture(mkc(w,h,f));t.colorSpace=T3.SRGBColorSpace;t.anisotropy=4;if(rep)t.wrapS=t.wrapT=T3.RepeatWrapping;return t;};
const rnd=(()=>{let s=7;return()=>{s=(s*16807)%2147483647;return s/2147483647;};})();
function envMap(stops,lamps){
  const pm=new T3.PMREMGenerator(renderer),es=new T3.Scene();
  const gt=ctex(8,256,(c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);stops.forEach((s,i)=>g.addColorStop(i/(stops.length-1),s));c.fillStyle=g;c.fillRect(0,0,w,h);});
  es.add(new T3.Mesh(new T3.SphereGeometry(100,24,16),new T3.MeshBasicMaterial({side:T3.BackSide,map:gt})));
  for(const l of lamps){const b=new T3.Mesh(new T3.BoxGeometry(l[4]||40,l[5]||5,3),new T3.MeshBasicMaterial({color:new T3.Color(l[0]).multiplyScalar(l[6]||4)}));b.position.set(l[1],l[2],l[3]);b.lookAt(0,0,0);es.add(b);}
  const rt=pm.fromScene(es,.03);pm.dispose();return rt.texture;
}
/* ---------- audio ---------- */
let AC=null,engO=null,engO2=null,engG=null,engF=null,skG=null,NB=null,sfxVol=+ld('prvol','70')/100;
function audio(){if(AC){if(AC.state==='suspended')AC.resume();return;}try{
  AC=new(window.AudioContext||window.webkitAudioContext)();engO=AC.createOscillator();engO2=AC.createOscillator();engG=AC.createGain();engF=AC.createBiquadFilter();
  engO.type='sawtooth';engO2.type='square';engF.type='lowpass';engF.frequency.value=600;engG.gain.value=0;
  engO.connect(engF);engO2.connect(engF);engF.connect(engG);engG.connect(AC.destination);engO.start();engO2.start();
  NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const ns=AC.createBufferSource();ns.buffer=NB;ns.loop=true;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=2400;bp.Q.value=4;skG=AC.createGain();skG.gain.value=0;ns.connect(bp);bp.connect(skG);skG.connect(AC.destination);ns.start();
  }catch(e){AC=null;}}
function beep(f,d,t,v,f2){if(!AC||sfxVol<=0)return;try{const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime;o.type=t||'square';o.frequency.setValueAtTime(f,n);if(f2)o.frequency.exponentialRampToValueAtTime(f2,n+d);g.gain.setValueAtTime((v||.1)*sfxVol,n);g.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(g);g.connect(AC.destination);o.start(n);o.stop(n+d);}catch(e){}}
function thud(v){if(!AC||sfxVol<=0)return;try{const s=AC.createBufferSource();s.buffer=NB;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=500+v*60;const g=AC.createGain(),n=AC.currentTime;g.gain.setValueAtTime(clamp(v/8,.15,.9)*sfxVol,n);g.gain.exponentialRampToValueAtTime(.001,n+.35);s.connect(f);f.connect(g);g.connect(AC.destination);s.start(n,Math.random()*.5,.4);}catch(e){}beep(90,.25,'sine',.25,40);}
const SND={go(){beep(880,.5,'square',.12);},cd(){beep(520,.18,'square',.1);},
 win(){[523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>beep(f,.28,'triangle',.14),i*110));},
 lose(){[392,330,262,196].forEach((f,i)=>setTimeout(()=>beep(f,.34,'sawtooth',.09),i*160));},
 park(){beep(660,.12,'triangle',.12);setTimeout(()=>beep(990,.2,'triangle',.12),110);},
 coin(){beep(1200,.1,'triangle',.08);}};
function engine(sp,thr,on,tone){if(!AC||!engO)return;const n=AC.currentTime,r=Math.abs(sp);
  const f=34+r*7.5+thr*9+(tone||0)*3;engO.frequency.setTargetAtTime(f,n,.06);engO2.frequency.setTargetAtTime(f*.5,n,.06);
  engG.gain.setTargetAtTime(on?(.025+Math.min(.07,r*.006)+thr*.025)*sfxVol:0,n,.08);engF.frequency.setTargetAtTime(380+r*90+thr*260,n,.08);}
function skid(v){if(skG)skG.gain.setTargetAtTime(v*.07*sfxVol,AC.currentTime,.05);}
const vib=ms=>{if(ld('prvib','1')==='1'&&navigator.vibrate)try{navigator.vibrate(ms);}catch(e){}};
/* ---------- géométries ---------- */
function merge(list){let n=0;const gs=list.map(g=>{g=g.index?g.toNonIndexed():g;n+=g.attributes.position.count;return g;});
  const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2);let o=0;
  for(const g of gs){const c=g.attributes.position.count;P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);if(g.attributes.uv)U.set(g.attributes.uv.array,o*2);o+=c;}
  const r=new T3.BufferGeometry();r.setAttribute('position',new T3.BufferAttribute(P,3));r.setAttribute('normal',new T3.BufferAttribute(N,3));r.setAttribute('uv',new T3.BufferAttribute(U,2));return r;}
const bx=(w,h,d,x,y,z,rx,ry,rz)=>{const g=new T3.BoxGeometry(w,h,d);if(rx)g.rotateX(rx);if(ry)g.rotateY(ry);if(rz)g.rotateZ(rz);g.translate(x,y,z);return g;};
const MAT={};const mat=(k,f)=>MAT[k]||(MAT[k]=f());
const stdm=(c,r,m,o)=>new T3.MeshStandardMaterial(Object.assign({color:c,roughness:r,metalness:m},o||{}));
/* ---------- voitures ---------- */
const chaikin=(p,it)=>{for(let k=0;k<it;k++){const q=[];for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];q.push([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25],[a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75]);}p=q;}return p;};
const MODELS=[
 {n:'Citadine',L:4.0,W:1.78,belt:.98,r:.3,hl:.62,tl:.82,wing:0,pr:0,pts:[[.04,.22],[0,.5],[0,1.05],[.04,1.25],[.12,1.4],[.3,1.5],[.55,1.52],[.64,1.46],[.74,1.0],[.9,.92],[.985,.72],[1,.5],[.97,.28],[.92,.22]]},
 {n:'Berline sportive',L:4.7,W:1.84,belt:1.0,r:.33,hl:.66,tl:.86,wing:1,pr:600,pts:[[.02,.2],[0,.55],[.01,.9],[.06,.98],[.24,1.02],[.34,1.3],[.45,1.38],[.58,1.37],[.68,1.04],[.86,.98],[.98,.8],[1,.52],[.98,.28],[.94,.2]]},
 {n:'Coupé',L:4.5,W:1.85,belt:.96,r:.33,hl:.62,tl:.84,wing:1,pr:1200,pts:[[.02,.2],[0,.55],[.01,.92],[.06,1.0],[.2,1.03],[.36,1.26],[.44,1.29],[.56,1.28],[.66,1.0],[.88,.94],[.985,.74],[1,.5],[.98,.28],[.94,.2]]},
 {n:'Voiture de sport',L:4.4,W:1.9,belt:.86,r:.34,hl:.52,tl:.74,wing:2,pr:2500,pts:[[.02,.16],[0,.45],[.02,.8],[.08,.9],[.26,.93],[.38,1.1],[.48,1.2],[.58,1.19],[.68,.95],[.88,.84],[.985,.62],[1,.42],[.98,.24],[.94,.16]]},
 {n:'Supercar',L:4.55,W:2.0,belt:.78,r:.35,hl:.44,tl:.68,wing:3,pr:5000,pts:[[.02,.15],[0,.42],[.03,.78],[.16,.88],[.34,.92],[.46,1.1],[.54,1.12],[.62,1.08],[.72,.84],[.9,.74],[.99,.5],[1,.36],[.97,.2],[.93,.15]]}];
const MG=[];
function quadG(A,B,hw0,hw1,sign){const dx=B[0]-A[0],dy=B[1]-A[1],l=Math.hypot(dx,dy),nx=-dy/l*sign,ny=dx/l*sign,o=.128;
  const P=[[A[0]+nx*o,A[1]+ny*o,-hw0],[A[0]+nx*o,A[1]+ny*o,hw0],[B[0]+nx*o,B[1]+ny*o,hw1],[B[0]+nx*o,B[1]+ny*o,-hw1]];
  const g=new T3.BufferGeometry(),v=[];[0,1,2,0,2,3].forEach(i=>v.push(...P[i]));g.setAttribute('position',new T3.Float32BufferAttribute(v,3));g.computeVertexNormals();
  const n=g.attributes.normal.array;if(n[0]*nx+n[1]*ny<0){const p=g.attributes.position.array;for(let i=0;i<p.length;i+=9)for(let k=0;k<3;k++){const t=p[i+3+k];p[i+3+k]=p[i+6+k];p[i+6+k]=t;}g.computeVertexNormals();}return g;}
function modelGeo(mi){
  if(MG[mi])return MG[mi];const M=MODELS[mi],L=M.L,W=M.W;
  const raw=M.pts.map(p=>[(p[0]-.5)*L*.96,p[1]]),sm=chaikin(raw,2);
  const sh=new T3.Shape(sm.map(p=>new T3.Vector2(p[0],p[1])));
  const d=W-.22,bod=new T3.ExtrudeGeometry(sh,{depth:d,bevelEnabled:true,bevelThickness:.11,bevelSize:.1,bevelSegments:3,curveSegments:1});bod.translate(0,0,-d/2);
  const up=sm.filter(p=>p[1]>M.belt);let ym=0;up.forEach(p=>ym=Math.max(ym,p[1]));
  const cx=up.reduce((s,p)=>s+p[0],0)/up.length,cyy=up.reduce((s,p)=>s+p[1],0)/up.length;
  const ins=up.map(p=>new T3.Vector2(cx+(p[0]-cx)*.93,cyy+(p[1]-cyy)*.9));
  const gl=new T3.ExtrudeGeometry(new T3.Shape(ins),{depth:W+.03,bevelEnabled:false,curveSegments:1});gl.translate(0,0,-(W+.03)/2);
  const hi=up.filter(p=>p[1]>M.belt+.55*(ym-M.belt));let F1=hi[0],R1=hi[0];hi.forEach(p=>{if(p[0]>F1[0])F1=p;if(p[0]<R1[0])R1=p;});
  const glass=merge([gl,quadG(up[up.length-1],F1,W*.4,W*.34,1),quadG(up[0],R1,W*.4,W*.34,-1)]);
  const top=[];for(let i=0;i<sm.length;i++){top.push(sm[i]);if(sm[i][0]>L*.46*.96&&i>3)break;}
  const rib=(hw,off)=>{const P=[],I=[];for(let i=0;i<top.length;i++){const a=top[Math.max(0,i-1)],b=top[Math.min(top.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;const x=top[i][0]+nx*off,y=top[i][1]+ny*off;P.push(x,y,-hw,x,y,hw);}
    for(let i=0;i<top.length-1;i++){const a=i*2;I.push(a,a+1,a+2,a+1,a+3,a+2);}
    const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();return g;};
  const wx=L*.3,dark=[],lite=[],tail=[],fw=L*.48,wz=W/2;
  dark.push(bx(.06,.16,W*.45,fw,M.hl-.12,0),bx(.04,.07,.4,fw+.01,M.hl-.34,0),bx(.3,.1,.16,L*.12,M.belt+.03,wz+.12),bx(.3,.1,.16,L*.12,M.belt+.03,-wz-.12));
  lite.push(bx(.08,.12,.4,fw-.02,M.hl,wz*.62),bx(.08,.12,.4,fw-.02,M.hl,-wz*.62));
  tail.push(bx(.06,.1,.46,-fw+.02,M.tl,wz*.62),bx(.06,.1,.46,-fw+.02,M.tl,-wz*.62));
  if(M.wing>=2)tail.push(bx(.06,.09,W*.7,-fw+.02,M.tl,0));
  for(const s of [1,-1])for(const x of [wx,-wx]){const g=new T3.CylinderGeometry(M.r+.08,M.r+.08,.02,20);g.rotateX(Math.PI/2);g.translate(x,M.r,s*(W/2+.004));dark.push(g);}
  for(const s of [1,-1]){const g=new T3.CylinderGeometry(.045,.045,.3,8);g.rotateZ(Math.PI/2);g.translate(-L*.48,.3,s*.5);dark.push(g);}
  const wing=[];
  if(M.wing){const y=M.wing===3?M.tl+.42:M.tl+.3;wing.push(bx(.3,.05,W*.92,-L*.47,y,0),bx(.05,.34,.05,-L*.46,y-.18,W*.3),bx(.05,.34,.05,-L*.46,y-.18,-W*.3));}
  return MG[mi]={M,bod,glass,rb:[rib(.22,.112),rib(.06,.114)],dark:merge(dark),lite:merge(lite),tail:merge(tail),wing:wing.length?merge(wing):null,wx};
}
function rimGeo(st,r){const a=[];const disc=(rad,h,z)=>{const g=new T3.CylinderGeometry(rad,rad,h,24);g.rotateX(Math.PI/2);g.translate(0,0,z);return g;};
  const tor=(rad,z)=>{const g=new T3.TorusGeometry(rad,.025,6,24);g.translate(0,0,z);return g;};
  const sp=(n,len,w,th,z,rot)=>{for(let i=0;i<n;i++){const g=new T3.BoxGeometry(len,w,th);g.translate(len/2,0,z);g.rotateZ(i/n*Math.PI*2+(rot||0));a.push(g);}};
  a.push(disc(r*.2,.06,.13));
  if(st===0)sp(5,r*.82,r*.16,.05,.1);else if(st===1)sp(10,r*.82,r*.06,.04,.1);
  else if(st===2){a.push(disc(r*.8,.03,.1),tor(r*.72,.12));}
  else if(st===3){sp(12,r*.82,r*.05,.03,.1);sp(12,r*.82,r*.05,.03,.09,.13);a.push(tor(r*.5,.1));}
  else sp(3,r*.84,r*.32,.05,.1);
  a.push(tor(r*.84,.1));return merge(a);}
const RIMG={};
const FINISH=[{n:'Brillant',f:{roughness:.25,metalness:.2,clearcoat:1,clearcoatRoughness:.04}},{n:'Mat',f:{roughness:.85,metalness:.1,clearcoat:0}},{n:'Métallisé',f:{roughness:.28,metalness:.75,clearcoat:1,clearcoatRoughness:.05}},{n:'Chrome',f:{roughness:.04,metalness:1,clearcoat:0}},{n:'Nacré',f:{roughness:.2,metalness:.3,clearcoat:1,iridescence:1,iridescenceIOR:1.6}}];
const paintMat=(col,fi)=>new T3.MeshPhysicalMaterial(Object.assign({color:col},FINISH[fi||0].f,{envMapIntensity:1.2}));
const TINT=[.08,.35,.7,.95];
const glassMat=t=>mat('gl'+t,()=>new T3.MeshPhysicalMaterial({color:0x0a1018,roughness:.05,metalness:.2,transparent:true,opacity:.55+TINT[t]*.4,envMapIntensity:1.6,clearcoat:1}));
function decalTex(k,col){return ctex(512,128,(c,w,h)=>{c.clearRect(0,0,w,h);
  if(k===3){for(let i=0;i<16;i++)for(let j=0;j<4;j++){c.fillStyle=(i+j)%2?'#111':'#fff';c.fillRect(i*32,j*32,32,32);}}
  else if(k===2){const g=c.createLinearGradient(0,h,0,0);g.addColorStop(0,'#ffe25a');g.addColorStop(.5,'#ff8a1f');g.addColorStop(1,'#d82a10');c.fillStyle=g;c.beginPath();c.moveTo(0,h);for(let i=0;i<8;i++){const x=i*64;c.quadraticCurveTo(x+20,h*.5,x+32,h*(.1+(i%3)*.15));c.quadraticCurveTo(x+40,h*.55,x+64,h);}c.lineTo(w,h);c.fill();}
  else if(k===4){c.fillStyle=col;c.beginPath();c.arc(256,64,56,0,7);c.fill();c.fillStyle='#fff';c.font="400 86px 'Lilita One',Arial";c.textAlign='center';c.textBaseline='middle';c.fillText('7',256,70);}
  else if(k===5){c.fillStyle='#fff';for(let i=0;i<14;i++){const x=20+rnd()*470,y=14+rnd()*100,r=8+rnd()*14;c.beginPath();for(let j=0;j<10;j++){const a=j*Math.PI/5-Math.PI/2,rr=j%2?r*.45:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.fill();}}});}
const BLOB=()=>mat('blob',()=>new T3.MeshBasicMaterial({map:ctex(64,64,(c,w,h)=>{const r=c.createRadialGradient(32,32,4,32,32,32);r.addColorStop(0,'rgba(0,0,0,.65)');r.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=r;c.fillRect(0,0,w,h);}),transparent:true,depthWrite:false}));
function buildCar(spec,simple){
  const g=new T3.Group(),mg=modelGeo(spec.m|0),M=mg.M;
  const paint=simple?mat('pp'+spec.c+'_'+(spec.f|0),()=>paintMat(spec.c,spec.f)):paintMat(spec.c,spec.f);
  const body=new T3.Mesh(mg.bod,paint);body.castShadow=true;g.add(body);
  g.add(new T3.Mesh(mg.glass,glassMat(spec.t|0)));
  g.add(new T3.Mesh(mg.dark,mat('dk',()=>stdm(0x101216,.6,.2))));
  g.add(new T3.Mesh(mg.lite,mat('lt',()=>new T3.MeshBasicMaterial({color:0xffffff}))));
  g.add(new T3.Mesh(mg.tail,mat('tl',()=>new T3.MeshBasicMaterial({color:0xff2222}))));
  if(mg.wing)g.add(new T3.Mesh(mg.wing,paint));
  const s=spec.s|0;
  if(s&&!simple){
    if(s<=2){g.add(new T3.Mesh(mg.rb[0],mat('st'+s,()=>stdm(s===1?0xf4f4f4:0xff7a1a,.3,0,{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}))));
      if(s===1)g.add(new T3.Mesh(mg.rb[1],mat('stb',()=>stdm(0x1b2a6a,.3,0,{polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}))));}
    else{const k=s-1,dm=new T3.MeshBasicMaterial({map:decalTex(k===1?2:k===2?3:k===3?4:5,'#ff7a1a'),transparent:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
      for(const sg of [1,-1]){const p=new T3.Mesh(new T3.PlaneGeometry(k===3?.9:2,k===3?.9:.5),dm);p.position.set(k===3?M.L*.06:-.2,M.belt-.34,sg*(M.W/2+.005));if(sg<0)p.rotation.y=Math.PI;g.add(p);}}}
  const wheels=[],fr=[];
  const rk=(spec.r|0)+'_'+M.r,rg=RIMG[rk]||(RIMG[rk]=rimGeo(spec.r|0,M.r));
  const tireG=MG['t'+M.r]||(MG['t'+M.r]=(()=>{const gg=new T3.CylinderGeometry(M.r,M.r,.26,20);gg.rotateX(Math.PI/2);return gg;})());
  const rimM=simple?mat('rm'+spec.rc,()=>stdm(spec.rc,.3,.9)):stdm(spec.rc,.25,.95,{envMapIntensity:1.5});
  for(const [sx,sz] of [[1,1],[1,-1],[-1,1],[-1,-1]]){
    const piv=new T3.Group();piv.position.set(sx*mg.wx,M.r,sz*(M.W/2-.14));const w=new T3.Group();piv.add(w);
    w.add(new T3.Mesh(tireG,mat('tm',()=>stdm(0x15161a,.85,0))));
    const r=new T3.Mesh(rg,rimM);if(sz<0)r.rotation.y=Math.PI;w.add(r);
    g.add(piv);wheels.push(w);if(sx>0)fr.push(piv);}
  const sh=new T3.Mesh(new T3.PlaneGeometry(M.L*1.35,M.W*1.5),BLOB());sh.rotation.x=-Math.PI/2;sh.position.y=.02;g.add(sh);
  let glow=null;
  if(spec.fx>=1&&spec.fx<=3&&!simple){const col=[0,0x2b9dff,0xff3fb0,0x39ff7a][spec.fx];
    glow=new T3.Mesh(new T3.PlaneGeometry(M.L*1.5,M.W*1.8),new T3.MeshBasicMaterial({map:ctex(64,64,(c,w,h)=>{const r=c.createRadialGradient(32,32,2,32,32,32);r.addColorStop(0,'#fff');r.addColorStop(.35,'rgba(255,255,255,.6)');r.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=r;c.fillRect(0,0,w,h);}),color:col,transparent:true,blending:T3.AdditiveBlending,depthWrite:false,opacity:.9}));
    glow.rotation.x=-Math.PI/2;glow.position.y=.05;g.add(glow);}
  g.userData={wheels,fr,body,M};
  return g;
}
