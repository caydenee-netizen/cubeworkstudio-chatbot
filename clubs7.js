/* Update 7: Clubs league. Four divisions (Bronze, Silver, Gold, Diamond). Weekly points decide who goes up or down. */
(function(){
function left(ms){ ms=Math.max(0,ms); var m=Math.floor(ms/60000), h=Math.floor(m/60), d=Math.floor(h/24); return d?d+'d '+(h%24)+'h':h?h+'h '+(m%60)+'m':PL.mmss(ms); }
var esc=function(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
var CC=['#2650f5','#e1352b','#1f9a52','#f2b600','#7a5cff','#ff7a1a','#12a3b8','#c43d8b'], MED=['🥉','🥈','🥇','💎'];
function html(d){ if(!d) return '<h3 style="margin:0">🏅 Clubs league</h3><p class="muted">Loading…</p>'; if(d.err) return '<h3 style="margin:0">🏅 Clubs league</h3><p class="muted">'+esc(d.err)+'</p>';
  var n=d.rows.length;
  return '<div class="row" style="gap:8px;flex-wrap:wrap"><h3 style="margin:0">🏅 Clubs league</h3><span class="sp"></span><span class="tag">'+MED[d.d]+' '+esc(d.n)+' division</span></div>'
   +'<p class="muted" style="font-size:13.5px;margin:6px 0 10px">Every club starts in Bronze. When the week ends, the top 3 clubs in each division move up and the bottom 3 move down (in divisions with 6 or more active clubs). The division winner’s active members get '+d.pay+' tokens. Ends in '+left(d.reset-Date.now())+'.'+(d.last?' Last week: #'+d.last.r+' in '+esc(d.last.n)+'.':'')+'</p>'
   +'<div class="row" style="gap:6px;margin-bottom:8px">'+d.names.map(function(x,i){ return '<span class="tag'+(i===d.d?' g':'')+'">'+MED[i]+' '+esc(x)+'</span>'; }).join('')+'</div>'
   +(n?d.rows.map(function(r,i){ var zone=i<3&&d.d<3?'up':(n>=6&&i>=n-3&&d.d>0?'down':''); return '<div class="row c7-r'+(r.me?' me':'')+'"><b class="mono">#'+r.r+'</b><span style="width:12px;height:12px;border-radius:3px;background:'+CC[r.col%8]+';display:inline-block"></span><span>'+esc(r.n)+' <small class="muted">['+esc(r.t)+']</small></span><span class="sp"></span>'+(zone==='up'?'<span class="tag g" style="font-size:11px">▲ up</span>':zone==='down'?'<span class="tag" style="font-size:11px">▼ down</span>':'')+'<b class="mono">'+r.wp+'</b></div>'; }).join(''):'<p class="muted">No clubs in this division yet.</p>'); }
function load(box,n){ CW.call('/api/club',{id:CW.devId(),act:'league'},8000).then(function(r){ var d=r&&r.data; if(!(d&&d.ok)&&!n&&document.body.contains(box)){ setTimeout(function(){ load(box,1); },3000); return; } box.innerHTML=html(d&&d.ok?d:{err:(d&&d.error)||'Could not load the league.'}); }); }
PL.onUpd7&&PL.onUpd7(function(){ var V=PL.views.clubs; if(!V||V._c7) return; V._c7=1; var o=V.show;
  V.show=function(el,h){ var r=o.apply(this,arguments); try{ var w=el.querySelector('.wrap'); if(w&&!el.querySelector('#lg7')){ var b=document.createElement('div'); b.className='pnl'; b.id='lg7'; b.style.marginTop='14px'; b.innerHTML=html(null); w.appendChild(b); load(b); } }catch(e){ console.error(e); } return r; };
  if(/^#clubs/.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange')); });
})();
