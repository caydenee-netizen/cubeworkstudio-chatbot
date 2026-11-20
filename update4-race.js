/* Update 4 racing: 3 new car models (Dragster, Monster Truck, Retro Roadster), 3 more paints and 6 more trails. */
(function(){
PL.onUpd4(function(){
  (function addRace(n){ var E=window.CWRaceEngine; if(!E||E.CARDEF.length<29||E.TRAILDEF.length<26){ if(n<120) setTimeout(function(){ addRace(n+1); },250); return; }
  if(E.CARDEF.length<=29){ [
    {n:'Dragster',cost:2000,model:13,sw:['#f2342a','#1f1f24','#9aa0aa','#f4f4f8','#f2342a','#1f1f24']},
    {n:'Monster Truck',cost:2200,model:14,sw:['#33c74d','#124d1f','#ffe58a','#f4f6f8','#33c74d','#124d1f']},
    {n:'Retro Roadster',cost:1800,model:15,sw:['#fbc74d','#8c4d14','#f4f4f8','#9aa0aa','#fbc74d','#8c4d14']},
    {n:'Lagoon',cost:1100,pal:['#8fe3ff','#1f8ec9','#0b3d6b','#f4f6f8','#1f8ec9','#0b3d6b']},
    {n:'Blossom',cost:1200,pal:['#ffd1e3','#ff7aa8','#a8305f','#fff4f8','#ff7aa8','#ffd1e3']},
    {n:'Graphite',cost:1200,pal:['#6b7280','#2b2f38','#11141a','#c5cad3','#2b2f38','#6b7280']}
  ].forEach(function(c){ E.CARDEF.push(c); }); }
  if(E.TRAILDEF.length<=26){ [
    {n:'Aurora',cost:1300,c:['120,255,190','150,150,255'],ic:'≋'},
    {n:'Lava',cost:1100,c:['255,150,40','220,40,20'],ic:'●'},
    {n:'Bubbles',cost:900,c:['190,235,255','120,200,255'],ic:'○'},
    {n:'Petals',cost:1000,c:['255,200,225','255,150,190'],ic:'✿'},
    {n:'Lightning',cost:1400,c:['255,255,170','150,190,255'],ic:'⚡'},
    {n:'Rainbow',cost:1800,c:['255,120,120','120,160,255'],ic:'★',star:1}
  ].forEach(function(t){ E.TRAILDEF.push(t); }); }
  try{ if(/^#(garage|race)/.test(location.hash)) window.dispatchEvent(new HashChangeEvent('hashchange')); }catch(e){}
  })(0);
});
})();
