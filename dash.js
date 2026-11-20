/* /play: Cube Dash. A one-tap platformer: jump spikes, pits and blocks to reach the end of the level.
   Part 1 is the pure game core (also run headless in tests). Part 2 is the canvas, input and menu. */
(function(root){
'use strict';
var T=40, W=800, H=400, GY=320, PX=170, S=40, G=2900, JV=780, PADV=1050, DT=1/240;
var PAL={W:'#f4f4f2',Y:'#ffd500',R:'#e53935',O:'#ff7a1a',G:'#2fbf71',B:'#2d6df6'};

/* ---------- levels: built from a fixed seed so everyone gets the same level ---------- */
function rng(seed){ var s=seed>>>0; return function(){ s=(s+0x6D2B79F5)>>>0; var t=s; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; }; }
/* each chunk returns its width in tiles and pushes its objects at column x */
var CH={
  sp1:function(x,L){ L.sp.push([x,0]); return 1; },
  sp2:function(x,L){ L.sp.push([x,0],[x+1,0]); return 2; },
  sp3:function(x,L){ L.sp.push([x,0],[x+1,0],[x+2,0]); return 3; },
  dbl:function(x,L){ var k=Math.ceil(L.lv.speed*.54/T)+1; L.sp.push([x,0],[x+k,0]); return k+1; },
  trp:function(x,L){ var k=Math.ceil(L.lv.speed*.54/T)+1; L.sp.push([x,0],[x+k,0],[x+2*k,0]); return 2*k+1; },
  pit2:function(x,L){ L.pit.push([x,x+2]); return 2; },
  pit3:function(x,L){ L.pit.push([x,x+3]); return 3; },
  step:function(x,L){ L.bl.push([x,0],[x+1,0]); L.sp.push([x+3,0]); return 4; },
  stair:function(x,L){ L.bl.push([x,0],[x+1,0],[x+1,1],[x+2,0],[x+2,1]); return 3; },
  tower:function(x,L){ L.bl.push([x,0],[x+1,0],[x+2,0]); L.sp.push([x+1,1]); return 3; },
  pad:function(x,L){ L.pd.push([x,0]); L.sp.push([x+3,0],[x+4,0],[x+5,0]); return 6; },
  padp:function(x,L){ L.pd.push([x,0]); L.pit.push([x+3,x+6]); return 6; },
  hop:function(x,L){ L.bl.push([x,0]); L.bl.push([x+3,0]); L.sp.push([x+1,0],[x+2,0]); return 4; },
  wall:function(x,L){ L.bl.push([x,0],[x,1]); L.sp.push([x+3,0]); return 4; },
  flip:function(x,L){ L.po.push([x,0,1],[x+14,4,0]); L.sd.push([x+7,6]); return 16; },
  flip2:function(x,L){ L.po.push([x,0,1],[x+18,4,0]); L.sd.push([x+6,6],[x+11,6]); return 20; },
  orb:function(x,L){ L.or.push([x+3,1]); L.pit.push([x+2,x+6]); return 8; },
  fake:function(x,L){ L.fb.push([x,0],[x+1,0]); L.sp.push([x+3,0]); return 4; },
  ghost:function(x,L){ L.ib.push([x+3,0]); L.sp.push([x+1,0]); return 5; },
  sawf:function(x,L){ L.sw.push([x+2,0,(x%7)*.9]); return 5; },
  sawr:function(x,L){ L.rs.push([x,(x%5)*1.1]); return 5; },
  pulse:function(x,L){ L.bs.push([x,(x%4)*.5],[x+1,(x%4)*.5],[x+2,(x%4)*.5]); return 4; },
  shsp:function(x,L){ L.pu.push([x,0,0]); L.sp.push([x+3,0],[x+4,0],[x+5,0]); return 7; },
  moonpit:function(x,L){ L.pu.push([x,0,1]); L.pit.push([x+3,x+10]); return 11; },
  laser:function(x,L){ L.lz.push([x,x+3]); return 4; },
  laser2:function(x,L){ L.lz.push([x,x+6]); return 7; },
  laserpit:function(x,L){ L.pit.push([x,x+3]); L.lz.push([x+7,x+10]); return 11; },
  sawpit:function(x,L){ L.pit.push([x,x+3]); L.sw.push([x+1,0,(x%5)*1.3]); return 4; },
  spikewave:function(x,L){ var k=Math.ceil(L.lv.speed*.54/T)+1; L.sp.push([x,0],[x+k,0],[x+2*k,0],[x+3*k,0]); return 3*k+1; },
  sawgate:function(x,L){ L.sw.push([x+1,0,(x%7)*.9]); L.sp.push([x+4,0]); L.rs.push([x+8,(x%5)*1.1]); return 11; },
  djwall:function(x,L){ L.pu.push([x,0,2]); L.bl.push([x+4,0],[x+4,1],[x+4,2]); L.sp.push([x+7,0]); return 9; },
  /* ---- game modes: each chunk opens with a portal and ends with a portal back to the cube ---- */
  shipA:function(x,L){ L.gx.push([x,0,11]); var X=x+5, n=40; for(var k=0;k<n;k++){ var lo=k<4||k>=n-3?0:Math.round(2+1.5*Math.sin((k-4)/5.5)); if(k>=n-8&&k<n-3) lo=Math.min(lo,Math.round((n-3-k)/2)); for(var r=0;r<lo;r++) L.bl.push([X+k,r]); for(var r2=lo+4;r2<=6;r2++) L.bl.push([X+k,r2]); } L.gx.push([X+n,0,10]); return n+9; },
  shipB:function(x,L){ L.gx.push([x,0,11]); var X=x+5, n=44; for(var k=0;k<n;k++){ var lo=k<4||k>=n-3?0:Math.round(2+1.2*Math.sin((k-4)/4)); if(k>=n-8&&k<n-3) lo=Math.min(lo,Math.round((n-3-k)/2)); for(var r=0;r<lo;r++) L.bl.push([X+k,r]); for(var r2=lo+4;r2<=6;r2++) L.bl.push([X+k,r2]); } L.gx.push([X+n,0,10]); return n+9; },
  ballA:function(x,L){ L.gx.push([x,0,12]); var X=x+6; for(var k=0;k<5;k++){ if(k%2===0) L.sp.push([X+k*9,0]); else L.sd.push([X+k*9,6]); } var e=X+5*9; L.gx.push([e,0,10],[e,4,10]); return 6+5*9+4; },
  ufoA:function(x,L){ L.gx.push([x,0,13]); var X=x+5; for(var k=0;k<6;k++){ var c=X+k*5; if(k%2===0){ L.bl.push([c,0],[c,1]); } else { L.bl.push([c,4],[c,5],[c,6]); } } L.gx.push([X+6*5,0,10]); return 6*5+9; },
  waveA:function(x,L){ L.gx.push([x,0,14]); var lo=[0,0,0,1,1,2,2,3,3,2,2,1,1,0,0,1,1,2,2,3,3,4,4,3,3,2,2,1,1,0,0,0], X=x+3; for(var k=0;k<lo.length;k++){ for(var r=0;r<lo[k];r++) L.bl.push([X+k,r]); for(var r2=lo[k]+3;r2<=6;r2++) L.bl.push([X+k,r2]); } L.gx.push([X+lo.length,0,10]); return 3+lo.length+3; },
  robotA:function(x,L){ L.gx.push([x,0,15]); var X=x+5; for(var k=0;k<4;k++){ var c=X+k*8; L.bl.push([c,0],[c,1],[c,2]); L.sp.push([c+4,0]); } L.gx.push([X+4*8,0,10]); return 4*8+8; },
  spiderA:function(x,L){ L.gx.push([x,0,16]); var X=x+5; for(var k=0;k<5;k++){ var c=X+k*7; if(k%2===0){ L.sp.push([c,0],[c+1,0]); } else { L.sd.push([c,6],[c+1,6]); } } var e=X+5*7; L.gx.push([e,0,10],[e,4,10]); return 5*7+9; },
  /* ---- orbs and pads ---- */
  pinko:function(x,L){ L.pit.push([x+1,x+8]); L.gx.push([x+4,1,20]); return 9; },
  redo:function(x,L){ L.pit.push([x+1,x+10]); L.gx.push([x+4,1,21]); return 11; },
  blueo:function(x,L){ L.gx.push([x+3,2,22]); L.sp.push([x+6,0],[x+7,0],[x+8,0],[x+9,0]); L.gx.push([x+13,6,22]); L.sd.push([x+16,6],[x+17,6]); return 19; },
  greeno:function(x,L){ L.gx.push([x+3,2,23]); L.sp.push([x+6,0],[x+7,0],[x+8,0],[x+9,0]); L.gx.push([x+13,6,22]); L.sd.push([x+16,6],[x+17,6]); return 19; },
  blacko:function(x,L){ L.pd.push([x,0]); L.sd.push([x+4,6],[x+5,6]); L.gx.push([x+3,5,24]); return 9; },
  padk:function(x,L){ L.gx.push([x,0,30]); L.sp.push([x+3,0],[x+4,0],[x+5,0]); return 7; },
  padr:function(x,L){ L.gx.push([x,0,31]); L.pit.push([x+3,x+10]); L.gx.push([x+6,3,20]); return 11; },
  padb:function(x,L){ L.gx.push([x,0,32]); L.sp.push([x+5,0],[x+6,0],[x+7,0],[x+8,0]); L.gx.push([x+13,6,22]); return 15; }
};
var LEVELS=[
  {id:1,name:'Level 1',tag:'Easy',speed:330,seed:11,n:34,gap:[6,9],pool:['sp1','sp1','sp2','pit2','step','dbl','hop'],c1:'#1d2f6f',c2:'#3b82f6',reward:40,bpm:112,notes:[0,3,5,3,0,3,7,5]},
  {id:2,name:'Level 2',tag:'Normal',speed:375,seed:27,n:44,gap:[5,8],pool:['sp1','sp2','sp3','pit2','pit3','step','dbl','stair','tower','hop','pad','wall'],c1:'#3b1a5c',c2:'#c04bd8',reward:60,bpm:124,notes:[0,0,7,5,3,3,5,7]},
  {id:3,name:'Level 3',tag:'Hard',speed:420,seed:93,n:56,gap:[4,7],pool:['sp2','sp3','dbl','trp','pit3','stair','tower','padp','pad','hop','wall','step'],c1:'#5a1414',c2:'#ff6a2a',reward:100,bpm:136,notes:[0,3,0,5,0,7,5,3]},
  {id:4,name:'Level 4',tag:'Gravity',speed:400,seed:4,n:36,gap:[5,8],pool:['sp2','sp3','dbl','pit3','stair','hop','flip','flip','flip2','orb','fake','ghost'],c1:'#0b4a3c',c2:'#7a5cff',reward:150,bpm:128,notes:[0,5,7,5,0,3,7,3]},
  {id:5,name:'Level 5',tag:'Speed',speed:470,seed:5,n:60,gap:[4,7],pool:['sp2','sp3','dbl','pit3','stair','hop','flip','flip2','orb','pad','padp','tower'],c1:'#0a2a5c',c2:'#00d2ff',reward:200,bpm:140,notes:[0,7,5,3,0,7,5,8]},
  {id:6,name:'Level 6',tag:'Chaos',speed:500,seed:5,n:76,gap:[4,6],pool:['sp2','sp3','dbl','trp','pit3','stair','tower','hop','flip','flip2','orb','fake','ghost','padp','wall'],c1:'#2a0a3c',c2:'#ff2d95',reward:300,bpm:148,notes:[0,3,5,7,8,7,5,3]},
  {id:7,upd:1,name:'Level 7',tag:'Power-ups',speed:400,seed:7,n:44,gap:[4,7],pool:['sawf','sawr','pulse','shsp','moonpit','djwall','sp2','dbl','pit3','stair','pad','hop'],c1:'#0a3a2a',c2:'#ffd500',reward:350,bpm:132,notes:[0,4,7,4,0,5,9,5]},
  {id:8,upd:1,name:'Level 8',tag:'Saws',speed:410,seed:1,n:50,gap:[4,7],pool:['sawf','sawr','sawf','sawr','pulse','sp2','dbl','pit3','stair','hop','pad'],c1:'#2a1a3f',c2:'#ff6a3d',reward:400,bpm:134,notes:[0,3,7,3,0,5,8,5]},
  {id:9,upd:1,name:'Level 9',tag:'Shields',speed:430,seed:1,n:56,gap:[4,7],pool:['shsp','shsp','djwall','sawr','pulse','flip','orb','sp3','dbl','trp','padp','wall'],c1:'#0a2f52',c2:'#2d9bff',reward:450,bpm:138,notes:[0,5,7,5,0,4,7,4]},
  {id:10,upd:1,name:'Level 10',tag:'Low gravity',speed:450,seed:1,n:60,gap:[4,7],pool:['moonpit','moonpit','djwall','sawf','pulse','pit3','stair','tower','flip2','orb','hop','pad'],c1:'#2b0f4a',c2:'#b36bff',reward:500,bpm:142,notes:[0,7,9,7,0,5,9,5]},
  {id:11,upd:1,name:'Level 11',tag:'Gauntlet',speed:480,seed:1,n:70,gap:[4,6],pool:['sawf','sawr','pulse','shsp','moonpit','djwall','sp3','dbl','trp','pit3','flip','flip2','orb','padp','wall','tower'],c1:'#3a0a14',c2:'#ff2d55',reward:600,bpm:146,notes:[0,3,5,7,8,7,5,3]},
  {id:12,upd:1,name:'Level 12',tag:'Finale',speed:520,seed:1,n:84,gap:[4,6],pool:['sawf','sawr','pulse','shsp','moonpit','djwall','sp3','dbl','trp','pit3','stair','flip','flip2','orb','fake','ghost','padp','wall','tower'],c1:'#101010',c2:'#ffd500',reward:800,bpm:152,notes:[0,3,5,7,8,7,5,3]},
  {id:13,upd:2,name:'Level 13',tag:'Lasers',speed:430,seed:1,n:46,gap:[4,7],pool:['laser','laser','sp2','sp3','pit3','hop','laserpit','stair','dbl','tower'],c1:'#2a0510',c2:'#ff2b2b',reward:500,bpm:140,notes:[0,3,0,5,0,7,5,3]},
  {id:14,upd:2,name:'Level 14',tag:'Sawpits',speed:450,seed:5,n:50,gap:[4,7],pool:['sawpit','sawgate','sawf','sawr','pit3','sp3','pad','hop','laser'],c1:'#0a1830',c2:'#18c5ff',reward:550,bpm:144,notes:[0,5,7,5,0,7,8,7]},
  {id:15,upd:2,name:'Level 15',tag:'Waves',speed:470,seed:1,n:54,gap:[4,6],pool:['spikewave','dbl','trp','laser','laserpit','pit3','stair','tower','flip','sawgate'],c1:'#1a0a30',c2:'#b36bff',reward:600,bpm:148,notes:[0,3,5,3,8,7,5,3]},
  {id:16,upd:2,name:'Level 16',tag:'Mixed',speed:480,seed:1,n:62,gap:[4,6],pool:['laser','laser2','laserpit','sawpit','sawgate','spikewave','shsp','moonpit','djwall','flip','orb','padp','wall','fake','ghost'],c1:'#0b2a22',c2:'#2fe08c',reward:700,bpm:150,notes:[0,3,5,7,8,7,5,3]},
  {id:17,upd:2,name:'Level 17',tag:'Overdrive',speed:520,seed:1,n:72,gap:[4,6],pool:['laser','laser2','laserpit','sawpit','sawgate','spikewave','pulse','shsp','moonpit','djwall','flip','flip2','orb','padp','wall','trp','pit3'],c1:'#2a1a05',c2:'#ffb21e',reward:850,bpm:156,notes:[0,3,5,7,8,7,5,3]},
  {id:18,upd:2,name:'Level 18',tag:'Final Run',speed:550,seed:1,n:90,gap:[4,6],pool:['laser','laser2','laserpit','sawpit','sawgate','spikewave','pulse','sawf','sawr','shsp','moonpit','djwall','flip','flip2','orb','padp','wall','trp','pit3','stair','tower','fake','ghost'],c1:'#050514',c2:'#ff2bd6',reward:1100,bpm:160,notes:[0,3,5,7,8,7,5,3]},
  {id:19,upd:2,name:'Level 19',tag:'Ships',speed:390,seed:3,n:26,gap:[5,7],pool:['shipA','shipB','shipA','sp2','sp3','pit3','hop','pad','dbl'],c1:'#07123a',c2:'#18c5ff',reward:700,bpm:132,notes:[0,4,7,4,0,5,9,5]},
  {id:20,upd:2,name:'Level 20',tag:'Ball and UFO',speed:400,seed:8,n:28,gap:[5,7],pool:['ballA','ufoA','ballA','ufoA','sp2','pit3','stair','hop','orb'],c1:'#2a0a3a',c2:'#ff6ad5',reward:800,bpm:136,notes:[0,3,7,3,0,5,8,5]},
  {id:21,upd:2,name:'Level 21',tag:'Waves',speed:410,seed:4,n:26,gap:[5,7],pool:['waveA','waveA','sp2','sp3','pit3','dbl','stair','pad','laser'],c1:'#0a2a1a',c2:'#35e08a',reward:850,bpm:140,notes:[0,3,5,7,5,3,0,7]},
  {id:22,upd:2,name:'Level 22',tag:'Robot and Spider',speed:400,seed:2,n:28,gap:[5,7],pool:['robotA','spiderA','robotA','spiderA','sp2','dbl','hop','pit3'],c1:'#2a1405',c2:'#ffa31f',reward:900,bpm:138,notes:[0,5,7,5,0,4,7,4]},
  {id:23,upd:2,name:'Level 23',tag:'Orbs and pads',speed:420,seed:6,n:30,gap:[5,7],pool:['pinko','redo','blueo','greeno','blacko','padk','padr','padb','sp3','pit3','hop'],c1:'#1a0a2a',c2:'#b36bff',reward:950,bpm:144,notes:[0,3,5,3,8,7,5,3]},
  {id:24,upd:2,name:'Level 24',tag:'Everything',speed:430,seed:9,n:48,gap:[5,7],pool:['shipA','ballA','ufoA','waveA','robotA','spiderA','pinko','redo','blueo','greeno','blacko','padk','padr','padb','sp3','dbl','pit3','laser','sawf','flip','orb','stair'],c1:'#120a1a',c2:'#ff2bd6',reward:1500,bpm:150,notes:[0,3,5,7,8,7,5,3]},
  {id:25,upd:2,name:'Level 25',tag:'Raya - Slowed',speed:392,seed:28,n:39,gap:[5,8],pool:['shipA','waveA','ballA','ufoA','robotA','spiderA','padk','padb','pinko','blueo','greeno','sp2','sp3','dbl','pit3','stair','flip','orb'],c1:'#1a0508',c2:'#ff2a3d',reward:1800,bpm:98,bo:.087,song:'music/raya-slowed.mp3',notes:[0,3,5,7,8,7,5,3]},
  {id:26,upd:3,name:'Level 26',tag:'Gravity Gauntlet',speed:410,seed:1,n:34,gap:[5,7],pool:['flip','flip2','ballA','waveA','shipA','pad','padp','padk','sp2','sp3','pit3','hop','orb'],c1:'#0b1a3a',c2:'#34e6d9',reward:1600,bpm:128,notes:[0,2,4,7,9,7,4,2]},
  {id:27,upd:3,name:'Level 27',tag:'Neon Rush',speed:470,seed:1,n:46,gap:[4,6],pool:['sp2','sp3','dbl','trp','pit3','stair','tower','hop','pad','laser','laserpit','spikewave','orb'],c1:'#14062e',c2:'#ff2bd6',reward:1700,bpm:140,notes:[0,3,5,3,0,3,7,5]},
  {id:28,upd:3,name:'Level 28',tag:'Sky Run',speed:420,seed:3,n:32,gap:[5,7],pool:['shipA','shipB','ufoA','ufoA','shipA','pad','padb','sp2','pit3','hop','blueo','greeno'],c1:'#082a44',c2:'#7be0ff',reward:1700,bpm:120,notes:[0,4,7,11,12,11,7,4]},
  {id:29,upd:3,name:'Level 29',tag:'Mechs',speed:430,seed:1,n:34,gap:[5,7],pool:['robotA','spiderA','robotA','spiderA','pinko','redo','padr','sp3','dbl','sawf','pit3','stair','orb'],c1:'#2a1204',c2:'#ffb02e',reward:1800,bpm:132,notes:[0,3,7,3,0,5,7,10]},
  {id:30,upd:3,name:'Level 30',tag:'Grand Finale',speed:450,seed:3,n:52,gap:[5,7],pool:['shipA','ballA','ufoA','waveA','robotA','spiderA','pinko','redo','blueo','greeno','blacko','padk','padr','padb','sp3','dbl','pit3','laser','sawf','flip','stair','hop','orb'],c1:'#160a2e',c2:'#ffd34a',reward:2500,bpm:146,notes:[0,3,5,7,8,7,5,3]},
  {id:31,upd:4,name:'Level 31',tag:'Crystal Caverns',speed:430,seed:1,n:36,gap:[5,7],pool:['waveA','ballA','waveA','pad','padp','sp2','sp3','pit3','hop','orb','pinko'],c1:'#0a1430',c2:'#7be0ff',reward:2000,bpm:124,notes:[0,4,7,4,0,5,9,5]},
  {id:32,upd:4,name:'Level 32',tag:'Sunset Strip',speed:450,seed:3,n:30,gap:[5,7],pool:['ufoA','shipA','ufoA','pad','padb','sp2','laser','pit3','hop','redo','orb'],c1:'#2a0a24',c2:'#ff8a5c',reward:2100,bpm:130,notes:[0,3,7,10,7,3,0,5]},
  {id:33,upd:4,name:'Level 33',tag:'Deep Dive',speed:440,seed:1,n:30,gap:[5,7],pool:['shipA','shipB','waveA','ballA','pad','padb','sp2','sp3','pit3','blueo','greeno','orb'],c1:'#021a2e',c2:'#2fe0c4',reward:2200,bpm:118,notes:[0,2,5,9,5,2,0,7]},
  {id:34,upd:4,name:'Level 34',tag:'Factory Floor',speed:470,seed:1,n:44,gap:[4,6],pool:['robotA','spiderA','robotA','sawf','laser','laserpit','dbl','sp3','stair','pit3','pad','padr','orb'],c1:'#1a1a22',c2:'#ffcf3a',reward:2300,bpm:138,notes:[0,0,7,0,5,0,3,0]},
  {id:35,upd:4,name:'Level 35',tag:'Update 4 Finale',speed:480,seed:5,n:60,gap:[4,6],pool:['shipA','ballA','ufoA','waveA','robotA','spiderA','flip','pinko','redo','blueo','greeno','blacko','padk','padr','padb','sp3','dbl','pit3','laser','sawf','stair','hop','orb'],c1:'#14062e',c2:'#ff9a3d',reward:3500,bpm:150,notes:[0,3,7,12,10,7,3,0]},
  {id:36,upd:6,name:'Level 36',tag:'Lasers and Ships',speed:440,seed:1,n:40,gap:[5,7],pool:['shipA','shipB','laser','laser2','laserpit','sp2','dbl','pit3','pad','orb','hop'],c1:'#061a33',c2:'#35e6ff',reward:4000,bpm:136,notes:[0,5,7,12,7,5,3,0]},
  {id:37,upd:6,name:'Level 37',tag:'Double Gravity',speed:450,seed:1,n:42,gap:[5,7],pool:['flip','flip2','flip','blueo','greeno','padb','sp3','dbl','trp','pit3','stair','orb'],c1:'#1a0633',c2:'#b073ff',reward:4400,bpm:138,notes:[0,3,7,10,7,3,5,8]},
  {id:38,upd:6,name:'Level 38',tag:'Saw Tunnel',speed:460,seed:2,n:46,gap:[4,6],pool:['sawf','sawr','sawpit','sawgate','pulse','sp2','dbl','pit3','stair','hop','pad','tower'],c1:'#33100a',c2:'#ff7a1a',reward:4800,bpm:140,notes:[0,0,5,7,0,0,8,7]},
  {id:39,upd:6,name:'Level 39',tag:'Wave Rider',speed:450,seed:1,n:36,gap:[5,7],pool:['waveA','waveA','ufoA','shipA','sp2','dbl','pit3','pinko','padk','orb','hop'],c1:'#062a2a',c2:'#3dff8a',reward:5200,bpm:142,notes:[0,7,5,7,0,7,10,7]},
  {id:40,upd:6,name:'Level 40',tag:'Orb Maze',speed:460,seed:1,n:44,gap:[5,7],pool:['pinko','redo','blueo','greeno','blacko','padk','padr','padb','sp3','dbl','trp','pit3','stair','tower'],c1:'#2a0620',c2:'#ff6bd0',reward:5600,bpm:144,notes:[0,4,7,11,7,4,2,5]},
  {id:41,upd:6,name:'Level 41',tag:'Mech Sprint',speed:490,seed:1,n:48,gap:[4,6],pool:['robotA','spiderA','robotA','ballA','sawf','laser','sp3','dbl','pit3','stair','padr','orb','hop'],c1:'#1c1c24',c2:'#ffd21a',reward:6200,bpm:148,notes:[0,3,0,7,0,10,7,3]},
  {id:42,upd:6,name:'Level 42',tag:'Update 6 Finale',speed:500,seed:1,n:68,gap:[4,6],pool:['shipA','ballA','ufoA','waveA','robotA','spiderA','flip','flip2','pinko','redo','blueo','greeno','padk','padr','sp3','dbl','trp','pit3','laser','laser2','sawf','sawr','stair','hop','orb'],c1:'#0a0620',c2:'#ff2a4a',reward:8000,bpm:152,notes:[0,3,7,12,15,12,7,3]},
  {id:43,upd:6.5,name:'Level 43',tag:'Laser Grid',speed:470,seed:1,n:44,gap:[5,7],pool:['laser','laser2','laserpit','pulse','sp2','dbl','pit3','pad','orb','hop','stair'],c1:'#05142b',c2:'#3aa0ff',reward:8600,bpm:140,notes:[0,7,12,7,5,7,3,0]},
  {id:44,upd:6.5,name:'Level 44',tag:'Saw Garden',speed:470,seed:1,n:46,gap:[5,7],pool:['sawf','sawr','sawpit','sawgate','greeno','padb','sp2','dbl','pit3','stair','tower','orb'],c1:'#0b2412',c2:'#9dff3a',reward:9200,bpm:142,notes:[0,3,5,7,10,7,5,3]},
  {id:45,upd:6.5,name:'Level 45',tag:'Flip Flight',speed:480,seed:1,n:40,gap:[5,7],pool:['flip','flip2','shipA','shipB','ufoA','blueo','sp2','dbl','pit3','pad','orb','hop'],c1:'#240a2e',c2:'#ff6bd0',reward:9800,bpm:144,notes:[0,5,9,12,9,5,7,2]},
  {id:46,upd:6.5,name:'Level 46',tag:'Robot Rush',speed:500,seed:1,n:48,gap:[4,6],pool:['robotA','robotA','spiderA','ballA','sp3','dbl','trp','pit3','stair','padr','padk','orb','hop'],c1:'#241405',c2:'#ffb02e',reward:10500,bpm:148,notes:[0,0,7,0,10,0,7,5]},
  {id:47,upd:6.5,name:'Level 47',tag:'Wave Storm',speed:480,seed:1,n:42,gap:[5,7],pool:['waveA','waveA','shipA','ufoA','laser','sawf','sp2','dbl','pit3','pinko','padk','orb'],c1:'#04222b',c2:'#35e6ff',reward:11200,bpm:150,notes:[0,7,3,7,5,7,10,12]},
  {id:48,upd:6.5,name:'Level 48',tag:'Update 6.5 Finale',speed:510,seed:1,n:72,gap:[4,6],pool:['shipA','shipB','ballA','ufoA','waveA','robotA','spiderA','flip','flip2','pinko','redo','blueo','greeno','blacko','padk','padr','padb','sp3','dbl','trp','pit3','laser','laser2','laserpit','sawf','sawr','sawgate','pulse','stair','tower','hop','orb'],c1:'#14061f',c2:'#ffd21a',reward:14000,bpm:154,notes:[0,4,7,12,16,12,7,4]},
  {id:49,upd:7,name:'Level 49',tag:'Boss · Saw thrower',boss:{n:'Saw thrower',c:'#ff7a1a'},speed:470,seed:4,n:46,gap:[5,7],pool:['sawr','sawf','sawpit','sawgate','sp2','dbl','pit3','stair','orb','pad','hop'],c1:'#2a1405',c2:'#ff7a1a',reward:9000,bpm:144,notes:[0,3,7,3,10,7,3,0]},
  {id:50,upd:7,name:'Level 50',tag:'Boss · Laser eye',boss:{n:'Laser eye',c:'#ff2b4a'},speed:480,seed:1,n:48,gap:[5,7],pool:['laser','laser2','laserpit','pulse','sp2','dbl','pit3','padp','orb','tower','hop'],c1:'#24050c',c2:'#ff2b4a',reward:10000,bpm:148,notes:[0,7,12,7,3,7,10,7]},
  {id:51,upd:7,name:'Level 51',tag:'Boss · Final boss',boss:{n:'Final boss',c:'#b36bff'},speed:500,seed:1,n:60,gap:[4,6],pool:['sawr','sawf','sawgate','laser','laser2','pulse','sp3','dbl','trp','pit3','stair','tower','orb','pad','padp','hop'],c1:'#14061f',c2:'#b36bff',reward:12000,bpm:152,notes:[0,3,7,12,10,7,3,5]}
];
LEVELS.forEach(function(lv){ lv.coins=1; });
function build(lv){ var r=rng(lv.seed), L={gx:[],sp:[],bl:[],pd:[],pit:[],sd:[],or:[],fb:[],ib:[],po:[],tp:[],sw:[],rs:[],bs:[],pu:[],lz:[],end:0,lv:lv}, x=lv.lead||12, last='', nc=0;
  for(var i=0,N=lv.seq?lv.seq.length:lv.n;i<N;i++){ var k; if(lv.seq&&CH[lv.seq[i]]) k=lv.seq[i]; else { do{ k=lv.pool[Math.floor(r()*lv.pool.length)]; }while(k===last&&r()<.7); } last=k;
    var w=CH[k](x,L); var g=lv.gap[0]+Math.floor(r()*(lv.gap[1]-lv.gap[0]+1)); if(lv.coins&&nc<3&&i>=Math.floor(N*(nc+1)/4)){ L.gx.push([x+w+Math.floor(g/2),1+(nc%2),40]); nc++; } if(k==='stair'||k==='tower'||k==='wall'||k==='hop'||k==='step'||k==='flip'||k==='flip2'||k==='orb') g=Math.max(g,5); x+=w+g; }
  L.end=(x+8)*T;
  return finish(L); }
function finish(L){
  L.sw=L.sw||[]; L.rs=L.rs||[]; L.bs=L.bs||[]; L.pu=L.pu||[]; L.pus=L.pu.map(function(p){ return [p[0]*T+8,GY-(p[1]+1)*T+8,p[0]*T+32,GY-p[1]*T-8,p[2]]; }); L.lz=L.lz||[]; L.lzr=L.lz.map(function(z){ return [z[0]*T,GY-95,z[1]*T,GY-78]; }); L.sd=L.sd||[]; L.or=L.or||[]; L.fb=L.fb||[]; L.ib=L.ib||[]; L.po=L.po||[]; L.tp=L.tp||[];
  L.gx=L.gx||[]; L.mo=L.gx.filter(function(g){ return g[2]>=10&&g[2]<=16; }); L.o2=L.gx.filter(function(g){ return g[2]>=20&&g[2]<=24; }); L.p2=L.gx.filter(function(g){ return g[2]>=30&&g[2]<=32; }); L.cn=L.gx.filter(function(g){ return g[2]===40; }).slice(0,3);
  /* solid rects (x1,y1,x2,y2,kind): kind 1 = ground, 2 = ceiling, 0 = block */
  var sol=[], gx=-10, pits=L.pit.slice().sort(function(a,b){ return a[0]-b[0]; });
  pits.forEach(function(p){ if(p[0]>gx) sol.push([gx*T,GY,p[0]*T,GY+400,1]); gx=Math.max(gx,p[1]); }); sol.push([gx*T,GY,L.end+2000,GY+400,1]);
  L.bl.concat(L.ib).forEach(function(b){ sol.push([b[0]*T,GY-(b[1]+1)*T,b[0]*T+T,GY-b[1]*T,0]); });
  L.ceil=!!(L.sd.length||L.mo.length||L.po.some(function(p){ return p[2]===1; })); if(L.ceil) sol.push([-10*T,0,L.end+2000,40,2]);
  L.sol=sol;
  L.spk=L.sp.map(function(s){ return [s[0]*T+13,GY-(s[1]+1)*T+14,s[0]*T+27,GY-s[1]*T]; }).concat(L.sd.map(function(s){ return [s[0]*T+13,GY-(s[1]+1)*T,s[0]*T+27,GY-(s[1]+1)*T+26]; }));
  L.pds=L.pd.map(function(p){ return [p[0]*T+2,GY-(p[1]+1)*T+30,p[0]*T+38,GY-p[1]*T]; });
  L.orbs=L.or.map(function(p){ return [p[0]*T+6,GY-(p[1]+1)*T+6,p[0]*T+34,GY-p[1]*T-6]; });
  L.mos=L.mo.map(function(p){ return [p[0]*T+12,GY-(p[1]+3)*T,p[0]*T+28,GY-p[1]*T,p[2]-10]; });
  L.orb2=L.o2.map(function(p){ return [p[0]*T+6,GY-(p[1]+1)*T+6,p[0]*T+34,GY-p[1]*T-6,p[2]-20]; });
  L.pad2=L.p2.map(function(p){ return [p[0]*T+2,GY-(p[1]+1)*T+30,p[0]*T+38,GY-p[1]*T,p[2]-30]; });
  L.coins=L.cn.map(function(p){ return [p[0]*T+6,GY-(p[1]+1)*T+6,p[0]*T+34,GY-p[1]*T-6]; });
  L.pos=L.po.map(function(p){ return [p[0]*T+12,GY-(p[1]+3)*T,p[0]*T+28,GY-p[1]*T,p[2]]; });
  L.tps=L.tp.map(function(p){ return [p[0]*T+12,GY-(p[1]+3)*T,p[0]*T+28,GY-p[1]*T,(p[2]-p[0])*T,(p[1]-p[3])*T]; });
  return L; }
/* ---------- physics: one fixed step; returns 'dead' | 'win' | '' ---------- */
function newState(L,cp){ return cp?{wx:cp.wx,y:cp.y,vy:cp.vy,g:false,co:0,rot:0,padd:false,t:cp.t||0,L:L,gd:cp.gd||1,sm:cp.sm||1,ob:0,pi:-1,ti:-1,sh:0,inv:0,lg:0,dj:0,ph:0,pk:0,md:cp.md|0,rt:0,mi:-1,ob2:0,pd2:false,cn:0,bf:0}:{wx:0,y:GY-S,vy:0,g:false,co:0,rot:0,padd:false,t:0,L:L,gd:1,sm:1,ob:0,pi:-1,ti:-1,sh:0,inv:0,lg:0,dj:0,ph:0,pk:0,md:0,rt:0,mi:-1,ob2:0,pd2:false,cn:0,bf:0}; }
function lethal(s){ if(s.inv>0) return false; if(s.sh){ s.sh=0; s.inv=.7; s.sfx='p'; return false; } return true; }
function sawHit(cx,cy,x1,x2,y1,y2){ var qx=Math.max(x1,Math.min(cx,x2)), qy=Math.max(y1,Math.min(cy,y2)); return (qx-cx)*(qx-cx)+(qy-cy)*(qy-cy)<17*17; }
function step(s,hold,dt){ var L=s.L, sp=L.lv.speed*s.sm, gd=s.gd;
  s.t+=dt; s.wx+=sp*dt; s.co=Math.max(0,s.co-dt); s.lg=Math.max(0,s.lg-dt); s.inv=Math.max(0,s.inv-dt); var edge=hold&&!s.ph; s.ph=hold?1:0;
  if(edge) s.bf=.1; else s.bf=Math.max(0,(s.bf||0)-dt); var md=s.md|0, gnd=s.g||s.co>0, bfe=edge||s.bf>0, i, a;
  if(md===0){
    if(hold&&gnd){ s.vy=-JV*gd; s.g=false; s.co=0; s.sfx='j'; }
    else if(edge&&s.dj&&!s.g){ s.vy=-JV*gd; s.dj=0; s.sfx='j'; }
    s.vy+=G*gd*(s.lg>0?.6:1)*dt; s.y+=s.vy*dt; }
  else if(md===1){ s.vy+=(hold?-2100:1800)*gd*dt; if(s.vy>360) s.vy=360; if(s.vy<-360) s.vy=-360; s.y+=s.vy*dt; }
  else if(md===2){ if(bfe&&gnd){ gd=s.gd=-gd; s.vy=gd*160; s.g=false; s.co=0; s.bf=0; s.sfx='j'; } s.vy+=G*gd*dt; s.y+=s.vy*dt; }
  else if(md===3){ if(edge){ s.vy=-JV*.62*gd; s.g=false; s.sfx='j'; } s.vy+=G*.85*gd*dt; if(s.vy>620) s.vy=620; if(s.vy<-620) s.vy=-620; s.y+=s.vy*dt; }
  else if(md===4){ s.vy=(hold?-1:1)*gd*sp; s.y+=s.vy*dt; }
  else if(md===5){ if(hold&&gnd){ s.vy=-JV*.7*gd; s.g=false; s.co=0; s.rt=.2; s.sfx='j'; } else if(hold&&s.rt>0){ s.vy=-JV*.78*gd; s.rt-=dt; } else if(!hold) s.rt=0; s.vy+=G*gd*dt; s.y+=s.vy*dt; }
  else { if(bfe&&gnd){ var bp=s.wx+PX, bst=null, bq; for(var bi=0;bi<L.sol.length;bi++){ bq=L.sol[bi]; if(bp+4>=bq[2]||bp+S-4<=bq[0]) continue; if(gd>0){ if(bq[3]<=s.y+1&&(bst===null||bq[3]>bst)) bst=bq[3]; } else if(bq[1]>=s.y+S-1&&(bst===null||bq[1]<bst)) bst=bq[1]; }
      if(bst!==null){ s.y=gd>0?bst:bst-S; gd=s.gd=-gd; s.vy=0; s.g=false; s.co=0; s.bf=0; s.sfx='j'; s.spk=1; } }
    s.vy+=G*gd*dt; s.y+=s.vy*dt; }
  var ins=md===4?9:0, px=s.wx+PX, x1=px+2+ins, x2=px+S-2-ins, y1=(gd>0?s.y+2:s.y)+ins, yb=(gd>0?s.y+S:s.y+S-2)-ins, grounded=false;
  for(i=0;i<L.sol.length;i++){ a=L.sol[i]; if(a[2]<x1-5||a[0]>x2+5) continue;
    if(x1<a[2]&&x2>a[0]&&y1<a[3]&&yb>a[1]){
      if(md===4){ if(a[4]===1){ s.y=a[1]-S+ins; s.vy=0; yb=a[1]; y1=s.y+ins; } else if(a[4]===2){ s.y=a[3]-ins; s.vy=0; y1=a[3]; yb=s.y+S-ins; } else return 'dead'; }
      else if(gd>0){ var d=yb-a[1]; if(s.vy>=0&&d<=14){ s.y=a[1]-S; s.vy=0; yb=a[1]; grounded=true; } else if(a[4]===2){ s.y=a[3]; s.vy=0; y1=s.y+2; yb=s.y+S; } else if((md===1||md===3)&&s.vy<=0&&a[3]-y1<=14){ s.y=a[3]-2; s.vy=0; y1=a[3]; yb=s.y+S; } else return 'dead'; }
      else { var d2=a[3]-y1; if(s.vy<=0&&d2<=14){ s.y=a[3]; s.vy=0; y1=a[3]; grounded=true; } else if(a[4]===1){ s.y=a[1]-S; s.vy=0; y1=s.y; yb=s.y+S-2; } else if((md===1||md===3)&&s.vy>=0&&yb-a[1]<=14){ s.y=a[1]-S+2; s.vy=0; y1=s.y; yb=a[1]; } else return 'dead'; } } }
  if(s.y>GY+120||s.y<-160) return 'dead';
  var sx1=px+6, sx2=px+S-6, sy1=s.y+6, sy2=s.y+S-2; if(gd<0){ sy1=s.y+2; sy2=s.y+S-6; } if(md===4){ sx1=px+12; sx2=px+S-12; sy1=s.y+12; sy2=s.y+S-12; }
  for(i=0;i<L.spk.length;i++){ a=L.spk[i]; if(a[2]<sx1-5||a[0]>sx2+5) continue; if(sx1<a[2]&&sx2>a[0]&&sy1<a[3]&&sy2>a[1]&&lethal(s)) return 'dead'; }
  for(i=0;i<L.lzr.length;i++){ a=L.lzr[i]; if(a[2]<sx1-5||a[0]>sx2+5) continue; if(gd>0&&sx1<a[2]&&sx2>a[0]&&sy1<a[3]&&sy2>a[1]&&lethal(s)) return 'dead'; }
  var bsl=L.bs;
  for(i=0;i<bsl.length;i++){ if(((s.t+bsl[i][1])%2)>=1.1) continue; var bx=bsl[i][0]*T; if(sx1<bx+27&&sx2>bx+13&&sy1<GY&&sy2>GY-26&&lethal(s)) return 'dead'; }
  var swl=L.sw;
  for(i=0;i<swl.length;i++){ var cx=swl[i][0]*T+T/2, cy=GY-T*(2.1+Math.sin(s.t*2.6+swl[i][2])); if(sawHit(cx,cy,sx1,sx2,sy1,sy2)&&lethal(s)) return 'dead'; }
  var rsl=L.rs;
  for(i=0;i<rsl.length;i++){ var rx=(rsl[i][0]+1.5+1.5*Math.sin(s.t*1.8+rsl[i][1]))*T; if(sawHit(rx,GY-17,sx1,sx2,sy1,sy2)&&lethal(s)) return 'dead'; }
  var pul=L.pus;
  for(i=0;i<pul.length;i++){ if(s.pk&(1<<i)) continue; a=pul[i]; if(a[2]<x1-5||a[0]>x2+5) continue; if(x1<a[2]&&x2>a[0]&&s.y+S>a[1]&&s.y<a[3]){ s.pk|=(1<<i); if(a[4]===0) s.sh=1; else if(a[4]===1) s.lg=5; else s.dj=1; s.sfx='p'; } }
  var onpad=false, pyt=s.y, pyb=s.y+S;
  for(i=0;i<L.pds.length;i++){ a=L.pds[i]; if(a[2]<x1-5||a[0]>x2+5) continue; if(x1<a[2]&&x2>a[0]&&pyb>a[1]&&pyt<a[3]){ onpad=true; if(!s.padd&&md!==4){ s.vy=-PADV*gd; s.padd=true; grounded=false; s.sfx='p'; } } }
  if(!onpad) s.padd=false;
  var onorb=false, ol=L.orbs||[];
  for(i=0;i<ol.length;i++){ a=ol[i]; if(a[2]<x1-5||a[0]>x2+5) continue; if(x1<a[2]&&x2>a[0]&&pyb>a[1]&&pyt<a[3]){ onorb=true; if(hold&&!s.ob&&md!==1&&md!==4){ s.vy=-JV*gd; s.ob=1; grounded=false; s.sfx='p'; } } }
  if(!onorb) s.ob=0;
  var o2=L.orb2||[], on2=false;
  for(i=0;i<o2.length;i++){ a=o2[i]; if(a[2]<x1-5||a[0]>x2+5) continue; if(x1<a[2]&&x2>a[0]&&pyb>a[1]&&pyt<a[3]){ on2=true; if(hold&&!s.ob2&&md!==1&&md!==4){ var ot=a[4], ng=-gd; s.ob2=1; grounded=false; s.sfx='p';
        if(ot===0) s.vy=-JV*.7*gd; else if(ot===1) s.vy=-JV*1.32*gd; else if(ot===2){ s.gd=ng; gd=ng; s.vy=0; s.g=false; s.co=0; } else if(ot===3){ s.gd=ng; gd=ng; s.vy=ng*JV*.55; s.g=false; s.co=0; } else s.vy=JV*1.5*gd; } } }
  if(!on2) s.ob2=0;
  var p2=L.pad2||[], onp2=false;
  for(i=0;i<p2.length;i++){ a=p2[i]; if(a[2]<x1-5||a[0]>x2+5) continue; if(x1<a[2]&&x2>a[0]&&pyb>a[1]&&pyt<a[3]){ onp2=true; if(!s.pd2&&md!==4){ s.pd2=true; grounded=false; s.sfx='p'; var pt=a[4]; if(pt===0) s.vy=-PADV*.62*gd; else if(pt===1) s.vy=-PADV*1.28*gd; else { var ng2=-gd; s.gd=ng2; gd=ng2; s.vy=ng2*PADV*.8; s.g=false; s.co=0; } } } }
  if(!onp2) s.pd2=false;
  var cl=L.coins||[];
  for(i=0;i<cl.length;i++){ if(s.cn&(1<<i)) continue; a=cl[i]; if(a[2]<x1-5||a[0]>x2+5) continue; if(x1<a[2]&&x2>a[0]&&pyb>a[1]&&pyt<a[3]){ s.cn|=(1<<i); s.sfx='c'; } }
  var ml=L.mos||[], mh=-1;
  for(i=0;i<ml.length;i++){ a=ml[i]; if(a[2]<x1-5||a[0]>x2+5) continue; if(x1<a[2]&&x2>a[0]&&pyb>a[1]&&pyt<a[3]){ mh=i; break; } }
  if(mh!==s.mi){ s.mi=mh; if(mh>=0&&ml[mh][4]!==md){ var nm=ml[mh][4]; s.md=nm; md=nm; s.gd=1; gd=1; s.g=false; s.co=0; s.rt=0; s.vy=(nm===1||nm===3)?s.vy*.3:0; s.sfx='p'; s.pmd=nm+1; } }
  var pl=L.pos||[], hit=-1;
  for(i=0;i<pl.length;i++){ a=pl[i]; if(a[2]<x1-5||a[0]>x2+5) continue; if(x1<a[2]&&x2>a[0]&&pyb>a[1]&&pyt<a[3]){ hit=i; break; } }
  if(hit!==s.pi){ s.pi=hit; if(hit>=0){ var ty=pl[hit][4]; if(ty===0||ty===1){ var ng=ty===1?-1:1; if(ng!==s.gd){ s.gd=ng; s.g=false; s.co=0; grounded=false; s.sfx='p'; } } else s.sm=ty===2?.8:ty===3?1.25:1; } }
  var tl=L.tps||[], th=-1;
  for(i=0;i<tl.length;i++){ a=tl[i]; if(a[2]<x1-5||a[0]>x2+5) continue; if(x1<a[2]&&x2>a[0]&&pyb>a[1]&&pyt<a[3]){ th=i; break; } }
  if(th!==s.ti){ s.ti=th; if(th>=0){ s.wx+=tl[th][4]; s.y+=tl[th][5]; s.tele=1; s.sfx='t'; px=s.wx+PX; } }
  if(grounded){ if(!s.g&&md===0){ s.rot=Math.round(s.rot/(Math.PI/2))*(Math.PI/2); } s.g=true; s.co=.05; } else { s.g=false; if(md===0) s.rot+=3.1*dt*s.gd; }
  if(md===1) s.rot=Math.atan2(s.vy,sp)*.7; else if(md===4) s.rot=Math.atan2(s.vy,sp); else if(md===2) s.rot+=sp/(S/2)*dt*s.gd*(grounded?1:.4); else if(md!==0) s.rot=0;
  if(px>L.end) return 'win';
  return ''; }
/* ---------- custom levels: compact share code ---------- */
var SPEEDS=[330,375,420], THEMES=[['#1d2f6f','#3b82f6'],['#3b1a5c','#c04bd8'],['#5a1414','#ff6a2a'],['#0f4a3a','#2fbf71']];
function mkCustom(e){ var th=THEMES[e.th]||THEMES[0]; var lv={id:'c',custom:1,name:'Custom level',tag:['Slow','Normal','Fast'][e.sp]||'Normal',speed:SPEEDS[e.sp]||375,c1:th[0],c2:th[1],bpm:120,notes:[0,3,5,3,0,3,7,5]};
  var cp=function(k){ return (e[k]||[]).map(function(a){ return a.slice(); }); }; var L={gx:cp('gx'),sp:cp('sp_'),bl:cp('bl'),pd:cp('pd'),pit:cp('pit'),sd:cp('sd'),or:cp('or'),fb:cp('fb'),ib:cp('ib'),po:cp('po'),tp:cp('tp'),sw:cp('ws').map(function(a){ return [a[0],0,(a[0]%7)*.9]; }),rs:cp('rr').map(function(a){ return [a[0],(a[0]%5)*1.1]; }),bs:cp('pl').map(function(a){ return [a[0],(a[0]%4)*.5]; }),pu:cp('up'),lz:cp('lz'),end:(e.len+8)*T,lv:lv}; return finish(L); }
function toCode(e){ var parts=[e.sp,e.th,e.len]; var j=function(k,a){ return k+(a||[]).map(function(o){ return o.join('.'); }).join(','); };
  var raw=parts.join('~')+'~'+[j('s',e.sp_),j('b',e.bl),j('p',e.pd),j('t',e.pit.map(function(p){ return [p[0]]; }))].join('~');
  var xt=[['a','ws'],['c','rr'],['g','pl'],['u','up'],['z','lz'],['x','gx']].filter(function(k){ return (e[k[1]]||[]).length; }).map(function(k){ return j(k[0],e[k[1]]); }).join('|');
  if((e.sd||[]).length+(e.or||[]).length+(e.fb||[]).length+(e.ib||[]).length+(e.po||[]).length+(e.tp||[]).length+xt.length) raw+='~'+[j('o',e.or),j('f',e.fb),j('i',e.ib),j('d',e.sd),j('q',e.po)].concat((e.tp||[]).length||xt.length?[j('w',e.tp)]:[]).concat(xt?[xt]:[]).join('~');
  var b=(typeof btoa!=='undefined'?btoa(raw):Buffer.from(raw).toString('base64')); return b.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function fromCode(c){ try{ c=String(c||'').trim().replace(/^.*#dash\//,'').replace(/[^A-Za-z0-9_-]/g,''); if(c.length<8||c.length>24000) return null; c=c.replace(/-/g,'+').replace(/_/g,'/'); while(c.length%4) c+='=';
    var raw=typeof atob!=='undefined'?atob(c):Buffer.from(c,'base64').toString(); var p=raw.split('~'); if(p.length!==7&&p.length!==12&&p.length!==13&&p.length!==14) return null;
    var sp=+p[0], th=+p[1], len=+p[2]; if(!(sp>=0&&sp<=2&&th>=0&&th<THEMES.length&&len>=40&&len<=400)) return null;
    var e={gx:[],sp:sp,th:th,len:len,sp_:[],bl:[],pd:[],pit:[],sd:[],or:[],fb:[],ib:[],po:[],tp:[],ws:[],rr:[],pl:[],up:[],lz:[]}, n=0;
    var rd=function(str,k,fn){ if(str[0]!==k) return false; str=str.slice(1); if(!str) return true; var ok=true; str.split(',').forEach(function(t){ var q=t.split('.').map(Number); if(++n>900||q.some(function(v){ return !isFinite(v)||v!==Math.floor(v); })) ok=false; else if(!fn(q)) ok=false; }); return ok; };
    var okc=function(q,ymax){ return q[0]>=10&&q[0]<len&&q[1]>=0&&q[1]<=ymax; };
    if(!rd(p[3],'s',function(q){ if(q.length!==2||!okc(q,6)) return false; e.sp_.push(q); return true; })) return null;
    if(!rd(p[4],'b',function(q){ if(q.length!==2||!okc(q,6)) return false; e.bl.push(q); return true; })) return null;
    if(!rd(p[5],'p',function(q){ if(q.length!==2||!okc(q,6)) return false; e.pd.push(q); return true; })) return null;
    if(!rd(p[6],'t',function(q){ if(q.length!==1||q[0]<12||q[0]>=len) return false; e.pit.push([q[0],q[0]+1]); return true; })) return null;
    if(p.length>=12){
      var ex=[['o','or',9],['f','fb',10],['i','ib',11],['d','sd',12]];
      for(var xi=0;xi<4;xi++){ var kk=ex[xi]; if(!rd(p[kk[2]-2],kk[0],function(q){ if(q.length!==2||!okc(q,6)) return false; e[kk[1]].push(q); return true; })) return null; }
      if(!rd(p[11],'q',function(q){ if(q.length!==3||!okc(q,4)||!(q[2]>=0&&q[2]<=4)) return false; e.po.push(q); return true; })) return null;
      if(p.length>=13&&!rd(p[12],'w',function(q){ if(q.length!==4||!okc(q,4)||!(q[2]>q[0]+1&&q[2]<len&&q[3]>=0&&q[3]<=4)) return false; e.tp.push(q); return true; })) return null; }
    if(p.length===14){ var xs=p[13].split('|'); if(xs.length>9) return null; for(var xi2=0;xi2<xs.length;xi2++){ var xs0=xs[xi2], k0=xs0[0];
        if(k0==='a'||k0==='c'||k0==='g'){ var nm=k0==='a'?'ws':k0==='c'?'rr':'pl'; if(!rd(xs0,k0,function(q){ if(q.length!==2||q[0]<10||q[0]>=len||q[1]!==0) return false; e[nm].push(q); return true; })) return null; }
        else if(k0==='u'){ if(!rd(xs0,'u',function(q){ if(q.length!==3||!okc(q,6)||!(q[2]>=0&&q[2]<=2)) return false; e.up.push(q); return true; })) return null; }
        else if(k0==='x'){ if(!rd(xs0,'x',function(q){ var kd=q[2]; if(q.length!==3||!((kd>=10&&kd<=16)||(kd>=20&&kd<=24)||(kd>=30&&kd<=32)||kd===40)||!okc(q,kd<20?4:6)) return false; if(kd===40&&e.gx.filter(function(g){ return g[2]===40; }).length>=3) return false; e.gx.push(q); return true; })) return null; }
        else if(k0==='z'){ if(!rd(xs0,'z',function(q){ if(q.length!==2||q[0]<10||q[1]<=q[0]||q[1]-q[0]>20||q[1]>=len) return false; e.lz.push(q); return true; })) return null; }
        else return null; } }
    return e; }catch(x){ return null; } }
/* beam-search check that a level can be finished (the same physics as the game). cb(true|false|progress) in time slices */
function verify(L,cb,prog){ var cur=[newState(L)], f=0, SUB=8;
  function slice(){ var t0=Date.now(); while(cur.length&&Date.now()-t0<25){ var nxt=new Map(), won=false;
      for(var i=0;i<cur.length;i++){ for(var hh=0;hh<2;hh++){ var c=Object.assign({},cur[i]), r=''; for(var q=0;q<SUB&&!r;q++){ c.sfx=''; r=step(c,!!hh,DT); }
          if(r==='win'){ won=true; } else if(!r){ var k=Math.round(c.y/3)+','+Math.round(c.vy/50)+','+(c.g?1:0)+(c.padd?1:0)+(c.co>0?1:0)+','+c.gd+(Math.round(c.sm*100))+c.ob+(c.pi>=0?1:0)+(c.sh?1:0)+(c.dj?1:0)+(c.lg>0?Math.ceil(c.lg*2):0)+(c.inv>0?1:0)+'m'+(c.md|0)+(c.rt>0?1:0)+c.ob2+(c.pd2?1:0)+'p'+c.pk+(L.tps&&L.tps.length?','+Math.round(c.wx/6):''); if(!nxt.has(k)) nxt.set(k,c); } } }
      f++; if(won){ cb(true); return; } cur=Array.from(nxt.values()); if(cur.length>1500) cur=cur.slice(0,1500); if(f>9000) break; }
    if(!cur.length){ cb(false); return; } if(f>9000){ cb(false); return; } if(prog) prog(Math.round(cur[0].wx/(L.end-PX)*100)); setTimeout(slice,0); }
  slice(); }
var core={finish:finish,mkCustom:mkCustom,toCode:toCode,fromCode:fromCode,verify:verify,SPEEDS:SPEEDS,THEMES:THEMES,T:T,W:W,H:H,GY:GY,PX:PX,S:S,PAL:PAL,LEVELS:LEVELS,build:build,newState:newState,step:step,DT:DT,CH:CH};
root.CWDash=core;
if(typeof module!=='undefined') module.exports=core;
})(typeof window!=='undefined'?window:globalThis);

/* ================= part 2: canvas, input, menu ================= */
(function(){
'use strict';
if(typeof CW==='undefined'||!window.PL) return;
var $=CW.$, esc=CW.esc, PL=window.PL, D=window.CWDash, T=D.T, W=D.W, H=D.H, GY=D.GY, PX=D.PX, S=D.S, PAL=D.PAL;
var Z={lv:null,L:null,s:null,mode:'ready',prac:false,cp:null,att:0,hold:false,raf:0,last:0,acc:0,cv:null,cx:null,sc:1,parts:[],trail:[],dead:0,best:0,mute:false,au:null,nextNote:0,nbeat:0,root:null,keys:{}};
function sv(){ var o=CW.lsJ('cw_dash',null)||{}; o.best=o.best||{}; o.done=o.done||{}; return o; }
function pct(s){ var L=Z.L; return Math.max(0,Math.min(100,Math.floor((s.wx)/(L.end-PX)*100))); }

/* ---------- saved builds (kept on this device) ---------- */
function myAll(){ var a=CW.lsJ('cw_dash_my',[]); return Array.isArray(a)?a:[]; }
function myPut(list){ CW.setJ('cw_dash_my',list.slice(0,60)); }
function draftGet(){ var d=CW.lsJ('cw_dash_draft',null); return d&&d.c?d:null; }
function nPieces(E){ return E.sp_.length+E.bl.length+E.pd.length+E.pit.length+E.sd.length+E.or.length+E.fb.length+E.ib.length+E.po.length+E.tp.length+(E.ws||[]).length+(E.rr||[]).length+(E.pl||[]).length+(E.up||[]).length+(E.lz||[]).length+(E.gx||[]).length; }
function draftPut(E){ try{ var sv0=E.sid&&myAll().filter(function(x){ return x.id===E.sid; })[0]; if(!nPieces(E)||(sv0&&sv0.c===E.key())){ localStorage.removeItem('cw_dash_draft'); return; } CW.setJ('cw_dash_draft',{c:E.key(),n:E.name||'',sid:E.sid||''}); }catch(e){} }
function fmtAgo(t){ var m=Math.floor((Date.now()-t)/60000); return m<1?'just now':m<60?m+' min ago':m<1440?Math.floor(m/60)+' h ago':Math.floor(m/1440)+' d ago'; }

/* ---------- sound ---------- */
function ac(){ if(Z.au) return Z.au; try{ Z.au=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} return Z.au; }
function tone(f,t0,d,type,v,f2){ var a=Z.au; if(!a||Z.mute) return; var o=a.createOscillator(), g=a.createGain(); o.type=type||'square'; o.frequency.setValueAtTime(f,t0); if(f2) o.frequency.exponentialRampToValueAtTime(f2,t0+d); g.gain.setValueAtTime(v||.05,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+d); o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0+d+.02); }
function sfx(k){ var a=Z.au; if(!a||Z.mute) return; var t=a.currentTime; if(k==='j') tone(520,t,.09,'square',.04,780); else if(k==='p') tone(400,t,.18,'square',.05,1200); else if(k==='t'){ tone(300,t,.16,'sine',.06,1500); } else if(k==='c'){ tone(988,t,.07,'square',.05); tone(1319,t+.07,.14,'square',.05); } else if(k==='d'){ tone(220,t,.3,'sawtooth',.07,50); } else if(k==='w'){ [523,659,784,1046].forEach(function(f,i){ tone(f,t+i*.1,.2,'square',.05); }); } }
/* ---- music: a real little track for every level, scheduled from the run time so it always lines up with what you are doing ---- */
var MUS={prog:[0,-4,-2,-5],keys:[0,2,3,5,7,8,10,1,4]};
function mbus(){ var a=Z.au; if(!a) return null; if(Z.mb) return Z.mb; var g=a.createGain(); g.gain.value=.9; var c=a.createDynamicsCompressor(); c.threshold.value=-18; c.ratio.value=4; g.connect(c); c.connect(a.destination); var n=a.createBuffer(1,a.sampleRate*.5,a.sampleRate), d=n.getChannelData(0); for(var i=0;i<d.length;i++) d[i]=Math.random()*2-1; Z.mb=g; Z.nb=n; return g; }
function mTone(t,f,d,type,v,o){ var a=Z.au, bus=mbus(); if(!bus) return; o=o||{}; var os=a.createOscillator(), g=a.createGain(), fl=a.createBiquadFilter(); os.type=type; os.frequency.setValueAtTime(f,t); if(o.f2) os.frequency.exponentialRampToValueAtTime(o.f2,t+d); if(o.det) os.detune.value=o.det; fl.type='lowpass'; fl.frequency.setValueAtTime(o.lp||3000,t); if(o.lp2) fl.frequency.exponentialRampToValueAtTime(o.lp2,t+d); var at=o.at||.004; g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(v,t+at); g.gain.exponentialRampToValueAtTime(.0001,t+d); os.connect(fl); fl.connect(g); g.connect(bus); os.start(t); os.stop(t+d+.03); }
function mNoise(t,d,v,hp,lp){ var a=Z.au, bus=mbus(); if(!bus) return; var sr=a.createBufferSource(); sr.buffer=Z.nb; var f=a.createBiquadFilter(); f.type=lp?'bandpass':'highpass'; f.frequency.value=hp; if(lp) f.Q.value=.8; var g=a.createGain(); g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.0001,t+d); sr.connect(f); f.connect(g); g.connect(bus); sr.start(t,Math.random()*.2); sr.stop(t+d+.02); }
/* ---- a different composed song for every level ---- */
var SCL={major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],dorian:[0,2,3,5,7,9,10],phryg:[0,1,3,5,7,8,10],hmin:[0,2,3,5,7,8,11]};
var RHY=[[1,0,1,0,1,1,0,1],[1,0,0,1,0,1,0,0],[1,1,0,1,0,0,1,0],[1,0,1,1,0,1,0,0],[1,0,0,0,1,0,1,0],[1,1,1,0,1,0,0,1]];
var DRM=[{k:[1,0,1,0,1,0,1,0],s:[0,0,1,0,0,0,1,0],h:[0,1,0,1,0,1,0,1]},{k:[1,0,0,1,0,1,0,0],s:[0,0,1,0,0,0,1,0],h:[1,1,1,1,1,1,1,1]},{k:[1,0,0,0,0,0,1,0],s:[0,0,0,0,1,0,0,0],h:[1,0,1,0,1,0,1,0]},{k:[1,0,0,0,0,1,0,0],s:[0,0,1,0,0,0,1,0],h:[0,1,1,1,0,1,1,1]}];
var BAS=[[0,0,12,0,0,12,0,7],[-1,0,-1,0,-1,0,-1,7],[0,-1,0,7,0,-1,12,7],[0,-1,-1,-1,0,-1,-1,-1]];
/* hand-picked personality of each official level: scale, key (semitones above A), chord degrees, drums, bass, lead sound, melody seed, key lift */
var SONGS={
 1:{sc:'major',key:3,pr:[0,4,5,3],dr:2,ba:3,ld:'triangle',sd:1},
 2:{sc:'major',key:7,pr:[0,5,3,4],dr:0,ba:1,ld:'square',sd:2},
 3:{sc:'minor',key:0,pr:[0,5,2,6],dr:1,ba:0,ld:'sawtooth',sd:3},
 4:{sc:'dorian',key:2,pr:[0,3,0,6],dr:2,ba:2,ld:'triangle',sd:4},
 5:{sc:'minor',key:5,pr:[0,6,5,6],dr:3,ba:0,ld:'square',sd:5},
 6:{sc:'phryg',key:1,pr:[0,1,0,6],dr:3,ba:0,ld:'sawtooth',sd:6},
 7:{sc:'major',key:5,pr:[0,3,4,3],dr:0,ba:1,ld:'square',sd:7},
 8:{sc:'hmin',key:8,pr:[0,5,3,4],dr:1,ba:0,ld:'sawtooth',sd:8},
 9:{sc:'dorian',key:0,pr:[0,6,3,6],dr:0,ba:2,ld:'triangle',sd:9},
 10:{sc:'major',key:10,pr:[0,2,5,4],dr:2,ba:3,ld:'triangle',sd:10},
 11:{sc:'minor',key:3,pr:[0,2,6,5],dr:1,ba:1,ld:'sawtooth',sd:11},
 12:{sc:'minor',key:7,pr:[0,5,2,6],dr:0,ba:0,ld:'sawtooth',sd:12,lift:2},
 13:{sc:'phryg',key:4,pr:[0,1,0,3],dr:3,ba:1,ld:'square',sd:13},
 14:{sc:'hmin',key:1,pr:[0,3,4,0],dr:1,ba:0,ld:'sawtooth',sd:14},
 15:{sc:'dorian',key:9,pr:[0,3,6,3],dr:2,ba:2,ld:'triangle',sd:15},
 16:{sc:'minor',key:6,pr:[0,6,3,4],dr:0,ba:2,ld:'square',sd:16},
 17:{sc:'minor',key:2,pr:[0,0,5,6],dr:3,ba:0,ld:'sawtooth',sd:17},
 18:{sc:'hmin',key:0,pr:[0,5,3,4],dr:0,ba:0,ld:'sawtooth',sd:18,lift:2},
 19:{sc:'major',key:8,pr:[0,5,3,4],dr:2,ba:2,ld:'triangle',sd:19},
 20:{sc:'dorian',key:5,pr:[0,3,0,4],dr:1,ba:1,ld:'square',sd:20},
 21:{sc:'phryg',key:10,pr:[0,1,5,1],dr:2,ba:3,ld:'triangle',sd:21},
 22:{sc:'hmin',key:4,pr:[0,3,4,0],dr:3,ba:1,ld:'sawtooth',sd:22},
 23:{sc:'major',key:7,pr:[0,4,5,3],dr:0,ba:1,ld:'square',sd:23},
 24:{sc:'minor',key:0,pr:[0,5,2,6],dr:0,ba:0,ld:'sawtooth',sd:24,lift:2}
};
function mRng(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function mSong(lv){
  Z.songs=Z.songs||{}; var id=String(lv.id); if(Z.songs[id]) return Z.songs[id];
  var h=0; for(var i=0;i<id.length;i++) h=(h*31+id.charCodeAt(i))|0; var R=mRng(h^0x5bd1e995), P=SONGS[lv.id];
  if(!P){ var scs=['major','minor','dorian','phryg','hmin'], PR=[[0,5,2,6],[0,5,3,4],[0,6,5,6],[0,3,6,3],[0,4,5,3],[0,2,6,5]]; P={sc:scs[Math.floor(R()*5)],key:Math.floor(R()*12),pr:PR[Math.floor(R()*PR.length)],dr:Math.floor(R()*4),ba:Math.floor(R()*4),ld:['square','sawtooth','triangle'][Math.floor(R()*3)],sd:h}; }
  var sd=mRng(P.sd*7919+13), mel=[];
  for(var ph=0;ph<2;ph++){ var rows=[]; var r0=RHY[Math.floor(sd()*RHY.length)], r1=RHY[Math.floor(sd()*RHY.length)];
    var mk=function(mask,start,end){ var out=[],pv=start; for(var st=0;st<8;st++){ if(!mask[st]){ out.push(-1); continue; } var v; if(st===0) v=start; else if(st>=6&&end!=null&&mask[st]) v=end; else { var step=sd()<.62?(sd()<.5?1:-1):(sd()<.5?2:-2); v=pv+step; } v=Math.max(0,Math.min(6,v)); out.push(v); pv=v; } if(end!=null){ var li=7; while(li>=0&&out[li]<0) li--; if(li>=0) out[li]=end; } return out; };
    var a=mk(r0,[0,2,4][Math.floor(sd()*3)],null), b=mk(r1,[0,2,4][Math.floor(sd()*3)],[0,2,4][Math.floor(sd()*3)]), d=mk(r1,[0,2,4][Math.floor(sd()*3)],0);
    rows=[a,b,a,d]; mel.push(rows); }
  return Z.songs[id]={P:P,mel:mel,sc:SCL[P.sc],dr:DRM[P.dr],bs:BAS[P.ba]};
}
function mStep(t,n,lv,s,L){
  var S=mSong(lv),P=S.P,bar=Math.floor(n/8),st=n%8,md=s.md|0,pr=Math.max(0,Math.min(1,s.wx/Math.max(1,L.end))),beat=60/lv.bpm,sd=beat/2;
  var lift=(P.lift&&(bar%32)>=16)?P.lift:0, root=55*Math.pow(2,(P.key+lift)/12), ci=bar%4, r=P.pr[ci], sc=S.sc;
  var d2s=function(d){ var o=Math.floor(d/7); return sc[((d%7)+7)%7]+12*o; };
  var hz=function(semi,oct){ return root*Math.pow(2,semi/12)*(oct||1); };
  var cr=d2s(r), dr=S.dr;
  if(st===0){ var o4=1.6; mTone(t,hz(cr,4),sd*7.6,'triangle',.05,{at:.2,lp:1400}); mTone(t,hz(d2s(r+2),4),sd*7.6,'triangle',.035,{at:.2,lp:1400}); mTone(t,hz(d2s(r+4),4),sd*7.6,'triangle',.03,{at:.22,lp:1500}); }
  var drums=bar>=1||pr>.02, rest=(bar%16)===15&&st>=4;
  if(drums&&!rest&&dr.k[st]){ mTone(t,150,.16,'sine',.55,{f2:42}); mNoise(t,.012,.12,2500); }
  if(drums&&dr.s[st]&&!(rest&&st<6)){ mNoise(t,.14,.13,1700,1); mTone(t,190,.08,'triangle',.07); }
  if(rest&&st>=4){ mNoise(t,.06,.05+.012*st,2600,1); }
  if(bar>=2||pr>.06){ if(dr.h[st]) mNoise(t,st%2?.05:.025,st%2?.065:.04,7500); }
  if(bar>=1){ var bo=S.bs[st]; if(bo>-1){ var bn=cr+bo; mTone(t,hz(bn,2),sd*(P.ba===3?3.4:.9),'sawtooth',st===0?.2:.15,{lp:520,lp2:180}); mTone(t,hz(bn,1),sd*(P.ba===3?3.4:.9),'sine',.16); } }
  var ph=(Math.floor(bar/4)%4===2)?1:0, dg=S.mel[ph][ci][st];
  if(bar>=2&&dg>=0){ var ab=7+r+dg; if(ab>14) ab-=7; var tm=md===1?'sine':P.ld, vv=tm==='triangle'?.075:tm==='sine'?.07:.045;
    mTone(t,hz(d2s(ab),2),sd*1.4,tm,vv,{lp:tm==='sawtooth'?1800:2400,lp2:900});
    if(md===4&&bar>=3) mTone(t,hz(d2s(ab),4),sd*1,'sine',.02,{lp:3000}); }
  if(bar>=4&&(st===0||st===3||st===6)){ var ar=[0,2,4][(st/3)|0]; mTone(t+sd*.5,hz(d2s(r+ar),8),sd*.35,'triangle',.02,{lp:3500,lp2:1200}); }
  if(bar>=3&&st===7&&bar%2===1) mNoise(t,.35,.04,3000,1);
  if(md===5&&st%2===1) mTone(t,hz(cr+7,2),sd*.35,'sawtooth',.04,{lp:900});
  if(md===6&&st===4) mTone(t,hz(cr+12,2),.25,'sawtooth',.035,{f2:hz(cr,2),lp:2000});
}
/* ---- funk style: one step = one 16th note (swung), tight kick/snare with ghost notes, slap-style bass riffs, chicken-scratch guitar, e-piano stabs, horn hits ---- */
var FKP=[[0,0,0,3],[0,0,3,0],[0,3,0,4],[0,0,3,4]];
var FK_K=[[0,3,6,10],[0,5,10,13],[0,3,7,10,14]];
var FK_B=[{0:0,3:-2,6:12,7:10,10:0,12:7,14:5,15:3},{0:0,2:12,3:0,6:10,8:0,10:12,11:0,14:7},{0:0,4:0,7:7,8:5,10:3,12:0,14:10,15:12}];
var FK_G=[[0,0,1,1,0,1,0,1,0,0,1,1,0,1,0,1],[0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,1],[1,0,0,1,0,1,1,0,1,0,0,1,0,1,0,1]];
var FK_H=[[0,3,6],[2,6,10],[0,10,13]];
function mFunk(t,n,lv,s,L){
  var S=mSong(lv),P=S.P,bar=Math.floor(n/16),u=n%16,md=s.md|0,pr=Math.max(0,Math.min(1,s.wx/Math.max(1,L.end))),sd=60/lv.bpm/2,sc=SCL.dorian,v=(P.sd|0);
  var cyc=bar%4, r=FKP[v%FKP.length][cyc], lift=(P.lift&&(bar%32)>=16)?P.lift:0, root=55*Math.pow(2,(P.key+lift)/12);
  var d2s=function(d){ var o=Math.floor(d/7); return sc[((d%7)+7)%7]+12*o; }, hz=function(semi,oct){ return root*Math.pow(2,semi/12)*(oct||1); }, cr=d2s(r);
  var tt=t+((u%2)?sd*.2:0), KK=FK_K[v%FK_K.length], BB=FK_B[v%FK_B.length], GG=FK_G[v%FK_G.length], HH=FK_H[v%FK_H.length];
  var drums=bar>=1||pr>.02, fillBar=(bar%8)===7;
  /* drums */
  if(drums){
    if(KK.indexOf(u)>=0&&!(fillBar&&u>=12)){ mTone(tt,135,.17,'sine',.62,{f2:42}); mTone(tt,60,.12,'sine',.3); mNoise(tt,.008,.1,2800); }
    if(u===4||u===12){ mNoise(tt,.16,.17,1900,1); mTone(tt,185,.09,'triangle',.1,{f2:150}); }
    else if(u===7||u===9||u===15||(fillBar&&u>=12)){ mNoise(tt,.05,fillBar&&u>=12?.1:.045,2100,1); }
    var hv=[1,.35,.6,.35,1,.35,.6,.45,1,.35,.6,.35,1,.35,.6,.45][u], op=(u===14||(v%2&&u===6));
    mNoise(tt,op?.14:.03,op?.07:.032*hv+.012,8500);
  }
  /* bass: a riff that repeats, with a turnaround in the last bar of 4 */
  if(bar>=1){ var bo=BB[u]; if(cyc===3&&u>=12){ bo=[7,5,3,-3][u-12]; } if(bo!==undefined&&bo!==-3){ var gh=bo===-2, bn=cr+(gh?0:bo), dl=sd*(gh?.6:1.7);
      mTone(tt,hz(bn,2),dl,'sawtooth',gh?.07:(u===0?.24:.18),{lp:gh?500:1500,lp2:240}); mTone(tt,hz(bn,2),dl*.8,'square',gh?0.0001:.05,{lp:900,lp2:260}); mTone(tt,hz(bn,1),dl*1.1,'sine',gh?.05:.2); } }
  /* chicken-scratch guitar */
  if(bar>=2){ var gc=GG[u]; var ch=[0,3,7,10]; if(gc){ for(var q=0;q<4;q++) mTone(tt+q*.004,hz(cr+ch[q],8),.055,'sawtooth',.016,{lp:3400,lp2:1100}); mNoise(tt,.03,.03,3500); } else mNoise(tt,.02,.012,4500); }
  /* e-piano stabs */
  if(bar>=3&&(u===3||u===10||(u===14&&v%2===0))){ var kc=[0,3,7,10,14]; for(var q3=0;q3<5;q3++){ mTone(tt,hz(cr+kc[q3],4),.5,'sine',.028,{at:.004}); mTone(tt,hz(cr+kc[q3],8),.2,'triangle',.008,{lp:3000}); } }
  /* horn hits: call and response, with a fall at the end of every fourth bar */
  if(bar>=5){ var hs=HH[(bar>>1)%3]===u||HH.indexOf(u)>=0; if((bar%2===1)&&hs){ var hc=[0,4,7,10]; for(var q4=0;q4<4;q4++){ mTone(tt,hz(cr+hc[q4],8),sd*1.5,'sawtooth',.02,{lp:2600,lp2:1100,at:.008}); mTone(tt,hz(cr+hc[q4],8)*1.004,sd*1.5,'square',.01,{lp:2200,at:.008}); } }
    if(cyc===3&&u===12){ mTone(tt,hz(cr+12,8),sd*5,'sawtooth',.03,{f2:hz(cr,4),lp:2600,lp2:700,at:.01}); } }
}
/* levels with their own song: the recording plays in step with the run (it restarts at the right place after a death or checkpoint) */
function songTick(){ var lv=Z.lv; if(!Z.sa||Z.sa.u!==lv.song){ songStop(); Z.sa=new Audio(lv.song); Z.sa.u=lv.song; Z.sa.preload='auto'; }
  var a=Z.sa, tg=Math.max(0,Z.s.t||0); a.volume=.9; if(Z.mute||Z.mode!=='play'){ if(!a.paused) a.pause(); return; }
  if(a.paused){ try{ a.currentTime=tg; }catch(e){} var pp=a.play(); if(pp&&pp.catch) pp.catch(function(){}); } else if(Math.abs(a.currentTime-tg)>.25){ try{ a.currentTime=tg; }catch(e){} } }
function songStop(fade){ var a=Z.sa; if(!a) return; if(Z.sf){ clearInterval(Z.sf); Z.sf=0; } if(!fade){ try{ a.pause(); }catch(e){} return; } Z.sf=setInterval(function(){ if(a.volume>.08) a.volume=Math.max(0,a.volume-.08); else { clearInterval(Z.sf); Z.sf=0; try{ a.pause(); }catch(e){} } },90); }
function music(){ if(Z.lv&&Z.lv.song){ if(Z.s) songTick(); return; } var a=Z.au; if(!a||Z.mute||Z.mode!=='play'||!Z.lv||!Z.s||!Z.lv.bpm) return; if(a.state==='suspended') try{ a.resume(); }catch(e){} var lv=Z.lv, sd=60/lv.bpm/2, st=Z.s.t||0; if(Z.mn==null||Z.mn<0) Z.mn=Math.ceil(st/sd-1e-6);
  while(Z.mn*sd-st<.32){ var t=a.currentTime+Math.max(.01,Z.mn*sd-st); (Z.fk?mFunk:mStep)(t,Z.mn,lv,Z.s,Z.L); Z.mn++; } }

/* ---------- menu ---------- */
function myHtml(){ var L=myAll(), dr=draftGet(); if(!L.length&&!dr) return '';
  return '<div class="pnl" style="margin-top:14px"><h3>My levels</h3>'+(dr?'<div class="ds-my"><span><b>Unsaved draft</b><br><small class="muted">Your last build in the maker</small></span><span class="sp"></span><button class="btn sm pri" data-my="draft" type="button">Continue</button></div>':'')
    +L.map(function(m){ return '<div class="ds-my"><span><b>'+esc(m.n||'Untitled')+'</b> '+(m.ok?'<span class="tag g">✓ finishable</span>':'<span class="tag">not checked</span>')+'<br><small class="muted">'+fmtAgo(m.t)+'</small></span><span class="sp"></span><button class="btn sm pri" data-my="play" data-id="'+esc(m.id)+'" type="button">Play</button><button class="btn sm" data-my="edit" data-id="'+esc(m.id)+'" type="button">Edit</button><button class="btn sm" data-my="copy" data-id="'+esc(m.id)+'" type="button">Link</button>'+(m.ok&&PL.updOn5&&PL.updOn5()?'<button class="btn sm" data-my="pub" data-id="'+esc(m.id)+'" type="button">Publish</button>':'')+'<button class="btn sm" data-my="del" data-id="'+esc(m.id)+'" type="button">✕</button></div>'; }).join('')+'</div>'; }
function gateOK(lv){ return lv.upd===7?!!(PL.updOn7&&PL.updOn7()):lv.upd===6.5?!!(PL.updOn65&&PL.updOn65()):lv.upd===6?!!(PL.updOn6&&PL.updOn6()):lv.upd===4?!!(PL.updOn4&&PL.updOn4()):lv.upd===3?!!(PL.updOn3&&PL.updOn3()):lv.upd===2?!!(PL.updOn2&&PL.updOn2()):!!(PL.updOn&&PL.updOn()); }
function menu(el){ stopLoop(); Z.root=el; var d=sv(); Z.fk=(d.mus==='f'); Z.fxq=(d.fxq==null?2:+d.fxq);
  var on1=!!(PL.updOn&&PL.updOn()), tab=Z.tab||(on1?'ai':'ed'); if(tab==='ai'&&!on1) tab='ed';
  function lvCard(lv,i){ var b=d.best[lv.id]||0, ok=d.done[lv.id], st=(d.stars||{})[lv.id]||1; return '<button type="button" class="ds-card" data-i="'+i+'" style="background:linear-gradient(135deg,'+lv.c1+','+lv.c2+')"><span class="ds-num">'+lv.id+'</span><span class="ds-n">'+esc(lv.tag)+'</span><span class="ds-t">'+esc(lv.name)+'</span><span class="ds-b">'+(ok?'Complete · '+'★★★'.slice(0,[1,1,2,3][st])+'☆☆☆'.slice(0,3-[1,1,2,3][st]):(b?'Best '+b+'%':'Not played'))+'</span><span class="ds-bar"><i style="width:'+(ok?100:b)+'%"></i></span><span class="ds-r">'+(function(){ var m=(d.coins||{})[lv.id]|0, n=0; for(var q=0;q<3;q++) if(m&(1<<q)) n++; return n?'<b style="color:#ffd34a">'+n+'/3 coins</b> · ':''; })()+(ok?'Cleared':'+'+lv.reward+' tokens first win')+'</span></button>'; }
  var groups=[['Classic',0],['Update 1',1],['Update 2',2],['Update 3',3],['Update 4',4],['Update 6',6],['Update 6.5',6.5],['Update 7',7]];
  var secs=groups.map(function(g){ var items=D.LEVELS.map(function(lv,i){ return [lv,i]; }).filter(function(x){ return (x[0].upd||0)===g[1]&&(!x[0].upd||gateOK(x[0])); }); if(!items.length) return ''; var dn=items.filter(function(x){ return d.done[x[0].id]; }).length;
    return '<div class="dh-sec"><h2>'+g[0]+'</h2><span class="muted">'+dn+' / '+items.length+' cleared</span></div><div class="ds-lv">'+items.map(function(x){ return lvCard(x[0],x[1]); }).join('')+'</div>'; }).join('');
  var dailyDone=d.daily&&d.daily.d===dayKey();
  el.innerHTML='<div class="wrap dh">'+PL.crumbs('Cube Dash')
    +'<div class="dh-bar"><p class="muted dh-how">Tap, click or press Space to jump, hold to keep jumping. Reach the finish to win tokens.</p><div class="dh-opts"><label class="dh-chip"><input type="checkbox" id="dsPr"'+(Z.prac?' checked':'')+'> Practice</label>'+(PL.updOn7&&PL.updOn7()?'<label class="dh-chip">Practice speed <select id="dsPs" class="dh-sel">'+[[1,'100%'],[.75,'75%'],[.5,'50%']].map(function(o){ return '<option value="'+o[0]+'"'+((Z.pspd||1)==o[0]?' selected':'')+'>'+o[1]+'</option>'; }).join('')+'</select></label>':'')+'<label class="dh-chip"><input type="checkbox" id="dsMu"'+(Z.mute?'':' checked')+'> Sound</label><label class="dh-chip">Effects <select id="dsFx" class="dh-sel"><option value="2"'+((d.fxq==null||d.fxq==2)?' selected':'')+'>Max</option><option value="1"'+(d.fxq==1?' selected':'')+'>Normal</option><option value="0"'+(d.fxq==0?' selected':'')+'>Light</option></select></label><label class="dh-chip">Music <select id="dsMs" class="dh-sel"><option value=""'+(d.mus==='f'?'':' selected')+'>Original</option><option value="f"'+(d.mus==='f'?' selected':'')+'>Funk</option></select></label><label class="dh-chip"><input type="checkbox" id="dsGh"'+(d.gh?' checked':'')+'> Best-run ghost</label><label class="dh-chip">Trail <select id="dsLk" class="dh-sel">'+LOOKS.map(function(k,i){ var ok=starTotal()>=k.s; return '<option value="'+i+'"'+((d.look||0)===i?' selected':'')+(ok?'':' disabled')+'>'+k.n+(ok?'':' ('+k.s+' stars)')+'</option>'; }).join('')+'</select></label></div></div>'
    +'<div class="dh-feat" id="dsFeat"><div class="dh-f"><div class="dh-fk">Daily Dash</div><div class="dh-ft">A new level every day</div><div class="dh-fs">'+(dailyDone?'Cleared today':'+100 tokens')+(d.daily&&d.daily.streak?' · '+d.daily.streak+' day streak':'')+'</div><button type="button" class="btn pri" id="dsDy">'+(dailyDone?'Play again':'Play today\'s level')+'</button><div id="dsDb"></div></div></div>'
    +secs
    +'<div class="dh-sec"><h2>Create</h2></div><div class="pnl dh-cr"><div class="dh-tabs" role="tablist">'+(on1?'<button type="button" data-tb="ai" class="'+(tab==='ai'?'on':'')+'">AI maker</button>':'')+'<button type="button" data-tb="ed" class="'+(tab==='ed'?'on':'')+'">Level editor</button><button type="button" data-tb="cd" class="'+(tab==='cd'?'on':'')+'">Play a code</button></div>'
    +'<div class="dh-pane" id="dsTabAi"'+(tab==='ai'?'':' hidden')+'></div>'
    +'<div class="dh-pane" id="dsTabEd"'+(tab==='ed'?'':' hidden')+'><p class="muted">Build your own level, prove it can be finished, and share it with a code or link. Anyone can play it.</p><button class="btn pri" id="dsMk" type="button">Make a level</button></div>'
    +'<div class="dh-pane" id="dsTabCd"'+(tab==='cd'?'':' hidden')+'><div class="row" style="gap:10px;flex-wrap:wrap"><input class="in mono" id="dsCode" placeholder="Paste a level code or link" style="flex:1;min-width:180px"><button class="btn pri" id="dsPlC" type="button">Play</button></div><p class="muted" id="dsCm" style="font-size:13.5px;margin-top:8px;min-height:18px"></p></div></div>'
    +myHtml()+'</div>';
  el.querySelectorAll('[data-tb]').forEach(function(b){ b.onclick=function(){ Z.tab=b.getAttribute('data-tb'); el.querySelectorAll('[data-tb]').forEach(function(x){ x.classList.toggle('on',x===b); }); $('#dsTabAi').hidden=Z.tab!=='ai'; $('#dsTabEd').hidden=Z.tab!=='ed'; $('#dsTabCd').hidden=Z.tab!=='cd'; }; });
  $('#dsGh').onchange=function(){ var q=sv(); q.gh=this.checked?1:0; CW.setJ('cw_dash',q); };
  $('#dsLk').onchange=function(){ var q=sv(); q.look=+this.value; CW.setJ('cw_dash',q); };
  $('#dsMk').onclick=function(){ Z.edit=null; try{ localStorage.removeItem('cw_dash_draft'); }catch(e){} edit(el,null); };
  el.onclick=function(ev){ var b=ev.target.closest('[data-my]'); if(!b) return; var a=b.getAttribute('data-my'), id=b.getAttribute('data-id'), L=myAll(), m=L.filter(function(x){ return x.id===id; })[0];
    if(a==='draft'){ var dr=draftGet(), e=dr&&D.fromCode(dr.c); if(e){ e.name=dr.n; e.sid=dr.sid; Z.edit=null; edit(el,e); } return; }
    if(!m) return; var e2=D.fromCode(m.c); if(!e2){ CW.toast('That level could not be read.'); return; }
    if(a==='play'){ ac(); playCustom(el,e2); } else if(a==='edit'){ e2.name=m.n; e2.sid=m.id; e2.ok=m.ok?m.c:''; Z.edit=null; edit(el,e2); }
    else if(a==='copy'){ var link=location.origin+'/play/#dash/'+m.c; if(navigator.clipboard) navigator.clipboard.writeText(link).then(function(){ CW.toast('Level link copied.'); },function(){ CW.toast(link); }); else CW.toast(link); }
    else if(a==='pub'){ if(PL.dashPublish) PL.dashPublish(m); }
    else if(a==='del'){ if(!confirm('Delete "'+(m.n||'Untitled')+'"?')) return; myPut(L.filter(function(x){ return x.id!==id; })); menu(el); } };
  $('#dsPlC').onclick=function(){ var ao=aiFrom($('#dsCode').value); if(ao){ ac(); startLevel(el,aiMake(ao),D.build(ao),function(){ menu(el); }); return; } var e=D.fromCode($('#dsCode').value); if(!e){ $('#dsCm').textContent='That code is not a valid level.'; return; } ac(); playCustom(el,e); };
  el.querySelectorAll('.ds-lv').forEach(function(g){ g.onclick=function(e){ var b=e.target.closest('[data-i]'); if(!b) return; ac(); if(Z.au&&Z.au.state==='suspended') Z.au.resume(); play(el,+b.getAttribute('data-i')); }; });
  $('#dsDy').onclick=function(){ var b=this; b.disabled=true; var t=b.textContent; b.textContent='Finding today\'s level…'; ac(); dailyFind(function(lv){ b.disabled=false; b.textContent=t; if(!lv){ CW.toast('Could not make a level today. Try again.'); return; } if(Z.au&&Z.au.state==='suspended') Z.au.resume(); startLevel(el,lv,D.build(lv),function(){ menu(el); }); }); };
  el.querySelectorAll('[data-lk]').forEach(function(b){ b.onclick=function(){ var q=sv(); q.look=+b.getAttribute('data-lk'); CW.setJ('cw_dash',q); menu(el); }; });
  try{ if(PL.updOn&&PL.updOn()) aiPanel(el); }catch(e){ console.error(e); }
  Z.xg=null;
  try{ if(PL.api&&PL.updOn&&PL.updOn()) PL.api('/api/u/wb',{}).then(function(r){ var bx=$('#dsDb'); if(!bx||!r.ok||!r.data.top) return; var q=r.data; Z.wk=q.li; var days=Math.max(1,Math.ceil((q.end-Date.now())/86400000));
    var nw=!q.li&&q.w!=null; var w=document.createElement('div'); w.innerHTML='<div class="dh-fk">Weekly Dash</div><div class="dh-ft">'+(nw?'A brand-new level this week':'Level '+q.li)+' · fewest attempts</div><div class="dh-fs">'+days+' day'+(days===1?'':'s')+' left · top 3 win 300 / 200 / 100</div>'
      +(q.top.length?'<div class="muted dh-lb">Top: '+q.top.slice(0,5).map(function(x,i){ return (i+1)+'. '+esc(x.n)+' ('+(x.a||'?')+')'; }).join(' · ')+(q.my?' · You are #'+q.my:'')+'</div>':'<div class="muted dh-lb">No clears yet. Be the first.</div>')
      +'<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm pri" id="dsWp" type="button">'+(nw?'Play this week\'s level':'Play Level '+q.li)+'</button>'+(q.top.length&&q.top[0].g?'<button class="btn sm" id="dsWg" type="button">Race the #1 replay</button>':'')+'</div>';
    var ft=$('#dsFeat'); if(!ft) return; ft.querySelectorAll('.dh-wk').forEach(function(o){ o.remove(); }); w.className='dh-f dh-wk'; ft.appendChild(w);
    var wkPlay=function(cb){ if(!nw){ play(el,q.li-1); if(cb) cb(); return; } var bt=$('#dsWp'); if(bt){ bt.disabled=true; bt.textContent='Building this week\'s level…'; } weeklyFind(q.w,function(lv){ if(bt){ bt.disabled=false; bt.textContent='Play this week\'s level'; } if(!lv){ CW.toast('This week\'s level is not ready. Try again.'); return; } Z.wk=lv.id; startLevel(el,lv,D.build(lv),function(){ menu(el); }); if(cb) cb(lv); }); };
    if(nw) Z.wk='wk'+q.w;
    $('#dsWp').onclick=function(){ ac(); Z.xg=null; wkPlay(); };
    var g=$('#dsWg'); if(g) g.onclick=function(){ g.disabled=true; PL.api('/api/u/wb',{ghost:0}).then(function(r2){ g.disabled=false; if(!r2.ok||!r2.data.ghost){ CW.toast('Replay not available.'); return; } ac(); wkPlay(function(lv){ Z.xg={id:lv?lv.id:q.li,ch:r2.data.ghost}; restart(); CW.toast('Racing the #1 replay as a ghost.'); }); }); }; }); }catch(e){}
  try{ if(PL.api&&PL.updOn&&PL.updOn()) PL.api('/api/u/dd',{}).then(function(r){ var bx=$('#dsDb'); if(!bx||!r.ok||!r.data.top) return; bx.innerHTML=r.data.top.length?'<div class="muted dh-lb">Fewest attempts today: '+r.data.top.slice(0,5).map(function(x,i){ return (i+1)+'. '+esc(x.n)+' ('+x.a+')'; }).join(' · ')+'</div>':''; }); }catch(e){}
  $('#dsPr').onchange=function(){ Z.prac=this.checked; }; var psel=$('#dsPs'); if(psel) psel.onchange=function(){ Z.pspd=+this.value||1; CW.toast(Z.pspd<1?'Practice runs at '+Math.round(Z.pspd*100)+'% speed.':'Practice runs at full speed.'); }; $('#dsMu').onchange=function(){ Z.mute=!this.checked; }; $('#dsFx').onchange=function(){ var q=sv(); q.fxq=+this.value; CW.setJ('cw_dash',q); Z.fxq=+this.value; }; $('#dsMs').onchange=function(){ var q=sv(); q.mus=this.value; CW.setJ('cw_dash',q); Z.fk=this.value==='f'; Z.mn=null; };
  try{ if(PL.dashExtra) PL.dashExtra(el); }catch(e){}
  try{ if(PL.dashComm) PL.dashComm(el); }catch(e){}
}

/* ---------- AI level maker: describe a level, the AI designs it, the game checks it can be finished ---------- */
function aiCode(lv){ try{ return 'AI.'+btoa(unescape(encodeURIComponent(JSON.stringify(lv)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }catch(e){ return ''; } }
function aiFrom(c){ try{ c=String(c||'').trim(); if(c.slice(0,3)!=='AI.') return null; var o=JSON.parse(decodeURIComponent(escape(atob(c.slice(3).replace(/-/g,'+').replace(/_/g,'/'))))); if(!o||!Array.isArray(o.seq)||o.seq.length<8||o.seq.length>80) return null;
  o.seq=o.seq.filter(function(k){ return D.CH[k]; }); o.speed=Math.max(300,Math.min(540,+o.speed||420)); o.gap=[Math.max(3,Math.min(9,+(o.gap||[])[0]||4)),Math.max(3,Math.min(9,+(o.gap||[])[1]||7))]; if(!/^#[0-9a-f]{6}$/i.test(o.c1)) o.c1='#1d2f6f'; if(!/^#[0-9a-f]{6}$/i.test(o.c2)) o.c2='#3b82f6'; o.name=String(o.name||'AI Level').slice(0,24); o.tag=String(o.tag||'').slice(0,24); o.bpm=Math.max(90,Math.min(170,+o.bpm||128)); o.notes=(Array.isArray(o.notes)?o.notes:[0,3,5,3,0,3,7,5]).slice(0,8).map(function(x){ return Math.max(0,Math.min(12,+x||0)); }); return o; }catch(e){ return null; } }
function aiMake(o){ var h=0,s=JSON.stringify(o.seq)+o.name; for(var i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; o.seed=h%100000+1; o.n=o.seq.length; o.pool=[]; o.id='ai'+o.seed; o.custom=1; o.reward=0; o.ai=1; o.lead=18; return o; }
function aiRepair(o,cb,prog){ var HARD=['flip2','trp','djwall','moonpit','orb'], t=0; (function nx(){ var lv=aiMake(Object.assign({},o,{gap:[o.gap[0]+Math.floor(t/2),o.gap[1]+Math.floor(t/2)],speed:Math.max(300,o.speed-10*t),seq:t>=6?o.seq.filter(function(k){ return HARD.indexOf(k)<0||Math.random()<.3; }):o.seq}));
  if(lv.seq.length<8){ cb(null); return; } if(prog) prog(t); D.verify(D.build(lv),function(ok){ if(ok) cb(lv,t); else if(++t<12) nx(); else cb(null); }); })(); }
function aiPanel(el){ var bx=$('#dsTabAi'); if(!bx||$('#dsAi')) return; var V2=!!(PL.updOn2&&PL.updOn2()); var hist=CW.lsJ('cw_dash_ai',[])||[]; if(!Array.isArray(hist)) hist=[];
  var w=document.createElement('div'); w.id='dsAi';
  w.innerHTML='<p class="muted">Describe the level you want and the AI builds it, then checks it can be finished. Try "a slow spooky level with lots of pits, ending in a gravity flip".</p>'
    +'<textarea class="in" id="dsAq" rows="2" maxlength="300" placeholder="Describe your level…" style="width:100%;margin-top:6px"></textarea>'
    +(V2?'<div class="row" style="gap:10px;flex-wrap:wrap;margin-top:8px;align-items:center"><label class="row" style="gap:6px">Difficulty <select id="dsAd" class="in" style="width:auto"><option>Easy</option><option selected>Normal</option><option>Hard</option><option>Insane</option></select></label><label class="row" style="gap:6px">Length <select id="dsAl" class="in" style="width:auto"><option>Short</option><option selected>Medium</option><option>Long</option></select></label><button class="btn sm" id="dsAs" type="button">Surprise me</button></div>':'')
    +'<div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn pri" id="dsAg2" type="button">Build my level</button><span class="muted" id="dsAm" style="font-size:13.5px"></span></div><div id="dsAh"></div>';
  bx.appendChild(w);
  function list(){ var h=$('#dsAh'); if(!h) return; h.innerHTML=hist.length?'<div class="list" style="margin-top:10px">'+hist.map(function(x,i){ return '<div><span style="flex:1"><b>'+esc(x.name)+'</b><br><small class="muted">'+esc(String(x.q||x.tag||'').slice(0,80))+'</small></span><button class="btn sm" data-ap="'+i+'" type="button">Play</button><button class="btn sm" data-ae="'+i+'" type="button">Easier</button><button class="btn sm" data-ah="'+i+'" type="button">Harder</button><button class="btn sm" data-ac="'+i+'" type="button">Copy code</button>'+(V2?'<button class="btn sm" data-al="'+i+'" type="button">Copy link</button>':'')+'</div>'; }).join('')+'</div>':''; }
  list();
  w.addEventListener('click',function(e){ var p=e.target.closest('[data-ap]'), c=e.target.closest('[data-ac]'), ez=e.target.closest('[data-ae]'), hd=e.target.closest('[data-ah]'), lk=e.target.closest('[data-al]');
    if(lk){ var ln=location.origin+'/play/#dash/'+aiCode(hist[+lk.getAttribute('data-al')]); if(navigator.clipboard) navigator.clipboard.writeText(ln).then(function(){ CW.toast('Level link copied. Anyone can open it.'); },function(){ CW.toast(ln); }); else CW.toast(ln); return; }
    if(ez||hd){ var ix=+(ez||hd).getAttribute(ez?'data-ae':'data-ah'), base=aiFrom(aiCode(hist[ix])), m=$('#dsAm'); if(!base) return; var dir=ez?-1:1; base.speed=Math.max(300,Math.min(540,base.speed+dir*30)); base.gap=[Math.max(3,Math.min(9,base.gap[0]-dir)),Math.max(3,Math.min(9,base.gap[1]-dir))]; base.q=hist[ix].q; m.textContent='Making it '+(ez?'easier':'harder')+' and checking it can be finished…';
      aiRepair(base,function(lv){ if(!lv){ m.textContent='That version cannot be finished. Kept the original.'; return; } var sv2={name:(String(hist[ix].name).replace(/ \((easier|harder)\)$/,'')+(ez?' (easier)':' (harder)')).slice(0,24),tag:lv.tag,speed:lv.speed,gap:lv.gap,c1:lv.c1,c2:lv.c2,bpm:lv.bpm,notes:lv.notes,seq:lv.seq,q:hist[ix].q}; hist.unshift(sv2); hist=hist.slice(0,6); CW.setJ('cw_dash_ai',hist); list(); m.textContent='Done. It is at the top of your list.'; }); return; }
    if(p){ var o=aiFrom(aiCode(hist[+p.getAttribute('data-ap')])); if(!o) return; ac(); Z.xg=null; startLevel(el,aiMake(o),D.build(o),function(){ menu(el); }); } else if(c){ var cd=aiCode(hist[+c.getAttribute('data-ac')]); if(navigator.clipboard) navigator.clipboard.writeText(cd).then(function(){ CW.toast('Level code copied. Paste it in the code box to play it.'); },function(){ CW.toast(cd); }); else CW.toast(cd); } });
  var sp=$('#dsAs'); if(sp) sp.onclick=function(){ var L=['a spooky haunted castle level with lots of pits','a fast neon city rush full of spikes and saws','a calm underwater level with many pits and slow music','a lava volcano level with saw blades and lasers','a galaxy level with lots of gravity portals','a candy land level that starts easy and ends hard','a robot factory level with lasers and sawgates','a snowy mountain level with low gravity pits']; $('#dsAq').value=L[Math.floor(Math.random()*L.length)]; };
  $('#dsAg2').onclick=async function(){ var b=this, q=$('#dsAq').value.trim(), m=$('#dsAm'), q0=q; if(q.length<4){ m.textContent='Describe the level in a few words.'; return; } b.disabled=true; m.textContent='The AI is designing your level…';
    if(V2){ q+=' Difficulty: '+$('#dsAd').value.toLowerCase()+'. Length: '+({Short:'short, about 20 obstacles',Medium:'medium, about 40 obstacles',Long:'long, about 70 obstacles'})[$('#dsAl').value]+'.'; }
    var r=await PL.api('/api/u/dg',{q:q,v2:V2?1:0}); if(!r.ok||!r.data||!r.data.lv){ b.disabled=false; m.textContent=(r.data&&r.data.error)||'The level maker is busy. Try again.'; return; }
    var o=aiFrom(aiCode(r.data.lv)); if(!o){ b.disabled=false; m.textContent='The AI built something broken. Try again.'; return; } o.q=r.data.lv.q;
    m.textContent='Checking that it can be finished…'; aiRepair(o,function(lv,t){ b.disabled=false; if(!lv){ m.textContent='That one came out too hard to finish. Try describing it a bit easier.'; return; }
      m.textContent=t?'Made it a little easier so it can be beaten.':'Ready!'; var save={name:lv.name,tag:lv.tag,speed:lv.speed,gap:lv.gap,c1:lv.c1,c2:lv.c2,bpm:lv.bpm,notes:lv.notes,seq:lv.seq,q:q0}; hist.unshift(save); hist=hist.slice(0,6); CW.setJ('cw_dash_ai',hist);
      ac(); if(Z.au&&Z.au.state==='suspended') Z.au.resume(); Z.xg=null; startLevel(el,lv,D.build(lv),function(){ menu(el); }); },function(t){ m.textContent='Checking that it can be finished…'+(t?' (adjusting '+t+')':''); }); }; }
function play(el,i){ startLevel(el,D.LEVELS[i],D.build(D.LEVELS[i]),function(){ menu(el); }); }
PL.dashD=D; PL.dashDayIx=function(){ var d=new Date(), k=d.getFullYear()*372+d.getMonth()*31+d.getDate(), x=(k*2654435761)>>>0; return x%Math.max(1,D.LEVELS.length); };
PL.dashLevels=D.LEVELS||D.levels||[];
PL.dashApi={remix:function(el,code,name){ var e=D.fromCode(code); if(!e) return false; e.name=String((name||'Level')+' remix').slice(0,28); e.sid=''; e.ok=''; ac(); edit(el,e); return true; },play:function(el,code,k,name){ var e=D.fromCode(code); if(!e) return false; var L=D.mkCustom(e); L.lv.comm=k; L.lv.name=name||'Community level'; ac(); startLevel(el,null,L,function(){ menu(el); },null); return true; },menu:function(el){ menu(el); }};
function playCustom(el,e,back){ startLevel(el,null,D.mkCustom(e),back||function(){ menu(el); },e); }
function startLevel(el,lv,L,back,ce){ window.scrollTo(0,0); document.body.classList.add('dashing'); Z.back=back; Z.day=0; Z.ce=ce||null; Z.lv=lv||L.lv; Z.L=L; Z.att=0; Z.cp=null; Z.mode='ready'; Z.best=0; Z.parts=[]; Z.trail=[]; Z.nbeat=0;
  el.innerHTML='<div class="wrap"><div class="crumbs"><button class="btn sm" id="dsBack" type="button">← '+(Z.ce&&Z.edit?'Back to editor':Z.ce?'Levels':'Levels')+'</button><h1>'+esc(Z.lv.name)+' · '+esc(Z.lv.tag)+(Z.prac?' · Practice':'')+'</h1></div>'
    +'<div class="ds-stage"><canvas id="dsCv" aria-label="Cube Dash game"></canvas><div class="ds-hud"><span id="dsPc">0%</span><span id="dsAt">Attempt 1</span><button type="button" id="dsPs" class="btn sm">Pause</button></div><div class="ds-msg" id="dsMsg"></div></div>'
    +'<p class="muted" style="text-align:center;font-size:13px;margin-top:8px">Tap, click or press Space to jump · hold to keep jumping</p></div>';
  Z.cv=$('#dsCv'); fit(); $('#dsBack').onclick=function(){ Z.back(); };
  $('#dsPs').onclick=function(e){ e.stopPropagation(); pause(); };
  var cv=Z.cv; cv.addEventListener('pointerdown',function(e){ e.preventDefault(); ac(); if(Z.au&&Z.au.state==='suspended') Z.au.resume(); Z.hold=true; onTap(); });
  window.addEventListener('pointerup',up); window.addEventListener('pointercancel',up);
  $('#dsMsg').addEventListener('pointerdown',function(e){ e.preventDefault(); Z.hold=true; onTap(); });
  restart(); Z.last=performance.now(); Z.raf=requestAnimationFrame(loop); }
function up(){ Z.hold=false; Z.skip=false; }
function fit(){ var cv=Z.cv; if(!cv) return; var w=Math.min(cv.parentNode.clientWidth||W,960), h=Math.round(w/2), dpr=Math.min(window.devicePixelRatio||1,2); if(cv.style.width===w+'px'&&cv.width===Math.round(w*dpr)&&Z.cx) return false; cv.style.width=w+'px'; cv.style.height=h+'px'; cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr); Z.sc=w*dpr/W; Z.cx=cv.getContext('2d'); }
window.addEventListener('resize',function(){ if(!(Z.cv&&document.body.contains(Z.cv))) return; if(fit()===false) return;
  /* resizing the canvas wipes it: draw it again straight away (the level maker has no animation loop to do it) */
  try{ if(Z.edit&&document.getElementById('edCam')) drawEd(Z.edit); else if(Z.lv) draw(); }catch(e){} });
function msg(t,sub){ var m=$('#dsMsg'); if(!m) return; m.innerHTML=t?'<b>'+t+'</b>'+(sub?'<small>'+sub+'</small>':''):''; m.style.display=t?'flex':'none'; }
function ghKey(){ return Z.lv&&!Z.lv.custom&&Z.lv.id!=null?String(Z.lv.id):''; }
function ghLoad(){ var k=ghKey(); Z.gh=null; if(!k||Z.prac) return; if(Z.xg&&Z.xg.id===Z.lv.id){ Z.gh={s:D.newState(Z.L,null),ch:Z.xg.ch,i:0,h:false,st:0,dead:false,p:100}; return; } if(!sv().gh) return; var g=(CW.lsJ('cw_dash_ghost',{})||{})[k]; if(g&&g.ch&&g.ch.length) Z.gh={s:D.newState(Z.L,null),ch:g.ch,i:0,h:false,st:0,dead:false,p:g.p}; }
function ghostStep(){ var g=Z.gh; if(!g||g.dead) return; while(g.i<g.ch.length&&g.ch[g.i][0]<=Z.si){ g.h=!!g.ch[g.i][1]; g.i++; } var r=D.step(g.s,g.h,D.DT); if(r==='dead'||r==='win') g.dead=true; }
function ghSave(p){ var k=ghKey(); if(!k||Z.prac||!Z.rec||!Z.rec.length) return; var a=CW.lsJ('cw_dash_ghost',{})||{}, o=a[k]; if(o&&(o.p>p||(o.p===p&&p<100)||(o.p===100&&p===100&&o.n<=Z.si))) return; a[k]={p:p,n:Z.si,ch:Z.rec.slice(0,900)}; var ks=Object.keys(a); if(ks.length>16){ delete a[ks[0]]; } CW.setJ('cw_dash_ghost',a); }
function restart(){ songStop(); if(Z.fx){ Z.fx.pv=null; Z.fx.gh=[]; Z.fx.sh=[]; Z.fx.rg=[]; Z.fx.fw=[]; Z.fx.sq=0; Z.fx.ab=0; } Z.vr=null; Z.rec=[]; Z.si=0; Z.lastH=false; Z.s=D.newState(Z.L,Z.prac?Z.cp:null); ghLoad(); Z.att++; Z.mode='ready'; Z.parts=[]; Z.trail=[]; Z.hold=false; Z.nextNote=0; Z.nbeat=0; Z.mn=-1; var a=$('#dsAt'); if(a) a.textContent=(Z.prac?'Practice · ':'')+'Attempt '+Z.att; msg(Z.att===1?'Tap to start':'Tap to try again',Z.prac&&Z.cp?'From your checkpoint':''); }
function onTap(){ if(Z.mode==='ready'){ Z.mode='play'; Z.skip=true; msg(''); } else if(Z.mode==='pause'){ pause(); } else if(Z.mode==='win'){ } }
function pause(){ if(Z.mode==='play'){ Z.mode='pause'; msg('Paused','Tap to resume'); $('#dsPs').textContent='Resume'; } else if(Z.mode==='pause'){ Z.mode='play'; msg(''); $('#dsPs').textContent='Pause'; Z.last=performance.now(); } }
function stopLoop(){ document.body.classList.remove('dashing'); cancelAnimationFrame(Z.raf); Z.raf=0; window.removeEventListener('pointerup',up); window.removeEventListener('pointercancel',up); Z.mode='off'; songStop(); }
document.addEventListener('keydown',function(e){ if(!Z.cv||!document.body.contains(Z.cv)) return; if(e.code==='Space'||e.key==='ArrowUp'||e.key==='w'||e.key==='W'){ e.preventDefault(); if(!Z.hold){ Z.hold=true; ac(); if(Z.au&&Z.au.state==='suspended') Z.au.resume(); onTap(); } } else if(e.key==='Escape'||e.key==='p'||e.key==='P'){ pause(); } });
document.addEventListener('keyup',function(e){ if(e.code==='Space'||e.key==='ArrowUp'||e.key==='w'||e.key==='W'){ Z.hold=false; Z.skip=false; } });
document.addEventListener('visibilitychange',function(){ if(document.hidden&&Z.mode==='play') pause(); });

var LOOKS=[{n:'White',c:'#fff',s:0},{n:'Cyan',c:'#18c5ff',s:3},{n:'Pink',c:'#ff3fa4',s:6},{n:'Gold',c:'#ffd500',s:10},{n:'Rainbow',c:'rb',s:15}];
function starTotal(){ var st=sv().stars||{}, n=0; Object.keys(st).forEach(function(k){ n+=st[k]; }); return n; }
/* ---------- loop ---------- */
/* ---------- art direction: a visual theme for every level (background, tiles, spikes, ground), designed objects, nicer player ---------- */
var TH={1:'mount',2:'city',3:'synth',4:'space',5:'circuit',6:'geo',7:'ocean',8:'city',9:'mount',10:'space',11:'geo',12:'synth',13:'circuit',14:'ocean',15:'space',16:'mount',17:'circuit',18:'synth',19:'ocean',20:'geo',21:'space',22:'circuit',23:'city',24:'synth',25:'synth',26:'space',27:'circuit',28:'ocean',29:'geo',30:'synth',31:'geo',32:'city',33:'ocean',34:'circuit',35:'synth'};
var TBLK={city:'glass',synth:'neon',space:'crystal',circuit:'circuit',geo:'crystal',ocean:'glass',mount:'metal'};
function thOf(lv){ var t=TH[lv.id]; if(t) return t; var k=['city','mount','space','circuit','geo','ocean','synth'], h=0, id=String(lv.id); for(var i=0;i<id.length;i++) h=(h*31+id.charCodeAt(i))|0; return k[Math.abs(h)%7]; }
var HXC={};
function hx(col){ var q=HXC[col]; if(q) return q; var m=/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(col); q=m?[parseInt(m[1],16),parseInt(m[2],16),parseInt(m[3],16)]:[255,255,255]; return HXC[col]=q; }
function ra(col,a){ var q=hx(col); return 'rgba('+q[0]+','+q[1]+','+q[2]+','+a+')'; }
function mixc(a,b,t){ var p=hx(a),q=hx(b); return 'rgb('+Math.round(p[0]+(q[0]-p[0])*t)+','+Math.round(p[1]+(q[1]-p[1])*t)+','+Math.round(p[2]+(q[2]-p[2])*t)+')'; }
function hh(i){ var h=Math.imul(i^0x9e3779b9,2654435761)>>>0; h=Math.imul(h^h>>>15,0x85ebca6b)>>>0; return ((h^h>>>13)>>>0)%10007/10007; }
function ridge(c,cam,sp,base,amp,f1,f2,seed,fillc,rim,alpha){ c.save(); c.globalAlpha=alpha; c.fillStyle=fillc; c.beginPath(); c.moveTo(-5,GY+2); for(var x=-5;x<=W+12;x+=12){ var wx=x+cam*sp, y=base-amp*(.55+.3*Math.sin(wx*f1+seed)+.2*Math.sin(wx*f2+seed*2.3)+.1*Math.sin(wx*f1*3.7+seed)); c.lineTo(x,y); } c.lineTo(W+12,GY+2); c.closePath(); c.fill(); if(rim){ c.globalAlpha=alpha*.9; c.strokeStyle=rim; c.lineWidth=1.5; c.stroke(); } c.restore(); }
function artBG(c,cam,lv,s,kk,th){ var t=performance.now()/1000, acc=lv.c2, i, x, y;
  if(th==='city'){ c.fillStyle='rgba(255,255,255,.5)'; for(i=0;i<26;i++){ x=((i*97-cam*.1)%900+900)%900-50; c.fillRect(x,(i*53)%260+20,2,2); }
    c.save(); c.globalAlpha=.07+.05*kk; c.fillStyle=acc; for(i=0;i<6;i++){ x=((i*230-cam*.35)%1500+1500)%1500-300; c.fillRect(x,0,26,H); } c.restore(); return; }
  if(th==='mount'){ var sx=W*.7-((cam*.02)%40), sy=105, g=c.createRadialGradient(sx,sy,6,sx,sy,150); g.addColorStop(0,ra('#ffffff',.9)); g.addColorStop(.12,ra(mixc(acc,'#ffffff',.5),.8)); g.addColorStop(.3,ra(acc,.35)); g.addColorStop(1,ra(acc,0)); c.fillStyle=g; c.fillRect(0,0,W,H); c.fillStyle=ra('#ffffff',.92); c.beginPath(); c.arc(sx,sy,34,0,6.283); c.fill();
    for(i=0;i<7;i++){ var cx=((i*210-cam*.04-t*9)%1500+1500)%1500-200, cy=50+(i*47)%120; c.save(); c.globalAlpha=.12; c.drawImage(fxGlow('#ffffff'),cx,cy,170,46); c.restore(); }
    ridge(c,cam,.05,GY-96,120,.0065,.017,1,mixc(lv.c1,acc,.35),ra('#ffffff',.25),.75); ridge(c,cam,.11,GY-52,100,.0085,.021,4,mixc(lv.c1,'#000000',.28),ra(acc,.35),.85); ridge(c,cam,.22,GY-14,78,.011,.027,9,mixc(lv.c1,'#000000',.55),ra(acc,.5),.95); return; }
  if(th==='space'){ [[.03,34,1.2,.55],[.08,22,1.8,.75],[.16,12,2.4,.95]].forEach(function(L2,li){ for(i=0;i<L2[1];i++){ x=((hh(i*7+li)*W*1.6-cam*L2[0])%(W*1.6)+W*1.6)%(W*1.6)-W*.3; y=hh(i*13+li*5)*(GY-30)+10; c.globalAlpha=L2[3]*(.6+.4*Math.sin(t*2+i*3)); c.fillStyle='#fff'; c.fillRect(x,y,L2[2],L2[2]); } }); c.globalAlpha=1;
    for(i=0;i<4;i++){ x=((i*330-cam*.05)%1400+1400)%1400-250; c.save(); c.globalAlpha=.16+.06*kk; c.drawImage(fxGlow(i%2?acc:'#ff4fd8'),x,40+(i*67)%140,420,260); c.restore(); }
    var px=((W*1.05-cam*.04)%(W+520)+(W+520))%(W+520)-260, py=125, pg=c.createRadialGradient(px-28,py-30,8,px,py,92); pg.addColorStop(0,mixc(acc,'#ffffff',.55)); pg.addColorStop(.55,acc); pg.addColorStop(1,mixc(acc,'#000000',.8)); c.save(); c.globalAlpha=.9; c.strokeStyle=ra('#ffffff',.35); c.lineWidth=5; c.beginPath(); c.ellipse(px,py,150,30,-.35,Math.PI,6.283); c.stroke(); c.fillStyle=pg; c.beginPath(); c.arc(px,py,86,0,6.283); c.fill(); c.beginPath(); c.ellipse(px,py,150,30,-.35,0,Math.PI); c.stroke(); c.restore();
    var sp=(t%7)/7; if(sp<.12){ var q=sp/.12; c.save(); c.strokeStyle='#fff'; c.globalAlpha=1-q; c.lineWidth=2; c.beginPath(); c.moveTo(W*.8-q*320,30+q*160); c.lineTo(W*.8-q*320+60,30+q*160-30); c.stroke(); c.restore(); } return; }
  if(th==='circuit'){ c.save(); c.strokeStyle=ra(acc,.2); c.fillStyle=ra(acc,.5); c.lineWidth=2; var cs=52, i0=Math.floor(cam*.3/cs)-1;
    for(i=i0;i<i0+Math.ceil(W/cs)+9;i++) for(var r=0;r<6;r++){ var h=hh(i*31+r*7); if(h<.55) continue; var len=(2+Math.floor(hh(i*5+r)*5))*cs, bx=i*cs-cam*.3, by=r*cs+22; c.beginPath(); c.moveTo(bx,by); c.lineTo(bx+len,by); var dn=hh(i*3+r*11)>.5?1:-1; c.lineTo(bx+len,by+dn*cs); c.stroke(); c.beginPath(); c.arc(bx,by,3.5,0,6.283); c.fill(); var pf=((t*(.25+h*.4)+h*3)%1); var pxx=bx+pf*(len+cs); c.save(); c.globalAlpha=.9; c.fillStyle=lv.c2; if(pf*(len+cs)<len) c.fillRect(pxx-4,by-2,8,4); else c.fillRect(bx+len-2,by+dn*(pf*(len+cs)-len)-4,4,8); c.restore(); }
    c.strokeStyle=ra(acc,.14); var i1=Math.floor(cam*.18/150)-1; for(i=i1;i<i1+Math.ceil(W/150)+3;i++){ if(hh(i*9)<.45) continue; x=i*150-cam*.18; c.strokeRect(x,70+hh(i)*120,70+hh(i*2)*40,50); c.strokeRect(x+10,80+hh(i)*120,50+hh(i*2)*40,30); } c.restore(); return; }
  if(th==='geo'){ for(i=0;i<11;i++){ var sp2=.08+(i%3)*.07, gx=((hh(i*3)*1700-cam*sp2)%1700+1700)%1700-200, gy=30+hh(i*5)*(GY-70), rad=26+hh(i*7)*54, n=3+(i%4), rot=t*(.12+hh(i)*.25)*(i%2?1:-1)+i; c.save(); c.translate(gx,gy); c.rotate(rot); c.scale(1+.08*kk,1+.08*kk); c.beginPath(); for(var k=0;k<n;k++){ var an=k/n*6.283; c.lineTo(Math.cos(an)*rad,Math.sin(an)*rad); } c.closePath(); c.fillStyle=ra(i%2?acc:'#ffffff',.06+.02*(i%3)); c.fill(); c.strokeStyle=ra(acc,.35); c.lineWidth=2; c.stroke(); c.restore(); }
    c.save(); c.globalAlpha=.06+.04*kk; c.fillStyle='#fff'; for(i=0;i<4;i++){ x=((i*300-cam*.2)%1300+1300)%1300-200; c.beginPath(); c.moveTo(x,0); c.lineTo(x+60,0); c.lineTo(x-140,GY); c.lineTo(x-200,GY); c.closePath(); c.fill(); } c.restore(); return; }
  if(th==='ocean'){ for(i=0;i<5;i++){ x=((i*260-cam*.1)%1500+1500)%1500-250+Math.sin(t*.6+i)*30; var rg=c.createLinearGradient(x,0,x-80,GY); rg.addColorStop(0,ra('#ffffff',.2)); rg.addColorStop(1,ra('#ffffff',0)); c.fillStyle=rg; c.beginPath(); c.moveTo(x,0); c.lineTo(x+70,0); c.lineTo(x-60,GY); c.lineTo(x-170,GY); c.closePath(); c.fill(); }
    c.strokeStyle=ra('#ffffff',.35); c.lineWidth=1.5; for(i=0;i<24;i++){ var hv=hh(i*3), by2=H-((t*(18+hv*30)+hv*H)%(H-20)), bx=((hv*1500-cam*.2)%1500+1500)%1500-100+Math.sin(t*1.5+i)*8; c.beginPath(); c.arc(bx,by2,2+hv*5,0,6.283); c.stroke(); }
    for(i=0;i<3;i++){ c.save(); c.globalAlpha=.22+i*.08; c.fillStyle=mixc(lv.c1,'#000000',.25+i*.2); c.beginPath(); c.moveTo(-5,GY+2); for(x=-5;x<=W+12;x+=10){ c.lineTo(x,GY-46+i*14+Math.sin((x+cam*(.15+i*.1))*.02+t*(1+i*.4)+i)*(8+i*3)); } c.lineTo(W+12,GY+2); c.closePath(); c.fill(); c.restore(); } return; }
  if(th==='synth'){ var hy=GY-8, sg=c.createLinearGradient(0,hy-190,0,hy); sg.addColorStop(0,'#ffe36a'); sg.addColorStop(.5,'#ff5fa0'); sg.addColorStop(1,mixc(acc,'#7a2bff',.6)); c.save(); c.beginPath(); c.rect(0,0,W,hy); c.clip(); c.fillStyle=sg; c.globalAlpha=.92; c.beginPath(); c.arc(W*.5,hy-30,125,0,6.283); c.fill(); c.globalAlpha=1; c.fillStyle=lv.c1; for(i=0;i<9;i++){ var by3=hy-100+i*i*1.6+i*7; c.fillRect(W*.5-130,by3,260,1.5+i*.7); } c.restore();
    c.save(); c.globalAlpha=.9; c.strokeStyle=ra('#ff7ae6',.8); c.lineWidth=2; c.shadowColor='#ff3fd0'; c.shadowBlur=10; c.beginPath(); for(x=-5;x<=W+12;x+=14){ var wx2=x+cam*.07, my=hy-14-60*(.5+.5*Math.sin(wx2*.012)*Math.cos(wx2*.005+1))*(.6+.4*Math.sin(wx2*.03)); if(x<-4) c.moveTo(x,my); else c.lineTo(x,my); } c.stroke(); c.restore();
    c.fillStyle='rgba(255,255,255,.7)'; for(i=0;i<22;i++){ x=((hh(i)*1200-cam*.03)%1200+1200)%1200-100; c.fillRect(x,hh(i*4)*130+8,1.6,1.6); } return; } }
function artGround(c,cam,lv,L,kk){ var acc=lv.c2, gg=c.createLinearGradient(0,GY,0,H); gg.addColorStop(0,mixc('#0e1320',acc,.18)); gg.addColorStop(1,'#05070c');
  L.sol.forEach(function(a){ if(a[3]<GY+390) return; var x1=Math.max(-5,a[0]-cam), x2=Math.min(W+5,a[2]-cam); if(a[2]-cam<-10||a[0]-cam>W+10) return; c.fillStyle=gg; c.fillRect(x1,GY,x2-x1,H-GY); c.fillStyle=ra('#ffffff',.07); var k0=Math.floor((x1+cam)/T); for(var k=k0;k*T-cam<x2;k++){ var sx=k*T-cam; if(sx>=x1&&sx<=x2) c.fillRect(sx,GY+8,1.5,H-GY); } c.fillStyle=ra('#ffffff',.06); c.fillRect(x1,GY+T,x2-x1,1.5); c.fillStyle=ra(acc,.12+.1*kk); c.fillRect(x1,GY+3,x2-x1,14); c.fillStyle='rgba(255,255,255,.95)'; c.fillRect(x1,GY,x2-x1,3); c.save(); c.globalAlpha=.5+.4*kk; c.shadowColor=acc; c.shadowBlur=14; c.fillStyle=acc; c.fillRect(x1,GY+3,x2-x1,3); c.restore(); if(a[0]-cam>-5){ c.fillStyle=ra(acc,.8); c.fillRect(a[0]-cam,GY,3,H-GY); } if(a[2]-cam<W+5){ c.fillStyle=ra(acc,.8); c.fillRect(a[2]-cam-3,GY,3,H-GY); } }); }
function artCeil(c,lv,kk){ var acc=lv.c2, g=c.createLinearGradient(0,0,0,41); g.addColorStop(0,'#05070c'); g.addColorStop(1,mixc('#0e1320',acc,.2)); c.fillStyle=g; c.fillRect(0,0,W,41); c.fillStyle='rgba(255,255,255,.95)'; c.fillRect(0,38,W,3); c.save(); c.globalAlpha=.5+.4*kk; c.shadowColor=acc; c.shadowBlur=14; c.fillStyle=acc; c.fillRect(0,35,W,3); c.restore(); }
function artBlocks(c,cam,lv,L,th){ var all=L.bl.concat(L.fb||[]); if(!all.length) return; var st=L._bset; if(!st||L._bn!==all.length){ st={}; all.forEach(function(b){ st[b[0]*64+b[1]]=1; }); L._bset=st; L._bn=all.length; } var acc=lv.c2, sty=TBLK[th]||'glass', vis=[];
  all.forEach(function(b){ var x=b[0]*T-cam; if(x<-T||x>W) return; var y=GY-(b[1]+1)*T, k=b[0]*64+b[1]; vis.push([x,y,b[0],b[1],!st[k+1],!st[k-1],!st[k-64],!st[k+64]]); });
  vis.forEach(function(v){ var x=v[0],y=v[1],bx=v[2],by=v[3];
    if(sty==='metal'){ c.fillStyle='#1b2233'; c.fillRect(x,y,T,T); c.fillStyle='rgba(255,255,255,.16)'; c.fillRect(x,y,T,3); c.fillRect(x,y,2,T); c.fillStyle='rgba(0,0,0,.4)'; c.fillRect(x,y+T-3,T,3); c.fillRect(x+T-2,y,2,T); c.strokeStyle='rgba(0,0,0,.4)'; c.lineWidth=1.5; c.strokeRect(x+6,y+6,T-12,T-12); c.fillStyle=ra(acc,.1); c.fillRect(x+7,y+7,T-14,T-14); c.fillStyle='rgba(255,255,255,.28)'; [[9,9],[T-9,9],[9,T-9],[T-9,T-9]].forEach(function(p){ c.beginPath(); c.arc(x+p[0],y+p[1],1.8,0,6.283); c.fill(); }); }
    else if(sty==='crystal'){ c.fillStyle='#0b0e1c'; c.fillRect(x,y,T,T); var cx=x+T/2, cy=y+T/2; [[x,y,x+T,y,.28],[x+T,y,x+T,y+T,.12],[x+T,y+T,x,y+T,.06],[x,y+T,x,y,.18]].forEach(function(f){ c.fillStyle=ra(acc,f[4]); c.beginPath(); c.moveTo(f[0],f[1]); c.lineTo(f[2],f[3]); c.lineTo(cx,cy); c.closePath(); c.fill(); }); c.strokeStyle=ra('#ffffff',.18); c.lineWidth=1; c.beginPath(); c.moveTo(x,y); c.lineTo(cx,cy); c.lineTo(x+T,y); c.moveTo(cx,cy); c.lineTo(x+T,y+T); c.moveTo(cx,cy); c.lineTo(x,y+T); c.stroke(); c.fillStyle=ra('#ffffff',.3); c.beginPath(); c.moveTo(cx,cy-6); c.lineTo(cx+6,cy); c.lineTo(cx,cy+6); c.lineTo(cx-6,cy); c.closePath(); c.fill(); }
    else if(sty==='neon'){ c.fillStyle='#05060d'; c.fillRect(x,y,T,T); c.strokeStyle=ra(acc,.6); c.lineWidth=1.5; c.strokeRect(x+4,y+4,T-8,T-8); c.strokeStyle=ra(acc,.22); c.beginPath(); c.moveTo(x+4,y+4); c.lineTo(x+T-4,y+T-4); c.moveTo(x+T-4,y+4); c.lineTo(x+4,y+T-4); c.stroke(); c.fillStyle=ra(acc,.14); c.fillRect(x+4,y+4,T-8,T-8); }
    else if(sty==='circuit'){ c.fillStyle='#071017'; c.fillRect(x,y,T,T); c.strokeStyle=ra(acc,.55); c.fillStyle=ra(acc,.7); c.lineWidth=1.5; var h=hh(bx*17+by*5), q=Math.floor(h*4); c.beginPath(); c.moveTo(x+T/2,y+T/2); if(q===0){ c.lineTo(x+T/2,y+6); c.lineTo(x+T-8,y+6); } else if(q===1){ c.lineTo(x+T-6,y+T/2); c.lineTo(x+T-6,y+T-8); } else if(q===2){ c.lineTo(x+T/2,y+T-6); c.lineTo(x+8,y+T-6); } else { c.lineTo(x+6,y+T/2); c.lineTo(x+6,y+8); } c.stroke(); c.beginPath(); c.arc(x+T/2,y+T/2,3,0,6.283); c.fill(); c.strokeStyle=ra(acc,.25); c.strokeRect(x+9,y+9,T-18,T-18); }
    else { c.fillStyle='rgba(8,12,24,.94)'; c.fillRect(x,y,T,T); c.fillStyle=ra(acc,.15); c.fillRect(x+5,y+5,T-10,T-10); c.strokeStyle=ra('#ffffff',.14); c.lineWidth=5; c.beginPath(); c.moveTo(x+9,y+T-8); c.lineTo(x+T-8,y+9); c.stroke(); c.strokeStyle=ra(acc,.3); c.lineWidth=1.2; c.strokeRect(x+5.5,y+5.5,T-11,T-11); } });
  c.save(); c.shadowColor=acc; c.shadowBlur=9; c.strokeStyle=acc; c.lineWidth=3; c.beginPath(); vis.forEach(function(v){ var x=v[0],y=v[1]; if(v[4]){ c.moveTo(x,y+1.5); c.lineTo(x+T,y+1.5); } if(v[5]){ c.moveTo(x,y+T-1.5); c.lineTo(x+T,y+T-1.5); } if(v[6]){ c.moveTo(x+1.5,y); c.lineTo(x+1.5,y+T); } if(v[7]){ c.moveTo(x+T-1.5,y); c.lineTo(x+T-1.5,y+T); } }); c.stroke(); c.restore();
  c.strokeStyle='rgba(255,255,255,.85)'; c.lineWidth=1; c.beginPath(); vis.forEach(function(v){ var x=v[0],y=v[1]; if(v[4]){ c.moveTo(x+1,y+1.5); c.lineTo(x+T-1,y+1.5); } if(v[5]){ c.moveTo(x+1,y+T-1.5); c.lineTo(x+T-1,y+T-1.5); } if(v[6]){ c.moveTo(x+1.5,y+1); c.lineTo(x+1.5,y+T-1); } if(v[7]){ c.moveTo(x+T-1.5,y+1); c.lineTo(x+T-1.5,y+T-1); } }); c.stroke(); }
function artSpikes(c,cam,lv,L,th){ var acc=lv.c2, neon=(th==='synth'||th==='ocean'); c.save();
  var one=function(x,y,dir){ var tip=y+dir*(T-4), g=c.createLinearGradient(0,tip,0,y); g.addColorStop(0,neon?'#06070e':mixc(acc,'#ffffff',.75)); g.addColorStop(.55,neon?ra(acc,.25):mixc(acc,'#10131f',.45)); g.addColorStop(1,'#080a12'); c.fillStyle=g; c.beginPath(); c.moveTo(x+3,y); c.lineTo(x+T/2,tip); c.lineTo(x+T-3,y); c.closePath(); c.fill(); c.shadowColor=acc; c.shadowBlur=10; c.strokeStyle=acc; c.lineWidth=2.5; c.stroke(); c.shadowBlur=0; c.strokeStyle='rgba(255,255,255,.9)'; c.lineWidth=1; c.stroke(); c.strokeStyle='rgba(255,255,255,.4)'; c.beginPath(); c.moveTo(x+T/2,tip+dir*4); c.lineTo(x+T/2-7,y-dir*6); c.stroke(); };
  L.sp.forEach(function(p){ var x=p[0]*T-cam; if(x<-T||x>W) return; one(x,GY-p[1]*T,-1); });
  (L.sd||[]).forEach(function(p){ var x=p[0]*T-cam; if(x<-T||x>W) return; one(x,GY-(p[1]+1)*T,1); }); c.restore(); }
function artOrb(c,x,y,col,nowp,seed,big){ var pu=1+.07*Math.sin(nowp/160+seed); c.save(); c.translate(x,y); c.globalCompositeOperation='lighter'; c.globalAlpha=.7; c.drawImage(fxGlow(col),-30,-30,60,60); c.globalCompositeOperation='source-over'; c.globalAlpha=1; c.scale(pu,pu); c.fillStyle='rgba(6,8,16,.8)'; c.beginPath(); c.arc(0,0,13,0,6.283); c.fill(); c.strokeStyle=col; c.lineWidth=3.5; c.beginPath(); c.arc(0,0,13,0,6.283); c.stroke(); c.save(); c.rotate(nowp/500); c.strokeStyle='#fff'; c.lineWidth=2; for(var i=0;i<4;i++){ c.beginPath(); c.arc(0,0,17,i*1.5708,i*1.5708+.45); c.stroke(); } c.restore(); var rg=c.createRadialGradient(0,0,0,0,0,9); rg.addColorStop(0,'#fff'); rg.addColorStop(1,col); c.fillStyle=rg; c.beginPath(); c.arc(0,0,8,0,6.283); c.fill(); c.restore(); }
function artPad(c,x,y,col,nowp){ c.save(); c.globalCompositeOperation='lighter'; c.globalAlpha=.55; c.drawImage(fxGlow(col),x+T/2-30,y-22,60,34); c.restore(); c.fillStyle='#0a0d17'; rr(c,x+3,y-8,T-6,8,3); c.fill(); c.strokeStyle=col; c.lineWidth=2; c.stroke(); c.fillStyle=col; c.fillRect(x+7,y-5,T-14,3); c.save(); c.strokeStyle=col; c.lineWidth=2; c.lineCap='round'; for(var i=0;i<2;i++){ var ph=((nowp/450+i*.5)%1); c.globalAlpha=1-ph; var yy=y-10-ph*18; c.beginPath(); c.moveTo(x+T/2-7,yy+4); c.lineTo(x+T/2,yy-3); c.lineTo(x+T/2+7,yy+4); c.stroke(); } c.restore(); }
function artPortal(c,cx,cy,rx,ry,col,nowp,label,dark){ c.save(); c.globalCompositeOperation='lighter'; c.globalAlpha=.45; c.drawImage(fxGlow(col),cx-rx*3.2,cy-ry*1.35,rx*6.4,ry*2.7); c.restore(); var g=c.createRadialGradient(cx,cy,2,cx,cy,ry); g.addColorStop(0,ra(col,.0)); g.addColorStop(.7,ra(col,.28)); g.addColorStop(1,ra(col,.55)); c.fillStyle=g; c.beginPath(); c.ellipse(cx,cy,rx,ry,0,0,6.283); c.fill(); c.strokeStyle=col; c.lineWidth=4; c.beginPath(); c.ellipse(cx,cy,rx,ry,0,0,6.283); c.stroke(); c.strokeStyle='rgba(255,255,255,.85)'; c.lineWidth=1.2; c.beginPath(); c.ellipse(cx,cy,rx+2,ry+2,0,0,6.283); c.stroke(); c.save(); c.strokeStyle=col; c.lineWidth=2; for(var k=0;k<3;k++){ var ph=((nowp/760+k/3)%1); c.globalAlpha=.8*(1-ph); c.beginPath(); c.ellipse(cx,cy,rx*(1-ph*.85),ry*(1-ph*.85),0,0,6.283); c.stroke(); } c.restore(); if(label){ c.fillStyle=dark?'#111':'#fff'; c.font='bold 9px system-ui'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(label,cx,cy); } }
function artCoin(c,x,y,nowp,i){ var w=Math.abs(Math.cos(nowp/420+i)), sh=(nowp/700+i)%1; c.save(); c.translate(x,y); c.globalCompositeOperation='lighter'; c.globalAlpha=.55; c.drawImage(fxGlow('#ffd34a'),-26,-26,52,52); c.globalCompositeOperation='source-over'; c.globalAlpha=1; var g=c.createLinearGradient(-12,-12,12,12); g.addColorStop(0,'#fff2b0'); g.addColorStop(.5,'#ffd34a'); g.addColorStop(1,'#c58a12'); c.fillStyle=g; c.strokeStyle='#8a5a00'; c.lineWidth=2; c.beginPath(); c.ellipse(0,0,3+11*w,13,0,0,6.283); c.fill(); c.stroke(); c.strokeStyle='rgba(255,255,255,.6)'; c.lineWidth=1.5; c.beginPath(); c.ellipse(0,0,1.5+7*w,8,0,0,6.283); c.stroke(); if(sh<.25){ c.fillStyle='#fff'; c.globalAlpha=1-sh*4; c.fillRect(-1,-18,2,10); c.fillRect(-5,-14,10,2); } c.restore(); }
/* ---------- visual effects: glow, bloom, shockwaves, shards, afterimages, skyline, floor grid, fireworks ---------- */
var FXG={};
function fxGlow(col){ var k=FXG[col]; if(k) return k; var cv=document.createElement('canvas'); cv.width=cv.height=64; var x=cv.getContext('2d'); x.fillStyle=col; x.fillRect(0,0,64,64); x.globalCompositeOperation='destination-in'; var g=x.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'rgba(0,0,0,1)'); g.addColorStop(.4,'rgba(0,0,0,.55)'); g.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=g; x.fillRect(0,0,64,64); return FXG[col]=cv; }
function fxS(){ return Z.fx||(Z.fx={rg:[],sh:[],gh:[],fw:[],pv:null,sq:0,ab:0,kk:0,ga:0,ft:0,slow:0}); }
function fxQ(){ var q=Z.fxq; if(q==null){ var v=sv().fxq; q=Z.fxq=(v==null?2:+v); } return q; }
function lookCol(){ var LK=LOOKS[Math.min(sv().look||0,LOOKS.length-1)]; return LK.c==='rb'?'hsl('+(Date.now()/6%360|0)+',90%,60%)':LK.c; }
function fxRing(x,y,mr,l,c,w){ fxS().rg.push({x:x,y:y,mr:mr,l:l,ml:l,c:c,w:w||3}); }
function fxSpark(x,y,n,c,v0){ for(var i=0;i<n;i++){ var a=Math.random()*6.283, v=(v0||200)*(.4+Math.random()); Z.parts.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,c:c,r:2+Math.random()*4,l:.35+Math.random()*.4}); } }
function fxDeath(s){ var F=fxS(), x=s.wx+PX+S/2, y=s.y+S/2, cols=['#ffffff',lookCol(),PAL.Y,PAL.R,PAL.B,PAL.G];
  for(var i=0;i<22;i++){ var a=Math.random()*6.283, v=140+Math.random()*520; F.sh.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-140,a:Math.random()*6.283,va:(Math.random()-.5)*16,sz:6+Math.random()*13,l:.9+Math.random()*.6,ml:1.5,c:cols[i%cols.length]}); }
  fxRing(x,y,190,.55,'#fff',6); fxRing(x,y,120,.4,lookCol(),4); fxRing(x,y,260,.7,'rgba(255,255,255,.7)',2);
  Z.flash=.6; Z.fc='#fff'; Z.shake=.6; F.ab=.5; fxSpark(x,y,30,'#fff',420); }
function fxWin(s){ var F=fxS(), cols=[PAL.Y,PAL.R,PAL.B,PAL.G,PAL.O,'#ff6ad5','#18c5ff']; for(var i=0;i<9;i++) F.fw.push({t:i*.2,x:s.wx+PX+(Math.random()-.5)*620,y:50+Math.random()*190,c:cols[i%cols.length]}); fxRing(s.wx+PX+S/2,s.y+S/2,320,.9,'#fff',6); F.ab=.3; }
function fxTick(dt){ var F=fxS(), i; F.rg.forEach(function(r){ r.l-=dt; }); F.rg=F.rg.filter(function(r){ return r.l>0; });
  F.sh.forEach(function(p){ p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=1500*dt; p.a+=p.va*dt; p.l-=dt; }); F.sh=F.sh.filter(function(p){ return p.l>0; });
  F.gh.forEach(function(p){ p.l-=dt; }); F.gh=F.gh.filter(function(p){ return p.l>0; });
  if(F.fw.length){ var rest=[]; F.fw.forEach(function(f){ f.t-=dt; if(f.t>0){ rest.push(f); return; } var cx=f.x, cy=f.y; fxRing(cx,cy,110,.6,f.c,4); for(var k=0;k<38;k++){ var a=k/38*6.283, v=130+Math.random()*190; Z.parts.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,c:k%3?f.c:'#fff',r:3+Math.random()*4,l:.9+Math.random()*.6}); } Z.flash=Math.max(Z.flash||0,.12); Z.fc=f.c; }); F.fw=rest; }
  F.sq*=Math.exp(-dt*13); if(F.ab>0) F.ab-=dt; }
/* events from the run: landing, jumping, boosts, coins, afterimages */
function fxStep(dt,s){ var F=fxS(), pv=F.pv, x=s.wx+PX+S/2, gd=s.gd||1, feet=gd>0?s.y+S:s.y, md=s.md|0, col=lookCol(), q=fxQ();
  if(pv){ if(!pv.g&&s.g){ fxRing(x,feet,48,.32,col,3); fxSpark(x,feet,6,'#fff',120); F.sq=-.17; }
    else if(pv.g&&!s.g&&(md===0||md===5)){ fxRing(x,feet,34,.26,col,2); F.sq=.2; }
    else if(!s.g&&Math.abs(s.vy-pv.vy)>520&&!(pv.g)){ fxRing(x,s.y+S/2,70,.4,'#fff',4); fxRing(x,s.y+S/2,40,.3,col,3); fxSpark(x,s.y+S/2,14,col,260); Z.flash=Math.max(Z.flash||0,.1); Z.fc=col; }
    if(s.cn!==pv.cn){ fxRing(x,s.y+S/2,90,.5,'#ffd34a',5); fxSpark(x,s.y+S/2,26,'#ffd34a',340); Z.flash=Math.max(Z.flash||0,.18); Z.fc='#ffd34a'; } }
  F.pv={g:s.g,vy:s.vy,cn:s.cn};
  F.ga+=dt; if(F.ga>(q>=1?.03:.06)){ F.ga=0; F.gh.push({x:s.wx,y:s.y,r:Z.vr==null?s.rot:Z.vr,l:.3,ml:.3,md:md,c:col}); } }
/* background: skyline layers, speed streaks, beat ring */
function fxBack(c,cam,lv,s,kk){ var q=fxQ(), F=fxS(); F.kk=kk;
  var hs=function(i){ var h=Math.imul(i^0x9e37,2654435761)>>>0; h=Math.imul(h^h>>>15,0x85ebca6b)>>>0; return (h^h>>>13)/4294967295>0?((h>>>0)%10007)/10007:0; };
  if(Z.th==='city') [[.16,90,.34,70],[.3,70,.5,120]].forEach(function(Ly,li){ var sp=Ly[0],cw=Ly[1],al=Ly[2],mh=Ly[3], i0=Math.floor(cam*sp/cw)-1, n=Math.ceil(W/cw)+3; c.save(); c.fillStyle='rgba(0,0,0,'+(al*.55).toFixed(2)+')'; c.beginPath(); var win=[]; for(var i=i0;i<i0+n;i++){ var w=cw*(.6+hs(i*3)*.35), h=40+hs(i*7+li)*mh+(li?30:0), x=i*cw-cam*sp; c.rect(x,GY-h,w,h); if(q>=1&&li===1){ for(var yy=GY-h+10;yy<GY-6;yy+=15) for(var xx=x+7;xx<x+w-8;xx+=13) if(hs(i*131+((yy|0)*17)+((xx-x)|0))>.62) win.push(xx,yy); } } c.fill(); c.globalAlpha=1; c.fillStyle=lv.c2; c.globalAlpha=.1+.12*kk; for(var k=0;k<win.length;k+=2) c.fillRect(win[k],win[k+1],5,7); c.globalAlpha=al*.5; c.fillRect(0,0,0,0); c.restore();
    c.save(); c.strokeStyle=lv.c2; c.globalAlpha=.16+.12*kk; c.lineWidth=1.5; c.beginPath(); for(var i2=i0;i2<i0+n;i2++){ var w2=cw*(.6+hs(i2*3)*.35), h2=40+hs(i2*7+li)*mh+(li?30:0), x2=i2*cw-cam*sp; c.moveTo(x2,GY-h2); c.lineTo(x2+w2,GY-h2); } c.stroke(); c.restore(); });
  /* speed streaks */
  var fast=(s.sm||1)>1?1:0, ns=q>=1?18:8; c.save(); c.globalCompositeOperation='lighter'; c.strokeStyle='#fff'; c.lineWidth=1.5; for(var i3=0;i3<ns;i3++){ var sy=(i3*61+13)%(GY-30)+10, vsp=1.1+(i3%3)*.45, sx=(((i3*211-cam*vsp)%(W+260))+(W+260))%(W+260)-130, ln=36+(i3%4)*28+fast*40; c.globalAlpha=.05+.07*(i3%3)+.08*fast; c.beginPath(); c.moveTo(sx,sy); c.lineTo(sx+ln,sy); c.stroke(); } c.restore();
  /* beat shockwave from the player */
  if(lv.bpm&&q>=1){ var bph=(((s.t||0)+(lv.bo||0))/(60/lv.bpm))%1; c.save(); c.globalCompositeOperation='lighter'; c.strokeStyle=lv.c2; c.globalAlpha=Math.pow(1-bph,2)*.22; c.lineWidth=3+6*(1-bph); c.beginPath(); c.arc(PX+S/2,s.y+S/2,24+bph*230,0,6.283); c.stroke(); c.restore(); } }
/* floor: scrolling neon grid, only under the solid ground */
function fxFloor(c,cam,lv,L){ if(fxQ()<2) return; c.save(); c.beginPath(); L.sol.forEach(function(a){ if(a[3]<GY+390) return; var x1=a[0]-cam, x2=a[2]-cam; if(x2<-10||x1>W+10) return; c.rect(Math.max(-5,x1),GY+4,Math.min(W+5,x2)-Math.max(-5,x1),H-GY); }); c.clip(); c.globalCompositeOperation='lighter'; c.strokeStyle=lv.c2; c.lineWidth=1.5; c.beginPath(); var sh=H-GY-4; for(var j=1;j<6;j++){ var t=j/6, y=GY+4+sh*t*t; c.moveTo(0,y); c.lineTo(W,y); } var cx0=W/2; for(var i=-3;i<W/54+3;i++){ var x0=i*54-((cam*.9)%54); c.moveTo(x0,GY+4); c.lineTo(cx0+(x0-cx0)*2.6,H); } c.globalAlpha=.2; c.stroke(); c.restore(); }
/* afterimages of the cube */
function fxGhosts(c,cam){ var F=fxS(); if(!F.gh.length||fxQ()<1) return; c.save(); c.globalCompositeOperation='lighter'; F.gh.forEach(function(g){ var a=g.l/g.ml; c.globalAlpha=a*.35; c.fillStyle=g.c; if(g.md===0||g.md===5||g.md===6){ c.save(); c.translate(PX+S/2-(Z.s.wx-g.x),g.y+S/2); c.rotate(g.r); c.fillRect(-S/2+3,-S/2+3,S-6,S-6); c.restore(); } else { var sp=fxGlow(g.c); c.drawImage(sp,PX+S/2-(Z.s.wx-g.x)-S*.8,g.y+S/2-S*.8,S*1.6,S*1.6); } }); c.restore(); }
/* foreground: shock rings, shards, glowing particles, vignette, bloom */
function fxFront(c,cam,lv){ var F=fxS(), q=fxQ(); c.save(); c.globalCompositeOperation='lighter';
  F.rg.forEach(function(r){ var t=1-r.l/r.ml, rad=r.mr*(1-Math.pow(1-t,2.2)); c.globalAlpha=Math.max(0,r.l/r.ml)*.9; c.strokeStyle=r.c; c.lineWidth=Math.max(.5,r.w*(1-t*.8)); c.beginPath(); if(r.y>=GY-2&&r.mr<60) c.ellipse(r.x-cam,r.y,rad*1.4,rad*.28,0,0,6.283); else c.arc(r.x-cam,r.y,rad,0,6.283); c.stroke(); });
  F.sh.forEach(function(p){ c.globalAlpha=Math.max(0,Math.min(1,p.l/p.ml*1.4)); c.fillStyle=p.c; c.save(); c.translate(p.x-cam,p.y); c.rotate(p.a); c.fillRect(-p.sz/2,-p.sz/2,p.sz,p.sz); c.restore(); if(q>=1){ c.globalAlpha*=.4; c.drawImage(fxGlow(p.c),p.x-cam-p.sz,p.y-p.sz,p.sz*2,p.sz*2); } });
  if(q>=1) Z.parts.forEach(function(p){ if(p.r<3) return; c.globalAlpha=Math.max(0,Math.min(1,p.l*1.2))*.45; c.drawImage(fxGlow(p.c),p.x-cam-p.r*2.2,p.y-p.r*2.2,p.r*4.4,p.r*4.4); });
  c.restore();
  if(q>=1){ var vg=Z.vg; if(!vg){ vg=Z.vg=document.createElement('canvas'); vg.width=256; vg.height=128; var x=vg.getContext('2d'), g=x.createRadialGradient(128,64,36,128,64,150); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.6)'); x.fillStyle=g; x.fillRect(0,0,256,128); } c.drawImage(vg,0,0,W,H); }
  if(q>=2&&Z.cv){ var bw=Math.max(8,Z.cv.width>>2), bh=Math.max(8,Z.cv.height>>2), bc=Z.bc; if(!bc||bc.width!==bw||bc.height!==bh){ bc=Z.bc=document.createElement('canvas'); bc.width=bw; bc.height=bh; Z.bx=bc.getContext('2d'); } var bx=Z.bx; bx.imageSmoothingEnabled=true; bx.imageSmoothingQuality='high'; bx.globalCompositeOperation='copy'; bx.drawImage(Z.cv,0,0,bw,bh); c.save(); c.globalCompositeOperation='screen'; c.globalAlpha=.2+.18*F.kk; c.imageSmoothingEnabled=true; c.imageSmoothingQuality='high'; c.drawImage(bc,0,0,W,H); c.restore(); } }
function burst(s){ var x=s.wx+PX+S/2, y=s.y+S/2, cols=Object.keys(PAL).map(function(k){ return PAL[k]; }); for(var i=0;i<26;i++){ var a=Math.random()*6.283, v=120+Math.random()*420; Z.parts.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-120,c:cols[i%6],r:3+Math.random()*7,l:.8+Math.random()*.5}); } }
function die(){ var s=Z.s; songStop(); sfx('d'); burst(s); fxDeath(s); var p=pct(s); ghSave(p); Z.best=Math.max(Z.best,p); var d=sv(); if(!Z.prac&&!Z.lv.custom&&p>(d.best[Z.lv.id]||0)){ d.best[Z.lv.id]=p; CW.setJ('cw_dash',d); } Z.mode='dead'; Z.dead=.75; Z.shake=.4; }
function confetti(){ var s=Z.s, cols=Object.keys(PAL).map(function(k){ return PAL[k]; }); for(var i=0;i<90;i++) Z.parts.push({x:s.wx+PX+(Math.random()-.5)*700,y:-20-Math.random()*160,vx:(Math.random()-.5)*160,vy:Math.random()*120,c:cols[i%6],r:4+Math.random()*6,l:1.4+Math.random()*1.2}); }
function dayKey(o){ var t=new Date(Date.now()+8*3600000-(o||0)*86400000); return t.getUTCFullYear()*10000+(t.getUTCMonth()+1)*100+t.getUTCDate(); }  /* Malaysia day, the same for everyone and the same as the server's board */
function dailyLevel(day,k){ var h=(day*47)%360; return {id:'daily'+day,name:'Daily Dash',tag:'Same level for everyone today',speed:440+(day%5)*20,seed:day*31+k,n:52+(day%4)*6,gap:[4,7],pool:['sp2','sp3','dbl','trp','pit3','stair','tower','hop','flip','flip2','orb','pad','padp','fake','ghost'],c1:'hsl('+h+',55%,20%)',c2:'hsl('+((h+60)%360)+',85%,55%)',reward:100,lead:18,bpm:132+(day%4)*4,notes:[0,5,7,5,0,3,7,3],daily:1}; }
/* Update 7: a brand-new level every week, the same for everyone (first seed the game's own checker can finish) */
function weeklyLevel(w,k){ var h=(w*83)%360; return {id:'wk'+w,name:'Weekly Dash',tag:'New level this week',speed:450+(w%4)*20,seed:w*131+k,n:58+(w%3)*6,gap:[4,6],pool:['sp2','sp3','dbl','trp','pit3','stair','tower','hop','flip','flip2','orb','pad','padp','fake','ghost','sawf','sawr','pulse','laser','sawpit'],c1:'hsl('+h+',60%,16%)',c2:'hsl('+((h+140)%360)+',90%,58%)',reward:0,lead:18,bpm:136+(w%3)*6,notes:[0,7,3,7,5,10,7,3],weekly:1}; }
function weeklyFind(w,cb){ var c=CW.lsJ('cw_dash_wk2',null); if(c&&c.w===w){ cb(weeklyLevel(w,c.k)); return; } var k=0; (function nx(){ var lv=weeklyLevel(w,k); D.verify(D.build(lv),function(ok){ if(ok){ CW.setJ('cw_dash_wk2',{w:w,k:k}); cb(lv); } else if(++k<80) nx(); else cb(null); }); })(); }
function dailyFind(cb){ var day=dayKey(), c=CW.lsJ('cw_dash_daily2',null); if(c&&c.d===day){ cb(dailyLevel(day,c.k)); return; } var k=0; (function nx(){ var lv=dailyLevel(day,k); D.verify(D.build(lv),function(ok){ if(ok){ CW.setJ('cw_dash_daily2',{d:day,k:k}); cb(lv); } else if(++k<80) nx(); else cb(null); }); })(); }
function winDaily(){ var d=sv(), day=dayKey(), yk=dayKey(1), dy=d.daily||{d:0,streak:0}, amt=0;
  if(!Z.prac&&PL.api&&PL.updOn&&PL.updOn()) PL.api('/api/u/dd',{act:'send',a:Z.att});
  if(!Z.prac&&dy.d!==day){ dy={d:day,streak:dy.d===yk?dy.streak+1:1}; d.daily=dy; try{ amt=PL.award(100+10*Math.min(dy.streak-1,9)); }catch(e){} CW.setJ('cw_dash',d); }
  msg('Daily Dash complete! 🎉',(Z.prac?'Practice run. Switch practice off to earn tokens.':amt?'+'+amt+' tokens · streak '+dy.streak+' day'+(dy.streak===1?'':'s'):'Already cleared today')+' · '+Z.att+' attempt'+(Z.att===1?'':'s')+'<span class="ds-acts"><button class="btn sm pri" id="dsAg" type="button">Play again</button><button class="btn sm" id="dsMn" type="button">Levels</button></span>');
  setTimeout(function(){ var a=$('#dsAg'),l=$('#dsMn'); if(a) a.onpointerdown=function(e){ e.stopPropagation(); Z.att=0; Z.cp=null; restart(); }; if(l) l.onpointerdown=function(e){ e.stopPropagation(); Z.back(); }; },0); }
