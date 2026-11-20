/* Timer and practice extras: inspection voice, two-hand start, easy-scramble warning, sub-X tracker,
   "what do I need" for an average of 5, step split trends, and today's practice plan. Settings are kept on this device. */
(function(){
'use strict';
if(typeof CW==='undefined'||!window.PL||!PL.T) return;
var esc=CW.esc, T=PL.T;
function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } }
var O=(function(){ try{ return JSON.parse(ls('cw_t8')||'{}')||{}; }catch(e){ return {}; } })();
function save(){ ls('cw_t8',JSON.stringify(O)); }
function fmt(ms){ if(ms===Infinity) return 'DNF'; var s=ms/1000; if(s<60) return s.toFixed(2); var m=Math.floor(s/60); return m+':'+(s-m*60).toFixed(2).padStart(5,'0'); }
function val(x){ return x.p===2?Infinity:x.t+(x.p===1?2000:0); }
function cur(){ var d=T.data(); return {cube:d.cube, L:((d.solves||{})[d.cube]||[]).filter(function(x){ return x&&typeof x.t==='number'; })}; }
/* ---------- 1 inspection voice ---------- */
PL.inspSay=function(n){ if(!O.voice) return; try{ var u=new SpeechSynthesisUtterance(n+' seconds'); u.rate=1.15; u.volume=1; speechSynthesis.cancel(); speechSynthesis.speak(u); }catch(e){} };
/* ---------- 11 two-hand start ---------- */
var act={};
['pointerdown','pointerup','pointercancel'].forEach(function(n){ document.addEventListener(n,function(e){ var pad=e.target.closest&&e.target.closest('#tPad'); if(!pad||e.pointerType!=='touch') return;
  if(n==='pointerdown') act[e.pointerId]=1; else delete act[e.pointerId];
  if(!O.two||n!=='pointerdown') return; var st=PL.TM&&PL.TM.state; if(st!=='idle'&&st!=='insp') return;
  if(Object.keys(act).length<2){ e.stopImmediatePropagation(); var h=document.getElementById('tHint')||document.querySelector('#tPad small,#tPad .hint'); CW.toast('Put both thumbs on the pad'); } },true); });
/* ---------- 8 easy scramble warning ---------- */
var N3={U:[0,1,0],D:[0,-1,0],F:[0,0,1],B:[0,0,-1],R:[1,0,0],L:[-1,0,0]}, CN={U:'white',D:'yellow',F:'green',B:'blue',R:'red',L:'orange'};
function rot(v,ax,sg){ var x=v[0],y=v[1],z=v[2]; if(ax===0) return sg>0?[x,z,-y]:[x,-z,y]; if(ax===1) return sg>0?[-z,y,x]:[z,y,-x]; return sg>0?[y,-x,z]:[-y,x,z]; }
function sim(scr){ var S=[]; Object.keys(N3).forEach(function(f){ var n=N3[f]; for(var a=-1;a<=1;a++) for(var b=-1;b<=1;b++){ var p=n[0]?[n[0],a,b]:n[1]?[a,n[1],b]:[a,b,n[2]]; S.push({p:p,n:n.slice(),c:f}); } });
  var AX={R:[0,1],L:[0,-1],U:[1,1],D:[1,-1],F:[2,1],B:[2,-1]};
  String(scr||'').trim().split(/\s+/).forEach(function(mv){ var m=/^([RLUDFB])(['2]?)$/.exec(mv); if(!m) return; var a=AX[m[1]], k=m[2]==='2'?2:m[2]==="'"?3:1;
    for(var t=0;t<k;t++) S.forEach(function(s){ if(s.p[a[0]]*a[1]!==1) return; s.p=rot(s.p,a[0],a[1]); s.n=rot(s.n,a[0],a[1]); }); }); return S; }
function key(p){ return p.join(','); }
function easy(scr){ var S=sim(scr), pc={}; S.forEach(function(s){ var k=key(s.p); (pc[k]=pc[k]||[]).push(s); });
  var eq=function(a,b){ return a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2]; }, add=function(a,b){ return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]; };
  var best={cross:0,pairs:0,c:'U'};
  Object.keys(N3).forEach(function(X){ var nX=N3[X], cross=0, pairs=0;
    Object.keys(N3).forEach(function(Y){ if(Y===X||eq(N3[Y],nX.map(function(v){ return -v; }))) return;
      /* cross edge X-Y solved? */
      var home=add(nX,N3[Y]), st=pc[key(home)]||[]; if(st.length===2&&st.some(function(s){ return s.c===X&&eq(s.n,nX); })&&st.some(function(s){ return s.c===Y&&eq(s.n,N3[Y]); })) cross++; });
    /* F2L pairs for cross colour X: edge {Y,Z} (both side colours) next to corner {X,Y,Z}, stickers matching */
    var sides=Object.keys(N3).filter(function(Y){ return Y!==X&&!eq(N3[Y],nX.map(function(v){ return -v; })); });
    for(var i=0;i<sides.length;i++) for(var j=i+1;j<sides.length;j++){ var Y=sides[i], Z=sides[j]; if(eq(N3[Y],N3[Z].map(function(v){ return -v; }))) continue;
      var ed=null, co=null; Object.keys(pc).forEach(function(k){ var g=pc[k], cs=g.map(function(s){ return s.c; }).sort().join(''); if(g.length===2&&cs===[Y,Z].sort().join('')) ed=g; if(g.length===3&&cs===[X,Y,Z].sort().join('')) co=g; });
      if(!ed||!co) continue; var ep=ed[0].p, cp=co[0].p, diff=[0,1,2].filter(function(q){ return ep[q]!==cp[q]; }); if(diff.length!==1) continue;
      var ok=[Y,Z].every(function(c){ var es=ed.filter(function(s){ return s.c===c; })[0], cs2=co.filter(function(s){ return s.c===c; })[0]; return es&&cs2&&eq(es.n,cs2.n); }); if(ok) pairs++; }
    if(cross*2+pairs*3>best.cross*2+best.pairs*3) best={cross:cross,pairs:pairs,c:X}; });
  if(best.cross>=3||best.pairs>=2||(best.cross>=2&&best.pairs>=1)) return best; return null; }
