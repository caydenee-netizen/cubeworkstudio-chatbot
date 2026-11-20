/* Update 8: six new animated pad skins (ids 101-106), hand-painted in the same canvas format as padart.js,
   each with its own moving effect layer and finish burst. Sold in the Garage for 2,600 tokens once Update 8 is live. */
(function(){
if(!window.CW_PADART||!CW_PADART.art) return;
var A=CW_PADART.art, TAU=Math.PI*2;
function lin(c,x0,y0,x1,y1,st){ var g=c.createLinearGradient(x0,y0,x1,y1); st.forEach(function(s){ g.addColorStop(s[0],s[1]); }); return g; }
function rad(c,x,y,r0,r1,st){ var g=c.createRadialGradient(x,y,r0,x,y,r1); st.forEach(function(s){ g.addColorStop(s[0],s[1]); }); return g; }
function fill(c,w,h,st){ c.fillStyle=st; c.fillRect(0,0,w,h); }
function glow(c,x,y,r,col,a){ c.save(); c.globalCompositeOperation='lighter'; c.globalAlpha=a==null?1:a; c.fillStyle=rad(c,x,y,0,r,[[0,col],[1,'rgba(0,0,0,0)']]); c.fillRect(x-r,y-r,r*2,r*2); c.restore(); }
function vign(c,w,h,a){ c.fillStyle=rad(c,w/2,h/2,Math.min(w,h)*.25,Math.hypot(w,h)*.62,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,'+a+')']]); c.fillRect(0,0,w,h); }
function calm(c,w,h,a){ c.fillStyle=rad(c,w/2,h/2,0,Math.max(w,h)*.42,[[0,'rgba(0,0,0,'+a+')'],[1,'rgba(0,0,0,0)']]); c.fillRect(0,0,w,h); }
function M(w,h){ return Math.min(w,h)/300; }
function rr(c,x,y,w,h,r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
var CC=['#ff4d3d','#ff8a1f','#ffd21a','#2fd36b','#3a7bff','#f4f4f2'];

/* 101 Neon Breaker: neon brick wall with a glowing ball trail */
A[101]={ink:'#ffffff',glow:'rgba(255,79,216,.75)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#140326'],[1,'#05010d']])); glow(c,w*.2,h*.25,Math.max(w,h)*.5,'rgba(255,40,200,.35)'); glow(c,w*.85,h*.7,Math.max(w,h)*.5,'rgba(0,220,255,.3)');
  var bw=w/9, bh=s*16, cols=['#ff4fd8','#00e6ff','#b06bff','#ff4fd8'];
  for(var r=0;r<4;r++) for(var i=-1;i<10;i++){ var x=i*bw+(r%2?bw/2:0)+s*3, y=h*.1+r*(bh+s*7); c.save(); c.shadowColor=cols[r]; c.shadowBlur=s*12; c.strokeStyle=cols[r]; c.lineWidth=s*2.2; rr(c,x,y,bw-s*6,bh,s*5); c.stroke(); c.restore(); if(R()<.25){ c.fillStyle=cols[r]; c.globalAlpha=.35; rr(c,x,y,bw-s*6,bh,s*5); c.fill(); c.globalAlpha=1; } }
  c.save(); c.globalCompositeOperation='lighter'; for(var t=0;t<24;t++){ var k=t/24, x2=w*(.15+k*.6), y2=h*(.92-k*.38)+Math.sin(k*6)*s*6; c.fillStyle='rgba(150,200,255,'+(k*.5)+')'; c.beginPath(); c.arc(x2,y2,s*(2+k*6),0,TAU); c.fill(); } c.restore();
  c.save(); c.shadowColor='#fff'; c.shadowBlur=s*20; c.fillStyle='#fff'; c.beginPath(); c.arc(w*.75,h*.54,s*8,0,TAU); c.fill(); c.restore();
  c.save(); c.shadowColor='#00e6ff'; c.shadowBlur=s*16; c.fillStyle='#dff6ff'; rr(c,w*.32,h*.9,w*.36,s*8,s*4); c.fill(); c.restore(); calm(c,w,h,.25); vign(c,w,h,.35); }};