function win(){ try{ if(Z.day&&PL.dashDayWin) PL.dashDayWin(Z.lv); }catch(e){} try{ if(Z.lv&&Z.lv.comm&&PL.dashCommWin) PL.dashCommWin(Z.lv.comm); }catch(e){} sfx('w'); songStop(true); fxWin(Z.s); Z.mode='win'; try{ if(!Z.prac&&!Z.lv.custom&&Z.wk===Z.lv.id&&PL.api&&PL.updOn&&PL.updOn()&&Z.rec&&Z.rec.length&&!Z.xg) PL.api('/api/u/wb',{act:'send',n:Z.si,a:Z.att,rec:Z.rec}); }catch(e){} ghSave(100); confetti(); if(Z.lv.custom){ if(Z.edit) Z.edit.ok=Z.edit.key(); msg('Level complete!',(Z.edit?'It can be finished, so you can share it now.':'Nice run.')+'<span class="ds-acts"><button class="btn sm pri" id="dsAg" type="button">Play again</button><button class="btn sm" id="dsMn" type="button">'+(Z.edit?'Back to editor':'Levels')+'</button></span>'); setTimeout(function(){ var a=$('#dsAg'),l=$('#dsMn'); if(a) a.onpointerdown=function(e){ e.stopPropagation(); Z.att=0; Z.cp=null; restart(); }; if(l) l.onpointerdown=function(e){ e.stopPropagation(); Z.back(); }; },0); return; }
  if(Z.lv.daily) return winDaily();
  var d=sv(), id=Z.lv.id, first=!d.done[id], amt=0, ns=1+(Z.prac?0:(Z.att<=10?1:0)+(Z.att<=3?1:0)), bonus=0; d.stars=d.stars||{};
  if(!Z.prac){ d.coins=d.coins||{}; d.coins[id]=(d.coins[id]|0)|(Z.s.cn|0); d.best[id]=100; if(first){ d.done[id]=1; try{ amt=PL.award(Z.lv.reward); }catch(e){} } var os=d.stars[id]||0; if(ns>os){ d.stars[id]=ns; if(os>0||ns>1){ try{ bonus=PL.award(25*(ns-Math.max(os,1))); }catch(e){} } } CW.setJ('cw_dash',d); }
  var next=D.LEVELS[Z.lv.id]; if(next&&next.upd&&!gateOK(next)) next=null;
  var ncn=0; for(var cb=0;cb<3;cb++) if((Z.s.cn|0)&(1<<cb)) ncn++;
  msg('Level complete!',(Z.prac?'Practice run. Switch practice off to earn tokens.':(amt?'+'+amt+' tokens':'Already cleared')+(bonus?' · +'+bonus+' star bonus':''))+' · '+['★☆☆','★★☆','★★★'][ns-1]+(Z.L.cn&&Z.L.cn.length?' · '+ncn+'/'+Z.L.cn.length+' coins':'')+' · '+Z.att+' attempt'+(Z.att===1?'':'s')+'<span class="ds-acts"><button class="btn sm pri" id="dsAg" type="button">Play again</button>'+(next?'<button class="btn sm" id="dsNx" type="button">Next level</button>':'')+'<button class="btn sm" id="dsMn" type="button">Levels</button></span>');
  var m=$('#dsMsg'); m.onpointerdown=null;
  setTimeout(function(){ var a=$('#dsAg'),n=$('#dsNx'),l=$('#dsMn'); if(a) a.onpointerdown=function(e){ e.stopPropagation(); Z.att=0; Z.cp=null; restart(); }; if(n) n.onpointerdown=function(e){ e.stopPropagation(); play(Z.root,Z.lv.id); }; if(l) l.onpointerdown=function(e){ e.stopPropagation(); menu(Z.root); }; },0); }
