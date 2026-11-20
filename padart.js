
/* cw-padart: hand-built canvas artwork for every timer pad skin.
   PADART[i]={ink,glow,draw(ctx,w,h,R)} — draw() paints the whole pad at any size,
   so the same skin works on the wide pad and in tall fullscreen. R is a seeded random. */
(function(){
  var TAU=Math.PI*2;
  function rng(seed){ var s=seed>>>0||1; return function(){ s^=s<<13; s^=s>>>17; s^=s<<5; return ((s>>>0)%100000)/100000; }; }
  function lin(c,x0,y0,x1,y1,stops){ var g=c.createLinearGradient(x0,y0,x1,y1); stops.forEach(function(s){ g.addColorStop(s[0],s[1]); }); return g; }
  function rad(c,x,y,r0,r1,stops){ var g=c.createRadialGradient(x,y,r0,x,y,r1); stops.forEach(function(s){ g.addColorStop(s[0],s[1]); }); return g; }
  function fill(c,w,h,st){ c.fillStyle=st; c.fillRect(0,0,w,h); }
  function glow(c,x,y,r,col,a){ c.save(); c.globalCompositeOperation='lighter'; c.globalAlpha=a==null?1:a; c.fillStyle=rad(c,x,y,0,r,[[0,col],[1,'rgba(0,0,0,0)']]); c.fillRect(x-r,y-r,r*2,r*2); c.restore(); }
  function dots(c,w,h,R,n,col,rmin,rmax,yb){ c.save(); c.globalCompositeOperation='lighter'; for(var i=0;i<n;i++){ var x=R()*w, y=yb?h*(yb[0]+R()*(yb[1]-yb[0])):R()*h, r=rmin+R()*(rmax-rmin); c.globalAlpha=.25+R()*.75; c.fillStyle=col; c.beginPath(); c.arc(x,y,r,0,TAU); c.fill(); } c.restore(); }
  function vign(c,w,h,a){ c.fillStyle=rad(c,w/2,h/2,Math.min(w,h)*.25,Math.hypot(w,h)*.62,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,'+a+')']]); c.fillRect(0,0,w,h); }
  function calm(c,w,h,a){ /* soft dark lens behind the digits so the time always reads */ c.fillStyle=rad(c,w/2,h/2,0,Math.max(w,h)*.42,[[0,'rgba(0,0,0,'+a+')'],[1,'rgba(0,0,0,0)']]); c.fillRect(0,0,w,h); }
  function grain(c,w,h,R,a){ c.save(); c.globalAlpha=a; for(var i=0;i<w*h/90;i++){ c.fillStyle=R()<.5?'#000':'#fff'; c.fillRect(R()*w,R()*h,1,1); } c.restore(); }
  function bolt(c,x0,y0,x1,y1,R,wd,col,depth){ var pts=[[x0,y0],[x1,y1]], d=Math.hypot(x1-x0,y1-y0)*.25;
    for(var k=0;k<6;k++){ var n=[]; for(var i=0;i<pts.length-1;i++){ var a=pts[i],b=pts[i+1]; n.push(a,[(a[0]+b[0])/2+(R()-.5)*d,(a[1]+b[1])/2+(R()-.5)*d]); } n.push(pts[pts.length-1]); pts=n; d*=.55; }
    c.save(); c.globalCompositeOperation='lighter'; c.lineJoin='round'; c.lineCap='round';
    [[wd*6,.12],[wd*2.4,.35],[wd,1]].forEach(function(p){ c.strokeStyle=col; c.globalAlpha=p[1]; c.lineWidth=p[0]; c.beginPath(); pts.forEach(function(q,i){ i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]); }); c.stroke(); });
    c.strokeStyle='#fff'; c.globalAlpha=.9; c.lineWidth=Math.max(1,wd*.4); c.stroke(); c.restore();
    if(depth>0) for(var j=0;j<2;j++){ var s=pts[Math.floor(pts.length*(.3+R()*.4))]; bolt(c,s[0],s[1],s[0]+(R()-.5)*Math.abs(x1-x0+80)*1.2,s[1]+(y1-y0)*(.3+R()*.3),R,wd*.55,col,depth-1); } }
  function leaf(c,x,y,len,ang,wid,col,vein){ c.save(); c.translate(x,y); c.rotate(ang); c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(len*.5,-wid,len,0); c.quadraticCurveTo(len*.5,wid,0,0); c.fillStyle=col; c.fill();
    if(vein){ c.strokeStyle=vein; c.lineWidth=Math.max(1,wid*.08); c.beginPath(); c.moveTo(0,0); c.lineTo(len*.95,0); c.stroke(); } c.restore(); }
  function hexgrid(c,w,h,s,fn){ var hh=s*Math.sqrt(3); for(var row=-1;row*hh*.5<h+hh;row++) for(var col=-1;col*s*1.5<w+s*2;col++){ var x=col*s*1.5, y=row*hh*.5; if((row+col)%2) continue; fn(x,y); } }
  function hexPath(c,x,y,s){ c.beginPath(); for(var k=0;k<6;k++){ var a=k*TAU/6; c.lineTo(x+s*Math.cos(a),y+s*Math.sin(a)); } c.closePath(); }
  function star4(c,x,y,r,col){ c.save(); c.globalCompositeOperation='lighter'; c.fillStyle=col; c.beginPath(); c.moveTo(x,y-r); c.quadraticCurveTo(x,y,x+r,y); c.quadraticCurveTo(x,y,x,y+r); c.quadraticCurveTo(x,y,x-r,y); c.quadraticCurveTo(x,y,x,y-r); c.fill(); c.restore(); }
  function rings(c,x,y,r,n,col,a,wd){ c.save(); c.strokeStyle=col; for(var i=0;i<n;i++){ c.globalAlpha=a*(1-i/n); c.lineWidth=wd; c.beginPath(); c.arc(x,y,r+i*wd*3,0,TAU); c.stroke(); } c.restore(); }
  function wave(c,w,h,y,amp,len,ph,col){ c.beginPath(); c.moveTo(0,h); for(var x=0;x<=w+8;x+=8) c.lineTo(x,y+Math.sin(x/len+ph)*amp+Math.sin(x/len*2.3+ph*1.7)*amp*.35); c.lineTo(w,h); c.closePath(); c.fillStyle=col; c.fill(); }
  function cubeIso(c,x,y,s,top,left,right){ var dx=s*Math.cos(Math.PI/6), dy=s/2;
    c.fillStyle=top; c.beginPath(); c.moveTo(x,y-s); c.lineTo(x+dx,y-s+dy); c.lineTo(x,y); c.lineTo(x-dx,y-s+dy); c.closePath(); c.fill();
    c.fillStyle=left; c.beginPath(); c.moveTo(x-dx,y-s+dy); c.lineTo(x,y); c.lineTo(x,y+s); c.lineTo(x-dx,y+dy); c.closePath(); c.fill();
    c.fillStyle=right; c.beginPath(); c.moveTo(x+dx,y-s+dy); c.lineTo(x,y); c.lineTo(x,y+s); c.lineTo(x+dx,y+dy); c.closePath(); c.fill(); }
  var M=Math.min, X=Math.max;
  var A={};
  /* 0 · VERDLING — sunlit canopy */
  A[0]={ink:'#f2fff6',glow:'rgba(120,255,190,.55)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,w*.3,h,[[0,'#0c5a45'],[.55,'#0a3b31'],[1,'#04201b']]));
    glow(c,w*.18,-h*.1,X(w,h)*.7,'rgba(210,255,180,.55)');
    c.save(); c.globalCompositeOperation='lighter'; for(var i=0;i<6;i++){ c.globalAlpha=.07; c.fillStyle='#e9ffd0'; c.beginPath(); var x=w*(.05+i*.12); c.moveTo(x,0); c.lineTo(x+w*.06,0); c.lineTo(x+w*.3+h*.4,h); c.lineTo(x+w*.18+h*.4,h); c.fill(); } c.restore();
    var s=M(w,h); for(var k=0;k<90;k++){ var e=R()<.5, x=e?(R()<.5?R()*w*.22:w-R()*w*.22):R()*w, y=e?R()*h:(R()<.5?R()*h*.18:h-R()*h*.2);
      var g=Math.floor(90+R()*120); leaf(c,x,y,s*(.12+R()*.16),R()*TAU,s*(.035+R()*.04),'rgba('+(20+R()*40|0)+','+g+','+(60+R()*50|0)+','+(.55+R()*.45)+')','rgba(210,255,200,.25)'); }
    calm(c,w,h,.35); vign(c,w,h,.45); }};
  /* 1 · EMBERLING — campfire sparks */
  A[1]={ink:'#ffe6c4',glow:'rgba(255,140,40,.8)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,0,h,[[0,'#120604'],[.6,'#2a0d06'],[1,'#5a1a06']]));
    glow(c,w/2,h*1.08,X(w,h)*.75,'rgba(255,120,30,.75)'); glow(c,w/2,h*1.02,M(w,h)*.5,'rgba(255,210,120,.6)');
    for(var i=0;i<140;i++){ var x=w/2+(R()-.5)*w*(.4+R()*.7), y=h*(1-Math.pow(R(),.7)), r=.6+R()*2.2*M(w,h)/300; glow(c,x,y,r*6,'rgba(255,'+(120+R()*110|0)+',40,.9)',.6); c.fillStyle='#ffe2a8'; c.globalAlpha=.9; c.beginPath(); c.arc(x,y,r,0,TAU); c.fill(); c.globalAlpha=1; }
    calm(c,w,h,.3); vign(c,w,h,.5); }};
  /* 2 · RIPPLET — sunlight through water */
  A[2]={ink:'#e8fbff',glow:'rgba(80,200,255,.7)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,0,h,[[0,'#1e95cf'],[.5,'#0a4a7a'],[1,'#021a33']]));
    var sw=Math.max(2,w>>2), shh=Math.max(2,h>>2), cv=document.createElement('canvas'); cv.width=sw; cv.height=shh; var x2=cv.getContext('2d'), im=x2.createImageData(sw,shh), d=im.data, sc=6/Math.min(sw,shh);
    for(var y=0;y<shh;y++) for(var x=0;x<sw;x++){ var u=x*sc, v=y*sc, t=0; for(var k=0;k<5;k++){ var a=k*1.257; t+=Math.cos(u*Math.cos(a)*3.1+v*Math.sin(a)*3.1+k*1.7); }
      var cst=Math.pow(Math.max(0,1-Math.abs(t)/2.2),5)*(1-y/shh*.8), o=(y*sw+x)*4; d[o]=190; d[o+1]=245; d[o+2]=255; d[o+3]=Math.min(255,cst*255); }
    x2.putImageData(im,0,0); c.save(); c.globalCompositeOperation='lighter'; c.imageSmoothingEnabled=true; c.drawImage(cv,0,0,w,h); c.restore();
    for(var i=0;i<5;i++){ c.save(); c.globalCompositeOperation='lighter'; c.globalAlpha=.07; c.fillStyle='#bff4ff'; var x=w*(.1+i*.2); c.beginPath(); c.moveTo(x,0); c.lineTo(x+w*.05,0); c.lineTo(x-w*.05+h*.2,h); c.lineTo(x-w*.12+h*.2,h); c.fill(); c.restore(); }
    for(var b=0;b<22;b++){ var x=R()*w, y=h*(.45+R()*.55), r=M(w,h)*(.006+R()*.018); c.strokeStyle='rgba(220,250,255,.55)'; c.lineWidth=1.2; c.beginPath(); c.arc(x,y,r,0,TAU); c.stroke(); c.fillStyle='rgba(255,255,255,.55)'; c.beginPath(); c.arc(x-r*.35,y-r*.35,r*.25,0,TAU); c.fill(); }
    calm(c,w,h,.3); vign(c,w,h,.45); }};
  /* 3 · SPARKIT — static crackle */
  A[3]={ink:'#fff8d0',glow:'rgba(255,225,60,.8)',draw:function(c,w,h,R){
    fill(c,w,h,rad(c,w/2,h/2,0,X(w,h)*.7,[[0,'#2e2606'],[1,'#0b0902']]));
    c.save(); c.strokeStyle='rgba(255,220,80,.07)'; c.lineWidth=1; var s=M(w,h)*.08; for(var x=0;x<w;x+=s){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,h); c.stroke(); } for(var y=0;y<h;y+=s){ c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); } c.restore();
    for(var i=0;i<5;i++){ var y0=R()*h, side=i%2; bolt(c,side?w:0,y0,w*(side?.62:.38),h*(.2+R()*.6),R,M(w,h)*.006+.6,'#ffe24a',1); }
    glow(c,w/2,h/2,M(w,h)*.5,'rgba(255,220,60,.25)'); calm(c,w,h,.35); vign(c,w,h,.5); }};
  /* 4 · CINDERSHELL — cooled lava plates */
  A[4]={ink:'#ffe0c0',glow:'rgba(255,110,30,.75)',draw:function(c,w,h,R){
    fill(c,w,h,'#ff5a12'); glow(c,w/2,h,X(w,h)*.8,'rgba(255,200,90,.6)');
    var s=M(w,h)*.11; hexgrid(c,w,h,s,function(x,y){ hexPath(c,x+(R()-.5)*s*.15,y+(R()-.5)*s*.15,s*.88); c.fillStyle=lin(c,x-s,y-s,x+s,y+s,[[0,'#3a2420'],[.6,'#1c1210'],[1,'#0f0a09']]); c.fill(); c.strokeStyle='rgba(255,170,90,.25)'; c.lineWidth=1; c.stroke(); });
    c.fillStyle=lin(c,0,0,0,h,[[0,'rgba(0,0,0,.55)'],[.7,'rgba(0,0,0,0)']]); c.fillRect(0,0,w,h); calm(c,w,h,.25); vign(c,w,h,.45); }};
  /* 5 · TIDECLAW — rolling breakers */
  A[5]={ink:'#e6fbff',glow:'rgba(110,230,255,.7)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,0,h,[[0,'#06253f'],[1,'#02101d']])); glow(c,w*.75,h*.1,X(w,h)*.5,'rgba(126,228,255,.35)');
    var cols=['#0b4e6b','#0c6b7a','#118a93','#1aa6a5','#7fe3e0'];
    for(var i=0;i<5;i++){ wave(c,w,h,h*(.42+i*.12),h*.05,w*(.06+i*.01),i*1.7,cols[i]); c.save(); c.globalCompositeOperation='lighter'; c.strokeStyle='rgba(220,255,255,'+(.15+i*.08)+')'; c.lineWidth=1.5; c.beginPath(); for(var x=0;x<=w;x+=8) c.lineTo(x,h*(.42+i*.12)+Math.sin(x/(w*(.06+i*.01))+i*1.7)*h*.05+Math.sin(x/(w*(.06+i*.01))*2.3+i*1.7*1.7)*h*.05*.35); c.stroke(); c.restore(); }
    dots(c,w,h,R,60,'#eaffff',.5,1.6,[.4,1]); calm(c,w,h,.35); vign(c,w,h,.4); }};
  /* 6 · THORNMAW — bramble frame */
  A[6]={ink:'#eaffea',glow:'rgba(90,220,120,.7)',draw:function(c,w,h,R){
    fill(c,w,h,rad(c,w/2,h/2,0,X(w,h)*.7,[[0,'#174a28'],[1,'#030b06']])); glow(c,w/2,h/2,M(w,h)*.5,'rgba(120,255,150,.15)');
    var s=M(w,h); function vine(x,y,dx,dy){ var px=x,py=y; c.lineCap='round';
      for(var k=0;k<9;k++){ var nx=px+dx*s*.12+(R()-.5)*s*.12, ny=py+dy*s*.12+(R()-.5)*s*.12, mx=(px+nx)/2+(R()-.5)*s*.1, my=(py+ny)/2+(R()-.5)*s*.1;
        c.strokeStyle='#0a2412'; c.lineWidth=s*.032; c.beginPath(); c.moveTo(px,py); c.quadraticCurveTo(mx,my,nx,ny); c.stroke();
        c.strokeStyle='#2c6b33'; c.lineWidth=s*.016; c.stroke(); c.strokeStyle='rgba(170,240,150,.35)'; c.lineWidth=s*.004; c.stroke();
        for(var t=0;t<3;t++){ var q=R(), tx=px+(nx-px)*q, ty=py+(ny-py)*q, a=Math.atan2(ny-py,nx-px)+(R()<.5?1:-1)*(1.1+R()*.5); c.fillStyle='#c9d98a'; c.beginPath(); c.moveTo(tx+Math.cos(a+1.57)*s*.008,ty+Math.sin(a+1.57)*s*.008); c.lineTo(tx+Math.cos(a)*s*.045,ty+Math.sin(a)*s*.045); c.lineTo(tx-Math.cos(a+1.57)*s*.008,ty-Math.sin(a+1.57)*s*.008); c.fill(); }
        if(R()<.45) leaf(c,nx,ny,s*.1,Math.atan2(dy,dx)+(R()-.5)*2,s*.035,'#3f9a4c','rgba(220,255,200,.35)'); px=nx; py=ny; } }
    for(var v=0;v<3;v++){ vine(-10,h*(.1+v*.4),1,(R()-.5)); vine(w+10,h*(.9-v*.4),-1,(R()-.5)); vine(w*(.2+v*.3),-10,(R()-.5),1); vine(w*(.8-v*.3),h+10,(R()-.5),-1); }
    calm(c,w,h,.45); vign(c,w,h,.45); }};
  /* 7 · VOLTFANG — storm front */
  A[7]={ink:'#fffbe0',glow:'rgba(255,215,60,.85)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,0,h,[[0,'#0a0f2e'],[1,'#1b1606']]));
    for(var i=0;i<26;i++) glow(c,R()*w,R()*h*.45,M(w,h)*(.15+R()*.25),'rgba(70,80,140,.5)',.6);
    bolt(c,w*.62,-5,w*.42,h*.95,R,M(w,h)*.012+1,'#ffd84a',2); bolt(c,w*.15,-5,w*.08,h*.6,R,M(w,h)*.006+.6,'#ffe98a',1);
    glow(c,w*.45,h*.95,M(w,h)*.4,'rgba(255,210,60,.45)'); calm(c,w,h,.3); vign(c,w,h,.5); }};
  /* 8 · FROSTMANE — frost crystals */
  A[8]={ink:'#ffffff',glow:'rgba(150,225,255,.85)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,w*.3,h,[[0,'#8fd8f5'],[.45,'#1d5f8c'],[1,'#03101a']]));
    function crystal(x,y,r,dp){ for(var k=0;k<6;k++){ var a=k*TAU/6; c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r); c.stroke();
      for(var b=1;b<3;b++){ var bx=x+Math.cos(a)*r*b/3, by=y+Math.sin(a)*r*b/3, bl=r*.28; [-1,1].forEach(function(s){ c.beginPath(); c.moveTo(bx,by); c.lineTo(bx+Math.cos(a+s*.9)*bl,by+Math.sin(a+s*.9)*bl); c.stroke(); }); } } }
    c.save(); c.strokeStyle='rgba(235,250,255,.75)'; c.lineCap='round';
    for(var i=0;i<18;i++){ var x=R()<.5?R()*w*.3:w*(.7+R()*.3), y=R()*h, r=M(w,h)*(.05+R()*.12); c.lineWidth=1+r*.03; c.globalAlpha=.35+R()*.6; crystal(x,y,r); } c.restore();
    c.save(); c.globalCompositeOperation='lighter'; c.fillStyle=lin(c,0,0,w,h,[[.35,'rgba(255,255,255,0)'],[.47,'rgba(255,255,255,.28)'],[.56,'rgba(255,255,255,0)']]); c.fillRect(0,0,w,h); c.restore();
    calm(c,w,h,.35); vign(c,w,h,.4); }};
  /* 9 · SHADOWVEIL — violet smoke */
  A[9]={ink:'#f3e9ff',glow:'rgba(190,120,255,.9)',draw:function(c,w,h,R){
    fill(c,w,h,'#06030c');
    for(var i=0;i<70;i++){ glow(c,R()*w,R()*h,M(w,h)*(.08+R()*.25),R()<.5?'rgba(120,45,210,.55)':'rgba(60,20,130,.55)',.55); }
    c.save(); c.globalCompositeOperation='lighter'; for(var k=0;k<28;k++){ var y=R()*h, col=R()<.3?'rgba(230,190,255,.35)':'rgba(170,110,255,.18)'; c.strokeStyle=col; c.lineWidth=1+R()*4; c.beginPath(); c.moveTo(-10,y); c.bezierCurveTo(w*.3,y+(R()-.5)*h*.8,w*.6,y+(R()-.5)*h*.8,w+10,y+(R()-.5)*h*.5); c.stroke(); } c.restore();
    glow(c,w/2,h/2,M(w,h)*.55,'rgba(150,80,255,.3)'); dots(c,w,h,R,40,'#e7d2ff',.4,1.4); calm(c,w,h,.4); vign(c,w,h,.6); }};
  /* 10 · EMBERDRAKE — dragon scales in firelight */
  A[10]={ink:'#ffe4c2',glow:'rgba(255,130,30,.85)',draw:function(c,w,h,R){
    fill(c,w,h,'#150402'); var s=M(w,h)*.16;
    for(var row=0;row*s*.55<h+s;row++) for(var col=-1;col*s<w+s;col++){ var x=col*s+(row%2?s/2:0), y=row*s*.55, t=y/h;
      c.beginPath(); c.arc(x,y,s*.55,0,Math.PI); c.closePath(); c.fillStyle=lin(c,x,y,x,y+s*.55,[[0,'rgba('+(120+t*120|0)+','+(25+t*60|0)+',8,1)'],[1,'rgba('+(40+t*60|0)+',8,2,1)']]); c.fill();
      c.strokeStyle='rgba(255,'+(140+t*80|0)+',60,'+(.25+t*.5)+')'; c.lineWidth=1.2; c.beginPath(); c.arc(x,y,s*.55,0,Math.PI); c.stroke(); }
    glow(c,w/2,h*1.1,X(w,h)*.7,'rgba(255,120,20,.6)'); c.fillStyle=lin(c,0,0,0,h,[[0,'rgba(10,2,0,.85)'],[.5,'rgba(10,2,0,.2)'],[1,'rgba(10,2,0,0)']]); c.fillRect(0,0,w,h);
    calm(c,w,h,.35); vign(c,w,h,.5); }};
  /* 11 · PRISMWING — light split by a prism */
  A[11]={ink:'#ffffff',glow:'rgba(255,255,255,.7)',draw:function(c,w,h,R){
    fill(c,w,h,'#07060f'); var cx=w*.3, cy=h*.5;
    c.save(); c.globalCompositeOperation='lighter'; c.strokeStyle='rgba(255,255,255,.8)'; c.lineWidth=M(w,h)*.012; c.beginPath(); c.moveTo(-10,cy-h*.25); c.lineTo(cx,cy); c.stroke();
    ['#ff4d6d','#ffb020','#ffe14a','#3ef08a','#25e7ff','#5b7bff','#b06eff'].forEach(function(col,i){ var a=(i-3)*.07; c.fillStyle=col; c.globalAlpha=.55; c.beginPath(); c.moveTo(cx,cy); c.lineTo(w+20,cy+Math.tan(a-.05)*w*.8+i*h*.035-h*.1); c.lineTo(w+20,cy+Math.tan(a+.02)*w*.8+i*h*.035-h*.06); c.fill(); }); c.restore();
    var r=M(w,h)*.16; c.beginPath(); c.moveTo(cx,cy-r); c.lineTo(cx+r*.87,cy+r*.5); c.lineTo(cx-r*.87,cy+r*.5); c.closePath(); c.fillStyle='rgba(220,235,255,.12)'; c.fill(); c.strokeStyle='rgba(255,255,255,.7)'; c.lineWidth=1.5; c.stroke();
    dots(c,w,h,R,40,'#fff',.4,1.2); calm(c,w,h,.4); vign(c,w,h,.45); }};
  /* 12 · NULLHYDRA — black hole */
  A[12]={ink:'#efe6ff',glow:'rgba(150,100,255,.8)',draw:function(c,w,h,R){
    fill(c,w,h,'#05020c'); dots(c,w,h,R,160,'#d8ccff',.3,1.1); var cx=w/2, cy=h/2, r=M(w,h)*.2;
    c.save(); c.translate(cx,cy); c.scale(1,.32); c.globalCompositeOperation='lighter'; for(var i=0;i<40;i++){ c.strokeStyle='rgba('+(150+R()*100|0)+','+(80+R()*80|0)+',255,'+(.1+R()*.2)+')'; c.lineWidth=2+R()*4; c.beginPath(); c.arc(0,0,r*(1.3+R()*1.4),0,TAU); c.stroke(); } c.restore();
    glow(c,cx,cy,r*2.2,'rgba(120,70,230,.45)'); c.fillStyle='#000'; c.beginPath(); c.arc(cx,cy,r,0,TAU); c.fill(); rings(c,cx,cy,r*1.02,3,'#c9b0ff',.7,1.5);
    vign(c,w,h,.5); }};
  /* 13 · SOLARIS — solar corona */
  A[13]={ink:'#3a1300',glow:'rgba(255,255,220,.8)',draw:function(c,w,h,R){
    fill(c,w,h,rad(c,w/2,h/2,0,X(w,h)*.75,[[0,'#fff6cf'],[.18,'#ffcf4a'],[.45,'#e2580e'],[1,'#2a0802']]));
    c.save(); c.globalCompositeOperation='lighter'; c.translate(w/2,h/2); for(var i=0;i<48;i++){ c.rotate(TAU/48); c.fillStyle='rgba(255,230,140,'+(.05+R()*.08)+')'; c.beginPath(); c.moveTo(0,-M(w,h)*.1); c.lineTo(X(w,h)*.9,-M(w,h)*(.01+R()*.02)); c.lineTo(X(w,h)*.9,M(w,h)*(.01+R()*.02)); c.fill(); } c.restore();
    glow(c,w/2,h/2,M(w,h)*.35,'rgba(255,255,230,.8)'); vign(c,w,h,.35); }};
  /* 14 · GLACIERA — faceted glacier */
  A[14]={ink:'#ffffff',glow:'rgba(140,250,240,.85)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,w*.4,h,[[0,'#8ff5ea'],[.4,'#127a93'],[1,'#01080f']]));
    var cols=6, rows=Math.max(3,Math.round(cols*h/w)), gx=w/cols, gy=h/rows, P=[];
    for(var y=0;y<=rows;y++){ P[y]=[]; for(var x=0;x<=cols;x++) P[y][x]=[x*gx+(x%cols?(R()-.5)*gx*.6:0),y*gy+(y%rows?(R()-.5)*gy*.6:0)]; }
    for(var y=0;y<rows;y++) for(var x=0;x<cols;x++){ var a=P[y][x],b=P[y][x+1],cc=P[y+1][x+1],d=P[y+1][x];
      [[a,b,cc],[a,cc,d]].forEach(function(t){ var l=.15+R()*.55; c.beginPath(); c.moveTo(t[0][0],t[0][1]); c.lineTo(t[1][0],t[1][1]); c.lineTo(t[2][0],t[2][1]); c.closePath(); c.fillStyle='rgba(230,255,255,'+(l*.35)+')'; c.fill(); c.strokeStyle='rgba(230,255,255,.35)'; c.lineWidth=1; c.stroke(); }); }
    c.save(); c.globalCompositeOperation='lighter'; c.fillStyle=lin(c,0,0,w,h,[[.32,'rgba(255,255,255,0)'],[.45,'rgba(255,255,255,.3)'],[.55,'rgba(255,255,255,0)']]); c.fillRect(0,0,w,h); c.restore();
    calm(c,w,h,.45); vign(c,w,h,.45); }};
  /* 15 · RAIJUU — thunder god's sky */
  A[15]={ink:'#eef6ff',glow:'rgba(150,200,255,.9)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,0,h,[[0,'#0d1124'],[1,'#05060c']]));
    for(var i=0;i<18;i++) glow(c,R()*w,R()*h*.4,M(w,h)*(.15+R()*.3),'rgba(80,110,200,.35)');
    for(var k=0;k<3;k++) bolt(c,w*(.2+k*.3)+(R()-.5)*w*.1,-5,w*(.25+k*.25),h+5,R,M(w,h)*.008+.8,'#bfe0ff',2);
    calm(c,w,h,.3); vign(c,w,h,.5); }};
  /* 16 · LUNARIA — moonrise over cloud */
  A[16]={ink:'#f5f7ff',glow:'rgba(200,215,255,.8)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,0,h,[[0,'#05060f'],[.7,'#1b2150'],[1,'#2c3470']])); dots(c,w,h,R,140,'#f0f4ff',.3,1.3,[0,.7]);
    var mx=w*.84, my=h*.2, mr=M(w,h)*.13; glow(c,mx,my,mr*3.2,'rgba(200,215,255,.35)');
    c.fillStyle=rad(c,mx-mr*.3,my-mr*.3,mr*.1,mr*1.1,[[0,'#ffffff'],[1,'#c9d2ee']]); c.beginPath(); c.arc(mx,my,mr,0,TAU); c.fill();
    c.fillStyle='rgba(150,160,200,.35)'; [[.2,.1,.18],[-.3,.3,.12],[.35,-.35,.1],[-.1,-.4,.08]].forEach(function(q){ c.beginPath(); c.arc(mx+q[0]*mr,my+q[1]*mr,q[2]*mr,0,TAU); c.fill(); });
    for(var i=0;i<14;i++){ var x=R()*w, y=h*(.78+R()*.25); glow(c,x,y,M(w,h)*(.12+R()*.2),'rgba(120,130,190,.45)'); }
    calm(c,w,h,.3); vign(c,w,h,.4); }};
  /* 17 · GENESIS ZERO — the first star ring */
  A[17]={ink:'#ffffff',glow:'rgba(255,255,255,.9)',draw:function(c,w,h,R){
    fill(c,w,h,'#04030b'); for(var i=0;i<30;i++) glow(c,R()*w,R()*h,M(w,h)*(.1+R()*.3),['rgba(255,77,109,.25)','rgba(37,231,255,.25)','rgba(140,110,255,.3)'][i%3]);
    dots(c,w,h,R,200,'#fff',.3,1.2); var cx=w/2, cy=h/2, r=M(w,h)*.3;
    c.save(); c.globalCompositeOperation='lighter'; var cols=['#ff4d6d','#ffb020','#3ef08a','#25e7ff','#8c6eff','#ff4d6d'];
    for(var k=0;k<180;k++){ var a=k/180*TAU, ci=k/180*5, col=cols[Math.floor(ci)]; c.strokeStyle=col; c.globalAlpha=.85; c.lineWidth=M(w,h)*.022; c.beginPath(); c.arc(cx,cy,r,a,a+TAU/170); c.stroke(); }
    c.globalAlpha=.25; c.lineWidth=M(w,h)*.09; c.strokeStyle='#ffffff'; c.beginPath(); c.arc(cx,cy,r,0,TAU); c.stroke(); c.restore();
    c.fillStyle=rad(c,cx,cy,0,r*.95,[[0,'rgba(0,0,0,.9)'],[1,'rgba(0,0,0,.6)']]); c.beginPath(); c.arc(cx,cy,r*.93,0,TAU); c.fill(); vign(c,w,h,.4); }};
  /* 18 · ANOMALY — corrupted signal */
  A[18]={ink:'#b8ffd8',glow:'rgba(62,240,138,.9)',draw:function(c,w,h,R){
    fill(c,w,h,'#05080a'); for(var y=0;y<h;y+=3){ c.fillStyle='rgba(62,240,138,'+(.02+R()*.05)+')'; c.fillRect(0,y,w,1); }
    for(var i=0;i<26;i++){ var y=R()*h, hh=2+R()*h*.06, sx=(R()-.5)*w*.3; c.fillStyle=['rgba(62,240,138,.35)','rgba(255,60,120,.3)','rgba(60,160,255,.3)'][i%3]; c.fillRect(sx+R()*w*.6,y,w*(.1+R()*.5),hh); }
    c.font='bold '+(M(w,h)*.06|0)+'px monospace'; for(var j=0;j<40;j++){ c.fillStyle='rgba(62,240,138,'+(.15+R()*.35)+')'; c.fillText(R()<.5?'0':'1',R()*w,R()*h); }
    calm(c,w,h,.5); vign(c,w,h,.5); }};
  /* 19 · FOUNDER — gold seal on indigo */
  A[19]={ink:'#ffe7a8',glow:'rgba(255,200,90,.85)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,0,h,[[0,'#2b2070'],[1,'#0a0620']])); var cx=w/2, cy=h/2, r=M(w,h)*.36;
    c.save(); c.globalAlpha=.12; c.strokeStyle='#ffd27a'; for(var i=0;i<24;i++){ c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx+Math.cos(i*TAU/24)*X(w,h),cy+Math.sin(i*TAU/24)*X(w,h)); c.stroke(); } c.restore();
    c.lineWidth=M(w,h)*.02; c.strokeStyle=lin(c,cx-r,cy-r,cx+r,cy+r,[[0,'#fff1c2'],[.5,'#d39a2a'],[1,'#ffe39a']]); c.beginPath(); c.arc(cx,cy,r,0,TAU); c.stroke(); c.lineWidth=1.5; c.beginPath(); c.arc(cx,cy,r*.88,0,TAU); c.stroke();
    for(var k=0;k<36;k++){ var a=k*TAU/36; c.fillStyle='#e9b851'; c.beginPath(); c.arc(cx+Math.cos(a)*r*.94,cy+Math.sin(a)*r*.94,M(w,h)*.006,0,TAU); c.fill(); }
    glow(c,cx,cy-r*.2,r*1.4,'rgba(255,200,100,.18)'); calm(c,w,h,.35); vign(c,w,h,.45); }};
  /* 20 · MAGMAHEART — basalt torn open */
  A[20]={ink:'#fff0d0',glow:'rgba(255,120,20,.9)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,0,h,[[0,'#1b1210'],[1,'#0b0706']]));
    for(var k=0;k<5;k++){ var pts=[[R()*w,-5]]; for(var i=1;i<=10;i++) pts.push([pts[i-1][0]+(R()-.5)*w*.15,i*h/10+5]);
      c.save(); c.globalCompositeOperation='lighter'; [[M(w,h)*.06,'rgba(255,90,10,.18)'],[M(w,h)*.02,'rgba(255,140,30,.6)'],[M(w,h)*.006+1,'#ffe0a0']].forEach(function(p){ c.strokeStyle=p[1]; c.lineWidth=p[0]; c.lineJoin='round'; c.beginPath(); pts.forEach(function(q,i){ i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]); }); c.stroke(); }); c.restore(); }
    glow(c,w/2,h*1.15,X(w,h)*.6,'rgba(200,50,5,.6)'); calm(c,w,h,.45); vign(c,w,h,.45); }};
  /* 21 · ANVILBORN — brushed steel with rivets */
  A[21]={ink:'#f2f5f8',glow:'rgba(200,220,240,.5)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,0,h,[[0,'#6b747d'],[.45,'#353b42'],[1,'#121519']]));
    c.save(); for(var y=0;y<h;y+=1.5){ c.fillStyle='rgba(255,255,255,'+(R()*.05)+')'; c.fillRect(0,y,w,1); } c.restore();
    c.fillStyle=lin(c,0,0,w,0,[[0,'rgba(255,255,255,0)'],[.5,'rgba(255,255,255,.1)'],[1,'rgba(255,255,255,0)']]); c.fillRect(0,0,w,h);
    var m=M(w,h)*.06; [[m,m],[w-m,m],[m,h-m],[w-m,h-m]].forEach(function(p){ c.fillStyle=rad(c,p[0]-2,p[1]-2,0,m*.35,[[0,'#e6ebf0'],[1,'#3b4148']]); c.beginPath(); c.arc(p[0],p[1],m*.3,0,TAU); c.fill(); });
    c.strokeStyle='rgba(0,0,0,.4)'; c.lineWidth=2; c.strokeRect(m*.5,m*.5,w-m,h-m); c.strokeStyle='rgba(255,255,255,.12)'; c.strokeRect(m*.5+2,m*.5+2,w-m-4,h-m-4);
    calm(c,w,h,.25); vign(c,w,h,.35); }};
  /* 22 · EMBERFORGE — forge mouth */
  A[22]={ink:'#ffe3c0',glow:'rgba(255,140,40,.9)',draw:function(c,w,h,R){
    fill(c,w,h,'#120707'); var cx=w/2, cy=h*.95, r=M(w,h)*.6;
    c.fillStyle='#2a120c'; c.beginPath(); c.arc(cx,cy,r*1.15,Math.PI,0); c.fill();
    c.fillStyle=rad(c,cx,cy,0,r,[[0,'#fff1c2'],[.25,'#ffb23a'],[.6,'#ff5a14'],[1,'#3a0d06']]); c.beginPath(); c.arc(cx,cy,r,Math.PI,0); c.fill();
    var bw=r*.18; for(var x=cx-r*1.15;x<cx+r*1.15;x+=bw*1.05){ c.strokeStyle='rgba(0,0,0,.35)'; c.lineWidth=2; c.beginPath(); c.moveTo(x,cy); c.lineTo(cx+(x-cx)*.6,cy-r*1.1); c.stroke(); }
    dots(c,w,h,R,90,'#ffcf7a',.5,2,[0,.9]); calm(c,w,h,.35); vign(c,w,h,.5); }};
  /* 23 · AURIC POUR — molten gold */
  A[23]={ink:'#3a2400',glow:'rgba(255,240,180,.8)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,w,h,[[0,'#fbe08a'],[.3,'#d79a1f'],[.55,'#f3c14b'],[.8,'#b9770f'],[1,'#7a4d06']]));
    for(var i=0;i<14;i++){ var y=R()*h; c.strokeStyle='rgba(255,250,220,'+(.15+R()*.35)+')'; c.lineWidth=2+R()*M(w,h)*.04; c.beginPath(); c.moveTo(-10,y); c.bezierCurveTo(w*.3,y+(R()-.5)*h*.4,w*.7,y+(R()-.5)*h*.4,w+10,y+(R()-.5)*h*.3); c.stroke(); }
    c.save(); c.globalCompositeOperation='lighter'; c.fillStyle=lin(c,0,0,w,h,[[.35,'rgba(255,255,255,0)'],[.48,'rgba(255,255,255,.45)'],[.6,'rgba(255,255,255,0)']]); c.fillRect(0,0,w,h); c.restore();
    c.fillStyle=rad(c,w/2,h/2,0,M(w,h)*.45,[[0,'rgba(255,245,210,.55)'],[1,'rgba(255,245,210,0)']]); c.fillRect(0,0,w,h); vign(c,w,h,.35); }};
  /* 24 · STARMETAL — meteorite with star glints */
  A[24]={ink:'#e6fbff',glow:'rgba(120,240,230,.85)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,w,h,[[0,'#3a4566'],[.5,'#1a2040'],[1,'#080b1c']]));
    [[.35,'rgba(200,220,255,'],[1.4,'rgba(150,240,230,'],[2.45,'rgba(255,255,255,']].forEach(function(o){ var a=o[0], dx=Math.cos(a), dy=Math.sin(a), L=Math.hypot(w,h);
      for(var k=-L;k<L;k+=3+R()*9){ c.strokeStyle=o[1]+(.04+R()*.12)+')'; c.lineWidth=1+R()*2.5; c.beginPath(); c.moveTo(w/2+dx*-L-dy*k,h/2+dy*-L+dx*k); c.lineTo(w/2+dx*L-dy*k,h/2+dy*L+dx*k); c.stroke(); } });
    c.save(); c.globalCompositeOperation='lighter'; c.fillStyle=lin(c,0,0,w,h,[[.2,'rgba(160,230,255,0)'],[.4,'rgba(160,230,255,.18)'],[.6,'rgba(160,230,255,0)']]); c.fillRect(0,0,w,h); c.restore();
    for(var j=0;j<12;j++) star4(c,R()*w,R()*h,M(w,h)*(.015+R()*.035),['#7be9ff','#ffffff','#a6fff0'][j%3]);
    calm(c,w,h,.45); vign(c,w,h,.45); }};
  /* 25 · AURORA VEIL — northern lights */
  A[25]={ink:'#eafff8',glow:'rgba(60,255,190,.85)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,0,h,[[0,'#020a10'],[.6,'#05222a'],[1,'#0a0f2c']])); dots(c,w,h,R,120,'#e8fff8',.3,1.1,[0,.8]);
    c.save(); c.globalCompositeOperation='lighter'; for(var b=0;b<3;b++){ var y0=h*(.25+b*.13), col=['60,255,190','150,110,255','40,200,255'][b];
      for(var x=0;x<w;x+=3){ var y=y0+Math.sin(x/w*5+b*2)*h*.08+Math.sin(x/w*13+b)*h*.03, len=h*(.25+.15*Math.sin(x/w*9+b*3));
        c.fillStyle=lin(c,x,y,x,y+len,[[0,'rgba('+col+',0)'],[.2,'rgba('+col+',.35)'],[1,'rgba('+col+',0)']]); c.fillRect(x,y,3,len); } } c.restore();
    wave(c,w,h,h*.9,h*.04,w*.12,1,'#020608'); calm(c,w,h,.3); vign(c,w,h,.4); }};
  /* 26 · ECLIPSE CROWN — total eclipse */
  A[26]={ink:'#fff0cc',glow:'rgba(255,200,100,.9)',draw:function(c,w,h,R){
    fill(c,w,h,'#020104'); dots(c,w,h,R,90,'#fff',.3,1); var cx=w/2, cy=h/2, r=M(w,h)*.24;
    c.save(); c.globalCompositeOperation='lighter'; c.translate(cx,cy); for(var i=0;i<90;i++){ c.rotate(TAU/90); var L=r*(1.15+R()*.9); c.strokeStyle='rgba(255,'+(170+R()*70|0)+',80,'+(.12+R()*.25)+')'; c.lineWidth=1+R()*2; c.beginPath(); c.moveTo(r,0); c.quadraticCurveTo(L*.8,(R()-.5)*r*.4,L,(R()-.5)*r*.3); c.stroke(); } c.restore();
    glow(c,cx,cy,r*2,'rgba(255,170,60,.45)'); c.fillStyle='#000'; c.beginPath(); c.arc(cx,cy,r,0,TAU); c.fill(); rings(c,cx,cy,r,2,'#ffe2a0',.9,2);
    glow(c,cx+r*.7,cy-r*.7,r*.25,'rgba(255,255,240,1)'); vign(c,w,h,.4); }};
  /* 27 · CHRONOWAVE — clockwork ripples */
  A[27]={ink:'#e2f6ff',glow:'rgba(80,200,255,.85)',draw:function(c,w,h,R){
    fill(c,w,h,rad(c,w/2,h/2,0,X(w,h)*.7,[[0,'#1a0a52'],[1,'#04010f']])); var cx=w/2, cy=h/2;
    for(var i=1;i<14;i++){ var r=i*M(w,h)*.06; c.strokeStyle='rgba(80,200,255,'+(.5-i*.03)+')'; c.lineWidth=i%3?1:2.5; c.beginPath(); c.arc(cx,cy,r,0,TAU); c.stroke();
      if(i%3===0) for(var k=0;k<60;k++){ var a=k*TAU/60, l=k%5?4:9; c.beginPath(); c.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r); c.lineTo(cx+Math.cos(a)*(r-l),cy+Math.sin(a)*(r-l)); c.stroke(); } }
    c.save(); c.translate(cx,cy); c.strokeStyle='rgba(180,230,255,.7)'; c.lineCap='round'; c.lineWidth=3; c.rotate(-1); c.beginPath(); c.moveTo(0,0); c.lineTo(M(w,h)*.3,0); c.stroke(); c.rotate(2.2); c.lineWidth=2; c.beginPath(); c.moveTo(0,0); c.lineTo(M(w,h)*.42,0); c.stroke(); c.restore();
    calm(c,w,h,.45); vign(c,w,h,.45); }};
  /* 28 · WINTER LIGHTS — string lights over snow */
  A[28]={ink:'#ffffff',glow:'rgba(255,220,150,.8)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,0,h,[[0,'#07122b'],[1,'#1a3566']])); dots(c,w,h,R,120,'#ffffff',.6,2.2);
    var cols=['#ff4d6d','#ffd36b','#3ef08a','#5fc8ff']; for(var s=0;s<2;s++){ var y0=h*(.12+s*.12), sag=h*.08; c.strokeStyle='rgba(20,30,40,.9)'; c.lineWidth=1.5; c.beginPath(); for(var x=0;x<=w;x+=6) c.lineTo(x,y0+Math.sin(x/w*Math.PI*2)*sag*.5+sag*.5); c.stroke();
      for(var k=0;k<14;k++){ var x=(k+.5)/14*w+s*w/28, y=y0+Math.sin(x/w*Math.PI*2)*sag*.5+sag*.5+6, col=cols[(k+s)%4]; glow(c,x,y,M(w,h)*.06,col,.7); c.fillStyle=col; c.beginPath(); c.ellipse(x,y,3,5,0,0,TAU); c.fill(); } }
    wave(c,w,h,h*.85,h*.03,w*.2,2,'#e8f1ff'); calm(c,w,h,.3); vign(c,w,h,.35); }};
  /* 29 · LANTERN NIGHT — floating lanterns */
  A[29]={ink:'#fff0d6',glow:'rgba(255,160,60,.85)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,0,h,[[0,'#12040a'],[.7,'#3a0710'],[1,'#7a0c14']]));
    for(var i=0;i<22;i++){ var x=R()*w, y=R()*h, s=M(w,h)*(.03+R()*.07)*(.5+y/h); glow(c,x,y,s*3,'rgba(255,140,40,.45)');
      c.fillStyle=lin(c,x,y-s,x,y+s,[[0,'#ffcf6a'],[1,'#ff5a14']]); c.beginPath(); c.moveTo(x-s*.55,y-s); c.lineTo(x+s*.55,y-s); c.quadraticCurveTo(x+s*.75,y,x+s*.5,y+s); c.lineTo(x-s*.5,y+s); c.quadraticCurveTo(x-s*.75,y,x-s*.55,y-s); c.fill();
      c.fillStyle='rgba(120,20,10,.7)'; c.fillRect(x-s*.6,y-s*1.08,s*1.2,s*.14); c.fillRect(x-s*.55,y+s*.95,s*1.1,s*.12); }
    calm(c,w,h,.35); vign(c,w,h,.45); }};
  /* 30 · MERDEKA FIREWORKS — jalur gemilang sky */
  A[30]={ink:'#ffffff',glow:'rgba(255,215,80,.85)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,0,h,[[0,'#050b2a'],[1,'#122a74']]));
    [['#ffd200',.24,.32],['#e2001a',.74,.28],['#ffffff',.5,.52],['#ffd200',.12,.62],['#e2001a',.88,.6],['#3d6bff',.62,.12]].forEach(function(f){ var cx=w*f[1], cy=h*f[2], r=M(w,h)*(.12+R()*.1); glow(c,cx,cy,r*1.5,f[0],.25);
      c.save(); c.globalCompositeOperation='lighter'; c.strokeStyle=f[0]; c.lineCap='round'; for(var k=0;k<36;k++){ var a=k*TAU/36+R()*.05, r0=r*.25, r1=r*(.8+R()*.25); c.globalAlpha=.85; c.lineWidth=1.6; c.beginPath(); c.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0); c.lineTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1+r*.05); c.stroke(); c.globalAlpha=1; c.fillStyle='#fff'; c.beginPath(); c.arc(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1+r*.05,1.4,0,TAU); c.fill(); } c.restore(); });
    c.fillStyle='#030716'; c.beginPath(); c.moveTo(0,h); var x=0; while(x<w){ var bw=M(w,h)*(.04+R()*.07), bh=h*(.06+R()*.16); c.lineTo(x,h-bh); c.lineTo(x+bw,h-bh); x+=bw; } c.lineTo(w,h); c.fill();
    calm(c,w,h,.3); vign(c,w,h,.35); }};
  /* 31 · HALLOWEEN HOLLOW — moonlit pumpkin patch */
  A[31]={ink:'#fff0d8',glow:'rgba(255,150,30,.9)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,0,h,[[0,'#0b0314'],[.65,'#3a0d55'],[1,'#ff6a00']])); var mx=w*.78, my=h*.24, mr=M(w,h)*.13;
    glow(c,mx,my,mr*3,'rgba(255,200,120,.35)'); c.fillStyle='#ffd38a'; c.beginPath(); c.arc(mx,my,mr,0,TAU); c.fill();
    c.fillStyle='#0b0314'; c.beginPath(); c.moveTo(0,h); for(var x=0;x<=w;x+=10) c.lineTo(x,h*.82+Math.sin(x/w*7)*h*.03); c.lineTo(w,h); c.fill();
    [[.18,.86,.07],[.36,.9,.05],[.62,.88,.06],[.85,.9,.045]].forEach(function(p){ var x=w*p[0], y=h*p[1], r=M(w,h)*p[2]; glow(c,x,y,r*3,'rgba(255,140,20,.5)');
      for(var k=-1;k<=1;k++){ c.fillStyle=k?'#e2620a':'#ff8a1a'; c.beginPath(); c.ellipse(x+k*r*.45,y,r*.6,r*.8,0,0,TAU); c.fill(); }
      c.fillStyle='#ffe06a'; c.beginPath(); c.moveTo(x-r*.4,y-r*.2); c.lineTo(x-r*.15,y-r*.2); c.lineTo(x-r*.28,y-r*.45); c.fill(); c.beginPath(); c.moveTo(x+r*.4,y-r*.2); c.lineTo(x+r*.15,y-r*.2); c.lineTo(x+r*.28,y-r*.45); c.fill();
      c.beginPath(); c.moveTo(x-r*.45,y+r*.15); c.quadraticCurveTo(x,y+r*.55,x+r*.45,y+r*.15); c.quadraticCurveTo(x,y+r*.3,x-r*.45,y+r*.15); c.fill();
      c.fillStyle='#3a5a12'; c.fillRect(x-r*.07,y-r*1.05,r*.14,r*.3); });
    calm(c,w,h,.3); vign(c,w,h,.4); }};
  /* 32 · THE CUBING ZONE — keeps the channel logo, on a teal studio wall */
  A[32]={ink:'#ffffff',glow:'rgba(60,255,150,.9)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,w,h,[[0,'#03100a'],[.5,'#06241a'],[1,'#030d12']]));
    glow(c,w*.5,h*.5,M(w,h)*.95,'rgba(30,230,120,.28)'); glow(c,w*.5,h*.5,X(w,h)*.7,'rgba(39,201,194,.12)');
    c.strokeStyle='rgba(60,255,150,.05)'; c.lineWidth=1; var s=M(w,h)/7; for(var x=(w/2)%s;x<w;x+=s){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,h); c.stroke(); } for(var y=(h/2)%s;y<h;y+=s){ c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); }
    vign(c,w,h,.55); }};
  /* 34 · APEX CROWN — first place */
  A[34]={ink:'#3a2600',glow:'rgba(255,240,180,.9)',draw:function(c,w,h,R){
    fill(c,w,h,rad(c,w/2,h*.55,0,X(w,h)*.8,[[0,'#fff0b8'],[.25,'#ffc83d'],[.6,'#a86a00'],[1,'#2a1800']]));
    c.save(); c.globalCompositeOperation='lighter'; c.translate(w/2,h*.55); for(var i=0;i<24;i++){ c.rotate(TAU/24); c.fillStyle='rgba(255,240,190,.08)'; c.beginPath(); c.moveTo(0,0); c.lineTo(X(w,h),-M(w,h)*.05); c.lineTo(X(w,h),M(w,h)*.05); c.fill(); } c.restore();
    var cw=M(w,h)*.22, cx=w/2, cy=h*.16+cw*.2; c.fillStyle=lin(c,cx,cy-cw*.3,cx,cy+cw*.25,[[0,'#fff6d0'],[1,'#c98a10']]); c.beginPath(); c.moveTo(cx-cw/2,cy+cw*.25); c.lineTo(cx-cw/2,cy-cw*.15); c.lineTo(cx-cw/4,cy+cw*.03); c.lineTo(cx,cy-cw*.3); c.lineTo(cx+cw/4,cy+cw*.03); c.lineTo(cx+cw/2,cy-cw*.15); c.lineTo(cx+cw/2,cy+cw*.25); c.closePath(); c.fill(); c.strokeStyle='rgba(90,50,0,.6)'; c.lineWidth=1.5; c.stroke();
    [-.5,0,.5].forEach(function(k){ c.fillStyle='#d6001c'; c.beginPath(); c.arc(cx+k*cw*.5,cy+cw*.12,cw*.045,0,TAU); c.fill(); });
    vign(c,w,h,.35); }};
  /* 35 · PHANTOM CHROME — liquid chrome */
  A[35]={ink:'#0d1020',glow:'rgba(255,255,255,.8)',draw:function(c,w,h,R){
    fill(c,w,h,lin(c,0,0,0,h,[[0,'#e9ecf8'],[.35,'#6f86c8'],[.5,'#0d1020'],[.62,'#9ff0d8'],[.8,'#e6a8ff'],[1,'#20243a']]));
    for(var i=0;i<10;i++){ var y=R()*h; c.strokeStyle=['rgba(255,255,255,.5)','rgba(13,16,32,.5)','rgba(230,168,255,.4)'][i%3]; c.lineWidth=2+R()*M(w,h)*.05; c.beginPath(); c.moveTo(-10,y); c.bezierCurveTo(w*.3,y+(R()-.5)*h*.5,w*.7,y+(R()-.5)*h*.5,w+10,y+(R()-.5)*h*.4); c.stroke(); }
    c.fillStyle=rad(c,w/2,h/2,0,M(w,h)*.45,[[0,'rgba(240,244,255,.7)'],[1,'rgba(240,244,255,0)']]); c.fillRect(0,0,w,h); }};
  /* 36 · MAGMA CORE — the planet's heart */
  A[36]={ink:'#fff0d0',glow:'rgba(255,150,40,.9)',draw:function(c,w,h,R){
    fill(c,w,h,'#1a0603'); var cx=w/2, cy=h*1.3, r=X(w,h)*.95;
    c.fillStyle=rad(c,cx,cy,r*.2,r,[[0,'#fff1c2'],[.25,'#ffb03a'],[.45,'#ff5a10'],[.65,'#8a1e06'],[.85,'#2a0803'],[1,'#1a0603']]); c.fillRect(0,0,w,h);
    c.save(); c.globalCompositeOperation='lighter'; for(var k=0;k<90;k++){ var a=Math.PI+R()*Math.PI, rr=r*(.3+R()*.55); c.strokeStyle='rgba(255,210,130,'+(.06+R()*.14)+')'; c.lineWidth=1+R()*3; c.beginPath(); c.arc(cx,cy,rr,a,a+.1+R()*.3); c.stroke(); } c.restore();
    dots(c,w,h,R,70,'#ffc070',.5,1.8); calm(c,w,h,.45); vign(c,w,h,.4); }};
  var cache={};
  function paint(i,w,h,dpr){ var a=A[i]; if(!a) return null; dpr=dpr||1; var W=Math.max(2,Math.round(w*dpr)), H=Math.max(2,Math.round(h*dpr)), key=i+'|'+W+'x'+H; if(cache[key]) return cache[key];
    var cv=document.createElement('canvas'); cv.width=W; cv.height=H; var c=cv.getContext('2d'); a.draw(c,W,H,rng(9301+i*7919)); var url=cv.toDataURL('image/jpeg',.9); cache[key]=url; return url; }
  window.CW_PADART={art:A,paint:paint};
})();

