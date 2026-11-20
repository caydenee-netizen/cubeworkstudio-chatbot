/* PB Cam: film your solves with the iPad camera. The timer is drawn into the video (inspection, live time,
   final time and NEW PB), recording starts when you arm it and stops a few seconds after the solve. */
(function(){
'use strict';
if(typeof CW==='undefined'||!window.PL||!PL.T) return;
var esc=CW.esc, T=PL.T;
var NAMES={'222':'2×2','333':'3×3','444':'4×4','555':'5×5','666':'6×6','777':'7×7','3h':'3×3 One-Handed',pyr:'Pyraminx',skb:'Skewb',mega:'Megaminx'};
var K={on:false,st:null,mic:null,face:'user',snd:true,v:null,cv:null,cx:null,rec:null,parts:[],phase:'idle',start:0,res:null,pb:false,raf:0,endAt:0,armAt:0,mime:'',cube:'333',ao5:null,stopT:0};
function fmt(ms){ return T.fmt?T.fmt(ms):(ms/1000).toFixed(2); }
function live(ms){ ms=Math.max(0,ms); var s=ms/1000, m=Math.floor(s/60); return m?m+':'+(s-m*60).toFixed(2).padStart(5,'0'):s.toFixed(2); }
function val(x){ return x.p===2?Infinity:x.t+(x.p===1?2000:0); }
function pickMime(){ if(!window.MediaRecorder) return null; var L=['video/mp4;codecs=avc1,mp4a','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm']; for(var i=0;i<L.length;i++){ try{ if(MediaRecorder.isTypeSupported(L[i])) return L[i]; }catch(e){} } return ''; }
function supported(){ return !!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder&&HTMLCanvasElement.prototype.captureStream); }

/* ---------- camera ---------- */
async function camOn(){ camStop();
  try{ K.st=await navigator.mediaDevices.getUserMedia({video:{facingMode:K.face,width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:30}},audio:false}); }
  catch(e){ CW.toast('Allow the camera to use PB Cam.'); close(); return false; }
  if(K.snd&&!K.mic){ try{ K.mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false}}); }catch(e){ K.mic=null; K.snd=false; } }
  K.v.srcObject=K.st; K.v.muted=true; K.v.playsInline=true; try{ await K.v.play(); }catch(e){}
  K.v.classList.toggle('mir',K.face==='user'); return true; }
function camStop(){ if(K.st){ K.st.getTracks().forEach(function(t){ t.stop(); }); K.st=null; } }
function micStop(){ if(K.mic){ K.mic.getTracks().forEach(function(t){ t.stop(); }); K.mic=null; } }