function loop(now){ if(!Z.cv||!document.body.contains(Z.cv)){ stopLoop(); return; } Z.raf=requestAnimationFrame(loop);
  var dt=Math.min(.05,(now-Z.last)/1000); Z.last=now;
  if(Z.mode==='play'){ Z.acc+=dt; var r='';
    if(Z.prac&&Z.pspd&&Z.pspd<1){ Z.acc-=dt*(1-Z.pspd); if(Z.acc<0) Z.acc=0; }
    while(Z.acc>=D.DT&&!r){ Z.acc-=D.DT; if(!Z.prac){ var hd=Z.hold&&!Z.skip; if(!!hd!==!!Z.lastH){ Z.rec.push([Z.si,hd?1:0]); Z.lastH=hd; } ghostStep(); } Z.si++; r=D.step(Z.s,Z.hold&&!Z.skip,D.DT); if(Z.s.sfx){ sfx(Z.s.sfx); Z.s.sfx=''; } if(Z.s.tele){ Z.s.tele=0; Z.trail=[]; for(var q=0;q<14;q++){ var an=Math.random()*6.283; Z.parts.push({x:Z.s.wx+PX+S/2,y:Z.s.y+S/2,vx:Math.cos(an)*200,vy:Math.sin(an)*200,c:'#18c5ff',r:4+Math.random()*4,l:.5}); } } }
    if(Z.acc>D.DT) Z.acc=0;
    var sp0=Z.s; if(sp0.pmd){ var pm=sp0.pmd-1; sp0.pmd=0; var MC2=['#5ad0ff','#ffb21e','#ff6ad5','#35e08a','#ff8a3d','#b36bff','#ffffff']; Z.flash=.4; Z.fc=MC2[pm]; for(var q2=0;q2<26;q2++){ var an2=Math.random()*6.283; Z.parts.push({x:sp0.wx+PX+S/2,y:sp0.y+S/2,vx:Math.cos(an2)*260,vy:Math.sin(an2)*260,c:MC2[pm],r:4+Math.random()*4,l:.55}); } var HT=['Cube: tap to jump','Ship: hold to fly up, let go to sink','Ball: tap to flip gravity','UFO: tap to hop','Wave: hold to go up, let go to go down','Robot: hold to jump higher','Spider: tap to switch sides'][pm]; if(!Z.seenM) Z.seenM={}; if(!Z.seenM[pm]&&pm>0){ Z.seenM[pm]=1; Z.hint={x:HT,t:2.4}; } }
    if(r==='dead') die(); else if(r==='win') win();
    else { var s=Z.s; var mdp=s.md|0; if(mdp===1&&Math.random()<.9) Z.parts.push({x:s.wx+PX-8,y:s.y+S/2+8+Math.random()*6,vx:-120,vy:20+Math.random()*30,c:Math.random()<.5?'#ffb21e':'#ff5a2a',r:3+Math.random()*4,l:.3}); else if(mdp===2&&s.g) Z.parts.push({x:s.wx+PX+S/2,y:(s.gd>0?s.y+S:s.y),vx:-60,vy:(s.gd>0?-90:90)*Math.random(),c:'#ffd34a',r:2+Math.random()*3,l:.25}); else if(mdp===3&&Math.random()<.4) Z.parts.push({x:s.wx+PX+S/2,y:s.y+S,vx:-30,vy:60,c:'#ff6ad5',r:3,l:.3}); else if((mdp===5||mdp===6)&&s.g&&Math.random()<.5) Z.parts.push({x:s.wx+PX+S/2,y:(s.gd>0?s.y+S:s.y),vx:-80,vy:-40*Math.random()*(s.gd>0?1:-1),c:'#fff',r:2+Math.random()*2,l:.25}); var wv=(s.md|0)===4; Z.trail.push({x:s.wx+PX,y:s.y,l:wv?.7:.25}); if(Z.trail.length>(wv?44:12)) Z.trail.shift();
      if(Z.prac&&(s.g||(s.md|0)>0)&&(!Z.cp||s.wx-Z.cp.wx>900)) Z.cp={wx:s.wx,y:s.y,vy:0,t:s.t,md:s.md|0,gd:s.gd,sm:s.sm};
      fxStep(dt,s); var p=pct(s); var e=$('#dsPc'); if(e) e.textContent=p+'%'; music(); } }
  else if(Z.mode==='dead'){ Z.dead-=dt; if(Z.dead<=0) restart(); }
  fxTick(dt); if(Z.flash>0) Z.flash-=dt*1.6; if(Z.hint&&Z.hint.t>0) Z.hint.t-=dt;
  Z.parts.forEach(function(p){ p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=1400*dt; p.l-=dt; }); Z.parts=Z.parts.filter(function(p){ return p.l>0; });
  Z.trail.forEach(function(t){ t.l-=dt; }); Z.trail=Z.trail.filter(function(t){ return t.l>0; });
  if(Z.cv){ var F2=fxS(), q2=fxQ(), tr=''; if(Z.shake>0){ Z.shake-=dt; var q=Math.max(0,Z.shake)*40; tr='translate('+((Math.random()-.5)*q).toFixed(1)+'px,'+((Math.random()-.5)*q).toFixed(1)+'px)'; } if(q2>=1&&Z.mode==='play'&&F2.kk>.02) tr+=' scale('+(1+.014*F2.kk).toFixed(4)+')'; Z.cv.style.transform=tr; var abn=F2.ab>0&&q2>=1?(F2.ab*10).toFixed(1):0; Z.cv.style.filter=abn?'drop-shadow('+abn+'px 0 0 rgba(255,40,90,.55)) drop-shadow(-'+abn+'px 0 0 rgba(30,220,255,.55))':''; }
  draw(); }

