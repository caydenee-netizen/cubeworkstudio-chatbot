/* Update 6 cutscene: a warp-speed tunnel, a giant 6 slamming in, one animated scene per new feature, then a confetti finale. Canvas 2D + WebAudio, about 28 seconds, no voice. */
(function(){
var BPM=120, B=60/BPM, TW=4, TS=TW+3.4, FT=2.5, NF=12, TF=TS+NF*FT, DUR=TF+6.5;
var FEAT=[
 {t:'Worlds 3 and 4',s:'A lava keyboard and a low-gravity space keyboard. 24 new stages.',c:'#ff5a2a',k:'world',i:'🌋'},
 {t:'Boss fights',s:'The last stage of every world. Dodge the fireballs.',c:'#ff2a4a',k:'boss',i:'👾'},
 {t:'Pet eggs',s:'Hatch 24 pets in six rarities. Level them up. Equip three.',c:'#3ddc6a',k:'egg',i:'🥚'},
 {t:'Auras',s:'Ten glowing auras that multiply your speed.',c:'#a86bff',k:'aura',i:'💫'},
 {t:'The Gym',s:'Auto-sprint, more treadmills, 8 hours of away earnings.',c:'#35c2ff',k:'gym',i:'🏋️'},
 {t:'Special hoverboards',s:'Jump, Magnet, Speed, Long and Double boards.',c:'#35e6ff',k:'board',i:'🛹'},
 {t:'Skins and places',s:'New outfits, new monsters, new places for your gym.',c:'#ff6bd0',k:'skin',i:'🎽'},
 {t:'Missions',s:'Daily quests, a 7-day streak and badges.',c:'#ffd95a',k:'mission',i:'🎯'},
 {t:'Leaderboards',s:'Top Speed, top Wins, most stages cleared.',c:'#26c6da',k:'lb',i:'🏆'},
 {t:'Cloud save',s:'Your progress follows your account.',c:'#8fe9ff',k:'cloud',i:'☁️'},
 {t:'Races',s:'Challenge a friend to an escape stage. Winner takes the stake.',c:'#ff4d6d',k:'race',i:'🏁'},
 {t:'Double Speed events',s:'Whole weekends where every step counts twice.',c:'#9b7bff',k:'event',i:'🎉'}];
var FONT='-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,Helvetica,Arial,sans-serif';
var CUBE=['#e53935','#fb8c00','#f5f5f2','#fdd835','#43a047','#1e88e5'];
function clamp(x,a,b){ return x<a?a:x>b?b:x; }
function eo3(x){ x=clamp(x,0,1); return 1-Math.pow(1-x,3); }
function eio(x){ x=clamp(x,0,1); return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2; }
function eob(x){ x=clamp(x,0,1); var c1=1.9,c3=c1+1; return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2); }
function rng(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function hexa(h,a){ var n=parseInt(h.slice(1),16); return 'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')'; }
function rr(x,X,Y,w,h,r){ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+w,Y,X+w,Y+h,r); x.arcTo(X+w,Y+h,X,Y+h,r); x.arcTo(X,Y+h,X,Y,r); x.arcTo(X,Y,X+w,Y,r); x.closePath(); }
function Scene(cv){
  var x=cv.getContext('2d'), W=0, H=0, S=1, dpr=1, R=rng(5), stars=[], conf=[], boom=[];
  for(var i=0;i<420;i++) stars.push({a:R()*Math.PI*2,z:R(),s:.4+R()*1.6,c:CUBE[i%6]});
  for(i=0;i<260;i++) conf.push({x:R(),vx:(R()-.5)*1.2,vy:-.4-R()*1.1,r:R()*6.3,vr:(R()-.5)*14,c:CUBE[i%6],w:6+R()*8,d:R()*.6});
  for(i=0;i<90;i++) boom.push({a:R()*Math.PI*2,v:.35+R()*.9,c:CUBE[i%6],s:3+R()*7});
  function size(){ dpr=Math.min(2,window.devicePixelRatio||1); W=cv.clientWidth||innerWidth; H=cv.clientHeight||innerHeight; cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); S=Math.min(W,H)/700; }
  size();
  function text(s,X,Y,px,col,al,wt){ x.save(); x.globalAlpha=clamp(al==null?1:al,0,1); x.fillStyle=col||'#fff'; x.font=(wt||800)+' '+Math.round(px)+'px '+FONT; x.textAlign='center'; x.textBaseline='middle'; x.fillText(s,X,Y); x.restore(); }
  function cubie(X,Y,sz,i,al){ x.save(); x.globalAlpha=al; x.fillStyle='#0b0e16'; rr(x,X-sz/2,Y-sz/2,sz,sz,sz*.18); x.fill(); var g=sz*.06, c=(sz-g*4)/3; for(var a=0;a<3;a++) for(var b=0;b<3;b++){ x.fillStyle=CUBE[(i+a*3+b*2)%6]; rr(x,X-sz/2+g+a*(c+g),Y-sz/2+g+b*(c+g),c,c,c*.2); x.fill(); } x.restore(); }
  function warp(t,sp){ var cx=W/2, cy=H/2, M=Math.hypot(W,H)*.6; stars.forEach(function(s){ var z=(s.z+t*sp)%1, z2=Math.max(0,z-.02*sp*4), r1=Math.pow(z,2.4)*M, r2=Math.pow(z2,2.4)*M; x.strokeStyle=hexa(s.c,clamp(z*1.6,0,1)); x.lineWidth=s.s*S*(.5+z*2); x.beginPath(); x.moveTo(cx+Math.cos(s.a)*r2,cy+Math.sin(s.a)*r2); x.lineTo(cx+Math.cos(s.a)*r1,cy+Math.sin(s.a)*r1); x.stroke(); }); }
  function bg(c1,c2){ var g=x.createRadialGradient(W/2,H*.45,0,W/2,H/2,Math.hypot(W,H)*.65); g.addColorStop(0,c1); g.addColorStop(1,c2); x.fillStyle=g; x.fillRect(0,0,W,H); }
  /* ---- feature scenes, p runs 0..1 over the scene ---- */
  function fDuel(p,c){ var cy=H*.42, off=W*.22*(1-eo3(p*2.2)); cubie(W*.3-off,cy,110*S,0,1); cubie(W*.7+off,cy,110*S,3,1);
    if(p>.35){ var k=Math.floor(p*40)%3; x.save(); x.strokeStyle=k?'#fff':c; x.lineWidth=(5+k*2)*S; x.shadowColor=c; x.shadowBlur=24*S; x.beginPath(); var a=W*.36, b=W*.64, n=9, r=rng(Math.floor(p*30)); x.moveTo(a,cy); for(var i=1;i<n;i++) x.lineTo(a+(b-a)*i/n,cy+(r()-.5)*70*S); x.lineTo(b,cy); x.stroke(); x.restore(); }
    text('VS',W/2,cy-110*S,64*S*eob(clamp((p-.3)*4,0,1)),c,clamp((p-.3)*4,0,1),900);
    var tm=clamp((p-.45)*3,0,1); text((7.5+9*(1-tm)).toFixed(2),W*.3,cy+100*S,30*S,'#fff',tm,700); text((9.1+8*(1-tm)).toFixed(2),W*.7,cy+100*S,30*S,'#fff',tm,700);
    if(p>.8) text('WIN',W*.3,cy-80*S,26*S,'#43ff8a',clamp((p-.8)*6,0,1),900); }
  function fCrate(p,c){ var cy=H*.46, sh=p<.5?Math.sin(p*120)*8*S*p*2:0, op=eob(clamp((p-.5)*4,0,1)), sz=150*S;
    if(p>.5){ var tiers=['#9aa3b5','#3b82f6','#a855f7','#ffcc33']; tiers.forEach(function(tc,i){ var a=-Math.PI/2+(i-1.5)*.32, L=H*.6*op; x.save(); x.globalAlpha=.55*op; var g=x.createLinearGradient(W/2,cy,W/2+Math.cos(a)*L,cy+Math.sin(a)*L); g.addColorStop(0,tc); g.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=g; x.beginPath(); x.moveTo(W/2-10*S,cy-sz*.3); x.lineTo(W/2+Math.cos(a-.08)*L,cy+Math.sin(a-.08)*L); x.lineTo(W/2+Math.cos(a+.08)*L,cy+Math.sin(a+.08)*L); x.lineTo(W/2+10*S,cy-sz*.3); x.fill(); x.restore(); }); }
    x.save(); x.translate(W/2+sh,cy); x.fillStyle='#7a4a1f'; rr(x,-sz/2,-sz*.3,sz,sz*.62,12*S); x.fill(); x.strokeStyle='#4a2a0c'; x.lineWidth=6*S; x.stroke(); x.fillStyle=c; x.fillRect(-sz*.08,-sz*.3,sz*.16,sz*.62);
    x.save(); x.translate(0,-sz*.3); x.rotate(-op*.9); x.translate(0,-op*60*S); x.fillStyle='#8f5a26'; rr(x,-sz*.55,-sz*.16,sz*1.1,sz*.2,10*S); x.fill(); x.restore(); x.restore();
    if(p>.62){ var q=eob(clamp((p-.62)*3,0,1)); x.save(); x.translate(W/2,cy-sz*.45-120*S*q); x.scale(q,q); x.shadowColor='#ffcc33'; x.shadowBlur=40*S; cubie(0,0,90*S,2,1); x.restore(); text('LEGENDARY',W/2,cy-sz*.45-200*S*q,22*S,'#ffcc33',q,900); } }
  function fDash(p,c){ var gy=H*.6, sp=W*.9, ox=-(p*sp)%(120*S); x.fillStyle=hexa(c,.25); x.fillRect(0,gy,W,H-gy); x.strokeStyle=c; x.lineWidth=3*S; x.beginPath(); x.moveTo(0,gy); x.lineTo(W,gy); x.stroke();
    for(var i=-1;i<W/(120*S)+2;i++){ var X=ox+i*120*S*2+60*S; x.fillStyle='#fff'; x.beginPath(); x.moveTo(X-18*S,gy); x.lineTo(X,gy-34*S); x.lineTo(X+18*S,gy); x.fill(); }
    var ph=(p*sp/(240*S))%1, jy=Math.sin(ph*Math.PI)*90*S, bx=W*.35; x.save(); x.translate(bx,gy-24*S-jy); x.rotate(ph*Math.PI); x.fillStyle=c; x.shadowColor=c; x.shadowBlur=20*S; x.fillRect(-24*S,-24*S,48*S,48*S); x.strokeStyle='#fff'; x.lineWidth=3*S; x.strokeRect(-24*S,-24*S,48*S,48*S); x.restore();
    for(i=0;i<8;i++){ var hp=(p*1.4+i/8)%1; text('♥',W*(.55+((i*37)%40)/100),gy-40*S-hp*H*.4,(22+i%3*8)*S,'#ff5c8a',1-hp,900); }
    var pl=Math.floor(clamp(p,0,1)*1240); text('▶ '+pl.toLocaleString()+' plays',W*.75,H*.2,24*S,'#fff',clamp(p*3,0,1),700); }
  function fCard(p,c){ var fl=eio(clamp(p*1.6,0,1)), sx=Math.abs(Math.cos((1-fl)*Math.PI)), back=fl<.5, cw=290*S, ch=360*S, cy=H*.4;
    x.save(); x.translate(W/2,cy); x.rotate((1-fl)*.25); x.scale(Math.max(.02,sx),1);
    if(back){ x.fillStyle='#1b1f2e'; rr(x,-cw/2,-ch/2,cw,ch,22*S); x.fill(); cubie(0,0,90*S,1,1); x.restore(); return; }
    x.fillStyle='#141826'; rr(x,-cw/2,-ch/2,cw,ch,22*S); x.fill(); var g=x.createLinearGradient(-cw/2,0,cw/2,0); g.addColorStop(0,c); g.addColorStop(1,'#ff6ad5'); x.fillStyle=g; rr(x,-cw/2,-ch/2,cw,ch*.3,22*S); x.fill();
    x.fillStyle='#fff'; x.beginPath(); x.arc(0,-ch*.2,42*S,0,7); x.fill(); cubie(0,-ch*.2,56*S,4,1);
    x.restore();
    if(sx>.5){ var a=clamp((p-.45)*3,0,1); text('Lv 42',W/2,cy-ch*.02,26*S,'#fff',a,800);
      [['Best single','8.91'],['Best Ao5','10.47'],['Duels','12 W · 3 L']].forEach(function(r,i){ var Y=cy+ch*.1+i*36*S; text(r[0],W/2-60*S,Y,16*S,'#aab',a,600); text(r[1],W/2+70*S,Y,18*S,'#fff',a,800); });
      ['🏆','⚡','🔥'].forEach(function(e,i){ text(e,W/2+(i-1)*56*S,cy+ch*.42,30*S*eob(clamp((p-.6-i*.06)*5,0,1)),'#fff',1,400); }); } }
  /* ---- Update 6 scenes: drawn, not icons ---- */
  function runner(X,Y,s,col,ph,al){ al=al==null?1:al; var sw=Math.sin(ph); x.save(); x.globalAlpha=al; x.lineCap='round'; x.strokeStyle='#161a2c'; x.lineWidth=9*s; x.beginPath(); x.moveTo(X-7*s,Y); x.lineTo(X-7*s+sw*16*s,Y+34*s); x.moveTo(X+7*s,Y); x.lineTo(X+7*s-sw*16*s,Y+34*s); x.stroke();
    x.strokeStyle=col; x.lineWidth=8*s; x.beginPath(); x.moveTo(X-19*s,Y-30*s); x.lineTo(X-19*s-sw*13*s,Y-6*s); x.moveTo(X+19*s,Y-30*s); x.lineTo(X+19*s+sw*13*s,Y-6*s); x.stroke(); x.fillStyle=col; rr(x,X-18*s,Y-40*s,36*s,42*s,9*s); x.fill(); x.restore(); cubie(X,Y-62*s-Math.abs(sw)*3*s,44*s,2,al); }
  function kbd(t,pal,hy){ var vx=W/2, by=H*.76, bw=Math.min(W*.42,330*S), tw=bw*.12, N=9, fr=(t*2.2)%1; for(var i=N;i>=0;i--){ var d0=Math.pow(Math.max(0,(i-fr)/N),1.7), d1=Math.pow(Math.max(0,(i+1-fr)/N),1.7), y0=by-(by-hy)*d0, y1=by-(by-hy)*d1, w0=bw-(bw-tw)*d0, w1=bw-(bw-tw)*d1, ri=Math.floor(t*2.2)+i;
      for(var l=0;l<3;l++){ var k=((ri*7+l*13)%11+11)%11; x.fillStyle=k<2?pal[1]:k===5?pal[2]:pal[0]; x.globalAlpha=clamp(1.2-d0,0,1); x.beginPath(); var a0=-w0+l*w0*2/3+w0*.03, a1=-w0+(l+1)*w0*2/3-w0*.03, b0=-w1+l*w1*2/3+w1*.03, b1=-w1+(l+1)*w1*2/3-w1*.03; x.moveTo(vx+a0,y0); x.lineTo(vx+a1,y0); x.lineTo(vx+b1,y1+2); x.lineTo(vx+b0,y1+2); x.closePath(); x.fill(); } } x.globalAlpha=1; }
  function glow(X,Y,r,col,a){ var g=x.createRadialGradient(X,Y,0,X,Y,r); g.addColorStop(0,hexa(col,a)); g.addColorStop(1,hexa(col,0)); x.fillStyle=g; x.beginPath(); x.arc(X,Y,r,0,7); x.fill(); }
  function monster(X,Y,s,jaw,col){ x.save(); x.fillStyle=col||'#55208a'; rr(x,X-70*s,Y-60*s,140*s,110*s,34*s); x.fill(); x.fillStyle='#ece6d2'; [-1,1].forEach(function(d){ x.beginPath(); x.moveTo(X+d*40*s,Y-52*s); x.lineTo(X+d*74*s,Y-112*s); x.lineTo(X+d*62*s,Y-46*s); x.fill(); });
    x.fillStyle='#2a0d4a'; rr(x,X-56*s,Y+26*s+jaw*26*s,112*s,30*s,12*s); x.fill(); x.fillStyle='#fff'; for(var i=0;i<5;i++){ x.beginPath(); x.moveTo(X-44*s+i*22*s,Y+38*s); x.lineTo(X-33*s+i*22*s,Y+56*s); x.lineTo(X-22*s+i*22*s,Y+38*s); x.fill(); }
    [-1,1].forEach(function(d){ glow(X+d*30*s,Y-14*s,34*s,'#ffd21a',.7); x.fillStyle='#ffd21a'; x.beginPath(); x.ellipse(X+d*30*s,Y-14*s,17*s,14*s,0,0,7); x.fill(); x.fillStyle='#200'; x.beginPath(); x.ellipse(X+d*30*s,Y-14*s,5*s,11*s,0,0,7); x.fill(); }); x.restore(); }
  function fWorld(p,c){ var sp=p>.5, hy=H*.3; if(sp){ for(var i=0;i<40;i++){ var st=stars[i]; x.fillStyle='rgba(255,255,255,'+(.3+.6*Math.abs(Math.sin(p*20+i)))+')'; x.fillRect((st.z*W+p*40*i)%W,(st.s*.6-.2)*H*.5,2*S,2*S); } glow(W*.74,H*.2,90*S,'#8fa8ff',.5); }
    else { glow(W/2,hy,260*S,'#ff5a1a',.55); for(var j=0;j<14;j++){ var e=(p*3+j*.37)%1; x.fillStyle='rgba(255,'+(120+j*8)+',40,'+(1-e)+')'; x.beginPath(); x.arc(W*.15+((j*97)%70)/100*W,H*.8-e*H*.6,(3+j%4)*S,0,7); x.fill(); } }
    kbd(p*2.5,sp?['#0d1030','#e6eeff','#5a6cff']:['#2a0c0a','#ff7a1a','#ffd21a'],hy); var jy=sp?-Math.abs(Math.sin(p*9))*70*S:-Math.abs(Math.sin(p*14))*18*S; runner(W/2+Math.sin(p*7)*60*S,H*.66+jy,1.25*S,'#ff6a14',p*40);
    var fl=Math.abs(p-.5)<.04?1-Math.abs(p-.5)/.04:0; if(fl){ x.fillStyle='rgba(255,255,255,'+fl+')'; x.fillRect(0,0,W,H); } text(sp?'WORLD 4 · SPACE':'WORLD 3 · LAVA',W/2,H*.16,26*S,sp?'#b9c8ff':'#ffb27a',clamp((sp?p-.5:p)*8,0,1),900); }
  function fBoss(p,c){ var jw=.3+.7*Math.abs(Math.sin(p*10)); glow(W/2,H*.3,280*S,'#ff2a4a',.35); monster(W/2,H*.3+Math.sin(p*12)*6*S,1.5*S*eob(clamp(p*3,0,1)),jw); x.strokeStyle='rgba(255,255,255,.25)'; x.lineWidth=2*S; x.beginPath(); x.moveTo(W*.15,H*.68); x.lineTo(W*.85,H*.68); x.stroke();
    var rx=W/2+Math.sin(p*9)*W*.2; for(var i=0;i<4;i++){ var q=(p*2.4+i*.27)%1, bx=W*.26+((i*37)%50)/50*W*.48, by=H*.36+q*q*(H*.32); x.strokeStyle=hexa('#ff5a2a',1-q*.5); x.lineWidth=4*S; x.beginPath(); x.ellipse(bx,H*.68,(14+q*26)*S,(5+q*9)*S,0,0,7); x.stroke(); if(q<.92){ glow(bx,by,36*S,'#ff8a1a',.8); x.fillStyle='#ffd27a'; x.beginPath(); x.arc(bx,by,12*S,0,7); x.fill(); } else { glow(bx,H*.68,(q-.92)*900*S,'#ffb24a',1-(q-.92)*12); } }
    runner(rx,H*.6,1.05*S,'#ff6a14',p*44); }
  function fEgg(p,c){ var cy=H*.42, cr=clamp((p-.42)*6,0,1), out=eob(clamp((p-.58)*4,0,1)); if(p<.6){ var wb=Math.sin(p*46)*(.05+p*.3); x.save(); x.translate(W/2,cy+60*S); x.rotate(wb); glow(0,-60*S,150*S,c,.35+p*.5); x.fillStyle='#f4f1e6'; x.beginPath(); x.ellipse(0,-60*S,70*S,92*S,0,0,7); x.fill(); x.fillStyle=hexa(c,.85); [[-28,-90,14],[22,-50,18],[-14,-20,11],[30,-104,9]].forEach(function(d){ x.beginPath(); x.arc(d[0]*S,d[1]*S,d[2]*S,0,7); x.fill(); });
        if(cr){ x.strokeStyle='#33312a'; x.lineWidth=4*S; x.beginPath(); x.moveTo(-66*S,-62*S); var pts=[[-40,-44],[-20,-72],[4,-46],[26,-76],[46,-52],[68,-64]]; for(var i=0;i<Math.ceil(cr*6);i++) x.lineTo(pts[i][0]*S,pts[i][1]*S); x.stroke(); } x.restore(); }
    if(p>.56){ var fl=clamp(1-(p-.56)*7,0,1); if(fl){ x.fillStyle='rgba(255,255,255,'+fl+')'; x.fillRect(0,0,W,H); } var py=cy-10*S+Math.sin(p*18)*10*S, sz=120*S*out; glow(W/2,py,220*S,'#ffc930',.5); for(var k=0;k<10;k++){ var an=k/10*6.283+p*4; x.fillStyle=k%2?'#fff':'#ffc930'; x.beginPath(); x.arc(W/2+Math.cos(an)*150*S*out,py+Math.sin(an)*120*S*out,(k%2?4:7)*S,0,7); x.fill(); }
      [-1,1].forEach(function(d){ x.save(); x.translate(W/2+d*sz*.5,py); x.rotate(d*(.5+Math.sin(p*60)*.5)); x.fillStyle='#fff'; rr(x,d>0?0:-sz*.6,-sz*.08,sz*.6,sz*.16,sz*.08); x.fill(); x.restore(); });
      x.fillStyle='#ffc930'; rr(x,W/2-sz/2,py-sz/2,sz,sz,sz*.2); x.fill(); x.fillStyle='#fff'; [-1,1].forEach(function(d){ x.beginPath(); x.ellipse(W/2+d*sz*.2,py-sz*.05,sz*.11,sz*.14,0,0,7); x.fill(); }); x.fillStyle='#141414'; [-1,1].forEach(function(d){ x.beginPath(); x.arc(W/2+d*sz*.2,py-sz*.03,sz*.055,0,7); x.fill(); }); text('LEGENDARY!',W/2,H*.2,34*S*out,'#ffc930',out,900); } }
  function fAura(p,c){ var cy=H*.5, cols=['#3ddc6a','#3aa0ff','#a86bff','#ff4a5a','#ffc930'], ci=Math.floor(p*5)%5, col=cols[ci]; glow(W/2,cy-30*S,240*S,col,.45); for(var i=0;i<4;i++){ var q=(p*2.2+i/4)%1; x.strokeStyle=hexa(col,1-q); x.lineWidth=6*S*(1-q)+1; x.beginPath(); x.ellipse(W/2,cy+44*S,(40+q*190)*S,(14+q*60)*S,0,0,7); x.stroke(); }
    for(i=0;i<12;i++){ var an=i/12*6.283+p*5, yy=cy+40*S-((p*1.4+i*.31)%1)*190*S; x.fillStyle=i%2?'#fff':col; x.beginPath(); x.arc(W/2+Math.cos(an)*90*S,yy,(i%2?3:6)*S,0,7); x.fill(); } runner(W/2,cy,1.6*S,'#ff6a14',p*30); text('×'+[1.5,3,8,35,100][ci],W/2+150*S,cy-90*S,54*S*eob(clamp(((p*5)%1)*4,0,1)),col,1,900); }
  function fGym(p,c){ var n=4, gw=Math.min(W*.2,150*S); for(var i=0;i<n;i++){ var ap=eob(clamp(p*4-i*.4,0,1)); if(!ap) continue; var X=W/2+(i-1.5)*gw*1.15, Y=H*.62; x.fillStyle='#1a1e33'; rr(x,X-gw*.42,Y,gw*.84,26*S,10*S); x.fill(); x.save(); rr(x,X-gw*.36,Y+5*S,gw*.72,10*S,5*S); x.clip(); x.fillStyle='#0b0d18'; x.fillRect(X-gw*.4,Y,gw*.8,26*S); x.fillStyle=hexa(c,.7); for(var k=0;k<6;k++){ var bx=X-gw*.36+(((k*.2-p*3)%1)+1)%1*gw*.72; x.fillRect(bx,Y+5*S,5*S,10*S); } x.restore();
      x.strokeStyle='#7a8098'; x.lineWidth=5*S; x.beginPath(); x.moveTo(X+gw*.34,Y); x.lineTo(X+gw*.34,Y-70*S); x.stroke(); x.fillStyle=c; rr(x,X+gw*.2,Y-84*S,gw*.26,16*S,6*S); x.fill(); runner(X-6*S,Y-34*S,.8*S*ap,i?c:'#ff6a14',p*40+i*2,i?.85:1);
      var q=(p*3+i*.23)%1; text('+'+[1,3,9,25][i],X,Y-130*S-q*60*S,24*S,'#8fe9ff',1-q,900); } text('ZZZ … +8 h',W/2,H*.2,26*S,'#cfd3f5',clamp((p-.6)*4,0,1),800); }
  function fBoard(p,c){ var cols=['#35e6ff','#4dff7a','#ff4d73','#ffd21a','#b073ff','#ffffff'], nm=['Classic','Jump','Magnet','Speed','Long','Double'], ci=Math.min(5,Math.floor(p*6)), col=cols[ci], X=W*(-.1+((p*6)%1)*1.2), Y=H*.5+Math.sin(p*38)*26*S-(ci===1?Math.abs(Math.sin(p*19))*80*S:0);
    for(var i=1;i<14;i++){ x.fillStyle=hexa(col,(1-i/14)*.5); rr(x,X-i*(ci===3?34:22)*S-60*S,Y+2*S,120*S,10*S,5*S); x.fill(); } glow(X,Y+10*S,130*S,col,.5); x.fillStyle='#10131f'; rr(x,X-70*S,Y,140*S,16*S,8*S); x.fill(); x.fillStyle=col; rr(x,X-58*S,Y+4*S,116*S,6*S,3*S); x.fill(); runner(X,Y-34*S,1.05*S,'#ff6a14',0);
    if(ci===2) for(i=0;i<6;i++){ var q=(p*9+i/6)%1, an=i*1.05; x.fillStyle='#ffd21a'; x.beginPath(); x.arc(X+Math.cos(an)*(1-q)*150*S,Y-40*S+Math.sin(an)*(1-q)*110*S,9*S,0,7); x.fill(); } if(ci===5){ x.strokeStyle=hexa('#ffffff',.8); x.lineWidth=4*S; x.beginPath(); x.arc(X,Y-40*S,84*S,0,7); x.stroke(); x.beginPath(); x.arc(X,Y-40*S,98*S,0,7); x.stroke(); }
    text(nm[ci]+' board',W/2,H*.2,32*S,col,1,900); cols.forEach(function(cc,i2){ x.fillStyle=hexa(cc,i2<=ci?1:.25); rr(x,W/2+(i2-2.5)*46*S-18*S,H*.27,36*S,8*S,4*S); x.fill(); }); }
  function fSkin(p,c){ var cols=['#ff6a14','#2673ff','#33cc59','#e61f26','#994dff','#ff66bf','#f0f0f7','#ffc726'], n=cols.length, gw=Math.min(W/(n+1),92*S); cols.forEach(function(cc,i){ var ap=eob(clamp(p*5-i*.3,0,1)); if(ap) runner(W/2+(i-(n-1)/2)*gw,H*.46+Math.sin(p*10+i)*6*S,.85*S*ap,cc,p*30+i); });
    ['#55208a','#1f7333','#99141a','#1a4099','#141418'].forEach(function(mc,i){ var ap=eob(clamp(p*5-1.6-i*.25,0,1)); if(ap) monster(W/2+(i-2)*Math.min(W*.17,120*S),H*.2,.42*S*ap,.4,mc); }); }
  function fMission(p,c){ var rw=Math.min(W*.7,460*S), X=W/2-rw/2, rows=['Take 1,200 steps','Clear 5 escape stages','Hatch a pet egg']; rows.forEach(function(s,i){ var ap=eo3(clamp(p*5-i*.5,0,1)), Y=H*.2+i*64*S, dn=p>.3+i*.14; x.globalAlpha=ap; x.fillStyle='rgba(255,255,255,.08)'; rr(x,X+(1-ap)*60*S,Y,rw,52*S,16*S); x.fill(); x.fillStyle=dn?'#3ddc6a':'rgba(255,255,255,.2)'; x.beginPath(); x.arc(X+34*S,Y+26*S,15*S,0,7); x.fill(); x.globalAlpha=1;
      if(dn){ x.strokeStyle='#fff'; x.lineWidth=4*S; x.lineCap='round'; x.beginPath(); x.moveTo(X+27*S,Y+26*S); x.lineTo(X+32*S,Y+32*S); x.lineTo(X+42*S,Y+20*S); x.stroke(); } x.textAlign='left'; x.fillStyle='#fff'; x.globalAlpha=ap; x.font='800 '+Math.round(20*S)+'px '+FONT; x.textBaseline='middle'; x.fillText(s,X+62*S,Y+27*S); x.textAlign='right'; x.fillStyle='#ffd95a'; x.fillText('🪙 +'+[14,16,8][i],X+rw-18*S,Y+27*S); x.globalAlpha=1; });
    for(var d=0;d<7;d++){ var on=p>.5+d*.05, sc=on?eob(clamp((p-.5-d*.05)*8,0,1)):1, DX=W/2+(d-3)*Math.min(rw/7,62*S), DY=H*.6; x.fillStyle=on?'#ffb02e':'rgba(255,255,255,.12)'; x.beginPath(); x.arc(DX,DY,20*S*sc,0,7); x.fill(); text(on?'🔥':String(d+1),DX,DY,18*S,'#fff',1,800); } }
  function fLb(p,c){ var hs=[.62,1,.42], cols=['#c9d2e0','#ffc930','#d98a4a'], nm=['2','1','3'], bw=Math.min(W*.17,130*S); hs.forEach(function(h,i){ var g=eo3(clamp(p*3-[.3,.6,0][i],0,1)), X=W/2+(i-1)*bw*1.12, hh=h*H*.3*g, Y=H*.66; x.fillStyle=cols[i]; rr(x,X-bw/2,Y-hh,bw,hh+2,12*S); x.fill(); text(nm[i],X,Y-hh/2,44*S,'rgba(0,0,0,.45)',g,900); if(g>.95) runner(X,Y-hh-36*S,.8*S,['#2673ff','#ff6a14','#33cc59'][i],i===1?p*30:0); });
    if(p>.7){ glow(W/2,H*.2,120*S,'#ffc930',.5); text('🏆',W/2,H*.19,70*S*eob(clamp((p-.7)*6,0,1)),'#fff',1,400); } }
  function fCloud(p,c){ var cy=H*.3; glow(W/2,cy,200*S,c,.35); x.fillStyle='#fff'; [[-58,10,44],[0,-18,62],[60,8,46],[0,22,54]].forEach(function(d){ x.beginPath(); x.arc(W/2+d[0]*S,cy+d[1]*S,d[2]*S,0,7); x.fill(); }); x.fillStyle='#fff'; x.fillRect(W/2-60*S,cy+10*S,120*S,44*S);
    [-1,1].forEach(function(d){ var X=W/2+d*Math.min(W*.3,240*S), Y=H*.6; x.fillStyle='#1a1e33'; rr(x,X-56*S,Y-74*S,112*S,148*S,14*S); x.fill(); x.fillStyle='#0b1030'; rr(x,X-48*S,Y-66*S,96*S,122*S,8*S); x.fill(); text('⚡ 5.03M',X,Y-30*S,17*S,'#8fe9ff',d<0||p>.55?1:.15,900); runner(X,Y+26*S,.5*S,'#ff6a14',p*30,d<0||p>.55?1:.15);
      for(var i=0;i<5;i++){ var q=(p*2+i/5)%1, on=d<0?q:1-q, ax=X+(W/2-X)*on, ay=Y-90*S+(cy+60*S-(Y-90*S))*on-Math.sin(on*3.14)*40*S; if((d<0&&p<.6)||(d>0&&p>.4)){ x.fillStyle=hexa(c,.9); x.beginPath(); x.arc(ax,ay,6*S,0,7); x.fill(); } } }); }
  function fRace(p,c){ var X0=W*.14, X1=W*.82, sp=[eio(p*1.08),eio(p*.9)], cols=['#ff6a14','#2673ff'], nm=['You','Friend']; [0,1].forEach(function(i){ var Y=H*.3+i*H*.22; x.fillStyle='rgba(255,255,255,.1)'; rr(x,X0,Y+30*S,X1-X0,12*S,6*S); x.fill(); x.fillStyle=cols[i]; rr(x,X0,Y+30*S,(X1-X0)*clamp(sp[i],0,1),12*S,6*S); x.fill(); runner(X0+(X1-X0)*clamp(sp[i],0,1),Y-6*S,.8*S,cols[i],p*46+i); text(nm[i],X0-6*S,Y-50*S,16*S,'#cfd3f5',1,800); text('🏁',X1+26*S,Y+10*S,40*S,'#fff',1,400); });
    text((p*18.4).toFixed(2)+' s',W/2,H*.17,34*S,'#fff',1,900); if(p>.86) text('YOU WIN · 🪙 +200',W/2,H*.7,30*S*eob(clamp((p-.86)*10,0,1)),'#ffd95a',1,900); }
  function fEvent(p,c){ var cy=H*.4; for(var i=0;i<18;i++){ var an=i/18*6.283+p*1.5; x.fillStyle=hexa(CUBE[i%6],.5); x.beginPath(); x.moveTo(W/2,cy); x.arc(W/2,cy,Math.hypot(W,H),an,an+.1); x.fill(); } glow(W/2,cy,260*S,c,.7); var sc=eob(clamp(p*3,0,1))*(1+Math.sin(p*26)*.05); x.save(); x.translate(W/2,cy); x.rotate(Math.sin(p*9)*.05); x.shadowColor=c; x.shadowBlur=50*S; text('×2',0,0,230*S*sc,'#fff',1,900); x.restore();
    for(i=0;i<24;i++){ var q=(p*1.5+i*.13)%1; x.fillStyle=CUBE[i%6]; x.save(); x.translate(((i*53)%100)/100*W,q*H*.75); x.rotate(q*9+i); x.fillRect(-6*S,-3*S,12*S,6*S); x.restore(); } }
  function G6(p,c,f){ text(f.i,W/2,H*.42,150*S*eob(clamp(p*4,0,1)),'#fff',1,400); }
  var FN={world:fWorld,boss:fBoss,egg:fEgg,aura:fAura,gym:fGym,board:fBoard,skin:fSkin,mission:fMission,lb:fLb,cloud:fCloud,race:fRace,event:fEvent};
  var SIX=['.###.','#....','#....','####.','#...#','#...#','.###.'], TILES=[]; SIX.forEach(function(r,y){ r.split('').forEach(function(ch,xx){ if(ch==='#') TILES.push({x:xx-2,y:y-3,a:R()*6.283,d:.8+R()*.8,o:TILES.length}); }); });
  function draw(t){ x.setTransform(dpr,0,0,dpr,0,0); x.clearRect(0,0,W,H); var shake=0;
    if(t<TW){ bg('#0a0f2a','#000'); var sp=.05+Math.pow(t/TW,3)*1.4; warp(t,sp*2.4); var fl=t>TW-.6?(t-(TW-.6))/.6:0;
      'UPDATE'.split('').forEach(function(ch,i){ var on=t>.5+i*.32&&(Math.floor(t*20+i)%7!==0||t>2.8); text(ch,W/2+(i-2.5)*58*S,H/2,72*S,'#fff',on?clamp((t-.5-i*.32)*3,0,1)*(1-fl):0,900); });
      if(fl){ x.fillStyle='rgba(255,255,255,'+fl+')'; x.fillRect(0,0,W,H); } return; }
    if(t<TS){ var q=(t-TW)/(TS-TW); bg('#1a0b3a','#05020d'); warp(t,.2); shake=q<.25?(1-q*4)*22*S:0; x.save(); x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
      for(var k=0;k<3;k++){ var rq=clamp(q*2-k*.15,0,1); x.strokeStyle='rgba(155,123,255,'+(1-rq)+')'; x.lineWidth=12*S*(1-rq); x.beginPath(); x.arc(W/2,H/2,rq*Math.hypot(W,H)*.6,0,7); x.stroke(); }
      var sc=q<.12?3-2*eo3(q/.12):1+Math.sin(q*8)*.02; x.save(); x.translate(W/2,H/2); x.scale(sc,sc); var ts=52*S; TILES.forEach(function(tl){ var g=eob(clamp(q*5-tl.o*.045,0,1)), far=Math.hypot(W,H)*.7*tl.d*(1-g); if(g>0){ glow(tl.x*ts+Math.cos(tl.a)*far,tl.y*ts+Math.sin(tl.a)*far,ts*.9,'#9b7bff',.25*g); cubie(tl.x*ts+Math.cos(tl.a)*far,tl.y*ts+Math.sin(tl.a)*far,ts*.94*(.4+.6*g),tl.o,clamp(g*1.5,0,1)); } }); x.restore();
      text('UPDATE',W/2,H/2-232*S,44*S,'#c9b8ff',clamp(q*4,0,1),900); text('The biggest update ever',W/2,H/2+226*S,30*S*eob(clamp((q-.45)*4,0,1)),'#fff',clamp((q-.45)*4,0,1),800);
      if(q<.08){ x.fillStyle='rgba(255,255,255,'+(1-q/.08)+')'; x.fillRect(0,0,W,H); } x.restore(); return; }
    if(t<TF){ var fi=Math.floor((t-TS)/FT), p=((t-TS)%FT)/FT, f=FEAT[fi]; bg(hexa(f.c,.35),'#05060c'); warp(t,.05);
      x.save(); x.globalAlpha=p<.08?p/.08:p>.92?(1-p)/.08:1; (FN[f.k]||G6)(p,f.c,f);
      var ty=H*.82, ta=clamp(p*5,0,1); text((fi+1)+' / '+NF,W/2,ty-56*S,16*S,f.c,ta,800); text(f.t,W/2,ty-16*S,46*S*eob(ta),'#fff',ta,900); text(f.s,W/2,ty+28*S,Math.min(20*S,W/32),'#cfd3e6',clamp(p*4-.4,0,1),600); x.restore(); return; }
    var e=t-TF; bg('#140a30','#000'); warp(t,.3+Math.max(0,1.2-e));
    if(e<1.6){ FEAT.forEach(function(f,i){ var a=e*3+i*Math.PI/2, r=(1-eio(e/1.6))*170*S+10*S; x.save(); x.fillStyle=f.c; x.shadowColor=f.c; x.shadowBlur=30*S; x.beginPath(); x.arc(W/2+Math.cos(a)*r,H/2+Math.sin(a)*r,(22-e*6)*S,0,7); x.fill(); x.restore(); }); return; }
    var e2=e-1.6; if(e2<.15){ x.fillStyle='rgba(255,255,255,'+(1-e2/.15)+')'; x.fillRect(0,0,W,H); }
    boom.forEach(function(b){ var d=eo3(e2/1.4)*b.v*Math.hypot(W,H)*.5; x.fillStyle=hexa(b.c,clamp(1-e2/2.5,0,1)); x.beginPath(); x.arc(W/2+Math.cos(b.a)*d,H/2+Math.sin(b.a)*d,b.s*S,0,7); x.fill(); });
    conf.forEach(function(c){ var tt=Math.max(0,e2-c.d), X=(c.x+c.vx*tt*.15)*W, Y=H*1.05+(c.vy*tt+tt*tt*.32)*H*.55; if(Y<-40||Y>H+60) return; x.save(); x.translate(X,Y); x.rotate(c.r+c.vr*tt); x.fillStyle=c.c; x.fillRect(-c.w*S/2,-c.w*S/4,c.w*S,c.w*S/2); x.restore(); });
    var q2=eob(clamp(e2/.7,0,1)); x.save(); x.translate(W/2,H/2-30*S); x.scale(q2,q2); x.shadowColor='#9b7bff'; x.shadowBlur=40*S; text('UPDATE 6',0,0,Math.min(96*S,W/6),'#fff',1,900); x.restore();
    text('is live now',W/2,H/2+50*S,28*S,'#c9b8ff',clamp((e2-.5)*3,0,1),800);
    FEAT.forEach(function(f,i){ var g=eob(clamp((e2-.9-i*.1)*4,0,1)), gx=Math.min(W/7,96*S), X=W/2+((i%6)-2.5)*gx, Y=H/2+118*S+Math.floor(i/6)*gx*.95; if(g>0){ x.fillStyle=hexa(f.c,.28*g); x.beginPath(); x.arc(X,Y,gx*.4*g,0,7); x.fill(); text(f.i,X,Y,gx*.44*g,'#fff',1,400); } }); text('The biggest update ever',W/2,H/2+118*S+Math.min(W/7,96*S)*1.75,22*S,'#fff',clamp((e2-2.4)*2,0,1),800); }
  return {size:size,draw:draw};
}
/* ---------- music: 120 bpm, riser into the 5, four feature bars, big drop ---------- */
function audio(){ var A=window.AudioContext||window.webkitAudioContext; if(!A) return null; var a=new A(), M=a.createGain(); M.gain.value=.9; var cmp=a.createDynamicsCompressor(); M.connect(cmp); cmp.connect(a.destination); var t0=a.currentTime+.05;
  function osc(type,f1,f2,st,len,vol,lp,at){ var o=a.createOscillator(), g=a.createGain(), f=a.createBiquadFilter(); o.type=type; o.frequency.setValueAtTime(f1,t0+st); o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t0+st+len); f.type='lowpass'; f.frequency.value=lp||12000; g.gain.setValueAtTime(0,t0+st); g.gain.linearRampToValueAtTime(vol,t0+st+(at||.01)); g.gain.exponentialRampToValueAtTime(.0001,t0+st+len); o.connect(f); f.connect(g); g.connect(M); o.start(t0+st); o.stop(t0+st+len+.05); }
  var nb=a.createBuffer(1,a.sampleRate*2,a.sampleRate), nd=nb.getChannelData(0); for(var i=0;i<nd.length;i++) nd[i]=Math.random()*2-1;
  function noise(st,len,vol,type,f1,f2,q){ var s=a.createBufferSource(), f=a.createBiquadFilter(), g=a.createGain(); s.buffer=nb; s.loop=true; f.type=type||'highpass'; f.Q.value=q||.7; f.frequency.setValueAtTime(f1,t0+st); if(f2) f.frequency.exponentialRampToValueAtTime(f2,t0+st+len); g.gain.setValueAtTime(vol,t0+st); g.gain.exponentialRampToValueAtTime(.0001,t0+st+len); s.connect(f); f.connect(g); g.connect(M); s.start(t0+st); s.stop(t0+st+len+.05); }
  function kick(st,v){ osc('sine',150,40,st,.32,v||.9); }
  function n(st,oct){ return 55*Math.pow(2,oct+st/12); }
  noise(0,TW,.25,'bandpass',300,9000,1.5); osc('sawtooth',n(0,1),n(12,2),0,TW,.12,3000,TW*.8);
  for(var b=0;b<TW/B;b++){ if(b>=4) kick(b*B,.5+b/16); }
  for(var s=TW-1;s<TW;s+=B/4) noise(s,.05,.25,'highpass',6000);
  osc('sine',70,28,TW,2,1.2); noise(TW,1.5,.6,'lowpass',8000,120); [0,7,12,16].forEach(function(st){ osc('sawtooth',n(st,3),n(st,3),TW,2.4,.06,4000,.02); });
  var prog=[[0,3,7],[8,12,15],[5,8,12],[7,11,14]];
  for(var f=0;f<NF;f++){ var fs=TS+f*FT; for(var k=0;k<Math.floor(FT/B);k++){ var bt=fs+k*B; kick(bt,.85); if(k%2) noise(bt,.14,.18,'bandpass',1800,0,1.2); noise(bt+B/2,.04,.08,'highpass',8000); osc('sawtooth',n(prog[f][0],1),n(prog[f][0],1),bt,B*.9,.16,480);
      prog[f].forEach(function(st,q){ osc('square',n(st,4),n(st,4),bt+q*B/3,B/3,.035,2600); }); }
    osc('sine',1568,1568,fs,.25,.06); }
  var td=TF; noise(td,1.6,.2,'bandpass',400,9000,1.5); osc('sawtooth',n(0,2),n(12,3),td,1.6,.09,5000,1.4);
  var dr=td+1.6; osc('sine',90,30,dr,1.8,1.2); noise(dr,.6,.6,'lowpass',9000,200); noise(dr,2.6,.3,'highpass',5000,9000);
  [0,4,7,11,14].forEach(function(st){ osc('sawtooth',n(st,4),n(st,4),dr,3,.06,3800,.01); osc('square',n(st,2),n(st,2),dr,3,.04,1800,.01); });
  for(var b2=0;b2<8;b2++){ var t2=dr+B+b2*B; if(t2>DUR-.6) break; kick(t2,.9); noise(t2+B/2,.05,.07,'highpass',8000); }
  [1318.5,1568,1975.5,2637].forEach(function(fq,q){ osc('sine',fq,fq,dr+.6+q*.12,1.6,.05); });
  return {master:M,stop:function(){ try{ M.gain.setTargetAtTime(0,a.currentTime,.05); setTimeout(function(){ try{ a.close(); }catch(e){} },300); }catch(e){} }}; }
window.CWCut6={dur:DUR,Scene:Scene,
  play:function(opts){ opts=opts||{}; var wrap=document.createElement('div'); wrap.className='ucut'; wrap.setAttribute('role','dialog'); wrap.setAttribute('aria-label','Update 6');
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
