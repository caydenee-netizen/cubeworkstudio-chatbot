/* Hand-painted artwork for the 15 Update 3 pad skins (ids 70 to 84). Same format as padart.js: draw(ctx,w,h,R). */
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

/* 70 Dunes: layered sand ridges under a hot sun */
A[70]={ink:'#fff3d6',glow:'rgba(255,190,110,.65)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#ffd9a0'],[.45,'#ffb869'],[1,'#c4743a']])); glow(c,w*.75,h*.2,Math.max(w,h)*.45,'rgba(255,245,200,.95)');
  c.fillStyle='#fff6d0'; c.beginPath(); c.arc(w*.75,h*.2,s*26,0,TAU); c.fill();
  var cols=['#e8a860','#d58f4a','#b9743a','#8e5429'];
  for(var L=0;L<4;L++){ c.fillStyle=cols[L]; c.beginPath(); c.moveTo(0,h); for(var x=0;x<=w;x+=6) c.lineTo(x,h*(.42+L*.16)+Math.sin(x/w*(3+L)+L*1.7)*h*.07); c.lineTo(w,h); c.fill();
    c.strokeStyle='rgba(255,235,190,.55)'; c.lineWidth=s*1.6; c.beginPath(); for(var x2=0;x2<=w;x2+=6){ var y=h*(.42+L*.16)+Math.sin(x2/w*(3+L)+L*1.7)*h*.07; x2?c.lineTo(x2,y):c.moveTo(x2,y); } c.stroke(); }
  vign(c,w,h,.3); }};
/* 71 Neon Rain: dark street, glowing signs, rain streaks */
A[71]={ink:'#ffe6fb',glow:'rgba(255,60,200,.7)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#0a0618'],[1,'#1a0b33']]));
  for(var i=0;i<9;i++){ var bx=i/9*w, bw=w/9*.9, bh=h*(.3+R()*.4); c.fillStyle='#0d0820'; c.fillRect(bx,h-bh,bw,bh); for(var k=0;k<7;k++) if(R()<.5){ c.fillStyle='rgba(255,'+(R()<.5?'80,200':'220,90')+',.6)'; c.fillRect(bx+R()*bw*.8,h-bh+R()*bh*.9,s*5,s*3); } }
  var neon=['#ff2bd6','#2be3ff','#ffd22b']; for(var n=0;n<5;n++){ var x=R()*w*.8+w*.05, y=R()*h*.5+h*.1, ww=s*(30+R()*40); c.save(); c.shadowColor=neon[n%3]; c.shadowBlur=s*18; c.strokeStyle=neon[n%3]; c.lineWidth=s*3.4; c.strokeRect(x,y,ww,s*16); c.restore(); }
  c.strokeStyle='rgba(190,210,255,.35)'; c.lineWidth=Math.max(1,s*1.1); for(var r=0;r<150;r++){ var rx=R()*w, ry=R()*h; c.beginPath(); c.moveTo(rx,ry); c.lineTo(rx-s*5,ry+s*22); c.stroke(); }
  glow(c,w/2,h,Math.max(w,h)*.6,'rgba(255,43,214,.35)'); vign(c,w,h,.4); }};
/* 72 Pixel Meadow: 8-bit sky, clouds and chunky hills */
A[72]={ink:'#fff',glow:'rgba(120,220,120,.6)',draw:function(c,w,h,R){ var q=Math.max(6,s0(w,h)*14);
  function s0(a,b){ return M(a,b); }
  fill(c,w,h,'#6ec6ff'); for(var i=0;i<4;i++){ var cx=Math.floor(R()*w/q)*q, cy=Math.floor((.08+R()*.3)*h/q)*q; c.fillStyle='#fff'; for(var k=0;k<5;k++) c.fillRect(cx+k*q,cy-(k%4===0?0:q),q,q*(k%4===0?1:2)); }
  c.fillStyle='#ffe14a'; c.fillRect(w*.8,h*.1,q*3,q*3);
  for(var x=0;x<w;x+=q){ var hh=Math.floor((h*.62+Math.sin(x/w*7)*h*.08)/q)*q; c.fillStyle='#3fae3f'; c.fillRect(x,hh,q,q); c.fillStyle='#2b7d2b'; c.fillRect(x,hh+q,q,h-hh); c.fillStyle='#8b5a2b'; c.fillRect(x,Math.floor(h*.88/q)*q,q,h); }
  for(var f=0;f<14;f++){ var fx=Math.floor(R()*w/q)*q, fy=Math.floor((.7+R()*.14)*h/q)*q; c.fillStyle=['#ff5c8a','#ffd22b','#fff'][f%3]; c.fillRect(fx,fy,q,q); }
  vign(c,w,h,.15); }};
