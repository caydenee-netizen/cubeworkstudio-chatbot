/* Hand-painted artwork for the 15 Update 2 pad skins (ids 55 to 69). Same format as padart.js: draw(ctx,w,h,R). */
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
/* 55 Sandstone: layered dunes at golden hour */
A[55]={ink:'#fff4dc',glow:'rgba(255,190,90,.6)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#f6c98a'],[.45,'#f3a867'],[1,'#8a4a2a']]));
  glow(c,w*.78,h*.28,Math.max(w,h)*.5,'rgba(255,236,170,.9)');
  c.fillStyle='#fff2c9'; c.beginPath(); c.arc(w*.78,h*.28,s*26,0,TAU); c.fill();
  var cols=['#e2a066','#c98250','#a8643a','#7f4528']; for(var L=0;L<4;L++){ var y0=h*(.42+L*.15); c.fillStyle=lin(c,0,y0-h*.1,0,h,[[0,cols[L]],[1,'#4a2616']]); c.beginPath(); c.moveTo(0,h); for(var x=0;x<=w;x+=6){ c.lineTo(x,y0+Math.sin(x/w*(3+L)+L*1.7)*h*.07+Math.sin(x/w*11+L)*h*.012); } c.lineTo(w,h); c.closePath(); c.fill();
    c.strokeStyle='rgba(255,230,190,'+(.35-L*.06)+')'; c.lineWidth=1.5*s; c.beginPath(); for(var x2=0;x2<=w;x2+=6){ var yy=y0+Math.sin(x2/w*(3+L)+L*1.7)*h*.07+Math.sin(x2/w*11+L)*h*.012; x2?c.lineTo(x2,yy):c.moveTo(x2,yy); } c.stroke(); }
  c.globalAlpha=.25; c.strokeStyle='#fff3d6'; for(var i=0;i<60;i++){ var rx=R()*w, ry=h*(.5+R()*.5); c.lineWidth=s*.8; c.beginPath(); c.moveTo(rx,ry); c.bezierCurveTo(rx+s*10,ry-s*2,rx+s*20,ry+s*2,rx+s*32,ry); c.stroke(); } c.globalAlpha=1;
  for(var k=0;k<500;k++){ c.fillStyle='rgba(255,235,200,'+(.08+R()*.2)+')'; c.fillRect(R()*w,h*.45+R()*h*.55,s*1.1,s*1.1); }
  calm(c,w,h,.32); vign(c,w,h,.4); }};
/* 56 Marble: white stone with dark veins and a gold inlay */
A[56]={ink:'#1b1d24',glow:'rgba(255,255,255,.5)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,w,h,[[0,'#f7f7fa'],[.5,'#e3e5ec'],[1,'#fbfbfd']]));
  for(var m=0;m<26;m++){ c.fillStyle='rgba(190,195,210,'+(.05+R()*.08)+')'; c.beginPath(); c.ellipse(R()*w,R()*h,s*(30+R()*80),s*(10+R()*40),R()*3,0,TAU); c.fill(); }
  for(var v=0;v<9;v++){ var x=R()*w,y=R()*h,a=R()*TAU,len=40+R()*70; c.lineCap='round'; for(var pass=0;pass<2;pass++){ c.strokeStyle=pass?'rgba(40,44,60,'+(.5+R()*.3)+')':'rgba(70,75,95,.18)'; c.lineWidth=(pass?1.1:5)*s*(.5+R()*.8); c.beginPath(); var px=x,py=y; c.moveTo(px,py); var aa=a; for(var q=0;q<len;q++){ aa+=(R()-.5)*.7; px+=Math.cos(aa)*s*4; py+=Math.sin(aa)*s*4; c.lineTo(px,py); if(R()<.04&&pass){ c.stroke(); c.beginPath(); c.moveTo(px,py); aa+=(R()<.5?1:-1)*.9; } } c.stroke(); } }
  var m2=s*10; c.strokeStyle=lin(c,0,0,w,h,[[0,'#8a6a1c'],[.3,'#f4d77a'],[.6,'#b8892a'],[1,'#f9e7a1']]); c.lineWidth=3*s; c.strokeRect(m2,m2,w-m2*2,h-m2*2); c.lineWidth=1*s; c.strokeRect(m2+s*6,m2+s*6,w-m2*2-s*12,h-m2*2-s*12);
  [[m2,m2],[w-m2,m2],[m2,h-m2],[w-m2,h-m2]].forEach(function(p){ star(c,p[0],p[1],s*8,'#e9c566'); });
  c.fillStyle=rad(c,w*.3,h*.2,0,w*.6,[[0,'rgba(255,255,255,.55)'],[1,'rgba(255,255,255,0)']]); c.fillRect(0,0,w,h); vign(c,w,h,.18); }};
