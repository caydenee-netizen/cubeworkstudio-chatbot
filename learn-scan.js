/* Learn → Scan: scan a scrambled cube with the camera (or tap the colours in), then watch the solution on a 3D cube, move by move.
   Uses CWSolver (solver.js) and the Learn 3D cube (PL.lk from play-learn.js). Part of Update 7. */
(function(){
var PL=window.PL||(window.PL={});
var ORDER=['F','R','B','L','U','D'];
var SAY={F:'Green centre facing you, yellow on top.',R:'Turn the whole cube to the left: orange centre facing you, yellow still on top.',B:'Turn left again: blue centre facing you, yellow on top.',L:'Turn left again: red centre facing you, yellow on top.',U:'Turn back so green faces you, then tip the top toward you: yellow faces you, green at the bottom.',D:'Now tip it the other way: white faces you, green at the top.'};
var FACE_COL={U:'Y',R:'O',F:'G',D:'W',L:'R',B:'B'}, NAME={Y:'yellow',W:'white',G:'green',B:'blue',O:'orange',R:'red'}, COLS=['Y','W','G','B','O','R'];
var REF={Y:[215,195,40],W:[215,215,210],G:[40,160,80],B:[35,75,205],O:[245,120,35],R:[200,35,40]};
var SC={f:{},raw:{},step:0,mode:'',brush:'Y',sol:null,i:0,play:false,spd:1,err:''};
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function blank(){ ORDER.forEach(function(f){ var a=[]; for(var i=0;i<9;i++) a.push(i===4?FACE_COL[f]:''); SC.f[f]=a; SC.raw[f]=null; }); }
blank();
function lab(rgb){ var r=rgb[0]/255,g=rgb[1]/255,b=rgb[2]/255; var f=function(c){ return c>.04045?Math.pow((c+.055)/1.055,2.4):c/12.92; }; r=f(r); g=f(g); b=f(b);
  var X=(r*.4124+g*.3576+b*.1805)/.95047, Y=r*.2126+g*.7152+b*.0722, Z=(r*.0193+g*.1192+b*.9505)/1.08883, h=function(t){ return t>.008856?Math.cbrt(t):7.787*t+16/116; };
  return [116*h(Y)-16,500*(h(X)-h(Y)),200*(h(Y)-h(Z))]; }
function dist(a,b){ var A=lab(a), B=lab(b); return Math.pow(A[0]-B[0],2)*.5+Math.pow(A[1]-B[1],2)+Math.pow(A[2]-B[2],2); }
function nearest(rgb,ref){ var best='', bd=1e18; COLS.forEach(function(k){ var d=dist(rgb,ref[k]); if(d<bd){ bd=d; best=k; } }); return best; }
/* once every face is in, re-read all stickers against the six centres actually seen under this light */
function reclass(){ var ref={}, n=0; ORDER.forEach(function(f){ var r=SC.raw[f]; if(r){ ref[FACE_COL[f]]=r[4]; n++; } }); if(n<6) return; ORDER.forEach(function(f){ var r=SC.raw[f]; if(!r) return; for(var i=0;i<9;i++) if(i!==4) SC.f[f][i]=nearest(r[i],ref); }); }
function facelets(){ var out=''; var map={}; ORDER.forEach(function(f){ map[FACE_COL[f]]=f; }); var ok=true; 'URFDLB'.split('').forEach(function(f){ SC.f[f].forEach(function(c){ if(!c) ok=false; out+=map[c]||'?'; }); }); return ok?out:null; }
/* ---------- view ---------- */
function html(){ return '<div class="sc7" id="sc7">'+body()+'</div>'; }
function body(){
  if(SC.sol) return solView();
  if(SC.mode==='cam') return camView();
  if(SC.mode==='hand') return netView();
  return '<div class="pnl sc7-hero"><span class="sc7-k">Scan and solve</span><h2>Solve any scramble</h2><p>Scan your cube with the camera, or tap in the colours. You get the solution on a 3D cube, one move at a time, so you can follow along with your own cube.</p>'
   +'<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:14px"><button type="button" class="btn pri" data-sc="cam">📷 Scan with the camera</button><button type="button" class="btn" data-sc="hand">✍️ Tap the colours in</button></div>'
   +'<p class="muted" style="font-size:13px;margin:12px 0 0">Tip: scan in bright, even light and keep the cube still for a moment on each side.</p></div>'; }
function grid(f,big){ return '<div class="sc7-g'+(big?' big':'')+'">'+SC.f[f].map(function(c,i){ return '<button type="button" class="sc7-s'+(i===4?' ctr':'')+'" data-st="'+f+i+'" style="background:'+(c?PL.lk.CLR[c]:'transparent')+'"'+(i===4?' disabled':'')+' aria-label="'+(c?NAME[c]:'not set')+'"></button>'; }).join('')+'</div>'; }
function palette(){ return '<div class="sc7-pal">'+COLS.map(function(c){ return '<button type="button" data-br="'+c+'" class="'+(SC.brush===c?'on':'')+'" style="background:'+PL.lk.CLR[c]+'" aria-label="'+NAME[c]+'"></button>'; }).join('')+'<small class="muted">Pick a colour, then tap a sticker to fix it.</small></div>'; }
function camView(){ var f=ORDER[SC.step], done=ORDER.filter(function(x){ return SC.raw[x]; }).length;
  return '<div class="pnl"><div class="row" style="align-items:center;gap:10px"><h3 style="margin:0">Side '+(SC.step+1)+' of 6</h3><span class="sp"></span>'+ORDER.map(function(x,i){ return '<i class="sc7-dot'+(SC.raw[x]?' on':'')+(i===SC.step?' cur':'')+'" style="--c:'+PL.lk.CLR[FACE_COL[x]]+'"></i>'; }).join('')+'</div>'
   +'<p class="sc7-say">'+SAY[f]+'</p><div class="sc7-cam"><video id="sc7V" playsinline muted autoplay></video><div class="sc7-frame"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><p id="sc7Cm" class="sc7-cm"></p></div>'
   +'<div class="row" style="gap:8px;justify-content:center;margin-top:10px"><button type="button" class="btn pri" data-sc="snap" style="min-width:160px">📸 Capture this side</button></div>'
   +(SC.raw[f]?'<div class="sc7-got"><span>What I read:</span>'+grid(f)+'</div>'+palette():'')
   +'<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:12px"><button type="button" class="btn" data-sc="prev"'+(SC.step?'':' disabled')+'>← Back</button><span class="sp"></span>'+(done===6?'<button type="button" class="btn pri" data-sc="review">Check all 6 sides →</button>':'<button type="button" class="btn" data-sc="next"'+(SC.raw[f]?'':' disabled')+'>Next side →</button>')+'</div>'
   +'<p class="muted" style="font-size:13px;margin:10px 0 0">No camera? <button type="button" class="btn sm" data-sc="hand">Tap the colours in instead</button></p></div>'; }
function netView(){ var cell=function(f){ return '<div class="sc7-nf"><small>'+({U:'Top (yellow)',L:'Left (red)',F:'Front (green)',R:'Right (orange)',B:'Back (blue)',D:'Bottom (white)'}[f])+'</small>'+grid(f)+'</div>'; };
  var fl=facelets(), chk=fl&&window.CWSolver?CWSolver.check(fl):null;
  return '<div class="pnl"><h3 style="margin-top:0">Check the colours</h3><p class="muted" style="font-size:13.5px">Hold the cube with yellow on top and green in front. The top is shown as if you tipped it toward you, and the bottom as if you tipped it away.</p>'
   +'<div class="sc7-net"><div></div>'+cell('U')+'<div></div><div></div>'+cell('L')+cell('F')+cell('R')+cell('B')+'<div></div>'+cell('D')+'<div></div><div></div></div>'+palette()
   +(SC.err?'<p class="sc7-err">'+esc(SC.err)+'</p>':chk&&chk.error?'<p class="sc7-err">'+esc(chk.error)+'</p>':!fl?'<p class="muted" style="font-size:13.5px">Fill in every sticker to solve.</p>':'')
   +'<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:12px"><button type="button" class="btn" data-sc="home">← Start over</button>'+(SC.mode==='hand'&&SC.fromCam?'<button type="button" class="btn" data-sc="cam">📷 Rescan</button>':'')+'<span class="sp"></span><button type="button" class="btn pri" data-sc="solve"'+(fl&&!(chk&&chk.error)?'':' disabled')+'>Solve it →</button></div></div>'; }
function solView(){ var m=SC.sol.moves, i=SC.i;
  return '<div class="pnl sc7-sol"><div class="row" style="align-items:center;gap:10px;flex-wrap:wrap"><h3 style="margin:0">Solved in '+m.length+' moves</h3><span class="sp"></span><button type="button" class="btn sm" data-sc="home">Scan another</button></div>'
   +'<p class="muted" style="font-size:13.5px;margin:6px 0 10px">Hold your cube with <b>yellow on top</b> and <b>green in front</b>, then do each move with the 3D cube.</p>'
   +'<div class="sc7-stage"><canvas id="sc7C" width="640" height="640"></canvas><div class="sc7-now" id="sc7N">'+(i<m.length?'<small>Move '+(i+1)+' of '+m.length+'</small><b>'+m[i]+'</b>':'<b>Solved! 🎉</b>')+'</div></div>'
   +'<div class="sc7-mv" id="sc7M">'+m.map(function(x,k){ return '<button type="button" data-mi="'+k+'" class="'+(k<i?'done':k===i?'cur':'')+'">'+x+'</button>'; }).join('')+'</div>'
   +'<div class="row" style="gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px"><button type="button" class="btn" data-sc="first" aria-label="Start">⏮</button><button type="button" class="btn" data-sc="back" aria-label="Back one move">◀</button><button type="button" class="btn pri" data-sc="play" id="sc7P" style="min-width:110px">'+(SC.play?'⏸ Pause':'▶ Play')+'</button><button type="button" class="btn" data-sc="fwd" aria-label="Next move">▶</button><select class="dh-sel" id="sc7Sp" aria-label="Speed">'+[[.5,'0.5×'],[1,'1×'],[2,'2×']].map(function(o){ return '<option value="'+o[0]+'"'+(SC.spd==o[0]?' selected':'')+'>'+o[1]+'</option>'; }).join('')+'</select></div></div>'; }
/* ---------- camera ---------- */
var stream=null;
function camStart(){ var v=document.getElementById('sc7V'), cm=document.getElementById('sc7Cm'); if(!v) return;
  if(stream){ v.srcObject=stream; v.play().catch(function(){}); return; }
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){ if(cm) cm.textContent='This browser cannot use the camera. Tap the colours in instead.'; return; }
  if(cm) cm.textContent='Starting the camera…';
  navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:960}},audio:false}).then(function(s){ stream=s; var v2=document.getElementById('sc7V'); if(v2){ v2.srcObject=s; v2.play().catch(function(){}); } var c2=document.getElementById('sc7Cm'); if(c2) c2.textContent=''; })
   .catch(function(){ var c2=document.getElementById('sc7Cm'); if(c2) c2.textContent='Camera access was blocked. Allow the camera for this site, or tap the colours in instead.'; }); }
