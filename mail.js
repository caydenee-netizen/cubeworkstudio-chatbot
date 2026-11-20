/* /play — Mail. Send a pad skin, a spin or tokens to a player by username. They get it even when offline (it waits as a gift). */
(function(){
var PL=window.PL, CW=window.CW; if(!PL||!CW) return;
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function $(s,r){ return (r||document).querySelector(s); }
var BLOCK=[0,25,26,27,28,29,30,31,32,34,35,36,85];
var M={kind:'skin',skin:0,to:'',wrap:''};
var WRAPS=[['','Plain','✉️'],['party','Party','🎉'],['star','Stars','✨'],['gold','Gold','🏅'],['heart','Hearts','💖']];
function v4(){ return !!(PL.updOn4&&PL.updOn4()); }
function known(){ var o=recents().slice(); try{ (CW.lsJ('cw2_maillog',[])||[]).forEach(function(s){ if(s&&s.to) o.push(s.to); }); (CW.lsJ('cw2_giftlog',[])||[]).forEach(function(g){ var m=/^Mail from (.+)$/.exec((g&&g.f)||''); if(m) o.push(m[1]); }); }catch(e){} return o; }
function recents(){ var seen={},o=[]; sentLog().forEach(function(s){ var k=String(s.to||'').toLowerCase(); if(k&&!seen[k]&&o.length<5){ seen[k]=1; o.push(s.to); } }); return o; }
function me(){ return CW.devId(); }
function sentLog(){ return CW.lsJ('cw2_maillog',[])||[]; }
function addSent(o){ var l=sentLog(); l.unshift(o); CW.setJ('cw2_maillog',l.slice(0,30)); }
function mailable(){ var own=PL.skins.owned(); return PL.skins.list.filter(function(s){ return s.i>0&&BLOCK.indexOf(s.i)<0&&own.indexOf(s.i)>=0; }); }
function extraSpins(){ var s=CW.lsJ('cw_gacha',{})||{}; return Math.max(0,+s.extra||0); }
function ago(t){ var m=Math.round((Date.now()-t)/60000); return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago'; }
function describe(k,v){ return k==='note'?'a thank-you note':k==='skin'?'pad skin '+PL.skins.name(v):k==='spins'?v+' spin'+(v===1?'':'s'):v.toLocaleString()+' tokens'; }
function draw(el){
  try{ if(PL.mailSeen) PL.mailSeen(); }catch(e){}
  try{ var pre=CW.lsJ('cw_mail_pre',null); if(pre&&pre.to){ localStorage.removeItem('cw_mail_pre'); M.kind='skin'; M.to=String(pre.to); if(PL.skins.owned().indexOf(+pre.skin)>=0) M.skin=+pre.skin; } }catch(e){}
  var sk=mailable(), sp=extraSpins(), tk=PL.tok(), got=(CW.lsJ('cw2_giftlog',[])||[]).filter(function(g){ return /^Mail from/.test(g.f||''); }).slice(0,12), sent=sentLog().slice(0,12);
  if(M.kind==='skin'&&M.skin&&sk.every(function(s){ return s.i!==M.skin; })) M.skin=0;
  el.innerHTML='<div class="wrap">'+PL.crumbs('Mail')
   +'<div class="mail-grid"><div class="pnl mail-send"><div class="mail-hd"><span class="mail-ic">✉️</span><div><h3>Send mail</h3><p class="muted">Whatever you send leaves your account and lands in theirs. Online or offline, they get it next time they open Cuber Tools.</p></div></div>'
   +'<label class="mail-l" for="mTo">Send to (their username)</label><div class="row"><input class="in" id="mTo" maxlength="24" placeholder="Their exact username" autocomplete="off" autocapitalize="off" spellcheck="false" value="'+esc(M.to)+'" style="flex:1;min-width:0" role="combobox" aria-autocomplete="list" aria-controls="mAc"><span class="mail-ok" id="mOk" aria-live="polite"></span></div>'
   +(v4()&&recents().length?'<div class="mail-chips" id="mRc">'+recents().map(function(n){ return '<button type="button" data-r="'+esc(n)+'">'+esc(n)+'</button>'; }).join('')+'</div>':'')
   +'<label class="mail-l">What are you sending?</label><div class="seg" id="mK">'+[['skin','Pad skin ('+sk.length+')'],['spins','Spin ('+sp+')'],['tokens','Tokens ('+tk.toLocaleString()+')']].map(function(x){ return '<button type="button" data-k="'+x[0]+'" aria-pressed="'+(M.kind===x[0])+'">'+x[1]+'</button>'; }).join('')+'</div>'
   +'<div id="mPick" style="margin-top:12px">'+pick(sk,sp,tk)+'</div>'
   +(v4()?'<label class="mail-l">Gift wrap</label><div class="seg" id="mW">'+WRAPS.map(function(x){ return '<button type="button" data-w="'+x[0]+'" aria-pressed="'+(M.wrap===x[0])+'">'+x[2]+' '+x[1]+'</button>'; }).join('')+'</div>':'')
   +'<label class="mail-l" for="mNote">Message (optional)</label><input class="in" id="mNote" maxlength="60" placeholder="Say something nice" style="width:100%">'
   +'<div class="mail-sum" id="mSum"></div><button class="btn pri wide" id="mGo" style="margin-top:6px">Send mail</button></div>'
   +'<div class="pnl"><h3>Mailbox</h3><div class="seg" id="mT" style="margin-bottom:10px"><button type="button" data-t="in" aria-pressed="true">Received ('+got.length+')</button><button type="button" data-t="out" aria-pressed="false">Sent ('+sent.length+')</button></div><div id="mList"></div></div></div></div>';
  var tab='in';
  function list(){ var L=tab==='in'?got.map(function(g){ var fr=(g.f||'').replace(/^Mail from /,''); return {t:g.at,h:'<b>'+esc(fr)+'</b> sent you '+esc(g.l||''),m:g.m&&g.m!=='Sent to you by mail'?g.m:'',th:v4()&&fr?fr:''}; }):sent.map(function(s){ return {t:s.at,h:'You sent <b>'+esc(describe(s.k,s.v))+'</b> to <b>'+esc(s.to)+'</b>',m:s.note||''}; });
    $('#mList',el).innerHTML=L.length?'<div class="list">'+L.map(function(x){ return '<div><span>'+x.h+(x.m?'<br><small class="muted">“'+esc(x.m)+'”</small>':'')+'</span><span style="text-align:right">'+(x.th?'<button class="btn" data-th="'+esc(x.th)+'" style="padding:2px 10px;margin-right:8px">Say thanks</button>':'')+'<small class="muted">'+ago(x.t)+'</small></span></div>'; }).join('')+'</div>':'<p class="muted">'+(tab==='in'?'No mail yet. When someone sends you something it shows up here.':'You have not sent any mail yet.')+'</p>'; }
  $('#mT',el).onclick=function(e){ var b=e.target.closest('[data-t]'); if(!b) return; tab=b.getAttribute('data-t'); Array.prototype.forEach.call($('#mT',el).children,function(x){ x.setAttribute('aria-pressed',x===b); }); list(); };
  list(); sum(el);
  var to=$('#mTo',el), ck=0, ac=document.createElement('div'); ac.id='mAc'; ac.className='mail-ac'; ac.setAttribute('role','listbox'); ac.hidden=true; to.parentNode.style.position='relative'; to.parentNode.appendChild(ac);
  var acT=0, acQ='';
  function acShow(L){ L=L.filter(function(n,i){ return n&&L.findIndex(function(m){ return m.toLowerCase()===n.toLowerCase(); })===i&&n.toLowerCase()!==to.value.trim().toLowerCase(); }).slice(0,6); ac.innerHTML=L.map(function(n){ return '<button type="button" role="option" data-ac="'+esc(n)+'">'+esc(n)+'</button>'; }).join(''); ac.hidden=!L.length; }
  function acRun(){ var q=to.value.trim(), ql=q.toLowerCase(); acQ=q; if(!q){ ac.hidden=true; return; } var loc=known().filter(function(n){ return n.toLowerCase().indexOf(ql)===0; }); acShow(loc); clearTimeout(acT); acT=setTimeout(async function(){ var r=await CW.call('/api/online',{id:me(),q:q},5000); if(acQ!==q||document.activeElement!==to) return; var on=r.ok&&r.data&&r.data.list?r.data.list.map(function(x){ return x.n; }).filter(function(n){ return String(n).toLowerCase().indexOf(ql)>=0; }):[]; acShow(loc.concat(on)); },300); }
  ac.addEventListener('mousedown',function(e){ e.preventDefault(); });
  ac.onclick=function(e){ var b=e.target.closest('[data-ac]'); if(!b) return; to.value=b.getAttribute('data-ac'); ac.hidden=true; to.oninput(true); sum(el); };
  to.addEventListener('blur',function(){ setTimeout(function(){ ac.hidden=true; },120); });
  to.addEventListener('keydown',function(e){ if(e.key==='Escape') ac.hidden=true; });
  to.oninput=function(fromAc){ M.to=to.value; if(fromAc!==true) acRun(); $('#mOk',el).textContent=''; clearTimeout(ck); if(to.value.trim().length<2) return; ck=setTimeout(async function(){ var q=to.value.trim(); var r=await CW.call('/api/mail/check',{id:me(),to:q},6000); if(to.value.trim()!==q) return; var o=$('#mOk',el); if(!o) return; if(r.ok&&r.data&&r.data.ok){ o.textContent='✓ '+r.data.name; o.className='mail-ok good'; } else { o.textContent=(r.data&&r.data.error&&/No player/.test(r.data.error))?'Not found':''; o.className='mail-ok bad'; } },450); };
  var rc=$('#mRc',el); if(rc) rc.onclick=function(e){ var b=e.target.closest('[data-r]'); if(!b) return; to.value=b.getAttribute('data-r'); M.to=to.value; to.oninput(true); sum(el); };
  var mw=$('#mW',el); if(mw) mw.onclick=function(e){ var b=e.target.closest('[data-w]'); if(!b) return; M.wrap=b.getAttribute('data-w'); Array.prototype.forEach.call(mw.children,function(x){ x.setAttribute('aria-pressed',x===b); }); };
  $('#mList',el).onclick=function(e){ var b=e.target.closest('[data-th]'); if(b) thanks(b.getAttribute('data-th')); };
  $('#mK',el).onclick=function(e){ var b=e.target.closest('[data-k]'); if(!b) return; M.kind=b.getAttribute('data-k'); M.amt=0; Array.prototype.forEach.call($('#mK',el).children,function(x){ x.setAttribute('aria-pressed',x===b); }); $('#mPick',el).innerHTML=pick(sk,sp,tk); bindPick(el); sum(el); };
  bindPick(el);
  $('#mGo',el).onclick=function(){ send(el); };
}
function pick(sk,sp,tk){
  if(M.kind==='skin') return sk.length?'<div class="mail-skins" id="mSk">'+sk.map(function(s){ return '<button type="button" class="mail-sk" data-sk="'+s.i+'" aria-pressed="'+(M.skin===s.i)+'"><i style="background:'+s.css+'"></i><span>'+esc(s.n)+'</span></button>'; }).join('')+'</div>':'<p class="muted">You do not own any pad skins that can be mailed. Skins you buy or win in the Garage show up here. Special owner skins cannot be sent.</p>';
  if(M.kind==='spins') return sp>0?'<div class="row"><input class="in" id="mAmt" type="number" min="1" max="'+Math.min(5,sp)+'" value="'+(M.amt||1)+'" style="width:110px"><span class="muted">of your '+sp+' spare spin'+(sp===1?'':'s')+' (your free daily spin cannot be sent)</span></div>':'<p class="muted">You have no spare spins. Your free daily spin cannot be sent. Win spins from rewards and races.</p>';
  return '<div class="row"><input class="in" id="mAmt" type="number" min="1" max="10000" value="'+(M.amt||'')+'" placeholder="Amount" style="width:140px"><span class="muted">you have '+tk.toLocaleString()+' · up to 10,000 per mail</span></div><div class="mail-chips" id="mCh">'+[100,500,1000,5000].filter(function(n){ return n<=tk; }).map(function(n){ return '<button type="button" data-n="'+n+'">'+n.toLocaleString()+'</button>'; }).join('')+'</div>';
}
function bindPick(el){ var s=$('#mSk',el); if(s) s.onclick=function(e){ var b=e.target.closest('[data-sk]'); if(!b) return; M.skin=+b.getAttribute('data-sk'); Array.prototype.forEach.call(s.children,function(x){ x.setAttribute('aria-pressed',x===b); }); sum(el); };
  var a=$('#mAmt',el); if(a) a.oninput=function(){ M.amt=+a.value||0; sum(el); }; var c=$('#mCh',el); if(c) c.onclick=function(e){ var b=e.target.closest('[data-n]'); if(!b) return; M.amt=+b.getAttribute('data-n'); a.value=M.amt; sum(el); }; }
function value(){ return M.kind==='skin'?M.skin:Math.floor(+M.amt)||0; }
function problem(){ var v=value();
  if(M.kind==='skin'&&!v) return 'Pick a pad skin to send.';
  if(M.kind==='spins'){ var sp=extraSpins(); if(v<1) return 'Choose how many spins.'; if(v>5) return 'Up to 5 spins per mail.'; if(v>sp) return 'You only have '+sp+' spare spin'+(sp===1?'':'s')+'.'; }
  if(M.kind==='tokens'){ if(v<1) return 'Enter how many tokens.'; if(v>10000) return 'Up to 10,000 tokens per mail.'; if(v>PL.tok()) return 'You only have '+PL.tok().toLocaleString()+' tokens.'; }
  return ''; }
function sum(el){ var s=$('#mSum',el); if(!s) return; var p=problem(), v=value(); s.innerHTML=p?'<span class="muted">'+esc(p)+'</span>':'You will send <b>'+esc(describe(M.kind,v))+'</b>'+(M.to.trim()?' to <b>'+esc(M.to.trim())+'</b>':'')+'. It is removed from your account.'; }
async function send(el){ var to=($('#mTo',el).value||'').trim(), p=problem(); if(!to) return CW.toast('Type the username of the person you are sending to.'); if(p) return CW.toast(p);
  var v=value(), k=M.kind, note=($('#mNote',el).value||'').trim(), what=describe(k,v);
  if(!window.confirm('Send '+what+' to '+to+'? You will lose it and cannot get it back.')) return;
  var b=$('#mGo',el); b.disabled=true; b.textContent='Sending…';
  var r=await CW.call('/api/mail/send',{id:me(),name:PL.name?PL.name():'',own:PL.skins.owned(),to:to,kind:k,value:v,note:note,wrap:v4()?M.wrap:''},9000);
  b.disabled=false; b.textContent='Send mail';
  if(!(r.ok&&r.data&&r.data.ok)){ CW.toast((r.data&&r.data.error)||(r.status===0?'Could not reach the live server. Nothing was sent.':'Could not send. Nothing was sent.')); return; }
  if(k==='skin') PL.skins.lock(v); else if(k==='tokens') PL.add(-v); else PL.addSpins(-v);
  addSent({at:Date.now(),to:r.data.name||to,k:k,v:v,note:note}); M.skin=0; M.amt=0; M.to='';
  CW.toast('Sent '+what+' to '+(r.data.name||to)+'.'); draw($('#app')||el); }
async function thanks(name){ var t=window.prompt('Write a short thank-you to '+name+':','Thank you so much!'); if(!t||!t.trim()) return; var r=await CW.call('/api/mail/send',{id:me(),to:name,kind:'note',value:0,note:t.trim().slice(0,60),wrap:'heart'},9000); if(r.ok&&r.data&&r.data.ok){ addSent({at:Date.now(),to:name,k:'note',v:0,note:t.trim()}); CW.toast('Thank-you sent to '+name+'.'); draw($('#app')); } else CW.toast((r.data&&r.data.error)||'Could not send.'); }
PL.views.mail={show:function(el){ draw(el); },leave:function(){}};
window.addEventListener('load',function(){ if(PL.onUpd4) PL.onUpd4(function(){ if(/^#mail/.test(location.hash)&&$('#app')&&$('#mTo')) draw($('#app')); }); });
})();
