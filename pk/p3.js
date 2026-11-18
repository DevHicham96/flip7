/* ---------- particules ---------- */
const PN=700,PA={pos:new Float32Array(PN*3),col:new Float32Array(PN*3),size:new Float32Array(PN),al:new Float32Array(PN)},PV=new Float32Array(PN*4),PLF=new Float32Array(PN*3);let pi=0;
const pgeo=new T3.BufferGeometry();pgeo.setAttribute('position',new T3.BufferAttribute(PA.pos,3));pgeo.setAttribute('pc',new T3.BufferAttribute(PA.col,3));pgeo.setAttribute('ps',new T3.BufferAttribute(PA.size,1));pgeo.setAttribute('pa',new T3.BufferAttribute(PA.al,1));
const pmat=new T3.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{k:{value:300}},vertexShader:'attribute vec3 pc;attribute float ps;attribute float pa;varying vec3 c;varying float a;uniform float k;void main(){c=pc;a=pa;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=ps*k/max(.1,-mv.z);gl_Position=projectionMatrix*mv;}',fragmentShader:'varying vec3 c;varying float a;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(c,a*(1.-d*d));}'});
const pts=new T3.Points(pgeo,pmat);pts.frustumCulled=false;scene.add(pts);
function emit(x,y,z,vx,vy,vz,life,size,col,grow,grav,al){const i=pi=(pi+1)%PN;PA.pos[i*3]=x;PA.pos[i*3+1]=y;PA.pos[i*3+2]=z;PV[i*4]=vx;PV[i*4+1]=vy;PV[i*4+2]=vz;PV[i*4+3]=grav||0;PLF[i*3]=life;PLF[i*3+1]=life;PLF[i*3+2]=grow||0;PA.size[i]=size;PA.al[i]=al==null?.8:al;const c=new T3.Color(col);PA.col[i*3]=c.r;PA.col[i*3+1]=c.g;PA.col[i*3+2]=c.b;}
function pupd(dt){for(let i=0;i<PN;i++){if(PLF[i*3]<=0){PA.al[i]=0;continue;}PLF[i*3]-=dt;const f=PLF[i*3]/PLF[i*3+1];PA.pos[i*3]+=PV[i*4]*dt;PA.pos[i*3+1]+=PV[i*4+1]*dt;PA.pos[i*3+2]+=PV[i*4+2]*dt;PV[i*4+1]-=PV[i*4+3]*dt;PA.size[i]+=PLF[i*3+2]*dt;PA.al[i]=Math.max(0,Math.min(.9,f*1.2));}
  pgeo.attributes.position.needsUpdate=pgeo.attributes.pc.needsUpdate=pgeo.attributes.ps.needsUpdate=pgeo.attributes.pa.needsUpdate=true;pmat.uniforms.k.value=innerHeight*.9*Math.min(devicePixelRatio||1,Q().dpr)/ (renderer.getPixelRatio()||1)*.5;}
/* ---------- ciel, textures, décors ---------- */
let sky=null,tickers=[],lvObj=null;
function mkSky(stops){const m=new T3.Mesh(new T3.SphereGeometry(300,20,12),new T3.MeshBasicMaterial({side:T3.BackSide,fog:false,depthWrite:false,map:ctex(8,256,(c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);stops.forEach((s,i)=>g.addColorStop(i/(stops.length-1),s));c.fillStyle=g;c.fillRect(0,0,w,h);})}));m.renderOrder=-10;return m;}
const winTex=(lit,cols)=>ctex(128,128,(c,w,h)=>{c.fillStyle=cols[0];c.fillRect(0,0,w,h);for(let y=0;y<4;y++)for(let x=0;x<4;x++){c.fillStyle=rnd()<lit?cols[1+Math.floor(rnd()*(cols.length-1))]:'#0d1424';c.fillRect(x*32+6,y*32+7,20,18);}},true);
function building(g,x,z,w,h,d,tex,rep,col,em){const t=tex.clone();t.needsUpdate=true;t.repeat.set(Math.max(1,Math.round(w/4)),Math.max(1,Math.round(h/4)));
  const m=new T3.MeshStandardMaterial({map:t,color:col||0xffffff,roughness:.7,metalness:.1,emissiveMap:em?t:null,emissive:em?0xffffff:0x000000,emissiveIntensity:em||0});const b=new T3.Mesh(new T3.BoxGeometry(w,h,d),m);b.position.set(x,h/2-.05,z);b.castShadow=false;g.add(b);return b;}
