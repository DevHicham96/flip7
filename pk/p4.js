/* ---------- constantes de conduite ---------- */
const PH={vmax:11,vrev:5,acc:7.5,racc:5,brk:13,hb:18,roll:2.4,maxSt:.62};
const mkCar=(x,z,a)=>({x,z,a,v:0,st:0,wr:0,sx:x,sz:z});
function stepCar(c,inp,dt){
  let v=c.v,a=0;const t=inp.t||0;
  if(t>0)a=v<-.05?PH.brk:PH.acc*(1-Math.max(0,v)/PH.vmax)*t;
  else if(t<0)a=v>.05?-PH.brk:-PH.racc*(1-Math.max(0,-v)/PH.vrev)*(-t);
  else a=-Math.sign(v)*Math.min(Math.abs(v)/dt,PH.roll+Math.abs(v)*.2);
  if(inp.b)a+=-Math.sign(v)*Math.min(Math.abs(v)/dt,PH.brk*inp.b*(inp.hb?1.4:1));
  v+=a*dt;if(Math.abs(v)<.02&&t===0)v=0;
  v=clamp(v,-PH.vrev,PH.vmax);
  const tg=(inp.steer||0)*PH.maxSt/(1+Math.abs(v)*.09),d=tg-c.st,rate=(Math.abs(tg)<Math.abs(c.st)||tg*c.st<0?5.2:3.2)*dt;
  c.st+=clamp(d,-rate,rate);
  c.a=wrap(c.a+v/WB*Math.tan(c.st)*dt);c.v=v;c.x+=Math.cos(c.a)*v*dt;c.z+=Math.sin(c.a)*v*dt;c.wr+=v*dt;
}
function sat(c,o){
  const ca=Math.cos(c.a),sa=Math.sin(c.a),co=Math.cos(o.a),so=Math.sin(o.a),hl=CL/2-.04,hw=CW/2-.02;
  const axes=[[ca,sa],[-sa,ca],[co,so],[-so,co]],dx=o.x-c.x,dz=o.z-c.z;let best=1e9,bn=null;
  for(const [ax,az] of axes){
    const rc=hl*Math.abs(ca*ax+sa*az)+hw*Math.abs(-sa*ax+ca*az),ro=o.hl*Math.abs(co*ax+so*az)+o.hw*Math.abs(-so*ax+co*az),p=dx*ax+dz*az,ov=rc+ro-Math.abs(p);
    if(ov<=0)return null;if(ov<best){best=ov;const s=p>0?-1:1;bn=[ax*s,az*s];}
  }
  return{d:best,nx:bn[0],nz:bn[1]};
}
/* résout les collisions ; renvoie la vitesse d'impact (0 si aucune) */
function collide(c,cols){
  let imp=0;
  for(const o of cols){if(o.off)continue;
    const h=sat(c,o);if(!h)continue;
    c.x+=h.nx*(h.d+.005);c.z+=h.nz*(h.d+.005);
    const vx=Math.cos(c.a)*c.v,vz=Math.sin(c.a)*c.v,vn=vx*h.nx+vz*h.nz;
    if(vn<0){imp=Math.max(imp,-vn);const nx=vx-vn*h.nx*1.15,nz=vz-vn*h.nz*1.15;c.v=(nx*Math.cos(c.a)+nz*Math.sin(c.a))*.8;}
  }
  return imp;
}
/* état de stationnement : tolérance 0.1 m, 11° */
function parkInfo(c,S){
  const ca=Math.cos(c.a),sa=Math.sin(c.a),sc=Math.cos(S.a),ss=Math.sin(S.a);let out=0;
  for(const [u,v] of [[1,1],[1,-1],[-1,1],[-1,-1]]){const px=c.x+ca*u*CL/2-sa*v*CW/2,pz=c.z+sa*u*CL/2+ca*v*CW/2,dx=px-S.x,dz=pz-S.z,al=dx*sc+dz*ss,ac=-dx*ss+dz*sc;out=Math.max(out,Math.abs(al)-S.l/2,Math.abs(ac)-S.w/2);}
  let d=Math.abs(wrap(c.a-S.a));if(d>Math.PI/2)d=Math.PI-d;
  return{out,ang:d,ok:out<=.1&&d<=.2,near:out<=1.2};
}
/* ---------- entrées ---------- */
const K={};let tpad={l:0,r:0,g:0,v:0,b:0};
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;K[e.code]=1;if(e.code==='Space'||e.code.startsWith('Arrow'))e.preventDefault();if(e.code==='KeyC')camCycle();if(e.code==='Escape')togglePause();audio();});
addEventListener('keyup',e=>{K[e.code]=0;});
function inputs(){
  const l=K.KeyQ||K.KeyA||K.ArrowLeft||tpad.l,r=K.KeyD||K.ArrowRight||tpad.r;
  const g=K.KeyW||K.KeyZ||K.ArrowUp||tpad.g,bk=K.KeyS||K.ArrowDown||tpad.v;
  return{t:(g?1:0)-(bk?1:0),steer:(r?1:0)-(l?1:0),b:(K.Space||tpad.b)?1:0,hb:!!(K.Space||tpad.b)};
}
function bindPad(id,key){const e=$(id);const on=ev=>{ev.preventDefault();tpad[key]=1;e.classList.add('dn');audio();};const off=ev=>{ev.preventDefault();tpad[key]=0;e.classList.remove('dn');};
  e.addEventListener('pointerdown',on);e.addEventListener('pointerup',off);e.addEventListener('pointerleave',off);e.addEventListener('pointercancel',off);e.addEventListener('contextmenu',ev=>ev.preventDefault());}
