/* Update 7 timer tools: solve replay (records each solve with the camera, kept on this device only, last 10)
   and a Cubexer review of today's session with links to the right drills. */
(function(){
var $=function(s,r){ return (r||document).querySelector(s); };
var esc=function(s){ return String(s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
var R={on:false,stream:null,rec:null,chunks:[],mime:'',t0:0,list:[],url:null}, RV={busy:false,text:'',left:null,err:''};
function on(){ return !!(window.PL&&PL.updOn7&&PL.updOn7()); }
function fmt(ms){ return PL.fmt?PL.fmt(ms):(ms/1000).toFixed(2); }
/* ---------- tiny IndexedDB store ---------- */
var DB=null;
function db(){ if(DB) return DB; DB=new Promise(function(ok,no){ try{ var q=indexedDB.open('cw_replay',1); q.onupgradeneeded=function(){ q.result.createObjectStore('v',{keyPath:'id'}); }; q.onsuccess=function(){ ok(q.result); }; q.onerror=function(){ no(q.error); }; }catch(e){ no(e); } }); return DB; }
function tx(mode,fn){ return db().then(function(d){ return new Promise(function(ok,no){ var t=d.transaction('v',mode), s=t.objectStore('v'), r=fn(s); t.oncomplete=function(){ ok(r&&r.result); }; t.onerror=function(){ no(t.error); }; }); }); }
function loadList(){ return tx('readonly',function(s){ return s.getAll(); }).then(function(a){ R.list=(a||[]).sort(function(x,y){ return y.id-x.id; }); return R.list; }).catch(function(){ R.list=[]; return []; }); }
function put(o){ return tx('readwrite',function(s){ s.put(o); }).then(function(){ return loadList(); }).then(function(L){ var old=L.slice(10); return Promise.all(old.map(function(x){ return tx('readwrite',function(s){ s.delete(x.id); }); })); }).then(loadList); }
function del(id){ return tx('readwrite',function(s){ s.delete(id); }).then(loadList); }
/* ---------- camera ---------- */
function pickMime(){ if(!window.MediaRecorder) return ''; var c=['video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm']; for(var i=0;i<c.length;i++){ try{ if(MediaRecorder.isTypeSupported(c[i])) return c[i]; }catch(e){} } return ''; }
function camOn(){ if(R.stream) return Promise.resolve(); if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!window.MediaRecorder) return Promise.reject(new Error('This browser cannot record video.'));
  return navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480},frameRate:{ideal:30}},audio:false}).then(function(st){ R.stream=st; R.mime=pickMime(); var v=$('#t7Cam'); if(v){ v.srcObject=st; v.play().catch(function(){}); } }); }
function camOff(){ if(R.rec&&R.rec.state!=='inactive') try{ R.rec.stop(); }catch(e){} R.rec=null; if(R.stream){ R.stream.getTracks().forEach(function(t){ t.stop(); }); R.stream=null; } R.on=false; }
function recStart(){ if(!R.on||!R.stream) return; try{ R.chunks=[]; R.rec=new MediaRecorder(R.stream,R.mime?{mimeType:R.mime,videoBitsPerSecond:1.2e6}:{}); R.rec.ondataavailable=function(e){ if(e.data&&e.data.size) R.chunks.push(e.data); }; R.rec.start(250); R.t0=performance.now(); }catch(e){ R.rec=null; } }
function recStop(info){ var r=R.rec; if(!r||r.state==='inactive') return; R.rec=null; setTimeout(function(){ r.onstop=function(){ var b=new Blob(R.chunks,{type:R.mime||'video/webm'}); R.chunks=[]; if(b.size<2000) return; put({id:Date.now(),t:info.t,p:info.p||0,scr:info.scr||'',cube:info.cube||'333',blob:b}).then(paint).catch(function(){}); }; try{ r.stop(); }catch(e){} },500); }
/* ---------- session numbers ---------- */
function session(){ var d=PL.T&&PL.T.data?PL.T.data():null; if(!d) return {L:[],cube:'333'}; var L=(d.solves[d.cube]||[]), mid=new Date(); mid.setHours(0,0,0,0); return {L:L.filter(function(x){ return x.d>=mid.getTime()&&x.p!==2; }).slice(-60),all:L,cube:d.cube}; }
function splits(L){ var S=L.filter(function(x){ return x.sp&&x.sp.length===3; }); if(!S.length) return null; var a=[0,0,0,0]; S.forEach(function(x){ var tt=x.t; a[0]+=x.sp[0]; a[1]+=x.sp[1]-x.sp[0]; a[2]+=x.sp[2]-x.sp[1]; a[3]+=tt-x.sp[2]; }); return a.map(function(v){ return Math.round(v/S.length); }); }
function drillLinks(sp){ var L=[]; if(sp){ var T=sp[0]+sp[1]+sp[2]+sp[3], share=[.12,.5,.18,.2], nm=['Cross','F2L','OLL','PLL'], hs=['learn/cross','learn/f2l','learn/oll','learn/pll'], worst=0, wv=-1; sp.forEach(function(v,i){ var over=v/T-share[i]; if(over>wv){ wv=over; worst=i; } }); L.push(['Practise '+nm[worst]+' (your slowest step)',hs[worst]]); }
  L.push(['Drill your algorithms','learn/drill']); return L; }
