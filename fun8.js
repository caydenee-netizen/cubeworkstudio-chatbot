/* Games and fun: daily fewest-moves puzzle, cube patterns, PB ghost, achievements, events calendar, Dash level of the day,
   streak freezes and your year in review. */
(function(){
'use strict';
if(typeof CW==='undefined'||!window.PL||!PL.T) return;
var LV=PL.live, esc=CW.esc, T=PL.T;
function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } }
function lj(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)||'null'); return v==null?d:v; }catch(e){ return d; } }
function fmt(ms){ if(ms===Infinity||ms==null) return 'DNF'; var s=ms/1000; if(s<60) return s.toFixed(2); var m=Math.floor(s/60); return m+':'+(s-m*60).toFixed(2).padStart(5,'0'); }
function val(x){ return x.p===2?Infinity:x.t+(x.p===1?2000:0); }
function all(){ var d=T.data(), sv=d.solves||{}, a=[]; Object.keys(sv).forEach(function(k){ (sv[k]||[]).forEach(function(x){ if(x&&typeof x.t==='number') a.push({c:k,t:x.t,p:x.p||0,d:x.d||0,sp:x.sp}); }); }); return a; }
/* ---------- 37 daily fewest moves (a Learn tab) ---------- */
var FM={d:null};
function fmHtml(){ return '<div class="pnl"><h3 style="margin-top:0">🧠 Daily fewest moves</h3><p class="muted">Everyone gets the same scramble today. Find a solution in as few moves as you can (take your time, use pen and paper). Type it in and the server checks it on a virtual cube. Top 3 at midnight win 150, 90 and 50 tokens.</p><div id="f8B"><p class="muted">Loading…</p></div></div>'; }
function fmDraw(el){ var b=el.querySelector('#f8B'), d=FM.d; if(!b) return; if(!d){ b.innerHTML='<p class="muted">Could not load today’s puzzle.</p>'; return; }
  b.innerHTML='<p class="mono f8-scr">'+esc(d.scr)+'</p><small class="muted">Hold the cube with white on top and green in front. Moves count in the normal way (R2 is 1 move, x y z rotations are free).</small>'
   +'<textarea class="in mono" id="f8S" rows="3" placeholder="Your solution, e.g. R U R\' F2 …" style="width:100%;margin-top:10px" autocapitalize="off" autocorrect="off" spellcheck="false">'+esc(d.mine?d.mine.sol:'')+'</textarea><div class="row" style="gap:8px;margin-top:8px"><button class="btn pri" type="button" data-f8="send">Check and submit</button><span class="muted" id="f8M">'+(d.mine?'Your best today: <b>'+d.mine.m+' moves</b>':'')+'</span></div>'
   +'<h4>Today’s best</h4>'+(d.top.length?'<div class="f8-top">'+d.top.map(function(r,i){ return '<div'+(r.me?' class="me"':'')+'><span>'+(i<3?['🥇','🥈','🥉'][i]:i+1)+'</span><b>'+esc(r.n)+'</b><i>'+r.m+' moves</i></div>'; }).join('')+'</div>':'<p class="muted">Nobody yet. Be first!</p>')
   +(d.prev&&d.prev.top&&d.prev.top.length?'<details style="margin-top:10px"><summary>Yesterday’s winners and their solutions</summary><p class="mono" style="font-size:12.5px;opacity:.7">'+esc(d.prev.scr)+'</p>'+d.prev.top.map(function(r,i){ return '<p style="margin:6px 0"><b>'+['🥇','🥈','🥉'][i]+' '+esc(r.n)+' · '+r.m+' moves</b><br><span class="mono" style="font-size:13px">'+esc(r.sol)+'</span></p>'; }).join('')+'</details>':''); }
function fmMount(el){ CW.call('/api/fmc',{id:CW.devId()},8000).then(function(r){ FM.d=r.ok?r.data:null; fmDraw(el); });
  el.addEventListener('click',function(e){ if(!e.target.closest('[data-f8="send"]')) return; var s=(el.querySelector('#f8S').value||'').trim(); if(!s) return; var m=el.querySelector('#f8M'); m.textContent='Checking…';
    CW.call('/api/fmc',{id:CW.devId(),act:'submit',sol:s},8000).then(function(r){ if(!r.ok){ m.textContent=(r.data&&r.data.error)||'Could not check it.'; return; } FM.d.top=r.data.top; FM.d.mine={m:r.data.best,sol:s}; fmDraw(el); var mm=el.querySelector('#f8M'); if(mm) mm.innerHTML='✅ Solved in <b>'+r.data.m+' moves</b>'+(r.data.best<r.data.m?' (your best is '+r.data.best+')':''); }); }); }
