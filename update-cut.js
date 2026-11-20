/* The update cutscene: 15 seconds. Old Cuber Tools -> black hole -> the new intro.
   Everything is drawn as a function of time, so any frame can be rendered on its own. */
(function(){
var DUR=15;
var FEAT=[['🟦','Dash Levels 8–12','#4fc3f7'],['⚙️','New Dash Obstacles','#ff7043'],['🛡','Dash Power-ups','#42a5f5'],['🏆','Weekly Dash Board','#ffb300'],
 ['🎨','12 New Pad Skins','#ab47bc'],['🤖','AI Level Maker','#26c6da'],['🚗','6 New Cars','#ef5350'],['🌈','6 New Trails','#66bb6a'],
 ['🎬','Race Replays','#ec407a'],['👁','Watch Live Races','#26a69a'],['🤝','Team Races','#5c6bc0'],['⚔️','Club War','#ff7043'],
 ['🪪','Profile Cards','#42a5f5'],['⚙','Settings Page','#8d99ae'],['🔍','Verdict Compare','#ab47bc'],['↶','3D Cube Undo','#26c6da']];
var TXT_OLD='THE OLD CUBER TOOLS', TXT_T='THE UPDATE';
var FEAT1, OLD1;
var FEAT2=[['🟦','Dash Levels 13–18','#4fc3f7'],['🔴','Lasers','#ef5350'],['⚙️','Combo Obstacles','#ff7043'],['🤖','AI Maker Upgrades','#26c6da'],
 ['🔗','AI Level Links','#42a5f5'],['🚗','6 More Cars','#ffb300'],['🌈','7 More Trails','#66bb6a'],['🏁','Race Record','#ec407a'],
 ['💬','Spectator Reactions','#26a69a'],['🎯','Practice Goals','#5c6bc0'],['📘','Daily Case','#ab47bc'],['💡','3D Cube Hints','#26c6da'],
 ['📈','Verdict History','#8d99ae'],['🎨','12 More Pad Skins','#ff7043'],['✨','4 More Animated','#42a5f5'],['🎁','Launch Gifts','#ffb300']];
var OLD2=[['🟦','Cube Dash','Levels 1–12'],['🚗','Garage','Cars, trails, skins'],['🏁','Cube Race','Race other cubers'],['⏱','Timer','Time your solves'],['🔍','Solve Verdict','Analyse a solve'],['⚙','Settings','Your account']];
var OLD=[['⏱','Timer','Time your solves'],['📚','Learn CFOP','F2L, OLL and PLL'],['🏁','Cube Race','Race other cubers'],['🚗','Garage','Cars, trails, skins'],['🛡','Clubs & Trade','Teams and swaps'],['🎁','Rewards','Spin and gifts']];
var STK=['#e53935','#fb8c00','#fdd835','#43a047','#1e88e5','#ffffff'];
function clamp(x,a,b){ return x<a?a:x>b?b:x; }
function lerp(a,b,t){ return a+(b-a)*t; }
function eo3(t){ t=clamp(t,0,1); return 1-Math.pow(1-t,3); }
function ei3(t){ t=clamp(t,0,1); return t*t*t; }
function eio(t){ t=clamp(t,0,1); return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; }
function eob(t){ t=clamp(t,0,1); var c1=1.70158,c3=c1+1; return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2); }
function seg(t,a,b){ return clamp((t-a)/(b-a),0,1); }
function rng(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function rr(c,x,y,w,h,r){ r=Math.min(r,w/2,h/2); c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
var FONT='-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,Helvetica,Arial,sans-serif';
var EMO='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

function Scene(cv){
  var S={cv:cv,c:cv.getContext('2d'),w:0,h:0,dpr:1,stars:[],layout:null,sprites:null};
  var R=rng(7); for(var i=0;i<220;i++) S.stars.push({a:R()*6.283,r:R(),s:.4+R()*1.4,tw:R()*6.283});
  S.size=function(){ var d=Math.min(window.devicePixelRatio||1,2), w=window.innerWidth, h=window.innerHeight; S.dpr=d; S.w=w; S.h=h; cv.width=Math.round(w*d); cv.height=Math.round(h*d); cv.style.width=w+'px'; cv.style.height=h+'px'; S.layout=null; S.sprites=null; };
  S.size();
  /* ---------- old home, laid out once ---------- */
  function lay(){
    var w=S.w,h=S.h,U=Math.min(w,h)/100, port=h>w*1.05, sw=Math.min(w*.94,port?w*.94:h*1.45), sh=Math.min(h*.84,port?h*.8:sw*.62), sx=(w-sw)/2, sy=(h-sh)/2, pad=sw*.045;
    var cols=port?2:3, rows=port?3:2, gap=sw*.025, hd=sh*.22, cw=(sw-pad*2-gap*(cols-1))/cols, ch=(sh-hd-pad*1.4-gap*(rows-1))/rows, cards=[];
    OLD.forEach(function(o,i){ var cx=i%cols, cy=Math.floor(i/cols); cards.push({x:sx+pad+cx*(cw+gap),y:sy+hd+cy*(ch+gap),w:cw,h:ch,o:o}); });
    S.layout={U:U,port:port,sx:sx,sy:sy,sw:sw,sh:sh,pad:pad,hd:hd,cards:cards};
    /* pre-render each old piece so the black hole can tear it apart cheaply */
    var d=S.dpr, mk=function(w,h,fn){ var o=document.createElement('canvas'); o.width=Math.max(2,Math.round(w*d)); o.height=Math.max(2,Math.round(h*d)); var x=o.getContext('2d'); x.scale(d,d); fn(x,w,h); return o; };
    var L=S.layout; L.sp={};
    L.sp.screen=mk(sw,sh,function(x,w,h){ x.fillStyle='#f3f4f8'; rr(x,0,0,w,h,sw*.03); x.fill(); x.strokeStyle='rgba(0,0,0,.08)'; x.lineWidth=1; x.stroke(); });
    L.sp.head=mk(sw-pad*2,hd-pad*.4,function(x,w,h){ x.fillStyle='#14161c'; x.textBaseline='top'; x.font='800 '+Math.round(h*.42)+'px '+FONT; x.fillText('Cuber Tools',0,h*.08); x.fillStyle='#6b7080'; x.font='500 '+Math.round(h*.2)+'px '+FONT; x.fillText('Time your solves, learn CFOP and race other cubers.',0,h*.62); });
    L.sp.cards=cards.map(function(k){ return mk(k.w,k.h,function(x,w,h){ x.shadowColor='rgba(20,22,40,.14)'; x.shadowBlur=14; x.shadowOffsetY=4; x.fillStyle='#fff'; rr(x,3,3,w-6,h-8,w*.07); x.fill(); x.shadowColor='transparent'; x.fillStyle='#14161c'; x.textBaseline='middle'; var fs=Math.min(h*.3,w*.12); x.font=Math.round(fs*1.5)+'px '+EMO; x.fillText(k.o[0],w*.08,h*.36); x.font='700 '+Math.round(fs)+'px '+FONT; x.fillText(k.o[1],w*.08,h*.66); x.fillStyle='#6b7080'; x.font='500 '+Math.round(fs*.62)+'px '+FONT; x.fillText(k.o[2],w*.08,h*.82); }); });
    /* new tiles */
    var tc=4, tr=Math.ceil(FEAT.length/tc), tg=U*1.6, tw=Math.min((w*.94-tg*(tc-1))/tc,(h*(port?.62:.7)-tg*(tr-1))/tr*(port?.8:1.5)), th=Math.min(tw*(port?1.05:.72),(h*(port?.62:.7)-tg*(tr-1))/tr);
    L.tc=tc; L.tr=tr; L.tw=tw; L.th=th; L.tg=tg; L.tx0=(w-(tw*tc+tg*(tc-1)))/2; L.ty0=h/2-(th*tr+tg*(tr-1))/2+(port?h*.06:0);
    L.sp.tiles=FEAT.map(function(f){ return mk(tw,th,function(x,w,h){ var g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(255,255,255,.14)'); g.addColorStop(1,'rgba(255,255,255,.05)'); x.fillStyle=g; rr(x,1,1,w-2,h-2,w*.1); x.fill(); x.strokeStyle=f[2]; x.globalAlpha=.85; x.lineWidth=2; x.stroke(); x.globalAlpha=1;
      var fs=Math.min(h*.2,w*.13); x.textAlign='center'; x.textBaseline='middle'; x.font=Math.round(fs*2.1)+'px '+EMO; x.fillText(f[0],w/2,h*.4); x.fillStyle='#fff'; var tf=Math.round(fs); x.font='700 '+tf+'px '+FONT; while(x.measureText(f[1]).width>w*.9&&tf>8){ tf--; x.font='700 '+tf+'px '+FONT; } x.fillText(f[1],w/2,h*.76); }); });
  }
  function cubeIso(c,x,y,e,t){ /* little 3x3 cube logo, e = edge length */
    var k=Math.sqrt(3)/2, a=e/3;
    function face(ox,oy,ux,uy,vx,vy,seed){ var R=rng(seed); for(var i=0;i<3;i++) for(var j=0;j<3;j++){ c.fillStyle=STK[Math.floor(R()*6)]; var px=ox+(ux*i+vx*j)*a, py=oy+(uy*i+vy*j)*a, q=.9; c.beginPath(); c.moveTo(px,py); c.lineTo(px+ux*a*q,py+uy*a*q); c.lineTo(px+(ux+vx)*a*q,py+(uy+vy)*a*q); c.lineTo(px+vx*a*q,py+vy*a*q); c.closePath(); c.fill(); } }
    c.save(); c.translate(x,y+Math.sin(t*2)*e*.04); c.fillStyle='#0a0a0f'; c.beginPath(); c.moveTo(0,-e); c.lineTo(k*e,-.5*e); c.lineTo(k*e,.5*e); c.lineTo(0,e); c.lineTo(-k*e,.5*e); c.lineTo(-k*e,-.5*e); c.closePath(); c.fill();
    face(0,-e,k,.5,-k,.5,3); face(-k*e,-.5*e,0,1,k,.5,5); face(0,0,0,1,k,-.5,9); c.restore(); }
  /* the faces above are placed on an isometric lattice: top, left, right */
  S.draw=function(t){
    var c=S.c,w=S.w,h=S.h,d=S.dpr; if(!S.layout) lay(); var L=S.layout,U=L.U,cx=w/2,cy=h/2; c.setTransform(d,0,0,d,0,0);
    c.fillStyle='#000'; c.fillRect(0,0,w,h);
    /* ---------- A: the old Cuber Tools, 0-5.2 ---------- */
    if(t<8.6){
      var a1=t<5.0?1:0, zoom=1+.05*seg(t,0,5), fadeIn=eo3(seg(t,0,.9));
      var dark=eio(seg(t,4.7,5.9));      /* old light screen dims into space */
      c.fillStyle='rgb('+Math.round(lerp(243,3,dark))+','+Math.round(lerp(244,4,dark))+','+Math.round(lerp(248,8,dark))+')'; c.fillRect(0,0,w,h);
      /* stars */
      if(dark>0) stars(c,w,h,cx,cy,t,dark,U);
      /* old UI pieces */
      var hole=t>5.0, tear0=5.15;
      c.save(); c.globalAlpha=fadeIn; c.translate(cx,cy); c.scale(zoom,zoom); c.translate(-cx,-cy);
      var sf=1-eio(seg(t,5.0,6.3)); if(sf>0){ c.save(); c.globalAlpha*=sf; var ss=1-.1*(1-sf); c.translate(cx,cy); c.scale(ss,ss); c.translate(-cx,-cy); c.drawImage(L.sp.screen,L.sx,L.sy,L.sw,L.sh); c.restore(); }
      var hs=pieceState({x:L.sx+L.pad,y:L.sy+L.pad*.6,w:L.sw-L.pad*2,h:L.hd},t,tear0+1.7,1.6,cx,cy,U,7);
      if(hs.vis) drawPiece(c,L.sp.head,L.sx+L.pad,L.sy+L.pad*.6,L.sw-L.pad*2,L.hd-L.pad*.4,hs,d);
      /* tag + small cube */
      if(t<5.4){ var ta=eo3(seg(t,.6,1.3))*(1-seg(t,4.7,5.2)); c.globalAlpha=ta*fadeIn; var fs=Math.max(11,U*1.8); c.font='700 '+fs+'px '+FONT; var pw=c.measureText(TXT_OLD).width+fs*1.8; c.fillStyle='#14161c'; rr(c,L.sx+L.pad,Math.max(fs*.6,L.sy-fs*2.6),pw,fs*1.9,fs); c.fill(); c.fillStyle='#fff'; c.textBaseline='middle'; c.textAlign='left'; c.fillText(TXT_OLD,L.sx+L.pad+fs*.9,Math.max(fs*.6,L.sy-fs*2.6)+fs*.95); c.globalAlpha=fadeIn; }
      L.cards.forEach(function(k,i){
        var ent=eo3(seg(t,.9+i*.14,1.7+i*.14)); var st=pieceState(k,t,tear0+i*.17,1.5,cx,cy,U,i+1);
        if(!st.vis) return; var dy=(1-ent)*U*4; c.save(); c.globalAlpha*=ent; if(!st.on) c.translate(0,dy); drawPiece(c,L.sp.cards[i],k.x,k.y,k.w,k.h,st,d); c.restore(); });
      c.restore();
      /* the black hole */
      if(t>4.7) hole3(c,w,h,cx,cy,t,U);
      /* tagline under the old UI */
      if(t<5.2){ var la=eo3(seg(t,2.2,3.0))*(1-seg(t,4.5,5.0)); if(la>0){ c.globalAlpha=la; c.fillStyle='#14161c'; c.font='800 '+Math.round(U*3.2)+'px '+FONT; c.textAlign='center'; c.textBaseline='middle'; c.fillText('Time. Learn. Race.',cx,L.sy+L.sh+Math.min(U*7,(h-L.sy-L.sh)*.5)); c.globalAlpha=1; } }
    }
    /* ---------- C: the new intro, 8.4-15 ---------- */
    if(t>=8.4){ newIntro(c,w,h,cx,cy,t,U,L,d); }
    /* flash at the singularity */
    var fl=t<8.7?eio(seg(t,8.28,8.46)):1-eo3(seg(t,8.46,9.15)); if(fl>0){ c.fillStyle='rgba(255,255,255,'+fl.toFixed(3)+')'; c.fillRect(0,0,w,h); }
    /* leave */
    var out=seg(t,14.35,15); if(out>0){ c.fillStyle='rgba(0,0,0,'+(out*.0).toFixed(3)+')'; }
    /* fade in from black at the very start */
    var f0=1-eo3(seg(t,0,.7)); if(f0>0){ c.fillStyle='rgba(0,0,0,'+f0.toFixed(3)+')'; c.fillRect(0,0,w,h); }
  };
  /* how one old piece is torn toward the hole */
  function pieceState(k,t,t0,dur,cx,cy,U,seed){
    var u=seg(t,t0,t0+dur); if(u<=0) return {vis:true,on:false}; if(u>=1) return {vis:false};
    var mx=k.x+k.w/2-cx, my=k.y+k.h/2-cy, r0=Math.sqrt(mx*mx+my*my)+1, a0=Math.atan2(my,mx), e=ei3(u)*.55+u*.45, r=r0*Math.pow(1-e,1.55), a=a0+e*(3.4+seed*.05);
    return {vis:true,on:true,x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r,rot:a-a0+e*5,sx:(1-e*.8)*(1+e*2.6),sy:(1-e*.9)*(1-e*.55),al:1-Math.pow(u,3)*.8,w:k.w,h:k.h}; }
  function drawPiece(c,img,x,y,w,h,s,d){
    if(!s.on){ c.drawImage(img,x,y,w,h); return; }
    c.save(); c.translate(s.x,s.y); c.rotate(s.rot); c.scale(Math.max(.01,s.sx),Math.max(.01,s.sy)); c.globalAlpha*=clamp(s.al,0,1); c.drawImage(img,-w/2,-h/2,w,h); c.restore(); }
  function stars(c,w,h,cx,cy,t,al,U){
    var rs=Math.max(w,h)*.75, sp=seg(t,5.0,8.3);
    S.stars.forEach(function(s){ var a=s.a+sp*sp*5*(1+s.r), r=s.r*rs*(1-sp*sp*.9*s.r), x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r, tw=.6+.4*Math.sin(t*2+s.tw), len=1+sp*sp*U*5*s.r;
      c.strokeStyle='rgba(255,255,255,'+(al*tw*(.35+.65*s.r)).toFixed(3)+')'; c.lineWidth=s.s; c.beginPath(); c.moveTo(x,y); c.lineTo(x-Math.cos(a+1.57)*len*(1+sp*2),y-Math.sin(a+1.57)*len*(1+sp*2)); c.stroke(); }); }
  function hole3(c,w,h,cx,cy,t,U){
    var p=seg(t,4.7,8.3), grow=eo3(seg(t,4.75,6.0)), shrink=1-eio(seg(t,8.0,8.3)), R=Math.min(w,h)*.115*grow*shrink; if(R<1) return;
    var pul=1+.02*Math.sin(t*9);
    c.save(); c.translate(cx,cy);
    /* glow */
    var g=c.createRadialGradient(0,0,R*.9,0,0,R*4.4); g.addColorStop(0,'rgba(255,170,60,.55)'); g.addColorStop(.35,'rgba(255,90,20,.18)'); g.addColorStop(1,'rgba(255,60,0,0)'); c.fillStyle=g; c.beginPath(); c.arc(0,0,R*4.4,0,6.283); c.fill();
    /* accretion disk: back half under, front over */
    function disk(front){ c.save(); c.rotate(-.32); c.scale(1,.26); c.rotate(t*.9*(front?1:1));
      var N=140, rr0=R*1.12, rr1=R*3.6, R2=rng(front?3:4);
      for(var i=0;i<N;i++){ var a=(i/N)*6.283+t*1.2, rad=lerp(rr0,rr1,Math.pow(R2(),.7)), band=R2(), vis=front?Math.sin(a)>=0:Math.sin(a)<0; if(!vis) continue; var heat=1-(rad-rr0)/(rr1-rr0); c.fillStyle='rgba('+Math.round(lerp(255,255,heat))+','+Math.round(lerp(90,235,heat))+','+Math.round(lerp(10,170,heat))+','+(.55*heat+.08).toFixed(3)+')'; c.beginPath(); c.arc(Math.cos(a)*rad,Math.sin(a)*rad,lerp(U*.5,U*1.7,band)*(.4+heat),0,6.283); c.fill(); }
      var rg=c.createRadialGradient(0,0,rr0*.96,0,0,rr1); rg.addColorStop(0,'rgba(255,255,255,0)'); rg.addColorStop(.06,'rgba(255,245,210,.9)'); rg.addColorStop(.22,'rgba(255,170,60,.65)'); rg.addColorStop(.6,'rgba(255,80,20,.22)'); rg.addColorStop(1,'rgba(255,50,0,0)');
      c.globalCompositeOperation='lighter'; c.fillStyle=rg; c.beginPath(); c.arc(0,0,rr1,0,6.283); c.arc(0,0,rr0*.96,0,6.283,true); c.fill(); c.globalCompositeOperation='source-over'; c.restore(); }
    disk(false);
    /* the hole and its photon ring */
    c.fillStyle='#000'; c.beginPath(); c.arc(0,0,R*pul,0,6.283); c.fill();
    c.strokeStyle='rgba(255,236,200,.95)'; c.lineWidth=Math.max(1.5,R*.04); c.shadowColor='rgba(255,170,70,.9)'; c.shadowBlur=R*.35; c.beginPath(); c.arc(0,0,R*1.03*pul,0,6.283); c.stroke(); c.shadowBlur=0;
    /* lensed light bent over the top and under the bottom */
    c.save(); c.rotate(-.32); c.globalCompositeOperation='lighter'; [[-1,.92],[1,.92]].forEach(function(q){ c.strokeStyle='rgba(255,190,110,.55)'; c.lineWidth=Math.max(2,R*.11); c.beginPath(); c.ellipse(0,0,R*1.55,R*1.18,0,q[0]>0?.2:Math.PI+.2,q[0]>0?Math.PI-.2:6.283-.2); c.stroke(); }); c.globalCompositeOperation='source-over'; c.restore();
    disk(true);
    c.restore(); }
  function newIntro(c,w,h,cx,cy,t,U,L,d){
    var u=t-8.4, bg=eo3(seg(t,8.5,9.4));
    var g=c.createLinearGradient(0,0,w*.3,h); g.addColorStop(0,'#0a0620'); g.addColorStop(.55,'#150a3a'); g.addColorStop(1,'#06101f'); c.fillStyle=g; c.fillRect(0,0,w,h);
    /* drifting glow blobs */
    c.globalCompositeOperation='lighter'; [[.2,.3,'rgba(124,77,255,.22)',.5],[.8,.7,'rgba(0,200,255,.16)',.6],[.55,.15,'rgba(255,60,160,.14)',.45]].forEach(function(b,i){ var x=w*b[0]+Math.sin(t*.5+i*2)*U*6, y=h*b[1]+Math.cos(t*.4+i)*U*5, r=Math.max(w,h)*b[3], gg=c.createRadialGradient(x,y,0,x,y,r); gg.addColorStop(0,b[2]); gg.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=gg; c.fillRect(0,0,w,h); }); c.globalCompositeOperation='source-over';
    /* sparse stars */
    S.stars.forEach(function(s,i){ if(i>110) return; var x=((s.a*57.3*13+i*47)%100)/100*w, y=((s.r*977+i*31)%100)/100*h, tw=.4+.6*Math.abs(Math.sin(t*1.5+s.tw)); c.fillStyle='rgba(255,255,255,'+(.5*tw*bg).toFixed(3)+')'; c.fillRect(x,y,s.s,s.s); });
    /* shockwave rings */
    for(var k=0;k<3;k++){ var rp=seg(t,8.46+k*.16,10.0+k*.16); if(rp>0&&rp<1){ c.strokeStyle='rgba(255,255,255,'+((1-rp)*.55).toFixed(3)+')'; c.lineWidth=U*(1.2-rp)*(1+k*.0); c.beginPath(); c.arc(cx,cy,eo3(rp)*Math.max(w,h)*.85,0,6.283); c.stroke(); } }
    /* the tiles fly out of the singularity */
    var dim=lerp(1,.13,eio(seg(t,11.45,12.0))), push=1+.04*eio(seg(t,11.45,12.2));
    c.save(); c.globalAlpha=dim; c.translate(cx,cy); c.scale(push,push); c.translate(-cx,-cy);
    FEAT.forEach(function(f,i){ var col=i%L.tc, row=Math.floor(i/L.tc), tx=L.tx0+col*(L.tw+L.tg)+L.tw/2, ty=L.ty0+row*(L.th+L.tg)+L.th/2, p=seg(t,8.75+i*.085,9.65+i*.085); if(p<=0) return; var e=eob(p), x=lerp(cx,tx,e), y=lerp(cy,ty,e), sc=lerp(.05,1,eob(p)), rot=(1-eo3(p))*(i%2?1:-1)*.9;
      c.save(); c.translate(x,y); c.rotate(rot); c.scale(sc,sc); c.globalAlpha=dim*eo3(p*1.8); c.shadowColor=f[2]; c.shadowBlur=U*2.2*(1-seg(t,10.9,11.4)*.6); c.drawImage(L.sp.tiles[i],-L.tw/2,-L.th/2,L.tw,L.th); c.restore(); });
    /* light sweeping across the finished grid */
    var sw=seg(t,10.7,11.5); if(sw>0&&sw<1){ c.globalCompositeOperation='lighter'; var sx=lerp(-w*.2,w*1.2,sw), sg=c.createLinearGradient(sx-U*14,0,sx+U*14,0); sg.addColorStop(0,'rgba(255,255,255,0)'); sg.addColorStop(.5,'rgba(255,255,255,.28)'); sg.addColorStop(1,'rgba(255,255,255,0)'); c.save(); c.translate(cx,cy); c.rotate(.35); c.translate(-cx,-cy); c.fillStyle=sg; c.fillRect(sx-U*14,-h,U*28,h*3); c.restore(); c.globalCompositeOperation='source-over'; }
    c.restore();
    /* title */
    var tp=seg(t,11.55,12.2);
    if(tp>0){ var sc2=lerp(1.9,1,eob(tp)), ab=lerp(U*2.6,U*.28,eo3(seg(t,11.55,12.6))), fs=Math.min(w*(L.port?.122:.105),h*.17), cy2=cy-(L.port?h*.02:0);
      /* flare line */
      var fa=Math.sin(Math.PI*seg(t,11.5,12.5)); if(fa>0){ c.globalCompositeOperation='lighter'; var fg=c.createLinearGradient(0,0,w,0); fg.addColorStop(0,'rgba(120,200,255,0)'); fg.addColorStop(.5,'rgba(190,230,255,'+(.9*fa).toFixed(3)+')'); fg.addColorStop(1,'rgba(120,200,255,0)'); c.fillStyle=fg; c.fillRect(0,cy2-U*.35,w,U*.7); c.globalCompositeOperation='source-over'; }
      c.save(); c.translate(cx,cy2); c.scale(sc2,sc2); c.globalAlpha=eo3(tp*1.6); c.font='900 '+Math.round(fs)+'px '+FONT; c.textAlign='center'; c.textBaseline='middle';
      var txt=TXT_T; c.globalCompositeOperation='lighter'; c.fillStyle='rgba(255,40,90,.9)'; c.fillText(txt,-ab,0); c.fillStyle='rgba(0,220,255,.9)'; c.fillText(txt,ab,0); c.globalCompositeOperation='source-over'; c.shadowColor='rgba(150,120,255,.9)'; c.shadowBlur=U*3; c.fillStyle='#fff'; c.fillText(txt,0,0); c.shadowBlur=0; c.restore();
      /* cube mark above the title */
      var ca=eo3(seg(t,11.9,12.6)); if(ca>0){ c.globalAlpha=ca; cubeIso(c,cx,cy2-fs*1.25-Math.max(0,(1-ca))*U*3,Math.min(U*8,fs*.9),t); c.globalAlpha=1; }
      var sa=eo3(seg(t,12.5,13.2)); if(sa>0){ c.globalAlpha=sa; c.textAlign='center'; c.fillStyle='rgba(255,255,255,.92)'; c.font='600 '+Math.round(Math.min(fs*.34,U*3.4))+'px '+FONT; c.fillText(FEAT.length+(TXT_T==='THE UPDATE'?' new things for every cuber':' more new things for every cuber'),cx,cy2+fs*.82+(1-sa)*U*2); c.globalAlpha=1; }
      var la=eo3(seg(t,13.3,13.9)); if(la>0){ var fz=Math.round(Math.min(fs*.3,U*3.2)), pw=fz*7.4, ph=fz*2.3, py=cy2+fs*1.55; c.globalAlpha=la; c.fillStyle='rgba(60,220,130,.16)'; rr(c,cx-pw/2,py-ph/2,pw,ph,ph/2); c.fill(); c.strokeStyle='rgba(60,220,130,.9)'; c.lineWidth=2; c.stroke(); c.fillStyle='#3cdc82'; c.beginPath(); c.arc(cx-pw/2+ph*.55,py,fz*.28*(1+.25*Math.sin(t*6)),0,6.283); c.fill(); c.fillStyle='#fff'; c.font='800 '+fz+'px '+FONT; c.textAlign='left'; c.textBaseline='middle'; c.fillText('LIVE NOW',cx-pw/2+ph*.95,py+1); c.globalAlpha=1; } }
    /* confetti of cube stickers at the title slam */
    var cf=seg(t,11.6,14.2); if(cf>0){ var Rn=rng(21); for(var q=0;q<70;q++){ var a=Rn()*6.283, v=Rn()*.9+.15, x0=cx+Math.cos(a)*U*4, y0=cy-U*2, T=cf*2.6, x=x0+Math.cos(a)*v*w*.5*eo3(cf)*1.1, y=y0+Math.sin(a)*v*h*.45*eo3(cf)+T*T*U*3.2*Rn(), al=1-seg(t,13.4,14.6); if(al<=0) continue; c.save(); c.globalAlpha=al*.9; c.translate(x,y); c.rotate(a*3+cf*6*(Rn()-.5)*4); c.fillStyle=STK[q%6]; c.fillRect(-U*.6,-U*.6,U*1.2,U*1.2); c.restore(); } }
  }
  return S;
}

/* ---------- sound: made with the browser's own synth ---------- */
function audio(){
  var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return null; var ac=new AC(); if(ac.state==='suspended') ac.resume&&ac.resume();
  var m=ac.createGain(); m.gain.value=.9; var cmp=ac.createDynamicsCompressor(); m.connect(cmp); cmp.connect(ac.destination);
  var t0=ac.currentTime+.05;
  function osc(type,f0,f1,a,b,v,dest){ var o=ac.createOscillator(),g=ac.createGain(); o.type=type; o.frequency.setValueAtTime(f0,t0+a); if(f1!=null) o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t0+b); g.gain.setValueAtTime(0,t0+a); g.gain.linearRampToValueAtTime(v,t0+a+Math.min(.12,(b-a)*.3)); g.gain.exponentialRampToValueAtTime(.0005,t0+b); o.connect(g); g.connect(dest||m); o.start(t0+a); o.stop(t0+b+.05); return {o:o,g:g}; }
  function noise(a,b,v,f0,f1,q,type){ var len=Math.ceil((b-a+.1)*ac.sampleRate), buf=ac.createBuffer(1,len,ac.sampleRate), d=buf.getChannelData(0); for(var i=0;i<len;i++) d[i]=Math.random()*2-1; var s=ac.createBufferSource(); s.buffer=buf; var f=ac.createBiquadFilter(); f.type=type||'bandpass'; f.Q.value=q||1; f.frequency.setValueAtTime(f0,t0+a); f.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t0+b); var g=ac.createGain(); g.gain.setValueAtTime(0,t0+a); g.gain.linearRampToValueAtTime(v,t0+a+(b-a)*.6); g.gain.exponentialRampToValueAtTime(.0005,t0+b); s.connect(f); f.connect(g); g.connect(m); s.start(t0+a); s.stop(t0+b+.1); }
  /* A: soft pad and a tick as each old card appears */
  osc('sine',110,110,0,5.2,.07); osc('sine',164.8,164.8,.4,5.2,.05); osc('triangle',220,220,.8,5.2,.025);
  for(var i=0;i<6;i++) osc('sine',880+i*110,880+i*110,.9+i*.14,1.08+i*.14,.03);
  /* B: the pull */
  var dr=osc('sawtooth',38,260,4.9,8.25,.16); noise(4.9,8.25,.22,200,5200,.9);
  osc('sine',55,330,5.2,8.25,.1); noise(6.2,8.25,.12,3000,900,2,'highpass');
  /* singularity: a breath of silence, then the boom */
  osc('sine',70,26,8.42,10.2,.55); noise(8.42,9.6,.5,6000,120,.5,'lowpass'); osc('square',220,55,8.42,8.9,.12);
  /* C: tiles whoosh in on a rising scale */
  var sc=[0,2,4,7,9,12,14,16,19,21,24,26,28,31,33,35,38,40,43,45];
  for(i=0;i<FEAT.length;i++){ var a=8.75+i*.085; noise(a,a+.28,.07,500+i*90,2600+i*140,2.2); osc('sine',523*Math.pow(2,sc[i]/12/2),523*Math.pow(2,sc[i]/12/2),a+.1,a+.5,.04); }
  /* title hit and a bright chord */
  osc('sine',90,32,11.55,13.3,.5); noise(11.55,12.5,.35,4500,300,.6,'lowpass');
  [261.6,329.6,392,523.3,659.3].forEach(function(f,i){ osc('triangle',f,f,11.62+i*.04,14.6,.05); osc('sine',f*2,f*2,11.7+i*.05,14.2,.025); });
  for(i=0;i<10;i++) osc('sine',1046*Math.pow(1.122,i),1046*Math.pow(1.122,i),12.6+i*.09,13.4+i*.09,.03);
  return {ac:ac,master:m,stop:function(){ try{ m.gain.cancelScheduledValues(ac.currentTime); m.gain.setTargetAtTime(0,ac.currentTime,.08); setTimeout(function(){ try{ ac.close(); }catch(e){} },500); }catch(e){} }};
}

window.CWCut={dur:DUR,Scene:Scene,
  play:function(opts){ opts=opts||{}; if(!FEAT1){ FEAT1=FEAT; OLD1=OLD; } if(opts.stage===2){ FEAT=FEAT2; OLD=OLD2; TXT_OLD='CUBER TOOLS · UPDATE 1'; TXT_T='UPDATE 2'; } else { FEAT=FEAT1; OLD=OLD1; TXT_OLD='THE OLD CUBER TOOLS'; TXT_T='THE UPDATE'; } var wrap=document.createElement('div'); wrap.className='ucut'; wrap.setAttribute('role','dialog'); wrap.setAttribute('aria-label','The update');
    wrap.innerHTML='<canvas></canvas><button type="button" class="ucut-sk" hidden>Skip</button><button type="button" class="ucut-mu" aria-label="Sound">🔊</button>'; document.body.appendChild(wrap); document.documentElement.classList.add('ucut-on');
    var cv=wrap.querySelector('canvas'), sk=wrap.querySelector('.ucut-sk'), mu=wrap.querySelector('.ucut-mu'), sc=Scene(cv), au=null, muted=false, t0=performance.now(), done=false, raf=0;
    try{ au=audio(); }catch(e){}
    mu.onclick=function(){ muted=!muted; mu.textContent=muted?'🔇':'🔊'; if(au) au.master.gain.value=muted?0:.9; };
    function end(){ if(done) return; done=true; cancelAnimationFrame(raf); window.removeEventListener('resize',rs); if(au) au.stop(); wrap.classList.add('out'); setTimeout(function(){ wrap.remove(); document.documentElement.classList.remove('ucut-on'); if(opts.onend) opts.onend(); },420); }
    function rs(){ sc.size(); }
    window.addEventListener('resize',rs); sk.onclick=end;
    (function loop(){ var t=(performance.now()-t0)/1000; sc.draw(Math.min(t,DUR)); if(t>3&&sk.hidden) sk.hidden=false; if(t>=DUR){ end(); return; } raf=requestAnimationFrame(loop); })();
    return {end:end}; }};
})();
