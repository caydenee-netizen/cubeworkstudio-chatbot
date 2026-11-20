/* Cube Smash: a brick breaker made of cube stickers. Drag to move the paddle, tap to launch.
   Power-ups, combos, bombs, steel, gold bricks, endless levels. Tokens for every new level cleared and new stars.
   Everything is drawn on one canvas (no images), with particles, glow, trails, shake, slow motion and synth sounds. */
(function(){
if(!window.PL) return;
var $=function(s,r){ return (r||document).querySelector(s); };
var esc=function(s){ return String(s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
var W=720,H=960, COLS=10, BW=64, BH=28, GAP=6, LEFT=(W-(COLS*BW+(COLS-1)*GAP))/2, TOP=130;
var COL=[['#ff4d3d','#c8231a'],['#ff8a1f','#d65c00'],['#ffd21a','#d9a800'],['#2fd36b','#14954a'],['#3a7bff','#1d4fd8'],['#f4f4f2','#b9bec8']];
var PW={m:{c:'#5b8cff',t:'3',n:'Multi-ball'},w:{c:'#3ddc84',t:'↔',n:'Wide paddle'},l:{c:'#ff5a4e',t:'⚡',n:'Laser'},f:{c:'#ff9a3d',t:'🔥',n:'Fireball'},s:{c:'#33c7e0',t:'❄',n:'Slow ball'},c:{c:'#a07bff',t:'◎',n:'Magnet'},h:{c:'#ff6fa8',t:'+1',n:'Extra life'}};
var PKEYS=['m','m','w','w','l','f','s','c','h'];
/* run perks: pick 1 of 3 at the start of a run and after every level */
var PERKS={
 wide:{n:'Long paddle',d:'Your paddle is 20% wider.',c:'#3ddc84',i:'↔',max:3},
 pow:{n:'Lucky drops',d:'Power-ups drop 50% more often.',c:'#5b8cff',i:'✦',max:3},
 dmg:{n:'Heavy ball',d:'Every hit does double damage.',c:'#ff9a3d',i:'●',max:1},
 life:{n:'Extra life',d:'+1 life right now.',c:'#ff6fa8',i:'♥',max:9},
 split:{n:'Split shot',d:'Every launch fires 2 balls.',c:'#a07bff',i:'⑂',max:1},
 bomb:{n:'Chain bomb',d:'Every 10th brick you break explodes.',c:'#ff5a4e',i:'✸',max:1},
 fever:{n:'Fever rush',d:'The Fever meter fills 50% faster.',c:'#ffd21a',i:'⚡',max:2},
 laser:{n:'Laser start',d:'Each level starts with 6 seconds of laser.',c:'#ff5a4e',i:'≡',max:1},
 shield:{n:'Safety net',d:'A shield under the paddle saves one ball each level.',c:'#33c7e0',i:'▁',max:1},
 magnet:{n:'Power pull',d:'Falling power-ups drift toward your paddle.',c:'#a07bff',i:'◎',max:1}};
function pk(k){ return (G&&G.perks&&G.perks[k])|0; }
function offer(){ var keys=Object.keys(PERKS).filter(function(k){ return pk(k)<PERKS[k].max&&!(k==='life'&&G.lives>=5); }), o=[]; while(o.length<3&&keys.length){ var i=Math.floor(Math.random()*keys.length); o.push(keys.splice(i,1)[0]); } return o; }
function cardRects(){ var cw=196, ch=260, gap=18, x0=(W-(cw*3+gap*2))/2, y0=H*0.36; return [0,1,2].map(function(i){ return {x:x0+i*(cw+gap),y:y0,w:cw,h:ch}; }); }
function choose(i){ var k=G.offer&&G.offer[i]; if(!k) return; G.perks[k]=(G.perks[k]|0)+1; if(k==='life') G.lives=Math.min(5,G.lives+1); SFX.pow(); var R=cardRects()[i]; ring(R.x+R.w/2,R.y+R.h/2,PERKS[k].c,260,10); sparks(R.x+R.w/2,R.y+R.h/2,PERKS[k].c,30); G.offer=null; if(G.pending==='next'){ G.lv++; } loadLevel(); G.banner={t:G.boss?'BOSS':'Level '+G.lv,s:PERKS[k].n+' added · tap to launch',a:2.4}; }
/* background music: a small synth loop that speeds up in Fever */
var MU={on:false,t:0,step:0,id:0};
function musicStart(){ var a=ac(); if(!a||MU.on) return; MU.on=true; MU.t=a.currentTime+0.05; MU.step=0; MU.id=setInterval(musicTick,25); }
function musicStop(){ MU.on=false; clearInterval(MU.id); }
function musicTick(){ var a=ac(); if(!a||!MU.on){ musicStop(); return; } var Wm=WD(), bpm=G&&G.feverT>0?Wm.bpm+30:(G&&G.boss?Wm.bpm+12:Wm.bpm), sp=60/bpm/4;
  while(MU.t<a.currentTime+0.12){ var st=MU.step%16, bar=Math.floor(MU.step/16)%4, root=WD().roots[bar], t=MU.t;
    if(st%4===0) hit(t,'k'); if(st%4===2) hit(t,'h'); if(st===4||st===12) hit(t,'s');
    if(st%2===0) note(t,root*(st%8===6?2:1)*(G&&G.feverT>0&&st%4===2?1.5:1),sp*1.6,'sawtooth',.045);
    if(G&&G.feverT>0&&st%2===1) note(t,root*4*[1,1.25,1.5,2][st%4>>0&3],sp,'square',.025);
    MU.t+=sp; MU.step++; } }
function note(t,f,d,type,v){ var a=AC; if(!a) return; var o=a.createOscillator(), g=a.createGain(), fl=a.createBiquadFilter(); o.type=type; o.frequency.value=f; fl.type='lowpass'; fl.frequency.value=1400; g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(v,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+d); o.connect(fl); fl.connect(g); g.connect(MG); o.start(t); o.stop(t+d+0.02); }
function hit(t,k){ var a=AC; if(!a) return; if(k==='k'){ var o=a.createOscillator(), g=a.createGain(); o.frequency.setValueAtTime(150,t); o.frequency.exponentialRampToValueAtTime(40,t+0.12); g.gain.setValueAtTime(.32,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.15); o.connect(g); g.connect(MG); o.start(t); o.stop(t+0.16); return; }
  var n=Math.floor(a.sampleRate*(k==='s'?0.12:0.03)), bf=a.createBuffer(1,n,a.sampleRate), d=bf.getChannelData(0); for(var i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n); var src=a.createBufferSource(), f=a.createBiquadFilter(), g2=a.createGain(); src.buffer=bf; f.type=k==='s'?'bandpass':'highpass'; f.frequency.value=k==='s'?1800:7000; g2.gain.value=k==='s'?.12:.05; src.connect(f); f.connect(g2); g2.connect(MG); src.start(t); }
function save(){ try{ localStorage.setItem('cw_smash',JSON.stringify(SV)); }catch(e){} }
var SV=(function(){ try{ return JSON.parse(localStorage.getItem('cw_smash')||'null')||{}; }catch(e){ return {}; } })(); SV.best=SV.best||0; SV.max=SV.max||0; SV.stars=SV.stars||{}; SV.mute=!!SV.mute;
/* ---------- Update 8: worlds ---------- */
function U8(){ return !!(PL.updOn8&&PL.updOn8()); }
var WORLDS=[
 {n:'Classic',c:'#6b8cff',bg:['#0b1024','#05060d'],orbs:[[120,140,320,'rgba(29,79,216,.45)'],[620,260,300,'rgba(122,92,255,.38)'],[200,760,340,'rgba(200,53,43,.30)'],[600,820,280,'rgba(31,154,82,.30)']],grid:'#6b8cff',roots:[110,87.31,98,82.41],bpm:120,boss:'king'},
 {n:'Neon',c:'#ff4fd8',bg:['#140326','#05010d'],orbs:[[140,180,340,'rgba(255,40,200,.42)'],[600,300,320,'rgba(0,220,255,.36)'],[300,780,360,'rgba(140,40,255,.36)'],[640,860,260,'rgba(255,40,140,.3)']],grid:'#ff4fd8',roots:[130.81,110,146.83,98],bpm:128,boss:'prism'},
 {n:'Ice',c:'#7fdcff',bg:['#06223a','#020a14'],orbs:[[160,160,340,'rgba(120,220,255,.40)'],[600,260,300,'rgba(200,240,255,.28)'],[220,760,360,'rgba(40,140,220,.34)'],[620,840,280,'rgba(150,200,255,.26)']],grid:'#9fe6ff',roots:[98,123.47,82.41,110],bpm:112,boss:'frost'},
 {n:'Lava',c:'#ff6a2a',bg:['#1f0603','#080101'],orbs:[[140,180,320,'rgba(255,80,20,.36)'],[600,240,300,'rgba(255,170,40,.26)'],[260,820,420,'rgba(255,60,10,.50)'],[620,900,320,'rgba(255,140,20,.40)']],grid:'#ff7a2a',roots:[73.42,87.31,65.41,82.41],bpm:136,boss:'magma'}];
function wid(lv){ return U8()?Math.min(3,Math.floor((lv-1)/10)):0; }
function WD(){ return WORLDS[G?(G.mode==='weekly'?G.wk%4:wid(G.lv)):0]; }
/* ---------- seeded random ---------- */
function rng(seed){ var s=seed>>>0||1; return function(){ s^=s<<13; s>>>=0; s^=s>>17; s^=s<<5; s>>>=0; return s/4294967296; }; }
/* ---------- levels ---------- */
var SHAPES=[
 function(r,c){ return r<6; },
 function(r,c){ return r<8&&Math.abs(c-4.5)<=r*0.6+0.5; },
 function(r,c){ return r<8&&(r+c)%2===0; },
 function(r,c){ return r<9&&(c%4!==3)&&(r%4!==3); },
 function(r,c){ var d=Math.abs(c-4.5)+Math.abs(r-4); return d<5.2&&d>1.4; },
 function(r,c){ return r<9&&(r%2===0||c===0||c===9); },
 function(r,c){ return r<8&&!((r===2||r===3)&&(c===2||c===3||c===6||c===7))&&!(r===6&&c>2&&c<7); },
 function(r,c){ return r<10&&(c===r||c===9-r||r===0||r===9||c===0||c===9); },
 function(r,c){ return r<7&&c>0&&c<9; },
 function(r,c){ return r<10&&Math.abs(c-4.5)<=4.5-Math.abs(r-4.5)*0.8; }];
function level(n){ var R=rng(n*7919+13), shape=SHAPES[(n-1)%SHAPES.length], d=Math.min(1,(n-1)/24), B=[];
  var rows=Math.min(11,6+Math.floor(n/3));
  for(var r=0;r<rows;r++) for(var c=0;c<COLS;c++){ if(!shape(r,c)) continue; var k=R(), t='n', hp=1;
    if(n>2&&k<0.05+0.08*d) { t='s'; hp=Infinity; }
    else if(k<0.1+0.12*d){ t='t'; hp=2+(R()<d*0.6?1:0); }
    else if(k<0.15+0.12*d){ t='b'; }
    else if(k<0.19+0.12*d){ t='p'; }
    else if(k<0.215+0.12*d){ t='g'; }
    B.push({r:r,c:c,x:LEFT+c*(BW+GAP),bx:LEFT+c*(BW+GAP),y:TOP+r*(BH+GAP),t:t,hp:hp,mh:hp,col:(r+Math.floor(n/2))%6,fl:0,alive:true,wob:0,m:(n>=3&&r%3===1)?(18+Math.min(40,n*2))*(r%2?1:-1):0}); }
  var wd=U8()?(arguments[1]!=null?arguments[1]:wid(n)):0;
  if(wd===1){ B.forEach(function(b){ if(b.t==='n'&&R()<0.16) b.t='v'; }); var cand=B.filter(function(b){ return b.t==='n'; }); if(cand.length>8){ var a=cand[Math.floor(R()*cand.length/2)], z=cand[cand.length-1-Math.floor(R()*cand.length/2)]; if(a!==z){ a.t='q'; z.t='q'; a.hp=z.hp=Infinity; a.pair=z; z.pair=a; } } }
  if(wd===2){ B.forEach(function(b){ if(b.t==='n'){ var k2=R(); if(k2<0.22){ b.t='i'; b.hp=b.mh=2; } else if(k2<0.30) b.t='z'; } }); }
  if(wd===3){ B.forEach(function(b){ if(b.t==='n'&&R()<0.14) b.t='L'; }); }
  if(!B.some(function(b){ return b.t!=='s'&&b.t!=='q'; })) B.forEach(function(b){ b.t='n'; b.hp=1; });
  return B; }
/* ---------- audio ---------- */
var AC=null, MG=null;
function ac(){ if(SV.mute) return null; try{ if(!AC){ AC=new (window.AudioContext||window.webkitAudioContext)(); MG=AC.createGain(); MG.gain.value=.5; MG.connect(AC.destination); } if(AC.state==='suspended') AC.resume(); }catch(e){ return null; } return AC; }
function tone(f,dur,type,vol,slide){ var a=ac(); if(!a) return; var o=a.createOscillator(), g=a.createGain(), t=a.currentTime; o.type=type||'sine'; o.frequency.setValueAtTime(f,t); if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,slide),t+dur); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||.25,t+.008); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g); g.connect(MG); o.start(t); o.stop(t+dur+.02); }
function noise(dur,vol,fq){ var a=ac(); if(!a) return; var n=Math.floor(a.sampleRate*dur), bf=a.createBuffer(1,n,a.sampleRate), d=bf.getChannelData(0); for(var i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2); var s=a.createBufferSource(), f=a.createBiquadFilter(), g=a.createGain(); s.buffer=bf; f.type='lowpass'; f.frequency.value=fq||2400; g.gain.value=vol||.3; s.connect(f); f.connect(g); g.connect(MG); s.start(); }
var SFX={
 pad:function(){ tone(220,.08,'triangle',.22,330); },
 hit:function(k){ tone(440*Math.pow(2,Math.min(k,24)/12),.09,'square',.08); tone(880*Math.pow(2,Math.min(k,24)/12),.06,'sine',.12); },
 brk:function(k){ tone(520*Math.pow(2,Math.min(k,24)/12),.14,'triangle',.18,1400); noise(.08,.12,5000); },
 steel:function(){ tone(1800,.05,'square',.05); tone(2600,.08,'sine',.06); },
 boom:function(){ noise(.5,.5,900); tone(120,.45,'sine',.45,40); },
 pow:function(){ [0,4,7,12].forEach(function(s,i){ setTimeout(function(){ tone(523*Math.pow(2,s/12),.12,'triangle',.18); },i*55); }); },
 laser:function(){ tone(1400,.07,'sawtooth',.05,500); },
 lose:function(){ tone(400,.6,'sawtooth',.18,60); },
 win:function(){ [0,4,7,12,16,19,24].forEach(function(s,i){ setTimeout(function(){ tone(392*Math.pow(2,s/12),.25,'triangle',.2); },i*70); }); },
 gold:function(){ [0,7,12].forEach(function(s,i){ setTimeout(function(){ tone(1046*Math.pow(2,s/12),.18,'sine',.16); },i*45); }); }};
