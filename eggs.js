/* Update 8 easter eggs. Six hidden secrets around Cuber Tools; each one plays its own effect the first time and counts toward "secrets found".
   1 Tap the Cuber Tools logo 7 times fast  -> the page flips like a cube face + a secret pad skin (Hidden Cube)
   2 Konami code (keyboard)                 -> Cube Rain
   3 Tap the light/dark button 8 times fast  -> Disco mode
   4 A timer solve that shows one repeated digit (7.77, 11.11, 22.22...) -> Jackpot
   5 In 3D Cube, do R U R' U' six times in a row -> Sexy Move Master fireworks
   6 In Cube Smash, hit a top corner exactly -> Corner hit */
(function(){
if(!window.PL) return;
function on(){ return !!(PL.updOn8&&PL.updOn8()); }
function got(){ try{ return JSON.parse(localStorage.getItem('cw_eggs')||'{}')||{}; }catch(e){ return {}; } }
var NAMES={flip:'Cube Flip',rain:'Cube Rain',disco:'Disco Mode',jackpot:'Jackpot',sexy:'Sexy Move Master',corner:'Corner Hit'}, TOTAL=6, SECRET_SKIN=107;
function found(k,reward){ var g=got(), first=!g[k]; if(first){ g[k]=Date.now(); try{ localStorage.setItem('cw_eggs',JSON.stringify(g)); }catch(e){} }
  var n=Object.keys(got()).length; banner('Secret found: '+NAMES[k],first?'Secret '+n+' of '+TOTAL+(reward?' · '+reward:''):'You found this one before');
  return first; }
/* ---------- shared overlay pieces ---------- */
var BQ=[], bBusy=0; function banner(t,s){ BQ.push([t,s]); if(!bBusy) nextB(); }
function nextB(){ var q=BQ.shift(); if(!q){ bBusy=0; return; } bBusy=1; var t=q[0], s=q[1]; var b=document.createElement('div'); b.className='egg-b'; b.style.cssText='position:fixed;left:50%;top:18px;width:auto;max-width:90vw;z-index:99995;background:linear-gradient(135deg,#2a1a5c,#140a30)!important;backdrop-filter:none!important'; b.innerHTML='<b></b><span></span>'; b.querySelector('b').textContent=t; b.querySelector('span').textContent=s; document.body.appendChild(b); requestAnimationFrame(function(){ b.classList.add('in'); }); setTimeout(function(){ b.classList.remove('in'); setTimeout(function(){ b.remove(); nextB(); },450); },2800); }
function layer(){ var c=document.createElement('canvas'); c.className='egg-cv'; c.width=innerWidth*Math.min(2,devicePixelRatio||1); c.height=innerHeight*Math.min(2,devicePixelRatio||1); document.body.appendChild(c); var x=c.getContext('2d'); x.scale(c.width/innerWidth,c.height/innerHeight); return {c:c,x:x,W:innerWidth,H:innerHeight}; }
var CC=['#ff4d3d','#ff8a1f','#ffd21a','#2fd36b','#3a7bff','#f4f4f2'];
var AC=null; function ac(){ try{ if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==='suspended') AC.resume(); }catch(e){} return AC; }
function tone(f,d,type,v,delay){ var a=ac(); if(!a) return; var t=a.currentTime+(delay||0), o=a.createOscillator(), g=a.createGain(); o.type=type||'triangle'; o.frequency.setValueAtTime(f,t); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(v||.12,t+.01); g.gain.exponentialRampToValueAtTime(.0001,t+d); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t+d+.02); }
function fanfare(){ [0,4,7,12,16,19,24].forEach(function(s,i){ tone(523*Math.pow(2,s/12),.25,'triangle',.12,i*.07); }); }
function isoCube(x,cx,cy,s,rot,cols){ var a=rot, ca=Math.cos(a), sa=Math.sin(a); function P(px,py){ return [cx+(px*ca-py*sa)*s,cy+(px*sa+py*ca)*s]; }
  var top=[P(0,-1),P(.87,-.5),P(0,0),P(-.87,-.5)], lf=[P(-.87,-.5),P(0,0),P(0,1),P(-.87,.5)], rt=[P(0,0),P(.87,-.5),P(.87,.5),P(0,1)];
  [[top,cols[0],1],[lf,cols[1],.78],[rt,cols[2],.6]].forEach(function(f){ x.beginPath(); f[0].forEach(function(p,i){ i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]); }); x.closePath(); x.fillStyle=f[1]; x.fill(); x.fillStyle='rgba(0,0,0,'+(1-f[2])*0.6+')'; x.fill(); x.strokeStyle='#15181d'; x.lineWidth=Math.max(1.5,s*.08); x.stroke(); }); }