/* ---------- drawing (camera + overlay) ---------- */
function size(){ var vw=K.v.videoWidth||1280, vh=K.v.videoHeight||720, land=vw>=vh; return land?[1920,1080]:[1080,1920]; }
function rr(x,y,w,h,r){ var c=K.cx; c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function frame(){ K.raf=requestAnimationFrame(frame); if(!K.cv||!K.v||K.v.readyState<2) return; var c=K.cx, W=K.cv.width, H=K.cv.height, vw=K.v.videoWidth, vh=K.v.videoHeight;
  var s=Math.max(W/vw,H/vh), dw=vw*s, dh=vh*s; c.save(); if(K.face==='user'){ c.translate(W,0); c.scale(-1,1); } c.drawImage(K.v,(W-dw)/2,(H-dh)/2,dw,dh); c.restore();
  var u=Math.min(W,H)/1080, now=performance.now();
  /* brand */
  c.font='600 '+Math.round(30*u)+'px Inter, system-ui, sans-serif'; c.textBaseline='middle'; var bt='Cuber Tools · cubeworkstudio.com/play', bw=c.measureText(bt).width+40*u;
  c.fillStyle='rgba(0,0,0,.42)'; rr(32*u,32*u,bw,58*u,29*u); c.fill(); c.fillStyle='#fff'; c.fillText(bt,52*u,61*u);
  if(K.phase==='armed'||K.phase==='insp'||K.phase==='run'){ c.fillStyle='#e1352b'; c.beginPath(); c.arc(W-60*u,61*u,13*u,0,7); c.globalAlpha=.5+.5*Math.abs(Math.sin(now/400)); c.fill(); c.globalAlpha=1; }
  /* time */
  var txt='', sub=NAMES[K.cube]||'', col='#fff', big=1;
  if(K.phase==='armed'){ var tm=document.getElementById('tTm'), insp=tm&&tm.classList.contains('insp'); if(insp){ txt=tm.textContent; sub='Inspection'; col='#ffd24a'; } else { txt='0.00'; sub=(NAMES[K.cube]||'')+' · ready'; } }
  else if(K.phase==='run'){ txt=live(now-K.start); }
  else if(K.phase==='done'&&K.res){ txt=K.res.p===2?'DNF':fmt(val(K.res))+(K.res.p===1?'+':''); big=1.18; col=K.pb?'#ffd24a':'#fff'; sub=(NAMES[K.cube]||'')+(K.ao5?' · Ao5 '+fmt(K.ao5):''); }
  if(txt){ var fs=Math.round(150*u*big); c.font='800 '+fs+'px Inter, system-ui, sans-serif'; c.textAlign='center'; var tw=Math.max(c.measureText(txt).width+120*u,480*u), bx=(W-tw)/2, by=H-fs-150*u;
    c.fillStyle='rgba(0,0,0,.5)'; rr(bx,by,tw,fs+110*u,46*u); c.fill(); c.fillStyle=col; c.fillText(txt,W/2,by+fs*.62); c.font='600 '+Math.round(34*u)+'px Inter, system-ui, sans-serif'; c.fillStyle='rgba(255,255,255,.85)'; c.fillText(sub,W/2,by+fs+52*u); c.textAlign='left';
    if(K.phase==='done'&&K.pb){ var k=Math.min(1,(now-K.endAt)/350), sc=.6+.4*(1-Math.pow(1-k,3)); c.save(); c.translate(W/2,by-110*u); c.scale(sc,sc); c.rotate(-.04); c.font='900 '+Math.round(96*u)+'px Inter, system-ui, sans-serif'; c.textAlign='center';
      var g=c.createLinearGradient(-300*u,0,300*u,0); g.addColorStop(0,'#ffd24a'); g.addColorStop(1,'#ff7a1a'); c.lineWidth=14*u; c.strokeStyle='rgba(0,0,0,.55)'; c.strokeText('NEW PB!',0,0); c.fillStyle=g; c.fillText('NEW PB!',0,0); c.restore(); } }
  if(K.phase==='done'&&now-K.endAt<220){ c.fillStyle='rgba(255,255,255,'+(.55*(1-(now-K.endAt)/220))+')'; c.fillRect(0,0,W,H); } }

/* ---------- recording ---------- */
function arm(){ if(!K.st){ CW.toast('Camera is not on.'); return; } if(K.rec) return; var sz=size(); K.cv.width=sz[0]; K.cv.height=sz[1];
  var cs=K.cv.captureStream(30), tr=cs.getVideoTracks(); if(K.snd&&K.mic) tr=tr.concat(K.mic.getAudioTracks()); var ms=new MediaStream(tr);
  K.mime=pickMime(); var opt={videoBitsPerSecond:6000000}; if(K.mime) opt.mimeType=K.mime; try{ K.rec=new MediaRecorder(ms,opt); }catch(e){ try{ K.rec=new MediaRecorder(ms); }catch(e2){ CW.toast('This browser can’t record video.'); return; } }
  K.parts=[]; K.rec.ondataavailable=function(e){ if(e.data&&e.data.size) K.parts.push(e.data); }; K.rec.onstop=finish; K.rec.start(500);
  K.phase='armed'; K.armAt=performance.now(); K.res=null; K.pb=false; K.cube=(T.data()||{}).cube||'333'; ui();
  clearTimeout(K.stopT); K.stopT=setTimeout(function(){ if(K.rec&&K.phase!=='done'){ CW.toast('PB Cam stopped after 3 minutes.'); stopRec(); } },180000); }
function stopRec(){ clearTimeout(K.stopT); if(K.rec&&K.rec.state!=='inactive'){ try{ K.rec.stop(); }catch(e){} } }
function cancel(){ if(!K.rec) return; K.rec.onstop=null; stopRec(); K.rec=null; K.parts=[]; K.phase='idle'; ui(); }
function finish(){ var type=(K.rec&&K.rec.mimeType)||K.mime||'video/mp4'; K.rec=null; var blob=new Blob(K.parts,{type:type.split(';')[0]}); K.parts=[]; K.phase='idle'; ui(); if(blob.size<1000){ CW.toast('Nothing was recorded. Try again.'); return; } result(blob); }
function result(blob){ var ext=/mp4/.test(blob.type)?'mp4':'webm', url=URL.createObjectURL(blob), t=K.res?(K.res.p===2?'DNF':fmt(val(K.res))):'solve', name='cuber-tools-'+(K.pb?'PB-':'')+t.replace(/[^0-9a-zA-Z.]+/g,'-')+'.'+ext, file=null; try{ file=new File([blob],name,{type:blob.type}); }catch(e){}
  var canShare=!!(file&&navigator.canShare&&navigator.canShare({files:[file]}));
  var sh=CW.sheet('<div class="hd"><h2>'+(K.pb?'🎉 New PB on video!':'🎥 Your solve')+'</h2><button class="x" data-close aria-label="Close">✕</button></div><video class="pbc-out" src="'+url+'" controls playsinline autoplay muted></video>'
    +'<div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap">'+(canShare?'<button class="btn pri" type="button" id="pbcSh">📤 Share or save to Photos</button>':'')+'<a class="btn'+(canShare?'':' pri')+'" href="'+url+'" download="'+esc(name)+'">⬇️ Download</a><button class="btn" type="button" id="pbcAg">⏺ Record another</button></div>'
    +'<p class="muted" style="font-size:12.5px;margin:10px 0 0">The video stays on this device until you save or share it.</p>',function(){ setTimeout(function(){ URL.revokeObjectURL(url); },60000); });
  var b=sh.querySelector('#pbcSh'); if(b) b.onclick=function(){ navigator.share({files:[file],title:'My solve'}).catch(function(){}); };
  sh.querySelector('#pbcAg').onclick=function(){ sh.close&&sh.close(); arm(); }; }

/* ---------- timer hooks ---------- */
var ps=PL.solveStart; PL.solveStart=function(){ if(ps) try{ ps.apply(this,arguments); }catch(e){} if(K.on&&K.phase==='armed'){ K.phase='run'; K.start=performance.now(); ui(); } };
var sd=PL.solveDone; PL.solveDone=function(rec,cube,L){ if(sd) try{ sd.apply(this,arguments); }catch(e){} if(!(K.on&&K.phase==='run')) return;
  K.res=rec; K.cube=cube; var prev=(L||[]).filter(function(x){ return x!==rec; }).map(val), b=Math.min.apply(null,prev.concat([Infinity])); K.pb=prev.length>0&&val(rec)<b;
  if(L&&L.length>=5){ var w=L.slice(-5).map(val).sort(function(a,c){ return a-c; }); K.ao5=w[3]===Infinity?null:(w[1]+w[2]+w[3])/3; } else K.ao5=null;
  K.phase='done'; K.endAt=performance.now(); ui(); setTimeout(stopRec,K.pb?3800:2800); };

/* ---------- floating camera window ---------- */
var box=null;
function open(){ if(!supported()){ CW.toast('PB Cam needs a newer browser. On iPad, update iPadOS.'); return; } if(K.on) return; K.on=true;
  box=document.createElement('div'); box.className='pbc'; box.innerHTML='<div class="pbc-h" id="pbcDrag"><b>🎥 PB Cam</b><span class="sp"></span><button type="button" data-pbc="flip" aria-label="Switch camera">🔄</button><button type="button" data-pbc="snd" aria-label="Sound">🎙️</button><button type="button" data-pbc="x" aria-label="Close PB Cam">✕</button></div>'
   +'<div class="pbc-v"><video playsinline muted></video><canvas hidden></canvas></div><div class="pbc-s" id="pbcS"></div><div class="pbc-b"><button type="button" class="btn pri" data-pbc="rec" id="pbcR">⏺ Start recording</button></div>';
  document.body.appendChild(box); K.v=box.querySelector('video'); K.cv=box.querySelector('canvas'); K.cx=K.cv.getContext('2d'); drag(box,box.querySelector('#pbcDrag'));
  camOn().then(function(ok){ if(ok){ frame(); ui(); } }); ui(); }
function close(){ cancel(); K.on=false; cancelAnimationFrame(K.raf); camStop(); micStop(); if(box){ box.remove(); box=null; } }
function ui(){ if(!box) return; var s=box.querySelector('#pbcS'), r=box.querySelector('#pbcR'), snd=box.querySelector('[data-pbc="snd"]');
  if(snd){ snd.textContent=K.snd?'🎙️':'🔇'; snd.setAttribute('aria-label',K.snd?'Sound on':'Sound off'); }
  var M={idle:['Frame your cube and hands, then start recording.','⏺ Start recording'],armed:['● Recording. Scramble, then start the timer as normal.','■ Cancel'],run:['● Solving…','■ Cancel'],done:['Finishing the video…','…']}, m=M[K.phase]||M.idle;
  s.textContent=m[0]; r.textContent=m[1]; r.disabled=K.phase==='done'; box.classList.toggle('live',K.phase!=='idle'); }
function drag(el,h){ var sx=0,sy=0,ox=0,oy=0,on=false; h.addEventListener('pointerdown',function(e){ if(e.target.closest('button')) return; on=true; var r=el.getBoundingClientRect(); ox=r.left; oy=r.top; sx=e.clientX; sy=e.clientY; h.setPointerCapture(e.pointerId); });
  h.addEventListener('pointermove',function(e){ if(!on) return; var x=Math.max(4,Math.min(innerWidth-el.offsetWidth-4,ox+e.clientX-sx)), y=Math.max(4,Math.min(innerHeight-el.offsetHeight-4,oy+e.clientY-sy)); el.style.left=x+'px'; el.style.top=y+'px'; el.style.right='auto'; el.style.bottom='auto'; });
  h.addEventListener('pointerup',function(){ on=false; }); }
document.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('[data-pbc]'); if(!b) return; e.preventDefault(); var a=b.getAttribute('data-pbc'); b.blur();
  if(a==='open') return open(); if(a==='x') return close();
  if(a==='rec'){ if(K.phase==='idle') arm(); else cancel(); return; }
  if(a==='flip'){ if(K.phase!=='idle'){ CW.toast('Stop recording to switch camera.'); return; } K.face=K.face==='user'?'environment':'user'; camOn(); return; }
  if(a==='snd'){ if(K.phase!=='idle'){ CW.toast('Stop recording to change sound.'); return; } K.snd=!K.snd; if(!K.snd) micStop(); else navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false}}).then(function(m){ K.mic=m; ui(); }).catch(function(){ K.snd=false; ui(); }); ui(); } });
