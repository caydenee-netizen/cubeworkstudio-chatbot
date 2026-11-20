/* Hand-painted artwork for the 12 older update pad skins (ids 43 to 54: Sunset to Midnight Grid). Same format as padart.js: draw(ctx,w,h,R). */
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
function star(c,x,y,r,col){ c.fillStyle=col; c.beginPath(); for(var i=0;i<8;i++){ var a=i*Math.PI/4, rr=i%2?r*.28:r; c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr); } c.closePath(); c.fill(); }
function poly(c,pts){ c.beginPath(); pts.forEach(function(p,i){ i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]); }); c.closePath(); }

/* 43 Sunset: sun melting into the sea, pink and violet sky */
A[43]={ink:'#fff0e0',glow:'rgba(255,150,90,.7)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#2b1055'],[.4,'#c9487b'],[.62,'#ff9a5a'],[1,'#ffd9a0']]));
  for(var i=0;i<60;i++){ c.fillStyle='rgba(255,255,255,'+(R()*.6)+')'; c.fillRect(R()*w,R()*h*.4,s*1.4,s*1.4); }
  glow(c,w/2,h*.62,Math.max(w,h)*.6,'rgba(255,190,110,.9)');
  c.fillStyle=lin(c,0,h*.38,0,h*.62,[[0,'#fff1b8'],[1,'#ff8a4a']]); c.beginPath(); c.arc(w/2,h*.62,s*58,Math.PI,0); c.fill();
  c.fillStyle='#1a0b33'; c.fillRect(0,h*.62,w,h*.38);
  for(var k=0;k<16;k++){ var yy=h*.64+k*h*.022, ww=s*(120-k*5)+R()*s*14; c.fillStyle='rgba(255,'+(170-k*5)+',110,'+(.85-k*.05)+')'; c.fillRect(w/2-ww/2,yy,ww,Math.max(1,h*.008)); }
  c.fillStyle='rgba(255,210,150,.5)'; c.beginPath(); c.moveTo(0,h*.62); for(var x=0;x<=w;x+=10) c.lineTo(x,h*.62-Math.abs(Math.sin(x/w*7))*h*.03); c.lineTo(w,h*.62); c.fill();
  vign(c,w,h,.35); }};
/* 44 Ocean: deep water with caustic light and a wave crest */
A[44]={ink:'#e9fbff',glow:'rgba(80,200,255,.65)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#90e0ef'],[.3,'#0096c7'],[1,'#02213f']]));
  c.save(); c.globalCompositeOperation='lighter'; for(var i=0;i<7;i++){ var x0=R()*w; c.fillStyle=lin(c,x0,0,x0+s*60,h*.8,[[0,'rgba(220,250,255,.45)'],[1,'rgba(220,250,255,0)']]); c.beginPath(); c.moveTo(x0,0); c.lineTo(x0+s*30,0); c.lineTo(x0+s*110,h*.85); c.lineTo(x0+s*50,h*.85); c.fill(); } c.restore();
  for(var L=0;L<4;L++){ c.strokeStyle='rgba(235,252,255,'+(.5-L*.1)+')'; c.lineWidth=s*(2.4-L*.4); var y0=h*(.35+L*.17); c.beginPath(); for(var x=0;x<=w;x+=6){ var y=y0+Math.sin(x/w*(5+L)+L*2)*h*.04; x?c.lineTo(x,y):c.moveTo(x,y); } c.stroke(); }
  for(var b=0;b<30;b++){ var bx=R()*w, by=h*(.3+R()*.7), br=s*(1.5+R()*4); c.strokeStyle='rgba(220,250,255,.55)'; c.lineWidth=s*.8; c.beginPath(); c.arc(bx,by,br,0,TAU); c.stroke(); c.fillStyle='rgba(255,255,255,.7)'; c.fillRect(bx-br*.4,by-br*.4,br*.3,br*.3); }
  vign(c,w,h,.4); }};
