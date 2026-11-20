/* Hand-painted artwork for the 14 Update 4 pad skins (ids 86 to 99). Same format as padart.js: draw(ctx,w,h,R). */
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


/* 86 Sakura Night: moon, branch and falling petals */
A[86]={ink:'#ffe9f2',glow:'rgba(255,150,190,.65)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#150a2a'],[1,'#3a1646']])); glow(c,w*.78,h*.25,Math.max(w,h)*.4,'rgba(255,230,240,.55)'); c.fillStyle='#fff3f7'; c.beginPath(); c.arc(w*.78,h*.25,s*20,0,TAU); c.fill();
  c.strokeStyle='#2a0f22'; c.lineWidth=s*7; c.beginPath(); c.moveTo(0,h*.85); c.bezierCurveTo(w*.3,h*.7,w*.45,h*.4,w*.75,h*.5); c.stroke(); c.lineWidth=s*3.5; c.beginPath(); c.moveTo(w*.35,h*.62); c.lineTo(w*.4,h*.3); c.stroke();
  for(var i=0;i<90;i++){ var x=R()*w, y=R()*h, r=s*(2+R()*4); c.save(); c.translate(x,y); c.rotate(R()*6); c.fillStyle='rgba(255,'+(160+R()*70|0)+',200,'+(.55+R()*.4)+')'; c.beginPath(); c.ellipse(0,0,r*1.5,r*.8,0,0,TAU); c.fill(); c.restore(); }
  vign(c,w,h,.35); }};
/* 87 Glacier: ice shards under an aurora */
A[87]={ink:'#e8fbff',glow:'rgba(120,230,255,.65)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#04122a'],[1,'#0d3d5c']]));
  c.save(); c.globalCompositeOperation='lighter'; for(var a=0;a<3;a++){ c.fillStyle=lin(c,0,0,0,h*.6,[[0,'rgba(0,0,0,0)'],[.5,['rgba(80,255,190,.28)','rgba(90,170,255,.26)','rgba(190,120,255,.22)'][a]],[1,'rgba(0,0,0,0)']]); c.beginPath(); c.moveTo(0,h*.15); for(var x=0;x<=w;x+=8) c.lineTo(x,h*(.18+a*.06)+Math.sin(x/w*5+a*2)*h*.07); c.lineTo(w,h*.6); c.lineTo(0,h*.6); c.fill(); } c.restore();
  for(var i=0;i<9;i++){ var bx=i/8*w, bh=h*(.25+R()*.4); c.fillStyle=lin(c,bx,h-bh,bx+s*30,h,[[0,'#bff4ff'],[1,'#2c7fa8']]); poly(c,[[bx-s*18,h],[bx,h-bh],[bx+s*20,h]]); c.fill(); c.strokeStyle='rgba(255,255,255,.7)'; c.lineWidth=s*1.2; c.stroke(); }
  for(var k=0;k<30;k++) star(c,R()*w,R()*h*.5,s*(1+R()*2.5),'rgba(255,255,255,.9)'); vign(c,w,h,.3); }};
/* 88 Savanna: acacia silhouette against a red sun */
A[88]={ink:'#fff0d8',glow:'rgba(255,120,50,.7)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#3a0f2a'],[.5,'#e8562a'],[1,'#ffc46b']])); glow(c,w*.3,h*.6,Math.max(w,h)*.5,'rgba(255,220,130,.8)'); c.fillStyle='#ffe9a8'; c.beginPath(); c.arc(w*.3,h*.6,s*30,0,TAU); c.fill();
  c.fillStyle='#1a0710'; c.fillRect(0,h*.78,w,h); c.fillRect(w*.7-s*3,h*.45,s*6,h*.35); c.beginPath(); c.ellipse(w*.7,h*.45,s*60,s*16,0,0,TAU); c.fill(); c.beginPath(); c.ellipse(w*.62,h*.52,s*30,s*9,-.2,0,TAU); c.fill(); c.beginPath(); c.ellipse(w*.8,h*.5,s*28,s*8,.2,0,TAU); c.fill();
  for(var b=0;b<5;b++){ var bx=w*(.1+R()*.5), by=h*(.15+R()*.2); c.strokeStyle='#1a0710'; c.lineWidth=s*1.6; c.beginPath(); c.moveTo(bx-s*8,by); c.quadraticCurveTo(bx,by-s*7,bx+s*8,by); c.stroke(); } vign(c,w,h,.3); }};