/* ---------- sprite cache ---------- */
var SPR={}, DPR=1;
function rr(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
function brickSprite(t,col,hp,mh){ var key=t+col+'_'+hp+'_'+DPR+'_'+(U8()&&G&&G.mode!=='weekly'&&wid(G.lv)===1?'n':''); if(SPR[key]) return SPR[key]; var pad=10, cv=document.createElement('canvas'); cv.width=(BW+pad*2)*DPR; cv.height=(BH+pad*2)*DPR; var g=cv.getContext('2d'); g.scale(DPR,DPR); g.translate(pad,pad);
  var c1,c2; if(t==='i'){ c1='#e8fbff'; c2='#7ccbef'; } else if(t==='z'){ c1='#bfe9ff'; c2='#2f8fd6'; } else if(t==='L'){ c1='#ffb13d'; c2='#c2260f'; } else if(t==='q'){ c1='#2a0a40'; c2='#0b0218'; } else if(t==='v'){ c1=COL[col][0]; c2=COL[col][1]; } else if(t==='s'){ c1='#d9dee8'; c2='#6b7385'; } else if(t==='g'){ c1='#fff1a8'; c2='#d99a00'; } else if(t==='b'){ c1='#ff7a3d'; c2='#a3200f'; } else { c1=COL[col][0]; c2=COL[col][1]; }
  var glw=t==='g'?'rgba(255,210,60,.8)':t==='b'?'rgba(255,90,40,.8)':t==='L'?'rgba(255,100,20,.9)':t==='q'?'rgba(255,60,220,.9)':t==='z'||t==='i'?'rgba(140,220,255,.7)':(t==='v'||(U8()&&G&&G.mode!=='weekly'&&wid(G.lv)===1))?COL[col][0]:null; g.shadowColor=glw||'rgba(0,0,0,.45)'; g.shadowBlur=glw?14:8; g.shadowOffsetY=glw?0:3;
  var gr=g.createLinearGradient(0,0,0,BH); gr.addColorStop(0,c1); gr.addColorStop(1,c2); g.fillStyle=gr; rr(g,0,0,BW,BH,7); g.fill(); g.shadowColor='transparent';
  g.fillStyle='rgba(255,255,255,.35)'; rr(g,4,3,BW-8,BH*0.38,5); g.fill();
  g.strokeStyle='rgba(0,0,0,.28)'; g.lineWidth=1.5; rr(g,.75,.75,BW-1.5,BH-1.5,7); g.stroke();
  if(t==='s'){ g.strokeStyle='rgba(255,255,255,.5)'; g.lineWidth=2; for(var i=-BH;i<BW;i+=12){ g.beginPath(); g.moveTo(i,BH); g.lineTo(i+BH,0); g.stroke(); } [6,BW-6].forEach(function(x){ g.fillStyle='#3a4150'; g.beginPath(); g.arc(x,BH/2,2.4,0,7); g.fill(); }); }
  if(t==='t'){ g.fillStyle='rgba(0,0,0,.25)'; for(var j=0;j<mh;j++){ g.fillRect(BW/2-((mh-1)*7)/2+j*7-2,BH-8,4,4); } if(hp<mh){ g.strokeStyle='rgba(0,0,0,.55)'; g.lineWidth=1.6; g.beginPath(); g.moveTo(BW*0.3,0); g.lineTo(BW*0.42,BH*0.45); g.lineTo(BW*0.34,BH*0.7); g.lineTo(BW*0.46,BH); if(hp<mh-1){ g.moveTo(BW*0.75,0); g.lineTo(BW*0.62,BH*0.5); g.lineTo(BW*0.7,BH); } g.stroke(); } }
  if(t==='b'){ g.fillStyle='#1a0904'; g.beginPath(); g.arc(BW/2,BH/2+1,8,0,7); g.fill(); g.strokeStyle='#ffd21a'; g.lineWidth=2; g.beginPath(); g.moveTo(BW/2+5,BH/2-6); g.quadraticCurveTo(BW/2+10,BH/2-12,BW/2+14,BH/2-9); g.stroke(); }
  if(t==='g'){ g.fillStyle='rgba(255,255,255,.85)'; g.font='800 15px Inter, system-ui, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('★',BW/2,BH/2+1); }
  if(t==='i'){ g.strokeStyle='rgba(255,255,255,.8)'; g.lineWidth=1.4; g.beginPath(); g.moveTo(8,BH-6); g.lineTo(18,6); g.moveTo(BW-10,BH-5); g.lineTo(BW-22,8); g.stroke(); if(hp<mh){ g.strokeStyle='rgba(20,60,100,.6)'; g.lineWidth=1.8; g.beginPath(); g.moveTo(BW*0.4,0); g.lineTo(BW*0.5,BH*0.5); g.lineTo(BW*0.42,BH); g.stroke(); } }
  if(t==='z'){ g.strokeStyle='#ffffff'; g.lineWidth=2; for(var a=0;a<3;a++){ var an=a*Math.PI/3; g.beginPath(); g.moveTo(BW/2-Math.cos(an)*9,BH/2-Math.sin(an)*9); g.lineTo(BW/2+Math.cos(an)*9,BH/2+Math.sin(an)*9); g.stroke(); } }
  if(t==='L'){ g.fillStyle='rgba(60,10,4,.55)'; [[8,6,14,6],[30,14,18,7],[46,5,12,6]].forEach(function(q){ rr(g,q[0],q[1],q[2],q[3],3); g.fill(); }); g.fillStyle='rgba(255,240,120,.7)'; g.beginPath(); g.arc(22,BH-7,2.5,0,7); g.arc(52,BH-9,2,0,7); g.fill(); }
  if(t==='q'){ for(var rI=4;rI>0;rI--){ g.strokeStyle='rgba('+(rI%2?'255,80,220':'0,230,255')+','+(0.25+rI*0.15)+')'; g.lineWidth=2.2; g.beginPath(); g.ellipse(BW/2,BH/2,rI*7,rI*2.6,0,0,7); g.stroke(); } }
  if(t==='v'){ g.strokeStyle='rgba(255,255,255,.9)'; g.setLineDash([4,3]); g.lineWidth=1.5; rr(g,3,3,BW-6,BH-6,5); g.stroke(); g.setLineDash([]); }
  if(t==='p'){ g.fillStyle='rgba(255,255,255,.9)'; g.beginPath(); g.arc(BW/2,BH/2+1,5.5,0,7); g.fill(); g.strokeStyle='rgba(255,255,255,.7)'; g.lineWidth=1.5; g.beginPath(); g.arc(BW/2,BH/2+1,9,0,7); g.stroke(); }
  SPR[key]=cv; return cv; }
var BG=null;
function bgSprite(){ var Wd=WD(); if(BG&&BG._d===DPR&&BG._w===Wd.n) return BG; var cv=document.createElement('canvas'); cv.width=W*DPR; cv.height=H*DPR; var g=cv.getContext('2d'); g.scale(DPR,DPR);
  var gr=g.createLinearGradient(0,0,0,H); gr.addColorStop(0,Wd.bg[0]); gr.addColorStop(1,Wd.bg[1]); g.fillStyle=gr; g.fillRect(0,0,W,H);
  Wd.orbs.forEach(function(o){ var r=g.createRadialGradient(o[0],o[1],0,o[0],o[1],o[2]); r.addColorStop(0,o[3]); r.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=r; g.fillRect(0,0,W,H); });
  BG=cv; BG._d=DPR; BG._w=Wd.n; return BG; }
/* ---------- game state ---------- */
var G=null, cv=null, cx=null, raf=0, last=0, keys={};
function newGame(start){ G={lv:start||1,score:0,lives:3,state:'ready',bricks:[],balls:[],caps:[],lasers:[],parts:[],texts:[],rings:[],pad:{x:W/2,w:150,tw:150,y:H-80,sq:0,glow:0},pw:{w:0,l:0,f:0,s:0,c:0},combo:0,maxCombo:0,lost:0,shake:0,flash:0,slow:0,stop:0,t:0,laserT:0,clearT:0,gx:0,banner:{t:'Level '+(start||1),s:'Tap to launch',a:2.2},earned:0,newStars:0,perks:{},fever:0,feverT:0,shield:0,boss:null,proj:[],broke:0,offer:null,pending:null,haz:[],amb:[],mode:'run',wk:0}; loadLevel(); G.state='perk'; G.offer=offer(); G.pending='start'; }
function padW(){ return 150*(1+0.2*pk('wide')); }
function loadLevel(){ G.boss=null; G.proj=[]; G.haz=[]; G.amb=[]; G.beams=[]; G.spread=6; BG=null; SPR={}; G.bricks=G.mode==='weekly'?level(G.wseed,G.wk%4):G.lv%5===0?bossBricks():level(G.lv); if(G.mode!=='weekly'&&G.lv%5===0) makeBoss(); G.balls=[]; G.caps=[]; G.lasers=[]; G.pw={w:0,l:pk('laser')?6:0,f:0,s:0,c:0}; G.pad.tw=padW(); G.pad.stun=0; G.shield=pk('shield')?1:0; G.lost=0; G.maxCombo=0; G.combo=0; G.state='ready'; spawnBall(); G.banner={t:G.mode==='weekly'?'Weekly challenge':G.boss?(G.boss.kind&&G.boss.kind!=='giant'?BN[G.boss.kind]:'BOSS'):(U8()?WD().n+' '+(((G.lv-1)%10)+1):'Level '+G.lv),s:G.mode==='weekly'?'One level. Best score wins.':G.boss?'Smash the '+(BN[G.boss.kind]||'giant cube').toLowerCase():'Tap to launch',a:2.4}; G.bricks.forEach(function(b,i){ b.in=-(i%COLS)*0.03-b.r*0.05; }); }
function bossBricks(){ var B=[]; [1,2,3,6,7,8].forEach(function(c,i){ var x=LEFT+c*(BW+GAP); B.push({r:9,c:c,x:x,bx:x,y:TOP+9*(BH+GAP)+40,t:'t',hp:2,mh:2,col:i%6,fl:0,alive:true,wob:0,m:0}); }); return B; }
var BN={giant:'Giant Cube',king:'King Cube',prism:'Prism Cube',frost:'Frost Cube',magma:'Magma Cube'};
function makeBoss(){ var kind=U8()&&G.lv%10===0?WORLDS[wid(G.lv)].boss:'giant', hp=(50+G.lv*12)*(kind==='giant'?1:1.5); G.boss={kind:kind,x:W/2,y:250,s:kind==='giant'?180:200,hp:hp,mh:hp,t:0,fire:2.4,fl:0,ph:1,rot:0,st:[0,1,2,3,4,5,0,1,2].map(function(i,k){ return (k*7+G.lv)%6; }),dead:0}; }
function bossHit(dmg,x,y){ var B=G.boss; if(!B||B.hp<=0) return; B.hp-=dmg; B.fl=1; G.stop=0.03; SFX.hit(G.combo+6); sparks(x,y,'#fff',10); var sc0=B.st[Math.floor(Math.random()*9)]; shards(x,y,sc0>=0?COL[sc0][0]:'#9aa3b8',8,1); addScore(40*dmg*(G.feverT>0?2:1)); G.fever=Math.min(1,G.fever+0.03*(1+0.5*pk('fever'))); G.shake=Math.max(G.shake,4);
  var lost=Math.floor((1-B.hp/B.mh)*9); for(var i=0;i<lost&&i<9;i++) B.st[(i*4)%9]=-1;
  if(B.ph===1&&B.hp<B.mh/2){ B.ph=2; if(B.kind==='king'){ [2,3,4,5,6,7].forEach(function(c,i){ var x=LEFT+c*(BW+GAP); G.bricks.push({r:8,c:c,x:x,bx:x,y:TOP+8*(BH+GAP)+40,t:'t',hp:2,mh:2,col:i%6,fl:0,alive:true,wob:0,m:0,in:0}); }); pop(W/2,H*0.52,'THE KING CALLS GUARDS','#ffd21a',30); } if(B.kind==='frost'){ [-1,1].forEach(function(sd){ for(var j=0;j<3;j++){ var x=B.x+sd*(B.s/2+20)-BW/2, y=B.y-60+j*(BH+8); G.bricks.push({r:20+j,c:sd,x:x,bx:x,y:y,t:'i',hp:2,mh:2,col:4,fl:0,alive:true,wob:0,m:0,in:0,fol:sd,fy:j}); } }); }
    pop(W/2,H*0.45,'ANGRY '+(BN[B.kind]||'CUBE').toUpperCase().replace(' CUBE','')+'!','#ff5a4e',44); ring(B.x,B.y,'#ff5a4e',300,12); G.shake=14; SFX.boom(); }
  if(B.hp<=0){ B.dead=1; G.stop=0.12; G.shake=26; G.flash=1; SFX.boom(); setTimeout(function(){ SFX.boom(); },160); for(var k=0;k<6;k++) ring(B.x,B.y,COL[k][0],160+k*60,12); shards(B.x,B.y,'#fff',60,2.2); for(var c=0;c<6;c++) shards(B.x,B.y,COL[c][0],20,2); confetti(80); pop(B.x,B.y,'BOSS DOWN +5,000','#ffd21a',40); addScore(5000); G.bossWin=1; G.boss=null; checkClear(); } }
function stepBoss(dt){ stepHaz(dt); var B=G.boss; if(!B) return; B.t+=dt; B.fl=Math.max(0,B.fl-dt*5); var sp=B.ph===2?1.5:0.9; B.x=W/2+Math.sin(B.t*sp)*(W/2-B.s/2-24); B.y=(B.kind==='king'?300:250)+Math.sin(B.t*sp*1.7)*30; B.rot=Math.sin(B.t*sp)*0.18;
  G.bricks.forEach(function(k){ if(k.fol&&k.alive){ k.x=B.x+k.fol*(B.s/2+20)-BW/2; k.y=B.y-60+k.fy*(BH+8); } });
  if(G.state!=='play') return; B.fire-=dt;
  if(B.kind==='prism'&&B.fire<=0){ B.fire=B.ph===2?1.6:2.6; var n2=B.ph===2?2:1; for(var q=0;q<n2;q++){ var bx=q===0?G.pad.x:Math.max(40,Math.min(W-40,G.pad.x+(Math.random()<.5?-1:1)*(120+Math.random()*160))); G.beams.push({x:bx,t:0,warn:0.85,on:0.45,hit:false}); } tone(1200,.3,'sine',.06,600); return; }
  if(B.kind==='magma'&&B.fire<=0){ B.fire=B.ph===2?1.8:2.8; var nn=B.ph===2?7:5; for(var q2=0;q2<nn;q2++) G.haz.push({k:'lava',x:30+Math.random()*(W-60),y:60-Math.random()*200,vy:260+Math.random()*120,t:0}); tone(90,.4,'sawtooth',.12,40); return; }
  if(B.fire<=0){ B.fire=B.ph===2?1.3:2.2; var n=B.ph===2?3:1; for(var i=0;i<n;i++){ var dx=G.pad.x-B.x+(i-(n-1)/2)*90, dy=G.pad.y-B.y, m=Math.hypot(dx,dy), v=B.ph===2?330:270; G.proj.push({x:B.x,y:B.y+B.s/2,vx:dx/m*v,vy:dy/m*v,c:B.kind==='frost'?'#bfe9ff':B.kind==='king'?'#ffd21a':COL[Math.floor(Math.random()*6)][0],t:0,fr:B.kind==='frost'}); } tone(220,.15,'sawtooth',.12,90); }
  var p=G.pad; G.proj=G.proj.filter(function(q){ q.t+=dt; q.x+=q.vx*dt; q.y+=q.vy*dt; if(Math.abs(q.x-p.x)<p.w/2+8&&Math.abs(q.y-p.y)<16){ if(q.fr){ p.frz=2.5; G.shake=8; tone(1600,.3,'sine',.12,400); shards(q.x,q.y,'#e8fbff',16,1); pop(p.x,p.y-40,'FROZEN','#7fdcff',26); return false; } p.stun=2.5; G.shake=12; G.flash=0.3; SFX.lose(); shards(q.x,q.y,q.c,18,1); pop(p.x,p.y-40,'STUNNED','#ff5a4e',26); return false; }
    for(var j=0;j<G.lasers.length;j++){ var L=G.lasers[j]; if(Math.abs(L.x-q.x)<14&&Math.abs(L.y-q.y)<30){ shards(q.x,q.y,q.c,8,0.8); return false; } }
    return q.y<H+20; }); }
function checkClear(){ if(!G.boss&&!G.bricks.some(function(o){ return o.alive&&o.t!=='s'&&o.t!=='q'; })) clearLevel(); }
function stepHaz(dt){ var p=G.pad; if(p.frz>0) p.frz-=dt;
  G.haz=G.haz.filter(function(h){ h.t+=dt; h.y+=h.vy*dt; if(h.y>p.y-14&&h.y<p.y+14&&Math.abs(h.x-p.x)<p.w/2+10&&G.state==='play'){ if(h.k==='snow'){ p.frz=2.2; tone(1600,.3,'sine',.12,400); shards(h.x,h.y,'#e8fbff',14,1); pop(p.x,p.y-40,'FROZEN','#7fdcff',26); } else { p.stun=2; G.shake=10; SFX.lose(); shards(h.x,h.y,'#ff7a2a',16,1); pop(p.x,p.y-40,'BURNED','#ff6a2a',26); } return false; }
    for(var j=0;j<G.lasers.length;j++){ var L=G.lasers[j]; if(Math.abs(L.x-h.x)<16&&Math.abs(L.y-h.y)<30){ shards(h.x,h.y,h.k==='snow'?'#e8fbff':'#ff7a2a',8,0.7); return false; } }
    return h.y<H+30; });
  G.beams=(G.beams||[]).filter(function(bm){ bm.t+=dt; if(bm.t>bm.warn&&!bm.hit&&G.state==='play'&&Math.abs(bm.x-p.x)<p.w/2+14){ bm.hit=true; p.stun=2.2; G.shake=12; G.flash=0.3; SFX.lose(); pop(p.x,p.y-40,'ZAPPED','#ff4fd8',26); } if(bm.t>bm.warn&&bm.t-dt<=bm.warn){ G.shake=Math.max(G.shake,6); tone(220,.3,'sawtooth',.1,1200); } return bm.t<bm.warn+bm.on; });
  if(U8()&&G.state==='play'){ G.spreadT=(G.spreadT||0)+dt; if(G.spreadT>6&&G.spread>0){ G.spreadT=0; var lav=G.bricks.filter(function(b){ return b.alive&&b.t==='L'; }); if(lav.length){ var src=lav[Math.floor(Math.random()*lav.length)], dirs=[[0,1],[0,-1],[1,0],[-1,0]], d2=dirs[Math.floor(Math.random()*4)], r=src.r+d2[0], c=src.c+d2[1];
      if(r>=0&&r<11&&c>=0&&c<COLS&&!G.bricks.some(function(b){ return b.alive&&b.r===r&&b.c===c; })){ var x=LEFT+c*(BW+GAP); G.bricks.push({r:r,c:c,x:x,bx:x,y:TOP+r*(BH+GAP),t:'L',hp:1,mh:1,col:0,fl:1,alive:true,wob:1,m:0,in:0.2}); G.spread--; ring(x+BW/2,TOP+r*(BH+GAP)+BH/2,'#ff6a2a',40,4); } } } } }
function speed(){ return Math.min(860,500*Math.pow(1.035,G.lv-1))*(G.pw.s>0?0.68:1); }
function spawnBall(stuck){ G.balls.push({x:G.pad.x,y:G.pad.y-18,vx:0,vy:0,r:9,stuck:true,off:0,tr:[]}); }
/* ---------- particles ---------- */
function shards(x,y,col,n,pw){ for(var i=0;i<n;i++){ if(G.parts.length>700) G.parts.shift(); var a=Math.random()*Math.PI*2, s=(80+Math.random()*340)*(pw||1); G.parts.push({k:'s',x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-120,g:900,life:0.7+Math.random()*0.6,t:0,sz:3+Math.random()*7,rot:Math.random()*6,vr:(Math.random()-.5)*16,c:col}); } }
function sparks(x,y,col,n){ for(var i=0;i<n;i++){ if(G.parts.length>700) G.parts.shift(); var a=Math.random()*Math.PI*2, s=200+Math.random()*500; G.parts.push({k:'p',x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:300,life:0.25+Math.random()*0.35,t:0,c:col}); } }
function ring(x,y,col,max,w){ G.rings.push({x:x,y:y,c:col,t:0,life:.45,max:max||90,w:w||6}); }
function pop(x,y,txt,col,size){ var near=G.texts.filter(function(t){ return t.t<0.6&&Math.abs(t.x-x)<160&&Math.abs(t.y-y)<60; }).length; y-=near*30; G.texts.push({x:x,y:y,txt:txt,c:col||'#fff',t:0,life:1,sz:size||22}); }
function confetti(n){ for(var i=0;i<n;i++){ var c=COL[Math.floor(Math.random()*6)][0]; G.parts.push({k:'s',x:Math.random()*W,y:-20-Math.random()*200,vx:(Math.random()-.5)*120,vy:100+Math.random()*200,g:260,life:2.4+Math.random(),t:0,sz:5+Math.random()*7,rot:Math.random()*6,vr:(Math.random()-.5)*10,c:c}); } }
/* ---------- hits ---------- */
function brickColor(b){ return b.t==='s'?'#d9dee8':b.t==='g'?'#ffd21a':b.t==='b'?'#ff7a3d':COL[b.col][0]; }
function blinkOn(b){ return Math.sin(G.t*2.4+b.c*0.7+b.r)>-0.25; }
function hitBrick(b,src){ if(!b.alive) return false; if(b.t==='q') return false; var cxm=b.x+BW/2, cym=b.y+BH/2;
  if(b.t==='s'&&!(src==='bomb')){ b.fl=1; b.wob=1; SFX.steel(); sparks(cxm,cym,'#e6ecf7',6); return false; }
  b.hp-=(src==='bomb'||src==='laser')?1:(pk('dmg')?2:1); b.fl=1; b.wob=1;
  if(b.hp>0&&b.t!=='s'){ SFX.hit(G.combo); shards(cxm,cym,brickColor(b),5,0.6); addScore(10); return true; }
  b.alive=false; G.combo++; G.maxCombo=Math.max(G.maxCombo,G.combo);
  G.broke++; G.fever=Math.min(1,G.fever+0.06*(1+0.5*pk('fever'))); if(G.fever>=1&&G.feverT<=0) feverOn();
  var mult=(1+Math.floor(G.combo/5))*(G.feverT>0?2:1), pts=(b.t==='g'?500:b.t==='t'?120:b.t==='b'?150:60)*mult; addScore(pts);
  SFX.brk(G.combo); shards(cxm,cym,brickColor(b),b.t==='g'?26:16,1); sparks(cxm,cym,'#fff',6); ring(cxm,cym,brickColor(b),60,4);
  pop(cxm,cym-6,'+'+pts,b.t==='g'?'#ffd21a':'#fff',b.t==='g'?28:20);
  if(G.combo>0&&G.combo%5===0){ pop(W/2,H*0.42,'COMBO x'+(1+G.combo/5),'#ffd21a',44); ring(W/2,H*0.42,'#ffd21a',220,8); tone(660*Math.pow(2,Math.min(G.combo/5,6)/6),.2,'triangle',.2); G.shake=Math.max(G.shake,6); }
  if(b.t==='g'){ SFX.gold(); G.shake=Math.max(G.shake,5); }
  if(b.t==='z') G.haz.push({k:'snow',x:cxm,y:cym,vy:220,t:0});
  if(b.t==='L') G.haz.push({k:'lava',x:cxm,y:cym,vy:300,t:0});
  if(b.t==='p'||(b.t!=='g'&&Math.random()<0.13*(1+0.5*pk('pow')))) drop(cxm,cym);
  if(pk('bomb')&&G.broke%10===0&&b.t!=='b'){ b.t='b'; pop(cxm,cym-26,'CHAIN BOMB','#ff5a4e',22); }
  if(b.t==='b'){ G.stop=0.06; G.shake=16; G.flash=0.5; SFX.boom(); ring(cxm,cym,'#ffb13d',190,14); ring(cxm,cym,'#fff',120,5); shards(cxm,cym,'#ff7a3d',30,1.6); sparks(cxm,cym,'#ffd21a',30);
    setTimeout(function(){ if(!G) return; G.bricks.forEach(function(o){ if(o.alive&&o!==b&&Math.abs(o.r-b.r)<=1&&Math.abs(o.c-b.c)<=1){ if(o.t==='s'){ o.alive=false; G.combo++; shards(o.x+BW/2,o.y+BH/2,'#d9dee8',14,1.2); } else { o.hp=1; hitBrick(o,'bomb'); } } }); },70); }
  checkClear();
  return true; }
function addScore(n){ G.score+=n; }
function feverOn(){ G.feverT=7; G.fever=1; G.flash=0.6; G.shake=10; pop(W/2,H*0.5,'FEVER!','#ffd21a',72); ring(W/2,H*0.5,'#ffd21a',420,14); ring(W/2,H*0.5,'#ff5a4e',300,8); [0,4,7,12,16].forEach(function(s2,i){ setTimeout(function(){ tone(523*Math.pow(2,s2/12),.18,'square',.12); },i*50); }); }
function drop(x,y){ var k=PKEYS[Math.floor(Math.random()*PKEYS.length)]; if(k==='h'&&G.lives>=5) k='m'; G.caps.push({x:x,y:y,k:k,vy:200,t:0}); }
function power(k){ var p=G.pad; SFX.pow(); ring(p.x,p.y,PW[k].c,160,8); sparks(p.x,p.y,PW[k].c,18); pop(p.x,p.y-40,PW[k].n,PW[k].c,26);
  if(k==='m'){ var src=G.balls.filter(function(b){ return !b.stuck; })[0]||G.balls[0]; if(!src) return; for(var i=0;i<2;i++){ var a=Math.atan2(src.vy||-1,src.vx||0)+(i?0.45:-0.45), s=speed(); G.balls.push({x:src.x,y:src.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:9,stuck:false,tr:[]}); } }
  else if(k==='w'){ G.pw.w=12; G.pad.tw=padW()*1.5; }
  else if(k==='l'){ G.pw.l=8; }
  else if(k==='f'){ G.pw.f=9; }
  else if(k==='s'){ G.pw.s=10; G.balls.forEach(function(b){ if(!b.stuck){ var m=Math.hypot(b.vx,b.vy)||1, s=speed(); b.vx=b.vx/m*s; b.vy=b.vy/m*s; } }); }
  else if(k==='c'){ G.pw.c=12; }
  else if(k==='h'){ G.lives=Math.min(5,G.lives+1); } }
/* ---------- level end ---------- */
function stars(){ return G.lost===0?(G.maxCombo>=15?3:2):1; }
function clearLevel(){ if(G.mode==='weekly'){ if(G.state==='wdone') return; wkEnd(true); return; } if(G.state==='clear') return; G.state='clear'; G.proj=[]; G.texts=G.texts.filter(function(t){ return t.txt.indexOf('BOSS')===0; }); G.slow=0.7; G.clearT=0; SFX.win(); G.flash=0.6; confetti(140); ring(W/2,H/2,'#fff',420,10);
  var lv=G.lv, st=stars(), first=lv>SV.max, old=SV.stars[lv]||0, earn=0;
  var day=new Date().toDateString(); if(SV.day!==day){ SV.day=day; SV.dayT=0; }
  if(first){ earn+=Math.min(200,40+10*lv)+(G.bossWin?60:0); SV.max=lv; }
  else if((SV.dayT||0)<300){ var r=Math.min(10,300-(SV.dayT||0)); earn+=r; SV.dayT=(SV.dayT||0)+r; }
  G.bossWin=0;
  if(st>old){ earn+=20*(st-old); SV.stars[lv]=st; }
  G.earned=0; if(earn>0) try{ G.earned=PL.award(earn); }catch(e){ G.earned=earn; }
  G.result={st:st,first:first,earn:G.earned}; addScore(1000*lv); if(G.score>SV.best) SV.best=G.score; save(); try{ var mp=document.querySelector('.sm-map'); if(mp) mp.outerHTML=mapHtml(); }catch(e){} }
function nextLevel(){ G.texts=[]; G.rings=[]; G.state='perk'; G.offer=offer(); G.pending='next'; }
function loseBall(){ if(G.balls.length) return; G.lives--; G.lost++; G.combo=0; SFX.lose(); G.shake=14; G.flash=0.35;
  if(G.lives<=0&&G.mode==='weekly'){ wkEnd(false); return; }
  if(G.lives<=0){ G.state='over'; musicStop(); if(G.score>SV.best) SV.best=G.score; if(G.mode==='endless'){ if(G.score>(SV.eBest||0)) SV.eBest=G.score; if(G.lv>(SV.eLv||0)) SV.eLv=G.lv; } save(); return; }
  G.pw={w:0,l:0,f:0,s:0,c:0}; G.pad.tw=padW(); spawnBall(); G.state='ready'; G.banner={t:G.lives+(G.lives===1?' life left':' lives left'),s:'Tap to launch',a:1.6}; }
/* ---------- weekly challenge (Update 8) ---------- */
var WK={d:null};
function wkApi(b){ b.id=CW.devId(); return CW.call('/api/smw',b,9000).then(function(r){ return r&&r.data&&r.data.ok?r.data:{err:(r&&r.data&&r.data.error)||'Could not reach the server.'}; }); }
function startWeekly(){ var go=function(d){ if(!cv) return; newGame(1); G.mode='weekly'; G.wk=d.wk; G.wseed=15+(d.wk%20); G.perks={wide:1,pow:1}; G.offer=null; G.pending=null; loadLevel(); G.state='ready'; ac(); if(!SV.mute) musicStart(); };
  if(WK.d&&!WK.d.err) go(WK.d); else wkApi({act:'get'}).then(function(d){ WK.d=d; if(d.err){ CW.toast(d.err); return; } go(d); }); }
function wkEnd(cleared){ G.state='wdone'; G.wdT=0; musicStop(); var fin=G.score+(cleared?G.lives*2000:0); G.final=fin; G.wres=null; if(cleared){ SFX.win(); confetti(120); G.flash=0.6; } else SFX.lose();
  wkApi({act:'submit',sc:fin,cl:cleared?1:0}).then(function(d){ if(G&&G.mode==='weekly'){ G.wres=d; WK.d=d.err?WK.d:d; } }); }
/* ---------- update ---------- */
function launch(){ if(!G) return; ac(); if(!SV.mute) musicStart(); if(G.state==='perk') return; if(G.state==='wdone'){ if(G.wdT>1) startWeekly(); return; } if(G.state==='over'){ if(G.mode==='endless'){ newGame(1); G.mode='endless'; } else newGame(Math.max(1,G.lv)); return; } if(G.state==='clear'){ if(G.clearT>1.2) nextLevel(); return; } if(G.state==='paused'){ G.state='play'; return; }
  var any=false, add=[]; G.balls.forEach(function(b){ if(b.stuck){ b.stuck=false; var a=-Math.PI/2+(b.off||0)/G.pad.w*0.9+(Math.random()-.5)*0.15, s=speed(); b.vx=Math.cos(a)*s; b.vy=Math.sin(a)*s; any=true; if(pk('split')&&G.state==='ready') add.push({x:b.x,y:b.y,vx:Math.cos(a-0.35)*s,vy:Math.sin(a-0.35)*s,r:9,stuck:false,tr:[]}); } }); G.balls=G.balls.concat(add);
  if(any){ G.state='play'; G.banner.a=Math.min(G.banner.a,.3); SFX.pad(); } }
function circleRect(b,x,y,w,h){ var nx=Math.max(x,Math.min(b.x,x+w)), ny=Math.max(y,Math.min(b.y,y+h)), dx=b.x-nx, dy=b.y-ny; return dx*dx+dy*dy<=b.r*b.r?{nx:nx,ny:ny,dx:dx,dy:dy}:null; }
function step(dt){ var p=G.pad; G.t+=dt; if(G.cornerT>0) G.cornerT-=dt; stepBoss(dt); if(G.feverT>0){ G.feverT-=dt; if(G.feverT<=0){ G.feverT=0; G.fever=0; } } if(p.stun>0){ p.stun-=dt; }
  G.bricks.forEach(function(b){ if(b.m&&b.alive) b.x=Math.max(4,Math.min(W-BW-4,b.bx+Math.sin(G.t*1.1+b.r)*b.m)); });
  // paddle
  var kd=(keys.ArrowLeft||keys.a?-1:0)+(keys.ArrowRight||keys.d?1:0); if(kd) G.tx=Math.max(0,Math.min(W,(G.tx==null?p.x:G.tx)+kd*900*dt));
  if(G.tx!=null){ var nx=p.x+(G.tx-p.x)*Math.min(1,dt*(p.frz>0?3:22)); p.vx=(nx-p.x)/Math.max(dt,1e-3); p.x=nx; }
  p.w+=((p.stun>0?p.tw*0.55:p.tw)-p.w)*Math.min(1,dt*10); p.x=Math.max(p.w/2+6,Math.min(W-p.w/2-6,p.x)); p.sq=Math.max(0,p.sq-dt*5);
  ['w','l','f','s','c'].forEach(function(k){ if(G.pw[k]>0){ G.pw[k]-=dt; if(G.pw[k]<=0){ G.pw[k]=0; if(k==='w') p.tw=padW(); if(k==='c') G.balls.forEach(function(b){ if(b.stuck&&G.state==='play'){ b.stuck=false; var s=speed(); b.vx=0; b.vy=-s; } }); } } });
  // lasers
  if(G.pw.l>0&&G.state==='play'){ G.laserT-=dt; if(G.laserT<=0){ G.laserT=0.28; [-p.w/2+10,p.w/2-10].forEach(function(o){ G.lasers.push({x:p.x+o,y:p.y-8}); }); SFX.laser(); } }
  G.lasers=G.lasers.filter(function(L){ L.y-=1100*dt; if(L.y<0) return false; for(var i=0;i<G.bricks.length;i++){ var b=G.bricks[i]; if(b.alive&&L.x>b.x&&L.x<b.x+BW&&L.y<b.y+BH&&L.y>b.y-20){ hitBrick(b,'laser'); sparks(L.x,b.y+BH,'#ff5a4e',5); return false; } } var Bo=G.boss; if(Bo&&Math.abs(L.x-Bo.x)<Bo.s/2&&L.y<Bo.y+Bo.s/2&&L.y>Bo.y-Bo.s/2){ bossHit(1,L.x,L.y); return false; } return true; });
  // balls
  G.balls.forEach(function(b){ if(b.stuck){ b.x=p.x+(b.off||0); b.y=p.y-16-b.r+4; return; }
    if(b.tp>0) b.tp-=dt; b.tr.push({x:b.x,y:b.y}); if(b.tr.length>16) b.tr.shift();
    var dist=Math.hypot(b.vx,b.vy)*dt, n=Math.max(1,Math.ceil(dist/6));
    for(var s=0;s<n;s++){ var h=dt/n; b.x+=b.vx*h; b.y+=b.vy*h;
      if(b.x<b.r){ b.x=b.r; b.vx=Math.abs(b.vx); ring(b.x,b.y,'#fff',24,2); } if(b.x>W-b.r){ b.x=W-b.r; b.vx=-Math.abs(b.vx); ring(b.x,b.y,'#fff',24,2); } if(b.y<b.r+70){ b.y=b.r+70; b.vy=Math.abs(b.vy); ring(b.x,b.y,'#fff',24,2); if((b.x<=b.r+3||b.x>=W-b.r-3)&&!(G.cornerT>0)&&G.state==='play'){ G.cornerT=5; pop(b.x<W/2?90:W-90,110,'CORNER!','#ffd21a',30); ring(b.x,b.y,'#ffd21a',160,8); addScore(500); try{ if(window.CWEgg) CWEgg.corner(); }catch(e){} } }
      // paddle
      if(b.vy>0&&b.y+b.r>=p.y-8&&b.y-b.r<=p.y+10&&b.x>p.x-p.w/2-b.r&&b.x<p.x+p.w/2+b.r){ var off=(b.x-p.x)/(p.w/2), a=-Math.PI/2+Math.max(-1,Math.min(1,off))*1.05, sp=speed(); b.vx=Math.cos(a)*sp+(p.vx||0)*0.06; b.vy=Math.sin(a)*sp; var m=Math.hypot(b.vx,b.vy); b.vx=b.vx/m*sp; b.vy=b.vy/m*sp; b.y=p.y-8-b.r;
        p.sq=1; G.combo=0; SFX.pad(); sparks(b.x,p.y-8,'#9fc0ff',8); ring(b.x,p.y-6,'#9fc0ff',40,3);
        if(G.pw.c>0&&G.state==='play'){ b.stuck=true; b.off=b.x-p.x; } break; }
      // bricks
      for(var i=0;i<G.bricks.length;i++){ var k=G.bricks[i]; if(!k.alive) continue; if(k.t==='v'&&!blinkOn(k)) continue; var hit=circleRect(b,k.x,k.y,BW,BH); if(!hit) continue;
        if(k.t==='q'){ if(!(b.tp>0)&&k.pair){ var o2=k.pair, m2=Math.hypot(b.vx,b.vy)||1; b.x=o2.x+BW/2+b.vx/m2*(BW/2+b.r+4); b.y=o2.y+BH/2+b.vy/m2*(BH/2+b.r+6); b.tp=0.35; b.tr=[]; ring(k.x+BW/2,k.y+BH/2,'#ff4fd8',60,5); ring(o2.x+BW/2,o2.y+BH/2,'#00e6ff',60,5); tone(900,.18,'sine',.1,1800); } continue; }
        var fire=(G.pw.f>0||G.feverT>0)&&k.t!=='s';
        if(!fire){ var dcx=b.x-(k.x+BW/2), dcy=b.y-(k.y+BH/2), px=BW/2+b.r-Math.abs(dcx), py=BH/2+b.r-Math.abs(dcy);
          if(px<py){ b.vx=(dcx<0?-1:1)*Math.abs(b.vx); b.x+=(dcx<0?-1:1)*px; } else { b.vy=(dcy<0?-1:1)*Math.abs(b.vy); b.y+=(dcy<0?-1:1)*py; } }
        if(fire){ k.hp=1; sparks(b.x,b.y,'#ff9a3d',6); }
        hitBrick(k,fire?'fire':'ball'); if(!fire) break; } }
    if(G.shield>0&&b.vy>0&&b.y+b.r>H-34){ b.vy=-Math.abs(b.vy); b.y=H-34-b.r; G.shield=0; ring(b.x,H-34,'#33c7e0',200,10); sparks(b.x,H-34,'#33c7e0',24); pop(b.x,H-70,'SAVED!','#33c7e0',26); tone(880,.2,'triangle',.2,1760); }
    if(G.boss&&!b.stuck){ var Bo=G.boss, hb=circleRect(b,Bo.x-Bo.s/2,Bo.y-Bo.s/2,Bo.s,Bo.s); if(hb){ var dcx2=b.x-Bo.x, dcy2=b.y-Bo.y, px2=Bo.s/2+b.r-Math.abs(dcx2), py2=Bo.s/2+b.r-Math.abs(dcy2); if(px2<py2){ b.vx=(dcx2<0?-1:1)*Math.abs(b.vx); b.x+=(dcx2<0?-1:1)*px2; } else { b.vy=(dcy2<0?-1:1)*Math.abs(b.vy); b.y+=(dcy2<0?-1:1)*py2; } bossHit((pk('dmg')?2:1)*((G.pw.f>0||G.feverT>0)?2:1),b.x,b.y); } }
    if(b.y>H+30) b.dead=true; });
  G.balls=G.balls.filter(function(b){ return !b.dead; }); if(G.state==='play'&&!G.balls.length) loseBall();
  // capsules
  G.caps=G.caps.filter(function(c){ c.t+=dt; c.y+=c.vy*dt; if(pk('magnet')) c.x+=(p.x-c.x)*Math.min(1,dt*2.2); if(c.y>p.y-14&&c.y<p.y+16&&Math.abs(c.x-p.x)<p.w/2+22){ power(c.k); return false; } return c.y<H+30; });
  // speed-keep for slow end
  if(G.pw.s===0) G.balls.forEach(function(b){ if(!b.stuck){ var m=Math.hypot(b.vx,b.vy), s=speed(); if(Math.abs(m-s)>4){ b.vx=b.vx/m*s; b.vy=b.vy/m*s; } } });
  G.bricks.forEach(function(b){ b.fl=Math.max(0,b.fl-dt*5); b.wob=Math.max(0,b.wob-dt*6); if(b.in<1) b.in=Math.min(1,b.in+dt*2.4); }); }
function stepAmb(dt){ if(!U8()) return; var w=G.mode==='weekly'?G.wk%4:wid(G.lv); if(w===0) return; while(G.amb.length<(w===1?26:40)) G.amb.push({x:Math.random()*W,y:w===3?H+Math.random()*80:-Math.random()*H,v:w===2?30+Math.random()*50:w===3?-(40+Math.random()*80):(Math.random()<.5?-1:1)*(40+Math.random()*80),s:1+Math.random()*2.5,ph:Math.random()*6.3,w:w});
  G.amb.forEach(function(a){ a.ph+=dt; if(a.w===1){ a.x+=a.v*dt; if(a.x<-10) a.x=W+10; if(a.x>W+10) a.x=-10; a.y+=Math.sin(a.ph*2)*0.3; if(a.y<0) a.y=Math.random()*H; } else { a.y+=a.v*dt; a.x+=Math.sin(a.ph*1.5)*0.4; if(a.w===2&&a.y>H+10){ a.y=-10; a.x=Math.random()*W; } if(a.w===3&&a.y<-10){ a.y=H+10; a.x=Math.random()*W; } } }); }
function stepFx(dt){ stepAmb(dt); G.parts=G.parts.filter(function(q){ q.t+=dt; q.vy+=q.g*dt; q.x+=q.vx*dt; q.y+=q.vy*dt; q.vx*=Math.pow(0.4,dt); if(q.rot!=null) q.rot+=q.vr*dt; return q.t<q.life; });
  G.rings=G.rings.filter(function(r){ r.t+=dt; return r.t<r.life; }); G.texts=G.texts.filter(function(t){ t.t+=dt; t.y-=40*dt; return t.t<t.life; });
  G.shake=Math.max(0,G.shake-dt*40); G.flash=Math.max(0,G.flash-dt*2.2); if(G.banner) G.banner.a-=dt; if(G.state==='clear') G.clearT+=dt; if(G.state==='wdone') G.wdT=(G.wdT||0)+dt; G.gx=(G.gx+dt*30)%48; }
/* ---------- draw ---------- */
function drawRR(x,y,w,h,r){ rr(cx,x,y,w,h,r); }
function draw(){ var g=cx; g.save(); g.setTransform(DPR*SC,0,0,DPR*SC,DPR*OX,DPR*OY);
  var sx=(Math.random()-.5)*G.shake, sy=(Math.random()-.5)*G.shake; g.translate(sx,sy);
  g.drawImage(bgSprite(),0,0,W,H);
  // moving perspective grid floor
  g.save(); g.globalAlpha=.16; g.strokeStyle=WD().grid; g.lineWidth=1; for(var y=H*0.62+G.gx;y<H;y+=48){ var k=(y-H*0.62)/(H*0.38); g.globalAlpha=.05+.18*k; g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); } g.globalAlpha=.1; for(var i=-6;i<=16;i++){ g.beginPath(); g.moveTo(W/2+(i-5)*24,H*0.62); g.lineTo(W/2+(i-5)*130,H); g.stroke(); } g.restore();
  // top bar
  g.fillStyle='rgba(255,255,255,.06)'; drawRR(10,12,W-20,50,16); g.fill(); g.strokeStyle='rgba(255,255,255,.16)'; g.lineWidth=1; g.stroke();
  g.font='800 22px Inter, system-ui, sans-serif'; g.textBaseline='middle'; g.fillStyle='#fff'; g.textAlign='left'; g.fillText(String(G.score).replace(/\B(?=(\d{3})+(?!\d))/g,','),28,38);
  g.textAlign='center'; g.font='700 16px Inter, system-ui, sans-serif'; g.fillStyle='rgba(255,255,255,.75)'; g.fillText(G.mode==='weekly'?'WEEKLY CHALLENGE':U8()?WD().n.toUpperCase()+' · LEVEL '+G.lv:'LEVEL '+G.lv,W/2,38);
  g.textAlign='right'; for(var l=0;l<G.lives;l++){ var hx=W-30-l*26; g.fillStyle=COL[l%6][0]; drawRR(hx-9,29,18,18,5); g.fill(); g.fillStyle='rgba(255,255,255,.4)'; drawRR(hx-6,31,12,5,2); g.fill(); }
  // active powers
  var ax=20; ['l','f','w','s','c'].forEach(function(k){ if(G.pw[k]>0){ var t=G.pw[k]; g.fillStyle=PW[k].c; g.globalAlpha=t<2&&Math.floor(G.t*8)%2?0.35:0.95; drawRR(ax,72,96,22,11); g.fill(); g.globalAlpha=1; g.fillStyle='#0b0f1c'; g.font='700 12px Inter, system-ui, sans-serif'; g.textAlign='left'; g.fillText(PW[k].n.split(' ')[0]+' '+Math.ceil(t)+'s',ax+10,83.5); ax+=104; } });
  var pkx=20; Object.keys(G.perks||{}).forEach(function(k){ var n=G.perks[k]; if(!n) return; g.fillStyle=PERKS[k].c; g.globalAlpha=.9; g.beginPath(); g.arc(pkx+10,H-14,10,0,7); g.fill(); g.globalAlpha=1; g.fillStyle='#0b0f1c'; g.font='800 11px Inter, system-ui, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(PERKS[k].i,pkx+10,H-13); if(n>1){ g.fillStyle='#fff'; g.font='800 10px Inter, system-ui, sans-serif'; g.fillText('x'+n,pkx+26,H-14); pkx+=12; } pkx+=26; });
  if(G.combo>=3){ g.textAlign='right'; g.font='800 18px Inter, system-ui, sans-serif'; g.fillStyle='#ffd21a'; g.fillText('x'+(1+Math.floor(G.combo/5))+' · '+G.combo+' combo',W-20,84); }
  // fever meter
  g.fillStyle='rgba(255,255,255,.1)'; drawRR(24,56,W-48,5,2.5); g.fill(); if(G.fever>0){ var fg=g.createLinearGradient(24,0,W-24,0); fg.addColorStop(0,'#ff5a4e'); fg.addColorStop(.5,'#ffd21a'); fg.addColorStop(1,'#3ddc84'); g.fillStyle=fg; drawRR(24,56,(W-48)*(G.feverT>0?G.feverT/7:G.fever),5,2.5); g.fill(); }
  if(G.feverT>0){ g.save(); var pul=0.5+0.5*Math.sin(G.t*14); g.strokeStyle='rgba(255,'+Math.round(150+80*pul)+',40,'+(0.55+0.3*pul)+')'; g.lineWidth=10; g.shadowColor='#ffb13d'; g.shadowBlur=30; drawRR(4,4,W-8,H-8,22); g.stroke(); g.restore(); g.save(); g.globalCompositeOperation='lighter'; g.fillStyle='rgba(255,120,40,'+(0.05+0.04*pul)+')'; g.fillRect(0,0,W,H); g.restore(); }
  if(G.shield>0){ g.save(); g.globalCompositeOperation='lighter'; g.strokeStyle='rgba(51,199,224,'+(0.5+0.3*Math.sin(G.t*6))+')'; g.lineWidth=4; g.shadowColor='#33c7e0'; g.shadowBlur=18; g.beginPath(); g.moveTo(16,H-34); g.lineTo(W-16,H-34); g.stroke(); g.restore(); }
  if(G.boss){ var B=G.boss, bs=B.s, cs=bs/3; g.save(); g.translate(B.x,B.y); g.rotate(B.rot); g.shadowColor=B.ph===2?'#ff5a4e':'#6b8cff'; g.shadowBlur=40+20*Math.sin(G.t*6); g.fillStyle='#15181d'; drawRR(-bs/2,-bs/2,bs,bs,26); g.fill(); g.shadowBlur=0;
    for(var si=0;si<9;si++){ var sx2=-bs/2+8+(si%3)*(cs-5), sy2=-bs/2+8+Math.floor(si/3)*(cs-5), ci=B.st[si]; if(ci<0){ g.fillStyle='#2a2f3a'; drawRR(sx2,sy2,cs-11,cs-11,10); g.fill(); g.strokeStyle='rgba(0,0,0,.6)'; g.lineWidth=2; g.beginPath(); g.moveTo(sx2+6,sy2+8); g.lineTo(sx2+cs*0.45,sy2+cs*0.4); g.lineTo(sx2+cs*0.3,sy2+cs-16); g.stroke(); continue; }
      var KC=B.kind==='frost'?[['#e8fbff','#7ccbef'],['#bfe9ff','#2f8fd6']][ci%2]:B.kind==='magma'?[['#ffb13d','#c2260f'],['#ff6a2a','#7a1205'],['#3a1a12','#120604']][ci%3]:B.kind==='prism'?[['#ff7ae6','#a01a8c'],['#7af2ff','#0a8aa6'],['#f4f4ff','#9a9ac8']][ci%3]:COL[ci]; var sg=g.createLinearGradient(0,sy2,0,sy2+cs); sg.addColorStop(0,KC[0]); sg.addColorStop(1,KC[1]); g.fillStyle=sg; drawRR(sx2,sy2,cs-11,cs-11,10); g.fill(); g.fillStyle='rgba(255,255,255,.3)'; drawRR(sx2+4,sy2+4,cs-19,(cs-11)*0.32,6); g.fill(); }
    var ey=B.ph===2?-8:-4; [-1,1].forEach(function(sd){ g.fillStyle='#fff'; g.beginPath(); g.ellipse(sd*30,ey,16,B.ph===2?10:18,0,0,7); g.fill(); var lx=Math.max(-6,Math.min(6,(G.pad.x-B.x)/40)); g.fillStyle='#10131c'; g.beginPath(); g.arc(sd*30+lx,ey+4,7,0,7); g.fill(); if(B.ph===2){ g.strokeStyle='#10131c'; g.lineWidth=5; g.beginPath(); g.moveTo(sd*48,ey-20); g.lineTo(sd*14,ey-10); g.stroke(); } });
    if(B.kind==='king'){ g.fillStyle='#ffd21a'; g.strokeStyle='#b07a00'; g.lineWidth=3; g.beginPath(); g.moveTo(-70,-bs/2-4); g.lineTo(-70,-bs/2-50); g.lineTo(-35,-bs/2-22); g.lineTo(0,-bs/2-62); g.lineTo(35,-bs/2-22); g.lineTo(70,-bs/2-50); g.lineTo(70,-bs/2-4); g.closePath(); g.fill(); g.stroke(); [-70,0,70].forEach(function(x2,i2){ g.fillStyle=['#ff4d3d','#3a7bff','#2fd36b'][i2]; g.beginPath(); g.arc(x2,i2===1?-bs/2-62:-bs/2-50,7,0,7); g.fill(); }); }
    if(B.kind==='prism'){ g.globalCompositeOperation='lighter'; for(var pr=0;pr<3;pr++){ g.strokeStyle=['rgba(255,60,220,.6)','rgba(0,230,255,.6)','rgba(255,255,255,.4)'][pr]; g.lineWidth=3; drawRR(-bs/2-6-pr*5,-bs/2-6-pr*5,bs+12+pr*10,bs+12+pr*10,30+pr*4); g.stroke(); } g.globalCompositeOperation='source-over'; }
    if(B.kind==='frost'){ g.strokeStyle='rgba(220,248,255,.85)'; g.lineWidth=3; for(var fi=0;fi<8;fi++){ var fa=fi*Math.PI/4+G.t*0.3, r1=bs*0.62, r2=bs*0.74; g.beginPath(); g.moveTo(Math.cos(fa)*r1,Math.sin(fa)*r1); g.lineTo(Math.cos(fa)*r2,Math.sin(fa)*r2); g.stroke(); } }
    if(B.kind==='magma'){ g.globalCompositeOperation='lighter'; var mg=g.createRadialGradient(0,bs*0.3,10,0,bs*0.3,bs); mg.addColorStop(0,'rgba(255,120,20,'+(0.35+0.15*Math.sin(G.t*6))+')'); mg.addColorStop(1,'rgba(255,60,0,0)'); g.fillStyle=mg; g.fillRect(-bs,-bs,bs*2,bs*2); g.globalCompositeOperation='source-over'; }
    if(B.fl>0){ g.globalCompositeOperation='lighter'; g.globalAlpha=B.fl*0.6; g.fillStyle='#fff'; drawRR(-bs/2,-bs/2,bs,bs,26); g.fill(); }
    g.restore();
    g.fillStyle='rgba(255,255,255,.12)'; drawRR(W/2-160,102,320,10,5); g.fill(); var hg2=g.createLinearGradient(W/2-160,0,W/2+160,0); hg2.addColorStop(0,'#ff5a4e'); hg2.addColorStop(1,'#ffd21a'); g.fillStyle=hg2; drawRR(W/2-160,102,320*Math.max(0,B.hp/B.mh),10,5); g.fill(); g.font='800 12px Inter, system-ui, sans-serif'; g.textAlign='center'; g.fillStyle='rgba(255,255,255,.85)'; g.fillText((B.ph===2?'ANGRY ':'')+(BN[B.kind]||'Giant Cube').toUpperCase(),W/2,124); }
  (G.beams||[]).forEach(function(bm){ g.save(); if(bm.t<bm.warn){ var bl=Math.floor(bm.t*12)%2; g.strokeStyle='rgba(255,79,216,'+(bl?0.9:0.4)+')'; g.setLineDash([12,10]); g.lineWidth=3; g.beginPath(); g.moveTo(bm.x,G.boss?G.boss.y:80); g.lineTo(bm.x,H); g.stroke(); g.setLineDash([]); } else { var k3=(bm.t-bm.warn)/bm.on; g.globalCompositeOperation='lighter'; var bg3=g.createLinearGradient(bm.x-30,0,bm.x+30,0); bg3.addColorStop(0,'rgba(255,79,216,0)'); bg3.addColorStop(.5,'rgba(255,255,255,'+(1-k3)+')'); bg3.addColorStop(1,'rgba(0,230,255,0)'); g.fillStyle=bg3; g.fillRect(bm.x-30,G.boss?G.boss.y:80,60,H); } g.restore(); });
  G.haz.forEach(function(h){ g.save(); g.translate(h.x,h.y); if(h.k==='snow'){ g.rotate(h.t*2); g.strokeStyle='#e8fbff'; g.shadowColor='#7fdcff'; g.shadowBlur=12; g.lineWidth=2.6; for(var a=0;a<3;a++){ var an=a*Math.PI/3; g.beginPath(); g.moveTo(-Math.cos(an)*11,-Math.sin(an)*11); g.lineTo(Math.cos(an)*11,Math.sin(an)*11); g.stroke(); } } else { g.shadowColor='#ff6a2a'; g.shadowBlur=18; var lg=g.createRadialGradient(0,0,1,0,0,11); lg.addColorStop(0,'#fff3a0'); lg.addColorStop(.5,'#ff8a1f'); lg.addColorStop(1,'#c2260f'); g.fillStyle=lg; g.beginPath(); g.moveTo(0,-14); g.quadraticCurveTo(10,0,0,10); g.quadraticCurveTo(-10,0,0,-14); g.fill(); } g.restore(); });
  G.proj.forEach(function(q){ g.save(); g.translate(q.x,q.y); g.rotate(q.t*8); g.shadowColor=q.c; g.shadowBlur=16; g.fillStyle=q.c; drawRR(-10,-10,20,20,5); g.fill(); g.restore(); });
  // world particles
  if(G.amb&&G.amb.length){ g.save(); G.amb.forEach(function(a){ if(a.w===1){ g.globalCompositeOperation='lighter'; g.fillStyle=(a.s>2?'rgba(255,79,216,.5)':'rgba(0,230,255,.5)'); g.fillRect(a.x,a.y,a.s*6,1.5); } else if(a.w===2){ g.globalAlpha=.7; g.fillStyle='#ffffff'; g.beginPath(); g.arc(a.x,a.y,a.s,0,7); g.fill(); } else { g.globalCompositeOperation='lighter'; g.globalAlpha=.6+.4*Math.sin(a.ph*5); g.fillStyle='rgba(255,'+(110+Math.round(a.s*30))+',30,.9)'; g.beginPath(); g.arc(a.x,a.y,a.s,0,7); g.fill(); } }); g.restore(); }
  // bricks
  G.bricks.forEach(function(b){ if(!b.alive) return; var e=Math.max(0,b.in), ease=1-Math.pow(1-e,3); if(e<=0) return; var wob=Math.sin(b.wob*20)*b.wob*3;
    var sp=brickSprite(b.t,b.col,b.hp,b.mh); g.save(); g.globalAlpha=ease*(b.t==='v'?(blinkOn(b)?1:0.18):1); g.translate(b.x+BW/2+wob,b.y+BH/2-(1-ease)*60); g.scale(0.6+0.4*ease,0.6+0.4*ease); g.drawImage(sp,-BW/2-10,-BH/2-10,BW+20,BH+20);
    if(b.fl>0){ g.globalCompositeOperation='lighter'; g.globalAlpha=b.fl*0.8; g.fillStyle='#fff'; drawRR(-BW/2,-BH/2,BW,BH,7); g.fill(); }
    if(b.t==='g'||b.t==='p'){ g.globalCompositeOperation='lighter'; g.globalAlpha=0.25+0.2*Math.sin(G.t*5+b.c); g.fillStyle=b.t==='g'?'#ffd21a':'#fff'; drawRR(-BW/2,-BH/2,BW,BH,7); g.fill(); }
    g.restore(); });
  // capsules
  G.caps.forEach(function(c){ var P=PW[c.k], pul=1+Math.sin(c.t*10)*0.06; g.save(); g.translate(c.x,c.y); g.scale(pul,pul); g.shadowColor=P.c; g.shadowBlur=18; g.fillStyle=P.c; drawRR(-24,-12,48,24,12); g.fill(); g.shadowBlur=0; g.fillStyle='rgba(255,255,255,.35)'; drawRR(-20,-10,40,8,5); g.fill(); g.fillStyle='#fff'; g.font='800 14px Inter, system-ui, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(P.t,0,1); g.restore(); });
  // lasers
  g.save(); g.globalCompositeOperation='lighter'; G.lasers.forEach(function(L){ var gr=g.createLinearGradient(0,L.y,0,L.y+40); gr.addColorStop(0,'rgba(255,120,110,1)'); gr.addColorStop(1,'rgba(255,60,60,0)'); g.fillStyle=gr; g.fillRect(L.x-2.5,L.y,5,40); g.fillStyle='rgba(255,90,80,.25)'; g.fillRect(L.x-7,L.y,14,30); }); g.restore();
  // paddle
  var p=G.pad, sq=p.sq, pw=p.w*(1+sq*0.06), ph=16*(1-sq*0.25); g.save(); g.translate(p.x,p.y+sq*2);
  var glowC=p.frz>0?'#7fdcff':p.stun>0?'#ff5a4e':G.feverT>0?'#ffd21a':G.pw.f>0?'#ff9a3d':G.pw.l>0?'#ff5a4e':G.pw.c>0?'#a07bff':'#6b8cff'; g.shadowColor=glowC; g.shadowBlur=24; var pg=g.createLinearGradient(0,-ph/2,0,ph/2); pg.addColorStop(0,'#ffffff'); pg.addColorStop(.5,p.frz>0?'#bfefff':'#c9d6ff'); pg.addColorStop(1,p.frz>0?'#4fa7d6':'#6b7cb8'); g.fillStyle=pg; drawRR(-pw/2,-ph/2,pw,ph,ph/2); g.fill(); g.shadowBlur=0;
  g.fillStyle=glowC; drawRR(-pw/2+8,ph/2-4,pw-16,3,1.5); g.fill(); if(G.pw.l>0){ g.fillStyle='#ff5a4e'; drawRR(-pw/2+5,-ph/2-6,10,8,3); g.fill(); drawRR(pw/2-15,-ph/2-6,10,8,3); g.fill(); } g.restore();
  // balls with trails and glow
  g.save(); g.globalCompositeOperation='lighter'; G.balls.forEach(function(b){ var fire=G.pw.f>0||G.feverT>0, c1=fire?'255,154,61':'150,190,255';
    b.tr.forEach(function(t,i){ var k=i/b.tr.length; g.fillStyle='rgba('+c1+','+(k*0.35)+')'; g.beginPath(); g.arc(t.x,t.y,b.r*(0.4+0.6*k),0,7); g.fill(); });
    var hg=g.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r*4); hg.addColorStop(0,'rgba('+c1+',.55)'); hg.addColorStop(1,'rgba('+c1+',0)'); g.fillStyle=hg; g.beginPath(); g.arc(b.x,b.y,b.r*4,0,7); g.fill(); });
  g.restore(); G.balls.forEach(function(b){ g.fillStyle='#fff'; g.beginPath(); g.arc(b.x,b.y,b.r,0,7); g.fill(); g.fillStyle=(G.pw.f>0||G.feverT>0)?'#ffb26b':'#dfe8ff'; g.beginPath(); g.arc(b.x+2,b.y+2,b.r*0.55,0,7); g.fill(); });
  // particles
  G.parts.forEach(function(q){ var a=1-q.t/q.life; if(q.k==='s'){ g.save(); g.globalAlpha=Math.min(1,a*1.6); g.translate(q.x,q.y); g.rotate(q.rot); g.fillStyle=q.c; g.fillRect(-q.sz/2,-q.sz/2,q.sz,q.sz); g.fillStyle='rgba(255,255,255,.35)'; g.fillRect(-q.sz/2,-q.sz/2,q.sz,q.sz*0.35); g.restore(); } });
  g.save(); g.globalCompositeOperation='lighter'; G.parts.forEach(function(q){ if(q.k!=='p') return; var a=1-q.t/q.life; g.strokeStyle=q.c; g.globalAlpha=a; g.lineWidth=2; g.beginPath(); g.moveTo(q.x,q.y); g.lineTo(q.x-q.vx*0.03,q.y-q.vy*0.03); g.stroke(); });
  G.rings.forEach(function(r){ var k=r.t/r.life, e=1-Math.pow(1-k,3); g.globalAlpha=1-k; g.strokeStyle=r.c; g.lineWidth=r.w*(1-k)+0.5; g.beginPath(); g.arc(r.x,r.y,8+r.max*e,0,7); g.stroke(); }); g.restore();
  G.texts.forEach(function(t){ var k=t.t/t.life, s=k<0.15?0.6+k/0.15*0.5:1.1-0.1*Math.min(1,(k-0.15)*4); g.save(); g.globalAlpha=k>0.7?(1-k)/0.3:1; g.translate(t.x,t.y); g.scale(s,s); g.font='800 '+t.sz+'px Inter, system-ui, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.lineWidth=5; g.strokeStyle='rgba(0,0,0,.55)'; g.strokeText(t.txt,0,0); g.fillStyle=t.c; g.fillText(t.txt,0,0); g.restore(); });
  // banners
  if(G.banner&&G.banner.a>0&&G.state!=='clear'&&G.state!=='over'&&G.state!=='perk'){ var a=Math.min(1,G.banner.a*2); g.save(); g.globalAlpha=a; g.textAlign='center'; g.textBaseline='middle'; g.font='900 64px Inter, system-ui, sans-serif'; g.shadowColor='rgba(107,140,255,.9)'; g.shadowBlur=30; g.fillStyle='#fff'; g.fillText(G.banner.t,W/2,H*0.56); g.shadowBlur=0; g.font='600 20px Inter, system-ui, sans-serif'; g.fillStyle='rgba(255,255,255,.8)'; g.fillText(G.banner.s,W/2,H*0.56+50); g.restore(); }
  if(G.state==='ready'&&!(G.banner&&G.banner.a>0)&&G.state!=='perk'){ g.save(); g.globalAlpha=0.55+0.35*Math.sin(G.t*4); g.textAlign='center'; g.font='600 18px Inter, system-ui, sans-serif'; g.fillStyle='#fff'; g.fillText('Tap to launch',W/2,G.pad.y-70); g.restore(); }
  if(G.state==='paused') panel('Paused',['Tap to keep playing'],null);
  if(G.state==='clear'){ var k2=Math.min(1,G.clearT/0.5), e2=1-Math.pow(1-k2,3), R=G.result||{st:1,earn:0}; g.save(); g.fillStyle='rgba(5,7,14,'+(0.55*e2)+')'; g.fillRect(0,0,W,H); g.translate(W/2,H*0.42); g.scale(0.7+0.3*e2,0.7+0.3*e2); g.globalAlpha=e2; g.textAlign='center'; g.textBaseline='middle';
    g.shadowColor='#ffd21a'; g.shadowBlur=36; g.fillStyle='#fff'; g.font='900 64px Inter, system-ui, sans-serif'; g.fillText('LEVEL CLEAR',0,0); g.shadowBlur=0;
    for(var s2=0;s2<3;s2++){ var on=s2<R.st, sk=Math.max(0,Math.min(1,(G.clearT-0.4-s2*0.25)/0.25)), sc2=on?(sk<1?0.4+sk*0.9:1.1-0.1*Math.min(1,(G.clearT-0.65-s2*0.25)*4)):1; g.save(); g.translate((s2-1)*84,92); g.scale(sc2,sc2); g.font='900 64px Inter, system-ui, sans-serif'; g.fillStyle=on&&sk>0?'#ffd21a':'rgba(255,255,255,.18)'; if(on&&sk>0){ g.shadowColor='#ffd21a'; g.shadowBlur=24; } g.fillText('★',0,0); g.restore(); }
    g.font='700 24px Inter, system-ui, sans-serif'; g.fillStyle='#ffd21a'; g.fillText(R.earn?'+'+Math.round(R.earn*Math.min(1,Math.max(0,(G.clearT-1)/0.8)))+' tokens':(R.first?'':'Daily replay tokens used up'),0,170);
    g.font='600 17px Inter, system-ui, sans-serif'; g.fillStyle='rgba(255,255,255,.75)'; g.fillText(['','Clear it without losing a ball for 2 stars','Get a 15 combo without losing a ball for 3 stars','Perfect run!'][R.st],0,208);
    if(G.clearT>1.2){ g.globalAlpha=0.6+0.4*Math.sin(G.t*5); g.font='700 20px Inter, system-ui, sans-serif'; g.fillStyle='#fff'; g.fillText('Tap to pick a perk',0,262); } g.restore(); }
  if(G.state==='perk'&&G.offer){ g.save(); g.fillStyle='rgba(5,7,14,.72)'; g.fillRect(0,0,W,H); g.textAlign='center'; g.textBaseline='middle'; g.fillStyle='#fff'; g.font='900 44px Inter, system-ui, sans-serif'; g.shadowColor='#6b8cff'; g.shadowBlur=24; g.fillText(G.pending==='start'?'Pick your starting perk':'Pick a perk',W/2,H*0.25); g.shadowBlur=0; g.font='600 17px Inter, system-ui, sans-serif'; g.fillStyle='rgba(255,255,255,.7)'; g.fillText(G.pending==='start'?'Perks stack up for the whole run':'Next: '+((G.lv+1)%5===0?'BOSS level '+(G.lv+1):'level '+(G.lv+1)),W/2,H*0.25+44);
    cardRects().forEach(function(R,i){ var k=G.offer[i]; if(!k) return; var P2=PERKS[k], bob=Math.sin(G.t*2.4+i*1.3)*5; g.save(); g.translate(0,bob); var cg=g.createLinearGradient(0,R.y,0,R.y+R.h); cg.addColorStop(0,'rgba(255,255,255,.16)'); cg.addColorStop(1,'rgba(255,255,255,.05)'); g.fillStyle=cg; drawRR(R.x,R.y,R.w,R.h,22); g.fill(); g.strokeStyle=P2.c; g.lineWidth=2.5; g.shadowColor=P2.c; g.shadowBlur=22; drawRR(R.x,R.y,R.w,R.h,22); g.stroke(); g.shadowBlur=0;
      g.fillStyle=P2.c; g.beginPath(); g.arc(R.x+R.w/2,R.y+64,34,0,7); g.fill(); g.fillStyle='#0b0f1c'; g.font='900 30px Inter, system-ui, sans-serif'; g.fillText(P2.i,R.x+R.w/2,R.y+66);
      g.fillStyle='#fff'; g.font='800 20px Inter, system-ui, sans-serif'; g.fillText(P2.n,R.x+R.w/2,R.y+124); g.font='500 15px Inter, system-ui, sans-serif'; g.fillStyle='rgba(255,255,255,.78)'; wrap(g,P2.d,R.x+R.w/2,R.y+156,R.w-30,20);
      if(pk(k)) { g.font='700 12px Inter, system-ui, sans-serif'; g.fillStyle=P2.c; g.fillText('You have '+pk(k),R.x+R.w/2,R.y+R.h-22); }
      g.font='700 12px Inter, system-ui, sans-serif'; g.fillStyle='rgba(255,255,255,.45)'; g.fillText(String(i+1),R.x+18,R.y+18); g.restore(); });
    g.restore(); }
  if(G.state==='wdone'){ var R2=G.wres; panel(G.lives>0?'Challenge cleared!':'Challenge over',['Score '+String(G.final).replace(/\B(?=(\d{3})+(?!\d))/g,','),R2?(R2.err?R2.err:'Your best this week '+String(R2.mine?R2.mine.sc:0).replace(/\B(?=(\d{3})+(?!\d))/g,',')+(R2.mine&&R2.mine.rank?' · rank #'+R2.mine.rank:'')):'Sending your score…','Top 3 each week win '+((WK.d&&WK.d.pay)||[300,200,100]).join(' / ')+' tokens',G.wdT>1?'Tap to try again':''],G.lives>0?'#ffd21a':'#ff5a4e'); }
  if(G.state==='over') (G.mode==='endless'?panel('Endless over',['Reached level '+G.lv+' · score '+String(G.score).replace(/\B(?=(\d{3})+(?!\d))/g,','),'Endless best '+String(SV.eBest||0).replace(/\B(?=(\d{3})+(?!\d))/g,',')+' (level '+(SV.eLv||0)+')','Tap to start a new endless run'],'#b48cff'):panel('Game over',['Score '+String(G.score).replace(/\B(?=(\d{3})+(?!\d))/g,','),'Best '+String(SV.best).replace(/\B(?=(\d{3})+(?!\d))/g,','),'Tap to try level '+G.lv+' again'],'#ff5a4e'));
  if(G.flash>0){ g.fillStyle='rgba(255,255,255,'+(G.flash*0.5)+')'; g.fillRect(-20,-20,W+40,H+40); }
  // vignette
  var vg=g.createRadialGradient(W/2,H/2,H*0.35,W/2,H/2,H*0.75); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.45)'); g.fillStyle=vg; g.fillRect(-20,-20,W+40,H+40);
  g.restore(); }
function wrap(g,t,x,y,mw,lh){ var w=t.split(' '), line='', yy=y; w.forEach(function(word){ var tst=line?line+' '+word:word; if(g.measureText(tst).width>mw&&line){ g.fillText(line,x,yy); line=word; yy+=lh; } else line=tst; }); if(line) g.fillText(line,x,yy); }
function panel(t,lines,col){ var g=cx; g.save(); g.fillStyle='rgba(5,7,14,.6)'; g.fillRect(0,0,W,H); g.textAlign='center'; g.textBaseline='middle'; g.shadowColor=col||'#6b8cff'; g.shadowBlur=30; g.fillStyle='#fff'; g.font='900 60px Inter, system-ui, sans-serif'; g.fillText(t,W/2,H*0.42); g.shadowBlur=0; g.font='600 21px Inter, system-ui, sans-serif'; lines.forEach(function(l,i){ g.fillStyle=i===lines.length-1?'#fff':'rgba(255,255,255,.75)'; g.fillText(l,W/2,H*0.42+60+i*34); }); g.restore(); }
/* ---------- loop ---------- */
var SC=1,OX=0,OY=0;
function size(){ if(!cv) return; var box=cv.parentNode, bw=box.clientWidth, bh=Math.max(420,window.innerHeight*0.9);
  var w=Math.min(bw,bh*W/H), h=w*H/W; DPR=Math.min(2,window.devicePixelRatio||1); if(cv.width===Math.round(w*DPR)&&cv.height===Math.round(h*DPR)&&BG) return; cv.style.width=w+'px'; cv.style.height=h+'px'; cv.width=Math.round(w*DPR); cv.height=Math.round(h*DPR); SC=w/W; OX=0; OY=0; SPR={}; BG=null; }
function frame(now){ raf=requestAnimationFrame(frame); var dt=Math.min(0.033,(now-(last||now))/1000); last=now; if(!G) return;
  var ts=1; if(G.stop>0){ G.stop-=dt; ts=0; } if(G.slow>0){ G.slow-=dt; ts=0.25; }
  if(G.state==='play'||G.state==='ready') step(dt*ts); else if(G.state==='clear'&&G.slow>0) step(dt*0.25);
  stepFx(dt*(ts||0.2)); draw(); }
function toWorld(e){ var r=cv.getBoundingClientRect(); return {x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H}; }
function bind(){ cv.addEventListener('pointerdown',function(e){ e.preventDefault(); try{ cv.setPointerCapture(e.pointerId); }catch(x){} var w=toWorld(e); if(G.state==='perk'){ cardRects().forEach(function(R,i){ if(w.x>R.x&&w.x<R.x+R.w&&w.y>R.y&&w.y<R.y+R.h) choose(i); }); return; } G.tx=w.x; G.down=true; launch(); });
  cv.addEventListener('pointermove',function(e){ var w=toWorld(e); if(e.pointerType==='mouse'||G.down) G.tx=w.x; });
  cv.addEventListener('pointerup',function(){ G.down=false; }); cv.addEventListener('pointercancel',function(){ G.down=false; }); }
function kd(e){ if(!G||!cv||!document.body.contains(cv)) return; var k=e.key; if(G.state==='perk'&&/^[123]$/.test(k)){ choose(+k-1); return; } if(k===' '||k==='Enter'){ e.preventDefault(); launch(); } else if(k==='p'||k==='P'||k==='Escape'){ pause(); } else if(/^Arrow(Left|Right)$/.test(k)||k==='a'||k==='d'){ keys[k]=true; e.preventDefault(); } }
function ku(e){ keys[e.key]=false; }
function pause(){ if(!G) return; if(G.state==='play') G.state='paused'; else if(G.state==='paused') G.state='play'; }
function vis(){ if(document.hidden){ musicStop(); if(G&&G.state==='play') G.state='paused'; } }
/* ---------- page ---------- */
function stars3(){ var n=0; for(var k in SV.stars) n+=SV.stars[k]; return n; }
function mapHtml(){ var cont=Math.max(1,SV.max+1);
  return '<div class="sm-map">'+WORLDS.map(function(w,k){ var a=k*10+1, open=a<=cont, done=0, st=0; for(var l=a;l<a+10;l++){ if(l<=SV.max) done++; st+=SV.stars[l]||0; }
    return '<div class="sm-wd'+(open?'':' lock')+'" style="--wc:'+w.c+'"><div class="row" style="gap:8px"><b>'+(k+1)+' · '+esc(w.n)+'</b><span class="sp"></span><small class="mono">'+(open?done+'/10 · '+st+'★':'Clear level '+(a-1)+' to open')+'</small></div><div class="sm-dots">'
     +[0,1,2,3,4,5,6,7,8,9].map(function(i){ var l=a+i, ok=l<=cont, s2=SV.stars[l]||0, boss=l%5===0; return '<button type="button" data-sm="go" data-lv="'+l+'"'+(ok?'':' disabled')+' class="'+(l<=SV.max?'done':'')+(boss?' boss':'')+'" aria-label="Level '+l+(boss?' boss':'')+'">'+(boss?(l%10===0?'♛':'☠'):(i+1))+(s2?'<i>'+'★'.repeat(s2)+'</i>':'')+'</button>'; }).join('')+'</div></div>'; }).join('')+'</div>'; }
function wkSheet(){ var sh=CW.sheet('<div class="hd"><h2>Weekly Smash challenge</h2><button class="x" data-close aria-label="Close">✕</button></div><div id="smWk"><p class="muted">Loading…</p></div>'), B=sh.querySelector('#smWk');
  wkApi({act:'get'}).then(function(d){ WK.d=d; if(d.err){ B.innerHTML='<p class="muted">'+esc(d.err)+'</p>'; return; }
    var L=function(ms){ var m=Math.floor(ms/60000), h=Math.floor(m/60), dd=Math.floor(h/24); return dd?dd+'d '+(h%24)+'h':h+'h '+(m%60)+'m'; };
    B.innerHTML='<p class="muted" style="font-size:13.5px;margin:0 0 10px">Everyone plays the same '+esc(WORLDS[d.wk%4].n)+' level this week, with Long paddle and Lucky drops. Your best score counts, and you can play as often as you like. Clearing it adds 2,000 points per life left. Top 3 win '+d.pay.join(' / ')+' tokens. Ends in '+L(d.reset-Date.now())+'.</p>'
     +(d.mine?'<p style="margin:0 0 10px"><b>Your best: '+String(d.mine.sc).replace(/\B(?=(\d{3})+(?!\d))/g,',')+'</b> · rank #'+d.mine.rank+' of '+d.n+'</p>':'')
     +'<button type="button" class="btn pri" id="smWkGo">Play the challenge</button><div style="margin-top:12px">'+(d.rows.length?d.rows.map(function(r){ return '<div class="row c7-r'+(r.me?' me':'')+'"><b class="mono">#'+r.r+'</b><span>'+esc(r.n)+'</span><span class="sp"></span><b class="mono">'+String(r.sc).replace(/\B(?=(\d{3})+(?!\d))/g,',')+'</b></div>'; }).join(''):'<p class="muted">No scores yet this week.</p>')+'</div>'
     +(d.last&&d.last.length?'<p class="muted" style="font-size:13px;margin-top:10px">Last week: '+d.last.map(function(x){ return '#'+x.r+' '+esc(x.n); }).join(' · ')+'</p>':'');
    B.querySelector('#smWkGo').onclick=function(){ sh.querySelector('[data-close]').click(); startWeekly(); if(cv) cv.scrollIntoView({behavior:'smooth',block:'end'}); }; }); }
function menu(el){ var cont=Math.max(1,SV.max+1);
  el.innerHTML='<div class="wrap sm-w">'+PL.crumbs('Cube Smash')
   +'<div class="sm-top"><p class="muted" style="margin:0;font-size:14px;flex:1;min-width:240px">Break every sticker brick. Drag to move the paddle, tap to launch. Pick a perk before each level and build your run. Fill the Fever meter to set every ball on fire. Every 5th level is a boss: the Giant Cube shoots back.'+(U8()?' Four worlds, each with its own bricks and a world boss on level 10.':'')+'</p>'
   +'<div class="sm-stats"><span><b class="mono">'+SV.max+'</b><small>levels cleared</small></span><span><b class="mono">'+stars3()+'</b><small>stars</small></span><span><b class="mono">'+String(SV.best).replace(/\B(?=(\d{3})+(?!\d))/g,',')+'</b><small>best score</small></span></div></div>'
   +(U8()?mapHtml():'')+'<div class="row" style="gap:8px;flex-wrap:wrap;margin:10px 0">'+(U8()?'<button type="button" class="btn" data-sm="wk">🏆 Weekly challenge</button>':'')+'<button type="button" class="btn pri" data-sm="go" data-lv="'+cont+'">'+(SV.max?'Play level '+cont:'Play')+'</button>'+(SV.max?'<button type="button" class="btn" data-sm="go" data-lv="1">Start from level 1</button>':'')+'<button type="button" class="btn" data-sm="end">∞ Endless'+(SV.eBest?' · best '+String(SV.eBest).replace(/\B(?=(\d{3})+(?!\d))/g,','):'')+'</button>'+'<span class="sp"></span><button type="button" class="btn sm" data-sm="pause" aria-label="Pause">Pause</button><button type="button" class="btn sm" data-sm="mute">'+(SV.mute?'Sound off':'Sound on')+'</button></div>'
   +'<div class="sm-stage"><canvas id="smCv" aria-label="Cube Smash game"></canvas></div>'
   +'<p class="muted" style="font-size:13px;text-align:center;margin:10px 0 0">Tokens: '+40+' to 200 for each new level you clear, plus 20 for each new star. Replays give 10 tokens, up to 300 a day. Keyboard: arrows to move, Space to launch, P to pause.</p></div>';
  cv=$('#smCv',el); cx=cv.getContext('2d'); size(); bind(); newGame(cont); last=0; cancelAnimationFrame(raf); raf=requestAnimationFrame(frame); setTimeout(function(){ try{ if(cv&&cv.getBoundingClientRect().bottom>window.innerHeight) cv.scrollIntoView({behavior:'smooth',block:'end'}); }catch(e){} },350);
  el.querySelector('.sm-w').addEventListener('click',function(e){ var b=e.target.closest('[data-sm]'); if(!b) return; var a=b.getAttribute('data-sm');
    if(a==='go'){ ac(); newGame(+b.getAttribute('data-lv')||1); cv.scrollIntoView({behavior:'smooth',block:'end'}); }
    else if(a==='end'){ ac(); newGame(1); G.mode='endless'; G.banner={t:'Endless',s:'3 lives, no retries. How far can you go?',a:2.6}; cv.scrollIntoView({behavior:'smooth',block:'end'}); }
    else if(a==='wk') wkSheet();
    else if(a==='pause') pause();
    else if(a==='mute'){ SV.mute=!SV.mute; save(); b.textContent=SV.mute?'Sound off':'Sound on'; if(SV.mute) musicStop(); else { ac(); musicStart(); } } }); }
PL._sm=function(){ return G; };
PL.views.smash={show:function(el){ menu(el); window.addEventListener('resize',size); document.addEventListener('keydown',kd); document.addEventListener('keyup',ku); document.addEventListener('visibilitychange',vis); },
  leave:function(){ musicStop(); cancelAnimationFrame(raf); window.removeEventListener('resize',size); document.removeEventListener('keydown',kd); document.removeEventListener('keyup',ku); document.removeEventListener('visibilitychange',vis); G=null; cv=null; }};
/* a way in from the Cube Dash page (no new card on the home page) */
function card(){ return '<a class="pnl sm-card" href="#smash"><span class="sm-cv" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span><span style="flex:1;min-width:0"><b>New game: Cube Smash</b><span class="muted">Break sticker bricks, catch power-ups, set off bombs. '+(SV.max?SV.max+' levels cleared · ':'')+'Tokens for every new level.</span></span><span class="btn pri sm">Play</span></a>'; }
var DV=PL.views.dash; if(DV&&!DV._sm){ DV._sm=1; var o=DV.show; DV.show=function(el){ var r=o.apply(this,arguments); try{ if(!el.querySelector('.sm-card')){ var w=el.querySelector('.wrap'), cr=w&&w.querySelector('.crumbs'); if(w){ var d=document.createElement('div'); d.innerHTML=card(); if(cr&&cr.nextSibling) w.insertBefore(d.firstChild,cr.nextSibling); else w.insertBefore(d.firstChild,w.firstChild); } } }catch(e){} return r; }; }
})();
(function(){ if(window.PL&&PL.onUpd8) PL.onUpd8(function(){ if(/^#smash/.test(location.hash)&&!document.querySelector('.sm-map')) window.dispatchEvent(new HashChangeEvent('hashchange')); }); })();