/* 73 Nebula: purple and teal gas clouds with stars */
A[73]={ink:'#f0e8ff',glow:'rgba(170,110,255,.7)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,'#05030f'); c.save(); c.globalCompositeOperation='lighter';
  var cl=['rgba(150,70,255,','rgba(40,200,220,','rgba(255,90,170,']; for(var i=0;i<16;i++){ glow(c,R()*w,R()*h,s*(60+R()*90),cl[i%3]+(.35+R()*.3)+')',1); } c.restore();
  for(var k=0;k<160;k++){ c.fillStyle='rgba(255,255,255,'+(.3+R()*.7)+')'; var z=R()<.07?s*2.2:s*1.1; c.fillRect(R()*w,R()*h,z,z); }
  for(var b=0;b<5;b++) star(c,R()*w,R()*h,s*(5+R()*8),'rgba(255,255,255,.9)'); vign(c,w,h,.35); }};
/* 74 Coral Reef: bright water, corals and fish */
A[74]={ink:'#e9fffb',glow:'rgba(255,120,120,.6)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#59e0e0'],[.6,'#0b8fb0'],[1,'#03405e']]));
  c.fillStyle='#f2d29b'; c.fillRect(0,h*.9,w,h*.1);
  var cc=['#ff6b6b','#ff9f43','#ff5fa2','#b66bff']; for(var i=0;i<14;i++){ var x=R()*w, base=h*.92, ht=h*(.15+R()*.3); c.strokeStyle=cc[i%4]; c.lineWidth=s*(5+R()*5); c.lineCap='round'; c.beginPath(); c.moveTo(x,base); c.lineTo(x,base-ht); c.moveTo(x,base-ht*.5); c.lineTo(x+(R()-.5)*s*60,base-ht*.9); c.moveTo(x,base-ht*.6); c.lineTo(x-(R()*s*50),base-ht*.95); c.stroke(); }
  for(var f=0;f<8;f++){ var fx=R()*w, fy=h*(.15+R()*.5); c.fillStyle=['#ffb02e','#ff6b3d','#fff'][f%3]; c.beginPath(); c.ellipse(fx,fy,s*14,s*7,0,0,TAU); c.fill(); c.beginPath(); c.moveTo(fx-s*12,fy); c.lineTo(fx-s*24,fy-s*8); c.lineTo(fx-s*24,fy+s*8); c.fill(); c.fillStyle='#000'; c.fillRect(fx+s*6,fy-s*2,s*2.5,s*2.5); }
  c.save(); c.globalCompositeOperation='lighter'; for(var r=0;r<5;r++){ var rx=R()*w; c.fillStyle=lin(c,rx,0,rx+s*40,h,[[0,'rgba(255,255,255,.28)'],[1,'rgba(255,255,255,0)']]); c.beginPath(); c.moveTo(rx,0); c.lineTo(rx+s*20,0); c.lineTo(rx+s*80,h); c.lineTo(rx+s*30,h); c.fill(); } c.restore(); vign(c,w,h,.3); }};
/* 75 Blueprint: technical drawing on blue paper */
A[75]={ink:'#e8f4ff',glow:'rgba(120,180,255,.55)',draw:function(c,w,h,R){ var s=M(w,h), g=s*12;
  fill(c,w,h,'#10408a'); c.strokeStyle='rgba(255,255,255,.15)'; c.lineWidth=1; for(var x=0;x<w;x+=g){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,h); c.stroke(); } for(var y=0;y<h;y+=g){ c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); }
  c.strokeStyle='rgba(255,255,255,.9)'; c.lineWidth=s*1.6; var cx=w/2, cy=h/2, k=s*50; c.strokeRect(cx-k*1.4,cy-k*.9,k*2.8,k*1.8); c.beginPath(); c.arc(cx,cy,k*.6,0,TAU); c.stroke(); c.beginPath(); c.moveTo(cx-k*1.4,cy); c.lineTo(cx+k*1.4,cy); c.moveTo(cx,cy-k*.9); c.lineTo(cx,cy+k*.9); c.stroke();
  c.setLineDash([s*6,s*4]); c.beginPath(); c.moveTo(cx-k*1.8,cy-k*1.2); c.lineTo(cx+k*1.8,cy-k*1.2); c.moveTo(cx-k*1.8,cy+k*1.2); c.lineTo(cx+k*1.8,cy+k*1.2); c.stroke(); c.setLineDash([]);
  c.fillStyle='rgba(255,255,255,.85)'; c.font='bold '+Math.round(s*10)+'px monospace'; c.fillText('A-A  2.80',cx-k*1.4,cy-k*1.0); c.fillText('R0.60',cx+k*.1,cy+k*.4); vign(c,w,h,.35); }};
