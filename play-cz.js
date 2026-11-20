/* /play: live extras everyone sees (announcements, surprises, polls, creator live streams, creator events,
   tournaments) and The Cubing Zone creator panel (🎥 button, only for accounts the owner made creators). */
(function(){
'use strict';
var $=CW.$, esc=CW.esc, ls=CW.ls, PL=window.PL, LV=PL.live;
function me(){ return CW.devId(); }
function errOf(r){ return (r.data&&r.data.error)||(r.status===0?'Could not reach the live server.':'Something went wrong. Try again.'); }

/* ---------- confetti (no library) ---------- */
function confetti(){ var c=document.createElement('canvas'); c.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:90'; document.body.appendChild(c);
  var W=c.width=innerWidth, H=c.height=innerHeight, x=c.getContext('2d'), C=['#e1352b','#f2b600','#1f9a52','#2650f5','#ff7a1a','#ffffff'], P=[];
  for(var i=0;i<160;i++) P.push({x:W/2+(Math.random()-.5)*W*.3,y:H*.35,vx:(Math.random()-.5)*14,vy:-Math.random()*14-4,s:4+Math.random()*6,c:C[i%6],r:Math.random()*6});
  var t0=performance.now(); (function f(t){ x.clearRect(0,0,W,H); P.forEach(function(p){ p.vy+=.35; p.x+=p.vx; p.y+=p.vy; p.r+=.1; x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.fillStyle=p.c; x.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6); x.restore(); });
    if(t-t0<3200) requestAnimationFrame(f); else c.remove(); })(t0); }
PL.confetti=confetti;

/* ---------- strip under the header: creator live, tournament, creator event ---------- */
var strip=document.createElement('div'); strip.id='czStrip'; strip.className='wrap'; strip.style.cssText='display:flex;flex-direction:column;gap:8px;padding-top:10px';
function mountStrip(){ var m=$('#app'); if(m&&!strip.isConnected) m.parentNode.insertBefore(strip,m); }
function drawStrip(){ mountStrip(); var h='', n=PL.now();
  var L=LV.livex; if(L&&L.e>n) h+='<div class="racebar" style="margin:0;background:#c8352b;color:#fff;grid-template-columns:auto 1fr auto"><span class="flag">🔴</span><div><b>'+esc(L.n)+' is live</b><small>'+esc(L.t)+'</small></div><div class="row" style="gap:6px;flex-wrap:nowrap">'+(window.CWLive&&CWLive.embed(L.u)?'<button type="button" class="btn" data-live-watch style="background:#fff;color:#111">Watch here</button>':'')+'<a class="btn" href="'+esc(L.u)+'" target="_blank" rel="noopener" style="background:#fff;color:#111">'+(window.CWLive&&CWLive.embed(L.u)?'Open':'Watch')+'</a></div></div>';
  var T=LV.tour; if(T&&T.st!=='done'){ var txt=T.st==='reg'?(T.joined?'You are in. Heats start in '+PL.mmss(T.regEnd-n)+'.':'Join before '+PL.mmss(T.regEnd-n)+' runs out. '+(T.ko?'Knockout: heats of 10, the top half of each heat goes through, round after round, until the final.':'Heats of 10, the top 3 of each reach the final.')):T.st==='heats'?((T.ko&&T.round>1?'Round '+T.round+'. ':'')+(T.out?'You are out. Watch for the champion.':T.room?'Your heat is ready.':'Heats are racing.')):T.st==='final'?(T.room?'You made the final!':T.out?'You are out. Watch for the champion.':'The final is racing.'):'';
    h+='<div class="racebar" style="margin:0;background:#b8860b;color:#fff;grid-template-columns:auto 1fr auto"><span class="flag">🏆</span><div><b>Cube Race Tournament · '+T.n+' racers</b><small>'+esc(txt)+'</small></div>'
      +(T.st==='reg'&&!T.joined?'<button class="btn" data-cz="tjoin" style="background:#fff;color:#111">Join</button>':T.room?'<button class="btn" data-cz="troom" style="background:#fff;color:#111">Race</button>':'<span></span>')+'</div>'; }
  else if(T&&T.st==='done'&&T.champ) h+='<div class="note">🏆 Tournament champion: <b>'+esc(T.champ)+'</b></div>';
  var C=LV.ce; if(C&&C.e>n) h+='<div class="racebar" style="margin:0;background:#0b3b44;color:#c9fffb;grid-template-columns:auto 1fr auto"><span class="flag">🎥</span><div><b>'+esc(C.bn)+': '+esc(C.ti)+'</b><small>Beat '+PL.fmt(C.t)+' on the event track · ends in '+PL.mmss(C.e-n)+'</small></div><button class="btn" data-cz="ce" style="background:#27e6dc;color:#04161a">Play</button></div>';
  if(strip.innerHTML!==h) strip.innerHTML=h; strip.style.display=h?'flex':'none';
  ccBtn(); }
strip.addEventListener('click',function(e){ var b=e.target.closest('[data-cz]'); if(!b) return; var a=b.getAttribute('data-cz');
  if(a==='tjoin') tJoin(b); else if(a==='troom') tRoom(); else if(a==='ce') PL.ceStart(); });
setInterval(function(){ if(LV.livex||LV.tour||LV.ce) drawStrip(); },1000);

/* ---------- tournament ---------- */
async function tJoin(b){ b.disabled=true; var r=await CW.call('/api/tour/join',{id:me(),name:PL.name(),car:window.CWRaceEngine?CWRaceEngine.raceCar():0},7000); if(!r.ok){ CW.toast(r.status===410?'Sign-ups have closed.':errOf(r)); b.disabled=false; return; } LV.tour=r.data.tour; drawStrip(); CW.toast('You are in the tournament!'); }
var tSeen='';
async function tRoom(){ var r=await CW.call('/api/tour/room',{id:me()},7000); if(!r.ok){ CW.toast('Your race is not ready yet.'); return; } PL.raceEnter(r.data.room); }
function tAuto(){ var T=LV.tour; if(!T||!T.room||LV.roomId) return; if(tSeen===T.room) return; tSeen=T.room; tRoom(); }

/* ---------- creator event (beat the creator's time) ---------- */
PL.ceStart=async function(){ var r=await CW.call('/api/ce/start',{id:me()},7000); if(!r.ok||r.data.seed==null){ CW.toast(r.status===404?'This event has ended.':errOf(r)); return; }
  PL.racePractice({seed:r.data.seed,len:r.data.len||'n',ce:true,target:r.data.target,wx:'cubingzone'}); };

/* ---------- announcements and surprises (events of type msg / burst) ---------- */
var seen={}; try{ seen=JSON.parse(sessionStorage.getItem('cw2_evseen')||'{}')||{}; }catch(e){}
function events(){ var n=PL.now();
  LV.events.forEach(function(e){ if(seen[e.id]||e.exp<n) return; seen[e.id]=1;
    if(e.type==='msg') announce(e.data||'',e.by); else if(e.type==='burst'){ confetti(); announce(e.data||'Surprise!',e.by); } });
  try{ sessionStorage.setItem('cw2_evseen',JSON.stringify(seen)); }catch(e){} }
function announce(t,by){ if(!t) return; var old=document.getElementById('czAnn'); if(old) old.remove();
  var d=document.createElement('div'); d.id='czAnn'; d.setAttribute('role','alert');
  d.style.cssText='position:fixed;inset:0;z-index:95;display:grid;place-items:center;padding:20px;background:rgba(10,12,16,.5);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);animation:czFade .25s ease-out';
  var own=by==='Owner';
  d.innerHTML='<div class="czAc"><i class="czAb"></i><div class="czAk">Announcement'+(own?' · from the owner':'')+'</div><p>'+esc(t)+'</p><button class="btn pri" type="button">OK</button><u class="czAt"></u></div>';
  if(!document.getElementById('czAnnCss')){ var st=document.createElement('style'); st.id='czAnnCss'; st.textContent='@keyframes czFade{from{opacity:0}to{opacity:1}}@keyframes czPop{0%{opacity:0;transform:translateY(24px) scale(.9)}60%{transform:translateY(-4px) scale(1.02)}100%{opacity:1;transform:none}}@keyframes czSh{to{background-position:300% 0}}@keyframes czTm{from{transform:scaleX(1)}to{transform:scaleX(0)}}'
    +'.czAc{position:relative;overflow:hidden;max-width:min(540px,92vw);background:var(--card);color:var(--ink);border-radius:24px;padding:30px 26px 26px;text-align:center;box-shadow:0 0 0 1px rgba(255,255,255,.12),0 30px 90px -20px rgba(0,0,0,.7),0 0 60px -10px var(--blue);animation:czPop .45s cubic-bezier(.2,.9,.3,1.2)}'
    +'.czAb{position:absolute;left:0;right:0;top:0;height:5px;background:linear-gradient(90deg,var(--blue),#ff2bd6,#ffd36b,var(--blue));background-size:300% 100%;animation:czSh 3s linear infinite}'
    +'.czAk{font:800 12px/1 var(--display);letter-spacing:.16em;text-transform:uppercase;color:var(--blue);margin-bottom:14px}'
    +'.czAc p{font:800 clamp(22px,5vw,32px)/1.22 var(--display);margin:0 0 20px;word-break:break-word}'
    +'.czAt{position:absolute;left:0;right:0;bottom:0;height:4px;background:var(--blue);opacity:.7;transform-origin:left;animation:czTm 12s linear forwards}'; document.head.appendChild(st); }
  d.addEventListener('click',function(){ d.remove(); }); document.body.appendChild(d); setTimeout(function(){ if(d.isConnected) d.remove(); },12000); }

/* ---------- live poll (owner or creator) ---------- */
var pollHide={};
function drawPoll(){ var P=LV.pollx, box=$('#czPoll'); if(!P||pollHide[P.pid]||(P.closed&&P.mine<0)){ if(box) box.remove(); return; }
  if(!box){ box=document.createElement('div'); box.id='czPoll'; box.className='pnl wrap'; box.style.cssText='max-width:560px;margin:10px auto 0;border-color:var(--blue)'; mountStrip(); strip.parentNode.insertBefore(box,strip.nextSibling);
    box.addEventListener('click',async function(e){ var x=e.target.closest('[data-px]'); if(x){ pollHide[LV.pollx.pid]=1; box.remove(); return; } var o=e.target.closest('[data-pv]'); if(!o) return;
      var r=await CW.call('/api/vote',{id:me(),pid:LV.pollx.pid,opt:+o.getAttribute('data-pv')},6000); if(!r.ok){ CW.toast(errOf(r)); return; } if(r.data&&r.data.poll) LV.pollx=r.data.poll; else LV.pollx.mine=+o.getAttribute('data-pv'); PL.poll(); drawPoll(); }); }
  var show=P.mine>=0||P.closed, tot=P.total||0;
  var h='<div class="row"><span class="eyebrow">'+(P.closed?'Poll closed':'Quick poll')+'</span><span class="sp"></span><button class="x" data-px aria-label="Hide poll" style="width:28px;height:28px">✕</button></div><p style="font-weight:600;margin:6px 0 10px">'+esc(P.q)+'</p>'
    +P.opts.map(function(o,i){ var n=P.counts[i]||0, pc=tot?Math.round(n*100/tot):0;
      return show?'<div style="position:relative;border:1px solid var(--line);border-radius:10px;padding:8px 10px;margin-bottom:6px;overflow:hidden"><i style="position:absolute;inset:0;width:'+pc+'%;background:var(--blue-soft)"></i><span style="position:relative">'+esc(o)+(P.mine===i?' ✓':'')+'</span><b class="mono" style="position:relative;float:right">'+pc+'%</b></div>'
        :'<button class="btn wide" data-pv="'+i+'" style="margin-bottom:6px;justify-content:flex-start">'+esc(o)+'</button>'; }).join('')+(show?'<small class="muted">'+tot+' vote'+(tot===1?'':'s')+'</small>':'');
  if(box.dataset.h!==h){ box.dataset.h=h; box.innerHTML=h; } }

/* ---------- 🎁 Cubing Zone Drop: tap fast, the first few get tokens ---------- */
var dropSeen='', dropGot={}, dropHide='';
function drawDrop(){ var D=LV.drop, box=document.getElementById('czDrop');
  if(D&&(D.mine||dropGot[D.did])) dropHide=D.did; /* once you have claimed (or closed it), this drop never pops up again */
  if(!D||dropHide===D.did||(D.over&&D.n===0)){ if(box) box.remove(); return; }
  if(dropSeen!==D.did){ dropSeen=D.did; dropHide=''; try{ if(navigator.vibrate) navigator.vibrate(60); }catch(e){} }
  if(!box){ box=document.createElement('div'); box.id='czDrop'; box.setAttribute('role','dialog'); box.className='czdrop';
    box.addEventListener('click',async function(e){ if(e.target.closest('[data-dx]')){ dropHide=LV.drop.did; box.remove(); return; }
      var b=e.target.closest('[data-dc]'); if(!b) return; b.disabled=true; var r=await CW.call('/api/drop',{id:me()},6000);
      if(r.ok&&r.data){ if(r.data.drop) LV.drop=r.data.drop; if(r.data.ok){ dropGot[LV.drop.did]=r.data.place; confetti(); CW.toast('You got #'+r.data.place+'! +'+r.data.val+' tokens'); } else CW.toast(r.data.error||'Too late.'); } else CW.toast(errOf(r)); drawDrop(); });
    document.body.appendChild(box); }
  var mine=D.mine||dropGot[D.did]||0, left=Math.max(0,D.left), h='<div class="czdc"><button class="x" data-dx aria-label="Close" style="position:absolute;top:10px;right:10px">✕</button>'
    +(D.free?'<div class="czlg" style="font-size:44px;line-height:1">'+(D.ma?'🛡️':'🎁')+'</div><span class="czk">Drop · from '+esc(D.by)+'</span>':'<div class="czlg"><img src="/czlogo.png" alt=""><i></i></div><span class="czk">Cubing Zone Drop · from '+esc(D.by)+'</span>')
    +'<h2>'+(D.over?(mine?'You got #'+mine+'!':'All gone'):D.val+' tokens, first '+D.max+' players')+'</h2>'
    +'<div class="czbar"><i id="czdb"></i></div><small class="mono" id="czdn"></small>'
    +(D.over?(D.w&&D.w.length?'<p class="czw">'+D.w.map(function(n,i){ return '<b>#'+(i+1)+'</b> '+esc(n); }).join(' · ')+'</p>':'')
      :mine?'<p class="czw"><b>You are #'+mine+'.</b> Your tokens are on the way.</p>':'<button class="btn pri wide czgo" data-dc>TAP TO CLAIM</button>')
    +'</div>';
  var key=D.did+'|'+D.over+'|'+mine+'|'+(D.over?(D.w||[]).join(','):'');
  if(box.dataset.h!==key){ box.dataset.h=key; box.innerHTML=h; }
  var bar=document.getElementById('czdb'), nn=document.getElementById('czdn');
  if(bar) bar.style.width=Math.min(100,Math.round(D.n*100/D.max))+'%'; if(nn) nn.textContent=D.n+' / '+D.max+' claimed'+(D.over?'':' · '+left+' s left'); }
PL.onLive(drawDrop); setInterval(function(){ if(LV.drop) drawDrop(); },1000);

/* ---------- 🎥 creator button and panel ---------- */
function ccBtn(){ var fab=document.querySelector('.fab'), b=$('#czCC'); if(!LV.cc){ if(b) b.remove(); return; } if(b||!fab) return;
  b=document.createElement('a'); b.id='czCC'; b.href='#'; b.textContent=LV.ma?'🛡️ Mini Admin':'🎥 Creator'; b.style.background=LV.ma?'#3a0b12':'#0b3b44'; b.style.color=LV.ma?'#ffd9a0':'#c9fffb'; b.onclick=function(e){ e.preventDefault(); openCC(); }; fab.insertBefore(b,fab.firstChild); }
var CCS={info:null};
async function cc(act,x){ var r=await CW.call('/api/cc',Object.assign({id:me(),act:act},x||{}),9000); if(r.ok&&r.data&&r.data.name) CCS.info=r.data; CCS.err=''; if(r.ok&&r.data&&r.data.ok===false){ CCS.err=r.data.error||'Not allowed.'; if(!CCS.quiet) CW.toast(CCS.err); return false; } if(!r.ok){ CCS.err=errOf(r); if(!CCS.quiet) CW.toast(CCS.err); return false; } return true; }
async function openCC(){ if(!(await cc('info'))) return; drawCC(); }
function drawCC(){ var I=CCS.info; if(!I) return; if(I.ma) return drawMA(I); var old=$('#czCCp'); var keep={}; if(old) old.querySelectorAll('[data-f]').forEach(function(i){ keep[i.getAttribute('data-f')]=i.value; });
  var users=I.users||[], ce=I.ce||{};
  var sh=old||CW.sheet('',function(){}); sh.id='czCCp';
  var box=sh.querySelector('.box'); box.style.maxWidth='620px';
  box.classList.add('czbox');
  box.innerHTML='<div class="czhero"><button class="x" data-close aria-label="Close">✕</button>'+(I.ma?'<div class="czlg" style="display:grid;place-items:center;font-size:44px">🛡️</div><div class="czht"><span class="czk">Mini admin panel · Cubeworkstudio</span><h2>'+esc(I.name)+'</h2>':'<div class="czlg"><img src="/czlogo.png" alt="The Cubing Zone"><i></i></div><div class="czht"><span class="czk">Creator panel · Sponsored by Cubeworkstudio</span><h2>The Cubing Zone</h2>')+(I.live?'<span class="czon">● You’re live · '+I.live.left+' min left</span>':'<span class="czoff">Not live right now</span>')+'</div></div>'
    +'<div class="czst"><div><b>'+I.online+'</b><small>Online now</small></div><div><b>'+I.today+'</b><small>Players today</small></div><div><b>'+I.left.t.toLocaleString()+'</b><small>Gift tokens left</small></div><div><b>'+I.left.x.toLocaleString()+'</b><small>Gift XP left</small></div></div>'
    +sec('Go live')+(I.live?'<p class="note">You are live: “'+esc(I.live.t)+'” · '+I.live.left+' min left</p><button class="btn" data-c="endlive" style="margin-top:8px">End live</button>'
      :inp('lt','What are you streaming?')+inp('lu','https:// link (YouTube, Twitch, TikTok, Instagram, Facebook, X)')+'<div class="row">'+inp('lh','Hours','number','2')+'<button class="btn pri" data-c="live">Go live</button></div>')
    +sec('Announce')+'<div class="row">'+inp('ann','Message for everyone online')+'<button class="btn pri" data-c="announce">Send</button><button class="btn" data-c="burst">Surprise</button></div>'
    +sec('Race')+'<div class="row"><select class="in" data-f="rl" style="width:130px"><option value="s">Short</option><option value="n" selected>Normal</option><option value="l">Long</option></select><button class="btn pri" data-c="race">'+(I.ma?'Open a race':'Open a Cubing Zone race')+'</button></div>'+(I.ma?'':'<p class="muted" style="font-size:13px;margin-top:4px">The winner gets The Cubing Zone pad skin.</p>')
    +sec('Poll')+(I.poll&&!I.poll.closed?'<p class="note">“'+esc(I.poll.q)+'” · '+I.poll.total+' votes</p><button class="btn" data-c="pollclose" style="margin-top:8px">Close poll</button>'
      :inp('pq','Question')+'<div class="row">'+inp('p0','Option 1')+inp('p1','Option 2')+'</div><div class="row">'+inp('p2','Option 3 (optional)')+inp('p3','Option 4 (optional)')+'</div><div class="row">'+inp('ps','Seconds open (blank = 1 hour)','number')+'<button class="btn pri" data-c="poll">Send poll</button></div>')
    +sec('Gift')+'<div class="row"><select class="in" data-f="gto" style="flex:1"><option value="all">Everyone online</option>'+users.map(function(u){ return '<option value="'+esc(u.id)+'">'+esc(u.name)+'</option>'; }).join('')+'</select><select class="in" data-f="gk" style="width:150px"><option value="tokens">Tokens</option><option value="xp">XP</option>'+(I.ma?'':'<option value="skin">Cubing Zone skin</option>')+'</select>'+inp('gv','Amount','number')+'</div><button class="btn pri" data-c="gift" style="margin-top:8px">Send gift</button><p class="muted" style="font-size:13px;margin-top:4px">One person: up to '+I.max.t+' tokens or '+I.max.x+' XP. Everyone: up to '+I.max.at+' tokens or '+I.max.ax+' XP each.</p>'
    +sec(I.ma?'🎁 Drop':'🎁 Cubing Zone Drop')+(I.drop&&!I.drop.over?'<p class="note">Drop is live · '+I.drop.n+' / '+I.drop.max+' claimed · '+I.drop.left+' s left'+(I.drop.w&&I.drop.w.length?'<br><small>'+I.drop.w.map(function(n,i){ return '#'+(i+1)+' '+esc(n); }).join(' · ')+'</small>':'')+'</p><button class="btn" data-c="dropend" style="margin-top:8px">End drop</button>'
      :'<p class="muted" style="font-size:13px;margin:-2px 0 8px">A glowing pop-up appears on everyone’s screen. The first players to tap get the tokens. You only pay for what is claimed.</p><div class="row">'+inp('dn','How many players','number','25')+inp('dv','Tokens each','number','50')+'<button class="btn pri" data-c="drop">Drop it</button></div>'+(I.drop&&I.drop.over&&I.drop.n?'<p class="muted" style="font-size:13px">Last drop: '+I.drop.n+' / '+I.drop.max+' claimed.</p>':''))
    +sec('Commands')+'<div class="row"><input class="in" data-f="cmd" placeholder="/help" style="flex:1;min-width:0"><button class="btn pri" data-c="cmd">Run</button></div><div id="czCmdOut" class="muted" style="font-size:13px;margin-top:6px;white-space:pre-line">'+esc(CCS.out||'Type /help to see what you can do.')+'</div>'
    +sec('Beat my time event')+(ce.on?'<p class="note">“'+esc(ce.ti)+'” · target '+PL.fmt(ce.target)+' · '+ce.n+' players · '+ce.beat+' beat it · '+PL.mmss(ce.left)+' left</p>'+(ce.entries&&ce.entries.length?'<div class="list">'+ce.entries.map(function(x){ return '<div><b class="mono">'+x.r+'</b><span>'+esc(x.name)+'</span><span class="sp"></span><span class="mono">'+PL.fmt(x.ms)+'</span></div>'; }).join('')+'</div>':'')+'<div class="row" style="margin-top:8px"><button class="btn" data-c="ceplay">Play it</button><button class="btn" data-c="ceend">End event and send prizes</button></div>'
      :inp('cet','Event name')+'<div class="row">'+inp('cetg','Your time in seconds, e.g. 45.5')+'<select class="in" data-f="cel" style="width:120px"><option value="s">Short</option><option value="n" selected>Normal</option><option value="l">Long</option></select>'+inp('cem','Minutes','number','30')+'</div><button class="btn pri" data-c="ce" style="margin-top:8px">Start event</button>');
  Object.keys(keep).forEach(function(k){ var i=box.querySelector('[data-f="'+k+'"]'); if(i&&keep[k]) i.value=keep[k]; });
  if(!sh.dataset.w){ sh.dataset.w='1'; sh.addEventListener('click',async function(e){ var b=e.target.closest('[data-c]'); if(!b) return; var k=b.getAttribute('data-c'), v=function(n){ var i=box.querySelector('[data-f="'+n+'"]'); return i?i.value.trim():''; }, ok=false; b.disabled=true;
    if(k==='live') ok=await cc('live',{text:v('lt'),url:v('lu'),hours:+v('lh')||2});
    else if(k==='endlive') ok=await cc('endlive');
    else if(k==='announce') ok=await cc('announce',{text:v('ann')});
    else if(k==='burst') ok=await cc('burst');
    else if(k==='race') ok=await cc('race',{len:v('rl')});
    else if(k==='poll') ok=await cc('poll',{q:v('pq'),opts:[v('p0'),v('p1'),v('p2'),v('p3')].filter(Boolean),secs:+v('ps')||0});
    else if(k==='pollclose') ok=await cc('pollclose');
    else if(k==='gift'){ if(v('gk')==='skin'&&v('gto')==='all'){ CW.toast('Pick one person for the skin.'); b.disabled=false; return; } ok=await cc('gift',{to:v('gto'),kind:v('gk'),value:+v('gv')||(v('gk')==='skin'?1:0)}); }
    else if(k==='ce') ok=await cc('ce',{text:v('cet'),target:+v('cetg').replace(',','.')||0,len:v('cel'),mins:+v('cem')||30});
    else if(k==='ceend') ok=await cc('ceend');
    else if(k==='drop') ok=await cc('drop',{n:+v('dn')||25,val:+v('dv')||50});
    else if(k==='dropend') ok=await cc('dropend');
    else if(k==='cmd'){ ok=await runCmd(v('cmd'),I); box.querySelectorAll('[data-f="cmd"]').forEach(function(i){ i.value=''; }); b.disabled=false; drawCC(); return; }
    else if(k==='ceplay'){ sh.close(); PL.ceStart(); return; }
    b.disabled=false; if(ok){ CW.toast('Done.'); box.querySelectorAll('[data-f]').forEach(function(i){ if(i.tagName==='INPUT'&&i.type!=='number') i.value=''; }); PL.poll(); } drawCC(); }); } }

/* ---------- 🛡️ mini admin panel (Zhan Yi and Zhan Hong): full admin tools, no streaming ---------- */

var MACMDS=['gift','title','mute','unmute','helper','unhelper','chat','announce','msg','surprise','banner','unbanner','drop','dropend','race','endrace','poll','pollclose','players','help'];
function maSuggest(box){ var i=box.querySelector('[data-f="cmd"]'), s=box.querySelector('.ma-sg'); if(!i||!s) return; var v=i.value; if(v[0]!=='/'){ s.innerHTML=''; return; }
  var sg=v.split('/'), c=(sg[1]||'').toLowerCase(), idx=sg.length-3, cur=(sg[sg.length-1]||'').toLowerCase(), list=[], users=((CCS.info||{}).users||[]).map(function(u){ return u.name; });
  if(sg.length===2) list=MACMDS;
  else if(idx===0&&/^(gift|title|mute|unmute|helper|unhelper)$/.test(c)) list=(c==='gift'?['all']:[]).concat(users);
  else if(idx===0&&c==='chat') list=['on','off'];
  else if(idx===1&&c==='gift') list=['tokens','xp','spins','x2','skin'];
  else if(idx===2&&c==='gift'&&/^skin$/i.test(sg[3]||'')) list=((PL.skins&&PL.skins.list)||[]).filter(function(x){ return x.i>0&&x.i!==32; }).map(function(x){ return x.n; });
  else if(idx===0&&c==='race') list=['short','normal','long'];
  list=list.filter(function(n){ var l=String(n).toLowerCase(); return l!==cur&&(sg.length===2?l.indexOf(cur)===0:l.indexOf(cur)>-1); }).slice(0,12);
  s.innerHTML=list.length?list.map(function(n){ return '<button type="button" data-sg="'+esc(n)+'">'+(sg.length===2?'/':'')+esc(n)+'</button>'; }).join(''):(idx===0&&/^(gift|title|mute|unmute)$/.test(c)&&!cur&&!users.length?'<small class="muted">Nobody online right now.</small>':''); }
async function maRun(box){ var i=box.querySelector('[data-f="cmd"]'), line=(i.value||'').trim(); if(!line||CCS.busy) return; CCS.busy=true;
  CCS.hist=(CCS.hist||[]).concat(line).slice(-30); CCS.hi=null; i.value=''; box.querySelector('.ma-sg').innerHTML='';
  var L=(CCS.log||[]).concat([['c',line]]); CCS.out=''; CCS.err='';
  CCS.quiet=true; try{ await runCmd(line,CCS.info); }catch(x){ CCS.out='Something went wrong.'; CCS.err='x'; } CCS.quiet=false;
  if(CCS.out) L.push([CCS.err?'e':'o',CCS.out]); else if(CCS.err) L.push(['e',CCS.err]); else L.push(['o','Done.']);
  CCS.log=L.slice(-30); CCS.busy=false;
  var o=box.querySelector('.ma-tout'); if(o){ o.innerHTML=CCS.log.map(function(l){ return '<div class="'+l[0]+'">'+(l[0]==='c'?'❯ ':'')+esc(l[1])+'</div>'; }).join(''); o.scrollTop=1e6; }
  if(!CCS.err) PL.poll(); i.focus(); }
var maT=0, maSig='';
function maAuto(){ if(maT) return; maT=setInterval(async function(){ var sh=document.getElementById('czCCp'); if(!sh||!sh.isConnected){ clearInterval(maT); maT=0; return; } var ae=document.activeElement; if(ae&&sh.contains(ae)&&/^(SELECT|INPUT|TEXTAREA)$/.test(ae.tagName)) return; var q=CCS.quiet; CCS.quiet=true; var ok=await cc('info'); CCS.quiet=q; if(!ok||!CCS.info) return; var sig=(CCS.info.users||[]).map(function(u){ return u.id; }).join(','); if(sig!==maSig){ maSig=sig; drawCC(); } },6000); }
function drawMA(I){ maSig=(I.users||[]).map(function(u){ return u.id; }).join(','); maAuto(); var old=$('#czCCp'), keep={}; if(old) old.querySelectorAll('[data-f]').forEach(function(i){ keep[i.getAttribute('data-f')]=i.value; });
  var users=I.users||[], sk=(PL.skins&&PL.skins.list||[]).filter(function(s){ return s.i>0&&s.i!==32; }), tab=CCS.maTab||'give';
  var sh=old||CW.sheet('',function(){}); sh.id='czCCp'; var box=sh.querySelector('.box'); box.style.maxWidth='680px'; box.className=box.className.replace(/\bczbox\b|\bmabox\b/g,'').trim()+' mabox';
  var go='<option value="all">Everyone online</option>'+users.map(function(u){ return '<option value="'+esc(u.id)+'">'+esc(u.name)+'</option>'; }).join('');
  var TABS=[['give','🎁','Give'],['cast','📣','Broadcast'],['drop','💎','Drop'],['ppl','👥','Players'],['con','⌨️','Console']];
  var P={};
  P.give='<div class="ma-card"><h4>Send a gift <span class="muted" style="text-transform:none;letter-spacing:0;font-weight:500;font-size:12.5px">· '+users.length+' other player'+(users.length===1?'':'s')+' online</span></h4><div class="row"><select class="in" data-f="gto" style="flex:1;min-width:0">'+go+'</select><button type="button" class="btn" data-c="uref" title="Refresh the player list">↻</button><select class="in" data-f="gk" style="width:140px"><option value="tokens">Tokens</option><option value="xp">XP</option><option value="spins">Spins</option><option value="x2">2× XP</option><option value="skin">Pad skin</option></select></div>'
    +'<div class="row"><select class="in" data-f="gs" style="flex:1;min-width:0;display:none">'+sk.map(function(s){ return '<option value="'+s.i+'">'+esc(s.n)+'</option>'; }).join('')+'</select>'+inp('gv','Amount','number')+inp('gm','Message (optional)')+'</div>'
    +'<div class="ma-chips" data-for="gv">'+[50,100,250,500,1000,5000].map(function(n){ return '<button type="button" data-q="'+n+'">'+n.toLocaleString()+'</button>'; }).join('')+'</div><button class="btn pri ma-go" data-c="agift">Send gift ✦</button></div>';
  P.cast='<div class="ma-card"><h4>Announce to everyone</h4><div class="row">'+inp('ann','Message for everyone online')+'<button class="btn pri" data-c="announce">Send</button><button class="btn" data-c="burst">✨ Surprise</button></div></div>'
    +'<div class="ma-card"><h4>Site banner</h4><div class="row">'+inp('bn','Banner text')+inp('bh','Hours','number','24')+'</div><div class="row"><label class="ma-chk"><input type="checkbox" data-f="bx"> Double XP</label><span class="sp"></span><button class="btn" data-c="unbanner">Remove</button><button class="btn pri" data-c="banner">Show banner</button></div></div>'
    +'<div class="ma-card"><h4>Poll</h4>'+(I.poll&&!I.poll.closed?'<p class="note">“'+esc(I.poll.q)+'” · '+I.poll.total+' votes</p><button class="btn" data-c="pollclose">Close poll</button>':inp('pq','Question')+'<div class="row">'+inp('p0','Option 1')+inp('p1','Option 2')+'</div><div class="row">'+inp('p2','Option 3 (optional)')+inp('p3','Option 4 (optional)')+'</div><button class="btn pri" data-c="poll">Send poll</button>')+'</div>'
    +'<div class="ma-card"><h4>Race</h4><div class="row"><select class="in" data-f="rl" style="width:130px"><option value="s">Short</option><option value="n" selected>Normal</option><option value="l">Long</option></select><button class="btn pri" data-c="race">🏁 Open a race</button></div></div>';
  P.drop='<div class="ma-card ma-drop">'+(I.drop&&!I.drop.over?'<div class="ma-live"><i></i> DROP LIVE</div><div class="ma-big">'+I.drop.n+' <small>/ '+I.drop.max+' claimed</small></div><div class="ma-bar"><b style="width:'+Math.round(100*I.drop.n/Math.max(1,I.drop.max))+'%"></b></div><p class="muted" style="margin:8px 0">'+I.drop.left+' s left'+(I.drop.w&&I.drop.w.length?' · '+I.drop.w.map(function(n,i){ return '#'+(i+1)+' '+esc(n); }).join(' · '):'')+'</p><button class="btn" data-c="dropend">End drop</button>'
    :'<h4>Spawn a drop</h4><p class="muted" style="margin:-4px 0 10px;font-size:13px">A glowing pop-up appears for everyone online. The first players to tap win.</p><div class="row">'+inp('dn','Players','number','25')+inp('dv','Tokens each','number','50')+'</div><button class="btn pri ma-go" data-c="drop">💎 Drop it</button>'+(I.drop&&I.drop.over&&I.drop.n?'<p class="muted" style="font-size:13px;margin-top:8px">Last drop: '+I.drop.n+' / '+I.drop.max+' claimed.</p>':''))+'</div>';
  P.ppl='<div class="ma-card"><h4>Online now · '+users.length+'</h4><div class="row">'+inp('ptt','Title to set (blank removes)')+inp('pm','Mute minutes','number','10')+'</div>'+(users.length?'<div class="ma-ppl">'+users.map(function(u){ return '<div><b>'+esc(u.name)+'</b><span class="sp"></span><button class="btn sm" data-c="rtitle" data-u="'+esc(u.id)+'">Title</button><button class="btn sm" data-c="rmute" data-u="'+esc(u.id)+'">Mute</button><button class="btn sm" data-c="runmute" data-u="'+esc(u.id)+'">Unmute</button><button class="btn sm pri" data-c="rgift" data-u="'+esc(u.id)+'">+100 🪙</button></div>'; }).join('')+'</div>':'<p class="muted">Nobody else is online right now.</p>')+'</div>';
  var LG=CCS.log||[];
  P.con='<div class="ma-card ma-term"><div class="ma-tout">'+(LG.length?LG.map(function(l){ return '<div class="'+l[0]+'">'+(l[0]==='c'?'❯ ':'')+esc(l[1])+'</div>'; }).join(''):'<div class="o">Type /help to see every command. Tap a suggestion, or press ↑ for your last command.</div>')+'</div><div class="ma-sg"></div><div class="row" style="margin-top:8px"><input class="in" data-f="cmd" placeholder="/gift/name/tokens/100   ·   type /help" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" style="flex:1;min-width:0;font-family:ui-monospace,monospace"><button class="btn pri" data-c="cmd">Run</button></div></div>';
  box.innerHTML='<div class="ma-hero"><button class="x" data-close aria-label="Close">✕</button><div class="ma-shield"><span>🛡️</span><i></i><i></i><i></i></div><div class="ma-ht"><span class="ma-k">MINI ADMIN · CUBEWORKSTUDIO</span><h2>'+esc(I.name)+'</h2><div class="ma-pills"><span><b>'+I.online+'</b> online</span><span><b>'+I.today+'</b> today</span><span><b>∞</b> gift limit</span></div></div></div>'
   +'<div class="ma-tabs">'+TABS.map(function(x){ return '<button type="button" data-mt="'+x[0]+'" aria-pressed="'+(tab===x[0])+'"><span>'+x[1]+'</span>'+x[2]+'</button>'; }).join('')+'</div>'
   +'<div class="ma-pane">'+P[tab]+'</div>';
  Object.keys(keep).forEach(function(k){ var i=box.querySelector('[data-f="'+k+'"]'); if(i&&keep[k]) i.value=keep[k]; });
  var gk=box.querySelector('[data-f="gk"]'); if(gk){ var gs=box.querySelector('[data-f="gs"]'), gv=box.querySelector('[data-f="gv"]'), chips=box.querySelector('.ma-chips'); var sync=function(){ var s=gk.value==='skin',x=gk.value==='x2'; gs.style.display=s?'':'none'; gv.style.display=(s||x)?'none':''; if(chips) chips.style.display=(s||x)?'none':''; }; gk.onchange=sync; sync(); }
  var to=box.querySelector('.ma-term .ma-tout'); if(to) to.scrollTop=1e6;
  if(!sh.dataset.w){ sh.dataset.w='1'; sh.addEventListener('click',async function(e){
    var mt=e.target.closest('[data-mt]'); if(mt){ CCS.maTab=mt.getAttribute('data-mt'); drawCC(); return; }
    var q=e.target.closest('[data-q]'); if(q){ var f=box.querySelector('[data-f="gv"]'); if(f) f.value=q.getAttribute('data-q'); return; }
    var b=e.target.closest('[data-c]'); if(!b) return; var k=b.getAttribute('data-c'), u=b.getAttribute('data-u'), v=function(n){ var i=box.querySelector('[data-f="'+n+'"]'); return i?i.value.trim():''; }, ok=false; b.disabled=true;
    if(k==='uref'){ await cc('info'); b.disabled=false; drawCC(); CW.toast('Player list updated.'); return; }
    if(k==='agift'){ var kind=v('gk'); ok=await cc('agift',{to:v('gto'),kind:kind,value:kind==='skin'?+v('gs'):kind==='x2'?1:+v('gv')||0,msg:v('gm')}); }
    else if(k==='announce') ok=await cc('announce',{text:v('ann')});
    else if(k==='burst') ok=await cc('burst');
    else if(k==='banner') ok=await cc('banner',{text:v('bn'),hours:+v('bh')||24,x2:!!(box.querySelector('[data-f="bx"]')||{}).checked});
    else if(k==='unbanner') ok=await cc('banner',{text:''});
    else if(k==='drop') ok=await cc('drop',{n:+v('dn')||25,val:+v('dv')||50});
    else if(k==='dropend') ok=await cc('dropend');
    else if(k==='rtitle') ok=await cc('title',{to:u,title:v('ptt')});
    else if(k==='rmute') ok=await cc('amute',{to:u,mins:+v('pm')||10});
    else if(k==='runmute') ok=await cc('aunmute',{to:u});
    else if(k==='rgift') ok=await cc('agift',{to:u,kind:'tokens',value:100,msg:''});
    else if(k==='poll') ok=await cc('poll',{q:v('pq'),opts:[v('p0'),v('p1'),v('p2'),v('p3')].filter(Boolean),secs:0});
    else if(k==='pollclose') ok=await cc('pollclose');
    else if(k==='race') ok=await cc('race',{len:v('rl')});
    else if(k==='cmd'){ await maRun(box); b.disabled=false; return; }
    b.disabled=false; if(ok){ CW.toast('Done.'); box.querySelectorAll('[data-f]').forEach(function(i){ if(i.tagName==='INPUT'&&i.type==='text'&&!/^(ptt|cmd)$/.test(i.getAttribute('data-f'))) i.value=''; }); PL.poll(); } drawCC(); }); 
    sh.addEventListener('keydown',function(e){ var el=e.target; if(!el.getAttribute||el.getAttribute('data-f')!=='cmd') return; var H=CCS.hist||[];
      if(e.key==='Enter'){ e.preventDefault(); var bb=sh.querySelector('[data-c="cmd"]'); if(bb) bb.click(); }
      else if(e.key==='ArrowUp'&&H.length){ e.preventDefault(); CCS.hi=CCS.hi==null?H.length-1:Math.max(0,CCS.hi-1); el.value=H[CCS.hi]; }
      else if(e.key==='ArrowDown'&&CCS.hi!=null){ e.preventDefault(); CCS.hi++; if(CCS.hi>=H.length){ CCS.hi=null; el.value=''; } else el.value=H[CCS.hi]; }
      else if(e.key==='Tab'){ var f=sh.querySelector('.ma-sg button'); if(f){ e.preventDefault(); f.click(); } } });
    sh.addEventListener('input',function(e){ if(e.target.getAttribute&&e.target.getAttribute('data-f')==='cmd') maSuggest(box); });
    sh.addEventListener('focusin',function(e){ if(e.target.getAttribute&&e.target.getAttribute('data-f')==='cmd') maSuggest(box); });
    sh.addEventListener('click',function(e){ var s=e.target.closest('[data-sg]'); if(!s) return; var i=box.querySelector('[data-f="cmd"]'), p=i.value.split('/'); p[p.length-1]=s.getAttribute('data-sg'); i.value=p.join('/')+'/'; i.focus(); maSuggest(box); });
     } }

/* typed commands for creators and mini admins */
function skinNum(x){ x=String(x||'').trim().toLowerCase(); if(/^\d+$/.test(x)) return +x; var L=(PL.skins&&PL.skins.list)||[], m=L.filter(function(s){ return String(s.n).toLowerCase()===x; })[0]||L.filter(function(s){ return String(s.n).toLowerCase().indexOf(x)===0; })[0]; return m?m.i:0; }
async function runCmd(raw,I){ var a=String(raw||'').trim().replace(/^\//,'').split('/').map(function(x){ return x.trim(); }), c=(a[0]||'').toLowerCase(), users=(I&&I.users)||[];
  function out(m){ CCS.out=m; return false; }
  if(I&&I.ma&&/^(gift|title|mute|unmute|helper|unhelper)$/.test(c)){ var fr=CCS.quiet; await cc('info'); CCS.quiet=fr; if(CCS.info&&CCS.info.users){ I=CCS.info; users=I.users||[]; } }
  function chatter(n){ n=String(n||'').toLowerCase(); var seen={},m=[]; ((PL.live&&PL.live.chat)||[]).forEach(function(x){ if(x.p&&!seen[x.p]&&String(x.n).toLowerCase().indexOf(n)>-1){ seen[x.p]=1; m.push(x); } }); if(!m.length) return null; var ex=m.filter(function(x){ return String(x.n).toLowerCase()===n; }); if(ex.length===1) return ex[0]; if(m.length>1){ CCS.werr='More than one match: '+m.map(function(x){ return x.n; }).join(', '); return null; } return m[0]; }
  CCS.werr='';
  function who(n){ n=String(n||'').toLowerCase(); if(!n) return null; if(n==='all') return 'all'; var m=users.filter(function(x){ return x.name.toLowerCase()===n; }); if(!m.length) m=users.filter(function(x){ return x.name.toLowerCase().indexOf(n)===0; }); if(!m.length) m=users.filter(function(x){ return x.name.toLowerCase().indexOf(n)>-1; }); if(!m.length){ CCS.werr='No online player called "'+n+'".'; return null; } if(m.length>1){ CCS.werr='More than one match: '+m.map(function(x){ return x.name; }).join(', '); return null; } return m[0].id; }
  if(!c||c==='help'){ if(I&&I.ma) return out('/gift/name or all/tokens, xp, spins, x2 (hours) or skin/amount or skin name/message\n/title/name/text   ·   /mute/name/minutes   ·   /unmute/name\n/helper/name   ·   /unhelper/name   ·   /chat/on or off\n/announce/text   ·   /msg/text   ·   /surprise   ·   /banner/text/hours/x2   ·   /unbanner\n/drop/25/100   ·   /dropend   ·   /race/short, normal or long   ·   /endrace\n/poll/Question/Option 1/Option 2   ·   /pollclose   ·   /online'); } if(!c||c==='help') return out('/gift/name/tokens/100 (or xp, or all instead of a name)\n/announce/your message\n/surprise\n/drop/25/50  (players, tokens each)\n/dropend\n/poll/Question/Option 1/Option 2\n/pollclose\n/live/what you stream/https://link\n/endlive\n/online  (who is online)');
  if(c==='online'||c==='players') return out(users.length?users.map(function(u){ return u.name; }).join(', '):'Nobody else is online.');
  if(c==='announce'){ if(!a[1]) return out('Write a message: /announce/hello'); var ok1=await cc('announce',{text:a.slice(1).join('/')}); return out(ok1?'Sent.':''); }
  if(c==='surprise'||c==='burst'){ var ok2=await cc('burst'); return out(ok2?'Sent.':''); }
  if(c==='drop'){ var ok3=await cc('drop',{n:+a[1]||25,val:+a[2]||50}); return out(ok3?'Drop is live.':''); }
  if(c==='dropend'){ var ok4=await cc('dropend'); return out(ok4?'Drop ended.':''); }
  if(c==='pollclose'){ var ok5=await cc('pollclose'); return out(ok5?'Poll closed.':''); }
  if(c==='poll'){ var o=a.slice(2).filter(Boolean); if(!a[1]||o.length<2) return out('Use /poll/Question/Option 1/Option 2'); var ok6=await cc('poll',{q:a[1],opts:o.slice(0,4),secs:0}); return out(ok6?'Poll sent.':''); }
  if(c==='live'){ var ok7=await cc('live',{text:a[1]||'',url:a.slice(2).join('/'),hours:2}); return out(ok7?'You are live.':''); }
  if(c==='endlive'){ var ok8=await cc('endlive'); return out(ok8?'Live ended.':''); }
  if(I&&I.ma){
    if(c==='gift'){ var t1=who(a[1]), k1=({tokens:'tokens',token:'tokens','cube tokens':'tokens',cubetokens:'tokens',xp:'xp',spins:'spins',spin:'spins',x2:'x2','2x':'x2',double:'x2',skin:'skin'})[(a[2]||'').toLowerCase()]; if(!t1) return out(CCS.werr||'Use /gift/name/tokens/100 (name or all)'); if(!k1) return out('Kinds: tokens, xp, spins, x2, skin'); var v1=k1==='skin'?skinNum(a[3]):(k1==='x2'?Math.max(1,Math.min(24,Math.floor(+a[3]||1))):Math.floor(+a[3]||0)); if(!v1) return out(k1==='skin'?'Unknown skin "'+(a[3]||'')+'".':'Enter an amount.'); var okg=await cc('agift',{to:t1,kind:k1,value:v1,msg:a[4]||''}); return out(okg?'Gift sent.':''); }
    if(c==='title'){ var t2=who(a[1]); if(!t2||t2==='all') return out(CCS.werr||'Use /title/name/text'); var okt=await cc('title',{to:t2,title:a[2]||''}); return out(okt?'Title updated.':''); }
    if(c==='banner'){ if(!a[1]) return out('Use /banner/text/hours/x2'); var okb=await cc('banner',{text:a[1],hours:+a[2]||24,x2:/^(x2|2x|yes|1|on)$/i.test(a[3]||'')}); return out(okb?'Banner is live.':''); }
    if(c==='unbanner'){ var oku=await cc('banner',{text:''}); return out(oku?'Banner removed.':''); }
    if(c==='mute'||c==='unmute'){ if(!a[1]) return out('Use /'+c+'/name'+(c==='mute'?'/minutes':'')); var t3=who(a[1]), pb=null; if(!t3||t3==='all'){ var ch=chatter(a[1]); if(ch) pb=ch.p; else return out(CCS.werr||('No online player or recent chatter called "'+a[1]+'".')); } var okm=await cc(c==='mute'?'amute':'aunmute',pb?{p:pb,mins:+a[2]||10}:{to:t3,mins:+a[2]||10}); return out(okm?(c==='mute'?'Muted.':'Unmuted.'):''); }
    if(c==='helper'||c==='unhelper'){ if(!a[1]) return out('Use /'+c+'/name'); var t4=who(a[1]), pb2=null; if(!t4||t4==='all'){ var ch2=chatter(a[1]); if(ch2) pb2=ch2.p; else return out(CCS.werr||('No online player or recent chatter called "'+a[1]+'".')); } var okh=await cc(c,pb2?{p:pb2}:{to:t4}); return out(okh?(c==='helper'?'Made a helper.':'Helper removed.'):''); }
    if(c==='chat'){ if(!/^(on|off)$/i.test(a[1]||'')) return out('Use /chat/on or /chat/off'); var okc=await cc('chat',{on:a[1].toLowerCase()}); return out(okc?'Chat is '+a[1].toLowerCase()+'.':''); }
    if(c==='endrace'){ var oke=await cc('endrace'); return out(oke?'Race closed.':''); }
    if(c==='race'){ var okr=await cc('race',{len:(a[1]||'n')[0]}); return out(okr?'Race opened.':''); }
    if(c==='msg'&&a[1]){ var okk=await cc('announce',{text:a.slice(1).join('/')}); return out(okk?'Sent.':''); } }
  if(c==='gift'){ var to=who(a[1]), k=(a[2]||'').toLowerCase(), val=Math.floor(+a[3]||0); if(!to) return out('Pick someone who is online: /gift/name/tokens/100'); if(k!=='tokens'&&k!=='xp') return out('Gift tokens or xp.'); var ok9=await cc('gift',{to:to,kind:k,value:val}); return out(ok9?'Gift sent.':''); }
  return out('Unknown command. Type /help.'); }
function sec(t){ return '<h3 style="margin:18px 0 8px;font-size:16px">'+t+'</h3>'; }
function inp(f,ph,type,val){ return '<input class="in" data-f="'+f+'" placeholder="'+esc(ph)+'"'+(type?' type="'+type+'"':'')+(val?' value="'+val+'"':'')+' style="flex:1;min-width:0;margin-bottom:6px">'; }

PL.onLive(function(){ drawStrip(); events(); drawPoll(); tAuto(); });
})();