function confetti(n,dur){ var L=layer(), x=L.x, P=[]; for(var i=0;i<n;i++) P.push({x:L.W/2,y:L.H*.45,vx:(Math.random()-.5)*16,vy:-6-Math.random()*14,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:CC[i%6],w:6+Math.random()*8});
  var t0=performance.now(); (function f(){ var t=(performance.now()-t0)/1000; x.clearRect(0,0,L.W,L.H); P.forEach(function(p){ p.vy+=.42; p.x+=p.vx; p.y+=p.vy; p.vx*=.99; p.r+=p.vr; x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.fillStyle=p.c; x.fillRect(-p.w/2,-p.w/4,p.w,p.w/2); x.restore(); }); if(t<(dur||4)) requestAnimationFrame(f); else L.c.remove(); })(); }
/* ---------- 1 logo taps: page flip + secret skin ---------- */
var taps=[];
window.addEventListener('click',function(e){ if(!on()) return; var lg=e.target.closest&&e.target.closest('#nav9 .n9-brand, .top .brand'); if(!lg) return; var now=Date.now(); taps=taps.filter(function(t){ return now-t<2500; }); taps.push(now); if(taps.length>=7){ taps=[]; e.preventDefault(); flip(); } else if(taps.length>=3) e.preventDefault(); },true);
function flip(){ var app=document.getElementById('app'); if(!app) return; ac(); tone(220,.6,'sawtooth',.06); app.classList.add('egg-flip'); setTimeout(function(){ app.classList.remove('egg-flip'); fanfare(); confetti(160,4);
  var first=found('flip',null); if(first||!PL.skins.has(SECRET_SKIN)){ try{ addSkin(); PL.skins.unlock(SECRET_SKIN); }catch(e){} banner('Hidden Cube pad skin unlocked','It is in your Garage'); } },1300); }
