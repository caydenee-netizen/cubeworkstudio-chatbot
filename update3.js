/* Update 3: countdown bar, release detection, its own cutscene (once per device) and the switch that turns Update 3 features on. Only after Update 1 is live. */
(function(){
var $=CW.$, LS=function(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} return null; };
var st={on:false,cbs:[],playing:false,fast:0};
PL.upd3={at:0,live:false,rel:0};
function isOwner(){ try{ return !!CW.ownerKeys(); }catch(e){ return false; } }
PL.updOn3=function(){ return !!(PL.updOn2&&PL.updOn2()&&(PL.upd3.live||(LS('cw_upd3_prev')==='1'&&isOwner()))); };
PL.onUpd3=function(fn){ if(st.on){ try{ fn(); }catch(e){ console.error(e); } } else st.cbs.push(fn); };
function loadCut(cb){ if(window.CWCut3) return cb(); var s=document.createElement('script'); s.src='/update-cut3.js?v=1'; s.onload=cb; s.onerror=function(){ cb(); }; document.head.appendChild(s); }
PL.updCut3=function(opts){ opts=opts||{}; if(st.playing) return; st.playing=true; loadCut(function(){ if(!window.CWCut3){ st.playing=false; if(opts.onend) opts.onend(); return; } window.CWCut3.play({onend:function(){ st.playing=false; if(opts.onend) opts.onend(); }}); }); };
function bar(){ var b=$('#ubar3'); if(!b){ var a=$('#annc'); if(!a) return null; b=document.createElement('div'); b.id='ubar3'; b.className='ubar'; b.hidden=true; b.innerHTML='<span class="ubar-ic">◆</span><span class="ubar-t" id="ubar3T">Update 3 is coming to Cuber Tools</span><span class="ubar-c" id="ubar3C">--:--:--</span>'; a.parentNode.insertBefore(b,a.nextSibling); } return b; }
function turnOn(){ if(st.on) return; st.on=true; document.documentElement.classList.add('upd3-on'); var l=st.cbs.slice(); st.cbs=[]; l.forEach(function(fn){ try{ fn(); }catch(e){ console.error(e); } }); }
function sync(){
  var u=(PL.live&&PL.live.upd&&PL.live.upd.v3)||PL.upd3; PL.upd3=u||{at:0,live:false,rel:0};
  if(PL.upd3.live&&PL.upd3.rel) LS('cw_upd3_live',String(PL.upd3.rel)); else if(!PL.upd3.live&&LS('cw_upd3_live')){ PL.upd3={at:0,live:true,rel:+LS('cw_upd3_live')||1}; }
  var b=bar(); if(!b) return; var s1=PL.upd2&&PL.upd2.live||LS('cw_upd2_live');
  var left=PL.upd3.at?PL.upd3.at-PL.now():0;
  if(s1&&!PL.upd3.live&&PL.upd3.at){ b.hidden=false; document.documentElement.classList.add('has-ubar'); $('#ubar3C').textContent=PL.updHMS(left); $('#ubar3T').textContent=left<=0?'It is happening…':'Update 3 is coming to Cuber Tools'; }
  else { if(!b.hidden){ b.hidden=true; var o=$('#ubar'); if(!o||o.hidden) document.documentElement.classList.remove('has-ubar'); } }
  if(!(PL.updOn2&&PL.updOn2())) return;
  if(PL.upd3.live&&!st.on&&PL.cutNewer&&PL.cutNewer('3')&&LS('cw_upd3_seen')!==String(PL.upd3.rel)) LS('cw_upd3_seen',String(PL.upd3.rel));
  if(PL.upd3.live){ if(!st.on&&LS('cw_upd3_seen')!==String(PL.upd3.rel)&&!st.playing&&!document.documentElement.classList.contains('ucut-on')){ PL.updCut3({onend:function(){ LS('cw_upd3_seen',String(PL.upd3.rel)); turnOn(); }}); } else if(!st.playing) turnOn(); }
  else if(PL.updOn3()) turnOn();
}
PL.updSync3=sync;
setInterval(function(){ if(!PL.upd3.live&&PL.upd3.at){ var left=PL.upd3.at-PL.now(), c=$('#ubar3C'); if(c) c.textContent=PL.updHMS(left); if(left<=0&&Date.now()-st.fast>1500){ st.fast=Date.now(); PL.poll(); } } },500);
PL.onLive(sync); PL.onUpd(sync); if(PL.onUpd2) PL.onUpd2(sync);
if(document.readyState!=='loading') setTimeout(sync,0); else document.addEventListener('DOMContentLoaded',sync);
})();
