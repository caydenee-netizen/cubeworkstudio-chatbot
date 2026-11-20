/* Owner batch: Events tab (challenge builder and group gifts), challenge card for players, maintenance screen,
   token economy reporting, and chat moderation buttons for helpers and moderators. */
(function(){
'use strict';
if(typeof CW==='undefined'||!window.PL) return;
var LV=PL.live, esc=CW.esc;
function isOwner(){ try{ return !!(localStorage.getItem('cw_owner_key')||localStorage.getItem('cw_owner_key2')); }catch(e){ return false; } }
/* ---------- what the poll sends and gets back ---------- */
var ecoSent=null;
PL.pollX=function(){ var x={}; try{ var o=JSON.parse(localStorage.getItem('cw_eco')||'{}')||{}; if(o.e||o.s){ x.te=o.e||0; x.tsp=o.s||0; ecoSent=o; } }catch(e){}
  var C=LV.chal; if(C&&!C.done&&PL.now()<C.end){ var v=chalVal(C); if(v>0){ x.cv=v; x.cid=C.id; } } return x; };
PL.pollOk=function(d){ if(ecoSent){ try{ var o=JSON.parse(localStorage.getItem('cw_eco')||'{}')||{}; o.e=Math.max(0,(o.e||0)-(ecoSent.e||0)); o.s=Math.max(0,(o.s||0)-(ecoSent.s||0)); localStorage.setItem('cw_eco',JSON.stringify(o)); }catch(e){} ecoSent=null; }
  maint(); chalCard(); };
/* ---------- challenge value from this player's timer ---------- */
function solves(){ var d=CW.lsJ('cw_timer',{})||{}, sv=d.solves||{}, a=[]; Object.keys(sv).forEach(function(k){ (sv[k]||[]).forEach(function(s){ if(s&&typeof s.t==='number') a.push({c:k,t:s.t,p:s.p||0,d:s.d||0}); }); }); return a; }
function val(x){ return x.p===2?Infinity:x.t+(x.p===1?2000:0); }
function chalVal(C){ var L=solves().filter(function(x){ return x.d>=C.st&&x.d<=C.end; }); if(window.CWChalVal){ var cv=CWChalVal(C,L); if(cv!==null) return cv; }
  if(C.k==='solves') return L.length;
  var L3=L.filter(function(x){ return x.c==='333'; }).sort(function(a,b){ return a.d-b.d; });
  if(C.k==='best'){ var b=Infinity; L3.forEach(function(x){ b=Math.min(b,val(x)); }); return b===Infinity?0:b; }
  var best=Infinity; for(var i=4;i<L3.length;i++){ var w=L3.slice(i-4,i+1).map(val).sort(function(a,b){ return a-b; }); if(w[3]!==Infinity) best=Math.min(best,(w[1]+w[2]+w[3])/3); } return best===Infinity?0:Math.round(best); }
function fmtT(ms){ var s=ms/1000; if(s<60) return s.toFixed(2); var m=Math.floor(s/60); return m+':'+(s-m*60).toFixed(2).padStart(5,'0'); }
function fv(C,v){ return C.k==='solves'?v+' solve'+(v===1?'':'s'):fmtT(v); }
function left(ms){ if(ms<=0) return 'ended'; var h=Math.floor(ms/36e5), m=Math.floor(ms%36e5/6e4); return h>=48?Math.floor(h/24)+' days left':h?h+' h '+m+' min left':m+' min left'; }
var KN={solves:'Most solves',best:'Best 3×3 single',ao5:'Best 3×3 average of 5'}, PZ=[['3h','One-handed'],['222','2×2'],['444','4×4'],['555','5×5'],['666','6×6'],['777','7×7'],['pyr','Pyraminx'],['skb','Skewb'],['mega','Megaminx']]; PZ.forEach(function(p){ KN['best:'+p[0]]='Best '+p[1]+' single'; });
/* ---------- challenge card (Home and Timer) ---------- */
function chalHtml(){ var C=LV.chal; if(!C||(C.done&&PL.now()-C.end>86400000)) return ''; var mine=chalVal(C), done=C.done||PL.now()>=C.end;
  return '<div class="pnl ch8"><div class="row" style="gap:10px;align-items:flex-start"><span class="ch8-ic">🏆</span><div style="flex:1;min-width:0"><small class="ch8-k">'+(done?'Challenge finished':'Challenge · '+left(C.end-PL.now()))+'</small><b class="ch8-n">'+esc(C.n)+'</b><small class="muted">'+KN[C.k]+(C.pz&&C.pz[0]?' · prizes '+C.pz.filter(Boolean).map(function(x){ return x.toLocaleString(); }).join(' / ')+' tokens':'')+'</small></div></div>'
   +'<div class="ch8-top">'+(C.top.length?C.top.map(function(r,i){ return '<div><span>'+['🥇','🥈','🥉','4','5'][i]+'</span><b>'+esc(r.n)+'</b><i>'+fv(C,r.v)+'</i></div>'; }).join(''):'<p class="muted" style="margin:4px 0">Nobody has a score yet. Be first!</p>')+'</div>'
   +'<p class="ch8-me">'+(C.me?'You are #'+C.me.r+' of '+C.cnt+' with '+fv(C,C.me.v):mine?'Your score: '+fv(C,mine)+' (sending…)':done?'You did not take part.':'Use the Timer to take part.')+'</p></div>'; }
function chalCard(){ document.querySelectorAll('.ch8-host').forEach(function(h){ var x=chalHtml(); if(h.__h!==x){ h.__h=x; h.innerHTML=x; } }); }
['home','timer'].forEach(function(v){ var V=PL.views&&PL.views[v]; if(!V||!V.show) return; var o=V.show; V.show=function(el){ var r=o.apply(this,arguments); try{ var w=el.querySelector('.wrap')||el; if(!w.querySelector('.ch8-host')){ var h=document.createElement('div'); h.className='ch8-host'; var anchor=w.querySelector('.tools,.grid,#tPad,.t3')||null; if(v==='home'&&w.children[1]) w.insertBefore(h,w.children[1].nextSibling); else w.insertBefore(h,w.firstChild.nextSibling); } chalCard(); }catch(e){} return r; }; });
/* ---------- maintenance screen ---------- */
function maint(){ var on=!!LV.maint&&!isOwner(), el=document.getElementById('mt8');
  if(!on){ if(el) el.remove(); return; } if(!el){ el=document.createElement('div'); el.id='mt8'; document.body.appendChild(el); }
  var h='<div class="mt8-c"><div class="mt8-i">🛠️</div><h2>Back soon</h2><p>'+esc(LV.maint)+'</p><small>This page checks by itself and opens again when we are done.</small></div>'; if(el.__h!==h){ el.__h=h; el.innerHTML=h; } }
/* ---------- Owner tools → Events tab ---------- */
var EV={chal:null};
window.CWOwnEv={load:async function(){ var r=await CW.admin('chal',{act:'peek'}); EV.chal=r.ok?r.data.chal:null; },
 html:function(){ var C=EV.chal, live=C&&!C.done;
  return '<h4 style="margin-top:0">🏆 Challenge</h4>'+(C?'<div class="ch8 pnl" style="margin:0 0 10px"><b>'+esc(C.n)+'</b> <small class="muted">'+KN[C.k]+' · '+(C.done?'finished':left(C.end-PL.now()))+' · '+C.cnt+' players</small>'+(C.top.length?'<div class="ch8-top">'+C.top.map(function(r,i){ return '<div><span>'+(i+1)+'</span><b>'+esc(r.n)+'</b><i>'+fv(C,r.v)+'</i></div>'; }).join('')+'</div>':'')+'<div class="row" style="gap:8px;margin-top:8px">'+(live?'<button type="button" class="btn" data-ev="end">End now and pay prizes</button>':'')+'<button type="button" class="btn" data-ev="cancel">'+(live?'Cancel (no prizes)':'Remove')+'</button></div></div>':'')
   +(live?'':'<p class="muted" style="font-size:13.5px;margin:0 0 8px">Players take part with the Timer. The top 3 get their tokens automatically when it ends.</p>'
   +'<div class="o2-form"><input class="inp" id="evN" maxlength="40" placeholder="Name, e.g. Weekend Grind"><select class="inp" id="evK"><option value="solves">Most solves</option><option value="best">Best 3×3 single</option><option value="ao5">Best 3×3 average of 5</option><optgroup label="Theme week: best single in…">'+PZ.map(function(p){ return '<option value="best:'+p[0]+'">'+p[1]+'</option>'; }).join('')+'</optgroup></select>'
   +'<select class="inp" id="evH"><option value="2">2 hours</option><option value="24" selected>1 day</option><option value="72">3 days</option><option value="168">1 week</option></select>'
   +'<div class="row" style="gap:6px"><input class="inp" id="evP1" type="number" min="0" placeholder="1st prize" value="1000"><input class="inp" id="evP2" type="number" min="0" placeholder="2nd" value="500"><input class="inp" id="evP3" type="number" min="0" placeholder="3rd" value="250"></div>'
   +'<button type="button" class="btn pri" data-ev="start">Start challenge</button></div>')
   +'<h4>🎁 Gift a group</h4><p class="muted" style="font-size:13.5px;margin:0 0 8px">Players who are offline get it the next time they open Cuber Tools.</p><div class="o2-form"><select class="inp" id="evGt"><option value="all">Everyone online now</option><option value="everyone">Every player ever seen</option><option value="lv">Players at or above a level…</option><option value="club">Everyone in a club…</option></select><input class="inp" id="evGx" placeholder="Level number or club name"><select class="inp" id="evGk"><option value="tokens">Tokens</option><option value="spins">Spins</option><option value="xp">XP</option><option value="x2">Double tokens (hours)</option></select><input class="inp" id="evGv" type="number" min="1" placeholder="How many" value="100"><input class="inp" id="evGm" maxlength="60" placeholder="Message (optional)"><button type="button" class="btn pri" data-ev="gift">Send gift</button></div>'; }};
document.addEventListener('click',async function(e){ var b=e.target.closest&&e.target.closest('[data-ev]'); if(!b) return; var a=b.getAttribute('data-ev'), v=function(id){ var x=document.getElementById(id); return x?x.value.trim():''; }, r;
  if(a==='start'){ if(!v('evN')){ CW.toast('Give the challenge a name.'); return; } r=await CW.admin('chal',{act:'start',n:v('evN'),k:v('evK'),hours:+v('evH'),pz:[+v('evP1')||0,+v('evP2')||0,+v('evP3')||0]}); }
  else if(a==='end'||a==='cancel'){ if(!b.getAttribute('data-sure')){ b.setAttribute('data-sure','1'); b.textContent='Tap again to confirm'; return; } r=await CW.admin('chal',{act:a}); }
  else if(a==='gift'){ var t=v('evGt'), x=v('evGx'), to=t==='lv'?'lv:'+(parseInt(x,10)||1):t==='club'?'club:'+x:t; if(t==='club'&&!x){ CW.toast('Type the club name.'); return; } if(!b.getAttribute('data-sure')){ b.setAttribute('data-sure','1'); b.textContent='Tap again to send'; return; }
    r=await CW.admin('gift',{kind:v('evGk'),value:+v('evGv')||0,msg:v('evGm'),to:to}); CW.toast(r.ok?'Sent to '+(r.data.sent||0)+' players.':((r.data&&r.data.error)||'Could not send.')); b.removeAttribute('data-sure'); b.textContent='Send gift'; return; }
  if(r&&r.ok){ EV.chal=r.data.chal; CW.toast('Done.'); PL.poll(); } else if(r) CW.toast((r.data&&r.data.error)||'Could not do that.');
  var host=document.getElementById('oO2'); if(host) document.querySelector('[data-o2t="ev"]').click(); });
/* ---------- helpers and moderators: delete, mute, pin right in chat ---------- */
document.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('[data-smod]'); if(!b) return; var a=b.getAttribute('data-smod'), s=+b.getAttribute('data-s'), m=(LV.chat||[]).find(function(x){ return x.s===s; }); if(!m) return;
  var body=a==='del'?{act:'del',s:s}:a==='mute'?{act:'mute',p:m.p,mins:+b.getAttribute('data-min')||5}:{act:'pin',ch:m.ch||'general',t:m.t};
  CW.call('/api/chat/mod',Object.assign({id:CW.devId()},body),6000).then(function(r){ CW.toast(r.ok?(a==='del'?'Message removed.':a==='mute'?m.n+' muted.':'Pinned.'):((r.data&&r.data.error)||'Could not do that.')); if(r.ok){ if(a!=='pin') LV.chat=LV.chat.filter(function(x){ return a==='del'?x.s!==s:x.p!==m.p; }); PL.poll(); } }); });
PL.staffBtns=function(m){ var st=LV.st||0; if(!st||!m||m.p===LV.me||m.st) return ''; return '<button type="button" class="t" data-smod="del" data-s="'+m.s+'">🗑 Remove</button><button type="button" class="t" data-smod="mute" data-s="'+m.s+'" data-min="'+(st===2?60:15)+'">🔇 Mute '+(st===2?60:15)+' min</button>'+(st===2&&!m.em?'<button type="button" class="t" data-smod="pin" data-s="'+m.s+'">📌 Pin</button>':''); };
})();