/* ---------- 39 patterns (a Learn tab) ---------- */
var PAT=[['Checkerboard','M2 E2 S2'],['Checkerboard (face turns)','R2 L2 U2 D2 F2 B2'],['Six spots','U D\' R L\' F B\' U D\''],['Cube in a cube','F L F U\' R U F2 L2 U\' L\' B D\' B\' L2 U'],['Cross','U F B\' L2 U2 L2 F\' B U2 L2 U'],['Tetris','L R F B U\' D\' L\' R\''],['Superflip','U R2 F B R B2 R U2 L B2 R U\' D\' R2 F R\' L B2 U2 F2']];
function patHtml(){ return '<div class="pnl"><h3 style="margin-top:0">✨ Cube patterns</h3><p class="muted">Start from a solved cube and do the moves to make a pattern. Tap one to watch it on the 3D cube.</p><div class="f8-pat"><canvas id="f8Pc" width="400" height="400"></canvas><div>'+PAT.map(function(p,i){ return '<button type="button" class="f8-pb'+(i===0?' on':'')+'" data-pt="'+i+'"><b>'+esc(p[0])+'</b><span class="mono">'+esc(p[1])+'</span></button>'; }).join('')+'</div></div></div>'; }
function patMount(el){ var L=PL.lk, cv=el.querySelector('#f8Pc'); if(!L||!cv) return; var cu=L.mkCube(cv); if(!cu) return; var mv=[], i=0, wait=800, last=0, raf=0;
  function load(k){ mv=L.parseAlg(PAT[k][1]); cu.st=L.solvedCube(); cu.anim=null; i=0; wait=700; }
  function tick(ts){ raf=requestAnimationFrame(tick); if(!document.body.contains(cv)){ cancelAnimationFrame(raf); return; } var dt=Math.min(60,ts-(last||ts)); last=ts;
    if(cu.anim){ cu.anim.t+=dt/(cu.anim.mv[1]===2?700:480); var u=Math.min(1,cu.anim.t); cu.anim.a=L.MV[cu.anim.mv[0]][2]*cu.anim.mv[1]*Math.PI/2*L.ease(u); if(u>=1){ L.applyMove(cu.st,cu.anim.mv); cu.anim=null; i++; wait=i>=mv.length?2600:120; } }
    else { wait-=dt; if(wait<=0){ if(i>=mv.length){ cu.st=L.solvedCube(); i=0; wait=700; } else cu.anim={mv:mv[i],t:0,a:0}; } }
    cu.yaw=(cu.yaw||0)+dt*.0003; cu.draw(); }
  load(0); raf=requestAnimationFrame(tick);
  el.addEventListener('click',function(e){ var b=e.target.closest('[data-pt]'); if(!b) return; [].forEach.call(el.querySelectorAll('[data-pt]'),function(x){ x.classList.toggle('on',x===b); }); load(+b.getAttribute('data-pt')); }); }
window.CWLearnX=(window.CWLearnX||[]).concat([{id:'fmc',n:'Fewest moves',ic:'quiz',html:fmHtml,mount:fmMount},{id:'pat',n:'Patterns',ic:'guide',html:patHtml,mount:patMount}]);
/* ---------- 40 PB ghost bar while timing ---------- */
setInterval(function(){ var TM=PL.TM, g=document.getElementById('f8G'); if(!TM||ls('cw_ghost')==='0'||TM.state!=='run'){ if(g) g.style.opacity='0'; return; }
  var d=T.data(), L=((d.solves||{})[d.cube]||[]).map(val).filter(function(v){ return v!==Infinity; }); if(!L.length) return; var pb=Math.min.apply(null,L), el=performance.now()-TM.start;
  if(!g){ var pad=document.getElementById('tPad'); if(!pad) return; g=document.createElement('div'); g.id='f8G'; g.className='f8-ghost'; g.innerHTML='<i></i><span></span>'; pad.appendChild(g); }
  g.style.opacity='1'; var pc=Math.min(100,el/pb*100); g.firstChild.style.width=pc+'%'; g.lastChild.textContent=el<pb?'👻 PB ghost '+fmt(pb)+' · '+fmt(pb-el)+' left':'👻 Ghost finished ('+fmt(pb)+')'; g.classList.toggle('late',el>=pb); },100);
