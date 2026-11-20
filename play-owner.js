/* /play owner panel (👑 button on the owner's device, /play#owner, or "Live & race" in the shop console).
   Tabs: Live · Messages · Players · Chat · Stats. Every action is checked again by the live server. */
(function(){
'use strict';
var $=CW.$, esc=CW.esc, PL=window.PL, LV=PL.live;
var TR=['sunset','night','rain','snow','desert','neon','beach','volcano','aurora','space','sakura','glacier','autumn'];
var O={tab:'live',el:null,users:null,stats:null,sched:null,chat:null,busy:false};
function signIn(then){
  var d=CW.sheet('<div class="hd"><h2>👑 Owner sign-in</h2><button class="x" data-close aria-label="Close">✕</button></div><p class="muted">Enter your 4-digit owner code.</p>'
    +'<div class="field"><label for="poC">Code</label><input class="in" id="poC" inputmode="numeric" maxlength="4" autocomplete="one-time-code" style="font:600 26px var(--mono);letter-spacing:.5em;text-align:center"></div><div class="msg" id="poM"></div><button class="btn pri wide" id="poGo">Sign in</button>'
    +'<details style="margin-top:14px"><summary style="cursor:pointer;color:var(--ink2);font-size:14px">I have a one-time secret</summary><div class="field" style="margin-top:8px"><input class="in" id="poS" maxlength="16" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="XXXX-XXXX-XXXX" style="font:600 18px var(--mono);letter-spacing:.12em;text-align:center;width:100%"></div><div class="msg" id="poSM"></div><button class="btn wide" id="poSGo" type="button">Use secret</button></details>');
  $('#poSGo',d).onclick=async function(){ var s=$('#poS',d).value.trim(); if(s.replace(/[^A-Za-z0-9]/g,'').length!==12){ $('#poSM',d).textContent='The secret has 12 letters and numbers.'; return; } $('#poSM',d).className='msg'; $('#poSM',d).textContent='Checking…'; var r=await CW.ownerClaim(s); if(r.ok){ d.close(); crown(); then(); } else { $('#poSM',d).className='msg bad'; $('#poSM',d).textContent=r.msg; } };
  var go=async function(){ var c=$('#poC',d).value.replace(/\D/g,''); if(c.length!==4){ $('#poM',d).textContent='Enter all 4 digits.'; return; } $('#poM',d).textContent='Checking…';
    var r=await CW.ownerSignIn(c); if(r.ok){ d.close(); crown(); then(); } else { $('#poM',d).className='msg bad'; $('#poM',d).textContent=r.msg; $('#poC',d).value=''; } };
  $('#poGo',d).onclick=go; $('#poC',d).addEventListener('input',function(e){ if(e.target.value.replace(/\D/g,'').length===4) go(); }); }
PL.owner=function(){ if(!CW.ownerKeys()) signIn(open); else open(); };

/* 👑 shows only on a device that has signed in as the owner before */
function crown(){ if(CW.ls('cw_owner_dev')!=='1'||$('#ownCrown')) return; var fab=document.querySelector('.fab'); if(!fab) return;
  var a=document.createElement('a'); a.id='ownCrown'; a.href='#owner'; a.textContent='👑 Owner'; a.style.background='#f2b600'; a.style.color='#111'; fab.insertBefore(a,fab.firstChild); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',crown); else crown();
async function secretLink(){ var m=/^#owner=([A-Za-z0-9-]{12,16})$/.exec(location.hash||''); if(!m) return; try{ history.replaceState(null,'',location.pathname); }catch(e){}
  if(CW.ownerKeys()){ open(); return; } CW.toast('Checking your one-time secret…'); var r=await CW.ownerClaim(m[1]); if(r.ok){ crown(); CW.toast('👑 This device is now an owner device.'); open(); } else CW.toast(r.msg); }
window.addEventListener('hashchange',secretLink); if(document.readyState==='complete') setTimeout(secretLink,300); else window.addEventListener('load',function(){ setTimeout(secretLink,300); });
async function newDev(){ var sh=CW.sheet('<div class="hd"><h2>🔑 Owner panel on a new device</h2><button class="x" data-close aria-label="Close">✕</button></div><p class="muted" style="margin-top:0">Make a one-time secret here, then type it on the new device (Settings → Owner sign-in → I have a one-time secret) or open the link there. It works once, for 30 minutes, then it is gone.</p><div id="ndB"><p class="muted">Loading…</p></div>');
  var box=$('#ndB',sh), sec=null;
  function fmt(t){ var d=new Date(t); return d.toLocaleDateString()+' '+d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); }
  function draw(d){ var link=sec?location.origin+'/play/#owner='+sec:'';
    box.innerHTML=(sec?'<div class="pnl" style="text-align:center"><small class="muted">One-time secret · shown only now</small><div style="font:700 26px var(--mono);letter-spacing:.1em;margin:6px 0;user-select:all;-webkit-user-select:all">'+esc(sec)+'</div><div class="row" style="justify-content:center;gap:8px;flex-wrap:wrap"><button class="btn sm" data-n="cs">Copy secret</button><button class="btn sm" data-n="cl">Copy link</button></div><small class="muted" style="display:block;margin-top:8px">Expires '+fmt(d.pending?d.pending.exp:Date.now()+1800000)+'</small></div>'
      :d.pending?'<p><span class="tag">A secret is waiting to be used</span> <small class="muted">expires '+fmt(d.pending.exp)+'</small></p>':'')
     +'<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn pri" data-n="new">'+(sec||d.pending?'Make a new secret (cancels the old one)':'Make a one-time secret')+'</button>'+(d.pending?'<button class="btn" data-n="cancel">Cancel secret</button>':'')+'</div>'
     +'<h3 style="margin:16px 0 6px">Devices signed in with a secret</h3>'+(d.devs&&d.devs.length?'<div class="list">'+d.devs.map(function(x){ return '<div><span>'+(x.n?esc(x.n):'Device')+(x.me?' <span class="tag g">this device</span>':'')+'<br><small class="muted">since '+fmt(x.at)+'</small></span><span class="sp"></span><button class="btn sm" data-n="rv" data-h="'+esc(x.h)+'">Remove</button></div>'; }).join('')+'</div><button class="btn sm" data-n="rvall" style="margin-top:8px">Remove all of them</button>':'<p class="muted">None yet.</p>'); }
  async function call(b){ var r=await CW.admin('once',b||{}); if(!(r.ok&&r.data&&r.data.ok)){ box.innerHTML='<p class="msg bad">'+esc((r.data&&r.data.error)||'Could not reach the live server.')+'</p>'; return null; } return r.data; }
  var d0=await call({}); if(d0) draw(d0);
  box.onclick=async function(e){ var b=e.target.closest('[data-n]'); if(!b) return; var a=b.getAttribute('data-n');
    if(a==='cs'||a==='cl'){ var tx=a==='cs'?sec:location.origin+'/play/#owner='+sec; try{ await navigator.clipboard.writeText(tx); CW.toast('Copied.'); }catch(x){ window.prompt('Copy this:',tx); } return; }
    if(a==='rvall'&&!confirm('Sign out every device that used a one-time secret?')) return;
    var d=await call(a==='new'?{act:'new'}:a==='cancel'?{act:'cancel'}:a==='rv'?{act:'revoke',h:b.getAttribute('data-h')}:{act:'revoke'}); if(!d) return;
    if(a==='new'){ sec=d.secret; d=await call({})||d; } else if(a==='cancel') sec=null; draw(d); }; }

var TABS=[['live','Live'],['msg','Messages'],['players','Players'],['chat','Chat'],['stats','Stats'],['ranks','Ranks'],['admins','Admins']];
async function open(){
  if(O.el) O.el.remove(); var el=O.el=document.createElement('div'); el.className='own';
  el.innerHTML='<div class="own-top wrap"><span style="font-size:22px">👑</span><h2>Owner · Live &amp; race</h2><span class="sp"></span><button class="btn sm" data-o="newdev" type="button">🔑 New device</button><a class="btn sm" href="/#owner">Shop console</a><button class="btn sm" data-o="out">Sign out</button><button class="x" data-o="close" aria-label="Close">✕</button></div>'
    +'<div class="wrap"><form class="ocmd" id="oCmdF" autocomplete="off"><input class="in" id="oCmd" placeholder="/gift/name/tokens/1000   ·   type /help" spellcheck="false" autocapitalize="off" autocorrect="off"><button class="btn pri" type="submit">Run</button></form><div class="ocmd-sg" id="oCmdS"></div><div class="ocmd-out" id="oCmdO"></div><div id="oUp"></div><div id="oUp2"></div><div id="oUp3"></div><div id="oUp4"></div><div id="oO2"></div><div id="oUp5"></div><div id="oUp6"></div><div id="oUp65"></div><div id="oUp7"></div><div id="oUp8"></div><div id="oUp9"></div><div id="oUp10"></div><div class="seg" id="oT" style="margin:6px 0 16px">'+TABS.map(function(t){ return '<button type="button" data-t="'+t[0]+'">'+t[1]+'</button>'; }).join('')+'</div><div id="oB"></div></div>';
  document.body.appendChild(el); document.body.style.overflow='hidden';
  el.addEventListener('click',click);
  el.addEventListener('change',function(e){ if(e.target.id==='rkK'||e.target.id==='rkP'){ O.rk={kind:$('#rkK',el).value,per:$('#rkP',el).value}; load(); } });
  upRender(); upBind(); up2Render(); up2Bind(); up3Render(); up3Bind(); up4Render(); up4Bind(); up5Render(); up5Bind(); up6Render(); up6Bind(); up65Render(); up65Bind(); up7Render(); up7Bind(); up8Render(); up8Bind(); up9Render(); up9Bind(); up10Render(); up10Bind(); if(PL.o2) PL.o2.mount();
  $('#oCmdF',el).addEventListener('submit',function(e){ e.preventDefault(); runCmd(); });
  $('#oCmd',el).addEventListener('input',suggest); $('#oCmd',el).addEventListener('focus',suggest);
  $('#oCmdS',el).addEventListener('click',function(e){ var b=e.target.closest('[data-v]'); if(!b) return; var i=$('#oCmd',el), sg=i.value.split('/'); sg[sg.length-1]=b.getAttribute('data-v'); i.value=sg.join('/')+'/'; i.focus(); suggest(); });
  $('#oCmd',el).addEventListener('keydown',function(e){ if(e.key==='ArrowUp'||e.key==='ArrowDown'){ var H=O.hist||[]; if(!H.length) return; e.preventDefault(); O.hi=Math.max(0,Math.min(H.length,(O.hi==null?H.length:O.hi)+(e.key==='ArrowUp'?-1:1))); this.value=H[O.hi]||''; } });
  draw(); load(); }
document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&O.el&&!document.querySelector('.sheet')) close(); });
PL.onLive(function(){ if(!O.el||(O.tab!=='live'&&O.tab!=='msg')) return; var f=document.activeElement; if(f&&O.el.contains(f)&&/INPUT|SELECT|TEXTAREA/.test(f.tagName)) return; if(O.el.querySelector('input:not([type=checkbox])')&&[].some.call(O.el.querySelectorAll('input:not([type=checkbox]):not([type=number])'),function(i){ return i.value; })) return; draw(); });
window.addEventListener('hashchange',function(){ if(O.el&&location.hash&&location.hash!=='#owner') close(); });
function close(){ if(O.el){ O.el.remove(); O.el=null; } document.body.style.overflow=''; }
async function load(){ var t=O.tab, r;
  if(t==='players'||t==='live'){ r=await CW.admin('users'); if(r.status===403) return expired(); O.users=r.ok?r.data:null; }
  if(t==='live'){ r=await CW.admin('sched',{act:'list'}); O.sched=r.ok?r.data:null; }
  if(t==='admins'){ try{ if(PL.skins.owned().indexOf(85)<0) PL.skins.unlock(85); }catch(e){} r=await CW.admin('users'); if(r.status===403) return expired(); O.adm=r.ok?r.data:null; }
  if(t==='ranks'){ O.rk=O.rk||{kind:'s',per:'all'}; r=await CW.admin('sbx',{act:'list',kind:O.rk.kind,per:O.rk.per}); if(r.status===403) return expired(); O.rkr=r.ok&&r.data&&r.data.rows?r.data:null; if(!O.rkr) O.rkr=null; }
  if(t==='stats'){ r=await CW.admin('stats'); if(r.status===403) return expired(); O.stats=r.ok?r.data:null; }
  if(t==='chat'){ r=await CW.admin('chat',{act:'list'}); if(r.status===403) return expired(); O.chat=r.ok?r.data:null; }
  if(O.el&&O.tab===t) draw(); }