/* 45 Forest: layered pines in mist with sun shafts */
A[45]={ink:'#f0ffe6',glow:'rgba(160,230,110,.6)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#d6f0a0'],[.5,'#7fbf5a'],[1,'#0b3d20']]));
  glow(c,w*.2,-h*.1,Math.max(w,h)*.8,'rgba(255,255,200,.8)');
  c.save(); c.globalCompositeOperation='lighter'; for(var r=0;r<5;r++){ c.fillStyle='rgba(255,255,210,.09)'; c.beginPath(); c.moveTo(w*(.05+r*.1),0); c.lineTo(w*(.12+r*.1),0); c.lineTo(w*(.6+r*.12),h); c.lineTo(w*(.4+r*.12),h); c.fill(); } c.restore();
  var cols=['#4f9a46','#2f7a3e','#1c5a30','#0b3d20'];
  for(var L=0;L<4;L++){ var n=7+L*2; c.fillStyle=cols[L]; for(var i=0;i<n;i++){ var x=(i+R()*.6)/n*w, th=h*(.35+L*.1+R()*.12), bs=s*(14+L*5), by=h*(.55+L*.14); for(var t=0;t<4;t++){ c.beginPath(); c.moveTo(x,by-th+t*th*.22); c.lineTo(x+bs*(.5+t*.28),by-th*(.55-t*.14)); c.lineTo(x-bs*(.5+t*.28),by-th*(.55-t*.14)); c.fill(); } c.fillRect(x-s*2,by-th*.2,s*4,th*.25); }
    c.fillStyle='rgba(235,255,225,'+(.12+L*.04)+')'; c.fillRect(0,h*(.5+L*.14),w,h*.1); }
  vign(c,w,h,.4); }};
/* 46 Carbon: woven carbon fibre with a blue edge light */
A[46]={ink:'#e6eaf0',glow:'rgba(120,170,255,.45)',draw:function(c,w,h,R){ var s=M(w,h), q=Math.max(6,s*10);
  fill(c,w,h,'#0d0f12');
  for(var y=0;y<h;y+=q) for(var x=0;x<w;x+=q){ var a=((x/q)+(y/q))%2; c.fillStyle=lin(c,x,y,a?x+q:x,a?y:y+q,[[0,'#2b2f36'],[.5,'#15171b'],[1,'#262a30']]); c.fillRect(x,y,q-1,q-1); }
  c.save(); c.globalCompositeOperation='lighter'; c.fillStyle=lin(c,0,0,w,h,[[0,'rgba(0,0,0,0)'],[.45,'rgba(160,200,255,.0)'],[.5,'rgba(170,210,255,.28)'],[.55,'rgba(160,200,255,0)'],[1,'rgba(0,0,0,0)']]); c.fillRect(0,0,w,h); c.restore();
  c.strokeStyle='rgba(110,170,255,.9)'; c.lineWidth=s*2; c.strokeRect(s*6,s*6,w-s*12,h-s*12); glow(c,w*.5,0,Math.max(w,h)*.6,'rgba(90,150,255,.35)'); glow(c,w*.5,h,Math.max(w,h)*.6,'rgba(90,150,255,.25)');
  calm(c,w,h,.35); vign(c,w,h,.35); }};
/* 47 Aurora: night sky with green and violet curtains over snow */
A[47]={ink:'#eafff6',glow:'rgba(90,255,190,.7)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#03060f'],[.7,'#07253a'],[1,'#0b3a4a']]));
  for(var i=0;i<90;i++){ c.fillStyle='rgba(255,255,255,'+(.2+R()*.7)+')'; c.fillRect(R()*w,R()*h*.7,s*1.2,s*1.2); }
  c.save(); c.globalCompositeOperation='lighter'; var cc=['rgba(60,255,170,','rgba(120,140,255,','rgba(200,90,255,'];
  for(var k=0;k<3;k++){ for(var x=0;x<w;x+=3){ var y=h*(.25+k*.06)+Math.sin(x/w*(4+k)+k*2)*h*.1, len=h*(.3+Math.sin(x/w*9+k)*.1); var g=c.createLinearGradient(0,y-len,0,y+len*.2); g.addColorStop(0,cc[k]+'0)'); g.addColorStop(.7,cc[k]+(.28-k*.05)+')'); g.addColorStop(1,cc[k]+'0)'); c.fillStyle=g; c.fillRect(x,y-len,3,len*1.2); } } c.restore();
  c.fillStyle='#e8f6ff'; c.beginPath(); c.moveTo(0,h); for(var x2=0;x2<=w;x2+=8) c.lineTo(x2,h*.86-Math.sin(x2/w*6)*h*.04); c.lineTo(w,h); c.fill();
  vign(c,w,h,.35); }};
