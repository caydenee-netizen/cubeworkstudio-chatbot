/* Cubeworkstudio core: shared by the shop and /play.
   Talks to the live server (cws-live), keeps the owner sign-in, the theme and small helpers. */
(function(){
'use strict';
var CW=window.CW={};
CW.LIVE_DEFAULT='https://cws-live.caydenee.workers.dev';
CW.WA='60182967670';
CW.ls=function(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} return null; };
CW.lsJ=function(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)); return v==null?d:v; }catch(e){ return d; } };
CW.setJ=function(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} };
CW.esc=function(t){ return String(t==null?'':t).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
CW.money=function(n){ n=Math.round((+n||0)*100)/100; return n%1?n.toFixed(2):String(n); };
CW.$=function(s,r){ return (r||document).querySelector(s); };
CW.$$=function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
CW.base=function(){ return (CW.ls('cw_live_url')||CW.LIVE_DEFAULT).replace(/\/+$/,''); };
CW.devId=function(){ var d=CW.ls('cw_devid'); if(!d){ d='d'+Math.random().toString(36).slice(2,10); CW.ls('cw_devid',d); } return d; };

/* one POST to the live server; never throws */
CW.call=async function(path,body,ms){
  var ctl=typeof AbortController!=='undefined'?new AbortController():null, t=ctl?setTimeout(function(){ ctl.abort(); },ms||7000):0;
  try{ var r=await fetch(CW.base()+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body||{}),cache:'no-store',signal:ctl?ctl.signal:undefined});
    var j={}; try{ j=await r.json(); }catch(e){} return {ok:r.ok,status:r.status,data:j}; }
  catch(e){ return {ok:false,status:0,data:{}}; } finally{ if(t) clearTimeout(t); }
};

/* ---- owner sign-in: the code is checked by the server, never in the page ---- */
CW.sha=async function(s){ try{ var h=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)); return Array.from(new Uint8Array(h)).map(function(x){ return x.toString(16).padStart(2,'0'); }).join(''); }catch(e){ return null; } };
CW.ownerKeys=function(){ var k=CW.ls('cw_owner_key'); return k?{key:k,key2:CW.ls('cw_owner_key2')||''}:null; };
CW.ownerSignIn=async function(code){
  var key=await CW.sha('cw3d-owner-v1'+code), key2=await CW.sha('cw-owner-v2'+code);
  if(!key||!key2) return {ok:false,msg:'Open the site over https to sign in.'};
  var r=await CW.call('/api/admin/verify',{key:key,key2:key2},8000);
  if(r.ok){ CW.ls('cw_owner_key',key); CW.ls('cw_owner_key2',key2); CW.ls('cw_owner_dev','1'); return {ok:true,secured:!!(r.data&&r.data.secured)}; }
  return {ok:false,msg:r.status===429?'Too many tries. Wait 10 minutes.':r.status===0?'Could not reach the live server.':'Incorrect code.'};
};
/* one-time secret: made on an owner device, signs a new device in once, then stops working */
CW.ownerClaim=async function(secret){ var r=await CW.call('/api/owner/claim',{secret:String(secret||''),name:(CW.ls('cw_handle')||'')},9000);
  if(r.ok&&r.data&&r.data.ok&&r.data.tok){ CW.ls('cw_owner_key','dt'); CW.ls('cw_owner_key2',r.data.tok); CW.ls('cw_owner_dev','1'); return {ok:true}; }
  return {ok:false,msg:(r.data&&r.data.error)||(r.status===0?'Could not reach the live server.':'That secret is wrong, already used or expired.')}; };
CW.ownerSignOut=function(){ CW.ls('cw_owner_key',null); CW.ls('cw_owner_key2',null); };
CW.admin=async function(path,extra){ var k=CW.ownerKeys(); if(!k) return {ok:false,status:403,data:{}};
  var r=await CW.call('/api/admin/'+path,Object.assign({},k,extra||{}),9000);
  if(r.status===403) CW.ownerSignOut();
  return r; };