/* ---------- drawing ---------- */
function drawCube(c,x,y,rot,size){ c.save(); c.translate(x+size/2,y+size/2); c.rotate(rot); var h=size/2, lc=lookCol(); c.save(); c.shadowColor=lc; c.shadowBlur=12; c.fillStyle='#0b0e17'; rr(c,-h-1,-h-1,size+2,size+2,8); c.fill(); c.restore();
  var bg=c.createLinearGradient(-h,-h,h,h); bg.addColorStop(0,'#ffffff'); bg.addColorStop(1,'#cfd5e2'); c.fillStyle=bg; rr(c,-h,-h,size,size,7); c.fill(); c.strokeStyle='#0b0e17'; c.lineWidth=2.5; c.stroke(); c.strokeStyle=lc; c.lineWidth=1.5; rr(c,-h+1.5,-h+1.5,size-3,size-3,6); c.stroke();
  var g=(size-9)/3, cols=['W','Y','R','O','G','B','R','G','Y']; for(var i=0;i<9;i++){ var sx=-h+4.5+(i%3)*g+1, sy=-h+4.5+Math.floor(i/3)*g+1, sw=g-2; c.fillStyle=PAL[cols[i]]; rr(c,sx,sy,sw,sw,2); c.fill(); c.fillStyle='rgba(255,255,255,.35)'; c.fillRect(sx+1,sy+1,sw-2,2); c.fillStyle='rgba(0,0,0,.18)'; c.fillRect(sx+1,sy+sw-2.5,sw-2,1.5); } c.restore(); }
