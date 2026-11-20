/* /play Timer, pro panel: Mo3/Ao5/Ao12/Ao50/Ao100 table, solve graph, today summary, settings, import/export, undo. */
(function(){
'use strict';
if(typeof CW==='undefined'||!window.PL||!PL.T) return;
var $=CW.$, esc=CW.esc, ls=CW.ls, T=PL.T, fmt=PL.fmt;
function val(x){ return x.p===2?Infinity:x.t+(x.p===1?2000:0); }
function meanOf(a){ return a.reduce(function(s,v){ return s+v; },0)/a.length; }
function mo3(L,i){ if(i<3) return null; var a=L.slice(i-3,i).map(val); if(a.some(function(v){ return v===Infinity; })) return Infinity; return meanOf(a); }
function aoAt(L,i,n){ return i<n?null:T.aoN(L.slice(0,i),n); }
function bestOf(L,fn){ var b=null, c=null, i, v; for(i=1;i<=L.length;i++){ v=fn(L,i); if(v!=null&&v!==Infinity&&(b==null||v<b)) b=v; } c=L.length?fn(L,L.length):null; return {cur:c,best:b}; }
function single(L){ var b=null; L.forEach(function(x){ var v=val(x); if(v!==Infinity&&(b==null||v<b)) b=v; }); var l=L[L.length-1]; return {cur:l?(val(l)===Infinity?Infinity:val(l)):null,best:b}; }
function rows(L){ var cap=L.length>1500?L.slice(-1500):L;
  return [['Single',single(cap)],['Mo3',bestOf(cap,mo3)],['Ao5',bestOf(cap,function(l,i){ return aoAt(l,i,5); })],['Ao12',bestOf(cap,function(l,i){ return aoAt(l,i,12); })],['Ao50',bestOf(cap,function(l,i){ return aoAt(l,i,50); })],['Ao100',bestOf(cap,function(l,i){ return aoAt(l,i,100); })]]; }
function dayKey(t){ return Math.floor((t+8*36e5)/864e5); }
function css(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim()||'#888'; }

function graph(L){ var cv=$('#t2g'); if(!cv) return; var w=cv.clientWidth||600, h=170, dpr=Math.min(2,window.devicePixelRatio||1); cv.width=w*dpr; cv.height=h*dpr; var c=cv.getContext('2d'); c.setTransform(dpr,0,0,dpr,0,0); c.clearRect(0,0,w,h);
  var N=Math.min(L.length,100), off=L.length-N, pts=[], i; for(i=0;i<N;i++){ var v=val(L[off+i]); pts.push(v); }
  var fin=pts.filter(function(v){ return v!==Infinity; }); if(fin.length<2){ c.fillStyle=css('--ink3'); c.font='13px system-ui'; c.fillText('Your graph appears after a few solves.',12,h/2); return; }
  var sorted=fin.slice().sort(function(a,b){ return a-b; }), lo=sorted[0], hi=sorted[Math.floor(sorted.length*.95)]; hi=Math.max(hi,lo+1000); lo=Math.max(0,lo-(hi-lo)*.08); var pad=24, X=function(k){ return pad+(w-pad*1.4)*(N<2?0:k/(N-1)); }, Y=function(v){ v=Math.min(v,hi); return 10+(h-30)*(1-(v-lo)/(hi-lo)); };
  c.strokeStyle=css('--line'); c.lineWidth=1; c.fillStyle=css('--ink3'); c.font='11px system-ui'; for(i=0;i<=3;i++){ var gv=lo+(hi-lo)*i/3, gy=Y(gv); c.beginPath(); c.moveTo(pad,gy); c.lineTo(w-6,gy); c.stroke(); c.fillText((gv/1000).toFixed(1),0,gy-2); }
  var best=Math.min.apply(null,fin); c.setLineDash([4,4]); c.strokeStyle=css('--good'); c.beginPath(); c.moveTo(pad,Y(best)); c.lineTo(w-6,Y(best)); c.stroke(); c.setLineDash([]);
  function line(n,col){ c.strokeStyle=col; c.lineWidth=2; c.beginPath(); var st=false; for(var k=0;k<N;k++){ var gi=off+k+1, a=aoAt(L,gi,n); if(a==null||a===Infinity){ continue; } if(!st){ c.moveTo(X(k),Y(a)); st=true; } else c.lineTo(X(k),Y(a)); } c.stroke(); }
  line(12,'#ff7a1a'); line(5,css('--blue'));
  pts.forEach(function(v,k){ c.fillStyle=v===Infinity?css('--bad'):css('--ink3'); c.globalAlpha=.75; c.beginPath(); c.arc(X(k),v===Infinity?10:Y(v),2.6,0,6.283); c.fill(); }); c.globalAlpha=1;
  cv.onpointerdown=function(e){ var r=cv.getBoundingClientRect(), k=Math.round(((e.clientX-r.left)-pad)/((w-pad*1.4)/(Math.max(1,N-1)))); k=Math.max(0,Math.min(N-1,k)); PL.T.editSolve(off+k); }; }

function render(){ var side=$('.tside'); if(!side) return; var d=T.data(), L=d.solves[d.cube]||[], box=$('#t2'); if(!box){ side.insertAdjacentHTML('afterbegin','<div id="t2"></div>'); box=$('#t2'); }
  var R=rows(L), today=L.filter(function(x){ return dayKey(x.d||0)===dayKey(Date.now()); }), tv=today.map(val).filter(function(v){ return v!==Infinity; });
  var all=L.map(val).filter(function(v){ return v!==Infinity; }), mean=all.length?meanOf(all):null, sd=all.length>1?Math.sqrt(meanOf(all.map(function(v){ return (v-mean)*(v-mean); }))):null;
  box.innerHTML='<div class="pnl t2p"><div class="row" style="margin-bottom:8px"><h3 style="margin:0">Averages</h3><span class="sp"></span><span class="muted" style="font-size:13px">'+({'222':'2×2','333':'3×3','444':'4×4','555':'5×5'}[d.cube])+' · '+L.length+' solves</span></div>'
    +'<table class="t2t"><thead><tr><th></th><th>Current</th><th>Best</th></tr></thead><tbody>'+R.map(function(r){ return '<tr><th>'+r[0]+'</th><td>'+fmt(r[1].cur)+'</td><td'+(r[1].cur!=null&&r[1].cur===r[1].best?' class="pbx"':'')+'>'+fmt(r[1].best)+'</td></tr>'; }).join('')+'</tbody></table>'
    +'<div class="t2s"><div><small>Mean</small><b>'+fmt(mean)+'</b></div><div><small>Std dev</small><b>'+(sd==null?'–':(sd/1000).toFixed(2))+'</b></div><div><small>Today</small><b>'+today.length+'</b></div><div><small>Today avg</small><b>'+(tv.length?fmt(meanOf(tv)):'–')+'</b></div></div></div>'
    +'<div class="pnl t2p"><div class="row" style="margin-bottom:6px"><h3 style="margin:0">Last '+Math.min(100,L.length)+' solves</h3><span class="sp"></span><span class="t2lg"><i style="background:var(--ink3)"></i>solve <i style="background:var(--blue)"></i>Ao5 <i style="background:#ff7a1a"></i>Ao12</span></div><canvas id="t2g" style="width:100%;height:170px;display:block"></canvas></div>'
    +'<div class="pnl t2p"><div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm" id="t2Set" type="button">⚙ Settings</button><button class="btn sm" id="t2Un" type="button">↶ Delete last</button><button class="btn sm" id="t2Ex" type="button">Export</button><button class="btn sm" id="t2Im" type="button">Import</button></div></div>';
  graph(L);
  $('#t2Un').onclick=function(){ var d2=T.data(), L2=d2.solves[d2.cube]||[]; if(!L2.length) return; PL.T.editSolve(L2.length-1); };
  $('#t2Set').onclick=settings; $('#t2Ex').onclick=exportSheet; $('#t2Im').onclick=importSheet; }

function settings(){ var sh=CW.sheet('<div class="hd"><h2>Timer settings</h2><button class="x" data-close aria-label="Close">✕</button></div>'
  +'<label class="t2o"><input type="checkbox" id="oI"'+(ls('cw_insp')==='1'?' checked':'')+'><span><b>15-second inspection</b><small>Countdown with beeps at 8 s and 12 s. Starting after 15 s adds +2, after 17 s is a DNF.</small></span></label>'
  +'<label class="t2o"><input type="checkbox" id="oH"'+(ls('cw_hide')==='1'?' checked':'')+'><span><b>Hide the time while solving</b><small>Shows “Solving…” so you only see your time at the end.</small></span></label>'
  +'<label class="t2o"><input type="checkbox" id="oS"'+(ls('cw_tsplit')==='1'?' checked':'')+'><span><b>Step splits</b><small>Tap cross, F2L and OLL during a 3×3 solve to see where your time goes.</small></span></label>');
  sh.addEventListener('change',function(e){ var t=e.target; if(t.id==='oI') ls('cw_insp',t.checked?'1':'0'); if(t.id==='oH') ls('cw_hide',t.checked?'1':'0'); if(t.id==='oS'){ ls('cw_tsplit',t.checked?'1':'0'); var m=$('#tSpT'); if(m) m.checked=t.checked; } }); }

function download(name,text,type){ try{ var b=new Blob([text],{type:type||'text/plain'}), a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },500); }catch(e){ CW.toast('Could not download. Use Copy instead.'); } }
function exportSheet(){ var d=T.data(), L=d.solves[d.cube]||[];
  var csv='No,Time (s),Penalty,Scramble,Date\n'+L.map(function(x,i){ return (i+1)+','+(x.t/1000).toFixed(3)+','+(x.p===2?'DNF':x.p===1?'+2':'')+',"'+String(x.scr||'').replace(/"/g,'')+'",'+new Date(x.d||0).toISOString(); }).join('\n');
  var json=JSON.stringify({app:'Cuber Tools',cube:d.cube,solves:L});
  var sh=CW.sheet('<div class="hd"><h2>Export '+L.length+' solves</h2><button class="x" data-close aria-label="Close">✕</button></div><p class="muted" style="font-size:14px">Keep a backup of your times, or move them to another device.</p><div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn sm pri" data-dl="json">Download backup (.json)</button><button class="btn sm" data-dl="csv">Download spreadsheet (.csv)</button><button class="btn sm" data-cp>Copy as text</button></div>');
  sh.addEventListener('click',function(e){ var b=e.target.closest('[data-dl]'); if(b){ if(b.getAttribute('data-dl')==='json') download('cuber-tools-'+d.cube+'.json',json,'application/json'); else download('cuber-tools-'+d.cube+'.csv',csv,'text/csv'); return; } if(e.target.closest('[data-cp]')) CW.copy(L.map(function(x){ return x.p===2?'DNF':(val(x)/1000).toFixed(2)+(x.p===1?'+':''); }).join('\n'),e.target.closest('[data-cp]')); }); }

function parseImport(txt){ txt=String(txt||'').trim(); var out=[], now=Date.now(), i;
  try{ var j=JSON.parse(txt);
    if(j&&Array.isArray(j.solves)){ j.solves.forEach(function(x){ if(x&&typeof x.t==='number'&&x.t>0) out.push({t:Math.round(x.t),scr:String(x.scr||''),d:+x.d||now,p:x.p===1||x.p===2?x.p:0}); }); return out; }
    if(j&&typeof j==='object'){ Object.keys(j).forEach(function(k){ if(!/^session/.test(k)||!Array.isArray(j[k])) return; j[k].forEach(function(r){ try{ var tm=r[0], ms=tm[1], p=tm[0]; if(ms>0) out.push({t:Math.round(ms),scr:String(r[1]||''),d:(+r[3]||0)*1000||now,p:p===2000?1:p===-1?2:0}); }catch(e){} }); }); if(out.length) return out; }
  }catch(e){}
  txt.split(/\r?\n/).forEach(function(line,ix){ line=line.trim(); if(!line||/^no,|^time/i.test(line)) return; var cols=line.split(','), s=cols.length>1?cols[1]:cols[0]; if(cols.length>2&&/^\d+$/.test(cols[0])) s=cols[1]; var pen=/dnf/i.test(line)?2:/\+2|\+$/.test(line)?1:0; var m=/(\d+):(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)/.exec(s); if(!m) return; var ms=m[1]!=null?(+m[1]*60+ +m[2])*1000:(+m[3])*1000; if(!(ms>0)) return; out.push({t:Math.round(ms),scr:'',d:now-(1e6-ix),p:pen}); });
  return out; }
function importSheet(){ var sh=CW.sheet('<div class="hd"><h2>Import solves</h2><button class="x" data-close aria-label="Close">✕</button></div><p class="muted" style="font-size:14px">Paste a Cuber Tools backup, a csTimer export, or just a list of times, one per line (like 12.34, 15.01+, DNF). They are added to your current cube type.</p><textarea class="in mono" id="imT" rows="6" placeholder="12.34\n15.01+\nDNF" style="width:100%;margin-top:10px"></textarea><div class="row" style="gap:8px;margin-top:10px"><label class="btn sm" style="cursor:pointer">Choose a file<input type="file" id="imF" accept=".json,.csv,.txt" hidden></label><span class="sp"></span><button class="btn sm pri" id="imGo" type="button">Import</button></div><p class="muted" id="imM" style="font-size:13.5px;margin-top:8px;min-height:18px"></p>');
  var f=sh.querySelector('#imF'); f.onchange=function(){ var r=new FileReader(); r.onload=function(){ sh.querySelector('#imT').value=String(r.result||''); }; if(f.files[0]) r.readAsText(f.files[0]); };
  sh.querySelector('#imGo').onclick=function(){ var list=parseImport(sh.querySelector('#imT').value); if(!list.length){ sh.querySelector('#imM').textContent='I could not find any times in that.'; return; } if(list.length>5000) list=list.slice(0,5000);
    var d=T.data(), L=d.solves[d.cube]=d.solves[d.cube]||[]; var before=L.length; list.forEach(function(x){ L.push(x); }); L.sort(function(a,b){ return (a.d||0)-(b.d||0); }); T.save(d); PL.T.stats(); sh.close(); CW.toast('Imported '+(L.length-before)+' solves. Imported times do not earn tokens.'); }; }

PL.t2={render:render};
})();