/* 102 Frost Core: an ice crystal cube in a frozen cave */
A[102]={ink:'#f2fdff',glow:'rgba(127,220,255,.75)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#06223a'],[.6,'#0a3a5c'],[1,'#020a14']])); glow(c,w/2,h*.5,Math.max(w,h)*.55,'rgba(120,220,255,.35)');
  c.fillStyle='rgba(200,240,255,.18)'; for(var i=0;i<12;i++){ var x=R()*w, len=h*(.12+R()*.22); c.beginPath(); c.moveTo(x-s*8,0); c.lineTo(x+s*8,0); c.lineTo(x,len); c.closePath(); c.fill(); }
  c.save(); c.translate(w/2,h*.52); c.rotate(.12); var cs=Math.min(w,h)*.36; c.shadowColor='#7fdcff'; c.shadowBlur=s*40; c.fillStyle='rgba(10,40,70,.9)'; rr(c,-cs/2,-cs/2,cs,cs,cs*.12); c.fill(); c.shadowBlur=0; var g=cs/3;
  for(var k=0;k<9;k++){ var x2=-cs/2+s*4+(k%3)*g, y2=-cs/2+s*4+Math.floor(k/3)*g; c.fillStyle=lin(c,0,y2,0,y2+g,[[0,k%2?'#e8fbff':'#bfe9ff'],[1,k%2?'#7ccbef':'#2f8fd6']]); rr(c,x2,y2,g-s*7,g-s*7,s*6); c.fill(); c.fillStyle='rgba(255,255,255,.45)'; rr(c,x2+s*3,y2+s*3,g-s*13,(g-s*7)*.3,s*4); c.fill(); } c.restore();
  c.strokeStyle='rgba(230,250,255,.8)'; c.lineWidth=s*2; for(var f=0;f<10;f++){ var fx=R()*w, fy=R()*h, fr=s*(4+R()*6); for(var a=0;a<3;a++){ var an=a*Math.PI/3; c.beginPath(); c.moveTo(fx-Math.cos(an)*fr,fy-Math.sin(an)*fr); c.lineTo(fx+Math.cos(an)*fr,fy+Math.sin(an)*fr); c.stroke(); } }
  calm(c,w,h,.3); vign(c,w,h,.4); }};
/* 103 Magma Rush: cracked basalt with lava flowing through */
A[103]={ink:'#fff3e0',glow:'rgba(255,110,30,.8)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,'#140504'); for(var i=0;i<26;i++){ var x=R()*w, y=R()*h, r=s*(20+R()*40); c.fillStyle=['#1e0907','#2a0d09','#170605'][i%3]; c.beginPath(); for(var a=0;a<7;a++){ var an=a/7*TAU, rr2=r*(.7+R()*.4); a?c.lineTo(x+Math.cos(an)*rr2,y+Math.sin(an)*rr2):c.moveTo(x+Math.cos(an)*rr2,y+Math.sin(an)*rr2); } c.closePath(); c.fill(); }
  c.save(); c.globalCompositeOperation='lighter'; c.shadowColor='#ff6a2a'; c.shadowBlur=s*18; for(var k=0;k<5;k++){ c.strokeStyle=k%2?'#ffb13d':'#ff5a1a'; c.lineWidth=s*(3+R()*4); c.beginPath(); var x0=R()*w, y0=0; c.moveTo(x0,y0); for(var t=0;t<8;t++){ x0+=(R()-.5)*w*.25; y0+=h/8; c.lineTo(x0,y0); } c.stroke(); } c.restore();
  glow(c,w/2,h,Math.max(w,h)*.6,'rgba(255,90,20,.55)'); glow(c,w*.3,h*.3,s*60,'rgba(255,170,40,.25)');
  for(var e=0;e<30;e++){ var ex=R()*w, ey=R()*h; glow(c,ex,ey,s*(4+R()*5),'rgba(255,200,80,.9)'); }
  calm(c,w,h,.3); vign(c,w,h,.45); }};