PL.t8easy=easy;
var lastScr='';
setInterval(function(){ var el=document.getElementById('tScr'); if(!el||!PL.TM) return; var scr=PL.TM.scr||'', c=T.data().cube; if(scr===lastScr) return; lastScr=scr; var old=document.getElementById('t8Easy'); if(old) old.remove(); if(!O.easy||c!=='333'||!scr) return;
  var r=easy(scr); if(!r) return; var b=document.createElement('div'); b.id='t8Easy'; b.className='t8-easy'; b.innerHTML='🍀 Easy scramble: '+[r.cross>=2?r.cross+' '+CN[r.c]+' cross edges already solved':'',r.pairs?r.pairs+' F2L pair'+(r.pairs>1?'s':'')+' already made':''].filter(Boolean).join(' and ')+'. A PB on this one is a bit lucky.'; el.parentNode.insertBefore(b,el.nextSibling); },600);
/* ---------- 6 sub-X, 7 what do I need, 9 step trends, 12 today's plan ---------- */
function target(L){ if(O.tg) return O.tg*1000; var v=L.slice(-12).map(val).filter(function(x){ return x!==Infinity; }); if(!v.length) return 0; var m=v.reduce(function(a,b){ return a+b; },0)/v.length; return Math.max(1000,Math.floor(m/1000)*1000); }
function avg5(v){ var s=v.slice().sort(function(a,b){ return a-b; }); if(s[3]===Infinity) return Infinity; return (s[1]+s[2]+s[3])/3; }
function needHtml(L,tg){ if(L.length<4) return ''; var last=L.slice(-4).map(val); var bpa=avg5(last.concat([0])), wpa=avg5(last.concat([Infinity]));
  var h='<div class="t8-row"><span>Next solve finishes an average of 5</span></div><div class="t8-tiles"><div><small>Best possible</small><b>'+fmt(bpa)+'</b></div><div><small>Worst possible</small><b>'+fmt(wpa)+'</b></div>';
  if(tg){ var msg; if(bpa>=tg) msg='sub-'+tg/1000+' is out of reach this time'; else if(wpa<tg) msg='sub-'+tg/1000+' is already safe'; else { var lo=0,hi=600000; for(var i=0;i<40;i++){ var mid=(lo+hi)/2; if(avg5(last.concat([mid]))<tg) lo=mid; else hi=mid; } msg='under '+fmt(Math.floor(lo/10)*10)+' for sub-'+tg/1000; } h+='<div><small>You need</small><b style="font-size:15px">'+msg+'</b></div>'; }
  return h+'</div>'; }
