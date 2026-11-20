/* chat extras: /confetti messages make confetti fall for everyone who has Cuber Tools open */
(function(){
if(!window.PL) return; var LV=PL.live, last=+(sessionStorage.getItem('cw_fx_s')||0), first=true;
var CC=['#ff4d3d','#ff8a1f','#ffd21a','#2fd36b','#3a7bff','#f4f4f2','#b48cff'];
function burst(){ if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches) return; var c=document.createElement('canvas'), W=innerWidth, H=innerHeight, dpr=Math.min(2,devicePixelRatio||1); c.width=W*dpr; c.height=H*dpr; c.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:99990'; document.body.appendChild(c); var x=c.getContext('2d'); x.scale(dpr,dpr);
  var P=[]; for(var i=0;i<180;i++) P.push({x:Math.random()*W,y:-20-Math.random()*H*.6,vx:(Math.random()-.5)*3,vy:2+Math.random()*4,r:Math.random()*6,vr:(Math.random()-.5)*.3,w:6+Math.random()*7,c:CC[i%CC.length]});
  var t0=performance.now(); (function f(){ var t=(performance.now()-t0)/1000; x.clearRect(0,0,W,H); P.forEach(function(p){ p.x+=p.vx+Math.sin(t*3+p.r)*.6; p.y+=p.vy; p.r+=p.vr; x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.fillStyle=p.c; x.globalAlpha=Math.max(0,Math.min(1,(4.2-t))); x.fillRect(-p.w/2,-p.w/4,p.w,p.w/2); x.restore(); }); if(t<4.4) requestAnimationFrame(f); else c.remove(); })(); }
PL.onLive(function(){ var L=LV.chat||[], mx=last; L.forEach(function(m){ if(m.s>mx) mx=m.s; });
  if(!first){ var hit=L.some(function(m){ return m.fx&&m.s>last&&PL.now()-(m.at||0)<60000; }); if(hit) burst(); }
  first=false; last=mx; try{ sessionStorage.setItem('cw_fx_s',String(last)); }catch(e){} });
window.CWConfetti=burst;
})();