/* 48 Lava Flow: cracked black rock, glowing rivers */
A[48]={ink:'#fff0d8',glow:'rgba(255,110,30,.8)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#2a0a04'],[1,'#120302']]));
  c.save(); c.globalCompositeOperation='lighter'; c.lineJoin='round'; c.lineCap='round';
  for(var i=0;i<12;i++){ var x=R()*w, y=R()*h, ang=R()*TAU, pts=[[x,y]]; for(var k=0;k<14;k++){ ang+=(R()-.5)*1.1; x+=Math.cos(ang)*s*26; y+=Math.sin(ang)*s*26; pts.push([x,y]); }
    [[s*11,'rgba(255,70,10,.16)'],[s*5,'rgba(255,130,30,.5)'],[s*1.8,'rgba(255,230,150,.95)']].forEach(function(p){ c.strokeStyle=p[1]; c.lineWidth=p[0]; c.beginPath(); pts.forEach(function(q,j){ j?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]); }); c.stroke(); }); }
  for(var e=0;e<70;e++){ glow(c,R()*w,R()*h,s*(4+R()*9),'rgba(255,'+(110+R()*90|0)+',30,.8)',.7); } c.restore();
  calm(c,w,h,.3); vign(c,w,h,.45); }};
/* 49 Scanlines: green phosphor monitor with a sweep */
A[49]={ink:'#d8ffe6',glow:'rgba(60,255,130,.7)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,rad(c,w/2,h/2,0,Math.hypot(w,h)*.6,[[0,'#0e3a20'],[1,'#020a05']]));
  c.save(); c.globalCompositeOperation='lighter'; c.fillStyle=lin(c,0,h*.3,0,h*.5,[[0,'rgba(60,255,130,0)'],[.5,'rgba(60,255,130,.28)'],[1,'rgba(60,255,130,0)']]); c.fillRect(0,h*.3,w,h*.2); c.restore();
  c.fillStyle='rgba(0,0,0,.3)'; for(var y=0;y<h;y+=Math.max(3,s*4)) c.fillRect(0,y,w,Math.max(1.5,s*1.6));
  c.fillStyle='rgba(120,255,170,.85)'; c.font='bold '+Math.round(s*12)+'px monospace'; for(var r=0;r<7;r++){ var tx=''; for(var k=0;k<Math.floor(w/(s*8));k++) tx+=R()<.35?(R()<.5?'0':'1'):' '; c.globalAlpha=.18+R()*.25; c.fillText(tx,s*6,h*.12+r*h*.13); } c.globalAlpha=1;
  vign(c,w,h,.5); }};
/* 50 Pulse Ring: concentric neon rings from a bright core */
A[50]={ink:'#e8efff',glow:'rgba(110,150,255,.75)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,rad(c,w/2,h/2,0,Math.hypot(w,h)*.6,[[0,'#16265c'],[1,'#04060f']]));
  c.save(); c.globalCompositeOperation='lighter'; for(var i=0;i<9;i++){ var r=s*(24+i*i*3.4), hu=210+i*14; c.strokeStyle='hsla('+hu+',95%,'+(65-i*2)+'%,'+(.9-i*.09)+')'; c.lineWidth=s*(5-i*.4); c.beginPath(); c.arc(w/2,h/2,r,0,TAU); c.stroke(); c.strokeStyle='hsla('+hu+',95%,70%,'+(.2-i*.02)+')'; c.lineWidth=s*(16-i); c.stroke(); }
  glow(c,w/2,h/2,s*90,'rgba(190,215,255,.95)'); c.restore(); vign(c,w,h,.4); }};
/* 51 Rose Gold: brushed metal with a satin sheen */
A[51]={ink:'#4a2418',glow:'rgba(255,200,180,.6)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,w,h,[[0,'#f9dccf'],[.3,'#d98f7a'],[.5,'#f7c6b6'],[.75,'#c9785f'],[1,'#f2b9a6']]));
  c.globalAlpha=.12; for(var i=0;i<260;i++){ c.strokeStyle=R()<.5?'#fff':'#8a4a3a'; c.lineWidth=Math.max(.6,s*.7); var y=R()*h; c.beginPath(); c.moveTo(0,y); c.lineTo(w,y+(R()-.5)*s*3); c.stroke(); } c.globalAlpha=1;
  c.save(); c.globalCompositeOperation='lighter'; c.fillStyle=lin(c,0,0,w,h,[[.3,'rgba(255,255,255,0)'],[.42,'rgba(255,245,235,.55)'],[.5,'rgba(255,255,255,0)']]); c.fillRect(0,0,w,h); c.restore();
  c.strokeStyle='rgba(255,240,230,.8)'; c.lineWidth=s*2; c.strokeRect(s*7,s*7,w-s*14,h-s*14); for(var sp=0;sp<10;sp++) star(c,R()*w,R()*h,s*(3+R()*5),'rgba(255,255,255,.85)'); calm(c,w,h,.15); vign(c,w,h,.25); }};