function expired(){ close(); CW.toast('Sign-in expired. Enter your code again.'); signIn(open); }
function sec(t,sub){ return '<div class="pnl"><h3>'+t+'</h3>'+(sub?'<p class="muted" style="font-size:13.5px;margin:-4px 0 10px">'+sub+'</p>':''); }
function sel(id,opts,w){ return '<select class="in" id="'+id+'" style="'+(w?'width:'+w:'flex:1')+'">'+opts.map(function(o){ return '<option value="'+esc(o[0])+'">'+esc(o[1])+'</option>'; }).join('')+'</select>'; }
function prizes(id){ return sel(id,PL.skins.forge.map(function(i){ return [i,'Prize: '+PL.skins.name(i)]; })); }
var LENS=[['s','Short'],['n','Normal'],['l','Long']];
function draw(){ if(!O.el) return; O.el.querySelectorAll('#oT [data-t]').forEach(function(b){ b.setAttribute('aria-pressed',b.getAttribute('data-t')===O.tab); });
  var B=$('#oB',O.el), h='', n=PL.now(), ev=PL.raceEvent();
  if(O.tab==='live'){ var T=LV.tour, S=O.sched, U=O.users;
    h+='<p class="muted" style="margin-bottom:12px">'+(U&&U.users&&U.rooms?U.users.length+' online · '+U.rooms.filter(function(r){ return r.status!=='done'; }).length+' races running':'Loading…')+'</p><div class="grid2"><div>';
    h+=sec('Cube Race',ev?'A race is open for '+PL.mmss(ev.exp-n)+' more ('+esc(ev.by||'')+').':'Auto races still open every 30 minutes on their own.')
      +(ev?'<button class="btn" data-o="end">Close the race</button>':'<div class="row">'+prizes('oPz')+sel('oLen',LENS,'120px')+'</div><button class="btn pri" data-o="race" style="margin-top:8px">Start a race now</button>')+'</div>';
    h+=sec('Tournament',T&&T.st!=='done'?'Running: '+T.st+' · '+T.n+' racers':'Heats of 10, top 3 of each heat race the final.')
      +(T&&T.st!=='done'?'<button class="btn" data-o="tcancel">Cancel tournament</button>':'<div class="row">'+prizes('oTp')+sel('oTl',LENS,'120px')+'</div><div class="row" style="margin-top:8px"><input class="in" id="oTs" type="number" min="30" max="900" value="180" style="width:110px"><span class="muted">seconds to sign up</span><span class="sp"></span><button class="btn pri" data-o="tour">Open sign-ups</button></div>')+'</div>';
    h+=sec('Featured track',LV.feat?'This week: '+esc(LV.feat):'')+'<div class="row">'+sel('oFw',[['','Rotate by itself']].concat(TR.map(function(t){ return [t,t[0].toUpperCase()+t.slice(1)]; })))+'<input class="in" id="oFd" type="number" min="1" max="14" value="7" style="width:80px"><span class="muted">days</span><button class="btn" data-o="feat">Set</button></div></div></div><div>';
    h+=sec('Schedule','Plan races, messages, banners or a featured track for later.')+'<div class="row">'+sel('oSt',[['race','Race'],['msg','Message'],['banner','Banner'],['feat','Featured track']],'150px')+'<input class="in" id="oSm" type="number" min="1" value="30" style="width:90px"> or at <input class="in" id="oSt" type="datetime-local" style="width:auto"><span class="muted">min from now</span></div>'
      +'<div class="row" style="margin-top:8px">'+prizes('oSp')+sel('oSl',LENS,'110px')+'</div><input class="in" id="oSx" maxlength="120" placeholder="Text for a message or banner" style="width:100%;margin-top:8px"><div class="row" style="margin-top:8px">'+sel('oSw',TR.map(function(t){ return [t,'Track: '+t]; }))+'<label class="row" style="gap:6px"><input type="checkbox" id="oS2"> 2× tokens</label><button class="btn pri" data-o="sched">Add</button></div>'
      +(S&&S.sched&&S.sched.length?'<div class="list" style="margin-top:10px">'+S.sched.map(function(x){ return '<div><span class="tag">'+esc(x.type)+'</span><span>in '+x.in+' min'+(x.text?' · “'+esc(x.text)+'”':'')+(x.wx?' · '+esc(x.wx):'')+'</span><span class="sp"></span><button class="btn sm" data-o="sdel" data-id="'+esc(x.id)+'">Remove</button></div>'; }).join('')+'</div>':'<p class="empty2">Nothing scheduled.</p>')+'</div>';
    h+=sec('Beat-my-time event',LV.ce?'Running: “'+esc(LV.ce.ti)+'” · target '+PL.fmt(LV.ce.t):'Everyone races one track and tries to beat your time.')
      +(LV.ce?'<button class="btn" data-o="ceend">End and send prizes</button>':'<input class="in" id="oCt" maxlength="40" placeholder="Event name" style="width:100%"><div class="row" style="margin-top:8px"><input class="in" id="oCg" placeholder="Target seconds, e.g. 45.5" style="flex:1">'+sel('oCl',LENS,'110px')+'<input class="in" id="oCm" type="number" value="30" style="width:80px"><span class="muted">min</span></div><button class="btn pri" data-o="ce" style="margin-top:8px">Start event</button>')+'</div></div></div>'; }
  if(O.tab==='msg'){ var P=LV.pollx, L=LV.livex;
    h+='<div class="grid2"><div>'+sec('Banner',LV.banner?'Showing: “'+esc(LV.banner.t)+'”'+(LV.banner.x?' · 2× tokens':''):'Shows at the top of Cuber Tools.')
      +'<input class="in" id="oBt" maxlength="120" placeholder="Message for everyone" style="width:100%"><div class="row" style="margin-top:8px"><input class="in" id="oBh" type="number" min="1" max="168" value="24" style="width:90px"><span class="muted">hours</span><label class="row" style="gap:6px"><input type="checkbox" id="oBx"> 2× tokens</label><span class="sp"></span><button class="btn pri" data-o="banner">Show</button>'+(LV.banner?'<button class="btn" data-o="unbanner">Remove</button>':'')+'</div></div>'
      +sec('Announce','A card pops up on everyone’s screen who is online right now.')+'<div class="row"><input class="in" id="oMt" maxlength="120" placeholder="Message for everyone online" style="flex:1"><button class="btn pri" data-o="annnow">Send</button><button class="btn" data-o="annburst">Surprise</button></div><div class="row" style="margin-top:8px"><span class="muted" style="font-size:13px">Surprise adds confetti. Or</span><button class="btn sm" data-o="msgnow">send in 1 min</button></div></div>'
      +sec('Live stream',L?'Live: '+esc(L.n)+' · “'+esc(L.t)+'”':'Show a red “live” bar linking to your stream.')+(L?'<button class="btn" data-o="liveclear">End live</button>':'<input class="in" id="oLt" maxlength="80" placeholder="What is on the stream?" style="width:100%"><input class="in" id="oLu" placeholder="https:// link (YouTube, Twitch, TikTok…)" style="width:100%;margin-top:8px"><div class="row" style="margin-top:8px"><input class="in" id="oLn" maxlength="24" placeholder="Name shown" value="Cubeworkstudio" style="flex:1"><input class="in" id="oLh" type="number" value="2" style="width:70px"><span class="muted">hours</span><button class="btn pri" data-o="live">Go live</button></div>')+'</div>'
      +'<div>'+sec('Poll',P&&!P.closed?'Open: “'+esc(P.q)+'” · '+P.total+' votes':'')+(P&&!P.closed?'<div class="list">'+P.opts.map(function(o,i){ return '<div><span>'+esc(o)+'</span><span class="sp"></span><b class="mono">'+(P.counts[i]||0)+'</b></div>'; }).join('')+'</div><div class="row" style="margin-top:8px"><button class="btn" data-o="pclose">Close poll</button><button class="btn" data-o="pclear">Remove</button></div>'
      :'<input class="in" id="oPq" maxlength="140" placeholder="Question" style="width:100%">'+[0,1,2,3,4].map(function(i){ return '<input class="in" id="oPo'+i+'" maxlength="60" placeholder="Option '+(i+1)+(i>1?' (optional)':'')+'" style="width:100%;margin-top:6px">'; }).join('')+'<div class="row" style="margin-top:8px"><input class="in" id="oPs" type="number" placeholder="Seconds (blank = until you close it)" style="flex:1"><button class="btn pri" data-o="poll">Send poll</button></div>')+'</div></div></div>'; }
  if(O.tab==='players'){ var U2=O.users;
    h+=sec('Online now',U2?U2.users.length+' people':'Loading…')+(U2&&U2.users.length?'<div class="list">'+U2.users.map(function(u){ return '<div><span><b>'+esc(u.name)+'</b>'+(u.cc?' <span class="tag b">🎥 creator</span>':'')+'<br><small class="muted">Lv '+(u.lv||0)+' · seen '+u.ago+'s ago</small></span><span class="sp"></span><button class="btn sm pri" data-o="pick" data-id="'+esc(u.id)+'" data-n="'+esc(u.name)+'">Manage</button></div>'; }).join('')+'</div>':'<p class="empty2">Nobody else is online.</p>')+'</div>'
      +(U2&&U2.creators&&U2.creators.length?sec('Creators')+'<div class="list">'+U2.creators.map(function(c){ return '<div><span>🎥 <b>'+esc(c.name)+'</b> '+(c.on?'<span class="tag g">online</span>':'')+'</span><span class="sp"></span><button class="btn sm" data-o="uncc" data-id="'+esc(c.id)+'">Remove creator</button></div>'; }).join('')+'</div></div>':'')
      +sec('Gift everyone online')+'<div class="row">'+sel('oGk',[['tokens','Tokens'],['spins','Spins'],['xp','XP'],['x2','2× tokens (hours)']],'170px')+'<input class="in" id="oGv" type="number" min="1" value="50" style="width:100px"><input class="in" id="oGm" maxlength="80" placeholder="Message" style="flex:1"><button class="btn pri" data-o="giftall">Send</button></div></div>'; }
  if(O.tab==='chat'){ var C=O.chat, msgs=LV.chat.slice(-60).reverse(), PN=(C&&C.pin)||{}, TD=(C&&C.today)||{n:0,people:0,top:[]};
    h+=sec('Chat today',TD.n+' messages from '+TD.people+' people')+(TD.top.length?'<div class="list">'+TD.top.map(function(x,i){ return '<div><span>'+['🥇','🥈','🥉','4.','5.'][i]+' '+esc(x[0])+'</span><span class="sp"></span><b>'+x[1]+'</b></div>'; }).join('')+'</div>':'')+'</div>'
      +sec('Pinned message','Shows at the top of a channel for everyone. You can also tap a message in chat and press 📌 Pin.')+'<div class="row"><select class="in" id="oPinC">'+['general','trading','racing','help','live'].map(function(x){ return '<option>'+x+'</option>'; }).join('')+'</select><input class="in" id="oPinT" placeholder="Message to pin" maxlength="200" style="flex:1;min-width:180px"><button class="btn pri" data-o="cpin">Pin</button></div>'
      +(Object.keys(PN).length?'<div class="list">'+Object.keys(PN).map(function(k){ return '<div><span>📌 <small class="muted">#'+esc(k)+'</small><br>'+esc(PN[k].t)+'</span><span class="sp"></span><button class="btn sm" data-o="cunpin" data-c="'+esc(k)+'">Unpin</button></div>'; }).join('')+'</div>':'')+'</div>'
      +sec('Blocked words','Messages with these words are stopped before anyone sees them.')+'<div class="row"><input class="in" id="oBwT" placeholder="Word to block" maxlength="30" style="flex:1"><button class="btn pri" data-o="cbw">Block</button></div>'
      +((C&&C.bw&&C.bw.length)?'<div class="row" style="flex-wrap:wrap;gap:6px;margin-top:8px">'+C.bw.map(function(w){ return '<button class="btn sm" data-o="cubw" data-w="'+esc(w)+'">'+esc(w)+' ✕</button>'; }).join('')+'</div>':'')+'</div>'
      +sec('Confetti','Make confetti fall on everyone’s screen with a message in chat.')+'<div class="row"><input class="in" id="oCfT" placeholder="Message (optional)" maxlength="100" style="flex:1"><button class="btn pri" data-o="cconf">🎉 Send</button></div></div>';
    h+=sec('Chat',LV.off?'Chat is off.':'Chat is on.')+'<div class="row"><button class="btn" data-o="'+(LV.off?'chaton':'chatoff')+'">'+(LV.off?'Turn chat on':'Turn off and clear')+'</button></div></div>'
      +sec('Recent messages','Delete a message, mute someone for 10 minutes, or make them a helper who can post in slow mode.')+(msgs.length?'<div class="list">'+msgs.map(function(m){ return '<div><span><b>'+esc(m.n)+'</b> <small class="muted">#'+esc(m.ch||'general')+'</small><br>'+esc(m.t)+'</span><span class="sp"></span><button class="btn sm" data-o="cdel" data-s="'+m.s+'">Delete</button><button class="btn sm" data-o="cmute" data-p="'+esc(m.p)+'">Mute</button><button class="btn sm" data-o="cstaff" data-p="'+esc(m.p)+'">Helper</button></div>'; }).join('')+'</div>':'<p class="empty2">No messages.</p>')+'</div>'
      +(C&&C.muted&&C.muted.length?sec('Muted')+'<div class="list">'+C.muted.map(function(x){ return '<div><span>'+esc(x.n)+' · '+x.left+' min</span><span class="sp"></span><button class="btn sm" data-o="cunmute" data-p="'+esc(x.p)+'">Unmute</button></div>'; }).join('')+'</div></div>':'')
      +(C&&C.staff&&C.staff.length?sec('Helpers')+'<div class="list">'+C.staff.map(function(x){ return '<div><span>'+esc(x.n)+' <small class="muted">'+(x.lvl===2?'moderator':'helper')+'</small></span>'+(x.lvl===2?'':'<button class="btn sm" data-o="cmod" data-p="'+esc(x.p)+'">Make moderator</button>')+'<span class="sp"></span><button class="btn sm" data-o="cunstaff" data-p="'+esc(x.p)+'">Remove</button></div>'; }).join('')+'</div></div>':'')
      +(C&&C.reports&&C.reports.length?sec('Reports')+'<div class="list">'+C.reports.map(function(x){ return '<div><span>'+esc(x.why||'')+' · '+esc(x.t||x.text||'')+'</span><span class="sp"></span>'+(x.s?'<button class="btn sm" data-o="cdel" data-s="'+x.s+'">Delete message</button>':'')+'</div>'; }).join('')+'</div></div>':''); }
  if(O.tab==='admins'){ var AD=O.adm, mm=(AD&&AD.minis)||[], on=(AD&&AD.users)||[];
    var MA_N={1:'Zhan Yi',2:'Zhan Hong'};
    var opts=on.map(function(u){ return '<option value="'+esc(u.id)+'">'+esc(u.name)+'</option>'; }).join('');
    var pick=O.maPick||1;
    h+=sec('Mini admins','Choose which one to give, choose the player, then tap Gift. Their name changes to Zhan Yi or Zhan Hong, and they get the mini admin panel (full admin tools, no streaming) and the Admin pad skin. The player must be online.')
      +'<div class="row" style="gap:8px;margin-bottom:10px">'+mm.map(function(m){ return '<button class="btn'+(pick===m.k?' pri':'')+'" data-o="mapick" data-k="'+m.k+'" style="flex:1">🛡️ '+esc(m.name)+'</button>'; }).join('')+'</div>'
      +'<div class="row"><select class="in" id="maWho" style="flex:1;min-width:0"><option value="">Choose an online player</option>'+opts+'</select><button class="btn" data-o="maref" title="Refresh the list">↻</button><button class="btn pri" data-o="magive">Give '+esc((MA_N[pick]||''))+'</button></div></div>'
      +sec('Current mini admins')+(AD?mm.map(function(m){ return '<div class="row" style="padding:8px 0;border-top:1px solid var(--line,#e5e5e5)"><b>🛡️ '+esc(m.name)+'</b><span class="sp"></span><span class="muted">'+(m.id?(m.on?'Online as '+esc(m.who):'Offline'):'Nobody yet')+'</span>'+(m.id?'<button class="btn sm" data-o="maoff" data-id="'+esc(m.id)+'">Remove</button>':'')+'</div>'; }).join(''):'<p class="muted">Loading…</p>')+'</div>'
      +sec('Admin pad skin','Only creators, mini admins and owners can have it.')+'<div class="row"><select class="in" id="adSk" style="flex:1;min-width:0"><option value="">Choose a creator or mini admin</option>'+((AD&&AD.users)||[]).map(function(u){ return '<option value="'+esc(u.id)+'">'+esc(u.name)+(u.cc||u.ma?'':' (not staff)')+'</option>'; }).join('')+'</select><button class="btn pri" data-o="adsk">Gift Admin skin</button></div></div>'
      +sec('Drop','A pop-up appears for everyone online. The first players to tap win the tokens. Free for you.')+'<div class="row"><input class="in" id="drN" type="number" placeholder="Players" value="25" style="flex:1;min-width:0"><input class="in" id="drV" type="number" placeholder="Tokens each" value="100" style="flex:1;min-width:0"><button class="btn pri" data-o="drop">Spawn drop</button><button class="btn" data-o="dropend">End</button></div></div>'; }
  if(O.tab==='ranks'){ var K=O.rk||{kind:'s',per:'all'}, RR=O.rkr;
    h+=sec('Time ranks','Remove one time from a board, or reset the boards. Removed times cannot be sent back, and a reset ignores every solve done before it.')
      +'<div class="row"><select class="in" id="rkK" style="width:150px"><option value="s"'+(K.kind==='s'?' selected':'')+'>Single</option><option value="a"'+(K.kind==='a'?' selected':'')+'>Average of 5</option></select><select class="in" id="rkP" style="width:150px"><option value="all"'+(K.per==='all'?' selected':'')+'>All time</option><option value="w"'+(K.per==='w'?' selected':'')+'>This week</option></select></div></div>'
      +sec('Top 50')+(RR&&RR.rows&&RR.rows.length?'<div class="list">'+RR.rows.map(function(x){ return '<div><span><b>#'+x.r+' '+esc(x.n)+'</b><br><small class="muted">'+(x.ms/1000).toFixed(2)+' s</small></span><span class="sp"></span><button class="btn sm" data-o="rkdel" data-id="'+esc(x.id)+'">Remove time</button></div>'; }).join('')+'</div></div>':'<p class="muted">'+(RR?'Nobody on this board.':(O.rkr===null?'Could not load. Make sure the newest Worker.js is deployed.':'Loading…'))+'</p></div>')
      +sec('Reset','Tap twice to confirm.')+'<div class="row"><button class="btn" data-o="rkreset" data-sc="week">Reset this week\'s ranks</button><button class="btn" data-o="rkreset" data-sc="all" style="background:#e5484d;color:#fff">Reset ALL time ranks</button></div></div>'; }
  if(O.tab==='stats'){ var s=O.stats;
    if(!s) h+='<p class="muted">Loading…</p>'; else { var st=s.stats||{};
      var cell=function(k,v){ return '<div><small>'+k+'</small><b>'+esc(String(v))+'</b></div>'; };
      h+='<div class="stats" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">'+cell('Online',s.online)+cell('Players today',st.u||0)+cell('Races today',st.races||0)+cell('Racing now',s.racers||0)+cell('Daily track today',s.dailyToday||0)+cell('Chat messages',s.chatN||0)+cell('Reports',s.reports||0)+cell('Reviews waiting',s.pendingReviews||0)+cell('Scheduled',s.sched||0)+cell('Featured track',s.feat||'–')+'</div>'
        +(s.board&&s.board.length?sec('Top of the race board')+'<div class="list">'+s.board.map(function(x,i){ return '<div><b class="mono">'+(i+1)+'</b><span>'+esc(x.name)+'</span><span class="sp"></span><span class="mono">'+PL.fmt(x.ms)+'</span></div>'; }).join('')+'</div></div>':''); } }
  B.innerHTML=h; }