/* 89 Cyber Grid: falling green code columns */
A[89]={ink:'#d8ffe6',glow:'rgba(40,255,120,.7)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,'#020a06'); c.font='700 '+Math.round(s*13)+'px monospace'; c.textAlign='center';
  for(var x=s*8;x<w;x+=s*15){ var len=4+R()*14|0, y0=R()*h; for(var k=0;k<len;k++){ c.fillStyle=k===len-1?'#d8ffe6':'rgba(40,255,120,'+(.15+.7*k/len)+')'; c.fillText(String.fromCharCode(0x30A0+(R()*60|0)),x,(y0+k*s*14)%h); } }
  c.strokeStyle='rgba(40,255,120,.25)'; c.lineWidth=1; for(var g=0;g<8;g++){ c.beginPath(); c.moveTo(0,h*(.55+g*.07)); c.lineTo(w,h*(.55+g*.07)); c.stroke(); } glow(c,w/2,h*.5,Math.max(w,h)*.5,'rgba(30,255,120,.22)'); vign(c,w,h,.45); }};
/* 90 Lava Lamp: slow glowing blobs */
A[90]={ink:'#fff1e0',glow:'rgba(255,100,60,.7)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#3a0a4a'],[1,'#b01a50']]));
  for(var i=0;i<9;i++){ var x=R()*w, y=R()*h, r=s*(22+R()*44); glow(c,x,y,r*1.8,['rgba(255,140,40,.55)','rgba(255,70,110,.5)','rgba(255,210,70,.45)'][i%3]); c.fillStyle=['#ff8a2a','#ff4f7a','#ffd24a'][i%3]; c.globalAlpha=.85; c.beginPath(); c.arc(x,y,r,0,TAU); c.fill(); c.globalAlpha=1; c.fillStyle='rgba(255,255,255,.28)'; c.beginPath(); c.arc(x-r*.3,y-r*.3,r*.3,0,TAU); c.fill(); }
  vign(c,w,h,.3); }};
/* 91 Deep Forest: dark pines and fireflies */
A[91]={ink:'#eaffdc',glow:'rgba(150,255,120,.6)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#04120e'],[1,'#0b2e1f']])); for(var L=0;L<3;L++){ c.fillStyle=['#0a2a1c','#07201a','#04140f'][L]; for(var i=0;i<8;i++){ var x=(i+R()*.6)/8*w, ph=h*(.35+L*.12+R()*.1), tw=s*(26+L*6); for(var t2=0;t2<3;t2++){ poly(c,[[x-tw+t2*s*3,h*.9-ph+t2*ph*.22+ph*.3],[x,h*.9-ph+t2*ph*.22],[x+tw-t2*s*3,h*.9-ph+t2*ph*.22+ph*.3]]); c.fill(); } c.fillRect(x-s*3,h*.9-ph*.2,s*6,ph*.3); } }
  c.fillStyle='#04140f'; c.fillRect(0,h*.9,w,h); for(var f=0;f<40;f++){ var fx=R()*w, fy=h*(.3+R()*.6); glow(c,fx,fy,s*(8+R()*10),'rgba(190,255,120,.8)'); c.fillStyle='#f4ffc8'; c.beginPath(); c.arc(fx,fy,s*1.6,0,TAU); c.fill(); } vign(c,w,h,.35); }};
/* 92 Candy Swirl: pastel spiral */
A[92]={ink:'#fff',glow:'rgba(255,130,190,.65)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,'#ffd8ec'); c.save(); c.translate(w/2,h/2); var cols=['#ff7ab8','#ffe27a','#7be0ff','#b28cff','#fff'];
  for(var a=0;a<10;a++){ c.fillStyle=cols[a%5]; c.beginPath(); c.moveTo(0,0); for(var t2=0;t2<=1;t2+=.04){ var ang=a*TAU/10+t2*3.2, r=t2*Math.hypot(w,h)*.6; c.lineTo(Math.cos(ang)*r,Math.sin(ang)*r); } for(var t3=1;t3>=0;t3-=.04){ var ang2=(a+.55)*TAU/10+t3*3.2, r2=t3*Math.hypot(w,h)*.6; c.lineTo(Math.cos(ang2)*r2,Math.sin(ang2)*r2); } c.fill(); } c.restore();
  glow(c,w/2,h/2,s*70,'rgba(255,255,255,.7)'); for(var i=0;i<30;i++){ c.fillStyle='rgba(255,255,255,.85)'; c.beginPath(); c.arc(R()*w,R()*h,s*(1+R()*2),0,TAU); c.fill(); } vign(c,w,h,.15); }};