/* ---------- 41 achievements ---------- */
function achList(){ var A=all(), n=A.length, s3=A.filter(function(x){ return x.c==='333'; }), best=Infinity; s3.forEach(function(x){ best=Math.min(best,val(x)); });
  var ao=Infinity, v3=s3.map(val); for(var i=5;i<=v3.length;i++){ var w=v3.slice(i-5,i).sort(function(a,b){ return a-b; }); if(w[3]!==Infinity) ao=Math.min(ao,(w[1]+w[2]+w[3])/3); }
  var days={}; A.forEach(function(x){ if(x.d) days[new Date(x.d).toDateString()]=1; }); var nd=Object.keys(days).length, puz={}; A.forEach(function(x){ puz[x.c]=1; }); var np=Object.keys(puz).length;
  var lv=1; try{ var L0=PL.level(); lv=typeof L0==='object'?(L0.L||1):L0; }catch(e){}
  var beg=lj('cw_beg',{}), begN=Object.keys(beg).filter(function(k){ return beg[k]; }).length, eggs=Object.keys(lj('cw_eggs',{})).length, sm=lj('cw_smash',{})||{};
  var R=[]; function add(ic,t,cur,goal,fmtv){ R.push({ic:ic,t:t,cur:Math.min(cur,goal),goal:goal,done:cur>=goal,lbl:fmtv?fmtv(Math.min(cur,goal)):Math.min(cur,goal).toLocaleString()+' / '+goal.toLocaleString()}); }
  [10,100,1000,10000].forEach(function(g){ add('⏱️',g.toLocaleString()+' solves',n,g); });
  [60,40,30,20,15,10].forEach(function(t){ R.push({ic:'⚡',t:'Sub-'+t+' 3×3 single',done:best<t*1000,cur:best<t*1000?1:0,goal:1,lbl:best<Infinity?'Best '+fmt(best):'No 3×3 solves yet'}); });
  [30,20,15].forEach(function(t){ R.push({ic:'📊',t:'Sub-'+t+' 3×3 average of 5',done:ao<t*1000,cur:ao<t*1000?1:0,goal:1,lbl:ao<Infinity?'Best '+fmt(ao):'Not enough solves yet'}); });
  [7,30,100].forEach(function(g){ add('📅','Cubed on '+g+' different days',nd,g); });
  [3,6].forEach(function(g){ add('🧩','Tried '+g+' puzzles',np,g); });
  [10,25,50].forEach(function(g){ add('⭐','Level '+g,lv,g); });
  add('🎓','Finished the Beginner course',begN,8); add('🥚','Found all 6 secrets',eggs,6); add('🧱','Cube Smash: clear 10 levels',sm.max||0,10);
  return R; }
function achHtml(){ var R=achList(), done=R.filter(function(r){ return r.done; }).length;
  return '<div class="pnl f8-ach" id="f8Ach"><div class="row" style="align-items:center"><h3 style="margin:0">🏆 Achievements</h3><span class="sp"></span><b>'+done+' / '+R.length+'</b></div><div class="f8-ag">'+R.map(function(r){ return '<div class="f8-a'+(r.done?' done':'')+'"><span>'+r.ic+'</span><div><b>'+esc(r.t)+'</b><div class="t8-bar"><i style="width:'+Math.round(r.cur/r.goal*100)+'%"></i></div><small>'+(r.done?'✅ Done':esc(r.lbl))+'</small></div></div>'; }).join('')+'</div></div>'; }
