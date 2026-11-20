/* Two-phase cube solver (Kociemba's method) for the Learn scanner.
   solve(facelets) takes 54 letters in URFDLB order (U1..U9, R1..R9, F1..F9, D1..D9, L1..L9, B1..B9)
   and returns a solution like "R U2 F' ...", or {error} when the colours cannot be a real cube.
   Tables are built the first time it runs (about a second), then kept. Runs in a browser or in Node. */
(function(root){
'use strict';
var URF=0,UFL=1,ULB=2,UBR=3,DFR=4,DLF=5,DBL=6,DRB=7;
/* facelet indices of each corner / edge, and the face colours they must show */
var CF=[[8,9,20],[6,18,38],[0,36,47],[2,45,11],[29,26,15],[27,44,24],[33,53,42],[35,17,51]];
var EF=[[5,10],[7,19],[3,37],[1,46],[32,16],[28,25],[30,43],[34,52],[23,12],[21,41],[50,39],[48,14]];
var CC=[['U','R','F'],['U','F','L'],['U','L','B'],['U','B','R'],['D','F','R'],['D','L','F'],['D','B','L'],['D','R','B']];
var EC=[['U','R'],['U','F'],['U','L'],['U','B'],['D','R'],['D','F'],['D','L'],['D','B'],['F','R'],['F','L'],['B','L'],['B','R']];
/* the six quarter turns as cubie permutations (U R F D L B) */
var BM=[
 {cp:[3,0,1,2,4,5,6,7],co:[0,0,0,0,0,0,0,0],ep:[3,0,1,2,4,5,6,7,8,9,10,11],eo:[0,0,0,0,0,0,0,0,0,0,0,0]},
 {cp:[4,1,2,0,7,5,6,3],co:[2,0,0,1,1,0,0,2],ep:[8,1,2,3,11,5,6,7,4,9,10,0],eo:[0,0,0,0,0,0,0,0,0,0,0,0]},
 {cp:[1,5,2,3,0,4,6,7],co:[1,2,0,0,2,1,0,0],ep:[0,9,2,3,4,8,6,7,1,5,10,11],eo:[0,1,0,0,0,1,0,0,1,1,0,0]},
 {cp:[0,1,2,3,5,6,7,4],co:[0,0,0,0,0,0,0,0],ep:[0,1,2,3,5,6,7,4,8,9,10,11],eo:[0,0,0,0,0,0,0,0,0,0,0,0]},
 {cp:[0,2,6,3,4,1,5,7],co:[0,1,2,0,0,2,1,0],ep:[0,1,10,3,4,5,9,7,8,2,6,11],eo:[0,0,0,0,0,0,0,0,0,0,0,0]},
 {cp:[0,1,3,7,4,5,2,6],co:[0,0,1,2,0,0,2,1],ep:[0,1,2,11,4,5,6,10,8,9,3,7],eo:[0,0,0,1,0,0,0,1,0,0,1,1]}];
var FN='URFDLB', MN=[]; for(var f=0;f<6;f++){ MN.push(FN[f],FN[f]+'2',FN[f]+"'"); }
function cc(){ return {cp:[0,1,2,3,4,5,6,7],co:[0,0,0,0,0,0,0,0],ep:[0,1,2,3,4,5,6,7,8,9,10,11],eo:[0,0,0,0,0,0,0,0,0,0,0,0]}; }
function mul(a,b){ var r={cp:[],co:[],ep:[],eo:[]}, i; for(i=0;i<8;i++){ r.cp[i]=a.cp[b.cp[i]]; r.co[i]=(a.co[b.cp[i]]+b.co[i])%3; } for(i=0;i<12;i++){ r.ep[i]=a.ep[b.ep[i]]; r.eo[i]=(a.eo[b.ep[i]]+b.eo[i])%2; } return r; }
var MC=[]; (function(){ for(var f=0;f<6;f++){ var x=cc(); for(var p=0;p<3;p++){ x=mul(x,BM[f]); MC[f*3+p]=x; } } })();
var CNK=[]; for(var n=0;n<13;n++){ CNK[n]=[]; for(var k=0;k<13;k++){ var v=1; if(k>n) v=0; else for(var q=1;q<=k;q++) v=v*(n-q+1)/q; CNK[n][k]=Math.round(v); } }
function getTwist(c){ var t=0; for(var i=0;i<7;i++) t=t*3+c.co[i]; return t; }
function setTwist(c,t){ var s=0; for(var i=6;i>=0;i--){ c.co[i]=t%3; s+=c.co[i]; t=Math.floor(t/3); } c.co[7]=(3-s%3)%3; }
function getFlip(c){ var t=0; for(var i=0;i<11;i++) t=t*2+c.eo[i]; return t; }
function setFlip(c,t){ var s=0; for(var i=10;i>=0;i--){ c.eo[i]=t%2; s+=c.eo[i]; t=t>>1; } c.eo[11]=s%2; }
/* where the 4 middle-layer edges (8..11) sit: colex rank of their 4 positions, 0..494 */
function getSlice(c){ var a=0,x=0; for(var j=0;j<12;j++) if(c.ep[j]>=8){ x++; a+=CNK[j][x]; } return a; }
function setSlice(c,idx){ var pos=[], x=4; for(var j=11;j>=0&&x>0;j--){ if(idx>=CNK[j][x]){ pos.push(j); idx-=CNK[j][x]; x--; } } var e=0,s=8; for(var i=0;i<12;i++){ c.ep[i]=pos.indexOf(i)>=0?s++:e++; } }
function rankP(a,n){ var r=0; for(var i=0;i<n;i++){ var s=0; for(var j=i+1;j<n;j++) if(a[j]<a[i]) s++; r=r*(n-i)+s; } return r; }
function unrankP(r,n){ var d=[], i; for(i=n-1;i>=0;i--){ d[i]=r%(n-i); r=Math.floor(r/(n-i)); } var used=[], out=[]; for(i=0;i<n;i++){ var k=d[i]; for(var j=0;j<n;j++){ if(!used[j]){ if(k===0){ out[i]=j; used[j]=1; break; } k--; } } } return out; }
function getCP(c){ return rankP(c.cp,8); }
function getEP8(c){ return rankP(c.ep.slice(0,8),8); }
function getSP(c){ return rankP(c.ep.slice(8).map(function(v){ return v-8; }),4); }
var P2=[0,1,2,4,7,9,10,11,13,16];
var T=null;
function build(){ if(T) return T; var t={}, i, m, c;
  t.tw=new Uint16Array(2187*18); t.fl=new Uint16Array(2048*18); t.sl=new Uint16Array(495*18); t.cpm=new Uint16Array(40320*18); t.epm=new Uint16Array(40320*18); t.spm=new Uint8Array(24*18);
  for(i=0;i<2187;i++){ c=cc(); setTwist(c,i); for(m=0;m<18;m++) t.tw[i*18+m]=getTwist(mul(c,MC[m])); }
  for(i=0;i<2048;i++){ c=cc(); setFlip(c,i); for(m=0;m<18;m++) t.fl[i*18+m]=getFlip(mul(c,MC[m])); }
  for(i=0;i<495;i++){ c=cc(); setSlice(c,i); for(m=0;m<18;m++) t.sl[i*18+m]=getSlice(mul(c,MC[m])); }
  for(i=0;i<40320;i++){ c=cc(); c.cp=unrankP(i,8); for(m=0;m<18;m++) t.cpm[i*18+m]=getCP(mul(c,MC[m])); }
  for(i=0;i<40320;i++){ c=cc(); var p=unrankP(i,8); for(var k=0;k<8;k++) c.ep[k]=p[k]; P2.forEach(function(m){ t.epm[i*18+m]=getEP8(mul(c,MC[m])); }); }
  for(i=0;i<24;i++){ c=cc(); var q=unrankP(i,4); for(var k2=0;k2<4;k2++) c.ep[8+k2]=8+q[k2]; P2.forEach(function(m){ t.spm[i*18+m]=getSP(mul(c,MC[m])); }); }
  t.SG=getSlice(cc());
  function bfs(n1,n2,mv1,mv2,start,moves){ var N=n1*n2, d=new Int8Array(N).fill(-1), q=new Int32Array(N), h=0, tl=0; d[start]=0; q[tl++]=start;
    while(h<tl){ var s=q[h++], a=Math.floor(s/n2), b=s%n2, nd=d[s]+1; for(var k=0;k<moves.length;k++){ var mm=moves[k], ns=mv1[a*18+mm]*n2+mv2[b*18+mm]; if(d[ns]<0){ d[ns]=nd; q[tl++]=ns; } } } return d; }
  var ALL=[]; for(m=0;m<18;m++) ALL.push(m);
  t.ptw=bfs(2187,495,t.tw,t.sl,t.SG,ALL); t.pfl=bfs(2048,495,t.fl,t.sl,t.SG,ALL);
  t.pcp=bfs(40320,24,t.cpm,t.spm,0,P2); t.pep=bfs(40320,24,t.epm,t.spm,0,P2);
  T=t; return t; }
/* facelets -> cubies, with the checks a real cube must pass */
function toCubie(s){ s=String(s||''); if(s.length!==54) return {error:'Some stickers are missing.'}; var cnt={}; for(var i=0;i<54;i++) cnt[s[i]]=(cnt[s[i]]||0)+1;
  for(var f=0;f<6;f++){ if(cnt[FN[f]]!==9) return {error:'Each colour must appear exactly 9 times. Check the stickers you scanned.'}; }
  var c=cc(), u;
  for(i=0;i<8;i++){ for(var o=0;o<3;o++){ if(s[CF[i][o]]==='U'||s[CF[i][o]]==='D') break; } if(o>2) return {error:'A corner has no white or yellow sticker. Check the scan.'};
    var c1=s[CF[i][(o+1)%3]], c2=s[CF[i][(o+2)%3]], found=-1; for(var j=0;j<8;j++){ if(c1===CC[j][1]&&c2===CC[j][2]){ found=j; break; } } if(found<0) return {error:'One corner has colours that do not belong together. Check the scan.'}; c.cp[i]=found; c.co[i]=o%3; }
  for(i=0;i<12;i++){ var a=s[EF[i][0]], b=s[EF[i][1]], fe=-1; for(j=0;j<12;j++){ if(a===EC[j][0]&&b===EC[j][1]){ fe=j; c.eo[i]=0; break; } if(a===EC[j][1]&&b===EC[j][0]){ fe=j; c.eo[i]=1; break; } } if(fe<0) return {error:'One edge has colours that do not belong together. Check the scan.'}; c.ep[i]=fe; }
  var seenC={}, seenE={}; for(i=0;i<8;i++){ if(seenC[c.cp[i]]) return {error:'The same corner shows up twice. Check the scan.'}; seenC[c.cp[i]]=1; } for(i=0;i<12;i++){ if(seenE[c.ep[i]]) return {error:'The same edge shows up twice. Check the scan.'}; seenE[c.ep[i]]=1; }
  var tw=0, fl=0; for(i=0;i<8;i++) tw+=c.co[i]; for(i=0;i<12;i++) fl+=c.eo[i];
  if(tw%3) return {error:'One corner is twisted. A real cube cannot be in this state, so a sticker is probably wrong.'};
  if(fl%2) return {error:'One edge is flipped. A real cube cannot be in this state, so a sticker is probably wrong.'};
  if(par(c.cp)!==par(c.ep)) return {error:'Two pieces are swapped. A real cube cannot be in this state, so a sticker is probably wrong.'};
  return {c:c}; }
function par(p){ var s=0; for(var i=0;i<p.length;i++) for(var j=i+1;j<p.length;j++) if(p[j]<p[i]) s++; return s%2; }
function solve(facelets,opt){ opt=opt||{}; var r=toCubie(facelets); if(r.error) return r; var c=r.c, t=build(), maxL=opt.max||24, t0=Date.now(), limit=opt.ms||6000;
  var tw0=getTwist(c), fl0=getFlip(c), sl0=getSlice(c), sol=null, path=[];
  function ok2(a,b){ return !(a>=0&&(Math.floor(a/3)===Math.floor(b/3)||(Math.floor(a/3)%3===Math.floor(b/3)%3&&Math.floor(a/3)>Math.floor(b/3)))); }
  function ph2(cp,ep,sp,d,last,p2){ if(d===0) return cp===0&&ep===0&&sp===0; var h=Math.max(t.pcp[cp*24+sp],t.pep[ep*24+sp]); if(h>d) return false;
    for(var k=0;k<10;k++){ var m=P2[k]; if(!ok2(last,m)) continue; p2.push(m); if(ph2(t.cpm[cp*18+m],t.epm[ep*18+m],t.spm[sp*18+m],d-1,m,p2)) return true; p2.pop(); } return false; }
  function enter2(){ var x=c; for(var i=0;i<path.length;i++) x=mul(x,MC[path[i]]); var cp=getCP(x), ep=getEP8(x), sp=getSP(x), last=path.length?path[path.length-1]:-1;
    for(var d2=0;d2<=maxL-path.length;d2++){ var p2=[]; if(ph2(cp,ep,sp,d2,last,p2)){ sol=path.concat(p2); return true; } } return false; }
  function ph1(tw,fl,sl,d,last){ if(Date.now()-t0>limit) throw 'time'; if(d===0){ if(tw===0&&fl===0&&sl===t.SG){ if(last>=0&&P2.indexOf(last)>=0&&path.length>0) return false; return enter2(); } return false; }
    var h=Math.max(t.ptw[tw*495+sl],t.pfl[fl*495+sl]); if(h>d) return false;
    for(var m=0;m<18;m++){ if(!ok2(last,m)) continue; path.push(m); if(ph1(t.tw[tw*18+m],t.fl[fl*18+m],t.sl[sl*18+m],d-1,m)) return true; path.pop(); } return false; }
  try{ for(var d1=0;d1<=12&&!sol;d1++){ path=[]; ph1(tw0,fl0,sl0,d1,-1); }
    while(!sol&&maxL<30){ maxL+=2; for(d1=0;d1<=12&&!sol;d1++){ path=[]; ph1(tw0,fl0,sl0,d1,-1); } } }
  catch(e){ if(e!=='time') throw e; }
  if(!sol) return {error:'The solver took too long. Try again.'};
  return {moves:sol.map(function(m){ return MN[m]; }), alg:sol.map(function(m){ return MN[m]; }).join(' ')}; }
var API={solve:solve,build:build,check:toCubie,ready:function(){ return !!T; }};
if(typeof module!=='undefined'&&module.exports) module.exports=API; else root.CWSolver=API;
})(this);
