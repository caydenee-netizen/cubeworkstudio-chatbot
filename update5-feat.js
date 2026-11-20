/* Update 5 features: 1v1 duels, mystery crates, profile cards and community Cube Dash levels. Everything switches on through PL.onUpd5. */
(function(){
var $=CW.$, esc=CW.esc, LV=PL.live, VIEWS={};
function me(){ return CW.devId(); }
function api(p,b,ms){ return CW.call(p,Object.assign({id:me()},b||{}),ms||8000); }
function err(r,d){ return (r&&r.data&&r.data.error)||d||'Could not reach Cuber Tools. Try again.'; }
function ok(r){ return r&&r.ok&&r.data&&r.data.ok; }
function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} return null; }
function F(ms){ return ms<0?'DNF':PL.fmt(ms); }
function E(){ return window.CWRaceEngine; }
var SPECIAL=function(s){ return !!(s.secret||s.founder||s.gift||s.owner||s.lb||s.cz||s.hw||s.season); };
function skinBg(i,w,h){ var u=null; try{ if(window.CW_PADART&&CW_PADART.art[i]) u=CW_PADART.paint(i,w||160,h||160,1); }catch(e){} return u?'center/cover no-repeat url('+u+')':PL.skins.css(i); }
function ownedSkins(){ return PL.skins.owned().filter(function(i){ return PL.skins.of(i); }); }

/* ================= profile cards ================= */
var BANNERS=['linear-gradient(120deg,#7a5cff,#ff6ad5)','linear-gradient(120deg,#12a3b8,#43e97b)','linear-gradient(120deg,#ff512f,#f09819)','linear-gradient(120deg,#0f2027,#2c5364)','linear-gradient(120deg,#e53935,#1e88e5)','linear-gradient(120deg,#fdd835,#fb8c00)','linear-gradient(120deg,#232526,#9b7bff)','linear-gradient(120deg,#43a047,#c9f7e0)'];
var BADGES=[
 ['🧊','First solve',function(c){ return c.n>=1; }],['💯','100 solves',function(c){ return c.n>=100; }],['🏋️','1,000 solves',function(c){ return c.n>=1000; }],
 ['🏃','Sub-30 single',function(c){ return c.s&&c.s<30000; }],['⚡','Sub-20 single',function(c){ return c.s&&c.s<20000; }],['🚀','Sub-15 single',function(c){ return c.s&&c.s<15000; }],['💎','Sub-10 single',function(c){ return c.s&&c.s<10000; }],
 ['📈','Sub-20 Ao5',function(c){ return c.a5&&c.a5<20000; }],['🔥','Sub-15 Ao5',function(c){ return c.a5&&c.a5<15000; }],
 ['🟦','10 Dash levels',function(c){ return c.dl>=10; }],['🌟','25 Dash levels',function(c){ return c.dl>=25; }],['👑','35 Dash levels',function(c){ return c.dl>=35; }],
 ['🎨','10 pad skins',function(c){ return c.ns>=10; }],['🖼️','25 pad skins',function(c){ return c.ns>=25; }],
 ['⚔️','First duel win',function(c){ return c.dw>=1; }],['🏆','10 duel wins',function(c){ return c.dw>=10; }],
 ['📦','10 crates opened',function(c){ return c.cr>=10; }],['🛠️','Published a level',function(c){ return c.pub>=1; }],
 ['🎖️','Level 10',function(c){ return c.lv>=10; }],['🏅','Level 25',function(c){ return c.lv>=25; }]];
function myStats(){ var d=PL.T.data(), L=(d.solves['333']||[]).filter(Boolean), n=0; Object.keys(d.solves).forEach(function(k){ n+=(d.solves[k]||[]).filter(Boolean).length; });
  var dsh=CW.lsJ('cw_dash',{})||{}, bst=dsh.best||{}, dl=Object.keys(bst).filter(function(k){ return /^\d+$/.test(k)&&bst[k]>=100; }).length, own=ownedSkins();
  var rs=0, rv=-1; own.forEach(function(i){ var s=PL.skins.of(i); if(!s||i===0) return; var v=SPECIAL(s)?1e6+i:(+s.cost||0); if(v>rv){ rv=v; rs=i; } });
  var cr=(CW.lsJ('cw_crates',{})||{}).n||0, lv=PL.level?PL.level().L||0:0, rec=CW.lsJ('cw_duelrec',{w:0,l:0})||{};
  return {n:n,s:PL.T.best(L)||0,a5:bestAo5(L)||0,dl:dl,ns:own.length,rs:rs,dw:rec.w||0,cr:cr,pub:+ls('cw_dl_pub')||0,lv:lv,car:E()?E().curCar():0}; }
function bestAo5(L){ var b=null; for(var i=5;i<=L.length;i++){ var a=PL.T.ao(L.slice(0,i),5); if(a!=null&&a!==Infinity&&(b==null||a<b)) b=a; } return b; }
function earned(c){ return BADGES.map(function(b,i){ return b[2](c)?i:-1; }).filter(function(i){ return i>=0; }); }
function myCfg(){ var o=CW.lsJ('cw_pcard',{})||{}; return {bn:Math.max(0,Math.min(BANNERS.length-1,+o.bn||0)),bd:Array.isArray(o.bd)?o.bd:[],bio:String(o.bio||'').slice(0,60),rs:+o.rs||0}; }
var lastPub=0;
async function publish(force){ if(!on()) return; if(!force&&Date.now()-lastPub<10*60000) return; lastPub=Date.now(); var c=myStats(), g=myCfg(), e=earned(c), bd=g.bd.filter(function(i){ return e.indexOf(i)>=0; }); if(!bd.length) bd=e.slice(-3).reverse();
  var rs=g.rs&&PL.skins.has(g.rs)?g.rs:c.rs;
  return api('/api/pc',{act:'set',own:PL.skins.owned(),c:{bn:g.bn,s:c.s,a5:c.a5,n:c.n,rs:rs,car:c.car,bd:bd,nb:e.length,dl:c.dl,bio:g.bio}},8000); }