function drawMode(c,s,vr){ var md=s.md|0, cx=PX+S/2, cy=s.y+S/2, up=(s.gd||1)<0, nw=performance.now(), lc=lookCol();
  c.save(); c.translate(cx,cy);
  var body=function(x0,y0,x1,y1){ var g=c.createLinearGradient(x0,y0,x1,y1); g.addColorStop(0,'#ffffff'); g.addColorStop(.45,mixc(lc,'#ffffff',.55)); g.addColorStop(1,mixc(lc,'#000000',.35)); return g; };
  var glow=function(col,r){ c.save(); c.globalCompositeOperation='lighter'; c.globalAlpha=.55; c.drawImage(fxGlow(col),-r,-r,r*2,r*2); c.restore(); };
  if(md===1){ c.rotate(vr); if(up) c.scale(1,-1); var fl=.7+.3*Math.sin(nw/45); c.save(); c.globalCompositeOperation='lighter'; var fg=c.createLinearGradient(-26,0,-52*fl-8,0); fg.addColorStop(0,'rgba(255,255,255,.95)'); fg.addColorStop(.3,'rgba(255,190,60,.8)'); fg.addColorStop(1,'rgba(255,60,20,0)'); c.fillStyle=fg; c.beginPath(); c.moveTo(-24,6); c.lineTo(-52*fl-8,10); c.lineTo(-24,16); c.closePath(); c.fill(); c.restore(); glow(lc,40);
    c.fillStyle=body(0,-6,0,16); c.strokeStyle='#0b0e17'; c.lineWidth=2.5; c.beginPath(); c.moveTo(-26,6); c.lineTo(-16,-2); c.lineTo(6,-3); c.lineTo(30,5); c.lineTo(22,14); c.lineTo(-20,15); c.closePath(); c.fill(); c.stroke(); c.fillStyle=mixc(lc,'#000000',.2); c.beginPath(); c.moveTo(-8,14); c.lineTo(-18,24); c.lineTo(10,14); c.closePath(); c.fill(); c.stroke(); c.fillStyle='rgba(255,255,255,.55)'; c.beginPath(); c.moveTo(-12,0); c.lineTo(8,-1); c.lineTo(22,5); c.lineTo(-10,6); c.closePath(); c.fill(); c.save(); c.translate(2,-8); c.scale(.55,.55); drawCube(c,-S/2,-S/2,0,S); c.restore(); }
  else if(md===2){ glow(lc,38); c.rotate(vr); var bg=c.createRadialGradient(-6,-6,2,0,0,19); bg.addColorStop(0,'#ffffff'); bg.addColorStop(.6,mixc(lc,'#ffffff',.5)); bg.addColorStop(1,mixc(lc,'#000000',.4)); c.fillStyle=bg; c.strokeStyle='#0b0e17'; c.lineWidth=2.5; c.beginPath(); c.arc(0,0,18,0,6.283); c.fill(); c.stroke(); c.fillStyle=lc; for(var i=0;i<4;i++){ c.beginPath(); c.moveTo(0,0); c.arc(0,0,14.5,i*1.5708+.1,i*1.5708+.75); c.closePath(); c.fill(); } c.fillStyle='#0b0e17'; c.beginPath(); c.arc(0,0,4.5,0,6.283); c.fill(); c.fillStyle='rgba(255,255,255,.7)'; c.beginPath(); c.arc(-7,-8,3,0,6.283); c.fill(); }
  else if(md===3){ if(up) c.scale(1,-1); glow(lc,40); var sg=c.createLinearGradient(0,-2,0,16); sg.addColorStop(0,'#ffffff'); sg.addColorStop(.5,mixc(lc,'#ffffff',.4)); sg.addColorStop(1,mixc(lc,'#000000',.45)); c.fillStyle=sg; c.strokeStyle='#0b0e17'; c.lineWidth=2.5; c.beginPath(); c.ellipse(0,7,25,9,0,0,6.283); c.fill(); c.stroke(); c.save(); c.translate(0,-5); c.scale(.55,.55); drawCube(c,-S/2,-S/2,0,S); c.restore(); c.save(); c.globalAlpha=.4; c.fillStyle='#9fe8ff'; c.beginPath(); c.ellipse(0,-1,15,13,0,Math.PI,6.283); c.fill(); c.restore(); [-15,-5,5,15].forEach(function(dx,k){ c.fillStyle=((Math.floor(nw/120)+k)%2)?'#fff':lc; c.beginPath(); c.arc(dx,8,2.2,0,6.283); c.fill(); }); }
  else if(md===4){ c.rotate(vr); glow(lc,34); c.save(); c.globalCompositeOperation='lighter'; c.fillStyle=ra(lc,.5); c.beginPath(); c.moveTo(-10,-5); c.lineTo(-30,0); c.lineTo(-10,5); c.closePath(); c.fill(); c.restore(); c.fillStyle=body(-12,-11,14,11); c.strokeStyle='#0b0e17'; c.lineWidth=2.5; c.beginPath(); c.moveTo(16,0); c.lineTo(-12,-12); c.lineTo(-5,0); c.lineTo(-12,12); c.closePath(); c.fill(); c.stroke(); c.fillStyle=lc; c.beginPath(); c.moveTo(9,0); c.lineTo(-6,-6); c.lineTo(-3,0); c.lineTo(-6,6); c.closePath(); c.fill(); }
  else { if(up) c.scale(1,-1); glow(lc,40); var ph=Math.sin(nw/70)*5; c.strokeStyle='#0b0e17'; c.lineWidth=4.5; c.lineCap='round'; if(md===5){ c.beginPath(); c.moveTo(-8,14); c.lineTo(-8+ph,25); c.moveTo(8,14); c.lineTo(8-ph,25); c.stroke(); c.strokeStyle=lc; c.lineWidth=2; c.beginPath(); c.moveTo(-8,14); c.lineTo(-8+ph,25); c.moveTo(8,14); c.lineTo(8-ph,25); c.stroke(); } else { for(var k=-1;k<=1;k+=2){ c.strokeStyle='#0b0e17'; c.lineWidth=4.5; c.beginPath(); c.moveTo(k*14,8); c.lineTo(k*27,16+ph*k*.4); c.lineTo(k*25,27); c.moveTo(k*14,12); c.lineTo(k*29,24-ph*k*.3); c.stroke(); c.strokeStyle=lc; c.lineWidth=2; c.stroke(); } } c.lineCap='butt'; c.save(); c.translate(0,-2); c.scale(.82,.82); drawCube(c,-S/2,-S/2,0,S); c.fillStyle='#fff'; c.strokeStyle='#0b0e17'; c.lineWidth=1.5; [-6,6].forEach(function(ex){ c.beginPath(); c.arc(ex,-3,3.5,0,6.283); c.fill(); c.stroke(); c.fillStyle='#0b0e17'; c.beginPath(); c.arc(ex+1,-3,1.5,0,6.283); c.fill(); c.fillStyle='#fff'; }); c.restore(); }
  c.restore(); }