/* 76 Autumn Leaves: warm gradient with scattered maple leaves */
A[76]={ink:'#fff0dc',glow:'rgba(255,150,60,.65)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,w,h,[[0,'#ffcf6b'],[.5,'#e8782f'],[1,'#7a2418']]));
  var cl=['#d9381e','#f08a24','#f7c948','#a3321a','#c96a14']; for(var i=0;i<46;i++){ var x=R()*w, y=R()*h, r=s*(8+R()*14); c.save(); c.translate(x,y); c.rotate(R()*TAU); c.fillStyle=cl[i%5]; c.globalAlpha=.92; c.beginPath(); for(var k=0;k<10;k++){ var a=k*TAU/10, rr=k%2?r*.55:r; c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr); } c.closePath(); c.fill(); c.strokeStyle='rgba(60,20,0,.4)'; c.lineWidth=1; c.beginPath(); c.moveTo(0,0); c.lineTo(r*.9,0); c.stroke(); c.restore(); }
  glow(c,w*.2,h*.1,Math.max(w,h)*.5,'rgba(255,240,190,.5)'); vign(c,w,h,.4); }};
/* 77 Volcano: eruption silhouette, red sky, sparks */
A[77]={ink:'#fff0e0',glow:'rgba(255,90,30,.8)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#1a0505'],[.55,'#7a1d0a'],[1,'#ff6a1a']]));
  c.fillStyle='#120606'; c.beginPath(); c.moveTo(0,h); c.lineTo(w*.2,h*.7); c.lineTo(w*.38,h*.5); c.lineTo(w*.45,h*.38); c.lineTo(w*.55,h*.38); c.lineTo(w*.62,h*.5); c.lineTo(w*.8,h*.7); c.lineTo(w,h); c.fill();
  c.save(); c.globalCompositeOperation='lighter'; glow(c,w/2,h*.34,s*130,'rgba(255,140,40,.9)'); c.strokeStyle='rgba(255,140,40,.9)'; c.lineWidth=s*3; c.beginPath(); c.moveTo(w*.48,h*.4); c.lineTo(w*.43,h*.62); c.lineTo(w*.38,h*.9); c.moveTo(w*.53,h*.4); c.lineTo(w*.58,h*.65); c.lineTo(w*.63,h*.95); c.stroke();
  for(var i=0;i<60;i++){ var x=w/2+(R()-.5)*s*160, y=h*.34-R()*h*.34; glow(c,x,y,s*(2+R()*4),'rgba(255,'+(120+R()*100|0)+',40,.95)',1); } c.restore(); vign(c,w,h,.4); }};
/* 78 Prism Glass: faceted refracting crystal planes */
A[78]={ink:'#f5f0ff',glow:'rgba(200,170,255,.65)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,'#1a1633'); var cols=['#7be0ff','#b28cff','#ff8ad6','#ffe27a','#8affc2'];
  for(var i=0;i<26;i++){ var x=R()*w, y=R()*h, a=R()*TAU, d=s*(50+R()*90); c.fillStyle=cols[i%5]; c.globalAlpha=.28; poly(c,[[x,y],[x+Math.cos(a)*d,y+Math.sin(a)*d],[x+Math.cos(a+1.9)*d*.8,y+Math.sin(a+1.9)*d*.8]]); c.fill(); c.globalAlpha=.7; c.strokeStyle='rgba(255,255,255,.55)'; c.lineWidth=1; c.stroke(); } c.globalAlpha=1;
  c.save(); c.globalCompositeOperation='lighter'; for(var r=0;r<5;r++){ c.strokeStyle=cols[r]; c.globalAlpha=.55; c.lineWidth=s*3; c.beginPath(); c.moveTo(w*.15,h*(.2+r*.14)); c.lineTo(w*.85,h*(.7-r*.06)); c.stroke(); } c.restore(); vign(c,w,h,.35); }};