/* ---- shop settings published by the owner (products, prices, codes, sale, announcement) ---- */
CW.site={cfg:null,ann:null,pay:'tng',loaded:false}; var siteSubs=[];
CW.onSite=function(fn){ siteSubs.push(fn); if(CW.site.loaded) fn(CW.site); };
CW.loadSite=async function(){
  var r=await CW.call('/api/site',{},7000);
  if(r.ok&&r.data){ CW.site.cfg=r.data.cfg||null; CW.site.ann=r.data.ann||null; CW.site.wc=r.data.wc||''; CW.site.pay=r.data.pay||'tng'; CW.site.cards=!!r.data.cards; if(Array.isArray(r.data.couriers)&&r.data.couriers.length) CW.site.couriers=r.data.couriers; CW.setJ('cw_site_cache',{cfg:CW.site.cfg,ann:CW.site.ann}); }
  else if(!CW.site.loaded){ var c=CW.lsJ('cw_site_cache',null); if(c){ CW.site.cfg=c.cfg; CW.site.ann=c.ann; } }
  CW.site.loaded=true; siteSubs.forEach(function(f){ try{ f(CW.site); }catch(e){} });
};
CW.saveSite=async function(part){ return CW.admin('siteset',part); };

/* ---- cube tokens (shown on both sides; earned and spent in /play) ---- */
CW.tokens=function(){ return Math.max(0,+(CW.ls('cw_arcpts')||0)||0); };

/* ---- theme ---- */
CW.theme=function(t){ if(t){ CW.ls('cw_theme2',t); } t=t||CW.ls('cw_theme2')||''; if(t==='light'||t==='dark') document.documentElement.setAttribute('data-theme',t); else document.documentElement.removeAttribute('data-theme'); return t; };
CW.toggleTheme=function(){ var dark=document.documentElement.getAttribute('data-theme')==='dark'||(!document.documentElement.getAttribute('data-theme')&&matchMedia('(prefers-color-scheme: dark)').matches); CW.theme(dark?'light':'dark'); };
CW.theme();

/* ---- toast ---- */
var tt=0; CW.toast=function(m){ var t=CW.$('#toast'); if(!t){ t=document.createElement('div'); t.id='toast'; t.className='toast'; t.setAttribute('role','status'); document.body.appendChild(t); }
  t.textContent=m; t.classList.add('on'); clearTimeout(tt); tt=setTimeout(function(){ t.classList.remove('on'); },2600); };