function v(id){ var x=$('#'+id,O.el); return x?(x.type==='checkbox'?x.checked:x.value.trim()):''; }
async function click(e){ var t=e.target.closest('[data-t]'); if(t&&t.closest('#oT')){ O.tab=t.getAttribute('data-t'); draw(); load(); return; }
  var b=e.target.closest('[data-o]'); if(!b||O.busy) return; var a=b.getAttribute('data-o'), id=b.getAttribute('data-id'), r=null;
  if(a==='close') return close();
  if(a==='newdev'){ newDev(); return; }
  if(a==='out'){ CW.ownerSignOut(); close(); CW.toast('Signed out.'); return; }
  if(a==='pick') return manage(id,b.getAttribute('data-n'));
  if(a==='mapick'){ var sv=($('#maWho',O.el)||{}).value; O.maPick=+b.getAttribute('data-k'); draw(); var sel=$('#maWho',O.el); if(sel&&sv) sel.value=sv; return; }
  if(a==='maref'){ load(); return; }
  if(a==='magive'){ var kk=O.maPick||1, who=$('#maWho',O.el).value; if(!who){ CW.toast('Choose a player first.'); return; } O.busy=true; r=await CW.admin('gift',{kind:'miniadmin',value:kk,to:who}); O.busy=false; if(r.status===403) return expired(); CW.toast(r.ok?'Gifted.':((r.data&&r.data.error)||'Could not gift.')); load(); return; }
  if(a==='maoff'){ O.busy=true; r=await CW.admin('gift',{kind:'miniadmin',value:0,to:id}); O.busy=false; if(r.status===403) return expired(); CW.toast(r.ok?'Removed.':((r.data&&r.data.error)||'Could not remove.')); load(); return; }
  if(a==='adsk'){ var w2=$('#adSk',O.el).value; if(!w2){ CW.toast('Choose a player first.'); return; } O.busy=true; r=await CW.admin('gift',{kind:'skin',value:85,to:w2}); O.busy=false; if(r.status===403) return expired(); CW.toast(r.ok?'Admin skin sent.':((r.data&&r.data.error)||'Could not send.')); return; }
  if(a==='drop'){ O.busy=true; r=await CW.admin('drop',{n:+$('#drN',O.el).value||25,val:+$('#drV',O.el).value||100}); O.busy=false; if(r.status===403) return expired(); CW.toast(r.ok?'Drop is live.':((r.data&&r.data.error)||'Could not drop.')); return; }
  if(a==='dropend'){ O.busy=true; r=await CW.admin('drop',{act:'end'}); O.busy=false; CW.toast(r.ok?'Drop ended.':'Could not end.'); return; }
  if(a==='rkreset'){ if(b.getAttribute('data-arm')!=='1'){ b.setAttribute('data-arm','1'); b.dataset.t0=b.textContent; b.textContent='Tap again to confirm'; setTimeout(function(){ b.removeAttribute('data-arm'); if(b.dataset.t0) b.textContent=b.dataset.t0; },4000); return; }
    O.busy=true; r=await CW.admin('sbx',{act:'reset',scope:b.getAttribute('data-sc')}); O.busy=false; if(r.status===403) return expired(); CW.toast(r.ok?'Ranks reset.':'Could not reset.'); load(); return; }
  if(a==='rkdel'){ O.busy=true; r=await CW.admin('sbx',{act:'del',id:id,kind:O.rk.kind,per:O.rk.per}); O.busy=false; if(r.status===403) return expired(); CW.toast(r.ok?'Time removed.':((r.data&&r.data.error)||'Could not remove.')); load(); return; }
  O.busy=true; b.disabled=true;
  try{
    if(a==='race') r=await CW.admin('event',{type:'race',prizes:[+v('oPz')],len:v('oLen')});
    else if(a==='end') r=await CW.admin('endrace');
    else if(a==='tour') r=await CW.admin('tour',{prizes:[+v('oTp')],len:v('oTl'),secs:+v('oTs')||180});
    else if(a==='tcancel') r=await CW.admin('tour',{act:'cancel'});
    else if(a==='feat') r=await CW.admin('feat',{wx:v('oFw'),days:+v('oFd')||7});
    else if(a==='sched'){ var ty=v('oSt'); r=await CW.admin('sched',{act:'add',type:ty,at:v('oSt')?new Date(v('oSt')).getTime():0,mins:+v('oSm')||30,prizes:[+v('oSp')],len:v('oSl'),text:v('oSx'),hours:24,x2:v('oS2'),wx:v('oSw'),days:7}); if(r.ok) O.sched=r.data; }
    else if(a==='sdel'){ r=await CW.admin('sched',{act:'del',id:id}); if(r.ok) O.sched=r.data; }
    else if(a==='ce') r=await CW.admin('ce',{act:'start',name:'Cubeworkstudio',text:v('oCt'),target:+String(v('oCg')).replace(',','.')||0,len:v('oCl'),mins:+v('oCm')||30});
    else if(a==='ceend') r=await CW.admin('ce',{act:'end'});
    else if(a==='banner'){ if(!v('oBt')){ CW.toast('Type the message first.'); return; } r=await CW.admin('banner',{text:v('oBt'),hours:+v('oBh')||24,x2:v('oBx')}); }
    else if(a==='unbanner') r=await CW.admin('banner',{text:''});
    else if(a==='annnow'){ if(!v('oMt')){ CW.toast('Type the message first.'); return; } r=await CW.admin('event',{type:'msg',msg:v('oMt')}); if(r.ok) CW.toast('Sent to everyone online.'); }
    else if(a==='annburst'){ r=await CW.admin('event',{type:'burst',msg:v('oMt')}); if(r.ok) CW.toast('Surprise sent.'); }
    else if(a==='msgnow'){ if(!v('oMt')){ CW.toast('Type the message first.'); return; } r=await CW.admin('sched',{act:'add',type:'msg',mins:1,text:v('oMt')}); }
    else if(a==='live') r=await CW.admin('live',{text:v('oLt'),url:v('oLu'),name:v('oLn'),hours:+v('oLh')||2});
    else if(a==='liveclear') r=await CW.admin('live',{act:'clear'});
    else if(a==='poll'){ var os=[0,1,2,3,4].map(function(i){ return v('oPo'+i); }).filter(Boolean); r=await CW.admin('poll',{act:'start',q:v('oPq'),opts:os,secs:+v('oPs')||0}); }
    else if(a==='pclose') r=await CW.admin('poll',{act:'close'});
    else if(a==='pclear') r=await CW.admin('poll',{act:'clear'});
    else if(a==='giftall') r=await CW.admin('gift',{kind:v('oGk'),value:+v('oGv')||0,msg:v('oGm'),to:'all'});
    else if(a==='uncc') r=await CW.admin('gift',{kind:'creator',value:0,to:id});
    else if(a==='chatoff'||a==='chaton') r=await CW.admin('chat',{act:a==='chatoff'?'off':'on'});
    else if(a==='cdel'){ r=await CW.admin('chat',{act:'del',s:+b.getAttribute('data-s')}); if(r.ok) LV.chat=LV.chat.filter(function(m){ return m.s!==+b.getAttribute('data-s'); }); }
    else if(a==='cmute') r=await CW.admin('chat',{act:'mute',p:b.getAttribute('data-p'),mins:10});
    else if(a==='cpin'){ if(!v('oPinT')){ CW.toast('Type a message to pin.'); return; } r=await CW.admin('chat',{act:'pin',ch:v('oPinC'),t:v('oPinT'),n:'Owner'}); }
    else if(a==='cunpin') r=await CW.admin('chat',{act:'pin',ch:b.getAttribute('data-c'),t:''});
    else if(a==='cbw'){ if(!v('oBwT')){ CW.toast('Type a word.'); return; } r=await CW.admin('chat',{act:'bw',w:v('oBwT'),on:1}); }
    else if(a==='cubw') r=await CW.admin('chat',{act:'bw',w:b.getAttribute('data-w'),on:0});
    else if(a==='cconf') r=await CW.call('/api/chat/send',{id:CW.devId(),ch:'general',text:'/confetti '+(v('oCfT')||'')},6000);
    else if(a==='cunmute') r=await CW.admin('chat',{act:'unmute',p:b.getAttribute('data-p')});
    else if(a==='cstaff') r=await CW.admin('chat',{act:'staff',p:b.getAttribute('data-p'),on:1});
    else if(a==='cmod') r=await CW.admin('chat',{act:'staff',p:b.getAttribute('data-p'),on:1,lvl:2});
    else if(a==='cunstaff') r=await CW.admin('chat',{act:'staff',p:b.getAttribute('data-p'),on:0});
  } finally { O.busy=false; b.disabled=false; }
  if(!r) return; if(r.status===403) return expired();
  if(r.ok){ CW.toast('Done.'); await PL.poll(); load(); draw(); } else CW.toast((r.data&&r.data.error)||'Could not do that.'); }

/* ---- typed commands: /command/arg/arg/value ---- */
var KINDS={'tokens':'tokens','cube tokens':'tokens','cubetokens':'tokens','token':'tokens','spins':'spins','spin':'spins','xp':'xp','x2':'x2','2x':'x2','double':'x2','skin':'skin','creator':'creator','miniadmin':'miniadmin','mini admin':'miniadmin'};
var HELP=['/gift/<name or all>/<tokens|spins|xp|x2|skin|creator>/<value>/<message>','/title/<name>/<text>   (blank removes)','/banner/<text>/<hours>/<x2>','/unbanner','/msg/<text>   (pop-up now)','/surprise/<text>   (pop-up with confetti)','/endrace','/mute/<name>/<minutes>','/unmute/<name>','/helper/<name>   ·   /unhelper/<name>','/chat/<on|off>','/players','/drop/<how many>/<tokens each>   ·   /dropend','/clearchat   (wipes public chat)','/slow/<seconds>/<channel>   (0 = off)','/lock/<channel>   ·   /unlock/<channel>','/poll/<question>/<option>/<option>/…   ·   /endpoll','/kick/<name>   (mutes 60 min and clears their messages)','/announce/<text>   (posts in chat as Owner)','/give/<name or all>/<tokens>/<message>   (quick token gift)','/x2/<hours>   (double tokens for everyone)','/ban/<name>   ·   /unban/<name>','/find/<name>   (online, level, banned)','/stats   (players online and total)','/unkick/<name>   ·   /slowoff   ·   /clearpoll','/purge/<name>   (deletes their recent chat messages)','/purgelast/<how many>   (deletes the newest public messages)','/spins/<name>/<n>   ·   /xp/<name>/<n>   ·   /skin/<name>/<skin>','/lockall   ·   /unlockall   ·   /say/<text>   ·   /online','/pin/<text>/<channel>   ·   /unpin/<channel>','/block/<word>   ·   /unblock/<word>   ·   /blocked','/chatstats   (messages and top chatters today)','/confetti/<text>   (confetti on everyone’s screen)','/mod/<name>   (moderator: mute 60 min, delete, pin)   ·   /unmod/<name>','/gift/everyone|lv:10|club:Name/<kind>/<value>   (groups get it even offline)'];
function outLine(t,bad){ var o=$('#oCmdO',O.el); if(!o) return; var d=document.createElement('div'); d.className=bad?'bad':''; d.textContent=t; o.appendChild(d); while(o.children.length>8) o.removeChild(o.firstChild); o.scrollTop=o.scrollHeight; }
async function findUser(q){ var r=await CW.admin('users'); if(r.status===403) return {err:'expired'}; var L=(r.ok&&r.data&&r.data.users)||[]; q=q.toLowerCase();
  var m=L.filter(function(u){ return String(u.name).toLowerCase()===q; }); if(!m.length) m=L.filter(function(u){ return String(u.name).toLowerCase().indexOf(q)===0; }); if(!m.length) m=L.filter(function(u){ return String(u.name).toLowerCase().indexOf(q)>-1; });
  if(!m.length) return {err:'No online player called "'+q+'".'}; if(m.length>1) return {err:'More than one match: '+m.map(function(u){ return u.name; }).join(', ')}; return m[0]; }
function findChatter(q){ q=q.toLowerCase(); var seen={},m=[]; LV.chat.forEach(function(x){ if(x.p&&!seen[x.p]&&String(x.n).toLowerCase().indexOf(q)>-1){ seen[x.p]=1; m.push(x); } }); if(!m.length) return {err:'"'+q+'" has not posted in chat lately.'}; if(m.length>1) return {err:'More than one match: '+m.map(function(u){ return u.n; }).join(', ')}; return m[0]; }
function allSk(){ var a=[]; PL.skins.list.forEach(function(s){ if(s.i>0&&a.indexOf(s.i)<0) a.push(s.i); }); return a.sort(function(x,y){ return x-y; }); }
function skinId(x){ if(/^\d+$/.test(x)) return +x; var all=allSk(); x=x.toLowerCase(); for(var i=0;i<all.length;i++) if(String(PL.skins.name(all[i])).toLowerCase()===x) return all[i]; for(var j=0;j<all.length;j++) if(String(PL.skins.name(all[j])).toLowerCase().indexOf(x)>-1) return all[j]; return null; }


/* ---- the update launch card ---- */
function upLocal(ms){ var d=new Date(ms-new Date().getTimezoneOffset()*60000); return d.toISOString().slice(0,16); }
function upWhen(ms){ return new Date(ms).toLocaleString([], {weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}); }
function upRender(){ var box=$('#oUp',O.el); if(!box) return; var u=LV.upd||{at:0,live:false}, prev=localStorage.getItem('cw_upd_prev')==='1', h;
  if(u.live) h='<p class="live">✅ Live since '+upWhen(u.rel)+' · it stays live for good.</p><div class="row"><button class="btn" data-up="cut" type="button">▶ Replay the cutscene</button></div>'
;
  else if(u.at) h='<div class="oup-c" id="oUpC">'+PL.updHMS(u.at-PL.now())+'</div><p class="muted" style="margin:2px 0 0">Releases '+upWhen(u.at)+'</p>'
    +'<div class="row"><input class="in" type="datetime-local" id="oUpT" value="'+upLocal(u.at)+'" style="flex:1;min-width:190px"><button class="btn pri" data-up="set" type="button">Set time</button></div>'
    +'<div class="row"><button class="btn sm" data-up="m60" type="button">−1 h</button><button class="btn sm" data-up="p60" type="button">+1 h</button><button class="btn sm" data-up="p720" type="button">+12 h</button><button class="btn sm" data-up="cut" type="button">▶ Preview cutscene</button></div>'
    +'<div class="row"><button class="btn pri" data-up="now" type="button">Release now</button><button class="btn" data-up="cancel" type="button">Cancel countdown</button></div>';
  else h='<p class="muted" style="margin:0 0 10px">Not started. Starting it begins a 12-hour countdown that everyone sees in Cuber Tools. When it ends, the update goes live for good and every player sees the cutscene once. You can move the time any time before then.</p><div class="row"><button class="btn pri" data-up="start" type="button">🚀 Start 12-hour countdown</button><button class="btn" data-up="cut" type="button">▶ Preview cutscene</button></div>';
  if(!u.live) h+='<div class="row"><label class="row" style="gap:8px"><input type="checkbox" id="oUpP"'+(prev?' checked':'')+'> 👁 View the update on this device (only you see it, nothing is released)</label></div>';
  box.innerHTML='<div class="pnl oup"><h3>🚀 The update</h3>'+h+'</div>'; }