const BOXM=(c,r,m)=>stdm(c,r==null?.8:r,m||0);
function B(g,w,h,d,x,y,z,mt,cs){const m=new T3.Mesh(new T3.BoxGeometry(w,h,d),mt);m.position.set(x,y,z);if(cs){m.castShadow=true;m.receiveShadow=true;}g.add(m);return m;}
function lamp(g,x,z,h,col,inten,emit){const p=B(g,.14,h,.14,x,h/2,z,BOXM(0x30343c,.5,.6));B(g,.9,.1,.14,x+(x<0?.4:-.4),h,z,BOXM(0x30343c,.5,.6));const l=B(g,.5,.1,.3,x+(x<0?.8:-.8),h-.1,z,new T3.MeshBasicMaterial({color:new T3.Color(col).multiplyScalar(emit||1.6)}));return l;}
function tree(g,x,z,s,col){B(g,.3*s,1.6*s,.3*s,x,.8*s,z,BOXM(0x5a3b22));const m=new T3.Mesh(new T3.IcosahedronGeometry(1.5*s,1),stdm(col||0x3f9a45,.9,0,{flatShading:true}));m.position.set(x,2.5*s,z);m.castShadow=true;g.add(m);const m2=new T3.Mesh(new T3.IcosahedronGeometry(1*s,1),stdm(col||0x3f9a45,.9,0,{flatShading:true}));m2.position.set(x+.6*s,3.2*s,z+.3*s);g.add(m2);}
function groundTex(L,kind){
  const x0=L.b[0],x1=L.b[1],z0=L.b[2],z1=L.b[3],S=30,w=Math.ceil((x1-x0)*S),h=Math.ceil((z1-z0)*S);
  const P={0:['#4d5058','#3c3f46'],1:['#6a6e76','#52565e'],2:['#565960','#42454c'],3:['#555860','#3f4249'],4:['#2a2d38','#1b1d26'],5:['#4c4d52','#3a3b40']}[kind];
  const tex=ctex(w,h,(c)=>{c.fillStyle=P[0];c.fillRect(0,0,w,h);
    for(let i=0;i<9000;i++){c.fillStyle=`rgba(${rnd()<.5?0:255},${rnd()<.5?0:255},${rnd()<.5?0:255},${.03+rnd()*.05})`;c.fillRect(rnd()*w,rnd()*h,1+rnd()*2,1+rnd()*2);}
    for(let i=0;i<26;i++){c.fillStyle=`rgba(0,0,0,${.05+rnd()*.08})`;c.beginPath();c.ellipse(rnd()*w,rnd()*h,20+rnd()*70,10+rnd()*30,rnd()*3,0,7);c.fill();}
    c.strokeStyle='rgba(0,0,0,.18)';c.lineWidth=7;for(let i=0;i<14;i++){c.beginPath();const y=rnd()*h,xx=rnd()*w;c.moveTo(xx,y);c.quadraticCurveTo(xx+80,y+rnd()*60-30,xx+220,y+rnd()*80-40);c.stroke();}
    const X=x=>(x-x0)*S,Z=z=>(z-z0)*S;
    c.strokeStyle=kind===1?'#ffd23f':'#f2f2f2';c.lineWidth=.14*S;c.lineCap='square';
    for(const s of L.slots){const top=s.z<L.slot.z+1,xa=X(s.x-s.w/2),xb=X(s.x+s.w/2),za=Z(s.z-s.l/2),zb=Z(s.z+s.l/2);c.beginPath();c.moveTo(xa,top?zb:za);c.lineTo(xa,top?za:zb);c.lineTo(xb,top?za:zb);c.lineTo(xb,top?zb:za);c.stroke();}
    // flèches de circulation
    c.fillStyle='rgba(255,255,255,.55)';const lz=Z((L.slot.z+SLd()/2+(L.b[3]-L.slot.z-SLd()/2)*.0)+0.0);
    function SLd(){return 5.2;}
    c.strokeStyle='rgba(255,210,63,.8)';c.lineWidth=.12*S;c.strokeRect(1,1,w-2,h-2);
    c.fillStyle='rgba(255,255,255,.35)';c.font=`900 ${Math.round(S*1.5)}px Arial`;c.textAlign='center';
    L.slots.forEach((s,i)=>{if(s.z<L.slot.z+1&&Math.abs(s.x-L.slot.x)>.1)c.fillText(String(i+1),X(s.x),Z(s.z+s.l/2-.5));});
  });
  const m=new T3.MeshStandardMaterial({map:tex,roughness:kind===4?.18:kind===1?.32:.88,metalness:kind===4?.35:.05,envMapIntensity:kind===4?1.4:.6});
  const p=new T3.Mesh(new T3.PlaneGeometry(x1-x0,z1-z0),m);p.rotation.x=-Math.PI/2;p.position.set((x0+x1)/2,0,(z0+z1)/2);p.receiveShadow=true;return p;
}
function buildEnv(L){
  const g=new T3.Group(),k=L.env,kind=k,dq=Q().deco;tickers=[];
  const cx=(L.b[0]+L.b[1])/2,cz=(L.b[2]+L.b[3])/2,W=L.b[1]-L.b[0],Hh=L.b[3]-L.b[2];
  g.add(groundTex(L,kind));
  let fog,sc=0,envs,sun=null;
  const wall=(h,col,rough)=>{const m=BOXM(col,rough||.8);const t=.6;B(g,W+t*2,h,t,cx,h/2,L.b[2]-t/2,m,1);B(g,W+t*2,h,t,cx,h/2,L.b[3]+t/2,m,1);B(g,t,h,Hh,L.b[0]-t/2,h/2,cz,m,1);B(g,t,h,Hh,L.b[1]+t/2,h/2,cz,m,1);};
  const outer=(col,r)=>{const p=new T3.Mesh(new T3.PlaneGeometry(400,400),stdm(col,r||.95,0));p.rotation.x=-Math.PI/2;p.position.set(cx,-.03,cz);p.receiveShadow=true;g.add(p);};
  const sunL=(col,int,pos,sh)=>{const d=new T3.DirectionalLight(col,int);d.position.set(cx+pos[0],pos[1],cz+pos[2]);d.target.position.set(cx,0,cz);g.add(d,d.target);
    if(sh&&Q().shadow){d.castShadow=true;d.shadow.mapSize.set(Q().shadow,Q().shadow);const c=d.shadow.camera;c.left=-34;c.right=34;c.top=20;c.bottom=-20;c.near=1;c.far=120;d.shadow.bias=-.0005;d.shadow.normalBias=.04;}return d;};
  if(k===0){ // plein soleil
    sky=mkSky(['#3d8fe8','#8cc8ff','#d8efff','#fff2d0']);scene.fog=new T3.Fog(0xcfe6ff,60,230);envs=envMap(['#4a9aea','#a9d6ff','#ffe9c2','#8a8f98'],[[0xfff1cc,60,70,40,60,30,5]]);
    g.add(new T3.HemisphereLight(0xcfe8ff,0x8a7a60,.75));sun=sunL(0xfff0d0,2.6,[28,40,18],1);outer(0x5fa04a);
    B(g,W+1.4,.3,.5,cx,.15,L.b[2]-.25,BOXM(0xb9bcc2),1);B(g,W+1.4,.3,.5,cx,.15,L.b[3]+.25,BOXM(0xb9bcc2),1);B(g,.5,.3,Hh,L.b[0]-.25,.15,cz,BOXM(0xb9bcc2),1);B(g,.5,.3,Hh,L.b[1]+.25,.15,cz,BOXM(0xb9bcc2),1);
    for(let i=0;i<14*dq;i++){const x=L.b[0]-4+i*(W+8)/(14*dq);tree(g,x,L.b[2]-5-rnd()*5,1+rnd()*.6);tree(g,x+1.5,L.b[3]+5+rnd()*5,1+rnd()*.6);}
    for(let i=0;i<4;i++)B(g,W*.18,9+rnd()*8,8,L.b[0]+W*(.1+i*.27),5,L.b[2]-22,BOXM([0xe8d9c0,0xc9d6e6,0xe6c9c9,0xd0e6d0][i],.7),0);
    for(let x=L.b[0]+4;x<L.b[1];x+=14)lamp(g,x,L.b[3]+1.2,6.5,0xffffff,1);
    for(let i=0;i<30;i++){const c=Math.floor(rnd()*4),m=new T3.Mesh(new T3.IcosahedronGeometry(.5,0),stdm([0xff6b8a,0xffd23f,0xfff,0xb36bff][c],.9));m.position.set(L.b[0]-2+rnd()*(W+4),.3,L.b[3]+2.5+rnd()*2);g.add(m);}
  }else if(k===1){ // souterrain
    const neon=L.id===6?0xff2a2a:L.id===5?0x35e0ff:0x35e0ff,neon2=L.id===6?0xff7a2a:0xff3fb0;
    sky=null;scene.background=new T3.Color(0x07080d);scene.fog=new T3.Fog(0x07080d,26,90);envs=envMap(['#0b0d16','#151a2a','#0b0d16'],[[neon,-40,25,0,60,4,6],[neon2,40,25,10,60,4,6],[neon,0,28,-40,60,4,5],[0xffffff,0,30,30,60,4,3]]);
    g.add(new T3.HemisphereLight(0x6677aa,0x111118,.45));
    const H=4.4,cm=stdm(0x41454f,.9,.05);const cl=new T3.Mesh(new T3.PlaneGeometry(W+20,Hh+20),cm);cl.rotation.x=Math.PI/2;cl.position.set(cx,H,cz);g.add(cl);
    wall(H,0x565a66,.85);
    for(let x=L.b[0]+2;x<L.b[1];x+=8)for(const z of [L.b[2]+.6,L.b[3]-.6]){const t=new T3.Mesh(new T3.BoxGeometry(.18,.1,.18),new T3.MeshBasicMaterial({color:0xffffff}));}
    const nm=new T3.MeshBasicMaterial({color:new T3.Color(neon).multiplyScalar(2.2)}),nm2=new T3.MeshBasicMaterial({color:new T3.Color(neon2).multiplyScalar(2)});
    for(let x=L.b[0]+3;x<L.b[1];x+=9){B(g,5.2,.1,.22,x,H-.12,cz-3,nm);B(g,5.2,.1,.22,x,H-.12,cz+2,nm);}
    B(g,W,.12,.12,cx,2.1,L.b[2]+.35,nm2);B(g,W,.12,.12,cx,2.1,L.b[3]-.35,nm2);
    for(let i=0;i<6;i++){const pl=new T3.PointLight(i%2?neon2:neon,2.2,24,1.6);pl.position.set(L.b[0]+4+i*(W-8)/5,3.4,cz+(i%2?2:-3));g.add(pl);}
    const ex=B(g,1.6,.7,.1,L.b[1]-3,3.4,L.b[2]+.1,new T3.MeshBasicMaterial({color:0x35ff7a}));
    for(let x=L.b[0]+5;x<L.b[1];x+=10)for(const z of [L.b[2]+.35,L.b[3]-.35]){B(g,.9,H,.7,x,H/2,z,stdm(0x7a7f8c,.85,.05),1);B(g,.92,.7,.72,x,.35,z,new T3.MeshStandardMaterial({color:0xffc400,roughness:.6}));}
    g.add(new T3.DirectionalLight(0x8899cc,.35));
    for(const [x,z] of L.obs.filter(o=>o.t==='pillar').map(o=>[o.x,o.z]))void x;
  }else if(k===2){ // toit
    sky=mkSky(['#2a3f8a','#c9618b','#ff9a5c','#ffd89a']);scene.fog=new T3.Fog(0xe8a07a,70,260);envs=envMap(['#33448f','#d0708a','#ffb070','#6a5a60'],[[0xffd9a0,-60,26,40,50,20,5],[0xff8a6a,40,18,-50,60,10,4]]);
    g.add(new T3.HemisphereLight(0xffc9a0,0x4a3a50,.8));sun=sunL(0xffb070,2.4,[-30,22,20],1);outer(0x1c2030,.9);
    const pw=BOXM(0x8d9099,.7);B(g,W+1.6,1.0,.6,cx,.5,L.b[2]-.3,pw,1);B(g,W+1.6,1.0,.6,cx,.5,L.b[3]+.3,pw,1);B(g,.6,1.0,Hh,L.b[0]-.3,.5,cz,pw,1);B(g,.6,1.0,Hh,L.b[1]+.3,.5,cz,pw,1);
    const wt=winTex(.55,['#1b2236','#ffd98a','#fff0c0','#9ad0ff']);
    for(let i=0;i<46*dq;i++){const a=rnd()*Math.PI*2,r=60+rnd()*90,h=14+rnd()*70;const x=cx+Math.cos(a)*r*1.4,z=cz+Math.sin(a)*r*1.1;building(g,x,z,9+rnd()*14,h,9+rnd()*14,wt,1,0x9aa6c0,.8).position.y=h/2-18;}
    for(let i=0;i<5;i++){B(g,3,2,2,L.b[0]+4+i*9,1,L.b[2]-1.8,BOXM(0xa7acb5,.5,.4),1);B(g,2.4,.15,2.4,L.b[0]+4+i*9,2.05,L.b[2]-1.8,BOXM(0x777c86),0);}
    const wtk=new T3.Mesh(new T3.CylinderGeometry(2,2,3,10),stdm(0x8a5a3a,.8));wtk.position.set(L.b[1]-4,4.8,L.b[2]-2);g.add(wtk);B(g,.2,3.3,.2,L.b[1]-5.2,1.6,L.b[2]-2,BOXM(0x444));B(g,.2,3.3,.2,L.b[1]-2.8,1.6,L.b[2]-2,BOXM(0x444));
    for(let x=L.b[0]+3;x<L.b[1];x+=12)lamp(g,x,L.b[3]+.2,5,0xffe2a0,1,2);
  }else if(k===3){ // centre commercial
    sky=mkSky(['#6aa5e0','#a8cdf0','#dce9f6','#f6f1e4']);scene.fog=new T3.Fog(0xdde8f4,70,240);envs=envMap(['#7fb0e8','#c9ddf2','#f2f0e8','#8a8f98'],[[0xffffff,50,60,30,60,20,4]]);
    g.add(new T3.HemisphereLight(0xdceaff,0x8b8578,.85));sun=sunL(0xfff4e0,2.0,[22,40,22],1);outer(0x7f8189,.9);
    const mall=new T3.Group();const fm=new T3.MeshStandardMaterial({color:0x9fc4e8,roughness:.05,metalness:.6,envMapIntensity:1.5});
    B(mall,W+30,12,10,cx,6,L.b[2]-9,BOXM(0xe9e4da,.8),0);B(mall,W+20,6,.4,cx,4,L.b[2]-3.9,fm,0);
    const sg=B(mall,16,2.4,.3,cx,10,L.b[2]-3.8,new T3.MeshBasicMaterial({map:ctex(512,96,(c,w,h)=>{c.fillStyle='#ff7a1a';c.fillRect(0,0,w,h);c.fillStyle='#fff';c.font="400 66px 'Lilita One',Arial";c.textAlign='center';c.textBaseline='middle';c.fillText('ATELIER MALL',w/2,h/2+3);})}),0);
    g.add(mall);const cur=BOXM(0xb9bcc2);B(g,W+1.4,.3,.5,cx,.15,L.b[2]-.25,cur,1);B(g,W+1.4,.3,.5,cx,.15,L.b[3]+.25,cur,1);B(g,.5,.3,Hh,L.b[0]-.25,.15,cz,cur,1);B(g,.5,.3,Hh,L.b[1]+.25,.15,cz,cur,1);
    for(let x=L.b[0]+4;x<L.b[1];x+=11)lamp(g,x,L.b[3]+1.5,6.5,0xffffff,1);
    for(let i=0;i<8*dq;i++)tree(g,L.b[0]+3+i*(W-6)/(8*dq),L.b[3]+4+rnd()*2,.9+rnd()*.4,0x4fae55);
    for(let i=0;i<6;i++)B(g,5,.5,2.4,L.b[0]+6+i*6.5,.25,L.b[3]+8,BOXM(0xd8d2c4),0);
  }else if(k===4){ // nuit pluie
    sky=mkSky(['#05070f','#0c1226','#1a2442','#2a2f55']);scene.fog=new T3.Fog(0x0a0e1e,22,120);envs=envMap(['#070a14','#11182e','#223056','#10142a'],[[0xff9a5a,-40,22,20,24,5,5],[0x35e0ff,50,24,-30,24,5,5],[0xff3fb0,0,26,-60,40,5,5],[0xffd9a0,30,30,40,24,5,4]]);
    g.add(new T3.HemisphereLight(0x5a6aa0,0x10121c,.55));sun=sunL(0x7a8cd8,.9,[-20,30,10],0);outer(0x12141c,.4);
    const cur=BOXM(0x30333c);B(g,W+1.4,.3,.5,cx,.15,L.b[2]-.25,cur,1);B(g,W+1.4,.3,.5,cx,.15,L.b[3]+.25,cur,1);B(g,.5,.3,Hh,L.b[0]-.25,.15,cz,cur,1);B(g,.5,.3,Hh,L.b[1]+.25,.15,cz,cur,1);
    const wt=winTex(.5,['#141a30','#ffcf70','#ffa060','#8fd0ff']);
    for(let i=0;i<16;i++){const h=12+rnd()*30;building(g,L.b[0]-10+i*(W+20)/15,L.b[2]-18-rnd()*8,8+rnd()*6,h,8,wt,1,0x8a95b0,.9);}
    const sn=[[0xff3fb0,'BAR'],[0x35e0ff,'HÔTEL'],[0xffa030,'OPEN 24H']];sn.forEach((s,i)=>B(g,5.4,1.4,.2,L.b[0]+10+i*16,7.5,L.b[2]-13.7,new T3.MeshBasicMaterial({map:ctex(256,64,(c,w,h)=>{c.fillStyle='#0a0a12';c.fillRect(0,0,w,h);c.shadowColor='#'+s[0].toString(16).padStart(6,'0');c.shadowBlur=16;c.fillStyle='#'+s[0].toString(16).padStart(6,'0');c.font="400 42px 'Lilita One',Arial";c.textAlign='center';c.textBaseline='middle';c.fillText(s[1],w/2,h/2+2);})}),0));
    const poles=[];for(let x=L.b[0]+6;x<L.b[1];x+=16){const l=lamp(g,x,L.b[3]+1,7,0xffd29a,1,3);const pl=new T3.PointLight(0xffc88a,2.2,26,1.5);pl.position.set(x+.8,6.6,L.b[3]+1);g.add(pl);}
    const rn=Q().rain,rg=new T3.BufferGeometry(),rp=new Float32Array(rn*6);for(let i=0;i<rn;i++){const x=(rnd()-.5)*70,y=rnd()*30,z=(rnd()-.5)*50;rp.set([x,y,z,x,y-.9,z],i*6);}
    rg.setAttribute('position',new T3.BufferAttribute(rp,3));const rl=new T3.LineSegments(rg,new T3.LineBasicMaterial({color:0x9ab4e8,transparent:true,opacity:.35,fog:false}));rl.frustumCulled=false;g.add(rl);
    tickers.push((dt)=>{const a=rg.attributes.position.array;for(let i=0;i<rn;i++){let y=a[i*6+1]-dt*26;if(y<0)y+=30;a[i*6+1]=y;a[i*6+4]=y-.9;}rg.attributes.position.needsUpdate=true;rl.position.set(cam.position.x,0,cam.position.z);});
    let fl=0;tickers.push((dt,t)=>{if(Math.random()<dt*.05)fl=.35;fl=Math.max(0,fl-dt);scene.environment&&(renderer.toneMappingExposure=1.05+fl*3);});
  }else{ // quartier urbain
    sky=mkSky(['#4a82c9','#9cc4ea','#f0dfc4','#e8c9a6']);scene.fog=new T3.Fog(0xe8d8c0,50,200);envs=envMap(['#6a9ad8','#c9d6e6','#f0dcc0','#7a7468'],[[0xffe0b0,-50,45,30,50,20,4]]);
    g.add(new T3.HemisphereLight(0xe0ecff,0x8a7a62,.8));sun=sunL(0xffe2b8,2.3,[-26,34,16],1);outer(0x6a6e58,.95);
    const cur=BOXM(0xaeb0b4);B(g,W+1.4,.3,.5,cx,.15,L.b[2]-.25,cur,1);B(g,W+1.4,.3,.5,cx,.15,L.b[3]+.25,cur,1);B(g,.5,.3,Hh,L.b[0]-.25,.15,cz,cur,1);B(g,.5,.3,Hh,L.b[1]+.25,.15,cz,cur,1);
    const cols=[0xd9826a,0xe3c26a,0x8fb4d6,0xc9a0c9,0x9fc28f,0xe0a8a0];const wt=winTex(.4,['#c9ccd4','#8fb4d6','#7aa0c8','#b8d0e8']);
    for(let i=0;i<9;i++){const x=L.b[0]-6+i*(W+12)/8,h=10+rnd()*7;building(g,x,L.b[2]-11-rnd()*3,W/8.2,h,9,wt,1,cols[i%6]);B(g,W/8.2+.6,1.4,9.6,x,h+.4,L.b[2]-11,BOXM(0x5a4a42),0);}
    for(let i=0;i<7;i++){const x=L.b[0]+2+i*(W-4)/6,h=9+rnd()*8;building(g,x,L.b[3]+14+rnd()*3,6,h,8,wt,1,cols[(i+3)%6]);}
    for(let x=L.b[0]+4;x<L.b[1];x+=10){tree(g,x,L.b[3]+1.6,.8,0x4a9a4a);}
    for(let x=L.b[0]+8;x<L.b[1];x+=18)lamp(g,x,L.b[2]-1.2,6,0xffffff,1);
    B(g,2.8,2.6,.1,L.b[1]-8,1.6,L.b[3]+.5,BOXM(0x3a6ea5),0);B(g,3.2,.15,1.2,L.b[1]-8,3,L.b[3]+.8,BOXM(0x555),0);
  }
  g.add(new T3.Mesh(new T3.BoxGeometry(.1,.1,.1),new T3.MeshBasicMaterial({visible:false})));
  scene.environment=envs;if(k!==1)scene.background=null;
  return{g,sun,sky};
}
/* ---------- niveau ---------- */
function mkVan(c){const g=new T3.Group(),p=mat('pp'+c+'_v',()=>paintMat(c,0));
  const b=new T3.Mesh(new T3.BoxGeometry(5.0,1.7,2.0),p);b.position.set(0,1.15,0);b.castShadow=true;g.add(b);
  const cab=new T3.Mesh(new T3.BoxGeometry(1.6,.9,2.0),p);cab.position.set(1.7,2.15,0);g.add(cab);
  const gm=glassMat(1);const w=new T3.Mesh(new T3.BoxGeometry(.12,.7,1.7),gm);w.position.set(2.5,2.15,0);g.add(w);
  g.add(Object.assign(new T3.Mesh(new T3.PlaneGeometry(2.6,2.4),mat('blob',()=>BLOB().clone())),{rotation:new T3.Euler(-Math.PI/2,0,0),position:new T3.Vector3(0,.02,0)}));
  const tm=mat('tm',()=>stdm(0x15161a,.85,0));for(const x of [1.6,-1.6])for(const z of [.9,-.9]){const t=new T3.Mesh(new T3.CylinderGeometry(.38,.38,.3,14),tm);t.rotation.x=Math.PI/2;t.position.set(x,.38,z);g.add(t);}
  g.add(new T3.Mesh(new T3.BoxGeometry(.06,.14,1.6),mat('lt',()=>new T3.MeshBasicMaterial({color:0xffffff}))).translateX(2.52).translateY(.95));
  return g;}