/* 93 Thunder Storm: heavy clouds and a bolt */
A[93]={ink:'#eef4ff',glow:'rgba(150,180,255,.7)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#0a1020'],[1,'#2a3350']])); for(var i=0;i<26;i++){ c.fillStyle='rgba('+(40+R()*40|0)+','+(50+R()*40|0)+','+(80+R()*40|0)+',.45)'; c.beginPath(); c.arc(R()*w,R()*h*.5,s*(26+R()*40),0,TAU); c.fill(); }
  var x=w*.55, y=h*.12; c.save(); c.shadowColor='#bcd0ff'; c.shadowBlur=s*26; c.strokeStyle='#f4f8ff'; c.lineWidth=s*5; c.lineJoin='round'; c.beginPath(); c.moveTo(x,y); for(var k=0;k<6;k++){ x+=(R()-.5)*s*60; y+=h*.13; c.lineTo(x,y); } c.stroke(); c.restore();
  glow(c,w*.55,h*.4,Math.max(w,h)*.5,'rgba(150,180,255,.25)'); c.strokeStyle='rgba(190,210,255,.3)'; c.lineWidth=Math.max(1,s); for(var r=0;r<90;r++){ var rx=R()*w, ry=R()*h; c.beginPath(); c.moveTo(rx,ry); c.lineTo(rx-s*4,ry+s*18); c.stroke(); } vign(c,w,h,.35); }};
/* 94 Zen Garden: raked sand rings around stones */
A[94]={ink:'#fff8e8',glow:'rgba(240,220,170,.55)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,'#e8dcc0'); var st=[[.3,.55,16],[.62,.38,22],[.78,.7,12]]; st.forEach(function(p){ for(var r=1;r<9;r++){ c.strokeStyle='rgba(120,100,70,'+(.4-r*.03)+')'; c.lineWidth=s*1.6; c.beginPath(); c.arc(w*p[0],h*p[1],s*(p[2]+r*9),0,TAU); c.stroke(); } });
  for(var y=h*.1;y<h;y+=s*9){ c.strokeStyle='rgba(120,100,70,.12)'; c.lineWidth=s; c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); }
  st.forEach(function(p){ var g=rad(c,w*p[0]-s*5,h*p[1]-s*6,0,s*p[2]*1.3,[[0,'#8a8a90'],[1,'#34343a']]); c.fillStyle=g; c.beginPath(); c.ellipse(w*p[0],h*p[1],s*p[2],s*p[2]*.78,0,0,TAU); c.fill(); }); vign(c,w,h,.22); }};
/* 95 Retro Wave: striped sun over a neon grid */
A[95]={ink:'#fff0ff',glow:'rgba(255,60,200,.7)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#1a0536'],[.55,'#5a0b6a'],[.56,'#12031f'],[1,'#12031f']])); var cx=w/2, cy=h*.5, r=Math.min(w,h)*.36; c.save(); c.beginPath(); c.arc(cx,cy,r,0,TAU); c.clip(); c.fillStyle=lin(c,0,cy-r,0,cy+r,[[0,'#ffe14a'],[1,'#ff2e9a']]); c.fillRect(cx-r,cy-r,r*2,r*2); c.fillStyle='#12031f'; for(var k=0;k<6;k++) c.fillRect(cx-r,cy+r*(.05+k*.15),r*2,s*(2+k*1.6)); c.restore();
  c.strokeStyle='rgba(255,60,200,.75)'; c.lineWidth=Math.max(1,s*1.3); for(var g=0;g<9;g++){ var y=h*.56+Math.pow(g/8,2)*h*.44; c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); } for(var v=-8;v<=8;v++){ c.beginPath(); c.moveTo(cx+v*s*8,h*.56); c.lineTo(cx+v*s*60,h); c.stroke(); } glow(c,cx,cy,r*2,'rgba(255,60,200,.25)'); vign(c,w,h,.3); }};
/* 96 Galaxy Spiral: arms of stars */
A[96]={ink:'#f0eaff',glow:'rgba(160,120,255,.7)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,'#05020e'); for(var a=0;a<3;a++) for(var i=0;i<260;i++){ var t2=i/260, ang=a*TAU/3+t2*5+(R()-.5)*.5, r=t2*Math.hypot(w,h)*.5, x=w/2+Math.cos(ang)*r+(R()-.5)*s*14, y=h/2+Math.sin(ang)*r*.8+(R()-.5)*s*14; c.fillStyle='hsla('+(240+t2*90)+',90%,'+(60+R()*30)+'%,'+(.9-t2*.6)+')'; c.beginPath(); c.arc(x,y,s*(.8+R()*1.8),0,TAU); c.fill(); }
  glow(c,w/2,h/2,Math.max(w,h)*.28,'rgba(255,230,190,.9)'); glow(c,w/2,h/2,Math.max(w,h)*.5,'rgba(130,90,255,.25)'); for(var k=0;k<60;k++) star(c,R()*w,R()*h,s*(1+R()*2),'rgba(255,255,255,.8)'); vign(c,w,h,.3); }};
