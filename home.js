/* /play: new home. A personal dashboard (today's plan, streak, timer snapshot, race, learning) instead of a grid of tiles.
   Also owns the daily counters (PL.tick) that the practice plan reads. */
(function(){
'use strict';
if(typeof CW==='undefined'||!window.PL) return;
var $=CW.$, esc=CW.esc, ls=CW.ls, PL=window.PL;

/* ---------- daily counters ---------- */
function dk(t){ return Math.floor(((t==null?Date.now():t)+8*36e5)/864e5); }
function day(){ var d=CW.lsJ('cw_day',null); if(!d||d.k!==dk()) d={k:dk(),c:{}}; return d; }
PL.tick=function(key,n){ var d=day(); d.c[key]=(d.c[key]||0)+(n||1); CW.setJ('cw_day',d); };
function count(k){ return day().c[k]||0; }
function goalN(){ var g=+ls('cw_goal'); return [5,10,20,50].indexOf(g)>=0?g:10; }

/* ---------- streak and totals from saved solves ---------- */
function allSolveRecs(){ var d=CW.lsJ('cw_timer',{})||{}, sv=d.solves||{}, a=[]; Object.keys(sv).forEach(function(k){ (sv[k]||[]).forEach(function(s){ if(s&&typeof s.t==='number') a.push(s); }); }); return a; }
function streak(){ var days={}, recs=allSolveRecs(); recs.forEach(function(s){ if(s.d) days[dk(s.d)]=1; }); var t=dk(), n=0, k=days[t]?t:t-1; while(days[k]){ n++; k--; } return {n:n,today:!!days[t],total:recs.length}; }
PL.streak=streak;

/* ---------- plan ---------- */
function plan(){ var g=goalN(), weak=PL.weakCount?PL.weakCount():0, nc=PL.nextCase?PL.nextCase():null, recs=allSolveRecs(), T=[];
  T.push({k:'solves',n:g,t:'Solve '+g+' times',d:'Every solve counts, including slow ones.',href:'#timer',ic:'⏱'});
  T.push(weak>0?{k:'drill',n:Math.min(8,Math.max(4,weak)),t:'Review your weak algs',d:weak+' case'+(weak>1?'s':'')+' you keep missing, each with a memory trick.',href:'#learn/drill',ic:'🧠'}:{k:'drill',n:10,t:'Drill 10 algs',d:'Short reps keep algorithms in your fingers.',href:'#learn/drill',ic:'🧠'});
  if(nc){ var nm=nc.k==='oll'?'OLL '+nc.c.id:nc.k==='pll'?nc.c.id+' perm':'F2L '+nc.c.id; T.push({k:'learn',n:1,t:'Learn '+nm,d:'Next case in your library. Watch it turn, then mark it learned.',href:'#learn',ic:'📘'}); }
  if(recs.length>=3) T.push({k:'verdict',n:1,t:'Analyse one solve',d:'Paste a scramble and your moves to see where the time went.',href:'#verdict',ic:'🔍'});
  if(PL.live&&PL.live.on) T.push({k:'race',n:1,t:'Finish one race',d:'Races open every 30 minutes.',href:'#race',ic:'🏁'});
  T.forEach(function(x){ x.v=Math.min(x.n,count(x.k)); x.done=x.v>=x.n; }); return T; }
PL.plan=plan;
function claimed(){ var c=CW.lsJ('cw_plan_c',null); return c&&c.k===dk(); }
function claim(){ if(claimed()) return 0; var amt=PL.award(40); CW.setJ('cw_plan_c',{k:dk()}); PL.addXP&&PL.addXP(60); return amt; }

/* ---------- small helpers ---------- */
function ring(p,col,label,sub){ var r=34, c=2*Math.PI*r, o=c*(1-Math.max(0,Math.min(1,p))); return '<div class="hm-ring"><svg viewBox="0 0 80 80" width="92" height="92" aria-hidden="true"><circle cx="40" cy="40" r="'+r+'" fill="none" stroke="var(--line)" stroke-width="7"/><circle cx="40" cy="40" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="7" stroke-linecap="round" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+o.toFixed(1)+'" transform="rotate(-90 40 40)"/></svg><div><b>'+label+'</b><small>'+sub+'</small></div></div>'; }
function spark(vals){ if(vals.length<2) return '<div class="hm-sp muted">Solve a few times to see your trend.</div>'; var w=220,h=46,lo=Math.min.apply(null,vals),hi=Math.max.apply(null,vals); if(hi-lo<1) hi=lo+1; var pts=vals.map(function(v,i){ return (i/(vals.length-1)*w).toFixed(1)+','+(4+(h-8)*(1-(v-lo)/(hi-lo))).toFixed(1); }).join(' '); return '<svg viewBox="0 0 '+w+' '+h+'" class="hm-sp" preserveAspectRatio="none" aria-label="Your last solves"><polyline points="'+pts+'" fill="none" stroke="var(--blue)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>'; }
function greet(){ var h=new Date().getHours(); return h<5?'Late night cubing':h<12?'Good morning':h<18?'Good afternoon':'Good evening'; }
var hubT=0;

/* ---------- view ---------- */
PL.views.home={show:function(el){
  var d=CW.lsJ('cw_timer',{})||{}, L=((d.solves||{})['333']||[]), T=PL.T, st=streak(), xp=PL.xp.state(), lv=PL.xp.levelOf(xp.xp), tasks=plan(), done=tasks.filter(function(t){ return t.done; }).length, all=done===tasks.length, solvesToday=count('solves'), g=goalN();
  var vals=L.slice(-30).filter(function(x){ return x.p!==2; }).map(function(x){ return x.t+(x.p===1?2000:0); }), pb=T.best(L), a5=T.aoN(L,5), a12=T.aoN(L,12), nc=PL.nextCase?PL.nextCase():null;
  var ncName=nc?(nc.k==='oll'?'OLL '+nc.c.id:nc.k==='pll'?nc.c.id+' perm':'F2L '+nc.c.id):'';
  var pct=PL.learnPct();
  el.innerHTML='<div class="wrap hm">'
    +'<div class="hm-hd"><div><div class="eyebrow">'+greet()+'</div><h1 class="pl-h1" style="margin-top:6px">'+esc(PL.name())+'</h1></div><button type="button" class="hm-ask" id="hmAsk"><span>✦</span> Ask Cubexer or jump anywhere<kbd>/</kbd></button></div>'
    +'<div id="rb">'+'</div>'
    +'<div class="hm-grid">'
      /* plan */
      +'<section class="pnl hm-plan"><div class="row"><h3 style="margin:0">Today’s plan</h3><span class="sp"></span><span class="mono muted" style="font-size:13px">'+done+'/'+tasks.length+' done</span></div>'
        +'<div class="hm-tasks">'+tasks.map(function(t){ return '<a class="hm-task'+(t.done?' done':'')+'" href="'+t.href+'"><span class="hm-ck">'+(t.done?'✓':t.ic)+'</span><span class="hm-tt"><b>'+esc(t.t)+'</b><small>'+esc(t.d)+'</small></span><span class="hm-tp mono">'+t.v+'/'+t.n+'</span></a>'; }).join('')+'</div>'
        +(all?(claimed()?'<p class="muted hm-ok">Plan complete and bonus claimed. Great session.</p>':'<button class="btn pri wide" id="hmClaim" type="button" style="margin-top:12px">Claim your plan bonus · +40 tokens</button>'):'<p class="muted" style="font-size:13px;margin-top:10px">Finish everything for a bonus of 40 tokens and 60 XP.</p>')+'</section>'
      /* streak + goal */
      +'<section class="pnl hm-side"><div class="hm-rings">'+ring(Math.min(1,solvesToday/g),'var(--blue)',solvesToday+'/'+g,'solves today')+ring(lv.max?1:lv.into/lv.need,'#ff7a1a','Lv '+lv.L,lv.max?'max level':Math.round(lv.into/lv.need*100)+'% to next')+'</div>'
        +'<div class="hm-st"><b>'+st.n+'</b><span>day streak'+(st.n&&!st.today?' · solve today to keep it':'')+'</span></div>'
        +'<div class="row" style="gap:6px;margin-top:10px;align-items:center"><small class="muted">Daily goal</small><div class="seg hm-goal" id="hmGoal">'+[5,10,20,50].map(function(n){ return '<button type="button" data-g="'+n+'" aria-pressed="'+(g===n)+'">'+n+'</button>'; }).join('')+'</div></div></section>'
      /* timer snapshot */
      +'<a class="pnl hm-card hm-timer" href="#timer"><div class="row"><h3 style="margin:0">Timer</h3><span class="sp"></span><span class="hm-go">Start solving →</span></div>'
        +'<div class="hm-stats"><div><small>Best</small><b>'+PL.fmt(pb)+'</b></div><div><small>Ao5</small><b>'+PL.fmt(a5)+'</b></div><div><small>Ao12</small><b>'+PL.fmt(a12)+'</b></div></div>'+spark(vals)+'</a>'
      /* learn */
      +'<a class="pnl hm-card" href="#learn"><div class="row"><h3 style="margin:0">Learn CFOP</h3><span class="sp"></span><span class="mono muted">'+pct+'%</span></div><div class="hm-bar"><i style="width:'+pct+'%"></i></div>'+(nc?'<p class="hm-nx"><small>Next up</small><b>'+esc(ncName)+'</b></p>':'<p class="hm-nx"><b>Every case learned. Nice.</b></p>')+'<span class="hm-go">Open library →</span></a>'
      /* verdict */
      +'<a class="pnl hm-card" href="#verdict"><h3>Solve Verdict</h3><p class="muted" style="font-size:14px;margin:6px 0 10px">Paste a scramble and your moves. See your cross, F2L, OLL and PLL split, which cases you hit, and what to fix first.</p><span class="hm-go">Analyse a solve →</span></a>'
      /* games */
      +'<a class="pnl hm-card" href="#dash"><h3>Cube Dash</h3><p class="muted" style="font-size:14px;margin:6px 0 10px">One-tap platformer with 3 levels and a level maker. Share your own level with a code.</p><span class="hm-go">Play →</span></a>'
      +'<a class="pnl hm-card" href="#rewards"><h3>Rewards</h3><p class="muted" style="font-size:14px;margin:6px 0 10px">'+(PL.giftReady()?'🎁 Your free daily gift is ready.':PL.spinsLeft()?'🎰 You have '+PL.spinsLeft()+' spin'+(PL.spinsLeft()>1?'s':'')+' ready.':'Level rewards, daily spin and gifts.')+'</p><span class="hm-go">Open →</span></a>'
      +'<a class="pnl hm-card" href="#garage"><h3>Garage</h3><p class="muted" style="font-size:14px;margin:6px 0 10px">Cars, trails, wings and timer pad skins. Spend your tokens.</p><span class="hm-go">Open →</span></a>'
      +'<a class="pnl hm-card" href="#clubs"><h3>Clubs</h3><p class="muted" style="font-size:14px;margin:6px 0 10px">Join a club and climb the weekly board.</p><span class="hm-go">Open →</span></a>'
      +'<a class="pnl hm-card" href="#mail"><h3>✉️ Mail</h3><p class="muted" style="font-size:14px;margin:6px 0 10px">Send a pad skin, a spin or tokens to any cuber. They get it even when offline.</p><span class="hm-go">Send mail →</span></a>'
    +'</div>'+PL.shopCard()+'</div>';
  var rb=$('#rb',el); if(PL.raceBar) rb.innerHTML=PL.raceBar();
  var ab=$('#hmAsk',el); if(ab) ab.onclick=function(){ if(PL.ask) PL.ask.open(''); };
  var gl=$('#hmGoal',el); if(gl) gl.onclick=function(e){ var b=e.target.closest('[data-g]'); if(!b) return; ls('cw_goal',b.getAttribute('data-g')); PL.views.home.show(el); };
  var cl=$('#hmClaim',el); if(cl) cl.onclick=function(){ var n=claim(); CW.toast(n?'Plan bonus: +'+n+' tokens':'Already claimed today'); PL.views.home.show(el); if(PL.hud) PL.hud(); };
  clearInterval(hubT); hubT=setInterval(function(){ var r=$('#rb'); if(!r){ clearInterval(hubT); return; } var cd=$('[data-cd]',r), ev=PL.raceEvent&&PL.raceEvent(); if(ev||!cd||+cd.getAttribute('data-cd')<=PL.now()){ var h=PL.raceBar(); if(r.__h!==h){ r.__h=h; r.innerHTML=h; } } else cd.textContent=PL.mmss(+cd.getAttribute('data-cd')-PL.now()); },1000); },
  leave:function(){ clearInterval(hubT); }};
})();