async function upDo(a,extra){ var r=await CW.admin('upd',Object.assign({act:a},extra||{})); if(r.ok&&r.data&&r.data.upd){ LV.upd=r.data.upd; if(PL.updSync) PL.updSync(); upRender(); } else CW.toast((r.data&&r.data.error)||'Could not do that.'); }
function upBind(){ var box=$('#oUp',O.el); if(!box||box._b) return; box._b=1;
  box.addEventListener('click',function(e){ var b=e.target.closest('[data-up]'); if(!b) return; var a=b.getAttribute('data-up'), u=LV.upd||{};
    if(a==='cut') return PL.updCut();
    if(a==='start') return upDo('start');
    if(a==='set'){ var v=$('#oUpT',box).value; var ms=new Date(v).getTime(); if(!v||isNaN(ms)) return CW.toast('Pick a date and time.'); return upDo('set',{at:ms}); }
    if(a==='m60') return upDo('shift',{ms:-3600000}); if(a==='p60') return upDo('shift',{ms:3600000}); if(a==='p720') return upDo('shift',{ms:43200000});
    if(a==='now'){ if(confirm('Release the update in a few seconds? Everyone online sees the cutscene and it cannot be undone.')) upDo('now'); return; }
    if(a==='cancel'){ if(confirm('Cancel the countdown?')) upDo('cancel'); } });
  box.addEventListener('change',function(e){ if(e.target.id==='oUpP'){ try{ if(e.target.checked) localStorage.setItem('cw_upd_prev','1'); else localStorage.removeItem('cw_upd_prev'); }catch(x){} if(e.target.checked){ if(PL.updSync) PL.updSync(); } else location.reload(); } }); }
setInterval(function(){ var c=$('#oUpC'); if(c&&LV.upd&&LV.upd.at) c.textContent=PL.updHMS(LV.upd.at-PL.now()); },500);
PL.onLive(function(){ if($('#oUp')){ var u=LV.upd||{}, k=u.live+'|'+u.at; if(O.upk!==k){ O.upk=k; upRender(); } } });

/* ---- Update 2 launch card (unlocks after Update 1 is live) ---- */
function up2Render(){ var box=$('#oUp2',O.el); if(!box) return; var u1=LV.upd||{}, u=(LV.upd&&LV.upd.v2)||{at:0,live:false}, prev=localStorage.getItem('cw_upd2_prev')==='1', h;
  if(!u1.live){ box.innerHTML='<div class="pnl oup"><h3>🚀 Update 2</h3><p class="muted" style="margin:0">Unlocks once Update 1 is live. It uses the same countdown, delay and cancel controls and has its own cutscene.</p><div class="row"><button class="btn" data-up2="cut" type="button">▶ Preview cutscene</button></div></div>'; return; }
  if(u.live) h='<p class="live">✅ Live since '+upWhen(u.rel)+' · it stays live for good.</p><div class="row"><button class="btn" data-up2="cut" type="button">▶ Replay the cutscene</button></div>';
  else if(u.at) h='<div class="oup-c" id="oUp2C">'+PL.updHMS(u.at-PL.now())+'</div><p class="muted" style="margin:2px 0 0">Releases '+upWhen(u.at)+'</p>'
    +'<div class="row"><input class="in" type="datetime-local" id="oUp2T" value="'+upLocal(u.at)+'" style="flex:1;min-width:190px"><button class="btn pri" data-up2="set" type="button">Set time</button></div>'
    +'<div class="row"><button class="btn sm" data-up2="m60" type="button">−1 h</button><button class="btn sm" data-up2="p60" type="button">+1 h</button><button class="btn sm" data-up2="p720" type="button">+12 h</button><button class="btn sm" data-up2="cut" type="button">▶ Preview cutscene</button></div>'
    +'<div class="row"><button class="btn pri" data-up2="now" type="button">Release now</button><button class="btn" data-up2="cancel" type="button">Cancel countdown</button></div>';
  else h='<p class="muted" style="margin:0 0 10px">Not started. Starting it begins a 12-hour countdown that everyone sees in Cuber Tools. When it ends, Update 2 goes live for good and every player sees its cutscene once. You can move the time any time before then.</p><div class="row"><button class="btn pri" data-up2="start" type="button">🚀 Start 12-hour countdown</button><button class="btn" data-up2="cut" type="button">▶ Preview cutscene</button></div>';
  if(!u.live) h+='<div class="row"><label class="row" style="gap:8px"><input type="checkbox" id="oUp2P"'+(prev?' checked':'')+'> 👁 View Update 2 on this device (only you see it, nothing is released)</label></div>';
  box.innerHTML='<div class="pnl oup"><h3>🚀 Update 2</h3>'+h+'</div>'; }
async function up2Do(a,extra){ var r=await CW.admin('upd',Object.assign({act:a,v:2},extra||{})); if(r.ok&&r.data&&r.data.upd){ LV.upd=r.data.upd; if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); up2Render(); } else CW.toast((r.data&&r.data.error)||'Could not do that.'); }
function up2Bind(){ var box=$('#oUp2',O.el); if(!box||box._b) return; box._b=1;
  box.addEventListener('click',function(e){ var b=e.target.closest('[data-up2]'); if(!b) return; var a=b.getAttribute('data-up2');
    if(a==='cut') return PL.updCut2&&PL.updCut2();
    if(a==='start') return up2Do('start');
    if(a==='set'){ var v=$('#oUp2T',box).value; var ms=new Date(v).getTime(); if(!v||isNaN(ms)) return CW.toast('Pick a date and time.'); return up2Do('set',{at:ms}); }
    if(a==='m60') return up2Do('shift',{ms:-3600000}); if(a==='p60') return up2Do('shift',{ms:3600000}); if(a==='p720') return up2Do('shift',{ms:43200000});
    if(a==='now'){ if(confirm('Release Update 2 in a few seconds? Everyone online sees its cutscene and it cannot be undone.')) up2Do('now'); return; }
    if(a==='cancel'){ if(confirm('Cancel the Update 2 countdown?')) up2Do('cancel'); } });
  box.addEventListener('change',function(e){ if(e.target.id==='oUp2P'){ try{ if(e.target.checked){ localStorage.setItem('cw_upd2_prev','1'); localStorage.setItem('cw_upd_prev','1'); } else localStorage.removeItem('cw_upd2_prev'); }catch(x){} if(e.target.checked){ if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); } else location.reload(); } }); }
setInterval(function(){ var c=$('#oUp2C'); var v=LV.upd&&LV.upd.v2; if(c&&v&&v.at) c.textContent=PL.updHMS(v.at-PL.now()); },500);
PL.onLive(function(){ if($('#oUp2')){ var u=LV.upd||{}, v=u.v2||{}, k=u.live+'|'+v.live+'|'+v.at; if(O.up2k!==k){ O.up2k=k; up2Render(); } } });
function up3Render(){ var box=$('#oUp3',O.el); if(!box) return; var u1=(LV.upd&&LV.upd.v2)||{}, u=(LV.upd&&LV.upd.v3)||{at:0,live:false}, prev=localStorage.getItem('cw_upd3_prev')==='1', h;
  if(!u1.live){ box.innerHTML='<div class="pnl oup"><h3>🚀 Update 3</h3><p class="muted" style="margin:0">Unlocks once Update 2 is live. It uses the same countdown, delay and cancel controls and has its own cutscene.</p><div class="row"><button class="btn" data-up3="cut" type="button">▶ Preview cutscene</button></div></div>'; return; }
  if(u.live) h='<p class="live">✅ Live since '+upWhen(u.rel)+' · it stays live for good.</p><div class="row"><button class="btn" data-up3="cut" type="button">▶ Replay the cutscene</button></div>';
  else if(u.at) h='<div class="oup-c" id="oUp3C">'+PL.updHMS(u.at-PL.now())+'</div><p class="muted" style="margin:2px 0 0">Releases '+upWhen(u.at)+'</p>'
    +'<div class="row"><input class="in" type="datetime-local" id="oUp3T" value="'+upLocal(u.at)+'" style="flex:1;min-width:190px"><button class="btn pri" data-up3="set" type="button">Set time</button></div>'
    +'<div class="row"><button class="btn sm" data-up3="m60" type="button">−1 h</button><button class="btn sm" data-up3="p60" type="button">+1 h</button><button class="btn sm" data-up3="p720" type="button">+12 h</button><button class="btn sm" data-up3="cut" type="button">▶ Preview cutscene</button></div>'
    +'<div class="row"><button class="btn pri" data-up3="now" type="button">Release now</button><button class="btn" data-up3="cancel" type="button">Cancel countdown</button></div>';
  else h='<p class="muted" style="margin:0 0 10px">Not started. Starting it begins a 12-hour countdown that everyone sees in Cuber Tools. When it ends, Update 3 goes live for good and every player sees its cutscene once. You can move the time any time before then.</p><div class="row"><button class="btn pri" data-up3="start" type="button">🚀 Start 12-hour countdown</button><button class="btn" data-up3="cut" type="button">▶ Preview cutscene</button></div>';
  if(!u.live) h+='<div class="row"><label class="row" style="gap:8px"><input type="checkbox" id="oUp3P"'+(prev?' checked':'')+'> 👁 View Update 3 on this device (only you see it, nothing is released)</label></div>';
  box.innerHTML='<div class="pnl oup"><h3>🚀 Update 3</h3>'+h+'</div>'; }
async function up3Do(a,extra){ var r=await CW.admin('upd',Object.assign({act:a,v:3},extra||{})); if(r.ok&&r.data&&r.data.upd){ LV.upd=r.data.upd; if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); if(PL.updSync3) PL.updSync3(); up3Render(); } else CW.toast((r.data&&r.data.error)||'Could not do that.'); }
function up3Bind(){ var box=$('#oUp3',O.el); if(!box||box._b) return; box._b=1;
  box.addEventListener('click',function(e){ var b=e.target.closest('[data-up3]'); if(!b) return; var a=b.getAttribute('data-up3');
    if(a==='cut') return PL.updCut3&&PL.updCut3();
    if(a==='start') return up3Do('start');
    if(a==='set'){ var v=$('#oUp3T',box).value; var ms=new Date(v).getTime(); if(!v||isNaN(ms)) return CW.toast('Pick a date and time.'); return up3Do('set',{at:ms}); }
    if(a==='m60') return up3Do('shift',{ms:-3600000}); if(a==='p60') return up3Do('shift',{ms:3600000}); if(a==='p720') return up3Do('shift',{ms:43200000});
    if(a==='now'){ if(confirm('Release Update 3 in a few seconds? Everyone online sees its cutscene and it cannot be undone.')) up3Do('now'); return; }
    if(a==='cancel'){ if(confirm('Cancel the Update 3 countdown?')) up3Do('cancel'); } });
  box.addEventListener('change',function(e){ if(e.target.id==='oUp3P'){ try{ if(e.target.checked){ localStorage.setItem('cw_upd3_prev','1'); localStorage.setItem('cw_upd2_prev','1'); localStorage.setItem('cw_upd_prev','1'); } else localStorage.removeItem('cw_upd3_prev'); }catch(x){} if(e.target.checked){ if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); if(PL.updSync3) PL.updSync3(); } else location.reload(); } }); }
setInterval(function(){ var c=$('#oUp3C'); var v=LV.upd&&LV.upd.v3; if(c&&v&&v.at) c.textContent=PL.updHMS(v.at-PL.now()); },500);
PL.onLive(function(){ if($('#oUp3')){ var u=(LV.upd&&LV.upd.v2)||{}, v=(LV.upd&&LV.upd.v3)||{}, k=u.live+'|'+v.live+'|'+v.at; if(O.up3k!==k){ O.up3k=k; up3Render(); } } });
function up4Render(){ var box=$('#oUp4',O.el); if(!box) return; var u1=(LV.upd&&LV.upd.v3)||{}, u=(LV.upd&&LV.upd.v4)||{at:0,live:false}, prev=localStorage.getItem('cw_upd4_prev')==='1', h;
  if(!u1.live){ box.innerHTML='<div class="pnl oup"><h3>🚀 Update 4</h3><p class="muted" style="margin:0">Unlocks once Update 3 is live. It uses the same countdown, delay and cancel controls and has its own cutscene.</p><div class="row"><button class="btn" data-up4="cut" type="button">▶ Preview cutscene</button></div></div>'; return; }
  if(u.live) h='<p class="live">✅ Live since '+upWhen(u.rel)+' · it stays live for good.</p><div class="row"><button class="btn" data-up4="cut" type="button">▶ Replay the cutscene</button></div>';
  else if(u.at) h='<div class="oup-c" id="oUp4C">'+PL.updHMS(u.at-PL.now())+'</div><p class="muted" style="margin:2px 0 0">Releases '+upWhen(u.at)+'</p>'
    +'<div class="row"><input class="in" type="datetime-local" id="oUp4T" value="'+upLocal(u.at)+'" style="flex:1;min-width:190px"><button class="btn pri" data-up4="set" type="button">Set time</button></div>'
    +'<div class="row"><button class="btn sm" data-up4="m60" type="button">−1 h</button><button class="btn sm" data-up4="p60" type="button">+1 h</button><button class="btn sm" data-up4="p720" type="button">+12 h</button><button class="btn sm" data-up4="cut" type="button">▶ Preview cutscene</button></div>'
    +'<div class="row"><button class="btn pri" data-up4="now" type="button">Release now</button><button class="btn" data-up4="cancel" type="button">Cancel countdown</button></div>';
  else h='<p class="muted" style="margin:0 0 10px">Not started. Starting it begins a 12-hour countdown that everyone sees in Cuber Tools. When it ends, Update 4 goes live for good and every player sees its cutscene once. You can move the time any time before then.</p><div class="row"><button class="btn pri" data-up4="start" type="button">🚀 Start 12-hour countdown</button><button class="btn" data-up4="cut" type="button">▶ Preview cutscene</button></div>';
  if(!u.live) h+='<div class="row"><label class="row" style="gap:8px"><input type="checkbox" id="oUp4P"'+(prev?' checked':'')+'> 👁 View Update 4 on this device (only you see it, nothing is released)</label></div>';
  box.innerHTML='<div class="pnl oup"><h3>🚀 Update 4</h3>'+h+'</div>'; }
async function up4Do(a,extra){ var r=await CW.admin('upd',Object.assign({act:a,v:4},extra||{})); if(r.ok&&r.data&&r.data.upd){ LV.upd=r.data.upd; if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); if(PL.updSync3) PL.updSync3(); if(PL.updSync4) PL.updSync4(); up4Render(); } else CW.toast((r.data&&r.data.error)||'Could not do that.'); }
function up4Bind(){ var box=$('#oUp4',O.el); if(!box||box._b) return; box._b=1;
  box.addEventListener('click',function(e){ var b=e.target.closest('[data-up4]'); if(!b) return; var a=b.getAttribute('data-up4');
    if(a==='cut') return PL.updCut4&&PL.updCut4();
    if(a==='start') return up4Do('start');
    if(a==='set'){ var v=$('#oUp4T',box).value; var ms=new Date(v).getTime(); if(!v||isNaN(ms)) return CW.toast('Pick a date and time.'); return up4Do('set',{at:ms}); }
    if(a==='m60') return up4Do('shift',{ms:-3600000}); if(a==='p60') return up4Do('shift',{ms:3600000}); if(a==='p720') return up4Do('shift',{ms:43200000});
    if(a==='now'){ if(confirm('Release Update 4 in a few seconds? Everyone online sees its cutscene and it cannot be undone.')) up4Do('now'); return; }
    if(a==='cancel'){ if(confirm('Cancel the Update 4 countdown?')) up4Do('cancel'); } });
  box.addEventListener('change',function(e){ if(e.target.id==='oUp4P'){ try{ if(e.target.checked){ localStorage.setItem('cw_upd4_prev','1'); localStorage.setItem('cw_upd3_prev','1'); localStorage.setItem('cw_upd2_prev','1'); localStorage.setItem('cw_upd_prev','1'); } else localStorage.removeItem('cw_upd4_prev'); }catch(x){} if(e.target.checked){ if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); if(PL.updSync3) PL.updSync3(); if(PL.updSync4) PL.updSync4(); } else location.reload(); } }); }
