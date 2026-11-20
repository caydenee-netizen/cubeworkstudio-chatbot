/* The update: 12 new pad skins (4 animated) and a skin preview in the Garage. Added only once the update is on. */
(function(){
var SK=[
 {i:43,n:'Sunset',css:'linear-gradient(180deg,#2b1055,#c9487b 55%,#ffb347)'},
 {i:44,n:'Ocean',css:'linear-gradient(180deg,#023e8a,#0096c7 55%,#90e0ef)'},
 {i:45,n:'Forest',css:'linear-gradient(180deg,#0b3d20,#2d7a3e 60%,#a7d676)'},
 {i:46,n:'Carbon',css:'repeating-linear-gradient(45deg,#15171b 0 4px,#23262c 4px 8px)'},
 {i:47,n:'Aurora',fx:1,css:'linear-gradient(180deg,#06141f,#0a2a3a)'},
 {i:48,n:'Lava Flow',fx:1,css:'linear-gradient(180deg,#1a0603,#3a0e06)'},
 {i:49,n:'Scanlines',fx:1,css:'linear-gradient(180deg,#05110a,#0a2314)'},
 {i:50,n:'Pulse Ring',fx:1,css:'radial-gradient(circle at 50% 50%,#101a3a,#05070f)'},
 {i:51,n:'Rose Gold',css:'linear-gradient(135deg,#f7c6b6,#d98f7a 45%,#f9dccf 70%,#c9785f)'},
 {i:52,n:'Checkerboard',css:'conic-gradient(#e8e8e8 25%,#1b1b1b 0 50%,#e8e8e8 0 75%,#1b1b1b 0) 0 0/36px 36px'},
 {i:53,n:'Candy Stripes',css:'repeating-linear-gradient(135deg,#ff6fa5 0 14px,#fff 14px 28px)'},
 {i:54,n:'Midnight Grid',css:'linear-gradient(rgba(79,208,255,.35) 1px,transparent 1px) 0 0/28px 28px,linear-gradient(90deg,rgba(79,208,255,.35) 1px,transparent 1px) 0 0/28px 28px,#0b1020'}
];
var FX={}; SK.forEach(function(s){ if(s.fx) FX[s.i]=1; });
PL.fxSkin=function(i){ return !!FX[i]&&!!(PL.updOn&&PL.updOn()); };
PL.onUpd(function(){
  SK.forEach(function(s){ if(PL.skins.list.some(function(k){ return k.i===s.i; })) return; var o={i:s.i,n:s.n,ty:'forge',cost:s.fx?3500:s.i===51?3000:2000,css:s.css,need:'New pad skin'}; if(s.fx) o.fx=1; PL.skins.list.push(o); });
  /* six new car paints and six new trails (the race code now carries them) */
  (function addRace(n){ var E=window.CWRaceEngine; if(!E){ if(n<60) setTimeout(function(){ addRace(n+1); },250); return; }
  if(E&&E.CARDEF.length<=11){ [
    {n:'Sunset',cost:900,pal:['#ffb347','#c9487b','#2b1055','#ffd9a0','#c9487b','#ffb347']},
    {n:'Ocean',cost:900,pal:['#90e0ef','#0096c7','#023e8a','#f4f6f8','#0096c7','#023e8a']},
    {n:'Forest',cost:900,pal:['#a7d676','#2d7a3e','#0b3d20','#f4f6f8','#2d7a3e','#0b3d20']},
    {n:'Carbon',cost:1100,pal:['#23262c','#15171b','#3a3f47','#c5cad3','#15171b','#23262c']},
    {n:'Rose Gold',cost:1300,pal:['#f7c6b6','#d98f7a','#c9785f','#f9dccf','#d98f7a','#f7c6b6']},
    {n:'Lava',cost:1300,pal:['#ff5a1f','#3a0e06','#ffb21e','#ff2b2b','#3a0e06','#ff5a1f']}
  ].forEach(function(c){ E.CARDEF.push(c); }); }
  if(E&&E.TRAILDEF.length<=7){ [
    {n:'Flames',cost:900,c:['255,120,30','255,50,20'],ic:'🔥'},
    {n:'Ocean',cost:700,c:['60,170,255','0,220,200'],ic:'🌊'},
    {n:'Grass',cost:700,c:['120,220,90','40,160,70'],ic:'🍀'},
    {n:'Violet',cost:800,c:['180,110,255','255,120,230'],ic:'🔮'},
    {n:'Snow',cost:600,c:['255,255,255','210,230,255'],ic:'☁️'},
    {n:'Candy',cost:1200,c:['255,111,165','255,255,255'],ic:'🍬'}
  ].forEach(function(t){ E.TRAILDEF.push(t); }); }
  })(0);
  /* Garage preview: with Preview on, tapping a pad skin shows it on a sample pad instead of buying it */
  var V=PL.views.garage; if(!V||V._pv) return; V._pv=1; var o=V.show;
  V.show=function(el,h){ var r=o.apply(this,arguments); try{ var tab=(String(h||'').split('/')[1])||'cars'; if(tab!=='pads') return r; var host=el.querySelector('.wrap')||el, grid=host.querySelector('.grid,.items')||host;
    if(host.querySelector('#pvBox')) return r;
    var box=document.createElement('div'); box.id='pvBox'; box.className='pnl'; box.innerHTML='<label class="row" style="gap:8px"><input type="checkbox" id="pvOn"> Preview skins before buying</label><div id="pvPad" class="skx" style="display:none;margin-top:10px;height:120px"></div>';
    host.insertBefore(box,host.querySelector('.items,.grid')||host.firstChild);
    var on=box.querySelector('#pvOn'), pad=box.querySelector('#pvPad');
    host.addEventListener('click',function(e){ if(!on.checked) return; var b=e.target.closest('[data-k="pad"]'); if(!b) return; e.stopPropagation(); e.preventDefault(); var i=+b.getAttribute('data-i'), s=PL.skins.of(i); if(!s) return; pad.style.display=''; pad.style.background=s.css; pad.removeAttribute('data-sk'); pad.innerHTML=''; if(s.fx||(i>=40&&i<=42)){ pad.setAttribute('data-sk',i); pad.innerHTML='<div class="skfx"><i></i><i></i></div>'; } pad.insertAdjacentHTML('beforeend','<div style="position:relative;z-index:2;display:flex;align-items:center;justify-content:center;height:100%;font:700 34px/1 system-ui;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.6)">'+(CW.esc?CW.esc(s.n):s.n)+'</div>'); },true);
  }catch(e){ console.error(e); } return r; };
  if(/^#(garage|dash|race)/.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange'));
});
})();
