/* Update 2 pad skins: 12 buyable (4 animated) and 3 launch-week gifts. */
(function(){
var SK=[
 {i:55,n:'Sandstone',css:'linear-gradient(180deg,#e8d3a8,#c9a96b 60%,#b08d50)'},
 {i:56,n:'Marble',css:'linear-gradient(135deg,#f4f4f6,#d9dbe2 35%,#f8f8fa 55%,#c9ccd6)'},
 {i:57,n:'Wood',css:'repeating-linear-gradient(90deg,#8b5a2b 0 14px,#7a4c22 14px 18px,#9a6733 18px 32px)'},
 {i:58,n:'Denim',css:'repeating-linear-gradient(45deg,#2d4f8a 0 3px,#264377 3px 6px)'},
 {i:59,n:'Ice',css:'linear-gradient(135deg,#d9f4ff,#8fd6f7 50%,#e9fbff)'},
 {i:60,n:'Steel Mesh',css:'repeating-linear-gradient(45deg,#2b2f36 0 3px,#3c424b 3px 6px),#2b2f36'},
 {i:61,n:'Polka Dots',css:'radial-gradient(circle,#ff6fa5 0 6px,transparent 7px) 0 0/28px 28px,#fff3f7'},
 {i:62,n:'Zigzag',css:'linear-gradient(135deg,#1f2a44 25%,transparent 25%) -14px 0/28px 28px,linear-gradient(225deg,#1f2a44 25%,transparent 25%) -14px 0/28px 28px,linear-gradient(315deg,#1f2a44 25%,transparent 25%) 0 0/28px 28px,linear-gradient(45deg,#1f2a44 25%,#f0c24b 25%) 0 0/28px 28px'},
 {i:63,n:'Snowfall',fx:1,css:'linear-gradient(180deg,#0b1d3a,#1c3d70)'},
 {i:64,n:'Fireflies',fx:1,css:'linear-gradient(180deg,#05150d,#0d2a1a)'},
 {i:65,n:'Waves',fx:1,css:'linear-gradient(180deg,#0a4a8f,#1387d6)'},
 {i:66,n:'Lightning',fx:1,css:'linear-gradient(180deg,#120a2a,#2a1a55)'}
];
var GIFT=[
 {i:67,n:'Update 2',css:'linear-gradient(135deg,#150a3a,#3a1a85 50%,#0b3b66)'},
 {i:68,n:'Cube Rain',css:'linear-gradient(180deg,#0b1030,#161a4a)'},
 {i:69,n:'Gold Edition',css:'linear-gradient(135deg,#ffe28a,#f0b429 45%,#ffd966 70%,#c98a0b)'}
];
var FX={}; SK.concat(GIFT).forEach(function(s){ if(s.fx||s.i>=67) FX[s.i]=1; });
var prev=PL.fxSkin; PL.fxSkin=function(i){ return (prev?prev(i):false)||(!!FX[i]&&!!(PL.updOn2&&PL.updOn2())); };
PL.onUpd2(function(){
  var L=PL.skins.list, has=function(i){ return L.some(function(k){ return k.i===i; }); };
  SK.forEach(function(s){ if(has(s.i)) return; var o={i:s.i,n:s.n,ty:'forge',cost:s.fx?3500:2000,css:s.css,need:'New pad skin'}; if(s.fx) o.fx=1; L.push(o); });
  GIFT.forEach(function(s){ if(has(s.i)) return; L.push({i:s.i,n:s.n,ty:'season',cost:0,gift:1,lc:1,fx:1,css:s.css,need:'Limited edition · given automatically to players online in Update 2 launch week · animated'}); });
  try{ if(window.CW_U2ART) CW_U2ART(L); }catch(e){}
  if(/^#(garage|dash|timer)/.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange'));
});
})();