setInterval(function(){ var c=$('#oUp4C'); var v=LV.upd&&LV.upd.v4; if(c&&v&&v.at) c.textContent=PL.updHMS(v.at-PL.now()); },500);
PL.onLive(function(){ if($('#oUp4')){ var u=(LV.upd&&LV.upd.v3)||{}, v=(LV.upd&&LV.upd.v4)||{}, k=u.live+'|'+v.live+'|'+v.at; if(O.up4k!==k){ O.up4k=k; up4Render(); } } });
function up5Render(){ var box=$('#oUp5',O.el); if(!box) return; var u1=(LV.upd&&LV.upd.v4)||{}, u=(LV.upd&&LV.upd.v5)||{at:0,live:false}, prev=localStorage.getItem('cw_upd5_prev')==='1', h;
  if(!u1.live){ box.innerHTML='<div class="pnl oup"><h3>🚀 Update 5</h3><p class="muted" style="margin:0">Unlocks once Update 4 is live. It uses the same countdown, delay and cancel controls and has its own cutscene.</p><div class="row"><button class="btn" data-up5="cut" type="button">▶ Preview cutscene</button></div></div>'; return; }
  if(u.live) h='<p class="live">✅ Live since '+upWhen(u.rel)+' · it stays live for good.</p><div class="row"><button class="btn" data-up5="cut" type="button">▶ Replay the cutscene</button></div>';
  else if(u.at) h='<div class="oup-c" id="oUp5C">'+PL.updHMS(u.at-PL.now())+'</div><p class="muted" style="margin:2px 0 0">Releases '+upWhen(u.at)+'</p>'
    +'<div class="row"><input class="in" type="datetime-local" id="oUp5T" value="'+upLocal(u.at)+'" style="flex:1;min-width:190px"><button class="btn pri" data-up5="set" type="button">Set time</button></div>'
    +'<div class="row"><button class="btn sm" data-up5="m60" type="button">−1 h</button><button class="btn sm" data-up5="p60" type="button">+1 h</button><button class="btn sm" data-up5="p720" type="button">+12 h</button><button class="btn sm" data-up5="cut" type="button">▶ Preview cutscene</button></div>'
    +'<div class="row"><button class="btn pri" data-up5="now" type="button">Release now</button><button class="btn" data-up5="cancel" type="button">Cancel countdown</button></div>';
  else h='<p class="muted" style="margin:0 0 10px">Not started. Starting it begins a 12-hour countdown that everyone sees in Cuber Tools. When it ends, Update 5 goes live for good and every player sees its cutscene once. You can move the time any time before then.</p><div class="row"><button class="btn pri" data-up5="start" type="button">🚀 Start 12-hour countdown</button><button class="btn" data-up5="cut" type="button">▶ Preview cutscene</button></div>';
  if(!u.live) h+='<div class="row"><label class="row" style="gap:8px"><input type="checkbox" id="oUp5P"'+(prev?' checked':'')+'> 👁 View Update 5 on this device (only you see it, nothing is released)</label></div>';
  box.innerHTML='<div class="pnl oup"><h3>🚀 Update 5</h3>'+h+'</div>'; }
async function up5Do(a,extra){ var r=await CW.admin('upd',Object.assign({act:a,v:5},extra||{})); if(r.ok&&r.data&&r.data.upd){ LV.upd=r.data.upd; if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); if(PL.updSync3) PL.updSync3(); if(PL.updSync4) PL.updSync4(); if(PL.updSync5) PL.updSync5(); up5Render(); } else CW.toast((r.data&&r.data.error)||'Could not do that.'); }
function up5Bind(){ var box=$('#oUp5',O.el); if(!box||box._b) return; box._b=1;
  box.addEventListener('click',function(e){ var b=e.target.closest('[data-up5]'); if(!b) return; var a=b.getAttribute('data-up5');
    if(a==='cut') return PL.updCut5&&PL.updCut5();
    if(a==='start') return up5Do('start');
    if(a==='set'){ var v=$('#oUp5T',box).value; var ms=new Date(v).getTime(); if(!v||isNaN(ms)) return CW.toast('Pick a date and time.'); return up5Do('set',{at:ms}); }
    if(a==='m60') return up5Do('shift',{ms:-3600000}); if(a==='p60') return up5Do('shift',{ms:3600000}); if(a==='p720') return up5Do('shift',{ms:43200000});
    if(a==='now'){ if(confirm('Release Update 5 in a few seconds? Everyone online sees its cutscene and it cannot be undone.')) up5Do('now'); return; }
    if(a==='cancel'){ if(confirm('Cancel the Update 5 countdown?')) up5Do('cancel'); } });
  box.addEventListener('change',function(e){ if(e.target.id==='oUp5P'){ try{ if(e.target.checked){ localStorage.setItem('cw_upd5_prev','1'); localStorage.setItem('cw_upd4_prev','1'); localStorage.setItem('cw_upd3_prev','1'); localStorage.setItem('cw_upd2_prev','1'); localStorage.setItem('cw_upd_prev','1'); } else localStorage.removeItem('cw_upd5_prev'); }catch(x){} if(e.target.checked){ if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); if(PL.updSync3) PL.updSync3(); if(PL.updSync4) PL.updSync4(); if(PL.updSync5) PL.updSync5(); } else location.reload(); } }); }
setInterval(function(){ var c=$('#oUp5C'); var v=LV.upd&&LV.upd.v5; if(c&&v&&v.at) c.textContent=PL.updHMS(v.at-PL.now()); },500);
PL.onLive(function(){ if($('#oUp5')){ var u=(LV.upd&&LV.upd.v4)||{}, v=(LV.upd&&LV.upd.v5)||{}, k=u.live+'|'+v.live+'|'+v.at; if(O.up5k!==k){ O.up5k=k; up5Render(); } } });
function up6Render(){ var box=$('#oUp6',O.el); if(!box) return; var u1=(LV.upd&&LV.upd.v5)||{}, u=(LV.upd&&LV.upd.v6)||{at:0,live:false}, prev=localStorage.getItem('cw_upd6_prev')==='1', h;
  if(!u1.live){ box.innerHTML='<div class="pnl oup"><h3>🚀 Update 6</h3><p class="muted" style="margin:0">Unlocks once Update 5 is live. It uses the same countdown, delay and cancel controls and has its own cutscene.</p><div class="row"><button class="btn" data-up6="cut" type="button">▶ Preview cutscene</button></div></div>'; return; }
  if(u.live) h='<p class="live">✅ Live since '+upWhen(u.rel)+' · it stays live for good.</p><div class="row"><button class="btn" data-up6="cut" type="button">▶ Replay the cutscene</button><button class="btn pri" data-up6="evon" type="button">🎉 Start a Double Speed weekend (48 h)</button><button class="btn" data-up6="evoff" type="button">Stop the event</button></div>';
  else if(u.at) h='<div class="oup-c" id="oUp6C">'+PL.updHMS(u.at-PL.now())+'</div><p class="muted" style="margin:2px 0 0">Releases '+upWhen(u.at)+'</p>'
    +'<div class="row"><input class="in" type="datetime-local" id="oUp6T" value="'+upLocal(u.at)+'" style="flex:1;min-width:190px"><button class="btn pri" data-up6="set" type="button">Set time</button></div>'
    +'<div class="row"><button class="btn sm" data-up6="m60" type="button">−1 h</button><button class="btn sm" data-up6="p60" type="button">+1 h</button><button class="btn sm" data-up6="p720" type="button">+12 h</button><button class="btn sm" data-up6="cut" type="button">▶ Preview cutscene</button></div>'
    +'<div class="row"><button class="btn pri" data-up6="now" type="button">Release now</button><button class="btn" data-up6="cancel" type="button">Cancel countdown</button></div>';
  else h='<p class="muted" style="margin:0 0 10px">Not started. Starting it begins a 12-hour countdown that everyone sees in Cuber Tools. When it ends, Update 6 goes live for good and every player sees its cutscene once. You can move the time any time before then.</p><div class="row"><button class="btn pri" data-up6="start" type="button">🚀 Start 12-hour countdown</button><button class="btn" data-up6="cut" type="button">▶ Preview cutscene</button></div>';
  if(!u.live) h+='<div class="row"><label class="row" style="gap:8px"><input type="checkbox" id="oUp6P"'+(prev?' checked':'')+'> 👁 View Update 6 on this device (only you see it, nothing is released)</label></div>';
  box.innerHTML='<div class="pnl oup"><h3>🚀 Update 6</h3>'+h+'</div>'; }
async function up6Do(a,extra){ var r=await CW.admin('upd',Object.assign({act:a,v:6},extra||{})); if(r.ok&&r.data&&r.data.upd){ LV.upd=r.data.upd; if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); if(PL.updSync3) PL.updSync3(); if(PL.updSync4) PL.updSync4(); if(PL.updSync5) PL.updSync5(); if(PL.updSync6) PL.updSync6(); up6Render(); } else CW.toast((r.data&&r.data.error)||'Could not do that.'); }
function up6Bind(){ var box=$('#oUp6',O.el); if(!box||box._b) return; box._b=1;
  box.addEventListener('click',function(e){ var b=e.target.closest('[data-up6]'); if(!b) return; var a=b.getAttribute('data-up6');
    if(a==='cut') return PL.updCut6&&PL.updCut6();
    if(a==='evon'||a==='evoff'){ CW.admin('ev6',{act:a==='evon'?'on':'off',h:48}).then(function(r){ CW.toast(r.ok&&r.data&&r.data.ok?(a==='evon'?'Double Speed is on for 48 hours.':'The event is stopped.'):((r.data&&r.data.error)||'That did not work.')); if(PL.poll) PL.poll(); }); return; }
    if(a==='start') return up6Do('start');
    if(a==='set'){ var v=$('#oUp6T',box).value; var ms=new Date(v).getTime(); if(!v||isNaN(ms)) return CW.toast('Pick a date and time.'); return up6Do('set',{at:ms}); }
    if(a==='m60') return up6Do('shift',{ms:-3600000}); if(a==='p60') return up6Do('shift',{ms:3600000}); if(a==='p720') return up6Do('shift',{ms:43200000});
    if(a==='now'){ if(confirm('Release Update 6 in a few seconds? Everyone online sees its cutscene and it cannot be undone.')) up6Do('now'); return; }
    if(a==='cancel'){ if(confirm('Cancel the Update 6 countdown?')) up6Do('cancel'); } });
  box.addEventListener('change',function(e){ if(e.target.id==='oUp6P'){ try{ if(e.target.checked){ localStorage.setItem('cw_upd6_prev','1'); localStorage.setItem('cw_upd5_prev','1'); localStorage.setItem('cw_upd4_prev','1'); localStorage.setItem('cw_upd3_prev','1'); localStorage.setItem('cw_upd2_prev','1'); localStorage.setItem('cw_upd_prev','1'); } else localStorage.removeItem('cw_upd6_prev'); }catch(x){} if(e.target.checked){ if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); if(PL.updSync3) PL.updSync3(); if(PL.updSync4) PL.updSync4(); if(PL.updSync5) PL.updSync5(); if(PL.updSync6) PL.updSync6(); } else location.reload(); } }); }
setInterval(function(){ var c=$('#oUp6C'); var v=LV.upd&&LV.upd.v6; if(c&&v&&v.at) c.textContent=PL.updHMS(v.at-PL.now()); },500);
function up65Render(){ var box=$('#oUp65',O.el); if(!box) return; var u1=(LV.upd&&LV.upd.v6)||{}, u=(LV.upd&&LV.upd.v65)||{at:0,live:false}, prev=localStorage.getItem('cw_upd65_prev')==='1', h;
  if(!u1.live){ box.innerHTML='<div class="pnl oup"><h3>🚀 Update 6.5</h3><p class="muted" style="margin:0">Unlocks once Update 6 is live. It uses the same countdown, delay and cancel controls and has its own cutscene.</p><div class="row"><button class="btn" data-up65="cut" type="button">▶ Preview cutscene</button></div></div>'; return; }
  if(u.live) h='<p class="live">✅ Live since '+upWhen(u.rel)+' · it stays live for good.</p><div class="row"><button class="btn" data-up65="cut" type="button">▶ Replay the cutscene</button></div>';
  else if(u.at) h='<div class="oup-c" id="oUp65C">'+PL.updHMS(u.at-PL.now())+'</div><p class="muted" style="margin:2px 0 0">Releases '+upWhen(u.at)+'</p>'
    +'<div class="row"><input class="in" type="datetime-local" id="oUp65T" value="'+upLocal(u.at)+'" style="flex:1;min-width:190px"><button class="btn pri" data-up65="set" type="button">Set time</button></div>'
    +'<div class="row"><button class="btn sm" data-up65="m60" type="button">−1 h</button><button class="btn sm" data-up65="p60" type="button">+1 h</button><button class="btn sm" data-up65="p720" type="button">+12 h</button><button class="btn sm" data-up65="cut" type="button">▶ Preview cutscene</button></div>'
    +'<div class="row"><button class="btn pri" data-up65="now" type="button">Release now</button><button class="btn" data-up65="cancel" type="button">Cancel countdown</button></div>';
  else h='<p class="muted" style="margin:0 0 10px">Not started. Starting it begins a 12-hour countdown that everyone sees in Cuber Tools. When it ends, Update 6.5 goes live for good and every player sees its cutscene once. You can move the time any time before then.</p><div class="row"><button class="btn pri" data-up65="start" type="button">🚀 Start 12-hour countdown</button><button class="btn" data-up65="cut" type="button">▶ Preview cutscene</button></div>';
  if(!u.live) h+='<div class="row"><label class="row" style="gap:8px"><input type="checkbox" id="oUp65P"'+(prev?' checked':'')+'> 👁 View Update 6.5 on this device (only you see it, nothing is released)</label></div>';
  box.innerHTML='<div class="pnl oup"><h3>🚀 Update 6.5</h3>'+h+'</div>'; }
async function up65Do(a,extra){ var r=await CW.admin('upd',Object.assign({act:a,v:65},extra||{})); if(r.ok&&r.data&&r.data.upd){ LV.upd=r.data.upd; if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); if(PL.updSync3) PL.updSync3(); if(PL.updSync4) PL.updSync4(); if(PL.updSync5) PL.updSync5(); if(PL.updSync6) PL.updSync6(); if(PL.updSync65) PL.updSync65(); up65Render(); } else CW.toast((r.data&&r.data.error)||'Could not do that.'); }
function up65Bind(){ var box=$('#oUp65',O.el); if(!box||box._b) return; box._b=1;
  box.addEventListener('click',function(e){ var b=e.target.closest('[data-up65]'); if(!b) return; var a=b.getAttribute('data-up65');
    if(a==='cut') return PL.updCut65&&PL.updCut65();
    if(a==='evon'||a==='evoff'){ CW.admin('ev6',{act:a==='evon'?'on':'off',h:48}).then(function(r){ CW.toast(r.ok&&r.data&&r.data.ok?(a==='evon'?'Double Speed is on for 48 hours.':'The event is stopped.'):((r.data&&r.data.error)||'That did not work.')); if(PL.poll) PL.poll(); }); return; }
    if(a==='start') return up65Do('start');
    if(a==='set'){ var v=$('#oUp65T',box).value; var ms=new Date(v).getTime(); if(!v||isNaN(ms)) return CW.toast('Pick a date and time.'); return up65Do('set',{at:ms}); }
    if(a==='m60') return up65Do('shift',{ms:-3600000}); if(a==='p60') return up65Do('shift',{ms:3600000}); if(a==='p720') return up65Do('shift',{ms:43200000});
    if(a==='now'){ if(confirm('Release Update 6.5 in a few seconds? Everyone online sees its cutscene and it cannot be undone.')) up65Do('now'); return; }
    if(a==='cancel'){ if(confirm('Cancel the Update 6.5 countdown?')) up65Do('cancel'); } });
  box.addEventListener('change',function(e){ if(e.target.id==='oUp65P'){ try{ if(e.target.checked){ localStorage.setItem('cw_upd65_prev','1'); localStorage.setItem('cw_upd6_prev','1'); localStorage.setItem('cw_upd5_prev','1'); localStorage.setItem('cw_upd4_prev','1'); localStorage.setItem('cw_upd3_prev','1'); localStorage.setItem('cw_upd2_prev','1'); localStorage.setItem('cw_upd_prev','1'); } else localStorage.removeItem('cw_upd65_prev'); }catch(x){} if(e.target.checked){ if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); if(PL.updSync3) PL.updSync3(); if(PL.updSync4) PL.updSync4(); if(PL.updSync5) PL.updSync5(); if(PL.updSync6) PL.updSync6(); if(PL.updSync65) PL.updSync65(); } else location.reload(); } }); }
