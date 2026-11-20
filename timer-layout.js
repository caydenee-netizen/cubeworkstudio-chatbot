/* Timer layout: the player picks the order of the timer cards (for example previous solves at the top) and can hide the ones they don't use.
   Saved on this device. With no saved layout the timer looks exactly as before. */
(function(){
if(!window.PL||!PL.views||!PL.views.timer) return;
var esc=function(s){ return String(s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
var KEY='cw_tlay';
/* every card: id, name, how to find it on the page, can it be hidden */
var B=[
 ['pad','Scramble and timer pad',function(w){ return w.querySelector('.tmr-main'); },0],
 ['times','Previous solves',function(w){ var t=w.querySelector('#tTimes'); return t&&t.closest('.pnl'); },1],
 ['stats','Best, Ao5, Ao12',function(w){ return w.querySelector('#tStats'); },1],
 ['avg','Averages and last solves table',function(w){ return w.querySelector('#t2'); },1],
 ['sess','Session and target',function(w){ return w.querySelector('.t3-bar'); },1],
 ['spread','Spread',function(w){ return w.querySelector('#t3Sp'); },1],
 ['note','Tokens and XP info',function(w){ var s=w.querySelector('.tside'); if(!s) s=w.querySelector('#tLay'); if(!s) return null; var ps=[].filter.call(s.children,function(c){ return c.tagName==='P'&&/tokens/i.test(c.textContent); }); return ps[0]||null; },1],
 ['tools4','Goal tracker, metronome, weekly report',function(w){ return w.querySelector('#tTools4'); },1],
 ['trend','Trends',function(w){ return w.querySelector('#tTrend'); },1],
 ['goal','Practice goal',function(w){ return w.querySelector('#tGoal'); },1],
 ['replay','Solve replay and Cubexer review',function(w){ return w.querySelector('#tTools7'); },1],
 ['comp','Compete',function(w){ return w.querySelector('#c7Card'); },1]];
function get(){ try{ var o=JSON.parse(localStorage.getItem(KEY)||'null'); if(o&&Array.isArray(o.order)) return {order:o.order,hide:Array.isArray(o.hide)?o.hide:[]}; }catch(e){} return null; }
function set(o){ try{ if(o) localStorage.setItem(KEY,JSON.stringify(o)); else localStorage.removeItem(KEY); }catch(e){} }
function full(o){ var ids=B.map(function(b){ return b[0]; }), ord=o.order.filter(function(i){ return ids.indexOf(i)>=0; }); ids.forEach(function(i){ if(ord.indexOf(i)<0) ord.push(i); }); return ord; }
var busy=false;
function apply(){ var w=document.querySelector('.wrap.tmr'); if(!w||busy) return; var o=get();
  if(!o) return;
  busy=true; try{
    var lay=w.querySelector('#tLay'); if(!lay){ lay=document.createElement('div'); lay.id='tLay'; lay.className='tlay'; var grid=w.querySelector('.tmr-grid'); if(grid) w.insertBefore(lay,grid); else w.appendChild(lay); w.classList.add('tlay-on'); }
    var prev=null; full(o).forEach(function(id){ var b=B.filter(function(x){ return x[0]===id; })[0], el=b&&b[2](w); if(!el) return; el.setAttribute('data-tl',id);
      var hid=b[3]&&o.hide.indexOf(id)>=0; if(hid) el.setAttribute('data-tlh','1'); else el.removeAttribute('data-tlh');
      var want=prev?prev.nextSibling:lay.firstChild; if(el.parentNode!==lay||el!==want) lay.insertBefore(el,want); prev=el; });
    /* anything new that isn't in the list stays visible, after the known cards */
    var grid2=w.querySelector('.tmr-grid'); if(grid2){ var side=grid2.querySelector('.tside'); [].slice.call((side||grid2).children).forEach(function(c){ if(!c.hasAttribute('data-tl')&&c.className!=='tmr-main') lay.appendChild(c); }); }
  }catch(e){ console.error(e); } busy=false; }
var mo=null, t=0;
function watch(){ var w=document.querySelector('.wrap.tmr'); if(!w) return; if(mo) mo.disconnect(); mo=new MutationObserver(function(){ if(busy) return; clearTimeout(t); t=setTimeout(apply,30); }); mo.observe(w,{childList:true}); var s=w.querySelector('.tside'); if(s) mo.observe(s,{childList:true}); }
function btn(){ var nb=document.getElementById('tFull'); if(!nb||document.getElementById('tLayB')) return; var b=document.createElement('button'); b.type='button'; b.className='btn sm'; b.id='tLayB'; b.textContent='⚙ Layout'; nb.parentNode.insertBefore(b,nb.nextSibling); b.onclick=editor; }
function editor(){ var o=get()||{order:B.map(function(b){ return b[0]; }),hide:[]}, ord=full(o), hide=o.hide.slice();
  var sh=CW.sheet('<div class="hd"><h2>Timer layout</h2><button class="x" data-close aria-label="Close">✕</button></div><p class="muted" style="font-size:13.5px;margin:0 0 10px">Move cards up or down, or switch off the ones you don’t use. Changes show straight away.</p><div id="tlL"></div><div class="row" style="gap:8px;margin-top:12px"><button type="button" class="btn" id="tlR">Reset to normal</button><span class="sp"></span><button type="button" class="btn pri" data-close>Done</button></div>');
  function draw(){ var L=sh.querySelector('#tlL'); L.innerHTML=ord.map(function(id,i){ var b=B.filter(function(x){ return x[0]===id; })[0]; var off=hide.indexOf(id)>=0;
    return '<div class="row tl-r'+(off?' off':'')+'"><span class="tl-n">'+(i+1)+'</span><b style="flex:1;min-width:0">'+esc(b[1])+'</b><button type="button" class="btn sm" data-tu="'+i+'" aria-label="Move up"'+(i?'':' disabled')+'>↑</button><button type="button" class="btn sm" data-td="'+i+'" aria-label="Move down"'+(i<ord.length-1?'':' disabled')+'>↓</button>'+(b[3]?'<label class="tl-sw"><input type="checkbox" data-th="'+id+'"'+(off?'':' checked')+'> Show</label>':'<span class="tl-sw muted">Always on</span>')+'</div>'; }).join(''); }
  function save(){ set({order:ord.slice(),hide:hide.slice()}); apply(); }
  draw();
  sh.addEventListener('click',function(e){ var u=e.target.closest('[data-tu]'), d=e.target.closest('[data-td]');
    if(u){ var i=+u.getAttribute('data-tu'); var x=ord[i]; ord[i]=ord[i-1]; ord[i-1]=x; draw(); save(); }
    else if(d){ var j=+d.getAttribute('data-td'); var y=ord[j]; ord[j]=ord[j+1]; ord[j+1]=y; draw(); save(); }
    else if(e.target.id==='tlR'){ set(null); ord=B.map(function(b){ return b[0]; }); hide=[]; draw(); var w=document.querySelector('.wrap.tmr'), v=w&&w.parentNode; if(v) PL.views.timer.show(v,'timer'); CW.toast('Timer layout reset.'); } });
  sh.addEventListener('change',function(e){ var c=e.target.closest('[data-th]'); if(!c) return; var id=c.getAttribute('data-th'), k=hide.indexOf(id); if(c.checked&&k>=0) hide.splice(k,1); else if(!c.checked&&k<0) hide.push(id); draw(); save(); }); }
var TV=PL.views.timer, so=TV.show;
TV.show=function(el){ var r=so.apply(this,arguments); try{ btn(); apply(); watch(); setTimeout(function(){ btn(); apply(); watch(); },0); }catch(e){ console.error(e); } return r; };
var lv=TV.leave; TV.leave=function(){ if(mo){ mo.disconnect(); mo=null; } if(lv) return lv.apply(this,arguments); };
})();