function camStop(){ if(stream){ stream.getTracks().forEach(function(t){ t.stop(); }); stream=null; } }
function snap(){ var v=document.getElementById('sc7V'); if(!v||!v.videoWidth){ CW.toast('The camera is not ready yet.'); return; } var w=v.videoWidth, h=v.videoHeight, cv=document.createElement('canvas'); cv.width=w; cv.height=h; var g=cv.getContext('2d'); g.drawImage(v,0,0,w,h);
  var box=v.getBoundingClientRect(), sc=Math.max(box.width/w,box.height/h), side=Math.min(box.width,box.height)*.7/sc, x0=(w-side)/2, y0=(h-side)/2, cs=side/3, out=[];
  for(var r=0;r<3;r++) for(var c=0;c<3;c++){ var sx=x0+c*cs+cs*.3, sy=y0+r*cs+cs*.3, sw=cs*.4, d=g.getImageData(Math.round(sx),Math.round(sy),Math.max(1,Math.round(sw)),Math.max(1,Math.round(sw))).data, R=0,G=0,B=0,n=0; for(var k=0;k<d.length;k+=4){ R+=d[k]; G+=d[k+1]; B+=d[k+2]; n++; } out.push([R/n,G/n,B/n]); }
  var f=ORDER[SC.step]; SC.raw[f]=out; for(var i=0;i<9;i++) if(i!==4) SC.f[f][i]=nearest(out[i],REF); reclass(); paint(); }