/* ---------- 2 Konami code: cube rain ---------- */
var KON=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'], kp=0;
document.addEventListener('keydown',function(e){ if(!on()) return; var t=e.target; if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA')) return; var k=e.key.length===1?e.key.toLowerCase():e.key; if(k===KON[kp]){ kp++; if(kp===KON.length){ kp=0; rain(); } } else kp=k===KON[0]?1:0; });
function rain(){ var L=layer(), x=L.x, C=[]; ac(); for(var i=0;i<90;i++) C.push({x:Math.random()*L.W,y:-60-Math.random()*L.H*1.5,v:180+Math.random()*320,s:10+Math.random()*26,r:Math.random()*6,vr:(Math.random()-.5)*3,c:[CC[i%6],CC[(i+2)%6],CC[(i+4)%6]]});
  var t0=performance.now(), last=t0; [0,3,7,10,14].forEach(function(s,i){ tone(392*Math.pow(2,s/12),.4,'sine',.08,i*.12); });
  (function f(now){ var dt=Math.min(.05,((now||performance.now())-last)/1000); last=now||performance.now(); var t=(last-t0)/1000; x.clearRect(0,0,L.W,L.H); C.forEach(function(q){ q.y+=q.v*dt; q.r+=q.vr*dt; if(q.y>L.H+60&&t<4.5){ q.y=-60; q.x=Math.random()*L.W; } isoCube(x,q.x,q.y,q.s,q.r,q.c); }); if(t<7) requestAnimationFrame(f); else L.c.remove(); })();
  setTimeout(function(){ var first=found('rain',null); if(first) try{ PL.award(50); banner('+50 tokens','For finding Cube Rain'); }catch(e){} },900); }
/* ---------- 3 theme button taps: disco ---------- */
var dt2=[];
window.addEventListener('click',function(e){ if(!on()) return; var b=e.target.closest&&e.target.closest('[data-theme-toggle],[data-v9t]'); if(!b) return; var now=Date.now(); dt2=dt2.filter(function(t){ return now-t<3500; }); dt2.push(now); if(dt2.length>=8){ dt2=[]; disco(); } },true);
function disco(){ var R=document.documentElement; if(R.classList.contains('egg-disco')) return; R.classList.add('egg-disco'); ac(); var beat=0, iv=setInterval(function(){ tone(beat%2?220:110,.12,'square',.07); if(beat%4===2) tone(880,.06,'triangle',.05); beat++; },250);
  var ball=document.createElement('div'); ball.className='egg-ball'; document.body.appendChild(ball);
  setTimeout(function(){ R.classList.remove('egg-disco'); clearInterval(iv); ball.remove(); },12000); setTimeout(function(){ found('disco',null); },600); }
/* ---------- 4 timer jackpot: one repeated digit ---------- */
function rep(ms){ var s=(ms/1000).toFixed(2).replace('.',''); return s.length>=3&&/^(\d)\1+$/.test(s); }
function jackpot(ms){ var txt=(ms/1000).toFixed(2), L=layer(), x=L.x, t0=performance.now(); ac();
  for(var i=0;i<14;i++) tone(600+i*40,.05,'square',.04,i*.06); setTimeout(function(){ fanfare(); confetti(200,4); },1600);
  var coins=[]; for(var k=0;k<70;k++) coins.push({x:L.W/2,y:L.H*.5,vx:(Math.random()-.5)*14,vy:-8-Math.random()*12,r:Math.random()*6,d:1.6+Math.random()*.3});
  (function f(){ var t=(performance.now()-t0)/1000; x.clearRect(0,0,L.W,L.H); var bw=Math.min(560,L.W*.9), bh=150, bx=(L.W-bw)/2, by=L.H*.5-bh/2;
    x.fillStyle='rgba(5,7,14,'+Math.min(.6,t*2)+')'; x.fillRect(0,0,L.W,L.H); x.fillStyle='#1b1030'; x.strokeStyle='#ffd21a'; x.lineWidth=6; x.beginPath(); x.roundRect?x.roundRect(bx,by,bw,bh,24):x.rect(bx,by,bw,bh); x.fill(); x.stroke();
    var ch=txt.split(''), cw=bw/(ch.length+1); ch.forEach(function(c2,i2){ var stop=1+i2*.15, sp=t<stop, d=sp?String(Math.floor(Math.random()*10)):c2; x.font='900 '+(sp?72:84)+'px Inter, system-ui, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillStyle=c2==='.'?'#ffd21a':(sp?'rgba(255,255,255,.6)':'#fff'); if(!sp){ x.shadowColor='#ffd21a'; x.shadowBlur=24; } x.fillText(c2==='.'?'.':d,bx+cw*(i2+1),by+bh/2+(sp?(Math.random()-.5)*20:0)); x.shadowBlur=0; });
    x.font='900 34px Inter, system-ui, sans-serif'; x.fillStyle='#ffd21a'; if(t>1.6){ x.fillText('JACKPOT!',L.W/2,by-40); }
    if(t>1.6) coins.forEach(function(q){ q.vy+=.4; q.x+=q.vx; q.y+=q.vy; q.r+=.2; x.save(); x.translate(q.x,q.y); x.scale(Math.cos(q.r),1); x.fillStyle='#ffd21a'; x.beginPath(); x.arc(0,0,10,0,7); x.fill(); x.fillStyle='#b88300'; x.beginPath(); x.arc(0,0,6,0,7); x.fill(); x.restore(); });
    if(t<3.6) requestAnimationFrame(f); else L.c.remove(); })();
  setTimeout(function(){ var day=new Date().toDateString(), g=got(); var first=found('jackpot',null); var lastDay=localStorage.getItem('cw_egg_jp'); if(lastDay!==day){ try{ localStorage.setItem('cw_egg_jp',day); var n=PL.award(77); banner('+'+n+' tokens','Jackpot pays once a day'); }catch(e){} } },1800); }
var sd=PL.solveDone; PL.solveDone=function(rec,cube,L){ if(sd) try{ sd.apply(this,arguments); }catch(e){} try{ if(on()&&rec&&rec.p!==2&&rep(rec.t+(rec.p===1?2000:0))) setTimeout(function(){ jackpot(rec.t+(rec.p===1?2000:0)); },700); }catch(e){} };
/* ---------- 5 3D cube: sexy move x6 ---------- */
function sexy(h){ if(!on()||!h||h.length<24) return; var want="R U R' U'".split(' '), last=h.slice(-24); for(var i=0;i<24;i++) if(last[i]!==want[i%4]) return; h.push('·');
  var L=layer(), x=L.x, F=[], t0=performance.now(); ac(); for(var k=0;k<6;k++) (function(k){ setTimeout(function(){ var cx=L.W*(.2+Math.random()*.6), cy=L.H*(.2+Math.random()*.35), c=CC[k%6]; tone(300+k*80,.4,'sine',.1); for(var j=0;j<70;j++){ var a=j/70*Math.PI*2, v=3+Math.random()*4; F.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,c:c,t:0}); } },k*330); })(k);
  (function f(){ var t=(performance.now()-t0)/1000; x.globalCompositeOperation='source-over'; x.fillStyle='rgba(0,0,0,.18)'; x.clearRect(0,0,L.W,L.H); x.globalCompositeOperation='lighter'; F.forEach(function(p){ p.t+=1/60; p.vy+=.06; p.x+=p.vx; p.y+=p.vy; p.vx*=.985; x.fillStyle=p.c; x.globalAlpha=Math.max(0,1-p.t/1.6); x.beginPath(); x.arc(p.x,p.y,2.6,0,7); x.fill(); }); x.globalAlpha=1;
    x.globalCompositeOperation='source-over'; x.font='900 '+Math.min(64,L.W/10)+'px Inter, system-ui, sans-serif'; x.textAlign='center'; x.fillStyle='#fff'; x.shadowColor='#ff4fd8'; x.shadowBlur=30; x.fillText("R U R' U' × 6",L.W/2,L.H*.72); x.shadowBlur=0; if(t<4) requestAnimationFrame(f); else L.c.remove(); })();
  setTimeout(function(){ var first=found('sexy',null); if(first) try{ PL.award(66); banner('+66 tokens','Sexy Move Master'); }catch(e){} },500); }
/* ---------- 6 Cube Smash corner hit ---------- */
function corner(){ if(!on()) return; ac(); fanfare(); confetti(120,3); found('corner',null); }
/* secret pad skin (id 107): only from the logo egg */
function addSkin(){ var L=PL.skins.list; if(!L.some(function(k){ return k.i===SECRET_SKIN; })) L.push({i:SECRET_SKIN,n:'Hidden Cube',ty:'season',cost:0,gift:1,css:'radial-gradient(circle at 50% 45%,#3a2a6a,#07050f 70%)',need:'A secret. Somewhere in Cuber Tools, something wants to be tapped.'}); }
if(window.CW_PADART&&CW_PADART.art){ CW_PADART.art[SECRET_SKIN]={ink:'#f3eaff',glow:'rgba(170,120,255,.8)',draw:function(c,w,h,R){ var s=Math.min(w,h)/300; var g=c.createRadialGradient(w/2,h*.45,0,w/2,h*.45,Math.max(w,h)*.7); g.addColorStop(0,'#3a2a6a'); g.addColorStop(1,'#07050f'); c.fillStyle=g; c.fillRect(0,0,w,h);
  for(var i=0;i<80;i++){ c.fillStyle='rgba(255,255,255,'+(R()*.6)+')'; c.fillRect(R()*w,R()*h,s*R()*2,s*R()*2); }
  var cx=w/2, cy=h*.5, cs=Math.min(w,h)*.22; c.save(); c.globalAlpha=.35; for(var k=0;k<3;k++){ c.strokeStyle=['#ff4fd8','#00e6ff','#ffd21a'][k]; c.lineWidth=s*2; c.strokeRect(cx-cs/2+(k-1)*s*6,cy-cs/2-(k-1)*s*4,cs,cs); } c.restore();
  c.fillStyle='rgba(20,14,40,.85)'; c.strokeStyle='#c9a8ff'; c.lineWidth=s*3; c.beginPath(); c.rect(cx-cs/2,cy-cs/2,cs,cs); c.fill(); c.stroke(); c.fillStyle='#e9dcff'; c.font='900 '+Math.round(cs*.7)+'px Inter, system-ui, sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.shadowColor='#a070ff'; c.shadowBlur=s*20; c.fillText('?',cx,cy+s*2); c.shadowBlur=0;
  for(var j=0;j<6;j++){ var y=R()*h; c.fillStyle='rgba(170,120,255,.18)'; c.fillRect(0,y,w,s*(2+R()*5)); } }}; }
if(window.CW_PADFX&&CW_PADFX.cfg){ CW_PADFX.cfg[SECRET_SKIN]=[['twinkle',{n:30,col:'rgba(200,170,255,1)'}],['drift',{n:6,col:['rgba(160,100,255,1)','rgba(0,230,255,1)'],a:.2}]]; if(CW_PADFX.fset) CW_PADFX.fset[SECRET_SKIN]=['shatter','sparkle']; }
if(PL.onUpd8) PL.onUpd8(function(){ if(PL.skins.has(SECRET_SKIN)) addSkin(); });
window.CWEgg={cube:sexy,corner:corner,count:function(){ return Object.keys(got()).length; },total:TOTAL};
})();
