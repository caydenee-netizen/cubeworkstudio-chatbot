/* Liquid Glass for Cuber Tools: the switch, the wallpaper, a floating tab bar, pointer-lit highlights,
   and real edge refraction on browsers that can bend the backdrop (Chrome, Edge). Off unless the player turns it on. */
(function(){
var D=document, R=D.documentElement, KEY='cw_glass2';
function on(){ return R.classList.contains('lg'); }
function get(){ try{ return localStorage.getItem(KEY)!=='0'; }catch(e){ return true; } }
function set(v){ try{ localStorage.setItem(KEY,v?'1':'0'); }catch(e){} }

/* --- wallpaper --- */
function wallpaper(){ if(D.getElementById('lgbg')) return; var w=D.createElement('div'); w.id='lgbg'; w.setAttribute('aria-hidden','true'); w.innerHTML='<i></i><i></i><i></i><i></i><i></i><b></b>'; D.body.insertBefore(w,D.body.firstChild); }

/* --- the header switch --- */
var ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.8c3.4 4 6 7.4 6 10.7a6 6 0 0 1-12 0c0-3.3 2.6-6.7 6-10.7z"/><path d="M9.2 14.2a3 3 0 0 0 2.6 2.7" opacity=".7"/></svg>';
function button(){ var t=D.querySelector('.pl-chips [data-theme-toggle]'); if(!t||D.getElementById('lgBtn')) return; var b=D.createElement('button'); b.type='button'; b.id='lgBtn'; b.className='themebtn lgbtn'; b.setAttribute('aria-label','Liquid Glass'); b.title='Liquid Glass'; b.innerHTML=ICON; b.setAttribute('aria-pressed',String(on()));
  b.onclick=function(){ toggle(!on()); }; t.parentNode.insertBefore(b,t); }
function toggle(v){ R.classList.add('lg-anim'); setTimeout(function(){ R.classList.remove('lg-anim'); },600); set(v); apply(v); var b=D.getElementById('lgBtn'); if(b) b.setAttribute('aria-pressed',String(v)); if(window.CW&&CW.toast) CW.toast(v?'💧 Liquid Glass on':'Liquid Glass off'); }
function apply(v){ R.classList.toggle('lg',v); if(v){ wallpaper(); light(); everything(); setTimeout(function(){ Array.prototype.forEach.call(D.querySelectorAll('*'),function(e){ e.__lgn=0; }); sweep(D.body); },200); } }
window.CWGlass={toggle:toggle,on:on};

/* --- floating tab bar --- */
var TABS=[['','🏠','Home'],['timer','⏱️','Timer'],['race','🏁','Race'],['garage','🚗','Garage'],['mail','✉️','Mail'],['chat','💬','Chat']];
var tb=null;
function tabbar(){ if(tb) return; tb=D.createElement('nav'); tb.className='lg-tab'; tb.setAttribute('aria-label','Quick tabs');
  tb.innerHTML='<i class="lg-lens" aria-hidden="true"></i>'+TABS.map(function(t){ return '<a href="#'+t[0]+'" data-t="'+t[0]+'"><span aria-hidden="true">'+t[1]+'</span><small>'+t[2]+'</small></a>'; }).join('');
  D.body.appendChild(tb); sync(); window.addEventListener('hashchange',function(){ setTimeout(sync,30); }); window.addEventListener('resize',sync);
  var lastY=scrollY, tk=0; window.addEventListener('scroll',function(){ if(tk) return; tk=requestAnimationFrame(function(){ tk=0; var y=scrollY; if(y>lastY+6&&y>120) tb.classList.add('mini'); else if(y<lastY-6||y<60) tb.classList.remove('mini'); var hw=D.querySelector('.top .wrap'); if(hw) hw.classList.toggle('lg-small',y>40); lastY=y; setTimeout(sync,460); }); },{passive:true});
  setInterval(badges,2000); }
function sync(){ if(!tb) return; var h=(location.hash||'#').slice(1).split('/')[0], cur=null; Array.prototype.forEach.call(tb.querySelectorAll('a'),function(a){ var m=a.getAttribute('data-t')===h; if(m) cur=a; if(m) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  var lens=tb.querySelector('.lg-lens'); if(!cur){ lens.style.opacity='0'; return; } lens.style.opacity='1'; lens.style.width=cur.offsetWidth+'px'; lens.style.transform='translateX('+cur.offsetLeft+'px)'; }
function badges(){ if(!tb||!on()) return; var put=function(id,n){ var a=tb.querySelector('[data-t="'+id+'"]'); if(!a) return; var b=a.querySelector('b'); if(n>0){ if(!b){ b=D.createElement('b'); a.appendChild(b); } b.textContent=n>9?'9+':n; } else if(b) b.remove(); };
  try{ put('mail',window.PL&&PL.mailUnread?PL.mailUnread():0); }catch(e){} var f=D.querySelector('.fab .chat'), m=f&&/·\s*(\d+)/.exec(f.textContent); put('chat',m?+m[1]:0); }

/* --- light that follows your finger or mouse across the glass --- */
var SEL='.tool,.pnl,.contbtn,.item,.du5-row,.cr5-card,.chipb,.themebtn,.btn,.seg,.crumbs a,.lg-tab,.top .wrap,.sheet .box,.fab a';
var lit=null, lx=0, ly=0, lt=0;
function light(){ if(light.done) return; light.done=1;
  D.addEventListener('pointermove',function(e){ if(!on()||e.pointerType!=='mouse') return; lx=e.clientX; ly=e.clientY; var el=e.target.closest&&e.target.closest(SEL); if(lit&&lit!==el){ lit.style.removeProperty('--mx'); lit.style.removeProperty('--my'); } lit=el; if(lt||!el) return; lt=requestAnimationFrame(function(){ lt=0; if(!lit) return; var r=lit.getBoundingClientRect(); lit.style.setProperty('--mx',(lx-r.left)+'px'); lit.style.setProperty('--my',(ly-r.top)+'px'); }); },{passive:true});
  D.addEventListener('pointerleave',function(){ if(lit){ lit.style.removeProperty('--mx'); lit.style.removeProperty('--my'); lit=null; } }); }

/* --- refraction: a displacement map per surface size, built once and reused ---
   Safari and Firefox cannot apply SVG filters to the backdrop, so they keep the frosted glass without the edge bending. */
var RF={ok:false,svg:null,cache:{},n:0,ro:null};
function canRefract(){ var ua=navigator.userAgent; if(!/Chrome\/|Edg\//.test(ua)||/Firefox\//.test(ua)) return false; if(/iPhone|iPad|iPod/.test(ua)) return false; return !!(window.CSS&&CSS.supports&&(CSS.supports('backdrop-filter','url(#a)')||CSS.supports('-webkit-backdrop-filter','url(#a)'))); }
function mapURL(w,h,r,band){ var c=D.createElement('canvas'); c.width=w; c.height=h; var x=c.getContext('2d'), im=x.createImageData(w,h), d=im.data;
  for(var y=0;y<h;y++) for(var i=0;i<w;i++){ var px=i+.5-w/2, py=y+.5-h/2, qx=Math.abs(px)-(w/2-r), qy=Math.abs(py)-(h/2-r), ox=Math.max(qx,0), oy=Math.max(qy,0), dist=Math.min(Math.max(qx,qy),0)+Math.hypot(ox,oy)-r; /* signed distance, <0 inside */
    var t=Math.max(0,Math.min(1,1+dist/band)), m=t*t*(3-2*t), nx, ny;
    if(qx>0&&qy>0){ var L=Math.hypot(ox,oy)||1; nx=ox/L*Math.sign(px); ny=oy/L*Math.sign(py); } else if(qx>qy){ nx=Math.sign(px); ny=0; } else { nx=0; ny=Math.sign(py); }
    var k=(y*w+i)*4; d[k]=128-nx*m*127; d[k+1]=128-ny*m*127; d[k+2]=128; d[k+3]=255; }
  x.putImageData(im,0,0); return c.toDataURL(); }
function filterFor(w,h,r){ w=Math.max(24,Math.round(w/4)*4); h=Math.max(24,Math.round(h/4)*4); r=Math.min(r,w/2,h/2); var key=w+'x'+h+'x'+Math.round(r); if(RF.cache[key]) return RF.cache[key]; if(RF.n>24) return null;
  var id='lgf'+(++RF.n), band=Math.min(34,Math.min(w,h)*.36), sc=Math.min(70,Math.min(w,h)*.5), NS='http://www.w3.org/2000/svg', f=D.createElementNS(NS,'filter');
  f.setAttribute('id',id); f.setAttribute('x','0'); f.setAttribute('y','0'); f.setAttribute('width',w); f.setAttribute('height',h); f.setAttribute('filterUnits','userSpaceOnUse'); f.setAttribute('color-interpolation-filters','sRGB');
  f.innerHTML='<feImage href="'+mapURL(w,h,r,band)+'" x="0" y="0" width="'+w+'" height="'+h+'" preserveAspectRatio="none" result="map"/>'
   +'<feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="b"/>'
   +'<feDisplacementMap in="b" in2="map" scale="'+sc+'" xChannelSelector="R" yChannelSelector="G" result="dR"/>'
   +'<feDisplacementMap in="b" in2="map" scale="'+(sc*.9)+'" xChannelSelector="R" yChannelSelector="G" result="dG"/>'
   +'<feDisplacementMap in="b" in2="map" scale="'+(sc*.8)+'" xChannelSelector="R" yChannelSelector="G" result="dB"/>'
   +'<feColorMatrix in="dR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>'
   +'<feColorMatrix in="dG" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>'
   +'<feColorMatrix in="dB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bb"/>'
   +'<feBlend in="r" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="bb" mode="screen"/>';
  RF.svg.appendChild(f); RF.cache[key]='url(#'+id+')'; return RF.cache[key]; }
var RSEL='.tool,.top .wrap,.sheet .box,.contbtn,.cr5-card,.pc5';
function fit(el){ if(!on()||!RF.ok) return; var r=el.getBoundingClientRect(); if(r.width<24||r.height<24||r.width>1400||r.height>1400){ el.style.removeProperty('--lg-f'); return; } var cs=getComputedStyle(el), rad=parseFloat(cs.borderTopLeftRadius)||0; if(rad>r.height/2) rad=r.height/2; var f=filterFor(r.width,r.height,rad); if(f) el.style.setProperty('--lg-f',f); }
function scan(){ if(!on()||!RF.ok) return; Array.prototype.forEach.call(D.querySelectorAll(RSEL),function(el){ if(el.__lg) return; el.__lg=1; RF.ro.observe(el); fit(el); }); }
function refraction(){ if(refraction.done) return; refraction.done=1; RF.ok=false; if(!RF.ok) return; R.classList.add('lg-rf');
  var s=D.createElementNS('http://www.w3.org/2000/svg','svg'); s.setAttribute('aria-hidden','true'); s.setAttribute('width','0'); s.setAttribute('height','0'); s.style.cssText='position:absolute;width:0;height:0;overflow:hidden'; s.innerHTML='<defs></defs>'; D.body.appendChild(s); RF.svg=s.firstChild;
  RF.ro=new ResizeObserver(function(es){ es.forEach(function(e){ fit(e.target); }); });
  var mt=0; new MutationObserver(function(){ if(mt) return; mt=setTimeout(function(){ mt=0; scan(); },120); }).observe(D.body,{childList:true,subtree:true}); scan(); }

/* --- everything else: any solid panel, box or field that is not already glass becomes glass --- */
var EXC='.run-stage,.run-stage *,.pad,.pad *,.item *,.sws,.mail-skins,.sk-pick,[data-skin],[data-pad],#lgbg,.ucut,.du5-play,.cr5-ov,.lc5,.lg-tab,svg,canvas,video,img,.cx-b,.cx-f,.sw,.sw2,.gsw,.cube6,.pc5-av,.pc5-bn,.cr5-art,.buypv,.wheel,.wh-seg,input[type=checkbox],input[type=radio],input[type=range],input[type=color],select option,.lg-lens,.ds-lv,.dl-card';
var ALREADY='.tool,.pnl,.contbtn,.item,.du5-row,.cr5-card,.pc5,.chipb,.themebtn,.btn,.seg,.crumbs a,.top .wrap,.sheet .box,.toast,.fab a,.mail-ac,.tag,.in,#chatP,.chatp,.own,.own-top';
var SQ=[], st=0;
function lumOf(c){ var m=c.match(/[\d.]+/g); if(!m) return null; var a=m.length>3?+m[3]:1, r=+m[0], gg=+m[1], b=+m[2]; return {a:a,l:.2126*r+.7152*gg+.0722*b,s:Math.max(r,gg,b)-Math.min(r,gg,b)}; }
function darkScheme(){ var t=R.getAttribute('data-theme'); return t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches); }
function judge(el){ if(el.nodeType!==1||el.classList.contains('lgx')||el.classList.contains('lgd')||el.classList.contains('lgf')||el.__lgn) return; el.__lgn=1; if(el.matches(ALREADY)||el.closest(EXC)) return; var ist=el.getAttribute('style')||''; if(/background/i.test(ist)) return; /* skin swatches and art set their own background inline */
  var cs=getComputedStyle(el); if(cs.display==='none'||cs.visibility==='hidden') return; var bi=cs.backgroundImage; if(bi&&bi!=='none'&&!/^linear-gradient\(rgba?\([^)]*\), rgba?\([^)]*\)\)$/.test(bi)) return;
  var c=lumOf(cs.backgroundColor); if(!c||c.a<.6) return; if(c.s>26) return; var r=el.getBoundingClientRect(); if(r.width<36||r.height<22) return;
  var fl=false; for(var p=el,dd=0;p&&p!==D.body&&dd<4;p=p.parentElement,dd++){ var ps=p===el?cs.position:getComputedStyle(p).position; if(ps==='fixed'||ps==='absolute'||ps==='sticky'){ fl=true; break; } }
  if(c.l<70&&!darkScheme()) el.classList.add('lgd'); else el.classList.add(fl?'lgf':'lgx'); }
function sweep(root){ if(!on()) return; judge(root); if(root.querySelectorAll) Array.prototype.forEach.call(root.querySelectorAll('*'),judge); }
function queue(n){ if(n.nodeType!==1||!n.isConnected) return; sweep(n); }   /* right away, before the browser paints: no flash of the plain look */
function everything(){ if(everything.done) return; everything.done=1; new MutationObserver(function(ms){ if(!on()) return; ms.forEach(function(m){ Array.prototype.forEach.call(m.addedNodes,queue); }); }).observe(D.body,{childList:true,subtree:true});
 }
/* press light: the glass glows from the exact point you touch */
var PSEL='.tool,.pnl,.contbtn,.item,.du5-row,.cr5-card,.chipb,.themebtn,.btn,.seg,.crumbs a,.top .wrap,.sheet .box,.fab a,.lgx,.tag';
D.addEventListener('pointerdown',function(e){ return; var el=e.target.closest&&e.target.closest(PSEL); if(!el) return; var r=el.getBoundingClientRect(); el.style.setProperty('--px',(e.clientX-r.left)+'px'); el.style.setProperty('--py',(e.clientY-r.top)+'px'); el.classList.add('lg-press');
  var up=function(){ el.classList.remove('lg-press'); D.removeEventListener('pointerup',up,true); D.removeEventListener('pointercancel',up,true); }; D.addEventListener('pointerup',up,true); D.addEventListener('pointercancel',up,true); },{passive:true});
function style(){ try{ R.removeAttribute('data-lgs'); }catch(e){} }
window.CWGlass.style=function(s){ try{ localStorage.setItem('cw_glass_style',s||'a'); }catch(e){} style(); };
function init(){ style(); button(); if(R.classList.contains('v9')) return; if(on()||get()) apply(true); }
if(D.readyState==='loading') D.addEventListener('DOMContentLoaded',init); else init();
})();