/* ---------- 45 streak freezes ---------- */
function frzHtml(){ var n=PL.freeze?PL.freeze.n():0; return '<div class="pnl"><div class="row" style="align-items:center;gap:10px"><span style="font-size:28px">🧊</span><div style="flex:1"><b>Streak freezes: '+n+' / 2</b><br><small class="muted">If you miss one day, a freeze keeps your daily gift streak going. You get one for every 7-day streak, or buy one.</small></div><button class="btn" type="button" data-f8="frz"'+(n>=2?' disabled':'')+'>Buy for 300 tokens</button></div></div>'; }
/* ---------- 42 events calendar + 43 Dash level of the day ---------- */
function calItems(){ var now=PL.now?PL.now():Date.now(), L=[], d=new Date(now);
  var nr=new Date(now); nr.setSeconds(0,0); nr.setMinutes(nr.getMinutes()<30?30:60); for(var i=0;i<3;i++){ L.push({at:nr.getTime()+i*1800000,ic:'🏁',t:'Auto race',s:'Everyone online races together',href:'#race'}); }
  var mid=new Date(now); mid.setHours(24,0,0,0); L.push({at:mid.getTime(),ic:'🧠',t:'New fewest-moves puzzle',s:'Yesterday’s top 3 get their tokens',href:'#learn/fmc'}); L.push({at:mid.getTime(),ic:'🎁',t:'Next daily gift',s:'Keep your streak going',href:'#rewards'}); L.push({at:mid.getTime(),ic:'🟦',t:'New Dash level of the day',s:'Beat it for 100 tokens',href:'#dash/day'});
  var C=LV.chal; if(C&&!C.done&&C.end>now) L.push({at:C.end,ic:'🏆',t:'Challenge ends: '+C.n,s:'Top 3 win tokens',href:'#timer'});
  return L.sort(function(a,b){ return a.at-b.at; }); }
function calHtml(){ var L=calItems(); return '<div class="pnl"><h3 style="margin-top:0">📅 Coming up</h3>'+L.map(function(x){ var d=new Date(x.at), today=new Date().toDateString()===d.toDateString(); return '<a class="f8-cal" href="'+x.href+'"><span>'+x.ic+'</span><div><b>'+esc(x.t)+'</b><small class="muted">'+esc(x.s)+'</small></div><i>'+(today?'':d.toLocaleDateString('en-MY',{weekday:'short'})+' ')+d.toLocaleTimeString('en-MY',{hour:'2-digit',minute:'2-digit'})+'</i></a>'; }).join('')+'</div>'; }
function dayKey(){ var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
PL.dashDayWin=function(lv){ if(ls('cw_dday')===dayKey()) { CW.toast('You already beat today’s level. New one at midnight!'); return; } ls('cw_dday',dayKey()); var n=PL.award(100); CW.toast('🟦 Level of the day beaten! +'+n+' tokens'); };
function ddHtml(){ var L=PL.dashLevels||[], i=PL.dashDayIx?PL.dashDayIx():0, lv=L[i]; if(!lv) return ''; var done=ls('cw_dday')===dayKey(); return '<div class="pnl f8-dd"><span>🟦</span><div><b>Level of the day: '+esc(lv.name||('Level '+lv.id))+'</b><small class="muted">'+(done?'✅ Beaten today. New level at midnight.':'Beat it today for 100 tokens.'+(lv.tag?' · '+esc(lv.tag):''))+'</small></div><a class="btn pri" href="#dash/day">'+(done?'Play again':'Play')+'</a></div>'; }
/* ---------- 46 year in review ---------- */
PL.yearReview=function(){ var y=new Date().getFullYear(), A=all().filter(function(x){ return x.d&&new Date(x.d).getFullYear()===y; }); if(!A.length){ CW.toast('No solves this year yet.'); return; }
  var tt=A.reduce(function(s,x){ return s+x.t; },0), mo={}, best={}, days={}; A.forEach(function(x){ var d=new Date(x.d); mo[d.getMonth()]=(mo[d.getMonth()]||0)+1; days[d.toDateString()]=1; var v=val(x); if(v<(best[x.c]||Infinity)) best[x.c]=v; });
  var mx=Object.keys(mo).sort(function(a,b){ return mo[b]-mo[a]; })[0], MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var s3=A.filter(function(x){ return x.c==='333'; }).sort(function(a,b){ return a.d-b.d; }), first=s3.slice(0,12), last=s3.slice(-12), mean=function(L){ var v=L.map(val).filter(function(x){ return x!==Infinity; }); return v.length?v.reduce(function(a,b){ return a+b; },0)/v.length:0; }, m1=mean(first), m2=mean(last);
  var h=Math.floor(tt/3600000), mi=Math.floor(tt%3600000/60000);
  CW.sheet('<div class="hd"><h2>✨ Your '+y+'</h2><button class="x" data-close aria-label="Close">✕</button></div><div class="f8-yr">'
   +'<div><small>Solves</small><b>'+A.length.toLocaleString()+'</b></div><div><small>Time spent solving</small><b>'+(h?h+' h ':'')+mi+' min</b></div><div><small>Days you cubed</small><b>'+Object.keys(days).length+'</b></div><div><small>Busiest month</small><b>'+MN[mx]+'</b></div>'
   +(best['333']?'<div><small>Best 3×3 single</small><b>'+fmt(best['333'])+'</b></div>':'')+(s3.length>=24&&m2<m1?'<div><small>3×3 got faster by</small><b>'+((m1-m2)/1000).toFixed(2)+' s</b></div>':'')+'</div>'
   +'<p class="muted" style="margin-top:10px">'+(s3.length>=24&&m2<m1?'Your first 3×3 solves this year averaged '+fmt(m1)+'; your latest average '+fmt(m2)+'. Great work!':'Keep cubing to see how much you improve.')+'</p>'); };
/* ---------- wiring ---------- */
document.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('[data-f8]'); if(!b) return; var a=b.getAttribute('data-f8');
  if(a==='frz'){ if(PL.freeze.n()>=2) return; if(!confirm('Buy a streak freeze for 300 tokens?')) return; if(!PL.spend(300)){ CW.toast('You need 300 tokens.'); return; } PL.freeze.add(1); PL.hud&&PL.hud(); CW.toast('🧊 Streak freeze added.'); var p=b.closest('.pnl'); if(p){ var d=document.createElement('div'); d.innerHTML=frzHtml(); p.replaceWith(d.firstChild); } }
  else if(a==='year') PL.yearReview(); });