/* cw-padfx: the moving layer on top of each pad skin's artwork.
   One small canvas inside the pad, capped at 30 fps, paused when the tab is hidden
   and switched off for people who ask their device for reduced motion. */
(function(){
  var TAU=Math.PI*2;
  function R(){ return Math.random(); }
  function glowDot(c,x,y,r,col,a){ var g=c.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,col); g.addColorStop(1,'rgba(0,0,0,0)'); c.globalAlpha=a; c.fillStyle=g; c.fillRect(x-r,y-r,r*2,r*2); c.globalAlpha=1; }
  function bolt(c,x0,y0,x1,y1,wd,col){ var pts=[[x0,y0],[x1,y1]], d=Math.hypot(x1-x0,y1-y0)*.22;
    for(var k=0;k<5;k++){ var n=[]; for(var i=0;i<pts.length-1;i++){ var a=pts[i],b=pts[i+1]; n.push(a,[(a[0]+b[0])/2+(R()-.5)*d,(a[1]+b[1])/2+(R()-.5)*d]); } n.push(pts[pts.length-1]); pts=n; d*=.55; }
    [[wd*5,.15],[wd*2,.45],[wd,1]].forEach(function(p){ c.strokeStyle=col; c.globalAlpha=p[1]; c.lineWidth=p[0]; c.beginPath(); pts.forEach(function(q,i){ i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]); }); c.stroke(); }); c.globalAlpha=1; }
  var CZ={img:null,ok:false}; function czImg(){ if(!CZ.img){ var im=new Image(); im.onload=function(){ CZ.ok=true; }; im.src='/czlogo.png'; CZ.img=im; } return CZ; }
  /* The Cubing Zone: logo dead centre, green energy breathing in and out around it, sparks in the logo's colours streaking across */
  function czlogo(o){ czImg(); var SP=[], next=0, CO=['#e1352b','#f5c518','#2a6bff','#22b455','#ff8a1f','#27d9cf','#ffffff'];
    return {step:function(c,w,h,t,dt){
    var S=CZ.img&&CZ.ok?Math.min(h*.8,w*.46):0; if(!S) return; var cx=w/2, cy=h/2, k=.5+.5*Math.sin(t*TAU/3.2), k2=.5+.5*Math.sin(t*TAU/3.2-1.1);
    c.save(); c.globalCompositeOperation='lighter';
    glowDot(c,cx,cy,Math.max(w,h)*.62,'rgba(30,230,120,1)',.10+.16*k);
    glowDot(c,cx,cy,S*.95,'rgba(60,255,150,1)',.16+.26*k2);
    c.save(); c.translate(cx,cy); c.rotate(t*.18); for(var i=0;i<18;i++){ c.rotate(TAU/18); var L=S*(.62+.5*(.5+.5*Math.sin(t*2.1+i*1.7))); c.fillStyle='rgba(60,255,150,'+(.05+.06*k)+')'; c.beginPath(); c.moveTo(S*.4,0); c.lineTo(L,-S*.035); c.lineTo(L,S*.035); c.fill(); } c.restore();
    for(var r=0;r<4;r++){ var u=((t/2.6)+r/4)%1;
      c.strokeStyle='rgba(70,255,160,'+((1-u)*.55)+')'; c.lineWidth=2+S*.012*(1-u); c.beginPath(); c.arc(cx,cy,S*(.5+u*1.25),0,TAU); c.stroke();
      c.strokeStyle='rgba(120,255,190,'+(Math.sin(u*Math.PI)*.4)+')'; c.lineWidth=1.5; c.beginPath(); c.arc(cx,cy,S*(1.7-u*1.2),0,TAU); c.stroke(); }
    c.restore();
    /* sparks */
    if(t>next){ var n=1+(R()*2|0); for(var q=0;q<n;q++){ var fromLeft=R()<.5, a=(R()-.5)*.9, v=(w*.9+R()*w*.8); SP.push({x:fromLeft?-10:w+10,y:R()*h,vx:(fromLeft?1:-1)*Math.cos(a)*v,vy:Math.sin(a)*v,age:0,life:.55+R()*.5,col:CO[(R()*CO.length)|0],len:.05+R()*.08}); } next=t+.1+R()*.3; }
    if(SP.length<10&&R()<.04){ var ang=R()*TAU, rr=S*.5; SP.push({x:cx+Math.cos(ang)*rr,y:cy+Math.sin(ang)*rr,vx:Math.cos(ang)*w*.5,vy:Math.sin(ang)*w*.5,age:0,life:.45+R()*.3,col:CO[(R()*CO.length)|0],len:.06}); }
    c.save(); c.globalCompositeOperation='lighter'; c.lineCap='round';
    SP=SP.filter(function(s){ s.age+=dt; if(s.age>s.life) return false; s.x+=s.vx*dt; s.y+=s.vy*dt; var f=1-s.age/s.life, tx=s.x-s.vx*s.len, ty=s.y-s.vy*s.len, th=Math.max(1.5,S*.018);
      glowDot(c,s.x,s.y,th*6,s.col,.7*f); var g=c.createLinearGradient(tx,ty,s.x,s.y); g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(1,s.col); c.strokeStyle=g; c.globalAlpha=f; c.lineWidth=th; c.beginPath(); c.moveTo(tx,ty); c.lineTo(s.x,s.y); c.stroke(); c.globalAlpha=1;
      c.fillStyle='#fff'; c.globalAlpha=f; c.beginPath(); c.arc(s.x,s.y,th*.7,0,TAU); c.fill(); c.globalAlpha=1; return true; });
    c.restore();
    /* the logo */
    c.save(); c.translate(cx,cy+Math.sin(t*1.3)*h*.012); var sc=1+.025*k; c.scale(sc,sc); c.beginPath(); c.arc(0,0,S*.5,0,TAU); c.clip(); c.globalAlpha=.7+.15*k; c.drawImage(CZ.img,-S/2,-S/2,S,S); c.restore();
    c.save(); c.globalCompositeOperation='lighter'; c.strokeStyle='rgba(90,255,170,'+(.35+.4*k)+')'; c.lineWidth=2+S*.012*k; c.beginPath(); c.arc(cx,cy,S*.5*sc,0,TAU); c.stroke(); c.restore();
    c.globalAlpha=1; c.globalCompositeOperation='source-over'; }}; }
  /* ---- effect makers: each returns {step(c,w,h,t,dt)} ---- */
  var FX={
    czlogo:czlogo,
    rise:function(o){ var P=[]; return {step:function(c,w,h,t,dt){ var n=o.n||40, s=Math.min(w,h)/300;
      while(P.length<n) P.push({x:R()*w,y:h+R()*h*.6,v:(o.v||40)*(.5+R()),r:(o.r||1.6)*(.5+R()),ph:R()*TAU,c:o.col[(R()*o.col.length)|0]});
      c.globalCompositeOperation='lighter';
      P.forEach(function(p){ p.y-=p.v*s*dt; p.x+=Math.sin(t*1.3+p.ph)*(o.sway||12)*s*dt; var life=1-Math.max(0,(h-p.y)/(h*(o.reach||1)));
        if(p.y<-10||life<=0){ p.x=R()*w; p.y=h+R()*20; } glowDot(c,p.x,p.y,p.r*s*5,p.c,.35*life); c.globalAlpha=Math.max(0,life); c.fillStyle=o.core||'#fff6d8'; c.beginPath(); c.arc(p.x,p.y,p.r*s*.7,0,TAU); c.fill(); c.globalAlpha=1; });
      c.globalCompositeOperation='source-over'; }}; },
    fall:function(o){ var P=[]; return {step:function(c,w,h,t,dt){ var n=o.n||50, s=Math.min(w,h)/300;
      while(P.length<n) P.push({x:R()*w,y:R()*h,v:(o.v||20)*(.5+R()),r:(o.r||1.8)*(.4+R()),ph:R()*TAU});
      P.forEach(function(p){ p.y+=p.v*s*dt; p.x+=Math.sin(t*.8+p.ph)*10*s*dt; if(p.y>h+5){ p.y=-5; p.x=R()*w; } c.globalAlpha=.75; c.fillStyle=o.col||'#fff'; c.beginPath(); c.arc(p.x,p.y,p.r*s,0,TAU); c.fill(); }); c.globalAlpha=1; }}; },
    bubbles:function(o){ var P=[]; return {step:function(c,w,h,t,dt){ var n=o.n||22, s=Math.min(w,h)/300;
      while(P.length<n) P.push({x:R()*w,y:h+R()*h,v:(o.v||30)*(.5+R()),r:(2+R()*6),ph:R()*TAU});
      P.forEach(function(p){ p.y-=p.v*s*dt; p.x+=Math.sin(t*2+p.ph)*8*s*dt; if(p.y<-10){ p.y=h+10; p.x=R()*w; } var r=p.r*s;
        c.strokeStyle='rgba(225,250,255,.55)'; c.lineWidth=1; c.beginPath(); c.arc(p.x,p.y,r,0,TAU); c.stroke(); c.fillStyle='rgba(255,255,255,.55)'; c.beginPath(); c.arc(p.x-r*.35,p.y-r*.35,r*.25,0,TAU); c.fill(); }); }}; },
    leaves:function(o){ var P=[]; return {step:function(c,w,h,t,dt){ var n=o.n||10, s=Math.min(w,h)/300;
      while(P.length<n) P.push({x:R()*w,y:-R()*h,v:(14+R()*16),r:8+R()*8,a:R()*TAU,va:(R()-.5)*2,ph:R()*TAU,g:(110+R()*90)|0});
      P.forEach(function(p){ p.y+=p.v*s*dt; p.x+=Math.sin(t+p.ph)*22*s*dt; p.a+=p.va*dt; if(p.y>h+20){ p.y=-20; p.x=R()*w; }
        c.save(); c.translate(p.x,p.y); c.rotate(p.a); c.scale(1,Math.abs(Math.sin(t*1.5+p.ph))*.7+.3); var L=p.r*s*1.6, W=p.r*s*.55;
        c.fillStyle='rgba(40,'+p.g+',70,.85)'; c.beginPath(); c.moveTo(-L/2,0); c.quadraticCurveTo(0,-W,L/2,0); c.quadraticCurveTo(0,W,-L/2,0); c.fill(); c.restore(); }); }}; },
    bolts:function(o){ var nextT=1+R()*2, cur=null; return {step:function(c,w,h,t,dt){
      if(t>nextT){ cur={t:t,x0:R()*w,x1:R()*w,col:o.col}; nextT=t+(o.gap||2.5)*(.5+R()); }
      if(cur){ var a=t-cur.t; if(a>.35){ cur=null; return; } var on=a<.06||(a>.12&&a<.2); if(!on) return;
        c.globalCompositeOperation='lighter'; c.fillStyle=o.flash||'rgba(255,240,180,.12)'; c.fillRect(0,0,w,h); c.lineJoin='round'; c.lineCap='round';
        bolt(c,cur.x0,-5,cur.x1,h*(o.depth||1),Math.max(1,Math.min(w,h)*.008),cur.col); c.globalCompositeOperation='source-over'; } }}; },
    twinkle:function(o){ var P=[]; return {step:function(c,w,h,t){ var n=o.n||30; while(P.length<n) P.push({x:R()*w,y:R()*h*(o.top||1),ph:R()*TAU,sp:1+R()*3,r:.8+R()*1.8});
      c.globalCompositeOperation='lighter'; P.forEach(function(p){ var k=Math.pow(Math.max(0,Math.sin(t*p.sp+p.ph)),6); if(k<.02) return; var r=p.r*Math.min(w,h)/200;
        glowDot(c,p.x,p.y,r*6,o.col||'rgba(255,255,255,1)',k*.6); c.globalAlpha=k; c.fillStyle='#fff'; c.fillRect(p.x-r*3,p.y-.5,r*6,1); c.fillRect(p.x-.5,p.y-r*3,1,r*6); c.globalAlpha=1; });
      c.globalCompositeOperation='source-over'; }}; },
    sheen:function(o){ return {step:function(c,w,h,t){ var per=o.per||4.5, u=(t%per)/per*1.8-.4, x=u*(w+h);
      var g=c.createLinearGradient(x-h,0,x,h); g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(.5,o.col||'rgba(255,255,255,.22)'); g.addColorStop(1,'rgba(255,255,255,0)');
      c.globalCompositeOperation='lighter'; c.fillStyle=g; c.fillRect(0,0,w,h); c.globalCompositeOperation='source-over'; }}; },
    pulse:function(o){ return {step:function(c,w,h,t){ var k=.5+.5*Math.sin(t*TAU/(o.per||3)); c.globalCompositeOperation='lighter'; glowDot(c,w*(o.x||.5),h*(o.y||.5),Math.max(w,h)*(o.r||.45),o.col,(o.a||.35)*k); c.globalCompositeOperation='source-over'; }}; },
    drift:function(o){ var P=[]; return {step:function(c,w,h,t,dt){ var n=o.n||6; while(P.length<n) P.push({x:R()*w,y:R()*h,vx:(R()-.5)*20,vy:(R()-.5)*10,r:.2+R()*.25,c:o.col[(R()*o.col.length)|0]});
      c.globalCompositeOperation='lighter'; P.forEach(function(p){ p.x+=p.vx*dt; p.y+=p.vy*dt; if(p.x<-w*.3)p.x=w*1.3; if(p.x>w*1.3)p.x=-w*.3; if(p.y<-h*.3)p.y=h*1.3; if(p.y>h*1.3)p.y=-h*.3; glowDot(c,p.x,p.y,Math.max(w,h)*p.r,p.c,o.a||.3); }); c.globalCompositeOperation='source-over'; }}; },
    orbit:function(o){ var P=[]; return {step:function(c,w,h,t){ var n=o.n||40, cx=w/2, cy=h/2, rr=Math.min(w,h)*(o.r||.3); while(P.length<n) P.push({a:R()*TAU,sp:(.4+R()*.8)*(o.dir||1),d:.85+R()*.4,c:o.col[(R()*o.col.length)|0]});
      c.globalCompositeOperation='lighter'; P.forEach(function(p){ var a=p.a+t*p.sp, x=cx+Math.cos(a)*rr*p.d, y=cy+Math.sin(a)*rr*p.d*(o.flat||1); glowDot(c,x,y,Math.min(w,h)*.018,p.c,.9); }); c.globalCompositeOperation='source-over'; }}; },
    ripple:function(o){ return {step:function(c,w,h,t){ var cx=w/2, cy=h/2, M=Math.max(w,h)*.7, per=o.per||2.4; c.globalCompositeOperation='lighter';
      for(var k=0;k<3;k++){ var u=((t/per)+k/3)%1; c.strokeStyle=o.col; c.globalAlpha=(1-u)*.6; c.lineWidth=2; c.beginPath(); c.arc(cx,cy,u*M,0,TAU); c.stroke(); } c.globalAlpha=1; c.globalCompositeOperation='source-over'; }}; },
    glitch:function(o){ return {step:function(c,w,h,t){ if(Math.sin(t*7.3)+Math.sin(t*3.1)<1.1) return; for(var i=0;i<6;i++){ c.fillStyle=['rgba(62,240,138,.35)','rgba(255,60,120,.3)','rgba(60,160,255,.3)'][i%3]; c.fillRect(R()*w*.3,R()*h,w*(.2+R()*.6),2+R()*h*.05); } }}; },
    lanterns:function(o){ var P=[]; return {step:function(c,w,h,t,dt){ var n=o.n||8, s=Math.min(w,h)/300; while(P.length<n) P.push({x:R()*w,y:h+R()*h,v:8+R()*10,r:5+R()*7,ph:R()*TAU});
      P.forEach(function(p){ p.y-=p.v*s*dt; p.x+=Math.sin(t*.6+p.ph)*6*s*dt; if(p.y<-30){ p.y=h+30; p.x=R()*w; } var r=p.r*s, fl=.85+.15*Math.sin(t*9+p.ph);
        c.globalCompositeOperation='lighter'; glowDot(c,p.x,p.y,r*3.5,'rgba(255,150,50,1)',.35*fl); c.globalCompositeOperation='source-over';
        var g=c.createLinearGradient(p.x,p.y-r,p.x,p.y+r); g.addColorStop(0,'#ffd27a'); g.addColorStop(1,'#ff6418'); c.fillStyle=g; c.beginPath(); c.moveTo(p.x-r*.55,p.y-r); c.lineTo(p.x+r*.55,p.y-r); c.quadraticCurveTo(p.x+r*.75,p.y,p.x+r*.5,p.y+r); c.lineTo(p.x-r*.5,p.y+r); c.quadraticCurveTo(p.x-r*.75,p.y,p.x-r*.55,p.y-r); c.fill(); }); }}; },
    fireworks:function(o){ var B=[], next=0; return {step:function(c,w,h,t){ if(t>next){ B.push({t:t,x:w*(.1+R()*.8),y:h*(.1+R()*.5),c:o.col[(R()*o.col.length)|0],r:Math.min(w,h)*(.15+R()*.12)}); next=t+.5+R()*.9; }
      B=B.filter(function(b){ return t-b.t<1.6; }); c.globalCompositeOperation='lighter';
      B.forEach(function(b){ var u=(t-b.t)/1.6, e=1-Math.pow(1-u,3); for(var k=0;k<30;k++){ var a=k*TAU/30, x=b.x+Math.cos(a)*b.r*e, y=b.y+Math.sin(a)*b.r*e+u*u*b.r*.5; glowDot(c,x,y,b.r*.08,b.c,(1-u)); } });
      c.globalCompositeOperation='source-over'; }}; },
    bats:function(o){ var P=[]; return {step:function(c,w,h,t,dt){ var s=Math.min(w,h)/300; while(P.length<(o.n||4)) P.push({x:-R()*w,y:h*(.1+R()*.5),v:30+R()*30,ph:R()*TAU});
      c.fillStyle='#0b0314'; P.forEach(function(p){ p.x+=p.v*s*dt; p.y+=Math.sin(t*3+p.ph)*12*s*dt; if(p.x>w+30){ p.x=-30; p.y=h*(.1+R()*.5); } var f=Math.sin(t*16+p.ph)*.6, r=8*s;
        c.beginPath(); c.moveTo(p.x,p.y); c.quadraticCurveTo(p.x-r,p.y-r*(1+f),p.x-r*2,p.y-r*f); c.quadraticCurveTo(p.x-r,p.y+r*.2,p.x,p.y+r*.3); c.quadraticCurveTo(p.x+r,p.y+r*.2,p.x+r*2,p.y-r*f); c.quadraticCurveTo(p.x+r,p.y-r*(1+f),p.x,p.y); c.fill(); }); }}; }
  };
  /* which effects each skin gets — 32 (The Cubing Zone) is left exactly as it was */
  var ember=['rgba(255,160,60,1)','rgba(255,120,30,1)','rgba(255,210,120,1)'];
  var CFG={
    0:[['leaves',{n:9}],['sheen',{per:7,col:'rgba(230,255,200,.12)'}]],
    1:[['rise',{n:45,col:ember,v:45}],['pulse',{x:.5,y:1,r:.6,col:'rgba(255,120,30,1)',a:.3,per:2.2}]],
    2:[['bubbles',{n:20}],['sheen',{per:6,col:'rgba(190,245,255,.12)'}]],
    3:[['bolts',{col:'#ffe24a',gap:1.6,flash:'rgba(255,230,90,.1)'}],['twinkle',{n:20,col:'rgba(255,230,90,1)'}]],
    4:[['rise',{n:30,col:ember,v:30,reach:.7}],['pulse',{x:.5,y:1,r:.7,col:'rgba(255,120,30,1)',a:.25,per:3}]],
    5:[['bubbles',{n:14,v:20}],['sheen',{per:5,col:'rgba(180,250,255,.14)'}]],
    6:[['leaves',{n:6}],['drift',{n:4,col:['rgba(90,220,120,1)'],a:.12}]],
    7:[['bolts',{col:'#ffd84a',gap:2.2,flash:'rgba(255,230,120,.14)'}],['drift',{n:5,col:['rgba(90,100,170,1)'],a:.18}]],
    8:[['fall',{n:60,col:'#f2fbff'}],['sheen',{per:5,col:'rgba(255,255,255,.18)'}]],
    9:[['drift',{n:8,col:['rgba(140,60,230,1)','rgba(80,30,160,1)'],a:.3}],['twinkle',{n:14,col:'rgba(210,170,255,1)'}]],
    10:[['rise',{n:50,col:ember,v:55}],['pulse',{x:.5,y:1.1,r:.7,col:'rgba(255,110,20,1)',a:.3,per:2.6}]],
    11:[['sheen',{per:3.5,col:'rgba(255,255,255,.2)'}],['twinkle',{n:24}]],
    12:[['orbit',{n:60,r:.34,flat:.32,col:['rgba(200,170,255,1)','rgba(150,110,255,1)','rgba(255,255,255,1)']}],['pulse',{r:.3,col:'rgba(140,90,255,1)',a:.25,per:3}]],
    13:[['pulse',{r:.55,col:'rgba(255,240,200,1)',a:.4,per:2.4}],['rise',{n:25,col:['rgba(255,230,150,1)'],v:25}]],
    14:[['fall',{n:40,col:'#dffcff',v:14}],['sheen',{per:4.5,col:'rgba(255,255,255,.2)'}]],
    15:[['bolts',{col:'#cfe6ff',gap:1.4,flash:'rgba(200,225,255,.16)'}],['drift',{n:5,col:['rgba(70,100,190,1)'],a:.2}]],
    16:[['twinkle',{n:40,top:.7}],['drift',{n:4,col:['rgba(120,130,200,1)'],a:.15}]],
    17:[['orbit',{n:80,r:.3,col:['rgba(255,77,109,1)','rgba(255,176,32,1)','rgba(62,240,138,1)','rgba(37,231,255,1)','rgba(140,110,255,1)']}],['twinkle',{n:30}]],
    18:[['glitch',{}]],
    19:[['sheen',{per:4,col:'rgba(255,220,140,.22)'}],['twinkle',{n:16,col:'rgba(255,210,120,1)'}]],
    20:[['pulse',{x:.5,y:1.1,r:.7,col:'rgba(255,90,10,1)',a:.35,per:2}],['rise',{n:30,col:ember,v:35}]],
    21:[['sheen',{per:3.2,col:'rgba(255,255,255,.16)'}]],
    22:[['rise',{n:55,col:ember,v:60}],['pulse',{x:.5,y:.95,r:.55,col:'rgba(255,170,60,1)',a:.3,per:1.6}]],
    23:[['sheen',{per:3,col:'rgba(255,250,220,.3)'}],['twinkle',{n:18,col:'rgba(255,240,200,1)'}]],
    24:[['twinkle',{n:30,col:'rgba(140,240,255,1)'}],['sheen',{per:5,col:'rgba(160,230,255,.14)'}]],
    25:[['drift',{n:6,col:['rgba(60,255,190,1)','rgba(150,110,255,1)','rgba(40,200,255,1)'],a:.18}],['twinkle',{n:30,top:.7}]],
    26:[['pulse',{r:.4,col:'rgba(255,190,90,1)',a:.35,per:3}],['twinkle',{n:20}]],
    27:[['ripple',{col:'rgba(90,210,255,1)',per:2.6}],['orbit',{n:24,r:.36,dir:-1,col:['rgba(150,225,255,1)']}]],
    28:[['fall',{n:70,col:'#ffffff',v:18}],['twinkle',{n:16,top:.35,col:'rgba(255,220,150,1)'}]],
    29:[['lanterns',{n:9}]],
    30:[['fireworks',{col:['rgba(255,210,0,1)','rgba(226,0,26,1)','rgba(255,255,255,1)','rgba(61,107,255,1)']}]],
    31:[['bats',{n:4}],['pulse',{x:.5,y:.95,r:.6,col:'rgba(255,130,20,1)',a:.25,per:2.4}]],
    32:[['czlogo',{}]],
    34:[['sheen',{per:3.6,col:'rgba(255,250,220,.3)'}],['twinkle',{n:20,col:'rgba(255,240,190,1)'}]],
    35:[['sheen',{per:2.8,col:'rgba(255,255,255,.3)'}],['drift',{n:4,col:['rgba(230,168,255,1)','rgba(159,240,216,1)'],a:.18}]],
    36:[['rise',{n:40,col:ember,v:40}],['pulse',{x:.5,y:1.2,r:.8,col:'rgba(255,140,30,1)',a:.3,per:2.8}]]
  };

  /* ---- premium stack: every skin except The Cubing Zone gets the same kind of treatment (breathing aura with rotating rays, ripple rings, glowing comets, travelling rim light), tinted from its own colours and set up differently for each skin ---- */
  var A=window.CW_PADART&&window.CW_PADART.art||{};
  function hueOf(i){ var g=(A[i]&&(A[i].glow||A[i].ink))||'', m=/(\d+\.?\d*)[,\s]+(\d+\.?\d*)[,\s]+(\d+\.?\d*)/.exec(g), r=255,gg=255,b=255; if(/^rgb/.test(g)&&m){ r=+m[1]; gg=+m[2]; b=+m[3]; } else if(/^#/.test(g)&&g.length>=7){ r=parseInt(g.substr(1,2),16); gg=parseInt(g.substr(3,2),16); b=parseInt(g.substr(5,2),16); }
    var mx=Math.max(r,gg,b), mn=Math.min(r,gg,b), d=mx-mn, h=0; if(d>30){ if(mx===r) h=((gg-b)/d)%6; else if(mx===gg) h=(b-r)/d+2; else h=(r-gg)/d+4; h*=60; if(h<0) h+=360; return {h:h,s:88}; } return {h:(i*47+200)%360,s:70}; }
  function hs(h,s,l,a){ return 'hsla('+Math.round(((h%360)+360)%360)+','+s+'%,'+l+'%,'+a+')'; }
  FX.aura=function(o){ return {step:function(c,w,h,t,dt){ var S=Math.min(h*.8,w*.46), cx=w/2, cy=h/2, k=.5+.5*Math.sin(t*TAU/3.4+o.ph), k2=.5+.5*Math.sin(t*TAU/3.4-1.1+o.ph);
    c.save(); c.globalCompositeOperation='lighter'; glowDot(c,cx,cy,Math.max(w,h)*.62,hs(o.h,o.s,52,1),.07+.12*k); glowDot(c,cx,cy,S*.95,hs(o.h,o.s,62,1),.1+.2*k2);
    c.save(); c.translate(cx,cy); c.rotate(t*.16*o.dir+o.ph); var n=o.rays; for(var i=0;i<n;i++){ c.rotate(TAU/n); var L=S*(.7+.6*(.5+.5*Math.sin(t*2+i*1.7))); c.fillStyle=hs(o.h+(i%2?28:0),o.s,62,.05+.07*k); c.beginPath(); c.moveTo(S*.25,0); c.lineTo(L,-S*.04); c.lineTo(L,S*.04); c.fill(); } c.restore();
    for(var r=0;r<o.rings;r++){ var u=((t/2.8)+r/o.rings)%1; c.strokeStyle=hs(o.h,o.s,68,(1-u)*.5); c.lineWidth=2+S*.012*(1-u); c.beginPath(); c.arc(cx,cy,S*(.3+u*1.4),0,TAU); c.stroke(); c.strokeStyle=hs(o.h+30,o.s,76,Math.sin(u*Math.PI)*.3); c.lineWidth=1.5; c.beginPath(); c.arc(cx,cy,S*(1.7-u*1.2),0,TAU); c.stroke(); }
    c.restore(); }}; };
  FX.shapes=function(o){ return {step:function(c,w,h,t,dt){ var S=Math.min(h*.8,w*.46), cx=w/2, cy=h/2; c.save(); c.globalCompositeOperation='lighter'; c.lineWidth=1.8; c.lineJoin='round';
    for(var i=0;i<3;i++){ var rad=S*(.5+i*.32)*(1+.04*Math.sin(t*1.7+i)), rt=t*(.25+i*.12)*(i%2?-1:1)*o.dir+i; c.strokeStyle=hs(o.h+i*25,o.s,68,.3-.07*i); c.beginPath(); for(var k=0;k<=o.n;k++){ var a=rt+k/o.n*TAU, px=cx+Math.cos(a)*rad, py=cy+Math.sin(a)*rad; k?c.lineTo(px,py):c.moveTo(px,py); } c.stroke(); } c.restore(); }}; };
  FX.comets=function(o){ var SP=[], next=0, CO=[hs(o.h,o.s,62,1),hs(o.h+40,o.s,64,1),hs(o.h-40,o.s,64,1),'#ffffff',hs(o.h+180,78,68,1)];
    return {step:function(c,w,h,t,dt){ var S=Math.min(h*.8,w*.46), cx=w/2, cy=h/2;
    if(t>next){ var n=1+(R()*o.rate|0); for(var q=0;q<n;q++){ var col=CO[(R()*CO.length)|0], life=.55+R()*.5, v=w*.9+R()*w*.8, p;
      if(o.mode===0){ var fl=R()<.5, a=(R()-.5)*.9; p={x:fl?-10:w+10,y:R()*h,vx:(fl?1:-1)*Math.cos(a)*v,vy:Math.sin(a)*v}; }
      else if(o.mode===1){ var dn=R()<.5, a2=.45+(R()-.5)*.3; p=dn?{x:R()*w*.6-10,y:-10,vx:Math.cos(a2)*v*.8,vy:Math.sin(a2)*v*.8}:{x:w*.4+R()*w*.6+10,y:h+10,vx:-Math.cos(a2)*v*.8,vy:-Math.sin(a2)*v*.8}; }
      else { var an=R()*TAU, rr=S*.45; p={x:cx+Math.cos(an)*rr,y:cy+Math.sin(an)*rr,vx:Math.cos(an)*w*.55,vy:Math.sin(an)*w*.55}; }
      p.age=0; p.life=life; p.col=col; p.len=.05+R()*.08; SP.push(p); } next=t+.12+R()*.35; }
    c.save(); c.globalCompositeOperation='lighter'; c.lineCap='round';
    SP=SP.filter(function(s){ s.age+=dt; if(s.age>s.life) return false; s.x+=s.vx*dt; s.y+=s.vy*dt; var f=1-s.age/s.life, tx=s.x-s.vx*s.len, ty=s.y-s.vy*s.len, th=Math.max(1.5,S*.018);
      glowDot(c,s.x,s.y,th*6,s.col,.7*f); var g=c.createLinearGradient(tx,ty,s.x,s.y); g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(1,s.col); c.strokeStyle=g; c.globalAlpha=f; c.lineWidth=th; c.beginPath(); c.moveTo(tx,ty); c.lineTo(s.x,s.y); c.stroke(); c.fillStyle='#fff'; c.beginPath(); c.arc(s.x,s.y,th*.7,0,TAU); c.fill(); c.globalAlpha=1; return true; });
    c.restore(); }}; };
  FX.rim=function(o){ return {step:function(c,w,h,t,dt){ var P=2*(w+h), pos=function(d){ d=((d%P)+P)%P; if(d<w) return [d,1]; d-=w; if(d<h) return [w-1,d]; d-=h; if(d<w) return [w-d,h-1]; d-=w; return [1,h-d]; }, k=.5+.5*Math.sin(t*2+o.ph);
    c.save(); c.globalCompositeOperation='lighter'; c.strokeStyle=hs(o.h,o.s,60,.16+.12*k); c.lineWidth=3; c.strokeRect(1.5,1.5,w-3,h-3);
    for(var j=0;j<2;j++){ var base=t*P*.11*o.dir+j*P/2; for(var q=0;q<13;q++){ var p=pos(base-q*P*.0105*o.dir), a=1-q/13; glowDot(c,p[0],p[1],8+14*a,hs(o.h+q*3,o.s,66,1),.65*a); } } c.restore(); }}; };
  FX.beam=function(o){ return {step:function(c,w,h,t,dt){ var u=((t/o.per)%1)*1.7-.35, x=w*u, sk=h*.6, bw=w*.11; c.save(); c.globalCompositeOperation='lighter'; var g=c.createLinearGradient(x-bw,0,x+bw,0); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(.5,hs(o.h,o.s,82,.24)); g.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=g; c.beginPath(); c.moveTo(x-bw+sk*.5,0); c.lineTo(x+bw+sk*.5,0); c.lineTo(x+bw-sk*.5,h); c.lineTo(x-bw-sk*.5,h); c.closePath(); c.fill(); c.restore(); }}; };
  function aug(k){ k=+k; if(k===32||isNaN(k)||!A[k]||CFG[k]&&CFG[k].aug) return; var hv=hueOf(k), o={h:hv.h,s:hv.s,ph:(k*1.37)%TAU,dir:k%2?1:-1,rays:10+(k%5)*3,rings:3+(k%3),n:3+(k%6),mode:k%3,rate:2+(k%2)};
    var st=[['aura',o]]; if(k%2===0) st.push(['shapes',o]); var mid=CFG[k]||[]; var tail=[['comets',o],['rim',o]]; if(k%3!==1) tail.push(['beam',{h:hv.h,s:hv.s,per:3.4+(k%4)}]); CFG[k]=st.concat(mid,tail); CFG[k].aug=1; }
  Object.keys(A).forEach(aug);
  /* the same effects on any swatch element, for live previews in the skin grid */
  function preview(el,i){ aug(i); if(REDUCE||(window.localStorage&&localStorage.getItem('cw_pad_subtle')==='1')||!CFG[i]||!el) return null; var c2=document.createElement('canvas'); c2.setAttribute('aria-hidden','true'); c2.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;border-radius:inherit'; var x2=c2.getContext('2d'), fl=CFG[i].map(function(e){ return FX[e[0]](e[1]); }), t0=performance.now(), last=0, raf=0, alive=true;
    try{ if(getComputedStyle(el).position==='static') el.style.position='relative'; }catch(e){} el.appendChild(c2);
    function lp(now){ if(!alive) return; raf=requestAnimationFrame(lp); if(now-last<42) return; var dt=Math.min(.1,(now-(last||now))/1000); last=now; var w=el.clientWidth, h=el.clientHeight; if(w<8||h<8) return; var d=Math.min(1.5,window.devicePixelRatio||1); if(c2.width!==Math.round(w*d)||c2.height!==Math.round(h*d)){ c2.width=Math.round(w*d); c2.height=Math.round(h*d); } x2.setTransform(d,0,0,d,0,0); x2.clearRect(0,0,w,h); var t=(now-t0)/1000; fl.forEach(function(f){ try{ f.step(x2,w,h,t,dt); }catch(e){} }); }
    raf=requestAnimationFrame(lp); return function(){ alive=false; cancelAnimationFrame(raf); if(c2.parentNode) c2.parentNode.removeChild(c2); }; }
  var cv=null, ctx=null, raf=0, fx=null, cur=-1, t0=0, last=0;
  var REDUCE=false; try{ REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
  function subtle(){ try{ return localStorage.getItem('cw_pad_subtle')==='1'; }catch(e){ return false; } }
  /* ---- finish effect: when a solve ends, the pad plays a short effect of its own. Every skin has a different pair. ---- */
  var PL_={green:['#3ddc84','#9cf26b','#1fa35a','#d8ffb0'],fire:['#ff7a1a','#ffb347','#ff3d00','#ffe08a'],ice:['#dff7ff','#8fd6f7','#ffffff','#bfe9ff'],gold:['#ffd34a','#fff0a0','#ffb300','#ffffff'],purple:['#b388ff','#7c4dff','#e1bee7','#ffffff'],water:['#4fc3f7','#26c6da','#b3ecff','#ffffff'],pink:['#ffb7d5','#ff8ab8','#ffffff','#ffd1e6'],white:['#ffffff','#e8f1ff','#cfe3ff','#ffffff'],rb:['#ff4d6d','#ffb020','#3ef08a','#25e7ff','#8c6eff'],red:['#ff3b3b','#ff7a5a','#ffd0c0','#ffffff'],yel:['#fff176','#ffd600','#ffffff','#ffe9a0']};
  function pal(n,o){ if(n==='hue'){ var h=o.hue,s=o.s; return [hs(h,s,62,1),hs(h+35,s,64,1),hs(h-35,s,64,1),'#ffffff']; } return PL_[n]||PL_.white; }
  function shp(c,p,a,k){ var s=p.sz; c.save(); c.translate(p.x,p.y); c.globalAlpha=a;
    if(p.sh==='dot'){ c.restore(); glowDot(c,p.x,p.y,s*3,p.col,a*.9); c.fillStyle='#fff'; c.globalAlpha=a*.8; c.beginPath(); c.arc(p.x,p.y,s*.35,0,TAU); c.fill(); c.globalAlpha=1; return; }
    c.rotate(p.rot); c.fillStyle=p.col; c.strokeStyle=p.col;
    if(p.sh==='sq'){ c.fillRect(-s/2,-s/2,s,s*.7); }
    else if(p.sh==='petal'){ c.beginPath(); c.ellipse(0,0,s*.9,s*.45,0,0,TAU); c.fill(); }
    else if(p.sh==='leaf'){ c.beginPath(); c.moveTo(-s,0); c.quadraticCurveTo(0,-s*.7,s,0); c.quadraticCurveTo(0,s*.7,-s,0); c.fill(); c.strokeStyle='rgba(0,0,0,.25)'; c.lineWidth=1; c.beginPath(); c.moveTo(-s,0); c.lineTo(s,0); c.stroke(); }
    else if(p.sh==='star'){ c.beginPath(); c.moveTo(0,-s*1.4); c.lineTo(s*.22,-s*.22); c.lineTo(s*1.4,0); c.lineTo(s*.22,s*.22); c.lineTo(0,s*1.4); c.lineTo(-s*.22,s*.22); c.lineTo(-s*1.4,0); c.lineTo(-s*.22,-s*.22); c.closePath(); c.fill(); }
    else if(p.sh==='coin'){ var w2=Math.abs(Math.cos(p.sp2+k*6)); c.fillStyle='#ffd34a'; c.strokeStyle='#8a5a00'; c.lineWidth=1.5; c.beginPath(); c.ellipse(0,0,Math.max(1.5,s*w2),s,0,0,TAU); c.fill(); c.stroke(); c.fillStyle='#fff2b0'; c.beginPath(); c.ellipse(0,0,Math.max(.8,s*.5*w2),s*.55,0,0,TAU); c.fill(); }
    else if(p.sh==='flake'){ c.lineWidth=1.6; c.beginPath(); for(var q=0;q<3;q++){ c.moveTo(-s,0); c.lineTo(s,0); c.rotate(Math.PI/3); } c.stroke(); }
    else if(p.sh==='bubble'){ c.lineWidth=1.6; c.beginPath(); c.arc(0,0,s,0,TAU); c.stroke(); c.globalAlpha=a*.6; c.fillStyle='#fff'; c.beginPath(); c.arc(-s*.35,-s*.35,s*.22,0,TAU); c.fill(); }
    else if(p.sh==='shard'){ c.beginPath(); c.moveTo(-s,s*.5); c.lineTo(s*.2,-s); c.lineTo(s,s*.6); c.closePath(); c.fill(); c.strokeStyle='rgba(255,255,255,.7)'; c.lineWidth=1; c.stroke(); }
    else if(p.sh==='line'){ c.lineCap='round'; c.lineWidth=Math.max(1.5,s*.25); c.beginPath(); c.moveTo(-s*2.4,0); c.lineTo(s*1.2,0); c.stroke(); }
    else if(p.sh==='bat'){ var f=Math.sin(k*40+p.sp2)*.7; c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(-s,-s*(1+f),-s*2,-s*f); c.quadraticCurveTo(-s,s*.3,0,s*.4); c.quadraticCurveTo(s,s*.3,s*2,-s*f); c.quadraticCurveTo(s,-s*(1+f),0,0); c.fill(); }
    else if(p.sh==='lantern'){ glowDot(c,0,0,s*2.6,p.col,.55); c.fillStyle=p.col; rrp(c,-s*.6,-s*.8,s*1.2,s*1.6,s*.3); c.fill(); c.fillStyle='rgba(255,255,255,.7)'; c.fillRect(-s*.2,-s*.4,s*.4,s*.8); }
    else if(p.sh==='pix'){ var q2=Math.max(3,Math.round(s/3)*3); c.fillRect(-q2/2,-q2/2,q2,q2); }
    else if(p.sh==='drop'){ c.lineCap='round'; c.lineWidth=Math.max(1.5,s*.2); c.beginPath(); c.moveTo(0,-s*1.5); c.lineTo(0,s*1.5); c.stroke(); }
    else if(p.sh==='dust'){ c.globalAlpha=a*.35; c.restore(); glowDot(c,p.x,p.y,s*3,p.col,a*.4); return; }
    c.restore(); }
  function rrp(c,x,y,w,h,r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
  /* particle effect: a configurable burst, fountain, shower or swirl */
  function parts(cf){ return function(S){ var L=[], n=cf.n, i; var cols=pal(cf.cols,S), U=Math.min(S.w,S.h);
    for(i=0;i<n;i++){ var an=cf.ang?cf.ang[0]+R()*(cf.ang[1]-cf.ang[0]):R()*TAU, v=(cf.sp[0]+R()*(cf.sp[1]-cf.sp[0]))*U/220, ox=S.cx, oy=S.cy;
      if(cf.org==='bottom'){ ox=R()*S.w; oy=S.h+10; } else if(cf.org==='top'){ ox=R()*S.w; oy=-10-R()*S.h*.3; } else if(cf.org==='rand'){ ox=R()*S.w; oy=R()*S.h; } else if(cf.org==='side'){ ox=R()<.5?-10:S.w+10; oy=R()*S.h; } else if(cf.org==='ring'){ ox=S.cx+Math.cos(an)*U*(cf.rr||.45); oy=S.cy+Math.sin(an)*U*(cf.rr||.45); }
      L.push({x:ox,y:oy,vx:Math.cos(an)*v*(cf.org==='side'?(ox<0?1:-1)*Math.abs(Math.cos(an)/(Math.cos(an)||1)):1),vy:Math.sin(an)*v,rot:R()*TAU,vr:(R()-.5)*(cf.spin||6),sz:(cf.size[0]+R()*(cf.size[1]-cf.size[0]))*U/220,col:cols[i%cols.length],sh:cf.shape,life:cf.life[0]+R()*(cf.life[1]-cf.life[0]),t0:(cf.stag||0)*R(),sp2:R()*TAU,i:i}); }
    return {draw:function(c,w,h,u,dt,t){ c.save(); c.globalCompositeOperation=cf.add===false?'source-over':'lighter'; L.forEach(function(p){ var a=t-p.t0; if(a<0||a>p.life) return; if(!p.d){ p.d=1; } p.vx*=1-(cf.drag||0)*dt; p.vy*=1-(cf.drag||0)*dt; p.vy+=(cf.g||0)*U/220*dt; if(cf.swirl){ var dx=p.x-S.cx, dy=p.y-S.cy; p.vx+=-dy*cf.swirl*dt; p.vy+=dx*cf.swirl*dt; } p.x+=p.vx*dt; p.y+=p.vy*dt; p.rot+=p.vr*dt; var al=Math.min(1,a*8)*Math.min(1,(p.life-a)*2.2); shp(c,p,al,a); }); c.restore(); }}; }; }
  function ringFx(cols,n,maxR,w0){ return function(S){ var cs=pal(cols,S); return {draw:function(c,w,h,u,dt,t){ c.save(); c.globalCompositeOperation='lighter'; for(var i=0;i<n;i++){ var a=(t-i*.12)/1.1; if(a<0||a>1) continue; var e=1-Math.pow(1-a,2.2); c.strokeStyle=cs[i%cs.length]; c.globalAlpha=(1-a)*.85; c.lineWidth=(w0||6)*(1-a*.7); c.beginPath(); c.arc(S.cx,S.cy,Math.min(S.w,S.h)*maxR*e*(1+i*.12),0,TAU); c.stroke(); } if(t<.25){ glowDot(c,S.cx,S.cy,Math.min(S.w,S.h)*.7,cs[0],(1-t/.25)*.7); } c.restore(); }}; }; }
  function boltFx(cols,n,fromTop){ return function(S){ var cs=pal(cols,S), B=[]; for(var i=0;i<n;i++){ var an=R()*TAU, x0=fromTop?R()*S.w:S.cx, y0=fromTop?-5:S.cy, x1=fromTop?x0+(R()-.5)*S.w*.3:S.cx+Math.cos(an)*S.w, y1=fromTop?S.h*(.6+R()*.5):S.cy+Math.sin(an)*S.w; var pts=[[x0,y0],[x1,y1]], d=Math.hypot(x1-x0,y1-y0)*.2; for(var k=0;k<5;k++){ var q=[]; for(var j=0;j<pts.length-1;j++){ var a=pts[j],b=pts[j+1]; q.push(a,[(a[0]+b[0])/2+(R()-.5)*d,(a[1]+b[1])/2+(R()-.5)*d]); } q.push(pts[pts.length-1]); pts=q; d*=.55; } B.push({pts:pts,t0:i*.13+R()*.1}); }
    return {draw:function(c,w,h,u,dt,t){ c.save(); c.globalCompositeOperation='lighter'; c.lineJoin='round'; B.forEach(function(b,i){ var a=(t-b.t0)/.5; if(a<0||a>1) return; var fl=(Math.floor(a*10)%2?1:.55)*(1-a); [[9,.18],[4,.5],[1.6,1]].forEach(function(p){ c.strokeStyle=cs[i%cs.length]; c.globalAlpha=p[1]*fl; c.lineWidth=p[0]; c.beginPath(); b.pts.forEach(function(q,j){ j?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]); }); c.stroke(); }); }); if(t<.5) { c.fillStyle=cs[0]; c.globalAlpha=Math.max(0,.2*(1-t/.2)); if(t<.2) c.fillRect(0,0,w,h); } c.restore(); }}; }; }
  function flashFx(cols){ return function(S){ var cs=pal(cols,S); return {draw:function(c,w,h,u,dt,t){ c.save(); c.globalCompositeOperation='lighter'; var a=Math.min(1,t/.12)*Math.max(0,1-t/1.2); var g=c.createLinearGradient(S.cx-w*.12,0,S.cx+w*.12,0); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(.5,cs[1]); g.addColorStop(1,'rgba(0,0,0,0)'); c.globalAlpha=a*.9; c.fillStyle=g; c.fillRect(S.cx-w*.12,0,w*.24,h); c.globalAlpha=a*.5; glowDot(c,S.cx,S.cy,Math.min(w,h)*.8,cs[0],1); c.restore(); }}; }; }
  function rainbowFx(){ return function(S){ return {draw:function(c,w,h,u,dt,t){ var a=t/1.5; if(a>1) return; c.save(); c.globalCompositeOperation='lighter'; var x=(a*1.6-.3)*w, cs=PL_.rb; for(var i=0;i<cs.length;i++){ var g=c.createLinearGradient(x-w*.2+i*w*.05,0,x-w*.1+i*w*.05,0); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(.5,cs[i]); g.addColorStop(1,'rgba(0,0,0,0)'); c.globalAlpha=.4*(1-a*.6); c.fillStyle=g; c.fillRect(x-w*.2+i*w*.05,0,w*.12,h); } c.restore(); }}; }; }
  function glitchFx(){ return function(S){ var B=[]; for(var i=0;i<14;i++) B.push({y:R()*S.h,h:4+R()*S.h*.1,dx:(R()-.5)*S.w*.3,t0:R()*.8,c:['#ff2a6d','#05d9e8','#ffffff'][i%3]}); return {draw:function(c,w,h,u,dt,t){ c.save(); c.globalCompositeOperation='lighter'; B.forEach(function(b){ var a=(t-b.t0)/.25; if(a<0||a>1) return; c.globalAlpha=(1-a)*.75; c.fillStyle=b.c; c.fillRect(b.dx*(1-a),b.y,w*(.3+.5*(1-a)),b.h); }); c.restore(); }}; }; }
  function hexFx(cols){ return function(S){ var cs=pal(cols,S); return {draw:function(c,w,h,u,dt,t){ var a=t/1.6; if(a>1) return; c.save(); c.globalCompositeOperation='lighter'; c.lineWidth=2; var r0=Math.min(w,h)*.09, R2=Math.max(w,h)*1.1*a; for(var q=-8;q<=8;q++) for(var r=-5;r<=5;r++){ var x=S.cx+(q*1.5)*r0*1.7, y=S.cy+(r+q%2*.5)*r0*1.75; var d=Math.hypot(x-S.cx,y-S.cy), e=1-Math.abs(d-R2)/(r0*3); if(e<=0) continue; c.strokeStyle=cs[(q+r+16)%cs.length]; c.globalAlpha=e*(1-a); c.beginPath(); for(var k=0;k<6;k++){ var an=k*Math.PI/3+Math.PI/6; k?c.lineTo(x+Math.cos(an)*r0,y+Math.sin(an)*r0):c.moveTo(x+Math.cos(an)*r0,y+Math.sin(an)*r0); } c.closePath(); c.stroke(); } c.restore(); }}; }; }
  function cracksFx(cols){ return function(S){ var cs=pal(cols,S), Ls=[]; for(var i=0;i<9;i++){ var an=i/9*TAU+R()*.5, pts=[[S.cx,S.cy]], x=S.cx, y=S.cy, a=an; for(var k=0;k<8;k++){ a+=(R()-.5)*.8; x+=Math.cos(a)*S.w*.09; y+=Math.sin(a)*S.w*.09; pts.push([x,y]); } Ls.push(pts); }
    return {draw:function(c,w,h,u,dt,t){ var a=Math.min(1,t/.7), f=Math.max(0,1-(t-.7)/1.2); c.save(); c.globalCompositeOperation='lighter'; c.lineJoin='round'; Ls.forEach(function(pts,i){ var m=Math.floor(a*(pts.length-1)); [[5,.2],[1.6,1]].forEach(function(p){ c.strokeStyle=cs[i%cs.length]; c.globalAlpha=p[1]*f; c.lineWidth=p[0]; c.beginPath(); for(var j=0;j<=m;j++) j?c.lineTo(pts[j][0],pts[j][1]):c.moveTo(pts[j][0],pts[j][1]); c.stroke(); }); }); c.restore(); }}; }; }
  function wavesFx(cols){ return function(S){ var cs=pal(cols,S); return {draw:function(c,w,h,u,dt,t){ var a=t/1.8; if(a>1) return; c.save(); c.globalCompositeOperation='lighter'; for(var k=0;k<4;k++){ c.strokeStyle=cs[k%cs.length]; c.globalAlpha=(1-a)*.6; c.lineWidth=3; c.beginPath(); var yb=h*(1.1-1.3*a)+k*h*.06; for(var x=0;x<=w;x+=8){ var y=yb+Math.sin(x*.03+t*6+k)*h*.05; x?c.lineTo(x,y):c.moveTo(x,y); } c.stroke(); } c.restore(); }}; }; }
  function auroraFx(cols){ return function(S){ var cs=pal(cols,S); return {draw:function(c,w,h,u,dt,t){ var a=t/2.2; if(a>1) return; var f=Math.sin(a*Math.PI); c.save(); c.globalCompositeOperation='lighter'; for(var k=0;k<3;k++){ var g=c.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(.5,cs[k%cs.length]); g.addColorStop(1,'rgba(0,0,0,0)'); c.globalAlpha=f*.35; c.fillStyle=g; c.beginPath(); c.moveTo(0,0); for(var x=0;x<=w;x+=10){ var yy=h*.3+Math.sin(x*.012+t*2+k*2)*h*.12+k*h*.1; c.lineTo(x,yy-h*.25); } for(x=w;x>=0;x-=10){ c.lineTo(x,h*.3+Math.sin(x*.012+t*2+k*2)*h*.12+k*h*.1+h*.3); } c.closePath(); c.fill(); } c.restore(); }}; }; }
  function lasersFx(cols){ return function(S){ var cs=pal(cols,S); return {draw:function(c,w,h,u,dt,t){ var a=t/1.4; if(a>1) return; c.save(); c.globalCompositeOperation='lighter'; for(var k=0;k<7;k++){ var ang=-Math.PI/2+(k-3)*.28+Math.sin(t*3+k)*.1+ (a-.5)*.6, x0=k%2?0:w, y0=h; c.strokeStyle=cs[k%cs.length]; c.globalAlpha=(1-a)*.8; c.lineWidth=2.2; c.beginPath(); c.moveTo(w*(k/6),h+5); c.lineTo(w*(k/6)+Math.cos(ang)*w*1.2,h+5+Math.sin(ang)*w*1.2); c.stroke(); } c.restore(); }}; }; }
  function implodeFx(cols){ return function(S){ var cs=pal(cols,S), P=[]; for(var i=0;i<90;i++){ var an=R()*TAU, d=Math.min(S.w,S.h)*(.5+R()*.9); P.push({a:an,d:d,s:1+R()*2.4,c:cs[i%cs.length],sp:R()*3}); } return {draw:function(c,w,h,u,dt,t){ c.save(); c.globalCompositeOperation='lighter'; var a=Math.min(1,t/.9); P.forEach(function(p){ var d=p.d*(1-a)*(1-a), an=p.a+a*3*p.sp*.3; var x=S.cx+Math.cos(an)*d, y=S.cy+Math.sin(an)*d*.7; c.globalAlpha=a<1?.9:0; c.fillStyle=p.c; c.beginPath(); c.arc(x,y,p.s,0,TAU); c.fill(); }); if(t>.85){ var e=(t-.85)/1.0; if(e<1){ c.strokeStyle='#fff'; c.globalAlpha=1-e; c.lineWidth=6*(1-e); c.beginPath(); c.arc(S.cx,S.cy,Math.min(w,h)*.9*e,0,TAU); c.stroke(); glowDot(c,S.cx,S.cy,Math.min(w,h)*.8*(1-e*.6),cs[0],(1-e)*.9); } } c.restore(); }}; }; }
  function galaxyFx(cols){ return function(S){ var cs=pal(cols,S), P=[]; for(var i=0;i<140;i++){ var arm=i%3, r=R(), a=arm*TAU/3+r*5; P.push({r:r,a:a,c:cs[i%cs.length],s:1+R()*2}); } return {draw:function(c,w,h,u,dt,t){ var a=t/2; if(a>1) return; c.save(); c.globalCompositeOperation='lighter'; var e=1-Math.pow(1-Math.min(1,a*1.5),2); P.forEach(function(p){ var rr=p.r*Math.min(w,h)*.75*e, an=p.a+t*1.4*(1-p.r*.5); c.globalAlpha=(1-a)*.9; c.fillStyle=p.c; c.beginPath(); c.arc(S.cx+Math.cos(an)*rr,S.cy+Math.sin(an)*rr*.6,p.s,0,TAU); c.fill(); }); glowDot(c,S.cx,S.cy,Math.min(w,h)*.35,cs[0],(1-a)*.6); c.restore(); }}; }; }
  function fireRingFx(){ return function(S){ var P=[]; for(var i=0;i<110;i++){ P.push({a:R()*TAU,o:R(),s:3+R()*5,c:PL_.fire[i%4]}); } return {draw:function(c,w,h,u,dt,t){ var a=t/1.6; if(a>1) return; c.save(); c.globalCompositeOperation='lighter'; var rad=Math.min(w,h)*.9*(1-Math.pow(1-a,2)); P.forEach(function(p){ var rr=rad*(.85+.15*p.o), x=S.cx+Math.cos(p.a)*rr, y=S.cy+Math.sin(p.a)*rr*.85-Math.sin(t*9+p.a*5)*5-a*20*p.o; glowDot(c,x,y,p.s*(2.2-a),p.c,(1-a)*.85); }); c.restore(); }}; }; }
  function pillarFx(cols){ return flashFx(cols); }
  function slashFx(cols){ return function(S){ var cs=pal(cols,S); return {draw:function(c,w,h,u,dt,t){ c.save(); c.globalCompositeOperation='lighter'; c.lineCap='round'; for(var k=0;k<4;k++){ var a=(t-k*.12)/.45; if(a<0||a>1) continue; var x0=-w*.1+k*w*.28, e=Math.min(1,a*2.2); c.strokeStyle=cs[k%cs.length]; c.globalAlpha=(1-a); c.lineWidth=5; c.beginPath(); c.moveTo(x0,h*.05); c.lineTo(x0+w*.14*e,h*.05+h*.45*e); c.lineTo(x0-w*.06*e,h*.5+h*.1*e); c.lineTo(x0+w*.16*e,h*.95); c.stroke(); } c.restore(); }}; }; }
  function threadFx(cols){ return function(S){ var cs=pal(cols,S); return {draw:function(c,w,h,u,dt,t){ var a=t/1.5; if(a>1) return; c.save(); c.globalCompositeOperation='lighter'; c.lineWidth=2; c.setLineDash([9,7]); for(var k=-6;k<12;k++){ c.strokeStyle=cs[k%cs.length<0?0:Math.abs(k)%cs.length]; c.globalAlpha=(1-a)*.8; var e=Math.min(1,a*2.2-(k+6)*.02); if(e<=0) continue; c.beginPath(); c.moveTo(k*w*.1,0); c.lineTo(k*w*.1+h*e,h*e); c.stroke(); } c.restore(); }}; }; }
  function polkaFx(cols){ return function(S){ var cs=pal(cols,S), P=[]; for(var i=0;i<26;i++) P.push({x:R()*S.w,y:R()*S.h,r:S.h*(.05+R()*.1),t0:R()*.7,c:cs[i%cs.length]}); return {draw:function(c,w,h,u,dt,t){ c.save(); c.globalCompositeOperation='lighter'; P.forEach(function(p){ var a=(t-p.t0)/.8; if(a<0||a>1) return; var e=a<.3?a/.3:1; c.globalAlpha=(1-a)*.85; c.fillStyle=p.c; c.beginPath(); c.arc(p.x,p.y,p.r*(.3+.9*e),0,TAU); c.fill(); }); c.restore(); }}; }; }
  function chromeFx(){ return function(S){ return {draw:function(c,w,h,u,dt,t){ var a=t/1.2; if(a>1) return; c.save(); c.globalCompositeOperation='lighter'; var x=(a*1.5-.25)*w; for(var k=0;k<3;k++){ var g=c.createLinearGradient(x+k*w*.07-w*.04,0,x+k*w*.07+w*.04,0); g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(.5,k===1?'rgba(190,220,255,.95)':'rgba(255,255,255,.8)'); g.addColorStop(1,'rgba(255,255,255,0)'); c.globalAlpha=1-a*.5; c.fillStyle=g; c.beginPath(); c.moveTo(x+k*w*.07,0); c.lineTo(x+k*w*.07+w*.08,0); c.lineTo(x+k*w*.07-h*.25+w*.08,h); c.lineTo(x+k*w*.07-h*.25,h); c.closePath(); c.fill(); } c.restore(); }}; }; }
  function plankFx(){ return function(S){ var P=[]; for(var i=0;i<14;i++){ var an=R()*TAU, v=(120+R()*300)*Math.min(S.w,S.h)/220; P.push({x:S.cx,y:S.cy,vx:Math.cos(an)*v,vy:Math.sin(an)*v-60,rot:R()*TAU,vr:(R()-.5)*14,l:S.w*(.05+R()*.07),c:['#8b5a2b','#a8733c','#6f4420'][i%3]}); } return {draw:function(c,w,h,u,dt,t){ if(t>1.7) return; c.save(); P.forEach(function(p){ p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=500*dt; p.rot+=p.vr*dt; c.globalAlpha=Math.max(0,1-t/1.7); c.translate(p.x,p.y); c.rotate(p.rot); c.fillStyle=p.c; c.fillRect(-p.l/2,-3,p.l,6); c.fillStyle='rgba(255,255,255,.3)'; c.fillRect(-p.l/2,-3,p.l,1.5); c.setTransform(1,0,0,1,0,0); c.setTransform(S.d,0,0,S.d,0,0); }); c.restore(); }}; }; }
  var FXF={
    leaves:parts({n:46,shape:'leaf',cols:'green',sp:[80,380],life:[1.2,2],size:[7,15],g:50,drag:1,swirl:1.1,add:false}),
    embers:parts({n:90,shape:'dot',cols:'fire',sp:[80,420],life:[1,1.9],size:[2,5],g:-90,drag:.9,stag:.2}),
    snow:parts({n:70,shape:'flake',cols:'ice',sp:[60,320],life:[1.3,2.2],size:[5,10],g:50,drag:1.1,add:false}),
    bubbles:parts({n:36,shape:'bubble',cols:'water',sp:[60,200],life:[1.2,2],size:[5,13],g:-90,drag:.8,stag:.3,add:false,ang:[-Math.PI*.9,-Math.PI*.1]}),
    sakura:parts({n:46,shape:'petal',cols:'pink',sp:[80,330],life:[1.3,2.2],size:[6,11],g:45,drag:1,swirl:.9,add:false}),
    confetti:parts({n:80,shape:'sq',cols:'rb',sp:[140,520],life:[1.2,2.1],size:[5,9],g:300,drag:1.3,spin:14,add:false}),
    coins:parts({n:40,shape:'coin',cols:'gold',sp:[200,520],life:[1.3,2.1],size:[7,11],g:520,drag:.5,spin:10,ang:[-Math.PI*.95,-Math.PI*.05],add:false}),
    sparkle:parts({n:70,shape:'star',cols:'gold',sp:[30,260],life:[.9,1.9],size:[2,6],g:60,drag:1,stag:.5,org:'rand'}),
    stars:parts({n:26,shape:'star',cols:'hue',sp:[100,380],life:[.9,1.7],size:[3,8],drag:1.2}),
    meteor:parts({n:16,shape:'line',cols:'white',sp:[420,760],life:[.5,.9],size:[3,6],org:'top',ang:[Math.PI*.2,Math.PI*.4],stag:.9}),
    bats:parts({n:12,shape:'bat',cols:'white',sp:[140,260],life:[1.4,2],size:[6,10],org:'side',ang:[-.5,.5],add:false,stag:.4}),
    lanterns:parts({n:12,shape:'lantern',cols:'fire',sp:[40,110],life:[1.7,2.4],size:[8,12],org:'bottom',ang:[-Math.PI*.6,-Math.PI*.4],g:-10,stag:.5}),
    rain:parts({n:80,shape:'drop',cols:'water',sp:[420,640],life:[.7,1.2],size:[3,6],org:'top',ang:[Math.PI*.47,Math.PI*.53],stag:.9}),
    orbit:parts({n:44,shape:'dot',cols:'hue',sp:[70,200],life:[1.2,2],size:[2,4],swirl:2.2,drag:.3}),
    shatter:parts({n:28,shape:'shard',cols:'ice',sp:[120,460],life:[1,1.8],size:[6,13],g:240,drag:.8,spin:12,add:false}),
    pixels:parts({n:70,shape:'pix',cols:'rb',sp:[100,460],life:[.8,1.6],size:[4,10],drag:1.2,g:90}),
    dust:parts({n:34,shape:'dust',cols:'gold',sp:[40,180],life:[1,1.8],size:[8,18],drag:1.2,add:false,g:-10}),
    firework:function(S){ var subs=[0,.35,.7].map(function(d,i){ var o=Object.create(S); o.cx=S.w*(.25+.25*i+(R()-.5)*.1); o.cy=S.h*(.35+R()*.3); var e=parts({n:42,shape:'dot',cols:i===1?'rb':'hue',sp:[40,230],life:[.9,1.4],size:[2,4],g:90,drag:1.4})(o); return {d:d,e:e}; }); return {draw:function(c,w,h,u,dt,t){ subs.forEach(function(s){ if(t>=s.d) s.e.draw(c,w,h,u,dt,t-s.d); }); }}; },
    shock:ringFx('hue',3,.9,6), ripple:ringFx('water',4,.75,3), lightning:boltFx('yel',5,true), bolts:boltFx('white',6,false), flash:flashFx('gold'),
    rainbow:rainbowFx(), glitch:glitchFx(), hex:hexFx('hue'), cracks:cracksFx('ice'), waves:wavesFx('water'), aurora:auroraFx('green'), lasers:lasersFx('red'), implode:implodeFx('purple'), galaxy:galaxyFx('hue'),
    fireRing:fireRingFx(), zig:slashFx('yel'), thread:threadFx('water'), polka:polkaFx('pink'), chrome:chromeFx(), planks:plankFx()
  };
  /* two effects for every skin, no two skins the same */
  var FSET={0:['leaves','shock'],1:['embers','shock'],2:['ripple','bubbles'],3:['lightning','stars'],4:['hex','embers'],5:['waves','shock'],6:['cracks','leaves'],7:['zig','lightning'],8:['snow','stars'],9:['implode','bats'],10:['fireRing','embers'],11:['rainbow','shatter'],12:['implode','orbit'],13:['flash','fireRing'],14:['cracks','snow'],15:['lightning','flash'],16:['stars','ripple'],17:['galaxy','rainbow'],18:['glitch','pixels'],19:['sparkle','flash'],20:['embers','cracks'],21:['zig','embers'],22:['fireRing','sparkle'],23:['coins','sparkle'],24:['meteor','stars'],25:['aurora','stars'],26:['flash','implode'],27:['ripple','orbit'],28:['snow','sparkle'],29:['lanterns','stars'],30:['firework','confetti'],31:['bats','fireRing'],32:['shock','meteor'],34:['flash','coins'],35:['chrome','glitch'],36:['fireRing','cracks'],37:['lanterns','firework'],38:['sakura','sparkle'],39:['rain','ripple'],40:['implode','galaxy'],41:['firework','shock'],42:['confetti','pixels'],55:['dust','cracks'],56:['cracks','shatter'],57:['planks','dust'],58:['thread','sparkle'],59:['shatter','snow'],60:['hex','lasers'],61:['polka','confetti'],62:['zig','stars'],63:['snow','shock'],64:['sparkle','orbit'],65:['waves','bubbles'],66:['lightning','shock'],67:['galaxy','firework'],68:['rain','pixels'],69:['coins','firework']};
  var finCv=null, finRaf=0;
  function finish(pad,i){ if(REDUCE||!pad) return; var sub=subtle(), set=sub?['ripple']:(FSET[i]||['shock','stars']); try{ var f7=localStorage.getItem('cw_pad_fin7'); if(!sub&&f7&&FXF[f7]&&window.PL&&PL.updOn7&&PL.updOn7()) set=[f7]; }catch(e){}
    if(finCv){ cancelAnimationFrame(finRaf); if(finCv.parentNode) finCv.parentNode.removeChild(finCv); finCv=null; }
    var cv2=document.createElement('canvas'); cv2.setAttribute('aria-hidden','true'); cv2.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;border-radius:inherit';
    try{ if(getComputedStyle(pad).position==='static') pad.style.position='relative'; }catch(e){} pad.appendChild(cv2); finCv=cv2;
    var w=pad.clientWidth||600, h=pad.clientHeight||240, d=Math.min(1.5,window.devicePixelRatio||1); cv2.width=Math.round(w*d); cv2.height=Math.round(h*d);
    var x2=cv2.getContext('2d'), HU=hueOf(i), S={w:w,h:h,cx:w/2,cy:h/2,d:d}; S.hue=HU.h; S.s=HU.s;
    var EF=set.map(function(n){ return FXF[n](S); }), t0=performance.now(), last=0, DUR=sub?1.2:2.6;
    function lp(now){ finRaf=requestAnimationFrame(lp); if(now-last<30) return; var dt=Math.min(.1,(now-(last||now))/1000); last=now; var t=(now-t0)/1000;
      if(t>DUR||!cv2.isConnected){ cancelAnimationFrame(finRaf); if(cv2.parentNode) cv2.parentNode.removeChild(cv2); if(finCv===cv2) finCv=null; return; }
      x2.setTransform(d,0,0,d,0,0); x2.clearRect(0,0,w,h); if(sub) x2.globalAlpha=.45; EF.forEach(function(e){ try{ e.draw(x2,w,h,t/DUR,dt,t); }catch(er){} }); }
    finRaf=requestAnimationFrame(lp); }

  function stop(){ cancelAnimationFrame(raf); raf=0; if(cv) cv.style.display='none'; cur=-1; }
  function start(pad,i){
    aug(i);
    if(REDUCE||!CFG[i]||subtle()){ stop(); return; }
    if(!cv){ cv=document.createElement('canvas'); cv.id='cwPadFx'; cv.setAttribute('aria-hidden','true'); cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;border-radius:inherit'; ctx=cv.getContext('2d'); }
    if(cv.parentNode!==pad) pad.insertBefore(cv,pad.firstChild);
    cv.style.display='block';
    if(cur!==i){ cur=i; fx=CFG[i].map(function(e){ return FX[e[0]](e[1]); }); t0=performance.now(); t7=0; }
    if(!raf) raf=requestAnimationFrame(loop);
  }
  var t7=0; function spd7(){ try{ if(!(window.PL&&PL.updOn7&&PL.updOn7())) return 1; var v=+localStorage.getItem('cw_pad_spd7'); return v>=.25&&v<=3?v:1; }catch(e){ return 1; } }
  function loop(now){
    raf=requestAnimationFrame(loop);
    if(document.hidden||!cv||!cv.isConnected) return;
    if(now-last<33) return; var dt=Math.min(.1,(now-(last||now))/1000); last=now;
    var w=cv.clientWidth, h=cv.clientHeight, dpr=Math.min(1.25,window.devicePixelRatio||1);
    if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){ cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr); }
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
    var sp7=spd7(); dt*=sp7; t7+=dt; var t=t7; fx.forEach(function(f){ try{ f.step(ctx,w,h,t,dt); }catch(e){} });
  }
  window.CW_PADFX={fins7:['confetti','firework','stars','shock','ripple','coins','lightning','snow','sakura','bubbles','galaxy','pixels','rainbow','meteor'].filter(function(n){ return !!FXF[n]; }),start:start,stop:stop,cfg:CFG,preview:preview,finish:finish,fset:FSET,subtle:subtle,setSubtle:function(on){ try{ localStorage.setItem('cw_pad_subtle',on?'1':'0'); }catch(e){} document.body.classList.toggle('cwSubtle',!!on); if(on) stop(); }};
  try{ if(subtle()){ if(document.body) document.body.classList.add('cwSubtle'); else document.addEventListener('DOMContentLoaded',function(){ document.body.classList.add('cwSubtle'); }); } }catch(e){}
})();

