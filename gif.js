<style>
.gifmsg{display:block;max-width:100%;width:auto;max-height:170px;border-radius:10px;margin-top:4px;background:rgba(128,128,128,.25)}
.atgb{flex:none;font:800 12px/1 system-ui,sans-serif;border:2px solid currentColor;border-radius:8px;padding:5px 7px;background:transparent;color:inherit;cursor:pointer;opacity:.9;align-self:center}
.atgb:hover{opacity:1}.atgb:disabled{opacity:.4;cursor:default}
#atgp{position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:9000;width:min(430px,calc(100vw - 16px));height:min(62vh,480px);display:flex;flex-direction:column;gap:8px;padding:10px;border-radius:16px;background:#12163f;color:#EAF0FF;border:1px solid rgba(120,160,255,.55);box-shadow:0 14px 40px rgba(0,0,0,.55);font:600 14px system-ui,sans-serif}
#atgp[hidden]{display:none}
#atgp .hd{display:flex;gap:8px}
#atgp input{flex:1;min-width:0;min-height:40px;border-radius:10px;border:2px solid rgba(120,160,255,.5);background:rgba(6,10,38,.9);color:#fff;padding:0 10px;font:500 15px system-ui,sans-serif}
#atgp button.x{border:0;background:rgba(255,255,255,.12);color:#fff;border-radius:10px;padding:0 12px;font-size:16px;cursor:pointer}
#atgp .gr{flex:1;min-height:0;overflow-y:auto;columns:3;column-gap:6px}
#atgp .gr button{display:block;width:100%;margin:0 0 6px;padding:0;border:0;border-radius:8px;overflow:hidden;background:#222;cursor:pointer;break-inside:avoid}
#atgp .gr img{display:block;width:100%;height:auto}
#atgp .ms{grid-column:1/-1;padding:14px;text-align:center;opacity:.85;column-span:all}
#atgp .ft{display:flex;justify-content:space-between;gap:8px;font-size:11px;opacity:.8}
#atgp .ft a{color:#8FE8FF}
#atgp .lk{display:flex;gap:6px}
#atgp .lk button{border:0;border-radius:10px;background:#2B86EE;color:#fff;font-weight:800;padding:0 12px;cursor:pointer}
@media (max-width:420px){#atgp .gr{columns:2}}
</style>
<script>
(function(){
  var KEY=window.AT_GIPHY||'';
  var RE=/^\[gif:([A-Za-z0-9]{5,30})\]$/;
  function is(t){return typeof t==='string'&&RE.test(t.trim());}
  function id(t){var m=RE.exec(String(t).trim());return m?m[1]:null;}
  function el(t){
    var g=id(t),i=document.createElement('img');
    i.className='gifmsg';i.alt='GIF';i.loading='lazy';i.referrerPolicy='no-referrer';
    i.src='https://media.giphy.com/media/'+g+'/giphy.gif';
    i.addEventListener('load',function(){var li=i.closest('li'),ul=li&&li.parentElement;if(ul&&li===ul.lastElementChild)ul.scrollTop=ul.scrollHeight;});
    i.addEventListener('error',function(){i.replaceWith(document.createTextNode('🎞 GIF indisponible'));});
    return i;
  }
  function prev(t){return is(t)?'🎞 GIF':t;}
  function parseLink(s){
    s=String(s||'').trim();var m;
    if(/^[A-Za-z0-9]{5,30}$/.test(s))return s;
    if((m=/giphy\.com\/(?:media|embed)\/(?:[^\/?#]*\/)?([A-Za-z0-9]{5,30})(?:[\/?#.]|$)/.exec(s)))return m[1];
    if((m=/giphy\.com\/(?:gifs|stickers|clips)\/([^\/?#]+)/.exec(s))){var seg=m[1],p=seg.split('-');return /^[A-Za-z0-9]{5,30}$/.test(p[p.length-1])?p[p.length-1]:null;}
    if((m=/i\.giphy\.com\/(?:media\/)?([A-Za-z0-9]{5,30})/.exec(s)))return m[1];
    return null;
  }
  var pop=null,cb=null,tm=null,gr,q,ms;
  function build(){
    pop=document.createElement('div');pop.id='atgp';pop.hidden=true;pop.setAttribute('role','dialog');pop.setAttribute('aria-label','Choisir un GIF');
    pop.innerHTML='<div class="hd"><input type="search" placeholder="'+(KEY?'Rechercher un GIF…':'Coller un lien GIPHY…')+'" aria-label="Rechercher un GIF"><button class="x" type="button" aria-label="Fermer">✕</button></div><div class="gr"></div><div class="ft"><span>Propulsé par <a href="https://giphy.com" target="_blank" rel="noopener">GIPHY</a></span><span></span></div>';
    q=pop.querySelector('input');gr=pop.querySelector('.gr');ms=pop.querySelector('.ft span:last-child');
    pop.querySelector('.x').addEventListener('click',close);
    q.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(function(){KEY?load(q.value.trim()):0;},380);});
    q.addEventListener('keydown',function(e){if(e.key==='Escape'){close();return;}if(e.key==='Enter'){e.preventDefault();var g=parseLink(q.value);if(g)choose(g);}});
    document.body.append(pop);
    document.addEventListener('mousedown',function(e){if(pop&&!pop.hidden&&!e.target.closest('#atgp,.atgb'))close();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&pop&&!pop.hidden)close();});
  }
  function msg(t){gr.innerHTML='';var d=document.createElement('div');d.className='ms';d.textContent=t;gr.append(d);}
  function choose(g){var f=cb;close();if(f)f(g);}
  function load(term){
    if(!KEY){msg('Colle un lien GIPHY (giphy.com) puis appuie sur Entrée.');return;}
    msg('Chargement…');
    var u='https://api.giphy.com/v1/gifs/'+(term?'search':'trending')+'?api_key='+encodeURIComponent(KEY)+'&limit=30&rating=pg-13&lang=fr'+(term?'&q='+encodeURIComponent(term):'');
    fetch(u).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(function(j){
      var a=(j&&j.data)||[];gr.innerHTML='';
      if(!a.length){msg('Aucun GIF trouvé.');return;}
      a.forEach(function(x){
        var im=x.images&&(x.images.fixed_width_small||x.images.fixed_width||x.images.downsized);if(!im||!/^[A-Za-z0-9]{5,30}$/.test(x.id||''))return;
        var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Envoyer ce GIF');
        var i=document.createElement('img');i.loading='lazy';i.alt=x.title||'GIF';i.referrerPolicy='no-referrer';i.src=im.url;
        b.append(i);b.addEventListener('click',function(){choose(x.id);});gr.append(b);
      });
    }).catch(function(){msg('GIFs indisponibles pour le moment.');});
  }
  function open(fn){
    if(!pop)build();cb=fn;pop.hidden=false;q.value='';load('');
    if(!KEY)msg('Colle un lien GIPHY (giphy.com) puis appuie sur Entrée.');
    setTimeout(function(){if(!matchMedia('(hover:none)').matches)q.focus();},30);
  }
  function close(){if(pop)pop.hidden=true;cb=null;}
  function attach(form){
    if(form.dataset.atgif)return;
    var inp=form.querySelector('input:not([type=hidden]):not([type=checkbox]):not([type=radio])');if(!inp)return;
    form.dataset.atgif='1';
    var b=document.createElement('button');b.type='button';b.className='atgb';b.textContent='GIF';b.title='Envoyer un GIF';b.setAttribute('aria-label','Envoyer un GIF');
    b.addEventListener('click',function(){
      if(inp.disabled)return;
      open(function(g){
        var keep=inp.value;inp.value='[gif:'+g+']';
        if(form.requestSubmit)form.requestSubmit();else form.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));
        if(inp.value==='[gif:'+g+']')return;
        inp.value=keep;
      });
    });
    var sub=form.querySelector('[type=submit],button:not([type=button])');
    if(sub)sub.parentNode.insertBefore(b,sub);else form.append(b);
  }
  function scan(root){
    var fs=[];
    if(root.matches&&root.matches('form'))fs.push(root);
    if(root.querySelectorAll)root.querySelectorAll('form').forEach(function(f){fs.push(f);});
    fs.forEach(function(f){if(f.matches('#chat-form,#ch-form,.hm-form')||f.querySelector('#dm-in'))attach(f);});
  }
  function start(){
    scan(document);
    new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1)scan(n);});});}).observe(document.body,{childList:true,subtree:true});
  }
  window.ATGIF={is:is,el:el,prev:prev};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
</script>
