/* Update 3 racing: 3 new car models (Rocket, Hover Disc, Delivery Van), 3 more paints and 6 more trails. */
(function(){
PL.onUpd3(function(){
  (function addRace(n){ var E=window.CWRaceEngine; if(!E||E.CARDEF.length<23||E.TRAILDEF.length<20){ if(n<80) setTimeout(function(){ addRace(n+1); },250); return; }
  if(E.CARDEF.length<=23){ [
    {n:'Rocket',cost:1600,model:10,sw:['#f4f4f8','#e6332e','#ff9a26','#9aa0aa','#e6332e','#f4f4f8']},
    {n:'Hover Disc',cost:1800,model:11,sw:['#34e6d9','#0f3348','#7ff5ee','#f4f6f8','#34e6d9','#0f3348']},
    {n:'Delivery Van',cost:1400,model:12,sw:['#ffd138','#2e3342','#ffe58a','#f4f6f8','#ffd138','#2e3342']},
    {n:'Mint',cost:1000,pal:['#9ff0c8','#2fb98a','#0f6a4d','#f4f6f8','#2fb98a','#0f6a4d']},
    {n:'Midnight',cost:1200,pal:['#1b2250','#0a0f2c','#4b5cc9','#c5cad3','#0a0f2c','#1b2250']},
    {n:'Sunburst',cost:1200,pal:['#ffcf3f','#ff6a1f','#c71f1f','#fff4c9','#ff6a1f','#ffcf3f']}
  ].forEach(function(c){ E.CARDEF.push(c); }); }
  if(E.TRAILDEF.length<=20){ [
    {n:'Comet',cost:1000,c:['200,230,255','110,170,255'],ic:'☄'},
    {n:'Sakura',cost:900,c:['255,190,215','255,140,185'],ic:'✿'},
    {n:'Toxic',cost:900,c:['170,255,60','70,170,20'],ic:'●'},
    {n:'Ice shards',cost:1000,c:['215,245,255','150,215,245'],ic:'◆'},
    {n:'Neon',cost:1100,c:['255,60,220','60,230,255'],ic:'●'},
    {n:'Gold stars',cost:1500,c:['255,220,90','255,245,190'],ic:'★',star:1}
  ].forEach(function(t){ E.TRAILDEF.push(t); }); }
  try{ if(/^#(garage|race)/.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange')); }catch(e){}
  })(0);
});
})();