function cardHtml(k,mine){ var pc=k.pc||{}, bn=BANNERS[pc.bn||0]||BANNERS[0], rs=pc.rs||k.sk||0, carN=E()&&E().CARDEF[pc.car]?E().CARDEF[pc.car].n:'';
  var st=[['Best single',pc.s?F(pc.s):'–'],['Best Ao5',pc.a5?F(pc.a5):'–'],['Solves',(pc.n||0).toLocaleString()],['Dash levels',(pc.dl||0)+' cleared'],['Duels',(k.dw||0)+' W · '+(k.dl||0)+' L']];
  return '<div class="pc5"><div class="pc5-bn" style="background:'+bn+'"><i></i></div><div class="pc5-av" style="background:'+skinBg(rs)+'"></div>'
   +'<div class="pc5-nm"><h3>'+esc(k.n||'Cuber')+'</h3><span class="pc5-lv">Lv '+(k.lv||0)+'</span>'+(k.on?'<span class="pc5-on">● online</span>':'')+'</div>'
   +(pc.bio?'<p class="pc5-bio">“'+esc(pc.bio)+'”</p>':'')
   +'<div class="pc5-st">'+st.map(function(r,i){ return '<div style="animation-delay:'+(.15+i*.06)+'s"><small>'+r[0]+'</small><b>'+r[1]+'</b></div>'; }).join('')+'</div>'
   +'<div class="pc5-bd">'+(pc.bd&&pc.bd.length?pc.bd.map(function(i,j){ var b=BADGES[i]; return b?'<span title="'+esc(b[1])+'" style="animation-delay:'+(.45+j*.1)+'s"><em>'+b[0]+'</em><small>'+esc(b[1])+'</small></span>':''; }).join(''):'<small class="muted">No badges shown yet</small>')+'</div>'
   +'<div class="pc5-ft"><small>'+(pc.nb?pc.nb+' badge'+(pc.nb===1?'':'s')+' earned':'')+'</small><small>'+(PL.skins.of(rs)?'Showcase: '+esc(PL.skins.name(rs)):'')+(carN?' · Car: '+esc(carN):'')+'</small></div>'
   +(pc.s==null&&!k.pc?'<p class="muted" style="font-size:13px;margin:8px 0 0">'+(mine?'Open your card to publish your stats.':'This cuber has not set up their card yet.')+'</p>':'')+'</div>'; }
async function loadCard(box,p){ box.innerHTML='<div class="pc5 sk"></div>'; var r=await api('/api/pc',{act:'get',p:p||''},7000); if(!ok(r)||!r.data.card){ box.innerHTML='<p class="muted">'+esc(err(r,'Could not load this card.'))+'</p>'; return null; } box.innerHTML=cardHtml(r.data.card,r.data.card.me); return r.data.card; }
PL.onWho=function(sh,p,n){ if(!on()) return; var bx=sh.querySelector('.box'); if(!bx) return; var hd=bx.querySelector('.hd'), c=document.createElement('div'); c.className='pc5-wrap'; hd.parentNode.insertBefore(c,hd.nextSibling); if(hd) hd.querySelector('h2').textContent='Profile';
  loadCard(c,p); var row=bx.querySelector('.row'); if(row){ var b=document.createElement('button'); b.className='btn pri'; b.type='button'; b.setAttribute('data-w','duel'); b.textContent='⚔️ Duel'; row.insertBefore(b,row.firstChild); b.onclick=function(){ if(sh.close) sh.close(); else sh.remove(); challenge({p:p,n:n}); }; } };