bindPad('bl','l');bindPad('br','r');bindPad('bg','g');bindPad('bv','v');bindPad('bb','b');
/* ---------- joueurs ---------- */
const DEF={m:0,c:0xd63a2f,f:0,r:0,rc:0xc9ccd4,t:1,s:0,fx:0};
function loadSpec(){try{const s=JSON.parse(ld('prcar','null'));if(s&&typeof s.m==='number')return Object.assign({},DEF,s);}catch(e){}return Object.assign({},DEF);}
let spec=loadSpec();const saveSpec=()=>sv('prcar',JSON.stringify(spec));
const ADMIN=()=>ld('f7prof','')==='hitch';
const myName=()=>(ld('f7name','')||'Joueur').trim().slice(0,14)||'Joueur';
let uid=ld('f7id','');if(!uid){uid='g_'+Math.random().toString(36).slice(2,12);sv('f7id',uid);}
/* ---------- partie ---------- */
let R=null,myCar=null,myG=null,oppG=null,botCar=null,oppT={x:0,z:0,a:0,s:0,got:0},camMode=+ld('prcam','0'),camYaw=0,shake=0,paused=false,srvOff=0,lastTs=0,posT=0,hold=0,tNow=0;
const nowS=()=>Date.now()+srvOff;
const CAMN=['Suivi','Haute','Dessus'];
function camCycle(){camMode=(camMode+1)%3;sv('prcam',camMode);toast('Caméra : '+CAMN[camMode]);}
function clearCars(){for(const o of [myG,oppG])if(o&&o.parent)o.parent.remove(o);myG=oppG=null;}
function ghostify(g){g.traverse(o=>{if(o.isMesh&&o.material){const m=o.material.clone();m.transparent=true;m.opacity=Math.min(m.opacity==null?1:m.opacity,.5);m.depthWrite=false;o.material=m;o.castShadow=false;}});}
function nameTag(txt,col){const c=mkc(256,64,(x,w,h)=>{x.fillStyle='rgba(8,11,20,.75)';x.beginPath();x.roundRect?x.roundRect(4,8,w-8,h-16,16):x.rect(4,8,w-8,h-16);x.fill();x.strokeStyle=col;x.lineWidth=4;x.stroke();x.fillStyle='#fff';x.font="800 30px Nunito,Arial";x.textAlign='center';x.textBaseline='middle';x.fillText(txt,w/2,h/2+2);});
  const t=new T3.CanvasTexture(c);t.colorSpace=T3.SRGBColorSpace;const s=new T3.Sprite(new T3.SpriteMaterial({map:t,depthTest:false,transparent:true}));s.scale.set(3.4,.85,1);s.renderOrder=20;return s;}
