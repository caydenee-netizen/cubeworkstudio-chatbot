/* Chat photos and voice messages */
(function(){
'use strict';
if(typeof CW==='undefined'||!window.PL||!PL.c3) return;
var X=PL.c3, C=X.C, MAX=120000, REC=null;
function b64(blob){ return new Promise(function(ok,no){ var r=new FileReader(); r.onload=function(){ ok(String(r.result).split(',')[1]||''); }; r.onerror=no; r.readAsDataURL(blob); }); }
async function up(y,blob,mime){ var d=await b64(blob); if(d.length>MAX) throw new Error(y==='img'?'That photo is too big.':'That voice message is too long.');
  var r=await CW.call('/api/media/up',{id:CW.devId(),y:y,m:mime||blob.type,d:d},20000); if(!r.ok) throw new Error((r.data&&r.data.error)||'Could not upload.'); return r.data.k; }
function toBlob(cv,q){ return new Promise(function(ok){ cv.toBlob(ok,'image/jpeg',q); }); }
async function shrink(file){ var url=URL.createObjectURL(file), im=new Image(); im.src=url; await im.decode(); var w=im.naturalWidth, h=im.naturalHeight, side=1280, blob=null;
  for(var tries=0;tries<8;tries++){ var k=Math.min(1,side/Math.max(w,h)), cv=document.createElement('canvas'); cv.width=Math.round(w*k); cv.height=Math.round(h*k); cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
    for(var q=.82;q>=.5;q-=.08){ blob=await toBlob(cv,q); if(blob&&blob.size*1.37<MAX){ URL.revokeObjectURL(url); return {blob:blob,w:cv.width,h:cv.height}; } } side=Math.round(side*.78); }
  URL.revokeObjectURL(url); throw new Error('That photo is too big.'); }
async function sendPhoto(file){ if(!file) return; if(!/^image\//.test(file.type)){ CW.toast('Pick a photo.'); return; } if(C.kind!=='pub'&&C.kind!=='th'){ CW.toast('Open a chat first.'); return; }
  CW.toast('Sending photo…'); try{ var s=await shrink(file), k=await up('img',s.blob,'image/jpeg'); X.send({text:'📷 Photo',md:{k:k,w:s.w,h:s.h}}); }catch(e){ CW.toast(e.message||'Could not send the photo.'); } }
function pickMime(){ var L=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus']; if(!window.MediaRecorder) return null; for(var i=0;i<L.length;i++) if(!MediaRecorder.isTypeSupported||MediaRecorder.isTypeSupported(L[i])) return L[i]; return ''; }
async function startRec(){ if(REC) return; if(C.kind!=='pub'&&C.kind!=='th'){ CW.toast('Open a chat first.'); return; } var mt=pickMime(); if(mt===null||!navigator.mediaDevices){ CW.toast('Voice messages don’t work in this browser.'); return; }
  var st; try{ st=await navigator.mediaDevices.getUserMedia({audio:true}); }catch(e){ CW.toast('Allow the microphone to record a voice message.'); return; }
  var opt={audioBitsPerSecond:24000}; if(mt) opt.mimeType=mt; var mr; try{ mr=new MediaRecorder(st,opt); }catch(e){ mr=new MediaRecorder(st); }
  var parts=[], t0=Date.now(); REC={mr:mr,st:st,t0:t0,cancel:false}; mr.ondataavailable=function(e){ if(e.data&&e.data.size) parts.push(e.data); };
  mr.onstop=async function(){ var R=REC; REC=null; st.getTracks().forEach(function(t){ t.stop(); }); bar(false); if(R.cancel) return; var secs=Math.max(1,Math.round((Date.now()-R.t0)/1000)); if(secs<1) return;
    var type=(mr.mimeType||mt||'audio/mp4').split(';')[0], blob=new Blob(parts,{type:type}); CW.toast('Sending voice message…');
    try{ var k=await up('aud',blob,type); X.send({text:'🎤 Voice message',md:{k:k,d:Math.min(30,secs)}}); }catch(e){ CW.toast(e.message||'Could not send.'); } };
  mr.start(250); bar(true); REC.iv=setInterval(function(){ if(!REC) return; if(!document.getElementById('c3F')){ stopRec(true); return; } var s=Math.floor((Date.now()-REC.t0)/1000), el=document.getElementById('c3RecT'); if(el) el.textContent='0:'+String(s).padStart(2,'0')+' / 0:30'; if(s>=30) stopRec(false); },250); }
function stopRec(cancel){ if(!REC) return; clearInterval(REC.iv); REC.cancel=!!cancel; var R=REC;
  try{ if(R.mr.state!=='inactive') R.mr.stop(); else throw 0; }catch(e){ try{ R.st.getTracks().forEach(function(t){ t.stop(); }); }catch(x){} REC=null; bar(false); }
  setTimeout(function(){ if(REC===R){ try{ R.st.getTracks().forEach(function(t){ t.stop(); }); }catch(x){} REC=null; bar(false); } },3000); }
var cl0=PL.chat2&&PL.chat2.close; if(cl0) PL.chat2.close=function(){ stopRec(true); return cl0.apply(this,arguments); };
document.addEventListener('visibilitychange',function(){ if(document.hidden) stopRec(true); });
function bar(on){ var f=document.getElementById('c3F'); if(!f){ return; } var b=document.getElementById('c3Rec'); if(!on){ if(b) b.remove(); f.classList.remove('rec'); return; }
  f.classList.add('rec'); if(!b){ b=document.createElement('div'); b.id='c3Rec'; b.className='c3-recb'; b.innerHTML='<button type="button" class="btn" data-recx aria-label="Cancel recording">🗑 Cancel</button><span class="dot"></span><b id="c3RecT">0:00 / 0:30</b><span class="sp"></span><button type="button" class="btn pri" data-recok aria-label="Stop and send voice message">■ Stop &amp; send</button>'; f.appendChild(b); } }
function viewer(u){ var sh=CW.sheet('<div class="hd"><h2>Photo</h2><button class="x" data-close aria-label="Close">✕</button></div><img src="'+CW.esc(u)+'" alt="Photo" style="display:block;max-width:100%;max-height:75vh;margin:0 auto;border-radius:14px">'); }
document.addEventListener('click',function(e){ var t=e.target.closest&&e.target.closest('[data-photo],[data-mic],[data-recx],[data-recok],[data-img]'); if(!t||!t.closest('.c3')) return; e.preventDefault(); e.stopPropagation();
  if(t.hasAttribute('data-photo')){ var fi=document.getElementById('c3Fi'); if(fi){ fi.value=''; fi.click(); } return; }
  if(t.hasAttribute('data-mic')){ startRec(); return; }
  if(t.hasAttribute('data-recx')){ stopRec(true); return; }
  if(t.hasAttribute('data-recok')){ stopRec(false); return; }
  if(t.hasAttribute('data-img')) viewer(t.getAttribute('data-img')); },true);
document.addEventListener('change',function(e){ if(e.target&&e.target.id==='c3Fi') sendPhoto(e.target.files&&e.target.files[0]); });
PL.chatMedia={sendPhoto:sendPhoto,up:up};
})();
