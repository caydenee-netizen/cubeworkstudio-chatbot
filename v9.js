/* Cuber Tools new look (design 9 "Liquid Glass"): dark glass panels over soft coloured lights, a glass side menu on wide screens
   and a new home page. The Chat and Shop corner buttons stay. Players can switch back to the classic look (cw_v9 = '0'). */
(function(){
var D=document, R=D.documentElement;
function on(){ try{ return localStorage.getItem('cw_v9b')==='1'; }catch(e){ return false; } }
var esc=function(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
var ACC={timer:'#3ddc84',learn:'#5b8cff',race:'#ff5a4e',dash:'#a07bff',garage:'#ffc533',clubs:'#33c7e0',mail:'#ff8a80',duels:'#ff9a4d',crates:'#ffc533',card:'#8fb4ff',cube3d:'#33c7e0',verdict:'#5b8cff',rewards:'#ff9a4d',home:'#ffffff'};
var P={
 home:'<path d="M4 11l8-7 8 7v9H4z"/>',
 timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 2h6"/>',
 learn:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/><path d="M8 7h7"/>',
 race:'<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>',
 dash:'<rect x="4" y="9" width="9" height="9" rx="2"/><path d="M15 18l3-6 3 6z"/><path d="M2 20h20"/>',
 garage:'<path d="M3 16v-4l2-5h14l2 5v4"/><path d="M3 16h18"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>',
 clubs:'<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
 duels:'<path d="M4 4l8 8"/><path d="M20 4l-8 8"/><path d="M6 14l4 4"/><path d="M18 14l-4 4"/>',
 crates:'<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>',
 card:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M14 10h4M14 14h4M6 16h6"/>',
 cube3d:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5"/><path d="M12 12v9"/>',
 verdict:'<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
 rewards:'<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v7h14v-7"/><path d="M12 8v12"/><path d="M12 8c-2-4-6-3-5 0M12 8c2-4 6-3 5 0"/>',
 play:'<path d="M8 5l11 7-11 7z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
 dot:'<circle cx="12" cy="12" r="3"/>'};
function ic(k,sz,col){ return '<svg aria-hidden="true" width="'+(sz||20)+'" height="'+(sz||20)+'" viewBox="0 0 24 24" fill="none" stroke="'+(col||'currentColor')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(P[k]||P.dot)+'</svg>'; }
function tools(){ return (window.PL&&PL.TOOLS)||[]; }
function main6(){ var ids=['timer','learn','race','dash','garage','clubs']; return ids.map(function(i){ return tools().filter(function(t){ return t.id===i; })[0]; }).filter(Boolean); }
function more(){ var m=main6(); return tools().filter(function(t){ return m.indexOf(t)<0; }); }
function cur(){ return (location.hash||'#').slice(1).split('/')[0]||'home'; }
/* ---------- background and side menu ---------- */
function bg(){ if(D.getElementById('bg9')) return; var b=D.createElement('div'); b.id='bg9'; b.setAttribute('aria-hidden','true'); b.innerHTML='<i></i><i></i><i></i><i></i><i></i><b></b><b></b><b></b><b></b><b></b><b></b>'; D.body.insertBefore(b,D.body.firstChild); }
function navHtml(){ var c=cur(), m=main6();
  return '<a class="n9-brand" href="#"><img src="/logo.png" alt="" width="30" height="30"><b>Cuber Tools</b></a>'
   +[{id:'home',n:'Home'}].concat(m).map(function(t){ var a=c===t.id||(t.id==='home'&&(c==='home'||c==='')); return '<a class="n9-i'+(a?' on':'')+'" href="#'+(t.id==='home'?'':t.id)+'"'+(a?' aria-current="page"':'')+'>'+ic(t.id,20,a?'currentColor':ACC[t.id])+'<span>'+esc(t.n)+'</span></a>'; }).join('')
   +'<span class="n9-h">More</span><div class="n9-more">'+more().map(function(t){ var a=c===t.id; return '<a class="n9-m'+(a?' on':'')+'" href="#'+t.id+'" title="'+esc(t.n)+'">'+ic(t.id,18,'currentColor')+'<span>'+esc(t.n.replace('Mystery ','').replace('Profile ','').replace('Solve ',''))+'</span></a>'; }).join('')+'</div>'+tBtn('n9-t'); }
function light(){ try{ return localStorage.getItem('cw_v9t')==='light'; }catch(e){ return false; } }
function tBtn(c){ var l=light(); return '<button type="button" class="'+c+'" data-v9t="1">'+ic(l?'moon':'sun',18,'currentColor')+(l?'Dark mode':'Light mode')+'</button>'; }
function fabRoom(){ var f=D.querySelector('.fab'); if(!f) return; var r=f.getBoundingClientRect(); var h=r.height?Math.round(window.innerHeight-r.top+14):140; R.style.setProperty('--fab9',Math.max(90,Math.min(320,h))+'px'); }
function nav(){ var n=D.getElementById('nav9'); if(!n){ n=D.createElement('nav'); n.id='nav9'; n.setAttribute('aria-label','Cuber Tools'); D.body.appendChild(n); } n.innerHTML=navHtml(); fabRoom(); }
/* ---------- home ---------- */
function mmss(ms){ ms=Math.max(0,ms); var s=Math.floor(ms/1000); return Math.floor(s/60)+':'+('0'+s%60).slice(-2); }
function fmt(ms){ return PL.fmt?PL.fmt(ms):(ms/1000).toFixed(2); }
function meta(t){ try{ if(t.meta) return t.meta(); }catch(e){} var id=t.id;
  try{ if(id==='learn') return (PL.learnPct?PL.learnPct():0)+'% learned'; if(id==='race') return 'Live · practice · friends'; if(id==='dash') return 'Rhythm levels · Cube Smash'; if(id==='garage'){ var a=CW.lsJ('cw_cars',[0]); var nc=Array.isArray(a)?a.length:1; return nc+(nc===1?' car':' cars'); } if(id==='clubs') return 'Weekly board'; }catch(e){}
  return ''; }
function homeHtml(){ var name=(PL.name&&PL.name())||'Cuber', d=PL.T&&PL.T.data?PL.T.data():null, L=d?(d.solves[d.cube]||[]):[], best=PL.T&&PL.T.best?PL.T.best(L):null, ao=PL.T&&PL.T.aoN?PL.T.aoN(L,5):null;
  var gift=PL.giftReady&&PL.giftReady(), spins=PL.spinsLeft?PL.spinsLeft():0, ev=PL.raceEvent&&PL.raceEvent(), nxt=PL.nextAuto?PL.nextAuto():0;
  var cube=d&&PL.T.CUBES?PL.T.CUBES[d.cube]||d.cube:'3×3';
  return '<div class="wrap h9">'
   +'<h1 class="h9-hi">Hi '+esc(name)+'</h1>'
   +'<div class="h9-top">'
   +'<a class="g9 h9-tm" href="#timer"><span class="h9-k">'+ic('timer',18,'#3ddc84')+'Timer · '+esc(cube)+'</span><b class="h9-big mono">'+(best!=null?fmt(best):'0.000')+'</b><span class="h9-sub">'+(best!=null?'Your best single'+(ao!=null&&ao!==Infinity?' · Ao5 '+fmt(ao):'')+' · '+L.length+' solves':'Hold, then let go to start. Every solve earns tokens and XP.')+'</span><span class="sp9"></span><span class="h9-go">'+ic('play',18,'currentColor')+'Start solving</span></a>'
   +'<div class="h9-col">'
   +'<div class="g9 h9-s"><span class="h9-st">'+ic('race',20,'#ff8a80')+(ev?'Race event now':'Next auto race')+'</span><span class="h9-sub">'+(ev?'A special race is open right now.':'Starts in <b class="mono" id="h9Cd">'+mmss(nxt-PL.now())+'</b>. Races run every :00 and :30.')+'</span><a class="h9-b" href="#race">Join the race</a></div>'
   +'<div class="g9 h9-s"><span class="h9-st">'+ic('rewards',20,'#ffc533')+'Daily gift</span><span class="h9-sub">'+(gift?'Your free daily gift is ready.':spins?spins+' spin'+(spins>1?'s':'')+' ready.':'Come back tomorrow for the next one.')+'</span><a class="h9-b" href="#rewards">Open rewards</a></div>'
   +'</div></div>'
   +'<div class="h9-mini">'+main6().filter(function(t){ return t.id!=='timer'; }).map(function(t){ var n0=t.n0&&t.n0(); return '<a class="g9 h9-c" href="#'+t.id+'"><span class="h9-ic">'+ic(t.id,20,ACC[t.id])+'</span><b>'+esc(t.n)+(n0?' <i class="h9-n">'+esc(n0)+'</i>':'')+'</b><span>'+esc(meta(t))+'</span></a>'; }).join('')+'</div>'
   +'<h2 class="h9-h">More</h2><div class="h9-more">'+more().map(function(t){ var n0=t.n0&&t.n0(); return '<a class="g9 h9-p" href="#'+t.id+'">'+ic(t.id,18,ACC[t.id]||'#fff')+esc(t.n)+(n0?' <i class="h9-n">'+esc(n0)+'</i>':'')+'</a>'; }).join('')+'</div>'
   +(PL.shopCard?PL.shopCard():'')
   +'<p class="h9-cl"><button type="button" class="h9-sw" data-v9t="1">'+(light()?'Switch to dark mode':'Switch to light mode')+'</button> · <button type="button" class="h9-sw" data-v9="off">Switch to the classic look</button></p></div>'; }
var hT=0;
function wrapHome(){ var V=PL.views&&PL.views.home; if(!V||V._v9) return; V._v9=1; var o=V.show, ol=V.leave;
  V.show=function(el){ if(!on()) return o.apply(this,arguments); el.innerHTML=homeHtml(); clearInterval(hT); hT=setInterval(function(){ var c=D.getElementById('h9Cd'); if(!c){ clearInterval(hT); return; } var l=PL.nextAuto()-PL.now(); c.textContent=mmss(l); if(l<=0) V.show(el); },1000); };
  V.leave=function(){ clearInterval(hT); if(ol) return ol.apply(this,arguments); }; }
/* ---------- switch ---------- */
function apply(){ var v=on(); R.classList.toggle('v9',v); R.classList.toggle('v9l',v&&light()); if(v) R.setAttribute('data-theme',light()?'light':'dark'); else if(window.CW&&CW.theme) CW.theme();
  if(v){ R.classList.remove('lg'); bg(); nav(); }
  else { var n=D.getElementById('nav9'); if(n) n.remove(); var b=D.getElementById('bg9'); if(b) b.remove(); }
  var m=D.querySelector('meta[name="theme-color"]'); if(m) m.setAttribute('content',v&&!light()?'#070a14':'#ffffff'); }
function toggleT(){ try{ localStorage.setItem('cw_v9t',light()?'dark':'light'); }catch(e){} apply(); if(cur()==='home') window.dispatchEvent(new HashChangeEvent('hashchange')); }
function set(v){ try{ localStorage.setItem('cw_v9b',v?'1':'0'); }catch(e){} apply(); window.dispatchEvent(new HashChangeEvent('hashchange')); if(window.CW&&CW.toast) CW.toast(v?'New look on':'Classic look on'); }
window.CWV9={on:on,set:set};
/* safety net like the corner buttons: if the browser lets the fixed side menu drift while scrolling, place it ourselves */
var NP={pin:false,bad:0,raf:0};
function navPlace(){ NP.raf=0; var n=D.getElementById('nav9'); if(!n||getComputedStyle(n).display==='none') return; var v=window.visualViewport, vh=v?v.height:innerHeight, vt=v?v.offsetTop:0, fab=parseInt(getComputedStyle(R).getPropertyValue('--fab9'))||140, h=n.offsetHeight, top=Math.max(14,(vh-14-fab-h)/2+14);
  if(false){ n.style.setProperty('position','absolute','important'); n.style.setProperty('margin','0','important'); n.style.setProperty('bottom','auto','important'); n.style.setProperty('top',Math.round(scrollY+vt+top)+'px','important'); return; }
  var r=n.getBoundingClientRect(); if(Math.abs(r.top-(vt+top))>60){ NP.bad=0; } else NP.bad=0; }
function navQ(){ if(!NP.raf) NP.raf=requestAnimationFrame(navPlace); }
window.addEventListener('scroll',navQ,{passive:true}); window.addEventListener('resize',navQ); window.addEventListener('touchend',function(){ setTimeout(navQ,60); setTimeout(navQ,400); },{passive:true}); if(window.visualViewport){ visualViewport.addEventListener('scroll',navQ); visualViewport.addEventListener('resize',navQ); } setInterval(navQ,1500);
D.addEventListener('click',function(e){ if(!on()) return; var t=e.target.closest&&e.target.closest('[data-v9t],[data-theme-toggle]'); if(!t) return; e.preventDefault(); e.stopImmediatePropagation(); toggleT(); },true);
D.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('[data-v9]'); if(!b) return; e.preventDefault(); set(b.getAttribute('data-v9')==='on'); });
/* classic home gets a way back to the new look */
function classicBtn(){ if(on()) return; var el=D.querySelector('#app .wrap'); if(!el||cur()!=='home'||D.getElementById('v9On')) return; var p=D.createElement('p'); p.id='v9On'; p.style.cssText='margin:18px 0 0'; p.innerHTML='<button type="button" class="btn sm" data-v9="on">Try the new look</button>'; el.appendChild(p); }
function gone(){ if(/^#verdict/.test(location.hash)) location.replace('#'); }
function start(){ gone(); window.addEventListener('hashchange',gone); wrapHome(); apply(); window.addEventListener('resize',fabRoom); setTimeout(fabRoom,800); window.addEventListener('hashchange',function(){ if(on()) nav(); setTimeout(classicBtn,60); }); setTimeout(classicBtn,300);
  if(on()&&(cur()==='home')) window.dispatchEvent(new HashChangeEvent('hashchange')); }
if(D.readyState==='loading') D.addEventListener('DOMContentLoaded',start); else start();
})();
