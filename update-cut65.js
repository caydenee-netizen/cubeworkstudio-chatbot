/* Update 6.5 cutscene: tiles assemble a big "6.5", four animated feature scenes, then a confetti finale. Canvas 2D + WebAudio, about 19 seconds. */
(function(){
var TI=3.6, FT=3, FEAT=[
 {t:'6 new Cube Dash levels',s:'Levels 43 to 48, ending in the Update 6.5 Finale.',c:'#ffd21a',k:'dash'},
 {t:'Bug fixes',s:'3D Cube fixes.',c:'#3ddc6a',k:'fix'}],
 TF=TI+FEAT.length*FT, DUR=TF+4.2;
function clamp(x){ return x<0?0:x>1?1:x; } function eo(x){ return 1-Math.pow(1-clamp(x),3); } function eb(x){ x=clamp(x); var c=1.70158; return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2); }
/* 5x7 pixel glyphs for "6", "." and "5" */
var GL={'6':['01110','10000','10000','11110','10001','10001','01110'],'.':['0','0','0','0','0','0','1'],'5':['11111','10000','11110','00001','00001','10001','01110']};
function Scene(cv){ var x=cv.getContext('2d'), W=0, H=0, S=1, stars=[], conf=[], tiles=[], COL=['#e1352b','#ff7a1a','#f2c400','#1f9a52','#1d4fd8','#f4f4f4'];
  for(var i=0;i<90;i++) stars.push([Math.random(),Math.random(),.3+Math.random()*1.2,Math.random()*6.28]);
  for(i=0;i<170;i++) conf.push({a:Math.random()*6.28,v:.35+Math.random()*.9,r:Math.random()*6.28,vr:(Math.random()-.5)*9,c:COL[i%6],w:6+Math.random()*8,d:Math.random()*.25});
  (function(){ var ox=0, str='6.5'; for(var g=0;g<str.length;g++){ var G=GL[str[g]]; for(var r=0;r<7;r++) for(var c=0;c<G[r].length;c++) if(G[r][c]==='1') tiles.push({gx:ox+c,gy:r,a:Math.random()*6.28,d:.25+Math.random()*.9+g*.25,c:COL[(r+c+g)%6]}); ox+=G[0].length+1; } tiles.w=ox-1; })();
  function size(){ var dpr=Math.min(2,window.devicePixelRatio||1); W=cv.clientWidth||innerWidth; H=cv.clientHeight||innerHeight; cv.width=W*dpr; cv.height=H*dpr; x.setTransform(dpr,0,0,dpr,0,0); S=Math.min(W/760,H/620); }
  function text(s,px,py,sz,col,al,wt,align){ x.save(); x.globalAlpha=al==null?1:al; x.fillStyle=col; x.textAlign=align||'center'; x.textBaseline='middle'; x.font=(wt||800)+' '+sz+'px "Inter Tight",Inter,system-ui,sans-serif'; x.fillText(s,px,py); x.restore(); }
  function wrap(s,px,py,sz,col,al,maxW){ x.save(); x.font='500 '+sz+'px Inter,system-ui,sans-serif'; var w=s.split(' '), ln='', L=[]; w.forEach(function(q){ if(x.measureText(ln+q).width>maxW&&ln){ L.push(ln.trim()); ln=''; } ln+=q+' '; }); L.push(ln.trim()); x.globalAlpha=al; x.fillStyle=col; x.textAlign='center'; x.textBaseline='middle'; L.forEach(function(l,i){ x.fillText(l,px,py+i*sz*1.35); }); x.restore(); }
  function rr(px,py,w,h,r){ x.beginPath(); x.moveTo(px+r,py); x.arcTo(px+w,py,px+w,py+h,r); x.arcTo(px+w,py+h,px,py+h,r); x.arcTo(px,py+h,px,py,r); x.arcTo(px,py,px+w,py,r); x.closePath(); }
  function bg(t,tint){ var g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#070a16'); g.addColorStop(1,'#101a33'); x.fillStyle=g; x.fillRect(0,0,W,H);
    if(tint){ var rg=x.createRadialGradient(W/2,H*.42,0,W/2,H*.42,Math.max(W,H)*.6); rg.addColorStop(0,tint+'55'); rg.addColorStop(1,tint+'00'); x.fillStyle=rg; x.fillRect(0,0,W,H); }
    stars.forEach(function(s){ var yy=((s[1]+t*.02*s[2])%1)*H; x.globalAlpha=.25+.35*Math.abs(Math.sin(t*1.3+s[3])); x.fillStyle='#fff'; x.fillRect(s[0]*W,yy,s[2]*S*1.4,s[2]*S*1.4); }); x.globalAlpha=1; }
  function cube(px,py,sz,rot){ x.save(); x.translate(px,py); x.rotate(rot||0); rr(-sz/2,-sz/2,sz,sz,sz*.16); x.fillStyle='#15181d'; x.fill(); var c=sz*.27, g=sz*.045; for(var i=0;i<9;i++){ rr(-sz/2+g*1.6+(i%3)*(c+g),-sz/2+g*1.6+Math.floor(i/3)*(c+g),c,c,c*.2); x.fillStyle=COL[(i*5+2)%6]; x.fill(); } x.restore(); }
  function intro(t){ bg(t); var ts=Math.min(W*.8/tiles.w,H*.36/7), ox=W/2-tiles.w*ts/2, oy=H*.44-3.5*ts, sh=t>2&&t<2.35?(Math.random()-.5)*10*S*(1-(t-2)/.35):0;
    x.save(); x.translate(sh,sh*.6);
    tiles.forEach(function(q){ var p=eb((t-q.d)/.75), fx=W/2+Math.cos(q.a)*Math.max(W,H)*.75, fy=H/2+Math.sin(q.a)*Math.max(W,H)*.75, tx=ox+q.gx*ts, ty=oy+q.gy*ts, px=fx+(tx-fx)*p, py=fy+(ty-fy)*p; if(t<q.d) return; x.save(); x.translate(px+ts/2,py+ts/2); x.rotate((1-clamp((t-q.d)/.75))*3); rr(-ts*.46,-ts*.46,ts*.92,ts*.92,ts*.18); x.fillStyle=q.c; x.shadowColor=q.c; x.shadowBlur=14*S; x.fill(); x.restore(); });
    x.restore();
    if(t>2){ var r=(t-2)/.9; if(r<1){ x.beginPath(); x.arc(W/2,H*.44,r*Math.max(W,H)*.6,0,6.28); x.strokeStyle='rgba(255,255,255,'+(.6*(1-r))+')'; x.lineWidth=5*S; x.stroke(); } }
    text('UPDATE',W/2,oy-ts*1.1,22*S,'#8fb4ff',eo((t-.2)/.6),700);
    text('Cuber Tools',W/2,oy+7*ts+ts*1.2,20*S,'#fff',eo((t-2.2)/.6)*.85,600); }
  function sceneSky(t,cx,cy,w,h){ var n=7; for(var r=n;r>=0;r--){ var z=((r-(t*1.6)%1)/n), sc=.35+.65*z, yy=cy-h*.3+h*.7*z*z, kw=w*.16*sc; for(var l=-1;l<=1;l++){ rr(cx+l*kw*1.12-kw/2,yy,kw,kw*.5,kw*.1); x.fillStyle=(r+l+Math.floor(t*1.6))%3===0?'#eaf4ff':(r+l)%2?'#3f6ea8':'#2b4d7c'; x.globalAlpha=clamp(z*2.2); x.fill(); } } x.globalAlpha=1; var hop=Math.abs(Math.sin(t*5.2)); cube(cx,cy+h*.2-hop*h*.2,h*.26,Math.sin(t*5.2)*.12); x.beginPath(); x.arc(cx+w*.3,cy-h*.34,h*.11,0,6.28); x.fillStyle='#ffe27a'; x.shadowColor='#ffe27a'; x.shadowBlur=30*S; x.fill(); x.shadowBlur=0; }
  function sceneDash(t,cx,cy,w,h){ var gy=cy+h*.26, sp=w*.9, off=(t*sp)%(w*.5); x.fillStyle='#ffd21a'; x.fillRect(cx-w/2,gy,w,3*S); for(var i=-1;i<4;i++){ var sx=cx-w/2+i*w*.5-off+w*.6, sz=h*.16; if(sx<cx-w/2-sz||sx>cx+w/2) continue; x.beginPath(); x.moveTo(sx,gy); x.lineTo(sx+sz/2,gy-sz); x.lineTo(sx+sz,gy); x.closePath(); x.fillStyle='#fff'; x.fill(); }
    var ph=((t*sp)%(w*.5))/(w*.5), j=Math.sin(Math.min(1,Math.max(0,(ph-.05)/.6))*Math.PI); var bs=h*.2; x.save(); x.translate(cx-w*.2,gy-bs/2-j*h*.34); x.rotate(ph*Math.PI); rr(-bs/2,-bs/2,bs,bs,bs*.14); x.fillStyle='#ffd21a'; x.fill(); x.fillStyle='#14061f'; x.fillRect(-bs*.24,-bs*.16,bs*.16,bs*.16); x.fillRect(bs*.08,-bs*.16,bs*.16,bs*.16); x.restore();
    for(i=0;i<6;i++){ x.globalAlpha=.5-i*.08; x.fillStyle='#ffd21a'; x.fillRect(cx-w*.2-bs*.7-i*bs*.36,gy-bs*.3-j*h*.34*(1-i*.12),bs*.22,bs*.22); } x.globalAlpha=1; }
  function sceneGear(t,cx,cy,w,h){ var cs=['#6ec1ff','#ff7f6b','#7dffc8','#b48cff','#ffb02e']; cs.forEach(function(c,i){ x.beginPath(); for(var k=0;k<=40;k++){ var px=cx-w/2+k/40*w, py=cy-h*.3+i*h*.085+Math.sin(k*.3+t*4+i)*h*.03; if(k) x.lineTo(px,py); else x.moveTo(px,py); } x.strokeStyle=c; x.lineWidth=h*.045; x.lineCap='round'; x.globalAlpha=clamp((t-.15*i)/.4); x.stroke(); }); x.globalAlpha=1;
    for(var i=0;i<3;i++){ var r=h*.17+i*h*.055+Math.sin(t*3+i)*h*.01; x.beginPath(); x.ellipse(cx,cy+h*.3,r*1.5,r*.45,0,0,6.28); x.strokeStyle=['#6ec1ff','#ff7f6b','#b48cff'][i]; x.lineWidth=3*S; x.globalAlpha=.9-i*.2; x.stroke(); } x.globalAlpha=1; cube(cx,cy+h*.16,h*.24,0); }
  function sceneFix(t,cx,cy,w,h){ var L=['3D Cube turns once per tap','2×2 solves save to the 2×2 list']; L.forEach(function(s,i){ var p=eo((t-.35-i*.45)/.4), yy=cy-h*.24+i*h*.24, bw=Math.min(w,460*S); rr(cx-bw/2,yy-h*.085,bw,h*.17,14*S); x.globalAlpha=p; x.fillStyle='rgba(255,255,255,.08)'; x.fill(); x.beginPath(); x.arc(cx-bw/2+h*.085,yy,h*.05,0,6.28); x.fillStyle='#3ddc6a'; x.fill(); x.strokeStyle='#07130b'; x.lineWidth=3*S; x.lineCap='round'; x.beginPath(); x.moveTo(cx-bw/2+h*.062,yy); x.lineTo(cx-bw/2+h*.08,yy+h*.018); x.lineTo(cx-bw/2+h*.11,yy-h*.02); x.stroke(); x.globalAlpha=1; text(s,cx-bw/2+h*.17,yy,Math.min(17*S,bw/24),'#fff',p,600,'left'); }); }
  function feat(i,t){ var f=FEAT[i]; bg(t+i,f.c); var a=eo(t/.35)*(1-eo((t-(FT-.3))/.3)), sl=(1-eo(t/.45))*60*S, cw=Math.min(W*.86,620*S), ch=H*.36, cy=H*.36;
    x.save(); x.globalAlpha=a; x.translate(sl,0); x.save(); rr(W/2-cw/2,cy-ch/2,cw,ch,24*S); x.fillStyle='rgba(8,12,26,.72)'; x.fill(); x.strokeStyle=f.c; x.lineWidth=2*S; x.stroke(); x.clip();
    (f.k==='sky'?sceneSky:f.k==='dash'?sceneDash:f.k==='gear'?sceneGear:sceneFix)(t,W/2,cy,cw*.9,ch); x.restore(); x.restore();
    text(f.t,W/2-sl*.5,cy+ch/2+H*.085,Math.min(34*S,W/(f.t.length*.56)),'#fff',a,800); wrap(f.s,W/2,cy+ch/2+H*.085+38*S,17*S,'#c9d6f5',a*.95,Math.min(W*.84,560*S));
    FEAT.forEach(function(_,k){ x.beginPath(); x.arc(W/2+(k-(FEAT.length-1)/2)*18*S,H*.92,k===i?5*S:3.5*S,0,6.28); x.fillStyle=k===i?f.c:'rgba(255,255,255,.35)'; x.fill(); }); }
  function fin(t){ bg(t,'#4aa8ff'); var p=eb(t/.7); x.save(); x.translate(W/2,H*.4); x.scale(p,p); text('6.5',0,0,150*S,'#fff',1,900); x.restore(); text('Update 6.5 is live',W/2,H*.4+110*S,30*S,'#fff',eo((t-.5)/.5),800); text('Have fun.',W/2,H*.4+150*S,18*S,'#c9d6f5',eo((t-.9)/.5),500);
    conf.forEach(function(c){ var tt=t-.25-c.d; if(tt<0) return; var d=tt*c.v*Math.max(W,H)*.55, px=W/2+Math.cos(c.a)*d, py=H*.4+Math.sin(c.a)*d+tt*tt*220*S; x.save(); x.translate(px,py); x.rotate(c.r+c.vr*tt); x.globalAlpha=clamp(1.6-tt*.5); x.fillStyle=c.c; x.fillRect(-c.w/2,-c.w/4,c.w,c.w/2); x.restore(); });
    var fo=clamp((t-(DUR-TF-.5))/.5); if(fo>0){ x.fillStyle='rgba(0,0,0,'+fo+')'; x.fillRect(0,0,W,H); } }
  function draw(t){ if(!W) size(); if(t<TI) intro(t); else if(t<TF){ var i=Math.min(FEAT.length-1,Math.floor((t-TI)/FT)); feat(i,t-TI-i*FT); } else fin(t-TF); }
  size(); return {draw:draw,size:size}; }
function audio(){ var A=window.AudioContext||window.webkitAudioContext; if(!A) return null; var a=new A(), M=a.createGain(); M.gain.value=.8; M.connect(a.destination); var t0=a.currentTime+.05;
  function osc(type,f0,f1,at,len,vol){ var o=a.createOscillator(), g=a.createGain(); o.type=type; o.frequency.setValueAtTime(f0,t0+at); if(f1!==f0) o.frequency.exponentialRampToValueAtTime(f1,t0+at+len); g.gain.setValueAtTime(0,t0+at); g.gain.linearRampToValueAtTime(vol,t0+at+.012); g.gain.exponentialRampToValueAtTime(.0001,t0+at+len); o.connect(g); g.connect(M); o.start(t0+at); o.stop(t0+at+len+.05); }
  var B=.5, N=[261.6,329.6,392,523.3,392,329.6,440,587.3];
  for(var b=0;b*B<DUR-1;b++){ osc('sine',120,45,b*B,.22,.5); if(b%2) osc('triangle',1800,900,b*B+.25,.05,.05); if(b*B>TI-.1) osc('triangle',N[b%8],N[b%8],b*B,.3,.07); }
  osc('sawtooth',80,640,.2,1.8,.05); osc('sine',60,30,2,.9,.7); [523.3,659.3,784,1046.5].forEach(function(f,i){ osc('sine',f,f,TF+.1+i*.11,1.4,.09); });
  return {master:M,stop:function(){ try{ M.gain.setTargetAtTime(0,a.currentTime,.05); setTimeout(function(){ try{ a.close(); }catch(e){} },300); }catch(e){} }}; }
window.CWCut65={dur:DUR,Scene:Scene,
  play:function(opts){ opts=opts||{}; var wrap=document.createElement('div'); wrap.className='ucut'; wrap.setAttribute('role','dialog'); wrap.setAttribute('aria-label','Update 6.5');
    wrap.innerHTML='<canvas></canvas><button type="button" class="ucut-sk" hidden>Skip</button><button type="button" class="ucut-mu" aria-label="Sound">Sound</button>'; document.body.appendChild(wrap); document.documentElement.classList.add('ucut-on');
    var cv=wrap.querySelector('canvas'), sk=wrap.querySelector('.ucut-sk'), mu=wrap.querySelector('.ucut-mu'), sc=Scene(cv), au=null, muted=false, t0=performance.now(), done=false, raf=0;
    try{ au=audio(); }catch(e){}
    mu.onclick=function(){ muted=!muted; mu.textContent=muted?'Muted':'Sound'; if(au) au.master.gain.value=muted?0:.8; };
    function end(){ if(done) return; done=true; cancelAnimationFrame(raf); window.removeEventListener('resize',rs); if(au) au.stop(); wrap.classList.add('out'); setTimeout(function(){ wrap.remove(); document.documentElement.classList.remove('ucut-on'); if(opts.onend) opts.onend(); },420); }
    function rs(){ sc.size(); }
    window.addEventListener('resize',rs); sk.onclick=end;
    (function loop(){ var t=(performance.now()-t0)/1000; try{ sc.draw(Math.min(t,DUR)); }catch(e){ console.error(e); } if(t>3&&sk.hidden) sk.hidden=false; if(t>=DUR){ end(); return; } raf=requestAnimationFrame(loop); })();
    return {end:end}; }};
})();
