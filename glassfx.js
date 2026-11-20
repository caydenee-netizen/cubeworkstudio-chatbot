/* Liquid Glass button motion: a light spot follows your finger, a ripple spreads from where you tap, and the button squishes and wobbles back like a drop of water. */
(function(){
if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches) return;
var SEL='.lgx,.contbtn,.crumbs a,.cr5-card,.du5-row,.btn,.chipb,.themebtn,.h9-go,.h9-b,.h9-ic,.fab a,.fab button,#nav9 .n9-i,#nav9 .n9-m,#nav9 .n9-t,.lseg button,.seg button,.cx-b,.tool,.wheel-hub,.pk-card,.item[role=button],button.tag';
function on(){ var c=document.documentElement.classList; return c.contains('v9')||c.contains('lg'); }
function fx(el){ var f=el.querySelector(':scope>.glfx'); if(f) return f; f=document.createElement('span'); f.className='glfx'; f.setAttribute('aria-hidden','true'); var cs=getComputedStyle(el); if(cs.position==='static') el.style.position='relative'; if(cs.isolation!=='isolate') el.style.isolation='isolate'; el.appendChild(f); return f; }
function pos(el,e){ var r=el.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top,w:r.width,h:r.height}; }
document.addEventListener('pointerdown',function(e){ if(!on()) return; var el=e.target.closest&&e.target.closest(SEL); if(!el||el.disabled) return;
  var f=fx(el), p=pos(el,e), d=Math.hypot(Math.max(p.x,p.w-p.x),Math.max(p.y,p.h-p.y))*2, r=document.createElement('i');
  r.className='glr'; r.style.cssText='left:'+p.x+'px;top:'+p.y+'px;width:'+d+'px;height:'+d+'px;margin:-'+d/2+'px 0 0 -'+d/2+'px'; f.appendChild(r); setTimeout(function(){ r.remove(); },480);
  el.classList.remove('gl-pop'); el.classList.add('gl-down'); f.style.setProperty('--mx',p.x+'px'); f.style.setProperty('--my',p.y+'px'); f.classList.add('lit'); },{passive:true});
function up(){ document.querySelectorAll('.gl-down').forEach(function(el){ el.classList.remove('gl-down'); void el.offsetWidth; el.classList.add('gl-pop'); setTimeout(function(){ el.classList.remove('gl-pop'); },320); var f=el.querySelector(':scope>.glfx'); if(f) setTimeout(function(){ f.classList.remove('lit'); },120); }); }
document.addEventListener('pointerup',up,{passive:true}); document.addEventListener('pointercancel',up,{passive:true});
var last=null;
document.addEventListener('pointermove',function(e){ if(!on()) return; var el=e.target.closest&&e.target.closest(SEL); if(last&&last!==el){ var lf=last.querySelector(':scope>.glfx'); if(lf&&!last.classList.contains('gl-down')) lf.classList.remove('lit'); last=null; } if(!el) return; var f=fx(el), p=pos(el,e); f.style.setProperty('--mx',p.x+'px'); f.style.setProperty('--my',p.y+'px'); if(e.pointerType==='mouse'||el.classList.contains('gl-down')) f.classList.add('lit'); last=el; },{passive:true});
})();
/* Safari colours its top and bottom bars from theme-color: match the page so no grey strip shows */
(function(){ var R=document.documentElement; function set(){ var m=document.querySelector('meta[name="theme-color"]'); if(!m){ m=document.createElement('meta'); m.name='theme-color'; document.head.appendChild(m); }
  var dark=R.getAttribute('data-theme')==='dark'||(R.classList.contains('v9')&&!R.classList.contains('v9l')); var c=dark?'#070a14':'#eef1f7'; if(m.getAttribute('content')!==c) m.setAttribute('content',c); }
  set(); new MutationObserver(set).observe(R,{attributes:true,attributeFilter:['data-theme','class']}); })();