window.addEventListener('hashchange',function(){ if(K.on&&!/^#timer/.test(location.hash)&&K.phase==='idle') close(); });
PL.pbCam={open:open,close:close,state:function(){ return {on:K.on,phase:K.phase,pb:K.pb,res:K.res}; },_K:K};

/* ---------- Timer panel ---------- */
function wrap(){ var V=PL.views&&PL.views.timer; if(!V||!V.show||V.__pbc) return; V.__pbc=1; var o=V.show; V.show=function(el){ var r=o.apply(this,arguments); try{ var w=el.querySelector('.wrap')||el; if(!w.querySelector('#pbcP')){ var d=document.createElement('div'); d.className='pnl pbc-card'; d.id='pbcP';
  d.innerHTML='<div class="row" style="align-items:center;gap:12px"><span class="pbc-ic">🎥</span><div style="flex:1;min-width:0"><b>PB Cam</b><br><small class="muted">Film your solves with the time on the video: inspection, live time, final time and NEW PB. Ready to post.</small></div><button class="btn pri" type="button" data-pbc="open">Open camera</button></div>';
  var pad=w.querySelector('#tPad'); var anchor=pad&&pad.closest('.pnl'); if(anchor&&anchor.nextSibling) anchor.parentNode.insertBefore(d,anchor.nextSibling); else w.appendChild(d); } }catch(e){} return r; }; }
wrap(); window.addEventListener('hashchange',wrap,true); setTimeout(wrap,3000);
})();