/* ---- sheet (modal) ---- */
CW.sheet=function(html,onClose){ var d=document.createElement('div'); d.className='sheet'; d.innerHTML='<div class="box" role="dialog" aria-modal="true">'+html+'</div>';
  function close(){ d.remove(); document.removeEventListener('keydown',key); if(onClose) onClose(); }
  function key(e){ if(e.key==='Escape') close(); }
  d.addEventListener('click',function(e){ if(e.target===d||e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown',key); document.body.appendChild(d); var f=d.querySelector('input,button:not([data-close])'); if(f) setTimeout(function(){ f.focus(); },50);
  d.close=close; return d; };

/* ---- copy ---- */
CW.copy=function(text,btn){ var done=function(){ if(btn){ var o=btn.textContent; btn.textContent='Copied ✓'; setTimeout(function(){ btn.textContent=o; },1600); } };
  /* old-style copy first: it works inside the tap on every phone, including iPhone Safari and in-app browsers */
  var ok=false; try{ var ta=document.createElement('textarea'); ta.value=text; ta.setAttribute('readonly',''); ta.style.cssText='position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px';
    document.body.appendChild(ta); ta.focus(); ta.select(); ta.setSelectionRange(0,text.length); ok=document.execCommand('copy'); ta.remove(); }catch(e){}
  if(ok){ done(); return; }
  try{ navigator.clipboard.writeText(text).then(done,function(){ CW.toast('Press and hold the value to copy it.'); }); }catch(e){ CW.toast('Press and hold the value to copy it.'); } };
})();

/* ---- the installable app and its notifications ---- */
(function(){
'use strict';
if('serviceWorker' in navigator) window.addEventListener('load',function(){ navigator.serviceWorker.register('/sw.js').catch(function(){}); });
function u8(s){ s=s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4) s+='='; var r=atob(s), o=new Uint8Array(r.length); for(var i=0;i<r.length;i++) o[i]=r.charCodeAt(i); return o; }
var P=CW.push={
  ok:function(){ return 'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window; },
  installed:function(){ try{ return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true; }catch(e){ return false; } },
  ios:function(){ return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1); },
  denied:function(){ return 'Notification' in window&&Notification.permission==='denied'; },
  sub:async function(){ try{ var reg=await navigator.serviceWorker.ready; return await reg.pushManager.getSubscription(); }catch(e){ return null; } },
  /* kind: 'owner' (order alerts, needs the owner console unlocked) or 'player' (rank alerts) */
  enable:async function(kind){
    if(!P.ok()) return {ok:false,msg:P.ios()&&!P.installed()?'On iPhone and iPad, add the site to your Home Screen first (see “Get the app”), then open it from there.':'This browser can’t do app notifications.'};
    if(P.ios()&&!P.installed()) return {ok:false,msg:'Open the app from your Home Screen first (see “Get the app”). Notifications only work there on iPhone and iPad.'};
    var perm=await Notification.requestPermission(); if(perm!=='granted') return {ok:false,msg:'Notifications are blocked. Allow them for this app in your device settings, then try again.'};
    var k=await CW.call('/api/push/key',{},9000); if(!k.ok||!k.data.key) return {ok:false,msg:'Couldn’t reach the server. Try again.'};
    var reg=await navigator.serviceWorker.ready, sub=await reg.pushManager.getSubscription(), want=u8(k.data.key);
    if(sub){ try{ var have=new Uint8Array(sub.options.applicationServerKey||[]); var same=have.length===want.length&&have.every(function(v,i){ return v===want[i]; }); if(!same){ await sub.unsubscribe(); sub=null; } }catch(e){} }
    try{ if(!sub) sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:want}); }catch(e){ return {ok:false,msg:'This device wouldn’t turn on notifications: '+(e&&e.message||'try again')}; }
    var j=sub.toJSON(), r=kind==='owner'?await CW.admin('pushsub',{sub:j}):await CW.call('/api/push/sub',{id:CW.devId(),sub:j,on:true,tz:-new Date().getTimezoneOffset()},9000);
    if(!r.ok||!(r.data&&r.data.ok)) return {ok:false,msg:(r.data&&r.data.error)||'The server didn’t accept it. Try again.'};
    try{ localStorage.setItem('cw_push_'+kind,'1'); }catch(e){} return {ok:true}; },
  disable:async function(kind){ var s=await P.sub(); var j=s?s.toJSON():null;
    if(kind==='owner') await CW.admin('pushsub',{on:false,sub:j}); else await CW.call('/api/push/sub',{id:CW.devId(),on:false},9000);
    try{ localStorage.removeItem('cw_push_'+kind); }catch(e){} return {ok:true}; },
  on:function(kind){ try{ return localStorage.getItem('cw_push_'+kind)==='1'&&P.ok()&&Notification.permission==='granted'; }catch(e){ return false; } },
  help:function(){ CW.sheet('<div class="hd"><h2>Get the app</h2><button class="x" data-close aria-label="Close">✕</button></div>'
    +'<p class="muted" style="margin-bottom:10px">Install it like an app. It opens full screen and can send you notifications.</p>'
    +'<h3 style="font-size:16px">iPhone and iPad</h3><ol style="padding-left:20px;line-height:1.8"><li>Open <b>cubeworkstudio.com</b> in <b>Safari</b>.</li><li>Tap the <b>Share</b> button, then <b>Add to Home Screen</b>.</li><li>Open the new <b>Cubeworks</b> icon on your Home Screen.</li><li>Turn on alerts inside the app.</li></ol>'
    +'<h3 style="font-size:16px;margin-top:12px">Android</h3><ol style="padding-left:20px;line-height:1.8"><li>Open the site in <b>Chrome</b>.</li><li>Tap the <b>⋮ menu</b>, then <b>Install app</b>.</li></ol>'
    +'<h3 style="font-size:16px;margin-top:12px">Computer</h3><p>Chrome or Edge: click the install icon in the address bar.</p>'); }
};
})();

