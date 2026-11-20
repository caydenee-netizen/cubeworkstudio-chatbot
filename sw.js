/* Cubeworkstudio app: shows notifications sent by the server and opens the site when one is tapped. Pages and scripts are fetched fresh when online (so the site is always the newest version) and kept as a copy, so Cuber Tools opens offline. */
self.addEventListener('install',function(){ self.skipWaiting(); });
var OFF='cw-offline-v1';
self.addEventListener('activate',function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch',function(e){ var q=e.request; if(q.method!=='GET') return; var u; try{ u=new URL(q.url); }catch(x){ return; } if(u.origin!==self.location.origin||u.pathname.indexOf('/api/')===0) return;
  if(!(q.mode==='navigate'||/\.(js|css|json|webmanifest|png|svg|ico)$/.test(u.pathname)||u.pathname==='/play'||u.pathname==='/play/')) return;
  e.respondWith(fetch(q).then(function(r){ if(r&&r.ok&&r.type==='basic'){ var c=r.clone(); caches.open(OFF).then(function(k){ k.put(q,c); }).catch(function(){}); } return r; }).catch(function(){ return caches.match(q,{ignoreSearch:false}).then(function(m){ return m||caches.match(q,{ignoreSearch:true}).then(function(m2){ return m2||(q.mode==='navigate'?caches.match('/play/')||caches.match('/play'):undefined)||Response.error(); }); }); })); });
self.addEventListener('push',function(e){
  var d={}; try{ d=e.data?e.data.json():{}; }catch(x){ d={t:'Cubeworkstudio',b:e.data?e.data.text():''}; }
  e.waitUntil(self.registration.showNotification(d.t||'Cubeworkstudio',{body:d.b||'',icon:'/icon-192.png',badge:'/favicon.png',tag:d.tag||undefined,data:{u:d.u||'/'}})); });
self.addEventListener('notificationclick',function(e){ e.notification.close(); var u=(e.notification.data&&e.notification.data.u)||'/';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(l){
    for(var i=0;i<l.length;i++){ if('focus' in l[i]){ try{ l[i].navigate(u); }catch(x){} return l[i].focus(); } }
    return self.clients.openWindow(u); })); });