setInterval(function(){ var c=$('#oUp65C'); var v=LV.upd&&LV.upd.v65; if(c&&v&&v.at) c.textContent=PL.updHMS(v.at-PL.now()); },500);
function up7Render(){ var box=$('#oUp7',O.el); if(!box) return; var u1=(LV.upd&&LV.upd.v65)||{}, u=(LV.upd&&LV.upd.v7)||{at:0,live:false}, prev=localStorage.getItem('cw_upd7_prev')==='1', h;
  if(!u1.live){ box.innerHTML='<div class="pnl oup"><h3>🚀 Update 7</h3><p class="muted" style="margin:0">Unlocks once Update 6.5 is live. It uses the same countdown, delay and cancel controls and has its own cutscene.</p><div class="row"><button class="btn" data-up7="cut" type="button">▶ Preview cutscene</button></div></div>'; return; }
  if(u.live) h='<p class="live">✅ Live since '+upWhen(u.rel)+' · it stays live for good.</p><div class="row"><button class="btn" data-up7="cut" type="button">▶ Replay the cutscene</button></div>';
  else if(u.at) h='<div class="oup-c" id="oUp7C">'+PL.updHMS(u.at-PL.now())+'</div><p class="muted" style="margin:2px 0 0">Releases '+upWhen(u.at)+'</p>'
    +'<div class="row"><input class="in" type="datetime-local" id="oUp7T" value="'+upLocal(u.at)+'" style="flex:1;min-width:190px"><button class="btn pri" data-up7="set" type="button">Set time</button></div>'
    +'<div class="row"><button class="btn sm" data-up7="m60" type="button">−1 h</button><button class="btn sm" data-up7="p60" type="button">+1 h</button><button class="btn sm" data-up7="p720" type="button">+12 h</button><button class="btn sm" data-up7="cut" type="button">▶ Preview cutscene</button></div>'
    +'<div class="row"><button class="btn pri" data-up7="now" type="button">Release now</button><button class="btn" data-up7="cancel" type="button">Cancel countdown</button></div>';
  else h='<p class="muted" style="margin:0 0 10px">Not started. Starting it begins a 12-hour countdown that everyone sees in Cuber Tools. When it ends, Update 7 goes live for good and every player sees its cutscene once. You can move the time any time before then.</p><div class="row"><button class="btn pri" data-up7="start" type="button">🚀 Start 12-hour countdown</button><button class="btn" data-up7="cut" type="button">▶ Preview cutscene</button></div>';
  if(!u.live) h+='<div class="row"><label class="row" style="gap:8px"><input type="checkbox" id="oUp7P"'+(prev?' checked':'')+'> 👁 View Update 7 on this device (only you see it, nothing is released)</label></div>';
  box.innerHTML='<div class="pnl oup"><h3>🚀 Update 7</h3>'+h+'</div>'; }
async function up7Do(a,extra){ var r=await CW.admin('upd',Object.assign({act:a,v:7},extra||{})); if(r.ok&&r.data&&r.data.upd){ LV.upd=r.data.upd; if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); if(PL.updSync3) PL.updSync3(); if(PL.updSync4) PL.updSync4(); if(PL.updSync5) PL.updSync5(); if(PL.updSync6) PL.updSync6(); if(PL.updSync65) PL.updSync65(); if(PL.updSync7) PL.updSync7(); up7Render(); } else CW.toast((r.data&&r.data.error)||'Could not do that.'); }
function up7Bind(){ var box=$('#oUp7',O.el); if(!box||box._b) return; box._b=1;
  box.addEventListener('click',function(e){ var b=e.target.closest('[data-up7]'); if(!b) return; var a=b.getAttribute('data-up7');
    if(a==='cut') return PL.updCut7&&PL.updCut7();
    if(a==='evon'||a==='evoff'){ CW.admin('ev6',{act:a==='evon'?'on':'off',h:48}).then(function(r){ CW.toast(r.ok&&r.data&&r.data.ok?(a==='evon'?'Double Speed is on for 48 hours.':'The event is stopped.'):((r.data&&r.data.error)||'That did not work.')); if(PL.poll) PL.poll(); }); return; }
    if(a==='start') return up7Do('start');
    if(a==='set'){ var v=$('#oUp7T',box).value; var ms=new Date(v).getTime(); if(!v||isNaN(ms)) return CW.toast('Pick a date and time.'); return up7Do('set',{at:ms}); }
    if(a==='m60') return up7Do('shift',{ms:-3600000}); if(a==='p60') return up7Do('shift',{ms:3600000}); if(a==='p720') return up7Do('shift',{ms:43200000});
    if(a==='now'){ if(confirm('Release Update 7 in a few seconds? Everyone online sees its cutscene and it cannot be undone.')) up7Do('now'); return; }
    if(a==='cancel'){ if(confirm('Cancel the Update 7 countdown?')) up7Do('cancel'); } });
  box.addEventListener('change',function(e){ if(e.target.id==='oUp7P'){ try{ if(e.target.checked){ localStorage.setItem('cw_upd7_prev','1'); localStorage.setItem('cw_upd65_prev','1'); localStorage.setItem('cw_upd6_prev','1'); localStorage.setItem('cw_upd5_prev','1'); localStorage.setItem('cw_upd4_prev','1'); localStorage.setItem('cw_upd3_prev','1'); localStorage.setItem('cw_upd2_prev','1'); localStorage.setItem('cw_upd_prev','1'); } else localStorage.removeItem('cw_upd7_prev'); }catch(x){} if(e.target.checked){ if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); if(PL.updSync3) PL.updSync3(); if(PL.updSync4) PL.updSync4(); if(PL.updSync5) PL.updSync5(); if(PL.updSync6) PL.updSync6(); if(PL.updSync65) PL.updSync65(); if(PL.updSync7) PL.updSync7(); } else location.reload(); } }); }
setInterval(function(){ var c=$('#oUp7C'); var v=LV.upd&&LV.upd.v7; if(c&&v&&v.at) c.textContent=PL.updHMS(v.at-PL.now()); },500);
PL.onLive(function(){ if($('#oUp6')){ var u=(LV.upd&&LV.upd.v5)||{}, v=(LV.upd&&LV.upd.v6)||{}, k=u.live+'|'+v.live+'|'+v.at; if(O.up6k!==k){ O.up6k=k; up6Render(); } } });
PL.onLive(function(){ if($('#oUp65')){ var u=(LV.upd&&LV.upd.v6)||{}, v=(LV.upd&&LV.upd.v65)||{}, k=u.live+'|'+v.live+'|'+v.at; if(O.up65k!==k){ O.up65k=k; up65Render(); } } });
PL.onLive(function(){ if($('#oUp7')){ var u=(LV.upd&&LV.upd.v65)||{}, v=(LV.upd&&LV.upd.v7)||{}, k=u.live+'|'+v.live+'|'+v.at; if(O.up7k!==k){ O.up7k=k; up7Render(); } } });
function up8Render(){ var box=$('#oUp8',O.el); if(!box) return; var u1=(LV.upd&&LV.upd.v7)||{}, u=(LV.upd&&LV.upd.v8)||{at:0,live:false}, prev=localStorage.getItem('cw_upd8_prev')==='1', h;
  if(!u1.live){ box.innerHTML='<div class="pnl oup"><h3>🚀 Update 8</h3><p class="muted" style="margin:0">Unlocks once Update 7 is live. It uses the same countdown, delay and cancel controls and has its own cutscene.</p><div class="row"><button class="btn" data-up8="cut" type="button">▶ Preview cutscene</button></div></div>'; return; }
  if(u.live) h='<p class="live">✅ Live since '+upWhen(u.rel)+' · it stays live for good.</p><div class="row"><button class="btn" data-up8="cut" type="button">▶ Replay the cutscene</button></div>';
  else if(u.at) h='<div class="oup-c" id="oUp8C">'+PL.updHMS(u.at-PL.now())+'</div><p class="muted" style="margin:2px 0 0">Releases '+upWhen(u.at)+'</p>'
    +'<div class="row"><input class="in" type="datetime-local" id="oUp8T" value="'+upLocal(u.at)+'" style="flex:1;min-width:190px"><button class="btn pri" data-up8="set" type="button">Set time</button></div>'
    +'<div class="row"><button class="btn sm" data-up8="m60" type="button">−1 h</button><button class="btn sm" data-up8="p60" type="button">+1 h</button><button class="btn sm" data-up8="p720" type="button">+12 h</button><button class="btn sm" data-up8="cut" type="button">▶ Preview cutscene</button></div>'
    +'<div class="row"><button class="btn pri" data-up8="now" type="button">Release now</button><button class="btn" data-up8="cancel" type="button">Cancel countdown</button></div>';
  else h='<p class="muted" style="margin:0 0 10px">Not started. Starting it begins a 12-hour countdown that everyone sees in Cuber Tools. When it ends, Update 8 goes live for good and every player sees its cutscene once. You can move the time any time before then.</p><div class="row"><button class="btn pri" data-up8="start" type="button">🚀 Start 12-hour countdown</button><button class="btn" data-up8="cut" type="button">▶ Preview cutscene</button></div>';
  if(!u.live) h+='<div class="row"><label class="row" style="gap:8px"><input type="checkbox" id="oUp8P"'+(prev?' checked':'')+'> 👁 View Update 8 on this device (only you see it, nothing is released)</label></div>';
  box.innerHTML='<div class="pnl oup"><h3>🚀 Update 8</h3>'+h+'</div>'; }
async function up8Do(a,extra){ var r=await CW.admin('upd',Object.assign({act:a,v:8},extra||{})); if(r.ok&&r.data&&r.data.upd){ LV.upd=r.data.upd; if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); if(PL.updSync3) PL.updSync3(); if(PL.updSync4) PL.updSync4(); if(PL.updSync5) PL.updSync5(); if(PL.updSync6) PL.updSync6(); if(PL.updSync65) PL.updSync65(); if(PL.updSync7) PL.updSync7(); if(PL.updSync8) PL.updSync8(); up8Render(); } else CW.toast((r.data&&r.data.error)||'Could not do that.'); }
function up8Bind(){ var box=$('#oUp8',O.el); if(!box||box._b) return; box._b=1;
  box.addEventListener('click',function(e){ var b=e.target.closest('[data-up8]'); if(!b) return; var a=b.getAttribute('data-up8');
    if(a==='cut') return PL.updCut7&&PL.updCut7();
    if(a==='evon'||a==='evoff'){ CW.admin('ev6',{act:a==='evon'?'on':'off',h:48}).then(function(r){ CW.toast(r.ok&&r.data&&r.data.ok?(a==='evon'?'Double Speed is on for 48 hours.':'The event is stopped.'):((r.data&&r.data.error)||'That did not work.')); if(PL.poll) PL.poll(); }); return; }
    if(a==='start') return up8Do('start');
    if(a==='set'){ var v=$('#oUp8T',box).value; var ms=new Date(v).getTime(); if(!v||isNaN(ms)) return CW.toast('Pick a date and time.'); return up8Do('set',{at:ms}); }
    if(a==='m60') return up8Do('shift',{ms:-3600000}); if(a==='p60') return up8Do('shift',{ms:3600000}); if(a==='p720') return up8Do('shift',{ms:43200000});
    if(a==='now'){ if(confirm('Release Update 8 in a few seconds? Everyone online sees its cutscene and it cannot be undone.')) up8Do('now'); return; }
    if(a==='cancel'){ if(confirm('Cancel the Update 8 countdown?')) up8Do('cancel'); } });
  box.addEventListener('change',function(e){ if(e.target.id==='oUp8P'){ try{ if(e.target.checked){ localStorage.setItem('cw_upd8_prev','1'); localStorage.setItem('cw_upd7_prev','1'); localStorage.setItem('cw_upd65_prev','1'); localStorage.setItem('cw_upd6_prev','1'); localStorage.setItem('cw_upd5_prev','1'); localStorage.setItem('cw_upd4_prev','1'); localStorage.setItem('cw_upd3_prev','1'); localStorage.setItem('cw_upd2_prev','1'); localStorage.setItem('cw_upd_prev','1'); } else localStorage.removeItem('cw_upd8_prev'); }catch(x){} if(e.target.checked){ if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); if(PL.updSync3) PL.updSync3(); if(PL.updSync4) PL.updSync4(); if(PL.updSync5) PL.updSync5(); if(PL.updSync6) PL.updSync6(); if(PL.updSync65) PL.updSync65(); if(PL.updSync7) PL.updSync7(); if(PL.updSync8) PL.updSync8(); } else location.reload(); } }); }
setInterval(function(){ var c=$('#oUp8C'); var v=LV.upd&&LV.upd.v8; if(c&&v&&v.at) c.textContent=PL.updHMS(v.at-PL.now()); },500);
PL.onLive(function(){ if($('#oUp8')){ var u=(LV.upd&&LV.upd.v7)||{}, v=(LV.upd&&LV.upd.v8)||{}, k=u.live+'|'+v.live+'|'+v.at; if(O.up8k!==k){ O.up8k=k; up8Render(); } } });
function up9Render(){ var box=$('#oUp9',O.el); if(!box) return; var u1=(LV.upd&&LV.upd.v8)||{}, u=(LV.upd&&LV.upd.v9)||{at:0,live:false}, prev=localStorage.getItem('cw_upd9_prev')==='1', h;
  if(!u1.live){ box.innerHTML='<div class="pnl oup"><h3>🚀 Update 9</h3><p class="muted" style="margin:0">Unlocks once Update 8 is live. It uses the same countdown, delay and cancel controls and has its own cutscene.</p><div class="row"><button class="btn" data-up9="cut" type="button">▶ Preview cutscene</button></div></div>'; return; }
  if(u.live) h='<p class="live">✅ Live since '+upWhen(u.rel)+' · it stays live for good.</p><div class="row"><button class="btn" data-up9="cut" type="button">▶ Replay the cutscene</button></div>';
  else if(u.at) h='<div class="oup-c" id="oUp9C">'+PL.updHMS(u.at-PL.now())+'</div><p class="muted" style="margin:2px 0 0">Releases '+upWhen(u.at)+'</p>'
    +'<div class="row"><input class="in" type="datetime-local" id="oUp9T" value="'+upLocal(u.at)+'" style="flex:1;min-width:190px"><button class="btn pri" data-up9="set" type="button">Set time</button></div>'
    +'<div class="row"><button class="btn sm" data-up9="m60" type="button">−1 h</button><button class="btn sm" data-up9="p60" type="button">+1 h</button><button class="btn sm" data-up9="p720" type="button">+12 h</button><button class="btn sm" data-up9="cut" type="button">▶ Preview cutscene</button></div>'
    +'<div class="row"><button class="btn pri" data-up9="now" type="button">Release now</button><button class="btn" data-up9="cancel" type="button">Cancel countdown</button></div>';
  else h='<p class="muted" style="margin:0 0 10px">Not started. Starting it begins a 12-hour countdown that everyone sees in Cuber Tools. When it ends, Update 9 goes live for good and every player sees its cutscene once. You can move the time any time before then.</p><div class="row"><button class="btn pri" data-up9="start" type="button">🚀 Start 12-hour countdown</button><button class="btn" data-up9="cut" type="button">▶ Preview cutscene</button></div>';
  if(!u.live) h+='<div class="row"><label class="row" style="gap:8px"><input type="checkbox" id="oUp9P"'+(prev?' checked':'')+'> 👁 View Update 9 on this device (only you see it, nothing is released)</label></div>';
  box.innerHTML='<div class="pnl oup"><h3>🚀 Update 9</h3>'+h+'</div>'; }
