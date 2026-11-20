/* One Ask bar for all of Cuber Tools: jump anywhere, get quick answers, or ask the AI. */
(function(){
'use strict';
if(typeof CW==='undefined'||!window.PL) return;
var $=CW.$, esc=CW.esc, PL=window.PL, el=null, busy=0;
var DEST=[['timer','Timer','Solve timer, averages and graph','#timer',/timer|time|solve|average|ao5|ao12|scramble|inspection/],
 ['learn','Learn','CFOP lessons, Drill and Quiz','#learn',/learn|lesson|cfop|oll|pll|f2l|alg|drill|quiz|cross/],
 ['verdict','Solve Verdict','Analyse a solve step by step','#verdict',/verdict|analy[sz]e|review.*solve|what went wrong/],
 ['race','Cube Race','1v1 and live races','#race',/race|racing|match|1v1|versus/],
 ['dash','Cube Dash','One-tap platformer and level maker','#dash',/dash|game|platformer|level maker|jump/],
 ['garage','Garage','Cars, trails and pad skins','#garage',/garage|car|skin|trail/],
 ['clubs','Clubs','Clubs and boards','#clubs',/club|board|leaderboard/],
 ['mail','Mail','Send skins, spins and tokens','#mail',/mail|send|trade|gift a friend|give/],
 ['rewards','Rewards','Gifts, spins and levels','#rewards',/reward|gift|spin|xp|token|level|streak/],
 ['chat','Chat','Talk to other cubers','#chat',/chat|talk|friends/]];
var SHOP=/maglev|cubevault|case|shop|buy|price|shipping|ship|warranty|order|magnet|fit|colou?r|pay|deliver/;
function build(){ if(el) return; el=document.createElement('div'); el.className='askb'; el.hidden=true;
  el.innerHTML='<div class="askb-bg" data-x></div><div class="askb-box" role="dialog" aria-modal="true" aria-label="Ask"><form class="askb-f"><span class="askb-i">✦</span><input type="text" id="askbIn" placeholder="Ask anything, or jump to a tool" autocomplete="off" enterkeyhint="send" maxlength="240"><button type="button" class="askb-c" data-x aria-label="Close">✕</button></form><div class="askb-out" id="askbOut" aria-live="polite"></div></div>';
  document.body.appendChild(el);
  el.addEventListener('click',function(e){ if(e.target.closest('[data-x]')) close(); var g=e.target.closest('[data-go]'); if(g){ close(); } var s=e.target.closest('[data-q]'); if(s){ $('#askbIn',el).value=s.getAttribute('data-q'); run(s.getAttribute('data-q')); } });
  $('form',el).addEventListener('submit',function(e){ e.preventDefault(); run($('#askbIn',el).value); });
  $('#askbIn',el).addEventListener('input',function(){ hints(this.value); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!el.hidden) close(); }); }
function open(pre){ build(); el.hidden=false; document.body.classList.add('askb-on'); var i=$('#askbIn',el); i.value=pre||''; hints(i.value); setTimeout(function(){ i.focus(); },30); if(pre) run(pre); }
function close(){ if(el){ el.hidden=true; document.body.classList.remove('askb-on'); } }
function row(d){ return '<a class="askb-r" href="'+d[3]+'" data-go><b>'+esc(d[1])+'</b><small>'+esc(d[2])+'</small></a>'; }
function hints(v){ var s=(v||'').toLowerCase().trim(), out=$('#askbOut',el), h='';
  if(!s){ h='<div class="askb-h">Try</div>'+['What should I learn next?','How am I doing?','Plan my week','What is the Sune alg?'].map(function(x){ return '<button type="button" class="askb-s" data-q="'+esc(x)+'">'+esc(x)+'</button>'; }).join('')+'<div class="askb-h">Go to</div>'+DEST.slice(0,5).map(row).join(''); }
  else { var m=DEST.filter(function(d){ return d[4].test(s)||d[1].toLowerCase().indexOf(s)===0; }); if(m.length) h='<div class="askb-h">Go to</div>'+m.slice(0,4).map(row).join('')+'<div class="askb-h">Press Enter to ask</div>'; }
  out.innerHTML=h; }
async function run(q){ q=String(q||'').trim(); if(!q) return; var out=$('#askbOut',el), my=++busy;
  var s=q.toLowerCase(), h='';
  var exact=DEST.filter(function(d){ return s===d[1].toLowerCase()||s==='open '+d[1].toLowerCase()||s==='go to '+d[1].toLowerCase(); })[0];
  if(exact){ location.hash=exact[3]; close(); return; }
  if(SHOP.test(s)&&!/\b(alg|oll|pll|f2l|solve|timer|drill)\b/.test(s)){ out.innerHTML='<div class="askb-a">The shop assistant knows fit, prices, shipping and warranty for MagLev and CubeVault.</div><a class="askb-r" href="/?ask='+encodeURIComponent(q)+'"><b>Ask the shop assistant</b><small>Opens the shop with your question</small></a>'; return; }
  var r=null; try{ r=PL.cxQuick?PL.cxQuick(q):null; }catch(e){}
  var generic=r&&r.t&&/I can help with|try asking|not sure what you mean/i.test(r.t);
  if(r&&r.t&&!generic){ h='<div class="askb-a">'+esc(r.t)+'</div>'; (r.a||[]).forEach(function(a){ h+=row([0,a[0],'',a[1]]); }); (r.n||[]).slice(0,3).forEach(function(x){ h+='<button type="button" class="askb-s" data-q="'+esc(x)+'">'+esc(x)+'</button>'; }); out.innerHTML=h; return; }
  out.innerHTML='<div class="askb-a askb-th">Thinking…</div>';
  var ai=null; try{ ai=PL.cxAI?await PL.cxAI(q):null; }catch(e){}
  if(my!==busy) return;
  if(ai&&ai.text){ out.innerHTML='<div class="askb-a">'+esc(ai.text)+'</div>'; return; }
  var m=DEST.filter(function(d){ return d[4].test(s); });
  out.innerHTML='<div class="askb-a">'+esc((ai&&ai.error)||'I could not answer that.')+' Here are places that might help.</div>'+(m.length?m:DEST.slice(0,3)).slice(0,4).map(row).join(''); }
PL.ask={open:open,close:close};
document.addEventListener('keydown',function(e){ if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||'')&&!e.metaKey&&!e.ctrlKey){ e.preventDefault(); open(''); } });
})();
