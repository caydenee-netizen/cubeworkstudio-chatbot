/* Shop account page (#account): sign in with Google or a username, see your orders, keep your delivery details for next time.
   It is the same account as Cuber Tools, so progress there is saved too. */
(function(){
'use strict';
var CW=window.CW; if(!CW) return;
var $=CW.$, $$=CW.$$, esc=CW.esc, money=CW.money;
var STATES=['Johor','Kedah','Kelantan','Kuala Lumpur','Labuan','Melaka','Negeri Sembilan','Pahang','Penang','Perak','Perlis','Putrajaya','Sabah','Sarawak','Selangor','Terengganu'];
function acct(){ try{ var a=JSON.parse(localStorage.getItem('cw_acct')||'null'); return a&&a.tok?a:null; }catch(e){ return null; } }
function setAcct(a){ try{ if(a) localStorage.setItem('cw_acct',JSON.stringify(a)); else localStorage.removeItem('cw_acct'); }catch(e){} nav(); }
function nav(){ var a=acct(), l=$('#acLink'); if(l) l.textContent=a?'👤 '+a.name:'Account'; }
var gisLoaded=false;
function gis(cb){ if(window.google&&google.accounts&&google.accounts.id) return cb(true); if(gisLoaded) return setTimeout(function(){ gis(cb); },300); gisLoaded=true;
  var s=document.createElement('script'); s.src='https://accounts.google.com/gsi/client'; s.async=true; s.onload=function(){ cb(true); }; s.onerror=function(){ gisLoaded=false; cb(false); }; document.head.appendChild(s); }
function myOrders(){ try{ var a=JSON.parse(localStorage.getItem('cw2_orders')||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
/* after sign-in / sign-up: attach this device's earlier orders and bring back the saved delivery details */
async function landed(d){ setAcct({tok:d.tok,name:d.name,g:!!d.g});
  var mine=myOrders(); if(mine.length) await CW.call('/api/acct/claim',{tok:d.tok,orders:mine.map(function(o){ return {code:o.code,token:o.token}; })},12000);
  var p=await CW.call('/api/acct/profile',{tok:d.tok},9000); try{ if(p.ok&&p.data.pf&&p.data.pf.name&&!localStorage.getItem('cw2_contact')) localStorage.setItem('cw2_contact',JSON.stringify(p.data.pf)); }catch(e){}
  CW.toast('Signed in as '+d.name+'.'); if(location.hash==='#account') draw(); else location.hash='account'; }
function authForm(box,mode){
  var m=mode==='up'?'up':'in';
  box.innerHTML='<div id="saG" style="min-height:44px;display:flex;justify-content:center"></div><p class="muted" id="saGm" style="font-size:12.5px;text-align:center;margin:6px 0"></p>'
   +'<div class="sws" id="saT" style="margin:10px 0"><button type="button" class="sw" data-m="in">Sign in</button><button type="button" class="sw" data-m="up">Create account</button></div>'
   +'<div class="field"><label for="saU">Username</label><input class="in" id="saU" maxlength="16" autocomplete="username" autocapitalize="none" spellcheck="false"></div>'
   +'<div class="field"><label for="saP">Password</label><input class="in" id="saP" type="password" maxlength="64"></div>'
   +'<p class="muted" id="saH" style="font-size:12.5px"></p><div class="msg" id="saM"></div><button class="btn pri wide" id="saGo" type="button" style="margin-top:8px"></button>';
  function ui(){ $('#saGo',box).textContent=m==='up'?'Create account':'Sign in'; $('#saH',box).textContent=m==='up'?'Pick a username (3–16 letters, numbers, . _ -) and a password of 8+ characters.':''; $('#saP',box).setAttribute('autocomplete',m==='up'?'new-password':'current-password'); $$('#saT button',box).forEach(function(b){ b.setAttribute('aria-pressed',b.getAttribute('data-m')===m); }); }
  ui();
  $('#saT',box).onclick=function(e){ var b=e.target.closest('[data-m]'); if(b){ m=b.getAttribute('data-m'); ui(); } };
  function err(t){ var x=$('#saM',box); x.className='msg'+(t?' bad':''); x.textContent=t||''; }
  $('#saGo',box).onclick=async function(){ var bt=this; err(''); var u=$('#saU',box).value.trim(), p=$('#saP',box).value; if(!u||!p){ err('Enter a username and password.'); return; } bt.disabled=true;
    var r=m==='up'?await CW.call('/api/acct/create',{user:u,pass:p,pid:CW.devId()},15000):await CW.call('/api/acct/login',{user:u,pass:p},15000); bt.disabled=false;
    if(!r.ok||!r.data||!r.data.tok){ err((r.data&&r.data.error)||'Could not reach the server. Try again.'); return; } landed(r.data); };
  CW.call('/api/acct/cfg',{},8000).then(function(r){ var gid=r.ok&&r.data&&r.data.gid, g=$('#saG',box); if(!g) return; if(!gid){ g.style.display='none'; return; }
    gis(function(ok){ if(!ok||!$('#saG',box)){ var gm=$('#saGm',box); if(gm) gm.textContent='Google sign-in couldn’t load. Use a username instead.'; return; }
      google.accounts.id.initialize({client_id:gid,ux_mode:'popup',auto_select:false,callback:async function(resp){ err(''); var gm=$('#saGm',box); if(gm) gm.textContent='Checking with Google…';
        var rr=await CW.call('/api/acct/google',{cred:resp.credential,pid:CW.devId()},15000); if(gm) gm.textContent='';
        if(!rr.ok||!rr.data||!rr.data.tok){ err((rr.data&&rr.data.error)||'Google sign-in failed. Try again.'); return; } landed(rr.data); }});
      google.accounts.id.renderButton(g,{theme:'outline',size:'large',text:'continue_with',shape:'pill',width:280}); }); });
}
function fld(id,label,val,attrs){ return '<div class="field"><label for="'+id+'">'+label+'</label><input class="in" id="'+id+'" value="'+esc(val||'')+'" '+(attrs||'')+'></div>'; }
async function draw(){ var box=$('#acPage'); if(!box) return; var a=acct();
  if(!a){ box.innerHTML='<div class="panel"><h2 style="font-size:26px">Your account</h2><p class="muted" style="margin:6px 0 12px">Sign in to see all your orders in one place and skip typing your delivery details. It also saves your Cuber Tools progress.</p><div id="acF"></div><p class="note" style="margin-top:10px">With Google we only use your name as your username. We don’t keep your email or photo.</p></div>'; authForm($('#acF'),'in'); return; }
  box.innerHTML='<div class="panel"><h2 style="font-size:26px">Hi, '+esc(a.name)+'</h2><p class="muted" style="margin-top:6px">Signed in'+(a.g?' with Google':'')+'. <a href="/play/#rewards">Cuber Tools progress</a> is saved to this account.</p></div><div class="panel" style="margin-top:14px"><h2 style="font-size:22px">Your orders</h2><div id="acO"><p class="muted" style="margin-top:6px">Loading…</p></div></div><div class="panel" style="margin-top:14px"><h2 style="font-size:22px">Delivery details</h2><div id="acD"></div></div><div class="panel" style="margin-top:14px"><div class="sws"><button class="btn sm" id="acOut" type="button">Sign out</button><button class="btn sm" id="acDel" type="button">Delete account</button></div></div>';
  CW.call('/api/acct/orders',{tok:a.tok},10000).then(function(r){ var o=$('#acO'); if(!o) return; if(r.status===401){ setAcct(null); draw(); return; }
    if(!r.ok){ o.innerHTML='<p class="msg bad" style="margin-top:6px">Couldn’t load your orders. Check your connection.</p><button class="btn sm" type="button" id="acORe">Try again</button>'; $('#acORe').onclick=draw; return; }
    var L=(r.data&&r.data.orders)||[]; o.innerHTML=L.length?L.map(function(x){ return '<a class="line" style="grid-template-columns:1fr auto;text-decoration:none" href="#order/'+encodeURIComponent(x.code)+'/'+encodeURIComponent(x.token)+'"><div class="nm"><b class="mono">'+esc(x.code)+'</b><small>'+new Date(x.at).toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric'})+' · '+esc(x.status)+'</small></div><b class="mono">RM '+money(x.total)+' →</b></a>'; }).join(''):'<p class="muted" style="margin-top:6px">No orders yet. Orders you place while signed in show up here.</p>'; });
  CW.call('/api/acct/profile',{tok:a.tok},10000).then(function(r){ var d=$('#acD'); if(!d) return; if(!r.ok){ d.innerHTML='<p class="msg bad" style="margin-top:6px">Couldn’t load your saved details. Check your connection.</p><button class="btn sm" type="button" id="acDRe">Try again</button>'; $('#acDRe').onclick=draw; return; } var p=(r.data&&r.data.pf)||{name:'',phone:'',email:'',addr:{}}, ad=p.addr||{};
    d.innerHTML=fld('apN','Full name',p.name,'autocomplete="name"')+fld('apP','Mobile number',p.phone,'inputmode="tel" autocomplete="tel"')+fld('apE','Email',p.email,'type="email" autocomplete="email"')+fld('apA1','Address',ad.l1,'autocomplete="address-line1"')+fld('apA2','Address line 2 (optional)',ad.l2,'autocomplete="address-line2"')
      +'<div style="display:grid;grid-template-columns:1fr 1.4fr;gap:10px">'+fld('apPC','Postcode',ad.pc,'inputmode="numeric" maxlength="5"')+fld('apC','City',ad.city,'autocomplete="address-level2"')+'</div>'
      +'<div class="field"><label for="apS">State</label><select class="in" id="apS"><option value="">Choose…</option>'+STATES.map(function(x){ return '<option'+(ad.state===x?' selected':'')+'>'+x+'</option>'; }).join('')+'</select></div><div class="msg" id="apM"></div><button class="btn pri" id="apGo" type="button">Save details</button><p class="note">Used to fill in checkout for you. Saved with your account until you delete it.</p>';
    $('#apGo').onclick=async function(){ var v=function(i){ return $('#'+i).value.trim(); }; var pf={name:v('apN'),phone:v('apP'),email:v('apE'),addr:{l1:v('apA1'),l2:v('apA2'),pc:v('apPC'),city:v('apC'),state:v('apS')}}; this.disabled=true; var rr=await CW.call('/api/acct/profile',{tok:a.tok,pf:pf},10000); this.disabled=false; var m=$('#apM'); m.className='msg'+(rr.ok?' ok':' bad'); m.textContent=rr.ok?'Saved.':'Couldn’t save. Try again.'; if(rr.ok) try{ localStorage.setItem('cw2_contact',JSON.stringify(pf)); }catch(e){} }; });
  $('#acOut').onclick=async function(){ await CW.call('/api/acct/out',{tok:a.tok},8000); setAcct(null); try{ localStorage.setItem('cw_devid','d'+Math.random().toString(36).slice(2,10)); }catch(e){} draw(); };
  $('#acDel').onclick=function(){ var sh=CW.sheet('<div class="hd"><h2>Delete account</h2><button class="x" data-close aria-label="Close">✕</button></div><p class="muted">This removes your account, saved details and Cuber Tools cloud save. Your past orders stay on record for delivery and warranty.'+(a.g?'':' Enter your password to confirm.')+'</p>'+(a.g?'':'<div class="field"><label for="adP">Password</label><input class="in" id="adP" type="password" autocomplete="current-password"></div>')+'<div class="msg" id="adM"></div><button class="btn pri wide" id="adG" type="button">Delete my account</button>');
    $('#adG',sh).onclick=async function(){ var b=this; b.disabled=true; var r=await CW.call('/api/acct/del',{tok:a.tok,pass:a.g?'':$('#adP',sh).value},12000); b.disabled=false; if(!r.ok){ var e=$('#adM',sh); e.className='msg bad'; e.textContent=(r.data&&r.data.error)||'Could not delete. Try again.'; return; } setAcct(null); try{ localStorage.setItem('cw_devid','d'+Math.random().toString(36).slice(2,10)); }catch(e){} sh.querySelector('[data-close]').click(); draw(); }; };
}
window.CWShopAcct={ page:function(){ return '<section class="sec"><div class="wrap" style="max-width:640px"><div class="eyebrow">Account</div><div id="acPage"></div></div></section>'; }, after:draw, nav:nav, token:function(){ var a=acct(); return a?a.tok:''; } };
document.addEventListener('DOMContentLoaded',nav); nav();
})();