async function up9Do(a,extra){ var r=await CW.admin('upd',Object.assign({act:a,v:9},extra||{})); if(r.ok&&r.data&&r.data.upd){ LV.upd=r.data.upd; if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); if(PL.updSync3) PL.updSync3(); if(PL.updSync4) PL.updSync4(); if(PL.updSync5) PL.updSync5(); if(PL.updSync6) PL.updSync6(); if(PL.updSync65) PL.updSync65(); if(PL.updSync7) PL.updSync7(); if(PL.updSync8) PL.updSync8(); if(PL.updSync9) PL.updSync9(); up9Render(); } else CW.toast((r.data&&r.data.error)||'Could not do that.'); }
function up9Bind(){ var box=$('#oUp9',O.el); if(!box||box._b) return; box._b=1;
  box.addEventListener('click',function(e){ var b=e.target.closest('[data-up9]'); if(!b) return; var a=b.getAttribute('data-up9');
    if(a==='cut') return PL.updCut7&&PL.updCut7();
    if(a==='evon'||a==='evoff'){ CW.admin('ev6',{act:a==='evon'?'on':'off',h:48}).then(function(r){ CW.toast(r.ok&&r.data&&r.data.ok?(a==='evon'?'Double Speed is on for 48 hours.':'The event is stopped.'):((r.data&&r.data.error)||'That did not work.')); if(PL.poll) PL.poll(); }); return; }
    if(a==='start') return up9Do('start');
    if(a==='set'){ var v=$('#oUp9T',box).value; var ms=new Date(v).getTime(); if(!v||isNaN(ms)) return CW.toast('Pick a date and time.'); return up9Do('set',{at:ms}); }
    if(a==='m60') return up9Do('shift',{ms:-3600000}); if(a==='p60') return up9Do('shift',{ms:3600000}); if(a==='p720') return up9Do('shift',{ms:43200000});
    if(a==='now'){ if(confirm('Release Update 9 in a few seconds? Everyone online sees its cutscene and it cannot be undone.')) up9Do('now'); return; }
    if(a==='cancel'){ if(confirm('Cancel the Update 9 countdown?')) up9Do('cancel'); } });
  box.addEventListener('change',function(e){ if(e.target.id==='oUp9P'){ try{ if(e.target.checked){ localStorage.setItem('cw_upd9_prev','1'); localStorage.setItem('cw_upd8_prev','1'); localStorage.setItem('cw_upd7_prev','1'); localStorage.setItem('cw_upd65_prev','1'); localStorage.setItem('cw_upd6_prev','1'); localStorage.setItem('cw_upd5_prev','1'); localStorage.setItem('cw_upd4_prev','1'); localStorage.setItem('cw_upd3_prev','1'); localStorage.setItem('cw_upd2_prev','1'); localStorage.setItem('cw_upd_prev','1'); } else localStorage.removeItem('cw_upd9_prev'); }catch(x){} if(e.target.checked){ if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); if(PL.updSync3) PL.updSync3(); if(PL.updSync4) PL.updSync4(); if(PL.updSync5) PL.updSync5(); if(PL.updSync6) PL.updSync6(); if(PL.updSync65) PL.updSync65(); if(PL.updSync7) PL.updSync7(); if(PL.updSync8) PL.updSync8(); if(PL.updSync9) PL.updSync9(); } else location.reload(); } }); }
setInterval(function(){ var c=$('#oUp9C'); var v=LV.upd&&LV.upd.v9; if(c&&v&&v.at) c.textContent=PL.updHMS(v.at-PL.now()); },500);
PL.onLive(function(){ if($('#oUp9')){ var u=(LV.upd&&LV.upd.v8)||{}, v=(LV.upd&&LV.upd.v9)||{}, k=u.live+'|'+v.live+'|'+v.at; if(O.up9k!==k){ O.up9k=k; up9Render(); } } });
function up10Render(){ var box=$('#oUp10',O.el); if(!box) return; var u1=(LV.upd&&LV.upd.v9)||{}, u=(LV.upd&&LV.upd.v10)||{at:0,live:false}, prev=localStorage.getItem('cw_upd10_prev')==='1', h;
  if(!u1.live){ box.innerHTML='<div class="pnl oup"><h3>🚀 Update 10</h3><p class="muted" style="margin:0">Unlocks once Update 9 is live. It uses the same countdown, delay and cancel controls and has its own cutscene.</p><div class="row"><button class="btn" data-up10="cut" type="button">▶ Preview cutscene</button></div></div>'; return; }
  if(u.live) h='<p class="live">✅ Live since '+upWhen(u.rel)+' · it stays live for good.</p><div class="row"><button class="btn" data-up10="cut" type="button">▶ Replay the cutscene</button></div>';
  else if(u.at) h='<div class="oup-c" id="oUp10C">'+PL.updHMS(u.at-PL.now())+'</div><p class="muted" style="margin:2px 0 0">Releases '+upWhen(u.at)+'</p>'
    +'<div class="row"><input class="in" type="datetime-local" id="oUp10T" value="'+upLocal(u.at)+'" style="flex:1;min-width:190px"><button class="btn pri" data-up10="set" type="button">Set time</button></div>'
    +'<div class="row"><button class="btn sm" data-up10="m60" type="button">−1 h</button><button class="btn sm" data-up10="p60" type="button">+1 h</button><button class="btn sm" data-up10="p720" type="button">+12 h</button><button class="btn sm" data-up10="cut" type="button">▶ Preview cutscene</button></div>'
    +'<div class="row"><button class="btn pri" data-up10="now" type="button">Release now</button><button class="btn" data-up10="cancel" type="button">Cancel countdown</button></div>';
  else h='<p class="muted" style="margin:0 0 10px">Not started. Starting it begins a 12-hour countdown that everyone sees in Cuber Tools. When it ends, Update 10 goes live for good and every player sees its cutscene once. You can move the time any time before then.</p><div class="row"><button class="btn pri" data-up10="start" type="button">🚀 Start 12-hour countdown</button><button class="btn" data-up10="cut" type="button">▶ Preview cutscene</button></div>';
  if(!u.live) h+='<div class="row"><label class="row" style="gap:8px"><input type="checkbox" id="oUp10P"'+(prev?' checked':'')+'> 👁 View Update 10 on this device (only you see it, nothing is released)</label></div>';
  box.innerHTML='<div class="pnl oup"><h3>🚀 Update 10</h3>'+h+'</div>'; }
async function up10Do(a,extra){ var r=await CW.admin('upd',Object.assign({act:a,v:10},extra||{})); if(r.ok&&r.data&&r.data.upd){ LV.upd=r.data.upd; if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); if(PL.updSync3) PL.updSync3(); if(PL.updSync4) PL.updSync4(); if(PL.updSync5) PL.updSync5(); if(PL.updSync6) PL.updSync6(); if(PL.updSync65) PL.updSync65(); if(PL.updSync7) PL.updSync7(); if(PL.updSync8) PL.updSync8(); if(PL.updSync9) PL.updSync9(); if(PL.updSync10) PL.updSync10(); up10Render(); } else CW.toast((r.data&&r.data.error)||'Could not do that.'); }
function up10Bind(){ var box=$('#oUp10',O.el); if(!box||box._b) return; box._b=1;
  box.addEventListener('click',function(e){ var b=e.target.closest('[data-up10]'); if(!b) return; var a=b.getAttribute('data-up10');
    if(a==='cut') return PL.updCut7&&PL.updCut7();
    if(a==='evon'||a==='evoff'){ CW.admin('ev6',{act:a==='evon'?'on':'off',h:48}).then(function(r){ CW.toast(r.ok&&r.data&&r.data.ok?(a==='evon'?'Double Speed is on for 48 hours.':'The event is stopped.'):((r.data&&r.data.error)||'That did not work.')); if(PL.poll) PL.poll(); }); return; }
    if(a==='start') return up10Do('start');
    if(a==='set'){ var v=$('#oUp10T',box).value; var ms=new Date(v).getTime(); if(!v||isNaN(ms)) return CW.toast('Pick a date and time.'); return up10Do('set',{at:ms}); }
    if(a==='m60') return up10Do('shift',{ms:-3600000}); if(a==='p60') return up10Do('shift',{ms:3600000}); if(a==='p720') return up10Do('shift',{ms:43200000});
    if(a==='now'){ if(confirm('Release Update 10 in a few seconds? Everyone online sees its cutscene and it cannot be undone.')) up10Do('now'); return; }
    if(a==='cancel'){ if(confirm('Cancel the Update 10 countdown?')) up10Do('cancel'); } });
  box.addEventListener('change',function(e){ if(e.target.id==='oUp10P'){ try{ if(e.target.checked){ localStorage.setItem('cw_upd10_prev','1'); localStorage.setItem('cw_upd9_prev','1'); localStorage.setItem('cw_upd8_prev','1'); localStorage.setItem('cw_upd7_prev','1'); localStorage.setItem('cw_upd65_prev','1'); localStorage.setItem('cw_upd6_prev','1'); localStorage.setItem('cw_upd5_prev','1'); localStorage.setItem('cw_upd4_prev','1'); localStorage.setItem('cw_upd3_prev','1'); localStorage.setItem('cw_upd2_prev','1'); localStorage.setItem('cw_upd_prev','1'); } else localStorage.removeItem('cw_upd10_prev'); }catch(x){} if(e.target.checked){ if(PL.updSync) PL.updSync(); if(PL.updSync2) PL.updSync2(); if(PL.updSync3) PL.updSync3(); if(PL.updSync4) PL.updSync4(); if(PL.updSync5) PL.updSync5(); if(PL.updSync6) PL.updSync6(); if(PL.updSync65) PL.updSync65(); if(PL.updSync7) PL.updSync7(); if(PL.updSync8) PL.updSync8(); if(PL.updSync9) PL.updSync9(); if(PL.updSync10) PL.updSync10(); } else location.reload(); } }); }
setInterval(function(){ var c=$('#oUp10C'); var v=LV.upd&&LV.upd.v10; if(c&&v&&v.at) c.textContent=PL.updHMS(v.at-PL.now()); },500);
PL.onLive(function(){ if($('#oUp10')){ var u=(LV.upd&&LV.upd.v9)||{}, v=(LV.upd&&LV.upd.v10)||{}, k=u.live+'|'+v.live+'|'+v.at; if(O.up10k!==k){ O.up10k=k; up10Render(); } } });
var SGU={t:0,l:[]};
async function liveNames(){ if(Date.now()-SGU.t>4000){ SGU.t=Date.now(); var r=await CW.admin('users'); if(r.ok&&r.data&&r.data.users) SGU.l=r.data.users.map(function(u){ return u.name; }); } return SGU.l; }
async function suggest(){ var i=$('#oCmd',O.el), box=$('#oCmdS',O.el); if(!i||!box) return; var v=i.value;
  if(v[0]!=='/'){ box.innerHTML=''; return; }
  var sg=v.split('/'), c=(sg[1]||'').toLowerCase(), idx=sg.length-3, cur=(sg[sg.length-1]||'').toLowerCase(), list=[];
  if(sg.length===2){ list=['gift','title','banner','unbanner','msg','surprise','endrace','mute','unmute','helper','unhelper','chat','players','drop','dropend','clearchat','slow','lock','unlock','poll','endpoll','kick','announce','give','x2','ban','unban','find','stats','unkick','slowoff','clearpoll','purge','purgelast','spins','xp','skin','lockall','unlockall','say','online','pin','unpin','block','unblock','blocked','chatstats','confetti','mod','unmod','help'].filter(function(x){ return x.indexOf(cur)===0&&x!==cur; }).map(function(x){ return '/'+x; }); box.innerHTML=list.map(function(x){ return '<button type="button" data-v="'+x.slice(1)+'">'+esc(x)+'</button>'; }).join(''); return; }
  if(idx===0&&/^(slow|lock|unlock)$/.test(c)&&false){} else if(idx===0&&/^(lock|unlock)$/.test(c)) list=['general','trading','racing','help','live','all'];
  else if(idx===1&&c==='slow') list=['general','trading','racing','help','live','all'];
  else if(idx===0&&/^(gift|give|title|mute|unmute|helper|unhelper|kick|unkick|ban|find|spins|xp|skin|purge|mod|unmod)$/.test(c)){ list=await liveNames(); if(/^(mute|unmute|helper|unhelper|kick|unkick|purge|mod|unmod)$/.test(c)) LV.chat.forEach(function(m){ if(list.indexOf(m.n)<0) list.push(m.n); }); if(c==='gift'||c==='give') list=['all'].concat(list); }
  else if(idx===1&&c==='gift') list=['tokens','spins','xp','x2','skin','creator','miniadmin'];
  list=list.filter(function(n){ return String(n).toLowerCase().indexOf(cur)>-1&&String(n).toLowerCase()!==cur; }).slice(0,12);
  if(i.value!==v) return; box.innerHTML=list.length?list.map(function(n){ return '<button type="button" data-v="'+esc(n)+'">'+esc(n)+'</button>'; }).join(''):(idx===0&&/^(gift|title|mute|unmute|helper|unhelper)$/.test(c)&&!cur?'<small class="muted">Nobody online right now.</small>':''); }
