// Atelier Gaming — serveur temps réel de Kart Racers (Cloudflare Durable Object + WebSocket hibernation)
const ROOMS=[1,2,3,4],MAXP=6;
export class KartHub{
  constructor(ctx,env){this.ctx=ctx;this.env=env;ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping','pong'));}
  async fetch(req){
    if(req.headers.get('Upgrade')!=='websocket')return new Response('WebSocket only',{status:426});
    const pair=new WebSocketPair(),c=pair[0],s=pair[1];
    this.ctx.acceptWebSocket(s);s.serializeAttachment({id:'',name:'',spec:null,room:0,t:0});
    return new Response(null,{status:101,webSocket:c});
  }
  live(){return this.ctx.getWebSockets().filter(w=>w.readyState===1);}
  att(w){try{return w.deserializeAttachment()||{};}catch(e){return{};}}
  members(room){const out=[];for(const w of this.live()){const a=this.att(w);if(a.id&&a.room===room)out.push(a);}return out.sort((x,y)=>x.t-y.t||(x.id<y.id?-1:1));}
  sendAll(list,obj){const m=JSON.stringify(obj);for(const w of list){try{w.send(m);}catch(e){}}}
  inRoom(room){return this.live().filter(w=>{const a=this.att(w);return a.id&&a.room===room;});}
  roomUpdate(room){if(!room)return;this.sendAll(this.inRoom(room),{k:'room',n:room,members:this.members(room).slice(0,MAXP).map(a=>({id:a.id,name:a.name,spec:a.spec,t:a.t}))});}
  roomsUpdate(){const r={};for(const n of ROOMS)r[n]=this.members(n).map(a=>({id:a.id,name:a.name,col:(a.spec&&a.spec.col)||0}));this.sendAll(this.live(),{k:'rooms',r});}
  async webSocketMessage(ws,msg){
    if(typeof msg!=='string'||msg.length>6000)return;
    let m;try{m=JSON.parse(msg);}catch(e){return;}
    const a=this.att(ws);
    if(m.k==='hi'){
      const id=String(m.uid||'').slice(0,40);if(!id)return;
      for(const w of this.live()){if(w!==ws&&this.att(w).id===id){try{w.close(1000,'replaced');}catch(e){}}}
      const spec=JSON.stringify(m.spec||{}).length<500?m.spec:null;
      const na={id,name:String(m.name||'?').slice(0,16),spec,room:a.room||0,t:a.t||0};ws.serializeAttachment(na);this.roomsUpdate();this.roomUpdate(na.room);
    }else if(!a.id)return;
    else if(m.k==='join'){
      const old=a.room,room=ROOMS.includes(m.room)?m.room:0;if(!room)return;
      const t=(typeof m.t==='number'&&m.t>0&&Math.abs(m.t-Date.now())<600000)?m.t:Date.now();
      ws.serializeAttachment(Object.assign({},a,{room,t}));this.roomUpdate(old);this.roomUpdate(room);this.roomsUpdate();
    }else if(m.k==='leave'){
      const old=a.room;ws.serializeAttachment(Object.assign({},a,{room:0,t:0}));this.roomUpdate(old);this.roomsUpdate();
    }else if(m.k==='start'){
      const ms=this.members(a.room).slice(0,MAXP);if(!a.room||!ms.length||ms[0].id!==a.id)return;
      const rid=Date.now();this.sendAll(this.inRoom(a.room),{k:'ctl',c:{rid,room:a.room,players:ms.map(p=>({id:p.id,name:p.name,spec:p.spec})),nb:Math.max(0,MAXP-ms.length)}});
    }else if((m.k==='st'||m.k==='bots')&&a.room&&m.d){
      const out=JSON.stringify({k:m.k,u:a.id,d:m.d});for(const w of this.inRoom(a.room)){if(w!==ws){try{w.send(out);}catch(e){}}}
    }
  }
  async webSocketClose(ws){try{ws.close();}catch(e){}const a=this.att(ws);this.roomUpdate(a.room);this.roomsUpdate();}
  async webSocketError(ws){const a=this.att(ws);this.roomUpdate(a.room);this.roomsUpdate();}
}
export default{
  async fetch(req,env){
    const u=new URL(req.url);
    if(u.pathname==='/kart-ws')return env.KART.get(env.KART.idFromName('hub')).fetch(req);
    return env.ASSETS.fetch(req);
  }
};
