/* Update 3 pad skins: 12 buyable and 3 launch-week gifts. Artwork is in update3-art.js, finish effects are set here. */
(function(){
var SK=[
 {i:70,n:'Dunes',css:'linear-gradient(180deg,#ffd9a0,#e8a860 55%,#8e5429)'},
 {i:71,n:'Neon Rain',css:'linear-gradient(180deg,#0a0618,#2a0b4d)'},
 {i:72,n:'Pixel Meadow',css:'linear-gradient(180deg,#6ec6ff 60%,#3fae3f 60%)'},
 {i:73,n:'Nebula',css:'radial-gradient(circle at 40% 40%,#6a2bd6,#05030f)'},
 {i:74,n:'Coral Reef',css:'linear-gradient(180deg,#59e0e0,#0b8fb0 60%,#03405e)'},
 {i:75,n:'Blueprint',css:'linear-gradient(rgba(255,255,255,.18) 1px,transparent 1px) 0 0/22px 22px,#10408a'},
 {i:76,n:'Autumn Leaves',css:'linear-gradient(135deg,#ffcf6b,#e8782f 50%,#7a2418)'},
 {i:77,n:'Volcano',css:'linear-gradient(180deg,#1a0505,#7a1d0a 55%,#ff6a1a)'},
 {i:78,n:'Prism Glass',css:'linear-gradient(135deg,#7be0ff,#b28cff 50%,#ff8ad6)'},
 {i:79,n:'Arcade Carpet',css:'linear-gradient(135deg,#10062a,#2a0b5d)'},
 {i:80,n:'Moonlit Lake',css:'linear-gradient(180deg,#050a1e,#1b2a5c 58%,#050a1c 58%)'},
 {i:81,n:'Honeycomb',css:'linear-gradient(135deg,#ffe27a,#ffc233 50%,#e08a00)'}
];
var GIFT=[
 {i:82,n:'Update 3',css:'linear-gradient(135deg,#06122e,#14337a 50%,#0a5a6a)'},
 {i:83,n:'Starlight Cube',css:'radial-gradient(circle,#1d1450,#04030f)'},
 {i:84,n:'Platinum Edition',css:'linear-gradient(135deg,#f4f6fa,#b9c0cc 45%,#fbfcff 70%,#98a1b0)'}
];
var FS={70:['dust','meteor'],71:['rain','glitch'],72:['pixels','coins'],73:['galaxy','meteor'],74:['bubbles','waves'],75:['hex','sparkle'],76:['leaves','dust'],77:['embers','lightning'],78:['shatter','rainbow'],79:['confetti','zig'],80:['ripple','meteor'],81:['flash','hex'],82:['shock','galaxy'],83:['stars','orbit'],84:['chrome','coins']};
if(window.CW_PADFX&&CW_PADFX.fset) Object.keys(FS).forEach(function(k){ CW_PADFX.fset[k]=FS[k]; });
PL.onUpd3(function(){
  var L=PL.skins.list, has=function(i){ return L.some(function(k){ return k.i===i; }); };
  SK.forEach(function(s){ if(has(s.i)) return; L.push({i:s.i,n:s.n,ty:'forge',cost:2400,css:s.css,need:'New pad skin'}); });
  GIFT.forEach(function(s){ if(has(s.i)) return; L.push({i:s.i,n:s.n,ty:'season',cost:0,gift:1,lc:1,css:s.css,need:'Limited edition · given automatically to players online in Update 3 launch week'}); });
  try{ if(window.CW_U2ART) CW_U2ART(L); }catch(e){}
  if(/^#(garage|dash|timer)/.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange'));
});
})();
