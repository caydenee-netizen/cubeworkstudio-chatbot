/* /play part 2: Cube Race, Garage, Clubs & Trade. Uses PL from play.js and CWRaceEngine from race-engine.js. */
(function(){
'use strict';
var $=CW.$, esc=CW.esc, ls=CW.ls, PL=window.PL, LV=PL.live, E=window.CWRaceEngine;
function me(){ return CW.devId(); }
function errOf(r,d){ return (r.data&&r.data.error)||(r.status===0?'Could not reach the live server.':d||'Something went wrong. Try again.'); }
function ord(n){ return n===1?'1st':n===2?'2nd':n===3?'3rd':n+'th'; }

/* ======================= CUBE RACE ======================= */
var R=PL.race={enter:null,game:null,seed:0,gid:null,room:null,sent:0,doneTries:0,practice:null,lobbyT:0};
var LENS={s:'Short',n:'Normal',l:'Long'};
PL.views.race={show:function(el,h){ draw(el); var m=/^race\/([A-Za-z0-9]{5})$/.exec(h||''); if(m){ history.replaceState(null,'','#race'); setTimeout(function(){ privJoin(m[1]); },60); } R.viewT=setInterval(function(){ var c=$('#rCd'); if(!c){ clearInterval(R.viewT); return; } var ev=PL.raceEvent(); if(!!ev!==(c.getAttribute('data-ev')==='1')||!!(LV.ce&&LV.ce.e>PL.now())!==!!$('#rCe')){ draw(el); return; }
    c.textContent=PL.mmss((ev?ev.exp:PL.nextAuto())-PL.now()); },1000); },
  leave:function(){ clearInterval(R.viewT); }};
function draw(el){ var ev=PL.raceEvent(), len=ls('cw2_rlen')||'n';
  var last=CW.lsJ('cw2_lastrace',null);
  el.innerHTML='<div class="wrap">'+PL.crumbs('Cube Race')
    +'<div class="racebar'+(ev?' live':'')+'" style="margin-top:0"><span class="flag">🏁</span><div><b>'+(ev?(ev.auto?'The auto race is open':'A race is open'):'Next auto race')+'</b><small>'+(ev?'Join before it closes. Up to 10 racers.':'Every 30 minutes, all day. Top 3 win 500 · 300 · 150 tokens.')+'</small></div>'
    +(ev?'<div class="row"><span class="cd" id="rCd" data-ev="1">'+PL.mmss(ev.exp-PL.now())+'</span><button class="btn" id="rJoin" style="background:#fff;color:#111">Join race</button></div>':'<div class="cd" id="rCd" data-ev="0">'+PL.mmss(PL.nextAuto()-PL.now())+'</div>')+'</div>'
    +'<div class="grid2"><div class="pnl"><h3>Practice</h3><p class="muted" style="font-size:14px">Race bots on a fresh track any time. No prizes, just practice.</p>'
    +'<div class="row" style="margin-top:12px"><div class="seg" id="rLen">'+Object.keys(LENS).map(function(k){ return '<button type="button" data-l="'+k+'" aria-pressed="'+(k===len)+'">'+LENS[k]+'</button>'; }).join('')+'</div><button class="btn pri" id="rPrac">Start practice</button></div></div>'
    +'<div class="pnl"><h3>Race your friends</h3><p class="muted" style="font-size:14px">Make a private room and share the code, or enter a friend’s code.</p>'
    +'<div class="row" style="margin-top:12px"><button class="btn pri" id="rMake">Make a room</button><input class="in mono" id="rCode" maxlength="5" placeholder="CODE" style="width:110px;text-transform:uppercase"><button class="btn" id="rEnter">Join</button></div><label class="lk row" style="gap:6px;margin-top:10px;font-size:13.5px"><input type="checkbox" id="rFo"> Friends only (otherwise anyone with the code can join)</label></div></div>'
    +'<div class="pnl"><div class="row"><h3 style="margin:0">Your car</h3><span class="sp"></span><a class="btn sm" href="#garage">Change in Garage</a></div><p class="muted" style="margin-top:6px">'+esc(E?E.CARDEF[E.curCar()].n:'Classic')+(E&&E.curTrail()?' · '+esc(E.TRAILDEF[E.curTrail()].n)+' trail':'')+' · '+esc(E?E.WINGDEF[E.curWing()].n:'Feather')+' wings</p>'
    +'<p class="muted" style="font-size:13.5px;margin-top:8px">Steer with ◀ ▶ or the arrow keys. Space or the NITRO button boosts. Grab coins and yellow pads, dodge red blocks.</p></div>'
    +(LV.ce&&LV.ce.e>PL.now()?'<div class="pnl" style="border-color:#27e6dc"><div class="row"><h3 style="margin:0">🎥 '+esc(LV.ce.ti)+'</h3><span class="sp"></span><button class="btn pri" id="rCe">Play</button></div><p class="muted" style="margin-top:6px">'+esc(LV.ce.bn)+' set a time of <b>'+PL.fmt(LV.ce.t)+'</b>. Beat it on the same track to win tokens. Ends in '+PL.mmss(LV.ce.e-PL.now())+'.</p></div>':'')
    +(last?'<div class="pnl"><h3>Last race</h3><p>'+esc(last.t)+'</p></div>':'')+'</div>';
  var j=$('#rJoin'); if(j) j.onclick=function(){ joinEvent(ev.id); };
  var ce=$('#rCe'); if(ce) ce.onclick=function(){ PL.ceStart(); };
  $('#rLen').onclick=function(e){ var b=e.target.closest('[data-l]'); if(!b) return; ls('cw2_rlen',b.getAttribute('data-l')); draw(el); };
  $('#rPrac').onclick=function(){ practice({len:ls('cw2_rlen')||'n'}); };
  $('#rMake').onclick=privMake; $('#rEnter').onclick=function(){ privJoin($('#rCode').value); };
  $('#rCode').addEventListener('keydown',function(e){ if(e.key==='Enter') privJoin($('#rCode').value); });
}
function carVal(){ return E?E.raceCar():0; }
async function joinEvent(id){ if(!LV.on) await PL.poll();
  var r=await CW.call('/api/race/join',{id:me(),name:PL.name(),event:id,car:carVal()},8000);
  if(!r.ok){ CW.toast(r.status===410?'That race has already closed.':errOf(r,'Could not join the race.')); return; }
  enter(r.data.room); }
async function privMake(){ var r=await CW.call('/api/race/priv/create',{id:me(),name:PL.name(),car:carVal(),len:ls('cw2_rlen')||'n',open:!($('#rFo')&&$('#rFo').checked),team:!!($('#rTm')&&$('#rTm').checked)},8000);
  if(!r.ok){ CW.toast(errOf(r)); return; } enter(r.data.room); return r.data.room; }
async function privJoin(code){ code=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,''); if(code.length!==5){ CW.toast('Room codes have 5 letters or numbers.'); return; }
  var r=await CW.call('/api/race/priv/join',{id:me(),name:PL.name(),code:code,car:carVal()},8000); if(!r.ok){ CW.toast(errOf(r)); return; } enter(r.data.room); }
PL.raceEnter=function(room){ enter(room); };
function enter(room){ R.practice=null; LV.roomId=room.id; R.doneTries=0; kill(); overlay(); R.update(room); PL.poll(); }
function practice(o){ var now=Date.now(), names=['Nova','Kiro','Bolt','Echo','Zed'].slice(0,2+Math.floor(Math.random()*3));
  R.practice={startAt:now+5000,seed:o.seed!=null?o.seed:(Math.random()*1e9)|0,len:o.len||'n',ce:!!o.ce,target:o.target||0,wx:o.wx||null,mine:{prog:0,done:null},bots:(o.ce?[]:names).map(function(n,i){ return {name:n+'Bot',t:42000+Math.random()*30000+i*2500,done:null}; })};
  LV.roomId='practice'; kill(); overlay(); ptick(); }
function pview(){ var p=R.practice, now=Date.now(), st=now<p.startAt?'lobby':'racing', el=now-p.startAt, over=st==='racing'&&(p.mine.done!=null||el>150000);
  var ps=[{name:PL.name(),prog:p.mine.prog,done:p.mine.done,me:true}];
  p.bots.forEach(function(b){ var pr=Math.min(100,Math.round(Math.max(0,el)/b.t*100)); if((pr>=100||over)&&b.done==null&&(p.mine.done!=null||pr>=100)) b.done=b.t; ps.push({name:b.name,prog:over&&b.done!=null?100:pr,done:b.done,me:false,car:(b.name.length*7)%8}); });
  var res=null; if(over){ st='done'; res=ps.filter(function(x){ return x.done!=null; }).sort(function(a,b){ return a.done-b.done; }).map(function(x,i){ return {name:x.name,place:i+1,ms:x.done,me:x.me,tokens:0}; }); }
  return {id:'practice',status:st,startAt:p.startAt,seed:p.seed,len:p.len,players:ps,results:res,practice:true,ce:p.ce,cres:p.cres||null,wx:p.wx||undefined}; }
function ptick(){ if(!R.practice) return; clearTimeout(R.practice.t); var v=pview();
  if(v.status==='done'&&R.game&&R.game.state&&R.game.state.finished&&Date.now()-R.game.state.finishAt<2600){ R.practice.t=setTimeout(ptick,200); return; }
  R.update(v); if(R.practice&&v.status!=='done') R.practice.t=setTimeout(ptick,350); }
function kill(){ if(R.game){ try{ R.game.destroy(); }catch(e){} R.game=null; } try{ if(PL.raceRec&&!R.finished) PL.raceRec.abort(); }catch(e){} R.seed=0; R.gid=null; }
function leave(){ var was=LV.roomId; clearInterval(R.lobbyT); if(R.practice){ clearTimeout(R.practice.t); R.practice=null; } LV.roomId=null; kill();
  var o=$('#rc'); if(o) o.remove(); document.body.classList.remove('racing'); document.body.style.overflow='';
  if(was&&was!=='practice') CW.call('/api/race/leave',{id:me(),room:was},4000); R.room=null; PL.poll(); }
async function ceSubmit(P){ var r=await CW.call('/api/ce/submit',{id:me(),name:PL.name(),ms:P.mine.done},8000); P.cres=r.ok&&r.data&&r.data.ok?r.data:{err:(r.data&&r.data.error)||'Could not save your time.'}; var x=$('#rcCe'); if(x) x.innerHTML=ceTxt(P.cres); }
function ceTxt(c){ if(!c) return 'Saving your time…'; if(c.err) return esc(c.err); return (c.beat?'🏆 You beat the target time'+(c.bonus?' · +'+c.bonus+' tokens on the way':'')+'. ':'Target was '+PL.fmt(c.target)+'. ')+'Your best: '+PL.fmt(c.best)+' · rank '+c.rank+' of '+c.of+'.'; }
PL.racePriv={make:function(){ return privMake(); },join:function(c){ return privJoin(c); }}; PL.racePractice=practice;
R.lost=function(){ if(R.room&&R.room.status==='done') return; CW.toast('The race room closed.'); leave(); };
function overlay(){ var o=$('#rc'); if(o) o.remove(); o=document.createElement('div'); o.className='rc'; o.id='rc';
  o.addEventListener('selectstart',function(e){ if(!/INPUT|TEXTAREA/.test(e.target.tagName||'')) e.preventDefault(); }); o.addEventListener('contextmenu',function(e){ if(!/INPUT|TEXTAREA/.test(e.target.tagName||'')) e.preventDefault(); });
  o.innerHTML='<div class="rc-top"><h2 id="rcT">Joining…</h2><span class="sp"></span><button class="btn sm" id="rcShare" hidden>Share code</button><button class="btn sm" id="rcStart" hidden>▶ Start now</button><button class="btn sm" id="rcSnd" aria-label="Sound">'+(E&&E.muted()?'🔇':'🔊')+'</button><button class="btn sm" id="rcChat">💬</button><button class="btn sm" id="rcLeave">Leave</button></div>'
    +'<div class="rc-body"><div><div class="rc-stage" id="rcStage"><canvas id="cwCv"></canvas></div>'
    +'<div class="rc-ctl"><button type="button" data-s="-1" aria-label="Steer left">◀</button><button type="button" class="nit" id="rcNit">NITRO</button><button type="button" data-s="1" aria-label="Steer right">▶</button></div>'
    +'<div class="rc-ctl" style="grid-template-columns:1fr 1fr 1fr"><button type="button" data-a="1" style="height:48px;font-size:15px">▲ Up</button><button type="button" id="rcFire" style="height:48px;font-size:15px">🔥 Fire</button><button type="button" data-a="-1" style="height:48px;font-size:15px">▼ Down</button></div>'
    +'<p class="rc-keys">◀ ▶ or A D to steer · Space for nitro</p><div id="rcRes"></div></div><div class="rc-side"><h3 id="rcN">Racers</h3><div id="rcCom" class="rc-com" aria-live="polite"></div><div id="rcList"></div><p id="rcMsg" style="font-size:13px;color:#9aa3b2;margin-top:10px"></p></div></div>';
  document.body.appendChild(o); document.body.classList.add('racing'); document.body.style.overflow='hidden';
  ['contextmenu','selectstart'].forEach(function(ev){ o.addEventListener(ev,function(e){ if(!e.target.closest('input')) e.preventDefault(); }); });
  $('#rcLeave').onclick=leave; $('#rcChat').onclick=function(){ PL.openChat(); };
  $('#rcSnd').onclick=function(){ if(!E) return; E.setMute(!E.muted()); if(R.game) R.game.mute(E.muted()); this.textContent=E.muted()?'🔇':'🔊'; };
  $('#rcShare').onclick=function(){ var rm=LV.room||{}, c=rm.code; if(!c) return; var url=location.origin+'/play#race/'+c, txt='Race me on Cuber Tools. Room code '+c+': '+url;
    if(navigator.share){ navigator.share({title:'Cube Race',text:txt}).catch(function(){}); } else if(navigator.clipboard){ navigator.clipboard.writeText(txt).then(function(){ CW.toast('Invite copied'); },function(){ CW.toast('Code: '+c); }); } else CW.toast('Code: '+c); };
  $('#rcStart').onclick=async function(){ var r=await CW.call('/api/race/priv/start',{id:me(),room:LV.roomId},6000); if(r.ok) R.update(r.data.room); else CW.toast(errOf(r)); };
  o.querySelectorAll('[data-s]').forEach(function(b){ var v=+b.getAttribute('data-s');
    b.addEventListener('pointerdown',function(e){ e.preventDefault(); if(E) E.unlockAudio(); try{ b.setPointerCapture(e.pointerId); }catch(x){} if(R.game) R.game.steer(v); b.classList.add('on'); });
    ['pointerup','pointercancel','lostpointercapture'].forEach(function(t){ b.addEventListener(t,function(){ if(R.game) R.game.steer(0); b.classList.remove('on'); }); }); });
  o.querySelectorAll('[data-a]').forEach(function(b){ var v=+b.getAttribute('data-a');
    b.addEventListener('pointerdown',function(e){ e.preventDefault(); try{ b.setPointerCapture(e.pointerId); }catch(x){} if(R.game) R.game.alt(v); b.classList.add('on'); });
    ['pointerup','pointercancel','lostpointercapture'].forEach(function(t){ b.addEventListener(t,function(){ if(R.game) R.game.alt(0); b.classList.remove('on'); }); }); });
  $('#rcFire').addEventListener('pointerdown',function(e){ e.preventDefault(); if(R.game) R.game.fire(); });
  $('#rcNit').addEventListener('pointerdown',function(e){ e.preventDefault(); if(E) E.unlockAudio(); if(R.game) R.game.nitro(); });
  var cv=$('#cwCv'); cv.addEventListener('pointerdown',function(e){ if(E) E.unlockAudio(); var r=cv.getBoundingClientRect(); if(R.game) R.game.steer(e.clientX<r.left+r.width/2?-1:1); try{ cv.setPointerCapture(e.pointerId); }catch(x){} });
  ['pointerup','pointercancel','lostpointercapture'].forEach(function(t){ cv.addEventListener(t,function(){ if(R.game) R.game.steer(0); }); });
  clearInterval(R.lobbyT); R.lobbyT=setInterval(function(){ if(!$('#rc')){ clearInterval(R.lobbyT); return; } var n=$('#rcNit'); if(n&&R.game) n.classList.toggle('rdy',R.game.state.nitro>=100); title(); },250);
}
function startLocal(){ var rr=R.room; return rr?(rr.practice?rr.startAt:rr.startAt-LV.skew):Date.now()+1e9; }
function title(){ var rr=R.room, t=$('#rcT'); if(!rr||!t) return; var now=rr.practice?Date.now():PL.now(), left=rr.startAt-now;
  t.textContent=rr.status==='done'?'Results':rr.status==='racing'?(rr.practice?'Practice':rr.priv?'Friends race':'Cube Race'):(rr.priv&&left>15000?'Room code '+rr.code+' · waiting for friends':'Starts in '+Math.max(0,Math.ceil(left/1000))+'s'); }
function ensureGame(room){ if(!E) return; if(R.game&&R.seed===room.seed&&R.gid===room.id) return; kill(); R.seed=room.seed; R.gid=room.id; R.doneTries=0; R.finished=false;
  R.game=E.CubeRacer($('#cwCv'),{seed:room.seed,weather:room.wx||undefined,len:room.len||'n',dn:room.dn,sk:room.sk,wfBots:!!room.practice,name:PL.name(),car:carVal(),fxMine:E.myFx,
    wfIn:function(){ var rr=R.room, nm=PL.name(); return (rr&&rr.wf||[]).filter(function(e){ return e.to===nm; }); },
    onFire:function(nm){ if(R.practice){ R.practice.bots.forEach(function(b){ if(b.name===nm&&b.done==null) b.t+=1500; }); } else CW.call('/api/race/wing',{id:me(),room:LV.roomId,to:nm},5000); },
    startLocal:startLocal, others:function(){ return R.room?R.room.players.filter(function(p){ return !p.me; }):[]; },
    onProgress:function(pr,fin){ if(!fin&&Date.now()-R.sent>800) report(Math.round(pr*10)/10,false); },
    onFinish:function(){ R.finished=true; try{ if(PL.raceRec) PL.raceRec.finish(); }catch(e){} report(100,true); }}); try{ if(PL.raceRec) PL.raceRec.start($('#cwCv')); }catch(e){} }
async function report(pr,done){ var room=R.room; if(!room) return; R.sent=Date.now();
  if(room.practice){ R.practice.mine.prog=Math.round(pr); if(done){ R.practice.mine.done=Date.now()-R.practice.startAt; if(R.practice.ce) ceSubmit(R.practice); ptick(); } return; }
  var r=await CW.call('/api/race/progress',{id:me(),room:LV.roomId,prog:pr,done:!!done,car:carVal(),fx:E?E.myFx():null},6000);
  if(r.ok&&r.data.room) R.update(r.data.room);
  else if(done&&R.doneTries++<12) setTimeout(function(){ if(R.room&&R.room.status!=='done') report(100,true); },1500); }
/* race commentator + recap: built from the live room snapshots, so it never invents anything */
var CM={rid:null,q:[],lastSay:0,timer:null,leader:null,myIdx:null,fin:{},half:false,fs:false,nn:0,nnAt:0,lt:{},lastT:0,leadChanges:0,r80:null,started:false,n:0};
function cmReset(id){ CM.rid=id; CM.q=[]; CM.leader=null; CM.myIdx=null; CM.fin={}; CM.half=false; CM.fs=false; CM.nn=0; CM.nnAt=0; CM.lt={}; CM.lastT=0; CM.leadChanges=0; CM.r80=null; CM.started=false; CM.n=0; var c=$('#rcCom'); if(c) c.innerHTML=''; }
function cmSay(t,hot){ CM.q.push({t:t,hot:!!hot}); if(CM.q.length>6) CM.q.shift(); if(!CM.timer) CM.timer=setInterval(cmDrain,600); }
function cmDrain(){ var c=$('#rcCom'); if(!c){ clearInterval(CM.timer); CM.timer=null; CM.q=[]; return; } if(!CM.q.length){ clearInterval(CM.timer); CM.timer=null; return; } var now=Date.now(); if(now-CM.lastSay<1500) return; CM.lastSay=now; var m=CM.q.shift();
  var d=document.createElement('div'); d.className='rc-cm'+(m.hot?' hot':''); d.textContent=m.t; c.insertBefore(d,c.firstChild); while(c.children.length>3) c.removeChild(c.lastChild); }
function cmFeed(room){ if(!room||room.practice&&false) return; if(CM.rid!==room.id) cmReset(room.id); if(room.status!=='racing') return;
  var ps=room.players.slice().sort(function(a,b){ return (a.done!=null?0:1)-(b.done!=null?0:1)||(a.done||0)-(b.done||0)||(b.prog||0)-(a.prog||0); }), now=Date.now(), dt=CM.lastT?Math.min(3000,now-CM.lastT):0; CM.lastT=now; if(!ps.length) return;
  var ld=ps[0], sec=ps[1], mi=ps.findIndex(function(p){ return p.me; }), nm=function(p){ return p.me?'You':p.name; };
  if(ld.prog>0&&ld.done==null) CM.lt[ld.name]=(CM.lt[ld.name]||0)+dt;
  if(!CM.started){ CM.started=true; CM.n=ps.length; cmSay('And they are off! '+ps.length+' racer'+(ps.length>1?'s':'')+' on the grid.',true); }
  if(ld.prog>=3&&ld.done==null&&CM.leader!==ld.name){ if(CM.leader!=null){ CM.leadChanges++; cmSay(ld.me?'You take the lead!':ld.name+' takes the lead!',true); } CM.leader=ld.name; }
  if(mi>=0&&CM.myIdx!=null&&mi!==CM.myIdx&&ps[mi].done==null){ if(mi<CM.myIdx&&ps[mi+1]) cmSay('You pass '+ps[mi+1].name+'!',true); else if(mi>CM.myIdx&&ps[mi-1]) cmSay(ps[mi-1].name+' passes you.'); }
  if(mi>=0) CM.myIdx=mi; if(mi>=0&&ld.prog>=80&&CM.r80==null) CM.r80=mi;
  ps.forEach(function(p){ if(p.done!=null&&!CM.fin[p.name]){ var k=Object.keys(CM.fin).length+1; CM.fin[p.name]=k; cmSay(p.me?'You cross the line in '+ord(k)+'!':k===1?p.name+' takes the win!':p.name+' finishes '+ord(k)+'.',true); } });
  if(!CM.half&&ld.prog>=50&&ld.done==null){ CM.half=true; cmSay('Halfway. '+nm(ld)+(ld.me?' lead':' leads')+(sec&&sec.done==null?' by '+Math.max(1,Math.round(ld.prog-sec.prog))+'%':'')+'.'); }
  if(!CM.fs&&ld.prog>=85&&ld.done==null){ CM.fs=true; cmSay('Final stretch!',true); }
  if(sec&&ld.done==null&&sec.done==null&&ld.prog>25&&Math.abs(ld.prog-sec.prog)<1.5&&CM.nn<3&&now-CM.nnAt>7000){ CM.nn++; CM.nnAt=now; cmSay(nm(ld)+' and '+nm(sec)+' are neck and neck.'); } }
function cmRecap(room){ var rs=room.results||[], mine=rs.find(function(x){ return x.me; }), w=rs[0]; if(!mine||!w||CM.rid!==room.id) return ''; var t=[], gap=function(a,b){ return Math.abs(a-b)/1000; };
  if(mine.place===1&&rs[1]) t.push('You won by '+gap(rs[1].ms,mine.ms).toFixed(2)+' s over '+rs[1].name+'.'); else if(mine.place>1) t.push('You finished '+ord(mine.place)+' of '+rs.length+', '+gap(mine.ms,w.ms).toFixed(2)+' s behind '+w.name+'.');
  var tot=0; Object.keys(CM.lt).forEach(function(k){ tot+=CM.lt[k]; }); var me=room.players.find(function(p){ return p.me; }); if(me&&tot>8000&&CM.lt[me.name]){ var pc=Math.round(CM.lt[me.name]/tot*100); if(pc>=10) t.push('You led for about '+pc+'% of the race.'); }
  if(CM.r80===0&&mine.place>1) t.push('You were leading at 80% but lost it in the finish.'); else if(CM.r80!=null&&CM.r80>mine.place-1) t.push('You gained '+(CM.r80-(mine.place-1))+' place'+(CM.r80-(mine.place-1)>1?'s':'')+' in the final stretch.');
  if(CM.leadChanges>=2) t.push('The lead changed hands '+CM.leadChanges+' times.'); return t.join(' '); }
R.update=function(room){ R.room=room; if(!$('#rc')) return; try{ cmFeed(room); }catch(e){} var now=room.practice?Date.now():PL.now();
  if(room.status==='racing'||(room.status==='lobby'&&room.startAt-now<15000)||room.status==='done') ensureGame(room);
  var sh=$('#rcShare'); if(sh) sh.hidden=!(room.priv&&room.host&&room.status==='lobby'); LV.room=room;
  var sb=$('#rcStart'); if(sb) sb.hidden=!(room.priv&&room.host&&room.status==='lobby'&&room.players.length>1);
  title();
  var ps=room.players.slice().sort(function(a,b){ return (a.done!=null?0:1)-(b.done!=null?0:1)||(a.done||0)-(b.done||0)||b.prog-a.prog; });
  $('#rcN').textContent='Racers · '+room.players.length+'/'+(room.max||10);
  $('#rcList').innerHTML=ps.map(function(p,i){ return '<div class="rc-p'+(p.me?' me':'')+'"><b class="mono">'+(i+1)+'</b><span>'+esc(p.name)+(p.me?' (you)':'')+'</span><span class="mono" style="font-size:12px">'+(p.done!=null?PL.fmt(p.done):Math.round(p.prog||0)+'%')+'</span><span class="bar"><i style="width:'+Math.min(100,p.prog||0)+'%"></i></span></div>'; }).join('');
  $('#rcMsg').textContent=room.priv&&room.status==='lobby'?'Share the code '+room.code+'. The host can start once a friend joins.':room.status==='lobby'?(room.auto?'Top 3 win 500 · 300 · 150 tokens.':'Get ready…'):'';
  if(room.status==='done'&&room.results&&!$('#rcResIn')) results(room); };
function results(room){ var mine=room.results.find(function(x){ return x.me; }); if(mine&&PL.tick){ var rk=String(room.id||room.code||room.t||'r'); if(PL._rk!==rk){ PL._rk=rk; PL.tick('race'); } }
  var html='<div class="rc-res" id="rcResIn"><h3 style="font-size:22px;margin-bottom:10px">'+(mine?(mine.place===1?'🏆 You won!':'You finished '+ord(mine.place)):'Race over')+'</h3>'
    +(room.tres?'<div class="rc-p" style="grid-template-columns:1fr"><b>Team A '+room.tres.A+' – '+room.tres.B+' Team B · '+(room.tres.w?'Team '+room.tres.w+' wins':'Draw')+'</b></div>':'')
    +room.results.map(function(x){ return '<div class="rc-p'+(x.me?' me':'')+'" style="grid-template-columns:40px 1fr auto"><b class="mono">'+ord(x.place)+'</b><span>'+(x.tm?'<b style="color:'+(x.tm==='A'?'#e8202a':'#2447ff')+'">'+x.tm+'</b> ':'')+esc(x.name)+(x.ct?' ['+esc(x.ct)+']':'')+'</span><span class="mono">'+PL.fmt(x.ms)+(x.tokens?' · +'+x.tokens+' 🪙':'')+'</span></div>'; }).join('')
    +(function(){ var rc=''; try{ rc=cmRecap(room); }catch(e){} return rc?'<p class="rc-recap">'+esc(rc)+'</p>':''; })()+'<p style="font-size:13px;color:#9aa3b2;margin-top:8px" id="rcCe">'+(room.ce?ceTxt(R.practice&&R.practice.cres):room.practice?'Practice races have no prizes.':'Prizes arrive as a gift in a few seconds.')+'</p>'
    +'<div class="row" style="margin-top:12px">'+(room.ce?'<button class="btn pri" id="rcCeAgain">Try again</button>':room.practice?'<button class="btn pri" id="rcAgain">Race again</button>':room.priv?'<button class="btn pri" id="rcRe">Rematch</button>':'')+'<button class="btn" id="rcBack" style="background:#1b1e25;color:#fff;border-color:#2c313b">Back to Cube Race</button></div></div>';
  $('#rcRes').innerHTML=html; setTimeout(function(){ var x=$('#rcResIn'); if(x) x.scrollIntoView({behavior:'smooth',block:'nearest'}); },300);
  if(mine){ CW.setJ('cw2_lastrace',{t:ord(mine.place)+' of '+room.results.length+' · '+PL.fmt(mine.ms)+(room.practice?' · practice':''),at:Date.now()}); if(!room.practice) PL.addXP(mine.place===1?60:mine.place<=3?40:20); }
  var a=$('#rcAgain'); if(a) a.onclick=function(){ practice({len:room.len}); };
  var ca=$('#rcCeAgain'); if(ca) ca.onclick=function(){ if(PL.ceStart) PL.ceStart(); };
  var re=$('#rcRe'); if(re) re.onclick=async function(){ re.disabled=true; var r=await CW.call('/api/race/rematch',{id:me(),room:LV.roomId,car:carVal()},7000); if(!r.ok){ CW.toast(errOf(r)); re.disabled=false; return; } $('#rcRes').innerHTML=''; LV.roomId=r.data.room.id; kill(); R.update(r.data.room); };
  $('#rcBack').onclick=function(){ leave(); location.hash='race'; }; }

/* ======================= GARAGE ======================= */
var GT=[['cars','Cars'],['trails','Trails'],['pads','Pad skins']];
var PAL=['#f4f6f8','#fdbe18','#208e67','#3593e2','#eb402f','#f28a1e'];
function cubeSw(p){ var o=[p[0],p[1],p[2],p[3],p[4],p[5],p[0],p[3],p[1]]; return '<span class="cube6">'+o.map(function(c){ return '<i style="background:'+c+'"></i>'; }).join('')+'</span>'; }
function inSeason(s){ if(!s.season) return true; var n=new Date(), k=(n.getMonth()+1)*100+n.getDate(), a=s.season; return k>=a[0]*100+a[1]&&k<=a[2]*100+a[3]; }
PL.views.garage={show:function(el,h){ var tab=(h.split('/')[1])||'cars'; if(!GT.some(function(t){ return t[0]===tab; })) tab='cars';
  var html='<div class="wrap">'+PL.crumbs('Garage')+'<div class="row" style="margin-bottom:14px"><div class="seg" id="gT">'+GT.map(function(t){ return '<button type="button" data-t="'+t[0]+'" aria-pressed="'+(t[0]===tab)+'">'+t[1]+'</button>'; }).join('')+'</div><span class="sp"></span><button type="button" class="btn sm" id="gBest" title="Equip the most valuable one you own">⭐ Equip best</button><span class="chipb tok">🪙 <b>'+PL.tok().toLocaleString()+'</b></span></div>'+(tab==='pads'?'<label class="row" style="gap:10px;margin:0 0 14px;padding:10px 14px;border:1px solid var(--line,#ddd);border-radius:12px;cursor:pointer"><input type="checkbox" id="gSub"'+(window.CW_PADFX&&CW_PADFX.subtle&&CW_PADFX.subtle()?' checked':'')+'><span><b>Subtle pads</b> &nbsp;<small class="muted">Too flashy? Calmer colours, no moving effects, and only a tiny ripple when a solve ends.</small></span></label>':'')+'<div class="shopgrid" id="gG">';
  if(!E){ el.innerHTML=html+'</div><p class="muted">The race garage could not load. Refresh the page.</p></div>'; return; }
  if(tab==='cars'){ var own=E.carOwned(), c=E.curCar(); html+=E.CARDEF.map(function(d,i){ var ok=own.indexOf(i)>=0||i===0, p=d.sw||d.pal||PAL;
      return '<button class="item'+(ok?'':' lock')+'" data-k="car" data-i="'+i+'" aria-pressed="'+(c===i)+'"><span class="sw2" style="'+(d.rb?'background:linear-gradient(90deg,#eb402f,#fdbe18,#208e67,#3593e2,#7a5cff)':'')+'">'+cubeSw(p)+'</span><b>'+esc(d.n)+(d.model?' <span class="tag b">3D model</span>':'')+'</b><small>'+(c===i?'Equipped':ok?'Owned · tap to equip':d.cost.toLocaleString()+' tokens')+'</small></button>'; }).join(''); }
  if(tab==='trails'){ var ot=E.trailOwned(), ct=E.curTrail(); html+=E.TRAILDEF.map(function(d,i){ var ok=ot.indexOf(i)>=0||i===0, bg=d.rb?'linear-gradient(90deg,#eb402f,#fdbe18,#208e67,#3593e2,#7a5cff)':d.c?'linear-gradient(90deg,rgb('+d.c[0]+'),rgb('+d.c[1]+'))':'var(--paper)';
      return '<button class="item'+(ok?'':' lock')+'" data-k="trail" data-i="'+i+'" aria-pressed="'+(ct===i)+'"><span class="sw2" style="background:'+bg+'">'+(d.ic||'–')+'</span><b>'+esc(d.n)+'</b><small>'+(ct===i?'Equipped':ok?'Owned · tap to equip':d.cost.toLocaleString()+' tokens')+'</small></button>'; }).join(''); }
  if(tab==='wings'){ var ow=E.wingOwned(), cw=E.curWing(); html+=E.WINGDEF.map(function(d,i){ var ok=ow.indexOf(i)>=0||i===0;
      return '<button class="item'+(ok?'':' lock')+'" data-k="wing" data-i="'+i+'" aria-pressed="'+(cw===i)+'"><span class="sw2">'+d.ic+'</span><b>'+esc(d.n)+'</b><small>'+(cw===i?'Equipped':ok?'Owned · tap to equip':d.cost.toLocaleString()+' tokens')+'</small></button>'; }).join(''); }
  if(tab==='pads'){ var cp=PL.skins.cur(); html+=PL.skins.list.map(function(s){ var ok=PL.skins.has(s.i), special=s.secret||s.founder||s.gift||s.owner||s.lb||s.cz||s.hw||(s.season&&!inSeason(s));
      return '<button class="item'+(ok?'':' lock')+'" data-k="pad" data-i="'+s.i+'" aria-pressed="'+(cp===s.i)+'"><span class="sw2" style="background:'+s.css+'"></span><b>'+esc(s.n)+'</b><small>'+(cp===s.i?'Equipped':ok?'Owned · tap to equip':special?esc(s.need||'Special'):s.cost.toLocaleString()+' tokens')+'</small></button>'; }).join(''); }
  el.innerHTML=html+'</div>'+(tab==='pads'?'<p class="muted" style="font-size:13.5px;margin-top:12px">Pad skins change the timer. Forge skins earn 3× tokens while equipped.</p>':'<p class="muted" style="font-size:13.5px;margin-top:12px">Your car, trail and wings show in every Cube Race.</p>')+'</div>';
  var gs=$('#gSub'); if(gs) gs.onchange=function(){ if(window.CW_PADFX) CW_PADFX.setSubtle(gs.checked); PL.views.garage.show(el,'garage/pads'); };
  var gb=$('#gBest'); if(gb) gb.onclick=function(){ var b=bestOwned(tab); if(!b){ CW.toast('Nothing better to equip yet.'); return; } if(b.cur){ CW.toast(b.n+' is already your best.'); return; } b.eq(); CW.toast(b.n+' equipped'); if(PL.hud) PL.hud(); PL.views.garage.show(el,'garage/'+tab); };
  $('#gT').onclick=function(e){ var b=e.target.closest('[data-t]'); if(b) location.hash='garage/'+b.getAttribute('data-t'); };
  if(tab==='pads'&&window.CW_PADFX&&CW_PADFX.preview){ var live=[], ART=PL._padThumb||(PL._padThumb={});
    var art=function(b){ var sw=b.querySelector('.sw2'), id=+b.getAttribute('data-i'); if(!sw||b._art) return; b._art=1; try{ var u=ART[id]; if(u===undefined){ u=ART[id]=(window.CW_PADART&&CW_PADART.art[id]?CW_PADART.paint(id,300,180,1):null)||null; } if(u) sw.style.background='center/cover no-repeat url('+u+')'; }catch(e){} };
    var go=function(b){ if(!b||b._lv) return; var sw=b.querySelector('.sw2'); if(!sw) return; sw.style.overflow='hidden'; var st=CW_PADFX.preview(sw,+b.getAttribute('data-i')); if(st){ b._lv=st; live.push(b); while(live.length>24){ var o=live.shift(); if(o&&o._lv){ o._lv(); o._lv=null; } } } };
    var off=function(b){ if(b&&b._lv){ b._lv(); b._lv=null; var k=live.indexOf(b); if(k>=0) live.splice(k,1); } };
    var items=Array.prototype.slice.call(el.querySelectorAll('.item[data-k="pad"]'));
    var io=window.IntersectionObserver?new IntersectionObserver(function(es){ es.forEach(function(en){ var b=en.target; if(en.isIntersecting){ art(b); go(b); } else off(b); }); },{rootMargin:'40px'}):null;
    items.forEach(function(b){ if(io) io.observe(b); else { art(b); if(b.getAttribute('aria-pressed')==='true') go(b); } }); }
  $('#gG').onclick=function(e){ var b=e.target.closest('[data-k]'); if(!b) return; buy(b.getAttribute('data-k'),+b.getAttribute('data-i'),el,tab); }; }};
function bestOwned(tab){ var best=null;
  function cand(n,cost,isCur,eq){ if(!best||cost>best.cost) best={n:n,cost:cost,cur:isCur,eq:eq}; else if(cost===best.cost&&isCur) best={n:n,cost:cost,cur:true,eq:eq}; }
  if(tab==='pads'){ var cp=PL.skins.cur(); PL.skins.list.forEach(function(s){ if(!PL.skins.has(s.i)) return; var v=+s.cost||0; if(s.secret||s.founder||s.gift||s.owner||s.lb||s.cz||s.hw) v=Math.max(v,1e6); cand(s.n,v,cp===s.i,function(){ ls('cw_tmr_skin',String(s.i)); }); }); return best; }
  var D=tab==='cars'?E.CARDEF:tab==='trails'?E.TRAILDEF:E.WINGDEF, own=tab==='cars'?E.carOwned():tab==='trails'?E.trailOwned():E.wingOwned(), c=tab==='cars'?E.curCar():tab==='trails'?E.curTrail():E.curWing(), eq={cars:'cw_car',trails:'cw_trail',wings:'cw_wing'}[tab];
  D.forEach(function(d,i){ if(i!==0&&own.indexOf(i)<0) return; cand(d.n,+d.cost||0,c===i,function(){ ls(eq,String(i)); }); }); return best; }
function pvHtml(k,i){ try{
  if(k==='pad'){ var s=PL.skins.of(i), u=null; try{ u=window.CW_PADART&&CW_PADART.art[i]?CW_PADART.paint(i,640,220,1):null; }catch(e){} return '<div class="buypv" id="bpv" style="background:'+(u?'center/cover no-repeat url('+u+')':s.css)+'"><span>Preview</span></div>'; }
  var d=(k==='car'?E.CARDEF:k==='trail'?E.TRAILDEF:E.WINGDEF)[i];
  if(k==='car') return '<div class="buypv car"><span class="sw2" style="'+(d.rb?'background:linear-gradient(90deg,#eb402f,#fdbe18,#208e67,#3593e2,#7a5cff)':'')+'">'+cubeSw(d.sw||d.pal||PAL)+'</span>'+(d.model?'<small>3D model in races</small>':'')+'</div>';
  if(k==='trail') return '<div class="buypv trail" style="background:'+(d.rb?'linear-gradient(90deg,#eb402f,#fdbe18,#208e67,#3593e2,#7a5cff)':d.c?'linear-gradient(90deg,rgb('+d.c[0]+'),rgb('+d.c[1]+'))':'var(--paper)')+'"><span>'+(d.ic||'')+'</span></div>';
  return '<div class="buypv"><span style="font-size:46px">'+(d.ic||'')+'</span></div>'; }catch(e){ return ''; } }
function buy(k,i,el,tab){ var defs=k==='car'?E.CARDEF:k==='trail'?E.TRAILDEF:k==='wing'?E.WINGDEF:null, key={car:'cw_cars',trail:'cw_trails',wing:'cw_wings'}[k], eq={car:'cw_car',trail:'cw_trail',wing:'cw_wing'}[k];
  if(k==='pad'){ var s=PL.skins.of(i); if(!s) return;
    if(PL.skins.has(i)){ ls('cw_tmr_skin',String(i)); CW.toast(s.n+' equipped'); PL.hud(); return PL.views.garage.show(el,'garage/'+tab); }
    if(s.secret||s.founder||s.gift||s.owner||s.lb||s.cz||s.hw||(s.season&&!inSeason(s))){ CW.toast(s.need||'This one is special and cannot be bought.'); return; }
    confirmBuy(s.n,s.cost,function(){ PL.skins.unlock(i); ls('cw_tmr_skin',String(i)); PL.views.garage.show(el,'garage/'+tab); },pvHtml('pad',i),i); return; }
  var d=defs[i], own=CW.lsJ(key,[0]); if(!Array.isArray(own)) own=[0];
  if(own.indexOf(i)>=0||i===0){ ls(eq,String(i)); CW.toast(d.n+' equipped'); return PL.views.garage.show(el,'garage/'+tab); }
  confirmBuy(d.n,d.cost,function(){ var o=CW.lsJ(key,[0]); if(!Array.isArray(o)) o=[0]; if(o.indexOf(i)<0) o.push(i); CW.setJ(key,o); ls(eq,String(i)); PL.views.garage.show(el,'garage/'+tab); },pvHtml(k,i)); }
function confirmBuy(n,cost,done,pv,padI){ var have=PL.tok(), stopFx=null;
  var sh=CW.sheet('<div class="hd"><h2>'+esc(n)+'</h2><button class="x" data-close aria-label="Close">✕</button></div>'+(pv||'')+'<p>Costs <b>'+cost.toLocaleString()+' tokens</b>. You have '+have.toLocaleString()+'.</p>'
    +(have>=cost?'<button class="btn pri wide" id="cbGo" style="margin-top:14px">Buy and equip</button>':'<p class="muted" style="margin-top:10px">You need '+(cost-have).toLocaleString()+' more. Solves on the timer and race wins earn tokens.</p>'),function(){ if(stopFx) try{ stopFx(); }catch(e){} });
  if(padI!=null&&window.CW_PADFX&&CW_PADFX.preview){ var bp=$('#bpv',sh); if(bp) try{ stopFx=CW_PADFX.preview(bp,padI); }catch(e){} }
  var g=$('#cbGo',sh); if(g) g.onclick=function(){ if(!PL.spend(cost)){ CW.toast('Not enough tokens.'); return; } sh.close(); done(); CW.toast(n+' unlocked!'); }; }

/* /buy all in chat: buys everything in the Garage you can afford with your tokens (cheapest first). Special skins (gifts, seasons, leaderboard, secrets) are skipped. */
PL.buyAll=function(){ var L=[];
  [['car',E.CARDEF,'cw_cars'],['trail',E.TRAILDEF,'cw_trails'],['wing',E.WINGDEF,'cw_wings']].forEach(function(g){ var own=CW.lsJ(g[2],[0]); if(!Array.isArray(own)) own=[0];
    (g[1]||[]).forEach(function(d,i){ if(!d||i===0||own.indexOf(i)>=0||!(+d.cost>0)) return; L.push({k:g[0],key:g[2],i:i,n:d.n,cost:+d.cost}); }); });
  PL.skins.list.forEach(function(s){ if(!s||!(s.i>0)||PL.skins.has(s.i)||!(+s.cost>0)) return; if(s.secret||s.founder||s.gift||s.owner||s.lb||s.cz||s.hw||(s.season&&!inSeason(s))) return; if(L.some(function(x){ return x.k==='pad'&&x.i===s.i; })) return; L.push({k:'pad',i:s.i,n:s.n,cost:+s.cost}); });
  L.sort(function(a,b){ return a.cost-b.cost; }); var got=[], spent=0, left=[];
  L.forEach(function(x){ if(!PL.spend(x.cost)){ left.push(x); return; } spent+=x.cost; got.push(x);
    if(x.k==='pad') PL.skins.unlock(x.i); else { var o=CW.lsJ(x.key,[0]); if(!Array.isArray(o)) o=[0]; if(o.indexOf(x.i)<0) o.push(x.i); CW.setJ(x.key,o); } });
  PL.hud(); return {got:got,spent:spent,left:left,total:L.length}; };

/* ======================= CLUBS & TRADE ======================= */
var CC=['#2650f5','#e1352b','#1f9a52','#f2b600','#7a5cff','#ff7a1a','#12a3b8','#c43d8b'];
var CT=[['club','Club'],['board','Weekly board']];
var CS={tab:'club',me:null,seq:0,msgs:[],t:0,sbk:'s',sbp:'w',room:null};
PL.views.clubs={show:function(el,h){ CS.tab=(h.split('/')[1])||'club'; if(!CT.some(function(t){ return t[0]===CS.tab; })) CS.tab='club';
  el.innerHTML='<div class="wrap">'+PL.crumbs('Clubs')+'<div class="seg" id="cT" style="margin-bottom:14px">'+CT.map(function(t){ return '<button type="button" data-t="'+t[0]+'" aria-pressed="'+(t[0]===CS.tab)+'">'+t[1]+'</button>'; }).join('')+'</div><div id="cB"><p class="muted">Loading…</p></div></div>';
  $('#cT').onclick=function(e){ var b=e.target.closest('[data-t]'); if(b) location.hash='clubs/'+b.getAttribute('data-t'); };
  clearInterval(CS.t); ready().then(function(){ ({club:club,board:board})[CS.tab](); }); },
  leave:function(){ clearInterval(CS.t); }};
async function ready(){ if(!LV.on){ await new Promise(function(z){ PL.onLive(function(){ z(); }); PL.poll(); setTimeout(z,6000); }); } }
async function cl(act,x){ return CW.call('/api/club',Object.assign({id:me(),act:act},x||{}),8000); }
function badge(c,sz){ sz=sz||44; return '<span class="cb" style="width:'+sz+'px;height:'+sz+'px;background:'+CC[(c.col||0)%8]+'">'+esc(c.t)+'</span>'; }
async function club(){ var B=$('#cB'); if(!B) return; var r=await cl('me'); if(!$('#cB')) return;
  if(!r.ok){ B.innerHTML='<p class="muted">'+esc(errOf(r))+'</p><button class="btn" onclick="PL.views.clubs.show(document.getElementById(\'app\'),\'clubs/club\')">Try again</button>'; return; }
  CS.me=r.data.club; if(CS.me) return myClub(r.data);
  var lr=await cl('list'), L=(lr.ok&&lr.data&&lr.data.clubs)||[], pend=r.data.pend||[];
  B.innerHTML='<div class="grid2"><div class="pnl"><div class="row"><h3 style="margin:0">Find a club</h3><span class="sp"></span><input class="in" id="cQ" placeholder="Search" style="width:150px"></div><div id="cL" style="margin-top:8px"></div></div>'
    +'<div class="pnl"><h3>Start a club</h3><p class="muted" style="font-size:14px">Club members add their race and timer points together every week. Top clubs win tokens.</p>'
    +'<div class="field"><label>Name</label><input class="in" id="cN" maxlength="20"></div><div class="field"><label>Tag (2–4)</label><input class="in mono" id="cG" maxlength="4" style="text-transform:uppercase"></div>'
    +'<div class="field"><label>About</label><input class="in" id="cD" maxlength="80"></div><div class="field"><label>Colour</label><div class="sws" id="cCol">'+CC.map(function(c,i){ return '<button type="button" class="sw" data-col="'+i+'" aria-pressed="'+(i===0)+'" style="width:34px;height:34px;background:'+c+'"></button>'; }).join('')+'</div></div>'
    +'<button class="btn pri wide" id="cMk">Create club</button></div></div>';
  function list(q){ var l=L.filter(function(c){ return !q||c.n.toLowerCase().indexOf(q)>=0||c.t.toLowerCase()===q; });
    $('#cL').innerHTML=l.length?l.map(function(c){ var p=pend.indexOf(c.id)>=0||c.ap; return '<div class="club">'+badge(c)+'<div><b>'+esc(c.n)+'</b> <span class="mono muted" style="font-size:12px">['+esc(c.t)+'] Lv '+c.lv+'</span><br><small class="muted">'+c.mem+'/'+c.cap+' members · '+(c.op?'open':'ask to join')+(c.rk?' · #'+c.rk+' this week':'')+'</small></div><button class="btn sm'+(p?'':' pri')+'" data-j="'+c.id+'"'+(p?' disabled':'')+'>'+(p?'Requested':c.op?'Join':'Ask')+'</button></div>'; }).join(''):'<p class="empty2">No clubs yet. Start the first one!</p>'; }
  list(''); $('#cQ').oninput=function(){ list(this.value.trim().toLowerCase()); };
  var col=0; $('#cCol').onclick=function(e){ var b=e.target.closest('[data-col]'); if(!b) return; col=+b.getAttribute('data-col'); this.querySelectorAll('[data-col]').forEach(function(x){ x.setAttribute('aria-pressed',x===b); }); };
  $('#cL').onclick=async function(e){ var b=e.target.closest('[data-j]'); if(!b) return; b.disabled=true; var r=await cl('join',{c:b.getAttribute('data-j')}); if(!r.ok){ CW.toast(errOf(r)); b.disabled=false; return; } if(r.data.requested) CW.toast('Request sent.'); club(); };
  $('#cMk').onclick=async function(){ var r=await cl('create',{name:$('#cN').value.trim(),tag:$('#cG').value.trim(),desc:$('#cD').value.trim(),col:col,ic:0,op:true}); if(!r.ok){ CW.toast(errOf(r)); return; } CW.toast('Club created!'); club(); }; }
function myClub(d){ var c=d.club, B=$('#cB'), boss=c.role!=='m', own=c.role==='o', RN={o:'Owner',a:'Officer',m:'Member'};
  B.innerHTML='<div class="pnl"><div class="row">'+badge(c,54)+'<div><h3 style="margin:0">'+esc(c.n)+' <span class="mono muted" style="font-size:13px">['+esc(c.t)+']</span></h3><small class="muted">Level '+c.lv+' · '+c.mem+'/'+c.cap+' members'+(c.rk?' · #'+c.rk+' this week':'')+' · '+c.wp+' points this week</small></div><span class="sp"></span><button class="btn sm" id="cLv">Leave</button></div>'+(c.d?'<p class="muted" style="margin-top:8px">'+esc(c.d)+'</p>':'')+'</div>'
    +'<div class="grid2" style="margin-top:14px"><div class="pnl"><h3>Club chat</h3><div class="msgs" id="cM"></div><form class="row" id="cF" style="margin-top:8px"><input class="in" id="cI" maxlength="200" placeholder="Message your club" style="flex:1"><button class="btn sm pri">Send</button></form></div>'
    +'<div class="pnl"><h3>Members</h3><div class="list">'+c.members.map(function(m){ return '<div><span class="tag'+(m.on?' g':'')+'">'+(m.on?'on':'off')+'</span><span><b>'+esc(m.n)+'</b>'+(m.me?' (you)':'')+'<br><small class="muted">'+RN[m.r]+' · Lv '+m.lv+' · '+m.wp+' pts</small></span><span class="sp"></span>'
      +(!m.me&&own&&m.r!=='o'?'<button class="btn sm" data-ma="'+(m.r==='a'?'demote':'promote')+'" data-p="'+m.p+'">'+(m.r==='a'?'Make member':'Make officer')+'</button>':'')+(!m.me&&boss&&m.r==='m'||(!m.me&&own&&m.r==='a')?'<button class="btn sm" data-ma="kick" data-p="'+m.p+'">Remove</button>':'')+'</div>'; }).join('')+'</div>'
    +(c.apps&&c.apps.length?'<h3 style="margin-top:14px">Requests</h3><div class="list">'+c.apps.map(function(a){ return '<div><span><b>'+esc(a.n)+'</b><br><small class="muted">Lv '+a.lv+'</small></span><span class="sp"></span><button class="btn sm pri" data-ma="accept" data-p="'+a.p+'">Accept</button><button class="btn sm" data-ma="decline" data-p="'+a.p+'">Decline</button></div>'; }).join('')+'</div>':'')
    +'<p class="muted" style="font-size:13px;margin-top:12px">Weekly reset: '+new Date(d.reset).toLocaleString('en-MY',{weekday:'short',hour:'numeric',minute:'2-digit'})+'. You need '+d.minpts+' points in a week to share the club reward.</p></div></div>';
  $('#cLv').onclick=async function(){ if(!confirm2(this,'Tap again to leave')) return; var r=await cl('leave'); if(!r.ok){ CW.toast(errOf(r)); return; } club(); };
  B.addEventListener('click',async function(e){ var b=e.target.closest('[data-ma]'); if(!b) return; b.disabled=true; var r=await cl(b.getAttribute('data-ma'),{p:b.getAttribute('data-p')}); if(!r.ok) CW.toast(errOf(r)); club(); });
  $('#cF').onsubmit=async function(e){ e.preventDefault(); var v=$('#cI').value.trim(); if(!v) return; var r=await cl('chat',{text:v}); if(!r.ok){ CW.toast(errOf(r)); return; } $('#cI').value=''; msgs(); };
  CS.seq=0; CS.msgs=[]; msgs(); clearInterval(CS.t); CS.t=setInterval(function(){ if(!$('#cM')){ clearInterval(CS.t); return; } msgs(); },4000); }
function confirm2(b,txt){ if(b.dataset.c==='1') return true; b.dataset.c='1'; var o=b.textContent; b.textContent=txt; setTimeout(function(){ b.dataset.c=''; b.textContent=o; },3000); return false; }
async function msgs(){ var r=await cl('msgs',{since:CS.seq}); if(!r.ok||!$('#cM')) return; (r.data.msgs||[]).forEach(function(m){ if(m.s>CS.seq){ CS.msgs.push(m); CS.seq=m.s; } });
  var box=$('#cM'); box.innerHTML=CS.msgs.length?CS.msgs.slice(-80).map(function(m){ return '<div class="m"><b>'+esc(m.n)+'</b>: '+esc(m.t)+'<small>'+new Date(m.at).toLocaleTimeString('en-MY',{hour:'numeric',minute:'2-digit'})+'</small></div>'; }).join(''):'<p class="empty2">Say hi to your club.</p>'; box.scrollTop=box.scrollHeight; }
async function board(){ var B=$('#cB'); var r=await CW.call('/api/sb',{id:me(),kind:CS.sbk,per:CS.sbp},8000); var br=await cl('board'); if(!$('#cB')) return;
  var d=r.ok?r.data:{rows:[]}, cb=br.ok?br.data:{w:[]};
  B.innerHTML='<div class="grid2"><div class="pnl"><div class="row"><h3 style="margin:0">3×3 timer board</h3><span class="sp"></span><div class="seg" id="sbK"><button data-k="s" aria-pressed="'+(CS.sbk==='s')+'">Single</button><button data-k="a" aria-pressed="'+(CS.sbk==='a')+'">Ao5</button></div><div class="seg" id="sbP"><button data-p="w" aria-pressed="'+(CS.sbp==='w')+'">Week</button><button data-p="all" aria-pressed="'+(CS.sbp==='all')+'">All time</button></div></div>'
    +'<div class="list" style="margin-top:8px">'+((d.rows||[]).length?d.rows.map(function(x){ return '<div'+(x.me?' style="color:var(--blue)"':'')+'><b class="mono" style="width:32px">'+x.r+'</b><span>'+esc(x.n)+(x.ct?' <span class="tag">'+esc(x.ct)+'</span>':'')+'</span><span class="sp"></span><b class="mono">'+PL.fmt(x.ms)+'</b></div>'; }).join(''):'<p class="empty2">No times yet. Solve 3×3 on the timer to get on the board.</p>')+'</div>'
    +(d.mine?'<p class="muted" style="margin-top:8px">You: #'+d.mine.r+' of '+d.of+' · '+PL.fmt(d.mine.ms)+'</p>':'')+'</div>'
    +'<div class="pnl"><h3>Top clubs this week</h3><div class="list">'+((cb.w||[]).length?cb.w.map(function(c,i){ return '<div><b class="mono" style="width:28px">'+(i+1)+'</b>'+badge(c,30)+'<span>'+esc(c.n)+'</span><span class="sp"></span><b class="mono">'+c.wp+'</b></div>'; }).join(''):'<p class="empty2">No club points yet this week.</p>')+'</div>'
    +(cb.reset?'<p class="muted" style="font-size:13px;margin-top:8px">Resets '+new Date(cb.reset).toLocaleString('en-MY',{weekday:'short',hour:'numeric',minute:'2-digit'})+'</p>':'')+'</div></div>';
  $('#sbK').onclick=function(e){ var b=e.target.closest('[data-k]'); if(b){ CS.sbk=b.getAttribute('data-k'); board(); } };
  $('#sbP').onclick=function(e){ var b=e.target.closest('[data-p]'); if(b){ CS.sbp=b.getAttribute('data-p'); board(); } };
  clearTimeout(CS.bt); CS.bt=setTimeout(function(){ if($('#cB')) board(); },15000); }

/* ---- trade: pad skins, through a two-sided room on the server ---- */
function t2(act,x){ return CW.call('/api/t2/'+act,Object.assign({id:me(),name:PL.name(),own:PL.skins.owned()},x||{}),8000); }
function skinChip(k,ed){ return '<span style="display:inline-flex;align-items:center;gap:6px;margin:2px 6px 2px 0"><i style="width:26px;height:26px;border-radius:7px;background:'+PL.skins.css(k)+';display:inline-block"></i>'+esc(PL.skins.name(k))+(ed?' <small class="mono muted">#'+ed+'</small>':'')+'</span>'; }
async function trade(){ var B=$('#cB'); var inv=await CW.call('/api/trade/inv',{id:me(),own:PL.skins.owned()},8000), mk=await t2('market'), rm=await t2('rooms'); if(!$('#cB')) return;
  var I=inv.ok?inv.data:{skins:[],val:{}}, M=mk.ok?mk.data.list||[]:[], RM=rm.ok?rm.data.rooms||[]:[];
  var mine=I.skins||[];
  B.innerHTML=(RM.length?'<div class="pnl"><h3>Your trade rooms</h3><div class="list">'+RM.map(function(r){ return '<div><span>With <b>'+esc(r.with)+'</b>'+(r.fresh?' <span class="tag b">new</span>':'')+'<br><small class="muted">'+(r.st==='fund'?'Paying tokens':r.lock?'You locked in':'Open')+'</small></span><span class="sp"></span><button class="btn sm pri" data-room="'+r.tid+'">Open</button></div>'; }).join('')+'</div></div>':'')
    +'<div class="grid2" style="margin-top:14px"><div class="pnl"><h3>Market</h3><div class="list">'+(M.length?M.map(function(m){ return '<div><span>'+m.sk.map(function(k){ return skinChip(k); }).join('')+'<br><small class="muted">'+esc(m.n)+(m.ask?' · asks '+m.ask.toLocaleString()+' tokens':' · open to offers')+(m.note?' · “'+esc(m.note)+'”':'')+'</small></span><span class="sp"></span>'+(m.mine?'<button class="btn sm" data-un="'+m.lid+'">Remove</button>':'<button class="btn sm pri" data-open="'+m.lid+'">Trade</button>')+'</div>'; }).join(''):'<p class="empty2">Nothing listed right now.</p>')+'</div></div>'
    +'<div class="pnl"><h3>List a skin</h3><p class="muted" style="font-size:14px">Only pad skins that can be traded show here. Special skins swap for skins only.</p>'
    +(mine.length?'<div class="sws" id="tSk" style="margin:10px 0">'+mine.map(function(s){ return '<button type="button" class="sw" data-sk="'+s.skin+'" aria-pressed="false" style="padding:6px 10px">'+skinChip(s.skin,s.ed)+'</button>'; }).join('')+'</div>'
      +'<div class="field"><label>Ask for tokens (optional)</label><input class="in" id="tAsk" type="number" min="0" max="50000" placeholder="0 = open to offers"></div><div class="field"><label>Note</label><input class="in" id="tNote" maxlength="40"></div><button class="btn pri wide" id="tPost">List it</button>'
      :'<p class="empty2">You have no tradeable pad skins yet. Buy them in the Garage.</p>')+'</div></div>';
  var pick=[]; var sk=$('#tSk'); if(sk) sk.onclick=function(e){ var b=e.target.closest('[data-sk]'); if(!b) return; var k=+b.getAttribute('data-sk'), i=pick.indexOf(k); if(i>=0) pick.splice(i,1); else if(pick.length<3) pick.push(k); b.setAttribute('aria-pressed',pick.indexOf(k)>=0); };
  var po=$('#tPost'); if(po) po.onclick=async function(){ var r=await t2('post',{sk:pick,ask:+$('#tAsk').value||0,note:$('#tNote').value.trim()}); if(!r.ok){ CW.toast(errOf(r)); return; } CW.toast('Listed for 24 hours.'); trade(); };
  B.onclick=async function(e){ var b;
    if((b=e.target.closest('[data-open]'))){ var r=await t2('open',{lid:b.getAttribute('data-open')}); if(!r.ok){ CW.toast(errOf(r)); return; } room(r.data.tid); }
    else if((b=e.target.closest('[data-un]'))){ await t2('unpost',{lid:b.getAttribute('data-un')}); trade(); }
    else if((b=e.target.closest('[data-room]'))) room(b.getAttribute('data-room')); }; }
async function room(tid){ var r=await t2('room',{tid:tid}); if(!r.ok){ CW.toast('That trade room is gone.'); trade(); return; } var v=r.data.room, inv=await CW.call('/api/trade/inv',{id:me(),own:PL.skins.owned()},8000), mine=inv.ok?inv.data.skins:[];
  var sel=v.mine.sk.slice(), done=v.st==='done'||v.st==='cancelled';
  var sh=CW.sheet('<div class="hd"><h2>Trade with '+esc(v.other)+'</h2><button class="x" data-close aria-label="Close">✕</button></div>'
    +(done?'<p class="note">'+(v.st==='done'?'✓ Trade complete. Your items arrive as gifts.':'Cancelled. '+esc(v.why||''))+'</p>':'')
    +'<div class="grid2"><div><div class="eyebrow">They give</div><p style="margin:6px 0">'+(v.theirs.sk.map(function(k,i){ return skinChip(k,v.theirs.ed[i]); }).join('')||'')+(v.theirs.tk?'<b>'+v.theirs.tk.toLocaleString()+' tokens</b>':'')+(!v.theirs.sk.length&&!v.theirs.tk?'<span class="muted">Nothing yet</span>':'')+'</p>'+(v.theirs.lock?'<span class="tag g">Locked in</span>':'')+'</div>'
    +'<div><div class="eyebrow">You give</div>'+(done||v.st!=='room'?'<p style="margin:6px 0">'+v.mine.sk.map(function(k,i){ return skinChip(k,v.mine.ed[i]); }).join('')+(v.mine.tk?'<b>'+v.mine.tk.toLocaleString()+' tokens</b>':'')+'</p>'
      :'<div class="sws" id="rSk" style="margin:6px 0">'+(mine.length?mine.map(function(s){ return '<button type="button" class="sw" data-sk="'+s.skin+'" aria-pressed="'+(sel.indexOf(s.skin)>=0)+'" style="padding:5px 8px">'+skinChip(s.skin,s.ed)+'</button>'; }).join(''):'<span class="muted">No tradeable skins</span>')+'</div><input class="in" id="rTk" type="number" min="0" placeholder="Tokens" value="'+(v.mine.tk||'')+'">')+(v.mine.lock?' <span class="tag g">Locked in</span>':'')+'</div></div>'
    +(!done?'<p class="muted" style="font-size:13.5px;margin-top:10px">'+(v.msg?esc(v.msg):v.fair?'Looks fair.':'Values are far apart — the server only allows fair trades.')+'</p>':'')
    +(v.st==='room'?'<div class="row" style="margin-top:12px"><button class="btn" id="rSet">Update my offer</button><button class="btn pri" id="rLock">'+(v.mine.lock?'Unlock':'Lock in')+'</button><span class="sp"></span><button class="btn sm" id="rLeave">Leave</button></div>':'')
    +(v.st==='fund'&&v.need?'<button class="btn pri wide" id="rFund" style="margin-top:12px">Pay '+v.need.toLocaleString()+' tokens to finish</button>':v.st==='fund'?'<p class="note" style="margin-top:12px">Waiting for '+esc(v.other)+' to pay.</p>':'')
    +'<div class="msgs" id="rChat" style="margin-top:12px;max-height:160px">'+(v.chat||[]).map(function(m){ return '<div class="m"><b>'+(m.me?'You':esc(v.other))+'</b>: '+esc(m.t)+'</div>'; }).join('')+'</div>'
    +(!done?'<form class="row" id="rF" style="margin-top:6px"><input class="in" id="rI" maxlength="120" placeholder="Message" style="flex:1"><button class="btn sm">Send</button></form>':''),function(){ clearInterval(R.tradeT); });
  var rs=$('#rSk',sh); if(rs) rs.onclick=function(e){ var b=e.target.closest('[data-sk]'); if(!b) return; var k=+b.getAttribute('data-sk'), i=sel.indexOf(k); if(i>=0) sel.splice(i,1); else if(sel.length<3) sel.push(k); b.setAttribute('aria-pressed',sel.indexOf(k)>=0); };
  function again(){ sh.close(); room(tid); }
  var st=$('#rSet',sh); if(st) st.onclick=async function(){ var r=await t2('set',{tid:tid,sk:sel,tk:+$('#rTk',sh).value||0}); if(!r.ok) CW.toast(errOf(r)); again(); };
  var lk=$('#rLock',sh); if(lk) lk.onclick=async function(){ var r=await t2('lock',{tid:tid,on:!v.mine.lock}); if(!r.ok) CW.toast(errOf(r)); again(); };
  var lv=$('#rLeave',sh); if(lv) lv.onclick=async function(){ await t2('leave',{tid:tid}); sh.close(); trade(); };
  var fd=$('#rFund',sh); if(fd) fd.onclick=async function(){ if(!PL.spend(v.need)){ CW.toast('You need '+v.need.toLocaleString()+' tokens.'); return; } var r=await t2('fund',{tid:tid}); if(!r.ok){ PL.add(v.need); CW.toast(errOf(r)); } again(); };
  var f=$('#rF',sh); if(f) f.onsubmit=async function(e){ e.preventDefault(); var t=$('#rI',sh).value.trim(); if(!t) return; var r=await t2('chat',{tid:tid,text:t}); if(!r.ok) CW.toast(errOf(r)); again(); };
  clearInterval(R.tradeT); if(!done) R.tradeT=setInterval(async function(){ if(!sh.isConnected){ clearInterval(R.tradeT); return; } var x=await t2('room',{tid:tid}); if(x.ok&&x.data.room&&x.data.room.rev!==v.rev&&document.activeElement&&!/INPUT/.test(document.activeElement.tagName)){ clearInterval(R.tradeT); again(); } },3000); }
})();
