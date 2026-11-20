/* Cuber Tools accounts: username + password, or Google. An account keeps your player and a cloud copy of your progress, so any device you sign in on picks up where you left off.
   From Google we only use the name (as your username); nothing else is kept. */
(function(){
'use strict';
var CW=window.CW, PL=window.PL; if(!CW||!PL) return;
var $=CW.$, esc=CW.esc;
var SKIP=/^(cw_devid|cw_owner|cw_push_|cw_lang|cw_live_url|cw_site_cache|cw_acct)/;
function acct(){ try{ var a=JSON.parse(localStorage.getItem('cw_acct')||'null'); return a&&a.tok?a:null; }catch(e){ return null; } }
function setAcct(a){ try{ if(a) localStorage.setItem('cw_acct',JSON.stringify(a)); else localStorage.removeItem('cw_acct'); }catch(e){} }
function snapshot(){ var o={}; try{ for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i); if(/^cw_/.test(k)&&!SKIP.test(k)) o[k]=localStorage.getItem(k); } }catch(e){} return JSON.stringify(o); }
function restore(txt){ var o; try{ o=JSON.parse(txt||'{}'); }catch(e){ return false; }
  try{ var del=[]; for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i); if(/^cw_/.test(k)&&!SKIP.test(k)) del.push(k); } del.forEach(function(k){ localStorage.removeItem(k); });
    Object.keys(o).forEach(function(k){ if(/^cw_/.test(k)&&!SKIP.test(k)&&typeof o[k]==='string') localStorage.setItem(k,o[k]); }); }catch(e){ return false; } return true; }
function hash(s){ var h=5381; for(var i=0;i<s.length;i++) h=((h<<5)+h+s.charCodeAt(i))|0; return h+':'+s.length; }
var busy=false;
async function sync(force){ var a=acct(); if(!a||busy) return; var snap=snapshot(), h=hash(snap); if(!force&&localStorage.getItem('cw_acct_h')===h) return; if(snap.length>220000) return;
  busy=true; var r=await CW.call('/api/acct/save',{tok:a.tok,data:snap},12000); busy=false;
  if(r.ok){ try{ localStorage.setItem('cw_acct_h',h); localStorage.setItem('cw_acct_t',String(Date.now())); }catch(e){} }
  else if(r.status===401){ setAcct(null); } return r.ok; }
/* signed in on the shop first? then this device may need to adopt the account's player */
setTimeout(function(){ var a=acct(); if(!a) return; CW.call('/api/acct/me',{tok:a.tok},9000).then(function(r){ if(r.status===401){ setAcct(null); return; } if(r.ok&&r.data&&r.data.pid&&r.data.pid!==CW.devId()) landed(Object.assign({tok:a.tok},r.data),false); }); },1800);
setInterval(function(){ sync(false); },90000); setTimeout(function(){ sync(false); },6000);
document.addEventListener('visibilitychange',function(){ if(document.hidden) sync(false); });

function newDev(){ try{ localStorage.setItem('cw_devid','d'+Math.random().toString(36).slice(2,10)); }catch(e){} }
/* after any successful sign-in or sign-up */
async function landed(d,fresh){
  var cur=CW.devId(), same=d.pid===cur;
  setAcct({tok:d.tok,name:d.name,g:!!d.g});
  if(fresh||(same&&!d.hasSave)){ try{ localStorage.setItem('cw_handle',d.name); }catch(e){} await sync(true); CW.toast('Signed in as '+d.name+'. Progress is saved to your account.'); location.reload(); return; }
  if(same&&d.hasSave){ try{ localStorage.setItem('cw_handle',d.name); }catch(e){} CW.toast('Signed in as '+d.name+'.'); location.reload(); return; }
  /* signing in from another device (or after a sign out): choose which progress to keep */
  var sh=CW.sheet('<div class="hd"><h2>Welcome back, '+esc(d.name)+'</h2><button class="x" data-close aria-label="Close">✕</button></div>'
    +'<p class="muted" style="margin-bottom:12px">'+(d.hasSave?'Your account has saved progress. Which should this device use?':'Your account has no saved progress yet. Keep what is on this device?')+'</p>'
    +(d.hasSave?'<button class="btn pri wide" id="acUse" type="button">Use my account’s progress</button><button class="btn wide" id="acKeep" type="button" style="margin-top:8px">Keep this device’s progress (replaces the cloud copy)</button>':'<button class="btn pri wide" id="acKeep" type="button">Keep this device’s progress</button>'));
  var go=async function(useCloud){
    var btns=sh.querySelectorAll('button'); btns.forEach(function(b){ b.disabled=true; });
    try{ localStorage.setItem('cw_devid',d.pid); localStorage.setItem('cw_handle',d.name); }catch(e){}
    if(useCloud){ var r=await CW.call('/api/acct/load',{tok:d.tok},12000); if(!r.ok||!restore(r.data.data)){ CW.toast('Couldn’t load your progress. Try again.'); btns.forEach(function(b){ b.disabled=false; }); return; } try{ localStorage.setItem('cw_handle',d.name); localStorage.setItem('cw_acct_h',hash(snapshot())); localStorage.setItem('cw_acct_t',String(Date.now())); }catch(e){} }
    else await sync(true);
    location.reload(); };
  var u=$('#acUse',sh), k=$('#acKeep',sh); if(u) u.onclick=function(){ go(true); }; if(k) k.onclick=function(){ go(false); };
}
var gisLoaded=false;
function gis(cb){ if(window.google&&google.accounts&&google.accounts.id) return cb(true); if(gisLoaded) return setTimeout(function(){ gis(cb); },300); gisLoaded=true;
  var s=document.createElement('script'); s.src='https://accounts.google.com/gsi/client'; s.async=true; s.onload=function(){ cb(true); }; s.onerror=function(){ gisLoaded=false; cb(false); }; document.head.appendChild(s); }