/* ---------- solution player ---------- */
var P={cu:null,mvs:null,raf:0,last:0,wait:0};
function playerStart(){ var cv=document.getElementById('sc7C'); if(!cv||!PL.lk) return; if(P.cu&&P.cu.dispose) P.cu.dispose(); P.cu=PL.lk.mkCube(cv); P.mvs=PL.lk.parseAlg(SC.sol.alg); P.cu.yaw=-0.62; P.cu.pitch=0.5; P.cu.jump(P.mvs,SC.i); P.cu.draw();
  var drag=null; cv.onpointerdown=function(e){ drag={x:e.clientX,y:e.clientY,yaw:P.cu.yaw,p:P.cu.pitch}; cv.setPointerCapture(e.pointerId); }; cv.onpointermove=function(e){ if(!drag) return; P.cu.yaw=drag.yaw+(e.clientX-drag.x)*.01; P.cu.pitch=Math.max(-1.2,Math.min(1.2,drag.p+(e.clientY-drag.y)*.01)); }; cv.onpointerup=cv.onpointercancel=function(){ drag=null; };
  cancelAnimationFrame(P.raf); P.last=0; P.raf=requestAnimationFrame(loop); }
function loop(ts){ var cv=document.getElementById('sc7C'); if(!cv||!P.cu){ P.raf=0; return; } P.raf=requestAnimationFrame(loop); var dt=Math.min(50,ts-(P.last||ts)); P.last=ts; var cu=P.cu;
  if(cu.anim){ cu.anim.t+=dt/(cu.anim.mv[1]===2?900:650)*SC.spd; var u=Math.min(1,cu.anim.t); cu.anim.a=PL.lk.MV[cu.anim.mv[0]][2]*cu.anim.mv[1]*Math.PI/2*PL.lk.ease(u); if(u>=1){ PL.lk.applyMove(cu.st,cu.anim.mv); cu.anim=null; SC.i++; P.wait=350/SC.spd; mark(); if(SC.i>=P.mvs.length){ SC.play=false; mark(); } } }
  else if(SC.play&&SC.i<P.mvs.length){ P.wait-=dt; if(P.wait<=0) cu.anim={mv:P.mvs[SC.i],t:0,a:0}; }
  cu.draw(); }