function subHtml(L,tg){ if(!tg||L.length<5) return ''; var v=L.map(val), last=v.slice(-100), n=last.filter(function(x){ return x<tg; }).length, run=0, bestRun=0, now=0; v.forEach(function(x){ if(x<tg){ run++; bestRun=Math.max(bestRun,run); } else run=0; }); for(var i=v.length-1;i>=0&&v[i]<tg;i--) now++;
  var pc=Math.round(n/last.length*100); return '<div class="t8-row"><span>Sub-'+tg/1000+' tracker</span><button type="button" class="btn sm" data-t8="tg">Change</button></div><div class="t8-bar"><i style="width:'+pc+'%"></i></div><div class="t8-tiles"><div><small>Last '+last.length+' solves</small><b>'+pc+'%</b></div><div><small>In a row now</small><b>'+now+'</b></div><div><small>Best streak</small><b>'+bestRun+'</b></div></div>'; }
function trendHtml(){ var d=T.data(), L=((d.solves||{})['333']||[]).filter(function(x){ return x&&x.sp&&x.sp.length===3&&x.p!==2; }); if(L.length<5) return '<div class="t8-row"><span>Step trends</span></div><p class="muted" style="margin:4px 0 0;font-size:13.5px">Turn on Step splits on the Timer and do 5 solves to see how your cross, F2L, OLL and PLL change over the weeks.</p>';
  var wk=function(t){ return Math.floor((t-4*864e5)/(7*864e5)); }, G={}; L.forEach(function(x){ var w=wk(x.d||0), g=G[w]||(G[w]={n:0,c:0,f:0,o:0,p:0}); g.n++; g.c+=x.sp[0]; g.f+=x.sp[1]-x.sp[0]; g.o+=x.sp[2]-x.sp[1]; g.p+=x.t-x.sp[2]; });
  var ks=Object.keys(G).map(Number).sort(function(a,b){ return a-b; }).slice(-6), ph=[['c','Cross','#ff7a1a'],['f','F2L','#3a7bff'],['o','OLL','#ffd21a'],['p','PLL','#2fd36b']];
  var mx=0; ks.forEach(function(k){ var g=G[k]; mx=Math.max(mx,(g.c+g.f+g.o+g.p)/g.n); });
  return '<div class="t8-row"><span>Step trends (3×3, by week)</span></div><div class="t8-st">'+ks.map(function(k){ var g=G[k], tot=(g.c+g.f+g.o+g.p)/g.n; return '<div title="'+g.n+' solves"><div class="t8-stb" style="height:'+Math.round(tot/mx*100)+'%">'+ph.map(function(p){ return '<i style="flex:'+(g[p[0]]/g.n)+';background:'+p[2]+'"></i>'; }).join('')+'</div><small>'+fmt(tot)+'</small></div>'; }).join('')+'</div><div class="t8-leg">'+ph.map(function(p){ var k=ks[ks.length-1], g=G[k]; return '<span><i style="background:'+p[2]+'"></i>'+p[1]+' '+fmt(g[p[0]]/g.n)+'</span>'; }).join('')+'</div>'; }
