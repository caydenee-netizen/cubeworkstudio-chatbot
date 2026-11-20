/* Where would I place? Pick a real WCA competition, do your solves (or use your last ones),
   and see where your result lands in that round's real results, and whether you'd make the next round. */
(function(){
'use strict';
if(typeof CW==='undefined'||!window.PL||!PL.T) return;
var esc=CW.esc, T=PL.T;
var TOWCA={'3h':'333oh',pyr:'pyram',skb:'skewb',mega:'minx'}, EVN={'222':'2×2','333':'3×3','444':'4×4','555':'5×5','666':'6×6','777':'7×7','333oh':'3×3 One-Handed',pyram:'Pyraminx',skewb:'Skewb',minx:'Megaminx'};
var P={comp:null,rounds:null,ri:0,ev:'333',key:'333',got:[],on:false,list:[]};
function wev(k){ return TOWCA[k]||k; }
function need(f){ return f==='a'?5:f==='m'?3:Math.max(1,Math.min(3,+f||1)); }
function cs(ms){ return Math.floor(ms/10); }
function val(x){ return x.p===2?Infinity:x.t+(x.p===1?2000:0); }
function fc(c){ if(c===-2) return 'DNS'; if(c<=0||c===Infinity) return 'DNF'; var s=c/100, m=Math.floor(s/60); return m?m+':'+(s-m*60).toFixed(2).padStart(5,'0'):s.toFixed(2); }
function dt(s){ try{ return new Date(s+'T00:00:00').toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric'}); }catch(e){ return s; } }
/* WCA rules: Ao5 drops best and worst (2+ DNFs = DNF); mean of 3 needs all 3 */
function score(L,f){ var v=L.map(function(x){ var y=val(x); return y===Infinity?Infinity:cs(y); }), best=Math.min.apply(null,v), avg=0;
  if(f==='a'){ var s=v.slice().sort(function(a,b){ return a-b; }); avg=s[3]===Infinity?-1:Math.round((s[1]+s[2]+s[3])/3); }
  else if(f==='m'){ avg=v.some(function(x){ return x===Infinity; })?-1:Math.round((v[0]+v[1]+v[2])/3); }
  return {best:best===Infinity?-1:best,avg:avg,v:v}; }
function better(a,b,byAvg){ /* is entry a ranked ahead of b? entries: [avg,best] */
  function k(x){ return x>0?x:1e12; }
  if(byAvg){ if(k(a[0])!==k(b[0])) return k(a[0])<k(b[0]); return k(a[1])<k(b[1]); } return k(a[1])<k(b[1]); }

/* ---------- step 1: pick a competition ---------- */
async function pick(){ var sh=CW.sheet('<div class="hd"><h2>📍 Where would I place?</h2><button class="x" data-close aria-label="Close">✕</button></div>'
  +'<p class="muted" style="margin:0 0 10px;font-size:14px">Pick a real WCA competition. Your solves go into that round’s real results.</p>'
  +'<div class="row" style="gap:8px"><input class="in" id="wpQ" placeholder="Search any competition (e.g. Malaysia, Asian, Worlds)" style="flex:1" autocomplete="off"></div><div id="wpL" class="wp-l" style="margin-top:10px"><p class="muted">Loading Malaysian competitions…</p></div>'), tm=0;
  async function load(q){ var box=sh.querySelector('#wpL'); box.innerHTML='<p class="muted">Loading…</p>'; var r=await CW.call('/api/wca',{act:'past',q:q||'',cc:'MY'},15000);
    var L=r.ok?(r.data.list||[]):[]; P.list=L; if(!sh.isConnected) return;
    box.innerHTML=L.length?L.map(function(c,i){ return '<button type="button" class="wp-c" data-wpc="'+i+'"><b>'+esc(c.n)+'</b><small>'+esc(c.city)+(c.cc?' · '+esc(c.cc):'')+' · '+esc(dt(c.s))+'</small></button>'; }).join(''):'<p class="muted">'+(r.ok&&r.data.err?esc(r.data.err):'No competitions found. Try another search.')+'</p>'; }
  sh.querySelector('#wpQ').oninput=function(){ var v=this.value.trim(); clearTimeout(tm); tm=setTimeout(function(){ if(v.length===0||v.length>=3) load(v); },400); };
  sh.addEventListener('click',function(e){ var b=e.target.closest('[data-wpc]'); if(!b) return; var c=P.list[+b.getAttribute('data-wpc')]; sh.close&&sh.close(); openComp(c); });
  load(''); }

/* ---------- step 2: the competition's rounds ---------- */
async function openComp(c){ P.comp=c; P.key=(T.data()||{}).cube||'333'; P.ev=wev(P.key);
  var sh=CW.sheet('<div class="hd"><h2>'+esc(c.n)+'</h2><button class="x" data-close aria-label="Close">✕</button></div><div id="wpR"><p class="muted">Loading results from the WCA…</p></div>'), box=sh.querySelector('#wpR');
  if(c.ev&&c.ev.length&&c.ev.indexOf(P.ev)<0){ box.innerHTML='<p>This competition didn’t hold <b>'+esc(EVN[P.ev]||P.ev)+'</b>, the cube your timer is set to.</p><p class="muted">Change the cube on the timer, or pick another competition.</p><button class="btn" type="button" data-wpback>← Pick another</button>'; bindBack(sh); return; }
  var r=await CW.call('/api/wca',{act:'res',comp:c.id,ev:P.ev},20000); if(!sh.isConnected) return;
  if(!r.ok||!r.data.rounds||!r.data.rounds.length){ box.innerHTML='<p>'+esc((r.data&&r.data.error)||'No '+(EVN[P.ev]||P.ev)+' results found for this competition.')+'</p><button class="btn" type="button" data-wpback>← Pick another</button>'; bindBack(sh); return; }
  P.rounds=r.data.rounds; P.ri=0;
  function draw(){ var R=P.rounds[P.ri], n=need(R.fmt), win=R.L[0], mine=myLast(n);
    box.innerHTML='<p class="muted" style="margin:0 0 8px">'+esc(c.city)+' · '+esc(dt(c.s))+' · '+esc(EVN[P.ev]||P.ev)+'</p>'
     +'<div class="seg wp-seg">'+P.rounds.map(function(x,i){ return '<button type="button" data-wpr="'+i+'" aria-pressed="'+(i===P.ri)+'">'+esc(x.n)+'</button>'; }).join('')+'</div>'
     +'<div class="t8-tiles" style="margin-top:12px"><div><small>Competitors</small><b>'+R.L.length+'</b></div><div><small>Winner</small><b>'+esc(fc(R.fmt==='a'||R.fmt==='m'?win[4]:win[3]))+'</b></div><div><small>Format</small><b>'+(R.fmt==='a'?'Average of 5':R.fmt==='m'?'Mean of 3':'Best of '+n)+'</b></div></div>'
     +'<div class="wp-go"><button class="btn pri" type="button" data-wpgo>⏱ Do '+n+' solves now</button>'+(mine?'<button class="btn" type="button" data-wplast>Use my last '+n+' solves</button>':'')+'</div>'
     +'<p class="muted" style="font-size:12.5px;margin:10px 0 0">Solve on your real cube with the timer. Inspection and +2 count, just like at a competition.</p>'; }
  draw();
  sh.addEventListener('click',function(e){ var t;
    if((t=e.target.closest('[data-wpr]'))){ P.ri=+t.getAttribute('data-wpr'); draw(); return; }
    if(e.target.closest('[data-wplast]')){ var R=P.rounds[P.ri]; sh.close&&sh.close(); result(myLast(need(R.fmt))); return; }
    if(e.target.closest('[data-wpgo]')){ sh.close&&sh.close(); start(); } });
  bindBack(sh); }
function bindBack(sh){ sh.addEventListener('click',function(e){ if(e.target.closest('[data-wpback]')){ sh.close&&sh.close(); pick(); } }); }
function myLast(n){ var L=((T.data()||{}).solves||{})[P.key]||[]; L=L.filter(function(x){ return x&&typeof x.t==='number'; }); return L.length>=n?L.slice(-n):null; }

/* ---------- step 3: comp mode on the timer ---------- */
function start(){ P.on=true; P.got=[]; if(!/^#timer/.test(location.hash)) location.hash='#timer'; chip(); CW.toast('Comp mode on. Do your solves on the timer.'); }
function stop(){ P.on=false; chip(); }
function chip(){ var c=document.getElementById('wpChip'); if(!P.on){ if(c) c.remove(); return; } var R=P.rounds[P.ri], n=need(R.fmt);
  if(!c){ c=document.createElement('div'); c.id='wpChip'; c.className='wp-chip'; document.body.appendChild(c); }
  c.innerHTML='<span>📍</span><div><b>'+esc(P.comp.n)+'</b><small>'+esc(R.n)+' · solve '+Math.min(n,P.got.length+1)+' of '+n+(P.got.length?' · '+P.got.map(function(x){ return x.p===2?'DNF':T.fmt(val(x))+(x.p===1?'+':''); }).join(', '):'')+'</small></div><button type="button" data-wpx aria-label="Stop comp mode">✕</button>'; }
var sd=PL.solveDone; PL.solveDone=function(rec,cube){ if(sd) try{ sd.apply(this,arguments); }catch(e){} if(!P.on) return; if(cube!==P.key){ CW.toast('Comp mode is for '+(EVN[P.ev]||P.ev)+'. Switch the timer back to that cube.'); return; }
  P.got.push(rec); var n=need(P.rounds[P.ri].fmt); chip(); if(P.got.length>=n){ var g=P.got.slice(0,n); stop(); setTimeout(function(){ result(g); },900); } };
document.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('[data-wpx]')){ if(confirm('Stop comp mode? Solves so far won’t be placed.')) stop(); } });

/* ---------- the result ---------- */
function result(L){ var R=P.rounds[P.ri], byAvg=R.fmt==='a'||R.fmt==='m', me=score(L,R.fmt), mine=[me.avg,me.best];
  var all=R.L.map(function(x){ return {n:x[1],cc:x[2],e:[x[4],x[3]],me:false}; }), place=1;
  all.forEach(function(x){ if(better(x.e,mine,byAvg)) place++; });
  var rows=all.slice(); rows.splice(place-1,0,{n:PL.name()||'You',cc:'',e:mine,me:true}); var total=rows.length;
  var nxt=P.rounds[P.ri+1], cut=nxt?nxt.L.length:0, beat=total>1?Math.round((total-place)/(total-1)*100):100, myS=byAvg?me.avg:me.best, dnf=myS<=0;
  var verdict=dnf?'<b>DNF</b>, so you’d finish at the bottom of this round.':!nxt?(place===1?'🥇 <b>You’d win the '+esc(R.n.toLowerCase())+'!</b>':place<=3?['','','🥈','🥉'][place]+' <b>You’d be on the podium!</b>':'You’d finish '+ord(place)+' in the final.'):(place<=cut?'✅ <b>You’d make the '+esc(nxt.n.toLowerCase())+'</b> (top '+cut+' went through).':'❌ You’d miss the '+esc(nxt.n.toLowerCase())+' by '+(place-cut)+' place'+(place-cut===1?'':'s')+'. Top '+cut+' went through.');
  var gap=''; if(!dnf){ var tgt=nxt&&place>cut?rows[cut-1]:(!nxt&&place>3?rows[2]:null); if(tgt&&!tgt.me){ var tv=byAvg?tgt.e[0]:tgt.e[1]; if(tv>0) gap='<p class="muted" style="margin:6px 0 0">You needed '+fc(tv)+' or faster ('+((myS-tv)/100).toFixed(2)+' seconds quicker).</p>'; } }
  var show={}; [0,1,2].forEach(function(i){ show[i]=1; }); for(var i=place-3;i<=place+1;i++) if(i>=0&&i<total) show[i]=1; if(cut&&cut-1<total) show[cut-1]=1;
  var tb='', prev=-1; Object.keys(show).map(Number).sort(function(a,b){ return a-b; }).forEach(function(i){ if(prev>=0&&i>prev+1) tb+='<div class="wp-gap">⋯</div>'; prev=i; var x=rows[i];
    tb+='<div class="wp-row'+(x.me?' me':'')+(cut&&i===cut-1?' cut':'')+'"><span class="p">'+(i+1)+'</span><span class="n">'+esc(x.n)+(x.cc&&!x.me?' <small>'+esc(x.cc)+'</small>':'')+'</span><span class="t">'+fc(byAvg?x.e[0]:x.e[1])+'</span>'+(byAvg?'<span class="b">'+fc(x.e[1])+'</span>':'')+'</div>'; });
  var share='I would have placed '+ord(place)+' of '+total+' in the '+R.n.toLowerCase()+' of '+P.comp.n+' with a '+(byAvg?(R.fmt==='a'?''+fc(me.avg)+' average':fc(me.avg)+' mean'):fc(me.best)+' single')+'! Try it: cubeworkstudio.com/play';
  var sh=CW.sheet('<div class="hd"><h2>📍 Your result</h2><button class="x" data-close aria-label="Close">✕</button></div>'
   +'<div class="wp-hero"><small>'+esc(P.comp.n)+' · '+esc(R.n)+'</small><b>'+(dnf?'DNF':ord(place))+'</b><span>of '+total+(dnf?'':' · beat '+beat+'% of the field')+'</span></div>'
   +'<div class="t8-tiles"><div><small>'+(byAvg?(R.fmt==='a'?'Your average':'Your mean'):'Your best')+'</small><b>'+fc(myS)+'</b></div><div><small>Your solves</small><b style="font-size:14px">'+me.v.map(function(c){ return c===Infinity?'DNF':fc(c); }).join(' · ')+'</b></div></div>'
   +'<p style="margin:12px 0 0">'+verdict+'</p>'+gap
   +'<div class="wp-tb"><div class="wp-row h"><span class="p">#</span><span class="n">Name</span><span class="t">'+(byAvg?(R.fmt==='a'?'Average':'Mean'):'Best')+'</span>'+(byAvg?'<span class="b">Best</span>':'')+'</div>'+tb+'</div>'
   +(cut?'<p class="muted" style="font-size:12px;margin:6px 0 0">The dashed line is the cut for the next round.</p>':'')
   +'<div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn pri" type="button" data-wpagain>Try again</button><button class="btn" type="button" data-wpcopy>Copy to share</button><button class="btn" type="button" data-wpback>Another competition</button></div>'
   +'<p class="muted" style="font-size:11.5px;margin:10px 0 0">Results from the World Cube Association. Just for fun: your solves are not official.</p>');
  sh.addEventListener('click',function(e){ if(e.target.closest('[data-wpagain]')){ sh.close&&sh.close(); start(); } if(e.target.closest('[data-wpcopy]')) CW.copy(share,e.target); });
  bindBack(sh); try{ var H=CW.lsJ('cw_wplace',[])||[]; H.push({c:P.comp.n,r:R.n,p:place,n:total,at:Date.now()}); CW.setJ('cw_wplace',H.slice(-30)); }catch(e){} }
function ord(n){ var s=['th','st','nd','rd'], v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); }
PL.wplace={pick:pick,_P:P,_score:score,_result:result};

/* ---------- entry: a strip in the Timer's Competitions panel ---------- */
function add(){ var cp=document.getElementById('c8Cp'); if(!cp||cp.querySelector('.wp-strip')) return; var d=document.createElement('button'); d.type='button'; d.className='wp-strip'; d.setAttribute('data-wpopen','');
  d.innerHTML='<span class="i">📍</span><span><b>Where would I place?</b><small>Put your solves into a real WCA competition’s results</small></span><span class="a">›</span>'; var h=cp.querySelector('.row'); if(h&&h.nextSibling) cp.insertBefore(d,h.nextSibling); else cp.appendChild(d); }
document.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('[data-wpopen]')) pick(); });
new MutationObserver(function(){ if(document.getElementById('c8Cp')) add(); if(P.on&&!document.getElementById('wpChip')) chip(); }).observe(document.documentElement,{childList:true,subtree:true});
})();
