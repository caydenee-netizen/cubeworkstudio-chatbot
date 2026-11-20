/* Cubeworkstudio owner console (shop). Opened with /#owner. Every change is checked by the live server. */
(function(){
'use strict';
var $=CW.$, $$=CW.$$, esc=CW.esc, money=CW.money;
var css='.oc{position:fixed;inset:0;z-index:100;background:var(--paper);overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding-top:env(safe-area-inset-top,0px)}'
 +'.oc-top{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:12px;padding:12px max(16px,env(safe-area-inset-left,0px));border-bottom:1px solid var(--line);background:var(--card)}'
 +'.oc-top h2{font-size:20px;flex:1}.oc-top .dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--good);margin-right:8px}.oc-top .dot.off{background:var(--bad)}'
 +'.oc-body{display:grid;grid-template-columns:200px minmax(0,1fr);align-items:start}'
 +'.oc-nav{border-right:1px solid var(--line);padding:12px;display:flex;flex-direction:column;gap:4px;position:sticky;top:64px;align-self:start}'
 +'.oc-nav button{text-align:left;border:0;background:none;padding:11px 12px;border-radius:10px;font-weight:600;cursor:pointer;color:var(--ink2)}'
 +'.oc-nav button[aria-current="true"]{background:var(--card);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line)}'
 +'.oc-main{min-width:0;padding:22px max(18px,env(safe-area-inset-right,0px)) calc(60px + env(safe-area-inset-bottom,0px)) 22px}'
 +'.oc-main h3{font-size:24px;margin-bottom:6px}.oc-main .sub{color:var(--ink2);margin-bottom:16px;max-width:62ch}'
 +'.oc-row{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin-bottom:10px}'
 +'.oc-row .hd{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}'
 +'.oc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}'
 +'.oc-grid label{display:grid;gap:5px;font:600 11.5px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)}'
 +'.oc-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}'
 +'.pill{font:600 11px var(--mono);letter-spacing:.08em;text-transform:uppercase;padding:5px 9px;border-radius:999px;background:var(--line);color:var(--ink2)}'
 +'.pill.g{background:color-mix(in srgb,var(--good) 18%,transparent);color:var(--good)}.pill.b{background:var(--blue-soft);color:var(--blue)}.pill.w{background:color-mix(in srgb,var(--warn) 18%,transparent);color:var(--warn)}'
 +'@media (max-width:760px){.oc-body{grid-template-columns:1fr}.oc-nav{flex-direction:row;border-right:0;border-bottom:1px solid var(--line);padding:8px;top:58px;z-index:2;background:var(--paper);overflow-x:auto}.oc-nav button{white-space:nowrap}.oc-main{padding-left:max(16px,env(safe-area-inset-left,0px))}}';
var TABS=[['orders','Orders'],['sales','Sales'],['funnel','Funnel'],['products','Products'],['preorders','Preorders'],['codes','Codes & sale'],['ship','Shipping'],['ann','Announcement'],['reviews','Reviews'],['payments','Payments'],['alerts','App & alerts'],['accts','Accounts'],['setup','Setup'],['security','Security']];
var O={tab:'orders',filter:'todo',open:null,pay:null,sandbox:false,cfg:null,secured:null,orders:null,steps:[],reviews:null,khash:null,el:null};
var H; /* host helpers from the shop: products(), base, colors, state() */

function open(host){ H=host; if(!document.getElementById('oc-css')){ var st=document.createElement('style'); st.id='oc-css'; st.textContent=css; document.head.appendChild(st); }
  if(!CW.ownerKeys()) signIn(); else show(); }
function signIn(){
  var d=CW.sheet('<div class="hd"><h2>Owner sign-in</h2><button class="x" data-close aria-label="Close">✕</button></div><p class="muted">Enter your 4-digit owner code. The live server checks it.</p>'
    +'<div class="field"><label for="ocCode">Code</label><input class="in" id="ocCode" inputmode="numeric" maxlength="4" autocomplete="one-time-code" style="font:600 26px var(--mono);letter-spacing:.5em;text-align:center"></div><div class="msg" id="ocMsg"></div>'
    +'<button class="btn pri wide" type="button" id="ocGo" style="margin-top:8px">Sign in</button>');
  var go=async function(){ var c=$('#ocCode',d).value.replace(/\D/g,''); if(c.length!==4){ $('#ocMsg',d).className='msg bad'; $('#ocMsg',d).textContent='Enter all 4 digits.'; return; }
    $('#ocMsg',d).className='msg'; $('#ocMsg',d).textContent='Checking…'; var r=await CW.ownerSignIn(c);
    if(r.ok){ O.secured=r.secured; d.close(); show(); } else { $('#ocMsg',d).className='msg bad'; $('#ocMsg',d).textContent=r.msg; $('#ocCode',d).value=''; } };
  $('#ocGo',d).onclick=go; $('#ocCode',d).addEventListener('input',function(e){ if(e.target.value.replace(/\D/g,'').length===4) go(); });
}
function show(){
  if(O.el) O.el.remove();
  O.cfg=JSON.parse(JSON.stringify((CW.site&&CW.site.cfg)||{})); if(!Array.isArray(O.cfg.products)) O.cfg.products=[]; if(!O.cfg.codes) O.cfg.codes={};
  var el=O.el=document.createElement('div'); el.className='oc';
  el.innerHTML='<div class="oc-top"><span style="font-size:22px">👑</span><h2><span class="dot" id="ocDot"></span>Owner console</h2><a class="btn sm" href="/play/#owner">Live &amp; race</a><button class="btn sm" type="button" data-oc="lock">Sign out</button><button class="x" type="button" data-oc="close" aria-label="Close">✕</button></div>'
    +'<div class="oc-body"><nav class="oc-nav">'+TABS.map(function(t){ return '<button type="button" data-tab="'+t[0]+'">'+t[1]+'</button>'; }).join('')+'</nav><div class="oc-main" id="ocMain"></div></div>';
  document.body.appendChild(el); document.body.style.overflow='hidden';
  try{ var qm=location.hash.match(/[?&]o=(CW-[A-Z0-9]+)/), tm=location.hash.match(/[?&]t=([a-z]+)/); if(qm){ O.tab='orders'; O.filter='all'; O.open=qm[1]; } else if(tm&&TABS.some(function(t){ return t[0]===tm[1]; })) O.tab=tm[1]; }catch(e){}
  el.addEventListener('click',onClick); draw(); ping();
}
async function ping(){ var r=await CW.admin('users'); var dot=$('#ocDot'); if(dot) dot.className='dot'+(r.ok?'':' off'); if(r.ok){ O.secured=!!r.data.secured; O.build=r.data.build||''; if(O.tab==='security') draw(); }
  if(r.status===403){ close(); CW.toast('Your sign-in expired. Enter the code again.'); signIn(); } }
function close(){ if(O.el){ O.el.remove(); O.el=null; } document.body.style.overflow=''; }
function draw(){ $$('.oc-nav button',O.el).forEach(function(b){ b.setAttribute('aria-current',b.getAttribute('data-tab')===O.tab); });
  var m=$('#ocMain',O.el); m.innerHTML=({products:tProducts,preorders:tPre,codes:tCodes,ship:tShip,ann:tAnn,orders:tOrders,sales:tSales,funnel:tFunnel,alerts:tAlerts,accts:tAccts,setup:tSetup,reviews:tReviews,payments:tPayments,security:tSecurity}[O.tab])(); }

/* the published list keeps every product's settings; base cases are listed even before they were ever edited */
function cfgProd(id){ var x=O.cfg.products.find(function(p){ return p.id===id; }); if(!x){ var b=H.products().find(function(p){ return p.id===id; })||{id:id}; x={id:id,name:b.name,price:b.price,stock:b.stock}; O.cfg.products.push(x); } return x; }
async function publish(msg){ if(O.busy){ CW.toast('Still saving, try again in a second.'); return false; } O.busy=true; O.cfg.by='console'; var r; try{ r=await CW.saveSite({cfg:O.cfg}); if(r.ok) await CW.loadSite(); } finally{ O.busy=false; }
  if(r.ok){ CW.toast(msg||'Saved. Everyone sees it within a minute.'); O.cfg=JSON.parse(JSON.stringify(CW.site.cfg||O.cfg)); draw(); }
  else CW.toast(r.status===403?'Sign-in expired. Enter your code again.':'Could not save. Check your connection.'); return r.ok; }
function pill(p){ var st=H.state(p); return st==='soon'?'<span class="pill w">Not for sale</span>':st==='pre'?'<span class="pill b">Taking preorders</span>':(p.stock!=null&&+p.stock<=0?'<span class="pill w">Sold out</span>':'<span class="pill g">On sale</span>'); }

function tProducts(){ var L=H.products();
  return '<h3>Products</h3><p class="sub">Price in RM. Stock is how many are ready to ship: leave it empty for printed to order, or 0 to mark it sold out.</p>'
    +L.map(function(p){ return '<div class="oc-row"><div class="hd"><b>'+esc(p.name)+'</b>'+pill(p)+'</div><div class="oc-grid">'
      +'<label>Name<input class="in" data-f="name" data-id="'+p.id+'" value="'+esc(p.name)+'" maxlength="30"></label>'
      +'<label>Price (RM)<input class="in" data-f="price" data-id="'+p.id+'" type="number" min="0" step="1" value="'+p.price+'"></label>'
      +'<label>Ready to ship<input class="in" data-f="stock" data-id="'+p.id+'" type="number" min="0" step="1" value="'+(p.stock==null?'':p.stock)+'" placeholder="Printed to order"></label></div>'
      +'<div class="oc-acts"><button class="btn sm pri" type="button" data-oc="psave" data-id="'+p.id+'">Save</button>'
      +(p.pre&&p.pre.on?'<button class="btn sm" type="button" data-oc="gopre" data-id="'+p.id+'">Set dates · Preorders tab</button>':'<button class="btn sm" type="button" data-oc="prestart" data-id="'+p.id+'">Stop selling (set dates)</button>')
      +(H.base.some(function(b){ return b.id===p.id; })?'':'<button class="btn sm" type="button" data-oc="pdel" data-id="'+p.id+'">Remove from shop</button>')+'</div></div>'; }).join(''); }
function tPre(){ var L=H.products().filter(function(p){ return p.pre&&p.pre.on; });
  return '<h3>Preorders</h3><p class="sub">A product here is viewable but not for sale until its preorder date. MagLev and CubeVault start this way. From the preorder date people can preorder it, and from the buy date it sells normally. Leave a date empty to keep that step closed.</p>'
    +(L.length?L.map(function(p){ return '<div class="oc-row"><div class="hd"><b>'+esc(p.name)+' · RM '+money(p.price)+'</b>'+pill(p)+'</div><div class="oc-grid">'
      +'<label>Preorder from<input class="in" type="date" data-pf="open" data-id="'+p.id+'" value="'+esc(p.pre.open||'')+'"></label><label>Buy from<input class="in" type="date" data-pf="buy" data-id="'+p.id+'" value="'+esc(p.pre.buy||'')+'"></label></div>'
      +'<div class="oc-acts"><button class="btn sm pri" type="button" data-oc="presave" data-id="'+p.id+'">Save dates</button><button class="btn sm" type="button" data-oc="prerel" data-id="'+p.id+'">Sell normally now</button></div></div>'; }).join(''):'<p class="muted">No preorders yet.</p>')
    +'<div class="oc-row"><div class="hd"><b>Add a preorder</b></div><div class="oc-grid">'
    +'<label>Name<input class="in" id="nN" maxlength="30"></label><label>Price (RM)<input class="in" id="nP" type="number" min="0"></label>'
    +'<label>Colour<select class="in" id="nC">'+['graphite','bone','cyan','red','black','white','blue'].map(function(c){ return '<option value="'+c+'">'+H.colors[c][0]+'</option>'; }).join('')+'</select></label>'
    +'<label>Preorder from<input class="in" id="nO" type="date"></label><label>Buy from<input class="in" id="nB" type="date"></label></div>'
    +'<label style="display:grid;gap:5px;margin-top:10px;font:600 11.5px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)">Short description<textarea class="in" id="nD" maxlength="160"></textarea></label>'
    +'<div class="oc-acts"><button class="btn sm pri" type="button" data-oc="preadd">Add preorder</button></div></div>'; }
var DEFC=[{id:'jt',name:'J&T Express',w:0,e:5,on:true},{id:'poslaju',name:'Pos Laju',w:0,e:5,on:true},{id:'ninjavan',name:'Ninja Van',w:0,e:5,on:true}];
function cours(){ if(!Array.isArray(O.cfg.couriers)) O.cfg.couriers=JSON.parse(JSON.stringify(DEFC)); return O.cfg.couriers; }
function tShip(){ var L=cours();
  return '<h3>Shipping</h3><p class="sub">Customers pick one of these couriers at checkout. Prices in RM; 0 means free. Delivery is Malaysia only.</p>'
    +L.map(function(c,i){ return '<div class="oc-row"><div class="hd"><b>🚚 '+esc(c.name)+'</b>'+(c.on!==false?'<span class="pill g">Shown</span>':'<span class="pill w">Hidden</span>')+'</div><div class="oc-grid">'
      +'<label>Name<input class="in" data-cf="name" data-i="'+i+'" value="'+esc(c.name)+'" maxlength="30"></label>'
      +'<label>West Malaysia (RM)<input class="in" data-cf="w" data-i="'+i+'" type="number" min="0" step="1" value="'+(+c.w||0)+'"></label>'
      +'<label>Sabah · Sarawak · Labuan (RM)<input class="in" data-cf="e" data-i="'+i+'" type="number" min="0" step="1" value="'+(+c.e||0)+'"></label></div>'
      +'<div class="oc-acts"><button class="btn sm pri" type="button" data-oc="csave" data-i="'+i+'">Save</button><button class="btn sm" type="button" data-oc="ctog" data-i="'+i+'">'+(c.on!==false?'Hide':'Show')+'</button><button class="btn sm" type="button" data-oc="crem" data-i="'+i+'">Remove</button></div></div>'; }).join('')
    +'<div class="oc-row"><div class="hd"><b>Add a courier</b></div><div class="oc-grid"><label>Name<input class="in" id="kN" maxlength="30"></label><label>West Malaysia (RM)<input class="in" id="kW" type="number" min="0" value="0"></label><label>Sabah · Sarawak · Labuan (RM)<input class="in" id="kE" type="number" min="0" value="5"></label></div>'
    +'<div class="oc-acts"><button class="btn sm pri" type="button" data-oc="cadd2">Add courier</button></div></div>'; }
function tCodes(){ var c=O.cfg.codes||{}, s=O.cfg.sale, live=s&&s.until>Date.now()&&s.rate>0;
  return '<h3>Codes &amp; sale</h3><p class="sub">Promo codes take a percentage off the order. A sale applies to everyone automatically; a customer gets whichever is bigger, the sale or their code.</p>'
    +'<div class="oc-row"><div class="hd"><b>Sale</b>'+(live?'<span class="pill g">'+Math.round(s.rate*100)+'% off · ends '+new Date(s.until).toLocaleString('en-MY',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})+'</span>':'<span class="pill">Off</span>')+'</div>'
    +'<div class="oc-grid"><label>Percent off<input class="in" id="sR" type="number" min="1" max="90" value="10"></label><label>For how long<select class="in" id="sH"><option value="1">1 hour</option><option value="6">6 hours</option><option value="24" selected>24 hours</option><option value="72">3 days</option><option value="168">7 days</option></select></label></div>'
    +'<div class="oc-acts"><button class="btn sm pri" type="button" data-oc="salego">Start sale</button>'+(live?'<button class="btn sm" type="button" data-oc="saleend">End sale</button>':'')+'</div></div>'
    +'<div class="oc-row"><div class="hd"><b>Promo codes</b></div>'+(Object.keys(c).length?Object.keys(c).map(function(k){ var r=c[k], v=typeof r==='number'?r:(r&&r.type==='pct'?r.value:null); if(v==null) return '';
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--line)"><span class="mono">'+esc(k)+' · '+Math.round(v*100)+'% off</span><button class="link" type="button" data-oc="cdel" data-c="'+esc(k)+'">Remove</button></div>'; }).join(''):'<p class="muted">No codes yet.</p>')
    +'<div class="oc-grid" style="margin-top:12px"><label>Code<input class="in" id="cN" maxlength="16" style="text-transform:uppercase"></label><label>Percent off<input class="in" id="cR" type="number" min="1" max="90"></label></div>'
    +'<div class="oc-acts"><button class="btn sm pri" type="button" data-oc="cadd">Add code</button></div></div>'; }
function tAnn(){ var a=CW.site&&CW.site.ann;
  return '<h3>Announcement</h3><p class="sub">A bar across the top of the shop for everyone. Each visitor can close it once.</p>'
    +'<div class="oc-row">'+(a&&a.text?'<p style="margin-bottom:10px">Showing now: <b>'+esc(a.text)+'</b></p>':'<p class="muted" style="margin-bottom:10px">Nothing showing.</p>')
    +'<textarea class="in" id="aT" maxlength="240" placeholder="e.g. Restock Friday: MagLev back in all colours"></textarea>'
    +'<div class="oc-acts"><button class="btn sm pri" type="button" data-oc="annpost">Post</button>'+(a&&a.text?'<button class="btn sm" type="button" data-oc="annclear">Remove</button>':'')+'</div></div>'
    +'<div class="oc-row" style="margin-top:14px"><h3 style="margin-bottom:6px">Weekly challenge prize</h3><p class="note">Top 3 each week get 300 / 200 / 100 tokens automatically, and you get an alert with the winners. Add a prize line players see here (optional), e.g. “#1 wins a free MagLev”.</p><input class="in" id="wcP" maxlength="120" value="'+esc((CW.site&&CW.site.wc)||'')+'" placeholder="#1 wins a free MagLev"><div class="oc-acts"><button class="btn sm pri" type="button" data-oc="wcsave">Save prize</button></div></div>'; }
function addrTxt(a){ return [a.l1,a.l2,a.pc+' '+a.city,a.state].filter(Boolean).join(', '); }
function tOrders(){ if(!O.orders){ loadOrders(); return '<h3>Orders</h3><p class="muted">Loading…</p>'; }
  var F={todo:function(o){ return !o.cancelled&&o.status!=='Delivered'&&(o.pay.paidAt||o.pay.sentAt); },unpaid:function(o){ return !o.cancelled&&!o.pay.paidAt; },done:function(o){ return o.status==='Delivered'||o.cancelled; },all:function(){ return true; }};
  var list=O.orders.filter(F[O.filter]), cnt=function(k){ return O.orders.filter(F[k]).length; };
  var h='<h3>Orders</h3><p class="sub">Orders are created when a customer checks out. '+(O.pay==='toyyib'?'Online payments confirm by themselves.':'Payments are by TNG: check your TNG app, then tap <b>Payment received</b>.')+' Move each order along and the customer sees it on their order page.</p>'
   +'<div class="oc-acts" style="margin:0 0 14px">'+[['todo','To do'],['unpaid','Not paid'],['done','Done'],['all','All']].map(function(f){ return '<button class="btn sm'+(O.filter===f[0]?' ink':'')+'" type="button" data-oc="ofilter" data-f="'+f[0]+'">'+f[1]+' · '+cnt(f[0])+'</button>'; }).join('')+'<button class="btn sm" type="button" data-oc="oreload">Refresh</button></div>';
  if(!list.length) return h+'<p class="muted">Nothing here.</p>';
  return h+list.map(function(o){ var open=O.open===o.code, paid=!!o.pay.paidAt;
    var r='<div class="oc-row"><div class="hd" style="cursor:pointer" data-oc="otoggle" data-c="'+o.code+'"><b class="mono">'+o.code+'</b><span>'+esc(o.name)+' · RM '+money(o.total)+'</span>'
      +(o.cancelled?'<span class="pill w">Cancelled</span>':!paid?(o.pay.sentAt?'<span class="pill w">Check TNG: '+esc(o.pay.ref)+'</span>':'<span class="pill">Not paid</span>'):'<span class="pill '+(o.status==='Delivered'?'g':'b')+'">'+esc(o.status)+'</span>')+'</div>'
      +'<div class="muted" style="font-size:14px">'+o.items.map(function(i){ return i.qty+'× '+esc(i.name)+' '+esc(i.color)+(i.pre?' (preorder)':''); }).join(' · ')+' · '+(o.courier?'🚚 '+esc(o.courier)+' · ':'')+new Date(o.at).toLocaleString('en-MY',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})+'</div>';
    if(open){ r+='<div style="margin-top:12px;font-size:14.5px;line-height:1.6"><b>Ship to:</b> '+esc(o.name)+', '+esc(addrTxt(o.addr))+'<br><b>Phone:</b> '+esc(o.phone)+' · <b>Email:</b> '+esc(o.email)
        +'<br><b>Payment:</b> '+(o.pay.method==='toyyib'?(o.pay.via==='card'?'Card':'FPX online banking'):'TNG')+(paid?' · paid '+new Date(o.pay.paidAt).toLocaleString('en-MY')+(o.pay.ref?' · ref '+esc(o.pay.ref):''):' · not paid yet')
        +(o.promo?'<br><b>Discount:</b> '+esc(o.promo)+' −RM '+money(o.disc):'')+(o.bundle?' · bundle −RM '+money(o.bundle):'')+'</div>';
      if(!o.cancelled){
        if(!paid) r+='<div class="oc-acts">'+(o.pay.method==='toyyib'?'<button class="btn sm" type="button" data-oc="ocheck" data-c="'+o.code+'">Check payment</button>':'')+'<button class="btn sm pri" type="button" data-oc="opaid" data-c="'+o.code+'">Payment received</button></div>';
        else r+='<div class="oc-acts">'+O.steps.slice(1).map(function(s){ return '<button class="btn sm'+(s===o.status?' ink':'')+'" type="button" data-oc="ostat" data-c="'+o.code+'" data-s="'+s+'">'+s+'</button>'; }).join('')+'</div>'
          +'<div class="oc-grid" style="margin-top:10px"><label>Courier<input class="in" id="oc_'+o.code+'" value="'+esc(o.courier||'')+'" placeholder="e.g. J&amp;T, Pos Laju"></label><label>Tracking no.<input class="in" id="ot_'+o.code+'" value="'+esc(o.track||'')+'"></label></div>'
          +'<div class="oc-acts"><button class="btn sm pri" type="button" data-oc="oship" data-c="'+o.code+'">Save tracking</button></div>';
        r+='<div class="oc-grid" style="margin-top:10px"><label>Note to customer<input class="in" id="on_'+o.code+'" value="'+esc(o.note||'')+'" maxlength="140"></label></div><div class="oc-acts"><button class="btn sm" type="button" data-oc="onote" data-c="'+o.code+'">Save note</button>'
          +'<a class="btn sm" href="https://wa.me/'+(o.phone.replace(/^0/,'60'))+'?text='+encodeURIComponent('Hi '+o.name.split(' ')[0]+'! About your Cubeworkstudio order '+o.code)+'" target="_blank" rel="noopener">WhatsApp customer</a>'
          +'<button class="btn sm" type="button" data-oc="ocancel" data-c="'+o.code+'">Cancel order</button></div>'; }
      else r+='<div class="oc-acts"><button class="link" type="button" data-oc="odel2" data-c="'+o.code+'">Delete permanently</button></div>'; }
    return r+'</div>'; }).join(''); }
async function loadOrders(){ var r=await CW.admin('orders2'); O.orders=r.ok?(r.data.orders||[]):[]; O.steps=r.ok?(r.data.steps||[]):[]; O.pay=r.ok?r.data.pay:O.pay; O.cards=r.ok&&!!r.data.cards; O.sandbox=r.ok&&r.data.sandbox; if(O.tab==='orders'||O.tab==='payments') draw(); }
async function oAct(code,extra){ var r=await CW.admin('order2',Object.assign({code:code},extra)); if(!r.ok){ CW.toast('Could not update. Try again.'); return; }
  var i=O.orders.findIndex(function(o){ return o.code===code; }); if(r.data.order&&i>=0) O.orders[i]=r.data.order; else if(i>=0) O.orders.splice(i,1); draw(); }
function tPayments(){ if(O.pay==null){ loadOrders(); return '<h3>Payments</h3><p class="muted">Loading…</p>'; }
  return '<h3>Payments</h3>'+(O.pay==='toyyib'?'<div class="oc-row"><span class="pill g">Online banking on'+(O.sandbox?' · TEST MODE':'')+'</span><p style="margin-top:10px">Customers pay with FPX online banking through ToyyibPay. Payments confirm by themselves.'+(O.sandbox?' <b>Test mode is on</b>: no real money moves. Remove TOYYIB_SANDBOX in Cloudflare to go live.':'')+'</p></div>'
      :'<div class="oc-row"><span class="pill w">Online banking not set up</span><p style="margin-top:10px">Until you add your ToyyibPay keys, customers pay by TNG and you confirm each payment by hand.</p></div>')
    +'<div class="oc-row"><b>Turn on online banking (ToyyibPay)</b><ol style="padding-left:20px;line-height:1.75;margin-top:8px">'
    +'<li>Open a ToyyibPay account at <b>toyyibpay.com</b> (it needs the account holder’s IC and a bank account in their name), then create a <b>Category</b> for the shop.</li>'
    +'<li>In ToyyibPay, copy your <b>User Secret Key</b> and the <b>Category Code</b>.</li>'
    +'<li>Cloudflare → Workers &amp; Pages → <b>cws-live</b> → Settings → Variables and Secrets → Add two <b>Secrets</b>: <b>TOYYIB_SECRET</b> (the secret key) and <b>TOYYIB_CATEGORY</b> (the category code). Deploy.</li>'
    +'<li>To try it with fake money first, use a sandbox account from <b>dev.toyyibpay.com</b> and add a plain variable <b>TOYYIB_SANDBOX</b> = <b>1</b>. Delete it when you go live.</li></ol>'
    +'<p class="muted">ToyyibPay charges RM 1 per FPX payment on the standard plan. The keys stay on your server; they never appear in the page.</p></div>'+'<div class="oc-row"><b>Card payments</b> '+(O.cards?'<span class="pill g">On</span>':'<span class="pill">Off</span>')+'<ol style="padding-left:20px;line-height:1.75;margin-top:8px">'+'<li>Ask ToyyibPay to switch on card payments for your account. They charge RM 100 to set it up and RM 100 a year from the second year, plus 1.5% per local card payment (3.5% for foreign cards).</li>'+'<li>Once ToyyibPay confirms, in Cloudflare → <b>cws-live</b> → Settings → Variables and Secrets add a plain variable <b>TOYYIB_CARD</b> = <b>1</b>. Deploy.</li>'+'<li>Checkout then lets customers pick <b>Online banking</b> or <b>Debit / credit card</b>.</li></ol></div>'; }
function tReviews(){ if(!O.reviews){ loadReviews(); return '<h3>Reviews</h3><p class="muted">Loading…</p>'; }
  var row=function(x,pend){ return '<div class="oc-row"><div class="hd"><b>'+esc(x.name)+' · '+'★★★★★'.slice(0,x.stars)+'</b>'+(pend?'<span class="pill w">Waiting</span>':'<span class="pill g">On the site</span>')+'</div><p>'+esc(x.text)+'</p>'
    +(x.ph?'<div id="rp-'+x.id+'"><button class="btn sm" type="button" data-oc="rphoto" data-id="'+x.id+'">📷 View photo</button></div>':'')+'<div class="oc-acts">'+(pend?'<button class="btn sm pri" type="button" data-oc="rok" data-id="'+x.id+'">Approve</button>':'')+'<button class="btn sm" type="button" data-oc="rdel" data-id="'+x.id+'">Delete</button></div></div>'; };
  return '<h3>Reviews</h3><p class="sub">New reviews wait here until you approve them.</p>'+(O.reviews.pend.length?O.reviews.pend.map(function(x){ return row(x,true); }).join(''):'<p class="muted">Nothing waiting.</p>')
    +(O.reviews.ok.length?'<h3 style="font-size:18px;margin:20px 0 10px">On the site</h3>'+O.reviews.ok.map(function(x){ return row(x,false); }).join(''):''); }
async function loadReviews(){ var r=await CW.admin('reviews'); O.reviews=r.ok?{pend:r.data.pend||[],ok:r.data.ok||[]}:{pend:[],ok:[]}; if(O.tab==='reviews') draw(); }
function tSecurity(){
  if(O.secured) return '<h3>Security</h3><div class="oc-row"><span class="pill g">Locked ✓</span><p style="margin-top:10px">The server checks your code against a secret that is not in the page.</p></div>';
  if(!O.khash){ var k=CW.ownerKeys(); if(k&&k.key2) CW.sha(k.key2).then(function(v){ O.khash=v; if(O.tab==='security') draw(); }); }
  var kk=CW.ownerKeys(); if(!O.khash&&!(kk&&kk.key2)) return '<h3>Security</h3><div class="oc-row"><span class="pill w">Not locked yet</span><p style="margin-top:10px">Enter your 4-digit owner code once more to get the value.</p><div class="row" style="margin-top:10px;gap:8px;display:flex"><input class="in" id="ocKc" inputmode="numeric" maxlength="4" style="width:120px;font:600 20px var(--mono);letter-spacing:.4em;text-align:center"><button class="btn sm pri" type="button" data-oc="kcode">Get value</button></div></div>';
  return '<h3>Security</h3><div class="oc-row"><span class="pill w">Not locked yet</span> <button class="btn sm" type="button" data-oc="kcheck">Check again</button><p class="muted" style="margin-top:8px;font-size:13.5px">Live server version: <b class="mono">'+esc(O.build||'?')+'</b>'+(O.build&&!/^v1(2[4-9]|[3-9]\d)/.test(O.build)?' — this is the old server file. Paste the new worker.js into GitHub cubeworks-live first.':'')+'</p><p style="margin-top:10px">Do this once so your code can only be checked by the server.</p><ol style="padding-left:20px;line-height:1.7">'
    +'<li>Copy this value:<div class="copy" style="display:flex;gap:8px;align-items:center"><input class="in mono" id="ocKh" readonly value="'+esc(O.khash||'')+'" placeholder="Working it out…" onclick="this.select()" style="flex:1;min-width:0;font-size:13px"><button class="btn sm pri" type="button" data-oc="copyk"'+(O.khash?'':' disabled')+'>Copy</button></div><small class="muted">64 letters and numbers. If Copy does not work, tap the box, select all, and copy.</small></li>'
    +'<li>Cloudflare → Workers &amp; Pages → <b>cws-live</b> → Settings → Variables and Secrets → Add.</li>'
    +'<li>Type <b>Secret</b>, name <b>OWNER_KEY_HASH</b>, paste the value, Deploy.</li><li>Come back and open this tab again. It should say Locked ✓.</li></ol></div>'; }

/* ---------- sales dashboard ---------- */
async function loadSales(){ var r=await CW.admin('sales'); O.sales=r.ok?r.data:{error:true}; if(O.tab==='sales') draw(); }
async function loadFunnel(){ var r=await CW.admin('funnel'); O.fn=r.ok?r.data:{error:true}; if(O.tab==='funnel') draw(); }
function tFunnel(){ if(!O.fn){ loadFunnel(); return '<h3>Funnel</h3><p class="muted">Loading…</p>'; }
  var F=O.fn; if(F.error) return '<h3>Funnel</h3><p class="muted">Couldn’t load. Paste the newest worker (v144 or later) first.</p><button class="btn sm" type="button" data-oc="funre">Try again</button>';
  var s=F.sum, steps=[['Opened Cuber Tools',s.play],['Tapped the shop card',s.card],['Visited the shop',s.shop],['Opened the cart',s.cart],['Placed an order',s.check],['Paid',F.paid]], top=Math.max(s.play,1), mx=Math.max.apply(null,F.days.map(function(d){ return d.play; }).concat([1]));
  return '<h3>Funnel</h3><p class="sub">Last 30 days. Each person counts once per step per day. Nothing about who they are is kept.</p>'
   +'<div class="oc-row">'+steps.map(function(x,i){ var pc=Math.round(x[1]*100/top), pv=i&&steps[i-1][1]?Math.round(x[1]*100/steps[i-1][1]):null;
     return '<div class="oc-li" style="display:block"><div style="display:flex;justify-content:space-between"><span>'+x[0]+'</span><b>'+x[1]+(pv==null?'':' <small class="muted">('+pv+'% of previous)</small>')+'</b></div><div style="height:8px;border-radius:5px;background:var(--line);margin-top:4px"><i style="display:block;height:100%;width:'+Math.min(100,pc)+'%;border-radius:5px;background:#14b8a6"></i></div></div>'; }).join('')+'</div>'
   +'<div class="oc-grid"><div class="oc-row"><b>Which card got the taps</b><div class="oc-li"><span>Cuber Tools home</span><span>'+s.card_home+'</span></div><div class="oc-li"><span>Learn guide</span><span>'+s.card_learn+'</span></div></div>'
   +'<div class="oc-row"><b>Orders, last 30 days</b><div class="oc-li"><span>Placed</span><span>'+F.orders+'</span></div><div class="oc-li"><span>Paid</span><span>'+F.paid+'</span></div></div></div>'
   +'<div class="oc-row"><div class="hd"><b>Cuber Tools visitors per day</b></div><div class="oc-bars">'+F.days.map(function(d){ return '<i title="'+d.d+' · '+d.play+' opened /play · '+d.shop+' shop visits" style="height:'+Math.max(d.play?6:2,Math.round(d.play*100/mx))+'%"'+(d.play?'':' class="z"')+'></i>'; }).join('')+'</div></div>'
   +'<p class="muted" style="font-size:13px">Counting started when this version went live, so earlier days show 0.</p>'; }
function rm(n){ return 'RM '+(Math.round((+n||0)*100)/100).toLocaleString('en-MY'); }
function tSales(){ if(!O.sales){ loadSales(); return '<h3>Sales</h3><p class="muted">Loading…</p>'; }
  var S=O.sales; if(S.error) return '<h3>Sales</h3><p class="muted">Couldn’t load the numbers.</p><button class="btn sm" type="button" data-oc="salesre">Try again</button>';
  var T=S.tot, mx=Math.max.apply(null,S.days.map(function(d){ return d.rev; }).concat([1])), diff=T.wkPrev>0?Math.round((T.wkRev-T.wkPrev)*100/T.wkPrev):null;
  var tile=function(k,v,s){ return '<div class="oc-tile"><small>'+k+'</small><b>'+v+'</b>'+(s?'<em>'+s+'</em>':'')+'</div>'; };
  var list=function(rows,f){ return rows.length?rows.map(f).join(''):'<p class="muted">Nothing yet.</p>'; };
  return '<h3>Sales</h3><p class="sub">Only orders that were paid count as sales. Times are Malaysia time.</p>'
    +'<div class="oc-tiles">'+tile('Total sales',rm(T.rev),T.paid+' paid order'+(T.paid===1?'':'s'))+tile('This week',rm(T.wkRev),T.wkN+' order'+(T.wkN===1?'':'s')+(diff==null?'':' · '+(diff>=0?'▲ ':'▼ ')+Math.abs(diff)+'% vs last week'))+tile('Average order',rm(T.avg),'')+tile('Waiting for payment',T.waiting,rm(T.waitingRev))+'</div>'
    +'<div class="oc-row"><div class="hd"><b>Last 30 days</b></div><div class="oc-bars">'+S.days.map(function(d){ return '<i title="'+d.d+' · '+rm(d.rev)+' · '+d.n+' order'+(d.n===1?'':'s')+'" style="height:'+Math.max(d.rev?6:2,Math.round(d.rev*100/mx))+'%"'+(d.rev?'':' class="z"')+'></i>'; }).join('')+'</div><div class="oc-bl"><span>'+S.days[0].d.slice(5)+'</span><span>'+S.days[S.days.length-1].d.slice(5)+'</span></div></div>'
    +'<div class="oc-grid"><div class="oc-row"><b>Best sellers</b>'+list(S.prod,function(p){ return '<div class="oc-li"><span>'+esc(p.name)+'</span><span>'+p.qty+' sold · '+rm(p.rev)+'</span></div>'; })+'</div>'
    +'<div class="oc-row"><b>Colours</b>'+list(S.col,function(x){ return '<div class="oc-li"><span>'+esc((H.colors[x.c]||[x.c])[0])+'</span><span>'+x.n+'</span></div>'; })+'</div>'
    +'<div class="oc-row"><b>Couriers</b>'+list(S.cour,function(x){ return '<div class="oc-li"><span>'+esc(x.c)+'</span><span>'+x.n+' order'+(x.n===1?'':'s')+'</span></div>'; })+'</div>'
    +'<div class="oc-row"><b>Where they live</b><div class="oc-li"><span>West Malaysia</span><span>'+S.reg.W+'</span></div><div class="oc-li"><span>East Malaysia</span><span>'+S.reg.E+'</span></div>'+(T.cancelled?'<div class="oc-li"><span>Cancelled orders</span><span>'+T.cancelled+'</span></div>':'')+'</div></div>'; }

/* ---------- the app and its alerts ---------- */
async function alState(){ var sub=await CW.push.sub(); O.al={ok:CW.push.ok(),inst:CW.push.installed(),ios:CW.push.ios(),den:CW.push.denied(),on:CW.push.on('owner')&&!!sub,n:0};
  var r=await CW.admin('pushsub',{state:1}); O.al.n=r.ok?(r.data.n||0):0; if(O.tab==='alerts') draw(); }
async function suState(){ var r=await CW.call('/api/coach',{id:CW.devId(),act:'cfg'},6000); O.su=r.ok&&r.data?{ai:!!r.data.ai,le:r.data.err||null}:{err:1}; if(O.tab==='setup') draw(); }
function tSetup(){ if(O.su==null){ suState(); } var st=O.su==null?'<span class="muted">Checking…</span>':O.su.err?'<span class="msg bad">Could not check. Is the live server updated to the newest version?</span>':O.su.ai?'<b style="color:#1f9a52">● AI is on</b> Cubexer writes personal plans.'+(O.su.le?'<div class="msg bad" style="margin-top:8px">Last AI error ('+(O.su.le.ago<1?'just now':O.su.le.ago+' min ago')+'): <code>'+esc(O.su.le.m)+'</code></div>':''):'<b style="color:#c47a00">● AI is off</b> Cubexer gives the free rule-based plan. Follow the steps below to switch the AI on.';
  return '<h3>Setup</h3><p class="sub">One-time steps for optional features. Nothing here is needed for the site to work.</p>'
   +'<div style="border:1px solid var(--line);border-radius:12px;padding:14px"><h4>Cubexer AI plans (free)</h4><p>'+st+'</p>'
   +'<p class="sub">Cubexer is the coach in Cuber Tools, Learn, Coach tab. Without AI it gives a rule-based plan. With Cloudflare Workers AI it writes a personal plan using a free Llama model. Free allowance is about 10,000 neurons a day, and each player gets 2 plans a day.</p>'
   +'<ol style="padding-left:20px;display:grid;gap:6px"><li>Open the Cloudflare dashboard, then <b>Workers &amp; Pages</b>, then the <b>cws-live</b> worker.</li><li>Go to <b>Settings</b>, then <b>Bindings</b>, then <b>Add</b>, then choose <b>Workers AI</b>.</li><li>Set the variable name to exactly <code>AI</code> and save.</li><li>If the worker is deployed from the cubeworks-live GitHub repo with a <code>wrangler.toml</code>, add these two lines to that file instead, then commit:<br><code>[ai]</code><br><code>binding = "AI"</code></li><li>Make sure the newest <code>worker.js</code> (v149 or later) is deployed, then press <b>Check again</b> below.</li></ol>'
   +'<p class="sub" style="margin-top:8px">Optional backup: add a secret named <code>ANTHROPIC_API_KEY</code> (from console.anthropic.com, needs billing). It is only used if Workers AI fails. Never paste the key into chat or the site, only into the Cloudflare secret box.</p>'
   +'<div class="row" style="margin-top:10px"><button type="button" class="btn sm" id="suRe">Check again</button></div></div>'
   +'<div style="border:1px solid var(--line);border-radius:12px;padding:14px" style="margin-top:12px"><h4>Live server version</h4><p class="sub">'+(O.build?'Running <code>'+esc(O.build)+'</code>.':'Not checked yet.')+' The newest is <b>v149</b>.</p></div>'; }
async function acState(){ var r=await CW.admin('acctcfg'); O.ac=r.ok?r.data:{err:1}; if(O.tab==='accts') draw(); }
function tAccts(){ if(O.ac==null){ acState(); return '<h3>Accounts</h3><p class="muted">Loading…</p>'; } var A=O.ac; if(A.err) return '<h3>Accounts</h3><p class="msg bad">Could not load. Is the live server updated to the newest version?</p>';
  return '<h3>Accounts</h3><p class="sub">Players can create an account in Cuber Tools (Rewards). Accounts save their progress to the cloud so any device picks it up. Google sign-in only uses the person’s name as their username.</p>'
   +'<div class="oc-tiles"><div class="oc-tile"><small>Accounts</small><b>'+A.n+'</b></div><div class="oc-tile"><small>With Google</small><b>'+A.ng+'</b></div><div class="oc-tile"><small>With password</small><b>'+A.np+'</b></div></div>'
   +'<div class="oc-row" style="margin-top:14px"><div class="hd"><b>Google sign-in</b>'+((A.gid||A.env)?'<span class="pill g">On</span>':'<span class="pill w">Not set up</span>')+'</div>'
   +(A.env?'<p class="note" style="margin-top:8px">A Client ID is set in Cloudflare (GOOGLE_CLIENT_ID), which takes priority.</p>':'')
   +'<div class="oc-grid" style="margin-top:10px"><label>Google Client ID<input class="in" id="acGid" value="'+esc(A.gid||'')+'" placeholder="123456-abc.apps.googleusercontent.com" autocomplete="off" autocapitalize="none" spellcheck="false"></label></div>'
   +'<div class="oc-acts"><button class="btn sm pri" type="button" data-oc="acsave">Save</button></div>'
   +'<ol class="note" style="margin:12px 0 0;padding-left:20px;line-height:1.7"><li>Go to <b>console.cloud.google.com</b> and make a project (any name).</li><li><b>APIs &amp; Services → OAuth consent screen</b>: choose External, fill the app name and your email, then Publish.</li><li><b>Credentials → Create credentials → OAuth client ID</b> → type <b>Web application</b>.</li><li>Under <b>Authorized JavaScript origins</b> add <b>https://cubeworkstudio.com</b> (and https://www.cubeworkstudio.com if you use it).</li><li>Copy the <b>Client ID</b> (ends in .apps.googleusercontent.com), paste it above, Save. No secret is needed.</li></ol></div>'; }
function tAlerts(){ if(O.al==null){ alState(); return '<h3>App &amp; alerts</h3><p class="muted">Checking…</p>'; }
  var A=O.al, need=!A.ok||(A.ios&&!A.inst);
  return '<h3>App &amp; alerts</h3><p class="sub">Install the site as an app and this device buzzes for every new order. Only you get these, because it needs your owner sign-in.</p>'
    +'<div class="oc-row"><div class="hd"><b>This device</b>'+(A.on?'<span class="pill g">Order alerts on</span>':'<span class="pill w">Order alerts off</span>')+'</div>'
    +(need?'<p class="note" style="margin-top:8px">'+(A.ios&&!A.inst?'You’re in the browser. On iPhone and iPad, alerts only work from the Home Screen app.':'This browser can’t do app notifications.')+' Tap <b>Get the app</b> for the steps.</p>':'')
    +(A.den?'<p class="note" style="margin-top:8px">Notifications are blocked for this app. Allow them in your device settings, then come back.</p>':'')
    +'<div class="oc-acts">'+(A.on?'<button class="btn sm" type="button" data-oc="aloff">Turn off on this device</button><button class="btn sm pri" type="button" data-oc="altest">Send a test alert</button>':'<button class="btn sm pri" type="button" data-oc="alon"'+(need?' disabled':'')+'>Turn on order alerts</button>')+'<button class="btn sm" type="button" data-oc="ahelp">Get the app</button></div>'
    +'<p class="muted" style="font-size:13px;margin-top:8px">Devices signed up for order alerts: '+A.n+'</p></div>'
    +'<div class="oc-row"><b>What buzzes</b><div class="oc-li"><span>🛒 A new order is placed</span></div><div class="oc-li"><span>💸 A customer sends their TNG transaction ID</span></div><div class="oc-li"><span>✅ An online banking payment goes through</span></div></div>'; }

async function onClick(e){
  var t=e.target.closest('[data-tab]'); if(t){ O.tab=t.getAttribute('data-tab'); if(O.tab==='sales') O.sales=null; if(O.tab==='alerts') O.al=null; if(O.tab==='orders'||O.tab==='payments') O.orders=null, O.pay=O.tab==='payments'?null:O.pay; if(O.tab==='reviews') O.reviews=null; if(O.tab==='security') ping(); if(O.tab==='setup') O.su=null; draw(); return; }
  if(e.target.id==='suRe'){ O.su=null; draw(); return; }
  t=e.target.closest('[data-oc]'); if(!t) return; var a=t.getAttribute('data-oc'), id=t.getAttribute('data-id'), v=function(s){ var x=$(s,O.el); return x?x.value.trim():''; };
  if(a==='close'){ close(); return; }
  if(a==='lock'){ CW.ownerSignOut(); close(); CW.toast('Signed out on this device.'); return; }
  if(a==='psave'){ var x=cfgProd(id), nm=$('[data-f="name"][data-id="'+id+'"]',O.el).value.trim(), pr=$('[data-f="price"][data-id="'+id+'"]',O.el).value, sk=$('[data-f="stock"][data-id="'+id+'"]',O.el).value;
    if(nm) x.name=nm; if(pr!=='') x.price=Math.max(0,Math.round(+pr)); x.stock=sk===''?'':Math.max(0,Math.round(+sk)); await publish(); return; }
  if(a==='pdel'){ O.cfg.deleted=(O.cfg.deleted||[]).concat([id]); O.cfg.products=O.cfg.products.filter(function(p){ return p.id!==id; }); await publish('Removed from the shop.'); return; }
  if(a==='presave'){ var o=$('[data-pf="open"][data-id="'+id+'"]',O.el).value, b=$('[data-pf="buy"][data-id="'+id+'"]',O.el).value; if(o&&b&&b<o){ CW.toast('The buy date has to be on or after the preorder date.'); return; }
    cfgProd(id).pre={on:true,open:o,buy:b}; await publish('Dates saved.'); return; }
  if(a==='prestart'){ cfgProd(id).pre={on:true,open:'',buy:''}; await publish('Not for sale now. It stays viewable. Set dates in the Preorders tab.'); return; }
  if(a==='gopre'){ O.tab='preorders'; draw(); return; }
  if(a==='prerel'){ cfgProd(id).pre={on:false,open:'',buy:''}; await publish('Now on sale like a normal product.'); return; }
  if(a==='preadd'){ var n=v('#nN'); if(!n){ CW.toast('Enter a name first.'); return; } var op=v('#nO'), by=v('#nB'); if(op&&by&&by<op){ CW.toast('The buy date has to be on or after the preorder date.'); return; }
    var pid=n.toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,20)||('p'+Date.now()); if(H.products().some(function(p){ return p.id===pid; })){ CW.toast('A product with that name already exists.'); return; }
    O.cfg.deleted=(O.cfg.deleted||[]).filter(function(d){ return d!==pid; });
    O.cfg.products.push({id:pid,name:n,price:Math.max(0,Math.round(+v('#nP')||0)),stock:'',color:v('#nC'),blurb:v('#nD'),pre:{on:true,open:op,buy:by}}); await publish('Preorder added.'); return; }
  if(a==='salego'){ var r=Math.max(1,Math.min(90,+v('#sR')||0)), h=+v('#sH')||24; O.cfg.sale={rate:r/100,until:Date.now()+h*3600000}; await publish('Sale started.'); return; }
  if(a==='saleend'){ O.cfg.sale={rate:0,until:0}; await publish('Sale ended.'); return; }
  if(a==='cadd'){ var cn=v('#cN').toUpperCase().replace(/[^A-Z0-9]/g,''), cr=+v('#cR'); if(!cn||!(cr>0&&cr<=90)){ CW.toast('Enter a code and a percent from 1 to 90.'); return; } O.cfg.codes[cn]={type:'pct',value:cr/100}; await publish(cn+' added.'); return; }
  if(a==='csave'||a==='ctog'||a==='crem'){ var L=cours(), i=+t.getAttribute('data-i'), c=L[i]; if(!c) return;
    if(a==='crem'){ if(L.filter(function(x){ return x.on!==false; }).length<=1&&c.on!==false){ CW.toast('Keep at least one courier shown.'); return; } L.splice(i,1); await publish('Courier removed.'); return; }
    if(a==='ctog'){ if(c.on!==false&&L.filter(function(x){ return x.on!==false; }).length<=1){ CW.toast('Keep at least one courier shown.'); return; } c.on=c.on===false; await publish(c.on?'Courier shown.':'Courier hidden.'); return; }
    var g=function(f){ var el=$('[data-cf="'+f+'"][data-i="'+i+'"]',O.el); return el?el.value:''; };
    c.name=g('name').trim().slice(0,30)||c.name; c.w=Math.max(0,Math.round(+g('w')||0)); c.e=Math.max(0,Math.round(+g('e')||0)); await publish(c.name+' saved.'); return; }
  if(a==='cadd2'){ var kn=v('#kN').trim().slice(0,30); if(!kn){ CW.toast('Enter the courier name.'); return; }
    var kid=kn.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,20)||('c'+Date.now()); if(cours().some(function(x){ return x.id===kid; })) kid+=String(Date.now()).slice(-4);
    cours().push({id:kid,name:kn,w:Math.max(0,Math.round(+v('#kW')||0)),e:Math.max(0,Math.round(+v('#kE')||0)),on:true}); await publish(kn+' added.'); return; }
  if(a==='cdel'){ delete O.cfg.codes[t.getAttribute('data-c')]; await publish('Code removed.'); return; }
  if(a==='wcsave'){ var rw=await CW.admin('wcprize',{text:v('#wcP')}); CW.toast(rw.ok?'Saved.':'Could not save.'); await CW.loadSite(); draw(); return; }
  if(a==='annpost'){ var tx=v('#aT'); if(!tx){ CW.toast('Write the announcement first.'); return; } var r2=await CW.saveSite({ann:{text:tx}}); CW.toast(r2.ok?'Posted.':'Could not post.'); await CW.loadSite(); draw(); return; }
  if(a==='annclear'){ await CW.saveSite({ann:{text:''}}); await CW.loadSite(); CW.toast('Removed.'); draw(); return; }
  if(a==='ofilter'){ O.filter=t.getAttribute('data-f'); draw(); return; }
  if(a==='oreload'){ O.orders=null; draw(); return; }
  if(a==='otoggle'){ var cc=t.getAttribute('data-c'); O.open=O.open===cc?null:cc; draw(); return; }
  var oc=t.getAttribute('data-c');
  if(a==='opaid'){ await oAct(oc,{act:'paid'}); CW.toast('Marked as paid.'); return; }
  if(a==='ocheck'){ await oAct(oc,{act:'check'}); return; }
  if(a==='ostat'){ await oAct(oc,{act:'status',status:t.getAttribute('data-s')}); return; }
  if(a==='oship'){ await oAct(oc,{act:'ship',courier:v('#oc_'+oc),track:v('#ot_'+oc)}); CW.toast('Tracking saved.'); return; }
  if(a==='onote'){ await oAct(oc,{act:'note',note:v('#on_'+oc)}); CW.toast('Note saved.'); return; }
  if(a==='ocancel'){ if(t.getAttribute('data-sure')!=='1'){ t.setAttribute('data-sure','1'); t.textContent='Tap again to cancel'; return; } await oAct(oc,{act:'cancel'}); return; }
  if(a==='odel2'){ await oAct(oc,{act:'del'}); return; }
  if(a==='rphoto'){ t.disabled=true; var pr=await CW.admin('rphoto',{id:id}); var box=$('#rp-'+id,O.el); if(box) box.innerHTML=pr.ok&&pr.data.photo?'<img src="'+pr.data.photo+'" alt="" style="max-width:100%;max-height:260px;border-radius:12px;margin:6px 0">':'<span class="muted">No photo.</span>'; return; }
  if(a==='rok'||a==='rdel'){ await CW.admin('review',{id:id,act:a==='rok'?'ok':'del'}); O.reviews=null; draw(); return; }
  if(a==='kcode'){ var c=v('#ocKc').replace(/\D/g,''); if(c.length!==4){ CW.toast('Enter all 4 digits.'); return; } var r=await CW.ownerSignIn(c); if(!r.ok){ CW.toast(r.msg); return; } O.secured=r.secured; var k2=CW.ownerKeys(); O.khash=await CW.sha(k2.key2); draw(); return; }
  if(a==='funre'){ O.fn=null; draw(); return; }
  if(a==='salesre'){ O.sales=null; draw(); return; }
  if(a==='ahelp'){ CW.push.help(); return; }
  if(a==='alon'){ t.disabled=true; var ar=await CW.push.enable('owner'); CW.toast(ar.ok?'Order alerts are on.':ar.msg); O.al=null; draw(); return; }
  if(a==='aloff'){ await CW.push.disable('owner'); CW.toast('Turned off on this device.'); O.al=null; draw(); return; }
  if(a==='acsave'){ var gv=($('#acGid').value||'').trim(); var rr=await CW.admin('acctcfg',{gid:gv}); if(rr.ok){ O.ac=rr.data; CW.toast(gv?'Google sign-in is on.':'Google sign-in is off.'); draw(); } else CW.toast('Couldn’t save.'); return; }
  if(a==='altest'){ var tr=await CW.admin('pushtest'); CW.toast(tr.ok?'Sent. It should buzz in a moment.':((tr.data&&tr.data.error)||'Couldn’t send.')); return; }
  if(a==='kcheck'){ await ping(); draw(); CW.toast(O.secured?'Locked ✓':'Still not locked.'); return; }
  if(a==='copyk'){ CW.copy(O.khash||'',t); return; }
}
window.CWConsole={open:open};
})();
