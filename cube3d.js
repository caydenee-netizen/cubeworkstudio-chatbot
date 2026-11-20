/* 3D Cube: a real cube you turn and solve in the browser. Timed solves, auto-solve replay, hand-off to Solve Verdict. */
(function(){
'use strict';
if(typeof CW==='undefined'||!window.PL) return;
var $=CW.$, esc=CW.esc, PL=window.PL, S=62;
var COL={z1:'#1f9a52',z_1:'#1d4fd8',x1:'#e1352b',x_1:'#ff7a1a',y_1:'#f4f4f4',y1:'#f2c400'}; try{ if(localStorage.getItem('cw_cb')==='1') Object.assign(COL,{z1:'#009e73',z_1:'#0072b2',x1:'#d55e00',x_1:'#e69f00',y1:'#f0e442'}); }catch(e){}
var MV={U:{a:1,l:-1,s:-1},D:{a:1,l:1,s:1},R:{a:0,l:1,s:1},L:{a:0,l:-1,s:-1},F:{a:2,l:1,s:1},B:{a:2,l:-1,s:-1}};
function rotM(a,deg){ var c=Math.round(Math.cos(deg*Math.PI/180)), s=Math.round(Math.sin(deg*Math.PI/180));
  return a===0?[[1,0,0],[0,c,-s],[0,s,c]]:a===1?[[c,0,s],[0,1,0],[-s,0,c]]:[[c,-s,0],[s,c,0],[0,0,1]]; }
function mul(A,B){ var R=[[0,0,0],[0,0,0],[0,0,0]]; for(var i=0;i<3;i++) for(var j=0;j<3;j++) for(var k=0;k<3;k++) R[i][j]+=A[i][k]*B[k][j]; return R; }
function vec(M,v){ return [0,1,2].map(function(i){ return M[i][0]*v[0]+M[i][1]*v[1]+M[i][2]*v[2]; }); }
function mat3d(m){ return 'matrix3d('+[m[0][0],m[1][0],m[2][0],0,m[0][1],m[1][1],m[2][1],0,m[0][2],m[1][2],m[2][2],0,0,0,0,1].join(',')+')'; }
function parse(t){ var m=/^([UDRLFBudrlfb])(w?)(['2]?)$/.exec(t); if(!m) return null; var up=m[1].toUpperCase(); return {f:up,c:m[1],w:m[2],in1:up!==m[1],q:m[3]==="'"?-1:m[3]==='2'?2:1}; }
function inv(t){ var p=parse(t); return p.c+p.w+(p.q===2?'2':p.q===1?"'":''); }
function KEY(){ return G.n===2?'cw_c3d2':G.n===4?'cw_c3d4':'cw_c3d'; }
function genScramble(){ if(G.n===4){ var F4=['U','D','R','L','F','B'], a4={U:1,D:1,R:0,L:0,F:2,B:2}, o4=[], l4=-1; while(o4.length<40){ var f4=F4[Math.floor(Math.random()*6)]; if(a4[f4]===l4) continue; l4=a4[f4]; o4.push(f4+(Math.random()<.4?'w':'')+['','\'','2'][Math.floor(Math.random()*3)]); } return o4; }
  if(G.n===2){ var F2=['U','R','F'], o2=[], l2=''; while(o2.length<11){ var f2=F2[Math.floor(Math.random()*3)]; if(f2===l2) continue; l2=f2; o2.push(f2+['','\'','2'][Math.floor(Math.random()*3)]); } return o2; }
  var F=['U','D','R','L','F','B'], ax={U:1,D:1,R:0,L:0,F:2,B:2}, out=[], last=-1, prev=-1;
  while(out.length<20){ var f=F[Math.floor(Math.random()*6)]; if(ax[f]===last) continue; last=ax[f]; out.push(f+['','\'','2'][Math.floor(Math.random()*3)]); } return out; }
var CU, G={n:(function(){ try{ var v=localStorage.getItem('cw_c3n'); return v==='2'?2:v==='4'?4:3; }catch(e){ return 3; } })(),cub:[],q:[],busy:false,hist:[],scr:[],state:'idle',t0:0,tick:0,rx:-26,ry:-38,mute:false,moves:0,el:null,anim:0};
function build(){ G.cub=[]; if(G.n===4){ var V=[-3,-1,1,3]; V.forEach(function(x){ V.forEach(function(y){ V.forEach(function(z){ if(Math.abs(x)===3||Math.abs(y)===3||Math.abs(z)===3) G.cub.push({o:[x,y,z],p:[x,y,z],m:[[1,0,0],[0,1,0],[0,0,1]],el:null}); }); }); }); return; } for(var x=-1;x<=1;x++) for(var y=-1;y<=1;y++) for(var z=-1;z<=1;z++) if(G.n!==2||(x&&y&&z)) G.cub.push({o:[x,y,z],p:[x,y,z],m:[[1,0,0],[0,1,0],[0,0,1]],el:null}); }
function faceDiv(cls,tr,col){ return '<i class="cx-f '+cls+'" style="transform:'+tr+';background:'+(col||'#15181d')+'"></i>'; }
function mkEl(c){ var d=document.createElement('div'); d.className='cx-c'; var M=G.n===4?3:1, o=c.o.map(function(v){ return Math.abs(v)===M?(v>0?1:-1):0; }), h=S/2, h2='translateZ('+h+'px)';
  d.innerHTML=faceDiv('',h2.replace('translateZ','translateZ'),o[2]===1?COL.z1:0)+faceDiv('','rotateY(180deg) '+h2,o[2]===-1?COL.z_1:0)+faceDiv('','rotateY(90deg) '+h2,o[0]===1?COL.x1:0)+faceDiv('','rotateY(-90deg) '+h2,o[0]===-1?COL.x_1:0)+faceDiv('','rotateX(90deg) '+h2,o[1]===-1?COL.y_1:0)+faceDiv('','rotateX(-90deg) '+h2,o[1]===1?COL.y1:0); c.el=d; d._c=c; return d; }
function place(c,extra){ var K=G.n===3?S:S/2; c.el.style.transform=(extra||'')+' translate3d('+c.p[0]*K+'px,'+c.p[1]*K+'px,'+c.p[2]*K+'px) '+mat3d(c.m); }
function solved(){ var M=G.n===4?3:1, seen={}; for(var i=0;i<G.cub.length;i++){ var c=G.cub[i]; for(var a=0;a<3;a++){ if(Math.abs(c.o[a])!==M) continue; var n0=[0,0,0]; n0[a]=c.o[a]>0?1:-1; var cur=vec(c.m,n0).join(','), col=a+'_'+n0[a]; if(Math.round(c.p[0]*+cur.split(',')[0]+c.p[1]*+cur.split(',')[1]+c.p[2]*+cur.split(',')[2])!==M) return false; if(seen[cur]===undefined) seen[cur]=col; else if(seen[cur]!==col) return false; } } return true; }
function snd(f,d,v){ if(G.mute) return; try{ var A=G.ac||(G.ac=new (window.AudioContext||window.webkitAudioContext)()), o=A.createOscillator(), g=A.createGain(); o.type='triangle'; o.frequency.value=f; g.gain.value=v||.04; g.gain.exponentialRampToValueAtTime(.0001,A.currentTime+d); o.connect(g); g.connect(A.destination); o.start(); o.stop(A.currentTime+d); }catch(e){} }
/* ---------- turning ---------- */
function turn(t,fast,user){ G.q.push({t:t,fast:fast,user:user}); pump(); }
function pump(){ if(G.busy||!G.q.length) return; var j=G.q.shift(), p=parse(j.t); if(!p){ pump(); return; } var m=MV[p.f], deg=m.s*90*p.q, M=G.n===4?3:1, set=G.cub.filter(function(c){ var v=c.p[m.a]*m.l; return p.in1?v===1&&M===3:(v===M||(p.w&&M===3&&v===1)); }), ax=['X','Y','Z'][m.a];
  G.busy=true; var dur=j.fast?(G.q.length>6?42:90):190, t0=performance.now(); snd(j.fast?300:360+Math.random()*60,.05,.025);
  function f(now){ var k=Math.min(1,(now-t0)/dur), e=j.fast?k:1+2.2*Math.pow(k-1,3)+1.2*Math.pow(k-1,2); set.forEach(function(c){ place(c,'rotate'+ax+'('+(deg*e)+'deg)'); });
    if(k<1){ G.anim=requestAnimationFrame(f); return; }
    var R=rotM(m.a,deg); set.forEach(function(c){ c.p=vec(R,c.p); c.m=mul(R,c.m); place(c); });
    G.busy=false; after(j); pump(); }
  G.anim=requestAnimationFrame(f); }
function after(j){ if(j.sys) return; if(!j.user) return; G.hist.push(j.t); G.moves++; if(G.state==='scrambled'){ G.state='solving'; G.t0=performance.now(); G.tick=setInterval(clock,47); }
  G.sol.push(j.t); ui(); if(G.state==='solving'&&solved()) win(); try{ if(window.CWEgg) CWEgg.cube(G.hist); }catch(e){} }
function clock(){ var e=$('#cxT'); if(e&&G.state==='solving') e.textContent=(((performance.now()-G.t0)/1000)).toFixed(2); }
/* ---------- game flow ---------- */
function scramble(){ G.hints=0; if(G.state==='solving'){ clearInterval(G.tick); } G.q=[]; G.sol=[]; G.hist=[]; G.moves=0; G.scr=genScramble(); G.state='scrambling'; G.q=[]; ui();
  var done=0; G.scr.forEach(function(t,i){ G.q.push({t:t,fast:true,sys:1,last:i===G.scr.length-1}); }); G.q.push({t:'',fast:true,sys:1,end:1}); var iv=setInterval(function(){ if(!G.busy&&!G.q.length){ clearInterval(iv); G.hist=G.scr.slice(); G.state='scrambled'; ui(); } },80); pump(); }
function reset(){ cancelAnimationFrame(G.anim); G.busy=false; G.q=[]; clearInterval(G.tick); G.cub.forEach(function(c){ c.p=c.o.slice(); c.m=[[1,0,0],[0,1,0],[0,0,1]]; place(c); }); G.state='idle'; G.scr=[]; G.sol=[]; G.hist=[]; G.moves=0; ui(); }
function win(){ clearInterval(G.tick); var t=Math.round(performance.now()-G.t0); G.state='done'; G.last={t:t,scr:G.scr.join(' '),sol:G.sol.join(' '),n:G.sol.length};
  var day=new Date().toDateString(), st=CW.lsJ(KEY(),{})||{}; if(st.d!==day){ st.d=day; st.n=0; } var rew=0; if(t>=3000&&G.sol.length>=8&&st.n<5&&!G.hints){ st.n++; rew=PL.award(20); PL.addXP(15); }
  var pb=!st.best||t<st.best; if(pb) st.best=t; CW.setJ(KEY(),st);
  try{ var d=PL.T.data(); (d.solves[G.n===2?'222':G.n===4?'444':'333']=d.solves[G.n===2?'222':G.n===4?'444':'333']||[]).push({t:t,scr:G.scr.join(' '),d:Date.now(),cx:1}); PL.T.save(d); }catch(e){}
  if(PL.hud) PL.hud(); G.last.rew=rew; G.last.pb=pb; [523,659,784,1047].forEach(function(f,i){ setTimeout(function(){ snd(f,.25,.05); },i*110); }); confetti(); ui(); }
function confetti(){ var st=$('#cxStage'); if(!st) return; var cs=['#e1352b','#ff7a1a','#f2c400','#1f9a52','#2650f5','#fff']; for(var i=0;i<70;i++){ var d=document.createElement('b'); d.className='cx-cf'; d.style.cssText='left:'+(50+(Math.random()-.5)*20)+'%;background:'+cs[i%6]+';--dx:'+((Math.random()-.5)*520)+'px;--dy:'+(-120-Math.random()*220)+'px;--r:'+(Math.random()*900-450)+'deg;animation-delay:'+(Math.random()*.15)+'s'; st.appendChild(d); (function(x){ setTimeout(function(){ x.remove(); },2200); })(d); } }
function showMe(){ if(G.state==='solving') clearInterval(G.tick); var all=G.hist.slice().reverse().map(inv); G.state='demo'; G.q=all.map(function(t){ return {t:t,fast:true,sys:1}; }); ui(); var iv=setInterval(function(){ if(!G.busy&&!G.q.length){ clearInterval(iv); G.state='idle'; G.hist=[]; G.sol=[]; G.moves=0; ui(); } },100); pump(); }
function toVerdict(){ var L=G.last; if(!L) return; CW.setJ('cw_vd_last',{s:L.scr,q:L.sol,t:(L.t/1000).toFixed(2)}); location.hash='#verdict'; }
/* ---------- view ---------- */
function ui(){ var el=G.el; if(!el) return; var T=$('#cxT',el), sc=$('#cxS',el), msg=$('#cxM',el), pbn=$('#cxB',el), st=CW.lsJ(KEY(),{})||{}, S2=G.state;
  if(T&&S2!=='solving') T.textContent=S2==='done'&&G.last?(G.last.t/1000).toFixed(2):'0.00';
  if(sc) sc.textContent=G.scr.length?G.scr.join(' '):'Tap Scramble, then solve it as fast as you can.';
  if(pbn) pbn.textContent=st.best?(st.best/1000).toFixed(2)+'s':'–';
  var mv=$('#cxN',el); if(mv) mv.textContent=G.moves;
  var t=({idle:'Free play. Turn the cube, or tap Scramble.',scrambling:'Scrambling…',scrambled:'Ready. Your first turn starts the timer.',solving:'Solving…',done:G.last?(G.last.n+' moves'+(G.last.pb?' · New best!':'')+(G.last.rew?' · +'+G.last.rew+' tokens':'')):'',demo:'Solving it for you…'})[S2];
  if(msg) msg.textContent=t; var dn=$('#cxDone',el); if(dn) dn.hidden=S2!=='done'; el.classList.toggle('cx-run',S2==='solving'); }
function view(el){ build(); G.el=el; G.state='idle'; G.scr=[]; G.sol=[]; G.hist=[]; G.moves=0; G.q=[]; G.busy=false; clearInterval(G.tick);
  function pad(w){ return 'U D R L F B'.split(' ').map(function(f){ return ['','\'','2'].map(function(q){ return '<button type="button" class="cx-b cx-'+f+(q?' p':'')+'" data-m="'+f+w+q+'">'+f+w+q+'</button>'; }).join(''); }).join(''); }
  var btn=pad('');
  el.innerHTML='<div class="wrap cx">'+PL.crumbs('3D Cube')
   +'<div class="cx-top"><div class="cx-time"><small>Time</small><b id="cxT" class="mono">0.00</b></div><div class="cx-time"><small>Moves</small><b id="cxN" class="mono">0</b></div><div class="cx-time"><small>Best</small><b id="cxB" class="mono">–</b></div><span class="sp"></span><div class="seg" id="cxN2"><button type="button" data-n="3" aria-pressed="'+(G.n===3)+'">3×3</button><button type="button" data-n="2" aria-pressed="'+(G.n===2)+'">2×2</button><button type="button" data-n="4" aria-pressed="'+(G.n===4)+'">4×4</button></div><button type="button" class="btn sm" id="cxSnd" aria-pressed="false">🔊</button></div>'
   +'<div class="cx-stage" id="cxStage"><div class="cx-scene" id="cxScene"><div class="cx-cube" id="cxCube"></div><div class="cx-shadow"></div></div><div class="cx-done" id="cxDone" hidden><b>Solved!</b><div class="row" style="gap:8px;justify-content:center;flex-wrap:wrap"><button type="button" class="btn sm" id="cxAgain">Scramble again</button></div></div></div>'
   +'<p class="cx-scr mono" id="cxS"></p><p class="muted cx-msg" id="cxM"></p>'
   +'<div class="cx-ctl"><button type="button" class="btn pri" id="cxSc">Scramble</button><button type="button" class="btn" id="cxMe">Solve it for me</button><button type="button" class="btn" id="cxRs">Reset</button>'+((PL.updOn&&PL.updOn())?'<button type="button" class="btn" id="cxUn" title="Undo your last turn (Z)">↶ Undo</button>':'')+((PL.updOn2&&PL.updOn2())?'<button type="button" class="btn" id="cxHt" title="Show the next move. No tokens for a solve with hints.">💡 Hint</button>':'')+'</div>'
   +'<div class="cx-pad">'+btn+'</div>'+(G.n===4?'<p class="muted" style="font-size:13px;margin:12px 0 6px">Wide turns (two layers)</p><div class="cx-pad">'+pad('w')+'</div>':'')+'<p class="muted" style="font-size:13px;margin-top:10px">Swipe a face to turn it. Drag the dark area to look around. Keys: R U F L D B, hold Shift for the reverse turn. Up to 5 rewarded solves a day.'+(G.n===4?' On the 4×4 you can swipe an inner layer too. In hints, a small letter like r means that inner layer.':'')+'</p></div>';
  var cube=$('#cxCube',el); G.cub.forEach(function(c){ cube.appendChild(mkEl(c)); place(c); });
  $('#cxN2',el).onclick=function(e){ var b=e.target.closest('[data-n]'); if(!b) return; var n=+b.getAttribute('data-n'); if(n===G.n) return; G.n=n; try{ localStorage.setItem('cw_c3n',String(n)); }catch(x){} view(el); }; if(G.n!==3){ var vd=$('#cxVd',el); if(vd) vd.hidden=true; }
  function look(){ cube.style.transform=(G.n===4?'scale3d(.72,.72,.72) ':'')+'rotateX('+G.rx+'deg) rotateY('+G.ry+'deg)'; } look();
  var sc=$('#cxScene',el), drag=null, NRM=[[0,0,1],[0,0,-1],[1,0,0],[-1,0,0],[0,-1,0],[0,1,0]];
  function proj(v){ var a=G.rx*Math.PI/180, b=G.ry*Math.PI/180, x1=Math.cos(b)*v[0]+Math.sin(b)*v[2], z1=-Math.sin(b)*v[0]+Math.cos(b)*v[2], y1=Math.cos(a)*v[1]-Math.sin(a)*z1; return [x1,y1]; }
  function swipeMove(h,dx,dy){ var c=h.c, nrm=vec(c.m,NRM[h.i]), P=[c.p[0]+nrm[0]*.5,c.p[1]+nrm[1]*.5,c.p[2]+nrm[2]*.5], best=null;
    for(var a=0;a<3;a++){ if(nrm[a]!==0||c.p[a]===0) continue; var R=rotM(a,90), Q=vec(R,P), v=[Q[0]-P[0],Q[1]-P[1],Q[2]-P[2]], pv=proj(v), dot=pv[0]*dx+pv[1]*dy, sc2=Math.abs(dot)/((Math.hypot(pv[0],pv[1])||1)*(Math.hypot(dx,dy)||1)); if(!best||sc2>best.sc) best={a:a,dot:dot,sc:sc2}; }
    if(!best) return null; var face=null; var MM=G.n===4?3:1, cv=c.p[best.a]; Object.keys(MV).forEach(function(f){ if(MV[f].a===best.a&&MV[f].l===(cv>0?1:-1)) face=f; }); if(!face) return null; var want=best.dot>=0?1:-1, q=want*MV[face].s>0?1:-1; return (Math.abs(cv)===MM?face:face.toLowerCase())+(q<0?"'":''); }
  sc.addEventListener('dragstart',function(e){ e.preventDefault(); }); sc.addEventListener('selectstart',function(e){ e.preventDefault(); });
  sc.addEventListener('pointerdown',function(e){ if(e.pointerType==='mouse') e.preventDefault(); var f=e.target.closest&&e.target.closest('.cx-f'), h=null; if(f&&f.parentNode._c&&G.state!=='scrambling'&&G.state!=='demo'){ var kids=[].indexOf.call(f.parentNode.children,f), c=f.parentNode._c; h={c:c,i:kids}; } drag={x:e.clientX,y:e.clientY,h:h,sx:e.clientX,sy:e.clientY,done:false}; sc.setPointerCapture&&sc.setPointerCapture(e.pointerId); });
  sc.addEventListener('pointermove',function(e){ if(!drag) return;
    if(drag.h){ if(drag.done) return; var dx=e.clientX-drag.sx, dy=e.clientY-drag.sy; if(Math.hypot(dx,dy)<16) return; var m=swipeMove(drag.h,dx,dy); drag.done=true; if(m) turn(m,false,true); return; }
    G.ry+=(e.clientX-drag.x)*.55; G.rx=Math.max(-80,Math.min(80,G.rx-(e.clientY-drag.y)*.55)); drag.x=e.clientX; drag.y=e.clientY; look(); });
  sc.addEventListener('pointerup',function(){ drag=null; }); sc.addEventListener('pointercancel',function(){ drag=null; });
  if(!el._cxB){ el._cxB=1; el.addEventListener('click',function(e){ var b=e.target.closest('[data-m]'); if(b){ if(G.state==='scrambling'||G.state==='demo') return; turn(b.getAttribute('data-m'),false,true); return; } }); }
  function undo(){ if(G.busy||G.q.length||G.state==='scrambling'||G.state==='demo'||G.state==='done'||!G.sol.length) return; var m=G.sol.pop(); G.hist.pop(); G.moves=Math.max(0,G.moves-1); G.q.push({t:inv(m),fast:true,sys:1}); pump(); ui(); }
  var un=$('#cxUn',el); if(un) un.onclick=undo; G.undo=undo;
  var ht=$('#cxHt',el); if(ht) ht.onclick=function(){ if(G.state!=='scrambled'&&G.state!=='solving'){ CW.toast('Scramble the cube first.'); return; } if(!G.hist.length||G.busy||G.q.length) return; G.hints=(G.hints||0)+1; var nx=inv(G.hist[G.hist.length-1]), m=$('#cxM',el); if(m){ m.textContent='Hint: turn '+nx+(G.hints===1?' · no tokens for this solve':''); } };
  $('#cxSc',el).onclick=scramble; $('#cxAgain',el).onclick=scramble; $('#cxRs',el).onclick=reset; $('#cxMe',el).onclick=function(){ if(G.hist.length&&G.state!=='demo'&&G.state!=='scrambling') showMe(); else CW.toast('Scramble the cube first.'); }; 
  $('#cxSnd',el).onclick=function(){ G.mute=!G.mute; this.textContent=G.mute?'🔇':'🔊'; };
  if(G.key) document.removeEventListener('keydown',G.key); G.key=function(e){ if(!el.isConnected||/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||'')||e.metaKey||e.ctrlKey||e.altKey) return; var k=e.key.toUpperCase(); if(k==='Z'&&G.undo&&document.getElementById('cxUn')){ e.preventDefault(); G.undo(); return; } if('UDRLFB'.indexOf(k)<0||k.length!==1) return; e.preventDefault(); if(G.state==='scrambling'||G.state==='demo') return; turn(k+(e.shiftKey?"'":''),false,true); };
  document.addEventListener('keydown',G.key); ui(); }
PL._cx=G; PL.views.cube3d={show:view,leave:function(){ clearInterval(G.tick); cancelAnimationFrame(G.anim); document.removeEventListener('keydown',G.key); G.q=[]; G.busy=false; }};
})();