/* ---------- panel ---------- */
function html(){ var S=session(), sp=splits(S.L);
  var h='<h3 style="margin:0 0 4px">Solve replay</h3><p class="muted" style="font-size:13.5px;margin:0 0 8px">Turn on the camera and every solve is recorded from the moment the timer starts. Watch it back in slow motion to spot pauses. Videos stay on this device (last 10).</p>'
   +'<div class="row" style="gap:10px;flex-wrap:wrap;align-items:center"><button type="button" class="btn sm '+(R.on?'':'pri')+'" data-t7="cam">'+(R.on?'Stop camera':'Record my solves')+'</button>'+(R.on?'<video id="t7Cam" muted playsinline style="width:120px;height:90px;object-fit:cover;border-radius:10px;background:#000;transform:scaleX(-1)"></video><span class="muted" style="font-size:13px">Recording starts with the timer.</span>':'')+'</div>'
   +(R.list.length?'<div class="t7-list">'+R.list.map(function(x){ return '<div class="row t7-it"><button type="button" class="btn sm" data-t7p="'+x.id+'">▶ '+(x.p===2?'DNF':fmt(x.t+(x.p===1?2000:0)))+'</button><span class="muted mono" style="font-size:12.5px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(x.scr)+'</span><span class="muted" style="font-size:12px">'+new Date(x.id).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})+'</span><button type="button" class="btn sm" data-t7d="'+x.id+'" aria-label="Delete">✕</button></div>'; }).join('')+'</div>':'<p class="muted" style="font-size:13px;margin:8px 0 0">No replays yet.</p>')
   +'<div id="t7Play"></div>'
   +'<h3 style="margin:18px 0 4px">Cubexer session review</h3><p class="muted" style="font-size:13.5px;margin:0 0 8px">Today: <b>'+S.L.length+'</b> solves'+(S.L.length?' · mean <b>'+fmt(S.L.reduce(function(a,x){ return a+x.t+(x.p===1?2000:0); },0)/S.L.length)+'</b>':'')+(sp?' · steps '+sp.map(fmt).join(' / '):'')+'. Cubexer reads your times and tells you what to work on next. 3 reviews a day.</p>'
   +(RV.text?'<p class="coAns" style="margin:0 0 8px;line-height:1.55">'+esc(RV.text)+'</p><div class="row" style="gap:8px;flex-wrap:wrap">'+drillLinks(sp).map(function(l){ return '<a class="btn sm" href="#'+l[1]+'">'+esc(l[0])+'</a>'; }).join('')+'</div>':'')
   +(RV.err?'<p class="muted" style="color:var(--red,#e1352b);font-size:13px">'+esc(RV.err)+'</p>':'')
   +'<div class="row" style="gap:8px;margin-top:8px"><button type="button" class="btn sm pri" data-t7="rev"'+(RV.busy||S.L.length<5?' disabled':'')+'>'+(RV.busy?'Cubexer is reading…':S.L.length<5?'Do 5 solves today first':'Review today’s session')+'</button>'+(RV.left!=null?'<span class="muted" style="font-size:12.5px">'+RV.left+' left today</span>':'')+'</div>';
  return h; }
function paint(){ var b=document.getElementById('tTools7'); if(!b) return; var pl=$('#t7Play'), keep=pl&&pl.innerHTML; b.innerHTML=html(); if(keep&&R.url){ var p2=$('#t7Play'); if(p2){ p2.innerHTML=keep; bindPlayer(); } } var v=$('#t7Cam'); if(v&&R.stream){ v.srcObject=R.stream; v.play().catch(function(){}); } }
function bindPlayer(){ var v=$('#t7V'), o=$('#t7O'); if(!v) return; var raf=0; (function tk(){ if(!document.body.contains(v)) return; if(o) o.textContent=(v.currentTime).toFixed(2); raf=requestAnimationFrame(tk); })();
  [].forEach.call(document.querySelectorAll('[data-t7s]'),function(b){ b.onclick=function(){ v.playbackRate=+b.getAttribute('data-t7s'); [].forEach.call(document.querySelectorAll('[data-t7s]'),function(x){ x.setAttribute('aria-pressed',x===b); }); }; }); }
function play(id){ var x=R.list.filter(function(y){ return y.id===id; })[0], pl=$('#t7Play'); if(!x||!pl) return; if(R.url) try{ URL.revokeObjectURL(R.url); }catch(e){} R.url=URL.createObjectURL(x.blob);
  pl.innerHTML='<div class="t7-pl"><div style="position:relative"><video id="t7V" src="'+R.url+'" playsinline controls style="width:100%;max-height:360px;border-radius:12px;background:#000;transform:scaleX(-1)"></video><span id="t7O" class="mono t7-ov">0.00</span></div><div class="row" style="gap:8px;margin-top:6px;flex-wrap:wrap"><span class="seg"><button type="button" data-t7s=".25" aria-pressed="false">0.25×</button><button type="button" data-t7s=".5" aria-pressed="true">0.5×</button><button type="button" data-t7s="1" aria-pressed="false">1×</button></span><span class="sp"></span><span class="muted" style="font-size:12.5px">Final time '+(x.p===2?'DNF':fmt(x.t+(x.p===1?2000:0)))+'</span></div></div>';
  var v=$('#t7V'); v.playbackRate=.5; v.addEventListener('loadedmetadata',function(){ v.playbackRate=.5; }); bindPlayer(); try{ v.play(); }catch(e){} }
function review(){ var S=session(); if(S.L.length<5||RV.busy) return; RV.busy=true; RV.err=''; paint();
  var b={id:CW.devId(),cube:S.cube,t:S.L.map(function(x){ return x.t+(x.p===1?2000:0); }),pb:PL.T.best(S.all)||0}, sp=splits(S.L); if(sp) b.sp=sp;
  CW.call('/api/treview',b,30000).then(function(r){ RV.busy=false; var d=r&&r.data; if(d&&d.ok){ RV.text=d.text; RV.left=d.left; } else { RV.err=(d&&d.error)||'Could not reach Cubexer. Try again.'; if(d&&d.left!=null) RV.left=d.left; } paint(); }); }
function bind(box){ if(box._t7) return; box._t7=1; ['pointerdown','pointerup','touchstart','touchend','mousedown','mouseup','keydown','keyup'].forEach(function(n){ box.addEventListener(n,function(e){ e.stopPropagation(); }); });
  box.addEventListener('click',function(e){ var t=e.target, a=t.closest('[data-t7]'), p=t.closest('[data-t7p]'), d=t.closest('[data-t7d]'); if(!a&&!p&&!d) return; e.stopPropagation();
    if(p) return play(+p.getAttribute('data-t7p')); if(d){ var id=+d.getAttribute('data-t7d'); del(id).then(function(){ var pl=$('#t7Play'); if(pl) pl.innerHTML=''; paint(); }); return; }
    var k=a.getAttribute('data-t7'); if(k==='cam'){ if(R.on){ camOff(); paint(); } else camOn().then(function(){ R.on=true; paint(); }).catch(function(er){ CW.toast((er&&er.name==='NotAllowedError')?'Camera blocked. Allow the camera in your browser settings.':((er&&er.message)||'Camera not available.')); }); }
    else if(k==='rev') review(); }); }
PL.onUpd7&&PL.onUpd7(function(){
  var TV=PL.views.timer; if(!TV||TV._t7) return; TV._t7=1; var to=TV.show;
  TV.show=function(el){ var r=to.apply(this,arguments); try{ var wrap=el.querySelector('.wrap'); if(wrap&&!el.querySelector('#tTools7')){ var box=document.createElement('div'); box.className='pnl'; box.id='tTools7'; box.style.marginTop='14px'; wrap.appendChild(box); bind(box); loadList().then(paint); paint(); if(RV.left==null&&CW.call) CW.call('/api/treview',{id:CW.devId(),act:'cfg'},6000).then(function(r2){ if(r2&&r2.data&&r2.data.ok){ RV.left=r2.data.left; paint(); } }); } }catch(e){ console.error(e); } return r; };
  var lv=TV.leave; TV.leave=function(){ camOff(); if(lv) return lv.apply(this,arguments); };
  var ps=PL.solveStart; PL.solveStart=function(){ if(ps) try{ ps.apply(this,arguments); }catch(e){} try{ recStart(); }catch(e){} };
  var sd=PL.solveDone; PL.solveDone=function(rec,cube,L){ if(sd) try{ sd(rec,cube,L); }catch(e){} try{ recStop({t:rec.t,p:rec.p,scr:rec.scr,cube:cube}); }catch(e){} try{ var b=document.getElementById('tTools7'); if(b&&!(document.activeElement&&b.contains(document.activeElement))) setTimeout(paint,50); }catch(e){} };
  if(/^#timer/.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange'));
});
})();
