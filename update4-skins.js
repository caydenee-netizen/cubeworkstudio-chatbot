/* Update 4 pad skins: 11 buyable and 3 launch-week gifts. Artwork is in update4-art.js, finish effects are set here. */
(function(){
var SK=[
 {i:86,n:'Sakura Night',css:'linear-gradient(180deg,#150a2a,#3a1646)'},
 {i:87,n:'Glacier',css:'linear-gradient(180deg,#04122a,#0d3d5c)'},
 {i:88,n:'Savanna',css:'linear-gradient(180deg,#3a0f2a,#e8562a 55%,#ffc46b)'},
 {i:89,n:'Cyber Grid',css:'linear-gradient(180deg,#020a06,#0a3a1c)'},
 {i:90,n:'Lava Lamp',css:'linear-gradient(135deg,#3a0a4a,#b01a50)'},
 {i:91,n:'Deep Forest',css:'linear-gradient(180deg,#04120e,#0b2e1f)'},
 {i:92,n:'Candy Swirl',css:'linear-gradient(135deg,#ff7ab8,#ffe27a 50%,#7be0ff)'},
 {i:93,n:'Thunder Storm',css:'linear-gradient(180deg,#0a1020,#2a3350)'},
 {i:94,n:'Zen Garden',css:'linear-gradient(135deg,#e8dcc0,#cdbd96)'},
 {i:95,n:'Retro Wave',css:'linear-gradient(180deg,#1a0536,#5a0b6a 55%,#12031f 55%)'},
 {i:96,n:'Galaxy Spiral',css:'radial-gradient(circle at 50% 50%,#4a2a9a,#05020e 70%)'}
];
var GIFT=[
 {i:97,n:'Update 4',css:'linear-gradient(135deg,#3a1608,#ff9a3d 55%,#0b0510)'},
 {i:98,n:'Ember Cube',css:'linear-gradient(180deg,#0c0405,#ff5a1a)'},
 {i:99,n:'Diamond Edition',css:'linear-gradient(135deg,#eafcff,#8fd8f0 45%,#e6f9ff 70%,#6fbfe0)'}
];
var FS={86:['sakura','dust'],87:['snow','sparkle'],88:['embers','lanterns'],89:['glitch','hex'],90:['bubbles','embers'],91:['lanterns','leaves'],92:['confetti','rainbow'],93:['lightning','rain'],94:['ripple','dust'],95:['rainbow','flash'],96:['galaxy','orbit'],97:['firework','shock'],98:['embers','meteor'],99:['shatter','sparkle']};
if(window.CW_PADFX&&CW_PADFX.fset) Object.keys(FS).forEach(function(k){ CW_PADFX.fset[k]=FS[k]; });
PL.onUpd4(function(){
  var L=PL.skins.list, has=function(i){ return L.some(function(k){ return k.i===i; }); };
  SK.forEach(function(s){ if(has(s.i)) return; L.push({i:s.i,n:s.n,ty:'forge',cost:2600,css:s.css,need:'New pad skin'}); });
  GIFT.forEach(function(s){ if(has(s.i)) return; L.push({i:s.i,n:s.n,ty:'season',cost:0,gift:1,lc:1,css:s.css,need:'Limited edition · given automatically to players online in Update 4 launch week'}); });
  try{ if(window.CW_U2ART) CW_U2ART(L); }catch(e){}
  if(/^#(garage|dash|timer)/.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange'));
});
})();
