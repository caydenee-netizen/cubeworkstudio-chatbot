/* Update 7 garage: a paint shop for your race car (two-tone paint and underglow, seen by everyone in Cube Race),
   an effect style chooser for animated pad skins, and a wishlist board so other players know which pad skins to mail you. */
(function(){
var esc=function(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
var SW=['#e1352b','#ff7a1a','#f2c400','#3ecf8e','#1f9a52','#16b8c9','#1d4fd8','#7a5cff','#d63fb4','#f4f4f2','#7b808a','#15181d'];
var SPD=[['.5','Slow'],['1','Normal'],['1.6','Fast']];
function lj(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)||'null'); return v==null?d:v; }catch(e){ return d; } }
function sj(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
function paint(){ var o=lj('cw_paint7',{}); return o&&typeof o==='object'?o:{}; }
var WL={d:null,busy:false};
/* ---- paint shop ---- */
function carSvg(p,u){ var a=p?p[0]:'#e1352b', b=p?p[1]:'#f2c400'; return '<svg viewBox="0 0 220 110" width="220" height="110" role="img" aria-label="Car preview">'+(u?'<ellipse cx="110" cy="92" rx="88" ry="12" fill="'+u+'" opacity=".55"/>':'<ellipse cx="110" cy="94" rx="80" ry="8" fill="#000" opacity=".25"/>')
  +'<path d="M30 74 L46 46 Q52 38 64 38 L150 38 Q164 38 172 48 L194 74 Z" fill="'+a+'"/><path d="M64 44 L150 44 Q158 44 164 52 L176 70 L52 70 Z" fill="'+b+'" opacity=".95"/><rect x="24" y="66" width="174" height="14" rx="6" fill="'+a+'"/>'
  +'<circle cx="62" cy="82" r="13" fill="#15181d"/><circle cx="62" cy="82" r="5" fill="#9aa0a8"/><circle cx="160" cy="82" r="13" fill="#15181d"/><circle cx="160" cy="82" r="5" fill="#9aa0a8"/></svg>'; }
function swatches(k,cur){ return '<div class="g7-sw">'+SW.map(function(c){ return '<button type="button" data-g7c="'+k+'" data-v="'+c+'" aria-pressed="'+(cur===c)+'" style="background:'+c+'" aria-label="'+c+'"></button>'; }).join('')+'</div>'; }
function paintHtml(){ var o=paint(), p=o.p||null, u=o.u||'';
  return '<h3 style="margin:0 0 4px">🎨 Paint shop</h3><p class="muted" style="font-size:13.5px;margin:0 0 10px">Two-tone paint for the classic cube car and a glow under any car. Everyone sees it in Cube Race. Free to change any time.</p>'
   +'<div class="row" style="gap:16px;flex-wrap:wrap;align-items:center"><div class="g7-pv">'+carSvg(p,u)+'</div><div style="flex:1;min-width:220px">'
   +'<small class="muted">Main colour</small>'+swatches('a',p?p[0]:'')+'<small class="muted">Second colour</small>'+swatches('b',p?p[1]:'')+'<small class="muted">Underglow</small>'+swatches('u',u)
   +'<div class="row" style="gap:8px;margin-top:8px"><button type="button" class="btn sm" data-g7="clrp">Factory paint</button><button type="button" class="btn sm" data-g7="clru">No glow</button></div></div></div>'; }
/* ---- effect style ---- */
function fxHtml(){ var F=window.CW_PADFX, fins=(F&&F.fins7)||[], cur=localStorage.getItem('cw_pad_fin7')||'', sp=localStorage.getItem('cw_pad_spd7')||'1';
  return '<h3 style="margin:0 0 4px">✨ Effect style</h3><p class="muted" style="font-size:13.5px;margin:0 0 10px">For animated pad skins: how fast the effect moves, and which burst plays when you stop the timer.</p>'
   +'<small class="muted">Speed</small><div class="seg" style="margin:4px 0 10px">'+SPD.map(function(x){ return '<button type="button" data-g7s="'+x[0]+'" aria-pressed="'+(String(+sp)===String(+x[0]))+'">'+x[1]+'</button>'; }).join('')+'</div>'
   +'<small class="muted">Finish burst</small><div class="row" style="gap:6px;flex-wrap:wrap;margin-top:4px"><button type="button" class="btn sm" data-g7f="" aria-pressed="'+(!cur)+'">Skin default</button>'+fins.map(function(n){ return '<button type="button" class="btn sm" data-g7f="'+n+'" aria-pressed="'+(cur===n)+'">'+n.charAt(0).toUpperCase()+n.slice(1)+'</button>'; }).join('')+'</div>'
   +'<div class="g7-try" id="g7Try"><span>Tap to preview the burst</span></div>'; }
/* ---- wishlist ---- */
function wlHtml(){ var d=WL.d; if(!d) return '<h3 style="margin:0">💌 Wishlist board</h3><p class="muted">Loading…</p>'; if(d.err) return '<h3 style="margin:0">💌 Wishlist board</h3><p class="muted">'+esc(d.err)+'</p>';
  var own=PL.skins.owned(), nm=function(i){ return PL.skins.name(i)||('Skin '+i); }, css=function(i){ var s=PL.skins.list.filter(function(x){ return x.i===i; })[0]; return s?s.css:'#444'; };
  var pick=PL.skins.list.filter(function(s){ return s.i>0&&own.indexOf(s.i)<0; });
  return '<h3 style="margin:0 0 4px">💌 Wishlist board</h3><p class="muted" style="font-size:13.5px;margin:0 0 10px">Pick up to 5 pad skins you want. Players who own one can send it to you by Mail. Your wishlist shows under your username'+(d.name?' <b>'+esc(d.name)+'</b>':'')+'.</p>'
   +'<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:8px">'+(d.mine.length?d.mine.map(function(i){ return '<span class="tag g7-tg"><i style="background:'+css(i)+'"></i>'+esc(nm(i))+' <button type="button" data-g7w="rm" data-v="'+i+'" aria-label="Remove">✕</button></span>'; }).join(''):'<span class="muted" style="font-size:13px">Your wishlist is empty.</span>')+'</div>'
   +(d.mine.length<5?'<div class="row" style="gap:8px;flex-wrap:wrap"><select class="in" id="g7Sel" style="max-width:240px"><option value="">Add a skin you want…</option>'+pick.map(function(s){ return '<option value="'+s.i+'">'+esc(s.n)+'</option>'; }).join('')+'</select><button type="button" class="btn sm pri" data-g7w="add">Add</button></div>':'')
   +'<div style="margin-top:12px">'+(d.rows.filter(function(r){ return !r.me; }).length?d.rows.filter(function(r){ return !r.me; }).map(function(r){ var can=r.sk.filter(function(i){ return own.indexOf(i)>=0; });
      return '<div class="row c7-r" style="flex-wrap:wrap"><b>'+esc(r.n)+'</b><span class="row" style="gap:4px;flex-wrap:wrap">'+r.sk.map(function(i){ return '<span class="tag g7-tg'+(own.indexOf(i)>=0?' have':'')+'"><i style="background:'+css(i)+'"></i>'+esc(nm(i))+'</span>'; }).join('')+'</span><span class="sp"></span>'+(can.length?'<button type="button" class="btn sm pri" data-g7w="send" data-n="'+esc(r.n)+'" data-v="'+can[0]+'">Send '+esc(nm(can[0]))+'</button>':'')+'</div>'; }).join(''):'<p class="muted" style="font-size:13px">Nobody else has a wishlist yet.</p>')+'</div>'; }
function wlLoad(b){ b=b||{act:'get'}; b.id=CW.devId(); WL.busy=true; return CW.call('/api/wish',b,9000).then(function(r){ WL.busy=false; var d=r&&r.data; if(d&&d.ok) WL.d=d; else if(b.act==='set') CW.toast((d&&d.error)||'Could not save.'); else WL.d={err:(d&&d.error)||'Could not load the board.'}; var e=document.getElementById('g7Wl'); if(e) e.innerHTML=wlHtml(); }); }
function box(id,inner){ var d=document.createElement('div'); d.className='pnl'; d.id=id; d.style.marginTop='14px'; d.innerHTML=inner; return d; }
function stopAll(el){ ['pointerdown','pointerup','touchstart','touchend','mousedown','mouseup'].forEach(function(n){ el.addEventListener(n,function(e){ e.stopPropagation(); }); }); }
function bind(el){ if(el._g7) return; el._g7=1; stopAll(el);
  el.addEventListener('click',function(e){ var t=e.target, c=t.closest('[data-g7c]'), a=t.closest('[data-g7]'), s=t.closest('[data-g7s]'), f=t.closest('[data-g7f]'), w=t.closest('[data-g7w]'), tr=t.closest('#g7Try');
    if(!c&&!a&&!s&&!f&&!w&&!tr) return; e.stopPropagation(); e.preventDefault();
    if(c){ var o=paint(), k=c.getAttribute('data-g7c'), v=c.getAttribute('data-v'); if(k==='u') o.u=v; else { o.p=o.p||['#e1352b','#f2c400']; o.p[k==='a'?0:1]=v; } sj('cw_paint7',o); var b=document.getElementById('g7Paint'); if(b) b.innerHTML=paintHtml(); return; }
    if(a){ var o2=paint(); if(a.getAttribute('data-g7')==='clrp') delete o2.p; else delete o2.u; sj('cw_paint7',o2); var b2=document.getElementById('g7Paint'); if(b2) b2.innerHTML=paintHtml(); return; }
    if(s){ localStorage.setItem('cw_pad_spd7',s.getAttribute('data-g7s')); var b3=document.getElementById('g7Fx'); if(b3) b3.innerHTML=fxHtml(); return; }
    if(f){ var v2=f.getAttribute('data-g7f'); if(v2) localStorage.setItem('cw_pad_fin7',v2); else localStorage.removeItem('cw_pad_fin7'); var b4=document.getElementById('g7Fx'); if(b4) b4.innerHTML=fxHtml(); var tt=document.getElementById('g7Try'); if(tt&&window.CW_PADFX) CW_PADFX.finish(tt,PL.skins.cur()); return; }
    if(tr){ if(window.CW_PADFX) CW_PADFX.finish(tr,PL.skins.cur()); return; }
    if(w&&WL.d&&!WL.busy){ var k2=w.getAttribute('data-g7w'), mine=(WL.d.mine||[]).slice();
      if(k2==='add'){ var sel=document.getElementById('g7Sel'), vv=+(sel&&sel.value); if(!vv) return CW.toast('Pick a skin first.'); if(mine.indexOf(vv)<0) mine.push(vv); wlLoad({act:'set',sk:mine}); }
      else if(k2==='rm'){ var rv=+w.getAttribute('data-v'); wlLoad({act:'set',sk:mine.filter(function(x){ return x!==rv; })}); }
      else if(k2==='send'){ sj('cw_mail_pre',{to:w.getAttribute('data-n'),skin:+w.getAttribute('data-v')}); location.hash='mail'; } } }); }
PL.onUpd7&&PL.onUpd7(function(){
  try{ if(PL.skins&&PL.skins.list&&!PL.skins.list.some(function(k){ return k.i===100; })) PL.skins.list.push({i:100,n:'MagLev',ty:'season',cost:0,gift:1,css:'linear-gradient(135deg,#0b0d12 0%,#1b2433 45%,#4fa3ff 46%,#c9ced8 52%,#0b0d12 53%)',need:'MagLev owners only · redeem the code that comes with your MagLev'}); }catch(e){}
  var V=PL.views.garage; if(!V||V._g7) return; V._g7=1; var o=V.show;
  V.show=function(el,h){ var r=o.apply(this,arguments); try{ var tab=(String(h||'').split('/')[1])||'cars', w=el.querySelector('.wrap'); if(!w) return r;
      if(tab==='cars'&&!el.querySelector('#g7Paint')){ var b=box('g7Paint',paintHtml()); w.appendChild(b); bind(b); }
      if(tab==='cars'&&!el.querySelector('#g7Code')){ var bc=box('g7Code','<h3 style="margin:0 0 4px">🎟 Have a MagLev code?</h3><p class="muted" style="font-size:13.5px;margin:0 0 10px">MagLev owners get a code. Redeem it for the exclusive MagLev pad skin and the MagLev Hover car.</p><div class="row" style="gap:8px;flex-wrap:wrap"><input class="inp" id="g7CodeIn" maxlength="16" placeholder="Code" autocomplete="off" autocapitalize="characters" style="max-width:220px;text-transform:uppercase"><button type="button" class="btn pri" data-g7r="1">Redeem</button></div>'); w.appendChild(bc); stopAll(bc); bc.addEventListener('click',function(e){ var r=e.target.closest('[data-g7r]'); if(!r) return; e.stopPropagation(); var c=(document.getElementById('g7CodeIn').value||'').trim(); if(c.length<4) return CW.toast('Type your code.'); r.disabled=true; CW.call('/api/redeem',{id:CW.devId(),code:c},9000).then(function(x){ r.disabled=false; var d=x&&x.data; if(d&&d.ok){ CW.toast('Code redeemed! Your gifts are on the way.'); document.getElementById('g7CodeIn').value=''; if(PL.poll) PL.poll(); } else CW.toast((d&&d.error)||'Could not redeem. Try again.'); }); }); }
      if(tab==='pads'){ if(!el.querySelector('#g7Fx')){ var b2=box('g7Fx',fxHtml()); w.appendChild(b2); bind(b2); } if(!el.querySelector('#g7Wl')){ var b3=box('g7Wl',wlHtml()); w.appendChild(b3); bind(b3); wlLoad(); } } }catch(e){ console.error(e); } return r; };
  if(/^#garage/.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange')); });
})();