function mark(){ var m=SC.sol.moves, n=document.getElementById('sc7N'); if(n) n.innerHTML=SC.i<m.length?'<small>Move '+(SC.i+1)+' of '+m.length+'</small><b>'+m[SC.i]+'</b>':'<b>Solved! 🎉</b>';
  var mv=document.getElementById('sc7M'); if(mv) [].forEach.call(mv.children,function(b,k){ b.className=k<SC.i?'done':k===SC.i?'cur':''; }); var pb=document.getElementById('sc7P'); if(pb) pb.textContent=SC.play?'⏸ Pause':'▶ Play'; var cur=mv&&mv.children[SC.i]; if(cur&&cur.scrollIntoView&&SC.play) cur.scrollIntoView({block:'nearest',inline:'center'}); }
function jump(i){ SC.i=Math.max(0,Math.min(P.mvs.length,i)); P.cu.anim=null; P.cu.jump(P.mvs,SC.i); mark(); }
/* ---------- wiring ---------- */
var root=null;
function paint(){ var el=document.getElementById('sc7'); if(!el) return; var y=window.scrollY; el.innerHTML=body(); window.scrollTo(0,y); after(); }
function after(){ if(SC.mode==='cam'&&!SC.sol) camStart(); else camStop(); if(SC.sol) playerStart(); var sp=document.getElementById('sc7Sp'); if(sp) sp.onchange=function(){ SC.spd=+sp.value||1; }; }
function doSolve(){ var fl=facelets(); if(!fl) return; if(!window.CWSolver){ CW.toast('The solver is still loading.'); return; } var el=document.getElementById('sc7'); var b=el&&el.querySelector('[data-sc=solve]'); if(b){ b.disabled=true; b.textContent='Working it out…'; }
  setTimeout(function(){ var r=CWSolver.solve(fl); if(r.error){ SC.err=r.error; paint(); return; } SC.err=''; SC.sol=r; SC.i=0; SC.play=false; camStop(); paint(); },30); }
