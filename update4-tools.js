/* Update 4 solving tools: a Goal tracker, a practice Metronome and a Weekly report, shown under the Trends panel on the Timer. */
(function(){
var $=CW.$, esc=CW.esc;
function val(x){ return x.p===2?Infinity:x.t+(x.p===1?2000:0); }
function bestAoN(L,n){ var b=null; for(var i=n;i<=L.length;i++){ var a=PL.T.aoN(L.slice(0,i),n); if(a!=null&&a!==Infinity&&(b==null||a<b)) b=a; } return b; }
function goal(){ var g=CW.lsJ('cw_goal',null); return g&&g.ms>0?g:null; }
function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){} return null; }
var KIND={single:'Single',ao5:'Ao5',ao12:'Ao12'};
function current(L,k){ if(k==='single'){ var b=null; L.forEach(function(x){ if(x.p===2) return; var t=val(x); if(b==null||t<b) b=t; }); return b; } return bestAoN(L,k==='ao5'?5:12); }
function week(L){ var now=Date.now(), W=7*86400000, a=[], b=[]; L.forEach(function(x){ if(!x.d||x.p===2) return; var age=now-x.d; if(age<W) a.push(val(x)); else if(age<2*W) b.push(val(x)); });
  var mean=function(v){ return v.length?v.reduce(function(s,y){ return s+y; },0)/v.length:null; }; return {n:a.length,m:mean(a),pn:b.length,pm:mean(b)}; }
/* metronome */
var MET={on:false,t:0,ctx:null};
function tick(){ try{ if(!MET.ctx) MET.ctx=new (window.AudioContext||window.webkitAudioContext)(); var c=MET.ctx, o=c.createOscillator(), g=c.createGain(); o.frequency.value=MET.n%4===0?1200:800; g.gain.setValueAtTime(.18,c.currentTime); g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.06); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime+.07); MET.n=(MET.n||0)+1; }catch(e){} }
function metStart(bpm){ metStop(); MET.n=0; MET.on=true; tick(); MET.t=setInterval(tick,60000/bpm); }
function metStop(){ MET.on=false; clearInterval(MET.t); MET.t=0; }
function paint(){ var B=$('#tTools4'); if(!B) return; var d=PL.T.data(), L=(d.solves[d.cube]||[]).filter(Boolean), F=PL.fmt, g=goal(), bpm=+ls('cw_met_bpm')||90;
  var gh='';
  if(g){ var cur=current(L,g.kind); var pc=cur==null?0:Math.max(0,Math.min(100,Math.round(g.ms/cur*100))), done=cur!=null&&cur<=g.ms;
    gh='<div class="row" style="gap:8px;align-items:center;margin:8px 0 6px"><b>'+KIND[g.kind]+' under '+F(g.ms)+'</b><span class="sp"></span><span class="'+(done?'tag g':'tag')+'">'+(done?'Goal reached 🎉':(cur==null?'No result yet':F(cur-g.ms)+' to go'))+'</span></div><div class="ft-bar" style="height:10px"><i style="width:'+(done?100:pc)+'%"></i></div><div class="muted" style="font-size:13px;margin-top:6px">Your best '+KIND[g.kind]+': '+(cur==null?'–':F(cur))+'</div>'; }
  else gh='<p class="muted" style="margin:6px 0 0">Pick a target and the bar fills as your best gets closer.</p>';
  var w=week(L), wd=w.m!=null&&w.pm!=null?w.m-w.pm:null;
  B.innerHTML='<h3 style="margin:0 0 4px">Goal tracker</h3>'+gh
   +'<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px"><select class="in" id="t4K" style="width:110px">'+Object.keys(KIND).map(function(k){ return '<option value="'+k+'"'+(g&&g.kind===k?' selected':'')+'>'+KIND[k]+'</option>'; }).join('')+'</select><input class="in" id="t4S" type="number" step="0.01" min="1" placeholder="Seconds, e.g. 14.5" value="'+(g?(g.ms/1000):'')+'" style="width:150px"><button class="btn sm pri" id="t4Save" type="button">Set goal</button>'+(g?'<button class="btn sm" id="t4Clr" type="button">Clear</button>':'')+'</div>'
   +'<h3 style="margin:18px 0 4px">Metronome</h3><div class="row" style="gap:8px;align-items:center;flex-wrap:wrap"><input class="in" id="t4B" type="number" min="40" max="240" value="'+bpm+'" style="width:90px"><span class="muted">beats per minute · for steady turning</span><span class="sp"></span><button class="btn sm '+(MET.on?'':'pri')+'" id="t4M" type="button">'+(MET.on?'Stop':'Start')+'</button></div>'
   +'<h3 style="margin:18px 0 4px">Weekly report</h3><div class="row" style="gap:14px;flex-wrap:wrap;font-size:14px"><span>This week <b>'+w.n+'</b> solves'+(w.m!=null?' · mean <b>'+F(w.m)+'</b>':'')+'</span><span>Last week <b>'+w.pn+'</b> solves'+(w.pm!=null?' · mean <b>'+F(w.pm)+'</b>':'')+'</span>'+(wd!=null?'<span class="'+(wd<=0?'tag g':'tag')+'">'+(wd<=0?'−':'+')+(Math.abs(wd)/1000).toFixed(2)+' s vs last week</span>':'')+'</div>';
  var sv=$('#t4Save',B); if(sv) sv.onclick=function(){ var s=parseFloat($('#t4S',B).value); if(!(s>=1&&s<=3600)) return CW.toast('Enter a goal in seconds, like 14.5'); CW.setJ('cw_goal',{kind:$('#t4K',B).value,ms:Math.round(s*1000)}); paint(); CW.toast('Goal set.'); };
  var cl=$('#t4Clr',B); if(cl) cl.onclick=function(){ try{ localStorage.removeItem('cw_goal'); }catch(e){} paint(); };
  var m=$('#t4M',B); if(m) m.onclick=function(){ var n=Math.max(40,Math.min(240,+$('#t4B',B).value||90)); ls('cw_met_bpm',String(n)); if(MET.on) metStop(); else metStart(n); paint(); }; }
PL.onUpd4(function(){
  document.body.classList.add('u4v');
  var TV=PL.views.timer;
  if(TV&&!TV._t4){ TV._t4=1; var to=TV.show;
    TV.show=function(el){ var r=to.apply(this,arguments); try{ var wrap=el.querySelector('.wrap'); if(!wrap||el.querySelector('#tTools4')) return r; var box=document.createElement('div'); box.className='pnl'; box.id='tTools4'; wrap.appendChild(box); paint(); }catch(e){ console.error(e); } return r; };
    var lv=TV.leave; TV.leave=function(){ metStop(); if(lv) return lv.apply(this,arguments); };
    setInterval(function(){ try{ var b=document.getElementById('tTools4'); if(b&&!document.hidden&&!(document.activeElement&&b.contains(document.activeElement))) paint(); }catch(e){} },4000);
    if(/^#timer/.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange')); }
});
})();
