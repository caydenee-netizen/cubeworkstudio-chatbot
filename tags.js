/* @tags in chat: type @ to pick a name, and the person you tag gets a notification (even if their chat is closed, and when they come back online). */
(function(){
if(!window.PL) return; var LV=PL.live;
function esc(t){ return String(t).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function key(n){ return String(n||'').replace(/\s+/g,''); }
/* ---------- picker ---------- */
var box=null, cur=null, onl={t:0,l:[]};
function names(q,cb){ var out=[], seen={}, me=key(PL.name()).toLowerCase(); function add(n){ var k=key(n); if(!k||k.toLowerCase()===me||seen[k.toLowerCase()]) return; if(q&&k.toLowerCase().indexOf(q)!==0) return; seen[k.toLowerCase()]=1; out.push(k); }
  (LV.chat||[]).slice().reverse().forEach(function(m){ add(m.n); }); onl.l.forEach(add); cb(out.slice(0,8));
  if(Date.now()-onl.t>8000){ onl.t=Date.now(); CW.call('/api/online',{id:CW.devId(),q:''},5000).then(function(r){ if(r&&r.ok&&r.data&&r.data.list){ onl.l=r.data.list.map(function(x){ return x.n; }); if(cur) refresh(cur); } }); } }
function hide(){ if(box) box.hidden=true; }
function refresh(inp){ var v=inp.value, pos=inp.selectionStart==null?v.length:inp.selectionStart, m=/(^|\s)@([A-Za-z0-9_.\-]{0,24})$/.exec(v.slice(0,pos)); if(!m){ hide(); return; }
  names(m[2].toLowerCase(),function(L){ if(!L.length){ hide(); return; } if(!box){ box=document.createElement('div'); box.className='tg-pick'; document.body.appendChild(box);
      box.addEventListener('pointerdown',function(e){ var b=e.target.closest('[data-n]'); if(!b) return; e.preventDefault(); pick(b.getAttribute('data-n')); }); }
    box.innerHTML='<small>Tag someone</small>'+L.map(function(n){ return '<button type="button" data-n="'+esc(n)+'"><b>@</b>'+esc(n)+'</button>'; }).join('');
    var r=inp.getBoundingClientRect(); box.style.left=Math.max(8,r.left)+'px'; box.style.bottom=(innerHeight-r.top+8)+'px'; box.style.maxWidth=Math.min(360,innerWidth-16)+'px'; box.hidden=false; }); }
function pick(n){ var inp=cur; if(!inp) return; var v=inp.value, pos=inp.selectionStart==null?v.length:inp.selectionStart, pre=v.slice(0,pos).replace(/@[A-Za-z0-9_.\-]{0,24}$/,'@'+n+' '); inp.value=pre+v.slice(pos); inp.focus(); try{ inp.setSelectionRange(pre.length,pre.length); }catch(e){} hide(); }
document.addEventListener('input',function(e){ var t=e.target; if(!t||(t.id!=='c3I'&&t.id!=='cIn')) return; cur=t; refresh(t); },true);
document.addEventListener('focusout',function(e){ if(e.target===cur) setTimeout(hide,150); },true);
document.addEventListener('keydown',function(e){ if(!box||box.hidden||e.target!==cur) return; if(e.key==='Escape'){ hide(); return; } if(e.key==='Tab'){ var f=box.querySelector('[data-n]'); if(f){ e.preventDefault(); pick(f.getAttribute('data-n')); } } },true);
/* tap a highlighted @name in chat to start a reply that tags them back */
document.addEventListener('click',function(e){ var t=e.target.closest&&e.target.closest('.c3-mn[data-tag]'); if(!t) return; var i=document.getElementById('c3I'); if(!i) return; var n=t.getAttribute('data-tag'); if(key(PL.name()).toLowerCase()===n.toLowerCase()) return; i.value=(i.value&&!/\s$/.test(i.value)?i.value+' ':i.value)+'@'+n+' '; i.focus(); });
/* ---------- you were tagged ---------- */
var SEEN='cw_tag_seen'; function seen(){ return +(localStorage.getItem(SEEN)||0); }
var AC=null; function ping(){ try{ if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)(); var t=AC.currentTime; [880,1320].forEach(function(f,i){ var o=AC.createOscillator(), g=AC.createGain(); o.frequency.value=f; g.gain.setValueAtTime(.0001,t+i*.12); g.gain.exponentialRampToValueAtTime(.12,t+i*.12+.01); g.gain.exponentialRampToValueAtTime(.0001,t+i*.12+.25); o.connect(g); g.connect(AC.destination); o.start(t+i*.12); o.stop(t+i*.12+.3); }); }catch(e){} try{ navigator.vibrate&&navigator.vibrate([60,40,60]); }catch(e){} }
function show(list){ var x=list[list.length-1], more=list.length-1, b=document.createElement('button'); b.type='button'; b.className='tg-note';
  b.innerHTML='<span class="tg-ic">@</span><span class="tg-tx"><b>'+esc(x.n)+' tagged you'+(more>0?' <small>+'+more+' more</small>':'')+'</b><span>'+esc(x.t)+'</span></span>';
  b.onclick=function(){ b.remove(); if(PL.chat2&&PL.chat2.goto) PL.chat2.goto(x.ch,x.s); };
  document.body.appendChild(b); requestAnimationFrame(function(){ b.classList.add('in'); }); setTimeout(function(){ b.classList.remove('in'); setTimeout(function(){ b.remove(); },400); },7000); ping();
  var fab=document.querySelector('.fab .chat'); if(fab&&!PL.chat2Open) fab.classList.add('tg-dot'); }
PL.onLive(function(){ var L=LV.mnq||[]; if(!L.length) return; var s0=seen(), fresh=L.filter(function(x){ return x.at>s0; }); if(!fresh.length) return;
  localStorage.setItem(SEEN,String(Math.max.apply(null,L.map(function(x){ return x.at; }))));
  if(PL.chat2Open&&document.querySelector('.c3-m[data-s="'+fresh[fresh.length-1].s+'"]')){ ping(); return; } show(fresh); });
document.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('.fab .chat')){ var f=document.querySelector('.fab .chat'); if(f) f.classList.remove('tg-dot'); } },true);
})();
