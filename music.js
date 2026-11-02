<style>
#atm{position:fixed;left:max(10px,env(safe-area-inset-left));bottom:max(10px,env(safe-area-inset-bottom));z-index:90;display:flex;align-items:center;gap:8px;font:600 13px system-ui,sans-serif}
#atm .b{width:38px;height:38px;border-radius:50%;border:2px solid rgba(255,255,255,.55);background:rgba(20,10,60,.78);color:#fff;font-size:19px;cursor:pointer;display:grid;place-items:center;backdrop-filter:blur(6px);box-shadow:0 4px 14px rgba(0,0,0,.35);padding:0}
#atm .b.off{opacity:.65}
#atm .p{display:none;align-items:center;gap:8px;background:rgba(20,10,60,.85);color:#fff;border:2px solid rgba(255,255,255,.35);border-radius:99px;padding:6px 14px 6px 10px;backdrop-filter:blur(6px)}
#atm.open .p{display:flex}
#atm input[type=range]{width:110px;accent-color:#ffd23f;margin:0}
#atm .m{border:0;background:none;color:#fff;font-size:18px;cursor:pointer;padding:0}
</style>
<div id="atm"><button class="b" type="button" id="atm-b" aria-label="Musique">🎵</button><div class="p"><button class="m" type="button" id="atm-m" aria-label="Couper la musique">🔊</button><input type="range" id="atm-v" min="0" max="100" step="1" aria-label="Volume de la musique"></div></div>
<script>
(function(){
if(window.ATMUSIC)return;
var K='atm_vol',KO='atm_on',KT='atm_t';
function g(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function s(k,v){try{localStorage.setItem(k,String(v));}catch(e){}}
var vol=parseFloat(g(K));if(isNaN(vol))vol=.3;vol=Math.max(0,Math.min(1,vol));
var on=g(KO)!=='0',duck=1,a=new Audio('sounds/music.mp3'),started=false;
a.loop=true;a.preload='auto';
var t0=parseFloat(g(KT));
a.addEventListener('loadedmetadata',function(){if(t0>0&&t0<a.duration-3){try{a.currentTime=t0;}catch(e){}}});
var $=function(i){return document.getElementById(i);};
function apply(){a.volume=Math.max(0,Math.min(1,vol*duck));var b=$('atm-b'),m=$('atm-m'),v=$('atm-v');
 if(b){b.classList.toggle('off',!on||vol===0);b.textContent=(!on||vol===0)?'🔇':'🎵';}
 if(m)m.textContent=(!on||vol===0)?'🔇':'🔊';
 if(v)v.value=Math.round(vol*100);}
function play(){if(!on||vol===0||document.hidden)return;var p=a.play();if(p&&p.catch)p.catch(function(){});}
function pause(){a.pause();}
function sync(){if(on&&vol>0&&!document.hidden)play();else pause();apply();}
['pointerdown','keydown','touchstart'].forEach(function(e){document.addEventListener(e,function h(){if(!started){started=true;}sync();if(!a.paused){['pointerdown','keydown','touchstart'].forEach(function(x){document.removeEventListener(x,h,true);});}},true);});
document.addEventListener('visibilitychange',sync);
setInterval(function(){if(!a.paused)s(KT,a.currentTime);},1500);
window.addEventListener('pagehide',function(){s(KT,a.currentTime);});
var root=$('atm');
$('atm-b').addEventListener('click',function(){root.classList.toggle('open');});
$('atm-m').addEventListener('click',function(){if(vol===0){vol=.3;s(K,vol);}on=!(on&&vol>0)?true:false;if(on&&vol===0)vol=.3;s(KO,on?'1':'0');sync();});
$('atm-v').addEventListener('input',function(e){vol=e.target.value/100;s(K,vol);if(vol>0&&!on){on=true;s(KO,'1');}sync();});
window.ATMUSIC={duck:function(f){duck=f;apply();},sync:sync};
apply();sync();
})();
</script>
