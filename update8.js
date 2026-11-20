/* Update 8: countdown bar, release detection, its own cutscene (once per device) and the switch that turns Update 8 features on. Only after Update 1 is live. */
(function(){
var $=CW.$, LS=function(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} return null; };
var st={on:false,cbs:[],playing:false,fast:0};
PL.upd8={at:0,live:false,rel:0};
function isOwner(){ try{ return !!CW.ownerKeys(); }catch(e){ return false; } }
PL.updOn8=function(){ return !!(PL.updOn7&&PL.updOn7()&&(PL.upd8.live||(LS('cw_upd8_prev')==='1'&&isOwner()))); };
PL.onUpd8=function(fn){ if(st.on){ try{ fn(); }catch(e){ console.error(e); } } else st.cbs.push(fn); };
function loadCut(cb){ if(window.CWCut8) return cb(); var s=document.createElement('script'); s.src='/update-cut8.js?v=1'; s.onload=cb; s.onerror=function(){ cb(); }; document.head.appendChild(s); }
PL.updCut8=function(opts){ opts=opts||{}; if(st.playing) return; st.playing=true; loadCut(function(){ if(!window.CWCut8){ st.playing=false; if(opts.onend) opts.onend(); return; } window.CWCut8.play({onend:function(){ st.playing=false; if(opts.onend) opts.onend(); }}); }); };
function bar(){ var b=$('#ubar8'); if(!b){ var a=$('#annc'); if(!a) return null; b=document.createElement('div'); b.id='ubar8'; b.className='ubar'; b.hidden=true; b.innerHTML='<span class="ubar-ic">◆</span><span class="ubar-t" id="ubar8T">Update 8 is coming to Cuber Tools</span><span class="ubar-c" id="ubar8C">--:--:--</span>'; a.parentNode.insertBefore(b,a.nextSibling); } return b; }
function turnOn(){ if(st.on) return; st.on=true; document.documentElement.classList.add('upd8-on'); var l=st.cbs.slice(); st.cbs=[]; l.forEach(function(fn){ try{ fn(); }catch(e){ console.error(e); } }); }
function sync(){
  var u=(PL.live&&PL.live.upd&&PL.live.upd.v8)||PL.upd8; PL.upd8=u||{at:0,live:false,rel:0};
  if(PL.upd8.live&&PL.upd8.rel) LS('cw_upd8_live',String(PL.upd8.rel)); else if(!PL.upd8.live&&LS('cw_upd8_live')){ PL.upd8={at:0,live:true,rel:+LS('cw_upd8_live')||1}; }
  var b=bar(); if(!b) return; var s1=PL.upd7&&PL.upd7.live||LS('cw_upd7_live');
  var left=PL.upd8.at?PL.upd8.at-PL.now():0;
  if(s1&&!PL.upd8.live&&PL.upd8.at){ b.hidden=false; document.documentElement.classList.add('has-ubar'); $('#ubar8C').textContent=PL.updHMS(left); $('#ubar8T').textContent=left<=0?'It is happening…':'Update 8 is coming to Cuber Tools'; }
  else { if(!b.hidden){ b.hidden=true; var o=$('#ubar'); if(!o||o.hidden) document.documentElement.classList.remove('has-ubar'); } }
  if(!(PL.updOn7&&PL.updOn7())) return;
  if(PL.upd8.live&&LC.fired&&Date.now()-LC.firedAt<3500&&!st.on){ clearTimeout(LC.wt); LC.wt=setTimeout(sync,3600-(Date.now()-LC.firedAt)); return; }
  if(PL.upd8.live&&!st.on&&PL.cutNewer&&PL.cutNewer('8')&&LS('cw_upd8_seen')!==String(PL.upd8.rel)) LS('cw_upd8_seen',String(PL.upd8.rel));
  if(PL.upd8.live){ if(!st.on&&LS('cw_upd8_seen')!==String(PL.upd8.rel)&&!st.playing&&!document.documentElement.classList.contains('ucut-on')){ PL.updCut8({onend:function(){ LS('cw_upd8_seen',String(PL.upd8.rel)); turnOn(); }}); } else if(!st.playing) turnOn(); }
  else if(PL.updOn8()) turnOn();
}
PL.updSync8=sync;
setInterval(function(){ if(!PL.upd8.live&&PL.upd8.at){ var left=PL.upd8.at-PL.now(), c=$('#ubar8C'); if(c) c.textContent=PL.updHMS(left); if(left<=0&&Date.now()-st.fast>1500){ st.fast=Date.now(); PL.poll(); } } },500);
/* live countdown everyone watches together: the last 60 seconds take over the screen, confetti at zero */
var LC={el:null,shut:false,fired:false,cf:null};
function lcConf(){ var c=document.createElement('canvas'); c.className='lc-cf'; LC.el.appendChild(c); var x=c.getContext('2d'), W=c.width=innerWidth, H=c.height=innerHeight, P=[], C=['#e53935','#fb8c00','#f5f5f2','#fdd835','#43a047','#1e88e5','#9b7bff']; for(var i=0;i<220;i++) P.push({x:W/2,y:H*.55,vx:(Math.random()-.5)*18,vy:-6-Math.random()*16,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:C[i%7],w:6+Math.random()*7});
  var t0=performance.now(); (function f(){ var t=(performance.now()-t0)/1000; x.clearRect(0,0,W,H); P.forEach(function(p){ p.vy+=.45; p.x+=p.vx; p.y+=p.vy; p.vx*=.99; p.r+=p.vr; x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.fillStyle=p.c; x.fillRect(-p.w/2,-p.w/4,p.w,p.w/2); x.restore(); }); if(t<5&&c.isConnected) requestAnimationFrame(f); })(); }
function lcTick(){ var u=PL.upd8; if(!u||u.live||!u.at||!(PL.upd7&&PL.upd7.live)){ if(LC.el&&!LC.fired){ LC.el.remove(); LC.el=null; } return; } var left=u.at-PL.now();
  if(left>60000||left<-15000||LC.shut||document.documentElement.classList.contains('ucut-on')){ if(LC.el&&document.documentElement.classList.contains('ucut-on')){ LC.el.remove(); LC.el=null; } return; }
  if(!LC.el){ LC.el=document.createElement('div'); LC.el.className='lc5'; LC.el.innerHTML='<div class="lc5-in"><div class="lc5-k">Update 8 launches in</div><div class="lc5-n" id="lc8N">60</div><div class="lc5-w" id="lc8W"></div></div><button type="button" class="lc5-x" aria-label="Hide countdown">Hide</button>'; document.body.appendChild(LC.el); LC.el.querySelector('.lc5-x').onclick=function(){ LC.shut=true; LC.el.remove(); LC.el=null; }; }
  var s=Math.max(0,Math.ceil(left/1000)), n=document.getElementById('lc8N'), w=document.getElementById('lc8W'); if(n&&n.textContent!==String(s)){ n.textContent=s>0?String(s):'🎉'; n.classList.remove('pop'); void n.offsetWidth; n.classList.add('pop'); }
  var on=(PL.live&&PL.live.online)||0; if(w) w.textContent=s>0?(on>1?on+' cubers are watching right now':'Get ready…'):'It is here!';
  if(s<=10&&s>0) LC.el.classList.add('hot'); if(s===0&&!LC.fired){ LC.fired=true; LC.firedAt=Date.now(); LC.el.classList.add('zero'); var kk=LC.el.querySelector('.lc5-k'); if(kk) kk.textContent='Update 8'; lcConf(); setTimeout(function(){ PL.poll&&PL.poll(); },1200); setTimeout(function(){ if(LC.el){ LC.el.remove(); LC.el=null; } },6000); } }
setInterval(lcTick,250);
PL.onLive(sync); PL.onUpd(sync); if(PL.onUpd7) PL.onUpd7(sync);
if(document.readyState!=='loading') setTimeout(sync,0); else document.addEventListener('DOMContentLoaded',sync);
})();