function mkObs(o,env){
  const t=o.t;let m;
  if(t==='car'){m=buildCar({m:o.m,c:o.c,f:(o.c%3),t:1,r:0,rc:0xb0b4bc,s:0,fx:0},true);}
  else if(t==='van'){m=mkVan(o.c);}
  else if(t==='pillar'){m=new T3.Group();const H=env===1?4.4:2.2;const tx=ctex(64,128,(c,w,h)=>{c.fillStyle='#8b8f99';c.fillRect(0,0,w,h);c.fillStyle='#ffc400';for(let i=-2;i<8;i++){c.beginPath();c.moveTo(0,h*.78+i*14);c.lineTo(w,h*.78+i*14-14);c.lineTo(w,h*.78+i*14);c.lineTo(0,h*.78+i*14+14);c.fill();}c.fillStyle='#8b8f99';c.fillRect(0,0,w,h*.6);});
    const b=new T3.Mesh(new T3.BoxGeometry(o.l,H,o.w),new T3.MeshStandardMaterial({color:0xffffff,roughness:.85,map:null}));b.material.color.set(0x8b8f99);b.position.y=H/2;b.castShadow=true;m.add(b);
    const st=new T3.Mesh(new T3.BoxGeometry(o.l+.02,.7,o.w+.02),new T3.MeshStandardMaterial({color:0xffc400,roughness:.6}));st.position.y=.35;m.add(st);}
  else if(t==='cone'){m=new T3.Group();const c=new T3.Mesh(new T3.ConeGeometry(.24,.7,14),stdm(0xff6a00,.6,0));c.position.y=.4;c.castShadow=true;m.add(c);const s=new T3.Mesh(new T3.CylinderGeometry(.14,.18,.14,14),stdm(0xffffff,.6,0));s.position.y=.4;m.add(s);const bs=new T3.Mesh(new T3.BoxGeometry(.55,.05,.55),stdm(0x222,.7,0));bs.position.y=.03;m.add(bs);}
  else if(t==='barrier'){m=new T3.Group();const b=new T3.Mesh(new T3.BoxGeometry(o.l,.8,o.w),stdm(0xe6e6e6,.7,0));b.position.y=.4;b.castShadow=true;m.add(b);const st=new T3.Mesh(new T3.BoxGeometry(o.l+.02,.18,o.w+.02),stdm(0xe03a2a,.6,0));st.position.y=.55;m.add(st);}
  else if(t==='bin'){m=new T3.Group();const b=new T3.Mesh(new T3.CylinderGeometry(.4,.36,.95,14),stdm(0x2f7d4a,.7,0));b.position.y=.48;b.castShadow=true;m.add(b);}
  else if(t==='planter'){m=new T3.Group();const b=new T3.Mesh(new T3.BoxGeometry(o.l,.5,o.w),stdm(0xb8a58a,.9,0));b.position.y=.25;b.castShadow=true;m.add(b);const s=new T3.Mesh(new T3.IcosahedronGeometry(Math.min(o.l,o.w)*.45,1),stdm(0x3f9a45,.9,0,{flatShading:true}));s.position.y=.9;m.add(s);}
  else if(t==='cart'){m=new T3.Group();const b=new T3.Mesh(new T3.BoxGeometry(o.l,.5,o.w),new T3.MeshStandardMaterial({color:0xc9ccd4,metalness:.8,roughness:.3,transparent:true,opacity:.7}));b.position.y=.75;m.add(b);const bs=new T3.Mesh(new T3.BoxGeometry(o.l,.06,o.w),stdm(0x444,.6,.5));bs.position.y=.3;m.add(bs);}
  else if(t==='gate'){m=new T3.Group();const zlen=o.l;const post=new T3.Mesh(new T3.BoxGeometry(.5,1.5,.5),stdm(0x2b9dff,.5,.2));post.position.set(0,.75,-zlen/2-.3);m.add(post);
    const arm=new T3.Group();arm.position.set(0,1.2,-zlen/2);const ab=new T3.Mesh(new T3.BoxGeometry(.14,.16,zlen),new T3.MeshStandardMaterial({map:ctex(256,16,(c,w,h)=>{for(let i=0;i<16;i++){c.fillStyle=i%2?'#fff':'#e03a2a';c.fillRect(i*16,0,16,h);}}),roughness:.5}));ab.position.z=zlen/2;arm.add(ab);m.add(arm);m.userData.arm=arm;m.userData.len=zlen;}
  else m=new T3.Group();
  return m;
}
const GATE={per:6,closed:2.4};
const gateClosed=t=>t<0?true:(t%GATE.per)<GATE.closed;
function buildLevel(i){
  const L=LV[i%LV.length];
  clearWorld();
  const E=buildEnv(L);world.add(E.g);
  const objs=[],cols=[];
  for(const o of L.obs){const m=mkObs(o,L.env);m.position.set(o.x,0,o.z);
    if(o.t==='gate'){m.rotation.y=0;m.position.set(o.x,0,o.z);m.rotation.y=-Math.PI/2;m.rotation.y=0;m.userData.o=o;
      // le groupe est orienté selon l'axe z (long axe de la barrière) : post côté -z
      objs.push(m);}
    else m.rotation.y=-o.a;
    world.add(m);if(o.t!=='gate')objs.push(m);
    cols.push({x:o.x,z:o.z,a:o.a,hl:o.l/2,hw:o.w/2,gate:o.t==='gate'});}
  const x0=L.b[0],x1=L.b[1],z0=L.b[2],z1=L.b[3],tk=1;
  [[(x0+x1)/2,z0-tk/2,(x1-x0)/2+tk,tk/2],[(x0+x1)/2,z1+tk/2,(x1-x0)/2+tk,tk/2],[x0-tk/2,(z0+z1)/2,tk/2,(z1-z0)/2+tk],[x1+tk/2,(z0+z1)/2,tk/2,(z1-z0)/2+tk]].forEach(c=>cols.push({x:c[0],z:c[1],a:0,hl:c[2],hw:c[3]}));
  // place cible
  const S=L.slot,tg=new T3.Group();
  const tt=ctex(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='#6cf09a';c.lineWidth=14;c.strokeRect(8,8,w-16,h-16);c.fillStyle='rgba(108,240,154,.22)';c.fillRect(8,8,w-16,h-16);c.fillStyle='rgba(255,255,255,.95)';c.font="900 110px Arial";c.textAlign='center';c.textBaseline='middle';c.fillText('P',w/2,h/2);});
  const tp=new T3.Mesh(new T3.PlaneGeometry(S.w,S.l),new T3.MeshBasicMaterial({map:tt,transparent:true,depthWrite:false,blending:T3.AdditiveBlending}));tp.rotation.x=-Math.PI/2;tp.rotation.z=-(S.a-Math.PI/2)*0;tp.position.y=.04;
  tp.rotation.set(-Math.PI/2,0,0);tg.add(tp);
  const bm=new T3.Mesh(new T3.CylinderGeometry(S.w*.46,S.w*.46,9,20,1,true),new T3.MeshBasicMaterial({color:0x6cf09a,transparent:true,opacity:.2,blending:T3.AdditiveBlending,depthWrite:false,side:T3.DoubleSide}));bm.position.y=4.5;tg.add(bm);
  tg.position.set(S.x,0,S.z);world.add(tg);
  const arrow=new T3.Mesh(new T3.ConeGeometry(.45,1.1,4),new T3.MeshBasicMaterial({color:0xffd34a}));arrow.rotation.z=-Math.PI/2;
  const ag=new T3.Group();ag.add(arrow);arrow.position.x=1.4;world.add(ag);
  lvObj={L,cols,objs,tg,tp,bm,ag,sun:E.sun};
  if(E.sun&&E.sun.castShadow)E.sun.shadow.needsUpdate=true;
  return lvObj;
}
function clearWorld(){tickers=[];if(sky){world.remove(sky);sky=null;}while(world.children.length){const c=world.children[0];world.remove(c);}lvObj=null;}
function showLevelSky(){if(sky&&!sky.parent)world.add(sky);}
function updGates(t){if(!lvObj)return;for(const m of lvObj.objs){if(m.userData&&m.userData.arm){const cl=gateClosed(t);const a=m.userData.arm,tgt=cl?0:Math.PI/2.2;a.rotation.x=lerp(a.rotation.x,-tgt,.2);}}
  for(const c of lvObj.cols)if(c.gate)c.off=!gateClosed(t);}
