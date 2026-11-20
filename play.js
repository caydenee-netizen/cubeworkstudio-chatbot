/* /play — Cuber Tools, rebuilt. Six tools: Timer, Learn CFOP, Cube Race, Garage, Clubs & Trade, Rewards.
   Chat is the floating button. Every player's progress lives in the same localStorage keys as before. */
(function(){
'use strict';
var $=CW.$, $$=CW.$$, esc=CW.esc, ls=CW.ls, money=CW.money;
var PL=window.PL={}, app=$('#app');
var SKINS=window.PL_SKINS||[];

/* ================= tokens ================= */
var FORGE=[20,21,22,23,24], OWNS=[25,26,27];
PL.tok=function(){ return CW.tokens(); };
function setTok(n){ ls('cw_arcpts',String(Math.max(0,Math.round(n)))); hud(); }
PL.add=function(n){ n=Math.round(+n||0); if(n){ setTok(PL.tok()+n); if(n>0) ecoAdd('e',n); } };
function ecoAdd(k,n){ try{ var o=JSON.parse(localStorage.getItem('cw_eco')||'{}')||{}; o[k]=(o[k]||0)+n; localStorage.setItem('cw_eco',JSON.stringify(o)); }catch(e){} }
PL.spend=function(n){ n=Math.round(+n||0); if(PL.tok()<n) return false; setTok(PL.tok()-n); if(n>0) ecoAdd('s',n); return true; };
PL.x2Until=function(){ return Math.max(+ls('cw_tok_2x')||0, (PL.live&&PL.live.x2)||0); };
PL.setX2=function(h){ ls('cw_tok_2x',String(Math.max(Date.now(),+ls('cw_tok_2x')||0)+h*3600000)); hud(); };
PL.mult=function(){ var c=curSkin(), m=1; if(c&&hasSkin(c)){ if(OWNS.indexOf(c)>=0) m=5; else if(FORGE.indexOf(c)>=0) m=3; } if(m<2&&Date.now()<PL.x2Until()) m=2; return m; };
PL.award=function(n){ n=Math.round((+n||0)*PL.mult()); PL.add(n); return n; };

/* ================= pad skins ================= */
function skinsOwned(){ var a=CW.lsJ('cw_skins_unlocked',[0]); return Array.isArray(a)?a:[0]; }
function hasSkin(i){ return i===0||skinsOwned().indexOf(i)>=0; }
function curSkin(){ var c=+ls('cw_tmr_skin')||0; return hasSkin(c)?c:0; }
function unlockSkin(i,ed){ var a=skinsOwned(); if(a.indexOf(i)<0){ a.push(i); CW.setJ('cw_skins_unlocked',a); } if(ed){ var o=CW.lsJ('cw_forge_ed',{})||{}; if(!o[i]){ o[i]=+ed; CW.setJ('cw_forge_ed',o); } } }
function lockSkin(i){ var a=skinsOwned().filter(function(x){ return x!==i; }); if(a.indexOf(0)<0) a.unshift(0); CW.setJ('cw_skins_unlocked',a); if(+ls('cw_tmr_skin')===i) ls('cw_tmr_skin','0'); }
function skinOf(i){ for(var k=0;k<SKINS.length;k++) if(SKINS[k].i===i) return SKINS[k]; return null; }
PL.skins={list:SKINS,owned:skinsOwned,has:hasSkin,cur:curSkin,unlock:unlockSkin,lock:lockSkin,of:skinOf,forge:FORGE,owner:OWNS,
  name:function(i){ var s=skinOf(+i); return s?s.n:('#'+i); }, css:function(i){ var s=skinOf(+i); return s?s.css:'#333'; }};

/* ================= XP and levels (same maths as before) ================= */
var MAXL=3000, XP_MIN=35, XP_CAP=1200;
var SKIN_AT={5:1,8:2,11:3,14:4,18:5,22:6,26:7,30:8,35:9,40:10,45:11,50:12,60:13,70:14,80:15,90:16}, DBL_AT=[7,15,25,40,60,80,100];
function xpFor(ms){ return ms<7000?125:ms<10000?100:ms<12000?60:ms<15000?40:ms<20000?25:10; }
function need(L){ L=Math.max(1,Math.min(MAXL-1,L)); return Math.round(XP_MIN*Math.pow(XP_CAP/XP_MIN,(L-1)/(MAXL-2))); }
function levelOf(xp){ var L=1,r=Math.max(0,xp); while(L<MAXL&&r>=need(L)){ r-=need(L); L++; } return L>=MAXL?{L:MAXL,into:0,need:0,max:true}:{L:L,into:r,need:need(L)}; }
function reward(L){ return {tokens:10+5*Math.min(L,200),spins:L%3===0?Math.min(5,1+Math.floor(L/12)):0,skin:SKIN_AT[L]!=null?SKIN_AT[L]:null,dbl:DBL_AT.indexOf(L)>=0}; }
function rewardTxt(r){ var a=['+'+r.tokens+' tokens']; if(r.spins) a.push(r.spins+' spin'+(r.spins>1?'s':'')); if(r.skin!=null) a.push('pad skin '+PL.skins.name(r.skin)); if(r.dbl) a.push('2× tokens for 24h'); return a.join(' · '); }
function grant(L){ var r=reward(L); PL.add(r.tokens); if(r.spins) addSpins(r.spins); if(r.skin!=null) unlockSkin(r.skin); if(r.dbl) PL.setX2(24); return r; }
function allSolves(){ var d=CW.lsJ('cw_timer',{})||{}, sv=d.solves||{}, n=[]; Object.keys(sv).forEach(function(k){ (sv[k]||[]).forEach(function(s){ if(s&&typeof s.t==='number') n.push(s.t); }); }); return n; }
function xpState(){ var s=CW.lsJ('cw_xp',null); if(s&&typeof s.xp==='number') return s;
  var ts=allSolves(), xp=0; ts.forEach(function(t){ xp+=xpFor(t); }); var L=levelOf(xp).L;
  s={xp:xp,lv:L,conv:ts.length}; CW.setJ('cw_xp',s); for(var i=2;i<=L;i++) grant(i); return s; }
PL.level=function(){ return levelOf(xpState().xp); };
PL.addXP=function(n){ n=Math.round(+n||0); if(!n) return 0; var c=curSkin(); if(c&&OWNS.indexOf(c)>=0&&hasSkin(c)) n*=3;
  var s=xpState(), before=s.lv||levelOf(s.xp).L; s.xp+=n; var after=levelOf(s.xp).L, got=[];
  for(var L=before+1;L<=after;L++) got.push({L:L,r:grant(L)}); s.lv=Math.max(before,after); CW.setJ('cw_xp',s); hud();
  if(got.length) levelUp(got); return n; };
function levelUp(got){ var last=got[got.length-1];
  CW.sheet('<div class="hd"><h2>Level '+last.L+'!</h2><button class="x" data-close aria-label="Close">✕</button></div>'
    +got.map(function(g){ return '<p style="margin:6px 0"><b class="mono">Lv '+g.L+'</b> · '+esc(rewardTxt(g.r))+'</p>'; }).join('')
    +'<button class="btn pri wide" data-close style="margin-top:12px">Nice</button>'); }
PL.xp={xpFor:xpFor,need:need,levelOf:levelOf,reward:reward,rewardTxt:rewardTxt,state:xpState};

/* ================= spins ================= */
function dayKey(){ var d=new Date(); return ''+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0'); }
function spinState(){ var s=Object.assign({day:'',spins:0,extra:0},CW.lsJ('cw_gacha',{})||{}); if(s.day!==dayKey()){ s.day=dayKey(); s.spins=0; } return s; }
function addSpins(n){ var s=spinState(); s.extra=Math.max(0,(s.extra||0)+(n||1)); CW.setJ('cw_gacha',s); }
/* daily free gift: one claim per day; a streak of consecutive days adds a bonus */
function giftState(){ return Object.assign({day:'',streak:0},CW.lsJ('cw_dgift',{})||{}); }
function dayKeyAgo(n){ var d=new Date(); d.setDate(d.getDate()-n); return ''+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0'); }
PL.giftReady=function(){ return giftState().day!==dayKey(); };
function frz(){ return Math.max(0,Math.min(2,+(localStorage.getItem('cw_frz')||0)||0)); }
PL.freeze={n:frz,add:function(k){ try{ localStorage.setItem('cw_frz',String(Math.min(2,frz()+(k||1)))); }catch(e){} }};
function giftNext(){ var g=giftState(), fz=false; var st=g.day===dayKeyAgo(1)?g.streak+1:(g.day===dayKey()?g.streak:(g.day===dayKeyAgo(2)&&frz()>0&&g.streak>1?(fz=true,g.streak+1):1)); return {streak:st,amt:30+10*Math.min(6,st-1),frz:fz}; }
PL.giftClaim=function(){ if(!PL.giftReady()) return 0; var n=giftNext(); var got=PL.award(n.amt); if(n.frz){ try{ localStorage.setItem('cw_frz',String(frz()-1)); }catch(e){} CW.toast('🧊 A streak freeze saved your '+(n.streak-1)+'-day streak!'); } if(n.streak>0&&n.streak%7===0) PL.freeze.add(1); CW.setJ('cw_dgift',{day:dayKey(),streak:n.streak}); if(CW.push&&CW.push.on('player')) CW.call('/api/gift/daily',{id:CW.devId(),day:dayKey()},6000); return got; };
PL.spinsLeft=function(){ var s=spinState(); return (s.spins<1?1:0)+(s.extra||0); };
PL.useSpin=function(){ var s=spinState(); if(s.spins<1) s.spins=1; else if(s.extra>0) s.extra--; else return false; CW.setJ('cw_gacha',s); return true; };
PL.addSpins=addSpins;

/* ================= name ================= */
PL.name=function(){ return ls('cw_handle')||('Cuber'+CW.devId().slice(-4).toUpperCase()); };

/* ================= header ================= */
function hud(){ var t=$('#hTok'); if(t) t.innerHTML='🪙 <b>'+PL.tok().toLocaleString()+'</b>'+(PL.mult()>1?' <span class="lv">'+PL.mult()+'×</span>':'');
  var l=$('#hLv'); if(l){ var lv=levelOf(xpState().xp); l.innerHTML='<span class="lv">Lv '+lv.L+'</span>'+esc(PL.name()); } }
PL.hud=hud;

/* ================= live server ================= */
var LV=PL.live={on:false,online:0,skew:0,events:[],room:null,roomId:null,chat:[],cseq:0,chs:['general'],emotes:[],stk:[],off:false,banner:null,x2:0,gifts:{},fast:false,subs:[]};
try{ LV.gifts=JSON.parse(ls('cw_gifts_done')||'{}')||{}; }catch(e){ LV.gifts={}; }
PL.now=function(){ return Date.now()+LV.skew; };
PL.onLive=function(fn){ LV.subs.push(fn); };
var pollT=0, busy=false;
function schedule(){ clearTimeout(pollT); var d=LV.roomId?1100:document.hidden?20000:chatOpen()?1300:LV.fast?2200:5000; pollT=setTimeout(poll,d); }
PL.poll=function(){ clearTimeout(pollT); return poll(); };
async function poll(){
  if(busy){ schedule(); return; } busy=true; var t0=Date.now();
  var r=await CW.call('/api/poll',Object.assign(PL.pollX?PL.pollX():{},{tv:(location.hash||'#').slice(1).split('/')[0]||'home',id:CW.devId(),name:PL.name(),lv:levelOf(xpState().xp).L,cs:LV.cseq,fv:LV.fr?LV.fr.v:0,room:LV.roomId&&LV.roomId!=='practice'?LV.roomId:undefined}),8000); if(r&&r.data&&r.data.banned){ if(PL.o2x) PL.o2x.banned(); return; }
  busy=false;
  if(r.ok&&r.data&&r.data.now){ var d=r.data; LV.duIn=d.duIn||0; LV.ev6=d.ev6||null; if(PL.o2x){ PL.o2x.off(d.off); if(d.rst) PL.o2x.reset(); } LV.on=true; LV.online=d.online||0; LV.mnq=d.mnq||[]; LV.chal=d.chal||null; LV.maint=d.maint||''; if(PL.pollOk) try{ PL.pollOk(d); }catch(e){} LV.skew=d.now-Math.round((t0+Date.now())/2);
    LV.events=d.events||[]; LV.banner=d.banner||null; LV.x2=d.banner&&d.banner.x?d.banner.e:0;
    LV.upd=d.upd||null; LV.cc=!!d.cc; LV.ma=d.ma||0; LV.livex=d.live||null; LV.ce=d.ce||null; LV.pollx=d.poll||null; LV.tour=d.tour||null; LV.feat=d.feat||null; LV.drop=d.drop||null; LV.fast=!!(LV.drop&&!LV.drop.over);
    if(d.social){ var so=d.social; LV.off=!!so.off; if(so.fr) LV.fr=so.fr; LV.fon=so.fon||[]; LV.ts=so.ts||[]; LV.me=so.me||LV.me; if(so.chs) LV.chs=so.chs; LV.rx=so.rx||{}; if(so.emotes) LV.emotes=so.emotes; if(so.stk) LV.stk=so.stk;
      if(so.chat&&so.chat.length){ var seen={}; LV.chat.forEach(function(m){ seen[m.s]=1; }); so.chat.forEach(function(m){ if(!seen[m.s]) LV.chat.push(m); }); LV.chat.sort(function(a,b){ return a.s-b.s; }); if(LV.chat.length>400) LV.chat=LV.chat.slice(-400); }
      if(so.gone&&so.gone.length){ var gn={}; so.gone.forEach(function(x){ gn[x]=1; }); LV.chat=LV.chat.filter(function(m){ return !gn[m.s]; }); }
      LV.pin=so.pin||{}; LV.st=so.st||0;
      if(so.cseq!=null){ if(so.cseq<LV.cseq) LV.chat=[]; LV.cseq=so.cseq; } }
    gifts(d.gifts||[]);
    if(LV.roomId&&LV.roomId!=='practice'){ if(d.room){ if(PL.race) PL.race.update(d.room); } else if(PL.race) PL.race.lost(); }
  } else LV.on=false;
  LV.subs.forEach(function(f){ try{ f(LV); }catch(e){} }); liveDot(); hud(); schedule();
}
function annc(){ var b=$('#annc'); if(!b) return; var x=LV.banner; if(x&&x.t&&x.e>PL.now()){ b.hidden=false; b.textContent=(x.x?'2× tokens · ':'')+x.t; } else b.hidden=true; }
PL.onLive(annc);
function liveDot(){ var d=$('#hLive'); if(d) d.innerHTML='<span style="width:8px;height:8px;border-radius:50%;background:'+(LV.on?'var(--good)':'var(--ink3)')+'"></span>'+(LV.on?LV.online+' online':'offline'); }
document.addEventListener('visibilitychange',function(){ if(!document.hidden) PL.poll(); });

/* gifts from the server: race prizes, owner gifts, trades, club rewards */
function gifts(gs){ if(!gs.length) return; var fresh=gs.filter(function(g){ return !LV.gifts[g.id]; }), ack=gs.map(function(g){ return g.id; });
  var Q=fresh.length>1?[]:null; fresh.forEach(function(g){ applyGift(g,Q); LV.gifts[g.id]=1; }); if(Q&&Q.length) giftSummary(Q);
  if(fresh.length){ var k=Object.keys(LV.gifts); if(k.length>200) k.slice(0,k.length-200).forEach(function(x){ delete LV.gifts[x]; }); ls('cw_gifts_done',JSON.stringify(LV.gifts)); }
  CW.call('/api/ack',{id:CW.devId(),gifts:ack},5000);
  if(LV.wipe){ LV.wipe=0; setTimeout(function(){ try{ Object.keys(localStorage).forEach(function(k){ if(/^cw_/.test(k)&&!/^(cw_devid|cw_owner)/.test(k)) localStorage.removeItem(k); }); }catch(e){} location.href='/play/'; },900); } }
function giftSummary(Q){ if(Q.length===1){ var one=Q[0]; return showGift(one.g,one.l); }
  var tk=0, sp=0; Q.forEach(function(x){ if(x.g.kind==='tokens') tk+=+x.g.value||0; if(x.g.kind==='spins') sp+=+x.g.value||0; });
  CW.sheet('<div class="hd"><h2>🎁 '+Q.length+' gifts waiting</h2><button class="x" data-close aria-label="Close">✕</button></div>'+((tk||sp)?'<p class="muted">'+[tk?'+'+tk.toLocaleString()+' tokens':'',sp?'+'+sp+' spin'+(sp===1?'':'s'):''].filter(Boolean).join(' · ')+' in total</p>':'')
    +'<div class="list giftsum" style="max-height:50vh;overflow:auto;margin-top:10px">'+Q.map(function(x){ var g=x.g; return '<div>'+(g.kind==='skin'?'<span class="gsw" style="background:'+PL.skins.css(+g.value)+'"></span>':'<span class="gsw ic">'+(g.kind==='note'?'💌':g.kind==='tokens'?'🪙':g.kind==='spins'?'🎰':g.kind==='xp'?'⭐':'🎁')+'</span>')+'<span><b>'+esc(x.l)+'</b>'+((g.from||g.msg)?'<br><small class="muted">'+esc((g.from||'')+(g.from&&g.msg?' · ':'')+(g.msg||''))+'</small>':'')+'</span></div>'; }).join('')+'</div>'
    +'<button class="btn pri wide" data-close style="margin-top:14px">Collect all</button>'); }
function applyGift(g,Q){ var v=+g.value||0, label='';
  if(g.kind==='skin'){ unlockSkin(v,g.ed); label='Pad skin: '+PL.skins.name(v); if(g.cost>0){ PL.add(-Math.min(Math.round(+g.cost)||0,PL.tok())); label+=' (-'+g.cost+' tokens)'; } }
  else if(g.kind==='wipe'){ LV.wipe=1; return; }
  else if(g.kind==='revoke'){ lockSkin(v); CW.toast(g.msg||'Access removed.'); return; }
  else if(g.kind==='take'){ lockSkin(v); CW.toast(g.msg||(PL.skins.name(v)+' left your collection')); return; }
  else if(g.kind==='tokens'){ PL.add(v); label='+'+v+' tokens'; }
  else if(g.kind==='spins'){ addSpins(v); label='+'+v+' spin'+(v===1?'':'s'); }
  else if(g.kind==='xp'){ PL.addXP(v); label='+'+v+' XP'; }
  else if(g.kind==='car'){ var oc=CW.lsJ('cw_cars',[0]); if(!Array.isArray(oc)) oc=[0]; if(oc.indexOf(v)<0) oc.push(v); CW.setJ('cw_cars',oc); var cd=window.CWRaceEngine&&CWRaceEngine.CARDEF[v]; label='Car: '+(cd?cd.n:'new car'); }
  else if(g.kind==='note'){ label='💌 A note'; }
  else if(g.kind==='x2'){ PL.setX2(v||1); label='2× tokens for '+(v||1)+'h'; }
  else return;
  var log=CW.lsJ('cw2_giftlog',[]); log.unshift({at:Date.now(),l:label,f:g.from||'',m:g.msg||''}); CW.setJ('cw2_giftlog',log.slice(0,30));
  PL.mailBadge();
  if(Q){ Q.push({g:g,l:label}); return; }
  showGift(g,label); }
function showGift(g,label){ var v=+g.value||0;
  var WR={party:['🎉','linear-gradient(135deg,#ff7ab8,#ffd24a,#59d6ff)'],star:['✨','linear-gradient(135deg,#1d1450,#4a3aa8)'],gold:['🏅','linear-gradient(135deg,#ffe27a,#d99a1a)'],heart:['💖','linear-gradient(135deg,#ff9ac0,#e0457b)']}[g.wrap]||null;
  CW.sheet((WR?'<div style="margin:-6px -6px 12px;padding:18px;border-radius:14px;text-align:center;font-size:34px;color:#fff;background:'+WR[1]+'">'+WR[0]+' '+WR[0]+' '+WR[0]+'</div>':'')+'<div class="hd"><h2>'+(g.kind==='note'?'':'🎁 ')+esc(label)+'</h2><button class="x" data-close aria-label="Close">✕</button></div><p class="muted">'+esc((g.from?g.from+' · ':'')+(g.msg||''))+'</p>'
    +(g.kind==='skin'?'<div style="height:90px;border-radius:14px;margin-top:12px;background:'+PL.skins.css(v)+'"></div>':'')+'<button class="btn pri wide" data-close style="margin-top:14px">'+(g.kind==='note'?'Close':'Collect')+'</button>'); }

/* ================= router ================= */
var TOOLS=[
  {id:'timer',ic:'⏱',n:'Timer',d:'Time your solves. Every solve earns tokens and XP.',c:'var(--c-green)'},
  {id:'learn',ic:'📘',n:'Learn CFOP',d:'The full library: 41 F2L, 57 OLL and 21 PLL cases with diagrams, plus a drill.',c:'var(--c-blue)'},
  {id:'race',ic:'🏁',n:'Cube Race',d:'Race other cubers live. Auto race every 30 minutes.',c:'var(--c-red)'},
  {id:'dash',ic:'🟦',n:'Cube Dash',d:'One-tap rhythm platformer. Jump the spikes and beat every level.',c:'#7a5cff'},
  {id:'garage',ic:'🚗',n:'Garage',d:'Cars, trails and timer pad skins.',c:'var(--c-yellow)'},
  {id:'clubs',ic:'🛡',n:'Clubs',d:'Join a club and climb the weekly board.',c:'#7a5cff'},
  {id:'mail',ic:'✉️',n:'Mail',d:'Send a pad skin, a spin or tokens to any cuber, even when they are offline.',c:'#e1352b'},
  {id:'cube3d',ic:'🧊',n:'3D Cube',d:'A real cube you turn and solve in 3D. Timed, with confetti and auto-solve.',c:'#12a3b8'},
  {id:'rewards',ic:'🎁',n:'Rewards',d:'Level rewards, your daily spin and gifts.',c:'#ff7a1a'}
];
PL.TOOLS=TOOLS;
PL.views={};
PL.mailUnread=function(){ var s=+ls('cw_mail_seen')||0; return CW.lsJ('cw2_giftlog',[]).filter(function(g){ return g&&/^Mail from /.test(g.f||'')&&g.at>s; }).length; };
PL.mailSeen=function(){ ls('cw_mail_seen',String(Date.now())); PL.mailBadge(); };
PL.mailBadge=function(){ var n=PL.mailUnread(); Array.prototype.forEach.call(document.querySelectorAll('a[href="#mail"]'),function(a){ a.classList.toggle('newmail',n>0); a.setAttribute('data-n',n>9?'9+':String(n)); }); };
var cur='';
function route(){ var h=(location.hash||'').replace(/^#/,'').split('?')[0], v=h.split('/')[0];
  if(v==='chat'){ openChat(); history.replaceState(null,'',location.pathname+(cur&&cur!=='home'?'#'+cur:'')); if(!cur) show('home'); return; }
  if(v==='owner'){ if(PL.owner) PL.owner(); history.replaceState(null,'',location.pathname); if(!cur) show('home'); return; }
  show(PL.views[v]?v:'home', h); }
function show(v,h){ if(cur&&cur!==v&&PL.views[cur]&&PL.views[cur].leave) try{ PL.views[cur].leave(); }catch(e){}
  cur=v; if(v!=='home'&&TOOLS.some(function(x){ return x.id===v; })) ls('cw_lasttool',v); document.body.classList.remove('fullpad'); app.innerHTML=''; window.scrollTo(0,0);
  var t=TOOLS.find(function(x){ return x.id===v; }); document.title=(t?t.n+' · ':'')+'Cuber Tools · Cubeworkstudio';
  PL.views[v].show(app,h||''); try{ PL.mailBadge(); }catch(e){} }
PL.crumbs=function(title){ return '<div class="crumbs"><a href="#">← Tools</a><h1>'+esc(title)+'</h1></div>'; };
window.addEventListener('hashchange',route);

/* ================= hub ================= */
function nextAuto(){ var n=PL.now(), s=30*60000; return Math.ceil(n/s)*s; }
function raceEvent(){ var n=PL.now(); return LV.events.filter(function(e){ return e.type==='race'&&e.exp>n; })[0]||null; }
PL.raceEvent=raceEvent; PL.nextAuto=nextAuto; PL.raceBar=function(){ return raceBar(); };
function mmss(ms){ ms=Math.max(0,ms); var s=Math.floor(ms/1000), m=Math.floor(s/60); return m+':'+String(s%60).padStart(2,'0'); }
PL.mmss=mmss;
function raceBar(){ var ev=raceEvent(), n=PL.now();
  if(ev) return '<div class="racebar live"><span class="flag">🏁</span><div><b>'+(ev.auto?'The auto race is open':'A Cube Race is open')+'</b><small>'+(ev.auto?'Top 3 win 500 · 300 · 150 tokens':'Hosted by '+esc(ev.by||'the owner'))+' · closes in '+mmss(ev.exp-n)+'</small></div><a class="btn" href="#race" style="background:#fff;color:#111">Join now</a></div>';
  var at=nextAuto(), d=new Date(at);
  return '<div class="racebar"><span class="flag">🏁</span><div><b>Next auto race at '+d.toLocaleTimeString('en-MY',{hour:'numeric',minute:'2-digit'})+'</b><small>A race opens every 30 minutes · top 3 win 500 · 300 · 150 tokens</small></div><div class="cd" data-cd="'+at+'">'+mmss(at-n)+'</div></div>'; }
var hubT=0;
/* ================= shop bridge ================= */
document.addEventListener('click',function(e){ var a=e.target.closest&&e.target.closest('.shopcard'); if(a) CW.ev('card',a.getAttribute('data-src')||'home'); });
PL.shopCard=function(src){ var c=CW.lsJ('cw2_cart',[]), n=Array.isArray(c)?c.reduce(function(s,l){ return s+(+l.qty||0); },0):0;
  if(n>0) return '<a class="shopcard cart" href="/#cart" data-src="'+(src||'home')+'"><span class="ic">🛒</span><span><b>You left '+n+' item'+(n>1?'s':'')+' in your cart</b><small>Pick up where you stopped. Free shipping across West Malaysia.</small></span><span class="go">Open cart →</span></a>';
  return ''; };
PL.views.home={show:function(el){
  var lv=levelOf(xpState().xp), sv=allSolves().length;
  el.innerHTML='<div class="wrap"><div class="eyebrow">Cubeworkstudio · free for every cuber</div><h1 class="pl-h1">Cuber Tools</h1><p class="lead">Time your solves, learn CFOP, race other cubers and earn tokens for cars, trails, wings and pad skins.</p>'
    +contBtn()+'<div class="six">'+TOOLS.map(function(t){
      var meta=t.meta?t.meta():t.id==='timer'?sv+' solves':t.id==='rewards'?(PL.giftReady()?'🎁 Free gift ready':PL.spinsLeft()?PL.spinsLeft()+' spin'+(PL.spinsLeft()>1?'s':'')+' ready':'Level '+lv.L):t.id==='learn'?learnPct()+'% learned':t.id==='garage'?ownedCount()+' owned':t.id==='race'?'Live · practice · friends':t.id==='mail'?'Skins · spins · tokens':t.id==='dash'?'Rhythm levels':'Weekly board';
      return '<a class="tool'+(t.n0&&t.n0()?' hasn':'')+'" href="#'+t.id+'" style="--tc:'+t.c+'"'+(t.n0&&t.n0()?' data-n="'+t.n0()+'"':'')+'><span class="stripe" style="background:'+t.c+'"></span><span class="ic">'+t.ic+'</span><h3>'+t.n+'</h3><p>'+t.d+'</p><span class="meta">'+meta+'</span></a>'; }).join('')+'</div>'+PL.shopCard()+'</div>';
  clearInterval(hubT); hubT=setInterval(function(){ var rb=$('#rb'); if(!rb){ clearInterval(hubT); return; } var cd=$('[data-cd]',rb), ev=raceEvent();
    if(ev||!cd||+cd.getAttribute('data-cd')<=PL.now()) rb.innerHTML=raceBar(); else cd.textContent=mmss(+cd.getAttribute('data-cd')-PL.now()); },1000); },
  leave:function(){ clearInterval(hubT); }};
PL.onLive(function(){ var rb=$('#rb'); if(rb){ var h=raceBar(); if(rb.__h!==h){ rb.__h=h; rb.innerHTML=h; } } });
function contBtn(){ var id=ls('cw_lasttool'), t=TOOLS.find(function(x){ return x.id===id; }); if(!t) return ''; return '<a class="contbtn" href="#'+t.id+'" style="--tc:'+t.c+'"><span class="ic">'+t.ic+'</span><span><small>Continue where you left off</small><b>'+esc(t.n)+'</b></span><span class="sp"></span><span aria-hidden="true">→</span></a>'; }
function ownedCount(){ var E=window.CWRaceEngine; var n=skinsOwned().length; if(E){ n+=E.carOwned().length+E.trailOwned().length+E.wingOwned().length; } return n; }

/* ================= timer ================= */
var CUBES={'222':'2×2','333':'3×3','444':'4×4','555':'5×5'};
function tData(){ var d=CW.lsJ('cw_timer',{})||{}; if(!d.solves||typeof d.solves!=='object') d.solves={}; if(!CUBES[d.cube]) d.cube='333'; return d; }
function tSave(d){ CW.setJ('cw_timer',{solves:d.solves,cube:d.cube}); }
function scramble(cube){ if(PL.scrX&&PL.scrX[cube]) return PL.scrX[cube](); var R=Math.random, faces=cube==='222'?['R','U','F']:['R','L','U','D','F','B'], ax={R:0,L:0,U:1,D:1,F:2,B:2}, n=cube==='222'?10:cube==='444'?40:cube==='555'?60:20, out=[], last=null, prev=null;
  while(out.length<n){ var f=faces[Math.floor(R()*faces.length)]; if(f===last) continue; if(prev&&ax[f]===ax[last]&&ax[f]===ax[prev]) continue; if(cube!=='222'&&last&&ax[f]===ax[last]&&f===prev) continue;
    var w=(cube==='444'||cube==='555')&&R()<.4&&'RUF'.indexOf(f)>=0?'w':''; out.push(f+w+['',"'",'2'][Math.floor(R()*3)]); prev=last; last=f; }
  return out.join(' '); }
/* real cube state: apply the scramble to an N×N cube so the picture matches exactly */
var FC={U:'#ffffff',D:'#ffd500',F:'#00a651',B:'#0051ba',R:'#e8202a',L:'#ff7f00'}; try{ if(localStorage.getItem('cw_cb')==='1') Object.assign(FC,{D:'#f0e442',F:'#009e73',B:'#0072b2',R:'#d55e00',L:'#e69f00'}); }catch(e){}
function cubeState(N,scr){ var st=[], i, j, k=N-1;
  function add(f,nx,ny,nz){ for(i=-k;i<=k;i+=2) for(j=-k;j<=k;j+=2){ var p= f==='U'?[i,N,j]:f==='D'?[i,-N,j]:f==='F'?[i,j,N]:f==='B'?[i,j,-N]:f==='R'?[N,i,j]:[-N,i,j]; st.push({p:p,c:f}); } }
  ['U','D','F','B','R','L'].forEach(function(f){ add(f); });
  var AX={R:[0,1],L:[0,-1],U:[1,1],D:[1,-1],F:[2,1],B:[2,-1]};
  String(scr||'').trim().split(/\s+/).forEach(function(mv){ var m=/^([RLUDFB])(w?)(['2]?)$/.exec(mv); if(!m) return; var a=AX[m[1]], depth=m[2]?2:1, turns=m[3]==='2'?2:m[3]==="'"?3:1;
    var lim=(N-1)-2*(depth-1);
    for(var t=0;t<turns;t++) st.forEach(function(s){ var v=s.p[a[0]]*a[1]; if(v<lim-0.5&&v!==N) { if(v<lim) return; }
      if(s.p[a[0]]*a[1]<lim) return;
      var x=s.p[0],y=s.p[1],z=s.p[2], sg=a[1];
      /* clockwise seen from the face: R:(y,z)->(z,-y)  U:(x,z)->(-z,x)  F:(x,y)->(y,-x); the opposite faces turn the other way in space */
      if(a[0]===0){ s.p=sg>0?[x,z,-y]:[x,-z,y]; } else if(a[0]===1){ s.p=sg>0?[-z,y,x]:[z,y,-x]; } else { s.p=sg>0?[y,-x,z]:[-y,x,z]; } }); });
  var F={}; ['U','D','F','B','R','L'].forEach(function(f){ F[f]=[]; for(var r=0;r<N;r++){ F[f].push(new Array(N)); } });
  function ix(v){ return (v+k)/2; }
  st.forEach(function(s){ var x=s.p[0],y=s.p[1],z=s.p[2], f,r,c;
    if(y===N){ f='U'; r=ix(z); c=ix(x); } else if(y===-N){ f='D'; r=k-ix(z); c=ix(x); } else if(z===N){ f='F'; r=k-ix(y); c=ix(x); } else if(z===-N){ f='B'; r=k-ix(y); c=k-ix(x); } else if(x===N){ f='R'; r=k-ix(y); c=k-ix(z); } else { f='L'; r=k-ix(y); c=ix(z); }
    F[f][r][c]=s.c; });
  return F; }
function netSvg(N,scr){ var F=cubeState(N,scr), s=N===4?9:N===2?16:12, g=2, fw=N*s+(N-1)*g, gap=6, W=4*fw+3*gap, Hh=3*fw+2*gap;
  var pos={U:[1,0],L:[0,1],F:[1,1],R:[2,1],B:[3,1],D:[1,2]}, h='<svg viewBox="0 0 '+W+' '+Hh+'" width="'+W*1.6+'" style="max-width:100%;height:auto" role="img" aria-label="Scrambled cube">';
  Object.keys(pos).forEach(function(f){ var ox=pos[f][0]*(fw+gap), oy=pos[f][1]*(fw+gap); for(var r=0;r<N;r++) for(var c=0;c<N;c++) h+='<rect x="'+(ox+c*(s+g))+'" y="'+(oy+r*(s+g))+'" width="'+s+'" height="'+s+'" rx="2" fill="'+FC[F[f][r][c]]+'" stroke="rgba(0,0,0,.35)" stroke-width=".6"/>'; });
  return h+'</svg>'; }
PL.cubeState=cubeState;
function fmtT(ms){ ms=Math.max(0,Math.round(ms)); var m=Math.floor(ms/60000), s=(ms-m*60000)/1000; return m?m+':'+s.toFixed(3).padStart(6,'0'):s.toFixed(3); }
function fmt(ms){ if(ms==null) return '–'; if(ms===Infinity) return 'DNF'; ms=Math.round(ms); var s=ms/1000, m=Math.floor(s/60); return m?m+':'+(s-m*60).toFixed(2).padStart(5,'0'):s.toFixed(2); }
PL.fmt=fmt;
PL.T={data:tData,save:tSave,scramble:scramble,CUBES:CUBES,fmt:fmt,fmtT:fmtT,cubeState:cubeState,FC:FC,ao:aoN,best:best};
function aoN(L,n){ if(L.length<n) return null; var a=L.slice(-n).map(function(x){ return x.p===2?Infinity:x.t+(x.p===1?2000:0); }).sort(function(a,b){ return a-b; }); var cut=Math.max(1,Math.ceil(n*.05)); a=a.slice(cut,n-cut); if(a.some(function(x){ return x===Infinity; })) return Infinity; return a.reduce(function(s,x){ return s+x; },0)/a.length; }
function best(L){ var b=null; L.forEach(function(x){ if(x.p===2) return; var t=x.t+(x.p===1?2000:0); if(b==null||t<b) b=t; }); return b; }
function bestAo5(L){ var b=null; for(var i=5;i<=L.length;i++){ var a=aoN(L.slice(0,i),5); if(a!=null&&a!==Infinity&&(b==null||a<b)) b=a; } return b; }
PL.T.aoN=aoN; PL.T.best=best; PL.T.bestAo5=bestAo5; PL.T.editSolve=function(i){ editSolve(i); }; PL.T.stats=function(){ stats(); };
var TM={state:'idle',start:0,raf:0,scr:'',holdT:0,i0:0,pen:0,it:0}; PL.TM=TM;
PL.views.timer={show:function(el){
  var d=tData(); TM.scr=scramble(d.cube); TM.state='idle'; TM.wc=false; var wgo=ls('cw_wc_go'); if(wgo){ ls('cw_wc_go',null); d.cube='333'; tSave(d); TM.scr=wgo; TM.wc=true; }
  el.innerHTML='<div class="wrap tmr">'+PL.crumbs('Timer')
    +'<div class="row" style="margin-bottom:12px"><div class="seg" id="tCube">'+Object.keys(CUBES).map(function(c){ return '<button type="button" data-c="'+c+'" aria-pressed="'+(d.cube===c)+'">'+CUBES[c]+'</button>'; }).join('')+'</div><span class="sp"></span>'
    +'<label class="lk row" style="gap:6px;font-size:13.5px"><input type="checkbox" id="tSpT"> Step splits</label><button class="btn sm" type="button" id="tNew">New scramble</button><button class="btn sm" type="button" id="tBt">Bluetooth timer</button><button class="btn sm" type="button" id="tFull">Fullscreen</button></div>'
    +'<div class="tmr-grid"><div class="tmr-main">'+(TM.wc?'<div class="eyebrow" id="tWc" style="margin-bottom:6px">🏁 Weekly challenge scramble · your next solve counts</div>':'')+'<div class="scr" id="tScr">'+esc(TM.scr)+'</div>'
    +'<div class="pad" id="tPad"><div class="gain" id="tGain"></div><div class="tm" id="tTm">0.000</div><div class="hint" id="tHint">Hold space or touch, let go to start</div><button type="button" class="btn pri" id="tSp" hidden></button></div>'
    +'<div class="row" style="margin:18px 0 12px;align-items:flex-start"><div id="tNet" style="flex:0 1 auto"></div><div id="tPrev" class="muted" style="flex:1;min-width:200px;font-size:14px"></div></div>'
    +'<button type="button" class="btn sm fpx" id="tExit">✕ Exit full screen</button></div>'
    +'<div class="tside"><div class="stats" id="tStats"></div><div class="pnl"><div class="row" style="margin-bottom:8px"><h3 style="margin:0">Times</h3><span class="sp"></span><span class="muted mono" style="font-size:13px">Tap a time to change it</span></div><div class="times" id="tTimes"></div><p class="muted" style="font-size:12.5px;margin-top:8px">A deleted time still on the leaderboard? <button type="button" class="lk" id="tFix" style="background:none;border:0;padding:0;color:var(--blue);cursor:pointer;font:inherit;text-decoration:underline">Fix my rank</button></p></div>'
    +'<p class="muted" style="font-size:13.5px;margin-top:12px">Each solve: 5 tokens, 25 more for a new best. XP: under 7 s 125 · under 10 s 100 · under 12 s 60 · under 15 s 40 · under 20 s 25 · else 10. Change your pad skin in the <a href="#garage">Garage</a>.</p></div></div></div>';
  paintPad(); stats(); scrUI();
  $('#tCube').onclick=function(e){ var b=e.target.closest('[data-c]'); if(!b||TM.state==='run') return; var d=tData(); d.cube=b.getAttribute('data-c'); tSave(d); PL.views.timer.show(el); };
  $('#tNew').onclick=function(){ TM.wc=false; var wl=$('#tWc'); if(wl) wl.remove(); TM.scr=scramble(tData().cube); $('#tScr').textContent=TM.scr; scrUI(); };
  $('#tBt').onclick=btToggle; btUI();
  var spT=$('#tSpT'); spT.checked=ls('cw_tsplit')==='1'; spT.onchange=function(){ ls('cw_tsplit',spT.checked?'1':'0'); if(spT.checked) CW.toast('Tap Cross done, F2L done and OLL done during the solve (or press Enter). Tap the pad to stop at the end of PLL.'); };
  var spb=$('#tSp'); ['pointerdown','pointerup','touchstart','touchend','mousedown','mouseup'].forEach(function(n){ spb.addEventListener(n,function(e){ e.stopPropagation(); }); }); spb.addEventListener('click',function(e){ e.stopPropagation(); doSplit(); });
  var pad=$('#tPad');
  var ex=$('#tExit'); ['pointerdown','pointerup','touchstart','touchend','mousedown','mouseup','click'].forEach(function(n){ ex.addEventListener(n,function(e){ e.stopPropagation(); }); });
  ex.onclick=function(){ document.body.classList.remove('fullpad'); setTimeout(paintPad,80); };
  pad.oncontextmenu=function(e){ e.preventDefault(); return false; };
  $('#tFull').onclick=function(){ document.body.classList.toggle('fullpad'); setTimeout(paintPad,80); };
  pad.addEventListener('pointerdown',function(e){ e.preventDefault(); down(); });
  pad.addEventListener('pointerup',function(e){ e.preventDefault(); up(); });
  pad.addEventListener('pointercancel',function(){ if(TM.state==='hold'||TM.state==='ready') reset(); });
  document.addEventListener('keydown',kd,true); document.addEventListener('keyup',ku,true);
  $('#tFix').onclick=function(){ var d=tData(), L=d.solves['333']||[]; if(!LV.on){ CW.toast('Connect to Cuber Tools live first.'); return; } if(!confirm('Make the leaderboard match the 3×3 solves saved on this device? Use this only if this is the device you normally solve on.')) return; sbSync({},sbVals(L),true); CW.toast('Rank updated to match your saved solves'); };
  $('#tTimes').onclick=function(e){ var b=e.target.closest('[data-i]'); if(b) editSolve(+b.getAttribute('data-i')); };
  if(window.CW_PADFX) try{ CW_PADFX.start(pad,curSkin()); }catch(e){}
  window.addEventListener('resize',rzPad); wake(true); window.addEventListener('blur',tBlur); },
  leave:function(){ wake(false); window.removeEventListener('blur',tBlur); document.removeEventListener('keydown',kd,true); document.removeEventListener('keyup',ku,true); window.removeEventListener('resize',rzPad); try{ if(BT.dev&&BT.dev.gatt.connected) BT.dev.gatt.disconnect(); }catch(e){} cancelAnimationFrame(TM.raf); TM.state='idle'; try{ if(window.CW_PADFX) CW_PADFX.stop(); }catch(e){} }};
/* Bluetooth smart timers (GAN-style): connect, mirror hands-on / ready / run / stop, record the timer's own exact time */
var BT={dev:null,ch:null};
function btUI(){ var b=$('#tBt'); if(b) b.textContent=BT.dev&&BT.dev.gatt&&BT.dev.gatt.connected?'Bluetooth: '+(BT.dev.name||'connected')+' ✓':'Bluetooth timer'; }
function btToggle(){
  if(BT.dev&&BT.dev.gatt&&BT.dev.gatt.connected){ try{ BT.dev.gatt.disconnect(); }catch(e){} return; }
  if(!navigator.bluetooth){ CW.toast('Bluetooth timers need Chrome or Edge (Android, Windows, Mac). iPhone and iPad browsers don’t allow it.'); return; }
  var SV='0000fff0-0000-1000-8000-00805f9b34fb', CH='0000fff5-0000-1000-8000-00805f9b34fb';
  navigator.bluetooth.requestDevice({filters:[{namePrefix:'GAN'},{namePrefix:'gan'},{namePrefix:'Gan'},{services:[SV]}],optionalServices:[SV]})
  .then(function(d){ BT.dev=d; d.addEventListener('gattserverdisconnected',function(){ btUI(); CW.toast('Bluetooth timer disconnected'); }); return d.gatt.connect(); })
  .then(function(s){ return s.getPrimaryService(SV); }).then(function(sv){ return sv.getCharacteristic(CH); })
  .then(function(c){ BT.ch=c; c.addEventListener('characteristicvaluechanged',btData); return c.startNotifications(); })
  .then(function(){ btUI(); CW.toast('Bluetooth timer connected'); })
  .catch(function(e){ if(e&&e.name==='NotFoundError') return; CW.toast('Couldn’t connect: '+((e&&e.message)||'try again')); btUI(); }); }
function btData(ev){ var v=ev.target.value; if(!v||v.byteLength<4||v.getUint8(0)!==0xFE||!$('#tPad')) return;
  var st=v.getUint8(3);
  if(st===6){ if(TM.state==='idle'||TM.state==='stopped'){ TM.state='hold'; setPad('hold','Keep holding…'); $('#tGain').textContent=''; } }
  else if(st===1){ if(TM.state==='hold'){ TM.state='ready'; setPad('ready','Let go to start'); $('#tTm').textContent='0.000'; } }
  else if(st===3){ if(TM.state!=='run'){ TM.state='ready'; go(); } }
  else if(st===4&&v.byteLength>=8){ var t=v.getUint8(4)*60000+v.getUint8(5)*1000+v.getUint16(6,true); if(TM.state==='run'||TM.state==='ready') stop(t); }
  else if(st===5||st===2||st===7){ if(TM.state==='hold'||TM.state==='ready') reset(); } }
var rzT=0, lastPaint='';
function rzPad(){ clearTimeout(rzT); rzT=setTimeout(paintPad,150); }
function paintPad(){ var pad=$('#tPad'); if(!pad) return; var i=curSkin(), s=skinOf(i), w=pad.clientWidth||800, h=pad.clientHeight||330;
  var fx=pad.querySelector('.skfx'); if((i>=40&&i<=42)||(PL.fxSkin&&PL.fxSkin(i))){ pad.setAttribute('data-sk',i); if(!fx){ fx=document.createElement('div'); fx.className='skfx'; fx.innerHTML='<i></i><i></i>'; pad.insertBefore(fx,pad.firstChild); } } else if(PL.genFx&&PL.genFx(pad,i,fx)){} else { pad.removeAttribute('data-sk'); if(fx) fx.remove(); }
  var dpr=Math.min(2,window.devicePixelRatio||1); dpr=Math.min(dpr,1300/Math.max(w,h));
  var key=i+'|'+w+'x'+h; if(key===lastPaint&&pad.style.background) return; lastPaint=key;
  var url=null; try{ if(window.CW_PADART&&!(i>=40&&i<=42)) url=CW_PADART.paint(i,w,h,dpr); }catch(e){}
  pad.style.background=url?'center/cover no-repeat url('+url+')':(s?s.css:'#0d1a17'); }
var WL={l:null,want:false};
function wake(on){ WL.want=on; if(!on){ try{ if(WL.l) WL.l.release(); }catch(e){} WL.l=null; return; } if(WL.l||!navigator.wakeLock||document.hidden) return; navigator.wakeLock.request('screen').then(function(l){ if(!WL.want){ l.release(); return; } WL.l=l; l.addEventListener('release',function(){ if(WL.l===l) WL.l=null; }); }).catch(function(){}); }
document.addEventListener('visibilitychange',function(){ if(!document.hidden&&WL.want) wake(true); });
function tBlur(){ if(TM.state==='hold'||TM.state==='ready'){ clearTimeout(TM.holdT); reset(); } }
function kd(e){ if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; if($('.sheet')) return; if(e.ctrlKey||e.metaKey||e.altKey) return;
  if(TM.state==='run'){ e.preventDefault(); if(e.repeat||performance.now()-TM.start<150) return; if(spOn()&&e.key==='Enter'&&TM.sp.length<3){ doSplit(); return; } stop(); return; }
  if(e.key===' '||e.code==='Space'){ e.preventDefault(); if(!e.repeat) down(); }
  if(e.key==='Escape'&&document.body.classList.contains('fullpad')){ document.body.classList.remove('fullpad'); paintPad(); } }
function ku(e){ if(e.key===' '||e.code==='Space'){ e.preventDefault(); up(); } }
function setPad(cls,hint){ var p=$('#tPad'); if(!p) return; p.classList.remove('hold','ready'); if(cls) p.classList.add(cls); if(hint!=null) $('#tHint').textContent=hint; }
function inspOn(){ return ls('cw_insp')==='1'; }
function inspBeep(f){ try{ var a=PL.au=PL.au||new (window.AudioContext||window.webkitAudioContext)(), o=a.createOscillator(), g=a.createGain(); o.frequency.value=f; g.gain.value=.08; o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime+.12); }catch(e){} }
function inspStart(){ TM.state='insp'; TM.i0=performance.now(); TM.said=0; $('#tGain').textContent=''; setPad('','Inspecting. Hold and let go to start'); var fb=$('#tFb'); if(fb) fb.textContent='';
  (function tk(){ if(!TM.i0||TM.state==='run'||TM.state==='stopped') return; var el=performance.now()-TM.i0, left=Math.ceil((15000-el)/1000), t=$('#tTm'); if(t){ t.textContent=left>0?String(left):(el<17000?'+2':'DNF'); t.classList.add('insp'); }
    if(!TM.said&&el>=8000){ TM.said=1; inspBeep(660); if(PL.inspSay) PL.inspSay(8); } if(TM.said===1&&el>=12000){ TM.said=2; inspBeep(880); if(PL.inspSay) PL.inspSay(12); }
    if(el>=17000){ TM.i0=0; TM.state='idle'; setPad('','Inspection ran out (DNF). Hold space or touch to try again'); if(t){ t.classList.remove('insp'); t.textContent='DNF'; } return; }
    TM.it=requestAnimationFrame(tk); })(); }
function down(){ if(TM.state==='run'){ if(performance.now()-TM.start<150) return; stop(); return; } if(TM.state==='stopped'){ TM.state='idle'; return; } if(TM.state==='idle'&&inspOn()){ inspStart(); return; } if(TM.state!=='idle'&&TM.state!=='insp') return;
  TM.state='hold'; setPad('hold','Keep holding…'); $('#tGain').textContent='';
  clearTimeout(TM.holdT); TM.holdT=setTimeout(function(){ if(TM.state==='hold'){ TM.state='ready'; setPad('ready','Let go to start'); $('#tTm').textContent='0.000'; } },300); }
function up(){ clearTimeout(TM.holdT); if(TM.state==='ready') go(); else if(TM.state==='hold') reset(); else if(TM.state==='insp'){ } else if(TM.state==='stopped') TM.state='idle'; }
function reset(){ TM.state=TM.i0?'insp':'idle'; setPad('','Hold space or touch, let go to start'); }
function spOn(){ return ls('cw_tsplit')==='1'&&tData().cube==='333'; }
var SPL=['Cross done','F2L done','OLL done'];
function spUI(){ var b=$('#tSp'); if(!b) return; if(TM.state==='run'&&spOn()){ b.hidden=false; if(TM.sp.length<3){ b.disabled=false; b.textContent=SPL[TM.sp.length]; } else { b.disabled=true; b.textContent='PLL: tap the pad to stop'; } } else b.hidden=true; }
function doSplit(){ if(TM.state!=='run'||!spOn()||TM.sp.length>=3) return; TM.sp.push(Math.round(performance.now()-TM.start)); spUI(); }
function go(){ try{ if(PL.solveStart) PL.solveStart(); }catch(e){} var fb0=$('#tFb'); if(fb0) fb0.textContent=''; TM.pen=0; if(TM.i0){ TM.pen=performance.now()-TM.i0>15000?1:0; TM.i0=0; cancelAnimationFrame(TM.it); var tt=$('#tTm'); if(tt) tt.classList.remove('insp'); } TM.state='run'; TM.start=performance.now(); TM.sp=[]; spUI(); setPad('','Tap or press any key to stop');
  (function tick(){ if(TM.state!=='run') return; $('#tTm').textContent=ls('cw_hide')==='1'?'Solving…':fmtT(performance.now()-TM.start); TM.raf=requestAnimationFrame(tick); })(); }
/* Cubexer comment after each solve: built only from the cuber's own saved times */
function solveNote(L,t,pb,oldAo){ var prior=L.slice(0,-1).filter(function(x){ return x.p!==2; }).map(function(x){ return x.t+(x.p===1?2000:0); }), n=prior.length, last=L[L.length-1], d1=function(a){ return (Math.abs(a)/1000).toFixed(2); };
  if(n<4) return 'Solve '+L.length+' logged. Do a few more and I can start comparing them.';
  if(pb&&prior.length) return 'New best by '+d1(Math.min.apply(null,prior)-t)+' s. Your old best was '+fmt(Math.min.apply(null,prior))+'.';
  var ao=aoN(L,5); if(ao!=null&&ao!==Infinity&&L.length>=6&&(oldAo==null||ao<oldAo)) return 'New best Ao5: '+fmt(ao)+'.';
  var rec=prior.slice(-12), avg=rec.reduce(function(a,b){ return a+b; },0)/rec.length;
  if(last.sp&&last.sp.length===3){ var sh=function(r){ var s=r.sp, T=r.t; return [s[0]/T,(s[1]-s[0])/T,(s[2]-s[1])/T,(T-s[2])/T]; }, names=['cross','F2L','OLL','PLL'], hs=L.slice(0,-1).filter(function(r){ return r.sp&&r.sp.length===3&&r.sp[2]<r.t; }).slice(-12);
    if(hs.length>=4){ var cur=sh(last), mean=[0,0,0,0]; hs.forEach(function(r){ var q=sh(r); for(var i=0;i<4;i++) mean[i]+=q[i]/hs.length; }); var wi=0; for(var i=1;i<4;i++) if(cur[i]-mean[i]>cur[wi]-mean[wi]) wi=i;
      if(cur[wi]-mean[wi]>.06) return names[wi][0].toUpperCase()+names[wi].slice(1)+' took '+Math.round(cur[wi]*100)+'% of this solve, more than your usual '+Math.round(mean[wi]*100)+'%. Look there first.'; } }
  var tt=t+(last.p===1?2000:0); if(last.p===2) return 'DNF. Check what went wrong in the last step, then go again.';
  var tail=L.slice(-4).map(function(x){ return x.p===2?Infinity:x.t+(x.p===1?2000:0); }); if(tail.length===4&&tail[0]>tail[1]&&tail[1]>tail[2]&&tail[2]>tail[3]) return 'Three solves in a row, each faster than the last.';
  if(tt<avg*.9) return d1(avg-tt)+' s under your last-'+rec.length+' average ('+fmt(avg)+'). Nice and smooth.';
  if(tt>avg*1.25) return d1(tt-avg)+' s over your last-'+rec.length+' average ('+fmt(avg)+'). One slow solve is noise. Where did you pause?';
  var rank=rec.concat([tt]).sort(function(a,b){ return a-b; }).indexOf(tt)+1; return 'Close to your average of '+fmt(avg)+'. It ranks '+rank+' of your last '+(rec.length+1)+'.'; }
function showNote(L,t,pb,oldAo){ var f0=$('#tFb'); if(f0) f0.remove(); return;   /* the Cubexer comment under the time is switched off: the pad shows only the time */
  var g=$('#tGain'); if(!g) return; var f=$('#tFb'); if(!f){ g.insertAdjacentHTML('afterend','<div class="fb" id="tFb"></div>'); f=$('#tFb'); } var m=''; try{ m=solveNote(L,t,pb,oldAo); }catch(e){} f.textContent=m?'Cubexer: '+m:''; }
function stop(ext){ var t=ext>0?Math.round(ext):Math.round(performance.now()-TM.start); TM.state='stopped'; try{ var fp=document.getElementById('tPad')||document.getElementById('tmrPad'); if(fp&&window.CW_PADFX&&CW_PADFX.finish&&!document.body.classList.contains('cwStudioPad')){ var fi=curSkin(); if(fi>=0&&fi<1000) CW_PADFX.finish(fp,fi); } }catch(e){} var sp=(!(ext>0)&&spOn()&&TM.sp&&TM.sp.length===3&&TM.sp[2]<t)?TM.sp.slice():null; spUI(); cancelAnimationFrame(TM.raf); $('#tTm').textContent=fmtT(t); setPad('','Hold space or touch for the next solve');
  var d=tData(), L=d.solves[d.cube]=d.solves[d.cube]||[], pb0=best(L), oldAo=bestAo5(L);
  var rec={t:t,scr:TM.scr,d:Date.now(),p:TM.pen||0}; TM.pen=0; if(sp) rec.sp=sp; L.push(rec); tSave(d); try{ if(PL.solveDone) PL.solveDone(rec,d.cube,L); }catch(e){} if(allSolves().length>=1000&&!hasSkin(18)){ unlockSkin(18); CW.toast('Secret pad skin unlocked: '+PL.skins.name(18)); }
  if(PL.tick) PL.tick('solves'); var pb=L.length>1&&(pb0==null||t<pb0), trn=/^3[xfop]$/.test(d.cube), tok=PL.award(trn?1:5+(pb?25:0)), xp=PL.addXP(trn?10:xpFor(t));   /* trainer scrambles are short on purpose, so they pay a flat 1 token and 10 XP */
  $('#tGain').textContent=(pb?'★ New best! ':'')+'+'+tok+' tokens · +'+xp+' XP'; showNote(L,t,pb,oldAo);
  if(TM.wc&&d.cube==='333'){ TM.wc=false; var wl=$('#tWc'); if(wl) wl.remove(); wcSend(t); }
  if(d.cube==='333'){ var nb=best(L), na=bestAo5(L); var ca=aoN(L,5); sbSubmit(t+(0),(ca!=null&&ca!==Infinity&&ca>=3500)?ca:0); }
  TM.scr=scramble(d.cube); var s=$('#tScr'); if(s) s.textContent=TM.scr; stats(); scrUI(); }
function scrUI(){ var d=tData(), N=+d.cube[0], n=$('#tNet'); if(n){ try{ n.innerHTML=(PL.t3&&PL.t3.noNet(d.cube))?'':netSvg(N,TM.scr); }catch(e){ n.innerHTML=''; } }
  var L=d.solves[d.cube]||[], x=L[L.length-1], p=$('#tPrev'); if(!p) return;
  p.innerHTML=x?'<div class="eyebrow" style="margin-bottom:4px">Previous solve · '+(x.p===2?'DNF':fmt(x.t+(x.p===1?2000:0)))+'</div><div class="mono" style="color:var(--ink);word-spacing:.2em">'+esc(x.scr||'(no scramble saved)')+'</div>'+(x.scr?'<button class="btn sm" type="button" id="tPc" style="margin-top:6px">Copy scramble</button>':''):'<span>Your previous scramble shows here after your first solve.</span>';
  var pc=$('#tPc'); if(pc) pc.onclick=function(){ CW.copy(x.scr,pc); }; }
function sbVals(L){ var wk=Date.now()-7*864e5, W=L.filter(function(x){ return (x.d||0)>=wk; }); return {s:best(L)||0,a:bestAo5(L)||0,ws:best(W)||0,wa:bestAo5(W)||0}; }
function sbSync(v0,v1,force){ if(!LV.on) return; var c=false; ['s','a','ws','wa'].forEach(function(k){ if(v0[k]!==v1[k]) c=true; }); if(!c&&!force) return; CW.call('/api/sb',{id:CW.devId(),act:'sync',o:v0,n:v1,force:force?1:0},6000); }
function sbSubmit(s,a){ if(!LV.on) return; CW.call('/api/sb',{id:CW.devId(),act:'submit',s:s?Math.round(s):0,a:a?Math.round(a):0,sat:Date.now(),aat:Date.now()},6000); }
function stats(){ if(PL.t2) try{ PL.t2.render(); }catch(e){} var d=tData(), L=d.solves[d.cube]||[], el=$('#tStats'); if(!el) return; var pb=best(L);
  el.innerHTML='<div><small>Best</small><b>'+fmt(pb)+'</b></div><div><small>Ao5</small><b>'+fmt(aoN(L,5))+'</b></div><div><small>Ao12</small><b>'+fmt(aoN(L,12))+'</b></div><div><small>Solves</small><b>'+L.length+'</b></div>';
  var tl=$('#tTimes'); if(tl) tl.innerHTML=L.length?L.map(function(x,i){ return {x:x,i:i}; }).reverse().slice(0,200).map(function(o){ var x=o.x, v=x.p===2?'DNF':fmt(x.t+(x.p===1?2000:0))+(x.p===1?'+':''); return '<button type="button" data-i="'+o.i+'"'+(x.p!==2&&x.t+(x.p===1?2000:0)===pb?' class="pb"':'')+'>'+v+'</button>'; }).join(''):'<span class="muted">No solves yet.</span>'; }
function editSolve(i){ var d=tData(), L=d.solves[d.cube]||[], x=L[i]; if(!x) return;
  var sh=CW.sheet('<div class="hd"><h2>'+fmt(x.t)+'</h2><button class="x" data-close aria-label="Close">✕</button></div><p class="muted mono" style="font-size:13px">'+esc(x.scr||'')+'</p><p class="muted" style="font-size:13px;margin-top:6px">'+new Date(x.d||0).toLocaleString('en-MY')+'</p>'+(x.sp&&x.sp.length===3?'<p class="mono" style="font-size:13px;margin-top:6px">Cross '+fmt(x.sp[0])+' · F2L '+fmt(x.sp[1]-x.sp[0])+' · OLL '+fmt(x.sp[2]-x.sp[1])+' · PLL '+fmt(x.t-x.sp[2])+'</p>':'')
    +'<div class="row" style="margin-top:14px"><button class="btn sm'+(x.p===0?' ink':'')+'" data-p="0">OK</button><button class="btn sm'+(x.p===1?' ink':'')+'" data-p="1">+2</button><button class="btn sm'+(x.p===2?' ink':'')+'" data-p="2">DNF</button><span class="sp"></span><button class="btn sm" data-del>Delete</button></div>');
  try{ if(PL.solveSheet) PL.solveSheet(sh,x,d.cube); }catch(e){}
  if(PL.t3) try{ PL.t3.edit(sh,x,function(){ tSave(d); }); }catch(e){}
  sh.addEventListener('click',function(e){ var p=e.target.closest('[data-p]'), is3=d.cube==='333', v0=is3?sbVals(L):null;
    if(p){ x.p=+p.getAttribute('data-p'); tSave(d); stats(); if(is3) sbSync(v0,sbVals(L)); sh.close(); }
    if(e.target.closest('[data-an]')){ try{ sessionStorage.setItem('cw_vd',JSON.stringify({scr:x.scr,t:x.t})); }catch(er){} sh.close(); location.hash='#verdict'; return; }
    if(e.target.closest('[data-del]')){ L.splice(i,1); tSave(d); stats(); if(is3) sbSync(v0,sbVals(L)); sh.close(); } }); }

/* ================= learn CFOP (view lives in play-learn.js) ================= */
function learned(){ var o=CW.lsJ('cw_learn',{}); return o&&typeof o==='object'&&!Array.isArray(o)?o:{}; }
function learnPct(){ var D=window.LEARN_DATA; if(!D) return 0; var o=learned(), n=0, t=0; ['oll','pll','f2l'].forEach(function(k){ var p=k==='f2l'?'f2l-':k+'-'; D[k].forEach(function(c){ t++; if(o[p+c.id]) n++; }); }); return t?Math.round(n/t*100):0; }
PL.learned=learned; PL.learnPct=learnPct;

/* ================= rewards ================= */
var DEF_POOL=[{id:'p1',label:'5 tokens',type:'tokens',value:5,weight:37.6},{id:'p2',label:'10 tokens',type:'tokens',value:10,weight:23.5},{id:'p3',label:'25 tokens',type:'tokens',value:25,weight:14.1},{id:'p4',label:'2× tokens 24h',type:'double',value:24,weight:9.4},{id:'p5',label:'50 tokens',type:'tokens',value:50,weight:6.58},{id:'p6',label:'100 tokens',type:'tokens',value:100,weight:2.82},{id:'pxp',label:'20 XP',type:'xp',value:20,weight:6}];
function pool(){ var p=CW.lsJ('cw_gacha_pool',null); return Array.isArray(p)&&p.length&&p.every(function(x){ return x&&x.type; })?p:DEF_POOL; }
var WC=['#2650f5','#f2b600','#1f9a52','#e1352b','#7a5cff','#ff7a1a','#12a3b8','#c43d8b'];
function giftCard(){ var n=giftNext(), rdy=PL.giftReady(), g=giftState();
  return '<div class="pnl" id="gfBox" style="text-align:center"><h3>🎁 Daily free gift</h3><p class="muted" style="font-size:14px">'+(rdy?'Your gift is ready: <b>'+n.amt+' tokens</b>'+(n.streak>1?' · day '+n.streak+' streak':'')+'.':'Claimed today. Come back tomorrow'+(g.streak>0?' to reach a '+(g.streak+1)+'-day streak (+'+Math.min(60,10*Math.min(6,g.streak))+' bonus).':'.'))+'</p><button class="btn pri" id="gfGo" type="button"'+(rdy?'':' disabled')+' style="margin-top:8px">'+(rdy?'Claim gift':'Come back tomorrow')+'</button></div>'; }
/* weekly challenge: the same scramble for everyone each week; your best time counts */
async function wcSend(t){ if(!LV.on){ CW.toast('Connect to Cuber Tools live to submit.'); return; } var r=await CW.call('/api/wc',{id:CW.devId(),act:'submit',ms:Math.round(t)},8000);
  if(r.ok&&r.data.mine) CW.toast('🏁 Weekly challenge: you are #'+r.data.mine.rank+' with '+fmt(r.data.mine.ms)); else CW.toast((r.data&&r.data.error)||'Couldn’t submit. Try again.'); }
function wcLeft(t){ var s=Math.max(0,Math.round((t-Date.now())/1000)), d=Math.floor(s/86400), h=Math.floor(s%86400/3600); return d?d+'d '+h+'h':h+'h '+Math.floor(s%3600/60)+'m'; }
async function wcFill(){ var b=$('#wcBox'); if(!b) return; var r=await CW.call('/api/wc',{id:CW.devId()},8000); if(!$('#wcBox')) return; if(!r.ok||!r.data.scr){ b.innerHTML='<h3>🏁 Weekly challenge</h3><p class="muted" style="font-size:14px">Couldn’t load right now.</p>'; return; } var d=r.data;
  b.innerHTML='<h3>🏁 Weekly challenge</h3><p class="muted" style="font-size:14px">Everyone solves the same scramble. Your best time of the week counts. Top 3 win '+d.pay.join(' / ')+' tokens'+(d.prize?' · <b>'+esc(d.prize)+'</b>':'')+'. Ends in '+wcLeft(d.reset)+'.</p>'
   +'<div class="scr mono" style="margin:10px 0;font-size:14px">'+esc(d.scr)+'</div>'
   +(d.mine?'<p style="margin:6px 0"><b>You: #'+d.mine.rank+' · '+fmt(d.mine.ms)+'</b> <span class="muted">('+d.mine.n+'/15 tries)</span></p>':'')
   +'<div class="list" style="text-align:left">'+(d.rows.length?d.rows.slice(0,5).map(function(x){ return '<div><b class="mono" style="width:26px">'+x.r+'</b><span>'+esc(x.n)+(x.me?' (you)':'')+'</span><span class="sp"></span><b class="mono">'+fmt(x.ms)+'</b></div>'; }).join(''):'<p class="muted">Nobody yet. Be first!</p>')+'</div>'
   +(d.last&&d.last.length?'<p class="muted" style="font-size:13px;margin-top:8px">Last week: '+d.last.map(function(x,i){ return (i+1)+'. '+esc(x.n)+' '+fmt(x.ms); }).join(' · ')+'</p>':'')
   +'<button class="btn pri wide" id="wcGo" type="button" style="margin-top:10px">Solve it now</button>';
  var wg=$('#wcGo'); if(wg) wg.onclick=function(){ ls('cw_wc_go',d.scr); location.hash='timer'; }; }
PL.views.rewards={show:function(el){ var s=xpState(), lv=levelOf(s.xp), P=pool(), tot=P.reduce(function(a,b){ return a+Math.max(0,+b.weight||0); },0)||1, acc=0;
  var grad=P.map(function(p,i){ var a=acc/tot*360; acc+=Math.max(0,+p.weight||0); return WC[i%WC.length]+' '+a.toFixed(1)+'deg '+(acc/tot*360).toFixed(1)+'deg'; }).join(',');
  function pIc(p){ return p.type==='tokens'?'🪙':p.type==='xp'?'⭐':p.type==='double'?'✨':p.type==='spin'?'🎡':'🎁'; }
  function pSh(p){ return p.type==='double'?'2×':p.type==='spin'?'+'+(+p.value||1):p.type==='xp'?(+p.value||20)+'xp':(+p.value||0)||String(p.label||'').slice(0,5); }
  var wacc=0, wlabs=P.map(function(p,i){ var w=Math.max(0,+p.weight||0), mid=(wacc+w/2)/tot*360; wacc+=w; return '<span class="wl'+(w/tot<0.035?' xs':w/tot<0.07?' sm':'')+'" style="transform:rotate('+mid.toFixed(1)+'deg)"><i>'+pIc(p)+'</i><b>'+esc(String(pSh(p)))+'</b></span>'; }).join('');
  var rows=''; for(var L=Math.max(2,lv.L-1);L<=Math.min(MAXL,lv.L+8);L++) rows+='<div class="lvrow'+(L<=lv.L?' done':'')+'"><b>Lv '+L+(L<=lv.L?' ✓':'')+'</b><span>'+esc(rewardTxt(reward(L)))+'</span></div>';
  var log=CW.lsJ('cw2_giftlog',[]);
  el.innerHTML='<div class="wrap">'+PL.crumbs('Rewards')+'<div class="grid2"><div>'+(PL.acct?PL.acct.html():'')
    +'<div class="pnl"><div class="row"><h3 style="margin:0">Level '+lv.L+'</h3><span class="sp"></span><span class="mono muted" style="font-size:13px">'+(lv.max?'MAX':lv.into+' / '+lv.need+' XP')+'</span></div><div class="prog" style="margin:10px 0 12px"><i style="width:'+(lv.max?100:Math.min(100,lv.into/lv.need*100)).toFixed(1)+'%"></i></div>'+rows+'</div>'
    +'<div class="pnl"><h3>Your name</h3><p class="muted" style="font-size:14px">Shown in races, chat and clubs.</p><div class="row" style="margin-top:10px"><input class="in" id="rName" maxlength="16" value="'+esc(ls('cw_handle')||'')+'" placeholder="'+esc(PL.name())+'" style="flex:1"><button class="btn sm pri" id="rNameGo">Save</button></div></div>'
    +'<div class="pnl"><h3>App &amp; alerts</h3><p class="muted" style="font-size:14px">Install the site as an app. Then get an alert when someone passes you on this week’s 3×3 board, or when you move up. Solve faster to take your place back.</p><div class="row" style="margin-top:10px"><button class="btn sm pri" id="alOn" type="button"></button><button class="btn sm" id="alHelp" type="button">Get the app</button></div><p class="muted" id="alMsg" style="font-size:13px;margin-top:6px"></p><div id="alPf"></div></div>'
    +'</div><div><div class="pnl" id="wcBox"><h3>🏁 Weekly challenge</h3><p class="muted">Loading…</p></div>'+giftCard()+'<div class="pnl" style="text-align:center"><h3>Daily spin</h3><p class="muted" style="font-size:14px">One free spin every day. Level rewards give extra spins.</p><div class="wheel-wrap"><div class="wheel-pin" id="whPin"></div><div class="wheel" id="wh" style="background:conic-gradient('+grad+')">'+wlabs+'</div><button type="button" class="wheel-hub" id="whHub" aria-label="Spin"'+(PL.spinsLeft()?'':' disabled')+'>SPIN</button></div>'
    +'<button class="btn pri" id="spin" '+(PL.spinsLeft()?'':'disabled')+'>'+(PL.spinsLeft()?'Spin ('+PL.spinsLeft()+' left)':'Come back tomorrow')+'</button>'
    +'<div class="list" style="text-align:left;margin-top:14px">'+P.map(function(p,i){ return '<div><span style="width:12px;height:12px;border-radius:3px;background:'+WC[i%WC.length]+'"></span><span>'+esc(p.label)+'</span><span class="sp"></span><span class="mono muted" style="font-size:12.5px">'+(Math.max(0,+p.weight||0)/tot*100).toFixed(1)+'%</span></div>'; }).join('')+'</div></div>'
    +'<div class="pnl"><h3>Gifts</h3>'+(log.length?'<div class="list">'+log.slice(0,10).map(function(g){ return '<div><span>🎁</span><span><b>'+esc(g.l)+'</b><br><small class="muted">'+esc(g.f+(g.m?' · '+g.m:''))+'</small></span></div>'; }).join('')+'</div>':'<p class="muted">Race prizes and gifts show up here.</p>')+'</div></div></div></div>';
  if(PL.acct) PL.acct.bind(el);
  wcFill();
  (function(){ var gb=$('#gfGo'); if(gb) gb.onclick=function(){ var got=PL.giftClaim(); if(got){ CW.toast('🎁 +'+got+' tokens! See you tomorrow.'); hud(); PL.views.rewards.show(el); } }; })();
  (function(){ var bt=$('#alOn'); function lab(){ bt.textContent=CW.push.on('player')?'Turn off rank alerts':'Turn on rank alerts'; } lab();
    $('#alHelp').onclick=function(){ CW.push.help(); };
    bt.onclick=async function(){ bt.disabled=true; var m=$('#alMsg'); m.textContent='';
      if(CW.push.on('player')){ await CW.push.disable('player'); CW.toast('Rank alerts are off.'); }
      else { var r=await CW.push.enable('player'); if(r.ok) CW.toast('Rank alerts are on.'); else m.textContent=r.msg; }
      bt.disabled=false; lab(); pf(); };
    function hm(m){ return m<0?'':('0'+Math.floor(m/60)).slice(-2)+':'+('0'+(m%60)).slice(-2); } function mm(v){ var x=/^(\d\d):(\d\d)$/.exec(v||''); return x?(+x[1])*60+(+x[2]):-1; }
    async function pf(){ var box=$('#alPf'); if(!box) return; if(!CW.push.on('player')){ box.innerHTML=''; return; }
      var r=await CW.call('/api/push/pref',{id:CW.devId(),get:1},8000); if(!r.ok||!r.data.pf){ box.innerHTML=''; return; } var f=r.data.pf;
      box.innerHTML='<h4 style="margin:12px 0 6px;font-size:14px">Choose your alerts</h4>'
       +[['rank','Rank up / down on the 3×3 board'],['drop','Cubing Zone Drops'],['wk','Last hours of the week'],['daily','Daily gift & solve reminder']].map(function(t){ return '<label style="display:flex;gap:8px;align-items:center;margin:4px 0;font-size:14px"><input type="checkbox" data-pf="'+t[0]+'"'+(f[t[0]]?' checked':'')+'> '+t[1]+'</label>'; }).join('')
       +'<div class="row" style="margin-top:8px;gap:8px;align-items:center;font-size:14px"><span>Quiet hours</span><input type="time" id="alQs" value="'+hm(f.qs)+'"><span>to</span><input type="time" id="alQe" value="'+hm(f.qe)+'"></div><p class="muted" style="font-size:12.5px;margin-top:4px">No alerts between those times. Clear both to turn this off.</p>';
      function save(){ var o={tz:-new Date().getTimezoneOffset(),qs:mm($('#alQs').value),qe:mm($('#alQe').value)}; $$('[data-pf]',box).forEach(function(i){ o[i.getAttribute('data-pf')]=i.checked; }); CW.call('/api/push/pref',{id:CW.devId(),pf:o},8000); }
      box.onchange=save; }
    pf(); })();
  $('#rNameGo').onclick=function(){ var v=$('#rName').value.trim().replace(/\s+/g,' '); if(v&&!/^[A-Za-z0-9 _.-]{3,16}$/.test(v)){ CW.toast('Use 3–16 letters, numbers, spaces, _ . -'); return; } ls('cw_handle',v||null); hud(); CW.toast('Saved.'); PL.poll(); };
  var rot=0, busyW=false; $('#whHub').onclick=function(){ $('#spin').click(); };
  $('#spin').onclick=function(){ var b=this; if(busyW) return; if(!PL.useSpin()){ CW.toast('No spins left today.'); return; } busyW=true; b.disabled=true; $('#whHub').disabled=true;
    var r=Math.random()*tot, k=0; for(;k<P.length;k++){ r-=Math.max(0,+P[k].weight||0); if(r<=0) break; } k=Math.min(k,P.length-1);
    var a0=0; for(var j=0;j<k;j++) a0+=Math.max(0,+P[j].weight||0); var wk=Math.max(0,+P[k].weight||0), mid=(a0+wk*(0.2+Math.random()*0.6))/tot*360; rot+=360*6+(360-mid)-(rot%360);
    var wh=$('#wh'), pin=$('#whPin'); wh.classList.remove('win'); wh.style.transition='transform 5.2s cubic-bezier(.08,.72,.1,1)'; wh.style.transform='rotate('+rot+'deg)';
    var bounds=[],c=0; P.forEach(function(p){ c+=Math.max(0,+p.weight||0); bounds.push(c/tot*360); }); var lastI=-1, t0=Date.now();
    (function tick(){ if(!busyW) return; var m=getComputedStyle(wh).transform, ang=0; if(m&&m!=='none'){ var v=m.match(/matrix\(([^)]+)\)/); if(v){ var q=v[1].split(','); ang=Math.atan2(+q[1],+q[0])*180/Math.PI; } }
      var at=(((360-ang)%360)+360)%360, idx=0; while(idx<bounds.length-1&&at>=bounds[idx]) idx++;
      if(lastI!==-1&&idx!==lastI){ pin.classList.remove('flick'); void pin.offsetWidth; pin.classList.add('flick'); try{ if(navigator.vibrate) navigator.vibrate(8); }catch(e){} } lastI=idx;
      if(Date.now()-t0<5600) requestAnimationFrame(tick); })();
    setTimeout(function(){ busyW=false; wh.classList.add('win'); var p=P[k], txt=p.label; if(p.type==='tokens') txt='+'+PL.award(+p.value||0)+' tokens'; else if(p.type==='double') PL.setX2(+p.value||24); else if(p.type==='xp') PL.addXP(+p.value||20); else if(p.type==='spin') addSpins(+p.value||1);
      if(PL.confetti) PL.confetti();
      CW.sheet('<div class="hd"><h2>You won!</h2><button class="x" data-close aria-label="Close">✕</button></div><div class="wonbox"><div class="wonic">'+pIc(p)+'</div><div class="wontx">'+esc(txt)+'</div></div><button class="btn pri wide" data-close style="margin-top:10px">Nice</button>',function(){ PL.views.rewards.show(el); }); },5400); }; }};

/* ================= chat: public channels, friends and group chats ================= */
var CH={open:false,ch:'general',tab:'pub',th:null,meta:{},msgs:[],q:0,thT:0};
LV.fr=null; LV.fon=[]; LV.ts=[];
function chatOpen(){ return CH.open||!!PL.chat2Open; }
function readMap(){ return CW.lsJ('cw2_thread_read',{})||{}; }
function unread(){ var R=readMap(), n=0; (LV.ts||[]).forEach(function(t){ if(t.q>(R[t.t]||0)) n++; }); return n+((LV.fr&&LV.fr.req)||[]).length; }
function openChat(tab){ if(PL.chat2) return PL.chat2.open(tab); if(CH.open){ if(tab){ CH.tab=tab; drawChat(true); } return; } CH.open=true; if(tab) CH.tab=tab; var d=document.createElement('div'); d.className='chatp'; d.id='chatP'; d.setAttribute('role','dialog'); d.setAttribute('aria-label','Chat');
  d.innerHTML='<header><button class="x" type="button" data-back aria-label="Back" hidden>←</button><b id="cTitle">Chat</b><span class="tag" id="cOn"></span><span class="sp"></span><button class="x" type="button" data-cx aria-label="Close">✕</button></header>'
    +'<div class="seg" id="cTabs" style="margin:8px 10px 0"><button type="button" data-tab="pub">Public</button><button type="button" data-tab="fr">Friends</button><button type="button" data-tab="gc">Groups</button></div>'
    +'<div class="chs" id="cChs"></div><div class="cmw"><div class="cm" id="cM"></div><button type="button" class="cnew" id="cNew" hidden>↓ New messages</button></div><div class="cemo" id="cEm" hidden></div>'
    +'<form id="cF"><button type="button" class="cemob" id="cEmB" aria-label="Emoji">😀</button><input class="in" id="cIn" maxlength="200" placeholder="Say something nice" autocomplete="off" enterkeyhint="send"><button class="btn pri sm csend" type="submit" aria-label="Send">➤</button></form>';
  document.body.appendChild(d); d.addEventListener('click',chatClick);
  $('#cEmB').onclick=function(){ $('#cEm').hidden=!$('#cEm').hidden; };
  $('#cNew').onclick=function(){ var b=$('#cM'); b.scrollTop=b.scrollHeight; this.hidden=true; };
  $('#cM').addEventListener('scroll',function(){ var b=this; if(b.scrollHeight-b.scrollTop-b.clientHeight<40) $('#cNew').hidden=true; });
  var tyT=0; $('#cIn').addEventListener('input',function(){ if(!CH.th||CH.th.indexOf('new:')===0) return; var n=Date.now(); if(n-tyT<3000) return; tyT=n; CW.call('/api/th/typing',{id:CW.devId(),t:CH.th},4000); });
  if(matchMedia('(min-width:600px)').matches) setTimeout(function(){ var i=$('#cIn'); if(i) i.focus(); },60);
  $('#cF').onsubmit=function(e){ e.preventDefault(); var v=$('#cIn').value.trim(); if(!v) return; if(window.CWCmd&&CWCmd(v)){ $('#cIn').value=''; return; } if(window.CWCmdText){ var tx=CWCmdText(v); if(tx) v=tx; } if(CH.th) thSend(v); else sendChat({text:v}); };
  drawChat(true); PL.poll(); }
function closeChat(){ CH.open=false; CH.th=null; clearInterval(CH.thT); var d=$('#chatP'); if(d) d.remove(); }
PL.openChat=openChat;
function chatClick(e){ var t;
  if(e.target.closest('[data-cx]')) return closeChat();
  if(e.target.closest('[data-back]')){ CH.th=null; clearInterval(CH.thT); return drawChat(true); }
  if((t=e.target.closest('[data-tab]'))){ CH.tab=t.getAttribute('data-tab'); CH.th=null; clearInterval(CH.thT); return drawChat(true); }
  if((t=e.target.closest('[data-ch]'))){ CH.ch=t.getAttribute('data-ch'); return drawChat(true); }
  if((t=e.target.closest('[data-em]'))){ $('#cEm').hidden=true; return CH.th?thSend(null,t.getAttribute('data-em')):sendChat({e:t.getAttribute('data-em')}); }
  if((t=e.target.closest('[data-who]'))) return who(t.getAttribute('data-who'),t.getAttribute('data-n'));
  if((t=e.target.closest('[data-open]'))) return openThread(t.getAttribute('data-open'));
  if((t=e.target.closest('[data-dm]'))) return startDM(t.getAttribute('data-dm'),t.getAttribute('data-n'));
  if((t=e.target.closest('[data-fa]'))) return friendAct(t.getAttribute('data-fa'),t.getAttribute('data-p'));
  if(e.target.closest('[data-addcode]')) return friendAct('req',($('#cCode').value||'').trim().toLowerCase());
  if(e.target.closest('[data-newgc]')) return newGroup();
  if(e.target.closest('[data-gcinfo]')) return groupInfo();
}
var lastDraw='';
function drawChat(force){ var d=$('#chatP'); if(!d) return;
  var inTh=!!CH.th, isPub=!inTh&&CH.tab==='pub';
  $('[data-back]',d).hidden=!inTh; $('#cTabs').hidden=inTh;
  $('#cTabs').querySelectorAll('[data-tab]').forEach(function(b){ var k=b.getAttribute('data-tab'); b.setAttribute('aria-pressed',k===CH.tab);
    var R=readMap(), n=(LV.ts||[]).filter(function(t){ return t.k===(k==='fr'?'dm':'gc')&&t.q>(R[t.t]||0); }).length+(k==='fr'?((LV.fr&&LV.fr.req)||[]).length:0);
    b.textContent=(k==='pub'?'Public':k==='fr'?'Friends':'Groups')+(k!=='pub'&&n?' · '+n:''); });
  $('#cOn').textContent=LV.on?LV.online+' online':'connecting…';
  $('#cTitle').textContent=inTh?thName(CH.th):'Chat';
  var chs=LV.chs.filter(function(c){ return c!=='live'; });
  $('#cChs').hidden=!isPub; if(isPub) $('#cChs').innerHTML=chs.map(function(c){ return '<button type="button" data-ch="'+c+'" aria-pressed="'+(c===CH.ch)+'">#'+c+'</button>'; }).join('');
  if(!(isPub||inTh)) $('#cEm').hidden=true; $('#cEm').innerHTML=(LV.emotes||[]).slice(0,8).map(function(e){ return '<button type="button" class="btn sm" data-em="'+esc(e)+'" style="padding:4px 8px">'+esc(e)+'</button>'; }).join('');
  $('#cF').hidden=!(isPub||inTh); $('#cIn').placeholder=inTh?'Message '+thName(CH.th):({general:'Say hi to everyone',racing:'Talk Cube Race',help:'Ask a question'}[CH.ch]||'Say something nice');
  var box=$('#cM'), key, html;
  if(inTh){ key='th:'+CH.th+':'+CH.msgs.length+':'+(CH.msgs.length?CH.msgs[CH.msgs.length-1].s:0)+':'+(CH.typing||[]).join(','); html=CH.msgs.length?msgsHtml(CH.msgs)+(CH.typing&&CH.typing.length?'<div class="ctyp">'+esc(CH.typing.join(', '))+' typing…</div>':''):'<p class="empty2">No messages yet. Say hi!</p>'; }
  else if(isPub){ var L=LV.chat.filter(function(m){ return (m.ch||'general')===CH.ch; }); key=CH.ch+':'+(L.length?L[L.length-1].s:0)+':'+L.length+(LV.off?'off':''); html=LV.off?'<p class="empty2">Chat is turned off right now.</p>':L.length?msgsHtml(L):'<p class="empty2">No messages yet. Say hi!</p>'; }
  else { key=CH.tab+JSON.stringify([LV.ts,LV.fr,LV.fon,readMap(),Object.keys(CH.meta).length]); html=CH.tab==='fr'?friendsHtml():groupsHtml(); }
  if(!force&&key===lastDraw) return; lastDraw=key;
  var atEnd=box.scrollHeight-box.scrollTop-box.clientHeight<80; box.innerHTML=html; var pill=$('#cNew');
  if((isPub||inTh)&&(atEnd||force)){ box.scrollTop=box.scrollHeight; if(pill) pill.hidden=true; } else if((isPub||inTh)&&pill) pill.hidden=false;
  var fab=document.querySelector('.fab .chat'); if(fab){ var n=unread(); fab.textContent='💬 Chat'+(n?' · '+n:''); } }
var AVC=['#2650f5','#e1352b','#1f9a52','#f2b600','#7a5cff','#ff7a1a','#12a3b8','#c43d8b'];
function hue(p){ var h=0; p=String(p||''); for(var i=0;i<p.length;i++) h=(h*31+p.charCodeAt(i))>>>0; return AVC[h%AVC.length]; }
function hm(t){ return new Date(t).toLocaleTimeString('en-MY',{hour:'numeric',minute:'2-digit'}); }
function dayLbl(t){ var d=new Date(t), n=new Date(), y=new Date(n-86400000); return d.toDateString()===n.toDateString()?'Today':d.toDateString()===y.toDateString()?'Yesterday':d.toLocaleDateString('en-MY',{day:'numeric',month:'short'}); }
function msgsHtml(L){ var h='', prev=null;
  L.forEach(function(m){ var mine=!!(LV.me&&m.p===LV.me), at=m.at||0, newDay=!prev||new Date(prev.at||0).toDateString()!==new Date(at).toDateString(), first=newDay||!prev||prev.p!==m.p||(at-(prev.at||0))>300000;
    if(newDay&&at) h+='<div class="cday">'+dayLbl(at)+'</div>';
    h+='<div class="cmsg'+(mine?' me':'')+(first?' first':'')+'">'
      +(!mine?(first?'<button type="button" class="av" data-who="'+esc(m.p||'')+'" data-n="'+esc(m.n)+'" style="background:'+hue(m.p)+'" aria-label="'+esc(m.n)+'">'+esc((m.n||'?').slice(0,1).toUpperCase())+'</button>':'<span class="av sp0"></span>'):'')
      +'<div class="cb2">'+(first&&!mine?'<div class="who2"><button type="button" class="nm" data-who="'+esc(m.p||'')+'" data-n="'+esc(m.n)+'">'+esc(m.n)+'</button>'+(m.ct?'<span class="tag">'+esc(m.ct)+'</span>':'')+'<span class="lvs">Lv '+(m.lv||0)+'</span></div>':'')
      +'<div class="bub'+(m.em?' em':'')+'" title="'+(at?hm(at):'')+'">'+esc(m.t)+'</div>'+(at&&(first||mine)?'<small class="tm">'+hm(at)+'</small>':'')+'</div></div>';
    prev=m; });
  return h; }
function msgHtml(m){ return msgsHtml([m]); }
function isFriend(p){ return !!(LV.fr&&LV.fr.f.some(function(x){ return x.p===p; })); }
function isOnline(p){ return (LV.fon||[]).indexOf(p)>=0; }
function friendsHtml(){ var F=LV.fr||{f:[],req:[]}, R=readMap(), dm={}; (LV.ts||[]).forEach(function(t){ if(t.k==='dm') dm[t.t]=t; });
  var h='<div class="pnl" style="padding:12px;margin-bottom:10px"><div class="eyebrow">Your friend code</div><div class="row" style="margin-top:4px"><b class="mono" style="font-size:20px;letter-spacing:.08em">'+esc((LV.me||'…').toUpperCase())+'</b><span class="sp"></span><button class="btn sm" type="button" onclick="CW.copy(\''+esc((LV.me||'').toUpperCase())+'\',this)">Copy</button></div>'
    +'<div class="row" style="margin-top:8px"><input class="in mono" id="cCode" maxlength="12" placeholder="Friend’s code" style="flex:1;text-transform:uppercase"><button class="btn sm pri" type="button" data-addcode>Add</button></div><small class="muted">Or tap someone’s name in Public chat.</small></div>';
  if(F.req&&F.req.length) h+='<div class="eyebrow" style="margin:6px 0">Friend requests</div>'+F.req.map(function(x){ return '<div class="row" style="padding:6px 0"><b>'+esc(x.n)+'</b><small class="muted">Lv '+x.lv+'</small><span class="sp"></span><button class="btn sm pri" data-fa="accept" data-p="'+esc(x.p)+'">Accept</button><button class="btn sm" data-fa="decline" data-p="'+esc(x.p)+'">No</button></div>'; }).join('');
  h+='<div class="eyebrow" style="margin:10px 0 6px">Friends · '+F.f.length+'</div>';
  h+=F.f.length?F.f.map(function(x){ var tid=dmTid(x.p), t=tid&&dm[tid], n=t&&t.q>(R[tid]||0);
    return '<div class="row" style="padding:7px 0;border-bottom:1px solid var(--line)"><span style="width:8px;height:8px;border-radius:50%;background:'+(isOnline(x.p)?'var(--good)':'var(--line2)')+'"></span><span style="flex:1;min-width:0"><b>'+esc(x.n)+'</b> <small class="muted">Lv '+x.lv+'</small>'+(t&&t.lt?'<br><small class="muted">'+esc((t.ln?t.ln+': ':'')+t.lt)+'</small>':'')+'</span>'+(n?'<span class="cartn">new</span>':'')+'<button class="btn sm pri" data-dm="'+esc(x.p)+'" data-n="'+esc(x.n)+'">Message</button></div>'; }).join(''):'<p class="empty2">No friends yet. Share your code or add someone from Public chat.</p>';
  return h; }
function dmTid(p){ var hit=null; Object.keys(CH.meta).forEach(function(k){ var m=CH.meta[k]; if(m.k==='dm'&&m.m.some(function(x){ return x.p===p; })) hit=k; }); return hit; }
function groupsHtml(){ var R=readMap(), G=(LV.ts||[]).filter(function(t){ return t.k==='gc'; }).sort(function(a,b){ return b.l-a.l; });
  return '<button class="btn pri wide" type="button" data-newgc style="margin-bottom:10px">+ New group chat</button><p class="muted" style="font-size:13px;margin:-4px 0 10px">Add anyone: people online, friends, or by code.</p>'+(G.length?G.map(function(t){ var m=CH.meta[t.t], n=t.q>(R[t.t]||0);
    return '<button type="button" class="row" data-open="'+esc(t.t)+'" style="width:100%;text-align:left;border:0;border-bottom:1px solid var(--line);background:none;padding:10px 2px;cursor:pointer"><span style="font-size:22px">👥</span><span style="flex:1;min-width:0"><b>'+esc(m?m.n:'Group chat')+'</b>'+(m?' <small class="muted">'+m.m.length+' people</small>':'')+(t.lt?'<br><small class="muted">'+esc((t.ln?t.ln+': ':'')+t.lt)+'</small>':'')+'</span>'+(n?'<span class="cartn">new</span>':'')+'</button>'; }).join(''):'<p class="empty2">No group chats yet. Start one!</p>'); }
function thName(tid){ var m=CH.meta[tid]; if(!m) return 'Chat'; if(m.k==='gc') return m.n||'Group chat'; var o=m.m.filter(function(x){ return x.p!==LV.me; })[0]; return o?o.n:'Friend'; }
async function loadMetas(){ var need=(LV.ts||[]).filter(function(t){ return !CH.meta[t.t]||CH.meta[t.t].mv!==t.mv; }).slice(0,12);
  for(var i=0;i<need.length;i++){ var r=await CW.call('/api/th/get',{id:CW.devId(),t:need[i].t,since:1e12},6000); if(r.ok&&r.data&&r.data.th) CH.meta[need[i].t]=r.data.th; }
  if(need.length) drawChat(false); }
async function openThread(tid){ CH.th=tid; CH.msgs=[]; CH.q=0; drawChat(true); await thPoll(true); clearInterval(CH.thT); CH.thT=setInterval(function(){ if(!CH.th||!$('#chatP')){ clearInterval(CH.thT); return; } thPoll(false); },2500); }
async function thPoll(first){ var tid=CH.th; var r=await CW.call('/api/th/get',{id:CW.devId(),t:tid,since:CH.q,open:1},6000); if(CH.th!==tid) return;
  if(!r.ok){ if(first){ CW.toast((r.data&&r.data.error)||'Could not open that chat.'); CH.th=null; drawChat(true); } return; }
  CH.meta[tid]=r.data.th; CH.typing=r.data.typing||[]; (r.data.msgs||[]).forEach(function(m){ if(m.s>CH.q){ CH.msgs.push(m); CH.q=m.s; } });
  var R=readMap(); R[tid]=Math.max(R[tid]||0,r.data.th.q); CW.setJ('cw2_thread_read',R); drawChat(first); }
async function thSend(text,em){ var tid=CH.th, m=CH.meta[tid], body={id:CW.devId()}; if(em) body.e=em; else body.text=text; var r;
  if(m&&m.k==='dm'&&!CH.msgs.length){ var o=m.m.filter(function(x){ return x.p!==LV.me; })[0]; r=await CW.call('/api/th/dm',Object.assign(body,{p:o.p}),6000); }
  else r=await CW.call('/api/th/send',Object.assign(body,{t:tid}),6000);
  if(!r.ok){ CW.toast((r.data&&r.data.error)||'Could not send.'); return; } if(!em) $('#cIn').value=''; thPoll(false); }
async function startDM(p,n){ var tid=dmTid(p); if(tid) return openThread(tid);
  /* no chat yet: the first message creates it */
  var fake='new:'+p; CH.meta[fake]={t:fake,k:'dm',n:'',m:[{p:p,n:n},{p:LV.me,n:PL.name()}],mv:0,q:0}; CH.th=fake; CH.msgs=[]; CH.q=0; drawChat(true); }
var _thSend=thSend; thSend=async function(text,em){ if(CH.th&&CH.th.indexOf('new:')===0){ var p=CH.th.slice(4), b={id:CW.devId(),p:p}; if(em) b.e=em; else b.text=text; var r=await CW.call('/api/th/dm',b,6000); if(!r.ok){ CW.toast((r.data&&r.data.error)||'Could not send.'); return; } $('#cIn').value=''; delete CH.meta[CH.th]; await PL.poll(); openThread(r.data.t); return; } return _thSend(text,em); };
PL.who=function(p,n){ return who(p,n); };
function who(p,n){ if(!p||p===LV.me) return; var fr=isFriend(p);
  var sh=CW.sheet('<div class="hd"><h2>'+esc(n)+'</h2><button class="x" data-close aria-label="Close">✕</button></div><div class="row">'+(fr?'<button class="btn pri" data-w="dm">Message</button><button class="btn" data-w="remove">Remove friend</button>':'<button class="btn pri" data-w="req">Add friend</button>')+'<button class="btn" data-w="gc">Start a group with them</button></div>');
  try{ if(PL.onWho) PL.onWho(sh,p,n); }catch(x){}
  sh.addEventListener('click',function(e){ var b=e.target.closest('[data-w]'); if(!b) return; var a=b.getAttribute('data-w'); if(a==='duel'||a==='x5') return; sh.close(); if(a==='dm'){ CH.tab='fr'; startDM(p,n); } else if(a==='gc') newGroup(p); else friendAct(a,p); }); }
async function friendAct(act,p){ if(!p){ CW.toast('Enter a friend code.'); return; } var r=await CW.call('/api/friend',{id:CW.devId(),act:act,p:p},6000);
  if(!r.ok){ CW.toast((r.data&&r.data.error)||'Could not do that.'); return; }
  CW.toast(act==='req'?(r.data.rel==='friend'?'You are now friends!':'Friend request sent.'):act==='accept'?'You are now friends!':act==='remove'?'Removed.':'Done.'); LV.fr=null; var c=$('#cCode'); if(c) c.value=''; await PL.poll(); drawChat(true); }
async function onlineList(box,q,skip,mode){ box.innerHTML='<p class="muted" style="font-size:13px">Loading people online…</p>';
  var r=await CW.call('/api/online',{id:CW.devId(),q:q||''},6000), L=r.ok?(r.data.list||[]).filter(function(x){ return (skip||[]).indexOf(x.p)<0; }):[];
  box.innerHTML=L.length?L.map(function(x){ return mode==='btn'?'<div class="row" style="padding:4px 0"><span style="width:8px;height:8px;border-radius:50%;background:var(--good)"></span><span>'+esc(x.n)+' <small class="muted">Lv '+x.lv+'</small></span><span class="sp"></span><button class="btn sm" data-g="add" data-p="'+esc(x.p)+'">Add</button></div>'
    :'<label class="row" style="padding:6px 0;cursor:pointer"><input type="checkbox" value="'+esc(x.p)+'"> <span style="width:8px;height:8px;border-radius:50%;background:var(--good)"></span>'+esc(x.n)+' <small class="muted">Lv '+x.lv+'</small></label>'; }).join(''):'<p class="muted" style="font-size:13px">'+(r.ok?'Nobody else matches right now.':'Could not load who is online.')+'</p>'; }
function codes(v){ return String(v||'').toLowerCase().split(/[\s,]+/).map(function(x){ return x.replace(/[^a-z0-9]/g,''); }).filter(Boolean); }
function newGroup(pre){ var F=(LV.fr&&LV.fr.f)||[];
  var sh=CW.sheet('<div class="hd"><h2>New group chat</h2><button class="x" data-close aria-label="Close">✕</button></div><div class="field"><label>Group name</label><input class="in" id="gN" maxlength="24" placeholder="Group chat"></div><div class="field"><label>Add people by their code</label><input class="in mono" id="gC" placeholder="e.g. VKAJIC52 81GHSQJJ" value="'+esc((pre||'').toUpperCase())+'" style="text-transform:uppercase"><small class="muted">Anyone can be added. Separate codes with spaces. Up to 9 people.</small></div>'
    +'<div class="eyebrow" style="margin:10px 0 6px">People online now</div><input class="in" id="gQ" placeholder="Search a name" style="width:100%;margin-bottom:4px"><div id="gOn" style="max-height:220px;overflow:auto"></div>'
    +(F.length?'<div class="eyebrow" style="margin:10px 0 6px">Your friends</div>':'')+F.map(function(x){ return '<label class="row" style="padding:6px 0;cursor:pointer"><input type="checkbox" value="'+esc(x.p)+'"> '+esc(x.n)+'</label>'; }).join('')+'<button class="btn pri wide" id="gGo" style="margin-top:12px">Create</button>');
  var gOn=$('#gOn',sh), qT=0; onlineList(gOn,''); $('#gQ',sh).oninput=function(){ var v=this.value.trim(); clearTimeout(qT); qT=setTimeout(function(){ onlineList(gOn,v); },300); };
  $('#gGo',sh).onclick=async function(){ var ps=[].map.call(sh.querySelectorAll('input[type=checkbox]:checked'),function(i){ return i.value; }).concat(codes($('#gC',sh).value)).filter(function(x,i,a){ return x!==LV.me&&a.indexOf(x)===i; }).slice(0,9); if(!ps.length){ CW.toast('Add at least one person.'); return; }
    var r=await CW.call('/api/th/gc',{id:CW.devId(),act:'create',name:$('#gN',sh).value.trim(),ps:ps},6000); if(!r.ok){ CW.toast((r.data&&r.data.error)||'Could not create the group.'); return; }
    sh.close(); CH.meta[r.data.t]=r.data.th; CH.tab='gc'; await PL.poll(); openThread(r.data.t); }; }
function groupInfo(){ var m=CH.meta[CH.th]; if(!m||m.k!=='gc') return; var own=m.own===LV.me, F=(LV.fr&&LV.fr.f)||[], add=F.filter(function(x){ return !m.m.some(function(y){ return y.p===x.p; }); });
  var sh=CW.sheet('<div class="hd"><h2>'+esc(m.n)+'</h2><button class="x" data-close aria-label="Close">✕</button></div><div class="eyebrow">'+m.m.length+' people</div>'
    +m.m.map(function(x){ return '<div class="row" style="padding:6px 0"><span>'+esc(x.n)+(x.p===m.own?' <span class="tag">owner</span>':'')+'</span><span class="sp"></span>'+(own&&x.p!==LV.me?'<button class="btn sm" data-g="kick" data-p="'+esc(x.p)+'">Remove</button>':'')+'</div>'; }).join('')
    +'<div class="row" style="margin-top:12px"><input class="in mono" id="gAc" placeholder="Add by code" style="flex:1;text-transform:uppercase"><button class="btn sm pri" data-g="addcode">Add</button></div>'
    +(add.length?'<div class="eyebrow" style="margin:12px 0 6px">Add friends</div>'+add.map(function(x){ return '<div class="row" style="padding:4px 0"><span>'+esc(x.n)+'</span><span class="sp"></span><button class="btn sm" data-g="add" data-p="'+esc(x.p)+'">Add</button></div>'; }).join(''):'')
    +'<div class="eyebrow" style="margin:12px 0 6px">Add people online</div><div id="gIo" style="max-height:200px;overflow:auto"></div>'
    +'<button class="btn wide" data-g="leave" style="margin-top:14px">Leave group</button>');
  onlineList($('#gIo',sh),'',m.m.map(function(x){ return x.p; }),'btn');
  sh.addEventListener('click',async function(e){ var b=e.target.closest('[data-g]'); if(!b) return; var a=b.getAttribute('data-g'), x={id:CW.devId(),act:a,t:CH.th}; if(a==='add') x.ps=[b.getAttribute('data-p')]; if(a==='addcode'){ x.act='add'; x.ps=codes($('#gAc',sh).value); if(!x.ps.length){ CW.toast('Enter a code.'); return; } } if(a==='kick') x.p=b.getAttribute('data-p');
    var r=await CW.call('/api/th/gc',x,6000); if(!r.ok){ CW.toast((r.data&&r.data.error)||'Could not do that.'); return; } sh.close(); if(a==='leave'){ CH.th=null; clearInterval(CH.thT); delete CH.meta[x.t]; await PL.poll(); drawChat(true); } else { CH.meta[x.t].mv=-1; thPoll(false); } }); }
async function sendChat(b){ var r=await CW.call('/api/chat/send',Object.assign({id:CW.devId(),ch:CH.ch},b),6000);
  if(r.ok){ if(b.text) $('#cIn').value=''; PL.poll(); } else CW.toast((r.data&&r.data.error)||'Could not send. Try again.'); }
function badge(){ var fab=document.querySelector('.fab .chat'); if(fab){ var n=unread(); fab.textContent='💬 Chat'+(n?' · '+n:''); } }
PL.onLive(function(){ loadMetas(); drawChat(false); badge(); });
/* group title tap shows members */
document.addEventListener('click',function(e){ if(CH.th&&e.target.closest('#cTitle')) groupInfo(); });

/* ================= start ================= */
function start(){ CW.ev('play'); $$('[data-theme-toggle]').forEach(function(b){ b.onclick=CW.toggleTheme; }); xpState(); hud(); route(); poll(); setInterval(hud,30000); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else setTimeout(start,0);
})();