/* 52 Checkerboard: tilted chessboard in perspective with a sheen */
A[52]={ink:'#111',glow:'rgba(255,255,255,.55)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,'#d9d9dc'); var n=10;
  for(var r=0;r<n;r++){ var y0=h*Math.pow(r/n,1.6), y1=h*Math.pow((r+1)/n,1.6); for(var k=-n;k<=n*2;k++){ var f0=(y0/h), f1=(y1/h), xa=w/2+(k-n/2)*(w/n)*(.5+f0*.9), xb=w/2+(k+1-n/2)*(w/n)*(.5+f0*.9), xc=w/2+(k+1-n/2)*(w/n)*(.5+f1*.9), xd=w/2+(k-n/2)*(w/n)*(.5+f1*.9); c.fillStyle=((r+k)&1)?'#16161a':'#f0f0f2'; poly(c,[[xa,y0],[xb,y0],[xc,y1],[xd,y1]]); c.fill(); } }
  c.save(); c.globalCompositeOperation='lighter'; glow(c,w*.3,h*.15,Math.max(w,h)*.6,'rgba(255,255,255,.35)'); c.restore();
  c.fillStyle=lin(c,0,0,0,h,[[0,'rgba(255,255,255,.55)'],[.35,'rgba(255,255,255,0)']]); c.fillRect(0,0,w,h); vign(c,w,h,.35); }};
/* 53 Candy Stripes: glossy twisted candy */
A[53]={ink:'#7a1040',glow:'rgba(255,150,200,.7)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,'#fff4f8'); var sw=s*30; c.fillStyle='#ff5c9b'; for(var x=-h;x<w+h;x+=sw*2){ c.beginPath(); c.moveTo(x,0); c.lineTo(x+sw,0); c.lineTo(x+sw-h*.55,h); c.lineTo(x-h*.55,h); c.fill(); }
  c.fillStyle=lin(c,0,0,0,h,[[0,'rgba(255,255,255,.65)'],[.2,'rgba(255,255,255,.08)'],[.5,'rgba(0,0,0,0)'],[1,'rgba(120,0,50,.3)']]); c.fillRect(0,0,w,h);
  c.save(); c.globalCompositeOperation='lighter'; for(var i=0;i<10;i++) star(c,R()*w,R()*h,s*(4+R()*7),'rgba(255,255,255,.95)'); c.restore();
  c.strokeStyle='rgba(255,255,255,.8)'; c.lineWidth=s*3; c.strokeRect(s*5,s*5,w-s*10,h-s*10); vign(c,w,h,.25); }};
/* 54 Midnight Grid: synthwave grid horizon with a neon sun */
A[54]={ink:'#dff6ff',glow:'rgba(80,210,255,.75)',draw:function(c,w,h,R){ var s=M(w,h), hz=h*.52;
  fill(c,w,h,lin(c,0,0,0,hz,[[0,'#05071a'],[1,'#3a1060']]));
  for(var i=0;i<50;i++){ c.fillStyle='rgba(255,255,255,'+(R()*.7)+')'; c.fillRect(R()*w,R()*hz*.8,s*1.2,s*1.2); }
  c.fillStyle=lin(c,0,hz-s*60,0,hz,[[0,'#ffb347'],[.55,'#ff3d8b'],[1,'#7a1fff']]); c.beginPath(); c.arc(w/2,hz,s*62,Math.PI,0); c.fill();
  c.fillStyle='#070a1c'; for(var b=0;b<6;b++) c.fillRect(w/2-s*64,hz-s*(8+b*9),s*128,s*(1.2+b*.5));
  c.fillStyle='#070a1c'; c.fillRect(0,hz,w,h-hz);
  c.save(); c.globalCompositeOperation='lighter'; c.strokeStyle='rgba(79,208,255,.85)'; c.lineWidth=s*1.4;
  for(var v=-12;v<=12;v++){ c.beginPath(); c.moveTo(w/2+v*s*10,hz); c.lineTo(w/2+v*s*70,h); c.stroke(); }
  for(var g=1;g<=9;g++){ var yy=hz+(h-hz)*Math.pow(g/9,2.1); c.globalAlpha=.4+g/15; c.beginPath(); c.moveTo(0,yy); c.lineTo(w,yy); c.stroke(); } c.globalAlpha=1;
  glow(c,w/2,hz,Math.max(w,h)*.55,'rgba(255,60,160,.5)'); c.restore(); vign(c,w,h,.35); }};
})();
