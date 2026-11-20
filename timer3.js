/* /play Timer, big upgrade: sessions, more puzzles (6x6, 7x7, one-handed, Pyraminx, Skewb, Megaminx), trainer scrambles (cross, F2L, OLL, PLL),
   notes on solves, a target-pace bar, a spread chart with consistency numbers, and a new-best celebration.
   It adds to the existing Timer (play.js) and pro panel (timer2.js) through small hooks: PL.scrX, PL.t3.noNet, PL.t3.edit, PL.TM. */
(function(){
'use strict';
if(typeof CW==='undefined'||!window.PL||!PL.T) return;
var $=CW.$, esc=CW.esc, T=PL.T, C=T.CUBES, fmt=T.fmt, R=Math.random;
function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} return null; }
function pick(a){ return a[Math.floor(R()*a.length)]; }
function val(x){ return x.p===2?Infinity:x.t+(x.p===1?2000:0); }

/* ---------- more puzzles and trainer modes ---------- */
var BASE=['222','333','444','555'];
var MORE=[['666','6×6'],['777','7×7'],['3h','3×3 one-handed'],['pyr','Pyraminx'],['skb','Skewb'],['mega','Megaminx']];
var TRAIN=[['3x','Cross'],['3f','F2L pair'],['3o','OLL'],['3p','PLL']];
MORE.concat(TRAIN).forEach(function(m){ C[m[0]]=m[1]; });
var HINT={'3x':'Cross practice: stop the timer when your cross is done.','3f':'F2L practice: only one pair is out. Insert it.','3o':'OLL practice: the first two layers are solved. Orient the last layer.','3p':'PLL practice: everything is oriented. Permute the last layer.','3h':'One hand only.'};
function big(n,len){ var faces=['R','L','U','D','F','B'], ax={R:0,L:0,U:1,D:1,F:2,B:2}, out=[], last=null, prev=null; while(out.length<len){ var f=pick(faces); if(f===last||(prev&&ax[f]===ax[last]&&f===prev)) continue; if(last&&ax[f]===ax[last]&&prev&&ax[prev]===ax[f]) continue;
    var w=Math.floor(R()*Math.floor(n/2)), pre=w===0?f:w===1?f+'w':(w+1)+f+'w'; out.push(pre+pick(['',"'",'2'])); prev=last; last=f; } return out.join(' '); }