/* 104 King Cube: the crowned boss cube on velvet */
A[104]={ink:'#fff7d6',glow:'rgba(255,210,60,.8)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#2a0a3a'],[1,'#12041c']])); for(var i=0;i<12;i++){ c.fillStyle='rgba(255,255,255,.03)'; c.fillRect(i*w/12,0,w/24,h); } glow(c,w/2,h*.55,Math.max(w,h)*.5,'rgba(255,200,60,.28)');
  var cs=Math.min(w,h)*.4, cx=w/2, cy=h*.58; c.save(); c.translate(cx,cy); c.shadowColor='rgba(0,0,0,.6)'; c.shadowBlur=s*30; c.fillStyle='#15181d'; rr(c,-cs/2,-cs/2,cs,cs,cs*.13); c.fill(); c.shadowBlur=0; var g=cs/3;
  for(var k=0;k<9;k++){ var x2=-cs/2+s*4+(k%3)*g, y2=-cs/2+s*4+Math.floor(k/3)*g, col=CC[(k*4)%6]; c.fillStyle=col; rr(c,x2,y2,g-s*7,g-s*7,s*6); c.fill(); c.fillStyle='rgba(255,255,255,.35)'; rr(c,x2+s*3,y2+s*3,g-s*13,(g-s*7)*.3,s*4); c.fill(); }
  [-1,1].forEach(function(sd){ c.fillStyle='#fff'; c.beginPath(); c.ellipse(sd*cs*.17,-s*2,s*9,s*10,0,0,TAU); c.fill(); c.fillStyle='#10131c'; c.beginPath(); c.arc(sd*cs*.17,s*1,s*4.5,0,TAU); c.fill(); });
  c.fillStyle='#ffd21a'; c.strokeStyle='#a87200'; c.lineWidth=s*2.5; var cw=cs*.42; c.beginPath(); c.moveTo(-cw,-cs/2); c.lineTo(-cw,-cs/2-cw*.7); c.lineTo(-cw/2,-cs/2-cw*.35); c.lineTo(0,-cs/2-cw*.9); c.lineTo(cw/2,-cs/2-cw*.35); c.lineTo(cw,-cs/2-cw*.7); c.lineTo(cw,-cs/2); c.closePath(); c.fill(); c.stroke();
  [[-cw,-cs/2-cw*.7,'#ff4d3d'],[0,-cs/2-cw*.9,'#3a7bff'],[cw,-cs/2-cw*.7,'#2fd36b']].forEach(function(j){ c.fillStyle=j[2]; c.beginPath(); c.arc(j[0],j[1],s*5,0,TAU); c.fill(); }); c.restore();
  calm(c,w,h,.2); vign(c,w,h,.4); }};
/* 105 Prism: a crystal cube throwing rainbow light spots around a violet room */
A[105]={ink:'#ffffff',glow:'rgba(200,180,255,.8)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,w,h,[[0,'#1a0f3a'],[.5,'#2a1d5c'],[1,'#0d0a24']])); var cx=w/2, cy=h*.52, cs=Math.min(w,h)*.3;
  c.save(); c.globalCompositeOperation='lighter'; for(var r=0;r<14;r++){ var an=r/14*TAU+.2, col=['255,80,80','255,170,60','255,230,80','80,220,120','80,160,255','170,110,255'][r%6]; var gx=c.createLinearGradient(cx,cy,cx+Math.cos(an)*w,cy+Math.sin(an)*w); gx.addColorStop(0,'rgba('+col+',.35)'); gx.addColorStop(1,'rgba('+col+',0)'); c.fillStyle=gx; c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx+Math.cos(an-.05)*w,cy+Math.sin(an-.05)*w); c.lineTo(cx+Math.cos(an+.05)*w,cy+Math.sin(an+.05)*w); c.closePath(); c.fill(); }
  for(var k=0;k<22;k++){ var col2=['255,90,90','255,200,70','90,220,130','90,170,255','190,120,255'][k%5]; glow(c,R()*w,R()*h,s*(8+R()*16),'rgba('+col2+',.75)'); } c.restore();
  c.save(); c.translate(cx,cy); c.rotate(Math.PI/4); c.shadowColor='rgba(220,210,255,.9)'; c.shadowBlur=s*30; c.fillStyle=lin(c,-cs/2,-cs/2,cs/2,cs/2,[[0,'rgba(255,255,255,.75)'],[.5,'rgba(200,220,255,.35)'],[1,'rgba(255,255,255,.6)']]); rr(c,-cs/2,-cs/2,cs,cs,cs*.1); c.fill(); c.shadowBlur=0;
  c.strokeStyle='rgba(255,255,255,.9)'; c.lineWidth=s*2; rr(c,-cs/2,-cs/2,cs,cs,cs*.1); c.stroke(); c.lineWidth=s*1.2; c.strokeStyle='rgba(255,255,255,.55)'; [-1,1].forEach(function(k2){ c.beginPath(); c.moveTo(k2*cs/6,-cs/2); c.lineTo(k2*cs/6,cs/2); c.stroke(); c.beginPath(); c.moveTo(-cs/2,k2*cs/6); c.lineTo(cs/2,k2*cs/6); c.stroke(); }); c.restore();
  calm(c,w,h,.2); vign(c,w,h,.35); }};
