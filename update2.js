/* Update 2: countdown bar, release detection, its own cutscene (once per device) and the switch that turns Update 2 features on. Only after Update 1 is live. */
(function(){
var $=CW.$, LS=function(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} return null; };
var st={on:false,cbs:[],playing:false,fast:0};
PL.upd2={at:0,live:false,rel:0};
function isOwner(){ try{ return !!CW.ownerKeys(); }catch(e){ return false; } }
PL.updOn2=function(){ return !!(PL.updOn&&PL.updOn()&&(PL.upd2.live||(LS('cw_upd2_prev')==='1'&&isOwner()))); };
PL.onUpd2=function(fn){ if(st.on){ try{ fn(); }catch(e){ console.error(e); } } else st.cbs.push(fn); };
function loadCut(cb){ if(window.CWCut2) return cb(); var s=document.createElement('script'); s.src='/update-cut2.js?v=4'; s.onload=cb; s.onerror=function(){ cb(); }; document.head.appendChild(s); }
PL.updCut2=function(opts){ opts=opts||{}; if(st.playing) return; st.playing=true; loadCut(function(){ if(!window.CWCut2){ st.playing=false; if(opts.onend) opts.onend(); return; } window.CWCut2.play({onend:function(){ st.playing=false; if(opts.onend) opts.onend(); }}); }); };
function bar(){ var b=$('#ubar2'); if(!b){ var a=$('#annc'); if(!a) return null; b=document.createElement('div'); b.id='ubar2'; b.className='ubar'; b.hidden=true; b.innerHTML='<span class="ubar-ic">◆</span><span class="ubar-t" id="ubar2T">Update 2 is coming to Cuber Tools</span><span class="ubar-c" id="ubar2C">--:--:--</span>'; a.parentNode.insertBefore(b,a.nextSibling); } return b; }
function turnOn(){ if(st.on) return; st.on=true; document.documentElement.classList.add('upd2-on'); var l=st.cbs.slice(); st.cbs=[]; l.forEach(function(fn){ try{ fn(); }catch(e){ console.error(e); } }); }
function sync(){
  var u=(PL.live&&PL.live.upd&&PL.live.upd.v2)||PL.upd2; PL.upd2=u||{at:0,live:false,rel:0};
  if(PL.upd2.live&&PL.upd2.rel) LS('cw_upd2_live',String(PL.upd2.rel)); else if(!PL.upd2.live&&LS('cw_upd2_live')){ PL.upd2={at:0,live:true,rel:+LS('cw_upd2_live')||1}; }
  var b=bar(); if(!b) return; var s1=PL.upd&&PL.upd.live||LS('cw_upd_live');
  var left=PL.upd2.at?PL.upd2.at-PL.now():0;
  if(s1&&!PL.upd2.live&&PL.upd2.at){ b.hidden=false; document.documentElement.classList.add('has-ubar'); $('#ubar2C').textContent=PL.updHMS(left); $('#ubar2T').textContent=left<=0?'It is happening…':'Update 2 is coming to Cuber Tools'; }
  else { if(!b.hidden){ b.hidden=true; var o=$('#ubar'); if(!o||o.hidden) document.documentElement.classList.remove('has-ubar'); } }
  if(!PL.updOn()) return;
  if(PL.upd2.live&&!st.on&&PL.cutNewer&&PL.cutNewer('2')&&LS('cw_upd2_seen')!==String(PL.upd2.rel)) LS('cw_upd2_seen',String(PL.upd2.rel));
  if(PL.upd2.live){ if(!st.on&&LS('cw_upd2_seen')!==String(PL.upd2.rel)&&!st.playing&&!document.documentElement.classList.contains('ucut-on')){ PL.updCut2({onend:function(){ LS('cw_upd2_seen',String(PL.upd2.rel)); turnOn(); }}); } else if(!st.playing) turnOn(); }
  else if(PL.updOn2()) turnOn();
}
PL.updSync2=sync;
setInterval(function(){ if(!PL.upd2.live&&PL.upd2.at){ var left=PL.upd2.at-PL.now(), c=$('#ubar2C'); if(c) c.textContent=PL.updHMS(left); if(left<=0&&Date.now()-st.fast>1500){ st.fast=Date.now(); PL.poll(); } } },500);
PL.onLive(sync); PL.onUpd(sync);
if(document.readyState!=='loading') setTimeout(sync,0); else document.addEventListener('DOMContentLoaded',sync);
})();
