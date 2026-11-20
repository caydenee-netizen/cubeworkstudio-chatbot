/* Update 4: countdown bar, release detection, its own cutscene (once per device) and the switch that turns Update 4 features on. Only after Update 1 is live. */
(function(){
var $=CW.$, LS=function(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} return null; };
var st={on:false,cbs:[],playing:false,fast:0};
PL.upd4={at:0,live:false,rel:0};
function isOwner(){ try{ return !!CW.ownerKeys(); }catch(e){ return false; } }
PL.updOn4=function(){ return !!(PL.updOn3&&PL.updOn3()&&(PL.upd4.live||(LS('cw_upd4_prev')==='1'&&isOwner()))); };
PL.onUpd4=function(fn){ if(st.on){ try{ fn(); }catch(e){ console.error(e); } } else st.cbs.push(fn); };
function loadCut(cb){ if(window.CWCut4) return cb(); var s=document.createElement('script'); s.src='/update-cut4.js?v=1'; s.onload=cb; s.onerror=function(){ cb(); }; document.head.appendChild(s); }
PL.updCut4=function(opts){ opts=opts||{}; if(st.playing) return; st.playing=true; loadCut(function(){ if(!window.CWCut4){ st.playing=false; if(opts.onend) opts.onend(); return; } window.CWCut4.play({onend:function(){ st.playing=false; if(opts.onend) opts.onend(); }}); }); };
function bar(){ var b=$('#ubar4'); if(!b){ var a=$('#annc'); if(!a) return null; b=document.createElement('div'); b.id='ubar4'; b.className='ubar'; b.hidden=true; b.innerHTML='<span class="ubar-ic">◆</span><span class="ubar-t" id="ubar4T">Update 4 is coming to Cuber Tools</span><span class="ubar-c" id="ubar4C">--:--:--</span>'; a.parentNode.insertBefore(b,a.nextSibling); } return b; }
function turnOn(){ if(st.on) return; st.on=true; document.documentElement.classList.add('upd4-on'); var l=st.cbs.slice(); st.cbs=[]; l.forEach(function(fn){ try{ fn(); }catch(e){ console.error(e); } }); }
function sync(){
  var u=(PL.live&&PL.live.upd&&PL.live.upd.v4)||PL.upd4; PL.upd4=u||{at:0,live:false,rel:0};
  if(PL.upd4.live&&PL.upd4.rel) LS('cw_upd4_live',String(PL.upd4.rel)); else if(!PL.upd4.live&&LS('cw_upd4_live')){ PL.upd4={at:0,live:true,rel:+LS('cw_upd4_live')||1}; }
  var b=bar(); if(!b) return; var s1=PL.upd3&&PL.upd3.live||LS('cw_upd3_live');
  var left=PL.upd4.at?PL.upd4.at-PL.now():0;
  if(s1&&!PL.upd4.live&&PL.upd4.at){ b.hidden=false; document.documentElement.classList.add('has-ubar'); $('#ubar4C').textContent=PL.updHMS(left); $('#ubar4T').textContent=left<=0?'It is happening…':'Update 4 is coming to Cuber Tools'; }
  else { if(!b.hidden){ b.hidden=true; var o=$('#ubar'); if(!o||o.hidden) document.documentElement.classList.remove('has-ubar'); } }
  if(!(PL.updOn3&&PL.updOn3())) return;
  if(PL.upd4.live&&!st.on&&PL.cutNewer&&PL.cutNewer('4')&&LS('cw_upd4_seen')!==String(PL.upd4.rel)) LS('cw_upd4_seen',String(PL.upd4.rel));
  if(PL.upd4.live){ if(!st.on&&LS('cw_upd4_seen')!==String(PL.upd4.rel)&&!st.playing&&!document.documentElement.classList.contains('ucut-on')){ PL.updCut4({onend:function(){ LS('cw_upd4_seen',String(PL.upd4.rel)); turnOn(); }}); } else if(!st.playing) turnOn(); }
  else if(PL.updOn4()) turnOn();
}
PL.updSync4=sync;
setInterval(function(){ if(!PL.upd4.live&&PL.upd4.at){ var left=PL.upd4.at-PL.now(), c=$('#ubar4C'); if(c) c.textContent=PL.updHMS(left); if(left<=0&&Date.now()-st.fast>1500){ st.fast=Date.now(); PL.poll(); } } },500);
PL.onLive(sync); PL.onUpd(sync); if(PL.onUpd3) PL.onUpd3(sync);
if(document.readyState!=='loading') setTimeout(sync,0); else document.addEventListener('DOMContentLoaded',sync);
})();
