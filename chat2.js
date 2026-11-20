/* Chat v3: one inbox (public channels, friends, groups), threads with replies, reactions, stickers, instant sending. */
(function(){
'use strict';
if(typeof CW==='undefined'||!window.PL) return;
var $=CW.$, esc=CW.esc, PL=window.PL, LV=PL.live;
var C={open:false,kind:'pub',ch:'general',th:null,meta:{},msgs:[],q:0,more:false,typing:[],rd:{},rxo:{},sel:null,reply:null,pend:[],pn:0,panel:null,timer:0,el:null,last:'',lastList:'',metaBusy:0,dr:{},sec:'ch'};
var DESC={general:'Say hi to everyone',trading:'Trade pad skins',racing:'Talk about Cube Race',help:'Ask a question'};
var RX=['👍','❤️','😂','😮','🔥','🎉'], RXM=['👍','❤️','😂','😮','🔥','🎉','😢','😡','👏','🙏','💯','🤯','🥳','😎','🤔','👀','🏆','⚡','🧊','💀','🤝','✅','❌','🫡'];
var SK={flag:'🏁',fire:'🔥',trophy:'🏆',cool:'😎',bolt:'⚡',party:'🥳',crown:'👑',rocket:'🚀',mind:'🤯',heart:'❤️',thumb:'👍',clap:'👏',sleep:'😴',sweat:'😅',gg:'<b class="c3-gg">GG</b>',cube:'<svg viewBox="0 0 30 30" width="44" height="44"><g stroke="#111" stroke-width="1.2"><rect x="2" y="2" width="8" height="8" fill="#e1352b"/><rect x="11" y="2" width="8" height="8" fill="#fff"/><rect x="20" y="2" width="8" height="8" fill="#2650f5"/><rect x="2" y="11" width="8" height="8" fill="#f2b600"/><rect x="11" y="11" width="8" height="8" fill="#1f9a52"/><rect x="20" y="11" width="8" height="8" fill="#ff7a1a"/><rect x="2" y="20" width="8" height="8" fill="#2650f5"/><rect x="11" y="20" width="8" height="8" fill="#e1352b"/><rect x="20" y="20" width="8" height="8" fill="#fff"/></g></svg>'};
/* animated stickers and GIFs (drawn with CSS, so they load instantly and stay small) */
Object.keys(SK).forEach(function(k){ SK[k]='<span class="ak ak-'+k+'">'+SK[k]+'</span>'; });
var GF={
 solved:'<span class="gf gf-solved"><i class="gc"><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b></i><em>SOLVED!</em></span>',
 pb:'<span class="gf gf-pb"><i>✦</i><i>✦</i><i>✦</i><i>✦</i><em>NEW PB!</em></span>',
 go:'<span class="gf gf-go"><em>3</em><em>2</em><em>1</em><em>GO!</em></span>',
 wave:'<span class="gf gf-wave"><u>👋</u></span>',
 lol:'<span class="gf gf-lol"><u>😂</u><i>HA</i><i>HA</i></span>',
 wow:'<span class="gf gf-wow"><u>😮</u><i></i></span>',
 cry:'<span class="gf gf-cry"><u>😭</u><i></i><i></i></span>',
 think:'<span class="gf gf-think"><u>🤔</u><i>?</i></span>',
 hype:'<span class="gf gf-hype"><u>🔥</u><em>HYPE</em></span>',
 spin:'<span class="gf gf-spin"><u>🧊</u><i></i></span>',
 love:'<span class="gf gf-love"><u>❤️</u><i>❤️</i><i>❤️</i><i>❤️</i></span>',
 dance:'<span class="gf gf-dance"><u>🕺</u></span>'};
Object.keys(GF).forEach(function(k){ SK[k]=GF[k]; });

var AVC=['#2650f5','#e1352b','#1f9a52','#d99a00','#7a5cff','#ff7a1a','#12a3b8','#c43d8b'];
function hue(p){ var h=0; p=String(p||''); for(var i=0;i<p.length;i++) h=(h*31+p.charCodeAt(i))>>>0; return AVC[h%AVC.length]; }
function hm(t){ return new Date(t).toLocaleTimeString('en-MY',{hour:'numeric',minute:'2-digit'}); }
function dayLbl(t){ var d=new Date(t), n=new Date(), y=new Date(n-86400000); return d.toDateString()===n.toDateString()?'Today':d.toDateString()===y.toDateString()?'Yesterday':d.toLocaleDateString('en-MY',{day:'numeric',month:'short'}); }
function when(t){ if(!t) return ''; return new Date(t).toDateString()===new Date().toDateString()?hm(t):dayLbl(t); }
function readMap(){ return CW.lsJ('cw2_thread_read',{})||{}; }
function BLK(){ return CW.lsJ('cw_blk',[])||[]; }
function MUT(){ return CW.lsJ('cw_cmute',{})||{}; }
function mk(){ return C.kind==='pub'?'p:'+C.ch:'t:'+C.th; }
function pubSeen(){ return CW.lsJ('cw3_pubseen',{})||{}; }
function av(n,p,sz,af){ return '<span class="c3-av'+(af?' pf pf'+af:'')+'" style="background:'+hue(p)+';width:'+(sz||34)+'px;height:'+(sz||34)+'px;font-size:'+Math.round((sz||34)*.42)+'px">'+esc((n||'?').slice(0,1).toUpperCase())+'</span>'; }
function thOther(t){ var m=C.meta[t]; return m&&m.k==='dm'?m.m.filter(function(x){ return x.p!==LV.me; })[0]:null; }
function thName(t){ var m=C.meta[t]; if(!m) return 'Chat'; if(m.k==='gc') return m.n||'Group chat'; var o=thOther(t); return o?o.n:'Friend'; }
function isOn(p){ return (LV.fon||[]).indexOf(p)>=0; }
function unreadN(){ var R=readMap(), M=MUT(); return (LV.ts||[]).filter(function(t){ return t.q>(R[t.t]||0)&&!M['t:'+t.t]; }).length+((LV.fr&&LV.fr.req)||[]).length; }
function dmTid(p){ var hit=null; Object.keys(C.meta).forEach(function(k){ var m=C.meta[k]; if(m.k==='dm'&&m.m.some(function(x){ return x.p===p; })) hit=k; }); return hit; }
/* ---------- shell ---------- */
function open(tab){ if(C.open){ return; } C.open=true; PL.chat2Open=true; document.body.classList.add('c3-on');
  var d=document.createElement('div'); d.className='c3'; d.id='c3'; d.setAttribute('role','dialog'); d.setAttribute('aria-label','Chat'); C.el=d;
  d.innerHTML='<div class="c3-box"><nav class="c3-rail" id="c3Rail">'+SECS.map(function(x){ return '<button type="button" data-sec="'+x[0]+'" aria-label="'+x[2]+'"><span class="i">'+x[1]+'</span><small>'+x[2]+'</small><i class="c3-rb0" hidden></i></button>'; }).join('')+'<span class="sp"></span><button type="button" class="c3-rx0" data-x aria-label="Close chat"><span class="i">✕</span><small>Close</small></button></nav>'
   +'<aside class="c3-l"><header><b id="c3Lt">Channels</b><span class="c3-on" id="c3On"></span><span class="sp"></span><button type="button" class="c3-ib" data-new aria-label="New">＋</button><button type="button" class="c3-ib c3-xl" data-x aria-label="Close">✕</button></header><div class="c3-lf"><input id="c3Q" type="search" placeholder="Search" autocomplete="off"></div><div class="c3-ls" id="c3Ls"></div></aside>'
   +'<section class="c3-r"><header id="c3H"></header><div class="c3-ms" id="c3M"></div><button type="button" class="c3-nw" id="c3Nw" hidden>↓ New messages</button><div id="c3Rp"></div><div class="c3-pn" id="c3P" hidden></div><form class="c3-f" id="c3F"><button type="button" class="c3-ib" data-pn aria-label="Emoji and stickers">😀</button><button type="button" class="c3-ib" data-qk aria-label="Quick replies, polls and races">⚡</button><button type="button" class="c3-ib" data-photo aria-label="Send a photo">📷</button><input type="file" id="c3Fi" accept="image/*" hidden><textarea id="c3I" class="c3-in" maxlength="140" rows="1" placeholder="Message" autocomplete="off" autocorrect="on" enterkeyhint="send" name="c3msg" data-1p-ignore data-lpignore="true"></textarea><button type="button" class="c3-ib c3-mic" data-mic aria-label="Record a voice message">🎤</button><button type="submit" class="c3-sd" aria-label="Send"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 20.5v-6.8l9-1.7-9-1.7V3.5L22 12z"/></svg></button></form><div class="c3-emp" id="c3E"><div>💬</div><b>Pick a chat</b><span>Choose a channel or a friend on the left.</span></div></section><aside class="c3-inf" id="c3Inf" hidden></aside></div>';
  document.body.appendChild(d); d.addEventListener('click',click); document.addEventListener('keydown',key);
  var m=$('#c3M'); m.addEventListener('scroll',function(){ if(m.scrollHeight-m.scrollTop-m.clientHeight<60) $('#c3Nw').hidden=true; });
  $('#c3F').onsubmit=function(e){ e.preventDefault(); var i=$('#c3I'), v=i.value.trim(); if(!v) return; i.value=''; var dk0=dk(); if(dk0) delete C.dr[dk0]; C.ur=null; if(C.edit){ var ed=C.edit; C.edit=null; drawReply(); return saveEdit(ed,v); } if(window.CWCmd&&CWCmd(v)) return; if(window.CWCmdText){ var tx=CWCmdText(v); if(tx) v=tx; } send({text:v}); };
  $('#c3I').addEventListener('keydown',function(e){ if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&!e.defaultPrevented){ e.preventDefault(); var f=$('#c3F'); if(f.requestSubmit) f.requestSubmit(); else f.dispatchEvent(new Event('submit',{cancelable:true})); } });
  $('#c3I').addEventListener('input',function(){ typing(); var k=dk(); if(k&&!C.edit){ C.dr[k]=$('#c3I').value; } });
  $('#c3Q').addEventListener('input',function(){ C.q8=this.value.trim().toLowerCase(); C.lastList=''; drawList(); });
  swipe(m); kbFit(); C.inf=C.inf==null?matchMedia('(min-width:1366px)').matches:C.inf;
  var wide=matchMedia('(min-width:900px)').matches;
  if(tab==='fr'||tab==='gc'){ C.sec=tab==='fr'?'fr':'dm'; showList(); } else if(wide||tab==='pub'||!tab) { if(wide||tab==='pub') openPub(C.ch); else showList(); }
  loadMetas(); PL.poll(); draw(true); clearInterval(C.timer); C.timer=setInterval(tick,1400); }
function close(){ if(!C.open) return; C.open=false; if(window.visualViewport&&C.kbf){ visualViewport.removeEventListener('resize',C.kbf); visualViewport.removeEventListener('scroll',C.kbf); } PL.chat2Open=false; clearInterval(C.timer); document.removeEventListener('keydown',key); document.body.classList.remove('c3-on'); if(C.el) C.el.remove(); C.el=null; C.th=null; C.kind='pub'; C.last=''; C.lastList=''; C.msgs=[]; C.sel=null; C.reply=null; C.panel=null; seenPub(); }
function key(e){ if(e.key==='Escape'&&C.open&&!document.querySelector('.sheet')){ if(C.panel){ C.panel=null; drawPanel(); } else if(C.sel){ C.sel=null; draw(true); } else close(); } }
function showList(){ C.th=null; C.kind=null; C.el.classList.remove('in-th'); draw(true); }
function openPub(ch){ C.ur=(pubSeen()[ch]||0); C.edit=null; C.kind='pub'; C.ch=ch; C.th=null; C.sel=null; C.reply=null; C.msgs=[]; C.last=''; C.el.classList.add('in-th'); seenPub(); draw(true); loadDraft(); scrollEnd(); if(matchMedia('(min-width:900px)').matches) setTimeout(function(){ var i=$('#c3I'); if(i) i.focus(); },50); }
function seenPub(){ var s=pubSeen(), L=LV.chat.filter(function(m){ return (m.ch||'general')===C.ch; }); if(L.length){ s[C.ch]=L[L.length-1].s; CW.setJ('cw3_pubseen',s); } }
async function openTh(tid){ C.ur=readMap()[tid]||0; C.edit=null; C.kind='th'; C.th=tid; C.msgs=[]; C.q=0; C.more=false; C.typing=[]; C.rd={}; C.sel=null; C.reply=null; C.last=''; C.el.classList.add('in-th'); draw(true); loadDraft(); if(tid.indexOf('new:')===0){ if(matchMedia('(min-width:900px)').matches) $('#c3I').focus(); return; } await thPoll(true); scrollEnd(); }
function startDM(p,n){ var tid=dmTid(p); if(tid) return openTh(tid); var f='new:'+p; C.meta[f]={t:f,k:'dm',n:'',m:[{p:p,n:n},{p:LV.me,n:PL.name()}],mv:0,q:0}; return openTh(f); }
/* ---------- data ---------- */
async function loadMetas(){ if(C.metaBusy) return; C.metaBusy=1; try{ var need=(LV.ts||[]).filter(function(t){ return !C.meta[t.t]||C.meta[t.t].mv!==t.mv; }).slice(0,12);
  for(var i=0;i<need.length;i++){ var r=await CW.call('/api/th/get',{id:CW.devId(),t:need[i].t,since:1e12},6000); if(r.ok&&r.data&&r.data.th) C.meta[need[i].t]=r.data.th; }
  if(need.length) draw(false); }catch(e){} C.metaBusy=0; }
async function thPoll(first){ var tid=C.th; if(!tid||tid.indexOf('new:')===0) return; var r=await CW.call('/api/th/get',{id:CW.devId(),t:tid,since:C.q,open:1},6000); if(C.th!==tid||!C.open) return;
  if(!r.ok){ if(first){ CW.toast((r.data&&r.data.error)||'Could not open that chat.'); showList(); } return; }
  var d=r.data; C.meta[tid]=d.th; C.typing=d.typing||[]; C.rd=d.rd||{};
  (d.msgs||[]).forEach(function(m){ if(m.s>C.q){ C.msgs.push(m); C.q=m.s; } });
  var rx=d.rxs||{}, eds=d.eds||{}; C.msgs.forEach(function(m){ m.rx=rx[m.s]||[]; if(eds[m.s]!=null){ m.t=eds[m.s]; m.ed=1; } }); C.rxo={};
  if(!C.msgs.length&&!d.msgs.length) C.more=false; else if(first) C.more=!!d.more;
  var R=readMap(); R[tid]=Math.max(R[tid]||0,d.th.q); CW.setJ('cw2_thread_read',R); draw(first); }
async function older(){ var tid=C.th; if(!tid||!C.msgs.length) return; var r=await CW.call('/api/th/get',{id:CW.devId(),t:tid,before:C.msgs[0].s},6000); if(!r.ok||C.th!==tid) return; var a=r.data.msgs||[]; C.msgs=a.concat(C.msgs); C.more=!!r.data.more; var b=$('#c3M'), h=b.scrollHeight; draw(true); b.scrollTop=b.scrollHeight-h; }
function tick(){ if(!C.open||document.hidden) return; if(C.kind==='th') thPoll(false); }
var tyT=0; function typing(){ var n=Date.now(); if(C.kind==='pub'){ if(n-tyT<3000) return; tyT=n; CW.call('/api/chat/ty',{id:CW.devId(),ch:C.ch},4000); return; } if(C.kind!=='th'||!C.th||C.th.indexOf('new:')===0) return; if(n-tyT<3000) return; tyT=n; CW.call('/api/th/typing',{id:CW.devId(),t:C.th},4000); }
PL.onLive(function(){ if(!C.open){ badge(); return; } C.rxo={}; if(C.kind==='pub') seenPub(); loadMetas(); draw(false); badge(); });
function badge(){ var n=unreadN(); [].forEach.call(document.querySelectorAll('.shell-rail [data-k=chat],.shell-tabs [data-k=more]'),function(a){ a.classList.toggle('c3-dot',n>0); }); }
/* ---------- sending (instant: the message shows at once, then confirms) ---------- */
function send(b){ if(C.pl&&C.kind==='pub'){ b.pl=C.pl; C.pl=null; } try{ var af=+(localStorage.getItem('cw_pfx')||0); if(af&&C.kind==='pub') b.af=af; }catch(e){} var pm={id:'x'+(++C.pn),kind:C.kind,th:C.th,ch:C.ch,at:PL.now(),b:b,rp:C.reply,fail:0,p:LV.me,n:PL.name()}; if(C.reply) b.rp=C.reply.s; C.reply=null; C.panel=null; C.pend.push(pm); draw(true); scrollEnd(); post(pm); }
async function post(pm){ pm.fail=0; var r; try{
  if(pm.kind==='th'){ if(pm.th.indexOf('new:')===0) r=await CW.call('/api/th/dm',Object.assign({id:CW.devId(),p:pm.th.slice(4)},pm.b),6000); else r=await CW.call('/api/th/send',Object.assign({id:CW.devId(),t:pm.th},pm.b),6000); }
  else r=await CW.call('/api/chat/send',Object.assign({id:CW.devId(),ch:pm.ch},pm.b),6000); }catch(e){ r={ok:false}; }
  if(!C.open) return;
  if(r.ok){ C.pend=C.pend.filter(function(x){ return x!==pm; });
    if(pm.kind==='th'&&pm.th.indexOf('new:')===0){ delete C.meta[pm.th]; await PL.poll(); await loadMetas(); if(C.th===pm.th) openTh(r.data.t); return; }
    if(pm.kind==='th'){ if(C.th===pm.th) await thPoll(false); } else { await PL.poll(); } draw(true); scrollEnd(); }
  else { pm.fail=1; pm.err=(r.data&&r.data.error)||'Could not send.'; draw(true); } }
/* ---------- rendering ---------- */
function items(){ var mine=LV.me, L, out;
  if(C.kind==='pub'){ L=LV.chat.filter(function(m){ return (m.ch||'general')===C.ch; }); out=L.map(function(m){ var o=Object.assign({},m); o.rx=C.rxo[m.s]||((LV.rx||{})[m.s])||[]; return o; }); }
  else out=C.msgs.map(function(m){ var o=Object.assign({},m); if(C.rxo[m.s]) o.rx=C.rxo[m.s]; return o; });
  C.pend.filter(function(p){ return p.kind===C.kind&&(C.kind==='pub'?p.ch===C.ch:p.th===C.th); }).forEach(function(p){ out.push({s:p.id,p:mine,n:p.n,md:p.b.md||null,t:p.b.text||p.b.e||p.b.k,em:p.b.k?2:p.b.e?1:0,at:p.at,rp:p.rp,pend:1,fail:p.fail,err:p.err,rx:[]}); });
  var bl=BLK(); if(bl.length) out=out.filter(function(m){ return !m.p||m.p===mine||bl.indexOf(m.p)<0; });
  return out; }
function isMs(t){ return /\b(saya|awak|tak|nak|boleh|apa|dengan|yang|ini|itu|kau|aku|sudah|dah|lagi|macam|kat|je|lah|tu|ni|jom|kita|mana|bila|sangat|terima kasih|selamat)\b/i.test(t); }
function pollHtml(m,P){ var tot=P.c.reduce(function(a,b){ return a+b; },0); return '<div class="c3-bub c3-pl"><b>'+esc(String(m.t).replace(/^📊\s*/,''))+'</b>'+P.o.map(function(o,i){ var pc=tot?Math.round(P.c[i]*100/tot):0; return '<button type="button" class="c3-po'+(P.m===i?' me':'')+'" data-vote="'+esc(m.s)+'" data-o="'+i+'"><i style="width:'+pc+'%"></i><span>'+esc(o)+'</span><small>'+(P.m>=0?pc+'%':'')+'</small></button>'; }).join('')+'<small class="muted">'+tot+' vote'+(tot===1?'':'s')+(P.m<0?' · tap to vote':'')+'</small></div>'; }
function body(m){ var P=C.kind==='pub'&&LV.cpl&&LV.cpl[m.s]; if(P) return pollHtml(m,P); var tr=C.tr&&C.tr[m.s]; return body0(m)+(tr?'<div class="c3-trx">🌐 '+esc(tr)+'</div>':''); }
function fmtD(d){ d=d||0; return Math.floor(d/60)+':'+String(d%60).padStart(2,'0'); }
function mdHtml(m){ var u=CW.base()+'/api/media?k='+encodeURIComponent(m.md.k); if(m.md.y==='img') return '<button type="button" class="c3-img" data-img="'+esc(u)+'"><img src="'+esc(u)+'" alt="Photo from '+esc(m.n)+'" loading="lazy"'+(m.md.w&&m.md.h?' style="aspect-ratio:'+m.md.w+'/'+m.md.h+'"':'')+'></button>'; return '<div class="c3-bub c3-aud"><audio controls preload="none" src="'+esc(u)+'"></audio><small>🎤 '+fmtD(m.md.d)+'</small></div>'; }
function body0(m){ if(m.md&&m.md.k) return mdHtml(m); if(m.em===2) return '<div class="c3-stk">'+(SK[m.t]||esc(m.t))+'</div>'; if(m.em===1) return '<div class="c3-big"><span class="ae ae'+Math.max(0,(LV.emotes||[]).indexOf(m.t))+'">'+esc(m.t)+'</span></div>';
  var me=String(PL.name()||'').toLowerCase().replace(/\s+/g,''), t=esc(m.t).replace(/@[A-Za-z0-9_.\-]{2,24}/g,function(x){ var k=x.slice(1).toLowerCase().replace(/[.\-]+$/,''); return '<span class="c3-mn'+(k===me?' you':'')+'" data-tag="'+esc(x.slice(1))+'">'+x+'</span>'; }); t=t.replace(/\bRoom ([A-Z0-9]{4,6})\b/g,function(x,c){ return '<a class="c3-rj" href="#race/'+c+'">🏁 Join room '+c+'</a>'; }); return '<div class="c3-bub">'+t+'</div>'; }
function own(){ try{ return !!(localStorage.getItem('cw_owner_key')||localStorage.getItem('cw_owner_key2')); }catch(e){ return false; } }
function msgsHtml(L){ var h='', prev=null, mine=LV.me, last=null, gs=null; C.urDone=0;
  if(C.kind==='th'&&C.rd){ var oth=Object.keys(C.rd).map(function(k){ return C.rd[k]; }); var seen=oth.length?Math.min.apply(null,oth):0; var gm=C.meta[C.th]; if(gm&&gm.k==='gc'){ for(var g=L.length-1;g>=0;g--){ if(L[g].p===mine&&!L[g].pend){ gs={s:L[g].s,n:oth.filter(function(v){ return v>=L[g].s; }).length}; break; } } oth=[]; }
    for(var i=L.length-1;i>=0;i--){ if(L[i].p===mine&&!L[i].pend){ last=L[i].s<=seen&&seen>0?L[i].s:null; break; } } }
  if(C.kind==='th'&&C.more) h+='<button type="button" class="c3-ol" data-older>Load earlier messages</button>';
  L.forEach(function(m){ var isMe=!!mine&&m.p===mine, at=m.at||0, nd=!prev||new Date(prev.at||0).toDateString()!==new Date(at).toDateString(), first=nd||!prev||prev.p!==m.p||(at-(prev.at||0))>240000||!!prev.rp&&0;
    if(nd&&at) h+='<div class="c3-day">'+dayLbl(at)+'</div>';
    if(C.ur&&!C.urDone&&!isMe&&!m.pend&&+m.s>C.ur){ C.urDone=1; h+='<div class="c3-new"><span>New messages</span></div>'; }
    var sel=String(C.sel)===String(m.s)&&!m.pend, hit=m.mn&&mine&&m.mn.indexOf(mine)>=0;
    h+='<div class="c3-m'+(isMe?' me':'')+(first?' first':'')+(m.pend?' pend':'')+(m.fail?' fail':'')+(hit?' ping':'')+'" data-s="'+esc(m.s)+'">'
     +(!isMe?(first?'<button type="button" class="c3-avb" data-who="'+esc(m.p||'')+'" data-n="'+esc(m.n)+'">'+av(m.n,m.p,32,m.af)+'</button>':'<span class="c3-av0"></span>'):'')
     +'<div class="c3-c">'+(first&&!isMe?'<div class="c3-nm"><button type="button" data-who="'+esc(m.p||'')+'" data-n="'+esc(m.n)+'">'+esc(m.n)+'</button>'+(m.ct?'<span class="c3-tg">'+esc(m.ct)+'</span>':'')+(m.st?'<span class="c3-tg st">'+(m.st===2?'moderator':'staff')+'</span>':'')+(m.mt?'<span class="c3-tg mt">🎓 mentor</span>':'')+'<small>Lv '+(m.lv||0)+'</small></div>':'')
     +(m.rp?'<button type="button" class="c3-q" data-jump="'+esc(m.rp.s)+'"><b>'+esc(m.rp.n)+'</b><span>'+esc(m.rp.t)+'</span></button>':'')
     +'<div class="c3-bw" data-sel="'+esc(m.s)+'">'+body(m)+'</div>'
     +((m.rx&&m.rx.length)?'<div class="c3-rxs">'+m.rx.map(function(x){ return '<button type="button" class="c3-rp'+(x[2]?' me':'')+'" data-rx="'+esc(m.s)+'" data-e="'+esc(x[0])+'">'+x[0]+' <span>'+x[1]+'</span></button>'; }).join('')+'</div>':'')
     +(sel?'<div class="c3-act">'+(C.rxAll?RXM:RX).map(function(e){ return '<button type="button" data-rx="'+esc(m.s)+'" data-e="'+e+'">'+e+'</button>'; }).join('')+(C.rxAll?'':'<button type="button" class="c3-rxp" data-rxm aria-label="More reactions">＋</button>')+'<i></i>'+(isMe&&!m.em&&!m.md&&!m.pend&&PL.now()-(m.at||0)<900000?'<button type="button" class="t" data-edit="'+esc(m.s)+'">Edit</button>':'')+(m.pend?'':'<button type="button" class="t" data-save="'+esc(m.s)+'">'+(isSaved(m)?'★ Saved':'☆ Save')+'</button>')+'<button type="button" class="t" data-reply="'+esc(m.s)+'">Reply</button>'+(m.em||m.md?'':'<button type="button" class="t" data-copy="'+esc(m.s)+'">Copy</button><button type="button" class="t" data-tr="'+esc(m.s)+'">Translate</button>')+(!isMe&&m.p?'<button type="button" class="t" data-blk="'+esc(m.p)+'" data-bn="'+esc(m.n)+'">Block</button>':'')+(C.kind==='pub'&&!isMe&&PL.staffBtns?PL.staffBtns(m):'')+(C.kind==='pub'&&isMe&&!m.pend&&PL.now()-(m.at||0)<600000?'<button type="button" class="t" data-mdel="'+esc(m.s)+'">Delete</button>':'')+(C.kind==='pub'&&own()&&!m.pend&&!m.em?'<button type="button" class="t" data-mpin="'+esc(m.s)+'">📌 Pin</button>':'')+'</div>':'')
     +(m.fail?'<div class="c3-er">'+esc(m.err)+' <button type="button" data-retry="'+esc(m.s)+'">Retry</button> · <button type="button" data-del="'+esc(m.s)+'">Delete</button></div>':m.pend?'<small class="c3-tm">Sending…</small>':(at&&(first||isMe||sel)?'<small class="c3-tm">'+hm(at)+(m.ed?' · edited':'')+(last===m.s?' · Seen':'')+(gs&&gs.s===m.s&&gs.n?' · Seen by '+gs.n:'')+'</small>':''))
     +'</div></div>'; prev=m; });
  return h; }
function drawHead(){ var h=$('#c3H'), inT=C.kind==='pub'||C.kind==='th'; $('#c3F').hidden=!inT; $('#c3E').hidden=inT; $('#c3M').hidden=!inT; h.hidden=!inT; if(!inT) return;
  var title,sub,ic='';
  if(C.kind==='pub'){ title='# '+C.ch; sub=(DESC[C.ch]||'Public chat')+(LV.on?' · '+LV.online+' online':''); if(LV.cty&&LV.cty.length) sub=LV.cty.join(', ')+(LV.cty.length>1?' are':' is')+' typing…'; ic='<button type="button" class="c3-ib" data-find aria-label="Search">🔍</button>'; }
  else { var m=C.meta[C.th]; title=thName(C.th); if(m&&m.k==='gc'){ sub=m.m.length+' people · tap for members'; ic=''; } else { var o=thOther(C.th); sub=o&&isOn(o.p)?'Online now':'Friend'; if(C.typing&&C.typing.length) sub=C.typing.join(', ')+' typing…'; } }
  ic+='<button type="button" class="c3-ib" data-mute aria-label="Mute">'+(MUT()[mk()]?'🔕':'🔔')+'</button><button type="button" class="c3-ib'+(C.inf?' on':'')+'" data-inf aria-label="Info">ⓘ</button>';
  h.innerHTML='<button type="button" class="c3-ib c3-bk" data-back aria-label="Back">←</button><div class="c3-ht"><b>'+esc(title)+'</b><small>'+esc(sub)+'</small></div>'+ic+'<button type="button" class="c3-ib c3-xr" data-x aria-label="Close">✕</button>'; }
function drawMsgs(force){ if(C.kind!=='pub'&&C.kind!=='th') return; var L=items(), box=$('#c3M'), html;
  if(C.kind==='pub'&&LV.off) html='<div class="c3-es">Chat is turned off right now.</div>';
  else if(!L.length) html='<div class="c3-es"><div>👋</div><b>No messages yet</b><span>Be the first to say hi.</span><div class="c3-chips">'+(C.kind==='pub'?['Hi everyone!','Anyone up for a race?','What is your best time?']:['Hey!','Want to race?']).map(function(x){ return '<button type="button" data-q="'+esc(x)+'">'+esc(x)+'</button>'; }).join('')+'</div></div>';
  else html=msgsHtml(L);
  if(C.kind==='pub'){ var pn=(LV.pin||{})[C.ch||'general']; if(pn&&pn.t) html='<div class="c3-pin"><span>📌</span><div><small>Pinned'+(pn.n?' · '+esc(pn.n):'')+'</small><b>'+esc(pn.t)+'</b></div>'+(own()?'<button type="button" data-unpin aria-label="Unpin">✕</button>':'')+'</div>'+html; }
  var key=html+'|'+(C.typing||[]).join()+'|'+(C.reply?C.reply.s:''); if(!force&&key===C.last) return; C.last=key;
  var atEnd=box.scrollHeight-box.scrollTop-box.clientHeight<90, grew=C.lastN!=null&&L.length>C.lastN; C.lastN=L.length; var top=box.scrollTop;
  patch(box,html+(C.typing&&C.typing.length&&C.kind==='th'?'<div class="c3-ty"><i></i><i></i><i></i></div>':''));
  if(atEnd||force&&!C.keepScroll) box.scrollTop=box.scrollHeight; else { box.scrollTop=top; if(grew) $('#c3Nw').hidden=false; } }
function scrollEnd(){ var b=$('#c3M'); if(b){ b.scrollTop=b.scrollHeight; $('#c3Nw').hidden=true; setTimeout(function(){ b.scrollTop=b.scrollHeight; },60); } }
function drawReply(){ var r=$('#c3Rp'); if(C.edit){ r.innerHTML='<div class="c3-rb ed"><span><b>✏️ Editing message</b><small>'+esc(C.edit.t)+'</small></span><button type="button" data-noedit aria-label="Cancel">✕</button></div>'; return; } r.innerHTML=C.reply?'<div class="c3-rb"><span><b>Replying to '+esc(C.reply.n)+'</b><small>'+esc(C.reply.t)+'</small></span><button type="button" data-noreply aria-label="Cancel">✕</button></div>':''; }
function drawPanel(){ var p=$('#c3P'); p.hidden=!C.panel; if(!C.panel) return; var gf=C.panel==='gif', st=C.panel==='stk'||gf;
  p.innerHTML='<div class="c3-pt"><button type="button" data-panel="emo" aria-pressed="'+!st+'">Emoji</button><button type="button" data-panel="stk" aria-pressed="'+(st&&!gf)+'">Stickers</button><button type="button" data-panel="gif" aria-pressed="'+gf+'">GIFs</button></div><div class="c3-pg'+(gf?' gfs':'')+'">'+(st?(LV.stk||[]).filter(function(k){ return gf?!!GF[k]:!GF[k]; }).map(function(k){ return '<button type="button" class="s" data-k="'+esc(k)+'">'+(SK[k]||esc(k))+'</button>'; }).join(''):(LV.emotes||[]).map(function(e){ return '<button type="button" data-e="'+esc(e)+'">'+esc(e)+'</button>'; }).join(''))+'</div>'; }
function row(a,b,c,d,at,dot,onl,attr){ return '<button type="button" class="c3-li'+(attr.on?' on':'')+'" '+attr.a+'><span class="c3-avw">'+a+(onl?'<i class="c3-pr"></i>':'')+'</span><span class="c3-lt"><b>'+esc(b)+'</b><small>'+esc(c||'')+'</small></span><span class="c3-lr"><small>'+esc(d||'')+'</small>'+(dot?'<i class="c3-ud">'+(dot>1?dot:'')+'</i>':'')+'</span></button>'; }
function drawList(){ var R=readMap(), S=pubSeen(), h='', sec=C.sec||'ch', q8=C.q8||''; railBadges(); var tl=$('#c3Lt'); if(tl) tl.textContent=(SECS.filter(function(x){ return x[0]===sec; })[0]||SECS[0])[2]; [].forEach.call(C.el.querySelectorAll('[data-sec]'),function(b){ b.classList.toggle('on',b.getAttribute('data-sec')===sec); });
  function okq(){ var a=[].slice.call(arguments).join(' ').toLowerCase(); return !q8||a.indexOf(q8)>=0; }
  if(sec==='at'||sec==='sv'){ h=sec==='at'?mentionsHtml(okq):savedHtml(okq); if(h!==C.lastList){ C.lastList=h; $('#c3Ls').innerHTML=h; } return; }
  $('#c3On').textContent=LV.on?LV.online+' online':'connecting…';
  if(sec==='ch') h+=(LV.chs||['general']).filter(function(c){ return c!=='live'&&c!=='trading'&&okq(c,DESC[c]||''); }).map(function(c){ var L=LV.chat.filter(function(m){ return (m.ch||'general')===c; }), l=L[L.length-1], nn=MUT()['p:'+c]?0:L.filter(function(m){ return m.s>(S[c]||0)&&m.p!==LV.me; }).length;
    return row('<span class="c3-hash">#</span>',c,l?l.n+': '+(l.em===2?'Sticker':l.t):DESC[c]||'',l?when(l.at):'',(C.kind==='pub'&&C.ch===c)?0:Math.min(nn,99),0,0,{on:C.kind==='pub'&&C.ch===c,a:'data-pub="'+c+'"'}); }).join('');
  var F=LV.fr||{f:[],req:[]};
  if(sec==='dm'){ var onl=F.f.filter(function(x){ return isOn(x.p); }); if(onl.length&&!q8) h+='<div class="c3-sec">Online now</div><div class="c3-strip">'+onl.map(function(x){ return '<button type="button" data-dm="'+esc(x.p)+'" data-n="'+esc(x.n)+'"><span class="c3-avw">'+av(x.n,x.p,48)+'<i class="c3-pr"></i></span><small>'+esc(x.n)+'</small></button>'; }).join('')+'</div>'; }
  if(sec==='fr'&&F.req&&F.req.length) h+='<div class="c3-sec">Friend requests</div>'+F.req.map(function(x){ return '<div class="c3-rq">'+av(x.n,x.p,36)+'<span><b>'+esc(x.n)+'</b><small>Lv '+x.lv+'</small></span><button type="button" class="btn sm pri" data-fa="accept" data-p="'+esc(x.p)+'">Accept</button><button type="button" class="btn sm" data-fa="decline" data-p="'+esc(x.p)+'">No</button></div>'; }).join('');
  var T=(LV.ts||[]).slice().sort(function(a,b){ return b.l-a.l; });
  if(sec==='dm') h+='<div class="c3-sec">Chats</div>'+(T.length?T.filter(function(t){ return okq(thName(t.t),t.lt||''); }).map(function(t){ var m=C.meta[t.t], o=m&&m.k==='dm'?thOther(t.t):null, nm=thName(t.t), nn=t.q>(R[t.t]||0)?1:0;
    return row(m&&m.k==='gc'?'<span class="c3-grp">👥</span>':av(nm,o?o.p:t.t,40),nm,t.lt?((t.ln?t.ln+': ':'')+t.lt):'No messages yet',when(t.l),nn,0,o&&isOn(o.p),{on:C.kind==='th'&&C.th===t.t,a:'data-open="'+esc(t.t)+'"'}); }).join(''):'<p class="c3-hint">No private chats yet. Add a friend or start a group with +.</p>');
  var fr=F.f.filter(function(x){ return okq(x.n); });
  if(sec==='fr') h+='<div class="c3-sec">Friends · '+F.f.length+'</div>'+(fr.length?'':'<p class="c3-hint">No friends yet. Tap ＋ to add one with their friend code.</p>')+fr.map(function(x){ return row(av(x.n,x.p,40),x.n,'Lv '+x.lv+(isOn(x.p)?' · online':''),'',0,0,isOn(x.p),{on:C.th==='new:'+x.p,a:'data-dm="'+esc(x.p)+'" data-n="'+esc(x.n)+'"'}); }).join('');
  if(h!==C.lastList){ var ls=$('#c3Ls'), st=ls.scrollTop; C.lastList=h; ls.innerHTML=h; ls.scrollTop=st; } }
function draw(force){ if(!C.open) return; drawList(); drawHead(); drawMsgs(force); drawReply(); drawPanel(); drawInfo(); var i=$('#c3I'); if(i) i.placeholder=C.kind==='pub'?'Message #'+C.ch:C.kind==='th'?'Message '+thName(C.th):'Message'; }
var SECS=[['ch','#','Channels'],['dm','💬','Messages'],['fr','👥','Friends'],['at','@','Mentions'],['sv','★','Saved']];
function dk(){ return C.kind==='pub'?'p:'+C.ch:C.kind==='th'?'t:'+C.th:''; }
function loadDraft(){ var i=$('#c3I'); if(i) i.value=C.dr[dk()]||''; }
function patch(box,html){ var tmp=document.createElement('div'); tmp.innerHTML=html; var nw=[].slice.call(tmp.children), old=[].slice.call(box.children);
  for(var i=0;i<nw.length;i++){ var o=old[i]; if(o&&o.outerHTML===nw[i].outerHTML) continue; if(o) box.replaceChild(nw[i],o); else box.appendChild(nw[i]); }
  for(var j=nw.length;j<old.length;j++) old[j].remove(); }
function savedL(){ return CW.lsJ('cw_saved',[])||[]; }
function isSaved(m){ return savedL().some(function(x){ return x.k===dk()&&String(x.s)===String(m.s); }); }
function mentionsHtml(okq){ var me=LV.me, nm=String(PL.name()||'').toLowerCase().replace(/\s+/g,''); var L=LV.chat.filter(function(m){ return m.p!==me&&((m.mn&&me&&m.mn.indexOf(me)>=0)||(nm&&String(m.t).toLowerCase().replace(/\s+/g,'').indexOf('@'+nm)>=0)); }).filter(function(m){ return okq(m.n,m.t); }).slice(-60).reverse();
  return L.length?L.map(function(m){ return row(av(m.n,m.p,40),m.n+' · #'+(m.ch||'general'),m.t,when(m.at),0,0,0,{a:'data-goto="'+esc(m.ch||'general')+'" data-gs="'+esc(m.s)+'"'}); }).join(''):'<p class="c3-hint">When someone tags you with @'+esc(PL.name()||'your name')+', it shows up here.</p>'; }
function savedHtml(okq){ var L=savedL().filter(function(x){ return okq(x.n,x.t); }).slice().reverse();
  return L.length?L.map(function(x,i){ return '<div class="c3-svd">'+row(av(x.n,x.p,40),x.n+(x.c?' · '+x.c:''),x.t,when(x.at),0,0,0,{a:x.k.indexOf('p:')===0?'data-goto="'+esc(x.k.slice(2))+'" data-gs="'+esc(x.s)+'"':'data-open="'+esc(x.k.slice(2))+'"'})+'<button type="button" class="c3-ib" data-unsave="'+esc(x.k+'|'+x.s)+'" aria-label="Remove">✕</button></div>'; }).join(''):'<p class="c3-hint">Tap a message, then ☆ Save, to keep it here.</p>'; }
function railBadges(){ if(!C.el) return; var S=pubSeen(), M=MUT(), me=LV.me, F=LV.fr||{req:[]}, ch=0;
  (LV.chs||[]).forEach(function(c){ if(M['p:'+c]||c==='live'||c==='trading') return; ch+=LV.chat.filter(function(m){ return (m.ch||'general')===c&&m.s>(S[c]||0)&&m.p!==me; }).length; });
  var atS=+(localStorage.getItem('cw_atseen')||0), at=LV.chat.filter(function(m){ return m.mn&&me&&m.mn.indexOf(me)>=0&&m.s>atS; }).length;
  var V={ch:ch,dm:unreadN(),fr:(F.req||[]).length,at:at,sv:0}; [].forEach.call(C.el.querySelectorAll('.c3-rail [data-sec]'),function(b){ var n=V[b.getAttribute('data-sec')]||0, i=b.querySelector('.c3-rb0'); i.hidden=!n; i.textContent=n>99?'99+':n; }); }
function drawInfo(){ var p=$('#c3Inf'); if(!p) return; var wide=matchMedia('(min-width:1180px)').matches, inT=C.kind==='pub'||C.kind==='th'; p.hidden=!(C.inf&&inT); C.el.classList.toggle('has-inf',!p.hidden); if(p.hidden) return; var h='';
  if(C.kind==='pub'){ var pn=(LV.pin||{})[C.ch||'general'], act={}, now=PL.now(); LV.chat.forEach(function(m){ if((m.ch||'general')===C.ch&&now-(m.at||0)<900000&&m.p) act[m.p]={n:m.n,p:m.p}; });
    var A=Object.keys(act).map(function(k){ return act[k]; });
    h='<div class="c3-ih"><span class="c3-hash big">#</span><b>'+esc(C.ch)+'</b><small>'+esc(DESC[C.ch]||'Public chat')+'</small><small>'+(LV.on?LV.online+' online':'')+'</small></div>'
     +(pn&&pn.t?'<div class="c3-is"><h4>📌 Pinned</h4><p>'+esc(pn.t)+'</p></div>':'')
     +'<div class="c3-is"><h4>Active in the last 15 minutes · '+A.length+'</h4>'+(A.length?A.map(function(x){ return '<button type="button" class="c3-ip" data-who="'+esc(x.p)+'" data-n="'+esc(x.n)+'">'+av(x.n,x.p,30)+'<span>'+esc(x.n)+'</span>'+(isOn(x.p)?'<i class="c3-pr s"></i>':'')+'</button>'; }).join(''):'<p class="c3-hint">Quiet right now.</p>')+'</div>'
     +'<div class="c3-ia"><button type="button" class="btn sm" data-find>🔍 Search</button><button type="button" class="btn sm" data-mute>'+(MUT()[mk()]?'🔔 Unmute':'🔕 Mute')+'</button></div>'; }
  else { var m=C.meta[C.th]; if(m&&m.k==='gc'){ h='<div class="c3-ih"><span class="c3-grp big">👥</span><b>'+esc(thName(C.th))+'</b><small>'+m.m.length+' people</small></div><div class="c3-is"><h4>Members</h4>'+m.m.map(function(x){ return '<button type="button" class="c3-ip" data-who="'+esc(x.p)+'" data-n="'+esc(x.n)+'">'+av(x.n,x.p,30)+'<span>'+esc(x.n)+'</span>'+(isOn(x.p)?'<i class="c3-pr s"></i>':'')+'</button>'; }).join('')+'</div><div class="c3-ia"><button type="button" class="btn sm" data-ginfo>⚙️ Group settings</button><button type="button" class="btn sm" data-mute>'+(MUT()[mk()]?'🔔 Unmute':'🔕 Mute')+'</button></div>'; }
    else { var o=thOther(C.th)||{}; h='<div class="c3-ih">'+av(o.n||'',o.p||'',72)+'<b>'+esc(thName(C.th))+'</b><small>'+(o.p&&isOn(o.p)?'🟢 Online now':'Friend')+'</small></div><div class="c3-ia"><button type="button" class="btn sm" data-who="'+esc(o.p||'')+'" data-n="'+esc(o.n||'')+'">👤 Profile</button><button type="button" class="btn sm" data-mute>'+(MUT()[mk()]?'🔔 Unmute':'🔕 Mute')+'</button></div>'; } }
  if(h!==C.lastInf){ C.lastInf=h; p.innerHTML='<button type="button" class="c3-ib c3-ix" data-inf aria-label="Close info">✕</button>'+h; } }
async function saveEdit(ed,v){ var th=ed.kind==='th', r=await CW.call(th?'/api/th/edit':'/api/chat/edit',th?{id:CW.devId(),t:ed.th,s:ed.s,text:v}:{id:CW.devId(),s:ed.s,text:v},6000);
  if(!r.ok){ CW.toast((r.data&&r.data.error)||'Could not edit.'); return; } var L=th?C.msgs:LV.chat; L.forEach(function(m){ if(m.s===ed.s){ m.t=r.data.t; m.ed=1; } }); draw(true); }
function swipe(box){ var x0=0,y0=0,el=null,dx=0; box.addEventListener('touchstart',function(e){ var b=e.target.closest('.c3-m'); if(!b||b.classList.contains('pend')) return; el=b; x0=e.touches[0].clientX; y0=e.touches[0].clientY; dx=0; },{passive:true});
  box.addEventListener('touchmove',function(e){ if(!el) return; var x=e.touches[0].clientX-x0, y=e.touches[0].clientY-y0; if(Math.abs(y)>Math.abs(x)+6){ el.style.transform=''; el=null; return; } dx=Math.max(0,Math.min(80,x)); el.style.transform='translateX('+dx+'px)'; el.classList.toggle('sw',dx>60); },{passive:true});
  box.addEventListener('touchend',function(){ if(!el) return; var s=el.getAttribute('data-s'); el.style.transform=''; el.classList.remove('sw'); if(dx>60){ var m=find(s); if(m&&!m.pend){ C.reply={s:m.s,n:m.n,t:m.em===2?'Sticker':String(m.t).slice(0,60)}; C.edit=null; draw(true); $('#c3I').focus(); } } el=null; }); }
function kbFit(){ if(!window.visualViewport) return; C.kbf=function(){ if(!C.el) return; var v=visualViewport; C.el.style.height=v.height+'px'; C.el.style.top=v.offsetTop+'px'; }; visualViewport.addEventListener('resize',C.kbf); visualViewport.addEventListener('scroll',C.kbf); C.kbf(); }
/* ---------- actions ---------- */
async function react(s,e){ var th=C.kind==='th', L=items(), m=L.filter(function(x){ return String(x.s)===String(s); })[0]; if(!m||m.pend) return;
  var cur=(m.rx||[]).map(function(x){ return x.slice(); }), hit=cur.filter(function(x){ return x[0]===e; })[0];
  if(hit){ if(hit[2]){ hit[1]--; hit[2]=0; if(!hit[1]) cur=cur.filter(function(x){ return x!==hit; }); } else { hit[1]++; hit[2]=1; } } else cur.push([e,1,1]);
  C.rxo[m.s]=cur; C.sel=null; draw(true);
  var r=await CW.call(th?'/api/th/react':'/api/chat/react',th?{id:CW.devId(),t:C.th,s:m.s,e:e}:{id:CW.devId(),s:m.s,e:e},5000);
  if(r.ok&&r.data&&r.data.rx){ C.rxo[m.s]=r.data.rx; draw(false); } else { delete C.rxo[m.s]; CW.toast((r.data&&r.data.error)||'Could not react.'); draw(true); } }
function find(s){ return items().filter(function(x){ return String(x.s)===String(s); })[0]; }
function click(e){ var t;
  if(e.target.closest('[data-x]')) return close();
  if((t=e.target.closest('[data-sec]'))){ C.sec=t.getAttribute('data-sec'); C.q8=''; var q=$('#c3Q'); if(q) q.value=''; if(C.sec==='at'){ var mx=0; LV.chat.forEach(function(m){ mx=Math.max(mx,m.s); }); try{ localStorage.setItem('cw_atseen',mx); }catch(x){} } if(!matchMedia('(min-width:900px)').matches) showList(); C.lastList=''; return drawList(); }
  if(e.target.closest('[data-inf]')){ C.inf=!C.inf; C.lastInf=''; return draw(false); }
  if((t=e.target.closest('[data-goto]'))) return PL.chat2.goto(t.getAttribute('data-goto'),t.getAttribute('data-gs'));
  if(e.target.closest('[data-rxm]')){ C.rxAll=1; return draw(true); }
  if(e.target.closest('[data-noedit]')){ C.edit=null; $('#c3I').value=''; return drawReply(); }
  if((t=e.target.closest('[data-edit]'))){ var me=find(t.getAttribute('data-edit')); C.sel=null; if(me){ C.edit={s:me.s,t:me.t,kind:C.kind,th:C.th}; C.reply=null; var ii=$('#c3I'); ii.value=me.t; draw(true); ii.focus(); } return; }
  if((t=e.target.closest('[data-save]'))){ var ms=find(t.getAttribute('data-save')), L=savedL(), k=dk(); C.sel=null; if(ms){ var ix=L.findIndex(function(x){ return x.k===k&&String(x.s)===String(ms.s); }); if(ix>=0){ L.splice(ix,1); CW.toast('Removed from Saved.'); } else { L.push({k:k,s:ms.s,n:ms.n,p:ms.p,t:ms.em===2?'Sticker':String(ms.t),at:ms.at,c:C.kind==='pub'?'#'+C.ch:thName(C.th)}); if(L.length>100) L.shift(); CW.toast('Saved. Find it under ★ Saved.'); } CW.setJ('cw_saved',L); } C.lastList=''; return draw(true); }
  if((t=e.target.closest('[data-unsave]'))){ var kk=t.getAttribute('data-unsave').split('|'), L2=savedL().filter(function(x){ return !(x.k===kk[0]&&String(x.s)===kk[1]); }); CW.setJ('cw_saved',L2); C.lastList=''; return drawList(); }
  if(e.target.closest('[data-back]')){ if(C.panel){ C.panel=null; } return showList(); }
  if((t=e.target.closest('[data-pub]'))) return openPub(t.getAttribute('data-pub'));
  if((t=e.target.closest('[data-open]'))) return openTh(t.getAttribute('data-open'));
  if((t=e.target.closest('[data-dm]'))) return startDM(t.getAttribute('data-dm'),t.getAttribute('data-n'));
  if(e.target.closest('[data-new]')) return newMenu();
  if(e.target.closest('[data-ginfo]')) return groupInfo();
  if(e.target.closest('[data-older]')) return older();
  if(e.target.closest('[data-pn]')){ C.panel=C.panel?null:'emo'; return drawPanel(); }
  if((t=e.target.closest('[data-panel]'))){ C.panel=t.getAttribute('data-panel'); return drawPanel(); }
  if((t=e.target.closest('#c3P [data-e]'))) return send({e:t.getAttribute('data-e')});
  if((t=e.target.closest('#c3P [data-k]'))) return send({k:t.getAttribute('data-k')});
  if((t=e.target.closest('[data-q]'))) return send({text:t.getAttribute('data-q')});
  if((t=e.target.closest('[data-fa]'))) return friendAct(t.getAttribute('data-fa'),t.getAttribute('data-p'));
  if((t=e.target.closest('.c3-act [data-rx],.c3-rxs [data-rx]'))) return react(t.getAttribute('data-rx'),t.getAttribute('data-e'));
  if((t=e.target.closest('[data-reply]'))){ var m=find(t.getAttribute('data-reply')); if(m){ C.reply={s:m.s,n:m.n,t:m.em===2?'Sticker':String(m.t).slice(0,60)}; C.sel=null; draw(true); $('#c3I').focus(); } return; }
  if((t=e.target.closest('[data-copy]'))){ var m2=find(t.getAttribute('data-copy')); if(m2) CW.copy(m2.t,t); C.sel=null; return draw(true); }
  if((t=e.target.closest('[data-mdel]'))){ var sq=+t.getAttribute('data-mdel'); C.sel=null; CW.call('/api/chat/del',{id:CW.devId(),s:sq},6000).then(function(r){ if(r.ok){ LV.chat=LV.chat.filter(function(x){ return x.s!==sq; }); CW.toast('Message deleted.'); } else CW.toast((r.data&&r.data.error)||'Could not delete.'); draw(true); }); return; }
  if((t=e.target.closest('[data-mpin]'))){ var m3=find(t.getAttribute('data-mpin')); C.sel=null; if(m3) CW.admin('chat',{act:'pin',ch:C.ch||'general',t:m3.t,n:m3.n}).then(function(r){ CW.toast(r.ok?'Pinned.':'Owner only.'); PL.poll(); }); return draw(true); }
  if(e.target.closest('[data-unpin]')){ CW.admin('chat',{act:'pin',ch:C.ch||'general',t:''}).then(function(r){ CW.toast(r.ok?'Unpinned.':'Owner only.'); PL.poll(); }); return; }
  if(e.target.closest('[data-noreply]')){ C.reply=null; return draw(true); }
  if((t=e.target.closest('[data-retry]'))){ var pm=C.pend.filter(function(x){ return x.id===t.getAttribute('data-retry'); })[0]; if(pm){ pm.fail=0; draw(true); post(pm); } return; }
  if((t=e.target.closest('[data-del]'))){ C.pend=C.pend.filter(function(x){ return x.id!==t.getAttribute('data-del'); }); return draw(true); }
  if((t=e.target.closest('[data-jump]'))){ var el=C.el.querySelector('[data-s="'+t.getAttribute('data-jump')+'"]'); if(el){ el.scrollIntoView({block:'center',behavior:'smooth'}); el.classList.add('flash'); setTimeout(function(){ el.classList.remove('flash'); },1200); } return; }
  if((t=e.target.closest('[data-who]'))) return who(t.getAttribute('data-who'),t.getAttribute('data-n'));
  if(e.target.closest('#c3Nw')) return scrollEnd();
  if((t=e.target.closest('[data-sel]'))){ var s=t.getAttribute('data-sel'); if(String(s).charAt(0)==='x') return; C.sel=String(C.sel)===s?null:s; C.rxAll=0; return draw(true); } }
function isFriend(p){ return !!(LV.fr&&LV.fr.f.some(function(x){ return x.p===p; })); }
function who(p,n){ if(!p||p===LV.me) return; var fr=isFriend(p);
  var sh=CW.sheet('<div class="hd"><h2>'+esc(n)+'</h2><button class="x" data-close aria-label="Close">✕</button></div><div class="row" style="gap:8px;flex-wrap:wrap">'+(fr?'<button class="btn pri" data-w="dm">Message</button><button class="btn" data-w="remove">Remove friend</button>':'<button class="btn pri" data-w="req">Add friend</button>')+'<button class="btn" data-w="gc">Start a group</button></div>');
  sh.addEventListener('click',function(e){ var b=e.target.closest('[data-w]'); if(!b) return; var a=b.getAttribute('data-w'); sh.close(); if(a==='dm') startDM(p,n); else if(a==='gc') newGroup(p); else friendAct(a,p); }); }
async function friendAct(act,p){ if(!p){ CW.toast('Enter a friend code.'); return; } var r=await CW.call('/api/friend',{id:CW.devId(),act:act,p:p},6000);
  if(!r.ok){ CW.toast((r.data&&r.data.error)||'Could not do that.'); return; }
  CW.toast(act==='req'?(r.data.rel==='friend'?'You are now friends!':'Friend request sent.'):act==='accept'?'You are now friends!':act==='remove'?'Removed.':'Done.'); LV.fr=null; await PL.poll(); draw(true); }
function newMenu(){ var sh=CW.sheet('<div class="hd"><h2>New</h2><button class="x" data-close aria-label="Close">✕</button></div><div class="shell-sheet"><a href="#" data-n="f"><span><b>Add a friend</b><small>With their code, or from people online</small></span></a><a href="#" data-n="g"><span><b>New group</b><small>Up to 10 people</small></span></a></div>');
  sh.addEventListener('click',function(e){ var a=e.target.closest('[data-n]'); if(!a) return; e.preventDefault(); sh.close(); if(a.getAttribute('data-n')==='f') addFriend(); else newGroup(); }); }
function codes(v){ return String(v||'').toLowerCase().split(/[\s,]+/).map(function(x){ return x.replace(/[^a-z0-9]/g,''); }).filter(Boolean); }
async function onlineList(box,q,skip,btn){ box.innerHTML='<p class="muted" style="font-size:13px">Loading people online…</p>';
  var r=await CW.call('/api/online',{id:CW.devId(),q:q||''},6000), L=r.ok?(r.data.list||[]).filter(function(x){ return (skip||[]).indexOf(x.p)<0&&x.p!==LV.me; }):[];
  box.innerHTML=L.length?L.map(function(x){ return btn?'<div class="c3-rq">'+av(x.n,x.p,34)+'<span><b>'+esc(x.n)+'</b><small>Lv '+x.lv+'</small></span><button type="button" class="btn sm" data-a="'+btn+'" data-p="'+esc(x.p)+'">'+(btn==='req'?'Add':'Add')+'</button></div>':'<label class="c3-rq">'+av(x.n,x.p,34)+'<span><b>'+esc(x.n)+'</b><small>Lv '+x.lv+'</small></span><input type="checkbox" value="'+esc(x.p)+'"></label>'; }).join(''):'<p class="muted" style="font-size:13px">'+(r.ok?'Nobody else matches right now.':'Could not load who is online.')+'</p>'; }
function addFriend(){ var me=(LV.me||'').toUpperCase();
  var sh=CW.sheet('<div class="hd"><h2>Add a friend</h2><button class="x" data-close aria-label="Close">✕</button></div><div class="pnl" style="padding:14px"><div class="eyebrow">Your friend code</div><div class="row" style="margin-top:4px"><b class="mono" style="font-size:22px;letter-spacing:.08em">'+esc(me||'…')+'</b><span class="sp"></span><button class="btn sm" id="fcCp" type="button">Copy</button></div></div>'
   +'<div class="row" style="margin-top:12px"><input class="in mono" id="fcIn" maxlength="12" placeholder="Friend’s code" style="flex:1;text-transform:uppercase"><button class="btn pri" id="fcGo" type="button">Add</button></div><div class="eyebrow" style="margin:16px 0 6px">People online now</div><input class="in" id="fcQ" placeholder="Search a name" style="width:100%;margin-bottom:6px"><div id="fcOn" style="max-height:240px;overflow:auto"></div>');
  $('#fcCp',sh).onclick=function(){ CW.copy(me,this); }; $('#fcGo',sh).onclick=function(){ friendAct('req',($('#fcIn',sh).value||'').trim().toLowerCase()); };
  var box=$('#fcOn',sh), qT=0; onlineList(box,'',[],'req'); $('#fcQ',sh).oninput=function(){ var v=this.value.trim(); clearTimeout(qT); qT=setTimeout(function(){ onlineList(box,v,[],'req'); },300); };
  box.addEventListener('click',function(e){ var b=e.target.closest('[data-a]'); if(b) friendAct('req',b.getAttribute('data-p')); }); }
function newGroup(pre){ var F=(LV.fr&&LV.fr.f)||[];
  var sh=CW.sheet('<div class="hd"><h2>New group</h2><button class="x" data-close aria-label="Close">✕</button></div><div class="field"><label>Group name</label><input class="in" id="gN" maxlength="24" placeholder="Group chat"></div>'
   +(F.length?'<div class="eyebrow" style="margin:10px 0 6px">Friends</div>'+F.map(function(x){ return '<label class="c3-rq">'+av(x.n,x.p,34)+'<span><b>'+esc(x.n)+'</b></span><input type="checkbox" value="'+esc(x.p)+'"'+(x.p===pre?' checked':'')+'></label>'; }).join(''):'')
   +'<div class="field" style="margin-top:10px"><label>Or add by code</label><input class="in mono" id="gC" placeholder="e.g. VKAJIC52 81GHSQJJ" value="'+(pre&&!F.some(function(x){ return x.p===pre; })?esc(pre.toUpperCase()):'')+'" style="text-transform:uppercase"></div>'
   +'<div class="eyebrow" style="margin:10px 0 6px">People online now</div><div id="gOn" style="max-height:200px;overflow:auto"></div><button class="btn pri wide" id="gGo" type="button" style="margin-top:12px">Create group</button>');
  onlineList($('#gOn',sh),'',F.map(function(x){ return x.p; }));
  $('#gGo',sh).onclick=async function(){ var ps=[].map.call(sh.querySelectorAll('input[type=checkbox]:checked'),function(i){ return i.value; }).concat(codes($('#gC',sh).value)).filter(function(x,i,a){ return x!==LV.me&&a.indexOf(x)===i; }).slice(0,9); if(!ps.length){ CW.toast('Add at least one person.'); return; }
    var r=await CW.call('/api/th/gc',{id:CW.devId(),act:'create',name:$('#gN',sh).value.trim(),ps:ps},6000); if(!r.ok){ CW.toast((r.data&&r.data.error)||'Could not create the group.'); return; }
    sh.close(); C.meta[r.data.t]=r.data.th; await PL.poll(); openTh(r.data.t); }; }
function groupInfo(){ var m=C.meta[C.th]; if(!m||m.k!=='gc') return; var own=m.own===LV.me, tid=C.th;
  var sh=CW.sheet('<div class="hd"><h2>'+esc(m.n)+'</h2><button class="x" data-close aria-label="Close">✕</button></div><div class="eyebrow">'+m.m.length+' people</div>'
   +m.m.map(function(x){ return '<div class="c3-rq">'+av(x.n,x.p,34)+'<span><b>'+esc(x.n)+'</b>'+(x.p===m.own?'<small>Owner</small>':'')+'</span>'+(own&&x.p!==LV.me?'<button type="button" class="btn sm" data-g="kick" data-p="'+esc(x.p)+'">Remove</button>':'')+'</div>'; }).join('')
   +'<div class="row" style="margin-top:12px"><input class="in mono" id="gAc" placeholder="Add by code" style="flex:1;text-transform:uppercase"><button class="btn sm pri" type="button" data-g="addcode">Add</button></div><div class="eyebrow" style="margin:12px 0 6px">People online</div><div id="gIo" style="max-height:180px;overflow:auto"></div><button class="btn wide" type="button" data-g="leave" style="margin-top:14px">Leave group</button>');
  onlineList($('#gIo',sh),'',m.m.map(function(x){ return x.p; }),'add');
  sh.addEventListener('click',async function(e){ var b=e.target.closest('[data-g],[data-a]'); if(!b) return; var a=b.getAttribute('data-g')||b.getAttribute('data-a'), x={id:CW.devId(),act:a,t:tid};
    if(a==='add') x.ps=[b.getAttribute('data-p')]; if(a==='addcode'){ x.act='add'; x.ps=codes($('#gAc',sh).value); if(!x.ps.length){ CW.toast('Enter a code.'); return; } } if(a==='kick') x.p=b.getAttribute('data-p');
    var r=await CW.call('/api/th/gc',x,6000); if(!r.ok){ CW.toast((r.data&&r.data.error)||'Could not do that.'); return; } sh.close();
    if(a==='leave'){ delete C.meta[tid]; await PL.poll(); showList(); } else { C.meta[tid].mv=-1; await loadMetas(); thPoll(false); } }); }
PL.c3={C:C,draw:draw,send:send,find:find,mk:mk,MUT:MUT,BLK:BLK,isMs:isMs};
PL.chat2={open:open,close:close,goto:function(ch,sq){ if(!C.open) open(); setTimeout(function(){ try{ openPub(ch||'general'); }catch(e){} var n=0; (function f(){ var el=C.el&&C.el.querySelector('.c3-m[data-s="'+sq+'"]'); if(el){ el.scrollIntoView({block:'center'}); el.classList.add('flash'); setTimeout(function(){ el.classList.remove('flash'); },1600); } else if(++n<12) setTimeout(f,250); })(); },120); }};
window.addEventListener('pageshow',badge);
})();