/* 79 Arcade Carpet: neon shapes on dark carpet */
A[79]={ink:'#ffffff',glow:'rgba(120,255,230,.6)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,'#10062a'); var cols=['#ff2bd6','#2be3ff','#ffd22b','#7bff6a'];
  for(var i=0;i<42;i++){ var x=R()*w, y=R()*h, z=s*(8+R()*16), col=cols[i%4]; c.strokeStyle=col; c.fillStyle=col; c.lineWidth=s*2.2; c.save(); c.translate(x,y); c.rotate(R()*TAU); var t=i%4; if(t===0){ c.beginPath(); c.moveTo(0,-z); c.lineTo(z,z); c.lineTo(-z,z); c.closePath(); c.stroke(); } else if(t===1){ c.beginPath(); c.arc(0,0,z,0,TAU); c.stroke(); } else if(t===2){ c.strokeRect(-z,-z,z*2,z*2); } else { c.beginPath(); c.moveTo(-z,0); c.lineTo(0,-z*.5); c.lineTo(z,0); c.lineTo(0,z*.5); c.lineTo(-z,0); c.stroke(); } c.restore(); }
  c.save(); c.globalCompositeOperation='lighter'; for(var g=0;g<6;g++) glow(c,R()*w,R()*h,s*50,cols[g%4]==='#ffd22b'?'rgba(255,210,43,.25)':'rgba(120,80,255,.28)'); c.restore(); calm(c,w,h,.2); vign(c,w,h,.45); }};
/* 80 Moonlit Lake: big moon and reflection on dark water */
A[80]={ink:'#eaf2ff',glow:'rgba(170,200,255,.65)',draw:function(c,w,h,R){ var s=M(w,h), hz=h*.58;
  fill(c,w,h,lin(c,0,0,0,hz,[[0,'#050a1e'],[1,'#1b2a5c']])); for(var i=0;i<70;i++){ c.fillStyle='rgba(255,255,255,'+(R()*.8)+')'; c.fillRect(R()*w,R()*hz,s*1.2,s*1.2); }
  glow(c,w*.5,h*.27,s*160,'rgba(190,215,255,.55)'); c.fillStyle='#f4f8ff'; c.beginPath(); c.arc(w*.5,h*.27,s*36,0,TAU); c.fill(); c.fillStyle='rgba(150,170,210,.45)'; c.beginPath(); c.arc(w*.5-s*10,h*.27-s*6,s*8,0,TAU); c.arc(w*.5+s*12,h*.27+s*10,s*6,0,TAU); c.fill();
  c.fillStyle='#050813'; c.beginPath(); c.moveTo(0,hz); for(var x=0;x<=w;x+=10) c.lineTo(x,hz-Math.abs(Math.sin(x/w*5))*h*.07); c.lineTo(w,hz); c.fill();
  fill2(c,0,hz,w,h-hz,lin(c,0,hz,0,h,[[0,'#16224a'],[1,'#050a1c']]));
  for(var k=0;k<14;k++){ var ww=s*(60-k*3.5); c.fillStyle='rgba(215,230,255,'+(.7-k*.045)+')'; c.fillRect(w/2-ww/2+Math.sin(k*1.9)*s*5,hz+k*h*.028,ww,Math.max(1.5,h*.009)); }
  vign(c,w,h,.35);
  function fill2(c,x,y,ww,hh,st){ c.fillStyle=st; c.fillRect(x,y,ww,hh); } }};
/* 81 Honeycomb: golden hex cells with a glow */
A[81]={ink:'#4a2a00',glow:'rgba(255,190,40,.7)',draw:function(c,w,h,R){ var s=M(w,h), r=s*26;
  fill(c,w,h,'#3a2200');
  for(var row=-1;row<h/(r*1.5)+2;row++) for(var col=-1;col<w/(r*1.74)+2;col++){ var x=col*r*1.74+(row%2?r*.87:0), y=row*r*1.5, f=R(); c.fillStyle=lin(c,x,y-r,x,y+r,[[0,f<.3?'#ffe27a':'#ffc233'],[1,f<.3?'#ffb300':'#e08a00']]); c.beginPath(); for(var k=0;k<6;k++){ var a=k*Math.PI/3+Math.PI/6; k?c.lineTo(x+Math.cos(a)*r*.93,y+Math.sin(a)*r*.93):c.moveTo(x+Math.cos(a)*r*.93,y+Math.sin(a)*r*.93); } c.closePath(); c.fill(); c.strokeStyle='rgba(120,60,0,.7)'; c.lineWidth=s*2; c.stroke(); c.fillStyle='rgba(255,255,255,.18)'; c.fillRect(x-r*.4,y-r*.6,r*.5,r*.18); }
  glow(c,w*.3,h*.2,Math.max(w,h)*.5,'rgba(255,240,170,.5)'); vign(c,w,h,.35); }};