function authSheet(mode){
  var sh=CW.sheet('<div class="hd"><h2>Account</h2><button class="x" data-close aria-label="Close">✕</button></div>'
   +'<div id="acG" style="min-height:44px;display:flex;justify-content:center"></div><p class="muted" id="acGm" style="font-size:12.5px;text-align:center;margin:6px 0"></p>'
   +'<div class="seg" id="acT" style="margin:10px 0"><button type="button" data-m="in" aria-pressed="'+(mode!=='up')+'">Sign in</button><button type="button" data-m="up" aria-pressed="'+(mode==='up')+'">Create account</button></div>'
   +'<div class="field"><label for="acU">Username</label><input class="in" id="acU" maxlength="16" autocomplete="username" autocapitalize="none" spellcheck="false"></div>'
   +'<div class="field"><label for="acP">Password</label><input class="in" id="acP" type="password" maxlength="64" autocomplete="current-password"></div>'
   +'<p class="muted" id="acHint" style="font-size:12.5px"></p><p class="msg bad" id="acM" style="display:none"></p>'
   +'<button class="btn pri wide" id="acGo" type="button"></button>'
   +'<p class="muted" style="font-size:12px;margin-top:10px">Your account saves your progress (tokens, skins, solves, settings) so any device you sign in on has it. Signing in with Google only uses your name as your username; we don’t keep your email or photo.</p>');
  var m=mode==='up'?'up':'in';
  function ui(){ $('#acGo',sh).textContent=m==='up'?'Create account':'Sign in'; $('#acHint',sh).textContent=m==='up'?'Pick a username (3–16 letters, numbers, . _ -) and a password of 8+ characters.':''; $('#acP',sh).setAttribute('autocomplete',m==='up'?'new-password':'current-password');
    $$('#acT button',sh).forEach(function(b){ b.setAttribute('aria-pressed',b.getAttribute('data-m')===m); }); }
  function $$(q,r){ return CW.$$(q,r); } ui();
  $('#acT',sh).onclick=function(e){ var b=e.target.closest('[data-m]'); if(b){ m=b.getAttribute('data-m'); ui(); } };
  function err(t){ var x=$('#acM',sh); x.style.display=t?'':'none'; x.textContent=t||''; }
  $('#acGo',sh).onclick=async function(){ var bt=this; err(''); var u=$('#acU',sh).value.trim(), p=$('#acP',sh).value;
    if(!u||!p){ err('Enter a username and password.'); return; } bt.disabled=true;
    var r=m==='up'?await CW.call('/api/acct/create',{user:u,pass:p,pid:CW.devId()},15000):await CW.call('/api/acct/login',{user:u,pass:p},15000);
    bt.disabled=false; if(!r.ok||!r.data||!r.data.tok){ err((r.data&&r.data.error)||'Could not reach the server. Try again.'); return; } var cx=sh.querySelector('[data-close]'); if(cx) cx.click(); landed(r.data,m==='up'); };
  CW.call('/api/acct/cfg',{},8000).then(function(r){ var gid=r.ok&&r.data&&r.data.gid, box=$('#acG',sh); if(!box) return;
    if(!gid){ $('#acG',sh).style.display='none'; return; }
    gis(function(ok){ if(!ok||!$('#acG',sh)){ var gm=$('#acGm',sh); if(gm) gm.textContent='Google sign-in couldn’t load. Use a username instead.'; return; }
      google.accounts.id.initialize({client_id:gid,callback:async function(resp){ err(''); var gm=$('#acGm',sh); if(gm) gm.textContent='Checking with Google…';
        var rr=await CW.call('/api/acct/google',{cred:resp.credential,pid:CW.devId()},15000); if(gm) gm.textContent='';
        if(!rr.ok||!rr.data||!rr.data.tok){ err((rr.data&&rr.data.error)||'Google sign-in failed. Try again.'); return; } var cx=sh.querySelector('[data-close]'); if(cx) cx.click(); landed(rr.data,!!rr.data.isNew); },ux_mode:'popup',auto_select:false});
      google.accounts.id.renderButton(box,{theme:'outline',size:'large',text:m==='up'?'signup_with':'continue_with',shape:'pill',width:280}); }); });
}