/* 57 Wood: oak planks with grain, knots and varnish */
A[57]={ink:'#fff3e0',glow:'rgba(255,170,80,.5)',draw:function(c,w,h,R){ var s=M(w,h), n=Math.max(4,Math.round(h/(s*58))), ph=h/n;
  for(var p=0;p<n;p++){ var y0=p*ph, base=[[146,92,44],[132,80,36],[158,102,52],[120,72,32]][p%4]; c.fillStyle='rgb('+base+')'; c.fillRect(0,y0,w,ph);
    for(var g=0;g<26;g++){ var gy=y0+R()*ph; c.strokeStyle='rgba('+(base[0]-45)+','+(base[1]-35)+','+(base[2]-20)+','+(.15+R()*.25)+')'; c.lineWidth=(.6+R()*1.4)*s; c.beginPath(); for(var x=0;x<=w;x+=10){ var yy=gy+Math.sin(x/w*6+p*2+g)*s*2.5+Math.sin(x/37+g*3)*s*1.2; x?c.lineTo(x,yy):c.moveTo(x,yy); } c.stroke(); }
    if(R()<.7){ var kx=R()*w,ky=y0+ph*.5,kr=s*(7+R()*8); for(var r=3;r>=1;r--){ c.strokeStyle='rgba(60,32,12,'+(.28+r*.12)+')'; c.lineWidth=s*1.3; c.beginPath(); c.ellipse(kx,ky,kr*r/2.2,kr*r/3.6,0,0,TAU); c.stroke(); } }
    c.fillStyle='rgba(30,14,4,.7)'; c.fillRect(0,y0+ph-s*1.6,w,s*1.8); c.fillStyle='rgba(255,220,170,.22)'; c.fillRect(0,y0,w,s*1.2);
    var seam=((p*.37)%1)*w*.8+w*.1; c.fillStyle='rgba(30,14,4,.55)'; c.fillRect(seam,y0,s*1.6,ph); [[seam-s*8],[seam+s*10]].forEach(function(q){ c.fillStyle='rgba(30,20,12,.7)'; c.beginPath(); c.arc(q[0],y0+ph/2,s*1.7,0,TAU); c.fill(); }); }
  c.fillStyle=lin(c,0,0,w,h,[[0,'rgba(255,230,190,.28)'],[.5,'rgba(255,230,190,0)'],[1,'rgba(0,0,0,.25)']]); c.fillRect(0,0,w,h); calm(c,w,h,.38); vign(c,w,h,.4); }};
/* 58 Denim: twill weave with seams, stitching, a patch and a rivet */
A[58]={ink:'#eef4ff',glow:'rgba(110,160,255,.5)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,'#2a4a82'); c.save(); c.globalAlpha=.5; c.strokeStyle='#1c3566'; c.lineWidth=s*1.2; var st=s*3.2; for(var i=-h;i<w;i+=st){ c.beginPath(); c.moveTo(i,0); c.lineTo(i+h,h); c.stroke(); } c.globalAlpha=.3; c.strokeStyle='#5f86c9'; c.lineWidth=s*.8; for(var j=-h+st/2;j<w;j+=st){ c.beginPath(); c.moveTo(j,0); c.lineTo(j+h,h); c.stroke(); } c.restore();
  for(var f=0;f<30;f++){ c.fillStyle='rgba(180,205,245,'+(.04+R()*.06)+')'; c.beginPath(); c.ellipse(R()*w,R()*h,s*(20+R()*50),s*(8+R()*18),R()*3,0,TAU); c.fill(); }
  function seam(y){ c.fillStyle='rgba(10,22,52,.55)'; c.fillRect(0,y-s*1.5,w,s*3); c.strokeStyle='#f0b55a'; c.lineWidth=s*1.8; c.setLineDash([s*7,s*4]); [y-s*7,y+s*7].forEach(function(yy){ c.beginPath(); c.moveTo(0,yy); c.lineTo(w,yy); c.stroke(); }); c.setLineDash([]); }
  seam(h*.18); seam(h*.84);
  var px=w*.8,py=h*.5,pw=s*92,ph=s*70; c.fillStyle='#d96a4a'; c.fillRect(px-pw/2,py-ph/2,pw,ph); for(var q=0;q<12;q++){ c.fillStyle=q%2?'rgba(255,255,255,.12)':'rgba(0,0,0,.1)'; c.fillRect(px-pw/2+q*pw/12,py-ph/2,pw/12,ph); } c.strokeStyle='#ffe0a0'; c.lineWidth=s*1.5; c.setLineDash([s*5,s*3]); c.strokeRect(px-pw/2+s*5,py-ph/2+s*5,pw-s*10,ph-s*10); c.setLineDash([]);
  [[w*.08,h*.5]].forEach(function(p){ c.fillStyle=rad(c,p[0]-s*3,p[1]-s*3,0,s*14,[[0,'#ffe3b0'],[.6,'#b9772f'],[1,'#5b3412']]); c.beginPath(); c.arc(p[0],p[1],s*13,0,TAU); c.fill(); c.strokeStyle='rgba(0,0,0,.45)'; c.lineWidth=s; c.stroke(); });
  calm(c,w,h,.35); vign(c,w,h,.42); }};
