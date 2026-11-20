/* Only the newest live update's cutscene plays. Older ones a player has not seen are marked as seen, so new players watch one cutscene, not all of them. */
PL.cutNewer=function(n){ var U=(PL.live&&PL.live.upd)||{}, K=['','2','3','4','5','6','65','7','8','9','10'], i=K.indexOf(n);
  for(var j=i+1;j<K.length;j++){ var k=K[j], o=U['v'+k]; var on=(o&&o.live); if(!on){ try{ on=!!localStorage.getItem('cw_upd'+k+'_live'); }catch(e){} } if(on) return true; } return false; };
/* The update: countdown bar, release detection, the cutscene (once per device) and the switch that turns the new features on. */
(function(){
var $=CW.$, LS=function(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} return null; };
var st={on:false,ready:false,cbs:[],playing:false,tick:0,fast:0};
PL.upd={at:0,live:false,rel:0};
function isOwner(){ try{ return !!CW.ownerKeys(); }catch(e){ return false; } }
PL.updOn=function(){ return !!(PL.upd.live||(LS('cw_upd_prev')==='1'&&isOwner())); };
PL.onUpd=function(fn){ if(st.on) { try{ fn(); }catch(e){ console.error(e); } } else st.cbs.push(fn); };
function pad2(n){ return (n<10?'0':'')+n; }
function hms(ms){ ms=Math.max(0,ms); var s=Math.floor(ms/1000); return pad2(Math.floor(s/3600))+':'+pad2(Math.floor(s%3600/60))+':'+pad2(s%60); }
PL.updHMS=hms;
function bar(){ var b=$('#ubar'); if(!b){ var a=$('#annc'); if(!a) return null; b=document.createElement('div'); b.id='ubar'; b.className='ubar'; b.hidden=true; b.innerHTML='<span class="ubar-ic">🕳️</span><span class="ubar-t" id="ubarT">Something huge is coming to Cuber Tools</span><span class="ubar-c" id="ubarC">--:--:--</span>'; a.parentNode.insertBefore(b,a.nextSibling); } return b; }
function loadCut(cb){ if(window.CWCut) return cb(); var s=document.createElement('script'); s.src='/update-cut.js?v=8'; s.onload=cb; s.onerror=function(){ cb(); }; document.head.appendChild(s); }
PL.updCut=function(opts){ opts=opts||{}; if(st.playing) return; st.playing=true; loadCut(function(){ if(!window.CWCut){ st.playing=false; if(opts.onend) opts.onend(); return; } window.CWCut.play({onend:function(){ st.playing=false; if(opts.onend) opts.onend(); }}); }); };
function turnOn(){ if(st.on) return; st.on=true; document.documentElement.classList.add('upd-on'); var l=st.cbs.slice(); st.cbs=[]; l.forEach(function(fn){ try{ fn(); }catch(e){ console.error(e); } }); }
function sync(){
  var u=(PL.live&&PL.live.upd)||PL.upd; PL.upd=u||{at:0,live:false,rel:0};
  /* once released it stays released on this device, whatever the server says */
  if(PL.upd.live&&PL.upd.rel) LS('cw_upd_live',String(PL.upd.rel)); else if(!PL.upd.live&&LS('cw_upd_live')){ PL.upd={at:0,live:true,rel:+LS('cw_upd_live')||1}; }
  var b=bar(); if(!b) return;
  var left=PL.upd.at?PL.upd.at-PL.now():0;
  if(!PL.upd.live&&PL.upd.at){ b.hidden=false; document.documentElement.classList.add('has-ubar'); $('#ubarC').textContent=hms(left); $('#ubarT').textContent=left<=0?'It is happening…':'Something huge is coming to Cuber Tools'; }
  else { b.hidden=true; document.documentElement.classList.remove('has-ubar'); }
  if(PL.upd.live&&!st.on&&PL.cutNewer&&PL.cutNewer('')&&LS('cw_upd_seen')!==String(PL.upd.rel)) LS('cw_upd_seen',String(PL.upd.rel));
  if(PL.upd.live){ if(!st.on&&LS('cw_upd_seen')!==String(PL.upd.rel)&&!st.playing){ PL.updCut({onend:function(){ LS('cw_upd_seen',String(PL.upd.rel)); turnOn(); }}); } else if(!st.playing) turnOn(); }
  else if(PL.updOn()) turnOn();
}
PL.updSync=sync;
/* while a countdown runs: tick the clock each second; at zero, ask the server every second until it confirms */
setInterval(function(){ if(!PL.upd.live&&PL.upd.at){ var left=PL.upd.at-PL.now(); var c=$('#ubarC'); if(c){ c.textContent=hms(left); } if(left<=0&&Date.now()-st.fast>1500){ st.fast=Date.now(); PL.poll(); } } },500);
PL.onLive(sync);
if(document.readyState!=='loading') setTimeout(sync,0); else document.addEventListener('DOMContentLoaded',sync);
})();