function simple(faces,len,tips){ var out=[], last=''; while(out.length<len){ var f=pick(faces); if(f===last) continue; out.push(f+pick(['',"'"])); last=f; } (tips||[]).forEach(function(t){ var q=Math.floor(R()*3); if(q) out.push(t+(q===2?"'":'')); }); return out.join(' '); }
function mega(){ var rows=[]; for(var i=0;i<7;i++){ var r=[]; for(var j=0;j<5;j++){ r.push('R'+pick(['++','--'])); r.push('D'+pick(['++','--'])); } r.push(pick(['U',"U'"])); rows.push(r.join(' ')); } return rows.join('\n'); }
function inv(alg){ return String(alg).replace(/[()\[\]]/g,' ').trim().split(/\s+/).reverse().map(function(m){ return /2$/.test(m)?m:/'$/.test(m)?m.slice(0,-1):m+"'"; }).join(' '); }
function fromCase(k){ var D=window.LEARN_DATA, L=D&&D[k]; if(!L||!L.length) return T.scramble('333'); var c=pick(L), a=inv(c.an||c.alg), pre=pick(['','U ',"U' ",'U2 ']), post=k==='f2l'?'':pick(['',' U'," U'",' U2']); return (pre+a+post).trim(); }
PL.scrX={'666':function(){ return big(6,80); },'777':function(){ return big(7,100); },'3h':function(){ return T.scramble('333'); },pyr:function(){ return simple(['U','L','R','B'],9,['u','l','r','b']); },skb:function(){ return simple(['R','L','U','B'],9); },mega:mega,
  '3x':function(){ return T.scramble('333'); },'3f':function(){ return fromCase('f2l'); },'3o':function(){ return fromCase('oll'); },'3p':function(){ return fromCase('pll'); }};
function noNet(cube){ if(BASE.indexOf(cube)>=0) return false; if(cube==='3h'||cube==='3x') return false; if(cube[0]==='3'){ var s=(PL.TM&&PL.TM.scr)||''; return /[^RLUDFB2' ]/.test(s); } return true; }

/* ---------- sessions: the active one lives in the normal timer store, the others are parked here ---------- */
function sess(){ var s=CW.lsJ('cw_tsess',null); if(!s||!Array.isArray(s.names)||!s.names.length) s={cur:'Session 1',names:['Session 1'],data:{}}; if(s.names.indexOf(s.cur)<0) s.cur=s.names[0]; if(!s.data||typeof s.data!=='object') s.data={}; return s; }
function sessSave(s){ CW.setJ('cw_tsess',s); }
function sessGo(name){ var s=sess(); if(name===s.cur||s.names.indexOf(name)<0) return; var d=T.data(); s.data[s.cur]=d.solves; d.solves=s.data[name]||{}; delete s.data[name]; s.cur=name; sessSave(s); T.save(d); reshow(); }
function sessNew(name){ name=String(name||'').replace(/[<>&"]/g,'').trim().slice(0,24); var s=sess(); if(!name||s.names.indexOf(name)>=0||s.names.length>=20) return false; s.names.push(name); sessSave(s); sessGo(name); return true; }
function sessDel(name){ var s=sess(); if(name===s.cur||s.names.length<2) return; s.names=s.names.filter(function(n){ return n!==name; }); delete s.data[name]; sessSave(s); }
function reshow(){ var b=document.querySelector('#tCube [data-c="'+T.data().cube+'"]'); if(b) b.click(); else try{ window.dispatchEvent(new HashChangeEvent('hashchange')); }catch(e){} }
function sessSheet(){ var s=sess(), sh=CW.sheet('<div class="hd"><h2>Sessions</h2><button class="x" data-close aria-label="Close">✕</button></div><p class="muted" style="font-size:13.5px">Each session keeps its own times for every puzzle. Your leaderboard rank still uses your best 3×3 from the session you are in.</p><div id="t3SL"></div><div class="row" style="margin-top:12px"><input class="inp" id="t3SN" maxlength="24" placeholder="New session name" style="flex:1;min-width:0"><button class="btn pri" id="t3SA" type="button">Add</button></div>');
  function draw(){ var s2=sess(); $('#t3SL',sh).innerHTML=s2.names.map(function(n){ var cnt=0, src=n===s2.cur?T.data().solves:(s2.data[n]||{}); Object.keys(src).forEach(function(k){ cnt+=(src[k]||[]).length; }); return '<div class="row t3-sr"><b>'+esc(n)+'</b><span class="muted">'+cnt+' solves</span><span class="sp"></span>'+(n===s2.cur?'<span class="chipb">In use</span>':'<button class="btn sm" data-go="'+esc(n)+'" type="button">Use</button><button class="btn sm" data-rm="'+esc(n)+'" type="button">Delete</button>')+'</div>'; }).join(''); }
  draw(); sh.addEventListener('click',function(e){ var g=e.target.closest('[data-go]'), r=e.target.closest('[data-rm]'); if(g){ sh.close(); sessGo(g.getAttribute('data-go')); } else if(r){ var n=r.getAttribute('data-rm'); if(r.getAttribute('data-sure')){ sessDel(n); draw(); } else { r.setAttribute('data-sure','1'); r.textContent='Tap again to delete'; } } });
  $('#t3SA',sh).onclick=function(){ if(sessNew($('#t3SN',sh).value)) sh.close(); else CW.toast('Give it a new name (up to 20 sessions).'); }; }

/* ---------- target pace ---------- */
function pace(){ var v=parseFloat(ls('cw_tpace')||''); return v>0?v*1000:0; }
var praf=0; function paceLoop(){ praf=requestAnimationFrame(paceLoop); var bar=document.getElementById('t3Pace'); if(!bar){ cancelAnimationFrame(praf); praf=0; return; } var tg=pace(), TM=PL.TM; if(!tg||!TM){ if(!bar.hidden) bar.hidden=true; return; } if(bar.hidden) bar.hidden=false; var run=TM.state==='run', q=run?(performance.now()-TM.start)/tg:0; bar.firstChild.style.width=Math.min(100,q*100)+'%'; bar.classList.toggle('over',q>1); bar.classList.toggle('run',run); bar.lastChild.textContent='🎯 '+(tg/1000).toFixed(tg%1000?1:0)+' s'; }

/* ---------- spread chart and consistency ---------- */
function spread(L){ var v=L.map(val).filter(function(x){ return x!==Infinity; }); if(v.length<5) return '<p class="muted" style="margin:0;font-size:13.5px">Do 5 solves to see how spread out your times are.</p>';
  var mn=Math.min.apply(null,v), mx=Math.max.apply(null,v), mean=v.reduce(function(a,b){ return a+b; },0)/v.length, sd=Math.sqrt(v.reduce(function(a,b){ return a+(b-mean)*(b-mean); },0)/v.length), nb=Math.min(10,Math.max(5,Math.round(Math.sqrt(v.length)))), w=(mx-mn)/nb||1, bins=[]; for(var i=0;i<nb;i++) bins.push(0); v.forEach(function(x){ bins[Math.min(nb-1,Math.floor((x-mn)/w))]++; });
  var top=Math.max.apply(null,bins), tg=pace(), under=tg?Math.round(v.filter(function(x){ return x<=tg; }).length/v.length*100):null, W=300, H=90, bw=W/nb;
  var svg='<svg viewBox="0 0 '+W+' '+(H+16)+'" width="100%" role="img" aria-label="How your times are spread">'+bins.map(function(b,i2){ var h=b/top*H; return '<rect x="'+(i2*bw+2).toFixed(1)+'" y="'+(H-h).toFixed(1)+'" width="'+(bw-4).toFixed(1)+'" height="'+h.toFixed(1)+'" rx="4" fill="var(--blue,#2650f5)" opacity="'+(.35+.65*b/top).toFixed(2)+'"><title>'+fmt(mn+i2*w)+' to '+fmt(mn+(i2+1)*w)+': '+b+'</title></rect>'; }).join('')+'<text x="0" y="'+(H+13)+'" font-size="10" fill="currentColor" opacity=".6">'+fmt(mn)+'</text><text x="'+W+'" y="'+(H+13)+'" font-size="10" fill="currentColor" opacity=".6" text-anchor="end">'+fmt(mx)+'</text></svg>';
  var days={}; L.forEach(function(x){ if(x.d) days[new Date(x.d).toDateString()]=1; }); var streak=0, dt=new Date(); while(days[dt.toDateString()]){ streak++; dt.setDate(dt.getDate()-1); }
  return svg+'<div class="t3-kv"><div><small>Mean</small><b>'+fmt(mean)+'</b></div><div><small>Spread (σ)</small><b>'+fmt(sd)+'</b></div><div><small>Worst</small><b>'+fmt(mx)+'</b></div>'+(under!=null?'<div><small>At or under target</small><b>'+under+'%</b></div>':'')+'<div><small>Day streak</small><b>'+streak+'</b></div></div>'; }

/* ---------- what gets added to the Timer screen ---------- */
function decorate(){ var seg=document.getElementById('tCube'); if(!seg||document.getElementById('t3Sel')) return; var d=T.data(), cur=d.cube, s=sess();
  Array.prototype.forEach.call(seg.querySelectorAll('[data-c]'),function(b){ if(BASE.indexOf(b.getAttribute('data-c'))<0) b.hidden=true; });
  var sel=document.createElement('select'); sel.id='t3Sel'; sel.className='t3-sel'+(BASE.indexOf(cur)<0?' on':''); sel.setAttribute('aria-label','More puzzles and trainers');
  sel.innerHTML='<option value="">More ▾</option><optgroup label="More puzzles">'+MORE.map(function(m){ return '<option value="'+m[0]+'"'+(cur===m[0]?' selected':'')+'>'+m[1]+'</option>'; }).join('')+'</optgroup><optgroup label="Trainers (3×3)">'+TRAIN.map(function(m){ return '<option value="'+m[0]+'"'+(cur===m[0]?' selected':'')+'>'+m[1]+'</option>'; }).join('')+'</optgroup>';
  sel.onchange=function(){ var v=sel.value; if(!v) return; var b=seg.querySelector('[data-c="'+v+'"]'); if(b){ b.hidden=false; b.click(); } }; seg.parentNode.insertBefore(sel,seg.nextSibling);
  var side=document.querySelector('.tside'), stats=document.getElementById('tStats'); if(side&&stats){ var bar=document.createElement('div'); bar.className='t3-bar'; bar.innerHTML='<button type="button" class="btn sm" id="t3Se">📁 '+esc(s.cur)+'</button><label class="t3-tg">🎯 Target <input id="t3Tg" type="number" inputmode="decimal" min="0" step="0.5" placeholder="off" value="'+(pace()?pace()/1000:'')+'"> s</label>'; side.insertBefore(bar,stats);
    $('#t3Se').onclick=sessSheet; $('#t3Tg').onchange=function(){ var v=parseFloat(this.value); ls('cw_tpace',v>0?String(Math.min(600,v)):null); panel(); };
    var pn=document.createElement('div'); pn.className='pnl'; pn.id='t3Sp'; pn.style.marginTop='12px'; side.appendChild(pn); panel(); }
  var pad=document.getElementById('tPad'); if(pad&&!document.getElementById('t3Pace')){ var pb=document.createElement('div'); pb.id='t3Pace'; pb.className='t3-pace'; pb.hidden=true; pb.innerHTML='<u></u><span></span>'; pad.appendChild(pb); if(!praf) paceLoop(); }
  var scr=document.getElementById('tScr'); if(scr){ if(cur==='mega') scr.classList.add('t3-mega'); if(HINT[cur]&&!document.getElementById('t3Hint')){ var hn=document.createElement('p'); hn.id='t3Hint'; hn.className='muted'; hn.style.cssText='margin:6px 0 0;font-size:13.5px'; hn.textContent=HINT[cur]; scr.parentNode.insertBefore(hn,scr.nextSibling); } } }
function panel(){ var pn=document.getElementById('t3Sp'); if(!pn) return; var d=T.data(), L=d.solves[d.cube]||[]; pn.innerHTML='<h3 style="margin:0 0 8px">Spread · '+esc(C[d.cube]||'')+'</h3>'+spread(L); }

/* ---------- notes on a solve (inside the sheet you get when you tap a time) ---------- */
function edit(sh,x,save){ var box=sh.querySelector('.box')||sh, w=document.createElement('div'); w.style.marginTop='12px'; w.innerHTML='<input class="inp" id="t3Note" maxlength="80" placeholder="Add a note to this solve" style="width:100%" value="'+esc(x.n||'')+'">'; box.appendChild(w); $('#t3Note',sh).onchange=function(){ var v=this.value.trim().slice(0,80); if(v) x.n=v; else delete x.n; save(); }; }

/* ---------- new-best celebration ---------- */
function celebrate(title,time){ var o=document.createElement('div'); o.className='t3-pb'; var bits=''; for(var i=0;i<26;i++) bits+='<i style="--a:'+(i/26*360)+'deg;--d:'+(90+R()*150).toFixed(0)+'px;--c:'+pick(['#e1352b','#ff7a1a','#f2c200','#1f9a52','#2650f5','#fff'])+'"></i>'; o.innerHTML=bits+'<div><small>'+title+'</small><b>'+time+'</b></div>'; document.body.appendChild(o); setTimeout(function(){ o.classList.add('out'); },1700); setTimeout(function(){ o.remove(); },2300); }
var prevSD=PL.solveDone; PL.solveDone=function(rec,cube,L){ if(prevSD) try{ prevSD(rec,cube,L); }catch(e){} try{ panel(); if(rec.p===2||L.length<3) return; var v=val(rec), before=L.slice(0,-1), pb=T.best(before);
    if(pb!=null&&v<pb){ celebrate('New best single · '+(C[cube]||''),fmt(v)); return; }
    if(L.length>=6){ var cur=T.ao(L,5), best=null, from=Math.max(5,L.length-400); for(var i=from;i<L.length;i++){ var a=T.ao(L.slice(0,i),5); if(a!=null&&a!==Infinity&&(best==null||a<best)) best=a; } if(cur!=null&&cur!==Infinity&&best!=null&&cur<best) celebrate('New best average of 5',fmt(cur)); } }catch(e){} };

var show0=PL.views.timer&&PL.views.timer.show; if(show0) PL.views.timer.show=function(el){ var r=show0.apply(this,arguments); try{ decorate(); }catch(e){} return r; };
PL.t3={noNet:noNet,edit:edit,panel:panel,decorate:decorate};
})();