/* 59 Ice: faceted crystal with frost cracks and glints */
A[59]={ink:'#06243a',glow:'rgba(160,230,255,.7)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,w,h,[[0,'#e6f9ff'],[.5,'#9fdcf5'],[1,'#5db2e0']]));
  var pts=[]; for(var i=0;i<46;i++) pts.push([R()*w,R()*h]); var cell=s*60;
  for(var gx=0;gx<w;gx+=cell*.5) for(var gy=0;gy<h;gy+=cell*.5){ var best=-1,bd=1e9; pts.forEach(function(p,k){ var d=(p[0]-gx)*(p[0]-gx)+(p[1]-gy)*(p[1]-gy); if(d<bd){ bd=d; best=k; } }); c.fillStyle='rgba('+(best*53%80+160)+','+(best*29%50+215)+',255,'+(.18+(best%5)*.07)+')'; c.fillRect(gx,gy,cell*.5+1,cell*.5+1); }
  c.strokeStyle='rgba(255,255,255,.65)'; c.lineWidth=1.2*s; for(var k2=0;k2<26;k2++){ var a=pts[k2],b=pts[(k2*7+3)%pts.length]; c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo((a[0]+b[0])/2+(R()-.5)*s*18,(a[1]+b[1])/2+(R()-.5)*s*18); c.lineTo(b[0],b[1]); c.stroke(); }
  c.strokeStyle='rgba(60,130,180,.4)'; c.lineWidth=s; for(var k3=0;k3<18;k3++){ var x=R()*w,y=R()*h; c.beginPath(); c.moveTo(x,y); for(var z=0;z<6;z++){ x+=(R()-.3)*s*22; y+=(R()-.5)*s*22; c.lineTo(x,y); } c.stroke(); }
  for(var sp=0;sp<22;sp++){ star(c,R()*w,R()*h,s*(3+R()*7),'rgba(255,255,255,'+(.6+R()*.4)+')'); }
  c.fillStyle=lin(c,0,h,w,0,[[0,'rgba(255,255,255,.35)'],[.4,'rgba(255,255,255,0)'],[1,'rgba(255,255,255,.3)']]); c.fillRect(0,0,w,h); calm(c,w,h,.14); vign(c,w,h,.2); }};
/* 60 Steel Mesh: brushed metal with hex mesh and rivets */
A[60]={ink:'#e8f1ff',glow:'rgba(120,170,255,.5)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,w,h,[[0,'#3a4150'],[.5,'#1f232b'],[1,'#323946']]));
  c.globalAlpha=.16; for(var b=0;b<260;b++){ c.fillStyle=R()<.5?'#fff':'#000'; c.fillRect(0,R()*h,w,R()*1.4*s+.4); } c.globalAlpha=1;
  var r=s*13,hx=r*1.73,hy=r*1.5; for(var row=-1;row*hy<h+hy;row++) for(var col=-1;col*hx<w+hx;col++){ var x=col*hx+(row%2?hx/2:0),y=row*hy; c.beginPath(); for(var k=0;k<6;k++){ var a=Math.PI/6+k*Math.PI/3; c.lineTo(x+Math.cos(a)*r*.92,y+Math.sin(a)*r*.92); } c.closePath(); c.fillStyle='rgba(6,8,12,.85)'; c.fill(); c.strokeStyle='rgba(140,160,190,.55)'; c.lineWidth=s*1.4; c.stroke(); c.strokeStyle='rgba(255,255,255,.18)'; c.lineWidth=s*.8; c.beginPath(); c.moveTo(x-r*.7,y-r*.4); c.lineTo(x,y-r*.8); c.stroke(); }
  var m=s*13; c.fillStyle='rgba(20,24,32,.92)'; c.fillRect(0,0,w,m*1.8); c.fillRect(0,h-m*1.8,w,m*1.8); c.fillRect(0,0,m*1.8,h); c.fillRect(w-m*1.8,0,m*1.8,h);
  c.strokeStyle='rgba(190,205,230,.6)'; c.lineWidth=s*1.4; c.strokeRect(m*1.8,m*1.8,w-m*3.6,h-m*3.6);
  [[m*.9,m*.9],[w-m*.9,m*.9],[m*.9,h-m*.9],[w-m*.9,h-m*.9],[w/2,m*.9],[w/2,h-m*.9]].forEach(function(p){ c.fillStyle=rad(c,p[0]-s*2,p[1]-s*2,0,s*8,[[0,'#f2f6ff'],[.6,'#8b95a8'],[1,'#3a4150']]); c.beginPath(); c.arc(p[0],p[1],s*7,0,TAU); c.fill(); });
  c.strokeStyle='rgba(255,255,255,.35)'; c.lineWidth=s; for(var sc=0;sc<18;sc++){ var x1=R()*w,y1=R()*h; c.beginPath(); c.moveTo(x1,y1); c.lineTo(x1+(R()-.5)*s*60,y1+(R()-.5)*s*14); c.stroke(); }
  calm(c,w,h,.42); vign(c,w,h,.35); }};