function rr(c,x,y,w,h,r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
/* boss levels: the boss hovers on the right, throwing the hazards you meet; its health drops as you get through the level */
function drawBoss(c,lv,s,kk){ var B=lv.boss, L=Z.L, pr=Math.max(0,Math.min(1,s.wx/Math.max(1,L.end-PX-T*4))), hp=1-pr, t=s.t||0, dead=Z.mode==='win', bx=W-92+Math.sin(t*1.3)*8, by=150+Math.sin(t*2.1)*14+(dead?Math.min(260,(performance.now()-(Z.bdT||(Z.bdT=performance.now())))*.35):0);
  if(!dead) Z.bdT=0; c.save(); c.globalAlpha=dead?Math.max(0,1-(by-150)/260):1;
  var gl=c.createRadialGradient(bx,by,10,bx,by,95); gl.addColorStop(0,B.c+'66'); gl.addColorStop(1,B.c+'00'); c.fillStyle=gl; c.fillRect(bx-100,by-100,200,200);
  c.translate(bx,by); c.rotate(Math.sin(t*1.7)*.06); var sz=62+kk*6; c.fillStyle='#0c0f16'; c.strokeStyle=B.c; c.lineWidth=4; rr(c,-sz/2,-sz/2,sz,sz,14); c.fill(); c.stroke();
  for(var q=0;q<4;q++){ c.save(); c.rotate(q*Math.PI/2+t*.6); c.fillStyle=B.c; c.beginPath(); c.moveTo(sz/2+2,-9); c.lineTo(sz/2+18,0); c.lineTo(sz/2+2,9); c.closePath(); c.fill(); c.restore(); }
  var ey=-6, blink=(t%3.2)<.12; c.fillStyle='#fff'; [-13,13].forEach(function(ex){ c.beginPath(); c.ellipse(ex,ey,8,blink?1.5:8,0,0,6.283); c.fill(); if(!blink){ c.fillStyle=B.c; c.beginPath(); c.arc(ex-3,ey+1,4,0,6.283); c.fill(); c.fillStyle='#fff'; } });
  var mo=4+kk*10; c.fillStyle='#000'; rr(c,-16,12,32,mo,4); c.fill(); c.fillStyle='#fff'; for(var tq=0;tq<4;tq++) c.fillRect(-14+tq*8,12,5,Math.min(5,mo));
  c.restore(); c.save();
  var hw=150, hx=W-hw-22, hy=34; c.fillStyle='rgba(6,8,16,.7)'; rr(c,hx-4,hy-4,hw+8,26,8); c.fill(); c.fillStyle='rgba(255,255,255,.15)'; rr(c,hx,hy+10,hw,8,4); c.fill(); c.fillStyle=B.c; rr(c,hx,hy+10,Math.max(4,hw*hp),8,4); c.fill();
  c.fillStyle='#fff'; c.font='800 11px system-ui'; c.textAlign='left'; c.textBaseline='middle'; c.fillText('👹 '+B.n,hx,hy+2); c.restore(); }
function draw(){ var c=Z.cx, L=Z.L, lv=Z.lv, s=Z.s; if(!c||!s) return; c.setTransform(Z.sc,0,0,Z.sc,0,0);
  var g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,mixc(lv.c1,'#000000',.15)); g.addColorStop(1,mixc(lv.c2,'#000000',.42)); c.fillStyle=g; c.fillRect(0,0,W,H);
  var cam=s.wx; /* world x at screen x=PX is player; screen x = world - cam */
  var kk=0; if(lv.bpm){ var bph=(((s.t||0)+(lv.bo||0))/(60/lv.bpm))%1; kk=Math.pow(1-bph,4); var pu=.05*kk; if(pu>.004){ c.fillStyle='rgba(255,255,255,'+pu.toFixed(3)+')'; c.fillRect(0,0,W,H); } }
  var mdv=s.md|0, tint=['','#18c5ff','#ff6ad5','#35e08a','#35e08a','#ffa31f','#b36bff'][mdv]; if(tint){ c.save(); c.globalAlpha=.1+.05*kk; c.fillStyle=tint; c.fillRect(0,0,W,H); c.restore(); }
  var th=Z.th=thOf(lv); artBG(c,cam,lv,s,kk,th);
  fxBack(c,cam,lv,s,kk); if(lv.boss&&Z.mode!=='edit') drawBoss(c,lv,s,kk);
  artGround(c,cam,lv,L,kk);
  fxFloor(c,cam,lv,L);
  /* ceiling */
  if(L.ceil) artCeil(c,lv,kk);
  /* blocks (fake blocks look exactly the same) */
  artBlocks(c,cam,lv,L,th); artSpikes(c,cam,lv,L,th);
  /* invisible blocks: shown only in the editor */
  if(Z.mode==='edit'){ c.save(); c.setLineDash([5,4]); c.strokeStyle='rgba(255,255,255,.75)'; c.lineWidth=2; (L.ib||[]).forEach(function(b){ var x=b[0]*T-cam; if(x<-T||x>W) return; c.strokeRect(x+2,GY-(b[1]+1)*T+2,T-4,T-4); c.fillStyle='rgba(255,255,255,.12)'; c.fillRect(x+2,GY-(b[1]+1)*T+2,T-4,T-4); }); c.restore(); }
  /* orbs */
  (L.or||[]).forEach(function(p){ var x=p[0]*T-cam; if(x<-T||x>W) return; artOrb(c,x+T/2,GY-(p[1]+1)*T+T/2,'#ffd500',performance.now(),p[0]); });
  /* portals */
  (L.po||[]).forEach(function(p){ var x=p[0]*T-cam; if(x<-T||x>W) return; var y=GY-(p[1]+3)*T, ty=p[2], col=['#2d6df6','#ff3fa4','#2fbf71','#ffd500','#ffffff'][ty]; artPortal(c,x+T/2,y+1.5*T,11,1.5*T,col,performance.now(),['↓','↑','«','»','•'][ty],ty===4); });
  /* teleports: orange in, blue out */
  (L.tp||[]).forEach(function(p){ [[p[0],p[1],'#ff7a1a','⇢'],[p[2],p[3],'#18c5ff','⇠']].forEach(function(q){ var x=q[0]*T-cam; if(x<-T||x>W) return; var y=GY-(q[1]+3)*T; c.save(); c.fillStyle=q[2]; c.globalAlpha=.22; c.beginPath(); c.ellipse(x+T/2,y+1.5*T,12,1.5*T,0,0,6.283); c.fill(); c.globalAlpha=1; c.strokeStyle=q[2]; c.lineWidth=4; c.setLineDash([9,5]); c.lineDashOffset=-performance.now()/60; c.beginPath(); c.ellipse(x+T/2,y+1.5*T,12,1.5*T,0,0,6.283); c.stroke(); c.setLineDash([]); c.fillStyle=q[2]; c.font='bold 22px sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(q[3],x+T/2,y+1.5*T); c.restore(); }); });
  /* pads */
  L.pd.forEach(function(p){ var x=p[0]*T-cam; if(x<-T||x>W) return; artPad(c,x,GY-p[1]*T,'#ffd500',performance.now()); });
  /* Geometry Dash style pieces: typed pads, orbs, game-mode portals and coins */
  var OC=['#ff5fb7','#ff3b3b','#2d9bff','#2fe08c','#1a1a1a'], PC=['#ff5fb7','#ff3b3b','#2d9bff'], MC=['#5ad0ff','#ffb21e','#ff6ad5','#35e08a','#ff8a3d','#b36bff','#ffffff'], MN=['CUBE','SHIP','BALL','UFO','WAVE','ROBOT','SPIDER'], nowp=performance.now();
  (L.p2||[]).forEach(function(p){ var x=p[0]*T-cam; if(x<-T||x>W) return; artPad(c,x,GY-p[1]*T,PC[p[2]-30],nowp); });
  (L.o2||[]).forEach(function(p){ var x=p[0]*T-cam; if(x<-T||x>W) return; artOrb(c,x+T/2,GY-(p[1]+1)*T+T/2,OC[p[2]-20],nowp,p[0]); });
  (L.mo||[]).forEach(function(p){ var x=p[0]*T-cam; if(x<-T||x>W) return; var y=GY-(p[1]+3)*T, ty=p[2]-10; artPortal(c,x+T/2,y+1.5*T,13,1.5*T,MC[ty],nowp,MN[ty],ty===6); });
  (L.cn||[]).forEach(function(p,i){ if((s.cn||0)&(1<<i)) return; var x=p[0]*T-cam+T/2; if(x<-T||x>W+T) return; artCoin(c,x,GY-(p[1]+1)*T+T/2+Math.sin(nowp/280+i)*2,nowp,i); });
  /* new hazards + power-ups */
  var tt=s.t||0, gear=function(cx,cy){ c.save(); c.translate(cx,cy); c.rotate(performance.now()/120); c.fillStyle='#0c0f16'; c.strokeStyle='#fff'; c.lineWidth=2; c.beginPath(); for(var q=0;q<16;q++){ var rr2=q%2?12:19, an=q*Math.PI/8; c.lineTo(Math.cos(an)*rr2,Math.sin(an)*rr2); } c.closePath(); c.fill(); c.stroke(); c.fillStyle='#ff3b3b'; c.beginPath(); c.arc(0,0,4,0,6.283); c.fill(); c.restore(); };
  (L.sw||[]).forEach(function(p){ var x=p[0]*T+T/2-cam; if(x<-40||x>W+40) return; c.strokeStyle='rgba(255,255,255,.25)'; c.lineWidth=2; c.beginPath(); c.moveTo(x,GY-T*3.1); c.lineTo(x,GY-T*1.1); c.stroke(); gear(x,GY-T*(2.1+Math.sin(tt*2.6+p[2]))); });
  (L.rs||[]).forEach(function(p){ var x=(p[0]+1.5+1.5*Math.sin(tt*1.8+p[1]))*T-cam; if(x<-40||x>W+40) return; gear(x,GY-17); });
  (L.lzr||[]).forEach(function(a){ var x1=a[0]-cam, x2=a[2]-cam; if(x2<0||x1>W) return; var fl=.75+.25*Math.sin(tt*30); c.save(); c.globalAlpha=.25; c.fillStyle='#ff2b2b'; c.fillRect(x1,a[1]-6,x2-x1,a[3]-a[1]+12); c.globalAlpha=fl; c.fillStyle='#ff4d4d'; c.fillRect(x1,a[1]+4,x2-x1,a[3]-a[1]-8); c.fillStyle='#fff'; c.fillRect(x1,a[1]+7,x2-x1,a[3]-a[1]-14); c.globalAlpha=1; c.fillStyle='#0c0f16'; c.strokeStyle='#fff'; c.lineWidth=2; [x1-8,x2].forEach(function(ex){ c.beginPath(); c.rect(ex,a[1]-4,8,a[3]-a[1]+8); c.fill(); c.stroke(); }); c.restore(); });
  (L.bs||[]).forEach(function(p){ var x=p[0]*T-cam; if(x<-T||x>W) return; var on=((tt+p[1])%2)<1.1; c.fillStyle='#0c0f16'; c.strokeStyle=on?'#ff3b3b':'rgba(255,255,255,.35)'; c.lineWidth=2; c.beginPath(); if(on){ c.moveTo(x+3,GY); c.lineTo(x+T/2,GY-T+4); c.lineTo(x+T-3,GY); } else { c.moveTo(x+3,GY); c.lineTo(x+T/2,GY-7); c.lineTo(x+T-3,GY); } c.closePath(); c.fill(); c.stroke(); });
  (L.pus||[]).forEach(function(p,i){ if((s.pk||0)&(1<<i)) return; var x=(p[0]+p[2])/2-cam; if(x<-30||x>W+30) return; var y=(p[1]+p[3])/2+Math.sin(performance.now()/260+i)*3, col=['#2d9bff','#b36bff','#2fbf71'][p[4]]; c.save(); c.globalAlpha=.3; c.fillStyle=col; c.beginPath(); c.arc(x,y,20,0,6.283); c.fill(); c.globalAlpha=1; c.fillStyle=col; c.strokeStyle='#fff'; c.lineWidth=2; c.beginPath(); c.arc(x,y,13,0,6.283); c.fill(); c.stroke(); c.fillStyle='#fff'; c.font='bold 14px system-ui'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(['S','M','2'][p[4]],x,y+1); c.restore(); });
  /* finish line */
  var fx=L.end-cam; if(fx<W+10){ for(var k=0;k<10;k++){ c.fillStyle=k%2?'#fff':'#111'; c.fillRect(fx,GY-k*T-T+ (GY-10*T<0?0:0),20,T); } }
  if(Z.prac&&Z.cp){ var fx2=Z.cp.wx+PX-cam; if(fx2>-20&&fx2<W+20){ c.strokeStyle='#fff'; c.lineWidth=3; c.beginPath(); c.moveTo(fx2+S/2,Z.cp.y+S); c.lineTo(fx2+S/2,Z.cp.y-30); c.stroke(); c.fillStyle='#2fbf71'; c.beginPath(); c.moveTo(fx2+S/2,Z.cp.y-30); c.lineTo(fx2+S/2+22,Z.cp.y-22); c.lineTo(fx2+S/2,Z.cp.y-14); c.fill(); } }
  if(cam<1400&&Z.mode!=='edit'){ c.save(); c.textAlign='left'; c.textBaseline='middle'; c.font='800 38px system-ui'; c.shadowColor=lv.c2; c.shadowBlur=16; c.fillStyle='rgba(255,255,255,.92)'; c.fillText('Attempt '+(Z.att||1),300-cam,GY-190); c.font='700 20px system-ui'; c.fillStyle='rgba(255,255,255,.8)'; c.shadowBlur=10; c.fillText(String(lv.name||'')+(lv.tag?'  \u00b7  '+lv.tag:''),302-cam,GY-155); c.restore(); }
  fxGhosts(c,cam);
  /* trail + player */
  var LK=LOOKS[Math.min(sv().look||0,LOOKS.length-1)]; if((s.md|0)===4&&Z.trail.length>1){ c.save(); c.strokeStyle='#35e08a'; c.lineWidth=7; c.lineJoin='round'; c.globalAlpha=.85; c.beginPath(); Z.trail.forEach(function(t,ti){ var tx=t.x-cam+S/2, ty=t.y+S/2; if(ti) c.lineTo(tx,ty); else c.moveTo(tx,ty); }); c.lineTo(PX+S/2,s.y+S/2); c.stroke(); c.restore(); } else Z.trail.forEach(function(t,ti){ c.globalAlpha=Math.max(0,t.l*1.6); c.fillStyle=LK.c==='rb'?'hsl('+((ti*35+performance.now()/6)%360)+',90%,60%)':LK.c; c.fillRect(t.x-cam+4,t.y+S/2-3,S-8,6); }); c.globalAlpha=1;
  if(Z.gh&&!Z.gh.dead&&Z.mode==='play'){ c.save(); c.globalAlpha=.55; c.translate(PX+(Z.gh.s.wx-s.wx)+S/2,Z.gh.s.y+S/2); c.rotate(Z.gh.s.rot); c.strokeStyle='#fff'; c.lineWidth=2; c.setLineDash([6,5]); c.strokeRect(-S/2+1,-S/2+1,S-2,S-2); c.restore(); }
  var nw=performance.now(), fdt=Math.min(.05,(nw-(Z.vt||nw))/1000); Z.vt=nw; Z.fa=(Z.fa||.016)*.97+fdt*.03; if(Z.fa>.034&&(Z.fxq|0)>0&&Z.mode==='play'){ Z.fz=(Z.fz||0)+1; if(Z.fz>120){ Z.fxq=Math.max(0,fxQ()-1); Z.fz=0; Z.fa=.016; } } else Z.fz=0; if(Z.vr==null||Math.abs(s.rot-Z.vr)>7) Z.vr=s.rot; Z.vr+=(s.rot-Z.vr)*(1-Math.exp(-fdt*(s.g?34:70)));
  var sqz=fxS().sq; if(Z.mode!=='dead'&&Z.mode!=='edit'&&Math.abs(sqz)>.01&&(s.md|0)===0){ var fy=(s.gd||1)>0?s.y+S:s.y; c.save(); c.translate(PX+S/2,fy); c.scale(1-sqz*.8,1+sqz); c.translate(-(PX+S/2),-fy); Z._sq=1; } else Z._sq=0;
  if(Z.mode!=='dead'&&Z.mode!=='edit') { var vr=Z.mode==='play'||Z.mode==='ready'||Z.mode==='pause'?Z.vr:s.rot, lift=0; if((s.gd||1)>0){ var ex=(Math.abs(Math.cos(vr))+Math.abs(Math.sin(vr))-1)*S/2, nr=Math.max(0,Math.min(1,1-(GY-(s.y+S))/(S*.7))); lift=ex*nr; } if((s.md|0)===0) drawCube(c,PX,s.y-lift,vr,S); else drawMode(c,s,vr); }
  if(Z._sq){ c.restore(); Z._sq=0; }
  if(Z.mode!=='dead'&&Z.mode!=='edit'){ var px=PX+S/2, py=s.y+S/2; if(s.sh){ c.strokeStyle='#2d9bff'; c.fillStyle='rgba(45,155,255,.18)'; c.lineWidth=3; c.beginPath(); c.arc(px,py,34,0,6.283); c.fill(); c.stroke(); } if(s.inv>0&&Math.floor(s.inv*20)%2){ c.strokeStyle='#fff'; c.lineWidth=2; c.beginPath(); c.arc(px,py,34,0,6.283); c.stroke(); } if(s.lg>0){ c.strokeStyle='#b36bff'; c.lineWidth=2; c.setLineDash([4,5]); c.beginPath(); c.arc(px,py,30,0,6.283); c.stroke(); c.setLineDash([]); c.fillStyle='#b36bff'; c.font='bold 12px system-ui'; c.textAlign='left'; c.fillText('Low gravity '+Math.ceil(s.lg)+'s',12,34); } if(s.dj){ c.strokeStyle='#2fbf71'; c.lineWidth=2; c.beginPath(); c.ellipse(px,py+S/2+6,16,5,0,0,6.283); c.stroke(); } }
  Z.parts.forEach(function(p){ c.globalAlpha=Math.max(0,Math.min(1,p.l*1.6)); c.fillStyle=p.c; c.fillRect(p.x-cam-p.r/2,p.y-p.r/2,p.r,p.r); }); c.globalAlpha=1;
  if(Z.mode!=='edit') fxFront(c,cam,lv);
  if(Z.hint&&Z.hint.t>0&&Z.mode==='play'){ c.save(); c.globalAlpha=Math.min(1,Z.hint.t*2); c.fillStyle='rgba(0,0,0,.55)'; var hw=c.measureText?0:0; c.font='bold 16px system-ui'; var tw=c.measureText(Z.hint.x).width+30; rr(c,W/2-tw/2,52,tw,32,10); c.fill(); c.fillStyle='#fff'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(Z.hint.x,W/2,69); c.restore(); }
  if(Z.flash>0){ c.save(); c.globalAlpha=Math.min(.45,Z.flash); c.fillStyle=Z.fc||'#fff'; c.fillRect(0,0,W,H); c.restore(); }
  /* progress bar */
  if(Z.mode==='edit') return; if(L.cn&&L.cn.length){ for(var ci=0;ci<L.cn.length;ci++){ var got=(s.cn||0)&(1<<ci); c.save(); if(got){ c.shadowColor='#ffd34a'; c.shadowBlur=8; } c.fillStyle=got?'#ffd34a':'rgba(255,255,255,.16)'; c.strokeStyle=got?'#8a5a00':'rgba(255,255,255,.4)'; c.lineWidth=1.5; c.beginPath(); c.arc(18+ci*20,18,7,0,6.283); c.fill(); c.stroke(); c.restore(); } }
  var pg=pct(s)/100, bw2=400, ac2=lv.c2; c.fillStyle='rgba(6,8,16,.62)'; rr(c,197,7,bw2+6,16,8); c.fill(); c.strokeStyle='rgba(255,255,255,.28)'; c.lineWidth=1.2; c.stroke();
  var pgd=c.createLinearGradient(200,0,600,0); pgd.addColorStop(0,ac2); pgd.addColorStop(1,'#ffffff'); c.save(); c.shadowColor=ac2; c.shadowBlur=10; c.fillStyle=pgd; rr(c,200,10,Math.max(10,bw2*pg),10,5); c.fill(); c.restore(); c.fillStyle='rgba(255,255,255,.35)'; rr(c,203,11.5,Math.max(4,bw2*pg-6),3,2); c.fill();
  var bb=(sv().best[Z.lv&&Z.lv.id]||0); if(!Z.prac&&bb>0&&bb<100){ var bxx=200+bw2*bb/100; c.fillStyle='#ffd500'; c.beginPath(); c.moveTo(bxx,6); c.lineTo(bxx+4,2); c.lineTo(bxx-4,2); c.closePath(); c.fill(); c.fillRect(bxx-1,6,2,16); }
  c.fillStyle='rgba(255,255,255,.9)'; c.font='bold 11px system-ui'; c.textAlign='left'; c.textBaseline='middle'; c.fillText(Math.round(pg*100)+'%',bw2+212,15); }

/* ---------- level maker ---------- */
var EDT=[['s','▲ Spike'],['d','▼ Hanging spike'],['b','■ Block'],['f','▣ Fake block'],['i','▢ Invisible block'],['p','▬ Pad'],['o','◎ Orb'],['t','▭ Pit'],['q0','↓ Gravity down'],['q1','↑ Gravity up'],['q2','« Slow'],['q3','» Fast'],['q4','• Normal speed'],['w','⇢ Teleport'],['W','◍ Floating saw'],['R','◍ Rolling saw'],['P','▮ Pulse block'],['u0','◇ Shield'],['u1','◇ Low gravity'],['u2','◇ Double jump'],['z','━ Laser (2 taps)'],['G11','Ship portal'],['G12','Ball portal'],['G13','UFO portal'],['G14','Wave portal'],['G15','Robot portal'],['G16','Spider portal'],['G10','Cube portal'],['G20','Pink orb'],['G21','Red orb'],['G22','Blue orb'],['G23','Green orb'],['G24','Black orb'],['G30','Pink pad'],['G31','Red pad'],['G32','Blue pad'],['G40','Coin (max 3)'],['x','✕ Erase']];
function edTools(){ var a=!!(PL.updOn&&PL.updOn()), b=!!(PL.updOn2&&PL.updOn2()); return EDT.filter(function(t){ return /^[WRPu]/.test(t[0])?a:(t[0]==='z'||t[0]==='G')?b:true; }); }
var ARR={s:'sp_',d:'sd',b:'bl',f:'fb',i:'ib',p:'pd',o:'or'}, ALLK=['sp_','sd','bl','fb','ib','pd','or'];
function edit(el,e0){ stopLoop(); Z.root=el; Z.ce=null; window.scrollTo(0,0);
  var E=Z.edit&&!e0?Z.edit:null;
  if(!E){ E={sp:1,th:0,len:80,sp_:[],bl:[],pd:[],pit:[],sd:[],or:[],fb:[],ib:[],po:[],tp:[],ws:[],rr:[],pl:[],up:[],lz:[],gx:[],tool:'s',cam:0,ok:'',busy:false,name:'',sid:'',undo:[],redo:[]}; if(e0){ ['sp','th','len','sp_','bl','pd','pit','sd','or','fb','ib','po','tp','ws','rr','pl','up','lz','gx'].forEach(function(k){ E[k]=e0[k]||(Array.isArray(E[k])?[]:E[k]); }); E.name=e0.name||''; E.sid=e0.sid||''; E.ok=e0.ok||''; } }
  E.key=function(){ return D.toCode(E); }; Z.edit=E;
  el.innerHTML='<div class="wrap"><div class="crumbs"><button class="btn sm" id="edBack" type="button">← Levels</button><h1>Level maker</h1></div>'
    +'<div class="ds-stage"><canvas id="dsCv" aria-label="Level editor"></canvas></div>'
    +'<input type="range" id="edCam" min="0" max="'+Math.max(0,E.len-20)+'" value="'+E.cam+'" style="width:100%;margin-top:8px" aria-label="Scroll the level">'
    +'<div class="seg ed-tools" id="edT" style="margin-top:8px">'+edTools().map(function(t){ return '<button type="button" data-t="'+t[0]+'" aria-pressed="'+(E.tool===t[0])+'">'+t[1]+'</button>'; }).join('')+'</div>'
    +'<div class="row" style="gap:8px;margin-top:8px"><button class="btn sm" id="edUn" type="button">↶ Undo</button><button class="btn sm" id="edRe" type="button">↷ Redo</button></div>'
    +'<div class="pnl" style="margin-top:12px"><div class="row" style="gap:12px;flex-wrap:wrap"><label class="row" style="gap:6px">Length <select id="edLen" class="in" style="width:auto">'+[40,60,80,120,160,240,320].map(function(n){ return '<option value="'+n+'"'+(E.len===n?' selected':'')+'>'+n+' tiles</option>'; }).join('')+'</select></label>'
    +'<label class="row" style="gap:6px">Speed <select id="edSp" class="in" style="width:auto">'+['Slow','Normal','Fast'].map(function(n,i){ return '<option value="'+i+'"'+(E.sp===i?' selected':'')+'>'+n+'</option>'; }).join('')+'</select></label>'
    +'<label class="row" style="gap:6px">Colours <select id="edTh" class="in" style="width:auto">'+['Blue','Purple','Orange','Green'].map(function(n,i){ return '<option value="'+i+'"'+(E.th===i?' selected':'')+'>'+n+'</option>'; }).join('')+'</select></label>'
    +'<button class="btn sm" id="edClr" type="button">Clear all</button></div>'
    +'<div class="row" style="gap:10px;flex-wrap:wrap;margin-top:12px"><input class="in" id="edName" maxlength="30" placeholder="Name your level" value="'+esc(E.name||'')+'" style="flex:1;min-width:150px"><button class="btn" id="edSave" type="button">💾 Save</button></div>'
    +'<div class="row" style="gap:10px;flex-wrap:wrap;margin-top:10px"><button class="btn" id="edTest" type="button">▶ Test it</button><button class="btn pri" id="edShare" type="button">Check &amp; share</button></div>'
    +'<div class="row" style="gap:10px;flex-wrap:wrap;margin-top:10px"><input class="in mono" id="edImp" placeholder="Paste a level code or link to load it here" style="flex:1;min-width:180px"><button class="btn sm" id="edLoad" type="button">Load</button></div><p class="muted" id="edMsg" style="font-size:14px;margin-top:10px;min-height:20px;word-break:break-all"></p></div>'
    +'<p class="muted" style="font-size:13px;text-align:center;margin-top:8px">Tap the grid to place the chosen piece. Tap the same piece again to remove it. Tap the ground to dig a pit. Portals are 3 tiles tall: gravity portals flip you to the ceiling and back, speed portals change your speed. Teleports: tap the orange entrance, then the blue exit. Saws and pulse blocks go on the ground at the tile you tap. Power-ups: shield survives one hit, low gravity floats you, double jump lets you jump off walls. Lasers: tap the start then the end; stay on the ground to pass under, jumping into one is deadly. Fake blocks can be walked through, invisible blocks are solid but hidden. Game modes: a portal switches you to the ship (hold to rise), ball (tap to flip gravity), UFO (tap to hop), wave (hold to go up, let go to go down), robot (hold for a higher jump) or spider (tap to jump to the other side); the cube portal switches you back. Extra orbs and pads: pink is a small boost, red a big boost, blue flips gravity, green flips and boosts, black slams you down. Coins are optional. The first 10 tiles are kept clear.</p></div>';
  Z.cv=$('#dsCv'); fit(); Z.mode='edit'; Z.cx=Z.cv.getContext('2d');
  function rebuild(){ Z.lv=null; var L=D.mkCustom(E); Z.L=L; Z.lv=L.lv; Z.s={wx:E.cam*T,y:GY-S,vy:0,rot:0}; E.ok=E.ok===E.key()?E.ok:''; drawEd(E); }
  function say(t){ $('#edMsg').textContent=t||''; }
  var KS=['sp_','bl','pd','pit','sd','or','fb','ib','po','tp','ws','rr','pl','up','lz','gx'];
  function snap(){ return JSON.stringify(KS.map(function(k){ return E[k]; })); }
  function restore(j){ JSON.parse(j).forEach(function(a,i){ E[KS[i]]=a; }); KS.forEach(function(k){ if(!E[k]) E[k]=[]; }); }
  function chg(){ E.undo.push(E._pre||snap()); if(E.undo.length>60) E.undo.shift(); E.redo=[]; E.ok=''; rebuild(); draftPut(E); E._pre=snap(); }
  E._pre=snap();
  rebuild();
  $('#edBack').onclick=function(){ draftPut(E); Z.edit=null; Z.mode='off'; menu(el); };
  $('#edUn').onclick=function(){ if(!E.undo.length) return; E.redo.push(snap()); restore(E.undo.pop()); E.ok=''; E._pre=snap(); rebuild(); draftPut(E); };
  $('#edRe').onclick=function(){ if(!E.redo.length) return; E.undo.push(snap()); restore(E.redo.pop()); E.ok=''; E._pre=snap(); rebuild(); draftPut(E); };
  $('#edName').oninput=function(){ E.name=this.value; draftPut(E); };
  $('#edSave').onclick=function(){ if(!nPieces(E)){ say('Add a few pieces first.'); return; }
    var name=(E.name||'').trim()||('Level '+(myAll().length+1)); E.name=name; $('#edName').value=name; var L=myAll(), key=E.key(), now=Date.now(), m=E.sid&&L.filter(function(x){ return x.id===E.sid; })[0];
    if(m){ m.n=name; m.c=key; m.ok=E.ok===key; m.t=now; } else { if(L.length>=60){ say('You can keep up to 60 levels. Delete one first.'); return; } E.sid='l'+now.toString(36); L.unshift({id:E.sid,n:name,c:key,ok:E.ok===key,t:now}); }
    myPut(L); draftPut(E); CW.toast('Saved "'+name+'".'); say('Saved ✓ Find it under My levels.'); };
  $('#edLoad').onclick=function(){ var e=D.fromCode($('#edImp').value); if(!e){ say('That code is not a valid level.'); return; } if(nPieces(E)&&!confirm('Replace what you have now with this level?')) return; e.name=E.name; e.sid=''; Z.edit=null; edit(el,e); };
  $('#edCam').oninput=function(){ E.cam=+this.value; rebuild(); };
  $('#edT').onclick=function(e){ var b=e.target.closest('[data-t]'); if(!b) return; E.tool=b.getAttribute('data-t'); [].forEach.call(this.children,function(c){ c.setAttribute('aria-pressed',c===b); }); };
  $('#edLen').onchange=function(){ E.len=+this.value; ['sp_','bl','pd','sd','or','fb','ib','po','ws','rr','pl','up','gx'].forEach(function(k){ E[k]=(E[k]||[]).filter(function(o){ return o[0]<E.len; }); }); E.lz=(E.lz||[]).filter(function(o){ return o[1]<E.len; }); E.tp=E.tp.filter(function(o){ return o[2]<E.len; }); E.tpPend=null; E.pit=E.pit.filter(function(o){ return o[0]<E.len; }); E.cam=Math.min(E.cam,Math.max(0,E.len-20)); edit(el,null); };
  $('#edSp').onchange=function(){ E.sp=+this.value; chg(); }; $('#edTh').onchange=function(){ E.th=+this.value; chg(); };
  $('#edClr').onclick=function(){ if(nPieces(E)&&!confirm('Remove everything?')) return; E.sp_=[];E.bl=[];E.pd=[];E.pit=[];E.sd=[];E.or=[];E.fb=[];E.ib=[];E.po=[];E.tp=[];E.ws=[];E.rr=[];E.pl=[];E.up=[];E.lz=[];E.gx=[];E.tpPend=null;E.lzPend=null; chg(); say(''); };
  Z.cv.addEventListener('pointerdown',function(e){ e.preventDefault(); var r=Z.cv.getBoundingClientRect(), x=(e.clientX-r.left)/r.width*W, y=(e.clientY-r.top)/r.height*H, col=Math.floor((x+E.cam*T)/T), row=Math.floor((GY-y)/T);
    if(col<10||col>=E.len) { say('Build between tile 10 and the end.'); return; }
    var tool=E.tool, same=function(a){ return a[0]===col&&a[1]===row; };
    if(tool==='x'){ ['ws','rr','pl'].forEach(function(k){ E[k]=E[k].filter(function(o){ return o[0]!==col; }); }); E.up=E.up.filter(function(o){ return !same(o); }); E.gx=E.gx.filter(function(o){ return o[2]<20?!(o[0]===col&&row>=o[1]&&row<=o[1]+2):!same(o); }); E.lz=E.lz.filter(function(o){ return !(col>=o[0]&&col<=o[1]); }); ALLK.forEach(function(k){ E[k]=E[k].filter(function(o){ return !same(o); }); }); E.po=E.po.filter(function(o){ return !(o[0]===col&&row>=o[1]&&row<=o[1]+2); }); E.tp=E.tp.filter(function(o){ return !((o[0]===col&&row>=o[1]&&row<=o[1]+2)||(o[2]===col&&row>=o[3]&&row<=o[3]+2)); }); if(row<0) E.pit=E.pit.filter(function(p){ return p[0]!==col; }); chg(); return; }
    if(tool==='t'){ if(col<12){ say('Pits start from tile 12.'); return; } var i=E.pit.findIndex(function(p){ return p[0]===col; }); if(i>=0) E.pit.splice(i,1); else if(E.pit.length<200) E.pit.push([col,col+1]); chg(); return; }
    var total=ALLK.reduce(function(n,k){ return n+E[k].length; },0)+E.po.length+E.tp.length+E.ws.length+E.rr.length+E.pl.length+E.up.length+E.lz.length+E.gx.length;
    var onePer={W:'ws',R:'rr',P:'pl'};
    if(onePer[tool]){ var ak=onePer[tool], ai=E[ak].findIndex(function(o){ return o[0]===col; }); if(ai>=0) E[ak].splice(ai,1); else { if(total>=800){ say('That is the most pieces a level can hold.'); return; } E[ak].push([col,0]); } chg(); return; }
    if(tool[0]==='G'){ var gk=+tool.slice(1), md0=gk<20; if(row<0||row>(md0?4:6)){ say(md0?'Place portals on rows 0 to 4 (they are 3 tiles tall).':'Place it on rows 0 to 6.'); return; }
      var gi=E.gx.findIndex(function(o){ return o[2]<20?(gk<20&&o[0]===col&&row>=o[1]&&row<=o[1]+2):(gk>=20&&same(o)); });
      if(gi>=0){ var same2=E.gx[gi][2]===gk&&E.gx[gi][0]===col&&E.gx[gi][1]===row; E.gx.splice(gi,1); if(same2){ chg(); return; } }
      else if(total>=800){ say('That is the most pieces a level can hold.'); return; }
      if(gk===40&&E.gx.filter(function(o){ return o[2]===40; }).length>=3){ say('A level can have 3 coins.'); return; }
      E.gx.push([col,row,gk]); if(gk===10) say('Cube portal: switches you back to the cube.'); chg(); return; }
    if(tool[0]==='u'){ if(row<0||row>6) return; var ut=+tool.slice(1), ui=E.up.findIndex(same); if(ui>=0&&E.up[ui][2]===ut) E.up.splice(ui,1); else { if(ui>=0) E.up.splice(ui,1); else if(total>=800){ say('That is the most pieces a level can hold.'); return; } E.up.push([col,row,ut]); } chg(); return; }
    if(tool==='z'){ var li=E.lz.findIndex(function(o){ return col>=o[0]&&col<=o[1]; }); if(li>=0){ E.lz.splice(li,1); E.lzPend=null; say('Laser removed.'); chg(); return; }
      if(E.lzPend==null){ E.lzPend=col; say('Now tap where the laser should end (2 to 20 tiles long).'); drawEd(E); return; }
      if(col<=E.lzPend||col-E.lzPend>20){ say('The laser must end 1 to 20 tiles after where it starts.'); return; }
      if(total>=800){ say('That is the most pieces a level can hold.'); return; }
      E.lz.push([E.lzPend,col]); E.lzPend=null; say('Laser placed. Stay on the ground to pass under it. Jumping into it is deadly.'); chg(); return; }
    if(tool==='w'){ if(row<0||row>4){ say('Place teleports on rows 0 to 4 (they are 3 tiles tall).'); return; }
      var hit=E.tp.findIndex(function(o){ return (o[0]===col&&row>=o[1]&&row<=o[1]+2)||(o[2]===col&&row>=o[3]&&row<=o[3]+2); });
      if(hit>=0){ E.tp.splice(hit,1); E.tpPend=null; say('Teleport removed.'); chg(); return; }
      if(!E.tpPend){ E.tpPend=[col,row]; say('Now tap where the teleport should send you (the blue exit).'); drawEd(E); return; }
      if(col<=E.tpPend[0]+1){ say('The exit must be at least 2 tiles after the entrance.'); return; }
      if(total>=800){ say('That is the most pieces a level can hold.'); return; }
      E.tp.push([E.tpPend[0],E.tpPend[1],col,row]); E.tpPend=null; say('Teleport placed: orange in, blue out.'); chg(); return; }
    if(tool[0]==='q'){ if(row<0||row>4){ say('Place portals on rows 0 to 4 (they are 3 tiles tall).'); return; } var ty=+tool.slice(1), pi=E.po.findIndex(function(o){ return o[0]===col&&o[1]===row; });
      if(pi>=0&&E.po[pi][2]===ty) E.po.splice(pi,1); else { if(pi>=0) E.po.splice(pi,1); else if(total>=800){ say('That is the most pieces a level can hold.'); return; } E.po.push([col,row,ty]); } chg(); return; }
    if(row<0||row>6) return;
    var k=ARR[tool], arr=E[k], j=arr.findIndex(same);
    if(j>=0) arr.splice(j,1); else { if(total>=800){ say('That is the most pieces a level can hold.'); return; } ALLK.forEach(function(q){ if(q!==k) E[q]=E[q].filter(function(o){ return !same(o); }); }); arr.push([col,row]); }
    chg(); });
  $('#edTest').onclick=function(){ if(!nPieces(E)){ say('Add a few pieces first.'); return; } Z.edit=E; startLevel(el,null,D.mkCustom(E),function(){ edit(el,null); },E); };
  $('#edShare').onclick=function(){ if(E.busy) return; if(!E.sp_.length&&!E.bl.length&&!E.pit.length&&!E.sd.length&&!E.ws.length&&!E.rr.length&&!E.pl.length&&!E.lz.length&&!E.gx.length){ say('Add some obstacles first.'); return; }
    var key=E.key(); function done(){ var code=key, link=location.origin+'/play/#dash/'+code; say('Checked ✓ Your level code: '+code); if(navigator.clipboard) navigator.clipboard.writeText(link).then(function(){ CW.toast('Level link copied.'); },function(){}); }
    if(E.ok===key){ done(); return; } E.busy=true; say('Checking that the level can be finished… 0%');
    D.verify(D.mkCustom(E),function(ok){ E.busy=false; if(!$('#edMsg')) return; if(ok){ E.ok=key; done(); if(E.sid){ var LL=myAll(), mm=LL.filter(function(x){ return x.id===E.sid; })[0]; if(mm&&mm.c===key){ mm.ok=true; myPut(LL); } } } else say('The checker could not find a way to finish this level. Try wider gaps, fewer spikes in a row, or test it yourself with the Test button.'); },function(p){ if($('#edMsg')&&E.busy) say('Checking that the level can be finished… '+p+'%'); }); };
}
function drawEd(E){ var c=Z.cx; if(!c) return; draw(); c.setTransform(Z.sc,0,0,Z.sc,0,0); var cam=E.cam*T;
  c.strokeStyle='rgba(255,255,255,.14)'; c.lineWidth=1; for(var i=0;i<=21;i++){ var x=i*T-(cam%T); c.beginPath(); c.moveTo(x,0); c.lineTo(x,H); c.stroke(); } for(var j=0;j<8;j++){ var y=GY-j*T; c.beginPath(); c.moveTo(0,y); c.lineTo(W,y); c.stroke(); }
  c.fillStyle='rgba(255,255,255,.7)'; c.font='12px monospace'; for(var k=0;k<21;k++){ var tile=Math.floor(cam/T)+k; if(tile%5===0) c.fillText(tile,k*T-(cam%T)+3,GY+16); }
  if(cam<10*T){ c.fillStyle='rgba(0,0,0,.35)'; c.fillRect(-cam,0,10*T,GY); c.fillStyle='#fff'; c.font='bold 14px sans-serif'; c.fillText('START (kept clear)',-cam+12,60); }
  if(E.tpPend){ var px0=E.tpPend[0]*T-cam; c.save(); c.strokeStyle='#ff7a1a'; c.setLineDash([6,4]); c.lineWidth=3; c.strokeRect(px0+8,GY-(E.tpPend[1]+3)*T,24,3*T); c.restore(); }
  if(E.lzPend!=null){ c.save(); c.strokeStyle='#ff3b3b'; c.setLineDash([6,4]); c.lineWidth=3; c.strokeRect(E.lzPend*T-cam+2,GY-110,T-4,40); c.restore(); }
  var ex=E.len*T-cam; if(ex<W+10){ c.fillStyle='#fff'; c.fillRect(ex,0,4,GY); c.fillText('END',ex+8,60); } }
PL.views.dash={show:function(el,h){ if(h==='dash/day'){ history.replaceState(null,'','#dash'); ac(); menu(el); var di=PL.dashDayIx(); var dl=D.LEVELS[di]; startLevel(el,dl,D.build(dl),function(){ menu(el); }); Z.day=1; return; } var ma=/^dash\/(AI\.[A-Za-z0-9_-]+)$/.exec(h||''); if(ma){ var ao=aiFrom(ma[1]); history.replaceState(null,'','#dash'); if(ao){ ac(); menu(el); startLevel(el,aiMake(ao),D.build(ao),function(){ menu(el); }); return; } } var m=/^dash\/([A-Za-z0-9_-]{8,})$/.exec(h||''); if(m){ var e=D.fromCode(m[1]); history.replaceState(null,'','#dash'); if(e){ ac(); menu(el); playCustom(el,e); return; } } menu(el); },leave:function(){ stopLoop(); Z.edit=null; }};
})();
