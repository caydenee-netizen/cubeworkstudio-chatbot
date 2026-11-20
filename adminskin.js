/* Hand-painted artwork for the the Admin pad skin (id 85). Same format as padart.js: draw(ctx,w,h,R). */
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

A[85]={ink:'#fff4d6',glow:'rgba(255,190,60,.75)',draw:function(c,w,h,R){ var s=M(w,h);
  fill(c,w,h,rad(c,w/2,h/2,0,Math.hypot(w,h)*.62,[[0,'#3a0a12'],[1,'#0a0305']]));
  c.save(); c.beginPath(); c.rect(0,0,w,h); c.clip(); c.fillStyle='rgba(255,190,40,.16)'; for(var x=-h;x<w+h;x+=s*34){ c.beginPath(); c.moveTo(x,0); c.lineTo(x+s*16,0); c.lineTo(x+s*16-h*.5,h); c.lineTo(x-h*.5,h); c.fill(); } c.restore();
  c.fillStyle='#ffc233'; c.fillRect(0,0,w,s*8); c.fillRect(0,h-s*8,w,s*8); c.fillStyle='#120406'; for(var k=0;k<w;k+=s*28){ c.fillRect(k,0,s*14,s*8); c.fillRect(k+s*14,h-s*8,s*14,s*8); }
  var cx=w/2, cy=h/2, k2=s*46;
  c.save(); c.globalCompositeOperation='lighter'; glow(c,cx,cy,k2*3,'rgba(255,170,40,.5)'); c.restore();
  c.beginPath(); c.moveTo(cx,cy-k2*1.15); c.lineTo(cx+k2*.95,cy-k2*.7); c.lineTo(cx+k2*.8,cy+k2*.35); c.quadraticCurveTo(cx+k2*.45,cy+k2*.95,cx,cy+k2*1.2); c.quadraticCurveTo(cx-k2*.45,cy+k2*.95,cx-k2*.8,cy+k2*.35); c.lineTo(cx-k2*.95,cy-k2*.7); c.closePath();
  c.fillStyle=lin(c,cx,cy-k2,cx,cy+k2,[[0,'#ffe27a'],[.5,'#ffb300'],[1,'#a86a00']]); c.fill(); c.strokeStyle='#fff3c0'; c.lineWidth=s*2.2; c.stroke();
  c.fillStyle='#2a0508'; c.beginPath(); c.moveTo(cx,cy-k2*.85); c.lineTo(cx+k2*.68,cy-k2*.5); c.lineTo(cx+k2*.58,cy+k2*.26); c.quadraticCurveTo(cx+k2*.32,cy+k2*.7,cx,cy+k2*.88); c.quadraticCurveTo(cx-k2*.32,cy+k2*.7,cx-k2*.58,cy+k2*.26); c.lineTo(cx-k2*.68,cy-k2*.5); c.closePath(); c.fill();
  star(c,cx,cy-k2*.1,k2*.42,'#ffd34a'); c.fillStyle='#ffd34a'; c.beginPath(); c.moveTo(cx-k2*.4,cy+k2*.45); c.lineTo(cx-k2*.4,cy+k2*.25); c.lineTo(cx-k2*.2,cy+k2*.35); c.lineTo(cx,cy+k2*.18); c.lineTo(cx+k2*.2,cy+k2*.35); c.lineTo(cx+k2*.4,cy+k2*.25); c.lineTo(cx+k2*.4,cy+k2*.45); c.closePath(); c.fill();
  c.fillStyle='rgba(255,230,160,.95)'; c.font='900 '+Math.round(s*13)+'px sans-serif'; c.textAlign='center'; c.fillText('ADMIN',cx,h-s*20);
  for(var i=0;i<14;i++) star(c,R()*w,R()*h,s*(2+R()*4),'rgba(255,220,120,.85)'); vign(c,w,h,.4); }};
})();

/* the Admin pad skin: only creators, owners and mini admins can have it */
(function(){
function add(n){ if(!window.PL||!PL.skins||!PL.skins.list){ if(n<60) setTimeout(function(){ add(n+1); },250); return; }
  if(!PL.skins.list.some(function(k){ return k.i===85; })) PL.skins.list.push({i:85,n:'Admin',ty:'season',cost:0,gift:1,lc:1,css:'linear-gradient(135deg,#3a0a12,#120406 55%,#ffb300)',need:'Admin only · creators, owners and mini admins'});
  try{ if(window.CW_U2ART) CW_U2ART(PL.skins.list); }catch(e){}
  if(window.CW_PADFX&&CW_PADFX.fset) CW_PADFX.fset[85]=['bolts','sparkle']; }
add(0);
})();