/* 61 Polka Dots: glossy candy dots in two sizes */
A[61]={ink:'#3a0f2a',glow:'rgba(255,120,180,.55)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,w,h,[[0,'#fff0f6'],[1,'#ffd9e8']]));
  function dots(step,rr,cols,off){ for(var y=-step;y<h+step;y+=step*.866) for(var x=-step;x<w+step;x+=step){ var xx=x+(Math.round(y/(step*.866))%2?step/2:0)+off,yy=y; var col=cols[Math.abs(Math.round(xx/step*3+yy/step*7))%cols.length]; c.fillStyle='rgba(120,30,70,.18)'; c.beginPath(); c.arc(xx+s*2,yy+s*3,rr,0,TAU); c.fill(); c.fillStyle=rad(c,xx-rr*.35,yy-rr*.4,rr*.1,rr*1.05,[[0,'#fff'],[.25,col],[1,col]]); c.beginPath(); c.arc(xx,yy,rr,0,TAU); c.fill(); c.fillStyle='rgba(255,255,255,.75)'; c.beginPath(); c.ellipse(xx-rr*.35,yy-rr*.4,rr*.28,rr*.16,-.6,0,TAU); c.fill(); } }
  dots(s*58,s*17,['#ff5c9e','#ff8cbd','#ff3e8a'],0); dots(s*58,s*8,['#2ed3c6','#7be7de'],s*29);
  for(var i=0;i<26;i++) star(c,R()*w,R()*h,s*(3+R()*3),'rgba(255,255,255,.9)');
  c.fillStyle='rgba(255,255,255,.55)'; c.fillRect(0,0,w,s*5); calm(c,w,h,.15); vign(c,w,h,.14); }};
/* 62 Zigzag: neon chevrons */
A[62]={ink:'#ffffff',glow:'rgba(255,60,200,.7)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#0d1030'],[1,'#1b0b3d']]));
  var amp=s*26,per=s*56,rows=Math.ceil(h/(s*34))+2; var cols=['#ff2bd6','#18c5ff','#ffd23a','#7a5cff'];
  for(var r=0;r<rows;r++){ var y=r*s*34-amp; var col=cols[r%4]; for(var pass=0;pass<2;pass++){ c.strokeStyle=pass?col:col.replace('#','#'); c.globalAlpha=pass?1:.35; c.lineWidth=(pass?3:10)*s; c.lineJoin='round'; c.shadowColor=col; c.shadowBlur=pass?14*s:0; c.beginPath(); for(var x=-per;x<=w+per;x+=per/2){ var k=Math.round(x/(per/2)); c.lineTo(x,y+(k%2?amp:0)); } c.stroke(); } }
  c.globalAlpha=1; c.shadowBlur=0; for(var i=0;i<40;i++){ star(c,R()*w,R()*h,s*(2+R()*3),'rgba(255,255,255,.75)'); }
  calm(c,w,h,.5); vign(c,w,h,.4); }};
