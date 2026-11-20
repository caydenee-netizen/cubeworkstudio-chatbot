/* The update, racing and clubs: race replays, team races, club war, profile cards. Needs the server. */
(function(){
var $=CW.$, esc=CW.esc;
function api(path,body){ var x=Object.assign({id:CW.devId()},body||{}); if(!(PL.live&&PL.live.upd&&PL.live.upd.live)){ var k=CW.ownerKeys&&CW.ownerKeys(); if(k){ x.pv=1; x.key=k.key; x.key2=k.key2; } } return CW.call(path,x,9000); }
function lsg(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lss(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
function f(ms){ return PL.T.fmt(ms); }
function err(r){ return (r&&r.data&&r.data.error)||'Could not reach the server.'; }
function swatch(i,h){ var s=PL.skins.of(i); return '<div style="height:'+(h||56)+'px;border-radius:10px;background:'+(s?s.css:'#333')+'"></div>'; }
function skn(i){ var s=PL.skins.of(i); return s?s.n:'Skin '+i; }
function ago(t){ var m=Math.max(1,Math.round((Date.now()-t)/60000)); return m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago'; }
function hms(ms){ ms=Math.max(0,ms); var s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60); return h>=24?Math.floor(h/24)+'d '+(h%24)+'h':(h?h+'h ':'')+m+'m '+(s%60)+'s'; }
/* ---------- profile cards ---------- */
var cardAt=0;
function putCard(force){ if(!force&&Date.now()-cardAt<300000) return; cardAt=Date.now(); try{ var L=PL.T.data().solves['333']||[], tot=0, d=PL.T.data(); Object.keys(d.solves).forEach(function(k){ tot+=(d.solves[k]||[]).length; });
  var own=PL.skins.owned().filter(function(i){ return i>0; }), cur=PL.skins.cur(), sk=[cur].concat(own.filter(function(i){ return i!==cur; }).reverse()).slice(0,3);
  api('/api/u/pc',{act:'put',c:{rk:'',pt:0,pn:'',best:PL.T.best(L)||0,n:tot,sk:sk}}); }catch(e){} }
PL.api=api;
PL.profileCard=async function(pub){ var r=await api('/api/u/pc',{act:'get',of:pub}); if(!r.ok){ CW.toast(err(r)); return; } var p=r.data.pf||{}, c=r.data.c||{};
  var sk=(c.sk||[]).map(function(i){ return '<div style="flex:1">'+swatch(i,44)+'<small class="muted" style="font-size:11.5px">'+esc(skn(i))+'</small></div>'; }).join('');
  CW.sheet('<div class="hd"><h2>'+esc(p.n||'Cuber')+'</h2><button class="x" data-close aria-label="Close">✕</button></div>'
   +'<div class="muted" style="font-size:13px">Level '+(p.lv||1)+(p.on?' · online':'')+(p.club?' · ['+esc(p.club.t)+'] '+esc(p.club.n):'')+'</div>'
   +'<div class="row" style="gap:8px;flex-wrap:wrap;margin:8px 0"><span class="tag">Best 3x3: '+(c.best?f(c.best):'–')+'</span><span class="tag">'+(c.n||0)+' solves</span><span class="tag">'+(p.wins||0)+' race wins</span>'+(p.streak?'<span class="tag">'+p.streak+' day streak</span>':'')+'</div>'
   +(sk?'<div class="row" style="gap:8px;margin-top:8px">'+sk+'</div>':'')); };
function warPanel(box){ api('/api/u/war',{}).then(function(r){ if(!box.isConnected||!r.ok) return; var d=r.data; if(d.none){ box.innerHTML='<h3>⚔ Club war</h3><p class="muted">Join a club to take part in the weekly club war.</p>'; return; } if(d.wait){ box.innerHTML='<h3>⚔ Club war</h3><p class="muted">Waiting for another club to match up against.</p>'; return; }
  if(!d.me||!d.op) return; var tot=Math.max(1,d.me.wp+d.op.wp), pc=Math.round(d.me.wp/tot*100); box.innerHTML='<h3>⚔ Club war</h3><div class="row" style="justify-content:space-between"><b>'+esc(d.me.n)+' · '+d.me.wp+'</b><b>'+d.op.wp+' · '+esc(d.op.n)+'</b></div><div class="ft-bar" style="height:12px"><i style="width:'+pc+'%"></i></div><small class="muted">Race points this week decide it. The winning club\'s active members get '+d.prize+' tokens when the week ends ('+hms(d.end-PL.now())+').</small>'; }); }
/* ---------- race replays (13) + team races (20) on the Race view ---------- */
function repView(k){ api('/api/u/rp',{k:k}).then(function(r){ if(!r.ok){ CW.toast(err(r)); return; } var R=r.data.r, T=Math.max.apply(null,R.ps.map(function(p){ return p.s.length?p.s[p.s.length-1][0]:0; }).concat([10])), COL=['#e8202a','#2447ff','#00a651','#e8b923','#b46bff','#ff7f00','#42c6b4','#888'];
  var sh=CW.sheet('<div class="hd"><h2>Race replay</h2><button class="x" data-close aria-label="Close">✕</button></div><div id="rpL"></div><div class="ft-bar" style="height:8px"><i id="rpB" style="width:0"></i></div><div class="row" style="margin-top:10px"><button class="btn sm pri" id="rpA" type="button">Replay again</button></div>'), L=sh.querySelector('#rpL'), raf=0;
  function at(p,t){ var s=p.s,v=0; for(var i=0;i<s.length;i++){ if(s[i][0]<=t) v=s[i][1]; else { var a=s[i-1]||[0,0],q=(t-a[0])/Math.max(.001,s[i][0]-a[0]); v=a[1]+(s[i][1]-a[1])*Math.max(0,Math.min(1,q)); break; } } return v; }
  function run(){ cancelAnimationFrame(raf); var t0=performance.now(), dur=Math.min(25000,T*1000/2); (function fr(){ var q=Math.min(1,(performance.now()-t0)/dur), t=q*T; L.innerHTML=R.ps.map(function(p,i){ var v=at(p,t); return '<div style="margin:8px 0"><small>'+(p.t?'<b style="color:'+(p.t==='A'?'#e8202a':'#2447ff')+'">'+p.t+'</b> ':'')+esc(p.n)+(p.me?' (you)':'')+(p.d!=null&&q>=1?' · '+f(p.d):'')+'</small><div class="ft-bar" style="height:14px"><i style="width:'+v+'%;background:'+COL[i%8]+'"></i></div></div>'; }).join(''); sh.querySelector('#rpB').style.width=q*100+'%'; if(q<1) raf=requestAnimationFrame(fr); })(); }
  sh.querySelector('#rpA').onclick=run; run(); }); }
function racePanels(el){ var wrap=el.querySelector('.wrap'); if(!wrap) return;
  var fo=el.querySelector('#rFo'); if(fo&&!el.querySelector('#rTm')) fo.closest('label').insertAdjacentHTML('afterend','<label class="lk row" style="gap:6px;margin-top:6px;font-size:13.5px"><input type="checkbox" id="rTm"> Team race (players are split into teams A and B)</label>');
  var box=document.createElement('div'); box.className='pnl'; wrap.appendChild(box); api('/api/u/rp',{}).then(function(r){ if(!box.isConnected) return; var L=r.ok?r.data.list:[]; box.innerHTML='<h3>🎞 Race replays</h3>'+(L.length?L.map(function(x){ return '<div class="ft-row"><div>'+x.n+' racers · '+(x.tm?'team race · ':'')+ago(x.at)+'</div><button class="btn sm" data-rp="'+esc(x.k)+'" type="button">Watch</button></div>'; }).join(''):'<p class="muted">Your last races appear here after you race.</p>'); box.onclick=function(e){ var b=e.target.closest('[data-rp]'); if(b) repView(b.getAttribute('data-rp')); }; }); }
/* ---------- wire up ---------- */
PL.onUpd(function(){
  var prevSD=PL.solveDone; PL.solveDone=function(rec,cube,L){ if(prevSD) prevSD(rec,cube,L); try{ putCard(); }catch(e){} };
  var C=PL.views.clubs; if(C&&!C._sv){ var oc=C.show; C.show=function(el,h){ var r=oc.apply(this,arguments); try{ var tab=(h.split('/')[1])||'club', w=el.querySelector('.wrap'); if(w&&tab==='club'){ var b=document.createElement('div'); b.className='pnl'; w.appendChild(b); warPanel(b); } }catch(e){ console.error(e); } return r; }; C._sv=1; }
  var R=PL.views.race; if(R&&!R._sv){ var or=R.show; R.show=function(el,h){ var r=or.apply(this,arguments); try{ racePanels(el); }catch(e){ console.error(e); } return r; }; R._sv=1; }
  document.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('[data-pc]'); if(b&&!e.defaultPrevented&&!b.closest('.pnl')) PL.profileCard(b.getAttribute('data-pc')); });
  putCard(true);
  if(/^#(race|clubs)/.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange'));
});
})();
