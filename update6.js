/* Update 6: countdown bar, release detection, its own cutscene (once per device) and the switch that turns Update 6 features on. Only after Update 1 is live. */
(function(){
var $=CW.$, LS=function(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} return null; };
var st={on:false,cbs:[],playing:false,fast:0};
PL.upd6={at:0,live:false,rel:0};
function isOwner(){ try{ return !!CW.ownerKeys(); }catch(e){ return false; } }
PL.updOn6=function(){ return !!(PL.updOn5&&PL.updOn5()&&(PL.upd6.live||(LS('cw_upd6_prev')==='1'&&isOwner()))); };
PL.onUpd6=function(fn){ if(st.on){ try{ fn(); }catch(e){ console.error(e); } } else st.cbs.push(fn); };
function loadCut(cb){ if(window.CWCut6) return cb(); var s=document.createElement('script'); s.src='/update-cut6.js?v=1'; s.onload=cb; s.onerror=function(){ cb(); }; document.head.appendChild(s); }
PL.updCut6=function(opts){ opts=opts||{}; if(st.playing) return; st.playing=true; loadCut(function(){ if(!window.CWCut6){ st.playing=false; if(opts.onend) opts.onend(); return; } window.CWCut6.play({onend:function(){ st.playing=false; if(opts.onend) opts.onend(); }}); }); };
function bar(){ var b=$('#ubar6'); if(!b){ var a=$('#annc'); if(!a) return null; b=document.createElement('div'); b.id='ubar6'; b.className='ubar'; b.hidden=true; b.innerHTML='<span class="ubar-ic">◆</span><span class="ubar-t" id="ubar6T">Update 6 is coming to Cuber Tools</span><span class="ubar-c" id="ubar6C">--:--:--</span>'; a.parentNode.insertBefore(b,a.nextSibling); } return b; }
function turnOn(){ if(st.on) return; st.on=true; document.documentElement.classList.add('upd6-on'); var l=st.cbs.slice(); st.cbs=[]; l.forEach(function(fn){ try{ fn(); }catch(e){ console.error(e); } }); }
function sync(){
  var u=(PL.live&&PL.live.upd&&PL.live.upd.v6)||PL.upd6; PL.upd6=u||{at:0,live:false,rel:0};
  if(PL.upd6.live&&PL.upd6.rel) LS('cw_upd6_live',String(PL.upd6.rel)); else if(!PL.upd6.live&&LS('cw_upd6_live')){ PL.upd6={at:0,live:true,rel:+LS('cw_upd6_live')||1}; }
  var b=bar(); if(!b) return; var s1=PL.upd5&&PL.upd5.live||LS('cw_upd5_live');
  var left=PL.upd6.at?PL.upd6.at-PL.now():0;
  if(s1&&!PL.upd6.live&&PL.upd6.at){ b.hidden=false; document.documentElement.classList.add('has-ubar'); $('#ubar6C').textContent=PL.updHMS(left); $('#ubar6T').textContent=left<=0?'It is happening…':'Update 6 is coming to Cuber Tools'; }
  else { if(!b.hidden){ b.hidden=true; var o=$('#ubar'); if(!o||o.hidden) document.documentElement.classList.remove('has-ubar'); } }
  if(!(PL.updOn5&&PL.updOn5())) return;
  if(PL.upd6.live&&LC.fired&&Date.now()-LC.firedAt<3500&&!st.on){ clearTimeout(LC.wt); LC.wt=setTimeout(sync,3600-(Date.now()-LC.firedAt)); return; }
  if(PL.upd6.live&&!st.on&&PL.cutNewer&&PL.cutNewer('6')&&LS('cw_upd6_seen')!==String(PL.upd6.rel)) LS('cw_upd6_seen',String(PL.upd6.rel));
  if(PL.upd6.live&&!st.on&&LS('cw_upd6_seen')!==String(PL.upd6.rel)) LS('cw_upd6_seen',String(PL.upd6.rel)); /* its cutscene showed Cube Escape, which was removed */
  if(PL.upd6.live){ if(!st.on&&LS('cw_upd6_seen')!==String(PL.upd6.rel)&&!st.playing&&!document.documentElement.classList.contains('ucut-on')){ PL.updCut6({onend:function(){ LS('cw_upd6_seen',String(PL.upd6.rel)); turnOn(); }}); } else if(!st.playing) turnOn(); }
  else if(PL.updOn6()) turnOn();
}
PL.updSync6=sync;
setInterval(function(){ if(!PL.upd6.live&&PL.upd6.at){ var left=PL.upd6.at-PL.now(), c=$('#ubar6C'); if(c) c.textContent=PL.updHMS(left); if(left<=0&&Date.now()-st.fast>1500){ st.fast=Date.now(); PL.poll(); } } },500);
/* live countdown everyone watches together: the last 60 seconds take over the screen, confetti at zero */
var LC={el:null,shut:false,fired:false,cf:null};
function lcConf(){ var c=document.createElement('canvas'); c.className='lc-cf'; LC.el.appendChild(c); var x=c.getContext('2d'), W=c.width=innerWidth, H=c.height=innerHeight, P=[], C=['#e53935','#fb8c00','#f5f5f2','#fdd835','#43a047','#1e88e5','#9b7bff']; for(var i=0;i<220;i++) P.push({x:W/2,y:H*.55,vx:(Math.random()-.5)*18,vy:-6-Math.random()*16,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:C[i%7],w:6+Math.random()*7});
  var t0=performance.now(); (function f(){ var t=(performance.now()-t0)/1000; x.clearRect(0,0,W,H); P.forEach(function(p){ p.vy+=.45; p.x+=p.vx; p.y+=p.vy; p.vx*=.99; p.r+=p.vr; x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.fillStyle=p.c; x.fillRect(-p.w/2,-p.w/4,p.w,p.w/2); x.restore(); }); if(t<5&&c.isConnected) requestAnimationFrame(f); })(); }
function lcTick(){ var u=PL.upd6; if(!u||u.live||!u.at||!(PL.upd5&&PL.upd5.live)){ if(LC.el&&!LC.fired){ LC.el.remove(); LC.el=null; } return; } var left=u.at-PL.now();
  if(left>60000||left<-15000||LC.shut||document.documentElement.classList.contains('ucut-on')){ if(LC.el&&document.documentElement.classList.contains('ucut-on')){ LC.el.remove(); LC.el=null; } return; }
  if(!LC.el){ LC.el=document.createElement('div'); LC.el.className='lc5'; LC.el.innerHTML='<div class="lc5-in"><div class="lc5-k">Update 6 launches in</div><div class="lc5-n" id="lc6N">60</div><div class="lc5-w" id="lc6W"></div></div><button type="button" class="lc5-x" aria-label="Hide countdown">Hide</button>'; document.body.appendChild(LC.el); LC.el.querySelector('.lc5-x').onclick=function(){ LC.shut=true; LC.el.remove(); LC.el=null; }; }
  var s=Math.max(0,Math.ceil(left/1000)), n=document.getElementById('lc6N'), w=document.getElementById('lc6W'); if(n&&n.textContent!==String(s)){ n.textContent=s>0?String(s):'🎉'; n.classList.remove('pop'); void n.offsetWidth; n.classList.add('pop'); }
  var on=(PL.live&&PL.live.online)||0; if(w) w.textContent=s>0?(on>1?on+' cubers are watching right now':'Get ready…'):'It is here!';
  if(s<=10&&s>0) LC.el.classList.add('hot'); if(s===0&&!LC.fired){ LC.fired=true; LC.firedAt=Date.now(); LC.el.classList.add('zero'); var kk=LC.el.querySelector('.lc5-k'); if(kk) kk.textContent='Update 6'; lcConf(); setTimeout(function(){ PL.poll&&PL.poll(); },1200); setTimeout(function(){ if(LC.el){ LC.el.remove(); LC.el=null; } },6000); } }
setInterval(lcTick,250);
PL.onLive(sync); PL.onUpd(sync); if(PL.onUpd5) PL.onUpd5(sync);
if(document.readyState!=='loading') setTimeout(sync,0); else document.addEventListener('DOMContentLoaded',sync);
})();