(function(){
  function skin(){ try{ return +localStorage.getItem('cw_tmr_skin')||0; }catch(e){ return 0; } }
  var timer=null, last='';
  function paintPad(){
    var b=document.body, pad=document.getElementById('tmrPad'), i=skin(), A=window.CW_PADART&&CW_PADART.art[i];
    if(!pad) return;
    if(!pad||!A||i>=1000||b.classList.contains('cwStudioPad')){ b.classList.remove('cwart','cwartlogo'); last=''; try{ CW_PADFX.stop(); }catch(e){} return; }
    try{ CW_PADFX.start(pad,i); }catch(e){}
    var w=pad.clientWidth||600, h=pad.clientHeight||240; if(w<20||h<20) return;
    var dpr=Math.min(2,window.devicePixelRatio||1); dpr=Math.min(dpr,2000/Math.max(w,h));
    var key=i+'|'+w+'x'+h+'|'+dpr.toFixed(2); if(key===last&&b.classList.contains('cwart')) return; last=key;
    var url=CW_PADART.paint(i,w,h,dpr); if(!url) return;
    b.style.setProperty('--padart','url('+url+')'); b.style.setProperty('--padink',A.ink); b.style.setProperty('--padglow',A.glow);
    b.classList.add('cwart'); b.classList.toggle('cwartlogo',!!A.logo);
  }
  function soon(){ clearTimeout(timer); timer=setTimeout(function(){ try{ paintPad(); }catch(e){} },120); }
  /* small previews for the skin grid and anywhere else a skin's swatch is shown */
  function thumbs(){ try{ var L=window.CW_SKINS&&CW_SKINS.list; if(!L) return; L.forEach(function(s){ if(s.css0) return; var u=CW_PADART.paint(s.i,240,110,1); if(u){ s.css0=s.css; s.css='url('+u+') center/cover'+(s.i===32?',var(--czlogo) 50% 50%/auto 70% no-repeat':''); } });
    if(CW_SKINS.render) CW_SKINS.render(); }catch(e){} }
  function boot(){
    try{ if(window.CW_SKINS&&CW_SKINS.apply&&!CW_SKINS.apply.__art){ var o=CW_SKINS.apply; CW_SKINS.apply=function(i){ var r=o.apply(this,arguments); last=''; soon(); return r; }; CW_SKINS.apply.__art=1; } }catch(e){}
    var pad=document.getElementById('tmrPad'); if(pad&&window.ResizeObserver) new ResizeObserver(soon).observe(pad);
    new MutationObserver(soon).observe(document.body,{attributes:true,attributeFilter:['class']});
    addEventListener('storage',function(e){ if(e.key==='cw_tmr_skin'){ last=''; soon(); } });
    setInterval(function(){ var k=skin(); if(k!==boot.k){ boot.k=k; last=''; soon(); } },1000); boot.k=skin();
    soon(); (window.requestIdleCallback||function(f){ setTimeout(f,600); })(thumbs);
  }
  if(document.readyState!=='loading') boot(); else document.addEventListener('DOMContentLoaded',boot);
})();
