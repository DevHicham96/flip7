/* ===================== PARKING RUSH · serveur 1 contre 1 =====================
   Le serveur décide : matchmaking, salons privés, manche et niveau, départ commun,
   validation d'un stationnement (pose dans la place + temps plausible), score, abandons, classement. */
const PK_WIN=4,PK_MAXR=9,PK_CL=4.4,PK_CW=1.9,PK_GRACE=25000;
const pkOk=(x,z,a,S)=>{
  const ca=Math.cos(a),sa=Math.sin(a),sc=Math.cos(S.a),ss=Math.sin(S.a);
  let d=Math.abs(Math.atan2(Math.sin(a-S.a),Math.cos(a-S.a)));if(d>Math.PI/2)d=Math.PI-d;if(d>0.26)return false;
  for(const [u,v] of [[1,1],[1,-1],[-1,1],[-1,-1]]){
    const px=x+ca*u*PK_CL/2-sa*v*PK_CW/2,pz=z+sa*u*PK_CL/2+ca*v*PK_CW/2;
    const dx=px-S.x,dz=pz-S.z,al=dx*sc+dz*ss,ac=-dx*ss+dz*sc;
    if(Math.abs(al)>S.l/2+0.16||Math.abs(ac)>S.w/2+0.16)return false;
  }
  return true;
};
export class ParkHub{
  constructor(ctx,env){this.ctx=ctx;this.env=env;ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping','pong'));}
  async fetch(req){
    if(req.headers.get('Upgrade')!=='websocket')return new Response('WebSocket only',{status:426});
    const pair=new WebSocketPair(),c=pair[0],s=pair[1];
    this.ctx.acceptWebSocket(s);s.serializeAttachment({id:'',name:'',car:null,q:0,code:''});
    return new Response(null,{status:101,webSocket:c});
  }
  live(){return this.ctx.getWebSockets().filter(w=>w.readyState===1);}
  att(w){try{return w.deserializeAttachment()||{};}catch(e){return{};}}
  sock(id){for(const w of this.live())if(this.att(w).id===id)return w;return null;}
  tx(w,o){if(!w)return;try{w.send(JSON.stringify(Object.assign({T:Date.now()},o)));}catch(e){}}
  tid(id,o){this.tx(this.sock(id),o);}
  pub(m){return{id:m.id,ps:m.ps.map(p=>({id:p.id,name:p.name,car:p.car,on:!p.dc})),sc:m.sc,r:m.r,ph:m.ph,st:m.st,lv:Math.min(m.r,PLV.length-1),win:PK_WIN};}
  async getM(id){return id?await this.ctx.storage.get('M'+id):null;}
  async putM(m){await this.ctx.storage.put('M'+m.id,m);await this.sched();}
  async mOf(uid){const id=await this.ctx.storage.get('U'+uid);const m=await this.getM(id);return m&&m.ph!=='done'?m:null;}
  async sched(){
    const all=await this.ctx.storage.list({prefix:'M'});let t=0;
    for(const [,m] of all){if(m.ph==='done')continue;let d=m.dl||0;for(const p of m.ps)if(p.dc)d=Math.min(d||1e15,p.dc+PK_GRACE);if(d&&(!t||d<t))t=d;}
    if(t)await this.ctx.storage.setAlarm(Math.max(t,Date.now()+200));
  }
  async webSocketMessage(ws,msg){
    if(typeof msg!=='string'||msg.length>3000)return;
    let m;try{m=JSON.parse(msg);}catch(e){return;}
    const a=this.att(ws);
    if(m.k==='hi'){
      const id=String(m.uid||'').slice(0,40);if(!id)return;
      for(const w of this.live())if(w!==ws&&this.att(w).id===id){try{w.close(1000,'replaced');}catch(e){}}
      const car=JSON.stringify(m.car||{}).length<400?m.car:null;
      ws.serializeAttachment({id,name:String(m.name||'Joueur').slice(0,14),car,q:0,code:''});
      const M=await this.mOf(id);
      if(M){const i=M.ps.findIndex(p=>p.id===id);if(M.ps[i].dc){delete M.ps[i].dc;await this.putM(M);}
        this.tx(ws,{k:'resume',i,m:this.pub(M)});this.tid(M.ps[1-i].id,{k:'opp',on:true});}
      else this.tx(ws,{k:'hello'});
      return;
    }
    if(!a.id)return;
    if(m.k==='q'){
      ws.serializeAttachment(Object.assign({},a,{q:1,code:''}));
      for(const w of this.live()){const b=this.att(w);if(w!==ws&&b.q&&b.id!==a.id){await this.make(w,ws);return;}}
      this.tx(ws,{k:'queue',n:this.live().filter(w=>this.att(w).q).length});
    }else if(m.k==='qx'){ws.serializeAttachment(Object.assign({},a,{q:0,code:''}));
    }else if(m.k==='pc'){
      let c='';const A='ABCDEFGHJKMNPQRSTUVWXYZ';for(let i=0;i<4;i++)c+=A[Math.floor(Math.random()*A.length)];
      ws.serializeAttachment(Object.assign({},a,{q:0,code:c}));this.tx(ws,{k:'code',c});
    }else if(m.k==='pj'){
      const c=String(m.c||'').toUpperCase().slice(0,4);
      for(const w of this.live()){const b=this.att(w);if(w!==ws&&b.code&&b.code===c&&b.id!==a.id){await this.make(w,ws);return;}}
      this.tx(ws,{k:'err',e:'Code introuvable'});
    }else if(m.k==='lb'){
      const lb=(await this.ctx.storage.get('LB'))||{};const L=Object.entries(lb).map(([id,v])=>Object.assign({id},v)).sort((x,y)=>y.pts-x.pts||y.w-x.w);
      this.tx(ws,{k:'lb',top:L.slice(0,20).map((v,i)=>({r:i+1,n:v.n,w:v.w,l:v.l,pts:v.pts,me:v.id===a.id})),me:lb[a.id]||null,rank:L.findIndex(v=>v.id===a.id)+1});
    }else if(m.k==='rdy'||m.k==='nx'||m.k==='park'||m.k==='quit'||m.k==='pos'||m.k==='ms'){
      const M=await this.mOf(a.id);if(!M)return;const i=M.ps.findIndex(p=>p.id===a.id);if(i<0)return;
      if(m.k==='pos'){if(typeof m.x==='number')this.tid(M.ps[1-i].id,{k:'pos',x:m.x,z:m.z,a:m.a,s:m.s});return;}
      if(m.k==='ms'){this.tid(M.ps[1-i].id,{k:'ms',d:m.d});return;}
      if(m.k==='quit'){await this.finish(M,1-i,'ab');return;}
      if(m.k==='rdy'){if(M.ph!=='ready')return;M.rd1=M.rd1||[0,0];M.rd1[i]=1;if(M.rd1[0]&&M.rd1[1])await this.round(M);else await this.putM(M);return;}
      if(m.k==='nx'){if(M.ph!=='between')return;M.nx=M.nx||[0,0];M.nx[i]=1;if(M.nx[0]&&M.nx[1])await this.round(M);else{this.tid(M.ps[1-i].id,{k:'nxo'});await this.putM(M);}return;}
      if(m.k==='park'){
        if((M.ph!=='cd'&&M.ph!=='run')||m.r!==M.r)return;
        const lv=PLV[Math.min(M.r,PLV.length-1)],now=Date.now(),el=(now-M.st)/1000;
        if(el<lv.minT)return;
        if(!pkOk(+m.x,+m.z,+m.a,lv.slot))return;
        M.sc[i]++;M.rd.push({w:i,t:Math.round(el*100)/100});M.ph='between';M.nx=[0,0];M.dl=now+30000;
        await this.endRound(M,i,el,(m.c|0));return;
      }
    }
  }
  async make(w1,w2){
    const A=this.att(w1),B=this.att(w2);
    for(const w of [w1,w2]){const x=this.att(w);w.serializeAttachment(Object.assign({},x,{q:0,code:''}));}
    const id=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    const M={id,ps:[{id:A.id,name:A.name,car:A.car},{id:B.id,name:B.name,car:B.car}],sc:[0,0],r:0,ph:'ready',rd:[],dl:Date.now()+20000,st:0};
    await this.ctx.storage.put('U'+A.id,id);await this.ctx.storage.put('U'+B.id,id);await this.putM(M);
    this.tx(w1,{k:'match',i:0,m:this.pub(M)});this.tx(w2,{k:'match',i:1,m:this.pub(M)});
  }
  async round(M){
    const lv=PLV[Math.min(M.r,PLV.length-1)];
    M.ph='cd';M.st=Date.now()+3800;M.nx=[0,0];M.dl=M.st+lv.maxT*1000;await this.putM(M);
    for(const p of M.ps)this.tid(p.id,{k:'rnd',r:M.r,lv:Math.min(M.r,PLV.length-1),st:M.st,sc:M.sc});
  }
  async endRound(M,w,el,col){
    const over=M.sc[0]>=PK_WIN||M.sc[1]>=PK_WIN||M.r+1>=PK_MAXR;
    for(const p of M.ps)this.tid(p.id,{k:'rw',r:M.r,w,t:Math.round(el*100)/100,sc:M.sc,fin:over,c:col});
    if(over)await this.finish(M,M.sc[0]>M.sc[1]?0:M.sc[1]>M.sc[0]?1:-1,'',true);
    else{M.r++;await this.putM(M);}
  }
  async finish(M,w,why,silent){
    if(M.ph==='done')return;
    M.ph='done';
    if(why)for(const p of M.ps)this.tid(p.id,{k:'rw',r:M.r,w:-2,sc:M.sc,fin:true});
    for(const p of M.ps)this.tid(p.id,{k:'end',w,why:why||'',sc:M.sc,rd:M.rd});
    const lb=(await this.ctx.storage.get('LB'))||{};
    if(w>=0)for(let i=0;i<2;i++){const p=M.ps[i],e=lb[p.id]||{n:p.name,w:0,l:0,pts:0};e.n=p.name;if(i===w){e.w++;e.pts+=25;}else{e.l++;e.pts=Math.max(0,e.pts-10);}lb[p.id]=e;}
    const ks=Object.keys(lb);if(ks.length>300){ks.sort((x,y)=>lb[y].pts-lb[x].pts);for(const k of ks.slice(250))delete lb[k];}
    await this.ctx.storage.put('LB',lb);
    for(const p of M.ps)await this.ctx.storage.delete('U'+p.id);
    await this.ctx.storage.delete('M'+M.id);
  }
  async alarm(){
    const all=await this.ctx.storage.list({prefix:'M'}),now=Date.now();
    for(const [,M] of all){
      if(M.ph==='done')continue;
      const gone=M.ps.findIndex(p=>p.dc&&now-p.dc>=PK_GRACE);
      if(gone>=0){await this.finish(M,1-gone,'dc');continue;}
      if(!M.dl||now<M.dl)continue;
      if(M.ph==='ready'){await this.round(M);}
      else if(M.ph==='cd'||M.ph==='run'){M.rd.push({w:-1,t:0});M.ph='between';M.nx=[0,0];M.dl=now+30000;await this.endRound(M,-1,0,0);}
      else if(M.ph==='between'){M.r++;await this.round(M);}
    }
    await this.sched();
  }
  async webSocketClose(ws){try{ws.close();}catch(e){}await this.gone(ws);}
  async webSocketError(ws){await this.gone(ws);}
  async gone(ws){
    const a=this.att(ws);if(!a.id)return;
    if(this.sock(a.id)&&this.sock(a.id)!==ws)return;
    const M=await this.mOf(a.id);if(!M)return;const i=M.ps.findIndex(p=>p.id===a.id);if(i<0)return;
    M.ps[i].dc=Date.now();await this.putM(M);this.tid(M.ps[1-i].id,{k:'opp',on:false});
  }
}
