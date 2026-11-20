/* Cubeworkstudio shop. Routes (hash): home · #maglev · #cubevault · #p-<id> · #cart · #track · #policies · #owner */
(function(){
'use strict';
var $=CW.$, $$=CW.$$, esc=CW.esc, money=CW.money;

/* ================= catalogue ================= */
var COLORS={ white:['White','#ECECE8'], black:['Black','#1E1F23'], blue:['Blue','#1F5FC2'], red:['Red','#D6362F'],
  graphite:['Graphite','#2B2F38'], bone:['Bone','#E4E6EC'], cyan:['Cyan','#2E93C4'] };
var BASE=[
  {id:'maglev',name:'MagLev',edition:'The Float',price:49,stock:3,pre:{on:true,open:'',buy:''},color:'black',colors:['black','white','blue','red'],grams:130,
   photo:'/maglev.webp',video:'/hero_maglev_asm2.mp4',poster:'/poster_maglev_asm2.jpg',viewer:'ml',
   blurb:'Eighteen magnets. The elevator floats and the lid snaps shut.',
   who:'For the cuber who opens their case fifty times a day and wants it to feel engineered every single time.',
   care:'Keep cards and phones clear of the case. Eighteen N35 magnets make a real magnetic field.',
   spec:[['Height with lid','140.0 mm'],['Tube height','133.0 mm'],['Cube bore','57.0 mm square'],['Holds','2 cubes'],['Bore depth','125.0 mm'],['Outer size','73.0 × 73.0 mm'],['Wall','8.0 mm'],['Magnets','18 × (6×5 mm)'],['Magnet layout','5 floor + 5 elevator + 4 rim + 4 lid'],['Magnet pocket','6.20 × 5.2 mm']]},
  {id:'cubevault',name:'CubeVault',edition:'The Kit',price:59,stock:3,pre:{on:true,open:'',buy:''},color:'graphite',colors:['graphite','bone','cyan','red'],grams:175,
   photo:'/cubevault.webp',video:'/hero_cubevault.mp4',poster:'/poster_cubevault.jpg',viewer:'cv',
   blurb:'The full kit. A lift for your cube, and a drawer for everything else.',
   who:'Your main daily driver: cube, lube, spare magnets and a screwdriver bit, all in one case.',
   care:'Empty the drawer before shipping or travel. Lube bottles can sweat in heat and leave residue.',
   spec:[['Height with lid','182.0 mm'],['Tube height','175.0 mm'],['Cube bore','57.0 mm square'],['Holds','2 cubes'],['Bore depth','125.0 mm'],['Outer size','73.0 × 73.0 mm'],['Drawer','56.4 × 64.7 × 39.4 mm'],['Drawer catch','2 + 2 magnets'],['Magnets','22 × (6×5 mm)'],['Magnet layout','5 floor + 5 elevator + 4 rim + 4 lid + 4 drawer'],['Magnet pocket','6.20 × 5.2 mm']]}
];
var RETIRED=['cubedrop','elecube','cubepod','cube460'];
var BASE_CODES={CUBE:.05,SUB7:.07,COMPLETE:.10};
var PAIR_SAVE=10;
var S={products:BASE.map(function(p){ return Object.assign({},p); }),codes:Object.assign({},BASE_CODES),sale:null};

function applySite(site){
  var cfg=site&&site.cfg, list=BASE.map(function(p){ return Object.assign({},p); });
  if(cfg){
    var del=(cfg.deleted||[]).concat(RETIRED);
    (cfg.products||[]).forEach(function(rp){ if(!rp||!rp.id) return;
      var b=list.find(function(x){ return x.id===rp.id; });
      if(b){ if(rp.price!=null&&rp.price!==''&&isFinite(+rp.price)&&+rp.price>=0) b.price=+rp.price; if(rp.stock!==undefined) b.stock=rp.stock===''?null:rp.stock; if(rp.pre) b.pre=rp.pre; if(rp.name) b.name=rp.name;
        if(rp.color&&b.colors.indexOf(rp.color)>=0) b.color=rp.color; }
      else if(del.indexOf(rp.id)<0){ list.push({id:rp.id,name:rp.name||rp.id,edition:rp.edition||'',price:+rp.price||0,stock:rp.stock==null||rp.stock===''?null:rp.stock,color:COLORS[rp.color]?rp.color:'graphite',
        colors:[COLORS[rp.color]?rp.color:'graphite'],blurb:rp.blurb||'',pre:rp.pre||null,spec:[],grams:120}); } });
    list=list.filter(function(p){ return del.indexOf(p.id)<0; });
    var codes=Object.assign({},BASE_CODES);
    if(cfg.codes) Object.keys(cfg.codes).forEach(function(c){ var r=cfg.codes[c]; if(typeof r==='number') codes[c]=r; else if(r&&r.type==='pct') codes[c]=+r.value; });
    S.codes=codes; S.sale=cfg.sale&&cfg.sale.until>Date.now()&&cfg.sale.rate>0?cfg.sale:null;
  }
  S.products=list; if(cfg) pruneCart(); render();
  annBar(site&&site.ann);
}
function P(id){ return S.products.find(function(p){ return p.id===id; }); }
window.CWShopAsk={get:function(){ return {products:S.products,state:state,soldOut:soldOut,pair:PAIR_SAVE,niceDate:niceDate,colors:COLORS}; }};
function today(){ try{ return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kuala_Lumpur'}).format(new Date()); }catch(e){ return new Date().toISOString().slice(0,10); } }
function niceDate(x){ try{ var a=x.split('-').map(Number); return new Date(a[0],a[1]-1,a[2]).toLocaleDateString('en-MY',{day:'numeric',month:'short'}); }catch(e){ return x; } }
/* 'live' sells normally · 'pre' takes preorders · 'soon' is not for sale yet */
function state(p){ var r=p.pre; if(!r||!r.on) return 'live'; var d=today(); if(r.buy&&d>=r.buy) return 'live'; if(r.open&&d>=r.open) return 'pre'; return 'soon'; }
function soldOut(p){ return state(p)==='live'&&p.stock!=null&&+p.stock<=0; }
function badge(p){ var st=state(p);
  if(st==='soon') return '<span class="badge pre">'+(p.pre.open?'Preorders open '+niceDate(p.pre.open):'Coming soon')+'</span>';
  if(st==='pre') return '<span class="badge pre">Preorder'+(p.pre.buy?' · ships from '+niceDate(p.pre.buy):'')+'</span>';
  if(soldOut(p)) return '<span class="badge out">Sold out</span>';
  if(p.stock!=null&&+p.stock>0&&+p.stock<=5) return '<span class="badge">'+p.stock+' ready to ship</span>';
  return ''; }
function colorName(c){ return (COLORS[c]||[c||''])[0]; }
function swatchArt(p){ var c=(COLORS[p.color]||COLORS.graphite)[1];
  return '<svg viewBox="0 0 120 150" width="60%" aria-hidden="true"><rect x="30" y="18" width="60" height="118" rx="8" fill="'+c+'"/><rect x="26" y="12" width="68" height="12" rx="4" fill="'+c+'" opacity=".85"/><rect x="40" y="34" width="8" height="70" rx="3" fill="#000" opacity=".25"/></svg>'; }

/* ================= cart ================= */
var cart=CW.lsJ('cw2_cart',[]); if(!Array.isArray(cart)) cart=[];
var refOk='', code=CW.ls('cw2_code')||'', region=CW.ls('cw2_region')||'W', courier=CW.ls('cw2_cour')||'';
var DEF_COURIERS=[{id:'jt',name:'J&T Express',w:0,e:5},{id:'poslaju',name:'Pos Laju',w:0,e:5},{id:'ninjavan',name:'Ninja Van',w:0,e:5}];
function couriers(){ return (CW.site&&CW.site.couriers)||DEF_COURIERS; }
function curCourier(){ var L=couriers(); return L.find(function(x){ return x.id===courier; })||L[0]; }
function shipOf(c){ return region==='E'?c.e:c.w; }
function saveCart(){ CW.setJ('cw2_cart',cart); CW.ls('cw2_code',code); CW.ls('cw2_region',region); CW.ls('cw2_cour',courier); countUI(); }
function cartLines(){ return cart.map(function(l){ var p=P(l.id); return p?{l:l,p:p,unit:p.price,tot:p.price*l.qty}:null; }).filter(Boolean); }
function add(id,color,qty){ var p=P(id); if(!p) return false; if(p.colors.indexOf(color)<0) color=p.color;
  var st=state(p); if(st==='soon'){ CW.toast(p.name+(p.pre&&p.pre.open?' preorders open '+niceDate(p.pre.open)+'.':' is not on sale yet.')); return false; }
  if(soldOut(p)){ CW.toast(p.name+' is sold out.'); return false; }
  qty=qty||1; var have=cart.filter(function(l){ return l.id===id; }).reduce(function(n,l){ return n+l.qty; },0);
  if(st==='live'&&p.stock!=null&&have+qty>+p.stock){ qty=Math.max(0,+p.stock-have); if(!qty){ CW.toast('Only '+p.stock+' '+p.name+' ready right now.'); return false; } }
  var hit=cart.find(function(l){ return l.id===id&&l.color===color; }); if(hit) hit.qty+=qty; else cart.push({id:id,color:color,qty:qty});
  saveCart(); CW.toast((st==='pre'?'Preordered ':'Added ')+p.name+' ('+colorName(color)+')'); return true; }
function sums(){
  var L=cartLines(), sub=L.reduce(function(s,x){ return s+x.tot; },0);
  var q=function(id){ return L.filter(function(x){ return x.p.id===id; }).reduce(function(n,x){ return n+x.l.qty; },0); };
  var pairs=Math.min(q('maglev'),q('cubevault')), bundle=pairs*PAIR_SAVE;
  var cr=S.codes[code]||0, sr=S.sale?+S.sale.rate:0, rate=Math.max(cr,sr), disc=Math.round((sub-bundle)*rate*100)/100, isRef=false;
  if(code&&!cr&&refOk===code){ var ro=Math.min(5,sub-bundle); if(ro>disc){ disc=ro; isRef=true; } }
  var cc=curCourier(), ship=L.length&&cc?shipOf(cc):0;
  return {L:L,cour:cc,sub:sub,pairs:pairs,bundle:bundle,rate:rate,disc:disc,ship:ship,total:Math.max(0,sub-bundle-disc+ship),fromSale:sr>cr&&!isRef,isRef:isRef};
}
function pruneCart(){ var n=cart.length; cart=cart.filter(function(l){ var p=l&&P(l.id); if(!p||!(+l.qty>0)) return false; if(p.colors.indexOf(l.color)<0) l.color=p.color; l.qty=Math.round(+l.qty); return true; }); if(cart.length!==n) saveCart(); }
function countUI(){ var n=cart.reduce(function(s,l){ return s+l.qty; },0); $$('.cartn').forEach(function(e){ e.textContent=n; e.setAttribute('data-n',n); }); }

/* ================= pages ================= */
var app=null;
function route(){ return (location.hash||'').replace(/^#/,'').split('?')[0]; }
function hashQuery(k){ var q=(location.hash.split('?')[1]||''); var m=q.match(new RegExp('(?:^|&)'+k+'=([^&]*)')); return m?decodeURIComponent(m[1]):''; }
var OLDPLAY={tools:'',timer:'timer',race:'race',learn:'learn',garage:'garage',rewards:'rewards',clubs:'clubs',trade:'mail',chat:'chat',play:''};
function render(){
  if(!app) return; var r=route(), html; if(OLDPLAY[r.split('/')[0]]!=null){ location.replace('/play/'+(OLDPLAY[r.split('/')[0]]?'#'+OLDPLAY[r.split('/')[0]]:'')); return; }
  $$('.nav a').forEach(function(a){ a.setAttribute('aria-current',a.getAttribute('href')==='#'+r||(!r&&a.getAttribute('href')==='#')?'page':'false'); });
  if(r==='cart') html=pgCart(); else if(r.indexOf('order/')===0) html=pgOrder()+'<!--'+r+'-->'; else if(r==='track') html=pgTrack(); else if(r==='policies') html=pgPolicies();
  else if(r==='account'&&window.CWShopAcct) html=window.CWShopAcct.page();
  else if(r==='owner'){ html='<div class="wrap" style="padding:60px 0"><p class="muted">Opening the owner console…</p></div>'; openConsole(); }
  else if(P(r)||(r.indexOf('p-')===0&&P(r.slice(2)))) html=pgProduct(P(r)||P(r.slice(2)));
  else html=pgHome();
  if(app.__h!==html){ app.__h=html; app.innerHTML=html; after(r); }
}
function after(r){ countUI(); CW.ev('shop'); if(r==='cart') CW.ev('cart'); if(!r||r==='') homeAfter(); else if(r==='cart') cartAfter(); else if(r.indexOf('order/')===0){ var pa=r.split('/'); orderAfter(pa[1],pa[2],hashQuery('status_id')); } else if(r==='track') trackAfter(); else if(r==='account'&&window.CWShopAcct) window.CWShopAcct.after(); else if(P(r)||P(r.slice(2))) productAfter(P(r)||P(r.slice(2))); }

/* ---------- home ---------- */
function card(p){
  var art=(p.poster||p.photo)?'<img src="'+(p.poster||p.photo)+'" alt="'+esc(p.name)+' case" loading="lazy">':swatchArt(p);
  return '<a class="pcard" href="#'+(BASE.some(function(b){ return b.id===p.id; })?p.id:'p-'+p.id)+'">'+badge(p)+'<div class="ph">'+art+'</div><div class="bd">'
    +'<div class="row"><h3>'+esc(p.name)+'</h3><span class="price">RM '+money(p.price)+'</span></div>'+(p.edition?'<div class="ed">'+esc(p.edition)+'</div>':'')
    +'<p>'+esc(p.blurb)+'</p><span class="go">'+(state(p)==='soon'?'See details →':state(p)==='pre'?'Preorder →':'Choose colour →')+'</span></div></a>'; }
function bundleCard(){ var m=P('maglev'), v=P('cubevault'); if(!m||!v||state(m)!=='live'||state(v)!=='live'||soldOut(m)||soldOut(v)) return '';
  return '<div class="pcard" style="cursor:default"><div class="ph two" style="padding:0;gap:0"><img src="/poster_maglev_asm2.jpg" alt="MagLev case" style="width:50%;height:100%;object-fit:cover;max-height:none"><img src="/poster_cubevault.jpg" alt="CubeVault case" style="width:50%;height:100%;object-fit:cover;max-height:none"></div><div class="bd">'
   +'<div class="row"><h3>Both cases</h3><span class="price">RM '+money(m.price+v.price-PAIR_SAVE)+'<s>RM '+money(m.price+v.price)+'</s></span></div><div class="ed">MagLev + CubeVault</div>'
   +'<p>Order the pair and save RM '+PAIR_SAVE+'. It comes off automatically in your cart.</p><button class="btn pri" type="button" data-addboth style="margin-top:auto">Add both to cart</button></div></div>'; }
function pgHome(){
  var m=P('maglev'), v=P('cubevault');
  var tiles=[m,v].filter(Boolean).map(function(p){ return '<a class="tile" href="#'+p.id+'"><video muted loop playsinline preload="metadata" poster="'+p.poster+'" data-src="'+p.video+'" aria-label="'+esc(p.name)+' animation"></video>'
     +'<button class="snd" type="button" data-snd aria-label="Sound on for '+esc(p.name)+'">🔇</button><span class="lab">'+esc(p.name)+'<span>RM '+money(p.price)+'</span></span></a>'; }).join('');
  var others=S.products.filter(function(p){ return p.id!=='maglev'&&p.id!=='cubevault'; });
  var rows=[['Price',m&&('RM '+money(m.price)),v&&('RM '+money(v.price))],['Height with lid','140 mm','182 mm'],['Cube bore','57 mm square','57 mm square'],['Fits','55.5–57 mm 3×3','55.5–57 mm 3×3'],['Holds','2 cubes','2 cubes'],['Magnets','18','22'],['Floating elevator','Yes','Yes'],['Drawer','No','56.4 × 64.7 × 39.4 mm'],['Colours','White · Black · Blue · Red','Graphite · Bone · Cyan · Red']];
  return '<section class="hero"><div class="wrap"><div>'
    +'<div class="eyebrow">Magnetic speedcube cases · Selangor</div>'
    +'<h1 style="margin-top:14px">Your cube deserves <em>better</em> than a drawer.</h1>'
    +'<p class="lead">3D-printed cases with a floating, magnetic elevator and a lid that snaps shut. Printed to order in Selangor and built around 57 mm speedcubes.</p>'
    +'<div class="ctas"><a class="btn pri" href="#maglev">Shop MagLev · RM '+(m?money(m.price):'')+'</a><a class="btn" href="#cases">Compare both</a></div>'
    +'<div class="facts"><span>Free West Malaysia shipping</span><span>Printed to order</span><span>Ships in 2–5 days</span><span>6-month warranty</span></div></div>'
    +'<div class="duo">'+tiles+'</div></div></section>'
    +'<section class="sec" id="cases"><div class="wrap"><div class="sec-h"><h2>Pick your case</h2><span class="eyebrow">Same magnets · same snap-shut lid · holds 2 cubes</span></div>'
    +'<div class="cards">'+[m,v].filter(Boolean).map(card).join('')+bundleCard()+'</div>'
    +(others.length?'<div class="cards" style="margin-top:16px">'+others.map(card).join('')+'</div>':'')
    +'<div class="cmp" style="margin-top:22px"><table><thead><tr><th></th><th>MagLev</th><th>CubeVault</th></tr></thead><tbody>'
    +rows.map(function(r){ return '<tr><td>'+r[0]+'</td><td class="v">'+(r[1]||'—')+'</td><td class="v">'+(r[2]||'—')+'</td></tr>'; }).join('')+'</tbody></table></div></div></section>'
    +'<section class="sec" id="film"><div class="wrap"><div class="sec-h"><h2>Watch MagLev</h2><span class="eyebrow">29 seconds · turn the sound on</span></div><div class="adv"><video controls playsinline preload="none" poster="/poster_maglev_ad.jpg" src="/maglev_ad.mp4" aria-label="MagLev video"></video></div></div></section>'
    +'<section class="sec"><div class="wrap"><div class="sec-h"><h2>How it’s made</h2><span class="eyebrow">One maker, no warehouse</span></div><ol class="steps">'
    +'<li><b>Design</b><p>Modelled in Blender and measured around real 55.5–57 mm speedcubes.</p></li>'
    +'<li><b>Print</b><p>Printed to order on a Bambu Lab A1 in Selangor, in the colour you pick.</p></li>'
    +'<li><b>Magnets &amp; check</b><p>Magnets set by hand, and every case test-fitted before it’s boxed.</p></li>'
    +'<li><b>Ship</b><p>Out the door in 2–5 days. Free across West Malaysia, RM 5 to East Malaysia.</p></li></ol></div></section>'
    +'<section class="sec" id="reviews" hidden><div class="wrap"><div class="sec-h"><h2>What cubers say</h2><button class="btn sm" type="button" data-review>Write a review</button></div><div class="revs" id="revs"></div></div></section>'
    +'<section class="sec"><div class="wrap"><div class="sec-h"><h2>Questions</h2></div><div class="faq">'
    +faq('Which cubes fit?','Both cases fit 55.5–57 mm 3×3 speedcubes. The bore is 57.0 mm square.')+faq('How many cubes does a case hold?','Two. MagLev and CubeVault each hold 2 cubes.')
    +faq('How long does shipping take?','Every case is printed to order, so allow 2–5 days before it ships. Shipping is free across West Malaysia and a flat RM 5 to East Malaysia.')
    +faq('How do I pay?','Pay at checkout with online banking (FPX) or Touch ’n Go eWallet. Then follow your order on the Track order page, from payment to delivery.')
    +faq('Can I cancel?','Yes, until your case goes on the printer. Message us on WhatsApp and we’ll cancel and refund in full.')
    +faq('Is there a warranty?','6 months from delivery against printing and assembly faults, like a loose magnet or a lid that won’t hold. We repair or replace it free, postage included.')
    +'</div><p class="muted" style="margin-top:16px">Something else? <a href="https://wa.me/'+CW.WA+'" target="_blank" rel="noopener">Message us on WhatsApp</a>.</p></div></section>';
}
function faq(q,a){ return '<details><summary>'+q+'</summary><p>'+a+'</p></details>'; }
function homeAfter(){
  /* videos: play when visible; if autoplay is blocked (e.g. Low Power Mode) the poster stays and the first tap starts them */
  var vids=$$('.tile video');
  vids.forEach(function(v){ v.src=v.getAttribute('data-src'); });
  var tryPlay=function(){ vids.forEach(function(v){ var p=v.play(); if(p&&p.catch) p.catch(function(){}); }); };
  tryPlay(); ['pointerdown','touchstart','scroll'].forEach(function(n){ addEventListener(n,tryPlay,{once:true,passive:true}); });
  loadReviews();
}
document.addEventListener('click',function(e){
  var s=e.target.closest('[data-snd]'); if(s){ e.preventDefault(); e.stopPropagation(); var v=s.parentNode.querySelector('video'), on=v.muted;
    $$('.tile video').forEach(function(o){ o.muted=true; }); $$('[data-snd]').forEach(function(b){ b.textContent='🔇'; });
    if(on){ v.muted=false; v.currentTime=0; v.play(); s.textContent='🔊'; } return; }
  if(e.target.closest('[data-addboth]')){ var m=P('maglev'), v2=P('cubevault'); if(!m||!v2){ CW.toast('The bundle is not available right now.'); return; } var a1=add('maglev',m.color,1), a2=add('cubevault',v2.color,1); if(a1&&a2) CW.toast('Added both cases. RM '+PAIR_SAVE+' off in your cart.'); return; }
  if(e.target.closest('[data-review]')){ reviewSheet(); return; }
  var ph=e.target.closest('[data-ph]'); if(ph){ CW.sheet('<div class="hd"><h2>Customer photo</h2><button class="x" data-close aria-label="Close">✕</button></div><img src="'+ph.src+'" alt="" style="width:100%;border-radius:14px">'); return; }
});

/* ---------- reviews ---------- */
async function loadReviews(){ var r=await CW.call('/api/review/list',{},6000); var list=(r.ok&&r.data&&r.data.reviews)||[]; var box=$('#revs'), sec=$('#reviews'); if(!box) return;
  sec.hidden=false;
  var withPh=list.filter(function(x){ return x.ph; }), noPh=list.filter(function(x){ return !x.ph; }), show=withPh.slice(0,4).concat(noPh).slice(0,6);
  box.innerHTML=list.length?show.map(function(x){ return '<div class="rev">'+(x.ph?'<img class="revph" data-ph="'+esc(x.ph)+'" src="'+CW.base()+'/api/rphoto?i='+esc(x.ph)+'" alt="Photo from '+esc(x.name)+'" loading="lazy" width="400" height="300">':'')+'<div class="st" aria-label="'+x.stars+' out of 5">'+'★★★★★'.slice(0,x.stars)+'<span style="opacity:.25">'+'★★★★★'.slice(x.stars)+'</span></div><p>'+esc(x.text)+'</p><small>'+esc(x.name)+'</small></div>'; }).join('')
    :'<div class="rev" style="grid-column:1/-1"><p>No reviews yet. Bought a case? Tell other cubers what you think.</p></div>'; }
/* make the photo small enough to send: at most 900 px wide, JPEG, under about 100 KB */
function shrink(file){ return new Promise(function(ok,no){ var u=URL.createObjectURL(file), im=new Image(); im.onerror=function(){ URL.revokeObjectURL(u); no(); };
  im.onload=function(){ URL.revokeObjectURL(u); var w=im.naturalWidth, h=im.naturalHeight, k=Math.min(1,900/Math.max(w,h)), c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w*k)); c.height=Math.max(1,Math.round(h*k));
    c.getContext('2d').drawImage(im,0,0,c.width,c.height); var q=.78, out=c.toDataURL('image/jpeg',q); while(out.length>110000&&q>.3){ q-=.1; out=c.toDataURL('image/jpeg',q); }
    if(out.length>118000||out.indexOf('data:image/jpeg')!==0) no(); else ok(out); }; im.src=u; }); }
function reviewSheet(){ var stars=5;
  var d=CW.sheet('<div class="hd"><h2>Write a review</h2><button class="x" data-close aria-label="Close">✕</button></div>'
    +'<div class="field"><label for="rvN">Your name</label><input class="in" id="rvN" maxlength="20"></div>'
    +'<div class="field"><label>Stars</label><div class="sws" id="rvS">'+[1,2,3,4,5].map(function(n){ return '<button type="button" class="sw" data-s="'+n+'" aria-pressed="'+(n===5)+'" style="padding:7px 13px">'+n+' ★</button>'; }).join('')+'</div></div>'
    +'<div class="field"><label for="rvT">Your review</label><textarea class="in" id="rvT" maxlength="240" placeholder="At least 10 characters"></textarea></div>'
    +'<div class="field"><label for="rvF">Photo of your case (optional)</label><input type="file" id="rvF" accept="image/*" class="in" style="padding:10px"><img id="rvP" alt="" hidden style="margin-top:8px;max-width:100%;max-height:180px;border-radius:12px"></div>'
    +'<div class="msg" id="rvM"></div><button class="btn pri wide" id="rvGo" type="button" style="margin-top:10px">Send review</button>');
  var photo='';
  $('#rvF',d).addEventListener('change',async function(){ var f=this.files&&this.files[0]; photo=''; $('#rvP',d).hidden=true; if(!f) return; var m=$('#rvM',d);
    try{ photo=await shrink(f); $('#rvP',d).src=photo; $('#rvP',d).hidden=false; m.textContent=''; }catch(e){ m.className='msg bad'; m.textContent='That photo could not be used. Try another one.'; this.value=''; } });
  d.addEventListener('click',async function(e){ var b=e.target.closest('[data-s]'); if(b){ stars=+b.getAttribute('data-s'); $$('[data-s]',d).forEach(function(x){ x.setAttribute('aria-pressed',x===b); }); return; }
    if(e.target.id==='rvGo'){ var t=$('#rvT',d).value.trim(); if(t.length<10){ $('#rvM',d).className='msg bad'; $('#rvM',d).textContent='Please write at least 10 characters.'; return; }
      e.target.disabled=true; var r=await CW.call('/api/review/submit',{name:$('#rvN',d).value,stars:stars,text:t,photo:photo},20000); e.target.disabled=false;
      if(r.ok){ d.close(); CW.toast('Thanks! Your review shows once it’s approved.'); } else { $('#rvM',d).className='msg bad'; $('#rvM',d).textContent=(r.data&&r.data.error)||'Could not send. Try again.'; } } }); }

/* ---------- product ---------- */
var pv={view:'video',color:null,qty:1};
function pgProduct(p){
  if(pv.pid!==p.id){ pv={pid:p.id,view:p.video?'video':p.photo?'photo':'art',color:p.color,qty:1}; }
  if(p.colors.indexOf(pv.color)<0) pv.color=p.color;
  var st=state(p), so=soldOut(p);
  var tabs=[p.video&&['video','Video'],p.viewer&&['3d','3D'],p.photo&&['photo','Photo']].filter(Boolean);
  var btn=st==='soon'?(p.pre.open?'Preorders open '+niceDate(p.pre.open):'Coming soon'):so?'Sold out':st==='pre'?'Preorder · RM '+money(p.price*pv.qty):'Add to cart · RM '+money(p.price*pv.qty);
  return '<section class="pp"><div class="wrap"><div class="media"><div class="stage" id="stage"></div>'
    +(tabs.length>1?'<div class="tabs">'+tabs.map(function(t){ return '<button type="button" data-view="'+t[0]+'" aria-pressed="'+(pv.view===t[0])+'">'+t[1]+'</button>'; }).join('')+'</div>':'')
    +'</div><div class="buy"><div class="ed">'+esc(p.edition||'Cubeworkstudio')+'</div><h1>'+esc(p.name)+'</h1><p class="lead">'+esc(p.blurb)+'</p>'
    +'<div class="pr">RM '+money(p.price)+'</div>'
    +(p.colors.length>1?'<div class="opt"><div class="lab">Colour · '+colorName(pv.color)+'</div><div class="sws">'+p.colors.map(function(c){ return '<button type="button" class="sw" data-color="'+c+'" aria-pressed="'+(pv.color===c)+'"><i style="background:'+COLORS[c][1]+'"></i>'+COLORS[c][0]+'</button>'; }).join('')+'</div></div>':'')
    +'<div class="buyrow"><div class="qty"><button type="button" data-q="-1" aria-label="One less">−</button><b>'+pv.qty+'</b><button type="button" data-q="1" aria-label="One more">+</button></div>'
    +'<button class="btn pri" type="button" data-buy '+(st==='soon'||so?'disabled':'')+'>'+btn+'</button></div>'
    +'<p class="note">'+(so?'<b>Sold out for now.</b> <a href="https://wa.me/'+CW.WA+'" target="_blank" rel="noopener">Message us</a> to hear when it’s back.':st==='pre'?'<b>Preorder.</b> '+(p.pre.buy?'Ships from '+niceDate(p.pre.buy)+'.':'We’ll confirm the ship date on WhatsApp.'):st==='soon'?'Not for sale yet.':(p.stock!=null&&+p.stock>0?'<b>'+p.stock+' ready to ship.</b> More are printed to order in 2–5 days.':'<b>Printed to order.</b> Ships in 2–5 days.'))+' Free shipping across West Malaysia.</p>'
    +(st==='soon'?'<button class="btn" type="button" data-nm="'+p.id+'" style="margin-top:12px">'+(nmOn(p.id)?'✓ We’ll tell you · tap to turn off':'🔔 Notify me when it opens')+'</button><p class="note" id="nmM"></p>':'')
    +(p.spec&&p.spec.length?'<dl class="spec">'+p.spec.map(function(s){ return '<div><dt>'+s[0]+'</dt><dd>'+s[1]+'</dd></div>'; }).join('')+'</dl>':'')
    +(p.who||p.care?'<div class="who">'+(p.who?'<div><b>Who it’s for</b>'+esc(p.who)+'</div>':'')+(p.care?'<div><b>Care</b>'+esc(p.care)+'</div>':'')+'</div>':'')
    +'</div></div></section>';
}
function stageFill(p){ var st=$('#stage'); if(!st) return; var hex=COLORS[pv.color][1];
  if(pv.view==='3d'&&p.viewer){ if(!st.querySelector('.ml3d-wrap')) st.innerHTML=''; loadViewer().then(function(){ (p.viewer==='ml'?window.mountML3D:window.mountCV3D)(st,hex); }).catch(function(){ st.innerHTML='<p class="muted" style="padding:20px">The 3D view could not load. Check your connection.</p>'; }); return; }
  if(pv.view==='video'&&p.video){ if(st.querySelector('video')) return; st.innerHTML='<video src="'+p.video+'" poster="'+p.poster+'" muted loop playsinline autoplay aria-label="'+esc(p.name)+' animation"></video>'; var v=st.querySelector('video'), pr=v.play(); if(pr&&pr.catch) pr.catch(function(){ addEventListener('pointerdown',function(){ v.play(); },{once:true}); }); return; }
  if(pv.view==='photo'&&p.photo){ st.innerHTML='<img src="'+p.photo+'" alt="'+esc(p.name)+' case">'; return; }
  st.innerHTML='<div style="height:100%;display:grid;place-items:center">'+swatchArt(Object.assign({},p,{color:pv.color}))+'</div>'; }
var viewerP=null; function loadViewer(){ if(window.mountML3D) return Promise.resolve(); if(viewerP) return viewerP;
  return viewerP=new Promise(function(res,rej){ var s=document.createElement('script'); s.src='/viewer.js?v=2'; s.onload=res; s.onerror=function(){ viewerP=null; rej(); }; document.head.appendChild(s); }); }
function nmOn(id){ return CW.ls('cw_nm_'+id)==='1'; }
function productAfter(p){ stageFill(p); }
document.addEventListener('click',function(e){
  var r=route(), p=P(r)||P(r.slice(2)); if(!p) return;
  var t=e.target.closest('[data-view]'); if(t){ pv.view=t.getAttribute('data-view'); $$('[data-view]').forEach(function(b){ b.setAttribute('aria-pressed',b===t); }); stageFill(p); return; }
  t=e.target.closest('[data-color]'); if(t){ pv.color=t.getAttribute('data-color'); app.__h=''; render(); return; }
  t=e.target.closest('[data-q]'); if(t){ pv.qty=Math.max(1,Math.min(9,pv.qty+ +t.getAttribute('data-q'))); app.__h=''; render(); return; }
  t=e.target.closest('[data-nm]'); if(t){ nmToggle(t,p); return; }
  if(e.target.closest('[data-buy]')){ add(p.id,pv.color,pv.qty); app.__h=''; render(); }
});
async function nmToggle(b,p){ var m=$('#nmM'), on=nmOn(p.id); b.disabled=true; if(m) m.textContent='';
  if(on){ await CW.call('/api/nm',{id:CW.devId(),pid:p.id,on:false},8000); CW.ls('cw_nm_'+p.id,null); }
  else { var er=CW.push.on('player')?{ok:true}:await CW.push.enable('player'); if(!er.ok){ b.disabled=false; if(m) m.textContent=er.msg; return; }
    var r=await CW.call('/api/nm',{id:CW.devId(),pid:p.id,on:true},8000); if(!r.ok){ b.disabled=false; if(m) m.textContent=(r.data&&r.data.error)||'Couldn’t sign you up. Try again.'; return; } CW.ls('cw_nm_'+p.id,'1'); }
  app.__h=''; render(); }

/* ---------- cart ---------- */
function pgCart(){
  var s=sums();
  if(!s.L.length) return '<section class="cartpg"><div class="wrap" style="display:block"><div class="panel empty"><b>Your cart is empty</b>Pick a case to get started.<div style="margin-top:18px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><a class="btn pri" href="#maglev">MagLev</a><a class="btn" href="#cubevault">CubeVault</a></div></div></div></section>';
  return '<section class="cartpg"><div class="wrap"><div class="panel"><h2 style="font-size:28px;margin-bottom:6px">Your cart</h2>'
    +s.L.map(function(x,i){ var st=state(x.p); return '<div class="line"><img src="'+(x.p.photo||'/logo.png')+'" alt=""><div class="nm"><b>'+esc(x.p.name)+'</b><small>'+colorName(x.l.color)+(st==='pre'?' · Preorder'+(x.p.pre.buy?', ships from '+niceDate(x.p.pre.buy):''):'')+'</small></div>'
      +'<div class="end"><b class="mono">RM '+money(x.tot)+'</b><div class="qty" style="height:36px"><button type="button" data-cq="'+i+'" data-d="-1" aria-label="One less">−</button><b>'+x.l.qty+'</b><button type="button" data-cq="'+i+'" data-d="1" aria-label="One more">+</button></div></div></div>'; }).join('')
    +'</div><div class="panel"><div class="sum">'
    +'<div><span>Subtotal</span><b>RM '+money(s.sub)+'</b></div>'
    +(s.bundle?'<div class="good"><span>Bundle · MagLev + CubeVault'+(s.pairs>1?' × '+s.pairs:'')+'</span><b>− RM '+money(s.bundle)+'</b></div>':'')
    +(s.disc?'<div class="good"><span>'+(s.isRef?'Friend code '+esc(code)+' · RM 5 off':(s.fromSale?'Sale':'Code '+esc(code))+' · '+Math.round(s.rate*100)+'% off')+'</span><b>− RM '+money(s.disc)+'</b></div>':'')
    +'<div><span>Shipping · '+esc(s.cour?s.cour.name:'')+'</span><b>'+(s.ship?'RM '+money(s.ship):'Free')+'</b></div>'
    +'<div class="tot"><span>Total</span><b>RM '+money(s.total)+'</b></div></div>'
    +'<div class="field"><label for="reg">Ship to</label><select class="in" id="reg"><option value="W"'+(region==='W'?' selected':'')+'>West Malaysia</option><option value="E"'+(region==='E'?' selected':'')+'>East Malaysia (Sabah · Sarawak · Labuan)</option></select></div>'
    +'<div class="field"><label for="cour">Courier</label><select class="in" id="cour">'+couriers().map(function(c){ var p=shipOf(c); return '<option value="'+esc(c.id)+'"'+(curCourier()&&curCourier().id===c.id?' selected':'')+'>'+esc(c.name)+' · '+(p?'RM '+money(p):'Free')+'</option>'; }).join('')+'</select></div>'
    +'<div class="field"><label for="cd">Promo code</label><div class="codebox"><input class="in" id="cd" value="'+esc(code)+'" maxlength="20" autocomplete="off"><button class="btn sm" type="button" id="cdGo">Apply</button></div><div class="msg" id="cdM"></div></div>'
    +'<button class="btn pri wide" type="button" id="ck" style="margin-top:16px">Checkout · RM '+money(s.total)+'</button>'
    +'<p class="note" style="text-align:center">Pay with online banking or Touch ’n Go eWallet. You can follow your order on the Track order page.</p></div></div></section>';
}
function cartAfter(){
  var reg=$('#reg'); if(reg) reg.onchange=function(){ region=reg.value; saveCart(); app.__h=''; render(); };
  var co=$('#cour'); if(co) co.onchange=function(){ courier=co.value; saveCart(); app.__h=''; render(); };
  var go=$('#cdGo'); if(go) go.onclick=function(){ var v=$('#cd').value.trim().toUpperCase(), m=$('#cdM');
    if(!v){ code=''; saveCart(); app.__h=''; render(); return; }
    if(S.codes[v]){ code=v; saveCart(); app.__h=''; render(); setTimeout(function(){ var mm=$('#cdM'); if(mm){ mm.className='msg ok'; mm.textContent=v+' applied: '+Math.round(S.codes[v]*100)+'% off.'; } },0); }
    else { go.disabled=true; CW.call('/api/ref/check',{code:v},8000).then(function(r){ go.disabled=false; if(r.ok&&r.data&&r.data.ok){ refOk=v; code=v; saveCart(); app.__h=''; render(); setTimeout(function(){ var mm=$('#cdM'); if(mm){ mm.className='msg ok'; mm.textContent='Friend code applied: RM 5 off.'; } },0); } else { m.className='msg bad'; m.textContent='That code isn’t valid.'; } }); } };
  if(code&&!S.codes[code]&&refOk!==code){ CW.call('/api/ref/check',{code:code},8000).then(function(r){ if(r.ok&&r.data&&r.data.ok){ refOk=code; app.__h=''; render(); } else { code=''; saveCart(); } }); }
  var ck=$('#ck'); if(ck) ck.onclick=checkout;
}
document.addEventListener('click',function(e){ var b=e.target.closest('[data-cq]'); if(!b) return; var i=+b.getAttribute('data-cq'), d=+b.getAttribute('data-d'), L=cartLines(), x=L[i]; if(!x) return;
  var l=x.l; if(d>0){ var p=x.p, have=cart.filter(function(c){ return c.id===p.id; }).reduce(function(n,c){ return n+c.qty; },0); if(state(p)==='live'&&p.stock!=null&&have>=+p.stock){ CW.toast('Only '+p.stock+' ready right now.'); return; } }
  l.qty+=d; if(l.qty<=0) cart.splice(cart.indexOf(l),1); saveCart(); app.__h=''; render(); });

/* ---------- checkout: the server prices the order, then the customer pays online ---------- */
var STATES=['Johor','Kedah','Kelantan','Kuala Lumpur','Labuan','Melaka','Negeri Sembilan','Pahang','Penang','Perak','Perlis','Putrajaya','Sabah','Sarawak','Selangor','Terengganu'];
var EAST=['Sabah','Sarawak','Labuan'];
function myOrders(){ var a=CW.lsJ('cw2_orders',[]); return Array.isArray(a)?a:[]; }
function rememberOrder(o){ var a=myOrders().filter(function(x){ return x.code!==o.code; }); a.unshift({code:o.code,token:o.token,at:Date.now(),total:o.total}); CW.setJ('cw2_orders',a.slice(0,20)); }
function checkout(){
  var c=CW.lsJ('cw2_contact',{})||{}, a=c.addr||{}, via=['card','tng'].indexOf(CW.ls('cw2_via'))>=0?CW.ls('cw2_via'):'fpx';
  var d=CW.sheet('<div class="hd"><h2>Checkout</h2><button class="x" data-close aria-label="Close">✕</button></div><div id="ckB"></div>');
  function fld(id,label,val,attrs){ return '<div class="field"><label for="'+id+'">'+label+'</label><input class="in" id="'+id+'" value="'+esc(val||'')+'" '+(attrs||'')+'></div>'; }
  function step1(){ $('#ckB',d).innerHTML=fld('ckN','Full name',c.name,'autocomplete="name"')+fld('ckP','Mobile number',c.phone,'inputmode="tel" autocomplete="tel" placeholder="012-345 6789"')
      +fld('ckE','Email (for your receipt)',c.email,'type="email" autocomplete="email"')
      +fld('ckA1','Address',a.l1,'autocomplete="address-line1"')+fld('ckA2','Address line 2 (optional)',a.l2,'autocomplete="address-line2"')
      +'<div style="display:grid;grid-template-columns:1fr 1.4fr;gap:10px">'+fld('ckPC','Postcode',a.pc,'inputmode="numeric" maxlength="5" autocomplete="postal-code"')+fld('ckC','City',a.city,'autocomplete="address-level2"')+'</div>'
      +'<div class="field"><label for="ckS">State</label><select class="in" id="ckS"><option value="">Choose…</option>'+STATES.map(function(x){ return '<option'+(a.state===x?' selected':'')+'>'+x+'</option>'; }).join('')+'</select></div>'
      +'<div class="msg" id="ckM"></div><button class="btn pri wide" type="button" id="ck1" style="margin-top:8px">Review order</button>';
    $('#ck1',d).onclick=function(){ var v=function(id){ return $('#'+id,d).value.trim(); };
      c={name:v('ckN'),phone:v('ckP'),email:v('ckE'),addr:{l1:v('ckA1'),l2:v('ckA2'),pc:v('ckPC'),city:v('ckC'),state:v('ckS')}};
      var bad=[]; if(c.name.length<2) bad.push(['ckN','Enter your name.']);
      if(!/^(60)?0?1\d{8,9}$/.test(c.phone.replace(/\D/g,''))) bad.push(['ckP','Enter a Malaysian mobile number, like 012-345 6789.']);
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) bad.push(['ckE','Enter a valid email.']);
      if(!c.addr.l1) bad.push(['ckA1','Enter your address.']); if(!/^\d{5}$/.test(c.addr.pc)) bad.push(['ckPC','Postcodes have 5 digits.']);
      if(!c.addr.city) bad.push(['ckC','Enter your city.']); if(!c.addr.state) bad.push(['ckS','Choose your state.']);
      $$('.in',d).forEach(function(i){ i.classList.remove('bad'); }); bad.forEach(function(x){ $('#'+x[0],d).classList.add('bad'); });
      if(bad.length){ $('#ckM',d).className='msg bad'; $('#ckM',d).textContent=bad[0][1]; $('#'+bad[0][0],d).focus(); return; }
      CW.setJ('cw2_contact',c); region=EAST.indexOf(c.addr.state)>=0?'E':'W'; saveCart(); step2(); }; }
  function payLabel(s){ return CW.site.pay!=='toyyib'||via==='tng'?'Place order · RM '+money(s.total):'Pay RM '+money(s.total)+(CW.site.cards&&via==='card'?' by card':' with online banking'); }
  function payNote(){ return CW.site.pay==='toyyib'&&via!=='tng'?'Your bank’s page or app opens with the amount filled in. Approve it there, then you come back here.':'You’ll pay with Touch ’n Go eWallet on the next screen.'; }
  function step2(){ var s=sums();
    $('#ckB',d).innerHTML='<div class="panel" style="padding:14px 16px"><div class="sum">'+s.L.map(function(x){ return '<div><span>'+x.l.qty+'× '+esc(x.p.name)+' · '+colorName(x.l.color)+(state(x.p)==='pre'?' · Preorder':'')+'</span><b>RM '+money(x.tot)+'</b></div>'; }).join('')
      +(s.bundle?'<div class="good"><span>Bundle</span><b>− RM '+money(s.bundle)+'</b></div>':'')+(s.disc?'<div class="good"><span>'+(s.isRef?'Friend code '+esc(code):(s.fromSale?'Sale':'Code '+esc(code)))+'</span><b>− RM '+money(s.disc)+'</b></div>':'')
      +'<div><span>Shipping · '+esc(s.cour.name)+' · '+(region==='E'?'East':'West')+' Malaysia</span><b>'+(s.ship?'RM '+money(s.ship):'Free')+'</b></div><div class="tot"><span>Total</span><b>RM '+money(s.total)+'</b></div></div></div>'
      +'<div class="field"><label>Courier</label><div class="sws" id="ckCour">'+couriers().map(function(c){ var p=shipOf(c); return '<button type="button" class="sw" data-cour="'+esc(c.id)+'" aria-pressed="'+(s.cour.id===c.id)+'" style="padding:9px 16px">🚚 '+esc(c.name)+' · '+(p?'RM '+money(p):'Free')+'</button>'; }).join('')+'</div></div>'
      +'<div class="panel" style="padding:14px 16px;margin-top:10px;font-size:14.5px"><b>'+esc(c.name)+'</b> · '+esc(c.phone)+'<br><span class="muted">'+esc([c.addr.l1,c.addr.l2,c.addr.pc+' '+c.addr.city,c.addr.state].filter(Boolean).join(', '))+'</span> <button class="link" type="button" id="ckEd">Edit</button></div>'
      +(CW.site.pay==='toyyib'?'<div class="field"><label>Pay with</label><div class="sws" id="ckVia"><button type="button" class="sw" data-via="fpx" aria-pressed="'+(via==='fpx')+'" style="padding:9px 16px">🏦 Online banking · Maybank &amp; others</button>'+(CW.site.cards?'<button type="button" class="sw" data-via="card" aria-pressed="'+(via==='card')+'" style="padding:9px 16px">💳 Debit / credit card</button>':'')+'<button type="button" class="sw" data-via="tng" aria-pressed="'+(via==='tng')+'" style="padding:9px 16px">📱 Touch ’n Go eWallet</button></div></div>':'')
      +'<div class="msg" id="ckM"></div><button class="btn pri wide" type="button" id="ckPay" style="margin-top:12px">'+payLabel(s)+'</button>'
      +'<p class="note" style="text-align:center" id="ckNote">'+payNote()+'</p>';
    var vb=$('#ckVia',d); if(vb) vb.onclick=function(e){ var b=e.target.closest('[data-via]'); if(!b) return; via=b.getAttribute('data-via'); CW.ls('cw2_via',via); $$('[data-via]',d).forEach(function(x){ x.setAttribute('aria-pressed',x===b); }); $('#ckPay',d).textContent=payLabel(sums()); $('#ckNote',d).textContent=payNote(); };
    $('#ckEd',d).onclick=step1;
    var cb=$('#ckCour',d); if(cb) cb.onclick=function(e){ var b=e.target.closest('[data-cour]'); if(!b) return; courier=b.getAttribute('data-cour'); saveCart(); step2(); };
    $('#ckPay',d).onclick=async function(){ var btn=this; btn.disabled=true; btn.textContent='Placing your order…';
      CW.ev('check'); var r=await CW.call('/api/order/create',{items:cartLines().map(function(x){ return {id:x.l.id,color:x.l.color,qty:x.l.qty}; }),code:code,name:c.name,phone:c.phone,email:c.email,addr:c.addr,via:via,courier:curCourier().id,tok:window.CWShopAcct?window.CWShopAcct.token():''},20000);
      if(!r.ok){ btn.disabled=false; btn.textContent='Try again'; $('#ckM',d).className='msg bad'; $('#ckM',d).textContent=(r.data&&r.data.error)||'Could not reach the shop server. Check your connection and try again.'; return; }
      var o=r.data; rememberOrder(o); cart=[]; code=''; saveCart();
      if(o.payUrl){ btn.textContent=via==='card'&&CW.site.cards?'Opening card payment…':'Opening online banking…'; location.href=o.payUrl; return; }
      d.close(); location.hash='order/'+o.code+'/'+o.token; }; }
  step1();
}

/* ---------- one order: live status for the customer ---------- */
var ordT=0;
function pgOrder(){ return '<section class="cartpg"><div class="wrap" style="display:block;max-width:720px"><div class="panel" id="ordP"><p class="muted">Loading your order…</p></div></div></section>'; }
async function orderAfter(code,token,status){
  clearTimeout(ordT); var box=$('#ordP'); if(!box) return;
  var r=await CW.call('/api/order/view',{code:code,token:token,check:true},12000);
  if(!$('#ordP')) return;
  if(!r.ok){ box.innerHTML=r.status===404?'<h2 style="font-size:26px">Order not found</h2><p class="muted" style="margin-top:8px">Check the link in your email, or find it on <a href="#track">Track order</a>.</p>':'<p class="msg bad">Could not load your order. Check your connection.</p><button class="btn sm" type="button" onclick="location.reload()">Retry</button>'; return; }
  var o=r.data.order; rememberOrder({code:o.code,token:token,total:o.total});
  var at=o.steps.indexOf(o.status), paid=o.pay.paid;
  var h='<div class="eyebrow">Order '+esc(o.code)+'</div><h2 style="font-size:30px;margin-top:6px">'+(o.cancelled?'Cancelled':!paid?(o.pay.method==='toyyib'?(status==='3'?'Payment didn’t go through':'Waiting for payment'):'Pay with Touch ’n Go'):o.status==='Delivered'?'Delivered':'Thank you, '+esc(o.name.split(' ')[0])+'!')+'</h2>';
  if(!paid&&!o.cancelled){
    if(o.pay.method==='toyyib') h+='<p class="muted" style="margin-top:8px">'+(status==='3'?'Your bank didn’t complete the payment. You weren’t charged.':'If you just paid, this updates on its own in a few seconds.')+'</p>';
    else h+='<p class="muted" style="margin-top:8px">Send exactly this amount, then enter the transaction ID from your TNG app.</p><div class="big">RM '+money(o.total)+'</div>'
      +'<div class="copy"><span>+60 18-296 7670 · TNG</span><button class="btn sm" type="button" data-cp="0182967670">Copy number</button></div>'
      +'<div class="copy"><span>RM '+money(o.total)+'</span><button class="btn sm" type="button" data-cp="'+money(o.total)+'">Copy amount</button></div>'
      +(o.pay.ref?'<p class="note">Transaction ID sent: <b class="mono">'+esc(o.pay.ref)+'</b>. We’ll confirm it shortly.</p>':'<div class="field"><label for="tngR">TNG transaction ID</label><div class="codebox"><input class="in" id="tngR" maxlength="40"><button class="btn pri sm" type="button" id="tngGo">Send</button></div></div>');
  } else if(paid&&!o.cancelled){ h+='<p class="muted" style="margin-top:8px">'+(o.status==='Paid'?'Payment received. Your case goes on the printer next and ships in 2–5 days.':'Here’s where your order is now.')+'</p>'; }
  if(!o.cancelled) h+='<div class="sum" style="margin-top:18px">'+o.steps.map(function(s,i){ var lg=(o.log||[]).filter(function(x){ return x.s===s; }).pop(); return '<div'+(i<=at?' class="good"':'')+'><span>'+(i<=at?'✓ ':'○ ')+esc(s)+'</span><b>'+(lg?new Date(lg.at).toLocaleDateString('en-MY',{day:'numeric',month:'short'}):'')+'</b></div>'; }).join('')+'</div>';
  if(o.ref) h+='<div class="panel" style="margin-top:18px"><h2 style="font-size:22px">Give a friend RM 5 off</h2><p class="muted" style="margin-top:6px">Share your code. Your friend gets RM 5 off, and you get RM 5 credit on your next order once their order is paid.'+(o.creditLeft?' You have <b>RM '+money(o.creditLeft)+'</b> credit waiting.':'')+'</p><div class="copy"><span class="mono notranslate" translate="no">'+esc(o.ref)+'</span><button class="btn sm" type="button" data-cp="'+esc(o.ref)+'">Copy code</button></div><a class="btn sm" style="margin-top:8px" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent('Get RM 5 off a Cubeworkstudio speedcube case with my code '+o.ref+' at cubeworkstudio.com')+'">Share on WhatsApp</a></div>';
  if(!o.cancelled&&o.status!=='Delivered') h+='<div class="panel" style="margin-top:18px"><h2 style="font-size:20px">Order alerts</h2><p class="muted" style="margin-top:6px">Get a notification on this device when your order is printing, shipped and delivered.</p><button class="btn sm" type="button" id="oAl" style="margin-top:8px">'+(CW.ls('cw_oal_'+o.code)==='1'?'✓ Alerts on · tap to turn off':'🔔 Turn on order alerts')+'</button><p class="note" id="oAlM"></p></div>';
  if(o.track) h+='<p class="note">'+(o.courier?esc(o.courier)+' tracking':'Tracking number')+': <b class="mono">'+esc(o.track)+'</b></p>';
  if(o.note) h+='<p class="note">'+esc(o.note)+'</p>';
  h+='<div class="sum" style="margin-top:18px;border-top:1px solid var(--line);padding-top:10px">'+o.items.map(function(it){ return '<div><span>'+it.qty+'× '+esc(it.name)+' · '+(COLORS[it.color]?COLORS[it.color][0]:esc(it.color))+(it.pre?' · Preorder':'')+'</span><b>RM '+money(it.unit*it.qty)+'</b></div>'; }).join('')
    +(o.bundle?'<div class="good"><span>Bundle</span><b>− RM '+money(o.bundle)+'</b></div>':'')+(o.disc?'<div class="good"><span>'+(o.promo==='SALE'?'Sale':'Code '+esc(o.promo))+'</span><b>− RM '+money(o.disc)+'</b></div>':'')+(o.credit?'<div class="good"><span>Referral credit</span><b>− RM '+money(o.credit)+'</b></div>':'')
    +'<div><span>Shipping'+(o.courier?' · '+esc(o.courier):'')+'</span><b>'+(o.ship?'RM '+money(o.ship):'Free')+'</b></div><div class="tot"><span>Total</span><b>RM '+money(o.total)+'</b></div></div>'
    +'<p class="note">Ship to: '+esc([o.addr.l1,o.addr.l2,o.addr.pc+' '+o.addr.city,o.addr.state].filter(Boolean).join(', '))+'</p>'
    +'<p class="note">Questions? <a href="https://wa.me/'+CW.WA+'?text='+encodeURIComponent('Hi! About my order '+o.code)+'" target="_blank" rel="noopener">WhatsApp us</a> with your order number. Bookmark this page to check on it any time.</p>';
  box.innerHTML=h;
  box.onclick=function(e){ var cp=e.target.closest('[data-cp]'); if(cp) CW.copy(cp.getAttribute('data-cp'),cp); };
  var oa=$('#oAl'); if(oa) oa.onclick=async function(){ var m=$('#oAlM'), on=CW.ls('cw_oal_'+code)==='1'; oa.disabled=true; if(m) m.textContent='';
    if(on){ await CW.call('/api/order/alert',{code:code,token:token,id:CW.devId(),on:false},8000); CW.ls('cw_oal_'+code,null); }
    else { var er=CW.push.on('player')?{ok:true}:await CW.push.enable('player'); if(!er.ok){ oa.disabled=false; if(m) m.textContent=er.msg; return; }
      var r=await CW.call('/api/order/alert',{code:code,token:token,id:CW.devId(),on:true},8000); if(!r.ok){ oa.disabled=false; if(m) m.textContent=(r.data&&r.data.error)||'Couldn’t turn on alerts. Try again.'; return; } CW.ls('cw_oal_'+code,'1'); }
    oa.disabled=false; oa.textContent=CW.ls('cw_oal_'+code)==='1'?'✓ Alerts on · tap to turn off':'🔔 Turn on order alerts'; };
  var tg=$('#tngGo'); if(tg) tg.onclick=async function(){ var ref=$('#tngR').value.trim(); if(ref.length<4){ CW.toast('Enter the transaction ID from your TNG app.'); return; } tg.disabled=true; var rr=await CW.call('/api/order/tng',{code:code,token:token,ref:ref},8000); tg.disabled=false; if(rr.ok){ CW.toast('Sent. We’ll confirm your payment shortly.'); orderAfter(code,token); } else CW.toast('Could not send. Try again.'); };
  if(!paid&&!o.cancelled) ordT=setTimeout(function(){ if(route().indexOf('order/')===0) orderAfter(code,token,status); },o.pay.method==='toyyib'?4000:20000);
}

/* ---------- track ---------- */
function pgTrack(){ var mine=myOrders();
  return '<section class="cartpg"><div class="wrap" style="display:block;max-width:640px">'
    +(mine.length?'<div class="panel" style="margin-bottom:14px"><h2 style="font-size:24px">Your orders on this device</h2>'+mine.map(function(o){ return '<a class="line" style="grid-template-columns:1fr auto;text-decoration:none" href="#order/'+o.code+'/'+o.token+'"><div class="nm"><b class="mono">'+esc(o.code)+'</b><small>'+new Date(o.at).toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric'})+'</small></div><b class="mono">RM '+money(o.total)+' →</b></a>'; }).join('')+'</div>':'')
    +'<div class="panel"><h2 style="font-size:24px">Find an order</h2><p class="muted" style="margin-top:6px">Enter your order number and the last 4 digits of the phone number you ordered with.</p>'
    +'<div style="display:grid;grid-template-columns:1.4fr 1fr;gap:10px;margin-top:12px"><input class="in" id="trk" placeholder="CW-…" maxlength="12" autocomplete="off" style="text-transform:uppercase" aria-label="Order number"><input class="in" id="trk4" placeholder="Last 4 digits" maxlength="4" inputmode="numeric" aria-label="Last 4 digits of your phone"></div>'
    +'<button class="btn pri wide" type="button" id="trkGo" style="margin-top:10px">Find order</button><div class="msg" id="trkR"></div></div></div></section>'; }
function trackAfter(){ var go=$('#trkGo'); if(!go) return; go.onclick=async function(){ var c=$('#trk').value.trim().toUpperCase(), l4=$('#trk4').value.replace(/\D/g,''), out=$('#trkR');
  if(!c||l4.length!==4){ out.className='msg bad'; out.textContent='Enter the order number and 4 digits.'; return; } out.className='msg'; out.textContent='Checking…';
  var r=await CW.call('/api/order/find',{code:c,last4:l4},8000);
  if(r.ok&&r.data.found){ location.hash='order/'+r.data.code+'/'+r.data.token; return; }
  if(r.ok){ var old=await CW.call('/api/order',{code:c},7000); if(old.ok&&old.data.found){ out.className='msg ok'; out.textContent=c+': '+old.data.status+(old.data.track?' · tracking '+old.data.track:''); return; } }
  out.className='msg bad'; out.textContent=r.status===429?'Too many tries. Wait 10 minutes.':r.ok?'We couldn’t find that order. Check the number and digits.':'Could not check right now. Try again.'; }; }

/* ---------- policies ---------- */
function pgPolicies(){ return '<div class="wrap"><div class="prose"><div class="eyebrow">Plain English, no small print</div><h1>Returns, warranty &amp; privacy</h1>'
  +'<h2>Returns &amp; refunds</h2><h3>Faulty or damaged</h3><p>If your case arrives broken, warped, or a magnet is loose, tell us within 14 days and send a photo. We’ll reprint and reship it free, or refund you in full, your choice. You don’t need to post the faulty one back unless we ask.</p>'
  +'<h3>Wrong item</h3><p>If we send the wrong case or colour, we fix it at our cost.</p>'
  +'<h3>Changed your mind</h3><p>Every case is printed to order in your colour, so we can’t restock returns. If you change your mind before we start printing, message us and we’ll cancel and refund in full. Once printing has started we can’t refund a change of mind, but talk to us.</p>'
  +'<h2>Warranty</h2><p>Every case is covered for 6 months from delivery against printing and assembly faults: layer separation, a magnet coming loose, a lid that won’t hold, a drawer that binds. We repair or replace it free, including postage.</p>'
  +'<p><b>Not covered:</b> drops or crushing; heat (PETG softens above roughly 70 °C, so not on a car dashboard); solvents, harsh cleaners or dishwashers; normal cosmetic wear; cases modified after purchase.</p><p>No registration needed. Your order confirmation is your proof of purchase.</p>'
  +'<h2>Privacy</h2><p>Cubeworkstudio is one person in Selangor, not a data company. When you order we receive your name, mobile number, email and delivery address, because we can’t post you a case without them. Payment goes through your bank’s online banking (via ToyyibPay) or Touch ’n Go eWallet; we never see your card or bank login details.</p>'
  +'<p>Your cart and settings are stored in your own browser. We don’t sell or rent your details, send marketing you didn’t ask for, or run advertising trackers. Message us on WhatsApp to see, correct or delete what we hold about you.</p><p>If you make an account, we also keep your username, your saved delivery details and a cloud copy of your Cuber Tools progress until you delete the account. Signing in with Google only gives us your name, used as your username.</p></div></div>'; }

/* ---------- announcement ---------- */
function annBar(a){ var b=$('#annc'); if(!b) return; var gone=CW.ls('cw2_ann_x');
  if(a&&a.text&&String(a.v)!==gone){ b.hidden=false; b.innerHTML=esc(a.text)+'<button type="button" aria-label="Dismiss">✕</button>'; b.querySelector('button').onclick=function(){ CW.ls('cw2_ann_x',String(a.v)); b.hidden=true; }; }
  else b.hidden=true; }

/* ---------- owner ---------- */
function crown(){ if(CW.ls('cw_owner_dev')!=='1'||document.getElementById('ownCrown')) return; var fab=document.querySelector('.fab'); if(!fab) return; var a=document.createElement('a'); a.id='ownCrown'; a.href='#owner'; a.textContent='👑 Owner'; a.style.background='#f2b600'; a.style.color='#111'; fab.insertBefore(a,fab.firstChild); }
setTimeout(crown,0);
function openConsole(){ var s=document.createElement('script'); s.src='/console.js?v=19'; s.onload=function(){ window.CWConsole&&CWConsole.open({products:function(){ return S.products; },base:BASE,colors:COLORS,state:state}); history.replaceState(null,'',location.pathname); app.__h=''; render(); }; document.head.appendChild(s); }

/* ---------- boot ---------- */
window.CWShop={P:P,state:state,refresh:function(){ CW.loadSite(); }};
function boot(){ app=$('#app'); render(); CW.onSite(applySite); CW.loadSite(); setInterval(function(){ if(!document.hidden) CW.loadSite(); },60000);
  addEventListener('hashchange',function(){ render(); var el=document.getElementById(route()); if(el&&!P(route())) el.scrollIntoView({behavior:'smooth'}); else scrollTo(0,0); });
  $$('[data-theme-toggle]').forEach(function(b){ b.onclick=CW.toggleTheme; });
  var tk=$('#tok'); if(tk) tk.textContent=CW.tokens(); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