VIEWS.card={show:function(el){ var g=myCfg(), c=myStats(), e=earned(c);
  el.innerHTML='<div class="wrap">'+PL.crumbs('Profile card')+'<div class="pc5-grid"><div><div id="pcMine" class="pc5-wrap"></div><p class="muted" style="font-size:13px;text-align:center;margin-top:8px">This is what other cubers see when they tap your name.</p></div>'
   +'<div class="pnl"><h3>Banner</h3><div class="pc5-bns" id="pcBn">'+BANNERS.map(function(b,i){ return '<button type="button" data-b="'+i+'" aria-pressed="'+(g.bn===i)+'" style="background:'+b+'" aria-label="Banner '+(i+1)+'"></button>'; }).join('')+'</div>'
   +'<h3 style="margin-top:16px">Showcase skin</h3><select class="in" id="pcRs" style="width:100%"><option value="0">Rarest one I own</option>'+ownedSkins().filter(function(i){ return i>0; }).map(function(i){ return '<option value="'+i+'"'+(g.rs===i?' selected':'')+'>'+esc(PL.skins.name(i))+'</option>'; }).join('')+'</select>'
   +'<h3 style="margin-top:16px">Badges <small class="muted">'+e.length+' of '+BADGES.length+' earned · pick up to 3 to show</small></h3><div class="pc5-pick" id="pcBd">'+BADGES.map(function(b,i){ var got=e.indexOf(i)>=0; return '<button type="button" data-d="'+i+'" '+(got?'':'disabled')+' aria-pressed="'+(g.bd.indexOf(i)>=0)+'"><em>'+b[0]+'</em><small>'+esc(b[1])+'</small></button>'; }).join('')+'</div>'
   +'<h3 style="margin-top:16px">Bio</h3><input class="in" id="pcBio" maxlength="60" placeholder="A short line about you" value="'+esc(g.bio)+'" style="width:100%"><div class="row" style="margin-top:14px"><button class="btn pri" id="pcSave" type="button">Save card</button></div></div></div></div>';
  var save=async function(){ var r=await publish(true); if(ok(r)) loadCard($('#pcMine'),''); else CW.toast(err(r)); };
  $('#pcBn').onclick=function(ev){ var b=ev.target.closest('[data-b]'); if(!b) return; g.bn=+b.getAttribute('data-b'); CW.setJ('cw_pcard',g); Array.prototype.forEach.call(this.children,function(x){ x.setAttribute('aria-pressed',x===b); }); save(); };
  $('#pcBd').onclick=function(ev){ var b=ev.target.closest('[data-d]'); if(!b||b.disabled) return; var i=+b.getAttribute('data-d'), k=g.bd.indexOf(i); if(k>=0) g.bd.splice(k,1); else { if(g.bd.length>=3) return CW.toast('Pick up to 3 badges. Tap one to remove it first.'); g.bd.push(i); } b.setAttribute('aria-pressed',g.bd.indexOf(i)>=0); CW.setJ('cw_pcard',g); };
  $('#pcRs').onchange=function(){ g.rs=+this.value||0; CW.setJ('cw_pcard',g); save(); };
  $('#pcSave').onclick=async function(){ g.bio=$('#pcBio').value.trim().slice(0,60); CW.setJ('cw_pcard',g); var r=await publish(true); if(ok(r)){ CW.toast('Card saved.'); loadCard($('#pcMine'),''); } else CW.toast(err(r)); };
  if(PL.g6&&PL.g6.on()){ var gb=PL.g6.badges(), gp=document.createElement('div'); gp.className='pnl'; gp.style.marginTop='14px'; gp.innerHTML='<h3>Game badges</h3>'+(gb.length?'<div class="pc6-bd">'+gb.map(function(b){ return '<span title="'+b.n+'"><i>'+b.i+'</i>'+b.n+'</span>'; }).join('')+'</div>':'<p class="muted" style="margin:0">Earn badges in Cube Escape and they show here.</p>'); var wr=el.querySelector('.wrap'); if(wr) wr.appendChild(gp); }
  publish(true).then(function(){ loadCard($('#pcMine'),''); }); }};