/* 106 Speed Lines: race car blasting through motion streaks */
A[106]={ink:'#ffffff',glow:'rgba(255,90,78,.8)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,w,h,[[0,'#120814'],[1,'#2a0a12']])); glow(c,w*.62,h*.55,Math.max(w,h)*.5,'rgba(255,60,60,.32)');
  c.save(); c.globalCompositeOperation='lighter'; for(var i=0;i<60;i++){ var y=R()*h, x=R()*w, l=w*(.1+R()*.4); c.strokeStyle=['rgba(255,90,78,','rgba(255,210,60,','rgba(255,255,255,'][i%3]+(.2+R()*.5)+')'; c.lineWidth=s*(1+R()*3); c.beginPath(); c.moveTo(x,y); c.lineTo(x-l,y); c.stroke(); } c.restore();
  c.save(); c.translate(w*.6,h*.56); var k=s*1.4; c.fillStyle='rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(0,k*30,k*90,k*10,0,0,TAU); c.fill();
  c.fillStyle=lin(c,0,-k*30,0,k*20,[[0,'#ff7a6e'],[1,'#c2231a']]); c.beginPath(); c.moveTo(-k*85,k*18); c.lineTo(-k*70,-k*6); c.quadraticCurveTo(-k*50,-k*28,-k*10,-k*28); c.lineTo(k*40,-k*26); c.quadraticCurveTo(k*70,-k*20,k*90,k*8); c.lineTo(k*90,k*18); c.closePath(); c.fill();
  c.fillStyle='rgba(180,220,255,.85)'; c.beginPath(); c.moveTo(-k*36,-k*24); c.lineTo(-k*6,-k*24); c.lineTo(k*2,-k*8); c.lineTo(-k*44,-k*8); c.closePath(); c.fill(); c.fillStyle='#ffd21a'; c.fillRect(-k*80,k*2,k*168,k*4);
  [-k*52,k*55].forEach(function(x){ c.fillStyle='#111'; c.beginPath(); c.arc(x,k*20,k*14,0,TAU); c.fill(); c.fillStyle='#9aa0a8'; c.beginPath(); c.arc(x,k*20,k*6,0,TAU); c.fill(); });
  c.globalCompositeOperation='lighter'; glow(c,-k*95,k*8,k*30,'rgba(90,190,255,.9)'); c.restore();
  calm(c,w,h,.2); vign(c,w,h,.4); }};

var SK=[{i:101,n:'Neon Breaker',css:'linear-gradient(180deg,#140326,#05010d)'},{i:102,n:'Frost Core',css:'linear-gradient(180deg,#06223a,#020a14)'},{i:103,n:'Magma Rush',css:'linear-gradient(180deg,#2a0d09,#140504)'},{i:104,n:'King Cube',css:'linear-gradient(180deg,#2a0a3a,#12041c)'},{i:105,n:'Prism',css:'linear-gradient(135deg,#06070d,#1a1d2a)'},{i:106,n:'Speed Lines',css:'linear-gradient(135deg,#120814,#2a0a12)'}];
var ember=['rgba(255,170,60,1)','rgba(255,110,30,1)','rgba(255,220,120,1)'];
var CFG={101:[['glitch',{}],['twinkle',{n:18,col:'rgba(255,120,230,1)'}]],
 102:[['fall',{n:55,col:'#eafcff',v:16}],['sheen',{per:4.5,col:'rgba(200,245,255,.18)'}]],
 103:[['rise',{n:55,col:ember,v:60}],['pulse',{x:.5,y:1.05,r:.7,col:'rgba(255,90,20,1)',a:.32,per:2.2}]],
 104:[['twinkle',{n:26,col:'rgba(255,215,90,1)'}],['pulse',{x:.5,y:.58,r:.4,col:'rgba(255,200,60,1)',a:.25,per:2.8}]],
 105:[['sheen',{per:3,col:'rgba(255,255,255,.22)'}],['orbit',{n:50,r:.36,flat:.3,col:['rgba(255,80,80,1)','rgba(255,210,60,1)','rgba(60,200,120,1)','rgba(80,140,255,1)']}]],
 106:[['drift',{n:8,col:['rgba(255,90,78,1)','rgba(255,210,60,1)'],a:.22}],['sheen',{per:2.2,col:'rgba(255,255,255,.16)'}]]};
var FS={101:['pixels','shock'],102:['snow','shatter'],103:['embers','meteor'],104:['firework','coins'],105:['rainbow','sparkle'],106:['shock','meteor']};
function wire(){ if(!window.CW_PADFX) return; if(CW_PADFX.cfg) Object.keys(CFG).forEach(function(k){ CW_PADFX.cfg[k]=CFG[k]; }); if(CW_PADFX.fset) Object.keys(FS).forEach(function(k){ CW_PADFX.fset[k]=FS[k]; }); }
wire();
if(PL.onUpd8) PL.onUpd8(function(){ wire(); var L=PL.skins.list, has=function(i){ return L.some(function(k){ return k.i===i; }); };
  SK.forEach(function(s){ if(!has(s.i)) L.push({i:s.i,n:s.n,ty:'forge',cost:2600,css:s.css,need:'New in Update 8'}); });
  if(/^#(garage|timer)/.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange')); });
})();