/* 63 Snowfall: winter night, moon, pines and snow */
A[63]={ink:'#f4f9ff',glow:'rgba(170,210,255,.6)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#050d24'],[.6,'#12306a'],[1,'#2a5aa0']]));
  for(var i=0;i<90;i++){ c.fillStyle='rgba(255,255,255,'+(.3+R()*.6)+')'; c.fillRect(R()*w,R()*h*.55,s*(.8+R()*1.2),s*(.8+R()*1.2)); }
  glow(c,w*.2,h*.2,Math.max(w,h)*.4,'rgba(190,220,255,.6)'); c.fillStyle='#f3f8ff'; c.beginPath(); c.arc(w*.2,h*.2,s*20,0,TAU); c.fill(); c.fillStyle='rgba(120,150,210,.4)'; c.beginPath(); c.arc(w*.2+s*6,h*.2-s*3,s*16,0,TAU); c.fill();
  function pine(x,base,ht,col){ c.fillStyle=col; for(var t=0;t<5;t++){ var yy=base-ht*(t/5),ww=ht*.34*(1-t/6.2); c.beginPath(); c.moveTo(x-ww,yy); c.lineTo(x,yy-ht*.3); c.lineTo(x+ww,yy); c.closePath(); c.fill(); } c.fillRect(x-ht*.03,base,ht*.06,ht*.1); }
  c.fillStyle='#1d3f78'; c.beginPath(); c.moveTo(0,h); for(var x=0;x<=w;x+=8) c.lineTo(x,h*.72+Math.sin(x/w*5)*h*.04); c.lineTo(w,h); c.fill();
  for(var p=0;p<14;p++) pine(w*(p/13)+(R()-.5)*s*20,h*(.76+R()*.05),h*(.22+R()*.18),'#0a1a3a');
  c.fillStyle=lin(c,0,h*.8,0,h,[[0,'#eaf4ff'],[1,'#a9c6ee']]); c.beginPath(); c.moveTo(0,h); for(var x2=0;x2<=w;x2+=8) c.lineTo(x2,h*.86+Math.sin(x2/w*7+1)*h*.03); c.lineTo(w,h); c.fill();
  for(var f=0;f<70;f++){ var fx=R()*w,fy=R()*h,fr=s*(1+R()*3.2); c.strokeStyle='rgba(255,255,255,'+(.5+R()*.5)+')'; c.lineWidth=Math.max(.8,fr*.3); for(var a=0;a<3;a++){ var an=a*Math.PI/3; c.beginPath(); c.moveTo(fx-Math.cos(an)*fr,fy-Math.sin(an)*fr); c.lineTo(fx+Math.cos(an)*fr,fy+Math.sin(an)*fr); c.stroke(); } }
  calm(c,w,h,.4); vign(c,w,h,.4); }};
/* 64 Fireflies: forest at dusk with glowing motes */
A[64]={ink:'#f2ffe0',glow:'rgba(210,255,120,.7)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#04120c'],[.6,'#0b2e1c'],[1,'#143d25']]));
  glow(c,w*.5,h*.9,Math.max(w,h)*.6,'rgba(120,255,160,.25)');
  for(var layer=0;layer<3;layer++){ var n=7+layer*3,a=.35+layer*.25; for(var t=0;t<n;t++){ var x=R()*w,tw=s*(10+R()*14)*(1+layer*.3); c.fillStyle='rgba('+(4+layer*3)+','+(12+layer*8)+','+(8+layer*5)+','+a+')'; c.fillRect(x,0,tw,h); c.fillStyle='rgba(120,255,170,'+(.04+layer*.03)+')'; c.fillRect(x+tw*.15,0,tw*.12,h);
    for(var b=0;b<5;b++){ var by=R()*h*.6; c.fillStyle='rgba(4,16,10,'+a+')'; c.beginPath(); c.ellipse(x+tw/2+(R()-.5)*s*60,by,s*(14+R()*22),s*(6+R()*8),R()*.6,0,TAU); c.fill(); } }
    c.fillStyle='rgba(150,255,190,'+(.05+layer*.03)+')'; c.fillRect(0,h*(.6+layer*.1),w,h*.3); }
  for(var g=0;g<260;g++){ c.fillStyle='rgba(30,90,50,'+(.3+R()*.5)+')'; var gx=R()*w; c.beginPath(); c.moveTo(gx,h); c.lineTo(gx+(R()-.5)*s*6,h-s*(8+R()*26)); c.lineTo(gx+s*2,h); c.fill(); }
  c.save(); c.globalCompositeOperation='lighter'; for(var f=0;f<46;f++){ var fx=R()*w,fy=h*(.15+R()*.8),rr=s*(2+R()*3.5); c.fillStyle=rad(c,fx,fy,0,rr*6,[[0,'rgba(240,255,140,.95)'],[.25,'rgba(200,255,100,.4)'],[1,'rgba(150,255,100,0)']]); c.fillRect(fx-rr*6,fy-rr*6,rr*12,rr*12); c.fillStyle='#fffde0'; c.beginPath(); c.arc(fx,fy,rr*.5,0,TAU); c.fill(); } c.restore();
  calm(c,w,h,.4); vign(c,w,h,.45); }};