/* 82 Update 3: three crossing cubes of light */
A[82]={ink:'#e6f4ff',glow:'rgba(110,200,255,.75)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,w,h,[[0,'#06122e'],[.5,'#14337a'],[1,'#0a5a6a']]));
  c.save(); c.globalCompositeOperation='lighter'; for(var i=0;i<3;i++){ var cx=w*(.3+i*.2), cy=h*(.5+(i%2?.08:-.08)), k=s*(48+i*8); [[3,'rgba(120,200,255,.3)'],[1.4,'rgba(230,248,255,.95)']].forEach(function(p){ c.strokeStyle=p[1]; c.lineWidth=s*p[0]*2; c.strokeRect(cx-k,cy-k,k*2,k*2); c.beginPath(); c.moveTo(cx-k,cy-k); c.lineTo(cx-k*.5,cy-k*1.5); c.lineTo(cx+k*1.5,cy-k*1.5); c.lineTo(cx+k,cy-k); c.moveTo(cx+k*1.5,cy-k*1.5); c.lineTo(cx+k*1.5,cy+k*.5); c.lineTo(cx+k,cy+k); c.stroke(); }); glow(c,cx,cy,k*2,'rgba(90,180,255,.35)'); }
  for(var t=0;t<40;t++) glow(c,R()*w,R()*h,s*(2+R()*4),'rgba(200,235,255,.9)',1); c.restore();
  c.fillStyle='rgba(255,255,255,.9)'; c.font='900 '+Math.round(s*30)+'px sans-serif'; c.textAlign='center'; c.fillText('3',w/2,h*.2); vign(c,w,h,.35); }};
/* 83 Starlight Cube: velvet night with a cube of stars */
A[83]={ink:'#fff6dc',glow:'rgba(255,225,140,.75)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,rad(c,w/2,h/2,0,Math.hypot(w,h)*.6,[[0,'#1d1450'],[1,'#04030f']]));
  for(var i=0;i<130;i++){ c.fillStyle='rgba(255,255,255,'+(.2+R()*.8)+')'; var z=s*(.8+R()*1.4); c.fillRect(R()*w,R()*h,z,z); }
  var cx=w/2, cy=h/2, k=s*52, pts=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(function(p){ var x=p[0],y=p[1],z=p[2], a=.6,b=.5, x2=x*Math.cos(a)+z*Math.sin(a), z2=-x*Math.sin(a)+z*Math.cos(a), y2=y*Math.cos(b)-z2*Math.sin(b); return [cx+x2*k,cy+y2*k]; });
  c.save(); c.globalCompositeOperation='lighter'; c.strokeStyle='rgba(255,225,140,.85)'; c.lineWidth=s*1.6; [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(function(e){ c.beginPath(); c.moveTo(pts[e[0]][0],pts[e[0]][1]); c.lineTo(pts[e[1]][0],pts[e[1]][1]); c.stroke(); }); pts.forEach(function(p){ glow(c,p[0],p[1],s*14,'rgba(255,230,150,.9)',1); }); glow(c,cx,cy,k*1.6,'rgba(255,215,120,.25)'); c.restore(); vign(c,w,h,.4); }};
/* 84 Platinum Edition: brushed platinum with a prism sheen */
A[84]={ink:'#222',glow:'rgba(220,235,255,.7)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,w,h,[[0,'#f4f6fa'],[.25,'#b9c0cc'],[.5,'#fbfcff'],[.75,'#98a1b0'],[1,'#e8ecf3']]));
  c.globalAlpha=.1; for(var i=0;i<280;i++){ c.strokeStyle=R()<.5?'#fff':'#566'; c.lineWidth=Math.max(.6,s*.6); var y=R()*h; c.beginPath(); c.moveTo(0,y); c.lineTo(w,y+(R()-.5)*s*3); c.stroke(); } c.globalAlpha=1;
  c.save(); c.globalCompositeOperation='lighter'; var rb=['rgba(255,80,120,.25)','rgba(255,220,90,.25)','rgba(90,255,170,.25)','rgba(90,170,255,.25)','rgba(190,110,255,.25)']; rb.forEach(function(col,k){ c.fillStyle=lin(c,0,0,w,h,[[.28+k*.025,'rgba(0,0,0,0)'],[.33+k*.025,col],[.38+k*.025,'rgba(0,0,0,0)']]); c.fillRect(0,0,w,h); }); c.restore();
  c.strokeStyle='rgba(255,255,255,.9)'; c.lineWidth=s*3; c.strokeRect(s*6,s*6,w-s*12,h-s*12); for(var sp=0;sp<12;sp++) star(c,R()*w,R()*h,s*(3+R()*6),'rgba(255,255,255,.95)'); vign(c,w,h,.2); }};
})();
