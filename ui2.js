/* floating buttons tuck away while you scroll down and come back when you scroll up */
(function(){var f=null,y=window.scrollY,t=0;function go(){f=f||document.querySelector('.fab');if(!f)return;var n=window.scrollY,d=n-y;if(Math.abs(d)<6)return;f.classList.toggle('fab-hide',d>0&&n>120);y=n;}
window.addEventListener('scroll',function(){if(t)return;t=requestAnimationFrame(function(){t=0;go();});},{passive:true});})();
