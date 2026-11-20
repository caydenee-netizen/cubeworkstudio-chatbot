/* Learn tabs: 👀 Lookahead trainer (track a pair while another one is solved, with the stickers hidden)
   and 🧭 Method Lab (Roux, ZZ and Petrus, step by step on a 3D cube, next to CFOP).
   Must load before play-learn.js, which reads window.CWLearnX. */
(function(){
'use strict';
var esc=function(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
function L(){ return window.PL&&PL.lk; }
function lsJ(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)||'null'); return v==null?d:v; }catch(e){ return d; } }
function lsS(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
function clone(S){ return S.map(function(s){ return {p:s.p.slice(),n:s.n.slice(),c:s.c}; }); }
function ps(p){ return Math.abs(p[0])+Math.abs(p[1])+Math.abs(p[2]); }
function drag(cv,cu){ var d=null; cv.style.touchAction='none'; cv.onpointerdown=function(e){ d=[e.clientX,e.clientY]; try{ cv.setPointerCapture(e.pointerId); }catch(x){} }; cv.onpointermove=function(e){ if(!d) return; cu.yaw+=(e.clientX-d[0])*.008; cu.pitch=Math.max(-1.2,Math.min(1.2,cu.pitch+(e.clientY-d[1])*.008)); d=[e.clientX,e.clientY]; cu.draw(); }; cv.onpointerup=cv.onpointercancel=function(){ d=null; }; }

/* ======================= 👀 LOOKAHEAD TRAINER ======================= */
/* The Learn cube has yellow on top and green in front, so the cross is white on the bottom.
   Every "trigger" below keeps the white cross solved and only mixes the F2L slots and the top. */
var TRIG=["R U R'","R U' R'","R U2 R'","R' U' R","L' U L","L' U' L","L' U2 L","L U L'","F' U F","F U F'","B U B'","B' U' B"], UTURN=['U',"U'",'U2'];
var POS={E:{'0,1,1':'UF','1,1,0':'UR','0,1,-1':'UB','-1,1,0':'UL','1,0,1':'FR','-1,0,1':'FL','1,0,-1':'BR','-1,0,-1':'BL'},C:{'1,1,1':'UFR','-1,1,1':'UFL','1,1,-1':'UBR','-1,1,-1':'UBL','1,-1,1':'FR','-1,-1,1':'FL','1,-1,-1':'BR','-1,-1,-1':'BL'}};
var SLOTS=[{n:'green-orange',c:['G','O'],pos:'FR'},{n:'green-red',c:['G','R'],pos:'FL'},{n:'blue-orange',c:['B','O'],pos:'BR'},{n:'blue-red',c:['B','R'],pos:'BL'}];
var CN={G:'green',O:'orange',B:'blue',R:'red',W:'white',Y:'yellow'};
var LK={lv:1,score:0,streak:0,best:lsJ('cw_look',{lv:1,score:0}),ph:'intro',cu:null,raf:0,st:null,tg:null,seq:[],q:null,ans:{},el:null};
function rnd(a){ return a[Math.floor(Math.random()*a.length)]; }
function trigSeq(n){ var o=[]; for(var i=0;i<n;i++){ if(Math.random()<.7) o.push(rnd(UTURN)); o.push(rnd(TRIG)); } return o.join(' '); }
function where(S,cols){ var by={}; S.forEach(function(s){ var k=s.p.join(); (by[k]||(by[k]=[])).push(s.c); }); for(var k in by){ var c=by[k]; if(c.length===cols.length&&cols.every(function(x){ return c.indexOf(x)>=0; })) return k; } return null; }
function lkHtml(){ var b=LK.best; return '<div class="pnl lk9"><h3 style="margin-top:0">👀 Lookahead trainer</h3><p class="muted">Fast cubers don’t stop between F2L pairs: while they solve one pair, their eyes are already tracking the next one. This trains exactly that.</p>'
  +'<ol class="lk9-how"><li>Find the pair you are told to track.</li><li>The stickers go grey and some moves are done.</li><li>Tap where the edge and the corner ended up.</li></ol>'
  +'<div class="lk9-game" id="lk9G"></div><p class="muted" style="font-size:12.5px;margin:10px 0 0">Your best: level '+b.lv+' · '+b.score+' points</p></div>'; }
function lkMount(el){ LK.el=el.querySelector('#lk9G'); LK.ph='intro'; draw9(); }
function stopLK(){ cancelAnimationFrame(LK.raf); LK.raf=0; if(LK.cu&&LK.cu.dispose) try{ LK.cu.dispose(); }catch(e){} LK.cu=null; }
function draw9(){ var g=LK.el; if(!g||!document.body.contains(g)){ stopLK(); return; }
  if(LK.ph==='intro'){ stopLK(); g.innerHTML='<div class="lk9-intro"><button class="btn pri" type="button" data-lk="go">▶ Start at level 1</button>'+(LK.best.lv>1?'<button class="btn" type="button" data-lk="cont">Continue at level '+LK.best.lv+'</button>':'')+'</div>'; return; }
  var t=LK.tg, pick=LK.ph==='ask';
  g.innerHTML='<div class="lk9-bar"><span>Level <b>'+LK.lv+'</b></span><span>Score <b>'+LK.score+'</b></span><span>Streak <b>'+LK.streak+'</b></span></div>'
   +'<div class="lk9-wrap"><div class="lk9-cv"><canvas id="lk9C" width="520" height="520"></canvas><div class="lk9-msg" id="lk9M"></div></div>'
   +'<div class="lk9-side"><div class="lk9-tg"><span class="sw" style="background:'+L().CLR[t.c[0]]+'"></span><span class="sw" style="background:'+L().CLR[t.c[1]]+'"></span><b>Track the '+esc(t.n)+' pair</b><small>The corner is white, '+CN[t.c[0]]+' and '+CN[t.c[1]]+'. The edge is '+CN[t.c[0]]+' and '+CN[t.c[1]]+'.</small></div>'
   +'<div id="lk9P"></div></div></div>';
  var cv=g.querySelector('#lk9C'); stopLK(); LK.cu=L().mkCube(cv); LK.cu.yaw=-.62; LK.cu.pitch=.5; LK.cu.st=clone(LK.st); LK.cu.draw(); drag(cv,LK.cu); }
function msg(t){ var m=document.getElementById('lk9M'); if(m) m.textContent=t||''; }
function newRound(){ var lk=L(); if(!lk){ return; } var S=lk.solvedCube(); lk.parseAlg(trigSeq(10)).forEach(function(m){ lk.applyMove(S,m); });
  LK.tg=rnd(SLOTS); LK.st=S; var n=Math.min(6,1+Math.floor((LK.lv+1)/2)); LK.seq=lk.parseAlg(trigSeq(n)); LK.ans={}; LK.ph='look'; draw9();
  var look=Math.max(2500,5200-LK.lv*250), t0=performance.now(); msg('Find it… '+Math.ceil(look/1000));
  (function cd(){ if(LK.ph!=='look') return; var left=look-(performance.now()-t0); if(left<=0){ hidePlay(); return; } msg('Find it… '+Math.ceil(left/1000)); LK.raf=requestAnimationFrame(cd); })(); }
function hidePlay(){ var lk=L(), cu=LK.cu; if(!cu) return; LK.ph='hide'; cu.yaw=-.62; cu.pitch=.5;
  cu.st.forEach(function(s){ s.c0=s.c; if(ps(s.p)!==1) s.c='X'; }); msg('Watch the moves…');
  var i=0, wait=500, last=0, spd=1+LK.lv*.13;
  (function tick(ts){ if(LK.ph!=='hide') return; var dt=Math.min(50,ts-(last||ts)); last=ts;
    if(cu.anim){ cu.anim.t+=dt/(cu.anim.mv[1]===2?620:460)*spd; var u=Math.min(1,cu.anim.t); cu.anim.a=lk.MV[cu.anim.mv[0]][2]*cu.anim.mv[1]*Math.PI/2*lk.ease(u); if(u>=1){ lk.applyMove(cu.st,cu.anim.mv); cu.anim=null; i++; wait=140/spd; } }
    else if(i<LK.seq.length){ wait-=dt; if(wait<=0) cu.anim={mv:LK.seq[i],t:0,a:0}; } else { ask(); return; }
    cu.draw(); LK.raf=requestAnimationFrame(tick); })(performance.now()); }
function picker(kind){ var P=POS[kind], cells=kind==='E'?[['','UB',''],['UL','·','UR'],['','UF','']]:[['UBL','','UBR'],['','·',''],['UFL','','UFR']], sl=kind==='E'?[['BL','BR'],['FL','FR']]:[['BL','BR'],['FL','FR']];
  return '<div class="lk9-q"><b>'+(kind==='E'?'Where is the edge?':'Where is the corner?')+'</b><div class="lk9-pk"><div><small>Top layer</small><div class="lk9-grid">'+cells.map(function(r){ return r.map(function(c){ return c&&c!=='·'?'<button type="button" data-lkp="'+c+'">'+c+'</button>':'<span class="'+(c==='·'?'mid':'')+'"></span>'; }).join(''); }).join('')+'</div><small class="fr">Front ↓</small></div>'
   +'<div><small>'+(kind==='E'?'Middle layer slots':'Bottom slots')+'</small><div class="lk9-grid two">'+sl.map(function(r){ return r.map(function(c){ return '<button type="button" data-lkp="'+c+'">'+c+'</button>'; }).join(''); }).join('')+'</div><small class="fr">Front ↓</small></div></div></div>'; }
function ask(){ LK.ph='ask'; LK.q='E'; msg('Where did the pieces go?'); var p=document.getElementById('lk9P'); if(p) p.innerHTML=picker('E'); }
function answer(v){ var cu=LK.cu; if(!cu||LK.ph!=='ask') return; var cols=LK.q==='E'?LK.tg.c:['W'].concat(LK.tg.c), real=cu.st.map(function(s){ return {p:s.p,c:s.c0||s.c}; }), k=where(real,cols), right=POS[LK.q][k];
  LK.ans[LK.q]={pick:v,right:right};
  if(LK.q==='E'){ LK.q='C'; var p=document.getElementById('lk9P'); p.innerHTML='<p class="lk9-r '+(v===right?'ok':'no')+'">'+(v===right?'✅ Edge: '+right:'❌ The edge was in '+right)+'</p>'+picker('C'); return; }
  reveal(); }
function reveal(){ var cu=LK.cu, a=LK.ans, e=a.E.pick===a.E.right, c=a.C.pick===a.C.right, edgeK=null, corK=null;
  cu.st.forEach(function(s){ s.c=s.c0||s.c; }); var ek=where(cu.st,LK.tg.c), ck=where(cu.st,['W'].concat(LK.tg.c)); cu.st.forEach(function(s){ var k=s.p.join(); if(ps(s.p)!==1&&k!==ek&&k!==ck) s.c='N'; }); cu.draw();
  var pts=(e?10:0)*LK.lv+(c?10:0)*LK.lv, both=e&&c; LK.score+=pts; LK.streak=both?LK.streak+1:0; var up=both&&LK.streak>=2&&LK.lv<12; if(up){ LK.lv++; LK.streak=0; }
  if(LK.lv>LK.best.lv||LK.score>LK.best.score){ LK.best={lv:Math.max(LK.lv,LK.best.lv),score:Math.max(LK.score,LK.best.score)}; lsS('cw_look',LK.best); }
  LK.ph='reveal'; msg(both?'Perfect!':'Here they are.');
  var p=document.getElementById('lk9P'); p.innerHTML='<p class="lk9-r '+(e?'ok':'no')+'">'+(e?'✅':'❌')+' Edge: '+a.E.right+(e?'':' (you said '+a.E.pick+')')+'</p><p class="lk9-r '+(c?'ok':'no')+'">'+(c?'✅':'❌')+' Corner: '+a.C.right+(c?'':' (you said '+a.C.pick+')')+'</p>'
    +'<p style="margin:8px 0">+'+pts+' points'+(up?' · <b>Level up! → '+LK.lv+'</b>':both?' · one more perfect round to level up':'')+'</p><div class="row" style="gap:8px"><button class="btn pri" type="button" data-lk="next">Next round</button><button class="btn" type="button" data-lk="stop">Stop</button></div>'; }
document.addEventListener('click',function(e){ var t=e.target.closest&&e.target.closest('[data-lk],[data-lkp]'); if(!t||!t.closest('.lk9')) return; var a=t.getAttribute('data-lk');
  if(t.hasAttribute('data-lkp')) return answer(t.getAttribute('data-lkp'));
  if(a==='go'){ LK.lv=1; LK.score=0; LK.streak=0; newRound(); } else if(a==='cont'){ LK.lv=LK.best.lv; LK.score=0; LK.streak=0; newRound(); } else if(a==='next') newRound(); else if(a==='stop'){ LK.ph='intro'; draw9(); } });

/* ======================= 🧭 METHOD LAB ======================= */
/* Each step is shown as the cube after that step: finished pieces in colour, the rest grey. */
function pieceIn(p,rule){ return rule(p[0],p[1],p[2]); }
var M={
 cfop:{n:'CFOP',by:'The method most speedcubers use, and the one taught in Learn CFOP.',steps:[
   ['Cross','Four bottom edges around the white centre.',function(x,y,z){ return y===-1&&ps([x,y,z])<=2; }],
   ['F2L','The first two layers, one corner-and-edge pair at a time.',function(x,y,z){ return y<=0; }],
   ['OLL','Make the top yellow (57 algorithms for full OLL).',function(x,y,z){ return true; },'oll'],
   ['PLL','Move the top pieces to the right places (21 algorithms).',function(){ return true; }]],algs:'57 OLL + 21 PLL = 78',feel:'Lots of algorithms, very finger-trick friendly.'},
 roux:{n:'Roux',by:'Invented by Gilles Roux. Built on blocks and lots of middle-slice (M) moves, with few rotations.',steps:[
   ['First block','A 1×2×3 block on the left: bottom-left edge, the two left middle edges and two corners.',function(x,y,z){ return x===-1&&y<=0; }],
   ['Second block','The same 1×2×3 block on the right.',function(x,y,z){ return x!==0&&y<=0; }],
   ['CMLL','The four top corners, solved with one algorithm (42 CMLL algorithms).',function(x,y,z){ return (x!==0&&y<=0)||(y===1&&ps([x,y,z])===3)||ps([x,y,z])===1; }],
   ['LSE','The last six edges, using only M and U moves.',function(){ return true; }]],algs:'42 CMLL (plus a few for LSE)',feel:'Fewer moves and almost no rotations. Block building is all intuition.'},
 zz:{n:'ZZ',by:'Invented by Zbigniew Zborowski. Orient every edge first, then the rest only needs R, L and U moves.',steps:[
   ['EOLine','Orient all 12 edges and place the front and back bottom edges in a line.',function(x,y,z){ return y===-1&&x===0; },'eo'],
   ['F2L blocks','Build the left and right 1×2×3 blocks with only R, L and U turns.',function(x,y,z){ return y<=0; }],
   ['Last layer','Edges are already oriented, so OCLL then PLL (7 + 21 algorithms), or ZBLL to do it in one.',function(){ return true; }]],algs:'7 OCLL + 21 PLL = 28 (ZBLL for experts)',feel:'Very ergonomic: no F or B turns after the first step.'},
 pet:{n:'Petrus',by:'Invented by Lars Petrus. Grows one block step by step, which keeps the move count low.',steps:[
   ['2×2×2 block','A small 2×2×2 block in the back left.',function(x,y,z){ return x<=0&&y<=0&&z<=0; }],
   ['2×2×3 block','Grow it into a 2×2×3 block along the left.',function(x,y,z){ return x<=0&&y<=0; }],
   ['Fix edges','Orient the remaining edges so the rest is R and U only.',function(x,y,z){ return x<=0&&y<=0; },'eo'],
   ['Finish F2L','Complete the first two layers using R and U.',function(x,y,z){ return y<=0; }],
   ['Last layer','Solve the top layer (for example COLL then EPLL).',function(){ return true; }]],algs:'COLL 42 + EPLL 4',feel:'Low move count, great for fewest-moves practice.'}
};
var ML={m:'roux',s:0,cu:null,cv:null,cfop:null};
function mlHtml(){ return '<div class="pnl ml9"><h3 style="margin-top:0">🧭 Method Lab</h3><p class="muted">CFOP isn’t the only way to solve a cube. See how other methods build the cube, step by step, next to CFOP. Drag the cubes to turn them.</p>'
  +'<div class="seg ml9-m">'+['roux','zz','pet'].map(function(k){ return '<button type="button" data-mlm="'+k+'">'+M[k].n+'</button>'; }).join('')+'</div><div id="ml9B"></div></div>'
  +'<div class="pnl"><h3 style="margin-top:0">At a glance</h3><div class="ml9-t"><div class="h"><span></span><span>CFOP</span><span>Roux</span><span>ZZ</span><span>Petrus</span></div>'
  +'<div><span>Steps</span><span>4</span><span>4</span><span>3</span><span>5</span></div><div><span>Main algorithms</span><span>78</span><span>42</span><span>28</span><span>46</span></div><div><span>Rotations</span><span>Some</span><span>Almost none</span><span>Almost none</span><span>Few</span></div><div><span>Main moves</span><span>R U L F</span><span>R U M r</span><span>R L U</span><span>R U</span></div></div><p class="muted" style="font-size:12.5px;margin:8px 0 0">Algorithm counts are for the usual beginner-to-intermediate set of each method.</p></div>'; }
function stepState(rule,flag){ var S=L().solvedCube(); S.forEach(function(s){ if(ps(s.p)===1) return; if(!rule(s.p[0],s.p[1],s.p[2])) s.c='X'; });
  if(flag==='eo') S.forEach(function(s){ if(ps(s.p)===2&&s.c==='X'&&(s.n[1]!==0||(s.p[1]===0&&s.n[2]!==0))) s.c='N'; });
  if(flag==='oll') S.forEach(function(s){ if(s.p[1]===1&&s.n[1]!==1&&ps(s.p)>1) s.c='X'; });
  return S; }
function mlDraw(){ var B=document.getElementById('ml9B'); if(!B) return; var m=M[ML.m], st=m.steps[ML.s], cf=M.cfop.steps[Math.min(ML.s,M.cfop.steps.length-1)];
  [].forEach.call(document.querySelectorAll('[data-mlm]'),function(b){ b.setAttribute('aria-pressed',b.getAttribute('data-mlm')===ML.m); });
  B.innerHTML='<p style="margin:10px 0">'+esc(m.by)+'</p><div class="ml9-steps">'+m.steps.map(function(s,i){ return '<button type="button" data-mls="'+i+'" class="'+(i===ML.s?'on':'')+(i<ML.s?' dn':'')+'"><i>'+(i+1)+'</i>'+esc(s[0])+'</button>'; }).join('')+'</div>'
   +'<div class="ml9-cubes"><div><small>'+esc(m.n)+' · after step '+(ML.s+1)+'</small><canvas id="ml9A" width="440" height="440"></canvas><b>'+esc(st[0])+'</b><p>'+esc(st[1])+'</p></div>'
   +'<div><small>CFOP · after step '+(Math.min(ML.s,3)+1)+'</small><canvas id="ml9C" width="440" height="440"></canvas><b>'+esc(cf[0])+'</b><p>'+esc(cf[1])+'</p></div></div>'
   +(st[3]==='eo'?'<p class="muted" style="font-size:13px">Light grey edges are oriented, ready for the next step.</p>':'')
   +'<div class="row" style="gap:8px;margin-top:10px"><button class="btn" type="button" data-mlnav="-1"'+(ML.s?'':' disabled')+'>← Back</button><span class="sp"></span><button class="btn pri" type="button" data-mlnav="1"'+(ML.s<m.steps.length-1?'':' disabled')+'>Next step →</button></div>'
   +'<div class="ml9-sum"><span><b>Algorithms:</b> '+esc(m.algs)+'</span><span><b>Feels like:</b> '+esc(m.feel)+'</span></div>';
  [['#ml9A',stepState(st[2],st[3])],['#ml9C',stepState(cf[2],cf[3])]].forEach(function(x){ var cv=B.querySelector(x[0]), cu=L().mkCube(cv); if(!cu) return; cu.yaw=-.62; cu.pitch=.5; cu.st=x[1]; cu.draw(); drag(cv,cu); }); }
function mlMount(){ ML.s=0; mlDraw(); }
document.addEventListener('click',function(e){ var t=e.target.closest&&e.target.closest('[data-mlm],[data-mls],[data-mlnav]'); if(!t||!t.closest('.ml9')) return;
  if(t.hasAttribute('data-mlm')){ ML.m=t.getAttribute('data-mlm'); ML.s=0; }
  else if(t.hasAttribute('data-mls')) ML.s=+t.getAttribute('data-mls');
  else { var n=M[ML.m].steps.length; ML.s=Math.max(0,Math.min(n-1,ML.s+(+t.getAttribute('data-mlnav')))); }
  mlDraw(); });

window.CWLearnX=(window.CWLearnX||[]).concat([{id:'look',n:'Lookahead',ic:'quiz',html:lkHtml,mount:lkMount},{id:'methods',n:'Method Lab',ic:'guide',html:mlHtml,mount:mlMount}]);
window.CWLook=LK; window.CWMethods=ML;
})();