/* ================= duels ================= */
var DU={list:[],rec:{w:0,l:0},t:0};
function challenge(pre){ var stakes=[0,50,100,250,500,1000], tk=PL.tok();
  var sh=CW.sheet('<div class="hd"><h2>⚔️ Challenge to a duel</h2><button class="x" data-close aria-label="Close">✕</button></div><p class="muted" style="margin-top:0">You both solve the same 3 scrambles. Best of 3 wins and takes both stakes. Ties go to extra rounds.</p>'
    +(pre&&pre.p?'<p>Opponent: <b>'+esc(pre.n||'')+'</b></p>':'<div class="field"><label>Their username</label><input class="in" id="duTo" maxlength="24" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Exact username" style="width:100%"></div>')
    +'<div class="field"><label>Stake (each player puts this in)</label><div class="seg" id="duSt">'+stakes.map(function(s,i){ return '<button type="button" data-s="'+s+'" aria-pressed="'+(i===2&&tk>=100||i===0&&tk<100)+'"'+(s>tk?' disabled':'')+'>'+(s?s.toLocaleString():'Free')+'</button>'; }).join('')+'</div><small class="muted">You have '+tk.toLocaleString()+' tokens. Your stake comes back if they decline or do not answer within a day.</small></div>'
    +'<button class="btn pri wide" id="duGo" style="margin-top:12px">Send challenge</button>');
  var st=tk>=100?100:0; $('#duSt',sh).onclick=function(e){ var b=e.target.closest('[data-s]'); if(!b||b.disabled) return; st=+b.getAttribute('data-s'); Array.prototype.forEach.call(this.children,function(x){ x.setAttribute('aria-pressed',x===b); }); };
  $('#duGo',sh).onclick=async function(){ var to=pre&&pre.p?'':($('#duTo',sh).value||'').trim(); if(!(pre&&pre.p)&&!to) return CW.toast('Type a username.'); if(st&&!PL.spend(st)) return CW.toast('Not enough tokens for that stake.');
    this.disabled=true; var r=await api('/api/duel',{act:'new',to:to,p:pre&&pre.p||'',stake:st}); this.disabled=false;
    if(!ok(r)){ if(st) PL.add(st); CW.toast(err(r)); return; } sh.close(); CW.toast('Challenge sent to '+(r.data.name||'them')+'.'); if(/^#duels/.test(location.hash)) duRefresh(); else location.hash='duels'; }; }
PL.duelWith=challenge;
async function duRefresh(){ var r=await api('/api/duel',{act:'list'},7000); if(!ok(r)){ var b=$('#duList'); if(b&&!DU.list.length) b.innerHTML='<p class="muted">'+esc(err(r))+'</p>'; return; } DU.list=r.data.list||[]; DU.rec=r.data.rec||DU.rec; CW.setJ('cw_duelrec',DU.rec); duDraw(); }
function duRow(d){ var wa=d.r.filter(function(x){ return x.w==='me'; }).length, wb=d.r.filter(function(x){ return x.w==='op'; }).length, cur=d.r[d.r.length-1], my=cur&&cur.my==null, act='';
  if(d.st==='pend') act=d.mine?'<span class="tag">Waiting for '+esc(d.op)+'</span><button class="btn sm" data-du="cancel" data-k="'+d.k+'">Cancel</button>':'<button class="btn sm pri" data-du="accept" data-k="'+d.k+'" data-s="'+d.stake+'">Accept</button><button class="btn sm" data-du="decline" data-k="'+d.k+'">Decline</button>';
  else if(d.st==='on') act=d.g?'<span class="tag">Cube Escape race (game removed)</span>':my?'<button class="btn sm pri" data-du="play" data-k="'+d.k+'">▶ Solve round '+d.r.length+'</button>':'<span class="tag">'+esc(d.op)+' is solving round '+d.r.length+'</span>';
  else act='<span class="tag '+(d.w==='me'?'g':'')+'">'+({done:d.w==='me'?'🏆 You won'+(d.stake?' +'+(d.stake*2).toLocaleString():''):'You lost',draw:'Draw · stakes back',decl:'Declined',cancel:'Cancelled',exp:'Expired'}[d.st]||d.st)+'</span>';
  return '<div class="du5-row'+(d.st==='on'&&my||d.st==='pend'&&!d.mine?' hot':'')+'"><div class="du5-top"><b>'+(d.mine?'You vs ':'')+esc(d.op)+(d.mine?'':' challenged you')+'</b><span class="sp"></span>'+(d.stake?'<span class="chipb tok">🪙 '+d.stake.toLocaleString()+'</span>':'<span class="chipb">Free</span>')+'</div>'
   +(d.r.length?'<div class="du5-sc"><span class="du5-big">'+wa+' – '+wb+'</span>'+d.r.map(function(x){ return '<span class="du5-r '+(x.w==='me'?'w':x.w==='op'?'l':'')+'">R'+(x.i+1)+' '+(x.my==null?'·':F(x.my))+' vs '+(x.op==null?'·':x.op==='done'?'✓':F(x.op))+'</span>'; }).join('')+'</div>':'')
   +'<div class="row" style="gap:8px;margin-top:8px">'+act+'</div></div>'; }
function duDraw(){ var b=$('#duList'); if(!b) return; var R=$('#duRec'); if(R) R.textContent=DU.rec.w+' W · '+DU.rec.l+' L'; b.innerHTML=DU.list.length?DU.list.map(duRow).join(''):'<p class="muted">No duels yet. Challenge someone and see who is faster.</p>'; }
VIEWS.duels={show:function(el){ el.innerHTML='<div class="wrap">'+PL.crumbs('Duels')+'<div class="du5-hero"><div><div class="eyebrow">1v1 · same scramble · best of 3</div><h2>Who is faster?</h2><p class="muted">Challenge any cuber, even if they are offline. Winner takes both stakes.</p></div><div class="du5-rec"><small>Your record</small><b id="duRec">'+DU.rec.w+' W · '+DU.rec.l+' L</b></div></div>'
   +'<div class="row" style="gap:10px;margin:0 0 16px"><button class="btn pri" id="duNew" type="button">⚔️ New challenge</button><button class="btn" id="duOn" type="button">Challenge someone online</button></div><div id="duOnL"></div><div id="duList"><p class="muted">Loading duels…</p></div></div>';
  $('#duNew').onclick=function(){ challenge(null); };
  $('#duOn').onclick=async function(){ var box=$('#duOnL'); box.innerHTML='<p class="muted">Loading…</p>'; var r=await CW.call('/api/online',{id:me(),q:''},6000), L=r.ok?(r.data.list||[]):[]; box.innerHTML=L.length?'<div class="pnl du5-on">'+L.slice(0,12).map(function(x){ return '<div class="row"><span class="pc5-on">●</span><span>'+esc(x.n)+' <small class="muted">Lv '+x.lv+'</small></span><span class="sp"></span><button class="btn sm" data-ch="'+esc(x.p)+'" data-n="'+esc(x.n)+'">Challenge</button></div>'; }).join('')+'</div>':'<p class="muted">Nobody else is online right now. You can still challenge them by username.</p>'; };
  el.onclick=async function(e){ var c=e.target.closest('[data-ch]'); if(c) return challenge({p:c.getAttribute('data-ch'),n:c.getAttribute('data-n')});
    var b=e.target.closest('[data-du]'); if(!b) return; var a=b.getAttribute('data-du'), k=b.getAttribute('data-k');
    if(a==='play'){ var d=DU.list.filter(function(x){ return x.k===k; })[0]; if(d) solve(d); return; }
    if(a==='accept'){ var s=+b.getAttribute('data-s')||0; if(s&&!PL.spend(s)) return CW.toast('You need '+s.toLocaleString()+' tokens to match the stake.'); b.disabled=true; var r=await api('/api/duel',{act:'accept',k:k}); if(!ok(r)){ if(s) PL.add(s); b.disabled=false; return CW.toast(err(r)); } CW.toast('Duel on! Solve round 1.'); duRefresh(); return; }
    if(a==='decline'||a==='cancel'){ b.disabled=true; var r2=await api('/api/duel',{act:a,k:k}); if(!ok(r2)){ b.disabled=false; return CW.toast(err(r2)); } CW.toast(a==='cancel'?'Cancelled. Your stake is on its way back.':'Declined.'); duRefresh(); } };
  duRefresh(); clearInterval(DU.t); DU.t=setInterval(function(){ if(!$('#duList')){ clearInterval(DU.t); return; } if(!document.hidden&&!$('.du5-play')) duRefresh(); },6000); },
  leave:function(){ clearInterval(DU.t); }};
/* the duel solve: hold to get ready, let go to start, tap or any key to stop. Leaving mid-solve counts as a DNF. */
function solve(d){ var r=d.r[d.r.length-1], key='cw_du_'+d.k+'_'+r.i;
  if(ls(key)==='run'){ CW.toast('You left that solve after starting, so round '+(r.i+1)+' counts as a DNF.'); send(-1); return; }
  var ov=document.createElement('div'); ov.className='du5-play'; ov.innerHTML='<div class="du5-ph"><span>Round '+(r.i+1)+' vs <b>'+esc(d.op)+'</b></span><span class="sp"></span><button type="button" class="btn sm" id="dpX">Close</button></div><div class="du5-scr">'+esc(r.s)+'</div><div class="du5-pad" id="dpPad"><div class="du5-t" id="dpT">0.00</div><div class="du5-h" id="dpH">Scramble your cube, then hold here (or space) and let go to start</div></div><div class="row" style="justify-content:center"><button type="button" class="btn" id="dpDnf" hidden>I messed up (DNF)</button></div>';
  document.body.appendChild(ov); document.documentElement.classList.add('ucut-on');
  var st='idle', t0=0, raf=0, hT=0, pad=$('#dpPad',ov), T=$('#dpT',ov), Hn=$('#dpH',ov);
  function close(){ cancelAnimationFrame(raf); document.removeEventListener('keydown',kd,true); document.removeEventListener('keyup',ku,true); ov.remove(); document.documentElement.classList.remove('ucut-on'); }
  function down(){ if(st==='run'){ if(performance.now()-t0<300) return; stop(); return; } if(st!=='idle') return; st='hold'; pad.className='du5-pad hold'; hT=setTimeout(function(){ if(st==='hold'){ st='ready'; pad.className='du5-pad ready'; Hn.textContent='Let go to start'; } },400); }
  function up(){ clearTimeout(hT); if(st==='ready'){ st='run'; t0=performance.now(); ls(key,'run'); pad.className='du5-pad run'; Hn.textContent='Tap or press any key to stop'; $('#dpDnf',ov).hidden=false; $('#dpX',ov).hidden=true; (function f(){ T.textContent=((performance.now()-t0)/1000).toFixed(2); raf=requestAnimationFrame(f); })(); } else if(st==='hold'){ st='idle'; pad.className='du5-pad'; } }
  function stop(){ cancelAnimationFrame(raf); var ms=Math.round(performance.now()-t0); st='done'; T.textContent=F(ms); pad.className='du5-pad'; Hn.textContent='Sending your time…'; $('#dpDnf',ov).hidden=true; send(ms,close); }
  function kd(e){ if(e.repeat) return; if(st==='run'){ e.preventDefault(); down(); return; } if(e.key===' '||e.code==='Space'){ e.preventDefault(); down(); } if(e.key==='Escape'&&st==='idle') close(); }
  function ku(e){ if(e.key===' '||e.code==='Space'){ e.preventDefault(); up(); } }
  pad.addEventListener('pointerdown',function(e){ e.preventDefault(); down(); }); pad.addEventListener('pointerup',function(e){ e.preventDefault(); up(); });
  document.addEventListener('keydown',kd,true); document.addEventListener('keyup',ku,true);
  $('#dpX',ov).onclick=function(){ if(st!=='run') close(); };
  $('#dpDnf',ov).onclick=function(e){ e.stopPropagation(); cancelAnimationFrame(raf); st='done'; T.textContent='DNF'; send(-1,close); };
  async function send(ms,done){ var q=await api('/api/duel',{act:'submit',k:d.k,ms:ms<0?0:ms,dnf:ms<0?1:0},9000); if(ok(q)){ ls(key,null); var dv=q.data.duel, rr=dv.r[r.i];
      var msg=dv.st==='done'?(dv.w==='me'?'🏆 You won the duel!':'You lost the duel. Rematch?'):dv.st==='draw'?'It is a draw. Stakes returned.':rr&&rr.w?(rr.w==='me'?'You took round '+(r.i+1)+'!':rr.w==='op'?d.op+' took round '+(r.i+1)+'.':'Round '+(r.i+1)+' was a tie.'):'Time sent. Waiting for '+d.op+'.';
      CW.toast(msg); if(dv.st==='done'&&dv.w==='me') confetti(); } else CW.toast(err(q,'Could not send your time. It is saved, try again.'));
    if(done) setTimeout(done,ok(q)?900:0); duRefresh(); } }
function confetti(){ var c=document.createElement('canvas'); c.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:100000'; document.body.appendChild(c); var x=c.getContext('2d'), W=c.width=innerWidth, H=c.height=innerHeight, P=[], C=['#e53935','#fb8c00','#f5f5f2','#fdd835','#43a047','#1e88e5'];
  for(var i=0;i<160;i++) P.push({x:W/2,y:H*.6,vx:(Math.random()-.5)*16,vy:-8-Math.random()*14,r:0,vr:(Math.random()-.5)*.4,c:C[i%6]}); var t0=performance.now();
  (function f(){ x.clearRect(0,0,W,H); P.forEach(function(p){ p.vy+=.45; p.x+=p.vx; p.y+=p.vy; p.r+=p.vr; x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.fillStyle=p.c; x.fillRect(-5,-2.5,10,5); x.restore(); }); if(performance.now()-t0<3500) requestAnimationFrame(f); else c.remove(); })(); }
PL.duConfetti=confetti;

/* ================= mystery crates ================= */
var TIERS=[{k:'common',n:'Common',c:'#9aa3b5',dup:120},{k:'rare',n:'Rare',c:'#3b82f6',dup:350},{k:'epic',n:'Epic',c:'#a855f7',dup:1000},{k:'legendary',n:'Legendary',c:'#ffcc33',dup:3500}];
var CRATES=[{k:'std',n:'Standard crate',cost:600,odds:[68,24,7,1],ic:'📦'},{k:'big',n:'Big crate',cost:2500,odds:[30,40,22,8],ic:'🎁'}];
function tierOf(cost){ return cost>=10000?3:cost>=3000?2:cost>=1000?1:0; }
function pool(){ var P=[], e=E(); var bad=function(d){ return d.gift||d.secret||d.owner||d.cz||d.hw||d.lb||d.ev||d.need; };
  if(e){ e.CARDEF.forEach(function(d,i){ if(i>0&&d.cost>0&&!bad(d)) P.push({k:'car',i:i,n:d.n,cost:d.cost,d:d}); }); e.TRAILDEF.forEach(function(d,i){ if(i>0&&d.cost>0&&!bad(d)) P.push({k:'trail',i:i,n:d.n,cost:d.cost,d:d}); }); }
  PL.skins.list.forEach(function(s){ if(s.i>0&&s.cost>0&&!SPECIAL(s)) P.push({k:'pad',i:s.i,n:s.n,cost:s.cost}); });
  P.forEach(function(x){ x.t=tierOf(x.cost); }); return P; }
function owns(x){ var e=E(); return x.k==='pad'?PL.skins.has(x.i):x.k==='car'?e.carOwned().indexOf(x.i)>=0:e.trailOwned().indexOf(x.i)>=0; }
function grant(x){ if(x.k==='pad'){ PL.skins.unlock(x.i); return; } var key=x.k==='car'?'cw_cars':'cw_trails', o=CW.lsJ(key,[0]); if(!Array.isArray(o)) o=[0]; if(o.indexOf(x.i)<0) o.push(x.i); CW.setJ(key,o); }
function equip(x){ ls(x.k==='pad'?'cw_tmr_skin':x.k==='car'?'cw_car':'cw_trail',String(x.i)); if(PL.hud) PL.hud(); }
function roll(cr){ var P=pool(), r=Math.random()*100, t=0, acc=0; for(var i=0;i<4;i++){ acc+=cr.odds[i]; if(r<acc){ t=i; break; } }
  var L=[]; for(var j=t;j>=0&&!L.length;j--) L=P.filter(function(x){ return x.t===j; }); if(!L.length) L=P; return L[Math.floor(Math.random()*L.length)]; }
function cst(){ var o=CW.lsJ('cw_crates',{})||{}; return {n:+o.n||0,day:o.day||''}; }
function today(){ var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function itemArt(x){ var d=x.d||{}; if(x.k==='pad') return '<span class="cr5-art" style="background:'+skinBg(x.i,300,180)+'"></span>';
  if(x.k==='trail') return '<span class="cr5-art" style="background:'+(d.rb?'linear-gradient(90deg,#eb402f,#fdbe18,#208e67,#3593e2,#7a5cff)':d.c?'linear-gradient(90deg,rgb('+d.c[0]+'),rgb('+d.c[1]+'))':'#333')+';font-size:44px">'+(d.ic||'')+'</span>';
  var p=d.sw||d.pal||['#f4f6f8','#fdbe18','#208e67','#3593e2','#eb402f','#f28a1e'], o=[p[0],p[1],p[2],p[3],p[4],p[5],p[0],p[3],p[1]]; return '<span class="cr5-art car"'+(d.rb?' style="background:linear-gradient(90deg,#eb402f,#fdbe18,#208e67,#3593e2,#7a5cff)"':'')+'><span class="cube6">'+o.map(function(c){ return '<i style="background:'+c+'"></i>'; }).join('')+'</span></span>'; }
VIEWS.crates={show:function(el){ var s=cst(), free=s.day!==today(), P=pool(), cnt=[0,0,0,0]; P.forEach(function(x){ cnt[x.t]++; });
  el.innerHTML='<div class="wrap">'+PL.crumbs('Mystery Crates')+'<p class="lead" style="margin-top:0">Open a crate for a random car, trail or pad skin. Got it already? It turns into tokens instead.</p>'
   +'<div class="cr5-grid">'+CRATES.map(function(c,ci){ return '<div class="cr5-card"><div class="cr5-box '+c.k+'"><span>'+c.ic+'</span></div><h3>'+c.n+'</h3><div class="cr5-odds">'+TIERS.map(function(t,i){ return '<span style="--tc:'+t.c+'"><b>'+c.odds[i]+'%</b> '+t.n+'</span>'; }).join('')+'</div>'
     +'<button class="btn pri wide" data-cr="'+ci+'" type="button">Open for 🪙 '+c.cost.toLocaleString()+'</button>'+(ci===0?'<button class="btn wide" data-cr="free" type="button" style="margin-top:8px"'+(free?'':' disabled')+'>'+(free?'🎉 Open your free daily crate':'Free crate used today')+'</button>':'')+'</div>'; }).join('')+'</div>'
   +'<div class="pnl" style="margin-top:16px"><h3>What can drop</h3><p class="muted" style="font-size:13.5px;margin:4px 0 8px">'+TIERS.map(function(t,i){ return '<b style="color:'+t.c+'">'+t.n+'</b> '+cnt[i]+' items · duplicate = '+t.dup.toLocaleString()+' tokens'; }).join('<br>')+'</p><p class="muted" style="font-size:13px;margin:0">Crates opened: <b>'+s.n+'</b></p></div></div>';
  el.onclick=function(e){ var b=e.target.closest('[data-cr]'); if(!b||b.disabled) return; var v=b.getAttribute('data-cr'), cr=v==='free'?CRATES[0]:CRATES[+v];
    if(v==='free'){ var s2=cst(); if(s2.day===today()) return; s2.day=today(); CW.setJ('cw_crates',s2); } else if(!PL.spend(cr.cost)) return CW.toast('You need '+cr.cost.toLocaleString()+' tokens. Solves, races and Dash earn tokens.');
    var x=roll(cr), dup=owns(x), T=TIERS[x.t]; if(dup) PL.add(T.dup); else grant(x); var s3=cst(); s3.n++; CW.setJ('cw_crates',s3); reveal(cr,x,dup,el); }; }};
function reveal(cr,x,dup,el){ var T=TIERS[x.t], ov=document.createElement('div'); ov.className='cr5-ov'; ov.style.setProperty('--tc',T.c);
  ov.innerHTML='<div class="cr5-stage"><div class="cr5-beam"></div><div class="cr5-shake"><div class="cr5-box '+cr.k+' big"><span>'+cr.ic+'</span></div></div><div class="cr5-item">'+itemArt(x)+'<div class="cr5-tier">'+T.n+'</div><h2>'+esc(x.n)+'</h2><p>'+({pad:'Pad skin',car:'Car',trail:'Trail'}[x.k])+(dup?' · already yours, so you get <b>+'+T.dup.toLocaleString()+' tokens</b>':' · new!')+'</p><div class="row" style="justify-content:center;gap:10px">'+(dup?'':'<button class="btn pri" data-o="eq" type="button">Equip</button>')+'<button class="btn" data-o="again" type="button">Open another ('+cr.cost.toLocaleString()+')</button><button class="btn" data-o="x" type="button">Done</button></div></div></div><button type="button" class="cr5-skip" aria-label="Skip">Skip ▸</button>';
  document.body.appendChild(ov); var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var t1=setTimeout(function(){ ov.classList.add('open'); if(x.t>=2) setTimeout(confetti,200); },reduce?0:1700);
  ov.querySelector('.cr5-skip').onclick=function(){ clearTimeout(t1); ov.classList.add('open','fast'); };
  ov.onclick=function(e){ var b=e.target.closest('[data-o]'); if(!b) return; var o=b.getAttribute('data-o'); if(o==='eq'){ equip(x); CW.toast(x.n+' equipped'); } ov.remove(); VIEWS.crates.show(el); if(o==='again'){ var nb=el.querySelector('[data-cr="'+CRATES.indexOf(cr)+'"]'); if(nb) nb.click(); } }; }

/* ================= community Cube Dash levels ================= */
var DC={so:'feat',feat:{}};
PL.dashPublish=async function(m){ if(!on()) return; var n=window.prompt('Name your level for everyone to see:',m.n||'My level'); if(n==null) return; n=n.trim().slice(0,28)||'Untitled';
  var r=await api('/api/dl',{act:'pub',c:m.c,n:n}); if(!ok(r)) return CW.toast(err(r)); ls('cw_dl_pub',String((+ls('cw_dl_pub')||0)+1)); CW.toast('Published! Find it under Community levels.'); DC.so='mine'; var p=$('#dcList'); if(p) dcLoad(); };
PL.dashCommWin=function(k){ if(!DC.feat[k]) return; var w=CW.lsJ('cw_dl_won',[])||[]; if(w.indexOf(k)>=0) return; w.push(k); CW.setJ('cw_dl_won',w.slice(-200)); var g=PL.award(150); setTimeout(function(){ CW.toast('⭐ Featured level cleared! +'+g+' tokens'); },600); };
PL.dashComm=function(el){ if(!on()) return; var wrap=el.querySelector('.wrap')||el; if(wrap.querySelector('#dcBox')) return; var box=document.createElement('div'); box.id='dcBox'; box.className='pnl dc5'; wrap.appendChild(box);
  box.innerHTML='<div class="row" style="align-items:center;gap:10px;flex-wrap:wrap"><h3 style="margin:0">Community levels</h3><span class="sp"></span><div class="seg" id="dcSo">'+[['feat','⭐ Featured'],['top','Top'],['new','New'],['mine','Mine']].map(function(x){ return '<button type="button" data-so="'+x[0]+'" aria-pressed="'+(DC.so===x[0])+'">'+x[1]+'</button>'; }).join('')+'</div></div><p class="muted" style="font-size:13.5px;margin:6px 0 10px">Levels made by other cubers. Clear a featured one for +150 tokens. Publish your own from My levels once it is marked finishable.</p><div id="dcList"><p class="muted">Loading…</p></div>';
  box.querySelector('#dcSo').onclick=function(e){ var b=e.target.closest('[data-so]'); if(!b) return; DC.so=b.getAttribute('data-so'); Array.prototype.forEach.call(this.children,function(x){ x.setAttribute('aria-pressed',x===b); }); dcLoad(); };
  box.addEventListener('click',async function(e){ var b=e.target.closest('[data-dc]'); if(!b) return; e.stopPropagation(); var a=b.getAttribute('data-dc'), k=b.getAttribute('data-k');
    if(a==='play'){ b.disabled=true; var r=await api('/api/dl',{act:'get',k:k}); b.disabled=false; if(!ok(r)) return CW.toast(err(r)); if(r.data.lv.ft) DC.feat[k]=1; api('/api/dl',{act:'play',k:k}); if(!PL.dashApi||!PL.dashApi.play(el,r.data.c,k,r.data.lv.n)) CW.toast('That level could not be read.'); return; }
    if(a==='remix'){ b.disabled=true; var rx=await api('/api/dl',{act:'get',k:k}); b.disabled=false; if(!ok(rx)) return CW.toast(err(rx)); if(!PL.dashApi||!PL.dashApi.remix(el,rx.data.c,rx.data.lv.n)) CW.toast('That level could not be read.'); else CW.toast('A copy is open in your editor. Change it, then publish it as your own.'); return; }
    if(a==='like'){ var r2=await api('/api/dl',{act:'like',k:k}); if(!ok(r2)) return CW.toast(err(r2)); b.setAttribute('aria-pressed',r2.data.me); b.innerHTML='♥ '+r2.data.lk; return; }
    if(a==='del'){ if(!confirm('Remove this level from Community levels?')) return; var r3=await api('/api/dl',{act:'del',k:k}); if(!ok(r3)) return CW.toast(err(r3)); dcLoad(); return; }
    if(a==='ft'||a==='oddel'){ if(a==='oddel'&&!confirm('Delete this level for everyone?')) return; var r4=await CW.admin('dl',a==='ft'?{k:k,on:b.getAttribute('data-on')==='1'}:{k:k,act:'del'}); if(!(r4.ok&&r4.data&&r4.data.ok)) return CW.toast(err(r4,'Owner action failed.')); dcLoad(); } }, true);
  dcLoad(); };
async function dcLoad(){ var L=$('#dcList'); if(!L) return; var r=await api('/api/dl',{act:'list',so:DC.so},8000); if(!ok(r)){ L.innerHTML='<p class="muted">'+esc(err(r))+'</p>'; return; } var own=false; try{ own=!!CW.ownerKeys(); }catch(e){}
  var a=r.data.list||[]; a.forEach(function(x){ if(x.ft) DC.feat[x.k]=1; });
  L.innerHTML=a.length?a.map(function(x){ return '<div class="ds-my'+(x.ft?' ft':'')+'"><span><b>'+(x.ft?'⭐ ':'')+esc(x.n)+'</b><br><small class="muted">by '+esc(x.by)+' · ▶ '+x.pl.toLocaleString()+' plays</small></span><span class="sp"></span><button class="btn sm" data-dc="like" data-k="'+x.k+'" aria-pressed="'+x.me+'"'+(x.mine?' disabled':'')+'>♥ '+x.lk+'</button><button class="btn sm pri" data-dc="play" data-k="'+x.k+'">Play</button>'+(PL.updOn7&&PL.updOn7()?'<button class="btn sm" data-dc="remix" data-k="'+x.k+'" title="Open a copy in your editor">Remix</button>':'')+(x.mine?'<button class="btn sm" data-dc="del" data-k="'+x.k+'" aria-label="Remove">✕</button>':'')+(own?'<button class="btn sm" data-dc="ft" data-k="'+x.k+'" data-on="'+(x.ft?0:1)+'">'+(x.ft?'Unfeature':'Feature')+'</button>'+(x.mine?'':'<button class="btn sm" data-dc="oddel" data-k="'+x.k+'">🗑</button>'):'')+'</div>'; }).join('')
   :'<p class="muted">'+({feat:'No featured levels yet.',top:'No levels yet. Be the first to publish one!',new:'No levels yet. Be the first to publish one!',mine:'You have not published a level yet.'}[DC.so])+'</p>'; }

/* ================= switch on ================= */
function on(){ return !!(PL.updOn5&&PL.updOn5()); }
var lastIn=0;
function badge(){ var a=document.querySelector('a.tool[href="#duels"]'); if(!a) return; var n=LV.duIn||0; a.classList.toggle('hasn',n>0); a.setAttribute('data-n',n); var m=a.querySelector('.meta'); if(m) m.textContent=n?n+' waiting for you':'Best of 3 · winner takes all'; }
PL.onUpd5(function(){
  Object.keys(VIEWS).forEach(function(k){ PL.views[k]=VIEWS[k]; });
  var T=PL.TOOLS; if(T&&!T.some(function(t){ return t.id==='duels'; })){ var at=T.findIndex(function(t){ return t.id==='mail'; })+1||T.length;
    T.splice(at,0,{id:'duels',ic:'⚔️',n:'Duels',d:'Challenge any cuber 1v1 on the same scrambles. Best of 3 wins the stake.',c:'#ff4d6d',meta:function(){ var n=LV.duIn||0; return n?n+' waiting for you':'Best of 3 · winner takes all'; },n0:function(){ return LV.duIn||0; }},
      {id:'crates',ic:'📦',n:'Mystery Crates',d:'Open crates for random cars, trails and pad skins. One free crate every day.',c:'#ffb300',meta:function(){ return cst().day!==today()?'🎉 Free crate ready':(cst().n+' opened'); }},
      {id:'card',ic:'🪪',n:'Profile Card',d:'Your best times, badges and rarest skin. Others see it when they tap your name.',c:'#9b7bff',meta:function(){ return 'Banner · badges · bio'; }}); }
  PL.onLive(function(){ var n=LV.duIn||0; if(n>lastIn&&!/^#duels/.test(location.hash)) CW.toast('⚔️ A duel is waiting for you. Open Duels.'); lastIn=n; badge(); });
  setTimeout(function(){ publish(false); },4000); setInterval(function(){ publish(false); },10*60000);
  var h=location.hash||''; if(h===''||h==='#'||/^#(duels|crates|card|dash)/.test(h)) window.dispatchEvent(new HashChangeEvent('hashchange'));
});
})();