/* 65 Waves: sunlit ocean with layered swells and foam */
A[65]={ink:'#ffffff',glow:'rgba(120,220,255,.7)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#7fd3ff'],[.28,'#2aa0e6'],[1,'#06356e']]));
  glow(c,w*.7,h*.1,Math.max(w,h)*.5,'rgba(255,255,230,.8)'); c.fillStyle='#fffbe6'; c.beginPath(); c.arc(w*.7,h*.1,s*20,0,TAU); c.fill();
  for(var L=0;L<7;L++){ var y0=h*(.22+L*.11),amp=h*(.02+L*.008),f=3+L*.9; var col=['#4cc0f2','#2ba3e6','#1a86d6','#1368bd','#0e4f9a','#0a3b7c','#072c62'][L]; c.fillStyle=lin(c,0,y0-amp,0,y0+h*.2,[[0,col],[1,'#06244f']]); c.beginPath(); c.moveTo(0,h); for(var x=0;x<=w;x+=4) c.lineTo(x,y0+Math.sin(x/w*f*TAU/2+L*1.3)*amp+Math.sin(x/w*f*3+L)*amp*.35); c.lineTo(w,h); c.closePath(); c.fill();
    c.strokeStyle='rgba(255,255,255,'+(.55-L*.05)+')'; c.lineWidth=(2.4-L*.18)*s; c.shadowColor='rgba(255,255,255,.6)'; c.shadowBlur=s*5; c.beginPath(); for(var x2=0;x2<=w;x2+=4){ var yy=y0+Math.sin(x2/w*f*TAU/2+L*1.3)*amp+Math.sin(x2/w*f*3+L)*amp*.35; x2?c.lineTo(x2,yy):c.moveTo(x2,yy); } c.stroke(); c.shadowBlur=0;
    for(var fm=0;fm<10;fm++){ var fx=R()*w,fyy=y0+Math.sin(fx/w*f*TAU/2+L*1.3)*amp; c.fillStyle='rgba(255,255,255,'+(.15+R()*.3)+')'; c.beginPath(); c.ellipse(fx,fyy+s*3,s*(5+R()*12),s*(1.2+R()*1.6),0,0,TAU); c.fill(); } }
  c.globalAlpha=.4; c.fillStyle=lin(c,w*.7-s*14,h*.18,w*.7+s*14,h,[[0,'rgba(255,255,230,.9)'],[1,'rgba(255,255,230,0)']]); c.fillRect(w*.7-s*14,h*.18,s*28,h*.82); c.globalAlpha=1;
  calm(c,w,h,.35); vign(c,w,h,.38); }};
/* 66 Lightning: storm clouds with a forked bolt */
A[66]={ink:'#f6f2ff',glow:'rgba(180,160,255,.8)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#0b0620'],[.5,'#231452'],[1,'#3b2a7a']]));
  for(var cl=0;cl<26;cl++){ var x=R()*w,y=R()*h*.55,r=s*(40+R()*70); c.fillStyle='rgba('+(30+R()*30|0)+','+(20+R()*20|0)+','+(70+R()*40|0)+','+(.25+R()*.3)+')'; c.beginPath(); c.ellipse(x,y,r*1.6,r*.6,0,0,TAU); c.fill(); }
  glow(c,w*.62,h*.35,Math.max(w,h)*.5,'rgba(160,150,255,.55)');
  function bolt(x,y,ang,len,wd,depth){ var px=x,py=y; for(var i=0;i<len;i++){ var nx=px+Math.cos(ang)*s*9+(R()-.5)*s*12,ny=py+Math.sin(ang)*s*9; for(var pass=0;pass<3;pass++){ c.strokeStyle=['rgba(140,120,255,.22)','rgba(190,180,255,.55)','#ffffff'][pass]; c.lineWidth=wd*[7,3,1][pass]; c.lineCap='round'; c.shadowColor='#a79bff'; c.shadowBlur=pass===0?s*24:0; c.beginPath(); c.moveTo(px,py); c.lineTo(nx,ny); c.stroke(); } px=nx; py=ny; ang+=(R()-.5)*.5; if(depth<2&&R()<.12) bolt(px,py,ang+(R()<.5?.8:-.8),Math.floor(len*.5),wd*.6,depth+1); if(py>h) break; } c.shadowBlur=0; }
  bolt(w*.62,-s*10,Math.PI/2+.1,Math.ceil(h/(s*9))+4,s*1.4,0); bolt(w*.22,-s*10,Math.PI/2-.12,Math.ceil(h/(s*9)),s*.9,1);
  c.save(); c.globalCompositeOperation='lighter'; c.fillStyle=rad(c,w*.62,h*.4,0,Math.max(w,h)*.7,[[0,'rgba(190,180,255,.25)'],[1,'rgba(190,180,255,0)']]); c.fillRect(0,0,w,h); c.restore();
  c.strokeStyle='rgba(190,200,255,.3)'; c.lineWidth=s; for(var rn=0;rn<80;rn++){ var rx=R()*w,ry=R()*h; c.beginPath(); c.moveTo(rx,ry); c.lineTo(rx-s*5,ry+s*18); c.stroke(); }
  calm(c,w,h,.4); vign(c,w,h,.45); }};
