/* Update 3 solving tools: Trends panel on the Timer (personal bests with dates, 14-day chart, today vs before) and a CSV export of your solves. */
(function(){
var $=CW.$, esc=CW.esc;
function ds(t){ var x=new Date(t); return x.getFullYear()+'-'+(x.getMonth()+1)+'-'+x.getDate(); }
function val(x){ return x.p===2?Infinity:x.t+(x.p===1?2000:0); }
function bestAoN(L,n){ var b=null,at=0; for(var i=n;i<=L.length;i++){ var a=PL.T.aoN(L.slice(0,i),n); if(a!=null&&a!==Infinity&&(b==null||a<b)){ b=a; at=L[i-1].d||0; } } return b==null?null:{v:b,d:at}; }
function when(t){ if(!t) return ''; var d=new Date(t); return d.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}); }
function mean(a){ return a.length?a.reduce(function(s,x){ return s+x; },0)/a.length:null; }
function paint(){ paint0(); var B=$('#tTrend'); if(B&&B.__nh!=null&&B.__nh!==B.__h){ B.__h=B.__nh; B.innerHTML=B.__nh; } }   /* only redraw when something changed: no flicker */
function paint0(){ var B=$('#tTrend'); if(!B) return; var d=PL.T.data(), L=(d.solves[d.cube]||[]).filter(Boolean), F=PL.fmt;
  if(L.length<3){ B.__nh='<h3 style="margin:0 0 6px">Trends</h3><p class="muted" style="margin:0">Do a few solves and your personal bests and a daily chart show up here.</p>'; return; }
  var sb=null; L.forEach(function(x){ if(x.p===2) return; var t=val(x); if(!sb||t<sb.v) sb={v:t,d:x.d||0}; });
  var rows=[['Single',sb],['Ao5',bestAoN(L,5)],['Ao12',bestAoN(L,12)],['Ao100',bestAoN(L,100)]];
  var byDay={}; L.forEach(function(x){ if(!x.d||x.p===2) return; var k=ds(x.d); (byDay[k]=byDay[k]||[]).push(val(x)); });
  var days=[], now=Date.now(), i; for(i=13;i>=0;i--){ var t=now-i*86400000, a=byDay[ds(t)]; days.push({t:t,m:a?mean(a):null,n:a?a.length:0}); }
  var vs=days.filter(function(x){ return x.m!=null; }).map(function(x){ return x.m; }), lo=Math.min.apply(null,vs), hi=Math.max.apply(null,vs); if(!vs.length){ lo=0; hi=1; } if(hi-lo<500) hi=lo+500;
  var W=300,H=90,bw=W/14, bars=days.map(function(x,k){ if(x.m==null) return '<rect x="'+(k*bw+3)+'" y="'+(H-3)+'" width="'+(bw-6)+'" height="3" rx="1.5" fill="currentColor" opacity=".18"/>'; var h=8+(1-(x.m-lo)/(hi-lo))*(H-18); return '<rect x="'+(k*bw+3)+'" y="'+(H-h)+'" width="'+(bw-6)+'" height="'+h+'" rx="3" fill="var(--brand,#2f6bff)" opacity="'+(k===13?1:.65)+'"><title>'+new Date(x.t).toLocaleDateString()+' · mean '+F(x.m)+' · '+x.n+' solves</title></rect>'; }).join('');
  var td=byDay[ds(now)]||[], yd=byDay[ds(now-86400000)]||[], wk=[]; for(i=1;i<=7;i++){ (byDay[ds(now-i*86400000)]||[]).forEach(function(v){ wk.push(v); }); }
  function cmp(a,b){ if(a==null||b==null) return ''; var df=a-b; return '<span class="'+(df<=0?'tag g':'tag')+'">'+(df<=0?'−':'+')+(Math.abs(df)/1000).toFixed(2)+' s</span>'; }
  var tm=mean(td), ym=mean(yd), wm=mean(wk);
  B.__nh='<div class="row" style="gap:8px;flex-wrap:wrap"><h3 style="margin:0">Trends</h3><span class="sp"></span><button class="btn sm" id="tTcsv" type="button">Export CSV</button></div>'
   +'<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px">'+rows.map(function(r){ return '<div style="flex:1;min-width:120px;padding:10px 12px;border:1px solid var(--line,#ddd);border-radius:12px"><div class="muted" style="font-size:12.5px">Best '+r[0]+'</div><div style="font-size:20px;font-weight:700">'+(r[1]?F(r[1].v):'–')+'</div><div class="muted" style="font-size:12px">'+(r[1]?when(r[1].d):'not yet')+'</div></div>'; }).join('')+'</div>'
   +'<div class="muted" style="font-size:13px;margin:14px 0 4px">Daily mean, last 14 days (taller is faster)</div><svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:96px;color:var(--ink,#111)" role="img" aria-label="Daily mean chart">'+bars+'</svg>'
   +'<div class="row" style="gap:14px;flex-wrap:wrap;font-size:14px;margin-top:8px"><span>Today <b>'+(tm==null?'–':F(tm))+'</b> <span class="muted">('+td.length+')</span></span><span>vs yesterday '+(cmp(tm,ym)||'<span class="muted">–</span>')+'</span><span>vs last 7 days '+(cmp(tm,wm)||'<span class="muted">–</span>')+'</span></div>'; 
  var c=$('#tTcsv'); if(c) c.onclick=function(){ var f=PL.fmt, out='cube,date,time,penalty,scramble\n'; Object.keys(d.solves||{}).forEach(function(k){ (d.solves[k]||[]).forEach(function(x){ if(!x) return; out+=[k,x.d?new Date(x.d).toISOString():'',x.p===2?'DNF':(x.t/1000).toFixed(2),x.p===1?'+2':'','"'+String(x.s||'').replace(/"/g,'""')+'"'].join(',')+'\n'; }); }); var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([out],{type:'text/csv'})); a.download='cuber-tools-solves.csv'; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },500); }; }
PL.onUpd3(function(){
  var TV=PL.views.timer;
  if(TV&&!TV._tr){ TV._tr=1; var to=TV.show;
    TV.show=function(el){ var r=to.apply(this,arguments); try{ var wrap=el.querySelector('.wrap'); if(!wrap||el.querySelector('#tTrend')) return r; var box=document.createElement('div'); box.className='pnl'; box.id='tTrend'; wrap.appendChild(box); paint(); }catch(e){ console.error(e); } return r; };
    setInterval(function(){ try{ if(document.getElementById('tTrend')&&!document.hidden) paint(); }catch(e){} },2500);
    if(/^#timer/.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange')); }
});
})();
