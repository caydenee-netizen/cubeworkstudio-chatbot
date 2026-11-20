/* Update 7: Blind upgrades on the Learn → Blind tab. A letter-pair trainer (your own word for every Speffz pair, then quiz yourself)
   and a full blindfolded solve timer that splits memo and execution. Everything stays on this device. */
(function(){
var esc=function(s){ return String(s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
var LET='ABCDEFGHIJKLMNOPQRSTUVWX'.split('');
function lj(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)||'null'); return v==null?d:v; }catch(e){ return d; } }
function sj(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
var S={tab:'pairs',pair:null,show:false,mode:'set',st:{ok:0,miss:0},tm:{ph:'idle',t0:0,m:0,e:0,scr:''},raf:0};
function words(){ var o=lj('cw_bld_lp',{}); return o&&typeof o==='object'?o:{}; }
function allPairs(){ var a=[]; LET.forEach(function(x){ LET.forEach(function(y){ if(x!==y) a.push(x+y); }); }); return a; }
function pick(){ var W=words(), P=allPairs(), pool;
  if(S.mode==='quiz'){ pool=P.filter(function(p){ return W[p]; }); var R=lj('cw_bld_lpr',{}); pool.sort(function(a,b){ return (R[a]||0)-(R[b]||0); }); pool=pool.slice(0,Math.max(4,Math.ceil(pool.length/3))); }
  else pool=P.filter(function(p){ return !W[p]; });
  if(!pool.length) pool=P; var p; do{ p=pool[Math.floor(Math.random()*pool.length)]; }while(pool.length>1&&p===S.pair); S.pair=p; S.show=false; }
function scr(){ var F='URFDLB', AX={U:0,D:0,R:1,L:1,F:2,B:2}, out=[]; while(out.length<20){ var f=F[Math.floor(Math.random()*6)], n=out.length, a=n?out[n-1][0]:'', b=n>1?out[n-2][0]:''; if(f===a) continue; if(a&&AX[f]===AX[a]&&b===f) continue; out.push(f+['',"'",'2'][Math.floor(Math.random()*3)]); } return out.join(' '); }
function fmt(ms){ return ms>=60000?Math.floor(ms/60000)+':'+('0'+((ms%60000)/1000).toFixed(2)).slice(-5):(ms/1000).toFixed(2); }
function hist(){ var h=lj('cw_bld_t',[]); return Array.isArray(h)?h:[]; }
function pairsHtml(){ var W=words(), n=Object.keys(W).length, T=allPairs().length; if(!S.pair) pick();
  var h='<p class="muted" style="font-size:14px">Fast blind solvers turn each pair of letters into a word or picture, then make a story. Give every pair your own word once, then quiz yourself until it is instant.</p>'
   +'<div class="row" style="gap:8px;flex-wrap:wrap;margin:8px 0"><div class="seg"><button type="button" data-b7m="set" aria-pressed="'+(S.mode==='set')+'">Add words</button><button type="button" data-b7m="quiz" aria-pressed="'+(S.mode==='quiz')+'">Quiz me</button></div><span class="sp"></span><span class="mono muted" style="font-size:13px">'+n+' / '+T+' pairs have a word</span></div>'
   +'<div class="prog" style="margin-bottom:12px"><i style="width:'+(n/T*100).toFixed(1)+'%"></i></div>'
   +'<div style="text-align:center;margin:10px 0"><div class="mono" style="font:800 64px var(--display);letter-spacing:.12em">'+S.pair+'</div></div>';
  if(S.mode==='set') h+='<div class="row" style="gap:8px;justify-content:center;flex-wrap:wrap"><input class="inp" id="b7W" maxlength="24" placeholder="Your word for '+S.pair+'" value="'+esc(W[S.pair]||'')+'" autocomplete="off" style="max-width:260px"><button type="button" class="btn pri" data-b7="save">Save</button><button type="button" class="btn sm" data-b7="skip">Skip</button></div>';
  else if(!n) h+='<p class="muted" style="text-align:center">Add a few words first, then come back to quiz yourself.</p>';
  else if(!S.show) h+='<div class="row" style="justify-content:center"><button type="button" class="btn pri" data-b7="reveal">Say your word, then reveal</button></div>';
  else h+='<p style="text-align:center;font:700 26px var(--display);margin:4px 0 12px">'+esc(W[S.pair]||'')+'</p><div class="row" style="gap:8px;justify-content:center"><button type="button" class="btn pri" data-b7="ok">Got it</button><button type="button" class="btn" data-b7="miss">Missed</button></div><p class="muted mono" style="text-align:center;font-size:13px;margin-top:8px">'+S.st.ok+' right · '+S.st.miss+' missed this session</p>';
  return h; }
function timerHtml(){ var t=S.tm, H=hist(), ok=H.filter(function(x){ return x.ok; }), best=ok.length?Math.min.apply(null,ok.map(function(x){ return x.t; })):0;
  if(!t.scr) t.scr=scr();
  var h='<p class="muted" style="font-size:14px">A full blindfolded solve with the split timer. Tap Start to begin memo, tap again when you put the blindfold on, and tap Stop when you are done. Then say whether it was solved.</p>'
   +'<p class="mono" style="word-spacing:.2em;margin:10px 0">'+esc(t.scr)+'</p>'
   +'<div style="text-align:center;margin:8px 0"><div class="mono" id="b7T" style="font:800 54px var(--display)">'+(t.ph==='idle'?'0.00':fmt(t.ph==='done'?t.m+t.e:t.m))+'</div><div class="muted mono" id="b7S" style="font-size:13px">'+(t.ph==='done'||t.ph==='exec'?'Memo '+fmt(t.m)+(t.ph==='done'?' · Execution '+fmt(t.e):''):'Memo · Execution')+'</div></div>'
   +'<div class="row" style="gap:8px;justify-content:center;flex-wrap:wrap">'
   +(t.ph==='idle'?'<button type="button" class="btn pri" data-b7="go">Start memo</button><button type="button" class="btn sm" data-b7="newscr">New scramble</button>':t.ph==='memo'?'<button type="button" class="btn pri" data-b7="exec">Blindfold on: start execution</button>':t.ph==='exec'?'<button type="button" class="btn pri" data-b7="stop">Stop</button>':'<button type="button" class="btn pri" data-b7="solved">Solved</button><button type="button" class="btn" data-b7="dnf">DNF</button>')+'</div>'
   +'<div class="stats" style="margin-top:12px"><div><small>Best success</small><b class="mono">'+(best?fmt(best):'–')+'</b></div><div><small>Success rate</small><b class="mono">'+(H.length?Math.round(ok.length/H.length*100)+'%':'–')+'</b></div><div><small>Attempts</small><b class="mono">'+H.length+'</b></div></div>'
   +(H.length?'<div style="margin-top:10px">'+H.slice(-8).reverse().map(function(x){ return '<div class="row mono" style="font-size:13px;gap:10px;padding:4px 0;border-top:1px solid var(--line,#2224)"><b style="min-width:70px">'+(x.ok?fmt(x.t):'DNF')+'</b><span class="muted">memo '+fmt(x.m)+' · exec '+fmt(x.e)+'</span><span class="sp"></span><span class="muted">'+new Date(x.at).toLocaleDateString()+'</span></div>'; }).join('')+'</div>':'');
  return h; }
function body(){ return S.tab==='pairs'?pairsHtml():timerHtml(); }
function html(){ return '<div class="pnl" data-b7root style="max-width:700px;margin:12px auto 0"><div class="row" style="gap:8px"><h3 style="margin:0">Blind training</h3><span class="sp"></span><div class="seg"><button type="button" data-b7t="pairs" aria-pressed="'+(S.tab==='pairs')+'">Letter pairs</button><button type="button" data-b7t="timer" aria-pressed="'+(S.tab==='timer')+'">BLD timer</button></div></div><div id="b7B" style="margin-top:10px">'+body()+'</div></div>'; }
function paint(){ var b=document.getElementById('b7B'); if(b) b.innerHTML=body(); var r=document.querySelector('[data-b7root]'); if(r) [].forEach.call(r.querySelectorAll('[data-b7t]'),function(x){ x.setAttribute('aria-pressed',x.getAttribute('data-b7t')===S.tab); }); }
function tick(){ cancelAnimationFrame(S.raf); var t=S.tm; if(t.ph!=='memo'&&t.ph!=='exec') return; var el=document.getElementById('b7T'); if(!el) return; var now=performance.now(); el.textContent=fmt(t.ph==='memo'?now-t.t0:t.m+(now-t.t0)); S.raf=requestAnimationFrame(tick); }
function act(a){ var t=S.tm, now=performance.now();
  if(a==='save'){ var w=(document.getElementById('b7W').value||'').trim().slice(0,24); var W=words(); if(w) W[S.pair]=w; else delete W[S.pair]; sj('cw_bld_lp',W); pick(); }
  else if(a==='skip') pick();
  else if(a==='reveal') S.show=true;
  else if(a==='ok'||a==='miss'){ var R=lj('cw_bld_lpr',{}); R[S.pair]=a==='ok'?(R[S.pair]||0)+1:0; sj('cw_bld_lpr',R); S.st[a]++; pick(); }
  else if(a==='newscr') t.scr=scr();
  else if(a==='go'){ t.ph='memo'; t.t0=now; t.m=0; t.e=0; }
  else if(a==='exec'){ t.m=now-t.t0; t.t0=now; t.ph='exec'; }
  else if(a==='stop'){ t.e=now-t.t0; t.ph='done'; }
  else if(a==='solved'||a==='dnf'){ var H=hist(); H.push({ok:a==='solved'?1:0,t:Math.round(t.m+t.e),m:Math.round(t.m),e:Math.round(t.e),at:Date.now()}); sj('cw_bld_t',H.slice(-200)); if(a==='solved'&&window.CW&&CW.toast) CW.toast('Blind solve saved: '+fmt(t.m+t.e)); t.ph='idle'; t.scr=scr(); }
  paint(); if(t.ph==='memo'||t.ph==='exec') tick(); var inp=document.getElementById('b7W'); if(inp&&a!=='reveal') try{ inp.focus({preventScroll:true}); }catch(e){} }
function mount(el){ var r=el.querySelector('[data-b7root]'); if(!r||r._b7) return; r._b7=1; if(S.tm.ph==='memo'||S.tm.ph==='exec') tick();
  r.addEventListener('click',function(e){ var x=e.target.closest('[data-b7],[data-b7t],[data-b7m]'); if(!x) return; e.stopPropagation();
    if(x.hasAttribute('data-b7t')){ S.tab=x.getAttribute('data-b7t'); paint(); if(S.tm.ph==='memo'||S.tm.ph==='exec') tick(); return; }
    if(x.hasAttribute('data-b7m')){ S.mode=x.getAttribute('data-b7m'); S.pair=null; pick(); var r2=document.querySelector('[data-b7root]'); paint(); if(r2) [].forEach.call(r2.querySelectorAll('[data-b7m]'),function(y){ y.setAttribute('aria-pressed',y.getAttribute('data-b7m')===S.mode); }); return; }
    act(x.getAttribute('data-b7')); });
  r.addEventListener('keydown',function(e){ if(e.key==='Enter'&&e.target&&e.target.id==='b7W'){ e.preventDefault(); act('save'); } }); }
window.CWBld7={html:html,mount:mount};
})();
