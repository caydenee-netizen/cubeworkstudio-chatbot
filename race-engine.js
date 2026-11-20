/* Cube Race engine (carried over from the old site): CubeRacer draws and runs one race on a canvas.
   /play's race screen (play.js) does the joining, lobby, results and controls. */
(function(){
'use strict';
function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){} return null; }
function sdWorn(){ return null; }
function mulberry(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return((t^t>>>14)>>>0)/4294967296; }; }
var PAL=['#f4f6f8','#fdbe18','#208e67','#3593e2','#eb402f','#f28a1e'];
var CARDEF=[
  {n:'Classic',cost:0},
  {n:'Midnight',cost:500,pal:['#1a1f26','#2c343d','#10151a','#4fd0ff','#2c343d','#7b8794']},
  {n:'Inferno',cost:600,pal:['#eb402f','#f28a1e','#b82116','#ffd36b','#eb402f','#7a1409']},
  {n:'Mint',cost:600,pal:['#c9f7e0','#3ed39a','#208e67','#f4f6f8','#7fe5bd','#14634a']},
  {n:'Gold Rush',cost:800,pal:['#ffe9a0','#fdbe18','#c8890a','#fff4cc','#e0a312','#f7d25b']},
  {n:'Sakura',cost:800,pal:['#ffd3e2','#ff8fb5','#f4f6f8','#d94f86','#ffb3cd','#fff0f5']},
  {n:'Neon',cost:1200,pal:['#00f0ff','#ff2bd6','#0b0d0f','#b6ff3c','#00f0ff','#ff2bd6']},
  {n:'Rainbow',cost:1500,rb:1},
  {n:'MagLev Hover',cost:1400,model:1,sw:['#0b0d12','#4fa3ff','#0b0d12','#c9ced8','#4fa3ff','#0b0d12']},
  {n:'CubeVault Hauler',cost:1200,model:2,sw:['#262a33','#ffb21e','#1b1d23','#c5cad3','#ffb21e','#262a33']},
  {n:'Speedcube Racer',cost:1000,model:3,sw:['#ffffff','#ffd400','#e8312a','#ff7a1a','#1f5fe0','#23a455']}
];
var TRAILDEF=[
  {n:'None',cost:0},
  {n:'Sparks',cost:400,c:['255,180,60','255,110,30'],ic:'✨'},
  {n:'Frost',cost:600,c:['190,235,255','120,200,255'],ic:'❄️'},
  {n:'Neon',cost:800,c:['0,240,255','255,43,214'],ic:'💠'},
  {n:'Gold stars',cost:1000,c:['255,222,100','255,190,30'],ic:'⭐',star:1},
  {n:'Hearts',cost:1000,c:['255,120,170','255,70,130'],ic:'💗',heart:1},
  {n:'Rainbow',cost:1500,rb:1,ic:'🌈'}
];
var WINGDEF=[{n:'Feather',cost:0,ic:'🪽'},{n:'Angel',cost:700,ic:'😇'},{n:'Bat',cost:800,ic:'🦇'},{n:'Dragon',cost:1200,ic:'🐉'},{n:'Cube',cost:1000,ic:'🧊'},{n:'Neon',cost:1500,ic:'💠'}];
function wingOwned(){ try{ var a=JSON.parse(ls('cw_wings')||'[0]'); return Array.isArray(a)?a:[0]; }catch(e){ return [0]; } }
function curWing(){ var c=+ls('cw_wing')||0; return wingOwned().indexOf(c)>=0&&WINGDEF[c]?c:0; }
function paint7(){ try{ if(!(window.PL&&PL.updOn7&&PL.updOn7())) return {}; var o=JSON.parse(ls('cw_paint7')||'{}')||{}, H=/^#[0-9a-f]{6}$/i, r={}; if(o.p&&H.test(o.p[0])&&H.test(o.p[1])) r.p=[o.p[0],o.p[1]]; if(o.u&&H.test(o.u)) r.u=o.u; return r; }catch(e){ return {}; } }
function ppal(base,fx){ var H=/^#[0-9a-f]{6}$/i; if(fx&&fx.p&&H.test(fx.p[0])&&H.test(fx.p[1])) return [fx.p[0],fx.p[1],fx.p[0],fx.p[1],fx.p[0],fx.p[1]]; return base; }
function myFx(){ var w=null; try{ w=sdWorn(); }catch(e){} var c=curWing(), p7=paint7(); return {p:p7.p,u:p7.u,w:c||(w&&w.wg)||0,a:(w&&w.g&&/^#[0-9a-f]{6}$/i.test(w.g[0])&&/^#[0-9a-f]{6}$/i.test(w.g[1]))?[w.g[0],w.g[1]]:null}; }
function trailOwned(){ try{ var a=JSON.parse(ls('cw_trails')||'[0]'); return Array.isArray(a)?a:[0]; }catch(e){ return [0]; } }
function curTrail(){ var c=+ls('cw_trail')||0; return trailOwned().indexOf(c)>=0&&TRAILDEF[c]?c:0; }
function carPal(c){ c=(c&7)+8*((c>>8)&3); var d=CARDEF[c]; if(!d||(!d.pal&&!d.rb)) return PAL; if(d.rb){ var k=Math.floor(Date.now()/220)%6; return PAL.map(function(_,i){ return PAL[(i+k)%6]; }); } return d.pal; }
function TRI(c){ c=c|0; return ((c>>3)&7)+8*((c>>10)&3); }
function carOwned(){ try{ var a=JSON.parse(ls('cw_cars')||'[0]'); return Array.isArray(a)?a:[0]; }catch(e){ return [0]; } }
function raceCar(){ var c=curCar(), d=CARDEF[c]||{}, p=d.model?0:c, t=curTrail(), m=d.model||0; return (p&7)+8*(t&7)+64*(m&3)+256*((p>>3)&3)+1024*((t>>3)&3)+4096*((m>>2)&3); }
function carModelId(c){ c=c|0; return ((c>>6)&3)+4*((c>>12)&3); }
function curCar(){ var c=+ls('cw_car')||0; return carOwned().indexOf(c)>=0&&CARDEF[c]?c:0; }
function nameHash(s){ var h=0; s=String(s||''); for(var i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return h; }
function shade(hex,f){ var n=parseInt(hex.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255; r=Math.max(0,Math.min(255,Math.round(r*f))); g=Math.max(0,Math.min(255,Math.round(g*f))); b=Math.max(0,Math.min(255,Math.round(b*f))); return 'rgb('+r+','+g+','+b+')'; }


/* ---- tiny WebAudio sfx (no files) ---- */
var AC=null, MUTE=false; try{ MUTE=localStorage.getItem('cw_mute')==='1'; }catch(e){}
function ac(){ if(AC) return AC; try{ var C=window.AudioContext||window.webkitAudioContext; if(C) AC=new C(); }catch(e){} return AC; }
function unlockAudio(){ var a=ac(); try{ if(a&&a.state==='suspended') a.resume(); }catch(e){} }
function tone(f,d,type,vol,slide,delay){ if(MUTE) return; var a=ac(); if(!a) return; try{ if(a.state==='suspended') a.resume(); var t0=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain(); o.type=type||'sine'; o.frequency.setValueAtTime(f,t0); if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t0+d); g.gain.setValueAtTime(vol||.08,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+d); o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0+d+.03); }catch(e){} }
function czLogoUrl(){ try{ var v=getComputedStyle(document.documentElement).getPropertyValue('--czlogo'); var m=/url\(["']?(.*?)["']?\)\s*$/.exec((v||'').trim()); return m?m[1]:''; }catch(e){ return ''; } }
var SFX={
  gate:function(){ tone(660,.1,'sine',.07); tone(990,.12,'sine',.07,1,.08); tone(1320,.18,'triangle',.06,1,.16); },
  solved:function(){ [523,659,784,1046,1318,1568].forEach(function(f,i){ tone(f,.22,'triangle',.07,1,i*.07); }); tone(130,.6,'sawtooth',.05,3); },
  coin:function(c){ tone(740+Math.min(c,12)*55,.11,'triangle',.07); },
  boost:function(){ tone(260,.38,'sawtooth',.05,3.2); },
  nitro:function(){ tone(180,.7,'sawtooth',.07,5); tone(520,.5,'square',.03,2.4,.05); },
  crash:function(){ tone(140,.28,'square',.09,.35); tone(70,.35,'sawtooth',.08,.5); },
  near:function(){ tone(620,.1,'triangle',.06); tone(930,.12,'triangle',.06,1,.07); },
  pass:function(){ tone(520,.09,'triangle',.07); tone(780,.09,'triangle',.07,1,.08); tone(1040,.16,'triangle',.07,1,.16); },
  wings:function(){ tone(260,.9,'sawtooth',.05,4); [523,659,784,1046,1318,1568].forEach(function(f,i){ tone(f,.3,'triangle',.06,1,.15+i*.07); }); tone(90,.5,'sine',.1,.4); },
  skyhit:function(){ tone(120,.4,'sawtooth',.08,.4); tone(260,.2,'square',.04,.5); },
  jump:function(){ tone(330,.28,'triangle',.07,2.6); tone(660,.2,'sine',.04,2,.06); },
  land:function(){ tone(110,.16,'sine',.1,.4); },
  trick:function(){ [523,659,784,1046,1318].forEach(function(f,i){ tone(f,.18,'triangle',.07,1,i*.05); }); tone(110,.22,'sine',.1,.4); },
  phase:function(){ tone(900,.5,'sine',.05,.4); tone(1350,.4,'triangle',.03,.5,.05); },
  over:function(){ tone(140,.9,'sawtooth',.07,6); tone(560,.6,'square',.03,3,.05); tone(1120,.4,'triangle',.03,1.5,.1); },
  charge:function(){ [392,523,659,784,1046].forEach(function(f,i){ tone(f,.14,'triangle',.06,1,i*.045); }); },
  thunder:function(){ tone(60,1,'sawtooth',.07,.5); tone(42,1.2,'sine',.09,.6,.05); },
  beep:function(){ tone(440,.16,'square',.05); },
  go:function(){ tone(880,.4,'square',.06); },
  fin:function(){ [523,659,784,1046].forEach(function(f,i){ tone(f,.22,'triangle',.08,1,i*.1); }); }
};
function CubeRacer(cv,o){
  var ctx=cv.getContext('2d'), W=cv.width=960, H=cv.height=540, HOR=Math.round(H*0.40);
  var SEG=200, ROADW=2000, CAMH=1000, CAMD=0.84, NEAR=CAMH*CAMD, DRAW=105, N=({s:1400,n:2200,l:3400})[o.len]||2200, TL=N*SEG;
  var MAXV=SEG*60, ACC=MAXV/5, OFFDEC=MAXV/2.2, OFFLIM=MAXV/3.2, CENT=0.3, CARW=450;
  /* ---- track from the shared seed: every racer drives the same road ---- */
  var rnd=mulberry(o.seed), segs=[], i=0, k;
  while(i<N){
    var len=45+Math.floor(rnd()*70), c=rnd()<.3?0:(rnd()<.5?-1:1)*(1+Math.floor(rnd()*3));
    if(i<60) c=0;
    for(k=0;k<len&&i<N;k++,i++) segs.push({curve:c*Math.sin(Math.PI*k/len),sc:null,ob:null});
  }
  var END={curve:0,sc:null,ob:null};
  /* ---- weather: picked from the seed, so every racer in a room (and everyone on the daily track) sees the same sky ---- */
  var THEMES={
    sunset:{n:'Sunset',ic:'🌅',sky:['#0a0c0f','#1d2a38','#7a4a2c','#f08a3a'],sun:'255,214,140',mt:['#161c24','#10151b'],g0:'#14181c',g1:'#171c20',g2:'#1c2227',r1:'#3d444b',r2:'#363c42',fog:'122,74,44'},
    night:{n:'Night',ic:'🌙',sky:['#02030a','#070d24','#101a3f','#1d2b5e'],moon:1,stars:1,mt:['#0a0e1c','#070a14'],g0:'#080b11',g1:'#0b0f16',g2:'#0e131b',r1:'#2a3038',r2:'#242a31',fog:'8,14,40',tint:'4,8,30,.22',lights:1},
    rain:{n:'Rain',ic:'🌧️',sky:['#10151c','#2a343f','#4a5866','#6e7c89'],clouds:1,mt:['#27313b','#1d252d'],g0:'#12171b',g1:'#141a1f',g2:'#181e24',r1:'#2d343b',r2:'#282f36',fog:'78,92,104',tint:'20,30,45,.12',rain:1,wet:1},
    desert:{n:'Desert',ic:'🏜️',tree:'cactus',sky:['#3f6fa8','#8fb4d6','#f2cf9a','#ffd9a0'],sun:'255,236,170',mt:['#c98d5a','#a8703f'],g0:'#d9ad72',g1:'#d2a366',g2:'#dfb77c',r1:'#5a5048',r2:'#51483f',fog:'240,205,150',tint:'255,200,120,.06'},
    neon:{n:'Neon City',ic:'🌃',tree:'pylon',sky:['#07031a','#1a0836','#4a0f5e','#c2307a'],stars:1,mt:['#240a45','#180630'],g0:'#0a0618',g1:'#0e0820',g2:'#120a28',r1:'#1c1430',r2:'#171028',fog:'90,20,110',tint:'60,0,90,.12',lights:1,wet:1},
    beach:{n:'Beach',ic:'🏝️',tree:'palm',sky:['#1b7fd1','#4fb3ec','#9fdcf5','#e8f8ff'],sun:'255,244,190',mt:['#2f9c8f','#23796f'],g0:'#e8d7a4',g1:'#e2cf98',g2:'#eddcae',r1:'#6a6258',r2:'#615a50',fog:'210,240,250'},
    volcano:{n:'Volcano',ic:'🌋',tree:'spire',ember:1,emberC:'255,140,40',sky:['#0b0306','#2a0a0a','#6a1a0a','#d4561a'],clouds:1,mt:['#2a0f0c','#1a0807'],g0:'#140807',g1:'#1b0b09',g2:'#220e0b',r1:'#2b2220',r2:'#241c1a',fog:'110,30,10',tint:'80,10,0,.14'},
    aurora:{n:'Aurora',ic:'🌌',tree:'crystal',aurora:1,sky:['#020a14','#06202e','#0b3a46','#16607a'],stars:1,mt:['#173a52','#0e2638'],g0:'#b9d6e6',g1:'#adcddf',g2:'#c4dde9',r1:'#46586a',r2:'#3e5062',fog:'40,110,140',tint:'0,60,90,.10',lights:1},
    space:{n:'Space',ic:'🪐',tree:'rock',planet:1,stars:1,sky:['#000005','#05051a','#0b0b2e','#171045'],mt:['#2a2a3c','#1a1a28'],g0:'#2b2b36',g1:'#30303c',g2:'#363642',r1:'#4a4a58',r2:'#42424f',fog:'30,20,70',tint:'10,0,40,.10'},
    sakura:{n:'Cherry Blossom',ic:'🌸',snow:1,mote:'255,190,215',sky:['#6a8fd0','#b9a7e0','#f2b7d2','#ffe3ea'],sun:'255,236,214',sunA:.8,mt:['#c9a0c4','#a77fa6'],g0:'#e9b6c8',g1:'#e2a9bd',g2:'#f0c3d2',r1:'#6a5a66',r2:'#61525d',fog:'250,205,225',tint:'255,170,200,.07'},
    glacier:{n:'Glacier',ic:'🧊',tree:'crystal',snow:1,sky:['#14304d','#2f6b99','#8cc7e6','#e6f7ff'],sun:'235,248,255',sunA:.5,mt:['#9fd1ea','#6fb2d6'],g0:'#dff2fb',g1:'#d1ebf7',g2:'#e8f6fc',r1:'#5a7284',r2:'#51697b',fog:'200,232,248',tint:'80,170,230,.08'},
    autumn:{n:'Autumn',ic:'🍂',ember:1,emberC:'255,170,60',mote:'255,170,70',sky:['#3a2a5c','#a8503a','#e58a3c','#ffd88a'],sun:'255,200,120',sunA:.9,mt:['#7a3a1e','#5a2a16'],g0:'#a8612c',g1:'#9c5726',g2:'#b8703a',r1:'#4e4036',r2:'#45382f',fog:'240,170,90',tint:'255,140,40,.08'},
    cubingzone:{n:'The Cubing Zone',ic:'🎥',tree:'zone',stars:1,lights:1,wet:1,sky:['#02060c','#06202a','#0a3e46','#1fb3ad'],mt:['#0c2a36','#071a24'],g0:'#060f18',g1:'#08141f',g2:'#0b1a27',r1:'#0f2230',r2:'#0c1b28',fog:'20,120,120',tint:'0,70,80,.12'},
    halloween:{n:'Halloween',ic:'🎃',tree:'dead',ember:1,emberC:'255,120,20',sky:['#06020e','#180628','#3b0f4a','#7a2a18'],sun:'255,140,40',sunA:.6,stars:1,mt:['#1a0a2a','#10061c'],g0:'#0b0612',g1:'#0f0818',g2:'#140a1e',r1:'#2a2230',r2:'#231c29',fog:'60,16,70',tint:'40,0,60,.16',lights:1},
    jungle:{n:'Jungle',ic:'🌴',tree:'palm',mote:'200,255,170',sky:['#0b2a1a','#1f5a35','#5fa45a','#cfe9a0'],sun:'255,250,200',sunA:.6,clouds:1,mt:['#1d4a2c','#143a22'],g0:'#1f4a24',g1:'#24532a',g2:'#2b5e31',r1:'#4a4438',r2:'#423d32',fog:'120,170,110',tint:'20,80,30,.10'},
    deepsea:{n:'Deep Sea',ic:'🐠',tree:'crystal',snow:1,mote:'170,230,255',sky:['#010814','#03203a','#0a4a6e','#1c88a8'],mt:['#06304a','#042236'],g0:'#0a2a3c',g1:'#0c3044',g2:'#0f364c',r1:'#264a5e',r2:'#214254',fog:'10,80,120',tint:'0,60,110,.18',lights:1},
    canyon:{n:'Red Canyon',ic:'🏜️',tree:'rock',sky:['#2a1a3a','#8a3a2a','#e0763a','#ffc27a'],sun:'255,210,150',sunA:.9,mt:['#8a3a1c','#6a2a12'],g0:'#a8502a',g1:'#9c4824',g2:'#b85a30',r1:'#4e3a30',r2:'#45332a',fog:'230,140,90',tint:'200,90,40,.08'},
    snow:{n:'Snow',ic:'❄️',sky:['#7f95ad','#a9bccd','#d3dfea','#f1f6fa'],sun:'255,255,255',sunA:.55,mt:['#c9d6e2','#aebfcf'],g0:'#e3ebf2',g1:'#dbe5ee',g2:'#e9f0f6',r1:'#6d7780',r2:'#646e77',fog:'225,234,242',snow:1}
  };
  var wr=mulberry(((o.seed|0)^0x5bd1e995)>>>0)(), WXK=(o.weather||window.CW_FORCE_WX)&&THEMES[o.weather||window.CW_FORCE_WX]?(o.weather||window.CW_FORCE_WX):(wr<.1?'sunset':wr<.2?'night':wr<.3?'rain':wr<.4?'snow':wr<.5?'desert':wr<.6?'neon':wr<.7?'beach':wr<.8?'volcano':wr<.9?'aurora':'space'), T=THEMES[WXK]; if(!(o.weather||window.CW_FORCE_WX)&&window.PL&&PL.updOn8&&PL.updOn8()){ var w8=mulberry(((o.seed|0)^0x1badb002)>>>0)(); if(w8<.3){ WXK=['jungle','deepsea','canyon'][Math.floor(w8/.1)]; T=THEMES[WXK]; } }
  var wxp=[], wxT=0; (function(){ var r=mulberry(77), n=T.snow?130:T.rain?120:T.ember?90:0; for(var q=0;q<n;q++) wxp.push({x:r()*W,y:r()*H,v:.6+r()*.8,ph:r()*6.28,r:1+r()*2.2}); })();
  var stars=[]; (function(){ var r=mulberry(99); for(var q=0;q<70;q++) stars.push({x:r()*W,y:r()*HOR*.85,s:.8+r()*1.6,p:r()*6.28}); })();
  for(i=8;i<N;i+=5){ var sd=rnd()<.5?-1:1; segs[i].sc={x:sd*(1.35+rnd()*1.3),t:rnd()<.45?0:1,h:(nameHash(i+''))%6}; }
  for(i=70;i<N-30;i+=32+Math.floor(rnd()*38)){ var isB=rnd()<.38; segs[i].ob={type:isB?'boost':'block',x:-0.75+rnd()*1.5,done:false}; }
  for(i=40;i<N-40;i+=70+Math.floor(rnd()*60)){ var cx0=-0.7+rnd()*1.4, cdr=(rnd()<.5?-1:1)*0.07*rnd(); for(k=1;k<=7;k++){ if(segs[i+k].ob) continue; segs[i+k].cn={x:Math.max(-.85,Math.min(.85,cx0+cdr*k)),done:false}; } }
  var PUK=['shield','magnet','burst'];
  (function(){ var pr=mulberry(((o.seed|0)^0x7e57c0de)>>>0), q; for(q=95;q<N-50;q+=85+Math.floor(pr()*60)){ var ty=PUK[Math.floor(pr()*3)], px=-.7+pr()*1.4; if(segs[q].ob||segs[q].cn) continue; segs[q].pu={type:ty,x:px,done:false}; } })();
  (function(){ var r3=mulberry(((o.seed|0)^0x3a9c1f77)>>>0), q, bad, d;
    for(q=120;q<N-60;q+=150+Math.floor(r3()*110)){ var rx=-.5+r3()*1.0; bad=false; for(d=-2;d<=2;d++){ var sg0=segs[q+d]; if(sg0&&(sg0.ob||sg0.cn||sg0.pu)) bad=true; } if(bad) continue; segs[q].rp={x:rx,done:false}; }
    var r4=mulberry(((o.seed|0)^0x51a7e2d9)>>>0), NPK=['phase','over','charge'];
    for(q=135;q<N-50;q+=120+Math.floor(r4()*80)){ var ty2=NPK[Math.floor(r4()*3)], px2=-.7+r4()*1.4; bad=false; for(d=-2;d<=2;d++){ var sg1=segs[q+d]; if(sg1&&(sg1.ob||sg1.cn||sg1.pu||sg1.rp)) bad=true; } if(bad) continue; segs[q].pu={type:ty2,x:px2,done:false}; } })();
  (function(){ if(o.dn==null||o.dn===1) return; var rd=mulberry(((o.seed|0)^0x5eed0d1e)>>>0), q;
    if(o.dn===0){ for(q=0;q<N;q++){ var g0=segs[q]; if(g0.ob&&g0.ob.type==='block'&&rd()<.45) delete g0.ob; } }
    else { for(q=60;q<N-30;q+=12+Math.floor(rd()*10)){ var g1=segs[q]; if(g1.ob||g1.cn||g1.pu||g1.rp) continue; g1.ob={type:'block',x:-.8+rd()*1.6,done:false}; } } })();
  (function(){ var r5=mulberry(((o.seed|0)^0x77aa13b1)>>>0), SKB=o.dn===2?15:o.dn===0?38:24, SKR=o.dn===2?16:o.dn===0?34:28, TY=['cloud','drone','meteor','ring','ring','cloud','drone'], q;
    for(q=Math.floor(N/2)+110;q<N-35;q+=SKB+Math.floor(r5()*SKR)){ var ty=TY[Math.floor(r5()*TY.length)], sx=-.85+r5()*1.7; if(segs[q].pu||segs[q].cn) continue; segs[q].sk={type:ty,x0:sx,x:sx,h:r5()<.5?0:1,done:false}; } })();
  /* storm front (62-84%) with telegraphed bolts + golden rings, then the boss volleys (88-96%) */
  (function(){ var r6=mulberry(((o.seed|0)^0x2c9f41b3)>>>0), q, k=0, SZ0=Math.floor(N*.62), SZ1=Math.floor(N*.84), XS=[-.75,-.25,.25,.75];
    BZ0=Math.floor(N*.885); BZ1=Math.floor(N*.96);
    for(q=BZ0-8;q<N;q++){ if(segs[q]&&segs[q].sk) delete segs[q].sk; }
    for(q=SZ0;q<SZ1;q+=9+Math.floor(r6()*9)){ if(segs[q].sk||segs[q].pu||segs[q].cn) continue; var t6=r6(); if(t6<.5) segs[q].sk={type:'bolt',x0:-.8+r6()*1.6,x:0,h:.5,done:false}; else segs[q].sk={type:'ring',sr:1,x0:-.8+r6()*1.6,x:0,h:r6()<.5?0:1,done:false}; }
    for(q=BZ0;q<BZ1;q+=13+Math.floor(r6()*4),k++){ var pat=k%3, g=Math.floor(r6()*4), L=[]; XS.forEach(function(x,i){ if(pat===0){ if(i!==g) L.push({x:x,h:r6()<.5?0:1,done:false}); } else L.push({x:x,h:pat===1?1:0,done:false}); }); segs[q].bs=L; segs[q].bp=pat; } })();
  (function(){ var r8=mulberry(((o.seed|0)^0x6e1c9a07)>>>0), q, a8=Math.floor(N*.5)+70, b8=Math.floor(N*.86);
    for(q=a8;q<b8;q+=20+Math.floor(r8()*18)){ var gx=-.8+r8()*1.6, gh=r8()<.5?0:1; if(segs[q].sk||segs[q].pu||segs[q].cn) continue; segs[q].sk={type:'crate',x0:gx,x:0,h:gh,done:false}; } })();
  function segAt(ix){ return ix>=N?END:segs[ix]; }
  /* ---- state ---- */
  var S={pos:0,px:0,speed:0,boostT:0,shake:0,flash:0,flashC:'',finished:false,finishAt:0,bg:0,steer:0,t:0,hits:0,boosts:0,last:0,nitro:0,drift:0,slip:0,slipOn:false,coins:0,shield:0,magT:0,pu:0,combo:0,comboT:0,near:0,gate:0,czStk:0,czSolved:0,gateFlash:0,pops:[],parts:[],rank:0,lastRank:0,bestCombo:0,fl:[]};
  S.air=0;S.airT=0;S.airDur=.7;S.spin=0;S.landK=0;S.squash=0;S.phaseT=0;S.odT=0;S.rankPulse=0;S.tricks=0;S.hops=0;S.bolt=0;S.ltT=3+Math.random()*5;S.boltX=0;S.chg=0;S.echo=[];S.flyOn=false;S.fly=0;S.wing=0;S.tfT=0;S.rings=0;S.ay=.5;S.ammo=0;S.fireT=0;S.mis=null;S.inc=null;S.wfSeen={};S.botT=null;S.stm=0;S.stL=2;S.bossHits=0;S.stRings=0;S.lndT=0;S.landed=false;S.slideT=0;S.bossDead=0;var NOSH=false,altT=0,BZ0=0,BZ1=0,MYFX=(o.fxMine&&o.fxMine())||{w:0,a:null};
  /* =================== VFX PRO: bloom, god rays, volumetric fog, lamps, aura ribbons, colour grade, lens flare =================== */
  var GFX=(ls('cw_gfx')==='low')?0:2, gfxAcc=0, gfxN=0;
  function mk(w,h){ var c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
  var bc1=mk(240,135), bx1=bc1.getContext('2d'), bc3=mk(240,135), bx3=bc3.getContext('2d'), bc2=mk(96,54), bx2=bc2.getContext('2d'), bc4=mk(480,270), bx4=bc4.getContext('2d');
  var LAMPC={sunset:'255,170,80',night:'150,190,255',rain:'255,200,130',desert:'255,190,110',neon:'255,70,190',beach:'255,230,160',volcano:'255,110,40',aurora:'120,255,220',space:'140,160,255',cubingzone:'39,230,220',halloween:'255,140,30',snow:'255,240,210'};
  var GRADE={sunset:['255,150,70','30,20,60'],night:['90,120,255','5,8,30'],rain:['120,150,190','10,16,30'],desert:['255,190,100','60,30,20'],neon:['255,70,200','20,0,50'],beach:['255,230,170','20,70,110'],volcano:['255,100,40','30,0,0'],aurora:['90,255,200','5,20,50'],space:['150,120,255','5,5,30'],cubingzone:['39,230,220','0,20,30'],halloween:['255,120,30','30,0,50'],snow:['230,240,255','60,80,120']};
  var motes=[]; (function(){ var r=mulberry(4242),q; for(q=0;q<70;q++) motes.push({x:r()*W,y:r()*H,z:.3+r()*.9,vx:(r()-.5)*14,vy:-4-r()*12,ph:r()*6.28}); })();
  function govern(el){ if(GFX<=0) return; gfxAcc+=el; gfxN++; if(gfxN>=50){ var avg=gfxAcc/gfxN; gfxAcc=0; gfxN=0; if(avg>.047) GFX=Math.max(0,GFX-1); } }
  function proRays(now){
    var lx,ly,col,I; if(T.sun){ lx=W*.7+S.bg*.2; ly=HOR-20; col=T.sun; I=T.sunA||1; } else if(T.moon){ lx=W*.72+S.bg*.1; ly=70; col='200,220,255'; I=.7; } else { lx=W*.5; ly=-30; col=(LAMPC[WXK]||'255,230,200'); I=.45; }
    if(lx<-W*.4||lx>W*1.4) return;
    var g=ctx.createRadialGradient(lx,ly,10,lx,ly,H*1.2); g.addColorStop(0,'rgba('+col+','+(.2*I)+')'); g.addColorStop(1,'rgba('+col+',0)'); ctx.fillStyle=g;
    for(var i=0;i<16;i++){ var ang=i*.3927+now/11000+Math.sin(now/2600+i)*.04, w=.05+.035*Math.sin(now/1900+i*1.7); ctx.globalAlpha=.55+.45*Math.sin(now/1400+i*2.3); ctx.beginPath(); ctx.moveTo(lx,ly); ctx.arc(lx,ly,H*1.2,ang,ang+w); ctx.closePath(); ctx.fill(); }
    ctx.globalAlpha=1;
  }
  function proScene(now){
    if(GFX<1) return; var spw=sprScale(), od=S.odT>0, bo=S.boostT>0, ph=S.phaseT>0, fg=T.fog;
    ctx.save();
    /* volumetric fog banks drifting along the horizon */
    for(var m=0;m<7;m++){ var fx=(((m*190+now*.012*(1+m%3)+S.bg*.05)%(W+500))+(W+500))%(W+500)-250, fy=HOR+(m%4)*16-6; ctx.fillStyle='rgba('+fg+','+(.07+.02*(m%3))+')'; ctx.beginPath(); ctx.ellipse(fx,fy,150+m*14,18+(m%3)*8,0,0,7); ctx.fill(); }
    ctx.globalCompositeOperation='lighter'; proRays(now);
    /* floating dust / pollen / ash with parallax */
    var spd=S.speed/MAXV, mc=T.mote||((T.snow||T.rain)?'220,235,255':(LAMPC[WXK]||'255,230,190')), nm=GFX>1?motes.length:30;
    for(var i=0;i<nm;i++){ var q=motes[i], mx=(((q.x+now*.001*q.vx-S.bg*.03*q.z+spd*now*.02*q.z*(q.x>W/2?1:-1))%W)+W)%W, my=(((q.y+now*.001*q.vy*q.z)%H)+H)%H, tw=.35+.65*Math.abs(Math.sin(now/600+q.ph)), r=1+q.z*2.4;
      var gm=ctx.createRadialGradient(mx,my,0,mx,my,r*3.2); gm.addColorStop(0,'rgba('+mc+','+(.7*tw*q.z)+')'); gm.addColorStop(1,'rgba('+mc+',0)'); ctx.fillStyle=gm; ctx.fillRect(mx-r*3.2,my-r*3.2,r*6.4,r*6.4); }
    /* light pooled on the road beneath the car (underglow) */
    var gy0=H-14, col=od?'224,139,255':ph?'120,245,255':bo?'110,200,255':'255,170,80', a=.3+(bo?.25:0)+(od?.25:0)+(S.air>0?-.12:0);
    var gl=ctx.createRadialGradient(W/2,gy0,2,W/2,gy0,spw*1.05); gl.addColorStop(0,'rgba('+col+','+a+')'); gl.addColorStop(1,'rgba('+col+',0)');
    ctx.translate(W/2,gy0); ctx.scale(1,.28); ctx.translate(-W/2,-gy0); ctx.fillStyle=gl; ctx.fillRect(W/2-spw*1.1,gy0-spw*1.1,spw*2.2,spw*2.2);
    ctx.restore();
  }
  function proLamp(sc,sx,gy,s){
    if(GFX<1||sc.t===0||sc.h%3!==0) return; var tw=s*(W/2)*520; if(tw<6) return; var c=LAMPC[WXK]||'255,200,120'; if(WXK==='neon'&&sc.h%2) c='60,230,255';
    var ly=gy-tw*1.2, r=tw*(.8+.12*Math.sin(Date.now()/330+sc.h)), g=ctx.createRadialGradient(sx,ly,1,sx,ly,r);
    g.addColorStop(0,'rgba(255,255,255,.95)'); g.addColorStop(.12,'rgba('+c+',.8)'); g.addColorStop(.45,'rgba('+c+',.22)'); g.addColorStop(1,'rgba('+c+',0)');
    ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle=g; ctx.fillRect(sx-r,ly-r,r*2,r*2);
    var wg=ctx.createRadialGradient(sx,gy,1,sx,gy,r*1.5); wg.addColorStop(0,'rgba('+c+',.28)'); wg.addColorStop(1,'rgba('+c+',0)'); ctx.translate(sx,gy); ctx.scale(1,.25); ctx.translate(-sx,-gy); ctx.fillStyle=wg; ctx.fillRect(sx-r*1.5,gy-r*1.5,r*3,r*3); ctx.restore();
  }
  function proCar(now,cy0,spw){
    if(GFX<1) return; var spd=S.speed/MAXV, od=S.odT>0, bo=S.boostT>0, ph=S.phaseT>0;
    var col=od?'224,139,255':ph?'120,245,255':bo?'120,205,255':'255,170,70', col2=od?'255,110,220':bo||ph?'255,255,255':'255,90,40', a=Math.min(1,.3+spd*.5+(bo?.3:0)+(od?.4:0));
    ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.lineCap='round';
    for(var sd=-1;sd<=1;sd+=2){ var x0=W/2+sd*spw*.37, y0=cy0-spw*.25;
      for(var k=0;k<3;k++){ var phs=now/(190+k*70)+sd*1.7+k*2.1, len=spw*(.55+spd*.9+(bo?.45:0)+(od?.4:0))*(1-k*.17),
          ex=x0+sd*(spw*(.3+k*.2)+Math.sin(phs)*spw*.13), ey=y0+len*.95, qx=x0+sd*spw*.1+Math.sin(phs*1.3)*spw*.1, qy=y0+len*.35;
        var gr=ctx.createLinearGradient(x0,y0,ex,ey); gr.addColorStop(0,'rgba('+col2+','+(a*.95)+')'); gr.addColorStop(.35,'rgba('+col+','+(a*.7)+')'); gr.addColorStop(1,'rgba('+col+',0)');
        ctx.strokeStyle=gr; ctx.lineWidth=Math.max(2,(7-k*1.8)*(spw/280+.45)); ctx.beginPath(); ctx.moveTo(x0,y0); ctx.quadraticCurveTo(qx,qy,ex,ey); ctx.stroke(); } }
    /* orbiting energy motes around the car */
    var n=(bo||od)?16:7, cx=W/2, cyy=cy0-spw*.5;
    for(var i=0;i<n;i++){ var an=now/(od?240:420)+i*6.2832/n, z=Math.sin(an), px=cx+Math.cos(an)*spw*(.6+.06*Math.sin(now/200+i)), py=cyy+z*spw*.3-Math.abs(Math.cos(an))*spw*.12, r=(3+3*(z+1)/2)*(spw/300+.5);
      var gm=ctx.createRadialGradient(px,py,0,px,py,r*3); gm.addColorStop(0,'rgba(255,255,255,'+(.9*a)+')'); gm.addColorStop(.3,'rgba('+col+','+(.6*a)+')'); gm.addColorStop(1,'rgba('+col+',0)'); ctx.fillStyle=gm; ctx.fillRect(px-r*3,py-r*3,r*6,r*6); }
    /* soft aura halo on the car body while boosting */
    if(bo||od||ph){ var ag=ctx.createRadialGradient(cx,cyy,spw*.2,cx,cyy,spw*1.15); ag.addColorStop(0,'rgba('+col+','+(.0)+')'); ag.addColorStop(.7,'rgba('+col+','+(.12+.08*Math.sin(now/90))+')'); ag.addColorStop(1,'rgba('+col+',0)'); ctx.fillStyle=ag; ctx.fillRect(cx-spw*1.3,cyy-spw*1.3,spw*2.6,spw*2.6); }
    ctx.restore();
  }
  function proPost(now){
    if(GFX<1) return; var gd=GRADE[WXK]||['255,200,140','10,14,40'], bo=S.boostT>0||S.odT>0, spd=S.speed/MAXV;
    /* radial zoom blur at the screen edges when going fast */
    if(GFX>1&&(bo||spd>1.05)){ bx4.globalCompositeOperation='source-over'; bx4.clearRect(0,0,480,270); bx4.drawImage(cv,0,0,480,270); bx4.globalCompositeOperation='destination-out'; var mg=bx4.createRadialGradient(240,150,40,240,150,250); mg.addColorStop(0,'rgba(0,0,0,1)'); mg.addColorStop(1,'rgba(0,0,0,0)'); bx4.fillStyle=mg; bx4.fillRect(0,0,480,270);
      ctx.save(); ctx.globalAlpha=.5; ctx.drawImage(bc4,-W*.035,-H*.035,W*1.07,H*1.07); ctx.restore(); }
    /* bloom: downsample, square it (keeps only the bright parts), blur by upscaling */
    bx1.globalCompositeOperation='source-over'; bx1.drawImage(cv,0,0,240,135); bx3.globalCompositeOperation='source-over'; bx3.drawImage(bc1,0,0); bx1.globalCompositeOperation='multiply'; bx1.drawImage(bc3,0,0); bx1.drawImage(bc3,0,0);
    bx2.globalCompositeOperation='source-over'; bx2.drawImage(bc1,0,0,96,54);
    var k=(T.lights||T.ember||T.stars)?1.25:1;
    ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.imageSmoothingEnabled=true; var bl=S.flyOn?.6:1; ctx.globalAlpha=Math.min(.4,.17*k*(bo?1.2:1))*bl; ctx.drawImage(bc1,0,0,W,H); ctx.globalAlpha=Math.min(.4,.2*k*(bo?1.2:1))*bl; ctx.drawImage(bc2,-12,-8,W+24,H+16); ctx.restore();
    /* sun / moon lens flare: anamorphic streak + ghosts */
    if(GFX>1&&(T.sun||T.moon)){ var fx=T.sun?W*.7+S.bg*.2:W*.72+S.bg*.1, fy=T.sun?HOR-20:70; if(fx>-80&&fx<W+80){ var fc=T.sun||'200,220,255', fa=(T.sunA||1)*(T.moon?.5:1);
        ctx.save(); ctx.globalCompositeOperation='lighter'; var sg=ctx.createLinearGradient(fx-W*.45,0,fx+W*.45,0); sg.addColorStop(0,'rgba('+fc+',0)'); sg.addColorStop(.5,'rgba('+fc+','+(.5*fa)+')'); sg.addColorStop(1,'rgba('+fc+',0)'); ctx.fillStyle=sg; ctx.fillRect(fx-W*.45,fy-2.5,W*.9,5);
        [[.35,26,.10],[.62,14,.12],[.9,40,.06],[1.25,18,.09]].forEach(function(q){ var gx=fx+(W/2-fx)*q[0]*1.0, gy=fy+(H*.55-fy)*q[0], gr=ctx.createRadialGradient(gx,gy,0,gx,gy,q[1]); gr.addColorStop(0,'rgba('+fc+','+(q[2]*fa*1.6)+')'); gr.addColorStop(.8,'rgba('+fc+','+(q[2]*fa)+')'); gr.addColorStop(1,'rgba('+fc+',0)'); ctx.fillStyle=gr; ctx.fillRect(gx-q[1],gy-q[1],q[1]*2,q[1]*2); });
        ctx.restore(); } }
    /* colour grade: warm highlights, cool shadows, then a soft vignette */
    ctx.save(); ctx.globalCompositeOperation='soft-light'; var cg=ctx.createLinearGradient(0,0,0,H); cg.addColorStop(0,'rgba('+gd[0]+',.55)'); cg.addColorStop(.55,'rgba('+gd[0]+',.0)'); cg.addColorStop(1,'rgba('+gd[1]+',.6)'); ctx.fillStyle=cg; ctx.fillRect(0,0,W,H); ctx.restore();
    var vg=ctx.createRadialGradient(W/2,H*.52,H*.42,W/2,H*.52,H*1.0); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,10,.42)'); ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
  }

  var rec={p:[],x:[],n:0}, gh=o.ghost&&o.ghost.p&&o.ghost.p.length>7?o.ghost:null;
  function ghostAt(t){ var f=Math.max(0,t)/(gh.i||500), i0=Math.floor(f), k=f-i0, n=gh.p.length-1; if(i0>=n) return [gh.p[n],gh.x[n]]; return [gh.p[i0]+(gh.p[i0+1]-gh.p[i0])*k, gh.x[i0]+(gh.x[i0+1]-gh.x[i0])*k]; }
  var keys={l:0,r:0}, touch=0, others={}, destroyed=false, raf=0;
  var forge=!!o.forge, myHash=nameHash(o.name), eng=null, lastBeep=-1, goPlayed=false, finSfx=false;
  function pop(t,c){ S.pops.push({t:t,c:c||'#fff',l:1.2}); if(S.pops.length>3) S.pops.shift(); }
  function spark(x,y,vx,vy,c,l,r,g){ if(S.parts.length>160) return; S.parts.push({x:x,y:y,vx:vx,vy:vy,c:c,l:l,m:l,r:r||3,g:g||0}); }
  function burst(x,y,c,n,sp){ for(var q=0;q<n;q++){ var an=Math.random()*6.28,v=(0.4+Math.random())*(sp||260); spark(x,y,Math.cos(an)*v,Math.sin(an)*v-60,c,.5+Math.random()*.4,2+Math.random()*3,500); } }
  function takePu(pu){ pu.done=true; S.pu++; SFX.boost();
    vfxPu(pu.type);
    if(pu.type==='shield'){ S.shield=1; pop('SHIELD!','#7fd7ff'); }
    else if(pu.type==='magnet'){ S.magT=7; pop('COIN MAGNET!','#ff8a8a'); }
    else if(pu.type==='phase'){ S.phaseT=3.5; pop('PHASE SHIFT!','#8ff7ff'); SFX.phase(); }
    else if(pu.type==='over'){ S.odT=2.5; S.flash=.5; S.flashC='210,110,255'; S.shake=.3; pop('OVERDRIVE!','#e08bff'); SFX.over(); vfxOverdrive(); }
    else if(pu.type==='charge'){ S.nitro=100; S.chg=1; pop('FULL CHARGE!','#7dffb0'); SFX.charge(); }
    else{ S.boostT=Math.max(S.boostT,1.7); S.flash=.4; S.flashC='253,190,24'; pop('BURST!','#fdbe18'); } }
  var PUCOL={shield:'120,215,255',magnet:'255,120,120',burst:'253,190,24',phase:'120,245,255',over:'210,110,255',charge:'110,255,170'}, PUIC={shield:'🛡',magnet:'🧲',burst:'⚡',phase:'👻',over:'🚀',charge:'🔋'};
  function puSprite(pu,sx,gy,s,now){
    var w=s*(W/2)*300; if(w<4) return; var cy=gy-w*1.1-Math.sin(now/260+sx)*w*.12, col=PUCOL[pu.type]||'253,190,24';
    var g=ctx.createRadialGradient(sx,cy,w*.1,sx,cy,w*.95); g.addColorStop(0,'rgba('+col+',.95)'); g.addColorStop(.55,'rgba('+col+',.45)'); g.addColorStop(1,'rgba('+col+',0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,cy,w*.95,0,7); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(sx,cy,w*.42,0,7); ctx.fill();
    if(w>14){ ctx.font=Math.round(w*.5)+'px system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#111'; ctx.fillText(PUIC[pu.type]||'⚡',sx,cy+1); ctx.textBaseline='alphabetic'; } }
  function useNitro(){ if(S.finished||S.nitro<100||S.t<900) return; S.nitro=0; S.boostT=Math.max(S.boostT,2.8); S.flash=.6; S.flashC='90,190,255'; S.shake=.35; pop('NITRO!','#5cc8ff'); SFX.nitro(); vfxNitro(); try{ navigator.vibrate&&navigator.vibrate(40); }catch(e){} }


  /* =================== THE CUBING ZONE: unique track mechanics =================== */
  var CZ=(WXK==='cubingzone'), GATE=300, czImg=null, CZC=['#f4f6f8','#e63946','#3a86ff','#f4a261','#2a9d8f','#ffd23f'];
  function czLogo(){ if(czImg===null){ czImg=false; var u=czLogoUrl(); if(u){ var im=new Image(); im.onload=function(){ czImg=im; }; im.src=u; } } return czImg||null; }
  function czCoin(){ S.czStk++; if(S.czStk>=27){ S.czStk=0; S.czSolved++; S.nitro=100; S.boostT=Math.max(S.boostT,2.4); S.flash=.6; S.flashC='255,255,255'; S.shake=.4; pop('CUBE SOLVED!','#ffd23f'); SFX.solved();
      var c=vcar(); vring(c.x,c.y,'255,255,255',20,W,.9,16); vring(c.x,c.y,'255,210,60',10,W*.7,1.1,12); vblast(c.x,c.y,CZC,90,820,1.2,160,4.5,true); for(var z=0;z<3;z++) rocket(); } }
  function czGateStep(){ var ix=Math.floor(S.pos/SEG), k=Math.floor(ix/GATE); if(k>S.gate){ S.gate=k; if(k*GATE<N-40){
      if(Math.abs(S.px)<.6){ S.nitro=Math.min(100,S.nitro+22); S.boostT=Math.max(S.boostT,1); S.gateFlash=.5; pop('ZONE GATE!','#27e6dc'); SFX.gate(); var c=vcar(); vring(c.x,c.y,'39,230,220',20,W*.7,.6,12); vblast(c.x,c.y,['#27e6dc','#c9fffb','#fff'],36,560,.6,60,3,true); }
      else pop('GATE MISSED','#8aa'); } } }
  function czCube(now){
    var cx=W*.5+Math.sin(now/5200)*W*.02, cy=HOR*.36, s=Math.min(W*.13,HOR*.3), th=now/1400, pt=.52, co=Math.cos(th), si=Math.sin(th), cp=Math.cos(pt), sp=Math.sin(pt);
    function pr(x,y,z){ var xr=x*co+z*si, zr=-x*si+z*co, yy=y*cp-zr*sp, zz=y*sp+zr*cp; return [cx+xr*s,cy-yy*s,zz]; }
    var gl=ctx.createRadialGradient(cx,cy,s*.4,cx,cy,s*2.6); gl.addColorStop(0,'rgba(39,230,220,.38)'); gl.addColorStop(1,'rgba(39,230,220,0)'); ctx.fillStyle=gl; ctx.fillRect(cx-s*3,cy-s*3,s*6,s*6);
    var F=[ {o:[-1,1,-1],u:[2,0,0],v:[0,0,2],n:[0,1,0],c:0}, {o:[-1,1,1],u:[2,0,0],v:[0,-2,0],n:[0,0,1],c:1}, {o:[1,1,1],u:[0,0,-2],v:[0,-2,0],n:[1,0,0],c:2}, {o:[-1,1,-1],u:[0,0,2],v:[0,-2,0],n:[-1,0,0],c:3}, {o:[1,1,-1],u:[-2,0,0],v:[0,-2,0],n:[0,0,-1],c:4}, {o:[-1,-1,1],u:[2,0,0],v:[0,0,-2],n:[0,-1,0],c:5} ];
    F.forEach(function(f){ var nz=-(f.n[0]*si*-1*0), a=pr(f.o[0]+f.n[0]*0,f.o[1],f.o[2]); var nr=pr(f.n[0],f.n[1],f.n[2]), n0=pr(0,0,0); if(nr[2]-n0[2]>=0) return;
      for(var i=0;i<3;i++) for(var j=0;j<3;j++){ var q=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]].map(function(t){ var u=t[0]/3,v=t[1]/3; return pr(f.o[0]+f.u[0]*u+f.v[0]*v,f.o[1]+f.u[1]*u+f.v[1]*v,f.o[2]+f.u[2]*u+f.v[2]*v); });
        ctx.fillStyle=CZC[(f.c+((i*2+j*3+Math.floor(now/1800))%6>4?1:0))%6]; ctx.beginPath(); ctx.moveTo(q[0][0],q[0][1]); ctx.lineTo(q[1][0],q[1][1]); ctx.lineTo(q[2][0],q[2][1]); ctx.lineTo(q[3][0],q[3][1]); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#05080c'; ctx.lineWidth=Math.max(1.5,s*.04); ctx.stroke(); } });
    ctx.save(); ctx.textAlign='center'; ctx.font='900 '+Math.round(s*.34)+'px system-ui'; ctx.shadowColor='#27e6dc'; ctx.shadowBlur=18; ctx.fillStyle='#c9fffb'; ctx.fillText('THE CUBING ZONE',cx,cy-s*1.55); ctx.restore();
  }
  function czGate(A,B,n,now){
    var h=A.w*1.05, pw=A.w*.07, fl=S.gateFlash>0, col=fl?'255,255,255':'39,230,220', pul=.65+.35*Math.sin(now/120+n);
    ctx.fillStyle='rgba('+col+','+pul+')'; ctx.fillRect(A.x-A.w-pw,A.y-h,pw*2,h); ctx.fillRect(A.x+A.w-pw,A.y-h,pw*2,h); ctx.fillRect(A.x-A.w-pw,A.y-h-pw*2,A.w*2+pw*2,pw*2.4);
    var g=ctx.createLinearGradient(0,A.y-h,0,A.y); g.addColorStop(0,'rgba(39,230,220,.28)'); g.addColorStop(1,'rgba(39,230,220,0)'); ctx.fillStyle=g; ctx.fillRect(A.x-A.w,A.y-h,A.w*2,h);
    for(var i=0;i<6;i++){ ctx.fillStyle=CZC[i]; ctx.fillRect(A.x-A.w+A.w*2/6*i+pw*.2,A.y-h-pw*1.8,A.w*2/6-pw*.4,pw*1.2); }
    if(A.w>14){ ctx.save(); ctx.textAlign='center'; ctx.font='900 '+Math.round(A.w*.2)+'px system-ui'; ctx.fillStyle='#fff'; ctx.shadowColor='#27e6dc'; ctx.shadowBlur=12; ctx.fillText('ZONE GATE',A.x,A.y-h-pw*3.2); ctx.restore(); }
  }
  function czHud(now){
    var x=14,y=118,c=16; ctx.fillStyle='rgba(10,12,14,.55)'; ctx.fillRect(x-6,y-6,c*3+12,c*3+34);
    var filled=Math.floor(S.czStk/3);
    for(var i=0;i<9;i++){ var cx=x+(i%3)*c, cy=y+Math.floor(i/3)*c; ctx.fillStyle=i<filled?CZC[(i+S.czSolved)%6]:'rgba(255,255,255,.14)'; ctx.fillRect(cx+1,cy+1,c-2,c-2); }
    ctx.textAlign='left'; ctx.font='800 10px system-ui'; ctx.fillStyle='#9fe3ff'; ctx.fillText('SOLVE '+(S.czSolved?'×'+S.czSolved:''),x,y+c*3+14);
  }
  /* =================== POWER VFX LAYER (additive glow, shockwaves, fireworks) =================== */
  var V=[], vfxT=0, rocketT=0, windPh=0, zoomK=0, abK=0, countFx=-1, goFx=false, finFx=false;
  function vp(q){ if(V.length<420) V.push(q); }
  function vdot(x,y,vx,vy,c,l,r,g,drag){ vp({k:0,x:x,y:y,vx:vx,vy:vy,c:c,l:l,m:l,r:r,g:g||0,d:drag||0}); }
  function vring(x,y,c,r0,r1,l,w){ if(S.flyOn){ r1*=.6; w=(w||6)*.6; } vp({k:1,x:x,y:y,c:c,l:l,m:l,r0:r0,r1:r1,w:w||6}); }
  function vstreak(x,y,vx,vy,c,l,w,len){ vp({k:2,x:x,y:y,vx:vx,vy:vy,c:c,l:l,m:l,w:w,len:len}); }
  function vblast(x,y,cols,n,sp,l,g,r,streak){ if(S.flyOn){ n=Math.ceil(n*.4); g=(g||0)*.4; } for(var q=0;q<n;q++){ var an=Math.random()*6.2832,v=(.25+Math.random())*sp,c=cols[(Math.random()*cols.length)|0];
      if(streak&&q%2) vstreak(x,y,Math.cos(an)*v,Math.sin(an)*v,c,l*(.6+Math.random()*.5),2+Math.random()*2,.07+Math.random()*.05);
      else vdot(x,y,Math.cos(an)*v,Math.sin(an)*v,c,l*(.6+Math.random()*.7),(r||3)*(.6+Math.random()),g,1.6); } }
  function vcar(){ return {x:W/2,y:H-14-sprScale()*.25,w:sprScale()}; }
  function vfxNitro(){ var c=vcar(); vring(c.x,c.y,'90,200,255',20,W*.7,.7,14); vring(c.x,c.y,'255,255,255',10,W*.45,.5,6); vring(c.x,c.y,'255,160,60',30,W*.9,.9,10);
    vblast(c.x,c.y,['#9fe3ff','#5cc8ff','#ffffff','#ffb347'],70,720,.8,120,4,true); S.shake=Math.max(S.shake,.5); zoomK=1; abK=1; }
  function vfxPad(){ var c=vcar(); vring(c.x,c.y,'253,190,24',16,W*.5,.55,10); vblast(c.x,c.y,['#fdbe18','#ffd36b','#fff3b0'],34,560,.6,80,3.5,true); zoomK=Math.max(zoomK,S.flyOn?.2:.7); }
  function vfxDriftBoost(){ var c=vcar(); vring(c.x,c.y,'108,196,255',14,W*.5,.6,10); vblast(c.x,c.y,['#6cc4ff','#c9efff','#fff'],40,600,.6,60,3,true); zoomK=Math.max(zoomK,.8); abK=Math.max(abK,.6); }
  function vfxCoin(x){ var cx=W/2+(x||0), cy=H-150; vblast(cx,cy,['#ffd36b','#fff3b0','#fdbe18'],12,300,.55,260,2.8,true); vring(cx,cy,'255,214,100',6,46,.35,4); }
  function vfxLaunch(){ var c=vcar(); vring(c.x,c.y,'159,227,255',16,W*.5,.5,12); vblast(c.x,c.y,['#9fe3ff','#fff','#c9efff'],36,520,.55,160,3,true); zoomK=Math.max(zoomK,.9); S.shake=Math.max(S.shake,.2); }
  function vfxLand(rot){ var c=vcar(); vring(c.x,c.y,'255,255,255',14,W*.55,.5,12); vring(c.x,c.y,rot>0?'253,190,24':'200,200,200',8,W*.35,.6,8);
    for(var q=0;q<14;q++) vdot(c.x+(Math.random()-.5)*c.w*1.2,c.y,(Math.random()-.5)*520,-60-Math.random()*160,'#b8aea0',.6+Math.random()*.4,9+Math.random()*10,200,1.2);
    if(rot>0) vblast(c.x,c.y,['#fdbe18','#ffd36b','#fff'],50+rot*20,680,.8,140,3.5,true); S.shake=Math.max(S.shake,.3); }
  function vfxOverdrive(){ var c=vcar(); vring(c.x,c.y,'210,110,255',20,W*.8,.8,16); vring(c.x,c.y,'255,255,255',10,W*.5,.5,6); vblast(c.x,c.y,['#e08bff','#9b5cff','#fff','#ff7ad9'],80,760,.9,100,4,true); zoomK=1; abK=1; }
  function vfxWings(){ var c=vcar(); vring(c.x,c.y,'255,255,255',20,W*.95,1,20); vring(c.x,c.y-60,'159,227,255',10,W*.7,1.2,12); vring(c.x,c.y,'255,214,120',30,W*.6,.9,10); vblast(c.x,c.y-40,['#fff','#c9efff','#9fe3ff','#ffe9a0'],100,800,1.1,60,4,true);
    for(var q=0;q<22;q++) vdot(c.x+(Math.random()-.5)*c.w*1.6,c.y,(Math.random()-.5)*700,-120-Math.random()*260,Math.random()<.5?'#ffffff':'#bfe9ff',1+Math.random()*.6,9+Math.random()*10,160,1.1); zoomK=1; abK=1; }
  function vfxRing(){ var c=vcar(); vring(c.x,c.y-80,'125,240,255',12,W*.5,.6,12); vblast(c.x,c.y-80,['#7df0ff','#fff'],36,520,.6,40,3,true); }
  function vfxPhase(){ var c=vcar(); vring(c.x,c.y,'120,245,255',16,W*.45,.5,10); }
  function vfxPu(type){ var c=vcar(), col=PUCOL[type]||'253,190,24'; vring(c.x,c.y-30,col,10,W*.38,.6,10); vblast(c.x,c.y-30,type==='shield'?['#7fd7ff','#fff']:type==='magnet'?['#ff8a8a','#fff']:type==='phase'?['#8ff7ff','#fff']:type==='over'?['#e08bff','#fff']:type==='charge'?['#7dffb0','#fff']:['#fdbe18','#fff3b0'],28,480,.6,60,3,true); }
  function vfxCrash(big){ var c=vcar(); vring(c.x,c.y,'255,80,60',20,W*.55,.5,16); vblast(c.x,c.y,['#ff3b30','#ff8a2a','#ffd36b','#2a2a2a'],big?64:34,640,.8,520,4.5,true); abK=1; for(var q=0;q<10;q++) vdot(c.x+(Math.random()-.5)*c.w,c.y,(Math.random()-.5)*160,-80-Math.random()*120,'#4a4a4a',.9,10+Math.random()*10,-90,.8); }
  function vfxShield(){ var c=vcar(); vring(c.x,c.y,'120,215,255',30,W*.6,.55,14); vblast(c.x,c.y-20,['#7fd7ff','#ffffff'],44,560,.6,100,3,true); }
  function vfxOver(){ for(var q=0;q<6;q++) vstreak(-40,H*(.35+Math.random()*.4),2400+Math.random()*900,0,Math.random()<.5?'200,255,220':'255,255,255',.35,3+Math.random()*3,.18); }
  function vfxClose(){ var c=vcar(), sd=S.steer>=0?1:-1; vblast(c.x+sd*c.w*.55,c.y,['#ff9f40','#ffd36b','#fff'],18,420,.4,120,2.5,true); vring(c.x+sd*c.w*.55,c.y,'255,170,60',8,90,.3,5); }
  function vfxGo(){ var c=vcar(); vring(c.x,c.y,'255,255,255',20,W*.8,.7,16); vring(c.x,c.y,'120,220,255',10,W*.6,.9,10); vblast(c.x,c.y,['#fff','#9fe3ff','#fdbe18'],60,760,.9,0,4,true); zoomK=1; S.flash=.5; S.flashC='255,255,255'; }
  function vfxCount(){ var c=vcar(); vring(W/2,H*.5,'255,255,255',30,W*.35,.7,8); }
  function rocket(){ var x=W*(.15+Math.random()*.7), y=H*(.18+Math.random()*.32), cols=[['#ff5d5d','#ffb3b3','#fff'],['#5cc8ff','#c9efff','#fff'],['#ffd36b','#fff3b0','#fff'],['#7dd3a8','#d9fff0','#fff'],['#c28bff','#ecd9ff','#fff']][(Math.random()*5)|0];
    vp({k:3,x:x,y:H,vx:(x-W/2)*.06,vy:-(H-y)*2.2,c:'255,235,170',l:.45,m:.45,cols:cols,tx:x,ty:y}); }
  function vfxStep(dt,now){
    var c=vcar(), spd=S.speed/MAXV;
    if(zoomK>0) zoomK=Math.max(0,zoomK-dt*1.6); if(abK>0) abK=Math.max(0,abK-dt*2.4);
    windPh+=dt*(2+spd*10);
    if(!S.finished&&S.t>0){
      if(S.odT>0){ for(var qo=0;qo<4;qo++) vdot(c.x+(Math.random()-.5)*c.w*.6,H-6,(Math.random()-.5)*160,380+Math.random()*380,['#e08bff','#9b5cff','#fff','#ff7ad9'][(Math.random()*4)|0],.45+Math.random()*.3,6+Math.random()*8,0,.5); if(Math.random()<.7) vstreak(W*(.05+Math.random()*.9),H*.4,(Math.random()-.5)*300,1900+Math.random()*900,'225,170,255',.28,3,.18); }
      if(S.phaseT>0&&Math.random()<.6) vdot(c.x+(Math.random()-.5)*c.w,H-30-Math.random()*c.w*.7,(Math.random()-.5)*80,-60-Math.random()*60,Math.random()<.5?'#8ff7ff':'#ffffff',.4+Math.random()*.3,3+Math.random()*4,0,.8);
      if(S.air>0&&Math.random()<.9) vstreak(c.x+(Math.random()-.5)*c.w*.8,H-40-Math.random()*60,(Math.random()-.5)*40,-300-Math.random()*200,'200,235,255',.3,2.5,.2);
      if(S.chg>0){ S.chg=0; vring(c.x,c.y,'110,255,170',16,W*.6,.6,14); vblast(c.x,c.y,['#7dffb0','#fff','#c9ffe0'],40,520,.7,80,3,true); }
      if(S.boostT>0){ /* flame jet + ember trail */
        for(var q=0;q<3;q++){ vdot(c.x+(Math.random()-.5)*c.w*.5,H-6,(Math.random()-.5)*120,320+Math.random()*340,['#fff3b0','#ffb347','#ff6a1a','#5cc8ff'][(Math.random()*4)|0],.4+Math.random()*.3,5+Math.random()*7,0,.5); }
        if(Math.random()<.5) vstreak(W*(.1+Math.random()*.8),H*.45,(Math.random()-.5)*300,1600+Math.random()*900,'255,235,190',.25,2.5,.16);
      }
      if(spd>.55&&Math.random()<spd*.7) vstreak(Math.random()<.5?W*Math.random()*.18:W*(1-Math.random()*.18),H*.5+Math.random()*H*.15,0,900+spd*1100,'230,240,255',.22,2,.14);
      if(S.drift>.3){ var hot=S.drift>=1, sup=S.drift>=2; for(var d=0;d<3;d++){ var sx=c.x+(S.steer>0?-1:1)*c.w*.5; vdot(sx,H-18,(Math.random()-.5)*220+(S.steer>0?-160:160),-160-Math.random()*220,sup?['#c28bff','#ecd9ff','#fff'][d%3]:hot?['#6cc4ff','#c9efff','#fff'][d%3]:['#ffb347','#ffd36b','#fff3b0'][d%3],.4+Math.random()*.3,2+Math.random()*2.5,520,.6); }
        if(Math.random()<.5) vdot(sx,H-16,(Math.random()-.5)*60,-30-Math.random()*50,'#c8c8c8',.7,8+Math.random()*8,-60,1); }
    }
    if(S.finished){ rocketT-=dt; if(rocketT<=0){ rocketT=.22+Math.random()*.25; rocket(); if(Math.random()<.5) rocket(); } }
    for(var i=V.length-1;i>=0;i--){ var p=V[i]; p.l-=dt;
      if(p.l<=0){ if(p.k===3){ vblast(p.x,p.y,p.cols,46,380+Math.random()*120,1.1,160,3.2,true); vring(p.x,p.y,'255,255,255',4,70,.4,3); } V.splice(i,1); continue; }
      if(p.k===0){ var dg=Math.max(0,1-(p.d||0)*dt); p.vx*=dg; p.vy*=dg; p.vy+=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; }
      else if(p.k===2||p.k===3){ p.x+=p.vx*dt; p.y+=p.vy*dt; if(p.k===3&&Math.random()<.8) vdot(p.x,p.y,(Math.random()-.5)*30,40,'#ffe2a8',.35,2,0,2); } }
  }
  function vfxDraw(now){
    var spd=S.speed/MAXV, prev=ctx.globalCompositeOperation; ctx.save(); ctx.globalCompositeOperation='lighter';
    /* tunnel of light + edge glow while boosting */
    if((S.boostT>0||S.odT>0)&&!S.finished){ var od=S.odT>0, k=Math.min(1,Math.max(S.boostT,S.odT)*1.6)*(S.flyOn?.45:1), nit=S.boostT>1.2||od;
      var cxx=W/2, cyy=H*.56; ctx.lineCap='round';
      for(var l=0;l<(S.flyOn?9:26);l++){ var an=(l/26)*6.2832+windPh*.05, r0=H*(.16+((windPh*.7+l*.37)%1)*.55), r1=r0+H*(.12+.22*k);
        ctx.strokeStyle='rgba('+(od?'225,130,255':nit?'120,210,255':'255,225,150')+','+(.16+.22*k)*(S.flyOn?.6:1)+')'; ctx.lineWidth=2+k*2.5; ctx.beginPath(); ctx.moveTo(cxx+Math.cos(an)*r0*1.7,cyy+Math.sin(an)*r0*.85); ctx.lineTo(cxx+Math.cos(an)*r1*1.7,cyy+Math.sin(an)*r1*.85); ctx.stroke(); }
      var eg=ctx.createRadialGradient(cxx,cyy,H*.3,cxx,cyy,H*.95), ec=od?'170,70,255':nit?'60,160,255':'255,150,40'; eg.addColorStop(0,'rgba('+ec+',0)'); eg.addColorStop(1,'rgba('+ec+','+(.28+.14*Math.sin(now/70))*k+')'); ctx.fillStyle=eg; ctx.fillRect(0,0,W,H);
      /* flame cone behind the car */
      var c=vcar(), fg=ctx.createLinearGradient(0,H-6,0,H-c.w*.95); fg.addColorStop(0,'rgba(255,255,255,.0)'); fg.addColorStop(.25,'rgba('+(nit?'120,210,255':'255,170,60')+',.35)'); fg.addColorStop(1,'rgba(255,90,20,0)');
      ctx.fillStyle=fg; ctx.beginPath(); ctx.moveTo(c.x-c.w*.32,H-6); ctx.lineTo(c.x-c.w*.08,H-c.w*(.6+.35*Math.random())); ctx.lineTo(c.x+c.w*.08,H-c.w*(.6+.35*Math.random())); ctx.lineTo(c.x+c.w*.32,H-6); ctx.closePath(); ctx.fill();
      /* chromatic split at the screen edges */
      if(abK>0||nit){ var ab=Math.max(abK,nit?.35:0), ew=W*.05*ab; var lg=ctx.createLinearGradient(0,0,ew*3,0); lg.addColorStop(0,'rgba(255,40,80,'+.4*ab+')'); lg.addColorStop(1,'rgba(255,40,80,0)'); ctx.fillStyle=lg; ctx.fillRect(0,0,ew*3,H);
        var rg=ctx.createLinearGradient(W,0,W-ew*3,0); rg.addColorStop(0,'rgba(40,200,255,'+.4*ab+')'); rg.addColorStop(1,'rgba(40,200,255,0)'); ctx.fillStyle=rg; ctx.fillRect(W-ew*3,0,ew*3,H); }
    } else if(abK>0){ var ew2=W*.05*abK, lg2=ctx.createLinearGradient(0,0,ew2*3,0); lg2.addColorStop(0,'rgba(255,40,80,'+.4*abK+')'); lg2.addColorStop(1,'rgba(255,40,80,0)'); ctx.fillStyle=lg2; ctx.fillRect(0,0,ew2*3,H); var rg2=ctx.createLinearGradient(W,0,W-ew2*3,0); rg2.addColorStop(0,'rgba(40,200,255,'+.4*abK+')'); rg2.addColorStop(1,'rgba(40,200,255,0)'); ctx.fillStyle=rg2; ctx.fillRect(W-ew2*3,0,ew2*3,H); }
    /* particles, rings, streaks */
    for(var i=0;i<V.length;i++){ var p=V[i], a=Math.max(0,Math.min(1,p.l/p.m));
      if(p.k===0){ ctx.globalAlpha=a; if(p.r<7){ ctx.fillStyle=p.c; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*(.5+.9*a),0,6.2832); ctx.fill(); } else { var gr=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*2); gr.addColorStop(0,p.c); gr.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=gr; ctx.fillRect(p.x-p.r*2,p.y-p.r*2,p.r*4,p.r*4); } }
      else if(p.k===1){ var t=1-a, rr=p.r0+(p.r1-p.r0)*(1-(1-t)*(1-t)); ctx.globalAlpha=1; ctx.strokeStyle='rgba('+p.c+','+a*.85+')'; ctx.lineWidth=Math.max(1,p.w*a); ctx.beginPath(); ctx.ellipse(p.x,p.y,rr,rr*.55,0,0,6.2832); ctx.stroke(); }
      else if(p.k===2){ var col=/^\d/.test(p.c)?'rgba('+p.c+','+a+')':p.c; ctx.globalAlpha=/^\d/.test(p.c)?1:a; ctx.strokeStyle=col; ctx.lineWidth=p.w; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x-p.vx*p.len,p.y-p.vy*p.len); ctx.stroke(); }
      else if(p.k===3){ ctx.globalAlpha=1; ctx.strokeStyle='rgba(255,240,190,.9)'; ctx.lineWidth=3; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x-p.vx*.06,p.y-p.vy*.06); ctx.stroke(); } }
    ctx.globalAlpha=1;
    /* finish: god rays */
    if(S.finished){ var fa=Math.min(1,(Date.now()-S.finishAt)/500), fcx=W/2, fcy=H*.42; for(var r=0;r<12;r++){ var ang=r*.5236+now/2600; ctx.fillStyle='rgba(255,230,160,'+.09*fa+')'; ctx.beginPath(); ctx.moveTo(fcx,fcy); ctx.arc(fcx,fcy,Math.max(W,H),ang,ang+.13); ctx.closePath(); ctx.fill(); } }
    ctx.restore(); ctx.globalCompositeOperation=prev;
  }

  function seg(ix){ return segAt(Math.floor(ix)); }
  function project(wx,tz){ var sc=CAMD/tz; return {sc:sc,x:W/2+sc*wx*(W/2),y:HOR+sc*CAMH*(H-HOR),w:sc*ROADW*(W/2)}; }
  function poly(c,a,b,cc,d,e,f,g,h){ ctx.fillStyle=c; ctx.beginPath(); ctx.moveTo(a,b); ctx.lineTo(cc,d); ctx.lineTo(e,f); ctx.lineTo(g,h); ctx.closePath(); ctx.fill(); }

  /* ---- drawing helpers: a Rubik's cube seen from behind and above ---- */
  function quadGrid(p00,p10,p01,p11,n,colorFn,gap){
    for(var r=0;r<n;r++)for(var q=0;q<n;q++){
      var u0=q/n,u1=(q+1)/n,v0=r/n,v1=(r+1)/n,g=gap||0;
      function P(u,v){ return [ (p00[0]*(1-u)+p10[0]*u)*(1-v)+(p01[0]*(1-u)+p11[0]*u)*v, (p00[1]*(1-u)+p10[1]*u)*(1-v)+(p01[1]*(1-u)+p11[1]*u)*v ]; }
      var a=P(u0+g/n,v0+g/n),b=P(u1-g/n,v0+g/n),c=P(u1-g/n,v1-g/n),d=P(u0+g/n,v1-g/n);
      ctx.fillStyle=colorFn(r*n+q); ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.lineTo(c[0],c[1]); ctx.lineTo(d[0],d[1]); ctx.closePath(); ctx.fill();
    }
  }
  /* cube standing on the ground at (cx, baseY), front face width w, optional visible side */
  function drawCube(cx,baseY,w,fc,tc,side,alpha){
    if(w<2) return; var h=w*0.92, top=w*0.28, l=cx-w/2, r=cx+w/2, y1=baseY-h, sk=side*w*0.22;
    if(alpha!=null) ctx.globalAlpha=alpha;
    ctx.fillStyle='#0b0d0f'; ctx.fillRect(l-w*0.02,y1-w*0.02,w*1.04,h+w*0.04);
    /* side face */
    if(side){ var sx=side>0?r:l; ctx.fillStyle=shade(fc(4),.62); ctx.beginPath(); ctx.moveTo(sx,y1); ctx.lineTo(sx+sk,y1-top*.7); ctx.lineTo(sx+sk,baseY-top*.7); ctx.lineTo(sx,baseY); ctx.closePath(); ctx.fill(); }
    quadGrid([l,y1],[r,y1],[l,baseY],[r,baseY],3,fc,.045);
    /* top face (lighter) */
    quadGrid([l+top*.4+sk*.2,y1-top],[r-top*.4+sk*.2,y1-top],[l,y1],[r,y1],3,function(i){ return shade(tc(i),1.05); },.045);
    if(alpha!=null) ctx.globalAlpha=1;
  }
  function drawCar(cx,baseY,w,hash,lean,boost,glow,alpha,car){
    var CP=carPal(car), fc=function(i){ return CP[(i+hash)%6]; }, tc=function(i){ return CP[(i*2+hash+3)%6]; };
    if(alpha!=null) ctx.globalAlpha=alpha;
    var tI=TRI(car), tr=TRAILDEF[tI];
    if(tr&&tI>0){ var tn=Date.now(), ga=ctx.globalAlpha;
      for(var k=0;k<14;k++){ var ph=((tn/620+k/14)%1), sd=Math.sin(k*12.9898+hash)*43758.5453, rr=sd-Math.floor(sd), sd2=(k%2?1:-1), px2=cx+sd2*(w*.5+ph*w*.38+rr*w*.08), py2=baseY-w*.08-Math.sin(ph*3.1)*w*.22-rr*w*.06, al=(1-ph*ph)*.95, sz=Math.max(2,w*(.05+.06*(1-ph)));
        var col=tr.rb?['255,70,70','255,170,40','255,230,60','80,220,120','70,160,255','170,100,255'][k%6]:tr.c[k%2];
        ctx.globalAlpha=ga*al; ctx.fillStyle='rgba('+col+',1)';
        if(tr.star){ ctx.save(); ctx.translate(px2,py2); ctx.rotate(tn/400+k); ctx.beginPath(); for(var q=0;q<10;q++){ var rad=(q%2?sz*.5:sz*1.3), an=q*Math.PI/5; ctx.lineTo(Math.cos(an)*rad,Math.sin(an)*rad); } ctx.closePath(); ctx.fill(); ctx.restore(); }
        else if(tr.heart){ ctx.beginPath(); ctx.arc(px2-sz*.45,py2,sz*.55,0,7); ctx.arc(px2+sz*.45,py2,sz*.55,0,7); ctx.moveTo(px2-sz,py2+sz*.2); ctx.lineTo(px2,py2+sz*1.3); ctx.lineTo(px2+sz,py2+sz*.2); ctx.fill(); }
        else { ctx.beginPath(); ctx.arc(px2,py2,sz,0,7); ctx.fill(); } }
      ctx.globalAlpha=ga; }
    /* shadow */
    if(!NOSH){ ctx.fillStyle='rgba(0,0,0,.38)'; ctx.beginPath(); ctx.ellipse(cx,baseY+w*0.02,w*0.62,w*0.1,0,0,7); ctx.fill(); }
    if(glow){ var g=ctx.createRadialGradient(cx,baseY,w*0.1,cx,baseY,w*0.9); g.addColorStop(0,'rgba(255,140,40,.55)'); g.addColorStop(1,'rgba(255,140,40,0)'); ctx.fillStyle=g; ctx.fillRect(cx-w,baseY-w*0.5,w*2,w*0.7); }
    /* wheels */
    var ww=w*0.2,wh=w*0.3; ctx.fillStyle='#0d0f11';
    [[cx-w*0.56,baseY-wh],[cx+w*0.56-ww,baseY-wh]].forEach(function(p){ ctx.beginPath(); ctx.roundRect?ctx.roundRect(p[0],p[1],ww,wh,w*0.05):ctx.rect(p[0],p[1],ww,wh); ctx.fill(); ctx.fillStyle='#3a4046'; ctx.fillRect(p[0]+ww*0.2,p[1]+wh*0.3,ww*0.6,wh*0.18); ctx.fillStyle='#0d0f11'; });
    /* body: lifted so the wheels show */
    var by=baseY-w*0.1;
    ctx.save(); ctx.translate(lean*w*0.05,0);
    drawCube(cx,by,w*0.92,fc,tc,0);
    /* tail lights */
    ctx.fillStyle='#ff3b30'; ctx.fillRect(cx-w*0.44,by-w*0.14,w*0.14,w*0.07); ctx.fillRect(cx+w*0.30,by-w*0.14,w*0.14,w*0.07);
    ctx.restore();
    if(boost){ var fl=0.6+Math.random()*0.5; ctx.fillStyle='rgba(255,170,40,.9)'; ctx.beginPath(); ctx.moveTo(cx-w*0.28,by); ctx.lineTo(cx-w*0.14,by+w*0.5*fl); ctx.lineTo(cx,by); ctx.fill(); ctx.beginPath(); ctx.moveTo(cx,by); ctx.lineTo(cx+w*0.14,by+w*0.5*fl); ctx.lineTo(cx+w*0.28,by); ctx.fill(); ctx.fillStyle='rgba(255,255,200,.9)'; ctx.beginPath(); ctx.moveTo(cx-w*0.1,by); ctx.lineTo(cx,by+w*0.28*fl); ctx.lineTo(cx+w*0.1,by); ctx.fill(); }
    if(alpha!=null) ctx.globalAlpha=1;
  }
  function treeX(kind,sc,sx,gy,tw){
    if(kind==='cactus'){
      ctx.fillStyle='#3f8a43'; ctx.fillRect(sx-tw*.12,gy-tw*1.25,tw*.24,tw*1.25); ctx.beginPath(); ctx.arc(sx,gy-tw*1.25,tw*.12,0,7); ctx.fill();
      ctx.fillRect(sx-tw*.5,gy-tw*.8,tw*.4,tw*.16); ctx.fillRect(sx-tw*.5,gy-tw*1.1,tw*.16,tw*.46);
      ctx.fillRect(sx+tw*.1,gy-tw*.6,tw*.4,tw*.16); ctx.fillRect(sx+tw*.34,gy-tw*.95,tw*.16,tw*.51);
      ctx.fillStyle='rgba(255,255,255,.22)'; ctx.fillRect(sx-tw*.04,gy-tw*1.2,tw*.05,tw*1.15);
    }else if(kind==='palm'){
      ctx.strokeStyle='#8a5a30'; ctx.lineWidth=Math.max(2,tw*.16); ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(sx,gy); ctx.quadraticCurveTo(sx+tw*.3,gy-tw*.7,sx+tw*.12,gy-tw*1.4); ctx.stroke();
      var tx=sx+tw*.12, ty=gy-tw*1.4; ctx.strokeStyle='#27a35a'; ctx.lineWidth=Math.max(2,tw*.1);
      for(var k=0;k<6;k++){ var a=-Math.PI*(.1+k*.16); ctx.beginPath(); ctx.moveTo(tx,ty); ctx.quadraticCurveTo(tx+Math.cos(a)*tw*.7,ty+Math.sin(a)*tw*.7-tw*.2,tx+Math.cos(a)*tw*.95,ty+Math.sin(a)*tw*.5+tw*.3); ctx.stroke(); }
      ctx.fillStyle='#5b3a1a'; ctx.beginPath(); ctx.arc(tx,ty+tw*.05,tw*.08,0,7); ctx.fill();
    }else if(kind==='spire'){
      ctx.fillStyle='#2b1613'; ctx.beginPath(); ctx.moveTo(sx-tw*.4,gy); ctx.lineTo(sx-tw*.1,gy-tw*1.5); ctx.lineTo(sx+tw*.12,gy-tw*1.1); ctx.lineTo(sx+tw*.42,gy); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#ff6a1a'; ctx.lineWidth=Math.max(1.5,tw*.05); ctx.beginPath(); ctx.moveTo(sx-tw*.05,gy-tw*1.4); ctx.lineTo(sx+tw*.02,gy-tw*.8); ctx.lineTo(sx-tw*.06,gy-tw*.3); ctx.stroke();
      var gl=ctx.createRadialGradient(sx,gy-tw*1.4,1,sx,gy-tw*1.4,tw*.5); gl.addColorStop(0,'rgba(255,140,40,.7)'); gl.addColorStop(1,'rgba(255,140,40,0)'); ctx.fillStyle=gl; ctx.fillRect(sx-tw*.5,gy-tw*1.9,tw,tw*.9);
    }else if(kind==='zone'){
      ctx.fillStyle='#071a24'; ctx.fillRect(sx-tw*.05,gy-tw*1.25,tw*.1,tw*1.25);
      var cb=Math.max(4,tw*.55), cy=gy-tw*1.25-cb*.5+Math.sin(Date.now()/600+sc.h)*tw*.05, cols=['#e63946','#f4a261','#2a9d8f','#ffd23f','#3a86ff','#f1faee'];
      ctx.fillStyle='#0b0d10'; ctx.fillRect(sx-cb*.5-1,cy-cb*.5-1,cb+2,cb+2);
      for(var zr=0;zr<3;zr++) for(var zc=0;zc<3;zc++){ ctx.fillStyle=cols[(zr*3+zc+sc.h)%6]; ctx.fillRect(sx-cb*.5+zc*cb/3+1,cy-cb*.5+zr*cb/3+1,cb/3-2,cb/3-2); }
      var gz=ctx.createRadialGradient(sx,cy,1,sx,cy,cb*1.1); gz.addColorStop(0,'rgba(39,230,220,.4)'); gz.addColorStop(1,'rgba(39,230,220,0)'); ctx.fillStyle=gz; ctx.fillRect(sx-cb*1.2,cy-cb*1.2,cb*2.4,cb*2.4);
      ctx.fillStyle='#27e6dc'; ctx.fillRect(sx-tw*.2,gy-tw*.06,tw*.4,tw*.06);
    }else if(kind==='crystal'){
      var cc=sc.h%2?'#8fe3ff':'#c6f4ff'; ctx.fillStyle=cc; ctx.globalAlpha=.88;
      [[-.22,.8,.16],[0,1.35,.2],[.24,.7,.14]].forEach(function(q){ ctx.beginPath(); ctx.moveTo(sx+q[0]*tw-q[2]*tw,gy); ctx.lineTo(sx+q[0]*tw,gy-q[1]*tw); ctx.lineTo(sx+q[0]*tw+q[2]*tw,gy); ctx.closePath(); ctx.fill(); });
      ctx.globalAlpha=1; ctx.fillStyle='rgba(255,255,255,.55)'; ctx.beginPath(); ctx.moveTo(sx-tw*.02,gy); ctx.lineTo(sx,gy-tw*1.35); ctx.lineTo(sx+tw*.04,gy); ctx.closePath(); ctx.fill();
      var gl2=ctx.createRadialGradient(sx,gy-tw*.7,1,sx,gy-tw*.7,tw*.9); gl2.addColorStop(0,'rgba(120,230,255,.35)'); gl2.addColorStop(1,'rgba(120,230,255,0)'); ctx.fillStyle=gl2; ctx.fillRect(sx-tw,gy-tw*1.6,tw*2,tw*1.7);
    }else if(kind==='rock'){
      ctx.fillStyle='#4a4a5c'; ctx.beginPath(); ctx.moveTo(sx-tw*.5,gy); ctx.lineTo(sx-tw*.38,gy-tw*.55); ctx.lineTo(sx-tw*.05,gy-tw*.8); ctx.lineTo(sx+tw*.3,gy-tw*.5); ctx.lineTo(sx+tw*.5,gy); ctx.closePath(); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.14)'; ctx.beginPath(); ctx.moveTo(sx-tw*.38,gy-tw*.55); ctx.lineTo(sx-tw*.05,gy-tw*.8); ctx.lineTo(sx+tw*.02,gy-tw*.4); ctx.closePath(); ctx.fill();
      if(sc.h%3===0){ ctx.strokeStyle='#aab4c8'; ctx.lineWidth=Math.max(1.5,tw*.04); ctx.beginPath(); ctx.moveTo(sx+tw*.1,gy-tw*.7); ctx.lineTo(sx+tw*.1,gy-tw*1.4); ctx.stroke(); ctx.fillStyle=(Math.floor(Date.now()/500)%2)?'#ff4d4d':'#5a1a1a'; ctx.beginPath(); ctx.arc(sx+tw*.1,gy-tw*1.42,Math.max(2,tw*.07),0,7); ctx.fill(); }
    }else if(kind==='pylon'){
      ctx.fillStyle='#150b28'; ctx.fillRect(sx-tw*.05,gy-tw*1.6,tw*.1,tw*1.6);
      var c1=sc.h%2?'#ff3fa4':'#2ee6ff'; ctx.fillStyle=c1; ctx.fillRect(sx-tw*.3,gy-tw*1.6,tw*.6,tw*.07); ctx.fillRect(sx-tw*.2,gy-tw*1.2,tw*.4,tw*.05);
      var g3=ctx.createRadialGradient(sx,gy-tw*1.6,1,sx,gy-tw*1.6,tw*.6); g3.addColorStop(0,c1+'aa'); g3.addColorStop(1,c1+'00'); ctx.fillStyle=g3; ctx.fillRect(sx-tw*.6,gy-tw*2.2,tw*1.2,tw*1.2);
    }else{ /* dead tree, sometimes with a jack-o'-lantern */
      ctx.strokeStyle='#1d1226'; ctx.lineCap='round'; ctx.lineWidth=Math.max(2,tw*.14); ctx.beginPath(); ctx.moveTo(sx,gy); ctx.lineTo(sx,gy-tw*1.1); ctx.stroke();
      ctx.lineWidth=Math.max(1.5,tw*.07); ctx.beginPath(); ctx.moveTo(sx,gy-tw*.7); ctx.lineTo(sx-tw*.5,gy-tw*1.2); ctx.moveTo(sx,gy-tw*.9); ctx.lineTo(sx+tw*.5,gy-tw*1.4); ctx.moveTo(sx,gy-tw*1.1); ctx.lineTo(sx-tw*.2,gy-tw*1.6); ctx.stroke();
      if(sc.h%3===0){ var px=sx+tw*.55, pr=tw*.28, pg=ctx.createRadialGradient(px,gy-pr,1,px,gy-pr,pr*2.2); pg.addColorStop(0,'rgba(255,140,30,.55)'); pg.addColorStop(1,'rgba(255,140,30,0)'); ctx.fillStyle=pg; ctx.fillRect(px-pr*2.2,gy-pr*3.2,pr*4.4,pr*4.4);
        ctx.fillStyle='#f07a10'; ctx.beginPath(); ctx.ellipse(px,gy-pr,pr,pr*.85,0,0,7); ctx.fill(); ctx.fillStyle='#2a0f00'; ctx.beginPath(); ctx.moveTo(px-pr*.5,gy-pr*1.15); ctx.lineTo(px-pr*.15,gy-pr*1.15); ctx.lineTo(px-pr*.32,gy-pr*.85); ctx.moveTo(px+pr*.15,gy-pr*1.15); ctx.lineTo(px+pr*.5,gy-pr*1.15); ctx.lineTo(px+pr*.32,gy-pr*.85); ctx.fill();
        ctx.fillRect(px-pr*.45,gy-pr*.6,pr*.9,pr*.12); }
    }
  }
  function scenery(sc,sx,gy,s){
    var wpx=s*(W/2);
    if(sc.t===0){ /* stacked cubes */
      var cw=wpx*700; if(cw<3) return; var side=sx<W/2?1:-1;
      var fcA=function(i){ return PAL[(i+sc.h)%6]; }, tcA=function(i){ return PAL[(i+sc.h+2)%6]; };
      drawCube(sx,gy,cw,fcA,tcA,side); if(sc.h%2) drawCube(sx+cw*0.04,gy-cw*1.2,cw*0.78,function(i){ return PAL[(i+sc.h+3)%6]; },tcA,side);
    }else if(T.tree){ var tw2=wpx*520; if(tw2<3) return; treeX(T.tree,sc,sx,gy,tw2); }
    else{ /* faceted pine */
      var tw=wpx*520; if(tw<3) return;
      ctx.fillStyle='#2a1c14'; ctx.fillRect(sx-tw*0.06,gy-tw*0.3,tw*0.12,tw*0.3);
      for(var j=0;j<3;j++){ var yy=gy-tw*0.25-j*tw*0.42, ww=tw*(0.62-j*0.14); ctx.fillStyle=j%2?'#1c5c46':'#217a5a'; ctx.beginPath(); ctx.moveTo(sx,yy-tw*0.5); ctx.lineTo(sx+ww,yy); ctx.lineTo(sx-ww,yy); ctx.closePath(); ctx.fill(); }
    }
  }
  function rampSprite(rp,sx,gy,s,now){
    var w=s*(W/2)*ROADW*.34; if(w<5) return; var h=w*.62;
    var gl=ctx.createRadialGradient(sx,gy-h,w*.1,sx,gy-h,w*1.5); gl.addColorStop(0,'rgba(120,230,255,'+(.3+.15*Math.sin(now/150))+')'); gl.addColorStop(1,'rgba(120,230,255,0)'); ctx.fillStyle=gl; ctx.fillRect(sx-w*1.5,gy-h-w*1.5,w*3,w*3);
    var g=ctx.createLinearGradient(0,gy,0,gy-h); g.addColorStop(0,'#4d5761'); g.addColorStop(1,'#b6c3d0');
    ctx.fillStyle='#2a3036'; ctx.beginPath(); ctx.moveTo(sx-w,gy); ctx.lineTo(sx-w*.88,gy-h); ctx.lineTo(sx-w*.88,gy-h*.18); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(sx+w,gy); ctx.lineTo(sx+w*.88,gy-h); ctx.lineTo(sx+w*.88,gy-h*.18); ctx.closePath(); ctx.fill();
    ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(sx-w,gy); ctx.lineTo(sx+w,gy); ctx.lineTo(sx+w*.88,gy-h); ctx.lineTo(sx-w*.88,gy-h); ctx.closePath(); ctx.fill();
    for(var k=0;k<4;k++){ var t0=((k/4)+((now/500)%1)/4), t1=t0+.1, wa=w*(1-.12*t0), wb=w*(1-.12*t1); ctx.fillStyle=k%2?'rgba(253,190,24,.95)':'rgba(255,255,255,.88)'; ctx.beginPath(); ctx.moveTo(sx-wa,gy-h*t0); ctx.lineTo(sx+wa,gy-h*t0); ctx.lineTo(sx+wb,gy-h*t1); ctx.lineTo(sx-wb,gy-h*t1); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle='rgba(255,255,255,.9)'; ctx.fillRect(sx-w*.88,gy-h-w*.05,w*1.76,w*.07);
  }
  var WGC=[null,['255,247,205','255,210,110','255,236,150'],['70,40,110','150,50,170','255,70,110'],['255,150,60','210,50,20','255,210,90'],null,null];
  function aura(cx,cy,w,a,now,al){ var r=w*(.85+.06*Math.sin(now/260)), g=ctx.createRadialGradient(cx,cy,w*.1,cx,cy,r); g.addColorStop(0,a[0]+'66'); g.addColorStop(.6,a[1]+'33'); g.addColorStop(1,a[1]+'00'); ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=al==null?1:al; ctx.fillStyle=g; ctx.fillRect(cx-r,cy-r,r*2,r*2); ctx.restore(); }
  function drawWings(cx,by,w,open,now,flying,wg){
    if(open<=0.02) return; wg=wg|0; var flap=Math.sin(now/(flying?95:140))*.13*open, span=w*(.22+.62*Math.min(1.1,open)), ay=by-w*.52, pal=WGC[wg]||['255,255,255','225,245,255','130,205,255'];
    ctx.save();
    if(wg===1){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.strokeStyle='rgba(255,230,140,'+(.85*Math.min(1,open))+')'; ctx.lineWidth=Math.max(2,w*.03); ctx.beginPath(); ctx.ellipse(cx,by-w*1.18,w*.2,w*.05,0,0,7); ctx.stroke(); ctx.restore(); }
    for(var sd=-1;sd<=1;sd+=2){ ctx.save(); ctx.translate(cx+sd*w*.44,ay); ctx.scale(sd,1); ctx.rotate(-.28-flap+(1-Math.min(1,open))*1.1); ctx.globalAlpha=Math.min(1,open*1.6);
      var gc=wg===1?'255,225,130':wg===2?'255,60,110':wg===3?'255,130,40':wg===4?'90,200,255':wg===5?'255,60,220':wg===6?'255,120,255':wg===7?'170,130,255':'160,225,255';
      var gl=ctx.createRadialGradient(span*.5,0,2,span*.5,0,span*.9); gl.addColorStop(0,'rgba('+gc+',.1)'); gl.addColorStop(1,'rgba('+gc+',0)'); ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle=gl; ctx.fillRect(-span*.2,-span*.8,span*1.6,span*1.6); ctx.restore();
      if(wg===2||wg===3){ /* membrane wings: bat = scalloped, dragon = ribbed with fire edge */
        var n=wg===2?4:5, pts=[[0,0]]; for(var i=0;i<=n;i++){ var a2=-.62+i*(.95/n), L=span*(i%2?.78:1)*(wg===3?1.08:1); pts.push([Math.cos(a2)*L,Math.sin(a2)*L]); } pts.push([span*.28,span*.5]);
        var mg=ctx.createLinearGradient(0,0,span,0); mg.addColorStop(0,'rgb('+pal[0]+')'); mg.addColorStop(.7,'rgb('+pal[1]+')'); mg.addColorStop(1,'rgb('+pal[2]+')'); ctx.fillStyle=mg; ctx.beginPath(); ctx.moveTo(0,0); for(var j=1;j<pts.length;j++){ if(wg===2&&j>1&&j<pts.length-1){ var pr=pts[j-1]; ctx.quadraticCurveTo((pr[0]+pts[j][0])/2*0.78,(pr[1]+pts[j][1])/2+span*.14,pts[j][0],pts[j][1]); } else ctx.lineTo(pts[j][0],pts[j][1]); } ctx.closePath(); ctx.fill();
        ctx.strokeStyle='rgba('+pal[2]+',.9)'; ctx.lineWidth=Math.max(1.5,w*.014); for(var k2=1;k2<pts.length-1;k2++){ ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(pts[k2][0],pts[k2][1]); ctx.stroke(); }
        if(wg===3&&flying&&open>.9){ ctx.save(); ctx.globalCompositeOperation='lighter'; for(var e=0;e<4;e++){ var ex=span*(.55+.12*e), ey=Math.sin(now/120+e)*span*.1-span*.05-e*span*.05; ctx.fillStyle='rgba(255,'+(150+e*25)+',60,.8)'; ctx.beginPath(); ctx.arc(ex,ey+((now/9+e*40)%50),w*.02,0,7); ctx.fill(); } ctx.restore(); } }
      else if(wg===4){ /* cube wings: stacked Rubik tiles */
        var CC=['#d33','#f80','#fd2','#2b4','#27d','#eee']; for(var r=0;r<3;r++){ var cnt=4-r; for(var c=0;c<cnt;c++){ var tx=span*.12+c*span*.24, ty=-r*span*.2+c*span*.04-span*.05, ts=span*.19; ctx.fillStyle=CC[(r*2+c)%6]; ctx.fillRect(tx,ty,ts,ts); ctx.strokeStyle='rgba(0,0,0,.65)'; ctx.lineWidth=Math.max(1.5,w*.012); ctx.strokeRect(tx,ty,ts,ts); ctx.fillStyle='rgba(255,255,255,.28)'; ctx.fillRect(tx,ty,ts,ts*.3); } } }
      else if(wg===5||wg===7){ /* neon outline wings (7 = plasma: white-hot core + arcs) */
        ctx.save(); ctx.globalCompositeOperation='lighter'; for(var q=0;q<5;q++){ var a3=-.5+q*.16, L2=span*(1-q*.08), ex2=Math.cos(a3)*L2, ey2=Math.sin(a3)*L2; ctx.strokeStyle=wg===7?(q%2?'rgba(255,255,255,.97)':'rgba(170,120,255,.95)'):(q%2?'rgba(0,240,255,.95)':'rgba(255,60,220,.95)'); ctx.lineWidth=Math.max(2,w*(wg===7?.04:.03)); ctx.lineCap='round'; ctx.shadowColor=wg===7?'#a678ff':(q%2?'#0ff':'#f3d'); ctx.shadowBlur=w*.12; ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(ex2*.55,ey2*.5-span*.12,ex2,ey2); ctx.stroke();
          if(wg===7&&q%2===0){ var ar=mulberry(Math.floor(now/70)+q), ax=0, ay2=0; ctx.lineWidth=Math.max(1,w*.012); ctx.strokeStyle='rgba(220,240,255,.9)'; ctx.beginPath(); ctx.moveTo(0,0); for(var z2=1;z2<=6;z2++){ ax=ex2*z2/6+(ar()-.5)*w*.1; ay2=ey2*z2/6+(ar()-.5)*w*.1; ctx.lineTo(ax,ay2); } ctx.stroke(); } } ctx.restore(); }
      else{
        for(var i=0;i<6;i++){ var a=-.34+i*.15, L=span*(1-i*.065), th=w*(.085-.007*i), ex=Math.cos(a)*L, ey=Math.sin(a)*L;
          var fg=ctx.createLinearGradient(0,0,ex,ey); if(wg===6){ var hh=(now/14+i*38)%360; fg.addColorStop(0,'hsla('+hh+',95%,80%,.98)'); fg.addColorStop(.7,'hsla('+(hh+50)%360+',95%,68%,.96)'); fg.addColorStop(1,'hsla('+(hh+110)%360+',95%,62%,.9)'); } else { fg.addColorStop(0,'rgba('+pal[0]+',.98)'); fg.addColorStop(.7,'rgba('+pal[1]+',.96)'); fg.addColorStop(1,'rgba('+pal[2]+',.9)'); } ctx.fillStyle=fg;
          ctx.beginPath(); ctx.moveTo(0,-th*.5); ctx.lineTo(ex*.9,ey-th*.9); ctx.lineTo(ex,ey); ctx.lineTo(ex*.88,ey+th*.8); ctx.lineTo(0,th*.5); ctx.closePath(); ctx.fill(); ctx.strokeStyle=wg===1?'rgba(220,160,40,.75)':'rgba(90,170,235,.75)'; ctx.lineWidth=Math.max(1,w*.006); ctx.stroke(); } }
      if(flying&&open>.9){ var tx=Math.cos(-.34)*span, ty=Math.sin(-.34)*span; ctx.save(); ctx.globalCompositeOperation='lighter'; var tg=ctx.createLinearGradient(tx,ty,tx+w*.05,ty+w*(.9+S.speed/MAXV)); tg.addColorStop(0,'rgba('+gc+',.75)'); tg.addColorStop(1,'rgba('+gc+',0)'); ctx.strokeStyle=tg; ctx.lineWidth=Math.max(2,w*.02); ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(tx+w*.05,ty+w*(.9+S.speed/MAXV)); ctx.stroke(); ctx.restore(); }
      ctx.restore(); }
    ctx.restore();
  }
  function skySprite(sk,sx,gy0,s,now,ix){
    var lift=s*(W/2)*300*((.4+.55*(sk.h==null?.5:sk.h))/.675), gy=gy0-lift, w=s*(W/2)*680; if(w<5) return; ctx.save();
    if(sk.type==='crate'){ var cw2=w*.42; ctx.fillStyle='#3a2a1c'; ctx.fillRect(sx-cw2*.5,gy-cw2,cw2,cw2); ctx.fillStyle='#ff9a3d'; ctx.fillRect(sx-cw2*.5,gy-cw2,cw2,cw2*.18); ctx.fillRect(sx-cw2*.5,gy-cw2*.18,cw2,cw2*.18);
      ctx.strokeStyle='rgba(255,200,120,.9)'; ctx.lineWidth=Math.max(1.5,cw2*.05); ctx.strokeRect(sx-cw2*.5,gy-cw2,cw2,cw2); ctx.globalCompositeOperation='lighter'; var pg=ctx.createRadialGradient(sx,gy-cw2*.5,1,sx,gy-cw2*.5,cw2*1.4); pg.addColorStop(0,'rgba(255,170,80,'+(.35+.15*Math.sin(now/160+ix))+')'); pg.addColorStop(1,'rgba(255,120,40,0)'); ctx.fillStyle=pg; ctx.fillRect(sx-cw2*1.5,gy-cw2*2,cw2*3,cw2*3); ctx.globalCompositeOperation='source-over'; ctx.fillStyle='#fff'; ctx.font='700 '+Math.max(10,cw2*.6)+'px system-ui'; ctx.textAlign='center'; ctx.fillText('🚀',sx,gy-cw2*.3); ctx.restore(); return; }
    if(sk.type==='missile'){ var near=ix-Math.floor(S.pos/SEG), wr=near>12?.4+.3*Math.sin(now/90):1, mr=w*.22; ctx.globalCompositeOperation='lighter'; var mg2=ctx.createRadialGradient(sx,gy-mr,1,sx,gy-mr,mr*3); mg2.addColorStop(0,'rgba(255,90,60,'+(.7*wr)+')'); mg2.addColorStop(1,'rgba(255,60,40,0)'); ctx.fillStyle=mg2; ctx.fillRect(sx-mr*3,gy-mr*4,mr*6,mr*6); ctx.globalCompositeOperation='source-over';
      ctx.fillStyle='#2a2f38'; ctx.beginPath(); ctx.moveTo(sx,gy-mr*2.2); ctx.lineTo(sx+mr*.7,gy-mr*.4); ctx.lineTo(sx+mr*1.2,gy); ctx.lineTo(sx-mr*1.2,gy); ctx.lineTo(sx-mr*.7,gy-mr*.4); ctx.closePath(); ctx.fill(); ctx.fillStyle='#ff4a3a'; ctx.beginPath(); ctx.moveTo(sx,gy-mr*2.2); ctx.lineTo(sx+mr*.35,gy-mr*1.4); ctx.lineTo(sx-mr*.35,gy-mr*1.4); ctx.closePath(); ctx.fill();
      ctx.globalCompositeOperation='lighter'; var fg3=ctx.createLinearGradient(sx,gy,sx,gy+mr*3); fg3.addColorStop(0,'rgba(255,200,90,.9)'); fg3.addColorStop(1,'rgba(255,90,20,0)'); ctx.fillStyle=fg3; ctx.fillRect(sx-mr*.6,gy,mr*1.2,mr*3); if(near>2&&near<22){ ctx.strokeStyle='rgba(255,70,50,'+(.5*wr)+')'; ctx.lineWidth=Math.max(2,mr*.18); ctx.setLineDash([mr*.6,mr*.4]); ctx.beginPath(); ctx.moveTo(sx,gy0-lift*0); ctx.lineTo(sx,gy-mr*2.5); ctx.stroke(); ctx.setLineDash([]); } ctx.restore(); return; }
    if(sk.type==='bolt'){ var nb=ix-Math.floor(S.pos/SEG), strike=nb<=7, bw2=w*.5, pul2=.6+.4*Math.sin(now/70); ctx.globalCompositeOperation='lighter';
      ctx.strokeStyle='rgba(255,'+(strike?240:90)+','+(strike?255:90)+','+(.8*pul2)+')'; ctx.lineWidth=Math.max(2,bw2*.08); ctx.beginPath(); ctx.ellipse(sx,gy0,bw2*.7,bw2*.16,0,0,7); ctx.stroke();
      if(!strike){ ctx.setLineDash([bw2*.12,bw2*.12]); ctx.strokeStyle='rgba(200,190,255,'+(.35*pul2)+')'; ctx.beginPath(); ctx.moveTo(sx,gy0); ctx.lineTo(sx,gy0-w*2.2); ctx.stroke(); ctx.setLineDash([]); }
      else{ var br2=mulberry(ix*7+3), qx2=sx, qy2=gy0-w*2.6; for(var ps=0;ps<2;ps++){ br2=mulberry(ix*7+3); qx2=sx+(br2()-.5)*bw2*.3; qy2=gy0-w*2.6; ctx.strokeStyle=ps?'rgba(255,255,255,.95)':'rgba(160,170,255,.55)'; ctx.lineWidth=Math.max(ps?2:6,bw2*(ps?.05:.2)); ctx.beginPath(); ctx.moveTo(qx2,qy2); while(qy2<gy0){ qy2+=bw2*(.25+br2()*.3); qx2+=(br2()-.5)*bw2*.55; ctx.lineTo(Math.abs(qy2-gy0)<bw2*.3?sx:qx2,Math.min(gy0,qy2)); } ctx.stroke(); }
        var gg3=ctx.createRadialGradient(sx,gy0,2,sx,gy0,bw2*1.3); gg3.addColorStop(0,'rgba(210,220,255,.7)'); gg3.addColorStop(1,'rgba(210,220,255,0)'); ctx.fillStyle=gg3; ctx.fillRect(sx-bw2*1.4,gy0-bw2*1.4,bw2*2.8,bw2*2.8); }
      ctx.restore(); return; }
    if(sk.type==='ring'&&sk.sr){ ctx.globalAlpha=1; }
    if(sk.type==='cloud'){ var lg=(Math.floor(now/140+ix)%11===0);
      var puffs=[[-.5,.05,.42],[-.15,-.1,.55],[.25,-.02,.5],[.55,.08,.36],[0,.18,.5]]; puffs.forEach(function(q){ var g=ctx.createRadialGradient(sx+q[0]*w,gy-w*.3+q[1]*w,2,sx+q[0]*w,gy-w*.3+q[1]*w,q[2]*w); g.addColorStop(0,'rgba(88,70,130,.95)'); g.addColorStop(.7,'rgba(55,44,90,.85)'); g.addColorStop(1,'rgba(40,30,70,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx+q[0]*w,gy-w*.3+q[1]*w,q[2]*w,0,7); ctx.fill(); });
      if(lg){ ctx.globalCompositeOperation='lighter'; ctx.strokeStyle='rgba(220,200,255,.95)'; ctx.lineWidth=Math.max(2,w*.03); ctx.beginPath(); var bx=sx+(Math.sin(ix)*.2)*w, by=gy-w*.2; ctx.moveTo(bx,by); for(var k=0;k<5;k++){ bx+=(Math.sin(ix*3+k)*.12)*w; by+=w*.12; ctx.lineTo(bx,by); } ctx.stroke(); var fg=ctx.createRadialGradient(sx,gy-w*.3,2,sx,gy-w*.3,w*.8); fg.addColorStop(0,'rgba(200,170,255,.45)'); fg.addColorStop(1,'rgba(200,170,255,0)'); ctx.fillStyle=fg; ctx.fillRect(sx-w,gy-w*1.2,w*2,w*1.8); } }
    else if(sk.type==='drone'){ var bw=w*.55; ctx.fillStyle='#1b2026'; ctx.fillRect(sx-bw*.5,gy-bw*.55,bw,bw*.4); ctx.fillStyle='#39424c'; ctx.fillRect(sx-bw*.5,gy-bw*.55,bw,bw*.1);
      ctx.strokeStyle='#8a96a4'; ctx.lineWidth=Math.max(2,w*.03); ctx.beginPath(); ctx.moveTo(sx-bw*.5,gy-bw*.5); ctx.lineTo(sx-bw*1.05,gy-bw*.7); ctx.moveTo(sx+bw*.5,gy-bw*.5); ctx.lineTo(sx+bw*1.05,gy-bw*.7); ctx.stroke();
      [-1.05,1.05].forEach(function(d){ var ph=now/35%6.28; ctx.strokeStyle='rgba(210,225,240,.7)'; ctx.lineWidth=Math.max(1.5,w*.02); ctx.beginPath(); ctx.ellipse(sx+d*bw,gy-bw*.72,bw*.5,bw*.07,0,0,7); ctx.stroke(); ctx.fillStyle='rgba(210,225,240,.25)'; ctx.fill(); });
      var on=Math.floor(now/200+ix)%2; ctx.globalCompositeOperation='lighter'; var eg=ctx.createRadialGradient(sx,gy-bw*.35,1,sx,gy-bw*.35,bw*.7); eg.addColorStop(0,on?'rgba(255,60,60,.95)':'rgba(255,60,60,.35)'); eg.addColorStop(1,'rgba(255,60,60,0)'); ctx.fillStyle=eg; ctx.fillRect(sx-bw,gy-bw,bw*2,bw*1.3); }
    else if(sk.type==='meteor'){ var r=w*.34; ctx.globalCompositeOperation='lighter'; var tg=ctx.createLinearGradient(sx,gy-r,sx+r*1.6,gy-r*5); tg.addColorStop(0,'rgba(255,170,60,.85)'); tg.addColorStop(1,'rgba(255,90,20,0)'); ctx.fillStyle=tg; ctx.beginPath(); ctx.moveTo(sx-r*.8,gy-r); ctx.lineTo(sx+r*.8,gy-r*1.2); ctx.lineTo(sx+r*1.9,gy-r*5); ctx.closePath(); ctx.fill();
      ctx.globalCompositeOperation='source-over'; ctx.fillStyle='#3a2a22'; ctx.beginPath(); ctx.moveTo(sx-r,gy-r*.7); ctx.lineTo(sx-r*.4,gy-r*1.5); ctx.lineTo(sx+r*.5,gy-r*1.5); ctx.lineTo(sx+r,gy-r*.8); ctx.lineTo(sx+r*.2,gy-r*.1); ctx.closePath(); ctx.fill(); ctx.fillStyle='rgba(255,140,40,.55)'; ctx.beginPath(); ctx.moveTo(sx-r*.5,gy-r*1.45); ctx.lineTo(sx+r*.5,gy-r*1.45); ctx.lineTo(sx+r*.2,gy-r*.9); ctx.closePath(); ctx.fill();
      ctx.globalCompositeOperation='lighter'; var mg=ctx.createRadialGradient(sx,gy-r*.9,1,sx,gy-r*.9,r*1.7); mg.addColorStop(0,'rgba(255,150,50,.55)'); mg.addColorStop(1,'rgba(255,100,30,0)'); ctx.fillStyle=mg; ctx.fillRect(sx-r*2,gy-r*3,r*4,r*4); }
    else { var rr=w*.5, pul=.7+.3*Math.sin(now/130+ix), rc=sk.sr?'255,205,90':'125,240,255'; ctx.globalCompositeOperation='lighter'; ctx.lineCap='round';
      var hg=ctx.createRadialGradient(sx,gy-rr*.9,rr*.4,sx,gy-rr*.9,rr*1.6); hg.addColorStop(0,'rgba('+rc+',0)'); hg.addColorStop(.6,'rgba('+rc+','+(.3*pul)+')'); hg.addColorStop(1,'rgba('+rc+',0)'); ctx.fillStyle=hg; ctx.fillRect(sx-rr*1.7,gy-rr*2.6,rr*3.4,rr*3.4);
      ctx.strokeStyle='rgba('+rc+','+(.9*pul)+')'; ctx.lineWidth=Math.max(3,rr*.16); ctx.beginPath(); ctx.ellipse(sx,gy-rr*.9,rr*.9,rr,0,0,7); ctx.stroke(); ctx.strokeStyle='rgba(255,255,255,'+(.8*pul)+')'; ctx.lineWidth=Math.max(1.5,rr*.05); ctx.stroke(); }
    ctx.restore();
  }
  var stp=[]; (function(){ var r=mulberry(4242); for(var q=0;q<90;q++) stp.push({x:r()*960,y:r()*540,v:.7+r()*.6}); })();
  function missileFx(now){
    if(S.mis){ var k=(performance.now()-S.mis.t0)/750; if(k>=1){ var ex=W/2+S.mis.lane*W*.12; burst(ex,HOR+30,'#ffd36b',16,360); vring(ex,HOR+30,'255,190,90',10,W*.25,.5,10); S.mis=null; }
      else { var sx0=W/2, sy0=H-130, tx=W/2+S.mis.lane*W*.12, ty=HOR+30, e=k*k*(3-2*k), mx=sx0+(tx-sx0)*e, my=sy0+(ty-sy0)*e, sc=1-.75*e; ctx.save(); ctx.globalCompositeOperation='lighter';
        var tg=ctx.createLinearGradient(mx,my,sx0+(mx-sx0)*.2,sy0+(my-sy0)*.2); tg.addColorStop(0,'rgba(255,200,110,.9)'); tg.addColorStop(1,'rgba(255,120,40,0)'); ctx.strokeStyle=tg; ctx.lineWidth=10*sc; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(sx0+(mx-sx0)*.2,sy0+(my-sy0)*.2); ctx.lineTo(mx,my); ctx.stroke();
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(mx,my,7*sc,0,7); ctx.fill(); ctx.restore(); } }
    if(S.inc){ var rem=Math.max(0,(S.inc.at-Date.now())/1000), pu2=.5+.5*Math.sin(now/55); ctx.save(); ctx.strokeStyle='rgba(255,60,50,'+(.35+.5*pu2)+')'; ctx.lineWidth=14; ctx.strokeRect(7,7,W-14,H-14); ctx.fillStyle='rgba(255,50,40,'+(.10*pu2)+')'; ctx.fillRect(0,0,W,H);
      ctx.textAlign='center'; ctx.font='900 30px system-ui'; ctx.fillStyle='rgba(255,90,70,'+(.7+.3*pu2)+')'; ctx.fillText('⚠ MISSILE INCOMING · '+String(S.inc.f).slice(0,10).toUpperCase(),W/2,HOR+70); ctx.font='700 16px system-ui'; ctx.fillStyle='#ffd0c8'; ctx.fillText('dodge sideways or climb/dive!',W/2,HOR+94); ctx.restore(); }
  }
  function stormFx(now){
    var m=S.stm; if(m<.02) return; ctx.save();
    ctx.fillStyle='rgba(4,8,24,'+(.5*m)+')'; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(190,210,245,'+(.5*m)+')'; ctx.lineWidth=1.8; ctx.beginPath();
    var dt2=Math.min(.05,(now-(S.stR||now))/1000); S.stR=now;
    stp.forEach(function(d){ d.y+=(1100+S.speed/MAXV*500)*d.v*dt2; d.x-=(220)*d.v*dt2; if(d.y>H){ d.y=-30; d.x=Math.random()*(W+200); } if(d.x<-20) d.x+=W+40; ctx.moveTo(d.x,d.y); ctx.lineTo(d.x+14,d.y-30); }); ctx.stroke();
    if(S.bolt>0){ ctx.fillStyle='rgba(215,228,255,'+(.35*Math.max(0,S.bolt/.3)*m)+')'; ctx.fillRect(0,0,W,H); }
    ctx.restore();
  }
  function drawBoss(now){
    var pn=S.pos/TL; if(!(S.flyOn||S.bossDead)||pn<.845) return;
    var ap=Math.min(1,(pn-.845)/.045), dead=S.bossDead?Math.min(1,(Date.now()-S.finishAt)/1300):0; if(dead>=1) return;
    var bw=W*(.5-.12*dead), cx=W/2+Math.sin(now/1100)*W*.07, cy=HOR*(.22+.16*ap)-ap*0+dead*HOR*.3-(1-ap)*HOR*.4, nxt=0, ci=Math.floor(S.pos/SEG);
    for(var q=ci;q<ci+10;q++){ var sg=segs[q]; if(sg&&sg.bs){ nxt=1-(q-ci)/10; break; } }
    ctx.save(); ctx.globalAlpha=(1-dead)*Math.min(1,ap*2); ctx.translate(cx,cy); if(dead>0){ ctx.rotate(dead*.5); }
    var bg=ctx.createLinearGradient(0,-bw*.2,0,bw*.22); bg.addColorStop(0,'#3a2f55'); bg.addColorStop(.6,'#1d1730'); bg.addColorStop(1,'#0e0a18'); ctx.fillStyle=bg; ctx.beginPath(); ctx.ellipse(0,0,bw*.5,bw*.14,0,0,7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-bw*.28,-bw*.05); ctx.quadraticCurveTo(0,-bw*.34,bw*.28,-bw*.05); ctx.closePath(); ctx.fillStyle='#2a2142'; ctx.fill();
    ctx.globalCompositeOperation='lighter'; for(var i=-4;i<=4;i++){ var lx=i*bw*.1, on=(Math.floor(now/220)+i)%3===0; ctx.fillStyle=on?'rgba(255,90,70,.95)':'rgba(255,90,70,.28)'; ctx.beginPath(); ctx.arc(lx,bw*.06-Math.abs(i)*bw*.004,bw*.014,0,7); ctx.fill(); }
    var eg=ctx.createRadialGradient(0,-bw*.1,2,0,-bw*.1,bw*.16*(1+.4*nxt)); eg.addColorStop(0,'rgba(255,80,60,'+(.7+.3*nxt)+')'); eg.addColorStop(1,'rgba(255,40,40,0)'); ctx.fillStyle=eg; ctx.fillRect(-bw*.2,-bw*.3,bw*.4,bw*.4);
    [-1,1].forEach(function(d){ ctx.fillStyle='rgba(255,230,160,.95)'; ctx.beginPath(); ctx.ellipse(d*bw*.07,-bw*.1,bw*.022,bw*.012,d*.3,0,7); ctx.fill(); });
    if(nxt>0){ [-.3,-.1,.1,.3].forEach(function(px){ var cg=ctx.createRadialGradient(px*bw,bw*.1,1,px*bw,bw*.1,bw*.06*(.4+nxt)); cg.addColorStop(0,'rgba(255,160,70,'+nxt+')'); cg.addColorStop(1,'rgba(255,60,20,0)'); ctx.fillStyle=cg; ctx.fillRect(px*bw-bw*.08,bw*.02,bw*.16,bw*.16); }); }
    ctx.restore();
  }
  function flyFx(now){
    if(!S.flyOn) return; var f=S.fly; ctx.save();
    var hz=ctx.createLinearGradient(0,HOR,0,H); hz.addColorStop(0,'rgba(190,220,255,0)'); hz.addColorStop(1,'rgba(190,220,255,'+(.1*f)+')'); ctx.fillStyle=hz; ctx.fillRect(0,HOR,W,H-HOR);
    for(var i=0;i<9;i++){ var ph=((now*.00018*(1+S.speed/MAXV)+i/9)%1), y=HOR+Math.pow(ph,1.7)*(H-HOR+80), sd=(i%2?1:-1), x=W/2+sd*(40+ph*ph*W*.62+(i*53%90)), r=30+ph*ph*220; var g=ctx.createRadialGradient(x,y,2,x,y,r); g.addColorStop(0,'rgba(215,225,245,'+(.16*f*Math.min(1,ph*3))+')'); g.addColorStop(1,'rgba(255,255,255,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(x,y,r*1.5,r*.55,0,0,7); ctx.fill(); }
    ctx.restore();
  }
  function obstacle(ob,sx,gy,s){
    var wpx=s*(W/2)*620; if(wpx<3) return;
    if(ob.type==='block'){
      var fc=function(i){ return (i%2===0)?'#eb402f':'#23282c'; }, tc=function(){ return '#fdbe18'; };
      drawCube(sx,gy,wpx,fc,tc,0);
    }
  }

  /* ---- other racers (ghost cars driven by their reported progress) ---- */
  function syncOthers(dt,now){
    var list=(o.others&&o.others())||[], seen={};
    list.forEach(function(p){
      var key=p.name; seen[key]=1; var s=others[key];
      var prog=p.done!=null?100:(p.prog||0);
      if(!s){ s=others[key]={vis:prog,a:prog,t:now,v:0,h:nameHash(key),lane:((nameHash(key)%7)-3)/7*0.9,car:0}; }
      s.car=p.car|0; s.fx=p.fx||null;
      if(prog!==s.a){ var el=Math.max(300,now-s.t); s.v=Math.max(0,(prog-s.a)/el); s.a=prog; s.t=now; }
      var pred=Math.min(100,s.a+s.v*Math.min(1600,now-s.t)); if(p.done!=null) pred=100;
      s.vis+=(pred-s.vis)*Math.min(1,dt*4); s.done=p.done!=null; s.name=key;
    });
    Object.keys(others).forEach(function(kk){ if(!seen[kk]) delete others[kk]; });
  }

  /* ---- physics ---- */
  function steerInput(){
    var st=keys.r-keys.l+touch;
    if(window.CW_LIVE&&CW_LIVE.autopilot){
      var ix=Math.floor(S.pos/SEG),tgt=-0.05*seg(ix+6).curve;
      for(var a=4;a<26;a++){ var s=segAt(ix+a); if(s.ob&&s.ob.type==='block'&&!s.ob.done&&Math.abs(s.ob.x-S.px)<0.55){ tgt=s.ob.x>S.px?s.ob.x-0.6:s.ob.x+0.6; break; } }
      st=Math.max(-1,Math.min(1,(tgt-S.px)*4)); if(S.air>0) st=1;
    }
    return Math.max(-1,Math.min(1,st));
  }
  function launch(spct){ S.air=1; S.airT=0; S.airDur=.55+.45*Math.min(1,spct); S.spin=0; S.boostT=Math.max(S.boostT,.5); pop('AIR TIME!','#9fe3ff'); SFX.jump(); vfxLaunch(); try{ navigator.vibrate&&navigator.vibrate(25); }catch(e){} }
  function land(){ var rot=Math.floor(Math.abs(S.spin)/6.2832+.3); S.spinR=S.spin-Math.round(S.spin/6.2832)*6.2832; S.air=0; S.landK=1; S.squash=1; S.spin=0;
    if(rot>=1){ S.tricks+=rot; S.boostT=Math.max(S.boostT,Math.min(1.7,.8+.45*rot)); S.nitro=Math.min(100,S.nitro+14*rot); S.flash=.35; S.flashC='253,190,24'; pop(rot>1?'DOUBLE TRICK ×'+rot+'!':'TRICK BOOST!','#fdbe18'); SFX.trick(); vfxLand(rot); }
    else{ SFX.land(); vfxLand(0); } }  function fire(){
    if(!S.flyOn||S.finished||S.t<900) return false; if(S.fireT>0) return false;
    if(S.ammo<=0){ pop('NO MISSILES · find a 🚀 crate','#b4bcc3'); S.fireT=.5; return false; }
    var best=null,bd=1e9,mine=S.pos/TL*100; Object.keys(others).forEach(function(k){ var q=others[k], d=q.vis-mine; if(d>-2&&d<30&&!q.done&&d<bd){ best=q; bd=d; } });
    if(!best){ pop('NO TARGET AHEAD','#b4bcc3'); S.fireT=.6; return false; }
    S.ammo--; S.fireT=1.4; S.mis={t0:performance.now(),lane:best.lane||0}; pop('MISSILE AWAY 🚀','#ffb36b'); SFX.boost(); burst(W/2,H-170,'#ffb36b',10,260);
    if(o.onFire) o.onFire(best.name); return true;
  }
  function skyHit(ty,lab0){
    if(ty!=='ring'&&S.phaseT>0){ pop('PHASED THROUGH!','#8ff7ff'); SFX.near(); vfxPhase(); return; }
    if(S.shield){ S.shield=0; S.shake=.25; S.flash=.3; S.flashC='120,215,255'; pop('SHIELD BROKE!','#7fd7ff'); SFX.near(); burst(W/2,H-110,'#7fd7ff',16,320); vfxShield(); return; }
    var lab=ty==='cloud'?'STORM CLOUD!':ty==='drone'?'DRONE HIT!':ty==='bolt'?'LIGHTNING STRIKE!':ty==='missile'?'MISSILE HIT!':'METEOR!', col=ty==='cloud'?'#c9a0ff':ty==='bolt'?'#cfd8ff':'#ff7a6b';
    S.speed*=(ty==='cloud'?.55:ty==='bolt'?.4:ty==='missile'?.5:.32); S.shake=.5; S.flash=ty==='bolt'?.7:.45; S.flashC=ty==='cloud'?'170,120,255':ty==='bolt'?'235,240,255':'235,64,47'; S.hits++; S.combo=0; S.comboT=0;
    pop(lab0||lab,col); SFX.skyhit(); burst(W/2,H-160,ty==='cloud'?'#b890ff':ty==='bolt'?'#dfe8ff':'#eb402f',18,380); vfxCrash(false); if(ty==='bolt'){ S.bolt=.3; S.boltX=W/2; } try{ navigator.vibrate&&navigator.vibrate(90); }catch(e){}
  }

  function update(dt){
    if(S.finished){ S.speed=Math.max(0,S.speed-MAXV*0.5*dt);
      if(S.flyOn){ S.lndT+=dt; var lk=Math.min(1,S.lndT/1.4), le=lk*lk*(3-2*lk); S.fly=Math.min(S.fly,1-le); S.wing=Math.min(S.wing,1-Math.max(0,Math.min(1,(lk-.5)/.5))); S.stm=Math.max(0,S.stm-dt*.8);
        if(lk>=1&&!S.landed){ S.landed=true; S.slideT=1.1; S.landK=1; S.shake=.45; S.flash=.15; S.flashC='255,230,180'; S.flyOn=false; S.fly=0; S.wing=0; SFX.crash(); vfxLand(1); pop('TOUCHDOWN!','#ffd36b'); } }
      if(S.slideT>0) S.slideT-=dt; return; }
    var spct=S.speed/MAXV, ix=Math.floor(S.pos/SEG), sg=segAt(ix);
    var steer=steerInput(); S.steer+=(steer-S.steer)*Math.min(1,dt*12);
    if(S.flyOn){ var av=(keys.u?1:0)-(keys.d?1:0)+altT; S.ay=Math.max(0,Math.min(1,S.ay+Math.max(-1,Math.min(1,av))*dt*1.5)); }
    if(S.fireT>0) S.fireT-=dt;
    if(o.wfBots&&S.flyOn){ var pb0=S.pos/TL; if(pb0>.58&&pb0<.9){ S.botT=(S.botT==null?8+Math.random()*4:S.botT)-dt; if(S.botT<=0){ S.botT=9+Math.random()*5; var ks=Object.keys(others).filter(function(k){ return others[k].vis>S.pos/TL*100&&!others[k].done; }); if(ks.length&&!S.inc) S.inc={f:ks[(Math.random()*ks.length)|0],at:Date.now()+800,l:1}; } } }
    var wev=(o.wfIn&&o.wfIn())||[]; wev.forEach(function(e){ if(S.wfSeen[e.i]) return; S.wfSeen[e.i]=1; if(S.flyOn&&!S.finished&&!S.inc){ S.inc={f:e.f,at:e.at,l:1}; } });
    if(S.inc&&S.inc.px0==null){ S.inc.px0=S.px; S.inc.ay0=S.ay; }
    if(S.inc&&Date.now()>=S.inc.at){ var inc0=S.inc; S.inc=null; if(S.flyOn&&!S.finished&&(Math.abs(S.px-inc0.px0)>.4||Math.abs(S.ay-inc0.ay0)>.28)){ pop('MISSILE DODGED! 😎','#7df0ff'); SFX.near(); S.nitro=Math.min(100,S.nitro+10); burst(W/2,H-170,'#7df0ff',12,260); } else if(S.flyOn&&!S.finished) skyHit('missile','HIT BY '+String(inc0.f).slice(0,10).toUpperCase()+'!'); }
    { var pn0=S.pos/TL, stT=(S.flyOn&&pn0>.615&&pn0<.855)?1:0; S.stm+=(stT-S.stm)*Math.min(1,dt*1.6); if(stT&&!S.stIn){ S.stIn=true; pop('STORM FRONT!','#b9a6ff'); S.flash=.4; S.flashC='150,130,255'; } }
    if(window.CW_LIVE&&CW_LIVE.autopilot&&S.nitro>=100) useNitro();
    var dx=dt*2*Math.min(1,0.25+spct)*(S.air>0?.3:1);
    S.px+=S.steer*dx; S.px-=dt*2*spct*spct*sg.curve*CENT;
    /* gentle catch-up so the back of the pack stays in the fight */
    var lead=0; Object.keys(others).forEach(function(kk){ if(others[kk].vis>lead) lead=others[kk].vis; });
    var behind=lead-S.pos/TL*100, cu=behind>8?1+Math.min(.07,(behind-8)*.004):1;
    var cap=(S.odT>0?MAXV*1.4:S.boostT>0?MAXV*1.3:MAXV)*cu;
    S.speed+=ACC*dt*((S.boostT>0||S.odT>0)?2.4:1)*(cu>1?1.15:1);
    if(Math.abs(S.px)>1.06){ S.shake=Math.max(S.shake,.12); if(S.speed>OFFLIM) S.speed-=OFFDEC*dt; }
    if(S.speed>cap) S.speed=Math.max(cap,S.speed-MAXV*0.6*dt);
    S.px=Math.max(-2.3,Math.min(2.3,S.px));
    /* drift: lean into a bend and hold it, release for a mini turbo */
    var drifting=Math.abs(sg.curve)>.8&&spct>.6&&S.steer*sg.curve>.25&&Math.abs(S.px)<1.04;
    if(drifting&&!S.air){ S.drift+=dt; S.nitro=Math.min(100,S.nitro+dt*5); }
    else{ if(S.drift>=1){ var sup=S.drift>=2; S.boostT=Math.max(S.boostT,sup?1.9:.9+Math.min(.9,(S.drift-1)*.4)); S.flash=.3; S.flashC=sup?'194,139,255':'253,190,24'; pop(sup?'SUPER DRIFT!':'DRIFT BOOST!',sup?'#c28bff':'#fdbe18'); SFX.boost(); vfxDriftBoost(); } S.drift=0; }
    if(S.air>0){ S.airT+=dt; if(Math.abs(S.steer)>.35) S.spin+=(S.steer>0?1:-1)*dt*11; else S.spin*=Math.max(0,1-dt*2); if(S.airT>=S.airDur) land(); }
    /* slipstream behind another car */
    var sl=false; Object.keys(others).forEach(function(kk){ var oc=others[kk], d=oc.vis/100*TL-S.pos; if(d>SEG*.6&&d<SEG*7&&Math.abs(oc.lane-S.px)<.4) sl=true; });
    S.slipOn=sl;
    if(sl){ S.slip+=dt; if(S.slip>.9){ if(S.boostT<.5){ S.boostT=.9; pop('SLIPSTREAM!','#9be37a'); SFX.boost(); } S.slip=-1.5; } } else if(S.slip>0) S.slip=Math.max(0,S.slip-dt*2); else if(S.slip<0) S.slip=Math.min(0,S.slip+dt);
    var old=S.pos; S.pos+=S.speed*dt;
    var cur=Math.floor(S.pos/SEG);
    if(false&&!S.flyOn&&o.sk!==0&&S.pos>=TL*.5){ S.flyOn=true; S.tfT=0; S.air=0; S.boostT=Math.max(S.boostT,1.2); S.flash=.4; S.flashC='160,200,255'; S.shake=.5; pop('WINGS ONLINE!','#9fe3ff'); SFX.wings(); vfxWings(); }
    if(S.flyOn){ S.tfT+=dt; var ft=Math.min(1,S.tfT/1.6); S.fly=1-Math.pow(1-ft,3); S.wing=Math.min(1,S.tfT/.9); }
    for(var a=Math.floor(old/SEG);a<=cur;a++){
      var s2=segAt(a),ob=s2.ob,cn=s2.cn;
      if(s2.pu&&!s2.pu.done&&Math.abs(S.px-s2.pu.x)<.36){ takePu(s2.pu); }
      if(s2.rp&&!s2.rp.done&&!S.air&&!S.flyOn&&Math.abs(S.px-s2.rp.x)<.36){ s2.rp.done=true; launch(spct); }
      if(cn&&!cn.done&&Math.abs(S.px-cn.x)<(S.magT>0?.95:.3)){ cn.done=true; S.coins++; S.combo++; S.comboT=1.8; if(S.combo>S.bestCombo) S.bestCombo=S.combo; S.nitro=Math.min(100,S.nitro+4); SFX.coin(S.combo); burst(W/2,H-110,'#fdbe18',7,220); vfxCoin((cn.x-S.px)*W*.22); if(CZ) czCoin();
        if(S.combo===7){ S.nitro=Math.min(100,S.nitro+15); pop('PERFECT LINE!','#fdbe18'); } }
      var sk=s2.sk; if(sk&&!sk.done&&S.flyOn){ var skx=sk.type==='drone'?sk.x0+.3*Math.sin(a*.18):sk.x0, skr=(sk.type==='ring'||sk.type==='crate')?.42:sk.type==='cloud'?.3:sk.type==='bolt'?.24:.2, hy=Math.abs(S.ay-(sk.h==null?.5:sk.h)), vok=sk.type==='bolt'?true:(sk.type==='ring'||sk.type==='crate')?hy<.5:sk.type==='cloud'?hy<.34:hy<.28;
        if(Math.abs(S.px-skx)<skr&&vok){ sk.done=true;
          if(sk.type==='ring'){ S.boostT=Math.max(S.boostT,.7); S.nitro=Math.min(100,S.nitro+12); S.rings++; if(sk.sr){ S.stRings++; pop('STORM RING +1 🪙','#ffd36b'); } else pop('SKY RING!','#7df0ff'); SFX.boost(); vfxRing(); }
          else if(sk.type==='crate'){ S.ammo=Math.min(3,S.ammo+1); pop('MISSILE +1 🚀','#ffb36b'); SFX.boost(); burst(W/2,H-150,'#ffb36b',14,300); }
          else skyHit(sk.type); } }
      var bs=s2.bs; if(bs&&S.flyOn){ for(var bi=0;bi<bs.length;bi++){ var bm=bs[bi]; if(bm.done) continue; if(Math.abs(S.px-bm.x)<.22&&Math.abs(S.ay-bm.h)<.3){ bm.done=true; S.bossHits++; skyHit('missile'); } } }
      if(!ob||ob.done||ob.pass) continue;
      if(S.flyOn&&ob.type==='block'){ ob.pass=true; continue; }
      var rad=ob.type==='boost'?0.38:0.27, dxo=Math.abs(S.px-ob.x);
      if((S.air>0||S.flyOn)&&ob.type==='boost') continue;
      if(dxo<rad&&ob.type==='block'&&(S.air>0||S.phaseT>0)){ ob.pass=true; S.nitro=Math.min(100,S.nitro+6); if(S.air>0){ S.hops++; pop('SKY HOP!','#9fe3ff'); } else pop('PHASED THROUGH!','#8ff7ff'); SFX.near(); vfxPhase(); continue; }
      if(dxo<rad){ ob.done=true;
        if(ob.type==='boost'){ S.boostT=1.7; S.flash=.5; S.flashC='253,190,24'; S.boosts++; S.nitro=Math.min(100,S.nitro+10); SFX.boost(); vfxPad(); }
        else if(S.shield){ S.shield=0; S.shake=.25; S.flash=.3; S.flashC='120,215,255'; pop('SHIELD BROKE!','#7fd7ff'); SFX.near(); burst(W/2,H-110,'#7fd7ff',16,320); vfxShield(); }
        else{ S.speed*=0.32; S.shake=.5; S.flash=.45; S.flashC='235,64,47'; S.hits++; S.combo=0; S.comboT=0; SFX.crash(); burst(W/2,H-100,'#eb402f',16,380); vfxCrash(S.speed>MAXV*.6); try{ navigator.vibrate&&navigator.vibrate(90); }catch(e){} }
      } else if(ob.type==='block'&&a<cur&&dxo<rad+.2){ ob.pass=true; S.near++; S.nitro=Math.min(100,S.nitro+8); pop('CLOSE CALL!','#ff9f40'); SFX.near(); vfxClose(); }
    }
    if(S.comboT>0){ S.comboT-=dt; if(S.comboT<=0) S.combo=0; }
    if(S.magT>0) S.magT-=dt; if(S.phaseT>0) S.phaseT-=dt; if(S.odT>0) S.odT-=dt; if(S.landK>0) S.landK=Math.max(0,S.landK-dt*3.2); if(S.squash>0) S.squash=Math.max(0,S.squash-dt*3); if(S.rankPulse>0) S.rankPulse-=dt; if(S.boostT>0) S.boostT-=dt; if(S.shake>0) S.shake-=dt; if(S.flash>0) S.flash-=dt;
    if(CZ&&!S.finished) czGateStep();
    if(S.gateFlash>0) S.gateFlash-=dt;
    if(S.pos>=TL){ S.pos=TL; S.finished=true; S.finishAt=Date.now(); SFX.fin(); if(S.flyOn){ S.bossDead=1; var cl=S.bossHits===0, tk=Math.min(6,S.stRings)+(cl?10:0); pop(cl?'BOSS CLEARED! +10 🪙':'LEVIATHAN DOWN!',cl?'#ffd36b':'#ff9f7a'); vblast(W/2,H*.2,['#fff','#ff7a3d','#ffd36b','#b86bff'],110,900,1.4,200,4,true); vring(W/2,H*.2,'255,200,120',30,W*.8,1,18); try{ if(tk&&window.CW_TOKENS&&!(o&&o.practice)) CW_TOKENS.add(tk); }catch(e){} } (function(){ var c=vcar(); vring(c.x,c.y,'255,235,170',20,W,1,18); vblast(c.x,c.y,['#fff','#ffd36b','#5cc8ff','#ff5d8f'],90,820,1.2,200,4,true); for(var z=0;z<4;z++) rocket(); S.shake=.4; })(); if(o.onFinish) o.onFinish(); }
  }
  /* sparks, smoke, floating text */
  function fxStep(dt,now){
    var cw=sprScale(), cx=W/2, by=H-22;
    if(!S.finished&&S.t>0){
      if(S.drift>.3){ var hot=S.drift>=1; for(var q=0;q<2;q++) spark(cx+(S.steer>0?-1:1)*cw*.5,by,(Math.random()-.5)*160+(S.steer>0?-120:120),-120-Math.random()*160,hot?'#6cc4ff':'#ffb347',.35,2+Math.random()*2,500); }
      if(Math.abs(S.px)>1.06&&S.speed>MAXV*.15) for(var q2=0;q2<2;q2++) spark(cx+(Math.random()-.5)*cw,by,(Math.random()-.5)*120,-60-Math.random()*90,'#8a6a45',.5,3+Math.random()*3,200);
      if(S.boostT>0&&Math.random()<.7) spark(cx+(Math.random()-.5)*cw*.4,by+8,(Math.random()-.5)*60,160+Math.random()*120,Math.random()<.5?'#ffd36b':'#ff8a2a',.3,3+Math.random()*3,0);
    }
    if(S.slideT>0){ for(var sq=0;sq<3;sq++) spark(cx+(Math.random()-.5)*cw*.8,by+4,(Math.random()-.5)*260,-30-Math.random()*150,Math.random()<.5?'#ffd36b':'#fff',.45,2+Math.random()*2.5,500); }
    if(S.finished&&Math.random()<.9) spark(Math.random()*W,-10,(Math.random()-.5)*120,80+Math.random()*120,PAL[(Math.random()*6)|0],2.2,4,120);
    for(var i2=S.parts.length-1;i2>=0;i2--){ var q3=S.parts[i2]; q3.l-=dt; if(q3.l<=0){ S.parts.splice(i2,1); continue; } q3.vy+=q3.g*dt; q3.x+=q3.vx*dt; q3.y+=q3.vy*dt; }
    for(var f=S.fl.length-1;f>=0;f--){ var fo=S.fl[f]; fo.l-=dt; fo.y-=70*dt; if(fo.l<=0) S.fl.splice(f,1); }
    for(var j=S.pops.length-1;j>=0;j--){ S.pops[j].l-=dt; if(S.pops[j].l<=0) S.pops.splice(j,1); }
  }
  function drawTf(now){
    if(!S.flyOn||S.tfT>2.8) return; var t=S.tfT, f=t/2.8;
    ctx.save(); if(t<.5){ ctx.fillStyle='rgba(255,255,255,'+(.3*(1-t/.5))+')'; ctx.fillRect(0,0,W,H); }
    ctx.globalCompositeOperation='lighter'; for(var i=0;i<18;i++){ var an=i*.349+t*.6, len=(.15+.85*Math.min(1,t*1.4))*H*.9, a=(1-f)*.1; var g=ctx.createLinearGradient(W/2,H*.62,W/2+Math.cos(an)*len,H*.62+Math.sin(an)*len); g.addColorStop(0,'rgba(190,235,255,'+a+')'); g.addColorStop(1,'rgba(190,235,255,0)'); ctx.strokeStyle=g; ctx.lineWidth=7; ctx.beginPath(); ctx.moveTo(W/2,H*.62); ctx.lineTo(W/2+Math.cos(an)*len,H*.62+Math.sin(an)*len); ctx.stroke(); }
    ctx.globalCompositeOperation='source-over'; var e=1-Math.pow(1-Math.min(1,t*2.2),3), al=f>.8?1-(f-.8)/.2:1; ctx.globalAlpha=al; ctx.textAlign='center'; ctx.translate(W/2,H*.3); ctx.scale(.7+.3*e,.7+.3*e);
    ctx.shadowColor='#7df0ff'; ctx.shadowBlur=30; ctx.fillStyle='#e8fbff'; ctx.font='900 64px system-ui'; ctx.lineWidth=8; ctx.strokeStyle='rgba(8,24,48,.7)'; ctx.strokeText('WINGS ONLINE',0,0); ctx.fillText('WINGS ONLINE',0,0);
    ctx.shadowBlur=0; ctx.font='700 22px system-ui'; ctx.fillStyle='#bfe9ff'; ctx.fillText('SKY MODE  ·  dodge storms, drones & meteors  ·  fly through rings',0,40);
    ctx.restore();
  }
  function drawFx(now){
    S.fl.forEach(function(fo){ ctx.globalAlpha=Math.min(1,fo.l*1.4); ctx.textAlign='center'; ctx.font='38px system-ui'; ctx.fillStyle='#fff'; ctx.fillText(fo.e,fo.x,fo.y); ctx.font='700 14px system-ui'; ctx.lineWidth=4; ctx.strokeStyle='rgba(8,10,12,.7)'; ctx.strokeText(fo.n,fo.x,fo.y+18); ctx.fillStyle='#fff'; ctx.fillText(fo.n,fo.x,fo.y+18); }); ctx.globalAlpha=1;
    S.parts.forEach(function(q){ var a=Math.max(0,Math.min(1,q.l/q.m*1.4)); ctx.globalAlpha=a; ctx.fillStyle=q.c; ctx.fillRect(q.x-q.r/2,q.y-q.r/2,q.r,q.r); }); ctx.globalAlpha=1;
    ctx.textAlign='center';
    S.pops.forEach(function(q,i){ var rise=(1.2-q.l)*26, a=Math.min(1,q.l*2.2), sc=1+Math.max(0,q.l-1)*1.2; ctx.save(); ctx.globalAlpha=a; ctx.translate(W/2,128+i*0+(-rise)+i*0); ctx.translate(0,i*36); ctx.scale(sc,sc); ctx.font='800 34px system-ui'; ctx.lineWidth=6; ctx.strokeStyle='rgba(8,10,12,.75)'; ctx.strokeText(q.t,0,0); ctx.fillStyle=q.c; ctx.fillText(q.t,0,0); ctx.restore(); });
  }
  function coinSprite(sx,gy,s,now,ix){
    var w=s*(W/2)*230; if(w<3) return; var ph=Math.abs(Math.cos(now/260+ix*.7)), cwid=w*(.25+.75*ph), cy=gy-w*.75;
    ctx.fillStyle='#8a5a00'; ctx.fillRect(sx-cwid/2-w*.05,cy-w*.5-w*.05,cwid+w*.1,w+w*.1);
    ctx.fillStyle='#fdbe18'; ctx.fillRect(sx-cwid/2,cy-w*.5,cwid,w);
    ctx.fillStyle='rgba(255,255,255,.55)'; ctx.fillRect(sx-cwid/2+cwid*.12,cy-w*.5+w*.1,cwid*.28,w*.22);
    if(w>9&&(ix+Math.floor(now/220))%6===0){ ctx.fillStyle='rgba(255,255,255,.9)'; ctx.fillRect(sx-w*.04,cy-w*.85,w*.08,w*.5); ctx.fillRect(sx-w*.25,cy-w*.66,w*.5,w*.08); }
  }

  /* ---- render ---- */
  /* ===================== cw-race3d: the Cube Race in real 3D ======================
     A WebGL2 world drawn behind the race canvas: road, kerbs, rails, scenery, sky,
     the cube cars, coins, boosts, blocks, ramps, power-ups and sky hazards. Game logic,
     HUD and effects are untouched; if WebGL2 is missing (or graphics are on Low)
     the classic renderer is used exactly as before. */
  var R3={ok:false};
  (function(){ try{
    if(CZ||GFX===0||!cv||!cv.parentNode) return;
    var glc=document.createElement('canvas'), gl=glc.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'high-performance'});
    if(!gl) return;
    var DPR=Math.min(window.devicePixelRatio||1,1.5); glc.width=Math.round(W*DPR); glc.height=Math.round(H*DPR);
    glc.className='cwR3'; glc.style.cssText='position:absolute;left:0;top:0;width:100%;height:auto;aspect-ratio:16/9;border-radius:16px;display:block;pointer-events:none;z-index:0;background:#000';
    cv.parentNode.insertBefore(glc,cv);
    var cvOld={bg:cv.style.background,pos:cv.style.position,z:cv.style.zIndex};
    cv.style.background='transparent'; cv.style.position='relative'; cv.style.zIndex='1';
    var U=0.01, RW=ROADW*U, M=Math, PI=M.PI;
    /* ---------- tiny math ---------- */
    function m4(){ return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]; }
    function mul(a,b){ var o=new Array(16); for(var c=0;c<4;c++)for(var r=0;r<4;r++){ var s=0; for(var k=0;k<4;k++) s+=a[k*4+r]*b[c*4+k]; o[c*4+r]=s; } return o; }
    function Tm(x,y,z){ var m=m4(); m[12]=x;m[13]=y;m[14]=z; return m; }
    function Sc(x,y,z){ return [x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1]; }
    function Rx(a){ var c=M.cos(a),s=M.sin(a); return [1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]; }
    function Ry(a){ var c=M.cos(a),s=M.sin(a); return [c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]; }
    function Rz(a){ var c=M.cos(a),s=M.sin(a); return [c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1]; }
    function chain(){ var m=arguments[0]; for(var i=1;i<arguments.length;i++) m=mul(m,arguments[i]); return m; }
    function persp(f,a,n,fa){ var t=1/M.tan(f/2); return [t/a,0,0,0,0,t,0,0,0,0,(fa+n)/(n-fa),-1,0,0,2*fa*n/(n-fa),0]; }
    function ortho(l,r,b,t,n,f){ return [2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1]; }
    function sub(a,b){ return [a[0]-b[0],a[1]-b[1],a[2]-b[2]]; } function add(a,b){ return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]; }
    function scl(a,s){ return [a[0]*s,a[1]*s,a[2]*s]; } function dot(a,b){ return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
    function crs(a,b){ return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]; }
    function nrm(v){ var l=M.hypot(v[0],v[1],v[2])||1; return [v[0]/l,v[1]/l,v[2]/l]; }
    function look(e,c,u){ var z=nrm(sub(e,c)),x=nrm(crs(u,z)),y=crs(z,x); return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,e),-dot(y,e),-dot(z,e),1]; }
    function xf(m,p){ return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]]; }
    function hex(h){ if(!h) return [1,1,1]; if(h.charAt(0)==='#'){ var n=parseInt(h.slice(1),16); return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]; } var q=h.replace(/[^\d,.]/g,'').split(','); return [(+q[0]||0)/255,(+q[1]||0)/255,(+q[2]||0)/255]; }
    function mix(a,b,k){ return [a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k]; }
    /* ---------- geometry builder: positions, normals, rgba (a: 0 matte .. .5 glossy, 1 = glowing) ---------- */
    function B(){ return {p:[],n:[],c:[]}; }
    function tri(b,a,c,d,col,m){ var A=m?xf(m,a):a,C=m?xf(m,c):c,D=m?xf(m,d):d, nn=nrm(crs(sub(C,A),sub(D,A)));
      b.p.push(A[0],A[1],A[2],C[0],C[1],C[2],D[0],D[1],D[2]); for(var i=0;i<3;i++){ b.n.push(nn[0],nn[1],nn[2]); b.c.push(col[0],col[1],col[2],col[3]); } }
    function quad(b,a,c,d,e,col,m){ tri(b,a,c,d,col,m); tri(b,a,d,e,col,m); }
    /* chamfered box: the bevelled-edge look of the MagLev renders */
    function cbox(b,w,h,d,ch,col,m){ var hx=w/2,hy=h/2,hz=d/2,c=M.min(ch,hx*.9,hy*.9,hz*.9),H=[hx,hy,hz];
      function P(ax,s,u,v){ var p=[0,0,0],o=[(ax+1)%3,(ax+2)%3]; p[ax]=s*H[ax]; p[o[0]]=u*(H[o[0]]-c); p[o[1]]=v*(H[o[1]]-c); return p; }
      function out(a,c2,d2,e2){ var ctr=scl(add(add(a,c2),add(d2,e2)),.25), nn=crs(sub(c2,a),sub(d2,a)); if(dot(nn,ctr)<0) quad(b,a,e2,d2,c2,col,m); else quad(b,a,c2,d2,e2,col,m); }
      function outT(a,c2,d2){ var ctr=scl(add(add(a,c2),d2),1/3), nn=crs(sub(c2,a),sub(d2,a)); if(dot(nn,ctr)<0) tri(b,a,d2,c2,col,m); else tri(b,a,c2,d2,col,m); }
      for(var ax=0;ax<3;ax++) for(var s=-1;s<=1;s+=2) out(P(ax,s,-1,-1),P(ax,s,1,-1),P(ax,s,1,1),P(ax,s,-1,1));
      var ex=0, Q=function(axis,sg,other,so,e){ var p=[0,0,0]; p[axis]=sg*H[axis]; p[other]=so*(H[other]-c); p[ex]=e*(H[ex]-c); return p; };
      for(ax=0;ax<3;ax++){ var bx=(ax+1)%3; ex=(ax+2)%3; for(var sa=-1;sa<=1;sa+=2) for(var sb=-1;sb<=1;sb+=2){
        out(Q(ax,sa,bx,sb,-1),Q(ax,sa,bx,sb,1),Q(bx,sb,ax,sa,1),Q(bx,sb,ax,sa,-1)); } }
      var S3=[0,0,0], C3=function(axis){ var p=[0,0,0]; for(var k=0;k<3;k++) p[k]=k===axis?S3[k]*H[k]:S3[k]*(H[k]-c); return p; };
      for(var sx=-1;sx<=1;sx+=2) for(var sy=-1;sy<=1;sy+=2) for(var sz=-1;sz<=1;sz+=2){ S3=[sx,sy,sz]; outT(C3(0),C3(1),C3(2)); } }
    function cyl(b,r1,r2,h,n,col,m,caps){ for(var i=0;i<n;i++){ var a0=i/n*PI*2,a1=(i+1)/n*PI*2;
      var p0=[M.cos(a0)*r1,-h/2,M.sin(a0)*r1],p1=[M.cos(a1)*r1,-h/2,M.sin(a1)*r1],q0=[M.cos(a0)*r2,h/2,M.sin(a0)*r2],q1=[M.cos(a1)*r2,h/2,M.sin(a1)*r2];
      quad(b,p0,q0,q1,p1,col,m); if(caps!==false){ if(r2>0) tri(b,[0,h/2,0],q1,q0,col,m); if(r1>0) tri(b,[0,-h/2,0],p0,p1,col,m); } } }
    function sphere(b,r,n,col,m,sy){ sy=sy||1; var V=function(a,bb){ var th=a/n*PI, ph=bb/(n*2)*PI*2; return [r*M.sin(th)*M.cos(ph),r*sy*M.cos(th),r*M.sin(th)*M.sin(ph)]; };
      for(var i=0;i<n;i++) for(var j=0;j<n*2;j++) quad(b,V(i,j),V(i,j+1),V(i+1,j+1),V(i+1,j),col,m); }
    function torus(b,R,r,n,k,col,m){ var V=function(a,bb){ var u=a/n*PI*2,v=bb/k*PI*2; return [(R+r*M.cos(v))*M.cos(u),r*M.sin(v),(R+r*M.cos(v))*M.sin(u)]; };
      for(var i=0;i<n;i++) for(var j=0;j<k;j++) quad(b,V(i,j),V(i+1,j),V(i+1,j+1),V(i,j+1),col,m); }
    /* ---------- GL plumbing ---------- */
    function sh(t,s){ var x=gl.createShader(t); gl.shaderSource(x,s); gl.compileShader(x); if(!gl.getShaderParameter(x,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; }
    function prog(vs,fs,at){ var p=gl.createProgram(); gl.attachShader(p,sh(gl.VERTEX_SHADER,vs)); gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs)); (at||['p','n','c']).forEach(function(a,i){ gl.bindAttribLocation(p,i,a); });
      gl.linkProgram(p); if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); var u={}, k=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS); for(var i=0;i<k;i++){ var nm=gl.getActiveUniform(p,i).name; u[nm]=gl.getUniformLocation(p,nm); } return {p:p,u:u}; }
    function upload(b){ if(!b.p.length) return null; var n=b.p.length/3, d=new Float32Array(n*10);
      for(var i=0;i<n;i++){ d.set([b.p[i*3],b.p[i*3+1],b.p[i*3+2],b.n[i*3],b.n[i*3+1],b.n[i*3+2],b.c[i*4],b.c[i*4+1],b.c[i*4+2],b.c[i*4+3]],i*10); }
      var vao=gl.createVertexArray(); gl.bindVertexArray(vao); var buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf); gl.bufferData(gl.ARRAY_BUFFER,d,gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,40,0); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1,3,gl.FLOAT,false,40,12); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2,4,gl.FLOAT,false,40,24);
      gl.bindVertexArray(null); return {vao:vao,n:n,buf:buf}; }
    var SH='float shd(){ vec3 q=lp.xyz/lp.w*.5+.5; if(q.x<0.||q.x>1.||q.y<0.||q.y>1.||q.z>1.) return 1.; float s=0.; for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++) s+=texture(sm,vec3(q.xy+vec2(x,y)/1024.,q.z-.002)); return s/9.; }';
    var LIT=prog('#version 300 es\nin vec3 p;in vec3 n;in vec4 c;uniform mat4 Mm,VP,LVP;out vec3 wp;out vec3 wn;out vec4 vc;out vec4 lp;void main(){vec4 w=Mm*vec4(p,1.);wp=w.xyz;wn=mat3(Mm)*n;vc=c;lp=LVP*w;gl_Position=VP*w;}',
      '#version 300 es\nprecision highp float;precision highp sampler2DShadow;in vec3 wp;in vec3 wn;in vec4 vc;in vec4 lp;out vec4 o;uniform sampler2DShadow sm;uniform vec3 cam,sunD,sunC,hS,hG,skyC,fogC,tint;uniform float fogN,fogF,fogOn,alpha,emi,shOn;\n'+SH+
      'void main(){vec3 N=normalize(wn);if(!gl_FrontFacing)N=-N;vec3 V=normalize(cam-wp);vec3 base=vc.rgb*tint;vec3 col;'+
      'if(vc.a>.75){col=base*emi;}else{float g=vc.a*2.;float s=shOn>.5?shd():1.;float ndl=max(dot(N,sunD),0.);vec3 amb=mix(hG,hS,N.y*.5+.5);vec3 Hh=normalize(sunD+V);'+
      'float sp=pow(max(dot(N,Hh),0.),mix(28.,180.,g))*mix(.12,1.3,g);vec3 R=reflect(-V,N);vec3 env=mix(hG*.8,skyC*1.2,smoothstep(-.2,.6,R.y));float fr=pow(1.-max(dot(N,V),0.),4.);'+
      'col=base*(amb+sunC*ndl*s)+sunC*sp*s+env*(fr*.3+g*.45)*mix(vec3(1.),base,g*.7);}'+
      'if(fogOn>.5){float f=smoothstep(fogN,fogF,length(cam-wp));col=mix(col,fogC,f);}o=vec4(col,alpha);}');
    var DEP=prog('#version 300 es\nin vec3 p;uniform mat4 Mm,LVP;void main(){gl_Position=LVP*Mm*vec4(p,1.);}','#version 300 es\nprecision highp float;out vec4 o;void main(){o=vec4(1.);}',['p']);
    var SKY=prog('#version 300 es\nin vec2 p;out vec2 q;void main(){q=p;gl_Position=vec4(p,.9999,1.);}',
      '#version 300 es\nprecision highp float;in vec2 q;out vec4 o;uniform vec3 cR,cU,cF,s0,s1,s2,s3,sunD,sunC,fogC;uniform float th,asp,time,sunA,moon,stars,aur,clouds,planet;\n'+
      'float h(vec3 p){p=fract(p*.3183+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}'+
      'void main(){vec3 d=normalize(cF+q.x*th*asp*cR+q.y*th*cU);float y=d.y;vec3 c=y<.04?mix(fogC,s3,smoothstep(-.06,.04,y)):y<.2?mix(s3,s2,(y-.04)/.16):y<.55?mix(s2,s1,(y-.2)/.35):mix(s1,s0,min(1.,(y-.55)/.45));'+
      'float sd=max(dot(d,sunD),0.);c+=sunC*sunA*(pow(sd,900.)*3.+pow(sd,14.)*.28);'+
      'if(moon>.5){vec3 md=normalize(vec3(-sunD.x,.32,sunD.z));float m=dot(d,md);c+=vec3(.92,.95,1.)*(smoothstep(.9993,.9996,m)*.9+pow(max(m,0.),60.)*.18);}'+
      'if(stars>.5&&y>0.){vec3 g=floor(d*320.);float s=h(g);if(s>.988){vec3 f=fract(d*320.)-.5;c+=vec3(1.)*exp(-dot(f,f)*30.)*(s-.988)*60.*(.6+.4*sin(time*2.+s*90.))*smoothstep(0.,.15,y);}}'+
      'if(aur>.5){float az=atan(d.x,d.z);float hb=y-(.16+.05*sin(az*3.+time*.2));float cur=hb>0.?exp(-hb*7.)*(.5+.5*sin(az*60.+time)):exp(hb*50.);c+=mix(vec3(.2,1.,.7),vec3(.5,.4,1.),smoothstep(0.,.25,hb))*cur*.45;}'+
      'if(clouds>.5&&y>0.){float az=atan(d.x,d.z);float cl=sin(az*5.+time*.03)*.5+sin(az*11.-1.)*.3+sin(az*23.)*.2;c=mix(c,c*.55,smoothstep(.2,.6,cl)*smoothstep(.02,.1,y)*smoothstep(.45,.15,y));}'+
      'if(planet>.5){vec3 pd=normalize(vec3(.55,.3,.75));float pp=dot(d,pd);c=mix(c,mix(vec3(.95,.62,.4),vec3(.4,.12,.2),smoothstep(.985,.999,pp)),smoothstep(.9845,.9855,pp));}'+
      'o=vec4(c,1.);}',['p']);
    var SPR=prog('#version 300 es\nin vec3 p;in vec2 uv;in vec4 c;uniform mat4 VP;out vec2 t;out vec4 vc;void main(){t=uv;vc=c;gl_Position=VP*vec4(p,1.);}',
      '#version 300 es\nprecision highp float;in vec2 t;in vec4 vc;out vec4 o;uniform sampler2D tx;uniform float add;void main(){vec4 s=texture(tx,t);o=add>.5?vec4(vc.rgb*s.a*vc.a,1.):vec4(vc.rgb*s.rgb,s.a*vc.a);}',['p','uv','c']);
    /* full-screen triangle for the sky */
    var fsv=gl.createVertexArray(); gl.bindVertexArray(fsv); var fsb=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,fsb); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0); gl.bindVertexArray(null);
    /* shadow map */
    var SM=1024, smT=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,smT); gl.texStorage2D(gl.TEXTURE_2D,1,gl.DEPTH_COMPONENT24,SM,SM);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    var smF=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,smF); gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,smT,0); gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    /* sprite atlas: glow, star, heart, ring, then the power-up icons */
    var AT=document.createElement('canvas'); AT.width=1024; AT.height=128; var ax=AT.getContext('2d'), PUK2=['shield','magnet','burst','phase','over','charge'];
    (function(){ var g=ax.createRadialGradient(64,64,0,64,64,62); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(.35,'rgba(255,255,255,.55)'); g.addColorStop(1,'rgba(255,255,255,0)'); ax.fillStyle=g; ax.fillRect(0,0,128,128);
      ax.fillStyle='#fff'; ax.beginPath(); for(var q=0;q<10;q++){ var rr=q%2?22:56, an=-PI/2+q*PI/5; ax.lineTo(192+M.cos(an)*rr,64+M.sin(an)*rr); } ax.fill();
      ax.beginPath(); ax.moveTo(320,104); ax.bezierCurveTo(250,60,280,8,320,40); ax.bezierCurveTo(360,8,390,60,320,104); ax.fill();
      ax.strokeStyle='#fff'; ax.lineWidth=12; ax.beginPath(); ax.arc(448,64,46,0,7); ax.stroke();
      ax.textAlign='center'; ax.textBaseline='middle'; ax.font='84px system-ui,"Apple Color Emoji","Segoe UI Emoji"'; PUK2.forEach(function(k,i){ ax.fillText((PUIC&&PUIC[k])||'⚡',576+128*(i%4)+0,64+2); });
    })();
    /* icons beyond the first 4 cells wrap: shield,magnet,burst,phase at cells 4..7; over,charge drawn into a second strip below */
    var AT2=document.createElement('canvas'); AT2.width=1024; AT2.height=256; var a2=AT2.getContext('2d'); a2.drawImage(AT,0,0); a2.textAlign='center'; a2.textBaseline='middle'; a2.font='84px system-ui,"Apple Color Emoji","Segoe UI Emoji"';
    a2.clearRect(512,0,512,128); PUK2.forEach(function(k,i){ var cx=576+128*(i%4), cy=64+128*Math.floor(i/4); a2.fillText((PUIC&&PUIC[k])||'⚡',cx,cy+2); });
    var atT=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,atT); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,AT2);
    gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    function cell(i){ var cx=i%8, cy=M.floor(i/8); return [cx/8,cy/2,(cx+1)/8,(cy+1)/2]; }
    var spV=gl.createVertexArray(), spB=gl.createBuffer(); gl.bindVertexArray(spV); gl.bindBuffer(gl.ARRAY_BUFFER,spB);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,36,0); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1,2,gl.FLOAT,false,36,12); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2,4,gl.FLOAT,false,36,20); gl.bindVertexArray(null);
    /* ---------- theme ---------- */
    var C={sky:T.sky.map(hex),fog:hex('rgb('+T.fog+')'),g0:hex(T.g0),g1:hex(T.g1),g2:hex(T.g2),r1:hex(T.r1),r2:hex(T.r2),mt:T.mt.map(hex)};
    var dark=/night|space|neon|halloween|aurora|cubingzone/.test(WXK), sunI={night:.62,space:.7,neon:.6,halloween:.6,aurora:.75,volcano:.75,rain:.7,snow:1.05}[WXK]||1.15;
    var sunC=scl(T.sun?hex('rgb('+T.sun+')'):(dark?[.6,.68,1]:[1,.97,.92]),sunI), sunD=nrm([.55,.62,.7]);
    var hS=scl(mix(C.sky[2],[1,1,1],.45),dark?.68:.66), hG=scl(mix(C.g0,C.fog,.4),dark?.5:.52), LAMPS=[];
    var LAMPC3=hex('rgb('+(LAMPC[WXK]||'255,220,160')+')');
    /* ---------- track centre line ---------- */
    var NN=N+120, CX=new Float32Array(NN+2), CZz=new Float32Array(NN+2), HD=new Float32Array(NN+2);
    (function(){ var h=0,x=0,z=0; for(var i=0;i<=NN+1;i++){ CX[i]=x; CZz[i]=z; HD[i]=h; var cu=i<N?segs[i].curve:0; h+=cu/SEG; x+=-M.sin(h)*SEG*U; z+=M.cos(h)*SEG*U; } })();
    function at(s){ var i=M.max(0,M.min(NN,M.floor(s))), f=M.max(0,M.min(1,s-i)), h=HD[i]+(HD[i+1]-HD[i])*f;
      return {p:[CX[i]+(CX[i+1]-CX[i])*f,0,CZz[i]+(CZz[i+1]-CZz[i])*f],h:h,f:[-M.sin(h),0,M.cos(h)],r:[-M.cos(h),0,-M.sin(h)]}; }
    function wpos(s,u,y){ var a=at(s); return add(add(a.p,scl(a.r,u*RW)),[0,y||0,0]); }
    function frameAt(s,u,y,yaw){ var a=at(s), p=add(add(a.p,scl(a.r,u*RW)),[0,y||0,0]); return chain(Tm(p[0],p[1],p[2]),Ry(-a.h+(yaw||0))); }
    /* ---------- static world, chunked ---------- */
    var CH=50, chunks=[];
    var red=[.92,.25,.18,0], white=[.95,.96,.97,0], railC=[.72,.75,.8,.45], postC=[.35,.37,.4,.2];
    var pine=[[.13,.48,.35],[.11,.36,.27]]; if(WXK==='snow') pine=[[.86,.92,.96],[.7,.8,.86]];
    function scenery3(b,sc,i){ var side=sc.x<0?-1:1, u=sc.x, m=frameAt(i,u,0,(sc.h*.7)%6.28), k=.9+(sc.h%3)*.12, tt=T.tree;
      if(sc.t===0){ var s0=6.2*k, cm=chain(m,Tm(0,s0/2,0)); cubeTiles(b,s0,cm,function(f,i2){ return hex(PAL[(i2+sc.h+f)%6]); },[.06,.07,.08]); if(sc.h%2){ var s1=s0*.72; cubeTiles(b,s1,chain(m,Tm(0,s0+s1/2+.05,0),Ry(.5)),function(f,i2){ return hex(PAL[(i2+sc.h+3+f)%6]); },[.06,.07,.08]); } return; }
      var g=chain(m,Sc(k,k,k));
      if(!tt){ cyl(b,.35,.25,1.8,8,[.22,.15,.1,0],chain(g,Tm(0,.9,0))); for(var j=0;j<3;j++) cyl(b,2.4-j*.55,0,2.8,9,pine[j%2].concat([0]),chain(g,Tm(0,2.6+j*1.45,0))); if(WXK==='snow') cyl(b,.7,0,.9,9,[1,1,1,0],chain(g,Tm(0,6.4,0))); }
      else if(tt==='cactus'){ var gc=[.3,.58,.3,0]; cyl(b,.45,.45,5,10,gc,chain(g,Tm(0,2.5,0))); cyl(b,.3,.3,1.6,8,gc,chain(g,Tm(.85,2.6,0),Rz(PI/2))); cyl(b,.3,.3,1.8,8,gc,chain(g,Tm(1.5,3.3,0))); cyl(b,.28,.28,1.3,8,gc,chain(g,Tm(-.8,1.9,0),Rz(PI/2))); cyl(b,.28,.28,1.4,8,gc,chain(g,Tm(-1.35,2.5,0))); }
      else if(tt==='palm'){ var tc=[.55,.4,.25,0]; for(var q=0;q<6;q++) cyl(b,.32-q*.02,.3-q*.02,1.2,8,tc,chain(g,Tm(q*q*.05,q*1.15+.6,0),Rz(-q*.07)));
        for(q=0;q<7;q++) cbox(b,.6,.12,4.2,.05,[.2,.58,.3,0],chain(g,Tm(1.6,7.2,0),Ry(q*.9),Rx(.35),Tm(0,0,2.1))); }
      else if(tt==='pylon'){ cyl(b,.2,.14,9,8,[.2,.18,.28,.3],chain(g,Tm(0,4.5,0))); torus(b,.9,.12,16,6,[1,.25,.75,1],chain(g,Tm(0,9.2,0))); cbox(b,.5,.5,.5,.1,[.3,.9,1,1],chain(g,Tm(0,9.2,0))); }
      else if(tt==='spire'){ cyl(b,1.6,0,9,7,[.1,.05,.04,0],chain(g,Tm(0,4.5,0))); cyl(b,.5,0,6,5,[1,.4,.1,1],chain(g,Tm(.5,3,.4))); }
      else if(tt==='crystal'){ cyl(b,1.1,0,3.2,6,[.55,.9,1,1],chain(g,Tm(0,3.6,0))); cyl(b,0,1.1,2,6,[.4,.8,1,1],chain(g,Tm(0,1,0))); cyl(b,.6,0,1.8,6,[.7,.6,1,1],chain(g,Tm(1.3,1.5,.3),Rz(-.4))); }
      else if(tt==='rock'){ sphere(b,1.8,4,[.42,.42,.48,0],chain(g,Tm(0,1.2,0),Ry(sc.h)),.75); sphere(b,1,3,[.36,.36,.42,0],chain(g,Tm(1.6,.7,.6))); }
      else if(tt==='zone'){ cbox(b,1.2,8,1.2,.15,[.05,.12,.16,.3],chain(g,Tm(0,4,0))); cbox(b,1.3,.3,1.3,.08,[.15,.95,.9,1],chain(g,Tm(0,8.1,0))); cbox(b,1.3,.2,1.3,.06,[.15,.95,.9,1],chain(g,Tm(0,4,0))); }
      else if(tt==='dead'){ var dc=[.12,.09,.1,0]; cyl(b,.35,.15,6,7,dc,chain(g,Tm(0,3,0),Rz(.08))); cyl(b,.14,.05,2.4,6,dc,chain(g,Tm(.8,4.6,0),Rz(-.9))); cyl(b,.12,.04,2,6,dc,chain(g,Tm(-.7,4,0),Rz(1))); sphere(b,.55,5,[1,.5,.08,0],chain(g,Tm(1.2,.45,.6)),.8); cbox(b,.12,.25,.12,.03,[.15,.4,.1,0],chain(g,Tm(1.2,1,.6))); }
      else { cyl(b,.35,.25,1.8,8,[.22,.15,.1,0],chain(g,Tm(0,.9,0))); for(j=0;j<3;j++) cyl(b,2.4-j*.55,0,2.8,9,pine[j%2].concat([0]),chain(g,Tm(0,2.6+j*1.45,0))); }
    }
    /* Rubik-style cube: dark bevelled body + 9 bevelled stickers on each face */
    function cubeTiles(b,s,m,colFn,bodyC,faces){ cbox(b,s,s,s,s*.08,bodyC.concat([.25]),m); var t=s/3, tw=t*.86, off=s/2+t*.012;
      var F=faces||[[0,1,0],[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]];
      F.forEach(function(nv,fi){ for(var r=0;r<3;r++) for(var q=0;q<3;q++){ var u=(q-1)*t, v=(1-r)*t, p, mm;
        if(nv[1]){ p=[u*nv[1],off*nv[1],-v*nv[1]]; mm=chain(m,Tm(p[0],p[1],p[2]),Rx(PI/2)); } else if(nv[0]){ p=[off*nv[0],v,u*nv[0]]; mm=chain(m,Tm(p[0],p[1],p[2]),Ry(PI/2)); } else { p=[-u*nv[2],v,off*nv[2]]; mm=chain(m,Tm(p[0],p[1],p[2])); }
        cbox(b,tw,tw,t*.07,t*.05,colFn(fi,r*3+q).concat([.42]),mm); } }); }
    function pt(a,u,y){ return add(add(a.p,scl(a.r,u)),[0,y,0]); }
    for(var c0=0;c0*CH<NN;c0++){ var b=B(), i0=c0*CH, i1=M.min(NN,i0+CH);
      for(var i=i0;i<i1;i++){ var A=at(i),Bq=at(i+1), alt=M.floor(i/3)%2, s=i<N?segs[i]:END;
        var rc=alt?C.r1:C.r2; quad(b,pt(A,-RW,0),pt(A,RW,0),pt(Bq,RW,0),pt(Bq,-RW,0),rc.concat([T.wet?.4:.08]));
        if(i>=N-3&&i<N-1){ for(var q=0;q<10;q++){ var u0=-RW+q*RW*.2, u1=u0+RW*.2; for(var hh=0;hh<2;hh++){ var Ah=at(i+hh*.5),Bh=at(i+hh*.5+.5); quad(b,pt(Ah,u0,.02),pt(Ah,u1,.02),pt(Bh,u1,.02),pt(Bh,u0,.02),((q+hh)%2?white:[.05,.05,.06,0])); } } }
        else if(alt){ [-1/3,1/3].forEach(function(uu){ quad(b,pt(A,uu*RW-.18,.015),pt(A,uu*RW+.18,.015),pt(Bq,uu*RW+.18,.015),pt(Bq,uu*RW-.18,.015),[.92,.93,.95,.2]); }); }
        var kc=(M.floor(i/2)%2)?red:white;
        [-1,1].forEach(function(sd){ var a1=sd*RW, a2=sd*(RW+1.9); quad(b,pt(A,a1,.12),pt(A,a2,.06),pt(Bq,a2,.06),pt(Bq,a1,.12),kc); quad(b,pt(A,a1,0),pt(A,a1,.12),pt(Bq,a1,.12),pt(Bq,a1,0),kc);
          var g1=alt?C.g1:C.g2, gIn=sd*(RW+1.9), gOut=sd*110; quad(b,pt(A,gIn,-.01),pt(A,gOut,-.01),pt(Bq,gOut,-.01),pt(Bq,gIn,-.01),g1.concat([0]));
          var rr=sd*(RW+4.2); quad(b,pt(A,rr,.55),pt(A,rr,.95),pt(Bq,rr,.95),pt(Bq,rr,.55),railC); quad(b,pt(A,rr+sd*.05,.55),pt(A,rr+sd*.05,.95),pt(Bq,rr+sd*.05,.95),pt(Bq,rr+sd*.05,.55),railC);
          if(i%4===0) cbox(b,.22,1.05,.22,.04,postC,chain(Tm.apply(null,pt(A,rr+sd*.12,.52)),Ry(-A.h)));
          if(T.lights&&i%12===6){ var lp=pt(A,sd*(RW+5.5),0), lm=chain(Tm(lp[0],lp[1],lp[2]),Ry(-A.h)); cyl(b,.18,.12,9,8,[.25,.27,.3,.4],chain(lm,Tm(0,4.5,0)),false); cbox(b,2.6,.18,.25,.05,[.25,.27,.3,.4],chain(lm,Tm(-sd*1.2,8.9,0))); cbox(b,.9,.14,.5,.05,LAMPC3.concat([1]),chain(lm,Tm(-sd*2.2,8.78,0))); LAMPS.push({i:i,p:xf(lm,[-sd*2.2,8.6,0])}); }
        });
        if(i<N&&s.sc) scenery3(b,s.sc,i+.5);
        if(i===N-2||i===6){ var gm=frameAt(i,0,0,0), gc=i===6?[.12,.13,.15,.35]:[.12,.13,.15,.35]; [-1,1].forEach(function(sd){ cbox(b,1.2,10,1.2,.15,gc,chain(gm,Tm(sd*(RW+3),5,0))); });
          for(q=0;q<16;q++) cbox(b,(2*RW+7.2)/16,1.6,.7,.04,(q%2?white:[.05,.05,.06,0]),chain(gm,Tm(-(RW+3.6)+(q+.5)*(2*RW+7.2)/16,10.2,0)));
          cbox(b,2*RW+7.2,.25,.9,.06,(i===6?[.2,.55,1,1]:[1,.82,.25,1]),chain(gm,Tm(0,11.1,0))); }
      }
      chunks.push({m:upload(b),i0:i0,i1:i1});
    }
    /* far mountains and the ground plane */
    var mtn=B(); (function(){ [[0,1700,90,.012],[1,1250,60,.02]].forEach(function(L){ var cc=mix(C.mt[L[0]],C.fog,.25).concat([1]); var n=160;
      var Hh=function(t){ return L[2]*(.45+.55*M.abs(M.sin(t*7.3+L[0]*2)*M.sin(t*3.1+1.3)))+L[2]*.25*M.sin(t*23.); };
      for(var k=0;k<n;k++){ var a0=k/n*PI*2,a1=(k+1)/n*PI*2,r=L[1];
        quad(mtn,[M.cos(a0)*r,-40,M.sin(a0)*r],[M.cos(a0)*r,Hh(a0),M.sin(a0)*r],[M.cos(a1)*r,Hh(a1),M.sin(a1)*r],[M.cos(a1)*r,-40,M.sin(a1)*r],cc); } }); })();
    var mtnM=upload(mtn); var gb=B(); quad(gb,[-4000,-.6,-4000],[4000,-.6,-4000],[4000,-.6,4000],[-4000,-.6,4000],C.g0.concat([0])); var gnd=upload(gb);
    /* ---------- dynamic item models ---------- */
    var mdl={};
    (function(){ var b;
      b=B(); cubeTiles(b,6.2,Tm(0,3.1,0),function(f,i){ return (f===0)?[.99,.75,.1]:((i+f)%2===0?[.92,.25,.18]:[.14,.15,.17]); },[.05,.05,.06]); mdl.block=upload(b);
      b=B(); for(var k=0;k<3;k++){ var z=-2.6+k*2.6; [[-1,0],[1,0]].forEach(function(sd){ var mm=chain(Tm(sd[0]*1.4,.05,z),Ry(sd[0]*.55)); cbox(b,3.4,.1,.9,.04,[1,.78,.1,1],mm); }); } cbox(b,6.2,.04,8.6,.02,[.25,.18,.02,1],Tm(0,.02,0)); mdl.boost=upload(b);
      b=B(); cyl(b,.85,.85,.2,28,[1,.75,.12,.5],Rx(PI/2)); cyl(b,.62,.62,.24,28,[1,.86,.35,.5],Rx(PI/2)); mdl.coin=upload(b);
      b=B(); (function(){ var w=5.4,l=8,h=3.6; quad(b,[-w/2,0,-l/2],[w/2,0,-l/2],[w/2,h,l/2],[-w/2,h,l/2],[.75,.8,.86,.35]);
        for(var k=0;k<5;k++){ var t0=k/5+.03,t1=t0+.1; quad(b,[-w/2+.1,h*t0+.03,-l/2+l*t0],[w/2-.1,h*t0+.03,-l/2+l*t0],[w/2-.1,h*t1+.03,-l/2+l*t1],[-w/2+.1,h*t1+.03,-l/2+l*t1],k%2?[1,.78,.1,1]:[1,1,1,.6]); }
        [-1,1].forEach(function(s){ tri(b,[s*w/2,0,-l/2],[s*w/2,h,l/2],[s*w/2,0,l/2],[.2,.22,.25,0]); }); quad(b,[-w/2,0,l/2],[w/2,0,l/2],[w/2,h,l/2],[-w/2,h,l/2],[.2,.22,.25,0]); cbox(b,w,.25,.3,.05,[.3,.9,1,1],Tm(0,h,l/2)); })(); mdl.ramp=upload(b);
      b=B(); sphere(b,1,8,[1,1,1,.5],null); mdl.orb=upload(b);
      b=B(); cbox(b,2.8,2.8,2.8,.18,[.32,.22,.14,0],Tm(0,1.4,0)); [.35,1.4,2.45].forEach(function(y){ cbox(b,2.9,.4,2.9,.06,[1,.6,.24,.3],Tm(0,y,0)); }); mdl.crate=upload(b);
      b=B(); [[0,0,0,2.2],[1.8,-.3,.4,1.6],[-1.7,-.4,-.3,1.5],[.6,.9,-.6,1.4]].forEach(function(q){ sphere(b,q[3],6,[.36,.4,.46,0],Tm(q[0],q[1],q[2]),.75); }); mdl.cloud=upload(b);
      b=B(); cbox(b,1.6,.6,1.6,.12,[.15,.16,.18,.4],null); [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(s){ cbox(b,1.3,.1,.2,.04,[.3,.32,.35,.4],Tm(s[0]*.6,.15,s[1]*.6)); cyl(b,.65,.65,.05,14,[.8,.85,.9,.3],Tm(s[0]*1.1,.42,s[1]*1.1)); }); cbox(b,.4,.2,.1,.05,[1,.2,.2,1],Tm(0,0,.82)); mdl.drone=upload(b);
      b=B(); sphere(b,1.6,5,[.25,.15,.12,0],null); sphere(b,1.85,5,[1,.4,.1,1],Tm(0,0,-.5),.8); mdl.meteor=upload(b);
      b=B(); torus(b,3.2,.32,32,8,[1,.8,.2,1],Rx(PI/2)); mdl.ring=upload(b);
      b=B(); cyl(b,.35,.35,2.6,10,[.17,.19,.22,.45],Rx(PI/2)); cyl(b,.35,0,.9,10,[1,.28,.2,.3],chain(Tm(0,0,1.75),Rx(PI/2))); [0,1,2,3].forEach(function(k){ cbox(b,.06,.7,.6,.02,[.17,.19,.22,.45],chain(Rz(k*PI/2),Tm(0,.45,-1))); }); mdl.missile=upload(b);
      b=B(); for(k=0;k<6;k++){ var y0=24-k*4; cbox(b,.35,4.4,.35,.1,[.85,.9,1,1],chain(Tm((k%2?.8:-.8),y0-2,0),Rz(k%2?.35:-.35))); } mdl.bolt=upload(b);
      b=B(); [-1,1].forEach(function(s){ quad(b,[s*.9,0,.4],[s*5.2,.9,-.4],[s*5,1.1,-1.6],[s*.9,.2,-1.1],[.95,.96,1,.3]); }); mdl.wings=upload(b);
    })();
    /* ---------- cube car: bevelled Rubik body on a low chassis, real wheels, spoiler, lights ---------- */
    var wheelRaw, wheelM=(function(){ var b=B(); wheelRaw=b; cyl(b,.66,.66,.52,26,[.08,.08,.09,.06],Rz(PI/2)); cyl(b,.45,.45,.56,18,[.78,.8,.85,.5],Rz(PI/2),true);
      for(var k=0;k<5;k++) cbox(b,.58,.1,.62,.02,[.55,.57,.62,.5],Rx(k*PI*2/5)); cyl(b,.13,.13,.6,10,[.2,.2,.22,.4],Rz(PI/2)); return upload(b); })();
    var carCache={};
    function carModel(pal,hash){ var key=pal.join('')+'|'+(hash%6); if(carCache[key]) return carCache[key]; var b=B(), P2=pal.map(hex);
      cbox(b,4.0,.5,4.6,.14,[.07,.075,.085,.4],Tm(0,.72,0)); [-1,1].forEach(function(s){ cbox(b,.16,.36,3.0,.05,[.09,.1,.11,.4],Tm(s*2.02,.6,0)); });
      cbox(b,4.1,.16,.5,.06,[.09,.1,.11,.45],Tm(0,.5,2.35));
      var bm=Tm(0,2.82,0);
      cubeTiles(b,3.7,bm,function(f,i){ var k=f===0?(i*2+hash+3):f===5?(i+hash):f===2?(i+hash+1):f===3?(i+hash+4):(i+hash+2); return P2[((k%6)+6)%6]; },[.035,.036,.04]);
      [-1,1].forEach(function(s){ cbox(b,.12,.5,.32,.04,[.1,.1,.12,.5],Tm(s*1.25,4.92,-1.45)); cbox(b,.08,.5,.95,.03,[.1,.1,.12,.5],Tm(s*1.85,5.05,-1.45)); });
      cbox(b,3.75,.1,.85,.04,[.08,.08,.1,.55],chain(Tm(0,5.22,-1.5),Rx(-.12)));
      [-1,1].forEach(function(s){ cbox(b,1.05,.18,.06,.03,[1,.12,.1,1],Tm(s*1.28,.84,-2.33)); cbox(b,.85,.18,.06,.03,[1,.96,.85,1],Tm(s*1.3,.86,2.33)); cyl(b,.14,.14,.42,12,[.6,.62,.66,.5],chain(Tm(s*.6,.55,-2.35),Rx(PI/2))); });
      carCache[key]=upload(b); return carCache[key]; }
    var WHL=[[1.98,.66,1.45,1],[-1.98,.66,1.45,1],[1.98,.66,-1.45,0],[-1.98,.66,-1.45,0]];
    /* ---------- special car models (Garage): 1 MagLev Hover, 2 CubeVault Hauler, 3 Speedcube Racer. Front is +z. ---------- */
    var SPC={}, STKC=[[.95,.95,.95],[1,.83,0],[.9,.18,.16],[1,.48,.1],[.12,.37,.88],[.14,.64,.33]];
    function logoTiles(b,m,s){ cbox(b,1.0*s,.06,1.0*s,.05*s,[.04,.04,.05,.3],m); [[.9,.18,.16,-1,-1],[.14,.64,.33,1,-1],[1,.83,0,-1,1],[.12,.37,.88,1,1]].forEach(function(t){ cbox(b,.4*s,.08,.4*s,.06*s,[t[0],t[1],t[2],.45],chain(m,Tm(t[3]*.23*s,.04,t[4]*.23*s))); }); }
    function cubie(b,s,m,fc){ cbox(b,s,s,s,s*.1,[.035,.036,.04,.25],m); var o=s/2+.01, w=s*.84;
      if(fc.u!=null) cbox(b,w,.04,w,s*.1,STKC[fc.u].concat([.4]),chain(m,Tm(0,o,0)));
      if(fc.x!=null) cbox(b,.04,w,w,s*.1,STKC[fc.x].concat([.4]),chain(m,Tm(fc.sx*o,0,0)));
      if(fc.z!=null) cbox(b,w,w,.04,s*.1,STKC[fc.z].concat([.4]),chain(m,Tm(0,0,fc.sz*o))); }
    function specModel(id){ if(SPC[id]) return SPC[id]; var b=B();
      if(id===1){ var BK=[.03,.035,.045,.55], TR=[.16,.17,.2,.5], BL=[.3,.65,1,1];
        cbox(b,4.0,.6,5.0,.25,BK,Tm(0,1.1,0)); cbox(b,3.5,.55,1.3,.22,BK,chain(Tm(0,.95,2.55),Rx(.18)));
        cbox(b,3.6,.5,3.1,.22,BK,Tm(0,1.55,-.45));
        sphere(b,1,8,[.08,.2,.34,.85],chain(Tm(0,1.75,.55),Sc(1.15,.62,1.55)));
        [-1,1].forEach(function(s){ cbox(b,.07,.09,4.6,.03,BL,Tm(s*2.02,.95,0)); cbox(b,.2,.36,1.0,.06,TR,Tm(s*1.85,1.55,-.9)); cbox(b,.05,.16,.8,.02,BL,Tm(s*1.96,1.55,-.9)); });
        cbox(b,2.6,.09,.06,.03,[.92,.97,1,1],Tm(0,1.05,3.17));
        cyl(b,.5,.56,.3,20,TR,chain(Tm(0,1.25,-2.6),Rx(PI/2))); cyl(b,.38,.38,.06,20,BL,chain(Tm(0,1.25,-2.78),Rx(PI/2)));
        cbox(b,4.3,.2,1.4,.08,BK,chain(Tm(0,2.55,-2.15),Rx(.08))); logoTiles(b,chain(Tm(0,2.68,-2.15),Rx(.08)),1.25);
        [-1,1].forEach(function(s){ cbox(b,.1,.7,1.5,.04,TR,Tm(s*2.15,2.3,-2.15)); cbox(b,.16,.75,.3,.05,TR,Tm(s*1.1,2.05,-2.05)); });
        [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(function(q){ var x=q[0]*1.6,z=q[1]*1.65; cyl(b,.58,.44,.42,22,[.78,.8,.86,.7],Tm(x,.62,z)); cyl(b,.36,.36,.05,20,BL,Tm(x,.39,z)); }); }
      else if(id===2){ var GR=[.15,.16,.19,.45], DK=[.06,.065,.075,.35], CH=[.75,.77,.82,.75], AM=[1,.68,.12,1], GL=[.08,.17,.28,.85];
        cbox(b,4.1,.62,5.6,.18,DK,Tm(0,1.0,0));
        cbox(b,3.8,1.55,2.0,.22,GR,Tm(0,2.05,1.5)); cbox(b,3.4,.75,.08,.04,GL,chain(Tm(0,2.45,2.5),Rx(-.3))); [-1,1].forEach(function(s){ cbox(b,.06,.6,1.3,.03,GL,Tm(s*1.92,2.4,1.45)); cbox(b,.12,.25,.4,.05,GR,Tm(s*2.05,2.45,2.25)); });
        cbox(b,4.2,.32,.35,.12,CH,Tm(0,.85,2.85)); cbox(b,2.3,.6,.08,.04,DK,Tm(0,1.4,2.62)); for(var g=0;g<5;g++) cbox(b,2.1,.05,.04,.01,CH,Tm(0,1.18+g*.11,2.67));
        [-1,1].forEach(function(s){ cbox(b,.6,.32,.08,.06,[1,.97,.85,1],Tm(s*1.5,1.42,2.62)); cbox(b,.5,.08,.06,.02,AM,Tm(s*1.5,1.18,2.63)); cbox(b,.55,.25,.06,.05,[1,.15,.1,1],Tm(s*1.5,1.45,-2.85)); });
        cbox(b,2.0,.16,.36,.06,DK,Tm(0,2.9,1.2)); [-.6,0,.6].forEach(function(x){ cbox(b,.45,.12,.26,.04,AM,Tm(x,3.02,1.2)); });
        [-1,1].forEach(function(s){ cbox(b,.16,.6,3.0,.05,GR,Tm(s*1.97,1.6,-1.25)); }); cbox(b,4.1,.6,.16,.05,GR,Tm(0,1.6,-2.75)); cbox(b,4.2,.32,.35,.12,CH,Tm(0,.85,-2.85));
        cbox(b,1.65,3.0,1.65,.08,[.1,.11,.13,.4],Tm(0,2.8,-1.2)); cbox(b,1.75,.16,1.75,.06,[.1,.11,.13,.4],Tm(0,4.37,-1.2)); logoTiles(b,Tm(0,4.47,-1.2),1.05);
        cbox(b,.14,1.8,.05,.02,[.01,.01,.015,.2],Tm(-.32,3.25,-.37)); cbox(b,.28,.18,.2,.05,[.25,.27,.3,.4],Tm(-.32,2.7,-.35));
        cbox(b,1.3,.72,.08,.05,[.12,.13,.15,.45],Tm(0,1.85,-2.06)); cyl(b,.22,.22,.18,16,[.05,.05,.06,.5],chain(Tm(0,1.85,-2.16),Rx(PI/2))); }
      else if(id===3){ var S3=1.22, cols=[[4,null],[null,null],[5,null]];
        for(var i=-1;i<=1;i++) for(var j=0;j<5;j++){ var fc={x:i?(i<0?4:5):null,sx:i,z:j===0?3:j===4?2:null,sz:j===0?-1:1}; cubie(b,S3,Tm(i*S3*1.02,1.2,(j-2)*S3*1.02),fc); }
        for(i=-1;i<=1;i++) for(j=-1;j<=1;j++){ cubie(b,S3,Tm(i*S3*1.02,1.2+S3*1.02,-.3+j*S3*1.02),{u:0,x:i?(i<0?4:5):null,sx:i,z:j?(j<0?3:2):null,sz:j}); }
        [-1,1].forEach(function(s){ cbox(b,.5,.5,.05,.25,[1,.98,.9,1],Tm(s*S3,1.2,2.5*S3*1.02+.02)); });
        [-1,1].forEach(function(s){ cbox(b,.16,1.0,.2,.05,[.035,.036,.04,.3],Tm(s*.9,3.0,-2.4)); });
        cbox(b,3.6,.32,1.0,.1,[.035,.036,.04,.3],Tm(0,3.55,-2.45)); cbox(b,3.3,.05,.8,.06,STKC[3].concat([.4]),Tm(0,3.72,-2.45)); }
      SPC[id]=upload(b); return SPC[id]; }

    /* ---------- Update 2 cars: six separate 3D bodies (4 Crimson, 5 Teal, 6 Violet, 7 Silver, 8 Orange, 9 Pink). Front is +z. ---------- */
    var NCC={};
    function newCarModel(id){ if(NCC[id]) return NCC[id]; var b=B(), K=[.03,.034,.04,.5], GL=[.07,.16,.26,.85], HL=[1,.97,.85,1], TL=[1,.12,.1,1], CR=[.78,.8,.86,.7], W=[[1.98,.66,1.45,1],[-1.98,.66,1.45,1],[1.98,.66,-1.45,0],[-1.98,.66,-1.45,0]];
      function tone(c,f){ return [Math.min(1,c[0]*f),Math.min(1,c[1]*f),Math.min(1,c[2]*f)]; }
      function lights(zf,zr,yf,yr,wx){ [-1,1].forEach(function(s){ cbox(b,.9,.2,.07,.04,HL,Tm(s*wx,yf,zf)); cbox(b,.8,.18,.07,.04,TL,Tm(s*wx,yr,zr)); }); }
      if(id===4){ var C=[.88,.19,.29,.5], D2=[.55,.08,.16,.5];
        cbox(b,4.0,.55,5.2,.2,D2,Tm(0,.95,0)); cbox(b,3.8,.5,2.2,.22,C,chain(Tm(0,1.25,2.15),Rx(.14))); cbox(b,3.6,.55,2.4,.2,C,Tm(0,1.3,-1.3));
        cbox(b,3.0,.5,2.0,.2,C,Tm(0,1.62,.1)); sphere(b,1,8,GL,chain(Tm(0,1.95,.05),Sc(1.28,.55,1.4)));
        [-1,1].forEach(function(s){ cbox(b,.14,.5,2.2,.05,tone(C,.7).concat([.4]),Tm(s*1.95,1.0,-.4)); cbox(b,.5,.1,1.6,.04,K,Tm(s*1.1,2.0,-1.6)); });
        cbox(b,4.1,.14,1.0,.05,K,chain(Tm(0,2.5,-2.4),Rx(.1))); [-1,1].forEach(function(s){ cbox(b,.1,.8,.9,.04,C,Tm(s*2.0,2.1,-2.4)); cbox(b,.14,.9,.2,.04,K,Tm(s*1.0,1.9,-2.3)); });
        cbox(b,3.8,.1,.8,.04,K,chain(Tm(0,.6,2.75),Rx(.1))); cbox(b,.1,.04,3.6,.02,[1,1,1,.2],Tm(0,1.9,.1)); lights(2.65,-2.62,1.35,1.5,1.2); W[0][2]=1.65;W[1][2]=1.65;W[2][2]=-1.55;W[3][2]=-1.55; }
      else if(id===5){ var C5=[.12,.71,.66,.5], D5=[.05,.38,.35,.5];
        cbox(b,4.1,.6,5.2,.2,D5,Tm(0,1.0,0)); cbox(b,3.9,.9,5.0,.2,C5,Tm(0,1.6,0)); cbox(b,3.5,.8,3.0,.2,C5,Tm(0,2.45,-.55));
        cbox(b,3.3,.55,.08,.04,GL,chain(Tm(0,2.5,.92),Rx(-.25))); [-1,1].forEach(function(s){ cbox(b,.06,.5,2.4,.03,GL,Tm(s*1.78,2.55,-.55)); cbox(b,.4,.9,.5,.08,[.02,.02,.025,.4],Tm(s*2.12,1.3,1.55)); cbox(b,.4,.9,.5,.08,[.02,.02,.025,.4],Tm(s*2.12,1.3,-1.55)); });
        cbox(b,3.3,.1,.1,.03,K,Tm(0,3.0,-1.7)); cbox(b,3.3,.1,.1,.03,K,Tm(0,3.0,.4)); [-1,1].forEach(function(s){ cbox(b,.1,.1,2.2,.03,K,Tm(s*1.6,3.0,-.65)); });
        [-.9,-.3,.3,.9].forEach(function(x){ cbox(b,.1,.16,.1,.03,K,Tm(x,3.12,-.65)); cbox(b,.1,.1,2.2,.03,K,Tm(x,3.05,-.65)); });
        [-1,1].forEach(function(s){ cyl(b,.34,.34,.2,14,HL,chain(Tm(s*1.0,1.9,2.55),Rx(PI/2))); cyl(b,.28,.28,.2,14,HL,chain(Tm(s*1.0,1.9,2.55),Rx(PI/2))); });
        cbox(b,4.2,.3,.4,.1,K,Tm(0,.85,2.7)); cbox(b,4.2,.3,.4,.1,K,Tm(0,.85,-2.7)); cbox(b,.8,.5,.3,.08,K,Tm(0,1.4,-2.6)); lights(2.52,-2.52,1.5,1.7,1.4); W[0][4]=W[1][4]=W[2][4]=W[3][4]=1.12; W.forEach(function(w){ w[1]=.74; }); }
      else if(id===6){ var C6=[.6,.36,.94,.5], D6=[.3,.12,.62,.5];
        cbox(b,1.5,.55,5.0,.25,C6,Tm(0,.9,0)); cbox(b,1.0,.5,1.6,.2,D6,Tm(0,1.3,-1.2)); sphere(b,1,8,[.06,.05,.1,.9],chain(Tm(0,1.4,.2),Sc(.55,.45,.9))); cbox(b,.8,.5,.8,.2,K,Tm(0,1.5,-.7));
        cbox(b,.5,.4,1.8,.18,C6,chain(Tm(0,.95,2.4),Rx(.08))); cbox(b,3.9,.1,1.0,.04,C6,Tm(0,.55,2.95)); [-1,1].forEach(function(s){ cbox(b,.1,.55,1.1,.03,D6,Tm(s*1.95,.75,2.95)); cbox(b,.14,.3,.9,.04,K,Tm(s*1.7,.85,.3)); cbox(b,1.2,.55,1.9,.2,C6,Tm(s*1.05,.95,-.1)); cbox(b,.25,.14,2.4,.05,K,Tm(s*1.88,.75,1.45)); cbox(b,.25,.14,2.4,.05,K,Tm(s*1.88,.75,-1.45)); });
        cbox(b,4.0,.14,1.0,.05,D6,chain(Tm(0,2.1,-2.55),Rx(.12))); [-1,1].forEach(function(s){ cbox(b,.1,.9,1.1,.04,C6,Tm(s*2.0,1.65,-2.55)); }); cbox(b,.2,1.0,.2,.05,K,Tm(0,1.5,-2.4)); cbox(b,.3,.2,.1,.04,TL,Tm(0,1.75,-2.5)); cbox(b,.5,.14,.07,.03,HL,Tm(0,1.0,3.2));
        W[0][0]=2.1;W[1][0]=-2.1;W[2][0]=2.1;W[3][0]=-2.1; W.forEach(function(w){ w[4]=1.12; w[1]=.74; }); }
      else if(id===7){ var C7=[.84,.86,.89,.6], D7=[.45,.48,.54,.6];
        cbox(b,4.0,.55,5.4,.22,D7,Tm(0,.95,0)); cbox(b,3.9,.7,2.0,.28,C7,chain(Tm(0,1.4,2.0),Rx(.1))); cbox(b,3.9,.7,2.2,.26,C7,Tm(0,1.45,-1.55));
        cbox(b,3.5,.5,2.6,.28,C7,Tm(0,1.95,-.1)); cbox(b,3.2,.5,2.3,.28,GL,Tm(0,2.2,-.05)); cbox(b,3.0,.08,2.2,.05,C7,Tm(0,2.5,-.05));
        [-1,1].forEach(function(s){ cbox(b,.1,.3,4.4,.04,[.1,.1,.12,.5],Tm(s*1.98,1.15,0)); cbox(b,.14,.1,5.0,.03,[1,1,1,.3],Tm(s*1.97,1.62,0)); });
        cbox(b,.12,.26,.1,.04,K,Tm(0,2.7,-1.2)); cbox(b,1.3,.22,.1,.04,[.4,.42,.47,.7],Tm(0,1.35,2.7)); lights(2.7,-2.72,1.55,1.65,1.2); cbox(b,3.7,.1,.3,.04,K,Tm(0,1.9,-2.7)); }
      else if(id===8){ var C8=[1,.54,.12,.5], D8=[.65,.28,.02,.5];
        cbox(b,3.7,.6,5.3,.2,K,Tm(0,2.0,0)); cbox(b,3.7,.9,2.2,.22,C8,Tm(0,2.7,1.5)); cbox(b,3.2,.75,1.5,.2,C8,Tm(0,3.45,1.3)); cbox(b,3.0,.5,.08,.04,GL,chain(Tm(0,3.5,2.0),Rx(-.3)));
        cbox(b,3.7,.9,2.4,.18,D8,Tm(0,2.7,-1.45)); [-1,1].forEach(function(s){ cbox(b,.12,.7,1.4,.04,C8,Tm(s*1.88,2.55,-1.45)); cbox(b,.14,.1,5.3,.04,[1,1,1,.4],Tm(s*1.9,2.2,0)); cbox(b,.12,.14,.9,.04,[1,.9,.3,1],Tm(s*1.1,4.0,1.6)); });
        cbox(b,3.6,.2,.5,.08,K,Tm(0,1.7,2.8)); cbox(b,2.6,.5,.12,.04,K,Tm(0,2.55,2.62)); [-1,1].forEach(function(s){ cbox(b,.7,.4,.1,.04,HL,Tm(s*1.3,3.0,2.62)); cbox(b,.6,.4,.1,.04,TL,Tm(s*1.4,2.9,-2.65)); }); cbox(b,3.8,.7,.1,.05,K,Tm(0,2.1,-2.72));
        cbox(b,.4,.1,2.6,.04,K,Tm(-1.7,1.5,0)); cbox(b,.4,.1,2.6,.04,K,Tm(1.7,1.5,0)); W[0][0]=2.3;W[1][0]=-2.3;W[2][0]=2.3;W[3][0]=-2.3; W.forEach(function(w){ w[1]=1.0; w[4]=1.55; }); }
      else if(id===10){ var C10=[.96,.96,.98,.5], D10=[.9,.2,.18,.5];
        cbox(b,2.2,.7,5.6,.2,C10,Tm(0,1.05,0)); sphere(b,1,10,C10,chain(Tm(0,1.15,2.9),Sc(1.1,.8,1.9))); sphere(b,1,8,GL,chain(Tm(0,1.75,.4),Sc(.9,.55,1.4))); cbox(b,2.3,.12,.9,.04,D10,Tm(0,1.0,-.4));
        [-1,1].forEach(function(s){ cbox(b,.12,1.1,1.5,.04,D10,chain(Tm(s*1.45,1.3,-2.2),Rz(s*-.25))); cbox(b,.9,.14,2.6,.05,D10,Tm(s*1.55,.8,.4)); });
        cbox(b,.2,1.0,1.4,.04,D10,Tm(0,2.0,-2.4)); cyl(b,.5,.4,.5,12,[1,.6,.15,1],chain(Tm(0,1.1,-3.1),Rx(PI/2))); sphere(b,.35,8,[1,.85,.4,1],Tm(0,1.1,-3.45)); lights(3.5,-2.9,1.1,1.1,.5); W[0][0]=1.7;W[1][0]=-1.7;W[2][0]=1.7;W[3][0]=-1.7; W.forEach(function(w){ w[1]=.7; w[4]=1.05; }); }
      else if(id===11){ var C11=[.2,.9,.85,.5], D11=[.06,.2,.3,.5];
        sphere(b,1,14,D11,chain(Tm(0,1.0,0),Sc(2.6,.55,2.9))); sphere(b,1,12,C11,chain(Tm(0,1.25,0),Sc(2.2,.4,2.5))); sphere(b,1,10,GL,chain(Tm(0,1.75,.1),Sc(1.2,.7,1.3)));
        for(var q=0;q<12;q++){ var an=q/12*PI*2; sphere(b,.2,6,[.4,1,.95,1],Tm(Math.sin(an)*2.5,1.25,Math.cos(an)*2.8)); }
        [-1,1].forEach(function(s){ cyl(b,.45,.45,.5,12,K,chain(Tm(s*2.3,.75,-1.6),Rx(PI/2))); cyl(b,.45,.45,.5,12,K,chain(Tm(s*2.3,.75,1.6),Rx(PI/2))); sphere(b,.28,8,HL,Tm(s*.8,1.2,2.7)); sphere(b,.24,8,TL,Tm(s*.9,1.2,-2.7)); });
        W[0][0]=2.45;W[1][0]=-2.45;W[2][0]=2.45;W[3][0]=-2.45; W.forEach(function(w){ w[1]=.66; w[4]=1.2; }); }
      else if(id===12){ var C12=[1,.82,.22,.5], D12=[.18,.2,.26,.5];
        cbox(b,3.8,.6,5.2,.2,D12,Tm(0,.95,0)); cbox(b,3.6,1.5,3.6,.4,C12,Tm(0,1.9,-.9)); cbox(b,3.4,.9,1.6,.3,C12,Tm(0,1.4,2.1)); cbox(b,3.3,.6,.08,.04,GL,chain(Tm(0,2.3,.93),Rx(-.2)));
        [-1,1].forEach(function(s){ cbox(b,.08,.7,2.2,.03,GL,Tm(s*1.82,2.2,-.9)); cbox(b,.14,.14,3.6,.04,[1,1,1,.5],Tm(s*1.82,1.45,-.4)); });
        cbox(b,3.8,.12,3.8,.05,K,Tm(0,2.75,-.9)); [[-1.4,-1.8],[1.4,-1.8],[-1.4,.0],[1.4,.0]].forEach(function(q){ cbox(b,.1,.28,.1,.03,K,Tm(q[0],2.6,q[1])); });
        cbox(b,.9,.5,.12,.04,[1,1,1,.6],Tm(0,1.5,2.95)); lights(2.62,-2.72,1.5,1.5,1.3); W[0][0]=2.0;W[1][0]=-2.0; W[2][0]=2.0;W[3][0]=-2.0; W.forEach(function(w){ w[1]=.72; w[4]=1.15; }); }
      else if(id===13){ var C13=[.95,.18,.12,.5], D13=[.12,.12,.14,.5];
        cbox(b,1.3,.5,6.2,.2,C13,Tm(0,.95,.3)); cbox(b,.9,.4,2.0,.18,C13,chain(Tm(0,1.0,3.3),Rx(-.05))); sphere(b,1,8,GL,chain(Tm(0,1.5,-.7),Sc(.55,.5,.9))); cbox(b,2.0,.14,.5,.05,K,Tm(0,.8,3.9));
        cbox(b,4.0,.14,1.2,.05,D13,chain(Tm(0,2.5,-3.0),Rx(.08))); [-1,1].forEach(function(s){ cbox(b,.1,1.4,1.3,.04,C13,Tm(s*2.0,1.8,-3.0)); cbox(b,.3,.3,3.4,.06,D13,Tm(s*.85,.85,.2)); });
        cyl(b,.45,.4,.8,10,[.7,.7,.74,1],chain(Tm(0,1.5,1.4),Rx(PI/2))); lights(3.7,-3.1,1.0,1.4,.4); W[0][0]=1.55;W[1][0]=-1.55;W[2][0]=2.1;W[3][0]=-2.1; W[0][1]=.6;W[1][1]=.6; W[0][2]=2.8;W[1][2]=2.8; W[2][2]=-2.4;W[3][2]=-2.4; W[0][4]=.75;W[1][4]=.75; W[2][4]=1.55;W[3][4]=1.55; W[2][1]=1.05;W[3][1]=1.05; }
      else if(id===14){ var C14=[.2,.78,.3,.5], D14=[.07,.3,.12,.5];
        cbox(b,3.4,.7,5.4,.2,K,Tm(0,2.6,0)); cbox(b,3.5,1.0,2.4,.22,C14,Tm(0,3.4,1.5)); cbox(b,3.0,1.1,1.8,.2,C14,Tm(0,4.3,1.1)); cbox(b,2.8,.6,.08,.04,GL,chain(Tm(0,4.4,2.0),Rx(-.3)));
        cbox(b,3.5,1.0,2.6,.2,D14,Tm(0,3.4,-1.5)); [-1,1].forEach(function(s){ cbox(b,.12,.14,3.6,.04,[1,1,1,.45],Tm(s*1.78,3.2,0)); cbox(b,.8,.22,.1,.04,HL,Tm(s*1.1,3.8,2.7)); cbox(b,.7,.2,.1,.04,TL,Tm(s*1.2,3.7,-2.9)); cbox(b,.12,.9,.12,.04,K,Tm(s*1.5,3.0,2.2)); });
        cbox(b,3.7,.3,.4,.08,K,Tm(0,2.2,2.8)); W[0][0]=2.2;W[1][0]=-2.2;W[2][0]=2.2;W[3][0]=-2.2; W.forEach(function(w){ w[1]=1.5; w[4]=2.3; }); W[0][2]=2.0;W[1][2]=2.0;W[2][2]=-2.0;W[3][2]=-2.0; }
      else if(id===15){ var C15=[.98,.78,.3,.5], D15=[.55,.3,.08,.5];
        cbox(b,3.9,.5,5.4,.22,D15,Tm(0,.95,0)); sphere(b,1,10,C15,chain(Tm(0,1.4,1.0),Sc(1.8,.55,1.7))); sphere(b,1,10,C15,chain(Tm(0,1.45,-1.1),Sc(1.85,.6,1.6))); sphere(b,1,8,GL,chain(Tm(0,1.9,-.1),Sc(1.15,.5,1.0)));
        [-1,1].forEach(function(s){ cbox(b,.12,.9,1.6,.04,C15,chain(Tm(s*1.9,1.65,-2.5),Rz(s*-.25))); sphere(b,.4,8,HL,Tm(s*1.1,1.45,2.45)); sphere(b,.3,8,TL,Tm(s*1.2,1.5,-2.8)); cyl(b,.12,.12,.9,8,CR,chain(Tm(s*1.9,1.2,0),Rx(PI/2))); });
        cbox(b,3.9,.2,.3,.08,CR,Tm(0,.85,2.7)); cbox(b,3.9,.2,.3,.08,CR,Tm(0,.85,-2.75)); cbox(b,1.2,.3,.1,.04,[1,1,1,.6],Tm(0,1.1,2.8)); W.forEach(function(w){ w[1]=.7; w[4]=1.1; }); }
      else { var C9=[1,.48,.72,.5], D9=[.7,.22,.45,.5];
        cbox(b,3.7,.45,5.0,.2,D9,Tm(0,.95,0)); sphere(b,1,10,C9,chain(Tm(0,1.85,-.3),Sc(1.9,1.2,2.5))); sphere(b,1,8,GL,chain(Tm(0,2.35,.25),Sc(1.3,.6,1.1))); sphere(b,1,8,C9,chain(Tm(0,1.4,2.05),Sc(1.5,.6,.8)));
        [-1,1].forEach(function(s){ sphere(b,1,8,C9,chain(Tm(s*1.7,1.35,1.6),Sc(.55,.55,1.25))); sphere(b,1,8,C9,chain(Tm(s*1.7,1.35,-1.6),Sc(.55,.55,1.25))); sphere(b,.38,8,HL,Tm(s*1.0,1.75,2.4)); sphere(b,.3,8,TL,Tm(s*1.1,1.6,-2.7)); cbox(b,.1,.9,.1,.03,CR,chain(Tm(s*1.45,2.0,2.2),Rz(s*.3))); });
        cbox(b,3.9,.2,.3,.08,CR,Tm(0,.9,2.55)); cbox(b,3.9,.2,.3,.08,CR,Tm(0,.9,-2.55)); cbox(b,.5,.2,.15,.04,[1,1,1,.6],Tm(0,1.7,2.45)); }
      NCC[id]={g:upload(b),w:W,wm:wheelM,raw:b}; return NCC[id]; }
    window.CWCarGeo=function(id){ var n=newCarModel(id); return {g:n.raw,w:n.w,wheel:wheelRaw}; };
    var cubeWheelM=(function(){ var b=B(); cubie(b,1.05,Tm(0,0,0),{u:0,x:2,sx:1,z:4,sz:1}); cbox(b,.06,.9,.9,.1,STKC[2].concat([.4]),Tm(-.54,0,0)); cyl(b,.12,.12,.9,10,[.5,.52,.56,.6],Rz(PI/2)); return upload(b); })();
    var WHL3=[[2.45,.62,1.9,1],[-2.45,.62,1.9,1],[2.45,.62,-1.9,0],[-2.45,.62,-1.9,0]];

    /* ---------- 3D wings: one real model per wing type, built for each side, flapped at the shoulder ---------- */
    var wingCache={};
    function bone3(b,a,c,r0,r1,col,n){ n=n||8; var d=nrm(sub(c,a)), u=nrm(crs(M.abs(d[1])<.9?[0,1,0]:[1,0,0],d)), v=crs(d,u);
      for(var i=0;i<n;i++){ var a0=i/n*PI*2,a1=(i+1)/n*PI*2, o0=add(scl(u,M.cos(a0)),scl(v,M.sin(a0))), o1=add(scl(u,M.cos(a1)),scl(v,M.sin(a1)));
        quad(b,add(a,scl(o0,r0)),add(c,scl(o0,r1)),add(c,scl(o1,r1)),add(a,scl(o1,r0)),col); }
      sphere(b,r0*1.05,4,col,Tm(a[0],a[1],a[2])); }
    function mixc(a,c,t){ return [a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t,a[2]+(c[2]-a[2])*t,a[3]!=null?a[3]:.3]; }
    /* a feather: tapered vane with a raised shaft, both faces, coloured root -> tip */
    function feather3(b,len,wid,c0,c1,m){ var th=wid*.13, S0=[0,th,0],S1=[len*.55,th*.9,0],S2=[len,0,0], B0=[0,-th*.5,0],B1=[len*.55,-th*.45,0];
      [1,-1].forEach(function(s){ var L0=[0,0,s*wid*.22],L1=[len*.42,0,s*wid*.5],L2=[len*.86,0,s*wid*.3], cm=mixc(c0,c1,.55);
        quad(b,S0,L0,L1,S1,c0,m); quad(b,S1,L1,L2,S2,c1,m); tri(b,B0,L1,L0,c0,m); tri(b,B0,B1,L1,c0,m); tri(b,B1,L2,L1,cm,m); tri(b,B1,S2,L2,c1,m); }); }
    function featherWing(b,P){ var arm=P.bone;
      bone3(b,[0,0,.45],[2.4,.12,.62],.26,.2,arm); bone3(b,[2.4,.12,.62],[4.2,.05,.38],.2,.13,arm);
      for(var k=0;k<7;k++){ var t=k/6, ang=.08+t*.95, len=3.3-t*1.0, hue=P.rb?P.rb(k,7):null;
        feather3(b,len,.62,P.c0,hue||P.c1,chain(Tm(4.05-t*.55,-.05-t*.03,.38-t*.25),Ry(ang),Rx(-.08))); }
      for(k=0;k<8;k++){ t=k/7; var x=3.5-t*3.2; feather3(b,2.5-t*.35,.66,P.c0,P.rb?P.rb(k+7,15):mixc(P.c0,P.c1,.75),chain(Tm(x,-.1,.32),Ry(1.18+t*.32),Rx(-.05))); }
      for(k=0;k<9;k++){ t=k/8; x=3.9-t*3.6; feather3(b,1.25,.56,P.c0,mixc(P.c0,P.c1,.35),chain(Tm(x,.07,.48),Ry(1.28+t*.2))); }
      for(k=0;k<9;k++){ t=k/8; x=3.7-t*3.4; feather3(b,.7,.5,P.c0,P.c0,chain(Tm(x,.16,.56),Ry(1.35))); } }
    function membraneWing(b,P){ var sc=P.sc, root=[0,0,.4], wr=[2.7*sc,.15,.62*sc], tips=P.tips.map(function(q){ return [q[0]*sc,q[1],q[2]*sc]; }), body=[.15,0,-1.7*sc];
      bone3(b,root,wr,.24*sc,.18*sc,P.bone);
      var pts=[wr].concat(tips).concat([body]);
      for(var i=1;i<pts.length-1;i++){ var A=pts[i],C=pts[i+1], mid=scl(add(A,C),.5), sag=add(scl(sub(mid,wr),.7),wr); sag[1]-=.35*sc;
        var a1=add(wr,scl(sub(A,wr),.55)), c1=add(wr,scl(sub(C,wr),.55)), s1=add(wr,scl(sub(sag,wr),.55)); s1[1]-=.12*sc;
        quad(b,wr,a1,s1,c1,P.in_); quad(b,a1,A,sag,s1,P.out); quad(b,s1,sag,C,c1,P.out); }
      quad(b,root,wr,body,[.2,0,.1],P.in_);
      tips.forEach(function(t,k){ bone3(b,wr,t,.13*sc,.035*sc,P.bone,6); });
      cyl(b,.13*sc,0,.7*sc,8,P.claw,chain(Tm(wr[0]+.1,wr[1]+.35*sc,wr[2]+.1),Rx(-.5)));
      if(P.spikes) for(var k=0;k<4;k++){ var q=add(root,scl(sub(wr,root),(k+.6)/4.4)); cyl(b,.14*sc,0,.55*sc,6,P.claw,chain(Tm(q[0],q[1]+.25*sc,q[2]+.05),Rx(-.3))); } }
    function cubeWing(b){ var CC=[[.86,.12,.12],[1,.5,.06],[.99,.85,.12],[.1,.68,.28],[.1,.36,.85],[.95,.95,.95]], n=0;
      [[4,0],[3,1],[2,2]].forEach(function(R){ for(var c=0;c<R[0];c++){ var s=.98-c*.1-R[1]*.06, x=.75+c*1.04+R[1]*.25, z=.4-R[1]*1.0-c*.12, y=R[1]*.12+c*.06, seed=n++;
        cubeTiles(b,s,chain(Tm(x,y,z),Ry(.1*c),Rx(.06*R[1])),function(f,i){ return CC[(seed*5+f*3+i*7)%6]; },[.035,.036,.04]); } });
      bone3(b,[0,0,.4],[3.9,.18,.25],.14,.1,[.2,.21,.24,.5],8); }
    function neonWing(b,P){ var ribs=[[.1,4.6],[.42,4.2],[.75,3.7],[1.08,3.1],[1.38,2.4]];
      ribs.forEach(function(r,k){ var prev=null, col=k%2?P.a:P.b; for(var j=0;j<=10;j++){ var t=j/10, L=r[1]*t, p=[M.cos(r[0])*L,M.sin(PI*t)*.55-t*t*.15,-M.sin(r[0])*L+.4];
        if(prev) bone3(b,prev,p,.075,.075,col.concat([1]),6); prev=p; } });
      bone3(b,[0,0,.4],[1.2,0,.42],.18,.16,P.b.concat([1]),8); }
    function wingMesh(wg,s){ var key=wg+'|'+s; if(wingCache[key]!==undefined) return wingCache[key]; var b=B(), mir=Sc(s,1,1), b0=B();
      if(wg===2) membraneWing(b0,{sc:1,tips:[[5.4,.1,.0],[4.7,.0,-1.7],[3.5,0,-2.8],[2.0,0,-3.0]],bone:[.12,.07,.16,.45],in_:[.22,.12,.36,.35],out:[.5,.16,.58,.35],claw:[.85,.82,.9,.5]});
      else if(wg===3) membraneWing(b0,{sc:1.12,tips:[[5.6,.2,.2],[5.1,.05,-1.4],[4.1,0,-2.6],[2.8,0,-3.2],[1.4,0,-3.1]],bone:[.38,.1,.05,.45],in_:[.78,.18,.06,.3],out:[1,.55,.12,.3],claw:[.98,.88,.62,.5],spikes:1});
      else if(wg===4) cubeWing(b0);
      else if(wg===5) neonWing(b0,{a:[0,.95,1],b:[1,.25,.86]});
      else if(wg===7) neonWing(b0,{a:[1,1,1],b:[.66,.47,1]});
      else if(wg===1) featherWing(b0,{c0:[1,.98,.92,.3],c1:[1,.78,.32,.45],bone:[.95,.78,.35,.5]});
      else if(wg===6) featherWing(b0,{c0:[1,1,1,.3],c1:[1,1,1,.3],bone:[.95,.95,1,.4],rb:function(k,n){ var h=k/n*6, i=M.floor(h)%6, f=h-M.floor(h), q=[[1,f,0],[1-f,1,0],[0,1,f],[0,1-f,1],[f,0,1],[1,0,1-f]][i]; return [q[0]*.85+.15,q[1]*.85+.15,q[2]*.85+.15,.35]; }});
      else featherWing(b0,{c0:[.98,.99,1,.3],c1:[.62,.82,1,.35],bone:[.9,.94,1,.35]});
      for(var i=0;i<b0.p.length;i+=9){ var A=[b0.p[i],b0.p[i+1],b0.p[i+2]],C=[b0.p[i+3],b0.p[i+4],b0.p[i+5]],Dd=[b0.p[i+6],b0.p[i+7],b0.p[i+8]], ci=i/9*12;
        tri(b,A,C,Dd,[b0.c[ci],b0.c[ci+1],b0.c[ci+2],b0.c[ci+3]],mir); }
      wingCache[key]=upload(b); return wingCache[key]; }
    var haloM=null;
    function wings3(cm,wg,open,flying,now,al,ph){ if(!(open>.02)) return; wg=wg|0; var k=M.min(1,open), slow=(wg===3?1.45:wg===4?1.2:1);
      var flap=flying?M.sin(now/(150*slow)+ph)*.36*k:M.sin(now/700+ph)*.07*k, WS=.92;
      for(var s=-1;s<=1;s+=2){ var m=chain(cm,Tm(s*1.45,3.9,-.8),Ry(s*(.12+(1-k)*1.3)),Rz(s*(.5*k+flap-(1-k)*.25)),Rx(-.6*k),Sc(WS*(.35+.65*k),WS*(.35+.65*k),WS*(.35+.65*k)));
        D(wingMesh(wg,s),m,{a:al});
        if(flying&&k>.9){ if(wg===5||wg===7){ for(var j=0;j<5;j++){ var r=[.1,.42,.75,1.08,1.38][j], L=[4.6,4.2,3.7,3.1,2.4][j]; sprN.push({p:xf(m,[M.cos(r)*L,-.15,-M.sin(r)*L+.4]),s:.6,c:(wg===7?(j%2?[1,1,1]:[.66,.47,1]):(j%2?[0,.95,1]:[1,.25,.86])).concat([.85*al]),cel:0,add:1}); } }
          else if(wg===3){ for(var e=0;e<3;e++){ var ph2=((now/500+e/3+ph)%1); sprN.push({p:xf(m,[5.6-e*1.3,-ph2*2.2,-e*1.2]),s:.6*(1-ph2)+.2,c:[1,.55+.3*e/3,.15,.9*(1-ph2)*al],cel:0,add:1}); } }
          else if(wg===1){ sprN.push({p:xf(m,[4.6,0,-.2]),s:1.1,c:[1,.85,.45,.55*al],cel:1,add:1}); } } }
      if(wg===1){ if(!haloM){ var hb=B(); torus(hb,1.05,.13,28,8,[1,.84,.36,1],null); haloM=upload(hb); } var hm=chain(cm,Tm(0,5.9+M.sin(now/420+ph)*.12,-.2),Rx(.12)); D(haloM,hm,{a:al}); sprN.push({p:xf(hm,[0,0,0]),s:2.4,c:[1,.85,.4,.35*al],cel:3,add:1}); } }
    /* ---------- per-frame ---------- */
    var spr=[], sprN=[], wheelRot=0, lastNow=0, labels=[];
    function sprite(list,p,s,col,cel,camR,camU){ var c=cell(cel), r=scl(camR,s), u=scl(camU,s);
      [[-1,-1,c[0],c[3]],[1,-1,c[2],c[3]],[1,1,c[2],c[1]],[-1,-1,c[0],c[3]],[1,1,c[2],c[1]],[-1,1,c[0],c[1]]].forEach(function(v){ var q=add(add(p,scl(r,v[0])),scl(u,v[1])); list.push(q[0],q[1],q[2],v[2],v[3],col[0],col[1],col[2],col[3]); }); }
    var draws=[];
    function D(mesh,m,o){ if(mesh) draws.push({g:mesh,m:m,a:o&&o.a!=null?o.a:1,sh:!(o&&o.ns),fog:!(o&&o.nf)}); }
    function drawCarAt(m,pal,hash,steer,boost,alpha,carIdx,isMe,now,ug){ var op={a:alpha}, spm=carModelId(carIdx);
      if(spm===1){ var hv=.3+.12*M.sin(now/260+hash)+(boost?.45:0); D(specModel(1),chain(m,Tm(0,hv,0)),op);
        [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(function(q){ sprN.push({p:xf(m,[q[0]*1.6,.12,q[1]*1.65]),s:1.5+(boost?.6:0),c:[.3,.65,1,.55*alpha],cel:0,add:1,flat:1}); }); }
      else if(spm===2){ D(specModel(2),m,op); WHL.forEach(function(w){ D(wheelM,chain(m,Tm(w[0]*1.02,w[1],w[2]),Ry(w[3]?-steer*.35:0),Rx(wheelRot)),op); }); }
      else if(spm>=4&&spm<=15){ var nm=newCarModel(spm); D(nm.g,m,op); nm.w.forEach(function(w){ D(nm.wm,chain(m,Tm(w[0],w[1],w[2]),Ry(w[3]?-steer*.35:0),Rx(wheelRot),Sc(w[4]||1,w[4]||1,w[4]||1)),op); }); }
      else if(spm===3){ D(specModel(3),m,op); WHL3.forEach(function(w){ D(cubeWheelM,chain(m,Tm(w[0],w[1],w[2]),Ry(w[3]?-steer*.35:0),Rx(wheelRot)),op); }); }
      else { D(carModel(pal,hash),m,op); WHL.forEach(function(w){ D(wheelM,chain(m,Tm(w[0],w[1],w[2]),Ry(w[3]?-steer*.35:0),Rx(wheelRot)),op); }); }
      var tI=TRI(carIdx), tr=TRAILDEF[tI]; if(tr&&tI>0){ var tn=now; for(var k=0;k<14;k++){ var ph=((tn/620+k/14)%1), sd=M.sin(k*12.9898+hash)*43758.5453, rr=sd-M.floor(sd), sd2=k%2?1:-1;
        var lp=xf(m,[sd2*(2.2+ph*1.6+rr*.4),.5+M.sin(ph*3.1)*1.1+rr*.3,-2.6-ph*5.5]), col=tr.rb?['255,70,70','255,170,40','255,230,60','80,220,120','70,160,255','170,100,255'][k%6]:tr.c[k%2];
        sprN.push({p:lp,s:.32+.34*(1-ph),c:hex('rgb('+col+')').concat([(1-ph*ph)*.95*alpha]),cel:tr.star?1:tr.heart?2:0,add:1}); } }
      if(boost){ [-1,1].forEach(function(s){ var fp=xf(m,[s*.6,.55,-2.7]); for(var k=0;k<3;k++) sprN.push({p:add(fp,scl([m[8],m[9],m[10]],-k*.5)),s:(.7-k*.15)*(1+.25*M.random()),c:(S.odT>0?[.85,.55,1]:[.4,.75,1]).concat([.9-k*.25]),cel:0,add:1}); }); }
      sprN.push({p:xf(m,[0,.12,0]),s:ug?4.4:3.2,c:hex(ug||pal[3]).concat([ug?.7:isMe?.35:.2]),cel:0,add:1,flat:1});
      var lg=dark?1:.45; [-1,1].forEach(function(s){ sprN.push({p:xf(m,[s*1.28,.84,-2.45]),s:.9,c:[1,.15,.1,.8*lg*alpha],cel:0,add:1}); sprN.push({p:xf(m,[s*1.3,.86,2.45]),s:.8,c:[1,.95,.8,.5*lg*alpha],cel:0,add:1}); }); }
    function frame3(now,roll,shk,zoom){
      var dt=M.min(.05,(now-(lastNow||now))/1000); lastNow=now; draws=[]; spr=[]; sprN=[]; labels=[];
      var sP=S.pos/SEG, base=M.floor(sP), spd=S.speed/MAXV; wheelRot+=S.speed*U*dt/.66;
      var airH=S.air>0?M.sin(PI*M.min(1,S.airT/S.airDur)):0, lift=airH*4.6+S.fly*(.4+.55*S.ay)*4.6+(S.flyOn?M.sin(now/380)*.18*S.fly:0);
      /* camera */
      var ca=at(sP), lat=S.px, cb=at(sP-5.4), ct=at(sP+30), eye=add(add(cb.p,scl(cb.r,lat*RW)),[0,5.3+lift*.6,0]), tgt=add(add(ct.p,scl(ct.r,lat*RW)),[0,-2.2+lift*.85,0]);
      eye=add(eye,[(M.random()-.5)*shk*.02,(M.random()-.5)*shk*.015,0]);
      var fw=nrm(sub(tgt,eye)), rt=nrm(crs(fw,[0,1,0])), up0=crs(rt,fw), up=add(scl(up0,M.cos(roll)),scl(rt,-M.sin(roll)));
      var fov=56*PI/180/(zoom||1), V=look(eye,tgt,up), Pm=persp(fov,W/H,.5,4000), VP=mul(Pm,V);
      /* my car */
      var steerYaw=-S.steer*.16*M.min(1,spd+.2), carM=chain(Tm.apply(null,add(add(ca.p,scl(ca.r,lat*RW)),[0,lift,0])),Ry(-ca.h+steerYaw),Rz(S.steer*.05*spd+S.spin+(S.spinR||0)*S.squash),Sc((1+S.squash*.18)*.9,(1-S.squash*.2)*.9,.9));
      var phA=S.phaseT>0?(.5+.12*M.sin(now/55)):1; if(S.phaseT>0&&S.phaseT<.8&&M.floor(now/90)%2) phA=.9;
      drawCarAt(carM,ppal(carPal(o.car),paint7()),myHash,S.steer,(S.boostT>0||S.odT>0)&&!S.finished,phA,o.car,true,now,paint7().u);
      wings3(carM,MYFX.w,S.wing,S.flyOn&&S.wing>.9,now,phA,0);
      if(T.lights){ var hp=wpos(sP+6,lat,.05); sprN.push({p:hp,s:9,c:[1,.95,.8,.22],cel:0,add:1,flat:1}); LAMPS.forEach(function(L){ if(L.i<base-2||L.i>base+200) return; sprN.push({p:L.p,s:3.2,c:LAMPC3.concat([.85]),cel:0,add:1}); sprN.push({p:[L.p[0],.06,L.p[2]],s:8,c:LAMPC3.concat([.25]),cel:0,add:1,flat:1}); }); }
      /* other racers + ghost */
      var list=[]; Object.keys(others).forEach(function(k){ list.push(others[k]); });
      if(gh&&S.t>0&&!S.finished){ var ga=ghostAt(S.t); list.push({vis:ga[0]/10,lane:ga[1]/100,h:7,name:'👻 '+(gh.name||'Best'),car:gh.car|0,ghost:true}); }
      list.forEach(function(s){ var sp=s.vis/100*N; if(sp<sP-6||sp>sP+260) return; var lane=s.lane+M.sin(now/700+s.h)*.06, fl=s.vis>=50, ly=fl?3+M.sin(now/400+s.h)*.3:0;
        var a=at(sp), m=chain(Tm.apply(null,add(add(a.p,scl(a.r,lane*RW)),[0,ly,0])),Ry(-a.h)), al=s.ghost?.42:1;
        drawCarAt(m,ppal(carPal(s.car),s.fx),s.h,0,false,al,s.car,false,now,s.fx&&/^#[0-9a-f]{6}$/i.test(s.fx.u||'')?s.fx.u:null);
        if(fl) wings3(m,s.fx?s.fx.w:0,1,true,now+s.h*37,al,s.h);
        labels.push({p:add(a.p,add(scl(a.r,lane*RW),[0,6.3+ly,0])),t:s.name,al:al,fx:s.fx&&s.fx.a,fl:false,h:s.h}); });
      /* track items in view */
      var i0=M.max(0,base-4), i1=M.min(N-1,base+280);
      for(var i=i0;i<=i1;i++){ var g=segs[i]; if(i+.5<sP-.3) continue;
        if(g.ob&&!g.ob.done){ if(g.ob.type==='block') D(mdl.block,frameAt(i+.5,g.ob.x,0,.3)); else { D(mdl.boost,frameAt(i+.5,g.ob.x,0)); if(i-base<120) sprN.push({p:wpos(i+.5,g.ob.x,.4),s:5,c:[1,.75,.15,.25+.15*M.sin(now/90)],cel:0,add:1,flat:1}); } }
        if(g.cn&&!g.cn.done){ var cp=wpos(i+.5,g.cn.x,1.7+M.sin(now/300+i)*.15); D(mdl.coin,chain(Tm(cp[0],cp[1],cp[2]),Ry(now/260+i*.7))); if(i-base<60) sprN.push({p:cp,s:1.5,c:[1,.85,.3,.35],cel:0,add:1}); }
        if(g.pu&&!g.pu.done){ var pc=hex('rgb('+(PUCOL[g.pu.type]||'253,190,24')+')'), pp=wpos(i+.5,g.pu.x,2.3+M.sin(now/260+i)*.3); D(mdl.orb,chain(Tm(pp[0],pp[1],pp[2]),Sc(1.05,1.05,1.05)),{a:1});
          sprN.push({p:pp,s:3.4,c:pc.concat([.9]),cel:0,add:1}); spr.push({p:add(pp,[0,0,0]),s:1.05,c:[1,1,1,1],cel:(function(ix){ return ix<4?4+ix:12+(ix-4); })(M.max(0,PUK2.indexOf(g.pu.type)))}); }
        if(g.rp) D(mdl.ramp,frameAt(i+.5,g.rp.x,0));
        if(S.flyOn){ var k2=g.sk; if(k2&&!k2.done){ var hh=3*((.4+.55*(k2.h==null?.5:k2.h))/.675), xx=k2.type==='drone'?k2.x0+.3*M.sin(i*.18):k2.x0, mm=frameAt(i+.5,xx,hh,0);
            if(k2.type==='crate') D(mdl.crate,chain(mm,Tm(0,-1.4,0),Ry(now/900+i)));
            else if(k2.type==='cloud') D(mdl.cloud,mm,{a:.9});
            else if(k2.type==='drone'){ D(mdl.drone,chain(mm,Ry(M.sin(now/500+i)*.4))); sprN.push({p:xf(mm,[0,0,.9]),s:.8,c:[1,.2,.2,.8],cel:0,add:1}); }
            else if(k2.type==='meteor'){ D(mdl.meteor,chain(mm,Ry(now/400+i),Rx(now/700))); sprN.push({p:xf(mm,[0,0,0]),s:5,c:[1,.45,.12,.55],cel:0,add:1}); }
            else if(k2.type==='ring'){ D(mdl.ring,mm); sprN.push({p:xf(mm,[0,0,0]),s:4,c:[1,.8,.25,.25],cel:3,add:1}); }
            else if(k2.type==='bolt'){ var nb=i-base, st=nb<=7; D(mdl.bolt,frameAt(i+.5,xx,0,0),{a:1}); sprN.push({p:wpos(i+.5,xx,.3),s:4.5,c:(st?[1,1,1]:[1,.4,.4]).concat([.6+.3*M.sin(now/70)]),cel:3,add:1,flat:1}); } } }
        if(S.flyOn&&g.bs) g.bs.forEach(function(ms){ if(ms.done) return; var hh2=3*((.4+.55*ms.h)/.675), mp=frameAt(i+.5,ms.x,hh2,PI); D(mdl.missile,mp); sprN.push({p:xf(mp,[0,0,-1.6]),s:1.4,c:[1,.55,.2,.9],cel:0,add:1}); });
      }
      /* ---- render ---- */
      gl.viewport(0,0,glc.width,glc.height); gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND); gl.clearColor(C.fog[0],C.fog[1],C.fog[2],1); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      /* shadow pass around my car */
      var cP=xf(carM,[0,0,0]), LVP=mul(ortho(-26,26,-26,26,1,240),look(add(cP,scl(sunD,120)),cP,[0,1,0]));
      gl.bindFramebuffer(gl.FRAMEBUFFER,smF); gl.viewport(0,0,SM,SM); gl.clear(gl.DEPTH_BUFFER_BIT); gl.useProgram(DEP.p); gl.uniformMatrix4fv(DEP.u.LVP,false,LVP);
      gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(2,4);
      draws.forEach(function(d){ if(!d.sh||d.a<.6) return; var dp=[d.m[12],d.m[13],d.m[14]]; if(M.hypot(dp[0]-cP[0],dp[2]-cP[2])>34) return; gl.uniformMatrix4fv(DEP.u.Mm,false,d.m); gl.bindVertexArray(d.g.vao); gl.drawArrays(gl.TRIANGLES,0,d.g.n); });
      gl.disable(gl.POLYGON_OFFSET_FILL); gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.viewport(0,0,glc.width,glc.height);
      /* sky */
      gl.disable(gl.DEPTH_TEST); gl.useProgram(SKY.p); var Su=SKY.u, cF=fw;
      gl.uniform3fv(Su.cR,rt); gl.uniform3fv(Su.cU,up); gl.uniform3fv(Su.cF,cF); gl.uniform1f(Su.th,M.tan(fov/2)); gl.uniform1f(Su.asp,W/H); gl.uniform1f(Su.time,now/1000);
      gl.uniform3fv(Su.s0,C.sky[0]); gl.uniform3fv(Su.s1,C.sky[1]); gl.uniform3fv(Su.s2,C.sky[2]); gl.uniform3fv(Su.s3,C.sky[3]); gl.uniform3fv(Su.fogC,C.fog);
      var sd2=nrm([M.sin(ca.h+.6)*-1,.14,M.cos(ca.h+.6)]); gl.uniform3fv(Su.sunD,sd2); gl.uniform3fv(Su.sunC,T.sun?hex('rgb('+T.sun+')'):[0,0,0]); gl.uniform1f(Su.sunA,T.sun?(T.sunA||1):0);
      gl.uniform1f(Su.moon,T.moon?1:0); gl.uniform1f(Su.stars,T.stars?1:0); gl.uniform1f(Su.aur,T.aurora?1:0); gl.uniform1f(Su.clouds,T.clouds?1:0); gl.uniform1f(Su.planet,T.planet?1:0);
      gl.bindVertexArray(fsv); gl.drawArrays(gl.TRIANGLES,0,3); gl.enable(gl.DEPTH_TEST);
      /* lit world */
      gl.useProgram(LIT.p); var L=LIT.u; gl.uniformMatrix4fv(L.VP,false,VP); gl.uniformMatrix4fv(L.LVP,false,LVP); gl.uniform3fv(L.cam,eye); gl.uniform3fv(L.sunD,sunD); gl.uniform3fv(L.sunC,sunC);
      gl.uniform3fv(L.hS,hS); gl.uniform3fv(L.hG,hG); gl.uniform3fv(L.skyC,C.sky[2]); gl.uniform3fv(L.fogC,C.fog); gl.uniform3fv(L.tint,[1,1,1]); gl.uniform1f(L.fogN,70); gl.uniform1f(L.fogF,dark?420:520);
      gl.uniform1f(L.emi,1.15); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,smT); gl.uniform1i(L.sm,0);
      function one(g,m,a,fog,shOn){ gl.uniformMatrix4fv(L.Mm,false,m); gl.uniform1f(L.alpha,a); gl.uniform1f(L.fogOn,fog?1:0); gl.uniform1f(L.shOn,shOn?1:0); gl.bindVertexArray(g.vao); gl.drawArrays(gl.TRIANGLES,0,g.n); }
      one(mtnM,Tm(eye[0],0,eye[2]),1,false,false);
      one(gnd,Tm(eye[0],0,eye[2]),1,true,false);
      chunks.forEach(function(c){ if(c.i1<base-6||c.i0>base+300||!c.m) return; one(c.m,m4(),1,true,true); });
      draws.forEach(function(d){ if(d.a>=.99) one(d.g,d.m,1,d.fog,true); });
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
      draws.forEach(function(d){ if(d.a<.99) one(d.g,d.m,d.a,d.fog,true); });
      /* sprites: additive glows, then alpha icons */
      var cr=rt, cu=up0;
      function flush(list,addM){ if(!list.length) return; gl.useProgram(SPR.p); gl.uniformMatrix4fv(SPR.u.VP,false,VP); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D,atT); gl.uniform1i(SPR.u.tx,1); gl.uniform1f(SPR.u.add,addM?1:0);
        gl.bindVertexArray(spV); gl.bindBuffer(gl.ARRAY_BUFFER,spB); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(list),gl.DYNAMIC_DRAW); gl.drawArrays(gl.TRIANGLES,0,list.length/9); }
      var A=[], Bv=[]; sprN.forEach(function(s){ if(s.flat){ var c=cell(s.cel), r=[s.s,0,0], u=[0,0,s.s]; [[-1,-1,c[0],c[3]],[1,-1,c[2],c[3]],[1,1,c[2],c[1]],[-1,-1,c[0],c[3]],[1,1,c[2],c[1]],[-1,1,c[0],c[1]]].forEach(function(v){ var q=add(add(s.p,scl(r,v[0])),scl(u,v[1])); A.push(q[0],q[1],q[2],v[2],v[3],s.c[0],s.c[1],s.c[2],s.c[3]); }); }
        else sprite(A,s.p,s.s,s.c,s.cel,cr,cu); });
      gl.blendFunc(gl.ONE,gl.ONE); flush(A,true);
      spr.forEach(function(s){ sprite(Bv,s.p,s.s,s.c,s.cel,cr,cu); }); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA); flush(Bv,false);
      gl.depthMask(true); gl.disable(gl.BLEND); gl.bindVertexArray(null);
      R3.VP=VP; (function(){ function pj(p){ var x=VP[0]*p[0]+VP[4]*p[1]+VP[8]*p[2]+VP[12], y=VP[1]*p[0]+VP[5]*p[1]+VP[9]*p[2]+VP[13], w=VP[3]*p[0]+VP[7]*p[1]+VP[11]*p[2]+VP[15]; return [(x/w*.5+.5)*W,(1-(y/w*.5+.5))*H]; }
        var a=pj(xf(carM,[0,0,0])), c=pj(xf(carM,[2.25,0,0])); R3.cs={x:a[0],y:a[1],w:M.abs(c[0]-a[0])*2}; R3.pj=pj; })();
    }
    R3.frame=frame3;
    R3.labels=function(ctx2,now){ var VP=R3.VP; if(!VP) return; labels.forEach(function(l){ var p=l.p, x=VP[0]*p[0]+VP[4]*p[1]+VP[8]*p[2]+VP[12], y=VP[1]*p[0]+VP[5]*p[1]+VP[9]*p[2]+VP[13], w=VP[3]*p[0]+VP[7]*p[1]+VP[11]*p[2]+VP[15]; if(w<=.5) return;
      var sx=(x/w*.5+.5)*W, sy=(1-(y/w*.5+.5))*H, fs=M.max(10,M.min(18,140/w*1.2));
      if(l.fx) aura(sx,sy+fs*2.2,M.min(260,1100/w),l.fx,now,l.al);
      if(false&&l.fl&&R3.pj){ var q0=R3.pj(l.b0), q1=R3.pj(l.b1), cw=M.abs(q1[0]-q0[0])*2; if(cw>4){ ctx2.save(); ctx2.globalAlpha=l.al; drawWings(q0[0],q0[1],cw,1,now+l.h*37,true,l.w); ctx2.restore(); } }
      ctx2.fillStyle='rgba(255,255,255,'+M.min(.9,l.al+.1)+')'; ctx2.font='bold '+fs+'px system-ui'; ctx2.textAlign='center'; ctx2.fillText(l.t,sx,sy); }); };
    R3.kill=function(){ try{ glc.remove(); cv.style.background=cvOld.bg; cv.style.position=cvOld.pos; cv.style.zIndex=cvOld.z; var ext=gl.getExtension('WEBGL_lose_context'); if(ext) ext.loseContext(); }catch(e){} R3.ok=false; };
    R3.ok=true;
  }catch(e){ try{ console.warn('race3d off:',e&&e.message); }catch(_){} try{ if(R3.kill) R3.kill(); }catch(_){} R3.ok=false; } })();

  function render(now,myRank,total){
    var sh=S.shake>0?(Math.random()-.5)*6*Math.min(1,S.shake*3):0;
    var spd0=S.speed/MAXV, roll=(-segAt(Math.floor(S.pos/SEG)).curve*.006-S.steer*.008)*spd0, ldt=Math.min(.05,(now-(S.lastR||now))/1000); S.lastR=now;
    var use3=R3.ok; if(use3){ try{ ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,W,H); var zk3=1+Math.min(.04,Math.max(S.boostT,S.odT)*.03)+zoomK*.05; if(S.finished){ var pbk3=Math.min(1,(Date.now()-S.finishAt)/2400); zk3*=1-.08*pbk3*pbk3*(3-2*pbk3); } R3.frame(now,roll,sh,zk3); }catch(e){ try{ console.warn('race3d frame',e); }catch(_){} R3.kill(); use3=false; } }
    ctx.save(); ctx.translate(sh,sh*.6+S.landK*9); if(Math.abs(roll)>.0004){ ctx.translate(W/2,H*.6); ctx.rotate(roll); ctx.scale(1.03,1.03); ctx.translate(-W/2,-H*.6); }
    if(S.finished&&S.flyOn===false&&S.lndT>0||S.finished&&S.flyOn){ var pbk=Math.min(1,(Date.now()-S.finishAt)/2400), pbe=pbk*pbk*(3-2*pbk), pz=1-.08*pbe; ctx.translate(W/2,H*.6); ctx.scale(pz,pz); ctx.translate(-W/2,-H*.6); }
    if(S.boostT>0||S.odT>0||zoomK>0){ var zk=1+Math.min(.04,Math.max(S.boostT,S.odT)*.03)+zoomK*.05; ctx.translate(W/2,H*.6); ctx.scale(zk,zk); ctx.translate(-W/2,-H*.6); }
    if(!use3){
    /* sky */
    var g=ctx.createLinearGradient(0,0,0,HOR); g.addColorStop(0,T.sky[0]); g.addColorStop(.55,T.sky[1]); g.addColorStop(.9,T.sky[2]); g.addColorStop(1,T.sky[3]);
    ctx.fillStyle=g; ctx.fillRect(-10,-10,W+20,HOR+12);
    if(T.stars){ stars.forEach(function(st){ ctx.globalAlpha=.35+.65*Math.abs(Math.sin(now/700+st.p)); ctx.fillStyle='#fff'; ctx.fillRect(((st.x+S.bg*.04)%W+W)%W,st.y,st.s,st.s); }); ctx.globalAlpha=1; }
    if(T.planet){ var pxx=W*0.28-S.bg*.05, pyy=HOR*0.42, prr=Math.min(W,HOR*2)*0.15, pg2=ctx.createRadialGradient(pxx-prr*.3,pyy-prr*.3,prr*.1,pxx,pyy,prr); pg2.addColorStop(0,'#f2b27a'); pg2.addColorStop(.6,'#c4623f'); pg2.addColorStop(1,'#4a1a2e'); ctx.fillStyle=pg2; ctx.beginPath(); ctx.arc(pxx,pyy,prr,0,7); ctx.fill();
      ctx.save(); ctx.strokeStyle='rgba(255,226,180,.55)'; ctx.lineWidth=Math.max(2,prr*.08); ctx.beginPath(); ctx.ellipse(pxx,pyy,prr*1.7,prr*.42,-.35,0,7); ctx.stroke(); ctx.restore();
      var p2x=W*0.82+S.bg*.08, p2y=HOR*0.2; ctx.fillStyle='#9fb4d6'; ctx.beginPath(); ctx.arc(p2x,p2y,prr*.22,0,7); ctx.fill(); }
    if(T.aurora){ for(var ab=0;ab<4;ab++){ var ac=['rgba(80,255,170,','rgba(90,200,255,','rgba(180,120,255,','rgba(60,255,210,'][ab], ay=HOR*(.16+ab*.1), aw=0.5+0.5*Math.sin(now/1400+ab*1.7);
        ctx.beginPath(); ctx.moveTo(-10,ay+30); for(var ax=-10;ax<=W+10;ax+=14){ ctx.lineTo(ax,ay+Math.sin(ax/90+now/900+ab*2+S.bg*.01)*18+Math.sin(ax/37+now/500)*5); } ctx.lineTo(W+10,ay+60); ctx.lineTo(-10,ay+60); ctx.closePath();
        var ag=ctx.createLinearGradient(0,ay-20,0,ay+60); ag.addColorStop(0,ac+'0)'); ag.addColorStop(.35,ac+(.22+.2*aw)+')'); ag.addColorStop(1,ac+'0)'); ctx.fillStyle=ag; ctx.fill(); } }
    if(CZ) czCube(now);
    if(T.moon){ var mx=W*0.72+S.bg*.1, mg=ctx.createRadialGradient(mx,70,6,mx,70,90); mg.addColorStop(0,'rgba(230,238,255,.5)'); mg.addColorStop(1,'rgba(230,238,255,0)'); ctx.fillStyle=mg; ctx.fillRect(mx-100,0,200,180); ctx.fillStyle='#eef3ff'; ctx.beginPath(); ctx.arc(mx,70,22,0,7); ctx.fill(); ctx.fillStyle='rgba(150,165,200,.45)'; ctx.beginPath(); ctx.arc(mx-7,64,5,0,7); ctx.arc(mx+8,78,4,0,7); ctx.fill(); }
    if(T.sun){ var sa=T.sunA||1, sun=ctx.createRadialGradient(W*0.7+S.bg*.2,HOR-20,4,W*0.7+S.bg*.2,HOR-20,150); sun.addColorStop(0,'rgba('+T.sun+','+(.95*sa)+')'); sun.addColorStop(.25,'rgba('+(T.sun==='255,255,255'?'255,255,255':'255,150,60')+','+(.5*sa)+')'); sun.addColorStop(1,'rgba('+(T.sun==='255,255,255'?'255,255,255':'255,120,40')+',0)');
      ctx.fillStyle=sun; ctx.fillRect(0,0,W,HOR+10); }
    if(T.clouds){ for(var cl=0;cl<7;cl++){ var cxx=(((cl*190+S.bg*.06+now*.004)%(W+300))-150), cyy=30+(cl%3)*34; ctx.fillStyle='rgba(30,38,48,.55)'; ctx.beginPath(); ctx.ellipse(cxx,cyy,120,26,0,0,7); ctx.ellipse(cxx+60,cyy+8,90,22,0,0,7); ctx.fill(); } }
    /* mountains (parallax) */
    [[T.mt[0],.12,60,.012],[T.mt[1],.3,38,.02]].forEach(function(m){ ctx.fillStyle=m[0]; ctx.beginPath(); ctx.moveTo(-10,HOR+2);
      for(var x=-10;x<=W+10;x+=16){ var y=HOR-m[2]*(0.55+0.45*Math.sin((x+S.bg*m[1])*m[3]*3+1.3)*Math.sin((x+S.bg*m[1])*m[3]*1.7)); ctx.lineTo(x,y); }
      ctx.lineTo(W+10,HOR+2); ctx.closePath(); ctx.fill(); });
    if(T.rain||S.stm>.25){ S.ltT-=ldt; if(S.ltT<=0){ S.ltT=S.stm>.25?1.2+Math.random()*2.2:5+Math.random()*7; S.bolt=.3; S.boltX=W*(.15+Math.random()*.7); setTimeout(function(){ if(!destroyed) SFX.thunder(); },300+Math.random()*500); }
      if(S.bolt>0){ S.bolt-=ldt; var ba=Math.max(0,S.bolt/.3); ctx.fillStyle='rgba(215,228,255,'+(.32*ba)+')'; ctx.fillRect(-10,-10,W+20,HOR+12);
        var br=mulberry(Math.floor(S.boltX)), bx0=S.boltX, by0=0; ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.lineJoin='round';
        for(var pass=0;pass<2;pass++){ ctx.strokeStyle=pass?'rgba(255,255,255,'+ba+')':'rgba(150,180,255,'+(.5*ba)+')'; ctx.lineWidth=pass?2.5:9; ctx.beginPath(); ctx.moveTo(bx0,by0); var qx=bx0,qy=0; br=mulberry(Math.floor(S.boltX)); while(qy<HOR){ qy+=14+br()*18; qx+=(br()-.5)*34; ctx.lineTo(qx,qy); } ctx.stroke(); }
        ctx.restore(); } }
    ctx.fillStyle=T.g0; ctx.fillRect(-10,HOR,W+20,H-HOR+10);
    /* project segments */
    var base=Math.floor(S.pos/SEG), pct=(S.pos%SEG)/SEG, x=0, dxc=-(segAt(base).curve*pct), camX=S.px*ROADW, P=[];
    for(var n=0;n<DRAW;n++){
      var s=segAt(base+n), z1=n*SEG-pct*SEG+NEAR, z2=z1+SEG;
      var a=project(x-camX,z1), b=project(x+dxc-camX,z2);
      P.push({s:s,a:a,b:b,ix:base+n}); x+=dxc; dxc+=s.curve;
    }
    /* road pass, far to near */
    for(n=DRAW-1;n>=0;n--){
      var p=P[n],A=p.a,B=p.b,alt=Math.floor(p.ix/3)%2, fog=Math.pow(n/DRAW,1.8);
      if(B.y>=A.y) continue;
      ctx.fillStyle=alt?T.g1:T.g2; ctx.fillRect(0,B.y,W,A.y-B.y+1);
      var rw1=A.w*0.1,rw2=B.w*0.1,rc=CZ?CZC[Math.floor(p.ix/2)%6]:(alt?'#eb402f':'#f4f6f8');
      poly(rc,A.x-A.w-rw1,A.y,A.x-A.w,A.y,B.x-B.w,B.y,B.x-B.w-rw2,B.y);
      poly(rc,A.x+A.w+rw1,A.y,A.x+A.w,A.y,B.x+B.w,B.y,B.x+B.w+rw2,B.y);
      var finish=p.ix>=N-3&&p.ix<N-1;
      if(finish){ for(var q=0;q<10;q++){ var u0=-1+q*0.2,u1=u0+0.2; poly(((q+p.ix)%2)?'#f4f6f8':'#0b0d0f',A.x+A.w*u0,A.y,A.x+A.w*u1,A.y,B.x+B.w*u1,B.y,B.x+B.w*u0,B.y); } }
      else{
        poly(alt?T.r1:T.r2,A.x-A.w,A.y,A.x+A.w,A.y,B.x+B.w,B.y,B.x-B.w,B.y);
        if(T.wet&&alt) poly('rgba(160,190,225,.10)',A.x-A.w,A.y,A.x+A.w,A.y,B.x+B.w,B.y,B.x-B.w,B.y);
        if(alt){ [-1/3,1/3].forEach(function(u){ var l1=A.w*0.018,l2=B.w*0.018; poly(CZ?'rgba(39,230,220,.85)':'rgba(244,246,248,.8)',A.x+A.w*u-l1,A.y,A.x+A.w*u+l1,A.y,B.x+B.w*u+l2,B.y,B.x+B.w*u-l2,B.y); }); }
        var ob=p.s.ob; if(ob&&ob.type==='boost'&&!ob.done){
          var bx1=A.x+A.w*ob.x,bx2=B.x+B.w*ob.x,bw1=A.w*0.3,bw2=B.w*0.3, pulse=0.65+0.35*Math.sin(now/90);
          if(GFX>0) poly('rgba(255,200,60,'+(.10*pulse)+')',bx1-bw1*2.1,A.y,bx1+bw1*2.1,A.y,bx2+bw2*2.1,B.y,bx2-bw2*2.1,B.y);
          poly('rgba(253,190,24,'+pulse+')',bx1-bw1,A.y,bx1+bw1,A.y,bx2+bw2,B.y,bx2-bw2,B.y);
          poly('rgba(255,255,255,.55)',bx1-bw1*.5,A.y,bx1+bw1*.5,A.y,bx2+bw2*.5,B.y,bx2-bw2*.5,B.y);
          if((((p.ix*.16-now/380)%1)+1)%1<.4) poly('rgba(255,255,255,.8)',bx1-bw1*.85,A.y,bx1+bw1*.85,A.y,bx2+bw2*.85,B.y,bx2-bw2*.85,B.y);
        }
      }
      if(CZ&&p.ix%GATE===0&&p.ix>=GATE&&p.ix<N-40) czGate(A,B,n,now);
      if(fog>.02){ ctx.fillStyle='rgba('+T.fog+','+(fog*.55)+')'; ctx.fillRect(0,B.y,W,A.y-B.y+1); }
    }
    if(T.lights){ var hl=ctx.createLinearGradient(0,H-20,0,HOR+30); hl.addColorStop(0,'rgba(255,244,200,.34)'); hl.addColorStop(1,'rgba(255,244,200,0)'); ctx.fillStyle=hl; ctx.beginPath(); ctx.moveTo(W/2-70,H-20); ctx.lineTo(W/2-230,HOR+30); ctx.lineTo(W/2+230,HOR+30); ctx.lineTo(W/2+70,H-20); ctx.closePath(); ctx.fill(); }
    /* sprite pass, far to near */
    var myDist=S.pos, list=[];
    Object.keys(others).forEach(function(kk){ var s=others[kk], d=s.vis/100*TL-myDist; if(d>0&&d<(DRAW-3)*SEG) list.push({s:s,d:d}); });
    if(gh&&S.t>0&&!S.finished){ var ga=ghostAt(S.t), gd=ga[0]/1000*TL-myDist; if(gd>0&&gd<(DRAW-3)*SEG) list.push({s:{vis:ga[0]/10,lane:ga[1]/100,h:7,name:'👻 '+(gh.name||'Best'),car:gh.car|0,ghost:true},d:gd}); }
    drawBoss(now);
    for(n=DRAW-1;n>=0;n--){
      p=P[n]; A=p.a; var sprS=A.sc, fogA=1-Math.pow(n/DRAW,2.2)*.8;
      if(p.s.sc){ var sc2=p.s.sc; scenery(sc2,A.x+A.w*sc2.x,A.y,sprS); proLamp(sc2,A.x+A.w*sc2.x,A.y,sprS); }
      if(p.s.bs&&S.flyOn) p.s.bs.forEach(function(m){ if(!m.done) skySprite({type:'missile',h:m.h},A.x+A.w*m.x,A.y,sprS,now,p.ix); });
      if(p.s.sk&&!p.s.sk.done&&S.flyOn) skySprite(p.s.sk,A.x+A.w*(p.s.sk.type==='drone'?p.s.sk.x0+.3*Math.sin(p.ix*.18):p.s.sk.x0),A.y,sprS,now,p.ix);
      if(p.s.rp) rampSprite(p.s.rp,A.x+A.w*p.s.rp.x,A.y,sprS,now);
      if(p.s.pu&&!p.s.pu.done) puSprite(p.s.pu,A.x+A.w*p.s.pu.x,A.y,sprS,now);
      if(p.s.cn&&!p.s.cn.done) coinSprite(A.x+A.w*p.s.cn.x,A.y,sprS,now,p.ix);
      if(p.s.ob&&!p.s.ob.done) obstacle(p.s.ob,A.x+A.w*p.s.ob.x,A.y,sprS);
      list.forEach(function(it){
        var ni=Math.floor(it.d/SEG+pct); if(ni!==n) return; var s=it.s;
        var lane=s.lane+Math.sin(now/700+s.h)*0.06, cx=A.x+A.w*lane, cw=sprS*CARW*(W/2);
        var fl=s.vis>=50, lift=fl?sprS*(W/2)*300:0, al=s.ghost?fogA*.42:fogA;
        if(fl){ NOSH=true; ctx.fillStyle='rgba(0,0,0,'+(.3*al)+')'; ctx.beginPath(); ctx.ellipse(cx,A.y+cw*.02,cw*.55,cw*.09,0,0,7); ctx.fill(); }
        if(s.fx&&s.fx.a) aura(cx,A.y-lift-cw*.4,cw,s.fx.a,now,al);
        drawCar(cx,A.y-lift,cw,s.h,0,false,false,al,s.car);
        if(false&&fl){ NOSH=false; ctx.save(); ctx.globalAlpha=al; drawWings(cx,A.y-lift,cw,1,now+s.h*37,true,s.fx?s.fx.w:0); ctx.restore(); }
        ctx.fillStyle='rgba(255,255,255,'+Math.min(.9,fogA)+')'; ctx.font='bold '+Math.max(10,Math.min(18,cw*0.16))+'px system-ui'; ctx.textAlign='center'; ctx.fillText(s.name,cx,A.y-lift-cw*1.18);
      });
    }
    proScene(now);
    } else { drawBoss(now); R3.labels(ctx,now); }
    /* my car */
    var bob=Math.sin(now/60)*(S.speed/MAXV)*1.2+(Math.abs(S.px)>1.06?Math.sin(now/25)*2.5:0);
    var spd1=S.speed/MAXV, spw=sprScale(), airH=S.air>0?Math.sin(Math.PI*Math.min(1,S.airT/S.airDur)):0, gy0=H-14+bob, cy0=gy0-airH*spw*1.05-S.fly*spw*(.4+.55*S.ay)-(S.flyOn?Math.sin(now/380)*4*S.fly:0);
    if(use3&&R3.cs&&isFinite(R3.cs.y)){ cy0=R3.cs.y; spw=Math.max(60,Math.min(420,R3.cs.w)); }
    if(!use3){ ctx.fillStyle='rgba(0,0,0,'+(.38*(1-airH*.55))+')'; } else ctx.fillStyle='rgba(0,0,0,0)'; ctx.beginPath(); ctx.ellipse(W/2,gy0+spw*.02,spw*.62*(1-(airH+S.fly*.8)*.3),spw*.1*(1-(airH+S.fly*.8)*.3),0,0,7); ctx.fill();
    flyFx(now);
    NOSH=true;
    if(!use3&&(S.boostT>0||S.odT>0)&&!S.finished){ var od2=S.odT>0; for(var ek=(S.flyOn?1:3);ek>=1;ek--){ ctx.save(); ctx.translate(W/2,cy0); var ez=1+ek*(od2?.1:.07); ctx.scale(ez,ez); ctx.translate(-W/2,-cy0); drawCar(W/2,cy0,spw,myHash,S.steer,false,false,(od2?.3:.2)/ek*1.5,o.car); ctx.restore(); } }
    var phA=S.phaseT>0?(.5+.12*Math.sin(now/55)):null; if(S.phaseT>0&&S.phaseT<.8&&Math.floor(now/90)%2) phA=.9;
    ctx.save(); var pvy=cy0-spw*.45; ctx.translate(W/2,pvy); ctx.rotate(S.steer*.05*spd1+S.spin+(S.spinR||0)*S.squash); ctx.translate(-W/2,-pvy);
    ctx.translate(W/2,cy0); ctx.scale(1+S.squash*.18+(S.boostT>0?.02:0),1-S.squash*.2); ctx.translate(-W/2,-cy0);
    if(S.odT>0){ var oag=ctx.createRadialGradient(W/2,cy0-spw*.5,spw*.2,W/2,cy0-spw*.5,spw*1.3); oag.addColorStop(0,'rgba(224,139,255,.5)'); oag.addColorStop(1,'rgba(224,139,255,0)'); ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle=oag; ctx.fillRect(W/2-spw*1.4,cy0-spw*1.9,spw*2.8,spw*2.4); ctx.restore(); }
    if(MYFX.a) aura(W/2,cy0-spw*.4,spw,MYFX.a,now,1);
    if(!use3) drawCar(W/2,cy0,spw,myHash,S.steer,S.boostT>0||S.odT>0,forge,phA,o.car);
    if(false&&S.wing>0&&!use3) drawWings(W/2,cy0,spw,S.wing,now,S.flyOn&&S.wing>.9,MYFX.w);
    if(S.phaseT>0){ ctx.strokeStyle='rgba(143,247,255,'+(.55+.3*Math.sin(now/70))+')'; ctx.lineWidth=3; ctx.setLineDash([10,7]); ctx.lineDashOffset=-now/30; ctx.strokeRect(W/2-spw*.47,cy0-spw*1.2,spw*.94,spw*1.1); ctx.setLineDash([]); }
    ctx.restore(); NOSH=false; proCar(now,cy0,spw);
    if(S.shield){ ctx.save(); var sp0=sprScale(); ctx.strokeStyle='rgba(120,215,255,'+(.55+.3*Math.sin(now/110))+')'; ctx.lineWidth=5; ctx.fillStyle='rgba(120,215,255,.12)'; ctx.beginPath(); ctx.ellipse(W/2,cy0-sp0*.32,sp0*.78,sp0*.58,0,0,7); ctx.fill(); ctx.stroke(); ctx.restore(); }
    if(S.magT>0){ ctx.save(); ctx.strokeStyle='rgba(255,120,120,'+(.25+.2*Math.sin(now/90))+')'; ctx.lineWidth=3; ctx.setLineDash([10,8]); ctx.beginPath(); ctx.arc(W/2,H-60,120+Math.sin(now/120)*8,0,7); ctx.stroke(); ctx.restore(); }
    ctx.restore();
    /* weather over the scene */
    if(T.tint){ ctx.fillStyle='rgba('+T.tint+')'; ctx.fillRect(0,0,W,H); }
    if(wxp.length){
      var wdt=wxT?Math.min(.05,(now-wxT)/1000):.016; wxT=now; var spd=S.speed/MAXV;
      if(T.rain){ ctx.strokeStyle='rgba(200,220,245,.45)'; ctx.lineWidth=1.4; ctx.beginPath();
        wxp.forEach(function(d){ d.y+=(820+spd*500)*d.v*wdt; d.x-=(90+spd*160)*d.v*wdt; if(d.y>H){ d.y=-20; d.x=Math.random()*(W+120); } if(d.x<-20) d.x+=W+40; ctx.moveTo(d.x,d.y); ctx.lineTo(d.x+5+spd*6,d.y-(16+spd*14)); }); ctx.stroke(); }
      else if(T.ember){ ctx.fillStyle='rgba('+T.emberC+',.85)';
        wxp.forEach(function(d){ d.y-=(40+spd*90)*d.v*wdt; d.x+=Math.sin(now/700+d.ph)*30*wdt-(spd*30)*wdt; if(d.y<-6){ d.y=H+6; d.x=Math.random()*W; } if(d.x<-6) d.x+=W+12; ctx.fillRect(d.x,d.y,d.r,d.r); }); }
      else{ ctx.fillStyle='rgba(255,255,255,.88)';
        wxp.forEach(function(d){ d.y+=(55+spd*110)*d.v*wdt; d.x+=Math.sin(now/900+d.ph)*28*wdt-(spd*40)*wdt; if(d.y>H){ d.y=-6; d.x=Math.random()*W; } if(d.x<-6) d.x+=W+12; ctx.fillRect(d.x,d.y,d.r,d.r); }); }
    }
    ctx.fillStyle='rgba(10,12,14,.5)'; ctx.fillRect(W/2-52,36,104,22); ctx.fillStyle='#e8eef4'; ctx.font='700 12px system-ui'; ctx.textAlign='center'; ctx.fillText(T.ic+' '+T.n,W/2,52);
    var spv=S.speed/MAXV; if(spv>.6){ var vg=ctx.createRadialGradient(W/2,H*.55,H*.35,W/2,H*.55,H*.95); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,'+Math.min(.5,(spv-.6)*1.1)+')'); ctx.fillStyle=vg; ctx.fillRect(0,0,W,H); }
    if(S.slipOn&&S.slip>0){ ctx.strokeStyle='rgba(155,227,122,.5)'; ctx.lineWidth=3; for(var sl2=0;sl2<8;sl2++){ var xx=W/2+(Math.random()-.5)*300, yy=H*.5+Math.random()*120; ctx.beginPath(); ctx.moveTo(xx,yy); ctx.lineTo(xx+(xx-W/2)*.25,yy+60); ctx.stroke(); } }
    if(S.flash>0){ ctx.fillStyle='rgba('+S.flashC+','+Math.min(S.flyOn?.07:.16,S.flash*.5)+')'; ctx.fillRect(0,0,W,H); }
    /* speed lines on boost */
    if(S.boostT>0&&!S.flyOn){ ctx.strokeStyle='rgba(255,230,160,.35)'; ctx.lineWidth=2; for(var l=0;l<14;l++){ var ang=Math.random()*6.28,r1=180+Math.random()*80,r2=r1+90+Math.random()*120; ctx.beginPath(); ctx.moveTo(W/2+Math.cos(ang)*r1*1.6,H*.55+Math.sin(ang)*r1*.8); ctx.lineTo(W/2+Math.cos(ang)*r2*1.6,H*.55+Math.sin(ang)*r2*.8); ctx.stroke(); } }
    stormFx(now); missileFx(now);
    { var fl2=!!(S.flyOn&&!S.finished); if(S._altF!==fl2){ S._altF=fl2; try{ cv.parentNode.classList.toggle('cwFly',fl2); }catch(e){} } }
    vfxDraw(now);
    drawFx(now);
    if(!use3) proPost(now);
    drawTf(now);
    ctx.fillStyle='rgba(2,4,12,.16)'; ctx.fillRect(0,0,W,H);
    hud(myRank,total);
  }
  function sprScale(){ return (CAMD/NEAR)*CARW*(W/2); }
  function hud(rank,total){
    ctx.textAlign='left'; ctx.fillStyle='rgba(10,12,14,.55)'; ctx.fillRect(12,12,190,62); ctx.fillStyle='#fff'; ctx.font='800 34px system-ui'; var rpz=S.rankPulse>0?1+Math.sin(Math.min(1,S.rankPulse/.5)*Math.PI)*.28:1; ctx.save(); ctx.translate(24,52); ctx.scale(rpz,rpz); ctx.fillText('P'+rank,0,0); ctx.restore(); ctx.font='600 15px system-ui'; ctx.fillStyle='#b4bcc3'; ctx.fillText('of '+total,88,50);
    ctx.fillStyle='rgba(10,12,14,.55)'; ctx.fillRect(W-202,12,190,62); ctx.textAlign='right'; ctx.fillStyle='#fff'; ctx.font='800 30px system-ui'; ctx.fillText(Math.round(S.speed/MAXV*240),W-76,48); ctx.font='600 12px system-ui'; ctx.fillStyle='#b4bcc3'; ctx.fillText('km/h',W-76,64);
    (function(){ var sv=Math.min(1,S.speed/MAXV/1.5), gx=W-44, gy2=46, gr=24, a0=Math.PI*.75, a1=a0+Math.PI*1.5*sv; ctx.lineCap='round'; ctx.lineWidth=6; ctx.strokeStyle='rgba(255,255,255,.14)'; ctx.beginPath(); ctx.arc(gx,gy2,gr,a0,Math.PI*2.25); ctx.stroke();
      var gg=ctx.createLinearGradient(gx-gr,0,gx+gr,0); gg.addColorStop(0,'#3593e2'); gg.addColorStop(.6,'#fdbe18'); gg.addColorStop(1,'#ff4d3d'); ctx.strokeStyle=S.odT>0?'#e08bff':gg; ctx.beginPath(); ctx.arc(gx,gy2,gr,a0,Math.max(a0+.01,a1)); ctx.stroke();
      ctx.strokeStyle='#fff'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(gx,gy2); ctx.lineTo(gx+Math.cos(a1)*(gr-4),gy2+Math.sin(a1)*(gr-4)); ctx.stroke(); })();
    if(S.flyOn){ ctx.textAlign='center'; ctx.font='800 13px system-ui'; ctx.fillStyle='rgba(10,12,14,.55)'; ctx.fillRect(W/2-70,62,140,20); ctx.fillStyle='#9fe3ff'; ctx.fillText('🪽 SKY MODE'+(S.rings?' · '+S.rings+' ◎':'')+' · 🚀'+S.ammo,W/2,76); }
    if(S.flyOn&&!S.finished){ var ax=W-18, ay0=96, ah=110; ctx.fillStyle='rgba(10,12,14,.5)'; ctx.fillRect(ax-7,ay0-6,14,ah+12); ctx.fillStyle='rgba(159,227,255,.25)'; ctx.fillRect(ax-2,ay0,4,ah); ctx.fillStyle='#9fe3ff'; ctx.beginPath(); ctx.arc(ax,ay0+ah*(1-S.ay),6,0,7); ctx.fill(); ctx.font='700 10px system-ui'; ctx.textAlign='center'; ctx.fillStyle='#b4bcc3'; ctx.fillText('▲',ax,ay0-9); ctx.fillText('▼',ax,ay0+ah+18); }
    if(S.flyOn&&!S.finished&&BZ0){ var pb=S.pos/TL; if(pb>.855){ var hp=Math.max(0,Math.min(1,1-(pb-.885)/(BZ1/(segs.length||1)-.885+.0001)*1)); hp=Math.max(0,Math.min(1,1-(S.pos/SEG-BZ0)/(BZ1-BZ0))); ctx.fillStyle='rgba(10,12,14,.6)'; ctx.fillRect(W/2-110,88,220,22); ctx.fillStyle='rgba(255,70,50,.85)'; ctx.fillRect(W/2-104,100,208*hp,5); ctx.fillStyle='#ffb3a6'; ctx.font='800 12px system-ui'; ctx.textAlign='center'; ctx.fillText('☠ STORM LEVIATHAN',W/2,97); } }
    var chips=[]; if(S.shield) chips.push(['🛡',1,'120,215,255']); if(S.magT>0) chips.push(['🧲',S.magT/7,'255,120,120']); if(S.phaseT>0) chips.push(['👻',S.phaseT/3.5,'120,245,255']); if(S.odT>0) chips.push(['🚀',S.odT/2.5,'210,110,255']);
    ctx.textAlign='left'; ctx.font='16px system-ui'; chips.forEach(function(c,i){ var yy=80+i*26; ctx.fillStyle='rgba(10,12,14,.55)'; ctx.fillRect(12,yy,190,22); ctx.fillStyle='rgba('+c[2]+',.35)'; ctx.fillRect(40,yy+7,150*Math.max(0,Math.min(1,c[1])),8); ctx.strokeStyle='rgba('+c[2]+',.9)'; ctx.lineWidth=1; ctx.strokeRect(40,yy+7,150,8); ctx.fillStyle='#fff'; ctx.fillText(c[0],18,yy+17); });
    /* progress track */
    var bx=W/2-170,by=20,bw=340; ctx.fillStyle='rgba(10,12,14,.55)'; ctx.fillRect(bx-8,by-8,bw+16,26); ctx.fillStyle='rgba(255,255,255,.18)'; ctx.fillRect(bx,by+3,bw,6);
    ctx.fillStyle='#3593e2'; ctx.fillRect(bx,by+3,bw*Math.min(1,S.pos/TL),6); ctx.fillStyle='rgba(255,255,255,.7)'; ctx.fillRect(bx+bw/2-1,by,2,12); ctx.font='11px system-ui'; ctx.textAlign='center'; ctx.fillText('🪽',bx+bw/2,by-1);
    Object.keys(others).forEach(function(kk){ var s=others[kk]; ctx.fillStyle=PAL[s.h%6]; ctx.beginPath(); ctx.arc(bx+bw*Math.min(1,s.vis/100),by+6,5,0,7); ctx.fill(); });
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(bx+bw*Math.min(1,S.pos/TL),by+6,7,0,7); ctx.fill(); ctx.strokeStyle='#3593e2'; ctx.lineWidth=3; ctx.stroke();
    /* nitro meter + coins + combo */
    var nx=16,ny=H-40,nw=250,rdy=S.nitro>=100; ctx.fillStyle='rgba(10,12,14,.6)'; ctx.fillRect(nx-6,ny-22,nw+12,40);
    ctx.fillStyle='rgba(255,255,255,.16)'; ctx.fillRect(nx,ny,nw,12);
    var ng=ctx.createLinearGradient(nx,0,nx+nw,0); ng.addColorStop(0,'#3593e2'); ng.addColorStop(1,rdy?'#9fe3ff':'#5cc8ff'); ctx.fillStyle=ng; ctx.fillRect(nx,ny,nw*S.nitro/100,12);
    ctx.textAlign='left'; ctx.font='800 13px system-ui'; ctx.fillStyle=rdy&&Math.floor(Date.now()/250)%2?'#fff':'#9fe3ff'; ctx.fillText(rdy?'NITRO READY — TAP IT!':'NITRO',nx,ny-7);
    if(CZ) czHud(Date.now());
    ctx.textAlign='right'; ctx.font='800 20px system-ui'; ctx.fillStyle='#fdbe18'; ctx.fillText('◆ '+S.coins,W-22,H-18);
    if(S.combo>=3){ ctx.font='800 17px system-ui'; ctx.fillStyle='#fff'; ctx.fillText('COMBO x'+S.combo,W-22,H-44); ctx.fillStyle='rgba(255,255,255,.18)'; ctx.fillRect(W-122,H-40,100,5); ctx.fillStyle='#fdbe18'; ctx.fillRect(W-122,H-40,100*Math.max(0,Math.min(1,S.comboT/1.8)),5); }
    if(S.tricks>0){ ctx.font='800 15px system-ui'; ctx.fillStyle='#9fe3ff'; ctx.fillText('🌀 tricks ×'+S.tricks,W-22,H-64); }
    if(S.drift>.3){ ctx.textAlign='center'; ctx.font='800 20px system-ui'; ctx.fillStyle=S.drift>=2?'#c28bff':S.drift>=1?'#6cc4ff':'#ffb347'; ctx.fillText(S.drift>=2?'SUPER DRIFT — LET GO!':S.drift>=1?'DRIFT READY — LET GO!':'DRIFTING…',W/2,H-150); }
  }
  var BF=1;
  function banner(txt,sub){
    var f=Math.max(0,Math.min(1,BF)), num=/^\d$/.test(txt), go=txt==='GO!', fin=txt==='FINISH!';
    ctx.fillStyle='rgba(8,10,12,'+(go?.5*(1-f):.5)+')'; ctx.fillRect(0,0,W,H); ctx.textAlign='center';
    if(num||go){ var col=txt==='3'?'#ff5a4d':txt==='2'?'#ffb03a':txt==='1'?'#7dffb0':'#7dffb0', e=1-Math.pow(1-Math.min(1,f*3),3), sc=go?1+f*1.3:1.8-.8*e+(f>.82?(f-.82)*1.6:0), al=go?1-f:(f>.86?1-(f-.86)/.14*.85:1);
      ctx.save(); ctx.globalAlpha=al*.9; ctx.strokeStyle=col; ctx.lineWidth=Math.max(2,12*(1-f)); ctx.beginPath(); ctx.ellipse(W/2,H*.47,60+f*(go?520:300),(60+f*(go?520:300))*.55,0,0,7); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.translate(W/2,H*.5); ctx.scale(sc,sc); ctx.globalAlpha=al; ctx.shadowColor=col; ctx.shadowBlur=44; ctx.fillStyle=col; ctx.font='900 '+(go?150:190)+'px system-ui'; ctx.lineWidth=10; ctx.strokeStyle='rgba(8,10,12,.6)'; ctx.strokeText(txt,0,62); ctx.fillText(txt,0,62); ctx.restore(); }
    else if(fin){ var e2=1-Math.pow(1-Math.min(1,f*2.5),3); ctx.save(); ctx.translate(W/2,H*.5); ctx.scale(.6+.4*e2,.6+.4*e2); ctx.globalAlpha=Math.min(1,f*4); ctx.shadowColor='#ffd36b'; ctx.shadowBlur=36; ctx.fillStyle='#ffe08a'; ctx.font='900 120px system-ui'; ctx.lineWidth=9; ctx.strokeStyle='rgba(8,10,12,.65)'; ctx.strokeText(txt,0,40); ctx.fillText(txt,0,40); ctx.restore(); }
    else{ ctx.fillStyle='#fff'; ctx.font='800 '+(txt.length>3?84:170)+'px system-ui'; ctx.fillText(txt,W/2,H*0.5); }
    if(sub){ ctx.font='600 22px system-ui'; ctx.fillStyle='#b4bcc3'; ctx.globalAlpha=go?1-f:1; ctx.fillText(sub,W/2,H*0.5+(num?118:go?60:48)); ctx.globalAlpha=1; }
  }

  /* ---- loop ---- */
  function frame(){
    if(destroyed) return; raf=requestAnimationFrame(frame);
    var now=Date.now(), el=Math.min(.5,(now-(S.last||now))/1000), dt=Math.min(.05,el); S.last=now; govern(el);
    var startL=o.startLocal(), left=startL-now, started=left<=0;
    syncOthers(dt,now); fxStep(dt,now); vfxStep(dt,now);
    if(started){ S.t=now-startL; var rem=el; while(rem>1e-4){ var stp=Math.min(rem,1/40); update(stp); rem-=stp; } S.bg+=-segAt(Math.floor(S.pos/SEG)).curve*(S.speed/MAXV)*dt*90; }
    if(started&&!S.finished&&S.t>=rec.n*500&&rec.n<500){ rec.p.push(Math.round(S.pos/TL*1000)); rec.x.push(Math.round(S.px*100)); rec.n++; }
    if(started&&o.onProgress) o.onProgress(S.pos/TL*100,S.finished);
    var mine=S.pos/TL*100, rank=1; Object.keys(others).forEach(function(kk){ if(others[kk].vis>mine+0.05) rank++; });
    if(started){ if(S.lastRank&&rank<S.lastRank){ pop('OVERTAKE!','#7dd3a8'); SFX.pass(); vfxOver(); S.rankPulse=.5; } else if(S.lastRank&&rank>S.lastRank){ pop('PASSED…','#ff7a6b'); S.rankPulse=.5; } S.lastRank=rank; engine(Math.min(1.3,S.speed/MAXV)); }
    render(now,rank,Object.keys(others).length+1);
    if(!started){ var n3=Math.ceil(left/1000); BF=n3>0&&n3<=5?1-(left-(n3-1)*1000)/1000:1; if(n3>0&&n3<=3&&n3!==lastBeep){ lastBeep=n3; SFX.beep(); vfxCount(); } banner(n3>0&&n3<=5?String(n3):'GET READY',CZ?'Collect coins to SOLVE the cube  ·  fly through the ZONE GATES':'Steer with ◀ ▶  ·  grab yellow boost pads  ·  dodge the red blocks'); if(CZ){ var lg=czLogo(), ls=Math.min(W,H)*.24; ctx.save(); ctx.shadowColor='#27e6dc'; ctx.shadowBlur=36; if(lg){ ctx.beginPath(); ctx.arc(W/2,H*.2,ls/2,0,6.2832); ctx.clip(); ctx.drawImage(lg,W/2-ls/2,H*.2-ls/2,ls,ls); } ctx.restore(); ctx.textAlign='center'; ctx.font='900 26px system-ui'; ctx.fillStyle='#c9fffb'; ctx.fillText('THE CUBING ZONE RACE',W/2,H*.2+ls/2+34); } }
    else if(S.t<900){ if(!goPlayed){ goPlayed=true; SFX.go(); vfxGo(); } BF=S.t/900; banner('GO!',''); }
    else if(S.finished){ BF=Math.min(1,(Date.now()-S.finishAt)/700); banner('FINISH!','Waiting for the others…'); }
  }
  function engine(sp){
    if(MUTE||!AC){ if(eng&&eng.g) eng.g.gain.value=0; return; }
    if(!eng){ try{ var oo=AC.createOscillator(),gg=AC.createGain(),ff=AC.createBiquadFilter(); oo.type='sawtooth'; ff.type='lowpass'; ff.frequency.value=420; gg.gain.value=0; oo.connect(ff); ff.connect(gg); gg.connect(AC.destination); oo.start(); eng={o:oo,g:gg}; }catch(e){ eng=false; return; } }
    if(eng){ try{ eng.o.frequency.value=48+sp*140+(S.boostT>0?45:0); eng.g.gain.value=S.finished?0:0.022; }catch(e){} }
  }
  /* ---- input ---- */
  function kd(e,v){ var k=e.key; if(e.target&&/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return; var cvOn=document.getElementById('cwCv');
    if(cvOn&&v&&(k==='f'||k==='F')&&S.flyOn&&!S.finished){ fire(); e.preventDefault(); e.stopPropagation(); return; }
    if(cvOn&&(k==='ArrowUp'||k==='w'||k==='W')&&S.flyOn&&!S.finished){ keys.u=v; e.preventDefault(); e.stopPropagation(); return; }
    if(cvOn&&(k==='ArrowDown'||k==='s'||k==='S')&&S.flyOn&&!S.finished){ keys.d=v; e.preventDefault(); e.stopPropagation(); return; }
    if(!v){ if(k==='ArrowUp'||k==='w'||k==='W') keys.u=0; if(k==='ArrowDown'||k==='s'||k==='S') keys.d=0; }
    if(v&&(k===' '||k==='ArrowUp'||k==='w'||k==='W'||k==='Enter')&&document.getElementById('cwCv')){ useNitro(); e.preventDefault(); e.stopPropagation(); return; } if(k==='ArrowLeft'||k==='a'||k==='A'){ keys.l=v; e.preventDefault(); e.stopPropagation(); } else if(k==='ArrowRight'||k==='d'||k==='D'){ keys.r=v; e.preventDefault(); e.stopPropagation(); } }
  var kdn=function(e){ kd(e,1); }, kup=function(e){ kd(e,0); };
  document.addEventListener('keydown',kdn,true); document.addEventListener('keyup',kup,true);
  frame();
  return {
    destroy:function(){ destroyed=true; cancelAnimationFrame(raf); try{ if(R3.kill) R3.kill(); }catch(e){} try{ if(eng&&eng.o){ eng.g.gain.value=0; eng.o.stop(); } }catch(e){} eng=null; document.removeEventListener('keydown',kdn,true); document.removeEventListener('keyup',kup,true); },
    steer:function(v){ touch=v; },
    alt:function(v){ altT=v; },
    fire:function(){ return fire(); },
    nitro:function(){ useNitro(); },
    react:function(e,n){ if(S.fl.length>14) S.fl.shift(); S.fl.push({e:e,n:String(n||'').slice(0,12),x:120+Math.random()*(W-240),y:H-130-Math.random()*60,l:2.2}); },
    mute:function(m){ MUTE=!!m; try{ localStorage.setItem('cw_mute',m?'1':'0'); }catch(e){} if(MUTE&&eng&&eng.g) eng.g.gain.value=0; if(!MUTE) unlockAudio(); },
    record:function(){ var p=rec.p.slice(),x=rec.x.slice(); p.push(1000); x.push(Math.round(S.px*100)); return {i:500,p:p,x:x,car:o.car|0}; },
    segs:segs, state:S, trackLength:TL, others:others, weather:WXK
  };
}


window.CWRaceEngine={paint7:paint7,CubeRacer:CubeRacer,CARDEF:CARDEF,TRAILDEF:TRAILDEF,WINGDEF:WINGDEF,PAL:PAL,carOwned:carOwned,curCar:curCar,trailOwned:trailOwned,curTrail:curTrail,wingOwned:wingOwned,curWing:curWing,raceCar:raceCar,myFx:myFx,unlockAudio:unlockAudio,muted:function(){ return MUTE; },setMute:function(m){ MUTE=!!m; try{ localStorage.setItem('cw_mute',m?'1':'0'); }catch(e){} }};
})();