function resetRound(lv,oppSpec,oppName){
  const O=buildLevel(lv);R.O=O;clearCars();
  const s=O.L.start;myCar=mkCar(s.x,s.z,s.a);myCar.hit=0;
  myG=buildCar(spec,false);world.add(myG);
  if(oppSpec){oppG=buildCar(oppSpec,true);ghostify(oppG);world.add(oppG);const tg=nameTag(oppName||'Adversaire','#ff7a1a');tg.position.y=2.6;oppG.add(tg);oppT={x:s.x,z:s.z,a:s.a,s:0,got:0};oppG.position.set(s.x,0,s.z);}
  botCar=R.bot?mkCar(s.x,s.z,s.a):null;if(botCar){botCar.k=1;botCar.wait=0;botCar.done=0;botCar.hold=0;}
  R.hold=0;hold=0;R.col=0;R.dist=0;R.parked=false;R.claim=0;R.fin=false;R.topv=0;
  camYaw=s.a;showLevelSky();
}
/* ---------- robot (entraînement) ---------- */
function botInput(b,L,dt,skill){
  const rt=L.route,n=rt.length;let k=b.k;
  const g=rt[Math.min(k,n-1)][2];let e=k;while(e+1<n&&rt[e+1][2]===g)e++;
  const dEnd=Math.hypot(rt[e][0]-b.x,rt[e][1]-b.z);
  while(k<e&&Math.hypot(rt[k][0]-b.x,rt[k][1]-b.z)<1.3)k++;b.k=k;
  const Ld=g>0?3.4:2.4;let tk=k;while(tk<e&&Math.hypot(rt[tk][0]-b.x,rt[tk][1]-b.z)<Ld)tk++;
  const dx=rt[tk][0]-b.x,dz=rt[tk][1]-b.z,ly=-dx*Math.sin(b.a)+dz*Math.cos(b.a),ld2=Math.max(1,dx*dx+dz*dz);
  const steer=clamp(Math.atan(WB*2*ly/ld2)/PH.maxSt,-1,1);
  let vt=(g>0?8.6:3.4)*skill;vt=Math.min(vt,Math.sqrt(2*3.2*Math.max(0,dEnd-.35))+.5);vt*=1-.45*Math.abs(b.st)/PH.maxSt;
  const last=e===n-1,atEnd=dEnd<(last?.45:.7);
  if(atEnd&&!last){ if(Math.abs(b.v)<.15){b.wait+=dt;if(b.wait>.35){b.wait=0;b.k=e+1;}}return{t:0,b:1,steer:0};}
  const v=b.v*g;let t=0,br=0;
  if(vt<.3){br=1;}else if(v<vt-.2)t=g;else if(v>vt+.6)br=1;
  if(last&&dEnd<.5){br=1;t=0;}
  return{t,b:br,steer};
}
/* ---------- caméra ---------- */
function camUpdate(dt){
  if(!myCar){return;}
  const c=myCar,asp=innerWidth/innerHeight,k=asp<.85?1.5:1;
  camYaw+=wrap(c.a-camYaw)*Math.min(1,dt*(camMode===2?0:2.6));
  let px,py,pz,lx,ly,lz;
  if(camMode===0){const d=8.8*k,h=4.2*k;px=c.x-Math.cos(camYaw)*d;pz=c.z-Math.sin(camYaw)*d;py=h;lx=c.x+Math.cos(camYaw)*3;lz=c.z+Math.sin(camYaw)*3;ly=.6;}
  else if(camMode===1){const d=13*k,h=11*k;px=c.x-Math.cos(camYaw)*d;pz=c.z-Math.sin(camYaw)*d;py=h;lx=c.x+Math.cos(camYaw)*2;lz=c.z+Math.sin(camYaw)*2;ly=0;}
  else{px=c.x;pz=c.z+5*k;py=24*k;lx=c.x;lz=c.z;ly=0;}
  cam.position.lerp(new T3.Vector3(px,py,pz),Math.min(1,dt*7));
  if(shake>0){cam.position.x+=(Math.random()-.5)*shake;cam.position.y+=(Math.random()-.5)*shake*.6;shake=Math.max(0,shake-dt*2);}
  cam.up.set(0,1,0);cam.lookAt(lx,ly,lz);
}
function camIntro(t,L){ // survol de la place cible puis retour voiture
  const S=L.slot,u=clamp(t,0,1),a=u*1.2+.6;
  cam.position.set(S.x+Math.cos(a)*14*(1-u*.2),9-u*3,S.z+Math.sin(a)*14*(1-u*.2)+4);cam.lookAt(S.x,0,S.z);
}
/* ---------- rendu des voitures ---------- */
function poseCar(g,c,dt,steerVis){
  g.position.set(c.x,0,c.z);g.rotation.y=-c.a;const U=g.userData;
  for(const w of U.wheels)w.rotation.z-=(c.v*dt)/U.M.r;
  for(const p of U.fr)p.rotation.y=-c.st*.9;
  g.rotation.z=0;
}
function setPose(g,x,z,a,v,st,dt){g.position.set(x,0,z);g.rotation.y=-a;const U=g.userData;for(const w of U.wheels)w.rotation.z-=(v*dt)/U.M.r;for(const p of U.fr)p.rotation.y=-st*.9;}
function fxCar(c,dt,inp,sp,g){
  const fx=sp.fx|0,fw=Math.cos(c.a),fs=Math.sin(c.a);
  if(Math.abs(c.v)>3.5&&Math.abs(c.st)>.28||(inp&&inp.b&&Math.abs(c.v)>4)){const dx=-fw*1.4,dz=-fs*1.4;if(Math.random()<.5)emit(c.x+dx,.2,c.z+dz,(Math.random()-.5),.5,(Math.random()-.5),.7,.9,0xcccccc,1.2,0,.35);skid(clamp(Math.abs(c.v)/9,.2,1));}else skid(0);
  if(fx===4&&Math.abs(c.v)>1.5&&Math.random()<.8)emit(c.x-fw*2.1,.15,c.z-fs*2.1,-fw*c.v*.2+(Math.random()-.5)*3,1.5+Math.random()*2,-fs*c.v*.2+(Math.random()-.5)*3,.5,.28,Math.random()<.5?0xffd34a:0xff7a1a,-.2,9,1);
  if(fx===5&&inp&&inp.t>0&&Math.random()<.9)emit(c.x-fw*2.3,.35,c.z-fs*2.3,-fw*4,.2,-fs*4,.35,.55,Math.random()<.5?0xff7a1a:0x35b9ff,-.9,0,.9);
}