var ADD=[]; function wrap1(view,fn){ var V=PL.views[view]; if(!V||!V.show||V['__f8'+view]) return; V['__f8'+view]=1; var o=V.show; V.show=function(el,h){ var r=o.apply(this,arguments); try{ fn(el.querySelector('.wrap')||el,el,h); }catch(e){} return r; }; }
function wrapAll(){ ADD.forEach(function(a){ wrap1(a[0],a[1]); }); }
ADD.push(['rewards',function(w){ if(/^#settings/.test(location.hash)) return; var d=document.createElement('div'); d.innerHTML=calHtml()+frzHtml()+achHtml()+'<div class="pnl"><div class="row" style="align-items:center;gap:10px"><span style="font-size:28px">✨</span><div style="flex:1"><b>Your year in review</b><br><small class="muted">Solves, time spent, best times and how much faster you got this year.</small></div><button class="btn pri" type="button" data-f8="year">Open</button></div></div>'; while(d.firstChild) w.appendChild(d.firstChild); }]);
ADD.push(['dash',function(w,el,h){ if(h==='dash/day') return; setTimeout(function(){ var ww=el.querySelector('.wrap')||el; if(ww.querySelector('.f8-dd')) return; var d=document.createElement('div'); d.innerHTML=ddHtml(); if(d.firstChild){ var c=ww.querySelector('.crumbs,nav'); ww.insertBefore(d.firstChild,c?c.nextSibling:ww.firstChild); } },50); }]);
wrapAll(); window.addEventListener('hashchange',wrapAll,true); setTimeout(wrapAll,3000);
/* ghost toggle in Timer options */
document.addEventListener('click',function(e){ if(!(e.target.closest&&e.target.closest('[data-t8="set"]'))) return; setTimeout(function(){ var sh=document.querySelector('.sheet .box')||document.querySelector('.sheet'); if(!sh||sh.querySelector('[data-f8g]')) return; var l=document.createElement('label'); l.className='row t8-opt'; l.innerHTML='<span><b>👻 PB ghost</b><small>A bar under the timer races your best time while you solve.</small></span><input type="checkbox" data-f8g'+(ls('cw_ghost')!=='0'?' checked':'')+'>'; sh.appendChild(l); l.querySelector('input').onchange=function(){ ls('cw_ghost',this.checked?'1':'0'); }; },60); });
})();