function planHtml(L){ var today=new Date().toDateString(), done=L.filter(function(x){ return new Date(x.d||0).toDateString()===today; }).length, goal=O.goal||25;
  var d=T.data(), S=((d.solves||{})['333']||[]).filter(function(x){ return x&&x.sp&&x.sp.length===3&&x.p!==2; }).slice(-50), weak=null;
  if(S.length>=5){ var c=0,f=0,o=0,p=0; S.forEach(function(x){ c+=x.sp[0]; f+=x.sp[1]-x.sp[0]; o+=x.sp[2]-x.sp[1]; p+=x.t-x.sp[2]; }); var tot=c+f+o+p, sh={cross:[c/tot,.14],f2l:[f/tot,.47],oll:[o/tot,.17],pll:[p/tot,.22]}; var w=Object.keys(sh).sort(function(a,b){ return (sh[b][0]-sh[b][1])-(sh[a][0]-sh[a][1]); })[0]; weak=w; }
  var tips={cross:['Cross','Plan the whole cross in inspection, then do it without looking at the clock.','#learn/cross'],f2l:['F2L','Slow solves with no pauses: look for the next pair while you insert this one.','#learn/f2l'],oll:['OLL','Drill the OLL cases you still do with 2-look.','#learn/oll'],pll:['PLL','Drill your slowest PLLs until each one is under 2 seconds.','#learn/pll']};
  var t=weak?tips[weak]:null;
  return '<div class="t8-row"><span>Today’s plan</span><button type="button" class="btn sm" data-t8="goal">Goal: '+goal+'</button></div><div class="t8-bar"><i style="width:'+Math.min(100,Math.round(done/goal*100))+'%"></i></div><p style="margin:6px 0 0;font-size:14px">'+(done>=goal?'✅ '+done+' solves today. Goal done!':done+' of '+goal+' solves today.')+'</p>'
   +(t?'<p style="margin:8px 0 0;font-size:14px">Your slowest step compared with most cubers is <b>'+t[0]+'</b>. '+esc(t[1])+' <a href="'+t[2]+'">Practise '+t[0]+' →</a></p>':'<p class="muted" style="margin:8px 0 0;font-size:13.5px">Turn on Step splits so the plan can find your weakest step.</p>'); }
function panel(){ var c=cur(), tg=target(c.L);
  return '<div class="pnl t8" id="t8P"><div class="row" style="align-items:center;margin-bottom:6px"><h3 style="margin:0">Practice tools</h3><span class="sp"></span><button type="button" class="btn sm" data-t8="set">⚙︎ Options</button></div>'
   +'<div class="t8-sec">'+planHtml(c.L)+'</div>'+(c.L.length>=4?'<div class="t8-sec">'+needHtml(c.L,tg)+'</div>':'')+(tg&&c.L.length>=5?'<div class="t8-sec">'+subHtml(c.L,tg)+'</div>':'')+'<div class="t8-sec">'+trendHtml()+'</div></div>'; }
function draw(){ var p=document.getElementById('t8P'); if(p){ var h=panel(); if(p.__h!==h){ var d=document.createElement('div'); d.innerHTML=h; d.firstChild.__h=h; p.replaceWith(d.firstChild); } } }
var V=PL.views.timer, o=V.show; V.show=function(el){ var r=o.apply(this,arguments); try{ var w=el.querySelector('.wrap')||el; if(!document.getElementById('t8P')){ var d=document.createElement('div'); d.innerHTML=panel(); w.appendChild(d.firstChild); } }catch(e){} return r; };
var sd=PL.solveDone; PL.solveDone=function(){ if(sd) try{ sd.apply(this,arguments); }catch(e){} setTimeout(draw,50); };
document.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('[data-t8]'); if(!b) return; var a=b.getAttribute('data-t8');
  if(a==='tg'){ var v=prompt('Your target in seconds (for example 20 for sub-20). Leave empty to pick it for you.',O.tg||''); if(v===null) return; O.tg=Math.max(0,Math.round(parseFloat(v)||0)); save(); draw(); }
  else if(a==='goal'){ var g=prompt('How many solves a day?',O.goal||25); if(g===null) return; O.goal=Math.max(1,Math.min(500,parseInt(g,10)||25)); save(); draw(); }
  else if(a==='set'){ var sh=CW.sheet('<div class="hd"><h2>Timer options</h2><button class="x" data-close aria-label="Close">✕</button></div>'+[['voice','🔊 Inspection voice','Says “8 seconds” and “12 seconds” like a competition judge. Turn on inspection to use it.'],['two','✌️ Two-hand start','On a touch screen, the timer only starts when both thumbs were on the pad, like a real competition timer.'],['easy','🍀 Easy scramble warning','Shows a note when a 3×3 scramble starts with solved cross edges or ready-made F2L pairs.']].map(function(x){ return '<label class="row t8-opt"><span><b>'+x[1]+'</b><small>'+x[2]+'</small></span><input type="checkbox" data-t8o="'+x[0]+'"'+(O[x[0]]?' checked':'')+'></label>'; }).join(''));
    sh.addEventListener('change',function(ev){ var k=ev.target.getAttribute('data-t8o'); if(!k) return; O[k]=ev.target.checked; save(); lastScr=''; if(k==='voice'&&O.voice) PL.inspSay(8); }); } });
if(O.easy===undefined){ O.easy=true; save(); }
})();
