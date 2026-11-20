/* ZBLL tutorial for the Learn page. Lesson content, case diagrams for the 7 sets, and a progress tracker kept on this device.
   Diagrams and example algorithms were generated and checked with a cube simulator: each alg only changes the last layer and keeps the edges oriented. */
(function(){
var esc=function(s){ return String(s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
/* name, cases, how to spot it, sticker view (9 top, then back, right, front, left strips), example alg */
var SETS=[
 ['H',40,'No corner has yellow on top. The four yellow corner stickers make two pairs of headlights on opposite sides.','The smallest set. A good place to start.','LURUUULURULUBBFUFUBRF',"R U2 R' U' R U R' U' R U' R'"],
 ['Pi',72,'No corner has yellow on top. One side has a pair of yellow headlights, and the other two yellow stickers point out to the left and right.','Looks like H at first. Check whether both sides have headlights (H) or only one (Pi).','FULUUUBULRLUFRBRBUUFU',"R U2 R2 U' R2 U' R2 U2 R"],
 ['U',72,'Two corners are solved on top, side by side. The other two have their yellow stickers on the same side, as headlights.','Yellow headlights on one side means U.','UUUUUURUFBBRFRLUFULLB',"R2 D R' U2 R D' R' U2 R'"],
 ['T',72,'Two corners are solved on top, side by side. The other two have their yellow stickers pointing in opposite directions.','Same top shape as U, but no headlights.','BUBUUUUUULLRUFRFRFUBL',"R U2 R' U' R U' R2 U2 R U R' U R"],
 ['L',72,'Two corners are solved on top, diagonally across from each other.','The only set with a diagonal on top.','UUFUUUFUUBBLURBUFRLLR',"R U2 R D R' U2 R D' R2"],
 ['Sune',72,'One corner is solved on top. The other three are all twisted the same way.','The basic case is solved by the Sune itself.','RUFUUUUULULLUBBBFUFRR',"R U R' U R U2 R'"],
 ['Anti-Sune',72,'One corner is solved on top. The other three are all twisted the other way. The mirror of Sune.','The basic case is solved by the Anti-Sune.','FUUUUURUBRRFLLUUFLUBB',"R U2 R' U' R U' R'"]];
var STEPS=[
 ['What ZBLL is',['ZBLL solves the whole last layer with one algorithm, once the last layer edges are already oriented (the yellow cross is done).','Normally you do OLL and then PLL: two algorithms and two pauses to recognise. With ZBLL you recognise once and finish.','There are 472 cases, plus the 21 PLLs you already know.']],
 ['Is it worth learning?',['It removes one recognition pause from every solve where the cross is already done on top.','It is a lot to memorise, so it pays off most when your F2L and lookahead are already strong.','If you average slower than about 10 seconds, drilling F2L will usually help more. If you are faster and want a new challenge, ZBLL is the natural next step.']],
 ['What to know first',['All 21 PLLs and the OLLs, so you always have a fallback.','COLL is a good stepping stone. It solves the corners while keeping the edges oriented, and many COLL algs are also ZBLL algs.','A clean way to orient the last layer edges.']],
 ['How to read a case',['<b>1. The set.</b> Look at the top. How many corners show yellow, and where do the other yellow stickers point? That gives you one of the 7 sets below.','<b>2. The corners.</b> Look for headlights (two matching stickers on one side) and bars (three matching stickers in a row).','<b>3. The edges.</b> Check where the edge stickers sit next to those corners.','Always hold the set the same way before you read it. Recognition gets much faster when the picture never changes.']],
 ['A learning plan that works',['Pick one set and stay in it until it is done.','Learn 5 to 10 cases a week, not a whole set at once.','Group cases that start or end the same way, and learn mirrors together.','Drill until you can name the case without turning the cube, then add new ones.','Use the counters below to keep track.']],
 ['Choosing algorithms',['Most cases have several algs. Pick the one that feels good in your hands.','Avoid awkward regrips and cube rotations where you can.','Try it slowly first. If an alg keeps slipping after a week, swap it.','Use one alg per case and stick with it.']],
 ['Common mistakes',['Learning too many cases at once.','Learning the algs but never practising recognition.','Using a different alg for the same case each time.','Dropping F2L practice while learning.']]];
var COL={U:'#f2c400',F:'#1f9a52',R:'#ff7a1a',B:'#1d4fd8',L:'#e1352b'};
function svg(v,sz){ var c=22, g=3, t=7, o=t+g+2, W=o*2+c*3+g*2, s='<svg class="zb-dg" viewBox="0 0 '+W+' '+W+'" width="'+(sz||96)+'" height="'+(sz||96)+'" role="img" aria-label="Top view of the case">';
  function r(x,y,w,h,k,rx){ s+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(rx||3)+'" fill="'+(COL[k]||'#888')+'"/>'; }
  s+='<rect x="'+(o-g)+'" y="'+(o-g)+'" width="'+(c*3+g*4)+'" height="'+(c*3+g*4)+'" rx="6" fill="#15181d"/>';
  for(var i=0;i<9;i++) r(o+(i%3)*(c+g),o+Math.floor(i/3)*(c+g),c,c,v[i],4);
  for(var j=0;j<3;j++){ var p=o+j*(c+g); r(p,0,c,t,v[9+j],2); r(W-t,p,t,c,v[12+j],2); r(p,W-t,c,t,v[15+j],2); r(0,p,t,c,v[18+j],2); }
  return s+'</svg>'; }
var PFX={'H':'H','Pi':'Pi','U':'U','T':'T','L':'L','Sune':'S','Anti-Sune':'AS'};
var F={st:null,pack:null,pay:false,busy:false}, PRICE=20, TNG='0182967670';
function cached(){ if(F.pack) return F.pack; try{ var p=JSON.parse(localStorage.getItem('cw_zbll_pack')||'null'); if(p&&p.length===7) F.pack=p; }catch(e){} return F.pack; }
function owned(){ return !!cached(); }
var CS=null, CSP=null;
function cases(){ var pk=cached(); if(CS&&CSP===pk) return CS; CSP=pk;
  if(pk){ CS=[]; pk.forEach(function(x){ x[1].forEach(function(c,i){ CS.push({id:PFX[x[0]]+(i+1),n:String(i+1),g:x[0],alg:c[1],an:c[1],v:c[0]}); }); }); }
  else CS=SETS.map(function(s){ return {id:PFX[s[0]]+'s',n:'sample',g:s[0],alg:s[5],an:s[5],v:s[4]}; });
  return CS; }
function learnedIn(set){ var o=(window.PL&&PL.learned)?PL.learned():{}, n=0; cases().forEach(function(c){ if((!set||c.g===set)&&o['zbll-'+c.id]) n++; }); return n; }
/* older builds kept ticks in cw_zbll_k: move them to the shared learned list once */
function migrate(){ try{ var k=JSON.parse(localStorage.getItem('cw_zbll_k')||'null'); if(!k||!owned()||!window.PL||!PL.learned) return; var o=PL.learned(); Object.keys(k).forEach(function(nm){ (k[nm]||[]).forEach(function(i){ if(PFX[nm]) o['zbll-'+PFX[nm]+(i+1)]=1; }); }); CW.setJ('cw_learn',o); localStorage.removeItem('cw_zbll_k'); }catch(e){} }
function setCard(s){ var id=esc(s[0]), own=owned(), v=own?learnedIn(s[0]):0;
  return '<div class="zb-set"><div class="zb-sh">'+svg(s[4])+'<div><b class="zb-nm">'+id+'</b><span class="zb-ct">'+s[1]+' cases'+(own?' · '+v+' learned':'')+'</span>'+(own?'<div class="prog zb-sp"><i style="width:'+(v/s[1]*100).toFixed(1)+'%"></i></div>':'')+'</div></div>'
   +'<p class="zb-how">'+esc(s[2])+'</p><p class="zb-tip">'+esc(s[3])+'</p>'
   +'<div class="zb-alg"><small>Case shown</small><code>'+esc(s[5])+'</code></div>'
   +'<div class="row" style="gap:6px;flex-wrap:wrap"><a class="btn sm pri" href="#learn/zbll/'+PFX[s[0]]+'s">Watch in 3D</a>'+(own?'<button type="button" class="btn sm" data-zbg="'+id+'">Show all '+s[1]+'</button>':'')+'</div></div>'; }
function lockHtml(){ var st=F.st||{}, h='<div class="pnl zb-lock" id="zbLock"><div class="zb-lk"><span class="zb-pad" aria-hidden="true"></span><div><b>Full ZBLL pack</b><p>All 472 cases in the same 3D room as OLL and PLL: watch each algorithm on an animated cube, step move by move, slow it down, time your reps and drill recognition.</p></div><strong>RM '+PRICE+'</strong></div>';
  if(st.req){ h+='<p class="zb-note">Transaction ID sent: <b class="mono">'+esc(st.req.ref)+'</b>. It unlocks here once the payment is confirmed.</p><button type="button" class="btn" data-zbf="check">Check again</button>'; }
  else if(F.pay){ h+=(st.no?'<p class="zb-note bad">That payment could not be matched. Check the transaction ID and send it again.</p>':'')+'<ol class="zb-pay"><li>Open Touch ’n Go eWallet and send exactly <b>RM '+PRICE+'</b> to <b class="mono">+60 18-296 7670</b>. <button type="button" class="btn sm" data-zbf="copy">Copy number</button></li><li>Enter the transaction ID from your TNG app here.</li></ol><div class="row" style="gap:8px;flex-wrap:wrap"><input class="inp" id="zbRef" maxlength="40" placeholder="TNG transaction ID" autocomplete="off">'+(window.PL&&PL.updOn7&&PL.updOn7()?'<input class="inp" id="zbCC" maxlength="16" placeholder="Creator code (optional)" autocomplete="off" style="max-width:190px">':'')+'<button type="button" class="btn pri" data-zbf="send">Send</button></div><p class="zb-fine">One payment, yours to keep on this account. It unlocks after the payment is checked, not instantly.</p>'; }
  else { h+=(st.no?'<p class="zb-note bad">That payment could not be matched. Check the transaction ID and send it again.</p>':'')+'<button type="button" class="btn pri" data-zbf="pay">Unlock for RM '+PRICE+'</button>'; }
  return h+'</div>'; }
function html(){ migrate(); var own=owned(), n=own?learnedIn(''):0;
  return '<div class="zb">'
  +'<div class="pnl zb-hero"><span class="zb-kick">Advanced last layer</span><h2>ZBLL</h2><p>Finish the last layer with one algorithm instead of two. Learn how to read a case, then open any case in the 3D room to watch it, practise it and drill it.</p>'
  +'<div class="zb-stats"><span><b>472</b><small>cases</small></span><span><b>7</b><small>sets</small></span><span><b>1</b><small>look</small></span></div>'
  +'<div class="zb-flow"><span>Cross + F2L</span><i>›</i><span>Yellow cross</span><i>›</i><span class="on">One ZBLL alg</span><i>›</i><span>Solved</span></div>'
  +(own?'<div class="zb-pr"><div class="prog" style="flex:1"><i style="width:'+(n/472*100).toFixed(1)+'%"></i></div><span class="mono">'+n+' / 472 learned</span></div>':'')+'</div>'
  +'<div class="pnl zb-how3"><b>How to learn a case</b><ol><li><b>Watch.</b> Open the case. The 3D cube plays the algorithm on loop. Slow it to 0.25× and step through it move by move.</li><li><b>Copy it.</b> Do the setup scramble on your own cube, then follow along.</li><li><b>Time it.</b> Use the Practice tab for reps until it flows.</li><li><b>Tick it.</b> Mark it learned, then drill recognition so you can name it at a glance.</li></ol>'+(own?'<a class="btn pri" href="#learn/drill" data-zbdrill>Drill my ZBLL cases</a>':'')+'</div>'
  +aiHtml()
  +'<h3 class="zb-h">The lesson</h3><div class="zb-steps">'+STEPS.map(function(s,i){ return '<details class="zb-step"'+(i===0?' open':'')+'><summary><em>'+(i+1)+'</em><b>'+esc(s[0])+'</b><i></i></summary><ul>'+s[1].map(function(x){ return '<li>'+x+'</li>'; }).join('')+'</ul></details>'; }).join('')+'</div>'
  +'<h3 class="zb-h">The 7 sets</h3><p class="zb-sub">Each set is named after what the corners look like from the top. Tap Watch in 3D to see one case from each set on the animated cube.</p>'
  +'<div class="zb-grid">'+SETS.map(setCard).join('')+'</div>'
  +(own?'':lockHtml())
  +'<h3 class="zb-h" id="zbLib">'+(own?'All 472 cases':'Free cases')+'</h3>'+(own?'':'<p class="zb-sub">One case from each set, free to try in the 3D room. Unlock the pack to get all 472.</p>')+'</div>'; }
/* ---------- recognition facts (same rules as the server) ---------- */
function recog(v){ var N={U:'yellow',F:'green',R:'orange',B:'blue',L:'red'}, n=function(i){ return N[v[i]]||'?'; };
  var cn=[[0,'back-left'],[2,'back-right'],[6,'front-left'],[8,'front-right']].filter(function(x){ return v[x[0]]==='U'; }).map(function(x){ return x[1]; });
  var out=['Hold it with yellow on top and green in front.','Yellow on top at the corners: '+(cn.length?cn.join(', '):'none')+'.'];
  [['Front',[15,16,17]],['Right',[14,13,12]],['Back',[11,10,9]],['Left',[18,19,20]]].forEach(function(sd){ var a=sd[1].map(n), t=sd[0]+' side, left to right: '+a.join(', '); if(a[0]===a[1]&&a[1]===a[2]) t+=' (a full bar)'; else if(a[0]===a[2]) t+=' (headlights)'; out.push(t+'.'); });
  return out; }
/* ---------- Cubexer: ZBLL tutor chat ---------- */
var AI={on:null,left:null,busy:false,m:[],cur:'',next:[]};
try{ var sv=JSON.parse(sessionStorage.getItem('cw_zbai')||'null'); if(sv&&sv.m) { AI.m=sv.m.slice(-12); AI.cur=sv.cur||''; } }catch(e){}
function aiSave(){ try{ sessionStorage.setItem('cw_zbai',JSON.stringify({m:AI.m.slice(-12),cur:AI.cur})); }catch(e){} }
var CHIPS0=['Which set should I learn first?','How do I tell U and T apart?','Make me a plan for this week'];
function chips(){ var a=AI.next.length?AI.next:CHIPS0.slice(); if(!AI.next.length&&missList().length) a=['Help me with the cases I keep missing'].concat(a.slice(0,2)); return a; }
function missList(){ var M={}; try{ M=JSON.parse(localStorage.getItem('cw_learn_miss')||'{}')||{}; }catch(e){} return Object.keys(M).filter(function(k){ return /^zbll-/.test(k)&&M[k]&&M[k][0]>0; }).sort(function(a,b){ return M[b][0]-M[a][0]; }).slice(0,5).map(function(k){ return k.slice(5); }); }
function progress(){ var o=(window.PL&&PL.learned)?PL.learned():{}, r={}; SETS.forEach(function(s){ r[s[0]]=0; }); cases().forEach(function(c){ if(o['zbll-'+c.id]&&c.n!=='sample') r[c.g]++; }); return r; }
function aiHtml(){ var cur=AI.cur?cases().filter(function(c){ return c.id===AI.cur; })[0]:null;
  return '<div class="pnl zb-ai" id="zbAI"><div class="zb-aih"><span class="zb-aiav" aria-hidden="true">C</span><div><b>Ask Cubexer</b><small>Your ZBLL coach. Ask about recognising a set, remembering an algorithm, or what to learn next.</small></div></div>'
   +(AI.on===false?'<p class="muted" style="font-size:14px">Cubexer is not available right now. Connect to Cuber Tools live and try again.</p>':'')
   +'<div class="zb-ailog" id="zbAILog">'+(AI.m.length?AI.m.map(function(x){ return '<div class="zb-msg '+(x.r==='c'?'c':'u')+'">'+esc(x.t)+'</div>'; }).join(''):'<p class="muted" style="font-size:13.5px;margin:0">Cubexer knows your progress on each set'+(owned()?' and the cases you keep missing in the drill':'')+'.</p>')+(AI.busy?'<div class="zb-msg c zb-typing"><i></i><i></i><i></i></div>':'')+'</div>'
   +(cur?'<p class="zb-curx">Talking about <b>'+esc(cur.g+' '+(cur.n==='sample'?'(free case)':cur.n))+'</b> <button type="button" class="btn sm" data-zba="nocur">Clear</button></p>':'')
   +'<div class="zb-chips">'+chips().map(function(q){ return '<button type="button" class="btn sm" data-zbq="'+esc(q)+'">'+esc(q)+'</button>'; }).join('')+'</div>'
   +'<div class="row" style="gap:8px;margin-top:8px"><input class="inp" id="zbAIq" maxlength="240" placeholder="Ask about ZBLL…" autocomplete="off"'+(AI.busy?' disabled':'')+'><button type="button" class="btn pri" data-zba="send"'+(AI.busy?' disabled':'')+'>Ask</button></div>'
   +'<p class="zb-fine">'+(AI.left!=null?AI.left+' questions left today. ':'')+(owned()?'':'Free players get 3 a day, the pack gives 20. ')+'Cubexer can make mistakes, so check algorithms on the 3D cube.'+(AI.m.length?' <button type="button" class="btn sm" data-zba="clear" style="margin-left:6px">New chat</button>':'')+'</p></div>'; }
function aiPaint(){ var e=document.getElementById('zbAI'); if(!e) return; e.outerHTML=aiHtml(); var l=document.getElementById('zbAILog'); if(l) l.scrollTop=l.scrollHeight; }
function aiCfg(){ if(AI.on!==null||typeof CW==='undefined'||!CW.call) return; CW.call('/api/zbai',{id:CW.devId(),act:'cfg'},6000).then(function(r){ if(r&&r.ok&&r.data){ AI.on=!!r.data.ai; AI.left=r.data.left; } else AI.on=null; aiPaint(); }); }
function aiSend(q){ q=String(q||'').trim(); if(!q||AI.busy) return; AI.m.push({r:'u',t:q}); AI.busy=true; AI.next=[]; aiSave(); aiPaint();
  var hist=AI.m.slice(-7,-1);
  CW.call('/api/zbai',{id:CW.devId(),q:q,h:hist,prog:progress(),miss:missList(),cur:AI.cur||''},30000).then(function(r){ AI.busy=false;
    if(r&&r.ok&&r.data&&r.data.text){ AI.m.push({r:'c',t:r.data.text}); AI.next=r.data.next||[]; if(r.data.left!=null) AI.left=r.data.left; }
    else { var er=(r&&r.data&&r.data.error)||'Cubexer is busy. Try again in a moment.'; AI.m.pop(); if(r&&r.data&&r.data.left===0) AI.left=0; if(CW.toast) CW.toast(er); }
    aiSave(); aiPaint(); }); }
function ask(q,cur){ AI.cur=cur||''; AI.pend=q; aiSave(); location.hash='learn/zbll'; }
function redraw(){ if(/^#learn\/zbll/.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange')); }
function call(b){ b.id=CW.devId(); return CW.call('/api/zb',b,9000).then(function(r){ return r&&r.ok&&r.data&&r.data.ok?r.data:{err:(r&&r.data&&r.data.error)||'Could not reach the server. Try again.'}; }); }
function lockPaint(){ var e=document.getElementById('zbLock'); if(e) e.outerHTML=lockHtml(); }
function refresh(){ if(typeof CW==='undefined'||!CW.call) return; call({act:'st'}).then(function(d){ if(d.err) return; F.st=d; if(d.price) PRICE=d.price;
    if(d.un&&!cached()){ call({act:'get'}).then(function(g){ if(g.pack){ F.pack=g.pack; try{ localStorage.setItem('cw_zbll_pack',JSON.stringify(g.pack)); }catch(e){} migrate(); if(CW.toast) CW.toast('Full ZBLL pack unlocked.'); redraw(); } }); }
    else if(!d.un&&cached()){ F.pack=null; try{ localStorage.removeItem('cw_zbll_pack'); }catch(e){} redraw(); }
    else lockPaint(); }); }
function click(e){ var b=e.target.closest('[data-zbf]');
  if(!b){ var g=e.target.closest('[data-zbg]'); if(g){ var sel=document.getElementById('lG'); if(sel){ sel.value=g.getAttribute('data-zbg'); sel.dispatchEvent(new Event('change',{bubbles:true})); setTimeout(function(){ var l=document.getElementById('zbLib'); if(l) l.scrollIntoView({behavior:'smooth'}); },60); } return true; }
    var qb=e.target.closest('[data-zbq]'); if(qb){ aiSend(qb.getAttribute('data-zbq')); return true; }
    var ab=e.target.closest('[data-zba]'); if(ab){ var a=ab.getAttribute('data-zba'); if(a==='send'){ var inp=document.getElementById('zbAIq'); aiSend(inp&&inp.value); } else if(a==='clear'){ AI.m=[]; AI.next=[]; AI.cur=''; aiSave(); aiPaint(); } else if(a==='nocur'){ AI.cur=''; aiSave(); aiPaint(); } return true; }
    var dr=e.target.closest('[data-zbdrill]'); if(dr&&window.PL&&PL.drillK) PL.drillK('zbll'); return false; }
  var f=b.getAttribute('data-zbf');
  if(f==='pay'){ F.pay=true; lockPaint(); }
  else if(f==='copy'){ try{ navigator.clipboard.writeText(TNG); if(CW.toast) CW.toast('Number copied'); }catch(x){} }
  else if(f==='check'){ refresh(); if(CW.toast) CW.toast('Checking…'); }
  else if(f==='send'){ var ref=(document.getElementById('zbRef').value||'').trim(); if(ref.length<4){ CW.toast('Enter the transaction ID from your TNG app.'); return true; } if(F.busy) return true; F.busy=true; b.disabled=true; call({act:'req',ref:ref,cc:((document.getElementById('zbCC')||{}).value||'').trim()}).then(function(d){ F.busy=false; if(d.err){ CW.toast(d.err); b.disabled=false; return; } F.st=F.st||{}; F.st.no=0; F.st.req=d.un?null:(d.req||{ref:ref}); F.pay=false; lockPaint(); if(d.un) refresh(); }); }
  return true; }
function mount(el){ migrate(); refresh(); aiCfg(); var root=el.querySelector('[data-zbroot]'); if(!root) return;
  if(AI.pend){ var q=AI.pend; AI.pend=null; setTimeout(function(){ var a=document.getElementById('zbAI'); if(a) a.scrollIntoView({block:'start'}); aiSend(q); },120); }
  if(root._zb) return; root._zb=1; root.addEventListener('click',function(e){ if(click(e)) e.stopPropagation(); });
  root.addEventListener('keydown',function(e){ if(e.key==='Enter'&&e.target&&e.target.id==='zbAIq'){ e.preventDefault(); aiSend(e.target.value); } }); }
window.CWZBLL={html:html,mount:mount,cases:cases,owned:owned,svg:svg,recog:recog,ask:ask};
})();
