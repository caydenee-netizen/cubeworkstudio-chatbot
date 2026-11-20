/* Update 3 cutscene: a Rubik's cube turns layer by layer and each turn reveals one new feature, then it blows apart into the title. Canvas 2D + WebAudio, about 19 seconds, no voice. */
(function(){
var BPM=100, B=60/BPM, T0=1.8, NF=6, FT=3*B, TB=T0+NF*FT, TD=TB+3*B, DUR=TD+4.6;
var FEAT=[
 {t:'Levels 26 to 30',s:'Five new Cube Dash levels with new looks and new tricks',c:'#26c6da',k:'levels'},
 {t:'A finish effect on every pad',s:'Finish a solve and your pad skin plays an effect of its own',c:'#7c8cff',k:'pads'},
 {t:'12 new pad skins',s:'Fresh skins with the same glowing light show',c:'#ff6ad5',k:'look'},
 {t:'More cars and trails',s:'New paints and trails to race with',c:'#ef5350',k:'cars'},
 {t:'New solving tools',s:'Tools for the timer, the trainer and your records',c:'#ffb300',k:'orbs'},
 {t:'Subtle pads',s:'Turn the effects down if a skin is too flashy',c:'#4fc3f7',k:'modes'}];
var FONT='-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,Helvetica,Arial,sans-serif';
var COL={r:[229,57,53],o:[251,140,0],w:[245,245,242],y:[253,216,53],g:[67,160,71],b:[30,136,229],k:[10,13,20]};
function clamp(x,a,b){ return x<a?a:x>b?b:x; }
function lerp(a,b,t){ return a+(b-a)*t; }
function eo3(x){ x=clamp(x,0,1); return 1-Math.pow(1-x,3); }
function eio(x){ x=clamp(x,0,1); return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2; }
function eob(x){ x=clamp(x,0,1); var c1=1.9,c3=c1+1; return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2); }
function rng(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function rgb(a,k){ return 'rgb('+Math.round(a[0]*k)+','+Math.round(a[1]*k)+','+Math.round(a[2]*k)+')'; }
function hexa(h,a){ var n=parseInt(h.slice(1),16); return 'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')'; }
/* ---------- 3x3 cube maths ---------- */
function mm(a,b){ var o=[0,0,0,0,0,0,0,0,0]; for(var i=0;i<3;i++) for(var j=0;j<3;j++) o[i*3+j]=a[i*3]*b[j]+a[i*3+1]*b[3+j]+a[i*3+2]*b[6+j]; return o; }
function mv(m,v){ return [m[0]*v[0]+m[1]*v[1]+m[2]*v[2],m[3]*v[0]+m[4]*v[1]+m[5]*v[2],m[6]*v[0]+m[7]*v[1]+m[8]*v[2]]; }
function rot(ax,a){ var c=Math.cos(a), s=Math.sin(a); if(ax===0) return [1,0,0,0,c,-s,0,s,c]; if(ax===1) return [c,0,s,0,1,0,-s,0,c]; return [c,-s,0,s,c,0,0,0,1]; }
var DIRS=[[1,0,0,COL.r],[-1,0,0,COL.o],[0,1,0,COL.w],[0,-1,0,COL.y],[0,0,1,COL.g],[0,0,-1,COL.b]];
var TW=[[1,1,1],[0,1,-1],[2,1,1],[1,-1,-1],[0,-1,1],[2,-1,-1]]; /* axis, layer, direction: one per feature */
function cubeAt(t){ var cs=[],i,j,k; for(i=-1;i<=1;i++) for(j=-1;j<=1;j++) for(k=-1;k<=1;k++) cs.push({p:[i,j,k],M:[1,0,0,0,1,0,0,0,1],q:[i,j,k]});
  var pend=null; TW.forEach(function(w,n){ var ts=T0+n*FT; if(t<ts) return; var u=(t-ts)/.46, ang=w[2]*Math.PI/2*(u>=1?1:eio(u)); if(u>=1){ var R=rot(w[0],ang); cs.forEach(function(q){ if(q.p[w[0]]===w[1]){ q.p=mv(R,q.p).map(Math.round); q.M=mm(R,q.M); } }); } else pend={ax:w[0],layer:w[1],ang:ang}; });
  return {cs:cs,pend:pend}; }
/* ---------- scene ---------- */
function Scene(cv){
  var S={cv:cv,c:cv.getContext('2d'),w:0,h:0,dpr:1}, R=rng(23), parts=[], dust=[], shards=[], i;
  for(i=0;i<120;i++) dust.push({x:R(),y:R(),z:.2+R()*.8,p:R()*6.283});
  for(i=0;i<70;i++){ var a=R()*6.283, v=.25+R()*1.1; shards.push({a:a,v:v,r:R()*6.283,vr:(R()-.5)*14,s:.012+R()*.03,c:i%3?'#ffffff':['#e53935','#fb8c00','#fdd835','#43a047','#1e88e5'][i%5]}); }
  S.size=function(){ var d=Math.min(window.devicePixelRatio||1,2), w=window.innerWidth, h=window.innerHeight; S.dpr=d; S.w=w; S.h=h; cv.width=Math.round(w*d); cv.height=Math.round(h*d); cv.style.width=w+'px'; cv.style.height=h+'px'; };
  S.size();
  function glowSprite(col){ var k='g'+col; if(S[k]) return S[k]; var g=document.createElement('canvas'); g.width=g.height=128; var x=g.getContext('2d'), r=x.createRadialGradient(64,64,0,64,64,64); r.addColorStop(0,hexa(col,1)); r.addColorStop(.35,hexa(col,.45)); r.addColorStop(1,hexa(col,0)); x.fillStyle=r; x.fillRect(0,0,128,128); return S[k]=g; }
  function glow(c,x,y,r,col,a){ c.save(); c.globalCompositeOperation='lighter'; c.globalAlpha=a; c.drawImage(glowSprite(col),x-r,y-r,r*2,r*2); c.restore(); }
  /* feature pictograms, drawn around (x,y) with unit u */
  function icon(c,k,x,y,u,col,t){ c.save(); c.translate(x,y); c.lineWidth=Math.max(2,u*.09); c.strokeStyle=col; c.fillStyle=col; c.lineJoin='round'; c.lineCap='round';
    if(k===0){ c.beginPath(); c.moveTo(-u,u*.25); c.lineTo(-u*.45,-u*.25); c.lineTo(u*.3,-u*.3); c.lineTo(u,u*.1); c.lineTo(u*.65,u*.5); c.lineTo(-u*.7,u*.55); c.closePath(); c.globalAlpha=.25; c.fill(); c.globalAlpha=1; c.stroke(); c.strokeRect(-u*.2,-u*.65,u*.5,u*.4); }
    else if(k===1){ c.beginPath(); c.arc(0,0,u*.8,0,6.283); c.stroke(); for(var q=0;q<4;q++){ c.beginPath(); c.moveTo(0,0); c.arc(0,0,u*.62,q*1.5708+t*3,q*1.5708+t*3+.7); c.closePath(); c.globalAlpha=.55; c.fill(); c.globalAlpha=1; } }
    else if(k===2){ c.beginPath(); c.ellipse(0,u*.2,u,u*.38,0,0,6.283); c.globalAlpha=.25; c.fill(); c.globalAlpha=1; c.stroke(); c.beginPath(); c.arc(0,-u*.05,u*.45,Math.PI,6.283); c.stroke(); for(var d=-1;d<=1;d++){ c.beginPath(); c.arc(d*u*.5,u*.22,u*.07,0,6.283); c.fill(); } }
    else if(k===3){ c.beginPath(); c.moveTo(u,0); c.lineTo(-u*.7,-u*.7); c.lineTo(-u*.25,0); c.lineTo(-u*.7,u*.7); c.closePath(); c.globalAlpha=.25; c.fill(); c.globalAlpha=1; c.stroke(); }
    else if(k===4){ c.strokeRect(-u*.6,-u*.55,u*1.2,u*1.0); c.beginPath(); c.moveTo(-u*.6,u*.45); c.lineTo(-u*.6,u*.95); c.moveTo(u*.6,u*.45); c.lineTo(u*.6,u*.95); c.stroke(); c.beginPath(); c.arc(-u*.25,-u*.15,u*.12,0,6.283); c.arc(u*.25,-u*.15,u*.12,0,6.283); c.fill(); }
    else { c.strokeRect(-u*.55,-u*.5,u*1.1,u*.8); c.beginPath(); for(var l=0;l<4;l++){ var a=l/4*3.14; c.moveTo(-u*.55,u*.1); } c.stroke(); c.beginPath(); c.moveTo(-u*.55,u*.3); c.lineTo(-u*1.05,u*.75); c.moveTo(-u*.2,u*.3); c.lineTo(-u*.5,u*.95); c.moveTo(u*.2,u*.3); c.lineTo(u*.5,u*.95); c.moveTo(u*.55,u*.3); c.lineTo(u*1.05,u*.75); c.stroke(); }
    c.restore(); }
  function pic(c,k,x,y,u,col,t,loc){ c.save(); var i2;
    if(k==='modes'){ for(i2=0;i2<6;i2++){ var on=Math.floor(loc*8)%6===i2, sc=on?1.25:.9; icon(c,i2,x+(i2-2.5)*u*2.2,y,u*.75*sc,on?'#ffffff':col,t); } }
    else if(k==='orbs'){ var cols=['#ff5fb7','#ff3b3b','#2d9bff','#2fe08c','#ffd500']; for(i2=0;i2<5;i2++){ var ox=x+(i2-2)*u*1.7, oy=y+Math.sin(t*3+i2)*u*.2; glow(c,ox,oy,u*1.2,cols[i2],.7); c.strokeStyle=cols[i2]; c.lineWidth=u*.16; c.beginPath(); c.arc(ox,oy,u*.5,0,6.283); c.stroke(); c.fillStyle='#fff'; c.beginPath(); c.arc(ox,oy,u*.2,0,6.283); c.fill(); }
      var cx2=x+u*5.2, w=Math.abs(Math.cos(t*4)); glow(c,cx2,y,u*1.3,'#ffd34a',.7); c.fillStyle='#ffd34a'; c.strokeStyle='#8a5a00'; c.lineWidth=2; c.beginPath(); c.ellipse(cx2,y,u*(.12+.5*w),u*.62,0,0,6.283); c.fill(); c.stroke(); }
    else if(k==='look'){ var th=[['#ffb36b','#3a3a7a'],['#ff4fa0','#1b1040'],['#8fd3ff','#0b1b3a'],['#46e6c8','#06303a']]; for(i2=0;i2<4;i2++){ var tx=x+(i2-1.5)*u*2.5, g=c.createLinearGradient(0,y-u,0,y+u); g.addColorStop(0,th[i2][0]); g.addColorStop(1,th[i2][1]); c.fillStyle=g; rrect(c,tx-u*1.05,y-u*1.05,u*2.1,u*2.1,u*.28); c.fill(); c.strokeStyle='rgba(255,255,255,.6)'; c.lineWidth=2; c.stroke(); c.fillStyle='rgba(0,0,0,.38)'; c.beginPath(); if(i2===0){ c.moveTo(tx-u,y+u); c.lineTo(tx-u*.3,y-u*.2); c.lineTo(tx+u*.3,y+u*.5); c.lineTo(tx+u*.7,y); c.lineTo(tx+u,y+u); } else if(i2===1){ for(var b2=0;b2<5;b2++) c.rect(tx-u+b2*u*.42,y+u-(.4+((b2*37)%5)*.14)*u*1.2,u*.34,(.4+((b2*37)%5)*.14)*u*1.2); } else if(i2===2){ c.arc(tx+u*.1,y-u*.1,u*.5,0,6.283); } else { for(var w2=0;w2<3;w2++){ c.moveTo(tx-u,y+u*.1+w2*u*.35); for(var xx=-u;xx<=u;xx+=u*.2) c.lineTo(tx+xx,y+u*.1+w2*u*.35+Math.sin(xx*4+t*3+w2)*u*.1); } c.lineWidth=3; c.strokeStyle='rgba(255,255,255,.55)'; c.stroke(); c.beginPath(); } c.fill(); } }
    else if(k==='levels'){ var gw=u*10, gx=x-gw/2; c.fillStyle='rgba(255,255,255,.14)'; c.fillRect(gx,y+u*.8,gw,u*.14); var off=(t*u*5)%(u*3.2); c.fillStyle=col; for(i2=0;i2<5;i2++){ var sx=gx+gw-i2*u*3.2+off-u*3.2; if(sx<gx||sx>gx+gw-u*.9) continue; c.beginPath(); c.moveTo(sx,y+u*.8); c.lineTo(sx+u*.45,y-u*.2); c.lineTo(sx+u*.9,y+u*.8); c.closePath(); c.fill(); }
      var ph=(t*1.1)%1, jy=Math.sin(ph*3.1416)*u*1.6; c.save(); c.translate(gx+u*1.6,y+u*.8-u*.5-jy); c.rotate(ph*3.1416/2*Math.floor(t*1.1)%2+ph*1.57); c.fillStyle='#fff'; c.fillRect(-u*.5,-u*.5,u,u); c.strokeStyle=col; c.lineWidth=3; c.strokeRect(-u*.5,-u*.5,u,u); c.restore();
      c.font='800 '+Math.round(u*.9)+'px '+FONT; c.fillStyle='#fff'; c.textAlign='center'; for(i2=0;i2<7;i2++){ var lx=gx+(i2+.5)*gw/7; c.globalAlpha=Math.floor(t*6)%7===i2?1:.4; c.fillText(String(19+i2),lx,y-u*1.5); } c.globalAlpha=1; }
    else if(k==='cars'){ var cc=['#ef5350','#26c6da','#7c4dff']; for(i2=0;i2<3;i2++){ var cx3=x+(i2-1)*u*5.2, sc2=i2===1?1.15:.85; c.save(); c.translate(cx3,y); c.scale(sc2,sc2); glow(c,0,0,u*2.6,cc[i2],.35); c.fillStyle=cc[i2]; c.strokeStyle='#fff'; c.lineWidth=2.5; c.beginPath(); c.moveTo(-u*2,u*.4); c.lineTo(-u*1.9,-u*.1); c.lineTo(-u*.9,-u*.2); c.lineTo(-u*.4,-u*.75); c.lineTo(u*.7,-u*.75); c.lineTo(u*1.2,-u*.2); c.lineTo(u*2,0); c.lineTo(u*2,u*.4); c.closePath(); c.fill(); c.stroke(); c.fillStyle='rgba(10,20,40,.7)'; c.beginPath(); c.moveTo(-u*.2,-u*.2); c.lineTo(u*.1,-u*.6); c.lineTo(u*.6,-u*.6); c.lineTo(u*.9,-u*.2); c.closePath(); c.fill(); [-u*1.2,u*1.2].forEach(function(wx){ c.fillStyle='#0b0e17'; c.beginPath(); c.arc(wx,u*.45,u*.42,0,6.283); c.fill(); c.strokeStyle='#fff'; c.lineWidth=2; c.stroke(); c.save(); c.translate(wx,u*.45); c.rotate(t*8); c.beginPath(); c.moveTo(-u*.3,0); c.lineTo(u*.3,0); c.stroke(); c.restore(); }); c.restore(); } }
    else { var tw=u*4.6, th2=u*3.1, hues=[150,285,35]; for(i2=0;i2<3;i2++){ var px=x+(i2-1)*(tw+u*.7), py=y, hu=hues[i2], tt=t+i2*.7, cx4=px, cy4=py; c.save(); rrect(c,px-tw/2,py-th2/2,tw,th2,u*.4); c.clip(); var g2=c.createLinearGradient(px-tw/2,py-th2/2,px+tw/2,py+th2/2); g2.addColorStop(0,'hsl('+hu+',70%,12%)'); g2.addColorStop(1,'hsl('+(hu+40)%360+',70%,20%)'); c.fillStyle=g2; c.fillRect(px-tw/2,py-th2/2,tw,th2); c.globalCompositeOperation='lighter';
        var br=.5+.5*Math.sin(tt*1.9); var gl=c.createRadialGradient(cx4,cy4,0,cx4,cy4,th2*.9); gl.addColorStop(0,'hsla('+hu+',90%,60%,'+(.35+.3*br)+')'); gl.addColorStop(1,'hsla('+hu+',90%,60%,0)'); c.fillStyle=gl; c.fillRect(px-tw/2,py-th2/2,tw,th2);
        c.save(); c.translate(cx4,cy4); c.rotate(tt*.5); for(var rr3=0;rr3<14;rr3++){ c.rotate(6.283/14); var Lr=th2*(.5+.3*(.5+.5*Math.sin(tt*2+rr3*1.7))); c.fillStyle='hsla('+hu+',90%,65%,.12)'; c.beginPath(); c.moveTo(th2*.12,0); c.lineTo(Lr,-th2*.03); c.lineTo(Lr,th2*.03); c.fill(); } c.restore();
        for(var rg2=0;rg2<3;rg2++){ var ur=((tt/2.2)+rg2/3)%1; c.strokeStyle='hsla('+hu+',90%,70%,'+(1-ur)*.6+')'; c.lineWidth=1.5; c.beginPath(); c.arc(cx4,cy4,th2*(.12+ur*.75),0,6.283); c.stroke(); }
        for(var cm=0;cm<3;cm++){ var uc=((tt*.55+cm*.34)%1), ccx=px-tw/2+uc*tw*1.3-tw*.15, ccy=py-th2/2+((cm*37+i2*13)%10)/10*th2; var cg=c.createLinearGradient(ccx-u*1.4,ccy,ccx,ccy); cg.addColorStop(0,'rgba(255,255,255,0)'); cg.addColorStop(1,'hsl('+(hu+cm*40)%360+',95%,70%)'); c.strokeStyle=cg; c.lineWidth=2.4; c.lineCap='round'; c.beginPath(); c.moveTo(ccx-u*1.4,ccy); c.lineTo(ccx,ccy); c.stroke(); c.fillStyle='#fff'; c.beginPath(); c.arc(ccx,ccy,1.8,0,6.283); c.fill(); }
        c.restore(); c.strokeStyle='hsla('+hu+',90%,65%,.85)'; c.lineWidth=2; rrect(c,px-tw/2,py-th2/2,tw,th2,u*.4); c.stroke(); var per=2*(tw+th2), dd=((tt*.35)%1)*per, bx=px-tw/2, by=py-th2/2, qx, qy; if(dd<tw){ qx=bx+dd; qy=by; } else if(dd<tw+th2){ qx=bx+tw; qy=by+dd-tw; } else if(dd<2*tw+th2){ qx=bx+tw-(dd-tw-th2); qy=by+th2; } else { qx=bx; qy=by+th2-(dd-2*tw-th2); } glow(c,qx,qy,u*.8,'#ffffff',.9); }
    }
    c.restore(); }
  function rrect(c,x,y,w,h,r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
  /* the 3D cube */
  function drawCube(c,cx,cy,unit,yaw,pitch,t,spread,alpha,accent){ var st=cubeAt(t), faces=[], Ry=rot(1,yaw), Rx=rot(0,pitch), RM=mm(Rx,Ry), D=7.5, F=unit*D;
    var pr=function(v){ var z=v[2]+D; return [cx+v[0]*F/z, cy-v[1]*F/z, z]; };
    st.cs.forEach(function(q){ var base=q.p.slice(); var inL=st.pend&&q.p[st.pend.ax]===st.pend.layer, Rt=inL?rot(st.pend.ax,st.pend.ang):null;
      DIRS.forEach(function(d,di){ var n0=[d[0],d[1],d[2]], n=mv(q.M,n0), col=null; var qn=mv(rot(0,0),n0); /* coloured only if this face started on the outside */ var ax=d[0]?0:d[1]?1:2, sg=d[ax]; if(q.q[ax]===sg) col=d[3]; var uA=(ax+1)%3, vA=(ax+2)%3, vs=[]; [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(uv){ var l=[0,0,0]; l[ax]=sg*.5; l[uA]=uv[0]*.455; l[vA]=uv[1]*.455; var w=mv(q.M,l); w=[w[0]+base[0],w[1]+base[1],w[2]+base[2]]; if(Rt) w=mv(Rt,w); w=[w[0]*(1+spread),w[1]*(1+spread),w[2]*(1+spread)]; vs.push(mv(RM,w)); }); var nn=Rt?mv(Rt,n):n; nn=mv(RM,nn); var cen=[(vs[0][0]+vs[2][0])/2,(vs[0][1]+vs[2][1])/2,(vs[0][2]+vs[2][2])/2]; if(nn[0]*cen[0]+nn[1]*cen[1]+nn[2]*(cen[2]+D)>=0) return; var sh=.5+.5*Math.max(0,-(nn[0]*-.35+nn[1]*.7+nn[2]*-.6)); faces.push({p:vs.map(pr),z:cen[2],col:col,sh:sh}); }); });
    faces.sort(function(a,b){ return b.z-a.z; }); c.save(); c.globalAlpha=alpha; c.lineJoin='round'; faces.forEach(function(f){ c.beginPath(); f.p.forEach(function(p,i){ if(i) c.lineTo(p[0],p[1]); else c.moveTo(p[0],p[1]); }); c.closePath(); c.fillStyle=f.col?rgb(f.col,.55+.45*f.sh):'#0a0d14'; c.fill(); c.lineWidth=Math.max(1.5,unit*.06); c.strokeStyle='#05070c'; c.stroke(); if(f.col){ c.strokeStyle='rgba(255,255,255,.16)'; c.lineWidth=1; c.beginPath(); c.moveTo(f.p[0][0],f.p[0][1]); c.lineTo(f.p[1][0],f.p[1][1]); c.stroke(); } }); c.restore(); }
  S.draw=function(t){ var c=S.c, w=S.w, h=S.h, d=S.dpr; c.setTransform(d,0,0,d,0,0); var land=w>=h*1.05, U=Math.min(w,h*(land?1:.62)), beat=((t-T0)/B), bph=beat>=0?beat%1:0, kk=beat>=0&&t<TD?Math.pow(1-bph,3):0;
    var fi=clamp(Math.floor((t-T0)/FT),-1,NF-1), fe=t>=T0&&t<TB?FEAT[fi]:null, ts=fi>=0?T0+fi*FT:0, lt=t-ts, accent=fe?fe.c:(t>=TD?'#4fc3f7':'#4fc3f7'), prevAcc=fi>0?FEAT[fi-1].c:'#4fc3f7';
    /* background */
    var bg=c.createLinearGradient(0,0,0,h), a1=fe?fe.c:'#4fc3f7'; bg.addColorStop(0,'#05070d'); bg.addColorStop(.6,'#0a0f1c'); bg.addColorStop(1,'#04060b'); c.fillStyle=bg; c.fillRect(0,0,w,h);
    var tint=t<T0?'#4fc3f7':(t>=TD?'#4fc3f7':a1); glow(c,w*.5,h*.46,Math.max(w,h)*.7,tint,.16+.1*kk);
    /* grid floor */
    c.save(); c.globalCompositeOperation='lighter'; c.strokeStyle=hexa(tint,.22); c.lineWidth=1.2; var hy=h*.62, sp=(t*.6)%1; c.beginPath(); for(i=0;i<14;i++){ var z=(i+sp)/14, y=hy+(h-hy)*z*z; c.moveTo(0,y); c.lineTo(w,y); } for(i=-12;i<=12;i++){ c.moveTo(w/2+i*w*.02,hy); c.lineTo(w/2+i*w*.16,h); } c.stroke(); c.restore();
    /* dust */
    c.fillStyle='#fff'; dust.forEach(function(p){ var x=((p.x+t*.01*p.z)%1)*w, y=((p.y-t*.015*p.z)%1+1)%1*h; c.globalAlpha=.15+.4*p.z*(.5+.5*Math.sin(t*2+p.p)); c.fillRect(x,y,1+p.z*1.6,1+p.z*1.6); }); c.globalAlpha=1;
    /* camera */
    var yaw=.7+t*.32+.2*Math.sin(t*.8), pitch=-.5+.1*Math.sin(t*.6), spin=0; if(t>=TB&&t<TD){ var u2=(t-TB)/(TD-TB); yaw+=u2*u2*12; spin=u2; }
    var side=fi>=0&&t<TB?(fi%2?1:-1):0, tx=side*(land?.24:0), ty=land?0:-.2, prevSide=fi>0?((fi-1)%2?1:-1):0, mv2=eio(lt/.55); var cxf=lerp(prevSide*(land?.24:0),tx,mv2); if(t<T0){ cxf=0; } if(t>=TB) cxf=lerp(cxf,0,eio((t-TB)/(B*1.5)));
    var cx=w*(.5+cxf), cy=h*(land?.5:.3)+(t>=TB&&t<TD?Math.sin(t*60)*spin*5:0), unit=U*(land?.13:.13)*(t<T0?eo3(t/1.6)*.9+.1:1)*(1+.05*kk+(t>=TB&&t<TD?.18*spin*spin:0));
    var cubeA=1, spread=0; if(t>=TD){ var e=(t-TD); spread=eo3(e/1.0)*4.5; cubeA=clamp(1-e/.9,0,1); } if(t<T0) cubeA=clamp(t/.9,0,1);
    glow(c,cx,cy,unit*9,t>=TD?'#ffffff':accent,(.5+.35*kk)*cubeA);
    if(cubeA>0) drawCube(c,cx,cy,unit,yaw,pitch,t,spread,cubeA,accent);
    /* feature card */
    if(fe){ var tl=t-ts, fs=Math.min(w*(land?.05:.085),h*.09), left=land?(side<0?w*.52:w*.08):w*.08, tw2=land?w*.4:w*.84, topY=land?h*.34:h*.55, ou=clamp((TB-t)/.3,0,1), inn=eo3(tl/.4), out=clamp((tl-(FT-.25))/.25,0,1)*(fi<NF-1?1:0), al=inn*(1-out)*ou, sx=(1-eob(tl/.5))*(side<=0?60:-60)*(land?1:0), sy=land?0:(1-eob(tl/.5))*40;
      c.save(); c.globalAlpha=al; c.translate(sx,sy); c.textAlign='left'; c.textBaseline='alphabetic';
      c.font='800 '+Math.round(fs*.34)+'px '+FONT; c.fillStyle=fe.c; c.fillText('NEW  ·  '+(fi+1)+' / '+NF,left,topY-fs*1.55);
      c.font='800 '+Math.round(fs)+'px '+FONT; var words=fe.t.split(' '), line='', lines=[]; words.forEach(function(wd){ var tst=line?line+' '+wd:wd; if(c.measureText(tst).width>tw2&&line){ lines.push(line); line=wd; } else line=tst; }); lines.push(line);
      c.shadowColor=fe.c; c.shadowBlur=26; c.fillStyle='#fff'; lines.forEach(function(ln,i3){ c.fillText(ln,left,topY+i3*fs*1.06); }); c.shadowBlur=0;
      var ly=topY+(lines.length-1)*fs*1.06+fs*.5; c.fillStyle=fe.c; c.fillRect(left,ly,Math.min(tw2,fs*5)*eo3(tl/.6),Math.max(3,fs*.08));
      c.font='600 '+Math.round(fs*.36)+'px '+FONT; c.fillStyle='rgba(255,255,255,.82)'; var sw=fe.s.split(' '), sl='', sls=[]; sw.forEach(function(wd){ var tst=sl?sl+' '+wd:wd; if(c.measureText(tst).width>tw2&&sl){ sls.push(sl); sl=wd; } else sl=tst; }); sls.push(sl); sls.forEach(function(ln,i4){ c.fillText(ln,left,ly+fs*.75+i4*fs*.48); });
      var pu=fs*.62, py2=ly+fs*.75+sls.length*fs*.48+pu*2.6, px2=left+Math.min(tw2,w*.4)/2; if(!land){ px2=w/2; } c.globalAlpha=al*eo3((tl-.15)/.4); pic(c,fe.k,px2,py2,pu,fe.c,t,tl*.9); c.restore(); }
    /* build-up */
    if(t>=TB&&t<TD){ var bu=(t-TB)/(TD-TB); c.save(); c.globalCompositeOperation='lighter'; c.strokeStyle=hexa('#ffffff',.18+.3*bu); c.lineWidth=2; c.beginPath(); for(i=0;i<40;i++){ var an=i/40*6.283+t*.3, r1=Math.max(w,h)*(.9-.6*bu*((i%3)*.3+.7)), r2=r1+Math.max(w,h)*.25; c.moveTo(cx+Math.cos(an)*r1,cy+Math.sin(an)*r1); c.lineTo(cx+Math.cos(an)*r2,cy+Math.sin(an)*r2); } c.stroke(); c.restore();
      var nb=Math.floor((t-TB)/B); c.font='800 '+Math.round(U*.34*(1+.35*Math.pow(1-((t-TB)/B)%1,3)))+'px '+FONT; c.textAlign='center'; c.textBaseline='middle'; c.fillStyle='rgba(255,255,255,'+(.12+.2*Math.pow(1-((t-TB)/B)%1,3))+')'; c.fillText(String(3-nb),w/2,h*.5); }
    /* drop + title */
    if(t>=TD){ var e2=t-TD; shards.forEach(function(s2){ var dist=eo3(e2/1.6)*s2.v*Math.max(w,h)*.9, x=cx+Math.cos(s2.a)*dist, y=cy+Math.sin(s2.a)*dist+e2*e2*90, al2=clamp(1-e2/1.8,0,1); if(al2<=0) return; c.save(); c.translate(x,y); c.rotate(s2.r+s2.vr*e2); c.globalAlpha=al2; c.fillStyle=s2.c; var z=s2.s*U*(1+(1-al2)*0); c.fillRect(-z/2,-z/2,z,z); c.restore(); });
      for(i=0;i<4;i++){ var rr2=eo3((e2-i*.07)/1.1)*Math.max(w,h)*.7; if(rr2<=0) continue; c.save(); c.globalCompositeOperation='lighter'; c.strokeStyle='rgba(255,255,255,'+clamp(1-e2/1.1-i*.1,0,1)*.7+')'; c.lineWidth=6-i; c.beginPath(); c.arc(cx,cy,rr2,0,6.283); c.stroke(); c.restore(); }
      var tp=eob((e2-.12)/.6), tsz=Math.min(w*.13,h*.2), tcx=w/2, tcy=h*.46, al3=clamp((e2-.1)/.2,0,1)*clamp((DUR-t)/.8,0,1); if(al3>0){ c.save(); c.translate(tcx,tcy); c.scale(1+(1-tp)*1.6,1+(1-tp)*1.6); c.globalAlpha=al3; c.font='900 '+Math.round(tsz)+'px '+FONT; c.textAlign='center'; c.textBaseline='middle'; var sp2=clamp(1-e2/.7,0,1)*tsz*.07; c.globalCompositeOperation='lighter'; c.fillStyle='rgba(255,40,90,.9)'; c.fillText('UPDATE 3',-sp2,0); c.fillStyle='rgba(30,220,255,.9)'; c.fillText('UPDATE 3',sp2,0); c.globalCompositeOperation='source-over'; c.shadowColor='#4fc3f7'; c.shadowBlur=40; c.fillStyle='#fff'; c.fillText('UPDATE 3',0,0); c.restore();
        var ul=eo3((e2-.7)/.7); c.fillStyle='#4fc3f7'; c.globalAlpha=al3; c.fillRect(w/2-tsz*2.1*ul,tcy+tsz*.58,tsz*4.2*ul,Math.max(3,tsz*.05)); c.font='700 '+Math.round(tsz*.24)+'px '+FONT; c.textAlign='center'; c.fillStyle='rgba(255,255,255,'+eo3((e2-1.1)/.6)*.9+')'; c.fillText('Cuber Tools',w/2,tcy+tsz*.95); c.font='600 '+Math.round(tsz*.17)+'px '+FONT; c.fillStyle='rgba(255,255,255,'+eo3((e2-1.7)/.6)*.7+')'; c.fillText('Levels 26 to 30  ·  pad finish effects  ·  12 new skins  ·  and more',w/2,tcy+tsz*1.28); c.globalAlpha=1; } }
    /* cut effects: white flash on every cut, teal tint, black and white, invert */
    var cutT=[T0,T0+FT,T0+2*FT,T0+3*FT,T0+4*FT,T0+5*FT,TD], ci=-1; cutT.forEach(function(ct,n){ if(t>=ct&&t<ct+.2) ci=n; }); if(ci>=0){ var u3=(t-cutT[ci])/.2, ty=ci===6?0:ci%4; if(ty===0||ci===6){ c.fillStyle='rgba(255,255,255,'+(ci===6?1:.85)*Math.pow(1-u3,2)+')'; c.fillRect(0,0,w,h); } else if(ty===1){ c.fillStyle='rgba(255,255,255,'+.7*Math.pow(1-u3,2)+')'; c.fillRect(0,0,w,h); c.fillStyle='rgba(40,230,210,'+.45*(1-u3)+')'; c.fillRect(0,0,w,h); } else if(ty===2){ c.save(); c.globalCompositeOperation='saturation'; c.fillStyle='#000'; c.globalAlpha=1-u3*.4; c.fillRect(0,0,w,h); c.restore(); c.fillStyle='rgba(255,255,255,'+.6*Math.pow(1-u3,2)+')'; c.fillRect(0,0,w,h); } else { c.save(); c.globalCompositeOperation='difference'; c.fillStyle='#fff'; c.globalAlpha=(1-u3)*.9; c.fillRect(0,0,w,h); c.restore(); } }
    /* cinematic bars, vignette, fades */
    var bar=h*.055*eo3(t/1.2)*(t>=TD?clamp(1-(t-TD)/.5,0,1):1); c.fillStyle='#000'; c.fillRect(0,0,w,bar); c.fillRect(0,h-bar,w,bar);
    var vg=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.35,w/2,h/2,Math.max(w,h)*.8); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.65)'); c.fillStyle=vg; c.fillRect(0,0,w,h);
    if(t<.5){ c.fillStyle='rgba(0,0,0,'+(1-t/.5)+')'; c.fillRect(0,0,w,h); } if(t>DUR-.7){ c.fillStyle='rgba(0,0,0,'+clamp((t-(DUR-.7))/.7,0,1)+')'; c.fillRect(0,0,w,h); } };
  return S; }
/* ---------- sound: 100 bpm synth, no voice ---------- */
function audio(){ var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return null; var a=new AC(), M=a.createGain(); M.gain.value=.9; var cp=a.createDynamicsCompressor(); M.connect(cp); cp.connect(a.destination); var T=a.currentTime+.1;
  var nb=a.createBuffer(1,a.sampleRate*3,a.sampleRate), nd=nb.getChannelData(0); for(var i=0;i<nd.length;i++) nd[i]=Math.random()*2-1;
  function osc(type,f0,f1,t,dur,vol,lp,at){ var o=a.createOscillator(), g=a.createGain(), f=a.createBiquadFilter(); o.type=type; o.frequency.setValueAtTime(f0,T+t); if(f1!==f0) o.frequency.exponentialRampToValueAtTime(f1,T+t+dur); f.type='lowpass'; f.frequency.value=lp||12000; g.gain.setValueAtTime(0,T+t); g.gain.linearRampToValueAtTime(vol,T+t+(at||.005)); g.gain.exponentialRampToValueAtTime(.0001,T+t+dur); o.connect(f); f.connect(g); g.connect(M); o.start(T+t); o.stop(T+t+dur+.05); }
  function noise(t,dur,vol,ft,f0,f1,q){ var s=a.createBufferSource(); s.buffer=nb; var g=a.createGain(), f=a.createBiquadFilter(); f.type=ft; f.Q.value=q||1; f.frequency.setValueAtTime(f0,T+t); if(f1) f.frequency.exponentialRampToValueAtTime(f1,T+t+dur); g.gain.setValueAtTime(vol,T+t); g.gain.exponentialRampToValueAtTime(.0001,T+t+dur); s.connect(f); f.connect(g); g.connect(M); s.start(T+t,Math.random()); s.stop(T+t+dur+.05); }
  function kick(t,v){ osc('sine',150,42,t,.2,.9*(v||1)); noise(t,.02,.2,'highpass',2500); }
  function riser(t0,t1,v){ var s=a.createBufferSource(); s.buffer=nb; s.loop=true; var g=a.createGain(), f=a.createBiquadFilter(); f.type='bandpass'; f.Q.value=2; f.frequency.setValueAtTime(300,T+t0); f.frequency.exponentialRampToValueAtTime(9000,T+t1); g.gain.setValueAtTime(.0001,T+t0); g.gain.exponentialRampToValueAtTime(v,T+t1); g.gain.linearRampToValueAtTime(0,T+t1+.03); s.connect(f); f.connect(g); g.connect(M); s.start(T+t0); s.stop(T+t1+.1); }
  var A=55, n=function(semi,oct){ return A*Math.pow(2,semi/12)*(oct||1); }, prog=[0,-4,-2,-5]; /* A minor: i, VI, VII-ish, V */
  /* intro hum */
  osc('sawtooth',n(0,2),n(0,4),0,T0+.2,.07,900,1.2); osc('sine',n(0,1),n(0,1),0,T0,.25,2000,1);
  osc('sine',900,2400,.1,1.5,.03); 
  /* the groove */
  for(var b=0;b<Math.floor((TB-T0)/B);b++){ var t=T0+b*B, ch=prog[Math.floor(b/4)%4]; kick(t); if(b%2===1){ noise(t,.14,.22,'bandpass',1900,0,1.2); osc('triangle',190,150,t,.09,.12); } noise(t+B/2,.05,.07,'highpass',8000); noise(t+B*.75,.03,.03,'highpass',9000);
    osc('sawtooth',n(ch,2),n(ch,2),t,B*.9,.2,520); osc('sine',n(ch,1),n(ch,1),t,B*.9,.24); osc('sawtooth',n(ch,2),n(ch,2),t+B/2,B*.35,.14,420);
    [0,3,7,10,12,10,7,3].forEach(function(st,q){ if(q%2===0||b%2) osc('square',n(ch+st,4),n(ch+st,4),t+q*B/4*1,B*.2,.035,2600,.003); }); }
  /* every feature: a whoosh then a hit on the cut */
  for(var f=0;f<NF;f++){ var tf=T0+f*FT; noise(tf-.32,.34,.2,'bandpass',300,6000,2); noise(tf,.18,.22,'highpass',3000); osc('sine',900,300,tf,.14,.12); osc('square',n(prog[f%4]+12,8),n(prog[f%4]+12,8),tf+.02,.3,.05,3500); }
  /* build-up: riser, snare roll that speeds up, the kick falls away */
  riser(TB,TD,.5); for(var q=0;q<12;q++){ var rt=TB+q*B/4; noise(rt,.08,.12+q*.012,'bandpass',2000,0,1); } for(var q2=0;q2<12;q2++){ var rt2=TB+3*B*.6666+q2*B/8; if(rt2<TD) noise(rt2,.05,.12+q2*.01,'bandpass',2600,0,1); } osc('sawtooth',n(0,2),n(0,8),TB,TD-TB,.12,6000,1);
  [TB,TB+B,TB+2*B].forEach(function(bt){ kick(bt,.8); osc('sine',1400,1400,bt+.01,.08,.1); });
  /* drop */
  var td=TD; osc('sine',90,32,td,1.6,1.1); noise(td,.5,.6,'lowpass',9000,200); noise(td,2.2,.3,'highpass',5000,9000); [0,3,7,10,14].forEach(function(st,q){ osc('sawtooth',n(st,4),n(st,4),td,2.4,.07,3800,.01); osc('square',n(st,2),n(st,2),td,2.4,.045,1800,.01); });
  for(var b2=0;b2<8;b2++){ var t2=td+B+b2*B; if(t2>DUR-.8) break; kick(t2,.9); if(b2%2) noise(t2,.14,.2,'bandpass',1900,0,1.2); noise(t2+B/2,.05,.07,'highpass',8000); osc('sawtooth',n(prog[b2%4],2),n(prog[b2%4],2),t2,B*.85,.2,540); }
  [1318.5,1568,1975.5,2637].forEach(function(fq,q){ osc('sine',fq,fq,td+.9+q*.1,1.6,.05); }); osc('square',1320,1320,td+1.6,.35,.05,3000); osc('square',1760,1760,td+1.8,.5,.05,3000);
  return {master:M,stop:function(){ try{ M.gain.setTargetAtTime(0,a.currentTime,.05); setTimeout(function(){ try{ a.close(); }catch(e){} },300); }catch(e){} }}; }
window.CWCut3={dur:DUR,Scene:Scene,
  play:function(opts){ opts=opts||{}; var wrap=document.createElement('div'); wrap.className='ucut'; wrap.setAttribute('role','dialog'); wrap.setAttribute('aria-label','Update 3');
    wrap.innerHTML='<canvas></canvas><button type="button" class="ucut-sk" hidden>Skip</button><button type="button" class="ucut-mu" aria-label="Sound">Sound</button>'; document.body.appendChild(wrap); document.documentElement.classList.add('ucut-on');
    var cv=wrap.querySelector('canvas'), sk=wrap.querySelector('.ucut-sk'), mu=wrap.querySelector('.ucut-mu'), sc=Scene(cv), au=null, muted=false, t0=performance.now(), done=false, raf=0;
    try{ au=audio(); }catch(e){}
    mu.onclick=function(){ muted=!muted; mu.textContent=muted?'Muted':'Sound'; if(au) au.master.gain.value=muted?0:.9; };
    function end(){ if(done) return; done=true; cancelAnimationFrame(raf); window.removeEventListener('resize',rs); if(au) au.stop(); wrap.classList.add('out'); setTimeout(function(){ wrap.remove(); document.documentElement.classList.remove('ucut-on'); if(opts.onend) opts.onend(); },420); }
    function rs(){ sc.size(); }
    window.addEventListener('resize',rs); sk.onclick=end;
    (function loop(){ var t=(performance.now()-t0)/1000; try{ sc.draw(Math.min(t,DUR)); }catch(e){ console.error(e); } if(t>3&&sk.hidden) sk.hidden=false; if(t>=DUR){ end(); return; } raf=requestAnimationFrame(loop); })();
    return {end:end}; }};
})();