/* 67 Update 2 (launch gift): neon sunset, grid floor and a glowing cube */
A[67]={ink:'#ffffff',glow:'rgba(255,60,220,.8)',draw:function(c,w,h,R){ var s=M(w,h), gy=h*.64;
  fill(c,w,h,lin(c,0,0,0,gy,[[0,'#06031c'],[.6,'#2a0d5e'],[1,'#6a1a8a']]));
  for(var i=0;i<110;i++){ c.fillStyle='rgba(255,255,255,'+(.3+R()*.6)+')'; c.fillRect(R()*w,R()*gy*.9,s*(.8+R()*1.4),s*(.8+R()*1.4)); }
  var sx=w*.5,sy=gy-s*8,sr=s*72; c.fillStyle=lin(c,0,sy-sr,0,sy+sr,[[0,'#ffd23a'],[.5,'#ff2bd6'],[1,'#7a5cff']]); c.beginPath(); c.arc(sx,sy,sr,0,TAU); c.fill(); c.fillStyle='#2a0d5e'; for(var b=0;b<6;b++) c.fillRect(sx-sr,sy+sr*.1+b*sr*.17,sr*2,sr*(.02+b*.02));
  c.fillStyle='#14072f'; c.fillRect(0,gy,w,h-gy); c.fillStyle=lin(c,0,gy,0,h,[[0,'rgba(255,43,214,.45)'],[1,'rgba(24,197,255,.08)']]); c.fillRect(0,gy,w,h-gy);
  c.strokeStyle='rgba(24,197,255,.8)'; c.lineWidth=1.6*s; for(var gx=-w;gx<w*2;gx+=s*26){ c.beginPath(); c.moveTo(gx,gy); c.lineTo(w/2+(gx-w/2)*3.2,h); c.stroke(); } for(var l=1;l<9;l++){ var yy=gy+(h-gy)*Math.pow(l/9,1.7); c.beginPath(); c.moveTo(0,yy); c.lineTo(w,yy); c.stroke(); }
  c.shadowColor='#ff2bd6'; c.shadowBlur=s*16; c.fillStyle='#ff2bd6'; c.fillRect(0,gy-s,w,s*2.2); c.shadowBlur=0;
  var cx=w*.5,cy=gy-s*58,k=s*30; function face(pts,col){ poly(c,pts); c.fillStyle=col; c.fill(); c.strokeStyle='#fff'; c.lineWidth=2*s; c.stroke(); }
  face([[cx,cy-k*1.05],[cx+k*.95,cy-k*.5],[cx,cy],[cx-k*.95,cy-k*.5]],'#f5f6ff'); face([[cx-k*.95,cy-k*.5],[cx,cy],[cx,cy+k*1.1],[cx-k*.95,cy+k*.6]],'#7a5cff'); face([[cx+k*.95,cy-k*.5],[cx,cy],[cx,cy+k*1.1],[cx+k*.95,cy+k*.6]],'#ff2bd6');
  glow(c,cx,cy,s*100,'rgba(255,60,220,.5)'); calm(c,w,h,.3); vign(c,w,h,.4); }};
