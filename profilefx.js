/* Animated profile effects: a moving ring around your picture in chat. Bought with tokens in the Garage (or /profile in chat). */
(function(){
if(!window.PL) return;
var FX=[[1,'Rainbow ring',300],[2,'Fire ring',500],[3,'Ice ring',500],[4,'Neon ring',800],[5,'Gold ring',1200],[6,'Galaxy ring',1500]];
function esc(t){ return String(t).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function own(){ try{ var a=JSON.parse(localStorage.getItem('cw_pfx_own')||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
function cur(){ return +(localStorage.getItem('cw_pfx')||0); }
function av(f,sz){ var n=String(PL.name()||'?'); return '<span class="c3-av'+(f?' pf pf'+f:'')+'" style="background:#3a7bff;width:'+sz+'px;height:'+sz+'px;font-size:'+Math.round(sz*.42)+'px;display:inline-grid;place-items:center;border-radius:50%;color:#fff;font-weight:800">'+esc(n.slice(0,1).toUpperCase())+'</span>'; }
function html(){ var o=own(), c=cur();
  return '<div class="pnl pfx-card"><h3 style="margin:0 0 4px">✨ Profile effects</h3><p class="muted" style="margin:0 0 12px">An animated ring around your picture in chat. Everyone sees it.</p><div class="pfx-grid">'
   +'<button type="button" class="pfx-it'+(!c?' on':'')+'" data-pfx="0">'+av(0,46)+'<b>None</b><small>'+(!c?'Equipped':'Tap to use')+'</small></button>'
   +FX.map(function(f){ var has=o.indexOf(f[0])>=0; return '<button type="button" class="pfx-it'+(c===f[0]?' on':'')+'" data-pfx="'+f[0]+'">'+av(f[0],46)+'<b>'+esc(f[1])+'</b><small>'+(c===f[0]?'Equipped':has?'Owned · tap to use':f[2].toLocaleString()+' tokens')+'</small></button>'; }).join('')+'</div></div>'; }
function pick(id,box){ id=+id; if(!id){ localStorage.setItem('cw_pfx','0'); CW.toast('Profile effect off.'); return redraw(box); }
  var f=FX.find(function(x){ return x[0]===id; }); if(!f) return; var o=own();
  if(o.indexOf(id)<0){ if(!confirm('Buy '+f[1]+' for '+f[2].toLocaleString()+' tokens?')) return; if(!PL.spend(f[2])){ CW.toast('You need '+(f[2]-PL.tok()).toLocaleString()+' more tokens.'); return; } o.push(id); localStorage.setItem('cw_pfx_own',JSON.stringify(o)); }
  localStorage.setItem('cw_pfx',String(id)); CW.toast(f[1]+' equipped.'); redraw(box); }
function redraw(box){ if(box){ var t=document.createElement('div'); t.innerHTML=html(); box.replaceWith(t.firstChild); } }
document.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('[data-pfx]'); if(!b) return; pick(b.getAttribute('data-pfx'),b.closest('.pfx-card')); });
var g=PL.views&&PL.views.garage; if(g&&g.show){ var o0=g.show; g.show=function(el){ var r=o0.apply(this,arguments); try{ var w=el.querySelector('.wrap')||el; var d=document.createElement('div'); d.innerHTML=html(); d.firstChild.style.marginTop='18px'; w.appendChild(d.firstChild); }catch(e){} return r; }; }
PL.profileFx={open:function(){ var sh=CW.sheet('<div class="hd"><h2>Profile effects</h2><button class="x" data-close aria-label="Close">✕</button></div><div class="pfx-host">'+html()+'</div>'); },list:FX};
/* owners can hand one out: PL.profileFx.give(id) unlocks it on this device */
PL.profileFx.give=function(id){ var o=own(); if(o.indexOf(+id)<0){ o.push(+id); localStorage.setItem('cw_pfx_own',JSON.stringify(o)); } };
})();
