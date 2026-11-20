/* Animated layer for every pad skin that has no hand-made animation: ten motion styles, tinted from each skin's own colours. */
(function(){
var CUSTOM={40:1,41:1,42:1,47:1,48:1,49:1,50:1,63:1,64:1,65:1,66:1,67:1,68:1,69:1};
window.PL=window.PL||{};
PL.genFx=function(pad,i,fx){
  if(CUSTOM[i]) return false;
  var A=window.CW_PADART&&CW_PADART.art&&CW_PADART.art[i], a=(A&&A.ink)||'#ffffff', b=(A&&A.glow)||'rgba(140,200,255,.7)';
  pad.removeAttribute('data-sk'); pad.setAttribute('data-gv',i%10); pad.style.setProperty('--ska',a); pad.style.setProperty('--skb',b);
  if(!fx||fx.getAttribute('data-g')!=='1'){ if(fx) fx.remove(); fx=document.createElement('div'); fx.className='skfx skg'; fx.setAttribute('data-g','1'); fx.innerHTML='<i></i><i></i><i></i>'; pad.insertBefore(fx,pad.firstChild); }
  return true; };
})();