/* ---------- showroom ---------- */
function buildShow(){
  while(showroom.children.length)showroom.remove(showroom.children[0]);
  const floor=new T3.Mesh(new T3.CircleGeometry(60,48),new T3.MeshStandardMaterial({color:0x0c1020,roughness:.22,metalness:.6,envMapIntensity:1}));floor.rotation.x=-Math.PI/2;showroom.add(floor);
  const plat=new T3.Mesh(new T3.CylinderGeometry(4.2,4.4,.25,48),new T3.MeshStandardMaterial({color:0x1b2236,roughness:.3,metalness:.7}));plat.position.y=.12;showroom.add(plat);
  const ring=new T3.Mesh(new T3.TorusGeometry(4.3,.07,8,64),new T3.MeshBasicMaterial({color:0xff7a1a}));ring.rotation.x=Math.PI/2;ring.position.y=.26;showroom.add(ring);
  const ring2=new T3.Mesh(new T3.TorusGeometry(5.6,.05,8,64),new T3.MeshBasicMaterial({color:0x2b9dff}));ring2.rotation.x=Math.PI/2;ring2.position.y=.04;showroom.add(ring2);
  const wallM=new T3.MeshStandardMaterial({color:0x0a0e1c,roughness:.8,metalness:.2,side:T3.BackSide});const cyl=new T3.Mesh(new T3.CylinderGeometry(26,26,16,40,1,true),wallM);cyl.position.y=8;showroom.add(cyl);
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2,c=i%2?0xff7a1a:0x2b9dff;const s=new T3.Mesh(new T3.BoxGeometry(.25,9,.25),new T3.MeshBasicMaterial({color:new T3.Color(c).multiplyScalar(2.4)}));s.position.set(Math.cos(a)*25,5,Math.sin(a)*25);showroom.add(s);}
  const hl=new T3.Mesh(new T3.BoxGeometry(40,.2,.2),new T3.MeshBasicMaterial({color:new T3.Color(0xffffff).multiplyScalar(2)}));hl.position.set(0,11,-12);showroom.add(hl);
  const hl2=hl.clone();hl2.position.set(0,11,12);showroom.add(hl2);
  const l1=new T3.SpotLight(0xffffff,90,40,.7,.5,1.2);l1.position.set(6,12,8);l1.target.position.set(0,.5,0);showroom.add(l1,l1.target);
  const l2=new T3.SpotLight(0x7fb8ff,70,40,.8,.6,1.2);l2.position.set(-9,9,-6);l2.target.position.set(0,.5,0);showroom.add(l2,l2.target);
  const l3=new T3.PointLight(0xff7a1a,26,20,1.6);l3.position.set(0,1.2,-7);showroom.add(l3);
  showroom.add(new T3.HemisphereLight(0x8899cc,0x101018,.5));
  return{ring,ring2};
}
