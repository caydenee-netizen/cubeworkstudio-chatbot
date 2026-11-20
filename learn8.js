/* Learn extras: Beginner course, Notation quiz, Cross planning drill and My path (what to learn next, your own algorithms, printable sheets).
   Adds Learn tabs through window.CWLearnX (read by play-learn.js) and uses its 3D cube (PL.lk) when a tab opens. */
(function(){
'use strict';
function esc(t){ return String(t==null?'':t).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } }
function lj(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)||'null'); return v==null?d:v; }catch(e){ return d; } }
/* ---------- your own algorithms: applied to the case data so the Room, Drill and /alg all use them ---------- */
function myAlgs(){ var o=lj('cw_myalg',{}); return o&&typeof o==='object'?o:{}; }
function applyMine(){ var D=window.LEARN_DATA; if(!D) return; var M=myAlgs(); ['oll','pll','f2l'].forEach(function(k){ (D[k]||[]).forEach(function(c){ if(c.alg0===undefined) c.alg0=c.alg; var m=M[k+':'+c.id]; c.alg=m||c.alg0; if(m) c.an=m; else if(c.an0!==undefined) c.an=c.an0; }); }); }
(function(){ var D=window.LEARN_DATA; if(D) ['oll','pll','f2l'].forEach(function(k){ (D[k]||[]).forEach(function(c){ c.alg0=c.alg; c.an0=c.an; }); }); applyMine(); })();
/* checks a new alg does the same job as the one it replaces (with any U turn before or after) */
function sameJob(k,oldAlg,newAlg){ var L=PL.lk, P=L.parseAlg; if(!P(newAlg).length) return false; var setup=L.invAlg(P(oldAlg)), U=[[],[['U',1,'U']],[['U',2,'U2']],[['U',-1,"U'"]]];
  function solvedEnough(st){ var C={}; st.forEach(function(s){ if(Math.abs(s.p[0])+Math.abs(s.p[1])+Math.abs(s.p[2])===1) C[s.n.join()]=s.c; });
    return st.every(function(s){ var top=s.n[1]===1; if(k==='oll'){ if(s.p[1]===1&&!top) return true; } return C[s.n.join()]===s.c; }); }
  for(var a=0;a<4;a++) for(var b=0;b<4;b++){ var st=L.solvedCube(); setup.forEach(function(m){ L.applyMove(st,m); }); U[a].concat(P(newAlg),U[b]).forEach(function(m){ L.applyMove(st,m); }); if(solvedEnough(st)) return true; } return false; }