async function runCmd(){ var inp=$('#oCmd',O.el), raw=inp.value.trim(); if(!raw||O.busy) return;
  if(raw[0]!=='/'){ O.busy=true; outLine(raw); outLine('Thinking…'); try{ var nm=((await CW.admin('users')).data||{}).users||[]; var ar=await CW.admin('cmd',{q:raw,names:nm.map(function(x){ return x.name; })}); if(ar.status===403){ O.busy=false; return expired(); } if(ar.ok&&ar.data.cmd){ inp.value=ar.data.cmd; outLine('Press Enter to run: '+ar.data.cmd); inp.focus(); } else outLine(ar.ok?'I could not turn that into a command. Type /help.':((ar.data&&ar.data.error)||'AI is not available.'),1); } finally { O.busy=false; } return; }
  O.hist=(O.hist||[]).concat(raw).slice(-30); O.hi=null; inp.value=''; $('#oCmdS',O.el).innerHTML=''; outLine(raw);
  var a=raw.slice(1).split('/').map(function(x){ return x.trim(); }), c=a.shift().toLowerCase(), r=null, u;
  if(c==='give'){ c='gift'; a=[a[0]||'',"tokens",a[1]||'',a.slice(2).join('/')]; }
  if(c==='unkick') c='unmute';
  if(c==='spins'||c==='xp'){ a=[a[0]||'',c,a[1]||'',a.slice(2).join('/')]; c='gift'; }
  if(c==='skin'&&a.length>=2){ a=[a[0],'skin',a[1],a.slice(2).join('/')]; c='gift'; }
  if(c==='lockall'){ c='lock'; a=['all']; } if(c==='unlockall'){ c='unlock'; a=['all']; }
  if(c==='say') c='announce'; if(c==='online') c='players';
  if(c==='slowoff'){ c='slow'; a=['0','all']; }
  O.busy=true;
  try{
    if(c==='help'||c==='?'){ HELP.forEach(function(h){ outLine(h); }); return; }
    if(c==='players'){ r=await CW.admin('users'); if(r.ok) outLine(r.data.users.length?r.data.users.map(function(x){ return x.name; }).join(', '):'Nobody online.'); else outLine('Could not load.',1); return; }
    if(c==='gift'){ if(a.length<3) return outLine('Use /gift/<name or all>/<kind>/<value>',1);
      var k=KINDS[a[1].toLowerCase()]; if(!k) return outLine('Unknown kind "'+a[1]+'". Use tokens, spins, xp, x2, skin or creator.',1);
      var to='all', nm='everyone online', g0=a[0].toLowerCase(); if(g0==='everyone'){ to='everyone'; nm='every player'; } else if(/^lv:\d+$/.test(g0)){ to=g0; nm='players level '+g0.slice(3)+'+'; } else if(g0.indexOf('club:')===0){ to='club:'+a[0].slice(5); nm='club '+a[0].slice(5); } else if(g0!=='all'){ u=await findUser(a[0]); if(u.err==='expired') return expired(); if(u.err) return outLine(u.err,1); to=u.id; nm=u.name; }
      var val=k==='skin'?skinId(a[2]):+a[2]; if(val==null||isNaN(val)) return outLine(k==='skin'?'Unknown skin "'+a[2]+'".':'The value must be a number.',1);
      if(k==='creator') val=/^(0|off|no|remove)$/i.test(a[2])?0:1;
      if(k==='miniadmin'){ val=/^(0|off|no|remove)$/i.test(a[3]||'')?0:(/hong|^2$/i.test(a[3]||'')?2:1); }
      r=await CW.admin('gift',{kind:k,value:val,msg:(a[3]||'').slice(0,80),to:to}); if(!r.ok&&r.data&&r.data.error) outLine(r.data.error,1); if(r.ok) outLine((r.data&&r.data.sent>1?r.data.sent+' players · ':'')+'Gave '+nm+' '+(k==='creator'?'creator '+(val?'on':'off'):k==='skin'?PL.skins.name(val):val+' '+k)+'.'); }
    else if(c==='drop'){ r=await CW.admin('drop',{n:+a[0]||25,val:+a[1]||100}); if(r.ok) outLine('Drop is live.'); }
    else if(c==='dropend'){ r=await CW.admin('drop',{act:'end'}); if(r.ok) outLine('Drop ended.'); }
    else if(c==='title'){ if(a.length<1) return outLine('Use /title/<name>/<text>',1); u=await findUser(a[0]); if(u.err==='expired') return expired(); if(u.err) return outLine(u.err,1);
      r=await CW.admin('title',{to:u.id,title:(a[1]||'').slice(0,16)}); if(r.ok) outLine(u.name+(a[1]?' now has the title "'+a[1]+'".':' title removed.')); }
    else if(c==='banner'){ if(!a[0]) return outLine('Use /banner/<text>/<hours>/<x2>',1); r=await CW.admin('banner',{text:a[0],hours:+a[1]||24,x2:/^(x2|2x|yes|1|on)$/i.test(a[2]||'')}); if(r.ok) outLine('Banner is live.'); }
    else if(c==='unbanner'){ r=await CW.admin('banner',{text:''}); if(r.ok) outLine('Banner removed.'); }
    else if(c==='msg'){ if(!a[0]) return outLine('Use /msg/<text>',1); r=await CW.admin('event',{type:'msg',msg:a[0]}); if(r.ok) outLine('Message sent to everyone online.'); }
    else if(c==='surprise'){ r=await CW.admin('event',{type:'burst',msg:a[0]||''}); if(r.ok) outLine('Surprise sent.'); }
    else if(c==='clearchat'){ r=await CW.admin('chat',{act:'clear'}); if(r.ok) outLine('Public chat cleared.'); }
    else if(c==='slow'||c==='lock'||c==='unlock'){ var CHS=['general','trading','racing','help','live'], chn=(c==='slow'?a[1]:a[0])||'all'; chn=chn.toLowerCase(); var tgt=chn==='all'?CHS:CHS.filter(function(x){ return x===chn; }); if(!tgt.length) return outLine('Channels: '+CHS.join(', ')+' or all',1);
      var cur0=(await CW.admin('chat',{act:'none'})); var chc=(cur0.ok&&cur0.data.chc)||{};
      for(var ci=0;ci<tgt.length;ci++){ var o0=chc[tgt[ci]]||{}; r=await CW.admin('chat',{act:'cfg',ch:tgt[ci],slow:c==='slow'?Math.max(0,Math.min(60,+a[0]||0)):(o0.slow||0),lock:c==='lock'?1:c==='unlock'?0:(o0.lock||0)}); }
      if(r&&r.ok) outLine(c==='slow'?('Slow mode '+((+a[0]||0)?(+a[0])+'s':'off')+' in '+chn+'.'):(chn+' is '+(c==='lock'?'read-only now':'open again')+'.')); }
    else if(c==='poll'){ if(a.length<3) return outLine('Use /poll/<question>/<option>/<option>',1); r=await CW.admin('poll',{act:'start',q:a[0],opts:a.slice(1).filter(Boolean),secs:0}); if(r.ok) outLine('Poll is live.'); }
    else if(c==='endpoll'){ r=await CW.admin('poll',{act:'close'}); if(r.ok) outLine('Poll closed.'); }
    else if(c==='kick'){ if(!a[0]) return outLine('Use /kick/<name>',1); u=findChatter(a[0]); if(u.err) return outLine(u.err,1); r=await CW.admin('chat',{act:'mute',p:u.p,mins:60}); if(r.ok) outLine(u.n+' is out of chat for 60 minutes.'); }
    else if(c==='announce'){ if(!a[0]) return outLine('Use /announce/<text>',1); r=await CW.call('/api/chat/send',{id:CW.devId(),ch:'general',text:'📢 '+a.join(' / ')},6000); if(r.ok){ outLine('Posted in chat.'); PL.poll(); } else outLine((r.data&&r.data.error)||'Could not post.',1); return; }
    else if(c==='purge'||c==='purgelast'){ var del=[];
      if(c==='purge'){ if(!a[0]) return outLine('Use /purge/<name>',1); var q2=a[0].toLowerCase(); del=LV.chat.filter(function(m){ return String(m.n).toLowerCase()===q2; }); if(!del.length) del=LV.chat.filter(function(m){ return String(m.n).toLowerCase().indexOf(q2)===0; }); if(!del.length) return outLine('"'+a[0]+'" has no messages in chat right now.',1); }
      else { var k2=Math.max(1,Math.min(50,+a[0]||5)); del=LV.chat.slice(-k2); }
      for(var di=0;di<del.length;di++) r=await CW.admin('chat',{act:'del',s:del[di].s}); if(r&&r.ok){ outLine('Deleted '+del.length+' message'+(del.length===1?'':'s')+'.'); PL.poll(); } }
    else if(c==='pin'||c==='unpin'){ var CH5=['general','trading','racing','help','live'], pch=(c==='pin'?a[1]:a[0])||'general'; if(CH5.indexOf(pch)<0) return outLine('Channels: '+CH5.join(', '),1); if(c==='pin'&&!a[0]) return outLine('Use /pin/<text>/<channel>',1);
      r=await CW.admin('chat',{act:'pin',ch:pch,t:c==='pin'?a[0]:'',n:'Owner'}); if(r.ok){ outLine(c==='pin'?'Pinned in '+pch+'.':'Unpinned in '+pch+'.'); PL.poll(); } }
    else if(c==='block'||c==='unblock'){ if(!a[0]) return outLine('Use /'+c+'/<word>',1); r=await CW.admin('chat',{act:'bw',w:a[0],on:c==='block'?1:0}); if(r.ok) outLine(c==='block'?'"'+a[0]+'" is now blocked in chat.':'"'+a[0]+'" is allowed again.'); }
    else if(c==='blocked'){ r=await CW.admin('chat',{act:'list'}); var bw=(r.ok&&r.data.bw)||[]; outLine(bw.length?'Blocked: '+bw.join(', '):'No extra blocked words.'); return; }
    else if(c==='chatstats'){ r=await CW.admin('chat',{act:'list'}); var td=(r.ok&&r.data.today)||{n:0,people:0,top:[]}; outLine(td.n+' messages today from '+td.people+' people'); if(td.top.length) outLine('Top: '+td.top.map(function(x){ return x[0]+' ('+x[1]+')'; }).join(', ')); return; }
    else if(c==='confetti'){ r=await CW.call('/api/chat/send',{id:CW.devId(),ch:'general',text:'/confetti '+(a.join(' / ')||'')},6000); if(r.ok){ outLine('Confetti sent.'); PL.poll(); } else outLine((r.data&&r.data.error)||'Could not send.',1); return; }
    else if(c==='clearpoll'){ r=await CW.admin('poll',{act:'clear'}); if(r.ok) outLine('Poll removed.'); }
    else if(c==='x2'){ var hh=Math.max(1,Math.min(168,+a[0]||1)); r=await CW.admin('banner',{text:'Double tokens for '+hh+' hour'+(hh===1?'':'s')+'!',hours:hh,x2:true}); if(r.ok) outLine('Double tokens on for '+hh+' h.'); }
    else if(c==='stats'){ r=await CW.admin('o2',{act:'dash'}); if(r.ok&&r.data) outLine(r.data.online+' online now · '+r.data.known+' players in total'+(r.data.counts?' · '+r.data.counts.clubs+' clubs · '+r.data.counts.levels+' Dash levels':'')); }
    else if(c==='find'||c==='ban'||c==='unban'){ if(!a[0]) return outLine('Use /'+c+'/<name>',1); r=await CW.admin('o2',{act:'find',q:a[0]}); var rows=(r.ok&&r.data&&r.data.rows)||[];
      if(c==='find'){ if(!rows.length) return outLine('Nobody called "'+a[0]+'".',1); rows.slice(0,6).forEach(function(x){ outLine(x.n+' · '+(x.on?'online':'offline')+(x.lv?' · level '+x.lv:'')+(x.ban?' · BANNED':'')); }); return; }
      var ex=rows.filter(function(x){ return String(x.n).toLowerCase()===a[0].toLowerCase(); }); if(ex.length===1) rows=ex; if(!rows.length) return outLine('Nobody called "'+a[0]+'".',1); if(rows.length>1) return outLine('More than one match: '+rows.slice(0,8).map(function(x){ return x.n; }).join(', '),1);
      r=await CW.admin('o2',{act:c,id:rows[0].id}); if(r.ok&&r.data&&r.data.ok!==false) outLine(rows[0].n+(c==='ban'?' is banned.':' is unbanned.')); else outLine((r.data&&r.data.error)||'Could not do that.',1); return; }
    else if(c==='endrace'){ r=await CW.admin('endrace'); if(r.ok) outLine('Race closed.'); }
    else if(c==='chat'){ if(!/^(on|off)$/i.test(a[0]||'')) return outLine('Use /chat/on or /chat/off',1); r=await CW.admin('chat',{act:a[0].toLowerCase()}); if(r.ok) outLine('Chat is '+a[0].toLowerCase()+'.'); }
    else if(c==='mod'||c==='unmod'){ if(!a[0]) return outLine('Use /'+c+'/<name>',1); u=findChatter(a[0]); if(u.err) return outLine(u.err,1); r=await CW.admin('chat',{act:'staff',p:u.p,on:c==='mod'?1:0,lvl:2}); if(r.ok) outLine(u.n+(c==='mod'?' is a moderator now.':' is no longer staff.')); }
    else if(c==='mute'||c==='unmute'||c==='helper'||c==='unhelper'){ if(!a[0]) return outLine('Use /'+c+'/<name>',1); u=findChatter(a[0]); if(u.err) return outLine(u.err,1);
      r=c==='mute'?await CW.admin('chat',{act:'mute',p:u.p,mins:+a[1]||10}):c==='unmute'?await CW.admin('chat',{act:'unmute',p:u.p}):await CW.admin('chat',{act:'staff',p:u.p,on:c==='helper'?1:0}); if(r.ok) outLine('Done: '+c+' '+u.n+'.'); }
    else return outLine('Unknown command "/'+c+'". Type /help.',1);
  } finally { O.busy=false; }
  if(!r) return; if(r.status===403) return expired(); if(!r.ok) outLine((r.data&&r.data.error)||'Could not do that.',1); else { PL.poll(); } }
function manage(id,name){
  var sh=CW.sheet('<div class="hd"><h2>'+esc(name)+'</h2><button class="x" data-close aria-label="Close">✕</button></div>'
    +'<h3 style="font-size:16px;margin:6px 0 8px">Gift</h3><div class="row"><select class="in" id="mK" style="width:170px"><option value="tokens">Tokens</option><option value="spins">Spins</option><option value="xp">XP</option><option value="x2">2× tokens (hours)</option><option value="skin">Pad skin</option></select><input class="in" id="mV" type="number" min="1" value="100" style="width:100px"></div>'
    +'<select class="in" id="mS" style="width:100%;margin-top:8px">'+allSk().map(function(i){ return '<option value="'+i+'">Skin: '+esc(PL.skins.name(i))+'</option>'; }).join('')+'</select>'
    +'<input class="in" id="mM" maxlength="80" placeholder="Message (optional)" style="width:100%;margin-top:8px"><button class="btn pri wide" data-m="gift" style="margin-top:8px">Send gift</button>'
    +'<h3 style="font-size:16px;margin:16px 0 8px">Title</h3><div class="row"><input class="in" id="mT" maxlength="16" placeholder="Shown next to their name (blank removes it)" style="flex:1"><button class="btn" data-m="title">Save</button></div>'
    +'<h3 style="font-size:16px;margin:16px 0 8px;color:#e5484d">Danger zone</h3><div class="row"><button class="btn" data-m="wr">Reset their ranks</button><button class="btn" data-m="wa" style="background:#e5484d;color:#fff">Delete account</button></div><p class="muted" style="font-size:12.5px;margin:6px 0 0">Ranks removes them from every leaderboard. Delete account erases them from the server and wipes the progress saved on their device. Tap twice to confirm.</p>'
    +'<h3 style="font-size:16px;margin:16px 0 8px">The Cubing Zone</h3><div class="row"><button class="btn" data-m="cc1">Make them a creator</button><button class="btn" data-m="cc0">Remove creator</button></div><h3 style="font-size:16px;margin:16px 0 8px">Mini admin</h3><div class="row"><button class="btn" data-m="ma1">Make Zhan Yi</button><button class="btn" data-m="ma2">Make Zhan Hong</button><button class="btn" data-m="ma0">Remove</button></div>');
  sh.addEventListener('click',async function(e){ var b=e.target.closest('[data-m]'); if(!b) return; var m=b.getAttribute('data-m'), r; b.disabled=true;
    if(m==='gift'){ var k=$('#mK',sh).value; r=await CW.admin('gift',{kind:k,value:k==='skin'?+$('#mS',sh).value:+$('#mV',sh).value||0,msg:$('#mM',sh).value.trim(),to:id}); }
    else if(m==='wr'||m==='wa'){ if(b.getAttribute('data-arm')!=='1'){ b.setAttribute('data-arm','1'); b.dataset.t0=b.textContent; b.textContent='Tap again to confirm'; b.disabled=false; setTimeout(function(){ b.removeAttribute('data-arm'); if(b.dataset.t0) b.textContent=b.dataset.t0; },4000); return; }
      r=await CW.admin('wipe',{to:id,what:m==='wr'?'ranks':'account'}); if(r&&r.ok){ CW.toast(m==='wr'?'Ranks reset.':'Account deleted.'); if(m==='wa') sh.close&&sh.close(); } b.removeAttribute('data-arm'); if(b.dataset.t0) b.textContent=b.dataset.t0; b.disabled=false; return; }
    else if(m==='title') r=await CW.admin('title',{to:id,title:$('#mT',sh).value.trim()});
    else if(/^ma[012]$/.test(m)) r=await CW.admin('gift',{kind:'miniadmin',value:+m.slice(2),to:id});
    else r=await CW.admin('gift',{kind:'creator',value:m==='cc1'?1:0,to:id});
    b.disabled=false; if(r.status===403){ sh.close(); return expired(); } if(r.ok){ CW.toast('Done.'); if(m!=='gift'&&m!=='title'){ sh.close(); load(); } } else CW.toast((r.data&&r.data.error)||'Could not do that.'); }); }
})();