/* funnel counters: one anonymous tick per step per device per day */
CW.ev=function(e,s){ try{ var d=new Date(Date.now()+288e5).toISOString().slice(0,10), k='cw_ev', o=JSON.parse(localStorage.getItem(k)||'{}'); if(o.d!==d) o={d:d}; var key=e+(s||''); if(o[key]) return; o[key]=1; localStorage.setItem(k,JSON.stringify(o)); CW.call('/api/ev',{e:e,s:s||''},4000); }catch(x){} };

/* corner buttons: after any scroll or viewport change, make the browser repaint them and check they are still on screen (iPad Safari sometimes drops pinned elements mid-scroll) */
/* Safety net for the corner buttons: if the browser stops keeping them fixed in the corner (seen on iPad Safari),
   switch them to a mode where we place them in the corner ourselves on every scroll. */
/* the corner buttons always stay position:fixed. (An older safety net switched them to absolute positioning, which made them ride along with the page and then jump on iPad.) */
(function fabPin(){ function clear(){ var f=document.querySelector('.fab'); if(!f) return; ['position','top','left'].forEach(function(k){ f.style.removeProperty(k); }); }
  clear(); setTimeout(clear,500); CW.fabPinned=function(){ return false; }; })();
(function fabKeep(){ var t=0; function fix(){ var f=document.querySelector('.fab'); if(!f||getComputedStyle(f).display==='none'||(CW.fabPinned&&CW.fabPinned())) return; if(f.parentNode!==document.body||f.nextElementSibling&&!/^(SCRIPT|STYLE|LINK)$/.test(f.nextElementSibling.tagName)) document.body.appendChild(f); var r=f.getBoundingClientRect(), vh=window.innerHeight; if(r.bottom>vh+4||r.bottom<vh-260||r.left<-4){ f.style.setProperty('bottom','16px','important'); f.style.setProperty('top','auto','important'); } }
  function later(){ clearTimeout(t); t=setTimeout(fix,140); } window.addEventListener('scroll',later,{passive:true}); window.addEventListener('resize',later); window.addEventListener('orientationchange',later); window.addEventListener('pageshow',later); window.addEventListener('touchend',later,{passive:true}); if(window.visualViewport){ visualViewport.addEventListener('resize',later); visualViewport.addEventListener('scroll',later); } document.addEventListener('visibilitychange',later); new MutationObserver(function(){ later(); }).observe(document.documentElement,{attributes:true,attributeFilter:['class','style']}); window.addEventListener('hashchange',later); CW.fabFix=later;
  /* full-screen overlays (cutscenes, chat) stop the page behind them from scrolling by catching touchmove on themselves, never by changing overflow on html or body */
  function guard(n){ if(!n||n.nodeType!==1||n._tg) return; if(!(n.classList.contains('ucut')||n.classList.contains('c3'))) return; n._tg=1; n.addEventListener('touchmove',function(e){ var sc=e.target.closest&&e.target.closest('.c3-ms,.c3-ls,.c3-pn,.c3-box [style*="overflow"]'); if(!sc) e.preventDefault(); },{passive:false}); }
  function watch(){ if(!document.body) return; new MutationObserver(function(ms){ ms.forEach(function(m){ if(m.type==='attributes') later(); else m.addedNodes.forEach(guard); if(m.type==='childList'&&m.removedNodes.length) later(); }); }).observe(document.body,{childList:true,attributes:true,attributeFilter:['class']}); new MutationObserver(later).observe(document.documentElement,{attributes:true,attributeFilter:['class']}); }
  if(document.body) watch(); else document.addEventListener('DOMContentLoaded',watch); if(window.visualViewport){ window.visualViewport.addEventListener('resize',later); window.visualViewport.addEventListener('scroll',later); } })();
