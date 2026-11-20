/* Public chat commands. Anyone can type these in chat.
   Handled here (only you see the result): /help, /buy all, /tokens
   Sent to the server (everyone sees the result): /roll [max], /flip, /scramble, /pick a, b, c, /me <action>, /shrug */
(function(){
function esc(t){ return String(t).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
var SECS=[
 ['Everyone sees',[['/roll · /roll 6','Roll 1–100, or up to your number'],['/flip · /coin','Flip a coin'],['/dice','Roll a 6-sided die'],['/scramble','Post a random 3×3 scramble'],['/countdown 5','Count down to GO!'],['/confetti · /celebrate text','Confetti falls on everyone’s screen'],['/share','Post your last solve with its scramble'],
   ['/pick a, b, c','Pick one option at random'],['/8ball will I sub 20?','Ask the magic 8-ball'],['/rps rock','Rock paper scissors against Cuber Tools'],
   ['/pb · /ao5 · /level','Post your 3×3 best, your average of 5 or your level'],['/whois name','Show someone’s level if they are online'],['/online','How many cubers are online'],
   ['/me waves','Say what you are doing'],['/afk · /back','Say you are away or back'],['/hug name · /slap name','Hug someone, or slap them with a cube'],['/gg · /cheer','Good game, or a big cheer'],
   ['/reverse text · /big text','Post text backwards, or ｗｉｄｅ'],['/shrug · /tableflip · /unflip · /lenny','¯\\_(ツ)_/¯ · (╯°□°)╯︵ ┻━┻ · ┬─┬ノ( º _ ºノ) · ( ͡° ͜ʖ ͡°)']]],
 ['Only you see',[['/help','This list'],['/alg T · /alg oll 21 · /alg f2l 5','Show an algorithm (PLL by name, OLL and F2L by number)'],['/buy all','Buy everything in the Garage you can afford, cheapest first'],
   ['/equip skin name','Put on a pad skin you own'],['/profile','Animated profile effects for your chat picture'],['/stats','Your solves, best, average, level and tokens'],['/tokens','How many tokens you have'],['/x2','Is double tokens on right now?'],
   ['/remind 10 drink water','Remind you in 10 minutes'],['/calc 12.5*4','Quick maths'],['/ping','How fast your connection to Cuber Tools is'],['/theme','Switch light and dark mode']]],
 ['Jump to a page',[['/timer · /race · /dash · /smash · /garage','Opens that page'],['/learn · /rewards · /clubs · /mail · /3d · /home','Opens that page']]]];
function help(){ CW.sheet('<div class="hd"><h2>Chat commands</h2><button class="x" data-close aria-label="Close">✕</button></div><p class="muted" style="margin:0 0 6px">Type these in chat. Anyone can use them.</p>'
  +SECS.map(function(sc){ return '<div class="eyebrow" style="margin:14px 0 4px">'+esc(sc[0])+'</div>'+sc[1].map(function(x){ return '<div class="row" style="padding:7px 0;border-top:1px solid var(--line);align-items:flex-start;gap:12px"><code style="min-width:130px;max-width:46%;font-weight:700">'+esc(x[0])+'</code><span>'+esc(x[1])+'</span></div>'; }).join(''); }).join('')); }
function buyAll(){ if(!window.PL||!PL.buyAll){ CW.toast('Open Cuber Tools first.'); return; } var r=PL.buyAll();
  if(!r.total){ CW.toast('You already own everything you can buy. 🎉'); return; }
  var h='<div class="hd"><h2>🛒 Buy all</h2><button class="x" data-close aria-label="Close">✕</button></div>';
  if(!r.got.length) h+='<p>You could not afford anything yet. The cheapest item costs <b>'+r.left[0].cost.toLocaleString()+' tokens</b> and you have '+PL.tok().toLocaleString()+'.</p>';
  else { h+='<p>Bought <b>'+r.got.length+'</b> item'+(r.got.length===1?'':'s')+' for <b>'+r.spent.toLocaleString()+' tokens</b>. You have '+PL.tok().toLocaleString()+' left.</p>'
    +'<div style="max-height:46vh;overflow:auto;margin-top:8px">'+r.got.map(function(x){ return '<div class="row" style="padding:5px 0;border-top:1px solid var(--line)"><span>'+esc(x.n)+'</span><span class="sp"></span><small class="muted">'+({car:'Car',trail:'Trail',wing:'Wings',pad:'Pad skin'}[x.k])+' · '+x.cost.toLocaleString()+'</small></div>'; }).join('')+'</div>';
    if(r.left.length) h+='<p class="muted" style="margin-top:10px">'+r.left.length+' more to go. Earn tokens and type /buy all again.</p>'; else h+='<p style="margin-top:10px">You now own everything in the Garage. 🎉</p>'; }
  CW.sheet(h); if(r.got.length&&window.CWEggFx) try{ CWEggFx(); }catch(e){} }
window.CWCmd=function(text){ var t=String(text||'').trim(); if(t[0]!=='/') return false; var c=t.slice(1).trim().toLowerCase().replace(/\s+/g,' ');
  if(c==='help'||c==='?'||c==='commands'){ help(); return true; }
  if(c==='buy all'||c==='buyall'||c==='buy everything'){ buyAll(); return true; }
  if(c==='tokens'||c==='bal'||c==='balance'){ CW.toast('You have '+(window.PL?PL.tok():0).toLocaleString()+' tokens.'); return true; }
  var go={timer:'timer',race:'race',dash:'dash',smash:'smash',garage:'garage',learn:'learn',rewards:'rewards',clubs:'clubs',mail:'mail','3d':'cube3d',cube:'cube3d',home:''}, pg=c.replace(/^go /,'');
  if(go.hasOwnProperty(pg)){ if(window.PL&&PL.chat2&&PL.chat2.close) try{ PL.chat2.close(); }catch(e){} location.hash='#'+go[pg]; return true; }
  var raw=t.slice(1).trim(), arg=raw.replace(/^\S+\s*/,'');
  if(/^alg(\s|$)/.test(c)) { alg(arg); return true; }
  if(/^equip(\s|$)/.test(c)) { equip(arg); return true; }
  if(/^remind(\s|$)/.test(c)) { var mm=/^(\d+(?:\.\d+)?)\s*(.*)$/.exec(arg); if(!mm){ CW.toast('Use /remind 10 and what to remind you.'); return true; } var mins=Math.min(720,+mm[1]), what=mm[2]||'Your reminder'; setTimeout(function(){ try{ navigator.vibrate&&navigator.vibrate(200); }catch(e){} CW.sheet('<div class="hd"><h2>⏰ Reminder</h2><button class="x" data-close aria-label="Close">✕</button></div><p style="font-size:18px">'+esc(what)+'</p>'); },mins*60000); CW.toast('OK, I’ll remind you in '+mins+' min.'); return true; }
  if(/^calc(\s|$)/.test(c)) { var ex=arg.replace(/×/g,'*').replace(/÷/g,'/').replace(/,/g,''); if(!ex||!/^[\d+\-*/().%\s^]+$/.test(ex)){ CW.toast('Use /calc with numbers, e.g. /calc 12.5*4'); return true; } var v; try{ v=Function('"use strict";return ('+ex.replace(/\^/g,'**')+')')(); }catch(e){ v=NaN; } CW.toast(isFinite(v)?arg+' = '+(Math.round(v*1e6)/1e6).toLocaleString():'That sum does not work.'); return true; }
  if(c==='ping'){ var t0=performance.now(); Promise.resolve(window.PL&&PL.poll?PL.poll():null).then(function(){ var ms=Math.round(performance.now()-t0); CW.toast('🏓 '+ms+' ms'+(ms<150?' · fast':ms<400?' · OK':' · slow')); }); return true; }
  if(c==='profile'||c==='effects'){ if(PL.profileFx) PL.profileFx.open(); return true; }
  if(c==='theme'||c==='dark'||c==='light'){ var tb=document.querySelector('[data-theme-toggle]'); if(tb) tb.click(); return true; }
  if(c==='x2'){ var u=window.PL&&PL.x2Until?PL.x2Until():0, left=u-Date.now(); CW.toast(left>0?'Double tokens is on for '+(left>=3600000?Math.floor(left/3600000)+' h '+Math.floor(left%3600000/60000)+' min':Math.max(1,Math.ceil(left/60000))+' min')+'.':'Double tokens is off right now.'); return true; }
  if(c==='stats'){ var S=st(); CW.sheet('<div class="hd"><h2>Your stats</h2><button class="x" data-close aria-label="Close">✕</button></div>'
    +[['Solves',S.n.toLocaleString()],['3×3 best',S.pb!=null?fmt(S.pb):'–'],['3×3 average of 5',S.ao5!=null?fmt(S.ao5):'–'],['Level',S.lv],['Tokens',(window.PL?PL.tok():0).toLocaleString()]].map(function(r){ return '<div class="row" style="padding:7px 0;border-top:1px solid var(--line)"><span>'+r[0]+'</span><span class="sp"></span><b>'+esc(r[1])+'</b></div>'; }).join('')); return true; }
  return false; };
/* commands that post your own numbers as a normal chat message */
window.CWCmdText=function(text){ var t=String(text||'').trim(), c=t.slice(1).trim().toLowerCase(); if(t[0]!=='/') return null; var S;
  if(c==='pb'){ S=st(); return S.pb!=null?'⏱️ My 3×3 PB is '+fmt(S.pb):'⏱️ No 3×3 solves yet'; }
  if(c==='ao5'){ S=st(); return S.ao5!=null?'📊 My 3×3 average of 5 is '+fmt(S.ao5):'📊 Not enough 3×3 solves for an average of 5 yet'; }
  if(c==='level'||c==='lv'){ S=st(); return '⭐ I am level '+S.lv; }
  if(c==='share'){ var d=CW.lsJ('cw_timer',{})||{}, cube=d.cube||'333', L=((d.solves||{})[cube]||[]).filter(function(x){ return x&&typeof x.t==='number'; }), x=L[L.length-1]; if(!x) return '⏱️ No solves yet';
    var nm={'222':'2×2','333':'3×3','444':'4×4','555':'5×5'}[cube]||cube; return '⏱️ '+nm+' '+(x.p===2?'DNF':fmt(x.t+(x.p===1?2000:0))+(x.p===1?' (+2)':''))+(x.scr?' · '+x.scr:''); }
  return null; };
function alg(q){ var D=window.LEARN_DATA; if(!D){ CW.toast('Open Learn CFOP once, then try again.'); return; } q=String(q||'').trim(); if(!q){ CW.toast('Use /alg T, /alg oll 21 or /alg f2l 5'); return; }
  var m=/^(oll|f2l|pll)\s*#?\s*(\S+)$/i.exec(q), set=m?m[1].toLowerCase():'pll', key=(m?m[2]:q).replace(/[\s-]*perm$/i,'').replace(/[\s-]/g,''), L=D[set]||[], hit=null;
  hit=L.find(function(x){ return String(x.id).toLowerCase()===key.toLowerCase(); }); if(!hit&&set==='pll') hit=L.find(function(x){ return String(x.id).toLowerCase()===key.toLowerCase().replace(/^([a-z])$/,'$1'); });
  if(!hit){ CW.toast('No '+set.toUpperCase()+' case called "'+key+'".'+(set==='pll'?' Try T, Ua, Jb…':'')); return; }
  var name=set.toUpperCase()+' '+hit.id+(set==='pll'?' perm':'')+(hit.g&&set!=='pll'?' · '+hit.g:'');
  var sh=CW.sheet('<div class="hd"><h2>'+esc(name)+'</h2><button class="x" data-close aria-label="Close">✕</button></div><p class="mono" style="font-size:22px;font-weight:800;line-height:1.5;margin:6px 0 12px">'+esc(hit.alg)+'</p>'+(hit.alt?'<p class="muted">Also: <span class="mono">'+esc(hit.alt)+'</span></p>':'')+'<div class="row" style="gap:8px;margin-top:10px"><button class="btn" type="button" data-cp>Copy</button><button class="btn pri" type="button" data-post>Post in chat</button></div>');
  sh.querySelector('[data-cp]').onclick=function(){ try{ navigator.clipboard.writeText(hit.alg); CW.toast('Copied.'); }catch(e){} };
  sh.querySelector('[data-post]').onclick=function(){ var i=document.getElementById('c3I')||document.getElementById('cIn'); sh.close(); if(i){ i.value='📘 '+name+': '+hit.alg; var f=i.form; if(f) f.requestSubmit?f.requestSubmit():f.dispatchEvent(new Event('submit',{cancelable:true})); } }; }
function equip(q){ q=String(q||'').trim().toLowerCase(); if(!q){ CW.toast('Use /equip and a pad skin name.'); return; } var own=PL.skins.list.filter(function(s){ return s&&s.i>0&&PL.skins.has(s.i); });
  var hit=own.find(function(s){ return String(s.n).toLowerCase()===q; })||own.find(function(s){ return String(s.n).toLowerCase().indexOf(q)===0; })||own.find(function(s){ return String(s.n).toLowerCase().indexOf(q)>-1; });
  if(!hit){ var any=PL.skins.list.find(function(s){ return s&&String(s.n).toLowerCase().indexOf(q)>-1; }); CW.toast(any?'You don’t own '+any.n+' yet.':'No pad skin called "'+q+'".'); return; }
  try{ localStorage.setItem('cw_tmr_skin',String(hit.i)); }catch(e){} try{ PL.hud(); }catch(e){} CW.toast(hit.n+' equipped.'); }
function st(){ var d=CW.lsJ('cw_timer',{})||{}, sv=d.solves||{}, n=0; Object.keys(sv).forEach(function(k){ n+=(sv[k]||[]).length; });
  var L=(sv['333']||[]).filter(function(x){ return x&&typeof x.t==='number'; }), val=function(x){ return x.p===2?Infinity:x.t+(x.p===1?2000:0); }, pb=null;
  L.forEach(function(x){ var v=val(x); if(v!==Infinity&&(pb==null||v<pb)) pb=v; });
  var ao5=null; if(L.length>=5){ var l5=L.slice(-5).map(val).sort(function(a,b){ return a-b; }); if(l5[3]!==Infinity) ao5=(l5[1]+l5[2]+l5[3])/3; }
  var lv=1; try{ lv=PL.level(); if(typeof lv==='object') lv=lv.L||1; }catch(e){}
  return {n:n,pb:pb,ao5:ao5,lv:lv}; }
function fmt(ms){ var s=ms/1000; if(s<60) return s.toFixed(2); var m=Math.floor(s/60); return m+':'+(s-m*60).toFixed(2).padStart(5,'0'); }
})();
