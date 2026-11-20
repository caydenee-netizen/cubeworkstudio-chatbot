/* Cuber Tools home: a search box over the tool cards, and a star on each card to pin favourites to the front. */
(function(){
'use strict';
if(typeof CW==='undefined'||!window.PL||!PL.views||!PL.views.home) return;
function favs(){ var a=CW.lsJ('cw_favs',[]); return Array.isArray(a)?a:[]; }
function decorate(el){ var cards=el.querySelectorAll('a.tool'); if(!cards.length||el.querySelector('#h2Q')) return; var box=cards[0].parentNode, f=favs();
  var bar=document.createElement('div'); bar.className='h2-bar'; bar.innerHTML='<input class="inp" id="h2Q" type="search" placeholder="Search Cuber Tools" aria-label="Search Cuber Tools" autocomplete="off"><span class="muted" id="h2N"></span>'; box.parentNode.insertBefore(bar,box);
  Array.prototype.forEach.call(cards,function(c){ var id=(c.getAttribute('href')||'').slice(1), on=f.indexOf(id)>=0, s=document.createElement('button'); s.type='button'; s.className='h2-star'+(on?' on':''); s.setAttribute('aria-label',on?'Remove from favourites':'Add to favourites'); s.setAttribute('aria-pressed',String(on)); s.textContent=on?'★':'☆'; if(getComputedStyle(c).position==='static') c.style.position='relative'; c.style.order=on?'-1':''; c.appendChild(s);
    s.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); var l=favs(), i=l.indexOf(id); if(i>=0) l.splice(i,1); else l.push(id); CW.setJ('cw_favs',l); var now=i<0; s.classList.toggle('on',now); s.textContent=now?'★':'☆'; s.setAttribute('aria-pressed',String(now)); s.setAttribute('aria-label',now?'Remove from favourites':'Add to favourites'); c.style.order=now?'-1':''; }); });
  var q=bar.querySelector('#h2Q'), n=bar.querySelector('#h2N'); q.addEventListener('input',function(){ var v=q.value.trim().toLowerCase(), shown=0; Array.prototype.forEach.call(cards,function(c){ var hit=!v||c.textContent.toLowerCase().indexOf(v)>=0; c.style.display=hit?'':'none'; if(hit) shown++; }); n.textContent=v?(shown?shown+' found':'Nothing matches'):''; }); }
var s0=PL.views.home.show; PL.views.home.show=function(el){ var r=s0.apply(this,arguments); try{ decorate(el); }catch(e){} return r; };
})();
