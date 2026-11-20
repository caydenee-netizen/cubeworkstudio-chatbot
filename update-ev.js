/* Launch-week event: pad skins 40-42 are given automatically by the server to players online in the first 7 days after release. */
(function(){
  var DAY=86400000, $=CW.$, esc=CW.esc;
  function info(){ var u=PL.live&&PL.live.upd; if(!u||!u.live||!u.rel) return null; var end=u.rel+7*DAY, now=(PL.now&&PL.now())||Date.now(); return {end:end,left:end-now,on:end>now}; }
  function own(i){ try{ return (PL.skins&&PL.skins.owned&&PL.skins.owned(i)); }catch(e){ return false; } }
  function fmt(ms){ var d=Math.floor(ms/DAY),h=Math.floor(ms%DAY/3600000),m=Math.floor(ms%3600000/60000); return d>0?d+'d '+h+'h':h+'h '+m+'m'; }
  function card(){
    var f=info(); if(!f) return null;
    var c=document.createElement('div'); c.className='card uev';
    var names=['Black Hole','Launch Day','Cube Confetti'];
    c.innerHTML='<h3>Launch Week Event</h3><div class="muted">'+(f.on?'Everyone online during launch week gets these 3 animated pad skins automatically. Ends in '+fmt(f.left)+'. After that they are gone forever.':'The launch week event has ended. These skins can never be earned again.')+'</div>'
     +'<div class="uev-g">'+[40,41,42].map(function(i,k){ return '<div><div class="skx" data-sk="'+i+'" style="background:'+((PL_SKINS.filter(function(s){return s.i===i;})[0]||{}).css||'#111')+'"><div class="skfx"><i></i><i></i></div></div>'+names[k]+'</div>'; }).join('')+'</div>'
     +'<div class="muted">Limited numbered editions. Equip them in Skins.</div>';
    return c;
  }
  function wrap(v){ var V=PL.views[v]; if(!V||V._ev) return; var o=V.show; V.show=function(el){ var r=o.apply(this,arguments); try{ var c=card(); if(c&&el) el.insertBefore(c,el.firstChild); }catch(e){} return r; }; V._ev=1; }
  PL.onUpd(function(){ wrap('home'); var h=location.hash.replace('#',''); if(h==='home'||!h) window.dispatchEvent(new HashChangeEvent('hashchange')); });
})();
