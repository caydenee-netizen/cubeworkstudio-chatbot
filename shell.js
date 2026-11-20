/* /play app shell: side rail on desktop, bottom tab bar on phones. */
(function(){
'use strict';
if(typeof CW==='undefined'||!window.PL) return;
var $=CW.$, PL=window.PL;
var I={
 home:'<path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 timer:'<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.5M9.5 2.5h5"/>',
 learn:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20"/>',
 verdict:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5M8.5 11.5l2 2 3.5-4"/>',
 race:'<path d="M5 21V4M5 4h13l-2.5 4 2.5 4H5"/>',
 dash:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 14h5l2-4 2 4h7"/>',
 play:'<rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M8 10.5v4M6 12.5h4M16 11.2v.01M18 13.6v.01"/>',
 garage:'<path d="M3 17v-4l2.2-5.2A2 2 0 0 1 7 6.5h10a2 2 0 0 1 1.8 1.3L21 13v4z"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
 clubs:'<path d="M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6z"/>',
 rewards:'<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M12 8v13M5 13v7h14v-7M8.5 8a2.5 2.5 0 1 1 0-5c2 0 3.5 2.2 3.5 5 0-2.8 1.5-5 3.5-5a2.5 2.5 0 1 1 0 5"/>',
 more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
 ask:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
 chat:'<path d="M4 5h16v11H9l-5 4z"/>',
 shop:'<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>'
};
function svg(k){ return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+I[k]+'</svg>'; }
var RAIL=[['home','Home','#'],['timer','Timer','#timer'],['learn','Learn','#learn'],['verdict','Verdict','#verdict'],['race','Race','#race'],['dash','Dash','#dash'],['garage','Garage','#garage'],['clubs','Clubs','#clubs'],['mail','Mail','#mail'],['rewards','Rewards','#rewards']];
var TABS=[['home','Home','#'],['timer','Timer','#timer'],['learn','Learn','#learn'],['play','Play',null],['more','More',null]];
function build(){ if($('.shell-rail')) return; document.body.classList.add('has-shell');
  var r=document.createElement('nav'); r.className='shell-rail'; r.setAttribute('aria-label','Cuber Tools');
  r.innerHTML=RAIL.map(function(x){ return '<a href="'+x[2]+'" data-k="'+x[0]+'">'+svg(x[0])+'<span>'+x[1]+'</span></a>'; }).join('')+'<i class="sp"></i><button type="button" data-ask>'+svg('ask')+'<span>Ask</span></button><a href="#chat" data-k="chat">'+svg('chat')+'<span>Chat</span></a><a href="/">'+svg('shop')+'<span>Shop</span></a>';
  document.body.appendChild(r);
  var t=document.createElement('nav'); t.className='shell-tabs'; t.setAttribute('aria-label','Cuber Tools');
  t.innerHTML=TABS.map(function(x){ return x[2]!==null?'<a href="'+x[2]+'" data-k="'+x[0]+'">'+svg(x[0])+'<span>'+x[1]+'</span></a>':'<button type="button" data-k="'+x[0]+'" data-sheet="'+x[0]+'">'+svg(x[0])+'<span>'+x[1]+'</span></button>'; }).join('');
  document.body.appendChild(t);
  document.addEventListener('click',function(e){ var a=e.target.closest('[data-ask]'); if(a){ if(PL.ask) PL.ask.open(''); return; } var b=e.target.closest('[data-sheet]'); if(!b) return;
    var k=b.getAttribute('data-sheet'), items=k==='play'?[['race','Cube Race','Live races every 30 minutes','#race'],['dash','Cube Dash','One-tap platformer and level maker','#dash']]:[['verdict','Solve Verdict','Analyse a solve','#verdict'],['garage','Garage','Cars, trails and pad skins','#garage'],['clubs','Clubs','Boards and clubs','#clubs'],['mail','Mail','Send skins, spins and tokens','#mail'],['rewards','Rewards','Gifts, spins, levels','#rewards'],['chat','Chat','Talk to other cubers','#chat'],['shop','Shop magnetic cases','MagLev and CubeVault','/']];
    var sh=CW.sheet('<div class="hd"><h2>'+(k==='play'?'Play':'More')+'</h2><button class="x" data-close aria-label="Close">✕</button></div><div class="shell-sheet">'+items.map(function(x){ return '<a href="'+x[3]+'" data-go>'+svg(x[0])+'<span><b>'+x[1]+'</b><small>'+x[2]+'</small></span></a>'; }).join('')+'</div>');
    sh.addEventListener('click',function(ev){ if(ev.target.closest('[data-go]')) sh.close(); }); });
  mark(); }
function mark(){ var h=(location.hash||'').replace(/^#/,'').split('/')[0].split('?')[0]||'home', tab=({race:'play',dash:'play',verdict:'more',garage:'more',clubs:'more',mail:'more',rewards:'more',chat:'more'})[h]||h;
  [].forEach.call(document.querySelectorAll('.shell-rail [data-k]'),function(a){ a.classList.toggle('on',a.getAttribute('data-k')===h); });
  [].forEach.call(document.querySelectorAll('.shell-tabs [data-k]'),function(a){ a.classList.toggle('on',a.getAttribute('data-k')===tab); }); }
window.addEventListener('hashchange',mark);
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build); else build();
})();
