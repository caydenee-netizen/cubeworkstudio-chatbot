/* Update 8: race replays. While you race, the race view is recorded on this device; after the finish you can watch it back
   (normal or slow motion) and save the video. Only the last race is kept, in memory. */
(function(){
if(!window.PL) return;
var RP={rec:null,chunks:[],mime:'',url:null,blob:null,stopT:0,on:false,at:0};
function on(){ return !!(PL.updOn8&&PL.updOn8()); }
function pick(){ if(!window.MediaRecorder) return ''; var c=['video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm']; for(var i=0;i<c.length;i++){ try{ if(MediaRecorder.isTypeSupported(c[i])) return c[i]; }catch(e){} } return ''; }
function start(cv){ abort(); if(!on()||!cv||!cv.captureStream||!window.MediaRecorder) return; try{ var st=cv.captureStream(30); RP.mime=pick(); RP.chunks=[]; RP.rec=new MediaRecorder(st,RP.mime?{mimeType:RP.mime,videoBitsPerSecond:2.5e6}:{}); RP.rec.ondataavailable=function(e){ if(e.data&&e.data.size) RP.chunks.push(e.data); }; RP.rec.start(500); RP.on=true; }catch(e){ RP.rec=null; } }
function finish(){ if(!RP.rec) return; clearTimeout(RP.stopT); RP.stopT=setTimeout(function(){ var r=RP.rec; if(!r) return; RP.rec=null; RP.on=false; r.onstop=function(){ var b=new Blob(RP.chunks,{type:RP.mime||'video/webm'}); RP.chunks=[]; if(b.size<5000) return; if(RP.url) try{ URL.revokeObjectURL(RP.url); }catch(e){} RP.blob=b; RP.url=URL.createObjectURL(b); RP.at=Date.now(); pill(); if(window.CW&&CW.toast) CW.toast('Race replay ready. Tap ▶ Replay to watch it.'); }; try{ r.stop(); }catch(e){} },2600); }
function abort(){ clearTimeout(RP.stopT); if(RP.rec){ var r=RP.rec; RP.rec=null; r.onstop=null; try{ r.stop(); }catch(e){} } RP.chunks=[]; RP.on=false; }
function pill(){ var b=document.getElementById('rp8'); if(!RP.url||!/^#race/.test(location.hash)){ if(b) b.remove(); return; } if(b) return; b=document.createElement('button'); b.id='rp8'; b.type='button'; b.className='rp8'; b.innerHTML='▶ Replay'; b.onclick=sheet; document.body.appendChild(b); }
function sheet(){ if(!RP.url) return; var ext=/mp4/.test(RP.mime)?'mp4':'webm';
  var sh=CW.sheet('<div class="hd"><h2>Race replay</h2><button class="x" data-close aria-label="Close">✕</button></div><video id="rp8V" src="'+RP.url+'" playsinline controls style="width:100%;border-radius:14px;background:#000"></video><div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap"><span class="seg"><button type="button" data-rs=".5" aria-pressed="false">0.5×</button><button type="button" data-rs="1" aria-pressed="true">1×</button><button type="button" data-rs="1.5" aria-pressed="false">1.5×</button></span><span class="sp"></span><a class="btn sm" href="'+RP.url+'" download="cube-race-replay.'+ext+'">Save video</a></div><p class="muted" style="font-size:12.5px;margin:8px 0 0">Only your last race is kept, on this device.</p>');
  var v=sh.querySelector('#rp8V'); try{ v.play(); }catch(e){}
  sh.addEventListener('click',function(e){ var x=e.target.closest('[data-rs]'); if(!x) return; v.playbackRate=+x.getAttribute('data-rs'); [].forEach.call(sh.querySelectorAll('[data-rs]'),function(y){ y.setAttribute('aria-pressed',y===x); }); }); }
window.addEventListener('hashchange',function(){ setTimeout(pill,50); });
PL.raceRec={start:start,finish:finish,abort:abort,has:function(){ return !!RP.url; }};
})();
