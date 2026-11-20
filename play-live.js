/* Watch The Cubing Zone's live stream on the site: the stream takes the right half of the screen, the site shrinks to the left half, and Close brings the normal layout back. */
(function(){
var $=function(s,r){ return (r||document).querySelector(s); };
function embed(u){ try{ var x=new URL(u), h=x.hostname.replace(/^(www|m)\./,''), id='';
  if(h==='youtu.be') id=x.pathname.slice(1).split('/')[0];
  else if(h==='youtube.com'||h.endsWith('.youtube.com')){ if(x.pathname==='/watch') id=x.searchParams.get('v')||''; else { var m=/^\/(live|embed|shorts)\/([\w-]{6,})/.exec(x.pathname); if(m) id=m[2]; } }
  if(id&&/^[\w-]{6,}$/.test(id)) return 'https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0';
  if(h==='twitch.tv'){ var c=x.pathname.split('/')[1]; if(c&&/^\w+$/.test(c)) return 'https://player.twitch.tv/?channel='+c+'&parent='+location.hostname+'&autoplay=true'; }
 }catch(e){} return ''; }
function close(){ var p=$('#czLive'); if(p) p.remove(); document.documentElement.classList.remove('cz-split'); window.dispatchEvent(new Event('resize')); }
function open(u){ var src=embed(u); if(!src) return; close(); var m=/youtube\.com\/embed\/([\w-]+)/.exec(src);
  var p=document.createElement('aside'); p.id='czLive'; p.setAttribute('aria-label','Live stream');
  p.innerHTML='<div class="czl-h"><span>🔴 Live now</span><span class="czl-a"><a href="'+u.replace(/"/g,'&quot;')+'" target="_blank" rel="noopener">Open</a><button type="button" id="czlX" aria-label="Close the stream">✕ Close</button></span></div><div class="czl-v"><iframe src="'+src+'" title="Live stream" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>'+(m?'<div class="czl-c"><iframe src="https://www.youtube.com/live_chat?v='+m[1]+'&embed_domain='+location.hostname+'" title="Live chat"></iframe></div>':'');
  document.body.appendChild(p); document.documentElement.classList.add('cz-split'); $('#czlX',p).onclick=close; window.dispatchEvent(new Event('resize')); }
window.CWLive={embed:embed,open:open,close:close};
document.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('[data-live-watch]'); if(!b) return; e.preventDefault(); var L=window.PL&&PL.live&&PL.live.livex; if(!L&&window.LV) L=LV.livex; var u=L&&L.u; if(u) open(u); });
/* when the stream ends, the screen goes back to normal by itself */
setInterval(function(){ if(!$('#czLive')) return; var L=window.PL&&PL.live&&PL.live.livex; if(PL&&PL.live&&PL.live.livex===null) close(); },5000);
})();
