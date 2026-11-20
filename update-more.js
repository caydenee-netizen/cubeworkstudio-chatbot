/* The update: Settings page + tidier Rewards, watch live races, Solve Verdict compare. Runs only once the update is on. */
(function(){
var RXL={'🔥':'On fire','👏':'Nice','😂':'Ha','😱':'Wow','🏁':'Go','💨':'Fast'};
var $=CW.$, esc=CW.esc;
PL.onUpd(function(){
var RXL={'🔥':'On fire','👏':'Nice','😂':'Ha','😱':'Wow','🏁':'Go','💨':'Fast'};
  /* ---------- Settings (account, name, alerts, look, language) and a Rewards page that keeps only rewards ---------- */
  var R=PL.views.rewards; if(!R||R._m) return; R._m=1; var orig=R.show;
  function panels(el){ return [].slice.call(el.querySelectorAll('.grid2 > div > .pnl')); }
  function ttl(p){ var h=p.querySelector('h3'); return h?h.textContent:''; }
  R.show=function(el){ var r=orig.apply(this,arguments); try{
    panels(el).forEach(function(p){ var t=ttl(p); if(/^👤|^Your name|^App/.test(t)) p.style.display='none'; });
    var c=el.querySelector('.grid2 > div'); if(c){ var n=document.createElement('div'); n.className='pnl'; n.innerHTML='<div class="row"><span>Name, account and alerts are in</span><span class="sp"></span><a class="btn sm" href="#settings">⚙ Settings</a></div>'; c.insertBefore(n,c.firstChild); }
  }catch(e){ console.error(e); } return r; };
  PL.views.settings={show:function(el){ var r=orig.call(R,el); try{
    var h=el.querySelector('.crumbs h1'); if(h) h.textContent='Settings'; document.title='Settings · Cuber Tools · Cubeworkstudio';
    var g=el.querySelector('.grid2'); var cols=g?g.children:[]; if(cols[1]) cols[1].style.display='none';
    panels(el).forEach(function(p){ if(/^Level \d/.test(ttl(p))) p.style.display='none'; });
    var host=cols[0]; if(host){ var b=document.createElement('div'); b.className='pnl'; b.innerHTML='<h3>Look &amp; language</h3><div class="row" style="gap:8px;flex-wrap:wrap;margin-top:8px"><button class="btn sm" id="stTh" type="button">Switch light / dark</button><button class="btn sm" id="stLg" type="button">🌐 Language</button></div>';
      host.appendChild(b); $('#stTh').onclick=function(){ CW.toggleTheme(); }; $('#stLg').onclick=function(){ var l=document.getElementById('langBtn'); if(l) l.click(); else CW.toast('Language picker is not available.'); }; }
    if(host){ var ow=document.createElement('div'), isO=!!CW.ownerKeys(); ow.id='stOwn';
      if(isO){ ow.className='pnl'; ow.innerHTML='<h3>👑 Owner</h3><p class="muted" style="margin:4px 0 8px;font-size:13.5px">This device is signed in as the owner.</p><div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm pri" id="stOwO" type="button">Open owner panel</button><button class="btn sm" id="stOwX" type="button">Sign out on this device</button></div>'; }
      else { ow.style.cssText='text-align:center;margin:18px 0 4px'; ow.innerHTML='<button type="button" id="stOwO" style="background:none;border:0;padding:8px 12px;color:var(--ink3);font:500 12.5px var(--body);text-decoration:underline;cursor:pointer">Owner sign-in</button>'; }
      host.appendChild(ow);
      $('#stOwO').onclick=function(){ if(PL.owner) PL.owner(); else CW.toast('Owner panel is still loading. Try again.'); };
      var sx=$('#stOwX'); if(sx) sx.onclick=function(){ if(!confirm('Sign out of the owner panel on this device?')) return; CW.ownerSignOut(); CW.ls('cw_owner_dev',null); var c=document.getElementById('ownCrown'); if(c) c.remove(); CW.toast('Signed out on this device.'); PL.views.settings.show(el); }; }
  }catch(e){ console.error(e); } return r; }};
  var ch=document.querySelector('.pl-chips'), th=ch&&ch.querySelector('[data-theme-toggle]');
  if(ch&&!document.getElementById('hSet')){ var a=document.createElement('a'); a.className='chipb'; a.id='hSet'; a.href='#settings'; a.setAttribute('aria-label','Settings'); a.title='Settings'; a.textContent='⚙'; ch.insertBefore(a,th||null); }

  /* ---------- watch a live race ---------- */
  var RV=PL.views.race;
  if(RV&&!RV._w){ RV._w=1; var ro=RV.show;
    RV.show=function(el,h){ var r=ro.apply(this,arguments); try{ if(el.querySelector('#rWatch')) return r; var wrap=el.querySelector('.wrap'); if(!wrap) return r;
      var box=document.createElement('div'); box.className='pnl'; box.id='rWatch'; box.innerHTML='<div class="row"><h3 style="margin:0">👁 Watch live races</h3><span class="sp"></span><button class="btn sm" id="rwGo" type="button">Refresh</button></div><div id="rwL" class="muted" style="margin-top:8px;font-size:14px">Loading…</div>';
      var cr=wrap.querySelector('.crumbs'); wrap.insertBefore(box,cr?cr.nextSibling:wrap.firstChild); load();
      $('#rwGo').onclick=load; box.addEventListener('click',function(e){ var b=e.target.closest('[data-w]'); if(b) spectate(b.getAttribute('data-w')); });
      function load(){ CW.call('/api/race/watch',{id:CW.devId(),name:PL.name()},8000).then(function(x){ var L=$('#rwL'); if(!L) return; var rs=(x.ok&&x.data&&x.data.rooms)||[];
        L.innerHTML=rs.length?rs.map(function(q){ return '<div class="row" style="padding:6px 0;gap:8px"><span>Race #'+esc(String(q.num||''))+' · '+q.n+' racer'+(q.n===1?'':'s')+' · '+(q.status==='racing'?'<b style="color:var(--c-red)">racing now</b>':'starting soon')+(q.tour?' · tournament':'')+'</span><span class="sp"></span><button class="btn sm" data-w="'+esc(q.id)+'" type="button">Watch</button></div>'; }).join(''):'No races are running right now. Auto races start every 30 minutes.'; }); }
    }catch(e){ console.error(e); } return r; };
  }
  function spectate(id){ var sh=CW.sheet('<div class="hd"><h2>Live race</h2><button class="x" data-close aria-label="Close">✕</button></div><div id="spB" class="muted">Loading…</div>'), alive=true, tm=0;
    var cl=sh.querySelector('[data-close]'); function stop(){ alive=false; clearTimeout(tm); } sh.addEventListener('click',function(e){ if(e.target.closest('[data-close]')||e.target===sh) stop(); });
    sh.addEventListener('click',function(e){ var bb=e.target.closest('[data-bk]'); if(bb){ CW.call('/api/race/back',{id:CW.devId(),room:id,wi:+bb.getAttribute('data-bk')},6000).then(function(x){ if(x&&x.data&&x.data.ok){ CW.toast('Backed! If they win you get 15 tokens.'); clearTimeout(tm); poll(); } else CW.toast((x&&x.data&&x.data.error)||'Could not do that.'); }); return; } });
    sh.addEventListener('click',function(e){ var rb=e.target.closest('[data-rx]'); if(rb) CW.call('/api/race/react',{id:CW.devId(),room:id,e:rb.getAttribute('data-rx')},6000); });
    new MutationObserver(function(){
var RXL={'🔥':'On fire','👏':'Nice','😂':'Ha','😱':'Wow','🏁':'Go','💨':'Fast'}; if(!document.body.contains(sh)) stop(); }).observe(document.body,{childList:true});
    function poll(){ if(!alive) return; CW.call('/api/race/watch',{id:CW.devId(),name:PL.name(),room:id},8000).then(function(x){ var B=sh.querySelector('#spB'); if(!B||!alive) return;
      if(!x.ok||!x.data||!x.data.room){ B.textContent='This race has ended.'; alive=false; return; } var r=x.data.room, ps=(r.players||[]).slice().sort(function(a,b){ return (b.done!=null?1000:0)-(a.done!=null?1000:0)+(b.prog-a.prog); });
      B.innerHTML='<p style="margin:0 0 10px;font-size:14px">'+(r.status==='racing'?'Racing now':r.status==='lobby'?'Starting soon':'Finished')+' · '+ps.length+' racers · '+(r.watching||0)+' watching</p>'
        +ps.map(function(p){ var pc=Math.max(0,Math.min(100,p.done!=null?100:p.prog)); var pid=r.bk?(r.players||[]).indexOf(p):-1, nb=pid>=0?(r.bk[pid]||0):0; return '<div style="margin:8px 0"><div class="row" style="font-size:13.5px;gap:8px"><b>'+esc(p.name)+'</b>'+(r.bk?'<span class="muted" style="font-size:12px">'+(nb?nb+' backing':'')+'</span>':'')+'<span class="sp"></span>'+(r.bk&&pid>=0&&r.status!=='done'?(r.myBk===pid?'<span class="tag g">Your pick</span>':'<button class="btn sm" type="button" data-bk="'+pid+'">Back to win</button>'):'')+'<span class="mono muted">'+(p.done!=null?'Finished '+(p.done/1000).toFixed(2)+'s':Math.round(pc)+'%')+'</span></div><div class="prog"><i style="width:'+pc.toFixed(1)+'%"></i></div></div>'; }).join('')+((PL.updOn2&&PL.updOn2())?'<div class="row" style="gap:6px;flex-wrap:wrap;margin-top:12px">'+['🔥','👏','😂','😱','🏁','💨'].map(function(e){ return '<button class="btn sm" data-rx="'+e+'" type="button">'+RXL[e]+'</button>'; }).join('')+'</div><div class="muted" style="font-size:13px;margin-top:8px">'+(r.rx||[]).slice(-6).reverse().map(function(x){ return esc(x.n)+' · '+(RXL[x.e]||''); }).join(' · ')+'</div>':'');
      if(r.status==='done'||r.status==='finished'||r.results){ alive=false; return; } tm=setTimeout(poll,1500); }); }
    poll(); }

  /* ---------- Solve Verdict: compare with your previous analysis ---------- */
  var VV=PL.views.verdict, V=window.CWVerdict;
  if(VV&&V&&!VV._c){ VV._c=1; var vo=VV.show;
    VV.show=function(el){ var r=vo.apply(this,arguments); try{ var go=el.querySelector('#vdGo'); if(!go) return r; var f=go.onclick;
      go.onclick=function(){ var s=$('#vdS',el).value, q=$('#vdQ',el).value, t=Math.round(parseFloat($('#vdT',el).value)*1000)||0, res=V.analyse(s,q), prev=CW.lsJ('cw_vd_prev',null);
        f.apply(this,arguments);
        if(res&&res.ok&&res.cfop){ var cur={at:Date.now(),m:res.moves,t:t,ph:res.ph.map(function(p){ return [p.n,p.m]; })};
          if(prev&&(prev.m!==cur.m||prev.t!==cur.t)){ var o=$('#vdOut',el); if(o){ var d=function(a,b){ var x=a-b; return x===0?'same':(x>0?'+':'')+x; };
            var rows=cur.ph.map(function(p,i){ return '<div><b>'+esc(p[0])+'</b><span>'+p[1]+' moves ('+(prev.ph[i]?d(p[1],prev.ph[i][1]):'–')+')</span></div>'; }).join('');
            var tt=(t&&prev.t)?'<div><b>Time</b><span>'+(t/1000).toFixed(2)+' s ('+((t-prev.t)/1000>0?'+':'')+((t-prev.t)/1000).toFixed(2)+' s)</span></div>':'';
            var pn=document.createElement('div'); pn.className='pnl'; pn.innerHTML='<h3>Compared with your previous analysis</h3><div class="vd-list"><div><b>Moves</b><span>'+cur.m+' ('+d(cur.m,prev.m)+')</span></div>'+tt+rows+'</div><p class="muted" style="font-size:12.5px;margin-top:6px">Fewer moves is better. Stays on this device.</p>'; o.insertBefore(pn,o.firstChild); } }
          CW.setJ('cw_vd_prev',cur); } };
    }catch(e){ console.error(e); } return r; };
  }
  if(/^#(settings|rewards|race|verdict)/.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange'));
});
})();