function editAlg(k,id){ var D=window.LEARN_DATA, c=D&&(D[k]||[]).filter(function(x){ return String(x.id)===String(id); })[0]; if(!c) return; var M=myAlgs(), key=k+':'+id;
  var sh=CW.sheet('<div class="hd"><h2>My '+k.toUpperCase()+' '+esc(id)+'</h2><button class="x" data-close aria-label="Close">✕</button></div><p class="muted" style="font-size:13.5px">Type the algorithm you use for this case. It is checked on a virtual cube, then used everywhere in Learn.</p><p class="mono" style="font-size:13px;opacity:.7">Default: '+esc(c.alg0)+'</p><input class="in mono" id="l8A" value="'+esc(M[key]||'')+'" placeholder="e.g. R U R\' U\'" style="width:100%;font-size:17px" autocapitalize="off" autocorrect="off" spellcheck="false"><p id="l8M" class="muted" style="min-height:20px;font-size:13.5px"></p><div class="row" style="gap:8px"><button class="btn pri" type="button" id="l8S">Save</button>'+(M[key]?'<button class="btn" type="button" id="l8R">Use the default again</button>':'')+'</div>');
  sh.querySelector('#l8S').onclick=function(){ var a=sh.querySelector('#l8A').value.trim().replace(/[’`]/g,"'").replace(/\s+/g,' '); if(!a) return; if(!sameJob(k,c.alg0,a)){ sh.querySelector('#l8M').textContent='❌ That does not solve this case on the virtual cube. Check for typos (use R, U\', R2 and so on).'; return; } var o=myAlgs(); o[key]=a; ls('cw_myalg',JSON.stringify(o)); applyMine(); sh.close(); CW.toast('Saved. Learn uses your alg now.'); window.dispatchEvent(new HashChangeEvent('hashchange')); };
  var r=sh.querySelector('#l8R'); if(r) r.onclick=function(){ var o=myAlgs(); delete o[key]; ls('cw_myalg',JSON.stringify(o)); applyMine(); sh.close(); CW.toast('Back to the default alg.'); window.dispatchEvent(new HashChangeEvent('hashchange')); }; }
/* a "My alg" button in every case room */
setInterval(function(){ var bt=document.querySelector('.rmbt'); if(!bt||bt.querySelector('#l8My')) return; var m=/^#learn\/(oll|pll|f2l)\/([^/]+)$/.exec(location.hash); if(!m) return; var b=document.createElement('button'); b.className='btn sm'; b.id='l8My'; b.type='button'; b.textContent=myAlgs()[m[1]+':'+decodeURIComponent(m[2])]?'✏️ My alg (on)':'✏️ Use my own alg'; b.onclick=function(){ editAlg(m[1],decodeURIComponent(m[2])); }; bt.appendChild(b); },700);
/* ---------- a small 3D player for demos ---------- */
function player(cv,alg,opt){ var L=PL.lk; if(!L) return null; var cu=L.mkCube(cv); if(!cu) return null; var mvs=L.parseAlg(alg), i=0, wait=900, last=0, spd=(opt&&opt.spd)||1, raf=0, playing=true;
  cu.jump(mvs,0); cu.draw();
  function tick(ts){ raf=requestAnimationFrame(tick); if(!document.body.contains(cv)){ cancelAnimationFrame(raf); return; } var dt=Math.min(60,ts-(last||ts)); last=ts;
    if(cu.anim){ cu.anim.t+=dt/(cu.anim.mv[1]===2?900:650)*spd*1.4; var u=Math.min(1,cu.anim.t); cu.anim.a=L.MV[cu.anim.mv[0]][2]*cu.anim.mv[1]*Math.PI/2*L.ease(u); if(u>=1){ L.applyMove(cu.st,cu.anim.mv); cu.anim=null; i++; wait=i>=mvs.length?1600:260/spd; if(opt&&opt.onStep) opt.onStep(i); } }
    else if(playing){ wait-=dt; if(wait<=0){ if(i>=mvs.length){ if(opt&&opt.once){ playing=false; } else { cu.jump(mvs,0); i=0; wait=900; if(opt&&opt.onStep) opt.onStep(0); } } else cu.anim={mv:mvs[i],t:0,a:0}; } }
    cu.draw(); }
  var drag=null; cv.style.touchAction='none'; cv.onpointerdown=function(e){ drag=[e.clientX,e.clientY]; try{ cv.setPointerCapture(e.pointerId); }catch(x){} }; cv.onpointermove=function(e){ if(!drag) return; cu.yaw+=(e.clientX-drag[0])*.008; cu.pitch=Math.max(-1.2,Math.min(1.2,cu.pitch+(e.clientY-drag[1])*.008)); drag=[e.clientX,e.clientY]; }; cv.onpointerup=cv.onpointercancel=function(){ drag=null; };
  raf=requestAnimationFrame(tick);
  return {replay:function(){ cu.jump(mvs,0); i=0; wait=500; playing=true; cu.anim=null; }, set:function(a){ mvs=L.parseAlg(a); cu.jump(mvs,0); i=0; wait=700; playing=true; cu.anim=null; }, cube:cu, stop:function(){ cancelAnimationFrame(raf); }}; }
/* ---------- 19 Beginner course ---------- */
var BEG=[
 ['1. White cross','Make a plus sign of white edges on the bottom, each one matching the centre beside it. Find a white edge, turn the top until its other colour sits above the matching centre, then turn that side twice to drop it down.','F2','Hold the cube with white on the bottom the whole time.'],
 ['2. White corners','Find a corner with white on the top layer. Turn the top until it sits right above the place it belongs, then repeat this until it goes in white-side down.','R U R\' U\'','It can take 1, 3 or 5 times. That is normal.'],
 ['3. Middle layer, edge to the right','Find a top edge with no yellow. Turn the top so its front colour matches the front centre. If it belongs on the right, do this.','U R U\' R\' U\' F\' U F',''],
 ['3. Middle layer, edge to the left','If the edge belongs on the left, do the mirror.','U\' L\' U L U F U\' F\'',''],
 ['4. Yellow cross','Look at the yellow edges on top: a dot, an L or a line. Hold an L in the back left, or a line going left to right, and do this until you have a cross.','F R U R\' U\' F\'','A dot needs it 3 times, an L twice, a line once.'],
 ['5. Yellow edges','Turn the top until two edges match their sides. Hold one matching edge at the back and one on the right, then do this.','R U R\' U R U2 R\'','If two opposite edges match, do it once from any side and look again.'],
 ['6. Yellow corners in place','Find a corner that is in the right place (it may be twisted). Hold it at the front right and do this until all four corners are in place.','U R U\' L\' U R\' U\' L',''],
 ['7. Twist the last corners','Hold the cube with yellow on top and a wrong corner at the front right. Repeat this until that corner is yellow on top, then turn only the top (U) to bring the next wrong corner there. Do not turn the whole cube.','R\' D\' R D','The cube looks messy in the middle of this step. Keep going and it fixes itself.']];
function begHtml(){ return '<div class="pnl"><h3 style="margin-top:0">🧩 Beginner course</h3><p class="muted">Seven steps that solve the whole cube. Watch each move on the 3D cube (drag it to look around), then try it on yours.</p></div>'
  +BEG.map(function(s,i){ return '<div class="pnl l8-step"><div class="l8-st"><div><h3>'+esc(s[0])+'</h3><p>'+esc(s[1])+'</p>'+(s[3]?'<p class="muted" style="font-size:13.5px">💡 '+esc(s[3])+'</p>':'')+'<code class="l8-alg">'+esc(s[2])+'</code><div class="row" style="gap:8px;margin-top:8px"><button class="btn sm" type="button" data-l8r="'+i+'">↺ Watch again</button><label class="l8-done"><input type="checkbox" data-l8d="'+i+'"'+(lj('cw_beg',{})[i]?' checked':'')+'> I can do this</label></div></div><canvas class="l8-cv" data-l8c="'+i+'" width="400" height="400"></canvas></div></div>'; }).join('')
  +'<div class="pnl"><p style="margin:0">Solved it? 🎉 Next, learn <a href="#learn/guide">2-look OLL and PLL</a> in the Guide to get much faster.</p></div>'; }
var PLY={};
function begMount(el){ PLY={}; [].forEach.call(el.querySelectorAll('[data-l8c]'),function(cv){ var i=+cv.getAttribute('data-l8c'); var s=BEG[i]; var sz=Math.min(260,cv.parentNode.clientWidth*.42||220); cv.style.width=cv.style.height=Math.max(160,sz)+'px'; PLY[i]=player(cv,s[2].replace(/'/g,"'"),{spd:.8}); });
  el.addEventListener('click',function(e){ var b=e.target.closest('[data-l8r]'); if(b&&PLY[+b.getAttribute('data-l8r')]) PLY[+b.getAttribute('data-l8r')].replay(); });
  el.addEventListener('change',function(e){ var c=e.target.getAttribute&&e.target.getAttribute('data-l8d'); if(c==null) return; var o=lj('cw_beg',{}); o[c]=e.target.checked; ls('cw_beg',JSON.stringify(o)); if(Object.keys(o).filter(function(k){ return o[k]; }).length===BEG.length) CW.toast('🎉 Course done! You can solve the cube.'); }); }
/* ---------- 20 Notation quiz ---------- */
var NQ={pool:["R","R'","R2","L","L'","U","U'","U2","D","D'","F","F'","F2","B","B'","M","M'","r","r'","x","y","y'","z"],q:0,ok:0,ans:null,pl:null};
var NDESC={R:'Right face',L:'Left face',U:'Top face',D:'Bottom face',F:'Front face',B:'Back face',M:'Middle slice (like L)',r:'Right two layers',x:'Whole cube (like R)',y:'Whole cube (like U)',z:'Whole cube (like F)'};
function nqHtml(){ return '<div class="pnl"><h3 style="margin-top:0">🔤 Notation quiz</h3><p class="muted">Watch the move on the 3D cube, then pick its name. A letter on its own turns clockwise (as if you look at that face), \' means anticlockwise, and 2 means twice.</p><div class="l8-nq"><canvas id="l8Nc" width="400" height="400"></canvas><div><div id="l8Nq"></div></div></div></div>'
  +'<div class="pnl"><h3 style="margin-top:0">Cheat sheet</h3><div class="l8-nt">'+Object.keys(NDESC).map(function(k){ return '<div><b>'+k+'</b><span>'+NDESC[k]+'</span></div>'; }).join('')+'</div></div>'; }
function nqNext(el){ var box=el.querySelector('#l8Nq'); if(NQ.q>=10){ box.innerHTML='<h3>'+NQ.ok+' / 10</h3><p>'+(NQ.ok>=9?'Excellent, you know your notation!':NQ.ok>=6?'Good. One more round makes it stick.':'Keep at it. Use the cheat sheet below.')+'</p><button class="btn pri" type="button" data-nq="again">Play again</button>'; var o=+ls('cw_nq_best')||0; if(NQ.ok>o) ls('cw_nq_best',String(NQ.ok)); return; }
  var a=NQ.pool[Math.floor(Math.random()*NQ.pool.length)], opts=[a]; while(opts.length<4){ var x=NQ.pool[Math.floor(Math.random()*NQ.pool.length)]; if(opts.indexOf(x)<0) opts.push(x); } opts.sort(function(){ return Math.random()-.5; }); NQ.ans=a;
  NQ.pl.set(a); box.innerHTML='<small class="muted">Question '+(NQ.q+1)+' of 10 · score '+NQ.ok+'</small><h3 style="margin:6px 0 10px">Which move is this?</h3><div class="l8-opts">'+opts.map(function(o){ return '<button type="button" class="btn" data-nq="'+o+'">'+o+'</button>'; }).join('')+'</div><button type="button" class="btn sm" data-nq="see" style="margin-top:8px">↺ Show again</button>'; }
function nqMount(el){ NQ.q=0; NQ.ok=0; var cv=el.querySelector('#l8Nc'); NQ.pl=player(cv,'',{once:true,spd:.7}); if(!NQ.pl) return; nqNext(el);
  el.addEventListener('click',function(e){ var b=e.target.closest('[data-nq]'); if(!b) return; var v=b.getAttribute('data-nq'); if(v==='see'){ NQ.pl.set(NQ.ans); return; } if(v==='again'){ NQ.q=0; NQ.ok=0; nqNext(el); return; }
    var good=v===NQ.ans; if(good) NQ.ok++; [].forEach.call(el.querySelectorAll('.l8-opts [data-nq]'),function(x){ x.disabled=true; if(x.getAttribute('data-nq')===NQ.ans) x.classList.add('pri'); else if(x===b) x.classList.add('l8-bad'); }); NQ.q++; setTimeout(function(){ nqNext(el); },good?700:1600); }); }
/* ---------- 21 Cross planning drill: optimal white cross by search ---------- */
var CX={tab:null,busy:false};
/* one white edge sticker = (edge position, which side the white faces): 24 states. Four edges -> 24^4 = 331,776 cube states. */
var AXM={R:[0,1],L:[0,-1],U:[1,1],D:[1,-1],F:[2,1],B:[2,-1]}, FACES='RLUDFB'.split('');
function rotv(v,ax,sg){ var x=v[0],y=v[1],z=v[2]; if(ax===0) return sg>0?[x,z,-y]:[x,-z,y]; if(ax===1) return sg>0?[-z,y,x]:[z,y,-x]; return sg>0?[y,-x,z]:[-y,x,z]; }
var EST=[], EIX={}; (function(){ for(var x=-1;x<=1;x++)for(var y=-1;y<=1;y++)for(var z=-1;z<=1;z++){ var p=[x,y,z]; if(Math.abs(x)+Math.abs(y)+Math.abs(z)!==2) continue; [[x,0,0],[0,y,0],[0,0,z]].forEach(function(n){ if(n[0]||n[1]||n[2]){ EIX[p.join()+'|'+n.join()]=EST.length; EST.push([p,n]); } }); } })();
var MT=FACES.map(function(f){ var a=AXM[f]; return [1,2,3].map(function(k){ return EST.map(function(e){ var p=e[0], n=e[1]; for(var t=0;t<k;t++){ if(p[a[0]]*a[1]!==1) break; p=rotv(p,a[0],a[1]); n=rotv(n,a[0],a[1]); } return EIX[p.join()+'|'+n.join()]; }); }); });
var SOLV=[[0,1,1],[1,1,0],[0,1,-1],[-1,1,0]].map(function(p){ return EIX[p.join()+'|0,1,0']; });
function enc(e){ return ((e[0]*24+e[1])*24+e[2])*24+e[3]; }
function cxBuild(cb){ if(CX.tab){ cb(); return; } var D=new Int8Array(331776).fill(-1), q=new Uint32Array(331776), h=0, t=0, s0=enc(SOLV); D[s0]=0; q[t++]=s0;
  function step(){ var lim=h+20000; while(h<t&&h<lim){ var s=q[h++], d=D[s], e=[Math.floor(s/13824),Math.floor(s/576)%24,Math.floor(s/24)%24,s%24];
      for(var m=0;m<6;m++) for(var k=0;k<3;k++){ var T=MT[m][k], s2=enc([T[e[0]],T[e[1]],T[e[2]],T[e[3]]]); if(D[s2]<0){ D[s2]=d+1; q[t++]=s2; } } }
    if(h<t) setTimeout(step,0); else { CX.tab=D; cb(); } }
  step(); }
function cxSolve(scr){ var e=SOLV.slice(); scr.trim().split(/\s+/).forEach(function(m){ var x=/^([RLUDFB])(['2]?)$/.exec(m); if(!x) return; var T=MT[FACES.indexOf(x[1])][x[2]==='2'?1:x[2]==="'"?2:0]; e=e.map(function(v){ return T[v]; }); });
  var out=[], last=-1, d=CX.tab[enc(e)]; if(d<0) return null;
  while(d>0){ var ok=false; for(var m=0;m<6&&!ok;m++){ if(m===last) continue; for(var k=0;k<3;k++){ var T=MT[m][k], e2=e.map(function(v){ return T[v]; }), d2=CX.tab[enc(e2)]; if(d2===d-1){ e=e2; d=d2; out.push(FACES[m]+(k===1?'2':k===2?"'":'')); last=m; ok=true; break; } } } if(!ok) return null; } return out; }
function z2(alg){ var M={U:'D',D:'U',R:'L',L:'R',F:'F',B:'B'}; return alg.map(function(m){ return M[m[0]]+m.slice(1); }).join(' '); }
function cxScr(){ var F='RLUDFB', o=[], last=-1, prev=-1; while(o.length<20){ var f=Math.floor(Math.random()*6); if(f===last||(Math.floor(f/2)===Math.floor(last/2)&&Math.floor(f/2)===Math.floor(prev/2))) continue; prev=last; last=f; o.push(F[f]+['',"'",'2'][Math.floor(Math.random()*3)]); } return o.join(' '); }
var CXS={scr:'',t:0,timer:0};
function cxHtml(){ return '<div class="pnl"><h3 style="margin-top:0">✚ Cross planning drill</h3><p class="muted">Scramble your cube with white on top and green in front, as usual. You get 15 seconds to plan the whole white cross in your head, like competition inspection. Then do it, and compare with the best possible cross.</p><div id="l8X"></div></div>'; }
function cxDraw(el,phase){ var b=el.querySelector('#l8X'); if(!b) return;
  if(phase==='start') b.innerHTML='<p class="mono l8-scr">'+esc(CXS.scr)+'</p><div class="row" style="gap:8px"><button class="btn pri" type="button" data-cx="go">I scrambled it. Start 15 s</button><button class="btn" type="button" data-cx="new">New scramble</button></div>';
  else if(phase==='plan') b.innerHTML='<p class="mono l8-scr">'+esc(CXS.scr)+'</p><div class="l8-cd" id="l8Cd">15</div><p class="muted" style="text-align:center">Plan every move of the cross without turning the cube.</p><button class="btn wide" type="button" data-cx="done">I have a plan</button>';
  else { var sol=cxSolve(CXS.scr); b.innerHTML='<p class="mono l8-scr">'+esc(CXS.scr)+'</p>'+(sol?'<div class="l8-res"><div><small>Best white cross (white on top)</small><b class="mono">'+(sol.length?sol.join(' '):'Already solved!')+'</b></div><div><small>Same cross after z2 (white on the bottom)</small><b class="mono">'+(sol.length?z2(sol):'–')+'</b></div><div><small>Moves</small><b>'+sol.length+'</b></div></div><p class="muted" style="font-size:13.5px">Most good crosses take 8 moves or fewer. If yours was longer, try to find this one on your cube.</p>':'<p class="muted">Could not work it out. Try a new scramble.</p>')+'<button class="btn pri" type="button" data-cx="new">Next scramble</button>'; } }
function cxMount(el){ CXS.scr=cxScr(); var b=el.querySelector('#l8X'); b.innerHTML='<p class="muted">Getting the cross helper ready…</p>'; cxBuild(function(){ cxDraw(el,'start'); });
  el.addEventListener('click',function(e){ var t=e.target.closest('[data-cx]'); if(!t) return; var a=t.getAttribute('data-cx'); clearInterval(CXS.timer);
    if(a==='new'){ CXS.scr=cxScr(); cxDraw(el,'start'); }
    else if(a==='go'){ CXS.t=Date.now(); cxDraw(el,'plan'); CXS.timer=setInterval(function(){ var left=15-Math.floor((Date.now()-CXS.t)/1000), c=el.querySelector('#l8Cd'); if(!c){ clearInterval(CXS.timer); return; } c.textContent=Math.max(0,left); if(left<=0){ clearInterval(CXS.timer); cxDraw(el,'res'); } },200); }
    else if(a==='done') cxDraw(el,'res'); }); }
/* ---------- 22 what to learn next, 17 my algs, 18 printable sheets ---------- */
function myAvg(){ try{ var d=JSON.parse(localStorage.getItem('cw_timer')||'{}')||{}, L=((d.solves||{})['333']||[]).filter(function(x){ return x&&x.p!==2; }).slice(-12); if(L.length<5) return 0; return L.reduce(function(s,x){ return s+x.t+(x.p===1?2000:0); },0)/L.length; }catch(e){ return 0; } }
function nextHtml(){ var a=myAvg(), s=a/1000, step;
  if(!a) step=['Do 5 solves on the Timer','Then this card tells you what to learn next, based on your average.','#timer','Open the Timer'];
  else if(s>60) step=['The Beginner course','Learn the 7 steps until you can solve the cube every time.','#learn/beg','Start the course'];
  else if(s>40) step=['2-look OLL and PLL','About 16 short algorithms that make the last layer much faster.','#learn/guide','Open the Guide'];
  else if(s>30) step=['Full PLL (21 cases)','Solve the last layer in one look at the end. Most cubers learn this first.','#learn/pll','Learn PLL'];
  else if(s>22) step=['F2L cases and full OLL','Better F2L saves the most time now. Then learn the other OLLs.','#learn/f2l','Learn F2L'];
  else if(s>15) step=['COLL and OLLCP','Extra algorithm sets that skip steps on easy last layers.','#learn/packs','See the packs'];
  else step=['ZBLL','The big one: solve the whole last layer when the edges are already oriented.','#learn/zbll','Open ZBLL'];
  return '<div class="pnl l8-next"><small class="muted">'+(a?'Your 3×3 average: '+(s<60?s.toFixed(2):Math.floor(s/60)+':'+(s%60).toFixed(2).padStart(5,'0'))+' s':'What to learn next')+'</small><h3>Learn next: '+esc(step[0])+'</h3><p>'+esc(step[1])+'</p><a class="btn pri" href="'+step[2]+'">'+esc(step[3])+' →</a></div>'; }
function pathHtml(){ var M=myAlgs(), ks=Object.keys(M);
  return nextHtml()
   +'<div class="pnl"><h3 style="margin-top:0">🖨 Printable algorithm sheet</h3><p class="muted">A clean page with a picture and algorithm for every case. Print it, or choose Save as PDF.</p><div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn" type="button" data-pr="oll">OLL (57)</button><button class="btn" type="button" data-pr="pll">PLL (21)</button><button class="btn" type="button" data-pr="f2l">F2L (41)</button><button class="btn" type="button" data-pr="two">2-look (OLL 20–27, 33, 45, 1 + PLL)</button></div></div>'
   +'<div class="pnl"><h3 style="margin-top:0">✏️ My algorithms</h3><p class="muted">Open any OLL, PLL or F2L case and tap “Use my own alg”. Your algs are checked on a virtual cube, then used in the Room, the Drill, the sheets and /alg in chat.</p>'+(ks.length?'<div class="list">'+ks.map(function(k){ var p=k.split(':'); return '<div><span><b>'+p[0].toUpperCase()+' '+esc(p[1])+'</b><br><span class="mono" style="font-size:13px">'+esc(M[k])+'</span></span><span class="sp"></span><a class="btn sm" href="#learn/'+p[0]+'/'+encodeURIComponent(p[1])+'">Open</a></div>'; }).join('')+'</div>':'<p class="muted" style="margin:0">None yet.</p>')+'</div>'; }
function printSheet(k){ var D=window.LEARN_DATA, L=PL.lk; if(!D||!L) return; var list, title;
  if(k==='two'){ var oi=[20,21,22,23,24,25,26,27,33,45,1,2,3,4]; list=[['oll',(D.oll||[]).filter(function(c){ return [20,21,22,23,24,25,26,27,33,45].indexOf(+c.id)>=0; })],['pll',(D.pll||[]).filter(function(c){ return ['Aa','Ab','Ua','Ub','H','Z','T','Y'].indexOf(String(c.id))>=0; })]]; title='2-look OLL and PLL'; }
  else { list=[[k,D[k]||[]]]; title=k.toUpperCase(); }
  var cards=list.map(function(g){ return g[1].map(function(c){ var svg=''; try{ svg=L.diag(g[0],c,110); }catch(e){} return '<div class="c"><div class="d">'+svg+'</div><b>'+g[0].toUpperCase()+' '+esc(c.id)+(c.g?' · '+esc(c.g):'')+'</b><code>'+esc(c.alg)+'</code></div>'; }).join(''); }).join('');
  var w=window.open('','_blank'); if(!w){ CW.toast('Allow pop-ups to print the sheet.'); return; }
  w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>'+esc(title)+' algorithms · Cuber Tools</title><style>body{font:14px -apple-system,system-ui,sans-serif;margin:24px;color:#111}h1{font-size:22px;margin:0 0 4px}p{margin:0 0 16px;color:#555}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}.c{border:1px solid #ddd;border-radius:10px;padding:10px;break-inside:avoid;text-align:center}.d svg{width:96px;height:96px}b{display:block;font-size:12px;margin:4px 0}code{font:600 13px ui-monospace,Menlo,monospace}@media print{button{display:none}}</style></head><body><button onclick="print()" style="float:right;padding:8px 14px">Print / Save PDF</button><h1>'+esc(title)+' algorithms</h1><p>Made with Cuber Tools · cubeworkstudio.com</p><div class="g">'+cards+'</div></body></html>'); w.document.close(); }
function pathMount(el){ el.addEventListener('click',function(e){ var b=e.target.closest('[data-pr]'); if(b) printSheet(b.getAttribute('data-pr')); }); }
window.CWLearnX=(window.CWLearnX||[]).concat([
 {id:'path',n:'My path',ic:'guide',at:1,html:pathHtml,mount:pathMount},
 {id:'beg',n:'Beginner',ic:'cross',at:2,html:begHtml,mount:begMount},
 {id:'note',n:'Notation',ic:'quiz',html:nqHtml,mount:nqMount},
 {id:'xplan',n:'Cross plan',ic:'cross',html:cxHtml,mount:cxMount}]);
window.CWLearn8={_t:function(){ return {MT:MT,SOLV:SOLV,FACES:FACES,EST:EST}; },sameJob:sameJob,cxSolve:function(s,cb){ cxBuild(function(){ cb(cxSolve(s)); }); }};
})();