function ago(t){ if(!t) return 'not yet'; var s=Math.round((Date.now()-t)/1000); return s<60?'just now':s<3600?Math.round(s/60)+' min ago':s<86400?Math.round(s/3600)+' h ago':Math.round(s/86400)+' d ago'; }
PL.acct={
  info:acct, sync:sync,
  html:function(){ var a=acct();
    if(!a) return '<div class="pnl" id="acBox"><h3>👤 Account</h3><p class="muted" style="font-size:14px">Create an account or sign in with Google to save your progress to the cloud and use it on any device.</p><div class="row" style="margin-top:10px;gap:8px"><button class="btn sm pri" id="acIn" type="button">Sign in</button><button class="btn sm" id="acUp" type="button">Create account</button></div></div>';
    var t=+localStorage.getItem('cw_acct_t')||0;
    return '<div class="pnl" id="acBox"><h3>👤 '+esc(a.name)+'</h3><p class="muted" style="font-size:14px">Signed in'+(a.g?' with Google':'')+'. Progress saves automatically · last saved '+ago(t)+'.</p><div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap"><button class="btn sm pri" id="acSave" type="button">Save now</button><button class="btn sm" id="acOut" type="button">Sign out</button><button class="btn sm" id="acDel" type="button">Delete account</button></div><p class="muted" id="acSm" style="font-size:12.5px;margin-top:6px"></p></div>'; },
  bind:function(el){
    var i=$('#acIn',el), u=$('#acUp',el); if(i) i.onclick=function(){ authSheet('in'); }; if(u) u.onclick=function(){ authSheet('up'); };
    var sv=$('#acSave',el); if(sv) sv.onclick=async function(){ sv.disabled=true; var ok=await sync(true); sv.disabled=false; var m=$('#acSm',el); if(m) m.textContent=ok?'Saved.':'Couldn’t save. Try again.'; };
    var out=$('#acOut',el); if(out) out.onclick=async function(){ await sync(true); var a=acct(); if(a) await CW.call('/api/acct/out',{tok:a.tok},8000); setAcct(null); newDev(); try{ localStorage.removeItem('cw_acct_h'); }catch(e){} location.reload(); };
    var del=$('#acDel',el); if(del) del.onclick=function(){ var a=acct(); if(!a) return;
      var sh=CW.sheet('<div class="hd"><h2>Delete account</h2><button class="x" data-close aria-label="Close">✕</button></div><p class="muted">This removes your account and its cloud save. Progress on this device stays.'+(a.g?'':' Enter your password to confirm.')+'</p>'+(a.g?'':'<div class="field"><label for="acDp">Password</label><input class="in" id="acDp" type="password" autocomplete="current-password"></div>')+'<p class="msg bad" id="acDm" style="display:none"></p><button class="btn pri wide" id="acDg" type="button">Delete my account</button>');
      $('#acDg',sh).onclick=async function(){ var b=this; b.disabled=true; var r=await CW.call('/api/acct/del',{tok:a.tok,pass:a.g?'':$('#acDp',sh).value},12000); b.disabled=false;
        if(!r.ok){ var e=$('#acDm',sh); e.style.display=''; e.textContent=(r.data&&r.data.error)||'Could not delete. Try again.'; return; } setAcct(null); newDev(); location.reload(); }; };
  }
};
})();
