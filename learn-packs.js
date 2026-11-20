/* Paid algorithm packs for the Learn page (Update 7): COLL, OLLCP and 2x2 CLL & EG. ZBLL keeps its own page in learn-zbll.js.
   Every algorithm was found by a computer search and checked with a cube simulator. The full lists come from the server once a pack is unlocked;
   one free case per set ships here so anyone can try the 3D room. */
(function(){
var esc=function(s){ return String(s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
var TNG='0182967670';
var PK={
 coll:{n:'COLL',kick:'Corners of the last layer',price:8,blurb:'When the yellow cross is already done on top, COLL solves all four corners in one algorithm and keeps the edges oriented. Then you finish with one of 4 easy edge PLLs (U, H or Z perms).',
  stats:[['42','cases'],['8','sets'],['EPLL','after']],flow:['Cross + F2L','Yellow cross','One COLL alg','Edge PLL'],
  steps:[['What COLL is',['COLL = Corners of the Last Layer. Use it when the last layer edges are already oriented (you can see the yellow cross).','It orients and permutes the corners at the same time, so only the edges are left. Those are always a U, H or Z perm.']],
   ['Why learn it',['It is the classic stepping stone to ZBLL. Many COLL algs are also ZBLL algs.','40 cases is a weekend project, not a year.','You still use OLL whenever the cross is not done on top.']],
   ['How to read a case',['Look only at the corners. The edges do not matter yet, so they are shown grey.','First find the set from the yellow stickers (like OLL). Then look for headlights and bars on the sides to find the exact case.']]],
  sets:{'H':'No corner has yellow on top. Two pairs of headlights.','Pi':'No corner has yellow on top. One pair of headlights.','U':'Two solved corners side by side, yellow headlights on one side.','T':'Two solved corners side by side, yellow pointing opposite ways.','L':'Two solved corners on a diagonal.','Sune':'One corner solved, the rest twisted clockwise.','Anti-Sune':'One corner solved, the rest twisted anticlockwise.','Corners swapped':'All yellow on top, but two corners need swapping.'},
  pfx:{'H':'H','Pi':'Pi','U':'U','T':'T','L':'L','Sune':'S','Anti-Sune':'AS','Corners swapped':'X'},
  free:[["H",4,["LURUUULURUxUBxFUxUBxF","R U2 R' U' R U R' U' R U' R'"]],["Pi",6,["FULUUUBULRxUFxBRxUUxU","R' U2 R2 U R2 U R2 U2 R'"]],["U",6,["RUBUUUUUUUxULxBFxRFxL","R2 D' R U2 R' D R U2 R"]],["T",6,["FULUUUUUURxBUxBFxRUxL","R U R D R' U' R D' R2"]],["L",6,["RUUUUUUULBxRFxBFxUUxL","R2 D R' U R D' R' U' R'"]],["Sune",6,["RUFUUUUULUxLUxBBxUFxR","R U R' U R U2 R'"]],["Anti-Sune",6,["FUUUUURUBRxFLxUUxLUxB","R U2 R' U' R U' R'"]],["Corners swapped",2,["UUUUUUUUUBxRFxBFxRLxL","R U R' U' R' F R2 U' R' U' R U R' F'"]]]},
 ollcp:{n:'OLLCP',kick:'OLL + corner permutation',price:15,blurb:'OLLCP orients the whole last layer and solves the corners in the same algorithm, so you always finish with an edge PLL. Use it when the yellow cross is not done.',
  stats:[['289','cases'],['3','sets'],['EPLL','after']],flow:['Cross + F2L','One OLLCP alg','Edge PLL','Solved'],
  steps:[['What OLLCP is',['A normal OLL leaves the corners in any order, so you might get any PLL. OLLCP picks the OLL alg that also fixes the corners.','You end with only the edges left: a U, H or Z perm.']],
   ['When to use it',['Best for the OLLs you already know well. Start with the common shapes and learn the corner versions one at a time.','Pair it with COLL: COLL covers the cases where the cross is done, OLLCP covers the rest.']],
   ['How to read a case',['First spot the OLL as usual. Then look at the corner stickers on the sides (headlights and bars) to find which corner version it is.','Edge colours on the sides do not matter, so they are shown grey.']]],
  sets:{'Dot':'No yellow edge on top.','Line':'Two yellow edges in a line.','L shape':'Two yellow edges next to each other.'},
  pfx:{'Dot':'D','Line':'Ln','L shape':'Ls'},
  free:[["Dot",43,["RxFxUxBxUBUURUFUULUUL","R r' U' r U2 r' U' R U' r R2"]],["Line",84,["FUFxUxUUUUxURUBLxRLUB","R' F' U' F U R"]],["L shape",162,["UULUUxUxLRxBUUURUFBxF","F U R U' R' F'"]]]},
 cll:{n:'2×2 CLL & EG',kick:'2×2 one-look methods',price:10,two:1,blurb:'CLL solves the whole last layer of a 2×2 in one algorithm after you build the first layer. EG goes further: it also fixes the bottom layer when it is not quite right, so you only need to build a face, not a full layer.',
  stats:[['128','cases'],['3','sets'],['1','look']],flow:['First face','One CLL or EG alg','Solved'],
  steps:[['What CLL is',['Build the first layer of the 2×2 (a face with matching sides). Then one CLL alg solves the top: orientation and permutation together.','There are 42 cases, and it is the most used method by fast 2×2 solvers.']],
   ['What EG is',['EG lets you start from any first face. If the bottom layer has two corners swapped, EG-1 (side swap) or EG-2 (diagonal swap) fixes it in the same algorithm.','Learn CLL first, then EG-1, then EG-2.']],
   ['How to read a case',['Look at the top: which way the yellow stickers point, then headlights and bars on the sides.','For EG, also check the bottom layer: are two side corners swapped (EG-1) or two diagonal corners (EG-2)?']]],
  sets:{'CLL':'Bottom layer solved.','EG-1':'Bottom: front-right and back-right corners swapped.','EG-2':'Bottom: diagonal corners swapped.'},
  pfx:{'CLL':'C','EG-1':'E1','EG-2':'E2'},
  free:[["CLL",42,["UBUBLULRRUFF","R U' R F' R F' U' F2 R2"]],["EG-1",43,["UBUFBRUUFRLL","U R F2 R F2 R U R2 F2"]],["EG-2",43,["ULURLBUURBFF","F U R U' R' F R2 F2"]]]}};
var ST={}, BUSY={}, PAY={};
function on(){ return !!(window.PL&&PL.updOn7&&PL.updOn7()); }
function cached(k){ var d=PK[k]; if(!d) return null; if(d.pack) return d.pack; try{ var p=JSON.parse(localStorage.getItem('cw_pk_'+k)||'null'); if(p&&p.length) d.pack=p; }catch(e){} return d.pack||null; }
function owned(k){ return !!cached(k); }
var CS={};
function total(k){ var d=PK[k]; return d.free.reduce(function(a,s){ return a+s[1]; },0); }
function cases(k){ var d=PK[k], pk=cached(k); if(!d) return []; if(CS[k]&&CS[k].p===pk) return CS[k].c; var out=[];
  if(pk) pk.forEach(function(x){ x[1].forEach(function(c,i){ out.push({id:(d.pfx[x[0]]||'Z')+(i+1),n:String(i+1),g:x[0],alg:c[1],an:c[1],v:c[0]}); }); });
  else d.free.forEach(function(s){ out.push({id:(d.pfx[s[0]]||'Z')+'s',n:'sample',g:s[0],alg:s[2][1],an:s[2][1],v:s[2][0]}); });
  CS[k]={p:pk,c:out}; return out; }
var COL={U:'#f2c400',F:'#1f9a52',R:'#ff7a1a',B:'#1d4fd8',L:'#e1352b',x:'#4a4f58'};
function svg(k,v,sz){ v=String(v||''); var two=v.length===12, n=two?2:3, c=two?32:22, g=3, t=7, o=t+g+2, W=o*2+c*n+g*(n-1), s='<svg class="zb-dg" viewBox="0 0 '+W+' '+W+'" width="'+(sz||96)+'" height="'+(sz||96)+'" role="img" aria-label="Top view of the case">';
  function r(x,y,w,h,q,rx){ s+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(rx||3)+'" fill="'+(COL[q]||'#888')+'"/>'; }
  s+='<rect x="'+(o-g)+'" y="'+(o-g)+'" width="'+(c*n+g*(n+1))+'" height="'+(c*n+g*(n+1))+'" rx="6" fill="#15181d"/>';
  var nn=n*n; for(var i=0;i<nn;i++) r(o+(i%n)*(c+g),o+Math.floor(i/n)*(c+g),c,c,v[i],4);
  for(var j=0;j<n;j++){ var p=o+j*(c+g); r(p,0,c,t,v[nn+j],2); r(W-t,p,t,c,v[nn+n+j],2); r(p,W-t,c,t,v[nn+2*n+j],2); r(0,p,t,c,v[nn+3*n+j],2); }
  return s+'</svg>'; }
function learnedIn(k,set){ var o=(window.PL&&PL.learned)?PL.learned():{}, n=0; cases(k).forEach(function(c){ if((!set||c.g===set)&&o[k+'-'+c.id]) n++; }); return n; }
function setCard(k,s){ var d=PK[k], own=owned(k), v=own?learnedIn(k,s[0]):0, id=esc(s[0]);
  return '<div class="zb-set"><div class="zb-sh">'+svg(k,s[2][0])+'<div><b class="zb-nm">'+id+'</b><span class="zb-ct">'+s[1]+' cases'+(own?' · '+v+' learned':'')+'</span>'+(own?'<div class="prog zb-sp"><i style="width:'+(v/s[1]*100).toFixed(1)+'%"></i></div>':'')+'</div></div>'
   +'<p class="zb-how">'+esc(d.sets[s[0]]||'')+'</p><div class="zb-alg"><small>Case shown</small><code>'+esc(s[2][1])+'</code></div>'
   +'<div class="row" style="gap:6px;flex-wrap:wrap"><a class="btn sm pri" href="#learn/'+k+'/'+(d.pfx[s[0]]||'Z')+'s">Watch in 3D</a>'+(own?'<button type="button" class="btn sm" data-pkg="'+id+'">Show all '+s[1]+'</button>':'')+'</div></div>'; }
function price(k){ var st=ST[k]; return st&&st.price?st.price:PK[k].price; }
function lockHtml(k){ var d=PK[k], st=ST[k]||{}, P=price(k), h='<div class="pnl zb-lock" id="pkLock"><div class="zb-lk"><span class="zb-pad" aria-hidden="true"></span><div><b>Full '+esc(d.n)+' pack</b><p>All '+total(k)+' cases in the 3D room: watch each algorithm on an animated cube, step it move by move, time your reps and drill recognition.</p></div><strong>RM '+P+'</strong></div>';
  if(st.req) h+='<p class="zb-note">Transaction ID sent: <b class="mono">'+esc(st.req.ref)+'</b>. It unlocks here once the payment is confirmed.</p><button type="button" class="btn" data-pkf="check">Check again</button>';
  else if(PAY[k]) h+=(st.no?'<p class="zb-note bad">That payment could not be matched. Check the transaction ID and send it again.</p>':'')+'<ol class="zb-pay"><li>Open Touch ’n Go eWallet and send exactly <b>RM '+P+'</b> to <b class="mono">+60 18-296 7670</b>. <button type="button" class="btn sm" data-pkf="copy">Copy number</button></li><li>Enter the transaction ID from your TNG app here.</li></ol><div class="row" style="gap:8px;flex-wrap:wrap"><input class="inp" id="pkRef" maxlength="40" placeholder="TNG transaction ID" autocomplete="off"><input class="inp" id="pkCC" maxlength="16" placeholder="Creator code (optional)" autocomplete="off" style="max-width:190px"><button type="button" class="btn pri" data-pkf="send">Send</button></div><p class="zb-fine">One payment, yours to keep on this account. It unlocks after the payment is checked, not instantly.</p>';
  else h+=(st.no?'<p class="zb-note bad">That payment could not be matched. Check the transaction ID and send it again.</p>':'')+'<button type="button" class="btn pri" data-pkf="pay">Unlock for RM '+P+'</button>';
  return h+'</div>'; }
function html(k){ var d=PK[k]; if(!d) return ''; var own=owned(k), n=own?learnedIn(k,''):0, t=total(k);
  return '<div class="zb">'
  +'<div class="pnl zb-hero"><span class="zb-kick">'+esc(d.kick)+'</span><h2>'+esc(d.n)+'</h2><p>'+esc(d.blurb)+'</p>'
  +'<div class="zb-stats">'+d.stats.map(function(x){ return '<span><b>'+esc(x[0])+'</b><small>'+esc(x[1])+'</small></span>'; }).join('')+'</div>'
  +'<div class="zb-flow">'+d.flow.map(function(x,i){ return (i?'<i>›</i>':'')+'<span'+(/alg/.test(x)?' class="on"':'')+'>'+esc(x)+'</span>'; }).join('')+'</div>'
  +(own?'<div class="zb-pr"><div class="prog" style="flex:1"><i style="width:'+(n/t*100).toFixed(1)+'%"></i></div><span class="mono">'+n+' / '+t+' learned</span></div>':'')+'</div>'
  +'<h3 class="zb-h">The lesson</h3><div class="zb-steps">'+d.steps.map(function(s,i){ return '<details class="zb-step"'+(i===0?' open':'')+'><summary><em>'+(i+1)+'</em><b>'+esc(s[0])+'</b><i></i></summary><ul>'+s[1].map(function(x){ return '<li>'+esc(x)+'</li>'; }).join('')+'</ul></details>'; }).join('')+'</div>'
  +'<h3 class="zb-h">The '+d.free.length+' sets</h3><div class="zb-grid">'+d.free.map(function(s){ return setCard(k,s); }).join('')+'</div>'
  +(own?'':lockHtml(k))
  +'<h3 class="zb-h" id="pkLib">'+(own?'All '+t+' cases':'Free cases')+'</h3>'+(own?'':'<p class="zb-sub">One case from each set, free to try in the 3D room. Unlock the pack to get all '+t+'.</p>')+'</div>'; }
/* the Packs tab: one card per pack, ZBLL included */
function hub(){ var L=[['zbll','ZBLL','472 cases · whole last layer in one look',window.CWZBLL&&CWZBLL.owned(),20]].concat(['coll','ollcp','cll'].map(function(k){ return [k,PK[k].n,total(k)+' cases · '+PK[k].kick.toLowerCase(),owned(k),price(k)]; }));
  return '<div class="pnl zb-hero"><span class="zb-kick">Algorithm packs</span><h2>Go further than CFOP</h2><p>Each pack opens every case in the 3D room with step-by-step playback, a practice timer and recognition drills. Every pack has free cases to try first.</p></div>'
   +'<div class="pk-hub">'+L.map(function(x){ var learned=x[0]==='zbll'?0:(x[3]?learnedIn(x[0],''):0); return '<a class="pnl pk-card" href="#learn/'+x[0]+'"><b>'+esc(x[1])+'</b><span class="muted">'+esc(x[2])+'</span><em class="'+(x[3]?'own':'')+'">'+(x[3]?'Unlocked'+(learned?' · '+learned+' learned':''):'RM '+x[4]+' · free cases inside')+'</em></a>'; }).join('')+'</div>'; }
function call(b){ b.id=CW.devId(); return CW.call('/api/zb',b,9000).then(function(r){ return r&&r.ok&&r.data&&r.data.ok?r.data:{err:(r&&r.data&&r.data.error)||'Could not reach the server. Try again.'}; }); }
function redraw(k){ if(location.hash.indexOf('#learn/'+k)===0) window.dispatchEvent(new HashChangeEvent('hashchange')); }
function lockPaint(k){ var e=document.getElementById('pkLock'); if(e) e.outerHTML=lockHtml(k); }
function refresh(k){ if(typeof CW==='undefined'||!CW.call||!PK[k]) return; call({act:'st',pk:k}).then(function(d){ if(d.err) return; ST[k]=d;
  if(d.un&&!cached(k)){ call({act:'get',pk:k}).then(function(g){ if(g.pack){ PK[k].pack=g.pack; try{ localStorage.setItem('cw_pk_'+k,JSON.stringify(g.pack)); }catch(e){} if(CW.toast) CW.toast('Full '+PK[k].n+' pack unlocked.'); redraw(k); } }); }
  else if(!d.un&&cached(k)){ PK[k].pack=null; try{ localStorage.removeItem('cw_pk_'+k); }catch(e){} redraw(k); }
  else lockPaint(k); }); }
function mount(el,k){ if(!PK[k]) return; refresh(k); var root=el.querySelector('[data-pkroot]'); if(!root||root._pk) return; root._pk=1;
  root.addEventListener('click',function(e){ var g=e.target.closest('[data-pkg]'); if(g){ e.stopPropagation(); var sel=document.getElementById('lG'); if(sel){ sel.value=g.getAttribute('data-pkg'); sel.dispatchEvent(new Event('change',{bubbles:true})); setTimeout(function(){ var l=document.getElementById('pkLib'); if(l) l.scrollIntoView({behavior:'smooth'}); },60); } return; }
    var b=e.target.closest('[data-pkf]'); if(!b) return; e.stopPropagation(); var f=b.getAttribute('data-pkf');
    if(f==='pay'){ PAY[k]=true; lockPaint(k); }
    else if(f==='copy'){ try{ navigator.clipboard.writeText(TNG); if(CW.toast) CW.toast('Number copied'); }catch(x){} }
    else if(f==='check'){ refresh(k); if(CW.toast) CW.toast('Checking…'); }
    else if(f==='send'){ var ref=(document.getElementById('pkRef').value||'').trim(), cc=(document.getElementById('pkCC').value||'').trim(); if(ref.length<4){ CW.toast('Enter the transaction ID from your TNG app.'); return; } if(BUSY[k]) return; BUSY[k]=true; b.disabled=true;
      call({act:'req',pk:k,ref:ref,cc:cc}).then(function(d){ BUSY[k]=false; if(d.err){ CW.toast(d.err); b.disabled=false; return; } ST[k]=ST[k]||{}; ST[k].no=0; ST[k].req=d.un?null:(d.req||{ref:ref}); PAY[k]=false; lockPaint(k); if(d.un) refresh(k); }); } }); }
window.CWPacks={on:on,PK:PK,cases:cases,owned:owned,svg:svg,html:html,hub:hub,mount:mount,total:total,two:function(k){ return !!(PK[k]&&PK[k].two); }};
})();
