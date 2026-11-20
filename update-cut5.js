/* Update 5 cutscene: a warp-speed tunnel, a giant 5 slamming in, one animated scene per new feature, then a confetti finale. Canvas 2D + WebAudio, about 28 seconds, no voice. */
(function(){
var BPM=120, B=60/BPM, TW=4, TS=TW+2.5, FT=3.2, NF=4, TF=TS+NF*FT, DUR=TF+6.5;
var FEAT=[
 {t:'1v1 Duels',s:'Same scramble, best of 3. Winner takes the stake.',c:'#ff4d6d',k:'duel'},
 {t:'Mystery Crates',s:'Random cars, trails and pad skins. Duplicates turn into tokens.',c:'#ffb300',k:'crate'},
 {t:'Community Levels',s:'Build a Cube Dash level, publish it, get it featured.',c:'#26c6da',k:'dash'},
 {t:'Profile Cards',s:'Your best times, badges, rarest skin and banner.',c:'#9b7bff',k:'card'}];
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
  var FN={duel:fDuel,crate:fCrate,dash:fDash,card:fCard};
  function draw(t){ x.setTransform(dpr,0,0,dpr,0,0); x.clearRect(0,0,W,H); var shake=0;
    if(t<TW){ bg('#0a0f2a','#000'); var sp=.05+Math.pow(t/TW,3)*1.4; warp(t,sp*2.4); var fl=t>TW-.6?(t-(TW-.6))/.6:0;
      'UPDATE'.split('').forEach(function(ch,i){ var on=t>.5+i*.32&&(Math.floor(t*20+i)%7!==0||t>2.8); text(ch,W/2+(i-2.5)*58*S,H/2,72*S,'#fff',on?clamp((t-.5-i*.32)*3,0,1)*(1-fl):0,900); });
      if(fl){ x.fillStyle='rgba(255,255,255,'+fl+')'; x.fillRect(0,0,W,H); } return; }
    if(t<TS){ var q=(t-TW)/(TS-TW); bg('#1a0b3a','#05020d'); warp(t,.2); shake=q<.25?(1-q*4)*22*S:0; x.save(); x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
      for(var k=0;k<3;k++){ var rq=clamp(q*2-k*.15,0,1); x.strokeStyle='rgba(155,123,255,'+(1-rq)+')'; x.lineWidth=12*S*(1-rq); x.beginPath(); x.arc(W/2,H/2,rq*Math.hypot(W,H)*.6,0,7); x.stroke(); }
      var sc=q<.12?3-2*eo3(q/.12):1+Math.sin(q*8)*.02; x.save(); x.translate(W/2,H/2); x.scale(sc,sc); x.shadowColor='#9b7bff'; x.shadowBlur=60*S; text('5',0,0,320*S,'#fff',1,900); x.restore();
      text('UPDATE',W/2,H/2-200*S,40*S,'#c9b8ff',clamp(q*4,0,1),900); text('is here',W/2,H/2+190*S,28*S,'#fff',clamp((q-.4)*4,0,1),700);
      if(q<.08){ x.fillStyle='rgba(255,255,255,'+(1-q/.08)+')'; x.fillRect(0,0,W,H); } x.restore(); return; }
    if(t<TF){ var fi=Math.floor((t-TS)/FT), p=((t-TS)%FT)/FT, f=FEAT[fi]; bg(hexa(f.c,.35),'#05060c'); warp(t,.05);
      x.save(); x.globalAlpha=p<.08?p/.08:p>.92?(1-p)/.08:1; FN[f.k](p,f.c);
      var ty=H*.82, ta=clamp(p*5,0,1); text((fi+1)+' / '+NF,W/2,ty-56*S,16*S,f.c,ta,800); text(f.t,W/2,ty-16*S,46*S*eob(ta),'#fff',ta,900); text(f.s,W/2,ty+28*S,Math.min(20*S,W/32),'#cfd3e6',clamp(p*4-.4,0,1),600); x.restore(); return; }
    var e=t-TF; bg('#140a30','#000'); warp(t,.3+Math.max(0,1.2-e));
    if(e<1.6){ FEAT.forEach(function(f,i){ var a=e*3+i*Math.PI/2, r=(1-eio(e/1.6))*170*S+10*S; x.save(); x.fillStyle=f.c; x.shadowColor=f.c; x.shadowBlur=30*S; x.beginPath(); x.arc(W/2+Math.cos(a)*r,H/2+Math.sin(a)*r,(22-e*6)*S,0,7); x.fill(); x.restore(); }); return; }
    var e2=e-1.6; if(e2<.15){ x.fillStyle='rgba(255,255,255,'+(1-e2/.15)+')'; x.fillRect(0,0,W,H); }
    boom.forEach(function(b){ var d=eo3(e2/1.4)*b.v*Math.hypot(W,H)*.5; x.fillStyle=hexa(b.c,clamp(1-e2/2.5,0,1)); x.beginPath(); x.arc(W/2+Math.cos(b.a)*d,H/2+Math.sin(b.a)*d,b.s*S,0,7); x.fill(); });
    conf.forEach(function(c){ var tt=Math.max(0,e2-c.d), X=(c.x+c.vx*tt*.15)*W, Y=H*1.05+(c.vy*tt+tt*tt*.32)*H*.55; if(Y<-40||Y>H+60) return; x.save(); x.translate(X,Y); x.rotate(c.r+c.vr*tt); x.fillStyle=c.c; x.fillRect(-c.w*S/2,-c.w*S/4,c.w*S,c.w*S/2); x.restore(); });
    var q2=eob(clamp(e2/.7,0,1)); x.save(); x.translate(W/2,H/2-30*S); x.scale(q2,q2); x.shadowColor='#9b7bff'; x.shadowBlur=40*S; text('UPDATE 5',0,0,Math.min(96*S,W/6),'#fff',1,900); x.restore();
    text('is live now',W/2,H/2+50*S,28*S,'#c9b8ff',clamp((e2-.5)*3,0,1),800);
    var row=FEAT.map(function(f){ return f.t; }); row.forEach(function(s,i){ text(s,W/2+(i-1.5)*Math.min(190*S,W/4.2),H/2+130*S,Math.min(18*S,W/30),FEAT[i].c,clamp((e2-1-i*.15)*3,0,1),800); }); }
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
window.CWCut5={dur:DUR,Scene:Scene,
  play:function(opts){ opts=opts||{}; var wrap=document.createElement('div'); wrap.className='ucut'; wrap.setAttribute('role','dialog'); wrap.setAttribute('aria-label','Update 5');
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
