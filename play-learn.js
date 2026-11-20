/* /play Learn: full CFOP algorithm library (F2L 41, OLL 57, PLL 21) with diagrams, filters and a spaced drill. Data: learn-data.js */
(function(){
'use strict';
var $=CW.$, esc=CW.esc, PL=window.PL, D=window.LEARN_DATA;
if(!PL||!D) return;
var ICO={guide:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4.5h10a3 3 0 013 3V20H8a3 3 0 01-3-3V4.5z"/><path d="M5 17a3 3 0 013-3h10"/></svg>',cross:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 4v16M4 12h16"/></svg>',f2l:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 12h16"/><path d="M4 16h16" opacity=".45"/></svg>',oll:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6" fill="currentColor" stroke="none"/></svg>',pll:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h12l-3-3M19 16H7l3 3"/></svg>',drill:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/></svg>',quiz:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="7.5"/><path d="M12 13V9M9.5 3.5h5"/></svg>',blind:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><path d="M4 4l16 16"/></svg>',coach:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V5M4 19h16"/><path d="M8 15l3.5-4 3 2.5L19 7"/></svg>'};
var SECS=[{id:'guide',n:'Guide',i:ICO.guide},{id:'cross',n:'Cross',i:ICO.cross},{id:'f2l',n:'F2L',i:ICO.f2l},{id:'oll',n:'OLL',i:ICO.oll},{id:'pll',n:'PLL',i:ICO.pll},{id:'zbll',n:'ZBLL',i:ICO.pll},{id:'drill',n:'Drill',i:ICO.drill},{id:'quiz',n:'Quiz',i:ICO.quiz},{id:'blind',n:'Blind',i:ICO.blind},{id:'coach',n:'Coach',i:ICO.coach},{id:'two2',n:'2×2',i:ICO.cross},{id:'scan',n:'Scan',i:ICO.guide},{id:'packs',n:'Packs',i:ICO.pll},{id:'coll',n:'COLL',i:ICO.pll,hide:1},{id:'ollcp',n:'OLLCP',i:ICO.pll,hide:1},{id:'cll',n:'2×2 CLL',i:ICO.pll,hide:1}];
(window.CWLearnX||[]).forEach(function(x){ SECS.splice(x.at==null?SECS.length:x.at,0,{id:x.id,n:x.n,i:ICO[x.ic]||ICO.guide}); });
function LX(id){ return (window.CWLearnX||[]).filter(function(x){ return x.id===id; })[0]||null; }
function u7(){ return !!(PL.updOn7&&PL.updOn7()); }
function secOn(s){ return (s.id!=='scan'&&s.id!=='packs'&&!PKX[s.id])||u7(); }
var PKX={coll:1,ollcp:1,cll:1};
function isPk(k){ return k==='zbll'||!!PKX[k]; }
function pkOwn(k){ return k==='zbll'?zbOwn():!!(window.CWPacks&&CWPacks.owned(k)); }
var CLR={Y:'#f2c200',W:'#f4f4f2',G:'#1f9a52',B:'#2650f5',O:'#ff7a1a',R:'#e1352b',X:'#7b808a',N:'#d9d9d4'}; try{ if(localStorage.getItem('cw_cb')==='1') Object.assign(CLR,{Y:'#f0e442',G:'#009e73',B:'#0072b2',O:'#e69f00',R:'#d55e00'}); }catch(e){} 
var P={f2l:'f2l-',oll:'oll-',pll:'pll-',zbll:'zbll-',coll:'coll-',ollcp:'ollcp-',cll:'cll-'};
function zbSync(){ D.zbll=window.CWZBLL?CWZBLL.cases():(D.zbll||[]); for(var q in PKX) D[q]=window.CWPacks?CWPacks.cases(q):(D[q]||[]); }
function zbOwn(){ return !!(window.CWZBLL&&CWZBLL.owned()); }
zbSync();
var UI={q:'',g:'',two:false,un:false,v3:(function(){ try{ return localStorage.getItem('cw_learn_v')!=='flat'; }catch(e){ return true; } })()};
function key(k,c){ return P[k]+c.id; }
function title(k,c){ return isPk(k)?c.g+' '+(c.n==='sample'?'(free case)':c.n):k==='oll'?'OLL '+c.id:k==='pll'?c.id+' perm':'F2L '+c.id; }
function groupOf(k,c){ return c.g; }
function setIf(a,b){ return a?b:''; }

/* ---------- diagrams ---------- */
function ollSvg(p,sz){ var s=22,o=19,t=7,g=2,h=[]; function r(x,y,w,hh,v){ h.push('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+hh+'" rx="2.5" fill="'+(v==='1'?CLR.Y:CLR.X)+'" stroke="#0003" stroke-width=".6"/>'); }
  for(var i=0;i<9;i++) r(o+(i%3)*(s+g),o+Math.floor(i/3)*(s+g),s,s,p[i]);
  for(i=0;i<3;i++){ r(o+i*(s+g),o-t-3,s,t,p[9+i]); r(o+3*(s+g)+1,o+i*(s+g),t,s,p[12+i]); r(o+i*(s+g),o+3*(s+g)+1,s,t,p[15+i]); r(o-t-3,o+i*(s+g),t,s,p[18+i]); }
  return '<svg class="lcd" viewBox="0 0 100 100" width="'+sz+'" height="'+sz+'" role="img" aria-label="OLL case">'+h.join('')+'</svg>'; }
function pllSvg(c,sz){ var s=22,o=19,t=7,g=2,h=[]; function r(x,y,w,hh,v){ h.push('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+hh+'" rx="2.5" fill="'+CLR[v]+'" stroke="#0003" stroke-width=".6"/>'); }
  for(var i=0;i<9;i++) r(o+(i%3)*(s+g),o+Math.floor(i/3)*(s+g),s,s,'Y');
  for(i=0;i<3;i++){ r(o+i*(s+g),o-t-3,s,t,c[i]); r(o+3*(s+g)+1,o+i*(s+g),t,s,c[3+i]); r(o+i*(s+g),o+3*(s+g)+1,s,t,c[6+i]); r(o-t-3,o+i*(s+g),t,s,c[9+i]); }
  return '<svg class="lcd" viewBox="0 0 100 100" width="'+sz+'" height="'+sz+'" role="img" aria-label="PLL case">'+h.join('')+'</svg>'; }
function f2lSvg(fc,sz){ var K=24,cx=80,cy=82,h=[];
  function pj(x,y,z){ return [cx+(x-z)*.866*K, cy+(-y+(x+z)*.5)*K]; }
  function poly(pts,v){ h.push('<polygon points="'+pts.map(function(q){ return q[0].toFixed(1)+','+q[1].toFixed(1); }).join(' ')+'" fill="'+CLR[v]+'" stroke="#0005" stroke-width="1" stroke-linejoin="round"/>'); }
  var i,a,b,x,y,z,v;
  for(i=0;i<9;i++){ x=i%3-1; z=Math.floor(i/3)-1; v=fc[i]; poly([pj(x-.5,1.5,z-.5),pj(x+.5,1.5,z-.5),pj(x+.5,1.5,z+.5),pj(x-.5,1.5,z+.5)],v); }
  for(i=0;i<9;i++){ x=i%3-1; y=1-Math.floor(i/3); v=fc[9+i]; poly([pj(x-.5,y+.5,1.5),pj(x+.5,y+.5,1.5),pj(x+.5,y-.5,1.5),pj(x-.5,y-.5,1.5)],v); }
  for(i=0;i<9;i++){ z=1-i%3; y=1-Math.floor(i/3); v=fc[18+i]; poly([pj(1.5,y+.5,z+.5),pj(1.5,y+.5,z-.5),pj(1.5,y-.5,z-.5),pj(1.5,y-.5,z+.5)],v); }
  return '<svg class="lcd" viewBox="0 0 160 160" width="'+sz+'" height="'+sz+'" role="img" aria-label="F2L case">'+h.join('')+'</svg>'; }
function diag(k,c,sz){ return PKX[k]?(window.CWPacks?CWPacks.svg(k,c.v,sz):''):k==='zbll'?(window.CWZBLL?CWZBLL.svg(c.v,sz):''):k==='oll'?ollSvg(c.pat,sz):k==='pll'?pllSvg(c.col,sz):f2lSvg(c.fc,sz); }

/* ---------- learned / xp ---------- */
function mark(id,on){ var o=PL.learned(), was=!!o[id]; if(on) o[id]=1; else delete o[id]; CW.setJ('cw_learn',o); if(on&&!was&&PL.tick) PL.tick('learn');
  if(on&&!was&&!/^(zbll|coll|ollcp|cll)-/.test(id)){ var got=CW.lsJ('cw2_learnxp',{}); if(!got[id]){ got[id]=1; CW.setJ('cw2_learnxp',got); CW.toast('+'+PL.addXP(20)+' XP for learning it'); } } }
function count(k){ var o=PL.learned(); return D[k].filter(function(c){ return o[key(k,c)]; }).length; }

/* ---------- guide / cross ---------- */
var NOTE=[['R','Turn the right face clockwise (as you look at it)'],["R'",'Anticlockwise (the apostrophe is "prime")'],['R2','Half turn'],['U D F B L','Same idea for top, bottom, front, back, left'],['r  f  u','Lowercase: turn the face and the layer behind it'],['M','The middle slice, turned in the direction of L'],['x  y  z','Rotate the whole cube like R, U, F']];
function nextCase(){ var o=PL.learned(); for(var q=0;q<3;q++){ var k=['f2l','oll','pll'][q], c=D[k].filter(function(x){ return !o[key(k,x)]; })[0]; if(c) return {k:k,c:c}; } return null; }
var STAGES=[['cross','1','Cross','Four white edges on the bottom. Plan it all in inspection.'],['f2l','2','F2L','Pair each white corner with its edge, then insert it. Four pairs.'],['oll','3','OLL','Make the whole top face yellow.'],['pll','4','PLL','Move the top pieces into their places.']];
function lhero(){ var nx=nextCase(), pct=PL.learnPct(), bar=function(k,n){ var t=D[k].length,v=count(k); return '<div class="lhb"><span>'+n+'</span><i><b style="width:'+Math.round(v/t*100)+'%"></b></i><em>'+v+'/'+t+'</em></div>'; };
  return '<div class="lhero"><div class="lhs"><canvas id="lhCv" width="560" height="440" aria-label="A 3D cube turning"></canvas></div><div class="lht"><div class="eyebrow" style="color:#7fe3d1">Free CFOP library</div><h2>Learn every case.<br>Watch it turn.</h2>'
   +'<p>41 F2L, 57 OLL and 21 PLL cases. Tap one to watch the cube do it in 3D, then practise it on a timer.</p><div class="lhbars">'+bar('f2l','F2L')+bar('oll','OLL')+bar('pll','PLL')+'</div>'
   +'<div class="row" style="gap:10px;margin-top:14px;flex-wrap:wrap">'+(nx?'<a class="btn pri" href="#learn/'+nx.k+'/'+nx.c.id+'">Next: '+esc(title(nx.k,nx.c))+' →</a>':'<span class="mono" style="color:#7fe3d1">Whole library learned. Respect.</span>')+'</div><div class="mono lhp">'+pct+'% learned</div></div></div>'; }
function guide(){ return lhero()
  +'<h3 class="lh3">The four steps</h3><div class="stg">'+STAGES.map(function(s){ var n=P[s[0]]?count(s[0])+'/'+D[s[0]].length+' learned':'No algs needed'; return '<a class="stc" href="#learn/'+s[0]+'"><span class="stn">'+s[1]+'</span><b>'+s[2]+'</b><p>'+s[3]+'</p><em class="mono">'+n+'</em></a>'; }).join('')+'</div>'
  +'<div class="pnl" style="margin-top:14px"><h3>Start with 2-look</h3><p class="muted" style="margin:0">OLL in two steps (edges, then corners) needs 10 algs. PLL in two steps needs 6 to 7. Fill in the full sets whenever you feel ready.</p></div>'
  +'<h3 class="lh3">Move notation</h3><div class="lnote lnote3">'+NOTE.map(function(n){ return '<div><code>'+esc(n[0])+'</code><span>'+esc(n[1])+'</span></div>'; }).join('')+'</div>'
  +'<details class="pnl ldet"><summary>Reading the diagrams</summary><p class="muted"><b>OLL</b> shows the top face from above. Yellow is already oriented, grey is not. The thin strips show the yellow stickers on the sides of the top layer.</p><p class="muted"><b>PLL</b> shows the top face yellow with the real colours on the side stickers. Match what you see, then do the alg (it includes the final U turn).</p><p class="muted"><b>F2L</b> shows the front-right slot. Grey pieces are not part of the case. Hold the pair at the front right.</p></details>'
  +'<details class="pnl ldet"><summary>Practise tips</summary><ul class="lsteps"><li>Learn a few cases at a time. Tick them off, then drill.</li><li>Do each alg slowly ten times before going fast.</li><li>Look for the shape first, the alg second. Recognition is half the speed.</li><li>Use Drill to revisit cases you miss. Missed cases come back sooner.</li></ul></details>'+PL.shopCard('learn'); }
var HR={raf:0,cube:null};
function heroStop(){ cancelAnimationFrame(HR.raf); if(HR.cube&&HR.cube.dispose) HR.cube.dispose(); HR.cube=null; }
function heroMount(el){ var cv=$('#lhCv',el); if(!cv) return; var cu=mkCube(cv); HR.cube=cu; var seq=[], b=parseAlg("R U R' U'"), k; for(k=0;k<6;k++) seq=seq.concat(b); var i=0,wait=900,last=0,drag=null; cu.yaw=-.7; cu.pitch=.46; cu.dist=12.4;
  cv.style.touchAction='none'; cv.onpointerdown=function(e){ drag=[e.clientX,e.clientY]; cv.setPointerCapture(e.pointerId); }; cv.onpointermove=function(e){ if(!drag) return; cu.yaw+=(e.clientX-drag[0])*.008; cu.pitch=Math.max(-1.1,Math.min(1.3,cu.pitch+(e.clientY-drag[1])*.008)); drag=[e.clientX,e.clientY]; }; cv.onpointerup=cv.onpointercancel=function(){ drag=null; };
  var tick=function(ts){ HR.raf=requestAnimationFrame(tick); if(!document.body.contains(cv)){ cancelAnimationFrame(HR.raf); return; } var dt=Math.min(60,ts-(last||ts)); last=ts; if(!drag) cu.yaw+=dt*.00028;
    if(cu.anim){ cu.anim.t+=dt/430; var u=Math.min(1,cu.anim.t); cu.anim.a=MV[cu.anim.mv[0]][2]*cu.anim.mv[1]*Math.PI/2*ease(u); if(u>=1){ applyMove(cu.st,cu.anim.mv); cu.anim=null; i++; wait=i>=seq.length?1600:90; } }
    else { wait-=dt; if(wait<=0){ if(i>=seq.length){ i=0; cu.st=solvedCube(); wait=500; } else cu.anim={mv:seq[i],t:0,a:0}; } }
    cu.draw(); }; HR.raf=requestAnimationFrame(tick); }
function cross(){ return '<div class="grid2"><div class="pnl"><h3>Cross on the bottom</h3><p class="muted">Solve the four white edges, each matching its side centre. Hold white on the bottom from the start so you never lose sight of it.</p><ul class="lsteps"><li>Inspect for up to 15 seconds and plan the whole cross before touching the cube.</li><li>Aim for 8 moves or fewer. Build it from the easiest edges first.</li><li>Line an edge up above its own centre, then turn that face twice to drop it in.</li></ul></div>'
  +'<div class="pnl"><h3>Moving an edge into place</h3><div class="algs">'+[['White edge on top, white facing up',"F2"],['Edge in the slot, white on the right side',"R U R' ... then F2"],['Edge in the slot, white on the left side',"L' U' L ... then F2"],['Edge on the bottom, wrong place',"F2 then re-place it"]].map(function(r){ return '<div class="alg" style="grid-template-columns:1fr"><div><b>'+esc(r[0])+'</b><code>'+esc(r[1])+'</code></div></div>'; }).join('')+'</div><p class="muted" style="font-size:13px;margin-top:8px">Cross has no fixed algs. These are starting points, so look for the shortest way once you are comfortable.</p></div></div>'; }

/* ---------- card list ---------- */
var TWOL_E=[['Dot',"F R U R' U' F' f R U R' U' f'"],['L-shape',"f R U R' U' f'"],['Line',"F R U R' U' F'"]];
function twoLookBox(k){ if(k==='oll') return '<div class="pnl lnote2"><h3>2-look OLL</h3><p class="muted">Step 1, make the cross (pick by the yellow edges you can see). Step 2, finish with the seven corner cases OLL 21 to 27 (filter "2-look" below).</p><div class="algs">'+TWOL_E.map(function(r){ return '<div class="alg" style="grid-template-columns:1fr auto"><div><b>Edges: '+r[0]+'</b><code>'+esc(r[1])+'</code></div><button class="btn sm" data-copy="'+esc(r[1])+'">Copy</button></div>'; }).join('')+'</div></div>';
  if(k==='pll') return '<div class="pnl lnote2"><h3>2-look PLL</h3><p class="muted">Step 1, fix the corners with the A perms (adjacent swap) or Y (diagonal). Step 2, fix the edges with Ua, Ub, H or Z. Filter "2-look" to see just these.</p></div>'; return ''; }
function visible(k){ var o=PL.learned(), q=UI.q.trim().toLowerCase(); return D[k].filter(function(c){
  if(UI.un&&o[key(k,c)]) return false; if(UI.g&&c.g!==UI.g) return false;
  if(UI.two){ if(k==='oll'&&!(c.id>=21&&c.id<=27)) return false; if(k==='pll'&&!c.two) return false; }
  if(q){ var hay=(title(k,c)+' '+c.g+' '+c.alg+' '+c.id).toLowerCase(); return q.split(/\s+/).every(function(w){ return hay.indexOf(w)>=0; }); } return true; }); }
var TH={cv:null,cu:null,c:{},bad:false};
function thumb(k,c){ var id=key(k,c); if(TH.c[id]) return TH.c[id]; if(TH.bad) return null;
  if(!TH.cu){ TH.cv=document.createElement('canvas'); TH.cv.width=TH.cv.height=240; TH.cu=Cube3D(TH.cv); if(!TH.cu){ TH.bad=true; return null; } }
  var cu=TH.cu; cu.n2=k==='cll'; cu.setup(parseAlg(c.an)); cu.yaw=k==='f2l'?-.78:-.55; cu.pitch=k==='f2l'?.36:.62; cu.dist=cu.n2?8.2:9.6; cu.anim=null; cu.draw(); try{ TH.c[id]=TH.cv.toDataURL('image/png'); }catch(e){ TH.bad=true; return null; } return TH.c[id]; }
function thumbFill(el){ var imgs=[].slice.call(el.querySelectorAll('img[data-th]')), i=0; (function step(){ var t=Date.now(); while(i<imgs.length&&Date.now()-t<14){ var im=imgs[i++], pr=im.getAttribute('data-th').split('-'), k=pr[0], cs=D[k]&&D[k].filter(function(x){ return String(x.id)===im.getAttribute('data-th').slice(k.length+1); })[0]; if(!cs) continue; var u=thumb(k,cs); if(u){ im.src=u; im.classList.add('ok'); } else { var d=document.createElement('div'); d.innerHTML=diag(k,cs,112); im.replaceWith(d.firstChild); } }
    if(i<imgs.length&&document.body.contains(el)) setTimeout(step,0); })(); }
function cardHtml(k,c,o){ var id=key(k,c), on=!!o[id];
  return '<div class="lc'+(on?' on':'')+'" role="link" tabindex="0" data-c="'+id+'"><label class="lck" title="Mark as learned"><input type="checkbox" data-a="'+id+'"'+(on?' checked':'')+' aria-label="Learned"><i></i></label><div class="lcd0">'+(UI.v3&&!TH.bad?'<img class="lcimg" data-th="'+id+'" width="112" height="112" alt="'+esc(title(k,c))+' on a 3D cube" src="'+(TH.c[id]||'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==')+'">':diag(k,c,k==='f2l'?124:112))+'</div><div class="lct"><b>'+esc(title(k,c))+'</b>'+(isPk(k)?'':'<span class="mono muted">'+esc(c.g)+'</span>')+'</div><code>'+esc(c.alg)+'</code>'
   +(k==='f2l'&&c.alt?'<div class="muted lalt">Alt: <code>'+esc(c.alt)+'</code></div>':'')
   +'<div class="lcf"><span>Watch in 3D →</span><button type="button" class="btn sm" data-copy="'+esc(c.alg)+'">Copy</button></div></div>'; }
function groups(k){ var s={}; D[k].forEach(function(c){ s[c.g]=1; }); return Object.keys(s); }
function library(k,el){ var o=PL.learned(), list=visible(k), n=count(k), t=D[k].length, gs=groups(k);
  return '<div class="row lhd"><b>'+({f2l:'First two layers',oll:'Orient the last layer',pll:'Permute the last layer',zbll:'Whole last layer in one look',coll:'Corners of the last layer',ollcp:'OLL with the corners solved',cll:'2×2 last layer in one look'})[k]+'</b><span class="sp"></span><span class="mono muted" style="font-size:13px">'+n+'/'+t+' learned</span></div>'
   +'<div class="prog" style="margin-bottom:14px"><i style="width:'+Math.round(n/t*100)+'%"></i></div>'+(twoLookBox(k)?'<details class="ldet pnl"><summary>Beginner shortcut: '+(k==='oll'?'2-look OLL':'2-look PLL')+'</summary>'+twoLookBox(k).replace('class="pnl lnote2"','class="lnote2"')+'</details>':'')
   +'<div class="lbar"><input type="search" id="lQ" placeholder="Search name, number or moves" value="'+esc(UI.q)+'" aria-label="Search"><select id="lG" aria-label="Group"><option value="">All groups</option>'+gs.map(function(g){ return '<option'+(UI.g===g?' selected':'')+'>'+esc(g)+'</option>'; }).join('')+'</select>'
   +(k==='f2l'||isPk(k)?'':'<label class="lk row" style="gap:6px"><input type="checkbox" id="lT"'+(UI.two?' checked':'')+'> 2-look only</label>')+'<span class="seg lvw" id="lV"><button type="button" data-v="3" aria-pressed="'+(UI.v3&&!TH.bad)+'">3D</button><button type="button" data-v="0" aria-pressed="'+!(UI.v3&&!TH.bad)+'">Flat</button></span><label class="lk row" style="gap:6px"><input type="checkbox" id="lU"'+(UI.un?' checked':'')+'> Not learned</label></div>'
   +'<div class="lgrid" id="lGrid">'+(list.length?list.map(function(c){ return cardHtml(k,c,o); }).join(''):'<p class="muted">No cases match. Clear the search or filters.</p>')+'</div>'; }

/* ---------- drill (spaced) ---------- */
function sr(){ var o=CW.lsJ('cw_learn_sr',{}); return o&&typeof o==='object'&&!Array.isArray(o)?o:{}; }
var DR={k:'oll',all:false,weak:false,cur:null,shown:false,st:{ok:0,miss:0}};
function pick(){ var o=PL.learned(), S=sr(), now=Date.now(), pool=D[DR.k].filter(function(c){ return DR.all||o[key(DR.k,c)]; });
  if(DR.weak){ var wl=weakList().filter(function(w){ return w.k===DR.k; }).map(function(w){ return w.c; }); if(wl.length) pool=wl; }
  if(!pool.length) pool=D[DR.k]; var due=pool.filter(function(c){ var r=S[key(DR.k,c)]; return !r||r[1]<=now; }); var src=due.length?due:pool;
  src=src.slice().sort(function(a,b){ var ra=(S[key(DR.k,a)]||[0])[0], rb=(S[key(DR.k,b)]||[0])[0]; return ra-rb; }).slice(0,Math.max(3,Math.ceil(src.length/3)));
  var c; do{ c=src[Math.floor(Math.random()*src.length)]; }while(src.length>1&&DR.cur&&c===DR.cur); DR.cur=c; DR.shown=false; }
var GAP=[0,60e3,10*60e3,3600e3,86400e3,3*86400e3];
function missBook(){ var o=CW.lsJ('cw_learn_miss',{}); return o&&typeof o==='object'&&!Array.isArray(o)?o:{}; }
function rate(ok){ if(PL.tick) PL.tick('drill'); var S=sr(), id=key(DR.k,DR.cur), r=S[id]||[0,0], b=ok?Math.min(5,r[0]+1):0; S[id]=[b,Date.now()+GAP[b]]; CW.setJ('cw_learn_sr',S); ok?DR.st.ok++:DR.st.miss++;
  var M=missBook(), m=M[id]||[0,0]; M[id]=ok?[Math.max(0,m[0]-1),m[1]]:[m[0]+1,Date.now()]; if(!M[id][0]) delete M[id]; CW.setJ('cw_learn_miss',M); }
/* memory coach: weak cases come from the cuber's own misses; the tricks are built from the alg itself */
var TRIG=[["R U R' U'","sexy move"],["R' F R F'","sledgehammer"],["F R U R' U' F'","line OLL"],["R U R'","R U R' tuck"],["R' U' R","R' U' R tuck"],["R U2 R'","R U2 R'"],["R' U2 R","R' U2 R"],["R U' R'","R U' R'"],["R' U R","R' U R"],["U R U' R'","U R U' R'"]];
function chunkAlg(alg){ var t=String(alg).trim().split(/\s+/), out=[], i=0; while(i<t.length){ var hit=null; for(var j=0;j<TRIG.length;j++){ var g=TRIG[j][0].split(' '); if(t.slice(i,i+g.length).join(' ')===g.join(' ')&&(!hit||g.length>hit[0].length)) hit=[g,TRIG[j][1]]; } if(hit){ out.push({t:hit[0].join(' '),n:hit[1]}); i+=hit[0].length; } else { var take=Math.min(3,t.length-i); out.push({t:t.slice(i,i+take).join(' '),n:''}); i+=take; } } return out; }
function memTrick(c){ var ch=chunkAlg(c.alg), n=String(c.alg).trim().split(/\s+/).length, named=ch.filter(function(x){ return x.n; }).map(function(x){ return String(x.n).replace(/^(a|an|the)\s+/i,''); }), mv=String(c.alg).trim().split(/\s+/);
  return n+' moves in '+ch.length+' chunks: '+ch.map(function(x){ return x.t; }).join('  |  ')+'. '+(named.length?'Look for the '+named.filter(function(v,i,a){ return a.indexOf(v)===i; }).join(' and the ')+'. ':'')+'Starts with '+mv[0]+' and ends with '+mv[mv.length-1]+'. Say each chunk out loud as one beat.'; }
function weakList(){ var M=missBook(), out=[]; ['f2l','oll','pll'].forEach(function(k){ D[k].forEach(function(c){ var m=M[key(k,c)]; if(m&&m[0]>0) out.push({k:k,c:c,n:m[0],t:m[1]}); }); }); out.sort(function(a,b){ return b.n-a.n||b.t-a.t; }); return out.slice(0,5); }
function weakBox(){ var W=weakList(); if(!W.length) return ''; return '<div class="pnl" style="max-width:560px;margin:0 auto 14px"><div class="row" style="gap:8px"><h3 style="margin:0">Needs review</h3><span class="sp"></span><button class="btn sm pri" id="dWeak">'+(DR.weak?'Back to all':'Drill only these')+'</button></div><p class="muted" style="font-size:13.5px;margin:6px 0 10px">Cases you missed in Drill most recently, each with a memory trick built from its moves.</p>'
  +W.map(function(w){ return '<div class="alg" style="grid-template-columns:1fr;margin-bottom:8px"><div><b>'+esc(title(w.k,w.c))+'</b> <span class="mono muted" style="font-size:12px">missed '+w.n+'×</span><code>'+esc(w.c.alg)+'</code><span class="muted" style="font-size:13px;display:block;margin-top:4px">'+esc(memTrick(w.c))+'</span></div></div>'; }).join('')+'</div>'; }

function drill(){ var o=PL.learned(); if(isPk(DR.k)&&!pkOwn(DR.k)) DR.k='oll'; if(!DR.cur||!D[DR.k].includes(DR.cur)) pick(); var c=DR.cur;
  return weakBox()+'<div class="pnl" style="max-width:560px;margin:0 auto"><div class="row" style="gap:10px;flex-wrap:wrap"><div class="seg" id="dK">'+['f2l','oll','pll','zbll','coll','ollcp','cll'].filter(function(k){ return !isPk(k)||pkOwn(k); }).map(function(k){ return '<button type="button" data-k="'+k+'" aria-pressed="'+(DR.k===k)+'">'+(k==='cll'?'2×2':k.toUpperCase())+'</button>'; }).join('')+'</div><span class="sp"></span><label class="lk row" style="gap:6px"><input type="checkbox" id="dA"'+(DR.all?' checked':'')+'> Include unlearned</label></div>'
  +'<div style="text-align:center;margin:16px 0">'+diag(DR.k,c,190)+'<p style="font:800 22px var(--display);margin:8px 0 2px">'+esc(title(DR.k,c))+'</p><span class="mono muted" style="font-size:13px">'+esc(c.g)+'</span></div>'
  +'<div id="dAns" class="scr" style="'+(DR.shown?'':'visibility:hidden')+'">'+esc(c.alg)+'</div>'
  +'<div class="row" style="gap:8px;margin-top:12px;justify-content:center">'+(DR.shown?'<button class="btn pri" id="dOk">Got it</button><button class="btn" id="dNo">Missed it</button>':'<button class="btn pri" id="dShow">Show moves</button><button class="btn" id="dSkip">Skip</button>')+'</div>'
  +'<p class="muted" style="text-align:center;font-size:13px;margin-top:12px">This session: '+DR.st.ok+' right, '+DR.st.miss+' missed. Missed cases return sooner.</p></div>'; }


/* ---------- tiny 3D cube (sticker model) ---------- */
var FACES={U:[0,1,0],D:[0,-1,0],F:[0,0,1],B:[0,0,-1],R:[1,0,0],L:[-1,0,0]}, FC={U:'Y',D:'W',F:'G',B:'B',R:'O',L:'R'};
var MV={U:[1,[1],-1],D:[1,[-1],1],R:[0,[1],-1],L:[0,[-1],1],F:[2,[1],-1],B:[2,[-1],1],u:[1,[0,1],-1],d:[1,[-1,0],1],r:[0,[0,1],-1],l:[0,[-1,0],1],f:[2,[0,1],-1],b:[2,[-1,0],1],M:[0,[0],1],E:[1,[0],1],S:[2,[0],-1],x:[0,[-1,0,1],-1],y:[1,[-1,0,1],-1],z:[2,[-1,0,1],-1]};
function rotQ(v,ax,k){ var x=v[0],y=v[1],z=v[2],t; for(var i=0;i<((k%4)+4)%4;i++){ if(ax===0){ t=y; y=-z; z=t; } else if(ax===1){ t=x; x=z; z=-t; } else { t=x; x=-y; y=t; } } return [x,y,z]; }
function rotA(v,ax,a){ var c=Math.cos(a),s=Math.sin(a),x=v[0],y=v[1],z=v[2]; if(ax===0) return [x,y*c-z*s,y*s+z*c]; if(ax===1) return [x*c+z*s,y,-x*s+z*c]; return [x*c-y*s,x*s+y*c,z]; }
function solvedCube(){ var s=[]; for(var x=-1;x<=1;x++)for(var y=-1;y<=1;y++)for(var z=-1;z<=1;z++){ if(!x&&!y&&!z) continue; for(var f in FACES){ var n=FACES[f]; if((n[0]&&n[0]===x)||(n[1]&&n[1]===y)||(n[2]&&n[2]===z)) s.push({p:[x,y,z],n:n.slice(),c:FC[f]}); } } return s; }
function parseAlg(a){ var o=[]; String(a||'').trim().split(/\s+/).forEach(function(t){ var m=/^([UDRLFBudrlfbMESxyz])(2|')?$/.exec(t); if(m&&MV[m[1]]) o.push([m[1],m[2]==="'"?-1:m[2]==='2'?2:1,t]); }); return o; }
function applyMove(s,mv){ var d=MV[mv[0]],q=d[2]*mv[1]; s.forEach(function(st){ if(d[1].indexOf(st.p[d[0]])>=0){ st.p=rotQ(st.p,d[0],q); st.n=rotQ(st.n,d[0],q); } }); }
function invAlg(mvs){ return mvs.slice().reverse().map(function(m){ return [m[0],m[1]===2?2:-m[1],m[0]+(m[1]===2?'2':m[1]===1?"'":'')]; }); }
function Cube3(cv){ var me={cv:cv,ctx:cv.getContext('2d'),st:solvedCube(),yaw:-0.62,pitch:0.5,anim:null};
  me.setup=function(mvs){ me.st=solvedCube(); invAlg(mvs).forEach(function(m){ applyMove(me.st,m); }); };
  me.jump=function(mvs,i){ me.st=solvedCube(); invAlg(mvs).forEach(function(m){ applyMove(me.st,m); }); for(var k=0;k<i;k++) applyMove(me.st,mvs[k]); me.anim=null; };
  me.draw=function(){ var c=me.cv,g=me.ctx,W=c.width,H=c.height,sc=W/6.6, cy=Math.cos(me.yaw),sy=Math.sin(me.yaw),cp=Math.cos(me.pitch),sp=Math.sin(me.pitch); g.clearRect(0,0,W,H); var items=[],an=me.anim,d=an&&MV[an.mv[0]],ang=an?an.a:0;
    function view(v){ var x=v[0]*cy+v[2]*sy, z=-v[0]*sy+v[2]*cy, y=v[1]*cp-z*sp; z=v[1]*sp+z*cp; return [x,y,z]; }
    me.st.forEach(function(s){ var p=s.p,n=s.n; if(an&&d[1].indexOf(p[d[0]])>=0){ p=rotA(p,d[0],ang); n=rotA(n,d[0],ang); }
      var vn=view(n); if(vn[2]<=0.02) return; var ctr=[p[0]+n[0]*.5,p[1]+n[1]*.5,p[2]+n[2]*.5], t1=Math.abs(n[1])>.9?[1,0,0]:[0,1,0]; if(an&&d[1].indexOf(s.p[d[0]])>=0){ t1=Math.abs(s.n[1])>.9?[1,0,0]:[0,1,0]; t1=rotA(t1,d[0],ang); }
      else t1=Math.abs(n[1])>.9?[1,0,0]:[0,1,0];
      var t2=[n[1]*t1[2]-n[2]*t1[1],n[2]*t1[0]-n[0]*t1[2],n[0]*t1[1]-n[1]*t1[0]], vc=view(ctr); items.push({c:s.c,ctr:ctr,t1:t1,t2:t2,n:n,z:vc[2]}); });
    items.sort(function(a,b){ return a.z-b.z; });
    function quad(it,h,off,col){ var pts=[[-1,-1],[1,-1],[1,1],[-1,1]].map(function(k){ var v=[it.ctr[0]+it.n[0]*off+it.t1[0]*k[0]*h+it.t2[0]*k[1]*h,it.ctr[1]+it.n[1]*off+it.t1[1]*k[0]*h+it.t2[1]*k[1]*h,it.ctr[2]+it.n[2]*off+it.t1[2]*k[0]*h+it.t2[2]*k[1]*h]; var w=view(v); return [W/2+w[0]*sc,H/2-w[1]*sc]; });
      g.beginPath(); g.moveTo(pts[0][0],pts[0][1]); for(var i=1;i<4;i++) g.lineTo(pts[i][0],pts[i][1]); g.closePath(); g.fillStyle=col; g.fill(); }
    items.forEach(function(it){ quad(it,.5,0,'#14161a'); quad(it,.43,.004,CLR[it.c]); });
  };
  return me; }

/* ---------- WebGL cube: lit, rounded cubies with real depth. Falls back to the flat canvas version if WebGL is missing ---------- */
var GLV=null;
function m4mul(a,b){ var o=new Float32Array(16); for(var c=0;c<4;c++)for(var r=0;r<4;r++){ var s=0; for(var k=0;k<4;k++) s+=a[k*4+r]*b[c*4+k]; o[c*4+r]=s; } return o; }
function m4basis(t1,t2,n,p){ return new Float32Array([t1[0],t1[1],t1[2],0, t2[0],t2[1],t2[2],0, n[0],n[1],n[2],0, p[0],p[1],p[2],1]); }
function m4rx(a){ var c=Math.cos(a),s=Math.sin(a); return new Float32Array([1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]); }
function m4ry(a){ var c=Math.cos(a),s=Math.sin(a); return new Float32Array([c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]); }
function m4tr(x,y,z){ return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]); }
function m4persp(fov,asp,n,f){ var t=1/Math.tan(fov/2); return new Float32Array([t/asp,0,0,0, 0,t,0,0, 0,0,(f+n)/(n-f),-1, 0,0,2*f*n/(n-f),0]); }
function hexRgb(h){ var n=parseInt(h.slice(1),16); return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]; }
function glGeo(){ var h=.47,r=.13,a=h-r, u=[-h,-(a+.66*r),-(a+.33*r),-a,a,a+.33*r,a+.66*r,h], P=[],I=[],ax=[[0,1,2],[1,2,0],[2,0,1]];
  [[0,1],[0,-1],[1,1],[1,-1],[2,1],[2,-1]].forEach(function(f){ var A=f[0],sg=f[1],B=(A+1)%3,C=(A+2)%3, base=P.length/6;
    for(var i=0;i<8;i++)for(var j=0;j<8;j++){ var p=[0,0,0]; p[A]=h*sg; p[B]=u[i]; p[C]=u[j]; var q=p.map(function(v){ return Math.max(-a,Math.min(a,v)); }), d=[p[0]-q[0],p[1]-q[1],p[2]-q[2]], l=Math.sqrt(d[0]*d[0]+d[1]*d[1]+d[2]*d[2])||1, nn=[d[0]/l,d[1]/l,d[2]/l];
      P.push(q[0]+nn[0]*r,q[1]+nn[1]*r,q[2]+nn[2]*r,nn[0],nn[1],nn[2]); }
    for(var i=0;i<7;i++)for(var j=0;j<7;j++){ var v0=base+i*8+j,v1=v0+1,v2=v0+8,v3=v2+1; if(sg>0){ I.push(v0,v2,v1,v1,v2,v3); } else { I.push(v0,v1,v2,v1,v3,v2); } } });
  /* the winding only matters for culling, which is off, so normals are what count */
  var S=[0,0,0,0,0,1], SI=[], s=.415, rr=.11, pts=[]; [[1,1,0],[-1,1,Math.PI/2],[-1,-1,Math.PI],[1,-1,Math.PI*1.5]].forEach(function(c){ for(var k=0;k<=6;k++){ var an=c[2]+k/6*Math.PI/2; pts.push([c[0]*(s-rr)+Math.cos(an)*rr,c[1]*(s-rr)+Math.sin(an)*rr]); } });
  pts.forEach(function(p){ S.push(p[0],p[1],0,0,0,1); }); for(var i=0;i<pts.length;i++) SI.push(0,1+i,1+(i+1)%pts.length);
  return {body:{v:new Float32Array(P),i:new Uint16Array(I)},stk:{v:new Float32Array(S),i:new Uint16Array(SI)}}; }
var VS='attribute vec3 aP;attribute vec3 aN;uniform mat4 uMV;uniform mat4 uP;varying vec3 vN;varying vec3 vV;void main(){vec4 v=uMV*vec4(aP,1.);vV=v.xyz;vN=(uMV*vec4(aN,0.)).xyz;gl_Position=uP*v;}';
var FS='precision mediump float;uniform vec3 uC;uniform vec2 uS;varying vec3 vN;varying vec3 vV;void main(){vec3 N=normalize(vN),V=normalize(-vV);vec3 L1=normalize(vec3(-.45,.8,.7)),L2=normalize(vec3(.85,.1,.35)),L3=normalize(vec3(0.,-.7,.5));'
 +'float d=max(dot(N,L1),0.)*.58+max(dot(N,L2),0.)*.2+max(dot(N,L3),0.)*.1;vec3 H=normalize(L1+V);float sp=pow(max(dot(N,H),0.),uS.y)*uS.x;float rim=pow(1.-max(dot(N,V),0.),3.)*.12;'
 +'gl_FragColor=vec4(uC*(.46+d)+vec3(sp)+vec3(rim),1.);}';
function Cube3D(cv){ var gl=null; try{ gl=cv.getContext('webgl',{antialias:true,alpha:true})||cv.getContext('experimental-webgl',{antialias:true,alpha:true}); }catch(e){} if(!gl) return null;
  function sh(t,s){ var o=gl.createShader(t); gl.shaderSource(o,s); gl.compileShader(o); return gl.getShaderParameter(o,gl.COMPILE_STATUS)?o:null; }
  var vs=sh(gl.VERTEX_SHADER,VS), fs=sh(gl.FRAGMENT_SHADER,FS); if(!vs||!fs) return null; var pg=gl.createProgram(); gl.attachShader(pg,vs); gl.attachShader(pg,fs); gl.linkProgram(pg); if(!gl.getProgramParameter(pg,gl.LINK_STATUS)) return null; gl.useProgram(pg);
  if(!GLV) GLV=glGeo(); function buf(g){ var vb=gl.createBuffer(), ib=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vb); gl.bufferData(gl.ARRAY_BUFFER,g.v,gl.STATIC_DRAW); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,g.i,gl.STATIC_DRAW); return {vb:vb,ib:ib,n:g.i.length}; }
  var B=buf(GLV.body), K=buf(GLV.stk), aP=gl.getAttribLocation(pg,'aP'), aN=gl.getAttribLocation(pg,'aN'), uMV=gl.getUniformLocation(pg,'uMV'), uP=gl.getUniformLocation(pg,'uP'), uC=gl.getUniformLocation(pg,'uC'), uS=gl.getUniformLocation(pg,'uS');
  gl.enable(gl.DEPTH_TEST); gl.clearColor(0,0,0,0);
  var rgb={}; for(var k in CLR) rgb[k]=hexRgb(CLR[k]); var cells=[]; for(var x=-1;x<=1;x++)for(var y=-1;y<=1;y++)for(var z=-1;z<=1;z++) if(x||y||z) cells.push([x,y,z]);
  var me={cv:cv,gl:1,st:solvedCube(),yaw:-0.62,pitch:0.5,anim:null};
  me.setup=function(mvs){ me.st=solvedCube(); invAlg(mvs).forEach(function(m){ applyMove(me.st,m); }); };
  me.jump=function(mvs,i){ me.st=solvedCube(); invAlg(mvs).forEach(function(m){ applyMove(me.st,m); }); for(var k=0;k<i;k++) applyMove(me.st,mvs[k]); me.anim=null; };
  function bind(b){ gl.bindBuffer(gl.ARRAY_BUFFER,b.vb); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,b.ib); gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP,3,gl.FLOAT,false,24,0); gl.enableVertexAttribArray(aN); gl.vertexAttribPointer(aN,3,gl.FLOAT,false,24,12); }
  me.draw=function(){ var W=cv.width,H=cv.height; gl.viewport(0,0,W,H); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    var V=m4mul(m4tr(0,0,-(me.dist||10.6)),m4mul(m4rx(me.pitch),m4ry(me.yaw))); gl.uniformMatrix4fv(uP,false,m4persp(.52,W/H,4,24));
    var an=me.anim, d=an&&MV[an.mv[0]], ang=an?an.a:0;
    bind(B); gl.uniform2f(uS,.18,18); gl.uniform3f(uC,.055,.06,.07);
    var n2=!!me.n2, SC=n2?.5:1;
    cells.forEach(function(c){ if(n2&&!(c[0]&&c[1]&&c[2])) return; var p=c, M; if(an&&d[1].indexOf(c[d[0]])>=0){ p=rotA(c,d[0],ang); var e=[[1,0,0],[0,1,0],[0,0,1]].map(function(v){ return rotA(v,d[0],ang); }); M=m4basis(e[0],e[1],e[2],[p[0]*SC,p[1]*SC,p[2]*SC]); } else M=m4tr(p[0]*SC,p[1]*SC,p[2]*SC);
      gl.uniformMatrix4fv(uMV,false,m4mul(V,M)); gl.drawElements(gl.TRIANGLES,B.n,gl.UNSIGNED_SHORT,0); });
    bind(K); gl.uniform2f(uS,.55,46);
    me.st.forEach(function(s){ if(n2&&!(s.p[0]&&s.p[1]&&s.p[2])) return; var p=s.p,n=s.n, t1=Math.abs(n[1])>.9?[1,0,0]:[0,1,0], t2=[n[1]*t1[2]-n[2]*t1[1],n[2]*t1[0]-n[0]*t1[2],n[0]*t1[1]-n[1]*t1[0]]; if(an&&d[1].indexOf(p[d[0]])>=0){ p=rotA(p,d[0],ang); n=rotA(n,d[0],ang); t1=rotA(t1,d[0],ang); t2=rotA(t2,d[0],ang); }
      var q=[p[0]*SC+n[0]*.472,p[1]*SC+n[1]*.472,p[2]*SC+n[2]*.472], col=rgb[s.c]||[.5,.5,.5]; gl.uniform3f(uC,col[0],col[1],col[2]); gl.uniformMatrix4fv(uMV,false,m4mul(V,m4basis(t1,t2,n,q))); gl.drawElements(gl.TRIANGLES,K.n,gl.UNSIGNED_SHORT,0); }); };
  me.dispose=function(){ try{ var x=gl.getExtension('WEBGL_lose_context'); if(x) x.loseContext(); }catch(e){} };
  return me; }
function mkCube(cv){ return Cube3D(cv)||Cube3(cv); }
PL.lk={diag:function(k,c,n){ return diag(k,c,n); },mkCube:mkCube,parseAlg:parseAlg,solvedCube:solvedCube,applyMove:applyMove,invAlg:invAlg,MV:MV,CLR:CLR,FC:FC,ease:function(t){ return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }};

/* ---------- clip maker ---------- */
function clipMime(){ if(!window.MediaRecorder) return null; var c=['video/mp4;codecs=avc1,mp4a.40.2','video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm']; for(var i=0;i<c.length;i++){ try{ if(MediaRecorder.isTypeSupported(c[i])) return c[i]; }catch(e){} } return null; }
function wrapT(g,t,x,y,w,lh){ var words=t.split(' '),line='',yy=y; words.forEach(function(wd){ var tt=line?line+' '+wd:wd; if(g.measureText(tt).width>w&&line){ g.fillText(line,x,yy); line=wd; yy+=lh; } else line=tt; }); g.fillText(line,x,yy); return yy; }
function clipSynth(ac,out,t0,dur){ var bpm=98, st=60/bpm/4, bar=st*16, nb=null, rv=null, i, b, k;
  var N={F1:43.65,G1:49,A1:55,E1:41.2,G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,E4:329.63,F4:349.23};
  var bus=ac.createGain(); bus.gain.value=.55; bus.connect(out);
  var wet=ac.createGain(); wet.gain.value=.5; var cv=ac.createConvolver(); var L=Math.floor(ac.sampleRate*1.9), ib=ac.createBuffer(2,L,ac.sampleRate); for(var c=0;c<2;c++){ var d=ib.getChannelData(c); for(var q=0;q<L;q++) d[q]=(Math.random()*2-1)*Math.pow(1-q/L,2.6); } cv.buffer=ib; wet.connect(cv); cv.connect(out);
  var sh=ac.createWaveShaper(), cu=new Float32Array(1024); for(i=0;i<1024;i++){ var xx=i/512-1; cu[i]=Math.tanh(xx*2.2); } sh.curve=cu; sh.oversample='2x'; sh.connect(bus);
  function env(g,t,a,len,vol){ g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+a); g.gain.exponentialRampToValueAtTime(.0008,t+len); }
  function noise(t,len,vol,ft,fr,fq,send){ if(!nb){ nb=ac.createBuffer(1,ac.sampleRate*.5,ac.sampleRate); var dd=nb.getChannelData(0); for(var z=0;z<dd.length;z++) dd[z]=Math.random()*2-1; } var s2=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain(); s2.buffer=nb; f.type=ft; f.frequency.value=fr; f.Q.value=fq; env(g,t,.002,len,vol); s2.connect(f); f.connect(g); g.connect(bus); if(send) g.connect(wet); s2.start(t); s2.stop(t+len+.03); }
  function kick(t,v){ var o=ac.createOscillator(),g=ac.createGain(); o.frequency.setValueAtTime(130,t); o.frequency.exponentialRampToValueAtTime(42,t+.1); env(g,t,.002,.32,v); o.connect(g); g.connect(sh); o.start(t); o.stop(t+.36); noise(t,.012,v*.25,'highpass',2500,.7,false); }
  function sub(f,t,len,v,gl){ var o=ac.createOscillator(),g=ac.createGain(); o.type='sine'; o.frequency.setValueAtTime(gl?gl:f,t); if(gl) o.frequency.exponentialRampToValueAtTime(f,t+.09); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+.01); g.gain.setValueAtTime(v,t+len*.7); g.gain.exponentialRampToValueAtTime(.001,t+len); o.connect(g); g.connect(sh); o.start(t); o.stop(t+len+.05); }
  function clap(t,v){ for(var z=0;z<3;z++) noise(t+z*.011,.05,v*.5,'bandpass',1500,.9,false); noise(t+.03,.28,v*.55,'bandpass',1300,.8,true); }
  function cow(f,t,len,v){ [f,f*1.4835].forEach(function(ff){ var o=ac.createOscillator(),g=ac.createGain(),bp=ac.createBiquadFilter(); o.type='square'; o.frequency.value=ff*1.0; bp.type='bandpass'; bp.frequency.value=ff*1.7; bp.Q.value=2.2; env(g,t,.003,len,v); o.connect(bp); bp.connect(g); g.connect(bus); g.connect(wet); o.start(t); o.stop(t+len+.03); }); }
  function pad(f,t,len,v){ [-9,9].forEach(function(de){ var o=ac.createOscillator(),g=ac.createGain(),lp=ac.createBiquadFilter(); o.type='sawtooth'; o.frequency.value=f; o.detune.value=de; lp.type='lowpass'; lp.frequency.value=700; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+len*.3); g.gain.linearRampToValueAtTime(0,t+len); o.connect(lp); lp.connect(g); g.connect(bus); g.connect(wet); o.start(t); o.stop(t+len+.05); }); }
  var ROOT=[N.F1,N.F1,N.G1,N.A1], PADF=[174.61,174.61,196,220];
  var MEL=[[[0,'A4'],[3,'A4'],[6,'C5'],[8,'A4'],[11,'G4'],[14,'A4']],[[0,'A4'],[3,'C5'],[6,'D5'],[8,'C5'],[10,'A4'],[12,'G4']],[[0,'G4'],[3,'A4'],[6,'D5'],[8,'C5'],[11,'A4'],[14,'G4']],[[0,'A4'],[3,'E5'],[6,'D5'],[8,'C5'],[10,'A4'],[12,'E4'],[14,'A4']]];
  var KP=[[0,4,8,12],[0,4,8,10,12],[0,4,8,12,14],[0,3,4,8,12,15]], n=Math.ceil(dur/bar);
  for(b=0;b<n;b++){ var T=t0+b*bar, bi=b%4, intro=b<1, sw=function(x){ return T+x*st; };
    pad(PADF[bi],T,bar*1.05,.3);
    MEL[bi].forEach(function(m){ cow(N[m[1]],sw(m[0]),st*2.4,intro?.4:.75); });
    if(intro) continue;
    KP[bi].forEach(function(x){ kick(sw(x),.55); });
    sub(ROOT[bi],sw(0),st*3.6,.3); sub(ROOT[bi],sw(6),st*1.8,.24); sub(ROOT[bi],sw(10),st*3.4,.27,ROOT[bi]*1.5); if(bi===3){ sub(N.G1,sw(14),st*2,.24,N.A1); }
    clap(sw(4),2.6); clap(sw(12),2.6);
    for(k=0;k<16;k+=2) noise(sw(k),.04,.9,'highpass',7500,.7,false); noise(sw(2),.03,.35,'highpass',8500,.7,false);
    if(bi===3){ for(k=12;k<16;k++) noise(sw(k)+.0,.025,.8,'highpass',9000,.7,false); } else { noise(sw(7),.03,.5,'highpass',8000,.7,false); noise(sw(15),.03,.5,'highpass',9000,.7,false); } } }
function clipAudio(done){ var AC=window.AudioContext||window.webkitAudioContext; if(!AC){ done(null); return; } var ac; try{ ac=new AC(); }catch(e){ done(null); return; }
  var dest=ac.createMediaStreamDestination(), master=ac.createGain(); master.gain.value=.8; var comp=ac.createDynamicsCompressor(); comp.threshold.value=-18; comp.ratio.value=4; master.connect(comp); comp.connect(dest); var T={ac:ac,track:dest.stream.getAudioTracks()[0],master:master,go:null,fade:function(){ try{ master.gain.setTargetAtTime(0,ac.currentTime,.08); }catch(e){} },close:function(){ setTimeout(function(){ try{ ac.close(); }catch(e){} },500); }};
  var fin=function(go){ T.go=go; done(T); };
  fetch('/clip-song.mp3',{cache:'no-cache'}).then(function(r){ if(!r.ok) throw 0; var ct=r.headers.get('content-type')||''; if(/html/.test(ct)) throw 0; return r.arrayBuffer(); }).then(function(ab){ return new Promise(function(res,rej){ ac.decodeAudioData(ab,res,rej); }); })
   .then(function(buf){ fin(function(){ var s=ac.createBufferSource(); s.buffer=buf; s.loop=true; s.connect(master); s.start(); }); }).catch(function(){ fin(function(){ clipSynth(ac,master,ac.currentTime+.05,40); }); }); }
function makeClip(btn,k,c,mvs){ var mime=clipMime(); if(!mime||!HTMLCanvasElement.prototype.captureStream){ CW.toast('Clips need a newer browser (Chrome, Edge, Safari 14.1+).'); return; }
  var W=720,out=document.createElement('canvas'); out.width=W; out.height=W; var g=out.getContext('2d'), wk=document.createElement('canvas'); wk.width=W; wk.height=W; var cube=Cube3(wk), hasF=('filter' in g);
  var chunks=[],AU=null,rec=null;
  var scenes=[{t:'title',len:1100},{t:'cube',yaw:-.62,pitch:.5,fx:'bw',sp:1.5},{t:'cube',yaw:.95,pitch:.38,fx:'teal',sp:3.2},{t:'end',len:1800}], si=-1, st0=0, flash=0, last=0, A=null, done=false, tit=title(k,c), SP=1.5;
  function enter(i,now){ si=i; st0=now; flash=1; var s=scenes[i]; if(s.t==='cube'){ cube.yaw=s.yaw; cube.pitch=s.pitch; cube.setup(mvs); cube.anim=null; SP=s.sp||1.5; A={i:0,wait:500,hold:0}; } }
  function stepCube(dt){ var cu=cube; if(cu.anim){ cu.anim.t+=dt/(cu.anim.mv[1]===2?900:650)*SP*1.6; var u=Math.min(1,cu.anim.t); cu.anim.a=MV[cu.anim.mv[0]][2]*cu.anim.mv[1]*Math.PI/2*ease(u); if(u>=1){ applyMove(cu.st,cu.anim.mv); cu.anim=null; A.i++; A.wait=300/SP; } }
    else if(A.i<mvs.length){ A.wait-=dt; if(A.wait<=0) cu.anim={mv:mvs[A.i],t:0,a:0}; } else A.hold+=dt; }
  function frame(ts){ if(done) return; var dt=Math.min(50,ts-(last||ts)); last=ts; var s=scenes[si], el=ts-st0; var fin=false;
    g.fillStyle='#0b0c0e'; g.fillRect(0,0,W,W);
    if(s.t==='title'){ g.fillStyle='#fff'; g.textAlign='center'; g.font='800 84px system-ui,sans-serif'; g.fillText(tit,W/2,W/2); g.fillStyle='#14b8a6'; g.font='600 30px system-ui,sans-serif'; g.fillText(c.g,W/2,W/2+58); g.fillStyle='#8a8f98'; g.font='600 24px ui-monospace,monospace'; g.fillText('CUBER TOOLS',W/2,W-60); fin=el>=s.len; }
    else if(s.t==='cube'){ stepCube(dt); cube.draw(); if(hasF){ g.filter=(s.fx==='bw'&&el<380)?'grayscale(1) contrast(1.4)':(s.fx==='inv'&&el<340)?'invert(1)':'none'; } g.drawImage(wk,0,0); if(hasF) g.filter='none';
      if(s.fx==='teal'&&el<420){ g.globalAlpha=.3*(1-el/420); g.fillStyle='#14e0c8'; g.fillRect(0,0,W,W); g.globalAlpha=1; }
      g.textAlign='left'; g.fillStyle='#fff'; g.font='800 34px system-ui,sans-serif'; g.fillText(tit,34,64); var cur=A.i<mvs.length?mvs[A.i][2]:'✓'; g.textAlign='center'; g.font='800 120px ui-monospace,monospace'; g.fillStyle='rgba(255,255,255,.92)'; g.fillText(A.i>0&&!cube.anim&&A.i<=mvs.length&&A.i===mvs.length?'✓':cur,W/2,W-54);
      fin=A.i>=mvs.length&&A.hold>700; }
    else { g.fillStyle='#fff'; g.textAlign='center'; g.font='800 54px system-ui,sans-serif'; g.fillText(tit,W/2,150); g.fillStyle='#14b8a6'; g.font='700 36px ui-monospace,monospace'; var ly=wrapT(g,c.alg,W/2,260,W-120,56); g.fillStyle='#8a8f98'; g.font='600 28px system-ui,sans-serif'; g.fillText('Learn it free: cubeworkstudio.com/play',W/2,W-70); fin=el>=s.len; }
    if(flash>0){ g.globalAlpha=Math.min(1,flash); g.fillStyle='#fff'; g.fillRect(0,0,W,W); g.globalAlpha=1; flash-=dt/170; }
    if(fin){ if(si+1<scenes.length) enter(si+1,ts); else { done=true; if(AU) AU.fade(); setTimeout(function(){ rec.stop(); if(AU) AU.close(); },450); return; } }
    requestAnimationFrame(frame); }
  function setup(){ var vs=out.captureStream(30); if(AU&&AU.track) vs.addTrack(AU.track); rec=new MediaRecorder(vs,{mimeType:mime,videoBitsPerSecond:2.5e6}); rec.ondataavailable=function(e){ if(e.data&&e.data.size) chunks.push(e.data); }; rec.onstop=onStop; if(AU&&AU.ac.state==='suspended') AU.ac.resume(); if(AU) AU.go(); rec.start(); requestAnimationFrame(function(ts){ last=0; enter(0,ts); frame(ts); }); }
  var onStop=function(){ var ext=/mp4/.test(mime)?'mp4':'webm', blob=new Blob(chunks,{type:mime.split(';')[0]}), url=URL.createObjectURL(blob), name='cuber-tools-'+RM.id+'.'+ext; btn.disabled=false; btn.textContent='Make clip';
    var sh=CW.sheet('<div class="hd"><h2>Your clip</h2><button class="x" data-close aria-label="Close">✕</button></div><video src="'+url+'" controls loop playsinline style="width:100%;border-radius:12px;background:#000"></video><div class="row" style="gap:8px;margin-top:12px"><a class="btn pri" href="'+url+'" download="'+name+'">Save clip</a><button class="btn" id="clShare">Share</button></div>');
    var sb=sh.querySelector('#clShare'); if(sb) sb.onclick=function(){ var f; try{ f=new File([blob],name,{type:blob.type}); }catch(e){} if(f&&navigator.canShare&&navigator.canShare({files:[f]})) navigator.share({files:[f],title:tit}).catch(function(){}); else CW.toast('Use Save clip, then share the file.'); }; };
  btn.disabled=true; btn.textContent='Recording…'; clipAudio(function(a){ AU=a; try{ setup(); }catch(e){ if(AU&&AU.ac) AU.close(); AU=null; try{ setup(); }catch(e2){ btn.disabled=false; btn.textContent='Make clip'; CW.toast('Could not record a clip here.'); } } }); }

/* ---------- case room ---------- */
var PR=function(){ var o=CW.lsJ('cw_learn_pr',{}); return o&&typeof o==='object'&&!Array.isArray(o)?o:{}; };
var RM={cube:null,raf:0,mvs:[],i:0,play:true,spd:.5,loop:true,alt:false,id:null,k:null,c:null,pad:{st:'idle',t0:0,hold:0,raf:0},keys:null,last:0,wait:0};
function ease(t){ return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
function roomStop(){ cancelAnimationFrame(RM.raf); clearTimeout(RM.pad.hold); cancelAnimationFrame(RM.pad.raf); if(RM.keys){ document.removeEventListener('keydown',RM.keys.d); document.removeEventListener('keyup',RM.keys.u); RM.keys=null; } heroStop(); if(BL.cu&&BL.cu.dispose){ BL.cu.dispose(); BL.cu=null; } RM.pad.st='idle'; if(RM.cube&&RM.cube.dispose){ RM.cube.dispose(); RM.cube=null; } }
function fmtMs(t){ return t==null?'–':(t/1000).toFixed(2); }
function aoOf(a,n){ if(a.length<n) return null; var x=a.slice(0,n).sort(function(p,q){ return p-q; }); if(n>=5) x=x.slice(1,-1); return x.reduce(function(s,v){ return s+v; },0)/x.length; }
function nav(k,c,dir){ var list=D[k], i=list.indexOf(c), n=list[(i+dir+list.length)%list.length]; location.hash='learn/'+k+'/'+n.id; }
function roomMoves(){ var c=RM.c; return parseAlg(RM.alt&&c.ant?c.ant:c.an); }
function setupStr(mvs){ try{ return invAlg(mvs).map(function(m){ return m[2]; }).join(' '); }catch(e){ return ''; } }
function loadAlg(el){ RM.mvs=roomMoves(); var su=$('#rmSetup',el); if(su){ var t=setupStr(RM.mvs); su.textContent=t; var sc=$('#rmSetupCp',el); if(sc) sc.setAttribute('data-copy',t); } RM.i=0; RM.cube.setup(RM.mvs); RM.cube.anim=null; RM.wait=700; chips(el); RM.cube.draw(); }
function chips(el){ var h=$('#rmChips',el); if(!h) return; h.innerHTML=RM.mvs.map(function(m,i){ return '<span class="mvc'+(i<RM.i?' done':i===RM.i?' cur':'')+'" data-j="'+i+'">'+esc(m[2])+'</span>'; }).join(''); }
function roomLoop(el){ var cv=RM.cube.cv; var tick=function(ts){ RM.raf=requestAnimationFrame(tick); if(!document.body.contains(cv)){ cancelAnimationFrame(RM.raf); return; } var dt=Math.min(60,ts-(RM.last||ts)); RM.last=ts; var cu=RM.cube;
    if(cu.anim){ cu.anim.t+=dt/(cu.anim.mv[1]===2?900:650)*RM.spd*1.6; var u=Math.min(1,cu.anim.t); cu.anim.a=MV[cu.anim.mv[0]][2]*cu.anim.mv[1]*Math.PI/2*ease(u);
      if(u>=1){ applyMove(cu.st,cu.anim.mv); cu.anim=null; RM.i++; chips(el); RM.wait=380/RM.spd; if(RM.i>=RM.mvs.length){ RM.wait=1500/Math.max(.5,RM.spd); if(!RM.loop) { RM.play=false; syncBtn(el); } } } }
    else if(RM.play||RM.step){ RM.wait-=dt; if(RM.wait<=0){ if(RM.i>=RM.mvs.length){ if(RM.loop||RM.step){ RM.step=false; RM.mvs.length&&(cu.jump(RM.mvs,0),RM.i=0,chips(el),RM.wait=800); } } else { cu.anim={mv:RM.mvs[RM.i],t:0,a:0}; RM.step=false; } } }
    cu.draw(); }; RM.last=0; RM.raf=requestAnimationFrame(tick); }
function syncBtn(el){ var b=$('#rmPlay',el); if(b) b.textContent=RM.play?'⏸':'▶'; }
function padUI(el){ var P=PR()[RM.k+'-'+RM.c.id]||[], b=$('#rmStats',el); if(!b) return; b.innerHTML='<div><small>Last</small><b>'+fmtMs(P[0])+'</b></div><div><small>Best</small><b>'+fmtMs(P.length?Math.min.apply(null,P):null)+'</b></div><div><small>Ao5</small><b>'+fmtMs(aoOf(P,5))+'</b></div><div><small>Reps</small><b>'+P.length+'</b></div>'; }
function padSet(el,cls,txt){ var p=$('#rmPad',el); if(!p) return; p.classList.remove('hold','ready','run'); if(cls) p.classList.add(cls); $('#rmHint',el).textContent=txt; }
function padDown(el){ var P=RM.pad; if(P.st==='run'){ var t=Math.round(performance.now()-P.t0); P.st='done'; cancelAnimationFrame(P.raf); $('#rmTm',el).textContent=(t/1000).toFixed(2); padSet(el,'','Hold the pad, let go to start the next rep'); var id=RM.k+'-'+RM.c.id, o=PR(); o[id]=[t].concat(o[id]||[]).slice(0,50); CW.setJ('cw_learn_pr',o); padUI(el); rkMaybe(el,id,o[id]); return; }
  if(P.st==='done'){ P.st='idle'; } if(P.st!=='idle') return; P.st='hold'; padSet(el,'hold','Keep holding…'); clearTimeout(P.hold); P.hold=setTimeout(function(){ if(P.st==='hold'){ P.st='ready'; padSet(el,'ready','Let go to start'); $('#rmTm',el).textContent='0.00'; } },280); }
function padUp(el){ var P=RM.pad; clearTimeout(P.hold); if(P.st==='ready'){ P.st='run'; P.t0=performance.now(); padSet(el,'run','Tap the pad or press space to stop'); (function tk(){ if(P.st!=='run') return; $('#rmTm',el).textContent=((performance.now()-P.t0)/1000).toFixed(2); P.raf=requestAnimationFrame(tk); })(); } else if(P.st==='hold'){ P.st='idle'; padSet(el,'','Hold the pad, let go to start'); } else if(P.st==='done'){ P.st='idle'; } }

var RK={fr:false};
async function rkLoad(el,submit){ var box=$('#rmRk',el); if(!box) return; var LVv=PL.live; if(!LVv||!LVv.on){ box.innerHTML='<p class="muted" style="font-size:13px">Connect to Cuber Tools live to see the ranking.</p>'; return; }
  var cid=RM.id, body={id:CW.devId(),c:cid,fr:RK.fr?1:0}; if(submit){ body.act='submit'; body.ms=Math.round(submit); }
  var r=await CW.call('/api/lp',body,7000); if(RM.id!==cid||!$('#rmRk',el)) return; if(!r.ok){ box.innerHTML='<p class="muted" style="font-size:13px">'+esc((r.data&&r.data.error)||'Ranking unavailable right now.')+'</p>'; return; }
  var d=r.data; box.innerHTML='<div class="row" style="gap:8px;margin-bottom:6px"><div class="seg" id="rkS"><button type="button" data-f="0" aria-pressed="'+(!RK.fr)+'">Everyone</button><button type="button" data-f="1" aria-pressed="'+RK.fr+'">Friends</button></div><span class="sp"></span><span class="mono muted" style="font-size:12.5px">'+d.total+' ranked</span></div>'
   +(d.rows.length?d.rows.map(function(x){ return '<div class="rc-p'+(x.me?' me':'')+'"><b class="mono">'+x.r+'</b><span>'+esc(x.n)+(x.me?' (you)':'')+'</span><span class="mono" style="font-size:12.5px">'+fmtMs(x.ms)+'</span></div>'; }).join(''):'<p class="muted" style="font-size:13px">Nobody yet. Do 5 reps to set the first Ao5.</p>')
   +(d.mine&&d.mine.r>15?'<p class="muted" style="font-size:13px;margin-top:6px">You are #'+d.mine.r+' with '+fmtMs(d.mine.ms)+'.</p>':'');
  $('#rkS',box).onclick=function(e){ var b=e.target.closest('[data-f]'); if(!b) return; RK.fr=b.getAttribute('data-f')==='1'; rkLoad(el); }; }
function rkMaybe(el,id,list){ if(list.length<5) return; var best=null; for(var i=0;i+5<=list.length;i++){ var a=aoOf(list.slice(i,i+5),5); if(a!=null&&(best==null||a<best)) best=a; } if(best==null) return; var o=CW.lsJ('cw_learn_prb',{}); if(o[id]!=null&&o[id]<=best){ rkLoad(el); return; } o[id]=Math.round(best); CW.setJ('cw_learn_prb',o); rkLoad(el,best); }
function caseRoom(el,k,id){ var c=D[k].filter(function(x){ return String(x.id)===String(id); })[0]; if(!c){ location.hash='learn/'+k; return; }
  roomStop(); RM.k=k; RM.c=c; RM.id=key(k,c); RM.alt=false; var o=PL.learned(), on=!!o[RM.id], idx=D[k].indexOf(c);
  el.innerHTML='<div class="wrap"><div class="crumbs"><a href="#learn/'+k+'">← '+(k==='cll'?'2×2 CLL & EG':k.toUpperCase())+' list</a><h1>'+esc(title(k,c))+'</h1></div>'
   +'<div class="rm"><div class="rmL"><div class="rmstage"><canvas id="rmCv" width="640" height="560" aria-label="3D cube showing the algorithm"></canvas><span class="rmtag mono">'+esc(c.g)+'</span><label class="rmln"><input type="checkbox" id="rmLn"'+(on?' checked':'')+'> <span>Learned</span></label>'
   +'<div class="rmbar"><button class="rb" id="rmRst" aria-label="Restart">⏮</button><button class="rb" id="rmBk" aria-label="Back one move">◀</button><button class="rb big" id="rmPlay">⏸</button><button class="rb" id="rmFw" aria-label="Forward one move">▶</button><select id="rmSp" aria-label="Speed"><option value=".25">0.25×</option><option value=".5" selected>0.5×</option><option value="1">1×</option><option value="2">2×</option></select><label class="rbl"><input type="checkbox" id="rmLp" checked> Loop</label></div></div>'
   +'<p class="muted rmhint">Drag the cube to look around. White on the bottom, green in front.</p></div>'
   +'<div class="rmr"><div class="pnl"><div id="rmChips" class="mvs"></div><code class="rmalg">'+esc(c.alg)+'</code><div class="rmsu"><small class="muted">Setup scramble — puts this case on your cube</small><div class="row" style="gap:8px;margin-top:4px"><code class="rmalg" id="rmSetup" style="font-size:14px">'+esc(setupStr(parseAlg(c.an)))+'</code><button class="btn sm" id="rmSetupCp" data-copy="'+esc(setupStr(parseAlg(c.an)))+'">Copy</button></div></div>'+(c.alt?'<div class="row" style="gap:8px;margin-top:8px"><button class="btn sm" id="rmAlt">Try alternative alg</button><span class="muted" style="font-size:12.5px">'+esc(c.alt)+'</span></div>':'')
   +'<div class="rmgo"><div class="rmdg" title="What the case looks like">'+diag(k,c,92)+'</div><div class="rmbt"><button class="btn sm" data-copy="'+esc(c.alg)+'">Copy alg</button><button class="btn sm" id="rmClip">Make clip</button><span class="rmpn"><button class="btn sm" id="rmPv">← Prev</button><button class="btn sm" id="rmNx">Next →</button></span></div></div></div>'
   +'<div class="rtabs" id="rmTabs"><button type="button" data-rt="ex" aria-pressed="true">How to do it</button><button type="button" data-rt="pad" aria-pressed="false">Practice</button><button type="button" data-rt="rk" aria-pressed="false">Ranking</button></div>'
   +'<div class="pnl rtab" data-rtp="ex"><div id="rmEx"></div></div>'
   +'<div class="pnl rtab" data-rtp="pad" hidden><div id="rmPad" class="rmpad" tabindex="0" role="button" aria-label="Practice timer pad"><div id="rmTm" class="mono">0.00</div><div id="rmHint" class="muted">Hold the pad, let go to start</div></div><div class="stats" id="rmStats" style="margin-top:10px"></div>'
   +'<div class="row" style="margin-top:8px"><span class="muted" style="font-size:12.5px">Practice reps stay on this page. They never touch your solves or the leaderboard.</span><span class="sp"></span><button class="btn sm" id="rmClr">Clear</button></div></div>'
   +'<div class="pnl rtab" data-rtp="rk" hidden><h3 style="margin:0 0 8px">Fastest Ao5 on this case</h3><div id="rmRk"></div></div></div></div></div>';
  var cv=$('#rmCv',el); RM.cube=mkCube(cv); RM.cube.n2=k==='cll'; if(RM.cube.n2) RM.cube.dist=8.2; RM.play=true; RM.step=false; RM.spd=.5; RM.loop=true; loadAlg(el); roomLoop(el); padUI(el); rkLoad(el); exPaint(el); if(CO.ai===null) coachInit(function(){ exPaint(el); });
  var drag=null; cv.style.touchAction='none'; cv.onpointerdown=function(e){ drag=[e.clientX,e.clientY]; cv.setPointerCapture(e.pointerId); }; cv.onpointermove=function(e){ if(!drag) return; RM.cube.yaw+=(e.clientX-drag[0])*.008; RM.cube.pitch=Math.max(-1.2,Math.min(1.35,RM.cube.pitch+(e.clientY-drag[1])*.008)); drag=[e.clientX,e.clientY]; }; cv.onpointerup=cv.onpointercancel=function(){ drag=null; };
  $('#rmPlay',el).onclick=function(){ RM.play=!RM.play; if(RM.play&&RM.i>=RM.mvs.length){ RM.cube.jump(RM.mvs,0); RM.i=0; chips(el); } RM.wait=200; syncBtn(el); };
  $('#rmRst',el).onclick=function(){ RM.cube.jump(RM.mvs,0); RM.i=0; RM.wait=600; chips(el); };
  $('#rmBk',el).onclick=function(){ RM.play=false; syncBtn(el); RM.i=Math.max(0,RM.i-1-(RM.cube.anim?0:0)); RM.cube.jump(RM.mvs,RM.i); chips(el); };
  $('#rmFw',el).onclick=function(){ RM.play=false; syncBtn(el); if(RM.cube.anim||RM.i>=RM.mvs.length) return; RM.step=true; RM.wait=0; };
  $('#rmSp',el).onchange=function(){ RM.spd=+this.value; }; $('#rmLp',el).onchange=function(){ RM.loop=this.checked; };
  $('#rmChips',el).onclick=function(e){ var s=e.target.closest('[data-j]'); if(!s) return; RM.play=false; syncBtn(el); RM.i=+s.getAttribute('data-j'); RM.cube.jump(RM.mvs,RM.i); chips(el); };
  $('#rmTabs',el).onclick=function(e){ var b=e.target.closest('[data-rt]'); if(!b) return; var t=b.getAttribute('data-rt'); [].slice.call(el.querySelectorAll('#rmTabs [data-rt]')).forEach(function(x){ x.setAttribute('aria-pressed',x===b); }); [].slice.call(el.querySelectorAll('.rtab')).forEach(function(p){ p.hidden=p.getAttribute('data-rtp')!==t; }); };
  var al=$('#rmAlt',el); if(al) al.onclick=function(){ RM.alt=!RM.alt; al.textContent=RM.alt?'Back to main alg':'Try alternative alg'; loadAlg(el); RM.play=true; syncBtn(el); };
  $('#rmClip',el).onclick=function(){ makeClip(this,k,c,RM.mvs.slice()); };
  $('#rmLn',el).onchange=function(){ mark(RM.id,this.checked); };
  $('#rmPv',el).onclick=function(){ nav(k,c,-1); }; $('#rmNx',el).onclick=function(){ nav(k,c,1); };
  $('#rmClr',el).onclick=function(){ var o=PR(); delete o[RM.id]; CW.setJ('cw_learn_pr',o); padUI(el); $('#rmTm',el).textContent='0.00'; };
  var pad=$('#rmPad',el); pad.addEventListener('pointerdown',function(e){ e.preventDefault(); padDown(el); }); pad.addEventListener('pointerup',function(e){ e.preventDefault(); padUp(el); }); pad.addEventListener('pointercancel',function(){ padUp(el); });
  RM.keys={d:function(e){ if(e.code==='Space'&&!/INPUT|SELECT|TEXTAREA/.test((e.target||{}).tagName||'')){ e.preventDefault(); if(!e.repeat) padDown(el); } },u:function(e){ if(e.code==='Space'){ e.preventDefault(); padUp(el); } }};
  document.addEventListener('keydown',RM.keys.d); document.addEventListener('keyup',RM.keys.u); }


/* ---------- recognition quiz ---------- */
var QZ={k:'pll',all:false,n:0,ok:0,tot:10,q:null,t0:0,times:[],done:false,pend:false};
function qBest(){ var o=CW.lsJ('cw_learn_quiz',{}); return o&&typeof o==='object'&&!Array.isArray(o)?o:{}; }
function qNew(){ var o=PL.learned(), L=D[QZ.k], pool=L.filter(function(c){ return QZ.all||o[key(QZ.k,c)]; }); if(pool.length<4) pool=L;
  var c; do{ c=pool[Math.floor(Math.random()*pool.length)]; }while(QZ.q&&c===QZ.q.c&&pool.length>1);
  var same=L.filter(function(x){ return x!==c&&x.g===c.g; }), rest=L.filter(function(x){ return x!==c&&x.g!==c.g; }), opts=[c];
  while(opts.length<4){ var src=(same.length&&Math.random()<.7)?same:rest.length?rest:same; if(!src.length) break; var x=src.splice(Math.floor(Math.random()*src.length),1)[0]; var i=same.indexOf(x); if(i>=0) same.splice(i,1); i=rest.indexOf(x); if(i>=0) rest.splice(i,1); if(opts.indexOf(x)<0) opts.push(x); }
  opts.sort(function(){ return Math.random()-.5; }); QZ.q={c:c,opts:opts,pick:null}; QZ.t0=performance.now(); }
function qStart(){ QZ.n=0; QZ.ok=0; QZ.times=[]; QZ.done=false; QZ.q=null; qNew(); }
function quiz(){ if(!QZ.q) qStart(); var b=qBest()[QZ.k]||{}, q=QZ.q;
  var head='<div class="row" style="gap:10px;flex-wrap:wrap"><div class="seg" id="qK">'+['oll','pll'].map(function(k){ return '<button type="button" data-k="'+k+'" aria-pressed="'+(QZ.k===k)+'">'+k.toUpperCase()+'</button>'; }).join('')+'</div><span class="sp"></span><button class="btn sm" id="qRush" type="button">⚡ Rush 60s</button><label class="lk row" style="gap:6px"><input type="checkbox" id="qA"'+(QZ.all?' checked':'')+'> Include unlearned</label></div>';
  if(QZ.done){ var avg=QZ.times.length?QZ.times.reduce(function(a,v){ return a+v; },0)/QZ.times.length:0;
    return '<div class="pnl" style="max-width:560px;margin:0 auto">'+head+'<div style="text-align:center;margin:20px 0"><p style="font:800 40px var(--display);margin:0">'+QZ.ok+' / '+QZ.tot+'</p><p class="muted">Average '+(avg/1000).toFixed(2)+' s per case</p><p class="mono muted" style="font-size:13px">Best round: '+(b.ok!=null?b.ok+'/'+QZ.tot+' · '+(b.avg/1000).toFixed(2)+' s':'–')+'</p></div><div class="row" style="justify-content:center"><button class="btn pri" id="qAgain">Play again</button></div></div>'; }
  var pk=q.pick;
  return '<div class="pnl" style="max-width:560px;margin:0 auto">'+head+'<div class="row" style="margin-top:14px"><span class="mono muted" style="font-size:13px">Case '+(QZ.n+1)+' of '+QZ.tot+'</span><span class="sp"></span><span class="mono muted" style="font-size:13px">Score '+QZ.ok+'</span></div>'
   +'<div style="text-align:center;margin:12px 0">'+diag(QZ.k,q.c,200)+'<p class="muted" style="margin:4px 0 0">Which case is this?</p></div>'
   +'<div class="qopts">'+q.opts.map(function(o){ var cl=pk==null?'':o===q.c?' ok':o===pk?' bad':''; return '<button type="button" class="btn qo'+cl+'" data-q="'+String(o.id)+'"'+(pk!=null?' disabled':'')+'>'+esc(title(QZ.k,o))+'</button>'; }).join('')+'</div>'
   +(pk!=null?'<div class="row" style="justify-content:center;margin-top:12px;gap:10px"><code class="rmalg" style="font-size:14px">'+esc(q.c.alg)+'</code></div><div class="row" style="justify-content:center;margin-top:10px"><button class="btn pri" id="qNext">'+(QZ.n+1>=QZ.tot?'See result':'Next')+'</button></div>':'')+'</div>'; }
function qPick(id){ var q=QZ.q; if(q.pick!=null) return; var o=q.opts.filter(function(x){ return String(x.id)===id; })[0]; if(!o) return; q.pick=o; var ms=performance.now()-QZ.t0; if(o===q.c){ QZ.ok++; QZ.times.push(ms); } else QZ.times.push(ms+3000); }
function qNext(){ QZ.n++; if(QZ.n>=QZ.tot){ QZ.done=true; var avg=QZ.times.reduce(function(a,v){ return a+v; },0)/QZ.times.length, B=qBest(), b=B[QZ.k];
    if(!b||QZ.ok>b.ok||(QZ.ok===b.ok&&avg<b.avg)){ B[QZ.k]={ok:QZ.ok,avg:Math.round(avg)}; CW.setJ('cw_learn_quiz',B); CW.toast('New best round!'); }
    if(QZ.ok>0){ CW.toast('+'+PL.addXP(QZ.ok*3)+' XP for the quiz'); } } else qNew(); }

/* ---------- coach ---------- */
function coachData(){ var d=CW.lsJ('cw_timer',{})||{}, L=((d.solves||{})['333']||[]).filter(function(x){ return x&&typeof x.t==='number'; });
  var v=function(x){ return x.p===2?Infinity:x.t+(x.p===1?2000:0); }, ok=L.map(v).filter(function(t){ return t!==Infinity; });
  var mean=function(a){ return a.length?a.reduce(function(s,x){ return s+x; },0)/a.length:null; };
  var last=ok.slice(-25), prev=ok.slice(-50,-25), l50=L.slice(-50), now=Date.now(), wk=L.filter(function(x){ return (x.d||0)>now-7*864e5; }), days={}; wk.forEach(function(x){ days[new Date(x.d).toDateString()]=1; });
  var worst=last.slice().sort(function(a,b){ return b-a; }).slice(0,5), o=PL.learned(), R={n:L.length,avg:mean(last),prev:mean(prev),best:ok.length?Math.min.apply(null,ok):null,
    spread:last.length>=10?mean(worst)/mean(last):null,dnf:l50.length?l50.filter(function(x){ return x.p===2; }).length/l50.length:0,wk:wk.length,days:Object.keys(days).length};
  R.oll=count('oll'); R.pll=count('pll'); R.f2l=count('f2l'); R.oll2=D.oll.filter(function(c){ return c.id>=21&&c.id<=27&&o[key('oll',c)]; }).length; R.pll2=D.pll.filter(function(c){ return c.two&&o[key('pll',c)]; }).length;
  var S=sr(), miss=[]; Object.keys(S).forEach(function(k){ if(S[k][0]===0) miss.push(k); }); R.miss=miss.slice(0,6);
  var P=PR(), sl=[]; Object.keys(P).forEach(function(k){ var a=aoOf(P[k],Math.min(5,P[k].length)); if(a!=null&&P[k].length>=3) sl.push([k,a]); }); sl.sort(function(a,b){ return b[1]-a[1]; }); R.slow=sl.slice(0,3);
  R.q=qBest(); return R; }
function nice(k){ var p=k.split('-'); return p[0]==='pll'?p[1]+' perm':p[0].toUpperCase()+' '+p[1]; }
function sec(ms){ return ms==null?'–':(ms/1000).toFixed(1)+' s'; }
function coachTips(R){ var t=[];
  if(R.n<10){ t.push(['Start with 10 solves','Do at least 10 timed 3×3 solves in the Timer. The coach needs them to see where you are.']); }
  else {
    var a=R.avg; t.push(['Where you are','Your last 25 solves average '+sec(a)+' and your best is '+sec(R.best)+'.'+(R.prev?' Compared with the 25 before, you are '+(a<R.prev?'faster by '+((R.prev-a)/1000).toFixed(1)+' s.':'slower by '+((a-R.prev)/1000).toFixed(1)+' s. That is normal while you learn new algs.'):'')]);
    if(R.spread&&R.spread>1.45) t.push(['Your slow solves cost you','Your five slowest recent solves are '+Math.round((R.spread-1)*100)+'% slower than your average. Look at what happens in those: usually a missed pair in F2L or a pause before the last layer. Slow down and look ahead on those.']);
    if(R.dnf>.06) t.push(['Too many DNFs','About '+Math.round(R.dnf*100)+'% of your recent solves are DNF. Speed matters less than clean solves right now. Aim for solves with no mistakes first.']); }
  if(R.f2l<12&&(R.avg==null||R.avg>35000)) t.push(['Focus: F2L','Only '+R.f2l+' of 41 F2L cases ticked. At your pace F2L is the biggest saving. Learn 3 to 5 cases a week and drill them in the case rooms.']);
  else if(R.oll2<7) t.push(['Focus: 2-look OLL','You have '+R.oll2+' of the 7 corner OLL cases (OLL 21 to 27) ticked. Finish those, then the three edge algs, and you can solve the top in two looks every time.']);
  else if(R.pll2<7) t.push(['Focus: 2-look PLL','You have '+R.pll2+' of the 7 two-look PLLs ticked (Aa, Ab, Y, Ua, Ub, H, Z). Finish them and every last layer becomes at most two algs.']);
  else if(R.oll<20) t.push(['Next step: full OLL','Your 2-look sets are done. Start the full OLL with the cases that save the most time: the 7 corner cases plus the line and L-shape cases. '+R.oll+' of 57 ticked so far.']);
  else if(R.pll<21) t.push(['Next step: full PLL','You know '+R.pll+' of 21 PLLs. The common ones first: T, J, R, F, N, G perms.']);
  else t.push(['Polish','You have the whole library ticked. Now speed comes from recognition and lookahead: use the quiz and keep your weakest cases at the top of your drills.']);
  if(R.miss.length) t.push(['Cases you miss in the drill',R.miss.map(nice).join(', ')+'. Open each in its case room and do 10 slow reps, then the timer pad.']);
  if(R.slow.length) t.push(['Slowest cases in practice',R.slow.map(function(s){ return nice(s[0])+' ('+sec(s[1])+')'; }).join(', ')+'. These take the longest to execute, so work on finger tricks for them.']);
  var qs=Object.keys(R.q).map(function(k){ return k.toUpperCase()+' '+R.q[k].ok+'/10'; }); if(qs.length) t.push(['Recognition','Best quiz rounds: '+qs.join(', ')+'. Under 10/10 means you still hesitate on some diagrams; keep quizzing.']);
  if(R.n>=10) t.push(['Volume this week',R.wk+' solves on '+R.days+' day'+(R.days===1?'':'s')+'. '+(R.wk<50?'Aim for around 20 solves a day, even in short sessions.':'Good volume. Keep it up.')]);
  return t; }
function coachStats(R){ var L=[]; L.push('3x3 solves total: '+R.n+'. Last 25 average: '+sec(R.avg)+'. Previous 25 average: '+sec(R.prev)+'. Best single: '+sec(R.best)+'.');
  if(R.spread) L.push('Five slowest of last 25 are '+R.spread.toFixed(2)+'x the average. DNF rate in last 50: '+Math.round(R.dnf*100)+'%.');
  L.push('Solves in the last 7 days: '+R.wk+' over '+R.days+' days.'); L.push('Learned: F2L '+R.f2l+'/41, OLL '+R.oll+'/57 (corner 2-look cases '+R.oll2+'/7), PLL '+R.pll+'/21 (2-look PLLs '+R.pll2+'/7).');
  if(R.miss.length) L.push('Cases missed in drill: '+R.miss.map(nice).join(', ')+'.'); if(R.slow.length) L.push('Slowest practice cases: '+R.slow.map(function(s){ return nice(s[0])+' '+sec(s[1]); }).join(', ')+'.');
  var qs=Object.keys(R.q).map(function(k){ return k+' '+R.q[k].ok+'/10'; }); if(qs.length) L.push('Best recognition quiz rounds: '+qs.join(', ')+'.'); var SP=splitData(); if(SP) L.push('Share of solve time by step (last '+SP.n+' split solves): '+SPN.map(function(n,i){ return n+' '+Math.round(SP.pct[i])+'% ('+sec(SP.avg[i])+')'; }).join(', ')+'.'); return L.join(' '); }
function localPlan(R){ var L=[], f=R.n<10?'You are just getting started':'Your last 25 solves average '+sec(R.avg)+(R.best?' and your best is '+sec(R.best):'');
  var big; if(R.n<10) big='do 10 timed solves so I can see where you are.'; else if(R.f2l<12&&R.avg>35000) big='F2L, which is where most of your time goes at this speed.'; else if(R.oll2<7) big='the 2-look OLL corner cases (OLL 21 to 27).'; else if(R.pll2<7) big='the 2-look PLL algs.'; else if(R.spread&&R.spread>1.45) big='your slow solves, which are much slower than your average.'; else if(R.miss.length) big='the cases you keep missing in drills.'; else big='lookahead and recognition now that you know the sets.';
  L.push(f+'. The biggest thing to work on this week: '+big);
  var st=[]; if(R.n<10) st.push('Do 10 timed 3×3 solves in the Timer, with a fresh scramble each time.'); 
  if(R.f2l<12&&R.avg>35000) st.push('Learn 3 to 5 new F2L cases. Open each in its case room and do 10 slow reps, then use the timer pad.'); else if(R.oll2<7) st.push('Tick off the OLL corner cases you are missing, two a day, using the case rooms and the timer pad.'); else if(R.pll2<7) st.push('Learn the 2-look PLLs you are missing: Aa, Ab, Y, Ua, Ub, H, Z. One a day, 10 reps each.'); else st.push('Pick 3 cases you are weakest at and do 10 reps of each every day in the case rooms.');
  if(R.miss.length) st.push('Drill these missed cases first: '+R.miss.slice(0,4).map(nice).join(', ')+'.'); else if(R.slow.length) st.push('Work on the finger tricks for your slowest cases: '+R.slow.map(function(x){ return nice(x[0]); }).join(', ')+'.'); else st.push('Do the Drill and Quiz tabs for 5 minutes each day to find the cases you hesitate on.');
  st.push('Do about 20 timed solves a day. '+(R.wk<50?'You did '+R.wk+' this past week, so there is room to build up.':'You did '+R.wk+' this past week, so keep that pace.'));
  st.push('On the weekend, do one 25-solve session with no stopping and compare your average with '+(R.avg?sec(R.avg):'this week')+'.');
  st.slice(0,4).forEach(function(x,i){ L.push((i+1)+'. '+x); }); return L.join('\n'); }
var CO={ai:null,left:0,text:null,busy:false};
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function coachScores(R){ var q=R.q||{}, ks=Object.keys(q), rec=ks.length?ks.reduce(function(a,k){ return a+q[k].ok/10; },0)/ks.length*100:0;
  return [['Speed',R.avg==null?0:clamp(100-(R.avg-9000)/(85000-9000)*100,0,100)],['Steady',R.spread==null?40:clamp(100-(R.spread-1)*160,0,100)],['F2L',R.f2l/41*100],['OLL',R.oll/57*100],['PLL',R.pll/21*100],['Recall',rec],['Volume',clamp(R.wk/100*100,0,100)]]; }
function radarSvg(sc){ var C=110,Rr=84,n=sc.length,pt=function(i,v){ var a=-Math.PI/2+i*2*Math.PI/n; return [C+Math.cos(a)*Rr*v/100,C+Math.sin(a)*Rr*v/100]; }, g='';
  [25,50,75,100].forEach(function(r){ g+='<polygon points="'+sc.map(function(_,i){ return pt(i,r).map(function(x){ return x.toFixed(1); }).join(','); }).join(' ')+'" fill="none" stroke="currentColor" stroke-opacity=".14"/>'; });
  sc.forEach(function(_,i){ var p=pt(i,100); g+='<line x1="'+C+'" y1="'+C+'" x2="'+p[0].toFixed(1)+'" y2="'+p[1].toFixed(1)+'" stroke="currentColor" stroke-opacity=".12"/>'; });
  g+='<polygon points="'+sc.map(function(s,i){ return pt(i,Math.max(4,s[1])).map(function(x){ return x.toFixed(1); }).join(','); }).join(' ')+'" fill="var(--blue)" fill-opacity=".28" stroke="var(--blue)" stroke-width="2" stroke-linejoin="round"/>';
  sc.forEach(function(s,i){ var p=pt(i,Math.max(4,s[1])), l=pt(i,122); g+='<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="3" fill="var(--blue)"/><text x="'+l[0].toFixed(1)+'" y="'+(l[1]+4).toFixed(1)+'" text-anchor="middle" font-size="10.5" font-weight="700" fill="currentColor" fill-opacity=".7">'+s[0]+'</text>'; });
  return '<svg viewBox="-16 0 252 220" width="100%" style="max-width:280px;color:var(--ink)" role="img" aria-label="Skill radar">'+g+'</svg>'; }
function sparkSvg(){ var d=CW.lsJ('cw_timer',{})||{}, L=((d.solves||{})['333']||[]).slice(-50), v=L.map(function(x){ return x.p===2?null:x.t+(x.p===1?2000:0); }); var ok=v.filter(function(x){ return x!=null; }); if(ok.length<3) return '<p class="muted" style="font-size:13px">Do a few more 3×3 solves to see your trend.</p>';
  var mn=Math.min.apply(null,ok),mx=Math.max.apply(null,ok),W=300,H=90,px=function(i){ return 6+i*(W-12)/Math.max(1,v.length-1); },py=function(t){ return 8+(1-(t-mn)/Math.max(1,mx-mn))*(H-16); }, pts=[],dots='';
  v.forEach(function(t,i){ if(t==null) return; pts.push(px(i).toFixed(1)+','+py(t).toFixed(1)); if(t===mn) dots+='<circle cx="'+px(i).toFixed(1)+'" cy="'+py(t).toFixed(1)+'" r="4" fill="#f2b600" stroke="#fff" stroke-width="1.5"/>'; });
  var av=ok.reduce(function(a,x){ return a+x; },0)/ok.length;
  return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="Solve times"><line x1="6" x2="'+(W-6)+'" y1="'+py(av).toFixed(1)+'" y2="'+py(av).toFixed(1)+'" stroke="currentColor" stroke-opacity=".25" stroke-dasharray="4 4"/><polyline points="'+pts.join(' ')+'" fill="none" stroke="var(--blue)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>'+dots+'</svg><div class="row" style="justify-content:space-between;font-size:12px" ><span class="muted">Last '+v.length+' solves</span><span class="muted">★ best '+sec(mn)+' · dashed = average</span></div>'; }
function levelOf(R){ if(R.n<10||R.avg==null) return ['Newcomer','Do 10 solves to get your level']; var a=R.avg/1000; return a>60?['Beginner','Under a minute is the first goal']:a>40?['Learner','Sub-40 is next']:a>25?['Improver','Sub-25 is next']:a>15?['Advanced','Sub-15 is next']:['Elite','Chasing records']; }
function cubeLogo(){ return '<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true"><defs><linearGradient id="cxg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f7bff"/><stop offset="1" stop-color="#7a5cff"/></linearGradient></defs><rect x="6" y="6" width="52" height="52" rx="15" fill="url(#cxg)"/><path d="M32 14l15 8.5v17L32 48l-15-8.5v-17z" fill="#fff" fill-opacity=".18" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/><path d="M17 22.5L32 31l15-8.5M32 31v17" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/><circle cx="26" cy="29" r="2.2" fill="#fff"/><circle cx="38" cy="29" r="2.2" fill="#fff"/></svg>'; }
function planHtml(text,day){ var ck=CW.lsJ('cw_coach_chk',{}); if(ck.day!==day) ck={day:day,i:{}}; var lines=String(text).split(/\n+/).filter(Boolean), out='', k=0;
  lines.forEach(function(l){ var m=/^\s*(\d+)[.)]\s*(.+)$/.exec(l); if(m){ out+='<label class="coStep'+(ck.i[k]?' on':'')+'"><input type="checkbox" data-ck="'+k+'"'+(ck.i[k]?' checked':'')+'><span>'+esc(m[2])+'</span></label>'; k++; } else out+='<p class="coIntro">'+esc(l)+'</p>'; }); return out; }
function trainLinks(R){ var o=[], seen={}; R.miss.concat(R.slow.map(function(x){ return x[0]; })).forEach(function(id){ if(seen[id]) return; seen[id]=1; var p=id.split('-'); if(D[p[0]]) o.push('<a class="btn sm" href="#learn/'+p[0]+'/'+p[1]+'">'+esc(nice(id))+'</a>'); });
  return '<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:6px">'+o.slice(0,5).join('')+'<a class="btn sm" href="#learn/quiz">Recognition quiz</a><a class="btn sm" href="#learn/drill">Drill</a></div>'; }
/* ---- Cubexer chat ---- */
var CX={m:null,busy:false,pend:null,ql:null,again:null};
function cxMsgs(){ if(!CX.m){ var a=CW.lsJ('cw_cx',[]); CX.m=Array.isArray(a)?a.filter(function(x){ return x&&typeof x.t==='string'; }).slice(-30):[]; } return CX.m; }
function cxSave(){ CW.setJ('cw_cx',cxMsgs().slice(-30)); }
function findCase(q){ var m, s=q.toLowerCase(), k=null, id=null;
  if((m=s.match(/\boll\s*#?\s*(\d{1,2})\b/))){ k='oll'; id=+m[1]; }
  else if((m=s.match(/\bf2l\s*#?\s*(\d{1,2})\b/))){ k='f2l'; id=+m[1]; }
  else if((m=s.match(/\b(aa|ab|ga|gb|gc|gd|ja|jb|na|nb|ra|rb|ua|ub|[efhtvyz])[\s-]*perm\b/))||(m=s.match(/\b(?:pll|perm)\s+(aa|ab|ga|gb|gc|gd|ja|jb|na|nb|ra|rb|ua|ub|[efhtvyz])\b/))){ k='pll'; id=m[1]; }
  if(!k) return null; var c=D[k].filter(function(x){ return String(x.id).toLowerCase()===String(id).toLowerCase(); })[0]; return c?{k:k,c:c}:null; }
function caseReply(h){ var o=PL.learned(), on=!!o[key(h.k,h.c)], ex=''; try{ ex=explainLocal(h.c.alg)[0]||''; }catch(e){}
  return {t:title(h.k,h.c)+': '+h.c.alg+'. '+(ex?ex+' ':'')+(on?'You have this one ticked as learned.':'You have not ticked this one yet.'),a:[['Open '+title(h.k,h.c)+' in 3D','#learn/'+h.k+'/'+h.c.id]],n:['What should I learn next?','How do I get faster at it?','Quiz me']}; }
var NICK=[[/\banti[\s-]?sune\b/,"Anti-sune is R U2 R' U' R U' R'. It is the mirror partner of sune and fixes the one-corner-oriented OLL case that sune cannot."],[/\bsune\b/,"Sune is R U R' U R U2 R'. It twists three corners, and it is the most useful short OLL alg you can learn."],[/\bsexy\s*move\b|\bsexy\b/,"The sexy move is R U R' U'. It shows up inside F2L, OLL and PLL algs, so get it fast and smooth first."],[/\bsledge\s*hammer\b/,"Sledgehammer is R' F R F'. Use it to flip or place pieces in F2L and in several OLLs."]];
function sub(n){ var T={60:'Learn the full CFOP idea: cross, F2L pairs, then 2-look OLL and PLL. Your first aim is to stop pausing between steps.',30:'Solve F2L pairs without rotating the cube much, learn the 2-look OLL and PLL algs, and start looking ahead during the cross.',20:'Learn most F2L cases and the 2-look OLL/PLL with fast fingers. Plan the cross fully in inspection.',15:'Move towards full PLL and as much OLL as you can, plus steady lookahead. Pauses matter more than turn speed now.',10:'Full OLL and PLL, cross plus the first pair planned in inspection, and about 8 turns per second with almost no pauses.',8:'Efficient F2L with few rotations, full algs with perfect execution, and consistent lookahead. This is advanced training.'}, ks=[60,30,20,15,10,8], pick=ks.filter(function(x){ return x>=n; }).pop()||8; return T[pick]; }
var HEALTH=[
 [/\b(catch|catches|catching|snag|snags|locks? up|lockups?|jam|jams|jamming|sticks?)\b/,'A cube that catches usually has dust, too little lube, or tension that is too tight. Turn slowly to find which layer catches, wipe the cube, add a small drop of lube there, and loosen the tension a quarter turn if your cube has adjustable screws. Test again before changing anything else.',['It feels gritty','It feels too stiff','It pops a lot']],
 [/\b(pop|pops|popping|popped|explod|falls apart|loose|too loose|wobbl)\w*\b/,'Popping means the tension is too loose or the pieces are worn. Tighten each tension screw the same small amount (a quarter turn), turn the cube a few times, and check again. If a piece keeps popping out, look for a cracked or worn piece.',['It catches','It feels too stiff','What lube should I use?']],
 [/\b(gritty|crunchy|scratchy|rough|loud|noisy|dirty|dust)\b/,'A gritty or noisy cube is usually dirty. Wipe it, then take it apart, wash the pieces in warm soapy water, dry them completely, and re-lube lightly. Skip the lube on parts you cannot reach and do not soak the cube.',['How much lube?','It feels too stiff']],
 [/\b(stiff|tight|too tight|hard to turn|heavy|sticky|slow cube|feels slow|slow after)\b/,'A stiff cube usually has tension too tight, thick lube, or too much lube. Loosen the tension a quarter turn, wipe off any excess, and give it a few hundred turns to break in. If it is still sticky, clean it and re-lube with less.',['It catches','How much lube?']],
 [/\b(corner twist|corner twists|twisting|twisted corner|corners? (twist|turn))\w*\b/,'Corner twisting means the tension is too loose or the corners are worn. Tighten the tension a little. If a corner still twists on its own, a piece may be cracked and need replacing.',['It pops a lot','It catches']],
 [/\b(how much lube|how often lube|what lube|which lube|lube)\b/,'Use a thin silicone-based speedcube lube. A few drops on the inner faces of the pieces is plenty, then turn the cube to spread it and wipe the outside. More lube is not better, it makes a cube slow and sticky.',['It feels too stiff','It catches']],
 [/\b(cube (is )?(broken|damaged|health|problem|issue)|something wrong with my cube|my cube (is|has|keeps|feels)|problem with my cube)\b/,'Tell me what the cube does, for example catches, pops, feels gritty, feels stiff, or twists a corner, and I will give you a short fix list. Check one thing at a time so you know what helped.',['It catches','It pops a lot','It feels gritty','It feels too stiff']]];
var KB=[[/\b(nervous|nerves|freez|choke|pressure|anxious|scared|compet|stage|shak)/,'Nerves are normal and they are trainable. Use the 15 seconds of inspection as a routine: breathe out slowly, plan the cross, then start. Practise with people watching so the feeling becomes familiar, and treat one bad solve as data, not a verdict.',['How do I practise under pressure?','What should I do in inspection?','Plan my week']],
 [/\b(inspection|inspect|15 seconds)\b/,'In the 15 seconds, plan the whole cross, and when you can, the first F2L pair as well. Fixing your eyes on the cube and not touching it until you have the plan stops pauses after the first step.',['What is lookahead?','How do I plan the cross?']],
 [/\b(look ?ahead)\b/,'Lookahead means finding the next pair or case while your hands finish the current one. Slow down your turning on purpose and keep your eyes one step ahead. A smooth 20 s with no pauses beats a jerky 15 s.',['Drill me on cases','How do I get faster?']],
 [/\bcross\b/,'Solve the cross on the bottom and plan it fully in inspection. It always takes 8 moves or fewer. Practise cross on the bottom so you can see the F2L pairs while you do it.',['What is F2L?','What is lookahead?']],
 [/\bf2l\b|first two layers/,'F2L builds the first two layers by pairing a corner with its edge and inserting them together. There are 41 cases, and you can learn them as three ideas: pair it up, then insert. Learn a few new cases a week and avoid rotating the cube.',['What should I learn next?','Show me F2L 1']],
 [/\b(2[\s-]?look)\b/,'2-look OLL: make the yellow cross first, then fix the corners with the seven corner algs (OLL 21 to 27). 2-look PLL: place the corners (A-perm Aa/Ab or Y-perm), then the edges (U-perms, H or Z). Together that is only 14 algs or so.',['What should I learn next?','Show me OLL 21']],
 [/\boll\b|orient/,'OLL orients the last layer so the whole top face is one colour. There are 57 cases. Start with 2-look OLL (the cross, then the corner cases 21 to 27) and add full OLL later.',['What is 2-look OLL?','What should I learn next?']],
 [/\bpll\b|permut/,'PLL permutes the last layer pieces after OLL. There are 21 cases. Start with the seven 2-look PLLs (Aa, Ab, Y, Ua, Ub, H, Z), then add the rest.',['What is 2-look PLL?','What should I learn next?']],
 [/\b(finger ?trick|fingertrick|grip|tps|turns per second)\b/,'Use your right index for U moves and your ring/middle for R and F. Keep your wrists relaxed and your turns round, not stabby. Practise the sexy move R U R\' U\' until it feels like one motion.',['Teach me the sexy move','Plan my week']],
 [/\b(cube case|carry case|carrying case|storage|store my cube|carry my cube|drawer|cube holder|cube box|keep my cube)\b/,'Your cube deserves better than a drawer. MagLev is built around 57 mm speedcubes, with eighteen magnets: the elevator floats and the lid snaps shut.',['What should I learn next?','How am I doing?'],[['See MagLev','/']]],
 [/\b(lube|lubric|which cube|what cube|buy a cube|best cube|magnet)\b/,'For speedcubing look for a magnetic 3x3 around 55 to 57 mm that feels smooth to you. A drop of speedcube silicone lube makes a big difference, and a light cube feels faster to many people. Try before you chase brands.',['How do I get faster?','How am I doing?']],
 [/\b(average|ao5|ao12|ao25|mean)\b/,'An ao5 drops your best and worst of the last five solves and averages the middle three, so one bad solve does not ruin it. Judge yourself by ao12 and ao25 and not by one lucky single.',['How am I doing?','Plan my week']],
 [/\b(dnf|\+2|penalty)\b/,'A +2 is a 2-second penalty, and DNF means did not finish. In the timer, tag a solve that ends with a slightly misaligned layer as +2, and a solve that was not solved as DNF.',['How do I stop popping?','How am I doing?']],
 [/\b(practice|practise|routine|how often|train|daily)\b/,'Do about 20 timed solves a day, then 10 to 15 minutes on the algs you know least. Once a week do a 25-solve session with no stopping and compare the average.',['Plan my week','Drill me on cases']],
 [/\b(beginner|start|new to|how do i learn|learn cubing)\b/,'Start with the Guide tab to learn CFOP: cross, F2L, OLL, PLL. First get a slow, reliable solve, then use the case rooms to learn one new thing a day.',['What is F2L?','What should I learn next?'],[['Open the Guide','#learn/guide']]],
 [/\b(faster|speed up|improve|get better|plateau|stuck)\b/,'The fastest gains come from fewer pauses, not faster fingers. Slow your turning a little, look ahead during every step, and learn the cases you stop on most. Then time yourself with an ao12.',['What is lookahead?','Plan my week','How am I doing?']],
 [/^(hi|hello|hey|yo|assalam|salam|hai)\b/,'Hi! I am Cubexer, your cubing coach. Ask me about your progress, what to learn next, an alg like T perm or OLL 21, or nerves before a competition.',['How am I doing?','What should I learn next?','Plan my week']],
 [/\b(thanks|thank you|terima kasih|tq|ty)\b/,'Anytime. Go and do some solves.',['Plan my week','Drill me on cases']],
 [/\b(who are you|what can you do|help)\b/,'I am Cubexer. I read your timer solves, ticks, drills and quizzes. I can tell you how you are doing, what to learn next, look up any OLL, PLL or F2L case, build a weekly plan, and answer cubing questions.',['How am I doing?','What should I learn next?','Plan my week']]];
KB=HEALTH.concat(KB);
function nextLearn(R){ var o=PL.learned(), un=function(k,f){ return D[k].filter(function(c){ return !o[key(k,c)]&&(!f||f(c)); })[0]; }, h=null, why='';
  if(R.n<10) return {t:'First do 10 timed solves in the Timer so I can see your level, then I will pick your next case.',a:[],n:['What is CFOP?','How do I get faster?']};
  if(R.avg>35000&&R.f2l<12){ var f=un('f2l'); if(f){ h={k:'f2l',c:f}; why='F2L is where most of your time goes at this speed.'; } }
  if(!h){ var c1=un('oll',function(c){ return c.id>=21&&c.id<=27; }); if(c1){ h={k:'oll',c:c1}; why='the 2-look OLL corner cases come first.'; } }
  if(!h){ var c2=un('pll',function(c){ return c.two; }); if(c2){ h={k:'pll',c:c2}; why='the 2-look PLLs come next.'; } }
  if(!h){ var f3=un('f2l'); if(f3){ h={k:'f2l',c:f3}; why='you have the 2-look algs, so F2L is the biggest win now.'; } }
  if(!h){ var c4=un('oll'); if(c4){ h={k:'oll',c:c4}; why='you are ready for full OLL.'; } }
  if(!h){ var c5=un('pll'); if(c5){ h={k:'pll',c:c5}; why='you are ready for full PLL.'; } }
  if(!h) return {t:'You have ticked every case. Now it is about lookahead and consistency: do 25-solve sessions and work on the cases that slow you down.',a:[['Drill','#learn/drill']],n:['How do I get faster?','Plan my week']};
  return {t:'Next up: '+title(h.k,h.c)+' ('+h.c.alg+'). Why: '+why,a:[['Open '+title(h.k,h.c)+' in 3D','#learn/'+h.k+'/'+h.c.id]],n:['Why is that one useful?','Drill me on cases']}; }
function statsReply(R){ var lv=levelOf(R); if(R.n<3) return {t:'I have seen only '+R.n+' timed solves so far. Do 10 in the Timer and I can give you a real read.',a:[],n:['What is CFOP?','How do I get faster?']};
  var tr=R.prev&&R.avg?(R.avg<R.prev?'You are getting faster: your last 25 average '+sec(R.avg)+' beats the 25 before ('+sec(R.prev)+').':'Your last 25 average is '+sec(R.avg)+', compared with '+sec(R.prev)+' for the 25 before.'):'Your last 25 average is '+sec(R.avg)+'.', w=R.slow&&R.slow[0]?' Your slowest case on the pad is '+nice(R.slow[0][0])+'.':'';
  return {t:lv[0]+' level. '+tr+' Best single '+sec(R.best)+', '+R.wk+' solves this week on '+R.days+' days.'+w+(R.spread&&R.spread>1.45?' Your slowest solves are much slower than your average, so work on those.':''),a:[],n:['What should I learn next?','Plan my week','How do I get faster?']}; }
function cxLocal(q,R){ var s=q.toLowerCase().trim();
  if(CXK[s]){ var sk=CXK[s], hk=keyCase(sk[0]); if(hk){ var r0=caseReply(hk); r0.t='This is one of your slowest cases in practice ('+sec(sk[1])+' on average). '+r0.t+' Memory trick: '+memTrick(hk.c)+' Do 10 slow, clean reps in the Practice tab, then speed up.'; return r0; } }
  var h=findCase(s); if(h) return caseReply(h);
  for(var i=0;i<NICK.length;i++) if(NICK[i][0].test(s)) return {t:NICK[i][1],a:[],n:['What should I learn next?','How do I get faster?']};
  var sb=s.match(/\bsub[\s-]?(\d{1,2})\b/); if(sb) return {t:'Sub-'+sb[1]+': '+sub(+sb[1]),a:[],n:['How am I doing?','Plan my week']};
  if(/\b(how am i|my (stats|progress|average|level|times)|how.*doing|am i improving)\b/.test(s)) return statsReply(R);
  if(/\b(learn next|study next|what.*(learn|study|work on)|which (oll|pll|alg|case))\b/.test(s)) return nextLearn(R);
  if(/\b(plan|week)\b/.test(s)) return {t:'Building your plan now. It will appear just below this chat.',plan:true,a:[],n:[]};
  if(/\b(weak|keep (missing|forgetting|getting wrong)|forgot|forget|what do i miss|struggl|review)\b/.test(s)){ var W=weakList(); if(!W.length) return {t:'You have no missed cases saved yet. Use Drill: when you tap Missed it, I will remember the case and give you a memory trick for it here.',a:[['Open Drill','#learn/drill']],n:['What should I learn next?']}; return {t:'Your weakest cases right now: '+W.map(function(w){ return title(w.k,w.c)+' (missed '+w.n+'×)'; }).join(', ')+'. For '+title(W[0].k,W[0].c)+': '+memTrick(W[0].c),a:[['Review in Drill','#learn/drill'],['Open '+title(W[0].k,W[0].c),'#learn/'+W[0].k+'/'+W[0].c.id]],n:['What should I learn next?','Plan my week']}; }
  if(/\b(drill|quiz|test me)\b/.test(s)) return {t:'Drill makes you recall the alg for a case, and the quiz trains recognition. Do about 5 minutes of each a day.',a:[['Open Drill','#learn/drill'],['Open Quiz','#learn/quiz']],n:['What should I learn next?']};
  for(var j=0;j<KB.length;j++) if(KB[j][0].test(s)) return {t:KB[j][1],a:KB[j][3]||[],n:KB[j][2]||[]};
  return null; }
var CXK={};
function keyCase(kk){ var k=String(kk).split('-')[0], id=String(kk).slice(k.length+1), c=D[k]&&D[k].filter(function(x){ return String(x.id)===id; })[0]; return c?{k:k,c:c}:null; }
function cxChips(R){ var c=['How am I doing?','What should I learn next?','Plan my week']; if(R.slow&&R.slow[0]){ var hc=keyCase(R.slow[0][0]), lb='Tips for '+(hc?(isPk(hc.k)?(hc.k==='cll'?'2×2 ':hc.k.toUpperCase()+' '):'')+title(hc.k,hc.c):nice(R.slow[0][0])); CXK[lb.toLowerCase()]=R.slow[0]; c.push(lb); } c.push('How do I get faster?','I get nervous in competitions'); return c; }
function cxHtml(m,live){ var b='<div class="cxM '+(m.r==='u'?'u':'c')+'">'+(m.r==='c'?'<span class="cxAv">'+cubeLogo()+'</span>':'')+'<div class="cxB"><div class="cxT"'+(live?' id="cxLive"':'')+'>'+esc(live?'':m.t).replace(/\n/g,'<br>')+'</div>';
  if(m.a&&m.a.length&&!live) b+='<div class="cxA">'+m.a.map(function(x){ return x[1].charAt(0)==='q'&&x[1].charAt(1)===':'?'<button class="btn sm" data-cxq="'+esc(x[1].slice(2))+'">'+esc(x[0])+'</button>':'<a class="btn sm" href="'+esc(x[1])+'">'+esc(x[0])+'</a>'; }).join('')+'</div>';
  return b+'</div></div>'; }
function cxPaint(el,liveIdx){ var log=$('#cxLog',el); if(!log) return; var M=cxMsgs(); log.innerHTML=M.map(function(m,i){ return cxHtml(m,i===liveIdx); }).join('')+(CX.busy?'<div class="cxM c"><span class="cxAv">'+cubeLogo()+'</span><div class="cxB"><div class="cxT cxDots"><i></i><i></i><i></i></div></div></div>':''); log.scrollTop=log.scrollHeight; }
function cxChipsPaint(el,list){ var c=$('#cxChips',el); if(!c) return; c.innerHTML=list.slice(0,4).map(function(x){ return '<button class="cxChip" type="button" data-cxq="'+esc(x)+'">'+esc(x)+'</button>'; }).join(''); }
function cxReply(el,r){ var M=cxMsgs(), m={r:'c',t:r.t,a:r.a||[]}; M.push(m); cxSave(); var i=M.length-1; cxPaint(el,i); var node=$('#cxLive',el), n=m.t.length, p=0, log=$('#cxLog',el);
  var done=function(){ CX.busy=false; if(document.body.contains(el)){ cxPaint(el); cxChipsPaint(el,r.n&&r.n.length?r.n:cxChips(coachData())); var f=$('#cxIn',el); if(f) f.disabled=false; } };
  if(!node){ done(); return; } var tm=setInterval(function(){ if(!document.body.contains(node)){ clearInterval(tm); CX.busy=false; return; } p+=Math.max(2,Math.ceil(n/55)); if(p>=n){ clearInterval(tm); done(); if(r.plan&&CX.again) coachAsk(CX.again); return; } node.innerHTML=esc(m.t.slice(0,p)).replace(/\n/g,'<br>')+'<span class="coCur">▍</span>'; if(log) log.scrollTop=log.scrollHeight; },24); }
async function cxSend(el,q){ q=String(q||'').trim().slice(0,240); if(!q||CX.busy) return; var R=coachData(), M=cxMsgs(); M.push({r:'u',t:q}); cxSave(); CX.busy=true; var f=$('#cxIn',el); if(f){ f.value=''; f.disabled=true; } cxChipsPaint(el,[]); cxPaint(el);
  var loc=cxLocal(q,R); if(loc){ setTimeout(function(){ if(!document.body.contains(el)){ CX.busy=false; return; } cxReply(el,loc); },380); return; }
  if(CO.ai){ var hist=M.slice(-7,-1).map(function(x){ return {r:x.r,t:x.t}; }); var r=await CW.call('/api/coach',{id:CW.devId(),stats:coachStats(R),q:q,h:hist},25000);
    if(!document.body.contains(el)){ CX.busy=false; return; }
    if(r.ok&&r.data&&r.data.text){ if(r.data.ql!=null) CX.ql=r.data.ql; cxLeft(el); cxReply(el,{t:r.data.text,a:[],n:r.data.next||[]}); return; }
    var er=(r.data&&r.data.error)||'I could not reach the AI just now.'; if(r.data&&r.data.ql===0) CX.ql=0; cxLeft(el); cxReply(el,{t:er+' Here is what I can answer right away.',a:[],n:cxChips(R)}); return; }
  cxReply(el,{t:'I am not sure about that one. I can answer questions about F2L, OLL, PLL, inspection, nerves, goals like sub-20, any case like T perm or OLL 21, how you are doing, and what to learn next.',a:[],n:cxChips(R)}); }
function cxLeft(el){ var l=$('#cxLeft',el); if(l) l.textContent=CO.ai?(CX.ql!=null?CX.ql+' AI answers left today. Quick answers are unlimited.':'Quick answers are unlimited.'):'Quick answers are unlimited.'; }
function cxMount(el,again){ var box=$('#cx',el); if(!box) return; CX.again=again; var R=coachData(), M=cxMsgs();
  if(!M.length){ var lv=levelOf(R); M.push({r:'c',t:'Hi, I am Cubexer. '+(R.n>=3?lv[0]+' level, last 25 average '+sec(R.avg)+'. ':'I have not seen many solves yet. ')+'Ask me anything about cubing, or tap a suggestion.',a:[]}); cxSave(); }
  cxPaint(el); cxChipsPaint(el,cxChips(R)); cxLeft(el);
  var f=$('#cxF',el); if(f) f.onsubmit=function(e){ e.preventDefault(); var i=$('#cxIn',el); cxSend(el,i&&i.value); };
  box.onclick=function(e){ var t=e.target.closest('[data-cxq]'); if(t){ e.stopPropagation(); cxSend(el,t.getAttribute('data-cxq')); return; } if(e.target.closest('#cxClr')){ e.stopPropagation(); CX.m=[]; cxSave(); CX.busy=false; cxMount(el,again); } };
  if(CX.pend){ var q=CX.pend; CX.pend=null; setTimeout(function(){ cxSend(el,q); },300); } }
function coach(){ var R=coachData(), tips=coachTips(R), day=Math.floor((Date.now()+8*36e5)/864e5), c=CW.lsJ('cw_coach_ai',null); if(c&&c.day===day&&!CO.text) CO.text=c.text; var lv=levelOf(R), sc=coachScores(R);
  var head='<div class="coHero"><div class="coLogo">'+cubeLogo()+'</div><div style="min-width:0"><div class="row" style="gap:8px;flex-wrap:wrap"><b class="coName">Cubexer</b><span class="coBadge">'+esc(lv[0])+'</span><span class="coAi'+(CO.ai?' on':'')+'">'+(CO.ai?'● AI coach':'● Quick coach')+'</span></div><p class="muted" style="margin:2px 0 0;font-size:14px">'+esc(lv[1])+'. I read your solves, drills and quizzes and plan your week.</p></div></div>';
  var btn=(!CO.text)?'<button class="btn pri" id="coAsk"'+(CO.busy?' disabled':'')+'>'+(CO.busy?'Thinking…':'Plan my week')+'</button>':'<button class="btn sm" id="coAgain">New plan</button>';
  var plan='<div class="pnl coPlan"><div class="row" style="gap:10px"><h3 style="margin:0">Your week</h3><span class="sp"></span>'+btn+'</div>'+(CO.text?'<div id="coText" data-full="1">'+(CO.typed?planHtml(CO.text,day):'')+'</div>':'<p class="muted" style="margin-top:8px">Tap <b>Plan my week</b> and Cubexer builds a personal plan from your data.</p>')+(CO.text?trainLinks(R):'')+'</div>';
  var viz='<div class="coViz"><div class="pnl" style="text-align:center"><h3 style="margin:0 0 4px;text-align:left">Skill map</h3>'+radarSvg(sc)+'</div><div class="pnl"><h3 style="margin:0 0 8px">Solve trend</h3>'+sparkSvg()+'<div class="stats" style="margin-top:12px"><div><small>Average</small><b>'+sec(R.avg)+'</b></div><div><small>Best</small><b>'+sec(R.best)+'</b></div><div><small>This week</small><b>'+R.wk+'</b></div><div><small>Streak days</small><b>'+R.days+'</b></div></div></div></div>';
  var ask='<div class="pnl cx" id="cx"><div class="row" style="gap:8px"><h3 style="margin:0">Chat with Cubexer</h3><span class="sp"></span><button class="btn sm" id="cxClr" type="button">Clear</button></div><div id="cxLog" class="cxLog" aria-live="polite"></div><div id="cxChips" class="cxChips"></div><form id="cxF" class="row" style="gap:8px;margin-top:8px"><input class="in" id="cxIn" maxlength="240" autocomplete="off" placeholder="Ask about your solves, an alg, nerves, goals…" style="flex:1;min-width:0"><button class="btn pri" type="submit">Send</button></form><p class="muted" id="cxLeft" style="font-size:12.5px;margin:6px 0 0"></p></div>';
  return '<div style="max-width:860px;margin:0 auto;display:grid;gap:14px">'+head+ask+goalCard(R)+plan+viz+splitCard()+'<div class="pnl"><h3 style="margin:0 0 8px">What I noticed</h3><div class="lgrid" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr))">'+tips.map(function(x){ return '<div class="lc" style="cursor:default"><b>'+esc(x[0])+'</b><span class="muted" style="font-size:14px;line-height:1.5">'+esc(x[1])+'</span></div>'; }).join('')+'</div></div><p class="muted" style="font-size:12.5px;text-align:center">Everything is worked out from the solves, ticks, drills and quizzes saved on this device.</p></div>'; }
function coachAfter(el){ var t=$('#coText',el); if(!t||CO.typed||!CO.text) { CO.typed=!!CO.text; return; } var day=Math.floor((Date.now()+8*36e5)/864e5), full=planHtml(CO.text,day), plain=String(CO.text), i=0, n=plain.length; t.style.opacity=1; var tm=setInterval(function(){ if(!document.body.contains(t)){ clearInterval(tm); return; } i+=Math.max(2,Math.ceil(n/60)); if(i>=n){ clearInterval(tm); CO.typed=true; t.innerHTML=full; return; } t.innerHTML='<p class="coIntro" style="white-space:pre-wrap">'+esc(plain.slice(0,i))+'<span class="coCur">▍</span></p>'; },28); }
function coachCheck(i,on){ var day=Math.floor((Date.now()+8*36e5)/864e5), ck=CW.lsJ('cw_coach_chk',{}); if(ck.day!==day) ck={day:day,i:{}}; if(on) ck.i[i]=1; else delete ck.i[i]; CW.setJ('cw_coach_chk',ck); }
async function coachQ(again){ var el=$('#coQ'); var q=el?el.value.trim():''; if(!q||CO.qbusy) return; CO.qbusy=true; CO.ans=''; again(); var r=await CW.call('/api/coach',{id:CW.devId(),stats:coachStats(coachData()),q:q},25000); CO.qbusy=false; if(r.ok&&r.data&&r.data.text){ CO.ans=r.data.text; CO.left=r.data.left||0; } else CW.toast((r.data&&r.data.error)||'Cubexer is busy. Try again.'); again(); }
async function coachInit(again){ if(CO.ai!==null||!PL.live||!PL.live.on) return; var r=await CW.call('/api/coach',{id:CW.devId(),act:'cfg'},6000); CO.ai=!!(r.ok&&r.data&&r.data.ai); CO.left=(r.data&&r.data.left)||0; if(r.data&&r.data.ql!=null) CX.ql=r.data.ql; if(CO.ai) again(); }
async function coachAsk(again){ if(CO.busy) return; var R=coachData(), day=Math.floor((Date.now()+8*36e5)/864e5);
  if(CO.ai&&R.n>=10){ CO.busy=true; again(); var r=await CW.call('/api/coach',{id:CW.devId(),stats:coachStats(R)},25000); CO.busy=false; if(r.ok&&r.data&&r.data.text){ CO.text=r.data.text; CO.typed=false; CO.left=r.data.left||0; CW.setJ('cw_coach_ai',{day:day,text:CO.text}); again(); return; } }
  CO.text=localPlan(R); CO.typed=false; CW.setJ('cw_coach_ai',{day:day,text:CO.text}); again(); }

/* ---------- blindfold memo trainer ---------- */
var CORN=[[-1,1,-1,'U'],[1,1,-1,'U'],[1,1,1,'U'],[-1,1,1,'U'],[-1,1,-1,'L'],[-1,1,1,'L'],[-1,-1,1,'L'],[-1,-1,-1,'L'],[-1,1,1,'F'],[1,1,1,'F'],[1,-1,1,'F'],[-1,-1,1,'F'],[1,1,1,'R'],[1,1,-1,'R'],[1,-1,-1,'R'],[1,-1,1,'R'],[1,1,-1,'B'],[-1,1,-1,'B'],[-1,-1,-1,'B'],[1,-1,-1,'B'],[-1,-1,1,'D'],[1,-1,1,'D'],[1,-1,-1,'D'],[-1,-1,-1,'D']];
var EDGE=[[0,1,-1,'U'],[1,1,0,'U'],[0,1,1,'U'],[-1,1,0,'U'],[-1,1,0,'L'],[-1,0,1,'L'],[-1,-1,0,'L'],[-1,0,-1,'L'],[0,1,1,'F'],[1,0,1,'F'],[0,-1,1,'F'],[-1,0,1,'F'],[1,1,0,'R'],[1,0,-1,'R'],[1,-1,0,'R'],[1,0,1,'R'],[0,1,-1,'B'],[-1,0,-1,'B'],[0,-1,-1,'B'],[1,0,-1,'B'],[0,-1,1,'D'],[1,-1,0,'D'],[0,-1,-1,'D'],[-1,-1,0,'D']];
var LET='ABCDEFGHIJKLMNOPQRSTUVWX', BLD_BUF={c:2,e:2};
function bLoc(T,i){ var r=T[i]; return {p:[r[0],r[1],r[2]],n:FACES[r[3]].slice()}; }
function bSame(a,b){ return a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2]; }
function bAt(st,l){ for(var i=0;i<st.length;i++) if(bSame(st[i].p,l.p)&&bSame(st[i].n,l.n)) return st[i]; }
function bOrd(p){ var ns=[]; [[p[0],0,0],[0,p[1],0],[0,0,p[2]]].forEach(function(n){ if(n[0]||n[1]||n[2]) ns.push(n); }); if(ns.length===3&&p[0]*p[1]*p[2]<0) ns=[ns[0],ns[2],ns[1]]; return ns; }
var BHOME=null; function bHomeMap(){ if(BHOME) return BHOME; BHOME={}; var s=solvedCube(); s.forEach(function(a){ var cs=s.filter(function(b){ return bSame(b.p,a.p); }).map(function(b){ return b.c; }).sort().join(''); BHOME[cs+'|'+a.c]={p:a.p.slice(),n:a.n.slice()}; }); return BHOME; }
function bHome(st,s){ var cs=st.filter(function(b){ return bSame(b.p,s.p); }).map(function(b){ return b.c; }).sort().join(''); return bHomeMap()[cs+'|'+s.c]; }
function bIdx(T,loc){ for(var i=0;i<T.length;i++){ var l=bLoc(T,i); if(bSame(l.p,loc.p)&&bSame(l.n,loc.n)) return i; } return -1; }
function bSwap(st,T,la,lb){ var A=bLoc(T,la),B=bLoc(T,lb); if(bSame(A.p,B.p)) return; var oa=bOrd(A.p), ob=bOrd(B.p), m=oa.length, ia=-1, ib=-1, i;
  for(i=0;i<m;i++){ if(bSame(oa[i],A.n)) ia=i; if(bSame(ob[i],B.n)) ib=i; }
  var SA=st.filter(function(s){ return bSame(s.p,A.p); }), SB=st.filter(function(s){ return bSame(s.p,B.p); }), ma=[],mb=[];
  SA.forEach(function(s){ var k=0; for(var j=0;j<m;j++) if(bSame(oa[j],s.n)) k=((j-ia)%m+m)%m; ma.push([s,B.p.slice(),ob[(ib+k)%m].slice()]); });
  SB.forEach(function(s){ var k=0; for(var j=0;j<m;j++) if(bSame(ob[j],s.n)) k=((j-ib)%m+m)%m; mb.push([s,A.p.slice(),oa[(ia+k)%m].slice()]); });
  ma.concat(mb).forEach(function(x){ x[0].p=x[1]; x[0].n=x[2]; }); }
function bMemo(st0,T,buf){ var st=st0.map(function(s){ return {p:s.p.slice(),n:s.n.slice(),c:s.c}; }), out=[], bl=bLoc(T,buf), s0=bAt(st,bl), h0=bHome(st,s0);
  if(bSame(h0.p,bl.p)&&!bSame(h0.n,bl.n)) return {tw:true,l:[]};
  for(var g=0;g<60;g++){ var s=bAt(st,bl), h=bHome(st,s), pick=-1;
    if(bSame(h.p,bl.p)){ for(var i=0;i<24;i++){ var li=bLoc(T,i); if(bSame(li.p,bl.p)) continue; var si=bAt(st,li), hi=bHome(st,si); if(!(bSame(hi.p,li.p)&&bSame(hi.n,li.n))){ pick=i; break; } } }
    else pick=bIdx(T,h);
    if(pick<0) break; out.push(pick); bSwap(st,T,buf,pick); }
  return {tw:false,l:out.map(function(i){ return LET[i]; })}; }
function bScr(){ var F='UDFBRL', o=[], last='', last2=''; while(o.length<22){ var f=F[Math.floor(Math.random()*6)]; if(f===last) continue; if(last2&&f===last2&&'UD'.indexOf(f)>=0===('UD'.indexOf(last)>=0)&&0) continue; last2=last; last=f; o.push(f+['',"'",'2'][Math.floor(Math.random()*3)]); } return o.join(' '); }
function bMake(){ for(var t=0;t<30;t++){ var scr=bScr(), st=solvedCube(); parseAlg(scr).forEach(function(m){ applyMove(st,m); }); var e=bMemo(st,EDGE,BLD_BUF.e), c=bMemo(st,CORN,BLD_BUF.c); if(!e.tw&&!c.tw&&e.l.length>=6&&c.l.length>=4) return {scr:scr,st:st,e:e.l,c:c.l}; } return null; }
PL.bld={make:bMake,memo:bMemo,EDGE:EDGE,CORN:CORN};
var BL={ph:'idle',m:null,t0:0,mem:0,peek:false,inE:'',inC:'',res:null,cube:null};
function pairs(a){ var o=[]; for(var i=0;i<a.length;i+=2) o.push(a.slice(i,i+2).join('')); return o.join(' '); }
function bNorm(v){ return String(v||'').toUpperCase().replace(/[^A-X]/g,''); }
function bStat(){ var o=CW.lsJ('cw_learn_bld',{}); return o&&typeof o==='object'?o:{}; }
function blind(){ var S=bStat(), m=BL.m, h='<div style="max-width:700px;margin:0 auto"><div class="pnl"><h3>Blindfold memo trainer</h3><p class="muted" style="font-size:14px">Practise the memo for blindfolded solving. Get a scramble, study the cube, hide it, then type the letters from memory. Letters use the Speffz scheme with the UF edge and UFR corner as buffers, so you trace edges and corners the usual Old Pochmann or M2 way.</p>';
  if(BL.ph==='idle') h+='<div class="row" style="gap:10px;margin-top:10px"><button class="btn pri" id="bNew">New scramble</button><span class="muted mono" style="font-size:13px">'+(S.n?S.ok+'/'+S.n+' correct · best memo '+(S.best?(S.best/1000).toFixed(1)+' s':'–'):'No rounds yet')+'</span></div>';
  else if(BL.ph==='memo') h+='<p class="mono" style="word-spacing:.2em;margin:12px 0 6px">'+esc(m.scr)+'</p><div style="text-align:center"><canvas id="bCv" width="420" height="340" style="width:100%;max-width:420px;height:auto;background:var(--paper);border-radius:12px;touch-action:none"></canvas></div>'
    +'<div class="row" style="gap:10px;margin-top:10px;justify-content:center"><span class="mono" id="bT" style="font-size:20px">0.0</span><button class="btn pri" id="bHide">Memorised, hide it</button><button class="btn sm" id="bPeek">'+(BL.peek?'Hide letters':'Show letters')+'</button></div>'
    +(BL.peek?'<div class="pnl" style="margin-top:10px"><p><b>Edges</b> <span class="mono">'+esc(pairs(m.e)||'none')+'</span></p><p style="margin-top:4px"><b>Corners</b> <span class="mono">'+esc(pairs(m.c)||'none')+'</span></p></div>':'');
  else if(BL.ph==='recall') h+='<p class="muted" style="margin:12px 0 8px">Memo time '+(BL.mem/1000).toFixed(1)+' s. Type the letters in order (spaces are fine).</p><label class="muted" style="font-size:13px">Edges</label><input class="in mono" id="bE" value="'+esc(BL.inE)+'" autocomplete="off" autocapitalize="characters" style="width:100%;text-transform:uppercase"><label class="muted" style="font-size:13px;display:block;margin-top:8px">Corners</label><input class="in mono" id="bC" value="'+esc(BL.inC)+'" autocomplete="off" autocapitalize="characters" style="width:100%;text-transform:uppercase"><div class="row" style="gap:10px;margin-top:12px"><button class="btn pri" id="bCheck">Check</button><button class="btn sm" id="bGive">Give up</button></div>';
  else { var r=BL.res; h+='<div style="text-align:center;margin:14px 0"><p style="font:800 28px var(--display);margin:0">'+(r.ok?'Perfect memo':'Not quite')+'</p><p class="muted">Memo '+(BL.mem/1000).toFixed(1)+' s</p></div>'
    +'<p><b>Edges</b> <span class="mono">'+esc(pairs(m.e)||'none')+'</span> '+(r.e?'✓':'✗ you typed '+esc(pairs(bNorm(BL.inE).split(''))||'nothing'))+'</p><p style="margin-top:6px"><b>Corners</b> <span class="mono">'+esc(pairs(m.c)||'none')+'</span> '+(r.c?'✓':'✗ you typed '+esc(pairs(bNorm(BL.inC).split(''))||'nothing'))+'</p>'
    +(m.e.length%2?'<p class="muted" style="font-size:13px;margin-top:8px">The edge count is odd, so there is parity: add your parity alg before or after the corners.</p>':'')+'<p class="muted mono" style="font-size:12.5px;margin-top:8px">Scramble: '+esc(m.scr)+'</p><div class="row" style="margin-top:12px"><button class="btn pri" id="bNew">Next scramble</button></div>'; }
  h+='</div><div class="pnl" style="margin-top:12px"><h3>Speffz letters</h3><p class="muted mono" style="font-size:13px;line-height:1.7">U face A B C D · L face E F G H · F face I J K L · R face M N O P · B face Q R S T · D face U V W X<br>Each face starts at its top-left sticker and goes clockwise, with U up (and F up for the D face).</p></div>'+(u7()&&window.CWBld7?CWBld7.html():'')+'</div>'; return h; }
function blindMount(el){ var cv=$('#bCv',el); if(!cv||!BL.m) return; var c=mkCube(cv); BL.cu=c; c.st=BL.m.st.map(function(s){ return {p:s.p.slice(),n:s.n.slice(),c:s.c}; }); BL.cube=c; var drag=null; cv.onpointerdown=function(e){ drag=[e.clientX,e.clientY]; cv.setPointerCapture(e.pointerId); };
  cv.onpointermove=function(e){ if(!drag) return; c.yaw+=(e.clientX-drag[0])*.01; c.pitch=Math.max(-1.3,Math.min(1.35,c.pitch+(e.clientY-drag[1])*.01)); drag=[e.clientX,e.clientY]; c.draw(); }; cv.onpointerup=cv.onpointercancel=function(){ drag=null; }; c.draw();
  var tm=$('#bT',el); (function tk(){ if(BL.ph!=='memo'||!document.body.contains(cv)) return; if(tm) tm.textContent=((performance.now()-BL.t0)/1000).toFixed(1); setTimeout(tk,100); })(); }
function blindClick(t,again){ if(t.id==='bNew'){ var m=bMake(); if(!m){ CW.toast('Try again'); return true; } BL.m=m; BL.ph='memo'; BL.t0=performance.now(); BL.peek=false; BL.inE=''; BL.inC=''; again(); return true; }
  if(t.id==='bHide'){ BL.mem=performance.now()-BL.t0; BL.ph='recall'; again(); return true; } if(t.id==='bPeek'){ BL.peek=!BL.peek; again(); return true; }
  if(t.id==='bCheck'||t.id==='bGive'){ var E=$('#bE'),C=$('#bC'); if(E) BL.inE=E.value; if(C) BL.inC=C.value; var e=bNorm(BL.inE)===BL.m.e.join(''), c=bNorm(BL.inC)===BL.m.c.join(''); if(t.id==='bGive'){ e=false; c=false; BL.inE=''; BL.inC=''; }
    BL.res={e:e,c:c,ok:e&&c}; var S=bStat(); S.n=(S.n||0)+1; if(BL.res.ok){ S.ok=(S.ok||0)+1; if(!S.best||BL.mem<S.best) S.best=Math.round(BL.mem); CW.toast('+'+PL.addXP(15)+' XP for a clean memo'); } CW.setJ('cw_learn_bld',S); BL.ph='result'; again(); return true; } return false; }

/* ---------- case finder ---------- */
var FD={k:'oll',o:'000010000000000000000'.split(''),p:new Array(12).fill('')};
var PCOL={G:'#1f9a52',B:'#2650f5',O:'#ff7a1a',R:'#e1352b'}, PCY=['','G','B','O','R'];
function normSig(a){ var m={},k=0; return a.map(function(c){ if(!(c in m)) m[c]='ABCD'[k++]; return m[c]; }).join(''); }
function finderOllSvg(){ var s=22,o=19,t=7,g=2,h=[]; function r(x,y,w,hh,i,fixed){ h.push('<rect data-i="'+i+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+hh+'" rx="2.5" fill="'+(FD.o[i]==='1'?CLR.Y:CLR.X)+'" stroke="#0003" stroke-width=".6"'+(fixed?'':' style="cursor:pointer"')+'/>'); }
  for(var i=0;i<9;i++) r(o+(i%3)*(s+g),o+Math.floor(i/3)*(s+g),s,s,i,i===4);
  for(i=0;i<3;i++){ r(o+i*(s+g),o-t-3,s,t,9+i); r(o+3*(s+g)+1,o+i*(s+g),t,s,12+i); r(o+i*(s+g),o+3*(s+g)+1,s,t,15+i); r(o-t-3,o+i*(s+g),t,s,18+i); }
  return '<svg id="fdSvg" viewBox="0 0 100 100" width="260" height="260" role="img" aria-label="Tap the yellow stickers">'+h.join('')+'</svg>'; }
function finderPllSvg(){ var s=22,o=19,t=7,g=2,h=[]; function r(x,y,w,hh,i){ h.push('<rect data-i="'+i+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+hh+'" rx="2.5" fill="'+(FD.p[i]?PCOL[FD.p[i]]:'#cfd2d8')+'" stroke="#0003" stroke-width=".6" style="cursor:pointer"/>'); }
  for(var i=0;i<9;i++) h.push('<rect x="'+(o+(i%3)*(s+g))+'" y="'+(o+Math.floor(i/3)*(s+g))+'" width="'+s+'" height="'+s+'" rx="2.5" fill="'+CLR.Y+'" stroke="#0003" stroke-width=".6"/>');
  for(i=0;i<3;i++){ r(o+i*(s+g),o-t-3,s,t,i); r(o+3*(s+g)+1,o+i*(s+g),t,s,3+i); r(o+i*(s+g),o+3*(s+g)+1,s,t,6+i); r(o-t-3,o+i*(s+g),t,s,9+i); }
  return '<svg id="fdSvg" viewBox="0 0 100 100" width="260" height="260" role="img" aria-label="Tap the side colours">'+h.join('')+'</svg>'; }
function finderMatches(){ if(FD.k==='oll'){ var s=FD.o.join(''); return D.oll.filter(function(c){ return c.pr.indexOf(s)>=0; }); }
  if(FD.p.some(function(x){ return !x; })) return null; var sg=normSig(FD.p); return D.pll.filter(function(c){ return c.sg.indexOf(sg)>=0; }); }
function finder(){ var m=finderMatches(), res='';
  if(m===null) res='<p class="muted">Tap each of the 12 side stickers until it matches your cube. Each tap changes the colour.</p>';
  else if(!m.length) res='<p class="muted">'+(FD.k==='oll'?(FD.o.slice(0,9).every(function(x){ return x==='1'; })&&FD.o.slice(9).every(function(x){ return x==='0'; })?'The top is already all yellow. Go on to PLL.':'No OLL case has that pattern. Check the yellow stickers, including the thin side ones.'):'No PLL case matches that. Check the colours you tapped. Top face yellow, back of the cube at the top of the picture.')+'</p>';
  else res=m.map(function(c){ return '<div class="lc" style="cursor:default;flex-direction:row;gap:12px;align-items:center;flex-wrap:wrap">'+diag(FD.k,c,110)+'<div style="flex:1;min-width:180px"><b style="font-size:18px">'+esc(title(FD.k,c))+'</b><div class="mono muted" style="font-size:12.5px">'+esc(c.g)+'</div><code style="display:block;margin:6px 0">'+esc(c.alg)+'</code><div class="row" style="gap:8px"><a class="btn sm pri" href="#learn/'+FD.k+'/'+c.id+'">Open case room</a><button class="btn sm" data-copy="'+esc(c.alg)+'">Copy</button></div></div></div>'; }).join('');
  return '<div style="max-width:620px;margin:0 auto"><div class="pnl"><div class="row" style="gap:10px;flex-wrap:wrap"><div class="seg" id="fdK">'+['oll','pll'].map(function(k){ return '<button type="button" data-k="'+k+'" aria-pressed="'+(FD.k===k)+'">'+k.toUpperCase()+'</button>'; }).join('')+'</div><span class="sp"></span><button class="btn sm" id="fdClr">Clear</button></div>'
   +'<p class="muted" style="font-size:14px;margin:10px 0 0">'+(FD.k==='oll'?'<b>OLL:</b> hold your cube yellow-side up. Tap the stickers that are <b>yellow</b> on top, and the thin strips for yellow stickers on the sides of the top layer.':'<b>PLL:</b> the top is all yellow. Tap the 12 side stickers to match the colours around the top layer.')+'</p>'
   +'<div style="text-align:center;margin:10px 0">'+(FD.k==='oll'?finderOllSvg():finderPllSvg())+'</div></div><div style="display:grid;gap:10px;margin-top:12px">'+res+'</div></div>'; }
function finderClick(t,again){ var dk=t.closest('#fdK [data-k]'); if(dk){ FD.k=dk.getAttribute('data-k'); again(); return true; } if(t.id==='fdClr'){ FD.o='000010000000000000000'.split(''); FD.p=new Array(12).fill(''); again(); return true; }
  var c=t.closest('#fdSvg [data-i]'); if(!c) return false; var i=+c.getAttribute('data-i'); if(FD.k==='oll'){ if(i===4) return true; FD.o[i]=FD.o[i]==='1'?'0':'1'; } else FD.p[i]=PCY[(PCY.indexOf(FD.p[i])+1)%PCY.length]; again(); return true; }

/* ---------- explain this alg ---------- */
var TRIG=[["R U R' U'",'"sexy move"'],["R' F R F'",'the "sledgehammer"'],["F R U R' U' F'",'the F trigger (flips edges)'],["R U R'",'a short right-hand insert'],["R U2 R'",'a double-U insert'],["R' U' R",'the reverse insert'],["R U' R'",'the "anti-insert"'],["r U R' U'",'a wide-R trigger'],["M2",'a half M-slice turn']];
function explainLocal(alg){ var t=alg.split(/\s+/), uses={}, dbl=0, rot=0; t.forEach(function(m){ uses[m[0]]=(uses[m[0]]||0)+1; if(m[1]==='2') dbl++; if('xyz'.indexOf(m[0])>=0) rot++; });
  var s=' '+t.join(' ')+' ', hits=[]; TRIG.forEach(function(x){ var n=0, p=0, k=' '+x[0]+' '; while((p=s.indexOf(k,p))>=0){ n++; p+=k.length-1; } if(n) hits.push(x[1]+' ('+x[0]+')'+(n>1?' ×'+n:'')); });
  var faces=Object.keys(uses).filter(function(k){ return !/[xyz]/.test(k); }).sort().join(' '), hand=(/^[RUrU ]*$/.test(faces.replace(/ /g,''))||/^[RUr]+$/.test(faces.replace(/ /g,'')))?'You only turn the right side and the top, so you can keep your right hand on R and let your left hand help with U.':(uses.F?'It uses F turns as well as R and U, so keep a firm grip on the cube between the F and R moves.':(uses.M||uses.E||uses.S?'It uses slice moves, so keep the middle slice loose and practise the M turns on their own first.':'It uses several faces, so go slowly and watch the grip.'));
  var o=[t.length+' moves. '+(dbl?(dbl===1?'One of them is a half turn. ':dbl+' of them are half turns. '):'')+(rot?'It includes a whole-cube rotation. ':'')+hand]; if(hits.length) o.push('Look for these chunks inside it: '+hits.join('; ')+'. Learning each chunk on its own makes the whole alg easier.'); else o.push('There are no common triggers in it, so learn it in two halves: the first half, then the second.');
  o.push('Practise it slowly ten times with no mistakes, then speed up a little each round. The cube view in the case room shows each move.'); return o; }
var EX={busy:false,txt:{}};
function exLoad(){ var o=CW.lsJ('cw_explain',{}); return o&&typeof o==='object'&&!Array.isArray(o)?o:{}; }
async function explainAI(el){ if(EX.busy) return; var c=RM.c, id=RM.id, box=$('#rmEx',el); var cached=exLoad()[id+'|'+c.alg]; if(cached){ EX.txt[id]=cached; exPaint(el); return; } EX.busy=true; $('#rmExBtn',el).textContent='Thinking…';
  var r=await CW.call('/api/explain',{id:CW.devId(),c:id,alg:c.alg,name:title(RM.k,c)},25000); EX.busy=false; if(RM.id!==id||!$('#rmEx',el)) return;
  if(r.ok&&r.data&&r.data.text){ EX.txt[id]=r.data.text; var o=exLoad(); o[id+'|'+c.alg]=r.data.text; CW.setJ('cw_explain',o); } else CW.toast((r.data&&r.data.error)||'Cubexer is busy. Try again.'); exPaint(el); }
function exPaint(el){ var b=$('#rmEx',el); if(!b) return; var id=RM.id, loc=explainLocal(RM.c.alg), zr=RM.k==='zbll'&&window.CWZBLL?CWZBLL.recog(RM.c.v):null; b.innerHTML=(zr?'<div class="zb-rec"><b>How to recognise it</b><ul>'+zr.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join('')+'</ul></div>':'')+(EX.txt[id]?'<p class="coAns" style="margin:0 0 8px">'+esc(EX.txt[id])+'</p>':'')+loc.map(function(p){ return '<p class="muted" style="margin:6px 0;font-size:14px;line-height:1.5">'+esc(p)+'</p>'; }).join('')+'<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:6px">'+(CO.ai&&!EX.txt[id]?'<button class="btn sm pri" id="rmExBtn">Explain in plain words (Cubexer)</button>':'')+'<button class="btn sm" id="rmAskCx">Ask Cubexer about this case</button></div>'; var bt=$('#rmExBtn',el); if(bt) bt.onclick=function(){ explainAI(el); }; var ac=$('#rmAskCx',el); if(ac) ac.onclick=function(){ if(RM.k==='zbll'&&window.CWZBLL){ CWZBLL.ask('Help me learn '+title(RM.k,RM.c)+'. How do I recognise it and remember the algorithm?',RM.c.id); return; } CX.pend='Tips for '+title(RM.k,RM.c); location.hash='learn/coach'; }; }

/* ---------- recognition rush ---------- */
var RS={on:false,run:false,k:'pll',t0:0,end:0,score:0,miss:0,q:null,flash:0,tm:0,done:false,board:null,fr:false};
function rushBest(){ var o=CW.lsJ('cw_learn_rush',{}); return o&&typeof o==='object'&&!Array.isArray(o)?o:{}; }
function rushQ(){ var L=D[RS.k], c; do{ c=L[Math.floor(Math.random()*L.length)]; }while(RS.q&&c===RS.q.c); var same=L.filter(function(x){ return x!==c&&x.g===c.g; }), rest=L.filter(function(x){ return x!==c&&x.g!==c.g; }), opts=[c];
  while(opts.length<4){ var src=(same.length&&Math.random()<.6)?same:rest; var x=src.splice(Math.floor(Math.random()*src.length),1)[0]; if(!x) break; if(opts.indexOf(x)<0) opts.push(x); } opts.sort(function(){ return Math.random()-.5; }); RS.q={c:c,opts:opts}; }
function rushStart(){ RS.run=true; RS.done=false; RS.score=0; RS.miss=0; RS.end=performance.now()+60000; RS.q=null; rushQ(); clearInterval(RS.tm); }
function rushView(){ var B=rushBest(), b=B[RS.k];
  var head='<div class="row" style="gap:10px;flex-wrap:wrap"><div class="seg" id="rsK">'+['oll','pll'].map(function(k){ return '<button type="button" data-k="'+k+'" aria-pressed="'+(RS.k===k)+'">'+k.toUpperCase()+'</button>'; }).join('')+'</div><span class="sp"></span><button class="btn sm" id="rsBack">Back to quiz</button></div>';
  if(RS.run) return '<div class="pnl" style="max-width:560px;margin:0 auto">'+head+'<div class="row" style="margin-top:12px"><span class="mono" style="font-size:26px;font-weight:700" id="rsT">60.0</span><span class="sp"></span><span class="mono" style="font-size:20px">Score '+RS.score+'</span></div><div style="text-align:center;margin:10px 0">'+diag(RS.k,RS.q.c,190)+'</div><div class="qopts">'+RS.q.opts.map(function(o){ return '<button type="button" class="btn qo" data-r="'+String(o.id)+'">'+esc(title(RS.k,o))+'</button>'; }).join('')+'</div><p class="muted" style="font-size:12.5px;text-align:center;margin:10px 0 0">Wrong answers cost 3 seconds.</p></div>';
  if(RS.done) return '<div class="pnl" style="max-width:560px;margin:0 auto">'+head+'<div style="text-align:center;margin:18px 0"><p style="font:800 44px var(--display);margin:0">'+RS.score+'</p><p class="muted">cases named in 60 seconds · '+RS.miss+' wrong</p><p class="mono muted" style="font-size:13px">Best: '+(b!=null?b:'–')+'</p></div><div class="row" style="justify-content:center"><button class="btn pri" id="rsGo">Go again</button></div><div id="rsBd" style="margin-top:14px"></div></div>';
  return '<div class="pnl" style="max-width:560px;margin:0 auto">'+head+'<div style="text-align:center;margin:18px 0"><p style="font:800 22px var(--display);margin:0">Recognition rush</p><p class="muted" style="margin:6px 0 0">Name as many cases as you can in 60 seconds. Wrong answers cost 3 seconds.</p><p class="mono muted" style="font-size:13px">Best: '+(b!=null?b:'–')+'</p></div><div class="row" style="justify-content:center"><button class="btn pri" id="rsGo">Start</button></div><div id="rsBd" style="margin-top:14px"></div></div>'; }
function rushTick(el,again){ clearInterval(RS.tm); RS.tm=setInterval(function(){ var t=$('#rsT',el); if(!RS.run||!t){ clearInterval(RS.tm); return; } var left=RS.end-performance.now(); if(left<=0){ rushEnd(again); return; } t.textContent=(left/1000).toFixed(1); },100); }
async function rushEnd(again){ clearInterval(RS.tm); RS.run=false; RS.done=true; var B=rushBest(); if(B[RS.k]==null||RS.score>B[RS.k]){ B[RS.k]=RS.score; CW.setJ('cw_learn_rush',B); } if(RS.score>0) CW.toast('+'+PL.addXP(RS.score*2)+' XP for the rush'); again();
  if(RS.score>0&&PL.live&&PL.live.on&&B[RS.k]===RS.score) rushBoard(true); else rushBoard(false); }
async function rushBoard(submit){ var el=$('#rsBd'); if(!el) return; if(!PL.live||!PL.live.on){ el.innerHTML=''; return; } var k=RS.k, body={id:CW.devId(),c:'rush-'+k,fr:RS.fr?1:0}; if(submit){ body.act='submit'; body.ms=120000-RS.score*1000; }
  var r=await CW.call('/api/lp',body,7000); el=$('#rsBd'); if(!el||RS.k!==k) return; if(!r.ok){ el.innerHTML=''; return; } var d=r.data, sc=function(ms){ return Math.round((120000-ms)/1000); };
  el.innerHTML='<div class="row" style="gap:8px;margin-bottom:6px"><b style="font-size:14px">Top scores</b><span class="sp"></span><div class="seg" id="rsS"><button type="button" data-f="0" aria-pressed="'+(!RS.fr)+'">Everyone</button><button type="button" data-f="1" aria-pressed="'+RS.fr+'">Friends</button></div></div>'+(d.rows.length?d.rows.map(function(x){ return '<div class="rc-p'+(x.me?' me':'')+'"><b class="mono">'+x.r+'</b><span>'+esc(x.n)+(x.me?' (you)':'')+'</span><span class="mono" style="font-size:12.5px">'+sc(x.ms)+'</span></div>'; }).join(''):'<p class="muted" style="font-size:13px">No scores yet.</p>');
  var s=$('#rsS',el); if(s) s.onclick=function(e){ var b=e.target.closest('[data-f]'); if(!b) return; RS.fr=b.getAttribute('data-f')==='1'; rushBoard(false); }; }
function rushClick(t,again,el){ if(t.id==='rsBack'){ clearInterval(RS.tm); RS.on=false; RS.run=false; again(); return true; } if(t.id==='rsGo'){ rushStart(); again(); return true; }
  var rk=t.closest('#rsK [data-k]'); if(rk){ RS.k=rk.getAttribute('data-k'); RS.run=false; RS.done=false; again(); return true; }
  var ro=t.closest('[data-r]'); if(ro){ var id=ro.getAttribute('data-r'); if(String(RS.q.c.id)===id){ RS.score++; } else { RS.miss++; RS.end-=3000; } if(RS.end-performance.now()<=0){ rushEnd(again); return true; } rushQ(); again(); return true; } return false; }

/* ---------- daily goal ---------- */
function dayIdx(){ return Math.floor((Date.now()+8*36e5)/864e5); }
function goalToday(R){ var d=CW.lsJ('cw_timer',{})||{}, L=((d.solves||{})['333']||[]), start=dayIdx()*864e5-8*36e5, T=L.filter(function(x){ return (x.d||0)>=start; }), vals=T.map(function(x){ return x.p===2?Infinity:x.t+(x.p===1?2000:0); }), g;
  var kind=R.n<10?0:dayIdx()%3;
  if(kind===0){ g={t:'Do '+(R.n<10?5:10)+' timed 3×3 solves today',prog:Math.min(T.length,R.n<10?5:10),max:R.n<10?5:10,text:T.length+' / '+(R.n<10?5:10)+' solves'}; }
  else if(kind===1){ var tgt=Math.round(R.avg*.97/100)*100, best=null; for(var i=5;i<=vals.length;i++){ var a=vals.slice(i-5,i).sort(function(x,y){ return x-y; }).slice(1,4); if(a.some(function(x){ return x===Infinity; })) continue; var m=a.reduce(function(s,x){ return s+x; },0)/3; if(best==null||m<best) best=m; }
    g={t:'Get an Ao5 under '+sec(tgt)+' today',prog:best!=null&&best<=tgt?1:0,max:1,text:best==null?'Do 5 solves to get an Ao5':'Best Ao5 today: '+sec(best)}; }
  else { var cl=vals.filter(function(x){ return x!==Infinity; }).length; var dn=vals.length-cl; g={t:'Do 8 solves today with no DNF',prog:dn?Math.min(cl,8):Math.min(vals.length,8),max:8,text:vals.length+' solves, '+dn+' DNF'+(dn?' (a DNF does not count, do 8 clean ones)':'')}; if(dn) g.prog=Math.min(cl,8); }
  g.done=g.prog>=g.max; var st=CW.lsJ('cw_goal',{})||{}; g.claimed=st.claimed===dayIdx(); g.streak=(st.last===dayIdx()||st.last===dayIdx()-1)?(st.streak||0):0; return g; }
function goalCard(R){ var g=goalToday(R), pct=Math.round(g.prog/g.max*100);
  return '<div class="pnl coGoal"><div class="row" style="gap:10px"><div><div class="eyebrow">Today’s goal</div><b style="font-size:17px">'+esc(g.t)+'</b></div><span class="sp"></span><span class="coBadge" title="Days in a row">🔥 '+g.streak+'</span></div><div class="prog" style="margin:10px 0 6px"><i style="width:'+pct+'%"></i></div><div class="row"><span class="muted" style="font-size:13px">'+esc(g.text)+'</span><span class="sp"></span>'+(g.claimed?'<span class="mono" style="font-size:13px;color:#1f9a52">Claimed ✓</span>':g.done?'<button class="btn sm pri" id="goClaim">Claim 30 tokens</button>':'<span class="mono muted" style="font-size:13px">30 tokens</span>')+'</div></div>'; }
function goalClaim(){ var R=coachData(), g=goalToday(R); if(!g.done||g.claimed) return; var st=CW.lsJ('cw_goal',{})||{}, t=dayIdx(); st.streak=(st.last===t-1)?(st.streak||0)+1:1; st.last=t; st.claimed=t; CW.setJ('cw_goal',st); CW.toast('+'+PL.award(30)+' tokens · '+st.streak+' day streak'); }

/* ---------- step splits summary ---------- */
function splitData(){ var d=CW.lsJ('cw_timer',{})||{}, L=((d.solves||{})['333']||[]).slice(-40).filter(function(x){ return x.sp&&x.sp.length===3&&x.p!==2; }); if(L.length<3) return null; var a=[0,0,0,0]; L.forEach(function(x){ var s=x.sp, t=x.t; a[0]+=s[0]; a[1]+=s[1]-s[0]; a[2]+=s[2]-s[1]; a[3]+=t-s[2]; }); var tot=a[0]+a[1]+a[2]+a[3]; return {n:L.length,avg:a.map(function(v){ return v/L.length; }),pct:a.map(function(v){ return v/tot*100; })}; }
var SPN=['Cross','F2L','OLL','PLL'], SPB=[10,45,18,27];
function splitCard(){ var S=splitData(); if(!S) return '<div class="pnl"><h3 style="margin:0 0 6px">Step splits</h3><p class="muted" style="font-size:14px;margin:0">Turn on <b>Step splits</b> in the Timer and tap the split button after Cross, F2L and OLL. Cubexer then tells you which step costs you the most time. Needs 3 split solves.</p></div>';
  var cols=['#4f7bff','#7a5cff','#f2b600','#1f9a52'], worst=0, wd=-99; S.pct.forEach(function(p,i){ if(p-SPB[i]>wd){ wd=p-SPB[i]; worst=i; } });
  return '<div class="pnl"><h3 style="margin:0 0 8px">Step splits</h3><div style="display:flex;height:26px;border-radius:8px;overflow:hidden">'+S.pct.map(function(p,i){ return '<div title="'+SPN[i]+'" style="width:'+p+'%;background:'+cols[i]+'"></div>'; }).join('')+'</div><div class="row" style="gap:12px;flex-wrap:wrap;margin-top:8px;font-size:13px">'+S.pct.map(function(p,i){ return '<span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:'+cols[i]+';margin-right:5px"></i>'+SPN[i]+' '+sec(S.avg[i])+' · '+Math.round(p)+'%</span>'; }).join('')+'</div><p class="muted" style="font-size:14px;margin:10px 0 0">'+(wd>5?'<b>'+SPN[worst]+'</b> takes '+Math.round(S.pct[worst])+'% of your solve, more than the usual '+SPB[worst]+'%. That is the step to work on first.':'Your steps are well balanced. Keep all four improving together.')+' Based on your last '+S.n+' split solves.</p></div>'; }

/* ---------- view ---------- */
PL.views.learn={leave:function(){ roomStop(); if(window.CWScan) CWScan.leave(); },show:function(el,h){ roomStop(); zbSync(); var hp=h.split('/'); if((PKX[hp[1]]||hp[1]==='packs'||hp[1]==='scan')&&!u7()){ el.innerHTML='<div class="wrap">'+PL.crumbs('Learn CFOP')+'<p class="muted">Loading…</p></div>'; if(PL.onUpd7&&!PL._lk7w){ PL._lk7w=1; PL.onUpd7(function(){ if(/^#learn\//.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange')); }); } return; } if(P[hp[1]]&&hp[2]){ caseRoom(el,hp[1],hp[2]); return; } var sec=hp[1]||'guide'; if(!SECS.some(function(s){ return s.id===sec; })) sec='guide'; var pct=PL.learnPct();
  var body=sec==='guide'?guide():sec==='cross'?cross():sec==='drill'?drill():sec==='quiz'?(RS.on?rushView():quiz()):sec==='finder'?finder():sec==='blind'?blind():sec==='coach'?coach():sec==='two2'?(window.CW2x2?window.CW2x2.html():'<p class="muted">Loading…</p>'):LX(sec)?LX(sec).html():sec==='scan'?(window.CWScan&&PL.updOn7&&PL.updOn7()?CWScan.html():'<p class="muted">Loading…</p>'):sec==='packs'?(window.CWPacks?CWPacks.hub():'<p class="muted">Loading…</p>'):PKX[sec]?(window.CWPacks?'<div data-pkroot>'+CWPacks.html(sec)+'</div>'+library(sec,el):'<p class="muted">Loading…</p>'):sec==='zbll'?(window.CWZBLL?'<div data-zbroot>'+window.CWZBLL.html()+'</div>'+library('zbll',el):'<p class="muted">Loading…</p>'):library(sec,el);
  el.innerHTML='<div class="wrap">'+PL.crumbs('Learn CFOP')
   +'<nav class="lnav lseg" aria-label="Learn sections">'+SECS.filter(function(s){ return secOn(s)&&(!s.hide||s.id===sec); }).map(function(s){ var x=P[s.id]&&(!isPk(s.id)||pkOwn(s.id))?'<em class="mono">'+count(s.id)+'/'+D[s.id].length+'</em>':''; return '<button type="button" data-s="'+s.id+'" aria-pressed="'+(s.id===sec)+'"><span class="lni">'+s.i+'</span>'+s.n+x+'</button>'; }).join('')+'</nav>'
   +body+'</div>'; var act=el.querySelector('.lnav [aria-pressed=true]'); if(act&&act.scrollIntoView) try{ el.querySelector('.lnav').scrollLeft=act.offsetLeft-20; }catch(e){}
  var again=function(){ var y=window.scrollY; PL.views.learn.show(el,'learn/'+sec); window.scrollTo(0,y); };
  if(sec==='guide') heroMount(el); if(UI.v3&&P[sec]) thumbFill(el); if(sec==='blind'){ blindMount(el); if(window.CWBld7) CWBld7.mount(el); } if(sec==='zbll'&&window.CWZBLL) CWZBLL.mount(el); if(PKX[sec]&&window.CWPacks) CWPacks.mount(el,sec); if(sec==='scan'&&window.CWScan) CWScan.mount(el); if(LX(sec)) try{ LX(sec).mount(el); }catch(e){} if(sec==='coach') coachInit(function(){ if(location.hash==='#learn/coach') again(); });
  el.querySelector('.lseg').onclick=function(e){ var b=e.target.closest('[data-s]'); if(!b) return; UI.q='';UI.g='';UI.two=false;UI.un=false; location.hash='learn/'+b.getAttribute('data-s'); };
  el.onclick=function(e){ var t=e.target, cp=t.closest('[data-copy]'); var cd=t.closest('.lc'); if(cd&&!cp&&!t.closest('label,input,button')){ var pr=cd.getAttribute('data-c'), kk=pr.split('-')[0], ii=pr.slice(kk.length+1); location.hash='learn/'+kk+'/'+ii; return; }
    if(cp){ var v=cp.getAttribute('data-copy'); (navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(function(){ CW.toast('Copied'); },function(){ CW.toast('Select the moves and copy'); }); return; }
    if(t.id==='dWeak'){ DR.weak=!DR.weak; var wl2=weakList(); if(DR.weak&&wl2.length) DR.k=wl2[0].k; DR.cur=null; again(); } else if(t.id==='dShow'){ DR.shown=true; again(); } else if(t.id==='dSkip'){ pick(); again(); } else if(t.id==='dOk'){ rate(true); pick(); again(); } else if(t.id==='dNo'){ rate(false); pick(); again(); }
    if(blindClick(t,again)) return; if(sec==='finder'&&finderClick(t,again)) return; if(sec==='quiz'&&t.id==='qRush'){ RS.on=true; RS.run=false; RS.done=false; RS.k=QZ.k; again(); return; } if(sec==='quiz'&&RS.on&&rushClick(t,again,el)) return; if(t.id==='goClaim'){ goalClaim(); again(); return; } if(t.id==='coAsk'){ coachAsk(again); return; } if(t.id==='coAgain'){ CO.text=null; CO.typed=false; CO.ans=''; CW.setJ('cw_coach_ai',null); coachAsk(again); return; } var qb=t.closest('[data-q]'); if(qb){ qPick(qb.getAttribute('data-q')); again(); return; } if(t.id==='qNext'){ qNext(); again(); return; } if(t.id==='qAgain'){ qStart(); again(); return; }
    var qk=t.closest('#qK [data-k]'); if(qk){ QZ.k=qk.getAttribute('data-k'); qStart(); again(); return; }
    var vb=t.closest('#lV [data-v]'); if(vb){ UI.v3=vb.getAttribute('data-v')==='3'; try{ localStorage.setItem('cw_learn_v',UI.v3?'3d':'flat'); }catch(e){} again(); return; }
    var dk=t.closest('#dK [data-k]'); if(dk){ DR.k=dk.getAttribute('data-k'); DR.cur=null; again(); } };
  if(sec==='quiz'&&RS.on){ if(RS.run) rushTick(el,again); else rushBoard(false); }
  if(sec==='coach'){ coachAfter(el); cxMount(el,again); }
  el.onchange=function(e){ var t=e.target; if(t.getAttribute&&t.getAttribute('data-ck')!=null){ coachCheck(t.getAttribute('data-ck'),t.checked); var lb=t.closest('.coStep'); if(lb) lb.classList.toggle('on',t.checked); return; } var a=t.closest('[data-a]');
    if(a){ mark(a.getAttribute('data-a'),a.checked); var cardEl=a.closest('.lc'); if(cardEl) cardEl.classList.toggle('on',a.checked); if(UI.un&&a.checked) again(); else { var segs=el.querySelectorAll('.lseg [data-s]'); segs.forEach(function(b){ var k=b.getAttribute('data-s'); if(P[k]){ var s=b.querySelector('em'); if(s) s.textContent=count(k)+'/'+D[k].length; } }); } return; }
    if(t.id==='lG'){ UI.g=t.value; again(); } else if(t.id==='lT'){ UI.two=t.checked; again(); } else if(t.id==='lU'){ UI.un=t.checked; again(); } else if(t.id==='dA'){ DR.all=t.checked; DR.cur=null; again(); } else if(t.id==='qA'){ QZ.all=t.checked; qStart(); again(); } };
  var q=$('#lQ'); if(q) q.oninput=function(){ UI.q=q.value; var k=sec, list=visible(k), o=PL.learned(); $('#lGrid').innerHTML=list.length?list.map(function(c){ return cardHtml(k,c,o); }).join(''):'<p class="muted">No cases match. Clear the search or filters.</p>'; };
}};
/* hooks for the dashboard, plan and Ask bar */
PL.drillK=function(k){ DR.k=k; DR.cur=null; DR.all=false; };
PL.cxQuick=function(q){ try{ return cxLocal(q,coachData()); }catch(e){ return null; } };
PL.cxAI=async function(q){ var R=coachData(); if(CO.ai===null&&PL.live&&PL.live.on){ try{ await coachInit(function(){}); }catch(e){} } var r=await CW.call('/api/coach',{id:CW.devId(),stats:coachStats(R),q:String(q).slice(0,240),h:[]},25000); if(r.ok&&r.data&&r.data.text) return {text:r.data.text}; return {error:(r.data&&r.data.error)||'The AI is not reachable right now.'}; };
PL.cxPend=function(q){ CX.pend=q; };
PL.nextCase=function(){ try{ return nextCase(); }catch(e){ return null; } };
PL.weakCount=function(){ try{ return weakList().length; }catch(e){ return 0; } };
})();