function click(e){ var b=e.target.closest('[data-sc],[data-st],[data-br],[data-mi]'); if(!b||!root||!root.contains(b)) return; e.preventDefault();
  if(b.hasAttribute('data-br')){ SC.brush=b.getAttribute('data-br'); root.querySelectorAll('[data-br]').forEach(function(x){ x.classList.toggle('on',x===b); }); return; }
  if(b.hasAttribute('data-st')){ var k=b.getAttribute('data-st'), f=k[0], i=+k.slice(1); if(i===4) return; SC.f[f][i]=SC.brush; SC.err=''; b.style.background=PL.lk.CLR[SC.brush]; if(SC.mode==='hand') paint(); return; }
  if(b.hasAttribute('data-mi')){ SC.play=false; jump(+b.getAttribute('data-mi')); return; }
  var a=b.getAttribute('data-sc');
  if(a==='cam'){ SC.mode='cam'; SC.sol=null; SC.step=Math.max(0,ORDER.findIndex(function(x){ return !SC.raw[x]; })); if(SC.step<0) SC.step=0; paint(); }
  else if(a==='hand'){ SC.mode='hand'; SC.sol=null; paint(); }
  else if(a==='home'){ blank(); SC.mode=''; SC.sol=null; SC.err=''; SC.step=0; SC.fromCam=false; paint(); }
  else if(a==='snap') snap();
  else if(a==='next'){ SC.step=Math.min(5,SC.step+1); paint(); } else if(a==='prev'){ SC.step=Math.max(0,SC.step-1); paint(); }
  else if(a==='review'){ SC.mode='hand'; SC.fromCam=true; paint(); }
  else if(a==='solve') doSolve();
  else if(a==='play'){ if(SC.i>=P.mvs.length) jump(0); SC.play=!SC.play; P.wait=0; mark(); }
  else if(a==='fwd'){ SC.play=false; if(P.cu.anim) return; if(SC.i<P.mvs.length){ P.cu.anim={mv:P.mvs[SC.i],t:0,a:0}; } }
  else if(a==='back'){ SC.play=false; jump(SC.i-1); } else if(a==='first'){ SC.play=false; jump(0); } }
function mount(el){ root=el.querySelector('#sc7'); if(!root) return; if(!root._sc){ root._sc=1; root.addEventListener('click',click); } after(); }
function leave(){ camStop(); cancelAnimationFrame(P.raf); P.raf=0; if(P.cu&&P.cu.dispose) P.cu.dispose(); P.cu=null; }
window.addEventListener('hashchange',function(){ if(!/^#learn\/scan/.test(location.hash)) leave(); });
window.CWScan={html:html,mount:mount,leave:leave,_SC:SC};
})();
