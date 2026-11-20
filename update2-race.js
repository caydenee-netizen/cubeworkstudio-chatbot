/* Update 2 racing: 6 more car paints, 7 more trails, and the Race Record panel on the Race page. */
(function(){
var $=CW.$, esc=CW.esc;
PL.onUpd2(function(){
  (function addRace(n){ var E=window.CWRaceEngine; if(!E||E.CARDEF.length<17||E.TRAILDEF.length<13){ if(n<80) setTimeout(function(){ addRace(n+1); },250); return; }
  if(E&&E.CARDEF.length<=17){ [
    {n:'Crimson',cost:1000,model:4,sw:['#e0314b','#7a0f22','#ff8095','#f4f6f8','#b3203a','#ffd1d9']},
    {n:'Teal',cost:1000,model:5,sw:['#1fb6a8','#0b5f58','#7de3d9','#f4f6f8','#138f84','#c9f5f1']},
    {n:'Violet',cost:1000,model:6,sw:['#9a5cf0','#4a1f9a','#d3b3ff','#f4f6f8','#7a3fd0','#ece0ff']},
    {n:'Silver',cost:1200,model:7,sw:['#d7dce3','#8f98a6','#f4f6f8','#5c6573','#b3bac5','#eef1f5']},
    {n:'Orange',cost:1000,model:8,sw:['#ff8a1f','#b34d00','#ffc07a','#f4f6f8','#e06a00','#ffe3c4']},
    {n:'Pink',cost:1000,model:9,sw:['#ff7ab8','#b3306f','#ffc2de','#f4f6f8','#e05599','#ffe6f1']}
  ].forEach(function(c){ E.CARDEF.push(c); }); }
  if(E&&E.TRAILDEF.length<=13){ [
    {n:'Bubbles',cost:700,c:['190,235,255','255,255,255'],ic:'●'},
    {n:'Gold dust',cost:900,c:['255,222,100','255,245,190'],ic:'●'},
    {n:'Pink mist',cost:800,c:['255,160,205','255,210,235'],ic:'●'},
    {n:'Green smoke',cost:800,c:['100,220,130','40,150,80'],ic:'●'},
    {n:'Purple glow',cost:900,c:['170,100,255','110,60,220'],ic:'●'},
    {n:'Red embers',cost:900,c:['255,90,60','190,30,20'],ic:'●'},
    {n:'Silver stars',cost:1400,c:['230,235,245','160,170,190'],ic:'★',star:1}
  ].forEach(function(t){ E.TRAILDEF.push(t); }); }

  })(0);

  /* Race Record: your results and badges */
  var RV=PL.views.race;
  if(RV&&!RV._r){ RV._r=1; var ro=RV.show;
    RV.show=function(el,h){ var r=ro.apply(this,arguments); try{ if(el.querySelector('#rRec')) return r; var wrap=el.querySelector('.wrap'); if(!wrap) return r;
      var box=document.createElement('div'); box.className='pnl'; box.id='rRec'; box.innerHTML='<h3 style="margin:0 0 8px">Your race record</h3><div id="rRecB" class="muted" style="font-size:14px">Loading…</div>';
      var anchor=el.querySelector('#rWatch')||wrap.querySelector('.crumbs'); wrap.insertBefore(box,anchor?anchor.nextSibling:wrap.firstChild);
      CW.call('/api/badges',{id:CW.devId()},8000).then(function(x){ var B=$('#rRecB'); if(!B) return; var v=x.ok&&x.data; if(!v||!v.defs){ B.textContent='Could not load your record.'; return; }
        var wr=v.races?Math.round(v.wins/v.races*100):0, got=v.got||{}, own=function(k){ return Array.isArray(got)?got.indexOf(k)>=0:!!got[k]; };
        B.innerHTML='<div class="row" style="gap:10px;flex-wrap:wrap"><span class="chipb"><b>'+v.races+'</b>&nbsp;races</span><span class="chipb"><b>'+v.wins+'</b>&nbsp;wins</span><span class="chipb"><b>'+wr+'%</b>&nbsp;win rate</span><span class="chipb"><b>'+(v.daily||0)+'</b>&nbsp;daily solves</span><span class="chipb"><b>'+(v.streak||0)+'</b>&nbsp;day streak</span></div>'
          +'<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px">'+v.defs.map(function(b){ var o=own(b.k); return '<span title="'+esc(b.n+' · '+b.d)+'" style="font-size:22px;'+(o?'':'filter:grayscale(1);opacity:.35')+'">'+b.e+'</span>'; }).join('')+'</div>'
          +'<p class="muted" style="font-size:12.5px;margin-top:6px">Faded badges are still to earn. Hold a badge for its name.</p>'; });
    }catch(e){ console.error(e); } return r; };
  }
  if(/^#(race|garage)/.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange'));
});
})();