/* 97 Update 4: launch-week skin, orange cube beams */
A[97]={ink:'#fff4e6',glow:'rgba(255,150,60,.75)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,rad(c,w/2,h/2,0,Math.hypot(w,h)*.6,[[0,'#3a1608'],[1,'#0b0510']])); c.save(); c.globalCompositeOperation='lighter'; for(var r=0;r<14;r++){ c.fillStyle='rgba(255,150,60,'+(.05+R()*.07)+')'; var a=r/14*TAU; c.beginPath(); c.moveTo(w/2,h/2); c.lineTo(w/2+Math.cos(a)*w,h/2+Math.sin(a)*w); c.lineTo(w/2+Math.cos(a+.12)*w,h/2+Math.sin(a+.12)*w); c.fill(); } c.restore();
  var k=s*44, cx=w/2, cy=h/2; c.lineWidth=s*3; c.strokeStyle='#ffb36b'; c.shadowColor='#ff9a3d'; c.shadowBlur=s*18; poly(c,[[cx,cy-k*1.2],[cx+k,cy-k*.6],[cx+k,cy+k*.6],[cx,cy+k*1.2],[cx-k,cy+k*.6],[cx-k,cy-k*.6]]); c.stroke(); c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx,cy+k*1.2); c.moveTo(cx,cy); c.lineTo(cx+k,cy-k*.6); c.moveTo(cx,cy); c.lineTo(cx-k,cy-k*.6); c.stroke(); c.shadowBlur=0;
  c.fillStyle='#fff'; c.font='900 '+Math.round(s*20)+'px system-ui,sans-serif'; c.textAlign='center'; c.fillText('4',cx,cy+s*7); for(var i=0;i<40;i++) star(c,R()*w,R()*h,s*(1+R()*3),'rgba(255,200,140,.85)'); vign(c,w,h,.3); }};
/* 98 Ember Cube: coals and drifting sparks */
A[98]={ink:'#ffe9d8',glow:'rgba(255,90,40,.75)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#0c0405'],[1,'#3a0d06']])); for(var i=0;i<60;i++){ var x=R()*w, y=h*(.55+R()*.45), r=s*(5+R()*14); c.fillStyle=rad(c,x,y,0,r,[[0,'#ffd07a'],[.5,'#ff5a1a'],[1,'#3a0d06']]); c.beginPath(); c.arc(x,y,r,0,TAU); c.fill(); }
  glow(c,w/2,h*.8,Math.max(w,h)*.6,'rgba(255,90,30,.4)'); for(var k=0;k<70;k++){ var sx=R()*w, sy=R()*h*.8; glow(c,sx,sy,s*6,'rgba(255,170,60,.8)'); c.fillStyle='#ffe0a0'; c.fillRect(sx,sy,s*1.6,s*1.6); } vign(c,w,h,.4); }};
/* 99 Diamond Edition: faceted icy shine */
A[99]={ink:'#f4fdff',glow:'rgba(150,240,255,.8)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,w,h,[[0,'#eafcff'],[.3,'#8fd8f0'],[.55,'#e6f9ff'],[.8,'#6fbfe0'],[1,'#d8f4ff']])); c.lineWidth=Math.max(1,s*1.2);
  for(var i=0;i<26;i++){ var x=R()*w, y=R()*h, a=R()*TAU, r=s*(30+R()*60); poly(c,[[x,y],[x+Math.cos(a)*r,y+Math.sin(a)*r],[x+Math.cos(a+1.1)*r*.8,y+Math.sin(a+1.1)*r*.8]]); c.fillStyle='rgba(255,255,255,'+(.08+R()*.2)+')'; c.fill(); c.strokeStyle='rgba(255,255,255,.55)'; c.stroke(); }
  c.save(); c.globalCompositeOperation='lighter'; c.fillStyle=lin(c,0,0,w,h,[[.4,'rgba(0,0,0,0)'],[.5,'rgba(255,255,255,.55)'],[.6,'rgba(0,0,0,0)']]); c.fillRect(0,0,w,h); c.restore();
  c.strokeStyle='rgba(255,255,255,.9)'; c.lineWidth=s*3; c.strokeRect(s*6,s*6,w-s*12,h-s*12); for(var k=0;k<14;k++) star(c,R()*w,R()*h,s*(3+R()*7),'rgba(255,255,255,.95)'); vign(c,w,h,.15); }};
})();