/* 68 Cube Rain: colourful cubes falling through the dark */
A[68]={ink:'#f2f6ff',glow:'rgba(100,150,255,.7)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,0,h,[[0,'#050824'],[.6,'#0e1650'],[1,'#1b2a7a']]));
  var cols=['#e53935','#fb8c00','#fdd835','#43a047','#1e88e5','#fafafa'];
  var items=[]; for(var i=0;i<46;i++) items.push({x:R()*w,y:R()*h,z:R(),a:R()*TAU,c:cols[Math.floor(R()*6)]}); items.sort(function(a,b){ return a.z-b.z; });
  items.forEach(function(it){ var sz=s*(6+it.z*26),al=.25+it.z*.75; c.save(); c.translate(it.x,it.y); c.globalAlpha=al*.35; var tl=lin(c,0,-sz*4,0,0,[[0,'rgba(120,160,255,0)'],[1,it.c]]); c.fillStyle=tl; c.fillRect(-sz*.3,-sz*4,sz*.6,sz*4); c.globalAlpha=al; c.rotate(it.a); c.shadowColor=it.c; c.shadowBlur=it.z*s*12; var k=sz/2; c.fillStyle='#0b0f26'; c.fillRect(-k,-k,sz,sz); c.shadowBlur=0; var g=sz*.28; c.fillStyle=it.c; for(var a=0;a<3;a++) for(var b=0;b<3;b++){ c.fillRect(-k+sz*.07+a*(g+sz*.025),-k+sz*.07+b*(g+sz*.025),g,g); } c.strokeStyle='rgba(255,255,255,.7)'; c.lineWidth=Math.max(1,s*.9); c.strokeRect(-k,-k,sz,sz); c.restore(); });
  glow(c,w*.5,h*1.05,Math.max(w,h)*.6,'rgba(90,130,255,.4)'); calm(c,w,h,.5); vign(c,w,h,.42); }};
/* 69 Gold Edition: engraved gold lattice with an ornate border */
A[69]={ink:'#2a1700',glow:'rgba(255,215,100,.9)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,lin(c,0,0,w,h,[[0,'#8a5a0a'],[.18,'#f8dc82'],[.38,'#c98a14'],[.58,'#ffeaa0'],[.78,'#b57a0e'],[1,'#f2cf6a']]));
  var st=s*26; c.lineWidth=s*1.4; for(var i=-h;i<w+h;i+=st){ c.strokeStyle='rgba(90,52,0,.5)'; c.beginPath(); c.moveTo(i,0); c.lineTo(i+h,h); c.stroke(); c.beginPath(); c.moveTo(i,h); c.lineTo(i+h,0); c.stroke(); c.strokeStyle='rgba(255,246,200,.5)'; c.beginPath(); c.moveTo(i+s*1.6,0); c.lineTo(i+s*1.6+h,h); c.stroke(); c.beginPath(); c.moveTo(i+s*1.6,h); c.lineTo(i+s*1.6+h,0); c.stroke(); }
  for(var x=0;x<w;x+=st) for(var y=0;y<h;y+=st){ var cx=x+st/2*((Math.round(y/st))%2?1:1),cy=y+st/2; c.fillStyle='rgba(255,246,200,.4)'; c.beginPath(); c.arc(x+st/2,y+st/2,s*1.5,0,TAU); c.fill(); }
  var m=s*12; c.strokeStyle='#5a3300'; c.lineWidth=s*5; c.strokeRect(m,m,w-m*2,h-m*2); c.strokeStyle='#fff0b8'; c.lineWidth=s*1.6; c.strokeRect(m+s*4,m+s*4,w-m*2-s*8,h-m*2-s*8); c.strokeStyle='#5a3300'; c.lineWidth=s*1.2; c.strokeRect(m+s*10,m+s*10,w-m*2-s*20,h-m*2-s*20);
  [[m+s*4,m+s*4],[w-m-s*4,m+s*4],[m+s*4,h-m-s*4],[w-m-s*4,h-m-s*4]].forEach(function(p){ star(c,p[0],p[1],s*13,'#5a3300'); star(c,p[0],p[1],s*10,'#fff0b8'); c.fillStyle='#c9890f'; c.beginPath(); c.arc(p[0],p[1],s*3,0,TAU); c.fill(); });
  c.fillStyle=rad(c,w*.5,h*.5,0,Math.max(w,h)*.5,[[0,'rgba(60,32,0,.55)'],[1,'rgba(60,32,0,0)']]); c.fillRect(0,0,w,h);
  c.save(); c.globalCompositeOperation='lighter'; c.fillStyle=lin(c,w*.1,0,w*.4,h,[[0,'rgba(255,255,255,0)'],[.5,'rgba(255,255,255,.42)'],[1,'rgba(255,255,255,0)']]); c.beginPath(); c.moveTo(w*.18,0); c.lineTo(w*.34,0); c.lineTo(w*.2,h); c.lineTo(w*.04,h); c.fill(); c.restore();
  for(var sp=0;sp<16;sp++) star(c,R()*w,R()*h,s*(3+R()*6),'rgba(255,255,255,.9)');
  vign(c,w,h,.3); }};
/* update the swatches and the Garage preview with the new artwork */
window.CW_U2ART=function(L){ try{ L.forEach(function(s){ if(s.i>=43&&s.i<=99&&!s.css0){ var u=CW_PADART.paint(s.i,240,110,1); if(u){ s.css0=s.css; s.css='url('+u+') center/cover'; } } }); }catch(e){ console.error(e); } };
})();
