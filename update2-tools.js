/* Update 2 solving tools: Practice Goals (Timer), Case of the Day (Learn), Verdict History. 3D Cube hints live in cube3d.js. */
(function(){
var $=CW.$, esc=CW.esc;
function ds(t){ var x=new Date(t); return x.getFullYear()+'-'+(x.getMonth()+1)+'-'+x.getDate(); }
PL.onUpd2(function(){
  /* ---------- Practice Goals ---------- */
  var TV=PL.views.timer;
  if(TV&&!TV._g){ TV._g=1; var to=TV.show;
    function counts(){ var d=PL.T.data(), m={}; Object.keys(d.solves||{}).forEach(function(k){ (d.solves[k]||[]).forEach(function(s){ if(s&&s.d){ var k2=ds(s.d); m[k2]=(m[k2]||0)+1; } }); }); return m; }
    function goal(){ var g=+localStorage.getItem('cw_goal'); return g>=5&&g<=500?g:20; }
    function paint(){ var B=$('#tGoal'); if(!B) return; var g=goal(), m=counts(), n=m[ds(Date.now())]||0, st=0, day=new Date(); if(n<g) day.setDate(day.getDate()-1); for(;;){ if((m[ds(day.getTime())]||0)>=g){ st++; day.setDate(day.getDate()-1); } else break; if(st>400) break; }
      var done=n>=g, claimed=localStorage.getItem('cw_goal_c')===ds(Date.now());
      B.innerHTML='<div class="row" style="gap:8px;flex-wrap:wrap"><h3 style="margin:0">Practice goal</h3><span class="sp"></span><label class="row" style="gap:6px;font-size:13.5px">Solves a day <select id="tgSel" class="in" style="width:auto">'+[10,20,30,50,100].map(function(v){ return '<option'+(v===g?' selected':'')+'>'+v+'</option>'; }).join('')+'</select></label></div>'
        +'<div class="prog" style="margin:10px 0 8px"><i style="width:'+Math.min(100,n/g*100).toFixed(1)+'%"></i></div>'
        +'<div class="row" style="gap:10px;flex-wrap:wrap;font-size:14px"><span><b>'+n+'</b> of '+g+' today</span><span class="muted">· streak <b>'+st+'</b> day'+(st===1?'':'s')+'</span><span class="sp"></span>'+(done?(claimed?'<span class="tag g">Goal reached · +50 tokens claimed</span>':'<button class="btn sm pri" id="tgClaim" type="button">Claim +50 tokens</button>'):'<span class="muted">'+(g-n)+' to go</span>')+'</div>'; }
    TV.show=function(el){ var r=to.apply(this,arguments); try{ var wrap=el.querySelector('.wrap'); if(!wrap||el.querySelector('#tGoal')) return r; var box=document.createElement('div'); box.className='pnl'; box.id='tGoal'; wrap.appendChild(box); paint();
      box.addEventListener('change',function(e){ if(e.target.id==='tgSel'){ localStorage.setItem('cw_goal',e.target.value); paint(); } });
      box.addEventListener('click',function(e){ if(e.target.id==='tgClaim'){ if(localStorage.getItem('cw_goal_c')===ds(Date.now())) return; localStorage.setItem('cw_goal_c',ds(Date.now())); try{ PL.award(50); if(PL.hud) PL.hud(); }catch(x){} CW.toast('🎯 Goal reached! +50 tokens'); paint(); } });
      var iv=setInterval(function(){ if(!document.body.contains(box)){ clearInterval(iv); return; } paint(); },2500);
    }catch(e){ console.error(e); } return r; };
  }
  /* ---------- Case of the Day (Learn guide) ---------- */
  var LV=PL.views.learn, LD=window.LEARN_DATA;
  if(LV&&LD&&!LV._d){ LV._d=1; var lo=LV.show;
    LV.show=function(el,h){ var r=lo.apply(this,arguments); try{ var hp=String(h||'').split('/'); if((hp[1]&&hp[1]!=='guide')||hp[2]) return r; var wrap=el.querySelector('.wrap'); if(!wrap||el.querySelector('#lDay')) return r;
      var day=Math.floor((Date.now()+8*3600000)/86400000), secs=['oll','pll','f2l'].filter(function(s){ return LD[s]&&LD[s].length; }), sec=secs[day%secs.length], list=LD[sec], c=list[(day*7)%list.length];
      var nav=wrap.querySelector('.lnav'), box=document.createElement('div'); box.className='pnl'; box.id='lDay';
      box.innerHTML='<div class="row" style="gap:8px;flex-wrap:wrap"><h3 style="margin:0">Case of the day</h3><span class="sp"></span><a class="btn sm pri" href="#learn/'+sec+'/'+encodeURIComponent(c.id)+'">Open the case</a></div><p style="margin:8px 0 4px;font-size:14.5px"><b>'+sec.toUpperCase()+' '+esc(String(c.id))+'</b> · same case for everyone today</p><p class="mono" style="margin:0;font-size:14px;word-break:break-word">'+esc(c.alg)+'</p><p class="muted" style="font-size:13px;margin:6px 0 0">Do it slowly ten times, then three fast. Come back tomorrow for a new one.</p>';
      wrap.insertBefore(box,nav?nav.nextSibling:wrap.children[1]||null);
    }catch(e){ console.error(e); } return r; };
  }
  /* ---------- Verdict History ---------- */
  var VV=PL.views.verdict, V=window.CWVerdict;
  if(VV&&V&&!VV._h){ VV._h=1; var vo=VV.show;
    function hist(){ var h=CW.lsJ('cw_vd_hist',[]); return Array.isArray(h)?h:[]; }
    function avg(a,i){ return a.length?a.reduce(function(s,x){ return s+(x.ph[i]?x.ph[i][1]:0); },0)/a.length:0; }
    function render(el){ var B=el.querySelector('#vdHist'); if(!B) return; var h=hist(); if(h.length<2){ B.innerHTML='<h3 style="margin:0 0 6px">Verdict history</h3><p class="muted" style="font-size:14px;margin:0">Analyse at least two solves and your move counts per step show up here.</p>'; return; }
      var rec=h.slice(0,5), old=h.slice(5,10), names=(h[0].ph||[]).map(function(p){ return p[0]; });
      B.innerHTML='<h3 style="margin:0 0 8px">Verdict history</h3><p class="muted" style="font-size:13.5px;margin:0 0 8px">Average moves per step over your last '+rec.length+' analyses'+(old.length?', compared with the '+old.length+' before':'')+'.</p><div class="vd-list">'
        +names.map(function(n,i){ var a=avg(rec,i), b=old.length?avg(old,i):null, dl=b==null?'':(a-b<=-.5?' <span style="color:#2fbf71">▼ '+(b-a).toFixed(1)+' fewer</span>':a-b>=.5?' <span style="color:#e53935">▲ '+(a-b).toFixed(1)+' more</span>':' <span class="muted">≈ same</span>'); return '<div><b>'+esc(n)+'</b><span>'+a.toFixed(1)+' moves'+dl+'</span></div>'; }).join('')
        +'<div><b>Total</b><span>'+(rec.reduce(function(s,x){ return s+x.m; },0)/rec.length).toFixed(1)+' moves</span></div></div>'
        +'<div class="row" style="margin-top:8px"><button class="btn sm" id="vdHc" type="button">Clear history</button></div>'; var c=B.querySelector('#vdHc'); if(c) c.onclick=function(){ CW.setJ('cw_vd_hist',[]); render(el); }; }
    VV.show=function(el){ var r=vo.apply(this,arguments); try{ var wrap=el.querySelector('.wrap'); if(!wrap||el.querySelector('#vdHist')) return r; var box=document.createElement('div'); box.className='pnl'; box.id='vdHist'; wrap.appendChild(box); render(el);
      var go=el.querySelector('#vdGo'); if(go){ var f=go.onclick; go.onclick=function(){ var s=$('#vdS',el).value, q=$('#vdQ',el).value, t=Math.round(parseFloat($('#vdT',el).value)*1000)||0, res=V.analyse(s,q); f.apply(this,arguments);
        if(res&&res.ok&&res.cfop){ var h=hist(), key=s.trim()+'|'+q.trim(); if(!h.length||h[0].k!==key){ h.unshift({k:key,at:Date.now(),m:res.moves,t:t,ph:res.ph.map(function(p){ return [p.n,p.m]; })}); CW.setJ('cw_vd_hist',h.slice(0,20)); } render(el); } }; }
    }catch(e){ console.error(e); } return r; };
  }
  if(/^#(timer|learn|verdict)/.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange'));
});
})();
